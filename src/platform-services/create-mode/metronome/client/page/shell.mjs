export const METRONOME_PAGE_SHELL_SCRIPT = String.raw`
        function PlaygroundMetronomePage({
          onTopNavStateChange,
          topNavActionsRef,
          onNodeDetailOpenChange,
          inspectorPortalId,
          overviewControlsPortalId = "",
          agents = [],
          environments = [],
          projects = [],
          projectFilterId = "",
          openWorkflowRequest = null,
          onOpenWorkflowRequestHandled,
          backendUrl = "/api/real",
          apiKey = "",
          requestHeaders = {},
          onThreadOpen,
          onNavigationGuardChange,
          onNavigationRequest,
          currentUserId = "",
          currentUserName = "Me",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
        } = {}) {
          const [workflows, setWorkflows] = useState(() => readMetronomeWorkflowsFromStorage());
          const [sharedMetronomeWorkflows, setSharedMetronomeWorkflows] = useState([]);
          const [isMetronomeApiAvailable, setIsMetronomeApiAvailable] = useState(true);
          const [isLoadingMetronomes, setIsLoadingMetronomes] = useState(true);
          const [activeWorkflowId, setActiveWorkflowId] = useState("");
          const [nodes, setNodes, onNodesChange] = useNodesState([]);
          const [edges, setEdges, onEdgesChange] = useEdgesState([]);
          const [metronomeFlowMountVersion, setMetronomeFlowMountVersion] = useState(0);
          const [isMetronomeFlowReady, setIsMetronomeFlowReady] = useState(false);
          const [selectedNodeId, setSelectedNodeId] = useState("");
          const [activeMetronomeRichTextField, setActiveMetronomeRichTextField] = useState("");
          const [metronomeDynamicContentPicker, setMetronomeDynamicContentPicker] = useState({
            fieldKey: "",
            rect: null,
            query: "",
          });
          const [isMetronomeSchedulePopoverOpen, setIsMetronomeSchedulePopoverOpen] = useState(false);
          const [metronomeSchedulePopoverRect, setMetronomeSchedulePopoverRect] = useState(null);
          const [isMetronomeSchedulePopoverClosing, setIsMetronomeSchedulePopoverClosing] = useState(false);
          const metronomeSchedulePopoverCloseTimerRef = useRef(null);
          const closeMetronomeSchedulePopover = useCallback((options = {}) => {
            const shouldCloseImmediately = Boolean(options?.immediate);
            if (metronomeSchedulePopoverCloseTimerRef.current && typeof window !== "undefined") {
              window.clearTimeout(metronomeSchedulePopoverCloseTimerRef.current);
              metronomeSchedulePopoverCloseTimerRef.current = null;
            }
            if (shouldCloseImmediately || typeof window === "undefined") {
              setIsMetronomeSchedulePopoverClosing(false);
              setIsMetronomeSchedulePopoverOpen(false);
              setMetronomeSchedulePopoverRect(null);
              return;
            }
            setIsMetronomeSchedulePopoverClosing(true);
            metronomeSchedulePopoverCloseTimerRef.current = window.setTimeout(() => {
              metronomeSchedulePopoverCloseTimerRef.current = null;
              setIsMetronomeSchedulePopoverClosing(false);
              setIsMetronomeSchedulePopoverOpen(false);
              setMetronomeSchedulePopoverRect(null);
            }, 180);
          }, []);
          const promptExtensionTextareaRef = useRef(null);
          const metronomeAttachmentInputRef = useRef(null);
          const [isMetronomeAttachmentPopoverOpen, setIsMetronomeAttachmentPopoverOpen] = useState(false);
          const [metronomeAttachmentPopoverRect, setMetronomeAttachmentPopoverRect] = useState(null);
          const [isMetronomeAttachmentPopoverClosing, setIsMetronomeAttachmentPopoverClosing] = useState(false);
          const metronomeAttachmentPopoverCloseTimerRef = useRef(null);
          const closeMetronomeAttachmentPopover = useCallback((options = {}) => {
            const shouldCloseImmediately = Boolean(options?.immediate);
            if (metronomeAttachmentPopoverCloseTimerRef.current && typeof window !== "undefined") {
              window.clearTimeout(metronomeAttachmentPopoverCloseTimerRef.current);
              metronomeAttachmentPopoverCloseTimerRef.current = null;
            }
            if (shouldCloseImmediately || typeof window === "undefined") {
              setIsMetronomeAttachmentPopoverClosing(false);
              setIsMetronomeAttachmentPopoverOpen(false);
              setMetronomeAttachmentPopoverRect(null);
              return;
            }
            setIsMetronomeAttachmentPopoverClosing(true);
            metronomeAttachmentPopoverCloseTimerRef.current = window.setTimeout(() => {
              metronomeAttachmentPopoverCloseTimerRef.current = null;
              setIsMetronomeAttachmentPopoverClosing(false);
              setIsMetronomeAttachmentPopoverOpen(false);
              setMetronomeAttachmentPopoverRect(null);
            }, 180);
          }, []);
          const [metronomeInspectorSelectPopover, setMetronomeInspectorSelectPopover] = useState({
            id: "",
            rect: null,
            query: "",
            closing: false,
          });
          const metronomeInspectorSelectCloseTimerRef = useRef(null);
          const closeMetronomeInspectorSelectPopover = useCallback((options = {}) => {
            const shouldCloseImmediately = Boolean(options?.immediate);
            if (metronomeInspectorSelectCloseTimerRef.current && typeof window !== "undefined") {
              window.clearTimeout(metronomeInspectorSelectCloseTimerRef.current);
              metronomeInspectorSelectCloseTimerRef.current = null;
            }
            if (shouldCloseImmediately || typeof window === "undefined") {
              setMetronomeInspectorSelectPopover({ id: "", rect: null, query: "", closing: false });
              return;
            }
            setMetronomeInspectorSelectPopover((current) => {
              if (!current.id || current.closing) return current;
              return { ...current, closing: true };
            });
            metronomeInspectorSelectCloseTimerRef.current = window.setTimeout(() => {
              metronomeInspectorSelectCloseTimerRef.current = null;
              setMetronomeInspectorSelectPopover((current) => current.closing
                ? { id: "", rect: null, query: "", closing: false }
                : current
              );
            }, 180);
          }, []);
          const [metronomeAttachmentModalOpen, setMetronomeAttachmentModalOpen] = useState(false);
          const [isMetronomeAttachmentDragging, setIsMetronomeAttachmentDragging] = useState(false);
          const [metronomeAttachmentStatus, setMetronomeAttachmentStatus] = useState("");
          const [isMetronomeTriggerDiagnosticsModalOpen, setIsMetronomeTriggerDiagnosticsModalOpen] = useState(false);
          const [metronomeEnvironmentFilePickerSearch, setMetronomeEnvironmentFilePickerSearch] = useState("");
          const [metronomeEnvironmentFilePickerInventory, setMetronomeEnvironmentFilePickerInventory] = useState([]);
          const [metronomeEnvironmentFilePickerExpandedFolders, setMetronomeEnvironmentFilePickerExpandedFolders] = useState([]);
          const [metronomeEnvironmentFilePickerSelectedPaths, setMetronomeEnvironmentFilePickerSelectedPaths] = useState([]);
          const [metronomeEnvironmentFilePickerState, setMetronomeEnvironmentFilePickerState] = useState({ status: "idle", error: "" });
          const [isMetronomeAttachmentUploading, setIsMetronomeAttachmentUploading] = useState(false);
          const [isMetronomeThreadMoreOpen, setIsMetronomeThreadMoreOpen] = useState(false);
          const [metronomeFieldTooltipPortal, setMetronomeFieldTooltipPortal] = useState({ copy: "", rect: null });
          const [isMetronomeWorkspaceSelectorOpen, setIsMetronomeWorkspaceSelectorOpen] = useState(false);
          const [metronomeWorkspaceSelectorMode, setMetronomeWorkspaceSelectorMode] = useState("computers");
          const metronomeWorkspaceSelectorAnchorRef = useRef(null);
          const [metronomeWorkspaceSelectorRect, setMetronomeWorkspaceSelectorRect] = useState(null);
          const [workflowNameModal, setWorkflowNameModal] = useState(null);
          const [workflowNameModalClosing, setWorkflowNameModalClosing] = useState(false);
          const [workflowNameDraft, setWorkflowNameDraft] = useState("");
          const workflowNameInputRef = useRef(null);
          const [workflowWallpaperDraftId, setWorkflowWallpaperDraftId] = useState("");
          const [workflowWallpaperTransition, setWorkflowWallpaperTransition] = useState(null);
          const workflowWallpaperTransitionTimerRef = useRef(null);
          const workflowWallpaperPreloadTokenRef = useRef(0);
          const [metronomeShareWorkflowId, setMetronomeShareWorkflowId] = useState("");
          const [metronomeShareTeams, setMetronomeShareTeams] = useState([]);
          const [metronomeShareTeamId, setMetronomeShareTeamId] = useState("");
          const [metronomeShareAccessLevel, setMetronomeShareAccessLevel] = useState("use");
          const [metronomeShareState, setMetronomeShareState] = useState({ status: "idle", message: "" });
          const [workflowVersionModal, setWorkflowVersionModal] = useState(null);
          const [workflowVersionModalVisible, setWorkflowVersionModalVisible] = useState(false);
          const [workflowVersionModalClosing, setWorkflowVersionModalClosing] = useState(false);
          const [workflowVersionNameDraft, setWorkflowVersionNameDraft] = useState("");
          const [workflowVersionDescriptionDraft, setWorkflowVersionDescriptionDraft] = useState("");
          const [isWorkflowVersionDescriptionEditing, setIsWorkflowVersionDescriptionEditing] = useState(false);
          const workflowVersionModalFrameRef = useRef(null);
          const workflowVersionModalCloseTimerRef = useRef(null);
          const workflowVersionDescriptionTextareaRef = useRef(null);
          const [metronomeVersionChangesState, setMetronomeVersionChangesState] = useState(null);
          const [activeMetronomeVersionChanges, setActiveMetronomeVersionChanges] = useState(false);
          const metronomeVersionComparisonTimerRef = useRef(null);
          const metronomeVersionComparisonTokenRef = useRef(0);
          const metronomeVersionComparisonGraphRef = useRef({
            workflowId: "",
            selectedDeploymentId: "",
            nodes: null,
            edges: null,
          });
          const metronomeTopNavStateKeyRef = useRef("");
          const metronomeLocalGraphSyncTimerRef = useRef(null);
          const metronomeLocalGraphSyncPendingRef = useRef(null);
          const metronomeLocalGraphObservedRef = useRef({
            workflowId: "",
            nodes: null,
            edges: null,
          });
          const activeMetronomeWorkflowRef = useRef(null);
          const replaceMetronomeWorkflowInEditableStateRef = useRef(null);
          const metronomeAutosaveTimerRef = useRef(null);
          const metronomeAutosaveRevisionRef = useRef(0);
          const metronomeAutosaveLastSavedKeyRef = useRef("");
          const metronomeAutosaveLatestKeyRef = useRef("");
          const [metronomeEditorMode, setMetronomeEditorMode] = useState("edit");
          const [metronomeCanvasInteractionMode, setMetronomeCanvasInteractionMode] = useState("pan");
          const [graphUndoStack, setGraphUndoStack] = useState([]);
          const [graphRedoStack, setGraphRedoStack] = useState([]);
          const [metronomeServerResources, setMetronomeServerResources] = useState([]);
          const [metronomeSecretVaultSecretsByVaultId, setMetronomeSecretVaultSecretsByVaultId] = useState({});
          const [metronomeSecretVaultSecretsLoadingId, setMetronomeSecretVaultSecretsLoadingId] = useState("");
          const [metronomeCodeRunState, setMetronomeCodeRunState] = useState({ status: "idle", message: "" });
          const [metronomeCodeFilesDraft, setMetronomeCodeFilesDraft] = useState([]);
          const [activeMetronomeCodeFilePath, setActiveMetronomeCodeFilePath] = useState("main.py");
          const [isMetronomeCodeDirty, setIsMetronomeCodeDirty] = useState(false);
          const [metronomeRuns, setMetronomeRuns] = useState([]);
          const [isLoadingMetronomeRuns, setIsLoadingMetronomeRuns] = useState(false);
          const [metronomeRunsError, setMetronomeRunsError] = useState("");
          const [metronomeRunSearchQuery, setMetronomeRunSearchQuery] = useState("");
          const [metronomeRunFilter, setMetronomeRunFilter] = useState("all");
          const [metronomeRunSort, setMetronomeRunSort] = useState("recent");
          const [metronomeRunSortDirection, setMetronomeRunSortDirection] = useState("desc");
          const [metronomeRunToolbarPopover, setMetronomeRunToolbarPopover] = useState("");
          const [selectedMetronomeRunIds, setSelectedMetronomeRunIds] = useState(() => new Set());
          const [metronomeRunActionMenu, setMetronomeRunActionMenu] = useState(null);
          const [metronomeDeploymentEvents, setMetronomeDeploymentEvents] = useState([]);
          const [isLoadingMetronomeDeploymentEvents, setIsLoadingMetronomeDeploymentEvents] = useState(false);
          const [metronomeDeploymentEventsError, setMetronomeDeploymentEventsError] = useState("");
          const [isLoadingMetronomeVersions, setIsLoadingMetronomeVersions] = useState(false);
          const [metronomeVersionsError, setMetronomeVersionsError] = useState("");
          const [metronomeVersionsByWorkflowId, setMetronomeVersionsByWorkflowId] = useState({});
          const [metronomeTriggerEvents, setMetronomeTriggerEvents] = useState([]);
          const [isLoadingMetronomeTriggerEvents, setIsLoadingMetronomeTriggerEvents] = useState(false);
          const [metronomeTriggerEventsError, setMetronomeTriggerEventsError] = useState("");
          const [metronomeTriggerTestState, setMetronomeTriggerTestState] = useState({ status: "idle", message: "" });
          const [selectedMetronomeRunId, setSelectedMetronomeRunId] = useState("");
          const [metronomeRunInlineDetailId, setMetronomeRunInlineDetailId] = useState("");
          const lastHandledCreateWorkflowRequestTokenRef = useRef("");
          const pendingMetronomeOpenRunRef = useRef({ workflowId: "", runId: "", mode: "" });
          const [metronomeEditorHighlightRunId, setMetronomeEditorHighlightRunId] = useState("");
          const [metronomeRunState, setMetronomeRunState] = useState({ status: "idle", message: "" });
          const [metronomeRunTraceWorkExpanded, setMetronomeRunTraceWorkExpanded] = useState(true);
          const [isMetronomeVersionHistorySidebarOpen, setIsMetronomeVersionHistorySidebarOpen] = useState(false);
          const [metronomePublishState, setMetronomePublishState] = useState({ status: "idle", message: "" });
          const [isMetronomeDeploymentHistoryModalOpen, setIsMetronomeDeploymentHistoryModalOpen] = useState(false);
          const [metronomeNodeSchemaRegistry, setMetronomeNodeSchemaRegistry] = useState(null);
          const [metronomeFunctionInvokeState, setMetronomeFunctionInvokeState] = useState({
            nodeId: "",
            status: "idle",
            error: "",
            resultText: "",
          });
          const [metronomeDatabaseExpandedPaths, setMetronomeDatabaseExpandedPaths] = useState({});
          const [metronomeDatabaseFieldComposerState, setMetronomeDatabaseFieldComposerState] = useState({
            open: false,
            parentPath: [],
            key: "",
            type: "string",
            value: "",
            error: "",
          });
          const [metronomeOutputContractComposer, setMetronomeOutputContractComposer] = useState({
            key: "",
            type: "string",
          });
          const [metronomeFlowZoom, setMetronomeFlowZoom] = useState(1);
          const [isMetronomeAgentSelectorOpen, setIsMetronomeAgentSelectorOpen] = useState(false);
          const [metronomeAgentSelectorMode, setMetronomeAgentSelectorMode] = useState("agents");
          const metronomeAgentSelectorAnchorRef = useRef(null);
          const [metronomeAgentSelectorRect, setMetronomeAgentSelectorRect] = useState(null);
          const metronomeAgentOptions = useMemo(() => normalizeMetronomeOptionList(agents, METRONOME_FALLBACK_AGENTS), [agents]);
          const metronomeComputerOptions = useMemo(() => normalizeMetronomeOptionList(environments, METRONOME_FALLBACK_COMPUTERS), [environments]);
          const metronomeProjectOptions = useMemo(() => normalizeMetronomeOptionList(projects, METRONOME_FALLBACK_PROJECTS), [projects]);
          const metronomeRequestHeadersKey = useMemo(() => {
            try {
              return JSON.stringify(requestHeaders || {});
            } catch {
              return "";
            }
          }, [requestHeaders]);
          const currentMetronomeUserCreator = useMemo(() => normalizeMetronomeWorkflowCreator({
            creator: {
              type: "user",
              id: currentUserId || currentUserEmail || currentUserName || "me",
              userId: currentUserId || currentUserEmail || currentUserName || "me",
              name: currentUserName || currentUserEmail || "Me",
              email: currentUserEmail || "",
              avatarUrl: currentUserAvatarUrl || "",
              photoUrl: currentUserAvatarUrl || "",
            },
          }), [currentUserId, currentUserName, currentUserEmail, currentUserAvatarUrl]);
          const currentMetronomeUserIdentityKeys = useMemo(() => createMetronomeIdentityKeySet([
            currentUserId,
            currentUserEmail,
            currentMetronomeUserCreator?.id,
            currentMetronomeUserCreator?.userId,
            currentMetronomeUserCreator?.email,
            !currentUserId && !currentUserEmail ? currentUserName : "",
          ]), [currentUserId, currentUserEmail, currentUserName, currentMetronomeUserCreator]);
          const isMetronomeWorkflowOwnedByCurrentUser = useCallback((workflow) => {
            return isMetronomeWorkflowOwnedByIdentityKeys(workflow, currentMetronomeUserIdentityKeys);
          }, [currentMetronomeUserIdentityKeys]);
          const metronomeHiddenTeamSharedWorkflowStorageScope = useMemo(() => {
            return String(currentUserEmail || currentUserName || "anonymous").trim().toLowerCase() || "anonymous";
          }, [currentUserEmail, currentUserName]);
          const [hiddenTeamSharedMetronomeWorkflowKeys, setHiddenTeamSharedMetronomeWorkflowKeys] = useState(() => {
            const initialScope = String(currentUserEmail || currentUserName || "anonymous").trim().toLowerCase() || "anonymous";
            return readMetronomeHiddenTeamSharedWorkflowKeys(initialScope);
          });
          const hiddenTeamSharedMetronomeWorkflowKeySet = useMemo(() => {
            return new Set(normalizeMetronomeHiddenTeamSharedWorkflowKeys(hiddenTeamSharedMetronomeWorkflowKeys));
          }, [hiddenTeamSharedMetronomeWorkflowKeys]);
          const [metronomeProjectTicketsByProjectId, setMetronomeProjectTicketsByProjectId] = useState({});
          const normalizedMetronomeProjectFilterId = String(projectFilterId || "").trim();
          const selectedMetronomeProjectFilter = useMemo(() => {
            return metronomeProjectOptions.find((option) => option.id === normalizedMetronomeProjectFilterId) || null;
          }, [metronomeProjectOptions, normalizedMetronomeProjectFilterId]);
          const builtInMetronomeWorkflows = useMemo(() => {
            return (Array.isArray(METRONOME_BUILT_IN_WORKFLOWS) ? METRONOME_BUILT_IN_WORKFLOWS : [])
              .map((definition) => createBuiltInMetronomeWorkflow(definition, {
                projectId: normalizedMetronomeProjectFilterId,
                projectName: selectedMetronomeProjectFilter?.name || "",
              }));
          }, [normalizedMetronomeProjectFilterId, selectedMetronomeProjectFilter]);
          const resourceTemplateMetronomePreviewWorkflows = useMemo(() => {
            const templates = typeof PLAYGROUND_RESOURCE_TEMPLATE_DATA !== "undefined" && Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_DATA)
              ? PLAYGROUND_RESOURCE_TEMPLATE_DATA
              : [];
            return templates
              .filter((template) => String(template?.type || "").trim() === "metronome")
              .map((template) => createResourceTemplateMetronomePreviewWorkflow(template, {
                projectId: normalizedMetronomeProjectFilterId,
                projectName: selectedMetronomeProjectFilter?.name || "",
              }))
              .filter(Boolean);
          }, [normalizedMetronomeProjectFilterId, selectedMetronomeProjectFilter]);
          const activeStoredWorkflow = useMemo(() => {
            return workflows.find((workflow) => workflow && workflow.id === activeWorkflowId) || null;
          }, [workflows, activeWorkflowId]);
          const ownedMetronomeWorkflowIdSet = useMemo(() => {
            return new Set((Array.isArray(workflows) ? workflows : [])
              .map((workflow) => String(workflow?.id || "").trim())
              .filter(Boolean));
          }, [workflows]);
          const activeSharedWorkflow = useMemo(() => {
            if (activeStoredWorkflow) return null;
            return sharedMetronomeWorkflows.find((workflow) => {
              const workflowId = String(workflow?.id || "").trim();
              return workflowId
                && workflowId === activeWorkflowId
                && !ownedMetronomeWorkflowIdSet.has(workflowId)
                && !isMetronomeWorkflowOwnedByCurrentUser(workflow);
            }) || null;
          }, [sharedMetronomeWorkflows, activeWorkflowId, activeStoredWorkflow, ownedMetronomeWorkflowIdSet, isMetronomeWorkflowOwnedByCurrentUser]);
          const activeBuiltInWorkflow = useMemo(() => {
            return builtInMetronomeWorkflows.find((workflow) => workflow && workflow.id === activeWorkflowId)
              || resourceTemplateMetronomePreviewWorkflows.find((workflow) => workflow && workflow.id === activeWorkflowId)
              || null;
          }, [builtInMetronomeWorkflows, resourceTemplateMetronomePreviewWorkflows, activeWorkflowId]);
          const activeWorkflow = activeStoredWorkflow || activeSharedWorkflow || activeBuiltInWorkflow || null;
          activeMetronomeWorkflowRef.current = activeWorkflow;
          const isActiveWorkflowOwnedByCurrentUser = Boolean(
            activeWorkflow
            && (
              activeStoredWorkflow
              || ownedMetronomeWorkflowIdSet.has(String(activeWorkflow.id || "").trim())
              || isMetronomeWorkflowOwnedByCurrentUser(activeWorkflow)
            )
          );
          const isActiveWorkflowTeamShared = Boolean(
            !isActiveWorkflowOwnedByCurrentUser
            && (activeSharedWorkflow || isMetronomeWorkflowTeamShared(activeWorkflow))
          );
          const activeWorkflowTeamShareAccessLevel = isActiveWorkflowTeamShared
            ? getMetronomeEffectiveTeamShareAccessLevel(activeWorkflow, currentMetronomeUserIdentityKeys)
            : "";
          const isActiveWorkflowTeamSharedEditable = Boolean(
            isActiveWorkflowTeamShared
            && (activeWorkflowTeamShareAccessLevel === "edit" || activeWorkflowTeamShareAccessLevel === "manage")
          );
          const isActiveWorkflowTeamSharedManageable = Boolean(
            isActiveWorkflowTeamShared
            && activeWorkflowTeamShareAccessLevel === "manage"
          );
          const isActiveWorkflowBuiltIn = Boolean(
            activeBuiltInWorkflow && isMetronomeWorkflowBuiltIn(activeBuiltInWorkflow)
            || isActiveWorkflowTeamShared && !isActiveWorkflowTeamSharedEditable
          );
          const isEditor = Boolean(activeWorkflow);
          const replaceMetronomeWorkflowInEditableState = useCallback((oldWorkflowId, nextWorkflow, options = {}) => {
            const normalizedWorkflow = normalizeMetronomeWorkflow(nextWorkflow);
            if (!normalizedWorkflow.id) return;
            const normalizedOldWorkflowId = String(oldWorkflowId || normalizedWorkflow.id || "").trim();
            const optionShared = options && Object.prototype.hasOwnProperty.call(options, "shared")
              ? Boolean(options.shared)
              : null;
            const isSharedTarget = optionShared !== null
              ? optionShared
              : Boolean(
                  isMetronomeWorkflowTeamShared(normalizedWorkflow)
                  || normalizedOldWorkflowId && normalizedOldWorkflowId === activeWorkflowId && isActiveWorkflowTeamShared
                  || normalizedWorkflow.id === activeWorkflowId && isActiveWorkflowTeamShared
                );
            const isOwnedTarget = Boolean(
              ownedMetronomeWorkflowIdSet.has(normalizedWorkflow.id)
              || normalizedOldWorkflowId && ownedMetronomeWorkflowIdSet.has(normalizedOldWorkflowId)
              || isMetronomeWorkflowOwnedByCurrentUser(normalizedWorkflow)
            );
            if (isSharedTarget && !isOwnedTarget) {
              setSharedMetronomeWorkflows((current) => replaceMetronomeWorkflowById(current, normalizedOldWorkflowId || normalizedWorkflow.id, normalizedWorkflow));
              return;
            }
            setWorkflows((current) => replaceMetronomeWorkflowById(current, normalizedOldWorkflowId || normalizedWorkflow.id, normalizedWorkflow));
          }, [activeWorkflowId, isActiveWorkflowTeamShared, ownedMetronomeWorkflowIdSet, isMetronomeWorkflowOwnedByCurrentUser]);
          replaceMetronomeWorkflowInEditableStateRef.current = replaceMetronomeWorkflowInEditableState;
          const saveEditableMetronomeWorkflowApi = useCallback((workflow) => {
            return saveMetronomeWorkflowApi(workflow, {
              createOnNotFound: !isMetronomeWorkflowTeamShared(workflow),
            });
          }, []);
          const visibleWorkflows = useMemo(() => {
            return filterMetronomeWorkflowsByProject(workflows, normalizedMetronomeProjectFilterId);
          }, [workflows, normalizedMetronomeProjectFilterId]);
          const projectSharedMetronomeWorkflows = useMemo(() => {
            return filterMetronomeWorkflowsByProject(sharedMetronomeWorkflows, normalizedMetronomeProjectFilterId);
          }, [sharedMetronomeWorkflows, normalizedMetronomeProjectFilterId]);
          const visibleSharedMetronomeWorkflows = useMemo(() => {
            return projectSharedMetronomeWorkflows
              .filter((workflow) => {
                const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(workflow);
                return !hiddenKey || !hiddenTeamSharedMetronomeWorkflowKeySet.has(hiddenKey);
              });
          }, [projectSharedMetronomeWorkflows, hiddenTeamSharedMetronomeWorkflowKeySet]);
          const removedSharedMetronomeWorkflows = useMemo(() => {
            return projectSharedMetronomeWorkflows
              .filter((workflow) => {
                const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(workflow);
                return Boolean(hiddenKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(hiddenKey));
              });
          }, [projectSharedMetronomeWorkflows, hiddenTeamSharedMetronomeWorkflowKeySet]);
          const ownedWorkflowIds = useMemo(() => {
            return new Set((Array.isArray(workflows) ? workflows : [])
              .map((workflow) => String(workflow?.id || "").trim())
              .filter(Boolean));
          }, [workflows]);
          const visibleUniqueSharedMetronomeWorkflows = useMemo(() => {
            return (Array.isArray(visibleSharedMetronomeWorkflows) ? visibleSharedMetronomeWorkflows : [])
              .filter((workflow) => {
                const workflowId = String(workflow?.id || "").trim();
                return workflowId
                  && !ownedWorkflowIds.has(workflowId)
                  && !isMetronomeWorkflowOwnedByCurrentUser(workflow);
              });
          }, [visibleSharedMetronomeWorkflows, ownedWorkflowIds, isMetronomeWorkflowOwnedByCurrentUser]);
          const removedUniqueSharedMetronomeWorkflows = useMemo(() => {
            return (Array.isArray(removedSharedMetronomeWorkflows) ? removedSharedMetronomeWorkflows : [])
              .filter((workflow) => {
                const workflowId = String(workflow?.id || "").trim();
                return workflowId
                  && !ownedWorkflowIds.has(workflowId)
                  && !isMetronomeWorkflowOwnedByCurrentUser(workflow);
              });
          }, [removedSharedMetronomeWorkflows, ownedWorkflowIds, isMetronomeWorkflowOwnedByCurrentUser]);
          const metronomeAvailableWorkflowRows = useMemo(() => {
            return [...builtInMetronomeWorkflows, ...visibleWorkflows, ...visibleUniqueSharedMetronomeWorkflows];
          }, [builtInMetronomeWorkflows, visibleWorkflows, visibleUniqueSharedMetronomeWorkflows]);
          const metronomeWorkflowOptionRows = useMemo(() => {
            return [...visibleWorkflows, ...visibleUniqueSharedMetronomeWorkflows];
          }, [visibleWorkflows, visibleUniqueSharedMetronomeWorkflows]);
          const hydrateTeamSharedMetronomeWorkflow = useCallback(async (workflow) => {
            const workflowId = String(workflow?.id || "").trim();
            if (!workflowId) return workflow;
            if (hasMetronomeWorkflowGraphNodes(workflow) && hasMetronomeWorkflowGraphEdges(workflow)) return workflow;
            if (!isMetronomeApiAvailable) return workflow;
            const loadedWorkflow = await fetchMetronomeWorkflowWithGraphFromApi(workflowId, readMetronomeSelectedDeploymentId(workflow));
            const mergedWorkflow = mergeMetronomeTeamSharedWorkflowGraphSnapshot(workflow, loadedWorkflow);
            if (!mergedWorkflow?.id) return workflow;
            setSharedMetronomeWorkflows((current) => (Array.isArray(current) ? current : []).map((item) => {
              return String(item?.id || "").trim() === workflowId ? mergedWorkflow : item;
            }));
            return mergedWorkflow;
          }, [isMetronomeApiAvailable]);
          useEffect(() => {
            setHiddenTeamSharedMetronomeWorkflowKeys(readMetronomeHiddenTeamSharedWorkflowKeys(metronomeHiddenTeamSharedWorkflowStorageScope));
          }, [metronomeHiddenTeamSharedWorkflowStorageScope]);
          useEffect(() => {
            if (!activeSharedWorkflow) return;
            const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(activeSharedWorkflow);
            if (!hiddenKey || !hiddenTeamSharedMetronomeWorkflowKeySet.has(hiddenKey)) return;
            setActiveWorkflowId("");
            setSelectedNodeId("");
          }, [activeSharedWorkflow, hiddenTeamSharedMetronomeWorkflowKeySet]);
          useEffect(() => {
            if (!activeWorkflowId || isLoadingMetronomes || !isMetronomeApiAvailable || activeWorkflow) {
              return;
            }
            setActiveWorkflowId("");
            setMetronomeRuns([]);
            setSelectedMetronomeRunId("");
            setMetronomeRunsError("Metronome workflow not found. Select a persisted workflow from the list.");
          }, [activeWorkflowId, activeWorkflow, isLoadingMetronomes, isMetronomeApiAvailable]);
          const metronomeShareWorkflow = useMemo(() => {
            const normalizedWorkflowId = String(metronomeShareWorkflowId || "").trim();
            if (!normalizedWorkflowId) return null;
            return metronomeAvailableWorkflowRows.find((workflow) => String(workflow?.id || "").trim() === normalizedWorkflowId)
              || workflows.find((workflow) => String(workflow?.id || "").trim() === normalizedWorkflowId)
              || null;
          }, [metronomeShareWorkflowId, metronomeAvailableWorkflowRows, workflows]);
          const loadMetronomeShareTeams = useCallback(async () => {
            let normalizedBackendUrl = String(backendUrl || "/api/real").trim() || "/api/real";
            normalizedBackendUrl = normalizedBackendUrl.replace(new RegExp("/+$"), "");
            if (!normalizedBackendUrl) {
              setMetronomeShareTeams([]);
              setMetronomeShareState({ status: "error", message: "Team sharing is unavailable in this session." });
              return;
            }
            setMetronomeShareState({ status: "loading", message: "Loading teams..." });
            try {
              const headers = new Headers(requestHeaders || {});
              if (apiKey) headers.set("X-API-Key", apiKey);
              const response = await fetch(normalizedBackendUrl + "/teams", {
                method: "GET",
                headers,
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load teams.");
              }
              const teams = (Array.isArray(data?.data) ? data.data : Array.isArray(data?.teams) ? data.teams : [])
                .map((team) => {
                  const id = String(team?.id || "").trim();
                  if (!id) return null;
                  return { ...team, id, name: String(team?.name || team?.title || "Untitled team").trim() || "Untitled team" };
                })
                .filter(Boolean);
              setMetronomeShareTeams(teams);
              setMetronomeShareTeamId((current) => {
                if (current && teams.some((team) => team.id === current)) return current;
                return teams[0]?.id || "";
              });
              setMetronomeShareState({
                status: "idle",
                message: teams.length ? "" : "No teams available yet.",
              });
            } catch (error) {
              setMetronomeShareTeams([]);
              setMetronomeShareTeamId("");
              setMetronomeShareState({ status: "error", message: error?.message || "Failed to load teams." });
            }
          }, [backendUrl, apiKey, requestHeaders]);
          useEffect(() => {
            if (!metronomeShareWorkflowId || !metronomeShareWorkflow || isMetronomeWorkflowBuiltIn(metronomeShareWorkflow)) return;
            void loadMetronomeShareTeams();
          }, [metronomeShareWorkflowId, metronomeShareWorkflow, loadMetronomeShareTeams]);
          const visibleMetronomeNodePaletteGroups = useMemo(() => {
            const supportedKinds = new Set(
              Array.isArray(metronomeNodeSchemaRegistry?.nodeKinds) && metronomeNodeSchemaRegistry.nodeKinds.length
                ? metronomeNodeSchemaRegistry.nodeKinds
                : Object.keys(METRONOME_NODE_KIND_META).filter((kind) => kind !== "approval")
            );
            supportedKinds.add("firecrawl");
            return METRONOME_NODE_PALETTE_GROUPS
              .map((group) => ({
                ...group,
                items: group.items.filter((item) => supportedKinds.has(String(item.kind || "")) && METRONOME_NODE_KIND_META[item.kind]),
              }))
              .filter((group) => group.items.length > 0);
          }, [metronomeNodeSchemaRegistry]);
          useEffect(() => {
            if (!isMetronomeApiAvailable) return () => {};
            let cancelled = false;
            void fetchMetronomeNodeSchemasApi()
              .then((registry) => {
                if (!cancelled) {
                  setMetronomeNodeSchemaRegistry(registry);
                }
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load node schema registry", error);
                }
              });
            return () => {
              cancelled = true;
            };
          }, [isMetronomeApiAvailable]);
          const metronomeFunctionOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => {
                if (isMetronomeFunctionServerKind(resource.kind)) return true;
                if (isMetronomeFunctionResourceRecord(resource.raw || resource, resource.kind)) return true;
                const id = String(resource.id || "").toLowerCase();
                const name = String(resource.name || "").toLowerCase();
                return id.startsWith("fn_") || /\b(function|functions|nodejs|node\.js|edge)\b/.test(name);
              })
              .map((resource) => ({ id: resource.id, name: resource.name || resource.id }));
          }, [metronomeServerResources]);
          const metronomeWebAppOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => isMetronomeWebAppServerKind(resource.kind))
              .map((resource) => ({ id: resource.id, name: resource.name || resource.id, kind: resource.kind || "web_app" }));
          }, [metronomeServerResources]);
          const metronomeDatabaseOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => {
                if (isMetronomeDatabaseServerKind(resource.kind)) return true;
                const id = String(resource.id || "").toLowerCase();
                const name = String(resource.name || "").toLowerCase();
                return id.startsWith("db_") || /\b(database|postgres|db)\b/.test(name);
              })
              .map((resource) => ({ id: resource.id, name: resource.name }));
          }, [metronomeServerResources]);
          const metronomeAuthOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => isMetronomeAuthServerKind(resource.kind))
              .map((resource) => ({ id: resource.id, name: resource.name || resource.id }));
          }, [metronomeServerResources]);
          const metronomeSecretVaultOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => {
                if (isMetronomeSecretsServerKind(resource.kind)) return true;
                const id = String(resource.id || "").toLowerCase();
                const name = String(resource.name || "").toLowerCase();
                return id.startsWith("sec_") || /\b(secret|secrets|vault)\b/.test(name);
              })
              .map((resource) => ({ id: resource.id, name: resource.name || resource.id }));
          }, [metronomeServerResources]);
          const loadMetronomeSecretVaultSecrets = useCallback(async (vaultId, options = {}) => {
            const normalizedVaultId = String(vaultId || "").trim();
            if (!normalizedVaultId) return [];
            if (!options.force && Array.isArray(metronomeSecretVaultSecretsByVaultId[normalizedVaultId])) {
              return metronomeSecretVaultSecretsByVaultId[normalizedVaultId];
            }
            setMetronomeSecretVaultSecretsLoadingId(normalizedVaultId);
            try {
              const secrets = await fetchMetronomeSecretVaultSecretsApi(normalizedVaultId);
              setMetronomeSecretVaultSecretsByVaultId((current) => ({
                ...current,
                [normalizedVaultId]: secrets,
              }));
              return secrets;
            } catch (error) {
              console.warn("[Metronome] Failed to load secrets", error);
              setMetronomeSecretVaultSecretsByVaultId((current) => ({
                ...current,
                [normalizedVaultId]: [],
              }));
              return [];
            } finally {
              setMetronomeSecretVaultSecretsLoadingId((current) => current === normalizedVaultId ? "" : current);
            }
          }, [metronomeSecretVaultSecretsByVaultId]);
          const metronomeHeaderSecretOptions = useMemo(() => {
            const options = [];
            metronomeSecretVaultOptions.forEach((vault) => {
              const vaultId = String(vault?.id || "").trim();
              if (!vaultId) return;
              const secrets = Array.isArray(metronomeSecretVaultSecretsByVaultId[vaultId])
                ? metronomeSecretVaultSecretsByVaultId[vaultId]
                : [];
              secrets.forEach((secret) => {
                const secretId = String(secret?.id || "").trim();
                if (!secretId) return;
                options.push({
                  id: buildMetronomeSecretCredentialRef(vaultId, secretId),
                  label: secret.name || secretId,
                  description: (vault.name || vaultId) + (secret.description ? " · " + secret.description : ""),
                  vaultId,
                  vaultName: vault.name || vaultId,
                  secretId,
                  secretName: secret.name || secretId,
                });
              });
            });
            return options;
          }, [metronomeSecretVaultOptions, metronomeSecretVaultSecretsByVaultId]);
          const loadAllMetronomeHeaderSecrets = useCallback(() => {
            if (!metronomeSecretVaultOptions.length) return Promise.resolve([]);
            return Promise.all(
              metronomeSecretVaultOptions.map((vault) => loadMetronomeSecretVaultSecrets(vault.id))
            );
          }, [metronomeSecretVaultOptions, loadMetronomeSecretVaultSecrets]);
          const defaultMetronomeAgentOption = useMemo(() => {
            return getMetronomePreferredOption(metronomeAgentOptions, ["assistant"], METRONOME_FALLBACK_AGENTS[0]);
          }, [metronomeAgentOptions]);
          const defaultMetronomeComputerOption = useMemo(() => {
            return getMetronomePreferredOption(metronomeComputerOptions, ["default"], METRONOME_FALLBACK_COMPUTERS[0]);
          }, [metronomeComputerOptions]);
          const metronomeWorkflowOptions = useMemo(() => {
            return (Array.isArray(metronomeWorkflowOptionRows) ? metronomeWorkflowOptionRows : [])
              .filter((workflow) => workflow && workflow.id && workflow.id !== activeWorkflowId && !isMetronomeWorkflowBuiltIn(workflow))
              .map((workflow) => ({
                id: String(workflow.id),
                name: String(workflow.name || workflow.id || "Untitled Metronome"),
              }));
          }, [metronomeWorkflowOptionRows, activeWorkflowId]);

          useEffect(() => {
            if (!normalizedMetronomeProjectFilterId || !activeWorkflowId) return;
            if (activeBuiltInWorkflow) return;
            if (!metronomeAvailableWorkflowRows.some((workflow) => workflow.id === activeWorkflowId)) {
              setActiveWorkflowId("");
            }
          }, [activeWorkflowId, activeBuiltInWorkflow, normalizedMetronomeProjectFilterId, metronomeAvailableWorkflowRows]);

          useEffect(() => {
            const requestedWorkflowId = String(openWorkflowRequest?.workflowId || "").trim();
            const requestedRunId = String(openWorkflowRequest?.runId || "").trim();
            const requestedMode = openWorkflowRequest?.mode === "run-detail"
              ? "run-detail"
              : openWorkflowRequest?.mode === "runs"
              ? "runs"
              : openWorkflowRequest?.mode === "code"
                ? "code"
                : openWorkflowRequest?.mode === "edit"
                  ? "edit"
                  : "";
            const requestToken = openWorkflowRequest?.token;
            if (!requestedWorkflowId) {
              return;
            }
            pendingMetronomeOpenRunRef.current = {
              workflowId: requestedWorkflowId,
              runId: requestedRunId,
              mode: requestedMode,
            };
            const applyRequestedWorkflow = (workflow) => {
              if (!workflow?.id) return;
              setActiveWorkflowId(workflow.id);
              setMetronomeEditorMode(requestedMode === "run-detail" ? "runs" : (requestedMode || "edit"));
              setMetronomeRunInlineDetailId(
                requestedMode === "run-detail" || requestedMode === "runs" && requestedRunId
                  ? requestedRunId
                  : ""
              );
              if (requestedRunId) {
                setSelectedMetronomeRunId(requestedRunId);
              }
              if (typeof onOpenWorkflowRequestHandled === "function") {
                onOpenWorkflowRequestHandled(requestToken);
              }
            };
            const targetWorkflow = workflows.find((workflow) => workflow && workflow.id === requestedWorkflowId)
              || sharedMetronomeWorkflows.find((workflow) => workflow && workflow.id === requestedWorkflowId)
              || builtInMetronomeWorkflows.find((workflow) => workflow && workflow.id === requestedWorkflowId)
              || resourceTemplateMetronomePreviewWorkflows.find((workflow) => workflow && workflow.id === requestedWorkflowId);
            if (targetWorkflow) {
              if (
                !isMetronomeWorkflowBuiltIn(targetWorkflow)
                && isMetronomeApiAvailable
                && (!hasMetronomeWorkflowGraphNodes(targetWorkflow) || !hasMetronomeWorkflowGraphEdges(targetWorkflow))
              ) {
                let cancelled = false;
                void fetchMetronomeWorkflowWithGraphFromApi(requestedWorkflowId)
                  .then((loadedWorkflow) => {
                    if (cancelled || !loadedWorkflow?.id) {
                      if (!cancelled) applyRequestedWorkflow(targetWorkflow);
                      return;
                    }
                  replaceMetronomeWorkflowInEditableState(loadedWorkflow.id, loadedWorkflow, { shared: isMetronomeWorkflowTeamShared(targetWorkflow) });
                  applyRequestedWorkflow(loadedWorkflow);
                  })
                  .catch((error) => {
                    console.warn("[Metronome] Failed to hydrate requested workflow before opening", error);
                    if (!cancelled) applyRequestedWorkflow(targetWorkflow);
                  });
                return () => {
                  cancelled = true;
                };
              }
              applyRequestedWorkflow(targetWorkflow);
              return;
            }
            if (isLoadingMetronomes) {
              return;
            }
            let cancelled = false;
            void fetchMetronomeWorkflowWithGraphFromApi(requestedWorkflowId)
              .then((loadedWorkflow) => {
                if (cancelled || !loadedWorkflow?.id) return;
                replaceMetronomeWorkflowInEditableState(loadedWorkflow.id, loadedWorkflow, { shared: false });
                applyRequestedWorkflow(loadedWorkflow);
              })
              .catch((error) => {
                console.warn("[Metronome] Failed to open requested workflow", error);
              });
            return () => {
              cancelled = true;
            };
          }, [openWorkflowRequest, workflows, sharedMetronomeWorkflows, builtInMetronomeWorkflows, resourceTemplateMetronomePreviewWorkflows, onOpenWorkflowRequestHandled, isLoadingMetronomes, isMetronomeApiAvailable, replaceMetronomeWorkflowInEditableState]);

          useEffect(() => {
            if (!normalizedMetronomeProjectFilterId) {
              writeMetronomeWorkflowsToStorage(workflows);
              return;
            }
            const scopedWorkflows = Array.isArray(workflows) ? workflows : [];
            const scopedIds = new Set(scopedWorkflows
              .map((workflow) => String(workflow?.id || "").trim())
              .filter(Boolean));
            const retainedWorkflows = readMetronomeWorkflowsFromStorage().filter((workflow) => {
              const workflowId = String(workflow?.id || "").trim();
              if (workflowId && scopedIds.has(workflowId)) return false;
              return readMetronomeWorkflowProjectId(workflow) !== normalizedMetronomeProjectFilterId;
            });
            writeMetronomeWorkflowsToStorage([...retainedWorkflows, ...scopedWorkflows]);
          }, [workflows, normalizedMetronomeProjectFilterId]);

          useEffect(() => {
            setIsMetronomeWorkspaceSelectorOpen(false);
            setIsMetronomeAgentSelectorOpen(false);
            closeMetronomeSchedulePopover({ immediate: true });
            closeMetronomeAttachmentPopover({ immediate: true });
            closeMetronomeInspectorSelectPopover({ immediate: true });
            setIsMetronomeTriggerDiagnosticsModalOpen(false);
            setMetronomeFunctionInvokeState({
              nodeId: selectedNodeId || "",
              status: "idle",
              error: "",
              resultText: "",
            });
            setMetronomeDatabaseExpandedPaths({});
            setMetronomeDatabaseFieldComposerState({
              open: false,
              parentPath: [],
              key: "",
              type: "string",
              value: "",
              error: "",
            });
          }, [selectedNodeId, closeMetronomeSchedulePopover, closeMetronomeAttachmentPopover, closeMetronomeInspectorSelectPopover]);

          useEffect(() => {
            if (!metronomeRunActionMenu || typeof document === "undefined") return () => {};
            const handleRunActionMenuPointerDown = (event) => {
              const target = event.target;
              if (target?.closest?.(".playground-metronome-run-action-menu-shell, .playground-metronome-run-table-action-menu")) return;
              setMetronomeRunActionMenu(null);
            };
            const handleRunActionMenuKeyDown = (event) => {
              if (event.key === "Escape") {
                setMetronomeRunActionMenu(null);
              }
            };
            document.addEventListener("pointerdown", handleRunActionMenuPointerDown, true);
            document.addEventListener("keydown", handleRunActionMenuKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handleRunActionMenuPointerDown, true);
              document.removeEventListener("keydown", handleRunActionMenuKeyDown);
            };
          }, [metronomeRunActionMenu]);

          useEffect(() => {
            if (!isMetronomeSchedulePopoverOpen || typeof document === "undefined") return () => {};
            const handleSchedulePointerDown = (event) => {
              const target = event.target;
              if (!target?.closest) return;
              if (target.closest(".playground-metronome-schedule-popover")) return;
              if (!target.closest(".playground-metronome-schedule-settings")) {
                closeMetronomeSchedulePopover();
              }
            };
            const handleScheduleKeyDown = (event) => {
              if (event.key === "Escape") {
                closeMetronomeSchedulePopover();
              }
            };
            document.addEventListener("pointerdown", handleSchedulePointerDown, true);
            document.addEventListener("keydown", handleScheduleKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handleSchedulePointerDown, true);
              document.removeEventListener("keydown", handleScheduleKeyDown);
            };
          }, [isMetronomeSchedulePopoverOpen, closeMetronomeSchedulePopover]);

          useEffect(() => () => {
            if (metronomeSchedulePopoverCloseTimerRef.current && typeof window !== "undefined") {
              window.clearTimeout(metronomeSchedulePopoverCloseTimerRef.current);
              metronomeSchedulePopoverCloseTimerRef.current = null;
            }
          }, []);

          useEffect(() => {
            if (!isMetronomeAttachmentPopoverOpen || typeof document === "undefined") return () => {};
            const handleAttachmentPopoverPointerDown = (event) => {
              const target = event.target;
              if (target?.closest?.(".playground-metronome-instructions-attachments-shell")) return;
              if (target?.closest?.(".playground-metronome-instructions-attachments-popover")) return;
              closeMetronomeAttachmentPopover();
            };
            const handleAttachmentPopoverKeyDown = (event) => {
              if (event.key === "Escape") {
                closeMetronomeAttachmentPopover();
              }
            };
            document.addEventListener("pointerdown", handleAttachmentPopoverPointerDown, true);
            document.addEventListener("keydown", handleAttachmentPopoverKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handleAttachmentPopoverPointerDown, true);
              document.removeEventListener("keydown", handleAttachmentPopoverKeyDown);
            };
          }, [isMetronomeAttachmentPopoverOpen, closeMetronomeAttachmentPopover]);

          useEffect(() => () => {
            if (metronomeAttachmentPopoverCloseTimerRef.current && typeof window !== "undefined") {
              window.clearTimeout(metronomeAttachmentPopoverCloseTimerRef.current);
              metronomeAttachmentPopoverCloseTimerRef.current = null;
            }
          }, []);

          useEffect(() => {
            if (!metronomeInspectorSelectPopover.id || typeof document === "undefined") return () => {};
            const handleInspectorSelectPointerDown = (event) => {
              const target = event.target;
              if (target?.closest?.(".playground-metronome-inspector-select-popup")) return;
              if (target?.closest?.(".playground-metronome-custom-select-trigger")) return;
              closeMetronomeInspectorSelectPopover();
            };
            const handleInspectorSelectKeyDown = (event) => {
              if (event.key === "Escape") {
                closeMetronomeInspectorSelectPopover();
              }
            };
            document.addEventListener("pointerdown", handleInspectorSelectPointerDown, true);
            document.addEventListener("keydown", handleInspectorSelectKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handleInspectorSelectPointerDown, true);
              document.removeEventListener("keydown", handleInspectorSelectKeyDown);
            };
          }, [metronomeInspectorSelectPopover.id, closeMetronomeInspectorSelectPopover]);

          useEffect(() => () => {
            if (metronomeInspectorSelectCloseTimerRef.current && typeof window !== "undefined") {
              window.clearTimeout(metronomeInspectorSelectCloseTimerRef.current);
              metronomeInspectorSelectCloseTimerRef.current = null;
            }
          }, []);

          useEffect(() => {
            if (!isMetronomeTriggerDiagnosticsModalOpen || typeof document === "undefined") return () => {};
            const handleDiagnosticsModalKeyDown = (event) => {
              if (event.key === "Escape") {
                setIsMetronomeTriggerDiagnosticsModalOpen(false);
              }
            };
            document.addEventListener("keydown", handleDiagnosticsModalKeyDown);
            return () => {
              document.removeEventListener("keydown", handleDiagnosticsModalKeyDown);
            };
          }, [isMetronomeTriggerDiagnosticsModalOpen]);

          useEffect(() => {
            if (typeof document === "undefined") return () => {};
            const handleWorkspaceSelectorPointerDown = (event) => {
              if (isActiveWorkflowBuiltIn) {
                setIsMetronomeWorkspaceSelectorOpen(false);
                return;
              }
              const target = event.target;
              if (!target?.closest) return;
              if (target.closest(".playground-metronome-workspace-popup-portal")) {
                return;
              }
              if (target.closest(".playground-metronome-agent-popup-portal")) {
                return;
              }
              const selector = target.closest(".playground-metronome-workspace-selector-field");
              if (!selector) {
                setIsMetronomeWorkspaceSelectorOpen(false);
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              const anchor = selector.querySelector(".playground-metronome-workspace-selector-trigger") || selector;
              const rect = anchor.getBoundingClientRect?.();
              if (rect) {
                setMetronomeWorkspaceSelectorRect({
                  left: rect.left,
                  top: rect.bottom + 8,
                  width: rect.width,
                });
              }
              const contextType = selector.getAttribute("data-context-type") === "project" ? "project" : "computer";
              setMetronomeWorkspaceSelectorMode(contextType === "project" ? "projects" : "computers");
              setIsMetronomeWorkspaceSelectorOpen(true);
              setIsMetronomeAgentSelectorOpen(false);
            };
            document.addEventListener("pointerdown", handleWorkspaceSelectorPointerDown, true);
            return () => {
              document.removeEventListener("pointerdown", handleWorkspaceSelectorPointerDown, true);
            };
          }, [isActiveWorkflowBuiltIn]);

          useEffect(() => {
            if (typeof document === "undefined") return () => {};
            const handleAgentSelectorPointerDown = (event) => {
              if (isActiveWorkflowBuiltIn) {
                setIsMetronomeAgentSelectorOpen(false);
                return;
              }
              const target = event.target;
              if (!target?.closest) return;
              if (target.closest(".playground-metronome-agent-popup-portal")) {
                return;
              }
              if (target.closest(".playground-metronome-workspace-popup-portal")) {
                return;
              }
              const selector = target.closest(".playground-metronome-agent-selector-field");
              if (!selector) {
                setIsMetronomeAgentSelectorOpen(false);
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              const anchor = selector.querySelector(".playground-metronome-agent-selector-trigger") || selector;
              const rect = anchor.getBoundingClientRect?.();
              if (rect) {
                setMetronomeAgentSelectorRect({
                  left: rect.left,
                  top: rect.bottom + 8,
                  width: rect.width,
                });
              }
              setIsMetronomeAgentSelectorOpen(true);
              setIsMetronomeWorkspaceSelectorOpen(false);
            };
            document.addEventListener("pointerdown", handleAgentSelectorPointerDown, true);
            return () => {
              document.removeEventListener("pointerdown", handleAgentSelectorPointerDown, true);
            };
          }, [isActiveWorkflowBuiltIn]);

          useEffect(() => {
            if (!isMetronomeWorkspaceSelectorOpen) {
              setMetronomeWorkspaceSelectorRect(null);
              return () => {};
            }
            const updateWorkspaceSelectorRect = () => {
              const rect = metronomeWorkspaceSelectorAnchorRef.current?.getBoundingClientRect?.();
              if (!rect) return;
              setMetronomeWorkspaceSelectorRect({
                left: rect.left,
                top: rect.bottom + 8,
                width: rect.width,
              });
            };
            updateWorkspaceSelectorRect();
            window.addEventListener("resize", updateWorkspaceSelectorRect);
            window.addEventListener("scroll", updateWorkspaceSelectorRect, true);
            return () => {
              window.removeEventListener("resize", updateWorkspaceSelectorRect);
              window.removeEventListener("scroll", updateWorkspaceSelectorRect, true);
            };
          }, [isMetronomeWorkspaceSelectorOpen, selectedNodeId]);

          useEffect(() => {
            if (!isMetronomeAgentSelectorOpen) {
              setMetronomeAgentSelectorRect(null);
              return () => {};
            }
            const updateAgentSelectorRect = () => {
              const rect = metronomeAgentSelectorAnchorRef.current?.getBoundingClientRect?.();
              if (!rect) return;
              setMetronomeAgentSelectorRect({
                left: rect.left,
                top: rect.bottom + 8,
                width: rect.width,
              });
            };
            updateAgentSelectorRect();
            window.addEventListener("resize", updateAgentSelectorRect);
            window.addEventListener("scroll", updateAgentSelectorRect, true);
            return () => {
              window.removeEventListener("resize", updateAgentSelectorRect);
              window.removeEventListener("scroll", updateAgentSelectorRect, true);
            };
          }, [isMetronomeAgentSelectorOpen, selectedNodeId]);

          useEffect(() => {
            let cancelled = false;
            setIsLoadingMetronomes(true);
            void fetchMetronomeWorkflowsFromApi(normalizedMetronomeProjectFilterId, {
              backendUrl,
              apiKey,
              requestHeaders,
            })
              .then((items) => {
                if (cancelled) return;
                const storedItems = filterMetronomeWorkflowsByProject(readMetronomeWorkflowsFromStorage(), normalizedMetronomeProjectFilterId);
                setWorkflows((current) => mergeMetronomeWorkflowListPreservingGraphs(items, current, storedItems));
                setIsMetronomeApiAvailable(true);
              })
              .catch((error) => {
                if (cancelled) return;
                console.warn("[Metronome] Falling back to local drafts", error);
                setIsMetronomeApiAvailable(false);
                setWorkflows(filterMetronomeWorkflowsByProject(readMetronomeWorkflowsFromStorage(), normalizedMetronomeProjectFilterId));
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomes(false);
              });
            return () => {
              cancelled = true;
            };
          }, [apiKey, backendUrl, metronomeRequestHeadersKey, normalizedMetronomeProjectFilterId]);

          useEffect(() => {
            let cancelled = false;
            void fetchMetronomeSharedWorkflowsFromTeamsApi({
              backendUrl,
              apiKey,
              requestHeaders,
            })
              .then((items) => {
                if (!cancelled) setSharedMetronomeWorkflows(items);
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load team-shared workflows", error);
                  setSharedMetronomeWorkflows([]);
                }
              });
            return () => {
              cancelled = true;
            };
          }, [backendUrl, apiKey, metronomeRequestHeadersKey]);

          useEffect(() => {
            let cancelled = false;
            void fetchMetronomeServerResourcesApi()
              .then((items) => {
                if (!cancelled) setMetronomeServerResources(items);
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load server resources", error);
                  setMetronomeServerResources([]);
                }
              });
            return () => {
              cancelled = true;
            };
          }, []);

          useEffect(() => {
            let cancelled = false;
            setIsMetronomeFlowReady(false);
            const nextNodes = activeWorkflow?.nodes || [];
            const nextEdges = normalizeMetronomeEdgesForNodes(activeWorkflow?.edges || [], nextNodes);
            setNodes(nextNodes);
            setEdges(nextEdges);
            const persistedKey = activeWorkflow
              ? createMetronomePersistedWorkflowKey(activeWorkflow, nextNodes, nextEdges)
              : "";
            metronomeAutosaveLastSavedKeyRef.current = persistedKey;
            metronomeAutosaveLatestKeyRef.current = persistedKey;
            if (metronomeAutosaveTimerRef.current) {
              window.clearTimeout(metronomeAutosaveTimerRef.current);
              metronomeAutosaveTimerRef.current = null;
            }
            metronomeAutosaveRevisionRef.current += 1;
            if (metronomeVersionComparisonTimerRef.current) {
              window.clearTimeout(metronomeVersionComparisonTimerRef.current);
              metronomeVersionComparisonTimerRef.current = null;
            }
            metronomeVersionComparisonTokenRef.current += 1;
            metronomeVersionComparisonGraphRef.current = {
              workflowId: activeWorkflowId,
              selectedDeploymentId: readMetronomeSelectedDeploymentId(activeWorkflow),
              workflow: activeWorkflow,
              deployments: null,
              nodes: nextNodes,
              edges: nextEdges,
              codeDirty: false,
              flowReady: false,
              readOnly: isActiveWorkflowBuiltIn,
            };
            metronomeLocalGraphObservedRef.current = {
              workflowId: activeWorkflowId,
              nodes: nextNodes,
              edges: nextEdges,
            };
            setActiveMetronomeVersionChanges(false);
            setSelectedNodeId("");
            setActiveMetronomeRichTextField("");
            setMetronomeDynamicContentPicker({ fieldKey: "", rect: null, query: "" });
            setMetronomeEditorMode("edit");
            setGraphUndoStack([]);
            setGraphRedoStack([]);
            setIsMetronomeCodeDirty(false);
            setMetronomeCodeFilesDraft([]);
            setActiveMetronomeCodeFilePath("main.py");
            setMetronomeCodeRunState({ status: "idle", message: "" });
            setMetronomeRuns([]);
            setMetronomeDeploymentEvents([]);
            setMetronomeDeploymentEventsError("");
            setIsLoadingMetronomeDeploymentEvents(false);
            setMetronomeTriggerEvents([]);
            setMetronomeTriggerEventsError("");
            setMetronomeTriggerTestState({ status: "idle", message: "" });
            setIsLoadingMetronomeTriggerEvents(false);
            setSelectedMetronomeRunId("");
            setMetronomeRunInlineDetailId("");
            setMetronomeEditorHighlightRunId("");
            setMetronomeCanvasInteractionMode("pan");
            setMetronomeRunState({ status: "idle", message: "" });
            setIsMetronomeVersionHistorySidebarOpen(false);
            setIsMetronomeDeploymentHistoryModalOpen(false);
            setMetronomePublishState({ status: "idle", message: "" });
            closeMetronomeAttachmentPopover({ immediate: true });
            setMetronomeAttachmentModalOpen(false);
            setIsMetronomeAttachmentDragging(false);
            setMetronomeAttachmentStatus("");
            setMetronomeEnvironmentFilePickerSearch("");
            setMetronomeEnvironmentFilePickerInventory([]);
            setMetronomeEnvironmentFilePickerExpandedFolders([]);
            setMetronomeEnvironmentFilePickerSelectedPaths([]);
            setMetronomeEnvironmentFilePickerState({ status: "idle", error: "" });
            setIsMetronomeAttachmentUploading(false);
            const markFlowReady = () => {
              if (cancelled) return;
              setMetronomeFlowMountVersion((version) => version + 1);
              setIsMetronomeFlowReady(Boolean(activeWorkflow));
            };
            if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
              window.requestAnimationFrame(markFlowReady);
            } else {
              setTimeout(markFlowReady, 0);
            }
            return () => {
              cancelled = true;
            };
          }, [activeWorkflowId, activeWorkflow?.id, closeMetronomeAttachmentPopover]);

          useEffect(() => {
            setActiveMetronomeRichTextField("");
            setMetronomeDynamicContentPicker({ fieldKey: "", rect: null, query: "" });
            setMetronomeOutputContractComposer({ key: "", type: "string" });
            setIsMetronomeThreadMoreOpen(false);
            setMetronomeFieldTooltipPortal({ copy: "", rect: null });
          }, [selectedNodeId]);

          useEffect(() => {
            let cancelled = false;
            if (!activeWorkflowId || isActiveWorkflowBuiltIn) {
              setMetronomeRuns([]);
              setMetronomeRunsError("");
              setSelectedMetronomeRunId("");
              setIsLoadingMetronomeRuns(false);
              return () => {
                cancelled = true;
              };
            }
            setIsLoadingMetronomeRuns(true);
            setMetronomeRunsError("");
            void fetchMetronomeRunsApi(activeWorkflowId)
	              .then((items) => {
	                if (cancelled) return;
	                setMetronomeRuns(items);
	                if (typeof window !== "undefined") {
	                  items.slice(0, 3).forEach((run) => {
	                    window.dispatchEvent(new CustomEvent("playground:metronome-run-upserted", {
	                      detail: { workflow: activeWorkflow, run },
	                    }));
	                  });
	                }
	                setMetronomeRunsError("");
                const pendingOpen = pendingMetronomeOpenRunRef.current || {};
                const pendingRunId = pendingOpen.workflowId === activeWorkflowId
                  ? String(pendingOpen.runId || "").trim()
                  : "";
                const hasPendingRun = pendingRunId && items.some((run) => run.id === pendingRunId);
                const shouldShowRunInlineDetail = pendingOpen.workflowId === activeWorkflowId
                  && (
                    pendingOpen.mode === "run-detail"
                    || pendingOpen.mode === "runs" && Boolean(pendingRunId)
                  );
                setSelectedMetronomeRunId((current) => {
                  if (hasPendingRun) return pendingRunId;
                  return current && items.some((run) => run.id === current) ? current : (items[0]?.id || "");
                });
                if (shouldShowRunInlineDetail && (hasPendingRun || items.length)) {
                  setSelectedNodeId("");
                  setIsMetronomeVersionHistorySidebarOpen(false);
                  setMetronomeRunInlineDetailId(hasPendingRun ? pendingRunId : (items[0]?.id || ""));
                }
                if (pendingOpen.workflowId === activeWorkflowId && (!pendingRunId || hasPendingRun || items.length)) {
                  pendingMetronomeOpenRunRef.current = { workflowId: "", runId: "", mode: "" };
                }
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load runs", error);
                  setMetronomeRuns([]);
                  setMetronomeRunsError(error?.status === 404
                    ? "This Metronome workflow was not found on the backend. Return to Metronomes and open a persisted workflow."
                    : (error?.message || "Failed to load Metronome runs."));
                  setSelectedMetronomeRunId("");
                }
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomeRuns(false);
              });
            return () => {
              cancelled = true;
            };
          }, [activeWorkflowId, isActiveWorkflowBuiltIn]);

          useEffect(() => {
            if (!activeWorkflowId) {
              return undefined;
            }

            function handleExternalRunDeleted(event) {
              const detail = event?.detail && typeof event.detail === "object" ? event.detail : {};
              const workflowId = String(detail.metronomeId || detail.workflowId || "").trim();
              const runId = String(detail.runId || "").trim();
              if (!runId || workflowId !== activeWorkflowId) {
                return;
              }
              setMetronomeRuns((current) => current.filter((run) => run.id !== runId));
              setSelectedMetronomeRunId((current) => current === runId ? "" : current);
              setSelectedMetronomeRunIds((current) => {
                const next = new Set(current || []);
                next.delete(runId);
                return next;
              });
              setMetronomeRunInlineDetailId((current) => current === runId ? "" : current);
            }

            window.addEventListener("playground:metronome-run-deleted", handleExternalRunDeleted);
            return () => window.removeEventListener("playground:metronome-run-deleted", handleExternalRunDeleted);
          }, [activeWorkflowId]);

          useEffect(() => {
            let cancelled = false;
            if (!activeWorkflowId || isActiveWorkflowBuiltIn || !isMetronomeApiAvailable) {
              setMetronomeDeploymentEvents([]);
              setMetronomeDeploymentEventsError("");
              setIsLoadingMetronomeDeploymentEvents(false);
              return () => {
                cancelled = true;
              };
            }
            setIsLoadingMetronomeDeploymentEvents(true);
            setMetronomeDeploymentEventsError("");
            void fetchMetronomeDeploymentsApi(activeWorkflowId, 20)
              .then((items) => {
                if (cancelled) return;
                setMetronomeDeploymentEvents(items);
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load deployment history", error);
                  setMetronomeDeploymentEvents([]);
                  setMetronomeDeploymentEventsError(error instanceof Error ? error.message : "Failed to load deployment history.");
                }
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomeDeploymentEvents(false);
              });
            return () => {
              cancelled = true;
            };
          }, [activeWorkflowId, isActiveWorkflowBuiltIn, isMetronomeApiAvailable]);

          useEffect(() => {
            function handleMetronomeVersionsLoaded(event) {
              const detail = event?.detail && typeof event.detail === "object" ? event.detail : {};
              const workflowId = String(detail.workflowId || detail.metronomeId || "").trim();
              if (!workflowId || !Array.isArray(detail.versions)) return;
              setMetronomeVersionsByWorkflowId((current) => (
                current[workflowId] === detail.versions
                  ? current
                  : { ...current, [workflowId]: detail.versions }
              ));
            }
            window.addEventListener("playground:metronome-versions-loaded", handleMetronomeVersionsLoaded);
            return () => window.removeEventListener("playground:metronome-versions-loaded", handleMetronomeVersionsLoaded);
          }, []);

          useEffect(() => {
            let cancelled = false;
            if (!activeWorkflowId || isActiveWorkflowBuiltIn || !isMetronomeApiAvailable) {
              setIsLoadingMetronomeVersions(false);
              setMetronomeVersionsError("");
              return () => {
                cancelled = true;
              };
            }
            const cachedVersions = metronomeVersionSnapshotCache.get(activeWorkflowId);
            if (cachedVersions) {
              setMetronomeVersionsByWorkflowId((current) => (
                current[activeWorkflowId] === cachedVersions
                  ? current
                  : { ...current, [activeWorkflowId]: cachedVersions }
              ));
              setIsLoadingMetronomeVersions(false);
              return () => {
                cancelled = true;
              };
            }
            setIsLoadingMetronomeVersions(true);
            setMetronomeVersionsError("");
            void hydrateMetronomeVersionsApi(activeWorkflowId, { backendUrl, apiKey, requestHeaders })
              .then((versions) => {
                if (cancelled) return;
                if (!versions.length) {
                  setMetronomeVersionsError("No saved versions were returned for this workflow.");
                  return;
                }
                setMetronomeVersionsByWorkflowId((current) => (
                  current[activeWorkflowId] === versions
                    ? current
                    : { ...current, [activeWorkflowId]: versions }
                ));
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load workflow versions", error);
                  setMetronomeVersionsError(error instanceof Error ? error.message : "Failed to load workflow versions.");
                }
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomeVersions(false);
              });
            return () => {
              cancelled = true;
            };
          }, [
            activeWorkflowId,
            apiKey,
            backendUrl,
            isActiveWorkflowBuiltIn,
            isMetronomeApiAvailable,
            metronomeRequestHeadersKey,
          ]);

          useEffect(() => {
            let cancelled = false;
            if (!activeWorkflowId || isActiveWorkflowBuiltIn || !isMetronomeApiAvailable) {
              setMetronomeTriggerEvents([]);
              setMetronomeTriggerEventsError("");
              setIsLoadingMetronomeTriggerEvents(false);
              return () => {
                cancelled = true;
              };
            }
            setIsLoadingMetronomeTriggerEvents(true);
            setMetronomeTriggerEventsError("");
            void fetchMetronomeTriggerEventsApi(activeWorkflowId, 20)
              .then((items) => {
                if (cancelled) return;
                setMetronomeTriggerEvents(items);
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load trigger diagnostics", error);
                  setMetronomeTriggerEvents([]);
                  setMetronomeTriggerEventsError(error instanceof Error ? error.message : "Failed to load trigger diagnostics.");
                }
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomeTriggerEvents(false);
              });
            return () => {
              cancelled = true;
            };
          }, [activeWorkflowId, isActiveWorkflowBuiltIn, isMetronomeApiAvailable]);

          const flushMetronomeLocalGraphSync = useCallback(() => {
            if (metronomeLocalGraphSyncTimerRef.current) {
              window.clearTimeout(metronomeLocalGraphSyncTimerRef.current);
              metronomeLocalGraphSyncTimerRef.current = null;
            }
            const pendingSync = metronomeLocalGraphSyncPendingRef.current;
            metronomeLocalGraphSyncPendingRef.current = null;
            if (!pendingSync?.workflowId || pendingSync.readOnly) return;
            const currentWorkflow = activeMetronomeWorkflowRef.current;
            const workflowForSync = currentWorkflow?.id === pendingSync.workflowId
              ? currentWorkflow
              : pendingSync.workflow;
            if (!workflowForSync || isMetronomeWorkflowBuiltIn(workflowForSync)) return;
            const nextWorkflow = createMetronomeWorkflowWithSelectedVersionSnapshot({
              ...workflowForSync,
              id: pendingSync.workflowId,
              updatedAt: new Date().toISOString(),
            }, pendingSync.nodes, pendingSync.edges);
            if (typeof replaceMetronomeWorkflowInEditableStateRef.current === "function") {
              replaceMetronomeWorkflowInEditableStateRef.current(pendingSync.workflowId, nextWorkflow);
            }
          }, []);

          useEffect(() => {
            const observedGraph = metronomeLocalGraphObservedRef.current || {};
            const hasSameObservedWorkflow = observedGraph.workflowId === activeWorkflowId;
            const hasPersistedGraphChanges = !hasSameObservedWorkflow
              || haveMetronomePersistedNodesChanged(observedGraph.nodes, nodes)
              || haveMetronomePersistedEdgesChanged(observedGraph.edges, edges);
            metronomeLocalGraphObservedRef.current = {
              workflowId: activeWorkflowId,
              nodes,
              edges,
            };
            const pendingSync = metronomeLocalGraphSyncPendingRef.current;
            if (pendingSync?.workflowId && pendingSync.workflowId !== activeWorkflowId) {
              flushMetronomeLocalGraphSync();
            }
            if (
              !activeWorkflowId
              || !activeWorkflow
              || isActiveWorkflowBuiltIn
              || !isMetronomeFlowReady
              || !hasPersistedGraphChanges
            ) {
              return () => {};
            }
            metronomeLocalGraphSyncPendingRef.current = {
              workflowId: activeWorkflowId,
              workflow: activeWorkflow,
              nodes,
              edges,
              readOnly: isActiveWorkflowBuiltIn,
            };
            if (metronomeLocalGraphSyncTimerRef.current) {
              window.clearTimeout(metronomeLocalGraphSyncTimerRef.current);
            }
            const graphSyncTimer = window.setTimeout(() => {
              if (metronomeLocalGraphSyncTimerRef.current !== graphSyncTimer) return;
              flushMetronomeLocalGraphSync();
            }, 120);
            metronomeLocalGraphSyncTimerRef.current = graphSyncTimer;
          }, [nodes, edges, activeWorkflowId, isActiveWorkflowBuiltIn, isMetronomeFlowReady, flushMetronomeLocalGraphSync]);

          useEffect(() => {
            const autosaveRevision = metronomeAutosaveRevisionRef.current + 1;
            metronomeAutosaveRevisionRef.current = autosaveRevision;
            if (metronomeAutosaveTimerRef.current) {
              window.clearTimeout(metronomeAutosaveTimerRef.current);
              metronomeAutosaveTimerRef.current = null;
            }
            if (!activeWorkflowId || !activeWorkflow || isActiveWorkflowBuiltIn || !isMetronomeApiAvailable || isLoadingMetronomes) {
              return () => {};
            }
            metronomeAutosaveTimerRef.current = window.setTimeout(() => {
              metronomeAutosaveTimerRef.current = null;
              if (metronomeAutosaveRevisionRef.current !== autosaveRevision) return;
              const workflowForSave = createMetronomeWorkflowWithSelectedVersionSnapshot(activeWorkflow, nodes, edges);
              const autosaveKey = createMetronomePersistedWorkflowKey(workflowForSave, workflowForSave.nodes, workflowForSave.edges);
              if (!autosaveKey || autosaveKey === metronomeAutosaveLastSavedKeyRef.current) return;
              metronomeAutosaveLatestKeyRef.current = autosaveKey;
              const requestKey = autosaveKey;
              void saveEditableMetronomeWorkflowApi({
                ...workflowForSave,
                updatedAt: new Date().toISOString(),
              })
                .then(async (savedWorkflow) => {
                  if (
                    metronomeAutosaveRevisionRef.current !== autosaveRevision
                    || metronomeAutosaveLatestKeyRef.current !== requestKey
                  ) {
                    return;
                  }
                  metronomeAutosaveLastSavedKeyRef.current = requestKey;
                  let workflowForState = savedWorkflow;
                  const selectedVersionId = readMetronomeSelectedDeploymentId(workflowForSave);
                  const selectedVersion = selectedVersionId
                    ? readMetronomeWorkflowDeployments(workflowForSave).find((deployment) => deployment.id === selectedVersionId)
                    : null;
                  const canAutosaveVersion = Boolean(
                    selectedVersionId
                    && selectedVersion
                    && selectedVersion.status !== "active"
                    && !selectedVersion.publishedAt
                  );
                  if (canAutosaveVersion) {
                    const workflowIdForVersion = savedWorkflow.id || workflowForSave.id;
                    try {
                      await updateMetronomeVersionApi(
                        workflowIdForVersion,
                        selectedVersionId,
                        workflowForSave,
                        workflowForSave.nodes,
                        workflowForSave.edges,
                        {
                          label: selectedVersion.label,
                          description: selectedVersion.description,
                        }
                      );
                      const versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
                      workflowForState = createMetronomeWorkflowWithVersionList(savedWorkflow, versions, selectedVersionId);
                    } catch (versionAutosaveError) {
                      const message = String(versionAutosaveError?.message || "").toLowerCase();
                      const isImmutableVersion = versionAutosaveError?.status === 400 && message.includes("immutable");
                      if (!isImmutableVersion) {
                        console.warn("[Metronome] Failed to autosave selected version", versionAutosaveError);
                      }
                    }
                  }
                  if (
                    metronomeAutosaveRevisionRef.current !== autosaveRevision
                    || metronomeAutosaveLatestKeyRef.current !== requestKey
                  ) {
                    return;
                  }
                  if (typeof replaceMetronomeWorkflowInEditableStateRef.current === "function") {
                    replaceMetronomeWorkflowInEditableStateRef.current(workflowForSave.id, workflowForState);
                  }
                  if (workflowForState.id && workflowForState.id !== activeWorkflowId) {
                    setActiveWorkflowId(workflowForState.id);
                  }
                })
                .catch((error) => {
                  if (metronomeAutosaveRevisionRef.current !== autosaveRevision) return;
                  console.warn("[Metronome] Autosave failed", error);
                  setIsMetronomeApiAvailable(false);
                });
            }, 650);
            return () => {
              if (metronomeAutosaveTimerRef.current) {
                window.clearTimeout(metronomeAutosaveTimerRef.current);
                metronomeAutosaveTimerRef.current = null;
              }
            };
          }, [activeWorkflow, activeWorkflowId, isActiveWorkflowBuiltIn, isMetronomeApiAvailable, isLoadingMetronomes]);

	          const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
`;
