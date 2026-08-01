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
  recomputeRun,
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
assert.doesNotMatch(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.execution,
  /new Function\("input",\s*"expected",\s*"actual"/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs,
  /Code evaluator \(unavailable\)[\s\S]*?disabled: true/,
);
const evaluationRuntimeSecuritySource = await fs.readFile(
  new URL("./server/runtime.mjs", import.meta.url),
  "utf8",
);
assert.doesNotMatch(
  evaluationRuntimeSecuritySource,
  /new Function\("input",\s*"expected",\s*"actual"/,
);
const {
  createPlaygroundEvaluationSetDraft: createClientEvaluationSetDraft,
  normalizePlaygroundEvaluationDataRow: normalizeClientEvaluationDataRow,
  normalizePlaygroundEvaluationRun: normalizeClientEvaluationRun,
  normalizePlaygroundEvaluationSet: normalizeOwnershipEvaluationSet,
} = new Function(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation + "; return { createPlaygroundEvaluationSetDraft, normalizePlaygroundEvaluationDataRow, normalizePlaygroundEvaluationRun, normalizePlaygroundEvaluationSet };",
)();
assert.deepEqual(createClientEvaluationSetDraft().dataRows, []);
assert.equal(normalizeClientEvaluationDataRow({ split: "holdout" }).optimizationRole, "holdout");
assert.equal(normalizeClientEvaluationDataRow({ optimization_role: "validation" }).optimizationRole, "validation");
assert.equal(normalizeClientEvaluationDataRow({ optimizationRole: "unexpected" }).optimizationRole, "train");
assert.equal(normalizeClientEvaluationDataRow({ title: "Greeting", description: "Basic greeting case" }).title, "Greeting");
assert.equal(normalizeClientEvaluationDataRow({ title: "Greeting", description: "Basic greeting case" }).description, "Basic greeting case");
const evaluationWithCaseMetadata = normalizeEvaluationSet({
  id: "evaluation_case_metadata",
  dataRows: [{
    id: "case_1",
    title: "Greeting",
    description: "Basic greeting case",
    input: "Say hello.",
    expectedOutput: "Hello.",
  }],
});
assert.equal(evaluationWithCaseMetadata.dataRows[0].title, "Greeting");
assert.equal(evaluationWithCaseMetadata.dataRows[0].description, "Basic greeting case");
const evaluationWithUnknownCreator = normalizeOwnershipEvaluationSet({
  id: "evaluation_unknown_creator",
  userId: "resource_scope_user",
  organizationId: "organization_1",
});
assert.equal(evaluationWithUnknownCreator.creator.id, "");
assert.equal(evaluationWithUnknownCreator.creator.userId, "");
assert.equal(evaluationWithUnknownCreator.organizationId, "organization_1");
const evaluationWithKnownCreator = normalizeOwnershipEvaluationSet({
  id: "evaluation_known_creator",
  organizationId: "organization_1",
  createdByUserId: "creator_1",
});
assert.equal(evaluationWithKnownCreator.creator.userId, "creator_1");
assert.equal(evaluationWithKnownCreator.createdByUserId, "creator_1");
const historicalClientRun = normalizeClientEvaluationRun({
  id: "historical_run_1",
  evaluationId: "evaluation_1",
  versionId: "evaluation_version_2",
  averageScore: 0.75,
  passRate: 0.5,
  metadata: {
    run: {
      id: "historical_run_1",
      evaluationSetId: "evaluation_1",
      label: "Historical run",
      cases: [
        { id: "historical_case_1", score: 1, status: "passed" },
        { id: "historical_case_2", score: 0.5, status: "failed" },
      ],
    },
  },
});
assert.equal(historicalClientRun.evaluationSetId, "evaluation_1");
assert.equal(historicalClientRun.evaluationId, "evaluation_1");
assert.equal(historicalClientRun.evaluationVersionId, "evaluation_version_2");
assert.equal(historicalClientRun.label, "Historical run");
assert.equal(historicalClientRun.cases.length, 2);
assert.equal(historicalClientRun.totalCount, 2);
assert.equal(historicalClientRun.passedCount, 1);
assert.equal(historicalClientRun.averageScore, 0.75);
const {
  buildPlaygroundEvaluationScoreRows: buildClientEvaluationScoreRows,
} = new Function(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation
  + EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.runs
  + "; return { buildPlaygroundEvaluationScoreRows };",
)();
const clientScoreRows = buildClientEvaluationScoreRows([
  {
    id: "run_agent_a_1",
    status: "completed",
    targetAgentId: "agent_a",
    environmentId: "computer_1",
    averageScore: 0.5,
    completedAt: "2026-07-20T10:00:00.000Z",
  },
  {
    id: "run_agent_a_2",
    status: "failed",
    targetAgentId: "agent_a",
    environmentId: "computer_1",
    averageScore: 0.9,
    completedAt: "2026-07-21T10:00:00.000Z",
  },
  {
    id: "run_agent_b_1",
    status: "completed",
    targetAgentId: "agent_b",
    environmentId: "computer_2",
    averageScore: 0.8,
    completedAt: "2026-07-22T10:00:00.000Z",
  },
  {
    id: "run_agent_c_active",
    status: "running",
    targetAgentId: "agent_c",
    environmentId: "computer_3",
    averageScore: 1,
    completedAt: "2026-07-23T10:00:00.000Z",
  },
]);
assert.equal(clientScoreRows.length, 2);
assert.equal(clientScoreRows[0].latestRun.id, "run_agent_a_2");
assert.equal(clientScoreRows[0].latestScore, 0.9);
assert.equal(clientScoreRows[0].averageScore, 0.7);
assert.equal(clientScoreRows[0].runCount, 2);
assert.equal(clientScoreRows[1].latestRun.id, "run_agent_b_1");
const {
  getPlaygroundEvaluationCaseDisplayStatus,
} = new Function(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation
  + EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.formatting
  + "; return { getPlaygroundEvaluationCaseDisplayStatus };",
)();
assert.equal(
  getPlaygroundEvaluationCaseDisplayStatus({
    status: "error",
    score: 0,
    evaluatorParseStatus: "parsed_json",
    evaluatorOutput: '{"score":0,"reason":"The response did not satisfy the case."}',
  }, 0.8),
  "failed",
);
assert.equal(
  getPlaygroundEvaluationCaseDisplayStatus({
    status: "error",
    score: 0,
    evaluatorOutput: '{"score":0,"reason":"The response did not satisfy the case."}',
  }, 0.8),
  "failed",
);
assert.equal(
  getPlaygroundEvaluationCaseDisplayStatus({
    status: "error",
    score: 0,
    evaluatorParseStatus: "unparsed",
    evaluatorOutput: "Evaluator execution failed before returning a score.",
  }, 0.8),
  "error",
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables,
  /displayStatus === "error"[\s\S]*?\? "red"[\s\S]*?: "gray"/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs,
  /renderCaseKpi\("Status", React\.createElement\(PlatformLabel,[\s\S]*?variant: displayStatusVariant/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /hasData: hasRecordedChartData/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformAnalyticsSection, \{[\s\S]*?variant: "default"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /showXAxisLabels: Boolean\(run\)/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /timeframe:\s*run\s*\?/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /variant: run \? "framed"/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs,
  /evaluationDetailTab !== "cases"[\s\S]*?evaluationDetailTab !== "settings"[\s\S]*?React\.createElement\(PlatformSwitch,[\s\S]*?ariaLabel: "Evaluation analytics time frame"[\s\S]*?renderEvaluationPublishSplitButton\(\)/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables,
  /cell: \(\{ row: caseItem \}\) => renderEvaluationThreadButton\(caseItem\.threadId, caseItem\.threadId\)/,
);
const evaluationRunHistoryCacheApi = new Function(
  "createPlaygroundVersionController",
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation
  + EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versions
  + EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence
  + "; return { buildPlaygroundEvaluationRunHistoryCacheScope, readPlaygroundEvaluationRunHistoryCache, writePlaygroundEvaluationRunHistoryCache, resolvePlaygroundEvaluationRunHistorySnapshot };",
)(() => ({}));
const evaluationRunHistoryStorage = new Map();
const previousWindow = globalThis.window;
globalThis.window = {
  localStorage: {
    getItem: (key) => evaluationRunHistoryStorage.get(key) || null,
    setItem: (key, value) => evaluationRunHistoryStorage.set(key, value),
    removeItem: (key) => evaluationRunHistoryStorage.delete(key),
  },
};
try {
  const firstScope = evaluationRunHistoryCacheApi.buildPlaygroundEvaluationRunHistoryCacheScope({
    backendUrl: "https://api.example.test/v1",
    userId: "user_1",
    requestHeaders: { "x-organization-id": "organization_1" },
  });
  const secondScope = evaluationRunHistoryCacheApi.buildPlaygroundEvaluationRunHistoryCacheScope({
    backendUrl: "https://api.example.test/v1",
    userId: "user_1",
    requestHeaders: { "x-organization-id": "organization_2" },
  });
  assert.ok(firstScope);
  assert.notEqual(firstScope, secondScope);
  evaluationRunHistoryCacheApi.writePlaygroundEvaluationRunHistoryCache(firstScope, [{
    id: "evaluation_1",
    name: "Evaluation",
    runs: [historicalClientRun],
  }]);
  assert.equal(
    evaluationRunHistoryCacheApi.readPlaygroundEvaluationRunHistoryCache(firstScope).evaluation_1[0].id,
    "historical_run_1",
  );
  assert.deepEqual(evaluationRunHistoryCacheApi.readPlaygroundEvaluationRunHistoryCache(secondScope), {});
  evaluationRunHistoryCacheApi.writePlaygroundEvaluationRunHistoryCache(firstScope, [{
    id: "evaluation_1",
    name: "Evaluation",
    runs: [],
  }]);
  assert.deepEqual(
    evaluationRunHistoryCacheApi.readPlaygroundEvaluationRunHistoryCache(firstScope).evaluation_1,
    [],
  );
  const failedHistorySnapshot = evaluationRunHistoryCacheApi.resolvePlaygroundEvaluationRunHistorySnapshot({
    historyLoadSucceeded: false,
    backendSets: [{ id: "evaluation_1", name: "Evaluation" }],
    currentSets: [],
    cachedRunsBySet: { evaluation_1: [historicalClientRun] },
    backendRuns: [],
  });
  assert.deepEqual(failedHistorySnapshot.map((run) => run.id), ["historical_run_1"]);
  assert.deepEqual(
    evaluationRunHistoryCacheApi.resolvePlaygroundEvaluationRunHistorySnapshot({
      historyLoadSucceeded: true,
      backendSets: [{ id: "evaluation_1", name: "Evaluation" }],
      currentSets: [{ id: "evaluation_1", runs: [historicalClientRun] }],
      cachedRunsBySet: { evaluation_1: [historicalClientRun] },
      backendRuns: [],
    }),
    [],
  );
} finally {
  if (previousWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = previousWindow;
  }
}
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versions, /normalizePlaygroundEvaluationVersion/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versions, /stripPlaygroundEvaluationAccessMetadata/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versions, /"teamRolePermissionSets", "team_role_permission_sets"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versions, /dataRows,[\s\S]*?cases: dataRows/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /stripPlaygroundEvaluationVersionMetadata\(normalizedSet\.metadata\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /function deduplicatePlaygroundEvaluationSets\(sets\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /metadata\.clientRequestId[\s\S]*?metadata\.client_request_id/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /evaluationId: normalizedRun\.evaluationSetId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /evaluationId: normalizedSetId,[\s\S]*?evaluationSetId: normalizedSetId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.execution, /startPlaygroundEvaluationCaseThread/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /handleGenerateEvaluationCasesFromThreads/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.sourceThreads, /agentAvatarUrl: String\(/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /function finishCloseEvaluationThreadCaseModal/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /function openEvaluationJsonlWorkspacePicker/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /React\.createElement\(PlatformFileExplorerBrowserModal/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /buildPlaygroundEnvironmentDownloadUrl\(backendUrl, environmentId, entry\.path\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /evaluationThreadCaseModalOpen/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /buildPlaygroundEnvironmentFilesListUrl\(backendUrl, environmentId, "", -1\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /evaluationRunHistoryLoadedRef = useRef\(new Set\(\)\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /Failed to hydrate evaluation run history/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /function buildPlaygroundEvaluationRunHistoryCacheScope/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /function writePlaygroundEvaluationRunHistoryCache/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence, /function resolvePlaygroundEvaluationRunHistorySnapshot/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /readPlaygroundEvaluationRunHistoryCache\(evaluationRunHistoryCacheScopeKey\)/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /\.catch\(\(\) => \(\{ runs: \[\] \}\)\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /evaluationDetailEntryHydrationRef = useRef\(""\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /reloadBackendEvaluationRunHistory\(normalizedSetId\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.runHistory, /async function reloadBackendEvaluationRunHistory/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.runHistory, /requestBackendEvaluationRunHistory\([\s\S]*?maxAttempts: Math\.max\(1, Number\(options\.maxAttempts\) \|\| 3\)/);
assert.doesNotMatch(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup,
  /evaluationDetailsLoadedRef\.current\.has\(normalizedSetId\)\s*&&\s*evaluationRunHistoryLoadedRef\.current\.has\(normalizedSetId\)/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /!evaluationDetailsLoadedRef\.current\.has\(normalizedSet\.id\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /return Array\.isArray\(normalizedSet\.dataRows\) \? normalizedSet\.dataRows\.length : 0/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /function hasEvaluationDraftChanges/);
assert.doesNotMatch(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions,
  /evaluationVersionDraftTouchedRef\.current\s*=\s*true/,
);
assert.doesNotMatch(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.editors,
  /evaluationVersionDraftTouchedRef\.current\s*=\s*true/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.editors, /function upsertEvaluationRun\(setId, run\)/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.editors, /\bsetPatch\b/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /upsertEvaluationRun\(targetSet\.id, run\);/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /upsertEvaluationRun\(runSetId, run\);/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /renderRunsTable/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /className: "playground-evaluation-runs-platform-table playground-evaluations-runs-section"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /variant: "minimalistic-ui"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /evaluationRunsTableMode, setEvaluationRunsTableMode\] = useState\("runs"\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /selectedEvaluationRunIds, setSelectedEvaluationRunIds\] = useState\(\(\) => new Set\(\)\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformDetailTabBar,[\s\S]*?\{ id: "runs", label: "Runs" \}[\s\S]*?\{ id: "scores", label: "Scores" \}/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /rows: tableRows,[\s\S]*?pagination: \{\}/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /selection: tableMode === "runs"[\s\S]*?enabled: true[\s\S]*?setSelectedEvaluationRunIds\(new Set\(selectedIds\)\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /label: "Delete selected"[\s\S]*?handleDeleteEvaluationRuns\(set\.id, targetRuns\.map/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /function handleDeleteEvaluationRuns\(setId, runIds\)[\s\S]*?Promise\.allSettled/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /header: "Agent"[\s\S]*?header: "Environment"[\s\S]*?header: "Latest Score"[\s\S]*?header: "Avg Score"[\s\S]*?header: "Runs"[\s\S]*?header: "Date"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /defaultValue: tableMode === "scores"[\s\S]*?\{ id: "latestScore", direction: "desc" \}/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.runs, /function buildPlaygroundEvaluationScoreRows/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.runs, /\["completed", "completed_with_errors", "failed"\]\.includes\(run\.status\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformSecondaryButton, \{[\s\S]*?From Threads/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformButtonSelector, \{[\s\S]*?mode: "split-action"[\s\S]*?buttonVariant: "primary"[\s\S]*?onAction: \(\) => openNewEvaluationCaseEditor\(set\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /"Upload JSONL file"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /"Upload from Workspace"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformEmptyState, \{[\s\S]*?title: "No cases yet"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /renderEvaluationAccessSettings/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /React\.createElement\(PlatformResourceAccessSettings/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /type:\s*"checkbox"|playground-agents-overview-select-checkbox/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /subjectType: "evaluation"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /resourceType: "evaluation"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /getPlatformTeamRolePermissionSet/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /buildPlatformTeamRolePermissionMetadata/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /renderEvaluationOwnerSelector/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /\bteamPageTeams\b/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /\bteamPageLoading\b/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /\bloadTeamPageData\b/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /workspaceTeams = \[\]/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /organizations = \[\]/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /activeOrganizationId = ""/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /evaluationOrganizationOwnerStateById/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /onWorkspaceTeamsRequest/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /workspaceTeams: teamPageTeams/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /organizations: organizationPageOrganizations/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /activeOrganizationId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /getEvaluationOrganizationOwnerIdentity/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /currentOrganizationRole === "owner"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /"\/organizations\/" \+ encodeURIComponent\(organizationId\) \+ "\/members"/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access,
  /if \(hasEvaluationPersonIdentity\(creator\)\) return creator;[\s\S]*?return getEvaluationOrganizationOwnerIdentity\(set\);/,
);
assert.doesNotMatch(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access,
  /set\?\.creator \|\| set\?\.createdBy \|\| currentEvaluationCreator/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /teams: evaluationSharedTeams/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /teamSubjectType: "evaluation_team_role"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /selectedRoleId: evaluationAccessRoleId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /renderEvaluationRenameModal/);
const evaluationRunModalStart = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf("function renderRunModal()");
const evaluationRunModalEnd = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf("function renderCreateModal()", evaluationRunModalStart);
assert.ok(evaluationRunModalStart >= 0 && evaluationRunModalEnd > evaluationRunModalStart);
const evaluationRunModalScript = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.slice(
  evaluationRunModalStart,
  evaluationRunModalEnd,
);
assert.match(evaluationRunModalScript, /React\.createElement\(PlatformModal/);
assert.match(evaluationRunModalScript, /title: "Run Evaluation"[\s\S]*?headerVariant: "search"/);
assert.match(evaluationRunModalScript, /headerSearchProps: \{[\s\S]*?icon: Play[\s\S]*?value: form\.name/);
assert.match(evaluationRunModalScript, /surfaceProps: \{ onSubmit: handleConfirmRunEvaluation \}/);
assert.match(evaluationRunModalScript, /React\.createElement\(PlatformSecondaryButton/);
assert.match(evaluationRunModalScript, /React\.createElement\(PlatformPrimaryButton/);
assert.match(evaluationRunModalScript, /React\.createElement\(PlatformSelector/);
assert.match(evaluationRunModalScript, /getEvaluationRunnableCaseCount\(targetSet\) > 0/);
assert.match(evaluationRunModalScript, /className: "playground-tasks-detail-central-selector"/);
assert.doesNotMatch(evaluationRunModalScript, /React\.createElement\("select"/);
assert.doesNotMatch(evaluationRunModalScript, /React\.createElement\(PlatformModal(?:Backdrop|Surface)/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.dialogs, /\.playground-evaluations-run-modal \.playground-evaluations-run-modal-settings \{[\s\S]*?padding: 0;[\s\S]*?border: 0;[\s\S]*?background: transparent;[\s\S]*?backdrop-filter: none;/);
const evaluationCreateModalStart = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf("function renderCreateModal()");
const evaluationCreateModalEnd = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf("const isEvaluationRunPage", evaluationCreateModalStart);
assert.ok(evaluationCreateModalStart >= 0 && evaluationCreateModalEnd > evaluationCreateModalStart);
const evaluationCreateModalScript = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.slice(
  evaluationCreateModalStart,
  evaluationCreateModalEnd,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /function renderCreateModal\(\)[\s\S]*?React\.createElement\(PlatformModal/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /title: "New Evaluation"[\s\S]*?surfaceProps: \{ onSubmit: handleCreateEvaluation \}/);
assert.match(evaluationCreateModalScript, /headerVariant: "search"/);
assert.match(evaluationCreateModalScript, /headerSearchProps: \{[\s\S]*?icon: ChartColumnIncreasing[\s\S]*?value: form\.name/);
assert.match(evaluationCreateModalScript, /className: "playground-new-issue-modal playground-evaluations-create-modal"/);
assert.match(evaluationCreateModalScript, /React\.createElement\(PlatformSelector/);
assert.match(evaluationCreateModalScript, /ariaLabel: "Select evaluator type"/);
assert.match(evaluationCreateModalScript, /ariaLabel: "Select evaluator agent"/);
assert.match(evaluationCreateModalScript, /"Evaluator information"/);
assert.match(evaluationCreateModalScript, /"Pass threshold information"/);
assert.match(evaluationCreateModalScript, /Controls how each result is scored/);
assert.doesNotMatch(evaluationCreateModalScript, /React\.createElement\((?:Bot|Equal|Code2)/);
assert.doesNotMatch(evaluationCreateModalScript, /React\.createElement\("select"/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.dialogs, /\.playground-evaluations-create-modal\.platform-modal-surface \{[\s\S]*?display: flex;[\s\S]*?flex-direction: column;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.dialogs, /\.playground-evaluations-create-modal-body\.platform-modal-body \{[\s\S]*?overflow-y: auto;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.dialogs, /\.playground-evaluations-create-threshold-input \{[\s\S]*?width: 50px;[\s\S]*?text-align: right;/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /function openEvaluationCreateModal\(\)[\s\S]*?setEvaluationCreateModalOpen\(true\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /function openRunEvaluationModal\(setId, options = \{\}\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /set: loadedSet,[\s\S]*?skipHydration: true/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /hasDraftChanges && options\.skipUnsavedPrompt !== true[\s\S]*?setEvaluationUnsavedRunDialog/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /function runEvaluationWithoutDraftChanges\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /async function saveEvaluationChangesBeforeRun\(\)[\s\S]*?saveAndPublishCurrentEvaluationVersion/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /Snapshot created automatically for/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /evaluationSet: runnableSet/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /evaluationRunSubmittingRef\.current = true/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /evaluationCreateSubmittingRef\.current = true;[\s\S]*?setEvaluationCreateSubmitting\(true\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /evaluationCreateRequestIdRef\.current = createPlaygroundEvaluationId\("eval_create"\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /clientRequestId: creationRequestId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /if \(evaluationCreateAttemptedRef\.current\)[\s\S]*?"\/evaluations\?limit=500"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /setEvaluationSets\(\(current\) => deduplicatePlaygroundEvaluationSets/);
assert.match(evaluationCreateModalScript, /"aria-busy": evaluationCreateSubmitting \|\| undefined/);
assert.match(evaluationCreateModalScript, /playground-evaluations-create-submit-spinner/);
assert.match(evaluationCreateModalScript, /evaluationCreateSubmitting \? "Creating\.\.\." : "Create Evaluation"/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /setEvaluationSetRowMenuId|setEvaluationSetsToolbarPopover/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /function renderEvaluationThreadCaseModal\(\)[\s\S]*?React\.createElement\(PlatformModal/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /React\.createElement\(PlatformDataTable/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /variant: "minimalistic-ui"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /header: "Title"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /header: "Agent"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /header: "Time"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /selection: \{[\s\S]*?enabled: true/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /pagination: \{[\s\S]*?pageSize: 10/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /headerActions: React\.createElement\(PlatformSearch, \{[\s\S]*?placeholder: "Search threads"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /\.slice\(0, 40\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /width: "min\(760px, calc\(100vw - 32px\)\)"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /playground-evaluations-thread-picker-agent-cell[\s\S]*?playground-evaluations-run-agent-avatar/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /playground-evaluations-thread-picker-cell is-title/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /refreshThreadsForPicker|playground-evaluations-thread-picker-status-line/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /footer: React\.createElement\(React\.Fragment[\s\S]*?"Cancel"[\s\S]*?"Refine Cases"/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /Select historical threads\. An agent will analyze/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /playground-evaluations-thread-picker-list/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /playground-evaluations-run-action/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /onRefreshThreadRecords: \(\) => refreshThreads\(40,/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /function renderEvaluationDatasetCaseDetail\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /React\.createElement\(EvaluationCaseDetailPage/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /React\.createElement\(PlatformCodeEditorWorkspace/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /id: "input"[\s\S]*?label: "Input"[\s\S]*?editorMode: "markdown"[\s\S]*?id: "expectedOutput"[\s\S]*?label: "Expected Output"[\s\S]*?editorMode: "markdown"[\s\S]*?id: "evaluationGuidance"[\s\S]*?label: "Evaluator Guidance"[\s\S]*?editorMode: "markdown"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /markdownEditor: \{[\s\S]*?historyKey: "evaluation-case:" \+ draft\.id \+ ":" \+ activeFileId/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /evaluationCaseCodeEditorComponent|React\.createElement\(PlatformInstructionsEditor/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /React\.createElement\("section", \{[\s\S]*?className: "playground-evaluations-dataset-case-configuration"/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail,
  /className: "playground-evaluations-dataset-case-settings-title",[\s\S]*?"Case Settings"[\s\S]*?className: "playground-evaluations-dataset-case-configuration"/,
);
assert.match(
  EVALUATIONS_STYLE_FRAGMENTS.detail,
  /\.playground-evaluations-dataset-case-settings-title \{[\s\S]*?color: #fff;[\s\S]*?font-size: 14px;[\s\S]*?font-weight: 400;/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /React\.createElement\(PlatformPermissionHelpTooltip,[\s\S]*?ariaLabel: "About optimization role"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /React\.createElement\(PlatformPermissionHelpTooltip,[\s\S]*?ariaLabel: "About runs per evaluation"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /title: typeof row\?\.title === "string" \? row\.title : normalized\.title/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /description: typeof row\?\.description === "string" \? row\.description : normalized\.description/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /handleEvaluationCaseSaveShortcut[\s\S]*?saveEvaluationCaseEditor\(event\)[\s\S]*?addEventListener\("keydown", handleEvaluationCaseSaveShortcut, true\)/);
const {
  buildEvaluationCaseEditorDraft: buildClientEvaluationCaseEditorDraft,
} = new Function(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation
  + EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases
  + "; return { buildEvaluationCaseEditorDraft };",
)();
const whitespacePreservingCaseDraft = buildClientEvaluationCaseEditorDraft({
  title: "Case title ",
  description: "Case description ",
});
assert.equal(whitespacePreservingCaseDraft.title, "Case title ");
assert.equal(whitespacePreservingCaseDraft.description, "Case description ");
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /ariaLabel: "Select case optimization role"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /value: "train"[\s\S]*?value: "validation"[\s\S]*?value: "holdout"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /normalizedMode === "dataset-case" \? renderEvaluationDatasetCaseDetail\(\)/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /renderEvaluationCaseEditorModal\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /isEvaluationDatasetCasePage && evaluationTopNavActionsContainer[\s\S]*?"Save Changes"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /function openEvaluationCaseEditor[\s\S]*?setEvaluationsPageMode\("dataset-case"\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /function saveEvaluationCaseEditor/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /isEvaluationCaseEditorDirty\(evaluationCaseEditorState\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail, /React\.createElement\(PlatformUiCard/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.datasetCaseDetail,
  /React\.createElement\(PlatformPrimaryButton, \{[\s\S]*?className: "playground-evaluations-dataset-case-delete-button"[\s\S]*?"Delete Case"/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /function renderEvaluationCaseGuidanceTitle/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /Evaluator guidance information/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /const normalizedRunEvaluator = normalizePlaygroundEvaluationEvaluator\(run\?\.evaluator\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /normalizedRunEvaluator\.type === "agent" && !normalizedRunEvaluator\.agentId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /accessor: \(\) => runEvaluatorLabel/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /cell: \(\) => renderRunEvaluatorCell\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /getPlaygroundEvaluationOptimizationRoleLabel\(optimizationRole\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /React\.createElement\(PlatformVersionHistorySidebar/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /React\.createElement\(PlatformVersionPublishControl/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /React\.createElement\(PlatformVersionSaveDialog/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /React\.createElement\(PlaygroundVersionSidebar/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /function saveAndPublishCurrentEvaluationVersion/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /buildPublishVersionResource\([\s\S]*?replaceEvaluationSet\(publishResult\.resource/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /preserveDirtyDraft: false/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /requiredVersionId: version\.id/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /return updatedSet \|\| committedSet/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /const canApplyDetailedSet = !requiredVersionId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /if \(!canApplyDetailedSet\) \{[\s\S]*?return null;/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /openEvaluationVersionSaveDialog\(\{ mode: "current" \}\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /options\.persist === true \|\| \(options\.persist !== false && options\.markVersionTouched === false\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /function discardUnsavedEvaluationDraft\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionActions, /function returnToEvaluationsOverview\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /id: "evaluation-details-unsaved-changes"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /const \[evaluationUnsavedRunDialog, setEvaluationUnsavedRunDialog\] = useState\(null\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /onDiscard: discardUnsavedEvaluationDraft/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /const detailHeader =/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /const handleEvaluationDetailTabChange =/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /\bsidebarToggle,\s*\n\s*sidebarCollapsed: evaluationDetailSidebarCollapsed/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views,
  /return React\.createElement\(EvaluationDetailPage, \{\s*properties,\s*sidebarCollapsed: evaluationDetailSidebarCollapsed,\s*\},\s*detailContent/,
);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(PlatformVersionLabel/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(EvaluationsOverviewPage/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /onDeleteMany: \(sets\) => handleDeleteEvaluations\(sets\.map\(\(set\) => set\.id\)\)/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(PlatformDataTable/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(EvaluationDetailPage/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /className: "playground-content-title playground-evaluations-title-input",[\s\S]{0,160}?size:/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationDetailSidebarRow\("pass-threshold"/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views,
  /React\.createElement\(PlatformPrimaryButton, \{[\s\S]*?className: "playground-evaluations-detail-run-button"[\s\S]*?openRunEvaluationModal\(activeSet\.id\)[\s\S]*?"Run Evaluation"/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views,
  /className: "playground-evaluations-detail-run-button"[\s\S]*?disabled: getEvaluationRunnableCaseCount\(activeSet\) === 0/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /variant: "run"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /ariaLabel: "Evaluation run details"/);
const evaluationRunViewStart = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views.indexOf("function renderRun()");
assert.ok(evaluationRunViewStart >= 0);
const evaluationRunViewScript = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views.slice(evaluationRunViewStart);
assert.doesNotMatch(evaluationRunViewScript, /playground-evaluations-run-title/);
assert.doesNotMatch(evaluationRunViewScript, /\bheader:/);
assert.doesNotMatch(evaluationRunViewScript, /\bactiveTab:/);
assert.doesNotMatch(evaluationRunViewScript, /\bsidebarToggle:/);
assert.doesNotMatch(evaluationRunViewScript, /renderEvaluationDetailSidebarRow\("evaluation"/);
assert.doesNotMatch(evaluationRunViewScript, /renderEvaluationDetailSidebarRow\("version"/);
assert.match(evaluationRunViewScript, /className: "playground-evaluations-run-agent-version-cell"/);
assert.match(evaluationRunViewScript, /variant: "gray",\s*className: "playground-evaluations-run-agent-version-label"/);
assert.doesNotMatch(evaluationRunViewScript, /"Legacy evidence"/);
assert.match(
  evaluationRunViewScript,
  /evidenceLabel[\s\S]*?\? React\.createElement\(PlatformLabel,[\s\S]*?: null,[\s\S]*?React\.createElement\("p", null, evidenceExplanation\)/,
);
assert.match(evaluationRunViewScript, /renderEvaluationDetailSidebarRow\("environment"[\s\S]*?className: "is-environment"/);
assert.match(
  evaluationRunViewScript,
  /renderEvaluationDetailSidebarRow\("completed"[\s\S]*?renderEvaluationDetailSidebarRow\("agent"[\s\S]*?className: "is-agent-version playground-evaluations-run-agent-property"/,
);
assert.match(
  evaluationRunViewScript,
  /React\.createElement\(PlatformPrimaryButton, \{[\s\S]*?className: "playground-evaluations-run-again-button"[\s\S]*?openRunEvaluationModal\(activeSet\.id\)[\s\S]*?"Run Again"/,
);
assert.doesNotMatch(
  evaluationRunViewScript,
  /const runActions|actions: runActions|playground-evaluations-detail-sidebar-actions|playground-evaluations-detail-sidebar-action/,
);
assert.doesNotMatch(evaluationRunViewScript, /handleDeleteEvaluationRun/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationDetailSidebarRow\("environment"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationAccessSettings\(\)/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views,
  /activeDetailTab === "cases"[\s\S]*?renderEvaluationGuidanceEditor\(activeSet\),[\s\S]*?renderDataTable\(activeSet\)/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views,
  /activeDetailTab === "settings"[\s\S]*?renderEvaluationDescriptionEditor\(activeSet\),[\s\S]*?renderEvaluationAccessSettings\(\)/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationOwnerSelector\(activeSet\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(PlatformSelector, \{[\s\S]*?ariaLabel: "Choose evaluator agent"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /evaluator: \{[\s\S]*?type: "agent",[\s\S]*?agentId: nextAgentId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformAnalyticsSection/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /variant: "default"/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformAttachments/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /function renderEvaluationImportsSection\(set\)/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationImportsSection\(activeSet\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /accept: "\.jsonl,application\/x-ndjson,application\/jsonl"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /onClick: openEvaluationJsonlFilePicker/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /onClick: \(\) => openEvaluationJsonlWorkspacePicker\(set\)/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables,
  /function renderDataTable\(set\)[\s\S]*?React\.createElement\(PlatformDataTable, \{[\s\S]*?ariaLabel: "Evaluation dataset cases"[\s\S]*?variant: "minimalistic-ui"/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables,
  /ariaLabel: "Evaluation dataset cases"[\s\S]*?toolbar: \{[\s\S]*?title: "Cases"[\s\S]*?trailing: caseToolbarActions/,
);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /playground-evaluations-case-preview-list/);
assert.match(
  EVALUATIONS_STYLE_FRAGMENTS.tables,
  /\.playground-evaluations-dataset-cases-platform-table \{[\s\S]*?--platform-data-table-surface: transparent;/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /title: "No evaluation runs yet"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /title: "Run history is unavailable"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /icon: ChartColumnIncreasing/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /ariaLabel: "Evaluation cases"[\s\S]*?variant: "minimalistic-ui"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /title: "No evaluation cases yet"/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /evaluationCasesToolbarPopover/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /renderEvaluationJsonlWorkspacePicker\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /function renderEvaluationUnsavedRunDialog\(\)[\s\S]*?React\.createElement\(PlatformModal/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /"Run Without Changes"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /"Save & Continue"/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.dialogs, /\.playground-evaluations-unsaved-run-copy \{[\s\S]*?font-size: 12px;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-detail-sidebar-row\.is-owner \{[\s\S]*?margin-top: 12px;[\s\S]*?padding-top: 12px;[\s\S]*?border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-detail-sidebar-row\.playground-evaluations-run-agent-property \{[\s\S]*?margin-top: 12px;[\s\S]*?padding-top: 12px;[\s\S]*?border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-run-again-button\.platform-button \{[\s\S]*?width: 100%;[\s\S]*?margin-top: 12px;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-thread-case-modal \{[\s\S]*?display: flex;[\s\S]*?flex-direction: column;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-thread-picker-table \.platform-data-table__scroll \{[\s\S]*?overflow-y: auto;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-thread-picker-table\.platform-data-table,[\s\S]*?background: transparent !important;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-thread-picker-cell\.is-title,[\s\S]*?color: #fff;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-title-input \{[\s\S]*?width: 100%;[\s\S]*?flex: 1 1 auto;/);
assert.match(EVALUATIONS_STYLE_FRAGMENTS.detail, /\.playground-evaluations-detail-evaluator-trigger\.platform-selector__trigger \{[\s\S]*?background: transparent;/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /React\.createElement\(PlatformInstructionsEditor/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /function renderEvaluationDescriptionEditor/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationDescriptionEditor\(activeSet\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /variant: "minimalistic-ui"/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /renderToolbarButton|playground-evaluations-case-editor-markdown-section/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /type: "text"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /inputMode: "decimal"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /playground-evaluations-pass-threshold-input/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail,
  /function renderEvaluationGuidanceEditor\(set\)[\s\S]*?variant: "minimalistic-ui"[\s\S]*?className: "playground-evaluations-dataset-guidance-section"/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail,
  /function renderEvaluationDatasetGuidanceTitle\(\)[\s\S]*?Dataset Evaluator Guidance[\s\S]*?aria-label": "Dataset evaluator guidance information"[\s\S]*?role: "tooltip"/,
);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail,
  /function renderEvaluationDescriptionEditor\(set\)[\s\S]*?variant: "minimalistic-ui"[\s\S]*?className: "playground-evaluations-description-section"/,
);
assert.match(
  EVALUATIONS_STYLE_FRAGMENTS.tables,
  /playground-evaluations-description-section \.platform-instructions-editor__title,[\s\S]*?font-size: 14px !important/,
);

assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.state, /evaluationSets/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openEvaluationsPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openEvaluationDetailPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /setSelectedEvaluationRunId\(""\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /setSelectedEvaluationCaseId\(""\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyCapture, /evaluationRunId/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "evaluations"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.lifecycle, /selectedEvaluationSetId/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderEvaluationsPageNav/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Evaluations",[\s\S]*?onClick: \(\) => requestPlatformNavigation\(openEvaluationsOverviewPage\)/);
assert.match(
  EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation,
  /if \(!isEvaluationDatasetCase\) \{[\s\S]*?evaluationsPathItems\.push\(\{[\s\S]*?label: "Evaluations"/,
);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /evaluationsPageMode === "run" \|\| evaluationsPageMode === "case"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /onClick: evaluationsPageMode === "run" \|\| evaluationsPageMode === "case" \|\| isEvaluationDatasetCase[\s\S]*?requestPlatformNavigation/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /setSelectedEvaluationCaseId\(""\);[\s\S]*?setEvaluationsPageMode\("run"\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /evaluationsPathItems\.push\(\{ label: activeEvaluationCaseTitle \}\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /evaluationsPathItems\.push\(\{ label: activeEvaluationDatasetCaseTitle \}\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-evaluations-overview-controls/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformVersionLabel/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /setEvaluationVersionsSidebarRequestToken/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /id: "playground-evaluations-breadcrumb-actions"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /id: "playground-evaluation-run-breadcrumb-actions"/);
assert.match(
  EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation,
  /center: isEvaluationDatasetCase[\s\S]*?\{ value: "code", label: "Code" \},[\s\S]*?\{ value: "settings", label: "Settings" \},[\s\S]*?showEvaluationSetActions[\s\S]*?\{ value: "general", label: "General" \},[\s\S]*?\{ value: "cases", label: "Cases" \},[\s\S]*?\{ value: "settings", label: "Settings" \},[\s\S]*?ariaLabel: "Evaluation section"/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /setEvaluationDetailTab\("cases"\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /function handleDeleteEvaluations\(setIds\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.actions, /Promise\.allSettled\(normalizedSetIds\.map/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /function renderEvaluationsPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /versionsSidebarRequestToken: evaluationVersionsSidebarRequestToken/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /breadcrumbActionsPortalId: evaluationsPageMode === "detail"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /evaluationsPageMode === "run"[\s\S]*?"playground-evaluation-run-breadcrumb-actions"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /evaluationsPageMode === "dataset-case"[\s\S]*?"playground-evaluation-case-nav-actions"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /onNavigationGuardChange: registerPlatformNavigationGuard/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /onNavigationRequest: requestPlatformNavigation/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "evaluations"/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs,
  /const breadcrumbActionsPortal = evaluationBreadcrumbActionsContainer[\s\S]*?React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal"/,
);
const evaluationTopNavPortalScript = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.slice(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf("const rightActionsPortal"),
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf("const breadcrumbActionsPortal"),
);
assert.doesNotMatch(evaluationTopNavPortalScript, /playground-evaluations-run-action|Run Evaluation/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /"Evaluation ID"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /"Version History"/);
const evaluationRunBreadcrumbMenuStart = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf(
  "isEvaluationRunActionsPage\n                  ? React.createElement(PlatformPopup",
);
assert.ok(evaluationRunBreadcrumbMenuStart >= 0);
const evaluationRunBreadcrumbMenuEnd = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.indexOf(
  ": React.createElement(PlatformPopup",
  evaluationRunBreadcrumbMenuStart,
);
assert.ok(evaluationRunBreadcrumbMenuEnd > evaluationRunBreadcrumbMenuStart);
const evaluationRunBreadcrumbMenuScript = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs.slice(
  evaluationRunBreadcrumbMenuStart,
  evaluationRunBreadcrumbMenuEnd,
);
assert.match(evaluationRunBreadcrumbMenuScript, /variant: "minimal"/);
assert.match(evaluationRunBreadcrumbMenuScript, /"aria-label": "Evaluation run actions"/);
assert.match(evaluationRunBreadcrumbMenuScript, /React\.createElement\(Ellipsis,/);
assert.match(evaluationRunBreadcrumbMenuScript, /handleDeleteEvaluationRun\(activeSet\.id, activeRun\.id\)/);
assert.match(evaluationRunBreadcrumbMenuScript, /"Delete Run"/);
assert.doesNotMatch(evaluationRunBreadcrumbMenuScript, /"Rename"|"Run Evaluation"|"Version History"/);

assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.props, /evaluationSets/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.refs, /agentEvaluationRunModal/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.state, /agentDetailEvaluation/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.lifecycle, /agentDetailEvaluationRunModalOpen/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /agentEvaluationSets/);
assert.equal(
  EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view.match(/variant: "minimalistic-ui"/g)?.length,
  2,
);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /controlsLeading: React\.createElement\(PlatformSecondaryButton/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /leading: agentInsightsTableTabs/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /React\.createElement\(PlatformEmptyState/);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /title: "No evaluations yet"/);
assert.doesNotMatch(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /primaryAction:\s*\{[\s\S]{0,300}Run Evaluation/);
assert.equal(
  EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view.match(/pagination: \{\}/g)?.length,
  2,
);
assert.match(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.modal, /renderAgentEvaluationRunModal/);
const agentEvaluationRunModalStart = EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view.indexOf("function renderAgentEvaluationRunModal()");
const agentEvaluationRunModalEnd = EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view.indexOf("function renderAgentEvaluationListSection()", agentEvaluationRunModalStart);
assert.ok(agentEvaluationRunModalStart >= 0 && agentEvaluationRunModalEnd > agentEvaluationRunModalStart);
const agentEvaluationRunModalScript = EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view.slice(
  agentEvaluationRunModalStart,
  agentEvaluationRunModalEnd,
);
assert.match(agentEvaluationRunModalScript, /React\.createElement\(PlatformModal/);
assert.match(agentEvaluationRunModalScript, /surfaceProps: \{ onSubmit: handleAgentEvaluationRunSubmit \}/);
assert.match(agentEvaluationRunModalScript, /React\.createElement\(PlatformSecondaryButton/);
assert.match(agentEvaluationRunModalScript, /React\.createElement\(PlatformSelector/);
assert.doesNotMatch(agentEvaluationRunModalScript, /React\.createElement\("select"/);
assert.doesNotMatch(agentEvaluationRunModalScript, /React\.createElement\(PlatformModal(?:Backdrop|Surface)/);
assert.match(EVALUATIONS_AGENT_STYLE_FRAGMENTS.page, /playground-agents-detail-evaluations-section/);

const platformEntrySource = await readPlatformCompositionSource();
const evaluationRuntimeSource = await fs.readFile(
  new URL("./server/runtime.mjs", import.meta.url),
  "utf8",
);

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/evaluations\/index\.mjs"/);
assert.match(platformEntrySource, /const evaluationsService = createEvaluationsService\(/);
assert.match(platformEntrySource, /evaluationsService\.handleRequest\(req, res, url\)/);
assert.match(
  platformEntrySource,
  /\$\{PLAYGROUND_EVALUATIONS_CSS \+ PLAYGROUND_TESTS_CSS \+ PLAYGROUND_ASSURANCE_CSS\}/,
);
assert.match(platformEntrySource, /\$\{PLAYGROUND_EVALUATIONS_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{EVALUATIONS_APP_SCRIPT_FRAGMENTS\.pageView\}/);
assert.match(platformEntrySource, /\$\{EVALUATIONS_AGENT_SCRIPT_FRAGMENTS\.view\}/);
assert.doesNotMatch(platformEntrySource, /playground-evaluations-page\.mjs/);
assert.doesNotMatch(platformEntrySource, /playground-evaluations-runtime\.mjs/);
assert.doesNotMatch(platformEntrySource, /function openEvaluationsPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderEvaluationsPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderEvaluationsPageNav\(/);
assert.doesNotMatch(platformEntrySource, /const playgroundEvaluationsRuntime/);
assert.match(evaluationRuntimeSource, /async function resolveEvaluationGuardrailTarget/);
assert.match(
  evaluationRuntimeSource,
  /\/guardrails\/\$\{encodeURIComponent\(guardrailId\)\}\/evaluation-target/,
);
assert.match(
  evaluationRuntimeSource,
  /You do not have permission to evaluate this guardrail\./,
);
assert.doesNotMatch(
  evaluationRuntimeSource,
  /catch \(error\) \{\s*if \(!providedSnapshot\) throw error;\s*\}/,
);
assert.match(evaluationRuntimeSource, /guardrail: record\.targetGuardrail \|\| null/);
assert.match(evaluationRuntimeSource, /buildProxyPromptAdaptationsFromGuardrails\(explicitGuardrails\)/);
assert.match(evaluationRuntimeSource, /targetGuardrail = await resolveEvaluationGuardrailTarget/);
assert.match(evaluationRuntimeSource, /createEvaluationRunPersistenceCoordinator/);
assert.match(evaluationRuntimeSource, /await runPersistence\.enqueue\(record, executionRun\)/);
assert.match(evaluationRuntimeSource, /await ensureRunPersisted\(record\)/);
assert.match(evaluationRuntimeSource, /acquireRunLease/);
assert.match(evaluationRuntimeSource, /heartbeatRunLease/);
assert.match(evaluationRuntimeSource, /evaluation_execution_snapshot_v1/);
assert.match(evaluationRuntimeSource, /findExistingEvaluationThread/);
assert.match(evaluationRuntimeSource, /executeThreadMessageOnce/);

const {
  mergePlaygroundEvaluationRunHistory: mergeClientEvaluationRunHistory,
  normalizePlaygroundEvaluationSet: normalizeClientEvaluationSet,
} = new Function(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation
    + EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.persistence
    + "; return { mergePlaygroundEvaluationRunHistory, normalizePlaygroundEvaluationSet };",
)();
const runHistoryNow = Date.parse("2026-07-23T12:00:00.000Z");
const mergedClientRunHistory = mergeClientEvaluationRunHistory(
  normalizeClientEvaluationSet({
    id: "evaluation_history",
    runs: [
      {
        id: "run_current",
        evaluationSetId: "evaluation_history",
        status: "running",
        createdAt: "2026-07-23T11:59:00.000Z",
      },
      {
        id: "run_recent_local",
        evaluationSetId: "evaluation_history",
        status: "completed",
        createdAt: "2026-07-23T11:58:00.000Z",
      },
      {
        id: "run_stale_local",
        evaluationSetId: "evaluation_history",
        status: "completed",
        createdAt: "2026-07-20T11:58:00.000Z",
      },
    ],
  }),
  [{
    id: "run_current",
    evaluationSetId: "evaluation_history",
    status: "completed",
    averageScore: 1,
    createdAt: "2026-07-23T11:59:00.000Z",
  }],
  { nowMs: runHistoryNow },
);
assert.deepEqual(
  mergedClientRunHistory.runs.map((run) => run.id),
  ["run_current", "run_recent_local"],
);
assert.equal(mergedClientRunHistory.runs[0].status, "completed");
assert.equal(mergedClientRunHistory.runs[0].averageScore, 1);

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
  targetGuardrailId: "guardrail_1",
  targetGuardrailVersionId: "guardrail_version_1",
});
assert.equal(evaluationRun.id, "run_1");
assert.equal(evaluationRun.evaluationSetId, "evaluation_1");
assert.equal(evaluationRun.cases.length, 2);
assert.equal(evaluationRun.status, "running");
assert.equal(evaluationRun.targetGuardrailId, "guardrail_1");
assert.equal(evaluationRun.targetGuardrailVersionId, "guardrail_version_1");
assert.match(evaluationRun.datasetFingerprint, /^sha256:[a-f0-9]{64}$/);
assert.match(evaluationRun.evaluatorFingerprint, /^sha256:[a-f0-9]{64}$/);
assert.match(evaluationRun.systemFingerprint, /^sha256:[a-f0-9]{64}$/);
assert.match(evaluationRun.runFingerprint, /^sha256:[a-f0-9]{64}$/);
assert.equal(evaluationRun.datasetVersion, evaluationRun.datasetFingerprint);
assert.equal(evaluationRun.systemSnapshot?.agent?.configurationFingerprint, "");
assert.equal(evaluationRun.systemSnapshot?.sampling, null);
const equivalentEvaluationRun = createEvaluationRun(evaluationSet, {
  id: "run_2",
  label: "Equivalent input",
  targetGuardrailId: "guardrail_1",
  targetGuardrailVersionId: "guardrail_version_1",
});
assert.equal(equivalentEvaluationRun.datasetFingerprint, evaluationRun.datasetFingerprint);
assert.equal(equivalentEvaluationRun.evaluatorFingerprint, evaluationRun.evaluatorFingerprint);
assert.equal(equivalentEvaluationRun.systemFingerprint, evaluationRun.systemFingerprint);
assert.equal(equivalentEvaluationRun.runFingerprint, evaluationRun.runFingerprint);
const snapshottedEvaluationRun = createEvaluationRun(evaluationSet, {
  id: "run_system_snapshot",
  targetAgentVersionId: "agent_version_1",
  targetAgentSnapshot: {
    model: "gpt-5",
    instructions: "Use the verified support workflow.",
    enabledSkills: ["crm", "knowledge"],
    tools: [{ id: "ticket_lookup", apiKey: "must-not-persist" }],
    temperature: 0.2,
  },
  environmentSnapshot: {
    id: "computer_1",
    revisionId: "environment_revision_7",
    imageDigest: "sha256:image",
    accessToken: "must-not-persist",
  },
  runtimeSnapshot: {
    adapter: "computer-agents",
    token: "must-not-persist",
    auth: "must-not-persist",
    maxTokens: 4096,
    headers: {
      Authorization: "must-not-persist",
      "X-Trace-Mode": "evaluation",
    },
  },
});
assert.equal(
  snapshottedEvaluationRun.systemSnapshot?.schemaVersion,
  "evaluation_system_snapshot_v1",
);
assert.equal(
  snapshottedEvaluationRun.systemSnapshot?.agent?.versionId,
  "agent_version_1",
);
assert.match(
  snapshottedEvaluationRun.systemSnapshot?.agent?.instructionsFingerprint || "",
  /^sha256:[a-f0-9]{64}$/,
);
assert.deepEqual(
  snapshottedEvaluationRun.systemSnapshot?.skills?.ids,
  ["crm", "knowledge"],
);
assert.equal(
  JSON.stringify(snapshottedEvaluationRun.systemSnapshot).includes("must-not-persist"),
  false,
);
assert.equal(
  JSON.stringify(snapshottedEvaluationRun.systemSnapshot).includes("Use the verified support workflow."),
  false,
);
assert.deepEqual(
  snapshottedEvaluationRun.systemSnapshot?.runtime,
  {
    adapter: "computer-agents",
    headers: {
      "X-Trace-Mode": "evaluation",
    },
    maxTokens: 4096,
  },
);
const pinnedEvaluatorRun = createEvaluationRun(evaluationSet, {
  id: "run_pinned_evaluator",
  evaluator: {
    type: "agent",
    agentId: "agent_evaluator",
    agentVersionId: "agent_evaluator_version_3",
    agentVersionNumber: 3,
    agentVersionRevisionId: "evaluator_revision_3",
  },
  evaluatorAgentSnapshot: {
    model: "gpt-5",
    instructions: "Grade against the supplied rubric.",
    tools: [{ id: "artifact_reader", token: "must-not-persist" }],
  },
});
assert.equal(
  pinnedEvaluatorRun.evaluator?.agentVersionId,
  "agent_evaluator_version_3",
);
assert.equal(
  pinnedEvaluatorRun.evaluatorSystemSnapshot?.agent?.versionId,
  "agent_evaluator_version_3",
);
assert.match(
  pinnedEvaluatorRun.evaluatorSystemSnapshot?.agent?.instructionsFingerprint || "",
  /^sha256:[a-f0-9]{64}$/,
);
assert.equal(
  JSON.stringify(pinnedEvaluatorRun.evaluatorSystemSnapshot).includes("must-not-persist"),
  false,
);
assert.equal(
  JSON.stringify(pinnedEvaluatorRun.evaluatorSystemSnapshot).includes("Grade against the supplied rubric."),
  false,
);
const changedSystemEvaluationRun = createEvaluationRun(evaluationSet, {
  id: "run_changed_system",
  targetAgentVersionId: "agent_version_1",
  targetAgentSnapshot: {
    model: "gpt-5",
    instructions: "Use the verified support workflow.",
    enabledSkills: ["crm", "knowledge"],
    tools: [{ id: "ticket_lookup" }],
    temperature: 0.7,
  },
  environmentSnapshot: {
    id: "computer_1",
    revisionId: "environment_revision_7",
    imageDigest: "sha256:image",
  },
});
assert.equal(
  changedSystemEvaluationRun.datasetFingerprint,
  snapshottedEvaluationRun.datasetFingerprint,
);
assert.notEqual(
  changedSystemEvaluationRun.systemFingerprint,
  snapshottedEvaluationRun.systemFingerprint,
);
const changedEvaluationRun = createEvaluationRun(normalizeEvaluationSet({
  ...evaluationSet,
  dataRows: [{
    ...evaluationSet.dataRows[0],
    expectedOutput: "A materially different expected result",
  }],
}), {
  id: "run_3",
  targetGuardrailId: "guardrail_1",
  targetGuardrailVersionId: "guardrail_version_1",
});
assert.notEqual(changedEvaluationRun.datasetFingerprint, evaluationRun.datasetFingerprint);
assert.notEqual(changedEvaluationRun.runFingerprint, evaluationRun.runFingerprint);

const mixedOutcomeRun = recomputeRun({
  id: "run_explicit_statuses",
  passThreshold: 0.8,
  cases: [
    { id: "case_passed", status: "passed", score: 1 },
    { id: "case_failed", status: "failed", score: 0.5 },
    { id: "case_invalid", status: "invalid", score: null },
    { id: "case_grader", status: "grader_error", score: null },
    { id: "case_infrastructure", status: "infrastructure_error", score: null },
  ],
});
assert.equal(mixedOutcomeRun.averageScore, 0.75);
assert.equal(mixedOutcomeRun.scoredCount, 2);
assert.equal(mixedOutcomeRun.passedCount, 1);
assert.equal(mixedOutcomeRun.failedCount, 1);
assert.equal(mixedOutcomeRun.invalidCount, 1);
assert.equal(mixedOutcomeRun.graderErrorCount, 1);
assert.equal(mixedOutcomeRun.infrastructureErrorCount, 1);
assert.equal(mixedOutcomeRun.unscoredCount, 3);
assert.equal(mixedOutcomeRun.passRate, 0.5);
assert.equal(mixedOutcomeRun.status, "completed_with_errors");
const unscoreableRun = recomputeRun({
  id: "run_unscoreable",
  cases: [{ id: "case_grader", status: "grader_error", score: null }],
});
assert.equal(unscoreableRun.averageScore, null);
assert.equal(unscoreableRun.scoredCount, 0);
assert.equal(unscoreableRun.status, "failed");

const optimizationEvaluationSet = normalizeEvaluationSet({
  id: "evaluation_optimization_roles",
  name: "Optimization roles",
  dataRows: [
    { id: "train_case", input: "Train", expectedOutput: "Train output", optimizationRole: "train" },
    { id: "validation_case", input: "Validate", expectedOutput: "Validation output", dataset_role: "validation" },
    { id: "holdout_case", input: "Holdout", expectedOutput: "Holdout output", split: "holdout" },
  ],
});
assert.deepEqual(
  optimizationEvaluationSet.dataRows.map((row) => row.optimizationRole),
  ["train", "validation", "holdout"],
);
const validationRun = createEvaluationRun(optimizationEvaluationSet, {
  id: "run_validation_only",
  optimizationRoles: ["validation"],
});
assert.deepEqual(validationRun.optimizationRoles, ["validation"]);
assert.deepEqual(validationRun.cases.map((caseRun) => caseRun.dataRowId), ["validation_case"]);
assert.equal(validationRun.cases[0]?.optimizationRole, "validation");

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

let resolveCodeEvaluatorResponse;
const codeEvaluatorResponse = new Promise((resolve) => {
  resolveCodeEvaluatorResponse = resolve;
});
const codeEvaluatorService = createEvaluationsService({
  ...adapters,
  hasAiosSession: () => true,
  readRequestBody: async () => ({
    evaluationSet: {
      id: "evaluation_code_legacy",
      name: "Legacy code evaluator",
      targetAgentId: "agent_1",
      environmentId: "computer_1",
      evaluator: {
        type: "code",
        code: "globalThis.compromised = true; return 1;",
      },
      dataRows: [{
        id: "case_1",
        input: "Input",
        expectedOutput: "Output",
      }],
    },
    runOptions: {
      targetAgentId: "agent_1",
      environmentId: "computer_1",
      evaluator: {
        type: "code",
        code: "globalThis.compromised = true; return 1;",
      },
    },
  }),
  sendJson: (_res, status, payload) => resolveCodeEvaluatorResponse({ status, payload }),
});
handled = codeEvaluatorService.handleRequest(
  { method: "POST", headers: { host: "localhost" }, url: "/api/real/evaluations/runs" },
  {},
  new URL("http://localhost/api/real/evaluations/runs"),
);
assert.equal(handled, true);
const rejectedCodeEvaluatorResult = await codeEvaluatorResponse;
assert.equal(rejectedCodeEvaluatorResult.status, 422);
assert.match(rejectedCodeEvaluatorResult.payload?.message || "", /isolated grader sandbox/);
assert.equal(globalThis.compromised, undefined);

assert.throws(
  () => createEvaluationsService({}),
  /Evaluations service requires the enrichThreadPayloadWithAgentGuardrails adapter/,
);

console.log("Evaluations service client ownership, browser syntax, domain behavior, and route contracts passed.");
