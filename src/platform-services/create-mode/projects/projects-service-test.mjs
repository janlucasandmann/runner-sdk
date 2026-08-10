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

const projectsClientUrl = new URL("./client/", import.meta.url);
const projectsOverviewUrl = new URL("./client/overview/", import.meta.url);
const projectsPageUrl = new URL("./client/page/", import.meta.url);
const projectsStylesUrl = new URL("./client/styles/", import.meta.url);

await Promise.all([
  assertLegacyBrowserSourceContract({
    label: "Projects domain runtime",
    source: PROJECTS_DOMAIN_RUNTIME_SCRIPT,
    expectedSha256: "cb530bc8693df3d431c5727a48fd4575ae8bc08417f05931a705015116257ba0",
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
    expectedSha256: "8f7d78169846f999220c5ae6f1d15dcc0ecc7c61228d67aa05d2a83f71cdf10a",
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
    expectedSha256: "5b826ae869422d8f4665ee6ac60dbc9d4106172a386e01c547eddd01690f23de",
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
    expectedSha256: "3969b15cb0f1c24274b5f795ae69d3aea568b9284b69d066b36faef4f279d994",
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
    expectedSha256: "ed14c80a45026808536e56422116f1e25e35659c472c4fdfebae72b3907b0d6d",
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
    expectedSha256: "b9fadb5e3b20752508d96058a215d5d3e2570436add252eaa1c41f910a58db72",
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
    expectedSha256: "1f6c9e3ffdcd79e23909362ddb0383d624a9ec4eb24af8a3865913b6af74b148",
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
    expectedSha256: "c9c81e5580d874693396c7d2a7ed981013598b337dbfed371ae30fb96b3b990b",
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
assert.match(
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  /\{ id: "overview", label: "General", icon: LayoutDashboard \}/,
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
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /taskView !== "overview"[\s\S]*?taskLoadState\?\.status !== "ready"[\s\S]*?loadProjectOverviewWorkGraph\(selectedProjectId, loadKey\)/,
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
  /taskRunIdempotencyKey[\s\S]*?"Idempotency-Key": taskRunIdempotencyKey[\s\S]*?idempotencyKey: taskRunIdempotencyKey/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const nextSuccessCriteria = normalizePlaygroundStrategyTextList\([\s\S]*?successCriteria: nextSuccessCriteria,[\s\S]*?metadata: nextMetadata/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Success criteria",[\s\S]*?successCriteriaInput:[\s\S]*?historyKey: "project-milestone-success-criteria:"/,
);
assert.match(
  PROJECTS_VIEWS_02_FRAGMENT,
  /function renderReleaseComposerDialog\(\)[\s\S]*?return React\.createElement\(PlatformModal, \{[\s\S]*?headerVariant: "search"[\s\S]*?bodyClassName: "playground-project-milestone-modal__body"[\s\S]*?footer: React\.createElement\(React\.Fragment/,
);
assert.doesNotMatch(
  PROJECTS_VIEWS_02_FRAGMENT,
  /PlatformModalBackdrop|PlatformModalSurface|createPortal\(modalElement/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /Do not create or update separate outcome objects[\s\S]*?Define measurable successCriteria directly on every milestone/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const hasParsedStrategyBrief = Boolean\([\s\S]*?normalizePlaygroundCanonicalProjectStrategyBrief\([\s\S]*?normalizedRecord\.strategyBriefReplace = true/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function normalizePlaygroundCanonicalProjectStrategyBrief\(value\)[\s\S]*?mission: strategy\.mission,[\s\S]*?successCriteria: strategy\.successCriteria,[\s\S]*?decisions: strategy\.decisions/,
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
  /React\.createElement\(PlatformButtonSelector, \{\s*mode: "split-action",\s*buttonVariant: "primary",[\s\S]*?label: isMissionControlRunning \? "Running Mission Control" : "Mission Control",[\s\S]*?popupVariant: "minimal",[\s\S]*?fullWidth: true,[\s\S]*?onAction: \(\) => \{[\s\S]*?openMissionControlComposer\(\);[\s\S]*?fullAutoActionLabel/,
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
  /sectionId: taskView === "overview" \? projectOverviewHomeTab : ""/,
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
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /popupHeader: taskDetailAvailableAssigneePopupModes\.length > 1[\s\S]*?React\.createElement\(PlatformSwitch/,
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
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-settings-add-rule-button"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-teams-add-button"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformPopup, \{\s*open: isAddTeamsMenuOpen,\s*variant: "minimal",\s*portal: true,\s*placement: "bottom-end"/,
);
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
  /tabs: \[\s*\{ id: "threads", label: "Threads" \},\s*\{ id: "activity", label: "Activity" \},\s*\{ id: "strategy", label: "Strategy" \},\s*\]/,
);
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
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /normalizedEvent\.eventType === "comment_added"[\s\S]*?normalizedEvent\.eventType === "field_changed" && fieldName === "description"/,
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
  2,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /variant: "sidebar",\s*className: "playground-project-overview-sidebar-card"/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Properties"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Resources"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Milestones"/);
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
  /renderProjectOverviewSidebarRow\("Owner", owner\.name,[\s\S]*?className: "is-owner"[\s\S]*?ariaLabel: "Project owner"/,
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
  /React\.createElement\(PlatformAnalyticsSection, \{\s*variant: "compact",\s*className: "playground-project-overview-sidebar-progress-analytics"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewSidebarProgressSection\(\)[\s\S]*?className: "playground-project-overview-sidebar-progress-card"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /ariaLabel: "Project progress grouping"[\s\S]*?\{ value: "assignees", label: "Assignees" \}[\s\S]*?\{ value: "labels", label: "Labels" \}[\s\S]*?fullWidth: true/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /playground-project-overview-sidebar-progress-switch/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /playground-project-overview-sidebar-progress-title/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewSidebarProgressAnalytics\(\)[\s\S]*?return \{\s*title: "Progress"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewSidebarProgressGroups\(view\)[\s\S]*?\.sort\([\s\S]*?\)\s*\.slice\(0, 3\);/,
);
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
assert.match(PROJECT_OVERVIEW_SCRIPT, /toolbarTitle: "All Resources",\s*showViewToggle: false/);
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
  /React\.createElement\(ProjectSummaryDetails, \{[\s\S]*?renderProjectOverviewLatestUpdateSection\(\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewCreationUpdate\(projectRecord = projectOverviewDraft \|\| selectedProject\)[\s\S]*?resolveProjectOverviewUpdateAuthorIdentity\(\{[\s\S]*?body: authorIdentity\.name \+ " created this project\."[\s\S]*?authorAvatarUrl: authorIdentity\.avatarUrl[\s\S]*?kind: "project_created"[\s\S]*?isSynthetic: false/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewLatestUpdateInfo\(\) \{\s*return getProjectOverviewUpdateRecords\(\)\[0\]\s*\|\| getProjectOverviewCreationUpdate\(\)\s*\|\| null;/,
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
assert.match(
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
  /async function postProjectOverviewUpdate\(event\)[\s\S]*?\/projects\/" \+ encodeURIComponent\(projectId\) \+ "\/updates"[\s\S]*?method: "POST"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewUpdateActivityEvents\(\)[\s\S]*?eventType: "project_update_posted"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /isStrategyTab[\s\S]*?renderProjectOverviewDescriptionEditor\(projectOverviewSectionTabs\)/,
);
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
  /document\.getElementById\("playground-ticket-breadcrumb-actions-root"\)[\s\S]*?createPortal\([\s\S]*?React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal",[\s\S]*?React\.createElement\(Ellipsis, \{ width: 16,/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /React\.createElement\("div", \{ className: "playground-tasks-detail-fact is-assignee" \},/,
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /popoverId: "schedule"[\s\S]*?className: "playground-tasks-detail-fact is-assignee"[\s\S]*?popoverId: "assignee"/,
);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /popoverId: "color"/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /popoverId: "environment"/);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-ticket-detail-sidebar \.playground-tasks-detail-fact\.is-assignee\s*\{\s*margin-top: 12px;\s*padding-top: 12px;\s*border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/,
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
  /extraActions: taskView === "backlog" \|\| taskView === "board"\s*\? renderProjectAppHeaderMilestoneSelector\(\)\s*: null/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformInstructionsEditor, \{\s*value: resolveTaskDescriptionAttachmentFiles\(\s*String\(draftTask\.description \|\| ""\),\s*draftTask\.attachments\s*\),[\s\S]*?historyKey: "ticket-description:" \+ draftTask\.id,\s*variant: "minimalistic-ui",\s*contentVariant: "file-enabled",\s*fileUpload: \{\s*upload: uploadTaskDescriptionFiles/,
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
  /function handleIssueComposerDescriptionEditorChange\(nextValue, context = \{\}\)/,
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
  /function renderProjectIssueComposerDialog\(\)[\s\S]*?const issueComposerTitle = normalizedIssueType === "subtask" \? "Create Subtask" : "Create Issue";[\s\S]*?return React\.createElement\(PlatformModal, \{\s*open: issueComposerOpen,\s*visible: issueComposerVisible,\s*closing: issueComposerClosing,[\s\S]*?size: "medium",\s*maxHeight: "80vh",\s*title: issueComposerTitle,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderTaskDeleteDialog\(\),\s*renderMissionControlStudio\(\),\s*renderProjectIssueComposerDialog\(\),\s*renderProjectComposerDialog\(\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /title: issueComposerTitle,\s*headerVariant: "search",\s*headerSearchProps: \{\s*icon: Bookmark,\s*value: issueComposerDraft\.title \|\| "",[\s\S]*?onChange: \(event\) => updateIssueComposerField\("title", event\.target\.value\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /onKeyDown: \(event\) => \{[\s\S]*?event\.key !== "Tab"[\s\S]*?issueComposerDescriptionTextareaRef\.current[\s\S]*?descriptionTextarea\.focus\(\{ preventScroll: true \}\)/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderIssueComposerDescriptionField\(\) \{\s*return React\.createElement\(PlatformInstructionsEditor, \{\s*value: resolveTaskDescriptionAttachmentFiles\(\s*issueComposerDraft\.description \|\| "",\s*issueComposerDraft\.attachments\s*\),[\s\S]*?title: "Description",[\s\S]*?editorRef: issueComposerDescriptionTextareaRef,[\s\S]*?variant: "minimalistic-ui",\s*contentVariant: "file-enabled",\s*fileUpload: \{\s*upload: uploadIssueComposerDescriptionFiles/,
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
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderIssueComposerDetailFact\("Computer",[\s\S]*?popoverId: "computer",[\s\S]*?options: availableBacklogEnvironments\.map/,
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
  /function renderBacklogTaskRow\([\s\S]*?React\.createElement\(PlatformTicketItem, \{\s*variant: "list"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderBoardCard\(task\)[\s\S]*?React\.createElement\(PlatformTicketItem, \{[\s\S]*?variant: "card"/,
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
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const normalizedDraft = normalizePlaygroundTaskRecord\(syncPlaygroundTaskRecordMetadata\([\s\S]*?return \{\s*\.\.\.normalizedDraft,\s*title: "",\s*taskType: requestedTaskType,\s*parentTaskId: requestedTaskType === "subtask" \? requestedParentTaskId : null,\s*\};/,
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
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function renderTaskWorkActionControl\(\) \{[\s\S]*?const mainActionKind = !hasStartedThread[\s\S]*?\? "start"[\s\S]*?\? "review"[\s\S]*?: "rerun";[\s\S]*?mainActionKind === "start"[\s\S]*?\? "Start Work"[\s\S]*?\? "Start Review"[\s\S]*?: "Rerun Thread";/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformButtonSelector, \{[\s\S]*?mode: "split-action",[\s\S]*?buttonVariant: "primary",[\s\S]*?popupVariant: "minimal",[\s\S]*?matchTriggerWidth: true,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /const popupActionLabel = !hasStartedThread[\s\S]*?\? "Run Review"[\s\S]*?\? "Rerun Thread"[\s\S]*?: "Start Review";[\s\S]*?disabled: popupActionDisabled,/,
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
  PROJECTS_CORE_CSS,
  /\.playground-tasks-detail-type-badge\s*\{\s*width: 18px;[\s\S]*?\.playground-tasks-detail-type-badge\.is-loop\s*\{\s*background:/,
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
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewDescriptionEditor\(headerContent = null\)[\s\S]*?title: headerContent[\s\S]*?placeholder: "Add project strategy"[\s\S]*?ariaLabel: "Project strategy"[\s\S]*?historyKey: "project-strategy:" \+ selectedProject\.id[\s\S]*?variant: "minimalistic-ui"[\s\S]*?stickyHeader: true[\s\S]*?className: "playground-project-overview-description-editor"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /isActivityTab\s*\?\s*React\.createElement\([\s\S]*?"playground-project-overview-activity-header"[\s\S]*?projectOverviewSectionTabs[\s\S]*?: isStrategyTab\s*\?\s*renderProjectOverviewDescriptionEditor\(projectOverviewSectionTabs\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewWorkGraphPanel\(\)[\s\S]*?label: "Tasks"[\s\S]*?label: "Relations"[\s\S]*?label: "Active runs"[\s\S]*?label: "Resources"/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /Project execution graph|Track structural dependencies and every durable agent attempt|Relationships|Agent execution/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /No task relationships yet|No agent runs yet/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /relationRows|sessionRows|missionControlDeliveryStageId/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const activeSessionStates = new Set\(\["queued", "active", "awaiting_input"\]\)[\s\S]*?const resourceCount = Array\.isArray\(projectOverviewAllResourceRows\)[\s\S]*?label: "Active runs"[\s\S]*?label: "Resources"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewSummaryHeader\(\)[\s\S]*?React\.createElement\(ProjectSummary, \{[\s\S]*?renderProjectOverviewWorkGraphPanel\(\),\s*React\.createElement\(ProjectSummaryDetails, \{/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-work-graph\s*\{[\s\S]*?\.playground-project-overview-work-graph-metrics\s*\{[\s\S]*?@media \(max-width: 760px\)[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/,
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
  /function renderProjectOverviewGeneralPanel\(\)[\s\S]*?return React\.createElement\("div", \{ className: "playground-project-overview-general-grid" \},\s*renderProjectOverviewActivitySection\(\),\s*renderProjectOverviewSetupSection\(\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function getProjectOverviewMilestoneRecords\(\)[\s\S]*?normalizePlaygroundTaskReleaseRecord\(release\)[\s\S]*?compareTaskReleaseOrder/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewMilestonesPanel\(\)[\s\S]*?React\.createElement\(ProjectMilestonesOverviewPage, \{[\s\S]*?openReleaseComposer\(\)[\s\S]*?openReleaseComposerForEdit\(row\.source\)/,
);
assert.match(
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
  PROJECT_OVERVIEW_SCRIPT,
  /projectOverviewHomeTab === "rules" \|\| projectOverviewHomeTab === "strategy"[\s\S]*?\? "general"/,
);
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
  /\.platform-project-summary__input\s*\{[\s\S]*?overflow: hidden;[\s\S]*?background: transparent;[\s\S]*?font-size: 14px;/,
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary__input\s*\{[^}]*max-height:\s*72px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.platform-project-summary__title\s*\{[\s\S]*?margin: 12px 0 0;/,
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
  /const studioElement = React\.createElement\(PlatformModal, \{\s*open: missionControlSetupOpen && projectComposerOpen && !missionControlSetupClosing,/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /size: "large",\s*title: "Mission Control",\s*className: "playground-mission-control-modal"/,
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
  /projectOverviewTaskActivitySelectedId,[\s\S]*?setProjectOverviewTaskActivitySelectedId,[\s\S]*?useState\(""\);[\s\S]*?const \[projectOverviewTaskActivityFilterMode, setProjectOverviewTaskActivityFilterMode\] = useState\("all"\);[\s\S]*?projectOverviewTaskActivityFilterPopupRef = useRef\(null\);[\s\S]*?projectOverviewTaskActivityFilterSurfaceRef = useRef\(null\);[\s\S]*?projectOverviewTaskActivityToolbarPopover !== "filter"[\s\S]*?setProjectOverviewTaskActivityToolbarPopover\(""\)/,
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
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /"All Projects"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "Sort projects"/);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function getProjectCardCreatorName\(project\)[\s\S]*?className: "playground-tasks-project-card-creator"/,
  "Project overview cards must resolve and render their creator.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /function getProjectCardCreatorName\(project\)[\s\S]*?const normalizedCreatorEmail = creatorEmail \|\| \(creatorName\.includes\("@"\)[\s\S]*?formatAccountDisplayName\(/,
  "Project overview cards must normalize creator identities into display names instead of emails.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-project-card-hero",\s*style: \{ "--project-icon-color": projectAccent \}/,
  "Project overview cards must use the saved project accent for their icon treatment.",
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /React\.createElement\(PlatformPopup, \{[\s\S]{0,500}?variant: "minimal",[\s\S]{0,160}?portal: true,[\s\S]{0,160}?placement: "bottom-end"/,
  "Project card action menus must use the portaled centralized minimal popup.",
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /closest\("\.playground-tasks-project-card-actions, \.playground-tasks-project-card-menu"\)/,
  "Project card outside-click handling must preserve interactions inside the portaled action menu.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-project-card-menu"[\s\S]{0,1800}?(?:Change icon, title, and description\.|Remove this project and its planning scope\.|playground-tasks-detail-menu-item-danger)/,
  "Project card action menus must use concise single-line items with standard white styling.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-project-card-(?:kicker|metrics)"/,
  "Project overview cards must not render the legacy kicker or metrics.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-overview-surface\.is-card-grid \.playground-tasks-project-grid\s*\{[\s\S]*?grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/,
  "Project overview cards must use the four-column wide layout.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-overview-surface\.is-card-grid \.playground-tasks-project-card-body\s*\{[\s\S]*?background: #242426;/,
  "Project overview cards must separate their visual and content surfaces.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-overview-surface\.is-card-grid \.playground-tasks-project-card-hero\s*\{[\s\S]*?background: color-mix\(in srgb, var\(--project-icon-color\) 18%, transparent\);/,
  "Project overview cards must render the saved project accent across the upper surface.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-overview-surface\.is-card-grid \.playground-tasks-project-card\s*\{[\s\S]*?border-radius: 10px;/,
  "Project overview cards must use the compact ten-pixel corner radius.",
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-projects-overview-surface\.is-card-grid \.playground-tasks-project-card::before\s*\{[\s\S]*?content: none;[\s\S]*?display: none;/,
  "Project overview cards must not render a decorative outline.",
);
assert.doesNotMatch(
  PROJECTS_CORE_CSS,
  /\.playground-projects-overview-surface\.is-card-grid \.playground-tasks-project-card:(?:hover|focus-visible|focus-within)[\s\S]{0,260}?transform:\s*translateY/,
  "Project overview cards must remain stationary on hover and focus.",
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
  /React\.createElement\(PlatformPopup, \{\s*open: taskDetailPopover === "menu",[\s\S]*?variant: "minimal",[\s\S]*?placement: "bottom-end"/,
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
  /\.playground-project-workspace-inner\.is-backlog-work-view\s*\{\s*width: min\(100%, var\(--playground-thread-content-max-width\)\);\s*max-width: var\(--playground-thread-content-max-width\);/,
);
assert.match(
  PROJECTS_CORE_CSS,
  /\.playground-project-workspace-inner\.is-board-work-view\s*\{\s*width: min\(100%, var\(--playground-centered-page-max-width\)\);\s*max-width: var\(--playground-centered-page-max-width\);/,
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
  /const activeProjectWorkspaceView = tasksHeaderState\.view === "board"[\s\S]*?: activeProjectSectionId === "resources"\s*\? "resources"[\s\S]*?const activeProjectView = activeProjectWorkspaceView === "board"\s*\? "backlog"/,
);
assert.match(
  platformEntrySource,
  /const activeProjectSectionId = String\(tasksHeaderState\.sectionId \|\| ""\)\.trim\(\)\.toLowerCase\(\);[\s\S]*?const isProjectMilestonesView = Boolean\([\s\S]*?activeProjectSectionId === "milestones"/,
);
assert.match(
  platformEntrySource,
  /options: \[\s*\{ value: "overview", label: "General" \},\s*\{ value: "backlog", label: "Backlog" \},\s*\{ value: "resources", label: "Resources" \},\s*\]/,
);
assert.match(
  platformEntrySource,
  /view: nextView === "resources" \? "overview" : nextView,\s*sectionId: nextView === "resources" \? "resources" : "general"/,
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
  /import \{ PlatformFileExplorerBrowserModal, PlatformFileExplorerModal \} from "\/dist\/platform-ui\/components\/composite\/file-explorer\/index\.js";/,
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
  /const projectBreadcrumbTrailing = isProjectDetailView[\s\S]*?React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal",\s*portal: true,\s*placement: "bottom-start"[\s\S]*?"Project ID"[\s\S]*?\{ id: "general", label: "Home", Icon: House \}[\s\S]*?\{ id: "resources", label: "Resources", Icon: FolderOpen \}[\s\S]*?\{ id: "permissions", label: "Settings", Icon: Settings2 \}[\s\S]*?"Delete Project"/,
);
assert.match(
  platformEntrySource,
  /label: activeTicketNumber,[\s\S]*?trailing: React\.createElement\("span", \{\s*id: "playground-ticket-breadcrumb-actions-root"/,
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
  /projectNavTaskRequest: tasksProjectTaskRequest/,
);
assert.match(
  platformEntrySource,
  /projectNavDeleteRequest: tasksProjectDeleteRequest/,
);
assert.match(
  platformEntrySource,
  /label: projectTitle,\s*leading: projectBreadcrumbLeading,\s*trailing: projectBreadcrumbTrailing,\s*onClick: \(\) => setTasksProjectViewRequest/,
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
