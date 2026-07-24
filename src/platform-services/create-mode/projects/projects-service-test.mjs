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
    expectedSha256: "ee7d9188db311a37dbf236940b2896d17fa884bdbf66ab42f991141ed8c827e8",
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
    expectedSha256: "36dcf559c817c6861331cfd4f22918038167a103ee3eed7ce758d712df5374c7",
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
    expectedSha256: "a38831887d9ee70614da8e252367247077e15c94af1397eb0c208cdf887f5d1c",
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
    expectedSha256: "8240118e9fb7d54f8b872a90979df7439d084943480727f6fd374cc112a00cbc",
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
    expectedSha256: "61eaa1eacdabf992c8a7b2a857bca51164e7d7a8822ac83afe5c0bab81297441",
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
    expectedSha256: "70a6e02067a0d3d53e2198b71e67882da75a0e4274213443cb35740de4c7d073",
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
    expectedSha256: "e2cc2a0f3956e32b1cc8634fc219373584a3ce88132fa29b72ccf3e1ffb52767",
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
    expectedSha256: "7863f347df75d02d4aa28482f7cfbccbf5993593017f619f5dbab865909c678f",
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
  /const ownerUserId = String\([\s\S]*?project\.ownerUserId[\s\S]*?project\.userId/,
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function normalizePlaygroundTaskThreadStatusSnapshot/,
);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function getPlaygroundTaskThreadSummaryRecords/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function mergePlaygroundTaskThreadStatusSnapshots/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /buildPlaygroundProjectLinkedFilePathIndex/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /createPlaygroundProjectTeamRolePermissionSet/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function PlaygroundTasksPage/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderProjectOverviewView/);
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
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[taskActivitySubscriptionState, setTaskActivitySubscriptionState\] = useState/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[projectOverviewOwnerCandidatesState, setProjectOverviewOwnerCandidatesState\] = useState/,
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
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function buildProjectOverviewActivityTasks\(items = buildProjectOverviewActivityItems\(\)\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /tabs: \[\s*\{ id: "activity", label: "Activity" \},\s*\{ id: "backlog", label: "Backlog" \},\s*\]/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /value: isActivityTab \? "activity" : "backlog"[\s\S]*?variant: "minimal"/,
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
  PROJECT_OVERVIEW_SCRIPT,
  /backlogTasks\.map\(\(task\) => renderOverviewTaskRow\(task\)\)/,
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
  /isLegacyProjectTaskActivityRoute\(activityResult\)[\s\S]*?void loadLegacyProjectOverviewTaskActivity\(projectId, nextTasks, loadToken\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-activity-list is-ticket-preview-list"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",[\s\S]*?setTaskView\("backlog"\);[\s\S]*?\}, "View All"\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /playground-project-overview-activity-show-more/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /typeof openProjectTaskDetailScreen === "function"/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /renderProjectOverviewActivityParticipants\(activityItems\)/,
);
assert.match(
  PROJECTS_PAGE_SHELL_SCRIPT,
  /const \[projectOverviewActivityTab, setProjectOverviewActivityTab\] = useState\("activity"\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /new URL\(backendUrl \+ "\/tasks\/activity", window\.location\.origin\)[\s\S]*?searchParams\.set\("projectId", projectId\)[\s\S]*?searchParams\.set\("limit", "5"\)/,
);
assert.match(
  PROJECTS_PAGE_DATA_SCRIPT,
  /normalizedEvent\.eventType === "comment_added"[\s\S]*?normalizedEvent\.eventType === "field_changed" && fieldName === "description"/,
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
  /React\.createElement\(PlatformPrimaryButton, \{[\s\S]*?className: "playground-project-overview-sidebar-mission-button"[\s\S]*?"Mission Control"\)/,
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
  /ariaLabel: "Project progress grouping"[\s\S]*?\{ value: "assignees", label: "Assignees" \}[\s\S]*?\{ value: "labels", label: "Labels" \}/,
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
      /renderProjectOverviewSidebarSelectControl\(\s*"(?:priority|type|computer|owner)"/g,
    ) || []
  ).length,
  4,
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
  /hasMoreProjectThreads\s*\? React\.createElement\("div", \{ className: "playground-project-overview-threads-load-more"/,
);
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
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-strategy-tab \.platform-instructions-editor\s*\{\s*background: rgba\(255, 255, 255, 0\.075\);\s*border-radius: 15px;\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const linkedTicketCompletionPercent = progressInfo\.tasks\.length > 0\s*\? Math\.round\(\(progressInfo\.doneTasks\.length \/ progressInfo\.tasks\.length\) \* 100\)\s*: 0;/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const linkedTicketVisualPercent = linkedTicketCompletionPercent === 0\s*\? 2\s*: linkedTicketCompletionPercent;/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const linkedLabel = linkedMilestoneLabel/);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-outcome-preview-progress\s*\{\s*width: 100px;\s*height: 4px;\s*flex: 0 0 100px;\s*overflow: hidden;\s*border-radius: 2px;\s*background: rgba\(255, 255, 255, 0\.1\);/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-outcome-preview-progress-fill\s*\{\s*display: block;\s*height: 100%;\s*border-radius: inherit;\s*background: #fff;/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /const content = React\.createElement\(PlatformModal, \{\s*open: Boolean\(projectOverviewOutcomeEditorState\) && !projectOverviewOutcomeEditorClosing,[\s\S]*?size: "medium",[\s\S]*?title: "Edit Outcome",\s*headerVariant: "search",\s*headerSearchProps: \{\s*icon: Award,[\s\S]*?value: draft\.title,[\s\S]*?onChange: \(event\) => updateProjectOverviewOutcomeEditorDraft\(\{ title: event\.target\.value \}\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /playground-project-overview-outcome-title-field/,
);
assert.equal(
  (
    PROJECTS_PAGE_ACTIONS_SCRIPT.match(/React\.createElement\(PlatformInstructionsEditor, \{/g) ||
    []
  ).length,
  2,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Description",[\s\S]*?onChange: \(nextValue\) => updateProjectOverviewOutcomeEditorDraft\(\{ description: nextValue \}\)/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Success criteria",[\s\S]*?onChange: \(nextValue\) => updateProjectOverviewOutcomeEditorDraft\(\{ successCriteriaInput: nextValue \}\)/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /function renderProjectOverviewOutcomeMarkdownEditor/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /React\.createElement\(Trash2, \{ width: 14, height: 14, strokeWidth: 1\.8, "aria-hidden": "true" \}\),\s*React\.createElement\("span", null, "Delete"\)/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-outcome-milestone-field > \.playground-tasks-detail-section-header\s*\{\s*margin-bottom: 12px;/,
);
assert.match(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /footer: React\.createElement\(React\.Fragment, null,[\s\S]*?React\.createElement\(PlatformSecondaryButton,[\s\S]*?React\.createElement\(PlatformPrimaryButton/,
);
assert.doesNotMatch(
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  /className: "playground-tasks-project-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /function renderProjectOverviewOutcomeEditorModal\(\) \{\s*return renderSharedProjectOverviewOutcomeEditorModal\(\{/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformPopup, \{\s*open: isActionMenuOpen,\s*variant: "minimal",\s*portal: true,\s*placement: "bottom-end"/,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "Rename"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "View Details"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "Delete"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /async function saveProjectOverviewOutcomeRename\(\)/);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(X, \{ width: 13, height: 13, strokeWidth: 1\.9 \}\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(Check, \{ width: 13, height: 13, strokeWidth: 2 \}\)/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-overview-add-outcome-button"[\s\S]*?React\.createElement\("span", null, "Outcome"\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const strategyKpis =/);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-progress-combo-metrics"/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-strategy-progress-card\.playground-project-overview-progress-combo-card\s*\{\s*min-height: 0;\s*margin-bottom: 24px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-strategy-tab \.playground-project-overview-progress-combo-card\s*\{\s*padding: 0;\s*border-radius: 0;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-strategy-tab \.playground-project-overview-progress-combo-card::before\s*\{\s*content: none;\s*display: none;/,
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
  /canRequestTaskChanges[\s\S]*?onClick: activateTaskReviewCommentMode[\s\S]*?canHumanReviewTask[\s\S]*?handleApproveTaskReview/,
);
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
  /function renderProjectOverviewDescriptionEditor\(\)[\s\S]*?title: selectedProject\.name \|\| "Untitled Project"[\s\S]*?placeholder: "Add project description"[\s\S]*?ariaLabel: "Project description"[\s\S]*?historyKey: "project-description:" \+ selectedProject\.id[\s\S]*?variant: "minimalistic-ui"[\s\S]*?collapsedLines: 10[\s\S]*?className: "playground-project-overview-description-editor"/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /header: activeProjectOverviewHomeTab === "general"\s*\?\s*renderProjectOverviewDescriptionEditor\(\)\s*:\s*null/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /const projectSectionLinks = \[[\s\S]*?\{ id: "general", label: "Home", Icon: House \}[\s\S]*?\{ id: "resources", label: "Resources", Icon: FolderOpen \}[\s\S]*?\{ id: "strategy", label: "Strategy", Icon: Rocket \}[\s\S]*?canViewProjectSettings[\s\S]*?\{ id: "permissions", label: "Settings", Icon: Settings2 \}/,
);
assert.match(
  PROJECT_OVERVIEW_SCRIPT,
  /className: "playground-project-overview-sidebar-navigation"[\s\S]*?"aria-label": "Project sections"[\s\S]*?handleProjectOverviewHomeTabChange\(item\.id\)/,
);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /sidebarToggle: React\.createElement/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Strategy Notes"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /"Strategy Notes"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /historyKey: "full-strategy:" \+ selectedProject\.id/);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-detail-header \.playground-project-overview-description-editor\s*\{\s*width: 100%;[\s\S]*?margin: 0;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-detail-header[\s\S]*?\.playground-project-overview-description-editor[\s\S]*?\.platform-instructions-editor__title\s*\{\s*flex: 1 1 auto;\s*font-size: 18px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-detail-header[\s\S]*?\.playground-project-overview-description-editor\.platform-instructions-editor\.is-minimalistic-ui[\s\S]*?\.platform-instructions-editor__prosemirror\s*\{\s*padding-top: 12px;/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-sidebar\s*\{[\s\S]*?position: sticky;\s*top: var\(--project-detail-sticky-offset, 0px\);/,
);
assert.match(
  PROJECT_OVERVIEW_CSS,
  /\.playground-project-overview-sidebar-navigation-link\.is-active\s*\{\s*color: #fff;\s*background: rgba\(255, 255, 255, 0\.075\);/,
);
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
  /function renderProjectAppHeaderMilestoneSelector\(\) \{\s*const isBoardMilestoneSelector = taskView === "board";\s*return React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?label: "Milestones"[\s\S]*?popupVariant: "minimal"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-backlog-header is-backlog-list-header"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?React\.createElement\(PlatformSearch, \{\s*className: "playground-tasks-backlog-central-search"/,
);
assert.match(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /className: "playground-tasks-backlog-header is-board-list-header"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?React\.createElement\(PlatformSearch, \{\s*className: "playground-tasks-board-central-search"/,
);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-backlog-sort-shell/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /openScopedBoardTaskCount/);
assert.doesNotMatch(
  PROJECTS_PAGE_VIEWS_SCRIPT,
  /renderProjectTaskHeaderSearchControl|renderProjectReleasePickerControl|renderProjectWorkspaceActionButtons/,
);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformModal, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "New Project"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /"All Projects"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "Sort projects"/);
assert.match(PROJECTS_STYLES, /playground-project-overview/);
assert.match(PROJECTS_STYLE_FRAGMENTS.core, /playground-tasks-page/);
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
  /\.playground-database-description-section\.playground-agents-detail-instructions-section\s*\{\s*margin-top: 0;\s*margin-bottom: 0;\s*padding-bottom: 3px !important;/,
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
  /if \(!selectedTaskId \|\| \(taskView !== "overview" && taskView !== "backlog" && taskView !== "board"\)\) \{\s*setProjectTaskDetailScreenOpen\(false\);/,
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

const platformEntrySource = await readPlatformCompositionSource();
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
  /label: projectTitle,\s*onClick: \(\) => setTasksProjectViewRequest/,
);
assert.match(
  platformEntrySource,
  /\(activeProjectView === "backlog" \|\| activeProjectView === "board"\) && !isProjectTaskDetailView\s*\? tasksHeaderState\.extraActions \|\| null/,
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
  hasAiosSession: (req) => !String(req?.url || "").includes("/start-thread"),
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

result = dispatch("GET", "/api/real/tasks/task_1/activity-subscription");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/task_1/activity-subscription");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("PUT", "/api/real/tasks/task_1/activity-subscription");
assert.equal(result.handled, true);
await Promise.resolve();
assert.equal(calls[0].adapter, "cloud");
assert.equal(calls[0].args[1], "/tasks/task_1/activity-subscription");

result = dispatch("POST", "/api/real/tasks/task_1/start-thread");
assert.equal(result.handled, true);
await Promise.resolve();
assert.equal(calls[0].adapter, "send");
assert.equal(calls[0].args[1], 401);

result = dispatch("GET", "/api/task-backlog/project_1/threads/taskbacklog_test/context");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "send");
assert.equal(result.call.args[1], 200);

result = dispatch("GET", "/api/real/agents");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

const upstreamResponses = new Map([
  [
    "/projects/project_1",
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
          { id: "server_2", projectId: "project_2" },
        ],
      },
    },
  ],
  [
    "/metronomes?projectId=project_1",
    {
      status: 200,
      data: { metronomes: [{ id: "metronome_1", metadata: { projectId: "project_1" } }] },
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
  ["server_1"],
);
assert.deepEqual(
  response.data.metronomes.map((metronome) => metronome.id),
  ["metronome_1"],
);
assert.deepEqual(
  response.data.imagineResources.map((resource) => resource.id),
  ["file_1"],
);

console.log("Projects service module and route contracts passed.");
