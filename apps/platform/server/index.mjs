import http from "node:http";
import { handleGithubApiRequest, isGithubApiRequestPath } from "./integrations/github-oauth.mjs";
import { handleJiraApiRequest, isJiraApiRequestPath } from "./integrations/jira-oauth.mjs";
import {
  handleGenericConnectorApiRequest,
  isGenericConnectorApiRequestPath,
} from "./integrations/generic-connector-oauth.mjs";
import {
  matchPlaygroundBillingProxyRoute,
} from "../shared/billing/playground-billing-catalog.mjs";
import {
  matchThreadProxyRoute,
  shouldRetryUpstreamWithAiosSession,
  wantsThreadEventStream,
} from "./routes/thread-proxy-contract.mjs";
import { createPlatformDocumentAssets } from "./platform-assets.mjs";
import { createPlatformDevelopmentAssets } from "./platform-development-assets.mjs";
import { createStaticAssetService } from "./static-assets.mjs";
import { createVncWebSocketProxy } from "./vnc-websocket-proxy.mjs";
import { createPlatformRequestHandler } from "./request-handler.mjs";
import { createPlatformGateway } from "./gateway/create-platform-gateway.mjs";
import { createPlatformConfig } from "./platform-config.mjs";
import { createIdentityService } from "./identity/create-identity-service.mjs";
import { createPlatformServices } from "./platform-services.mjs";
import { createAdminPageRenderers } from "./admin/pages.mjs";
import { createExecutionDispatcher } from "./execution-dispatch/dispatcher.mjs";
import {
  createLegacyPlatformApplicationSources,
} from "../client/legacy/create-legacy-platform-application.mjs";

const platformConfig = createPlatformConfig();
const {
  aiosOrigin,
  aiosPublicRoot,
  bindAddress,
  defaultUpstreamOrigin,
  deploymentVmNameOverride,
  deploymentVmNamePrefix,
  deploymentVmProject,
  distRoot,
  feedbackSummaryAdminEnvFileCandidates,
  feedbackSummaryAllowedEmail,
  connectorOauthAllowedOrigins,
  connectorOauthEnvFileCandidates,
  noVncNextRoot,
  notionOauthCallbackUri,
  packageRoot,
  platformOrigin,
  platformViteOrigin,
  playgroundSystemSkillsRoot,
  port,
  shouldForwardLocalCloudApiOverride,
  xlsxRoot,
  identityProvider,
  executionDispatcher,
  platformControlPlaneSecret,
  platformPrincipalAssertionAudience,
  platformPrincipalAssertionIssuer,
} = platformConfig;
const identityService = createIdentityService(platformConfig);
const {
  serveDistAsset,
  serveAiosPublicAsset,
  serveVendorAsset,
} = createStaticAssetService({
  aiosPublicRoot,
  distRoot,
  packageRoot,
  port,
});
const vncWebSocketProxy = createVncWebSocketProxy();
const {
  serveEnvironmentGuiViewerPage,
  serveFeedbackSummaryPage,
  serveProductUsageSummaryPageV2,
} = createAdminPageRenderers({
  aiosOrigin,
  feedbackSummaryAllowedEmail,
});
const platformApplicationSources = createLegacyPlatformApplicationSources({
  aiosOrigin,
  defaultUpstreamOrigin,
  identityProvider,
  platformOrigin,
});
const platformDocumentAssets = platformViteOrigin
  ? await createPlatformDevelopmentAssets(platformApplicationSources, {
      packageRoot,
      viteOrigin: platformViteOrigin,
    })
  : await createPlatformDocumentAssets(platformApplicationSources, {
      packageRoot,
    });
const platformDocumentHtml = platformDocumentAssets.documentHtml;

const platformGateway = createPlatformGateway({
  aiosOrigin,
  defaultUpstreamOrigin,
  deploymentVmNameOverride,
  deploymentVmNamePrefix,
  deploymentVmProject,
  feedbackSummaryAdminEnvFileCandidates,
  feedbackSummaryAllowedEmail,
  notionOauthCallbackUri,
  platformOrigin,
  port,
  serveFeedbackSummaryPage,
  serveProductUsageSummaryPageV2,
  shouldForwardLocalCloudApiOverride,
  shouldRetryUpstreamWithAiosSession,
  identityService,
});
const platformServices = createPlatformServices({
  gateway: platformGateway,
  identityService,
  connectorOauthEnvFileCandidates,
  connectorRuntimeSigningSecret: platformControlPlaneSecret,
  platformOrigin,
  playgroundSystemSkillsRoot,
  port,
  executionDispatcherEnabled: executionDispatcher.enabled,
});
const executionDispatcherRuntime = createExecutionDispatcher({
  ...executionDispatcher,
  secret: platformControlPlaneSecret,
  issuer: platformPrincipalAssertionIssuer,
  audience: platformPrincipalAssertionAudience,
  workerId: executionDispatcher.workerId || undefined,
  upstreamOrigin: defaultUpstreamOrigin,
  platformLocalOrigin: `http://127.0.0.1:${port}`,
  evaluationsService: platformServices.evaluationsService,
  fineTuningService: platformServices.fineTuningService,
  testsService: platformServices.testsService,
});

const server = http.createServer(createPlatformRequestHandler({
  ...platformGateway,
  ...platformServices,
  identityService,
  aiosOrigin,
  connectorOauthAllowedOrigins,
  connectorOauthEnvFileCandidates,
  handleGenericConnectorApiRequest,
  handleGithubApiRequest,
  handleJiraApiRequest,
  isGenericConnectorApiRequestPath,
  isGithubApiRequestPath,
  isJiraApiRequestPath,
  matchPlaygroundBillingProxyRoute,
  matchThreadProxyRoute,
  noVncNextRoot,
  platformDocumentAssets,
  platformDocumentHtml,
  platformOrigin,
  platformViteOrigin,
  port,
  serveAiosPublicAsset,
  serveDistAsset,
  serveEnvironmentGuiViewerPage,
  serveVendorAsset,
  wantsThreadEventStream,
  xlsxRoot,
}));

server.on("upgrade", (req, socket, head) => {
  vncWebSocketProxy.handleUpgrade(req, socket, head, { port });
});

server.listen(port, bindAddress, () => {
  console.log(`Platform listening at http://${bindAddress}:${port}`);
  console.log(
    `[platform] document=${platformDocumentAssets.metrics.documentBytes}B `
    + `css=${platformDocumentAssets.metrics.cssBytes}B `
    + `client=${platformDocumentAssets.metrics.moduleBytes}B `
    + `chunks=${platformDocumentAssets.metrics.moduleChunkCount || 0} `
    + `modules=${platformDocumentAssets.metrics.moduleGraphInputs || 1}`,
  );
  executionDispatcherRuntime.start();
});

let shutdownStarted = false;
async function shutdownPlatform(signal) {
  if (shutdownStarted) return;
  shutdownStarted = true;
  console.log(`[platform] Received ${signal}; stopping execution dispatch and HTTP intake.`);
  await executionDispatcherRuntime.stop({ wait: false });
  const forceExitTimer = setTimeout(() => {
    console.error("[platform] Graceful shutdown timed out.");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref?.();
  server.close((error) => {
    clearTimeout(forceExitTimer);
    if (error) {
      console.error("[platform] HTTP server shutdown failed.", error);
      process.exit(1);
      return;
    }
    process.exit(0);
  });
}

process.once("SIGTERM", () => {
  void shutdownPlatform("SIGTERM");
});
process.once("SIGINT", () => {
  void shutdownPlatform("SIGINT");
});
