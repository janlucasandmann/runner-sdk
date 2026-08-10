import assert from "node:assert/strict";

import {
  METRONOME_APP_SCRIPT_FRAGMENTS,
  METRONOME_DOMAIN_RUNTIME_SCRIPT,
  METRONOME_PAGE_CSS,
  METRONOME_PAGE_RUNTIME_SCRIPT,
  METRONOME_PAGE_SCRIPT,
  METRONOME_SHELL_RUNTIME_SCRIPT,
  METRONOME_SHELL_STYLE_FRAGMENTS,
  METRONOME_STYLE_FRAGMENTS,
  createMetronomeService,
} from "./index.mjs";
import {
  METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS,
  METRONOME_PAGE_CONTROLLER_SCRIPT,
} from "./client/page/controller.mjs";
import { METRONOME_PAGE_OVERVIEW_SCRIPT } from "./client/page/overview.mjs";
import {
  METRONOME_PAGE_INSPECTOR_FRAGMENT_PATHS,
  METRONOME_PAGE_INSPECTOR_SCRIPT,
} from "./client/page/inspector.mjs";
import {
  METRONOME_TEMPLATES_FRAGMENT_PATHS,
  METRONOME_TEMPLATES_RUNTIME_SCRIPT,
} from "./client/runtime/templates-and-graph.mjs";
import {
  METRONOME_TRIGGERS_FRAGMENT_PATHS,
  METRONOME_TRIGGERS_RUNTIME_SCRIPT,
} from "./client/runtime/triggers-and-contracts.mjs";
import {
  METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS,
  METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT,
} from "./client/runtime/workflow-domain.mjs";
import {
  METRONOME_INSPECTOR_CSS,
  METRONOME_INSPECTOR_CSS_FRAGMENT_PATHS,
} from "./client/styles/inspector.mjs";
import { assertLegacyBrowserSourceContract } from "../../../../apps/platform/testing/legacy-browser-source-contract.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

const metronomePageUrl = new URL("./client/page/", import.meta.url);
const metronomeRuntimeUrl = new URL("./client/runtime/", import.meta.url);
const metronomeStylesUrl = new URL("./client/styles/", import.meta.url);

