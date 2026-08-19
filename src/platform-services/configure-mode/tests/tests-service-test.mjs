import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  PLAYGROUND_TESTS_CSS,
  TESTS_APP_SCRIPT_FRAGMENTS,
  createTestsService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(PLAYGROUND_TESTS_CSS, /\.resource-overview-page\.is-tests/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.state, /selectedTestPlanId/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.state, /selectedTestCaseId/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.state, /testsOverviewScope/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.navigation, /openTestsPage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.navigation, /openTestCaseDetailPage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.navigation, /openTestRawConfigurationPage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.navigation, /openTestRunTechnicalDetailsPage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.historyCapture, /testCaseId/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.mode === "case"/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.mode === "configuration"/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.mode === "run-technical"/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /TestsWorkspacePage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onOpenCase/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onOpenRawConfiguration/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onOpenRunTechnicalDetails/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-tests-section-controls/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /\{ value: "all", label: "All Tests" \}/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /\{ value: "created", label: "Created by me" \}/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /\{ value: "shared", label: "Shared with me" \}/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /overviewScope: testsOverviewScope/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /selectedTestCaseName/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /Raw Configuration/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Details"/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /const isRunLevel = testsPageMode === "run"/);
assert.match(
  TESTS_APP_SCRIPT_FRAGMENTS.topNavigation,
  /if \(!isRunLevel && testsPageMode !== "case"\)/,
);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-tests-title-actions/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /versionsDrawerPortalId/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onVersionsSidebarOpenChange/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onNavigationGuardChange: registerPlatformNavigationGuard/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onNavigationRequest: requestPlatformNavigation/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onPlanDeleted/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /workspaceTeamsLoading: teamPageLoading/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onWorkspaceTeamsRequest/);

const platformSource = await readPlatformCompositionSource();
assert.match(
  platformSource,
  /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/tests\/index\.mjs"/,
);
assert.match(platformSource, /testsService\.handleRequest\(req, res, url\)/);
assert.match(
  platformSource,
  /PLAYGROUND_EVALUATIONS_CSS \+ PLAYGROUND_TESTS_CSS/,
);

const runtimeSource = await fs.readFile(
  new URL("./server/runtime.mjs", import.meta.url),
  "utf8",
);
assert.match(runtimeSource, /executorThreadId/);
assert.match(runtimeSource, /promptWasSubmitted/);
assert.match(runtimeSource, /MISSING_TEST_CASE_RESULT/);
assert.match(runtimeSource, /test_run_json/);
assert.match(runtimeSource, /trustLevel: "self_reported"/);
assert.match(runtimeSource, /verificationStatus: "unverified"/);
assert.match(runtimeSource, /hybrid_test_worker_v1/);
assert.match(runtimeSource, /partitionExecutionCases/);
assert.doesNotMatch(runtimeSource, /child_process|execSync|spawnSync/);

assert.throws(
  () => createTestsService({}),
  /requires the fetchAiosApi adapter/,
);

const calls = [];
const service = createTestsService({
  fetchAiosApi: async () => new Response("{}", { status: 200 }),
  hasAiosSession: () => false,
  parseUpstreamUrl: () => "https://api.example.test",
  proxyUpstreamJsonRequest: (...args) => calls.push(args),
  readOptionalApiKey: () => "",
  withProxyOrganizationHeader: (_request, _body, headers) => headers,
});

const request = {
  method: "POST",
  url: "/api/real/test-plans/test_plan_1/runs?source=mission-control",
  headers: {},
};
const handled = service.handleRequest(
  request,
  {},
  new URL(request.url, "http://localhost"),
);
assert.equal(handled, true);
assert.equal(calls.length, 1);
assert.equal(
  calls[0][2],
  "/test-plans/test_plan_1/runs?source=mission-control",
);
assert.equal(calls[0][3], "POST");
assert.equal(
  service.handleRequest(
    { method: "GET", url: "/api/real/evaluations", headers: {} },
    {},
    new URL("http://localhost/api/real/evaluations"),
  ),
  false,
);
assert.equal(service.runs.activeCount(), 0);

