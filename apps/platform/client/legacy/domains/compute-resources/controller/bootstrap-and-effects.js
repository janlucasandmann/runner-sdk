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
          const serverDetailsCollapsedBeforeVersionsRef = useRef(null);
          const environmentDockerfileTextareaRef = useRef(null);
          const serverComposerDescriptionTextareaRef = useRef(null);
          const environmentGuiImageRef = useRef(null);
          const environmentGuiClickTimerRef = useRef(null);
          const environmentGuiScrollTimerRef = useRef(null);
          const environmentRuntimePopoverRef = useRef(null);
          const environmentComposerRuntimePopoverRef = useRef(null);
          const environmentActionsPopoverRef = useRef(null);
          const environmentPublishMenuRef = useRef(null);
          const environmentVersionSelectorMenuRef = useRef(null);
          const environmentTagsMenuRef = useRef(null);
          const environmentVersionDescriptionTextareaRef = useRef(null);
          const environmentVersionModalCloseTimerRef = useRef(null);
          const environmentVersionModalFrameRef = useRef(null);
          const environmentInitialVersionSeededRef = useRef(new Set());
          const environmentVersionBaselineRef = useRef({ key: "", signature: "" });
          const environmentVersionDraftTouchedRef = useRef(false);
          const environmentVersionsDrawerContainerRef = useRef(null);
          const environmentDetailsCollapsedBeforeVersionsRef = useRef(null);
          const environmentShareTeamModalCloseTimerRef = useRef(null);
          const environmentShareTeamModalFrameRef = useRef(null);
          const environmentApiModalCloseTimerRef = useRef(null);
          const environmentApiModalFrameRef = useRef(null);
          const environmentListActionMenuCloseTimerRef = useRef(null);
          const environmentBulkActionMenuCloseTimerRef = useRef(null);
          const environmentRenameInputRef = useRef(null);
          const environmentDescriptionTextareaRef = useRef(null);
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
          const [environmentTagsMenuOpen, setEnvironmentTagsMenuOpen] = useState(false);
          const [environmentTagInputValue, setEnvironmentTagInputValue] = useState("");
          const [environmentVersionsHeaderMenuOpen, setEnvironmentVersionsHeaderMenuOpen] = useState(false);
          const [environmentVersionsSidebarOpen, setEnvironmentVersionsSidebarOpen] = useState(false);
          const [environmentVersionsDrawerContainer, setEnvironmentVersionsDrawerContainer] = useState(null);
          const [environmentVersionState, setEnvironmentVersionState] = useState({
            status: "idle",
            message: "",
            error: "",
          });
          const [environmentVersionModal, setEnvironmentVersionModal] = useState(null);
          const [environmentVersionModalVisible, setEnvironmentVersionModalVisible] = useState(false);
          const [environmentVersionModalClosing, setEnvironmentVersionModalClosing] = useState(false);
          const [environmentVersionNameDraft, setEnvironmentVersionNameDraft] = useState("");
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
          const [isEnvironmentDescriptionEditing, setIsEnvironmentDescriptionEditing] = useState(false);
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
          const [serverDeploymentHelpOpen, setServerDeploymentHelpOpen] = useState(false);
          const [serverCustomDomainModalState, setServerCustomDomainModalState] = useState({
            open: false,
            domain: "",
            status: "idle",
            error: "",
            result: null,
          });
          const [serverCustomDomainMenuDomain, setServerCustomDomainMenuDomain] = useState("");
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
          const [expandedSections, setExpandedSections] = useState(() => new Set(["general", "overview", "runtimes", "packages-system", "packages-python", "packages-node", "variables"]));
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
  
          function normalizeEnvironmentTagLabel(value) {
            return String(value || "").trim().replace(/s+/g, " ");
          }
  
          function getEnvironmentTagLabels(environmentRecord) {
            const metadata = getEnvironmentMetadataRecord(environmentRecord);
            const source = Array.isArray(metadata.tags)
              ? metadata.tags
              : Array.isArray(metadata.labels)
                ? metadata.labels
                : Array.isArray(environmentRecord?.tags)
                  ? environmentRecord.tags
                  : [];
            const seen = new Set();
            return source
              .map((tag) => normalizeEnvironmentTagLabel(tag))
              .filter((tag) => {
                if (!tag) return false;
                const key = tag.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
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
            const isComputerCreateViewOpen = Boolean(environmentComposerOpen && !isServersMode);
            const shouldUseDetailHeader = !isHomeViewActive || isResourceCreateViewOpen || isComputerCreateViewOpen;
            onResourcesHeaderChange(
              shouldUseDetailHeader
                ? { mode: "detail", title: selectedResourcesDetailTitle, sideDetailOpen: isSourcePreviewOpen, resourceMode, resourceId: selectedResourcesDetailId, resourceType: selectedResourcesDetailType }
                : { mode: "overview", title: "", sideDetailOpen: isSourcePreviewOpen, resourceMode, resourceId: "", resourceType: selectedResourcesDetailType }
            );
          }, [embeddedInResources, environmentComposerOpen, isHomeViewActive, isServersMode, normalizedEmbeddedServerKind, onResourcesHeaderChange, resourceMode, selectedDatabaseId, selectedEnvironmentId, selectedResourcesDetailTitle, selectedServerId, serverComposerOpen, serverDetailTab, serverFileEditorState.path]);
  
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
            setEnvironmentTagsMenuOpen(false);
            setEnvironmentTagInputValue("");
            setEnvironmentVersionsHeaderMenuOpen(false);
            setEnvironmentVersionsSidebarOpen(false);
            environmentDetailsCollapsedBeforeVersionsRef.current = null;
            setEnvironmentVersionChangesState(null);
            setOpenEnvironmentVersionMenuId("");
            finishCloseEnvironmentVersionModal();
            setEnvironmentVersionState({
              status: "idle",
              message: "",
              error: "",
            });
            setIsEnvironmentDescriptionEditing(false);
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
  
              setEnvironmentDetailsById((current) => ({
                ...current,
                [environmentId]: normalized,
              }));
              if (selectedEnvironmentId === environmentId && !editorDirtyRef.current) {
                rememberEnvironmentVersionBaseline(normalized);
                setDraftEnvironment(normalized);
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
  
          const loadServers = useCallback(async (options = {}) => {
            setHasLoadedServers(true);
            setServerListLoading(true);
            try {
              const response = await fetch(backendUrl + "/servers", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load servers.");
              }
  
              const nextServers = parsePlaygroundServerListResponse(data);
              setServers(nextServers);
              setServerSaveState((current) => ({
                ...current,
                error: "",
              }));
              setServerDetailsById((current) => {
                const next = { ...current };
                nextServers.forEach((server) => {
                  if (!server?.id) return;
                  next[server.id] = normalizePlaygroundServerRecord({
                    ...(next[server.id] || {}),
                    ...server,
                  });
                });
                return next;
              });
  
              if (options?.selectId) {
                setSelectedServerId(options.selectId);
              } else if (!isHomeViewActive && !selectedServerIdRef.current && nextServers[0]?.id) {
                setSelectedServerId(nextServers[0].id);
              } else if (!isHomeViewActive && selectedServerIdRef.current && !nextServers.some((server) => server.id === selectedServerIdRef.current)) {
                setSelectedServerId(nextServers[0]?.id || "");
              }
  
              if (resourceMode === "servers" && !options?.skipCostRefresh) {
                const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(environmentHomeChartTimescale);
                void loadEnvironmentHomeCostSummary(normalizedPeriod, { force: true });
                void loadEnvironmentHomeCostBreakdown(normalizedPeriod, { force: true });
                void loadEnvironmentHomeChartSummaries(normalizedPeriod, { force: true });
                void loadEnvironmentHomeChartBreakdowns(normalizedPeriod, { force: true });
              }
  
              return nextServers;
            } catch (error) {
              setServerSaveState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load servers.",
              }));
              return [];
            } finally {
              setServerListLoading(false);
            }
          }, [
            backendUrl,
            environmentHomeChartTimescale,
            isHomeViewActive,
            loadEnvironmentHomeChartBreakdowns,
            loadEnvironmentHomeChartSummaries,
            loadEnvironmentHomeCostBreakdown,
            loadEnvironmentHomeCostSummary,
            requestHeaders,
            resourceMode,
          ]);
  
          const loadServerDetails = useCallback(async (serverId, options = {}) => {
            if (!serverId || serverId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
  
            const templatePreviewServer = resourceTemplatePreviewServerRecordById[serverId] || null;
            if (templatePreviewServer) {
              setServerDetailsById((current) => ({
                ...current,
                [serverId]: templatePreviewServer,
              }));
              if (selectedServerIdRef.current === serverId && !serverEditorDirtyRef.current) {
                setDraftServer(templatePreviewServer);
              }
              setServerSaveState((current) => ({
                ...current,
                error: "",
              }));
              return templatePreviewServer;
            }
  
            setLoadingServerId(serverId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                backendUrl + "/servers/" + encodeURIComponent(serverId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey + "|server-details",
                  ttlMs: PLAYGROUND_DATABASE_DETAIL_CACHE_TTL_MS,
                  force: options?.force === true,
                  staleWhileRevalidate: true,
                  priority: "low",
                }
              );
  
              const normalized = getPlaygroundServerResponseRecord(data);
              if (!normalized) {
                throw new Error("Server response was empty.");
              }
  
              setServerDetailsById((current) => ({
                ...current,
                [serverId]: normalized,
              }));
              if (selectedServerIdRef.current === serverId && !serverEditorDirtyRef.current) {
                setDraftServer(normalized);
              }
              return normalized;
            } catch (error) {
              if (selectedServerIdRef.current === serverId) {
                setServerSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load server.",
                }));
              }
              return null;
            } finally {
              setLoadingServerId((current) => current === serverId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewServerRecordById]);
  
          const loadServerFiles = useCallback(async (serverId) => {
            if (!serverId || serverId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            const templatePreviewFiles = resourceTemplatePreviewServerFilesById[serverId];
            if (Array.isArray(templatePreviewFiles)) {
              setServerFilesById((current) => ({
                ...current,
                [serverId]: templatePreviewFiles,
              }));
              setServerFileTransferState((current) => ({
                ...current,
                error: "",
              }));
              return templatePreviewFiles;
            }
  
            setLoadingServerFilesId(serverId);
            try {
              const response = await fetch(
                buildPlaygroundServerFilesListUrl(backendUrl, serverId, "", -1),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load source files.");
              }
  
              const files = normalizePlaygroundEnvironmentInventory(data?.files || []);
              setServerFilesById((current) => ({
                ...current,
                [serverId]: files,
              }));
              setServerFileTransferState((current) => ({
                ...current,
                error: "",
              }));
              return files;
            } catch (error) {
              if (selectedServerIdRef.current === serverId) {
                setServerFileTransferState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load source files.",
                }));
              }
              return [];
            } finally {
              setLoadingServerFilesId((current) => current === serverId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerFilesById]);
  
          const loadServerFileContent = useCallback(async (serverId, filePath, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedPath = normalizeHistoryPath(filePath);
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID || !normalizedPath) {
              return null;
            }
  
            const templatePreviewContent = resourceTemplatePreviewServerFileContentById[normalizedServerId]?.[normalizedPath];
            if (typeof templatePreviewContent === "string") {
              setServerFileEditorState((current) => ({
                ...current,
                path: normalizedPath,
                status: "ready",
                value: templatePreviewContent,
                initialValue: templatePreviewContent,
                error: "",
                saveError: "",
                saveMessage: "",
                isSaving: false,
              }));
              return templatePreviewContent;
            }
  
            setServerFileEditorState((current) => ({
              ...current,
              path: normalizedPath,
              status: "loading",
              error: "",
              saveError: "",
              saveMessage: "",
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundServerFileContentUrl(backendUrl, normalizedServerId, normalizedPath),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to open source file.");
              }
  
              const nextValue = typeof data?.content === "string"
                ? data.content
                : typeof options?.fallbackValue === "string"
                  ? options.fallbackValue
                  : "";
  
              setServerFileEditorState((current) => ({
                ...current,
                path: normalizedPath,
                status: "ready",
                value: nextValue,
                initialValue: nextValue,
                error: "",
                saveError: "",
                saveMessage: "",
              }));
              return nextValue;
            } catch (error) {
              setServerFileEditorState((current) => ({
                ...current,
                path: normalizedPath,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to open source file.",
                saveError: "",
                saveMessage: "",
              }));
              return null;
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerFileContentById]);
  
          const loadServerAnalytics = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(options?.period || "day");
            const analyticsStateKey = buildPlaygroundServerAnalyticsStateKey(normalizedServerId, normalizedPeriod);
  
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              const normalizedRecord = {
                period: normalizedPeriod,
                summary: {
                  totalRequests: 0,
                  successRate: 0,
                  clientErrors: 0,
                  serverErrors: 0,
                  totalRequests24h: 0,
                  successRate24h: 0,
                  p95LatencyMs: 0,
                  clientErrors24h: 0,
                  serverErrors24h: 0,
                },
                charts: {
                  traffic: [],
                  status: [],
                  traffic24h: [],
                  status24h: [],
                },
                recentRequests: [],
                deployment: null,
                loadedAt: new Date().toISOString(),
              };
              setServerAnalyticsById((current) => ({
                ...current,
                [analyticsStateKey]: normalizedRecord,
              }));
              serverAnalyticsByIdRef.current = {
                ...serverAnalyticsByIdRef.current,
                [analyticsStateKey]: normalizedRecord,
              };
              return normalizedRecord;
            }
  
            const force = options?.force === true;
            if (!force && serverAnalyticsByIdRef.current[analyticsStateKey]) {
              return serverAnalyticsByIdRef.current[analyticsStateKey];
            }
  
            setLoadingServerAnalyticsId(analyticsStateKey);
            try {
              let data = null;
              try {
                const overviewData = await fetchPlaygroundCachedDatabaseResourceJson(
                  backendUrl + "/servers/analytics/overview?period=" + encodeURIComponent(normalizedPeriod),
                  requestHeaders,
                  {
                    scopeKey: databaseListScopeKey,
                    ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                    force,
                    persist: true,
                    staleWhileRevalidate: !force,
                    priority: "high",
                  }
                );
                const overviewResources = Array.isArray(overviewData?.analytics?.resources)
                  ? overviewData.analytics.resources
                  : Array.isArray(overviewData?.resources)
                    ? overviewData.resources
                    : [];
                const overviewResource = overviewResources.find((resource) => String(resource?.id || "") === normalizedServerId) || null;
                if (overviewResource) {
                  const traffic = Array.isArray(overviewResource?.traffic)
                    ? overviewResource.traffic
                    : Array.isArray(overviewResource?.charts?.traffic)
                      ? overviewResource.charts.traffic
                      : Array.isArray(overviewResource?.charts?.traffic24h)
                        ? overviewResource.charts.traffic24h
                        : [];
                  const status = Array.isArray(overviewResource?.status)
                    ? overviewResource.status
                    : Array.isArray(overviewResource?.charts?.status)
                      ? overviewResource.charts.status
                      : traffic.map((bucket) => {
                          const total = Math.max(0, Number(bucket?.total || 0));
                          const clientErrors = Math.max(0, Number(bucket?.clientErrors || 0));
                          const serverErrors = Math.max(0, Number(bucket?.serverErrors || 0));
                          const success = Math.max(0, total - clientErrors - serverErrors);
                          return {
                            ...bucket,
                            total,
                            success,
                            successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
                            clientErrors,
                            serverErrors,
                          };
                        });
                  const trafficSummary = traffic.reduce((summary, bucket) => {
                    summary.totalRequests += Math.max(0, Number(bucket?.total || 0));
                    summary.clientErrors += Math.max(0, Number(bucket?.clientErrors || 0));
                    summary.serverErrors += Math.max(0, Number(bucket?.serverErrors || 0));
                    summary.p95LatencyMs = Math.max(summary.p95LatencyMs, Math.max(0, Number(bucket?.p95LatencyMs || 0)));
                    return summary;
                  }, {
                    totalRequests: 0,
                    clientErrors: 0,
                    serverErrors: 0,
                    p95LatencyMs: 0,
                  });
                  const overviewSummary = overviewResource?.summary && typeof overviewResource.summary === "object"
                    ? overviewResource.summary
                    : {};
                  const totalRequests = Math.max(0, Number(
                    overviewSummary.totalRequests
                    ?? overviewSummary.totalRequests24h
                    ?? overviewResource.totalRequests
                    ?? trafficSummary.totalRequests
                  ) || 0);
                  const clientErrors = Math.max(0, Number(
                    overviewSummary.clientErrors
                    ?? overviewSummary.clientErrors24h
                    ?? overviewResource.clientErrors
                    ?? trafficSummary.clientErrors
                  ) || 0);
                  const serverErrors = Math.max(0, Number(
                    overviewSummary.serverErrors
                    ?? overviewSummary.serverErrors24h
                    ?? overviewResource.serverErrors
                    ?? trafficSummary.serverErrors
                  ) || 0);
                  const successfulRequests = Math.max(0, totalRequests - clientErrors - serverErrors);
                  const successRate = Number(
                    overviewSummary.successRate
                    ?? overviewSummary.successRate24h
                    ?? overviewResource.successRate
                    ?? (totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0)
                  ) || 0;
                  const p95LatencyMs = Math.max(0, Number(
                    overviewSummary.p95LatencyMs
                    ?? overviewResource.p95LatencyMs
                    ?? trafficSummary.p95LatencyMs
                  ) || 0);
                  data = {
                    ...overviewResource,
                    period: normalizedPeriod,
                    summary: {
                      ...overviewSummary,
                      totalRequests,
                      totalRequests24h: totalRequests,
                      successRate,
                      successRate24h: successRate,
                      clientErrors,
                      clientErrors24h: clientErrors,
                      serverErrors,
                      serverErrors24h: serverErrors,
                      p95LatencyMs,
                    },
                    charts: {
                      ...(overviewResource?.charts && typeof overviewResource.charts === "object" ? overviewResource.charts : {}),
                      traffic,
                      traffic24h: traffic,
                      status,
                      status24h: status,
                    },
                  };
                }
              } catch {
                data = null;
              }
  
              if (!data) {
                data = await fetchPlaygroundCachedDatabaseResourceJson(
                  buildPlaygroundServerAnalyticsUrl(backendUrl, normalizedServerId, normalizedPeriod),
                  requestHeaders,
                  {
                    scopeKey: databaseListScopeKey + "|server-analytics",
                    ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                    force,
                    priority: "low",
                  }
                );
              }
  
              const normalizedRecord = {
                ...data,
                period: normalizePlaygroundEnvironmentHomeChartPeriod(data?.period || normalizedPeriod),
                summary: {
                  ...(data?.summary && typeof data.summary === "object" ? data.summary : {}),
                  totalRequests: Math.max(0, Number(data?.summary?.totalRequests ?? data?.summary?.totalRequests24h ?? 0) || 0),
                  successRate: Number(data?.summary?.successRate ?? data?.summary?.successRate24h ?? 0) || 0,
                  clientErrors: Math.max(0, Number(data?.summary?.clientErrors ?? data?.summary?.clientErrors24h ?? 0) || 0),
                  serverErrors: Math.max(0, Number(data?.summary?.serverErrors ?? data?.summary?.serverErrors24h ?? 0) || 0),
                },
                charts: {
                  ...(data?.charts && typeof data.charts === "object" ? data.charts : {}),
                  traffic: Array.isArray(data?.charts?.traffic)
                    ? data.charts.traffic
                    : (Array.isArray(data?.charts?.traffic24h) ? data.charts.traffic24h : []),
                  status: Array.isArray(data?.charts?.status)
                    ? data.charts.status
                    : (Array.isArray(data?.charts?.status24h) ? data.charts.status24h : []),
                },
                loadedAt: new Date().toISOString(),
              };
              setServerAnalyticsById((current) => ({
                ...current,
                [analyticsStateKey]: normalizedRecord,
              }));
              serverAnalyticsByIdRef.current = {
                ...serverAnalyticsByIdRef.current,
                [analyticsStateKey]: normalizedRecord,
              };
              return normalizedRecord;
            } catch (error) {
              setServerLogsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load analytics.",
              }));
              return null;
            } finally {
              setLoadingServerAnalyticsId((current) => current === analyticsStateKey ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewServerRecordById]);
  
          const loadServerAuthUsers = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            const force = options?.force === true;
            const existingUsers = serverAuthUsersById[normalizedServerId]?.users;
            if (!force && Array.isArray(existingUsers)) {
              return existingUsers;
            }
  
            setLoadingServerAuthUsersId(normalizedServerId);
            try {
              const response = await fetch(
                buildPlaygroundServerAuthUsersUrl(backendUrl, normalizedServerId, options?.limit || 200),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load auth users.");
              }
  
              const users = Array.isArray(data?.users) ? data.users : [];
              const record = {
                users,
                projectId: typeof data?.projectId === "string" ? data.projectId : "",
                nextPageToken: typeof data?.nextPageToken === "string" ? data.nextPageToken : "",
                loadedAt: new Date().toISOString(),
              };
              setServerAuthUsersById((current) => ({
                ...current,
                [normalizedServerId]: record,
              }));
              setServerAuthUsersState({
                error: "",
              });
              return users;
            } catch (error) {
              if (selectedServerIdRef.current === normalizedServerId) {
                setServerAuthUsersState({
                  error: error instanceof Error ? error.message : "Failed to load auth users.",
                });
              }
              return [];
            } finally {
              setLoadingServerAuthUsersId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, serverAuthUsersById]);
  
          const loadServerSecrets = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            const force = options?.force === true;
            const existingSecrets = serverSecretsById[normalizedServerId];
            if (!force && Array.isArray(existingSecrets)) {
              return existingSecrets;
            }
  
            setLoadingServerSecretsId(normalizedServerId);
            try {
              const response = await fetch(
                buildPlaygroundServerSecretsUrl(backendUrl, normalizedServerId),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load secrets.");
              }
  
              const sourceSecrets = Array.isArray(data?.secrets)
                ? data.secrets
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              const secrets = sourceSecrets.map(normalizePlaygroundSecretRecord).filter(Boolean);
              setServerSecretsById((current) => ({
                ...current,
                [normalizedServerId]: secrets,
              }));
              setServerSecretsState({
                error: "",
              });
              return secrets;
            } catch (error) {
              if (selectedServerIdRef.current === normalizedServerId) {
                setServerSecretsState({
                  error: error instanceof Error ? error.message : "Failed to load secrets.",
                });
              }
              return [];
            } finally {
              setLoadingServerSecretsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, serverSecretsById]);
  
          const loadServerAgentRuntimeRuns = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            const force = options?.force === true;
            const existingRuns = serverAgentRuntimeRunsById[normalizedServerId];
            if (!force && Array.isArray(existingRuns)) {
              return existingRuns;
            }
  
            setLoadingServerAgentRuntimeRunsId(normalizedServerId);
            setServerAgentRuntimeRunsState((current) => ({
              ...current,
              error: "",
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundServerRunsUrl(backendUrl, normalizedServerId, options?.limit || 80),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load runs.");
              }
  
              const runs = Array.isArray(data?.runs)
                ? data.runs
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              setServerAgentRuntimeRunsById((current) => ({
                ...current,
                [normalizedServerId]: runs,
              }));
              return runs;
            } catch (error) {
              setServerAgentRuntimeRunsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load runs.",
              }));
              return [];
            } finally {
              setLoadingServerAgentRuntimeRunsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, serverAgentRuntimeRunsById]);
  
          const loadDatabaseAnalytics = useCallback(async (databaseId, options = {}) => {
            const normalizedDatabaseId = String(databaseId || "").trim();
            if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }
  	      const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(options?.period);
  	      const analyticsStateKey = buildPlaygroundDatabaseAnalyticsStateKey(normalizedDatabaseId, normalizedPeriod);
  
            if (resourceTemplatePreviewDatabaseRecordById[normalizedDatabaseId]) {
              const collections = Array.isArray(resourceTemplatePreviewDatabaseCollectionsById[normalizedDatabaseId])
                ? resourceTemplatePreviewDatabaseCollectionsById[normalizedDatabaseId]
                : [];
              const totalDocuments = collections.reduce((sum, collection) => sum + Math.max(0, Number(collection?.documentCount || 0) || 0), 0);
              const normalizedRecord = {
  	          period: normalizedPeriod,
                summary: {
                  totalCollections: collections.length,
                  totalDocuments,
  	            reads: 0,
  	            writes: 0,
  	            deletes: 0,
                  reads24h: 0,
                  writes24h: 0,
                  deletes24h: 0,
                },
                charts: {
  	            operations: [],
  	            volume: [],
                  operations24h: [],
                },
                loadedAt: new Date().toISOString(),
              };
              setDatabaseAnalyticsById((current) => ({
                ...current,
  	          [analyticsStateKey]: normalizedRecord,
              }));
              return normalizedRecord;
            }
  
            const force = options?.force === true;
  	      if (!force && databaseAnalyticsByIdRef.current[analyticsStateKey]) {
  	        return databaseAnalyticsByIdRef.current[analyticsStateKey];
            }
  
  	      setLoadingDatabaseAnalyticsId(analyticsStateKey);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
  	          buildPlaygroundDatabaseAnalyticsUrl(backendUrl, normalizedDatabaseId, normalizedPeriod),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                  force,
                }
              );
  
              const analyticsSource = [
                data?.analytics,
                data?.data?.analytics,
                data?.data,
                data,
              ].find((candidate) =>
                candidate
                && typeof candidate === "object"
                && !Array.isArray(candidate)
                && (
                  candidate.summary && typeof candidate.summary === "object"
                  || candidate.charts && typeof candidate.charts === "object"
                )
              ) || {};
              const existingCollections = Array.isArray(databaseCollectionsByIdRef.current[normalizedDatabaseId])
                ? databaseCollectionsByIdRef.current[normalizedDatabaseId]
                : [];
              const fallbackTotalDocuments = existingCollections.reduce((sum, collection) =>
                sum + Math.max(0, Number(collection?.documentCount || 0) || 0),
                0
              );
              const summary = analyticsSource.summary && typeof analyticsSource.summary === "object" && !Array.isArray(analyticsSource.summary)
                ? analyticsSource.summary
                : {};
              const charts = analyticsSource.charts && typeof analyticsSource.charts === "object" && !Array.isArray(analyticsSource.charts)
                ? analyticsSource.charts
                : {};
              const normalizedRecord = {
                ...analyticsSource,
  	          period: normalizePlaygroundEnvironmentHomeChartPeriod(analyticsSource.period || normalizedPeriod),
                summary: {
                  ...summary,
                  totalCollections: Math.max(0, Number(summary.totalCollections ?? existingCollections.length) || 0),
                  totalDocuments: Math.max(0, Number(summary.totalDocuments ?? fallbackTotalDocuments) || 0),
  	            reads: Math.max(0, Number(summary.reads ?? summary.reads24h ?? 0) || 0),
  	            writes: Math.max(0, Number(summary.writes ?? summary.writes24h ?? 0) || 0),
  	            deletes: Math.max(0, Number(summary.deletes ?? summary.deletes24h ?? 0) || 0),
                  reads24h: Math.max(0, Number(summary.reads24h || 0) || 0),
                  writes24h: Math.max(0, Number(summary.writes24h || 0) || 0),
                  deletes24h: Math.max(0, Number(summary.deletes24h || 0) || 0),
                },
                charts: {
                  ...charts,
  	            operations: Array.isArray(charts.operations)
  	              ? charts.operations
  	              : (Array.isArray(charts.operations24h) ? charts.operations24h : []),
  	            volume: Array.isArray(charts.volume)
  	              ? charts.volume
  	              : (Array.isArray(charts.volume24h) ? charts.volume24h : []),
                  operations24h: Array.isArray(charts.operations24h) ? charts.operations24h : [],
                  volume24h: Array.isArray(charts.volume24h) ? charts.volume24h : [],
                },
                loadedAt: new Date().toISOString(),
              };
  
              setDatabaseAnalyticsById((current) => ({
                ...current,
  	          [analyticsStateKey]: normalizedRecord,
              }));
              setDatabaseSaveState((current) => current.error === "Database analytics response was empty."
                ? { ...current, error: "" }
                : current
              );
              return normalizedRecord;
            } catch (error) {
              if (selectedDatabaseIdRef.current === normalizedDatabaseId) {
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load database analytics.",
                }));
              }
              return null;
            } finally {
  	        setLoadingDatabaseAnalyticsId((current) => current === analyticsStateKey ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseCollectionsById, resourceTemplatePreviewDatabaseRecordById]);
  
          const loadServerLogs = useCallback(async (serverId, kind = "request", options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedKind = ["request", "runtime", "deployment"].includes(String(kind || "").trim().toLowerCase())
              ? String(kind).trim().toLowerCase()
              : "request";
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              setServerLogsById((current) => ({
                ...current,
                [normalizedServerId]: {
                  ...(current[normalizedServerId] || {}),
                  [normalizedKind]: [],
                },
              }));
              return [];
            }
  
            const force = options?.force === true;
            const existingLogs = serverLogsById[normalizedServerId]?.[normalizedKind];
            if (!force && Array.isArray(existingLogs)) {
              return existingLogs;
            }
  
            const loadingKey = normalizedServerId + ":" + normalizedKind;
            setServerLogsState((current) => ({
              ...current,
              loadingKey,
              error: "",
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundServerLogsUrl(backendUrl, normalizedServerId, normalizedKind, options?.limit || 80),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (response.status === 404) {
                setServerLogsById((current) => ({
                  ...current,
                  [normalizedServerId]: {
                    ...(current[normalizedServerId] || {}),
                    [normalizedKind]: [],
                  },
                }));
                return [];
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load logs.");
              }
  
              const nextLogs = Array.isArray(data?.logs) ? data.logs : [];
              setServerLogsById((current) => ({
                ...current,
                [normalizedServerId]: {
                  ...(current[normalizedServerId] || {}),
                  [normalizedKind]: nextLogs,
                },
              }));
              return nextLogs;
            } catch (error) {
              setServerLogsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load logs.",
              }));
              return [];
            } finally {
              setServerLogsState((current) => ({
                ...current,
                loadingKey: current.loadingKey === loadingKey ? "" : current.loadingKey,
              }));
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById, serverLogsById]);
  
          const loadServerDeployments = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              setServerDeploymentsById((current) => ({
                ...current,
                [normalizedServerId]: [],
              }));
              return [];
            }
  
            const force = options?.force === true;
            const existingDeployments = serverDeploymentsById[normalizedServerId];
            if (!force && Array.isArray(existingDeployments)) {
              return existingDeployments;
            }
  
            setLoadingServerDeploymentsId(normalizedServerId);
            setServerDeploymentHistoryState((current) => ({
              ...current,
              error: "",
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundServerDeploymentsUrl(backendUrl, normalizedServerId),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (response.status === 404) {
                setServerDeploymentsById((current) => ({
                  ...current,
                  [normalizedServerId]: [],
                }));
                return [];
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load deployments.");
              }
  
              const sourceDeployments = Array.isArray(data?.deployments)
                ? data.deployments
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              const deployments = sourceDeployments
                .map(normalizePlaygroundServerDeploymentRecord)
                .filter(Boolean);
              setServerDeploymentsById((current) => ({
                ...current,
                [normalizedServerId]: deployments,
              }));
              return deployments;
            } catch (error) {
              if (selectedServerIdRef.current === normalizedServerId) {
                setServerDeploymentHistoryState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load deployments.",
                }));
              }
              return [];
            } finally {
              setLoadingServerDeploymentsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById, serverDeploymentsById]);
  
          const loadServerBindings = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }
  
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: [],
              }));
              return [];
            }
  
            setLoadingServerBindingsId(normalizedServerId);
            setServerBindingState((current) => ({
              ...current,
              error: "",
            }));
  
            try {
              const response = await fetch(buildPlaygroundServerBindingsUrl(backendUrl, normalizedServerId), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load connections.");
              }
  
              const bindings = Array.isArray(data?.bindings)
                ? data.bindings.map(normalizePlaygroundServerBindingRecord).filter(Boolean)
                : [];
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: bindings,
              }));
              return bindings;
            } catch (error) {
              setServerBindingState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load connections.",
              }));
              return [];
            } finally {
              setLoadingServerBindingsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById]);
  
          const loadServerContext = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
  
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              const context = normalizePlaygroundServerContextRecord({
                serverId: normalizedServerId,
                bindings: [],
                runtime: {
                  nodejs: "22",
                  region: "europe-west1",
                  preview: true,
                },
                diagnostics: {
                  warnings: [],
                },
              });
              setServerContextsById((current) => ({
                ...current,
                [normalizedServerId]: context,
              }));
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: [],
              }));
              return context;
            }
  
            const force = options?.force === true;
            if (!force && serverContextsById[normalizedServerId]) {
              return serverContextsById[normalizedServerId];
            }
  
            setLoadingServerContextId(normalizedServerId);
            setServerRuntimeState((current) => ({
              ...current,
              error: "",
            }));
  
            try {
              const response = await fetch(buildPlaygroundServerContextUrl(backendUrl, normalizedServerId), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load runtime context.");
              }
  
              const context = normalizePlaygroundServerContextRecord(data);
              if (!context) {
                throw new Error("Runtime context response was empty.");
              }
  
              setServerContextsById((current) => ({
                ...current,
                [normalizedServerId]: context,
              }));
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: Array.isArray(context.bindings) ? context.bindings : [],
              }));
              return context;
            } catch (error) {
              setServerRuntimeState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load runtime context.",
              }));
              return null;
            } finally {
              setLoadingServerContextId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById, serverContextsById]);
  
          const loadDatabases = useCallback(async (options = {}) => {
            const force = options?.force === true;
            const requestState = databaseListRequestRef.current;
            const requestScopeKey = databaseListScopeKeyRef.current;
            const cachedRecord = readPlaygroundDatabaseListCache(requestScopeKey);
            if (cachedRecord && Number(cachedRecord.loadedAt || 0) > 0 && Array.isArray(cachedRecord.items)) {
              setDatabases(cachedRecord.items);
              setHasLoadedDatabases(true);
              const cacheAgeMs = Date.now() - Number(cachedRecord.loadedAt || 0);
              if (!force && cacheAgeMs >= 0 && cacheAgeMs < PLAYGROUND_DATABASE_LIST_CACHE_TTL_MS) {
                return cachedRecord.items;
              }
            }
            if (!force && requestState.promise) {
              return requestState.promise;
            }
            const requestId = requestState.requestId + 1;
            requestState.requestId = requestId;
            setDatabaseListLoading(true);
            const request = (async () => {
              try {
                const nextDatabases = await fetchPlaygroundDatabaseList(backendUrl, databaseRequestHeadersRef.current, {
                  force,
                  identity: databaseListIdentity,
                });
                if (databaseListScopeKeyRef.current !== requestScopeKey || databaseListRequestRef.current.requestId !== requestId) {
                  return nextDatabases;
                }
                setDatabases(nextDatabases);
                setHasLoadedDatabases(true);
                requestState.retryCount = 0;
                if (requestState.retryTimer) {
                  window.clearTimeout(requestState.retryTimer);
                  requestState.retryTimer = null;
                }
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: "",
                }));
                setDatabaseDetailsById((current) => {
                  const next = { ...current };
                  nextDatabases.forEach((database) => {
                    if (!database?.id) return;
                    next[database.id] = normalizePlaygroundDatabaseRecord({
                      ...(next[database.id] || {}),
                      ...database,
                    });
                  });
                  return next;
                });
  
                if (options?.selectId) {
                  setSelectedDatabaseId(options.selectId);
                } else if (selectedDatabaseIdRef.current && !nextDatabases.some((database) => database.id === selectedDatabaseIdRef.current)) {
                  setSelectedDatabaseId("");
                }
  
                return nextDatabases;
              } catch (error) {
                if (databaseListScopeKeyRef.current !== requestScopeKey || databaseListRequestRef.current.requestId !== requestId) {
                  return [];
                }
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load databases.",
                }));
                const staleRecord = readPlaygroundDatabaseListCache(requestScopeKey);
                const staleItems = Number(staleRecord?.loadedAt || 0) > 0 && Array.isArray(staleRecord?.items)
                  ? staleRecord.items
                  : null;
                if (Array.isArray(staleItems)) {
                  setDatabases(staleItems);
                  setHasLoadedDatabases(true);
                }
                if (options?.retry !== false && !requestState.retryTimer) {
                  const retryDelayMs = Math.min(15000, 750 * Math.pow(2, Math.min(requestState.retryCount, 4)));
                  requestState.retryCount += 1;
                  requestState.retryTimer = window.setTimeout(() => {
                    requestState.retryTimer = null;
                    void loadDatabases({ retry: true, force: true });
                  }, retryDelayMs);
                }
                return Array.isArray(staleItems) ? staleItems : [];
              } finally {
                if (databaseListRequestRef.current.requestId === requestId) {
                  setDatabaseListLoading(false);
                }
              }
            })();
            requestState.promise = request;
            void request.finally(() => {
              if (requestState.promise === request) {
                requestState.promise = null;
              }
            });
            return request;
          }, [backendUrl, databaseListIdentity, databaseListScopeKey]);
  
          const loadDatabaseDetails = useCallback(async (databaseId, options = {}) => {
            if (!databaseId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }
  
            const templatePreviewDatabase = resourceTemplatePreviewDatabaseRecordById[databaseId] || null;
            if (templatePreviewDatabase) {
              setDatabaseDetailsById((current) => ({
                ...current,
                [databaseId]: templatePreviewDatabase,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                setDraftDatabase(templatePreviewDatabase);
              }
              setDatabaseSaveState((current) => ({
                ...current,
                error: "",
              }));
              return templatePreviewDatabase;
            }
  
            setLoadingDatabaseId(databaseId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                backendUrl + "/databases/" + encodeURIComponent(databaseId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_DETAIL_CACHE_TTL_MS,
                  force: options?.force === true,
                }
              );
  
              const normalized = getPlaygroundDatabaseResponseRecord(data);
              if (!normalized) {
                throw new Error("Database response was empty.");
              }
  
              setDatabaseDetailsById((current) => ({
                ...current,
                [databaseId]: normalized,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                setDraftDatabase(normalized);
              }
              return normalized;
            } catch (error) {
              if (selectedDatabaseIdRef.current === databaseId) {
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load database.",
                }));
              }
              return null;
            } finally {
              setLoadingDatabaseId((current) => current === databaseId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseRecordById]);
  
          const loadDatabaseCollections = useCallback(async (databaseId, options = {}) => {
            if (!databaseId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return [];
            }
  
            const existingCollections = databaseCollectionsByIdRef.current[databaseId];
            if (options?.force !== true && Array.isArray(existingCollections)) {
              return existingCollections;
            }
  
            const templatePreviewCollections = resourceTemplatePreviewDatabaseCollectionsById[databaseId];
            if (Array.isArray(templatePreviewCollections)) {
              setDatabaseCollectionsById((current) => ({
                ...current,
                [databaseId]: templatePreviewCollections,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                const currentSelectedCollectionId = selectedDatabaseCollectionIdRef.current;
                const nextCollectionId = templatePreviewCollections.some((item) => item.id === currentSelectedCollectionId)
                  ? currentSelectedCollectionId
                  : templatePreviewCollections[0]?.id || "";
                setSelectedDatabaseCollectionId(nextCollectionId);
                if (!nextCollectionId) {
                  setSelectedDatabaseDocumentId("");
                  setDatabaseDocumentEditorState({
                    documentId: "",
                    value: "{}",
                    initialValue: "{}",
                    error: "",
                    saveError: "",
                    saveMessage: "",
                    isSaving: false,
                  });
                }
              }
              return templatePreviewCollections;
            }
  
            setLoadingDatabaseCollectionsId(databaseId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseCollectionsUrl(backendUrl, databaseId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS,
                  force: options?.force === true,
                  persist: true,
                  priority: "high",
                }
              );
  
              const collections = Array.isArray(data?.collections) ? data.collections : [];
              setDatabaseCollectionsById((current) => ({
                ...current,
                [databaseId]: collections,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                const currentSelectedCollectionId = selectedDatabaseCollectionIdRef.current;
                const nextCollectionId = collections.some((item) => item.id === currentSelectedCollectionId)
                  ? currentSelectedCollectionId
                  : collections[0]?.id || "";
                setSelectedDatabaseCollectionId(nextCollectionId);
                if (!nextCollectionId) {
                  setSelectedDatabaseDocumentId("");
                  setDatabaseDocumentEditorState({
                    documentId: "",
                    value: "{}",
                    initialValue: "{}",
                    error: "",
                    saveError: "",
                    saveMessage: "",
                    isSaving: false,
                  });
                }
              }
              return collections;
            } catch (error) {
              setDatabaseSaveState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load collections.",
              }));
              return [];
            } finally {
              setLoadingDatabaseCollectionsId((current) => current === databaseId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseCollectionsById]);
  
          const loadDatabaseDocumentContent = useCallback(async (databaseId, collectionId, documentId, options = {}) => {
            if (!databaseId || !collectionId || !documentId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }
  
            const listKey = databaseId + ":" + collectionId;
            const summary = options?.documentSummary
              || (databaseDocumentsByCollectionKeyRef.current[listKey] || []).find((entry) => entry?.id === documentId)
              || { id: documentId };
            const applyDocument = (document) => {
              if (!document) return null;
              setDatabaseDocumentsByCollectionKey((current) => ({
                ...current,
                [listKey]: (Array.isArray(current[listKey]) ? current[listKey] : []).map((entry) => (
                  entry?.id === document.id ? { ...entry, ...document } : entry
                )),
              }));
              if (
                selectedDatabaseIdRef.current === databaseId
                && selectedDatabaseCollectionIdRef.current === collectionId
                && selectedDatabaseDocumentIdRef.current === documentId
              ) {
                const value = formatPlaygroundDatabaseDocumentJson(document.data);
                setDatabaseDocumentEditorState({
                  documentId,
                  value,
                  initialValue: value,
                  error: "",
                  saveError: "",
                  saveMessage: "",
                  isLoading: false,
                  isSaving: false,
                });
              }
              return document;
            };
  
            if (options?.useSummaryData === true && summary?.data && typeof summary.data === "object") {
              return applyDocument(getPlaygroundDatabaseDocumentResponseRecord(summary, summary));
            }
  
            if (
              selectedDatabaseIdRef.current === databaseId
              && selectedDatabaseCollectionIdRef.current === collectionId
              && selectedDatabaseDocumentIdRef.current === documentId
            ) {
              setDatabaseDocumentEditorState({
                documentId,
                value: "{}",
                initialValue: "{}",
                error: "",
                saveError: "",
                saveMessage: "",
                isLoading: true,
                isSaving: false,
              });
            }
  
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseDocumentUrl(backendUrl, databaseId, collectionId, documentId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_DOCUMENTS_CACHE_TTL_MS,
                  force: options?.force === true,
                }
              );
              const document = getPlaygroundDatabaseDocumentResponseRecord(data, summary);
              if (!document) {
                throw new Error("Document response was empty.");
              }
              return applyDocument(document);
            } catch (error) {
              if (
                selectedDatabaseIdRef.current === databaseId
                && selectedDatabaseCollectionIdRef.current === collectionId
                && selectedDatabaseDocumentIdRef.current === documentId
              ) {
                setDatabaseDocumentEditorState((current) => ({
                  ...current,
                  isLoading: false,
                  error: error instanceof Error ? error.message : "Failed to load document.",
                }));
              }
              return null;
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders]);
  
          const loadDatabaseDocuments = useCallback(async (databaseId, collectionId, options = {}) => {
            if (!databaseId || !collectionId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return [];
            }
  
            const loadingKey = databaseId + ":" + collectionId;
            const applyDocumentList = (documents, useSummaryData = false) => {
              const normalizedDocuments = (Array.isArray(documents) ? documents : []).map((document) => {
                if (useSummaryData) return document;
                const { data: _documentData, ...summary } = document && typeof document === "object" ? document : {};
                return summary;
              });
              setDatabaseDocumentsByCollectionKey((current) => ({
                ...current,
                [loadingKey]: normalizedDocuments,
              }));
              if (selectedDatabaseIdRef.current === databaseId && selectedDatabaseCollectionIdRef.current === collectionId) {
                const currentSelectedDocumentId = selectedDatabaseDocumentIdRef.current;
                const nextDocument = normalizedDocuments.find((entry) => entry.id === currentSelectedDocumentId) || normalizedDocuments[0] || null;
                const nextDocumentId = String(nextDocument?.id || "").trim();
                selectedDatabaseDocumentIdRef.current = nextDocumentId;
                setSelectedDatabaseDocumentId(nextDocumentId);
                if (nextDocumentId) {
                  void loadDatabaseDocumentContent(databaseId, collectionId, nextDocumentId, {
                    documentSummary: useSummaryData
                      ? (Array.isArray(documents) ? documents : []).find((entry) => entry?.id === nextDocumentId) || nextDocument
                      : nextDocument,
                    useSummaryData,
                  });
                } else {
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
                }
              }
              return normalizedDocuments;
            };
            const collectionRecord = (databaseCollectionsByIdRef.current[databaseId] || [])
              .find((collection) => collection?.id === collectionId) || null;
            const hasDeclaredDocumentCount = Boolean(
              collectionRecord
              && Object.prototype.hasOwnProperty.call(collectionRecord, "documentCount")
              && Number.isFinite(Number(collectionRecord.documentCount))
            );
            if (hasDeclaredDocumentCount && Number(collectionRecord.documentCount) <= 0) {
              return applyDocumentList([]);
            }
            const existingDocuments = databaseDocumentsByCollectionKeyRef.current[loadingKey];
            if (options?.force !== true && Array.isArray(existingDocuments)) {
              return applyDocumentList(existingDocuments, existingDocuments.some((entry) => entry?.data != null));
            }
            const templatePreviewDocuments = resourceTemplatePreviewDatabaseDocumentsByCollectionKey[loadingKey];
            if (Array.isArray(templatePreviewDocuments)) {
              return applyDocumentList(templatePreviewDocuments, true);
            }
  
            if (options?.silent !== true) {
              setLoadingDatabaseDocumentsKey(loadingKey);
            }
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseDocumentsUrl(backendUrl, databaseId, collectionId, options?.limit || 25),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_DOCUMENTS_CACHE_TTL_MS,
                  force: options?.force === true,
                }
              );
  
              return applyDocumentList(Array.isArray(data?.documents) ? data.documents : []);
            } catch (error) {
              if (options?.silent !== true) {
                setDatabaseDocumentEditorState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load documents.",
                }));
              }
              return [];
            } finally {
              if (options?.silent !== true) {
                setLoadingDatabaseDocumentsKey((current) => current === loadingKey ? "" : current);
              }
            }
          }, [backendUrl, databaseListScopeKey, loadDatabaseDocumentContent, requestHeaders, resourceTemplatePreviewDatabaseDocumentsByCollectionKey]);
  
          const loadDatabaseBootstrap = useCallback(async (databaseId) => {
            const normalizedDatabaseId = String(databaseId || "").trim();
            if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return false;
            }
            if (resourceTemplatePreviewDatabaseRecordById[normalizedDatabaseId]) {
              return false;
            }
  
            setLoadingDatabaseCollectionsId(normalizedDatabaseId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseBootstrapUrl(backendUrl, normalizedDatabaseId, 1),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS,
                  persist: true,
                  priority: "high",
                }
              );
              const collections = Array.isArray(data?.collections) ? data.collections : [];
              const preferredCollectionId = String(data?.selectedCollectionId || "").trim();
              const selectedCollectionId = collections.some((collection) => collection?.id === preferredCollectionId)
                ? preferredCollectionId
                : String(collections[0]?.id || "").trim();
              setDatabaseCollectionsById((current) => ({
                ...current,
                [normalizedDatabaseId]: collections,
              }));
              if (selectedDatabaseIdRef.current === normalizedDatabaseId) {
                selectedDatabaseCollectionIdRef.current = selectedCollectionId;
                setSelectedDatabaseCollectionId(selectedCollectionId);
                selectedDatabaseDocumentIdRef.current = "";
                setSelectedDatabaseDocumentId("");
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
              }
              setDatabaseSaveState((current) => ({ ...current, error: "" }));
              return true;
            } catch {
              return false;
            } finally {
              setLoadingDatabaseCollectionsId((current) => current === normalizedDatabaseId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseRecordById]);
  
          const prefetchDatabaseBootstrap = useCallback((databaseId) => {
            const normalizedDatabaseId = String(databaseId || "").trim();
            if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            void fetchPlaygroundCachedDatabaseResourceJson(
              buildPlaygroundDatabaseBootstrapUrl(backendUrl, normalizedDatabaseId, 1),
              requestHeaders,
              {
                scopeKey: databaseListScopeKey,
                ttlMs: PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS,
                persist: true,
                priority: "high",
              }
            ).catch(() => {});
          }, [backendUrl, databaseListScopeKey, requestHeaders]);
  
          const loadEnvironmentRuntimeStatus = useCallback(async (environmentId) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              setEnvironmentRuntimeState({
                status: "idle",
                containerId: "",
                message: "",
              });
              return null;
            }
  
            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/status", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment status.");
              }
              if (selectedEnvironmentIdRef.current !== normalizedEnvironmentId) {
                return data;
              }
              setEnvironmentRuntimeState({
                status: String(data?.status || "stopped").trim().toLowerCase() || "stopped",
                containerId: String(data?.containerId || "").trim(),
                message: String(data?.message || "").trim(),
              });
              return data;
            } catch (error) {
              if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                setEnvironmentRuntimeState({
                  status: "error",
                  containerId: "",
                  message: error instanceof Error ? error.message : "Failed to load environment status.",
                });
              }
              return null;
            }
          }, [backendUrl, requestHeaders]);
  
          const loadEnvironmentGuiScreenshot = useCallback(async (environmentId, options = {}) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return false;
            }
  
            const maxAttempts = Math.max(1, Math.min(10, Number(options?.attempts) || 1));
            const retryDelayMs = Math.max(250, Math.min(2000, Number(options?.retryDelayMs) || 500));
  
            setEnvironmentGuiState((current) => ({
              ...current,
              isLoading: true,
              error: "",
            }));
  
            let lastMessage = "Failed to open the live desktop.";
  
            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
              try {
                const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/gui/session", {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                  cache: "no-store",
                });
                if (!response.ok) {
                  lastMessage = await readEnvironmentGuiErrorMessage(response, "Failed to create desktop session.");
                  if (response.status === 409 && selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                    setEnvironmentRuntimeState({
                      status: "stopped",
                      containerId: "",
                      message: "Container not running",
                    });
                  }
                  if ((response.status === 409 || response.status === 503) && attempt < maxAttempts - 1) {
                    await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
                    continue;
                  }
                  throw new Error(lastMessage);
                }
  
                const data = await response.json().catch(() => ({}));
                if (selectedEnvironmentIdRef.current !== normalizedEnvironmentId) {
                  return false;
                }
  
                const websocketPath = String(data?.websocketPath || "").trim();
                if (!websocketPath) {
                  throw new Error("Desktop session did not return a websocket path.");
                }
  
                const localViewerWsUrl = new URL("/api/real/ws/vnc", window.location.origin);
                localViewerWsUrl.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                if (websocketPath.startsWith("/api/real/ws/vnc")) {
                  const proxiedWebsocketUrl = new URL(websocketPath, window.location.origin);
                  localViewerWsUrl.search = proxiedWebsocketUrl.search;
                } else {
                  const backendTarget = new URL(backendUrl);
                  const websocketUrl = new URL(websocketPath, backendTarget);
                  websocketUrl.protocol = websocketUrl.protocol === "https:"
                    ? "wss:"
                    : websocketUrl.protocol === "http:"
                      ? "ws:"
                      : websocketUrl.protocol;
                  localViewerWsUrl.searchParams.set("upstream", websocketUrl.toString());
                }
  
                const viewerUrl = new URL("/environment-gui/viewer", window.location.origin);
                viewerUrl.searchParams.set("wsUrl", localViewerWsUrl.toString());
                viewerUrl.searchParams.set("title", draftEnvironment?.name || "Environment Desktop");
                viewerUrl.searchParams.set("environmentId", normalizedEnvironmentId);
                viewerUrl.searchParams.set("ts", String(Date.now()));
                replaceEnvironmentGuiFrameUrl(viewerUrl.toString());
                setEnvironmentGuiState((current) => ({
                  ...current,
                  isLoading: false,
                  error: "",
                  lastLoadedAt: new Date().toISOString(),
                }));
                return true;
              } catch (error) {
                lastMessage = error instanceof Error ? error.message : "Failed to create desktop session.";
                if (attempt < maxAttempts - 1) {
                  await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
                  continue;
                }
              }
            }
  
            if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
              setEnvironmentGuiState((current) => ({
                ...current,
                isLoading: false,
                error: lastMessage,
              }));
            }
            return false;
          }, [backendUrl, draftEnvironment?.name, requestHeaders]);
  
          const sendEnvironmentGuiAction = useCallback(async (actionPayload, options = {}) => {
            const normalizedEnvironmentId = String(options?.environmentId || selectedEnvironmentIdRef.current || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return false;
            }
  
            setEnvironmentGuiState((current) => ({
              ...current,
              error: "",
            }));
  
            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/gui/action", {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(actionPayload),
              });
              if (!response.ok) {
                const message = await readEnvironmentGuiErrorMessage(response, "Failed to execute desktop action.");
                if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                  setEnvironmentGuiState((current) => ({
                    ...current,
                    error: message,
                  }));
                }
                return false;
              }
  
              return true;
            } catch (error) {
              if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                setEnvironmentGuiState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to execute desktop action.",
                }));
              }
              return false;
            }
          }, [backendUrl, requestHeaders]);
  
          const launchEnvironmentGuiApp = useCallback(async (app) => {
            const normalizedApp = String(app || "").trim().toLowerCase();
            if (!normalizedApp) {
              return false;
            }
            if (draftEnvironment?.guiEnabled === false) {
              setEnvironmentGuiState((current) => ({
                ...current,
                error: "GUI is disabled for this environment. Turn it on and restart the environment to use desktop apps.",
              }));
              return false;
            }
            return await sendEnvironmentGuiAction({
              action: "launch_app",
              app: normalizedApp,
            });
          }, [draftEnvironment?.guiEnabled, sendEnvironmentGuiAction]);
  
          const stopEnvironmentRuntime = useCallback(async (environmentId) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return false;
            }
  
            const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/stop", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            });
            if (!response.ok) {
              const message = await readEnvironmentGuiErrorMessage(response, "Failed to stop the environment.");
              throw new Error(message);
            }
            if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
              setEnvironmentRuntimeState({
                status: "stopped",
                containerId: "",
                message: "Container stopped",
              });
            }
            invalidateComputersOverviewAnalytics({
              backendUrl,
              headers: requestHeaders,
              identity: currentUserId || currentUserEmail || "session",
            });
            return true;
          }, [backendUrl, currentUserEmail, currentUserId, requestHeaders]);
  
          useEffect(() => {
            setEnvironmentDetailsById((current) => {
              const next = {};
              environments.forEach((environment) => {
                if (!environment?.id) return;
                next[environment.id] = normalizePlaygroundEnvironmentRecord({
                  ...(current[environment.id] || {}),
                  ...environment,
                });
              });
              return next;
            });
          }, [environments]);
  
          useEffect(() => {
            if (selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (selectedEnvironmentId && orderedEnvironments.some((environment) => environment.id === selectedEnvironmentId)) {
              return;
            }
            const fallbackEnvironment = orderedEnvironments.find((environment) => environment.isDefault) || orderedEnvironments[0] || null;
            setSelectedEnvironmentId(fallbackEnvironment?.id || "");
          }, [orderedEnvironments, selectedEnvironmentId]);
  
          useEffect(() => {
            if (embeddedInResources && resourceMode === "servers" && normalizedEmbeddedServerKind === "database") {
              return;
            }
            if (hasLoadedServers || serverListLoading) {
              return;
            }
            void loadServers();
          }, [embeddedInResources, hasLoadedServers, loadServers, normalizedEmbeddedServerKind, resourceMode, serverListLoading]);
  
          useEffect(() => {
            if (
              resourceMode !== "servers"
              || normalizedEmbeddedServerKind === "database"
              || serverAgentOptionsLoading
              || serverAgentOptions.length > 0
            ) {
              return;
            }
            void loadServerAgentOptions();
          }, [loadServerAgentOptions, normalizedEmbeddedServerKind, resourceMode, serverAgentOptions.length, serverAgentOptionsLoading]);
  
          useEffect(() => {
            if (!embeddedInResources || resourceMode !== "servers" || normalizedEmbeddedServerKind !== "voice_agent") {
              return;
            }
            void loadVoiceAgents();
          }, [embeddedInResources, loadVoiceAgents, normalizedEmbeddedServerKind, resourceMode]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (selectedServerId === PLAYGROUND_SERVER_DRAFT_ID || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            if (selectedServerId && visibleDisplayServerResources.some((resource) => resource.resourceType !== "database" && resource.id === selectedServerId)) {
              return;
            }
            if (!selectedServerId && selectedDatabaseId && visibleDisplayServerResources.some((resource) => resource.resourceType === "database" && resource.id === selectedDatabaseId)) {
              return;
            }
            const firstResource = visibleDisplayServerResources[0] || null;
            if (!firstResource) {
              setSelectedServerId("");
              setSelectedDatabaseId("");
              return;
            }
            if (firstResource.resourceType === "database") {
              setSelectedServerId("");
              setSelectedDatabaseId(firstResource.id);
              return;
            }
            setSelectedDatabaseId("");
            setSelectedServerId(firstResource.id || "");
          }, [orderedDatabases, orderedServers, resourceMode, selectedDatabaseId, selectedServerId, visibleDisplayServerResources]);
  
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
  
          useEffect(() => {
            if (!resourcesOverviewToolbarPopover) return undefined;
  
            function handleResourcesOverviewToolbarPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !resourcesOverviewToolbarRef.current || resourcesOverviewToolbarRef.current.contains(target)) {
                return;
              }
              setResourcesOverviewToolbarPopover("");
            }
  
            document.addEventListener("mousedown", handleResourcesOverviewToolbarPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleResourcesOverviewToolbarPopoverPointerDown);
          }, [resourcesOverviewToolbarPopover]);
  
          useEffect(() => {
            if (!serverLogsToolbarPopover) return undefined;
  
            function handleServerLogsToolbarPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverLogsToolbarRef.current || serverLogsToolbarRef.current.contains(target)) {
                return;
              }
              setServerLogsToolbarPopover("");
            }
  
            document.addEventListener("mousedown", handleServerLogsToolbarPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleServerLogsToolbarPopoverPointerDown);
          }, [serverLogsToolbarPopover]);
  
          useEffect(() => {
            setResourcesOverviewFilter("all");
            setResourcesOverviewSort("name");
            setResourcesOverviewSortDirection("asc");
            setResourcesOverviewToolbarPopover("");
            closeEnvironmentListActionMenu({ animate: false });
            closeEnvironmentBulkActionMenu({ animate: false });
          }, [resourceMode]);
  
          useEffect(() => {
            const isDetailVisible = !(
              isHomeViewActive
              || (resourceMode === "servers" ? (!selectedServerId && !selectedDatabaseId) : !selectedEnvironmentId)
            );
            if (!isDetailVisible) {
              return;
            }
            const frameId = window.requestAnimationFrame(() => {
              [
                resourcesDetailScrollRef.current,
                environmentDetailMainRef.current?.querySelector(".playground-environments-detail-scroll"),
                serverDetailMainRef.current?.querySelector(".playground-environments-detail-scroll"),
              ].forEach((node) => {
                if (node && typeof node.scrollTop === "number") {
                  node.scrollTop = 0;
                }
              });
            });
            return () => window.cancelAnimationFrame(frameId);
          }, [isHomeViewActive, resourceMode, selectedDatabaseId, selectedEnvironmentId, selectedServerId]);
  
          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            void loadAvailableRuntimeOptions();
          }, [loadAvailableRuntimeOptions, resourceMode]);
  
          useEffect(() => {
            return () => {
              if (environmentGuiClickTimerRef.current) {
                window.clearTimeout(environmentGuiClickTimerRef.current);
                environmentGuiClickTimerRef.current = null;
              }
              if (environmentGuiScrollTimerRef.current) {
                window.clearTimeout(environmentGuiScrollTimerRef.current);
                environmentGuiScrollTimerRef.current = null;
              }
              revokeEnvironmentGuiFrameUrl(environmentGuiFrameUrl);
            };
          }, [environmentGuiFrameUrl]);
  
          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              replaceEnvironmentGuiFrameUrl("");
              setEnvironmentGuiOpen(false);
              setEnvironmentGuiInputValue("");
              setEnvironmentGuiState({
                isStarting: false,
                isLoading: false,
                error: "",
                lastLoadedAt: "",
              });
              setEnvironmentRuntimeState({
                status: "idle",
                containerId: "",
                message: "",
              });
              return;
            }
  
            replaceEnvironmentGuiFrameUrl("");
            setEnvironmentGuiOpen(false);
            setEnvironmentGuiInputValue("");
            setEnvironmentGuiState({
              isStarting: false,
              isLoading: false,
              error: "",
              lastLoadedAt: "",
            });
            void loadEnvironmentRuntimeStatus(selectedEnvironmentId);
          }, [loadEnvironmentRuntimeStatus, resourceMode, selectedEnvironmentId]);
  
          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (environmentAnalyticsById[selectedEnvironmentId]) {
              return;
            }
            void loadEnvironmentAnalytics(selectedEnvironmentId);
          }, [environmentAnalyticsById, loadEnvironmentAnalytics, resourceMode, selectedEnvironmentId]);
  
          useEffect(() => {
            if (resourceMode !== "computers" || !isHomeViewActive) {
              return undefined;
            }
            const period = normalizePlaygroundEnvironmentHomeChartPeriod(environmentHomeChartTimescale);
            const requestOptions = {
              backendUrl,
              headers: requestHeaders,
              identity: currentUserId || currentUserEmail || "session",
              period,
            };
            const cached = readCachedComputersOverviewAnalytics(requestOptions);
            setComputersOverviewAnalyticsState((current) => {
              const isSameScope = current.scopeKey === computersOverviewAnalyticsScopeKey;
              const currentDataByPeriod = isSameScope ? current.dataByPeriod : {};
              return {
                scopeKey: computersOverviewAnalyticsScopeKey,
                dataByPeriod: cached?.data
                  ? { ...currentDataByPeriod, [period]: cached.data }
                  : currentDataByPeriod,
                loadingPeriod: cached?.data ? "" : period,
                errorsByPeriod: isSameScope ? { ...current.errorsByPeriod, [period]: "" } : {},
              };
            });
  
            let isActive = true;
            void fetchComputersOverviewAnalytics(requestOptions).then((data) => {
              if (!isActive) return;
              computersOverviewAnalyticsFallbackScopeRef.current = "";
              setComputersOverviewAnalyticsState((current) => {
                if (current.scopeKey !== computersOverviewAnalyticsScopeKey) return current;
                return {
                  ...current,
                  dataByPeriod: { ...current.dataByPeriod, [period]: data },
                  loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                  errorsByPeriod: { ...current.errorsByPeriod, [period]: "" },
                };
              });
            }).catch((error) => {
              if (!isActive) return;
              const errorMessage = error instanceof Error ? error.message : "Failed to load computer analytics.";
              const shouldUseLegacyFallback = error instanceof ComputersOverviewAnalyticsRequestError
                && (error.status === 404 || error.status === 501);
              setComputersOverviewAnalyticsState((current) => {
                if (current.scopeKey !== computersOverviewAnalyticsScopeKey) return current;
                return {
                  ...current,
                  loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                  errorsByPeriod: { ...current.errorsByPeriod, [period]: shouldUseLegacyFallback ? "" : errorMessage },
                };
              });
              const fallbackKey = computersOverviewAnalyticsScopeKey + "|" + period;
              if (shouldUseLegacyFallback && computersOverviewAnalyticsFallbackScopeRef.current !== fallbackKey) {
                computersOverviewAnalyticsFallbackScopeRef.current = fallbackKey;
                void loadEnvironmentHomeCostSummary(period);
                void loadEnvironmentHomeCostBreakdown(period);
                void loadEnvironmentHomeChartSummaries(period);
                void loadEnvironmentHomeChartBreakdowns(period);
              }
            });
  
            return () => {
              isActive = false;
            };
          }, [
            backendUrl,
            computersOverviewAnalyticsScopeKey,
            currentUserEmail,
            currentUserId,
            environmentHomeChartTimescale,
            isHomeViewActive,
            loadEnvironmentHomeChartBreakdowns,
            loadEnvironmentHomeChartSummaries,
            loadEnvironmentHomeCostBreakdown,
            loadEnvironmentHomeCostSummary,
            requestHeaders,
            resourceMode,
          ]);
  
          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              environmentSeededSelectionRef.current = selectedEnvironmentId;
              if (selectedEnvironmentId !== PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
                setDraftEnvironment(null);
                resetEditorAuxiliaryState();
              }
              return;
            }
  
            if (environmentSeededSelectionRef.current === selectedEnvironmentId) {
              return;
            }
            environmentSeededSelectionRef.current = selectedEnvironmentId;
  
            const seedEnvironment = environmentDetailsById[selectedEnvironmentId]
              || orderedEnvironments.find((environment) => environment.id === selectedEnvironmentId)
              || null;
  
            resetEditorAuxiliaryState();
            setEnvironmentDetailsCollapsed(false);
            setEnvironmentDetailTab("general");
            const normalizedSeedEnvironment = seedEnvironment ? normalizePlaygroundEnvironmentRecord(seedEnvironment) : null;
            if (normalizedSeedEnvironment) {
              rememberEnvironmentVersionBaseline(normalizedSeedEnvironment);
            }
            setDraftEnvironment(normalizedSeedEnvironment);
            void loadEnvironmentDetails(selectedEnvironmentId);
          }, [environmentDetailsById, loadEnvironmentDetails, orderedEnvironments, resourceMode, selectedEnvironmentId]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              serverSeededSelectionRef.current = selectedServerId;
              if (selectedServerId !== PLAYGROUND_SERVER_DRAFT_ID) {
                setDraftServer(null);
                resetServerEditorAuxiliaryState();
              }
              return;
            }
  
            if (serverSeededSelectionRef.current === selectedServerId) {
              return;
            }
            serverSeededSelectionRef.current = selectedServerId;
  
            const seedServer = serverDetailsById[selectedServerId]
              || orderedServers.find((server) => server.id === selectedServerId)
              || null;
  
            resetServerEditorAuxiliaryState();
            setServerDetailsCollapsed(false);
            setDraftServer(seedServer ? normalizePlaygroundServerRecord(seedServer) : null);
            const seedServerKind = canonicalizePlaygroundServerKind(seedServer?.kind);
            if (["function", "web_app", "auth", "agent_runtime", "secrets", "payments"].includes(seedServerKind)) {
              void loadServerAnalytics(selectedServerId, { period: serverDetailChartTimescale })
                .finally(() => loadServerDetails(selectedServerId));
            } else {
              void loadServerDetails(selectedServerId);
            }
            if (!["auth", "agent_runtime", "voice_agent", "secrets", "payments", "function", "web_app"].includes(seedServerKind)) {
              void loadServerFiles(selectedServerId);
            }
            if (!["function", "web_app", "auth", "agent_runtime", "secrets", "payments"].includes(seedServerKind)) {
              void loadServerBindings(selectedServerId);
            }
          }, [loadServerAnalytics, loadServerBindings, loadServerDetails, loadServerFiles, orderedServers, resourceMode, selectedServerId, serverDetailChartTimescale, serverDetailsById]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id || canonicalizePlaygroundServerKind(activeServer.kind) !== "auth") {
              return;
            }
            if (authDetailTab !== "users") {
              return;
            }
            if (serverAuthUsersById[selectedServerId]?.users) {
              return;
            }
            void loadServerAuthUsers(selectedServerId);
          }, [authDetailTab, draftServer, loadServerAuthUsers, resourceMode, selectedServerId, selectedServerSnapshot, serverAuthUsersById]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id || canonicalizePlaygroundServerKind(activeServer.kind) !== "secrets") {
              return;
            }
            if (secretsDetailTab !== "secrets") {
              return;
            }
            if (Array.isArray(serverSecretsById[selectedServerId])) {
              return;
            }
            void loadServerSecrets(selectedServerId);
          }, [draftServer, loadServerSecrets, resourceMode, secretsDetailTab, selectedServerId, selectedServerSnapshot, serverSecretsById]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id || canonicalizePlaygroundServerKind(activeServer.kind) !== "agent_runtime") {
              return;
            }
            if (agentRuntimeDetailTab !== "threads") {
              return;
            }
            if (Array.isArray(serverAgentRuntimeRunsById[selectedServerId])) {
              return;
            }
            void loadServerAgentRuntimeRuns(selectedServerId);
          }, [agentRuntimeDetailTab, draftServer, loadServerAgentRuntimeRuns, resourceMode, selectedServerId, selectedServerSnapshot, serverAgentRuntimeRunsById]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id) {
              return;
            }
            if (canonicalizePlaygroundServerKind(activeServer.kind) === "voice_agent") {
              return;
            }
            const normalizedKind = canonicalizePlaygroundServerKind(activeServer.kind);
            const isSourceDeployableServer = ["web_app", "function"].includes(normalizedKind);
            const isOperationalDetailServer = ["web_app", "function", "auth", "agent_runtime", "secrets", "payments"].includes(normalizedKind);
            if (!isOperationalDetailServer && !activeServer.cloudRunServiceName && !activeServer.serviceUrl) {
              return;
            }
            if (isSourceDeployableServer && serverDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "auth" && authDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "secrets" && secretsDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "agent_runtime" && agentRuntimeDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "payments" && serverDetailTab !== "usage") {
              return;
            }
            const analyticsPeriod = isOperationalDetailServer ? serverDetailChartTimescale : "day";
            const analyticsStateKey = buildPlaygroundServerAnalyticsStateKey(selectedServerId, analyticsPeriod);
            if (serverAnalyticsByIdRef.current[analyticsStateKey]) {
              return;
            }
            void loadServerAnalytics(selectedServerId, { period: analyticsPeriod });
          }, [agentRuntimeDetailTab, authDetailTab, draftServer, loadServerAnalytics, resourceMode, secretsDetailTab, selectedServerId, selectedServerSnapshot, serverDetailChartTimescale, serverDetailTab]);
  
          useEffect(() => {
            if (resourceMode !== "servers" || serverAnalyticsView !== "analytics") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (["auth", "agent_runtime", "voice_agent", "secrets", "payments"].includes(canonicalizePlaygroundServerKind(activeServer?.kind))) {
              return;
            }
            void loadServerAnalytics(selectedServerId);
            void loadServerLogs(selectedServerId, serverLogsState.kind);
          }, [draftServer, loadServerAnalytics, loadServerLogs, resourceMode, selectedServerId, selectedServerSnapshot, serverAnalyticsView, serverLogsState.kind]);
  
          useEffect(() => {
            if (resourceMode !== "servers" || !["logs", "history"].includes(serverDetailTab)) {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!["web_app", "function"].includes(canonicalizePlaygroundServerKind(activeServer?.kind))) {
              return;
            }
            if (serverDetailTab === "logs") {
              void loadServerAnalytics(selectedServerId);
              void loadServerLogs(selectedServerId, serverLogsState.kind);
            } else {
              void loadServerDeployments(selectedServerId);
            }
          }, [draftServer, loadServerAnalytics, loadServerDeployments, loadServerLogs, resourceMode, selectedServerId, selectedServerSnapshot, serverDetailTab, serverLogsState.kind]);
  
          useEffect(() => {
            if (resourceMode !== "servers" || serverDetailTab !== "code") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            const activeServerKind = canonicalizePlaygroundServerKind(activeServer?.kind);
            if (!["function", "web_app"].includes(activeServerKind)) {
              return;
            }
            if (!hasLoadedCurrentServerFiles || loadingServerFilesId === selectedServerId) {
              return;
            }
            if (serverFileEditorState.path && currentServerFiles.some((entry) => entry.path === serverFileEditorState.path)) {
              return;
            }
  
            const preferredSourcePath = activeServerKind === "web_app"
              ? PLAYGROUND_DEFAULT_WEB_APP_SOURCE_PATH
              : PLAYGROUND_DEFAULT_FUNCTION_SOURCE_PATH;
            const preferredEntry = currentServerFiles.find((entry) => !entry?.isFolder && entry.path === preferredSourcePath && isPlaygroundTextPreviewable(entry))
              || currentServerFiles.find((entry) => !entry?.isFolder && isPlaygroundTextPreviewable(entry))
              || null;
            if (preferredEntry?.path) {
              void loadServerFileContent(selectedServerId, preferredEntry.path);
              return;
            }
            if (activeServerKind === "function") {
              void createDefaultFunctionSourceFile(selectedServerId);
            } else if (activeServerKind === "web_app") {
              void createDefaultWebAppSourceFiles(selectedServerId);
            }
          }, [
            currentServerFiles,
            draftServer,
            hasLoadedCurrentServerFiles,
            loadServerFileContent,
            loadingServerFilesId,
            resourceMode,
            selectedServerId,
            selectedServerSnapshot,
            serverDetailTab,
            serverFileEditorState.path,
          ]);
  
          useEffect(() => {
            if (!serverFileEditorState.path) {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
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
              return;
            }
            if (currentServerFiles.some((entry) => entry.path === serverFileEditorState.path)) {
              return;
            }
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
          }, [currentServerFiles, selectedServerId, serverFileEditorState.path]);
  
          useEffect(() => {
            if (resourceMode === "servers" && serverFileEditorState.path && typeof onRequestSidebarCollapse === "function") {
              onRequestSidebarCollapse();
            }
          }, [onRequestSidebarCollapse, resourceMode, serverFileEditorState.path]);
  
          useEffect(() => {
            const shouldLoadDatabaseCatalog = !embeddedInResources
              || (resourceMode === "servers" && (!normalizedEmbeddedServerKind || normalizedEmbeddedServerKind === "database"));
            if (!shouldLoadDatabaseCatalog) return;
            if (databaseListInitialLoadScopeRef.current === databaseListScopeKey) return;
            const requestState = databaseListRequestRef.current;
            requestState.requestId += 1;
            requestState.promise = null;
            requestState.retryCount = 0;
            if (requestState.retryTimer) {
              window.clearTimeout(requestState.retryTimer);
              requestState.retryTimer = null;
            }
            const cachedRecord = readPlaygroundDatabaseListCache(databaseListScopeKey);
            setDatabases(cachedRecord?.items || []);
            setHasLoadedDatabases(Number(cachedRecord?.loadedAt || 0) > 0);
            databaseListInitialLoadScopeRef.current = databaseListScopeKey;
            void loadDatabases({ retry: true });
          }, [databaseListScopeKey, embeddedInResources, loadDatabases, normalizedEmbeddedServerKind, resourceMode]);
  
          useEffect(() => () => {
            const requestState = databaseListRequestRef.current;
            if (requestState.retryTimer) {
              window.clearTimeout(requestState.retryTimer);
              requestState.retryTimer = null;
            }
          }, []);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              serverResourceModeRefreshRef.current = false;
              return;
            }
            if (serverResourceModeRefreshRef.current) {
              return;
            }
            serverResourceModeRefreshRef.current = true;
            if (normalizedEmbeddedServerKind !== "database" && !serverListLoading) {
              void loadServers();
            }
            if ((!normalizedEmbeddedServerKind || normalizedEmbeddedServerKind === "database") && !databaseListLoading) {
              void loadDatabases();
            }
          }, [databaseListLoading, loadDatabases, loadServers, normalizedEmbeddedServerKind, resourceMode, serverListLoading]);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              databaseSeededSelectionRef.current = selectedDatabaseId;
              setDraftDatabase(null);
              resetDatabaseEditorAuxiliaryState();
              return;
            }
  
            if (databaseSeededSelectionRef.current === selectedDatabaseId) {
              return;
            }
            databaseSeededSelectionRef.current = selectedDatabaseId;
  
            const seedDatabase = databaseDetailsById[selectedDatabaseId]
              || orderedDatabases.find((database) => database.id === selectedDatabaseId)
              || null;
  
            resetDatabaseEditorAuxiliaryState();
            setDraftDatabase(seedDatabase ? normalizePlaygroundDatabaseRecord(seedDatabase) : null);
            void (async () => {
              if (!seedDatabase) {
                void loadDatabaseDetails(selectedDatabaseId);
              }
              const didBootstrap = await loadDatabaseBootstrap(selectedDatabaseId);
              if (selectedDatabaseIdRef.current !== selectedDatabaseId) {
                return;
              }
              if (didBootstrap) return;
              await loadDatabaseCollections(selectedDatabaseId);
            })();
          }, [databaseDetailsById, loadDatabaseBootstrap, loadDatabaseCollections, loadDatabaseDetails, orderedDatabases, resourceMode, selectedDatabaseId]);
  
          useEffect(() => {
            if (
              resourceMode !== "servers"
              || databaseDetailTab !== "usage"
              || !selectedDatabaseId
              || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID
            ) {
              return;
            }
  	      void loadDatabaseAnalytics(selectedDatabaseId, { period: databaseDetailChartTimescale });
  	    }, [databaseDetailChartTimescale, databaseDetailTab, loadDatabaseAnalytics, resourceMode, selectedDatabaseId]);
  
          useEffect(() => {
            if (
              databaseDetailTab !== "settings"
              || !selectedDatabaseId
              || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID
            ) {
              return undefined;
            }
            const frameId = window.requestAnimationFrame(() => {
              const scrollNode = resourcesDetailScrollRef.current;
              if (scrollNode && typeof scrollNode.scrollTop === "number") {
                scrollNode.scrollTop = 0;
              }
              setDatabasePermissionChartAnimationKey((current) => current + 1);
            });
            return () => window.cancelAnimationFrame(frameId);
          }, [databaseDetailTab, databasePermissionTeamId, selectedDatabaseId]);
  
          useEffect(() => {
            databaseWorkspaceTeamsRequestedRef.current = false;
          }, [databaseListScopeKey]);
  
          useEffect(() => {
            databaseOwnerTeamMembersRequestedRef.current = new Set();
            setDatabaseOwnerTeamMembersById({});
            setDatabaseOwnerPopoverOpen(false);
  	      setDatabaseOwnerTransferTarget(null);
  	      setDatabaseOwnerTransferModalVisible(false);
  	      setDatabaseOwnerTransferModalClosing(false);
          }, [selectedDatabaseId]);
  
  	    useEffect(() => () => {
  	      if (databaseOwnerTransferModalCloseTimerRef.current !== null && typeof window !== "undefined") {
  	        window.clearTimeout(databaseOwnerTransferModalCloseTimerRef.current);
  	      }
  	      if (databaseOwnerTransferModalFrameRef.current !== null && typeof window !== "undefined") {
  	        window.cancelAnimationFrame(databaseOwnerTransferModalFrameRef.current);
  	      }
  	    }, []);
  
          useEffect(() => {
            if (
              databaseDetailTab !== "settings"
              || workspaceTeamsLoading
              || workspaceTeamsRequiresPlan
              || (Array.isArray(workspaceTeams) && workspaceTeams.length > 0)
              || databaseWorkspaceTeamsRequestedRef.current
              || typeof onWorkspaceTeamsRequest !== "function"
            ) {
              return;
            }
            databaseWorkspaceTeamsRequestedRef.current = true;
            onWorkspaceTeamsRequest({});
          }, [
            databaseDetailTab,
            onWorkspaceTeamsRequest,
            workspaceTeams,
            workspaceTeamsLoading,
            workspaceTeamsRequiresPlan,
          ]);
  
          useEffect(() => {
            if (!databaseOwnerPopoverOpen || !draftDatabase?.id) return;
            const missingTeamIds = getDatabaseSharedTeamIds(draftDatabase).filter((teamId) => (
              !Object.prototype.hasOwnProperty.call(databaseOwnerTeamMembersById, teamId)
              && !databaseOwnerTeamMembersRequestedRef.current.has(teamId)
            ));
            missingTeamIds.forEach((teamId) => {
              databaseOwnerTeamMembersRequestedRef.current.add(teamId);
              void loadDatabaseOwnerTeamMembers(teamId);
            });
          }, [databaseOwnerPopoverOpen, databaseOwnerTeamMembersById, draftDatabase]);
  
          useEffect(() => {
            if (!databaseOwnerPopoverOpen) return undefined;
  
            function handleDatabaseOwnerPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || databaseOwnerPopoverRef.current?.contains(target)) return;
              setDatabaseOwnerPopoverOpen(false);
            }
  
            function handleDatabaseOwnerPopoverEscape(event) {
              if (event.key === "Escape") setDatabaseOwnerPopoverOpen(false);
            }
  
            document.addEventListener("mousedown", handleDatabaseOwnerPopoverPointerDown);
            window.addEventListener("keydown", handleDatabaseOwnerPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleDatabaseOwnerPopoverPointerDown);
              window.removeEventListener("keydown", handleDatabaseOwnerPopoverEscape);
            };
          }, [databaseOwnerPopoverOpen]);
  
          useEffect(() => {
            if (!databaseTeamMenuId) {
              return undefined;
            }
  
            function handleDatabaseTeamMenuPointerDown(event) {
              const target = event?.target instanceof Element ? event.target : null;
              if (!target?.closest(".playground-database-team-menu-scope")) {
                setDatabaseTeamMenuId("");
              }
            }
  
            function handleDatabaseTeamMenuEscape(event) {
              if (event.key === "Escape") {
                setDatabaseTeamMenuId("");
              }
            }
  
            document.addEventListener("mousedown", handleDatabaseTeamMenuPointerDown);
            window.addEventListener("keydown", handleDatabaseTeamMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleDatabaseTeamMenuPointerDown);
              window.removeEventListener("keydown", handleDatabaseTeamMenuEscape);
            };
          }, [databaseTeamMenuId]);
  
          useEffect(() => {
            if (!serverTeamMenuId) return undefined;
  
            function handleServerAccessPopupPointerDown(event) {
              const target = event?.target instanceof Element ? event.target : null;
              if (!target?.closest(".playground-database-team-menu-scope")) setServerTeamMenuId("");
            }
  
            function handleServerAccessPopupEscape(event) {
              if (event.key !== "Escape") return;
              setServerTeamMenuId("");
            }
  
            document.addEventListener("mousedown", handleServerAccessPopupPointerDown);
            window.addEventListener("keydown", handleServerAccessPopupEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerAccessPopupPointerDown);
              window.removeEventListener("keydown", handleServerAccessPopupEscape);
            };
          }, [serverTeamMenuId]);
  
          useEffect(() => {
            if (!serverOwnerPopoverOpen) return undefined;
            function handleServerOwnerPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || serverOwnerPopoverRef.current?.contains(target)) return;
              setServerOwnerPopoverOpen(false);
            }
            function handleServerOwnerEscape(event) {
              if (event.key === "Escape") setServerOwnerPopoverOpen(false);
            }
            document.addEventListener("mousedown", handleServerOwnerPointerDown);
            window.addEventListener("keydown", handleServerOwnerEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerOwnerPointerDown);
              window.removeEventListener("keydown", handleServerOwnerEscape);
            };
          }, [serverOwnerPopoverOpen]);
  
          useEffect(() => {
            if (!serverOwnerPopoverOpen || !draftServer?.id) return;
            getServerSharedTeamIds(draftServer).forEach((teamId) => {
              if (
                Object.prototype.hasOwnProperty.call(databaseOwnerTeamMembersById, teamId)
                || databaseOwnerTeamMembersRequestedRef.current.has(teamId)
              ) return;
              databaseOwnerTeamMembersRequestedRef.current.add(teamId);
              void loadDatabaseOwnerTeamMembers(teamId);
            });
          }, [databaseOwnerTeamMembersById, draftServer, serverOwnerPopoverOpen]);
  
          useEffect(() => () => {
            if (serverOwnerTransferModalCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(serverOwnerTransferModalCloseTimerRef.current);
            }
          }, []);
  
          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID || !selectedDatabaseCollectionId) {
              return;
            }
            void loadDatabaseDocuments(selectedDatabaseId, selectedDatabaseCollectionId);
          }, [loadDatabaseDocuments, resourceMode, selectedDatabaseCollectionId, selectedDatabaseId]);
  
          useEffect(() => {
            setToolbarPopover("");
            setSearchPopupQuery("");
          }, [resourceMode]);
  
          useEffect(() => {
            if (!versionsDrawerPortalId || typeof document === "undefined") {
              setEnvironmentVersionsDrawerContainer(null);
              return undefined;
            }
            setEnvironmentVersionsDrawerContainer(document.getElementById(versionsDrawerPortalId));
            return undefined;
          }, [versionsDrawerPortalId]);
  
          useEffect(() => {
            if (!environmentVersionSelectorMenuOpen) {
              return undefined;
            }
  
            function handleEnvironmentVersionSelectorPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentVersionSelectorMenuRef.current || environmentVersionSelectorMenuRef.current.contains(target)) {
                return;
              }
              setEnvironmentVersionSelectorMenuOpen(false);
            }
  
            function handleEnvironmentVersionSelectorEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentVersionSelectorMenuOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleEnvironmentVersionSelectorPointerDown);
            window.addEventListener("keydown", handleEnvironmentVersionSelectorEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentVersionSelectorPointerDown);
              window.removeEventListener("keydown", handleEnvironmentVersionSelectorEscape);
            };
          }, [environmentVersionSelectorMenuOpen]);
  
          useEffect(() => {
            if (!environmentTagsMenuOpen) {
              return undefined;
            }
  
            function handleEnvironmentTagsMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentTagsMenuRef.current || environmentTagsMenuRef.current.contains(target)) {
                return;
              }
              setEnvironmentTagsMenuOpen(false);
            }
  
            function handleEnvironmentTagsMenuEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentTagsMenuOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleEnvironmentTagsMenuPointerDown);
            window.addEventListener("keydown", handleEnvironmentTagsMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentTagsMenuPointerDown);
              window.removeEventListener("keydown", handleEnvironmentTagsMenuEscape);
            };
          }, [environmentTagsMenuOpen]);
  
          useEffect(() => {
            if (typeof onVersionsSidebarOpenChange !== "function") {
              return undefined;
            }
            onVersionsSidebarOpenChange(Boolean(environmentVersionsSidebarOpen || serverVersionsSidebarOpen));
            return () => onVersionsSidebarOpenChange(false);
          }, [environmentVersionsSidebarOpen, onVersionsSidebarOpenChange, serverVersionsSidebarOpen]);
  
          useEffect(() => {
            if (environmentVersionsSidebarOpen) {
              if (environmentDetailsCollapsedBeforeVersionsRef.current === null) {
                environmentDetailsCollapsedBeforeVersionsRef.current = Boolean(environmentDetailsCollapsed);
              }
              if (!environmentDetailsCollapsed) {
                setEnvironmentDetailsCollapsed(true);
              }
              return;
            }
  
            if (environmentDetailsCollapsedBeforeVersionsRef.current !== null) {
              const shouldRestoreCollapsed = Boolean(environmentDetailsCollapsedBeforeVersionsRef.current);
              environmentDetailsCollapsedBeforeVersionsRef.current = null;
              setEnvironmentDetailsCollapsed(shouldRestoreCollapsed);
            }
          }, [environmentVersionsSidebarOpen, environmentDetailsCollapsed]);
  
          useEffect(() => {
            if (serverVersionsSidebarOpen) {
              if (serverDetailsCollapsedBeforeVersionsRef.current === null) {
                serverDetailsCollapsedBeforeVersionsRef.current = Boolean(serverDetailsCollapsed);
              }
              if (!serverDetailsCollapsed) {
                setServerDetailsCollapsed(true);
              }
              return;
            }
            if (serverDetailsCollapsedBeforeVersionsRef.current !== null) {
              const shouldRestoreCollapsed = Boolean(serverDetailsCollapsedBeforeVersionsRef.current);
              serverDetailsCollapsedBeforeVersionsRef.current = null;
              setServerDetailsCollapsed(shouldRestoreCollapsed);
            }
          }, [serverDetailsCollapsed, serverVersionsSidebarOpen]);
  
          useEffect(() => {
            const normalizedTargetEnvironmentId = String(navigationTargetEnvironmentId || "").trim();
            const previousRequest = environmentNavigationRequestRef.current || {
              token: null,
              targetId: "",
              handled: false,
            };
            const requestChanged =
              previousRequest.token !== navigationToken
              || previousRequest.targetId !== normalizedTargetEnvironmentId;
  
            if (requestChanged) {
              environmentNavigationRequestRef.current = {
                token: navigationToken,
                targetId: normalizedTargetEnvironmentId,
                handled: false,
              };
            }
  
            if (normalizedTargetEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              if (
                environmentNavigationRequestRef.current.handled
                && environmentComposerOpen
              ) {
                return;
              }
              void commitDraftServerIfDirty();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setEnvironmentsHomeActiveResourceCommand("");
              setEnvironmentsHomeResourceCommandRequest(null);
              setEnvironmentListActionMenuState(null);
              setEnvironmentActionsPopoverOpen(false);
              setServerActionsPopoverOpen(false);
              setServerFileActionsPopoverOpen(false);
              setDatabaseActionsPopoverOpen(false);
              setResourceMode("computers");
              setIsHomeViewActive(false);
              setSelectedEnvironmentId("");
              setSelectedServerId("");
              setSelectedDatabaseId("");
              setSelectedDatabaseCollectionId("");
              setSelectedDatabaseDocumentId("");
              openEnvironmentComposer();
              environmentNavigationRequestRef.current = {
                token: navigationToken,
                targetId: normalizedTargetEnvironmentId,
                handled: true,
              };
              return;
            }
  
            if (normalizedTargetEnvironmentId && orderedEnvironments.some((environment) => environment.id === normalizedTargetEnvironmentId)) {
              if (
                environmentNavigationRequestRef.current.handled
                && selectedEnvironmentIdRef.current === normalizedTargetEnvironmentId
              ) {
                return;
              }
              commitDraftEnvironmentIfDirty();
              void commitDraftServerIfDirty();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setEnvironmentsHomeActiveResourceCommand("");
              setEnvironmentsHomeResourceCommandRequest(null);
              setEnvironmentListActionMenuState(null);
              setEnvironmentActionsPopoverOpen(false);
              setServerActionsPopoverOpen(false);
              setServerFileActionsPopoverOpen(false);
              setDatabaseActionsPopoverOpen(false);
              setResourceMode("computers");
              setIsHomeViewActive(false);
              setSelectedEnvironmentId(normalizedTargetEnvironmentId);
              setSelectedServerId("");
              setSelectedDatabaseId("");
              setSelectedDatabaseCollectionId("");
              setSelectedDatabaseDocumentId("");
              environmentNavigationRequestRef.current = {
                token: navigationToken,
                targetId: normalizedTargetEnvironmentId,
                handled: true,
              };
              return;
            }
  
            if (normalizedTargetEnvironmentId) {
              return;
            }
  
            if (environmentNavigationRequestRef.current.handled) {
              return;
            }
  
            showEnvironmentsHome();
            environmentNavigationRequestRef.current = {
              token: navigationToken,
              targetId: "",
              handled: true,
            };
          }, [environmentComposerOpen, navigationTargetEnvironmentId, navigationToken, orderedEnvironments]);
  
          useEffect(() => {
            const normalizedTargetId = String(navigationTargetResourceId || "").trim();
            const normalizedTargetType = navigationTargetResourceType === "database" ? "database" : "server";
            const previousRequest = resourceNavigationRequestRef.current || {
              token: null,
              targetType: "",
              targetId: "",
              handled: false,
            };
            const requestChanged =
              previousRequest.token !== navigationResourceToken
              || previousRequest.targetType !== normalizedTargetType
              || previousRequest.targetId !== normalizedTargetId;
  
            if (requestChanged) {
              resourceNavigationRequestRef.current = {
                token: navigationResourceToken,
                targetType: normalizedTargetType,
                targetId: normalizedTargetId,
                handled: false,
              };
            }
  
            if (!embeddedInResources || embeddedResourcesView !== "servers" || !normalizedTargetId) {
              return;
            }
  
            if (
              resourceNavigationRequestRef.current.handled
              && resourceNavigationRequestRef.current.targetType === normalizedTargetType
              && resourceNavigationRequestRef.current.targetId === normalizedTargetId
            ) {
              return;
            }
  
            if (normalizedTargetType === "database") {
              handleDatabaseSelect(normalizedTargetId);
            } else {
              if (!orderedServers.some((server) => server.id === normalizedTargetId)) {
                return;
              }
              handleServerSelect(normalizedTargetId);
            }
  
            resourceNavigationRequestRef.current = {
              token: navigationResourceToken,
              targetType: normalizedTargetType,
              targetId: normalizedTargetId,
              handled: true,
            };
          }, [embeddedInResources, embeddedResourcesView, navigationResourceToken, navigationTargetResourceId, navigationTargetResourceType, orderedDatabases, orderedServers]);
  
          useEffect(() => {
            setServerAuthSearchQuery("");
            setServerAuthUserComposerState({
              open: false,
              email: "",
              password: "",
              displayName: "",
              error: "",
              isSaving: false,
            });
            setServerAuthUsersState({
              error: "",
            });
          }, [selectedServerId]);
  
          useEffect(() => {
            setAgentRuntimeSkillsPopoverOpen(false);
            setAgentRuntimeSkillsTab("system");
          }, [selectedServerId]);
  
          useEffect(() => {
            if (!serverAgentRuntimeRunComposer.open || !serverAgentRuntimeRunPromptTextareaRef.current) {
              return undefined;
            }
            const frame = window.requestAnimationFrame(() => {
              const textarea = serverAgentRuntimeRunPromptTextareaRef.current;
              if (!textarea) {
                return;
              }
              textarea.focus();
              resizeEnvironmentDescriptionTextarea(textarea);
            });
            return () => {
              window.cancelAnimationFrame(frame);
            };
          }, [serverAgentRuntimeRunComposer.open]);
  
          useEffect(() => {
            if (!agentRuntimeSkillsPopoverOpen) {
              return;
            }
            setServerDetailSelectPopover("");
            if (!hasLoadedRuntimeCustomSkills && !runtimeCustomSkillsLoading) {
              void loadRuntimeCustomSkills();
            }
          }, [agentRuntimeSkillsPopoverOpen, hasLoadedRuntimeCustomSkills, loadRuntimeCustomSkills, runtimeCustomSkillsLoading]);
  
          useEffect(() => {
            if (!agentRuntimeSkillsPopoverOpen) return undefined;
  
            function handleAgentRuntimeSkillsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !agentRuntimeSkillsActionsRef.current || agentRuntimeSkillsActionsRef.current.contains(target)) {
                return;
              }
              setAgentRuntimeSkillsPopoverOpen(false);
            }
  
            function handleAgentRuntimeSkillsPopoverEscape(event) {
              if (event.key === "Escape") {
                setAgentRuntimeSkillsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleAgentRuntimeSkillsPopoverPointerDown);
            window.addEventListener("keydown", handleAgentRuntimeSkillsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleAgentRuntimeSkillsPopoverPointerDown);
              window.removeEventListener("keydown", handleAgentRuntimeSkillsPopoverEscape);
            };
          }, [agentRuntimeSkillsPopoverOpen]);
  
          useEffect(() => {
            if (!environmentRuntimePopover) return undefined;
  
            function handleEnvironmentRuntimePopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentRuntimePopoverRef.current || environmentRuntimePopoverRef.current.contains(target)) {
                return;
              }
              setEnvironmentRuntimePopover("");
            }
  
            function handleEnvironmentRuntimePopoverEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentRuntimePopover("");
              }
            }
  
            document.addEventListener("mousedown", handleEnvironmentRuntimePopoverPointerDown);
            window.addEventListener("keydown", handleEnvironmentRuntimePopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentRuntimePopoverPointerDown);
              window.removeEventListener("keydown", handleEnvironmentRuntimePopoverEscape);
            };
          }, [environmentRuntimePopover]);
  
          useEffect(() => {
            if (!environmentComposerRuntimePopover) return undefined;
  
            function handleEnvironmentComposerRuntimePopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentComposerRuntimePopoverRef.current || environmentComposerRuntimePopoverRef.current.contains(target)) {
                return;
              }
              setEnvironmentComposerRuntimePopover("");
            }
  
            function handleEnvironmentComposerRuntimePopoverEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentComposerRuntimePopover("");
              }
            }
  
            document.addEventListener("mousedown", handleEnvironmentComposerRuntimePopoverPointerDown);
            window.addEventListener("keydown", handleEnvironmentComposerRuntimePopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentComposerRuntimePopoverPointerDown);
              window.removeEventListener("keydown", handleEnvironmentComposerRuntimePopoverEscape);
            };
          }, [environmentComposerRuntimePopover]);
  
          useEffect(() => {
            if (!environmentActionsPopoverOpen) return undefined;
  
            function handleEnvironmentActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentActionsPopoverRef.current || environmentActionsPopoverRef.current.contains(target)) {
                return;
              }
              setEnvironmentActionsPopoverOpen(false);
            }
  
            function handleEnvironmentActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentActionsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleEnvironmentActionsPopoverPointerDown);
            window.addEventListener("keydown", handleEnvironmentActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleEnvironmentActionsPopoverEscape);
            };
          }, [environmentActionsPopoverOpen]);
  
          useEffect(() => {
            if (!environmentPublishMenuOpen) return undefined;
  
            function handleEnvironmentPublishMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentPublishMenuRef.current || environmentPublishMenuRef.current.contains(target)) {
                return;
              }
              setEnvironmentPublishMenuOpen(false);
            }
  
            function handleEnvironmentPublishMenuEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentPublishMenuOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleEnvironmentPublishMenuPointerDown);
            window.addEventListener("keydown", handleEnvironmentPublishMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentPublishMenuPointerDown);
              window.removeEventListener("keydown", handleEnvironmentPublishMenuEscape);
            };
          }, [environmentPublishMenuOpen]);
  
          useEffect(() => {
            if (!serverPublishMenuOpen) return undefined;
  
            function handleServerPublishMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverPublishMenuRef.current || serverPublishMenuRef.current.contains(target)) {
                return;
              }
              setServerPublishMenuOpen(false);
            }
  
            function handleServerPublishMenuEscape(event) {
              if (event.key === "Escape") {
                setServerPublishMenuOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleServerPublishMenuPointerDown);
            window.addEventListener("keydown", handleServerPublishMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerPublishMenuPointerDown);
              window.removeEventListener("keydown", handleServerPublishMenuEscape);
            };
          }, [serverPublishMenuOpen]);
  
          useEffect(() => {
            if (!environmentShareTeamModalOpen && !environmentShareTeamModalClosing) {
              return undefined;
            }
  
            function handleEnvironmentShareTeamEscape(event) {
              if (event.key === "Escape") {
                closeEnvironmentShareTeamModal();
              }
            }
  
            window.addEventListener("keydown", handleEnvironmentShareTeamEscape);
            return () => window.removeEventListener("keydown", handleEnvironmentShareTeamEscape);
          }, [environmentShareTeamModalOpen, environmentShareTeamModalClosing, environmentShareTeamState.action]);
  
          useEffect(() => {
            if (!environmentApiModalOpen && !environmentApiModalClosing) {
              return undefined;
            }
  
            function handleEnvironmentApiModalEscape(event) {
              if (event.key === "Escape") {
                closeEnvironmentApiModal();
              }
            }
  
            window.addEventListener("keydown", handleEnvironmentApiModalEscape);
            return () => window.removeEventListener("keydown", handleEnvironmentApiModalEscape);
          }, [environmentApiModalOpen, environmentApiModalClosing]);
  
          useEffect(() => {
            if (!environmentApiModalOpen) {
              return;
            }
            const normalizedAgentId = String(environmentApiAgentId || "").trim();
            if (!normalizedAgentId || !environmentApiAgentOptions.some((agent) => String(agent?.id || "").trim() === normalizedAgentId)) {
              setEnvironmentApiAgentId(environmentApiDefaultAgentId);
            }
          }, [environmentApiAgentId, environmentApiAgentOptions, environmentApiDefaultAgentId, environmentApiModalOpen]);
  
          useEffect(() => {
            if (!environmentApiModalOpen || serverPreviewEditorModule || serverPreviewEditorModuleError) {
              return undefined;
            }
  
            let cancelled = false;
  
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled) {
                  return;
                }
                if (!module) {
                  setServerPreviewEditorModuleError("Failed to load editor.");
                  return;
                }
                setServerPreviewEditorModule(module);
                setServerPreviewEditorModuleError("");
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
                setServerPreviewEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });
  
            return () => {
              cancelled = true;
            };
          }, [environmentApiModalOpen, serverPreviewEditorModule, serverPreviewEditorModuleError]);
  
          useEffect(() => {
            if (!serverActionsPopoverOpen) return undefined;
  
            function handleServerActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverActionsPopoverRef.current || serverActionsPopoverRef.current.contains(target)) {
                return;
              }
              setServerActionsPopoverOpen(false);
            }
  
            function handleServerActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setServerActionsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleServerActionsPopoverPointerDown);
            window.addEventListener("keydown", handleServerActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleServerActionsPopoverEscape);
            };
          }, [serverActionsPopoverOpen]);
  
          useEffect(() => {
            if (!resourceOverviewTopNavMenuOpen) return undefined;
  
            function handleResourceOverviewTopNavMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || resourceOverviewTopNavMenuRef.current?.contains(target)) return;
              setResourceOverviewTopNavMenuOpen(false);
            }
  
            function handleResourceOverviewTopNavMenuEscape(event) {
              if (event.key === "Escape") setResourceOverviewTopNavMenuOpen(false);
            }
  
            document.addEventListener("mousedown", handleResourceOverviewTopNavMenuPointerDown);
            window.addEventListener("keydown", handleResourceOverviewTopNavMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleResourceOverviewTopNavMenuPointerDown);
              window.removeEventListener("keydown", handleResourceOverviewTopNavMenuEscape);
            };
          }, [resourceOverviewTopNavMenuOpen]);
  
          useEffect(() => {
            if (!serverFileActionsPopoverOpen) return undefined;
  
            function handleServerFileActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverFileActionsPopoverRef.current || serverFileActionsPopoverRef.current.contains(target)) {
                return;
              }
              setServerFileActionsPopoverOpen(false);
            }
  
            function handleServerFileActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setServerFileActionsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleServerFileActionsPopoverPointerDown);
            window.addEventListener("keydown", handleServerFileActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerFileActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleServerFileActionsPopoverEscape);
            };
          }, [serverFileActionsPopoverOpen]);
  
          useEffect(() => {
            if (!serverSourceFileMenuPath) return undefined;
  
            function handleServerSourceFileMenuPointerDown(event) {
              const target = event?.target instanceof Element ? event.target : null;
              if (target?.closest(".playground-servers-source-file-actions-menu-shell")) {
                return;
              }
              setServerSourceFileMenuPath("");
            }
  
            function handleServerSourceFileMenuEscape(event) {
              if (event.key === "Escape") {
                setServerSourceFileMenuPath("");
              }
            }
  
            document.addEventListener("mousedown", handleServerSourceFileMenuPointerDown);
            window.addEventListener("keydown", handleServerSourceFileMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerSourceFileMenuPointerDown);
              window.removeEventListener("keydown", handleServerSourceFileMenuEscape);
            };
          }, [serverSourceFileMenuPath]);
  
          useEffect(() => {
            if (!serverDetailSelectPopover) return undefined;
  
            function handleServerDetailSelectPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverDetailSelectPopoverRef.current || serverDetailSelectPopoverRef.current.contains(target)) {
                return;
              }
              setServerDetailSelectPopover("");
            }
  
            function handleServerDetailSelectPopoverEscape(event) {
              if (event.key === "Escape") {
                setServerDetailSelectPopover("");
              }
            }
  
            document.addEventListener("mousedown", handleServerDetailSelectPopoverPointerDown);
            window.addEventListener("keydown", handleServerDetailSelectPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerDetailSelectPopoverPointerDown);
              window.removeEventListener("keydown", handleServerDetailSelectPopoverEscape);
            };
          }, [serverDetailSelectPopover]);
  
          useEffect(() => {
            if (!databaseActionsPopoverOpen) return undefined;
  
            function handleDatabaseActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !databaseActionsPopoverRef.current || databaseActionsPopoverRef.current.contains(target)) {
                return;
              }
              setDatabaseActionsPopoverOpen(false);
            }
  
            function handleDatabaseActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setDatabaseActionsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleDatabaseActionsPopoverPointerDown);
            window.addEventListener("keydown", handleDatabaseActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleDatabaseActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleDatabaseActionsPopoverEscape);
            };
          }, [databaseActionsPopoverOpen]);
  
          useEffect(() => {
            if (!databaseExportMenuOpen) return undefined;
  
            function handleDatabaseExportMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !databaseExportMenuRef.current || databaseExportMenuRef.current.contains(target)) {
                return;
              }
              setDatabaseExportMenuOpen(false);
            }
  
            function handleDatabaseExportMenuEscape(event) {
              if (event.key === "Escape") {
                setDatabaseExportMenuOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleDatabaseExportMenuPointerDown);
            window.addEventListener("keydown", handleDatabaseExportMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleDatabaseExportMenuPointerDown);
              window.removeEventListener("keydown", handleDatabaseExportMenuEscape);
            };
          }, [databaseExportMenuOpen]);
  
          useEffect(() => {
            if (!environmentRenameState || !environmentRenameInputRef.current) {
              return undefined;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              environmentRenameInputRef.current?.focus();
              environmentRenameInputRef.current?.select();
            });
  
            function handleEnvironmentRenameEscape(event) {
              if (event.key === "Escape" && !saveState.isSaving) {
                event.preventDefault();
                closeEnvironmentRenameDialog();
              }
            }
  
            window.addEventListener("keydown", handleEnvironmentRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleEnvironmentRenameEscape);
            };
          }, [environmentRenameState, saveState.isSaving]);
  
          useEffect(() => {
            if (!serverRenameState || !serverRenameInputRef.current) {
              return undefined;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              serverRenameInputRef.current?.focus();
              serverRenameInputRef.current?.select();
            });
  
            function handleServerRenameEscape(event) {
              if (event.key === "Escape" && !serverSaveState.isSaving) {
                event.preventDefault();
                closeServerRenameDialog();
              }
            }
  
            window.addEventListener("keydown", handleServerRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleServerRenameEscape);
            };
          }, [serverRenameState, serverSaveState.isSaving]);
  
          useEffect(() => {
            if (!databaseRenameState || !databaseRenameInputRef.current) {
              return undefined;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              databaseRenameInputRef.current?.focus();
              databaseRenameInputRef.current?.select();
            });
  
            function handleDatabaseRenameEscape(event) {
              if (event.key === "Escape" && !databaseSaveState.isSaving) {
                event.preventDefault();
                closeDatabaseRenameDialog();
              }
            }
  
            window.addEventListener("keydown", handleDatabaseRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleDatabaseRenameEscape);
            };
          }, [databaseRenameState, databaseSaveState.isSaving]);
  
          useEffect(() => () => {
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
              environmentAutosaveTimerRef.current = null;
            }
            if (databaseDocumentAutosaveTimerRef.current) {
              window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
              databaseDocumentAutosaveTimerRef.current = null;
            }
            if (databasePermissionSaveTimerRef.current) {
              window.clearTimeout(databasePermissionSaveTimerRef.current);
              databasePermissionSaveTimerRef.current = null;
            }
          }, []);
  
          useEffect(() => {
            if (databaseDocumentViewMode !== "json" || databaseJsonEditorModule || databaseJsonEditorModuleError) {
              return;
            }
  
            let cancelled = false;
  
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled || !module) {
                  return;
                }
                setDatabaseJsonEditorModule(module);
                setDatabaseJsonEditorModuleError("");
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
                setDatabaseJsonEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });
  
            return () => {
              cancelled = true;
            };
          }, [databaseDocumentViewMode, databaseJsonEditorModule, databaseJsonEditorModuleError]);
  
          useEffect(() => {
            if (resourceMode !== "servers" || !selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID || serverPreviewEditorModule || serverPreviewEditorModuleError) {
              return;
            }
  
            let cancelled = false;
  
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled || !module) {
                  return;
                }
                setServerPreviewEditorModule(module);
                setServerPreviewEditorModuleError("");
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
                setServerPreviewEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });
  
            return () => {
              cancelled = true;
            };
          }, [resourceMode, selectedServerId, serverPreviewEditorModule, serverPreviewEditorModuleError]);
  
          useEffect(() => {
            if (
              !draftDatabase?.id
              || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID
              || isSelectedDatabaseTemplatePreview
              || isPlaygroundResourceTemplatePreviewRecord(draftDatabase)
              || !selectedDatabaseCollectionId
              || !databaseDocumentEditorState.documentId
              || databaseDocumentViewMode === "json"
              || databaseDocumentEditorState.isSaving
              || databaseDocumentEditorState.value === databaseDocumentEditorState.initialValue
            ) {
              if (databaseDocumentAutosaveTimerRef.current) {
                window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
                databaseDocumentAutosaveTimerRef.current = null;
              }
              return;
            }
  
            const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            if (!parsedDocument) {
              if (databaseDocumentAutosaveTimerRef.current) {
                window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
                databaseDocumentAutosaveTimerRef.current = null;
              }
              return;
            }
  
            if (databaseDocumentAutosaveTimerRef.current) {
              window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
            }
  
            databaseDocumentAutosaveTimerRef.current = window.setTimeout(() => {
              databaseDocumentAutosaveTimerRef.current = null;
              void handleSaveDatabaseDocument();
            }, 700);
  
            return () => {
              if (databaseDocumentAutosaveTimerRef.current) {
                window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
                databaseDocumentAutosaveTimerRef.current = null;
              }
            };
          }, [
            draftDatabase?.id,
            selectedDatabaseCollectionId,
            databaseDocumentViewMode,
            databaseDocumentEditorState.documentId,
            databaseDocumentEditorState.value,
            databaseDocumentEditorState.initialValue,
            databaseDocumentEditorState.isSaving,
            isSelectedDatabaseTemplatePreview,
          ]);
  
          useLayoutEffect(() => {
            resizeEnvironmentDescriptionTextarea(environmentDockerfileTextareaRef.current);
          }, [draftEnvironment?.dockerfileExtensions, draftEnvironment?.id]);
  
          useLayoutEffect(() => {
            if (!serverComposerOpen) {
              return;
            }
            resizeEnvironmentDescriptionTextarea(serverComposerDescriptionTextareaRef.current);
          }, [serverComposerDraft?.description, serverComposerOpen]);
  
          useLayoutEffect(() => {
            resizeEnvironmentDescriptionTextarea(databaseDescriptionTextareaRef.current);
          }, [draftDatabase?.description, draftDatabase?.id]);
  
          useEffect(() => {
            const detailMain = environmentDetailMainRef.current;
            if (!detailMain) return undefined;
  
            let frameId = 0;
            const timeoutIds = [];
            const scheduleResize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                resizeEnvironmentDescriptionTextarea(environmentDockerfileTextareaRef.current);
              });
            };
  
            scheduleResize();
            [120, 240, 360].forEach((delay) => {
              timeoutIds.push(window.setTimeout(scheduleResize, delay));
            });
  
            if (typeof ResizeObserver === "undefined") {
              window.addEventListener("resize", scheduleResize);
              return () => {
                if (frameId) {
                  window.cancelAnimationFrame(frameId);
                }
                timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
                window.removeEventListener("resize", scheduleResize);
              };
            }
  
            const observer = new ResizeObserver(() => {
              scheduleResize();
            });
            observer.observe(detailMain);
  
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              observer.disconnect();
            };
          }, [draftEnvironment?.id]);
  
          useEffect(() => {
            const textarea = serverDescriptionTextareaRef.current;
            const detailMain = serverDetailMainRef.current;
            if (!textarea || !detailMain) return undefined;
  
            let frameId = 0;
            const timeoutIds = [];
            const scheduleResize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                resizeEnvironmentDescriptionTextarea(serverDescriptionTextareaRef.current);
              });
            };
  
            scheduleResize();
            [120, 240, 360].forEach((delay) => {
              timeoutIds.push(window.setTimeout(scheduleResize, delay));
            });
  
            if (typeof ResizeObserver === "undefined") {
              window.addEventListener("resize", scheduleResize);
              return () => {
                if (frameId) {
                  window.cancelAnimationFrame(frameId);
                }
                timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
                window.removeEventListener("resize", scheduleResize);
              };
            }
  
            const observer = new ResizeObserver(() => {
              scheduleResize();
            });
            observer.observe(detailMain);
  
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              observer.disconnect();
            };
          }, [draftServer?.id]);
  
          useEffect(() => {
            const textarea = databaseDescriptionTextareaRef.current;
            const detailMain = serverDetailMainRef.current;
            if (!textarea || !detailMain) return undefined;
  
            let frameId = 0;
            const timeoutIds = [];
            const scheduleResize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                resizeEnvironmentDescriptionTextarea(databaseDescriptionTextareaRef.current);
              });
            };
  
            scheduleResize();
            [120, 240, 360].forEach((delay) => {
              timeoutIds.push(window.setTimeout(scheduleResize, delay));
            });
  
            if (typeof ResizeObserver === "undefined") {
              window.addEventListener("resize", scheduleResize);
              return () => {
                if (frameId) {
                  window.cancelAnimationFrame(frameId);
                }
                timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
                window.removeEventListener("resize", scheduleResize);
              };
            }
  
            const observer = new ResizeObserver(() => {
              scheduleResize();
            });
            observer.observe(detailMain);
  
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              observer.disconnect();
            };
          }, [draftDatabase?.id]);
  
          useEffect(() => {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || !serverEditorDirtyRef.current) {
              return;
            }
            if (isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer)) {
              serverEditorDirtyRef.current = false;
              serverAutosaveQueuedRef.current = null;
              return;
            }
  
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
            }
  
            serverAutosaveTimerRef.current = window.setTimeout(() => {
              serverAutosaveTimerRef.current = null;
              serverAutosaveQueuedRef.current = normalizePlaygroundServerRecord(draftServer);
              void flushQueuedServerAutosave();
            }, 700);
  
            return () => {
              if (serverAutosaveTimerRef.current) {
                window.clearTimeout(serverAutosaveTimerRef.current);
                serverAutosaveTimerRef.current = null;
              }
            };
          }, [draftServer]);
  
          useEffect(() => {
            if (!draftEnvironment || !editorDirtyRef.current) {
              return;
            }
  
            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
            }
  
            environmentAutosaveTimerRef.current = window.setTimeout(() => {
              environmentAutosaveTimerRef.current = null;
              environmentAutosaveQueuedRef.current = normalizePlaygroundEnvironmentRecord(draftEnvironment);
              void flushQueuedEnvironmentAutosave();
            }, 700);
  
            return () => {
              if (environmentAutosaveTimerRef.current) {
                window.clearTimeout(environmentAutosaveTimerRef.current);
                environmentAutosaveTimerRef.current = null;
              }
            };
          }, [draftEnvironment]);
  
          useEffect(() => {
            if (
              !draftEnvironment?.id
              || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID
              || draftEnvironment.isSystem
              || draftEnvironment.isDefault
              || loadingEnvironmentId === draftEnvironment.id
              || saveState.isSaving
              || environmentVersionState.status === "loading"
            ) {
              return;
            }
            if (readPlaygroundEnvironmentVersions(draftEnvironment).length > 0) {
              return;
            }
            const seedKey = String(draftEnvironment.id || "").trim();
            if (!seedKey || environmentInitialVersionSeededRef.current.has(seedKey)) {
              return;
            }
            environmentInitialVersionSeededRef.current.add(seedKey);
            const actor = getEnvironmentVersionActor();
            const initialVersion = createPlaygroundEnvironmentVersion(draftEnvironment, [], { status: "active", actor });
            const nextEnvironment = createPlaygroundEnvironmentWithVersionList(draftEnvironment, [initialVersion], initialVersion.id);
            setDraftEnvironment(nextEnvironment);
            setEnvironmentDetailsById((current) => ({
              ...current,
              [nextEnvironment.id]: nextEnvironment,
            }));
            void commitVersionedEnvironmentRecord(nextEnvironment, {
              operation: "initialize",
              actor,
              loadingMessage: "Initializing computer version...",
              successMessage: "Version initialized",
              errorMessage: "Failed to initialize computer version.",
            });
          }, [
            draftEnvironment,
            environmentVersionState.status,
            loadingEnvironmentId,
            saveState.isSaving,
          ]);
  
          useEffect(() => {
            if (
              resourceMode === "servers"
              || !draftEnvironment?.id
              || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID
              || draftEnvironment.isSystem
            ) {
              return undefined;
            }
  
            function handleEnvironmentVersionKeyboardShortcut(event) {
              const isCommandShortcut = Boolean(event.metaKey || event.ctrlKey);
              if (!isCommandShortcut || event.altKey) {
                return;
              }
              const key = String(event.key || "").toLowerCase();
              if (key !== "s" && key !== "p") {
                return;
              }
  
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation?.();
              if (saveState.isSaving || environmentVersionState.status === "loading" || environmentVersionModal) {
                return;
              }
  
              if (key === "s" && event.shiftKey) {
                openCreateEnvironmentVersionModal();
                return;
              }
  
              if (key === "s") {
                if (hasDraftEnvironmentVersionChanges()) {
                  void saveAndPublishCurrentEnvironmentVersion();
                }
                return;
              }
  
              if (key === "p" && !event.shiftKey && hasDraftEnvironmentVersionChanges()) {
                void saveAndPublishCurrentEnvironmentVersion();
              }
            }
  
            window.addEventListener("keydown", handleEnvironmentVersionKeyboardShortcut, true);
            return () => window.removeEventListener("keydown", handleEnvironmentVersionKeyboardShortcut, true);
          }, [
            draftEnvironment,
            environmentVersionModal,
            environmentVersionState.status,
            resourceMode,
            saveState.isSaving,
          ]);
  
          useEffect(() => {
            const normalizedKind = canonicalizePlaygroundServerKind(draftServer?.kind);
            const isDeployableServer = normalizedKind === "web_app" || normalizedKind === "function";
            if (
              resourceMode !== "servers"
              || !draftServer?.id
              || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
              || !isDeployableServer
              || isSelectedServerTemplatePreview
              || isPlaygroundResourceTemplatePreviewRecord(draftServer)
              || loadingServerId === draftServer.id
              || serverSaveState.isSaving
              || serverVersionState.status === "loading"
            ) {
              return;
            }
            if (readPlaygroundServerVersions(draftServer).length > 0) {
              rememberServerVersionBaseline(draftServer, { force: true });
              return;
            }
            const seedKey = String(draftServer.id || "").trim();
            if (!seedKey || serverInitialVersionSeededRef.current.has(seedKey)) {
              return;
            }
            serverInitialVersionSeededRef.current.add(seedKey);
            const actor = getServerVersionActor();
            const initialVersion = createPlaygroundServerVersion(draftServer, [], {
              status: "active",
              actor,
              snapshot: buildDraftServerVersionSnapshot(draftServer),
            });
            const nextServer = createPlaygroundServerWithVersionList(draftServer, [initialVersion], initialVersion.id);
            setDraftServer(nextServer);
            upsertLocalServerRecord(nextServer);
            void commitVersionedServerRecord(nextServer, {
              operation: "initialize",
              actor,
              loadingMessage: "Initializing server version...",
              successMessage: "Version initialized",
              errorMessage: "Failed to initialize server version.",
            });
          }, [
            currentServerFiles,
            draftServer,
            isSelectedServerTemplatePreview,
            loadingServerId,
            resourceMode,
            serverFileEditorState.path,
            serverFileEditorState.status,
            serverFileEditorState.value,
            serverSaveState.isSaving,
            serverVersionState.status,
          ]);
  
          useEffect(() => {
            const normalizedKind = canonicalizePlaygroundServerKind(draftServer?.kind);
            const isDeployableServer = normalizedKind === "web_app" || normalizedKind === "function";
            if (
              resourceMode !== "servers"
              || !isDeployableServer
              || !draftServer?.id
              || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
            ) {
              return undefined;
            }
  
            function handleServerVersionKeyboardShortcut(event) {
              const isCommandShortcut = Boolean(event.metaKey || event.ctrlKey);
              if (!isCommandShortcut || event.altKey) {
                return;
              }
              const key = String(event.key || "").toLowerCase();
              if (key !== "s" && key !== "p") {
                return;
              }
  
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation?.();
              if (serverSaveState.isSaving || serverVersionState.status === "loading" || serverVersionModal) {
                return;
              }
  
              if (key === "s" && event.shiftKey) {
                openCreateServerVersionModal();
                return;
              }
  
              if (key === "s") {
                if (getServerVersionPrimaryActionKind() === "save" && hasDraftServerVersionChanges()) {
                  void saveCurrentServerVersion();
                }
                return;
              }
  
              if (key === "p" && !event.shiftKey && canPublishDraftServerSelectedVersion()) {
                void publishCurrentServerVersion();
              }
            }
  
            window.addEventListener("keydown", handleServerVersionKeyboardShortcut, true);
            return () => window.removeEventListener("keydown", handleServerVersionKeyboardShortcut, true);
          }, [
            draftServer,
            resourceMode,
            serverSaveState.isSaving,
            serverVersionModal,
            serverVersionState.status,
          ]);
  
