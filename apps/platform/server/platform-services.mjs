import { createApiKeysService } from "../../../src/platform-services/develop-mode/api-keys/index.mjs";
import { createAgentRuntimeService } from "../../../src/platform-services/develop-mode/agent-runtime/index.mjs";
import { createAssuranceService } from "../../../src/platform-services/configure-mode/assurance/index.mjs";
import { createEvidenceAgentsService } from "../../../src/platform-services/develop-mode/evidence-agents/index.mjs";
import { createSecurityService } from "../../../src/platform-services/develop-mode/security/index.mjs";
import { createCalendarService } from "../../../src/platform-services/create-mode/calendar/index.mjs";
import { createConfigureHomeService } from "../../../src/platform-services/configure-mode/configure-home/index.mjs";
import { createEvaluationsService } from "../../../src/platform-services/configure-mode/evaluations/index.mjs";
import { createFilesService } from "../../../src/platform-services/create-mode/files/index.mjs";
import { createFineTuningService } from "../../../src/platform-services/configure-mode/fine-tuning/index.mjs";
import { createGuardrailsService } from "../../../src/platform-services/configure-mode/guardrails/index.mjs";
import { createImagineService } from "../../../src/platform-services/create-mode/imagine/index.mjs";
import { createInferenceService } from "../../../src/platform-services/configure-mode/inference/index.mjs";
import { createMarketplaceService } from "../../../src/platform-services/configure-mode/marketplace/index.mjs";
import { createMetronomeService } from "../../../src/platform-services/create-mode/metronome/index.mjs";
import { createModelsService } from "../../../src/platform-services/configure-mode/models/index.mjs";
import { createOrganizationsService } from "../../../src/platform-services/configure-mode/organizations/index.mjs";
import { createPromptsService } from "../../../src/platform-services/configure-mode/prompts/index.mjs";
import { createProjectsService } from "../../../src/platform-services/create-mode/projects/index.mjs";
import { createTeamsService } from "../../../src/platform-services/configure-mode/teams/index.mjs";
import { createTestsService } from "../../../src/platform-services/configure-mode/tests/index.mjs";

import { createSystemSkillSourceService } from "./system-skill-sources.mjs";
import {
  createConnectorCredentialCatalogService,
} from "./integrations/connector-credential-catalog.mjs";
import { createConnectorExecutionPolicy } from "./integrations/connector-execution-policy.mjs";
import {
  createConnectorRuntimeBridge,
} from "./integrations/connector-runtime-bridge.mjs";
import {
  resolveConnectorSettingsForPrincipal,
} from "./integrations/connector-oauth-core.mjs";
import {
  createConnectorRuntimeGrantService,
} from "./integrations/connector-runtime-grants.mjs";
import {
  createConnectorResourceTransport,
} from "./integrations/connector-resource-transport.mjs";
import {
  createConnectorAdapterRegistry,
} from "./integrations/connectors/runtime/connector-adapter-registry.mjs";
import {
  createConnectorMcpService,
} from "./integrations/connectors/runtime/connector-mcp-service.mjs";
import { createExternalAgentService } from "./integrations/external-agents/index.mjs";

