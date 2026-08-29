import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  CALENDAR_BROWSER_FOUNDATION_FRAGMENTS,
  CALENDAR_DOMAIN_RUNTIME_SCRIPT,
  CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS,
  CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT,
  CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT,
  CALENDAR_SHELL_SCRIPT_FRAGMENTS,
  CALENDAR_STYLE_FRAGMENTS,
  CALENDAR_VENDOR_HEAD_HTML,
  createCalendarService,
} from "./index.mjs";
import {
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  PROJECTS_PAGE_RUNTIME_SCRIPT,
} from "../projects/index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /function buildPlaygroundDefaultScheduleDraft/);
assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /PLAYGROUND_CALENDAR_SCHEDULE_TARGET_OPTIONS/);
assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /\{ id: "workflow", label: "Workflow" \}/);
assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /\{ id: "batch", label: "Batch" \}/);
assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /function normalizePlaygroundScheduleTargetType/);
assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /normalized === "batch" \|\| normalized === "batch_job" \|\| normalized === "batch_job_run"/);
assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /taskColor: "blue"/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /function normalizePlaygroundScheduleRecord/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /metadata\?\.color\s*\|\| "blue"/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /metadata\?\.targetKind/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /workflowId: targetType === "workflow" \? workflowId : null/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /batchJobId: targetType === "batch" \? batchJobId : null/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /function getPlaygroundScheduleExecutionAction/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /metadata\.executionHistory/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /"View Workflow"[\s\S]*?"View Loop"[\s\S]*?"View Thread"/);
const { getPlaygroundScheduleExecutionAction } = new Function(
  CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT
  + CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT
  + "; return { getPlaygroundScheduleExecutionAction };"
)();
assert.deepEqual(
  getPlaygroundScheduleExecutionAction({
    targetType: "task",
    scheduledTime: "2026-08-20T08:00:00.000Z",
    metadata: { threadId: "thread_task_1" },
  }, "2026-08-20T08:00:00.000Z", new Date("2026-08-20T09:00:00.000Z")),
  {
    threadId: "thread_task_1",
    workflowRunId: "",
    targetType: "task",
    label: "View Thread",
  },
);
assert.deepEqual(
  getPlaygroundScheduleExecutionAction({
    id: "schedule_legacy_task_1",
    targetType: "task",
    scheduleType: "one-time",
    scheduledTime: "2026-08-20T15:00:00.000Z",
  }, "2026-08-20T15:00:00.000Z", new Date("2026-08-20T17:00:00.000Z"), [{
    id: "thread_legacy_task_1",
    createdAt: "2026-08-20T15:00:02.000Z",
    metadata: { scheduleId: "schedule_legacy_task_1" },
  }]),
  {
    threadId: "thread_legacy_task_1",
    workflowRunId: "",
    targetType: "task",
    label: "View Thread",
  },
  "Legacy scheduled threads must resolve through thread.metadata.scheduleId.",
);
assert.deepEqual(
  getPlaygroundScheduleExecutionAction({
    targetType: "workflow",
    scheduleType: "recurring",
    metadata: {
      executionHistory: [
        {
          scheduledFor: "2026-08-19T08:00:00.000Z",
          threadId: "thread_workflow_1",
          workflowRunId: "metronome_run_1",
        },
        {
          scheduledFor: "2026-08-20T08:00:00.000Z",
          threadId: "thread_workflow_2",
          workflowRunId: "metronome_run_2",
        },
      ],
    },
  }, "2026-08-19T08:00:00.000Z", new Date("2026-08-20T09:00:00.000Z")),
  {
    threadId: "thread_workflow_1",
    workflowRunId: "metronome_run_1",
    targetType: "workflow",
    label: "View Workflow",
  },
);
assert.equal(
  getPlaygroundScheduleExecutionAction({
    targetType: "workflow",
    scheduleType: "recurring",
    metadata: {
      threadId: "thread_workflow_latest",
      executionHistory: [{
        scheduledFor: "2026-08-20T08:00:00.000Z",
        threadId: "thread_workflow_latest",
      }],
    },
  }, "2026-08-19T08:00:00.000Z", new Date("2026-08-20T09:00:00.000Z")),
  null,
  "A recurring occurrence without its own ledger entry must not open the latest run.",
);
assert.equal(
  getPlaygroundScheduleExecutionAction({
    targetType: "loop",
    scheduledTime: "2026-08-21T08:00:00.000Z",
    metadata: { threadId: "thread_loop_1" },
  }, "2026-08-21T08:00:00.000Z", new Date("2026-08-20T09:00:00.000Z")),
  null,
);
assert.match(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundCalendarVisibleRange/);
assert.match(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundScheduleCalendarEvents/);
assert.doesNotMatch(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function PlaygroundWelcomeCalendarWidget/);
assert.match(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundWelcomeCalendarWidgetView/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.collectionState, /calendarMetronomeWorkflows/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.collectionState, /calendarBatchJobs/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.collectionState, /calendarBatchJobsLoadState/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /scheduleWorkflowRunState/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /scheduleBatchSearchQuery/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /scheduleHasUnsavedChanges/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /selectedScheduleOccurrenceAt/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /scheduleCurrentTime/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /\{ appId: "runner_project_calendar" \}, \{ appId: "automations" \}/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /requestTarget\.searchParams\.set\("scheduleId", query\.scheduleId\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /setScheduleExecutionThreadRecords\(\(current\) =>/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /backendUrl \+ "\/schedules\/executions"/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /Number\(error\?\.status\) !== 404/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.lifecycle, /window\.setInterval\(refreshExecutionLifecycle, 5_000\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.lifecycle, /document\.visibilityState === "hidden"/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /window\.setInterval\(updateScheduleCurrentTime, 30000\)/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /scheduleContextMenu/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState, /scheduleContextMenuRef/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.refs, /scheduleEditorRevisionRef/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /loadPlatformMetronomeManualRunContext/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /createPlatformMetronomeManualRunContracts/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /createPlatformMetronomeManualRunInitialValues/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /const requestController = typeof AbortController === "function"/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /signal: requestController\?\.signal/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /requestController\?\.abort\(\)/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /if \(!isStandaloneCalendarMode && !selectedProjectId\)/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /kind: "schedule-draft"/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState, /\.concat\(draftScheduleEvents\)/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.textareaRefs, /taskCommentTextareaRef/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.textareaRefs, /const scheduleTitleInputRef = useRef\(null\)/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.topNavigation, /formatScheduleCalendarHeaderLabel/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.topNavigation, /onCalendarTopNavStateChange/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /async function loadProjectSchedules/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /async function loadCalendarBatchJobs/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /backendUrl \+ "\/batch-jobs"/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /startPolicy === "manual" \|\| startPolicy === "stay_on_shelf"/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /status === "held" \|\| status === "failed"/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /async function persistScheduleDraft/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /function openScheduleComposer\(targetType = "task"\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /if \(resolved\.id\) \{\s*void loadScheduleExecutionThreads\(resolved\.id\);\s*\}/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /nextDraft\.name = "";/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /function focusScheduleComposerTitle\(\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /titleInput\.focus\(\);\s*titleInput\.select\(\);/);
assert.equal(
  (CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence.match(/focusScheduleComposerTitle\(\);/g) || []).length,
  2,
  "Both schedule creation paths should focus the title input.",
);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /targetKind: scheduleTargetType === "workflow"[\s\S]*?\? "metronome_run"[\s\S]*?: scheduleTargetType === "batch"[\s\S]*?\? "batch_job"[\s\S]*?: "thread"/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /if \(!trimmedName\) return "Please enter a title\."/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /return "Please choose a workflow\."/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /return "Please choose a Batch job\."/);
assert.ok(
  CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence.indexOf('if (!trimmedName) return "Please enter a title."')
    < CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence.indexOf('return "Please choose a workflow."'),
  "Workflow schedules must require an explicit title before Workflow selection can make them valid.",
);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /getPlatformMetronomeManualRunValidationError/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /buildPlatformMetronomeManualRunFixture/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /buildPlatformMetronomeManualRunInput/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /workflowVersionId:/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /workflowInput:/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /description: typeof normalizedSchedule\.description === "string" \? normalizedSchedule\.description : ""/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /const workflowDescription/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /const saveRevision = scheduleEditorRevisionRef\.current/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /setScheduleHasUnsavedChanges\(false\)/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /queueScheduleAutosave|flushQueuedScheduleAutosave/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /function handleScheduleSaveShortcut/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /async function handleOpenScheduleExecution/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /onThreadOpen\(normalizedThreadId, \{ contentMode: "chat" \}\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /\/metronomes\/" \+ encodeURIComponent\(workflowId\) \+ "\/runs\/"/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /window\.addEventListener\("keydown", handleScheduleSaveShortcut, true\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /event\.metaKey \|\| event\.ctrlKey/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.scheduleDialog, /function handleTaskScheduleDialogSave/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.draftUpdates, /setScheduleHasUnsavedChanges\(true\)/);
assert.match(CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView, /function renderTaskScheduleDialog/);
assert.match(CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView, /\{ embedded = false \} = \{\}/);
assert.match(CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView, /className: "playground-tasks-schedule-type-switch"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleDetailPanel/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleWorkflowPicker/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleBatchPicker/);
const scheduleWorkflowPickerSource = CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar.slice(
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar.indexOf("function renderScheduleWorkflowPicker"),
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar.indexOf("function renderScheduleBatchPicker"),
);
assert.doesNotMatch(
  scheduleWorkflowPickerSource,
  /name:\s*base\.name\s*\|\|\s*workflowName/,
  "Choosing a Workflow must not silently satisfy the explicit Calendar title requirement.",
);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /placeholder: "Search Batch jobs\.\.\."/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /void loadCalendarBatchJobs\(\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformPopupSearchHeader, \{[\s\S]*?placeholder: "Search workflows\.\.\."/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-backlog-project-icon is-" \+ activeScheduleTargetType/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(ActiveScheduleTypeIcon, \{ width: 14, height: 14/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-content-title playground-tasks-schedule-navbar-title"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-schedule-identity"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /ref: scheduleTitleInputRef,[\s\S]*?className: "playground-tasks-schedule-identity-name-input"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-schedule-identity-description-input"[\s\S]*?value: scheduleDraft\?\.description \|\| ""/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /updateScheduleDraftField\("description", event\.target\.value\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /activeScheduleTargetType === "workflow"[\s\S]*?"New Scheduled Workflow"[\s\S]*?"New Scheduled Loop"[\s\S]*?"New Scheduled Batch"[\s\S]*?"New Scheduled Task"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformPopup, \{[\s\S]*?"aria-label": "Schedule actions"[\s\S]*?variant: "minimal"/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /taskDetailPopover === "menu"\s*\? React\.createElement\(PlatformPopupSurface/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /activeScheduleTargetType === "workflow"\s*\? renderScheduleWorkflowConfiguration\(\)\s*:\s*activeScheduleTargetType === "batch"\s*\? renderScheduleBatchPicker\(\)\s*:\s*React\.createElement\(PlatformInstructionsEditor/);
assert.match(
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar,
  /playground-tasks-schedule-detail-facts"[\s\S]*?activeScheduleTargetType === "workflow"\s*\? renderScheduleWorkflowConfiguration\(\)/,
);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformMetronomeManualRunInputs/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleCalendarTimeGutter/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleCalendarWeekHeader/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-calendar-week-header-day" \+ \(isToday \? " is-today" : ""\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /week:\s*\{\s*header: renderScheduleCalendarWeekHeader/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /const firstGutterSlot = slotMetrics\?\.groups\?\.\[0\]\?\.\[0\]/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /currentTimeOnGutterDate\.setHours\(/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /slotMetrics\.getCurrentTimePosition\(currentTimeOnGutterDate\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-calendar-time-gutter-wrapper"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /gutterWrapper\?\.closest\?\.\("\.rbc-time-content"\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-calendar-current-time"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /timeGutterWrapper: renderScheduleCalendarTimeGutter/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /scrollToTime: new Date\(scheduleCurrentTime\.getTime\(\) - \(10 \* 60 \* 1000\)\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /enableAutoScroll: true/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleActionsMenu/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /onContextMenu: \(contextMenuEvent\) =>/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /portalAnchorPoint: \{[\s\S]*?x: scheduleContextMenu\.x,[\s\S]*?y: scheduleContextMenu\.y/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /tb-popup-row playground-tasks-detail-menu-item-danger/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /activeScheduleWorkflowContract\.inputFields\.some\(\(field\) => field\.id !== "prompt"\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /playground-tasks-schedule-workflow-parameters/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /"aria-label": "Parameters"/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-detail-facts playground-tasks-schedule-workflow-parameters"/);
assert.doesNotMatch(
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar,
  /taskDetailActionsRef/,
  "The schedule detail header must not reference the removed task-detail actions ref.",
);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /updateScheduleDraft\(\(current\) => \{[\s\S]*?workflowId: workflow\.id/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.draftUpdates, /setScheduleHasUnsavedChanges\(true\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /renderComposerInput: \(\{ contract, value, disabled \}\) => React\.createElement\(PlatformInstructionsEditor/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-schedule-detail-footer"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /scheduleExecutionAction[\s\S]*?handleOpenScheduleExecution\(scheduleDraft, selectedScheduleOccurrenceAt\)[\s\S]*?handleSaveSchedule\(\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /disabled: scheduleSaveState\.isSaving[\s\S]*?\|\| \(!scheduleExecutionAction && \(!scheduleHasUnsavedChanges \|\| Boolean\(scheduleValidationError\)\)\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /fullWidth: true/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /scheduleExecutionAction\?\.label \|\| "Save Changes"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /openScheduleEditor\(event\.resource, event\?\.start\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /new Intl\.DateTimeFormat\("en-US", \{/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /replace\(\/\\s\*\(am\|pm\)\$\/i, \(_match, period\) => " " \+ period\.toUpperCase\(\)\)/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /metadata:[\s\S]*?threadId: linkedThreadId/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /isDraftEvent \? "is-calendar-draft" : ""/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /isActiveEvent \? "is-calendar-active" : ""/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /eventOccurrenceMs === selectedOccurrenceMs/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function getProjectCalendarEventColor\(colorId, opacity = 0\.15\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /getProjectCalendarEventColor\(eventColorId, 0\.15\)/);
assert.doesNotThrow(
  () => new Function(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar),
  "The serialized Calendar view fragment must remain valid JavaScript.",
);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /"--playground-calendar-event-text": "#fff"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /scheduleDraft\?\.id === resource\.id/);
assert.match(
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar,
  /editingSchedule\?\.taskColor[\s\S]*?resource\.taskColor[\s\S]*?resource\.metadata\?\.taskColor/,
);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /"--playground-calendar-event-border": getProjectCalendarEventColor\(eventColorId, 0\.5\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-calendar-event-top"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-calendar-event-meta"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /renderTaskAssigneeAvatar\(eventTask, "playground-tasks-board-assignee-avatar"\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /renderTaskActorAvatar\(eventAssigneeId, "playground-tasks-board-assignee-avatar"\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /renderPlaygroundTaskPriorityIcon\([\s\S]*?eventPriority,[\s\S]*?playground-tasks-calendar-event-priority/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /const eventStartTime = formatScheduleTimeLabel\(event\?\.start\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function formatScheduleTimeLabel\(value\)[\s\S]*?hour12: true/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-calendar-event-time"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /resource\.kind === "schedule-draft" \|\| resource\.isDraft === true/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /options: PLAYGROUND_CALENDAR_SCHEDULE_TARGET_OPTIONS\.map/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /playground-tasks-detail-type-badge is-" \+ activeScheduleTargetType \+ " is-schedule-compact/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /valueLabel: activeScheduleTaskType === "subtask"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformInstructionsEditor/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformSelector/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformCommentComposer/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /Calendar event comment/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformSubtasks/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformActivityTimeline/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /playground-tasks-detail-navbar-ticket/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /contentVariant: "file-enabled"/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleStatusControl\(/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleProjectFact\(\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleMilestoneFact\(\) \{\s*if \(!activeScheduleProjectId\) return null;/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleBlockedByFact\(\) \{\s*if \(!activeScheduleProjectId\) return null;/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /renderScheduleProjectFact\(\),\s*renderScheduleMilestoneFact\(\),\s*renderScheduleBlockedByFact\(\)/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleConnectorsFact\(\)[\s\S]*?onClick: openTaskEnvironmentFilePicker/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /scheduleConnectorEntries\.map/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-schedule-skills-source-switch"[\s\S]*?fullWidth: true/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformToggle,[\s\S]*?checked: allScheduleSystemSkillsEnabled/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-schedule-skills-list"/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.skills, /function getEffectiveScheduleEnabledSkillIds/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.skills, /function setAllScheduleSystemSkillsEnabled/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /enabledSkills: effectiveScheduleSkillIds/);
assert.equal(
  (CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar.match(/React\.createElement\("textarea"/g) || []).length,
  1,
  "Calendar should use one compact native textarea for the schedule identity description.",
);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /playground-tasks-comment-dock/);
assert.doesNotMatch(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /className: "playground-tasks-(?:attachments|skills|connectors|comments)"/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.descriptionEditor, /function handleScheduleDescriptionEditorChange/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.descriptionEditor, /function handleScheduleWorkflowPromptEditorChange/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.descriptionEditor, /isWorkflowPrompt[\s\S]*?workflowInputValues: nextWorkflowValues/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.descriptionEditor, /async function uploadScheduleDescriptionFiles/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /readOnly: disabled/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderCalendarView/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /toolbar: !isStandaloneCalendarMode/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformSwitch/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.standaloneWorkspace, /function renderStandaloneCalendarWorkspace/);
assert.match(CALENDAR_BROWSER_FOUNDATION_FRAGMENTS.calendarImport, /react-big-calendar/);
assert.match(CALENDAR_BROWSER_FOUNDATION_FRAGMENTS.localizer, /dateFnsLocalizer/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.navigation, /function openCalendarPage/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.state, /calendarTopNavActionsRef/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /function renderCalendarTopNavCenter/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /function renderCalendarTopNavActions/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /value: "day", label: "Day"/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformButtonSelector/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /mode: "split-action"/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /buttonVariant: "primary"/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /label: "Schedule"/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /\{ id: "workflow", label: "Workflow", Icon: Metronome \}/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /\{ id: "batch", label: "Batch", Icon: Truck \}/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /className: "playground-tasks-detail-type-badge is-" \+ id/);
const calendarTopNavActionsSource = CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation.slice(
  CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation.indexOf("function renderCalendarTopNavActions"),
);
assert.doesNotMatch(calendarTopNavActionsSource, /React\.createElement\(PlatformSwitch/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-scheduler/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-week-header-day\.is-today\s*\{[\s\S]*?background: #016bdf;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-timeslot-group\s*\{\s*min-height: 80px;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.playground-tasks-scheduler\.is-day-view \.rbc-time-content\s*\{\s*border-top: none !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-calendar-event-surface, rgba\(1, 107, 203, 0\.15\)/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-event\s*\{[\s\S]*?border: none !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-event:focus,[\s\S]*?outline: none !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-event\.is-calendar-active\s*\{[\s\S]*?--playground-calendar-event-border[\s\S]*?box-shadow: none !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-event-content\s*\{[\s\S]*?color: #fff !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-time-view \.rbc-event\s*\{[\s\S]*?height: 74px !important;[\s\S]*?min-height: 74px !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-time-view \.playground-tasks-calendar-event-inner\s*\{[\s\S]*?flex-direction: column;[\s\S]*?align-items: stretch;[\s\S]*?justify-content: space-between;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-time-view \.rbc-events-container\s*\{\s*margin-right: 0 !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-event-top\s*\{[\s\S]*?justify-content: space-between;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-time-view \.playground-tasks-calendar-event-priority,[\s\S]*?\.rbc-time-view \.playground-tasks-calendar-event-time\s*\{\s*display: inline-flex;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-event-time\s*\{\s*flex: 0 0 auto;[\s\S]*?margin-left: auto;[\s\S]*?font-size: 11px;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-event-title\s*\{[\s\S]*?font-size: 12px;[\s\S]*?font-weight: 500;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-event-type-icon\.is-loop[\s\S]*?#9a72df/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-event-type-icon\.is-workflow[\s\S]*?#4f7fc5/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-event-type-icon\.is-batch[\s\S]*?#d69a4b/);
assert.match(
  CALENDAR_STYLE_FRAGMENTS.scheduler,
  /playground-tasks-schedule-detail-facts::before\s*\{\s*content: none;\s*display: none;/,
);
assert.match(
  CALENDAR_STYLE_FRAGMENTS.scheduler,
  /playground-tasks-schedule-detail-facts\s*\{[\s\S]*?border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]*?background: rgba\(255, 255, 255, 0\.075\);/,
);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-detail-shell \.playground-tasks-detail-body\s*\{[\s\S]*?border-left: 1px solid rgba\(255, 255, 255, 0\.075\);/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-skills-source-switch\.platform-switch\s*\{[\s\S]*?width: 100%;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-detail-skills-selector-popup\.platform-selector__popup\s*\{[\s\S]*?overflow-y: hidden;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-skills-list\s*\{[\s\S]*?overflow-y: auto;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-skills-all\s*\{[\s\S]*?flex: 0 0 auto;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-picker/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-save-button\.platform-button\s*\{\s*--platform-button-height: 32px;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-detail-shell \.playground-tasks-detail-navbar\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-identity\s*\{[\s\S]*?padding: 12px 6px 0;[\s\S]*?border-bottom: 0;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-identity-name-input\s*\{[\s\S]*?font-size: 18px;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-identity-description-input\s*\{[\s\S]*?min-height: 36px;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-parameters\s*\{[\s\S]*?display: grid;[\s\S]*?gap: 12px;/);
assert.doesNotMatch(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-parameters\s*\{[^}]*?(?:padding|border|border-radius|background):/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-parameters-title\s*\{[\s\S]*?font-weight: 400;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-parameters \.batches-form-field input,[\s\S]*?border: none !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-parameters \.batches-form-field input,[\s\S]*?background: rgba\(255, 255, 255, 0\.1\) !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /\.rbc-current-time-indicator\s*\{\s*display: none !important;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-time-gutter-wrapper\s*\{[\s\S]*?position: relative;[\s\S]*?flex: none;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-current-time\s*\{[\s\S]*?left: 0;[\s\S]*?right: 0;[\s\S]*?height: 1px;[\s\S]*?background: rgba\(255, 255, 255, 0\.7\);/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-calendar-current-time-label\s*\{[\s\S]*?left: 0;[\s\S]*?padding: 0 5px;[\s\S]*?border-radius: 5px;[\s\S]*?background: #fff;[\s\S]*?color: #000;/);
assert.doesNotMatch(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-detail-footer\s*\{[^}]*border-top:/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-workflow-picker-label\s*\{[\s\S]*?color: #fff;[\s\S]*?font-size: 12px;/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-detail-type-badge\.is-workflow\s*\{[\s\S]*?background: linear-gradient/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-detail-type-badge\.is-schedule-compact\s*\{[\s\S]*?width: 16px;[\s\S]*?height: 16px;/);
assert.doesNotMatch(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-schedule-comment-composer/);
assert.match(CALENDAR_STYLE_FRAGMENTS.welcomeWidget, /playground-thread-widget-calendar/);
assert.match(CALENDAR_VENDOR_HEAD_HTML, /react-big-calendar@1\.19\.4/);

assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundCalendarVisibleRange/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderCalendarView/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderStandaloneCalendarWorkspace/);
assert.doesNotMatch(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /scheduleAutosaveTimerRef|scheduleAutosaveInFlightRef|scheduleAutosaveQueuedRef|scheduleEditorDirtyRef/,
  "The assembled Calendar runtime must not retain removed autosave refs.",
);
assert.doesNotMatch(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /Calendar event comment/,
  "The Calendar inspector must not expose comment composition.",
);

const platformEntrySource = await readPlatformCompositionSource();
const platformTemplateSource = await fs.readFile(
  new URL("../../../../apps/platform/client/legacy/templates/platform.template.js", import.meta.url),
  "utf8",
);
const platformShellBootstrapSource = await fs.readFile(
  new URL("../../../../apps/platform/client/legacy/domains/shell/controller/bootstrap-account-and-connectors.template.js", import.meta.url),
  "utf8",
);
const projectsDomainSource = await fs.readFile(new URL("../projects/client/domain-runtime.mjs", import.meta.url), "utf8");
const projectsDataSource = await fs.readFile(new URL("../projects/client/page/data.mjs", import.meta.url), "utf8");
const projectsViewsSource = await fs.readFile(new URL("../projects/client/page/views.mjs", import.meta.url), "utf8");
const projectsRoutesSource = await fs.readFile(new URL("../projects/server/routes.mjs", import.meta.url), "utf8");

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/calendar\/index\.mjs"/);
assert.match(platformEntrySource, /calendarService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /center: activePage === "calendar"[\s\S]{0,120}renderCalendarTopNavCenter\(\)/);
assert.match(platformTemplateSource, /loadMetronomeManualRunContext as loadPlatformMetronomeManualRunContext/);
assert.match(platformTemplateSource, /createMetronomeManualRunContracts as createPlatformMetronomeManualRunContracts/);
assert.match(platformTemplateSource, /createMetronomeManualRunInitialValues as createPlatformMetronomeManualRunInitialValues/);
assert.match(platformTemplateSource, /getMetronomeManualRunValidationError as getPlatformMetronomeManualRunValidationError/);
assert.match(platformTemplateSource, /buildMetronomeManualRunFixture as buildPlatformMetronomeManualRunFixture/);
assert.match(platformTemplateSource, /buildMetronomeManualRunInput as buildPlatformMetronomeManualRunInput/);
assert.match(platformTemplateSource, /MetronomeManualRunInputs as PlatformMetronomeManualRunInputs/);
assert.match(platformShellBootstrapSource, /proxyBackendBase \+ "\/schedules"/);
assert.doesNotMatch(
  platformShellBootstrapSource,
  /proxyBackendBase \+ "\/projects\/" \+ encodeURIComponent\(resolvedProjectId\) \+ "\/schedules"/,
);
assert.match(platformShellBootstrapSource, /schedules: welcomeSchedules/);
assert.doesNotMatch(platformEntrySource, /function openCalendarPage/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-tasks-scheduler\s*\{/m);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-thread-widget-calendar\s*\{/m);
assert.doesNotMatch(projectsDomainSource, /function buildPlaygroundCalendarVisibleRange/);
assert.doesNotMatch(projectsDomainSource, /function normalizePlaygroundScheduleRecord/);
assert.doesNotMatch(projectsDataSource, /async function loadProjectSchedules/);
assert.doesNotMatch(projectsViewsSource, /function renderCalendarView/);
assert.doesNotMatch(projectsRoutesSource, /\/api\/real\/schedules/);

const calls = [];
const calendarService = createCalendarService({
  proxyUpstreamGet: (...args) => calls.push({ adapter: "get", args }),
  proxyUpstreamJsonRequest: (...args) => calls.push({ adapter: "json", args }),
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = calendarService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/schedules");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/schedules");

result = dispatch("POST", "/api/real/schedules");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules");
assert.equal(result.call.args[3], "POST");

result = dispatch("GET", "/api/real/schedules/executions?appId=runner_project_calendar");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/schedules/executions");

result = dispatch("PATCH", "/api/real/schedules/schedule%201");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules/schedule%201");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("POST", "/api/real/schedules/schedule_1/trigger");
assert.equal(result.call.args[2], "/schedules/schedule_1/trigger");

result = dispatch("GET", "/api/real/projects/project%201/schedules");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/schedules");

result = dispatch("POST", "/api/real/projects/project_1/schedules");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules");

result = dispatch("DELETE", "/api/real/projects/project_1/schedules/schedule_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules/schedule_1");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/projects/project_1");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

assert.throws(
  () => createCalendarService({ proxyUpstreamJsonRequest() {} }),
  /proxyUpstreamGet adapter/,
);
assert.throws(
  () => createCalendarService({ proxyUpstreamGet() {} }),
  /proxyUpstreamJsonRequest adapter/,
);

console.log("Calendar service module, composition, and route contracts passed.");
