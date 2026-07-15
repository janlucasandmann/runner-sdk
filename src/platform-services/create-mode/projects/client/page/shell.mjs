import { CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS } from "../../../calendar/client/projects-integration/page-shell/index.mjs";
export const PROJECTS_PAGE_SHELL_SCRIPT = `
      function PlaygroundTasksPage({
        backendUrl,
        requestHeaders,
        agents,
        environments,
        initialEnvironmentId,
        initialAgentId,
        apiKey,
        upstreamUrl,
        speechToTextUrl,
        computerAgents,
        skills,
        currentUserId,
        currentUserName,
        currentUserEmail,
        currentUserAvatarUrl,
        canStartThreads,
        hasRealAccess = false,
        taskRunStates,
        onThreadOpen,
        onThreadOptionsOpen,
        onThreadStarted,
        onTaskRunStateChange,
        onStartAgentReviewThread,
        onStatusIndicatorItemChange,
        onTaskDeleted,
        onTaskRecordCommitted,
        openTaskRequest,
        navigationRequest,
        onNavigationRequestHandled,
        onProjectScopeChange,
        onProjectRecordCommitted,
        onOpenFilesPage,
        onOpenProjectMetronomes,
        onOpenResourceTemplatesPage,
        projectOverviewResourceFilter = "all",
        setProjectOverviewResourceFilter = () => {},
        projectOverviewResourceSearchQuery = "",
        setProjectOverviewResourceSearchQuery = () => {},
        projectOverviewResourceViewMode = "list",
        setProjectOverviewResourceViewMode = () => {},
        projectOverviewResourceToolbarPopover = "",
        setProjectOverviewResourceToolbarPopover = () => {},
        projectOverviewResourceMenuId = "",
        setProjectOverviewResourceMenuId = () => {},
        workspaceTeams = [],
        workspaceTeamMembers = [],
        workspaceTeamMembersTeamId = "",
        workspaceTeamsLoading = false,
        workspaceTeamsRequiresPlan = false,
        onWorkspaceTeamsRequest,
        onOpenTeamPage,
        onRequireAuth,
        onRequestSidebarCollapse,
        useUnifiedProjectNav = false,
        onTasksHeaderChange,
        onCalendarTopNavStateChange,
        calendarTopNavActionsRef,
        onProjectIssueCreateHandlerChange,
        projectNavBackRequestToken = 0,
        projectNavViewRequest = null,
        projectNavSettingsRequestToken = 0,
        projectNavIssueRequest = null,
        detailOnly,
        onCloseDetailOnly,
        standaloneMode,
        subscriptionTierId = "",
        onUpgradeToIndividual,
      }) {
        const effectiveApiKey = useMemo(() => String(apiKey || "").trim(), [apiKey]);
        const isDetailOnlyMode = Boolean(detailOnly);
        const isStandaloneCalendarMode = standaloneMode === "calendar";
        const normalizedSubscriptionTierId = normalizeSettingsTierId(subscriptionTierId) || "free";
        const isCalendarCreationLocked = normalizedSubscriptionTierId === "free";
        const editorDirtyRef = useRef(false);
        const taskAutosaveInFlightRef = useRef(false);
        const taskAutosaveQueuedRef = useRef(null);
${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.refs}
        const selectedTaskIdRef = useRef("");
        const projectSidebarActionsRef = useRef(null);
        const backlogToolbarActionsRef = useRef(null);
        const boardToolbarActionsRef = useRef(null);
        const releaseToolbarActionsRef = useRef(null);
        const releaseBacklogToolbarActionsRef = useRef(null);
        const projectOverviewTasksToolbarRef = useRef(null);
        const projectOverviewThreadsToolbarRef = useRef(null);
        const projectOverviewFilesToolbarRef = useRef(null);
        const backlogTaskContextMenuRef = useRef(null);
        const taskStatusMenuRef = useRef(null);
        const taskDetailActionsRef = useRef(null);
        const taskDetailSelectPopoverRef = useRef(null);
        const taskDetailThreadsToolbarRef = useRef(null);
        const taskSkillsActionsRef = useRef(null);
	        const taskDetailMainRef = useRef(null);
	        const taskDescriptionTextareaRef = useRef(null);
	        const missionControlDocumentTextareaRef = useRef(null);
	        const projectRulesTextareaRef = useRef(null);
	        const projectRuleComposerTextareaRef = useRef(null);
	        const projectRuleEditTextareaRef = useRef(null);
${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.textareaRefs}
        const taskCommentTextareaRef = useRef(null);
        const taskAttachmentInputRef = useRef(null);
        const projectAttachmentInputRef = useRef(null);
        const taskScheduleDialogTimerRef = useRef(null);
        const taskAttachmentObjectUrlsRef = useRef(new Set());
        const taskTitleSkipCommitRef = useRef(false);
        const backlogTitleSkipCommitRef = useRef("");
        const taskRunPendingIdsRef = useRef(new Set());
        const taskCompletionReconciliationInFlightRef = useRef(new Set());
        const missingTaskCompletionThreadKeysRef = useRef(new Set());
        const taskWaitingSubtasksThreadKeysRef = useRef(new Set());
        const handledGithubDisconnectTokenRef = useRef("");
        const handledProjectNavBackRequestTokenRef = useRef(0);
        const handledProjectNavViewRequestTokenRef = useRef("");
        const handledProjectNavSettingsRequestTokenRef = useRef(0);
        const handledProjectNavIssueRequestTokenRef = useRef("");
        const taskConnectorBrowserOpenFrameRef = useRef(null);
        const projectGithubPreparationPromisesRef = useRef(new Map());
        const projectWorkspaceLoadTokenRef = useRef("");
	        const missionControlSyncThreadIdRef = useRef("");
	        const missionControlRecoveryThreadIdRef = useRef("");
	        const missionControlRecoveryAttemptedKeysRef = useRef(new Set());
	        const missionControlAutosaveInFlightRef = useRef(false);
        const missionControlAutosaveQueuedRef = useRef(null);
        const handledOpenTaskRequestTokenRef = useRef("");
        const projectOverviewWorkspaceTeamsRequestedRef = useRef(false);
        const projectOverviewWorkspaceTeamMembersRequestedRef = useRef("");
        const [projects, setProjects] = useState([]);
        const [selectedProjectId, setSelectedProjectId] = useState(() => {
          try {
            return localStorage.getItem("runner_demo_tasks_project_scope_id") || "";
          } catch {
            return "";
          }
        });
        const [selectedProjectDetail, setSelectedProjectDetail] = useState({
          project: null,
          summary: buildEmptyPlaygroundProjectSummary(),
          environments: [],
          recentThreads: [],
          threads: [],
        });
        const [projectLoadState, setProjectLoadState] = useState({
          status: "loading",
          error: "",
        });
        const [projectSaveState, setProjectSaveState] = useState({
          isSaving: false,
          error: "",
        });
        const [projectComposerOpen, setProjectComposerOpen] = useState(false);
        const [projectComposerMode, setProjectComposerMode] = useState("create");
        const [projectInitialSetupModalVisible, setProjectInitialSetupModalVisible] = useState(false);
        const [projectInitialSetupModalClosing, setProjectInitialSetupModalClosing] = useState(false);
        const projectInitialSetupModalCloseTimerRef = useRef(null);
        const projectInitialSetupModalFrameRef = useRef(null);
        const projectInitialSetupModalAnimationMs = 75;
        const [projectIconPickerOpen, setProjectIconPickerOpen] = useState(false);
        const [projectBlueprintPickerOpen, setProjectBlueprintPickerOpen] = useState(false);
        const [projectSidebarPopover, setProjectSidebarPopover] = useState("");
        const [projectCardMenuProjectId, setProjectCardMenuProjectId] = useState("");
        const [projectsHomeSortMode, setProjectsHomeSortMode] = useState("updated-desc");
        const [projectsHomeScope, setProjectsHomeScope] = useState("all");
        const [projectsHomeFilterMode, setProjectsHomeFilterMode] = useState("all");
        const [projectsHomeToolbarPopover, setProjectsHomeToolbarPopover] = useState("");
        const [projectDraft, setProjectDraft] = useState(buildPlaygroundDefaultProjectDraft());
        const [projectWallpaperTransition, setProjectWallpaperTransition] = useState(null);
        const projectWallpaperTransitionTimerRef = useRef(null);
        const projectDraftNameDirtyRef = useRef(false);
        const projectDraftTypedNameRef = useRef("");
        const projectDraftWallpaperIdRef = useRef("");
        const projectDraftUseCardBackgroundAsWallpaperRef = useRef(true);
        const projectDescriptionTextareaRef = useRef(null);
        const [isProjectDescriptionEditing, setIsProjectDescriptionEditing] = useState(false);
        const [projectDescriptionHistory, setProjectDescriptionHistory] = useState({ past: [], future: [] });
        const projectDescriptionEditingRef = useRef(false);
        const [projectComposerEnvironmentPopoverOpen, setProjectComposerEnvironmentPopoverOpen] = useState(false);
        const projectComposerEnvironmentPopoverRef = useRef(null);
        const projectBlueprintPickerRef = useRef(null);
        const [projectPreviewedAttachmentId, setProjectPreviewedAttachmentId] = useState("");
        const [projectAttachmentTransferState, setProjectAttachmentTransferState] = useState({
          uploadingIds: [],
          error: "",
          isProcessing: false,
        });
        const [isProjectAttachmentDragging, setIsProjectAttachmentDragging] = useState(false);
        const [projectEnvironmentFilePickerOpen, setProjectEnvironmentFilePickerOpen] = useState(false);
        const [projectEnvironmentFilePickerInventory, setProjectEnvironmentFilePickerInventory] = useState([]);
        const [projectEnvironmentFilePickerState, setProjectEnvironmentFilePickerState] = useState({
          status: "idle",
          error: "",
        });
        const [projectEnvironmentFilePickerSearch, setProjectEnvironmentFilePickerSearch] = useState("");
        const [projectEnvironmentFilePickerExpandedFolders, setProjectEnvironmentFilePickerExpandedFolders] = useState([]);
        const [projectEnvironmentFilePickerSelectedPaths, setProjectEnvironmentFilePickerSelectedPaths] = useState([]);
        const [taskView, setTaskView] = useState(() => isStandaloneCalendarMode ? "calendar" : "overview");
        const [projectOverviewChartTimescale, setProjectOverviewChartTimescale] = useState("day");
        const [projectOverviewPerformanceRange, setProjectOverviewPerformanceRange] = useState("1m");
        const [projectOverviewHomeTab, setProjectOverviewHomeTab] = useState("general");
        const [projectOverviewSidebarCollapsed, setProjectOverviewSidebarCollapsed] = useState(false);
        const projectOverviewSidebarAutoCollapsedForTaskRef = useRef(false);
        const projectOverviewSidebarAutoCollapsedForPermissionRef = useRef(false);
        const [ticketDetailSidebarCollapsed, setTicketDetailSidebarCollapsed] = useState(false);
        const [projectOverviewPermissionTeamId, setProjectOverviewPermissionTeamId] = useState("");
        const [projectOverviewPermissionRoleId, setProjectOverviewPermissionRoleId] = useState("member");
        const [projectPermissionChartAnimationKey, setProjectPermissionChartAnimationKey] = useState(0);
        const [projectOverviewTeamMenuId, setProjectOverviewTeamMenuId] = useState("");
        const [projectOverviewMilestoneMenuId, setProjectOverviewMilestoneMenuId] = useState("");
        const workspaceTeamsCount = Array.isArray(workspaceTeams) ? workspaceTeams.length : 0;
        function requestProjectOverviewWorkspaceTeams(options = {}) {
          if (!hasRealAccess || workspaceTeamsLoading || workspaceTeamsRequiresPlan) {
            return;
          }
          const requestedTeamId = String(options?.teamId || options?.selectedTeamId || "").trim();
          if (requestedTeamId) {
            const currentMembersTeamId = String(workspaceTeamMembersTeamId || "").trim();
            const hasMatchingMemberRows = currentMembersTeamId === requestedTeamId
              && Array.isArray(workspaceTeamMembers)
              && workspaceTeamMembers.length > 0;
            if (hasMatchingMemberRows || projectOverviewWorkspaceTeamMembersRequestedRef.current === requestedTeamId) {
              return;
            }
            projectOverviewWorkspaceTeamMembersRequestedRef.current = requestedTeamId;
            if (typeof onWorkspaceTeamsRequest === "function") {
              onWorkspaceTeamsRequest({ selectedTeamId: requestedTeamId, teamId: requestedTeamId });
            }
            return;
          }
          if (workspaceTeamsCount > 0) {
            return;
          }
          if (projectOverviewWorkspaceTeamsRequestedRef.current) {
            return;
          }
          projectOverviewWorkspaceTeamsRequestedRef.current = true;
          if (typeof onWorkspaceTeamsRequest === "function") {
            onWorkspaceTeamsRequest();
          }
        }
        useEffect(() => {
          if (projectOverviewHomeTab !== "permissions") {
            return;
          }
          requestProjectOverviewWorkspaceTeams();
        }, [
          projectOverviewHomeTab,
          hasRealAccess,
          workspaceTeamsLoading,
          workspaceTeamsRequiresPlan,
          workspaceTeamsCount,
          onWorkspaceTeamsRequest,
        ]);
        useEffect(() => {
          if (projectOverviewHomeTab !== "permissions") {
            return undefined;
          }
          const frameId = window.requestAnimationFrame(() => {
            const scrollNode = taskDetailMainRef.current?.querySelector(".playground-environments-detail-scroll");
            if (scrollNode && typeof scrollNode.scrollTop === "number") {
              scrollNode.scrollTop = 0;
            }
            setProjectPermissionChartAnimationKey((current) => current + 1);
          });
          return () => window.cancelAnimationFrame(frameId);
        }, [projectOverviewHomeTab, projectOverviewPermissionTeamId, projectOverviewPermissionRoleId, selectedProjectId]);
        const [projectOverviewFilesSubview, setProjectOverviewFilesSubview] = useState("overview");
        const [projectOverviewListMode, setProjectOverviewListMode] = useState("tasks");
        const [projectOverviewTaskSearchQuery, setProjectOverviewTaskSearchQuery] = useState("");
        const [projectOverviewTaskSortMode, setProjectOverviewTaskSortMode] = useState("default");
        const [projectOverviewTaskFilterMode, setProjectOverviewTaskFilterMode] = useState("open");
        const [projectOverviewTaskToolbarPopover, setProjectOverviewTaskToolbarPopover] = useState("");
        const [projectOverviewThreadSearchQuery, setProjectOverviewThreadSearchQuery] = useState("");
        const [projectOverviewThreadSortMode, setProjectOverviewThreadSortMode] = useState("recent-desc");
        const [projectOverviewThreadFilterMode, setProjectOverviewThreadFilterMode] = useState("all");
        const [projectOverviewThreadToolbarPopover, setProjectOverviewThreadToolbarPopover] = useState("");
        const [selectedProjectOverviewThreadIds, setSelectedProjectOverviewThreadIds] = useState(() => new Set());
        const [projectOverviewFileSearchQuery, setProjectOverviewFileSearchQuery] = useState("");
        const [projectOverviewFileSortMode, setProjectOverviewFileSortMode] = useState("recent-desc");
        const [projectOverviewFileFilterMode, setProjectOverviewFileFilterMode] = useState("all");
        const [projectOverviewFileToolbarPopover, setProjectOverviewFileToolbarPopover] = useState("");
        const [projectOverviewFileActivityState, setProjectOverviewFileActivityState] = useState({
          status: "idle",
          error: "",
          items: [],
        });
        const [projectOverviewThreadRecords, setProjectOverviewThreadRecords] = useState([]);
        const [projectOverviewCostSummaryState, setProjectOverviewCostSummaryState] = useState({
          status: "idle",
          error: "",
          summary: null,
        });
        const [projectOverviewFileActivityReloadNonce, setProjectOverviewFileActivityReloadNonce] = useState(0);
        const [projectOverviewOutcomeEditorState, setProjectOverviewOutcomeEditorState] = useState(null);
        const [projectOverviewOutcomeEditorVisible, setProjectOverviewOutcomeEditorVisible] = useState(false);
        const [projectOverviewOutcomeEditorClosing, setProjectOverviewOutcomeEditorClosing] = useState(false);
        const [projectOverviewOutcomeDescriptionEditing, setProjectOverviewOutcomeDescriptionEditing] = useState(false);
        const [projectOverviewOutcomeSuccessCriteriaEditing, setProjectOverviewOutcomeSuccessCriteriaEditing] = useState(false);
        const [projectOverviewOutcomeMilestonePickerOpen, setProjectOverviewOutcomeMilestonePickerOpen] = useState(false);
        const projectOverviewOutcomeEditorCloseTimerRef = useRef(null);
        const projectOverviewOutcomeEditorFrameRef = useRef(null);
        const projectOverviewOutcomeDescriptionTextareaRef = useRef(null);
        const projectOverviewOutcomeSuccessCriteriaTextareaRef = useRef(null);
        const projectOverviewOutcomeMilestonePickerRef = useRef(null);
        const projectOverviewOutcomeEditorAnimationMs = 75;
        const [projectOverviewSuppressedFileKeys, setProjectOverviewSuppressedFileKeys] = useState(() => {
          if (typeof window === "undefined" || !window.localStorage) {
            return [];
          }
          try {
            const parsed = JSON.parse(window.localStorage.getItem("runner-playground-project-overview-deleted-files") || "[]");
            return Array.isArray(parsed) ? parsed.map((value) => String(value || "")).filter(Boolean) : [];
          } catch {
            return [];
          }
        });
        const [projectOverviewFileMenuState, setProjectOverviewFileMenuState] = useState(null);
        const [projectOverviewFileMutationState, setProjectOverviewFileMutationState] = useState({
          rowId: "",
          action: "",
          error: "",
        });
	        const projectOverviewStrategySurfaceRef = useRef(null);
	        const projectOverviewRulesSurfaceRef = useRef(null);
	        const projectOverviewFileActivityLoadKeyRef = useRef("");
	        const projectOverviewServerResourcesLoadKeyRef = useRef("");
	        const projectListAutoLoadKeyRef = useRef("");
	        const projectWorkspaceAutoLoadKeyRef = useRef("");
${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.loadRefs}
	        const projectCustomSkillsLoadKeyRef = useRef("");
	        const taskDetailThreadRecordsLoadKeyRef = useRef("");
	        const taskDetailAutoLoadKeyRef = useRef("");
	        const reportedProjectScopeIdRef = useRef("");
	        const projectLocalNameOverridesRef = useRef(new Map());
	        const [projectOverviewServerResourcesState, setProjectOverviewServerResourcesState] = useState({
	          status: "idle",
	          error: "",
	          items: [],
	        });
	        const [projectOverviewVisibleThreadCount, setProjectOverviewVisibleThreadCount] = useState(5);
	        const [projectOverviewVisibleActivityCount, setProjectOverviewVisibleActivityCount] = useState(5);
	        const [projectOverviewSidebarPropertyPopover, setProjectOverviewSidebarPropertyPopover] = useState("");
	        const [projectFullAutoState, setProjectFullAutoState] = useState({
	          projectId: "",
	          enabled: false,
	          runningTaskId: "",
	          startedCount: 0,
	          error: "",
	        });
        const isCalendarContext = isStandaloneCalendarMode || taskView === "calendar";
        const [backlogToolbarPopover, setBacklogToolbarPopover] = useState("");
        const [backlogFilterMode, setBacklogFilterMode] = useState("open");
        const [backlogSortMode, setBacklogSortMode] = useState("default");
        const [backlogSessionCompletedTaskIds, setBacklogSessionCompletedTaskIds] = useState(() => new Set());
        const [boardToolbarPopover, setBoardToolbarPopover] = useState("");
        const [releaseToolbarPopover, setReleaseToolbarPopover] = useState("");
        const [releaseBacklogToolbarPopover, setReleaseBacklogToolbarPopover] = useState("");
        const [backlogTaskContextMenu, setBacklogTaskContextMenu] = useState(null);
        const [taskStatusMenuState, setTaskStatusMenuState] = useState(null);
        const [taskDetailPopover, setTaskDetailPopover] = useState("");
        const [taskDetailSelectPopover, setTaskDetailSelectPopover] = useState("");
        const [taskDetailThreadSearchQuery, setTaskDetailThreadSearchQuery] = useState("");
        const [taskDetailThreadSortMode, setTaskDetailThreadSortMode] = useState("recent-desc");
        const [taskDetailThreadFilterMode, setTaskDetailThreadFilterMode] = useState("all");
        const [taskDetailThreadToolbarPopover, setTaskDetailThreadToolbarPopover] = useState("");
        const [taskDetailThreadRecords, setTaskDetailThreadRecords] = useState([]);
        const [taskDetailThreadsState, setTaskDetailThreadsState] = useState({
          status: "idle",
          error: "",
        });
        const [taskDetailAssigneePopupMode, setTaskDetailAssigneePopupMode] = useState("agents");
        const [taskSkillsPopoverOpen, setTaskSkillsPopoverOpen] = useState(false);
        const [taskSkillsTab, setTaskSkillsTab] = useState("system");
        const [boardFilterMode, setBoardFilterMode] = useState("all");
        const [releaseFilterMode, setReleaseFilterMode] = useState("all");
        const [releaseSortMode, setReleaseSortMode] = useState("default");
        const [releaseBacklogFilterMode, setReleaseBacklogFilterMode] = useState("open");
        const [releaseBacklogSortMode, setReleaseBacklogSortMode] = useState("default");
        const [tasks, setTasks] = useState([]);
        const [releases, setReleases] = useState([]);
        const [sprints, setSprints] = useState([]);
${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.collectionState}
        const [projectAgentUpgradeModalOpen, setProjectAgentUpgradeModalOpen] = useState(false);
        const [projectAgentUpgradeCheckoutLoading, setProjectAgentUpgradeCheckoutLoading] = useState(false);
${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState}
        const [selectedReleaseId, setSelectedReleaseId] = useState("");
        const [releaseComposerOpen, setReleaseComposerOpen] = useState(false);
        const [releaseComposerVisible, setReleaseComposerVisible] = useState(false);
        const [releaseComposerClosing, setReleaseComposerClosing] = useState(false);
        const [releaseComposerMode, setReleaseComposerMode] = useState("create");
        const [releaseDraft, setReleaseDraft] = useState(buildPlaygroundDefaultReleaseDraft());
        const [releaseSaveState, setReleaseSaveState] = useState({
          isSaving: false,
          error: "",
        });
        const [releaseDeletePending, setReleaseDeletePending] = useState(false);
        const releaseComposerCloseTimerRef = useRef(null);
        const releaseComposerFrameRef = useRef(null);
        const releaseComposerAnimationMs = 75;
        const releaseDescriptionTextareaRef = useRef(null);
        const [isReleaseDescriptionEditing, setIsReleaseDescriptionEditing] = useState(false);
        const [selectedTaskId, setSelectedTaskId] = useState("");
        const [draftTask, setDraftTask] = useState(null);
        const [projectTaskDetailScreenOpen, setProjectTaskDetailScreenOpen] = useState(false);
        const [issueComposerOpen, setIssueComposerOpen] = useState(false);
        const [issueComposerVisible, setIssueComposerVisible] = useState(false);
        const [issueComposerClosing, setIssueComposerClosing] = useState(false);
        const issueComposerCloseTimerRef = useRef(null);
        const issueComposerFrameRef = useRef(null);
        const issueComposerAnimationMs = 75;
        const issueComposerDescriptionTextareaRef = useRef(null);
        const [isIssueComposerDescriptionEditing, setIsIssueComposerDescriptionEditing] = useState(false);
        const [issueComposerEnvironmentPopoverOpen, setIssueComposerEnvironmentPopoverOpen] = useState(false);
        const issueComposerEnvironmentPopoverRef = useRef(null);
        const [issueComposerDetailSelectPopover, setIssueComposerDetailSelectPopover] = useState("");
        const issueComposerDetailSelectPopoverRef = useRef(null);
        const [issueComposerDetailsCollapsed, setIssueComposerDetailsCollapsed] = useState(false);
        const [issueComposerDraft, setIssueComposerDraft] = useState(buildPlaygroundDefaultTaskDraft());
        const [issueComposerSaveState, setIssueComposerSaveState] = useState({
          isSaving: false,
          error: "",
        });
        const [isTaskDescriptionEditing, setIsTaskDescriptionEditing] = useState(false);
        const [taskDetailsCollapsed, setTaskDetailsCollapsed] = useState(false);
        const [taskTitleInputValue, setTaskTitleInputValue] = useState("");
        const [backlogEditingTaskId, setBacklogEditingTaskId] = useState("");
        const [backlogTitleInputValue, setBacklogTitleInputValue] = useState("");
        const [backlogDraggingTaskId, setBacklogDraggingTaskId] = useState("");
        const [backlogDropTargetKey, setBacklogDropTargetKey] = useState("");
        const [backlogReleaseDropTargetId, setBacklogReleaseDropTargetId] = useState("");
        const [boardDraggingTaskId, setBoardDraggingTaskId] = useState("");
        const [boardDropLaneId, setBoardDropLaneId] = useState("");
        const [boardBlockedPickerState, setBoardBlockedPickerState] = useState(null);
        const [taskCommentInputValue, setTaskCommentInputValue] = useState("");
        const [taskCommentMode, setTaskCommentMode] = useState("");
        const [taskCommentComposerOpen, setTaskCommentComposerOpen] = useState(false);
        const [previewedTaskAttachmentId, setPreviewedTaskAttachmentId] = useState("");
        const [taskLoadState, setTaskLoadState] = useState({
          status: "idle",
          error: "",
        });
        const [backlogComposerKey, setBacklogComposerKey] = useState(0);
        const [backlogComposerEnvironmentId, setBacklogComposerEnvironmentId] = useState(initialEnvironmentId || "");
        const [backlogComposerAgentId, setBacklogComposerAgentId] = useState(initialAgentId || "");
        const [backlogComposerSubtaskCommandRequest, setBacklogComposerSubtaskCommandRequest] = useState(null);
        const [backlogComposerMissionControlCommandRequest, setBacklogComposerMissionControlCommandRequest] = useState(null);
        const [missionControlStrategyOpen, setMissionControlStrategyOpen] = useState(false);
	        const missionControlInstructionsTextareaRef = useRef(null);
	        const [missionControlDocumentDraft, setMissionControlDocumentDraft] = useState("");
	        const [missionControlDocumentHistory, setMissionControlDocumentHistory] = useState({ past: [], future: [] });
	        const [missionControlInstructionsDraft, setMissionControlInstructionsDraft] = useState("");
	        const [missionControlStrategyDraft, setMissionControlStrategyDraft] = useState(buildEmptyPlaygroundProjectStrategyBrief());
	        const missionControlStrategyDraftRef = useRef(buildEmptyPlaygroundProjectStrategyBrief());
	        const missionControlStrategyDraftProjectIdRef = useRef("");
	        const selectedProjectMissionControlRef = useRef(buildEmptyPlaygroundProjectMissionControl());
        const [missionControlSetupOutcomesDraft, setMissionControlSetupOutcomesDraft] = useState("");
        const [missionControlSetupOutcomeTitleDrafts, setMissionControlSetupOutcomeTitleDrafts] = useState({});
        const [isMissionControlSetupOutcomesEditing, setIsMissionControlSetupOutcomesEditing] = useState(false);
        const [missionControlSetupOutcomeMenuIndex, setMissionControlSetupOutcomeMenuIndex] = useState(-1);
        const missionControlSetupOutcomeMenuRef = useRef(null);
	        const [projectRulesDraft, setProjectRulesDraft] = useState("");
	        const [projectRuleInputValue, setProjectRuleInputValue] = useState("");
	        const [projectRuleComposerOpen, setProjectRuleComposerOpen] = useState(false);
	        const [projectRulesSaveState, setProjectRulesSaveState] = useState({
	          isSaving: false,
	          error: "",
	        });
	        const [projectRuleComposerVisible, setProjectRuleComposerVisible] = useState(false);
	        const [projectRuleComposerClosing, setProjectRuleComposerClosing] = useState(false);
	        const projectRuleComposerCloseTimerRef = useRef(null);
	        const projectRuleComposerFrameRef = useRef(null);
	        const projectRuleComposerAnimationMs = 75;
	        const [projectRuleEditingIndex, setProjectRuleEditingIndex] = useState(-1);
	        const [projectRuleEditingValue, setProjectRuleEditingValue] = useState("");
	        const [isMissionControlDocumentEditing, setIsMissionControlDocumentEditing] = useState(false);
	        const [isMissionControlInstructionsEditing, setIsMissionControlInstructionsEditing] = useState(false);
	        const [isProjectRulesEditing, setIsProjectRulesEditing] = useState(false);
        const [missionControlDetailsCollapsed, setMissionControlDetailsCollapsed] = useState(false);
        const [missionControlCommentInputValue, setMissionControlCommentInputValue] = useState("");
        const [missionControlSaveState, setMissionControlSaveState] = useState({
          isSaving: false,
          error: "",
          message: "",
        });
        const [pendingNavigationMissionControlRequest, setPendingNavigationMissionControlRequest] = useState(null);
        const [pendingNavigationProjectComposerRequest, setPendingNavigationProjectComposerRequest] = useState(null);
        const [projectConnectorBrowserDialog, setProjectConnectorBrowserDialog] = useState(null);
        const [missionControlRunState, setMissionControlRunState] = useState({
          threadId: "",
          projectId: "",
          status: "idle",
          error: "",
        });
        const missionControlAgentSavePromiseRef = useRef(null);
        const [missionControlSetupOpen, setMissionControlSetupOpen] = useState(false);
        const [missionControlSetupVisible, setMissionControlSetupVisible] = useState(false);
        const [missionControlSetupClosing, setMissionControlSetupClosing] = useState(false);
        const missionControlSetupCloseTimerRef = useRef(null);
        const missionControlSetupFrameRef = useRef(null);
        const missionControlSetupCommitInFlightRef = useRef(false);
        const missionControlSetupAnimationMs = 75;
        const [missionControlSetupResetToken, setMissionControlSetupResetToken] = useState(0);
        const [missionControlAgent, setMissionControlAgent] = useState(null);
        const [missionControlAgentPreparing, setMissionControlAgentPreparing] = useState(false);
        const [missionControlAgentError, setMissionControlAgentError] = useState("");
        const [pendingExternalTaskOpenRequest, setPendingExternalTaskOpenRequest] = useState(null);
        const [searchQuery, setSearchQuery] = useState("");
        const [boardSprintId, setBoardSprintId] = useState(PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID);
        const [saveState, setSaveState] = useState({
          isSaving: false,
          error: "",
          message: "",
        });
        const [taskRunPendingIds, setTaskRunPendingIds] = useState([]);
        const [taskAgentReviewStartPendingId, setTaskAgentReviewStartPendingId] = useState("");
        const [taskAttachmentTransferState, setTaskAttachmentTransferState] = useState({
          uploadingIds: [],
          error: "",
          isProcessing: false,
        });
        const [isTaskAttachmentDragging, setIsTaskAttachmentDragging] = useState(false);
        const [taskEnvironmentFilePickerOpen, setTaskEnvironmentFilePickerOpen] = useState(false);
        const [taskEnvironmentFilePickerInventory, setTaskEnvironmentFilePickerInventory] = useState([]);
        const [taskEnvironmentFilePickerState, setTaskEnvironmentFilePickerState] = useState({
          status: "idle",
          error: "",
        });
        const [taskEnvironmentFilePickerSearch, setTaskEnvironmentFilePickerSearch] = useState("");
        const [taskEnvironmentFilePickerExpandedFolders, setTaskEnvironmentFilePickerExpandedFolders] = useState([]);
        const [taskEnvironmentFilePickerSelectedPaths, setTaskEnvironmentFilePickerSelectedPaths] = useState([]);
        const [taskEnvironmentChangeDialog, setTaskEnvironmentChangeDialog] = useState(null);
        const [taskDeleteDialogState, setTaskDeleteDialogState] = useState(null);
        const [taskScheduleDialogState, setTaskScheduleDialogState] = useState(null);
        const [taskScheduleDialogPhase, setTaskScheduleDialogPhase] = useState("idle");
        const [taskParentPickerState, setTaskParentPickerState] = useState(null);
        const [taskConnectorBrowserOpen, setTaskConnectorBrowserOpen] = useState(false);
        const [taskConnectorBrowserRenderKey, setTaskConnectorBrowserRenderKey] = useState(0);
        const [taskConnectorBrowserMode, setTaskConnectorBrowserMode] = useState("task");
        const [taskConnectorBrowserHistory, setTaskConnectorBrowserHistory] = useState([{ source: "github", folderId: null }]);
        const [taskConnectorBrowserHistoryIndex, setTaskConnectorBrowserHistoryIndex] = useState(0);
        const [taskConnectorBrowserSearchQuery, setTaskConnectorBrowserSearchQuery] = useState("");
        const [taskConnectorBrowserPreviewId, setTaskConnectorBrowserPreviewId] = useState("");
        const [taskConnectorBrowserExpandedFolderIds, setTaskConnectorBrowserExpandedFolderIds] = useState([]);
        const [taskConnectorBrowserSelectedIds, setTaskConnectorBrowserSelectedIds] = useState({
          github: [],
          googleDrive: [],
          oneDrive: [],
        });
        const [taskConnectorBrowserSelectedNotionId, setTaskConnectorBrowserSelectedNotionId] = useState("");
        const [taskConnectorBrowserItemsBySource, setTaskConnectorBrowserItemsBySource] = useState({
          github: [],
          googleDrive: [],
          oneDrive: [],
        });
        const [taskConnectorBrowserLoadedFolderIds, setTaskConnectorBrowserLoadedFolderIds] = useState({
          github: [],
          googleDrive: [],
          oneDrive: [],
        });
        const [taskConnectorBrowserLoadingFolderIds, setTaskConnectorBrowserLoadingFolderIds] = useState({
          github: [],
          googleDrive: [],
          oneDrive: [],
        });
        const [taskConnectorBrowserLoadingState, setTaskConnectorBrowserLoadingState] = useState({
          github: false,
          googleDrive: false,
          oneDrive: false,
          notion: false,
        });
        const [taskConnectorBrowserErrors, setTaskConnectorBrowserErrors] = useState({
          github: "",
          googleDrive: "",
          oneDrive: "",
          notion: "",
        });
        const [taskConnectorBrowserNotionDatabases, setTaskConnectorBrowserNotionDatabases] = useState([]);
        const [taskConnectorBrowserNotionDatabasesLoaded, setTaskConnectorBrowserNotionDatabasesLoaded] = useState(false);
        const [taskConnectorBrowserPreviewState, setTaskConnectorBrowserPreviewState] = useState({
          status: "idle",
          kind: "",
          content: "",
          error: "",
        });
        const projectConnectorBrowserActiveRef = useRef(false);
        const [projectCustomSkills, setProjectCustomSkills] = useState([]);
        const [projectCustomSkillsLoading, setProjectCustomSkillsLoading] = useState(false);
	        const [sprintComposerOpen, setSprintComposerOpen] = useState(false);
	        const [sprintDraft, setSprintDraft] = useState(buildPlaygroundDefaultSprintDraft());
	        const projectOverviewHistoryClient = useMemo(() => new RunnerClient(), []);
	        const requestHeadersKey = useMemo(() => {
	          if (!requestHeaders || typeof requestHeaders !== "object") {
	            return "";
	          }
	          try {
	            const entries = typeof Headers !== "undefined" && requestHeaders instanceof Headers
              ? Array.from(requestHeaders.entries())
              : Object.keys(requestHeaders)
                .sort()
                .map((key) => [key, requestHeaders[key]]);
	            return entries
              .map(([key, value]) => String(key || "").toLowerCase() + ":" + String(value || ""))
              .sort()
              .join("\\n");
	          } catch {
	            return "";
	          }
	        }, [requestHeaders]);

	        const sortedAgents = useMemo(() => {
          return [...agents].sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));
        }, [agents]);

        const humanAssigneeOptions = useMemo(() => [buildPlaygroundHumanAssigneeOption()], []);
        const assignableActors = useMemo(() => [...sortedAgents, ...humanAssigneeOptions], [humanAssigneeOptions, sortedAgents]);
        const taskDetailAvailableAssigneePopupModes = useMemo(() => {
          const nextModes = [];
          assignableActors.forEach((actor) => {
            const nextMode = getPlaygroundTaskAssigneePopupMode(actor);
            if (!nextModes.includes(nextMode)) {
              nextModes.push(nextMode);
            }
          });
          return nextModes.length > 0 ? nextModes : ["agents"];
        }, [assignableActors]);
        const filteredTaskDetailAssignableActors = useMemo(() => {
          return assignableActors.filter((actor) => getPlaygroundTaskAssigneePopupMode(actor) === taskDetailAssigneePopupMode);
        }, [assignableActors, taskDetailAssigneePopupMode]);

        const agentsById = useMemo(() => {
          const next = {};
          sortedAgents.forEach((agent) => {
            if (!agent?.id) return;
            next[agent.id] = agent;
          });
          return next;
        }, [sortedAgents]);

        const assignableActorsById = useMemo(() => {
          const next = {};
          assignableActors.forEach((actor) => {
            if (!actor?.id) return;
            next[actor.id] = actor;
          });
          return next;
        }, [assignableActors]);

        const defaultTaskAssigneeId = useMemo(() => {
          if (backlogComposerAgentId && assignableActorsById[backlogComposerAgentId] && !isPlaygroundHumanAssigneeId(backlogComposerAgentId)) {
            return backlogComposerAgentId;
          }
          if (initialAgentId && assignableActorsById[initialAgentId] && !isPlaygroundHumanAssigneeId(initialAgentId)) {
            return initialAgentId;
          }
          const preferredDefaultAgent = getPlaygroundPreferredDefaultAgent(sortedAgents);
          if (preferredDefaultAgent?.id) {
            return preferredDefaultAgent.id;
          }
          return sortedAgents[0]?.id || "";
        }, [assignableActorsById, backlogComposerAgentId, initialAgentId, sortedAgents]);

        function getTaskAssigneeName(assigneeId, fallback = "") {
          const normalizedAssigneeId = String(assigneeId || "").trim();
          if (!normalizedAssigneeId) {
            return fallback;
          }
          if (isPlaygroundHumanAssigneeId(normalizedAssigneeId)) {
            return "Me";
          }
          return assignableActorsById[normalizedAssigneeId]?.name || fallback || normalizedAssigneeId;
        }

        function getTaskAssigneeOptionLabel(option) {
          if (!option?.id) {
            return "Unknown";
          }
          if (isPlaygroundHumanAssigneeId(option.id)) {
            return "Me";
          }
          return option.name + (getPlaygroundAgentListMode(option) === "teams" ? " (Team)" : "");
        }

        function isHumanAssignedTask(task) {
          return isPlaygroundHumanAssigneeId(task?.assigneeAgentId);
        }

        const projectsById = useMemo(() => {
          const next = {};
          projects.forEach((project) => {
            if (!project?.id) return;
            next[project.id] = project;
          });
          return next;
        }, [projects]);

        const selectedProjectSnapshot = useMemo(() => {
          if (!selectedProjectId) return null;
          return projectsById[selectedProjectId] || null;
        }, [projectsById, selectedProjectId]);

        const selectedProject = useMemo(() => {
          if (!selectedProjectId) return null;
          if (selectedProjectDetail?.project?.id === selectedProjectId) {
            return selectedProjectDetail.project;
          }
          return selectedProjectSnapshot;
        }, [selectedProjectDetail, selectedProjectId, selectedProjectSnapshot]);

        const selectedProjectWorkspaceTitle = useMemo(() => {
          if (!selectedProject) {
            return "Project";
          }
          if (
            missionControlSetupOpen
            && projectComposerOpen
            && projectComposerMode === "edit"
            && projectDraft?.id === selectedProject.id
          ) {
            return String(projectDraft.name || "").trim() || selectedProject.name || "Project";
          }
          return selectedProject.name || "Project";
        }, [
          missionControlSetupOpen,
          projectComposerMode,
          projectComposerOpen,
          projectDraft?.id,
          projectDraft?.name,
          selectedProject,
        ]);

        function setProjectDescriptionEditing(nextEditing) {
          const normalizedEditing = Boolean(nextEditing);
          projectDescriptionEditingRef.current = normalizedEditing;
          setIsProjectDescriptionEditing(normalizedEditing);
        }

        useEffect(() => {
          if (projectComposerOpen || !selectedProject?.id) {
            return;
          }

          const shouldResetProjectDescriptionEditing = projectDraft?.id !== selectedProject.id;
          setProjectDraft((current) => {
            const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
            const projectIndex = projects.findIndex((project) => project.id === normalizedProject.id);
            const wallpaperConfig = getPlaygroundProjectWallpaperConfig(selectedProject, projectIndex >= 0 ? projectIndex : 0);
            if (current?.id === selectedProject.id) {
              if (projectDescriptionEditingRef.current || String(current.description || "") === String(normalizedProject.description || "")) {
                return current;
              }
              return {
                ...current,
                ...normalizedProject,
                wallpaperId: getPlaygroundProjectWallpaperId(normalizedProject.wallpaperId, wallpaperConfig.id),
              };
            }
            return {
              ...normalizedProject,
              wallpaperId: getPlaygroundProjectWallpaperId(normalizedProject.wallpaperId, wallpaperConfig.id),
            };
          });
          if (shouldResetProjectDescriptionEditing) {
            setProjectDescriptionEditing(false);
            setProjectDescriptionHistory({ past: [], future: [] });
          }
        }, [
          projectDraft?.id,
          projectComposerOpen,
          projects,
          selectedProject?.description,
          selectedProject?.id,
          selectedProject?.metadata,
          selectedProject?.name,
          selectedProject?.useCardBackgroundAsWallpaper,
          selectedProject?.wallpaperId,
        ]);

        const selectedProjectShellBackground = useMemo(() => "", []);

        const selectedProjectSummary = useMemo(() => {
          const baseSummary = selectedProjectDetail?.project?.id === selectedProjectId
            ? selectedProjectDetail.summary
            : selectedProject?.summary;
          const nextSummary = {
            ...buildEmptyPlaygroundProjectSummary(),
            ...(baseSummary && typeof baseSummary === "object" ? baseSummary : {}),
          };

          if (selectedProjectId && taskLoadState.status === "ready") {
            nextSummary.tasksCount = tasks.length;
            nextSummary.openTasksCount = tasks.filter((task) => task.status !== "done").length;
            nextSummary.releaseCount = releases.length;
            nextSummary.activeReleaseCount = releases.filter((release) => getPlaygroundTaskReleaseStatus(release) === "active").length;
            nextSummary.sprintCount = sprints.length;
            nextSummary.activeSprintCount = sprints.filter((sprint) => sprint.status === "active").length;
          }

          return nextSummary;
        }, [releases, selectedProject, selectedProjectDetail, selectedProjectId, sprints, taskLoadState.status, tasks]);
        const selectedProjectTaskStatusOverview = useMemo(() => {
          if (selectedProjectId && taskLoadState.status === "ready") {
            const total = tasks.length;
            const backlog = tasks.filter((task) => {
              const status = String(task?.status || "").trim();
              return status === "backlog" || status === "todo";
            }).length;
            const inProgress = tasks.filter((task) => {
              const status = String(task?.status || "").trim();
              return status === "in_progress" || status === "blocked";
            }).length;
            const done = tasks.filter((task) => String(task?.status || "").trim() === "done").length;
            return {
              total,
              backlog,
              inProgress,
              done,
            };
          }

          return {
            total: Number(selectedProjectSummary.tasksCount) || 0,
            backlog: 0,
            inProgress: 0,
            done: 0,
          };
        }, [selectedProjectId, selectedProjectSummary.tasksCount, taskLoadState.status, tasks]);
        const selectedProjectMissionControl = useMemo(() => {
          return getPlaygroundProjectMissionControlRecord(selectedProject);
        }, [selectedProject]);
	        const selectedProjectMissionInstructions = useMemo(() => {
	          return getPlaygroundProjectMissionInstructions(selectedProject);
	        }, [selectedProject]);
	        const selectedProjectStrategyBrief = useMemo(() => {
	          return getPlaygroundProjectStrategyBriefRecord(selectedProject);
	        }, [selectedProject]);
	        const selectedProjectRules = useMemo(() => {
	          return getPlaygroundProjectRules(selectedProject);
	        }, [selectedProject]);
	        const selectedProjectMissionComments = useMemo(() => {
          return normalizePlaygroundTaskCommentList(selectedProjectMissionControl.comments);
        }, [selectedProjectMissionControl.comments]);
	        useEffect(() => {
	          selectedProjectMissionControlRef.current = selectedProjectMissionControl;
	        }, [selectedProjectMissionControl]);
	        useEffect(() => {
	          missionControlStrategyDraftRef.current = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft);
	        }, [missionControlStrategyDraft]);
        const isSelectedProjectMissionControlRunning = missionControlRunState.projectId === selectedProjectId
          && (missionControlRunState.status === "running" || missionControlRunState.status === "syncing");

        useEffect(() => {
          setMissionControlSetupOpen(false);
          setMissionControlAgentError("");
        }, [selectedProjectId]);

        useEffect(() => {
          if (typeof document === "undefined" || isDetailOnlyMode) {
            return undefined;
          }
          const rootStyle = document.documentElement.style;
          const fallbackBackground = "#000000";
          rootStyle.setProperty("--playground-app-bg", fallbackBackground);
          return () => {
            rootStyle.setProperty("--playground-app-bg", fallbackBackground);
          };
        }, [isDetailOnlyMode]);

        const selectedProjectEnvironments = useMemo(() => {
          return selectedProjectDetail?.project?.id === selectedProjectId
            ? selectedProjectDetail.environments
            : [];
        }, [selectedProjectDetail, selectedProjectId]);

        const availableBacklogEnvironments = useMemo(() => {
          const sourceItems = environments.length > 0
            ? environments
            : selectedProjectEnvironments;
          const defaultEnvironmentId = selectedProject?.defaultEnvironmentId || "";
          return sourceItems.map((environment) => ({
            ...environment,
            ...(defaultEnvironmentId && environment.id === defaultEnvironmentId ? { isDefault: true } : {}),
          }));
        }, [environments, selectedProject?.defaultEnvironmentId, selectedProjectEnvironments]);
        const projectComposerBaseEnvironments = useMemo(() => {
          const sourceItems = environments.length > 0
            ? environments
            : selectedProjectEnvironments;
          return sourceItems;
        }, [environments, selectedProjectEnvironments]);
        const projectComposerDefaultEnvironmentId = useMemo(() => {
          return projectComposerBaseEnvironments.find((environment) => environment?.isDefault)?.id
            || projectComposerBaseEnvironments[0]?.id
            || "";
        }, [projectComposerBaseEnvironments]);
        const projectComposerAvailableEnvironments = useMemo(() => {
          const draftEnvironmentId = typeof projectDraft?.defaultEnvironmentId === "string"
            ? projectDraft.defaultEnvironmentId.trim()
            : "";
          return projectComposerBaseEnvironments.map((environment) => ({
            ...environment,
            ...(draftEnvironmentId && environment.id === draftEnvironmentId ? { isDefault: true } : {}),
          }));
        }, [projectComposerBaseEnvironments, projectDraft?.defaultEnvironmentId]);

        const environmentsById = useMemo(() => {
          const next = {};
          availableBacklogEnvironments.forEach((environment) => {
            if (!environment?.id) return;
            next[environment.id] = environment;
          });
          return next;
        }, [availableBacklogEnvironments]);

        const backlogComposerEnvironments = useMemo(() => {
          return availableBacklogEnvironments.map((environment) => ({
            ...environment,
            ...(backlogComposerEnvironmentId && environment.id === backlogComposerEnvironmentId ? { isDefault: true } : {}),
          }));
        }, [availableBacklogEnvironments, backlogComposerEnvironmentId]);

        function getDefaultIssueComposerEnvironmentId() {
          const projectDefaultEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(selectedProject);
          if (projectDefaultEnvironmentId && availableBacklogEnvironments.some((environment) => environment.id === projectDefaultEnvironmentId)) {
            return projectDefaultEnvironmentId;
          }
          return availableBacklogEnvironments.find((environment) => environment.isDefault)?.id
            || availableBacklogEnvironments[0]?.id
            || "";
        }

        function buildProjectIssueComposerDraft() {
          const now = new Date().toISOString();
          return normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...buildPlaygroundDefaultTaskDraft(),
            projectId: selectedProjectId || selectedProject?.id || null,
            title: "",
            description: "",
            taskType: "task",
            parentTaskId: null,
            status: "todo",
            priority: "medium",
            taskColor: PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
            releaseId: selectedReleaseId || null,
            sprintId: null,
            assigneeAgentId: defaultTaskAssigneeId || null,
            reviewRequired: false,
            reviewerAgentId: null,
            environmentId: getDefaultIssueComposerEnvironmentId() || null,
            dependencyIds: [],
            scheduledStartAt: null,
            scheduledEndAt: null,
            scheduleType: "one-time",
            cronExpression: null,
            dueAt: null,
            sortOrder: Date.now(),
            createdAt: now,
            updatedAt: now,
            metadata: {
              runnerPlayground: {
                source: "manual_issue_composer",
              },
            },
          }));
        }

        function openProjectIssueComposer() {
          if (!selectedProjectId && !selectedProject?.id) {
            return false;
          }
          if (issueComposerCloseTimerRef.current) {
            window.clearTimeout(issueComposerCloseTimerRef.current);
            issueComposerCloseTimerRef.current = null;
          }
          if (issueComposerFrameRef.current) {
            window.cancelAnimationFrame(issueComposerFrameRef.current);
            issueComposerFrameRef.current = null;
          }
          setIssueComposerVisible(false);
          setIssueComposerClosing(false);
          setProjectSidebarPopover("");
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setIsIssueComposerDescriptionEditing(false);
          setIssueComposerEnvironmentPopoverOpen(false);
          setIssueComposerDetailSelectPopover("");
          setIssueComposerDetailsCollapsed(false);
          setIssueComposerDraft(buildProjectIssueComposerDraft());
          setIssueComposerSaveState({
            isSaving: false,
            error: "",
          });
          setIssueComposerOpen(true);
          issueComposerFrameRef.current = window.requestAnimationFrame(() => {
            issueComposerFrameRef.current = window.requestAnimationFrame(() => {
              issueComposerFrameRef.current = null;
              setIssueComposerVisible(true);
            });
          });
          return true;
        }

        function finishCloseProjectIssueComposer() {
          if (issueComposerCloseTimerRef.current) {
            window.clearTimeout(issueComposerCloseTimerRef.current);
            issueComposerCloseTimerRef.current = null;
          }
          if (issueComposerFrameRef.current) {
            window.cancelAnimationFrame(issueComposerFrameRef.current);
            issueComposerFrameRef.current = null;
          }
          setIssueComposerVisible(false);
          setIssueComposerClosing(false);
          setIssueComposerOpen(false);
          setIsIssueComposerDescriptionEditing(false);
          setIssueComposerEnvironmentPopoverOpen(false);
          setIssueComposerDetailSelectPopover("");
          setIssueComposerDetailsCollapsed(false);
          setIssueComposerDraft(buildPlaygroundDefaultTaskDraft());
          setIssueComposerSaveState({
            isSaving: false,
            error: "",
          });
        }

        function closeProjectIssueComposer(options = {}) {
          if (issueComposerSaveState.isSaving) {
            return;
          }
          if (options?.animate === false) {
            finishCloseProjectIssueComposer();
            return;
          }
          if (issueComposerClosing) {
            return;
          }
          setIssueComposerVisible(false);
          setIssueComposerClosing(true);
          if (issueComposerCloseTimerRef.current) {
            window.clearTimeout(issueComposerCloseTimerRef.current);
          }
          issueComposerCloseTimerRef.current = window.setTimeout(() => {
            issueComposerCloseTimerRef.current = null;
            finishCloseProjectIssueComposer();
          }, issueComposerAnimationMs);
        }

        function updateIssueComposerDraft(updater) {
          setIssueComposerDraft((current) => normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata(
            typeof updater === "function" ? updater(current) : updater
          )));
          setIssueComposerSaveState((current) => ({
            ...current,
            error: "",
          }));
        }

        function updateIssueComposerField(field, value) {
          updateIssueComposerDraft((current) => ({
            ...current,
            [field]: value,
          }));
        }

        function applyIssueComposerDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateIssueComposerField("description", nextValue);
          window.requestAnimationFrame(() => {
            const textarea = issueComposerDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleIssueComposerDescriptionFormat(formatType) {
          const textarea = issueComposerDescriptionTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(issueComposerDraft?.description || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyIssueComposerDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        useEffect(() => {
          if (!useUnifiedProjectNav || typeof onProjectIssueCreateHandlerChange !== "function") {
            return undefined;
          }
          onProjectIssueCreateHandlerChange(() => openProjectIssueComposer());
          return () => {
            onProjectIssueCreateHandlerChange(null);
          };
        }, [onProjectIssueCreateHandlerChange, selectedProject?.id, selectedProjectId, useUnifiedProjectNav]);

        const projectAttachmentHostRecord = missionControlStrategyOpen
          ? selectedProject
          : ((projectComposerOpen || !selectedProject) ? projectDraft : selectedProject);
        const activeProjectAttachmentEnvironmentId = typeof projectAttachmentHostRecord?.defaultEnvironmentId === "string"
          ? projectAttachmentHostRecord.defaultEnvironmentId.trim()
          : "";
        const activeProjectAttachmentEnvironment = useMemo(() => {
          if (!activeProjectAttachmentEnvironmentId) {
            return null;
          }
          return projectComposerAvailableEnvironments.find((environment) => environment.id === activeProjectAttachmentEnvironmentId) || null;
        }, [activeProjectAttachmentEnvironmentId, projectComposerAvailableEnvironments]);

        useEffect(() => {
          const shouldOpenProjectFilesGlobally = projectOverviewHomeTab === "files" || projectOverviewFilesSubview === "files";
          if (!shouldOpenProjectFilesGlobally) {
            return;
          }
          if (projectOverviewHomeTab === "files") {
            setProjectOverviewHomeTab("general");
          }
          if (projectOverviewFilesSubview === "files") {
            setProjectOverviewFilesSubview("overview");
          }
          if (typeof onOpenFilesPage !== "function") {
            return;
          }
          const normalizedProjectId = String(
            selectedProjectId
            || selectedProject?.id
            || projectAttachmentHostRecord?.id
            || projectDraft?.id
            || ""
          ).trim();
          const normalizedProjectName = String(
            selectedProject?.name
            || projectAttachmentHostRecord?.name
            || projectDraft?.name
            || ""
          ).trim();
          const normalizedEnvironmentId = String(
            activeProjectAttachmentEnvironmentId
            || selectedProject?.defaultEnvironmentId
            || projectAttachmentHostRecord?.defaultEnvironmentId
            || projectDraft?.defaultEnvironmentId
            || ""
          ).trim();
          onOpenFilesPage({
            token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            projectId: normalizedProjectId,
            projectName: normalizedProjectName,
            environmentId: normalizedEnvironmentId,
          });
        }, [
          activeProjectAttachmentEnvironmentId,
          onOpenFilesPage,
          projectOverviewHomeTab,
          projectOverviewFilesSubview,
          projectAttachmentHostRecord?.defaultEnvironmentId,
          projectAttachmentHostRecord?.id,
          projectAttachmentHostRecord?.name,
          projectDraft?.defaultEnvironmentId,
          projectDraft?.id,
          projectDraft?.name,
          selectedProject?.defaultEnvironmentId,
          selectedProject?.id,
          selectedProject?.name,
          selectedProjectId,
        ]);

        const isCalendarScheduleDetailMode = Boolean(!draftTask && isCalendarContext && scheduleViewMode === "setup");
        const projectWallpaperActive = !isStandaloneCalendarMode && Boolean(selectedProjectShellBackground);

        const activeTaskEnvironmentId = useMemo(() => {
          return String(
            draftTask?.environmentId
            || (isCalendarScheduleDetailMode ? scheduleDraft?.environmentId : "")
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || ""
          ).trim();
        }, [backlogComposerEnvironmentId, draftTask?.environmentId, initialEnvironmentId, isCalendarScheduleDetailMode, scheduleDraft?.environmentId]);

        const activeTaskEnvironment = useMemo(() => {
          return activeTaskEnvironmentId ? environmentsById[activeTaskEnvironmentId] || null : null;
        }, [activeTaskEnvironmentId, environmentsById]);

        const taskConnectorConfigByKey = useMemo(() => ({
          github: computerAgents?.github || null,
          googleDrive: computerAgents?.googleDrive || null,
          oneDrive: computerAgents?.oneDrive || null,
          notion: computerAgents?.notion || null,
        }), [computerAgents]);

        const taskConnectorBrowserCurrentEntry = useMemo(() => {
          return taskConnectorBrowserHistory[taskConnectorBrowserHistoryIndex] || { source: "github", folderId: null };
        }, [taskConnectorBrowserHistory, taskConnectorBrowserHistoryIndex]);

        const taskConnectorBrowserCurrentSource = getPlaygroundTaskConnectorSource(taskConnectorBrowserCurrentEntry?.source) || "github";
        const taskConnectorBrowserCurrentKey = getPlaygroundTaskConnectorKey(taskConnectorBrowserCurrentSource) || "github";
        const taskConnectorBrowserCurrentFolderId = taskConnectorBrowserCurrentEntry?.folderId || null;
        const taskConnectorBrowserCurrentOption = getPlaygroundTaskConnectorOption(taskConnectorBrowserCurrentSource) || PLAYGROUND_TASK_CONNECTOR_OPTIONS[0];
        const taskConnectorBrowserCurrentConfig = taskConnectorConfigByKey[taskConnectorBrowserCurrentKey] || null;
        const isProjectComposerConnectorBrowserContext = taskConnectorBrowserMode === "project-composer";
        const isProjectConnectorBrowserContext = Boolean(projectConnectorBrowserDialog)
          || projectConnectorBrowserActiveRef.current
          || taskConnectorBrowserMode === "project"
          || isProjectComposerConnectorBrowserContext;

        useEffect(() => {
          console.info("[connector-debug] connector browser state", {
            open: taskConnectorBrowserOpen,
            mode: taskConnectorBrowserMode,
            currentSource: taskConnectorBrowserCurrentSource,
            currentKey: taskConnectorBrowserCurrentKey,
            renderKey: taskConnectorBrowserRenderKey,
            isProjectConnectorBrowserContext,
            projectConnectorDialog: projectConnectorBrowserDialog,
            projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
            selectedProjectId,
            selectedProjectRecordId: selectedProject?.id || "",
            taskView,
            selectedTaskId,
            currentConnectorConnected: Boolean(taskConnectorBrowserCurrentConfig?.connected),
            githubConnected: Boolean(taskConnectorConfigByKey.github?.connected),
          });
        }, [
          isProjectConnectorBrowserContext,
          projectConnectorBrowserDialog,
          selectedProject?.id,
          selectedProjectId,
          selectedTaskId,
          taskConnectorBrowserCurrentConfig?.connected,
          taskConnectorBrowserCurrentKey,
          taskConnectorBrowserCurrentSource,
          taskConnectorBrowserMode,
          taskConnectorBrowserOpen,
          taskConnectorBrowserRenderKey,
          taskConnectorConfigByKey.github?.connected,
          taskView,
        ]);

        const taskConnectorBrowserItems = useMemo(() => {
          if (taskConnectorBrowserCurrentKey === "notion") {
            return notionDatabasesToPlaygroundConnectorItems(taskConnectorBrowserNotionDatabases);
          }
          return taskConnectorBrowserItemsBySource[taskConnectorBrowserCurrentKey] || [];
        }, [taskConnectorBrowserCurrentKey, taskConnectorBrowserItemsBySource, taskConnectorBrowserNotionDatabases]);

        const taskConnectorBrowserSelectedFileIds = taskConnectorBrowserCurrentKey === "notion"
          ? (taskConnectorBrowserSelectedNotionId ? [taskConnectorBrowserSelectedNotionId] : [])
          : (taskConnectorBrowserSelectedIds[taskConnectorBrowserCurrentKey] || []);

        const taskConnectorBrowserPath = useMemo(() => {
          return childFolderPath(
            taskConnectorBrowserItems,
            taskConnectorBrowserCurrentOption.rootLabel,
            taskConnectorBrowserCurrentFolderId
          );
        }, [
          taskConnectorBrowserCurrentFolderId,
          taskConnectorBrowserCurrentOption.rootLabel,
          taskConnectorBrowserItems,
        ]);

        const taskConnectorBrowserVisibleItems = useMemo(() => {
          return fileItemsForParent(taskConnectorBrowserItems, taskConnectorBrowserCurrentFolderId);
        }, [taskConnectorBrowserCurrentFolderId, taskConnectorBrowserItems]);

        const taskConnectorBrowserFilteredItems = useMemo(() => {
          const searchValue = taskConnectorBrowserSearchQuery.trim().toLowerCase();
          if (!searchValue) {
            return taskConnectorBrowserVisibleItems;
          }
          return taskConnectorBrowserVisibleItems.filter((item) =>
            String(item?.name || "").toLowerCase().includes(searchValue)
          );
        }, [taskConnectorBrowserSearchQuery, taskConnectorBrowserVisibleItems]);

        const taskConnectorBrowserPreviewItem = useMemo(() => {
          return taskConnectorBrowserItems.find((item) => item.id === taskConnectorBrowserPreviewId) || null;
        }, [taskConnectorBrowserItems, taskConnectorBrowserPreviewId]);

        const taskConnectorBrowserCurrentSelection = useMemo(() => {
          return getDraftTaskConnectorSelection(
            taskConnectorBrowserCurrentSource,
            isProjectComposerConnectorBrowserContext
              ? projectDraft
              : isProjectConnectorBrowserContext
              ? selectedProject
              : (isCalendarScheduleDetailMode ? scheduleDraft : draftTask)
          );
        }, [draftTask, isCalendarScheduleDetailMode, isProjectComposerConnectorBrowserContext, isProjectConnectorBrowserContext, projectDraft, scheduleDraft, selectedProject, taskConnectorBrowserCurrentSource]);

        const taskConnectorBrowserSelectedItems = useMemo(() => {
          return resolvePlaygroundTaskConnectorSelectedItems(
            taskConnectorBrowserItems,
            taskConnectorBrowserCurrentSelection,
            taskConnectorBrowserSelectedFileIds
          );
        }, [taskConnectorBrowserCurrentSelection, taskConnectorBrowserItems, taskConnectorBrowserSelectedFileIds]);

        const taskConnectorBrowserSelectedLabel = useMemo(() => {
          if (taskConnectorBrowserCurrentSource === "notion" && taskConnectorBrowserSelectedItems.length > 0) {
            return taskConnectorBrowserSelectedItems[0]?.id === "__entire_workspace__"
              ? "workspace"
              : taskConnectorBrowserSelectedItems.length + " " + (taskConnectorBrowserSelectedItems.length === 1 ? "database" : "databases");
          }
          if (taskConnectorBrowserSelectedItems.length === 1) {
            return taskConnectorBrowserSelectedItems[0].isFolder ? "1 item" : "1 file";
          }
          return taskConnectorBrowserSelectedItems.length + " " + (taskConnectorBrowserSelectedItems.length === 1 ? "file" : "files");
        }, [taskConnectorBrowserCurrentSource, taskConnectorBrowserSelectedItems]);

        const taskEnvironmentFilePickerExpandedSet = useMemo(() => {
          return new Set(taskEnvironmentFilePickerExpandedFolders);
        }, [taskEnvironmentFilePickerExpandedFolders]);

        const taskEnvironmentFilePickerTree = useMemo(() => {
          return buildPlaygroundEnvironmentTree(taskEnvironmentFilePickerInventory);
        }, [taskEnvironmentFilePickerInventory]);

        const taskEnvironmentFilePickerRows = useMemo(() => {
          const searchValue = taskEnvironmentFilePickerSearch.trim().toLowerCase();
          if (searchValue) {
            return buildPlaygroundEnvironmentSearchRows(taskEnvironmentFilePickerInventory, searchValue, {
              filesOnly: true,
            });
          }
          return buildPlaygroundEnvironmentVisibleRows(
            taskEnvironmentFilePickerTree,
            "",
            taskEnvironmentFilePickerExpandedSet
          ).map((row) => ({ ...row, searchMatch: false }));
        }, [
          taskEnvironmentFilePickerExpandedSet,
          taskEnvironmentFilePickerInventory,
          taskEnvironmentFilePickerSearch,
          taskEnvironmentFilePickerTree,
        ]);

        const projectEnvironmentFilePickerExpandedSet = useMemo(() => {
          return new Set(projectEnvironmentFilePickerExpandedFolders);
        }, [projectEnvironmentFilePickerExpandedFolders]);

        const projectEnvironmentFilePickerTree = useMemo(() => {
          return buildPlaygroundEnvironmentTree(projectEnvironmentFilePickerInventory);
        }, [projectEnvironmentFilePickerInventory]);

        const projectEnvironmentFilePickerRows = useMemo(() => {
          const searchValue = projectEnvironmentFilePickerSearch.trim().toLowerCase();
          if (searchValue) {
            return buildPlaygroundEnvironmentSearchRows(projectEnvironmentFilePickerInventory, searchValue, {
              filesOnly: false,
            });
          }
          return buildPlaygroundEnvironmentVisibleRows(
            projectEnvironmentFilePickerTree,
            "",
            projectEnvironmentFilePickerExpandedSet
          ).map((row) => ({ ...row, searchMatch: false }));
        }, [
          projectEnvironmentFilePickerExpandedSet,
          projectEnvironmentFilePickerInventory,
          projectEnvironmentFilePickerSearch,
          projectEnvironmentFilePickerTree,
        ]);

        const effectiveBacklogComposerAgentId = useMemo(() => {
          const normalizedAgentId = String(backlogComposerAgentId || "").trim();
          if (normalizedSubscriptionTierId !== "free") {
            return normalizedAgentId;
          }
          const selectedAgent = assignableActors.find((agent) => String(agent?.id || "").trim() === normalizedAgentId) || null;
          if (selectedAgent && !isPlaygroundFreePlanLockedComposerAgent(selectedAgent)) {
            return normalizedAgentId;
          }
          const sparkAgent = assignableActors.find((agent) => isPlaygroundAssistantAgent(agent));
          const selectableAgent = assignableActors.find((agent) => !isPlaygroundFreePlanLockedComposerAgent(agent));
          return String((sparkAgent || selectableAgent || assignableActors[0])?.id || "").trim();
        }, [assignableActors, backlogComposerAgentId, normalizedSubscriptionTierId]);

        const backlogComposerAgents = useMemo(() => {
          return assignableActors.map((agent) => ({
            ...agent,
            ...(effectiveBacklogComposerAgentId && agent.id === effectiveBacklogComposerAgentId ? { isDefault: true } : {}),
          }));
        }, [assignableActors, effectiveBacklogComposerAgentId]);

        const selectedProjectRecentThreads = useMemo(() => {
          if (selectedProjectDetail?.project?.id !== selectedProjectId) {
            return [];
          }
          if (Array.isArray(selectedProjectDetail.threads) && selectedProjectDetail.threads.length > 0) {
            return selectedProjectDetail.threads;
          }
          return Array.isArray(selectedProjectDetail.recentThreads)
            ? selectedProjectDetail.recentThreads
            : [];
        }, [selectedProjectDetail, selectedProjectId]);
        const projectOverviewThreads = useMemo(() => {
          const mergedThreads = normalizeThreadList([
            ...(Array.isArray(projectOverviewThreadRecords) ? projectOverviewThreadRecords : []),
            ...(Array.isArray(selectedProjectRecentThreads) ? selectedProjectRecentThreads : []),
          ]);
          return mergedThreads.sort(compareThreadsByRecent);
        }, [projectOverviewThreadRecords, selectedProjectRecentThreads]);
        const latestSelectedProjectMissionControlThreadId = useMemo(() => {
          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedSelectedProjectId) {
            return "";
          }
          const matchingThread = selectedProjectRecentThreads.find((threadItem) => {
            const normalizedThread = normalizeThreadItem(threadItem);
            const runnerPlaygroundMetadata = normalizedThread?.metadata?.runnerPlayground
              && typeof normalizedThread.metadata.runnerPlayground === "object"
              && !Array.isArray(normalizedThread.metadata.runnerPlayground)
              ? normalizedThread.metadata.runnerPlayground
              : null;
            const missionControlMetadata = runnerPlaygroundMetadata?.missionControl
              && typeof runnerPlaygroundMetadata.missionControl === "object"
              && !Array.isArray(runnerPlaygroundMetadata.missionControl)
              ? runnerPlaygroundMetadata.missionControl
              : null;
            const normalizedMissionControlProjectId = String(
              missionControlMetadata?.projectId
              || normalizedThread.projectId
              || ""
            ).trim();
            return normalizedThread.id
              && missionControlMetadata?.source === "project_backlog_mission_control"
              && normalizedMissionControlProjectId === normalizedSelectedProjectId;
          });
          return matchingThread?.id || "";
        }, [selectedProjectId, selectedProjectRecentThreads]);

        useEffect(() => {
          if (typeof window === "undefined" || !window.localStorage) {
            return;
          }
          try {
            window.localStorage.setItem(
              "runner-playground-project-overview-deleted-files",
              JSON.stringify(projectOverviewSuppressedFileKeys.slice(-250))
            );
          } catch {}
        }, [projectOverviewSuppressedFileKeys]);

        function getProjectOverviewFileActivityKey(projectId, environmentId, path) {
          const normalizedProjectId = String(projectId || "").trim();
          const normalizedEnvironmentId = String(environmentId || "").trim();
          const normalizedPath = normalizeHistoryPath(path || "");
          if (!normalizedProjectId || !normalizedEnvironmentId || !normalizedPath) {
            return "";
          }
          return normalizedProjectId + "::" + normalizedEnvironmentId + "::" + normalizedPath;
        }

        function normalizeProjectOverviewDeletedFileKeys(...sources) {
          const seen = new Set();
          const next = [];
          sources.forEach((source) => {
            (Array.isArray(source) ? source : []).forEach((value) => {
              const normalizedValue = String(value || "").trim();
              if (!normalizedValue || seen.has(normalizedValue)) {
                return;
              }
              seen.add(normalizedValue);
              next.push(normalizedValue);
            });
          });
          return next.slice(-250);
        }

        const selectedProjectOverviewDeletedFileKeys = useMemo(() => {
          const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : null;
          return normalizeProjectOverviewDeletedFileKeys(
            metadata?.projectOverviewDeletedFileKeys,
            projectOverviewSuppressedFileKeys
          );
        }, [projectOverviewSuppressedFileKeys, selectedProject?.metadata]);
        const selectedProjectOverviewDeletedFileKeysKey = useMemo(
          () => selectedProjectOverviewDeletedFileKeys.join("|"),
          [selectedProjectOverviewDeletedFileKeys]
        );

        function updateProjectDraftName(nextName) {
          projectDraftNameDirtyRef.current = true;
          projectDraftTypedNameRef.current = String(nextName || "");
          setProjectDraft((current) => ({
            ...current,
            name: nextName,
          }));
        }

        function preserveDirtyProjectDraftName(nextDraft, currentDraft = projectDraft) {
          const normalizedNextDraft = normalizePlaygroundProjectRecord(nextDraft || buildPlaygroundDefaultProjectDraft());
          if (!projectDraftNameDirtyRef.current || !currentDraft || typeof currentDraft !== "object") {
            return normalizedNextDraft;
          }
          const currentProjectId = String(currentDraft.id || "").trim();
          const nextProjectId = String(normalizedNextDraft.id || "").trim();
          const isSameDraft = currentProjectId === nextProjectId || (!currentProjectId && !nextProjectId);
          if (!isSameDraft) {
            return normalizedNextDraft;
          }
          return {
            ...normalizedNextDraft,
            name: projectDraftTypedNameRef.current || (typeof currentDraft.name === "string" ? currentDraft.name : normalizedNextDraft.name),
          };
        }

        useLayoutEffect(() => {
          if (!projectComposerOpen || !projectDraftNameDirtyRef.current) {
            return;
          }
          const typedName = projectDraftTypedNameRef.current;
          if (typeof typedName !== "string" || projectDraft.name === typedName) {
            return;
          }
          setProjectDraft((current) => (
            current && current.name !== typedName
              ? { ...current, name: typedName }
              : current
          ));
        }, [projectComposerOpen, projectDraft.id, projectDraft.name]);

        useEffect(() => {
          projectDraftWallpaperIdRef.current = getPlaygroundProjectWallpaperId(
            projectDraft.wallpaperId,
            PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id
          );
          projectDraftUseCardBackgroundAsWallpaperRef.current = projectDraft.useCardBackgroundAsWallpaper !== false;
        }, [projectDraft.useCardBackgroundAsWallpaper, projectDraft.wallpaperId]);

        function normalizeProjectDisplayName(value) {
          return String(value || "").trim().replace(/\\s+/g, " ");
        }

        function isPlaceholderProjectDisplayName(value) {
          const normalized = normalizeProjectDisplayName(value).toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project";
        }

        function rememberProjectLocalNameOverride(projectId, name) {
          const normalizedProjectId = String(projectId || "").trim();
          const normalizedName = normalizeProjectDisplayName(name);
          if (!normalizedProjectId) {
            return;
          }
          if (!normalizedName) {
            projectLocalNameOverridesRef.current.delete(normalizedProjectId);
            return;
          }
          projectLocalNameOverridesRef.current.set(normalizedProjectId, {
            name: normalizedName,
            updatedAt: Date.now(),
          });
        }

        function applyProjectLocalNameOverride(projectRecord) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const normalizedProjectId = String(normalizedProject.id || "").trim();
          if (!normalizedProjectId) {
            return normalizedProject;
          }

          const override = projectLocalNameOverridesRef.current.get(normalizedProjectId);
          if (!override) {
            return normalizedProject;
          }

          const overrideName = normalizeProjectDisplayName(override.name);
          if (!overrideName) {
            projectLocalNameOverridesRef.current.delete(normalizedProjectId);
            return normalizedProject;
          }

          const overrideUpdatedAt = Number(override.updatedAt) || 0;
          if (Date.now() - overrideUpdatedAt > 10 * 60 * 1000) {
            projectLocalNameOverridesRef.current.delete(normalizedProjectId);
            return normalizedProject;
          }

          const incomingName = normalizeProjectDisplayName(normalizedProject.name);
          if (incomingName === overrideName || isPlaceholderProjectDisplayName(overrideName)) {
            return normalizedProject;
          }
          if (!isPlaceholderProjectDisplayName(incomingName)) {
            return normalizedProject;
          }

          return {
            ...normalizedProject,
            name: overrideName,
          };
        }

        useEffect(() => {
	          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
	          const normalizedRecoveryThreadId = String(latestSelectedProjectMissionControlThreadId || "").trim();
	          const recoveryKey = normalizedSelectedProjectId + ":" + normalizedRecoveryThreadId;
	          const hasStrategyDocument = Boolean(String(selectedProjectMissionControl.document || "").trim());
	          if (
	            !normalizedSelectedProjectId
	            || !normalizedRecoveryThreadId
	            || hasStrategyDocument
	            || isSelectedProjectMissionControlRunning
	            || missionControlRecoveryThreadIdRef.current === recoveryKey
	            || missionControlRecoveryAttemptedKeysRef.current.has(recoveryKey)
	          ) {
	            return;
	          }

	          missionControlRecoveryAttemptedKeysRef.current.add(recoveryKey);
	          missionControlRecoveryThreadIdRef.current = recoveryKey;
	          void syncMissionControlThreadResult(normalizedRecoveryThreadId, normalizedSelectedProjectId)
	            .finally(() => {
              if (missionControlRecoveryThreadIdRef.current === recoveryKey) {
                missionControlRecoveryThreadIdRef.current = "";
              }
	            });
        }, [
          isSelectedProjectMissionControlRunning,
          latestSelectedProjectMissionControlThreadId,
          selectedProjectId,
          selectedProjectMissionControl.document,
        ]);

        const loadProjectOverviewFileActivity = useCallback(async function loadProjectOverviewFileActivity() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId || taskView !== "overview" || projectOverviewFilesSubview !== "imagine") {
            projectOverviewFileActivityLoadKeyRef.current = "";
            setProjectOverviewThreadRecords([]);
            setProjectOverviewFileActivityState((current) => ({
              ...current,
              status: "idle",
              error: "",
              items: normalizedProjectId ? current.items : [],
            }));
            return;
          }

		          const loadKey = [
		            normalizedProjectId,
		            taskView,
		            projectOverviewFilesSubview,
		            backendUrl,
		            requestHeadersKey,
		            selectedProjectOverviewDeletedFileKeysKey,
	            activeProjectAttachmentEnvironmentId,
	            String(projectOverviewFileActivityReloadNonce || 0),
          ].join("|");
          if (projectOverviewFileActivityLoadKeyRef.current === loadKey) {
            return;
          }
          projectOverviewFileActivityLoadKeyRef.current = loadKey;

          setProjectOverviewFileActivityState((current) => ({
            ...current,
            status: current?.status === "idle" ? "loading" : (current?.status || "ready"),
            error: "",
          }));

          const threadHeaders = {
            ...(requestHeaders && typeof requestHeaders === "object" ? requestHeaders : {}),
          };

          let projectThreads = normalizeThreadList(selectedProjectRecentThreads);
          try {
            const threadsResponse = await fetch(backendUrl + "/threads?limit=240", {
              method: "GET",
              headers: threadHeaders,
            });
            const threadsData = await threadsResponse.json().catch(() => ({}));
            if (threadsResponse.ok) {
              const items = Array.isArray(threadsData?.data)
                ? threadsData.data
                : Array.isArray(threadsData?.threads)
                  ? threadsData.threads
                  : [];
              const fetchedProjectThreads = normalizeThreadList(items)
                .filter((thread) => getPlaygroundThreadProjectId(thread) === normalizedProjectId);
              projectThreads = normalizeThreadList([...fetchedProjectThreads, ...projectThreads])
                .sort(compareThreadsByRecent)
                .slice(0, 18);
            }
          } catch {
            projectThreads = projectThreads.slice(0, 12);
          }

          setProjectOverviewThreadRecords(projectThreads);

          if (projectThreads.length === 0) {
            setProjectOverviewFileActivityState({
              status: "ready",
              error: "",
              items: [],
            });
            return;
          }

          const results = await Promise.allSettled(projectThreads.map(async (threadRecord) => {
            const thread = normalizeThreadItem(threadRecord);
            const normalizedThreadId = String(thread.id || "").trim();
            if (!normalizedThreadId) {
              return [];
            }

            const [stepsResult, logsResult] = await Promise.allSettled([
              projectOverviewHistoryClient.listThreadSteps({
                backendUrl,
                threadId: normalizedThreadId,
                limit: 250,
                headers: threadHeaders,
              }),
              fetchHistoryThreadLogs({
                client: projectOverviewHistoryClient,
                backendUrl,
                threadId: normalizedThreadId,
                headers: threadHeaders,
              }),
            ]);

            const steps = stepsResult.status === "fulfilled" && Array.isArray(stepsResult.value)
              ? stepsResult.value
              : [];
            const threadLogs = logsResult.status === "fulfilled" && Array.isArray(logsResult.value)
              ? logsResult.value
              : [];
            return buildPlaygroundProjectFileActivityRowsForThreadHistory({
              thread,
              steps,
              threadLogs,
              fallbackEnvironmentId: String(
                selectedProject?.defaultEnvironmentId
                || activeProjectAttachmentEnvironmentId
                || ""
              ).trim(),
              agentsById,
            });
          }));

          const historyItems = results
            .flatMap((result) => result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [])
            .filter((row) => normalizeHistoryChangeKind(row?.operationKind) !== "deleted")
            .sort((left, right) => {
              const timeDelta = Number(right.timestamp || 0) - Number(left.timestamp || 0);
              if (timeDelta !== 0) {
                return timeDelta;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });

          const suppressedFileKeySet = new Set(selectedProjectOverviewDeletedFileKeys);

          const nextItems = historyItems
            .filter((item) => {
              const normalizedEnvironmentId = String(item?.environmentId || "").trim();
              const normalizedPath = normalizeHistoryPath(item?.path || "");
              const key = getProjectOverviewFileActivityKey(normalizedProjectId, normalizedEnvironmentId, normalizedPath);
              if (!key) {
                return true;
              }
              return !suppressedFileKeySet.has(key);
            })
            .slice(0, 40);

          setProjectOverviewFileActivityState({
            status: "ready",
            error: "",
            items: nextItems,
          });
        }, [
          activeProjectAttachmentEnvironmentId,
	          agentsById,
	          backendUrl,
	          projectOverviewHistoryClient,
	          projectOverviewFileActivityReloadNonce,
	          projectOverviewFilesSubview,
		          requestHeaders,
		          requestHeadersKey,
		          selectedProject?.defaultEnvironmentId,
          selectedProjectOverviewDeletedFileKeysKey,
          selectedProjectId,
          taskView,
        ]);

        useEffect(() => {
          let cancelled = false;

          void loadProjectOverviewFileActivity()
            .catch((error) => {
              if (cancelled) {
                return;
              }
              setProjectOverviewFileActivityState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load project file activity.",
                items: [],
              });
            });

          return () => {
            cancelled = true;
          };
        }, [loadProjectOverviewFileActivity, projectOverviewFileActivityReloadNonce]);

	        const loadProjectOverviewServerResources = useCallback(async function loadProjectOverviewServerResources() {
	          const normalizedProjectId = String(selectedProjectId || "").trim();
		          if (!normalizedProjectId || taskView !== "overview" || projectOverviewFilesSubview !== "resources") {
		            projectOverviewServerResourcesLoadKeyRef.current = "";
		            setProjectOverviewServerResourcesState((current) => ({
              ...current,
              status: "idle",
              error: "",
              items: normalizedProjectId ? current.items : [],
	            }));
	            return;
	          }
		          const loadKey = [
		            normalizedProjectId,
		            taskView,
		            projectOverviewFilesSubview,
		            backendUrl,
		            requestHeadersKey,
		          ].join("|");
	          if (projectOverviewServerResourcesLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectOverviewServerResourcesLoadKeyRef.current = loadKey;

	          setProjectOverviewServerResourcesState((current) => ({
	            ...current,
            status: "loading",
            error: "",
          }));

          try {
            const response = await fetch(backendUrl + "/servers", {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load project resources.");
            }

            const nextItems = parsePlaygroundServerListResponse(data)
              .filter((server) => String(server?.projectId || "").trim() === normalizedProjectId)
              .filter((server) => canonicalizePlaygroundServerKind(server?.kind) !== "database")
              .map((server) => {
                const normalizedKind = canonicalizePlaygroundServerKind(server?.kind);
                const endpoint = [
                  typeof server?.customDomain === "string" ? server.customDomain.trim() : "",
                  typeof server?.serviceUrl === "string" ? server.serviceUrl.trim() : "",
                  typeof server?.cloudRunServiceName === "string" ? server.cloudRunServiceName.trim() : "",
                ].find(Boolean) || "";
                const updatedAt = String(server?.updatedAt || server?.createdAt || "").trim();
                return {
                  id: String(server?.id || "").trim(),
                  title: String(server?.name || "").trim() || "Untitled Resource",
                  type: formatPlaygroundServerKindLabel(normalizedKind),
                  endpoint,
                  status: String(server?.status || "").trim() || "draft",
                  updatedAt,
                  searchText: [
                    server?.name || "",
                    normalizedKind,
                    formatPlaygroundServerKindLabel(normalizedKind),
                    endpoint,
                    server?.status || "",
                    server?.id || "",
                  ].join(" ").toLowerCase(),
                };
              })
              .sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));

            setProjectOverviewServerResourcesState({
              status: "ready",
              error: "",
              items: nextItems,
            });
          } catch (error) {
            setProjectOverviewServerResourcesState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load project resources.",
              items: [],
            });
          }
		        }, [backendUrl, projectOverviewFilesSubview, requestHeaders, requestHeadersKey, selectedProjectId, taskView]);

        useEffect(() => {
          let cancelled = false;

          void loadProjectOverviewServerResources()
            .catch((error) => {
              if (cancelled) {
                return;
              }
              setProjectOverviewServerResourcesState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load project resources.",
                items: [],
              });
            });

          return () => {
            cancelled = true;
          };
        }, [loadProjectOverviewServerResources]);

        useEffect(() => {
          setProjectOverviewFileMenuState(null);
          setProjectOverviewFileMutationState({
            rowId: "",
            action: "",
            error: "",
          });
          if (taskView !== "overview") {
            setProjectOverviewThreadRecords([]);
          }
        }, [selectedProjectId, taskView]);

        useEffect(() => {
          if (!projectOverviewFileMenuState) {
            return;
          }

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              event.preventDefault();
              setProjectOverviewFileMenuState(null);
            }
          }

          function handleViewportChange() {
            setProjectOverviewFileMenuState(null);
          }

          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("resize", handleViewportChange);
          window.addEventListener("scroll", handleViewportChange, true);
          return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
          };
        }, [projectOverviewFileMenuState]);


        function closeProjectOverviewFileMenu() {
          setProjectOverviewFileMenuState(null);
        }





        const fetchProjectCustomSkills = useCallback(async function fetchProjectCustomSkills() {
          const normalizeSkills = (items) => (items || [])
            .filter((skill) => !skill.isDefault && !skill.isSystem)
            .map((skill) => ({
              id: skill.id,
              name: typeof skill.name === "string" && skill.name.trim() ? skill.name.trim() : skill.id,
              description: skill.description || "",
              icon: typeof skill.icon === "string" ? skill.icon : null,
              markdown: typeof skill.markdown === "string" ? skill.markdown : "",
              codeFiles: Array.isArray(skill.codeFiles)
                ? skill.codeFiles
                    .filter((file) => file && typeof file === "object")
                    .map((file) => ({
                      name: typeof file.name === "string" ? file.name : "",
                      content: typeof file.content === "string" ? file.content : "",
                      language: typeof file.language === "string" ? file.language : undefined,
                    }))
                    .filter((file) => file.name)
                : [],
              isCustom: true,
              enabled: true,
            }));

          if (!selectedProjectId) {
            return [];
          }

          const requestUrl = new URL("/api/playground/custom-skills", window.location.origin);
          requestUrl.searchParams.set("projectId", selectedProjectId);

          const response = await fetch(requestUrl.toString(), {
            method: "GET",
            credentials: "include",
            headers: {
              ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
              "X-Runner-Upstream-Url": upstreamUrl,
            },
          });
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to fetch custom skills");
          }

          return normalizeSkills(data?.data || data?.skills || []);
        }, [effectiveApiKey, selectedProjectId, upstreamUrl]);

        const loadTaskConnectorFolder = useCallback(async function loadTaskConnectorFolder(source, folderId, options = {}) {
          const connectorKey = getPlaygroundTaskConnectorKey(source);
          if (!connectorKey || connectorKey === "notion") {
            return [];
          }

          const connectorConfig = taskConnectorConfigByKey[connectorKey];
          if (!connectorConfig?.fetchItems) {
            return [];
          }

          const normalizedFolderId = folderId || "root";
          if (!options.force) {
            const loadedFolderIds = taskConnectorBrowserLoadedFolderIds[connectorKey] || [];
            const loadingFolderIds = taskConnectorBrowserLoadingFolderIds[connectorKey] || [];
            if (loadedFolderIds.includes(normalizedFolderId) || loadingFolderIds.includes(normalizedFolderId)) {
              return taskConnectorBrowserItemsBySource[connectorKey] || [];
            }
          }

          setTaskConnectorBrowserLoadingFolderIds((current) => ({
            ...current,
            [connectorKey]: (current[connectorKey] || []).includes(normalizedFolderId)
              ? current[connectorKey] || []
              : (current[connectorKey] || []).concat(normalizedFolderId),
          }));
          setTaskConnectorBrowserLoadingState((current) => ({
            ...current,
            [connectorKey]: true,
          }));
          setTaskConnectorBrowserErrors((current) => ({
            ...current,
            [connectorKey]: "",
          }));

          try {
            const items = await connectorConfig.fetchItems(normalizedFolderId);
            const normalizedItems = (Array.isArray(items) ? items : [])
              .map((item) => normalizePlaygroundTaskConnectorItem(item))
              .filter(Boolean);
            setTaskConnectorBrowserItemsBySource((current) => ({
              ...current,
              [connectorKey]: mergePlaygroundConnectorFolderItems(current[connectorKey] || [], normalizedFolderId, normalizedItems),
            }));
            setTaskConnectorBrowserLoadedFolderIds((current) => ({
              ...current,
              [connectorKey]: (current[connectorKey] || []).includes(normalizedFolderId)
                ? current[connectorKey] || []
                : (current[connectorKey] || []).concat(normalizedFolderId),
            }));
            return normalizedItems;
          } catch (error) {
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              [connectorKey]: error instanceof Error ? error.message : "Failed to load connector files.",
            }));
            return [];
          } finally {
            setTaskConnectorBrowserLoadingFolderIds((current) => ({
              ...current,
              [connectorKey]: (current[connectorKey] || []).filter((value) => value !== normalizedFolderId),
            }));
            setTaskConnectorBrowserLoadingState((current) => ({
              ...current,
              [connectorKey]: false,
            }));
          }
        }, [
          taskConnectorBrowserItemsBySource,
          taskConnectorBrowserLoadedFolderIds,
          taskConnectorBrowserLoadingFolderIds,
          taskConnectorConfigByKey,
        ]);

        const loadTaskConnectorNotionDatabases = useCallback(async function loadTaskConnectorNotionDatabases(options = {}) {
          const notionConfig = taskConnectorConfigByKey.notion;
          if (!notionConfig?.fetchDatabases) {
            return [];
          }

          if (!options.force && (taskConnectorBrowserNotionDatabasesLoaded || taskConnectorBrowserLoadingState.notion)) {
            return taskConnectorBrowserNotionDatabases;
          }

          setTaskConnectorBrowserLoadingState((current) => ({
            ...current,
            notion: true,
          }));
          setTaskConnectorBrowserErrors((current) => ({
            ...current,
            notion: "",
          }));

          try {
            const databases = await notionConfig.fetchDatabases();
            const normalizedDatabases = (Array.isArray(databases) ? databases : [])
              .filter((database) => database && typeof database === "object" && typeof database.id === "string" && database.id.trim())
              .map((database) => ({
                id: database.id,
                name: typeof database.name === "string" && database.name.trim() ? database.name.trim() : "Untitled database",
                icon: typeof database.icon === "string" ? database.icon : "",
              }));
            setTaskConnectorBrowserNotionDatabases(normalizedDatabases);
            setTaskConnectorBrowserNotionDatabasesLoaded(true);
            return normalizedDatabases;
          } catch (error) {
            setTaskConnectorBrowserNotionDatabases([]);
            setTaskConnectorBrowserNotionDatabasesLoaded(false);
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              notion: error instanceof Error ? error.message : "Failed to load Notion databases.",
            }));
            return [];
          } finally {
            setTaskConnectorBrowserLoadingState((current) => ({
              ...current,
              notion: false,
            }));
          }
        }, [
          taskConnectorBrowserLoadingState.notion,
          taskConnectorBrowserNotionDatabases,
          taskConnectorBrowserNotionDatabasesLoaded,
          taskConnectorConfigByKey.notion,
        ]);

        useEffect(() => {
          let isCancelled = false;

	          if (!selectedProjectId) {
	            projectCustomSkillsLoadKeyRef.current = "";
	            setProjectCustomSkills([]);
	            setProjectCustomSkillsLoading(false);
	            return undefined;
	          }
	          const loadKey = [
	            selectedProjectId,
	            effectiveApiKey,
	            upstreamUrl,
	          ].join("|");
	          if (projectCustomSkillsLoadKeyRef.current === loadKey) {
	            return undefined;
	          }
	          projectCustomSkillsLoadKeyRef.current = loadKey;

	          setProjectCustomSkillsLoading(true);
          void (async () => {
            try {
              const nextSkills = await fetchProjectCustomSkills();
              if (!isCancelled) {
                setProjectCustomSkills(Array.isArray(nextSkills) ? nextSkills : []);
              }
            } catch {
              if (!isCancelled) {
                setProjectCustomSkills([]);
              }
            } finally {
              if (!isCancelled) {
                setProjectCustomSkillsLoading(false);
              }
            }
          })();

          return () => {
            isCancelled = true;
          };
        }, [fetchProjectCustomSkills, selectedProjectId]);

        const taskSkillOptionsById = useMemo(() => {
          const next = {};

          PLAYGROUND_AGENT_SKILL_OPTIONS.forEach((skill) => {
            if (!skill?.id) return;
            next[skill.id] = {
              id: skill.id,
              name: typeof skill.label === "string" && skill.label.trim() ? skill.label.trim() : skill.id,
              description: typeof skill.description === "string" ? skill.description : "",
              isCustom: false,
              icon: null,
            };
          });

          (Array.isArray(skills) ? skills : []).forEach((skill) => {
            const skillId = typeof skill?.id === "string" ? skill.id.trim() : "";
            if (!skillId) return;
            next[skillId] = {
              id: skillId,
              name: typeof skill?.name === "string" && skill.name.trim()
                ? skill.name.trim()
                : typeof skill?.label === "string" && skill.label.trim()
                  ? skill.label.trim()
                  : next[skillId]?.name || skillId,
              description: typeof skill?.description === "string"
                ? skill.description
                : next[skillId]?.description || "",
              isCustom: false,
              icon: typeof skill?.icon === "string" ? skill.icon : next[skillId]?.icon || null,
            };
          });

          projectCustomSkills.forEach((skill) => {
            const skillId = typeof skill?.id === "string" ? skill.id.trim() : "";
            if (!skillId) return;
            next[skillId] = {
              id: skillId,
              name: typeof skill?.name === "string" && skill.name.trim()
                ? skill.name.trim()
                : next[skillId]?.name || skillId,
              description: typeof skill?.description === "string"
                ? skill.description
                : next[skillId]?.description || "",
              isCustom: true,
              icon: typeof skill?.icon === "string" ? skill.icon : null,
            };
          });

          return next;
        }, [projectCustomSkills, skills]);

        function buildTaskSkillFallbackName(skillId) {
          return String(skillId || "")
            .replace(/[_-]+/g, " ")
            .replace(/\\b\\w/g, (character) => character.toUpperCase());
        }

        function resolveTaskSkillItem(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0] || String(skillId || "").trim();
          if (!normalizedSkillId) return null;
          const option = taskSkillOptionsById[normalizedSkillId];
          if (option) {
            return option;
          }
          return {
            id: normalizedSkillId,
            name: buildTaskSkillFallbackName(normalizedSkillId),
            description: "",
            isCustom: false,
            icon: null,
          };
        }

        function getPlaygroundAgentEnabledSkillIds(agentId) {
          const normalizedAgentId = typeof agentId === "string" ? agentId.trim() : "";
          if (!normalizedAgentId) {
            return ["frontend_design"];
          }
          const matchingAgent = agentsById[normalizedAgentId];
          const enabledSkillIds = normalizePlaygroundEnabledSkillIds(matchingAgent?.enabledSkills);
          return enabledSkillIds.length > 0 ? enabledSkillIds : ["frontend_design"];
        }

        function getEffectivePlaygroundTaskEnabledSkillIds(taskLike) {
          const explicitSkillIds = normalizePlaygroundEnabledSkillIds(taskLike?.enabledSkills);
          if (explicitSkillIds.length > 0) {
            return explicitSkillIds;
          }
          const assigneeAgentId = typeof taskLike?.assigneeAgentId === "string" && taskLike.assigneeAgentId.trim()
            ? taskLike.assigneeAgentId.trim()
            : typeof taskLike?.agentId === "string" && taskLike.agentId.trim()
              ? taskLike.agentId.trim()
              : "";
          const agentSkillIds = getPlaygroundAgentEnabledSkillIds(assigneeAgentId);
          return agentSkillIds.length > 0 ? agentSkillIds : ["frontend_design"];
        }

        const taskSystemSkillItems = useMemo(() => {
          const next = [];
          const seen = new Set();
          const activeEnabledSkillIds = Array.from(new Set(
            getEffectivePlaygroundTaskEnabledSkillIds(draftTask).concat(getEffectivePlaygroundTaskEnabledSkillIds(scheduleDraft))
          ));

          function appendSkill(skillId) {
            const item = resolveTaskSkillItem(skillId);
            if (!item || item.isCustom || seen.has(item.id)) {
              return;
            }
            seen.add(item.id);
            next.push(item);
          }

          (Array.isArray(skills) ? skills : []).forEach((skill) => appendSkill(skill?.id));
          activeEnabledSkillIds.forEach((skillId) => appendSkill(skillId));

          return next;
        }, [draftTask, scheduleDraft, skills, taskSkillOptionsById]);

        const taskSystemSkillIdSet = useMemo(() => {
          return new Set(taskSystemSkillItems.map((skill) => skill.id));
        }, [taskSystemSkillItems]);

        const taskCustomSkillItems = useMemo(() => {
          const next = [];
          const seen = new Set();
          const activeEnabledSkillIds = Array.from(new Set(
            getEffectivePlaygroundTaskEnabledSkillIds(draftTask).concat(getEffectivePlaygroundTaskEnabledSkillIds(scheduleDraft))
          ));

          function appendSkill(skillId) {
            const item = resolveTaskSkillItem(skillId);
            if (!item || seen.has(item.id)) {
              return;
            }
            if (!item.isCustom && taskSystemSkillIdSet.has(item.id)) {
              return;
            }
            seen.add(item.id);
            next.push({
              ...item,
              isCustom: true,
            });
          }

          projectCustomSkills.forEach((skill) => appendSkill(skill?.id));
          activeEnabledSkillIds.forEach((skillId) => {
            if (!taskSystemSkillIdSet.has(skillId)) {
              appendSkill(skillId);
            }
          });

          return next;
        }, [draftTask, scheduleDraft, projectCustomSkills, taskSystemSkillIdSet, taskSkillOptionsById]);

        function getTaskSkillIconComponent(skill) {
          const normalizedCustomIcon = String(skill?.icon || "default").trim().toLowerCase();
          if (skill?.isCustom) {
            if (normalizedCustomIcon === "sparkles") return Sparkles;
            if (normalizedCustomIcon === "brain") return Brain;
            if (normalizedCustomIcon === "zap") return Zap;
            if (normalizedCustomIcon === "telescope") return Telescope;
            if (normalizedCustomIcon === "search") return Globe;
            if (normalizedCustomIcon === "image") return ImageIcon;
            if (normalizedCustomIcon === "code") return Code;
            if (normalizedCustomIcon === "terminal") return Terminal;
            if (normalizedCustomIcon === "file-text") return FileText;
            if (normalizedCustomIcon === "database") return Database;
            if (normalizedCustomIcon === "pen-tool") return PenTool;
            if (normalizedCustomIcon === "palette") return Paintbrush;
            if (normalizedCustomIcon === "slash") return Slash;
            if (normalizedCustomIcon === "message") return MessageSquare;
            if (normalizedCustomIcon === "mail") return Mail;
            if (normalizedCustomIcon === "calendar") return CalendarIcon;
            if (normalizedCustomIcon === "calculator") return Calculator;
            if (normalizedCustomIcon === "shield" || normalizedCustomIcon === "lock") return Shield;
            if (normalizedCustomIcon === "cloud") return Cloud;
            if (normalizedCustomIcon === "server") return Server;
            if (normalizedCustomIcon === "cpu") return Cpu;
            if (normalizedCustomIcon === "git") return GitCommitHorizontal;
            if (normalizedCustomIcon === "package") return Package;
            if (normalizedCustomIcon === "list") return ListTodo;
            return Wand2;
          }
          if (skill?.id === "image_generation") return ImageIcon;
          if (skill?.id === "video_generation") return Film;
          if (skill?.id === "web_search") return Globe;
          if (skill?.id === "research" || skill?.id === "deep_research") return Telescope;
          if (skill?.id === "pdf") return FileText;
          if (skill?.id === "frontend_design") return Slash;
          if (skill?.id === "pptx") return Layers;
          if (skill?.id === "memory") return Brain;
          if (skill?.id === "task_management") return ListTodo;
          if (skill?.id === "app_platform") return Server;
          if (skill?.id === "computer_agents") return Cpu;
          return Layers;
        }

        function renderTaskSkillIcon(skill, className) {
          if (skill?.id === "computer_agents") {
            return React.createElement("img", {
              src: RUNNER_TRANSPARENT_LOGO_URL,
              alt: "",
              "aria-hidden": "true",
              draggable: false,
              className,
              style: { objectFit: "contain" },
            });
          }
          const Icon = getTaskSkillIconComponent(skill);
          return React.createElement(Icon, { className, strokeWidth: 1.75 });
        }

        const normalizedSearchQuery = searchQuery.trim().toLowerCase();

        const filteredProjectThreads = useMemo(() => {
          return [...projectOverviewThreads]
            .filter((thread) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                thread.title || "",
                thread.id || "",
                formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || "")));
        }, [normalizedSearchQuery, projectOverviewThreads]);

        const selectedProjectAttachments = useMemo(() => {
          return normalizePlaygroundTaskAttachmentList(selectedProject?.attachments);
        }, [selectedProject?.attachments]);

        const filteredProjectAttachments = useMemo(() => {
          return [...selectedProjectAttachments]
            .filter((attachment) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                attachment.filename || attachment.name || "",
                attachment.sourcePath || attachment.workspacePath || "",
                attachment.environmentName || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
        }, [normalizedSearchQuery, selectedProjectAttachments]);

        const overviewVisibleEnvironments = useMemo(() => {
          return selectedProjectEnvironments.filter((environment) => {
            if (!normalizedSearchQuery) return true;
            const haystack = [
              environment.name || "",
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        }, [normalizedSearchQuery, selectedProjectEnvironments]);

        const overviewPluginItems = useMemo(() => {
          const items = [
            {
              id: "github",
              label: "GitHub",
              logoUrl: PLAYGROUND_GITHUB_LOGO_URL,
              description: "Browse repos and attach code directly to project work.",
              statusLabel: taskConnectorConfigByKey.github ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.github),
            },
            {
              id: "gitlab",
              label: "GitLab",
              logoUrl: "/img/04-skills/gitlab.svg",
              description: "Route merge request and push events into project threads.",
              statusLabel: "Via Actions",
              isActive: true,
            },
            {
              id: "google-drive",
              label: "Google Drive",
              logoUrl: PLAYGROUND_GOOGLE_DRIVE_LOGO_URL,
              description: "Use Drive files as shared project context for tasks and threads.",
              statusLabel: taskConnectorConfigByKey.googleDrive ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.googleDrive),
            },
            {
              id: "one-drive",
              label: "OneDrive",
              logoUrl: PLAYGROUND_ONEDRIVE_LOGO_URL,
              description: "Keep Microsoft-hosted docs available inside the project workspace.",
              statusLabel: taskConnectorConfigByKey.oneDrive ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.oneDrive),
            },
            {
              id: "notion",
              label: "Notion",
              logoUrl: PLAYGROUND_NOTION_LOGO_URL,
              description: "Reference workspace docs and databases while planning delivery.",
              statusLabel: taskConnectorConfigByKey.notion ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.notion),
            },
          ];
          return items.filter((item) => {
            if (!normalizedSearchQuery) return true;
            const haystack = [
              item.label || "",
              item.description || "",
              item.statusLabel || "",
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        }, [normalizedSearchQuery, taskConnectorConfigByKey]);

        const tasksById = useMemo(() => {
          const next = {};
          tasks.forEach((task) => {
            if (!task?.id) return;
            next[task.id] = task;
          });
          return next;
        }, [tasks]);

        const releasesById = useMemo(() => {
          const next = {};
          releases.forEach((release) => {
            if (!release?.id) return;
            next[release.id] = release;
          });
          return next;
        }, [releases]);

        const taskTicketNumbersById = useMemo(
          () => buildPlaygroundTaskTicketNumberMap(tasks, selectedProject),
          [selectedProject, tasks]
        );
        const taskDetailThreadSortOptions = [
          { id: "recent-desc", label: "Recently Updated", description: "Show the newest activity first" },
          { id: "created-desc", label: "Newest Created", description: "Show newly created threads first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort threads alphabetically" },
        ];
        const taskDetailThreadFilterOptions = [
          { id: "all", label: "All Threads", description: "Show every run for this ticket" },
          { id: "running", label: "Running", description: "Only show threads still in progress" },
          { id: "permission", label: "Needs Permission", description: "Only show threads waiting for approval" },
          { id: "completed", label: "Completed", description: "Only show finished threads" },
          { id: "failed", label: "Failed", description: "Only show failed or cancelled threads" },
        ];
        const activeTaskDetailThreadSortOption = taskDetailThreadSortOptions.find((option) => option.id === taskDetailThreadSortMode) || taskDetailThreadSortOptions[0];
        const activeTaskDetailThreadFilterOption = taskDetailThreadFilterOptions.find((option) => option.id === taskDetailThreadFilterMode) || taskDetailThreadFilterOptions[0];
	        const selectedTaskThreadIds = useMemo(() => {
	          const ids = [];
	          const lastStartedThreadId = typeof draftTask?.lastStartedThreadId === "string"
	            ? draftTask.lastStartedThreadId.trim()
            : "";
          if (lastStartedThreadId) {
            ids.push(lastStartedThreadId);
          }
          normalizePlaygroundIdList(draftTask?.linkedThreadIds).forEach((threadId) => {
            if (threadId) {
              ids.push(threadId);
            }
	          });
	          return Array.from(new Set(ids));
	        }, [draftTask?.lastStartedThreadId, draftTask?.linkedThreadIds]);
	        const selectedTaskThreadIdsKey = useMemo(() => selectedTaskThreadIds.join("|"), [selectedTaskThreadIds]);
	        const selectedTaskThreads = useMemo(() => {
          const normalizedTaskId = String(draftTask?.id || selectedTaskId || "").trim();
          if (!normalizedTaskId) {
            return [];
          }

          const linkedThreadIdSet = new Set(selectedTaskThreadIds);
          const taskTicketNumber = String(taskTicketNumbersById[normalizedTaskId] || draftTask?.ticketNumber || "").trim();
          const normalizedProjectId = String(draftTask?.projectId || selectedProjectId || "").trim();
          const matchedById = new Map();

          normalizeThreadList([
            ...(Array.isArray(taskDetailThreadRecords) ? taskDetailThreadRecords : []),
            ...(Array.isArray(projectOverviewThreads) ? projectOverviewThreads : []),
            ...(Array.isArray(selectedProjectRecentThreads) ? selectedProjectRecentThreads : []),
          ]).forEach((thread) => {
            const threadId = String(thread?.id || "").trim();
            if (!threadId) {
              return;
            }
            const taskPreview = getThreadTaskPreview(thread);
            const previewTaskId = String(taskPreview?.taskId || "").trim();
            const threadProjectId = getPlaygroundThreadProjectId(thread);
            const threadTitle = String(thread?.title || "").trim();
            const matchesLinkedThread = linkedThreadIdSet.has(threadId);
            const matchesTaskPreview = previewTaskId === normalizedTaskId;
            const matchesTicketFallback = Boolean(
              taskTicketNumber
              && normalizedProjectId
              && threadProjectId === normalizedProjectId
              && (
                threadTitle === taskTicketNumber
                || threadTitle.startsWith(taskTicketNumber + " ")
                || threadTitle.startsWith(taskTicketNumber + ":")
              )
            );
            if (matchesLinkedThread || matchesTaskPreview || matchesTicketFallback) {
              matchedById.set(threadId, thread);
            }
          });

          selectedTaskThreadIds.forEach((threadId) => {
            if (!threadId || matchedById.has(threadId)) {
              return;
            }
            matchedById.set(threadId, normalizeThreadItem({
              id: threadId,
              title: "Thread " + threadId,
              status: "",
              projectId: normalizedProjectId,
              metadata: {
                runnerPlayground: {
                  taskPreview: {
                    taskId: normalizedTaskId,
                    projectId: normalizedProjectId,
                    ticketNumber: taskTicketNumber || "",
                    title: draftTask?.title || "Untitled Task",
                  },
                },
              },
            }));
          });

          return Array.from(matchedById.values()).sort(compareThreadsByRecent);
        }, [
          draftTask?.id,
          draftTask?.projectId,
          draftTask?.ticketNumber,
          draftTask?.title,
          projectOverviewThreads,
          selectedProjectId,
          selectedProjectRecentThreads,
          selectedTaskId,
          selectedTaskThreadIds,
          taskDetailThreadRecords,
          taskTicketNumbersById,
        ]);

        const visibleTaskDetailThreads = useMemo(() => {
          return selectedTaskThreads.slice().sort(compareThreadsByRecent);
        }, [selectedTaskThreads]);
        useEffect(() => {
          if (!taskDetailThreadToolbarPopover) return undefined;

          function handleTaskDetailThreadToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailThreadsToolbarRef.current || taskDetailThreadsToolbarRef.current.contains(target)) {
              return;
            }
            setTaskDetailThreadToolbarPopover("");
          }

          document.addEventListener("mousedown", handleTaskDetailThreadToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleTaskDetailThreadToolbarPointerDown);
        }, [taskDetailThreadToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewTaskToolbarPopover) return undefined;

          function handleProjectOverviewTaskToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectOverviewTasksToolbarRef.current || projectOverviewTasksToolbarRef.current.contains(target)) {
              return;
            }
            setProjectOverviewTaskToolbarPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewTaskToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewTaskToolbarPointerDown);
        }, [projectOverviewTaskToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewThreadToolbarPopover) return undefined;

          function handleProjectOverviewThreadToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectOverviewThreadsToolbarRef.current || projectOverviewThreadsToolbarRef.current.contains(target)) {
              return;
            }
            setProjectOverviewThreadToolbarPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewThreadToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewThreadToolbarPointerDown);
        }, [projectOverviewThreadToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewFileToolbarPopover) return undefined;

          function handleProjectOverviewFileToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectOverviewFilesToolbarRef.current || projectOverviewFilesToolbarRef.current.contains(target)) {
              return;
            }
            setProjectOverviewFileToolbarPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewFileToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewFileToolbarPointerDown);
        }, [projectOverviewFileToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewSidebarPropertyPopover) return undefined;

          function handleProjectOverviewSidebarPropertyPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || target.closest(".playground-project-overview-sidebar-select-shell")) {
              return;
            }
            setProjectOverviewSidebarPropertyPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewSidebarPropertyPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewSidebarPropertyPointerDown);
        }, [projectOverviewSidebarPropertyPopover]);
        useEffect(() => {
          if (!projectOverviewTeamMenuId && !projectOverviewMilestoneMenuId && !projectOverviewResourceMenuId) return undefined;

          function handleProjectOverviewMenusPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target) {
              return;
            }
            if (target.closest(".playground-project-team-action-shell") || target.closest(".playground-project-teams-add-shell")) {
              return;
            }
            if (target.closest(".playground-project-overview-sidebar-milestone-menu-shell")) {
              return;
            }
            if (target.closest(".playground-project-resources-action-shell")) {
              return;
            }
            setProjectOverviewTeamMenuId("");
            setProjectOverviewMilestoneMenuId("");
            setProjectOverviewResourceMenuId("");
          }

          document.addEventListener("mousedown", handleProjectOverviewMenusPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewMenusPointerDown);
        }, [projectOverviewTeamMenuId, projectOverviewMilestoneMenuId, projectOverviewResourceMenuId]);
        useEffect(() => {
          setProjectOverviewVisibleThreadCount(5);
          setProjectOverviewVisibleActivityCount(5);
          setProjectOverviewSidebarPropertyPopover("");
          setProjectOverviewTeamMenuId("");
          setProjectOverviewMilestoneMenuId("");
          setProjectOverviewResourceMenuId("");
          setSelectedProjectOverviewThreadIds(new Set());
        }, [projectOverviewThreadFilterMode, projectOverviewThreadSearchQuery, projectOverviewThreadSortMode, selectedProjectId]);
        useEffect(() => {
          setTaskDetailThreadToolbarPopover("");
          setTaskDetailThreadSearchQuery("");
          setTaskCommentMode("");
        }, [selectedTaskId]);
        useEffect(() => {
	          const normalizedTaskId = String(draftTask?.id || "").trim();
	          if (!normalizedTaskId) {
	            taskDetailThreadRecordsLoadKeyRef.current = "";
	            setTaskDetailThreadRecords([]);
	            setTaskDetailThreadsState({
              status: "idle",
              error: "",
	            });
	            return undefined;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	            normalizedTaskId,
	            selectedTaskThreadIdsKey,
	          ].join("|");
	          if (taskDetailThreadRecordsLoadKeyRef.current === loadKey) {
	            return undefined;
	          }
	          taskDetailThreadRecordsLoadKeyRef.current = loadKey;

	          let cancelled = false;
          setTaskDetailThreadsState({
            status: "loading",
            error: "",
          });

          void (async () => {
            try {
              const response = await fetch(backendUrl + "/threads?limit=240", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load task threads.");
              }
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.threads)
                  ? data.threads
                  : [];
              if (!cancelled) {
                setTaskDetailThreadRecords(normalizeThreadList(items));
                setTaskDetailThreadsState({
                  status: "ready",
                  error: "",
                });
              }
            } catch (error) {
              if (!cancelled) {
                setTaskDetailThreadRecords([]);
                setTaskDetailThreadsState({
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to load task threads.",
                });
              }
            }
          })();

          return () => {
            cancelled = true;
          };
        }, [
	          backendUrl,
	          draftTask?.id,
	          requestHeaders,
	          requestHeadersKey,
	          selectedProjectId,
	          selectedTaskThreadIdsKey,
	        ]);
        function resolveTaskAttachmentApiUrl(rawUrl, attachmentId = "") {
          const normalizedUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";
          let normalizedBackendUrl = String(backendUrl || "").trim();
          while (normalizedBackendUrl.endsWith("/")) {
            normalizedBackendUrl = normalizedBackendUrl.slice(0, -1);
          }
          const normalizedAttachmentId = String(attachmentId || "").trim();
          const normalizedUrlLower = normalizedUrl.toLowerCase();
          if (!normalizedUrl) {
            return normalizedBackendUrl && normalizedAttachmentId
              ? normalizedBackendUrl + "/attachments/" + encodeURIComponent(normalizedAttachmentId)
              : "";
          }
          if (
            normalizedUrlLower.startsWith("blob:")
            || normalizedUrlLower.startsWith("data:")
            || normalizedUrlLower.startsWith("http://")
            || normalizedUrlLower.startsWith("https://")
          ) {
            return normalizedUrl;
          }
          if (normalizedUrl.startsWith("/api/real/attachments/") || normalizedUrl.startsWith("/api/task-backlog/")) {
            return normalizedUrl;
          }
          if (normalizedUrl.startsWith("/api/attachments/")) {
            return normalizedBackendUrl
              ? normalizedBackendUrl + "/attachments" + normalizedUrl.slice("/api/attachments".length)
              : normalizedUrl;
          }
          if (normalizedUrl.startsWith("/attachments/")) {
            return normalizedBackendUrl
              ? normalizedBackendUrl + normalizedUrl
              : normalizedUrl;
          }
          if (normalizedUrl.startsWith("/")) {
            return normalizedUrl;
          }
          let relativeUrl = normalizedUrl;
          if (relativeUrl.startsWith("./")) {
            relativeUrl = relativeUrl.slice(2);
          }
          while (relativeUrl.startsWith("/")) {
            relativeUrl = relativeUrl.slice(1);
          }
          return normalizedBackendUrl
            ? normalizedBackendUrl + "/" + relativeUrl
            : normalizedUrl;
        }

        function getTaskAttachmentWorkspaceDownloadUrl(attachment) {
          if (!attachment) return "";
          const attachmentEnvironmentId = String(attachment.environmentId || "").trim();
          const attachmentSourcePath = normalizeHistoryPath(attachment.sourcePath || attachment.workspacePath);
          if (!attachmentEnvironmentId || !attachmentSourcePath) {
            return "";
          }
          return buildPlaygroundEnvironmentDownloadUrl(backendUrl, attachmentEnvironmentId, attachmentSourcePath);
        }

        function resolveTaskAttachmentPreviewUrl(attachment) {
          if (!attachment) return "";
          const normalizedPreviewUrl = typeof attachment.previewUrl === "string" ? attachment.previewUrl.trim() : "";
          const normalizedPreviewUrlLower = normalizedPreviewUrl.toLowerCase();
          if (
            normalizedPreviewUrlLower.startsWith("blob:")
            || normalizedPreviewUrlLower.startsWith("data:")
            || normalizedPreviewUrlLower.startsWith("http://")
            || normalizedPreviewUrlLower.startsWith("https://")
          ) {
            return normalizedPreviewUrl;
          }
          return resolveTaskAttachmentApiUrl(normalizedPreviewUrl, attachment.id)
            || resolveTaskAttachmentApiUrl(attachment.url, attachment.id)
            || getTaskAttachmentWorkspaceDownloadUrl(attachment);
        }

        function buildResolvedTaskAttachmentRecord(attachment) {
          if (!attachment) {
            return null;
          }
          const resolvedUrl = resolveTaskAttachmentApiUrl(attachment.url, attachment.id)
            || getTaskAttachmentWorkspaceDownloadUrl(attachment);
          const resolvedPreviewUrl = resolveTaskAttachmentPreviewUrl({
            ...attachment,
            url: resolvedUrl || attachment.url,
          });
          return {
            ...attachment,
            url: resolvedUrl || attachment.url,
            previewUrl: resolvedPreviewUrl || attachment.previewUrl,
          };
        }

        const activeDetailAttachments = useMemo(() => {
          if (draftTask?.attachments?.length) {
            return draftTask.attachments;
          }
          if (isCalendarScheduleDetailMode && Array.isArray(scheduleDraft?.attachments)) {
            return scheduleDraft.attachments;
          }
          return [];
        }, [draftTask?.attachments, isCalendarScheduleDetailMode, scheduleDraft?.attachments]);

        const previewedTaskAttachment = useMemo(() => {
          if (!activeDetailAttachments.length || !previewedTaskAttachmentId) {
            return null;
          }
          const matchedAttachment = activeDetailAttachments.find((attachment) => attachment.id === previewedTaskAttachmentId) || null;
          return buildResolvedTaskAttachmentRecord(matchedAttachment);
        }, [activeDetailAttachments, backendUrl, previewedTaskAttachmentId]);
        const previewedProjectAttachment = useMemo(() => {
          const projectAttachments = normalizePlaygroundTaskAttachmentList(projectAttachmentHostRecord?.attachments);
          if (!projectAttachments.length || !projectPreviewedAttachmentId) {
            return null;
          }
          const matchedAttachment = projectAttachments.find((attachment) => attachment.id === projectPreviewedAttachmentId) || null;
          return buildResolvedTaskAttachmentRecord(matchedAttachment);
        }, [backendUrl, projectAttachmentHostRecord?.attachments, projectPreviewedAttachmentId]);

        const schedulesById = useMemo(() => {
          const next = {};
          schedules.forEach((schedule) => {
            if (!schedule?.id) return;
            next[schedule.id] = schedule;
          });
          return next;
        }, [schedules]);

        const sprintsById = useMemo(() => {
          const next = {};
          sprints.forEach((sprint) => {
            if (!sprint?.id) return;
            next[sprint.id] = sprint;
          });
          return next;
        }, [sprints]);

        const summary = useMemo(() => {
          return {
            backlog: tasks.filter((task) => task.status === "backlog" || task.status === "todo").length,
            active: tasks.filter((task) => task.status === "in_progress" || task.status === "blocked").length,
            scheduled: tasks.filter((task) => task.scheduledStartAt || task.dueAt).length,
            completed: tasks.filter((task) => task.status === "done").length,
          };
        }, [tasks]);

        const backlogFilterOptions = [
          { id: "open", label: "Open Tasks", description: "Show every task that is not done" },
          { id: "tasks", label: "Tasks Only", description: "Only show top-level tasks on the backlog" },
          { id: "subtasks", label: "Subtasks Only", description: "Only show subtasks, grouped below their parent tasks" },
          { id: "all", label: "All Tasks", description: "Show open and completed tasks together" },
          { id: "started", label: "Started", description: "Only show tasks that already have threads" },
          { id: "unassigned", label: "Unassigned", description: "Only show tasks without an assignee" },
          { id: "scheduled", label: "Scheduled", description: "Only show tasks with dates attached" },
          { id: "done", label: "Done", description: "Only show completed tasks" },
        ];
        const boardFilterOptions = [
          { id: "all", label: "All Tasks", description: "Show every task across all board lanes" },
          { id: "open", label: "Open Tasks", description: "Hide finished tasks and focus on active work" },
          { id: "started", label: "Started", description: "Only show tasks that already have threads" },
          { id: "unassigned", label: "Unassigned", description: "Only show tasks without an assignee" },
          { id: "blocked", label: "Blocked", description: "Only show tasks currently blocked" },
          { id: "done", label: "Finished", description: "Only show finished tasks" },
        ];
        const releaseFilterOptions = [
          { id: "all", label: "All Milestones", description: "Show every milestone in this project" },
          { id: "active", label: "Active", description: "Only show milestones currently in progress" },
          { id: "planned", label: "Planned", description: "Only show upcoming milestones" },
          { id: "completed", label: "Completed", description: "Only show milestones whose date range has ended" },
          { id: "open", label: "Needs Work", description: "Only show milestones with open tasks remaining" },
        ];
        const backlogSortOptions = [
          { id: "default", label: "Default Order" },
          { id: "recent-desc", label: "Recently Updated" },
          { id: "created-desc", label: "Newest Created" },
          { id: "priority-desc", label: "Highest Priority" },
          { id: "title-asc", label: "Title (A-Z)" },
        ];
        const projectOverviewTaskFilterOptions = [
          { id: "open", label: "Open Tasks", description: "Show active tickets that are not finished" },
          { id: "in-progress", label: "In Progress", description: "Only show tickets currently being worked on" },
          { id: "review", label: "In Review", description: "Only show tickets waiting for review" },
          { id: "blocked", label: "Blocked", description: "Only show blocked tickets" },
          { id: "started", label: "Started", description: "Only show tickets that already have threads" },
          { id: "unassigned", label: "Unassigned", description: "Only show tickets without an assignee" },
          { id: "scheduled", label: "Scheduled", description: "Only show tickets with dates attached" },
          { id: "all", label: "All Tasks", description: "Show open and finished tickets together" },
        ];
        const projectOverviewTaskSortOptions = [
          { id: "default", label: "Default Order", description: "Use the project task order" },
          { id: "recent-desc", label: "Recently Updated", description: "Show recently changed tickets first" },
          { id: "created-desc", label: "Newest Created", description: "Show newly created tickets first" },
          { id: "priority-desc", label: "Highest Priority", description: "Surface urgent and high priority tickets first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort tickets alphabetically" },
        ];
        const projectOverviewThreadSortOptions = [
          { id: "recent-desc", label: "Recently Updated", description: "Show the newest thread activity first" },
          { id: "created-desc", label: "Newest Created", description: "Show newly created threads first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort threads alphabetically" },
        ];
        const projectOverviewThreadFilterOptions = [
          { id: "all", label: "All Threads", description: "Show every project thread" },
          { id: "running", label: "Running", description: "Only show threads still in progress" },
          { id: "permission", label: "Needs Permission", description: "Only show threads waiting for approval" },
          { id: "completed", label: "Completed", description: "Only show finished threads" },
          { id: "failed", label: "Failed", description: "Only show failed or cancelled threads" },
        ];
        const projectOverviewFileSortOptions = [
          { id: "recent-desc", label: "Recently Updated", description: "Show the newest file activity first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort files alphabetically" },
          { id: "operation-asc", label: "Operation", description: "Group file activity by operation" },
        ];
        const projectOverviewFileFilterOptions = [
          { id: "all", label: "All Files", description: "Show every file operation" },
          { id: "created", label: "Created", description: "Only show newly created files" },
          { id: "modified", label: "Modified", description: "Only show changed files" },
          { id: "deleted", label: "Deleted", description: "Only show deleted files" },
        ];
        const releaseSortOptions = [
          { id: "default", label: "Default Order" },
          { id: "start-asc", label: "Earliest Start" },
          { id: "end-asc", label: "Earliest End" },
          { id: "recent-desc", label: "Recently Updated" },
          { id: "title-asc", label: "Name (A-Z)" },
        ];
        const projectsHomeSortOptions = [
          { id: "updated-desc", label: "Recently Updated", description: "Show the latest touched projects first" },
          { id: "name-asc", label: "Name (A-Z)", description: "Sort projects alphabetically" },
          { id: "tasks-desc", label: "Most Open Tasks", description: "Surface projects with the most remaining work" },
        ];
        const projectsHomeFilterOptions = [
          { id: "all", label: "All project types", description: "Show every project type." },
          { id: "active", label: "Active", description: "Show projects that still have open work." },
          { id: "completed", label: "Completed", description: "Show projects with no open issues." },
          ...PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.map((blueprint) => ({
            id: "type:" + blueprint.id,
            label: blueprint.title || blueprint.shortTitle || "Project type",
            description: blueprint.description || blueprint.shortTitle || "Filter by project type.",
          })),
        ];
        const activeBacklogFilterOption = backlogFilterOptions.find((option) => option.id === backlogFilterMode) || backlogFilterOptions[0];
        const activeBoardFilterOption = boardFilterOptions.find((option) => option.id === boardFilterMode) || boardFilterOptions[0];
        const activeBacklogSortOption = backlogSortOptions.find((option) => option.id === backlogSortMode) || backlogSortOptions[0];
        const activeProjectOverviewTaskFilterOption = projectOverviewTaskFilterOptions.find((option) => option.id === projectOverviewTaskFilterMode) || projectOverviewTaskFilterOptions[0];
        const activeProjectOverviewTaskSortOption = projectOverviewTaskSortOptions.find((option) => option.id === projectOverviewTaskSortMode) || projectOverviewTaskSortOptions[0];
        const activeProjectOverviewThreadFilterOption = projectOverviewThreadFilterOptions.find((option) => option.id === projectOverviewThreadFilterMode) || projectOverviewThreadFilterOptions[0];
        const activeProjectOverviewThreadSortOption = projectOverviewThreadSortOptions.find((option) => option.id === projectOverviewThreadSortMode) || projectOverviewThreadSortOptions[0];
        const activeProjectOverviewFileFilterOption = projectOverviewFileFilterOptions.find((option) => option.id === projectOverviewFileFilterMode) || projectOverviewFileFilterOptions[0];
        const activeProjectOverviewFileSortOption = projectOverviewFileSortOptions.find((option) => option.id === projectOverviewFileSortMode) || projectOverviewFileSortOptions[0];
        const activeReleaseFilterOption = releaseFilterOptions.find((option) => option.id === releaseFilterMode) || releaseFilterOptions[0];
        const activeReleaseSortOption = releaseSortOptions.find((option) => option.id === releaseSortMode) || releaseSortOptions[0];
        const activeReleaseBacklogFilterOption = backlogFilterOptions.find((option) => option.id === releaseBacklogFilterMode) || backlogFilterOptions[0];
        const activeReleaseBacklogSortOption = backlogSortOptions.find((option) => option.id === releaseBacklogSortMode) || backlogSortOptions[0];
        const activeProjectsHomeSortOption = projectsHomeSortOptions.find((option) => option.id === projectsHomeSortMode) || projectsHomeSortOptions[0];
        const activeProjectsHomeFilterOption = projectsHomeFilterOptions.find((option) => option.id === projectsHomeFilterMode) || projectsHomeFilterOptions[0];
        const sortedReleaseOptions = useMemo(() => releases.slice().sort(compareTaskReleaseOrder), [releases, releaseSortMode]);

        function taskHasStartedThread(task) {
          return Boolean(task?.lastStartedThreadId || (Array.isArray(task?.linkedThreadIds) && task.linkedThreadIds.length > 0));
        }

	        function isTaskThreadLaunchLocked(task) {
	          const normalizedTaskId = typeof task?.id === "string" ? task.id.trim() : "";
	          if (!normalizedTaskId) {
	            return false;
	          }
	          return taskRunPendingIds.includes(normalizedTaskId) || taskRunPendingIdsRef.current.has(normalizedTaskId);
	        }

        function getTaskStartedThreadId(task) {
          const lastStartedThreadId = typeof task?.lastStartedThreadId === "string"
            ? task.lastStartedThreadId.trim()
            : "";
          if (lastStartedThreadId) {
            return lastStartedThreadId;
          }

          const linkedThreadIds = Array.isArray(task?.linkedThreadIds)
            ? task.linkedThreadIds.filter((value) => typeof value === "string" && value.trim())
            : [];
          return linkedThreadIds.length > 0 ? linkedThreadIds[linkedThreadIds.length - 1] : "";
        }

        function buildPlaygroundTaskRunEnabledSkillsPayload(taskRecord) {
          const normalizedTaskRecord = normalizePlaygroundTaskRecord(taskRecord);
          const enabledSkillIds = getEffectivePlaygroundTaskEnabledSkillIds(normalizedTaskRecord);
          const defaultSkillMap = {
            image_generation: "imageGeneration",
            video_generation: "videoGeneration",
            web_search: "webSearch",
            deep_research: "deepResearch",
            pdf: "pdf",
            frontend_design: "frontendDesign",
            pptx: "pptx",
            memory: "memory",
            task_management: "taskManagement",
            app_platform: "appPlatform",
          };
          const payload = {};
          Object.entries(defaultSkillMap).forEach(([skillId, payloadKey]) => {
            payload[payloadKey] = enabledSkillIds.includes(skillId);
          });
          applyDemoSkillDefaultsToEnabledSkillsPayload(payload);
          if (enabledSkillIds.includes("computer_agents")) {
            payload.computerAgents = true;
          }
          if (getPlaygroundDirectSubtasks(normalizedTaskRecord).length > 0) {
            payload.taskManagement = true;
          }
          const customSkillIds = enabledSkillIds.filter((skillId) => !defaultSkillMap[skillId]);
          if (customSkillIds.length > 0) {
            payload.customSkills = customSkillIds
              .map((skillId) => {
                const matchingSkill = projectCustomSkills.find((skill) => skill?.id === skillId) || null;
                if (!matchingSkill) {
                  return null;
                }

                return {
                  id: matchingSkill.id,
                  name: typeof matchingSkill.name === "string" && matchingSkill.name.trim()
                    ? matchingSkill.name.trim()
                    : matchingSkill.id,
                  description: typeof matchingSkill.description === "string" ? matchingSkill.description : "",
                  markdown: typeof matchingSkill.markdown === "string" ? matchingSkill.markdown : "",
                  codeFiles: Array.isArray(matchingSkill.codeFiles)
                    ? matchingSkill.codeFiles
                        .filter((file) => file && typeof file === "object")
                        .map((file) => ({
                          name: typeof file.name === "string" ? file.name : "",
                          content: typeof file.content === "string" ? file.content : "",
                          language: typeof file.language === "string" ? file.language : undefined,
                        }))
                        .filter((file) => file.name)
                    : [],
                };
              })
              .filter((skill) => skill && Array.isArray(skill.codeFiles));
          }
          return payload;
        }

        function buildPlaygroundTaskGithubRepoReference(taskRecord, options = {}) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const attachments = normalizePlaygroundTaskAttachmentList(normalizedTask.attachments);
          const githubAttachment = attachments.find((attachment) =>
            getPlaygroundTaskAttachmentConnectorSource(attachment) === "github"
            && attachment.connectorRepoFullName
          ) || null;
          if (githubAttachment?.connectorRepoFullName && githubAttachment?.connectorRef) {
            const repoFullName = githubAttachment.connectorRepoFullName;
            return {
              repoFullName,
              repoName: repoFullName.split("/").pop() || repoFullName,
              branch: githubAttachment.connectorRef,
            };
          }

          const githubSelection = getDraftTaskConnectorSelection("github", normalizedTask);
          return buildPlaygroundGithubRepoReferenceFromConnectorSelection(githubSelection)
            || buildPlaygroundGithubRepoReferenceFromConnectorSelection(
              normalizePlaygroundTaskConnectorSelections(options?.projectConnectors || selectedProject?.connectors).github
            );
        }

        function buildPlaygroundTaskThreadPreview(taskRecord, threadId = "") {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const ticketNumber = taskTicketNumbersById[normalizedTask.id] || normalizedTask.ticketNumber || "000";
          const assigneeName = getTaskAssigneeName(normalizedTask.assigneeAgentId, "");
          const environmentDisplay = resolvePlaygroundTaskEnvironmentDisplay(normalizedTask, {
            projectRecord: selectedProject,
          });
          return {
            taskId: normalizedTask.id,
            projectId: normalizedTask.projectId || selectedProjectId || "",
            projectName: selectedProjectDetail?.project?.name || "",
            threadId: String(threadId || "").trim(),
            ticketNumber,
            title: normalizedTask.title || "Untitled Task",
            description: normalizedTask.description || "",
            taskColor: normalizedTask.taskColor || PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
            status: normalizedTask.status || "todo",
            priority: normalizedTask.priority || "medium",
            taskType: normalizePlaygroundTaskType(normalizedTask.taskType),
            assigneeAgentId: normalizedTask.assigneeAgentId || "",
            assigneeName,
            reviewRequired: normalizedTask.reviewRequired === true,
            reviewerAgentId: normalizedTask.reviewerAgentId || "",
            environmentId: environmentDisplay.environmentId,
            environmentName: environmentDisplay.description || environmentDisplay.label,
          };
        }

        function getPlaygroundProjectDefaultEnvironmentId(projectRecord = selectedProject) {
          const explicitProjectDefaultEnvironmentId = typeof projectRecord?.defaultEnvironmentId === "string" && projectRecord.defaultEnvironmentId.trim()
            ? projectRecord.defaultEnvironmentId.trim()
            : "";
          if (explicitProjectDefaultEnvironmentId) {
            return explicitProjectDefaultEnvironmentId;
          }
          const accountDefaultEnvironment = availableBacklogEnvironments.find((environment) => environment.isDefault) || null;
          if (accountDefaultEnvironment?.id) {
            return accountDefaultEnvironment.id;
          }
          return availableBacklogEnvironments[0]?.id || "";
        }

        async function readProjectGithubPreparationError(response, fallbackMessage) {
          const contentType = String(response?.headers?.get("content-type") || "").toLowerCase();
          if (contentType.includes("application/json")) {
            const data = await response.json().catch(() => ({}));
            return data?.message || data?.error || fallbackMessage;
          }
          const text = await response.text().catch(() => "");
          return text || fallbackMessage;
        }

        function buildProjectGithubPreparationHeaders() {
          const headers = new Headers(requestHeaders || {});
          headers.set("Content-Type", "application/json");
          if (effectiveApiKey && !headers.has("X-API-Key")) {
            headers.set("X-API-Key", effectiveApiKey);
          }
          return headers;
        }

        function emitProjectGithubPreparationStatus(projectRecord, environmentId, repoReference, phase, error = "") {
          if (typeof onStatusIndicatorItemChange !== "function" || !projectRecord?.id || !repoReference?.repoFullName) {
            return;
          }
          const environmentName = availableBacklogEnvironments.find((environment) => environment.id === environmentId)?.name || "";
          onStatusIndicatorItemChange(buildProjectGithubPreparationStatusIndicatorItem({
            projectId: projectRecord.id,
            repoFullName: repoReference.repoFullName,
            branch: repoReference.branch,
            environmentName,
            phase,
            error,
          }));
        }

        async function prepareProjectGithubConnectorRepositories(projectRecord, githubSelection) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const repoReferences = buildPlaygroundGithubRepoReferencesFromConnectorSelection(githubSelection);
          if (!normalizedProject?.id || repoReferences.length === 0) {
            return;
          }
          const targetEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(normalizedProject);
          if (!targetEnvironmentId) {
            throw new Error("Select a project environment before connecting a GitHub repository.");
          }

          await Promise.all(repoReferences.map(async (repoReference) => {
            const preparationKey = [
              normalizedProject.id,
              targetEnvironmentId,
              repoReference.repoFullName,
              repoReference.branch || "main",
            ].join("::");
            const existingPromise = projectGithubPreparationPromisesRef.current.get(preparationKey);
            if (existingPromise) {
              await existingPromise;
              return;
            }

            const preparationPromise = (async () => {
              emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "starting");
              const startResponse = await fetch(backendUrl + "/environments/" + encodeURIComponent(targetEnvironmentId) + "/start", {
                method: "POST",
                headers: buildProjectGithubPreparationHeaders(),
                body: JSON.stringify({}),
              });
              if (!startResponse.ok) {
                throw new Error(await readProjectGithubPreparationError(startResponse, "Failed to start the project environment."));
              }

              emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "running");
              const prepareResponse = await fetch(backendUrl + "/environments/" + encodeURIComponent(targetEnvironmentId) + "/github/prepare", {
                method: "POST",
                headers: buildProjectGithubPreparationHeaders(),
                body: JSON.stringify({
                  repoFullName: repoReference.repoFullName,
                  branch: repoReference.branch || "main",
                }),
              });
              if (!prepareResponse.ok) {
                throw new Error(await readProjectGithubPreparationError(prepareResponse, "Failed to prepare the GitHub repository."));
              }
              emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "finished");
            })()
              .catch((error) => {
                const errorMessage = error instanceof Error ? error.message : "Failed to prepare the GitHub repository.";
                emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "failed", errorMessage);
                throw error;
              })
              .finally(() => {
                projectGithubPreparationPromisesRef.current.delete(preparationKey);
              });

            projectGithubPreparationPromisesRef.current.set(preparationKey, preparationPromise);
            await preparationPromise;
          }));
        }

        function resolvePlaygroundTaskEnvironmentDisplay(taskRecord, options = {}) {
          const projectRecord = options?.projectRecord || selectedProject;
          const explicitEnvironmentId = typeof taskRecord?.environmentId === "string" && taskRecord.environmentId.trim()
            ? taskRecord.environmentId.trim()
            : "";
          const projectDefaultEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(projectRecord);
          const resolvedEnvironmentId = explicitEnvironmentId || projectDefaultEnvironmentId;
          const resolvedEnvironment = resolvedEnvironmentId
            ? availableBacklogEnvironments.find((environment) => environment.id === resolvedEnvironmentId) || null
            : null;

          if (!explicitEnvironmentId && projectDefaultEnvironmentId) {
            return {
              environmentId: projectDefaultEnvironmentId,
              label: "Project Default",
              description: resolvedEnvironment?.name || "Uses the project's default environment",
            };
          }

          if (resolvedEnvironment) {
            return {
              environmentId: resolvedEnvironment.id,
              label: resolvedEnvironment.name || "Environment",
              description: resolvedEnvironment.isDefault ? "Default environment" : "",
            };
          }

          if (resolvedEnvironmentId) {
            return {
              environmentId: resolvedEnvironmentId,
              label: resolvedEnvironmentId,
              description: "",
            };
          }

          return {
            environmentId: "",
            label: projectRecord ? "Project Default" : "Default",
            description: projectRecord
              ? "Uses the project's default environment"
              : "Uses your default environment",
          };
        }

        function buildPlaygroundTaskLaunchRecord(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata(taskRecord));
          const attachments = normalizePlaygroundTaskAttachmentList(normalizedTask.attachments);
          const attachmentConnectorItemIdsByKey = {};

          PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
            attachmentConnectorItemIdsByKey[option.key] = new Set();
          });

          attachments.forEach((attachment) => {
            const connectorSource = getPlaygroundTaskAttachmentConnectorSource(attachment);
            const connectorKey = getPlaygroundTaskConnectorKey(connectorSource);
            const connectorItemId = String(attachment?.connectorItemId || "").trim();
            if (!connectorKey || !connectorItemId || !attachmentConnectorItemIdsByKey[connectorKey]) {
              return;
            }
            attachmentConnectorItemIdsByKey[connectorKey].add(connectorItemId);
          });

          const currentConnectors = normalizePlaygroundTaskConnectorSelections(normalizedTask.connectors);
          const nextConnectors = buildPlaygroundDefaultTaskConnectors();

          PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
            const selection = currentConnectors[option.key];
            if (!selection) {
              nextConnectors[option.key] = null;
              return;
            }

            if (option.key === "notion") {
              nextConnectors[option.key] = selection;
              return;
            }

            const attachmentConnectorItemIds = attachmentConnectorItemIdsByKey[option.key] || new Set();
            const retainedItems = (Array.isArray(selection.items) ? selection.items : [])
              .map((item) => normalizePlaygroundTaskConnectorItem(item))
              .filter(Boolean)
              .filter((item) => {
                if (option.key === "github" && item.isFolder && !String(item.path || "").trim() && item.repoFullName) {
                  return true;
                }
                return attachmentConnectorItemIds.has(item.id);
              });

            nextConnectors[option.key] = retainedItems.length > 0
              ? buildPlaygroundTaskConnectorSelection(option.source, retainedItems, retainedItems.map((item) => item.id))
              : null;
          });

          return normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...normalizedTask,
            attachments,
            connectors: nextConnectors,
          }));
        }

        function mergePlaygroundAttachmentLists(...lists) {
          const mergedByKey = new Map();
          lists.forEach((list) => {
            normalizePlaygroundTaskAttachmentList(list).forEach((attachment) => {
              const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
              const attachmentKey = [
                normalizedAttachment.id,
                normalizeHistoryPath(normalizedAttachment.workspacePath),
                normalizeHistoryPath(normalizedAttachment.sourcePath),
                normalizedAttachment.filename,
              ].find((value) => typeof value === "string" && value.trim()) || generateId("attachment");
              if (!mergedByKey.has(attachmentKey)) {
                mergedByKey.set(attachmentKey, normalizedAttachment);
              }
            });
          });
          return Array.from(mergedByKey.values());
        }

        function getPlaygroundDirectSubtasks(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const taskId = String(normalizedTask?.id || "").trim();
          if (!taskId) {
            return [];
          }
          return (allTaskChildrenByParentId[taskId] || [])
            .map((subtask) => normalizePlaygroundTaskRecord(subtask))
            .filter((subtask) => subtask?.id)
            .sort(compareBacklogTaskOrder);
        }

        function getIncompletePlaygroundDirectSubtasks(taskRecord) {
          return getPlaygroundDirectSubtasks(taskRecord)
            .filter((subtask) => String(subtask.status || "").trim() !== "done");
        }

        function formatIncompleteSubtasksMessage(incompleteSubtasks) {
          const labels = (Array.isArray(incompleteSubtasks) ? incompleteSubtasks : [])
            .slice(0, 3)
            .map((subtask) => taskTicketNumbersById[subtask.id] || subtask.ticketNumber || subtask.title || subtask.id)
            .filter(Boolean);
          const suffix = incompleteSubtasks.length > labels.length
            ? " +" + String(incompleteSubtasks.length - labels.length) + " more"
            : "";
          return "Finish subtasks before closing parent: " + labels.join(", ") + suffix;
        }

        function buildPlaygroundTaskSubtaskPromptSection(taskRecord) {
          const directSubtasks = getPlaygroundDirectSubtasks(taskRecord);
          if (directSubtasks.length === 0) {
            return "";
          }
          const newline = String.fromCharCode(10);
          const subtaskLines = directSubtasks.map((subtask) => {
            const ticketNumber = taskTicketNumbersById[subtask.id] || subtask.ticketNumber || "000";
            const dependencyIds = Array.isArray(subtask.dependencyIds)
              ? subtask.dependencyIds.filter((dependencyId) => typeof dependencyId === "string" && dependencyId.trim())
              : [];
            const dependencyLabel = dependencyIds.length > 0
              ? " | dependencies=" + dependencyIds.map((dependencyId) => taskTicketNumbersById[dependencyId] || dependencyId).join(", ")
              : "";
            const threadId = getTaskStartedThreadId(subtask);
            const threadLabel = threadId ? " | thread=" + threadId : "";
            const descriptionPreview = String(subtask.description || "").replace(/\\s+/g, " ").trim();
            return [
              "- " + subtask.id + " · " + ticketNumber + " · " + (subtask.title || "Untitled Subtask"),
              "status=" + getPlaygroundTaskStatusLabel(subtask.status),
              "priority=" + getPlaygroundTaskPriorityLabel(subtask.priority),
              "assignee=" + (getTaskAssigneeName(subtask.assigneeAgentId, "Unassigned") || "Unassigned"),
              dependencyLabel ? dependencyLabel.slice(3) : null,
              threadLabel ? threadLabel.slice(3) : null,
              descriptionPreview ? ("desc=" + descriptionPreview) : null,
            ].filter(Boolean).join(" | ");
          });
          return [
            "Available subtasks:",
            ...subtaskLines,
            "",
            "Subtask orchestration:",
            "- Decide at runtime which subtasks should be started. Do not start every subtask automatically.",
            "- Use the task-management skill to run child task threads when they should be handled separately.",
            "- If this parent task needs a subtask result before continuing, run or wait for that subtask thread and inspect the result before continuing.",
            "- If a subtask can progress independently, launch it in parallel and continue this parent task; wait later only if its result becomes necessary.",
            "- Avoid parallel child work that touches the same files, environment state, credentials, or external resources in conflicting ways.",
            "- After using a subtask result, add a concise comment/status update to the subtask and update its status when appropriate.",
            "- Do not mark this parent task done until every direct subtask is done. If any direct subtask remains open, leave this parent task in progress and explain what is still waiting.",
          ].join(newline);
        }

        function buildPlaygroundTaskRunPrompt(taskRecord, options = {}) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const ticketNumber = taskTicketNumbersById[normalizedTask.id] || normalizedTask.ticketNumber || "000";
          const newline = String.fromCharCode(10);
          const paragraphBreak = newline + newline;
	          const reviewRequestBody = typeof options?.reviewRequestBody === "string"
	            ? options.reviewRequestBody.trim()
	            : "";
	          const normalizedTaskStatus = String(normalizedTask.status || "").trim().toLowerCase();
	          const projectId = String(normalizedTask.projectId || selectedProjectId || selectedProject?.id || "").trim();
		          const projectName = String(
		            selectedProject?.id && projectId && selectedProject.id === projectId
		              ? selectedProject.name || ""
		              : selectedProject?.name || ""
		          ).trim();
			          const projectStrategySection = buildPlaygroundProjectStrategyBriefPromptSection(selectedProject, {
			            taskRecord: normalizedTask,
			          });
			          const projectRulesSection = buildPlaygroundProjectRulesPromptSection(selectedProject);
			          const projectResourcesSection = buildPlaygroundProjectResourcePromptSection(selectedProject, {
			            projectId,
			            projectName,
			            projectAttachments: options?.projectAttachments,
			          });
			          const directResponseTask = isPlaygroundDirectResponseTask(normalizedTask);
	          const independentReviewerId = getPlaygroundIndependentReviewerId(normalizedTask);
	          const inReviewImplementationGuard = normalizedTaskStatus === "in_review" && !reviewRequestBody
	            ? [
	                "In-review ticket guard:",
	                "- This is not a reviewer approval run. Do not approve this ticket and do not move it to Finished/done.",
	                "- If the user only asks a conversational question, answer that question and leave the ticket status unchanged.",
                "- If the user explicitly asks for implementation or rework, do the requested work and leave the ticket In Review when finished so the configured reviewer can accept it.",
              ].join(newline)
	            : "";
		          const assigneeName = getTaskAssigneeName(normalizedTask.assigneeAgentId, "None") || "None";
		          const reviewerName = independentReviewerId
		            ? (getTaskAssigneeName(independentReviewerId, "Reviewer") || "Reviewer")
		            : normalizedTask.reviewRequired && normalizedTask.reviewerAgentId
		              ? "No independent reviewer configured"
		            : "No review required";
          const environmentDisplay = resolvePlaygroundTaskEnvironmentDisplay(normalizedTask, {
            projectRecord: selectedProject,
          });
          const environmentName = environmentDisplay.label === "Project Default" && environmentDisplay.description
            ? "Project Default (" + environmentDisplay.description + ")"
            : environmentDisplay.label;
          const connectorLines = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, normalizedTask);
            if (!selection?.valueLabel) {
              return null;
            }
            return "- " + option.label + ": " + selection.valueLabel;
          }).filter(Boolean);
          const commentLines = normalizePlaygroundTaskCommentList(normalizedTask.comments)
            .slice()
            .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")))
            .map((comment) => "- " + (comment.authorName || "Computer Agents") + ": " + comment.text);
          const skillNames = getEffectivePlaygroundTaskEnabledSkillIds(normalizedTask)
            .map((skillId) => resolveTaskSkillItem(skillId)?.name || skillId)
            .filter(Boolean);
          const taskAttachmentsSection = buildPlaygroundAttachmentPromptSection("Task attachments:", normalizedTask.attachments, {
            copy: "These files are attached specifically to this task.",
          });
	          const projectAttachmentsSection = buildPlaygroundAttachmentPromptSection(
	            "Project attachments:",
            options?.projectAttachments,
            {
              copy: "These files belong to the whole project and should be treated as shared project context for this task.",
            }
          );
          const subtasksSection = buildPlaygroundTaskSubtaskPromptSection(normalizedTask);
	          return wrapPlaygroundHiddenSystemPrompt([
	            "Run this backlog ticket as configured.",
	            projectName || projectId ? "Project: " + [projectName, projectId ? "(" + projectId + ")" : ""].filter(Boolean).join(" ") : "",
	            "Task ID: " + normalizedTask.id,
	            "Ticket: " + ticketNumber,
	            "Title: " + (normalizedTask.title || "Untitled Task"),
		            "Type: " + getPlaygroundTaskTypeLabel(normalizedTask.taskType),
		            "Status: " + getPlaygroundTaskStatusLabel(normalizedTask.status),
		            "Priority: " + getPlaygroundTaskPriorityLabel(normalizedTask.priority),
		            "Assignee: " + assigneeName,
		            "Review: " + reviewerName,
		            "Environment: " + environmentName,
			            skillNames.length > 0
			              ? (directResponseTask ? "Skills: None needed for this response-only ticket." : "Skills: " + skillNames.join(", "))
			              : "",
			            connectorLines.length > 0 ? "Connectors:" + newline + connectorLines.join(newline) : "",
				            projectStrategySection,
				            projectRulesSection,
				            projectResourcesSection,
				            [
	              "Execution expectations:",
	              "- The project id and task id above are authoritative. Do not list projects or tasks just to discover this ticket.",
	              "- Use Task Management, Computer Agents, filesystem, browser, or shell tools only when the ticket cannot be completed from the provided title, description, attachments, and comments.",
	              directResponseTask ? "- This is a response-only ticket. Reply directly, do not call tools, do not inspect projects/tasks, do not update task status, and obey wording constraints such as nothing more." : "",
	                reviewRequestBody ? "- This run is a reviewer change request. Address the latest review request before treating the ticket as complete." : "",
	              "- If the ticket creates or changes deployable web apps, functions, databases, or integrations, deploy and smoke-test the affected resource unless the ticket explicitly excludes deployment.",
	              "- If you need user-owned inputs such as API keys, credentials, billing decisions, repository access, or product decisions, create a focused human-assigned resource request ticket instead of guessing.",
	              "- Do not update this ticket's own status directly. The platform will move it to In Review or Finished after the run. Only update subtasks, add comments, or create resource-request tickets when that is genuinely part of the work.",
	              independentReviewerId ? "- When implementation is complete, leave the ticket ready for the configured reviewer; do not perform the review yourself." : "",
			            ].filter(Boolean).join(newline),
		            inReviewImplementationGuard,
		            normalizedTask.description
              ? "Description:" + newline + normalizedTask.description
              : "Description:" + newline + "None provided.",
            reviewRequestBody ? "Latest review request:" + newline + reviewRequestBody : "",
            commentLines.length > 0 ? "Comments:" + newline + commentLines.join(newline) : "",
            subtasksSection,
            taskAttachmentsSection,
            projectAttachmentsSection,
          ].filter(Boolean).join(paragraphBreak));
        }

        function buildPlaygroundMissionControlTaskSnapshot(taskRecords) {
          const sortedTaskRecords = (Array.isArray(taskRecords) ? taskRecords : [])
            .map((taskRecord) => normalizePlaygroundTaskRecord(taskRecord))
            .filter((taskRecord) => taskRecord?.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });

          if (sortedTaskRecords.length === 0) {
            return "Existing tasks:\\n- No backlog tasks exist yet.";
          }

          return [
            "Existing tasks:",
            ...sortedTaskRecords.map((taskRecord) => {
              const ticketNumber = taskTicketNumbersById[taskRecord.id] || taskRecord.ticketNumber || "000";
              const releaseName = taskRecord.releaseId ? (releasesById[taskRecord.releaseId]?.name || "Milestone") : "All other";
              const descriptionPreview = String(taskRecord.description || "").replace(/\\s+/g, " ").trim();
              const blockedByTaskId = Array.isArray(taskRecord.dependencyIds) ? String(taskRecord.dependencyIds[0] || "").trim() : "";
              const blockedByTicketNumber = blockedByTaskId ? (taskTicketNumbersById[blockedByTaskId] || blockedByTaskId) : "";
              const skillNames = getEffectivePlaygroundTaskEnabledSkillIds(taskRecord)
                .map((skillId) => resolveTaskSkillItem(skillId)?.name || skillId)
                .filter(Boolean);
              const environmentLabel = resolvePlaygroundTaskEnvironmentDisplay(taskRecord, {
                projectRecord: selectedProject,
              }).label;
              return [
                "- " + ticketNumber + " · " + (taskRecord.title || "Untitled Task"),
                "  status=" + getPlaygroundTaskStatusLabel(taskRecord.status),
                "priority=" + getPlaygroundTaskPriorityLabel(taskRecord.priority),
                "type=" + getPlaygroundTaskTypeLabel(taskRecord.taskType),
                "milestone=" + releaseName,
                "assignee=" + (getTaskAssigneeName(taskRecord.assigneeAgentId, "Unassigned") || "Unassigned"),
                taskRecord.reviewRequired ? ("reviewer=" + (getTaskAssigneeName(taskRecord.reviewerAgentId, "Reviewer") || "Reviewer")) : null,
                "environment=" + environmentLabel,
                blockedByTicketNumber ? ("blocked_by=" + blockedByTicketNumber) : null,
                skillNames.length > 0 ? ("skills=" + skillNames.join(", ")) : null,
                descriptionPreview ? ("desc=" + descriptionPreview) : null,
              ].filter(Boolean).join(" | ");
            }),
          ].join("\\n");
        }

        function buildPlaygroundMissionControlAgentSnapshot(agentRecords, preferredAgentId = "") {
          const normalizedPreferredAgentId = String(preferredAgentId || "").trim();
          const sortedAgentRecords = (Array.isArray(agentRecords) ? agentRecords : [])
            .filter((agentRecord) => agentRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));

          if (sortedAgentRecords.length === 0) {
            return "Available agents:\\n- No agents are configured yet.";
          }

          return [
            "Available agents:",
            ...sortedAgentRecords.map((agentRecord) => {
              const descriptionPreview = String(agentRecord.description || "").replace(/\\s+/g, " ").trim();
              return [
                "- " + (agentRecord.name || agentRecord.id),
                "id=" + agentRecord.id,
                normalizedPreferredAgentId && agentRecord.id === normalizedPreferredAgentId ? "selected_for_this_run=true" : null,
                agentRecord.isDefault ? "default=true" : null,
                agentRecord.model ? ("model=" + agentRecord.model) : null,
                descriptionPreview ? ("desc=" + descriptionPreview) : null,
              ].filter(Boolean).join(" | ");
            }),
          ].join("\\n");
        }

        function buildPlaygroundMissionControlReleaseSnapshot(releaseRecords) {
          const sortedReleaseRecords = (Array.isArray(releaseRecords) ? releaseRecords : [])
            .filter((releaseRecord) => releaseRecord?.id)
            .slice()
            .sort(compareTaskReleaseOrder);

          if (sortedReleaseRecords.length === 0) {
            return "Existing milestones:\\n- No milestones exist yet.";
          }

          return [
            "Existing milestones:",
            ...sortedReleaseRecords.map((releaseRecord) => {
              const releaseDeadlineLabel = formatPlaygroundTaskReleaseDateRange(releaseRecord);
              return [
                "- " + (releaseRecord.name || "Untitled Milestone"),
                releaseRecord.description ? ("desc=" + String(releaseRecord.description).replace(/\\s+/g, " ").trim()) : null,
                "deadline=" + (releaseDeadlineLabel === "No dates" ? "No deadlines" : releaseDeadlineLabel),
                "open_tasks=" + String(Number.isFinite(releaseRecord.openTaskCount) ? releaseRecord.openTaskCount : 0),
              ].filter(Boolean).join(" | ");
            }),
          ].join("\\n");
        }

        function buildPlaygroundMissionControlSkillSnapshot(systemSkillRecords, customSkillRecords) {
          const builtInSkillInvocationNames = {
            image_generation: "image-generation",
            video_generation: "video-generation",
            web_search: "web-search",
            deep_research: "deep-research",
            frontend_design: "frontend-design",
            task_management: "task-management",
            computer_agents: "computer-agents",
            app_platform: "app-platform",
          };
          const normalizedSystemSkillRecords = (Array.isArray(systemSkillRecords) ? systemSkillRecords : [])
            .filter((skillRecord) => skillRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || "")));
          const normalizedCustomSkillRecords = (Array.isArray(customSkillRecords) ? customSkillRecords : [])
            .filter((skillRecord) => skillRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || "")));

          return [
            "Available skills:",
            normalizedSystemSkillRecords.length > 0
              ? ("- System skills: " + normalizedSystemSkillRecords.map((skillRecord) => {
                  const skillId = String(skillRecord.id || "").trim();
                  const displayName = skillRecord.name || skillId;
                  const invocationName = builtInSkillInvocationNames[skillId] || skillId;
                  if (invocationName && invocationName !== skillId) {
                    return displayName + " [invoke as " + invocationName + "; attach id " + skillId + "]";
                  }
                  return displayName + " [id " + skillId + "]";
                }).join(", "))
              : "- System skills: None listed.",
            normalizedCustomSkillRecords.length > 0
              ? ("- Custom skills: " + normalizedCustomSkillRecords.map((skillRecord) => {
                  const skillId = String(skillRecord.id || "").trim();
                  return (skillRecord.name || skillId) + " [id " + skillId + "]";
                }).join(", "))
              : "- Custom skills: None yet.",
          ].join("\\n");
        }

        function buildPlaygroundMissionControlEnvironmentSnapshot(environmentRecords, defaultEnvironmentId = "") {
          const normalizedDefaultEnvironmentId = String(defaultEnvironmentId || "").trim();
          const normalizedEnvironmentRecords = (Array.isArray(environmentRecords) ? environmentRecords : [])
            .filter((environmentRecord) => environmentRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));

          if (normalizedEnvironmentRecords.length === 0) {
            return "Available environments:\\n- No environments are configured yet.";
          }

          return [
            "Available environments:",
            ...normalizedEnvironmentRecords.map((environmentRecord) => [
              "- " + (environmentRecord.name || environmentRecord.id),
              "id=" + environmentRecord.id,
              environmentRecord.id === normalizedDefaultEnvironmentId ? "project_default=true" : null,
              environmentRecord.isDefault ? "account_default=true" : null,
            ].filter(Boolean).join(" | ")),
          ].join("\\n");
        }

        function stripPlaygroundMissionControlCodeBlock(markdown) {
          return String(markdown || "").replace(/\\x60\\x60\\x60mission_control_json[\\s\\S]*?\\x60\\x60\\x60/gi, "").trim();
        }

        function sanitizePlaygroundMissionControlDocument(markdown) {
          const rawDocument = stripPlaygroundMissionControlCodeBlock(markdown);
          if (!rawDocument) {
            return "";
          }

          const normalizedDocument = String(rawDocument).trim();
          const strategyStartMatch = normalizedDocument.match(
            /(?:^|\\n)\\s*(#{1,6}\\s*)?(Strategy Summary|Strategic Breakdown|Risks?\\s*(?:&|and)\\s*Opportunities|Recommended Next Moves)\\b/i
          );
          if (!strategyStartMatch || typeof strategyStartMatch.index !== "number") {
            return normalizedDocument;
          }

          const strategyStartIndex = Math.max(0, strategyStartMatch.index + (strategyStartMatch[0].startsWith("\\n") ? 1 : 0));
          return normalizedDocument.slice(strategyStartIndex).trim();
        }

        function extractPlaygroundMissionControlSummary(document) {
          const plainText = String(document || "")
            .replace(/\\x60\\x60\\x60[\\s\\S]*?\\x60\\x60\\x60/g, " ")
            .replace(/[\\x60*_>#-]/g, " ")
            .replace(/\\[(.*?)\\]\\((.*?)\\)/g, "$1")
            .replace(/\\s+/g, " ")
            .trim();
          if (!plainText) {
            return "";
          }
          const sentenceMatches = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
          const summary = sentenceMatches.slice(0, 2).join(" ").trim() || plainText;
          return summary.length > 260 ? summary.slice(0, 257).trimEnd() + "…" : summary;
        }

        function getPlaygroundProjectStrategyBriefRecord(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : null;
          const missionControl = getPlaygroundProjectMissionControlRecord(project);
          const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControl.strategyBrief);
          const projectGoal = normalizePlaygroundStrategyText(project?.description || metadata?.description);
          if (projectGoal) {
            strategyBrief.mission = projectGoal;
          } else if (!strategyBrief.mission && missionControl.summary) {
            strategyBrief.mission = normalizePlaygroundStrategyText(missionControl.summary);
          }
          if (!strategyBrief.mission && missionControl.document) {
            strategyBrief.mission = extractPlaygroundMissionControlSummary(missionControl.document);
          }
          return strategyBrief;
        }

        function getPlaygroundTaskStrategyOutcomeId(taskRecord) {
          const metadata = taskRecord?.metadata && typeof taskRecord.metadata === "object" && !Array.isArray(taskRecord.metadata)
            ? taskRecord.metadata
            : null;
          const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : null;
          return normalizePlaygroundStrategyText(
            taskRecord?.strategyOutcomeId
            || metadata?.strategyOutcomeId
            || runnerPlayground?.strategyOutcomeId
          );
        }

        function findPlaygroundStrategyOutcomeForTask(strategyBrief, taskRecord) {
          const normalizedStrategy = normalizePlaygroundProjectStrategyBrief(strategyBrief);
          const outcomes = normalizedStrategy.outcomes;
          if (!outcomes.length || !taskRecord) {
            return null;
          }
          const taskOutcomeId = getPlaygroundTaskStrategyOutcomeId(taskRecord);
          const releaseId = normalizePlaygroundStrategyText(taskRecord.releaseId);
          if (taskOutcomeId) {
            const matchedOutcome = outcomes.find((outcome) => outcome.id === taskOutcomeId);
            if (matchedOutcome) {
              return matchedOutcome;
            }
          }
          if (releaseId) {
            const matchedOutcome = outcomes.find((outcome) =>
              normalizePlaygroundStrategyOutcomeReleaseIds(outcome).includes(releaseId)
            );
            if (matchedOutcome) {
              return matchedOutcome;
            }
          }
          const taskText = normalizePlaygroundStrategyText([taskRecord.title, taskRecord.description].filter(Boolean).join(" ")).toLowerCase();
          if (taskText) {
            return outcomes.find((outcome) => {
              const title = normalizePlaygroundStrategyText(outcome.title).toLowerCase();
              return title.length >= 8 && taskText.includes(title);
            }) || null;
          }
          return null;
        }

        function formatPlaygroundStrategyPromptList(label, values) {
          const items = normalizePlaygroundStrategyTextList(values);
          if (!items.length) {
            return "";
          }
          const newline = String.fromCharCode(10);
          return label + ":" + newline + items.map((item) => "- " + item).join(newline);
        }

        function buildPlaygroundProjectStrategyBriefPromptSection(project, options = {}) {
          const strategyBrief = getPlaygroundProjectStrategyBriefRecord(project);
          const newline = String.fromCharCode(10);
          const sections = [];
          if (strategyBrief.mission) {
            sections.push("Goal: " + strategyBrief.mission);
          }
          if (strategyBrief.outcomes.length > 0) {
            sections.push([
              "Primary outcomes:",
              ...strategyBrief.outcomes.map((outcome, index) => {
                const prefix = String(index + 1) + ". " + (outcome.title || "Outcome");
                const releaseIds = normalizePlaygroundStrategyOutcomeReleaseIds(outcome);
                const details = [
                  outcome.description,
                  releaseIds.length > 0 ? "Milestones: " + releaseIds.join(", ") : "",
                  outcome.successCriteria.length > 0 ? "Success: " + outcome.successCriteria.join("; ") : "",
                ].filter(Boolean).join(" ");
                return "- " + prefix + (details ? " — " + details : "");
              }),
            ].join(newline));
          }
          const taskOutcome = findPlaygroundStrategyOutcomeForTask(strategyBrief, options?.taskRecord);
          if (taskOutcome) {
            sections.push([
              "This task supports outcome: " + (taskOutcome.title || taskOutcome.id),
              taskOutcome.description ? "Outcome context: " + taskOutcome.description : "",
              taskOutcome.successCriteria.length > 0 ? "Outcome success criteria:" + newline + taskOutcome.successCriteria.map((item) => "- " + item).join(newline) : "",
            ].filter(Boolean).join(newline));
          }
          const scopeLines = [
            formatPlaygroundStrategyPromptList("In scope", strategyBrief.inScope),
            formatPlaygroundStrategyPromptList("Out of scope", strategyBrief.outOfScope),
          ].filter(Boolean).join(newline);
          if (scopeLines) {
            sections.push("Scope boundaries:" + newline + scopeLines);
          }
          [
            formatPlaygroundStrategyPromptList("Project success criteria", strategyBrief.successCriteria),
            formatPlaygroundStrategyPromptList("Risks and assumptions", strategyBrief.risks),
            formatPlaygroundStrategyPromptList("Key decisions", strategyBrief.decisions),
          ].filter(Boolean).forEach((section) => sections.push(section));
          if (!sections.length) {
            return "";
          }
	          return "Project goal and strategy:" + newline + sections.join(newline + newline);
	        }

	        function normalizePlaygroundMissionControlProjectRulesOutput(value) {
	          if (Array.isArray(value)) {
	            return serializePlaygroundProjectRuleEntries(value);
	          }
	          const normalized = normalizePlaygroundProjectRuleEntry(value);
	          if (!normalized) {
	            return "";
	          }
	          const paragraphEntries = splitPlaygroundProjectRuleEntries(normalized);
	          if (paragraphEntries.length > 1) {
	            return serializePlaygroundProjectRuleEntries(paragraphEntries);
	          }
	          return serializePlaygroundProjectRuleEntries(
	            normalized
	              .split(/\\n+/)
	              .map((entry) => normalizePlaygroundProjectRuleEntry(entry))
	              .filter(Boolean)
	          );
	        }
	        function parsePlaygroundMissionControlResponseContent(content) {
	          const rawContent = String(content || "").trim();
	          if (!rawContent) {
	            return buildEmptyPlaygroundProjectMissionControl();
          }

          const codeBlockMatch = rawContent.match(/\\x60\\x60\\x60mission_control_json\\s*([\\s\\S]*?)\\x60\\x60\\x60/i);
          let parsedBlock = null;
          if (codeBlockMatch?.[1]) {
            try {
              parsedBlock = JSON.parse(codeBlockMatch[1]);
            } catch {}
          }

          const document = sanitizePlaygroundMissionControlDocument(parsedBlock?.document || "")
            || sanitizePlaygroundMissionControlDocument(rawContent)
            || rawContent;
          const summary = String(parsedBlock?.summary || "").trim() || extractPlaygroundMissionControlSummary(document);
	          const strategyBrief = normalizePlaygroundProjectStrategyBrief(
	            parsedBlock?.strategyBrief
	            || parsedBlock?.structuredStrategy
	            || parsedBlock?.strategy
	          );
	          const normalizedRecord = normalizePlaygroundProjectMissionControlRecord({
	            summary,
	            document,
	            strategyBrief,
	            lastThreadId: "",
	            updatedAt: new Date().toISOString(),
	          });
	          if (
	            parsedBlock
	            && typeof parsedBlock === "object"
	            && !Array.isArray(parsedBlock)
	            && Object.prototype.hasOwnProperty.call(parsedBlock, "projectRules")
	          ) {
	            normalizedRecord.projectRules = normalizePlaygroundMissionControlProjectRulesOutput(parsedBlock.projectRules);
	            normalizedRecord.projectRulesReplace = parsedBlock.projectRulesReplace === true;
	          }
	          return normalizedRecord;
	        }

        async function fetchPlaygroundThreadMessages(threadId) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) {
            return [];
          }

          const pageSize = 200;
          const messages = [];
          let offset = 0;

          while (true) {
            const response = await fetch(
              backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/messages?limit=" + pageSize + "&offset=" + offset + "&compact=1",
              {
                method: "GET",
                headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load Mission Control thread messages.");
            }
            const pageItems = Array.isArray(data?.data) ? data.data : [];
            messages.push(...pageItems);
            if (!data?.has_more || pageItems.length === 0) {
              break;
            }
            offset += pageItems.length;
          }

          return messages;
        }

        function getPlaygroundThreadMessageText(message) {
          if (typeof message?.content === "string") {
            return message.content;
          }
          if (Array.isArray(message?.content)) {
            return message.content
              .map((item) => {
                if (typeof item === "string") {
                  return item;
                }
                if (typeof item?.text === "string") {
                  return item.text;
                }
                if (typeof item?.content === "string") {
                  return item.content;
                }
                return "";
              })
              .filter(Boolean)
              .join("\\n")
              .trim();
          }
          return "";
        }

        function getPlaygroundThreadMessageAttachments(message) {
          const directAttachments = normalizePlaygroundTaskAttachmentList(message?.attachments);
          if (directAttachments.length > 0) {
            return directAttachments;
          }
          const logMetadata = message?.logMetadata && typeof message.logMetadata === "object" && !Array.isArray(message.logMetadata)
            ? message.logMetadata
            : null;
          return normalizePlaygroundTaskAttachmentList(logMetadata?.attachments);
        }

        function getPlaygroundMissionControlContentScore(content) {
          const rawContent = String(content || "").trim();
          if (!rawContent) {
            return 0;
          }

          let score = 0;
          if (/\\x60\\x60\\x60mission_control_json/i.test(rawContent)) {
            score += 240;
          }
          if (/strategy summary/i.test(rawContent)) {
            score += 80;
          }
          if (/strategic breakdown/i.test(rawContent)) {
            score += 60;
          }
          if (/risks?\\s*(?:&|and)\\s*opportunit/i.test(rawContent)) {
            score += 60;
          }
          if (/recommended next moves/i.test(rawContent)) {
            score += 50;
          }
          if (/mission control/i.test(rawContent)) {
            score += 20;
          }
          if (rawContent.length >= 400) {
            score += 20;
          }
          return score;
        }

        function isPlaygroundMissionControlReadableAttachment(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment || normalizedAttachment.type === "image") {
            return false;
          }
          const normalizedFilename = String(normalizedAttachment.filename || "").trim().toLowerCase();
          const normalizedMimeType = String(normalizedAttachment.mimeType || "").trim().toLowerCase();
          const extension = normalizedFilename.split(".").pop() || "";
          if (normalizedMimeType.startsWith("text/") || normalizedMimeType.includes("json") || normalizedMimeType.includes("markdown")) {
            return true;
          }
          return ["md", "markdown", "mdx", "txt", "text", "json", "yml", "yaml"].includes(extension);
        }

        function getPlaygroundMissionControlAttachmentScore(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment) {
            return 0;
          }
          const normalizedFilename = String(normalizedAttachment.filename || "").trim().toLowerCase();
          const extension = normalizedFilename.split(".").pop() || "";
          let score = 0;
          if (normalizedFilename.includes("mission")) {
            score += 60;
          }
          if (normalizedFilename.includes("strategy")) {
            score += 50;
          }
          if (normalizedFilename.includes("summary")) {
            score += 20;
          }
          if (normalizedFilename.includes("result") || normalizedFilename.includes("report")) {
            score += 15;
          }
          if (extension === "md" || extension === "markdown" || extension === "mdx") {
            score += 20;
          } else if (extension === "json") {
            score += 15;
          } else if (extension === "txt" || extension === "text") {
            score += 10;
          }
          return score;
        }

        async function fetchPlaygroundMissionControlAttachmentText(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment || !isPlaygroundMissionControlReadableAttachment(normalizedAttachment)) {
            return "";
          }

          const attachmentUrl = resolveTaskAttachmentPreviewUrl(normalizedAttachment)
            || resolveTaskAttachmentApiUrl(normalizedAttachment.url, normalizedAttachment.id)
            || getTaskAttachmentWorkspaceDownloadUrl(normalizedAttachment);
          if (!attachmentUrl) {
            return "";
          }

          try {
            const response = await fetch(attachmentUrl, {
              method: "GET",
              headers: requestHeaders,
            });
            if (!response.ok) {
              return "";
            }
            return await response.text();
          } catch {
            return "";
          }
        }

        async function resolvePlaygroundMissionControlRecordFromMessages(threadMessages) {
          const assistantMessages = (Array.isArray(threadMessages) ? threadMessages : [])
            .filter((message) => String(message?.role || "").trim().toLowerCase() === "assistant")
            .slice()
            .reverse();

          let bestRecord = buildEmptyPlaygroundProjectMissionControl();
          let bestScore = 0;

          for (const message of assistantMessages) {
            const inlineText = getPlaygroundThreadMessageText(message);
            if (inlineText) {
              const inlineRecord = parsePlaygroundMissionControlResponseContent(inlineText);
              const inlineScore = getPlaygroundMissionControlContentScore(inlineText);
              if (String(inlineRecord.document || "").trim() && (inlineScore > bestScore || !String(bestRecord.document || "").trim())) {
                bestRecord = inlineRecord;
                bestScore = inlineScore;
                if (inlineScore >= 240) {
                  return inlineRecord;
                }
              }
            }

            const attachmentCandidates = getPlaygroundThreadMessageAttachments(message)
              .filter(isPlaygroundMissionControlReadableAttachment)
              .sort((left, right) => getPlaygroundMissionControlAttachmentScore(right) - getPlaygroundMissionControlAttachmentScore(left))
              .slice(0, 6);

            for (const attachment of attachmentCandidates) {
              const attachmentContent = await fetchPlaygroundMissionControlAttachmentText(attachment);
              if (!String(attachmentContent || "").trim()) {
                continue;
              }
              const parsedAttachmentRecord = parsePlaygroundMissionControlResponseContent(attachmentContent);
              const attachmentScore = getPlaygroundMissionControlAttachmentScore(attachment) + getPlaygroundMissionControlContentScore(attachmentContent);
              if (String(parsedAttachmentRecord.document || "").trim() && (attachmentScore > bestScore || !String(bestRecord.document || "").trim())) {
                bestRecord = parsedAttachmentRecord;
                bestScore = attachmentScore;
                if (attachmentScore >= 240) {
                  return parsedAttachmentRecord;
                }
              }
            }
          }

          return bestRecord;
        }

        function buildPlaygroundMissionControlOperatingProfilePromptSection(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const blueprint = getPlaygroundProjectBlueprint(
            project?.projectType
            || project?.type
            || metadata.projectType
            || metadata.blueprintId
          );
          const operatingProfile = metadata.operatingProfileSnapshot && typeof metadata.operatingProfileSnapshot === "object" && !Array.isArray(metadata.operatingProfileSnapshot)
            ? metadata.operatingProfileSnapshot
            : buildPlaygroundProjectOperatingProfileSnapshot(blueprint);
          const newline = String.fromCharCode(10);

          function formatProfileList(label, values) {
            const items = Array.isArray(values)
              ? values.map((value) => String(value || "").trim()).filter(Boolean)
              : [];
            return items.length ? "- " + label + ": " + items.join(", ") : "";
          }

          const dashboardProfile = operatingProfile.dashboardProfile && typeof operatingProfile.dashboardProfile === "object"
            ? operatingProfile.dashboardProfile
            : {};
          const missionControlProfile = operatingProfile.missionControlProfile && typeof operatingProfile.missionControlProfile === "object"
            ? operatingProfile.missionControlProfile
            : {};
          const setupRecipe = operatingProfile.setupRecipe && typeof operatingProfile.setupRecipe === "object"
            ? operatingProfile.setupRecipe
            : {};
          const syncProfiles = Array.isArray(operatingProfile.syncProfiles) ? operatingProfile.syncProfiles : [];
          const syncLines = syncProfiles
            .map((profile) => {
              const source = String(profile?.source || profile?.label || "").trim();
              if (!source) return "";
              const direction = String(profile?.direction || "").trim();
              const objects = Array.isArray(profile?.objects) ? profile.objects.map((item) => String(item || "").trim()).filter(Boolean) : [];
              return "- Sync: " + source + (direction ? " (" + direction + ")" : "") + (objects.length ? " for " + objects.join(", ") : "");
            })
            .filter(Boolean);

          return [
            "Project operating profile:",
            "- Type: " + (operatingProfile.title || blueprint.title || "Blank Project") + " [" + (operatingProfile.id || blueprint.id || "blank") + "]",
            operatingProfile.description ? "- Purpose: " + operatingProfile.description : "",
            missionControlProfile.planningStyle ? "- Planning style: " + missionControlProfile.planningStyle : "",
            missionControlProfile.releasePattern ? "- Milestone pattern: " + missionControlProfile.releasePattern : "",
            formatProfileList("Priorities", missionControlProfile.prioritization),
            formatProfileList("Dashboard focus", dashboardProfile.primaryMetrics),
            formatProfileList("Activity focus", dashboardProfile.activityFocus),
            formatProfileList("Recommended resources", operatingProfile.suggestedResources),
            formatProfileList("Recommended skills", operatingProfile.suggestedSkills),
            formatProfileList("Starter folders", setupRecipe.initialFolders || operatingProfile.suggestedFolders),
            ...syncLines,
          ].filter(Boolean).join(newline);
        }

        function buildPlaygroundMissionControlPrompt(options = {}) {
          const normalizedProject = normalizePlaygroundProjectRecord(options?.projectRecord || selectedProject || projectDraft);
          const newline = String.fromCharCode(10);
          const paragraphBreak = newline + newline;
          const normalizedLaunchAgentId = String(options?.launchAgentId || "").trim();
          const launchAgent = normalizedLaunchAgentId ? (agentsById[normalizedLaunchAgentId] || null) : null;
          const defaultExecutionAgent = sortedAgents.find((agent) => {
            const normalizedName = String(agent?.name || "").trim().toLowerCase();
            const normalizedId = String(agent?.id || "").trim();
            return normalizedName === "assistant" || normalizedId.startsWith("agent-assistant-");
          }) || sortedAgents.find((agent) => agent?.isDefault && agent?.id) || sortedAgents[0] || launchAgent || null;
          const projectDefaultEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(normalizedProject);
          const availableAgentsSection = buildPlaygroundMissionControlAgentSnapshot(sortedAgents, normalizedLaunchAgentId);
          const availableReleasesSection = buildPlaygroundMissionControlReleaseSnapshot(releases);
          const availableSkillsSection = buildPlaygroundMissionControlSkillSnapshot(taskSystemSkillItems, projectCustomSkills);
          const availableEnvironmentsSection = buildPlaygroundMissionControlEnvironmentSnapshot(
            availableBacklogEnvironments,
            projectDefaultEnvironmentId
          );
		          const projectAttachmentsSection = buildPlaygroundAttachmentPromptSection(
		            "Project attachments:",
		            normalizedProject.attachments,
            {
              copy: "These files belong to the entire project and describe the shared scope, requirements, or design direction.",
            }
          );
          const runAttachmentsSection = buildPlaygroundAttachmentPromptSection(
            "Additional operator attachments:",
            options?.attachments,
            {
              copy: "These files were attached specifically for this Mission Control run.",
            }
          );
		          const projectConnectorsSection = buildPlaygroundConnectorPromptSection(
		            "Project connectors",
		            normalizedProject.connectors
		          );
		          const projectResourcesSection = buildPlaygroundProjectResourcePromptSection(normalizedProject, {
		            projectId: normalizedProject.id,
		            projectName: normalizedProject.name,
		            projectAttachments: normalizedProject.attachments,
		          });
	          const operatorPrompt = String(options?.userPrompt || "").trim();
	          const projectContextDescription = getPlaygroundProjectMissionInstructions(normalizedProject);
	          const projectOperatingProfileSection = buildPlaygroundMissionControlOperatingProfilePromptSection(normalizedProject);
	          const currentProjectStrategySection = buildPlaygroundProjectStrategyBriefPromptSection(normalizedProject);
	          const currentProjectRulesSection = buildPlaygroundProjectRulesPromptSection(normalizedProject);
	          return [
	            "You are running Mission Control for this project.",
		            "Your job is to analyze the available project context, reconcile the current project state, define the right strategy, and update the project structure using the Task Management and Computer Agents skills where appropriate.",
	            "Always use the Task Management skill for milestones, tasks, subtasks, blockers, comments, and other planning mutations instead of only describing them in prose.",
            "Always use the Computer Agents skill for live discovery of agents, environments, and skills instead of inventing IDs or writing raw curl requests.",
            "When invoking built-in skills, use the exact invocation names from the available skills list, for example task-management and computer-agents. Do not invoke skills using attachment IDs like task_management or computer_agents.",
            "Project: " + (normalizedProject.name || "Untitled Project"),
            projectContextDescription
              ? ("Project goal:" + newline + projectContextDescription)
              : "Project goal: None provided.",
		            projectOperatingProfileSection,
		            projectAttachmentsSection,
		            runAttachmentsSection,
		            projectConnectorsSection,
		            projectResourcesSection,
		            currentProjectStrategySection
	              ? ("Current structured project strategy:" + newline + currentProjectStrategySection)
	              : "Current structured project strategy: None yet.",
	            currentProjectRulesSection
	              ? ("Current project rules:" + newline + currentProjectRulesSection)
	              : "Current project rules: None yet.",
	            availableReleasesSection,
	            buildPlaygroundMissionControlTaskSnapshot(tasks),
	            availableAgentsSection,
	            availableEnvironmentsSection,
            availableSkillsSection,
            operatorPrompt
              ? ("Operator directive for this Mission Control run:" + newline + operatorPrompt)
              : "",
            [
              "Required outputs:",
              "1. Analyze the project operating profile, attachments, project goal, existing milestones, open work, completed work, comments, blocked work, and likely next steps.",
              "2. Use the Computer Agents skill to inspect the live agent roster, environments, and available skills before assigning work.",
	              "3. Form a strategy for the project and explain the direction clearly.",
	              "   - Also create compact structured strategy context agents can use inside every task prompt.",
	              "   - The structured strategy context must express the project goal, primary outcomes, in-scope boundaries, out-of-scope boundaries, success criteria, risks/assumptions, and key decisions.",
	              "   - Outcomes should be concrete user/business outcomes, not generic task status buckets. Include releaseIds (milestone ids) when outcomes clearly map to existing milestones. Use releaseId only for a legacy single-milestone mapping.",
	              "   - Preserve existing outcome ids when you are updating an existing outcome. Only remove an outcome when it is clearly obsolete or the operator asks for that.",
	              "   - Update project rules when the project needs durable execution behavior that every future task agent should follow. Do not duplicate generic platform behavior as a rule.",
	              "4. Inspect the available agents and assign the backlog work intentionally.",
	              defaultExecutionAgent
	                ? ("   - Every created or updated execution task and subtask must have an agent assignee. If no better specialist is obvious, set assigneeAgentId to " + defaultExecutionAgent.id + " (" + (defaultExecutionAgent.name || "Assistant") + ").")
                : "   - Every created or updated execution task and subtask must have an agent assignee. If no better fit is obvious, use the system Assistant agent returned by the Computer Agents or Task Management skill.",
              "5. Create or update the project structure using the Task Management skill whenever the project needs clearer execution steps.",
              "   - If the project is empty or still loosely defined, create at least one milestone first and then place the new work under milestones.",
              "   - When the project is new, use the operating profile setup recipe, recommended resources, skills, sync targets, and dashboard focus as the default project shape.",
              "   - Prefer a clear hierarchy of parent tasks and subtasks instead of keeping every item flat.",
              "   - Add blocked-by dependencies so the execution order is explicit and immediately understandable.",
              "   - Create human-assigned resource request tasks only when user-owned input is required, such as API keys, credentials, billing decisions, repository access, or product decisions. Make them small, explicit, and acceptance-criteria driven.",
              "   - Never leave Mission Control-generated execution tasks unassigned. Unassigned execution backlog items are invalid.",
              "   - Pass assigneeAgentId whenever you create or update execution tasks, including parent tasks. Use the human assignment option only for resource/input requests or explicit manual reviews.",
              "   - Use in_review and reviewer metadata for work that needs human or agent acceptance before it is done.",
              "   - Set releaseId on planned work whenever the task belongs to a specific milestone.",
              "   - Attach enabled skill IDs to tasks after you inspect the live skill list.",
              "   - Use the project's default environment for execution work unless a different environment is clearly more appropriate.",
              "   - Add task comments whenever they preserve important rationale, sequencing, architectural decisions, or handoff context.",
              "   - Use connectors when there is concrete connector context that materially helps the task.",
              "   - Project connectors are inherited by project work. When a task needs repository context, attach the relevant project GitHub connector to the task so the execution thread can prepare the repository in the project environment.",
              "   - Write every task description as a concise professional execution brief in markdown. Include context, dependencies, deployment expectations, verification steps, and acceptance criteria.",
              "   - If a ticket creates cloud functions, web apps, databases, or integrations, include deploy-and-smoke-test requirements in that same ticket unless a dependency-linked deployment ticket already exists.",
              "   - Keep descriptions focused and execution-ready rather than long speculative specs.",
              "   - Delete, close, or comment on obsolete tickets instead of leaving stale work mixed into the active plan.",
              "   - If a reusable project-specific workflow gap is obvious and worth reusing, create a custom skill before attaching it to tasks.",
              "   - Aim for task records that are execution-ready: milestone, assignee, environment, skills, hierarchy/dependencies, and useful comments should all be populated when the context supports it.",
              "   - When you create parent tasks, also create the subtasks and dependency chain needed to express the real order of work.",
              "6. In your human-readable response, output only the strategy document markdown itself.",
              "   - Do not add any conversational intro, acknowledgement, explanation, or outro before or after the document.",
              "   - Start directly with the first strategy heading.",
              "   - Use these sections in order:",
              "     - Strategy Summary",
              "     - Strategic Breakdown",
              "     - Risks & Opportunities",
              "     - Recommended Next Moves",
              "7. End your final response with a fenced code block labeled mission_control_json.",
              "   - The markdown before that code block must exactly match the strategy document text stored in the JSON document field.",
	              "8. That JSON must contain these keys:",
	              '   - "summary": a 1-2 sentence summary for the Mission Control card',
	              '   - "document": the full strategy document in markdown only, with no conversational preface or trailing commentary',
	              '   - "strategyBrief": an object with keys "goal", "outcomes", "inScope", "outOfScope", "successCriteria", "risks", and "decisions"',
	              '     - "outcomes" must be an array of objects with "id", "title", "description", optional "releaseIds", optional legacy "releaseId", and optional "successCriteria"',
	              '   - "projectRules": optional array of rule strings. Include it only when project rules should be created, replaced, or updated; otherwise omit it.',
	              '   - "projectRulesReplace": optional true. Include it only when intentionally clearing all existing project rules.',
	            ].join(newline),
	          ].filter(Boolean).join(paragraphBreak);
	        }

        function buildPlaygroundMissionControlEnabledSkillsPayload(basePayload) {
          const payload = basePayload && typeof basePayload === "object" ? { ...basePayload } : {};
          payload.taskManagement = true;
          payload.computerAgents = true;
          return applyDemoSkillDefaultsToEnabledSkillsPayload(payload);
        }

        function hasIncompleteTaskDependencies(task) {
          const dependencyIds = normalizePlaygroundIdList(task?.dependencyIds);
          if (dependencyIds.length === 0) {
            return false;
          }
          return dependencyIds.some((dependencyId) => {
            const dependencyTask = tasksById[dependencyId] || null;
            return Boolean(dependencyTask && String(dependencyTask.status || "").trim() !== "done");
          });
        }

        function getTaskBoardStatus(task) {
          const normalizedTaskId = typeof task?.id === "string" ? task.id.trim() : "";
	          const taskRunState = normalizedTaskId && taskRunStates[normalizedTaskId] && typeof taskRunStates[normalizedTaskId] === "object"
	            ? taskRunStates[normalizedTaskId]
	            : null;
	          const taskRunPhase = typeof taskRunState?.phase === "string" ? taskRunState.phase.trim().toLowerCase() : "";
	          const taskRunStatus = typeof taskRunState?.taskStatus === "string" ? taskRunState.taskStatus.trim().toLowerCase() : "";
          const isOptimisticallyInProgress =
            Boolean(normalizedTaskId)
            && (
              taskRunPendingIds.includes(normalizedTaskId)
              || taskRunPendingIdsRef.current.has(normalizedTaskId)
              || taskRunPhase === "starting"
              || taskRunPhase === "running"
            );

		          if (taskRunPhase === "in_review") {
		            return PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === taskRunStatus)
		              ? taskRunStatus
		              : "in_review";
		          }
          if (task?.status === "blocked") {
            return hasIncompleteTaskDependencies(task) ? "blocked" : "todo";
          }
	          if (task?.status === "done" || task?.status === "in_review") {
	            return task.status;
	          }
          if (isOptimisticallyInProgress) {
            return "in_progress";
          }
          if (task?.status === "in_progress") {
            return isHumanAssignedTask(task) || taskHasStartedThread(task) ? "in_progress" : "todo";
          }
          return "todo";
        }

        function matchesBacklogFilter(task, filterMode, options = {}) {
          const keepVisibleCompletedTaskIds = options?.keepVisibleCompletedTaskIds instanceof Set
            ? options.keepVisibleCompletedTaskIds
            : null;
          const shouldKeepCompletedTaskVisible = Boolean(
            keepVisibleCompletedTaskIds
            && task?.status === "done"
            && typeof task?.id === "string"
            && keepVisibleCompletedTaskIds.has(task.id)
          );
          if (filterMode === "all") {
            return true;
          }
          if (filterMode === "tasks") {
            return !isPlaygroundSubtaskRecord(task);
          }
          if (filterMode === "subtasks") {
            return isPlaygroundSubtaskRecord(task);
          }
          if (filterMode === "done") {
            return task.status === "done";
          }
          if (shouldKeepCompletedTaskVisible) {
            return true;
          }
          if (task.status === "done") {
            return false;
          }
          if (filterMode === "started") {
            return taskHasStartedThread(task);
          }
          if (filterMode === "unassigned") {
            return !task.assigneeAgentId;
          }
          if (filterMode === "scheduled") {
            return Boolean(task.scheduledStartAt || task.scheduledEndAt || task.dueAt);
          }
          return true;
        }

        function matchesBoardFilter(task, filterMode) {
          if (filterMode === "all") {
            return true;
          }
          const boardStatus = getTaskBoardStatus(task);
          if (filterMode === "done") {
            return boardStatus === "done";
          }
          if (filterMode === "blocked") {
            return boardStatus === "blocked";
          }
          if (filterMode === "open") {
            return boardStatus !== "done";
          }
          if (filterMode === "started") {
            return taskHasStartedThread(task);
          }
          if (filterMode === "unassigned") {
            return !task.assigneeAgentId;
          }
          return true;
        }

        function matchesTaskSearch(task) {
          if (!normalizedSearchQuery) {
            return true;
          }
          const haystack = [
            taskTicketNumbersById[task.id] || "",
            task.title || "",
            task.description || "",
            getPlaygroundTaskStatusLabel(task.status),
            getPlaygroundTaskPriorityLabel(task.priority),
            getPlaygroundTaskTypeLabel(task.taskType),
            getTaskAssigneeName(task.assigneeAgentId, ""),
            environmentsById[task.environmentId || ""]?.name || "",
            releasesById[task.releaseId || ""]?.name || "",
            sprintsById[task.sprintId || ""]?.name || "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        }

        function compareWorkspaceTaskOrder(left, right) {
          const statusOrder = {
            in_progress: 0,
            blocked: 1,
            todo: 2,
            backlog: 3,
            done: 4,
          };
          const leftStatus = statusOrder[left.status] ?? 99;
          const rightStatus = statusOrder[right.status] ?? 99;
          if (leftStatus !== rightStatus) {
            return leftStatus - rightStatus;
          }
          if ((left.sortOrder || 0) !== (right.sortOrder || 0)) {
            return (left.sortOrder || 0) - (right.sortOrder || 0);
          }
          return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
        }

        function compareBacklogDefaultTaskOrder(left, right) {
          const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : 0;
          const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : 0;
          if (leftSortOrder !== rightSortOrder) {
            return leftSortOrder - rightSortOrder;
          }
          const leftCreatedAt = Date.parse(left?.createdAt || "") || 0;
          const rightCreatedAt = Date.parse(right?.createdAt || "") || 0;
          if (leftCreatedAt !== rightCreatedAt) {
            return leftCreatedAt - rightCreatedAt;
          }
          return String(left?.id || "").localeCompare(String(right?.id || ""));
        }

        function compareBacklogTaskOrderWithModes(left, right, sortMode = backlogSortMode, filterMode = backlogFilterMode) {
          const priorityOrder = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          if (sortMode === "default") {
            return compareBacklogDefaultTaskOrder(left, right);
          }
          if (filterMode === "all") {
            const leftIsDone = left.status === "done";
            const rightIsDone = right.status === "done";
            if (leftIsDone !== rightIsDone) {
              return leftIsDone ? 1 : -1;
            }
          }
          if (sortMode === "title-asc") {
            return String(left.title || "").localeCompare(String(right.title || ""));
          }
          if (sortMode === "created-desc") {
            return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
          }
          if (sortMode === "priority-desc") {
            const leftPriority = priorityOrder[left.priority] ?? 99;
            const rightPriority = priorityOrder[right.priority] ?? 99;
            if (leftPriority !== rightPriority) {
              return leftPriority - rightPriority;
            }
          }
          return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
        }

        function compareBacklogTaskOrder(left, right) {
          return compareBacklogTaskOrderWithModes(left, right, backlogSortMode, backlogFilterMode);
        }

        function compareTaskReleaseOrder(left, right) {
          if (releaseSortMode === "title-asc") {
            return String(left.name || "").localeCompare(String(right.name || ""));
          }
          if (releaseSortMode === "recent-desc") {
            return String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
          }
          if (releaseSortMode === "start-asc") {
            const leftStart = Date.parse(left.startAt || "") || Number.MAX_SAFE_INTEGER;
            const rightStart = Date.parse(right.startAt || "") || Number.MAX_SAFE_INTEGER;
            if (leftStart !== rightStart) {
              return leftStart - rightStart;
            }
          }
          if (releaseSortMode === "end-asc") {
            const leftEnd = Date.parse(left.endAt || "") || Number.MAX_SAFE_INTEGER;
            const rightEnd = Date.parse(right.endAt || "") || Number.MAX_SAFE_INTEGER;
            if (leftEnd !== rightEnd) {
              return leftEnd - rightEnd;
            }
          }
          const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : 0;
          const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : 0;
          if (leftSortOrder !== rightSortOrder) {
            return leftSortOrder - rightSortOrder;
          }
          return String(left.name || "").localeCompare(String(right.name || ""));
        }

        function matchesReleaseFilter(release) {
          const releaseStatus = getPlaygroundTaskReleaseStatus(release);
          if (releaseFilterMode === "all") {
            return true;
          }
          if (releaseFilterMode === "active") {
            return releaseStatus === "active";
          }
          if (releaseFilterMode === "planned") {
            return releaseStatus === "planned";
          }
          if (releaseFilterMode === "completed") {
            return releaseStatus === "completed";
          }
          if (releaseFilterMode === "open") {
            return Number(release?.openTaskCount || 0) > 0;
          }
          return true;
        }

        function matchesReleaseSearch(release) {
          if (!normalizedSearchQuery) {
            return true;
          }
          const haystack = [
            release.name || "",
            release.description || "",
            getPlaygroundTaskReleaseStatus(release),
            String(release.taskCount || ""),
            String(release.openTaskCount || ""),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        }

        const projectSearchPlaceholder = useMemo(() => {
          if (selectedReleaseId && (taskView === "backlog" || taskView === "board")) {
            return "Search milestone tasks, ticket numbers, assignees, or environments...";
          }
          if (taskView === "overview") {
            return "Search tasks, threads, files, environments, or plugins...";
          }
          return taskView === "calendar"
            ? "Search tasks, schedules, agents, or environments..."
            : "Search tasks, ticket numbers, assignees, or sprints...";
        }, [selectedReleaseId, taskView]);

        const projectSidebarNavItems = useMemo(() => {
          return PLAYGROUND_PROJECT_VIEW_OPTIONS.filter((item) => item.id !== "calendar");
        }, []);

        const currentProjectViewerTokens = useMemo(() => {
          return [
            currentUserId,
            currentUserEmail,
            currentUserName,
          ]
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean);
        }, [currentUserEmail, currentUserId, currentUserName]);

        function getProjectIdentityTokens(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const owner = project?.owner && typeof project.owner === "object" && !Array.isArray(project.owner)
            ? project.owner
            : {};
          const creator = project?.createdBy && typeof project.createdBy === "object" && !Array.isArray(project.createdBy)
            ? project.createdBy
            : {};
          const metadataOwner = metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
            ? metadata.owner
            : {};
          const metadataCreator = metadata.createdBy && typeof metadata.createdBy === "object" && !Array.isArray(metadata.createdBy)
            ? metadata.createdBy
            : {};
          const lead = project?.lead && typeof project.lead === "object" && !Array.isArray(project.lead)
            ? project.lead
            : {};
          return [
            project?.ownerUserId,
            project?.ownerId,
            project?.createdByUserId,
            project?.createdById,
            project?.creatorId,
            project?.userId,
            project?.leadUserId,
            project?.leadEmail,
            project?.leadName,
            metadata.ownerUserId,
            metadata.ownerId,
            metadata.createdByUserId,
            metadata.createdById,
            metadata.creatorId,
            metadata.userId,
            metadata.leadUserId,
            metadata.leadEmail,
            metadata.leadName,
            owner.id,
            owner.userId,
            owner.email,
            owner.name,
            creator.id,
            creator.userId,
            creator.email,
            creator.name,
            metadataOwner.id,
            metadataOwner.userId,
            metadataOwner.email,
            metadataOwner.name,
            metadataCreator.id,
            metadataCreator.userId,
            metadataCreator.email,
            metadataCreator.name,
            lead.id,
            lead.userId,
            lead.email,
            lead.name,
          ]
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean);
        }

        function getProjectSharedIdentityTokens(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const tokens = [];
          const addValue = (value) => {
            if (Array.isArray(value)) {
              value.forEach(addValue);
              return;
            }
            if (value && typeof value === "object") {
              [
                value.id,
                value.userId,
                value.email,
                value.name,
                value.memberId,
                value.accountId,
              ].forEach(addValue);
              return;
            }
            const normalizedValue = String(value || "").trim().toLowerCase();
            if (normalizedValue) {
              tokens.push(normalizedValue);
            }
          };
          [
            project?.sharedWith,
            project?.sharedWithUsers,
            project?.sharedWithUserIds,
            project?.collaborators,
            project?.members,
            project?.memberIds,
            project?.teamMembers,
            project?.accessUsers,
            metadata.sharedWith,
            metadata.sharedWithUsers,
            metadata.sharedWithUserIds,
            metadata.collaborators,
            metadata.members,
            metadata.memberIds,
            metadata.teamMembers,
            metadata.accessUsers,
          ].forEach(addValue);
          return [...new Set(tokens)];
        }

        function isProjectCreatedByCurrentViewer(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const ownerTokens = getProjectIdentityTokens(project);
          if ((project?.sharedWithMe === true || metadata.sharedWithMe === true || metadata.teamShared === true) && ownerTokens.length === 0) {
            return false;
          }
          if (currentProjectViewerTokens.length === 0 || ownerTokens.length === 0) {
            return true;
          }
          return ownerTokens.some((token) => currentProjectViewerTokens.includes(token));
        }

        function isProjectSharedWithCurrentViewer(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          if ((project?.sharedWithMe === true || metadata.sharedWithMe === true || metadata.teamShared === true) && !isProjectCreatedByCurrentViewer(project)) {
            return true;
          }
          if (isProjectCreatedByCurrentViewer(project)) {
            return false;
          }
          if (project?.isShared === true || metadata.isShared === true) {
            return true;
          }
          const sharedTokens = getProjectSharedIdentityTokens(project);
          if (currentProjectViewerTokens.length === 0) {
            return sharedTokens.length > 0;
          }
          return sharedTokens.some((token) => currentProjectViewerTokens.includes(token));
        }

        const filteredProjects = useMemo(() => {
          const scopedProjects = projects.filter((project) => {
            if (projectsHomeScope === "created") {
              return isProjectCreatedByCurrentViewer(project);
            }
            if (projectsHomeScope === "shared") {
              return isProjectSharedWithCurrentViewer(project);
            }
            return true;
          });
          const typedProjects = scopedProjects.filter((project) => {
            if (projectsHomeFilterMode === "all") {
              return true;
            }
            const summary = getProjectListSummary(project);
            if (projectsHomeFilterMode === "active") {
              return Number(summary.openTasksCount || 0) > 0 || Number(summary.activeThreadsCount || 0) > 0;
            }
            if (projectsHomeFilterMode === "completed") {
              return Number(summary.tasksCount || 0) > 0 && Number(summary.openTasksCount || 0) <= 0;
            }
            if (projectsHomeFilterMode.startsWith("type:")) {
              return getProjectListBlueprint(project).id === projectsHomeFilterMode.slice(5);
            }
            return true;
          });
          const matchedProjects = typedProjects.filter((project) => {
            if (!normalizedSearchQuery) return true;
            const haystack = [
              project.name || "",
              project.description || "",
              String(project.summary?.tasksCount || ""),
              String(project.summary?.threadsCount || ""),
              String(project.summary?.environmentsCount || ""),
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });

          if (projectsHomeSortMode === "updated-desc") {
            return matchedProjects;
          }

          return matchedProjects.slice().sort((left, right) => {
            if (projectsHomeSortMode === "name-asc") {
              return String(left.name || "").localeCompare(String(right.name || ""));
            }
            if (projectsHomeSortMode === "tasks-desc") {
              const openTaskDelta = Number(right.summary?.openTasksCount || 0) - Number(left.summary?.openTasksCount || 0);
              if (openTaskDelta !== 0) {
                return openTaskDelta;
              }
            }
            const updatedOrder = String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
            if (updatedOrder !== 0) {
              return updatedOrder;
            }
            return String(left.name || "").localeCompare(String(right.name || ""));
          });
        }, [currentProjectViewerTokens, normalizedSearchQuery, projects, projectsHomeFilterMode, projectsHomeScope, projectsHomeSortMode]);

        const sortedTasks = useMemo(() => {
          return [...tasks]
            .filter((task) => matchesTaskSearch(task))
            .sort(compareWorkspaceTaskOrder);
        }, [agentsById, environmentsById, normalizedSearchQuery, sprintsById, taskTicketNumbersById, tasks]);

        const overviewVisibleTasks = useMemo(() => {
          const normalizedOverviewTaskQuery = String(projectOverviewTaskSearchQuery || "").trim().toLowerCase();
          const priorityOrder = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          return sortedTasks
            .filter((task) => !isPlaygroundSubtaskRecord(task))
            .filter((task) => {
              const boardStatus = getTaskBoardStatus(task);
              if (projectOverviewTaskFilterMode === "all") {
                return true;
              }
              if (projectOverviewTaskFilterMode === "in-progress") {
                return boardStatus === "in_progress";
              }
              if (projectOverviewTaskFilterMode === "review") {
                return boardStatus === "in_review";
              }
              if (projectOverviewTaskFilterMode === "blocked") {
                return boardStatus === "blocked";
              }
              if (projectOverviewTaskFilterMode === "started") {
                return boardStatus !== "done" && taskHasStartedThread(task);
              }
              if (projectOverviewTaskFilterMode === "unassigned") {
                return boardStatus !== "done" && !task.assigneeAgentId;
              }
              if (projectOverviewTaskFilterMode === "scheduled") {
                return boardStatus !== "done" && Boolean(task.scheduledStartAt || task.scheduledEndAt || task.dueAt);
              }
              return boardStatus !== "done";
            })
            .filter((task) => {
              if (!normalizedOverviewTaskQuery) {
                return true;
              }
              const haystack = [
                taskTicketNumbersById[task.id] || "",
                task.title || "",
                task.description || "",
                getPlaygroundTaskStatusLabel(task.status),
                getPlaygroundTaskPriorityLabel(task.priority),
                getPlaygroundTaskTypeLabel(task.taskType),
                getTaskAssigneeName(task.assigneeAgentId, ""),
                environmentsById[task.environmentId || ""]?.name || "",
                releasesById[task.releaseId || ""]?.name || "",
                sprintsById[task.sprintId || ""]?.name || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedOverviewTaskQuery);
            })
            .sort((left, right) => {
              if (projectOverviewTaskSortMode === "title-asc") {
                return String(left.title || "").localeCompare(String(right.title || ""));
              }
              if (projectOverviewTaskSortMode === "created-desc") {
                return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
              }
              if (projectOverviewTaskSortMode === "priority-desc") {
                const leftPriority = priorityOrder[left.priority] ?? 99;
                const rightPriority = priorityOrder[right.priority] ?? 99;
                if (leftPriority !== rightPriority) {
                  return leftPriority - rightPriority;
                }
              }
              if (projectOverviewTaskSortMode === "recent-desc") {
                return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
              }
              return compareWorkspaceTaskOrder(left, right);
            })
            .slice(0, 8);
        }, [
          agentsById,
          environmentsById,
          projectOverviewTaskFilterMode,
          projectOverviewTaskSearchQuery,
          projectOverviewTaskSortMode,
          releasesById,
          sortedTasks,
          sprintsById,
          taskTicketNumbersById,
        ]);

        const overviewAssignedActors = useMemo(() => {
          const nextById = new Map();
          sortedTasks.forEach((task) => {
            const normalizedAssigneeId = String(task?.assigneeAgentId || "").trim();
            if (!normalizedAssigneeId) {
              return;
            }
            const existing = nextById.get(normalizedAssigneeId) || {
              id: normalizedAssigneeId,
              name: getTaskAssigneeName(normalizedAssigneeId, "Unassigned") || "Unassigned",
              isHuman: isPlaygroundHumanAssigneeId(normalizedAssigneeId),
              photoUrl: "",
              totalCount: 0,
              openCount: 0,
            };
            existing.totalCount += 1;
            if (String(task?.status || "").trim() !== "done") {
              existing.openCount += 1;
            }
            if (existing.isHuman) {
              existing.photoUrl = canRenderAvatarImage(currentUserAvatarUrl) ? currentUserAvatarUrl : "";
            } else {
              const assigneeAgent = agentsById[normalizedAssigneeId] || null;
              existing.photoUrl = assigneeAgent
                ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(assigneeAgent))
                : "";
            }
            nextById.set(normalizedAssigneeId, existing);
          });
          return [...nextById.values()]
            .filter((entry) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                entry.name || "",
                String(entry.openCount || ""),
                String(entry.totalCount || ""),
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => {
              if (right.openCount !== left.openCount) {
                return right.openCount - left.openCount;
              }
              if (right.totalCount !== left.totalCount) {
                return right.totalCount - left.totalCount;
              }
              return String(left.name || "").localeCompare(String(right.name || ""));
            });
        }, [agentsById, currentUserAvatarUrl, normalizedSearchQuery, sortedTasks]);

        const taskChildrenByParentId = useMemo(() => {
          const next = {};
          tasks.forEach((task) => {
            const parentTaskId = getPlaygroundTaskParentTaskId(task);
            if (!parentTaskId) {
              return;
            }
            if (!next[parentTaskId]) {
              next[parentTaskId] = [];
            }
            next[parentTaskId].push(task);
          });
          Object.values(next).forEach((items) => items.sort(compareBacklogTaskOrder));
          return next;
        }, [backlogFilterMode, backlogSortMode, taskTicketNumbersById, tasks]);

        const backlogVisibleTaskIds = useMemo(() => {
          const next = new Set();
          tasks.forEach((task) => {
            if (!matchesTaskSearch(task) || !matchesBacklogFilter(task, backlogFilterMode, {
              keepVisibleCompletedTaskIds: backlogSessionCompletedTaskIds,
            })) {
              return;
            }
            let currentTask = task;
            const visited = new Set();
            while (currentTask?.id && !visited.has(currentTask.id)) {
              visited.add(currentTask.id);
              next.add(currentTask.id);
              const parentTaskId = getPlaygroundTaskParentTaskId(currentTask);
              currentTask = parentTaskId ? tasksById[parentTaskId] || null : null;
            }
          });
          return next;
        }, [agentsById, backlogFilterMode, backlogSessionCompletedTaskIds, environmentsById, normalizedSearchQuery, sprintsById, taskTicketNumbersById, tasks, tasksById]);

        const backlogTaskRoots = useMemo(() => {
          return [...tasks]
            .filter((task) => backlogVisibleTaskIds.has(task.id))
            .filter((task) => {
              const parentTaskId = getPlaygroundTaskParentTaskId(task);
              return !parentTaskId || !backlogVisibleTaskIds.has(parentTaskId) || !tasksById[parentTaskId];
            })
            .sort(compareBacklogTaskOrder);
        }, [backlogVisibleTaskIds, backlogFilterMode, backlogSortMode, taskTicketNumbersById, tasks, tasksById]);

        const selectedRelease = useMemo(() => {
          if (!selectedReleaseId) return null;
          return releasesById[selectedReleaseId] || null;
        }, [releasesById, selectedReleaseId]);

        const projectReleaseTasks = useMemo(() => {
          if (!selectedReleaseId) {
            return [];
          }
          return tasks.filter((task) => task.releaseId === selectedReleaseId);
        }, [selectedReleaseId, tasks]);

        const projectReleaseTaskIds = useMemo(() => {
          return new Set(projectReleaseTasks.map((task) => task.id));
        }, [projectReleaseTasks]);

        const releaseVisibleTaskIds = useMemo(() => {
          const next = new Set();
          projectReleaseTasks.forEach((task) => {
            if (!matchesTaskSearch(task) || !matchesBacklogFilter(task, releaseBacklogFilterMode, {
              keepVisibleCompletedTaskIds: backlogSessionCompletedTaskIds,
            })) {
              return;
            }
            next.add(task.id);
          });
          return next;
        }, [agentsById, backlogSessionCompletedTaskIds, environmentsById, normalizedSearchQuery, projectReleaseTasks, releaseBacklogFilterMode, releasesById, sprintsById, taskTicketNumbersById]);

        const releaseTaskChildrenByParentId = useMemo(() => {
          const next = {};
          projectReleaseTasks.forEach((task) => {
            const parentTaskId = getPlaygroundTaskParentTaskId(task);
            if (!parentTaskId || !projectReleaseTaskIds.has(parentTaskId)) {
              return;
            }
            if (!next[parentTaskId]) {
              next[parentTaskId] = [];
            }
            next[parentTaskId].push(task);
          });
          Object.values(next).forEach((items) => items.sort((left, right) =>
            compareBacklogTaskOrderWithModes(left, right, releaseBacklogSortMode, releaseBacklogFilterMode)
          ));
          return next;
        }, [projectReleaseTaskIds, projectReleaseTasks, releaseBacklogFilterMode, releaseBacklogSortMode, taskTicketNumbersById]);

        const releaseTaskRoots = useMemo(() => {
          return projectReleaseTasks
            .filter((task) => releaseVisibleTaskIds.has(task.id))
            .filter((task) => {
              const parentTaskId = getPlaygroundTaskParentTaskId(task);
              return !parentTaskId || !projectReleaseTaskIds.has(parentTaskId) || !releaseVisibleTaskIds.has(parentTaskId);
            })
            .slice()
            .sort((left, right) => compareBacklogTaskOrderWithModes(left, right, releaseBacklogSortMode, releaseBacklogFilterMode));
        }, [projectReleaseTaskIds, projectReleaseTasks, releaseBacklogFilterMode, releaseBacklogSortMode, releaseVisibleTaskIds, taskTicketNumbersById]);

        const boardVisibleTasks = useMemo(() => {
          return sortedTasks
            .filter((task) => !isPlaygroundSubtaskRecord(task) && matchesBoardFilter(task, boardFilterMode))
            .filter((task) => !selectedReleaseId || task.releaseId === selectedReleaseId);
        }, [boardFilterMode, selectedReleaseId, sortedTasks]);

        const boardReleaseSections = useMemo(() => {
          if (selectedReleaseId && selectedRelease) {
            return [{
              key: selectedRelease.id,
              releaseId: selectedRelease.id,
              title: selectedRelease.name || "Milestone",
              copy: selectedRelease.description || "",
              tasks: boardVisibleTasks,
            }];
          }

          const sections = [];
          const sectionIndexByKey = new Map();
          boardVisibleTasks.forEach((task) => {
            const normalizedReleaseId = typeof task?.releaseId === "string" && task.releaseId.trim()
              ? task.releaseId.trim()
              : "";
            const sectionKey = normalizedReleaseId || "__no_release__";
            const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
            if (!sectionIndexByKey.has(sectionKey)) {
              sectionIndexByKey.set(sectionKey, sections.length);
              sections.push({
                key: sectionKey,
                releaseId: normalizedReleaseId,
                title: normalizedReleaseId ? (releaseRecord?.name || "Milestone unavailable") : "All other",
                copy: normalizedReleaseId
                  ? (releaseRecord?.description || "")
                  : "All tasks that are not assigned to any milestone",
                tasks: [],
              });
            }
            sections[sectionIndexByKey.get(sectionKey)].tasks.push(task);
          });

          return sections
            .slice()
            .sort((left, right) => {
              const leftIsAllOther = left.key === "__no_release__";
              const rightIsAllOther = right.key === "__no_release__";
              if (leftIsAllOther !== rightIsAllOther) {
                return leftIsAllOther ? 1 : -1;
              }
              if (leftIsAllOther && rightIsAllOther) {
                return 0;
              }
              const leftRelease = releasesById[left.releaseId] || { id: left.releaseId, name: left.title };
              const rightRelease = releasesById[right.releaseId] || { id: right.releaseId, name: right.title };
              return compareTaskReleaseOrder(leftRelease, rightRelease);
            });
        }, [boardVisibleTasks, releasesById, selectedRelease, selectedReleaseId]);

        const boardNavigationTaskIds = useMemo(() => {
          const next = [];
          const seenTaskIds = new Set();
          boardReleaseSections.forEach((section) => {
            PLAYGROUND_TASK_BOARD_LANES.forEach((lane) => {
              section.tasks.forEach((task) => {
                if (!task?.id || seenTaskIds.has(task.id)) {
                  return;
                }
                if (!lane.statuses.includes(getTaskBoardStatus(task))) {
                  return;
                }
                seenTaskIds.add(task.id);
                next.push(task.id);
              });
            });
          });
          return next;
        }, [boardReleaseSections, taskRunPendingIds, taskRunStates]);

        function flattenVisibleBacklogTaskIds(taskItems, {
          childrenByParentId: visibleChildrenByParentId = {},
          visibleTaskIds = null,
          groupRootTasksByRelease = false,
          depth = 0,
        } = {}) {
          if (!Array.isArray(taskItems) || taskItems.length === 0) {
            return [];
          }

          if (depth === 0 && groupRootTasksByRelease) {
            const releaseSections = [];
            const sectionIndexByKey = new Map();
            taskItems.forEach((task) => {
              const normalizedReleaseId = typeof task?.releaseId === "string" ? task.releaseId.trim() : "";
              const sectionKey = normalizedReleaseId || "__no_release__";
              const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
              const sectionTitle = normalizedReleaseId
                ? (releaseRecord?.name || "Milestone unavailable")
                : "All other";
              const sectionCopy = normalizedReleaseId
                ? (releaseRecord?.description || "")
                : "All tasks that are not assigned to any milestone";
              let sectionIndex = sectionIndexByKey.get(sectionKey);
              if (sectionIndex === undefined) {
                sectionIndex = releaseSections.length;
                sectionIndexByKey.set(sectionKey, sectionIndex);
                releaseSections.push({
                  key: sectionKey,
                  releaseId: normalizedReleaseId,
                  title: sectionTitle,
                  copy: sectionCopy,
                  tasks: [],
                });
              }
              releaseSections[sectionIndex].tasks.push(task);
            });

            return releaseSections
              .slice()
              .sort((left, right) => {
                const leftIsAllOther = left.key === "__no_release__";
                const rightIsAllOther = right.key === "__no_release__";
                if (leftIsAllOther !== rightIsAllOther) {
                  return leftIsAllOther ? 1 : -1;
                }
                if (leftIsAllOther && rightIsAllOther) {
                  return 0;
                }
                const leftRelease = releasesById[left.key] || { id: left.key, name: left.title };
                const rightRelease = releasesById[right.key] || { id: right.key, name: right.title };
                return compareTaskReleaseOrder(leftRelease, rightRelease);
              })
              .flatMap((section) => flattenVisibleBacklogTaskIds(section.tasks, {
                childrenByParentId: visibleChildrenByParentId,
                visibleTaskIds,
                groupRootTasksByRelease: false,
                depth: depth + 1,
              }));
          }

          const next = [];
          taskItems.forEach((task) => {
            if (!task?.id) {
              return;
            }
            next.push(task.id);
            const visibleChildren = (visibleChildrenByParentId[task.id] || []).filter((childTask) =>
              !visibleTaskIds || visibleTaskIds.has(childTask.id)
            );
            if (visibleChildren.length > 0) {
              next.push(...flattenVisibleBacklogTaskIds(visibleChildren, {
                childrenByParentId: visibleChildrenByParentId,
                visibleTaskIds,
                groupRootTasksByRelease: false,
                depth: depth + 1,
              }));
            }
          });
          return next;
        }

        const backlogNavigationTaskIds = useMemo(() => {
          if (selectedReleaseId) {
            return flattenVisibleBacklogTaskIds(releaseTaskRoots, {
              childrenByParentId: releaseTaskChildrenByParentId,
              visibleTaskIds: releaseVisibleTaskIds,
              groupRootTasksByRelease: false,
            });
          }
          return flattenVisibleBacklogTaskIds(backlogTaskRoots, {
            childrenByParentId: taskChildrenByParentId,
            visibleTaskIds: backlogVisibleTaskIds,
            groupRootTasksByRelease: true,
          });
        }, [
          backlogTaskRoots,
          backlogVisibleTaskIds,
          releaseTaskChildrenByParentId,
          releaseTaskRoots,
          releaseVisibleTaskIds,
          selectedReleaseId,
          taskChildrenByParentId,
        ]);

        const filteredReleases = useMemo(() => {
          return [...releases]
            .filter((release) => matchesReleaseSearch(release) && matchesReleaseFilter(release))
            .sort(compareTaskReleaseOrder);
        }, [normalizedSearchQuery, releaseFilterMode, releaseSortMode, releases]);

        const allTaskChildrenByParentId = useMemo(() => {
          const next = {};
          tasks.forEach((task) => {
            const parentTaskId = getPlaygroundTaskParentTaskId(task);
            if (!parentTaskId) {
              return;
            }
            if (!next[parentTaskId]) {
              next[parentTaskId] = [];
            }
            next[parentTaskId].push(task);
          });
          Object.values(next).forEach((items) => {
            items.sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          });
          return next;
        }, [taskTicketNumbersById, tasks]);

        const selectedTaskSnapshot = useMemo(() => {
          if (!selectedTaskId) return null;
          return tasksById[selectedTaskId] || null;
        }, [selectedTaskId, tasksById]);

        const draftTaskParentTask = useMemo(() => {
          const parentTaskId = getPlaygroundTaskParentTaskId(draftTask);
          return parentTaskId ? tasksById[parentTaskId] || null : null;
        }, [draftTask, tasksById]);

        const draftTaskSubtasks = useMemo(() => {
          if (!draftTask?.id) {
            return [];
          }
          return allTaskChildrenByParentId[draftTask.id] || [];
        }, [allTaskChildrenByParentId, draftTask?.id]);

        const taskParentCandidateTasks = useMemo(() => {
          if (!draftTask?.id) {
            return [];
          }
          const blockedIds = new Set([draftTask.id]);
          const stack = [draftTask.id];
          while (stack.length > 0) {
            const currentTaskId = stack.pop();
            const children = allTaskChildrenByParentId[currentTaskId] || [];
            children.forEach((childTask) => {
              if (!childTask?.id || blockedIds.has(childTask.id)) {
                return;
              }
              blockedIds.add(childTask.id);
              stack.push(childTask.id);
            });
          }
          return tasks
            .filter((task) => task?.id && !blockedIds.has(task.id) && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
        }, [allTaskChildrenByParentId, draftTask?.id, taskTicketNumbersById, tasks]);

        const scheduleParentCandidateTasks = useMemo(() => {
          return tasks
            .filter((task) => task?.id && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
        }, [taskTicketNumbersById, tasks]);

        const boardBlockedTaskCandidates = useMemo(() => {
          const blockedTaskId = String(boardBlockedPickerState?.taskId || "").trim();
          if (!blockedTaskId) {
            return [];
          }
          const blockedIds = new Set([blockedTaskId]);
          const stack = [blockedTaskId];
          while (stack.length > 0) {
            const currentTaskId = stack.pop();
            const children = allTaskChildrenByParentId[currentTaskId] || [];
            children.forEach((childTask) => {
              if (!childTask?.id || blockedIds.has(childTask.id)) {
                return;
              }
              blockedIds.add(childTask.id);
              stack.push(childTask.id);
            });
          }
          return tasks
            .filter((task) => task?.id && !blockedIds.has(task.id) && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
        }, [allTaskChildrenByParentId, boardBlockedPickerState?.taskId, taskTicketNumbersById, tasks]);

${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState}
${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.topNavigation}
        const boardSprints = useMemo(() => {
          return [
            {
              id: PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID,
              name: "No sprint",
              status: "planned",
            },
            ...sprints,
          ];
        }, [sprints]);

`;
