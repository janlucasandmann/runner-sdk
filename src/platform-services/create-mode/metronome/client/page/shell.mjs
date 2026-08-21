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
          overviewScope = "all",
          openWorkflowRequest = null,
          onOpenWorkflowRequestHandled,
          backendUrl = "/api/real",
          apiKey = "",
          requestHeaders = {},
          threadComposerProps = {},
          onThreadOpen,
          onNavigationGuardChange,
          onNavigationRequest,
          currentUserId = "",
          currentUserName = "User",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
        } = {}) {
          const [workflows, setWorkflows] = useState(() => readMetronomeWorkflowsFromStorage());
          const [sharedMetronomeWorkflows, setSharedMetronomeWorkflows] = useState([]);
          const [isMetronomeApiAvailable, setIsMetronomeApiAvailable] = useState(true);
          const [isLoadingMetronomes, setIsLoadingMetronomes] = useState(true);
          const [hasMoreMetronomeWorkflows, setHasMoreMetronomeWorkflows] = useState(false);
          const [isLoadingMoreMetronomes, setIsLoadingMoreMetronomes] = useState(false);
          const metronomeWorkflowPaginationRef = useRef({
            requestKey: "",
            offset: 0,
            hasMore: false,
            loading: false,
          });
          const [activeWorkflowId, setActiveWorkflowId] = useState("");
          const [nodes, setNodes, onNodesChange] = useNodesState([]);
          const [edges, setEdges, onEdgesChange] = useEdgesState([]);
          const [metronomeFlowMountVersion, setMetronomeFlowMountVersion] = useState(0);
          const [isMetronomeFlowReady, setIsMetronomeFlowReady] = useState(false);
          const [selectedNodeId, setSelectedNodeId] = useState("");
          const [activeMetronomeRichTextField, setActiveMetronomeRichTextField] = useState("");
          const [metronomeDynamicContentPicker, setMetronomeDynamicContentPicker] = useState({
            fieldKey: "",
            query: "",
          });
          const [metronomePromptPicker, setMetronomePromptPicker] = useState({
            fieldKey: "",
            query: "",
            selectingPromptId: "",
          });
          const [metronomePromptPickerState, setMetronomePromptPickerState] = useState({
            status: "idle",
            prompts: [],
            error: "",
          });
          const metronomePromptSelectionTokenRef = useRef(0);
          const closeMetronomePromptPicker = useCallback(() => {
            metronomePromptSelectionTokenRef.current += 1;
            setMetronomePromptPicker({ fieldKey: "", query: "", selectingPromptId: "" });
          }, []);
          useEffect(() => () => {
            metronomePromptSelectionTokenRef.current += 1;
          }, []);
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
              return;
            }
            setIsMetronomeAttachmentPopoverClosing(true);
            metronomeAttachmentPopoverCloseTimerRef.current = window.setTimeout(() => {
              metronomeAttachmentPopoverCloseTimerRef.current = null;
              setIsMetronomeAttachmentPopoverClosing(false);
              setIsMetronomeAttachmentPopoverOpen(false);
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
          const [metronomeOwnerSelectorOpen, setMetronomeOwnerSelectorOpen] = useState(false);
          const [metronomeOwnerCandidateState, setMetronomeOwnerCandidateState] = useState({
            workflowId: "",
            status: "idle",
            candidates: [],
            message: "",
          });
          const [metronomeOwnerTransferState, setMetronomeOwnerTransferState] = useState({
            workflowId: "",
            status: "idle",
            message: "",
          });
          const [isMetronomeSettingsAccessDetailOpen, setIsMetronomeSettingsAccessDetailOpen] = useState(false);
          const [workflowVersionModal, setWorkflowVersionModal] = useState(null);
          const [workflowVersionModalVisible, setWorkflowVersionModalVisible] = useState(false);
          const [workflowVersionModalClosing, setWorkflowVersionModalClosing] = useState(false);
          const [workflowVersionNameDraft, setWorkflowVersionNameDraft] = useState("");
          const [workflowVersionDescriptionDraft, setWorkflowVersionDescriptionDraft] = useState("");
          const [isWorkflowVersionDescriptionEditing, setIsWorkflowVersionDescriptionEditing] = useState(false);
          const workflowVersionModalFrameRef = useRef(null);
          const workflowVersionModalCloseTimerRef = useRef(null);
          const workflowVersionDescriptionTextareaRef = useRef(null);
          const [workflowVersionSaveDialog, setWorkflowVersionSaveDialog] = useState(null);
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
          const metronomeVisitBaselineKeyRef = useRef("");
          const metronomeLoadedGraphSignatureRef = useRef("");
          const [metronomeEditorMode, setMetronomeEditorMode] = useState("edit");
          const [metronomeCanvasInteractionMode, setMetronomeCanvasInteractionMode] = useState("pan");
          const [graphUndoStack, setGraphUndoStack] = useState([]);
          const [graphRedoStack, setGraphRedoStack] = useState([]);
          const [metronomeServerResources, setMetronomeServerResources] = useState([]);
          const [metronomeSecretVaultSecretsByVaultId, setMetronomeSecretVaultSecretsByVaultId] = useState({});
          const [metronomeSecretVaultSecretsLoadingId, setMetronomeSecretVaultSecretsLoadingId] = useState("");
          const [metronomeCodeRunState, setMetronomeCodeRunState] = useState({ status: "idle", message: "" });
          const [metronomeCodeFilesDraft, setMetronomeCodeFilesDraft] = useState([]);
          const [metronomeCodeUndoStack, setMetronomeCodeUndoStack] = useState([]);
          const [metronomeCodeRedoStack, setMetronomeCodeRedoStack] = useState([]);
          const [metronomeWorkflowNameDraft, setMetronomeWorkflowNameDraft] = useState("");
          const [metronomeInferenceBudgetPolicyDraft, setMetronomeInferenceBudgetPolicyDraft] = useState(null);
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
          const [metronomeManualRunDialog, setMetronomeManualRunDialog] = useState(null);
          const [metronomeExecutionDialog, setMetronomeExecutionDialog] = useState(null);
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
          const currentMetronomeUserDisplayName = useMemo(() => {
            const candidate = String(currentUserName || "").trim();
            return candidate && candidate.toLowerCase() !== "me"
              ? candidate
              : String(currentUserEmail || "").trim() || "User";
          }, [currentUserName, currentUserEmail]);
          const currentMetronomeUserCreator = useMemo(() => normalizeMetronomeWorkflowCreator({
            creator: {
              type: "user",
              id: currentUserId || currentUserEmail || currentMetronomeUserDisplayName,
              userId: currentUserId || currentUserEmail || currentMetronomeUserDisplayName,
              name: currentMetronomeUserDisplayName,
              email: currentUserEmail || "",
              avatarUrl: currentUserAvatarUrl || "",
              photoUrl: currentUserAvatarUrl || "",
            },
          }), [currentUserId, currentUserEmail, currentUserAvatarUrl, currentMetronomeUserDisplayName]);
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
          const resolveMetronomeWorkflowCreatorPresentation = useCallback((workflow, options = {}) => {
            const isBuiltInWorkflow = options?.isBuiltIn === true || isMetronomeWorkflowBuiltIn(workflow);
            if (isBuiltInWorkflow) {
              return {
                value: "computer-agents",
                name: "Computer Agents",
                email: "",
                avatarUrl: METRONOME_COMPUTER_AGENTS_CREATOR_PROFILE_URL,
                fallback: "CA",
              };
            }
            const workflowCreator = normalizeMetronomeWorkflowCreator(workflow) || {};
            const creatorAgentId = String(
              workflowCreator.agentId
              || (workflowCreator.type === "agent" ? workflowCreator.id : "")
              || ""
            ).trim();
            const creatorName = String(workflowCreator.name || "").trim();
            const creatorId = String(workflowCreator.id || "").trim();
            const normalizedCreatorName = creatorName.toLowerCase();
            const normalizedCreatorId = creatorId.toLowerCase();
            const creatorAgent = metronomeAgentOptions.find((agent) => {
              const agentId = String(agent?.id || "").trim();
              const agentName = String(agent?.name || "").trim();
              const agentEmail = String(agent?.email || agent?.profile?.email || "").trim();
              return Boolean(
                creatorAgentId && agentId === creatorAgentId
                || normalizedCreatorId && (
                  agentId.toLowerCase() === normalizedCreatorId
                  || agentName.toLowerCase() === normalizedCreatorId
                  || agentEmail.toLowerCase() === normalizedCreatorId
                )
                || normalizedCreatorName && agentName.toLowerCase() === normalizedCreatorName
              );
            }) || null;
            const isAgentCreator = Boolean(
              workflowCreator.type === "agent"
              || creatorAgentId
              || creatorAgent && (creatorId || creatorName)
            );
            if (isAgentCreator) {
              const name = String(creatorAgent?.name || creatorName || creatorId || "Agent").trim() || "Agent";
              const avatarUrl = workflowCreator.avatarUrl || getMetronomeProfileImageUrl(creatorAgent) || "";
              return {
                value: String(creatorAgentId || creatorAgent?.id || creatorId || name).trim(),
                name,
                email: String(workflowCreator.email || creatorAgent?.email || creatorAgent?.profile?.email || "").trim(),
                avatarUrl: canRenderMetronomeAvatarImage(avatarUrl)
                  ? normalizeMetronomeAvatarUrl(avatarUrl)
                  : "",
                fallback: getMetronomeOwnerInitials(name, "AG"),
              };
            }
            const creatorIdentityKeys = createMetronomeIdentityKeySet([
              workflowCreator.id,
              workflowCreator.userId,
              workflowCreator.email,
            ]);
            const isCurrentUserCreator = Array.from(creatorIdentityKeys).some((key) => (
              currentMetronomeUserIdentityKeys.has(key)
            ));
            const normalizedUserName = normalizedCreatorName === "me" ? "" : creatorName;
            const name = isCurrentUserCreator
              ? currentMetronomeUserDisplayName
              : normalizedUserName || workflowCreator.email || creatorId || "User";
            const avatarUrl = isCurrentUserCreator
              ? currentUserAvatarUrl
              : workflowCreator.avatarUrl || workflowCreator.photoUrl || "";
            return {
              value: String(
                isCurrentUserCreator
                  ? currentUserId || currentUserEmail || workflowCreator.userId || workflowCreator.id
                  : workflowCreator.userId || workflowCreator.id || workflowCreator.email || name
              ).trim(),
              name,
              email: String(isCurrentUserCreator ? currentUserEmail : workflowCreator.email || "").trim(),
              avatarUrl: canRenderMetronomeAvatarImage(avatarUrl)
                ? normalizeMetronomeAvatarUrl(avatarUrl)
                : "",
              fallback: getMetronomeOwnerInitials(name, "US"),
            };
          }, [currentMetronomeUserDisplayName, currentMetronomeUserIdentityKeys, currentUserAvatarUrl, currentUserEmail, currentUserId, metronomeAgentOptions]);
          const resolveMetronomeWorkflowOwnerPresentation = useCallback((workflow, options = {}) => {
            const isBuiltInWorkflow = options?.isBuiltIn === true || isMetronomeWorkflowBuiltIn(workflow);
            if (isBuiltInWorkflow) {
              return resolveMetronomeWorkflowCreatorPresentation(workflow, { isBuiltIn: true });
            }
            const metadata = readMetronomeWorkflowMetadata(workflow);
            const rawOwner = workflow?.owner && typeof workflow.owner === "object" && !Array.isArray(workflow.owner)
              ? workflow.owner
              : metadata?.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
                ? metadata.owner
                : {};
            const ownerUserId = String(
              workflow?.ownerUserId
              || workflow?.owner_user_id
              || workflow?.userId
              || workflow?.user_id
              || metadata?.ownerUserId
              || metadata?.owner_user_id
              || rawOwner.userId
              || rawOwner.user_id
              || rawOwner.id
              || ""
            ).trim();
            const ownerEmail = String(
              workflow?.ownerEmail
              || workflow?.owner_email
              || metadata?.ownerEmail
              || metadata?.owner_email
              || rawOwner.email
              || ""
            ).trim().toLowerCase();
            const ownerName = String(
              workflow?.ownerName
              || workflow?.owner_name
              || metadata?.ownerName
              || metadata?.owner_name
              || rawOwner.name
              || rawOwner.displayName
              || rawOwner.display_name
              || ownerEmail
              || "Workflow owner"
            ).trim();
            const rawOwnerAvatarUrl = String(
              workflow?.ownerAvatarUrl
              || workflow?.owner_avatar_url
              || metadata?.ownerAvatarUrl
              || metadata?.owner_avatar_url
              || rawOwner.avatarUrl
              || rawOwner.avatar_url
              || rawOwner.photoURL
              || rawOwner.photoUrl
              || ""
            ).trim();
            const ownerIdentityKeys = getMetronomeWorkflowOwnerIdentityKeys(workflow);
            const isCurrentUserOwner = Array.from(ownerIdentityKeys).some((key) => (
              currentMetronomeUserIdentityKeys.has(key)
            ));
            if (isCurrentUserOwner) {
              const avatarUrl = canRenderMetronomeAvatarImage(currentUserAvatarUrl)
                ? normalizeMetronomeAvatarUrl(currentUserAvatarUrl)
                : "";
              return {
                value: ownerUserId || currentUserId || currentUserEmail || currentMetronomeUserDisplayName,
                name: currentMetronomeUserDisplayName,
                email: currentUserEmail || ownerEmail,
                avatarUrl,
                fallback: getMetronomeOwnerInitials(currentMetronomeUserDisplayName, "US"),
              };
            }
            const avatarUrl = canRenderMetronomeAvatarImage(rawOwnerAvatarUrl)
              ? normalizeMetronomeAvatarUrl(rawOwnerAvatarUrl)
              : "";
            return {
              value: ownerUserId || ownerEmail || ownerName,
              name: ownerName,
              email: ownerEmail,
              avatarUrl,
              fallback: getMetronomeOwnerInitials(ownerName, "US"),
            };
          }, [currentMetronomeUserDisplayName, currentMetronomeUserIdentityKeys, currentUserAvatarUrl, currentUserEmail, currentUserId, resolveMetronomeWorkflowCreatorPresentation]);
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
          const activeWorkflowPersistedGraph = useMemo(() => (
            activeWorkflow
              ? createMetronomeVersionPersistedGraphSnapshot(
                  activeWorkflow.nodes || [],
                  activeWorkflow.edges || []
                )
              : { nodes: [], edges: [] }
          ), [activeWorkflow?.nodes, activeWorkflow?.edges]);
          const activeWorkflowGraphSignature = useMemo(() => (
            activeWorkflow
              ? createMetronomeVersionGraphSignature(
                  activeWorkflowPersistedGraph.nodes,
                  activeWorkflowPersistedGraph.edges
                )
              : ""
          ), [activeWorkflow, activeWorkflowPersistedGraph]);
          const activeMetronomeEditorWorkflow = useMemo(() => (
            activeWorkflow
              ? {
                  ...activeWorkflow,
                  name: String(metronomeWorkflowNameDraft || activeWorkflow.name || "Untitled Metronome").trim()
                    || "Untitled Metronome",
                  inferenceBudgetPolicy: metronomeInferenceBudgetPolicyDraft,
                }
              : null
          ), [activeWorkflow, metronomeInferenceBudgetPolicyDraft, metronomeWorkflowNameDraft]);
          const activeWorkflowOwnerIdentityKeys = useMemo(() => (
            getMetronomeWorkflowOwnerIdentityKeys(activeWorkflow)
          ), [activeWorkflow]);
          const hasActiveWorkflowOwnerIdentity = activeWorkflowOwnerIdentityKeys.size > 0;
          const isActiveWorkflowOwnedByCurrentUser = Boolean(
            activeWorkflow
            && (
              isMetronomeWorkflowOwnedByCurrentUser(activeWorkflow)
              || !hasActiveWorkflowOwnerIdentity && (
                activeStoredWorkflow
                || ownedMetronomeWorkflowIdSet.has(String(activeWorkflow.id || "").trim())
              )
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
            (activeWorkflow && isMetronomeWorkflowBuiltIn(activeWorkflow))
            || (isActiveWorkflowTeamShared && !isActiveWorkflowTeamSharedEditable)
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
          const activeMetronomeOwnerIdentity = useMemo(() => (
            activeWorkflow
              ? resolveMetronomeWorkflowOwnerPresentation(activeWorkflow, {
                  isBuiltIn: isMetronomeWorkflowBuiltIn(activeWorkflow),
                })
              : null
          ), [activeWorkflow, resolveMetronomeWorkflowOwnerPresentation]);
          const activeMetronomeOwnerOptions = useMemo(() => {
            const candidates = metronomeOwnerCandidateState.workflowId === String(activeWorkflow?.id || "").trim()
              ? metronomeOwnerCandidateState.candidates
              : [];
            const sharedTeamCandidates = (Array.isArray(metronomeShareTeams) ? metronomeShareTeams : [])
              .filter((team) => String(team?.metronomeWorkflowShareId || "").trim())
              .flatMap((team) => Array.isArray(team?.metronomeOwnerCandidates)
                ? team.metronomeOwnerCandidates
                : []);
            const options = [
              activeMetronomeOwnerIdentity,
              ...sharedTeamCandidates,
              ...(Array.isArray(candidates) ? candidates.map((candidate) => ({
                value: String(candidate?.userId || candidate?.value || "").trim(),
                name: String(candidate?.name || candidate?.email || "Organization member").trim(),
                email: String(candidate?.email || "").trim(),
                avatarUrl: String(candidate?.avatarUrl || "").trim(),
              })) : []),
            ].filter((option) => option?.value);
            return Array.from(new Map(options.map((option) => [String(option.value), option])).values());
          }, [activeMetronomeOwnerIdentity, activeWorkflow?.id, metronomeOwnerCandidateState, metronomeShareTeams]);
          const canTransferActiveMetronomeOwnership = Boolean(
            activeWorkflow?.id
            && !isActiveWorkflowBuiltIn
            && (
              activeWorkflow?.canTransferOwnership === true
              || isActiveWorkflowOwnedByCurrentUser
            )
          );
          const loadActiveMetronomeOwnerCandidates = useCallback(async () => {
            const workflowId = String(activeWorkflow?.id || "").trim();
            if (!workflowId || !canTransferActiveMetronomeOwnership) return [];
            setMetronomeOwnerCandidateState((current) => ({
              workflowId,
              status: "loading",
              candidates: current.workflowId === workflowId && Array.isArray(current.candidates)
                ? current.candidates
                : [],
              message: "",
            }));
            try {
              const candidates = await fetchMetronomeOwnerCandidatesApi(workflowId, {
                backendUrl,
                apiKey,
                requestHeaders,
              });
              setMetronomeOwnerCandidateState({ workflowId, status: "success", candidates, message: "" });
              return candidates;
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to load workflow owners.";
              setMetronomeOwnerCandidateState({ workflowId, status: "error", candidates: [], message });
              throw error;
            }
          }, [activeWorkflow?.id, apiKey, backendUrl, canTransferActiveMetronomeOwnership, metronomeRequestHeadersKey]);
          const handleActiveMetronomeOwnerSelectorOpenChange = useCallback((nextOpen) => {
            const open = Boolean(nextOpen);
            setMetronomeOwnerSelectorOpen(open);
            if (open) {
              // Ownership is authorization-sensitive. A team may have been shared
              // moments before the selector opens, so never reuse a stale candidate
              // directory here.
              void loadActiveMetronomeOwnerCandidates().catch(() => {});
            }
          }, [loadActiveMetronomeOwnerCandidates]);
          const transferActiveMetronomeOwnership = useCallback(async (ownerUserId) => {
            const workflowId = String(activeWorkflow?.id || "").trim();
            const normalizedOwnerUserId = String(ownerUserId || "").trim();
            if (!workflowId || !normalizedOwnerUserId || !canTransferActiveMetronomeOwnership) return;
            if (normalizedOwnerUserId === String(activeMetronomeOwnerIdentity?.value || "").trim()) return;
            setMetronomeOwnerTransferState({ workflowId, status: "loading", message: "" });
            try {
              const updatedWorkflow = await transferMetronomeWorkflowOwnershipApi(workflowId, normalizedOwnerUserId, {
                backendUrl,
                apiKey,
                requestHeaders,
              });
              replaceMetronomeWorkflowInEditableState(workflowId, updatedWorkflow, {
                shared: isActiveWorkflowTeamShared,
              });
              setMetronomeOwnerSelectorOpen(false);
              setMetronomeOwnerTransferState({ workflowId, status: "success", message: "" });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to transfer workflow ownership.";
              setMetronomeOwnerTransferState({ workflowId, status: "error", message });
              throw error;
            }
          }, [activeWorkflow?.id, activeMetronomeOwnerIdentity?.value, apiKey, backendUrl, canTransferActiveMetronomeOwnership, isActiveWorkflowTeamShared, metronomeRequestHeadersKey, replaceMetronomeWorkflowInEditableState]);
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
            const loadedWorkflow = await fetchMetronomeWorkflowWithGraphFromApi(workflowId);
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
            setMetronomeOwnerSelectorOpen(false);
            setMetronomeOwnerCandidateState({ workflowId: "", status: "idle", candidates: [], message: "" });
            setMetronomeOwnerTransferState({ workflowId: "", status: "idle", message: "" });
          }, [activeWorkflowId]);
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
              const settingsWorkflowId = metronomeEditorMode === "settings"
                ? String(activeWorkflowId || "").trim()
                : "";
              const targetWorkflowId = String(metronomeShareWorkflowId || settingsWorkflowId || "").trim();
              const teamsWithShares = targetWorkflowId
                ? await Promise.all(teams.map(async (team) => {
                    try {
                      const [sharesResponse, membersResponse] = await Promise.all([
                        fetch(normalizedBackendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares", {
                          method: "GET",
                          headers,
                          credentials: "include",
                          cache: "no-store",
                        }),
                        fetch(
                          normalizedBackendUrl + "/teams/" + encodeURIComponent(team.id)
                            + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                          {
                            method: "GET",
                            headers,
                            credentials: "include",
                            cache: "no-store",
                          }
                        ),
                      ]);
                      const sharesData = await sharesResponse.json().catch(() => ({}));
                      const membersData = await membersResponse.json().catch(() => ({}));
                      const shares = sharesResponse.ok && Array.isArray(sharesData?.data)
                        ? sharesData.data
                        : sharesResponse.ok && Array.isArray(sharesData?.shares)
                          ? sharesData.shares
                          : sharesResponse.ok && Array.isArray(sharesData?.resourceShares)
                            ? sharesData.resourceShares
                            : [];
                      const members = membersResponse.ok && Array.isArray(membersData?.data)
                        ? membersData.data
                        : membersResponse.ok && Array.isArray(membersData?.members)
                          ? membersData.members
                          : [];
                      const memberProfilesPayload = membersResponse.ok
                        ? await fetchMetronomeTeamMemberProfilePayload(
                            normalizedBackendUrl,
                            team.id,
                            members,
                            headers
                          )
                        : null;
                      const ownerCandidates = buildMetronomeTeamOwnerCandidates(
                        members,
                        membersData,
                        memberProfilesPayload
                      );
                      const matchingShare = shares.find((share) => {
                        if (!isMetronomeTeamResourceWorkflowShare(share)) return false;
                        const sharedWorkflow = buildMetronomeWorkflowFromTeamResourceShare(share, team, null);
                        return String(sharedWorkflow?.id || "").trim() === targetWorkflowId;
                      }) || null;
                      return {
                        ...team,
                        metronomeOwnerCandidates: ownerCandidates,
                        metronomeWorkflowShareId: matchingShare
                          ? String(matchingShare?.id || matchingShare?.shareId || matchingShare?.share_id || "").trim()
                          : "",
                      };
                    } catch (shareError) {
                      console.warn("[Metronome] Failed to hydrate team workflow access", shareError);
                      return team;
                    }
                  }))
                : teams;
              setMetronomeShareTeams(teamsWithShares);
              setMetronomeShareTeamId((current) => {
                if (current && teamsWithShares.some((team) => team.id === current)) return current;
                return teamsWithShares[0]?.id || "";
              });
              setMetronomeShareState({
                status: "idle",
                message: teamsWithShares.length ? "" : "No teams available yet.",
              });
            } catch (error) {
              setMetronomeShareTeams([]);
              setMetronomeShareTeamId("");
              setMetronomeShareState({ status: "error", message: error?.message || "Failed to load teams." });
            }
          }, [backendUrl, apiKey, requestHeaders, metronomeEditorMode, activeWorkflowId, metronomeShareWorkflowId]);
          useEffect(() => {
            if (metronomeEditorMode !== "settings") {
              setIsMetronomeSettingsAccessDetailOpen(false);
            }
          }, [metronomeEditorMode]);
          useEffect(() => {
            setIsMetronomeSettingsAccessDetailOpen(false);
          }, [activeWorkflowId]);
          useEffect(() => {
            const isShareModalTarget = Boolean(
              metronomeShareWorkflowId
              && metronomeShareWorkflow
              && !isMetronomeWorkflowBuiltIn(metronomeShareWorkflow)
            );
            const isSettingsTarget = Boolean(
              metronomeEditorMode === "settings"
              && activeWorkflowId
              && activeWorkflow
              && !isMetronomeWorkflowBuiltIn(activeWorkflow)
            );
            if (!isShareModalTarget && !isSettingsTarget) return;
            void loadMetronomeShareTeams();
          }, [metronomeShareWorkflowId, metronomeShareWorkflow, metronomeEditorMode, activeWorkflowId, activeWorkflow, loadMetronomeShareTeams]);
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
              ? "settings"
              : openWorkflowRequest?.mode === "settings"
              ? "settings"
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
              setMetronomeEditorMode(requestedMode === "run-detail" ? "settings" : (requestedMode || "edit"));
              setMetronomeRunInlineDetailId(
                requestedMode === "run-detail" || requestedMode === "settings" && requestedRunId
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
            setMetronomeDynamicContentPicker({ fieldKey: "", query: "" });
            closeMetronomePromptPicker();
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
          }, [selectedNodeId, closeMetronomePromptPicker, closeMetronomeSchedulePopover, closeMetronomeAttachmentPopover, closeMetronomeInspectorSelectPopover]);

          useEffect(() => {
            if (!metronomeDynamicContentPicker.fieldKey || typeof document === "undefined") return () => {};
            const handleDynamicContentPointerDown = (event) => {
              const target = event.target;
              if (target?.closest?.(".playground-metronome-dynamic-content-popup-shell")) return;
              if (target?.closest?.(".playground-metronome-dynamic-content-picker")) return;
              setMetronomeDynamicContentPicker({ fieldKey: "", query: "" });
            };
            const handleDynamicContentKeyDown = (event) => {
              if (event.key === "Escape") {
                setMetronomeDynamicContentPicker({ fieldKey: "", query: "" });
              }
            };
            document.addEventListener("pointerdown", handleDynamicContentPointerDown, true);
            document.addEventListener("keydown", handleDynamicContentKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handleDynamicContentPointerDown, true);
              document.removeEventListener("keydown", handleDynamicContentKeyDown);
            };
          }, [metronomeDynamicContentPicker.fieldKey]);

          useEffect(() => {
            const fieldKey = String(metronomePromptPicker.fieldKey || "").trim();
            if (!fieldKey) return () => {};
            const controller = new AbortController();
            setMetronomePromptPickerState({ status: "loading", prompts: [], error: "" });
            void fetchMetronomePromptsApi({
              backendUrl,
              apiKey,
              requestHeaders,
              signal: controller.signal,
            })
              .then((prompts) => {
                if (controller.signal.aborted) return;
                setMetronomePromptPickerState({ status: "ready", prompts, error: "" });
              })
              .catch((error) => {
                if (controller.signal.aborted) return;
                setMetronomePromptPickerState({
                  status: "error",
                  prompts: [],
                  error: error instanceof Error ? error.message : "Failed to load prompts.",
                });
              });
            return () => controller.abort();
          }, [metronomePromptPicker.fieldKey, backendUrl, apiKey, metronomeRequestHeadersKey]);

          useEffect(() => {
            if (!metronomePromptPicker.fieldKey || typeof document === "undefined") return () => {};
            const handlePromptPickerPointerDown = (event) => {
              const target = event.target;
              if (target?.closest?.(".playground-metronome-prompt-picker-popup-shell")) return;
              if (target?.closest?.(".playground-metronome-prompt-picker")) return;
              closeMetronomePromptPicker();
            };
            const handlePromptPickerKeyDown = (event) => {
              if (event.key === "Escape") {
                closeMetronomePromptPicker();
              }
            };
            document.addEventListener("pointerdown", handlePromptPickerPointerDown, true);
            document.addEventListener("keydown", handlePromptPickerKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handlePromptPickerPointerDown, true);
              document.removeEventListener("keydown", handlePromptPickerKeyDown);
            };
          }, [metronomePromptPicker.fieldKey, closeMetronomePromptPicker]);

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
            const requestKey = [
              String(backendUrl || ""),
              String(apiKey || ""),
              metronomeRequestHeadersKey,
              normalizedMetronomeProjectFilterId,
            ].join("::");
            metronomeWorkflowPaginationRef.current = {
              requestKey,
              offset: 0,
              hasMore: false,
              loading: true,
            };
            setIsLoadingMetronomes(true);
            setIsLoadingMoreMetronomes(false);
            setHasMoreMetronomeWorkflows(false);
            void fetchMetronomeWorkflowPageFromApi(normalizedMetronomeProjectFilterId, {
              backendUrl,
              apiKey,
              requestHeaders,
              limit: 20,
              offset: 0,
            })
              .then((page) => {
                if (cancelled || metronomeWorkflowPaginationRef.current.requestKey !== requestKey) return;
                const items = Array.isArray(page?.items) ? page.items : [];
                const storedItems = filterMetronomeWorkflowsByProject(readMetronomeWorkflowsFromStorage(), normalizedMetronomeProjectFilterId);
                setWorkflows((current) => mergeMetronomeWorkflowListPreservingGraphs(items, current, storedItems));
                metronomeWorkflowPaginationRef.current = {
                  requestKey,
                  offset: Number(page?.nextOffset) || items.length,
                  hasMore: Boolean(page?.hasMore),
                  loading: false,
                };
                setHasMoreMetronomeWorkflows(Boolean(page?.hasMore));
                setIsMetronomeApiAvailable(true);
              })
              .catch((error) => {
                if (cancelled || metronomeWorkflowPaginationRef.current.requestKey !== requestKey) return;
                console.warn("[Metronome] Falling back to local drafts", error);
                metronomeWorkflowPaginationRef.current = {
                  requestKey,
                  offset: 0,
                  hasMore: false,
                  loading: false,
                };
                setHasMoreMetronomeWorkflows(false);
                setIsMetronomeApiAvailable(false);
                setWorkflows(filterMetronomeWorkflowsByProject(readMetronomeWorkflowsFromStorage(), normalizedMetronomeProjectFilterId));
              })
              .finally(() => {
                if (!cancelled && metronomeWorkflowPaginationRef.current.requestKey === requestKey) {
                  metronomeWorkflowPaginationRef.current.loading = false;
                  setIsLoadingMetronomes(false);
                }
              });
            return () => {
              cancelled = true;
            };
          }, [apiKey, backendUrl, metronomeRequestHeadersKey, normalizedMetronomeProjectFilterId]);

          const loadMoreMetronomeWorkflows = useCallback(async () => {
            const requestKey = [
              String(backendUrl || ""),
              String(apiKey || ""),
              metronomeRequestHeadersKey,
              normalizedMetronomeProjectFilterId,
            ].join("::");
            const pagination = metronomeWorkflowPaginationRef.current;
            if (
              !isMetronomeApiAvailable
              || pagination.requestKey !== requestKey
              || pagination.loading
              || !pagination.hasMore
            ) {
              return;
            }

            const offset = pagination.offset;
            metronomeWorkflowPaginationRef.current = {
              ...pagination,
              loading: true,
            };
            setIsLoadingMoreMetronomes(true);
            try {
              const page = await fetchMetronomeWorkflowPageFromApi(normalizedMetronomeProjectFilterId, {
                backendUrl,
                apiKey,
                requestHeaders,
                limit: 10,
                offset,
              });
              if (metronomeWorkflowPaginationRef.current.requestKey !== requestKey) return;
              const items = Array.isArray(page?.items) ? page.items : [];
              setWorkflows((current) => {
                const currentItems = Array.isArray(current) ? current : [];
                const normalizedItems = mergeMetronomeWorkflowListPreservingGraphs(items, currentItems);
                const incomingById = new Map(normalizedItems
                  .map((workflow) => [String(workflow?.id || "").trim(), workflow])
                  .filter(([workflowId]) => Boolean(workflowId)));
                const existingIds = new Set();
                const next = currentItems.map((workflow) => {
                  const workflowId = String(workflow?.id || "").trim();
                  if (workflowId) existingIds.add(workflowId);
                  return incomingById.get(workflowId) || workflow;
                });
                normalizedItems.forEach((workflow) => {
                  const workflowId = String(workflow?.id || "").trim();
                  if (!workflowId || existingIds.has(workflowId)) return;
                  existingIds.add(workflowId);
                  next.push(workflow);
                });
                return next;
              });
              metronomeWorkflowPaginationRef.current = {
                requestKey,
                offset: Number(page?.nextOffset) || offset + items.length,
                hasMore: Boolean(page?.hasMore),
                loading: false,
              };
              setHasMoreMetronomeWorkflows(Boolean(page?.hasMore));
            } catch (error) {
              if (metronomeWorkflowPaginationRef.current.requestKey !== requestKey) return;
              console.warn("[Metronome] Failed to load more workflows", error);
              metronomeWorkflowPaginationRef.current = {
                ...metronomeWorkflowPaginationRef.current,
                hasMore: false,
                loading: false,
              };
              setHasMoreMetronomeWorkflows(false);
            } finally {
              if (metronomeWorkflowPaginationRef.current.requestKey === requestKey) {
                metronomeWorkflowPaginationRef.current.loading = false;
                setIsLoadingMoreMetronomes(false);
              }
            }
          }, [apiKey, backendUrl, isMetronomeApiAvailable, metronomeRequestHeadersKey, normalizedMetronomeProjectFilterId]);

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
            const nextGraph = createMetronomeVersionPersistedGraphSnapshot(
              activeWorkflow?.nodes || [],
              activeWorkflow?.edges || []
            );
            const nextNodes = nextGraph.nodes;
            const nextEdges = nextGraph.edges;
            setNodes(nextNodes);
            setEdges(nextEdges);
            setMetronomeWorkflowNameDraft(String(activeWorkflow?.name || ""));
            setMetronomeInferenceBudgetPolicyDraft(readMetronomeWorkflowInferenceBudgetPolicy(activeWorkflow));
            metronomeVisitBaselineKeyRef.current = activeWorkflow
              ? createMetronomeVisitEditorKey(activeWorkflow, nextNodes, nextEdges)
              : "";
            metronomeLoadedGraphSignatureRef.current = activeWorkflow
              ? createMetronomeVersionGraphSignature(nextNodes, nextEdges)
              : "";
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
            setActiveMetronomeVersionChanges(false);
            setSelectedNodeId("");
            setActiveMetronomeRichTextField("");
            setMetronomeDynamicContentPicker({ fieldKey: "", query: "" });
            setMetronomeEditorMode("edit");
            setGraphUndoStack([]);
            setGraphRedoStack([]);
            setIsMetronomeCodeDirty(false);
            setMetronomeCodeFilesDraft([]);
            setMetronomeCodeUndoStack([]);
            setMetronomeCodeRedoStack([]);
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
            if (!activeWorkflowId || !activeWorkflow) return;
            const nextSourceSignature = activeWorkflowGraphSignature;
            const previousSourceSignature = metronomeLoadedGraphSignatureRef.current;
            if (!previousSourceSignature || nextSourceSignature === previousSourceSignature) {
              metronomeLoadedGraphSignatureRef.current = nextSourceSignature;
              return;
            }

            const currentEditorSignature = createMetronomeVersionGraphSignature(nodes, edges);
            if (isMetronomeCodeDirty || currentEditorSignature !== previousSourceSignature) {
              return;
            }

            const hydratedGraph = createMetronomeVersionPersistedGraphSnapshot(
              activeWorkflow.nodes || [],
              activeWorkflow.edges || []
            );
            const hydratedNodes = hydratedGraph.nodes;
            const hydratedEdges = hydratedGraph.edges;
            setNodes(hydratedNodes);
            setEdges(hydratedEdges);
            metronomeLoadedGraphSignatureRef.current = nextSourceSignature;
            metronomeVisitBaselineKeyRef.current = createMetronomeVisitEditorKey(
              activeWorkflow,
              hydratedNodes,
              hydratedEdges
            );
            metronomeVersionComparisonGraphRef.current = {
              ...metronomeVersionComparisonGraphRef.current,
              workflowId: activeWorkflowId,
              selectedDeploymentId: readMetronomeSelectedDeploymentId(activeWorkflow),
              workflow: activeWorkflow,
              nodes: hydratedNodes,
              edges: hydratedEdges,
              codeDirty: false,
            };
            setActiveMetronomeVersionChanges(false);
          }, [
            activeWorkflow,
            activeWorkflowGraphSignature,
            activeWorkflowId,
            edges,
            isMetronomeCodeDirty,
            nodes,
            setEdges,
            setNodes,
          ]);

          useEffect(() => {
            setActiveMetronomeRichTextField("");
            setMetronomeDynamicContentPicker({ fieldKey: "", query: "" });
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
                    || (pendingOpen.mode === "runs" || pendingOpen.mode === "settings") && Boolean(pendingRunId)
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

	          const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
`;
