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
import { METRONOME_APP_SIDEBAR_ENTRY_SCRIPT } from "./client/shell/sidebar-entry.mjs";
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
    expectedSha256: "2434c3b4ff1b69f268921f43977df4e82b54e739946f631efc16a4245ea172ca",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector runtime",
    source: METRONOME_PAGE_INSPECTOR_SCRIPT,
    expectedSha256: "bc870e64b23273db131850a356112441364d96760d71494a07997f552115a5c7",
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
    expectedSha256: "2fa7864052a25f057dcd4cf6fc6460976955f0a772c71bfe2ebc16d7c3787d16",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector styles",
    source: METRONOME_INSPECTOR_CSS,
    expectedSha256: "c62c066834e7d380ad52debdd5a03673ab146804ccea65890f8eb37cd1066923",
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
assert.match(
  METRONOME_PAGE_CONTROLLER_SCRIPT,
  /createMetronomeDeploymentVersion\(workflowDraft, nodes, edges,/,
  'Publishing must build the deployment from the current canvas nodes and edges.',
);
assert.match(
  METRONOME_PAGE_CONTROLLER_SCRIPT,
  /validateMetronomeDefinitionForPublishUi\(nextDeployment\.definition/,
  'Publishing must validate the current deployment definition, including a newly connected terminal Thread.',
);
assert.match(
  METRONOME_PAGE_CONTROLLER_SCRIPT,
  /const selectedNextNode = \{ \.\.\.nextNode, selected: true \}[\s\S]{0,420}node\.selected \? \{ \.\.\.node, selected: false \} : node[\s\S]{0,420}edge\.selected \? \{ \.\.\.edge, selected: false \} : edge/,
  'New palette nodes must receive the same exclusive visual selection state as a clicked canvas node.',
);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /METRONOME_INFERENCE_BUDGET_POLICY_SCHEMA_VERSION = "computer_agents_metronome_inference_budget_policy_v2"/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /METRONOME_INFERENCE_BUDGET_TOKENS_PER_USD = 100/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /function readMetronomeWorkflowInferenceBudgetPolicy\(/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /const hasExplicitProjectScope = Boolean\(/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /hasExplicitProjectScope[\s\S]{0,100}\{ projectId: null, project_id: null \}/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /hasOwnProperty\.call\(source, "inferenceBudgetPolicy"\)/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /\.\.\.\(inferenceBudgetPolicy \? \{ inferenceBudgetPolicy \} : \{\}\)/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /function stopMetronomeInputKeyPropagation\(event\)\s*\{[\s\S]*?event\.stopPropagation\(\)/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /const METRONOME_BUILT_IN_WORKFLOWS = \[\];/);
assert.doesNotMatch(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /createWorkerVerifierLoopMetronomeGraph|builtin_loop|LOOP COMPLETE/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /METRONOME_LOOP_TYPES = new Set\(\[[^\]]*"repeat_until"/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /verdictBinding:[\s\S]{0,180}"previous\.data\.verdict"/);
assert.match(METRONOME_TRIGGERS_RUNTIME_SCRIPT, /\{ id: "repeat_until", label: "Repeat until verified" \}/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorField\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorInfoTooltip\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.createElement\(PlatformInfoTooltip, \{/);
assert.doesNotMatch(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorSelectorAvatar\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorFieldHint\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorInput\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorTextarea\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorSelect\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.forwardRef\(function MetronomeInspectorNativeSelect\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.createElement\(PlatformSelector, \{/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.createElement\(MetronomeInspectorSelect, \{/);
assert.doesNotMatch(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.createElement\("select",/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorSwitchRow\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorSwitch\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorToolbarPopup\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorPickerPopup\(/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /showHeader = true[\s\S]{0,1800}showHeader\s*\?/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /function MetronomeInspectorPickerRow\(/);
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
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /const getMetronomeInspectorPickerAnchorPoint = \(event\) => \{[\s\S]{0,420}x: inspectorRect\.left,[\s\S]{0,80}y: inspectorRect\.top/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /y: triggerRect\.top/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(PlatformAgentSelector, \{/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /avatarUrl: getMetronomeProfileImageUrl\(agent\)/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTooltipPortal/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /metronomeFieldTooltipPortal/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /description: selectorMode|Team agent|Human collaborator/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\("select",/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /showTypeSelector \? React\.createElement\(MetronomeInspectorField,[\s\S]{0,220}renderMetronomeInspectorSelect\(\{/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /normalizedThreadCommand\(event\.target\.value\)/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /metronomeThreadCommandAvailability\.message/);
assert.match(METRONOME_PAGE_CONTROLLER_SCRIPT, /Checking command availability…/);
assert.match(METRONOME_PAGE_CONTROLLER_SCRIPT, /excludeWorkflowId: activeWorkflowId/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /function normalizeMetronomeThreadTriggerCommand/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /function listMetronomeThreadTriggerOptions/);
assert.match(METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT, /encodeURIComponent\(normalizedWorkflowId\) \+ "\/validate"/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-metronome-thread-command-status\.is-available/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-metronome-thread-command-status\s*\{[\s\S]{0,240}text-align:\s*right/);
assert.doesNotMatch(METRONOME_INSPECTOR_CSS, /\.playground-metronome-firecrawl-fallback-field:has\(> \.playground-metronome-input\) > \.playground-metronome-field-label/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /selectedLoopType === "repeat_until"/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /Managed by Computer Agents and billed as usage\./);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /Create a Secrets resource in Develop mode to use your own Firecrawl key\./);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTitle\("Passing score \(%\)"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTitle\("Stagnation limit"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /renderMetronomeFieldTitle\("Time budget \(min\)"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /const renderMetronomePromptPicker = \(fieldKey,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MessageSquareText,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /surfaceClassName: "playground-metronome-instructions-attachments-popover"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /surfaceClassName: "playground-metronome-prompt-picker"/);
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
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /React\.createElement\(PlatformPopup, \{[\s\S]{0,220}variant: "minimal"[\s\S]{0,220}portal: true[\s\S]{0,220}placement,/);
assert.match(METRONOME_INSPECTOR_COMPONENTS_RUNTIME_SCRIPT, /placement = "left-start"[\s\S]{0,260}React\.createElement\(MetronomeInspectorToolbarPopup/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorPickerPopup, \{[\s\S]{0,260}title: "Dynamic content"[\s\S]{0,260}placement: "left-start"[\s\S]{0,180}portalAnchorPoint:/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorPickerPopup, \{[\s\S]{0,260}title: "Prompts"[\s\S]{0,260}placement: "left-start"[\s\S]{0,180}portalAnchorPoint:/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /title: "Dynamic content"[\s\S]{0,220}showHeader: false/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /title: "Prompts"[\s\S]{0,220}showHeader: false/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorPickerPopup, \{[\s\S]{0,260}title: "Schedule"[\s\S]{0,260}placement: "bottom-end"/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(PlatformPopupSearchHeader,/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorField, \{\s*className: "playground-metronome-inspector-selector-field playground-metronome-agent-selector-field"/);
assert.match(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(MetronomeInspectorField, \{\s*className: "playground-metronome-inspector-selector-field playground-metronome-workspace-selector-field"/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-metronome-inspector-central-selector/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-metronome-field:has\(> \.playground-metronome-select\) > \.playground-metronome-select[\s\S]{0,160}padding:\s*0 0 0 8px/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-metronome-field > \.playground-metronome-inspector-central-selector[\s\S]{0,180}width:\s*0;[\s\S]{0,180}flex:\s*1 1 0%/);
assert.doesNotMatch(METRONOME_INSPECTOR_CSS, /\.playground-metronome-field-tooltip-popover/);
assert.doesNotMatch(METRONOME_INSPECTOR_CSS, /\.playground-metronome-inspector-select-option/);
assert.doesNotMatch(METRONOME_INSPECTOR_CSS, /\.playground-metronome-(?:agent|workspace)-popup/);
assert.doesNotMatch(METRONOME_INSPECTOR_CSS, /\.playground-metronome-custom-select-trigger/);
assert.doesNotMatch(METRONOME_PAGE_INSPECTOR_SCRIPT, /React\.createElement\(PlatformPopupSurface, \{\s*className: "playground-metronome-dynamic-content-picker"/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /metronome(?:Agent|Workspace)Selector(?:Rect|Mode|AnchorRef)/);
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
const readThreadMetronomeMetadata = new Function(
  "normalizeThreadItem",
  `${METRONOME_SHELL_RUNTIME_SCRIPT}\nreturn getThreadMetronomeMetadata;`,
)((value) => value);
assert.deepEqual(
  readThreadMetronomeMetadata({
    id: "thread_stage",
    title: "Mission Control: Legacy title",
    status: "completed",
    metadata: {
      metronome: {
        metronomeId: "met_mission",
        runId: "run_one",
      },
      metronomeWorkflow: {
        workflowId: "met_mission",
        workflowRunId: "run_one",
        workflowName: "Mission Control",
        nodeId: "stage_strategy",
        nodeName: "Update project strategy",
      },
    },
  }),
  {
    metronomeId: "met_mission",
    runId: "run_one",
    nodeId: "stage_strategy",
    status: "completed",
    workflowName: "Mission Control",
    nodeName: "Update project strategy",
  },
  "Workflow metadata must supply the node name when the legacy Metronome record is only partial.",
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
    isMissionControl: false,
    ticketId: "",
    projectId: "project_loop",
    ticketNumber: "PRO-031",
    label: "PRO-031",
  },
);
assert.deepEqual(
  getMetronomeTaskLoopPresentation({
    workflowName: "Mission Control",
    input: {
      source: "project_mission_control",
      projectId: "project_alpha",
      projectName: "Alpha",
      systemWorkflow: { key: "system.mission-control" },
    },
  }),
  {
    isTaskLoop: false,
    isMissionControl: true,
    ticketId: "",
    projectId: "project_alpha",
    projectName: "Alpha",
    ticketNumber: "",
    label: "Mission Control for Alpha",
  },
);
assert.deepEqual(
  getMetronomeTaskLoopPresentation({
    workflowName: "Metronome",
    input: { source: "thread_event", threadId: "thread_mission_control" },
    latestThread: {
      id: "thread_mission_control",
      title: "Mission Control for Alpha",
      metadata: {
        systemWorkflow: { key: "system.mission-control" },
        metronomeWorkflow: {
          systemWorkflowKey: "system.mission-control",
        },
        runnerPlayground: {
          missionControl: {
            source: "project_mission_control_workflow",
            projectId: "project_alpha",
            projectName: "Alpha",
          },
        },
      },
    },
  }),
  {
    isTaskLoop: false,
    isMissionControl: true,
    ticketId: "",
    projectId: "project_alpha",
    projectName: "Alpha",
    ticketNumber: "",
    label: "Mission Control for Alpha",
  },
);
assert.deepEqual(
  getMetronomeTaskLoopPresentation({
    key: "met_mission:run_one",
    metronomeId: "met_mission",
    runId: "run_one",
    workflowName: "Metronome",
    input: { source: "thread_event" },
    latestThread: {
      id: "thread_child",
      title: "Create and clean up issues",
      metadata: {
        metronomeWorkflow: {
          metronomeId: "met_mission",
          runId: "run_one",
          nodeId: "stage_issues",
          isOriginThread: false,
        },
      },
    },
  }, {
    threads: [{
      id: "thread_origin",
      title: "Mission Control for Alpha",
      metadata: {
        systemWorkflow: { key: "system.mission-control" },
        metronomeWorkflow: {
          metronomeId: "met_mission",
          runId: "run_one",
          isOriginThread: true,
          originThreadId: "thread_origin",
        },
        runnerPlayground: {
          missionControl: {
            source: "project_mission_control_workflow",
            projectId: "project_alpha",
            projectName: "Alpha",
          },
        },
      },
    }],
  }),
  {
    isTaskLoop: false,
    isMissionControl: true,
    ticketId: "",
    projectId: "project_alpha",
    projectName: "Alpha",
    ticketNumber: "",
    label: "Mission Control for Alpha",
  },
  "Mission Control identity must survive when the latest run thread is a child node thread.",
);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.sidebar, /sidebar-metronome-run/);
assert.match(
  METRONOME_SHELL_STYLE_FRAGMENTS.sidebar,
  /\.sidebar-metronome-run-icon\.is-loop[\s\S]*?linear-gradient\(180deg, #9a72df 0%, #6542a8 100%\)/,
);
assert.match(
  METRONOME_SHELL_STYLE_FRAGMENTS.sidebar,
  /\.sidebar-metronome-run-icon\.is-mission-control[\s\S]*?linear-gradient\(180deg, #3159a8 0%, #172f68 100%\)[\s\S]*?box-shadow: inset 0 0 0 1px rgba\(137, 178, 255, 0\.16\)/,
);
assert.match(
  METRONOME_APP_SIDEBAR_ENTRY_SCRIPT,
  /loopPresentation\.isMissionControl[\s\S]*?React\.createElement\(RefreshCcwDot/,
  "Mission Control run groups must use the shared RefreshCcwDot icon.",
);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.runTrace, /playground-metronome-run-thread/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.state, /metronomeRunTraceState/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function openMetronomePage/);
assert.match(METRONOME_SHELL_RUNTIME_SCRIPT, /function findMetronomeRunOriginThread/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /originThread: entry\?\.originThread \|\| findMetronomeRunOriginThread\(entry, realThreads\)/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.sidebarState, /existing\.input = entry\?\.input \|\| existing\.input \|\| null/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /createWorkflow/);
assert.doesNotMatch(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /if \(!registeredGroupKey && !isActiveSourceThread\)/,
);
assert.doesNotMatch(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /const absorbedSourceThreadIds = \[\]/,
);
assert.doesNotMatch(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /setRealThreads\(\(current\) => current\.filter\(\(thread\) => String\(thread\?\.id \|\| ""\)\.trim\(\) !== sourceThreadId\)\)/,
);
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
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /openVersionHistory: openMetronomeVersionChangesModal/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onViewChanges: \(\) => openMetronomeVersionChangesModal\(\)/);
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
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /settings: \{[\s\S]{0,500}identity: \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /titleAriaLabel: "Workflow name"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /descriptionAriaLabel: "Workflow description"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /details: settingsDetails/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /location: React\.createElement\(PlatformDeploymentMap, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /additionalSections: budgetSettings/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /access: settingsAccess/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /accessDetailOpen: isMetronomeSettingsAccessDetailOpen/);
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
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const settingsDetails = \{[\s\S]{0,120}variant: "standard"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-settings-sidebar-card"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /propertiesClassName: "playground-metronome-settings-property-list"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /updatedAt: activeWorkflow\?\.updatedAt \|\| activeWorkflow\?\.createdAt/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /creator: creatorIdentity/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /owner: ownerIdentity/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /ownerOptions: activeMetronomeOwnerOptions/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onOwnerTransfer: canTransferActiveMetronomeOwnership[\s\S]{0,120}transferActiveMetronomeOwnership/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onOpenChange: handleActiveMetronomeOwnerSelectorOpenChange/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const selectedProjectScopeIds = getPlatformResourceProjectScopeIds\(workflowMetadata\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /onValuesChange: persistMetronomeWorkflowProjectScope/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformProjectIdentityIcon, \{/);
assert.match(METRONOME_PAGE_CONTROLLER_SCRIPT, /withPlatformResourceProjectScope\([\s\S]{0,180}selectedProjects/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /primaryActions: \[\{/);
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
assert.doesNotMatch(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-settings-stack/);
assert.match(metronomeAccessSettingsSource, /title: "Manage Workflow Access"/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const renderPalette = \(\) => React\.createElement\("aside"[\s\S]*playground-metronome-palette-list/);
assert.doesNotMatch(METRONOME_PAGE_OVERVIEW_SCRIPT, /playground-metronome-palette-(?:header|back-button|title)/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const getWorkflowOwner =/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const getWorkflowCreator =/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const resolveWorkflowVisualKind =/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /workflowKey === "system\.mission-control"/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /workflowKey === "system\.task-loop"/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /visualKind: resolveWorkflowVisualKind\(workflow\)/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /ownerName: owner\.name/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /creatorName: creator\.name/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /creatorAvatarUrl: creator\.avatarUrl/);
assert.doesNotMatch(METRONOME_PAGE_OVERVIEW_SCRIPT, /["']Me["']/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /fetchMetronomeWorkflowPageFromApi[\s\S]{0,500}limit: 20,[\s\S]{0,80}offset: 0/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const loadMoreMetronomeWorkflows = useCallback/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /limit: 10,\s*offset,/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderPlaygroundPlatformPopup/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /function createTriggerOnlyMetronomeGraph[\s\S]*nodes: \[trigger\],[\s\S]*edges: \[\]/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /function renderMetronomeRunTraceThreadSurface/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /function renderMetronomeRunTraceActivitySurface/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /React\.createElement\(PlatformActivityWorkspace, \{/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /composerSurfaceMode: "thread"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /initialSurfaceLoading:[\s\S]{0,260}metronomeRunTraceState\.status === "loading"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /threadViewMode: "legacy"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /"Workflow Logs"/);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.state,
  /metronomeRunTraceWorkExpanded, setMetronomeRunTraceWorkExpanded\] = useState\(false\)/,
  "Workflow-log expansion state must remain isolated from regular thread pages.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /function openMetronomeRunTraceThread[\s\S]*?setMetronomeRunTraceWorkExpanded\(true\)/,
  "Opening a Metronome overview thread must expand workflow logs immediately.",
);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /React\.createElement\(PlatformMetronomeConditionResult, conditionPresentation\)/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /buildPlatformMetronomeConditionResultPresentation/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function enrichMetronomeRunTraceConditionSteps/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.state, /metronomeComposerWorkflowTriggers/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function handleComposerMetronomeWorkflowTriggerSubmit/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /source: "composer_thread_trigger"/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function createMetronomeThreadCommandRunApi/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /\/triggers\/thread-command/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /response\.status === 404/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /composer_thread_trigger/);
assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /createMetronomeExecutionRequestPayload\(normalizedWorkflowId,/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /createMetronomeThreadCommandRunApi\(workflowId,/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /directComposerTrigger: true/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /detail\.mode === "run-overview"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /openMetronomeRunTraceThread\(\{[\s\S]*?metronomeId: normalizedWorkflowId,[\s\S]*?runId: normalizedRunId/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /conditionWorkflowRequest/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /normalizeMetronomeRunTraceResponse\(data, selection, conditionWorkflow\)/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /React\.createElement\(RunnerTurnIdentity, \{/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /React\.createElement\(RunnerThreadLiveWorkStatus, \{/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /contextLabel:/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /className: "playground-metronome-run-trace-live-work-status"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /src: "\/img\/spinner\.svg"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeRunningThreadStatus\(getMetronomeRunningThreadLabel\(step, thread\)\)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /"Thread is running\."/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /getMetronomeRunningThreadLabel\(step, thread\)/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /Thread is running/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /className: "playground-metronome-run-trace-thread-title"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /function isMetronomeRunTraceVisibleStep\(step\)[\s\S]*?kind !== "trigger" && kind !== "end"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /getMetronomeRunTraceSteps\(run\)\.filter\(isMetronomeRunTraceVisibleStep\)\.forEach/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /const visibleSteps = steps\.filter\(isMetronomeRunTraceVisibleStep\)/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /visibleSteps\.map\(\(step, index\) =>/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /isRunWorking && !hasActiveChildThread/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /renderMetronomeRunTraceThreadValue\(conditionInput\)/);
assert.doesNotMatch(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /className: "tb-turn-environment-pill"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformMetronomeConditionResult, conditionPresentation\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /buildPlatformMetronomeConditionResultPresentation\(step, conditionNode\)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeRunTraceValue\(conditionInput\)/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result\s*\{/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result\s*\{[\s\S]*?width:\s*fit-content[\s\S]*?max-width:\s*100%/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result\s*\{[\s\S]*?margin:\s*8px auto 0/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__node-icon\s*\{[\s\S]*?width:\s*20px[\s\S]*?height:\s*20px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__node-icon\s*\{[\s\S]*?background:\s*linear-gradient\(180deg, #3159a8 0%, #172f68 100%\)/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-run-trace-thread-title\s*\{[\s\S]*?padding-bottom:\s*12px[\s\S]*?border-bottom:\s*1px solid rgba\(255, 255, 255, 0\.1\)[\s\S]*?font-size:\s*14px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-run-trace-step > \.tb-thread-live-work-status\s*\{[\s\S]*?margin-left:\s*26px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__condition-node\s*\{[\s\S]*?height:\s*38px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__condition-node\s*\{[\s\S]*?border-radius:\s*10px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__condition-node\s*\{[\s\S]*?width:\s*auto/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__options\s*\{[\s\S]*?width:\s*max-content/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__options\s*\{[\s\S]*?gap:\s*12px/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__option\s*\{[\s\S]*?width:\s*100%/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__option\.is-selected\s*\{[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.9\)[\s\S]*?color:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__branch-line\.is-selected\s*\{[\s\S]*?stroke:\s*rgba\(255, 255, 255, 0\.9\)/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-condition-result__branch-arrow\.is-selected\s*\{[\s\S]*?fill:\s*rgba\(255, 255, 255, 0\.9\)/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /onOpenPromptSearch:/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /onOpenKnowledgeSearch:/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /onOpenThreadSearch:/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /function renderSidebarMetronomeRunEntry/);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /const isCollapsed = collapsedMetronomeRunGroups\[groupKey\] !== false/,
  "Metronome run groups must start collapsed until the user expands them.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /void loadMetronomeSidebarRunThreads\(entry\)/,
  "Expanding a Metronome run group must hydrate its child threads without opening the overview thread.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /React\.createElement\(SidebarThreadListItem, \{[\s\S]*?variant: "workflow-overview"[\s\S]*?onSelect: \(\) => \{[\s\S]*?openMetronomeRunTraceThread\(entry\)/,
  "Opening a Metronome run from the sidebar must use the shared overview navigation path.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /const leadingIcon[\s\S]*?React\.createElement\(WorkflowsSidebarIcon, \{ strokeWidth: 1\.85 \}\)/,
  "Workflow overview rows must keep the shared workflow icon regardless of run state.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /variant: "workflow-overview"[\s\S]*?timeLabel: lastActivityText[\s\S]*?trailingAction: "chevron"/,
  "Workflow overview rows must expose a timestamp and one chevron through the shared item contract.",
);
assert.doesNotMatch(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /Loader2|EllipsisVertical/,
  "Workflow overview rows must not render running, loading, or action-menu spinners and must not expose an ellipsis action.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /onContextMenu: \(event\) => openMetronomeRunActionMenu\(event, entry\)/,
  "Workflow run actions must remain available by right click without consuming the trailing chevron slot.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /function expandMetronomeSidebarRunGroup\(entry\)[\s\S]*?\[key\]: false[\s\S]*?void loadMetronomeSidebarRunThreads\([\s\S]*?function openMetronomeRunTraceThread\(entry\)[\s\S]*?expandMetronomeSidebarRunGroup\(entry\)/,
  "Opening a Metronome run overview must immediately expand and hydrate its node threads.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /trailingAction: "chevron"[\s\S]*?expanded: !isCollapsed[\s\S]*?chevronBusy: isLoadingThreads/,
  "Metronome run groups must delegate their expandable chevron state to the shared thread item.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /async function loadMetronomeSidebarRunThreads[\s\S]*?\/timeline\?view=compact[\s\S]*?collectMetronomeRunTraceChildThreads/,
  "The sidebar must lazily load child threads from the compact run timeline.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /const workflowNodeName = String\([\s\S]*?nodeData\.label[\s\S]*?nodeName: workflowNodeName/,
  "Hydrated run steps must carry their workflow node names into child-thread metadata.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.runController,
  /loadMetronomeSidebarRunThreads[\s\S]*?Promise\.all\([\s\S]*?\/timeline\?view=compact[\s\S]*?encodeURIComponent\(workflowId\)[\s\S]*?normalizeMetronomeRunTraceResponse\(data, selection, workflow\)/,
  "Sidebar hydration must join run timelines with workflow definitions so node titles are available without opening the overview.",
);
assert.match(
  METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView,
  /function collectMetronomeRunTraceChildThreads\(run, selectionOverride = null\)[\s\S]*?buildMetronomeRunTraceChildThreadRecord\([\s\S]*?selectionOverride/,
  "Sidebar child-thread records must retain the run identity while deriving node titles.",
);
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
assert.match(platformEntrySource, /PlatformServiceDetailPage[\s\S]{0,180}platform-ui\/pages\/details\/index\.js/);
assert.match(platformEntrySource, /getPlatformResourceProjectScopeIds[\s\S]{0,240}platform-resources\/projects\/index\.js/);
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
