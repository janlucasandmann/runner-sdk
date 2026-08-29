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
import {
  createCloudCompatibilityDeploymentProfile,
  loadPublicDeploymentProfile,
} from "./deployment-profile-service.mjs";
import { waitForLocalAiosBridge } from "./gateway/aios-readiness.mjs";
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
  deploymentProfileId,
  deploymentStage,
  deploymentTopology,
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
  stockifiPlatformOrigin,
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
const deploymentProfileEnvelope = await loadPublicDeploymentProfile({
  upstreamOrigin: defaultUpstreamOrigin,
  expectedProfileId: deploymentProfileId,
  expectedTopology: deploymentTopology,
  expectedStage: deploymentStage,
  fallbackEnvelope: deploymentTopology === "gcp_saas"
    ? createCloudCompatibilityDeploymentProfile(deploymentStage)
    : null,
  attempts: deploymentTopology === "on_prem" ? 12 : 1,
  retryDelayMs: 500,
  timeoutMs: deploymentTopology === "on_prem" ? 1_000 : 1_500,
});
if (deploymentProfileEnvelope.source === "compatibility_fallback") {
  console.warn(
    "[platform] Control API deployment profile is unavailable; using the cloud rollout compatibility profile.",
    { profileId: deploymentProfileEnvelope.profile.profileId },
  );
} else {
  console.info("[platform] Loaded deployment profile from the control API.", {
    profileId: deploymentProfileEnvelope.profile.profileId,
    profileHash: deploymentProfileEnvelope.hash,
  });
}
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
  deploymentProfileEnvelope,
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
  deploymentTopology,
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
  defaultUpstreamOrigin,
  platformControlPlaneSecret,
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
  stockifiPlatformOrigin,
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
  if (platformGateway.proxyDeployableAppUpgrade(req, socket, head, { port })) return;
  vncWebSocketProxy.handleUpgrade(req, socket, head, { port });
});

const aiosBridgeReadiness = await waitForLocalAiosBridge(aiosOrigin);
if (!aiosBridgeReadiness.ready) {
  console.warn("[platform] Local AIOS bridge preflight failed; gateway retries remain enabled.", {
    status: aiosBridgeReadiness.status,
    error: aiosBridgeReadiness.error || "",
  });
}

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
  platformServices.externalAgentService.start();
});

let shutdownStarted = false;
async function shutdownPlatform(signal) {
  if (shutdownStarted) return;
  shutdownStarted = true;
  console.log(`[platform] Received ${signal}; stopping execution dispatch and HTTP intake.`);
  platformGateway.closeDeployableAppGateway();
  await Promise.all([
    executionDispatcherRuntime.stop({ wait: false }),
    platformServices.externalAgentService.stop({ wait: false }),
  ]);
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
