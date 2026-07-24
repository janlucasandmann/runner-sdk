export const PROJECTS_SHELL_01_FRAGMENT = `
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
        projectsHomeScope = "all",
        onTasksHeaderChange,
        onCalendarTopNavStateChange,
        calendarTopNavActionsRef,
        onProjectIssueCreateHandlerChange,
        attachmentPreviewPortalId = "",
        projectNavBackRequestToken = 0,
        projectNavViewRequest = null,
        projectNavTaskRequest = null,
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
\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.refs}
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
        const taskDetailActionsRef = useRef(null);
        const taskDetailThreadsToolbarRef = useRef(null);
        const taskSkillsActionsRef = useRef(null);
	        const taskDetailMainRef = useRef(null);
	        const taskDescriptionTextareaRef = useRef(null);
	        const missionControlDocumentTextareaRef = useRef(null);
	        const projectRulesTextareaRef = useRef(null);
	        const projectRuleComposerTextareaRef = useRef(null);
	        const projectRuleEditTextareaRef = useRef(null);
\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.textareaRefs}
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
        const handledProjectNavTaskRequestTokenRef = useRef("");
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
        const [projectsHomeFilterMode, setProjectsHomeFilterMode] = useState("all");
        const [projectsHomeToolbarPopover, setProjectsHomeToolbarPopover] = useState("");
        const projectsHomeFilterPopupRef = useRef(null);
        useEffect(() => {
          if (projectsHomeToolbarPopover !== "filter") {
            return undefined;
          }
          const handleProjectsHomeFilterPointerDown = (event) => {
            const target = event.target instanceof Node ? event.target : null;
            if (target && projectsHomeFilterPopupRef.current?.contains(target)) {
              return;
            }
            setProjectsHomeToolbarPopover("");
          };
          const handleProjectsHomeFilterKeyDown = (event) => {
            if (event.key === "Escape") {
              setProjectsHomeToolbarPopover("");
            }
          };
          document.addEventListener("pointerdown", handleProjectsHomeFilterPointerDown);
          window.addEventListener("keydown", handleProjectsHomeFilterKeyDown);
          return () => {
            document.removeEventListener("pointerdown", handleProjectsHomeFilterPointerDown);
            window.removeEventListener("keydown", handleProjectsHomeFilterKeyDown);
          };
        }, [projectsHomeToolbarPopover]);
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
        const [projectOverviewActivityTab, setProjectOverviewActivityTab] = useState("activity");
        const [projectOverviewSidebarCollapsed, setProjectOverviewSidebarCollapsed] = useState(false);
        const [projectOverviewSidebarProgressView, setProjectOverviewSidebarProgressView] = useState("assignees");
        const projectOverviewSidebarAutoCollapsedForTaskRef = useRef(false);
        const projectOverviewSidebarAutoCollapsedForPermissionRef = useRef(false);
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
        const [projectOverviewTaskActivityState, setProjectOverviewTaskActivityState] = useState({
          projectId: "",
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
        const [projectOverviewOutcomeActionMenuId, setProjectOverviewOutcomeActionMenuId] = useState("");
        const [projectOverviewOutcomeRenameState, setProjectOverviewOutcomeRenameState] = useState(null);
        const [projectOverviewOutcomeEditorVisible, setProjectOverviewOutcomeEditorVisible] = useState(false);
        const [projectOverviewOutcomeEditorClosing, setProjectOverviewOutcomeEditorClosing] = useState(false);
        const [projectOverviewOutcomeMilestonePickerOpen, setProjectOverviewOutcomeMilestonePickerOpen] = useState(false);
        const projectOverviewOutcomeEditorCloseTimerRef = useRef(null);
        const projectOverviewOutcomeEditorFrameRef = useRef(null);
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
\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.loadRefs}
	        const projectCustomSkillsLoadKeyRef = useRef("");
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
	        const [projectOverviewOwnerCandidatesState, setProjectOverviewOwnerCandidatesState] = useState({
	          projectId: "",
	          status: "idle",
	          error: "",
	          items: [],
	        });
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
        const [taskDetailStatusSearchQuery, setTaskDetailStatusSearchQuery] = useState("");
        const [taskDetailTypeSearchQuery, setTaskDetailTypeSearchQuery] = useState("");
        const [taskDetailPrioritySearchQuery, setTaskDetailPrioritySearchQuery] = useState("");
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
\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.collectionState}
        const [projectAgentUpgradeModalOpen, setProjectAgentUpgradeModalOpen] = useState(false);
        const [projectAgentUpgradeCheckoutLoading, setProjectAgentUpgradeCheckoutLoading] = useState(false);
\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.editorState}
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
        const issueComposerDescriptionTextareaRef = useRef(null);
        const issueComposerAnimationMs = 75;
        const [issueComposerDetailSelectPopover, setIssueComposerDetailSelectPopover] = useState("");
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
        const [taskActivityCommentValue, setTaskActivityCommentValue] = useState("");
        const [taskActivityCommentPending, setTaskActivityCommentPending] = useState(false);
        const [taskActivityCommentError, setTaskActivityCommentError] = useState("");
        const [taskActivitySubscriptionState, setTaskActivitySubscriptionState] = useState({
          taskId: "",
          status: "idle",
          subscribed: false,
          error: "",
        });
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
            nextSummary.openTasksCount = tasks.filter((task) => !isPlaygroundTaskTerminalStatus(task.status)).length;
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

        function buildProjectIssueComposerDraft(options = {}) {
          const now = new Date().toISOString();
          const requestedTaskType = normalizePlaygroundTaskType(options?.taskType);
          const requestedParentTaskId = requestedTaskType === "subtask"
            ? normalizePlaygroundParentTaskId(options?.parentTaskId)
            : null;
          const normalizedDraft = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...buildPlaygroundDefaultTaskDraft(),
            projectId: selectedProjectId || selectedProject?.id || null,
            title: "",
            description: "",
            taskType: requestedTaskType,
            parentTaskId: requestedParentTaskId,
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
            attachments: [],
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
          return {
            ...normalizedDraft,
            title: "",
            taskType: requestedTaskType,
            parentTaskId: requestedTaskType === "subtask" ? requestedParentTaskId : null,
          };
        }

        function openProjectIssueComposer(options = {}) {
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
          setIssueComposerDetailSelectPopover("");
          setIssueComposerDraft(buildProjectIssueComposerDraft(options));
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
          setIssueComposerDetailSelectPopover("");
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
          setIssueComposerDraft((current) => {
            const nextDraft = typeof updater === "function" ? updater(current) : updater;
            const normalizedDraft = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata(nextDraft));
            const requestedTaskType = normalizePlaygroundTaskType(nextDraft?.taskType);
            return {
              ...normalizedDraft,
              title: typeof nextDraft?.title === "string" ? nextDraft.title : normalizedDraft.title,
              taskType: requestedTaskType,
              parentTaskId: requestedTaskType === "subtask"
                ? normalizePlaygroundParentTaskId(nextDraft?.parentTaskId)
                : null,
            };
          });
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
`;