await Promise.all([
  assertLegacyBrowserSourceContract({
    label: "Metronome controller runtime",
    source: METRONOME_PAGE_CONTROLLER_SCRIPT,
    expectedSha256: "fa431620981914f66a725eb96f30ba1e1122584c4f58b7ded14649bb58cb15cb",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector runtime",
    source: METRONOME_PAGE_INSPECTOR_SCRIPT,
    expectedSha256: "1951fcbede5a53a9c5274c6851fb1abf350e615218f0880874c3a31c29bd0f03",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_INSPECTOR_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome templates runtime",
    source: METRONOME_TEMPLATES_RUNTIME_SCRIPT,
    expectedSha256: "38964cbfae34b922cc6abca71212eaa435a29e403e8ce94816d69d9cfb646686",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_TEMPLATES_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome triggers runtime",
    source: METRONOME_TRIGGERS_RUNTIME_SCRIPT,
    expectedSha256: "464398ea2b588f20de89812e18405d9650b1f53bb312ea1b00d0bffe389b254e",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_TRIGGERS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome workflow runtime",
    source: METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT,
    expectedSha256: "4bc8b4dfddd6d2e5acbba1e9a4e571d43cc3a76183d8b37ad21e43d043c3ad62",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector styles",
    source: METRONOME_INSPECTOR_CSS,
    expectedSha256: "02baf153bb7a2fc8f394c52402b00a246301de140b705125b23dd40bfc83a8ca",
    fragmentGroups: [{
      baseUrl: metronomeStylesUrl,
      paths: METRONOME_INSPECTOR_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
]);

assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function getMetronomeNodeIOContract/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function haveMetronomePersistedNodesChanged/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function haveMetronomePersistedEdgesChanged/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /function stopMetronomeInputKeyPropagation\(event\)\s*\{[\s\S]*?event\.stopPropagation\(\)/);
assert.doesNotMatch(METRONOME_DOMAIN_RUNTIME_SCRIPT, /stopImmediatePropagation/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /onMount: \(\) => \{\s*setIsMonacoReady\(true\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /function PlaygroundMetronomePage/);
assert.match(METRONOME_PAGE_SCRIPT, /function PlaygroundMetronomePage/);
assert.match(METRONOME_PAGE_CSS, /playground-metronome/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /playground-metronome/);
assert.match(METRONOME_STYLE_FRAGMENTS.overview, /\.playground-metronome-page\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.overview, /\.playground-metronome-page\.is-editor\.is-code\s*\{[\s\S]*?padding:\s*0/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-editor\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-code-view\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-inline-node-inspector\s*\{[\s\S]*?top:\s*24px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-runs-view\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-tasks-project-modal-label[\s\S]*font-weight:\s*400/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-environments-input,[\s\S]*border-radius:\s*8px/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-environments-input,[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
assert.match(METRONOME_SHELL_RUNTIME_SCRIPT, /function getThreadMetronomeMetadata/);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.sidebar, /sidebar-metronome-run/);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.runTrace, /playground-metronome-run-thread/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.state, /metronomeRunTraceState/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function openMetronomePage/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /createWorkflow/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.modeSwitch, /React\.createElement\(PlatformSwitch,[\s\S]*ariaLabel: "Metronome modes"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformButtonSelector,\s*\{\s*mode: "split-action",\s*buttonVariant: "primary"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /label: "Save Changes"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /leading: React\.createElement\(Bookmark/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /label: "Revert Changes"/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /Save to new Version/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /playground-metronome-top-nav-run-button/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /lastHandledCreateWorkflowRequestTokenRef/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(MetronomesOverviewPage/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /playground-metronome-hero-slider/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformModal, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /size: isCreate \? "small" : "medium"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /title: isCreate \? "Create Metronome Workflow" : "Edit Metronome"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const wallpaperOptions = isCreate \? \[\] : getMetronomeWorkflowWallpaperOptions\(\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const openCreateWorkflowModal = useCallback\(\(\) => \{\s*setWorkflowNameDraft\(""\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /graphFactory: createTriggerOnlyMetronomeGraph/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSecondaryButton/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeVersionSelector/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeRunSidebar/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /metronome-run-composer/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformVersionHistorySidebar, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformVersionSaveDialog, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformDiffViewer, \{/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(RunnerFileDiffSurface, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /initialMode: workflowVersionSaveDialog\.initialMode \|\| "new"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const saveMode = options\?\.mode === "new"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /description: versionDescription/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const openMetronomeVersionHistorySidebar = useCallback\(\(\) => \{\s*setSelectedNodeId\(""\);\s*setMetronomeVersionChangesState\(null\);\s*setIsMetronomeVersionHistorySidebarOpen\(true\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /openVersionHistory: openMetronomeVersionHistorySidebar/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /openVersionHistory: openMetronomeVersionChangesPage/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onViewChanges: \(\) => openMetronomeVersionChangesPage\(\)/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /function renderMetronomeBreadcrumbActions/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformResourceHeaderActions/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformResourceVersionLabel/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformResourceActionsMenu/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformResourceActionsInformation/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformResourceVersionHistoryMenuItem/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /playground-metronome-top-nav-menu-shell/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformPopupSurface/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /Choose Metronome version/);
assert.doesNotMatch(METRONOME_STYLE_FRAGMENTS.overview, /\.playground-metronome-breadcrumb-version-trigger/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /showVersions: !isActiveWorkflowBuiltIn/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /showPublish: !isActiveWorkflowBuiltIn/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const shouldGenerateMetronomePythonFiles = metronomeEditorMode === "code"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformCodeEditorWorkspace, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformMonacoCodeEditor, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-code-monaco-editor"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /ariaLabel: "Metronome code editor"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /variant: "full-screen"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /historyControls: \{\s*onUndo: handleMetronomeCodeUndo,\s*onRedo: handleMetronomeCodeRedo/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const \[metronomeCodeUndoStack, setMetronomeCodeUndoStack\] = useState\(\[\]\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const \[metronomeCodeRedoStack, setMetronomeCodeRedoStack\] = useState\(\[\]\)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /id: "revert",\s*label: "Revert"/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /id: "save",\s*label: "Save"/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-code-view\.is-full-screen-workspace,[\s\S]*?max-width:\s*none/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-code-monaco-editor[\s\S]*?background:\s*#000\s*!important/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /playground-metronome-code-header/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeCodeFileRow/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /const metronomeWorkflowDefinition = useMemo/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /const generatedMetronomePythonCode = useMemo/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const \[activeMetronomeVersionChanges, setActiveMetronomeVersionChanges\] = useState\(false\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const resetActiveMetronomeVisitBaseline = \(workflow, sourceNodes, sourceEdges\) => \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /createMetronomeVisitEditorKey\(activeMetronomeEditorWorkflow, nodes, edges\)[\s\S]{0,120}metronomeVisitBaselineKeyRef\.current/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const hasUnsavedMetronomeChanges = Boolean\(\s*isEditor\s*&& activeWorkflow\s*&& !isActiveWorkflowBuiltIn\s*&& activeMetronomeVersionChanges\s*\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /usePlatformVersionNavigationGuard\(\{[\s\S]{0,220}guardId: "metronome-details-unsaved-changes"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onDiscard: discardActiveMetronomeDraft/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /requestMetronomeNavigation\(performReturnToMetronomeOverview\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /requestMetronomeNavigation\(\(\) => \(\s*onThreadOpen\(thread\.id, \{ contentMode: "chat" \}\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const nextTopNavStateKey = JSON\.stringify\(nextTopNavState\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /publishDisabled: metronomePublishState\.status === "loading" \|\| !activeMetronomeVersionChanges/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const discardActiveMetronomeDraft = useCallback/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const activeMetronomeEditorWorkflow = useMemo/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /flushMetronomeLocalGraphSync/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /metronomeAutosave/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /createMetronomeWorkflowWithSelectedVersionSnapshot/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /saveEditableMetronomeWorkflowApi\(workflowForTest\)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /useEffect\(\(\) => \{\s*if \(!activeWorkflowId \|\| isActiveWorkflowBuiltIn\) return;\s*replaceMetronomeWorkflowInEditableState/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-runs-platform-data-table",\s*surface: "plain",\s*variant: "minimalistic-ui",\s*sticky: false,\s*pagination: \{\}/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /toolbar: \{\s*title: "Runs",\s*search: \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /header: "Run ID"[\s\S]{0,180}accessor: \(run\) => String\(run\?\.id \|\| ""\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /status === "failed"\s*\? "red"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformLabel, \{ variant \}, label\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformResourceDetailSidebar, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-runs-sidebar"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /propertiesClassName: "playground-metronome-runs-property-list"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /label: "Updated"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /creator: creatorIdentity/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /owner: ownerIdentity/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /createMetronomeRunApi\(activeWorkflow\.id/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /"Trigger Run"/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(280px,\s*340px\)/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /column-gap:\s*42px/);
assert.doesNotMatch(METRONOME_STYLE_FRAGMENTS.runs, /flex:\s*0 0 280px/);
assert.doesNotMatch(METRONOME_STYLE_FRAGMENTS.runs, /playground-metronome-runs-owner-row/);
assert.doesNotMatch(METRONOME_STYLE_FRAGMENTS.runs, /playground-metronome-run-status/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /playground-metronome-runs-header/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const renderPalette = \(\) => React\.createElement\("aside"[\s\S]*playground-metronome-palette-list/);
assert.doesNotMatch(METRONOME_PAGE_OVERVIEW_SCRIPT, /playground-metronome-palette-(?:header|back-button|title)/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const getWorkflowOwner =/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /ownerName: owner\.name/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /creatorName: owner\.name/);
assert.doesNotMatch(METRONOME_PAGE_OVERVIEW_SCRIPT, /["']Me["']/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /fetchMetronomeWorkflowPageFromApi[\s\S]{0,500}limit: 20,[\s\S]{0,80}offset: 0/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const loadMoreMetronomeWorkflows = useCallback/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /limit: 10,\s*offset,/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderPlaygroundPlatformPopup/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /function createTriggerOnlyMetronomeGraph[\s\S]*nodes: \[trigger\],[\s\S]*edges: \[\]/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /function renderMetronomeRunTraceThreadSurface/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /function renderSidebarMetronomeRunEntry/);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarState,
  /encodeURIComponent\(entry\.runId\) \+ "\?view=status"/,
);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.teamSharing, /function buildTeamPageMetronomeWorkflowShareMetadata/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /function renderMetronomeTopNavActions/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/metronome\/index\.mjs"/);
assert.match(platformEntrySource, /metronomeService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /MetronomesOverviewPage/);
assert.match(platformEntrySource, /playground-metronome-overview-controls/);
assert.match(platformEntrySource, /ariaLabel: "Workflow scope"/);
assert.match(platformEntrySource, /label: "All Workflows"/);
assert.match(platformEntrySource, /label: "Created by me"/);
assert.match(platformEntrySource, /label: "Shared with me"/);
assert.match(platformEntrySource, /overviewScope: metronomeOverviewScope/);
assert.match(platformEntrySource, /trailing: renderMetronomeBreadcrumbActions\(\)/);
assert.match(platformEntrySource, /React\.createElement\(PlaygroundMetronomePage, \{[\s\S]*?onNavigationGuardChange: registerPlatformNavigationGuard,\s*onNavigationRequest: requestPlatformNavigation/);
assert.match(platformEntrySource, /id: "playground-metronome-node-drawer-root",\s*className: "platform-floating-sidebar-portal"/);
assert.match(platformEntrySource, /PlatformVersionHistorySidebar/);
assert.match(platformEntrySource, /components\/composite\/versioning\/index\.js/);
assert.doesNotMatch(platformEntrySource, /function PlaygroundMetronomePage/);
assert.doesNotMatch(platformEntrySource, /function getThreadMetronomeMetadata/);
assert.doesNotMatch(platformEntrySource, /function openMetronomePage/);
assert.doesNotMatch(platformEntrySource, /function renderMetronomeRunTraceThreadSurface/);
assert.doesNotMatch(platformEntrySource, /function renderSidebarMetronomeRunEntry/);
assert.doesNotMatch(platformEntrySource, /^\s*\.sidebar-metronome-run-group\s*\{/m);
assert.doesNotMatch(platformEntrySource, /pathname\.match\(\/\^\\\/api\\\/real\\\/metronomes/);

const calls = [];
const metronomeService = createMetronomeService({
  proxyUpstreamGet: (...args) => {
    calls.push({ adapter: "get", args });
  },
  proxyUpstreamJsonRequest: (...args) => {
    calls.push({ adapter: "json", args });
  },
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = metronomeService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/metronomes?limit=20&projectId=project_1");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/metronomes?limit=20&projectId=project_1");

result = dispatch("GET", "/api/real/metronomes?limit=10&offset=20&projectId=project_1");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/metronomes?limit=10&offset=20&projectId=project_1");

result = dispatch("GET", "/api/real/metronomes/workflow%201/runs/run%2F1/timeline");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/metronomes/workflow%201/runs/run%2F1/timeline");

result = dispatch("POST", "/api/real/metronomes/workflow_1/runs");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/metronomes/workflow_1/runs");
assert.equal(result.call.args[3], "POST");

result = dispatch("PATCH", "/api/real/metronomes/workflow_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("DELETE", "/api/real/metronomes/workflow_1/runs/run_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/projects");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("OPTIONS", "/api/real/metronomes");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

assert.throws(
  () => createMetronomeService({ proxyUpstreamJsonRequest() {} }),
  /proxyUpstreamGet adapter/,
);
assert.throws(
  () => createMetronomeService({ proxyUpstreamGet() {} }),
  /proxyUpstreamJsonRequest adapter/,
);

console.log("Metronome service module and route contracts passed.");
