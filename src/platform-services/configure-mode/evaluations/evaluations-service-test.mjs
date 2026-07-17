import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  EVALUATIONS_AGENT_SCRIPT_FRAGMENTS,
  EVALUATIONS_AGENT_STYLE_FRAGMENTS,
  EVALUATIONS_APP_SCRIPT_FRAGMENTS,
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS,
  EVALUATIONS_STYLE_FRAGMENTS,
  PLAYGROUND_EVALUATIONS_CSS,
  PLAYGROUND_EVALUATIONS_SCRIPT,
  createEvaluationsService,
} from "./index.mjs";
import {
  buildEvaluatorPrompt,
  createEvaluationRun,
  extractThreadCostTokens,
  extractThreadCostUsd,
  normalizeCaseRefinementResult,
  normalizeEvaluationSet,
  parseEvaluatorResult,
} from "./server/domain/index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(PLAYGROUND_EVALUATIONS_CSS, /\.playground-evaluations-page/);
assert.match(PLAYGROUND_EVALUATIONS_CSS, /\.playground-evaluations-table/);
assert.match(PLAYGROUND_EVALUATIONS_SCRIPT, /function normalizePlaygroundEvaluationSet/);
assert.match(PLAYGROUND_EVALUATIONS_SCRIPT, /function renderPlaygroundEvaluationsPage/);
assert.match(PLAYGROUND_EVALUATIONS_SCRIPT, /function PlaygroundEvaluationsPageView/);
assert.doesNotThrow(() => new Function(PLAYGROUND_EVALUATIONS_SCRIPT));
assert.equal(
  Object.values(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS).join(""),
  PLAYGROUND_EVALUATIONS_SCRIPT,
);
assert.equal(
  Object.values(EVALUATIONS_STYLE_FRAGMENTS).join(""),
  PLAYGROUND_EVALUATIONS_CSS,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation, /createPlaygroundEvaluationId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versions, /normalizePlaygroundEvaluationVersion/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.execution, /startPlaygroundEvaluationCaseThread/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /handleGenerateEvaluationCasesFromThreads/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /renderRunsTable/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /renderEvaluationRenameModal/);

assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.state, /evaluationSets/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openEvaluationsPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyCapture, /evaluationRunId/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "evaluations"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.lifecycle, /selectedEvaluationSetId/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderEvaluationsPageNav/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /function renderEvaluationsPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "evaluations"/);

assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.props, /evaluationSets/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.refs, /agentEvaluationRunModal/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.state, /agentDetailEvaluation/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.lifecycle, /agentDetailEvaluationRunModalOpen/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /agentEvaluationSets/);
assert.equal(
  EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view.match(/variant: "minimalistic-ui"/g)?.length,
  2,
);
assert.doesNotMatch(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /pagination\s*:/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.modal, /renderAgentEvaluationRunModal/);
assert.match(EVALUATIONS_AGENT_STYLE_FRAGMENTS.page, /playground-agents-detail-evaluations-section/);

