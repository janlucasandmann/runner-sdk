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
import {
  PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS,
} from "./client/domain-runtime.mjs";
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
import {
  PROJECTS_CORE_CSS,
  PROJECTS_CORE_CSS_FRAGMENT_PATHS,
} from "./client/styles/core.mjs";
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
    expectedSha256: "7df9de5f6c7a247fd06fd2126c4bbc79d4cb056976a1bce79d3aae653ef6c397",
    fragmentGroups: [{
      baseUrl: projectsClientUrl,
      paths: PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview runtime",
    source: PROJECT_OVERVIEW_SCRIPT,
    expectedSha256: "48cd081ce23f8575cd8d1abb5d34291bf5010169ffd00801993c3f3f9350e21e",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview styles",
    source: PROJECT_OVERVIEW_CSS,
    expectedSha256: "bd12e0a49190e62c399bde10e21878acfa89e06b81a215719fff709dc17cbe0d",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects actions runtime",
    source: PROJECTS_PAGE_ACTIONS_SCRIPT,
    expectedSha256: "5c81905fb799a865384078fc47957f33a1431ffcee25c6efbd947b437c3e6ac9",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects data runtime",
    source: PROJECTS_PAGE_DATA_SCRIPT,
    expectedSha256: "ea950411a706140c017628d075c4a824012ac65e13b6b8f45a564d8533e2515e",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_DATA_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects shell runtime",
    source: PROJECTS_PAGE_SHELL_SCRIPT,
    expectedSha256: "c70c4aa6317133c022b42ad31ed9ab1426f26ff5c46ed5c6f350a1f224f430a6",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects views runtime",
    source: PROJECTS_PAGE_VIEWS_SCRIPT,
    expectedSha256: "496805a6c1a5cf6a9ffaf092fa27e2ee3f71496c288adefab562cb767062d8a8",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects core styles",
    source: PROJECTS_CORE_CSS,
    expectedSha256: "6919cde10130d84913bb1475c41f5671f470cb3c1baeae4dd4bf0cc9bd8c002f",
    fragmentGroups: [{
      baseUrl: projectsStylesUrl,
      paths: PROJECTS_CORE_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
]);

assert.match(PROJECTS_DOMAIN_FOUNDATION_SCRIPT, /PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID/);
assert.match(PROJECTS_DOMAIN_FOUNDATION_SCRIPT, /\{ id: "overview", label: "General", icon: LayoutDashboard \}/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /normalizePlaygroundProjectRecord/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function normalizePlaygroundTaskThreadStatusSnapshot/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function getPlaygroundTaskThreadSummaryRecords/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function mergePlaygroundTaskThreadStatusSnapshots/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /buildPlaygroundProjectLinkedFilePathIndex/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /createPlaygroundProjectTeamRolePermissionSet/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function PlaygroundTasksPage/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderProjectOverviewView/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderTaskDetailSelectControl\([\s\S]*?return React\.createElement\(PlatformSelector, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /popupHeader: taskDetailAvailableAssigneePopupModes\.length > 1[\s\S]*?React\.createElement\(PlatformSwitch/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /popoverId: "schedule"[\s\S]*?popupContent: renderTaskScheduleDialog\(\{ embedded: true \}\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /popupAriaLabel: "Edit ticket schedule"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderTaskDetailSelectOptionRow/);
assert.doesNotMatch(PROJECTS_PAGE_DATA_SCRIPT, /handleTaskDetailSelectPopoverPointerDown/);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /taskDetailSelectPopoverRef/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-detail-fact-control \.playground-tasks-detail-central-selector\s*\{\s*width: 100%;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-schedule-type-switch\.platform-switch\s*\{\s*width: 100%;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-project-workspace-inner\.playground-tasks-ticket-screen-inner\s*\{[^}]*max-width: var\(--platform-page-content-max-width, 87\.5rem\);/);
assert.doesNotMatch(PROJECTS_CORE_CSS, /\.playground-project-workspace-inner\.playground-tasks-ticket-screen-inner\s*\{[^}]*max-width: none;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-overview\s*\{\s*padding-top: 0 !important;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-overview \.playground-project-overview-summary-title\s*\{\s*margin-top: 42px;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-general-grid\s*\{\s*display: grid;\s*grid-template-columns: minmax\(0, 1fr\);\s*gap: 42px;/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /tabBarActions: activeProjectOverviewHomeTab === "general"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-settings-add-rule-button"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-teams-add-button"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformPopup, \{\s*open: isAddTeamsMenuOpen,\s*variant: "minimal",\s*portal: true,\s*placement: "bottom-end"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /isAllAgentsTeam\s*\? React\.createElement\(PlatformPermissionsPage, \{\s*permissionSet: projectPermissionSet/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderPlaygroundPermissionsPage/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /ariaLabel: "Project team access",\s*className: "playground-project-access-platform-data-table",\s*variant: "minimalistic-ui"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /toolbar: \{\s*title: "Manage Project Access"/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-plugins-list\s*\{[\s\S]*?border-top: 0;/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /function buildProjectOverviewActivityTasks\(items = buildProjectOverviewActivityItems\(\)\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /activityTasks\.map\(\(task\) => renderOverviewTaskRow\(task\)\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /className: "playground-project-overview-activity-list is-ticket-preview-list"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",[\s\S]*?setTaskView\("backlog"\);[\s\S]*?\}, "View All"\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /playground-project-overview-activity-show-more/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /typeof openProjectTaskDetailScreen === "function"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewActivityParticipants\(activityItems\)/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-activity-card\.is-main \.playground-project-overview-activity-list\s*\{\s*gap: 8px;/);
assert.equal((PROJECT_OVERVIEW_SCRIPT.match(/React\.createElement\(PlatformUiCard, \{/g) || []).length, 3);
assert.match(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Properties"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Resources"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Milestones"/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-sidebar-card\s*\{\s*overflow: visible;\s*\}/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /return React\.createElement\(PlatformSelector, \{/);
assert.equal(
  (PROJECT_OVERVIEW_SCRIPT.match(/renderProjectOverviewSidebarSelectControl\("(?:priority|lead|type|computer)"/g) || []).length,
  4,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /popupClassName: "playground-project-overview-sidebar-selector-popup"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewSidebarSelectOption/);
assert.doesNotMatch(PROJECT_OVERVIEW_CSS, /playground-project-overview-sidebar-select-(?:shell|menu|option)/);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /handleProjectOverviewSidebarPropertyPointerDown/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /headerActions: React\.createElement\(PlatformSecondaryButton/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /ariaLabel: "Project threads",\s*variant: "minimalistic-ui"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /useCentralSearch: true,\s*useCentralNewSelector: true,\s*useCentralFilterPopup: true/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /viewMode: "list"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /toolbarTitle: "All Resources",\s*showViewToggle: false/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /renderNewMenuItems: renderProjectOverviewResourceNewMenuItems/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /hasMoreProjectThreads\s*\? React\.createElement\("div", \{ className: "playground-project-overview-threads-load-more"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /trailing: React\.createElement\(PlatformSecondaryButton/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /function renderProjectOverviewRecommendedTemplatesEmptyState\(\) \{\s*return React\.createElement\("div", \{ className: "playground-project-resources-empty has-templates" \},\s*React\.createElement\("div", \{ className: "playground-project-resource-template-grid" \},\s*projectOverviewRecommendedTemplates\.map\(\(template\) => renderProjectOverviewTemplateCard\(template\)\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Recommended templates"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Start with resources that fit this project type/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-resource-template-browse-button"[\s\S]*?React\.createElement\("span", null, "All Templates"\)/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-resource-template-actions\s*\{\s*display: flex;\s*justify-content: center;\s*margin-top: 12px;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-resource-template-card\s*\{\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);\s*border-radius: 15px;\s*background: rgba\(255, 255, 255, 0\.075\);/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-tab \.platform-instructions-editor\s*\{\s*background: rgba\(255, 255, 255, 0\.075\);\s*border-radius: 15px;\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /const linkedTicketCompletionPercent = progressInfo\.tasks\.length > 0\s*\? Math\.round\(\(progressInfo\.doneTasks\.length \/ progressInfo\.tasks\.length\) \* 100\)\s*: 0;/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /const linkedTicketVisualPercent = linkedTicketCompletionPercent === 0\s*\? 2\s*: linkedTicketCompletionPercent;/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const linkedLabel = linkedMilestoneLabel/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-outcome-preview-progress\s*\{\s*width: 100px;\s*height: 4px;\s*flex: 0 0 100px;\s*overflow: hidden;\s*border-radius: 2px;\s*background: rgba\(255, 255, 255, 0\.1\);/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-outcome-preview-progress-fill\s*\{\s*display: block;\s*height: 100%;\s*border-radius: inherit;\s*background: #fff;/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /const content = React\.createElement\(PlatformModal, \{\s*open: Boolean\(projectOverviewOutcomeEditorState\) && !projectOverviewOutcomeEditorClosing,[\s\S]*?size: "medium",[\s\S]*?title: "Edit Outcome",\s*headerVariant: "search",\s*headerSearchProps: \{\s*icon: Award,[\s\S]*?value: draft\.title,[\s\S]*?onChange: \(event\) => updateProjectOverviewOutcomeEditorDraft\(\{ title: event\.target\.value \}\)/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /playground-project-overview-outcome-title-field/);
assert.equal((PROJECTS_PAGE_ACTIONS_SCRIPT.match(/React\.createElement\(PlatformInstructionsEditor, \{/g) || []).length, 2);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Description",[\s\S]*?onChange: \(nextValue\) => updateProjectOverviewOutcomeEditorDraft\(\{ description: nextValue \}\)/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Success criteria",[\s\S]*?onChange: \(nextValue\) => updateProjectOverviewOutcomeEditorDraft\(\{ successCriteriaInput: nextValue \}\)/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /function renderProjectOverviewOutcomeMarkdownEditor/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /React\.createElement\(Trash2, \{ width: 14, height: 14, strokeWidth: 1\.8, "aria-hidden": "true" \}\),\s*React\.createElement\("span", null, "Delete"\)/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-outcome-milestone-field > \.playground-tasks-detail-section-header\s*\{\s*margin-bottom: 12px;/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /footer: React\.createElement\(React\.Fragment, null,[\s\S]*?React\.createElement\(PlatformSecondaryButton,[\s\S]*?React\.createElement\(PlatformPrimaryButton/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /className: "playground-tasks-project-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /function renderProjectOverviewOutcomeEditorModal\(\) \{\s*return renderSharedProjectOverviewOutcomeEditorModal\(\{/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformPopup, \{\s*open: isActionMenuOpen,\s*variant: "minimal",\s*portal: true,\s*placement: "bottom-end"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "Rename"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "View Details"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "Delete"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /async function saveProjectOverviewOutcomeRename\(\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(X, \{ width: 13, height: 13, strokeWidth: 1\.9 \}\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(Check, \{ width: 13, height: 13, strokeWidth: 2 \}\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-overview-add-outcome-button"[\s\S]*?React\.createElement\("span", null, "Outcome"\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const strategyKpis =/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /className: "playground-project-overview-progress-combo-metrics"/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-progress-card\.playground-project-overview-progress-combo-card\s*\{\s*min-height: 0;\s*margin-bottom: 24px;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-tab \.playground-project-overview-progress-combo-card\s*\{\s*padding: 0;\s*border-radius: 0;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-tab \.playground-project-overview-progress-combo-card::before\s*\{\s*content: none;\s*display: none;/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformLoadingState/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading projects\.\.\."/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading project\.\.\.",\s*centered: true/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-loading-copy" \}, "Loading project/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*value: missionControlDocumentDraft[\s\S]*?historyKey: "full-strategy:" \+ selectedProject\.id/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(TicketDetailPage, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*fullWidth: true,\s*className: "playground-tasks-ticket-control-button"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "playground-tasks-ticket-thread-divider"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "is-neutral",\s*icon: History/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /label: "Restart Thread",\s*icon: RefreshCw/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-detail-thread-meta/);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /"\/tasks\/" \+ encodeURIComponent\(taskId\) \+ "\?threadDetails=summary"/);
assert.match(PROJECTS_PAGE_SHELL_SCRIPT, /"\/threads\/" \+ encodeURIComponent\(threadId\) \+ "\/status"/);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /const normalizedTaskId = String\(draftTask\?\.id[\s\S]{0,2500}\/threads\?limit=240/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(TicketDetailPage, \{\s*header: taskDetailNavbar,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /details: renderTaskDetailFactsSection\(\{ contentOnly: true \}\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /threads: renderTaskDetailThreadsSection\(\{\s*contentOnly: true,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /showHeaderCopy: false,\s*showCloseButton: false,\s*showResizeHandle: false/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /previewTitle: previewedTaskAttachment\?\.filename \|\| "Attachment preview",\s*previewHeaderActions: previewedTaskAttachment && !isTaskConfigLocked\s*\? React\.createElement\(PlatformAttachmentActionMenu, \{[\s\S]*?onRename: \(nextName\) => handleRenameTaskAttachment\(previewedTaskAttachment\.id, nextName\),\s*onDelete: \(\) => handleRemoveTaskAttachment\(previewedTaskAttachment\.id\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /previewPortalTarget: taskAttachmentPreviewPortalTarget,\s*onPreviewClose: \(\) => setPreviewedTaskAttachmentId\(""\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /const isTicketDetailSidebarEffectivelyCollapsed = Boolean\(\s*ticketDetailSidebarCollapsed \|\| \(isFullPageTaskDetail && previewedTaskAttachment\)/);
assert.match(PROJECTS_PAGE_SHELL_SCRIPT, /attachmentPreviewPortalId = ""/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /const taskAttachmentPreviewPortalTarget = isFullPageTaskDetail[\s\S]*?document\.getElementById\(attachmentPreviewPortalId\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /const taskDetailBackDestination = taskView === "board" \? "Board" : "Backlog";/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "playground-files-header-icon-button is-plain playground-tasks-ticket-page-back-link",\s*onClick: handleCloseTaskDetail,\s*title: "Back to " \+ taskDetailBackDestination,\s*"aria-label": "Back to " \+ taskDetailBackDestination/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-page-back-link\s*\{\s*flex: 0 0 auto;\s*color: rgba\(255, 255, 255, 0\.7\);/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-ticket-page-nav-ticket-row/);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /const selectedTaskHeaderTicketNumber = selectedTaskId/);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /ticketNumber: selectedTaskHeaderTicketNumber/);
assert.match(PROJECTS_PAGE_DATA_SCRIPT, /extraActions: taskView === "backlog" \|\| taskView === "board"\s*\? renderProjectAppHeaderMilestoneSelector\(\)\s*: null/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*value: String\(draftTask\.description \|\| ""\),[\s\S]*?historyKey: "ticket-description:" \+ draftTask\.id/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformAttachments, \{\s*className: "playground-tasks-ticket-attachments"/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function handleRenameTaskAttachment\(attachmentId, nextName\)/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /onRename: isRemovable\s*\? \(nextName\) => handleRenameTaskAttachment\(resolvedAttachment\.id, nextName\)/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformFileExplorerBrowserModal, \{\s*open: true,\s*visible: true,\s*portal: false,\s*size: "full",\s*title: "Attach files"/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /sourceGroups,\s*breadcrumbs: \[\{/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /searchQuery: taskEnvironmentFilePickerSearch,\s*onSearchQueryChange: setTaskEnvironmentFilePickerSearch/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformSubtasks, \{\s*className: "playground-tasks-ticket-subtasks",[\s\S]*?onAdd: \(\) => openProjectSubtaskIssueComposer\(draftTask\.id\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderTaskCommentDialog\(\)[\s\S]*?React\.createElement\(PlatformModal, \{[\s\S]*?title: commentSubmission\.isReview \? "Request Changes" : "Add Comment"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderTaskCommentDialog\(\)[\s\S]*?showHeader: false,[\s\S]*?size: "medium"[\s\S]*?React\.createElement\(PlatformInstructionsEditor, \{[\s\S]*?title: commentSubmission\.isReview \? "Request Changes" : "Add Comment"[\s\S]*?variant: "minimalistic-ui"/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /playground-tasks-comment-modal-input|taskCommentTextareaRef/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-tasks-comments-add-button"/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /taskCommentComposerOpen \? renderTaskCommentDock\(\) : null/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /function openProjectSubtaskIssueComposer\(parentTaskId\)[\s\S]*?return openProjectIssueComposer\(\{\s*taskType: "subtask",\s*parentTaskId: parentTask\.id,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderProjectIssueComposerDialog\(\)[\s\S]*?const issueComposerTitle = normalizedIssueType === "subtask" \? "Create Subtask" : "Create Issue";[\s\S]*?return React\.createElement\(PlatformModal, \{\s*open: issueComposerOpen,\s*visible: issueComposerVisible,\s*closing: issueComposerClosing,[\s\S]*?size: "medium",\s*title: issueComposerTitle,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderIssueComposerTitleField\(\)[\s\S]*?className: "playground-environments-input playground-new-issue-modal__title-input"[\s\S]*?renderIssueComposerDetailFact\("Computer", renderIssueComposerComputerSelector\(\)\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /footer: React\.createElement\(React\.Fragment,[\s\S]*?React\.createElement\(PlatformSecondaryButton,[\s\S]*?React\.createElement\(PlatformPrimaryButton,[\s\S]*?renderIssueComposerTitleField\(\),\s*renderIssueComposerDescriptionField\(\),\s*renderIssueComposerDetailsSection\(\)/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /title: issueComposerTitle,\s*headerVariant: "search"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderProjectIssueComposerDialog\(\)[\s\S]*?return renderPlaygroundPlatformModal\(/);
assert.doesNotMatch(PROJECTS_CORE_CSS, /\.playground-new-issue-modal\.platform-modal-surface\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-new-issue-modal__body\.platform-modal-body\s*\{[\s\S]*?display: flex;[\s\S]*?overflow: auto;/);
assert.match(PROJECTS_PAGE_SHELL_SCRIPT, /const normalizedDraft = normalizePlaygroundTaskRecord\(syncPlaygroundTaskRecordMetadata\([\s\S]*?return \{\s*\.\.\.normalizedDraft,\s*title: "",\s*\};/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /function openTaskCommentComposer\(options = \{\}\)[\s\S]*?function activateTaskReviewCommentMode\(\) \{\s*openTaskCommentComposer\(\{ review: true \}\);/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /function handleTaskSurfaceClick\(event\)[\s\S]*?target\.closest\([^\n]*\.platform-modal-backdrop/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /const authorUserId = readPlaygroundTaskCommentIdentityString\(comment, \["authorUserId", "author_user_id", "createdByUserId"/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /const createdAt = typeof comment\.createdAt[\s\S]*?: typeof comment\.updatedAt[\s\S]*?: "";/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /const creatorAgentId = \[[\s\S]*?task\.createdByAgentId[\s\S]*?const creatorUserId = \[[\s\S]*?task\.createdByUserId/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /createdByUserId: creatorUserId,\s*creator,/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /function getTaskCommentDisplayName\(comment\)[\s\S]*?isTaskCommentByCurrentUser\(comment\)[\s\S]*?getTaskCommentWorkspaceMember\(comment\)/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /function renderTaskCommentAvatar\(comment, className\)[\s\S]*?React\.createElement\(AccountAvatar, \{/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /function getTaskCreatorIdentity\(task\)[\s\S]*?function renderTaskCreatorValue\(task\)[\s\S]*?React\.createElement\(AccountAvatar, \{/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /isCurrentUser\s*\? String\(currentUserName \|\| creator\.name \|\| "User"\)/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /metadata: currentUserAvatarUrl\s*\? \{ authorAvatarUrl: currentUserAvatarUrl \}/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /const taskComments = normalizePlaygroundTaskCommentList\(draftTask\.comments\)[\s\S]*?return normalizedRightTimestamp - normalizedLeftTimestamp;/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "playground-tasks-detail-fact-label" \}, "Creator"\)[\s\S]*?renderTaskCreatorValue\(draftTask\)/);
assert.match(PROJECTS_PAGE_SHELL_SCRIPT, /function buildProjectIssueComposerDraft\(options = \{\}\)[\s\S]*?parentTaskId: requestedParentTaskId,[\s\S]*?function openProjectIssueComposer\(options = \{\}\)/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /className: "playground-tasks-skills"/);
assert.doesNotMatch(PROJECTS_VIEWS_04_FRAGMENT, /"Manage Skills"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /onClick: \(\) => handleTaskDescriptionFormat\(action\.id\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /title: "Strategy Notes"[\s\S]*?stickyHeader: false/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /historyKey: "full-strategy:" \+ selectedProject\.id,\s*stickyHeader: false/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /renderMissionControlDocumentToolbarButton/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /const studioElement = React\.createElement\(PlatformModal, \{\s*open: missionControlSetupOpen && projectComposerOpen && !missionControlSetupClosing,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /size: "large",\s*title: "Mission Control",\s*className: "playground-mission-control-modal"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /const studioElement = renderPlaygroundPlatformModal/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "playground-tasks-project-modal playground-mission-control-modal"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformSearch/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformPopup/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(ListFilter/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /variant: "minimal"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /function renderProjectAppHeaderMilestoneSelector\(\) \{\s*const isBoardMilestoneSelector = taskView === "board";\s*return React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?label: "Milestones"[\s\S]*?popupVariant: "minimal"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "playground-tasks-backlog-header is-backlog-list-header"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?React\.createElement\(PlatformSearch, \{\s*className: "playground-tasks-backlog-central-search"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /className: "playground-tasks-backlog-header is-board-list-header"[\s\S]*?React\.createElement\(ListFilter,[\s\S]*?React\.createElement\(PlatformSearch, \{\s*className: "playground-tasks-board-central-search"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-backlog-sort-shell/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /openScopedBoardTaskCount/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /renderProjectTaskHeaderSearchControl|renderProjectReleasePickerControl|renderProjectWorkspaceActionButtons/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformModal, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "New Project"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /"All Projects"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "Sort projects"/);
assert.match(PROJECTS_STYLES, /playground-project-overview/);
assert.match(PROJECTS_STYLE_FRAGMENTS.core, /playground-tasks-page/);
assert.match(PROJECTS_STYLE_FRAGMENTS.connectorBrowser, /playground-tasks-connector-browser-portal/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-frame\s*\{/);
assert.doesNotMatch(PROJECTS_CORE_CSS, /\.playground-ticket-detail-frame\.has-preview\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-page\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-attachment-sidebar-body\s*\{[\s\S]*?padding: 0;\s*overflow: hidden;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-screen-panel\s+\.playground-ticket-detail-content\s+\.playground-environments-detail-scroll\.playground-tasks-detail-scroll\s*\{\s*padding-top: 0 !important;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-content-body\.is-tasks-page\s+\.playground-environments-page\.playground-tasks-ticket-screen:not\(\.playground-agents-page\)\s+\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\s*\{\s*padding-right: 50px !important;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-content\s+\.platform-instructions-editor\.playground-tasks-detail-description\s*\{\s*margin-top: 0;\s*margin-bottom: 0;\s*padding-bottom: 3px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-database-description-section\.playground-agents-detail-instructions-section\s*\{\s*margin-top: 0;\s*margin-bottom: 0;\s*padding-bottom: 3px !important;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-attachments\s*\{\s*margin-top: 12px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-subtasks\s*\{\s*margin-top: 12px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-screen-panel \.playground-tasks-connectors-header,[\s\S]*?padding-bottom: 12px;\s*border-bottom: 1px solid rgba\(255, 255, 255, 0\.1\);/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-screen-panel \.playground-tasks-connectors-header\s*\{\s*margin-bottom: 12px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-screen-panel \.playground-tasks-comments-toolbar\s*\{\s*margin-bottom: 24px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-screen-panel \.playground-tasks-comments-list\s*\{\s*gap: 24px;/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformPopup, \{\s*open: taskDetailPopover === "menu",[\s\S]*?variant: "minimal",[\s\S]*?placement: "bottom-end"/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-comment-modal-instructions\s*\{[\s\S]*?min-height: 180px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-comment-modal-instructions \.platform-instructions-editor__title\s*\{\s*font-size: 14px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-comment-modal-body\s*\{[\s\S]*?padding-top: 0;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-detail-creator-value \.playground-tasks-detail-select-trigger-label\s*\{\s*color: rgba\(255, 255, 255, 0\.82\);\s*font-size: 12px;\s*font-weight: 400;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-content-body\.is-tasks-page\s+\.playground-environments-page\.playground-tasks-project-workspace:not\(\.playground-agents-page\)\s+\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-board\s*\{\s*padding-bottom: 24px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-sidebar \.is-centralized-sidebar-content\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-thread-divider\s*\{\s*width: 100%;\s*height: 1px;\s*flex: 0 0 1px;\s*margin: 12px 0;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-detail-thread-row\s*\{\s*width: calc\(100% \+ 16px\);[\s\S]*?margin-left: -8px;\s*padding: 10px 8px;\s*border: 0;\s*border-radius: 8px;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-backlog-header\.is-backlog-list-header\s+\.playground-tasks-backlog-heading,\s*\.playground-tasks-backlog-header\.is-board-list-header\s+\.playground-tasks-backlog-heading\s*\{\s*font-weight: 400;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-project-workspace\s+\.playground-tasks-backlog-view\s+\.playground-tasks-backlog-item\s*\{\s*border-color: rgba\(255, 255, 255, 0\.075\);\s*background: rgba\(255, 255, 255, 0\.075\);/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-backlog-central-search\.platform-search,\s*\.playground-tasks-board-central-search\.platform-search\s*\{\s*width: 300px;\s*min-width: 300px;\s*flex: 0 0 300px;/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /React\.createElement\(PlatformSearch, \{\s*className: "playground-project-resources-central-search"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?popupVariant: "minimal"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal",\s*placement: "bottom-start"/);
assert.match(platformEntrySource, /import \{ PlatformUiCard \} from "\/dist\/platform-ui\/components\/composite\/ui-card\/index\.js";/);
assert.match(platformEntrySource, /import \{ PlatformAttachmentActionMenu, PlatformAttachments \} from "\/dist\/platform-ui\/components\/composite\/attachments\/index\.js";/);
assert.match(platformEntrySource, /import \{ PlatformFileExplorerBrowserModal, PlatformFileExplorerModal \} from "\/dist\/platform-ui\/components\/composite\/file-explorer\/index\.js";/);
assert.match(platformEntrySource, /import \{ PlatformSubtasks \} from "\/dist\/platform-ui\/components\/composite\/subtasks\/index\.js";/);
assert.match(platformEntrySource, /attachmentPreviewPortalId: "playground-task-attachment-preview-root"/);
assert.match(platformEntrySource, /id: "playground-task-attachment-preview-root",\s*className: "platform-floating-sidebar-portal playground-task-attachment-preview-portal"/);
assert.match(platformEntrySource, /React\.createElement\(ListFilter, \{ width: 14/);
assert.match(platformEntrySource, /playground-project-resources-toolbar-title-group/);
assert.match(platformEntrySource, /renderSharedFilterControl\(\)[\s\S]*?renderSharedNewControl\(\),\s*renderSharedSearchControl\(\)/);
assert.match(platformEntrySource, /const activeTicketNumber = String\(tasksHeaderState\.ticketNumber \|\| ""\)\.trim\(\)/);
assert.match(platformEntrySource, /\{ label: activeTicketNumber \}/);
assert.match(platformEntrySource, /label: projectTitle,\s*onClick: \(\) => setTasksProjectViewRequest/);
assert.match(platformEntrySource, /\(activeProjectView === "backlog" \|\| activeProjectView === "board"\) && !isProjectTaskDetailView\s*\? tasksHeaderState\.extraActions \|\| null/);
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/projects\/index\.mjs"/);
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
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-tasks-connector-browser-portal\.tb-runner-chat \{/m);

const calls = [];
const record = (adapter) => (...args) => {
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
  ["/projects/project_1", {
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
  }],
  ["/servers?projectId=project_1", {
    status: 200,
    data: { servers: [{ id: "server_1", projectId: "project_1" }, { id: "server_2", projectId: "project_2" }] },
  }],
  ["/metronomes?projectId=project_1", {
    status: 200,
    data: { metronomes: [{ id: "metronome_1", metadata: { projectId: "project_1" } }] },
  }],
]);
let response = null;
const handleResourceIndex = createProjectResourceIndexHandler({
  fetchUpstreamJsonForProxyExactPath: async (_req, upstreamPath) => upstreamResponses.get(upstreamPath) || { status: 404, data: {} },
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
assert.deepEqual(response.data.servers.map((server) => server.id), ["server_1"]);
assert.deepEqual(response.data.metronomes.map((metronome) => metronome.id), ["metronome_1"]);
assert.deepEqual(response.data.imagineResources.map((resource) => resource.id), ["file_1"]);

console.log("Projects service module and route contracts passed.");
