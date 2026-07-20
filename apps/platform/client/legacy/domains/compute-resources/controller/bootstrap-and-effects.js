        function PlaygroundEnvironmentsPage({
          backendUrl,
          requestHeaders,
          environments,
          initialEnvironmentId,
          navigationToken = 0,
          navigationTargetEnvironmentId = "",
          navigationResourceToken = 0,
          navigationTargetResourceType = "",
          navigationTargetResourceId = "",
          onEnvironmentMutated,
          onRequestSidebarCollapse,
          apiKey = "",
          fetchCustomSkills,
          speechToTextUrl = "",
          computerAgents = null,
          agents = [],
          skills = [],
          preferredEnvironmentId = "",
          preferredAgentId = "",
          onPreferredAgentChange,
          onPreferredEnvironmentChange,
          onThreadRegistered,
          onThreadOpen,
          onThreadStarted,
          onOpenFilesPage,
          threadRecords = [],
          embeddedInResources = false,
          embeddedResourcesView = "computers",
          embeddedServerKind = "",
          topNavActionsPortalId = "",
          onResourcesHeaderChange,
          backRequestToken = 0,
          resourceBillingPreferences = SETTINGS_DEFAULT_BILLING_PREFERENCES,
          resourceBillingSaving = false,
          resourceBillingError = "",
          resourceBillingSuccess = "",
          canConfigureResourceBilling = true,
          onResourceBillingPreferencesChange = null,
          resourceTemplatePreviewResources = [],
          workspaceTeams = [],
          workspaceTeamsLoading = false,
          workspaceTeamsRequiresPlan = false,
          onWorkspaceTeamsRequest,
          onOpenTeamPage,
          versionsDrawerPortalId = "",
          onVersionsSidebarOpenChange,
          currentUserId = "",
          currentUserName = "",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
          databaseListIdentity = "",
          developServerOperationalMetrics = null,
          developServerOperationalMetricsLoading = false,
          developServerOperationalMetricsError = "",
          developServerOperationalMetricsPeriod = "month",
          onDevelopServerOperationalMetricsPeriodChange = null,
          developServerMetricsChartTab = "hosting-requests",
          onDevelopServerMetricsChartTabChange = null,
          developAnalyticsMenuOpen = false,
          onDevelopAnalyticsMenuOpenChange = null,
          onOpenSettingsUsage = null,
          onOpenSettingsApi = null,
          onNavigationGuardChange = null,
          onNavigationRequest = null,
          creationOnly = false,
          creationRequestToken = 0,
          onCreationRequestClose,
        }) {
          backendUrl = normalizePlaygroundRealApiBackendUrl(backendUrl);
          const databaseListScopeKey = buildPlaygroundDatabaseListScopeKey(backendUrl, requestHeaders, databaseListIdentity);
          const initialDatabaseListCacheRecord = readPlaygroundDatabaseListCache(databaseListScopeKey);
          const searchPopupInputRef = useRef(null);
          const editorDirtyRef = useRef(false);
          const environmentDetailMainRef = useRef(null);
          const serverDetailMainRef = useRef(null);
          const serverDetailSelectPopoverRef = useRef(null);
          const serverDescriptionTextareaRef = useRef(null);
          const databaseDescriptionTextareaRef = useRef(null);
          const serverSecretDescriptionTextareaRef = useRef(null);
          const serverAgentRuntimeRunPromptTextareaRef = useRef(null);
          const serverActionsPopoverRef = useRef(null);
          const resourceOverviewTopNavMenuRef = useRef(null);
          const serverFileActionsPopoverRef = useRef(null);
          const serverDeployProgressTimerRef = useRef(null);
          const serverRenameInputRef = useRef(null);
          const serverFileUploadInputRef = useRef(null);
          const serverPublishMenuRef = useRef(null);
          const serverVersionDescriptionTextareaRef = useRef(null);
          const serverVersionModalCloseTimerRef = useRef(null);
          const serverVersionModalFrameRef = useRef(null);
          const serverInitialVersionSeededRef = useRef(new Set());
          const serverVersionBaselineRef = useRef({ key: "", signature: "" });
          const serverVersionDraftTouchedRef = useRef(false);
          const serverVersionsLoadedRef = useRef(new Set());
          const serverDetailsCollapsedBeforeVersionsRef = useRef(null);
          const serverComposerDescriptionTextareaRef = useRef(null);
          const environmentGuiImageRef = useRef(null);
          const environmentGuiClickTimerRef = useRef(null);
          const environmentGuiScrollTimerRef = useRef(null);
          const environmentRuntimePopoverRef = useRef(null);
          const environmentComposerRuntimePopoverRef = useRef(null);
          const environmentCreationNameInputRef = useRef(null);
          const lastAppliedCreationRequestTokenRef = useRef("");
          const environmentActionsPopoverRef = useRef(null);
          const environmentVersionDescriptionTextareaRef = useRef(null);
          const environmentVersionModalCloseTimerRef = useRef(null);
          const environmentVersionModalFrameRef = useRef(null);
          const environmentVersionBaselineRef = useRef({ key: "", signature: "" });
          const environmentVersionDraftTouchedRef = useRef(false);
          const environmentVersionsLoadedRef = useRef(new Set());
          const environmentVersionsDrawerContainerRef = useRef(null);
          const environmentDetailsCollapsedBeforeVersionsRef = useRef(null);
          const environmentShareTeamModalCloseTimerRef = useRef(null);
          const environmentShareTeamModalFrameRef = useRef(null);
          const environmentApiModalCloseTimerRef = useRef(null);
          const environmentApiModalFrameRef = useRef(null);
          const environmentListActionMenuCloseTimerRef = useRef(null);
          const environmentBulkActionMenuCloseTimerRef = useRef(null);
          const environmentRenameInputRef = useRef(null);
          const databaseActionsPopoverRef = useRef(null);
          const serverOwnerPopoverRef = useRef(null);
          const serverOwnerTransferModalCloseTimerRef = useRef(null);
          const databaseOwnerPopoverRef = useRef(null);
          const databaseOwnerTransferModalCloseTimerRef = useRef(null);
          const databaseOwnerTransferModalFrameRef = useRef(null);
          const databaseExportMenuRef = useRef(null);
          const databaseRenameInputRef = useRef(null);
          const agentRuntimeSkillsActionsRef = useRef(null);
          const serverAutosaveTimerRef = useRef(null);
          const serverAutosaveQueuedRef = useRef(null);
          const serverAutosaveInFlightRef = useRef(false);
          const serverEditorDirtyRef = useRef(false);
          const databaseDocumentAutosaveTimerRef = useRef(null);
          const databaseDocumentSaveInFlightRef = useRef(false);
          const databasePermissionSaveTimerRef = useRef(null);
          const databasePermissionSaveQueuedRef = useRef(null);
          const databasePermissionSaveInFlightRef = useRef(false);
          const databaseWorkspaceTeamsRequestedRef = useRef(false);
          const databaseOwnerTeamMembersRequestedRef = useRef(new Set());
          const serverPermissionSaveTimerRef = useRef(null);
          const serverPermissionSaveQueuedRef = useRef(null);
          const serverPermissionSaveInFlightRef = useRef(false);
          const databaseListRequestRef = useRef({
            promise: null,
            requestId: 0,
            retryCount: 0,
            retryTimer: null,
          });
          const serverListRequestRef = useRef({
            promise: null,
            requestId: 0,
            scopeKey: "",
          });
          const serverDetailsRequestRef = useRef(new Map());
          const authoritativeServerDetailIdsRef = useRef(new Set());
          const authoritativeServerBindingIdsRef = useRef(new Set());
          const databaseListScopeKeyRef = useRef(databaseListScopeKey);
          const databaseListInitialLoadScopeRef = useRef("");
          const databaseRequestHeadersRef = useRef(requestHeaders);
          databaseListScopeKeyRef.current = databaseListScopeKey;
          databaseRequestHeadersRef.current = requestHeaders;
          const environmentAutosaveTimerRef = useRef(null);
          const environmentAutosaveQueuedRef = useRef(null);
          const environmentAutosaveInFlightRef = useRef(false);
          const selectedEnvironmentIdRef = useRef(initialEnvironmentId || "");
          const environmentNavigationRequestRef = useRef({
            token: navigationToken,
            targetId: String(navigationTargetEnvironmentId || "").trim(),
            handled: false,
          });
          const resourceNavigationRequestRef = useRef({
            token: navigationResourceToken,
            targetType: String(navigationTargetResourceType || "").trim(),
            targetId: String(navigationTargetResourceId || "").trim(),
            handled: false,
          });
          const selectedServerIdRef = useRef("");
          const selectedDatabaseIdRef = useRef("");
          const selectedDatabaseCollectionIdRef = useRef("");
          const selectedDatabaseDocumentIdRef = useRef("");
          const serverAnalyticsByIdRef = useRef({});
          const databaseAnalyticsByIdRef = useRef({});
          const databaseCollectionsByIdRef = useRef({});
          const databaseDocumentsByCollectionKeyRef = useRef({});
          const environmentSeededSelectionRef = useRef("");
          const serverSeededSelectionRef = useRef("");
          const serverDefaultSourceCreationRef = useRef(new Set());
          const databaseSeededSelectionRef = useRef("");
          const serverResourceModeRefreshRef = useRef(false);
          const resourcesOverviewToolbarRef = useRef(null);
          const serverLogsToolbarRef = useRef(null);
          const resourcesHomeScrollRef = useRef(null);
          const resourcesDetailScrollRef = useRef(null);
          const [resourceMode, setResourceMode] = useState(embeddedResourcesView === "servers" ? "servers" : "computers");
          const isServersMode = resourceMode === "servers";
          const [isHomeViewActive, setIsHomeViewActive] = useState(true);
          const [topNavActionsContainer, setTopNavActionsContainer] = useState(null);
          const handledBackRequestTokenRef = useRef(backRequestToken);
          const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(initialEnvironmentId || "");
          const [selectedServerId, setSelectedServerId] = useState("");
          const [selectedDatabaseId, setSelectedDatabaseId] = useState("");
          const [environmentDetailsById, setEnvironmentDetailsById] = useState(() => {
            const next = {};
            environments.forEach((environment) => {
              if (!environment?.id) return;
              next[environment.id] = normalizePlaygroundEnvironmentRecord(environment);
            });
            return next;
          });
          const [environmentAnalyticsById, setEnvironmentAnalyticsById] = useState({});
          const [environmentHomeCostSummaryByPeriod, setEnvironmentHomeCostSummaryByPeriod] = useState({});
          const [environmentHomeCostBreakdownByPeriod, setEnvironmentHomeCostBreakdownByPeriod] = useState({});
          const [environmentHomeChartSummariesByPeriod, setEnvironmentHomeChartSummariesByPeriod] = useState({});
          const [environmentHomeChartBreakdownsByPeriod, setEnvironmentHomeChartBreakdownsByPeriod] = useState({});
          const [servers, setServers] = useState([]);
          const [databases, setDatabases] = useState(() => initialDatabaseListCacheRecord?.items || []);
          const [serverDetailsById, setServerDetailsById] = useState({});
          const [serverBindingsById, setServerBindingsById] = useState({});
          const [databaseDetailsById, setDatabaseDetailsById] = useState({});
          const [serverFilesById, setServerFilesById] = useState({});
          const [serverAnalyticsById, setServerAnalyticsById] = useState({});
          const [serverLogsById, setServerLogsById] = useState({});
          const [serverDeploymentsById, setServerDeploymentsById] = useState({});
          const [serverContextsById, setServerContextsById] = useState({});
          const [serverAuthUsersById, setServerAuthUsersById] = useState({});
          const [serverSecretsById, setServerSecretsById] = useState({});
          const [serverAgentRuntimeRunsById, setServerAgentRuntimeRunsById] = useState({});
          const [serverAgentOptions, setServerAgentOptions] = useState([]);
          const [voiceAgentRecordsById, setVoiceAgentRecordsById] = useState({});
          const [voiceAgentDraftsById, setVoiceAgentDraftsById] = useState({});
          const [voiceAgentSessionResultsById, setVoiceAgentSessionResultsById] = useState({});
          const [databaseAnalyticsById, setDatabaseAnalyticsById] = useState({});
          const [draftEnvironment, setDraftEnvironment] = useState(null);
          const [draftServer, setDraftServer] = useState(null);
          const [draftDatabase, setDraftDatabase] = useState(null);
          const [toolbarPopover, setToolbarPopover] = useState("");
          const [searchPopupQuery, setSearchPopupQuery] = useState("");
          const [fileEnvironmentMutationState, setFileEnvironmentMutationState] = useState({
            environmentId: "",
            action: "",
          });
          const [resourcesOverviewToolbarPopover, setResourcesOverviewToolbarPopover] = useState("");
          const [resourcesOverviewFilter, setResourcesOverviewFilter] = useState("all");
          const [resourcesOverviewSort, setResourcesOverviewSort] = useState("name");
          const [resourcesOverviewSortDirection, setResourcesOverviewSortDirection] = useState("asc");
          const [resourcesOverviewHomeTab, setResourcesOverviewHomeTab] = useState("general");
          const [selectedOverviewServerResourceIds, setSelectedOverviewServerResourceIds] = useState(() => new Set());
          const [selectedOverviewComputerIds, setSelectedOverviewComputerIds] = useState(() => new Set());
          const normalizedResourceBillingPreferences = normalizeDemoSettingsBillingPreferences(resourceBillingPreferences);
          const [loadingEnvironmentId, setLoadingEnvironmentId] = useState("");
          const [loadingEnvironmentAnalyticsId, setLoadingEnvironmentAnalyticsId] = useState("");
          const [environmentHomeCostSummaryLoadingPeriod, setEnvironmentHomeCostSummaryLoadingPeriod] = useState("");
          const [environmentHomeCostBreakdownLoadingPeriod, setEnvironmentHomeCostBreakdownLoadingPeriod] = useState("");
          const [environmentHomeChartSummariesLoadingPeriod, setEnvironmentHomeChartSummariesLoadingPeriod] = useState("");
          const [environmentHomeChartBreakdownsLoadingPeriod, setEnvironmentHomeChartBreakdownsLoadingPeriod] = useState("");
          const [loadingServerId, setLoadingServerId] = useState("");
          const [loadingDatabaseId, setLoadingDatabaseId] = useState("");
          const [loadingServerAnalyticsId, setLoadingServerAnalyticsId] = useState("");
          const [loadingServerBindingsId, setLoadingServerBindingsId] = useState("");
          const [loadingServerContextId, setLoadingServerContextId] = useState("");
          const [loadingServerDeploymentsId, setLoadingServerDeploymentsId] = useState("");
          const [loadingServerAuthUsersId, setLoadingServerAuthUsersId] = useState("");
          const [loadingServerSecretsId, setLoadingServerSecretsId] = useState("");
          const [loadingServerAgentRuntimeRunsId, setLoadingServerAgentRuntimeRunsId] = useState("");
          const [serverAgentOptionsLoading, setServerAgentOptionsLoading] = useState(false);
          const [voiceAgentsLoading, setVoiceAgentsLoading] = useState(false);
          const [loadingDatabaseAnalyticsId, setLoadingDatabaseAnalyticsId] = useState("");
          const [saveState, setSaveState] = useState({
            isSaving: false,
            error: "",
            message: "",
          });
          const [serverSaveState, setServerSaveState] = useState({
            isSaving: false,
            error: "",
            message: "",
          });
          const [serverBindingState, setServerBindingState] = useState({
            savingKey: "",
            error: "",
          });
          const [serverRuntimeState, setServerRuntimeState] = useState({
            error: "",
          });
          const [serverAgentRuntimeRunsState, setServerAgentRuntimeRunsState] = useState({
            error: "",
            message: "",
          });
          const [voiceAgentsState, setVoiceAgentsState] = useState({
            error: "",
            message: "",
            savingAgentId: "",
            provisioningAgentId: "",
            disablingAgentId: "",
            testingAgentId: "",
          });
          const [serverRuntimePreviewState, setServerRuntimePreviewState] = useState({
            open: false,
            target: "",
            title: "",
            path: "",
            language: "json",
            value: "",
            loading: false,
            error: "",
          });
          const [databaseSaveState, setDatabaseSaveState] = useState({
            isSaving: false,
            error: "",
            message: "",
          });
          const [databaseExporting, setDatabaseExporting] = useState(false);
          const [databaseExportMenuOpen, setDatabaseExportMenuOpen] = useState(false);
          const [isServerDescriptionEditing, setIsServerDescriptionEditing] = useState(false);
          const [serverDescriptionHistory, setServerDescriptionHistory] = useState({ past: [], future: [] });
          const [isDatabaseDescriptionEditing, setIsDatabaseDescriptionEditing] = useState(false);
          const [databaseDescriptionHistory, setDatabaseDescriptionHistory] = useState({ past: [], future: [] });
          const [environmentDetailsCollapsed, setEnvironmentDetailsCollapsed] = useState(false);
          const [serverDetailsCollapsed, setServerDetailsCollapsed] = useState(false);
          const [environmentRuntimePopover, setEnvironmentRuntimePopover] = useState("");
          const [environmentsHomeResourceCommandRequest, setEnvironmentsHomeResourceCommandRequest] = useState(null);
          const [environmentsHomeActiveResourceCommand, setEnvironmentsHomeActiveResourceCommand] = useState("");
          const [environmentHomeChartTimescale, setEnvironmentHomeChartTimescale] = useState(() => (
            normalizePlaygroundEnvironmentHomeChartPeriod(developServerOperationalMetricsPeriod)
          ));
          const computersOverviewAnalyticsScopeKey = useMemo(() => {
            let headerSignature = "";
            try {
              headerSignature = Array.from(new Headers(requestHeaders || {}).entries())
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, value]) => key + ":" + value)
                .join("|");
            } catch {}
            return String(backendUrl || "").replace(new RegExp("/+$"), "") + "|" + String(currentUserId || currentUserEmail || "session") + "|" + headerSignature;
          }, [backendUrl, currentUserEmail, currentUserId, requestHeaders]);
          const [computersOverviewAnalyticsState, setComputersOverviewAnalyticsState] = useState(() => ({
            scopeKey: "",
            dataByPeriod: {},
            loadingPeriod: "",
            errorsByPeriod: {},
          }));
          const computersOverviewAnalyticsFallbackScopeRef = useRef("");
          const updateEnvironmentHomeChartTimescale = useCallback((value) => {
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(value);
            setEnvironmentHomeChartTimescale(normalizedPeriod);
            if (typeof onDevelopServerOperationalMetricsPeriodChange === "function") {
              onDevelopServerOperationalMetricsPeriodChange(normalizedPeriod);
            }
          }, [onDevelopServerOperationalMetricsPeriodChange]);
          const [environmentDetailChartTimescale, setEnvironmentDetailChartTimescale] = useState("day");
          const [environmentDetailTab, setEnvironmentDetailTab] = useState("general");
          const [serverDetailChartTimescale, setServerDetailChartTimescale] = useState("day");
  	        const [serverPermissionChartAnimationKey, setServerPermissionChartAnimationKey] = useState(0);
  	        const [serverPermissionTeamId, setServerPermissionTeamId] = useState("");
  	        const [serverPermissionRoleId, setServerPermissionRoleId] = useState("member");
  	        const [serverTeamMenuId, setServerTeamMenuId] = useState("");
  	        const [serverAccessSearchQuery, setServerAccessSearchQuery] = useState("");
  	        const [serverAccessFilter, setServerAccessFilter] = useState("all");
  	        const [serverAccessSort, setServerAccessSort] = useState("name");
  	        const [serverAccessSortDirection, setServerAccessSortDirection] = useState("asc");
  	        const [selectedServerAccessTeamIds, setSelectedServerAccessTeamIds] = useState(() => new Set());
  	        const [serverOwnerPopoverOpen, setServerOwnerPopoverOpen] = useState(false);
  	        const [serverOwnerTransferTarget, setServerOwnerTransferTarget] = useState(null);
  	        const [serverOwnerTransferModalClosing, setServerOwnerTransferModalClosing] = useState(false);
  	        const [serverTeamAccessState, setServerTeamAccessState] = useState({
  	          teamId: "",
  	          action: "",
  	          error: "",
  	        });
  	        const [databaseDetailChartTimescale, setDatabaseDetailChartTimescale] = useState("day");
  	        const [databaseQuickstartLanguage, setDatabaseQuickstartLanguage] = useState("javascript");
  	        const [databaseDetailTab, setDatabaseDetailTab] = useState("data");
  	        const [databasePermissionChartAnimationKey, setDatabasePermissionChartAnimationKey] = useState(0);
  	        const [databasePermissionTeamId, setDatabasePermissionTeamId] = useState("");
  	        const [databasePermissionRoleId, setDatabasePermissionRoleId] = useState("member");
  	        const [databaseTeamMenuId, setDatabaseTeamMenuId] = useState("");
  	        const [databaseAccessSearchQuery, setDatabaseAccessSearchQuery] = useState("");
  	        const [databaseAccessFilter, setDatabaseAccessFilter] = useState("all");
  	        const [databaseAccessSort, setDatabaseAccessSort] = useState("name");
  	        const [databaseAccessSortDirection, setDatabaseAccessSortDirection] = useState("asc");
  	        const [selectedDatabaseAccessTeamIds, setSelectedDatabaseAccessTeamIds] = useState(() => new Set());
  	        const [databaseOwnerPopoverOpen, setDatabaseOwnerPopoverOpen] = useState(false);
  	        const [databaseOwnerTeamMembersById, setDatabaseOwnerTeamMembersById] = useState({});
  	        const [databaseOwnerTransferTarget, setDatabaseOwnerTransferTarget] = useState(null);
  	        const [databaseOwnerTransferModalVisible, setDatabaseOwnerTransferModalVisible] = useState(false);
  	        const [databaseOwnerTransferModalClosing, setDatabaseOwnerTransferModalClosing] = useState(false);
  	        const [databaseTeamAccessState, setDatabaseTeamAccessState] = useState({
  	          teamId: "",
  	          action: "",
  	          error: "",
  	        });
  	        const [authDetailTab, setAuthDetailTab] = useState("users");
  	        const [secretsDetailTab, setSecretsDetailTab] = useState("secrets");
  	        const [agentRuntimeDetailTab, setAgentRuntimeDetailTab] = useState("usage");
          const [environmentActionsPopoverOpen, setEnvironmentActionsPopoverOpen] = useState(false);
          const [environmentPublishMenuOpen, setEnvironmentPublishMenuOpen] = useState(false);
          const [environmentVersionSelectorMenuOpen, setEnvironmentVersionSelectorMenuOpen] = useState(false);
          const [environmentVersionsHeaderMenuOpen, setEnvironmentVersionsHeaderMenuOpen] = useState(false);
          const [environmentVersionsSidebarOpen, setEnvironmentVersionsSidebarOpen] = useState(false);
          const [environmentVersionsDrawerContainer, setEnvironmentVersionsDrawerContainer] = useState(null);
          const [environmentVersionState, setEnvironmentVersionState] = useState({
            status: "idle",
            message: "",
            error: "",
          });
          const [environmentVersionsLoadState, setEnvironmentVersionsLoadState] = useState({
            environmentId: "",
            status: "idle",
            error: "",
          });
          const environmentVersionApiClient = useMemo(() => new RunnerClient(), []);
          const [environmentVersionSaveDialog, setEnvironmentVersionSaveDialog] = useState(null);
          const [environmentVersionModal, setEnvironmentVersionModal] = useState(null);
          const [environmentVersionModalVisible, setEnvironmentVersionModalVisible] = useState(false);
          const [environmentVersionModalClosing, setEnvironmentVersionModalClosing] = useState(false);
          const [environmentVersionDescriptionDraft, setEnvironmentVersionDescriptionDraft] = useState("");
          const [isEnvironmentVersionDescriptionEditing, setIsEnvironmentVersionDescriptionEditing] = useState(false);
          const [environmentVersionChangesState, setEnvironmentVersionChangesState] = useState(null);
          const [openEnvironmentVersionMenuId, setOpenEnvironmentVersionMenuId] = useState("");
          const [environmentShareTeamModalOpen, setEnvironmentShareTeamModalOpen] = useState(false);
          const [environmentShareTeamModalVisible, setEnvironmentShareTeamModalVisible] = useState(false);
          const [environmentShareTeamModalClosing, setEnvironmentShareTeamModalClosing] = useState(false);
          const [environmentShareTeamPickerValue, setEnvironmentShareTeamPickerValue] = useState("");
          const [environmentShareTeamError, setEnvironmentShareTeamError] = useState("");
          const [environmentShareTeamTargetEnvironment, setEnvironmentShareTeamTargetEnvironment] = useState(null);
          const [environmentShareTeamTargetEnvironmentIds, setEnvironmentShareTeamTargetEnvironmentIds] = useState([]);
          const [environmentShareTeamState, setEnvironmentShareTeamState] = useState({
            teamId: "",
            action: "",
            error: "",
          });
          const [environmentApiModalOpen, setEnvironmentApiModalOpen] = useState(false);
          const [environmentApiModalVisible, setEnvironmentApiModalVisible] = useState(false);
          const [environmentApiModalClosing, setEnvironmentApiModalClosing] = useState(false);
          const [environmentApiSnippetTab, setEnvironmentApiSnippetTab] = useState("curl");
          const [environmentApiAgentId, setEnvironmentApiAgentId] = useState("");
          const [copiedEnvironmentApiSnippet, setCopiedEnvironmentApiSnippet] = useState("");
          const [environmentDetailCopiedFact, setEnvironmentDetailCopiedFact] = useState("");
          const [environmentRenameState, setEnvironmentRenameState] = useState(null);
          const [environmentRenameValue, setEnvironmentRenameValue] = useState("");
          const [environmentRenameError, setEnvironmentRenameError] = useState("");
          const [serverActionsPopoverOpen, setServerActionsPopoverOpen] = useState(false);
          const [resourceOverviewTopNavMenuOpen, setResourceOverviewTopNavMenuOpen] = useState(false);
          const [serverPublishMenuOpen, setServerPublishMenuOpen] = useState(false);
          const [serverVersionsHeaderMenuOpen, setServerVersionsHeaderMenuOpen] = useState(false);
          const [serverVersionsSidebarOpen, setServerVersionsSidebarOpen] = useState(false);
          const [serverVersionState, setServerVersionState] = useState({
            status: "idle",
            message: "",
            error: "",
          });
          const [serverVersionsLoadState, setServerVersionsLoadState] = useState({
            serverId: "",
            status: "idle",
            error: "",
          });
          const serverVersionApiClient = useMemo(() => new RunnerClient((url, init = {}) => fetch(url, {
            ...init,
            cache: "no-store",
            priority: "high",
          })), []);
          const [serverVersionSaveDialog, setServerVersionSaveDialog] = useState(null);
          const [serverVersionReviewSnapshot, setServerVersionReviewSnapshot] = useState(null);
          const [serverVersionModal, setServerVersionModal] = useState(null);
          const [serverVersionModalVisible, setServerVersionModalVisible] = useState(false);
          const [serverVersionModalClosing, setServerVersionModalClosing] = useState(false);
          const [serverVersionNameDraft, setServerVersionNameDraft] = useState("");
          const [serverVersionDescriptionDraft, setServerVersionDescriptionDraft] = useState("");
          const [isServerVersionDescriptionEditing, setIsServerVersionDescriptionEditing] = useState(false);
          const [serverVersionChangesState, setServerVersionChangesState] = useState(null);
          const [openServerVersionMenuId, setOpenServerVersionMenuId] = useState("");
          const [serverFileActionsPopoverOpen, setServerFileActionsPopoverOpen] = useState(false);
          const [serverCodeAddFileMenuOpen, setServerCodeAddFileMenuOpen] = useState(false);
          const [serverSourceFileMenuPath, setServerSourceFileMenuPath] = useState("");
          const [serverSourceExpandedFolders, setServerSourceExpandedFolders] = useState(() => new Set());
          const serverSourceDraftContentsRef = useRef(new Map());
          const [serverDeploymentHelpOpen, setServerDeploymentHelpOpen] = useState(false);
          const [serverCustomDomainModalState, setServerCustomDomainModalState] = useState({
            open: false,
            domain: "",
            status: "idle",
            error: "",
            result: null,
          });
          const [serverCustomDomainRemoveState, setServerCustomDomainRemoveState] = useState({
            domain: "",
            status: "idle",
            error: "",
          });
          const [serverAgentRuntimeRunComposer, setServerAgentRuntimeRunComposer] = useState({
            open: false,
            title: "",
            prompt: "",
            mode: "async",
            error: "",
            isSubmitting: false,
          });
          const [isServerAgentRuntimeRunPromptEditing, setIsServerAgentRuntimeRunPromptEditing] = useState(false);
          const [agentRuntimeSkillsPopoverOpen, setAgentRuntimeSkillsPopoverOpen] = useState(false);
          const [agentRuntimeSkillsTab, setAgentRuntimeSkillsTab] = useState("system");
          const [runtimeCustomSkills, setRuntimeCustomSkills] = useState([]);
          const [runtimeCustomSkillsLoading, setRuntimeCustomSkillsLoading] = useState(false);
          const [hasLoadedRuntimeCustomSkills, setHasLoadedRuntimeCustomSkills] = useState(false);
          const [serverAgentPickerMode, setServerAgentPickerMode] = useState("agents");
          const [serverRenameState, setServerRenameState] = useState(null);
          const [serverRenameValue, setServerRenameValue] = useState("");
          const [serverRenameError, setServerRenameError] = useState("");
          const [serverDetailSelectPopover, setServerDetailSelectPopover] = useState("");
          const [databaseActionsPopoverOpen, setDatabaseActionsPopoverOpen] = useState(false);
          const [databaseRenameState, setDatabaseRenameState] = useState(null);
          const [databaseRenameValue, setDatabaseRenameValue] = useState("");
          const [databaseRenameError, setDatabaseRenameError] = useState("");
          const [environmentComposerOpen, setEnvironmentComposerOpen] = useState(false);
          const [serverComposerOpen, setServerComposerOpen] = useState(false);
          const [environmentComposerDraft, setEnvironmentComposerDraft] = useState(() => buildPlaygroundDefaultEnvironmentDraft());
          const [serverComposerDraft, setServerComposerDraft] = useState(() => buildPlaygroundDefaultServerDraft());
          const [environmentComposerSaveState, setEnvironmentComposerSaveState] = useState({
            isSaving: false,
            error: "",
          });
          const [serverComposerSaveState, setServerComposerSaveState] = useState({
            isSaving: false,
            error: "",
          });
          const [isServerComposerDescriptionEditing, setIsServerComposerDescriptionEditing] = useState(false);
          const [environmentComposerRuntimePopover, setEnvironmentComposerRuntimePopover] = useState("");
          const [environmentListActionMenuState, setEnvironmentListActionMenuState] = useState(null);
          const [environmentListActionMenuClosing, setEnvironmentListActionMenuClosing] = useState(false);
          const [environmentBulkActionMenuState, setEnvironmentBulkActionMenuState] = useState(null);
          const [environmentBulkActionMenuClosing, setEnvironmentBulkActionMenuClosing] = useState(false);
          const [serverResourceActionMenuState, setServerResourceActionMenuState] = useState(null);
          const [environmentAnalyticsErrorById, setEnvironmentAnalyticsErrorById] = useState({});
          const [environmentHomeCostSummaryError, setEnvironmentHomeCostSummaryError] = useState("");
          const [environmentHomeCostBreakdownError, setEnvironmentHomeCostBreakdownError] = useState("");
          const [environmentHomeChartSummariesError, setEnvironmentHomeChartSummariesError] = useState("");
          const [environmentHomeChartBreakdownsError, setEnvironmentHomeChartBreakdownsError] = useState("");
          const [serverListLoading, setServerListLoading] = useState(false);
          const [databaseListLoading, setDatabaseListLoading] = useState(false);
          const [loadingServerFilesId, setLoadingServerFilesId] = useState("");
          const [loadingDatabaseCollectionsId, setLoadingDatabaseCollectionsId] = useState("");
          const [loadingDatabaseDocumentsKey, setLoadingDatabaseDocumentsKey] = useState("");
          const [serverFileTransferState, setServerFileTransferState] = useState({
            isUploading: false,
            error: "",
            message: "",
          });
          const [isServerFileDragging, setIsServerFileDragging] = useState(false);
          const [serverFileEditorState, setServerFileEditorState] = useState({
            path: "",
            status: "idle",
            value: "",
            initialValue: "",
            error: "",
            saveError: "",
            saveMessage: "",
            isSaving: false,
            wordWrap: true,
          });
          const [serverFileEditorHistoryByKey, setServerFileEditorHistoryByKey] = useState({});
          const [serverDeploymentState, setServerDeploymentState] = useState({
            isDeploying: false,
            isInvoking: false,
            error: "",
            message: "",
            lastResponseText: "",
            deployProgress: 0,
          });
          const [serverDeploymentStatusDismissed, setServerDeploymentStatusDismissed] = useState(false);
          const [serverDeploymentHistoryState, setServerDeploymentHistoryState] = useState({
            error: "",
            rollingBackDeploymentId: "",
          });
          const [serverDetailTab, setServerDetailTab] = useState("usage");
          const [serverInvokeSnippetTab, setServerInvokeSnippetTab] = useState("curl");
          const [copiedFunctionServiceUrl, setCopiedFunctionServiceUrl] = useState("");
          const [serverAnalyticsView, setServerAnalyticsView] = useState("editor");
          const [serverLogsState, setServerLogsState] = useState({
            kind: "request",
            loadingKey: "",
            error: "",
          });
          const [serverLogsSearchQuery, setServerLogsSearchQuery] = useState("");
          const [serverLogsSort, setServerLogsSort] = useState("newest");
          const [serverLogsToolbarPopover, setServerLogsToolbarPopover] = useState("");
          const [serverLogsVisibleCountByKind, setServerLogsVisibleCountByKind] = useState({
            request: 20,
            runtime: 20,
            deployment: 20,
          });
          const [expandedServerLogKey, setExpandedServerLogKey] = useState("");
          const [serverAuthUsersState, setServerAuthUsersState] = useState({
            error: "",
          });
          const [serverAuthSearchQuery, setServerAuthSearchQuery] = useState("");
          const [serverSecretsState, setServerSecretsState] = useState({
            error: "",
          });
          const [serverSecretsSearchQuery, setServerSecretsSearchQuery] = useState("");
          const [serverSecretComposerState, setServerSecretComposerState] = useState({
            open: false,
            secretId: "",
            name: "",
            description: "",
            value: "",
            error: "",
            isSaving: false,
          });
          const [isServerSecretDescriptionEditing, setIsServerSecretDescriptionEditing] = useState(false);
          const [serverAuthUserComposerState, setServerAuthUserComposerState] = useState({
            open: false,
            email: "",
            password: "",
            displayName: "",
            error: "",
            isSaving: false,
          });
          const [serverAuthAnalyticsVisibility, setServerAuthAnalyticsVisibility] = useState({
            users: true,
            verified: true,
            signins: true,
            email: true,
            external: true,
          });
          const [serverAnalyticsVisibility, setServerAnalyticsVisibility] = useState({
            requests: true,
            success: true,
            latency: true,
            errors: true,
          });
          const [serverAgentRuntimeAnalyticsVisibility, setServerAgentRuntimeAnalyticsVisibility] = useState({
            runs: true,
            completed: true,
            failed: true,
            running: true,
            cancelled: true,
          });
          const [hasLoadedServers, setHasLoadedServers] = useState(false);
          const [loadedServerListScope, setLoadedServerListScope] = useState("");
          const [hasLoadedVoiceAgents, setHasLoadedVoiceAgents] = useState(false);
          const [hasLoadedDatabases, setHasLoadedDatabases] = useState(() => Number(initialDatabaseListCacheRecord?.loadedAt || 0) > 0);
          const [databaseCollectionsById, setDatabaseCollectionsById] = useState({});
          const [databaseDocumentsByCollectionKey, setDatabaseDocumentsByCollectionKey] = useState({});
          const [selectedDatabaseCollectionId, setSelectedDatabaseCollectionId] = useState("");
          const [selectedDatabaseDocumentId, setSelectedDatabaseDocumentId] = useState("");
          const [databaseDocumentEditorState, setDatabaseDocumentEditorState] = useState({
            documentId: "",
            value: "{}",
            initialValue: "{}",
            error: "",
            saveError: "",
            saveMessage: "",
            isLoading: false,
            isSaving: false,
          });
          const [databaseDocumentViewMode, setDatabaseDocumentViewMode] = useState("preview");
          const [databaseJsonEditorModule, setDatabaseJsonEditorModule] = useState(null);
          const [databaseJsonEditorModuleError, setDatabaseJsonEditorModuleError] = useState("");
          const [serverPreviewEditorModule, setServerPreviewEditorModule] = useState(null);
          const [serverPreviewEditorModuleError, setServerPreviewEditorModuleError] = useState("");
          const [databaseCollectionComposerState, setDatabaseCollectionComposerState] = useState({
            open: false,
            name: "items",
            error: "",
            isSaving: false,
          });
          const [databaseDocumentComposerState, setDatabaseDocumentComposerState] = useState({
            open: false,
            documentId: "",
            error: "",
            isSaving: false,
          });
          const [databaseCollectionActionsOpen, setDatabaseCollectionActionsOpen] = useState(false);
          const [databaseDocumentActionsOpen, setDatabaseDocumentActionsOpen] = useState(false);
          const [databaseFieldExpansionState, setDatabaseFieldExpansionState] = useState({});
          const [databaseFieldComposerState, setDatabaseFieldComposerState] = useState({
            open: false,
            parentPath: [],
            key: "",
            type: "string",
            value: "",
            error: "",
          });
          const [availableRuntimes, setAvailableRuntimes] = useState(PLAYGROUND_DEFAULT_AVAILABLE_RUNTIMES);
          const [modifiedSecrets, setModifiedSecrets] = useState({});
          const [modifiedMcpTokens, setModifiedMcpTokens] = useState({});
          const [packageComposerState, setPackageComposerState] = useState({
            type: "",
            value: "",
          });
          const [environmentRuntimeState, setEnvironmentRuntimeState] = useState({
            status: "idle",
            containerId: "",
            message: "",
          });
          const [environmentGuiOpen, setEnvironmentGuiOpen] = useState(false);
          const [environmentGuiFrameUrl, setEnvironmentGuiFrameUrl] = useState("");
          const [environmentGuiState, setEnvironmentGuiState] = useState({
            isStarting: false,
            isLoading: false,
            error: "",
            lastLoadedAt: "",
          });
          const [environmentGuiInputValue, setEnvironmentGuiInputValue] = useState("");
  
          useEffect(() => {
            if (!embeddedInResources) {
              return;
            }
            setResourceMode(embeddedResourcesView === "servers" ? "servers" : "computers");
          }, [embeddedInResources, embeddedResourcesView]);
  
          useEffect(() => () => {
            if (environmentListActionMenuCloseTimerRef.current !== null) {
              window.clearTimeout(environmentListActionMenuCloseTimerRef.current);
              environmentListActionMenuCloseTimerRef.current = null;
            }
            if (environmentBulkActionMenuCloseTimerRef.current !== null) {
              window.clearTimeout(environmentBulkActionMenuCloseTimerRef.current);
              environmentBulkActionMenuCloseTimerRef.current = null;
            }
          }, []);
  
          useEffect(() => {
            if (resourceMode === "servers") {
              setResourcesOverviewHomeTab("general");
            }
          }, [resourceMode]);
  
          const orderedEnvironments = useMemo(() => {
            return [...environments].sort((left, right) => {
              if (Boolean(left?.isDefault) !== Boolean(right?.isDefault)) {
                return left?.isDefault ? -1 : 1;
              }
              return String(left?.name || "").localeCompare(String(right?.name || ""));
            });
          }, [environments]);
  
          const defaultAgentRuntimeEnvironmentId = useMemo(() => {
            const defaultEnvironment = orderedEnvironments.find((environment) => environment?.isDefault) || orderedEnvironments[0] || null;
            return String(defaultEnvironment?.id || "").trim();
          }, [orderedEnvironments]);
  
          const normalizedResourceTemplatePreviewResources = useMemo(() => {
            return (Array.isArray(resourceTemplatePreviewResources) ? resourceTemplatePreviewResources : [])
              .map((item) => {
                const resourceType = item?.resourceType === "database" ? "database" : "server";
                const record = resourceType === "database"
                  ? normalizePlaygroundDatabaseRecord(item?.database || item?.record || item)
                  : normalizePlaygroundServerRecord(item?.server || item?.record || item);
                if (!record?.id || !isPlaygroundResourceTemplatePreviewRecord(record)) {
                  return null;
                }
                const files = resourceType === "server" && Array.isArray(item?.files) ? item.files : [];
                const collections = resourceType === "database" && Array.isArray(item?.collections) ? item.collections : [];
                const documentsByCollectionId = resourceType === "database" && item?.documentsByCollectionId && typeof item.documentsByCollectionId === "object" && !Array.isArray(item.documentsByCollectionId)
                  ? item.documentsByCollectionId
                  : {};
                return {
                  id: record.id,
                  resourceType,
                  record,
                  files,
                  collections,
                  documentsByCollectionId,
                };
              })
              .filter(Boolean);
          }, [resourceTemplatePreviewResources]);
  
          const resourceTemplatePreviewServerRecordById = useMemo(() => {
            const next = {};
            normalizedResourceTemplatePreviewResources.forEach((preview) => {
              if (preview.resourceType === "server" && preview.record?.id) {
                next[preview.record.id] = preview.record;
              }
            });
            return next;
          }, [normalizedResourceTemplatePreviewResources]);
  
          const resourceTemplatePreviewDatabaseRecordById = useMemo(() => {
            const next = {};
            normalizedResourceTemplatePreviewResources.forEach((preview) => {
              if (preview.resourceType === "database" && preview.record?.id) {
                next[preview.record.id] = preview.record;
              }
            });
            return next;
          }, [normalizedResourceTemplatePreviewResources]);
  
          const resourceTemplatePreviewServerFilesById = useMemo(() => {
            const next = {};
            normalizedResourceTemplatePreviewResources.forEach((preview) => {
              if (preview.resourceType !== "server" || !preview.record?.id) {
                return;
              }
              next[preview.record.id] = normalizePlaygroundEnvironmentInventory(preview.files || []);
            });
            return next;
          }, [normalizedResourceTemplatePreviewResources]);
  
          const resourceTemplatePreviewServerFileContentById = useMemo(() => {
            const next = {};
            normalizedResourceTemplatePreviewResources.forEach((preview) => {
              if (preview.resourceType !== "server" || !preview.record?.id) {
                return;
              }
              const fileContentByPath = {};
              (Array.isArray(preview.files) ? preview.files : []).forEach((file) => {
                const normalizedPath = normalizeHistoryPath(file?.path || "");
                if (!normalizedPath || typeof file?.content !== "string") {
                  return;
                }
                fileContentByPath[normalizedPath] = file.content;
              });
              next[preview.record.id] = fileContentByPath;
            });
            return next;
          }, [normalizedResourceTemplatePreviewResources]);
  
          const resourceTemplatePreviewDatabaseCollectionsById = useMemo(() => {
            const next = {};
            normalizedResourceTemplatePreviewResources.forEach((preview) => {
              if (preview.resourceType !== "database" || !preview.record?.id) {
                return;
              }
              next[preview.record.id] = (Array.isArray(preview.collections) ? preview.collections : [])
                .map((collection) => ({
                  id: String(collection?.id || collection?.name || "").trim(),
                  name: String(collection?.name || collection?.id || "").trim(),
                  documentCount: Math.max(0, Number(collection?.documentCount || 0) || 0),
                  createdAt: typeof collection?.createdAt === "string" ? collection.createdAt : "",
                  updatedAt: typeof collection?.updatedAt === "string" ? collection.updatedAt : "",
                }))
                .filter((collection) => collection.id);
            });
            return next;
          }, [normalizedResourceTemplatePreviewResources]);
  
          const resourceTemplatePreviewDatabaseDocumentsByCollectionKey = useMemo(() => {
            const next = {};
            normalizedResourceTemplatePreviewResources.forEach((preview) => {
              if (preview.resourceType !== "database" || !preview.record?.id) {
                return;
              }
              Object.entries(preview.documentsByCollectionId || {}).forEach(([collectionId, documents]) => {
                const normalizedCollectionId = String(collectionId || "").trim();
                if (!normalizedCollectionId) {
                  return;
                }
                next[preview.record.id + ":" + normalizedCollectionId] = (Array.isArray(documents) ? documents : [])
                  .map((document) => ({
                    id: String(document?.id || "").trim(),
                    data: document?.data && typeof document.data === "object" && !Array.isArray(document.data)
                      ? document.data
                      : {},
                  }))
                  .filter((document) => document.id);
              });
            });
            return next;
          }, [normalizedResourceTemplatePreviewResources]);
  
          const activeResourceTemplatePreviewServerIds = useMemo(() => {
            const next = new Set();
            const currentId = String(selectedServerId || "").trim();
            if (currentId) {
              next.add(currentId);
            }
            const targetId = String(navigationTargetResourceId || "").trim();
            if (targetId && navigationTargetResourceType !== "database") {
              next.add(targetId);
            }
            return next;
          }, [navigationTargetResourceId, navigationTargetResourceType, selectedServerId]);
  
          const activeResourceTemplatePreviewDatabaseIds = useMemo(() => {
            const next = new Set();
            const currentId = String(selectedDatabaseId || "").trim();
            if (currentId) {
              next.add(currentId);
            }
            const targetId = String(navigationTargetResourceId || "").trim();
            if (targetId && navigationTargetResourceType === "database") {
              next.add(targetId);
            }
            return next;
          }, [navigationTargetResourceId, navigationTargetResourceType, selectedDatabaseId]);
  
          const environmentListActionTarget = useMemo(() => {
            if (!environmentListActionMenuState?.environmentId) {
              return null;
            }
            return orderedEnvironments.find((environment) => environment.id === environmentListActionMenuState.environmentId)
              || environmentListActionMenuState.environmentRecord
              || null;
          }, [environmentListActionMenuState, orderedEnvironments]);
  
          function normalizeEnvironmentActionTarget(environmentRecord) {
            const normalizedId = String(environmentRecord?.id || "").trim();
            if (!normalizedId || normalizedId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return null;
            }
            const matchingEnvironment = environmentDetailsById[normalizedId]
              || orderedEnvironments.find((environment) => String(environment?.id || "").trim() === normalizedId)
              || environmentRecord
              || null;
            return matchingEnvironment ? normalizePlaygroundEnvironmentRecord(matchingEnvironment) : null;
          }
  
          function normalizeEnvironmentActionTargets(environmentRecords = []) {
            const sourceRecords = Array.isArray(environmentRecords) ? environmentRecords : [environmentRecords];
            const seen = new Set();
            return sourceRecords
              .map((environmentRecord) => normalizeEnvironmentActionTarget(environmentRecord))
              .filter((environmentRecord) => {
                const normalizedId = String(environmentRecord?.id || "").trim();
                if (!normalizedId || seen.has(normalizedId)) {
                  return false;
                }
                seen.add(normalizedId);
                return true;
              });
          }
  
          function getEnvironmentActionTargetsByIds(environmentIds = []) {
            const sourceIds = Array.isArray(environmentIds) ? environmentIds : [environmentIds];
            return normalizeEnvironmentActionTargets(
              sourceIds.map((environmentId) => {
                const normalizedId = String(environmentId || "").trim();
                if (!normalizedId) return null;
                return environmentDetailsById[normalizedId]
                  || orderedEnvironments.find((environment) => String(environment?.id || "").trim() === normalizedId)
                  || null;
              })
            );
          }
  
          const orderedServers = useMemo(() => {
            const activePreviewServers = Object.values(resourceTemplatePreviewServerRecordById)
              .filter((server) => activeResourceTemplatePreviewServerIds.has(server.id));
            return [...servers, ...activePreviewServers].sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));
          }, [activeResourceTemplatePreviewServerIds, resourceTemplatePreviewServerRecordById, servers]);
  
          const orderedDatabases = useMemo(() => {
            const activePreviewDatabases = Object.values(resourceTemplatePreviewDatabaseRecordById)
              .filter((database) => activeResourceTemplatePreviewDatabaseIds.has(database.id));
            return [...databases, ...activePreviewDatabases].sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));
          }, [activeResourceTemplatePreviewDatabaseIds, databases, resourceTemplatePreviewDatabaseRecordById]);
  
          const selectedServerTemplatePreview = selectedServerId ? resourceTemplatePreviewServerRecordById[selectedServerId] || null : null;
          const selectedDatabaseTemplatePreview = selectedDatabaseId ? resourceTemplatePreviewDatabaseRecordById[selectedDatabaseId] || null : null;
          const isSelectedServerTemplatePreview = Boolean(selectedServerTemplatePreview);
          const isSelectedDatabaseTemplatePreview = Boolean(selectedDatabaseTemplatePreview);
  
          const currentServerFiles = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
            const items = Array.isArray(serverFilesById[selectedServerId])
              ? serverFilesById[selectedServerId]
              : Array.isArray(resourceTemplatePreviewServerFilesById[selectedServerId])
                ? resourceTemplatePreviewServerFilesById[selectedServerId]
                : [];
            return [...items].sort((left, right) => {
              if (Boolean(left?.isFolder) !== Boolean(right?.isFolder)) {
                return left?.isFolder ? -1 : 1;
              }
              return String(left?.path || "").localeCompare(String(right?.path || ""));
            });
          }, [resourceTemplatePreviewServerFilesById, selectedServerId, serverFilesById]);
  
          const hasLoadedCurrentServerFiles = useMemo(() => {
            return Boolean(selectedServerId)
              && selectedServerId !== PLAYGROUND_SERVER_DRAFT_ID
              && (
                Object.prototype.hasOwnProperty.call(serverFilesById, selectedServerId)
                || Object.prototype.hasOwnProperty.call(resourceTemplatePreviewServerFilesById, selectedServerId)
              );
          }, [resourceTemplatePreviewServerFilesById, selectedServerId, serverFilesById]);
  
          const currentServerFilesTree = useMemo(() => buildPlaygroundEnvironmentTree(currentServerFiles), [currentServerFiles]);
          const visibleServerSourceFileRows = useMemo(
            () => buildPlaygroundEnvironmentVisibleRows(currentServerFilesTree, "", serverSourceExpandedFolders, "name-asc"),
            [currentServerFilesTree, serverSourceExpandedFolders]
          );
  
          const currentServerEditorEntry = useMemo(() => {
            if (!serverFileEditorState.path) {
              return null;
            }
            return currentServerFiles.find((entry) => entry.path === serverFileEditorState.path) || null;
          }, [currentServerFiles, serverFileEditorState.path]);
  
          const currentServerAnalytics = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            return serverAnalyticsById[selectedServerId] || null;
          }, [selectedServerId, serverAnalyticsById]);
  
          const currentServerLogs = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return {};
            }
            return serverLogsById[selectedServerId] || {};
          }, [selectedServerId, serverLogsById]);
  
          const currentServerDeployments = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
            return Array.isArray(serverDeploymentsById[selectedServerId]) ? serverDeploymentsById[selectedServerId] : [];
          }, [selectedServerId, serverDeploymentsById]);
  
          const currentServerContext = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            return serverContextsById[selectedServerId] || null;
          }, [selectedServerId, serverContextsById]);
  
          const currentServerBindings = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
            return Array.isArray(serverBindingsById[selectedServerId]) ? serverBindingsById[selectedServerId] : [];
          }, [selectedServerId, serverBindingsById]);
  
          const currentServerAuthUsers = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
            return Array.isArray(serverAuthUsersById[selectedServerId]?.users) ? serverAuthUsersById[selectedServerId].users : [];
          }, [selectedServerId, serverAuthUsersById]);
  
          const currentServerAuthProjectId = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return "";
            }
            return typeof serverAuthUsersById[selectedServerId]?.projectId === "string" ? serverAuthUsersById[selectedServerId].projectId : "";
          }, [selectedServerId, serverAuthUsersById]);
  
          const currentServerSecrets = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
            return Array.isArray(serverSecretsById[selectedServerId]) ? serverSecretsById[selectedServerId] : [];
          }, [selectedServerId, serverSecretsById]);
  
          const currentServerAgentRuntimeRuns = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
            return Array.isArray(serverAgentRuntimeRunsById[selectedServerId]) ? serverAgentRuntimeRunsById[selectedServerId] : [];
          }, [selectedServerId, serverAgentRuntimeRunsById]);
  
          const filteredServerAuthUsers = useMemo(() => {
            const query = String(serverAuthSearchQuery || "").trim().toLowerCase();
            if (!query) {
              return currentServerAuthUsers;
            }
            return currentServerAuthUsers.filter((user) => getPlaygroundAuthUserSearchText(user).includes(query));
          }, [currentServerAuthUsers, serverAuthSearchQuery]);
  
          const filteredServerSecrets = useMemo(() => {
            const query = String(serverSecretsSearchQuery || "").trim().toLowerCase();
            if (!query) {
              return currentServerSecrets;
            }
            return currentServerSecrets.filter((secret) =>
              [
                secret?.name || "",
                secret?.description || "",
                secret?.id || "",
              ].join(" ").toLowerCase().includes(query)
            );
          }, [currentServerSecrets, serverSecretsSearchQuery]);
  
          const selectedServerSnapshot = useMemo(() => {
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            return serverDetailsById[selectedServerId]
              || orderedServers.find((server) => server.id === selectedServerId)
              || null;
          }, [orderedServers, selectedServerId, serverDetailsById]);
  
          const displayServers = useMemo(() => {
            const items = [...orderedServers];
            if (selectedServerId === PLAYGROUND_SERVER_DRAFT_ID && draftServer) {
              items.unshift({
                ...draftServer,
                id: PLAYGROUND_SERVER_DRAFT_ID,
              });
            }
            return items;
          }, [draftServer, orderedServers, selectedServerId]);
  
          const displayServerResources = useMemo(() => {
            const serverItems = displayServers.map((server) => ({
              ...server,
              resourceType: "server",
            }));
            const databaseItems = orderedDatabases.map((database) => ({
              ...database,
              kind: "database",
              resourceType: "database",
            }));
            return [...serverItems, ...databaseItems].sort((left, right) =>
              String(left?.name || "").localeCompare(String(right?.name || ""))
            );
          }, [displayServers, orderedDatabases]);
  
          const normalizedEmbeddedServerKind = useMemo(() => {
            if (!embeddedInResources || embeddedResourcesView !== "servers") {
              return "";
            }
            return normalizePlaygroundServerOverviewKind(embeddedServerKind);
          }, [embeddedInResources, embeddedResourcesView, embeddedServerKind]);
          const previousEmbeddedServerKindRef = useRef(normalizedEmbeddedServerKind);
  
          const visibleDisplayServerResources = useMemo(() => {
            if (!normalizedEmbeddedServerKind) {
              return displayServerResources;
            }
            return displayServerResources.filter((resource) => {
              const normalizedKind = resource?.resourceType === "database"
                ? "database"
                : canonicalizePlaygroundServerKind(resource?.kind);
              return normalizedKind === normalizedEmbeddedServerKind;
            });
          }, [displayServerResources, normalizedEmbeddedServerKind]);
  
          const serverResourceActionTarget = useMemo(() => {
            if (!serverResourceActionMenuState?.resourceId) {
              return null;
            }
            return displayServerResources.find((resource) =>
              resource.id === serverResourceActionMenuState.resourceId
              && resource.resourceType === serverResourceActionMenuState.resourceType
            )
              || serverResourceActionMenuState.resourceRecord
              || null;
          }, [displayServerResources, serverResourceActionMenuState]);
  
          const selectedDatabaseSnapshot = useMemo(() => {
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }
            return databaseDetailsById[selectedDatabaseId]
              || orderedDatabases.find((database) => database.id === selectedDatabaseId)
              || null;
          }, [databaseDetailsById, orderedDatabases, selectedDatabaseId]);
  
          const currentDatabaseCollections = useMemo(() => {
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return [];
            }
            return Array.isArray(databaseCollectionsById[selectedDatabaseId])
              ? databaseCollectionsById[selectedDatabaseId]
              : Array.isArray(resourceTemplatePreviewDatabaseCollectionsById[selectedDatabaseId])
                ? resourceTemplatePreviewDatabaseCollectionsById[selectedDatabaseId]
                : [];
          }, [databaseCollectionsById, resourceTemplatePreviewDatabaseCollectionsById, selectedDatabaseId]);
  
          const currentDatabaseDocuments = useMemo(() => {
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID || !selectedDatabaseCollectionId) {
              return [];
            }
            const key = selectedDatabaseId + ":" + selectedDatabaseCollectionId;
            return Array.isArray(databaseDocumentsByCollectionKey[key])
              ? databaseDocumentsByCollectionKey[key]
              : Array.isArray(resourceTemplatePreviewDatabaseDocumentsByCollectionKey[key])
                ? resourceTemplatePreviewDatabaseDocumentsByCollectionKey[key]
                : [];
          }, [databaseDocumentsByCollectionKey, resourceTemplatePreviewDatabaseDocumentsByCollectionKey, selectedDatabaseCollectionId, selectedDatabaseId]);
  
          const currentDatabaseCollection = useMemo(() => {
            return currentDatabaseCollections.find((collection) => collection.id === selectedDatabaseCollectionId) || null;
          }, [currentDatabaseCollections, selectedDatabaseCollectionId]);
  
          const selectedEnvironmentSnapshot = useMemo(() => {
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return null;
            }
            return environmentDetailsById[selectedEnvironmentId]
              || orderedEnvironments.find((environment) => environment.id === selectedEnvironmentId)
              || null;
          }, [environmentDetailsById, orderedEnvironments, selectedEnvironmentId]);
  
          const environmentApiAgentOptions = useMemo(() => {
            const seen = new Set();
            return ensurePlaygroundComposerDefaultChoices(Array.isArray(agents) ? agents : [])
              .map((agent) => buildPlaygroundRunnerAgentOption(agent, preferredAgentId && String(agent?.id || "").trim() === String(preferredAgentId || "").trim() ? { isDefault: true } : {}))
              .filter((agent) => {
                const id = String(agent?.id || "").trim();
                if (!id || seen.has(id) || getPlaygroundAgentListMode(agent) !== "agents") {
                  return false;
                }
                seen.add(id);
                return true;
              })
              .sort((left, right) => {
                if (Boolean(left?.isDefault) !== Boolean(right?.isDefault)) {
                  return left?.isDefault ? -1 : 1;
                }
                return String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || ""));
              });
          }, [agents, preferredAgentId]);
  
          const environmentApiDefaultAgentId = useMemo(() => {
            const normalizedPreferredAgentId = String(preferredAgentId || "").trim();
            if (normalizedPreferredAgentId && environmentApiAgentOptions.some((agent) => agent.id === normalizedPreferredAgentId)) {
              return normalizedPreferredAgentId;
            }
            return String(
              environmentApiAgentOptions.find((agent) => agent?.isDefault && getPlaygroundAgentListMode(agent) === "agents")?.id
              || environmentApiAgentOptions.find((agent) => getPlaygroundAgentListMode(agent) === "agents")?.id
              || environmentApiAgentOptions[0]?.id
              || "agent_assistant"
            ).trim();
          }, [environmentApiAgentOptions, preferredAgentId]);
  
          const selectedEnvironmentApiAgent = useMemo(() => {
            const normalizedAgentId = String(environmentApiAgentId || "").trim();
            return environmentApiAgentOptions.find((agent) => String(agent?.id || "").trim() === normalizedAgentId)
              || environmentApiAgentOptions.find((agent) => String(agent?.id || "").trim() === environmentApiDefaultAgentId)
              || null;
          }, [environmentApiAgentId, environmentApiAgentOptions, environmentApiDefaultAgentId]);
  
          function normalizeEnvironmentWorkspaceTeamOption(team) {
            const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
            const id = String(source.id || source.teamId || source.team_id || "").trim();
            if (!id) {
              return null;
            }
            const name = String(source.name || source.title || source.displayName || "Team").trim() || "Team";
            const roleId = normalizePlaygroundTeamRoleId(
              source.role || source.membershipRole || source.membership_role || source.currentUserRole || source.current_user_role,
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
  
          function getEnvironmentMetadataRecord(environmentRecord) {
            return environmentRecord?.metadata && typeof environmentRecord.metadata === "object" && !Array.isArray(environmentRecord.metadata)
              ? environmentRecord.metadata
              : {};
          }
  
          function getEnvironmentSharedTeamIds(environmentRecord) {
            const metadata = getEnvironmentMetadataRecord(environmentRecord);
            const source = Array.isArray(metadata.sharedTeamIds)
              ? metadata.sharedTeamIds
              : Array.isArray(metadata.teamAccessIds)
                ? metadata.teamAccessIds
                : Array.isArray(environmentRecord?.sharedTeamIds)
                  ? environmentRecord.sharedTeamIds
                  : [];
            return Array.from(new Set(
              source.map((teamId) => String(teamId || "").trim()).filter(Boolean)
            ));
          }
  
          const normalizedEnvironmentWorkspaceTeams = useMemo(() => (
            (Array.isArray(workspaceTeams) ? workspaceTeams : [])
              .map(normalizeEnvironmentWorkspaceTeamOption)
              .filter(Boolean)
          ), [workspaceTeams]);
  
          const environmentSharedTeamIds = useMemo(() => getEnvironmentSharedTeamIds(draftEnvironment), [draftEnvironment]);
          const environmentSharedTeamIdSet = useMemo(() => new Set(environmentSharedTeamIds), [environmentSharedTeamIds]);
          const environmentShareTeamById = useMemo(() => {
            const next = new Map();
            normalizedEnvironmentWorkspaceTeams.forEach((team) => {
              if (team?.id) {
                next.set(team.id, team);
              }
            });
            return next;
          }, [normalizedEnvironmentWorkspaceTeams]);
          const availableEnvironmentShareTeams = useMemo(() => (
            normalizedEnvironmentWorkspaceTeams.filter((team) => ["admin", "owner"].includes(team.roleId || ""))
          ), [normalizedEnvironmentWorkspaceTeams]);
          const defaultEnvironmentShareTeamId = useMemo(() => {
            return (
              availableEnvironmentShareTeams.find((team) => !environmentSharedTeamIdSet.has(team.id))?.id
              || availableEnvironmentShareTeams[0]?.id
              || ""
            );
          }, [availableEnvironmentShareTeams, environmentSharedTeamIdSet]);
  
          function getDefaultEnvironmentShareTeamIdForEnvironments(targetEnvironments = []) {
            const normalizedTargets = normalizeEnvironmentActionTargets(targetEnvironments);
            if (normalizedTargets.length === 0) {
              return defaultEnvironmentShareTeamId;
            }
            return (
              availableEnvironmentShareTeams.find((team) => (
                normalizedTargets.some((environmentRecord) => !getEnvironmentSharedTeamIds(environmentRecord).includes(team.id))
              ))?.id
              || availableEnvironmentShareTeams[0]?.id
              || ""
            );
          }
  
          function getEnvironmentShareTeamTargets() {
            return environmentShareTeamTargetEnvironmentIds.length > 0
              ? getEnvironmentActionTargetsByIds(environmentShareTeamTargetEnvironmentIds)
              : normalizeEnvironmentActionTargets([environmentShareTeamTargetEnvironment || draftEnvironment]);
          }
  
          const displayEnvironments = useMemo(() => {
            const items = [...orderedEnvironments];
            if (selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID && draftEnvironment) {
              items.unshift({
                ...draftEnvironment,
                id: PLAYGROUND_ENVIRONMENT_DRAFT_ID,
              });
            }
            return items;
          }, [draftEnvironment, orderedEnvironments, selectedEnvironmentId]);
  
          const searchResults = useMemo(() => {
            const query = searchPopupQuery.trim().toLowerCase();
            if (!query) return [];
            if (resourceMode === "servers") {
              return visibleDisplayServerResources
                .filter((resource) => {
                  const haystack = [resource?.name || "", resource?.description || ""].join(" ").toLowerCase();
                  return haystack.includes(query);
                })
                .slice(0, 12);
            }
            return displayEnvironments
              .filter((environment) => {
                const haystack = [environment?.name || ""].join(" ").toLowerCase();
                return haystack.includes(query);
              })
              .slice(0, 12);
          }, [displayEnvironments, resourceMode, searchPopupQuery, visibleDisplayServerResources]);
          const normalizedResourcesSearchQuery = String(searchPopupQuery || "").trim().toLowerCase();
          const filteredOverviewEnvironments = useMemo(() => {
            if (!normalizedResourcesSearchQuery) {
              return displayEnvironments;
            }
            return displayEnvironments.filter((environment) => {
              const haystack = [environment?.name || ""].join(" ").toLowerCase();
              return haystack.includes(normalizedResourcesSearchQuery);
            });
          }, [displayEnvironments, normalizedResourcesSearchQuery]);
          const filteredOverviewServerResources = useMemo(() => {
            if (!normalizedResourcesSearchQuery) {
              return visibleDisplayServerResources;
            }
            return visibleDisplayServerResources.filter((resource) => {
              const haystack = [resource?.name || "", resource?.description || ""].join(" ").toLowerCase();
              return haystack.includes(normalizedResourcesSearchQuery);
            });
          }, [normalizedResourcesSearchQuery, visibleDisplayServerResources]);
          const voiceAgentRecords = useMemo(() => {
            const loadedRecords = Object.values(voiceAgentRecordsById)
              .map((record) => normalizePlaygroundVoiceAgentRecord(record))
              .filter((record) => record?.agent?.id);
            const sourceRecords = loadedRecords.length > 0 || hasLoadedVoiceAgents
              ? loadedRecords
              : (Array.isArray(agents) ? agents : [])
                  .map((agent) => normalizePlaygroundVoiceAgentRecord({ agent }))
                  .filter((record) => record?.agent?.id && record.agent.id !== PLAYGROUND_AGENT_DRAFT_ID);
            return sourceRecords.slice().sort((left, right) =>
              String(left?.agent?.name || left?.agent?.id || "").localeCompare(String(right?.agent?.name || right?.agent?.id || ""))
            );
          }, [agents, hasLoadedVoiceAgents, voiceAgentRecordsById]);
          const filteredVoiceAgentRecords = useMemo(() => {
            if (!normalizedResourcesSearchQuery) {
              return voiceAgentRecords;
            }
            return voiceAgentRecords.filter((record) => {
              const agent = record?.agent || {};
              const phoneNumber = record?.phoneNumber || {};
              const haystack = [
                agent.name || "",
                agent.description || "",
                agent.id || "",
                phoneNumber.phoneNumber || "",
                record?.voice?.voiceId || "",
                record?.voice?.model || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedResourcesSearchQuery);
            });
          }, [normalizedResourcesSearchQuery, voiceAgentRecords]);
          const voiceEnabledAgentCount = useMemo(() => (
            voiceAgentRecords.filter((record) => {
              const mode = normalizePlaygroundVoiceAgentMode(record?.voice?.mode || record?.agent?.voiceMode);
              return mode !== "off" || Boolean(record?.phoneNumber?.phoneNumber);
            }).length
          ), [voiceAgentRecords]);
  
          useEffect(() => {
            if (resourceMode !== "servers" || !normalizedEmbeddedServerKind) {
              return;
            }
            if (resourcesOverviewFilter === "all" || resourcesOverviewFilter === "published") {
              return;
            }
            setResourcesOverviewFilter("all");
          }, [normalizedEmbeddedServerKind, resourceMode, resourcesOverviewFilter]);
  
          const environmentsHomeSummary = useMemo(() => {
            const webAppCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "web_app").length;
            const functionCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "function").length;
            const apiCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "api").length;
            const authCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "auth").length;
            const agentRuntimeCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "agent_runtime").length;
            const voiceAgentCount = voiceEnabledAgentCount;
            const secretsCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "secrets").length;
            const paymentsCount = orderedServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === "payments").length;
            const databaseCount = orderedDatabases.length;
            const managedResourceCount = databaseCount + authCount + agentRuntimeCount + voiceAgentCount + secretsCount + paymentsCount;
            return {
              computers: orderedEnvironments.length,
              webApps: webAppCount,
              functions: functionCount,
              apis: apiCount,
              auth: authCount,
              agentRuntimes: agentRuntimeCount,
              voiceAgents: voiceAgentCount,
              secrets: secretsCount,
              payments: paymentsCount,
              databases: databaseCount,
              managedResources: managedResourceCount,
              totalResources: webAppCount + functionCount + apiCount + managedResourceCount,
            };
          }, [orderedDatabases, orderedEnvironments, orderedServers, voiceEnabledAgentCount]);
  
  	        const selectedResourcesDetailTitle = useMemo(() => {
  	          if (serverComposerOpen && isServersMode && normalizedEmbeddedServerKind) {
  	            const serverKindLabel = formatPlaygroundServerKindLabel(normalizedEmbeddedServerKind);
  	            return "New " + (serverKindLabel || "Resource");
  	          }
  	          if (selectedDatabaseId) {
  	            return String(draftDatabase?.name || selectedDatabaseSnapshot?.name || "Database").trim() || "Database";
  	          }
            if (selectedServerId) {
              return String(draftServer?.name || selectedServerSnapshot?.name || "Server").trim() || "Server";
            }
            if (environmentComposerOpen && !isServersMode) {
              return String(environmentComposerDraft?.name || "New Computer").trim() || "New Computer";
            }
            if (selectedEnvironmentId) {
              return String(draftEnvironment?.name || selectedEnvironmentSnapshot?.name || "Computer").trim() || "Computer";
            }
            return resourceMode === "servers" ? "Server" : "Computer";
          }, [
            draftDatabase?.name,
            draftEnvironment?.name,
            draftServer?.name,
  	          environmentComposerDraft?.name,
  	          environmentComposerOpen,
  	          isServersMode,
  	          normalizedEmbeddedServerKind,
  	          resourceMode,
  	          serverComposerOpen,
  	          selectedDatabaseId,
  	          selectedDatabaseSnapshot?.name,
            selectedEnvironmentId,
            selectedEnvironmentSnapshot?.name,
            selectedServerId,
            selectedServerSnapshot?.name,
          ]);
  
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
  
          useEffect(() => {
  	          if (!embeddedInResources || typeof onResourcesHeaderChange !== "function") {
  	            return;
  	          }
            const isSourcePreviewOpen = resourceMode === "servers" && Boolean(serverFileEditorState.path) && serverDetailTab !== "code";
            const selectedResourcesDetailId = resourceMode === "servers"
              ? String(selectedDatabaseId || selectedServerId || "").trim()
              : String(selectedEnvironmentId || "").trim();
            const selectedResourcesDetailType = resourceMode === "servers"
              ? (selectedDatabaseId ? "database" : "server")
              : "computer";
            const isResourceCreateViewOpen = Boolean(serverComposerOpen && isServersMode && normalizedEmbeddedServerKind);
            const shouldUseDetailHeader = !isHomeViewActive || isResourceCreateViewOpen;
            const environmentDetailVersions = resourceMode === "computers"
              ? readDraftEnvironmentVersions()
              : [];
            const selectedEnvironmentDetailVersion = resourceMode === "computers"
              ? (
                  getDraftEnvironmentSelectedVersion()
                  || getDraftEnvironmentActiveVersion()
                  || environmentDetailVersions[0]
                  || null
                )
              : null;
            const selectedEnvironmentVersionNumber = selectedEnvironmentDetailVersion
              ? Number(selectedEnvironmentDetailVersion.version)
              : null;
            const latestEnvironmentVersionNumber = environmentDetailVersions.reduce(
              (highest, version) => Math.max(highest, Number(version?.version) || 0),
              -1
            );
            const serverDetailVersions = selectedResourcesDetailType === "server"
              && isAuthoritativelyVersionedServer(draftServer)
              ? readDraftServerVersions()
              : [];
            const selectedServerDetailVersion = serverDetailVersions.length > 0
              ? (
                  getDraftServerSelectedVersion()
                  || getDraftServerActiveVersion()
                  || serverDetailVersions[0]
                  || null
                )
              : null;
            const selectedServerVersionNumber = selectedServerDetailVersion
              ? Number(selectedServerDetailVersion.version)
              : null;
            const latestServerVersionNumber = serverDetailVersions.reduce(
              (highest, version) => Math.max(highest, Number(version?.version) || 0),
              -1
            );
            onResourcesHeaderChange(
              shouldUseDetailHeader
                ? {
                    mode: "detail",
                    title: selectedResourcesDetailTitle,
                    sideDetailOpen: isSourcePreviewOpen,
                    resourceMode,
                    resourceId: selectedResourcesDetailId,
                    resourceType: selectedResourcesDetailType,
                    ...(selectedResourcesDetailType === "computer"
                      ? {
                          versionNumber: Number.isFinite(selectedEnvironmentVersionNumber)
                            ? selectedEnvironmentVersionNumber
                            : null,
                          versionIsLatest: Number.isFinite(selectedEnvironmentVersionNumber)
                            && selectedEnvironmentVersionNumber === latestEnvironmentVersionNumber,
                          versionBusy: saveState.isSaving
                            || environmentVersionState.status === "loading",
                          onVersionClick: openEnvironmentVersionsSidebar,
                        }
                      : selectedResourcesDetailType === "server"
                        && isAuthoritativelyVersionedServer(draftServer)
                        ? {
                            versionNumber: Number.isFinite(selectedServerVersionNumber)
                              ? selectedServerVersionNumber
                              : null,
                            versionIsLatest: Number.isFinite(selectedServerVersionNumber)
                              && selectedServerVersionNumber === latestServerVersionNumber,
                            versionBusy: serverSaveState.isSaving
                              || serverVersionState.status === "loading",
                            onVersionClick: openAuthoritativeServerVersionsSidebar,
                          }
                      : {}),
                  }
                : { mode: "overview", title: "", sideDetailOpen: isSourcePreviewOpen, resourceMode, resourceId: "", resourceType: selectedResourcesDetailType }
            );
          }, [
            draftEnvironment,
            draftServer,
            embeddedInResources,
            environmentComposerOpen,
            environmentVersionState.status,
            environmentVersionsSidebarOpen,
            isHomeViewActive,
            isServersMode,
            normalizedEmbeddedServerKind,
            onResourcesHeaderChange,
            resourceMode,
            saveState.isSaving,
            selectedDatabaseId,
            selectedEnvironmentId,
            selectedResourcesDetailTitle,
            selectedServerId,
            serverComposerOpen,
            serverDetailTab,
            serverFileEditorState.path,
            serverSaveState.isSaving,
            serverVersionState.status,
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
              showEnvironmentsHome();
            }
          }, [backRequestToken, embeddedInResources, isHomeViewActive]);
  
          const environmentsHomeRecentItems = useMemo(() => {
            const parseTimestamp = (value) => {
              const timestamp = new Date(value || "").getTime();
              return Number.isFinite(timestamp) ? timestamp : 0;
            };
            const environmentItems = orderedEnvironments.map((environment) => ({
              id: environment.id,
              name: environment.name || "Untitled Computer",
              description: "",
              resourceType: "computer",
              kind: "computer",
              updatedAt: environment.updatedAt || environment.createdAt || "",
              sortTime: parseTimestamp(environment.updatedAt || environment.createdAt),
            }));
            const serverItems = orderedServers.map((server) => ({
              id: server.id,
              name: server.name || "Untitled Resource",
              description: server.description || "",
              resourceType: "server",
              kind: canonicalizePlaygroundServerKind(server.kind),
              updatedAt: server.updatedAt || server.createdAt || "",
              sortTime: parseTimestamp(server.updatedAt || server.createdAt),
            }));
            const databaseItems = orderedDatabases.map((database) => ({
              id: database.id,
              name: database.name || "Untitled Database",
              description: database.description || "",
              resourceType: "database",
              kind: "database",
              updatedAt: database.updatedAt || database.createdAt || "",
              sortTime: parseTimestamp(database.updatedAt || database.createdAt),
            }));
            return [...environmentItems, ...serverItems, ...databaseItems]
              .sort((left, right) => right.sortTime - left.sortTime)
              .slice(0, 7);
          }, [orderedDatabases, orderedEnvironments, orderedServers]);
  
          const existingSecretKeys = useMemo(() => {
            return new Set(
              (selectedEnvironmentSnapshot?.secrets || [])
                .filter((secret) => secret?.value === PLAYGROUND_MASKED_SECRET_VALUE)
                .map((secret) => secret.key)
                .filter(Boolean)
            );
          }, [selectedEnvironmentSnapshot]);
  
          const existingMcpTokenServers = useMemo(() => {
            return new Set(
              (selectedEnvironmentSnapshot?.mcpServers || [])
                .filter((server) => server?.type === "http" && server?.bearerToken === PLAYGROUND_MASKED_SECRET_VALUE)
                .map((server) => server.name)
                .filter(Boolean)
            );
          }, [selectedEnvironmentSnapshot]);
  
          const isLoadingCurrentEnvironment = Boolean(
            selectedEnvironmentId
            && selectedEnvironmentId !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
            && loadingEnvironmentId === selectedEnvironmentId
          );
  
          const isLoadingCurrentServer = Boolean(
            selectedServerId
            && selectedServerId !== PLAYGROUND_SERVER_DRAFT_ID
            && loadingServerId === selectedServerId
          );
  
          const isLoadingCurrentDatabase = Boolean(
            selectedDatabaseId
            && selectedDatabaseId !== PLAYGROUND_DATABASE_DRAFT_ID
            && loadingDatabaseId === selectedDatabaseId
          );
  
          useEffect(() => {
            selectedEnvironmentIdRef.current = selectedEnvironmentId;
          }, [selectedEnvironmentId]);
  
          useEffect(() => {
            selectedServerIdRef.current = selectedServerId;
          }, [selectedServerId]);

          useEffect(() => {
            serverDetailsRequestRef.current.clear();
            authoritativeServerDetailIdsRef.current.clear();
            authoritativeServerBindingIdsRef.current.clear();
            setLoadingServerId("");
          }, [databaseListScopeKey]);

          useEffect(() => {
            selectedDatabaseIdRef.current = selectedDatabaseId;
          }, [selectedDatabaseId]);
  
          useEffect(() => {
            selectedDatabaseCollectionIdRef.current = selectedDatabaseCollectionId;
            setDatabaseCollectionActionsOpen(false);
          }, [selectedDatabaseCollectionId]);
  
          useEffect(() => {
            selectedDatabaseDocumentIdRef.current = selectedDatabaseDocumentId;
            setDatabaseDocumentActionsOpen(false);
          }, [selectedDatabaseDocumentId]);
  
          useEffect(() => {
            serverAnalyticsByIdRef.current = serverAnalyticsById;
          }, [serverAnalyticsById]);
  
          useEffect(() => {
            databaseAnalyticsByIdRef.current = databaseAnalyticsById;
          }, [databaseAnalyticsById]);
  
          useEffect(() => {
            databaseCollectionsByIdRef.current = databaseCollectionsById;
          }, [databaseCollectionsById]);
  
          useEffect(() => {
            databaseDocumentsByCollectionKeyRef.current = databaseDocumentsByCollectionKey;
          }, [databaseDocumentsByCollectionKey]);
  
          useEffect(() => {
            function handleServerEditorSaveShortcut(event) {
              if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || String(event.key || "").toLowerCase() !== "s") {
                return;
              }
              if (resourceMode !== "servers" || !serverFileEditorState.path || serverFileEditorState.status !== "ready") {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation?.();
              void handleServerFileSave();
            }
  
            window.addEventListener("keydown", handleServerEditorSaveShortcut, true);
            return () => window.removeEventListener("keydown", handleServerEditorSaveShortcut, true);
          }, [handleServerFileSave, resourceMode, serverFileEditorState.path, serverFileEditorState.status]);
  
          useEffect(() => {
            return () => {
              if (serverDeployProgressTimerRef.current) {
                window.clearInterval(serverDeployProgressTimerRef.current);
                serverDeployProgressTimerRef.current = null;
              }
            };
          }, []);
  
          function resetEditorAuxiliaryState() {
            editorDirtyRef.current = false;
            environmentVersionDraftTouchedRef.current = false;
            setEnvironmentRuntimePopover("");
            setEnvironmentActionsPopoverOpen(false);
            setEnvironmentPublishMenuOpen(false);
            setEnvironmentVersionSelectorMenuOpen(false);
            setEnvironmentVersionsHeaderMenuOpen(false);
            setEnvironmentVersionsSidebarOpen(false);
            environmentDetailsCollapsedBeforeVersionsRef.current = null;
            setEnvironmentVersionChangesState(null);
            setEnvironmentVersionSaveDialog(null);
            setOpenEnvironmentVersionMenuId("");
            finishCloseEnvironmentVersionModal();
            setEnvironmentVersionState({
              status: "idle",
              message: "",
              error: "",
            });
            setPackageComposerState({
              type: "",
              value: "",
            });
            setModifiedSecrets({});
            setModifiedMcpTokens({});
            setSaveState({
              isSaving: false,
              error: "",
              message: "",
            });
          }
  
          function resetServerEditorAuxiliaryState() {
            serverEditorDirtyRef.current = false;
            serverVersionDraftTouchedRef.current = false;
            if (serverDeployProgressTimerRef.current) {
              window.clearInterval(serverDeployProgressTimerRef.current);
              serverDeployProgressTimerRef.current = null;
            }
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            if (serverPermissionSaveTimerRef.current) {
              window.clearTimeout(serverPermissionSaveTimerRef.current);
              serverPermissionSaveTimerRef.current = null;
            }
            serverAutosaveQueuedRef.current = null;
            serverPermissionSaveQueuedRef.current = null;
            setServerActionsPopoverOpen(false);
            setServerPublishMenuOpen(false);
            setServerVersionsHeaderMenuOpen(false);
            setServerVersionsSidebarOpen(false);
            serverDetailsCollapsedBeforeVersionsRef.current = null;
            setServerVersionChangesState(null);
            setOpenServerVersionMenuId("");
            finishCloseServerVersionModal();
            setServerFileActionsPopoverOpen(false);
            setServerSourceFileMenuPath("");
            setServerSourceExpandedFolders(new Set());
            setServerDeploymentHelpOpen(false);
            setServerRenameState(null);
            setServerRenameValue("");
            setServerRenameError("");
            setServerDetailSelectPopover("");
            setServerPermissionTeamId("");
            setServerPermissionRoleId("member");
            setServerTeamMenuId("");
            setServerAccessSearchQuery("");
            setServerAccessFilter("all");
            setServerOwnerPopoverOpen(false);
            setServerOwnerTransferTarget(null);
            setServerOwnerTransferModalClosing(false);
            setSelectedServerAccessTeamIds(new Set());
            setServerTeamAccessState({ teamId: "", action: "", error: "" });
            setServerRuntimeState({
              error: "",
            });
            setServerAuthSearchQuery("");
            setServerAuthUserComposerState({
              open: false,
              email: "",
              password: "",
              displayName: "",
              error: "",
              isSaving: false,
            });
            setServerSecretsSearchQuery("");
            setServerSecretsState({
              error: "",
            });
            setServerSecretComposerState({
              open: false,
              secretId: "",
              name: "",
              description: "",
              value: "",
              error: "",
              isSaving: false,
            });
            setServerAuthAnalyticsVisibility({
              users: true,
              verified: true,
              signins: true,
              email: true,
              external: true,
  	          });
  	          setAuthDetailTab("users");
  	          setSecretsDetailTab("secrets");
  		          setAgentRuntimeDetailTab("usage");
  	          setServerRuntimePreviewState({
              open: false,
              target: "",
              title: "",
              path: "",
              language: "json",
              value: "",
              loading: false,
              error: "",
            });
            setIsServerFileDragging(false);
            setServerSaveState({
              isSaving: false,
              error: "",
              message: "",
            });
            setServerVersionState({
              status: "idle",
              message: "",
              error: "",
            });
            setServerFileTransferState({
              isUploading: false,
              error: "",
              message: "",
            });
            setServerDeploymentState({
              isDeploying: false,
              isInvoking: false,
              error: "",
              message: "",
              lastResponseText: "",
              deployProgress: 0,
            });
            setServerDeploymentStatusDismissed(false);
            setServerDeploymentHistoryState({
              error: "",
              rollingBackDeploymentId: "",
            });
            setServerFileEditorState({
              path: "",
              status: "idle",
              value: "",
              initialValue: "",
              error: "",
              saveError: "",
              saveMessage: "",
              isSaving: false,
              wordWrap: true,
            });
            setServerFileEditorHistoryByKey({});
            setServerDetailTab("usage");
            setServerDescriptionHistory({ past: [], future: [] });
            setServerAnalyticsView("editor");
            setServerLogsState({
              kind: "request",
              loadingKey: "",
              error: "",
            });
            setServerLogsSearchQuery("");
            setServerLogsSort("newest");
            setServerLogsToolbarPopover("");
            setServerLogsVisibleCountByKind({
              request: 20,
              runtime: 20,
              deployment: 20,
            });
            setExpandedServerLogKey("");
          }
  
          function clearServerDeployProgressTimer() {
            if (serverDeployProgressTimerRef.current) {
              window.clearInterval(serverDeployProgressTimerRef.current);
              serverDeployProgressTimerRef.current = null;
            }
          }
  
          function startServerDeployProgressTimer() {
            clearServerDeployProgressTimer();
            serverDeployProgressTimerRef.current = window.setInterval(() => {
              setServerDeploymentState((current) => {
                if (!current.isDeploying) {
                  return current;
                }
                const currentProgress = Number(current.deployProgress || 0);
                const step = currentProgress < 0.42 ? 0.14 : currentProgress < 0.72 ? 0.07 : 0.03;
                const nextProgress = Math.min(0.92, currentProgress + step);
                if (nextProgress === currentProgress) {
                  return current;
                }
                return {
                  ...current,
                  deployProgress: nextProgress,
                };
              });
            }, 650);
          }
  
          function PlaygroundEnvironmentTelemetryTimeseriesChart({
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
            return React.createElement(PlaygroundEnvironmentTelemetryTimeseriesChart, config);
          }
  
          function PlaygroundResourceOperationsChart({
            labels,
            series,
            isLoading = false,
            emptyText = "No resource activity yet",
            loadingLabel = "Loading resource activity",
            ariaLabel = "Resource activity over time",
          }) {
            const canvasRef = useRef(null);
            const chartRef = useRef(null);
            const normalizedLabels = Array.isArray(labels) ? labels.map((label) => String(label || "")) : [];
            const fallbackColors = ["rgb(143, 196, 255)", "rgb(103, 80, 255)", "rgb(126, 255, 255)", "rgb(245, 59, 58)"];
            const normalizedSeries = (Array.isArray(series) ? series : [])
              .filter(Boolean)
              .map((entry, seriesIndex) => ({
                id: String(entry?.id || "resource-series-" + seriesIndex),
                label: String(entry?.label || "Activity"),
                color: String(entry?.color || fallbackColors[seriesIndex % fallbackColors.length]),
                values: normalizedLabels.map((_, index) => Math.max(0, Number(entry?.values?.[index] || 0))),
              }));
            const maxValue = Math.max(0, ...normalizedSeries.flatMap((entry) => entry.values));
            const hasData = normalizedLabels.length > 0 && maxValue > 0;
            const chartSignature = JSON.stringify({
              labels: normalizedLabels,
              series: normalizedSeries,
            });
  
            useEffect(() => () => {
              if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
              }
            }, []);
  
            useEffect(() => {
              const canvas = canvasRef.current;
              if (!canvas || typeof Chart !== "function" || !hasData) {
                if (chartRef.current) {
                  chartRef.current.destroy();
                  chartRef.current = null;
                }
                return undefined;
              }
  
              const maxReferencePlugin = {
                id: "resourceMaximumReference",
                afterDatasetsDraw(chart, _args, pluginOptions) {
                  const value = Number(pluginOptions?.value || 0);
                  const yScale = chart.scales?.y;
                  const chartArea = chart.chartArea;
                  if (!Number.isFinite(value) || value <= 0 || !yScale || !chartArea) return;
                  const y = yScale.getPixelForValue(value);
                  const context = chart.ctx;
                  context.save();
                  context.beginPath();
                  context.setLineDash([4, 5]);
                  context.lineWidth = 1;
                  context.strokeStyle = "rgba(255, 255, 255, 0.42)";
                  context.moveTo(chartArea.left, y);
                  context.lineTo(chartArea.right, y);
                  context.stroke();
                  context.restore();
                },
              };
              const maxVisibleLabels = 7;
              const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / maxVisibleLabels));
              const visibleLabelIndexes = new Set();
              for (let index = 0; index < normalizedLabels.length; index += labelStep) visibleLabelIndexes.add(index);
              visibleLabelIndexes.add(Math.max(0, normalizedLabels.length - 1));
              const fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
              const chartData = {
                labels: normalizedLabels,
                datasets: normalizedSeries.map((entry) => ({
                  id: entry.id,
                  label: entry.label,
                  data: entry.values,
                  borderColor: entry.color,
                  backgroundColor: entry.color,
                  borderWidth: 1.6,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                  pointHitRadius: 12,
                  tension: 0.35,
                  cubicInterpolationMode: "monotone",
                  fill: false,
                })),
              };
              const chartOptions = {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                normalized: true,
                interaction: { intersect: false, mode: "index" },
                layout: { padding: { top: 12, right: 14, bottom: 0, left: 0 } },
                plugins: {
                  legend: { display: false },
                  resourceMaximumReference: { value: maxValue },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(8, 8, 8, 0.96)",
                    borderColor: "rgba(255, 255, 255, 0.14)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleColor: "rgba(255, 255, 255, 0.94)",
                    bodyColor: "rgba(255, 255, 255, 0.78)",
                    padding: 10,
                    callbacks: {
                      label: (context) => String(context.dataset?.label || "Operations") + ": "
                        + Math.round(Number(context.parsed?.y || 0)).toLocaleString("en-US"),
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false, drawBorder: false },
                    border: { display: false },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.4)",
                      font: { size: 10, weight: "400", family: fontFamily },
                      maxRotation: 0,
                      minRotation: 0,
                      padding: 10,
                      callback: (_value, index) => visibleLabelIndexes.has(index) ? normalizedLabels[index] : "",
                    },
                  },
                  y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(1, Math.ceil(maxValue * 1.25)),
                    grid: { color: "rgba(255, 255, 255, 0.08)", drawTicks: false },
                    border: { display: false },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.34)",
                      padding: 8,
                      maxTicksLimit: 5,
                      font: { size: 10, weight: "400", family: fontFamily },
                      callback: (value) => Math.round(Number(value || 0)).toLocaleString("en-US"),
                    },
                  },
                },
              };
  
              if (chartRef.current) {
                chartRef.current.data = chartData;
                chartRef.current.options = chartOptions;
                chartRef.current.update("none");
                return undefined;
              }
              chartRef.current = new Chart(canvas, {
                type: "line",
                data: chartData,
                options: chartOptions,
                plugins: [maxReferencePlugin],
              });
              return undefined;
            }, [chartSignature, hasData, maxValue]);
  
            return React.createElement("div", {
                className: "playground-project-overview-progress-combo-chart-frame playground-agents-home-chartjs-frame playground-resource-operations-chartjs-frame",
              },
              isLoading
                ? React.createElement("div", {
                    className: "playground-overview-chart-loading",
                    style: { position: "static", inset: "auto", height: "100%" },
                    "aria-label": loadingLabel,
                  }, React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 }))
                : !hasData
                  ? React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText)
                  : React.createElement("canvas", {
                      ref: canvasRef,
                      className: "playground-project-overview-progress-combo-canvas playground-agents-home-chartjs-canvas playground-resource-operations-chartjs-canvas",
                      role: "img",
                      "aria-label": ariaLabel,
                    })
            );
          }
  
          function resetDatabaseEditorAuxiliaryState() {
            if (databaseDocumentAutosaveTimerRef.current) {
              window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
              databaseDocumentAutosaveTimerRef.current = null;
            }
            setDatabaseSaveState({
              isSaving: false,
              error: "",
              message: "",
            });
            setDatabaseDocumentEditorState({
              documentId: "",
              value: "{}",
              initialValue: "{}",
              error: "",
              saveError: "",
              saveMessage: "",
              isLoading: false,
              isSaving: false,
            });
            setDatabaseDocumentViewMode("preview");
            setDatabaseDetailTab("data");
            setDatabaseDescriptionHistory({ past: [], future: [] });
            setDatabasePermissionTeamId("");
  	      setDatabasePermissionRoleId("member");
            setDatabaseTeamMenuId("");
  	      setDatabaseAccessSort("name");
  	      setDatabaseAccessSortDirection("asc");
  	      setDatabaseAccessSearchQuery("");
  	      setDatabaseAccessFilter("all");
  	      setSelectedDatabaseAccessTeamIds(new Set());
            setDatabaseTeamAccessState({
              teamId: "",
              action: "",
              error: "",
            });
            setSelectedDatabaseCollectionId("");
            setSelectedDatabaseDocumentId("");
          }
  
          function revokeEnvironmentGuiFrameUrl(url) {
            if (!url || !String(url).startsWith("blob:")) {
              return;
            }
            try {
              URL.revokeObjectURL(url);
            } catch {}
          }
  
          function replaceEnvironmentGuiFrameUrl(nextUrl) {
            setEnvironmentGuiFrameUrl((current) => {
              if (current && current !== nextUrl) {
                revokeEnvironmentGuiFrameUrl(current);
              }
              return nextUrl;
            });
          }
  
          async function readEnvironmentGuiErrorMessage(response, fallbackMessage) {
            const contentType = String(response?.headers?.get("content-type") || "").toLowerCase();
            if (contentType.includes("application/json")) {
              const data = await response.json().catch(() => ({}));
              return data?.message || data?.error || fallbackMessage;
            }
            const text = await response.text().catch(() => "");
            return text || fallbackMessage;
          }
  
          function updateDraftEnvironment(updater) {
            setDraftEnvironment((current) => {
              const base = current || normalizePlaygroundEnvironmentRecord(selectedEnvironmentSnapshot || buildPlaygroundDefaultEnvironmentDraft());
              return typeof updater === "function" ? updater(base) : updater;
            });
            editorDirtyRef.current = true;
            environmentVersionDraftTouchedRef.current = true;
            setSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          function resizeEnvironmentDescriptionTextarea(textarea) {
            if (!textarea) return;
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
  
          function buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
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
  
          function buildEnvironmentDescriptionListEdit(value, selectionStart, selectionEnd) {
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
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^(\s*)-\s+/.test(line));
            const nextLines = lines.map((line) => {
              if (!line.trim()) {
                return shouldRemoveList ? line : "- ";
              }
              if (shouldRemoveList) {
                return line.replace(/^(\s*)-\s+/, "$1");
              }
              if (/^(\s*)-\s+/.test(line)) {
                return line;
              }
              return line.replace(/^(\s*)/, "$1- ");
            });
            const nextBlock = nextLines.join("\n");
            const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
            const collapsedSelection = safeStart === safeEnd;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - 2)
              : safeStart - lineStart + 2;
            return {
              value: nextValue,
              selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
              selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
            };
          }
  
          function buildEnvironmentDescriptionOrderedListEdit(value, selectionStart, selectionEnd) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\n", safeEnd);
            if (lineEnd === -1) lineEnd = value.length;
            const lines = value.slice(lineStart, lineEnd).split("\n");
            const orderedPattern = /^(\s*)\d+\.\s+/;
            const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => orderedPattern.test(line));
            let orderedIndex = 1;
            const nextLines = lines.map((line) => {
              if (!line.trim()) return shouldRemoveList ? line : String(orderedIndex++) + ". ";
              if (shouldRemoveList) return line.replace(orderedPattern, "$1");
              const cleanLine = line.replace(/^(\s*)(?:-\s+|\d+\.\s+)/, "$1");
              return cleanLine.replace(/^(\s*)/, (_match, indent) => String(indent || "") + String(orderedIndex++) + ". ");
            });
            const nextBlock = nextLines.join("\n");
            const collapsedSelection = safeStart === safeEnd;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - 3)
              : safeStart - lineStart + 3;
            return {
              value: value.slice(0, lineStart) + nextBlock + value.slice(lineEnd),
              selectionStart: collapsedSelection ? lineStart + nextCaretOffset : lineStart,
              selectionEnd: collapsedSelection ? lineStart + nextCaretOffset : lineStart + nextBlock.length,
            };
          }
  
          function buildEnvironmentDescriptionLinkEdit(value, selectionStart, selectionEnd) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
            if (existingLinkMatch) {
              const unwrappedText = existingLinkMatch[1];
              return {
                value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
                selectionStart: safeStart,
                selectionEnd: safeStart + unwrappedText.length,
              };
            }
            const label = selectedText || "link text";
            const url = "url";
            const markdownLink = "[" + label + "](" + url + ")";
            return {
              value: value.slice(0, safeStart) + markdownLink + value.slice(safeEnd),
              selectionStart: safeStart + label.length + 3,
              selectionEnd: safeStart + label.length + 3 + url.length,
            };
          }
  
          function commitDraftEnvironmentIfDirty() {
            if (!editorDirtyRef.current || !draftEnvironment) {
              return;
            }
            if (
              draftEnvironment.id
              && draftEnvironment.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
              && !draftEnvironment.isSystem
            ) {
              return;
            }
            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
              environmentAutosaveTimerRef.current = null;
            }
            environmentAutosaveQueuedRef.current = normalizePlaygroundEnvironmentRecord(draftEnvironment);
            void flushQueuedEnvironmentAutosave();
          }
  
          function toggleToolbarPopover(nextValue) {
            setToolbarPopover((current) => current === nextValue ? "" : nextValue);
          }
  
          const loadEnvironmentDetails = useCallback(async (environmentId, options = {}) => {
            if (!environmentId || environmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
  
            setLoadingEnvironmentId(environmentId);
            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(environmentId), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment.");
              }
  
              const normalized = getPlaygroundEnvironmentResponseRecord(data);
              if (!normalized) {
                throw new Error("Environment response was empty.");
              }
  
              setEnvironmentDetailsById((current) => {
                const currentVersions = readPlaygroundEnvironmentVersions(current[environmentId]);
                return {
                  ...current,
                  [environmentId]: currentVersions.length > 0
                    ? createPlaygroundEnvironmentWithVersionList(normalized, currentVersions)
                    : normalized,
                };
              });
              if (selectedEnvironmentId === environmentId && !editorDirtyRef.current) {
                setDraftEnvironment((current) => {
                  const currentVersions = readPlaygroundEnvironmentVersions(current);
                  const currentSelectedVersion = currentVersions.length > 0
                    ? getDraftEnvironmentSelectedVersion(current)
                    : null;
                  const nextEnvironment = currentVersions.length > 0
                    ? createEnvironmentVersionSelectedResource(
                        normalized,
                        currentVersions,
                        currentSelectedVersion?.id || ""
                      )
                    : normalized;
                  rememberEnvironmentVersionBaseline(nextEnvironment);
                  return nextEnvironment;
                });
              }
            } catch (error) {
              if (selectedEnvironmentId === environmentId) {
                setSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load environment.",
                }));
              }
            } finally {
              setLoadingEnvironmentId((current) => current === environmentId ? "" : current);
            }
          }, [backendUrl, requestHeaders, selectedEnvironmentId]);
  
          const loadEnvironmentAnalytics = useCallback(async (environmentId, options = {}) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return null;
            }
  
            const force = options?.force === true;
            if (!force && environmentAnalyticsById[normalizedEnvironmentId]) {
              return environmentAnalyticsById[normalizedEnvironmentId];
            }
  
            setLoadingEnvironmentAnalyticsId(normalizedEnvironmentId);
            setEnvironmentAnalyticsErrorById((current) => {
              if (!current[normalizedEnvironmentId]) {
                return current;
              }
              const next = { ...current };
              delete next[normalizedEnvironmentId];
              return next;
            });
  
            try {
              const response = await fetch(
                buildPlaygroundEnvironmentAnalyticsUrl(backendUrl, normalizedEnvironmentId),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load analytics.");
              }
  
              const normalizedRecord = {
                ...data,
                loadedAt: new Date().toISOString(),
              };
              setEnvironmentAnalyticsById((current) => ({
                ...current,
                [normalizedEnvironmentId]: normalizedRecord,
              }));
              return normalizedRecord;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to load analytics.";
              setEnvironmentAnalyticsErrorById((current) => ({
                ...current,
                [normalizedEnvironmentId]: errorMessage,
              }));
              return null;
            } finally {
              setLoadingEnvironmentAnalyticsId((current) => current === normalizedEnvironmentId ? "" : current);
            }
          }, [backendUrl, environmentAnalyticsById, requestHeaders]);
  
          const loadEnvironmentHomeCostSummary = useCallback(async (period, options = {}) => {
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(period);
            const force = options?.force === true;
            if (!force && environmentHomeCostSummaryByPeriod[normalizedPeriod]) {
              return environmentHomeCostSummaryByPeriod[normalizedPeriod];
            }
  
            setEnvironmentHomeCostSummaryLoadingPeriod(normalizedPeriod);
            setEnvironmentHomeCostSummaryError("");
  
            try {
              const response = await fetch(
                buildPlaygroundCostsSummaryUrl(backendUrl, normalizedPeriod),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load cost summary.");
              }
              const normalizedRecord = {
                ...data,
                loadedAt: new Date().toISOString(),
              };
              setEnvironmentHomeCostSummaryByPeriod((current) => ({
                ...current,
                [normalizedPeriod]: normalizedRecord,
              }));
              return normalizedRecord;
            } catch (error) {
              setEnvironmentHomeCostSummaryError(error instanceof Error ? error.message : "Failed to load cost summary.");
              return null;
            } finally {
              setEnvironmentHomeCostSummaryLoadingPeriod((current) => current === normalizedPeriod ? "" : current);
            }
          }, [backendUrl, environmentHomeCostSummaryByPeriod, requestHeaders]);
  
          const loadEnvironmentHomeCostBreakdown = useCallback(async (period, options = {}) => {
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(period);
            const force = options?.force === true;
            if (!force && environmentHomeCostBreakdownByPeriod[normalizedPeriod]) {
              return environmentHomeCostBreakdownByPeriod[normalizedPeriod];
            }
  
            setEnvironmentHomeCostBreakdownLoadingPeriod(normalizedPeriod);
            setEnvironmentHomeCostBreakdownError("");
  
            try {
              const response = await fetch(
                buildPlaygroundCostsBreakdownUrl(backendUrl, "source", normalizedPeriod),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load cost breakdown.");
              }
              const normalizedRecord = {
                ...data,
                loadedAt: new Date().toISOString(),
              };
              setEnvironmentHomeCostBreakdownByPeriod((current) => ({
                ...current,
                [normalizedPeriod]: normalizedRecord,
              }));
              return normalizedRecord;
            } catch (error) {
              setEnvironmentHomeCostBreakdownError(error instanceof Error ? error.message : "Failed to load cost breakdown.");
              return null;
            } finally {
              setEnvironmentHomeCostBreakdownLoadingPeriod((current) => current === normalizedPeriod ? "" : current);
            }
          }, [backendUrl, environmentHomeCostBreakdownByPeriod, requestHeaders]);
  
          const loadEnvironmentHomeChartSummaries = useCallback(async (period, options = {}) => {
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(period);
            const force = options?.force === true;
            if (!force && Array.isArray(environmentHomeChartSummariesByPeriod[normalizedPeriod])) {
              return environmentHomeChartSummariesByPeriod[normalizedPeriod];
            }
  
            const buckets = buildPlaygroundEnvironmentHomeActivityBuckets(normalizedPeriod);
            if (!backendUrl || !buckets.length) {
              return [];
            }
  
            setEnvironmentHomeChartSummariesLoadingPeriod(normalizedPeriod);
            setEnvironmentHomeChartSummariesError("");
  
            try {
              const nowMs = Date.now();
              const records = await Promise.all(buckets.map(async (bucket) => {
                const bucketEndMs = Number(bucket?.endMs || 0);
                const rangeEndMs = Math.min(bucketEndMs > 0 ? bucketEndMs - 1 : nowMs, nowMs);
                const rangeStartMs = Math.min(Number(bucket?.startMs || 0), rangeEndMs);
                const response = await fetch(
                  buildPlaygroundCostsSummaryRangeUrl(
                    backendUrl,
                    new Date(rangeStartMs).toISOString(),
                    new Date(rangeEndMs).toISOString()
                  ),
                  {
                    method: "GET",
                    headers: requestHeaders,
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load chart cost summary.");
                }
                return {
                  ...bucket,
                  summary: data,
                };
              }));
              setEnvironmentHomeChartSummariesByPeriod((current) => ({
                ...current,
                [normalizedPeriod]: records,
              }));
              return records;
            } catch (error) {
              setEnvironmentHomeChartSummariesError(error instanceof Error ? error.message : "Failed to load chart cost summary.");
              return [];
            } finally {
              setEnvironmentHomeChartSummariesLoadingPeriod((current) => current === normalizedPeriod ? "" : current);
            }
          }, [backendUrl, environmentHomeChartSummariesByPeriod, requestHeaders]);
  
          const loadEnvironmentHomeChartBreakdowns = useCallback(async (period, options = {}) => {
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(period);
            const force = options?.force === true;
            if (!force && Array.isArray(environmentHomeChartBreakdownsByPeriod[normalizedPeriod])) {
              return environmentHomeChartBreakdownsByPeriod[normalizedPeriod];
            }
  
            const buckets = buildPlaygroundEnvironmentHomeActivityBuckets(normalizedPeriod);
            if (!backendUrl || !buckets.length) {
              return [];
            }
  
            setEnvironmentHomeChartBreakdownsLoadingPeriod(normalizedPeriod);
            setEnvironmentHomeChartBreakdownsError("");
  
            try {
              const nowMs = Date.now();
              const records = await Promise.all(buckets.map(async (bucket) => {
                const bucketEndMs = Number(bucket?.endMs || 0);
                const rangeEndMs = Math.min(bucketEndMs > 0 ? bucketEndMs - 1 : nowMs, nowMs);
                const rangeStartMs = Math.min(Number(bucket?.startMs || 0), rangeEndMs);
                const response = await fetch(
                  buildPlaygroundCostsBreakdownRangeUrl(
                    backendUrl,
                    "source",
                    new Date(rangeStartMs).toISOString(),
                    new Date(rangeEndMs).toISOString()
                  ),
                  {
                    method: "GET",
                    headers: requestHeaders,
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load chart cost breakdown.");
                }
                return {
                  ...bucket,
                  breakdown: data,
                };
              }));
              setEnvironmentHomeChartBreakdownsByPeriod((current) => ({
                ...current,
                [normalizedPeriod]: records,
              }));
              return records;
            } catch (error) {
              setEnvironmentHomeChartBreakdownsError(error instanceof Error ? error.message : "Failed to load chart cost breakdown.");
              return [];
            } finally {
              setEnvironmentHomeChartBreakdownsLoadingPeriod((current) => current === normalizedPeriod ? "" : current);
            }
          }, [backendUrl, environmentHomeChartBreakdownsByPeriod, requestHeaders]);
  
          const loadAvailableRuntimeOptions = useCallback(async () => {
            try {
              const response = await fetch(backendUrl + "/environments/runtimes/available", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok || !data?.runtimes || typeof data.runtimes !== "object") {
                return;
              }
              setAvailableRuntimes((current) => ({
                ...current,
                ...data.runtimes,
              }));
            } catch {
            }
          }, [backendUrl, requestHeaders]);
  
          const loadServerAgentOptions = useCallback(async (options = {}) => {
            if (serverAgentOptionsLoading && !options?.force) {
              return serverAgentOptions;
            }
  
            setServerAgentOptionsLoading(true);
            try {
              const response = await fetch(backendUrl + "/agents?limit=200", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load agents.");
              }
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.agents)
                  ? data.agents
                  : [];
              const nextAgents = items
                .map((agent) => normalizePlaygroundAgentRecord(agent))
                .filter((agent) => agent?.id);
              setServerAgentOptions(nextAgents);
              return nextAgents;
            } catch {
              return [];
            } finally {
              setServerAgentOptionsLoading(false);
            }
          }, [backendUrl, requestHeaders, serverAgentOptions, serverAgentOptionsLoading]);
  
          const loadRuntimeCustomSkills = useCallback(async (options = {}) => {
            if (runtimeCustomSkillsLoading && !options?.force) {
              return runtimeCustomSkills;
            }
            if (hasLoadedRuntimeCustomSkills && !options?.force) {
              return runtimeCustomSkills;
            }
  
            setRuntimeCustomSkillsLoading(true);
            try {
              const response = await fetch("/api/playground/skills", {
                method: "GET",
                credentials: "include",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load custom skills.");
              }
              const items = Array.isArray(data?.skills)
                ? data.skills
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              const normalizedSkills = items
                .filter((skill) => skill && typeof skill === "object" && !skill.isDefault && !skill.isSystem)
                .map((skill) => ({
                  id: typeof skill.id === "string" ? skill.id.trim() : "",
                  name: typeof skill.name === "string" && skill.name.trim() ? skill.name.trim() : String(skill.id || "").trim(),
                  description: typeof skill.description === "string" ? skill.description : "",
                  icon: typeof skill.icon === "string" ? skill.icon : null,
                  isCustom: true,
                }))
                .filter((skill) => skill.id);
              setRuntimeCustomSkills(normalizedSkills);
              setHasLoadedRuntimeCustomSkills(true);
              return normalizedSkills;
            } catch {
              setRuntimeCustomSkills([]);
              setHasLoadedRuntimeCustomSkills(true);
              return [];
            } finally {
              setRuntimeCustomSkillsLoading(false);
            }
          }, [hasLoadedRuntimeCustomSkills, requestHeaders, runtimeCustomSkills, runtimeCustomSkillsLoading]);
  
          function commitVoiceAgentRecordPayload(payload, fallbackAgentId = "") {
            const normalizedRecord = normalizePlaygroundVoiceAgentRecord(payload);
            const agentId = String(normalizedRecord?.agent?.id || fallbackAgentId || "").trim();
            if (!agentId) {
              return null;
            }
            setVoiceAgentRecordsById((current) => ({
              ...current,
              [agentId]: normalizedRecord,
            }));
            setVoiceAgentDraftsById((current) => ({
              ...current,
              [agentId]: buildPlaygroundVoiceAgentDraft(normalizedRecord),
            }));
            return normalizedRecord;
          }
  
          const loadVoiceAgents = useCallback(async (options = {}) => {
            if (voiceAgentsLoading && !options?.force) {
              return [];
            }
            if (hasLoadedVoiceAgents && !options?.force) {
              return [];
            }
  
            setVoiceAgentsLoading(true);
            setVoiceAgentsState((current) => ({
              ...current,
              error: "",
            }));
            try {
              const response = await fetch(buildPlaygroundVoiceAgentsUrl(backendUrl), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load voice agents.");
              }
              const items = Array.isArray(data?.voiceAgents)
                ? data.voiceAgents
                : Array.isArray(data?.data)
                  ? data.data
                  : Array.isArray(data?.items)
                    ? data.items
                    : [];
              const nextRecordsById = {};
              const nextDraftsById = {};
              const nextRecords = items
                .map((item) => normalizePlaygroundVoiceAgentRecord(item))
                .filter((record) => record?.agent?.id);
              nextRecords.forEach((record) => {
                const agentId = String(record.agent.id || "").trim();
                if (!agentId) return;
                nextRecordsById[agentId] = record;
                nextDraftsById[agentId] = buildPlaygroundVoiceAgentDraft(record);
              });
              setVoiceAgentRecordsById(nextRecordsById);
              setVoiceAgentDraftsById(nextDraftsById);
              setHasLoadedVoiceAgents(true);
              return nextRecords;
            } catch (error) {
              setVoiceAgentsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load voice agents.",
              }));
              setHasLoadedVoiceAgents(true);
              return [];
            } finally {
              setVoiceAgentsLoading(false);
            }
          }, [backendUrl, hasLoadedVoiceAgents, requestHeaders, voiceAgentsLoading]);
  
          function updateVoiceAgentDraft(agentId, patch) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return;
            }
            setVoiceAgentDraftsById((current) => {
              const baseRecord = voiceAgentRecordsById[normalizedAgentId] || { agent: { id: normalizedAgentId } };
              const baseDraft = current[normalizedAgentId] || buildPlaygroundVoiceAgentDraft(baseRecord);
              return {
                ...current,
                [normalizedAgentId]: {
                  ...baseDraft,
                  ...(patch && typeof patch === "object" ? patch : {}),
                },
              };
            });
            setVoiceAgentsState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          async function saveVoiceAgentConfig(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return null;
            }
            const draft = voiceAgentDraftsById[normalizedAgentId] || buildPlaygroundVoiceAgentDraft(voiceAgentRecordsById[normalizedAgentId] || { agent: { id: normalizedAgentId } });
  
            setVoiceAgentsState((current) => ({
              ...current,
              error: "",
              message: "",
              savingAgentId: normalizedAgentId,
            }));
            try {
              const response = await fetch(buildPlaygroundVoiceAgentUrl(backendUrl, normalizedAgentId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(buildPlaygroundVoiceAgentUpdatePayload(draft)),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save voice configuration.");
              }
              const normalizedRecord = commitVoiceAgentRecordPayload(data, normalizedAgentId);
              setVoiceAgentsState((current) => ({
                ...current,
                message: "Voice configuration saved.",
                savingAgentId: "",
              }));
              return normalizedRecord;
            } catch (error) {
              setVoiceAgentsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to save voice configuration.",
                savingAgentId: "",
              }));
              return null;
            }
          }
  
          async function provisionVoiceAgentPhoneNumber(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return null;
            }
            setVoiceAgentsState((current) => ({
              ...current,
              error: "",
              message: "",
              provisioningAgentId: normalizedAgentId,
            }));
            try {
              const response = await fetch(buildPlaygroundVoiceAgentPhoneNumberUrl(backendUrl, normalizedAgentId), {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ origin: "xai_provisioned" }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to provision phone number.");
              }
              const normalizedRecord = commitVoiceAgentRecordPayload(data, normalizedAgentId);
              setVoiceAgentsState((current) => ({
                ...current,
                message: "Phone number provisioned.",
                provisioningAgentId: "",
              }));
              return normalizedRecord;
            } catch (error) {
              setVoiceAgentsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to provision phone number.",
                provisioningAgentId: "",
              }));
              return null;
            }
          }
  
          async function disableVoiceAgentPhoneNumber(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return null;
            }
            setVoiceAgentsState((current) => ({
              ...current,
              error: "",
              message: "",
              disablingAgentId: normalizedAgentId,
            }));
            try {
              const response = await fetch(buildPlaygroundVoiceAgentPhoneNumberUrl(backendUrl, normalizedAgentId), {
                method: "DELETE",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to disable phone number.");
              }
              const normalizedRecord = commitVoiceAgentRecordPayload(data, normalizedAgentId);
              setVoiceAgentsState((current) => ({
                ...current,
                message: "Phone number disabled.",
                disablingAgentId: "",
              }));
              return normalizedRecord;
            } catch (error) {
              setVoiceAgentsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to disable phone number.",
                disablingAgentId: "",
              }));
              return null;
            }
          }
  
          async function createVoiceAgentTestSession(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return null;
            }
            setVoiceAgentsState((current) => ({
              ...current,
              error: "",
              message: "",
              testingAgentId: normalizedAgentId,
            }));
            try {
              const response = await fetch(buildPlaygroundVoiceAgentSessionsUrl(backendUrl, normalizedAgentId), {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: "Voice session",
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create voice session.");
              }
              setVoiceAgentSessionResultsById((current) => ({
                ...current,
                [normalizedAgentId]: data,
              }));
              setVoiceAgentsState((current) => ({
                ...current,
                message: "Web voice session created.",
                testingAgentId: "",
              }));
              return data;
            } catch (error) {
              setVoiceAgentsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to create voice session.",
                testingAgentId: "",
              }));
              return null;
            }
          }
  