const platformEntrySource = await readPlatformCompositionSource();

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/evaluations\/index\.mjs"/);
assert.match(platformEntrySource, /const evaluationsService = createEvaluationsService\(/);
assert.match(platformEntrySource, /evaluationsService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{PLAYGROUND_EVALUATIONS_CSS\}/);
assert.match(platformEntrySource, /\$\{PLAYGROUND_EVALUATIONS_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{EVALUATIONS_APP_SCRIPT_FRAGMENTS\.pageView\}/);
assert.match(platformEntrySource, /\$\{EVALUATIONS_AGENT_SCRIPT_FRAGMENTS\.view\}/);
assert.doesNotMatch(platformEntrySource, /playground-evaluations-page\.mjs/);
assert.doesNotMatch(platformEntrySource, /playground-evaluations-runtime\.mjs/);
assert.doesNotMatch(platformEntrySource, /function openEvaluationsPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderEvaluationsPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderEvaluationsPageNav\(/);
assert.doesNotMatch(platformEntrySource, /const playgroundEvaluationsRuntime/);

const evaluationSet = normalizeEvaluationSet({
  id: "evaluation_1",
  name: "Support quality",
  passThreshold: 85,
  targetAgentId: "agent_1",
  environmentId: "computer_1",
  dataRows: [{
    id: "case_1",
    input: "Help the customer",
    expectedOutput: "Resolve the request",
    runCount: 2,
  }],
});
assert.equal(evaluationSet.id, "evaluation_1");
assert.equal(evaluationSet.passThreshold, 0.85);
assert.equal(evaluationSet.dataRows[0]?.runCount, 2);

const evaluationRun = createEvaluationRun(evaluationSet, {
  id: "run_1",
  label: "Baseline",
});
assert.equal(evaluationRun.id, "run_1");
assert.equal(evaluationRun.evaluationSetId, "evaluation_1");
assert.equal(evaluationRun.cases.length, 2);
assert.equal(evaluationRun.status, "running");

const parsedScore = parseEvaluatorResult(
  '{"score":0.9,"reason":"Resolved correctly","passed":true,"confidence":0.8}',
);
assert.equal(parsedScore.score, 0.9);
assert.equal(parsedScore.passed, true);
assert.equal(parsedScore.parseStatus, "parsed_json");

const refinedCase = normalizeCaseRefinementResult(
  '{"input":"Fix login","expectedOutput":"Login works","evaluationGuidance":"Verify authentication","sourceAssessment":"failed"}',
);
assert.equal(refinedCase?.input, "Fix login");
assert.equal(refinedCase?.needsReview, true);

const costRecords = [
  { type: "turn_completed", createdAt: "2026-01-01T00:00:00.000Z", usage: { totalCT: 125 } },
  { type: "turn_completed", createdAt: "2026-01-01T00:01:00.000Z", usage: { totalCT: 75 } },
];
assert.equal(extractThreadCostTokens(costRecords), 200);
assert.equal(extractThreadCostUsd(costRecords), 2);

const evaluatorPrompt = buildEvaluatorPrompt({
  evaluationSet,
  run: evaluationRun,
  caseRun: evaluationRun.cases[0],
  row: evaluationSet.dataRows[0],
  snapshot: { threadId: "thread_1" },
});
assert.match(evaluatorPrompt, /Evaluation thread ID: thread_1/);
assert.match(evaluatorPrompt, /Expected output:\nResolve the request/);

const proxyCalls = [];
const adapters = {
  enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
  fetchAiosApi: async () => new Response(JSON.stringify({}), { status: 200 }),
  fetchAiosCloud: async () => new Response(JSON.stringify({}), { status: 200 }),
  hasAiosSession: () => false,
  parseUpstreamUrl: () => "https://runner.example.test/v1",
  proxyUpstreamJsonRequest: (...args) => proxyCalls.push(args),
  readOptionalApiKey: () => "",
  readRequestBody: async () => ({}),
  sendJson: () => {},
  withProxyOrganizationHeader: (_req, _body, headers) => headers,
};
const evaluationsService = createEvaluationsService(adapters);

let handled = evaluationsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/evaluations/evaluation%201"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.length, 1);
assert.equal(proxyCalls[0]?.[2], "/evaluations/evaluation%201");
assert.equal(proxyCalls[0]?.[3], "GET");

handled = evaluationsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/agents"),
);
assert.equal(handled, false);

let resolveUnauthorizedResponse;
const unauthorizedResponse = new Promise((resolve) => {
  resolveUnauthorizedResponse = resolve;
});
const unauthorizedService = createEvaluationsService({
  ...adapters,
  sendJson: (_res, status, payload) => resolveUnauthorizedResponse({ status, payload }),
});
handled = unauthorizedService.handleRequest(
  { method: "GET", headers: {}, url: "/api/real/evaluations/runs/missing" },
  {},
  new URL("http://localhost/api/real/evaluations/runs/missing"),
);
assert.equal(handled, true);
const unauthorizedResult = await unauthorizedResponse;
assert.equal(unauthorizedResult.status, 401);
assert.match(unauthorizedResult.payload?.message || "", /Sign in/);

const backendPaths = [];
let resolvePersistedResponse;
const persistedResponse = new Promise((resolve) => {
  resolvePersistedResponse = resolve;
});
const authenticatedService = createEvaluationsService({
  ...adapters,
  hasAiosSession: () => true,
  fetchAiosApi: async (_req, path) => {
    backendPaths.push(path);
    return new Response(JSON.stringify({ object: "evaluation_run", run: { id: "persisted" } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  },
  sendJson: (_res, status, payload) => resolvePersistedResponse({ status, payload }),
});
handled = authenticatedService.handleRequest(
  { method: "GET", headers: { host: "localhost" }, url: "/api/real/evaluations/runs/persisted" },
  {},
  new URL("http://localhost/api/real/evaluations/runs/persisted"),
);
assert.equal(handled, true);
const persistedResult = await persistedResponse;
assert.equal(persistedResult.status, 200);
assert.equal(persistedResult.payload?.run?.id, "persisted");
assert.deepEqual(backendPaths, ["/api/evaluations/runs/persisted"]);

assert.throws(
  () => createEvaluationsService({}),
  /Evaluations service requires the enrichThreadPayloadWithAgentGuardrails adapter/,
);

console.log("Evaluations service client ownership, browser syntax, domain behavior, and route contracts passed.");
