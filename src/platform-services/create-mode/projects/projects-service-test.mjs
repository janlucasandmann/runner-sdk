import assert from "node:assert/strict";

import {
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT,
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  PROJECTS_STYLE_FRAGMENTS,
  PROJECTS_STYLES,
  createProjectsService,
} from "./index.mjs";
import { PROJECT_TYPE_REGISTRY } from "./catalog.mjs";
import { createProjectResourceIndexHandler } from "./server/resource-index.mjs";
import { PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS } from "./client/domain-runtime.mjs";
import {
  PROJECT_OVERVIEW_SCRIPT,
  PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
} from "./client/overview/runtime.mjs";
import {
  PROJECT_OVERVIEW_CSS,
  PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS,
} from "./client/overview/styles.mjs";
import {
  PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS,
  PROJECTS_PAGE_ACTIONS_SCRIPT,
} from "./client/page/actions.mjs";
import {
  PROJECTS_PAGE_DATA_FRAGMENT_PATHS,
  PROJECTS_PAGE_DATA_SCRIPT,
} from "./client/page/data.mjs";
import {
  PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
  PROJECTS_PAGE_SHELL_SCRIPT,
} from "./client/page/shell.mjs";
import {
  PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
  PROJECTS_PAGE_VIEWS_SCRIPT,
} from "./client/page/views.mjs";
import { PROJECTS_VIEWS_02_FRAGMENT } from "./client/page/views/02-project-details-and-calendar.mjs";
import { PROJECTS_VIEWS_04_FRAGMENT } from "./client/page/views/04-task-detail-and-modals.mjs";
import { PROJECTS_CORE_CSS, PROJECTS_CORE_CSS_FRAGMENT_PATHS } from "./client/styles/core.mjs";
import { assertLegacyBrowserSourceContract } from "../../../../apps/platform/testing/legacy-browser-source-contract.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";
import { createTaskBacklogService } from "./server/task-backlog.mjs";

const projectsClientUrl = new URL("./client/", import.meta.url);
const projectsOverviewUrl = new URL("./client/overview/", import.meta.url);
const projectsPageUrl = new URL("./client/page/", import.meta.url);
const projectsStylesUrl = new URL("./client/styles/", import.meta.url);