export function createPlatformServices({
  gateway,
  identityService,
  connectorOauthEnvFileCandidates = [],
  connectorRuntimeSigningSecret = "",
  defaultUpstreamOrigin,
  platformControlPlaneSecret = "",
  platformOrigin,
  playgroundSystemSkillsRoot,
  port,
  executionDispatcherEnabled = false,
}) {
  const {
    fetchAiosApi,
    fetchAiosCloud,
    fetchSessionApi,
    fetchUpstreamJsonForProxyExactPath,
    hasAiosSession,
    inferProxyContentTypeFromPath,
    isUnauthorizedHttpStatus,
    parseUpstreamUrl,
    proxyAiosJsonRequest,
    proxyUpstreamBinaryGet,
    proxyUpstreamGet,
    proxyUpstreamJsonRequest,
    proxyUpstreamRawRequest,
    readOptionalApiKey,
    readRequestBody,
    sendJson,
    withProxyOrganizationHeader,
  } = gateway;

  const guardrailsService = createGuardrailsService({
    fetchImpl: fetch,
    fetchAiosApi,
    fetchAiosCloud,
    hasAiosSession,
    proxyUpstreamGet,
    proxyUpstreamJsonRequest,
    warn: (...args) => console.warn(...args),
    withProxyOrganizationHeader,
  });
  gateway.setThreadPayloadEnricher(guardrailsService.enrichThreadPayload);
  const fetchConnectorResource = createConnectorResourceTransport({
    fetchImpl: fetch,
    fetchAiosCloud,
    fetchAiosApi,
    withProxyOrganizationHeader,
  });
  const connectorAdapterRegistry = createConnectorAdapterRegistry({
    envFileCandidates: connectorOauthEnvFileCandidates,
  });
  const connectorExecutionPolicy = createConnectorExecutionPolicy({
    fetchSessionApi,
    fetchResourceApi: fetchConnectorResource,
    fetchOrganizationApi: fetchAiosCloud,
    identityService,
    envFileCandidates: connectorOauthEnvFileCandidates,
    resolveConnectorConfig: resolveConnectorSettingsForPrincipal,
    listConnectorCapabilities: (connectorId) =>
      connectorAdapterRegistry.listCapabilities(connectorId),
    logger: console,
  });
  const connectorRuntimeGrantService = createConnectorRuntimeGrantService({
    secret: connectorRuntimeSigningSecret,
    envFileCandidates: connectorOauthEnvFileCandidates,
  });
  const connectorRuntimeBridge = createConnectorRuntimeBridge({
    grantService: connectorRuntimeGrantService,
    platformOrigin,
    envFileCandidates: connectorOauthEnvFileCandidates,
    logger: console,
  });
  const connectorCredentialCatalogService =
    createConnectorCredentialCatalogService({
      fetchSessionApi,
      fetchOrganizationApi: fetchAiosCloud,
      identityService,
      envFileCandidates: connectorOauthEnvFileCandidates,
      logger: console,
    });
  const connectorMcpService = createConnectorMcpService({
    grantService: connectorRuntimeGrantService,
    adapterRegistry: connectorAdapterRegistry,
    logger: console,
  });
  gateway.setThreadMessagePayloadEnricher(
    async (
      req,
      threadId,
      upstreamUrl,
      apiKey,
      payload,
      context,
    ) => {
      try {
        const authorizedPayload =
          await connectorExecutionPolicy.enrichThreadMessagePayload(
            req,
            threadId,
            upstreamUrl,
            apiKey,
            payload,
            context,
          );
        return connectorRuntimeBridge.addRuntimeServers({
          threadId,
          payload: authorizedPayload,
        });
      } catch (error) {
        console.warn("[connector-policy] Thread connector preparation failed", {
          threadId,
          connectorIds: Object.entries(context?.requestedConnectors || {})
            .filter(([, value]) => value?.enabled !== false)
            .map(([id]) => String(id || "").trim().toLowerCase())
            .filter(Boolean),
          statusCode: Number(error?.statusCode) || 502,
          code: String(error?.code || "connector_preparation_failed"),
          phase: String(error?.details?.phase || "connector_authorization"),
        });
        throw error;
      }
    },
  );
  const enrichThreadPayloadWithAgentGuardrails =
    guardrailsService.enrichThreadPayload;
  const externalAgentService = createExternalAgentService({
    identityService,
    fetchOrganizationApi: fetchAiosCloud,
    upstreamOrigin: defaultUpstreamOrigin,
    platformOrigin,
    encryptionKey: process.env.EXTERNAL_AGENT_WEBHOOK_ENCRYPTION_KEY
      || platformControlPlaneSecret
      || connectorRuntimeSigningSecret,
    connectorRuntimeBridge,
    adapterRegistry: connectorAdapterRegistry,
    enrichThreadPayload: enrichThreadPayloadWithAgentGuardrails,
    sendJson,
  });

  const evaluationsService = createEvaluationsService({
    sendJson,
    readRequestBody,
    parseUpstreamUrl,
    readOptionalApiKey,
    withProxyOrganizationHeader,
    hasAiosSession,
    fetchAiosApi,
    fetchAiosCloud,
    enrichThreadPayloadWithAgentGuardrails,
    proxyUpstreamJsonRequest,
    durableExecutionEnabled: executionDispatcherEnabled,
  });

  const fineTuningService = createFineTuningService({
    sendJson,
    readRequestBody,
    parseUpstreamUrl,
    readOptionalApiKey,
    withProxyOrganizationHeader,
    hasAiosSession,
    fetchAiosApi,
    fetchAiosCloud,
    enrichThreadPayloadWithAgentGuardrails,
    evaluationRuns: evaluationsService.runs,
  });

  const testsService = createTestsService({
    fetchAiosApi,
    fetchAiosCloud,
    hasAiosSession,
    parseUpstreamUrl,
    proxyUpstreamJsonRequest,
    readOptionalApiKey,
    withProxyOrganizationHeader,
  });

  const services = {
    agentRuntimeService: createAgentRuntimeService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    apiKeysService: createApiKeysService({
      proxyAiosJsonRequest,
      proxyUpstreamGet,
    }),
    assuranceService: createAssuranceService({
      proxyUpstreamJsonRequest,
    }),
    calendarService: createCalendarService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    configureHomeService: createConfigureHomeService({
      proxyUpstreamGet,
    }),
    connectorCredentialCatalogService,
    connectorMcpService,
    connectorExecutionPolicy,
    connectorRuntimeBridge,
    connectorRuntimeGrantService,
    evaluationsService,
    evidenceAgentsService: createEvidenceAgentsService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    externalAgentService,
    filesService: createFilesService({
      fetchAiosApi,
      fetchAiosCloud,
      hasAiosSession,
      inferProxyContentTypeFromPath,
      isUnauthorizedHttpStatus,
      parseUpstreamUrl,
      port,
      proxyUpstreamBinaryGet,
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
      proxyUpstreamRawRequest,
      readOptionalApiKey,
      sendJson,
      withProxyOrganizationHeader,
    }),
    fineTuningService,
    guardrailsService,
    imagineService: createImagineService({
      proxyAiosJsonRequest,
    }),
    inferenceService: createInferenceService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    marketplaceService: createMarketplaceService({
      sendJson,
    }),
    metronomeService: createMetronomeService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    modelsService: createModelsService({
      proxyUpstreamGet,
    }),
    organizationsService: createOrganizationsService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    projectsService: createProjectsService({
      fetchAiosApi,
      fetchAiosCloud,
      fetchUpstreamJsonForProxyExactPath,
      hasAiosSession,
      inferProxyContentTypeFromPath,
      parseUpstreamUrl,
      proxyAiosJsonRequest,
      proxyUpstreamBinaryGet,
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
      proxyUpstreamRawRequest,
      readOptionalApiKey,
      readRequestBody,
      sendJson,
      withProxyOrganizationHeader,
    }),
    promptsService: createPromptsService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    securityService: createSecurityService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    systemSkillSourceService: createSystemSkillSourceService({
      root: playgroundSystemSkillsRoot,
      sendJson,
    }),
    teamsService: createTeamsService({
      fetchUpstreamJsonForProxyExactPath,
      hasAiosSession,
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
      readOptionalApiKey,
      readRequestBody,
      sendJson,
    }),
    testsService,
  };

  return Object.freeze(services);
}
