import { createApiKeysService } from "../../../src/platform-services/develop-mode/api-keys/index.mjs";
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
import { createProjectsService } from "../../../src/platform-services/create-mode/projects/index.mjs";
import { createTeamsService } from "../../../src/platform-services/configure-mode/teams/index.mjs";

import { createSystemSkillSourceService } from "./system-skill-sources.mjs";

export function createPlatformServices({
  gateway,
  playgroundSystemSkillsRoot,
  port,
}) {
  const {
    extractFeedbackSummaryIdToken,
    fetchAiosApi,
    fetchAiosCloud,
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
  const enrichThreadPayloadWithAgentGuardrails =
    guardrailsService.enrichThreadPayload;

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
  });

  const services = {
    apiKeysService: createApiKeysService({
      proxyAiosJsonRequest,
      proxyUpstreamGet,
    }),
    calendarService: createCalendarService({
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
    }),
    configureHomeService: createConfigureHomeService({
      proxyUpstreamGet,
    }),
    evaluationsService,
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
    systemSkillSourceService: createSystemSkillSourceService({
      root: playgroundSystemSkillsRoot,
      sendJson,
    }),
    teamsService: createTeamsService({
      extractIdToken: extractFeedbackSummaryIdToken,
      fetchUpstreamJsonForProxyExactPath,
      hasAiosSession,
      proxyUpstreamGet,
      proxyUpstreamJsonRequest,
      readOptionalApiKey,
      readRequestBody,
      sendJson,
    }),
  };

  return Object.freeze(services);
}