await Promise.all([
  assertLegacyBrowserSourceContract({
    label: "Projects domain runtime",
    source: PROJECTS_DOMAIN_RUNTIME_SCRIPT,
    expectedSha256: "7eb6fe15b152f18c133925d8801a801731117ea205a8b82dd90de0385d4b1ee5",
    fragmentGroups: [
      {
        baseUrl: projectsClientUrl,
        paths: PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview runtime",
    source: PROJECT_OVERVIEW_SCRIPT,
    expectedSha256: "0fd9bbdffdad678d1c59dfbc7cb7b829f92af9739373e4706d9841c79fae5e1c",
    fragmentGroups: [
      {
        baseUrl: projectsOverviewUrl,
        paths: PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview styles",
    source: PROJECT_OVERVIEW_CSS,
    expectedSha256: "55053c3d887cc6925d2dd8686f969c2de9f9d2b30933159031613805faaee0f3",
    fragmentGroups: [
      {
        baseUrl: projectsOverviewUrl,
        paths: PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects actions runtime",
    source: PROJECTS_PAGE_ACTIONS_SCRIPT,
    expectedSha256: "226388f9c62b271e491adba982d4dac583e9df2c6caf43550cfcda5a0da28dcf",
    fragmentGroups: [
      {
        baseUrl: projectsPageUrl,
        paths: PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects data runtime",
    source: PROJECTS_PAGE_DATA_SCRIPT,
    expectedSha256: "9a9f00d7b19840946decae7829ff0695ac648e0341b366144b781a10e17f19e4",
    fragmentGroups: [
      {
        baseUrl: projectsPageUrl,
        paths: PROJECTS_PAGE_DATA_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects shell runtime",
    source: PROJECTS_PAGE_SHELL_SCRIPT,
    expectedSha256: "832504045746d160db9b7d7f390eea66033a85ebbfe642528bf8b1923a55753b",
    fragmentGroups: [
      {
        baseUrl: projectsPageUrl,
        paths: PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects views runtime",
    source: PROJECTS_PAGE_VIEWS_SCRIPT,
    expectedSha256: "8b8a73186d4e5707f3e14d7a3d036659c88c8f6acf0fb9c1ae566b4ec0bb3cc2",
    fragmentGroups: [
      {
        baseUrl: projectsPageUrl,
        paths: PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects core styles",
    source: PROJECTS_CORE_CSS,
    expectedSha256: "b92432f137e5bd93246b90d32480e4414847f9d6da5fcf4240049d38842e2b27",
    fragmentGroups: [
      {
        baseUrl: projectsStylesUrl,
        paths: PROJECTS_CORE_CSS_FRAGMENT_PATHS,
      },
    ],
    maxFragmentLines: 2_500,
  }),
]);

assert.match(PROJECTS_DOMAIN_FOUNDATION_SCRIPT, /PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID/);
assert.equal(
  PROJECT_TYPE_REGISTRY.find((projectType) => projectType.id === "blank")?.iconId,
  "emoji:🚀",
  "Blank projects must start with the rocket emoji rather than the Lucide rocket glyph.",
);
assert.ok(
  PROJECTS_VIEWS_02_FRAGMENT.indexOf("function renderBacklogTaskContextMenu()") >= 0
    && PROJECTS_VIEWS_02_FRAGMENT.indexOf("function renderBacklogTaskContextMenu()")
      < PROJECTS_VIEWS_02_FRAGMENT.indexOf("function renderBacklogTaskListView("),
  "The shared ticket context menu renderer must stay in Projects-page scope so Progress and Backlog can both mount it.",
);
const taskWorkConfigurationStart = PROJECTS_PAGE_ACTIONS_SCRIPT.indexOf("function getTaskWorkActionConfiguration(");
const taskWorkConfigurationEnd = PROJECTS_PAGE_ACTIONS_SCRIPT.indexOf("function runTaskWorkPrimaryAction(", taskWorkConfigurationStart);
assert.ok(taskWorkConfigurationStart >= 0 && taskWorkConfigurationEnd > taskWorkConfigurationStart);
assert.doesNotMatch(
  PROJECTS_PAGE_ACTIONS_SCRIPT.slice(taskWorkConfigurationStart, taskWorkConfigurationEnd),
  /isTaskConfigLocked/,
  "Shared ticket work actions must receive lock state explicitly instead of capturing ticket-details scope.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT.slice(taskWorkConfigurationStart, taskWorkConfigurationEnd),
  /const isBlockedTask = normalizedTaskStatus === "blocked";[\s\S]*?const mainActionKind = isBlockedTask[\s\S]*?\? "batch"[\s\S]*?\? "Move to Batch"/,
  "Blocked tickets must expose Move to Batch as their safe primary work action.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /configuration\.isBlockedTask[\s\S]*?disabled: true,[\s\S]*?React\.createElement\("span", null, "Start Work"\)/,
  "Blocked ticket menus must keep Start Work visible but disabled.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /React\.createElement\(ScanEye,[\s\S]*?React\.createElement\("span", null, configuration\.popupActionLabel\)/,
  "Review work actions must use Lucide's ScanEye icon.",
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /function renderBacklogTaskContextMenu\(\)[\s\S]*?React\.createElement\(PlatformPopup, \{[\s\S]*?portal: true,[\s\S]*?variant: "minimal",[\s\S]*?portalAnchorPoint: \{[\s\S]*?x: backlogTaskContextMenu\.x,[\s\S]*?y: backlogTaskContextMenu\.y/,
  "Ticket context menus must use the centralized minimal popup portaled to the pointer position.",
);
assert.equal(
  PROJECT_TYPE_REGISTRY.find((projectType) => projectType.id === "blank")?.color,
  "#5f6bdc",
  "Blank projects must default to the third indigo project palette color.",
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /"Add to Batches"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /addToBatch: true/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /targetKind: "project_ticket_action"/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /options\?\.addToBatch !== true && typeof onTaskRunStateChange/);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /if \(options\?\.addToBatch === true\) \{[\s\S]*?openBatchComposer\(\{[\s\S]*?targetResourceId: null,[\s\S]*?return;[\s\S]*?const taskRunRequest = \{/,
  "Opening the Project ticket Batch composer must not create a deferred Thread first.",
);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /preparedThreadId: threadRecord\.id/);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function normalizePlaygroundTaskLoopConfig\(value, task = null\)/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function buildPlaygroundTaskLoopGoalTemplate\(value = null\)[\s\S]*?"\*\*" \+ section\.label \+ "\*\*"[\s\S]*?"- " \+ sectionValue/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function parsePlaygroundTaskLoopGoalMarkdown\(value\)[\s\S]*?parsed\[section\.key\]/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /taskType,\s*loop,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /loop: mergedTask\.taskType === "loop" \? mergedTask\.loop : null/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderPlaygroundTaskLoopFields\(\{[\s\S]*?"Iteration budget"[\s\S]*?"Stagnation limit"[\s\S]*?"Passing score \(%\)"[\s\S]*?"Time budget \(min\)"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderIssueComposerLoopFields\(\)[\s\S]*?return renderPlaygroundTaskLoopFields\(\{\s*task: issueComposerDraft,[\s\S]*?onChange: updateLoop/,
  "Issue creation must use the shared Loop controls renderer.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderTaskDetailLoopContract|playground-tasks-detail__loop-section|"Loop contract"|The durable supervisor uses this contract/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformInfoTooltip, \{\s*title: label,\s*description,\s*runtime,\s*placement: "top-start",\s*ariaLabel: "About " \+ label,/,
  "Loop controls must use the centralized explanatory info tooltip.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /"Iteration budget"[\s\S]*?"The supervisor checks the cycle counter before scheduling more work[\s\S]*?"Stagnation limit"[\s\S]*?"Each verifier result is compared with the best result so far[\s\S]*?"Passing score \(%\)"[\s\S]*?"The normalized verifier score must meet this threshold[\s\S]*?"Time budget \(min\)"[\s\S]*?"The supervisor checks the deadline before another cycle/,
  "Every Loop control must explain both its meaning and runtime enforcement.",
);
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /\{ id: "overview", label: "Progress", icon: LayoutDashboard \}/,
);
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /const PLAYGROUND_PROJECT_STATUS_OPTIONS = \[[\s\S]*?\{ id: "on_track", label: "On Track", icon: CircleCheck, toneClassName: "is-on-track" \}[\s\S]*?\{ id: "completed", label: "Completed", icon: CircleCheck, toneClassName: "is-done" \}/,
);
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /function normalizePlaygroundProjectStatus\(value\)[\s\S]*?PLAYGROUND_PROJECT_STATUS_OPTIONS\.some/,
);
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /\.replace\(\/\[\\s-\]\+\/g, "_"\)/,
);
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /\{ id: "backlog", label: "Backlog", icon: CircleDashed, toneClassName: "is-backlog", manual: true \}/,
);
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /\{ id: "canceled", label: "Canceled", icon: CircleMinus, toneClassName: "is-canceled", manual: true \}/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function renderPlaygroundTaskStatusGlyph\(status, className\)[\s\S]*?presentation\.toneClassName/,
);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /normalizePlaygroundProjectRecord/);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function buildPlaygroundDefaultProjectDraft\(\)[\s\S]*?teamAccessIds: \[\],[\s\S]*?teamAccessRemovedIds: \[\]/,
);
assert.doesNotMatch(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function markPlaygroundProjectAsTeamShared\(/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function hasPlaygroundExplicitProjectIcon\(projectRecord\)[\s\S]*?__projectIconExplicit === false/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function resolvePlaygroundProjectIconId\(projectRecord, \.\.\.fallbackValues\)[\s\S]*?hasPlaygroundExplicitProjectIcon\(projectRecord\)/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const primaryHasIcon = hasPlaygroundExplicitProjectIcon\(primaryProject\)[\s\S]*?__projectIconExplicit: primaryHasIcon \|\| fallbackHasIcon/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const normalizedProjectStatus = normalizePlaygroundProjectStatus\([\s\S]*?project\.status \|\| metadata\?\.status \|\| project\.state[\s\S]*?status: normalizedProjectStatus,[\s\S]*?metadata: \{[\s\S]*?status: normalizedProjectStatus/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const ownerUserId = String\([\s\S]*?project\.ownerUserId[\s\S]*?project\.userId/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function normalizePlaygroundTaskThreadStatusSnapshot/,
);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function getPlaygroundTaskThreadSummaryRecords/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function mergePlaygroundTaskThreadStatusSnapshots/);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function normalizePlaygroundDeliveryAssurance\(value\)[\s\S]*?schemaVersion: "mission_control_delivery_assurance_v1"/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /deliveryAssurance: normalizePlaygroundDeliveryAssurance\([\s\S]*?missionControl\.deliveryAssurance[\s\S]*?missionControl\.delivery_assurance/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /deliveryContract: clonePlaygroundProjectBlueprintValue\([\s\S]*?missionControl\.deliveryContract[\s\S]*?missionControl\.delivery_contract/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /deliveryPlan: clonePlaygroundProjectBlueprintValue\([\s\S]*?missionControl\.deliveryPlan[\s\S]*?missionControl\.delivery_plan/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /canonicalAssurance: \{[\s\S]*?policyId:[\s\S]*?policyVersionId:[\s\S]*?runId:/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /completionPolicy: \{[\s\S]*?taskIds: normalizePlaygroundStrategyTextList/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function buildPlaygroundDefaultReleaseDraft\(\)[\s\S]*?description: "",\s*successCriteria: \[\],\s*successCriteriaInput: ""/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function normalizePlaygroundTaskReleaseRecord\(release\)[\s\S]*?release\.successCriteria[\s\S]*?metadata\?\.successCriteria[\s\S]*?metadata\?\.outcomeSuccessCriteria[\s\S]*?successCriteriaInput: serializePlaygroundMilestoneSuccessCriteria\(successCriteria\)/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function enrichPlaygroundTaskReleasesWithLegacyStrategy\(releaseRecords, projectRecord\)[\s\S]*?shouldUseLegacyDescription = !normalizePlaygroundStrategyText\(release\.description\)[\s\S]*?shouldUseLegacySuccessCriteria = release\.successCriteria\.length === 0[\s\S]*?description: shouldUseLegacyDescription \? legacyDescription : release\.description[\s\S]*?successCriteriaInput: serializePlaygroundMilestoneSuccessCriteria\(successCriteria\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /enrichPlaygroundTaskReleasesWithLegacyStrategy\([\s\S]*?selectedProject/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /async function loadProjectWorkGraph\(projectId\)[\s\S]*?\/work-graph[\s\S]*?agentSessions: \[\]/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT,
  /loadProjectOverviewWorkGraph|projectWorkGraphAutoLoadKeyRef/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT,
  /projectOverviewActivityTab !== "graph"/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /workRelations: Array\.isArray\(tasksData\?\.relations\)[\s\S]*?agentSessions: Array\.isArray\(tasksData\?\.agentSessions\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /event\.eventType === "created"[\s\S]*?event\.taskId \+ ":created"[\s\S]*?actorPriority > existingActorPriority/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /function projectCanonicalWorkRelationsOntoTasks\(tasks, relations, isCanonical\)[\s\S]*?relationType === "blocks"[\s\S]*?relationType === "parent_of"[\s\S]*?workRelations:/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const selectedTaskAgentSessions = useMemo\([\s\S]*?selectedProjectDetail\?\.agentSessions[\s\S]*?attemptNumber/,
);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /const selectedTaskWorkRelations = useMemo\(/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /"Agent runs"[\s\S]*?Open latest agent run[\s\S]*?selectedTaskAgentSessions\.length/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /selectedTaskAgentSessions\.length[\s\S]*?PlatformLabel, \{ variant: "gray" \}, "No runs"/,
);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /"Relations"/);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const taskRunRequest = \{[\s\S]*?executionMode: "deferred"[\s\S]*?\/tasks\/" \+ encodeURIComponent\(task\.id\) \+ "\/run-thread"[\s\S]*?agentSessionRecord[\s\S]*?setSelectedProjectDetail/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const serverOwnsExecution = executionStarted[\s\S]*?\|\| queuedInBatch[\s\S]*?executionRecord\?\.owner === "server"[\s\S]*?\.\.\.\(serverOwnsExecution\s*\? \{\}/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /taskRunIdempotencyKey[\s\S]*?"Idempotency-Key": taskRunIdempotencyKey[\s\S]*?idempotencyKey: taskRunIdempotencyKey/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const nextSuccessCriteria = normalizePlaygroundStrategyTextList\([\s\S]*?successCriteria: nextSuccessCriteria,[\s\S]*?metadata: nextMetadata/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Success criteria",[\s\S]*?successCriteriaInput:[\s\S]*?historyKey: "project-milestone-success-criteria:"[\s\S]*?className: "playground-project-milestone-modal__success-criteria"/,
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /function renderReleaseComposerDialog\(\)[\s\S]*?return React\.createElement\(PlatformModal, \{[\s\S]*?size: "large"[\s\S]*?headerVariant: "search"[\s\S]*?bodyClassName: "playground-project-milestone-modal__body"[\s\S]*?footer: React\.createElement\(React\.Fragment/,
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /title: "Description",\s*value: releaseDraft\.description \|\| "",[\s\S]*?historyKey: "project-milestone-description:"[\s\S]*?className: "playground-project-milestone-modal__description"/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_02_FRAGMENT,
  /handleReleaseDescriptionFormat|playground-tasks-release-modal-description/,
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /className: "playground-project-milestone-modal__delete-button"/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-milestone-modal__success-criteria\.platform-instructions-editor\s*\{[\s\S]*?padding: 12px;[\s\S]*?border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]*?border-radius: 10px;[\s\S]*?background: rgba\(255, 255, 255, 0\.075\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-milestone-modal__delete-button\.platform-button\s*\{\s*background: rgba\(255, 255, 255, 0\.1\) !important;/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_02_FRAGMENT,
  /PlatformModalBackdrop|PlatformModalSurface|createPortal\(modalElement/,
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /className: "playground-projects-feature-grid"[\s\S]*?className: "playground-projects-feature-list", role: "list"/,
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /className: "playground-projects-feature-row",[\s\S]*?role: "listitem"/,
);
assert.doesNotMatch(PROJECTS_VIEWS_02_FRAGMENT, /playground-configure-resource-row/);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-feature-grid\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(280px, 0\.82fr\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-feature-row\s*\{[\s\S]*?grid-template-columns: 44px minmax\(0, 1fr\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-feature-copy\s*\{[\s\S]*?flex-direction: column;[\s\S]*?gap: 4px;/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /toolbarLeading: projectOverviewResourcesTabs,[\s\S]*?tableVariant: "minimalistic-ui"/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /Read the current Knowledge documents before planning[\s\S]*?Define measurable successCriteria directly on every milestone/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /"knowledgeDocuments": an array of complete durable documents[\s\S]*?Always include the complete current Project Strategy document/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function buildPlaygroundProjectMissionControlStorageRecord\(value\)[\s\S]*?knowledgeLibraryId: normalized\.knowledgeLibraryId,[\s\S]*?deliveryPlan:[\s\S]*?lastThreadId: normalized\.lastThreadId/,
);
const missionControlStorageSource = PROJECTS_DOMAIN_RUNTIME_SCRIPT.match(
  /function buildPlaygroundProjectMissionControlStorageRecord\(value\) \{([\s\S]*?)\n\s*function resolvePlaygroundProjectKnowledgeLibraryId/,
)?.[1] || "";
assert.doesNotMatch(missionControlStorageSource, /\bdocument\s*:|\bstrategyBrief\s*:/);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function buildPlaygroundProjectKnowledgeRunContext\(projectRecord, source = "project_task"\)[\s\S]*?mode: "propose"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /Generate Outcomes|Edit Outcome|Add Outcome/,
);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /buildPlaygroundProjectLinkedFilePathIndex/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /createPlaygroundProjectTeamRolePermissionSet/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function PlaygroundTasksPage/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderProjectOverviewView/);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[projectFullAutoState, setProjectFullAutoState\] = useState\(\{[\s\S]*?runId: ""[\s\S]*?status: "idle"[\s\S]*?steps: \[\][\s\S]*?completedCount: 0[\s\S]*?failedCount: 0/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function startProjectFullAutoMode\(\)[\s\S]*?\/automation-runs[\s\S]*?"Idempotency-Key": idempotencyKey/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function performProjectFullAutoAction\(action\)[\s\S]*?\["pause", "resume", "cancel"\]/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function requestMissionControlDeliveryAction\(action\)[\s\S]*?\["start", "reconcile", "retry", "cancel"\][\s\S]*?\/delivery-plan\/execution\//,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function approveMissionControlDeliveryAssurance\(\)[\s\S]*?evidenceFingerprint[\s\S]*?\/assurance\/runs\/[\s\S]*?\/approve[\s\S]*?\/delivery-plan\/execution\/reconcile/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function getProjectFullAutoEligibleTasks\(\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformButtonSelector, \{\s*mode: "split-action",\s*buttonVariant: "primary",[\s\S]*?label: isMissionControlRunning \? "Running Mission Control" : "Mission Control",[\s\S]*?popupVariant: "minimal",[\s\S]*?fullWidth: true,[\s\S]*?onAction: \(\) => \{[\s\S]*?openMissionControlComposer\(\);[\s\S]*?fullAutoActionLabel[\s\S]*?openProjectOverviewUpdateComposer\(\)[\s\S]*?\}, "Post Update"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectFullAutoSidebarCard/);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const shouldRefreshBaseProjectBeforePatch = options\.refreshBaseProject !== false;/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /refreshedBaseMissionControl\.deliveryContract[\s\S]*?normalizedMissionControlRecord\.deliveryContract[\s\S]*?refreshedBaseMissionControl\.deliveryPlan[\s\S]*?normalizedMissionControlRecord\.deliveryPlan/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /canonical project-delivery provisioner[\s\S]*?computer_agents_project_delivery_contract_v3[\s\S]*?evaluations import-dataset[\s\S]*?datasetAssetId[\s\S]*?services\.workflowAcceptance[\s\S]*?services\.guardrails[\s\S]*?projects delivery preview[\s\S]*?Only after a successful preview[\s\S]*?projects delivery apply/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /enable repairPolicy[\s\S]*?maximumAttempts[\s\S]*?repairableStages from test, evaluate, and acceptance_evaluate[\s\S]*?requireChangedResourceRevision true[\s\S]*?attestation failures fail closed/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /projects delivery execute[\s\S]*?projects delivery status[\s\S]*?projects delivery retry[\s\S]*?server-owned supervisor is the only authority/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformUiCard, \{[\s\S]*?cardTitle: "Delivery execution"[\s\S]*?stage\.retryCount[\s\S]*?Verified cost[\s\S]*?"Approve evidence"[\s\S]*?requestMissionControlDeliveryAction\("retry"\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /re_evaluate: "Re-evaluate",[\s\S]*?acceptance_evaluate: "Workflow acceptance"[\s\S]*?stageId === "acceptance_evaluate" \? "skipped"[\s\S]*?retryableDeliveryStageIds[\s\S]*?"acceptance_evaluate"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /deliveryRepairEpisode[\s\S]*?deliveryRepairStatus[\s\S]*?"Autonomous repair passed"[\s\S]*?"Autonomous repair exhausted"[\s\S]*?"Autonomous repair failed"[\s\S]*?diagnosticFingerprint[\s\S]*?allowedResourceKeys/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformModal, \{[\s\S]*?title: "Approve delivery evidence"[\s\S]*?approveMissionControlDeliveryAssurance[\s\S]*?assuranceEvidenceFingerprint/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /currentDeliveryContractSection[\s\S]*?validationAssetCount[\s\S]*?caseCount/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function renderTaskPreviewStatusControl\(taskRecord\)[\s\S]*?return React\.createElement\(PlatformSelector, \{/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function handleToggleTaskActivitySubscription\(\)[\s\S]*?\/activity-subscription[\s\S]*?subscribed: nextSubscribed/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /activity: normalizePlaygroundTaskActivityList\(\[[\s\S]*?resolvedTask\.activity[\s\S]*?savedTask\.activity/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /hasOwnProperty\.call\(overrides, "comments"\)[\s\S]*?\? savedTask\.comments/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /hasOwnProperty\.call\(overrides, "activity"\)[\s\S]*?\? normalizePlaygroundTaskActivityList\(savedTask\.activity\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /\/activity-subscription[\s\S]*?setTaskActivitySubscriptionState\(\{[\s\S]*?status: "ready"/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /return \(\) => controller\.abort\(\);\s*\}, \[\s*backendUrl,\s*projectTaskDetailScreenOpen,\s*requestHeadersKey,\s*selectedProjectId,\s*selectedTaskId,\s*\]\);/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const requestedSectionId = String\(projectNavViewRequest\?\.sectionId \|\| ""\)\.trim\(\);[\s\S]*?setProjectOverviewHomeTab\(requestedHomeTab\);/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const requestedProjectOverviewHomeTab = requestedView === "overview"[\s\S]*?navigationRequest\?\.sectionId === "resources"[\s\S]*?projectOverviewNavigationHomeTabRef\.current = requestedProjectOverviewHomeTab[\s\S]*?setProjectOverviewHomeTab\(requestedProjectOverviewHomeTab\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const requestedProjectResourceSnapshot = navigationRequest\?\.projectResourceSnapshot[\s\S]*?projectOverviewServerResourcesLoadKeyRef\.current = "";[\s\S]*?setProjectOverviewServerResourcesState\(\{[\s\S]*?requestedProjectResourceSnapshot\.serverResources\.slice\(\)[\s\S]*?setProjectOverviewFileActivityState\(\{[\s\S]*?requestedProjectResourceSnapshot\.fileActivity\.slice\(\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /function settleProjectWorkspaceLoadFailure\(projectId, error, fallbackMessage\)[\s\S]*?const canUseCachedWorkspace = hasCachedProjectWorkspace\(projectId\)[\s\S]*?status: canUseCachedWorkspace \? "ready" : "error"[\s\S]*?error: canUseCachedWorkspace \? "" : message/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /return settleProjectWorkspaceLoadFailure\([\s\S]*?"Project details are temporarily unavailable\."[\s\S]*?return settleProjectWorkspaceLoadFailure\([\s\S]*?"Project workspace is temporarily unavailable\."/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /taskLoadState\.status === "error" && tasks\.length > 0[\s\S]*?Failed to refresh project tasks/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /sectionId: taskView === "overview" \? projectOverviewHomeTab : ""/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const projectRecordForNavigation = sourceProjectRecord[\s\S]*?attachments: Array\.isArray\(overviewProjectAttachments\)[\s\S]*?linkedResources: Array\.isArray\(projectOverviewLinkedResources\)[\s\S]*?resourceTemplates: Array\.isArray\(projectOverviewPublishedTemplates\)[\s\S]*?onOpenProjectLinkedResource\([\s\S]*?projectRecord: projectRecordForNavigation,[\s\S]*?projectResourceSnapshot: \{[\s\S]*?serverResources:[\s\S]*?projectOverviewServerResourcesState\.items\.slice\(\)[\s\S]*?fileActivity:[\s\S]*?projectOverviewFileActivityState\.items\.slice\(\)[\s\S]*?sectionId: "resources"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT,
  /handleProjectOverviewHomeTabChange\(projectNavViewRequest\?\.sectionId\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[taskActivitySubscriptionState, setTaskActivitySubscriptionState\] = useState/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[projectOverviewOwnerCandidatesState, setProjectOverviewOwnerCandidatesState\] = useState/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /Tests prove engineering behavior, Evaluations prove agent\/workflow quality, and Agent Optimization must be backed by baseline-versus-candidate Evaluation evidence/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /"deliveryAssurance": an object with schemaVersion "mission_control_delivery_assurance_v1"/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /The returned delivery plan is the sole authority for Function, Metronome, Test Plan\/version, component Evaluation\/version, workflow-acceptance Evaluation\/version, planned Agent Optimization job, Assurance Policy\/version, and task IDs/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /Never self-approve a manual Assurance gate/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /"canonicalAssurance": \{"policyId":string,"policyVersionId":string,"runId":string\}/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /Mark a gate passed only when the referenced platform evidence already exists/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /getPlaygroundTaskStatusLabel\(normalizedValue\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /normalizedValue === "backlog" \? "todo"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-activity-subscription-button"[\s\S]*?activitySubscribed \? UserRoundMinus : UserRoundPlus[\s\S]*?activitySubscribed \? "Unsubscribe" : "Subscribe"/,
);
assert.doesNotMatch(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-activity-subscription-button\.platform-button/,
);
assert.doesNotMatch(PROJECTS_PAGE_DATA_SCRIPT, /handleTaskStatusMenuPointerDown/);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /taskStatusMenuRef/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderTaskDetailSelectControl\([\s\S]*?return React\.createElement\(PlatformSelector, \{/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /placeholder: "Change type\.\.\.",[\s\S]*?shortcut: "T"[\s\S]*?leading: renderTaskDetailTypeBadge\(option\.id\),[\s\S]*?trailing: option\.shortcut/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function renderTaskActorModeSwitch\([\s\S]*?return React\.createElement\(PlatformSwitch, \{[\s\S]*?className: "playground-tasks-detail-assignee-mode-switch"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /popoverId: "assignee"[\s\S]*?popupHeader: renderTaskActorModeSwitch\(\{\s*ariaLabel: "Assignee type",[\s\S]*?filteredTaskDetailAssignableActors\.map/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /popoverId: "reviewer"[\s\S]*?popupHeader: renderTaskActorModeSwitch\(\{\s*ariaLabel: "Reviewer type",[\s\S]*?filteredTaskDetailAssignableActors\.map/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /popoverId: "schedule"[\s\S]*?popupContent: renderTaskScheduleDialog\(\{ embedded: true \}\)/,
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /popupAriaLabel: "Edit ticket schedule"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderTaskDetailSelectOptionRow/);
assert.doesNotMatch(PROJECTS_PAGE_DATA_SCRIPT, /handleTaskDetailSelectPopoverPointerDown/);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /taskDetailSelectPopoverRef/);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-detail-fact-control \.playground-tasks-detail-central-selector\s*\{\s*width: 100%;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-schedule-type-switch\.platform-switch\s*\{\s*width: 100%;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-workspace-inner\.playground-tasks-ticket-screen-inner\s*\{[^}]*max-width: var\(--platform-page-content-max-width, 87\.5rem\);/,
);
assert.doesNotMatch(
  PROJECTS_CORE_CSS,
  /\.playground-project-workspace-inner\.playground-tasks-ticket-screen-inner\s*\{[^}]*max-width: none;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-overview\s*\{\s*padding-top: 0 !important;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-overview[\s\S]*?\.playground-project-detail-overview-layout\s*\{\s*--project-detail-sticky-offset: 42px;\s*padding-top: var\(--project-detail-sticky-offset\);/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-general-grid\s*\{\s*display: grid;\s*grid-template-columns: minmax\(0, 1fr\);\s*gap: 42px;/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /tabBarActions: activeProjectOverviewHomeTab === "general"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /playground-project-overview-summary-mission-button/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewWallpaperSettingsSection\(\),/,
  "Project Settings must not render the background-image selector section.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewSettingsLayout\(sections, options = \{\}\)[\s\S]*?data-project-settings-section[\s\S]*?activeSection\.render\(\)/,
  "Project Settings must render only its active section inside the focused settings layout.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /id: "plugins",\s*label: "Plugins"[\s\S]*?id: "timeline",\s*label: "Timeline"[\s\S]*?id: "rules",\s*label: "Rules"[\s\S]*?id: "access",\s*label: "Access"/,
  "Project Settings must expose the Plugins, Timeline, Rules, and Access section links in order.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /id: "plugins",\s*label: "Plugins",\s*icon: Plug[\s\S]*?id: "timeline",\s*label: "Timeline",\s*icon: History[\s\S]*?id: "rules",\s*label: "Rules",\s*icon: ListTodo[\s\S]*?id: "access",\s*label: "Access",\s*icon: KeyRound/,
  "Project Settings section links must expose their Lucide icons.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-settings-layout\s*\{[\s\S]*?grid-template-columns: 220px minmax\(0, 1fr\);/,
  "Project Settings must use the dedicated left-navigation layout.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const isAccessDetail = activeSection\.id === "access"[\s\S]*?projectOverviewPermissionTeamId[\s\S]*?!isAccessDetail \? React\.createElement\("aside"/,
  "A focused team access page must omit the outer Project Settings navigation.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function normalizeProjectAccessRoleId\(principalId, roleId, fallback = "member"\)[\s\S]*?\["owner", "admin", "developer", "member", "billing", "viewer"\]\.includes\(normalizedRoleId\)/,
  "Organization member access must preserve every durable organization role.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const selectedAccessRoleId = normalizeProjectAccessRoleId\([\s\S]*?selectedRoleId: selectedAccessRoleId/,
  "Project access details must render the selected organization role without collapsing to Member.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /onSelectedPrincipalIdChange: \(principalId\) => \{[\s\S]*?!normalizedPrincipalId[\s\S]*?setProjectOverviewHomeTab\("permissions"\)[\s\S]*?setProjectOverviewSettingsSection\("access"\)/,
  "Closing Project access details must return to the Project Settings access section.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-settings-layout\.is-access-detail\s*\{\s*grid-template-columns: minmax\(0, 1fr\);\s*gap: 0;/,
  "A focused team access page must leave the centralized Roles layout at full width.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-settings-navigation__header\s*\{[\s\S]*?padding-bottom: 0;[\s\S]*?border-bottom: 0;[\s\S]*?\.playground-project-settings-navigation__title\s*\{[\s\S]*?color: rgba\(255, 255, 255, 0\.62\);[\s\S]*?font-size: 12px;/,
  "Project Settings must keep its navigation heading subdued and divider-free.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-timeline-settings \.playground-project-settings-section__title\s*\{[\s\S]*?margin: 0 0 8px;/,
  "Project Timeline must keep eight pixels below its title.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-settings-content[\s\S]*?\.playground-project-overview-plugins-panel[\s\S]*?\.playground-plugins-section-title,[\s\S]*?\.playground-project-settings-section__title,[\s\S]*?\.playground-project-overview-strategy-add-title,[\s\S]*?\.platform-data-table__toolbar-title,[\s\S]*?\.playground-team-role-permission-title\s*\{\s*font-size: 18px;/,
  "Project Settings must normalize all active content section titles to 18px.",
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectConnectorCredentialRouting\(projectOverviewDraft/,
  "Project Settings must not duplicate credential routing below its plugin rows.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewIntegrationRow\(row\)[\s\S]*?requestProjectConnectorBrowserOpen\(row\.source, \{[\s\S]*?projectId: rowProjectId,[\s\S]*?projectRecord: selectedProject/,
  "Each project plugin row must open the centralized project connector explorer.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /row\.source === "github"[\s\S]*?React\.createElement\(PlatformSecondaryButton, \{[\s\S]*?playground-project-overview-integration-manage-button[\s\S]*?\}, "Manage"\)/,
  "The GitHub project plugin must use the centralized Manage button instead of an inline repository selector.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /row\.repositories\.map\(\(repository\) => React\.createElement\(RunnerProjectGithubRepositorySettings, \{[\s\S]*?updateProjectGithubRepositorySettings/,
  "Selected GitHub repositories must expose their persisted branch and pull-request settings below the plugin row.",
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function requestProjectConnectorBrowserOpen\(source, options = \{\}\)[\s\S]*?setTaskConnectorBrowserMode\("project"\);\s*setTaskConnectorBrowserOpen\(true\);/,
  "Project plugin rows must launch the shared file explorer in project mode.",
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function handleTaskConnectorGithubBranchChange\(item, nextBranch\)[\s\S]*?React\.createElement\(RunnerGithubBranchSelector, \{[\s\S]*?onValueChange: \(branch\) => handleTaskConnectorGithubBranchChange/,
  "GitHub repository rows in the centralized explorer must expose a base-branch selector.",
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /branchPrefix:[\s\S]*?createPullRequests:[\s\S]*?branch-prefix=[\s\S]*?pull-requests=/,
  "Project GitHub branch naming and pull-request policies must survive normalization and reach agent context.",
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const connectorAccessSection = buildPlaygroundConnectorPromptSection\([\s\S]*?normalizedTask\.connectors[\s\S]*?connectorAccessSection,/,
  "Project ticket prompts must include the detailed connector branch and pull-request policy context.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const launchConnectors = mergePlaygroundTaskConnectorSelections[\s\S]*?buildPlaygroundTaskRunPrompt\(\{[\s\S]*?connectors: launchConnectors,/,
  "Project ticket runs must merge project connector policy before building their hidden execution prompt.",
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function buildCentralizedConnectorConnection\(source\)[\s\S]*?accounts,[\s\S]*?selectedAccountId,[\s\S]*?onAccountChange: \(accountId\) => \{[\s\S]*?updateProjectConnectorCredentialBinding\([\s\S]*?accounts[\s\S]*?const centralizedConnections = \{/,
  "The shared project explorer must expose project credential routing through its centralized account contract.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-settings-add-rule-button"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /Add Teams|Add teams to project|playground-project-teams-add-button/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const systemPrincipal = getPlatformSystemAccessPrincipal\(selectedPermissionTeam\?\.id\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderPlaygroundPermissionsPage/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformResourceAccessSettings, \{\s*teams: projectSharedTeams\.map/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /resourceLabel: "Project",\s*selectedPrincipalId: projectOverviewPermissionTeamId,[\s\S]*?teamSubjectType: "project_team_role"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /roles: systemPrincipal\s*\? undefined\s*:\s*PLAYGROUND_TEAM_ROLE_DEFINITIONS\.map/,
  "Organization principals must use the centralized organization-role definitions.",
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformRolePermissionsPage/);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-plugins-list\s*\{[\s\S]*?border-top: 0;/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewActivityTasks\(items = buildProjectOverviewActivityItems\(\)\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /tabs: \[\s*\{ id: "threads", label: "Threads" \},\s*\{ id: "activity", label: "Activity" \},\s*\]/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /\{ id: "strategy", label: "Strategy" \}/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /\{ id: "graph", label: "Work Graph" \}/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /value: activeProjectOverviewSectionTab[\s\S]*?variant: "minimal"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const isThreadsTab = activeProjectOverviewSectionTab === "threads"[\s\S]*?const projectOverviewSectionTabs = React\.createElement\(PlatformDetailTabBar,[\s\S]*?isThreadsTab\s*\?\s*renderProjectOverviewThreadsSection\(\{\s*embedded: true,\s*toolbarLeading: projectOverviewSectionTabs,/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformActivityTimeline, \{[\s\S]*?items: activityTimelineItems/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const activityEvents = getProjectOverviewTaskActivityEvents\(\);[\s\S]*?buildProjectOverviewTaskActivityTimelineItems\(activityEvents\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /endActions: isActivityTab\s*\?\s*renderProjectOverviewTaskActivityParticipants\(activityEvents\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewTaskActivityParticipantKey\(event\)[\s\S]*?\"agent:\" \+ actorAgentId[\s\S]*?\"user:\" \+ actorUserId/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformLoadingState, \{[\s\S]*?message: \"Loading activity\.\.\.\"[\s\S]*?centered: true/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-activity-participant-avatar\s*\{[\s\S]*?width: 20px;[\s\S]*?height: 20px;[\s\S]*?border-radius: 50%;/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /event\?\.eventType !== "comment_added"[\s\S]*?fieldName === "description"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /\.slice\(0, 5\)[\s\S]*?\.map\(\(event\) =>/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /function isLegacyProjectTaskActivityRoute\(result\)[\s\S]*?message === "task not found"/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /async function loadLegacyProjectOverviewTaskActivity\(projectId, tasks, loadToken\)[\s\S]*?const batchSize = 4/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /isLegacyProjectTaskActivityRoute\(activityResult\)[\s\S]*?await loadLegacyProjectOverviewTaskActivity\(projectId, nextTasks, loadToken\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /async function loadProjectHome\(projectId\)[\s\S]*?\/projects\/" \+ encodeURIComponent\(projectId\) \+ "\/home"/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const workspaceMode = taskView === "overview" \? "home" : "workspace"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT,
  /costSummaryRequestTarget/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /playground-project-overview-activity-show-more/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /typeof openProjectTaskDetailScreen === "function"/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewActivityParticipants\(activityItems\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[projectOverviewActivityTab, setProjectOverviewActivityTab\] = useState\("threads"\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /setProjectOverviewActivityTab\("threads"\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /new URL\(backendUrl \+ "\/tasks\/activity", window\.location\.origin\)[\s\S]*?searchParams\.set\("projectId", projectId\)[\s\S]*?searchParams\.set\("limit", "50"\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT,
  /normalizedEvent\.eventType === "comment_added"/,
  "Project-wide activity loading must retain ticket comments for the Progress timeline.",
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /normalizedEvent\.eventType === "field_changed" && fieldName === "description"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectWorkActivityListSummary\(event, ticketNumber\)[\s\S]*?" created "[\s\S]*?ticket/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /summary: renderProjectWorkActivityListSummary\(\s*event,\s*ticketNumber\s*\),\s*avatar:/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-activity-card\.is-main \.playground-project-overview-activity-list\s*\{\s*gap: 12px;/,
);
assert.equal(
  (PROJECT_OVERVIEW_SCRIPT.match(/React\.createElement\(PlatformUiCard, \{/g) || []).length,
  3,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /className: "playground-project-featured-resource-card"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /variant: "sidebar",\s*className: "playground-project-overview-sidebar-card"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Properties"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Resources"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Milestones"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-sidebar-card playground-project-overview-milestones-card"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /getProjectOverviewMilestoneRecords\(\)[\s\S]*?getPlaygroundTaskReleaseStatus\(release\)[\s\S]*?=== "active"[\s\S]*?getProjectOverviewMilestoneProgress\(release\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-milestones-card__progress"[\s\S]*?"--project-milestone-progress": String\(progress\.percent\) \+ "%"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /String\(progress\.completed\) \+ " of " \+ String\(progress\.total\)/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /playground-project-overview-milestones-card__more/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-tasks-detail-facts is-centralized-sidebar-content playground-project-overview-sidebar-facts"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-tasks-detail-fact playground-project-overview-sidebar-row"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-sidebar-mission-button",[\s\S]*?actionDisabled: !canOpenMissionControl \|\| isMissionControlRunning,[\s\S]*?popupDisabled: false/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewSidebarRow\("Owner", owner\.name,[\s\S]*?platform-resource-detail-sidebar__owner-row[\s\S]*?ariaLabel: "Project owner"[\s\S]*?includeOrganizationMembers: true/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewSidebarRow\("Lead"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /async function transferProjectOverviewOwnership\(candidate\)[\s\S]*?\/owner"[\s\S]*?ownerUserId: nextOwner\.userId/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /async function requestProjectOverviewOwnerCandidates\(options = \{\}\)[\s\S]*?\/owner-candidates"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewProgressAnalyticsSection\(\)[\s\S]*?React\.createElement\(PlatformAnalyticsSection, \{\s*variant: "default",\s*title: "Activity",\s*analytics: buildProjectOverviewSidebarProgressAnalytics\(\),\s*className: "playground-evaluations-analytics-card playground-project-overview-progress-analytics"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const resourceCount = Array\.isArray\(projectOverviewAllResourceRows\)[\s\S]*?resources: "#9ff6ce"[\s\S]*?scope: "#8fc4ff",\s*started: "#4da3ff",\s*completed: "#7657ff"[\s\S]*?id: "resources",\s*label: "Resources",\s*value: resourceCount/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(ProjectSummary, \{[\s\S]*?renderProjectOverviewProgressAnalyticsSection\(\),\s*renderProjectOverviewSpotlightSection\(\)\s*\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /projectOverviewActivePanel[\s\S]*?renderProjectOverviewUpdateComposerModal\(\)/,
  "The update composer must remain mounted at the project shell.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewStatusFeed\(\)[\s\S]*?const latestProjectUpdate = getProjectOverviewUpdateRecords\(\)\.find\([\s\S]*?normalizeProjectOverviewUpdateKind\(record\?\.kind\) === "update"[\s\S]*?getProjectOverviewCreationUpdate\(\)[\s\S]*?className: "playground-project-activity-feed__title" \}, "Activity"[\s\S]*?renderProjectOverviewTimelineFilter\(\)[\s\S]*?className: "playground-project-activity-feed__latest-update"[\s\S]*?renderProjectOverviewUpdateCard\(latestProjectUpdate,[\s\S]*?showUpdateAction: true/,
  "Progress must feature the latest interactive project update immediately below its Activity heading.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewTimelineFilter\(\)[\s\S]*?PROJECT_ACTIVITY_EVENT_TYPES\.map[\s\S]*?React\.createElement\(PlatformToggle,[\s\S]*?setProjectActivityEventTypeEnabled/,
  "The Progress Activity filter must reuse the persisted Settings event taxonomy and toggles.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewSpotlightTasks\(\)[\s\S]*?blocked: 4,[\s\S]*?slice\(0, 3\)/,
  "Project Spotlight must include blocked tickets as the fourth-priority fallback.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewSpotlightSection\(\)[\s\S]*?className: "playground-project-overview-spotlight__grid"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewSpotlightSection\(\)[\s\S]*?className: "playground-project-overview-spotlight__title"[\s\S]*?"Spotlight"[\s\S]*?className: "playground-project-overview-spotlight__view-all"[\s\S]*?setTaskView\("backlog"\)[\s\S]*?"View all"/,
  "Project Spotlight must expose a heading and a View all action that opens the backlog.",
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewSidebarProgressSection|playground-project-overview-sidebar-progress-card|Project progress grouping/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /playground-project-overview-sidebar-progress/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /playground-project-overview-sidebar-progress-title/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewSidebarProgressAnalytics\(\)[\s\S]*?return \{\s*title: "Progress"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /buildProjectOverviewSidebarProgressGroups/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewGeneralPanel\(\)[\s\S]*?renderProjectOverviewProgressUsageChartSection\(\)/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-sidebar-card\s*\{\s*overflow: visible;\s*\}/,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /return React\.createElement\(PlatformSelector, \{/);
assert.equal(
  (
    PROJECT_OVERVIEW_SCRIPT.match(
      /renderProjectOverviewSidebarSelectControl\(\s*"(?:status|priority|computer)"/g,
    ) || []
  ).length,
  3,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformOwnerSelector, \{/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /ariaLabel: "Project owner"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "platform-resource-detail-sidebar__owner-selector playground-tasks-detail-central-selector playground-project-overview-sidebar-selector"/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewSidebarRow\("Type"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewSidebarRow\("Status", currentStatusOption\.label,[\s\S]*?ariaLabel: "Project status"[\s\S]*?React\.createElement\(PlatformPopupSearchHeader,[\s\S]*?onValueChange: \(nextStatus\)[\s\S]*?updateProjectOverviewSidebarProjectProperty\(\{\s*status: normalizedStatus,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const normalizedProjectStatus = normalizePlaygroundProjectStatus\([\s\S]*?metadataPayload = \{[\s\S]*?status: normalizedProjectStatus,[\s\S]*?return \{[\s\S]*?status: normalizedProjectStatus,/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewSidebarRow\("Status"[\s\S]*?renderProjectOverviewSidebarRow\("Priority"/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-status-icon\.is-on-track\s*\{\s*color: #85df7b;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-sidebar-row\.is-owner\s*\{[\s\S]*?margin-top: 12px;[\s\S]*?padding-top: 12px;[\s\S]*?border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /popupClassName: "playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewSidebarSelectOption/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /playground-project-overview-sidebar-select-(?:shell|menu|option)/,
);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /handleProjectOverviewSidebarPropertyPointerDown/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /headerActions: React\.createElement\(PlatformSecondaryButton/,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /ariaLabel: "Project threads",\s*variant: "minimalistic-ui"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /useCentralSearch: true,\s*useCentralNewSelector: true,\s*useCentralFilterPopup: true/,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /viewMode: "list"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /toolbarLeading: projectOverviewResourcesTabs,\s*tableVariant: "minimalistic-ui",\s*showViewToggle: false/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const activeProjectOverviewResourcesTab = projectOverviewResourcesTab === "threads"[\s\S]*?tabs: \[\s*\{ id: "resources", label: "Resources" \},\s*\{ id: "threads", label: "Threads" \},\s*\][\s\S]*?onValueChange: setProjectOverviewResourcesTab,[\s\S]*?variant: "minimal"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /activeProjectOverviewResourcesTab === "threads"\s*\? renderProjectOverviewThreadsSection\(\{\s*embedded: true,\s*toolbarLeading: projectOverviewResourcesTabs,/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[projectOverviewResourcesTab, setProjectOverviewResourcesTab\] = useState\("resources"\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /setProjectOverviewActivityTab\("threads"\);\s*setProjectOverviewResourcesTab\("resources"\);\s*\}, \[selectedProjectId\]\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /renderNewMenuItems: renderProjectOverviewResourceNewMenuItems/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /threads: projectOverviewFilteredThreads,[\s\S]*?pagination: \{\s*value: projectOverviewThreadPagination,\s*onChange: setProjectOverviewThreadPagination,\s*pageSizeOptions: \[5\]/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const toggleVisibleProjectOverviewThreadSelection = \(nextSelectedIds\)[\s\S]*?setSelectedProjectOverviewThreadIds\(new Set\(nextSelectedIds\)\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /hasMoreProjectThreads|projectOverviewVisibleThreadCount/);
assert.doesNotMatch(PROJECT_OVERVIEW_CSS, /playground-project-overview-threads-load-more/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /trailing: React\.createElement\(PlatformSecondaryButton/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewRecommendedTemplatesEmptyState\(\) \{\s*return React\.createElement\("div", \{ className: "playground-project-resources-empty has-templates" \},\s*React\.createElement\("div", \{ className: "playground-project-resource-template-grid" \},\s*projectOverviewRecommendedTemplates\.map\(\(template\) => renderProjectOverviewTemplateCard\(template\)\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Recommended templates"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Start with resources that fit this project type/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-resource-template-browse-button"[\s\S]*?React\.createElement\("span", null, "All Templates"\)/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-resource-template-actions\s*\{\s*display: flex;\s*justify-content: center;\s*margin-top: 12px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-resource-template-card\s*\{\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);\s*border-radius: 15px;\s*background: rgba\(255, 255, 255, 0\.075\);/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewOutcomesTab/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewSummaryHeader\(\)[\s\S]*?React\.createElement\(ProjectSummary, \{[\s\S]*?iconOptions: PLAYGROUND_PROJECT_ICON_OPTIONS,[\s\S]*?colorOptions: PLAYGROUND_PROJECT_ACCENT_COLORS,[\s\S]*?persistProjectOverviewSidebarProjectUpdate/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(ProjectSummary, \{[\s\S]*?onProjectNameChange: \(nextName\) => updateProjectOverviewNameDraftValue\(nextName\),[\s\S]*?onProjectNameCommit: \(nextName\) => saveProjectOverviewName\(nextName\)/,
  "The Progress header must expose the project name as an editable, persisted field.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewSummaryHeader\(\)[\s\S]*?React\.createElement\(ProjectSummary, \{[\s\S]*?\}\),\s*renderProjectOverviewProgressAnalyticsSection\(\),\s*renderProjectOverviewSpotlightSection\(\)\s*\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(ProjectSummaryDetails/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewCreationUpdate\(projectRecord = projectOverviewDraft \|\| selectedProject\)[\s\S]*?resolveProjectOverviewUpdateAuthorIdentity\(\{[\s\S]*?body: authorIdentity\.name \+ " created this project\."[\s\S]*?authorAvatarUrl: authorIdentity\.avatarUrl[\s\S]*?kind: "project_created"[\s\S]*?isSynthetic: false/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function resolveProjectOverviewUpdateAuthorIdentity\(value = \{\}\)[\s\S]*?storedAuthorName\.includes\("@"\)[\s\S]*?getTaskWorkspaceMemberByUserId\(authorUserId\)[\s\S]*?memberAvatarUrl[\s\S]*?normalizeSessionPhotoUrl\(rawAvatarUrl\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const updateAuthorIdentity = resolveProjectOverviewUpdateAuthorIdentity\(update\);[\s\S]*?renderProjectOverviewSidebarAvatar\(\s*actorName,\s*updateAuthorIdentity\.avatarUrl\s*\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "platform-project-update-card__header"[\s\S]*?className: "platform-project-update-card__meta"[\s\S]*?renderProjectOverviewUpdateStatus\(update\.status\)[\s\S]*?className: "platform-project-update-card__action"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Latest update"/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "platform-project-update-card__interaction-actions"[\s\S]*?PlatformIconButton[\s\S]*?PlatformEmojiPicker/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /async function persistProjectOverviewUpdateMutationFallback\(nextUpdate\)[\s\S]*?isSynthetic: false[\s\S]*?persistProjectOverviewSidebarProjectUpdate/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /No project updates have been posted yet\./,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const projectCreatorEmailName = projectCreatorEmail[\s\S]*?formatAccountDisplayName\([\s\S]*?const projectCreationUpdate = isEditMode[\s\S]*?kind: "project_created"[\s\S]*?projectUpdates: \[projectCreationUpdate\],[\s\S]*?latestUpdate: projectCreationUpdate/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /onResourcesSelect: \(\) => setProjectOverviewHomeTab\("resources"\),\s*onMilestonesSelect: \(\) => setProjectOverviewHomeTab\("milestones"\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /function getProjectSummaryTeams\(/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const projectSharedTeamIds = new Set\([\s\S]*?getPlatformSharedTeamIds\(projectMetadata\)[\s\S]*?const unsharedWorkspaceTeams = availableWorkspaceTeams/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const scopedProjectOverviewFileActivityItems = String\(projectOverviewFileActivityState\?\.projectId \|\| ""\)\.trim\(\) === normalizedSelectedProjectId/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /taskView !== "overview" \|\| !String\(selectedProjectId \|\| ""\)\.trim\(\)[\s\S]*?requestProjectOverviewWorkspaceTeams\(\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /projectOverviewFileActivityLoadKeyRef\.current !== loadKey[\s\S]*?projectId: normalizedProjectId[\s\S]*?items: nextItems/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /async function postProjectOverviewUpdate\(event, options = \{\}\)[\s\S]*?\/projects\/" \+ encodeURIComponent\(projectId\) \+ "\/updates"[\s\S]*?method: "POST"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewUpdateActivityEvents\(\)[\s\S]*?eventType: "project_update_posted"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /isStrategyTab|renderProjectOverviewDescriptionEditor/);
assert.ok(
  PROJECT_OVERVIEW_SCRIPT.indexOf("const projectOverviewDraft =")
    < PROJECT_OVERVIEW_SCRIPT.indexOf("function renderProjectOverviewSummaryHeader()"),
  "The project summary adapter must be composed inside the overview renderer after its project draft is initialized.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /onSummaryChange: \(nextSummary\) => \{[\s\S]*?updateProjectDescriptionDraftValue\(nextSummary,[\s\S]*?onSummaryCommit: \(nextSummary\) => saveProjectOverviewDescription\(nextSummary\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /function updateProjectDescriptionDraftValue\(nextValue, options = \{\}\)[\s\S]*?projectDescriptionDirtyProjectIdRef\.current = draftProjectId[\s\S]*?description: normalizedNextValue,[\s\S]*?metadata: \{[\s\S]*?description: normalizedNextValue/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const hasUnsavedDescription = projectDescriptionDirtyProjectIdRef\.current === selectedProject\.id;[\s\S]*?projectDescriptionEditingRef\.current[\s\S]*?\|\| hasUnsavedDescription/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const descriptionRevision = projectDescriptionRevisionRef\.current;[\s\S]*?const hasNewerDescriptionDraft = \([\s\S]*?projectDescriptionRevisionRef\.current !== descriptionRevision[\s\S]*?description: nextDescription/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /async function loadProjectWorkspace\(projectId, options = \{\}\)[\s\S]*?options\?\.loadProjectConfig === true[\s\S]*?const projectDetailPromise = shouldLoadProjectConfig[\s\S]*?if \(projectDetailPromise\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const workspaceMode = taskView === "overview" \? "home" : "workspace";[\s\S]*?workspaceMode === "home"[\s\S]*?\? loadProjectHome\(selectedProjectId\)[\s\S]*?: loadProjectWorkspace\(selectedProjectId, \{[\s\S]*?loadProjectConfig: selectedProjectDetail\?\.project\?\.id !== selectedProjectId/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /async function loadProjects\(\)[\s\S]*?backendUrl \+ "\/projects\?view=overview"/,
);
const projectListLoaderStart = PROJECTS_PAGE_DATA_SCRIPT.indexOf("async function loadProjects()");
const projectListLoaderEnd = PROJECTS_PAGE_DATA_SCRIPT.indexOf(
  "function normalizeProjectCostSummaryResponse",
  projectListLoaderStart,
);
assert.ok(projectListLoaderStart >= 0 && projectListLoaderEnd > projectListLoaderStart);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT.slice(projectListLoaderStart, projectListLoaderEnd),
  /resolvePlaygroundTeamSharedProjects|\/teams\/|resource-shares/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /async function openProjectComposerForEdit\(projectRecord\)[\s\S]*?projectRecord\?\.isOverviewRecord[\s\S]*?\/projects\/" \+ encodeURIComponent\(projectId\)/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-icon-picker__trigger-icon\s*\{[\s\S]*?background: color-mix\(in srgb, var\(--project-icon-color\) 18%, transparent\)/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /rawValue\.toLowerCase\(\)\.startsWith\("emoji:"\)[\s\S]*?function PlaygroundProjectEmojiIcon/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /title: selectedProjectWorkspaceTitle,\s*icon: selectedProject\.icon \|\| selectedProject\.metadata\?\.icon \|\| "",\s*color: selectedProject\.color \|\| selectedProject\.metadata\?\.color \|\| ""/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /projectOverviewOutcome/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /projectOverviewOutcome/);
assert.doesNotMatch(PROJECT_OVERVIEW_CSS, /playground-project-overview-outcome/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const strategyKpis =/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-progress-combo-metrics"/,
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformLoadingState/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading projects\.\.\."/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading project\.\.\.",\s*centered: true/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const isProjectTaskDetailInitialLoading = Boolean\([\s\S]*?taskDetailHydrationId !== selectedTaskDetailHydrationId[\s\S]*?taskDetailHydrationStatus === "loading"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectTaskDetailLoadingState\(\) \{[\s\S]*?className: "playground-projects-loading-state playground-tasks-ticket-loading-state",\s*message: "Loading ticket\.\.\.",\s*centered: true/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /isDirectTaskNavigationPending\s*\? renderProjectTaskDetailLoadingState\(\)[\s\S]*?isProjectTaskDetailInitialLoading\s*\? renderProjectTaskDetailLoadingState\(\)/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-main-scroll\.is-project-workspace > \.playground-tasks-ticket-loading-state\s*\{[\s\S]*?min-height: 100%;[\s\S]*?background: #000;/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /playground-tasks-loading-copy" \}, "Loading project/,
);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /historyKey: "full-strategy:" \+ selectedProject\.id/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(TicketDetailPage, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "is-neutral",\s*icon: History/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-detail-thread-meta/);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /"\/tasks\/" \+ encodeURIComponent\(taskId\) \+ "\?threadDetails=summary"/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /"\/threads\/" \+ encodeURIComponent\(threadId\) \+ "\/status"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const normalizedTaskId = String\(draftTask\?\.id[\s\S]{0,2500}\/threads\?limit=240/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(TicketDetailPage, \{\s*details: renderTaskDetailFactsSection\(\{ contentOnly: true \}\),/,
);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /header: taskDetailNavbar/);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /const taskDescriptionEditorTitle = isFullPageTaskDetail[\s\S]*?className: "playground-tasks-ticket-editor-title-input"[\s\S]*?: "Description";/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-content \.platform-instructions-editor__title\s*\{[\s\S]*?font-size: 18px;/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /document\.getElementById\("playground-ticket-breadcrumb-actions-root"\)[\s\S]*?createPortal\([\s\S]*?React\.createElement\(PlatformResourceHeaderActions, \{[\s\S]*?React\.createElement\(PlatformResourceActionsMenu, \{[\s\S]*?resourceLabel: "Ticket"[\s\S]*?React\.createElement\(PlatformResourceActionsInformation, \{[\s\S]*?copyAriaLabel: "Copy Ticket ID"[\s\S]*?React\.createElement\(PlatformResourceActionMenuItem, \{[\s\S]*?label: "Delete",[\s\S]*?danger: true/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /React\.createElement\("div", \{ className: "playground-tasks-detail-fact is-assignee" \},/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /popoverId: "schedule"[\s\S]*?className: "playground-tasks-detail-fact is-assignee"[\s\S]*?popoverId: "assignee"/,
);
assert.match(PROJECTS_VIEWS_04_FRAGMENT, /popoverId: "color"/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /popoverId: "environment"/);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-sidebar \.playground-tasks-detail-fact\.is-assignee\s*\{\s*margin-top: 12px;\s*padding-top: 12px;\s*border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/,
);
assert.doesNotMatch(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-sidebar-section\.platform-ui-card\.is-sidebar\s*\{[^}]*padding-top:\s*0;/,
  "Ticket details must preserve the shared sidebar card's internal top padding.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /details: renderTaskDetailFactsSection\(\{ contentOnly: true \}\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /threads: renderTaskDetailThreadsSection\(\{\s*contentOnly: true,/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /function renderTaskActivitySection\(\)[\s\S]*?React\.createElement\(PlatformActivityTimeline, \{/,
);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /function renderTaskDetailThreadsSection\(/);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /trailing: threadStatus[\s\S]*?React\.createElement\(PlatformLabel,[\s\S]*?threadStatus\.label/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /avatar: isStatus[\s\S]*?renderPlaygroundTaskStatusGlyph\(\s*event\.nextValue,\s*"platform-activity-timeline__status-icon"\s*\)[\s\S]*?icon: isMilestoneChange[\s\S]*?\? Flag[\s\S]*?: isScheduleChange[\s\S]*?\? CalendarIcon[\s\S]*?: isFieldChange[\s\S]*?\? PencilRuler/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /const isPriorityChange = isFieldChange[\s\S]*?fieldName \|\| ""\)\.trim\(\) === "priority"[\s\S]*?renderPlaygroundTaskPriorityIcon\(\s*event\.nextValue,\s*"platform-activity-timeline__priority-icon"\s*\)/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /fieldName === "releaseId" \|\| fieldName === "milestoneId"[\s\S]*?changed milestone to[\s\S]*?cleared milestone/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /const isScheduleChange = isFieldChange[\s\S]*?"dueAt"[\s\S]*?"scheduledStartAt"[\s\S]*?"scheduledEndAt"[\s\S]*?"scheduleType"[\s\S]*?"scheduleEnabled"/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /canHumanReviewTask[\s\S]*?handleApproveTaskReview/,
);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /canRequestTaskChanges|canAgentReviewTask|Start Agent Review/);
assert.doesNotMatch(
  PROJECTS_VIEWS_04_FRAGMENT,
  /taskStartPending \? "Starting\.\.\." : "Run Thread"/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /normalizePlaygroundTaskActivityList\(\[[\s\S]*?draftTask\.activity[\s\S]*?syntheticEvents/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const hasDirectComments = Object\.prototype\.hasOwnProperty\.call\(task, "comments"\)[\s\S]*?const comments = hasDirectComments\s*\? directComments\s*: metadataComments;/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const hasDirectActivity = Object\.prototype\.hasOwnProperty\.call\(task, "activity"\)[\s\S]*?const activity = hasDirectActivity\s*\? directActivity\s*: metadataActivity;/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /const normalizedTaskDescription = String\(draftTask\.description \|\| ""\)[\s\S]*?return normalizedCommentText !== normalizedTaskDescription;/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /const normalizedFieldName = String\(event\.fieldName \|\| ""\)\.trim\(\)\.toLowerCase\(\);[\s\S]*?event\.eventType === "field_changed" && normalizedFieldName === "description"[\s\S]*?event\.eventType === "comment_added"[\s\S]*?return Boolean\(event\.comment && !event\.comment\.parentCommentId\);/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /onSubmit: async \(files\) => Boolean\(await handleAddTaskComment\(\{\s*inline: true,\s*body: taskActivityCommentValue,\s*files,/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /allowAttachments: true,[\s\S]*?submitting: taskActivityCommentPending/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_04_FRAGMENT,
  /className: "playground-tasks-activity-composer-avatar"/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const submittedFiles = normalizeTaskAttachmentUploadFiles\(options\?\.files\);[\s\S]*?uploadTaskAttachmentFiles\(submittedFiles,[\s\S]*?allowWithoutEnvironment: true,[\s\S]*?attachments: commentAttachments/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function applyTaskCommentMutation\(savedTaskRecord, comments, activity\)[\s\S]*?shouldPreserveDirtyDraft[\s\S]*?comments: normalizedComments,\s*activity: normalizedActivity/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function handleEditTaskComment\(commentId, nextText\)[\s\S]*?isTaskCommentByCurrentUser\(existingComment\)[\s\S]*?editedAt: new Date\(\)\.toISOString\(\)[\s\S]*?patchTaskRecord\(draftTask, \{\s*comments: nextComments,\s*activity: nextActivity,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function handleDeleteTaskComment\(commentId\)[\s\S]*?isTaskCommentByCurrentUser\(existingComment\)[\s\S]*?removedCommentIds[\s\S]*?event\.eventType !== "comment_added"[\s\S]*?patchTaskRecord\(draftTask, \{\s*comments: nextComments,\s*activity: nextActivity,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /Object\.prototype\.hasOwnProperty\.call\(overrides, "comments"\)[\s\S]*?Object\.prototype\.hasOwnProperty\.call\(overrides, "activity"\)/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /Object\.prototype\.hasOwnProperty\.call\(overrides, "activity"\)[\s\S]*?nextRunnerPlayground\.activity = nextActivity/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /actions: isComment\s*&& isTaskCommentByCurrentUser\(comment\)\s*&& !isTaskConfigLocked[\s\S]*?onEdit: \(nextText\) => handleEditTaskComment\(comment\.id, nextText\),\s*onDelete: \(\) => handleDeleteTaskComment\(comment\.id\)/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const attachments = normalizePlaygroundTaskAttachmentList\([\s\S]*?metadata\.attachments[\s\S]*?metadata,\s*attachments,/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const commentAttachments = normalizePlaygroundTaskAttachmentList\([\s\S]*?draftTask\?\.comments[\s\S]*?const isPreviewedTaskAttachmentEditable = useMemo/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /className: "playground-tasks-activity-comment-attachments"[\s\S]*?renderTaskAttachmentChip\(attachment, \{ removable: false \}\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /showHeaderCopy: false,\s*showCloseButton: false,\s*showResizeHandle: false/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /previewTitle: previewedTaskAttachment\?\.filename \|\| "Attachment preview",\s*previewHeaderActions: previewedTaskAttachment\s*&& isPreviewedTaskAttachmentEditable\s*&& !isTaskConfigLocked\s*\? React\.createElement\(PlatformAttachmentActionMenu, \{[\s\S]*?onRename: \(nextName\) => handleRenameTaskAttachment\(previewedTaskAttachment\.id, nextName\),\s*onDelete: \(\) => handleRemoveTaskAttachment\(previewedTaskAttachment\.id\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /previewPortalTarget: taskAttachmentPreviewPortalTarget,\s*onPreviewClose: \(\) => setPreviewedTaskAttachmentId\(""\)/,
);
assert.match(PROJECTS_PAGE_SHELL_SCRIPT, /attachmentPreviewPortalId = ""/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const taskAttachmentPreviewPortalTarget = isFullPageTaskDetail[\s\S]*?document\.getElementById\(attachmentPreviewPortalId\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function handleTaskDetailBack\(\) \{\s*const parentTaskId = isPlaygroundSubtaskRecord\(draftTask\)[\s\S]*?openProjectTaskDetailScreen\(parentTaskId\);[\s\S]*?handleCloseTaskDetail\(\);/,
);
const taskDetailBackFunctionSource = PROJECTS_PAGE_ACTIONS_SCRIPT.match(
  /function handleTaskDetailBack\(\) \{[\s\S]*?\n        \}/,
)?.[0];
assert.ok(taskDetailBackFunctionSource, "Expected the assembled task-detail back handler.");
function createTaskDetailBackContract(draftTask) {
  const navigationEvents = [];
  const handler = new Function(
    "draftTask",
    "isPlaygroundSubtaskRecord",
    "getPlaygroundTaskParentTaskId",
    "openProjectTaskDetailScreen",
    "handleCloseTaskDetail",
    taskDetailBackFunctionSource + "\nreturn handleTaskDetailBack;",
  )(
    draftTask,
    (task) => task?.taskType === "subtask" && Boolean(task?.parentTaskId),
    (task) => String(task?.parentTaskId || "").trim() || null,
    (taskId) => navigationEvents.push({ action: "open", taskId }),
    () => navigationEvents.push({ action: "close" }),
  );
  return { handler, navigationEvents };
}
const subtaskBackContract = createTaskDetailBackContract({
  id: "task-child",
  taskType: "subtask",
  parentTaskId: "task-parent",
});
subtaskBackContract.handler();
assert.deepEqual(subtaskBackContract.navigationEvents, [{ action: "open", taskId: "task-parent" }]);
const topLevelBackContract = createTaskDetailBackContract({
  id: "task-parent",
  taskType: "task",
  parentTaskId: null,
});
topLevelBackContract.handler();
assert.deepEqual(topLevelBackContract.navigationEvents, [{ action: "close" }]);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /taskDetailBackDestination/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /playground-tasks-ticket-page-back-link/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /playground-tasks-ticket-sidebar-toggle-button/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-ticket-page-nav-ticket-row/);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /const selectedTaskHeaderTicketNumber = selectedTaskId/);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /ticketNumber: selectedTaskHeaderTicketNumber/);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const selectedTaskHeaderType = selectedTaskId[\s\S]*?normalizePlaygroundTaskType\(selectedTaskSnapshot\?\.taskType \|\| selectedTaskSnapshot\?\.type\)/,
);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /taskType: selectedTaskHeaderType/);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const openTaskHeaderNavigationIds = useMemo\(\(\) => \([\s\S]*?!isPlaygroundTaskTerminalStatus\(task\.status\)[\s\S]*?parsePlaygroundTaskTicketNumber\(/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const selectedTaskHeaderNavigation = useMemo\(\(\) => \{[\s\S]*?currentIndex: currentIndex \+ 1,[\s\S]*?totalCount: openTaskHeaderNavigationIds\.length,[\s\S]*?previousTaskId:[\s\S]*?nextTaskId:/,
);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /ticketNavigation: selectedTaskHeaderNavigation/);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const requestToken = String\(projectNavTaskRequest\?\.token \|\| ""\)\.trim\(\);[\s\S]*?handleSelectTask\(requestedTaskId, \{ screen: true \}\);/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const requestedTaskDetailMode = navigationRequest\?\.taskDetailMode === "screen"[\s\S]*?screen: requestedTaskDetailMode === "screen"/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const matchingRequestedTaskRecord = requestedTaskRecord\?\.id === requestedTaskId[\s\S]*?handleSelectProject\(requestedProjectId, \{[\s\S]*?taskRecord: matchingRequestedTaskRecord,[\s\S]*?openTaskScreen: requestedTaskDetailMode === "screen"/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /handleSelectTask\(pendingExternalTaskOpenRequest\.taskId, \{\s*screen: pendingExternalTaskOpenRequest\.screen === true,\s*\}\);/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const initialNavigationOpensTaskScreen = Boolean\([\s\S]*?const initialNavigationTaskRecord = \(\(\) => \{[\s\S]*?initialNavigationTaskRecord \? \[initialNavigationTaskRecord\] : \[\][\s\S]*?Boolean\(initialNavigationTaskRecord && initialNavigationOpensTaskScreen\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const isDirectTaskNavigationPending = Boolean\([\s\S]*?message: "Loading ticket\.\.\."/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /extraActions: taskView === "board"\s*\? renderProjectAppHeaderMilestoneSelector\(\)\s*: null/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const backlogHeaderAction = React\.createElement\(React\.Fragment, null,[\s\S]*?renderProjectAppHeaderMilestoneSelector\(\)[\s\S]*?headerAction: backlogHeaderAction/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformInstructionsEditor, \{\s*value: resolveTaskDescriptionAttachmentFiles\(\s*String\(draftTask\.description \|\| ""\),\s*draftTask\.attachments\s*\),[\s\S]*?historyKey: "ticket-description:" \+ draftTask\.id,\s*variant: "minimalistic-ui",\s*contentVariant: "file-enabled",[\s\S]*?fileUpload: \{\s*upload: uploadTaskDescriptionFiles/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /upload: uploadTaskDescriptionFiles,\s*resolvePreviewSource: resolveTaskDescriptionFilePreviewSource/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /upload: uploadIssueComposerDescriptionFiles,\s*resolvePreviewSource: resolveTaskDescriptionFilePreviewSource/,
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /onChange: handleTaskDescriptionEditorChange/);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function buildTaskDescriptionUploadedFiles\(attachments\)[\s\S]*?src: resolveTaskAttachmentInlineImageUrl\(attachment\)[\s\S]*?metadata: \{ taskAttachment: attachment \}/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /async function resolveTaskDescriptionFilePreviewSource\(file, signal\)[\s\S]*?getTaskAttachmentStableApiUrl\(attachmentId\)[\s\S]*?headers: requestHeaders[\s\S]*?return await response\.blob\(\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function handleTaskDescriptionEditorChange\(nextValue, context = \{\}\)[\s\S]*?reconcileTaskDescriptionDraftRecord\(current, nextValue, context\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function handleIssueComposerDescriptionEditorChange\(nextValue, context = \{\}\)[\s\S]*?parsePlaygroundTaskLoopGoalMarkdown\(nextDraft\.description\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function reconcileTaskDescriptionAttachments\(description, attachments\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function resolveTaskAttachmentInlineImageUrl\(attachment\)[\s\S]*?getTaskAttachmentWorkspaceDownloadUrl\(attachment\)[\s\S]*?getTaskAttachmentStableApiUrl\(attachment\.id\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function buildTaskDescriptionAttachmentLookup\(attachments\)[\s\S]*?byId[\s\S]*?byFilename[\s\S]*?byUrl/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function resolveTaskDescriptionAttachmentImageUrls\(description, attachments\)[\s\S]*?attachmentLookup[\s\S]*?replacePlatformInstructionsEditorImageMarkdown/,
);

const attachmentImageHelpersStart = PROJECTS_PAGE_SHELL_SCRIPT.indexOf(
  "function makeTaskAttachmentUrlPortable",
);
const attachmentImageHelpersEnd = PROJECTS_PAGE_SHELL_SCRIPT.indexOf(
  "function resolveTaskAttachmentPreviewUrl",
  attachmentImageHelpersStart,
);
assert.ok(
  attachmentImageHelpersStart >= 0 && attachmentImageHelpersEnd > attachmentImageHelpersStart,
);
const createAttachmentImageHelpers = new Function(
  "window",
  "resolveTaskAttachmentApiUrl",
  "getTaskAttachmentWorkspaceDownloadUrl",
  "normalizePlaygroundTaskAttachmentList",
  "normalizePlaygroundTaskAttachmentRecord",
  "normalizePlatformInstructionsEditorImageSource",
  "replacePlatformInstructionsEditorImageMarkdown",
  "serializePlatformInstructionsEditorImageMarkdown",
  "serializePlatformInstructionsEditorFileMarkdown",
  PROJECTS_PAGE_SHELL_SCRIPT.slice(attachmentImageHelpersStart, attachmentImageHelpersEnd) +
    "\nreturn { resolveTaskAttachmentInlineImageUrl, resolveTaskDescriptionAttachmentImageUrls, resolveTaskDescriptionAttachmentFiles, reconcileTaskDescriptionAttachments, removeTaskDescriptionAttachmentReference };",
);
const attachmentImageHelpers = createAttachmentImageHelpers(
  { location: { origin: "http://localhost:4177" } },
  (_rawUrl, attachmentId) =>
    attachmentId
      ? "http://localhost:4177/api/real/attachments/" + encodeURIComponent(attachmentId)
      : "",
  (attachment) =>
    attachment.environmentId && attachment.sourcePath
      ? "http://localhost:4177/api/real/environments/" +
        attachment.environmentId +
        "/files/download/" +
        attachment.sourcePath
      : "",
  (attachments) => (Array.isArray(attachments) ? attachments : []),
  (attachment) => (attachment && typeof attachment === "object" ? attachment : null),
  (value) =>
    String(value || "")
      .trim()
      .replace(/[\s()<>"\\]/g, (character) =>
        character === "(" ? "%28" : character === ")" ? "%29" : encodeURIComponent(character),
      ),
  (markdown, replacer) =>
    String(markdown || "").replace(
      /!\[([^\]]*)\]\(((?:[^()]|\([^()]*\))+)\)/g,
      (raw, alt, destinationAndTitle, offset) => {
        const titleMatch = /^([\s\S]*?)\s+"computer-agents:image:([^"]+)"$/.exec(
          destinationAndTitle,
        );
        const parameters = new URLSearchParams(titleMatch?.[2] || "");
        return replacer({
          raw,
          start: offset,
          end: offset + raw.length,
          alt,
          src: String(titleMatch?.[1] || destinationAndTitle).trim(),
          title: parameters.get("title") || "",
          displaySize: parameters.get("size") || "medium",
          alignment: parameters.get("align") || "left",
          attachmentId: parameters.get("attachmentId") || "",
          fileSize: Number(parameters.get("fileSize")) || 0,
          mimeType: parameters.get("mimeType") || "",
        });
      },
    ),
  ({ src, name, alt, title, size, mimeType, attachmentId, displaySize, alignment }) => {
    const parameters = new URLSearchParams();
    parameters.set("size", displaySize || "medium");
    if (alignment && alignment !== "left") parameters.set("align", alignment);
    if (attachmentId) parameters.set("attachmentId", attachmentId);
    if (size) parameters.set("fileSize", String(size));
    if (mimeType) parameters.set("mimeType", mimeType);
    if (title) parameters.set("title", title);
    return (
      "![" + (alt || name) + "](" + src + ' "computer-agents:image:' + parameters.toString() + '")'
    );
  },
  ({ src, name, size, mimeType, attachmentId }) =>
    `:::attachment {src="${src}" name="${name}" size="${size}" mimeType="${mimeType}" attachmentId="${attachmentId}"} :::`,
);
const persistedImageAttachment = {
  id: "att_image123",
  filename: "download.svg",
  environmentId: "env_default",
  sourcePath: "uploads/download.svg",
};
assert.equal(
  attachmentImageHelpers.resolveTaskAttachmentInlineImageUrl(persistedImageAttachment),
  "/api/real/environments/env_default/files/download/uploads/download.svg",
);
assert.equal(
  attachmentImageHelpers.resolveTaskDescriptionAttachmentImageUrls(
    "## Problem\n\n![download.svg](blob:http://localhost:4177/expired)",
    [persistedImageAttachment],
  ),
  '## Problem\n\n![download.svg](/api/real/environments/env_default/files/download/uploads/download.svg "computer-agents:image:size=medium&attachmentId=att_image123")',
);
assert.equal(
  attachmentImageHelpers.resolveTaskDescriptionAttachmentImageUrls(
    "![download.svg](https://old-host.example/api/real/attachments/att_image123)",
    [persistedImageAttachment],
  ),
  '![download.svg](/api/real/environments/env_default/files/download/uploads/download.svg "computer-agents:image:size=medium&attachmentId=att_image123")',
);
assert.equal(
  attachmentImageHelpers.resolveTaskDescriptionAttachmentImageUrls(
    '![download.svg](https://old-host.example/api/real/attachments/att_image123 "computer-agents:image:size=small&align=right&attachmentId=att_image123")',
    [persistedImageAttachment],
  ),
  '![download.svg](/api/real/environments/env_default/files/download/uploads/download.svg "computer-agents:image:size=small&align=right&attachmentId=att_image123")',
);
assert.equal(
  attachmentImageHelpers.resolveTaskDescriptionAttachmentImageUrls(
    "![External](https://cdn.example/image.svg)",
    [persistedImageAttachment],
  ),
  "![External](https://cdn.example/image.svg)",
);
const persistedDocumentAttachment = {
  id: "att_document123",
  filename: "proposal.docx",
  size: 55_170,
  mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  environmentId: "env_default",
  sourcePath: "uploads/proposal.docx",
};
const descriptionWithResolvedFiles = attachmentImageHelpers.resolveTaskDescriptionAttachmentFiles(
  "## Files",
  [persistedImageAttachment, persistedDocumentAttachment],
);
assert.match(
  descriptionWithResolvedFiles,
  /!\[download\.svg\]\(\/api\/real\/environments\/env_default\/files\/download\/uploads\/download\.svg "computer-agents:image:size=medium&attachmentId=att_image123"\)/,
);
assert.match(
  descriptionWithResolvedFiles,
  /:::attachment \{src="\/api\/real\/environments\/env_default\/files\/download\/uploads\/proposal\.docx" name="proposal\.docx" size="55170"[\s\S]*?attachmentId="att_document123"\} :::/,
);
const descriptionAfterImageDeletion = descriptionWithResolvedFiles.replace(
  /!\[download\.svg\]\([^)]*\)\s*/,
  "",
);
const attachmentsAfterImageDeletion = attachmentImageHelpers.reconcileTaskDescriptionAttachments(
  descriptionAfterImageDeletion,
  [persistedImageAttachment, persistedDocumentAttachment],
);
assert.deepEqual(
  attachmentsAfterImageDeletion.map((attachment) => attachment.id),
  ["att_document123"],
);
const newlyUploadedImageAttachment = {
  id: "att_new_image",
  filename: "new-diagram.png",
  environmentId: "env_default",
  sourcePath: "uploads/new-diagram.png",
};
const descriptionAfterNewUpload =
  descriptionAfterImageDeletion +
  "\n\n![new-diagram.png](/api/real/environments/env_default/files/download/uploads/new-diagram.png)";
const attachmentsAfterNewUpload = attachmentImageHelpers.reconcileTaskDescriptionAttachments(
  descriptionAfterNewUpload,
  [persistedImageAttachment, ...attachmentsAfterImageDeletion, newlyUploadedImageAttachment],
);
assert.deepEqual(
  attachmentsAfterNewUpload.map((attachment) => attachment.id),
  ["att_document123", "att_new_image"],
);
assert.doesNotMatch(
  attachmentImageHelpers.resolveTaskDescriptionAttachmentFiles(
    descriptionAfterNewUpload,
    attachmentsAfterNewUpload,
  ),
  /download\.svg/,
);
const parenthesizedImageAttachment = {
  id: "att_parenthesized",
  filename: "diagram (final).svg",
  size: 2048,
  mimeType: "image/svg+xml",
  environmentId: "env_default",
  sourcePath: "uploads/diagram (final).svg",
};
const resolvedParenthesizedImage = attachmentImageHelpers.resolveTaskDescriptionAttachmentFiles(
  "![diagram (final).svg](/api/real/environments/env_default/files/download/uploads/diagram (final).svg)",
  [parenthesizedImageAttachment],
);
assert.match(resolvedParenthesizedImage, /diagram%20%28final%29\.svg/);
assert.doesNotMatch(resolvedParenthesizedImage, /\.svg\)\s*\.svg\)/);
assert.match(resolvedParenthesizedImage, /attachmentId=att_parenthesized/);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformAttachments, \{\s*className: "playground-tasks-ticket-attachments"/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /description: removeTaskDescriptionAttachmentReference\(\s*current\.description,\s*targetAttachment\s*\)/,
);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /className: "playground-tasks-connectors"/);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function handleRenameTaskAttachment\(attachmentId, nextName\)/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /onRename: isRemovable\s*\? \(nextName\) => handleRenameTaskAttachment\(resolvedAttachment\.id, nextName\)/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /React\.createElement\(PlatformFileExplorerBrowserModal, \{\s*open: true,\s*visible: true,\s*portal: false,\s*size: "full",\s*title: "Attach files"/,
);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /sourceGroups,\s*breadcrumbs: \[\{/);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /searchQuery: taskEnvironmentFilePickerSearch,\s*onSearchQueryChange: setTaskEnvironmentFilePickerSearch/,
);
const centralizedTaskConnectorExplorerSource = PROJECTS_PAGE_RUNTIME_SCRIPT.slice(
  PROJECTS_PAGE_RUNTIME_SCRIPT.indexOf("function renderTaskConnectorBrowser()"),
  PROJECTS_PAGE_RUNTIME_SCRIPT.indexOf("function renderTaskParentPickerDialog()"),
);
assert.match(
  centralizedTaskConnectorExplorerSource,
  /React\.createElement\(RunnerFileBrowserDialog, \{[\s\S]*?showSourceSidebar: !isPersistedProjectConnectorMode,[\s\S]*?showFilterTabs: !isPersistedProjectConnectorMode,[\s\S]*?connections: centralizedConnections/,
);
assert.doesNotMatch(
  centralizedTaskConnectorExplorerSource,
  /React\.createElement\(PlatformFileExplorerBrowserModal|React\.createElement\(PlatformModalBackdrop|React\.createElement\(PlatformModalSurface/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /isPlaygroundSubtaskRecord\(draftTask\)\s*\? null\s*:\s*React\.createElement\(PlatformSubtasks, \{\s*className: "playground-tasks-ticket-subtasks",\s*appearance: "minimal",[\s\S]*?onAdd: \(\) => openProjectSubtaskIssueComposer\(draftTask\.id\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderTaskCommentDialog\(\)[\s\S]*?React\.createElement\(PlatformModal, \{[\s\S]*?title: commentSubmission\.isReview \? "Request Changes" : "Add Comment"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderTaskCommentDialog\(\)[\s\S]*?showHeader: false,[\s\S]*?size: "medium"[\s\S]*?React\.createElement\(PlatformInstructionsEditor, \{[\s\S]*?title: commentSubmission\.isReview \? "Request Changes" : "Add Comment"[\s\S]*?variant: "minimalistic-ui"/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_04_FRAGMENT,
  /playground-tasks-comment-modal-input|taskCommentTextareaRef/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-tasks-comments-add-button"/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_04_FRAGMENT,
  /taskCommentComposerOpen \? renderTaskCommentDock\(\) : null/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function openProjectSubtaskIssueComposer\(parentTaskId\)[\s\S]*?if \(!normalizedParentTaskId \|\| \(!selectedProjectId && !selectedProject\?\.id\)\)[\s\S]*?return openProjectIssueComposer\(\{\s*taskType: "subtask",\s*parentTaskId: parentTask\.id,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const shouldKeepParentTaskSelected = nextTaskType === "subtask" && Boolean\(nextParentTaskId\);\s*commitLocalTaskRecord\(createdTask, \{\s*selectTask: !shouldKeepParentTaskSelected,\s*syncDraft: !shouldKeepParentTaskSelected,\s*markClean: !shouldKeepParentTaskSelected,\s*\}\);\s*if \(shouldKeepParentTaskSelected\) \{\s*handleSelectTask\(nextParentTaskId, \{ screen: true \}\);/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectIssueComposerDialog\(\)[\s\S]*?const issueComposerTitle = normalizedIssueType === "subtask" \? "Create Subtask" : "Create Issue";[\s\S]*?return React\.createElement\(PlatformModal, \{\s*open: issueComposerOpen,\s*visible: issueComposerVisible,\s*closing: issueComposerClosing,[\s\S]*?size: "large",\s*maxHeight: normalizedIssueType === "loop" \? "88vh" : "80vh",\s*title: issueComposerTitle,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderTaskDeleteDialog\(\),\s*renderMissionControlStudio\(\),\s*renderProjectIssueComposerDialog\(\),\s*renderProjectComposerDialog\(\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /title: issueComposerTitle,\s*headerVariant: "search",\s*headerLeading: renderIssueComposerTypeSelector\(\),\s*headerSearchProps: \{\s*icon: null,\s*value: issueComposerDraft\.title \|\| "",[\s\S]*?onChange: \(event\) => updateIssueComposerField\("title", event\.target\.value\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderIssueComposerTypeSelector\(\) \{[\s\S]*?return React\.createElement\(PlatformSelector, \{[\s\S]*?options: PLAYGROUND_TASK_TYPE_OPTIONS\.map[\s\S]*?playground-new-issue-modal__type-option-icon[\s\S]*?ariaLabel: "Issue type"[\s\S]*?playground-new-issue-modal__type-trigger-icon/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /onKeyDown: \(event\) => \{[\s\S]*?event\.key !== "Tab"[\s\S]*?issueComposerDescriptionTextareaRef\.current[\s\S]*?descriptionTextarea\.focus\(\{ preventScroll: true \}\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderIssueComposerDescriptionField\(\) \{\s*const descriptionEditor = React\.createElement\(PlatformInstructionsEditor, \{\s*value: resolveTaskDescriptionAttachmentFiles\(\s*issueComposerDraft\.description \|\| "",\s*issueComposerDraft\.attachments\s*\),[\s\S]*?title: normalizedIssueType === "loop" \? "Loop Goal" : "Description",[\s\S]*?editorRef: issueComposerDescriptionTextareaRef,[\s\S]*?variant: "minimalistic-ui",\s*contentVariant: "file-enabled",[\s\S]*?fileUpload: \{\s*upload: uploadIssueComposerDescriptionFiles[\s\S]*?className: "playground-new-issue-modal__loop-goal-section"[\s\S]*?descriptionEditor,\s*renderIssueComposerLoopFields\(\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const issueComposerDescriptionTextareaRef = useRef\(null\)/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /async function uploadTaskAttachmentFiles\(files, options = \{\}\)/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /async function uploadTaskDescriptionFiles\(files\)[\s\S]*?return buildTaskDescriptionUploadedFiles\(uploadedAttachments\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /async function uploadTaskDescriptionFiles\(files\)[\s\S]*?appendUploadedTaskAttachments\(uploadedAttachments\)/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /async function uploadIssueComposerDescriptionFiles\(files\)[\s\S]*?return buildTaskDescriptionUploadedFiles\(uploadedAttachments\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /value: resolveTaskDescriptionAttachmentFiles\(\s*issueComposerDraft\.description \|\| "",\s*issueComposerDraft\.attachments\s*\),\s*onChange: handleIssueComposerDescriptionEditorChange/,
);
assert.equal(
  (
    PROJECTS_PAGE_VIEWS_SCRIPT.match(
      /promptInsertion: typeof onOpenPromptSearch === "function"\s*\? \{ openSearch: onOpenPromptSearch \}\s*: undefined/g,
    ) || []
  ).length,
  2,
  "Both new and existing ticket descriptions must support centralized prompt insertion.",
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function handleRenameIssueComposerDescriptionFile\(file, nextName\)/,
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /function handleRemoveIssueComposerDescriptionFile\(file\)[\s\S]*?removeTaskDescriptionAttachmentReference/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderIssueComposerDetailSelectControl\([\s\S]*?return React\.createElement\(PlatformSelector, \{/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Computer",[\s\S]*?popoverId: "computer"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Type",[\s\S]*?popoverId: "type"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Color",[\s\S]*?popoverId: "color"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Assignee",[\s\S]*?popupClassName: "playground-tasks-detail-assignee-selector-popup",[\s\S]*?ariaLabel: "Assignee type",[\s\S]*?filteredIssueComposerAssignableActors\.map/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Reviewer",[\s\S]*?popupClassName: "playground-tasks-detail-assignee-selector-popup",[\s\S]*?ariaLabel: "Reviewer type",[\s\S]*?filteredIssueComposerAssignableActors\.map/,
);
const issueComposerLoopSectionSource = PROJECTS_PAGE_VIEWS_SCRIPT.slice(
  PROJECTS_PAGE_VIEWS_SCRIPT.indexOf("function renderIssueComposerLoopFields()"),
  PROJECTS_PAGE_VIEWS_SCRIPT.indexOf("function createIssueComposerSelectorOption"),
);
const issueComposerDetailsSectionSource = PROJECTS_PAGE_VIEWS_SCRIPT.slice(
  PROJECTS_PAGE_VIEWS_SCRIPT.indexOf("function renderIssueComposerDetailsSection()"),
  PROJECTS_PAGE_VIEWS_SCRIPT.indexOf("return React.createElement(PlatformModal", PROJECTS_PAGE_VIEWS_SCRIPT.indexOf("function renderIssueComposerDetailsSection()")),
);
assert.doesNotMatch(
  issueComposerLoopSectionSource,
  /renderIssueComposerDetailFact\("Verifier"|renderIssueComposerDetailFact\("On regression"/,
);
assert.match(
  issueComposerDetailsSectionSource,
  /issueType === "loop"[\s\S]*?renderIssueComposerDetailFact\("Verifier"[\s\S]*?popoverId: "loop-verifier"[\s\S]*?renderIssueComposerDetailFact\("On regression"[\s\S]*?popoverId: "loop-regression"[\s\S]*?: renderIssueComposerDetailFact\("Reviewer"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Schedule",[\s\S]*?taskScheduleDialogState\?\.target === "issue"[\s\S]*?openTaskScheduleDialog\("issue"\)[\s\S]*?popupContent: renderTaskScheduleDialog\(\{ embedded: true \}\)[\s\S]*?popupAriaLabel: "Edit issue schedule"/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /taskScheduleDialogState\.target === "issue"[\s\S]*?updateIssueComposerDraft\([\s\S]*?scheduledStartAt: nextStart/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /issueType === "subtask"[\s\S]*?renderIssueComposerDetailFact\("Subtask to",[\s\S]*?popoverId: "subtask-to"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /popoverId: "status",[\s\S]*?\.filter\(\(option\) => \["todo", "blocked"\]\.includes\(option\.id\)\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /issueStatus === "blocked"[\s\S]*?renderIssueComposerDetailFact\("Blocked by",[\s\S]*?popoverId: "blocked-by"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Sprint",\s*renderIssueComposerDetailSelectControl/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerComputerSelector|renderIssueComposerDetailSelectOptionRow|issueComposerDetailsCollapsed/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /footer: React\.createElement\(React\.Fragment,[\s\S]*?React\.createElement\(PlatformSecondaryButton,[\s\S]*?React\.createElement\(PlatformPrimaryButton,[\s\S]*?renderIssueComposerDescriptionField\(\),\s*renderIssueComposerDetailsSection\(\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderIssueComposerTitleField\(|playground-new-issue-modal__title-input/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectIssueComposerDialog\(\)[\s\S]*?return renderPlaygroundPlatformModal\(/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderBacklogTaskRow\([\s\S]*?const taskType = normalizePlaygroundTaskType\(task\.taskType \|\| task\.type\);[\s\S]*?const TaskTypeIcon = getPlaygroundTaskTypeIcon\(taskType\);[\s\S]*?React\.createElement\(PlatformTicketItem, \{\s*variant: "list",[\s\S]*?taskType,[\s\S]*?typeIcon: React\.createElement\(TaskTypeIcon/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderBoardCard\(task\)[\s\S]*?const taskType = normalizePlaygroundTaskType\(task\.taskType \|\| task\.type\);[\s\S]*?const TaskTypeIcon = getPlaygroundTaskTypeIcon\(taskType\);[\s\S]*?React\.createElement\(PlatformTicketItem, \{[\s\S]*?variant: "card",[\s\S]*?taskType,[\s\S]*?typeIcon: React\.createElement\(TaskTypeIcon/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function getPlaygroundTaskTypeIcon\(value\)[\s\S]*?taskType === "subtask"\) return Check;[\s\S]*?taskType === "loop"\) return RefreshCw;[\s\S]*?return Bookmark;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-detail-type-badge\.is-loop,\s*\.playground-tasks-backlog-project-icon\.is-loop,\s*\.playground-tasks-lane-card-type-badge\.is-loop\s*\{\s*background: linear-gradient\(180deg, #9a72df 0%, #6542a8 100%\);/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformSubtasks, \{[\s\S]*?statusContent: renderTaskPreviewStatusControl\(subtask\),[\s\S]*?assignee: renderTaskAssigneeAvatar\(subtask/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderOverviewTaskRow\(task\)[\s\S]*?React\.createElement\(PlatformTicketItem, \{[\s\S]*?variant: "list"/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderOverviewTaskRow\(task\)[\s\S]*?aria-label: "Run task thread"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function isProjectOverviewUpdateCommentByCurrentUser\(comment\)[\s\S]*?authorUserId === viewerUserId/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /actions: isProjectOverviewUpdateCommentByCurrentUser\(comment\)[\s\S]*?onEdit: \(nextBody\) => editProjectOverviewUpdateComment[\s\S]*?onDelete: \(\) => deleteProjectOverviewUpdateComment/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /method: operation === "delete" \? "DELETE" : "PATCH"/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /"aria-label": isCanceledTask[\s\S]*?: "Run task"/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_04_FRAGMENT,
  /"aria-label": isCanceledSubtask[\s\S]*?: "Run task"/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal\.platform-modal-surface\s*\{\s*display: flex;\s*flex-direction: column;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal__body\.platform-modal-body\s*\{[\s\S]*?flex: 1 1 auto;[\s\S]*?display: flex;[\s\S]*?overflow-y: auto;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal__type-selector \.playground-new-issue-modal__type-selector-trigger\s*\{[\s\S]*?width: 24px;[\s\S]*?justify-content: center;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal__type-selector \.platform-selector__chevrons\s*\{\s*display: none;/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-detail-facts playground-tasks-issue-details-section"[^\n]*,\s*\},\s*React\.createElement\("div", \{ className: "playground-tasks-detail-facts-header"/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal \.playground-tasks-issue-details-section\s*\{\s*margin-top: 0;\s*padding: 0;\s*border: 0;\s*border-radius: 0;\s*background: transparent;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal \.playground-tasks-issue-details-section > \.playground-tasks-detail-facts-body\s*\{\s*margin-top: 0;\s*padding-top: 0;\s*border-top: 0;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal \.playground-new-issue-modal__description\.platform-instructions-editor\s*\{\s*margin-top: 0;\s*margin-bottom: 0;\s*min-height: 0;\s*flex: 1 1 auto;\s*display: flex;\s*flex-direction: column;\s*padding: 12px;\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);\s*border-radius: 10px;\s*background: rgba\(255, 255, 255, 0\.075\);\s*overflow: hidden;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal \.playground-new-issue-modal__description\.platform-instructions-editor > \.platform-instructions-editor__header\s*\{\s*flex: 0 0 auto;\s*margin-bottom: 12px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal \.playground-new-issue-modal__description\.platform-instructions-editor > \.platform-instructions-editor__body\s*\{\s*min-height: 36px;\s*flex: 1 1 auto;[\s\S]*?overflow-y: auto;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal__loop-goal-section\s*\{[\s\S]*?flex: 1 1 auto;[\s\S]*?border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]*?overflow: hidden;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal__loop-goal-section > \.playground-new-issue-modal__description\.platform-instructions-editor\s*\{\s*border: 0;\s*border-bottom: 1px solid rgba\(255, 255, 255, 0\.075\);\s*border-radius: 0;\s*background: transparent;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal__loop-fields\s*\{\s*display: grid;[\s\S]*?grid-template-columns: repeat\(4, minmax\(170px, 1fr\)\);[\s\S]*?\.playground-new-issue-modal__loop-field\s*\{[\s\S]*?align-items: center;[\s\S]*?justify-content: flex-start;[\s\S]*?color: rgba\(255, 255, 255, 0\.5\);[\s\S]*?white-space: nowrap;[\s\S]*?\.playground-new-issue-modal__loop-field input\s*\{\s*width: 4ch;[\s\S]*?order: -1;[\s\S]*?background: transparent;[\s\S]*?font-size: 12px;[\s\S]*?appearance: textfield;/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /style: \{\s*width: "calc\(" \+ Math\.max\(1, String\(value\)\.length\) \+ "ch \+ 1px\)",\s*flexBasis: "calc\(" \+ Math\.max\(1, String\(value\)\.length\) \+ "ch \+ 1px\)",/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const requestedDescription = requestedTaskType === "loop"\s*\? buildPlaygroundTaskLoopGoalTemplate\(requestedLoop\)[\s\S]*?const normalizedDraft = normalizePlaygroundTaskRecord\(syncPlaygroundTaskRecordMetadata\([\s\S]*?return \{\s*\.\.\.normalizedDraft,\s*title: "",\s*description: requestedDescription,\s*taskType: requestedTaskType,\s*loop: requestedTaskType === "loop"[\s\S]*?parentTaskId: requestedTaskType === "subtask" \? requestedParentTaskId : null,\s*\};/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function updateIssueComposerDraft\(updater\)[\s\S]*?title: typeof nextDraft\?\.title === "string" \? nextDraft\.title : normalizedDraft\.title/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function openTaskCommentComposer\(options = \{\}\)[\s\S]*?function activateTaskReviewCommentMode\(\) \{\s*openTaskCommentComposer\(\{ review: true \}\);/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function handleTaskSurfaceClick\(event\)[\s\S]*?target\.closest\([^\n]*\.platform-modal-backdrop/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const authorUserId = readPlaygroundTaskCommentIdentityString\(comment, \["authorUserId", "author_user_id", "createdByUserId"/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const parentCommentId = readPlaygroundTaskCommentIdentityString\(comment, \[[\s\S]*?"parentCommentId"[\s\S]*?"reply_to_comment_id"[\s\S]*?\]\) \|\| undefined;/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const createdAt = typeof comment\.createdAt[\s\S]*?: typeof comment\.updatedAt[\s\S]*?: "";/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /const creatorAgentId = \[[\s\S]*?task\.createdByAgentId[\s\S]*?const creatorUserId = \[[\s\S]*?task\.createdByUserId/,
);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /createdByUserId: creatorUserId,\s*creator,/);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function getTaskCommentDisplayName\(comment\)[\s\S]*?isTaskCommentByCurrentUser\(comment\)[\s\S]*?getTaskCommentWorkspaceMember\(comment\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function renderTaskCommentAvatar\(comment, className\)[\s\S]*?React\.createElement\(AccountAvatar, \{/,
);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /function renderTaskCreatorValue\(task\)/);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /isCurrentUser\s*\? String\(currentUserName \|\| creator\.name \|\| "User"\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const commentMetadata = \{[\s\S]*?\.\.\.\(currentUserAvatarUrl \? \{ authorAvatarUrl: currentUserAvatarUrl \} : \{\}\),[\s\S]*?\.\.\.\(parentCommentId \? \{ parentCommentId \} : \{\}\),[\s\S]*?\.\.\.\(commentAttachments\.length \? \{ attachments: commentAttachments \} : \{\}\),[\s\S]*?metadata: Object\.keys\(commentMetadata\)\.length \? commentMetadata : undefined,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const parentCommentId = String\(options\?\.parentCommentId \|\| ""\)\.trim\(\);[\s\S]*?parentCommentId: parentCommentId \|\| undefined,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const createdCommentResponse = getPlaygroundTaskCommentResponseRecord\(data\);[\s\S]*?createdCommentResponse && parentCommentId && !createdCommentResponse\.parentCommentId[\s\S]*?parentCommentId,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const taskComments = normalizePlaygroundTaskCommentList\(draftTask\.comments\)[\s\S]*?return normalizedRightTimestamp - normalizedLeftTimestamp;/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-detail-fact-label" \}, "Creator"\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const repliesByParentCommentId = new Map\(\);[\s\S]*?replyComposer: isComment[\s\S]*?parentCommentId: comment\.id,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const mainActionKind = isBlockedTask[\s\S]*?\? "batch"[\s\S]*?\? "start"[\s\S]*?\? "review"[\s\S]*?: "rerun";[\s\S]*?mainActionKind === "batch"[\s\S]*?\? "Move to Batch"[\s\S]*?\? "Start Work"[\s\S]*?\? "Start Review"[\s\S]*?: "Rerun Thread";/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformButtonSelector, \{[\s\S]*?mode: "split-action",[\s\S]*?buttonVariant: "primary",[\s\S]*?popupVariant: "minimal",[\s\S]*?matchTriggerWidth: true,/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /popupActionLabel: !hasStartedThread[\s\S]*?\? "Run Review"[\s\S]*?\? "Rerun Thread"[\s\S]*?: "Start Review",[\s\S]*?popupActionDisabled: !hasStartedThread \|\| !hasRunnableReviewer \|\| reviewActionDisabled,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-detail-fact is-assignee"[\s\S]*?contentOnly \? renderTaskWorkActionControl\(\) : null/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const activeTaskStatus = PLAYGROUND_TASK_STATUS_OPTIONS\.some\(\(option\) => option\.id === draftTask\.status\)[\s\S]*?const taskDetailStatusOptions = PLAYGROUND_TASK_MANUAL_STATUS_OPTIONS[\s\S]*?popoverId: "status",[\s\S]*?buttonContent: renderPlaygroundTaskStatusValue\(activeTaskStatus,[\s\S]*?options: taskDetailStatusOptions\.map/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /activeTaskStatus === "blocked"[\s\S]*?className: "playground-tasks-detail-fact-label" \}, "Blocked by"[\s\S]*?popoverId: "blocked-by"/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function selectTaskDetailStatus\(nextStatus\)[\s\S]*?status: normalizedStatus,[\s\S]*?dependencyIds: \[\],[\s\S]*?completedAt: isPlaygroundTaskTerminalStatus\(normalizedStatus\)[\s\S]*?setTaskDetailSelectPopover\(""\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformPopupSearchHeader, \{[\s\S]*?placeholder: "Change status\.\.\.",[\s\S]*?shortcut: "S"[\s\S]*?trailing: option\.shortcut/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function selectTaskDetailPriority\(nextPriority\)[\s\S]*?updateDraftField\("priority", normalizedPriority, \{ autosave: true \}\);[\s\S]*?setTaskDetailPrioritySearchQuery\(""\);[\s\S]*?setTaskDetailSelectPopover\(""\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const taskDetailPriorityOptions = PLAYGROUND_TASK_PRIORITY_OPTIONS[\s\S]*?placeholder: "Change priority\.\.\.",[\s\S]*?shortcut: "P"[\s\S]*?options: taskDetailPriorityOptions\.map[\s\S]*?trailing: option\.shortcut[\s\S]*?selectTaskDetailPriority\(option\.id\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /taskDetailSelectPopover === "status" && \/\^\[1-5\]\$\/\.test\(key\)[\s\S]*?selectTaskDetailStatus\(statusOption\.id\)[\s\S]*?taskDetailSelectPopover === "type" && \/\^\[1-3\]\$\/\.test\(key\)[\s\S]*?handleTaskTypeSelection\(typeOption\.id\)[\s\S]*?taskDetailSelectPopover === "priority" && \/\^\[1-4\]\$\/\.test\(key\)[\s\S]*?selectTaskDetailPriority\(priorityOption\.id\)[\s\S]*?key === "p" \? "priority"[\s\S]*?setTaskDetailSelectPopover\(shortcutPopoverId\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function handleTaskTypeSelection\(nextType\)[\s\S]*?setTaskDetailTypeSearchQuery\(""\);[\s\S]*?setTaskDetailSelectPopover\(""\);[\s\S]*?openTaskParentPicker\(\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-detail-fact is-status"[\s\S]*?className: "playground-tasks-detail-fact-label" \}, "Status"[\s\S]*?className: "playground-tasks-detail-fact-label" \}, "Type"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-detail-fact-label" \}, "Reviewer"[\s\S]*?className: "playground-tasks-detail-fact-label" \}, "Milestone"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function updateTaskDetailLoop\(patch\)[\s\S]*?updateDraftTask[\s\S]*?\{ autosave: true \}/,
  "Loop ticket details must autosave changes through the normalized loop configuration.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /activeTaskType === "loop"\s*\? React\.createElement\(React\.Fragment, null,[\s\S]*?"Verifier"[\s\S]*?popoverId: "loop-verifier"[\s\S]*?updateTaskDetailLoop\(\{ verifierAgentId:[\s\S]*?"On regression"[\s\S]*?popoverId: "loop-regression"[\s\S]*?updateTaskDetailLoop\(\{ regressionPolicy:/,
  "Loop ticket details must show editable verifier and regression-policy rows.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const taskDescriptionContent = activeTaskType === "loop"\s*\? React\.createElement\(React\.Fragment, null,\s*taskDescriptionEditor,\s*renderPlaygroundTaskLoopFields\(\{[\s\S]*?task: draftTask,[\s\S]*?onChange: updateTaskDetailLoop/,
  "Loop ticket details must render the shared controls directly beneath the Loop Goal editor.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const taskDescriptionEditor = React\.createElement\(PlatformInstructionsEditor,[\s\S]*?className: activeTaskType === "loop" \? "playground-new-issue-modal__description"/,
  "Loop ticket details must not inherit the creation modal editor container styling.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function handleTaskDescriptionEditorChange\(nextValue, context = \{\}\)[\s\S]*?normalizePlaygroundTaskType\(nextDraft\?\.taskType\) !== "loop"[\s\S]*?parsePlaygroundTaskLoopGoalMarkdown\(nextDraft\.description\)/,
  "Editing an existing Loop Goal must keep the durable Loop contract in sync.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-detail-type-badge\s*\{\s*width: 18px;[\s\S]*?\.playground-tasks-detail-type-badge\.is-loop,[\s\S]*?\{\s*background:/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-content \.playground-new-issue-modal__loop-fields\s*\{\s*padding-left: 0;\s*padding-right: 0;/,
  "Loop controls must remove horizontal padding only inside ticket details.",
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /function buildProjectIssueComposerDraft\(options = \{\}\)[\s\S]*?parentTaskId: requestedParentTaskId,[\s\S]*?function openProjectIssueComposer\(options = \{\}\)/,
);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /className: "playground-tasks-skills"/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /"Manage Skills"/);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /onClick: \(\) => handleTaskDescriptionFormat\(action\.id\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /project-strategy:|isStrategyTab/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /Project strategy and durable documentation/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /Project execution graph|Track structural dependencies and every durable agent attempt|Relationships|Agent execution/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /No task relationships yet|No agent runs yet/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /relationRows|sessionRows|missionControlDeliveryStageId/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewWorkGraphPanel|getProjectSummaryResources|getProjectSummaryResourceTimestamp/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /playground-project-overview-work-graph/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /playground-project-overview-work-graph-(?:columns|column|list|row)/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-general-grid > \.playground-project-overview-activity-card\.is-main\s*\{\s*margin-bottom: 42px;/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /header: activeProjectOverviewHomeTab === "general"\s*\?\s*renderProjectOverviewSummaryHeader\(\)\s*:\s*null/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const projectSectionLinks = \[/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /\{ id: "strategy", label: "Strategy", Icon:/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewOutcomesSection/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewGeneralPanel\(\)[\s\S]*?return React\.createElement\("div", \{ className: "playground-project-overview-general-grid" \},\s*renderProjectOverviewStatusFeed\(\)\s*\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const PROJECT_ACTIVITY_EVENT_TYPES = Object\.freeze\(\[[\s\S]*?id: "project_updates"[\s\S]*?id: "comments"[\s\S]*?id: "ticket_comments"[\s\S]*?id: "mission_control"[\s\S]*?id: "milestones"[\s\S]*?id: "issue_progress"[\s\S]*?id: "assignments"[\s\S]*?id: "schedules"[\s\S]*?id: "threads"[\s\S]*?id: "project_changes"/,
  "The project feed and Settings controls must share one explicit event taxonomy.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /event\?\.eventType === "comment_added"\) return "ticket_comments"/,
  "Ticket comments must have their own independently filterable timeline category.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /cardType: isTicketComment \? "ticket_comment" : null/,
  "Ticket comments must render as timeline cards instead of compact mutation lines.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /event\.cardType === "ticket_comment"[\s\S]*?React\.createElement\(PlatformCommentCard/,
  "The shared project timeline must render ticket comments through the centralized comment card.",
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectActivityComposer/,
  "The project timeline must not render a second inline comment or update composer.",
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /playground-project-activity-composer/,
  "Removed timeline composer styles must not remain in the project bundle.",
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /A chronological view of the decisions and work changing this project\./,
  "The Progress timeline should begin directly with its composer.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectActivityGroupLabel\(timestamp\)[\s\S]*?return "Today"[\s\S]*?return "Yesterday"[\s\S]*?return "This Week"[\s\S]*?month: "long"/,
  "Recent project activity must use relative day and week groups before monthly history.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function normalizeProjectOverviewUpdateKind\(value\)[\s\S]*?kind: normalizeProjectOverviewUpdateKind\(draft\?\.kind\)[\s\S]*?kind: clientRecord\.kind/,
  "Project timeline posts must preserve their durable comment or update kind.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewTimelineSettingsSection\(options = \{\}\)[\s\S]*?PROJECT_ACTIVITY_EVENT_TYPES\.map[\s\S]*?React\.createElement\(PlatformToggle,[\s\S]*?setProjectActivityEventTypeEnabled/,
  "Project Settings must expose a centralized toggle for every timeline event type.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /projectTimelineInteractions[\s\S]*?persistProjectActivityInteractionRecord[\s\S]*?postProjectActivityComment[\s\S]*?toggleProjectActivityReaction/,
  "Rich non-update timeline cards must persist comments and reactions with the project.",
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewSetupSection|Project Setup/);
assert.doesNotMatch(PROJECT_OVERVIEW_CSS, /playground-project-overview-setup-section/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewMilestoneRecords\(\)[\s\S]*?normalizePlaygroundTaskReleaseRecord\(release\)[\s\S]*?compareTaskReleaseOrder/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewMilestonesPanel\(\)[\s\S]*?React\.createElement\(ProjectMilestonesOverviewPage, \{[\s\S]*?openReleaseComposer\(\)[\s\S]*?openReleaseComposerForEdit\(row\.source\)/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /milestones: summaryMilestones,[\s\S]*?onMilestonesSelect: \(\) => setProjectOverviewHomeTab\("milestones"\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewMilestoneSeries\(release, bucketEndTimes, color, seriesIndex\)[\s\S]*?valueKind: "percent"[\s\S]*?function buildProjectOverviewMilestonesAnalytics\(milestoneRecords\)[\s\S]*?series: milestoneRecords\.map\(/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-milestones-overview-page\s*\{[\s\S]*?\.platform-project-milestone-progress__ring\s*\{[\s\S]*?conic-gradient/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /normalizedProjectOverviewHomeTab === "resources"[\s\S]*?normalizedProjectOverviewHomeTab === "milestones"[\s\S]*?activeProjectOverviewHomeTab === "milestones"[\s\S]*?renderProjectOverviewMilestonesPanel\(\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewThreadsSection\(options = \{\}\)[\s\S]*?const isEmbedded = options\?\.embedded === true[\s\S]*?className: isEmbedded[\s\S]*?playground-project-overview-threads-tabs-toolbar[\s\S]*?leading: options\?\.toolbarLeading \|\| null[\s\S]*?filters: isEmbedded \? \[\] : \[/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewThreadsEmptyState\(hasFilters = false\)[\s\S]*?React\.createElement\(PlatformEmptyState, \{[\s\S]*?icon: MessageCircle,[\s\S]*?title: hasFilters \? "No matching threads" : "No threads yet"[\s\S]*?Threads started from this project will appear here\./,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-general-grid \.playground-project-overview-threads-section\.is-embedded\s*\{\s*margin-bottom: 0;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-threads-tabs-toolbar\s*\{[\s\S]*?flex-wrap: nowrap;[\s\S]*?align-items: center;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-spotlight__title\s*\{[\s\S]*?color: #fff;[\s\S]*?font-size: 16px;[\s\S]*?font-weight: 400;/,
  "Project Spotlight heading must use the compact 16px white treatment.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-spotlight__view-all\.platform-button\s*\{[\s\S]*?background: rgba\(255, 255, 255, 0\.1\);/,
  "Project Spotlight View all must use the secondary white/10 treatment.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-activity-feed__title\s*\{[\s\S]*?color: #fff;[\s\S]*?font-size: 16px;[\s\S]*?font-weight: 400;/,
  "The Progress Activity heading must use the compact 16px white treatment.",
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-activity-feed__latest-update > \.platform-project-update-card\s*\{[\s\S]*?margin-top: 0;[\s\S]*?background: rgba\(255, 255, 255, 0\.075\);/,
  "The featured latest update must use the shared white/7.5 project-update surface.",
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /projectOverviewHomeTab === "rules"[\s\S]*?\? "general"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /projectOverviewHomeTab === "strategy"/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /activeProjectOverviewHomeTab === "strategy"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /playground-project-overview-sidebar-navigation/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /sidebarToggle: React\.createElement/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Strategy Notes"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /"Strategy Notes"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /historyKey: "full-strategy:" \+ selectedProject\.id/);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary__input\s*\{[\s\S]*?overflow: hidden;[\s\S]*?background: transparent;[\s\S]*?font-size: 12px;/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary__input\s*\{[^}]*max-height:\s*72px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary\s*\{[\s\S]*?flex-direction: row;[\s\S]*?gap: 12px;[\s\S]*?padding-bottom: 24px;[\s\S]*?border-bottom: 1px solid rgba\(255, 255, 255, 0\.1\);/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /--project-summary-icon-size: 52px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary__copy\s*\{[\s\S]*?flex-direction: column;[\s\S]*?gap: 6px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary__title\s*\{[\s\S]*?margin: 0;[\s\S]*?font-size: 20px;[\s\S]*?font-weight: 400;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-description-editor\s*\{\s*width: 100%;[\s\S]*?margin: 0;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-description-editor\.is-minimalistic-ui\.is-sticky[\s\S]*?\.platform-instructions-editor__header\s*\{\s*position: sticky;\s*top: 0;\s*z-index: 10;\s*background: #000;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-update-card__comments\s*\{\s*display: flex;[\s\S]*?min-width: 0;\s*\}/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-update-card__comments\s*\{[^}]*?(?:padding-top|border-top):/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-description-editor[\s\S]*?\.platform-instructions-editor__title\s*\{\s*flex: 1 1 auto;\s*overflow: hidden;\s*font-size: 14px;\s*font-weight: 400;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-sidebar\s*\{[\s\S]*?position: sticky;\s*top: var\(--project-detail-sticky-offset, 0px\);/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_CSS, /playground-project-overview-sidebar-navigation/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /renderMissionControlDocumentToolbarButton/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const studioElement = React\.createElement\(PlatformModal, \{\s*open: missionControlSetupOpen && !missionControlSetupClosing,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /size: "large",[\s\S]{0,180}?title: "Mission Control",[\s\S]{0,180}?className: "playground-new-issue-modal playground-mission-control-modal"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderMissionControlSetupView\(\)[\s\S]*?React\.createElement\(PlatformInstructionsEditor,[\s\S]*?title: "Instructions"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /focusDefinitions = \[[\s\S]*?id: "issues"[\s\S]*?id: "strategy"[\s\S]*?id: "milestones"[\s\S]*?id: "knowledge"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformToggle, \{[\s\S]{0,260}?missionControlSetupFocus\[focus\.id\]/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-mission-control-agent-selector-label"[\s\S]{0,260}?renderTaskActorAvatar\(selectedAgent\.id, "playground-tasks-detail-person-avatar"\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /playground-mission-control-parameters-title/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-mission-control-parameter-row,[\s\S]{0,160}?\.playground-mission-control-focus-row\s*\{[\s\S]{0,360}?border: 0;/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /playground-mission-control-setup-runner/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_DATA_SCRIPT,
  /playground-mission-control-setup-runner|focusMissionControlSetupTaskInput/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /\/projects\/" \+ encodeURIComponent\(runProjectId\) \+ "\/mission-control\/runs"/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function handleMissionControlSetupSubmit\(\) \{[\s\S]*?const baseProjectRecord = selectedProject\?\.id === normalizedSelectedProjectId[\s\S]*?await startMissionControlWorkflow\(/,
  "Mission Control must launch from the loaded project rather than an editor draft.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /async function handleMissionControlSetupSubmit\(\) \{[\s\S]{0,1800}?persistProjectComposerDraft/,
  "Mission Control must not save an unrelated project draft before launching.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformPrimaryButton, \{\s*type: "button",\s*size: "medium",\s*disabled: !canRunMissionControl,\s*onClick: \(\) => \{\s*if \(canRunMissionControl\) \{\s*void handleMissionControlSetupSubmit\(\);/,
  "The Mission Control primary action must invoke launch directly instead of relying only on implicit form submission.",
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /function finishCloseMissionControlSetupModal\(\)[\s\S]{0,700}?setMissionControlSetupOpen\(false\);[\s\S]{0,120}?setMissionControlSetupError\(""\);/,
  "Closing Mission Control must not tear down the independent project editor state.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const studioElement = renderPlaygroundPlatformModal/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-project-modal playground-mission-control-modal"/,
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformSearch/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformPopup/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(ListFilter/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /variant: "minimal"/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectWorkViewTabs\(\)[\s\S]*?React\.createElement\(PlatformDetailTabBar, \{\s*value: taskView === "board"\s*\? "board"\s*: "backlog",\s*tabs: \[\s*\{ id: "backlog", label: "Backlog" \},\s*\{ id: "board", label: "Board" \},\s*\],[\s\S]*?variant: "minimal"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /headerLeading: renderProjectWorkViewTabs\(\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-backlog-header is-board-list-header"[\s\S]*?renderProjectWorkViewTabs\(\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /view: taskView,\s*sectionId: taskView === "overview" \? projectOverviewHomeTab : ""/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectAppHeaderMilestoneSelector\(\) \{\s*const isBoardMilestoneSelector = taskView === "board";\s*return React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?label: "Milestones"[\s\S]*?popupVariant: "minimal"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function buildProjectWorkActivityOverviewItems\(\s*scopedTasks,\s*selectionEvents = \[\],\s*selectedTimelineItemId = ""\s*\)[\s\S]*?function renderProjectActivityOverviewView\(\)[\s\S]*?React\.createElement\(PlatformActivityWorkspace, \{[\s\S]*?className: "playground-project-activity-page"[\s\S]*?overviewProps: getProjectActivityOverviewProps\(activityItems\)[\s\S]*?timelineProps: \{[\s\S]*?layout: "inspector"[\s\S]*?title: "Activity"[\s\S]*?inspectorTitle: "Inspector"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function filterProjectWorkActivityEventsByTimeRange\([\s\S]*?function getProjectActivityPageGridStyle\(chartHeight\)[\s\S]*?function getProjectActivityOverviewProps\(activityItems\)[\s\S]*?resizable: true[\s\S]*?onHeightChange: setProjectOverviewActivityChartHeight[\s\S]*?onTimeRangeChange: setProjectOverviewTaskActivityTimeRange[\s\S]*?function renderProjectActivityOverviewChart\(activityItems\)[\s\S]*?React\.createElement\([\s\S]*?PlatformActivityOverview,[\s\S]*?getProjectActivityOverviewProps\(activityItems\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function getProjectActivityPageGridStyle\(chartHeight\) \{[\s\S]*?if \(!Number\.isFinite\(normalizedHeight\) \|\| normalizedHeight <= 0\) \{\s*return \{\s*gridTemplateRows: "repeat\(2, minmax\(0, 1fr\)\)",\s*\};/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const effectiveProjectActivitySelectedId = projectActivityTimelineItems\.some\([\s\S]*?buildProjectWorkActivityOverviewItems\(\s*activityTasks,\s*projectActivityEvents,\s*effectiveProjectActivitySelectedId\s*\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /filterProjectWorkActivityEventsByTimeRange\(\s*projectActivityEvents,\s*projectOverviewTaskActivityTimeRange\s*\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectWorkActivityCard\(\{[\s\S]*?selected = false,[\s\S]*?React\.createElement\(PlatformActivityOverviewCard, \{[\s\S]*?PlatformPermissionMiniRingIcon[\s\S]*?renderProjectWorkActivityActorAvatar\([\s\S]*?selected,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const taskSelection = getTimelineEntrySelection\(\{[\s\S]*?eventType: "created"[\s\S]*?content: renderProjectWorkActivityCard\(\{[\s\S]*?onSelect: taskSelection\.onSelect,\s*selected: taskSelection\.selected,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const eventSelection = getTimelineEntrySelection\(\{[\s\S]*?eventId: event\?\.id[\s\S]*?content: renderProjectWorkActivityCard\(\{[\s\S]*?onSelect: eventSelection\.onSelect,\s*selected: eventSelection\.selected,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /content: renderProjectWorkActivityCard\(\{[\s\S]*?permissionActionId: "project_threads_create"[\s\S]*?actor: threadActor/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderProjectWorkActivityTicketPreview/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /minTimelineWidth: 1480/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /projectOverviewTaskActivitySelectedId,[\s\S]*?setProjectOverviewTaskActivitySelectedId,[\s\S]*?useState\(""\);[\s\S]*?const \[projectOverviewTaskActivityFilterMode, setProjectOverviewTaskActivityFilterMode\] = useState\("all"\);[\s\S]*?projectOverviewTaskActivityFilterPopupRef = useRef\(null\);[\s\S]*?projectOverviewTaskActivityFilterSurfaceRef = useRef\(null\);[\s\S]*?\["filter", "timeline-filter"\]\.includes\(projectOverviewTaskActivityToolbarPopover\)[\s\S]*?setProjectOverviewTaskActivityToolbarPopover\(""\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /setProjectOverviewTaskActivityFilterMode\("all"\);[\s\S]*?setProjectOverviewTaskActivitySelectedId\(selectionId\);[\s\S]*?selectedItemId: projectOverviewTaskActivitySelectedId,[\s\S]*?onSelectedItemChange: setProjectOverviewTaskActivitySelectedId/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /title: "Activity",\s*titleActions: renderProjectWorkActivityFilter\(\),\s*headerActions: React\.createElement\(PlatformSearch, \{[\s\S]*?placeholder: "Search activity"[\s\S]*?"aria-label": "Search project activity"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const projectWorkActivityFilterOptions = \[[\s\S]*?id: "lifecycle"[\s\S]*?id: "agent_work"[\s\S]*?id: "assignments"[\s\S]*?id: "planning"[\s\S]*?id: "other_changes"[\s\S]*?function matchesProjectWorkActivityFilter\(event, filterMode\)[\s\S]*?function renderProjectWorkActivityFilter\(\)[\s\S]*?variant: "minimal"[\s\S]*?portal: true,[\s\S]*?placement: "bottom-start"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?titleActions: renderProjectWorkActivityFilter\(\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const filteredProjectActivityEvents = filterProjectWorkActivityEventsByTimeRange\(\s*projectActivityEvents,\s*projectOverviewTaskActivityTimeRange\s*\)\s*\.filter\([\s\S]*?projectOverviewTaskActivityFilterMode[\s\S]*?const projectActivityTimelineItems = buildProjectWorkActivityTimelineItems\(\s*filteredProjectActivityEvents\s*\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectWorkActivityEventPreview\(event, task, ticketLabel\)[\s\S]*?function getProjectWorkActivityInspectorTarget\(event, task, ticketLabel\)[\s\S]*?function renderProjectWorkActivityInspectorAction\(target\)[\s\S]*?function buildProjectWorkActivityTimelineItems\(events\)[\s\S]*?preview: renderProjectWorkActivityEventPreview\([\s\S]*?inspectorAction: renderProjectWorkActivityInspectorAction\([\s\S]*?const projectActivityTimelineItems = buildProjectWorkActivityTimelineItems\(/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const isComputerAgentsActor = event\?\.actorType === "system";[\s\S]*?COMPUTER_AGENTS_CREATOR_PROFILE_URL/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const projectActivityTimelineItems = buildProjectOverviewTaskActivityTimelineItems\(/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /taskView === "activity"\s*\? renderProjectActivityOverviewView\(\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-backlog-header is-backlog-list-header"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?React\.createElement\(PlatformSearch, \{\s*className: "playground-tasks-backlog-central-search"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-backlog-header is-board-list-header"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?React\.createElement\(PlatformSearch, \{\s*className: "playground-tasks-board-central-search"/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /\/api\/aios\/organizations\/"[\s\S]*?\/connector-credentials"/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /Array\.isArray\(payload\?\.providers\)[\s\S]*?providerCatalog\?\.credentials/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /\/connector-credentials\?provider=/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /new Headers\(requestHeaders \|\| \{\}\)\.get\("x-computer-agents-organization"\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /projectOverviewConnectorCredentialProviderDefinitions,\s*requestHeaders,\s*selectedProjectId/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /metadata\.connectorCredentialBindings/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /Object\.keys\(providerCatalogs\)[\s\S]*?bindingProviderIds/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /normalizedCredentialId === "__organization_default__"[\s\S]*?delete nextBindings\[providerId\]/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /connectorCredentialBindings: nextBindings/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /accessToken|refreshToken|clientSecret/,
);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-backlog-sort-shell/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /openScopedBoardTaskCount/);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderProjectTaskHeaderSearchControl|renderProjectReleasePickerControl|renderProjectWorkspaceActionButtons/,
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformModal, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "New Project"/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /title: "New Project",[\s\S]*?headerVariant: "search",[\s\S]*?headerLeading: renderProjectComposerIconPicker\(\),[\s\S]*?headerSearchProps: \{[\s\S]*?icon: null,[\s\S]*?placeholder: "Project name"/,
  "New Project must use the shared resource-name modal header with its interactive project icon.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectComposerIconPicker\(\) \{[\s\S]*?React\.createElement\(ProjectIconPicker, \{[\s\S]*?iconOptions: PLAYGROUND_PROJECT_ICON_OPTIONS,[\s\S]*?colorOptions: PLAYGROUND_PROJECT_ACCENT_COLORS,[\s\S]*?showProjectName: false,[\s\S]*?onChange: \(nextIdentity\) =>/,
  "New Project must reuse the centralized project icon and color picker from Project Details.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectInitialGoalField\(\) \{[\s\S]*?React\.createElement\(PlatformInstructionsEditor, \{[\s\S]*?title: "Project goal",[\s\S]*?variant: "minimalistic-ui"/,
  "New Project must use the centralized minimal instructions editor for its goal.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectInitialSetupBody\(\) \{[\s\S]*?renderProjectInitialGoalField\(\),[\s\S]*?renderProjectComposerProperties\(\)/,
  "New Project must place its boxed Project goal before the shared project properties.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectComposerProperties\(\) \{[\s\S]*?renderProjectComposerSidebarRow\("Status"[\s\S]*?renderProjectComposerSidebarSelectControl\(\s*"create-project-status"[\s\S]*?renderProjectComposerSidebarRow\("Priority"[\s\S]*?"create-project-priority"[\s\S]*?renderPlaygroundTaskPriorityLabel\(currentPriorityValue\)[\s\S]*?renderProjectComposerSidebarRow\("Computer"[\s\S]*?"create-project-computer"/,
  "New Project must reuse the project-details Status, Priority, and Computer row components.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectComposerSidebarRow\([\s\S]*?playground-tasks-detail-fact playground-project-overview-sidebar-row[\s\S]*?function renderProjectComposerSidebarSelectControl\([\s\S]*?React\.createElement\(PlatformSelector, \{/,
  "New Project must own its modal-scoped adapters for the shared project property primitives.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectComposerProperties\(\) \{[\s\S]*?renderProjectComposerSidebarRow\("Owner"/,
  "New Project must assign the current user automatically without displaying an Owner selector.",
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /const defaultLeadUserId = String\(currentUserId[\s\S]*?ownerUserId: defaultLeadUserId,[\s\S]*?owner: \{\s*userId: defaultLeadUserId,/,
  "New Project must initialize its owner from the trusted current-user identity.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const normalizedProjectStatus = normalizePlaygroundProjectStatus\(projectDraft\.status[\s\S]*?status: normalizedProjectStatus,[\s\S]*?priority: normalizedProjectPriority,[\s\S]*?ownerUserId: nextOwnerUserId/,
  "New Project must persist Status, Priority, and its automatically assigned Owner.",
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /await applyPlaygroundProjectInitialSetup\(committedProject[\s\S]*?nextOwnerUserId !== persistedOwnerUserId[\s\S]*?\/owner"[\s\S]*?body: JSON\.stringify\(\{ ownerUserId: nextOwnerUserId \}\)/,
  "New Project must apply initial setup before transferring a non-default owner.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectInitialSetupBody\(\) \{[\s\S]*?renderProjectBlueprintSelector\(\)[\s\S]*?const projectComposerForm/,
  "New Project must not display the Project Type selector.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const canCreateProject = !projectSaveState\.isSaving[\s\S]*?disabled: !canCreateProject,[\s\S]*?onKeyDown: \(event\) => \{[\s\S]*?if \(canCreateProject\) handleComposerSubmitShortcut\(event\)/,
  "New Project shortcut submission must share the primary button's enabled state.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /if \(isInitialProjectSetupModal\) \{[\s\S]*?React\.createElement\(PlatformModal, \{[\s\S]*?className: "playground-project-create-modal playground-tasks-project-initial-setup-modal",[\s\S]*?footer: React\.createElement\(React\.Fragment,[\s\S]*?PlatformSecondaryButton[\s\S]*?PlatformPrimaryButton/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /title: "New Project",[\s\S]{0,500}?showHeader: false/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-create-modal\.platform-modal-surface\s*\{[\s\S]*?\.playground-project-create-modal__body\.platform-modal-body\s*\{[\s\S]*?overflow-y: auto;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-create-modal__description-editor\.platform-instructions-editor\s*\{[\s\S]*?padding: 12px;[\s\S]*?border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]*?border-radius: 10px;[\s\S]*?background: rgba\(255, 255, 255, 0\.075\);/,
  "New Project must render Project goal in the same boxed editor treatment as New Issue.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /title: "New Project",[\s\S]*?size: "large"/,
  "New Project must use the same large shared modal width as New Issue.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-create-modal__description-editor \.platform-instructions-editor__prosemirror\s*\{\s*min-height: 144px;/,
  "New Project must retain the taller goal editor treatment.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-create-modal__icon-picker \.platform-project-icon-picker__trigger\s*\{[\s\S]*?width: 36px;[\s\S]*?height: 36px;[\s\S]*?\.playground-project-create-modal__icon-picker \.platform-project-icon-picker__trigger-icon\s*\{[\s\S]*?width: 32px;[\s\S]*?height: 32px;[\s\S]*?border-radius: 8px;/,
  "New Project must present its selected project icon in a comfortably padded header box.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-create-modal__properties\s*\{[\s\S]*?width: 100%;[\s\S]*?overflow: visible;[\s\S]*?padding: 0;[\s\S]*?border: 0;[\s\S]*?border-radius: 0;[\s\S]*?background: transparent;/,
  "New Project properties must preserve the full-width row layout without a surrounding card.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-create-modal > \.platform-modal-header \.platform-modal-header__search-input\s*\{\s*font-size: 16px;/,
  "New Project must render the project name at 16px in the modal header.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-new-issue-modal > \.platform-modal-header \.platform-modal-header__search-input\s*\{\s*font-size: 16px;/,
  "New Issue must render the issue title at 16px in the modal header.",
);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "Sort projects"/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function buildProjectOverviewTableRow\(project, index\)[\s\S]*?statusLabel: statusOption\?\.label[\s\S]*?ownerName,[\s\S]*?updatedLabel,[\s\S]*?searchText:/,
  "Project overview rows must normalize status, owner, update time, and searchable text.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function buildProjectOverviewTableRow\(project, index\)[\s\S]*?const projectIconConfig = getPlaygroundProjectIconConfig\([\s\S]*?icon: React\.createElement\(ProjectIcon, \{ width: 16, height: 16, strokeWidth: 1\.8 \}\)/,
  "Project overview rows must carry the saved project icon into the shared catalog identity cell.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const ownerAvatarUrl = firstIdentityValue\(\[[\s\S]*?source\.ownerAvatarUrl,[\s\S]*?source\.createdByAvatarUrl,[\s\S]*?metadata\.createdByAvatarUrl,[\s\S]*?isCurrentOwner \? currentUserAvatarUrl : ""/,
  "Project owners must resolve profile images from owner, creator, metadata, or the current account.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function getProjectCardCreatorName\(project\)[\s\S]*?const normalizedCreatorEmail = creatorEmail \|\| \(creatorName\.includes\("@"\)[\s\S]*?formatAccountDisplayName\(/,
  "Project overview owners must normalize creator identities into display names instead of emails.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderProjectLanding\(\)[\s\S]*?if \(hasProjects\) \{\s*return React\.createElement\(ProjectsOverviewPage, \{[\s\S]*?rows: overviewRows,[\s\S]*?onOpen: \(row\) => handleSelectProject\(row\.id\),[\s\S]*?onEdit:[\s\S]*?onDelete:/,
  "Non-empty Projects must render through the shared resource overview page.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-view-section playground-projects-overview-surface is-empty-hero"[\s\S]*?"Organize your work in projects"[\s\S]*?renderProjectWorkingAgentEmptyState\(\)/,
  "The established Projects empty state must remain intact.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-main-scroll\.is-projects-home\.has-resource-overview\s*\{\s*padding: 0;\s*overflow: hidden;/,
  "The shared Projects overview must fill its host without legacy card-grid insets.",
);
assert.match(PROJECTS_STYLES, /playground-project-overview/);
assert.match(PROJECTS_STYLE_FRAGMENTS.core, /playground-tasks-page/);
assert.doesNotMatch(
  PROJECTS_CORE_CSS,
  /\.playground-agent-runtime-settings-card\.playground-server-details-card::before\s*\{[\s\S]{0,500}content:\s*""/,
  "Projects styles must not reintroduce the Agent Runtime settings card decorative border.",
);
assert.match(
  PROJECTS_STYLE_FRAGMENTS.connectorBrowser,
  /playground-tasks-connector-browser-portal/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-resources-page\.is-develop-server-kind-page\.is-database-data-tab[\s\S]{0,180}playground-environments-detail-scroll\.playground-settings-detail-scroll\.is-database-data-tab\s*\{[\s\S]{0,300}padding: 0;[\s\S]{0,120}overflow: hidden;/,
  "Database Data must remove the centered detail-page spacer and fill the available scroll area.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-server-detail-content\.is-database-data-tab \.playground-database-browser-surface\.playground-server-details-card\s*\{[\s\S]{0,420}width: 100%;[\s\S]{0,360}margin: 0;[\s\S]{0,180}padding: 0;[\s\S]{0,100}border: 0;[\s\S]{0,100}border-radius: 0;[\s\S]{0,100}background: transparent;/,
  "Database Data must render its browser as an unframed full-size workspace.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-server-detail-content\.is-database-data-tab[\s\S]{0,140}\.playground-database-browser-surface\.playground-server-details-card::before\s*\{[\s\S]{0,100}content: none;[\s\S]{0,100}display: none;/,
  "Database Data must suppress the legacy generated border layer.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-database-browser-columns\s*\{\s*--playground-database-browser-column-inline-padding: 20px;[\s\S]{0,2200}\.playground-database-browser-pane-header\s*\{[\s\S]{0,160}padding: 10px var\(--playground-database-browser-column-inline-padding\);[\s\S]{0,4200}\.playground-database-browser-pane-row\s*\{[\s\S]{0,160}padding: 0 var\(--playground-database-browser-column-inline-padding\);/,
  "Database browser pane headers and rows must share the app-header horizontal inset.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-resources-page\.is-develop-server-kind-page[\s\S]{0,140}playground-settings-detail-scroll\.is-database-data-tab,[\s\S]{0,260}:has\([\s\S]{0,160}is-database-data-tab[\s\S]{0,80}\)\s*\{[\s\S]{0,320}padding-bottom: 0;/,
  "Database Data must remove detail-scroll bottom padding through both direct and descendant tab markers.",
);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-frame\s*\{/);
assert.doesNotMatch(PROJECTS_CORE_CSS, /\.playground-ticket-detail-frame\.has-preview\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-page\s*\{/);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-unified-navbar\.is-ticket-detail\s*\{\s*grid-template-columns: minmax\(0, 1fr\) 0 auto;/,
  "Ticket details must let their breadcrumb use the header width left by the action area.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-unified-navbar\.is-ticket-detail[\s\S]*?\.playground-top-nav-path-item-group\.is-current\s*\{\s*max-width: min\(720px, 60vw\);/,
  "Ticket breadcrumbs must retain a useful title width before truncating.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-page\s*\{[\s\S]*?grid-template-rows: minmax\(0, 1fr\);[\s\S]*?row-gap: 0;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-page\.has-header\s*\{[\s\S]*?grid-template-rows: auto minmax\(0, 1fr\);[\s\S]*?row-gap: 12px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel \.playground-tasks-detail-navbar\s*\{[\s\S]*?border-bottom: 0;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-attachment-sidebar-body\s*\{[\s\S]*?padding: 0;\s*overflow: hidden;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel\s+\.playground-ticket-detail-content\s+\.playground-environments-detail-scroll\.playground-tasks-detail-scroll\s*\{\s*padding-top: 0 !important;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-content-body\.is-tasks-page\s+\.playground-environments-page\.playground-tasks-ticket-screen:not\(\.playground-agents-page\)\s+\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\s*\{\s*padding-right: 50px !important;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-content\s+\.platform-instructions-editor\.playground-tasks-detail-description\s*\{\s*margin-top: 0;\s*margin-bottom: 0;\s*padding-bottom: 3px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-content\s+\.platform-instructions-editor\.is-minimalistic-ui\s+\.platform-instructions-editor__header\s*\{\s*background: #000;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-database-description-section\.platform-instructions-editor\s*\{\s*margin: 0;\s*padding-bottom: 3px !important;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-database-description-section\s+\.platform-instructions-editor__title\s*\{\s*font-size: 14px;/,
);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-subtasks\s*\{\s*margin-top: 12px;/);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel \.playground-tasks-activity\s*\{[\s\S]*?align-self: stretch;[\s\S]*?width: 100%;[\s\S]*?max-width: 100%;[\s\S]*?min-width: 0;[\s\S]*?margin-top: 0;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-activity-comment-attachments\s*\{[\s\S]*?display: flex;[\s\S]*?flex-wrap: wrap;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel \.playground-tasks-comments-toolbar\s*\{[\s\S]*?padding-bottom: 12px;\s*border-bottom: 1px solid rgba\(255, 255, 255, 0\.1\);/,
);
assert.doesNotMatch(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel \.playground-tasks-connectors-header/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel \.playground-tasks-comments-toolbar\s*\{\s*margin-bottom: 24px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-screen-panel \.playground-tasks-comments-list\s*\{\s*gap: 24px;/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformResourceActionsMenu, \{\s*open: taskDetailPopover === "menu",[\s\S]*?onOpenChange: \(nextOpen\) => setTaskDetailPopover\(nextOpen \? "menu" : ""\),[\s\S]*?resourceLabel: "Ticket"/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-comment-modal-instructions\s*\{[\s\S]*?min-height: 180px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-comment-modal-instructions \.platform-instructions-editor__title\s*\{\s*font-size: 14px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-comment-modal-body\s*\{[\s\S]*?margin-top: 0;\s*padding-top: 0;/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /if \(\s*!selectedTaskId[\s\S]*?taskView !== "overview"[\s\S]*?taskView !== "backlog"[\s\S]*?taskView !== "board"[\s\S]*?\) \{\s*setProjectTaskDetailScreenOpen\(false\);/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const isProjectTaskDetailScreenOpen = Boolean\(\s*projectTaskDetailScreenOpen\s*&& selectedProjectId\s*&& selectedTaskId\s*&& \(taskView === "overview" \|\| taskView === "backlog" \|\| taskView === "board"\)\s*\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-detail-creator-value \.playground-tasks-detail-select-trigger-label\s*\{\s*color: rgba\(255, 255, 255, 0\.82\);\s*font-size: 12px;\s*font-weight: 400;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-content-body\.is-tasks-page\s+\.playground-environments-page\.playground-tasks-project-workspace:not\(\.playground-agents-page\)\s+\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-board\s*\{\s*padding-bottom: 24px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-sidebar \.is-centralized-sidebar-content\s*\{/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-sidebar \.playground-tasks-detail-work-control,[\s\S]*?\.playground-tasks-detail-work-selector \.platform-button-selector__group\s*\{\s*width: 100%;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-ticket-thread-divider\s*\{\s*width: 100%;\s*height: 1px;\s*flex: 0 0 1px;\s*margin: 12px 0;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-detail-thread-row\s*\{\s*width: calc\(100% \+ 16px\);[\s\S]*?margin-left: -8px;\s*padding: 10px 8px;\s*border: 0;\s*border-radius: 8px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-backlog-header\.is-backlog-list-header\s+\.playground-tasks-backlog-heading,\s*\.playground-tasks-backlog-header\.is-board-list-header\s+\.playground-tasks-backlog-heading\s*\{\s*font-weight: 400;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-project-workspace\s+\.playground-tasks-backlog-view\s+\.playground-tasks-backlog-item\s*\{\s*border-color: rgba\(255, 255, 255, 0\.075\);\s*background: rgba\(255, 255, 255, 0\.075\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-tasks-backlog-central-search\.platform-search,\s*\.playground-tasks-board-central-search\.platform-search\s*\{\s*width: 300px;\s*min-width: 300px;\s*flex: 0 0 300px;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-workspace-inner\s*\{[\s\S]*?transition: width 220ms ease, max-width 220ms ease;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-workspace-inner\.is-backlog-work-view,\s*\.playground-project-workspace-inner\.is-board-work-view\s*\{\s*width: min\(100%, var\(--playground-centered-page-max-width\)\);\s*max-width: var\(--playground-centered-page-max-width\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-activity\s*\{\s*padding: 0 !important;\s*gap: 0;\s*overflow: hidden;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-workspace-inner\.is-activity-work-view\s*\{\s*width: 100%;\s*height: 100%;\s*max-width: none;\s*min-height: 0;\s*margin: 0;\s*gap: 0;/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-activity-page\s*\{\s*display: grid;\s*flex: 1 1 auto;\s*grid-template-rows: repeat\(2, minmax\(0, 1fr\)\);\s*height: 100%;\s*min-height: 0;/,
);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(
  platformEntrySource,
  /onThreadActionMenuOpen: openThreadActionMenu,[\s\S]{0,800}?onThreadStarted: \(threadId, options = \{\}\) => \{[\s\S]{0,500}?upsertRealThreadRecord\(options\.threadRecord\)/,
  "Project-managed runs must insert their returned origin thread before navigating to it.",
);
assert.match(
  platformEntrySource,
  /const activeProjectWorkspaceView = tasksHeaderState\.view === "board"[\s\S]*?: activeProjectSectionId === "resources"\s*\? "resources"[\s\S]*?const activeProjectView = activeProjectWorkspaceView === "board"\s*\? "backlog"/,
);
assert.match(
  platformEntrySource,
  /const activeProjectSectionId = String\(tasksHeaderState\.sectionId \|\| ""\)\.trim\(\)\.toLowerCase\(\);[\s\S]*?const isProjectMilestonesView = Boolean\([\s\S]*?activeProjectSectionId === "milestones"/,
);
assert.match(
  platformEntrySource,
  /const isProjectSettingsView = Boolean\([\s\S]*?activeProjectSectionId === "permissions"[\s\S]*?canViewProjectSettings && !isProjectTaskDetailView\s*\? React\.createElement\(PlatformSecondaryButton, \{[\s\S]*?active: isProjectSettingsView,[\s\S]*?className: "playground-tasks-nav-settings-button",[\s\S]*?navigateToProjectSection\("permissions"\)[\s\S]*?React\.createElement\(Settings,[\s\S]*?React\.createElement\("span", null, "Settings"\)[\s\S]*?React\.createElement\(PlatformButtonSelector, \{[\s\S]*?label: "New Issue"/,
  "Project details must render an active-aware Settings button immediately before New Issue.",
);
assert.match(
  platformEntrySource,
  /options: \[\s*\{ value: "overview", label: "Progress" \},\s*\{ value: "backlog", label: "Backlog" \},\s*\{ value: "resources", label: "Resources" \},\s*\]/,
);
assert.match(
  platformEntrySource,
  /view: nextView === "resources" \? "overview" : nextView,\s*sectionId: nextView === "resources" \? "resources" : "general"/,
);
assert.match(
  platformEntrySource,
  /const projectResourceNavigationOriginRef = useRef\(null\)[\s\S]*?function normalizeProjectResourceNavigationOrigin\(resourceType, resource, projectOrigin = \{\}\)[\s\S]*?const projectRecord = projectOrigin\?\.projectRecord[\s\S]*?const resourceSnapshot = projectOrigin\?\.projectResourceSnapshot[\s\S]*?projectResourceSnapshot: resourceSnapshot,[\s\S]*?function openProjectLinkedResourceFromProject\(resourceType, resource, projectOrigin = \{\}\)[\s\S]*?projectResourceNavigationOriginRef\.current = origin[\s\S]*?setProjectResourceNavigationOrigin\(origin\)[\s\S]*?function returnToProjectResourceOrigin\(origin = projectResourceNavigationOrigin\)[\s\S]*?projectResourceNavigationOriginRef\.current = null[\s\S]*?setTasksPageNavigationRequest\(\{[\s\S]*?projectRecord,[\s\S]*?projectResourceSnapshot,[\s\S]*?function resolveProjectResourceBreadcrumbItems\(pathItems\)[\s\S]*?label: origin\.projectName[\s\S]*?returnToProjectResourceOrigin\(origin\)/,
);
assert.match(
  platformEntrySource,
  /if \(entry\.page === "tasks" \|\| entry\.page === "calendar"\)[\s\S]*?const resourceOrigin = projectResourceNavigationOriginRef\.current[\s\S]*?const resourceOriginProjectRecord = resourceOrigin\?\.projectRecord[\s\S]*?const resourceOriginProjectSnapshot = resourceOrigin\?\.projectResourceSnapshot[\s\S]*?projectResourceNavigationOriginRef\.current = null[\s\S]*?setTasksPageNavigationRequest\(\{[\s\S]*?projectRecord: resourceOriginProjectRecord,[\s\S]*?projectResourceSnapshot: resourceOriginProjectSnapshot/,
);
assert.match(
  platformEntrySource,
  /onOpenProjectLinkedResource: openProjectLinkedResourceFromProject/g,
);
assert.match(
  platformEntrySource,
  /projectId: tasksHeaderState\.projectId,\s*sectionId: tasksHeaderState\.sectionId,[\s\S]*?sectionId: entry\.sectionId \|\| ""/,
);
assert.doesNotMatch(
  platformEntrySource,
  /\{ value: "activity", label: "Activity" \}/,
);
assert.doesNotMatch(
  platformEntrySource,
  /if \(nextView === "settings"\) \{\s*navigateToProjectSection\("permissions"\);\s*return;/,
);
const platformProjectRefreshStart = platformEntrySource.indexOf("const refreshProjects = useCallback");
const platformProjectRefreshEnd = platformEntrySource.indexOf(
  "const handleShowMoreThreads = useCallback",
  platformProjectRefreshStart,
);
assert.ok(platformProjectRefreshStart >= 0 && platformProjectRefreshEnd > platformProjectRefreshStart);
assert.match(
  platformEntrySource.slice(platformProjectRefreshStart, platformProjectRefreshEnd),
  /proxyBackendBase \+ "\/projects\?view=overview"/,
);
assert.doesNotMatch(
  platformEntrySource.slice(platformProjectRefreshStart, platformProjectRefreshEnd),
  /\/teams"|resource-shares|missingSharedProjectIds/,
);
assert.match(
  platformEntrySource,
  /if \(activePage === "tasks" \|\| activePage === "calendar"\) \{\s*return;\s*\}/,
);
assert.match(
  platformEntrySource,
  /React\.createElement\(PlatformSearch, \{\s*className: "playground-project-resources-central-search"/,
);
assert.match(
  platformEntrySource,
  /React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?popupVariant: "minimal"/,
);
assert.match(
  platformEntrySource,
  /React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal",\s*placement: "bottom-start"/,
);
assert.match(
  platformEntrySource,
  /import \{ PlatformUiCard \} from "\/dist\/platform-ui\/components\/composite\/ui-card\/index\.js";/,
);
assert.match(
  platformEntrySource,
  /import \{ PlatformAttachmentActionMenu, PlatformAttachments \} from "\/dist\/platform-ui\/components\/composite\/attachments\/index\.js";/,
);
assert.match(
  platformEntrySource,
  /import \{[^}]*PlatformFileExplorerBrowserModal[^}]*PlatformFileExplorerModal[^}]*\} from "\/dist\/platform-ui\/components\/composite\/file-explorer\/index\.js";/,
);
assert.match(
  platformEntrySource,
  /import \{[^}]*RunnerFileBrowserDialog[^}]*\} from "\/dist\/react\/index\.js";/,
  "The legacy platform must consume the same centralized explorer dialog exported for Runner Chat.",
);
assert.match(
  platformEntrySource,
  /import \{ PlatformSubtasks \} from "\/dist\/platform-ui\/components\/composite\/subtasks\/index\.js";/,
);
assert.match(
  platformEntrySource,
  /import \{ PlatformTicketItem \} from "\/dist\/platform-ui\/components\/ui\/ticket-item\/index\.js";/,
);
assert.match(
  platformEntrySource,
  /attachmentPreviewPortalId: "playground-task-attachment-preview-root"/,
);
assert.match(
  platformEntrySource,
  /id: "playground-task-attachment-preview-root",\s*className: "platform-floating-sidebar-portal playground-task-attachment-preview-portal"/,
);
assert.match(platformEntrySource, /React\.createElement\(ListFilter, \{ width: 14/);
assert.match(platformEntrySource, /playground-project-resources-toolbar-title-group/);
assert.match(
  platformEntrySource,
  /toolbarLeading = null,[\s\S]*?const renderSharedToolbar = \(\) => \(toolbarLeading \|\| normalizedToolbarTitle\)[\s\S]*?toolbarLeading \|\| React\.createElement\("h2"/,
);
assert.match(
  platformEntrySource,
  /renderSharedFilterControl\(\)[\s\S]*?renderSharedNewControl\(\),\s*renderSharedSearchControl\(\)/,
);
assert.match(
  platformEntrySource,
  /const activeTicketNumber = String\(tasksHeaderState\.ticketNumber \|\| ""\)\.trim\(\)/,
);
assert.match(
  platformEntrySource,
  /const activeTicketType = tasksHeaderState\.taskType === "subtask"[\s\S]*?const ActiveTicketTypeIcon = activeTicketType === "subtask"/,
);
assert.match(
  platformEntrySource,
  /label: activeTicketNumber,\s*leading: React\.createElement\("span", \{\s*className: "playground-tasks-backlog-project-icon is-" \+ activeTicketType,[\s\S]*?React\.createElement\(ActiveTicketTypeIcon/,
);
assert.match(
  platformEntrySource,
  /const projectIconConfig = getPlaygroundProjectIconConfig\(tasksHeaderState\.icon\)[\s\S]*?className: "playground-project-breadcrumb-icon"[\s\S]*?label: projectTitle,\s*leading: projectBreadcrumbLeading,\s*trailing: projectBreadcrumbTrailing/,
);
assert.match(
  platformEntrySource,
  /const projectBreadcrumbTrailing = isProjectDetailView[\s\S]*?React\.createElement\(PlatformResourceHeaderActions, \{[\s\S]*?React\.createElement\(PlatformResourceActionsMenu, \{[\s\S]*?resourceLabel: "Project"[\s\S]*?React\.createElement\(PlatformResourceActionsInformation, \{[\s\S]*?copyAriaLabel: "Copy Project ID"[\s\S]*?\{ id: "general", label: "Home", Icon: House \}[\s\S]*?\{ id: "resources", label: "Resources", Icon: FolderOpen \}[\s\S]*?\{ id: "permissions", label: "Settings", Icon: Settings2 \}[\s\S]*?label: "Copy Project ID"[\s\S]*?label: "Delete Project",\s*shortcut: "delete",\s*danger: true/,
);
assert.doesNotMatch(
  platformEntrySource,
  /projectBreadcrumbMenuRef|projectBreadcrumbMenuSurfaceRef|playground-project-breadcrumb-menu-id|playground-project-breadcrumb-menu-divider/,
);
assert.match(
  platformEntrySource,
  /label: activeTicketNumber,[\s\S]*?trailing: React\.createElement\("span", \{\s*id: "playground-ticket-breadcrumb-actions-root"/,
);
assert.match(
  platformEntrySource,
  /isProjectTaskDetailView\s*\? \[[\s\S]*?label: projectTitle,\s*leading: projectBreadcrumbLeading,\s*onClick: \(\) => setTasksProjectViewRequest/,
  "Ticket details must not render the Project actions menu beside the Project breadcrumb.",
);
assert.match(
  platformEntrySource,
  /className: "playground-tasks-unified-navbar"\s*\+ \(isProjectTaskDetailView \? " is-ticket-detail" : ""\)/,
  "Ticket details must opt into the wider ticket breadcrumb layout.",
);
assert.match(
  platformEntrySource,
  /\.\.\.\(isProjectTaskDetailView\s*\? \[\]\s*: \[\{\s*label: "Projects",/,
  "Ticket details must omit the redundant Projects root breadcrumb.",
);
assert.match(
  platformEntrySource,
  /center: isProjectDetailView\s*\? isProjectTaskDetailView\s*\? null\s*: React\.createElement\(PlatformSwitch, \{\s*className: "playground-tasks-nav playground-tasks-project-nav-switch"/,
);
assert.match(
  platformEntrySource,
  /import \{ PlatformIconButton \} from "\/dist\/platform-ui\/components\/ui\/icon-button\/index\.js";/,
);
assert.match(
  platformEntrySource,
  /className: "playground-tasks-ticket-navigation",[\s\S]*?activeTicketNavigation\.currentIndex \+ " \/ " \+ activeTicketNavigation\.totalCount[\s\S]*?title: "Next open ticket"[\s\S]*?React\.createElement\(ArrowDown,[\s\S]*?title: "Previous open ticket"[\s\S]*?React\.createElement\(ArrowUp,/,
);
assert.match(
  platformEntrySource,
  /function openProjectIssueComposerFromHeader\(taskType = "task"\)[\s\S]*?registeredHandler\(composerOptions\)[\s\S]*?taskType: requestedTaskType/,
  "The project-header creation bridge must preserve the requested task type.",
);
assert.match(
  platformEntrySource,
  /React\.createElement\(PlatformButtonSelector, \{\s*mode: "split-action",\s*buttonVariant: "primary",[\s\S]*?label: "New Issue",[\s\S]*?onAction: \(\) => openProjectIssueComposerFromHeader\("task"\),[\s\S]*?popupVariant: "minimal",[\s\S]*?PLAYGROUND_TASK_TYPE_OPTIONS\.map\(\(option\) =>/,
  "Project details must use the central primary split selector for typed issue creation.",
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /onProjectIssueCreateHandlerChange\(\(options = \{\}\) => openProjectIssueComposer\(options\)\)/,
  "The mounted project issue composer must accept header-selected task types.",
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /openProjectIssueComposer\(\{ taskType: projectNavIssueRequest\?\.taskType \}\)/,
  "Fallback header requests must carry their selected task type into the issue composer.",
);
assert.match(
  platformEntrySource,
  /projectNavTaskRequest: tasksProjectTaskRequest/,
);
assert.match(
  platformEntrySource,
  /projectNavDeleteRequest: tasksProjectDeleteRequest/,
);
assert.match(
  platformEntrySource,
  /label: projectTitle,\s*leading: projectBreadcrumbLeading,\s*onClick: \(\) => setTasksProjectViewRequest/,
);
assert.match(
  platformEntrySource,
  /label: projectTitle,\s*leading: projectBreadcrumbLeading,\s*trailing: projectBreadcrumbTrailing,\s*onClick: isProjectMilestonesView[\s\S]*?navigateToProjectSection\("general"\)[\s\S]*?\[\{ label: "Milestones" \}\]/,
);
assert.match(
  platformEntrySource,
  /activeProjectWorkspaceView === "backlog"[\s\S]*?\|\| activeProjectWorkspaceView === "board"[\s\S]*?\) && !isProjectTaskDetailView\s*\? tasksHeaderState\.extraActions \|\| null/,
);
assert.match(
  platformEntrySource,
  /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/projects\/index\.mjs"/,
);
assert.doesNotMatch(platformEntrySource, /function PlaygroundTasksPage/);
assert.doesNotMatch(platformEntrySource, /async function proxyProjectResourceIndexGet/);
assert.doesNotMatch(platformEntrySource, /async function proxyTaskStartThread/);
assert.doesNotMatch(platformEntrySource, /async function fetchAiosTaskApi/);
assert.doesNotMatch(platformEntrySource, /async function proxyUpstreamTaskJsonRequest/);
assert.doesNotMatch(platformEntrySource, /PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX/);
assert.doesNotMatch(platformEntrySource, /function normalizePlaygroundProjectRecord/);
assert.doesNotMatch(platformEntrySource, /function buildPlaygroundProjectLinkedFilePathIndex/);
assert.doesNotMatch(platformEntrySource, /function createPlaygroundProjectTeamRolePermissionSet/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-tasks-page \{/m);
assert.doesNotMatch(
  platformEntrySource,
  /^\s*\.playground-tasks-connector-browser-portal\.tb-runner-chat \{/m,
);

const calls = [];
const record =
  (adapter) =>
  (...args) => {
    calls.push({ adapter, args });
  };
const projectsService = createProjectsService({
  fetchAiosApi: async (...args) => {
    calls.push({ adapter: "api", args });
    return new Response("{}", { status: 200 });
  },
  fetchAiosCloud: async (...args) => {
    calls.push({ adapter: "cloud", args });
    return new Response("{}", { status: 200 });
  },
  fetchUpstreamJsonForProxyExactPath: async () => ({ status: 404, data: {} }),
  hasAiosSession: () => true,
  inferProxyContentTypeFromPath: () => "application/octet-stream",
  parseUpstreamUrl: () => "https://api.example.test/v1",
  proxyAiosJsonRequest: record("aios"),
  proxyUpstreamBinaryGet: record("binary"),
  proxyUpstreamGet: record("get"),
  proxyUpstreamJsonRequest: record("json"),
  proxyUpstreamRawRequest: record("raw"),
  readOptionalApiKey: () => "",
  readRequestBody: async () => ({}),
  sendJson: record("send"),
  withProxyOrganizationHeader: (_req, _body, headers) => headers,
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = projectsService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/projects");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects");

result = dispatch("GET", "/api/real/projects/project%201/delivery-plan");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/delivery-plan");

result = dispatch("PUT", "/api/real/projects/project%201/delivery-plan");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/delivery-plan");
assert.equal(result.call.args[3], "PUT");

result = dispatch("POST", "/api/real/projects/project%201/delivery-plan/preview");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/delivery-plan/preview");
assert.equal(result.call.args[3], "POST");

result = dispatch("POST", "/api/real/projects/project%201/delivery-plan/provision");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/delivery-plan/provision");
assert.equal(result.call.args[3], "POST");

result = dispatch("GET", "/api/real/projects/project%201/delivery-plan/execution");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/delivery-plan/execution");

for (const action of ["start", "reconcile", "retry", "cancel"]) {
  result = dispatch(
    "POST",
    `/api/real/projects/project%201/delivery-plan/execution/${action}`,
  );
  assert.equal(result.call.adapter, "json");
  assert.equal(
    result.call.args[2],
    `/projects/project%201/delivery-plan/execution/${action}`,
  );
  assert.equal(result.call.args[3], "POST");
}

result = dispatch("POST", "/api/real/projects/project%201/automation-runs");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/automation-runs");
assert.equal(result.call.args[3], "POST");

result = dispatch("GET", "/api/real/projects/project%201/automation-runs/latest");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/automation-runs/latest");

result = dispatch("GET", "/api/real/projects/project%201/automation-runs/run%202");
assert.equal(result.call.adapter, "get");
assert.equal(
  result.call.args[2],
  "/projects/project%201/automation-runs/run%202",
);

for (const action of ["next", "pause", "resume", "cancel"]) {
  result = dispatch(
    "POST",
    `/api/real/projects/project%201/automation-runs/run%202/${action}`,
  );
  assert.equal(result.call.adapter, "json");
  assert.equal(
    result.call.args[2],
    `/projects/project%201/automation-runs/run%202/${action}`,
  );
  assert.equal(result.call.args[3], "POST");
}

for (const action of ["complete", "fail"]) {
  result = dispatch(
    "POST",
    `/api/real/projects/project%201/automation-runs/run%202/steps/step%203/${action}`,
  );
  assert.equal(result.call.adapter, "json");
  assert.equal(
    result.call.args[2],
    `/projects/project%201/automation-runs/run%202/steps/step%203/${action}`,
  );
  assert.equal(result.call.args[3], "POST");
}

result = dispatch("PATCH", "/api/real/projects/project%201");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("GET", "/api/real/projects/project%201/owner-candidates");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/owner-candidates");

result = dispatch("PATCH", "/api/real/projects/project%201/owner");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/owner");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("GET", "/api/real/projects/project%201/home");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/home");

result = dispatch("GET", "/api/real/projects/project%201/work-graph");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/work-graph");

result = dispatch("POST", "/api/real/projects/project%201/mission-control/runs");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/mission-control/runs");
assert.equal(result.call.args[3], "POST");

result = dispatch("GET", "/api/real/projects/project%201/agent-sessions?limit=25");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/agent-sessions");

result = dispatch("GET", "/api/real/projects/project%201/agent-sessions/summary?window=7d");
assert.equal(result.call.adapter, "get");
assert.equal(
  result.call.args[2],
  "/projects/project%201/agent-sessions/summary",
);

result = dispatch("POST", "/api/real/projects/project%201/work-relations");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/work-relations");
assert.equal(result.call.args[3], "POST");

result = dispatch("DELETE", "/api/real/projects/project%201/work-relations/relation%201");
assert.equal(result.call.adapter, "json");
assert.equal(
  result.call.args[2],
  "/projects/project%201/work-relations/relation%201",
);
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/projects/project%201/updates");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/updates");

result = dispatch("POST", "/api/real/projects/project%201/updates");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201/updates");
assert.equal(result.call.args[3], "POST");

result = dispatch("GET", "/api/real/projects/project%201/mention-candidates");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/mention-candidates");

result = dispatch(
  "POST",
  "/api/real/projects/project%201/activity/event%202/comments",
);
assert.equal(result.call.adapter, "json");
assert.equal(
  result.call.args[2],
  "/projects/project%201/activity/event%202/comments",
);
assert.equal(result.call.args[3], "POST");

result = dispatch(
  "POST",
  "/api/real/projects/project%201/updates/update%202/comments",
);
assert.equal(result.call.adapter, "json");
assert.equal(
  result.call.args[2],
  "/projects/project%201/updates/update%202/comments",
);
assert.equal(result.call.args[3], "POST");

for (const method of ["PATCH", "DELETE"]) {
  result = dispatch(
    method,
    "/api/real/projects/project%201/updates/update%202/comments/comment%203",
  );
  assert.equal(result.call.adapter, "json");
  assert.equal(
    result.call.args[2],
    "/projects/project%201/updates/update%202/comments/comment%203",
  );
  assert.equal(result.call.args[3], method);
}

result = dispatch(
  "PUT",
  "/api/real/projects/project%201/updates/update%202/reactions",
);
assert.equal(result.call.adapter, "json");
assert.equal(
  result.call.args[2],
  "/projects/project%201/updates/update%202/reactions",
);
assert.equal(result.call.args[3], "PUT");

result = dispatch("POST", "/api/aios/projects/project_1/skills");
assert.equal(result.call.adapter, "aios");
assert.equal(result.call.args[2], "/api/projects/project_1/skills");

result = dispatch("GET", "/api/aios/projects/project_1/costs/summary");
assert.equal(result.call.adapter, "aios");
assert.equal(result.call.args[2], "/api/projects/project_1/costs/summary");

result = dispatch("POST", "/api/real/projects/project_1/schedules/schedule_1/trigger");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("GET", "/api/real/tasks/releases/release_1");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/releases/release_1");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("GET", "/api/real/tasks/task_1?threadDetails=summary");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/task_1?threadDetails=summary");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("GET", "/api/real/tasks/activity?projectId=project_1&limit=5");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/activity?projectId=project_1&limit=5");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("GET", "/api/real/tasks/task_1/activity");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/task_1/activity");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("GET", "/api/real/tasks/task_1/agent-sessions?limit=10");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/task_1/agent-sessions?limit=10");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("GET", "/api/real/tasks/task_1/activity-subscription");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/task_1/activity-subscription");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("PUT", "/api/real/tasks/task_1/activity-subscription");
assert.equal(result.handled, true);
await Promise.resolve();
assert.equal(calls[0].adapter, "cloud");
assert.equal(calls[0].args[1], "/tasks/task_1/activity-subscription");

result = dispatch("POST", "/api/real/tasks/task_1/run-thread");
assert.equal(result.handled, true);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(calls[0].adapter, "cloud");
assert.equal(calls[0].args[1], "/tasks/task_1/run-thread");

result = dispatch("GET", "/api/task-backlog/project_1/threads/taskbacklog_test/context");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "send");
assert.equal(result.call.args[1], 200);

const taskBacklogUpstreamCalls = [];
const taskBacklogService = createTaskBacklogService({
  fetchAiosTaskApi: async (_req, path, options) => {
    taskBacklogUpstreamCalls.push({ path, options });
    return new Response(JSON.stringify({
      task: {
        id: "task_created_from_backlog",
        projectId: "project_1",
        title: "Create a backlog task",
      },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  },
  hasAiosSession: () => true,
  inferProxyContentTypeFromPath: () => "application/octet-stream",
  parseUpstreamUrl: () => "https://api.example.test/v1",
  proxyUpstreamBinaryGet: () => {},
  proxyUpstreamGet: () => {},
  proxyUpstreamJsonRequest: () => {},
  proxyUpstreamRawRequest: () => {},
  readOptionalApiKey: () => "",
  readRequestBody: async (req) => req.body || {},
  sendJson: (res, status, payload) => {
    res.status = status;
    res.payload = payload;
    res.finish?.();
  },
  withProxyOrganizationHeader: (_req, _body, headers) => headers,
});
const createBacklogThreadResponse = {};
const createBacklogThreadFinished = new Promise((resolve) => {
  createBacklogThreadResponse.finish = resolve;
});
const createBacklogThreadPath = "/api/task-backlog/project_1/threads";
assert.equal(taskBacklogService.handleRequest(
  {
    method: "POST",
    url: createBacklogThreadPath,
    headers: {},
    body: { agentId: "agent_1", environmentId: "environment_1" },
  },
  createBacklogThreadResponse,
  new URL(createBacklogThreadPath, "http://localhost"),
), true);
await createBacklogThreadFinished;
assert.equal(createBacklogThreadResponse.status, 200);
const backlogThreadId = createBacklogThreadResponse.payload?.thread?.id;
assert.match(backlogThreadId, /^taskbacklog_/);

const createBacklogTaskResponse = {
  chunks: [],
  writeHead(status, headers) {
    this.status = status;
    this.headers = headers;
  },
  write(chunk) {
    this.chunks.push(chunk);
  },
  end() {
    this.finish?.();
  },
};
const createBacklogTaskFinished = new Promise((resolve) => {
  createBacklogTaskResponse.finish = resolve;
});
const createBacklogTaskPath = `/api/task-backlog/project_1/threads/${encodeURIComponent(backlogThreadId)}/messages?source=backlog`;
assert.equal(taskBacklogService.handleRequest(
  {
    method: "POST",
    url: createBacklogTaskPath,
    headers: {},
    body: { content: "Create a backlog task" },
  },
  createBacklogTaskResponse,
  new URL(createBacklogTaskPath, "http://localhost"),
), true);
await createBacklogTaskFinished;
assert.equal(createBacklogTaskResponse.status, 200);
assert.equal(taskBacklogUpstreamCalls.length, 1);
assert.equal(taskBacklogUpstreamCalls[0].path, "/tasks");
assert.match(createBacklogTaskResponse.chunks.join(""), /stream\.completed/);

result = dispatch("GET", "/api/real/agents");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

const upstreamResponses = new Map([
  [
    "/projects/project_1?view=metadata",
    {
      status: 200,
      data: {
        project: {
          id: "project_1",
          name: "Project One",
          defaultEnvironmentId: "environment_1",
          attachments: [
            { id: "file_1", source: "imagine", projectId: "project_1" },
            { id: "file_2", source: "upload", projectId: "project_1" },
          ],
          connectors: { github: { repo: "owner/repo" }, notion: false },
        },
      },
    },
  ],
  [
    "/servers?projectId=project_1",
    {
      status: 200,
      data: {
        servers: [
          { id: "server_1", projectId: "project_1" },
          { id: "server_nested_project", project: { id: "project_1" } },
          { id: "server_2", projectId: "project_2" },
          { id: "server_unscoped" },
        ],
      },
    },
  ],
  [
    "/metronomes?projectId=project_1",
    {
      status: 200,
      data: {
        metronomes: [
          { id: "metronome_1", metadata: { projectId: "project_1" } },
          { id: "metronome_unscoped" },
        ],
      },
    },
  ],
]);
let response = null;
const handleResourceIndex = createProjectResourceIndexHandler({
  fetchUpstreamJsonForProxyExactPath: async (_req, upstreamPath) =>
    upstreamResponses.get(upstreamPath) || { status: 404, data: {} },
  sendJson: (_res, status, data) => {
    response = { status, data };
    return response;
  },
});

await handleResourceIndex({}, {}, "project_1");
assert.equal(response.status, 200);
assert.equal(response.data.project.name, "Project One");
assert.equal(response.data.counts.files, 2);
assert.equal(response.data.counts.connectors, 1);
assert.deepEqual(
  response.data.servers.map((server) => server.id),
  ["server_1", "server_nested_project"],
);
assert.deepEqual(
  response.data.metronomes.map((metronome) => metronome.id),
  ["metronome_1"],
);
assert.deepEqual(
  response.data.imagineResources.map((resource) => resource.id),
  ["file_1"],
);

upstreamResponses.set("/servers?projectId=project_1", {
  status: 200,
  data: {
    projectId: "project_1",
    servers: [{ id: "legacy_scoped_server" }],
  },
});
upstreamResponses.set("/metronomes?projectId=project_1", {
  status: 200,
  data: {
    scope: { projectId: "project_1" },
    metronomes: [{ id: "legacy_scoped_metronome" }],
  },
});

await handleResourceIndex({}, {}, "project_1");
assert.deepEqual(
  response.data.servers.map((server) => server.id),
  ["legacy_scoped_server"],
);
assert.deepEqual(
  response.data.metronomes.map((metronome) => metronome.id),
  ["legacy_scoped_metronome"],
);

console.log("Projects service module and route contracts passed.");
