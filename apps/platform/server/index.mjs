import http from "node:http";
import { handleGithubApiRequest, isGithubApiRequestPath } from "./integrations/github-oauth.mjs";
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
import { createPlatformServices } from "./platform-services.mjs";
import { createAdminPageRenderers } from "./admin/pages.mjs";
import { createLegacyPlatformApplication } from "../client/legacy/create-legacy-platform-application.mjs";

const {
  aiosOrigin,
  aiosPublicRoot,
  defaultUpstreamOrigin,
  deploymentVmNameOverride,
  deploymentVmNamePrefix,
  deploymentVmProject,
  distRoot,
  feedbackSummaryAdminEnvFileCandidates,
  feedbackSummaryAllowedEmail,
  githubOauthAllowedOrigins,
  githubOauthEnvFileCandidates,
  noVncNextRoot,
  notionOauthCallbackUri,
  packageRoot,
  platformOrigin,
  platformViteOrigin,
  playgroundSystemSkillsRoot,
  port,
  shouldForwardLocalCloudApiOverride,
  xlsxRoot,
} = createPlatformConfig();
const {
  serveDistAsset,
  servePlatformClient,
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
const inlinePlatformDocumentHtml = createLegacyPlatformApplication({
  aiosOrigin,
  defaultUpstreamOrigin,
  platformOrigin,
});
const platformDocumentAssets = platformViteOrigin
  ? await createPlatformDevelopmentAssets(inlinePlatformDocumentHtml, {
      packageRoot,
      viteOrigin: platformViteOrigin,
    })
  : createPlatformDocumentAssets(inlinePlatformDocumentHtml);
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
});
const platformServices = createPlatformServices({
  gateway: platformGateway,
  playgroundSystemSkillsRoot,
  port,
});

const server = http.createServer(createPlatformRequestHandler({
  ...platformGateway,
  ...platformServices,
  githubOauthAllowedOrigins,
  githubOauthEnvFileCandidates,
  handleGithubApiRequest,
  isGithubApiRequestPath,
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
  servePlatformClient,
  serveEnvironmentGuiViewerPage,
  serveVendorAsset,
  wantsThreadEventStream,
  xlsxRoot,
}));

server.on("upgrade", (req, socket, head) => {
  vncWebSocketProxy.handleUpgrade(req, socket, head, { port });
});

server.listen(port, () => {
  console.log(`Platform listening at http://localhost:${port}`);
  console.log(
    `[platform] document=${platformDocumentAssets.metrics.documentBytes}B `
    + `css=${platformDocumentAssets.metrics.cssBytes}B `
    + `client=${platformDocumentAssets.metrics.moduleBytes}B`,
  );
});
