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
  compactFineTuningJobOverviewRecord,
  isFineTuningPhaseActive,
  normalizeFineTuningPhase,
  normalizeEvaluationSet,
} from "./server/domain/index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

const fineTuningRuntimeSource = await fs.readFile(
  new URL("./server/runtime.mjs", import.meta.url),
  "utf8",
);

assert.match(PLAYGROUND_FINE_TUNING_CSS, /\.playground-fine-tuning-page/);
assert.match(PLAYGROUND_FINE_TUNING_SCRIPT, /function normalizePlaygroundFineTuningJob/);
assert.match(PLAYGROUND_FINE_TUNING_SCRIPT, /function renderPlaygroundFineTuningPage/);
assert.match(PLAYGROUND_FINE_TUNING_SCRIPT, /function PlaygroundFineTuningPage/);
assert.doesNotThrow(() => new Function(PLAYGROUND_FINE_TUNING_SCRIPT));
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.foundation, /createPlaygroundFineTuningId/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.jobs, /normalizePlaygroundFineTuningJob/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.evaluations, /normalizePlaygroundFineTuningEvaluationSet/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.evaluations, /readPlaygroundFineTuningEvaluationListFromPayload/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.evaluations, /mergePlaygroundFineTuningEvaluationSources/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /"\/evaluations\?limit=500"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /"\/evaluations\/runs\?limit=1000"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /"\/fine-tuning\/jobs\?view=overview&limit=100"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /shouldLoadFineTuningEvaluationData/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /fineTuningPageMode !== "detail"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /setFineTuningEvaluationSetsLoading\(true\)/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /readPlaygroundEvaluationSetsFromStorage/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /fineTuningCreateDefaultEvaluationAppliedRef/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access, /function renderFineTuningAccessSettings/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access, /subjectType: "fine_tuning"/);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access,
  /getPlatformSystemPrincipalRolePermissionSet/,
);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access,
  /buildPlatformSystemPrincipalRolePermissionMetadata/,
);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access,
  /isPlatformRoleScopedSystemAccessPrincipalId/,
);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access,
  /React\.createElement\(PlatformRolePermissionsPage/,
);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail,
  /sidebarCollapsed: Boolean\(fineTuningAccessTeamId\)/,
);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.verification, /startFineTuningVerificationRuns/);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.verification,
  /publishFineTunedAgentVersion[\s\S]*?server-controlled publication policy/,
);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.verification,
  /tryPersistFineTunedAgentVersion[\s\S]*?Implicit browser publication is disabled/,
);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /renderCreateModal/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformModal/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /title: "New Optimization"[\s\S]*?headerVariant: "search"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /headerSearchProps: \{[\s\S]*?icon: TestTubeDiagonal[\s\S]*?value: form\.name/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformSecondaryButton/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformPrimaryButton/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /ariaLabel: "Select agent to optimize"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /ariaLabel: "Select optimizer agent"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /ariaLabel: "Select environment"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /label: "Fresh baseline"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /value: "existing:" \+ run\.id/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /className: "playground-tasks-detail-central-selector playground-fine-tuning-create-selector"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /popupClassName: "playground-tasks-detail-central-selector-popup playground-fine-tuning-create-selector-popup"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /Loading evaluation sets\.\.\./);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformPopup/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /variant: "minimal"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /portal: true/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformInstructionsEditor/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /title: "Instructions"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /variant: "minimalistic-ui"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /contentVariant: "text"/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\("textarea"/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /renderInstructionsToolbarButton/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.editor, /resizeFineTuningInstructionsTextarea/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /fineTuningInstructionsTextareaRef/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /fineTuningInstructionsHistory/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /tryPersistFineTunedAgentVersion/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.setup, /publishFineTunedAgentVersion/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformPopupSurface/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.createModal, /React\.createElement\(PlatformModal(?:Backdrop|Surface)/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.actions, /tryPersistFineTunedAgentVersion/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.actions, /startFineTuningVerificationRuns/);
assert.match(
  fineTuningRuntimeSource,
  /handleCreateJobLegacy[\s\S]*?legacy browser-driven optimization workflow is disabled/,
);
assert.match(
  fineTuningRuntimeSource,
  /publicationApprovalMatch[\s\S]*?resolveFineTuningPublicationCandidate[\s\S]*?approveBackendFineTuningPublication/,
);
assert.doesNotMatch(
  fineTuningRuntimeSource.slice(fineTuningRuntimeSource.indexOf("function handleRequest")),
  /handleCreateJobLegacy/,
);
assert.doesNotMatch(PLAYGROUND_FINE_TUNING_CSS, /\.playground-fine-tuning-create-modal \.playground-fine-tuning-instructions-section[\s\S]*?background: transparent !important;/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.overview, /React\.createElement\(FineTuningOverviewPage/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.overview, /React\.createElement\(PlatformDataTable/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.overview, /isPlanned[\s\S]*?"Planned"/);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.overview,
  /resolvePlaygroundFineTuningConductorIdentity\([\s\S]*?normalizedJob[\s\S]*?\[currentFineTuningUser, \.\.\.normalizedAgents\]/,
);
assert.match(
  FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.access,
  /resolvePlaygroundFineTuningPersonIdentity\(storedOwner, \[currentFineTuningUser\]\)/,
);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.jobs, /phase === "planned" \|\| status === "planned"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /React\.createElement\(FineTuningDetailPage/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /React\.createElement\(React\.Fragment[\s\S]*?React\.createElement\(FineTuningDetailPage/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /typeof createPortal === "function"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /playground-fine-tuning-detail-topnav-actions/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /platform-service-detail-page__sidebar-actions/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /canAddOptimizationToBatches/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /fineTuningOrchestrationState/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /"Add to Batches"/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /sidebarToggle/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /activeTab:/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /waiting for its delivery gate/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /React\.createElement\(PlatformAnalyticsSection/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /function renderFineTuningDescriptionEditor/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /function renderFineTuningInstructionsEditor/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /const fineTuningSettings = fineTuningDetailTab === "settings"/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /settings: fineTuningSettings/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /additionalSections: renderFineTuningInstructionsEditor\(job\)/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /Approve & Publish/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /React\.createElement\(PlatformPrimaryButton/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.editor, /function approveFineTuningPublication/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.editor, /\/publication-approval/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /renderFineTuningAccessSettings\(job\)/);
assert.match(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /variant: "minimalistic-ui"/);
assert.doesNotMatch(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.detail, /PlaygroundFineTuningPerformanceChart/);
assert.equal(
  Object.values(FINE_TUNING_PAGE_SCRIPT_FRAGMENTS).join(""),
  PLAYGROUND_FINE_TUNING_SCRIPT,
);

const {
  resolvePlaygroundFineTuningPersonIdentity: resolveClientFineTuningPersonIdentity,
  resolvePlaygroundFineTuningConductorIdentity: resolveClientFineTuningConductorIdentity,
} = new Function(`${FINE_TUNING_PAGE_SCRIPT_FRAGMENTS.foundation}
  return {
    resolvePlaygroundFineTuningPersonIdentity,
    resolvePlaygroundFineTuningConductorIdentity,
  };
`)();

const currentFineTuningIdentity = {
  id: "creator_1",
  userId: "creator_1",
  name: "Jan Luca Sandmann",
  email: "jan@example.com",
  avatarUrl: "/jan.png",
};

assert.deepEqual(
  resolveClientFineTuningConductorIdentity(
    {
      id: "optimization_legacy",
      createdBy: { id: "creator_1", userId: "creator_1" },
    },
    [currentFineTuningIdentity],
  ),
  currentFineTuningIdentity,
);
assert.deepEqual(
  resolveClientFineTuningConductorIdentity(
    {
      id: "optimization_agent_created",
      createdBy: "agent_creator",
    },
    [{ id: "agent_creator", name: "Optimizer Agent", photoUrl: "/agent.png" }],
  ),
  {
    id: "agent_creator",
    userId: "",
    name: "Optimizer Agent",
    email: "",
    avatarUrl: "/agent.png",
  },
);
assert.deepEqual(
  resolveClientFineTuningPersonIdentity(
    {
      id: "creator_2",
      userId: "creator_2",
      name: "Other User",
      email: "other@example.com",
      avatarUrl: "/other.png",
    },
    [currentFineTuningIdentity],
  ),
  {
    id: "creator_2",
    userId: "creator_2",
    name: "Other User",
    email: "other@example.com",
    avatarUrl: "/other.png",
  },
);
assert.equal(normalizeFineTuningPhase("planned"), "planned");
assert.equal(isFineTuningPhaseActive("planned"), false);

assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.state, /fineTuningJobs/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.state, /fineTuningDetailTab/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.state, /fineTuningOverviewScope/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.navigation, /function openFineTuningPage/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyCapture, /fineTuneJobId/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "fine-tuning"/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.lifecycle, /selectedFineTuningJobId/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderFineTuningPageNav/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-fine-tuning-overview-controls/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformSwitch/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /\{ value: "all", label: "All Optimizations" \}/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /\{ value: "created", label: "Created by me" \}/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /\{ value: "shared", label: "Shared with me" \}/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.pageView, /fineTuningOverviewScope/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-fine-tuning-nav-actions/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.pageView, /function renderFineTuningPage/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.pageView, /topNavActionsPortalId/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "fine-tuning"/);
assert.match(FINE_TUNING_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: AgentOptimizationSidebarIcon/);
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

const compactOverviewJob = compactFineTuningJobOverviewRecord({
  ...compactJob,
  instructions: "Only available on the detail endpoint.",
  evaluationRuns: [{ id: "run_1" }],
  diffFiles: [{ path: "agent/config.json" }],
});
assert.equal(compactOverviewJob.id, "job_1");
assert.equal(compactOverviewJob.evaluationSetCount, 1);
assert.equal(compactOverviewJob.instructions, undefined);
assert.equal(compactOverviewJob.evaluationRuns, undefined);
assert.equal(compactOverviewJob.diffFiles, undefined);
assert.equal(compactOverviewJob.metadata, undefined);

const clearedDescriptionJob = compactFineTuningJobRecord({
  id: "job_clear_description",
  description: "",
  metadata: { description: "Legacy metadata description" },
});
assert.equal(clearedDescriptionJob.description, "");

const evaluationSet = normalizeEvaluationSet({
  id: "evaluation_1",
  name: "Support quality",
  runs: [{
    id: "run_1",
    averageScore: 0.9,
    costSource: "thread_usage_ct",
    runFingerprint: "sha256:run",
    datasetFingerprint: "sha256:dataset",
    caseSelectionFingerprint: "sha256:selection",
    evaluatorFingerprint: "sha256:evaluator",
    systemFingerprint: "sha256:system",
    cases: [{
      id: "case_1",
      dataRowId: "row_1",
      status: "passed",
      score: 0.9,
      costUsd: 0.01,
      costSource: "thread_usage_ct",
      latencyMs: 420,
    }],
  }],
});
assert.equal(evaluationSet.id, "evaluation_1");
assert.equal(evaluationSet.runs[0]?.averageScore, 0.9);
assert.equal(evaluationSet.runs[0]?.costSource, "thread_usage_ct");
assert.equal(evaluationSet.runs[0]?.datasetFingerprint, "sha256:dataset");
assert.equal(evaluationSet.runs[0]?.caseSelectionFingerprint, "sha256:selection");
assert.equal(evaluationSet.runs[0]?.evaluatorFingerprint, "sha256:evaluator");
assert.equal(evaluationSet.runs[0]?.systemFingerprint, "sha256:system");
assert.equal(evaluationSet.runs[0]?.cases[0]?.costSource, "thread_usage_ct");
assert.equal(evaluationSet.runs[0]?.cases[0]?.latencyMs, 420);

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
  /Agent Optimization service requires the enrichThreadPayloadWithAgentGuardrails adapter/,
);

console.log("Agent Optimization service client ownership, browser syntax, shell integration, and route contracts passed.");
