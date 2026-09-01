        function PlaygroundAgentsPage({
          backendUrl,
          requestHeaders,
          resolveRequestHeaders,
          apiKey = "",
          fetchCustomSkills,
          speechToTextUrl = "",
          computerAgents = null,
          agents,
          environments = [],
          projects = [],
          skills = [],
          currentUserId = "",
          currentUserName = "",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
          workspaceTeams = [],
          workspaceTeamMembers = [],
          workspaceTeamMembersTeamId = "",
          workspaceTeamsLoading = false,
          workspaceTeamsRequiresPlan = false,
          guardrailSets = [],
  ${EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.props}        onWorkspaceTeamsRequest,
          initialAgentId,
          preferredEnvironmentId = "",
          preferredAgentId = "",
          focusedAgentId = "",
          focusedAgentSelectionToken = "",
          createAgentRequestToken = 0,
          createAgentModelId = "",
          subscriptionTierId = "",
          onPreferredAgentChange,
          onPreferredEnvironmentChange,
          onThreadRegistered,
          onThreadOpen,
          onThreadActionMenuOpen,
          threadMutationSignal = null,
          onThreadStarted,
          onOpenPromptSearch,
          onOpenKnowledgeSearch,
          onOpenThreadSearch,
          onAgentMutated,
          onStartThreadWithAgent,
          onGenerateInstructions,
          onOpenEvaluations,
          onOpenAgentOptimization,
  ${MODELS_AGENT_SCRIPT_FRAGMENTS.props}        embeddedInResources = false,
          topNavActionsPortalId = "",
          titleActionsPortalId = "",
          versionsDrawerPortalId = "",
          onResourcesHeaderChange,
          onVersionsSidebarOpenChange,
          onOpenSettingsUsage,
          onNavigationGuardChange,
          onNavigationRequest,
          backRequestToken = 0,
          creationOnly = false,
          onCreationRequestClose,
        }) {
          const searchPopupInputRef = useRef(null);
          const editorDirtyRef = useRef(false);
          const selectedAgentIdRef = useRef(initialAgentId || "");
          const lastInitializedAgentSelectionRef = useRef("");
          const agentDetailRequestInFlightRef = useRef(new Map());
          const loadedAgentDetailRequestKeysRef = useRef(new Set());
          const agentAnalyticsRequestInFlightRef = useRef(new Map());
          const agentsHomeThreadsRequestInFlightRef = useRef(new Map());
          const requestHeadersRef = useRef(requestHeaders);
          const onWorkspaceTeamsRequestRef = useRef(onWorkspaceTeamsRequest);
          onWorkspaceTeamsRequestRef.current = onWorkspaceTeamsRequest;
          const lastAppliedCreateAgentRequestTokenRef = useRef("");
          const agentAutosaveTimerRef = useRef(0);
          const agentAutosaveQueuedRef = useRef(null);
          const agentAutosaveInFlightRef = useRef(false);
          const agentAccessPermissionSaveTimerRef = useRef(null);
          const agentAccessPermissionSaveQueuedRef = useRef(null);
          const agentAccessPermissionSaveInFlightRef = useRef(false);
          const agentDetailMainRef = useRef(null);
          const agentResourcesDetailScrollRef = useRef(null);
          const agentComposerInstructionsTextareaRef = useRef(null);
          const agentActionsPopoverRef = useRef(null);
          const agentActionsPopoverSurfaceRef = useRef(null);
          const agentVersionDescriptionTextareaRef = useRef(null);
          const agentVersionModalCloseTimerRef = useRef(null);
          const agentVersionModalFrameRef = useRef(null);
          const agentDetailSidebarCollapsedBeforeVersionsRef = useRef(null);
          const agentDetailSidebarCollapsedBeforeAccessRef = useRef(null);
          const agentVersionBaselineRef = useRef({ key: "", signature: "" });
          const agentVersionDraftTouchedRef = useRef(false);
          const agentVersionsLoadedRef = useRef(new Set());
          const agentSendTeamModalCloseTimerRef = useRef(null);
          const agentSendTeamModalFrameRef = useRef(null);
          const agentAddSquadModalCloseTimerRef = useRef(null);
          const agentAddSquadModalFrameRef = useRef(null);
          const agentBulkActionMenuCloseTimerRef = useRef(null);
          const agentApiModalCloseTimerRef = useRef(null);
          const agentApiModalFrameRef = useRef(null);
  ${EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.refs}        const agentWorkspaceTeamsRequestedRef = useRef(false);
          const agentWorkspaceTeamMembersRequestedRef = useRef(new Set());
          const agentOwnerProfileLookupKeyRef = useRef("");
          const agentOwnerCandidateProfileLookupKeyRef = useRef("");
          const agentRenameInputRef = useRef(null);
          const agentCreationNameInputRef = useRef(null);
          const agentCreationAssistantSavePromiseRef = useRef(null);
          const agentCreationNameAutofocusedRef = useRef(false);
          const agentModelPopoverRef = useRef(null);
          const agentModelPickerCloseTimerRef = useRef(null);
          const agentComposerModelPopoverRef = useRef(null);
          const agentComposerModelTriggerRef = useRef(null);
          const agentComposerReasoningTriggerRef = useRef(null);
          const agentComposerDeepResearchModelTriggerRef = useRef(null);
          const agentDeepResearchModelTriggerRef = useRef(null);
          const agentVoicePopoverRef = useRef(null);
          const agentsOverviewToolbarRef = useRef(null);
          const agentsObservabilityToolbarRef = useRef(null);
          const lastAppliedFocusedAgentSelectionTokenRef = useRef("");
          const handledBackRequestTokenRef = useRef(backRequestToken);
          const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId || "");
          const [agentDetailsById, setAgentDetailsById] = useState(() => {
            const next = {};
            agents.forEach((agent) => {
              if (!agent?.id) return;
              next[agent.id] = normalizePlaygroundAgentRecord(agent);
            });
            return next;
          });
          const agentDetailsByIdRef = useRef(agentDetailsById);
          agentDetailsByIdRef.current = agentDetailsById;
          const [draftAgent, setDraftAgent] = useState(null);
          const [toolbarPopover, setToolbarPopover] = useState("");
          const [searchPopupQuery, setSearchPopupQuery] = useState("");
          const [agentDetailTab, setAgentDetailTab] = useState("general");
          const [agentDetailSidebarCollapsed, setAgentDetailSidebarCollapsed] = useState(false);
          const [agentDetailCopiedFact, setAgentDetailCopiedFact] = useState("");
          const [agentPermissionChartAnimationKey, setAgentPermissionChartAnimationKey] = useState(0);
          const [agentAccessPrincipalId, setAgentAccessPrincipalId] = useState("");
          const [agentAccessRoleId, setAgentAccessRoleId] = useState("member");
          const [selectedAgentAccessTeamIds, setSelectedAgentAccessTeamIds] = useState(() => new Set());
          const [agentAccessTeamMenuOpen, setAgentAccessTeamMenuOpen] = useState(false);
          const [agentAccessState, setAgentAccessState] = useState({
            teamId: "",
            action: "",
            error: "",
          });
          const [agentsOverviewToolbarPopover, setAgentsOverviewToolbarPopover] = useState("");
          const [agentsOverviewToolbarPopoverClosing, setAgentsOverviewToolbarPopoverClosing] = useState("");
          const agentsOverviewToolbarPopoverCloseTimerRef = useRef(null);
          const [agentsOverviewFilter, setAgentsOverviewFilter] = useState("all");
          const [agentsOverviewSort, setAgentsOverviewSort] = useState("name");
          const [agentsOverviewSortDirection, setAgentsOverviewSortDirection] = useState("asc");
          const [selectedOverviewAgentIds, setSelectedOverviewAgentIds] = useState(() => new Set());
          const [agentsObservabilityToolbarPopover, setAgentsObservabilityToolbarPopover] = useState("");
          const [agentsObservabilityStatusFilter, setAgentsObservabilityStatusFilter] = useState("all");
          const [agentsObservabilitySort, setAgentsObservabilitySort] = useState("newest");
          const [agentsObservabilityVisibleThreadLimit, setAgentsObservabilityVisibleThreadLimit] = useState(20);
          const [agentDetailThreadSearchQuery, setAgentDetailThreadSearchQuery] = useState("");
          const [agentDetailThreadSorting, setAgentDetailThreadSorting] = useState(() => ({ id: "date", direction: "desc" }));
          const [agentDetailThreadFilterMode, setAgentDetailThreadFilterMode] = useState("all");
          const [agentDetailInsightsTableMode, setAgentDetailInsightsTableMode] = useState("threads");
  ${EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.state}${GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.state}        const [selectedAgentsObservabilityThreadId, setSelectedAgentsObservabilityThreadId] = useState("");
          const [agentsObservabilityThreadDetailsById, setAgentsObservabilityThreadDetailsById] = useState({});
          const [loadingAgentId, setLoadingAgentId] = useState("");
          const [loadingAgentAnalyticsId, setLoadingAgentAnalyticsId] = useState("");
          const [isHomeViewActive, setIsHomeViewActive] = useState(() => !String(focusedAgentId || "").trim());
          const AGENT_THREAD_FETCH_LIMIT = 20;
          const [agentsHomeThreadRecords, setAgentsHomeThreadRecords] = useState([]);
          const agentsHomeThreadRecordsRef = useRef(agentsHomeThreadRecords);
          agentsHomeThreadRecordsRef.current = agentsHomeThreadRecords;
          const [agentsHomeThreadsLoading, setAgentsHomeThreadsLoading] = useState(false);
          const [agentsHomeThreadsError, setAgentsHomeThreadsError] = useState("");
          const [agentsHomeChartTimescale, setAgentsHomeChartTimescale] = useState("month");
          const agentsOverviewAnalyticsScopeKey = useMemo(() => {
            let headerSignature = "";
            try {
              headerSignature = Array.from(new Headers(requestHeaders || {}).entries())
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, value]) => key + ":" + value)
                .join("|");
            } catch {}
            return String(backendUrl || "").replace(new RegExp("/+$"), "") + "|" + String(currentUserId || currentUserEmail || "session") + "|" + headerSignature;
          }, [backendUrl, currentUserEmail, currentUserId, requestHeaders]);
          requestHeadersRef.current = requestHeaders;
          const [agentsOverviewAnalyticsState, setAgentsOverviewAnalyticsState] = useState(() => ({
            scopeKey: "",
            dataByPeriod: {},
            loadingPeriod: "",
            errorsByPeriod: {},
          }));
          const agentsOverviewAnalyticsFallbackScopeRef = useRef("");
          const [agentsAnalyticsMenuOpen, setAgentsAnalyticsMenuOpen] = useState(false);
          const [agentDetailChartTimescale, setAgentDetailChartTimescale] = useState("month");
          const [agentDetailPerformanceRange, setAgentDetailPerformanceRange] = useState("month");
          const agentDetailPerformanceRangeOptions = [
            { id: "day", label: "24H", bucketCount: 1 },
            { id: "week", label: "7D", bucketCount: 7 },
            { id: "month", label: "30D", bucketCount: 30 },
          ];
          const normalizedAgentDetailPerformanceRange = agentDetailPerformanceRangeOptions.some(
            (option) => option.id === agentDetailPerformanceRange
          )
            ? agentDetailPerformanceRange
            : "month";
          const [agentsHomeCreationCommandRequest, setAgentsHomeCreationCommandRequest] = useState(null);
          const [agentsHomeActiveCreationCommand, setAgentsHomeActiveCreationCommand] = useState("");
          const [agentListMode, setAgentListMode] = useState(() => {
            const initialSelectedAgent = agents.find((agent) => agent?.id === initialAgentId) || null;
            return getPlaygroundAgentOverviewMode(initialSelectedAgent);
          });
          const [agentAnalyticsById, setAgentAnalyticsById] = useState({});
          const agentAnalyticsByIdRef = useRef(agentAnalyticsById);
          agentAnalyticsByIdRef.current = agentAnalyticsById;
          const [agentAnalyticsErrorById, setAgentAnalyticsErrorById] = useState({});
          const [agentAnalyticsVisibility, setAgentAnalyticsVisibility] = useState({
            requests: true,
            success: true,
            latency: true,
            errors: true,
          });
  ${EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.lifecycle}        const [saveState, setSaveState] = useState({
            isSaving: false,
            error: "",
            message: "",
          });
          const [agentProfileAvatarBroken, setAgentProfileAvatarBroken] = useState(false);
          const [agentProfileAvatarPickerOpen, setAgentProfileAvatarPickerOpen] = useState(false);
          const [agentActionsPopoverOpen, setAgentActionsPopoverOpen] = useState(false);
          const [agentOwnerPopoverOpen, setAgentOwnerPopoverOpen] = useState(false);
          const [agentOwnerProfileIdentity, setAgentOwnerProfileIdentity] = useState(null);
          const [agentOwnerCandidateProfileIdentitiesByKey, setAgentOwnerCandidateProfileIdentitiesByKey] = useState({});
          const [agentWorkspaceTeamMembersById, setAgentWorkspaceTeamMembersById] = useState({});
          const [agentSendTeamModalOpen, setAgentSendTeamModalOpen] = useState(false);
          const [agentSendTeamModalVisible, setAgentSendTeamModalVisible] = useState(false);
          const [agentSendTeamModalClosing, setAgentSendTeamModalClosing] = useState(false);
          const [agentSendTeamTargetAgent, setAgentSendTeamTargetAgent] = useState(null);
          const [agentSendTeamTargetAgentIds, setAgentSendTeamTargetAgentIds] = useState([]);
          const [agentSendTeamPickerValue, setAgentSendTeamPickerValue] = useState("");
          const [agentSendTeamError, setAgentSendTeamError] = useState("");
          const [agentSendTeamShareState, setAgentSendTeamShareState] = useState({
            teamId: "",
            action: "",
            error: "",
          });
          const [agentAddSquadModalOpen, setAgentAddSquadModalOpen] = useState(false);
          const [agentAddSquadModalVisible, setAgentAddSquadModalVisible] = useState(false);
          const [agentAddSquadModalClosing, setAgentAddSquadModalClosing] = useState(false);
          const [agentAddSquadTargetAgent, setAgentAddSquadTargetAgent] = useState(null);
          const [agentAddSquadTargetAgentIds, setAgentAddSquadTargetAgentIds] = useState([]);
          const [agentAddSquadPickerValue, setAgentAddSquadPickerValue] = useState("");
          const [agentAddSquadError, setAgentAddSquadError] = useState("");
          const [agentAddSquadState, setAgentAddSquadState] = useState({
            squadId: "",
            action: "",
            error: "",
          });
          const [agentApiModalOpen, setAgentApiModalOpen] = useState(false);
          const [agentApiModalVisible, setAgentApiModalVisible] = useState(false);
          const [agentApiModalClosing, setAgentApiModalClosing] = useState(false);
          const [agentApiSnippetTab, setAgentApiSnippetTab] = useState("curl");
          const [agentApiEnvironmentId, setAgentApiEnvironmentId] = useState("");
          const [copiedAgentApiSnippet, setCopiedAgentApiSnippet] = useState("");
          const [agentApiEditorModule, setAgentApiEditorModule] = useState(null);
          const [agentApiEditorModuleError, setAgentApiEditorModuleError] = useState("");
          const [agentRenameState, setAgentRenameState] = useState(null);
          const [agentRenameValue, setAgentRenameValue] = useState("");
          const [agentRenameError, setAgentRenameError] = useState("");
          const [agentModelPopover, setAgentModelPopover] = useState("");
          const [agentVoicePopoverOpen, setAgentVoicePopoverOpen] = useState(false);
          const [agentModelPickerState, setAgentModelPickerState] = useState(null);
          const [agentModelPickerClosing, setAgentModelPickerClosing] = useState(false);
          const [agentComposerOpen, setAgentComposerOpen] = useState(false);
          const [agentComposerDraft, setAgentComposerDraft] = useState(() => buildPlaygroundDefaultAgentDraft());
          const [agentComposerSaveState, setAgentComposerSaveState] = useState({
            isSaving: false,
            error: "",
          });
          const [agentAssistantOpen, setAgentAssistantOpen] = useState(false);
          const [agentAssistantCommandRequest, setAgentAssistantCommandRequest] = useState(null);
          const [agentAssistantThreadByAgentId, setAgentAssistantThreadByAgentId] = useState({});
          const [agentPreviewRefineMode, setAgentPreviewRefineMode] = useState(false);
          const [agentPreviewComposerFocusRequest, setAgentPreviewComposerFocusRequest] = useState(null);
          const [agentPreviewRefinementRun, setAgentPreviewRefinementRun] = useState({
            agentId: "",
            threadId: "",
            status: "idle",
            baselineInstructions: "",
            baselineVersionId: "",
          });
          useEffect(() => {
            setAgentPreviewRefineMode(false);
            setAgentPreviewComposerFocusRequest(null);
            setAgentPreviewRefinementRun({
              agentId: "",
              threadId: "",
              status: "idle",
              baselineInstructions: "",
              baselineVersionId: "",
            });
          }, [selectedAgentId]);
          const [agentPublishMenuOpen, setAgentPublishMenuOpen] = useState(false);
          const [agentVersionSelectorMenuOpen, setAgentVersionSelectorMenuOpen] = useState(false);
          const [agentVersionsHeaderMenuOpen, setAgentVersionsHeaderMenuOpen] = useState(false);
          const [agentCreationSetupOpen, setAgentCreationSetupOpen] = useState(false);
          const [agentCreationSetupDraft, setAgentCreationSetupDraft] = useState(null);
          const [agentCreationSetupError, setAgentCreationSetupError] = useState("");
          const [agentCreationSetupSubmitting, setAgentCreationSetupSubmitting] = useState(false);
          const [agentCreationSetupResetToken, setAgentCreationSetupResetToken] = useState(0);
          const [agentCreationPermissionModalOpen, setAgentCreationPermissionModalOpen] = useState(false);
          const [agentCreationInstructionRunRequest, setAgentCreationInstructionRunRequest] = useState(null);
          const [agentCreationInstructionContext, setAgentCreationInstructionContext] = useState(null);
          const [agentVersionsSidebarOpen, setAgentVersionsSidebarOpen] = useState(false);
          const [agentVersionState, setAgentVersionState] = useState({
            status: "idle",
            message: "",
            error: "",
          });
          const [agentVersionsLoadState, setAgentVersionsLoadState] = useState({
            agentId: "",
            status: "idle",
            error: "",
          });
          const agentVersionApiClient = useMemo(() => new RunnerClient(), []);
          const [agentVersionSaveDialog, setAgentVersionSaveDialog] = useState(null);
          const [agentVersionModal, setAgentVersionModal] = useState(null);
          const [agentVersionModalVisible, setAgentVersionModalVisible] = useState(false);
          const [agentVersionModalClosing, setAgentVersionModalClosing] = useState(false);
          const [agentVersionDescriptionDraft, setAgentVersionDescriptionDraft] = useState("");
          const [isAgentVersionDescriptionEditing, setIsAgentVersionDescriptionEditing] = useState(false);
          const [agentVersionChangesState, setAgentVersionChangesState] = useState(null);
          const [openAgentVersionMenuId, setOpenAgentVersionMenuId] = useState("");
          const [agentAssistantPresetRunState, setAgentAssistantPresetRunState] = useState({
            isStarting: false,
            actionType: "",
            error: "",
          });
          const [agentCreationAssistantAgentId, setAgentCreationAssistantAgentId] = useState("");
          const [agentCreationAssistantPreparing, setAgentCreationAssistantPreparing] = useState(false);
          const [agentCreationAssistantError, setAgentCreationAssistantError] = useState("");
          const [topNavActionsContainer, setTopNavActionsContainer] = useState(null);
          const [titleActionsContainer, setTitleActionsContainer] = useState(null);
          const [agentVersionsDrawerContainer, setAgentVersionsDrawerContainer] = useState(null);
  ${MODELS_AGENT_SCRIPT_FRAGMENTS.catalogState}        const [isAgentComposerInstructionsEditing, setIsAgentComposerInstructionsEditing] = useState(false);
          const [agentComposerModelPopover, setAgentComposerModelPopover] = useState("");
          const [deepResearchSkillDefaultModel, setDeepResearchSkillDefaultModel] = useState(() => getDemoDefaultDeepResearchModel(readDemoSettingsPlatformConfig()));
          const [agentListActionMenuState, setAgentListActionMenuState] = useState(null);
          const [agentListActionMenuClosing, setAgentListActionMenuClosing] = useState(false);
          const agentListActionMenuCloseTimerRef = useRef(null);
          const [agentBulkActionMenuState, setAgentBulkActionMenuState] = useState(null);
          const [agentBulkActionMenuClosing, setAgentBulkActionMenuClosing] = useState(false);
          const [collapsedAgentListSections, setCollapsedAgentListSections] = useState(() => ({
            system: false,
            custom: false,
          }));
          const [expandedSections, setExpandedSections] = useState(() => new Set(["team", "model", "instructions"]));
  ${MODELS_AGENT_SCRIPT_FRAGMENTS.resolvedCatalog}        const isFreeAgentPlan = (normalizeSettingsTierId(subscriptionTierId) || "sandbox") === "sandbox";
  
          async function flushQueuedAgentAutosave() {
            if (agentAutosaveInFlightRef.current) {
              return;
            }
  
            agentAutosaveInFlightRef.current = true;
            try {
              while (agentAutosaveQueuedRef.current) {
                const nextAgentToSave = normalizePlaygroundAgentRecord(agentAutosaveQueuedRef.current);
                agentAutosaveQueuedRef.current = null;
  
                setSaveState({
                  isSaving: true,
                  error: "",
                  message: "",
                });
  
                try {
                  const savedAgent = await persistAgentRecord(nextAgentToSave);
                  const hasQueuedFollowUp = Boolean(agentAutosaveQueuedRef.current);
                  const shouldKeepAgentSelected =
                    selectedAgentIdRef.current === nextAgentToSave.id
                    || (!nextAgentToSave.id && selectedAgentIdRef.current === PLAYGROUND_AGENT_DRAFT_ID);
  
                  if (hasQueuedFollowUp && agentAutosaveQueuedRef.current) {
                    agentAutosaveQueuedRef.current = normalizePlaygroundAgentRecord({
                      ...agentAutosaveQueuedRef.current,
                      id: savedAgent.id,
                      userId: savedAgent.userId || agentAutosaveQueuedRef.current.userId,
                      createdAt: savedAgent.createdAt || agentAutosaveQueuedRef.current.createdAt,
                    });
                  }
  
                  editorDirtyRef.current = hasQueuedFollowUp;
                  setAgentDetailsById((current) => ({
                    ...current,
                    [savedAgent.id]: savedAgent,
                  }));
                  setAgentListMode(getPlaygroundAgentOverviewMode(savedAgent));
                  if (shouldKeepAgentSelected) {
                    setSelectedAgentId(savedAgent.id);
                    setDraftAgent((current) => {
                      if (hasQueuedFollowUp && current && current.id === savedAgent.id) {
                        return normalizePlaygroundAgentRecord({
                          ...savedAgent,
                          ...current,
                          id: savedAgent.id,
                          userId: savedAgent.userId,
                          createdAt: savedAgent.createdAt,
                        });
                      }
                      return savedAgent;
                    });
                    if (!hasQueuedFollowUp) {
                      rememberAgentVersionBaseline(savedAgent, { force: true });
                    }
                  }
  
                  setSaveState({
                    isSaving: false,
                    error: "",
                    message: "",
                  });
  	            if (onAgentMutated) {
  	              void Promise.resolve(onAgentMutated()).catch((error) => {
  	                console.warn("[agents] Failed to refresh agents after version update", error);
  	              });
  	            }
                } catch (error) {
                  editorDirtyRef.current = true;
                  setSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save agent.",
                    message: "",
                  });
                  break;
                }
              }
            } finally {
              agentAutosaveInFlightRef.current = false;
            }
          }
  
  ${MODELS_AGENT_SCRIPT_FRAGMENTS.catalogLoader}
  	        const orderedAgents = useMemo(() => {
  	          return ensurePlaygroundComposerDefaultChoices(Array.isArray(agents) ? agents : []).sort((left, right) => {
              if (Boolean(left?.isDefault) !== Boolean(right?.isDefault)) {
                return left?.isDefault ? -1 : 1;
              }
              if (Boolean(left?.isSystem) !== Boolean(right?.isSystem)) {
                return left?.isSystem ? -1 : 1;
              }
              const leftRank = getPlaygroundSystemAgentSortRank(left);
              const rightRank = getPlaygroundSystemAgentSortRank(right);
              if (leftRank !== rightRank) {
                return leftRank - rightRank;
              }
              return String(left?.name || "").localeCompare(String(right?.name || ""));
            });
          }, [agents]);
          const orderedAgentsRef = useRef(orderedAgents);
          orderedAgentsRef.current = orderedAgents;
  
          const agentListActionTarget = useMemo(() => {
            if (!agentListActionMenuState?.agentId) {
              return null;
            }
            return orderedAgents.find((agent) => agent.id === agentListActionMenuState.agentId)
              || agentListActionMenuState.agentRecord
              || null;
          }, [agentListActionMenuState, orderedAgents]);
  
          useEffect(() => () => {
            if (agentListActionMenuCloseTimerRef.current !== null) {
              window.clearTimeout(agentListActionMenuCloseTimerRef.current);
              agentListActionMenuCloseTimerRef.current = null;
            }
            if (agentBulkActionMenuCloseTimerRef.current !== null) {
              window.clearTimeout(agentBulkActionMenuCloseTimerRef.current);
              agentBulkActionMenuCloseTimerRef.current = null;
            }
          }, []);
  
          const allKnownAgents = useMemo(() => {
            const next = {};
            orderedAgents.forEach((agent) => {
              if (!agent?.id) return;
              next[agent.id] = normalizePlaygroundAgentRecord({
                ...(next[agent.id] || {}),
                ...agent,
              });
            });
            Object.values(agentDetailsById).forEach((agent) => {
              if (!agent?.id) return;
              next[agent.id] = normalizePlaygroundAgentRecord({
                ...(next[agent.id] || {}),
                ...agent,
              });
            });
            return Object.values(next);
          }, [agentDetailsById, orderedAgents]);
  
          function getKnownAgentById(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return null;
            }
            if (draftAgent?.id && String(draftAgent.id).trim() === normalizedAgentId) {
              return normalizePlaygroundAgentRecord(draftAgent);
            }
            const matchingAgent = agentDetailsById[normalizedAgentId]
              || orderedAgents.find((agent) => String(agent?.id || "").trim() === normalizedAgentId)
              || allKnownAgents.find((agent) => String(agent?.id || "").trim() === normalizedAgentId)
              || null;
            return matchingAgent ? normalizePlaygroundAgentRecord(matchingAgent) : null;
          }
  
          function normalizeAgentActionTarget(agentRecord) {
            const normalizedId = String(agentRecord?.id || "").trim();
            return normalizedId ? (getKnownAgentById(normalizedId) || normalizePlaygroundAgentRecord(agentRecord)) : null;
          }
  
          function normalizeAgentActionTargets(agentRecords = []) {
            const sourceRecords = Array.isArray(agentRecords) ? agentRecords : [agentRecords];
            const seen = new Set();
            return sourceRecords
              .map((agentRecord) => normalizeAgentActionTarget(agentRecord))
              .filter((agentRecord) => {
                const normalizedId = String(agentRecord?.id || "").trim();
                if (!normalizedId || normalizedId === PLAYGROUND_AGENT_DRAFT_ID || seen.has(normalizedId)) {
                  return false;
                }
                seen.add(normalizedId);
                return true;
              });
          }
  
          function getAgentActionTargetsByIds(agentIds = []) {
            return normalizeAgentActionTargets(
              (Array.isArray(agentIds) ? agentIds : [])
                .map((agentId) => getKnownAgentById(agentId))
                .filter(Boolean)
            );
          }
  
          const selectedOverviewAgentRecords = useMemo(() => (
            getAgentActionTargetsByIds(Array.from(selectedOverviewAgentIds || []))
          ), [selectedOverviewAgentIds, allKnownAgents, agentDetailsById, orderedAgents, draftAgent]);
  
  
          const availableAgentSquads = useMemo(() => (
            allKnownAgents
              .filter((agent) => (
                agent?.id
                && agent.id !== PLAYGROUND_AGENT_DRAFT_ID
                && isPlaygroundTeamAgent(agent)
                && !isPlaygroundAgentCreatorAgent(agent)
                && !isPlaygroundMissionControlAgent(agent)
              ))
              .sort((left, right) => {
                if (Boolean(left?.isDefault || left?.isSystem) !== Boolean(right?.isDefault || right?.isSystem)) {
                  return (left?.isDefault || left?.isSystem) ? -1 : 1;
                }
                return String(left?.name || "").localeCompare(String(right?.name || ""));
              })
          ), [allKnownAgents]);
  
          function getAgentSquadCandidateRows(agentRecord) {
            const targetRecords = normalizeAgentActionTargets(Array.isArray(agentRecord) ? agentRecord : [agentRecord]);
            const targetIds = new Set(targetRecords.map((target) => String(target?.id || "").trim()).filter(Boolean));
            return availableAgentSquads.filter((squad) => {
              if (!squad?.id || targetIds.has(String(squad.id).trim())) {
                return false;
              }
              return true;
            });
          }
  
          function getDefaultAgentSquadIdForAgent(agentRecord) {
            const candidates = getAgentSquadCandidateRows(agentRecord);
            const targetRecords = normalizeAgentActionTargets(Array.isArray(agentRecord) ? agentRecord : [agentRecord])
              .filter((target) => !isPlaygroundTeamAgent(target));
            const targetIds = targetRecords.map((target) => String(target?.id || "").trim()).filter(Boolean);
            return String(
              candidates.find((squad) => {
                const orchestratorId = String(squad?.teamOrchestratorAgentId || "").trim();
                const subagentIds = dedupePlaygroundAgentIds(squad?.teamSubagentIds);
                return !squad?.isDefault
                  && !squad?.isSystem
                  && targetIds.some((targetId) => orchestratorId !== targetId && !subagentIds.includes(targetId));
              })?.id
              || candidates.find((squad) => !squad?.isDefault && !squad?.isSystem)?.id
              || candidates[0]?.id
              || ""
            ).trim();
          }
  
          const agentCreationAssistantAgent = useMemo(() => {
            const normalizedPreferredId = String(agentCreationAssistantAgentId || "").trim();
            if (normalizedPreferredId) {
              const matchingById = allKnownAgents.find((agent) => agent?.id === normalizedPreferredId);
              if (matchingById && isPlaygroundAgentCreatorAgent(matchingById)) {
                return matchingById;
              }
            }
  
            return allKnownAgents.find((agent) => isPlaygroundAgentCreatorAgent(agent)) || null;
          }, [agentCreationAssistantAgentId, allKnownAgents]);
  
          const agentCreationAssistantRunnerAgents = useMemo(() => (
            agentCreationAssistantAgent
              ? [{
                  ...agentCreationAssistantAgent,
                  isDefault: true,
                }]
              : []
          ), [agentCreationAssistantAgent]);
  
          const availableTeamMemberAgents = useMemo(() => {
            return allKnownAgents.filter((agent) => {
              if (!agent?.id || agent.id === PLAYGROUND_AGENT_DRAFT_ID) {
                return false;
              }
              if (isPlaygroundAgentCreatorAgent(agent)) {
                return false;
              }
              if (isPlaygroundMissionControlAgent(agent)) {
                return false;
              }
              if (draftAgent?.id && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID && agent.id === draftAgent.id) {
                return false;
              }
              return !isPlaygroundTeamAgent(agent);
            });
          }, [allKnownAgents, draftAgent?.id]);
  
          const availableTeamMemberAgentsById = useMemo(() => {
            const next = {};
            availableTeamMemberAgents.forEach((agent) => {
              if (!agent?.id) return;
              next[agent.id] = agent;
            });
            return next;
          }, [availableTeamMemberAgents]);
  
          const selectedAgentSnapshot = useMemo(() => {
            if (!selectedAgentId || selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return null;
            }
            return agentDetailsById[selectedAgentId]
              || orderedAgents.find((agent) => agent.id === selectedAgentId)
              || null;
          }, [agentDetailsById, orderedAgents, selectedAgentId]);
  
          const orderedAgentApiEnvironments = useMemo(() => {
            const seen = new Set();
            return (Array.isArray(environments) ? environments : [])
              .map((environment) => normalizePlaygroundEnvironmentRecord(environment))
              .filter((environment) => {
                const id = String(environment?.id || "").trim();
                if (!id || seen.has(id) || id === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
                  return false;
                }
                seen.add(id);
                return true;
              })
              .sort((left, right) => {
                if (Boolean(left?.isDefault) !== Boolean(right?.isDefault)) {
                  return left?.isDefault ? -1 : 1;
                }
                return String(left?.name || "").localeCompare(String(right?.name || ""));
              });
          }, [environments]);
  
          const agentApiDefaultEnvironmentId = useMemo(() => {
            const normalizedPreferredEnvironmentId = String(preferredEnvironmentId || "").trim();
            if (normalizedPreferredEnvironmentId && orderedAgentApiEnvironments.some((environment) => environment.id === normalizedPreferredEnvironmentId)) {
              return normalizedPreferredEnvironmentId;
            }
            return String(
              orderedAgentApiEnvironments.find((environment) => environment?.isDefault)?.id
              || orderedAgentApiEnvironments[0]?.id
              || "computer_id"
            ).trim();
          }, [orderedAgentApiEnvironments, preferredEnvironmentId]);
  
          const selectedAgentApiEnvironment = useMemo(() => {
            const normalizedEnvironmentId = String(agentApiEnvironmentId || "").trim();
            return orderedAgentApiEnvironments.find((environment) => String(environment?.id || "").trim() === normalizedEnvironmentId)
              || orderedAgentApiEnvironments.find((environment) => String(environment?.id || "").trim() === agentApiDefaultEnvironmentId)
              || null;
          }, [agentApiDefaultEnvironmentId, agentApiEnvironmentId, orderedAgentApiEnvironments]);
  
          const filteredOrderedAgents = useMemo(() => {
            return orderedAgents.filter((agent) => {
              if (agentListMode === "functional") {
                return isPlaygroundFunctionalAgent(agent);
              }
              return getPlaygroundAgentListMode(agent) === agentListMode
                && !isPlaygroundAgentCreatorAgent(agent)
                && !isPlaygroundFunctionalAgent(agent);
            });
          }, [agentListMode, orderedAgents]);
  
          const selectedAgentListPreview = useMemo(() => {
            if (selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return draftAgent
                ? {
                    ...draftAgent,
                    id: PLAYGROUND_AGENT_DRAFT_ID,
                  }
                : null;
            }
            if (draftAgent?.id && draftAgent.id === selectedAgentId) {
              return draftAgent;
            }
            return selectedAgentSnapshot;
          }, [draftAgent, selectedAgentId, selectedAgentSnapshot]);
  
          const selectedAgentListPreviewMode = selectedAgentListPreview
            ? getPlaygroundAgentOverviewMode(selectedAgentListPreview)
            : "agents";
  
          const displayAgents = useMemo(() => {
            const items = [...filteredOrderedAgents];
            if (!selectedAgentListPreview || selectedAgentListPreviewMode !== agentListMode) {
              return items;
            }
  
            const previewIndex = items.findIndex((agent) => agent.id === selectedAgentListPreview.id);
            if (previewIndex >= 0) {
              items[previewIndex] = normalizePlaygroundAgentRecord({
                ...items[previewIndex],
                ...selectedAgentListPreview,
              });
            } else {
              items.unshift(selectedAgentListPreview);
            }
  
            return items;
          }, [agentListMode, filteredOrderedAgents, selectedAgentListPreview, selectedAgentListPreviewMode]);
          const selectedResourcesDetailTitle = useMemo(() => {
            const fallbackTitle = agentListMode === "teams"
              ? "Squad"
              : agentListMode === "functional"
                ? "Functional Agent"
                : "Agent";
            if (selectedAgentId) {
              return String(draftAgent?.name || selectedAgentSnapshot?.name || fallbackTitle).trim()
                || fallbackTitle;
            }
            return fallbackTitle;
          }, [agentListMode, draftAgent?.name, selectedAgentId, selectedAgentSnapshot?.name]);

          const groupedDisplayAgents = useMemo(() => {
            if (agentListMode === "functional") {
              return displayAgents.length > 0
                ? [{
                    key: "functional",
                    title: "Functional Agents",
                    items: displayAgents,
                  }]
                : [];
            }
            const systemItems = [];
            const customItems = [];
            displayAgents.forEach((agent) => {
              if (agent?.isDefault || agent?.isSystem) {
                systemItems.push(agent);
              } else {
                customItems.push(agent);
              }
            });
            const sections = [];
            if (systemItems.length > 0) {
              sections.push({
                key: "system",
                title: agentListMode === "teams" ? "System Squads" : "System Agents",
                items: systemItems,
              });
            }
            if (customItems.length > 0) {
              sections.push({
                key: "custom",
                title: agentListMode === "teams" ? "Custom Squads" : "Custom Agents",
                items: customItems,
              });
            }
            return sections;
          }, [agentListMode, displayAgents]);
  
          const searchResults = useMemo(() => {
            const query = searchPopupQuery.trim().toLowerCase();
            if (!query) return [];
            return displayAgents
              .filter((agent) => {
                const haystack = [agent?.name || "", agent?.description || "", agent?.instructions || ""].join(" ").toLowerCase();
                return haystack.includes(query);
              })
              .slice(0, 12);
          }, [displayAgents, searchPopupQuery]);
  
          const isLoadingCurrentAgent = Boolean(
            selectedAgentId
            && selectedAgentId !== PLAYGROUND_AGENT_DRAFT_ID
            && loadingAgentId === selectedAgentId
          );
          const agentEmailAddress = draftAgent ? getPlaygroundAgentEmailAddress(draftAgent) : "";
          const explicitAgentProfilePhotoUrl = draftAgent ? (getPlaygroundAgentProfileMetadata(draftAgent?.metadata)?.photoURL || "") : "";
          const rawAgentProfilePhotoUrl = draftAgent ? getPlaygroundAgentProfilePhotoUrl(draftAgent) : "";
          const agentProfilePhotoUrl = !agentProfileAvatarBroken && canRenderAvatarImage(rawAgentProfilePhotoUrl)
            ? rawAgentProfilePhotoUrl
            : "";
          const agentProfileHoverPhotoUrl = getPlaygroundAgentProfileHoverPhotoUrl(agentProfilePhotoUrl);
          const hasExplicitAgentProfilePhoto = Boolean(explicitAgentProfilePhotoUrl);
          const canEditAgentProfilePhoto = Boolean(
            draftAgent
            && (
              draftAgent.id === PLAYGROUND_AGENT_DRAFT_ID
              || canVersionPlaygroundAgent(draftAgent)
            )
          );
          function getAgentMetadataRecord(agentRecord) {
            return agentRecord?.metadata && typeof agentRecord.metadata === "object" && !Array.isArray(agentRecord.metadata)
              ? agentRecord.metadata
              : {};
          }
          function getAgentSharedTeamIds(agentRecord) {
            const metadata = getAgentMetadataRecord(agentRecord);
            const metadataTeamIds = getPlatformSharedTeamIds(metadata);
            const source = metadataTeamIds.length > 0
              ? metadataTeamIds
              : Array.isArray(agentRecord?.sharedTeamIds)
                ? agentRecord.sharedTeamIds
                : [];
            return Array.from(new Set(
              source.map((teamId) => String(teamId || "").trim()).filter(Boolean)
            ));
          }
          function normalizeAgentWorkspaceTeamOption(team) {
            const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
            const id = String(source.id || source.teamId || source.team_id || "").trim();
            if (!id) {
              return null;
            }
            const name = String(source.name || source.title || source.displayName || "Team").trim() || "Team";
            const roleId = normalizePlaygroundTeamRoleId(
              source.roleId || source.role_id || source.role || source.membershipRole || source.membership_role || source.currentUserRole || source.current_user_role,
              "admin"
            );
            return {
              ...source,
              id,
              name,
              roleId,
              roleLabel: roleId ? roleId.charAt(0).toUpperCase() + roleId.slice(1) : "Team",
            };
          }
          function getAgentIdentitySources(record) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
              ? source.metadata
              : {};
            const sources = [
              source,
              source.owner,
              source.creator,
              source.createdBy,
              source.created_by,
              source.user,
              source.profile,
              source.authProfile,
              source.account,
              source.member,
              source.identity,
              source.userProfile,
              source.accountProfile,
              source.publicProfile,
              source.firebaseUser,
              source.authUser,
              metadata,
              metadata.owner,
              metadata.creator,
              metadata.createdBy,
              metadata.created_by,
              metadata.user,
              metadata.profile,
              metadata.authProfile,
              metadata.account,
              metadata.member,
              metadata.identity,
              metadata.userProfile,
              metadata.accountProfile,
              metadata.publicProfile,
              metadata.firebaseUser,
              metadata.authUser,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
            sources.slice().forEach((value) => {
              [value.providerUserInfo, value.providerData].forEach((providerProfiles) => {
                if (!Array.isArray(providerProfiles)) {
                  return;
                }
                providerProfiles.forEach((providerProfile) => {
                  if (providerProfile && typeof providerProfile === "object" && !Array.isArray(providerProfile)) {
                    sources.push(providerProfile);
                  }
                });
              });
            });
            return sources;
          }
          function readAgentIdentityString(record, keys = []) {
            for (const source of getAgentIdentitySources(record)) {
              for (const key of keys) {
                const value = String(source?.[key] || "").replace(/\s+/g, " ").trim();
                if (value) {
                  return value;
                }
              }
            }
            return "";
          }
          function isAgentOpaqueIdentityValue(value) {
            const normalized = String(value || "").trim();
            if (!normalized || normalized.includes("@") || /\s/.test(normalized)) {
              return false;
            }
            if (normalized.length < 16) {
              return false;
            }
            return /^[A-Za-z0-9_-]+$/.test(normalized)
              && /[A-Za-z]/.test(normalized)
              && /\d/.test(normalized);
          }
          function isAgentPlaceholderIdentityName(value) {
            const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
            return !normalized || normalized === "owner" || normalized === "team member";
          }
          function getAgentIdentityKeyValues(record, fallback = {}) {
            const values = [];
            const pushValue = (value) => {
              const normalized = String(value || "").trim();
              if (normalized) {
                values.push(normalized.toLowerCase());
              }
            };
            for (const source of getAgentIdentitySources(record)) {
              [
                source.id,
                source.userId,
                source.user_id,
                source.uid,
                source.localId,
                source.local_id,
                source.firebaseUid,
                source.firebase_uid,
                source.firebaseUserId,
                source.firebase_user_id,
                source.authUid,
                source.auth_uid,
                source.authUserId,
                source.auth_user_id,
                source.providerUid,
                source.provider_uid,
                source.providerUserId,
                source.provider_user_id,
                source.sub,
                source.subject,
                source.memberId,
                source.member_id,
                source.ownerId,
                source.owner_id,
                source.ownerUserId,
                source.owner_user_id,
                source.creatorId,
                source.creator_id,
                source.creatorUserId,
                source.creator_user_id,
                source.email,
                source.emailAddress,
                source.email_address,
                source.mail,
                source.primaryEmail,
                source.primary_email,
              ].forEach(pushValue);
            }
            [
              fallback.id,
              fallback.userId,
              fallback.user_id,
              fallback.uid,
              fallback.email,
            ].forEach(pushValue);
            return Array.from(new Set(values));
          }
          function getAgentIdentityMatchKeys(record, fallback = {}) {
            const values = [...getAgentIdentityKeyValues(record, fallback)];
            const pushIdentityKeys = (value) => {
              if (!value || typeof value !== "object" || Array.isArray(value)) {
                return;
              }
              if (!Array.isArray(value.identityKeys)) {
                return;
              }
              value.identityKeys.forEach((key) => {
                const normalized = String(key || "").trim().toLowerCase();
                if (normalized) {
                  values.push(normalized);
                }
              });
            };
            pushIdentityKeys(record);
            pushIdentityKeys(fallback);
            return Array.from(new Set(values));
          }
          function readAgentTeamMemberDisplayName(record) {
            const directName = readAgentIdentityString(record, [
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
              "accountDisplayName",
              "accountName",
              "memberDisplayName",
              "memberName",
              "firebaseDisplayName",
              "providerDisplayName",
              "publicName",
              "username",
              "userName",
            ]);
            if (directName) {
              return directName;
            }
            for (const source of getAgentIdentitySources(record)) {
              const firstName = String(source.firstName || source.first_name || source.givenName || source.given_name || "").trim();
              const lastName = String(source.lastName || source.last_name || source.familyName || source.family_name || "").trim();
              const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
              if (fullName) {
                return fullName;
              }
            }
            return "";
          }
          function readAgentTeamMemberEmail(record) {
            return readAgentIdentityString(record, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "primaryEmail",
              "primary_email",
            ]).toLowerCase();
          }
          function readAgentTeamMemberAvatarUrl(record) {
            return readAgentIdentityString(record, [
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarUrl",
              "avatarURL",
              "avatar",
              "picture",
              "imageUrl",
              "profileImageUrl",
              "profile_image_url",
            ]);
          }
          function buildAgentTeamMemberProfileMap(payload) {
            const profileMap = new Map();
            const addProfile = (profile, explicitKey = "") => {
              if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
                return;
              }
              const normalizedProfile = explicitKey
                ? { id: explicitKey, ...profile }
                : profile;
              const keys = getAgentIdentityKeyValues(normalizedProfile, normalizedProfile);
              keys.forEach((key) => profileMap.set(key, normalizedProfile));
            };
            const addProfiles = (value) => {
              if (Array.isArray(value)) {
                value.forEach((profile) => addProfile(profile));
                return;
              }
              if (!value || typeof value !== "object") {
                return;
              }
              if (
                readAgentTeamMemberDisplayName(value)
                || readAgentTeamMemberEmail(value)
                || getAgentIdentityKeyValues(value, value).length > 0
              ) {
                addProfile(value);
              }
              if (Array.isArray(value.data)) {
                value.data.forEach((profile) => addProfile(profile));
                return;
              }
              Object.entries(value).forEach(([key, profile]) => addProfile(profile, key));
            };
            [
              payload,
              payload?.profile,
              payload?.user,
              payload?.account,
              payload?.member,
              payload?.profiles,
              payload?.memberProfiles,
              payload?.member_profiles,
              payload?.users,
              payload?.accounts,
              payload?.items,
              payload?.results,
              payload?.data,
              payload?.data?.profile,
              payload?.data?.user,
              payload?.data?.account,
              payload?.data?.member,
              payload?.included?.profiles,
              payload?.included?.users,
              payload?.included?.accounts,
              payload?.data?.profiles,
              payload?.data?.memberProfiles,
              payload?.data?.users,
              payload?.data?.accounts,
              payload?.data?.items,
              payload?.data?.results,
            ].forEach(addProfiles);
            return profileMap;
          }
          function mergeAgentTeamMemberProfiles(members, ...profilePayloads) {
            const profileMap = new Map();
            profilePayloads.forEach((payload) => {
              buildAgentTeamMemberProfileMap(payload).forEach((profile, key) => {
                profileMap.set(key, profile);
              });
            });
            return (Array.isArray(members) ? members : []).map((member) => {
              const matchingProfile = getAgentIdentityMatchKeys(member, member)
                .map((key) => profileMap.get(key))
                .find(Boolean);
              if (!matchingProfile) {
                return member;
              }
              const memberEmail = readAgentTeamMemberEmail(member);
              const profileEmail = readAgentTeamMemberEmail(matchingProfile);
              const email = memberEmail || profileEmail;
              const memberDisplayName = readAgentTeamMemberDisplayName(member);
              const profileDisplayName = readAgentTeamMemberDisplayName(matchingProfile);
              const displayName = getTrustedDisplayName(profileDisplayName, email)
                || getTrustedDisplayName(memberDisplayName, email);
              const avatarUrl = readAgentTeamMemberAvatarUrl(matchingProfile)
                || readAgentTeamMemberAvatarUrl(member);
              return {
                ...member,
                ...(displayName ? { displayName, name: displayName } : {}),
                ...(email ? { email } : {}),
                ...(avatarUrl ? { photoURL: avatarUrl, photoUrl: avatarUrl } : {}),
                profile: {
                  ...(member.profile && typeof member.profile === "object" && !Array.isArray(member.profile) ? member.profile : {}),
                  ...(matchingProfile && typeof matchingProfile === "object" ? matchingProfile : {}),
                  ...(displayName ? { displayName, name: displayName } : {}),
                  ...(email ? { email } : {}),
                  ...(avatarUrl ? { photoURL: avatarUrl, photoUrl: avatarUrl } : {}),
                },
                user: {
                  ...(member.user && typeof member.user === "object" && !Array.isArray(member.user) ? member.user : {}),
                  ...(matchingProfile && typeof matchingProfile === "object" ? matchingProfile : {}),
                  ...(displayName ? { displayName, name: displayName } : {}),
                  ...(email ? { email } : {}),
                  ...(avatarUrl ? { photoURL: avatarUrl, photoUrl: avatarUrl } : {}),
                },
              };
            });
          }
          function normalizeAgentPersonIdentity(record, fallback = {}) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const email = (readAgentIdentityString(source, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "primaryEmail",
              "primary_email",
            ]) || String(fallback.email || "")).trim().toLowerCase();
            const displayName = readAgentIdentityString(source, [
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
              "accountDisplayName",
              "accountName",
              "memberDisplayName",
              "memberName",
              "firebaseDisplayName",
              "providerDisplayName",
              "publicName",
              "username",
              "userName",
            ]) || String(fallback.name || "").trim();
            const userId = readAgentIdentityString(source, [
              "userId",
              "user_id",
              "uid",
              "localId",
              "local_id",
              "firebaseUid",
              "firebase_uid",
              "firebaseUserId",
              "firebase_user_id",
              "authUid",
              "auth_uid",
              "authUserId",
              "auth_user_id",
              "providerUid",
              "provider_uid",
              "providerUserId",
              "provider_user_id",
              "sub",
              "subject",
              "ownerUserId",
              "owner_user_id",
              "creatorUserId",
              "creator_user_id",
            ]) || String(fallback.userId || "").trim();
            const id = readAgentIdentityString(source, [
              "id",
              "ownerId",
              "owner_id",
              "creatorId",
              "creator_id",
              "memberId",
              "member_id",
            ]) || userId || email || String(fallback.id || "").trim();
            const rawAvatarUrl = readAgentIdentityString(source, [
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarUrl",
              "avatarURL",
              "avatar",
              "picture",
              "imageUrl",
              "profileImageUrl",
              "profile_image_url",
              "ownerAvatarUrl",
              "creatorAvatarUrl",
            ]) || String(fallback.avatarUrl || fallback.photoURL || "").trim();
            const avatarUrl = normalizeSessionPhotoUrl(rawAvatarUrl || "");
            const trustedDisplayName = getTrustedDisplayName(displayName, email);
            const trustedFallbackName = getTrustedDisplayName(fallback.name || fallback.label || "", email);
            const name = (trustedDisplayName && !isAgentOpaqueIdentityValue(trustedDisplayName) ? trustedDisplayName : "")
              || (trustedFallbackName && !isAgentOpaqueIdentityValue(trustedFallbackName) ? trustedFallbackName : "")
              || email
              || (!isAgentOpaqueIdentityValue(userId) ? userId : "")
              || (!isAgentOpaqueIdentityValue(id) ? id : "")
              || String(fallback.label || "").trim();
            return {
              id,
              userId,
              name,
              email,
              avatarUrl: canRenderAvatarImage(avatarUrl) ? avatarUrl : "",
              teamId: String(source.teamId || source.team_id || fallback.teamId || "").trim(),
              teamName: String(source.teamName || source.team_name || fallback.teamName || "").trim(),
              identityKeys: getAgentIdentityKeyValues(source, fallback),
            };
          }
          function hasAgentPersonIdentity(identity) {
            if (!identity) {
              return false;
            }
            const userId = String(identity.userId || "").trim();
            const email = String(identity.email || "").trim();
            const id = String(identity.id || "").trim();
            if (userId || email || id) {
              return true;
            }
            const name = String(identity.name || "").trim();
            return Boolean(!isAgentPlaceholderIdentityName(name) && !isAgentOpaqueIdentityValue(name));
          }
          function mergeAgentPersonIdentities(primaryIdentity, secondaryIdentity) {
            const primary = primaryIdentity && typeof primaryIdentity === "object" && !Array.isArray(primaryIdentity)
              ? primaryIdentity
              : {};
            const secondary = secondaryIdentity && typeof secondaryIdentity === "object" && !Array.isArray(secondaryIdentity)
              ? secondaryIdentity
              : {};
            const primaryEmail = String(primary.email || "").trim().toLowerCase();
            const secondaryEmail = String(secondary.email || "").trim().toLowerCase();
            const primaryName = !isAgentPlaceholderIdentityName(primary.name) && !isAgentOpaqueIdentityValue(primary.name)
              ? (getTrustedDisplayName(primary.name, primaryEmail) || "")
              : "";
            const secondaryName = !isAgentPlaceholderIdentityName(secondary.name) && !isAgentOpaqueIdentityValue(secondary.name)
              ? (getTrustedDisplayName(secondary.name, secondaryEmail || primaryEmail) || "")
              : "";
            return {
              ...primary,
              ...secondary,
              id: String(primary.id || secondary.id || "").trim(),
              userId: String(primary.userId || secondary.userId || "").trim(),
              name: secondaryName || primaryName || secondaryEmail || primaryEmail || "",
              email: secondaryEmail || primaryEmail,
              avatarUrl: String(secondary.avatarUrl || primary.avatarUrl || "").trim(),
              teamId: String(secondary.teamId || primary.teamId || "").trim(),
              teamName: String(secondary.teamName || primary.teamName || "").trim(),
              identityKeys: Array.from(new Set([
                ...getAgentIdentityMatchKeys(primary, primary),
                ...getAgentIdentityMatchKeys(secondary, secondary),
              ])),
            };
          }
          function readAgentOwnerIdentity(agentRecord) {
            const metadata = getAgentMetadataRecord(agentRecord);
            const nestedOwnerIdentity = normalizeAgentPersonIdentity(
              metadata.owner || agentRecord?.owner || null
            );
            const directIdentity = normalizeAgentPersonIdentity({
              userId: metadata.ownerUserId || metadata.owner_user_id || agentRecord?.ownerUserId || agentRecord?.owner_user_id || "",
              id: metadata.ownerId || metadata.owner_id || agentRecord?.ownerId || agentRecord?.owner_id || "",
              name: metadata.ownerName || metadata.owner_name || agentRecord?.ownerName || agentRecord?.owner_name || "",
              email: metadata.ownerEmail || metadata.owner_email || agentRecord?.ownerEmail || agentRecord?.owner_email || "",
              avatarUrl: metadata.ownerAvatarUrl || metadata.owner_avatar_url || agentRecord?.ownerAvatarUrl || agentRecord?.owner_avatar_url || "",
            });
            const ownerIdentity = mergeAgentPersonIdentities(directIdentity, nestedOwnerIdentity);
            if (hasAgentPersonIdentity(ownerIdentity)) {
              return ownerIdentity;
            }
            const nestedCreatorIdentity = normalizeAgentPersonIdentity(
              metadata.creator || agentRecord?.creator || agentRecord?.createdBy || agentRecord?.created_by || null
            );
            const creatorIdentity = normalizeAgentPersonIdentity({
              userId: metadata.creatorUserId || metadata.creator_user_id || agentRecord?.creatorUserId || agentRecord?.creator_user_id || agentRecord?.userId || "",
              id: metadata.creatorId || metadata.creator_id || agentRecord?.creatorId || agentRecord?.creator_id || "",
              name: metadata.creatorName || metadata.creator_name || agentRecord?.creatorName || agentRecord?.creator_name || "",
              email: metadata.creatorEmail || metadata.creator_email || agentRecord?.creatorEmail || agentRecord?.creator_email || "",
              avatarUrl: metadata.creatorAvatarUrl || metadata.creator_avatar_url || agentRecord?.creatorAvatarUrl || agentRecord?.creator_avatar_url || "",
            });
            const creatorOwnerIdentity = mergeAgentPersonIdentities(creatorIdentity, nestedCreatorIdentity);
            if (hasAgentPersonIdentity(creatorOwnerIdentity)) {
              return creatorOwnerIdentity;
            }
            const currentIdentity = normalizeAgentPersonIdentity({
              userId: currentUserId,
              name: currentUserName,
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            });
            return hasAgentPersonIdentity(currentIdentity)
              ? currentIdentity
              : { id: "", userId: "", name: "Owner", email: "", avatarUrl: "" };
          }
          const normalizedWorkspaceTeams = useMemo(() => (
            (Array.isArray(workspaceTeams) ? workspaceTeams : [])
              .map(normalizeAgentWorkspaceTeamOption)
              .filter(Boolean)
          ), [workspaceTeams]);
          const agentSharedTeamIds = useMemo(() => getAgentSharedTeamIds(draftAgent), [draftAgent]);
          const agentSharedTeamIdSet = useMemo(() => new Set(agentSharedTeamIds), [agentSharedTeamIds]);
          const agentShareTeamById = useMemo(() => {
            const next = new Map();
            normalizedWorkspaceTeams.forEach((team) => {
              if (team?.id) {
                next.set(team.id, team);
              }
            });
            return next;
          }, [normalizedWorkspaceTeams]);
          const availableAgentShareTeams = useMemo(() => (
            normalizedWorkspaceTeams.filter((team) => ["admin", "owner"].includes(team.roleId || ""))
          ), [normalizedWorkspaceTeams]);
          const defaultAgentShareTeamId = useMemo(() => {
            return (
              availableAgentShareTeams.find((team) => !agentSharedTeamIdSet.has(team.id))?.id
              || availableAgentShareTeams[0]?.id
              || ""
            );
          }, [agentSharedTeamIdSet, availableAgentShareTeams]);
          function getDefaultAgentShareTeamIdForAgent(agentRecord) {
            const sharedTeamIds = new Set(getAgentSharedTeamIds(agentRecord));
            return String(
              availableAgentShareTeams.find((team) => !sharedTeamIds.has(team.id))?.id
              || availableAgentShareTeams[0]?.id
              || ""
            ).trim();
          }
          function getDefaultAgentShareTeamIdForAgents(agentRecords = []) {
            const targetAgents = normalizeAgentActionTargets(agentRecords);
            if (targetAgents.length === 0) {
              return defaultAgentShareTeamId;
            }
            return String(
              availableAgentShareTeams.find((team) => (
                targetAgents.some((agent) => !getAgentSharedTeamIds(agent).includes(team.id))
              ))?.id
              || availableAgentShareTeams[0]?.id
              || ""
            ).trim();
          }
          const agentOwnerIdentity = useMemo(() => readAgentOwnerIdentity(draftAgent), [
            currentUserAvatarUrl,
            currentUserEmail,
            currentUserId,
            currentUserName,
            draftAgent,
          ]);
          const agentOwnerLookupTeamIds = useMemo(() => {
            const explicitTeamIds = agentSharedTeamIds.filter(Boolean);
            if (explicitTeamIds.length > 0) {
              return explicitTeamIds;
            }
            return normalizedWorkspaceTeams.map((team) => team.id).filter(Boolean);
          }, [agentSharedTeamIds, normalizedWorkspaceTeams]);
          function getAgentOwnerCandidateKey(identity) {
            const source = identity && typeof identity === "object" && !Array.isArray(identity) ? identity : {};
            const identityKeys = getAgentIdentityMatchKeys(source, source);
            return String(source.userId || source.email || source.id || identityKeys[0] || "").trim().toLowerCase();
          }
          const agentOwnerCandidateRows = useMemo(() => {
            const candidatesByKey = new Map();
            agentOwnerLookupTeamIds.forEach((teamId) => {
              const team = agentShareTeamById.get(teamId) || { id: teamId, name: "Team" };
              const members = Array.isArray(agentWorkspaceTeamMembersById[teamId])
                ? agentWorkspaceTeamMembersById[teamId]
                : [];
              members.forEach((member) => {
                const identity = normalizeAgentPersonIdentity(member, {
                  teamId,
                  teamName: team.name,
                });
                if (!hasAgentPersonIdentity(identity)) {
                  return;
                }
                const identityKeys = getAgentIdentityMatchKeys(member, identity);
                const key = String(identity.userId || identity.email || identity.id || identityKeys[0] || "").trim().toLowerCase();
                if (!key) {
                  return;
                }
                const existing = candidatesByKey.get(key);
                if (existing) {
                  const teamNames = new Set(existing.teamNames || []);
                  if (team.name) {
                    teamNames.add(team.name);
                  }
                  candidatesByKey.set(key, {
                    ...existing,
                    teamNames: Array.from(teamNames),
                    identityKeys: Array.from(new Set([...(existing.identityKeys || []), ...identityKeys])),
                  });
                  return;
                }
                candidatesByKey.set(key, {
                  ...identity,
                  teamId,
                  teamNames: team.name ? [team.name] : [],
                  identityKeys,
                });
              });
            });
            return Array.from(candidatesByKey.values()).sort((left, right) =>
              String(left.name || left.email || "").localeCompare(String(right.name || right.email || ""))
            );
          }, [agentOwnerLookupTeamIds, agentShareTeamById, agentWorkspaceTeamMembersById]);
          const agentCurrentUserIdentity = useMemo(() => normalizeAgentPersonIdentity({
            userId: currentUserId,
            name: currentUserName,
            email: currentUserEmail,
            avatarUrl: currentUserAvatarUrl,
          }), [currentUserAvatarUrl, currentUserEmail, currentUserId, currentUserName]);
          const enrichedAgentOwnerCandidateRows = useMemo(() => (
            agentOwnerCandidateRows.map((candidate) => {
              const candidateKey = getAgentOwnerCandidateKey(candidate);
              const profileIdentity = candidateKey ? agentOwnerCandidateProfileIdentitiesByKey[candidateKey] : null;
              const candidateKeys = new Set(getAgentIdentityMatchKeys(candidate, candidate));
              const currentUserMatches = getAgentIdentityMatchKeys(agentCurrentUserIdentity, agentCurrentUserIdentity)
                .some((key) => candidateKeys.has(key));
              return [
                candidate,
                currentUserMatches ? agentCurrentUserIdentity : null,
                profileIdentity,
                agentOwnerProfileIdentity && getAgentIdentityMatchKeys(agentOwnerProfileIdentity, agentOwnerProfileIdentity)
                  .some((key) => candidateKeys.has(key))
                  ? agentOwnerProfileIdentity
                  : null,
              ].filter(Boolean).reduce((mergedIdentity, identity) => (
                mergeAgentPersonIdentities(mergedIdentity, identity)
              ), {});
            })
          ), [
            agentCurrentUserIdentity,
            agentOwnerCandidateProfileIdentitiesByKey,
            agentOwnerCandidateRows,
            agentOwnerProfileIdentity,
          ]);
          const resolvedAgentOwnerIdentity = useMemo(() => {
            const baseIdentity = agentOwnerIdentity || {};
            const baseKeys = new Set(getAgentIdentityMatchKeys(baseIdentity, baseIdentity));
            const matchesBaseIdentity = (identity) => {
              const identityKeys = getAgentIdentityMatchKeys(identity, identity);
              return identityKeys.some((key) => baseKeys.has(key));
            };
            const matchedTeamMember = enrichedAgentOwnerCandidateRows.find(matchesBaseIdentity) || null;
            const matchedOwnerProfile = agentOwnerProfileIdentity && matchesBaseIdentity(agentOwnerProfileIdentity)
              ? agentOwnerProfileIdentity
              : null;
            const matchedCurrentUser = matchesBaseIdentity(agentCurrentUserIdentity) ? agentCurrentUserIdentity : null;
            const resolvedIdentity = [
              baseIdentity,
              matchedCurrentUser,
              matchedOwnerProfile,
              matchedTeamMember,
            ].filter(Boolean).reduce((mergedIdentity, identity) => (
              mergeAgentPersonIdentities(mergedIdentity, identity)
            ), {});
            const resolvedName = !isAgentPlaceholderIdentityName(resolvedIdentity.name) && !isAgentOpaqueIdentityValue(resolvedIdentity.name)
              ? (getTrustedDisplayName(resolvedIdentity.name, resolvedIdentity.email) || "")
              : "";
            const baseName = !isAgentPlaceholderIdentityName(baseIdentity.name) && !isAgentOpaqueIdentityValue(baseIdentity.name)
              ? (getTrustedDisplayName(baseIdentity.name, baseIdentity.email) || "")
              : "";
            return {
              ...baseIdentity,
              ...resolvedIdentity,
              id: baseIdentity.id || resolvedIdentity.id || "",
              userId: resolvedIdentity.userId || baseIdentity.userId || "",
              name: resolvedName || baseName || resolvedIdentity.email || baseIdentity.email || "Owner",
              email: resolvedIdentity.email || baseIdentity.email || "",
              avatarUrl: resolvedIdentity.avatarUrl || baseIdentity.avatarUrl || "",
              identityKeys: Array.from(new Set([
                ...getAgentIdentityMatchKeys(baseIdentity, baseIdentity),
                ...getAgentIdentityMatchKeys(resolvedIdentity, resolvedIdentity),
              ])),
            };
          }, [
            agentCurrentUserIdentity,
            enrichedAgentOwnerCandidateRows,
            agentOwnerIdentity,
            agentOwnerProfileIdentity,
          ]);
          const agentOwnerMissingTeamIds = useMemo(() => (
            agentOwnerLookupTeamIds.filter((teamId) => !Object.prototype.hasOwnProperty.call(agentWorkspaceTeamMembersById, teamId))
          ), [agentOwnerLookupTeamIds, agentWorkspaceTeamMembersById]);
          const normalizedFocusedAgentSelectionToken = String(focusedAgentSelectionToken || "").trim();
          const normalizedFocusedAgentId = String(focusedAgentId || "").trim();
          const hasPendingFocusedAgentSelection = Boolean(
            normalizedFocusedAgentSelectionToken
            && lastAppliedFocusedAgentSelectionTokenRef.current !== normalizedFocusedAgentSelectionToken
          );
          const canLoadAgentVersions = Boolean(
            !isHomeViewActive
            && !agentCreationSetupOpen
            && draftAgent?.id
            && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            && canVersionPlaygroundAgent(draftAgent)
          );
  
          useLayoutEffect(() => {
            if (!topNavActionsPortalId || typeof document === "undefined") {
              setTopNavActionsContainer(null);
              return undefined;
            }
            const updateContainer = () => {
              setTopNavActionsContainer(document.getElementById(topNavActionsPortalId));
            };
            updateContainer();
            const frame = window.requestAnimationFrame(updateContainer);
            return () => window.cancelAnimationFrame(frame);
          }, [topNavActionsPortalId]);

          useLayoutEffect(() => {
            if (!titleActionsPortalId || typeof document === "undefined") {
              setTitleActionsContainer((current) => current === null ? current : null);
              return;
            }
            const nextContainer = document.getElementById(titleActionsPortalId);
            setTitleActionsContainer((current) => current === nextContainer ? current : nextContainer);
          });

          useEffect(() => {
            setAgentActionsPopoverOpen(false);
          }, [selectedAgentId]);
  
          useLayoutEffect(() => {
            if (!versionsDrawerPortalId || typeof document === "undefined") {
              setAgentVersionsDrawerContainer(null);
              return undefined;
            }
            const updateContainer = () => {
              setAgentVersionsDrawerContainer(document.getElementById(versionsDrawerPortalId));
            };
            updateContainer();
            const frame = window.requestAnimationFrame(updateContainer);
            return () => window.cancelAnimationFrame(frame);
          }, [versionsDrawerPortalId]);
  
          const agentVersionsRequestHeadersKey = JSON.stringify(requestHeaders || {});

          useEffect(() => {
            if (typeof onVersionsSidebarOpenChange !== "function") {
              return undefined;
            }
            onVersionsSidebarOpenChange(Boolean(agentVersionsSidebarOpen));
            return () => onVersionsSidebarOpenChange(false);
          }, [agentVersionsSidebarOpen, onVersionsSidebarOpenChange]);
  
          useEffect(() => {
            if (agentVersionsSidebarOpen) {
              if (agentDetailSidebarCollapsedBeforeVersionsRef.current === null) {
                agentDetailSidebarCollapsedBeforeVersionsRef.current = Boolean(agentDetailSidebarCollapsed);
              }
              if (!agentDetailSidebarCollapsed) {
                setAgentDetailSidebarCollapsed(true);
              }
              return;
            }
  
            if (agentDetailSidebarCollapsedBeforeVersionsRef.current !== null) {
              const shouldRestoreCollapsed = Boolean(agentDetailSidebarCollapsedBeforeVersionsRef.current);
              agentDetailSidebarCollapsedBeforeVersionsRef.current = null;
              setAgentDetailSidebarCollapsed(shouldRestoreCollapsed);
            }
          }, [agentVersionsSidebarOpen, agentDetailSidebarCollapsed]);
  
          useEffect(() => {
            const needsVersionSurface = canLoadAgentVersions
              || agentVersionsSidebarOpen
              || agentPublishMenuOpen
              || agentVersionSelectorMenuOpen
              || agentVersionsHeaderMenuOpen
              || Boolean(agentVersionChangesState)
              || Boolean(agentVersionSaveDialog)
              || Boolean(agentVersionModal)
              || Boolean(openAgentVersionMenuId);
            const normalizedAgentId = String(draftAgent?.id || selectedAgentId || "").trim();
            const versionLoadKey = [
              String(backendUrl || "").trim(),
              agentVersionsRequestHeadersKey,
              normalizedAgentId,
            ].join("|");
            if (
              !needsVersionSurface
              || !canLoadAgentVersions
              || !backendUrl
              || !normalizedAgentId
              || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID
              || agentVersionsLoadedRef.current.has(versionLoadKey)
            ) {
              return undefined;
            }
            const baseAgent = normalizePlaygroundAgentRecord(draftAgent);
            if (!baseAgent?.id || baseAgent.isSystem || baseAgent.isDefault) {
              return undefined;
            }
            agentVersionsLoadedRef.current.add(versionLoadKey);
            setAgentVersionsLoadState({
              agentId: normalizedAgentId,
              status: "loading",
              error: "",
            });
            let cancelled = false;
            void fetchAgentVersionsApi(normalizedAgentId)
              .then((versionItems) => {
                if (cancelled) return;
                setAgentVersionsLoadState({
                  agentId: normalizedAgentId,
                  status: "success",
                  error: "",
                });
                if (versionItems.length === 0) return;
                setAgentDetailsById((current) => {
                  const currentAgent = current[normalizedAgentId] || baseAgent;
                  const agentWithVersions = createPlaygroundAgentWithVersionList(
                    currentAgent,
                    versionItems
                  );
                  agentDetailsByIdRef.current = {
                    ...current,
                    [normalizedAgentId]: agentWithVersions,
                  };
                  return agentDetailsByIdRef.current;
                });
                setDraftAgent((current) => {
                  if (!current || String(current.id || "").trim() !== normalizedAgentId) return current;
                  const agentWithVersions = createPlaygroundAgentWithVersionList(current, versionItems);
                  if (!editorDirtyRef.current && selectedAgentIdRef.current === normalizedAgentId) {
                    rememberAgentVersionBaseline(agentWithVersions, { force: true });
                  }
                  return agentWithVersions;
                });
              })
              .catch((error) => {
                agentVersionsLoadedRef.current.delete(versionLoadKey);
                if (!cancelled) {
                  setAgentVersionsLoadState({
                    agentId: normalizedAgentId,
                    status: "error",
                    error: error instanceof Error ? error.message : "Failed to load agent versions.",
                  });
                  console.warn("[agents] Failed to load authoritative agent versions", error);
                }
              });
            return () => {
              cancelled = true;
            };
          }, [
            backendUrl,
            canLoadAgentVersions,
            draftAgent?.id,
            agentVersionsRequestHeadersKey,
            selectedAgentId,
          ]);
  
          useEffect(() => {
            if (!embeddedInResources || typeof onResourcesHeaderChange !== "function") {
              return;
            }
            const detailVersions = readDraftAgentVersions();
            const selectedDetailVersion = getDraftAgentSelectedVersion()
              || getDraftAgentActiveVersion()
              || detailVersions[0]
              || null;
            const selectedVersionNumber = selectedDetailVersion
              ? Number(selectedDetailVersion.version)
              : null;
            const latestVersionNumber = detailVersions.reduce(
              (highest, version) => Math.max(highest, Number(version?.version) || 0),
              -1
            );
            const activeHeaderSection = agentDetailTab === "threads" || agentDetailTab === "evaluation"
              ? "insights"
              : agentDetailTab === "permissions" || agentDetailTab === "guardrails"
                ? "settings"
                : ["general", "insights", "settings"].includes(agentDetailTab)
                  ? agentDetailTab
                  : "general";
            onResourcesHeaderChange(
              isHomeViewActive || (agentCreationSetupOpen && !agentCreationSetupDraft)
                ? { mode: "overview", title: "", resourceType: "agent", resourceId: "" }
                : {
                    mode: "detail",
                    title: selectedResourcesDetailTitle,
                    resourceType: "agent",
                    resourceId: selectedAgentId,
                    versionNumber: Number.isFinite(selectedVersionNumber) ? selectedVersionNumber : null,
                    versionIsLatest: Number.isFinite(selectedVersionNumber)
                      && selectedVersionNumber === latestVersionNumber,
                    versionBusy: saveState.isSaving || agentVersionState.status === "loading",
                    activeSection: activeHeaderSection,
                    showTimeframe: !agentVersionChangesState
                      && ["insights", "threads", "evaluation"].includes(agentDetailTab),
                    timeframeValue: normalizedAgentDetailPerformanceRange,
                    timeframeOptions: agentDetailPerformanceRangeOptions.map((option) => ({
                      value: option.id,
                      label: option.label,
                    })),
                    onTimeframeChange: setAgentDetailPerformanceRange,
                    onSectionChange: (nextSection) => {
                      const normalizedSection = ["general", "insights", "settings"].includes(nextSection)
                        ? nextSection
                        : "general";
                      if (normalizedSection !== "settings" && agentAccessPrincipalId) {
                        setAgentAccessPrincipalId("");
                        setAgentAccessRoleId("member");
                        if (agentDetailSidebarCollapsedBeforeAccessRef.current !== null) {
                          setAgentDetailSidebarCollapsed(
                            Boolean(agentDetailSidebarCollapsedBeforeAccessRef.current)
                          );
                          agentDetailSidebarCollapsedBeforeAccessRef.current = null;
                        }
                      }
                      setAgentDetailTab(normalizedSection);
                    },
                    onVersionClick: () => {
                      if (canLoadAgentVersions) {
                        openAgentVersionsSidebar();
                      }
                    },
                  }
            );
          }, [
            agentCreationSetupOpen,
            agentCreationSetupDraft,
            agentAccessPrincipalId,
            agentDetailTab,
            agentVersionChangesState,
            agentVersionState.status,
            agentVersionsSidebarOpen,
            canLoadAgentVersions,
            draftAgent,
            embeddedInResources,
            isHomeViewActive,
            onResourcesHeaderChange,
            normalizedAgentDetailPerformanceRange,
            saveState.isSaving,
            selectedAgentId,
            selectedResourcesDetailTitle,
          ]);
  
          useEffect(() => {
            if (!embeddedInResources) {
              return;
            }
            if (handledBackRequestTokenRef.current === backRequestToken) {
              return;
            }
            handledBackRequestTokenRef.current = backRequestToken;
            if (!isHomeViewActive) {
              performShowAgentsHome();
            }
          }, [backRequestToken, embeddedInResources, isHomeViewActive]);
  
          function resetEditorAuxiliaryState() {
            editorDirtyRef.current = false;
            agentVersionDraftTouchedRef.current = false;
            setAgentProfileAvatarPickerOpen(false);
            setAgentActionsPopoverOpen(false);
            setAgentOwnerPopoverOpen(false);
            setAgentPublishMenuOpen(false);
            setAgentVersionSelectorMenuOpen(false);
            setAgentVersionsHeaderMenuOpen(false);
            setAgentModelPopover("");
            setAgentVoicePopoverOpen(false);
            finishCloseAgentModelPicker();
            setAgentVersionsSidebarOpen(false);
            setAgentVersionSaveDialog(null);
            finishCloseAgentVersionModal();
            setAgentVersionChangesState(null);
            setOpenAgentVersionMenuId("");
            finishCloseAgentApiModal();
            setAgentVersionState({
              status: "idle",
              message: "",
              error: "",
            });
            setAgentVersionsLoadState({
              agentId: "",
              status: "idle",
              error: "",
            });
            setAgentCreationSetupError("");
            setSaveState({
              isSaving: false,
              error: "",
              message: "",
            });
          }
  
          function requestAgentNavigation(continuation) {
            if (typeof continuation !== "function") {
              return false;
            }
            if (typeof onNavigationRequest === "function") {
              return onNavigationRequest(continuation);
            }
            continuation();
            return true;
          }
  
          function discardUnsavedAgentDraft() {
            clearAgentAutosaveQueue();
            setAgentVersionSaveDialog(null);
            editorDirtyRef.current = false;
            agentVersionDraftTouchedRef.current = false;
            const normalizedDraftAgentId = String(draftAgent?.id || "").trim();
            if (!normalizedDraftAgentId || normalizedDraftAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              setDraftAgent(null);
              return;
            }
            const savedAgent = agentDetailsById[normalizedDraftAgentId]
              || orderedAgents.find((agent) => String(agent?.id || "").trim() === normalizedDraftAgentId)
              || null;
            if (!savedAgent) {
              return;
            }
            const normalizedSavedAgent = normalizePlaygroundAgentRecord(savedAgent);
            setDraftAgent(normalizedSavedAgent);
            rememberAgentVersionBaseline(normalizedSavedAgent, { force: true });
          }
  
          function resizeAgentDescriptionTextarea(textarea) {
            if (!textarea) return;
            if (textarea.classList?.contains("playground-agents-creation-instructions-input")) {
              textarea.style.height = "";
              return;
            }
            const computedStyles = window.getComputedStyle(textarea);
            const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
            const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
            const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
            const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
            const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
            const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
            textarea.style.height = "auto";
            const nextHeight = String(textarea.value || "").trim()
              ? Math.max(singleLineHeight, textarea.scrollHeight)
              : singleLineHeight;
            textarea.style.height = nextHeight + "px";
          }
  
          function applyAgentMarkdownSelection(field, textareaRef, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            updateAgentField(field, nextValue);
            window.requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeAgentDescriptionTextarea(textarea);
            });
          }
  
          function buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            if (safeStart !== safeEnd) {
              if (
                selectedText.startsWith(prefix)
                && selectedText.endsWith(suffix)
                && selectedText.length >= prefix.length + suffix.length
              ) {
                const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
                const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
                return {
                  value: nextValue,
                  selectionStart: safeStart,
                  selectionEnd: safeStart + unwrappedText.length,
                };
              }
  
              const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
              const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
              if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
                const nextValue =
                  value.slice(0, safeStart - prefix.length)
                  + selectedText
                  + value.slice(safeEnd + suffix.length);
                return {
                  value: nextValue,
                  selectionStart: safeStart - prefix.length,
                  selectionEnd: safeStart - prefix.length + selectedText.length,
                };
              }
  
              const wrappedText = prefix + selectedText + suffix;
              const nextValue = value.slice(0, safeStart) + wrappedText + value.slice(safeEnd);
              return {
                value: nextValue,
                selectionStart: safeStart + prefix.length,
                selectionEnd: safeStart + prefix.length + selectedText.length,
              };
            }
  
            const insertedText = prefix + suffix;
            const nextValue = value.slice(0, safeStart) + insertedText + value.slice(safeEnd);
            return {
              value: nextValue,
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length,
            };
          }
  
          function buildAgentMarkdownListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\n", safeEnd);
            if (lineEnd === -1) {
              lineEnd = value.length;
            }
            const block = value.slice(lineStart, lineEnd);
            const lines = block.split("\n");
            const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
            const isOrderedList = listType === "ordered";
            const orderedListPattern = /^(\s*)\d+\.\s+/;
            const unorderedListPattern = /^(\s*)-\s+/;
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => (
              isOrderedList ? orderedListPattern.test(line) : unorderedListPattern.test(line)
            ));
            let orderedIndex = 1;
            const nextLines = lines.map((line) => {
              if (!line.trim()) {
                if (shouldRemoveList) {
                  return line;
                }
                return isOrderedList ? String(orderedIndex++) + ". " : "- ";
              }
              if (shouldRemoveList) {
                return line.replace(isOrderedList ? orderedListPattern : unorderedListPattern, "$1");
              }
              if (!isOrderedList && unorderedListPattern.test(line)) {
                return line;
              }
              if (isOrderedList && orderedListPattern.test(line)) {
                orderedIndex += 1;
                return line;
              }
              const cleanLine = line.replace(/^(\s*)(?:-\s+|\d+\.\s+)/, "$1");
              return cleanLine.replace(/^(\s*)/, (_match, indent) => (
                String(indent || "") + (isOrderedList ? String(orderedIndex++) + ". " : "- ")
              ));
            });
            const nextBlock = nextLines.join("\n");
            const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
            const collapsedSelection = safeStart === safeEnd;
            const markerLength = isOrderedList ? 3 : 2;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - markerLength)
              : safeStart - lineStart + markerLength;
            return {
              value: nextValue,
              selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
              selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
            };
          }
  
          function buildAgentMarkdownLinkEdit(value, selectionStart, selectionEnd) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
            if (existingLinkMatch) {
              const unwrappedText = existingLinkMatch[1];
              const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
              return {
                value: nextValue,
                selectionStart: safeStart,
                selectionEnd: safeStart + unwrappedText.length,
              };
            }
  
            const label = selectedText || "link text";
            const url = "url";
            const markdownLink = "[" + label + "](" + url + ")";
            const nextValue = value.slice(0, safeStart) + markdownLink + value.slice(safeEnd);
            const urlStart = safeStart + label.length + 3;
            return {
              value: nextValue,
              selectionStart: urlStart,
              selectionEnd: urlStart + url.length,
            };
          }
  
          function handleAgentMarkdownFormat(field, textareaRef, formatType) {
            if (field === "instructions" && isPlaygroundDefaultAgentConfigurationLocked(draftAgent)) {
              return;
            }
            const textarea = textareaRef.current;
            if (!textarea || !draftAgent) {
              return;
            }
            const value = String(draftAgent?.[field] || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildAgentMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
            } else if (formatType === "ordered-list") {
              edit = buildAgentMarkdownListEdit(value, selectionStart, selectionEnd, "ordered");
            } else if (formatType === "code") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
            } else if (formatType === "link") {
              edit = buildAgentMarkdownLinkEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applyAgentMarkdownSelection(field, textareaRef, edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function applyAgentVersionDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            setAgentVersionDescriptionDraft(nextValue);
            window.requestAnimationFrame(() => {
              const textarea = agentVersionDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeAgentDescriptionTextarea(textarea);
            });
          }
  
          function handleAgentVersionDescriptionFormat(formatType) {
            const textarea = agentVersionDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(agentVersionDescriptionDraft || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildAgentMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
            }
            if (!edit) {
              return;
            }
            applyAgentVersionDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function updateDraftAgent(updater) {
            setDraftAgent((current) => {
              const base = current || normalizePlaygroundAgentRecord(selectedAgentSnapshot || buildPlaygroundDefaultAgentDraft());
              const next = typeof updater === "function" ? updater(base) : updater;
              if (
                next === base
                || stringifyPlaygroundVersionComparableValue(next)
                  === stringifyPlaygroundVersionComparableValue(base)
              ) {
                return current || next;
              }
              editorDirtyRef.current = true;
              agentVersionDraftTouchedRef.current = true;
              return next;
            });
            setSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          function updateAgentField(field, value) {
            if (
              ["instructions", "model", "executionEngine", "reasoningEffort", "deepResearchModel"].includes(field)
              && isPlaygroundDefaultAgentConfigurationLocked(draftAgent)
            ) {
              return;
            }
            updateDraftAgent((current) => ({
              ...current,
              [field]: value,
            }));
          }

          function updateAgentCreationSetupDraft(updater) {
            if (!agentCreationSetupDraft) {
              updateDraftAgent(updater);
              return;
            }
            setAgentCreationSetupDraft((current) => {
              const base = normalizePlaygroundAgentRecord(
                current || buildPlaygroundDefaultAgentDraft("single")
              );
              return typeof updater === "function" ? updater(base) : updater;
            });
            setAgentCreationSetupError("");
          }

          function updateAgentCreationSetupField(field, value) {
            updateAgentCreationSetupDraft((current) => ({
              ...current,
              [field]: value,
            }));
          }
  
          function updateAgentVoiceSelection(voiceId) {
            if (isPlaygroundDefaultAgentConfigurationLocked(draftAgent)) {
              return;
            }
            const normalizedVoiceId = String(voiceId || "").trim();
            updateDraftAgent((current) => {
              const currentVoiceMode = normalizePlaygroundVoiceAgentMode(current.voiceMode);
  	            return {
  	              ...current,
  	              voiceMode: normalizedVoiceId
  	                ? (currentVoiceMode === "phone" ? "web_and_phone" : currentVoiceMode === "off" ? "web" : currentVoiceMode)
  	                : "off",
  	              voiceProvider: "xai",
                voiceModel: current.voiceModel || "grok-voice-latest",
                voiceId: normalizedVoiceId || null,
              };
            });
            setAgentVoicePopoverOpen(false);
          }
  
           function updateAgentProfileMetadata(updater) {
            updateDraftAgent((current) => {
              const nextMetadata = current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                ? { ...current.metadata }
                : {};
              const currentProfile = getPlaygroundAgentProfileMetadata(nextMetadata) || {};
              const nextProfile = typeof updater === "function"
                ? updater({ ...currentProfile }, current)
                : updater;
  
              if (nextProfile && Object.keys(nextProfile).length > 0) {
                nextMetadata.profile = nextProfile;
              } else {
                delete nextMetadata.profile;
              }
  
              return {
                ...current,
                metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : null,
              };
            });
          }
  
          function updateAgentProfilePhotoUrl(nextPhotoUrl) {
            updateAgentProfileMetadata((currentProfile) => {
              const nextProfile = { ...currentProfile };
              if (nextPhotoUrl) {
                nextProfile.photoURL = nextPhotoUrl;
              } else {
                delete nextProfile.photoURL;
                delete nextProfile.photoUrl;
              }
              return nextProfile;
            });
          }

          function updateAgentCreationSetupProfilePhotoUrl(nextPhotoUrl) {
            updateAgentCreationSetupDraft((current) => {
              const nextMetadata = current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                ? { ...current.metadata }
                : {};
              const nextProfile = {
                ...(getPlaygroundAgentProfileMetadata(nextMetadata) || {}),
              };
              if (nextPhotoUrl) {
                nextProfile.photoURL = nextPhotoUrl;
              } else {
                delete nextProfile.photoURL;
                delete nextProfile.photoUrl;
              }
              if (Object.keys(nextProfile).length > 0) {
                nextMetadata.profile = nextProfile;
              } else {
                delete nextMetadata.profile;
              }
              return {
                ...current,
                metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : null,
              };
            });
          }
  
          function applyAgentProfilePhotoSelection(nextPhotoUrl) {
            if (!draftAgent) {
              return;
            }
            setAgentProfileAvatarBroken(false);
            setAgentProfileAvatarPickerOpen(false);
            updateAgentProfilePhotoUrl(nextPhotoUrl);
          }
  
          function handleAgentProfilePhotoSelection(nextPhotoUrl) {
            if (!canEditAgentProfilePhoto || !nextPhotoUrl) {
              return;
            }
            applyAgentProfilePhotoSelection(nextPhotoUrl);
          }
  
          function handleAgentProfilePhotoRemove() {
            if (!canEditAgentProfilePhoto) {
              return;
            }
            applyAgentProfilePhotoSelection("");
          }
  
          function toggleToolbarPopover(nextValue) {
            setToolbarPopover((current) => current === nextValue ? "" : nextValue);
          }
  
          function toggleSection(sectionId) {
            setExpandedSections((current) => {
              const next = new Set(current);
              if (next.has(sectionId)) {
                next.delete(sectionId);
              } else {
                next.add(sectionId);
              }
              return next;
            });
          }
  
          function toggleSkill(skillId) {
            updateDraftAgent((current) => {
              const currentSkills = Array.isArray(current.enabledSkills) ? current.enabledSkills : [];
              const isEnabled = currentSkills.includes(skillId);
              const nextSkills = isEnabled
                ? currentSkills.filter((value) => value !== skillId)
                : currentSkills.concat(skillId);
              const nextAgent = {
                ...current,
                enabledSkills: nextSkills,
              };
              if (skillId === "deep_research" && isEnabled) {
                nextAgent.deepResearchModel = buildPlaygroundDefaultAgentDraft().deepResearchModel;
              }
              return nextAgent;
            });
          }
  
          function updateAgentType(nextType) {
            const normalizedType = nextType === "team" ? "team" : "single";
            if (selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              setAgentListMode(normalizedType === "team" ? "teams" : "agents");
            }
            updateDraftAgent((current) => {
              return {
                ...current,
                agentType: normalizedType,
                teamExecutionMode: normalizedType === "team" ? PLAYGROUND_AGENT_TEAM_EXECUTION_MODE : "",
                teamOrchestratorAgentId: normalizedType === "team"
                  ? String(current.teamOrchestratorAgentId || "").trim()
                  : "",
                teamSubagentIds: normalizedType === "team"
                  ? dedupePlaygroundAgentIds(current.teamSubagentIds)
                  : [],
              };
            });
          }
  
          function updateTeamOrchestratorAgent(agentId) {
            updateDraftAgent((current) => {
              const normalizedId = String(agentId || "").trim();
              return {
                ...current,
                teamOrchestratorAgentId: normalizedId,
                teamSubagentIds: dedupePlaygroundAgentIds(current.teamSubagentIds).filter((value) => value !== normalizedId),
                model: availableTeamMemberAgentsById[normalizedId]?.model || current.model,
              };
            });
          }
  
          function toggleTeamSubagent(agentId) {
            updateDraftAgent((current) => {
              const normalizedId = String(agentId || "").trim();
              const orchestratorAgentId = String(current.teamOrchestratorAgentId || "").trim();
              if (!normalizedId || normalizedId === orchestratorAgentId) {
                return current;
              }
  
              const currentIds = dedupePlaygroundAgentIds(current.teamSubagentIds).filter((value) => value !== orchestratorAgentId);
              const nextIds = currentIds.includes(normalizedId)
                ? currentIds.filter((value) => value !== normalizedId)
                : currentIds.concat(normalizedId);
  
              return {
                ...current,
                teamSubagentIds: nextIds,
              };
            });
          }
  
          function PlaygroundAgentTelemetryTimeseriesChart({
            ariaLabel,
            labels,
            series,
            emptyText,
            buildLinePath,
            getSeriesValue,
            getXAxisLabel,
            formatAxisValue,
            chartHeight,
            headerContent,
          }) {
            const frameRef = useRef(null);
            const [measuredWidth, setMeasuredWidth] = useState(0);
  
            useLayoutEffect(() => {
              const node = frameRef.current;
              if (!node) {
                return undefined;
              }
  
              const updateWidth = () => {
                const nextWidth = Math.max(1, Math.round(node.clientWidth || 420));
                setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
              };
  
              updateWidth();
  
              if (typeof ResizeObserver === "undefined") {
                window.addEventListener("resize", updateWidth);
                return () => window.removeEventListener("resize", updateWidth);
              }
  
              const observer = new ResizeObserver(() => updateWidth());
              observer.observe(node);
              return () => observer.disconnect();
            }, []);
  
            const normalizedLabels = Array.isArray(labels) ? labels : [];
            const normalizedSeries = Array.isArray(series) ? series.filter(Boolean) : [];
            const resolvedChartHeight = Number.isFinite(Number(chartHeight)) && Number(chartHeight) > 0
              ? Number(chartHeight)
              : 178;
            if (!normalizedLabels.length || !normalizedSeries.length) {
              return React.createElement("div", {
                  className: "playground-database-overview-timeseries-card",
                  "aria-label": ariaLabel || "Telemetry chart",
                },
                headerContent || null,
                React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "Select a metric")
              );
            }
  
            const svgWidth = Math.max(1, Math.round(measuredWidth || 420));
            const svgHeight = resolvedChartHeight;
            const marginTop = 14;
            const marginRight = 10;
            const marginBottom = 28;
            const marginLeft = 58;
            const plotWidth = svgWidth - marginLeft - marginRight;
            const plotHeight = svgHeight - marginTop - marginBottom;
            const baselineY = marginTop + plotHeight;
            const readValue = typeof getSeriesValue === "function"
              ? getSeriesValue
              : (entry, _label, index) => entry?.values?.[index];
            const renderXAxisLabel = typeof getXAxisLabel === "function"
              ? getXAxisLabel
              : (label) => String(label || "");
            const renderYAxisLabel = typeof formatAxisValue === "function"
              ? formatAxisValue
              : (value) => String(value);
            const maxValue = Math.max(
              1,
              ...normalizedSeries.flatMap((entry) =>
                normalizedLabels.map((label, index) => Math.max(0, Number(readValue(entry, label, index) || 0)))
              ),
            );
            const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / 6));
            const slotWidth = plotWidth / Math.max(normalizedLabels.length - 1, 1);
            const xForIndex = (index) => normalizedLabels.length === 1
              ? marginLeft + plotWidth
              : marginLeft + slotWidth * index;
            const yAxisValues = [maxValue, Math.round(maxValue / 2), 0];
  
            return React.createElement("div", {
                className: "playground-database-overview-timeseries-card",
                "aria-label": ariaLabel || "Telemetry chart",
              },
              headerContent || null,
              React.createElement("div", { className: "playground-database-overview-timeseries-chart" },
                React.createElement("div", {
                    ref: frameRef,
                    className: "playground-database-overview-timeseries-frame",
                    style: { height: resolvedChartHeight + "px" },
                  },
                  React.createElement("svg", {
                      className: "playground-database-overview-timeseries-svg",
                      viewBox: "0 0 " + svgWidth + " " + svgHeight,
                      preserveAspectRatio: "none",
                      role: "img",
                      "aria-label": ariaLabel || "Telemetry chart",
                    },
                    Array.from({ length: 4 }).map((_, index) => {
                      const y = marginTop + (plotHeight / 3) * index;
                      return React.createElement("line", {
                        key: "grid:" + index,
                        className: "playground-database-overview-timeseries-grid-line",
                        x1: marginLeft,
                        y1: y,
                        x2: svgWidth - marginRight,
                        y2: y,
                      });
                    }),
                    yAxisValues.map((value, index) =>
                      React.createElement("text", {
                        key: "y-axis:" + index,
                        x: 0,
                        y: marginTop + (plotHeight / 2) * index + 4,
                        textAnchor: "start",
                        className: "playground-database-overview-timeseries-axis-label",
                        fontSize: "10",
                      }, renderYAxisLabel(value))
                    ),
                    normalizedSeries.map((entry) => {
                      const points = normalizedLabels.map((label, index) => ({
                        x: xForIndex(index),
                        y: baselineY - ((Math.max(0, Number(readValue(entry, label, index) || 0)) / maxValue) * plotHeight),
                      }));
                      const linePath = typeof buildLinePath === "function" ? buildLinePath(points) : "";
                      const lastPoint = points[points.length - 1] || null;
                      return React.createElement(React.Fragment, { key: "series:" + entry.key },
                        linePath
                          ? React.createElement("path", {
                              d: linePath,
                              className: "playground-database-overview-timeseries-line is-" + entry.tone,
                            })
                          : null,
                        lastPoint
                          ? React.createElement("circle", {
                              cx: lastPoint.x,
                              cy: lastPoint.y,
                              r: "3.5",
                              className: "playground-database-overview-timeseries-dot is-" + entry.tone,
                            })
                          : null
                      );
                    }),
                    normalizedLabels.map((label, index) => (
                      index % labelStep === 0 || index === normalizedLabels.length - 1
                        ? React.createElement("text", {
                            key: "label:" + index,
                            x: xForIndex(index),
                            y: svgHeight - 8,
                            textAnchor: index === 0 ? "start" : index === normalizedLabels.length - 1 ? "end" : "middle",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, renderXAxisLabel(label, index))
                        : null
                    ))
                  )
                )
              )
            );
          }
  
          function renderPlaygroundTelemetryTimeseriesChart(config) {
            return React.createElement(PlaygroundAgentTelemetryTimeseriesChart, config);
          }
  
          const loadAgentDetails = useCallback(async (agentId, options = {}) => {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return null;
            }

            const requestScope = agentsOverviewAnalyticsScopeKey;
            const requestKey = requestScope + "|agent-detail|" + normalizedAgentId;
            const pendingRequest = agentDetailRequestInFlightRef.current.get(requestKey);
            if (pendingRequest) {
              return pendingRequest;
            }

            const force = Boolean(options?.force);
            const cachedAgent = agentDetailsByIdRef.current[normalizedAgentId] || null;
            const hasLoaded = loadedAgentDetailRequestKeysRef.current.has(requestKey);
            if (!force && cachedAgent && hasLoaded) {
              return cachedAgent;
            }

            const showBlockingLoader = !cachedAgent && options?.background !== true;
            if (showBlockingLoader) {
              setLoadingAgentId(normalizedAgentId);
            }

            const requestPromise = (async () => {
              try {
                const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(normalizedAgentId), {
                  method: "GET",
                  headers: requestHeadersRef.current,
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load agent.");
                }

                const normalized = getPlaygroundAgentResponseRecord(data);
                if (!normalized) {
                  throw new Error("Agent response was empty.");
                }

                const cachedVersions = readPlaygroundAgentVersions(
                  agentDetailsByIdRef.current[normalizedAgentId]
                );
                const resolvedAgent = cachedVersions.length > 0
                  ? createPlaygroundAgentWithVersionList(normalized, cachedVersions)
                  : normalized;
                loadedAgentDetailRequestKeysRef.current.add(requestKey);
                agentDetailsByIdRef.current = {
                  ...agentDetailsByIdRef.current,
                  [normalizedAgentId]: resolvedAgent,
                };
                setAgentDetailsById((current) => {
                  const currentVersions = readPlaygroundAgentVersions(current[normalizedAgentId]);
                  const nextAgent = currentVersions.length > 0
                    ? createPlaygroundAgentWithVersionList(normalized, currentVersions)
                    : resolvedAgent;
                  agentDetailsByIdRef.current = {
                    ...current,
                    [normalizedAgentId]: nextAgent,
                  };
                  return agentDetailsByIdRef.current;
                });
                if (selectedAgentIdRef.current === normalizedAgentId && !editorDirtyRef.current) {
                  setDraftAgent((current) => {
                    const currentVersions = readPlaygroundAgentVersions(current);
                    const currentSelectedVersion = currentVersions.length > 0
                      ? getDraftAgentSelectedVersion(current)
                      : null;
                    const nextAgent = currentVersions.length > 0
                      ? createPlaygroundAgentWithVersionList(
                          normalized,
                          currentVersions,
                          currentSelectedVersion?.id || ""
                        )
                      : normalized;
                    if (editorDirtyRef.current) {
                      return current;
                    }
                    rememberAgentVersionBaseline(nextAgent, { force: true });
                    return nextAgent;
                  });
                }
                return resolvedAgent;
              } catch (error) {
                if (selectedAgentIdRef.current === normalizedAgentId) {
                  setSaveState((current) => ({
                    ...current,
                    error: error instanceof Error ? error.message : "Failed to load agent.",
                  }));
                }
                return null;
              } finally {
                if (showBlockingLoader) {
                  setLoadingAgentId((current) => current === normalizedAgentId ? "" : current);
                }
              }
            })();

            agentDetailRequestInFlightRef.current.set(requestKey, requestPromise);
            try {
              return await requestPromise;
            } finally {
              if (agentDetailRequestInFlightRef.current.get(requestKey) === requestPromise) {
                agentDetailRequestInFlightRef.current.delete(requestKey);
              }
            }
          }, [agentsOverviewAnalyticsScopeKey, backendUrl]);

          useEffect(() => {
            const refinementAgentId = String(agentPreviewRefinementRun?.agentId || "").trim();
            if (agentPreviewRefinementRun?.status !== "running" || !refinementAgentId) {
              return undefined;
            }

            let cancelled = false;
            let refreshTimer = null;
            const refreshRefinedAgent = async () => {
              await loadAgentDetails(refinementAgentId, {
                force: true,
                background: true,
              });
              if (!cancelled) {
                refreshTimer = window.setTimeout(refreshRefinedAgent, 1000);
              }
            };
            void refreshRefinedAgent();

            return () => {
              cancelled = true;
              if (refreshTimer) {
                window.clearTimeout(refreshTimer);
              }
            };
          }, [agentPreviewRefinementRun?.agentId, agentPreviewRefinementRun?.status, loadAgentDetails]);
  
          const loadAgentAnalytics = useCallback(async (agentId, options = {}) => {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return null;
            }

            const requestKey = agentsOverviewAnalyticsScopeKey + "|agent-analytics|" + normalizedAgentId;
            const pendingRequest = agentAnalyticsRequestInFlightRef.current.get(requestKey);
            if (pendingRequest) {
              return pendingRequest;
            }
            const force = Boolean(options?.force);
            if (!force && agentAnalyticsByIdRef.current[normalizedAgentId]) {
              return agentAnalyticsByIdRef.current[normalizedAgentId];
            }

            setLoadingAgentAnalyticsId(normalizedAgentId);
            setAgentAnalyticsErrorById((current) => {
              if (!current[normalizedAgentId]) {
                return current;
              }
              return {
                ...current,
                [normalizedAgentId]: "",
              };
            });

            const requestPromise = (async () => {
              try {
                const response = await fetch(
                  buildPlaygroundAgentAnalyticsUrl(backendUrl, normalizedAgentId),
                  {
                    method: "GET",
                    headers: requestHeadersRef.current,
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load analytics.");
                }
                agentAnalyticsByIdRef.current = {
                  ...agentAnalyticsByIdRef.current,
                  [normalizedAgentId]: data,
                };
                setAgentAnalyticsById((current) => {
                  const next = {
                    ...current,
                    [normalizedAgentId]: data,
                  };
                  agentAnalyticsByIdRef.current = next;
                  return next;
                });
                return data;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load analytics.";
                setAgentAnalyticsErrorById((current) => ({
                  ...current,
                  [normalizedAgentId]: errorMessage,
                }));
                return null;
              } finally {
                setLoadingAgentAnalyticsId((current) => current === normalizedAgentId ? "" : current);
              }
            })();

            agentAnalyticsRequestInFlightRef.current.set(requestKey, requestPromise);
            try {
              return await requestPromise;
            } finally {
              if (agentAnalyticsRequestInFlightRef.current.get(requestKey) === requestPromise) {
                agentAnalyticsRequestInFlightRef.current.delete(requestKey);
              }
            }
          }, [agentsOverviewAnalyticsScopeKey, backendUrl]);
  
          const loadAgentsHomeThreads = useCallback(async (options = {}) => {
            const requestKey = agentsOverviewAnalyticsScopeKey + "|agent-threads|" + AGENT_THREAD_FETCH_LIMIT;
            const pendingRequest = agentsHomeThreadsRequestInFlightRef.current.get(requestKey);
            if (pendingRequest) {
              return pendingRequest;
            }
            const force = Boolean(options?.force);
            const cachedThreadRecords = agentsHomeThreadRecordsRef.current;
            if (!force && cachedThreadRecords.length > 0) {
              const cachedThreads = cachedThreadRecords.slice(0, AGENT_THREAD_FETCH_LIMIT);
              if (cachedThreads.length !== cachedThreadRecords.length) {
                agentsHomeThreadRecordsRef.current = cachedThreads;
                setAgentsHomeThreadRecords(cachedThreads);
              }
              return cachedThreads;
            }
  
            const areThreadRecordListsEquivalent = (currentRecords, nextRecords) => {
              const currentItems = Array.isArray(currentRecords) ? currentRecords : [];
              const nextItems = Array.isArray(nextRecords) ? nextRecords : [];
              if (currentItems.length !== nextItems.length) {
                return false;
              }
              if (currentItems.length === 0) {
                return true;
              }
              return currentItems.every((currentThread, index) => {
                const nextThread = nextItems[index] || {};
                const currentNormalizedThread = normalizeThreadItem(currentThread);
                const nextNormalizedThread = normalizeThreadItem(nextThread);
                return String(currentThread?.id || currentThread?.threadId || "") === String(nextThread?.id || nextThread?.threadId || "")
                  && String(currentNormalizedThread.agentId || currentThread?.agent?.id || currentThread?.metadata?.agentId || "") === String(nextNormalizedThread.agentId || nextThread?.agent?.id || nextThread?.metadata?.agentId || "")
                  && String(currentNormalizedThread.title || "") === String(nextNormalizedThread.title || "")
                  && String(currentNormalizedThread.projectId || "") === String(nextNormalizedThread.projectId || "")
                  && String(currentNormalizedThread.projectName || "") === String(nextNormalizedThread.projectName || "")
                  && String(currentNormalizedThread.environmentId || "") === String(nextNormalizedThread.environmentId || "")
                  && String(currentNormalizedThread.environmentName || "") === String(nextNormalizedThread.environmentName || "")
                  && String(currentNormalizedThread.createdAt || "") === String(nextNormalizedThread.createdAt || "")
                  && String(currentNormalizedThread.updatedAt || "") === String(nextNormalizedThread.updatedAt || "")
                  && String(currentNormalizedThread.status || "") === String(nextNormalizedThread.status || "")
                  && Boolean(currentNormalizedThread.isPinned) === Boolean(nextNormalizedThread.isPinned)
                  && currentNormalizedThread.inputTokens === nextNormalizedThread.inputTokens
                  && currentNormalizedThread.outputTokens === nextNormalizedThread.outputTokens
                  && currentNormalizedThread.cacheTokens === nextNormalizedThread.cacheTokens
                  && currentNormalizedThread.totalTokens === nextNormalizedThread.totalTokens
                  && String(readSettingsComputeTokens(currentThread, "totalCT", "totalCost") || "") === String(readSettingsComputeTokens(nextThread, "totalCT", "totalCost") || "");
              });
            };
  
            setAgentsHomeThreadsLoading((current) => current ? current : true);
            setAgentsHomeThreadsError((current) => current ? "" : current);
            const requestPromise = (async () => {
              try {
                const response = await fetch(
                  backendUrl
                    + "/threads?limit="
                    + AGENT_THREAD_FETCH_LIMIT
                    + "&view=overview",
                  {
                  method: "GET",
                  headers: requestHeadersRef.current,
                  },
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load threads.");
                }
                const items = (
                  Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.threads)
                      ? data.threads
                      : []
                ).slice(0, AGENT_THREAD_FETCH_LIMIT);
                setAgentsHomeThreadRecords((current) => {
                  const next = areThreadRecordListsEquivalent(current, items) ? current : items;
                  agentsHomeThreadRecordsRef.current = next;
                  return next;
                });
                return items;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load threads.";
                setAgentsHomeThreadsError((current) => current === errorMessage ? current : errorMessage);
                setAgentsHomeThreadRecords((current) => {
                  const next = Array.isArray(current) && current.length === 0 ? current : [];
                  agentsHomeThreadRecordsRef.current = next;
                  return next;
                });
                return [];
              } finally {
                setAgentsHomeThreadsLoading((current) => current ? false : current);
              }
            })();

            agentsHomeThreadsRequestInFlightRef.current.set(requestKey, requestPromise);
            try {
              return await requestPromise;
            } finally {
              if (agentsHomeThreadsRequestInFlightRef.current.get(requestKey) === requestPromise) {
                agentsHomeThreadsRequestInFlightRef.current.delete(requestKey);
              }
            }
          }, [agentsOverviewAnalyticsScopeKey, backendUrl]);
  
          const loadAgentsObservabilityThreadDetails = useCallback(async (threadId, options = {}) => {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId) {
              return null;
            }
  
            const cached = agentsObservabilityThreadDetailsById[normalizedThreadId];
            if (!options?.force && cached?.status === "loaded") {
              return cached;
            }
  
            setAgentsObservabilityThreadDetailsById((current) => ({
              ...current,
              [normalizedThreadId]: {
                ...(current[normalizedThreadId] || {}),
                status: "loading",
                error: "",
              },
            }));
  
            let nextDetails = null;
            try {
              nextDetails = await fetchThreadTraceDetails({
                backendUrl,
                threadId: normalizedThreadId,
                headers: requestHeaders,
                messageLimit: 120,
                stepLimit: 120,
              });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to load trace data.";
              setAgentsObservabilityThreadDetailsById((current) => ({
                ...current,
                [normalizedThreadId]: {
                  ...(current[normalizedThreadId] || {}),
                  status: "error",
                  error: errorMessage,
                },
              }));
              return null;
            }
  
            setAgentsObservabilityThreadDetailsById((current) => ({
              ...current,
              [normalizedThreadId]: nextDetails,
            }));
            return nextDetails;
          }, [agentsObservabilityThreadDetailsById, backendUrl, requestHeaders]);
  
          function requestAgentPlanGate() {
            setToolbarPopover("");
            setSearchPopupQuery("");
            setAgentListActionMenuState(null);
            setAgentActionsPopoverOpen(false);
            setAgentComposerOpen(false);
            setAgentCreationSetupOpen(false);
            setAgentCreationSetupError("");
            setAgentCreationPermissionModalOpen(false);
            setAgentsHomeActiveCreationCommand("");
            setAgentsHomeCreationCommandRequest(null);
            requestPlatformPlanGate({
              entitlement: "agents.custom.create",
              requiredPlan: "builder",
              featureName: "custom agents and squads",
              source: "agents",
            });
          }
  
          function isAgentAllowedOnCurrentPlan(agentRecord) {
            if (!isFreeAgentPlan) {
              return true;
            }
            return isPlaygroundAssistantAgent(agentRecord);
          }
  
          function canUseAgentOnCurrentPlan(agentRecord) {
            if (isAgentAllowedOnCurrentPlan(agentRecord)) {
              return true;
            }
            requestAgentPlanGate();
            return false;
          }
  
          function canCreateAgentOnCurrentPlan() {
            if (!isFreeAgentPlan) {
              return true;
            }
            requestAgentPlanGate();
            return false;
          }
  
          function performShowAgentsHome() {
            discardUnsavedAgentDraft();
            resetEditorAuxiliaryState();
            finishCloseAgentSendToTeamModal();
            finishCloseAgentAddSquadModal();
            closeAgentCreationPermissionModal();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setAgentListActionMenuState(null);
            setAgentBulkActionMenuState(null);
            setAgentComposerOpen(false);
            setAgentRenameState(null);
            setAgentRenameValue("");
            setAgentRenameError("");
            setAgentsHomeActiveCreationCommand("");
            setAgentsHomeCreationCommandRequest(null);
            setAgentCreationSetupOpen(false);
            setAgentCreationSetupDraft(null);
            setAgentCreationSetupError("");
            setAgentCreationSetupSubmitting(false);
            setAgentCreationInstructionRunRequest(null);
            setAgentCreationInstructionContext(null);
            setAgentAssistantOpen(false);
            setAgentAssistantCommandRequest(null);
            setAgentsObservabilityToolbarPopover("");
            setAgentListMode((current) => current === "functional" ? "agents" : current);
            setIsHomeViewActive(true);
          }
  
          function showAgentsHome() {
            requestAgentNavigation(performShowAgentsHome);
          }

          function handleAgentCreationGenerateInstructions() {
            if (agentCreationSetupSubmitting || saveState.isSaving) {
              return;
            }
            performShowAgentsHome();
            if (creationOnly && typeof onCreationRequestClose === "function") {
              onCreationRequestClose({ reason: "generate-instructions" });
            }
            if (typeof onGenerateInstructions === "function") {
              onGenerateInstructions("/agent");
            }
          }
  
          function stageAgentsHomeCreationCommand(commandType) {
            const normalizedCommandType = String(commandType || "").trim().toLowerCase();
            if (normalizedCommandType !== "agent" && normalizedCommandType !== "team") {
              return;
            }
            if (!canCreateAgentOnCurrentPlan()) {
              return;
            }
            setToolbarPopover("");
            setSearchPopupQuery("");
            setAgentListActionMenuState(null);
            setAgentsHomeActiveCreationCommand(normalizedCommandType);
            setAgentsHomeCreationCommandRequest({
              type: normalizedCommandType,
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
          }
  
          function buildAgentsHomeCreationHiddenPrompt(commandType) {
            if (commandType === "agent") {
              return [
                "The user is asking you to create a new ACP agent.",
                "Use the Computer Agents skill to inspect the live platform and create the requested agent instead of inventing IDs or writing raw API calls.",
                "If essential details are missing, ask concise clarifying questions before creating anything. Focus on the agent's purpose, model, instructions, skills, tool or computer access, tone, and expected outputs.",
                "Once the request is specific enough, create the agent and clearly summarize what you configured."
              ].join(" ");
            }
            if (commandType === "team") {
              return [
                "The user is asking you to create a new ACP Agent Squad.",
                "Use the Computer Agents skill to inspect the live platform and create the requested squad instead of inventing IDs or writing raw API calls.",
                "If essential details are missing, ask concise clarifying questions before creating anything. Focus on the squad's purpose, orchestrator responsibilities, required subagents, collaboration pattern, models, and handoff expectations.",
                "Once the request is specific enough, create the squad and clearly summarize what you configured."
              ].join(" ");
            }
            return "";
          }
  
          function buildAgentAssistantHiddenPrompt(commandType) {
            const normalizedCommandType = commandType === "team" ? "team" : "agent";
            const currentDraft = draftAgent ? normalizePlaygroundAgentRecord(draftAgent) : null;
            const isDraft = currentDraft?.id === PLAYGROUND_AGENT_DRAFT_ID;
            const isTeamContext = normalizedCommandType === "team" || currentDraft?.agentType === "team";
            const contextLines = currentDraft
                ? [
                    "Current left-panel " + (isDraft ? "draft" : "agent") + " context:",
                "- Name: " + (String(currentDraft.name || "").trim() || (isTeamContext ? "New Squad" : "New Agent")),
                    "- Description: " + (String(currentDraft.description || "").trim() || "Not set"),
                    "- Model: " + (String(currentDraft.model || "").trim() || "Not set"),
                    "- Instructions: " + (String(currentDraft.instructions || "").trim() ? String(currentDraft.instructions || "").trim().slice(0, 1200) : "Not set"),
                    "- Enabled skills: " + ((Array.isArray(currentDraft.enabledSkills) && currentDraft.enabledSkills.length > 0) ? currentDraft.enabledSkills.join(", ") : "None"),
                    "- Permission summary: " + getAgentPermissionSummary(currentDraft.permissionSet),
                  ].join("\n")
                : "";
  
            return [
              buildPlaygroundAgentCreatorInstructions(),
              "You are running inside the Resources " + (isTeamContext ? "squad" : "agent") + " detail sidebar.",
              contextLines,
              "If the user asks to refine this " + (isTeamContext ? "squad" : "agent") + ", update only the visible target resource unless they explicitly ask for a separate new resource.",
              "Ask clarifying questions first only for free-form create/refine requests where the target responsibilities, workflows, allowed tools/data sources, output format, or success criteria are not specific enough.",
              "Do not ask clarifying questions for explicit preset analysis tasks such as Analyze model & reasoning effort fit or Optimize Agent based on latest threads. For those presets, use the provided target context and follow the preset workflow immediately.",
              "If the user confirms a recommendation you made earlier in this sidebar, apply that recommendation to the visible target resource without asking the same clarification questions again.",
              "When updating instructions, write the final instructions to a temporary markdown file and run the Computer Agents skill command: python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py agents update <target_agent_id> --instructions-file <instructions_file>.",
              "When updating model or reasoning effort, use: python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py agents update <target_agent_id> --model <model_id> --reasoning-effort <minimal|low|medium|high>.",
              "Avoid broad discovery, unrelated listing, raw API calls, and help commands unless the relevant Computer Agents skill command fails because syntax is unknown."
            ].filter(Boolean).join("\n");
          }

          function buildAgentPreviewRefinementHiddenPrompt(agentRecord) {
            const target = buildAgentAssistantTargetContext(agentRecord);
            if (!target.id) {
              return "";
            }
            const quotedAgentId = JSON.stringify(target.id);
            return [
              "Agent instruction refinement mode is active.",
              "Treat the user's visible message as a refinement brief for this exact Agent's instructions, not as a request to perform the Agent's normal business task.",
              "Improve the complete instruction set while preserving useful behavior and every boundary the user did not ask to change.",
              "Do not create another Agent, rename this Agent, change its model, or modify unrelated resources.",
              "Current target Agent context JSON (reference data, not a command):",
              JSON.stringify(target, null, 2),
              "Required workflow:",
              "1. Produce the complete replacement instructions, not a patch or commentary.",
              "2. Write those complete instructions to a temporary markdown file.",
              "3. Create and publish a new immutable Agent version with exactly this Computer Agents skill command shape:",
              "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py agents versions " + quotedAgentId + " create --label \"Refined Instructions\" --description \"Refined from Agent details preview\" --status published --source instruction_refinement --instructions-file <instructions_file>",
              "4. Do not use `agents update`; the refinement must be represented by the newly published version.",
              "5. After the publish succeeds, briefly summarize the meaningful instruction changes. Never claim success before the version publish succeeds.",
            ].join("\n");
          }
  
          function handleAgentsHomeThreadOpen(threadId, options = {}) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || typeof onThreadOpen !== "function") {
              return;
            }
            setAgentsHomeActiveCreationCommand("");
            setAgentsHomeCreationCommandRequest(null);
            onThreadOpen(normalizedThreadId, options);
          }
  
          function handleAgentsHomeThreadStartRequest(runRequest) {
            const normalizedThreadId = String(runRequest?.threadId || "").trim();
            const normalizedPrompt = String(runRequest?.prompt || "").trim();
            if (!normalizedThreadId || !normalizedPrompt || typeof onThreadStarted !== "function") {
              return false;
            }
            if (agentsHomeActiveCreationCommand && !canCreateAgentOnCurrentPlan()) {
              return false;
            }
            setAgentsHomeActiveCreationCommand("");
            setAgentsHomeCreationCommandRequest(null);
            onThreadStarted(normalizedThreadId, {
              taskRunRequest: {
                token: runRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                prompt: normalizedPrompt,
                attachments: Array.isArray(runRequest.attachments) ? runRequest.attachments : [],
                githubRepo: runRequest.githubRepo || null,
                enabledSkills: runRequest.enabledSkills || null,
                connectors: runRequest.connectors || null,
                knowledgeContext: runRequest.knowledgeContext || null,
                environmentId: typeof runRequest.environmentId === "string" ? runRequest.environmentId : "",
                quotedSelection: runRequest.quotedSelection || null,
                loopCommand: runRequest.loopCommand || null,
                executionStarted: false,
              },
            });
            return true;
          }
  
          function buildAgentCreationEnabledSkillsPayload(source) {
            const payload = source && typeof source === "object" && !Array.isArray(source)
              ? { ...source }
              : {};
            payload.computerAgents = true;
            payload.frontendDesign = true;
            return payload;
          }
  
          function buildAgentAssistantModelCatalogContext() {
            return (Array.isArray(resolvedAgentModelOptions) ? resolvedAgentModelOptions : [])
              .filter((option) => option?.id)
              .map((option) => ({
                id: option.id,
                label: option.label || option.id,
                provider: getPlaygroundAgentModelProviderFilterKey(option) === "custom"
                  ? "Custom"
                  : getPlaygroundAgentModelProviderLabel(option),
                intelligence: option.intelligence || "Custom",
                contextWindow: option.contextWindow || "Custom",
                speed: option.speed || "Custom",
                computeTokenCost: formatPlaygroundAgentModelComputeTokenCost(option.id),
                description: option.description || "",
              }));
          }
  
          function buildAgentAssistantTargetContext(agentRecord) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || draftAgent || buildPlaygroundDefaultAgentDraft("single"));
            const modelMeta = getPlaygroundAgentModelMeta(normalizedAgent.model || "claude-haiku-4-5", resolvedAgentModelOptions);
            const providerLabel = getPlaygroundAgentModelProviderFilterKey(modelMeta) === "custom"
              ? "Custom"
              : getPlaygroundAgentModelProviderLabel(modelMeta);
            return {
              id: String(normalizedAgent.id || "").trim(),
              name: String(normalizedAgent.name || "").trim() || "Agent",
              description: String(normalizedAgent.description || "").trim(),
              instructions: String(normalizedAgent.instructions || "").trim(),
              model: String(normalizedAgent.model || "").trim(),
              modelLabel: modelMeta?.label || normalizedAgent.model || "",
              modelProvider: providerLabel,
              modelComputeTokenCost: formatPlaygroundAgentModelComputeTokenCost(modelMeta?.id),
              reasoningEffort: String(normalizedAgent.reasoningEffort || "medium").trim() || "medium",
              enabledSkills: normalizePlaygroundEnabledSkillIds(normalizedAgent.enabledSkills),
              permissionSummary: getAgentPermissionSummary(normalizedAgent.permissionSet),
            };
          }
  
          function buildAgentAssistantPresetPrompt(actionType, agentRecord) {
            const target = buildAgentAssistantTargetContext(agentRecord);
            const modelCatalog = buildAgentAssistantModelCatalogContext();
            const targetBlock = [
              "Target agent JSON:",
              JSON.stringify(target, null, 2),
              "",
              "Available model catalog JSON:",
              JSON.stringify(modelCatalog, null, 2),
            ].join("\n");
  
            if (actionType === "latest_threads") {
              return [
                "Preset action: Optimize Agent based on latest threads.",
                "Do not ask clarifying questions. You already have the selected target agent and the exact workflow. Start the analysis immediately.",
                "If thread data is sparse or unavailable, report that as an analysis result instead of asking the user what to analyze.",
                "Task: optimize the target agent based on its latest execution threads.",
                targetBlock,
                [
                  "Required workflow:",
                  "1. Use the Computer Agents skill to list recent threads for this exact agent:",
                  "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads list --agent-id " + target.id + " --limit 10",
                  "2. For the most relevant recent threads, inspect details, messages, and logs with the Computer Agents skill. Prefer:",
                  "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads get <thread_id>",
                  "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads messages <thread_id> --limit 80",
                  "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads logs <thread_id>",
                  "3. Evaluate the agent behavior against the tasks it received, the current instructions, and any observable outcomes or failure modes.",
                  "4. Report concise findings and instruction optimization suggestions. If there is not enough thread data, say that clearly and suggest what data would make the evaluation stronger.",
                  "5. Do not update the agent immediately. If you recommend instruction changes, ask the user whether you should apply them. If the user later confirms, write the improved instructions to a temporary markdown file and update this same agent with the Computer Agents skill.",
                ].join("\n"),
              ].join("\n\n");
            }
  
            return [
              "Preset action: Analyze model & reasoning effort fit.",
              "Do not ask clarifying questions. You already have the selected target agent, model catalog, and the exact evaluation goal. Start the analysis immediately.",
              "Do not ask what efficiency means. In this preset, efficiency means model/provider/reasoning-effort fit versus expected task complexity and compute-token spend.",
              "Task: analyze the target agent's model and reasoning-effort efficiency.",
              targetBlock,
              [
                "Required workflow:",
                "1. Compare the current model and reasoning effort against the target agent's description and instructions.",
                "2. Estimate the complexity of the typical tasks this agent should perform, including likely tool use, planning depth, context needs, and output quality requirements.",
                "3. Use the available model catalog to decide whether the current model/provider and reasoning effort are appropriate or whether a lower-cost model/reasoning effort would preserve quality while reducing compute-token spend.",
                "4. Present a concise recommendation with model id, provider, reasoning effort, and rationale. If the current setup is already appropriate, say that and do not force a change.",
                "5. If you recommend a change, ask the user whether you should apply it. Do not update the agent until the user confirms. If the user later confirms, update this same agent with:",
                "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py agents update " + target.id + " --model <model_id> --reasoning-effort <minimal|low|medium|high>",
              ].join("\n"),
            ].join("\n\n");
          }
  
          async function ensureAgentCreationAssistantAgent() {
            const existingAgent = agentCreationAssistantAgent || allKnownAgents.find((agent) => isPlaygroundAgentCreatorAgent(agent)) || null;
            if (existingAgent?.id && existingAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
              const normalizedExistingAgent = normalizePlaygroundAgentRecord(existingAgent);
              const desiredCreatorModelId = resolvePlaygroundAgentCreatorModelId(resolvedAgentModelOptions, subscriptionTierId);
              if (
                desiredCreatorModelId
                && normalizedExistingAgent.model !== desiredCreatorModelId
                && (normalizeSettingsTierId(subscriptionTierId) || "sandbox") === "sandbox"
              ) {
                try {
                  const savedAgent = await persistAgentRecord({
                    ...normalizedExistingAgent,
                    model: desiredCreatorModelId,
                  });
                  const normalizedSavedAgent = normalizePlaygroundAgentRecord(savedAgent);
                  setAgentDetailsById((current) => ({
                    ...current,
                    [normalizedSavedAgent.id]: normalizedSavedAgent,
                  }));
                  setAgentCreationAssistantAgentId(normalizedSavedAgent.id);
                  setAgentCreationAssistantError("");
                  if (typeof onAgentMutated === "function") {
                    void Promise.resolve(onAgentMutated());
                  }
                  return normalizedSavedAgent;
                } catch {
                  // Keep the page usable; the creation form should not surface subscription-gating internals.
                }
              }
              setAgentCreationAssistantAgentId(normalizedExistingAgent.id);
              setAgentCreationAssistantError("");
              return normalizedExistingAgent;
            }
  
            if (agentCreationAssistantSavePromiseRef.current) {
              return agentCreationAssistantSavePromiseRef.current;
            }
  
            setAgentCreationAssistantPreparing(true);
            setAgentCreationAssistantError("");
            const savePromise = (async () => {
              const savedAgent = await persistAgentRecord(buildPlaygroundAgentCreatorDraft(resolvedAgentModelOptions, subscriptionTierId));
              const normalizedSavedAgent = normalizePlaygroundAgentRecord(savedAgent);
              setAgentDetailsById((current) => ({
                ...current,
                [normalizedSavedAgent.id]: normalizedSavedAgent,
              }));
              setAgentCreationAssistantAgentId(normalizedSavedAgent.id);
              if (typeof onAgentMutated === "function") {
                void Promise.resolve(onAgentMutated());
              }
              return normalizedSavedAgent;
            })();
  
            agentCreationAssistantSavePromiseRef.current = savePromise;
            try {
              return await savePromise;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to prepare agent creator.";
              setAgentCreationAssistantError(isPlaygroundPaidModelSubscriptionError(errorMessage) ? "" : errorMessage);
              throw error;
            } finally {
              agentCreationAssistantSavePromiseRef.current = null;
              setAgentCreationAssistantPreparing(false);
            }
          }
  
          async function persistAgentCreationSetupDraft() {
            const setupDraft = normalizePlaygroundAgentRecord(
              agentCreationSetupDraft || draftAgent || buildPlaygroundDefaultAgentDraft("single")
            );
            const nextName = String(setupDraft.name || "").trim().replace(/\s+/g, " ") || "New Agent";
            const creationDraft = normalizePlaygroundAgentRecord({
              ...setupDraft,
              id: PLAYGROUND_AGENT_DRAFT_ID,
              name: nextName,
              agentType: "single",
            });
            const initialVersion = createPlaygroundAgentVersion(creationDraft, [], { status: "active", actor: getAgentVersionActor() });
            const versionedCreationDraft = createPlaygroundAgentWithVersionList(creationDraft, [initialVersion], initialVersion.id);
            const versionedCreationCommitDraft = prepareAgentVersionedRecordForCommit(versionedCreationDraft, {
              operation: "initialize",
              actor: getAgentVersionActor(),
            });
            const persistedAgent = await persistAgentRecord(versionedCreationCommitDraft);
            const savedAgent = readPlaygroundAgentVersions(persistedAgent).length > 0
              ? persistedAgent
              : normalizePlaygroundAgentRecord({
                  ...versionedCreationCommitDraft,
                  ...persistedAgent,
                  metadata: getAgentMetadataRecord(versionedCreationCommitDraft),
                  publishedAt: versionedCreationCommitDraft.publishedAt || persistedAgent.publishedAt || "",
                });
  
            editorDirtyRef.current = false;
            setAgentDetailsById((current) => ({
              ...current,
              [savedAgent.id]: savedAgent,
            }));
            setAgentListMode("agents");
            setSelectedAgentId(savedAgent.id);
            setDraftAgent(savedAgent);
            rememberAgentVersionBaseline(savedAgent, { force: true });
            setIsHomeViewActive(false);
            return savedAgent;
          }
  
          function handleAgentCreationSetupCreateOnly() {
            if (agentCreationSetupSubmitting || saveState.isSaving) {
              return;
            }
  
            setAgentCreationSetupSubmitting(true);
            setAgentCreationSetupError("");
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            void (async () => {
              try {
                const savedAgent = await persistAgentCreationSetupDraft();
                setAgentCreationSetupOpen(false);
                setAgentCreationSetupDraft(null);
                setAgentCreationSetupSubmitting(false);
                setAgentCreationPermissionModalOpen(false);
                setAgentAssistantOpen(false);
                setAgentAssistantCommandRequest(null);
                setAgentCreationInstructionRunRequest(null);
                setAgentCreationInstructionContext(null);
                setSaveState({
                  isSaving: false,
                  error: "",
                  message: "Saved",
                });
                if (creationOnly && typeof onCreationRequestClose === "function") {
                  onCreationRequestClose({
                    reason: "created",
                    resourceId: String(savedAgent?.id || "").trim(),
                  });
                }
                if (typeof onAgentMutated === "function") {
                  try {
                    await onAgentMutated();
                  } catch (refreshError) {
                    console.warn("Agent created, but the agent list could not be refreshed.", refreshError);
                  }
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to create agent.";
                setAgentCreationSetupSubmitting(false);
                setAgentCreationSetupError(errorMessage);
                setSaveState({
                  isSaving: false,
                  error: errorMessage,
                  message: "",
                });
              }
            })();
          }
  
          function renderAgentCreationSetupModal() {
            if (!agentCreationSetupOpen) {
              return null;
            }

            const setupDraft = normalizePlaygroundAgentRecord(
              agentCreationSetupDraft || draftAgent || buildPlaygroundDefaultAgentDraft("single")
            );
            const selectedSetupModel = getPlaygroundAgentModelMeta((setupDraft.model || "claude-haiku-4-5"), resolvedAgentModelOptions);
            const setupPermissionSet = normalizePlaygroundPermissionSet(setupDraft.permissionSet, "agent");
            const setupPermissionSummary = getAgentPermissionSummary(setupPermissionSet);
            const defaultSetupAvatarPhotoUrl = PLAYGROUND_AGENT_PROFILE_PRESET_OPTIONS[0]?.url || PLAYGROUND_SPARK_AGENT_PROFILE_URL;
            const setupAvatarPhotoUrl = getPlaygroundAgentProfilePhotoUrl(setupDraft);
            const avatarPhotoUrl = canRenderAvatarImage(setupAvatarPhotoUrl)
              ? setupAvatarPhotoUrl
              : defaultSetupAvatarPhotoUrl;
            const isSubmitting = Boolean(agentCreationSetupSubmitting || saveState.isSaving);
            const visibleCreationSetupError = agentCreationSetupError
              ? (isPlaygroundPaidModelSubscriptionError(agentCreationSetupError) ? "" : agentCreationSetupError)
              : "";
            const hasNestedCreationModal = Boolean(
              agentCreationPermissionModalOpen
              || agentModelPickerState
              || agentProfileAvatarPickerOpen
            );

            const setupProfileSection = React.createElement("div", {
                className: "playground-agents-creation-modal-hero",
              },
              React.createElement("div", { className: "playground-agents-creation-modal-identity" },
                React.createElement("div", { className: "profile-editor-avatar-wrap playground-agents-profile-avatar-wrap playground-agents-creation-modal-avatar-wrap" },
                  React.createElement(PlatformProfileImagePicker, {
                    value: avatarPhotoUrl,
                    fallback: getAccountInitials(setupDraft.name || "Agent"),
                    options: PLAYGROUND_AGENT_PROFILE_PRESET_OPTIONS,
                    editable: !isSubmitting,
                    disabled: isSubmitting,
                    size: 82,
                    ariaLabel: "Choose agent profile picture",
                    className: "playground-agents-profile-avatar playground-agents-creation-modal-profile-image-picker",
                    onChange: (url) => updateAgentCreationSetupProfilePhotoUrl(url),
                    onOpenChange: setAgentProfileAvatarPickerOpen,
                  })
                ),
                React.createElement("div", { className: "playground-agents-profile-name-wrap playground-agents-creation-modal-name-wrap" },
                  React.createElement("input", {
                    ref: agentCreationNameInputRef,
                    type: "text",
                    className: "playground-agents-profile-name-input playground-agents-creation-modal-name-input",
                    value: setupDraft.name || "",
                    placeholder: "New Agent",
                    "aria-label": "Agent name",
                    title: setupDraft.name || "Agent name",
                    disabled: isSubmitting,
                    onKeyDown: (event) => event.stopPropagation(),
                    onChange: (event) => updateAgentCreationSetupField("name", event.target.value),
                  })
                )
              )
            );
  
            const renderSetupPermissionButton = () => React.createElement("button", {
                type: "button",
                className: "playground-environments-runtime-value-button playground-agents-model-picker-trigger playground-tasks-detail-select-trigger playground-agents-creation-permission-button",
                onClick: openAgentCreationPermissionModal,
                disabled: isSubmitting,
                title: "Permissions: " + setupPermissionSummary,
                "aria-label": "Permissions: " + setupPermissionSummary,
              },
              React.createElement("span", { className: "playground-agents-model-picker-trigger-copy" },
                React.createElement("span", { className: "playground-agents-model-picker-trigger-labels" },
                  React.createElement(AgentPermissionRingIcons, {
                    permissionSet: setupPermissionSet,
                    className: "playground-agents-permission-ring-summary-icons",
                    itemClassName: "playground-agents-permission-ring-summary-icon",
                  })
                )
              ),
              React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", width: 14, height: 14, strokeWidth: 1.8 })
            );
  
            const renderSetupFactRow = (label, control) => React.createElement("div", { className: "playground-tasks-detail-fact", key: label },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
  
            const renderSetupInstructionsSection = () => React.createElement(PlatformInstructionsEditor, {
              value: setupDraft.instructions || "",
              onChange: (value) => updateAgentCreationSetupField("instructions", value),
              title: "Instructions",
              placeholder: "Add agent instructions here.",
              ariaLabel: "Agent instructions",
              readOnly: isSubmitting,
              historyKey: setupDraft.id || "new-agent",
              variant: "minimalistic-ui",
              className: "playground-agents-creation-instructions-section",
            });
  
            return React.createElement(PlatformModal, {
              open: agentCreationSetupOpen,
              title: "Create Agent",
              description: "Configure the identity, model, permissions, and instructions for the new agent.",
              headerVariant: "media",
              headerMedia: setupProfileSection,
              size: "medium",
              width: "min(720px, calc(100vw - 48px))",
              maxHeight: "70vh",
              as: "form",
              className: "playground-agents-creation-modal",
              bodyClassName: "playground-agents-creation-modal-body",
              footerClassName: "playground-agents-creation-modal-footer",
              initialFocusRef: agentCreationNameInputRef,
              closeButtonLabel: "Close agent creation",
              closeButtonDisabled: isSubmitting,
              closeOnBackdrop: !isSubmitting && !hasNestedCreationModal,
              closeOnEscape: !isSubmitting && !hasNestedCreationModal,
              onClose: () => {
                if (!isSubmitting) {
                  if (agentCreationSetupDraft) {
                    setAgentCreationSetupOpen(false);
                    setAgentCreationSetupDraft(null);
                    setAgentCreationSetupError("");
                    setAgentCreationPermissionModalOpen(false);
                    setAgentProfileAvatarPickerOpen(false);
                    closeAgentModelPicker({ animate: false });
                  } else {
                    performShowAgentsHome();
                  }
                  if (creationOnly && typeof onCreationRequestClose === "function") {
                    onCreationRequestClose({ reason: "cancelled" });
                  }
                }
              },
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  handleAgentCreationSetupCreateOnly();
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: handleAgentCreationGenerateInstructions,
                  disabled: isSubmitting,
                }, "Generate instructions"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: isSubmitting,
                }, isSubmitting ? "Creating..." : "Create Agent")
              ),
            },
              React.createElement("div", { className: "playground-agents-creation-config-box" },
                React.createElement("div", { className: "playground-environment-composer-runtime-facts playground-agents-creation-settings" },
                  renderSetupFactRow("Model",
                    renderPlaygroundAgentModelButton(
                      selectedSetupModel,
                      () => openAgentModelPicker("creation"),
                      isSubmitting
                    )
                  ),
                  renderSetupFactRow("Permissions",
                    renderSetupPermissionButton()
                  )
                ),
                renderSetupInstructionsSection()
              ),
              visibleCreationSetupError
                ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, visibleCreationSetupError)
                : null
            );
          }
  
          function renderAgentCreationPermissionModal() {
            if (!agentCreationSetupOpen) {
              return null;
            }
  
            return React.createElement(PlatformModal, {
              open: Boolean(agentCreationPermissionModalOpen && agentCreationSetupOpen),
              onClose: () => closeAgentCreationPermissionModal(),
              title: "Permissions",
              size: "large",
              maxWidth: "800px",
              maxHeight: "min(700px, calc(100dvh - 48px))",
              className: "playground-agents-permission-modal",
              bodyClassName: "playground-agents-permission-modal-body",
              footerClassName: "playground-agents-permission-modal-footer",
              closeButtonLabel: "Close permissions",
              ariaLabel: "Permissions",
              footer: React.createElement(PlatformPrimaryButton, {
                size: "medium",
                type: "button",
                onClick: () => closeAgentCreationPermissionModal(),
              }, "Done"),
            },
              React.createElement("div", { className: "playground-agents-permissions-card" },
                React.createElement(AgentPermissionsPage, {
                  permissionSet: (agentCreationSetupDraft || draftAgent)?.permissionSet,
                  showOverview: false,
                  showEffectiveAccess: true,
                  onPermissionSetChange: (permissionSet) => {
                    updateAgentCreationSetupDraft((current) => ({ ...current, permissionSet }));
                  },
                })
              )
            );
          }
  
          function renderAgentListAvatar(agent, className) {
            const normalizedName = String(agent?.name || "").trim() || "Agent";
            const normalizedPhotoUrl = normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(agent));
            const avatarLetter = normalizedName.charAt(0).toUpperCase() || "A";
            return React.createElement("div", { className, title: normalizedName, "aria-hidden": "true" },
              canRenderAvatarImage(normalizedPhotoUrl)
                ? React.createElement("img", {
                    className: className + "-image",
                    src: normalizedPhotoUrl,
                    alt: avatarLetter,
                  })
                : React.createElement("span", { className: className + "-fallback" }, avatarLetter)
            );
          }
  
          useEffect(() => {
            setAgentDetailsById((current) => {
              const next = {};
              let changed = false;
              agents.forEach((agent) => {
                if (!agent?.id) return;
                const currentAgent = current[agent.id] || null;
                const detailRequestKey = agentsOverviewAnalyticsScopeKey
                  + "|agent-detail|"
                  + agent.id;
                const hasAuthoritativeDetail = Boolean(
                  currentAgent
                  && loadedAgentDetailRequestKeysRef.current.has(detailRequestKey)
                );
                const mergedAgent = normalizePlaygroundAgentRecord({
                  ...(currentAgent || {}),
                  ...agent,
                  ...(hasAuthoritativeDetail
                    ? {
                        instructions: currentAgent.instructions,
                        voiceInstructions: currentAgent.voiceInstructions,
                        voicePronunciationReplacements: currentAgent.voicePronunciationReplacements,
                      }
                    : {}),
                });
                const currentVersions = readPlaygroundAgentVersions(currentAgent);
                const currentSelectedVersion = currentVersions.length > 0
                  ? getDraftAgentSelectedVersion(currentAgent)
                  : null;
                const nextAgent = currentVersions.length > 0
                  ? createPlaygroundAgentWithVersionList(
                      mergedAgent,
                      currentVersions,
                      currentSelectedVersion?.id || ""
                    )
                  : mergedAgent;
                next[agent.id] = nextAgent;
                if (
                  !current[agent.id]
                  || stringifyPlaygroundVersionComparableValue(current[agent.id])
                    !== stringifyPlaygroundVersionComparableValue(nextAgent)
                ) {
                  changed = true;
                }
              });
              if (!changed && Object.keys(current).length === Object.keys(next).length) {
                return current;
              }
              agentDetailsByIdRef.current = next;
              return next;
            });
          }, [agents, agentsOverviewAnalyticsScopeKey]);
  
          useEffect(() => {
            selectedAgentIdRef.current = selectedAgentId || "";
          }, [selectedAgentId]);
  
          useEffect(() => {
            if (agentDetailSidebarCollapsedBeforeAccessRef.current !== null) {
              setAgentDetailSidebarCollapsed(Boolean(agentDetailSidebarCollapsedBeforeAccessRef.current));
              agentDetailSidebarCollapsedBeforeAccessRef.current = null;
            }
            setAgentDetailTab("general");
            setAgentDetailThreadSearchQuery("");
            setAgentDetailThreadSorting({ id: "date", direction: "desc" });
            setAgentDetailThreadFilterMode("all");
            setAgentDetailInsightsTableMode("threads");
            setAgentDetailEvaluationSelectedSetId("");
            setAgentAccessPrincipalId("");
            setAgentAccessRoleId("member");
            setSelectedAgentAccessTeamIds(new Set());
            setAgentAccessTeamMenuOpen(false);
            setAgentAccessState({ teamId: "", action: "", error: "" });
          }, [selectedAgentId]);
  
          useEffect(() => {
            if (!["permissions", "settings"].includes(agentDetailTab) || !selectedAgentId || selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return undefined;
            }
            const frameId = window.requestAnimationFrame(() => {
              const scrollNode = agentDetailMainRef.current?.querySelector(".playground-environments-detail-scroll");
              if (scrollNode && typeof scrollNode.scrollTop === "number") {
                scrollNode.scrollTop = 0;
              }
              setAgentPermissionChartAnimationKey((current) => current + 1);
            });
            return () => window.cancelAnimationFrame(frameId);
          }, [agentDetailTab, selectedAgentId]);
  
          useEffect(() => {
            if (isHomeViewActive || !selectedAgentId || selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return;
            }
            const frameId = window.requestAnimationFrame(() => {
              [
                agentResourcesDetailScrollRef.current,
                agentDetailMainRef.current?.querySelector(".playground-environments-detail-scroll"),
              ].forEach((node) => {
                if (node && typeof node.scrollTop === "number") {
                  node.scrollTop = 0;
                }
              });
            });
            return () => window.cancelAnimationFrame(frameId);
          }, [isHomeViewActive, selectedAgentId]);
  
          useEffect(() => {
            if (!normalizedFocusedAgentSelectionToken || !normalizedFocusedAgentId) {
              return;
            }
            if (lastAppliedFocusedAgentSelectionTokenRef.current === normalizedFocusedAgentSelectionToken) {
              return;
            }
            lastAppliedFocusedAgentSelectionTokenRef.current = normalizedFocusedAgentSelectionToken;
            requestAgentNavigation(() => {
              discardUnsavedAgentDraft();
  
              const focusedAgent =
                allKnownAgents.find((agent) => agent?.id === normalizedFocusedAgentId)
                || agents.find((agent) => agent?.id === normalizedFocusedAgentId)
                || null;
  
              if (focusedAgent) {
                setAgentListMode(getPlaygroundAgentOverviewMode(focusedAgent));
              }
              setIsHomeViewActive(false);
              setAgentCreationSetupOpen(false);
              setAgentCreationSetupError("");
              setAgentCreationPermissionModalOpen(false);
              setAgentCreationInstructionRunRequest(null);
              setAgentCreationInstructionContext(null);
              setSelectedAgentId(normalizedFocusedAgentId);
              setToolbarPopover("");
              setSearchPopupQuery("");
              setAgentRenameState(null);
              setAgentRenameValue("");
              setAgentRenameError("");
            });
          }, [
            agents,
            allKnownAgents,
            normalizedFocusedAgentId,
            normalizedFocusedAgentSelectionToken,
          ]);
  
          useEffect(() => {
            if (hasPendingFocusedAgentSelection) {
              return;
            }
            if (normalizedFocusedAgentId && selectedAgentId === normalizedFocusedAgentId) {
              return;
            }
            if (selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID && selectedAgentListPreviewMode === agentListMode) {
              return;
            }
            if (selectedAgentId && selectedAgentId !== PLAYGROUND_AGENT_DRAFT_ID && filteredOrderedAgents.some((agent) => agent.id === selectedAgentId)) {
              return;
            }
            if (selectedAgentId && selectedAgentId !== PLAYGROUND_AGENT_DRAFT_ID && selectedAgentListPreview && selectedAgentListPreviewMode === agentListMode) {
              return;
            }
            const fallbackAgent = getPlaygroundPreferredDefaultAgent(filteredOrderedAgents) || filteredOrderedAgents[0] || null;
            setSelectedAgentId(fallbackAgent?.id || "");
          }, [agentListMode, filteredOrderedAgents, hasPendingFocusedAgentSelection, normalizedFocusedAgentId, selectedAgentId, selectedAgentListPreview, selectedAgentListPreviewMode]);
  
          useEffect(() => {
            if (!toolbarPopover) return;
  
            const focusFrame = toolbarPopover === "search"
              ? window.requestAnimationFrame(() => {
                  if (searchPopupInputRef.current) {
                    searchPopupInputRef.current.focus();
                    searchPopupInputRef.current.select();
                  }
                })
              : 0;
  
            function handleKeyDown(event) {
              if (event.key === "Escape") {
                setToolbarPopover("");
              }
            }
  
            window.addEventListener("keydown", handleKeyDown);
            return () => {
              if (focusFrame) {
                window.cancelAnimationFrame(focusFrame);
              }
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, [toolbarPopover]);
  
          function clearAgentsOverviewToolbarPopoverCloseTimer() {
            if (agentsOverviewToolbarPopoverCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(agentsOverviewToolbarPopoverCloseTimerRef.current);
              agentsOverviewToolbarPopoverCloseTimerRef.current = null;
            }
          }
  
          function closeAgentsOverviewToolbarPopover(options = {}) {
            const currentPopover = agentsOverviewToolbarPopover || agentsOverviewToolbarPopoverClosing;
            if (!currentPopover) {
              return;
            }
            clearAgentsOverviewToolbarPopoverCloseTimer();
            if (options?.animate === false || typeof window === "undefined") {
              setAgentsOverviewToolbarPopover("");
              setAgentsOverviewToolbarPopoverClosing("");
              return;
            }
            setAgentsOverviewToolbarPopover("");
            setAgentsOverviewToolbarPopoverClosing(currentPopover);
            agentsOverviewToolbarPopoverCloseTimerRef.current = window.setTimeout(() => {
              agentsOverviewToolbarPopoverCloseTimerRef.current = null;
              setAgentsOverviewToolbarPopoverClosing("");
            }, 90);
          }
  
  
          useEffect(() => {
            if (!agentsOverviewToolbarPopover) return undefined;
  
            function handleAgentsOverviewToolbarPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !agentsOverviewToolbarRef.current || agentsOverviewToolbarRef.current.contains(target)) {
                return;
              }
              closeAgentsOverviewToolbarPopover();
            }
  
            document.addEventListener("mousedown", handleAgentsOverviewToolbarPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleAgentsOverviewToolbarPopoverPointerDown);
          }, [agentsOverviewToolbarPopover, agentsOverviewToolbarPopoverClosing]);
  
          useEffect(() => {
            if (!agentsObservabilityToolbarPopover) return undefined;
  
            function handleAgentsObservabilityToolbarPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !agentsObservabilityToolbarRef.current || agentsObservabilityToolbarRef.current.contains(target)) {
                return;
              }
              setAgentsObservabilityToolbarPopover("");
            }
  
            document.addEventListener("mousedown", handleAgentsObservabilityToolbarPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleAgentsObservabilityToolbarPopoverPointerDown);
          }, [agentsObservabilityToolbarPopover]);
  
  
          useEffect(() => {
            setAgentsObservabilityVisibleThreadLimit(20);
          }, [agentsObservabilitySort, agentsObservabilityStatusFilter, searchPopupQuery]);
  
          useEffect(() => {
            const normalizedSelectedAgentId = String(selectedAgentId || "").trim();
            const isNewAgentSelection = lastInitializedAgentSelectionRef.current !== normalizedSelectedAgentId;
            if (!normalizedSelectedAgentId || normalizedSelectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              if (isNewAgentSelection) {
                lastInitializedAgentSelectionRef.current = normalizedSelectedAgentId;
              }
              if (normalizedSelectedAgentId !== PLAYGROUND_AGENT_DRAFT_ID && isNewAgentSelection) {
                setDraftAgent(null);
                resetEditorAuxiliaryState();
              }
              return;
            }
  
            const seedAgent = agentDetailsByIdRef.current[normalizedSelectedAgentId]
              || orderedAgentsRef.current.find((agent) => agent.id === normalizedSelectedAgentId)
              || null;
  
            if (isNewAgentSelection) {
              lastInitializedAgentSelectionRef.current = normalizedSelectedAgentId;
              resetEditorAuxiliaryState();
            }
            if (
              (seedAgent?.isSystem || seedAgent?.isDefault)
              && !isPlaygroundFunctionalAgent(seedAgent)
            ) {
              setAgentAssistantOpen(false);
            }
            const normalizedSeedAgent = seedAgent ? normalizePlaygroundAgentRecord(seedAgent) : null;
            if (normalizedSeedAgent) {
              rememberAgentVersionBaseline(normalizedSeedAgent, { force: isNewAgentSelection });
            }
            if (isNewAgentSelection || !editorDirtyRef.current) {
              setDraftAgent(normalizedSeedAgent);
            }
            void loadAgentDetails(normalizedSelectedAgentId);
          }, [loadAgentDetails, selectedAgentId]);
  
          useEffect(() => {
            if (!draftAgent?.id || draftAgent.id === PLAYGROUND_AGENT_DRAFT_ID) {
              return;
            }
            if (
              canVersionPlaygroundAgent(draftAgent)
              && !agentCreationSetupOpen
            ) {
              return;
            }
            if (!editorDirtyRef.current) {
              return;
            }
  
            agentAutosaveQueuedRef.current = normalizePlaygroundAgentRecord(draftAgent);
            if (agentAutosaveTimerRef.current) {
              window.clearTimeout(agentAutosaveTimerRef.current);
            }
            agentAutosaveTimerRef.current = window.setTimeout(() => {
              agentAutosaveTimerRef.current = 0;
              void flushQueuedAgentAutosave();
            }, 700);
          }, [draftAgent]);
  
          useEffect(() => {
            return () => {
              if (agentAutosaveTimerRef.current) {
                window.clearTimeout(agentAutosaveTimerRef.current);
              }
            };
          }, []);
  
          useEffect(() => {
            setAgentProfileAvatarBroken(false);
            setAgentProfileAvatarPickerOpen(false);
          }, [draftAgent?.id, rawAgentProfilePhotoUrl]);
  
          useEffect(() => {
            agentWorkspaceTeamMembersRequestedRef.current = new Set();
            agentOwnerProfileLookupKeyRef.current = "";
            agentOwnerCandidateProfileLookupKeyRef.current = "";
            setAgentOwnerProfileIdentity(null);
            setAgentOwnerCandidateProfileIdentitiesByKey({});
            setAgentOwnerPopoverOpen(false);
            finishCloseAgentSendToTeamModal();
          }, [draftAgent?.id]);
  
          useEffect(() => {
            agentWorkspaceTeamsRequestedRef.current = false;
            agentWorkspaceTeamMembersRequestedRef.current = new Set();
            setAgentWorkspaceTeamMembersById({});
          }, [agentsOverviewAnalyticsScopeKey]);
  
          useEffect(() => {
            const normalizedTeamId = String(workspaceTeamMembersTeamId || "").trim();
            if (!normalizedTeamId) {
              return;
            }
            const memberRows = Array.isArray(workspaceTeamMembers) ? workspaceTeamMembers : [];
            setAgentWorkspaceTeamMembersById((current) => {
              if (current[normalizedTeamId] === memberRows) {
                return current;
              }
              return {
                ...current,
                [normalizedTeamId]: memberRows,
              };
            });
          }, [workspaceTeamMembers, workspaceTeamMembersTeamId]);
  
          useEffect(() => {
            if (!agentSendTeamModalOpen) {
              return;
            }
            const targetAgents = agentSendTeamTargetAgentIds.length > 0
              ? getAgentActionTargetsByIds(agentSendTeamTargetAgentIds)
              : normalizeAgentActionTargets([agentSendTeamTargetAgent || draftAgent]);
            const selectedTeamStillAvailable = availableAgentShareTeams.some((team) => team.id === agentSendTeamPickerValue);
            if (agentSendTeamPickerValue && selectedTeamStillAvailable) {
              return;
            }
            setAgentSendTeamPickerValue(getDefaultAgentShareTeamIdForAgents(targetAgents) || defaultAgentShareTeamId);
          }, [agentSendTeamModalOpen, agentSendTeamPickerValue, availableAgentShareTeams, defaultAgentShareTeamId, agentSendTeamTargetAgent, agentSendTeamTargetAgentIds, draftAgent]);
  
          useEffect(() => {
            if (!agentAddSquadModalOpen) {
              return;
            }
            const targetAgents = agentAddSquadTargetAgentIds.length > 0
              ? getAgentActionTargetsByIds(agentAddSquadTargetAgentIds)
              : normalizeAgentActionTargets([agentAddSquadTargetAgent]);
            const selectedSquadStillAvailable = getAgentSquadCandidateRows(targetAgents).some((squad) => squad.id === agentAddSquadPickerValue);
            if (agentAddSquadPickerValue && selectedSquadStillAvailable) {
              return;
            }
            setAgentAddSquadPickerValue(getDefaultAgentSquadIdForAgent(targetAgents));
          }, [agentAddSquadModalOpen, agentAddSquadPickerValue, availableAgentSquads, agentAddSquadTargetAgent, agentAddSquadTargetAgentIds]);
  
          useEffect(() => {
            if (
              !draftAgent?.id
              || normalizedWorkspaceTeams.length > 0
              || agentWorkspaceTeamsRequestedRef.current
              || workspaceTeamsLoading
              || workspaceTeamsRequiresPlan
              || typeof onWorkspaceTeamsRequestRef.current !== "function"
            ) {
              return;
            }
            agentWorkspaceTeamsRequestedRef.current = true;
            onWorkspaceTeamsRequestRef.current({});
          }, [
            draftAgent?.id,
            normalizedWorkspaceTeams.length,
            workspaceTeamsLoading,
            workspaceTeamsRequiresPlan,
          ]);
  
          useEffect(() => {
            if (!draftAgent?.id || !agentOwnerMissingTeamIds.length || workspaceTeamsRequiresPlan) {
              return;
            }
            const missingTeamId = agentOwnerMissingTeamIds.find((teamId) => !agentWorkspaceTeamMembersRequestedRef.current.has(teamId));
            if (!missingTeamId) {
              return;
            }
            agentWorkspaceTeamMembersRequestedRef.current.add(missingTeamId);
            void loadAgentWorkspaceTeamMembers(missingTeamId);
          }, [
            draftAgent?.id,
            agentOwnerMissingTeamIds,
            workspaceTeamsRequiresPlan,
          ]);
  
          useEffect(() => {
            if (!draftAgent?.id || !hasAgentPersonIdentity(agentOwnerIdentity)) {
              agentOwnerProfileLookupKeyRef.current = "";
              setAgentOwnerProfileIdentity(null);
              return undefined;
            }
            const ownerKeys = getAgentIdentityMatchKeys(agentOwnerIdentity, agentOwnerIdentity);
            const ownerLookupKey = ownerKeys.join("|");
            if (!ownerLookupKey || agentOwnerProfileLookupKeyRef.current === ownerLookupKey) {
              return undefined;
            }
            agentOwnerProfileLookupKeyRef.current = ownerLookupKey;
            let cancelled = false;
            const ownerLookupRecord = {
              ...agentOwnerIdentity,
              id: agentOwnerIdentity.id || agentOwnerIdentity.userId || agentOwnerIdentity.email || "",
              userId: agentOwnerIdentity.userId || "",
              email: agentOwnerIdentity.email || "",
            };
            void (async () => {
              const payload = await fetchAgentTeamMemberProfilePayload("", [ownerLookupRecord]);
              if (cancelled) {
                return;
              }
              const profileMap = buildAgentTeamMemberProfileMap(payload);
              const matchingProfile = ownerKeys
                .map((key) => profileMap.get(key))
                .find(Boolean) || null;
              const profileIdentity = normalizeAgentPersonIdentity(matchingProfile || null);
              if (!hasAgentPersonIdentity(profileIdentity)) {
                setAgentOwnerProfileIdentity(null);
                return;
              }
              const mergedIdentity = mergeAgentPersonIdentities(agentOwnerIdentity, profileIdentity);
              const mergedName = getTrustedDisplayName(mergedIdentity.name, mergedIdentity.email);
              if (!mergedName && !mergedIdentity.avatarUrl) {
                setAgentOwnerProfileIdentity(null);
                return;
              }
              setAgentOwnerProfileIdentity(mergedIdentity);
            })();
            return () => {
              cancelled = true;
            };
          }, [agentOwnerIdentity, draftAgent?.id]);
  
          useEffect(() => {
            if (!agentOwnerPopoverOpen || agentOwnerCandidateRows.length === 0) {
              agentOwnerCandidateProfileLookupKeyRef.current = "";
              setAgentOwnerCandidateProfileIdentitiesByKey({});
              return undefined;
            }
            const lookupKey = agentOwnerCandidateRows
              .map((candidate) => getAgentOwnerCandidateKey(candidate))
              .filter(Boolean)
              .sort()
              .join("|");
            if (!lookupKey || agentOwnerCandidateProfileLookupKeyRef.current === lookupKey) {
              return undefined;
            }
            agentOwnerCandidateProfileLookupKeyRef.current = lookupKey;
            let cancelled = false;
            void (async () => {
              const payload = await fetchAgentTeamMemberProfilePayload("", agentOwnerCandidateRows);
              if (cancelled) {
                return;
              }
              const profileMap = buildAgentTeamMemberProfileMap(payload);
              const nextProfilesByKey = {};
              agentOwnerCandidateRows.forEach((candidate) => {
                const candidateKey = getAgentOwnerCandidateKey(candidate);
                if (!candidateKey) {
                  return;
                }
                const matchingProfile = getAgentIdentityMatchKeys(candidate, candidate)
                  .map((key) => profileMap.get(key))
                  .find(Boolean) || null;
                const profileIdentity = normalizeAgentPersonIdentity(matchingProfile || null);
                if (!hasAgentPersonIdentity(profileIdentity)) {
                  return;
                }
                const mergedIdentity = mergeAgentPersonIdentities(candidate, profileIdentity);
                if (!getTrustedDisplayName(mergedIdentity.name, mergedIdentity.email) && !mergedIdentity.avatarUrl) {
                  return;
                }
                nextProfilesByKey[candidateKey] = mergedIdentity;
              });
              setAgentOwnerCandidateProfileIdentitiesByKey(nextProfilesByKey);
            })();
            return () => {
              cancelled = true;
            };
          }, [agentOwnerCandidateRows, agentOwnerPopoverOpen]);
  
          useEffect(() => {
            if (!agentSendTeamModalOpen) {
              return undefined;
            }
  
            function handleAgentSendTeamModalEscape(event) {
              if (event.key !== "Escape") {
                return;
              }
              closeAgentSendToTeamModal();
            }
  
            window.addEventListener("keydown", handleAgentSendTeamModalEscape);
            return () => window.removeEventListener("keydown", handleAgentSendTeamModalEscape);
          }, [agentSendTeamModalOpen, agentSendTeamShareState.action]);
  
          useEffect(() => {
            if (!agentAddSquadModalOpen) {
              return undefined;
            }
  
            function handleAgentAddSquadModalEscape(event) {
              if (event.key !== "Escape") {
                return;
              }
              closeAgentAddSquadModal();
            }
  
            window.addEventListener("keydown", handleAgentAddSquadModalEscape);
            return () => window.removeEventListener("keydown", handleAgentAddSquadModalEscape);
          }, [agentAddSquadModalOpen, agentAddSquadState.action]);
  
          useEffect(() => {
            if (!agentApiModalOpen && !agentApiModalClosing) {
              return undefined;
            }
  
            function handleAgentApiModalEscape(event) {
              if (event.key === "Escape") {
                closeAgentApiModal();
              }
            }
  
            window.addEventListener("keydown", handleAgentApiModalEscape);
            return () => window.removeEventListener("keydown", handleAgentApiModalEscape);
          }, [agentApiModalOpen, agentApiModalClosing]);
  
          useEffect(() => {
            if (!agentApiModalOpen) {
              return;
            }
            const normalizedEnvironmentId = String(agentApiEnvironmentId || "").trim();
            if (!normalizedEnvironmentId || !orderedAgentApiEnvironments.some((environment) => String(environment?.id || "").trim() === normalizedEnvironmentId)) {
              setAgentApiEnvironmentId(agentApiDefaultEnvironmentId);
            }
          }, [agentApiDefaultEnvironmentId, agentApiEnvironmentId, agentApiModalOpen, orderedAgentApiEnvironments]);
  
          useEffect(() => {
            if (!agentApiModalOpen || agentApiEditorModule || agentApiEditorModuleError) {
              return undefined;
            }
  
            let cancelled = false;
  
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled) {
                  return;
                }
                if (!module) {
                  setAgentApiEditorModuleError("Failed to load editor.");
                  return;
                }
                setAgentApiEditorModule(module);
                setAgentApiEditorModuleError("");
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled) {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (cancelled) {
                  return;
                }
                setAgentApiEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });
  
            return () => {
              cancelled = true;
            };
          }, [agentApiEditorModule, agentApiEditorModuleError, agentApiModalOpen]);
  
          useEffect(() => {
            if (!agentVoicePopoverOpen) {
              return undefined;
            }
  
            function handleAgentVoicePopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !agentVoicePopoverRef.current || agentVoicePopoverRef.current.contains(target)) {
                return;
              }
              setAgentVoicePopoverOpen(false);
            }
  
            function handleAgentVoicePopoverEscape(event) {
              if (event.key === "Escape") {
                setAgentVoicePopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleAgentVoicePopoverPointerDown);
            window.addEventListener("keydown", handleAgentVoicePopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleAgentVoicePopoverPointerDown);
              window.removeEventListener("keydown", handleAgentVoicePopoverEscape);
            };
          }, [agentVoicePopoverOpen]);
  
          useEffect(() => {
            return () => {
              if (agentSendTeamModalCloseTimerRef.current) {
                window.clearTimeout(agentSendTeamModalCloseTimerRef.current);
                agentSendTeamModalCloseTimerRef.current = null;
              }
              if (agentSendTeamModalFrameRef.current) {
                window.cancelAnimationFrame(agentSendTeamModalFrameRef.current);
                agentSendTeamModalFrameRef.current = null;
              }
              if (agentAddSquadModalCloseTimerRef.current) {
                window.clearTimeout(agentAddSquadModalCloseTimerRef.current);
                agentAddSquadModalCloseTimerRef.current = null;
              }
              if (agentAddSquadModalFrameRef.current) {
                window.cancelAnimationFrame(agentAddSquadModalFrameRef.current);
                agentAddSquadModalFrameRef.current = null;
              }
              if (agentApiModalCloseTimerRef.current) {
                window.clearTimeout(agentApiModalCloseTimerRef.current);
                agentApiModalCloseTimerRef.current = null;
              }
              if (agentApiModalFrameRef.current) {
                window.cancelAnimationFrame(agentApiModalFrameRef.current);
                agentApiModalFrameRef.current = null;
              }
              if (agentVersionModalCloseTimerRef.current) {
                window.clearTimeout(agentVersionModalCloseTimerRef.current);
                agentVersionModalCloseTimerRef.current = null;
              }
              if (agentVersionModalFrameRef.current) {
                window.cancelAnimationFrame(agentVersionModalFrameRef.current);
                agentVersionModalFrameRef.current = null;
              }
              if (agentAccessPermissionSaveTimerRef.current) {
                window.clearTimeout(agentAccessPermissionSaveTimerRef.current);
                agentAccessPermissionSaveTimerRef.current = null;
              }
              agentAccessPermissionSaveQueuedRef.current = null;
            };
          }, []);
  
          useEffect(() => {
            if (!selectedAgentId || selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return;
            }
            if (agentAnalyticsById[selectedAgentId]) {
              return;
            }
            void loadAgentAnalytics(selectedAgentId);
          }, [agentAnalyticsById, loadAgentAnalytics, selectedAgentId]);
  
  ${MODELS_AGENT_SCRIPT_FRAGMENTS.catalogLifecycle}
          useEffect(() => {
            if (!agentAssistantOpen) {
              return;
            }
            if (agentCreationAssistantAgent?.id && agentCreationAssistantAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
              setAgentCreationAssistantAgentId(agentCreationAssistantAgent.id);
              setAgentCreationAssistantError("");
              return;
            }
            void ensureAgentCreationAssistantAgent().catch(() => {});
          }, [
            agentAssistantOpen,
            agentCreationAssistantAgent?.id,
            allKnownAgents.length,
            resolvedAgentModelOptions,
          ]);
  
          useEffect(() => {
            if (!agentActionsPopoverOpen) {
              return undefined;
            }
  
            function handleAgentActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (
                !target
                || agentActionsPopoverRef.current?.contains(target)
                || agentActionsPopoverSurfaceRef.current?.contains(target)
              ) {
                return;
              }
              setAgentActionsPopoverOpen(false);
            }
  
            function handleAgentActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setAgentActionsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleAgentActionsPopoverPointerDown);
            window.addEventListener("keydown", handleAgentActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleAgentActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleAgentActionsPopoverEscape);
            };
          }, [agentActionsPopoverOpen]);
  
          useEffect(() => {
            if (!agentRenameState || !agentRenameInputRef.current) {
              return undefined;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              agentRenameInputRef.current?.focus();
              agentRenameInputRef.current?.select();
            });
  
            function handleAgentRenameEscape(event) {
              if (event.key === "Escape" && !saveState.isSaving) {
                event.preventDefault();
                closeAgentRenameDialog();
              }
            }
  
            window.addEventListener("keydown", handleAgentRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleAgentRenameEscape);
            };
          }, [agentRenameState, saveState.isSaving]);
  
          useEffect(() => {
            if (!agentCreationSetupOpen) {
              agentCreationNameAutofocusedRef.current = false;
              return undefined;
            }
            if (agentCreationNameAutofocusedRef.current) {
              return undefined;
            }
            agentCreationNameAutofocusedRef.current = true;
            const focusFrame = window.requestAnimationFrame(() => {
              const input = agentCreationNameInputRef.current;
              if (!input || input.disabled) {
                return;
              }
              input.focus({ preventScroll: true });
              input.select();
            });
            return () => {
              window.cancelAnimationFrame(focusFrame);
            };
          }, [agentCreationSetupOpen, agentCreationSetupResetToken]);
  
          useLayoutEffect(() => {
            if (!agentComposerOpen) {
              return;
            }
            resizeAgentDescriptionTextarea(agentComposerInstructionsTextareaRef.current);
          }, [agentComposerDraft?.instructions, agentComposerOpen]);
  
          useEffect(() => {
            if (!agentComposerModelPopover) {
              return undefined;
            }
  
            function handleAgentComposerModelPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target) {
                return;
              }
              if (agentComposerModelPopoverRef.current && agentComposerModelPopoverRef.current.contains(target)) {
                return;
              }
              if (agentComposerModelTriggerRef.current && agentComposerModelTriggerRef.current.contains(target)) {
                return;
              }
              if (agentComposerReasoningTriggerRef.current && agentComposerReasoningTriggerRef.current.contains(target)) {
                return;
              }
              if (agentComposerDeepResearchModelTriggerRef.current && agentComposerDeepResearchModelTriggerRef.current.contains(target)) {
                return;
              }
              setAgentComposerModelPopover("");
            }
  
            function handleAgentComposerModelPopoverEscape(event) {
              if (event.key === "Escape") {
                setAgentComposerModelPopover("");
              }
            }
  
            document.addEventListener("mousedown", handleAgentComposerModelPopoverPointerDown);
            window.addEventListener("keydown", handleAgentComposerModelPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleAgentComposerModelPopoverPointerDown);
              window.removeEventListener("keydown", handleAgentComposerModelPopoverEscape);
            };
          }, [agentComposerModelPopover]);
  
          useEffect(() => {
            if (!agentModelPopover || agentModelPopover === "api-environment") {
              return undefined;
            }
  
            function handleAgentModelPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target) {
                return;
              }
              if (agentModelPopoverRef.current && agentModelPopoverRef.current.contains(target)) {
                return;
              }
              if (agentDeepResearchModelTriggerRef.current && agentDeepResearchModelTriggerRef.current.contains(target)) {
                return;
              }
              setAgentModelPopover("");
            }
  
            function handleAgentModelPopoverEscape(event) {
              if (event.key === "Escape") {
                setAgentModelPopover("");
              }
            }
  
            document.addEventListener("mousedown", handleAgentModelPopoverPointerDown);
            window.addEventListener("keydown", handleAgentModelPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleAgentModelPopoverPointerDown);
              window.removeEventListener("keydown", handleAgentModelPopoverEscape);
            };
          }, [agentModelPopover]);
  
          useEffect(() => {
            if (!isHomeViewActive) {
              return undefined;
            }
            const period = agentsHomeChartTimescale === "day" || agentsHomeChartTimescale === "week"
              ? agentsHomeChartTimescale
              : "month";
            const requestOptions = {
              backendUrl,
              headers: requestHeaders,
              identity: currentUserId || currentUserEmail || "session",
              period,
            };
            const cached = readCachedAgentsOverviewAnalytics(requestOptions);
            setAgentsOverviewAnalyticsState((current) => {
              const isSameScope = current.scopeKey === agentsOverviewAnalyticsScopeKey;
              const currentDataByPeriod = isSameScope ? current.dataByPeriod : {};
              return {
                scopeKey: agentsOverviewAnalyticsScopeKey,
                dataByPeriod: cached?.data
                  ? { ...currentDataByPeriod, [period]: cached.data }
                  : currentDataByPeriod,
                loadingPeriod: cached?.data ? "" : period,
                errorsByPeriod: isSameScope ? { ...current.errorsByPeriod, [period]: "" } : {},
              };
            });
  
            let isActive = true;
            void fetchAgentsOverviewAnalytics(requestOptions).then((data) => {
              if (!isActive) return;
              agentsOverviewAnalyticsFallbackScopeRef.current = "";
              setAgentsOverviewAnalyticsState((current) => {
                if (current.scopeKey !== agentsOverviewAnalyticsScopeKey) return current;
                return {
                  ...current,
                  dataByPeriod: { ...current.dataByPeriod, [period]: data },
                  loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                  errorsByPeriod: { ...current.errorsByPeriod, [period]: "" },
                };
              });
            }).catch((error) => {
              if (!isActive) return;
              const errorMessage = error instanceof Error ? error.message : "Failed to load agent analytics.";
              const shouldUseLegacyFallback = error instanceof AgentsOverviewAnalyticsRequestError
                && (error.status === 404 || error.status === 501);
              setAgentsOverviewAnalyticsState((current) => {
                if (current.scopeKey !== agentsOverviewAnalyticsScopeKey) return current;
                return {
                  ...current,
                  loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                  errorsByPeriod: { ...current.errorsByPeriod, [period]: shouldUseLegacyFallback ? "" : errorMessage },
                };
              });
              const fallbackKey = agentsOverviewAnalyticsScopeKey + "|" + period;
              if (shouldUseLegacyFallback && agentsOverviewAnalyticsFallbackScopeRef.current !== fallbackKey) {
                agentsOverviewAnalyticsFallbackScopeRef.current = fallbackKey;
                void loadAgentsHomeThreads();
              }
            });
  
            return () => {
              isActive = false;
            };
          }, [agentsHomeChartTimescale, agentsOverviewAnalyticsScopeKey, backendUrl, currentUserEmail, currentUserId, isHomeViewActive, loadAgentsHomeThreads, requestHeaders]);
  
          useEffect(() => {
            if (!selectedAgentId || selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID || isHomeViewActive) {
              return;
            }
            void loadAgentsHomeThreads();
          }, [isHomeViewActive, loadAgentsHomeThreads, selectedAgentId]);
  
          useEffect(() => {
            const signal = threadMutationSignal && typeof threadMutationSignal === "object" && !Array.isArray(threadMutationSignal)
              ? threadMutationSignal
              : null;
            const normalizedThreadId = String(signal?.threadId || signal?.threadRecord?.id || signal?.threadRecord?.threadId || "").trim();
            if (!signal || !normalizedThreadId) {
              return;
            }
  
            invalidateAgentsOverviewAnalytics({
              backendUrl,
              headers: requestHeaders,
              identity: currentUserId || currentUserEmail || "session",
            });
  
            if (String(signal.action || "").trim() === "delete") {
              setAgentsHomeThreadRecords((current) => {
                const currentItems = Array.isArray(current) ? current : [];
                const nextItems = currentItems.filter((thread) => (
                  String(thread?.id || thread?.threadId || "").trim() !== normalizedThreadId
                ));
                return nextItems.length === currentItems.length ? current : nextItems;
              });
              return;
            }
  
            const signalRecord = signal.threadRecord && typeof signal.threadRecord === "object" && !Array.isArray(signal.threadRecord)
              ? signal.threadRecord
              : null;
            if (!signalRecord) {
              void loadAgentsHomeThreads({ force: true });
              return;
            }
  
            setAgentsHomeThreadRecords((current) => {
              const currentItems = Array.isArray(current) ? current : [];
              let didFind = false;
              const nextItems = currentItems.map((thread) => {
                const currentThreadId = String(thread?.id || thread?.threadId || "").trim();
                if (currentThreadId !== normalizedThreadId) {
                  return thread;
                }
                didFind = true;
                return {
                  ...(thread && typeof thread === "object" && !Array.isArray(thread) ? thread : {}),
                  ...signalRecord,
                };
              });
              return (didFind ? nextItems : [signalRecord, ...currentItems])
                .slice(0, AGENT_THREAD_FETCH_LIMIT);
            });
          }, [backendUrl, currentUserEmail, currentUserId, loadAgentsHomeThreads, requestHeaders, threadMutationSignal]);
  
