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
const {
  createPlaygroundEvaluationSetDraft: createClientEvaluationSetDraft,
  normalizePlaygroundEvaluationRun: normalizeClientEvaluationRun,
} = new Function(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.foundation + "; return { createPlaygroundEvaluationSetDraft, normalizePlaygroundEvaluationRun };",
)();
assert.deepEqual(createClientEvaluationSetDraft().dataRows, []);
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
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /title: "Runs"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformSecondaryButton, \{[\s\S]*?From Threads/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformPrimaryButton, \{[\s\S]*?openNewEvaluationCaseEditor/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformEmptyState, \{[\s\S]*?title: "No cases yet"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /renderEvaluationAccessSettings/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /React\.createElement\(PlatformRolePermissionsPage/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /subjectType: "evaluation_team_role"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /resourceType: "evaluation"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /renderEvaluationOwnerSelector/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /\bteamPageTeams\b/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /\bteamPageLoading\b/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /\bloadTeamPageData\b/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /workspaceTeams = \[\]/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.setup, /onWorkspaceTeamsRequest/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /workspaceTeams: teamPageTeams/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /composePlatformAccessPrincipalRows\(evaluationSharedTeams\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.access, /readOnly: selectedRole\.id === "owner"/);
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
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /React\.createElement\(PlatformSecondaryButton, \{[\s\S]*?playground-evaluations-run-action/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /onRefreshThreadRecords: \(\) => refreshThreads\(40,/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /function renderEvaluationCaseEditorModal\(\)[\s\S]*?React\.createElement\(PlatformModal/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /className: "playground-evaluations-case-editor-modal"/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /className: "playground-tasks-project-modal playground-tasks-issue-modal[^"]*playground-evaluations-case-editor-modal"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /React\.createElement\(PlatformUiCard/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /function renderEvaluationCaseGuidanceTitle/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /Evaluator guidance information/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.caseDetail, /accept: "\.txt,text\/plain"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /const normalizedRunEvaluator = normalizePlaygroundEvaluationEvaluator\(run\?\.evaluator\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /normalizedRunEvaluator\.type === "agent" && !normalizedRunEvaluator\.agentId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /accessor: \(\) => runEvaluatorLabel/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /cell: \(\) => renderRunEvaluatorCell\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /playground-evaluations-case-source-grid/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /playground-evaluations-case-focused-editor/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /playground-evaluations-case-focused-editor",[\s\S]*?autoFocus: true/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /React\.createElement\(ArrowLeft/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /onClick: returnFromEvaluationCaseFocusedEditor/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /description: focusedEditor\.description/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.threadCases, /function returnFromEvaluationCaseFocusedEditor/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.versionDialogs, /"Discard"/);
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
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(PlatformDataTable/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(EvaluationDetailPage/);
assert.doesNotMatch(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /className: "playground-content-title playground-evaluations-title-input",[\s\S]{0,160}?size:/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationDetailSidebarRow\("pass-threshold"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /variant: "run"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /ariaLabel: "Evaluation run details"/);
const evaluationRunViewStart = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views.indexOf("function renderRun()");
assert.ok(evaluationRunViewStart >= 0);
const evaluationRunViewScript = EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views.slice(evaluationRunViewStart);
assert.doesNotMatch(evaluationRunViewScript, /playground-evaluations-run-title/);
assert.doesNotMatch(evaluationRunViewScript, /\bheader:/);
assert.doesNotMatch(evaluationRunViewScript, /\bactiveTab:/);
assert.doesNotMatch(evaluationRunViewScript, /\bsidebarToggle:/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationDetailSidebarRow\("environment"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationAccessSettings\(\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderEvaluationOwnerSelector\(activeSet\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /React\.createElement\(PlatformSelector, \{[\s\S]*?ariaLabel: "Choose evaluator agent"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /evaluator: \{[\s\S]*?type: "agent",[\s\S]*?agentId: nextAgentId/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformAnalyticsSection/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /variant: run \? "framed" : "default"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /React\.createElement\(PlatformAttachments/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /function renderEvaluationImportsSection\(set\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.views, /renderDataTable\(activeSet\),[\s\S]*?renderEvaluationImportsSection\(activeSet\)/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /accept: "\.jsonl,application\/x-ndjson,application\/jsonl"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /uploadFromComputerLabel: "From Workspace"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.tables, /onUploadFromComputer: \(\) => openEvaluationJsonlWorkspacePicker\(set\)/);
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

assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.state, /evaluationSets/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openEvaluationsPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openEvaluationDetailPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /setSelectedEvaluationRunId\(""\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation, /setSelectedEvaluationCaseId\(""\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyCapture, /evaluationRunId/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "evaluations"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.lifecycle, /selectedEvaluationSetId/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderEvaluationsPageNav/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Evaluations",\s*onClick: openEvaluationsOverviewPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /evaluationsPageMode === "run" \|\| evaluationsPageMode === "case"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /onClick: evaluationsPageMode === "run" \|\| evaluationsPageMode === "case"\s*\? \(\) => openEvaluationDetailPage\(activeEvaluationSet\.id\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /setSelectedEvaluationCaseId\(""\);[\s\S]*?setEvaluationsPageMode\("run"\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /evaluationsPathItems\.push\(\{ label: activeEvaluationCaseTitle \}\)/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-evaluations-overview-controls/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformVersionLabel/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /setEvaluationVersionsSidebarRequestToken/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /id: "playground-evaluations-breadcrumb-actions"/);
assert.match(
  EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation,
  /center: showEvaluationSetActions[\s\S]*?React\.createElement\(PlatformSwitch,[\s\S]*?value: evaluationDetailTab === "settings"[\s\S]*?ariaLabel: "Evaluation section"/,
);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /function renderEvaluationsPage/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /versionsSidebarRequestToken: evaluationVersionsSidebarRequestToken/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /breadcrumbActionsPortalId: evaluationsPageMode === "detail"/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /onNavigationGuardChange: registerPlatformNavigationGuard/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView, /onNavigationRequest: requestPlatformNavigation/);
assert.match(EVALUATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "evaluations"/);
assert.match(
  EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs,
  /const breadcrumbActionsPortal = evaluationBreadcrumbActionsContainer[\s\S]*?React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal"/,
);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /"Evaluation ID"/);
assert.match(EVALUATIONS_PAGE_SCRIPT_FRAGMENTS.dialogs, /"Version History"/);

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
assert.doesNotMatch(EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view, /pagination\s*:/);
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
assert.match(evaluationRuntimeSource, /async function resolveEvaluationGuardrailTarget/);
assert.match(evaluationRuntimeSource, /guardrail: record\.targetGuardrail \|\| null/);
assert.match(evaluationRuntimeSource, /buildProxyPromptAdaptationsFromGuardrails\(explicitGuardrails\)/);
assert.match(evaluationRuntimeSource, /targetGuardrail = await resolveEvaluationGuardrailTarget/);
assert.match(evaluationRuntimeSource, /createEvaluationRunPersistenceCoordinator/);
assert.match(evaluationRuntimeSource, /await runPersistence\.enqueue\(record, run\)/);
assert.match(evaluationRuntimeSource, /await ensureRunPersisted\(record\)/);

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
