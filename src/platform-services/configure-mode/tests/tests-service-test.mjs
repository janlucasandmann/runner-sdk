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
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.navigation, /openTestsPage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.navigation, /openTestCaseDetailPage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.historyCapture, /testCaseId/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.mode === "case"/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /TestsWorkspacePage/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.pageView, /onOpenCase/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-tests-section-controls/);
assert.match(TESTS_APP_SCRIPT_FRAGMENTS.topNavigation, /selectedTestCaseName/);
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
assert.match(runDetailSource, /Case results/);
assert.match(runDetailSource, /Technical details/);
assert.doesNotMatch(runDetailSource, /title="Canonical envelope"/);
assert.doesNotMatch(runDetailSource, /activeTab/);

const workspaceSource = await fs.readFile(
  new URL("./client/page/tests-workspace-page.tsx", import.meta.url),
  "utf8",
);
assert.match(workspaceSource, /PlatformServiceDetailFrame/);
assert.match(workspaceSource, /sectionControlsPortalId/);
assert.match(workspaceSource, /mode === "case"/);
assert.match(workspaceSource, /TestCaseDetailPage/);
assert.match(workspaceSource, /onPlanDeleted/);

const caseDetailSource = await fs.readFile(
  new URL("./client/page/test-case-detail-page.tsx", import.meta.url),
  "utf8",
);
assert.match(caseDetailSource, /FileResourceDetailPage/);
assert.match(caseDetailSource, /PlatformCodeEditorWorkspace/);
assert.match(caseDetailSource, /PlatformSwitch/);
assert.match(caseDetailSource, /PlatformServiceDetailPropertyList/);
assert.match(caseDetailSource, /Save Changes/);
assert.match(caseDetailSource, /Delete Case/);

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
