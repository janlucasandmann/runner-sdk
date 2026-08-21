import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
import { METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT } from "./client/runtime/inspector-components.mjs";
import { METRONOME_INSPECTOR_PROMPTS_RUNTIME_SCRIPT } from "./client/runtime/inspector-prompts.mjs";
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
const metronomeAccessSettingsSource = await readFile(
  new URL("./client/settings/metronome-workflow-access-settings.tsx", import.meta.url),
  "utf8",
);

await Promise.all([
  assertLegacyBrowserSourceContract({
    label: "Metronome controller runtime",
    source: METRONOME_PAGE_CONTROLLER_SCRIPT,
    expectedSha256: "36b16e7e788fc04a78bc73bc7298c5e0e0870c465334aab22391046048a3704e",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector runtime",
    source: METRONOME_PAGE_INSPECTOR_SCRIPT,
    expectedSha256: "9fefb728eb63c2989042ea513008f64a3afd3bb49abfd043ef691bfe6dacf073",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_INSPECTOR_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome templates runtime",
    source: METRONOME_TEMPLATES_RUNTIME_SCRIPT,
    expectedSha256: "63199edb7f6501883527c97c9927ee491b9dac25452fdcbf0f1ffac1fbc2b053",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_TEMPLATES_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome triggers runtime",
    source: METRONOME_TRIGGERS_RUNTIME_SCRIPT,
    expectedSha256: "6648d908a2d9d1e2ffeec402416c14ac194c7d23aa383499e81fa26a1ee4e1ab",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_TRIGGERS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome workflow runtime",
    source: METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT,
    expectedSha256: "2592db8c052d8b9acf3ab8969874e7990e4bf7e7d15311a4e25ee530a60970ea",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector styles",
    source: METRONOME_INSPECTOR_CSS,
    expectedSha256: "71bc37485f0e7f00d1f22094b19b889d1d9da9f77c1b38def7c6d42a64637d5d",
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
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /METRONOME_INFERENCE_BUDGET_POLICY_SCHEMA_VERSION = "computer_agents_metronome_inference_budget_policy_v2"/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /METRONOME_INFERENCE_BUDGET_TOKENS_PER_USD = 100/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /function readMetronomeWorkflowInferenceBudgetPolicy\(/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /hasOwnProperty\.call\(source, "inferenceBudgetPolicy"\)/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /\.\.\.\(inferenceBudgetPolicy \? \{ inferenceBudgetPolicy \} : \{\}\)/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /function stopMetronomeInputKeyPropagation\(event\)\s*\{[\s\S]*?event\.stopPropagation\(\)/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /const METRONOME_BUILT_IN_WORKFLOWS = \[\];/);
assert.doesNotMatch(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /createWorkerVerifierLoopMetronomeGraph|builtin_loop|LOOP COMPLETE/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /METRONOME_LOOP_TYPES = new Set\(\[[^\]]*"repeat_until"/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /verdictBinding:[\s\S]{0,180}"previous\.data\.verdict"/);
assert.match(METRONOME_TRIGGERS_RUNTIME_SCRIPT, /\{ id: "repeat_until", label: "Repeat until verified" \}/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorField\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorFieldHint\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorInput\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorTextarea\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorNativeSelect\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorSwitchRow\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorSwitch\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorToolbarPopup\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /variant: "minimal"/);
assert.match(METRONOME_INSPECTOR_PROMPTS_RUNTIME_SCRIPT, /function normalizeMetronomePromptOption\(/);
assert.match(METRONOME_INSPECTOR_PROMPTS_RUNTIME_SCRIPT, /async function fetchMetronomePromptsApi\(/);
assert.match(METRONOME_INSPECTOR_PROMPTS_RUNTIME_SCRIPT, /async function fetchMetronomePromptApi\(/);
assert.match(METRONOME_INSPECTOR_PROMPTS_RUNTIME_SCRIPT, /getMetronomeApiBaseUrl\(options\) \+ "\/prompts"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorField,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorInput,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorTextarea,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorNativeSelect,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorFieldHint,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorSwitchRow,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorSwitch,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorToolbarPopup,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /selectedLoopType === "repeat_until"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTitle\("Passing score \(%\)"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTitle\("Stagnation limit"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTitle\("Time budget \(min\)"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /const renderMetronomePromptPicker = \(fieldKey,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MessageSquareText,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /surfaceClassName: "playground-metronome-instructions-attachments-popover"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /surfaceClassName: "playground-metronome-dynamic-content-picker playground-metronome-prompt-picker"/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /metronomeAttachmentPopoverRect/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("input",/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("textarea",/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("select",/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("div", \{ className: "playground-metronome-field/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("div", \{ className: "playground-metronome-switch-row/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("(?:div|p)", \{[^}]*className: "playground-metronome-field-hint/);
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
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.createElement\(PlatformPopup, \{[\s\S]{0,220}variant: "minimal"[\s\S]{0,220}portal: true[\s\S]{0,220}placement: "bottom-end"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(PlatformPopupSearchHeader, \{[\s\S]{0,220}playground-metronome-dynamic-content-search/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(PlatformPopupSurface, \{\s*className: "playground-metronome-dynamic-content-picker"/);
assert.match(METRONOME_SHELL_RUNTIME_SCRIPT, /function getThreadMetronomeMetadata/);
assert.match(
  METRONOME_SHELL_RUNTIME_SCRIPT,
  /function getMetronomeTaskLoopPresentation[\s\S]*?systemWorkflowKey === "system\.task-loop"[\s\S]*?originThreadId[\s\S]*?getSidebarThreadTitleParts/,
);
const getMetronomeTaskLoopPresentation = new Function(
  "normalizeThreadItem",
  "getThreadTaskPreview",
  "getSidebarThreadTitleParts",
  "formatPlaygroundProjectTicketNumber",
  `${METRONOME_SHELL_RUNTIME_SCRIPT}\nreturn getMetronomeTaskLoopPresentation;`,
)(
  (value) => value,
  (thread) => thread?.metadata?.runnerPlayground?.taskPreview || null,
  (thread) => ({ taskTicketNumber: String(thread?.title || "").split(" ")[0] }),
  (_project, ticketNumber) => `PRO-${String(Number(ticketNumber)).padStart(3, "0")}`,
);
assert.deepEqual(
  getMetronomeTaskLoopPresentation({
    workflowName: "Loop",
    input: { source: "thread_event", threadId: "thread_loop" },
    latestThread: {
      id: "thread_loop",
      title: "PRO-031 Test Loop",
      metadata: {
        taskContext: { taskType: "loop" },
        runnerPlayground: {
          taskPreview: {
            taskId: "task_loop",
            taskType: "loop",
            projectId: "project_loop",
            ticketNumber: "31",
          },
        },
      },
    },
  }, {
    projects: [{ id: "project_loop", name: "Project" }],
  }),
  {
    isTaskLoop: true,
    ticketId: "",
    projectId: "project_loop",
    ticketNumber: "PRO-031",
    label: "PRO-031",
  },
);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.sidebar, /sidebar-metronome-run/);
assert.match(
  METRONOME_SHELL_STYLE_FRAGMENTS.sidebar,
  /\.sidebar-metronome-run-icon\.is-loop[\s\S]*?linear-gradient\(180deg, #9a72df 0%, #6542a8 100%\)/,
);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.runTrace, /playground-metronome-run-thread/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.state, /metronomeRunTraceState/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function openMetronomePage/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /createWorkflow/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.modeSwitch, /React\.createElement\(PlatformSwitch,[\s\S]*ariaLabel: "Metronome modes"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformButtonSelector,\s*\{\s*mode: "split-action",\s*buttonVariant: "primary"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /label: "Save Changes"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /leading: React\.createElement\(Bookmark/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /label: "Revert Changes"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /label: "Add to Batches"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /targetKind: "metronome_run"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runActionMenu, /"Add to Batches"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runActionMenu, /definition: \{ metronomeId, input: \{\} \}/);
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
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const openMetronomeVersionHistorySidebar = useCallback\(\(\) => \{\s*if \(isActiveWorkflowBuiltIn\) return;\s*setSelectedNodeId\(""\);\s*setMetronomeVersionChangesState\(null\);\s*setIsMetronomeVersionHistorySidebarOpen\(true\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /openVersionHistory: openMetronomeVersionHistorySidebar/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /openVersionHistory: openMetronomeVersionChangesPage/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onViewChanges: \(\) => openMetronomeVersionChangesPage\(\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const isActiveWorkflowBuiltIn = Boolean\(\s*\(activeWorkflow && isMetronomeWorkflowBuiltIn\(activeWorkflow\)\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const renderMetronomeVersionHistorySidebarPortal = \(\) => \{\s*if \(!activeWorkflow \|\| isActiveWorkflowBuiltIn\) return null/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const renderMetronomeVersionHistorySidebar = \(options = \{\}\) => \{\s*if \(!activeWorkflow \|\| isActiveWorkflowBuiltIn\) return null/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /if \(!isActiveWorkflowBuiltIn\) return;\s*setMetronomeVersionChangesState\(null\);\s*setIsMetronomeVersionHistorySidebarOpen\(false\)/);
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
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /systemWorkflow\.locked === true/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /definition\.systemWorkflowKey/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /metronomeEditorMode === "edit" \|\| metronomeEditorMode === "code" \|\| metronomeEditorMode === "settings"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /state\.editorMode === "edit" \|\| state\.editorMode === "code" \|\| state\.editorMode === "settings"/);
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
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const hasUnsavedMetronomeChanges = Boolean\(\s*isEditor\s*&& activeWorkflow\s*&& !isActiveWorkflowBuiltIn\s*&& hasActiveMetronomeVersionChanges\(\)\s*\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /usePlatformVersionNavigationGuard\(\{[\s\S]{0,220}guardId: "metronome-details-unsaved-changes"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onDiscard: discardActiveMetronomeDraft/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /requestMetronomeNavigation\(performReturnToMetronomeOverview\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /requestMetronomeNavigation\(\(\) => \(\s*onThreadOpen\(thread\.id, \{ contentMode: "chat" \}\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const nextTopNavStateKey = JSON\.stringify\(nextTopNavState\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const hasCurrentVersionChanges = hasActiveMetronomeVersionChanges\(\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /publishDisabled: metronomePublishState\.status === "loading" \|\| !hasCurrentVersionChanges/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /if \(before === after\) return null/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const discardActiveMetronomeDraft = useCallback/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const activeMetronomeEditorWorkflow = useMemo/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /flushMetronomeLocalGraphSync/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /metronomeAutosave/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /createMetronomeWorkflowWithSelectedVersionSnapshot/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /saveEditableMetronomeWorkflowApi\(workflowForTest\)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /useEffect\(\(\) => \{\s*if \(!activeWorkflowId \|\| isActiveWorkflowBuiltIn\) return;\s*replaceMetronomeWorkflowInEditableState/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.modeSwitch, /value: "settings", label: "Settings"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const renderMetronomeSettingsMode = \(\) => \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformServiceDetailFrame, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformServiceDetailPage, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-settings-page"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /contentClassName: "playground-metronome-settings-content"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /sidebarClassName: "playground-metronome-settings-sidebar"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformDeploymentMap, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /title: "Deployment region"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /title: "Budget per run"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /label: "Enforce budget per run"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /label: "Budget amount"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /\{ value: "tokens", label: "Tokens" \}/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /ariaLabel: "Workflow budget unit"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSwitch, \{[\s\S]{0,500}ariaLabel: "Workflow budget unit"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /setMetronomeInferenceBudgetPolicyDraft/);
assert.match(METRONOME_PAGE_CONTROLLER_SCRIPT, /inferenceBudgetPolicy: readMetronomeWorkflowInferenceBudgetPolicy\(workflow\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(MetronomeWorkflowAccessSettings, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onMetadataChange: persistMetronomeWorkflowAccessMetadata/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onAddTeamShare: addMetronomeWorkflowTeamAccess/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onRemoveTeamShare: removeMetronomeWorkflowTeamAccess/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onPermissionDetailOpenChange: setIsMetronomeSettingsAccessDetailOpen/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /sidebarCollapsed: isMetronomeSettingsAccessDetailOpen/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformResourceDetailSidebar, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-settings-sidebar-card"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /propertiesClassName: "playground-metronome-settings-property-list"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /label: "Updated"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /creator: creatorIdentity/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /owner: ownerIdentity/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /ownerOptions: activeMetronomeOwnerOptions/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onOwnerTransfer: canTransferActiveMetronomeOwnership[\s\S]{0,120}transferActiveMetronomeOwnership/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onOpenChange: handleActiveMetronomeOwnerSelectorOpenChange/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /async function fetchMetronomeOwnerCandidatesApi[\s\S]{0,500}\/owner-candidates/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /async function transferMetronomeWorkflowOwnershipApi[\s\S]{0,600}\/owner"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /createMetronomeRunApi\(activeWorkflow\.id/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /isTriggeringMetronomeRun \? "Starting\.\.\." : "Run"/);
assert.match(METRONOME_TRIGGERS_RUNTIME_SCRIPT, /const METRONOME_MANUAL_RUN_COMPOSER_TRIGGER_TYPES = new Set/);
assert.match(METRONOME_TRIGGERS_RUNTIME_SCRIPT, /"thread_event",[\s\S]{0,120}"email",[\s\S]{0,120}"telegram",[\s\S]{0,120}"project_ticket",[\s\S]{0,120}"periodic"/);
assert.match(METRONOME_TRIGGERS_RUNTIME_SCRIPT, /function createMetronomeManualRunContracts\(workflow, nodes, edges, options = \{\}\)/);
assert.match(METRONOME_TRIGGERS_RUNTIME_SCRIPT, /function buildMetronomeManualRunInput\(contract, fixture = \{\}, composerPayload = null\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const openManualMetronomeRunDialog = \(\) =>/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const startManualMetronomeRun = async \(dialogOverride = null\) =>/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeManualRunDialog/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /lockAgentSelector: true/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /lockEnvironmentSelector: true/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onClick: openManualMetronomeRunDialog/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const openMetronomeExecutionTestDialog = \(\) =>/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const startMetronomeExecutionTest = async \(dialogOverride = null\) =>/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeExecutionTestDialog/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function getMetronomeNodeTestInputFields\(node\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const getMetronomeExecutionInputFields = \(selection\) =>/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /inputValues: Object\.fromEntries\(inputFields\.map/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformToggle, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(RunnerChat, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-execution-test-composer"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onComposerSubmit: \(payload\) => onComposerSubmit\(field\.id, payload\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /composerSubmitRequest: composerSubmitRequest \?\? null/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const dialogTitle = isSlice[\s\S]{0,180}"Test " \+ \(selectedLabels\[0\] \|\| "node"\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const preview = await previewMetronomeTestRunApi[\s\S]{0,500}createMetronomeTestRunApi/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /Input fixture \(JSON\)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /Execution preview/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /\/test-runs\/preview/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /\/test-runs"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /metronomeRunInlineDetailId\s*\? React\.createElement\(React\.Fragment/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeInlineRunDetail/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-settings-stack[\s\S]*?gap:\s*24px/);
assert.match(metronomeAccessSettingsSource, /title: "Manage Workflow Access"/);
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
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /getMetronomeTaskLoopPresentation\(entry,[\s\S]*?React\.createElement\(RefreshCw[\s\S]*?runTitle/,
);
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
assert.match(platformEntrySource, /\{ label: "Workflows", onClick: \(\) => metronomeTopNavActionsRef\.current\?\.goOverview\?\.\(\) \}/);
assert.match(platformEntrySource, /\[\{ label: "Create" \}, \{ label: "Workflows" \}\]/);
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
