import { createCoreGateway } from "./core-gateway.mjs";
import { createResourceGateway } from "./resource-gateway.mjs";
import { createServerDetailBootstrapGateway } from "./server-detail-bootstrap.mjs";
import { createThreadGateway } from "./thread/index.mjs";
import { createAdminGateway } from "./admin-gateway.mjs";
import { createAiosGateway } from "./aios-gateway.mjs";
export function createPlatformGateway(config) {
    const core = createCoreGateway(config);
    const resource = createResourceGateway({ ...config, ...core });
    const sendServerDetailBootstrap = createServerDetailBootstrapGateway({
        ...config,
        ...core,
        ...resource,
    });
    const thread = createThreadGateway({ ...config, ...core, ...resource });
    const admin = createAdminGateway({ ...config, ...core });
    const aios = createAiosGateway({ ...config, ...core });
    const modules = { ...core, ...resource, ...thread, ...admin, ...aios };
    return Object.freeze({
        extractFeedbackSummaryIdToken: modules.extractFeedbackSummaryIdToken,
        fetchAiosApi: modules.fetchAiosApi,
        fetchAiosCloud: modules.fetchAiosCloud,
        fetchSessionApi: modules.fetchSessionApi,
        fetchUpstreamJsonForProxyExactPath: modules.fetchUpstreamJsonForProxyExactPath,
        fetchUpstreamOverviewJson: modules.fetchUpstreamOverviewJson,
        handleAiosUserSessionRequest: modules.handleAiosUserSessionRequest,
        handleFeedbackSummaryPageRequest: modules.handleFeedbackSummaryPageRequest,
        handleProductUsageSummaryPageRequest: modules.handleProductUsageSummaryPageRequest,
        hasAiosSession: modules.hasAiosSession,
        inferProxyContentTypeFromPath: modules.inferProxyContentTypeFromPath,
        isUnauthorizedHttpStatus: modules.isUnauthorizedHttpStatus,
        parseUpstreamUrl: modules.parseUpstreamUrl,
        proxyAiosJsonRequest: modules.proxyAiosJsonRequest,
        proxyAiosLatestBriefingHtml: modules.proxyAiosLatestBriefingHtml,
        proxyAiosNotionLoginRequest: modules.proxyAiosNotionLoginRequest,
        proxyContactSalesSummaryGet: modules.proxyContactSalesSummaryGet,
        proxyCreateThread: modules.proxyCreateThread,
        proxyEnvironmentGuiSession: modules.proxyEnvironmentGuiSession,
        proxyEnvironmentStart: modules.proxyEnvironmentStart,
        proxyFeedbackSummaryGet: modules.proxyFeedbackSummaryGet,
        proxyPlaygroundCustomSkills: modules.proxyPlaygroundCustomSkills,
        proxyProductUsageSummaryGet: modules.proxyProductUsageSummaryGet,
        proxyThreadMessages: modules.proxyThreadMessages,
        proxyThreadMessagesGet: modules.proxyThreadMessagesGet,
        proxyThreadPermissionDecision: modules.proxyThreadPermissionDecision,
        proxyThreadSearch: modules.proxyThreadSearch,
        proxyThreadStepHtmlPreview: modules.proxyThreadStepHtmlPreview,
        proxyThreadTraceClustersGet: modules.proxyThreadTraceClustersGet,
        proxyUpstreamBinaryGet: modules.proxyUpstreamBinaryGet,
        proxyUpstreamGet: modules.proxyUpstreamGet,
        proxyUpstreamJsonRequest: modules.proxyUpstreamJsonRequest,
        proxyUpstreamRawRequest: modules.proxyUpstreamRawRequest,
        proxyUpstreamStreamRequest: modules.proxyUpstreamStreamRequest,
        readOptionalApiKey: modules.readOptionalApiKey,
        readRequestBody: modules.readRequestBody,
        sendDatabaseBootstrap: modules.sendDatabaseBootstrap,
        sendServerDetailBootstrap,
        sendJson: modules.sendJson,
        withProxyOrganizationHeader: modules.withProxyOrganizationHeader,
        setThreadMessagePayloadEnricher: thread.setThreadMessagePayloadEnricher,
        setThreadPayloadEnricher: thread.setThreadPayloadEnricher,
    });
}