const detailSource = await fs.readFile(
  new URL("./client/page/test-plan-detail-page.tsx", import.meta.url),
  "utf8",
);
assert.match(detailSource, /PlatformServiceDetailPage/);
assert.match(detailSource, /PlatformAnalyticsSection/);
assert.match(detailSource, /PlatformSwitch/);
assert.match(detailSource, /PlatformButtonSelector/);
assert.match(detailSource, /PlatformDataTable/);
assert.match(detailSource, /PlatformLabel/);
assert.match(detailSource, /onRowActivate=\{\(testCase\) => onOpenCase/);
assert.match(detailSource, /publishVersion/);
assert.match(detailSource, /PlatformResourceVersionLabel/);
assert.match(detailSource, /PlatformVersionHistorySidebar/);
assert.match(detailSource, /PlatformResourceActionsMenu/);
assert.match(detailSource, /PlatformResourceShareModal/);
assert.match(detailSource, /PlatformResourceRenameModal/);
assert.match(detailSource, /PlatformConfirmationModal/);
assert.match(detailSource, /buildPlatformTeamAccessMetadata/);
assert.match(detailSource, /TestPlanAccessSettings/);
assert.match(
  detailSource,
  /sidebarCollapsed=\{activeTab === "cases" \|\| accessDetailOpen \|\| versionHistoryOpen\}/,
);
assert.match(detailSource, /onPermissionDetailOpenChange=\{setAccessDetailOpen\}/);
assert.match(detailSource, /className="tests-plan-settings-identity"/);
assert.match(detailSource, /aria-label="Test name"/);
assert.match(detailSource, /aria-label="Test description"/);
assert.match(detailSource, /usePlatformVersionNavigationGuard/);
assert.match(detailSource, /label="Computer"/);
assert.match(detailSource, /playground-project-overview-sidebar-selector/);
assert.doesNotMatch(detailSource, /How this test works/);
assert.doesNotMatch(detailSource, /title="Run target"/);
assert.doesNotMatch(detailSource, /Before the first case/);
assert.doesNotMatch(detailSource, /After the final case/);
assert.doesNotMatch(detailSource, /definition\.setup/);
assert.doesNotMatch(detailSource, /definition\.teardown/);
assert.doesNotMatch(detailSource, /Wait before retrying/);
assert.doesNotMatch(detailSource, /backoffMs/);
assert.doesNotMatch(detailSource, /Open raw test configuration/);
assert.doesNotMatch(detailSource, /tests-definition-editor/);
assert.doesNotMatch(detailSource, /Run Tests/);
assert.match(detailSource, /label="Run Test"/);
assert.match(detailSource, /Raw Configuration/);
assert.doesNotMatch(detailSource, /Runs continue to use the published immutable version/);
assert.doesNotMatch(detailSource, /plan\.status/);
assert.doesNotMatch(detailSource, /Test-plan status/);
assert.doesNotMatch(detailSource, /Save Version/);
assert.doesNotMatch(detailSource, /<PlatformServiceDetailProperty label="Cases">/);
assert.doesNotMatch(detailSource, /CircleDot/);
assert.doesNotMatch(
  detailSource,
  /primaryAction:\s*\{\s*label:\s*"Run Tests"/s,
);
assert.match(PLAYGROUND_TESTS_CSS, /\.tests-cases-table \.platform-data-table__toolbar-title\s*\{[\s\S]*?font-size:\s*18px/);

const accessSettingsSource = await fs.readFile(
  new URL("./client/page/test-plan-access-settings.tsx", import.meta.url),
  "utf8",
);
assert.match(accessSettingsSource, /PlatformResourceAccessSettings<TestAccessTeam>/);
assert.match(accessSettingsSource, /PLATFORM_ALL_AGENTS_PRINCIPAL_ID/);
assert.match(accessSettingsSource, /buildPlatformSystemPrincipalRolePermissionMetadata/);
assert.match(accessSettingsSource, /subjectType="test_plan"/);
assert.match(accessSettingsSource, /teamSubjectType="test_plan_team_role"/);
assert.match(accessSettingsSource, /onPermissionDetailOpenChange\?\.\(Boolean\(value\)\)/);

const runDetailSource = await fs.readFile(
  new URL("./client/page/test-run-detail-page.tsx", import.meta.url),
  "utf8",
);
assert.match(runDetailSource, /PlatformServiceDetailPage/);
assert.match(runDetailSource, /variant="run"/);
assert.match(runDetailSource, /PlatformAnalyticsSection/);
assert.match(runDetailSource, /PlatformResourceDetailSidebar/);
assert.match(runDetailSource, /PlatformButtonSelector/);
assert.doesNotMatch(runDetailSource, /tests-run-summary-card/);
assert.match(runDetailSource, /showXAxisLabels=\{false\}/);
assert.match(runDetailSource, /label: "Pass rate"/);
assert.match(runDetailSource, /Case results/);
assert.match(runDetailSource, /getRowActions=/);
assert.match(runDetailSource, /label: expandedResultIds\.has\(result\.id\) \? "Collapse" : "Expand"/);
assert.doesNotMatch(runDetailSource, /tests-run-case-output__icon/);
assert.match(runDetailSource, /placeholder: "Search artifacts"/);
assert.doesNotMatch(runDetailSource, /Files, screenshots, traces, and reports retained by this run\./);
assert.doesNotMatch(runDetailSource, /title="Case output"/);
assert.match(runDetailSource, /renderExpandedRow/);
assert.match(runDetailSource, /onOpenTechnicalDetails/);
assert.doesNotMatch(runDetailSource, /tests-run-technical-details/);
assert.doesNotMatch(runDetailSource, /title="Canonical envelope"/);
assert.doesNotMatch(runDetailSource, /activeTab/);

const workspaceSource = await fs.readFile(
  new URL("./client/page/tests-workspace-page.tsx", import.meta.url),
  "utf8",
);
assert.match(workspaceSource, /PlatformServiceDetailFrame/);
assert.match(workspaceSource, /sectionControlsPortalId/);
assert.match(workspaceSource, /mode === "case"/);
assert.match(workspaceSource, /mode === "configuration"/);
assert.match(workspaceSource, /mode === "run-technical"/);
assert.match(workspaceSource, /TestCaseDetailPage/);
assert.match(workspaceSource, /TestPlanRawConfigurationPage/);
assert.match(workspaceSource, /TestRunTechnicalDetailsPage/);
assert.match(workspaceSource, /onPlanDeleted/);

const rawConfigurationSource = await fs.readFile(
  new URL("./client/page/test-plan-raw-configuration-page.tsx", import.meta.url),
  "utf8",
);
assert.match(rawConfigurationSource, /MarkdownResourceDetailPage/);
assert.match(rawConfigurationSource, /PlatformCodeEditorWorkspace/);
assert.match(rawConfigurationSource, /PlatformMonacoCodeEditor/);
assert.match(rawConfigurationSource, /language="json"/);
assert.match(rawConfigurationSource, /parseTestPlanDefinition/);
assert.match(rawConfigurationSource, /usePlatformVersionNavigationGuard/);
assert.match(rawConfigurationSource, /TestPlanSaveModal/);
assert.match(
  PLAYGROUND_TESTS_CSS,
  /\.tests-raw-configuration-workspace\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
);
assert.match(
  PLAYGROUND_TESTS_CSS,
  /\.tests-raw-configuration-monaco \.monaco-editor-background,[\s\S]*?background:\s*#000\s*!important/,
);
assert.doesNotMatch(PLAYGROUND_TESTS_CSS, /\.tests-advanced-definition/);
assert.match(
  PLAYGROUND_TESTS_CSS,
  /\.tests-settings-page \.tests-evidence-settings-section\s*\{[\s\S]*?padding:\s*10px;[\s\S]*?border:\s*1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]*?border-radius:\s*15px;[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.075\);/,
);
assert.match(
  PLAYGROUND_TESTS_CSS,
  /\.tests-evidence-settings-section \.platform-service-detail-page__property\s*\{\s*background:\s*transparent;/,
);
assert.match(
  PLAYGROUND_TESTS_CSS,
  /\.tests-case-detail-general__content > \.tests-case-builder\s*\{[\s\S]*?padding:\s*20px;[\s\S]*?border:\s*1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]*?border-radius:\s*15px;[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.075\);/,
);

const runTechnicalDetailsSource = await fs.readFile(
  new URL("./client/page/test-run-technical-details-page.tsx", import.meta.url),
  "utf8",
);
assert.match(runTechnicalDetailsSource, /MarkdownResourceDetailPage/);
assert.match(runTechnicalDetailsSource, /PlatformCodeEditorWorkspace/);
assert.match(runTechnicalDetailsSource, /sidebarTitle="Run data"/);
assert.match(runTechnicalDetailsSource, /label: "Technical details"/);
assert.match(runTechnicalDetailsSource, /label: "JSON"/);
assert.match(runTechnicalDetailsSource, /PlatformMonacoCodeEditor/);
assert.match(runTechnicalDetailsSource, /readOnly/);
assert.match(runTechnicalDetailsSource, /language="json"/);
assert.doesNotMatch(runTechnicalDetailsSource, /bracketPairColorization|bracketPairs/);

const caseDetailSource = await fs.readFile(
  new URL("./client/page/test-case-detail-page.tsx", import.meta.url),
  "utf8",
);
assert.match(caseDetailSource, /FileResourceDetailPage/);
assert.match(caseDetailSource, /TestCaseDefinitionBuilder/);
assert.match(caseDetailSource, /TestCaseCodeEditor/);
assert.match(caseDetailSource, /PlatformSwitch/);
assert.match(
  caseDetailSource,
  /tests-case-detail-title-row[\s\S]*?PlatformSelector[\s\S]*?ariaLabel="Test type"[\s\S]*?applyTestCaseTargetKind/,
);
assert.doesNotMatch(caseDetailSource, /PlatformServiceDetailPropertyList|PlatformUiCard/);
assert.match(caseDetailSource, /Save Changes/);
assert.match(caseDetailSource, /Delete Case/);

const caseCodeEditorSource = await fs.readFile(
  new URL("./client/page/test-case-code-editor.tsx", import.meta.url),
  "utf8",
);
assert.match(caseCodeEditorSource, /PlatformCodeEditorWorkspace/);
assert.match(caseCodeEditorSource, /PlatformMonacoCodeEditor/);
assert.match(caseCodeEditorSource, /case\.json/);
assert.match(caseCodeEditorSource, /execution\.json/);
assert.match(caseCodeEditorSource, /request\.json/);
assert.match(caseCodeEditorSource, /assertions\.json/);
assert.match(caseCodeEditorSource, /environment\.json/);

const caseDefinitionBuilderSource = await fs.readFile(
  new URL("./client/page/test-case-definition-builder.tsx", import.meta.url),
  "utf8",
);
assert.match(caseDefinitionBuilderSource, /TEST_CASE_TYPE_OPTIONS/);
assert.doesNotMatch(caseDefinitionBuilderSource, /What are you testing\?/);
assert.match(caseDefinitionBuilderSource, /Readiness requirements/);
assert.match(caseDefinitionBuilderSource, /FunctionRequestFields/);
assert.match(caseDefinitionBuilderSource, /WorkflowRequestFields/);
assert.match(caseDefinitionBuilderSource, /ScenarioStepEditor/);
assert.match(caseDefinitionBuilderSource, /TestAssertionBuilder/);
assert.match(caseDefinitionBuilderSource, /PlatformInstructionsEditor/);
assert.match(caseDefinitionBuilderSource, /editorMode="code"/);
assert.match(caseDefinitionBuilderSource, /codeLanguage="json"/);
assert.match(caseDefinitionBuilderSource, /codeLanguage="shell"/);
assert.doesNotMatch(caseDefinitionBuilderSource, /<textarea/);
assert.doesNotMatch(caseDefinitionBuilderSource, /PlatformMonacoCodeEditor/);

const overviewSource = await fs.readFile(
  new URL("./client/page/tests-overview-page.tsx", import.meta.url),
  "utf8",
);
assert.match(overviewSource, /ResourceOverviewPage/);
assert.match(overviewSource, /PlatformEmptyState/);
assert.match(overviewSource, /PlatformLabel/);
assert.doesNotMatch(overviewSource, /ResourceOverviewIdentityCell/);

const overviewGuideSource = await fs.readFile(
  new URL("./client/page/tests-overview-guide.tsx", import.meta.url),
  "utf8",
);
assert.match(overviewGuideSource, /PlatformPageHero/);
assert.doesNotMatch(overviewGuideSource, /PlatformUiCard/);
assert.match(overviewSource, /variant:\s*"catalog-ui"/);
assert.doesNotMatch(overviewSource, /filters:/);
