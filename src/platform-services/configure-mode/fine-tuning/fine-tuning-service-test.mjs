import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  FINE_TUNING_APP_SCRIPT_FRAGMENTS,
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS,
  PLAYGROUND_FINE_TUNING_CSS,
  PLAYGROUND_FINE_TUNING_SCRIPT,
  createFineTuningService,
} from "./index.mjs";
import {
  compactFineTuningJobRecord,
  normalizeEvaluationSet,
} from "./server/domain/index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(PLAYGROUND_FINE_TUNING_CSS, /\.playground-fine-tuning-page/);
assert.match(PLAYGROUND_FINE_TUNING_SCRIPT, /function normalizePlaygroundFineTuningJob/);
assert.match(PLAYGROUND_FINE_TUNING_SCRIPT, /function renderPlaygroundFineTuningPage/);
assert.match(PLAYGROUND_FINE_TUNING_SCRIPT, /function PlaygroundFineTuningPage/);
assert.doesNotThrow(() => new Function(PLAYGROUND_FINE_TUNING_SCRIPT));
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.foundation, /createPlaygroundFineTuningId/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.jobs, /normalizePlaygroundFineTuningJob/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.evaluations, /normalizePlaygroundFineTuningEvaluationSet/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access, /function renderFineTuningAccessSettings/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access, /subjectType: "fine_tuning"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.verification, /startFineTuningVerificationRuns/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /renderCreateModal/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.overview, /React\.createElement\(FineTuningOverviewPage/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.overview, /React\.createElement\(PlatformDataTable/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /React\.createElement\(FineTuningDetailPage/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /React\.createElement\(PlatformAnalyticsSection/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /function renderFineTuningDescriptionEditor/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /function renderFineTuningInstructionsEditor/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /renderFineTuningAccessSettings\(job\)/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /variant: "minimalistic-ui"/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /PlaygroundFineTuningPerformanceChart/);
assert.equal(
  Object.values(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS).join(""),
  PLAYGROUND_FINE_TUNING_SCRIPT,
);

assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.state, /fineTuningJobs/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.navigation, /function openFineTuningPage/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyCapture, /fineTuneJobId/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "fine-tuning"/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.lifecycle, /selectedFineTuningJobId/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderFineTuningPageNav/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-fine-tuning-overview-controls/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.pageView, /function renderFineTuningPage/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "fine-tuning"/);
assert.doesNotThrow(() => new Function(String.raw`
  function fineTuningHostIntegration() {
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.state}
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.lifecycle}
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.navigation}
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyCapture}
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyRestore}
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation}
    ${FINE_TUNING_APP_SCRIPT_FRAGMENTS.pageView}
    const sidebarEntries = [${FINE_TUNING_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return sidebarEntries;
  }
`));

const platformEntrySource = await readPlatformCompositionSource();

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/fine-tuning\/index\.mjs"/);
assert.match(platformEntrySource, /const fineTuningService = createFineTuningService\(/);
assert.match(platformEntrySource, /fineTuningService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{PLAYGROUND_FINE_TUNING_CSS\}/);
assert.match(platformEntrySource, /\$\{PLAYGROUND_FINE_TUNING_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{FINE_TUNING_APP_SCRIPT_FRAGMENTS\.pageView\}/);
assert.doesNotMatch(platformEntrySource, /playground-fine-tuning-page\.mjs/);
assert.doesNotMatch(platformEntrySource, /playground-fine-tuning-runtime\.mjs/);
assert.doesNotMatch(platformEntrySource, /function openFineTuningPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderFineTuningPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderFineTuningPageNav\(/);
assert.doesNotMatch(platformEntrySource, /const playgroundFineTuningRuntime/);

const compactJob = compactFineTuningJobRecord({
  id: "job_1",
  name: "Improve support agent",
  agentId: "agent_1",
  evaluationSetIds: ["evaluation_1"],
  costUsd: 1.25,
  description: "Improve response quality without changing supported workflows.",
  metadata: {
    owner: { id: "user_1", name: "Ada" },
    teamAccessIds: ["team_1"],
  },
});
assert.equal(compactJob.id, "job_1");
assert.equal(compactJob.targetAgentId, "agent_1");
assert.equal(compactJob.evaluationSets[0]?.id, "evaluation_1");
assert.equal(compactJob.costUsd, 1.25);
assert.equal(compactJob.description, "Improve response quality without changing supported workflows.");
assert.equal(compactJob.metadata.owner.name, "Ada");
assert.deepEqual(compactJob.metadata.teamAccessIds, ["team_1"]);

const clearedDescriptionJob = compactFineTuningJobRecord({
  id: "job_clear_description",
  description: "",
  metadata: { description: "Legacy metadata description" },
});
assert.equal(clearedDescriptionJob.description, "");

const evaluationSet = normalizeEvaluationSet({
  id: "evaluation_1",
  name: "Support quality",
  runs: [{ id: "run_1", averageScore: 0.9 }],
});
assert.equal(evaluationSet.id, "evaluation_1");
assert.equal(evaluationSet.runs[0]?.averageScore, 0.9);

const responses = [];
const adapters = {
  enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
  fetchAiosApi: async () => new Response(JSON.stringify({}), { status: 200 }),
  fetchAiosCloud: async () => new Response(JSON.stringify({}), { status: 200 }),
  hasAiosSession: () => false,
  parseUpstreamUrl: () => "https://runner.example.test/v1",
  readOptionalApiKey: () => "",
  readRequestBody: async () => ({}),
  sendJson: (_res, status, payload) => responses.push({ status, payload }),
  withProxyOrganizationHeader: (_req, _body, headers) => headers,
};
const fineTuningService = createFineTuningService(adapters);

let handled = fineTuningService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/fine-tuning/jobs"),
);
assert.equal(handled, true);
assert.equal(responses[0]?.status, 401);
assert.match(responses[0]?.payload?.message || "", /Sign in/);

handled = fineTuningService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/agents"),
);
assert.equal(handled, false);

let resolveAuthenticatedResponse;
const authenticatedResponse = new Promise((resolve) => {
  resolveAuthenticatedResponse = resolve;
});
const authenticatedService = createFineTuningService({
  ...adapters,
  hasAiosSession: () => true,
  sendJson: (_res, status, payload) => resolveAuthenticatedResponse({ status, payload }),
});
handled = authenticatedService.handleRequest(
  { method: "GET", headers: { host: "localhost" } },
  {},
  new URL("http://localhost/api/real/fine-tuning/jobs"),
);
assert.equal(handled, true);
const authenticatedList = await authenticatedResponse;
assert.equal(authenticatedList.status, 200);
assert.deepEqual(authenticatedList.payload.jobs, []);

assert.throws(
  () => createFineTuningService({}),
  /Fine-Tuning service requires the enrichThreadPayloadWithAgentGuardrails adapter/,
);

console.log("Fine-Tuning service client ownership, browser syntax, shell integration, and route contracts passed.");
