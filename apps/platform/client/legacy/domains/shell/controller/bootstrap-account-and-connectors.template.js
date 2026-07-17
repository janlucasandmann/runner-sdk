        function LegacyPlatformApp() {
          const isDemoMode = useMemo(() => {
            try {
              const pathname = String(window.location.pathname || "/").trim();
              return pathname === "/demo" || pathname.startsWith("/demo/");
            } catch {
              return false;
            }
          }, []);
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.layoutState}
          const [activePage, setActivePageState] = useState("thread");
          const activePageRef = useRef(activePage);
          activePageRef.current = activePage;
  ${PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.state}${PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.refs}
  ${METRONOME_APP_SCRIPT_FRAGMENTS.state}
          const [environmentsOpenToken, setEnvironmentsOpenToken] = useState(0);
          const [environmentsNavigationTargetId, setEnvironmentsNavigationTargetId] = useState("");
          const [resourcesNavigationTarget, setResourcesNavigationTarget] = useState({
            token: 0,
            resourceType: "",
            resourceId: "",
          });
  ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.previewResources}${APP_HEADER_APP_SCRIPT_FRAGMENTS.state}        const [showPlaygroundOnboarding, setShowPlaygroundOnboarding] = useState(() => readCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM) === "true");
          const [showSubscriptionSuccessModal, setShowSubscriptionSuccessModal] = useState(() => readCurrentSearchParam(PLAYGROUND_SUBSCRIPTION_SUCCESS_QUERY_PARAM) === "true");
          const [profileEditorOpen, setProfileEditorOpen] = useState(false);
          const [threadListMode, setThreadListMode] = useState("threads");
          const [threadsSectionCollapsed, setThreadsSectionCollapsed] = useState(false);
          const [runnerRenderKey, setRunnerRenderKey] = useState(0);
          const [initialLandingPrompt, setInitialLandingPrompt] = useState(() => (
            normalizePlaygroundInitialPrompt(readCurrentSearchParam(PLAYGROUND_INITIAL_PROMPT_QUERY_PARAM))
          ));
          const [threadDisplayCount, setThreadDisplayCount] = useState(10);
          const threadDisplayCountRef = useRef(10);
          const threadFetchLimitRef = useRef(SEARCH_THREAD_FETCH_LIMIT);
          const threadRefreshInFlightRef = useRef(null);
          threadDisplayCountRef.current = threadDisplayCount;
          const [threadActionMenuState, setThreadActionMenuState] = useState(null);
  ${METRONOME_APP_SCRIPT_FRAGMENTS.menuState}
          const [threadRenameState, setThreadRenameState] = useState(null);
          const [threadRenameValue, setThreadRenameValue] = useState("");
          const [threadRenameError, setThreadRenameError] = useState("");
          const [threadProjectPickerState, setThreadProjectPickerState] = useState(null);
          const [threadProjectPickerValue, setThreadProjectPickerValue] = useState("");
          const [threadProjectPickerProjects, setThreadProjectPickerProjects] = useState([]);
          const [threadProjectPickerLoading, setThreadProjectPickerLoading] = useState(false);
          const [threadProjectPickerError, setThreadProjectPickerError] = useState("");
          const [threadMutationState, setThreadMutationState] = useState({
            threadId: "",
            action: "",
          });
          const [threadMutationSignal, setThreadMutationSignal] = useState(null);
  
          function emitThreadMutationSignal(action, threadId, threadRecord = null) {
            const normalizedThreadId = String(threadId || threadRecord?.id || threadRecord?.threadId || "").trim();
            if (!normalizedThreadId) {
              return;
            }
            setThreadMutationSignal({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              action: String(action || "").trim(),
              threadId: normalizedThreadId,
              threadRecord: threadRecord && typeof threadRecord === "object" && !Array.isArray(threadRecord)
                ? threadRecord
                : null,
            });
          }
          const [upstreamUrl, setUpstreamUrl] = useState(() => {
            try {
              return localStorage.getItem("runner_demo_upstream")
                || sessionStorage.getItem("runner_demo_upstream")
                || ${JSON.stringify(defaultUpstreamOrigin)};
            } catch {
              return ${JSON.stringify(defaultUpstreamOrigin)};
            }
          });
          const [apiKey, setApiKey] = useState(() => (isDemoMode ? "" : (localStorage.getItem("runner_demo_api_key") || "")));
          const [sessionStreamingConfig, setSessionStreamingConfig] = useState({
            status: "idle",
            apiKey: "",
            backendUrl: "",
            error: "",
          });
          const [projectId, setProjectId] = useState(() => {
            try {
              return localStorage.getItem("runner_demo_project_id") || "";
            } catch {
              return "";
            }
          });
          const [sessionState, setSessionState] = useState({
            status: isDemoMode ? "unauthenticated" : "loading",
            userId: "",
            email: isDemoMode ? "demo@computer-agents.com" : "",
            projectId: "",
            displayName: isDemoMode ? "ACP Demo Workspace" : "",
            photoURL: "",
            emailVerified: false,
            subscriptionTier: isDemoMode ? "enterprise" : "",
            subscriptionStatus: isDemoMode ? "active" : "",
            onboardingCompleted: null,
            error: "",
          });
          const [platformAuthForm, setPlatformAuthForm] = useState({
            email: "",
            password: "",
          });
          const [platformAuthBusy, setPlatformAuthBusy] = useState("");
          const [platformAuthError, setPlatformAuthError] = useState("");
          const [profileDraft, setProfileDraft] = useState({
            displayName: "",
            email: "",
            photoURL: "",
          });
          const [profileEditorAvatarBroken, setProfileEditorAvatarBroken] = useState(false);
          const [profileSaveState, setProfileSaveState] = useState({
            status: "idle",
            error: "",
          });
          const [settingsMarketingConsentStatus, setSettingsMarketingConsentStatus] = useState(null);
          const [settingsMarketingConsentLoading, setSettingsMarketingConsentLoading] = useState(false);
          const [settingsMarketingConsentSaving, setSettingsMarketingConsentSaving] = useState(false);
          const [settingsMarketingConsentError, setSettingsMarketingConsentError] = useState("");
          const [settingsMarketingConsentSuccess, setSettingsMarketingConsentSuccess] = useState("");
          const [settingsVerificationResending, setSettingsVerificationResending] = useState(false);
          const [settingsVerificationResent, setSettingsVerificationResent] = useState(false);
          const [settingsVerificationError, setSettingsVerificationError] = useState("");
          const [environmentId, setEnvironmentId] = useState("");
          const [preferredAgentId, setPreferredAgentId] = useState(() => {
            try {
              return localStorage.getItem("runner_demo_preferred_agent_id") || "";
            } catch {
              return "";
            }
          });
          const [agentPageSelectionRequest, setAgentPageSelectionRequest] = useState(null);
          const [agentCreationPageRequestToken, setAgentCreationPageRequestToken] = useState(0);
          const [agentCreationPageModelId, setAgentCreationPageModelId] = useState("");
          const [threadAgentSelectionOverride, setThreadAgentSelectionOverride] = useState(null);
          const [currentThreadId, setCurrentThreadId] = useState(() => (isDemoMode ? DEFAULT_DEMO_THREAD_ID : readInitialThreadDeepLinkId()));
          const [initialThreadPrivateMode, setInitialThreadPrivateMode] = useState(false);
          const [privateThreadIds, setPrivateThreadIds] = useState([]);
          const privateThreadIdsRef = useRef(new Set());
          const [pendingThreadRunRequest, setPendingThreadRunRequest] = useState(null);
          const [pendingThreadDocumentPreviewRequest, setPendingThreadDocumentPreviewRequest] = useState(null);
          const [threadTaskPreviewOverrides, setThreadTaskPreviewOverrides] = useState({});
          const [threadProjectRecordsById, setThreadProjectRecordsById] = useState({});
          const [threadProjectContextById, setThreadProjectContextById] = useState({});
          const [taskOpenRequest, setTaskOpenRequest] = useState(null);
          const [latestInteractedProjectId, setLatestInteractedProjectId] = useState(() => {
            try {
              return localStorage.getItem("runner_demo_tasks_last_project_id")
                || localStorage.getItem("runner_demo_tasks_project_scope_id")
                || "";
            } catch {
              return "";
            }
          });
          const [tasksPageNavigationRequest, setTasksPageNavigationRequest] = useState(null);
          const [filesPageNavigationRequest, setFilesPageNavigationRequest] = useState(null);
          const [filesPageTopNav, setFilesPageTopNav] = useState(null);
          const [threadSearchFileInventoryByEnvironmentId, setThreadSearchFileInventoryByEnvironmentId] = useState({});
          const [threadSearchFileInventoryLoadingByEnvironmentId, setThreadSearchFileInventoryLoadingByEnvironmentId] = useState({});
          const threadSearchFileInventoryByEnvironmentIdRef = useRef({});
          const threadSearchFileInventoryLoadingIdsRef = useRef(new Set());
  ${IMAGINE_APP_SCRIPT_FRAGMENTS.state}
          const [welcomeWidgetsState, setWelcomeWidgetsState] = useState(() => (
            isDemoMode
              ? buildDemoWelcomeWidgetsState()
              : {
                  status: "idle",
                  error: "",
                  projectId: "",
                  project: null,
                  tasks: [],
                  schedules: [],
                }
          ));
          const [welcomeWidgetBusyTaskIds, setWelcomeWidgetBusyTaskIds] = useState([]);
          const [welcomeProjectPickerOpen, setWelcomeProjectPickerOpen] = useState(false);
          const [welcomeProjectPickerProjects, setWelcomeProjectPickerProjects] = useState([]);
          const [welcomeProjectPickerValue, setWelcomeProjectPickerValue] = useState("");
          const [welcomeProjectPickerLoading, setWelcomeProjectPickerLoading] = useState(false);
          const [welcomeProjectPickerError, setWelcomeProjectPickerError] = useState("");
          const [selectedWelcomeComposerTaskId, setSelectedWelcomeComposerTaskId] = useState("");
          const [threadPreviewAttachment, setThreadPreviewAttachment] = useState(null);
          const [threadTaskOpenRequest, setThreadTaskOpenRequest] = useState(null);
          const [threadSubagentDetailOpen, setThreadSubagentDetailOpen] = useState(false);
          const [threadDeepResearchDetailOpen, setThreadDeepResearchDetailOpen] = useState(false);
          const [threadDocumentPreviewOpen, setThreadDocumentPreviewOpen] = useState(false);
          const [threadSubagentDetailHost, setThreadSubagentDetailHost] = useState(null);
          const handleThreadProjectRecordCommitted = useCallback((projectRecord) => {
            if (!projectRecord?.id) {
              return;
            }
            const normalizedProjectRecord = normalizePlaygroundProjectRecord(projectRecord);
            setThreadProjectRecordsById((current) => ({
              ...current,
              [normalizedProjectRecord.id]: mergePlaygroundProjectRecords(projectRecord, current[normalizedProjectRecord.id]) || normalizedProjectRecord,
            }));
            setRealProjects((current) => {
              const existingIndex = current.findIndex((project) => project.id === normalizedProjectRecord.id);
              if (existingIndex === -1) {
                return sortPlaygroundProjectsByRecent([normalizedProjectRecord, ...current]);
              }
              return sortPlaygroundProjectsByRecent(current.map((project) => (
                project.id === normalizedProjectRecord.id
                  ? mergePlaygroundProjectRecords(projectRecord, project) || normalizedProjectRecord
                  : project
              )));
            });
            setWelcomeWidgetsState((current) => {
              const currentProjectId = String(current?.projectId || current?.project?.id || "").trim();
              if (currentProjectId !== normalizedProjectRecord.id) {
                return current;
              }
              const nextProject = mergePlaygroundProjectRecords(projectRecord, current?.project) || normalizedProjectRecord;
              return {
                ...current,
                projectId: normalizedProjectRecord.id,
                project: nextProject,
              };
            });
            setWelcomeProjectPickerProjects((current) => {
              if (!Array.isArray(current) || !current.some((project) => project?.id === normalizedProjectRecord.id)) {
                return current;
              }
              return sortPlaygroundProjectsByRecent(current.map((project) => (
                project.id === normalizedProjectRecord.id
                  ? mergePlaygroundProjectRecords(projectRecord, project) || normalizedProjectRecord
                  : project
              )));
            });
            setThreadProjectPickerProjects((current) => {
              if (!Array.isArray(current) || !current.some((project) => project?.id === normalizedProjectRecord.id)) {
                return current;
              }
              return sortPlaygroundProjectsByRecent(current.map((project) => (
                project.id === normalizedProjectRecord.id
                  ? mergePlaygroundProjectRecords(projectRecord, project) || normalizedProjectRecord
                  : project
              )));
            });
          }, []);
  ${SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state}
          const [contentMode, setContentMode] = useState("chat");
          const [changesNavigationTarget, setChangesNavigationTarget] = useState(null);
          const computerAgentsMode = true;
          const [realThreads, setRealThreads] = useState([]);
          const realThreadsRef = useRef([]);
          const [realProjects, setRealProjects] = useState([]);
          const [isThreadsLoading, setIsThreadsLoading] = useState(false);
          const [realThreadsHasMore, setRealThreadsHasMore] = useState(false);
          const [realAgents, setRealAgents] = useState([]);
          const [realEnvironments, setRealEnvironments] = useState([]);
          const realEnvironmentsRef = useRef([]);
          const [realServers, setRealServers] = useState([]);
          const [githubStatus, setGithubStatus] = useState(() => readCachedIntegrationStatus("github"));
          const [githubDisconnectToken, setGithubDisconnectToken] = useState("");
          const [notionStatus, setNotionStatus] = useState(() => readCachedIntegrationStatus("notion"));
          const [googleDriveStatus, setGoogleDriveStatus] = useState(() => readCachedIntegrationStatus("google-drive"));
          const [oneDriveStatus, setOneDriveStatus] = useState(() => readCachedIntegrationStatus("one-drive"));
          const [gmailStatus, setGmailStatus] = useState(() => readCachedIntegrationStatus("gmail"));
          const [notionDatabases, setNotionDatabases] = useState([]);
          const [settingsEmailStatus, setSettingsEmailStatus] = useState(null);
          const [settingsEmailLoading, setSettingsEmailLoading] = useState(false);
          const [settingsEmailError, setSettingsEmailError] = useState("");
          const [settingsEmailSuccess, setSettingsEmailSuccess] = useState("");
          const [settingsEmailInput, setSettingsEmailInput] = useState("");
          const [settingsEmailVerificationCodeInput, setSettingsEmailVerificationCodeInput] = useState("");
          const [settingsIsLinkingEmail, setSettingsIsLinkingEmail] = useState(false);
          const [settingsIsVerifyingEmail, setSettingsIsVerifyingEmail] = useState(false);
          const [settingsIsUnlinkingEmail, setSettingsIsUnlinkingEmail] = useState(false);
          const [settingsShowEmailVerificationInput, setSettingsShowEmailVerificationInput] = useState(false);
          useEffect(() => {
            realThreadsRef.current = realThreads;
          }, [realThreads]);
          useEffect(() => {
            realEnvironmentsRef.current = realEnvironments;
          }, [realEnvironments]);
          useEffect(() => {
            threadSearchFileInventoryByEnvironmentIdRef.current = threadSearchFileInventoryByEnvironmentId;
          }, [threadSearchFileInventoryByEnvironmentId]);
          const [settingsDiscordStatus, setSettingsDiscordStatus] = useState(null);
          const [settingsDiscordLoading, setSettingsDiscordLoading] = useState(false);
          const [settingsDiscordError, setSettingsDiscordError] = useState("");
          const [settingsDiscordSuccess, setSettingsDiscordSuccess] = useState("");
          const [settingsIsLinkingDiscord, setSettingsIsLinkingDiscord] = useState(false);
          const [settingsIsUnlinkingDiscord, setSettingsIsUnlinkingDiscord] = useState(false);
          const [settingsTelegramStatus, setSettingsTelegramStatus] = useState(null);
          const [settingsTelegramLoading, setSettingsTelegramLoading] = useState(false);
          const [settingsTelegramError, setSettingsTelegramError] = useState("");
          const [settingsTelegramSuccess, setSettingsTelegramSuccess] = useState("");
          const [settingsTelegramVerificationCode, setSettingsTelegramVerificationCode] = useState("");
          const [settingsIsVerifyingTelegram, setSettingsIsVerifyingTelegram] = useState(false);
          const [settingsIsUnlinkingTelegram, setSettingsIsUnlinkingTelegram] = useState(false);
          const [statusIndicatorItems, setStatusIndicatorItems] = useState([]);
          const [dismissedStatusIndicatorIds, setDismissedStatusIndicatorIds] = useState([]);
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationsState}        const [taskRunStates, setTaskRunStates] = useState({});
          const [threadFollowUpActionState, setThreadFollowUpActionState] = useState({
            action: "",
            error: "",
          });
          const [threadFollowUpNextTaskState, setThreadFollowUpNextTaskState] = useState({
            key: "",
            status: "idle",
            projectId: "",
            task: null,
            projectTasks: [],
            currentTask: null,
            currentTaskStatus: "",
            project: null,
            ticketNumbersById: {},
            error: "",
          });
          const [settingsBudgetStatus, setSettingsBudgetStatus] = useState(null);
          const [settingsBudgetLoading, setSettingsBudgetLoading] = useState(false);
          const [settingsBillingCatalogRevision, setSettingsBillingCatalogRevision] = useState(0);
          const [settingsUsageSummary, setSettingsUsageSummary] = useState(createEmptySettingsUsageSummary);
          const [settingsUsageBreakdown, setSettingsUsageBreakdown] = useState([]);
          const [settingsUsageResourceItems, setSettingsUsageResourceItems] = useState([]);
          const [settingsUsageAgentItems, setSettingsUsageAgentItems] = useState([]);
          const [settingsUsageEnvironmentItems, setSettingsUsageEnvironmentItems] = useState([]);
          const [settingsUsageChartTab, setSettingsUsageChartTab] = useState("overall");
          const [settingsUsageLoading, setSettingsUsageLoading] = useState(false);
          const [settingsBillingPeriodOffset, setSettingsBillingPeriodOffset] = useState(0);
          const [settingsInvoices, setSettingsInvoices] = useState([]);
          const [settingsSubscriptions, setSettingsSubscriptions] = useState([]);
          const [settingsInvoicesLoading, setSettingsInvoicesLoading] = useState(false);
          const [settingsBillingError, setSettingsBillingError] = useState("");
          const [settingsBillingSuccess, setSettingsBillingSuccess] = useState("");
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.billingState}        const settingsBillingScopeIdRef = useRef("");
          const [settingsPlatformConfigError, setSettingsPlatformConfigError] = useState("");
          const [settingsPlatformConfigSuccess, setSettingsPlatformConfigSuccess] = useState("");
          const [settingsPlatformConfigSaving, setSettingsPlatformConfigSaving] = useState(false);
          const [settingsPlatformConfigTesting, setSettingsPlatformConfigTesting] = useState(false);
          const [settingsBillingPreferences, setSettingsBillingPreferences] = useState(() => readDemoSettingsPlatformConfig().billing);
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.state}        const [connectionsOverviewChartTimescale, setConnectionsOverviewChartTimescale] = useState("month");
          const [toolsView, setToolsView] = useState("plugins");
          const [tagDetailConfigsById, setTagDetailConfigsById] = useState({});
          const [tagDetailLoadingId, setTagDetailLoadingId] = useState("");
          const [tagDetailSaveStateById, setTagDetailSaveStateById] = useState({});
          const [tagDetailPerformanceRange, setTagDetailPerformanceRange] = useState("1m");
          const [tagDetailPropertyPopover, setTagDetailPropertyPopover] = useState("");
          const [tagDefaultEnvironmentMode, setTagDefaultEnvironmentMode] = useState("computers");
          const [tagDetailSidebarCollapsed, setTagDetailSidebarCollapsed] = useState(false);
          const [tagInstructionsEditingId, setTagInstructionsEditingId] = useState("");
          const [tagInstructionsHistoryById, setTagInstructionsHistoryById] = useState({});
          const tagDetailPropertyPopoverRef = useRef(null);
          const tagInstructionsTextareaRef = useRef(null);
          const tagDetailAutosaveTimersRef = useRef({});
          const [toolsSkillsOpenRequest, setToolsSkillsOpenRequest] = useState(null);
          const [resourcesView, setResourcesViewState] = useState("agents");
          const resourcesViewRef = useRef(resourcesView);
          resourcesViewRef.current = resourcesView;
          const [resourcesServerKind, setResourcesServerKind] = useState("");
  ${MODELS_APP_SCRIPT_FRAGMENTS.state}${MARKETPLACE_APP_SCRIPT_FRAGMENTS.state}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.state}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.state}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.state}        const [projectOverviewResourceFilter, setProjectOverviewResourceFilter] = useState("all");
          const [projectOverviewResourceSearchQuery, setProjectOverviewResourceSearchQuery] = useState("");
          const [projectOverviewResourceViewMode, setProjectOverviewResourceViewMode] = useState("list");
          const [projectOverviewResourceToolbarPopover, setProjectOverviewResourceToolbarPopover] = useState("");
          const [projectOverviewResourceMenuId, setProjectOverviewResourceMenuId] = useState("");
  ${MODELS_APP_SCRIPT_FRAGMENTS.resolvedCatalog}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.runtimeBeforeEvaluations}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.lifecycle}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.runtimeBetweenEvaluationsAndFineTuning}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.lifecycle}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.runtimeAfterFineTuning}${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.state}${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state}${API_KEYS_APP_SCRIPT_FRAGMENTS.uiState}${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.metricsState}${TEAMS_APP_SCRIPT_FRAGMENTS.statePrimary}${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.statePrimary}${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs}${TEAMS_APP_SCRIPT_FRAGMENTS.stateDialogs}${TEAMS_APP_SCRIPT_FRAGMENTS.roleLifecycle}${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.roleLifecycle}${TEAMS_APP_SCRIPT_FRAGMENTS.tableLifecycle}${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.tableLifecycle}${TEAMS_APP_SCRIPT_FRAGMENTS.dialogLifecycle}${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.modeState}
          const [selectedPluginId, setSelectedPluginId] = useState("");
          const [toolsSkillsHeaderState, setToolsSkillsHeaderState] = useState({
            mode: "overview",
            title: "",
          });
          const [toolsSkillsBackRequestToken, setToolsSkillsBackRequestToken] = useState(0);
          const [resourcesHeaderState, setResourcesHeaderState] = useState({
            mode: "overview",
            title: "",
          });
          const [isAgentVersionsDetailOpen, setIsAgentVersionsDetailOpen] = useState(false);
          const [resourcesBackRequestToken, setResourcesBackRequestToken] = useState(0);
  ${CALENDAR_SHELL_SCRIPT_FRAGMENTS.state}
          const [tasksHeaderState, setTasksHeaderState] = useState({
            mode: "overview",
            title: "Projects",
            view: "overview",
          });
          const [tasksProjectBackRequestToken, setTasksProjectBackRequestToken] = useState(0);
          const [tasksProjectViewRequest, setTasksProjectViewRequest] = useState(null);
          const [tasksProjectSettingsRequestToken, setTasksProjectSettingsRequestToken] = useState(0);
          const [tasksProjectIssueRequest, setTasksProjectIssueRequest] = useState(null);
          const [topNavIssueComposerOpen, setTopNavIssueComposerOpen] = useState(false);
          const [topNavIssueComposerVisible, setTopNavIssueComposerVisible] = useState(false);
          const [topNavIssueComposerClosing, setTopNavIssueComposerClosing] = useState(false);
          const topNavIssueComposerCloseTimerRef = useRef(null);
          const topNavIssueComposerFrameRef = useRef(null);
          const topNavIssueComposerAnimationMs = 75;
          const topNavIssueDescriptionTextareaRef = useRef(null);
          const [isTopNavIssueDescriptionEditing, setIsTopNavIssueDescriptionEditing] = useState(false);
          const [topNavIssueEnvironmentPopoverOpen, setTopNavIssueEnvironmentPopoverOpen] = useState(false);
          const topNavIssueEnvironmentPopoverRef = useRef(null);
          const [topNavIssueDetailSelectPopover, setTopNavIssueDetailSelectPopover] = useState("");
          const topNavIssueDetailSelectPopoverRef = useRef(null);
          const [topNavIssueDetailsCollapsed, setTopNavIssueDetailsCollapsed] = useState(false);
          const [topNavIssueDraft, setTopNavIssueDraft] = useState(buildPlaygroundDefaultTaskDraft());
          const [topNavIssueSaveState, setTopNavIssueSaveState] = useState({
            isSaving: false,
            error: "",
          });
          const tasksProjectIssueCreateHandlerRef = useRef(null);
          const handleProjectIssueCreateHandlerChange = useCallback((handler) => {
            tasksProjectIssueCreateHandlerRef.current = typeof handler === "function" ? handler : null;
          }, []);
          const [pluginDetailTab, setPluginDetailTab] = useState("general");
          const [pluginDetailCapabilityIndex, setPluginDetailCapabilityIndex] = useState(0);
          const [pluginDetailCapabilityOutgoingIndex, setPluginDetailCapabilityOutgoingIndex] = useState(null);
          const [pluginDetailCapabilityDirection, setPluginDetailCapabilityDirection] = useState(0);
          const [pluginDetailCapabilityTransitionKey, setPluginDetailCapabilityTransitionKey] = useState(0);
          const [pendingThreadComposerPlusOpen, setPendingThreadComposerPlusOpen] = useState(false);
          const [pluginsNavPopover, setPluginsNavPopover] = useState("");
          const [settingsCheckoutLoading, setSettingsCheckoutLoading] = useState(false);
          const [composerAgentUpgradeModalOpen, setComposerAgentUpgradeModalOpen] = useState(false);
          const [composerAgentUpgradeCheckoutLoading, setComposerAgentUpgradeCheckoutLoading] = useState(false);
          const [settingsSubscriptionActionId, setSettingsSubscriptionActionId] = useState("");
          const [settingsTopUpActionId, setSettingsTopUpActionId] = useState("");
          const [settingsSelectedTopUpId, setSettingsSelectedTopUpId] = useState("growth");
          const [settingsPlansMenuOpen, setSettingsPlansMenuOpen] = useState(false);
          const [settingsChangePlanModalOpen, setSettingsChangePlanModalOpen] = useState(false);
          const [settingsTopUpModalOpen, setSettingsTopUpModalOpen] = useState(false);
          const [settingsResourceCapInfoOpen, setSettingsResourceCapInfoOpen] = useState(false);
  ${API_KEYS_APP_SCRIPT_FRAGMENTS.dataState}        const [settingsTriggers, setSettingsTriggers] = useState([]);
          const [settingsTriggersLoading, setSettingsTriggersLoading] = useState(false);
          const [settingsTriggersError, setSettingsTriggersError] = useState("");
          const [settingsTriggersSuccess, setSettingsTriggersSuccess] = useState("");
          const pluginsNavActionsRef = useRef(null);
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.refs}
  ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.lifecycle}${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.menuLifecycle}
          const [settingsSelectedTriggerId, setSettingsSelectedTriggerId] = useState("");
          const [settingsShowTriggerSecret, setSettingsShowTriggerSecret] = useState(false);
          const [settingsCopiedField, setSettingsCopiedField] = useState("");
          const [settingsCreatingTrigger, setSettingsCreatingTrigger] = useState(false);
          const [settingsTriggerSubmitting, setSettingsTriggerSubmitting] = useState(false);
          const [settingsTriggerActionId, setSettingsTriggerActionId] = useState("");
          const [settingsTriggerActionType, setSettingsTriggerActionType] = useState("");
          const [settingsTriggerForm, setSettingsTriggerForm] = useState({
            name: "",
            source: "github",
            event: getSettingsTriggerDefaultEvent("github", "send_message"),
            environmentId: "",
            agentId: "",
            actionType: "send_message",
            message: "",
            filterRepo: "",
            filterBranch: "",
          });
          const [isSettingsTriggerPromptEditing, setIsSettingsTriggerPromptEditing] = useState(false);
          const [settingsTriggerGithubRepos, setSettingsTriggerGithubRepos] = useState([]);
          const [settingsTriggerGithubReposLoading, setSettingsTriggerGithubReposLoading] = useState(false);
          const [settingsTriggerGithubReposError, setSettingsTriggerGithubReposError] = useState("");
          const [settingsPasswordForm, setSettingsPasswordForm] = useState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          const [settingsPasswordLoading, setSettingsPasswordLoading] = useState(false);
          const [settingsPasswordError, setSettingsPasswordError] = useState("");
          const [settingsPasswordSuccess, setSettingsPasswordSuccess] = useState("");
          const [settingsPasswordResetLoading, setSettingsPasswordResetLoading] = useState(false);
          const [settingsDeleteConfirmation, setSettingsDeleteConfirmation] = useState("");
          const [settingsDeletePassword, setSettingsDeletePassword] = useState("");
          const [settingsDeleteLoading, setSettingsDeleteLoading] = useState(false);
          const [settingsDeleteError, setSettingsDeleteError] = useState("");
          const profileImageInputRef = useRef(null);
          const settingsTriggerPromptTextareaRef = useRef(null);
          const authGateEmailInputRef = useRef(null);
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.refs}
          const threadRenameInputRef = useRef(null);
          const threadNavMenuRef = useRef(null);
          const threadTaskListMenuRef = useRef(null);
          const settingsPlansMenuRef = useRef(null);
          const settingsResourceCapInfoRef = useRef(null);
          const settingsResourceCapAutosaveTimerRef = useRef(null);
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.refs}        const authRedirectStartedRef = useRef(false);
          const hasAuthenticatedSessionThisMountRef = useRef(false);
          const explicitSignOutInProgressRef = useRef(false);
          const sessionBudgetSyncKeyRef = useRef("");
          const demoReadyAnnouncedRef = useRef(false);
          const connectorBrowserRestoreScheduledKeyRef = useRef("");
          const projectComposerConnectorBrowserRestoreScheduledKeyRef = useRef("");
          const githubConnectedRef = useRef(Boolean(githubStatus.connected));
          const proactiveDefaultEnvironmentWarmPromisesRef = useRef(new Map());
          const proactiveDefaultEnvironmentWarmCacheUntilMsRef = useRef(new Map());
          const onboardingDefaultEnvironmentWarmKeyRef = useRef("");
          const threadSubagentDetailHostRef = useCallback((node) => {
            setThreadSubagentDetailHost(node || null);
          }, []);
          const taskCompletionSyncInFlightRef = useRef(new Set());
          const taskCompletionSyncedThreadKeysRef = useRef(new Set());
          const taskReviewThreadStartKeysRef = useRef(new Set());
          const selectedThreadTaskPreviewFetchKeysRef = useRef(new Set());
          const selectedThreadTaskPreviewFetchThreadIdRef = useRef("");
          const selectedThreadTaskPreviewRef = useRef(null);
  
          const proxyBackendBase = window.location.origin + "/api/real";
          const demoAgents = [
            { id: "agent_assistant", name: "Spark", isDefault: true, isSystem: true },
            { id: "agent_default", name: "Forge", isDefault: true, isSystem: true },
            { id: "agent_research", name: "Foundry", isDefault: true, isSystem: true }
          ];
          const demoEnvironments = [
            { id: "env_default", name: "Default", isDefault: true },
            { id: "env_staging", name: "Staging" },
            { id: "env_marketing", name: "Marketing Site" }
          ];
          const baseDemoSkills = [
            { id: "image_generation", name: "Image Generation", enabled: true },
            { id: "video_generation", name: "Video Generation", enabled: true },
            { id: "web_search", name: "Web Search", enabled: true },
            { id: "deep_research", name: "Deep Research", enabled: true },
            { id: "pdf", name: "PDF Processing", enabled: true },
            { id: "frontend_design", name: "Hallmark Frontend Design", enabled: true },
            { id: "pptx", name: "PowerPoint/PPTX", enabled: true },
            { id: "memory", name: "Memory", enabled: true },
            { id: "task_management", name: "Task Management", enabled: true },
            { id: "app_platform", name: "App Platform", enabled: true },
            { id: "computer_agents", name: "Computer Agents", enabled: true },
            { id: "email", name: "Email", enabled: true }
          ];
          const [runnerEnabledSkillIds, setRunnerEnabledSkillIds] = useState(() => loadPlaygroundRunnerEnabledSkillIds());
          useEffect(() => {
            persistPlaygroundRunnerEnabledSkillIds(runnerEnabledSkillIds);
          }, [runnerEnabledSkillIds]);
          const SESSION_API_KEY_SENTINEL = "__runner_playground_session__";
          const hasSessionAuth = sessionState.status === "authenticated";
          const hasDemoAccess = isDemoMode;
          const resolvedSessionApiKey = typeof sessionStreamingConfig.apiKey === "string" ? sessionStreamingConfig.apiKey.trim() : "";
          const effectiveApiKey = useMemo(() => {
            if (isDemoMode) {
              return "";
            }
            if (hasSessionAuth) {
              return resolvedSessionApiKey || SESSION_API_KEY_SENTINEL;
            }
            return String(apiKey || "").trim();
          }, [apiKey, hasSessionAuth, isDemoMode, resolvedSessionApiKey]);
          const resolvedUpstreamUrl = useMemo(() => {
            const trimmed = String(upstreamUrl || "").trim();
            return trimmed || ${JSON.stringify(defaultUpstreamOrigin)};
          }, [upstreamUrl]);
          const baseAuthRequestHeaders = useMemo(() => ({
            ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
            "X-Runner-Upstream-Url": resolvedUpstreamUrl,
          }), [effectiveApiKey, resolvedUpstreamUrl]);
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.requestScope}        const requestHeaders = useMemo(() => {
            return authRequestHeaders;
          }, [authRequestHeaders]);
          const requestHeadersSignature = useMemo(() => (
            Object.keys(requestHeaders || {})
              .sort()
              .map((key) => key + ":" + String(requestHeaders[key] || ""))
              .join("|")
          ), [requestHeaders]);
          const shouldLoadGuardrailSets = activePage === "guardrails";
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.workspaceLifecycle}        useEffect(() => {
            if (!shouldLoadGuardrailSets) {
              return undefined;
            }
            void loadBackendGuardrailSets({ force: false });
            return undefined;
          }, [proxyBackendBase, requestHeadersSignature, shouldLoadGuardrailSets]);
  ${TEAMS_APP_SCRIPT_FRAGMENTS.resourceLifecycle}        const loadThreadSearchFileInventory = useCallback(async (targetEnvironmentId) => {
            const normalizedEnvironmentId = String(targetEnvironmentId || "").trim();
            if (!normalizedEnvironmentId) {
              return [];
            }
            const cachedInventory = threadSearchFileInventoryByEnvironmentIdRef.current[normalizedEnvironmentId];
            if (Array.isArray(cachedInventory)) {
              return cachedInventory;
            }
            if (threadSearchFileInventoryLoadingIdsRef.current.has(normalizedEnvironmentId)) {
              return [];
            }
  
            threadSearchFileInventoryLoadingIdsRef.current.add(normalizedEnvironmentId);
            setThreadSearchFileInventoryLoadingByEnvironmentId((current) => ({
              ...current,
              [normalizedEnvironmentId]: true,
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundEnvironmentFilesListUrl(proxyBackendBase, normalizedEnvironmentId, "", -1),
                {
                  method: "GET",
                  headers: authRequestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to search files.");
              }
              const normalizedInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
              setThreadSearchFileInventoryByEnvironmentId((current) => ({
                ...current,
                [normalizedEnvironmentId]: normalizedInventory,
              }));
              return normalizedInventory;
            } catch {
              setThreadSearchFileInventoryByEnvironmentId((current) => ({
                ...current,
                [normalizedEnvironmentId]: [],
              }));
              return [];
            } finally {
              threadSearchFileInventoryLoadingIdsRef.current.delete(normalizedEnvironmentId);
              setThreadSearchFileInventoryLoadingByEnvironmentId((current) => ({
                ...current,
                [normalizedEnvironmentId]: false,
              }));
            }
          }, [authRequestHeaders, proxyBackendBase]);
          const hasRealAccess = !isDemoMode && hasSessionAuth;
          const hasShellAccess = hasRealAccess || hasDemoAccess;
          const databaseListIdentity = hasSessionAuth
            ? String(sessionState.userId || "").trim()
            : String(effectiveApiKey || "").trim();
          useEffect(() => {
            if (!hasRealAccess) return undefined;
            const preloadTimer = window.setTimeout(() => {
              void fetchPlaygroundDatabaseList(proxyBackendBase, authRequestHeaders, {
                identity: databaseListIdentity,
              }).catch(() => {});
            }, 0);
            return () => window.clearTimeout(preloadTimer);
          }, [authRequestHeaders, databaseListIdentity, hasRealAccess, proxyBackendBase]);
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.runtimeLifecycle}${MODELS_APP_SCRIPT_FRAGMENTS.catalogLifecycle}        const activeProjectId = projectId.trim() || sessionState.projectId || "";
          const settingsProjectRoutingId = activeProjectId || "__runner_playground__";
          const accountName = hasSessionAuth
            ? formatAccountDisplayName(sessionState.displayName, sessionState.email || "", "Agentic Compute Platform")
            : hasDemoAccess
              ? "Demo User"
              : "Sign in";
          const accountInitials = getAccountInitials(accountName);
          const accountEmail = hasSessionAuth ? (sessionState.email || "") : (hasDemoAccess ? "demo@computer-agents.com" : "");
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationStorageKey}        const accountTierId = hasDemoAccess ? "enterprise" : normalizeSettingsTierId(sessionState.subscriptionTier);
          const accountTier = hasDemoAccess
            ? "Enterprise"
            : hasShellAccess && accountTierId
              ? formatSubscriptionTier(accountTierId)
              : hasShellAccess
                ? "Loading"
                : "Sign in";
          const accountAvatarUrl = canRenderAvatarImage(sessionState.photoURL) ? sessionState.photoURL : "";
          const profileEditorAvatarUrl = canRenderAvatarImage(profileDraft.photoURL) && !profileEditorAvatarBroken
            ? String(profileDraft.photoURL || "").trim()
            : "";
          const initialThreadGreeting = useMemo(() => (
            hasDemoAccess
              ? "Welcome to ACP."
              : buildWelcomeGreeting(sessionState.displayName, sessionState.email || "")
          ), [hasDemoAccess, sessionState.displayName, sessionState.email]);
          const showInitialThreadWelcome = activePage === "thread" && hasShellAccess && !currentThreadId;
          const isCurrentPrivateThread = privateThreadIds.includes(String(currentThreadId || "").trim());
  ${CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationProjection}        const permissionAttentionThreadIds = useMemo(() => {
            const threadIds = new Set();
            pendingPermissionDecisionThreads.forEach((thread) => {
              const threadId = typeof thread?.id === "string" ? thread.id.trim() : "";
              if (threadId) {
                threadIds.add(threadId);
              }
            });
            return threadIds;
          }, [pendingPermissionDecisionThreads]);
          const permissionDecisionThreadCount = permissionAttentionThreadIds.size;
          const runnerComposerPrivateMode = showInitialThreadWelcome ? initialThreadPrivateMode : isCurrentPrivateThread;
          const [initialThreadLastVisitedAtMs, setInitialThreadLastVisitedAtMs] = useState(() => {
            try {
              const storedTimestamp = Number(localStorage.getItem(INITIAL_THREAD_LAST_VISIT_STORAGE_KEY) || 0);
              return Number.isFinite(storedTimestamp) && storedTimestamp > 0 ? storedTimestamp : 0;
            } catch {
              return 0;
            }
          });
          const initialThreadVisitRecordedAtRef = useRef(0);
          useEffect(() => {
            privateThreadIdsRef.current = new Set(privateThreadIds.map((threadId) => String(threadId || "").trim()).filter(Boolean));
          }, [privateThreadIds]);
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.originThreads}
          const registerPrivateThreadId = useCallback(function registerPrivateThreadId(threadId) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId) {
              return;
            }
  
            privateThreadIdsRef.current = new Set([
              ...Array.from(privateThreadIdsRef.current),
              normalizedThreadId,
            ]);
            setPrivateThreadIds((current) => (
              current.includes(normalizedThreadId) ? current : current.concat(normalizedThreadId)
            ));
            setRealThreads((current) => current.filter((thread) => String(thread?.id || "").trim() !== normalizedThreadId));
          }, []);
  
          const deletePrivateThreadId = useCallback(async function deletePrivateThreadId(threadId, options = {}) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!hasRealAccess || !normalizedThreadId || !isRealThreadId(normalizedThreadId)) {
              return;
            }
  
            try {
              await fetch(proxyBackendBase + "/threads/" + encodeURIComponent(normalizedThreadId), {
                method: "DELETE",
                headers: authRequestHeaders,
                credentials: "include",
                keepalive: options?.keepalive === true,
              });
            } catch {
            }
          }, [authRequestHeaders, hasRealAccess, proxyBackendBase]);
  
          const discardPrivateThread = useCallback(function discardPrivateThread(threadId, options = {}) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || !privateThreadIdsRef.current.has(normalizedThreadId)) {
              return;
            }
  
            privateThreadIdsRef.current.delete(normalizedThreadId);
            setPrivateThreadIds((current) => current.filter((item) => item !== normalizedThreadId));
            setRealThreads((current) => current.filter((thread) => String(thread?.id || "").trim() !== normalizedThreadId));
            void deletePrivateThreadId(normalizedThreadId, options);
          }, [deletePrivateThreadId]);
  
          const handleGhostModeToggle = useCallback(function handleGhostModeToggle() {
            setInitialThreadPrivateMode((current) => !current);
          }, []);
  
          useEffect(() => {
            if (!showInitialThreadWelcome) {
              if (initialThreadVisitRecordedAtRef.current > 0) {
                setInitialThreadLastVisitedAtMs(initialThreadVisitRecordedAtRef.current);
                initialThreadVisitRecordedAtRef.current = 0;
              }
              return;
            }
  
            if (initialThreadVisitRecordedAtRef.current > 0) {
              return;
            }
  
            const nextVisitedAtMs = Date.now();
            initialThreadVisitRecordedAtRef.current = nextVisitedAtMs;
            try {
              localStorage.setItem(INITIAL_THREAD_LAST_VISIT_STORAGE_KEY, String(nextVisitedAtMs));
            } catch {}
          }, [showInitialThreadWelcome]);
          function buildPlaygroundEnvironmentWarmRequestKey(environmentId, agentId = "") {
            return JSON.stringify({
              backendUrl: String(proxyBackendBase || "").replace(/\/+$/, ""),
              environmentId: String(environmentId || "").trim(),
              agentId: String(agentId || "").trim() || null,
            });
          }
  
          function readSharedEnvironmentWarmCacheUntilMs(requestKey) {
            try {
              return Number(window.__runnerEnvironmentWarmCacheUntilMs?.[requestKey] || 0);
            } catch {
              return 0;
            }
          }
  
          function writeSharedEnvironmentWarmCacheUntilMs(requestKey, untilMs) {
            try {
              const sharedCache = window.__runnerEnvironmentWarmCacheUntilMs || {};
              if (untilMs > Date.now()) {
                sharedCache[requestKey] = untilMs;
              } else {
                delete sharedCache[requestKey];
              }
              window.__runnerEnvironmentWarmCacheUntilMs = sharedCache;
            } catch {}
          }
  
          const welcomeWidgetProject = welcomeWidgetsState.project;
          const welcomeWidgetTicketNumbersById = useMemo(() => (
            buildPlaygroundTaskTicketNumberMap(welcomeWidgetsState.tasks)
          ), [welcomeWidgetsState.tasks]);
          const welcomeWidgetTaskRows = useMemo(() => (
            buildPlaygroundWelcomeTaskRows(welcomeWidgetsState.tasks, welcomeWidgetTicketNumbersById)
          ), [welcomeWidgetTicketNumbersById, welcomeWidgetsState.tasks]);
          const initialThreadSummaryLine = useMemo(() => {
            const completedThreadCount = initialThreadLastVisitedAtMs > 0
              ? realThreads.filter((thread) => {
                  const safeThread = normalizeThreadItem(thread);
                  return isCompletedThreadStatus(safeThread.status)
                    && resolveThreadCompletionTimestampMs(safeThread) > initialThreadLastVisitedAtMs;
                }).length
              : 0;
            const projectSummary = welcomeWidgetsState.project?.summary && typeof welcomeWidgetsState.project.summary === "object"
              ? welcomeWidgetsState.project.summary
              : {};
            const fileUpdateCandidates = [
              projectSummary.fileUpdatesCount,
              projectSummary.updatedFilesCount,
              projectSummary.filesUpdatedCount,
              projectSummary.environmentChangesCount,
            ];
            const fileUpdateCount = Math.max(
              0,
              Number(fileUpdateCandidates.find((value) => Number.isFinite(Number(value))) || 0)
            );
            const formatCount = (count, singular, plural) => (
              String(count) + " " + (count === 1 ? singular : (plural || singular + "s"))
            );
            return [
              formatCount(completedThreadCount, "thread completed", "threads completed"),
              formatCount(fileUpdateCount, "file update", "file updates"),
              formatCount(permissionDecisionThreadCount, "decision needed", "decisions needed"),
            ].join(" · ");
          }, [initialThreadLastVisitedAtMs, permissionDecisionThreadCount, realThreads, welcomeWidgetsState.project]);
  
          useEffect(() => {
            if (!isDemoMode || !hasShellAccess || demoReadyAnnouncedRef.current) {
              return;
            }
  
            demoReadyAnnouncedRef.current = true;
            let frameIdA = 0;
            let frameIdB = 0;
  
            const announceReady = () => {
              try {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: "acp-demo-ready" }, "*");
                }
              } catch {}
            };
  
            frameIdA = window.requestAnimationFrame(() => {
              frameIdB = window.requestAnimationFrame(announceReady);
            });
  
            return () => {
              if (frameIdA) {
                window.cancelAnimationFrame(frameIdA);
              }
              if (frameIdB) {
                window.cancelAnimationFrame(frameIdB);
              }
            };
          }, [hasShellAccess, isDemoMode]);
  
  ${CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationLoadLifecycle}
          useEffect(() => {
            try {
              if (latestInteractedProjectId) {
                localStorage.setItem("runner_demo_tasks_last_project_id", latestInteractedProjectId);
              } else {
                localStorage.removeItem("runner_demo_tasks_last_project_id");
              }
            } catch {}
          }, [latestInteractedProjectId]);
  
          useEffect(() => {
            if (!isDemoMode || !showInitialThreadWelcome) {
              return;
            }
  
            setWelcomeWidgetsState(buildDemoWelcomeWidgetsState());
          }, [isDemoMode, showInitialThreadWelcome]);
  
          useEffect(() => {
            if (!showInitialThreadWelcome || !hasRealAccess) {
              return undefined;
            }
  
            const controller = new AbortController();
            const welcomeRequestHeaders = {
              ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
              "X-Runner-Upstream-Url": String(upstreamUrl || "").trim() || defaultUpstreamOrigin,
            };
  
            setWelcomeWidgetsState((current) => ({
              ...current,
              status: "loading",
              error: "",
            }));
  
            void (async () => {
              try {
                const projectsResponse = await fetch(proxyBackendBase + "/projects", {
                  method: "GET",
                  headers: welcomeRequestHeaders,
                  signal: controller.signal,
                });
                const projectsData = await projectsResponse.json().catch(() => ({}));
                if (!projectsResponse.ok) {
                  throw new Error(projectsData?.message || projectsData?.error || "Failed to load projects.");
                }
  
                const availableProjects = parsePlaygroundProjectListResponse(projectsData);
                const resolvedProject = choosePlaygroundWelcomeProject(availableProjects, latestInteractedProjectId);
                if (!resolvedProject?.id) {
                  setWelcomeWidgetsState({
                    status: "ready",
                    error: "",
                    projectId: "",
                    project: null,
                    tasks: [],
                    schedules: [],
                  });
                  return;
                }
  
                const resolvedProjectId = resolvedProject.id;
                const schedulesRequestTarget = new URL(
                  proxyBackendBase + "/projects/" + encodeURIComponent(resolvedProjectId) + "/schedules",
                  window.location.origin
                );
                const welcomeScheduleRangeStart = startOfPlaygroundDay(addPlaygroundDays(new Date(), -45));
                const welcomeScheduleRangeEnd = endOfPlaygroundDay(addPlaygroundDays(new Date(), 180));
                if (welcomeScheduleRangeStart) {
                  schedulesRequestTarget.searchParams.set("rangeStart", welcomeScheduleRangeStart.toISOString());
                }
                if (welcomeScheduleRangeEnd) {
                  schedulesRequestTarget.searchParams.set("rangeEnd", welcomeScheduleRangeEnd.toISOString());
                }
                const [projectResponse, tasksResponse, schedulesResponse] = await Promise.all([
                  fetch(proxyBackendBase + "/projects/" + encodeURIComponent(resolvedProjectId), {
                    method: "GET",
                    headers: welcomeRequestHeaders,
                    signal: controller.signal,
                  }),
                  fetch(proxyBackendBase + "/tasks?projectId=" + encodeURIComponent(resolvedProjectId), {
                    method: "GET",
                    headers: welcomeRequestHeaders,
                    signal: controller.signal,
                  }),
                  fetch(schedulesRequestTarget.toString(), {
                    method: "GET",
                    headers: welcomeRequestHeaders,
                    signal: controller.signal,
                  }),
                ]);
  
                const projectData = await projectResponse.json().catch(() => ({}));
                const tasksData = await tasksResponse.json().catch(() => ({}));
                const schedulesData = await schedulesResponse.json().catch(() => ({}));
  
                if (!projectResponse.ok || !tasksResponse.ok || !schedulesResponse.ok) {
                  throw new Error(
                    projectData?.message || projectData?.error
                    || tasksData?.message || tasksData?.error
                    || schedulesData?.message || schedulesData?.error
                    || "Failed to load welcome widgets."
                  );
                }
  
                const projectRecord = getPlaygroundProjectResponseRecord(projectData, resolvedProject) || resolvedProject;
                const projectSummary = projectData?.summary && typeof projectData.summary === "object"
                  ? projectData.summary
                  : projectRecord.summary;
  
                setWelcomeWidgetsState({
                  status: "ready",
                  error: "",
                  projectId: resolvedProjectId,
                  project: {
                    ...projectRecord,
                    summary: {
                      ...buildEmptyPlaygroundProjectSummary(),
                      ...(projectSummary && typeof projectSummary === "object" ? projectSummary : {}),
                    },
                  },
                  tasks: parsePlaygroundTaskListResponse(tasksData),
                  schedules: parsePlaygroundScheduleListResponse(schedulesData),
                });
              } catch (error) {
                if (controller.signal.aborted) {
                  return;
                }
                setWelcomeWidgetsState({
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to load welcome widgets.",
                  projectId: "",
                  project: null,
                  tasks: [],
                  schedules: [],
                });
              }
            })();
  
            return () => controller.abort();
          }, [effectiveApiKey, hasRealAccess, latestInteractedProjectId, proxyBackendBase, showInitialThreadWelcome, upstreamUrl]);
  
          function buildAiosLoginUrl(options) {
            const nextOptions = options && typeof options === "object" ? options : {};
            const loginUrl = new URL("/login", ${JSON.stringify(aiosOrigin)});
            loginUrl.searchParams.set("redirect", window.location.href);
            if (nextOptions.signedOut) {
              loginUrl.searchParams.set("signed_out", "1");
            }
            return loginUrl.toString();
          }
  
          function redirectToAiosLogin(options) {
            const nextOptions = options && typeof options === "object" ? options : {};
            const currentHref = window.location.href;
            const redirectState = readPlaygroundAuthRedirectState();
            const previousAttempts =
              redirectState && String(redirectState.href || "") === currentHref
                ? Math.max(0, Number(redirectState.attempts || 0))
                : 0;
            writePlaygroundAuthRedirectState({
              href: currentHref,
              startedAt: Date.now(),
              attempts: previousAttempts + 1,
            });
            const loginUrl = buildAiosLoginUrl();
            if (nextOptions.replace) {
              window.location.replace(loginUrl);
              return;
            }
            window.location.assign(loginUrl);
          }
  
          function handleSignInWithComputerAgents() {
            setPlatformAuthError("");
            explicitSignOutInProgressRef.current = false;
            if (!authRedirectStartedRef.current) {
              authRedirectStartedRef.current = true;
              redirectToAiosLogin({ replace: false });
            }
          }
  
          function buildThreadRunnerResourceHiddenPrompt(commandType) {
            if (commandType === "computer") {
              return [
                "The user is asking you to create a new ACP computer.",
                "Use the Computer Agents skill to inspect the live platform and create the requested computer instead of inventing IDs or writing raw API calls.",
                "If essential details are missing, ask concise clarifying questions before creating anything. Focus on operating system, runtime, Dockerfile or base image, packages, GUI requirements, secrets, and integrations.",
                "Once the request is specific enough, create the computer and clearly summarize what you configured."
              ].join(" ");
            }
            if (commandType === "app") {
              return [
                "The user is asking you to create a new ACP web app resource.",
                "Use the Computer Agents skill to inspect the live platform and create the requested app.",
                "If the specification is incomplete, ask concise clarifying questions before creating anything. Focus on framework, source or runtime choice, build and start behavior, environment variables, route or domain expectations, and any required bindings.",
                "Once the request is specific enough, create the app resource and clearly summarize what you configured."
              ].join(" ");
            }
            if (commandType === "function") {
              return [
                "The user is asking you to create a new ACP function resource.",
                "Use the Computer Agents skill to inspect the live platform and create the requested function.",
                "If the specification is incomplete, ask concise clarifying questions before creating anything. Focus on runtime, trigger shape, request and response contract, dependencies, environment variables, and any required bindings.",
                "Once the request is specific enough, create the function resource and clearly summarize what you configured."
              ].join(" ");
            }
            return "";
          }
  
          function buildThreadRunnerAgentHiddenPrompt(commandType) {
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
                "The user is asking you to create a new ACP team.",
                "Use the Computer Agents skill to inspect the live platform and create the requested team instead of inventing IDs or writing raw API calls.",
                "If essential details are missing, ask concise clarifying questions before creating anything. Focus on the team's purpose, orchestrator responsibilities, required subagents, collaboration pattern, models, and handoff expectations.",
                "Once the request is specific enough, create the team and clearly summarize what you configured."
              ].join(" ");
            }
            return "";
          }
  
          function buildThreadRunnerSkillHiddenPrompt(commandType) {
            if (commandType === "skill") {
              return [
                "The user is asking you to create a new ACP skill.",
                "Use the Computer Agents skill to inspect the live platform and publish the requested skill instead of inventing IDs or writing raw API calls.",
                "Read /workspace/.claude/skills/computer-agents/SKILL.md, then use python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py skills --help and skills list before creating anything.",
                "Draft the skill locally first: create a proper SKILL.md plus any supporting code files in a temporary workspace folder.",
                "Then publish it with python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py skills create --name ... --description ... --markdown-file ... --code-file target=source ....",
                "Do not stop after creating local files. The skill only counts as finished once it has been published to the live ACP custom skills list.",
                "After publishing, verify success by running skills list --query ... and confirm the created skill appears in the account skill list.",
                "If essential details are missing, ask concise clarifying questions before creating anything. Focus on the skill's purpose, triggers or entrypoints, required files, tool or environment access, expected inputs and outputs, and any dependencies or examples that should ship with it.",
                "If publishing fails, explain the exact blocker and the command output instead of claiming the skill was created.",
                "Once the request is specific enough and the publish step succeeds, clearly summarize what you configured and which skill ID or name was created."
              ].join(" ");
            }
            return "";
          }
  
          const triggerPlatformSessionRecovery = useCallback(function triggerPlatformSessionRecovery() {
            if (isDemoMode || authRedirectStartedRef.current) {
              return;
            }
  
            authRedirectStartedRef.current = true;
            clearPlaygroundAuthSessionMarker();
            clearPlaygroundAuthRedirectState();
            try {
              localStorage.removeItem("runner_demo_api_key");
            } catch {}
            setApiKey("");
            setSessionStreamingConfig({
              status: "idle",
              apiKey: "",
              backendUrl: "",
              error: "",
            });
            setSessionState({
              status: "unauthenticated",
              userId: "",
              email: "",
              projectId: "",
              displayName: "",
              photoURL: "",
              emailVerified: false,
              subscriptionTier: "sandbox",
              subscriptionStatus: "",
              onboardingCompleted: null,
              error: "",
            });
            redirectToAiosLogin({ replace: true });
          }, [isDemoMode]);
  
          function buildAiosLogoutUrl() {
            const logoutUrl = new URL("/logout", ${JSON.stringify(aiosOrigin)});
            logoutUrl.searchParams.set("redirect", buildAiosLoginUrl({ signedOut: true }));
            return logoutUrl.toString();
          }
  
          async function handleSignOutFromComputerAgents() {
            explicitSignOutInProgressRef.current = true;
            authRedirectStartedRef.current = true;
            clearPlaygroundAuthRedirectState();
            clearPlaygroundAuthSessionMarker();
            setPlatformAuthBusy("signout");
            setPlatformAuthError("");
            try {
              const auth = await ensurePlaygroundFirebaseAuth();
              if (auth) {
                await signOutFirebaseAuth(auth).catch(() => {});
              }
            } finally {
              clearFirebaseSessionCookie();
              setSessionStreamingConfig({
                status: "idle",
                apiKey: "",
                backendUrl: "",
                error: "",
              });
              setSessionState({
                status: "unauthenticated",
                userId: "",
                email: "",
                projectId: "",
                displayName: "",
                photoURL: "",
                emailVerified: false,
                subscriptionTier: "sandbox",
                subscriptionStatus: "",
                onboardingCompleted: null,
                error: "",
              });
              setPlatformAuthBusy("");
              window.location.replace(buildAiosLogoutUrl());
            }
          }
  
          function closePlaygroundOnboarding() {
            clearPlaygroundOnboardingState();
            removeCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM);
            removeCurrentSearchParam(PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM);
            setShowPlaygroundOnboarding(false);
            if (sessionState.status === "authenticated" && sessionState.onboardingCompleted === false) {
              setSessionState((current) => ({
                ...current,
                onboardingCompleted: true,
              }));
              void fetchJsonWithTimeout("/api/aios/user/profile", {
                method: "PATCH",
                credentials: "include",
                cache: "no-store",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  onboardingCompleted: true,
                }),
              }, 15000).catch(() => {});
            }
          }
  
          function closeSubscriptionSuccessModal() {
            removeCurrentSearchParam(PLAYGROUND_SUBSCRIPTION_SUCCESS_QUERY_PARAM);
            setShowSubscriptionSuccessModal(false);
          }
  
          function handleOpenSubscriptionSuccessBilling() {
            closeSubscriptionSuccessModal();
            openOrganizationBillingPage("billing", "costs-plans");
          }
  
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.navigation}
  
  ${PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation}
          const setActivePage = useCallback((nextValue) => (
            requestPlatformStateChange(activePageRef, setActivePageState, nextValue)
          ), [requestPlatformStateChange]);
          const setResourcesView = useCallback((nextValue) => (
            requestPlatformStateChange(resourcesViewRef, setResourcesViewState, nextValue)
          ), [requestPlatformStateChange]);
  
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.lifecycle}
  ${PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.lifecycle}
  
          useEffect(() => {
            if (isDemoMode || sessionState.status !== "unauthenticated") {
              return;
            }
  
            setAccountMenuOpen(false);
            setThreadSearchOpen(false);
            setNotificationsOpen(false);
            setProfileEditorOpen(false);
            setRealThreads([]);
            setRealThreadsHasMore(false);
            setRealAgents([]);
            setRealEnvironments([]);
            setRealServers([]);
            setCurrentThreadId("");
          }, [isDemoMode, sessionState.status]);
  
          useEffect(() => {
            if (sessionState.status !== "authenticated") {
              return;
            }
            setPlatformAuthBusy("");
            setPlatformAuthError("");
            setPlatformAuthForm((current) => ({
              ...current,
              password: "",
            }));
          }, [sessionState.status]);
  
          useEffect(() => {
            function syncPlaygroundOnboardingFromUrl() {
              setShowPlaygroundOnboarding(readCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM) === "true");
              setShowSubscriptionSuccessModal(readCurrentSearchParam(PLAYGROUND_SUBSCRIPTION_SUCCESS_QUERY_PARAM) === "true");
              setInitialLandingPrompt(normalizePlaygroundInitialPrompt(readCurrentSearchParam(PLAYGROUND_INITIAL_PROMPT_QUERY_PARAM)));
            }
  
            window.addEventListener("popstate", syncPlaygroundOnboardingFromUrl);
            return () => window.removeEventListener("popstate", syncPlaygroundOnboardingFromUrl);
          }, []);
  
          useEffect(() => {
            if (!initialLandingPrompt) {
              return;
            }
            removeCurrentSearchParam(PLAYGROUND_INITIAL_PROMPT_QUERY_PARAM);
          }, [initialLandingPrompt]);
  
          useEffect(() => {
            if (!showPlaygroundOnboarding) {
              return;
            }
            setAccountMenuOpen(false);
            setThreadSearchOpen(false);
            setNotificationsOpen(false);
            setProfileEditorOpen(false);
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
            setThreadTaskListMenuOpen(false);
          }, [showPlaygroundOnboarding]);
  
          useEffect(() => {
            if (!showSubscriptionSuccessModal) {
              return;
            }
            setAccountMenuOpen(false);
            setThreadSearchOpen(false);
            setNotificationsOpen(false);
            setProfileEditorOpen(false);
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
            setThreadTaskListMenuOpen(false);
          }, [showSubscriptionSuccessModal]);
  
          useEffect(() => {
            if (sessionState.status !== "authenticated") {
              return;
            }
            if (sessionState.onboardingCompleted !== false) {
              return;
            }
            if (showPlaygroundOnboarding) {
              return;
            }
            setShowPlaygroundOnboarding(true);
          }, [sessionState.onboardingCompleted, sessionState.status, showPlaygroundOnboarding]);
  
  ${SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation}
  
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.navigation}
  ${TEAMS_APP_SCRIPT_FRAGMENTS.navigation}
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.navigation}
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationNavigation}
  ${TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity}
  ${ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.organizationIdentity}
  ${ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading}
  ${ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration}${ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.membership}
  ${ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.permissions}
  ${TEAMS_RUNTIME_SCRIPT_FRAGMENTS.loading}${TEAMS_RUNTIME_SCRIPT_FRAGMENTS.membership}${IMAGINE_APP_SCRIPT_FRAGMENTS.teamTemplateReader}
  
  ${TEAMS_RUNTIME_SCRIPT_FRAGMENTS.administration}${TEAMS_RUNTIME_SCRIPT_FRAGMENTS.permissions}${TEAMS_RUNTIME_SCRIPT_FRAGMENTS.deleteTeam}${TEAMS_DOMAIN_SCRIPT_FRAGMENTS.resourceSharing}
  ${METRONOME_APP_SCRIPT_FRAGMENTS.teamSharing}
  ${TEAMS_RUNTIME_SCRIPT_FRAGMENTS.sharing}${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.pageModeLifecycle}
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.loadLifecycle}
  ${TEAMS_APP_SCRIPT_FRAGMENTS.loadLifecycle}
  ${IMAGINE_APP_SCRIPT_FRAGMENTS.lifecycle}
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.lifecycle}
          function openPluginsPage() {
            setAccountMenuOpen(false);
            setSidebarWorkspaceMode("configure");
            setToolsView("tags");
            setSelectedPluginId("discord");
            setActivePage("tools");
          }
  
  ${CALENDAR_SHELL_SCRIPT_FRAGMENTS.navigation}
  ${IMAGINE_APP_SCRIPT_FRAGMENTS.navigation}
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.runController}
          function openHelpPage() {
            setAccountMenuOpen(false);
            window.open(${JSON.stringify(aiosOrigin + "/support")}, "_blank", "noopener,noreferrer");
          }
  
          function openDocsPage() {
            setAccountMenuOpen(false);
            window.open(${JSON.stringify(aiosOrigin + "/developers")}, "_blank", "noopener,noreferrer");
          }
  
          function handleWelcomeWidgetOpen(view, options = {}) {
            const resolvedProjectId = String(welcomeWidgetsState.projectId || latestInteractedProjectId || "").trim();
            const resolvedProjectRecord = welcomeWidgetsState.project?.id === resolvedProjectId
              ? normalizePlaygroundProjectRecord(welcomeWidgetsState.project)
              : null;
            if (resolvedProjectId) {
              try {
                localStorage.setItem("runner_demo_tasks_last_project_id", resolvedProjectId);
              } catch {}
              setLatestInteractedProjectId(resolvedProjectId);
            }
            const normalizedView = view === "calendar"
              ? "calendar"
              : view === "overview"
                ? "overview"
                : "backlog";
            const normalizedMissionControlAction = options?.missionControlAction === "run"
              ? "run"
              : options?.missionControlAction === "open"
                ? "open"
                : "";
            const normalizedProjectComposerAction = options?.projectComposerAction === "create"
              ? "create"
              : options?.projectComposerAction === "edit"
                ? "edit"
                : "";
            const projectComposerDraft = options?.projectComposerDraft && typeof options.projectComposerDraft === "object" && !Array.isArray(options.projectComposerDraft)
              ? {
                  name: String(options.projectComposerDraft.name || "").trim(),
                  description: String(options.projectComposerDraft.description || options.projectComposerDraft.goal || "").trim(),
                }
              : null;
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: resolvedProjectId,
              view: normalizedView,
              missionControlAction: normalizedMissionControlAction,
              projectComposerAction: normalizedProjectComposerAction,
              projectComposerDraft,
              projectRecord: resolvedProjectRecord || undefined,
            });
            setActivePage(normalizedView === "calendar" ? "calendar" : "tasks");
          }
  
          function handleWelcomeAllProjectsOpen() {
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: "",
              view: "backlog",
              missionControlAction: "",
              projectComposerAction: "",
            });
            setActivePage("tasks");
          }
  
          async function loadWelcomeProjectPickerProjects() {
            setWelcomeProjectPickerLoading(true);
            setWelcomeProjectPickerError("");
  
            try {
              if (hasDemoAccess) {
                const demoProject = buildDemoWelcomeWidgetsState().project;
                const demoProjects = demoProject ? [demoProject] : [];
                setWelcomeProjectPickerProjects(demoProjects);
                setWelcomeProjectPickerValue((current) => current || demoProjects[0]?.id || "");
                return;
              }
  
              if (!hasRealAccess) {
                setWelcomeProjectPickerProjects([]);
                setWelcomeProjectPickerError("Sign in to load projects.");
                return;
              }
  
              const response = await fetch(proxyBackendBase + "/projects", {
                method: "GET",
                headers: authRequestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load projects.");
              }
  
              const nextProjects = sortPlaygroundProjectsByRecent(parsePlaygroundProjectListResponse(data));
              setWelcomeProjectPickerProjects(nextProjects);
              setWelcomeProjectPickerValue((current) => {
                const currentProjectId = String(current || "").trim();
                if (currentProjectId && nextProjects.some((project) => project.id === currentProjectId)) {
                  return currentProjectId;
                }
                const selectedProjectId = String(welcomeWidgetsState.projectId || latestInteractedProjectId || "").trim();
                if (selectedProjectId && nextProjects.some((project) => project.id === selectedProjectId)) {
                  return selectedProjectId;
                }
                return nextProjects[0]?.id || "";
              });
            } catch (error) {
              setWelcomeProjectPickerProjects([]);
              setWelcomeProjectPickerError(error instanceof Error ? error.message : "Failed to load projects.");
            } finally {
              setWelcomeProjectPickerLoading(false);
            }
          }
  
          function openWelcomeProjectPickerDialog() {
            const selectedProjectId = String(welcomeWidgetsState.projectId || latestInteractedProjectId || "").trim();
            setWelcomeProjectPickerOpen(true);
            setWelcomeProjectPickerValue(selectedProjectId);
            setWelcomeProjectPickerError("");
            setWelcomeProjectPickerProjects([]);
            void loadWelcomeProjectPickerProjects();
          }
  
          function closeWelcomeProjectPickerDialog() {
            setWelcomeProjectPickerOpen(false);
            setWelcomeProjectPickerProjects([]);
            setWelcomeProjectPickerValue("");
            setWelcomeProjectPickerError("");
          }
  
          function handleWelcomeProjectSelection(projectRecord) {
            const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
            const normalizedProjectId = String(normalizedProject?.id || "").trim();
            if (!normalizedProjectId) {
              setWelcomeProjectPickerError("Choose a project first.");
              return;
            }
  
            try {
              localStorage.setItem("runner_demo_tasks_last_project_id", normalizedProjectId);
              localStorage.setItem("runner_demo_tasks_project_scope_id", normalizedProjectId);
            } catch {}
  
            setLatestInteractedProjectId(normalizedProjectId);
            setSelectedWelcomeComposerTaskId("");
            setWelcomeWidgetsState((current) => {
              if (current.projectId === normalizedProjectId) {
                return current;
              }
              return {
                ...current,
                status: "loading",
                error: "",
                projectId: normalizedProjectId,
                project: normalizedProject,
                tasks: [],
                schedules: [],
              };
            });
            closeWelcomeProjectPickerDialog();
          }
  
          function handleWelcomeWidgetRunMissionControl(event) {
            if (event?.stopPropagation) {
              event.stopPropagation();
            }
            handleWelcomeWidgetOpen("backlog", { missionControlAction: "run" });
          }
  
          function handleWelcomeWidgetCreateProject(eventOrDraft) {
            const isEvent = eventOrDraft?.stopPropagation;
            if (isEvent) {
              eventOrDraft.stopPropagation();
            }
            const projectComposerDraft = !isEvent && eventOrDraft && typeof eventOrDraft === "object" && !Array.isArray(eventOrDraft)
              ? {
                  name: String(eventOrDraft.name || "").trim(),
                  description: String(eventOrDraft.description || eventOrDraft.goal || "").trim(),
                }
              : null;
            handleWelcomeWidgetOpen("backlog", {
              projectComposerAction: "create",
              projectComposerDraft,
            });
          }
  
          async function loadWelcomeWidgetProjectCustomSkills(projectId) {
            const normalizedProjectId = String(projectId || "").trim();
            if (!normalizedProjectId) {
              return [];
            }
  
            const requestUrl = new URL("/api/playground/custom-skills", window.location.origin);
            requestUrl.searchParams.set("projectId", normalizedProjectId);
  
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
              throw new Error(data?.message || data?.error || "Failed to load custom skills.");
            }
  
            const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.skills) ? data.skills : [];
            return items
              .filter((skill) => skill && typeof skill === "object" && !skill.isDefault && !skill.isSystem)
              .map((skill) => ({
                id: skill.id,
                name: typeof skill.name === "string" && skill.name.trim() ? skill.name.trim() : skill.id,
                description: typeof skill.description === "string" ? skill.description : "",
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
              }));
          }
  
          function getWelcomeWidgetTaskAssigneeName(taskRecord) {
            const normalizedAssigneeId = String(taskRecord?.assigneeAgentId || "").trim();
            if (!normalizedAssigneeId) {
              return "None";
            }
            if (isPlaygroundHumanAssigneeId(normalizedAssigneeId)) {
              return "Me";
            }
            return realAgents.find((agent) => agent?.id === normalizedAssigneeId)?.name || normalizedAssigneeId;
          }
  
          function getWelcomeWidgetTaskEnvironmentName(taskRecord) {
            const normalizedEnvironmentId = String(taskRecord?.environmentId || "").trim();
            if (!normalizedEnvironmentId) {
              return "None";
            }
            return realEnvironments.find((environment) => environment?.id === normalizedEnvironmentId)?.name || normalizedEnvironmentId;
          }
  
  	        function isWelcomeWidgetTaskLaunchLocked(taskRecord) {
  	          const normalizedTaskId = String(taskRecord?.id || "").trim();
  	          if (!normalizedTaskId) {
  	            return false;
  	          }
  	          const taskRunState = taskRunStates[normalizedTaskId];
  	          const phase = typeof taskRunState?.phase === "string" ? taskRunState.phase.trim().toLowerCase() : "";
  	          return welcomeWidgetBusyTaskIds.includes(normalizedTaskId)
  	            || phase === "starting"
  	            || phase === "running";
  	        }
  
          function updateWelcomeWidgetTaskLocally(taskRecord) {
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            setWelcomeWidgetsState((current) => ({
              ...current,
              tasks: (Array.isArray(current.tasks) ? current.tasks : []).map((task) => task?.id === normalizedTask.id ? normalizedTask : task),
            }));
          }
  
          async function patchWelcomeWidgetTaskRecord(taskRecord, overrides = {}) {
            const normalizedTask = normalizePlaygroundTaskRecord({
              ...normalizePlaygroundTaskRecord(taskRecord),
              ...overrides,
            });
            if (String(normalizedTask.status || "").trim() === "done") {
              const incompleteSubtasks = getWelcomeWidgetDirectSubtasks(normalizedTask)
                .filter((subtask) => String(subtask.status || "").trim() !== "done");
              if (incompleteSubtasks.length > 0) {
                const labels = incompleteSubtasks
                  .slice(0, 3)
                  .map((subtask) => welcomeWidgetTicketNumbersById[subtask.id] || subtask.ticketNumber || subtask.title || subtask.id)
                  .filter(Boolean);
                const suffix = incompleteSubtasks.length > labels.length
                  ? " +" + String(incompleteSubtasks.length - labels.length) + " more"
                  : "";
                throw new Error("Finish subtasks before closing parent: " + labels.join(", ") + suffix);
              }
            }
            const metadata = buildPlaygroundTaskMetadata(normalizedTask, {
              ticketNumber: normalizedTask.ticketNumber,
  	            taskType: normalizedTask.taskType,
  	            parentTaskId: normalizedTask.parentTaskId,
  	            assigneeAgentId: normalizedTask.assigneeAgentId,
  	            reviewRequired: normalizedTask.reviewRequired,
  	            reviewerAgentId: normalizedTask.reviewerAgentId,
  	            environmentId: normalizedTask.environmentId,
              attachments: normalizedTask.attachments,
              enabledSkills: normalizedTask.enabledSkills,
              connectors: normalizedTask.connectors,
              comments: normalizedTask.comments,
            });
            const nextAssigneeAgentId = isPlaygroundHumanAssigneeId(normalizedTask.assigneeAgentId)
              ? null
              : normalizedTask.assigneeAgentId;
  
            const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTask.id), {
              method: "PATCH",
              headers: {
                ...authRequestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projectId: normalizedTask.projectId || welcomeWidgetsState.projectId || "",
                releaseId: normalizedTask.releaseId,
                ticketNumber: normalizedTask.ticketNumber,
                type: normalizedTask.taskType,
                parentTaskId: normalizedTask.taskType === "subtask" ? normalizedTask.parentTaskId : null,
                title: normalizedTask.title,
                description: normalizedTask.description,
                status: normalizedTask.status,
                priority: normalizedTask.priority,
                sprintId: normalizedTask.sprintId,
                assigneeAgentId: nextAssigneeAgentId,
                reviewRequired: normalizedTask.reviewRequired,
                reviewerAgentId: normalizedTask.reviewerAgentId,
                environmentId: normalizedTask.environmentId,
                dependencyIds: normalizedTask.dependencyIds,
                linkedThreadIds: normalizedTask.linkedThreadIds,
                lastStartedThreadId: normalizedTask.lastStartedThreadId,
                scheduledStartAt: normalizedTask.scheduledStartAt,
                scheduledEndAt: normalizedTask.scheduledEndAt,
                dueAt: normalizedTask.dueAt,
                completedAt: normalizedTask.completedAt,
                sortOrder: Number.isFinite(normalizedTask.sortOrder) ? Number(normalizedTask.sortOrder) : Date.now(),
                metadata,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update task.");
            }
            const updatedTask = getPlaygroundTaskResponseRecord(data);
            if (!updatedTask?.id) {
              throw new Error("Task update failed.");
            }
            return updatedTask;
          }
  
          async function buildWelcomeWidgetEnabledSkillsPayload(taskRecord, options = {}) {
            const normalizedTaskRecord = normalizePlaygroundTaskRecord(taskRecord);
            const explicitSkillIds = normalizePlaygroundEnabledSkillIds(normalizedTaskRecord.enabledSkills);
            const assigneeAgentId = String(normalizedTaskRecord.assigneeAgentId || normalizedTaskRecord.agentId || "").trim();
            const assigneeAgent = assigneeAgentId
              ? (realAgents.find((agent) => String(agent?.id || "").trim() === assigneeAgentId) || null)
              : null;
            const enabledSkillIds = explicitSkillIds.length > 0
              ? explicitSkillIds
              : normalizePlaygroundEnabledSkillIds(assigneeAgent?.enabledSkills);
            if (enabledSkillIds.length === 0) {
              enabledSkillIds.push("frontend_design");
            }
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
            if (getWelcomeWidgetDirectSubtasks(normalizedTaskRecord, options).length > 0) {
              payload.taskManagement = true;
            }
            const customSkillIds = enabledSkillIds.filter((skillId) => !defaultSkillMap[skillId]);
            if (customSkillIds.length > 0) {
              const projectCustomSkills = await loadWelcomeWidgetProjectCustomSkills(taskRecord?.projectId || welcomeWidgetsState.projectId || "");
              payload.customSkills = customSkillIds
                .map((skillId) => projectCustomSkills.find((skill) => skill?.id === skillId) || null)
                .filter(Boolean)
                .map((skill) => ({
                  id: skill.id,
                  name: skill.name,
                  description: skill.description,
                  markdown: skill.markdown,
                  codeFiles: Array.isArray(skill.codeFiles) ? skill.codeFiles : [],
                }));
            }
            return payload;
          }
  
          function buildWelcomeWidgetGithubRepoReference(taskRecord, options = {}) {
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
  
            const connectors = normalizePlaygroundTaskConnectorSelections(normalizedTask.connectors);
            return buildPlaygroundGithubRepoReferenceFromConnectorSelection(connectors.github)
              || buildPlaygroundGithubRepoReferenceFromConnectorSelection(
                normalizePlaygroundTaskConnectorSelections(options?.projectConnectors || welcomeWidgetProject?.connectors).github
              );
          }
  
          function buildWelcomeWidgetTaskPreview(taskRecord, threadId = "", options = {}) {
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            const ticketNumbersById = options?.ticketNumbersById && typeof options.ticketNumbersById === "object"
              ? options.ticketNumbersById
              : welcomeWidgetTicketNumbersById;
            return {
              taskId: normalizedTask.id,
              projectId: normalizedTask.projectId || options?.projectId || welcomeWidgetsState.projectId || "",
              projectName: options?.projectName || welcomeWidgetProject?.name || "",
              threadId: String(threadId || "").trim(),
              ticketNumber: ticketNumbersById[normalizedTask.id] || normalizedTask.ticketNumber || "000",
              title: normalizedTask.title || "Untitled Task",
              description: normalizedTask.description || "",
              taskColor: normalizedTask.taskColor || PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
              status: normalizedTask.status || "todo",
              priority: normalizedTask.priority || "medium",
              taskType: normalizePlaygroundTaskType(normalizedTask.taskType),
              assigneeAgentId: normalizedTask.assigneeAgentId || "",
              assigneeName: getWelcomeWidgetTaskAssigneeName(normalizedTask),
              reviewRequired: normalizedTask.reviewRequired === true,
              reviewerAgentId: normalizedTask.reviewerAgentId || "",
              environmentId: normalizedTask.environmentId || "",
              environmentName: getWelcomeWidgetTaskEnvironmentName(normalizedTask),
            };
          }
  
          function getWelcomeWidgetDirectSubtasks(taskRecord, options = {}) {
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            const taskId = String(normalizedTask?.id || "").trim();
            if (!taskId) {
              return [];
            }
  
            const sourceTasks = Array.isArray(options?.projectTasks) && options.projectTasks.length > 0
              ? options.projectTasks
              : (Array.isArray(welcomeWidgetsState.tasks) ? welcomeWidgetsState.tasks : []);
            const fallbackSubtasks = sourceTasks
              .map((task) => normalizePlaygroundTaskRecord(task))
              .filter((task) => task?.id && normalizePlaygroundParentTaskId(task.parentTaskId) === taskId);
            const subtasksById = new Map();
            fallbackSubtasks.forEach((subtask) => {
              const normalizedSubtask = normalizePlaygroundTaskRecord(subtask);
              if (normalizedSubtask?.id) {
                subtasksById.set(normalizedSubtask.id, normalizedSubtask);
              }
            });
            const ticketNumbersById = options?.ticketNumbersById && typeof options.ticketNumbersById === "object"
              ? options.ticketNumbersById
              : welcomeWidgetTicketNumbersById;
            return Array.from(subtasksById.values()).sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(ticketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(ticketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          }
  
          function buildWelcomeWidgetTaskSubtaskPromptSection(taskRecord, options = {}) {
            const directSubtasks = getWelcomeWidgetDirectSubtasks(taskRecord, options);
            if (directSubtasks.length === 0) {
              return "";
            }
            const newline = String.fromCharCode(10);
            const ticketNumbersById = options?.ticketNumbersById && typeof options.ticketNumbersById === "object"
              ? options.ticketNumbersById
              : welcomeWidgetTicketNumbersById;
            const subtaskLines = directSubtasks.map((subtask) => {
              const ticketNumber = ticketNumbersById[subtask.id] || subtask.ticketNumber || "000";
              const dependencyIds = Array.isArray(subtask.dependencyIds)
                ? subtask.dependencyIds.filter((dependencyId) => typeof dependencyId === "string" && dependencyId.trim())
                : [];
              const dependencyLabel = dependencyIds.length > 0
                ? " | dependencies=" + dependencyIds.map((dependencyId) => ticketNumbersById[dependencyId] || dependencyId).join(", ")
                : "";
              const threadId = getTaskStartedThreadId(subtask);
              const threadLabel = threadId ? " | thread=" + threadId : "";
              const descriptionPreview = String(subtask.description || "").replace(/\s+/g, " ").trim();
              return [
                "- " + subtask.id + " · " + ticketNumber + " · " + (subtask.title || "Untitled Subtask"),
                "status=" + getPlaygroundTaskStatusLabel(subtask.status),
                "priority=" + getPlaygroundTaskPriorityLabel(subtask.priority),
                "assignee=" + getWelcomeWidgetTaskAssigneeName(subtask),
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
  
  	        function buildWelcomeWidgetTaskRunPrompt(taskRecord, options = {}) {
  		          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
  		          const ticketNumbersById = options?.ticketNumbersById && typeof options.ticketNumbersById === "object"
  		            ? options.ticketNumbersById
  		            : welcomeWidgetTicketNumbersById;
  		          const ticketNumber = ticketNumbersById[normalizedTask.id] || normalizedTask.ticketNumber || "000";
  		          const newline = String.fromCharCode(10);
  		          const paragraphBreak = newline + newline;
  			          const projectId = String(normalizedTask.projectId || options?.projectId || welcomeWidgetsState.projectId || welcomeWidgetProject?.id || "").trim();
  			          const projectName = String(options?.projectName || welcomeWidgetProject?.name || "").trim();
  		          const projectRecord = options?.projectRecord && typeof options.projectRecord === "object"
  		            ? options.projectRecord
  		            : welcomeWidgetProject;
  			          const projectStrategySection = buildPlaygroundProjectStrategyBriefPromptSection(projectRecord, {
  			            taskRecord: normalizedTask,
  			          });
  			          const projectRulesSection = buildPlaygroundProjectRulesPromptSection(projectRecord);
  			          const projectResourcesSection = buildPlaygroundProjectResourcePromptSection(projectRecord, {
  			            projectId,
  			            projectName,
  			            projectAttachments: options?.projectAttachments,
  			          });
  			          const directResponseTask = isPlaygroundDirectResponseTask(normalizedTask);
  	          const independentReviewerId = getPlaygroundIndependentReviewerId(normalizedTask);
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
  		          const subtasksSection = buildWelcomeWidgetTaskSubtaskPromptSection(normalizedTask, options);
  		          const reviewerName = independentReviewerId
  		            ? (getWelcomeWidgetTaskAssigneeName({ assigneeAgentId: independentReviewerId }) || "Reviewer")
  		            : normalizedTask.reviewRequired && normalizedTask.reviewerAgentId
  		              ? "No independent reviewer configured"
  		            : "No review required";
  		          return wrapPlaygroundHiddenSystemPrompt([
  		            "Run this backlog ticket as configured.",
  		            projectName || projectId ? "Project: " + [projectName, projectId ? "(" + projectId + ")" : ""].filter(Boolean).join(" ") : "",
  		            "Task ID: " + normalizedTask.id,
  		            "Ticket: " + ticketNumber,
  		            "Title: " + (normalizedTask.title || "Untitled Task"),
  		            "Type: " + getPlaygroundTaskTypeLabel(normalizedTask.taskType),
  	            "Status: " + getPlaygroundTaskStatusLabel(normalizedTask.status),
  	            "Priority: " + getPlaygroundTaskPriorityLabel(normalizedTask.priority),
  	            "Assignee: " + getWelcomeWidgetTaskAssigneeName(normalizedTask),
  			            "Review: " + reviewerName,
  			            "Environment: " + getWelcomeWidgetTaskEnvironmentName(normalizedTask),
  				            projectStrategySection,
  				            projectRulesSection,
  				            projectResourcesSection,
  				            [
  	              "Execution expectations:",
  	              "- The project id and task id above are authoritative. Do not list projects or tasks just to discover this ticket.",
  	              "- Use Task Management, Computer Agents, filesystem, browser, or shell tools only when the ticket cannot be completed from the provided title, description, attachments, and comments.",
  	              directResponseTask ? "- This is a response-only ticket. Reply directly, do not call tools, do not inspect projects/tasks, do not update task status, and obey wording constraints such as nothing more." : "",
  	              "- If the ticket creates or changes deployable web apps, functions, databases, or integrations, deploy and smoke-test the affected resource unless the ticket explicitly excludes deployment.",
  	              "- If you need user-owned inputs such as API keys, credentials, billing decisions, repository access, or product decisions, create a focused human-assigned resource request ticket instead of guessing.",
  	              "- Do not update this ticket's own status directly. The platform will move it to In Review or Finished after the run. Only update subtasks, add comments, or create resource-request tickets when that is genuinely part of the work.",
  	              independentReviewerId ? "- When implementation is complete, leave the ticket ready for the configured reviewer; do not perform the review yourself." : "",
  		            ].filter(Boolean).join(newline),
  	            normalizedTask.description
                ? "Description:" + newline + normalizedTask.description
                : "Description:" + newline + "None provided.",
              subtasksSection,
              taskAttachmentsSection,
              projectAttachmentsSection,
            ].filter(Boolean).join(paragraphBreak));
          }
  
          async function handleWelcomeWidgetToggleTaskDone(taskRecord, event) {
            event?.stopPropagation?.();
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            const normalizedTaskId = String(normalizedTask.id || "").trim();
            if (!normalizedTaskId) {
              return;
            }
  
            setWelcomeWidgetBusyTaskIds((current) => current.includes(normalizedTaskId) ? current : current.concat(normalizedTaskId));
            try {
              const updatedTask = await patchWelcomeWidgetTaskRecord(normalizedTask, {
                status: normalizedTask.status === "done" ? "todo" : "done",
                completedAt: normalizedTask.status === "done" ? null : new Date().toISOString(),
              });
              updateWelcomeWidgetTaskLocally(updatedTask);
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Failed to update task.");
            } finally {
              setWelcomeWidgetBusyTaskIds((current) => current.filter((taskId) => taskId !== normalizedTaskId));
            }
          }
  
          async function handleWelcomeWidgetStartTaskThread(taskRecord, event) {
            event?.stopPropagation?.();
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            const normalizedTaskId = String(normalizedTask.id || "").trim();
            if (!normalizedTaskId || isPlaygroundHumanAssigneeId(normalizedTask.assigneeAgentId) || isWelcomeWidgetTaskLaunchLocked(normalizedTask)) {
              return;
            }
            if (!hasRealAccess) {
              handleSignInWithComputerAgents();
              return;
            }
  
            const taskPreview = buildWelcomeWidgetTaskPreview(normalizedTask);
            setWelcomeWidgetBusyTaskIds((current) => current.includes(normalizedTaskId) ? current : current.concat(normalizedTaskId));
            applyTaskRunState({
              taskId: normalizedTaskId,
              projectId: taskPreview.projectId || "",
  	            ticketNumber: taskPreview.ticketNumber || "",
  	            title: taskPreview.title || normalizedTask.title || "Untitled Task",
  	            runKind: "implementation",
  	            reviewRequired: normalizedTask.reviewRequired === true,
  	            reviewerAgentId: normalizedTask.reviewerAgentId || "",
  	            phase: "starting",
  	          });
  
            try {
              const enabledSkillsPayload = await buildWelcomeWidgetEnabledSkillsPayload(normalizedTask);
              const launchConnectors = mergePlaygroundTaskConnectorSelections(welcomeWidgetProject?.connectors, normalizedTask.connectors);
              const launchEnvironmentId = String(
                normalizedTask.environmentId
                || welcomeWidgetProject?.defaultEnvironmentId
                || environmentId
                || ""
              ).trim();
              const githubRepo = buildWelcomeWidgetGithubRepoReference({
                ...normalizedTask,
                connectors: launchConnectors,
              });
              const projectLaunchAttachments = normalizePlaygroundTaskAttachmentList(welcomeWidgetProject?.attachments);
              const launchPrompt = buildWelcomeWidgetTaskRunPrompt(normalizedTask, {
                projectAttachments: projectLaunchAttachments,
              });
              const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTaskId) + "/start-thread", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: taskPreview.ticketNumber + " " + taskPreview.title,
                  environmentId: launchEnvironmentId || undefined,
                  agentId: !isPlaygroundHumanAssigneeId(normalizedTask.assigneeAgentId) ? (normalizedTask.assigneeAgentId || undefined) : undefined,
                  enabledSkills: enabledSkillsPayload,
                  githubRepo: githubRepo || undefined,
                  connectors: launchConnectors,
                  launchPrompt,
                  runKind: "implementation",
                  allowAdditionalThread: true,
                  taskPreview,
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to start thread from task.");
              }
  
              const threadRecord = getPlaygroundThreadResponseRecord(data);
              const updatedTask = getPlaygroundTaskResponseRecord(data);
              if (!threadRecord?.id || !updatedTask?.id) {
                throw new Error("Task thread creation failed.");
              }
              const executionStarted = Boolean(data?.executionStarted);
  
              updateWelcomeWidgetTaskLocally(updatedTask);
              upsertRealThreadRecord(threadRecord, {
                taskPreview: buildWelcomeWidgetTaskPreview(updatedTask, threadRecord.id),
                status: "running",
              });
              if (updatedTask.environmentId || launchEnvironmentId) {
                setEnvironmentId(updatedTask.environmentId || launchEnvironmentId);
              }
              setLatestInteractedProjectId(updatedTask.projectId || welcomeWidgetsState.projectId || latestInteractedProjectId || "");
              setThreadAgentSelectionOverride(null);
              setPendingThreadRunRequest(executionStarted
                ? null
                : {
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    threadId: threadRecord.id,
                    prompt: launchPrompt,
                    attachments: [],
                    githubRepo: githubRepo || null,
                    enabledSkills: enabledSkillsPayload || null,
                    environmentId: launchEnvironmentId || "",
                  });
              setActivePage("thread");
              setCurrentThreadId(threadRecord.id);
              setContentMode("chat");
              setThreadListMode("threads");
              setChangesNavigationTarget(null);
              setRunnerRenderKey((current) => current + 1);
              applyTaskRunState({
                taskId: updatedTask.id,
                projectId: taskPreview.projectId || "",
                threadId: threadRecord.id,
                ticketNumber: taskPreview.ticketNumber || "",
                title: updatedTask.title || taskPreview.title || "Untitled Task",
                runKind: "implementation",
                reviewRequired: updatedTask.reviewRequired === true || normalizedTask.reviewRequired === true,
                reviewerAgentId: updatedTask.reviewerAgentId || normalizedTask.reviewerAgentId || "",
                phase: "running",
  	            });
              void refreshThreads(undefined, threadRecord.id);
              if (executionStarted) {
                void loadThreadGroundTruthStatus(threadRecord.id);
              }
            } catch (error) {
              applyTaskRunState({
                taskId: normalizedTaskId,
                projectId: taskPreview.projectId || "",
                ticketNumber: taskPreview.ticketNumber || "",
                title: taskPreview.title || normalizedTask.title || "Untitled Task",
                phase: "failed",
                error: error instanceof Error ? error.message : "Failed to start task thread.",
              });
              window.alert(error instanceof Error ? error.message : "Failed to start task thread.");
            } finally {
              setWelcomeWidgetBusyTaskIds((current) => current.filter((taskId) => taskId !== normalizedTaskId));
            }
          }
  
          async function handleWelcomeComposerProjectTaskSubmit(payload) {
            const normalizedTaskId = String(payload?.taskPreview?.taskId || selectedWelcomeComposerTaskId || "").trim();
            const userPrompt = String(payload?.prompt || "").trim();
            if (!normalizedTaskId || !userPrompt) {
              return false;
            }
            const normalizedCasualPrompt = userPrompt
              .replace(/[.!?\s]+$/g, "")
              .trim()
              .toLowerCase();
            if (["hi", "hello", "hey", "hallo", "moin"].includes(normalizedCasualPrompt)) {
              setSelectedWelcomeComposerTaskId("");
              return false;
            }
  
            const normalizedTask = normalizePlaygroundTaskRecord(
              (Array.isArray(welcomeWidgetsState.tasks) ? welcomeWidgetsState.tasks : [])
                .find((task) => String(task?.id || "").trim() === normalizedTaskId)
            );
            if (!normalizedTask?.id) {
              throw new Error("The selected project task could not be loaded.");
            }
            if (isPlaygroundHumanAssigneeId(normalizedTask.assigneeAgentId) || isWelcomeWidgetTaskLaunchLocked(normalizedTask)) {
              throw new Error("This task cannot start an agent thread yet.");
            }
            if (!hasRealAccess) {
              handleSignInWithComputerAgents();
              return true;
            }
  
            const taskPreview = {
              ...buildWelcomeWidgetTaskPreview(normalizedTask),
              runKind: "implementation",
              showPromptPreview: true,
            };
            setWelcomeWidgetBusyTaskIds((current) => current.includes(normalizedTaskId) ? current : current.concat(normalizedTaskId));
            applyTaskRunState({
              taskId: normalizedTaskId,
              projectId: taskPreview.projectId || "",
              ticketNumber: taskPreview.ticketNumber || "",
              title: taskPreview.title || normalizedTask.title || "Untitled Task",
              runKind: "implementation",
              reviewRequired: normalizedTask.reviewRequired === true,
              reviewerAgentId: normalizedTask.reviewerAgentId || "",
              phase: "starting",
            });
  
            try {
              const enabledSkillsPayload = await buildWelcomeWidgetEnabledSkillsPayload(normalizedTask);
              const launchConnectors = mergePlaygroundTaskConnectorSelections(welcomeWidgetProject?.connectors, normalizedTask.connectors);
              const launchEnvironmentId = String(
                normalizedTask.environmentId
                || welcomeWidgetProject?.defaultEnvironmentId
                || payload?.environmentId
                || environmentId
                || ""
              ).trim();
              const githubRepo = buildWelcomeWidgetGithubRepoReference({
                ...normalizedTask,
                connectors: launchConnectors,
              }) || payload?.githubRepo || null;
              const projectLaunchAttachments = normalizePlaygroundTaskAttachmentList(welcomeWidgetProject?.attachments);
              const taskRunPrompt = buildWelcomeWidgetTaskRunPrompt(normalizedTask, {
                projectAttachments: projectLaunchAttachments,
              });
              const launchPrompt = [
                taskRunPrompt,
                "User message:" + String.fromCharCode(10) + userPrompt,
              ].filter(Boolean).join(String.fromCharCode(10) + String.fromCharCode(10));
              const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTaskId) + "/start-thread", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: taskPreview.ticketNumber + " " + taskPreview.title,
                  environmentId: launchEnvironmentId || undefined,
                  agentId: !isPlaygroundHumanAssigneeId(normalizedTask.assigneeAgentId)
                    ? (normalizedTask.assigneeAgentId || payload?.agentId || undefined)
                    : undefined,
                  enabledSkills: enabledSkillsPayload,
                  githubRepo: githubRepo || undefined,
                  connectors: launchConnectors,
                  attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
                  launchPrompt,
                  runKind: "implementation",
                  allowAdditionalThread: true,
                  taskPreview,
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to start thread from task.");
              }
  
              const threadRecord = getPlaygroundThreadResponseRecord(data);
              const updatedTask = getPlaygroundTaskResponseRecord(data);
              if (!threadRecord?.id || !updatedTask?.id) {
                throw new Error("Task thread creation failed.");
              }
              const executionStarted = Boolean(data?.executionStarted);
              const threadTaskPreview = {
                ...buildWelcomeWidgetTaskPreview(updatedTask, threadRecord.id),
                runKind: "implementation",
                showPromptPreview: true,
              };
  
              updateWelcomeWidgetTaskLocally(updatedTask);
              upsertRealThreadRecord(threadRecord, {
                taskPreview: threadTaskPreview,
                status: "running",
              });
              upsertThreadTaskPreview(threadRecord.id, threadTaskPreview);
              if (updatedTask.environmentId || launchEnvironmentId) {
                setEnvironmentId(updatedTask.environmentId || launchEnvironmentId);
              }
              setLatestInteractedProjectId(updatedTask.projectId || welcomeWidgetsState.projectId || latestInteractedProjectId || "");
              setSelectedWelcomeComposerTaskId("");
              setThreadAgentSelectionOverride(null);
              setPendingThreadRunRequest(executionStarted
                ? null
                : {
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    threadId: threadRecord.id,
                    prompt: launchPrompt,
                    displayPrompt: userPrompt,
                    agentId: normalizedTask.assigneeAgentId || payload?.agentId || null,
                    agentName: payload?.agentName || null,
                    attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
                    githubRepo: githubRepo || null,
                    enabledSkills: enabledSkillsPayload || null,
                    environmentId: launchEnvironmentId || "",
                    quotedSelection: payload?.quotedSelection || null,
                  });
              setActivePage("thread");
              setCurrentThreadId(threadRecord.id);
              setContentMode("chat");
              setThreadListMode("threads");
              setChangesNavigationTarget(null);
              setRunnerRenderKey((current) => current + 1);
              applyTaskRunState({
                taskId: updatedTask.id,
                projectId: threadTaskPreview.projectId || "",
                threadId: threadRecord.id,
                ticketNumber: threadTaskPreview.ticketNumber || "",
                title: updatedTask.title || threadTaskPreview.title || "Untitled Task",
                runKind: "implementation",
                reviewRequired: updatedTask.reviewRequired === true || normalizedTask.reviewRequired === true,
                reviewerAgentId: updatedTask.reviewerAgentId || normalizedTask.reviewerAgentId || "",
                phase: "running",
              });
              void refreshThreads(undefined, threadRecord.id);
              if (executionStarted) {
                void loadThreadGroundTruthStatus(threadRecord.id);
              }
              return true;
            } catch (error) {
              applyTaskRunState({
                taskId: normalizedTaskId,
                projectId: taskPreview.projectId || "",
                ticketNumber: taskPreview.ticketNumber || "",
                title: taskPreview.title || normalizedTask.title || "Untitled Task",
                phase: "failed",
                error: error instanceof Error ? error.message : "Failed to start task thread.",
              });
              throw error;
            } finally {
              setWelcomeWidgetBusyTaskIds((current) => current.filter((taskId) => taskId !== normalizedTaskId));
            }
          }
  
          function handleOpenWelcomeDailyBriefingPreview(event) {
            event?.stopPropagation?.();
            setSidebarOpen(false);
            setThreadTaskOpenRequest(null);
            setThreadSubagentDetailOpen(false);
            setThreadPreviewAttachment({
              id: "welcome-daily-briefing",
              filename: "daily-briefing.html",
              mimeType: "text/html",
              type: "document",
              htmlPreviewUrl: "/api/aios/briefing/latest-html",
              htmlSandbox: null,
            });
          }
  
          function handleOpenWelcomeWidgetTaskDetail(taskRecord, event) {
            event?.stopPropagation?.();
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            const normalizedTaskId = String(normalizedTask.id || "").trim();
            const normalizedProjectId = String(normalizedTask.projectId || welcomeWidgetsState.projectId || "").trim();
            if (!normalizedTaskId || !normalizedProjectId) {
              return;
            }
            if (!hasRealAccess) {
              handleSignInWithComputerAgents();
              return;
            }
            setThreadTaskOpenRequest({
              projectId: normalizedProjectId,
              taskId: normalizedTaskId,
              threadId: activeRunnerThreadId || currentThreadId || "",
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
          }
  
          function openAiosAppPage() {
            window.open(${JSON.stringify(platformOrigin)}, "_blank", "noopener,noreferrer");
          }
  
          function buildProfileDraftFromSession() {
            return {
              displayName: getTrustedDisplayName(sessionState.displayName, sessionState.email || ""),
              email: sessionState.email || "",
              photoURL: canRenderAvatarImage(sessionState.photoURL) ? sessionState.photoURL : "",
            };
          }
  
          function openProfileEditor() {
            setAccountMenuOpen(false);
            setProfileSaveState({ status: "idle", error: "" });
            setProfileDraft(buildProfileDraftFromSession());
            setProfileEditorAvatarBroken(false);
            setProfileEditorOpen(true);
          }
  
          function handleProfileEditorClose() {
            setProfileEditorOpen(false);
            setProfileEditorAvatarBroken(false);
            setProfileSaveState({ status: "idle", error: "" });
          }
  
          async function handleProfilePhotoSelection(event) {
            const file = event.target.files && event.target.files[0];
            event.target.value = "";
  
            if (!file) {
              return;
            }
  
            try {
              const photoURL = await createProfilePhotoDataUrl(file);
              setProfileEditorAvatarBroken(false);
              setProfileDraft((current) => ({
                ...current,
                photoURL,
              }));
              setProfileSaveState({ status: "idle", error: "" });
            } catch (error) {
              setProfileSaveState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to prepare selected image.",
              });
            }
          }
  
          function handleProfilePhotoRemove() {
            setProfileEditorAvatarBroken(false);
            setProfileDraft((current) => ({
              ...current,
              photoURL: "",
            }));
            setProfileSaveState({ status: "idle", error: "" });
          }
  
          async function saveProfileDraft(closeEditorOnSuccess = false) {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            setProfileSaveState({ status: "saving", error: "" });
  
            try {
              const response = await fetch("/api/aios/user/profile", {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  displayName: profileDraft.displayName,
                  photoURL: profileDraft.photoURL,
                }),
              });
  
              const data = await response.json().catch(() => ({}));
              if (response.status === 401 || response.status === 403) {
                handleSignInWithComputerAgents();
                return;
              }
  
              if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to save profile.");
              }
  
              const payloadIdentity = extractSessionIdentityFromPayload(data);
              const nextDisplayName = payloadIdentity.displayName || profileDraft.displayName;
              const nextPhotoURL = payloadIdentity.photoURL || profileDraft.photoURL;
  
              setSessionState((current) => ({
                ...current,
                displayName: nextDisplayName,
                photoURL: nextPhotoURL,
                emailVerified: typeof data.emailVerified === "boolean" ? data.emailVerified : current.emailVerified,
              }));
              setProfileDraft((current) => ({
                ...current,
                displayName: nextDisplayName,
                photoURL: nextPhotoURL,
              }));
              if (closeEditorOnSuccess) {
                setProfileEditorOpen(false);
                setProfileEditorAvatarBroken(false);
                setProfileSaveState({ status: "idle", error: "" });
              } else {
                setProfileSaveState({ status: "success", error: "" });
                window.setTimeout(() => {
                  setProfileSaveState((current) => current.status === "success" ? { status: "idle", error: "" } : current);
                }, 3000);
              }
              void refreshSessionState();
            } catch (error) {
              setProfileSaveState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to save profile.",
              });
            }
          }
  
          async function handleProfileSave() {
            await saveProfileDraft(true);
          }
  
          function encodeGithubFolderSegment(value) {
            return encodeURIComponent(String(value || "").trim());
          }
  
          function decodeGithubFolderSegment(value) {
            try {
              return decodeURIComponent(String(value || ""));
            } catch {
              return String(value || "");
            }
          }
  
          function createGithubRepoFolderId(repoFullName, ref) {
            return "github-repo:" + encodeGithubFolderSegment(repoFullName) + ":" + encodeGithubFolderSegment(ref || "");
          }
  
          function createGithubNodeId(repoFullName, path, ref) {
            return "github-node:" + encodeGithubFolderSegment(repoFullName) + ":" + encodeGithubFolderSegment(ref || "") + ":" + encodeGithubFolderSegment(path || "");
          }
  
          function parseGithubFolderId(folderId) {
            if (!folderId || folderId === "root") {
              return { repoFullName: "", path: "", ref: "", isRoot: true };
            }
  
            if (folderId.startsWith("github-repo:")) {
              const value = folderId.slice("github-repo:".length);
              const separatorIndex = value.indexOf(":");
              if (separatorIndex === -1) {
                return {
                  repoFullName: value,
                  path: "",
                  ref: "",
                  isRoot: false,
                };
              }
              return {
                repoFullName: decodeGithubFolderSegment(value.slice(0, separatorIndex)),
                path: "",
                ref: decodeGithubFolderSegment(value.slice(separatorIndex + 1)),
                isRoot: false,
              };
            }
  
            if (folderId.startsWith("github-node:")) {
              const value = folderId.slice("github-node:".length);
              const firstSeparatorIndex = value.indexOf(":");
              if (firstSeparatorIndex === -1) {
                return { repoFullName: value, path: "", ref: "", isRoot: false };
              }
              const secondSeparatorIndex = value.indexOf(":", firstSeparatorIndex + 1);
              if (secondSeparatorIndex === -1) {
                return {
                  repoFullName: value.slice(0, firstSeparatorIndex),
                  path: value.slice(firstSeparatorIndex + 1),
                  ref: "",
                  isRoot: false,
                };
              }
              return {
                repoFullName: decodeGithubFolderSegment(value.slice(0, firstSeparatorIndex)),
                path: decodeGithubFolderSegment(value.slice(secondSeparatorIndex + 1)),
                ref: decodeGithubFolderSegment(value.slice(firstSeparatorIndex + 1, secondSeparatorIndex)),
                isRoot: false,
              };
            }
  
            return { repoFullName: "", path: "", ref: "", isRoot: true };
          }
  
          const refreshSessionState = useCallback(async function refreshSessionState() {
            if (isDemoMode) {
              setSessionStreamingConfig({
                status: "idle",
                apiKey: "",
                backendUrl: "",
                error: "",
              });
              setSessionState({
                status: "unauthenticated",
                userId: "",
                email: "demo@computer-agents.com",
                projectId: "",
                displayName: "Demo User",
                photoURL: "",
                emailVerified: false,
                subscriptionTier: "enterprise",
                subscriptionStatus: "active",
                onboardingCompleted: null,
                error: "",
              });
              return;
            }
  
            setSessionState((current) => ({
              ...current,
              status: "loading",
              error: "",
            }));
            setSessionStreamingConfig((current) => ({
              ...current,
              status: "loading",
              error: "",
            }));
  
            let firebaseIdentity = null;
            try {
              try {
                await syncFirebaseSessionCookieFromCurrentUser(false);
                firebaseIdentity = await lookupFirebaseSessionIdentity();
              } catch {
                firebaseIdentity = null;
              }
  
              if (firebaseIdentity) {
                setSessionState((current) => ({
                  ...current,
                  userId: firebaseIdentity.userId || current.userId || "",
                  email: firebaseIdentity.email || current.email || "",
                  projectId: current.projectId || "",
                  displayName: firebaseIdentity.displayName || current.displayName || "",
                  photoURL: firebaseIdentity.photoURL || current.photoURL || "",
                  emailVerified:
                    typeof firebaseIdentity.emailVerified === "boolean"
                      ? firebaseIdentity.emailVerified
                      : current.emailVerified,
                  subscriptionTier: current.subscriptionTier || "sandbox",
                  subscriptionStatus: current.subscriptionStatus || "",
                  error: "",
                }));
              }
  
              const loadSession = () => fetchJsonWithTimeout("/api/aios/user/session", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              }, 20000);
  
              let { response, data } = await loadSession();
  
              if (isUnauthorizedStatus(response.status)) {
                const refreshedCookie = await syncFirebaseSessionCookieFromCurrentUser(true);
                if (refreshedCookie) {
                  const retriedResult = await loadSession();
                  response = retriedResult.response;
                  data = retriedResult.data;
                }
              }
  
              if (isUnauthorizedStatus(response.status)) {
                triggerPlatformSessionRecovery();
                return;
              }
  
              if (!response.ok) {
                if (firebaseIdentity) {
                  setSessionStreamingConfig({
                    status: "idle",
                    apiKey: "",
                    backendUrl: "",
                    error: "",
                  });
                  return;
                }
                setSessionStreamingConfig({
                  status: "error",
                  apiKey: "",
                  backendUrl: "",
                  error: data.message || data.error || "Failed to load runner access.",
                });
                setSessionState({
                  status: "error",
                  userId: "",
                  email: "",
                  projectId: "",
                  displayName: "",
                  photoURL: "",
                  emailVerified: false,
                  subscriptionTier: "sandbox",
                  subscriptionStatus: "",
                  onboardingCompleted: null,
                  error: data.message || data.error || "Failed to load account session.",
                });
                return;
              }
  
              const sessionBootstrapData = data && typeof data === "object" && !Array.isArray(data) ? data : {};
              const sessionProfileData = sessionBootstrapData.profile && typeof sessionBootstrapData.profile === "object" && !Array.isArray(sessionBootstrapData.profile)
                ? sessionBootstrapData.profile
                : sessionBootstrapData;
              const sessionStreamingData = sessionBootstrapData.profile && sessionBootstrapData.streaming && typeof sessionBootstrapData.streaming === "object" && !Array.isArray(sessionBootstrapData.streaming)
                ? sessionBootstrapData.streaming
                : null;
              const sessionStreamingOk = Boolean(sessionBootstrapData.profile && sessionBootstrapData.streamingOk);
              data = sessionProfileData;
  
              const payloadIdentity = extractSessionIdentityFromPayload(data);
              let nextStreamingConfig = {
                status: "error",
                apiKey: "",
                backendUrl: "",
                error: "Failed to load runner access.",
              };
              try {
                let streamingData = sessionStreamingData;
                let streamingResponseOk = sessionStreamingOk;
                if (!streamingData) {
                  const streamingResult = await fetchJsonWithTimeout("/api/aios/user/streaming-key", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                  }, 15000);
                  streamingData = streamingResult.data;
                  streamingResponseOk = streamingResult.response.ok;
                }
  
                if (!streamingResponseOk) {
                  throw new Error(streamingData?.message || streamingData?.error || "Failed to load runner access.");
                }
  
                const nextApiKey = typeof streamingData?.apiKey === "string" ? streamingData.apiKey.trim() : "";
                const nextBackendUrl = typeof streamingData?.backendUrl === "string" ? streamingData.backendUrl.trim() : "";
                if (!nextApiKey) {
                  throw new Error("Failed to load runner access.");
                }
  
                nextStreamingConfig = {
                  status: "ready",
                  apiKey: nextApiKey,
                  backendUrl: nextBackendUrl,
                  error: "",
                };
              } catch (streamingError) {
                nextStreamingConfig = {
                  status: "error",
                  apiKey: "",
                  backendUrl: "",
                  error: streamingError instanceof Error ? streamingError.message : "Failed to load runner access.",
                };
              }
  
              setSessionStreamingConfig(nextStreamingConfig);
  
              let resolvedSubscriptionTier = typeof data.subscription?.tier === "string" ? data.subscription.tier : "sandbox";
              let resolvedSubscriptionStatus = typeof data.subscription?.status === "string" ? data.subscription.status : "";
              try {
                const budgetHeaders = {
                  ...(nextStreamingConfig.status === "ready" && nextStreamingConfig.apiKey
                    ? { "X-API-Key": nextStreamingConfig.apiKey }
                    : {}),
                  "X-Runner-Upstream-Url": resolvedUpstreamUrl,
                };
                const budgetResponse = await fetch(proxyBackendBase + "/billing/budget", {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: budgetHeaders,
                });
                const budgetData = await budgetResponse.json().catch(() => ({}));
                if (budgetResponse.ok) {
                  setSettingsBudgetStatus(budgetData);
                  sessionBudgetSyncKeyRef.current = [
                    typeof data.userId === "string" ? data.userId : "",
                    nextStreamingConfig.status === "ready" && nextStreamingConfig.apiKey
                      ? nextStreamingConfig.apiKey
                      : SESSION_API_KEY_SENTINEL,
                    resolvedUpstreamUrl,
                  ].join(":");
                  const resolvedBudgetPlanId = String(
                    budgetData?.planId
                    || budgetData?.organizationPlan?.id
                    || budgetData?.tier
                    || ""
                  ).trim();
                  if (resolvedBudgetPlanId) {
                    resolvedSubscriptionTier = resolvedBudgetPlanId;
                  }
                  if (typeof budgetData?.subscriptionStatus === "string") {
                    resolvedSubscriptionStatus = budgetData.subscriptionStatus;
                  }
                }
              } catch {}
  
              setSessionState({
                status: "authenticated",
                userId: typeof data.userId === "string" ? data.userId : "",
                email: firebaseIdentity?.email || payloadIdentity.email || "",
                projectId: typeof data.profile?.projectId === "string" ? data.profile.projectId : "",
                displayName: firebaseIdentity?.displayName || payloadIdentity.displayName || "",
                photoURL: firebaseIdentity?.photoURL || payloadIdentity.photoURL || "",
                emailVerified:
                  typeof firebaseIdentity?.emailVerified === "boolean"
                    ? firebaseIdentity.emailVerified
                    : (typeof payloadIdentity.emailVerified === "boolean" ? payloadIdentity.emailVerified : !!data.emailVerified),
                subscriptionTier: resolvedSubscriptionTier,
                subscriptionStatus: resolvedSubscriptionStatus,
                onboardingCompleted: typeof data?.onboardingCompleted === "boolean" ? data.onboardingCompleted : null,
                error: "",
              });
            } catch (error) {
              const fallbackErrorMessage = error && typeof error === "object" && error.name === "AbortError"
                ? "Session check timed out. Retry or sign in again."
                : (error instanceof Error ? error.message : "Failed to load account session.");
  
              if (firebaseIdentity) {
                setSessionStreamingConfig({
                  status: "error",
                  apiKey: "",
                  backendUrl: "",
                  error: fallbackErrorMessage,
                });
                setSessionState((current) => ({
                  ...current,
                  status: "authenticated",
                  userId: firebaseIdentity.userId || current.userId || "",
                  email: firebaseIdentity.email || current.email || "",
                  projectId: current.projectId || "",
                  displayName: firebaseIdentity.displayName || current.displayName || "",
                  photoURL: firebaseIdentity.photoURL || current.photoURL || "",
                  emailVerified:
                    typeof firebaseIdentity.emailVerified === "boolean"
                      ? firebaseIdentity.emailVerified
                      : current.emailVerified,
                  subscriptionTier: current.subscriptionTier || "sandbox",
                  subscriptionStatus: current.subscriptionStatus || "",
                  onboardingCompleted: current.onboardingCompleted,
                  error: "",
                }));
                return;
              }
  
              setSessionStreamingConfig({
                status: "error",
                apiKey: "",
                backendUrl: "",
                error: fallbackErrorMessage,
              });
              setSessionState({
                status: "error",
                userId: "",
                email: "",
                projectId: "",
                displayName: "",
                photoURL: "",
                emailVerified: false,
                subscriptionTier: "sandbox",
                subscriptionStatus: "",
                onboardingCompleted: null,
                error: fallbackErrorMessage,
              });
            }
          }, [isDemoMode, triggerPlatformSessionRecovery]);
  
          useEffect(() => {
            if (isDemoMode) {
              explicitSignOutInProgressRef.current = false;
              authRedirectStartedRef.current = false;
              clearPlaygroundAuthRedirectState();
              return;
            }
  
            if (sessionState.status === "authenticated") {
              explicitSignOutInProgressRef.current = false;
              hasAuthenticatedSessionThisMountRef.current = true;
              authRedirectStartedRef.current = false;
              clearPlaygroundAuthRedirectState();
              writePlaygroundAuthSessionMarker({
                authenticatedAt: Date.now(),
                href: window.location.href,
              });
              return;
            }
  
            if (sessionState.status === "loading") {
              return;
            }
  
            if (explicitSignOutInProgressRef.current) {
              return;
            }
  
            if (
              (sessionState.status === "unauthenticated" || sessionState.status === "error")
              && !authRedirectStartedRef.current
            ) {
              authRedirectStartedRef.current = true;
              redirectToAiosLogin({ replace: true });
            }
          }, [isDemoMode, sessionState.status]);
  
          useEffect(() => {
            if (isDemoMode) {
              try {
                localStorage.removeItem("runner_demo_api_key");
              } catch {}
              setSessionStreamingConfig({
                status: "idle",
                apiKey: "",
                backendUrl: "",
                error: "",
              });
              setApiKey("");
              return;
            }
  
            let disposed = false;
            let unsubscribe = () => {};
  
            void (async () => {
              const auth = await ensurePlaygroundFirebaseAuth();
              if (!auth || disposed) {
                return;
              }
  
              unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
                if (disposed) {
                  return;
                }
                if (!currentUser) {
                  clearFirebaseSessionCookie();
                  return;
                }
                try {
                  const idToken = await currentUser.getIdToken();
                  if (!disposed && idToken) {
                    writeFirebaseSessionCookie(idToken);
                  }
                } catch {}
              });
            })();
  
            return () => {
              disposed = true;
              unsubscribe();
            };
          }, [isDemoMode]);
  
          async function handlePlatformEmailSignIn(event) {
            if (event?.preventDefault) {
              event.preventDefault();
            }
            const email = String(platformAuthForm.email || "").trim();
            const password = String(platformAuthForm.password || "");
            if (!email || !password) {
              setPlatformAuthError("Email and password are required.");
              return;
            }
  
            setPlatformAuthBusy("password");
            setPlatformAuthError("");
            try {
              const auth = await ensurePlaygroundFirebaseAuth();
              if (!auth) {
                throw new Error("Firebase authentication is not configured for this environment.");
              }
              const result = await signInWithEmailAndPassword(auth, email, password);
              const idToken = await result.user.getIdToken(true);
              writeFirebaseSessionCookie(idToken);
              clearPlaygroundAuthRedirectState();
              writePlaygroundAuthSessionMarker({
                authenticatedAt: Date.now(),
                href: window.location.href,
              });
              await refreshSessionState();
            } catch (error) {
              const fallbackMessage = error instanceof Error ? error.message : "Failed to sign in.";
              const mappedMessage = mapFirebaseAuthErrorMessage(error?.code || error?.message, fallbackMessage);
              setPlatformAuthError(mappedMessage || fallbackMessage);
            } finally {
              setPlatformAuthBusy("");
            }
          }
  
          async function handlePlatformGoogleSignIn() {
            setPlatformAuthBusy("google");
            setPlatformAuthError("");
            try {
              const auth = await ensurePlaygroundFirebaseAuth();
              if (!auth) {
                throw new Error("Firebase authentication is not configured for this environment.");
              }
              const provider = new GoogleAuthProvider();
              const result = await signInWithPopup(auth, provider);
              const idToken = await result.user.getIdToken(true);
              writeFirebaseSessionCookie(idToken);
              clearPlaygroundAuthRedirectState();
              writePlaygroundAuthSessionMarker({
                authenticatedAt: Date.now(),
                href: window.location.href,
              });
              await refreshSessionState();
            } catch (error) {
              const fallbackMessage = error instanceof Error ? error.message : "Failed to sign in with Google.";
              const mappedMessage = mapFirebaseAuthErrorMessage(error?.code || error?.message, fallbackMessage);
              if (
                String(error?.code || "").includes("auth/unauthorized-domain")
                || String(error?.message || "").includes("auth/unauthorized-domain")
              ) {
                setPlatformAuthError("Google sign-in is not enabled for platform.computer-agents.com yet. Add this domain to Firebase Auth authorized domains or sign in with email and password.");
              } else {
                setPlatformAuthError(mappedMessage || fallbackMessage);
              }
            } finally {
              setPlatformAuthBusy("");
            }
          }
  
          async function refreshGithubStatus(options = {}) {
            const { clearPendingOnFailure = false } = options;
            try {
              const response = await fetch("/api/aios/github/user", {
                method: "GET",
                credentials: "include",
              });
  
              if (!response.ok) {
                setGithubStatus({ connected: false });
                if (clearPendingOnFailure) {
                  removePendingStatusIndicatorId("github");
                }
                return;
              }
  
              const data = await response.json();
              setGithubStatus({ connected: !!data.connected, profile: data.profile });
            } catch {
              setGithubStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("github");
              }
            }
          }
  
          async function refreshGoogleDriveStatus(options = {}) {
            const { clearPendingOnFailure = false } = options;
            try {
              const response = await fetch("/api/aios/google-drive/user", {
                method: "GET",
                credentials: "include",
              });
  
              if (!response.ok) {
                setGoogleDriveStatus({ connected: false });
                if (clearPendingOnFailure) {
                  removePendingStatusIndicatorId("google-drive");
                }
                return;
              }
  
              const data = await response.json();
              setGoogleDriveStatus({ connected: !!data.connected, profile: data.profile });
            } catch {
              setGoogleDriveStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("google-drive");
              }
            }
          }
  
          async function refreshOneDriveStatus(options = {}) {
            const { clearPendingOnFailure = false } = options;
            try {
              const response = await fetch("/api/aios/onedrive/user", {
                method: "GET",
                credentials: "include",
              });
  
              if (!response.ok) {
                setOneDriveStatus({ connected: false });
                if (clearPendingOnFailure) {
                  removePendingStatusIndicatorId("one-drive");
                }
                return;
              }
  
              const data = await response.json();
              setOneDriveStatus({ connected: !!data.connected, profile: data.profile });
            } catch {
              setOneDriveStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("one-drive");
              }
            }
          }
  
          async function refreshGmailStatus(options = {}) {
            const { clearPendingOnFailure = false } = options;
            try {
              const response = await fetch("/api/aios/gmail/user", {
                method: "GET",
                credentials: "include",
              });
  
              if (!response.ok) {
                setGmailStatus({ connected: false });
                if (clearPendingOnFailure) {
                  removePendingStatusIndicatorId("gmail");
                }
                return;
              }
  
              const data = await response.json();
              setGmailStatus({ connected: !!data.connected, profile: data.profile });
            } catch {
              setGmailStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("gmail");
              }
            }
          }
  
          async function refreshNotionStatus(options = {}) {
            const { clearPendingOnFailure = false } = options;
            try {
              const response = await fetch("/api/aios/notion/user", {
                method: "GET",
                credentials: "include",
              });
  
              if (!response.ok) {
                setNotionStatus({ connected: false });
                if (clearPendingOnFailure) {
                  removePendingStatusIndicatorId("notion");
                }
                return;
              }
  
              const data = await response.json();
              setNotionStatus({
                connected: !!data.connected,
                profile: {
                  ...(data.profile || {}),
                  workspaceName: data.workspace?.name || "",
                },
              });
            } catch {
              setNotionStatus({ connected: false });
              if (clearPendingOnFailure) {
                removePendingStatusIndicatorId("notion");
              }
            }
          }
  
          const loadSettingsEmailStatus = useCallback(async function loadSettingsEmailStatus() {
            if (!hasSessionAuth) {
              setSettingsEmailStatus({ linked: false, email: null, verified: false });
              return;
            }
  
            setSettingsEmailLoading(true);
  
            try {
              const response = await fetch("/api/aios/user/email", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to load email status");
              }
  
              setSettingsEmailStatus(data);
            } catch (error) {
              setSettingsEmailError(error instanceof Error ? error.message : "Failed to load email status");
            } finally {
              setSettingsEmailLoading(false);
            }
          }, [hasSessionAuth]);
  
          const loadSettingsDiscordStatus = useCallback(async function loadSettingsDiscordStatus() {
            if (!hasSessionAuth) {
              setSettingsDiscordStatus({ linked: false, discordId: null, discordUsername: null, verified: false });
              return;
            }
  
            setSettingsDiscordLoading(true);
  
            try {
              const response = await fetch("/api/aios/user/discord", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to load Discord status");
              }
  
              setSettingsDiscordStatus(data);
            } catch (error) {
              setSettingsDiscordError(error instanceof Error ? error.message : "Failed to load Discord status");
            } finally {
              setSettingsDiscordLoading(false);
            }
          }, [hasSessionAuth]);
  
          const loadSettingsTelegramStatus = useCallback(async function loadSettingsTelegramStatus() {
            if (!hasSessionAuth) {
              setSettingsTelegramStatus({ linked: false, telegramId: null, telegramUsername: null, verified: false });
              return;
            }
  
            setSettingsTelegramLoading(true);
  
            try {
              const response = await fetch("/api/aios/user/telegram", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to load Telegram status");
              }
  
              setSettingsTelegramStatus(data);
            } catch (error) {
              setSettingsTelegramError(error instanceof Error ? error.message : "Failed to load Telegram status");
            } finally {
              setSettingsTelegramLoading(false);
            }
          }, [hasSessionAuth]);
  
          function getConnectorStatusRefresh(provider) {
            const normalizedProvider = getPlaygroundIntegrationProvider(provider);
            if (normalizedProvider === "github") {
              return refreshGithubStatus;
            }
            if (normalizedProvider === "notion") {
              return refreshNotionStatus;
            }
            if (normalizedProvider === "google-drive") {
              return refreshGoogleDriveStatus;
            }
            if (normalizedProvider === "one-drive") {
              return refreshOneDriveStatus;
            }
            if (normalizedProvider === "gmail") {
              return refreshGmailStatus;
            }
            return null;
          }
  
          function isConnectorStatusConnected(provider) {
            const normalizedProvider = getPlaygroundIntegrationProvider(provider);
            if (normalizedProvider === "github") {
              return Boolean(githubStatus.connected);
            }
            if (normalizedProvider === "notion") {
              return Boolean(notionStatus.connected);
            }
            if (normalizedProvider === "google-drive") {
              return Boolean(googleDriveStatus.connected);
            }
            if (normalizedProvider === "one-drive") {
              return Boolean(oneDriveStatus.connected);
            }
            if (normalizedProvider === "gmail") {
              return Boolean(gmailStatus.connected);
            }
            return false;
          }
  
          function refreshConnectorStatusAfterRedirect(provider) {
            const refreshStatus = getConnectorStatusRefresh(provider);
            if (typeof refreshStatus !== "function") {
              return;
            }
            void refreshStatus({ clearPendingOnFailure: true });
            window.setTimeout(() => {
              void refreshStatus();
            }, 900);
          }
  
          function buildProjectConnectorBrowserAuthState(provider, options = {}) {
            const normalizedProvider = getPlaygroundIntegrationProvider(provider);
            const connectorBrowserContext = options?.connectorBrowser && typeof options.connectorBrowser === "object" && !Array.isArray(options.connectorBrowser)
              ? options.connectorBrowser
              : null;
            const connectorBrowserSource = getPlaygroundTaskConnectorSource(connectorBrowserContext?.source) || normalizedProvider;
            const connectorBrowserMode =
              connectorBrowserContext?.mode === "project"
                ? "project"
                : connectorBrowserContext?.mode === "project-composer"
                  ? "project-composer"
                  : connectorBrowserContext?.mode === "task"
                    ? "task"
                    : "";
            const connectorBrowserProjectId = typeof connectorBrowserContext?.projectId === "string"
              ? connectorBrowserContext.projectId.trim()
              : "";
            const connectorBrowserView = connectorBrowserContext?.view === "overview"
              ? "overview"
              : connectorBrowserContext?.view === "calendar"
                ? "calendar"
                : "backlog";
            const projectConnectorBrowserRestoreState = connectorBrowserSource && connectorBrowserMode === "project" && connectorBrowserProjectId
              ? {
                  provider: normalizedProvider,
                  mode: connectorBrowserMode,
                  source: connectorBrowserSource,
                  projectId: connectorBrowserProjectId,
                  view: connectorBrowserView,
                  savedAt: Date.now(),
                }
              : null;
            return {
              provider: normalizedProvider,
              connectorBrowserContext,
              connectorBrowserSource,
              connectorBrowserMode,
              connectorBrowserProjectId,
              connectorBrowserView,
              projectConnectorBrowserRestoreState,
            };
          }
  
          async function handleConnectorAuthConnect(provider, loginPath, label, options = {}) {
            const authState = buildProjectConnectorBrowserAuthState(provider, options);
            const pendingId = authState.provider || provider;
            const projectComposerConnectorRestoreState = authState.connectorBrowserMode === "project-composer"
              ? normalizePlaygroundProjectComposerConnectorRestoreState({
                  provider: authState.provider,
                  mode: "project-composer",
                  source: authState.connectorBrowserSource,
                  projectComposerMode: options?.projectComposerMode === "edit" ? "edit" : "create",
                  projectDraft: options?.projectDraft,
                  savedAt: Date.now(),
                })
              : null;
            try {
              console.info("[connector-debug] connector auth connect requested", {
                provider: authState.provider,
                label,
                connectorBrowserContext: authState.connectorBrowserContext,
                connectorBrowserSource: authState.connectorBrowserSource,
                connectorBrowserMode: authState.connectorBrowserMode,
                connectorBrowserProjectId: authState.connectorBrowserProjectId,
                connectorBrowserView: authState.connectorBrowserView,
                hasProjectConnectorBrowserRestoreState: Boolean(authState.projectConnectorBrowserRestoreState),
                activePage,
                settingsSection,
              });
              if (authState.projectConnectorBrowserRestoreState) {
                console.info("[connector-debug] connector auth writing project connector restore state", authState.projectConnectorBrowserRestoreState);
                writePlaygroundConnectorBrowserRestoreState(authState.projectConnectorBrowserRestoreState);
              }
              if (projectComposerConnectorRestoreState) {
                console.info("[connector-debug] connector auth writing project composer restore state", {
                  provider: projectComposerConnectorRestoreState.provider,
                  source: projectComposerConnectorRestoreState.source,
                  projectComposerMode: projectComposerConnectorRestoreState.projectComposerMode,
                  projectId: projectComposerConnectorRestoreState.projectDraft?.id || "",
                });
                writePlaygroundProjectComposerConnectorRestoreState(projectComposerConnectorRestoreState);
              }
              addPendingStatusIndicatorId(pendingId);
              writePlaygroundIntegrationRedirectState({
                provider: authState.provider,
                savedAt: Date.now(),
                activePage,
                settingsSection,
                onboarding: options?.onboarding === true
                  ? {
                      stepIndex: Number.isFinite(Number(options?.onboardingStepIndex))
                        ? Math.max(0, Math.round(Number(options.onboardingStepIndex)))
                        : 0,
                    }
                  : null,
                connectorBrowser: authState.connectorBrowserSource && authState.connectorBrowserMode
                  ? {
                      mode: authState.connectorBrowserMode,
                      source: authState.connectorBrowserSource,
                      projectId: authState.connectorBrowserProjectId,
                      view: authState.connectorBrowserView,
                    }
                  : null,
                reopenSettingsTriggerComposer: false,
              });
              const explicitRedirectTo = typeof options?.redirectTo === "string" && options.redirectTo.trim()
                ? options.redirectTo.trim()
                : "";
              const redirectTo = explicitRedirectTo || (
                authState.projectConnectorBrowserRestoreState
                  ? (buildPlaygroundConnectorBrowserRestoreRedirectUrl(authState.projectConnectorBrowserRestoreState) || window.location.href)
                  : window.location.href
              );
              console.info("[connector-debug] connector auth redirect prepared", {
                provider: authState.provider,
                redirectTo,
                projectConnectorBrowserRestoreState: authState.projectConnectorBrowserRestoreState,
              });
              const response = await fetch(loginPath, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  redirectTo,
                }),
              });
  
              if (response.status === 401) {
                clearPlaygroundIntegrationRedirectState();
                clearPlaygroundConnectorBrowserRestoreState();
                clearPlaygroundProjectComposerConnectorRestoreState();
                handleSignInWithComputerAgents();
                return;
              }
  
              if (!response.ok) {
                removePendingStatusIndicatorId(pendingId);
                clearPlaygroundIntegrationRedirectState();
                clearPlaygroundConnectorBrowserRestoreState();
                clearPlaygroundProjectComposerConnectorRestoreState();
                const data = await response.json().catch(() => ({}));
                console.error(label + " login failed:", data.error || response.status);
                return;
              }
  
              const data = await response.json();
              if (!data.authUrl) {
                removePendingStatusIndicatorId(pendingId);
                clearPlaygroundIntegrationRedirectState();
                clearPlaygroundConnectorBrowserRestoreState();
                clearPlaygroundProjectComposerConnectorRestoreState();
                console.error(label + " auth URL is missing.");
                return;
              }
              console.info("[connector-debug] connector auth redirecting to provider", {
                provider: authState.provider,
                hasAuthUrl: Boolean(data.authUrl),
                redirectTo,
                projectConnectorBrowserRestoreState: authState.projectConnectorBrowserRestoreState,
              });
              window.location.href = data.authUrl;
            } catch (error) {
              removePendingStatusIndicatorId(pendingId);
              clearPlaygroundIntegrationRedirectState();
              clearPlaygroundConnectorBrowserRestoreState();
              clearPlaygroundProjectComposerConnectorRestoreState();
              console.error("Failed to initiate " + label + " auth:", error);
            }
          }
  
          async function handleGoogleDriveAuthConnect(options = {}) {
            return handleConnectorAuthConnect("google-drive", "/api/aios/google-drive/login", "Google Drive", options);
          }
  
          async function handleGoogleDriveAuthDisconnect() {
            await fetch("/api/aios/google-drive/disconnect", {
              method: "POST",
              credentials: "include",
            });
            removePendingStatusIndicatorId("google-drive");
            setGoogleDriveStatus({ connected: false });
            setStatusIndicatorItems((current) => current.filter((item) => item.id !== "google-drive"));
          }
  
          async function handleGithubAuthConnect(options = {}) {
            return handleConnectorAuthConnect("github", "/api/aios/github/login", "GitHub", options);
          }
  
          async function handleGithubAuthDisconnect() {
            console.info("[connector-debug] github disconnect requested", {
              githubConnected: Boolean(githubStatus.connected),
              activePage,
              selectedTasksProjectId: (() => {
                try {
                  return localStorage.getItem("runner_demo_tasks_project_scope_id") || "";
                } catch {
                  return "";
                }
              })(),
            });
            await fetch("/api/aios/github/disconnect", {
              method: "POST",
              credentials: "include",
            });
            removePendingStatusIndicatorId("github");
            clearPlaygroundIntegrationRedirectState();
            clearPlaygroundConnectorBrowserRestoreState();
            setGithubDisconnectToken(Date.now().toString(36) + Math.random().toString(36).slice(2));
            setGithubStatus({ connected: false });
            setStatusIndicatorItems((current) => current.filter((item) => item.id !== "github"));
          }
  
          async function handleOneDriveAuthConnect(options = {}) {
            return handleConnectorAuthConnect("one-drive", "/api/aios/onedrive/login", "OneDrive", options);
          }
  
          async function handleOneDriveAuthDisconnect() {
            await fetch("/api/aios/onedrive/disconnect", {
              method: "POST",
              credentials: "include",
            });
            removePendingStatusIndicatorId("one-drive");
            setOneDriveStatus({ connected: false });
            setStatusIndicatorItems((current) => current.filter((item) => item.id !== "one-drive"));
          }
  
          async function handleGmailAuthConnect(options = {}) {
            return handleConnectorAuthConnect("gmail", "/api/aios/gmail/login", "Gmail", options);
          }
  
          async function handleGmailAuthDisconnect() {
            await fetch("/api/aios/gmail/disconnect", {
              method: "POST",
              credentials: "include",
            });
            removePendingStatusIndicatorId("gmail");
            setGmailStatus({ connected: false });
            setStatusIndicatorItems((current) => current.filter((item) => item.id !== "gmail"));
          }
  
          async function handleNotionAuthConnect(options = {}) {
            return handleConnectorAuthConnect("notion", "/api/aios/notion/login", "Notion", options);
          }
  
          async function handleNotionAuthDisconnect() {
            await fetch("/api/aios/notion/disconnect", {
              method: "POST",
              credentials: "include",
            });
            removePendingStatusIndicatorId("notion");
            setNotionStatus({ connected: false });
            setNotionDatabases([]);
            setStatusIndicatorItems((current) => current.filter((item) => item.id !== "notion"));
          }
  
          async function handleSettingsLinkEmail() {
            if (!settingsEmailInput.trim()) {
              setSettingsEmailError("Please enter an email address");
              return;
            }
  
            setSettingsIsLinkingEmail(true);
            setSettingsEmailError("");
            setSettingsEmailSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/email", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: settingsEmailInput }),
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to link email");
              }
  
              if (data?.verified) {
                setSettingsEmailSuccess("Email linked and verified!");
                await loadSettingsEmailStatus();
              } else {
                setSettingsEmailSuccess("Verification code sent to your email!");
                setSettingsShowEmailVerificationInput(true);
                await loadSettingsEmailStatus();
              }
            } catch (error) {
              setSettingsEmailError(error instanceof Error ? error.message : "Failed to link email");
            } finally {
              setSettingsIsLinkingEmail(false);
            }
          }
  
          async function handleSettingsVerifyEmailCode() {
            if (!settingsEmailVerificationCodeInput.trim()) {
              setSettingsEmailError("Please enter the verification code");
              return;
            }
  
            setSettingsIsVerifyingEmail(true);
            setSettingsEmailError("");
            setSettingsEmailSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/email", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verificationCode: settingsEmailVerificationCodeInput }),
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to verify code");
              }
  
              setSettingsEmailSuccess("Email linked successfully!");
              setSettingsShowEmailVerificationInput(false);
              setSettingsEmailVerificationCodeInput("");
              setSettingsEmailInput("");
              await loadSettingsEmailStatus();
              window.dispatchEvent(new CustomEvent("integrations-updated"));
            } catch (error) {
              setSettingsEmailError(error instanceof Error ? error.message : "Failed to verify code");
            } finally {
              setSettingsIsVerifyingEmail(false);
            }
          }
  
          async function handleSettingsUnlinkEmail() {
            if (!window.confirm("Are you sure you want to unlink your email? You will stop receiving notifications.")) {
              return;
            }
  
            setSettingsIsUnlinkingEmail(true);
            setSettingsEmailError("");
            setSettingsEmailSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/email", {
                method: "DELETE",
                credentials: "include",
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to unlink email");
              }
  
              setSettingsEmailSuccess("Email unlinked successfully");
              setSettingsEmailStatus({ linked: false, email: null, verified: false });
              setSettingsShowEmailVerificationInput(false);
              setSettingsEmailVerificationCodeInput("");
              window.dispatchEvent(new CustomEvent("integrations-updated"));
            } catch (error) {
              setSettingsEmailError(error instanceof Error ? error.message : "Failed to unlink email");
            } finally {
              setSettingsIsUnlinkingEmail(false);
            }
          }
  
          async function handleSettingsCancelEmailVerification() {
            setSettingsShowEmailVerificationInput(false);
            setSettingsEmailVerificationCodeInput("");
            setSettingsEmailInput("");
            try {
              await fetch("/api/aios/user/email", {
                method: "DELETE",
                credentials: "include",
              });
            } catch {
            }
            setSettingsEmailStatus({ linked: false, email: null, verified: false });
          }
  
          async function handleSettingsLinkDiscord() {
            setSettingsIsLinkingDiscord(true);
            setSettingsDiscordError("");
            setSettingsDiscordSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/discord", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ redirectTo: window.location.href }),
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to initiate Discord linking");
              }
  
              if (data?.oauthUrl) {
                window.location.href = data.oauthUrl;
                return;
              }
  
              throw new Error(data?.error || "No OAuth URL received");
            } catch (error) {
              setSettingsDiscordError(error instanceof Error ? error.message : "Failed to link Discord");
              setSettingsIsLinkingDiscord(false);
            }
          }
  
          async function handleSettingsUnlinkDiscord() {
            if (!window.confirm("Are you sure you want to unlink your Discord? You will no longer be able to run tasks from Discord.")) {
              return;
            }
  
            setSettingsIsUnlinkingDiscord(true);
            setSettingsDiscordError("");
            setSettingsDiscordSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/discord", {
                method: "DELETE",
                credentials: "include",
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to unlink Discord");
              }
  
              setSettingsDiscordSuccess("Discord unlinked successfully");
              setSettingsDiscordStatus({ linked: false, discordId: null, discordUsername: null, verified: false });
              window.dispatchEvent(new CustomEvent("integrations-updated"));
            } catch (error) {
              setSettingsDiscordError(error instanceof Error ? error.message : "Failed to unlink Discord");
            } finally {
              setSettingsIsUnlinkingDiscord(false);
            }
          }
  
          async function handleSettingsVerifyTelegramCode() {
            if (!settingsTelegramVerificationCode.trim()) {
              setSettingsTelegramError("Please enter a verification code");
              return;
            }
  
            setSettingsIsVerifyingTelegram(true);
            setSettingsTelegramError("");
            setSettingsTelegramSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/telegram", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: settingsTelegramVerificationCode.trim() }),
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to verify code");
              }
  
              setSettingsTelegramSuccess("Telegram linked successfully!");
              setSettingsTelegramVerificationCode("");
              await loadSettingsTelegramStatus();
              window.dispatchEvent(new CustomEvent("integrations-updated"));
            } catch (error) {
              setSettingsTelegramError(error instanceof Error ? error.message : "Failed to verify code");
            } finally {
              setSettingsIsVerifyingTelegram(false);
            }
          }
  
          async function handleSettingsUnlinkTelegram() {
            if (!window.confirm("Are you sure you want to unlink your Telegram? You will no longer be able to run tasks from Telegram.")) {
              return;
            }
  
            setSettingsIsUnlinkingTelegram(true);
            setSettingsTelegramError("");
            setSettingsTelegramSuccess("");
  
            try {
              const response = await fetch("/api/aios/user/telegram", {
                method: "DELETE",
                credentials: "include",
              });
  
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || "Failed to unlink Telegram");
              }
  
              setSettingsTelegramSuccess("Telegram unlinked successfully");
              setSettingsTelegramStatus({ linked: false, telegramId: null, telegramUsername: null, telegramFirstName: null, telegramLastName: null, verified: false });
              window.dispatchEvent(new CustomEvent("integrations-updated"));
            } catch (error) {
              setSettingsTelegramError(error instanceof Error ? error.message : "Failed to unlink Telegram");
            } finally {
              setSettingsIsUnlinkingTelegram(false);
            }
          }
  
          async function handleGoogleDriveFetchItems(folderId) {
            const response = await fetch("/api/aios/google-drive/files?folderId=" + encodeURIComponent(folderId), {
              method: "GET",
              credentials: "include",
            });
  
            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGoogleDriveStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to fetch Google Drive files");
            }
  
            return (data.files || []).map((file) => ({
              id: file.id,
              name: file.name,
              path: file.id,
              isFolder: file.isFolder || file.mimeType === "application/vnd.google-apps.folder",
              size: file.size,
              modifiedTime: file.modifiedTime,
              createdTime: file.createdTime,
              mimeType: file.mimeType,
              previewUrl: file.thumbnailLink || undefined,
            }));
          }
  
          async function handleGoogleDriveFetchFileContent(file) {
            if (!file?.id) {
              throw new Error("Missing Google Drive file metadata");
            }
  
            const response = await fetch("/api/aios/google-drive/download?fileId=" + encodeURIComponent(file.id), {
              method: "GET",
              credentials: "include",
            });
  
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGoogleDriveStatus({ connected: false });
              }
              throw new Error(data?.error || "Failed to load Google Drive file");
            }
  
            return {
              content: data?.content || "",
              mimeType: data?.mimeType || file.mimeType,
              encoding: "base64",
              name: data?.name || file.name,
            };
          }
  
          async function handleOneDriveFetchItems(folderId) {
            const response = await fetch("/api/aios/onedrive/files?folderId=" + encodeURIComponent(folderId), {
              method: "GET",
              credentials: "include",
            });
  
            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setOneDriveStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to fetch OneDrive files");
            }
  
            return (data.files || []).map((file) => ({
              id: file.id,
              name: file.name,
              path: file.id,
              isFolder: !!file.isFolder,
              size: file.size,
              modifiedTime: file.modifiedTime,
              createdTime: file.createdTime,
              mimeType: file.mimeType,
              previewUrl: file.thumbnailLink || undefined,
            }));
          }
  
          async function handleOneDriveFetchFileContent(file) {
            if (!file?.id) {
              throw new Error("Missing OneDrive file metadata");
            }
  
            const response = await fetch("/api/aios/onedrive/download?fileId=" + encodeURIComponent(file.id), {
              method: "GET",
              credentials: "include",
            });
  
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setOneDriveStatus({ connected: false });
              }
              throw new Error(data?.error || "Failed to load OneDrive file");
            }
  
            return {
              content: data?.content || "",
              mimeType: data?.mimeType || file.mimeType,
              encoding: "base64",
              name: data?.name || file.name,
            };
          }
  
          async function handleGithubFetchItems(folderId) {
            const parsedFolder = parseGithubFolderId(folderId);
  
            if (parsedFolder.isRoot) {
              const response = await fetch("/api/aios/github/repos?per_page=100", {
                method: "GET",
                credentials: "include",
              });
  
              const data = await response.json();
              if (!response.ok) {
                if (isUnauthorizedStatus(response.status)) {
                  setGithubStatus({ connected: false });
                }
                throw new Error(data.error || "Failed to fetch GitHub repositories");
              }
  
              return (data.repos || []).map((repo) => ({
                id: createGithubRepoFolderId(repo.full_name, repo.default_branch || undefined),
                name: repo.name,
                path: "",
                isFolder: true,
                repoFullName: repo.full_name,
                ref: repo.default_branch || undefined,
              }));
            }
  
            const params = new URLSearchParams();
            if (parsedFolder.path) {
              params.set("path", parsedFolder.path);
            }
            if (parsedFolder.ref) {
              params.set("ref", parsedFolder.ref);
            }
            const response = await fetch(
              "/api/aios/github/repos/" + parsedFolder.repoFullName + "/contents" + (params.toString() ? "?" + params.toString() : ""),
              {
                method: "GET",
                credentials: "include",
              }
            );
  
            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGithubStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to fetch GitHub files");
            }
  
            const items = Array.isArray(data) ? data : data.contents || [];
            return items.map((item) => ({
              id: createGithubNodeId(parsedFolder.repoFullName, item.path, data.ref || parsedFolder.ref || undefined),
              name: item.name,
              path: item.path,
              isFolder: item.type === "dir",
              size: item.size || 0,
              mimeType: undefined,
              repoFullName: parsedFolder.repoFullName,
              ref: data.ref || parsedFolder.ref || undefined,
            }));
          }
  
          async function handleGithubFetchBranches(repoFullName) {
            const response = await fetch("/api/aios/github/repos/" + repoFullName + "/branches", {
              method: "GET",
              credentials: "include",
            });
  
            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGithubStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to fetch GitHub branches");
            }
  
            return (data.branches || []).map((branch) => ({
              id: branch.name,
              name: branch.name,
            }));
          }
  
          async function handleGithubFetchFileContent(file) {
            if (!file.repoFullName || !file.path) {
              throw new Error("Missing GitHub file metadata");
            }
  
            const params = new URLSearchParams();
            params.set("path", file.path);
            if (file.ref) {
              params.set("ref", file.ref);
            }
            const response = await fetch(
              "/api/aios/github/repos/" + file.repoFullName + "/download?" + params.toString(),
              {
                method: "GET",
                credentials: "include",
              }
            );
  
            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGithubStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to load GitHub file preview");
            }
  
            return {
              content: data.content || "",
              mimeType: data.mimeType,
              encoding: data.encoding || "base64",
              name: data.name || file.name,
            };
          }
  
          async function handleGoogleDriveManageAccess() {
            const response = await fetch("/api/aios/google-drive/picker-config", {
              method: "GET",
              credentials: "include",
            });
  
            const config = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setGoogleDriveStatus({ connected: false });
              }
              throw new Error(config.error || "Failed to open Google Drive picker");
            }
  
            await openGoogleDrivePicker({
              accessToken: config.accessToken,
              apiKey: config.apiKey,
              appId: config.appId,
              multiSelect: true,
              includeFolders: true,
              selectFolderEnabled: true,
              title: "Select files to share with Testbase",
            });
          }
  
          const handleNotionFetchDatabases = useCallback(async function handleNotionFetchDatabases() {
            const response = await fetch("/api/aios/notion/databases", {
              method: "GET",
              credentials: "include",
            });
  
            const data = await response.json();
            if (!response.ok) {
              if (isUnauthorizedStatus(response.status)) {
                setNotionStatus({ connected: false });
              }
              throw new Error(data.error || "Failed to fetch Notion databases");
            }
  
            const databases = data.databases || [];
            setNotionDatabases(databases);
            return databases;
          }, []);
  
          function resetSettingsTriggerForm() {
            setSettingsTriggerForm({
              name: "",
              source: "github",
              event: getSettingsTriggerDefaultEvent("github", "send_message"),
              environmentId: resolvedEnvironmentId || "",
              agentId: resolvedPreferredAgentId || "",
              actionType: "send_message",
              message: "",
              filterRepo: "",
              filterBranch: "",
            });
          }
  
          function resizeSettingsTriggerPromptTextarea(textarea) {
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
  
          function buildSettingsMarkdownWrappedEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
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
  
          function buildSettingsMarkdownListEdit(value, selectionStart, selectionEnd) {
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
  
          function updateSettingsTriggerPromptField(nextValue) {
            setSettingsTriggerForm((current) => ({ ...current, message: nextValue }));
          }
  
          function applySettingsTriggerPromptSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            updateSettingsTriggerPromptField(nextValue);
            window.requestAnimationFrame(() => {
              const textarea = settingsTriggerPromptTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeSettingsTriggerPromptTextarea(textarea);
            });
          }
  
          function handleSettingsTriggerPromptMarkdownFormat(formatType) {
            const textarea = settingsTriggerPromptTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(settingsTriggerForm.message || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildSettingsMarkdownWrappedEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildSettingsMarkdownWrappedEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildSettingsMarkdownWrappedEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildSettingsMarkdownListEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applySettingsTriggerPromptSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function openSettingsTriggerComposer() {
            resetSettingsTriggerForm();
            setSettingsTriggersError("");
            setIsSettingsTriggerPromptEditing(false);
            setSettingsCreatingTrigger(true);
          }
  
          function openGitLabWebhookComposer() {
            resetSettingsTriggerForm();
            setSettingsTriggersError("");
            setIsSettingsTriggerPromptEditing(false);
            setSettingsTriggerForm((current) => ({
              ...current,
              source: "gitlab",
              event: getSettingsTriggerDefaultEvent("gitlab", current.actionType || "send_message"),
            }));
            setSettingsCreatingTrigger(true);
          }
  
          function closeSettingsTriggerComposer() {
            if (settingsTriggerSubmitting) {
              return;
            }
            resetSettingsTriggerForm();
            setSettingsTriggersError("");
            setIsSettingsTriggerPromptEditing(false);
            setSettingsCreatingTrigger(false);
          }
  
          const loadSettingsTriggerGithubRepos = useCallback(async function loadSettingsTriggerGithubRepos() {
            if (!githubStatus.connected) {
              setSettingsTriggerGithubRepos([]);
              setSettingsTriggerGithubReposError("");
              return [];
            }
  
            setSettingsTriggerGithubReposLoading(true);
            setSettingsTriggerGithubReposError("");
            try {
              const response = await fetch("/api/aios/github/repos?per_page=100", {
                method: "GET",
                credentials: "include",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                if (isUnauthorizedStatus(response.status)) {
                  setGithubStatus({ connected: false });
                }
                throw new Error(data?.error || "Failed to load GitHub repositories.");
              }
  
              const repos = Array.isArray(data?.repos)
                ? data.repos
                  .map((repo) => ({
                    id: String(repo?.full_name || repo?.name || ""),
                    name: String(repo?.name || repo?.full_name || ""),
                    fullName: String(repo?.full_name || repo?.name || ""),
                    defaultBranch: String(repo?.default_branch || "").trim(),
                  }))
                  .filter((repo) => repo.id)
                  .sort((left, right) => left.fullName.localeCompare(right.fullName))
                : [];
  
              setSettingsTriggerGithubRepos(repos);
              return repos;
            } catch (error) {
              setSettingsTriggerGithubRepos([]);
              setSettingsTriggerGithubReposError(error instanceof Error ? error.message : "Failed to load GitHub repositories.");
              return [];
            } finally {
              setSettingsTriggerGithubReposLoading(false);
            }
          }, [githubStatus.connected]);
  
          async function handleSettingsCopyField(value, fieldId) {
            const copied = await copyTextToClipboard(value);
            if (!copied) {
              return;
            }
  
            setSettingsCopiedField(fieldId);
            window.setTimeout(() => {
              setSettingsCopiedField((current) => current === fieldId ? "" : current);
            }, 1800);
          }
  
          const loadSettingsBillingCatalog = useCallback(async function loadSettingsBillingCatalog() {
            try {
              const catalog = await refreshSettingsBillingCatalog(authRequestHeaders);
              setSettingsBillingCatalogRevision((current) => current + 1);
              return catalog;
            } catch {
              return null;
            }
          }, [authRequestHeaders]);
  
          const loadSettingsBudgetStatus = useCallback(async function loadSettingsBudgetStatus() {
            if (!hasSessionAuth) {
              setSettingsBudgetStatus(null);
  	            setOrganizationPageBillingSummary(null);
              return null;
            }
  
            setSettingsBudgetLoading(true);
            try {
              if (hasRealAccess) {
  	              const shouldLoadOrganizationSummary = activePage === "organization"
  	                && (organizationPageActiveTab === "billing" || organizationPageActiveTab === "usage");
  	              let realBudgetResponse = await fetch(
  	                proxyBackendBase + (shouldLoadOrganizationSummary ? "/billing/organization/summary?activityLimit=8" : "/billing/budget"),
  	                {
                  method: "GET",
                  headers: billingAuthRequestHeaders,
                  cache: "no-store",
  	                },
  	              );
  	              let realBudgetPayload = await realBudgetResponse.json().catch(() => ({}));
  	              if (!realBudgetResponse.ok && shouldLoadOrganizationSummary) {
  	                realBudgetResponse = await fetch(proxyBackendBase + "/billing/budget", {
  	                  method: "GET",
  	                  headers: billingAuthRequestHeaders,
  	                  cache: "no-store",
  	                });
  	                realBudgetPayload = await realBudgetResponse.json().catch(() => ({}));
  	              }
  
                if (realBudgetResponse.ok) {
  	                const hasOrganizationSummary = realBudgetPayload?.budget
  	                  && typeof realBudgetPayload.budget === "object"
  	                  && !Array.isArray(realBudgetPayload.budget);
  	                const realBudgetData = hasOrganizationSummary
  	                  ? {
  	                      ...realBudgetPayload.budget,
  	                      organizationId: realBudgetPayload.organizationId,
  	                      planId: realBudgetPayload.plan?.id,
  	                      organizationPlan: realBudgetPayload.plan
  	                        ? {
  	                            id: realBudgetPayload.plan.id,
  	                            name: realBudgetPayload.plan.name,
  	                            source: realBudgetPayload.plan.source,
  	                            includedUsageUsd: realBudgetPayload.plan.includedUsageUsd,
  	                            overageEnabled: realBudgetPayload.plan.overageEnabled,
  	                            monthlyOverageLimitUsd: realBudgetPayload.plan.monthlyOverageLimitUsd,
  	                          }
  	                        : null,
  	                      subscriptionStatus: realBudgetPayload.plan?.subscription?.status
  	                        || realBudgetPayload.budget.subscriptionStatus,
  	                    }
  	                  : realBudgetPayload;
  	                setOrganizationPageBillingSummary(hasOrganizationSummary ? realBudgetPayload : null);
                  setSettingsBudgetStatus(realBudgetData);
                  setSessionState((current) => ({
                    ...current,
                    subscriptionTier:
                      typeof realBudgetData?.planId === "string" && realBudgetData.planId.trim()
                        ? realBudgetData.planId.trim()
                        : typeof realBudgetData?.organizationPlan?.id === "string" && realBudgetData.organizationPlan.id.trim()
                          ? realBudgetData.organizationPlan.id.trim()
                      : typeof realBudgetData?.tier === "string" && realBudgetData.tier.trim()
                        ? realBudgetData.tier.trim()
                        : current.subscriptionTier,
                    subscriptionStatus:
                      typeof realBudgetData?.subscriptionStatus === "string"
                        ? realBudgetData.subscriptionStatus
                        : current.subscriptionStatus,
                  }));
                  return realBudgetData;
                }
              }
  
              const fallbackResponse = await fetch("/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/budget", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const fallbackData = await fallbackResponse.json().catch(() => ({}));
  
              if (!fallbackResponse.ok) {
                throw new Error(fallbackData?.message || fallbackData?.error || "Failed to load subscription details.");
              }
  
              setSettingsBudgetStatus(fallbackData);
              return fallbackData;
            } catch (error) {
              setSettingsBudgetStatus(null);
  	            setOrganizationPageBillingSummary(null);
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to load subscription details.");
              return null;
            } finally {
              setSettingsBudgetLoading(false);
            }
          }, [
  	          activePage,
  	          billingAuthRequestHeaders,
  	          hasRealAccess,
  	          hasSessionAuth,
  	          organizationPageActiveTab,
  	          proxyBackendBase,
  	          settingsProjectRoutingId,
  	        ]);
  
          const refreshSessionBudgetStatus = useCallback(async function refreshSessionBudgetStatus() {
            if (!hasRealAccess) {
              return null;
            }
  
            try {
              const response = await fetch(proxyBackendBase + "/billing/budget", {
                method: "GET",
                headers: authRequestHeaders,
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (isUnauthorizedStatus(response.status)) {
                triggerPlatformSessionRecovery();
                return null;
              }
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load subscription details.");
              }
  
              setSessionState((current) => {
                const nextTier = typeof data?.planId === "string" && data.planId.trim()
                  ? data.planId.trim()
                  : typeof data?.organizationPlan?.id === "string" && data.organizationPlan.id.trim()
                    ? data.organizationPlan.id.trim()
                    : typeof data?.tier === "string" && data.tier.trim()
                      ? data.tier.trim()
                      : current.subscriptionTier;
                const nextStatus = typeof data?.subscriptionStatus === "string"
                  ? data.subscriptionStatus
                  : current.subscriptionStatus;
  
                if (current.subscriptionTier === nextTier && current.subscriptionStatus === nextStatus) {
                  return current;
                }
  
                return {
                  ...current,
                  subscriptionTier: nextTier,
                  subscriptionStatus: nextStatus,
                };
              });
  
              setSettingsBudgetStatus((current) => {
                if (current && typeof current === "object") {
                  return {
                    ...current,
                    ...data,
                  };
                }
                return data;
              });
  
              return data;
            } catch {
              return null;
            }
          }, [authRequestHeaders, hasRealAccess, proxyBackendBase, triggerPlatformSessionRecovery]);
  
          const loadSettingsPlatformConfig = useCallback(async function loadSettingsPlatformConfig() {
            if (!hasRealAccess) {
              const localConfig = readDemoSettingsPlatformConfig();
              setSettingsBillingPreferences(localConfig.billing);
              setSettingsInferenceSettings(localConfig.inference);
              setSettingsInferenceApiKeyInput("");
              setSettingsClearInferenceApiKey(false);
              setSettingsInferenceApiKeyEditing(false);
              return localConfig;
            }
  
            try {
              const localConfig = readDemoSettingsPlatformConfig();
              const response = await fetch(proxyBackendBase + "/billing/preferences", {
                method: "GET",
                headers: billingAuthRequestHeaders,
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load platform settings.");
              }
  
              const nextBillingPreferences = normalizeDemoSettingsBillingPreferences(data?.billing);
              const backendInferenceApiKeyPreview = typeof data?.inference?.apiKeyPreview === "string"
                ? data.inference.apiKeyPreview.trim()
                : "";
              const localInferenceApiKeyPreview = typeof localConfig?.inference?.apiKeyPreview === "string"
                ? localConfig.inference.apiKeyPreview.trim()
                : "";
              const nextInferenceApiKeyPreview = backendInferenceApiKeyPreview.length >= localInferenceApiKeyPreview.length
                ? backendInferenceApiKeyPreview
                : localInferenceApiKeyPreview;
              const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
                ...data?.inference,
                apiKeyPreview: nextInferenceApiKeyPreview,
              });
              setSettingsBillingPreferences(nextBillingPreferences);
              setSettingsInferenceSettings(nextInferenceSettings);
              setSettingsInferenceApiKeyInput("");
              setSettingsClearInferenceApiKey(false);
              setSettingsInferenceApiKeyEditing(false);
              writeDemoSettingsPlatformConfig({
                billing: nextBillingPreferences,
                inference: nextInferenceSettings,
              });
              return {
                billing: nextBillingPreferences,
                inference: nextInferenceSettings,
              };
            } catch (error) {
              const localConfig = readDemoSettingsPlatformConfig();
              setSettingsBillingPreferences(localConfig.billing);
              setSettingsInferenceSettings(localConfig.inference);
              setSettingsInferenceApiKeyInput("");
              setSettingsClearInferenceApiKey(false);
              setSettingsInferenceApiKeyEditing(false);
              setSettingsPlatformConfigError(error instanceof Error ? error.message : "Failed to load platform settings.");
              return localConfig;
            }
          }, [billingAuthRequestHeaders, hasRealAccess, proxyBackendBase]);
  
          const loadSettingsInvoices = useCallback(async function loadSettingsInvoices() {
            if (!hasSessionAuth) {
              setSettingsInvoices([]);
              setSettingsSubscriptions([]);
              return;
            }
  
            setSettingsInvoicesLoading(true);
            try {
              const invoiceOrganizationId = String(
                billingOrganizationId || settingsBudgetStatus?.organizationId || "",
              ).trim();
              const invoiceRequestUrl = "/api/aios/lemonsqueezy/invoices"
                + (invoiceOrganizationId
                  ? "?organizationId=" + encodeURIComponent(invoiceOrganizationId)
                  : "");
              const response = await fetch(invoiceRequestUrl, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load billing records.");
              }
  
              setSettingsInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
              setSettingsSubscriptions(Array.isArray(data?.subscriptions) ? data.subscriptions : []);
            } catch (error) {
              setSettingsInvoices([]);
              setSettingsSubscriptions([]);
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to load billing records.");
            } finally {
              setSettingsInvoicesLoading(false);
            }
          }, [billingOrganizationId, hasSessionAuth, settingsBudgetStatus?.organizationId]);
  
          const loadSettingsUsageData = useCallback(async function loadSettingsUsageData() {
            if (!hasSessionAuth) {
              setSettingsUsageSummary(createEmptySettingsUsageSummary());
              setSettingsUsageBreakdown([]);
              setSettingsUsageResourceItems([]);
              setSettingsUsageAgentItems([]);
              setSettingsUsageEnvironmentItems([]);
              return;
            }
  
            const usageParams = new URLSearchParams();
            if (settingsBudgetStatus?.periodStartDate && settingsBudgetStatus?.periodEndDate) {
              const adjustedStart = new Date(settingsBudgetStatus.periodStartDate);
              const adjustedEnd = new Date(settingsBudgetStatus.periodEndDate);
  
              if (settingsBillingPeriodOffset !== 0) {
                adjustedStart.setMonth(adjustedStart.getMonth() + settingsBillingPeriodOffset);
                adjustedEnd.setMonth(adjustedEnd.getMonth() + settingsBillingPeriodOffset);
              }
  
              usageParams.set("startDate", adjustedStart.toISOString());
              usageParams.set("endDate", adjustedEnd.toISOString());
            } else {
              usageParams.set("period", "month");
            }
  
            setSettingsUsageLoading(true);
            try {
              const summaryUrl = hasRealAccess
                ? proxyBackendBase + "/costs/summary?" + usageParams.toString()
                : "/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/costs/summary?" + usageParams.toString();
              const sourceBreakdownUrl = hasRealAccess
                ? proxyBackendBase + "/costs/breakdown?groupBy=source&" + usageParams.toString()
                : "/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/costs/breakdown?groupBy=source&" + usageParams.toString();
              const resourceBreakdownUrl = hasRealAccess
                ? proxyBackendBase + "/costs/breakdown?groupBy=resource&" + usageParams.toString()
                : "/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/costs/breakdown?groupBy=resource&" + usageParams.toString();
              const agentBreakdownUrl = hasRealAccess
                ? proxyBackendBase + "/costs/breakdown?groupBy=agent&" + usageParams.toString()
                : "/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/costs/breakdown?groupBy=agent&" + usageParams.toString();
              const environmentBreakdownUrl = hasRealAccess
                ? proxyBackendBase + "/costs/breakdown?groupBy=environment&" + usageParams.toString()
                : "/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/costs/breakdown?groupBy=environment&" + usageParams.toString();
              const usageFetchOptions = hasRealAccess
                ? {
                    method: "GET",
                    headers: billingAuthRequestHeaders,
                    cache: "no-store",
                  }
                : {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                  };
              const [
                summaryResponse,
                breakdownResponse,
                resourceBreakdownResponse,
                agentBreakdownResponse,
                environmentBreakdownResponse,
              ] = await Promise.all([
                fetch(summaryUrl, usageFetchOptions),
                fetch(sourceBreakdownUrl, usageFetchOptions),
                fetch(resourceBreakdownUrl, usageFetchOptions),
                fetch(agentBreakdownUrl, usageFetchOptions),
                fetch(environmentBreakdownUrl, usageFetchOptions),
              ]);
  
              const summaryData = await summaryResponse.json().catch(() => ({}));
              const breakdownData = await breakdownResponse.json().catch(() => ({}));
              const resourceBreakdownData = await resourceBreakdownResponse.json().catch(() => ({}));
              const agentBreakdownData = await agentBreakdownResponse.json().catch(() => ({}));
              const environmentBreakdownData = await environmentBreakdownResponse.json().catch(() => ({}));
  
              if (!summaryResponse.ok) {
                throw new Error(summaryData?.message || summaryData?.error || "Failed to load usage summary.");
              }
  
              const normalizeUsageBreakdownEntry = (entry, fallbackId) => ({
                ...entry,
                id: String(entry?.id || entry?.resourceId || entry?.agentId || entry?.environmentId || entry?.source || entry?.name || fallbackId || "usage"),
                name: entry?.name || entry?.displayName || entry?.resourceName || entry?.agentName || entry?.environmentName || entry?.source || entry?.id || fallbackId || "Unknown",
                totalCT: readSettingsComputeTokens(entry, "totalCT", "totalCost"),
                agentCT: readSettingsComputeTokens(entry, "agentCT", "agentCost"),
                environmentCT: readSettingsComputeTokens(entry, "environmentCT", "environmentCost"),
                threadCount: Number(entry?.threadCount ?? entry?.totalThreads ?? entry?.totalRuns ?? entry?.runCount ?? 0),
              });
  
              const normalizedByDay = Array.isArray(summaryData?.byDay)
                ? summaryData.byDay.map((entry) => ({
                    date: typeof entry?.date === "string" ? entry.date : "",
                    totalCT: readSettingsComputeTokens(entry, "totalCT", "totalCost"),
                    agentCT: readSettingsComputeTokens(entry, "agentCT", "agentCost"),
                    environmentCT: readSettingsComputeTokens(entry, "environmentCT", "environmentCost"),
                    threadCount: Number(entry?.threadCount ?? entry?.totalThreads ?? entry?.totalRuns ?? entry?.runCount ?? 0),
                  }))
                : [];
              const normalizedSources = Array.isArray(breakdownData?.sources)
                ? breakdownData.sources
                  .map((entry) => normalizeUsageBreakdownEntry(entry, "unattributed"))
                  .filter((entry) => entry.totalCT > 0 || entry.threadCount > 0)
                : [];
              const normalizedAgentItems = Array.isArray(agentBreakdownData?.agents)
                ? agentBreakdownData.agents
                  .map((entry) => normalizeUsageBreakdownEntry(entry, "agent"))
                  .filter((entry) => entry.totalCT > 0 || entry.threadCount > 0)
                : [];
              const normalizedEnvironmentItems = Array.isArray(environmentBreakdownData?.environments)
                ? environmentBreakdownData.environments
                  .map((entry) => normalizeUsageBreakdownEntry(entry, "computer"))
                  .filter((entry) => entry.totalCT > 0 || entry.threadCount > 0)
                : [];
              const normalizedResourceItems = Array.isArray(resourceBreakdownData?.resources)
                ? resourceBreakdownData.resources
                  .map((entry) => ({
                    id: String(entry?.id || entry?.resourceId || entry?.name || "resource"),
                    name: entry?.name || entry?.displayName || entry?.resourceName || "Unknown",
                    kind: String(entry?.kind || entry?.resourceKind || entry?.type || "").trim().toLowerCase(),
                    resourceType: typeof entry?.resourceType === "string" ? entry.resourceType : "",
                    resourceKind: typeof entry?.resourceKind === "string" ? entry.resourceKind : "",
                    resourceId: typeof entry?.resourceId === "string" ? entry.resourceId : "",
                    totalCT: readSettingsComputeTokens(entry, "totalCT", "totalCost"),
                    agentCT: readSettingsComputeTokens(entry, "agentCT", "agentCost"),
                    environmentCT: readSettingsComputeTokens(entry, "environmentCT", "environmentCost"),
                    threadCount: Number(entry?.threadCount ?? entry?.totalThreads ?? entry?.totalRuns ?? entry?.runCount ?? 0),
                  }))
                  .filter((entry) => entry.totalCT > 0)
                : [];
  
              setSettingsUsageSummary({
                startDate: typeof summaryData?.startDate === "string" ? summaryData.startDate : "",
                endDate: typeof summaryData?.endDate === "string" ? summaryData.endDate : "",
                totals: {
                  totalCT: readSettingsComputeTokens(summaryData?.totals, "totalCT", "totalCost"),
                  agentCT: readSettingsComputeTokens(summaryData?.totals, "agentCT", "agentCost"),
                  environmentCT: readSettingsComputeTokens(summaryData?.totals, "environmentCT", "environmentCost"),
                  totalThreads: Number(summaryData?.totals?.totalThreads ?? summaryData?.totals?.totalRuns ?? 0),
                },
                byDay: normalizedByDay,
              });
              setSettingsUsageBreakdown(normalizedSources);
              setSettingsUsageResourceItems(normalizedResourceItems);
              setSettingsUsageAgentItems(normalizedAgentItems);
              setSettingsUsageEnvironmentItems(normalizedEnvironmentItems);
            } catch (error) {
              setSettingsUsageSummary(createEmptySettingsUsageSummary());
              setSettingsUsageBreakdown([]);
              setSettingsUsageResourceItems([]);
              setSettingsUsageAgentItems([]);
              setSettingsUsageEnvironmentItems([]);
            } finally {
              setSettingsUsageLoading(false);
            }
          }, [
            billingAuthRequestHeaders,
            hasRealAccess,
            hasSessionAuth,
            proxyBackendBase,
            settingsBillingPeriodOffset,
            settingsBudgetStatus?.periodEndDate,
            settingsBudgetStatus?.periodStartDate,
            settingsProjectRoutingId,
          ]);
  
  ${API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loading}
          const loadSettingsMarketingConsent = useCallback(async function loadSettingsMarketingConsent() {
            if (!hasSessionAuth) {
              setSettingsMarketingConsentStatus(null);
              setSettingsMarketingConsentError("");
              setSettingsMarketingConsentSuccess("");
              return;
            }
  
            setSettingsMarketingConsentLoading(true);
            setSettingsMarketingConsentError("");
            try {
              const response = await fetch("/api/aios/user/marketing-consent", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to load email preferences.");
              }
  
              setSettingsMarketingConsentStatus(typeof data?.status === "string" ? data.status : null);
            } catch (error) {
              setSettingsMarketingConsentError(error instanceof Error ? error.message : "Failed to load email preferences.");
            } finally {
              setSettingsMarketingConsentLoading(false);
            }
          }, [hasSessionAuth]);
  
          const loadSettingsTriggers = useCallback(async function loadSettingsTriggers() {
            if (!hasSessionAuth) {
              setSettingsTriggers([]);
              return;
            }
  
            setSettingsTriggersLoading(true);
            setSettingsTriggersError("");
            try {
              const response = await fetch("/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/triggers", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load webhooks.");
              }
  
              const items = Array.isArray(data?.triggers) ? data.triggers : [];
              setSettingsTriggers(items);
              setSettingsSelectedTriggerId((current) => items.some((trigger) => trigger.id === current) ? current : "");
            } catch (error) {
              setSettingsTriggers([]);
              setSettingsTriggersError(error instanceof Error ? error.message : "Failed to load webhooks.");
            } finally {
              setSettingsTriggersLoading(false);
            }
          }, [hasSessionAuth, settingsProjectRoutingId]);
  
          async function handleSettingsSubscribe(tierId) {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            setSettingsCheckoutLoading(true);
            setSettingsBillingError("");
            setSettingsBillingSuccess("");
            try {
              const successUrl = (() => {
                const url = new URL(window.location.href);
                url.searchParams.set(PLAYGROUND_SUBSCRIPTION_SUCCESS_QUERY_PARAM, "true");
                return url.toString();
              })();
              const cancelUrl = (() => {
                const url = new URL(window.location.href);
                url.searchParams.delete(PLAYGROUND_SUBSCRIPTION_SUCCESS_QUERY_PARAM);
                return url.toString();
              })();
              const response = await fetch("/api/aios/lemonsqueezy/checkout", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  tier: tierId,
                  billingInterval: "monthly",
                  ...(String(billingOrganizationId || settingsBudgetStatus?.organizationId || "").trim()
                    ? { organizationId: String(billingOrganizationId || settingsBudgetStatus?.organizationId).trim() }
                    : {}),
                  successUrl,
                  cancelUrl,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
              }
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to start checkout.");
              }
              throw new Error("Failed to start checkout.");
            } catch (error) {
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to start checkout.");
              setSettingsCheckoutLoading(false);
            }
          }
  
          function handleSidebarPlanAction() {
            if (!hasShellAccess) {
              handleSignInWithComputerAgents();
              return;
            }
  
            if (sidebarPlanIsPaid) {
              openSettingsModal("costs-plans");
              return;
            }
  
            void handleSettingsSubscribe("builder");
          }
  
          async function handleSettingsBuyTopUp(packageId) {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            setSettingsTopUpActionId(packageId);
            setSettingsBillingError("");
            setSettingsBillingSuccess("");
            try {
              const response = await fetch("/api/aios/lemonsqueezy/checkout", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  packageId,
                  ...(String(billingOrganizationId || settingsBudgetStatus?.organizationId || "").trim()
                    ? { organizationId: String(billingOrganizationId || settingsBudgetStatus?.organizationId).trim() }
                    : {}),
                  successUrl: window.location.origin + window.location.pathname,
                  cancelUrl: window.location.origin + window.location.pathname,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
              }
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to start checkout.");
              }
              throw new Error("Failed to start checkout.");
            } catch (error) {
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to start checkout.");
              setSettingsTopUpActionId("");
            }
          }
  
          async function handleSettingsChangePlan(tierId) {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            setSettingsSubscriptionActionId(tierId);
            setSettingsBillingError("");
            setSettingsBillingSuccess("");
            try {
              const previewResponse = await fetch("/api/aios/lemonsqueezy/subscription/update", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  newTier: tierId,
                  preview: true,
                  ...(String(billingOrganizationId || settingsBudgetStatus?.organizationId || "").trim()
                    ? { organizationId: String(billingOrganizationId || settingsBudgetStatus?.organizationId).trim() }
                    : {}),
                }),
              });
              const previewData = await previewResponse.json().catch(() => ({}));
  
              if (!previewResponse.ok) {
                throw new Error(previewData?.message || previewData?.error || "Failed to preview plan change.");
              }
  
              const confirmationLines = [
                previewData?.explanation || "Apply this plan change?",
                previewData?.isUpgrade
                  ? "Estimated charge: " + formatSettingsCurrency(previewData?.estimatedCharge || 0)
                  : "This change will be scheduled for the next billing cycle.",
              ];
  
              if (!window.confirm(confirmationLines.join("\n\n"))) {
                return;
              }
  
              const response = await fetch("/api/aios/lemonsqueezy/subscription/update", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  newTier: tierId,
                  preview: false,
                  ...(String(billingOrganizationId || settingsBudgetStatus?.organizationId || "").trim()
                    ? { organizationId: String(billingOrganizationId || settingsBudgetStatus?.organizationId).trim() }
                    : {}),
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to update subscription.");
              }
  
              setSettingsBillingSuccess(data?.message || "Plan updated.");
              window.setTimeout(() => setSettingsBillingSuccess(""), 4200);
              await Promise.all([loadSettingsBudgetStatus(), loadSettingsInvoices()]);
              void refreshSessionState();
            } catch (error) {
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to update subscription.");
            } finally {
              setSettingsSubscriptionActionId("");
            }
          }
  
          async function handleSettingsCancelSubscription(subscriptionId) {
            if (!subscriptionId || !window.confirm("Cancel this subscription at the end of the current billing period?")) {
              return;
            }
  
            setSettingsSubscriptionActionId(subscriptionId);
            setSettingsBillingError("");
            setSettingsBillingSuccess("");
            try {
              const response = await fetch("/api/aios/lemonsqueezy/subscription/cancel", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscriptionId,
                  ...(String(billingOrganizationId || settingsBudgetStatus?.organizationId || "").trim()
                    ? { organizationId: String(billingOrganizationId || settingsBudgetStatus?.organizationId).trim() }
                    : {}),
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to cancel subscription.");
              }
  
              setSettingsBillingSuccess("Subscription cancelled. Access remains active until the end of the current billing period.");
              window.setTimeout(() => setSettingsBillingSuccess(""), 4200);
              await Promise.all([loadSettingsBudgetStatus(), loadSettingsInvoices()]);
              void refreshSessionState();
            } catch (error) {
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to cancel subscription.");
            } finally {
              setSettingsSubscriptionActionId("");
            }
          }
  
          async function handleSettingsReactivateSubscription(subscriptionId) {
            if (!subscriptionId) {
              return;
            }
  
            setSettingsSubscriptionActionId(subscriptionId);
            setSettingsBillingError("");
            setSettingsBillingSuccess("");
            try {
              const response = await fetch("/api/aios/lemonsqueezy/subscription/reactivate", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscriptionId,
                  ...(String(billingOrganizationId || settingsBudgetStatus?.organizationId || "").trim()
                    ? { organizationId: String(billingOrganizationId || settingsBudgetStatus?.organizationId).trim() }
                    : {}),
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to reactivate subscription.");
              }
  
              setSettingsBillingSuccess(data?.message || "Subscription reactivated.");
              window.setTimeout(() => setSettingsBillingSuccess(""), 4200);
              await Promise.all([loadSettingsBudgetStatus(), loadSettingsInvoices()]);
              void refreshSessionState();
            } catch (error) {
              setSettingsBillingError(error instanceof Error ? error.message : "Failed to reactivate subscription.");
            } finally {
              setSettingsSubscriptionActionId("");
            }
          }
  
  ${API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.create}
          async function updateSettingsMarketingConsent(status) {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            setSettingsMarketingConsentSaving(true);
            setSettingsMarketingConsentError("");
            setSettingsMarketingConsentSuccess("");
            try {
              const response = await fetch("/api/aios/user/marketing-consent", {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status,
                  source: "settings",
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to update email preferences.");
              }
  
              setSettingsMarketingConsentStatus(status);
              setSettingsMarketingConsentSuccess("Email preference saved");
              window.setTimeout(() => setSettingsMarketingConsentSuccess(""), 3000);
            } catch (error) {
              setSettingsMarketingConsentError(error instanceof Error ? error.message : "Failed to update email preferences.");
            } finally {
              setSettingsMarketingConsentSaving(false);
            }
          }
  
  ${API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.revoke}
          async function handleSettingsResendVerificationEmail() {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            setSettingsVerificationResending(true);
            setSettingsVerificationResent(false);
            setSettingsVerificationError("");
            try {
              const response = await fetch("/api/aios/auth/send-verification", {
                method: "POST",
                credentials: "include",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to send verification email.");
              }
  
              setSettingsVerificationResent(true);
              window.setTimeout(() => setSettingsVerificationResent(false), 5000);
            } catch (error) {
              setSettingsVerificationError(error instanceof Error ? error.message : "Failed to send verification email.");
            } finally {
              setSettingsVerificationResending(false);
            }
          }
  
          async function handleSettingsPasswordChange() {
            if (!hasSessionAuth || !accountEmail) {
              setSettingsPasswordError("Sign in with an email account to update the password.");
              return;
            }
  
            if (!FIREBASE_WEB_API_KEY) {
              setSettingsPasswordError("Password management is not configured for this environment.");
              return;
            }
  
            if (settingsPasswordForm.newPassword !== settingsPasswordForm.confirmPassword) {
              setSettingsPasswordError("New passwords do not match.");
              return;
            }
  
            if (String(settingsPasswordForm.newPassword || "").length < 6) {
              setSettingsPasswordError("New password must be at least 6 characters.");
              return;
            }
  
            setSettingsPasswordLoading(true);
            setSettingsPasswordError("");
            setSettingsPasswordSuccess("");
            try {
              const signInResponse = await fetch(buildFirebaseRestUrl("accounts:signInWithPassword"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: accountEmail,
                  password: settingsPasswordForm.currentPassword,
                  returnSecureToken: true,
                }),
              });
              const signInData = await signInResponse.json().catch(() => ({}));
  
              if (!signInResponse.ok || !signInData?.idToken) {
                throw new Error(mapFirebaseAuthErrorMessage(signInData?.error?.message, "Failed to verify current password."));
              }
  
              const updateResponse = await fetch(buildFirebaseRestUrl("accounts:update"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  idToken: signInData.idToken,
                  password: settingsPasswordForm.newPassword,
                  returnSecureToken: true,
                }),
              });
              const updateData = await updateResponse.json().catch(() => ({}));
  
              if (!updateResponse.ok) {
                throw new Error(mapFirebaseAuthErrorMessage(updateData?.error?.message, "Failed to update password."));
              }
  
              setSettingsPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setSettingsPasswordSuccess("Password updated successfully.");
              window.setTimeout(() => setSettingsPasswordSuccess(""), 4200);
            } catch (error) {
              setSettingsPasswordError(error instanceof Error ? error.message : "Failed to update password.");
            } finally {
              setSettingsPasswordLoading(false);
            }
          }
  
          async function handleSettingsSendPasswordReset() {
            if (!hasSessionAuth || !accountEmail) {
              setSettingsPasswordError("Sign in with an email account to send a reset email.");
              return;
            }
  
            if (!FIREBASE_WEB_API_KEY) {
              setSettingsPasswordError("Password reset is not configured for this environment.");
              return;
            }
  
            setSettingsPasswordResetLoading(true);
            setSettingsPasswordError("");
            setSettingsPasswordSuccess("");
            try {
              const response = await fetch(buildFirebaseRestUrl("accounts:sendOobCode"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  requestType: "PASSWORD_RESET",
                  email: accountEmail,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(mapFirebaseAuthErrorMessage(data?.error?.message, "Failed to send password reset email."));
              }
  
              setSettingsPasswordSuccess("Password reset email sent to " + accountEmail + ".");
              window.setTimeout(() => setSettingsPasswordSuccess(""), 4200);
            } catch (error) {
              setSettingsPasswordError(error instanceof Error ? error.message : "Failed to send password reset email.");
            } finally {
              setSettingsPasswordResetLoading(false);
            }
          }
  
          async function handleSettingsDeleteAccount() {
            if (!hasSessionAuth || !accountEmail) {
              setSettingsDeleteError("Sign in with an email account to delete it.");
              return;
            }
  
            if (!FIREBASE_WEB_API_KEY) {
              setSettingsDeleteError("Account deletion is not configured for this environment.");
              return;
            }
  
            if (String(settingsDeleteConfirmation || "").trim() !== "DELETE") {
              setSettingsDeleteError("Type DELETE to confirm account deletion.");
              return;
            }
  
            setSettingsDeleteLoading(true);
            setSettingsDeleteError("");
            try {
              const signInResponse = await fetch(buildFirebaseRestUrl("accounts:signInWithPassword"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: accountEmail,
                  password: settingsDeletePassword,
                  returnSecureToken: true,
                }),
              });
              const signInData = await signInResponse.json().catch(() => ({}));
  
              if (!signInResponse.ok || !signInData?.idToken) {
                throw new Error(mapFirebaseAuthErrorMessage(signInData?.error?.message, "Failed to verify password."));
              }
  
              const purgeResponse = await fetch("/api/aios/user/account", {
                method: "DELETE",
                credentials: "include",
              });
              const purgeData = await purgeResponse.json().catch(() => ({}));
  
              if (!purgeResponse.ok) {
                throw new Error(purgeData?.message || purgeData?.details || purgeData?.error || "Failed to delete account data.");
              }
  
              clearFirebaseSessionCookie();
              window.location.href = buildAiosLogoutUrl();
            } catch (error) {
              setSettingsDeleteError(error instanceof Error ? error.message : "Failed to delete account.");
            } finally {
              setSettingsDeleteLoading(false);
            }
          }
  
          async function handleSettingsCreateTrigger() {
            if (!hasSessionAuth) {
              handleSignInWithComputerAgents();
              return;
            }
  
            const triggerName = String(settingsTriggerForm.name || "").trim();
            const triggerEvent = String(settingsTriggerForm.event || "").trim();
            const environmentValue = String(settingsTriggerForm.environmentId || "").trim();
            const promptValue = String(settingsTriggerForm.message || "").trim();
            if (!triggerName || !triggerEvent || !environmentValue || !promptValue) {
              setSettingsTriggersError("Name, event, computer, and prompt are required.");
              return;
            }
  
            setSettingsTriggerSubmitting(true);
            setSettingsTriggersError("");
            try {
              const filters = {};
              if (settingsTriggerForm.source === "github" || settingsTriggerForm.source === "gitlab") {
                if (String(settingsTriggerForm.filterRepo || "").trim()) {
                  filters.repo = String(settingsTriggerForm.filterRepo || "").trim();
                }
                if (String(settingsTriggerForm.filterBranch || "").trim()) {
                  filters.branch = String(settingsTriggerForm.filterBranch || "").trim();
                }
              }
  
              const action = {
                type: settingsTriggerForm.actionType === "comment_pull_request"
                  ? "comment_pull_request"
                  : settingsTriggerForm.actionType === "comment_merge_request"
                    ? "comment_merge_request"
                    : "send_message",
                prompt: promptValue,
              };
              if (settingsTriggerForm.actionType !== "comment_pull_request" && settingsTriggerForm.actionType !== "comment_merge_request") {
                action.message = promptValue;
              }
  
              const response = await fetch("/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/triggers", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: triggerName,
                  source: settingsTriggerForm.source,
                  event: triggerEvent,
                  environmentId: environmentValue,
                  agentId: String(settingsTriggerForm.agentId || "").trim() || undefined,
                  action,
                  filters: Object.keys(filters).length ? filters : undefined,
                  enabled: true,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || data?.details || "Failed to create webhook.");
              }
  
              await loadSettingsTriggers();
              resetSettingsTriggerForm();
              setSettingsCreatingTrigger(false);
              setSettingsSelectedTriggerId(data?.trigger?.id || "");
              setSettingsTriggersSuccess("Webhook created successfully.");
              window.setTimeout(() => setSettingsTriggersSuccess(""), 4200);
            } catch (error) {
              setSettingsTriggersError(error instanceof Error ? error.message : "Failed to create webhook.");
            } finally {
              setSettingsTriggerSubmitting(false);
            }
          }
  
          async function handleSettingsToggleTrigger(trigger) {
            if (!trigger?.id) {
              return;
            }
  
            setSettingsTriggerActionId(trigger.id);
            setSettingsTriggerActionType("toggle");
            setSettingsTriggersError("");
            try {
              const response = await fetch("/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/triggers/" + encodeURIComponent(trigger.id), {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  enabled: !trigger.enabled,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to update webhook.");
              }
  
              const updatedTrigger = data?.trigger && typeof data.trigger === "object" ? data.trigger : trigger;
              setSettingsTriggers((current) => current.map((item) => item.id === trigger.id ? { ...item, ...updatedTrigger } : item));
            } catch (error) {
              setSettingsTriggersError(error instanceof Error ? error.message : "Failed to update webhook.");
            } finally {
              setSettingsTriggerActionId("");
              setSettingsTriggerActionType("");
            }
          }
  
          async function handleSettingsDeleteTrigger(trigger) {
            if (!trigger?.id || !window.confirm("Delete this webhook trigger?")) {
              return;
            }
  
            setSettingsTriggerActionId(trigger.id);
            setSettingsTriggerActionType("delete");
            setSettingsTriggersError("");
            try {
              const response = await fetch("/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/triggers/" + encodeURIComponent(trigger.id), {
                method: "DELETE",
                credentials: "include",
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete webhook.");
              }
  
              setSettingsTriggers((current) => current.filter((item) => item.id !== trigger.id));
              setSettingsSelectedTriggerId("");
              setSettingsShowTriggerSecret(false);
              setSettingsTriggersSuccess("Webhook deleted.");
              window.setTimeout(() => setSettingsTriggersSuccess(""), 4200);
            } catch (error) {
              setSettingsTriggersError(error instanceof Error ? error.message : "Failed to delete webhook.");
            } finally {
              setSettingsTriggerActionId("");
              setSettingsTriggerActionType("");
            }
          }
  
          async function handleSettingsTestTrigger(trigger) {
            if (!trigger?.id) {
              return;
            }
  
            setSettingsTriggerActionId(trigger.id);
            setSettingsTriggerActionType("test");
            setSettingsTriggersError("");
            try {
              const response = await fetch("/api/aios/projects/" + encodeURIComponent(settingsProjectRoutingId) + "/triggers/" + encodeURIComponent(trigger.id) + "/test", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to test webhook.");
              }
  
              setSettingsTriggersSuccess("Test payload sent. Check your threads for the run.");
              window.setTimeout(() => setSettingsTriggersSuccess(""), 4200);
            } catch (error) {
              setSettingsTriggersError(error instanceof Error ? error.message : "Failed to test webhook.");
            } finally {
              setSettingsTriggerActionId("");
              setSettingsTriggerActionType("");
            }
          }
  
          const handleFetchCustomSkills = useCallback(async function handleFetchCustomSkills() {
            const normalizeSkills = (items) => (items || [])
              .filter((skill) => !skill.isDefault && !skill.isSystem)
              .map((skill) => ({
                id: skill.id,
                name: skill.name,
                description: skill.description || "",
                icon: typeof skill.icon === "string" ? skill.icon : null,
                isCustom: true,
                enabled: true,
              }));
  
            const requestUrl = new URL("/api/playground/custom-skills", window.location.origin);
            if (activeProjectId) {
              requestUrl.searchParams.set("projectId", activeProjectId);
            }
  
            const response = await fetch(requestUrl.toString(), {
              method: "GET",
              credentials: "include",
              headers: {
                ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
                "X-Runner-Upstream-Url": resolvedUpstreamUrl,
              },
            });
            const data = await response.json();
  
            if (!response.ok) {
              throw new Error(data.message || data.error || "Failed to fetch custom skills");
            }
  
            return normalizeSkills(data.data || data.skills || []);
          }, [activeProjectId, effectiveApiKey, resolvedUpstreamUrl]);
  
          const handleFetchSkills = useCallback(async function handleFetchSkills() {
            const requestUrl = new URL("/api/playground/skills", window.location.origin);
            if (activeProjectId) {
              requestUrl.searchParams.set("projectId", activeProjectId);
            }
  
            const response = await fetch(requestUrl.toString(), {
              method: "GET",
              credentials: "include",
              headers: {
                ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
                "X-Runner-Upstream-Url": resolvedUpstreamUrl,
              },
            });
            const data = await response.json().catch(() => ({}));
  
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to fetch skills");
            }
  
            return Array.isArray(data?.skills)
              ? data.skills
              : Array.isArray(data?.data)
                ? data.data
              : [];
          }, [activeProjectId, effectiveApiKey, resolvedUpstreamUrl]);
  
          function scheduleProjectConnectorBrowserRestore(restoreState) {
            const normalizedRestoreState = normalizePlaygroundConnectorBrowserRestoreState(restoreState);
            console.info("[connector-debug] schedule project connector browser restore received", {
              restoreState,
              normalizedRestoreState,
            });
            if (!normalizedRestoreState || normalizedRestoreState.mode !== "project") {
              console.info("[connector-debug] schedule project connector browser restore ignored", {
                reason: "not a project connector restore state",
                restoreState,
                normalizedRestoreState,
              });
              return false;
            }
            const restoreKey = [
              normalizedRestoreState.provider,
              normalizedRestoreState.mode,
              normalizedRestoreState.source,
              normalizedRestoreState.projectId,
              normalizedRestoreState.savedAt,
            ].join(":");
            if (connectorBrowserRestoreScheduledKeyRef.current === restoreKey) {
              console.info("[connector-debug] schedule project connector browser restore deduped", {
                restoreKey,
                normalizedRestoreState,
              });
              return true;
            }
            connectorBrowserRestoreScheduledKeyRef.current = restoreKey;
  
            try {
              localStorage.setItem("runner_demo_tasks_project_scope_id", normalizedRestoreState.projectId);
              localStorage.setItem("runner_demo_tasks_last_project_id", normalizedRestoreState.projectId);
            } catch {}
  
            clearPlaygroundConnectorBrowserRestoreState();
            setLatestInteractedProjectId(normalizedRestoreState.projectId);
            console.info("[connector-debug] schedule project connector browser restore navigating to project overview", {
              restoreKey,
              projectId: normalizedRestoreState.projectId,
              source: normalizedRestoreState.source,
            });
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: normalizedRestoreState.projectId,
              view: "overview",
              missionControlAction: "",
              projectComposerAction: "",
            });
            setActivePage("tasks");
  
            const clickConnectorButton = (attempt = 0) => {
              const candidates = typeof document !== "undefined"
                ? Array.from(document.querySelectorAll("[data-project-overview-connector-source]"))
                : [];
              const candidateSummaries = candidates.map((node) => ({
                source: node.getAttribute("data-project-overview-connector-source") || "",
                projectId: node.getAttribute("data-project-overview-project-id") || "",
                text: String(node.textContent || "").trim().slice(0, 80),
                disabled: Boolean(node.disabled),
              }));
              const trigger = candidates.find((node) =>
                    node.getAttribute("data-project-overview-connector-source") === normalizedRestoreState.source
                    && node.getAttribute("data-project-overview-project-id") === normalizedRestoreState.projectId
                  );
  
              console.info("[connector-debug] restore click attempt", {
                attempt,
                expectedSource: normalizedRestoreState.source,
                expectedProjectId: normalizedRestoreState.projectId,
                candidateCount: candidates.length,
                candidates: candidateSummaries,
                found: Boolean(trigger),
              });
  
              if (trigger && typeof trigger.click === "function") {
                console.info("[connector-debug] restore click dispatching programmatic click", {
                  attempt,
                  source: normalizedRestoreState.source,
                  projectId: normalizedRestoreState.projectId,
                });
                trigger.click();
                return;
              }
  
              if (attempt < 60) {
                window.setTimeout(() => clickConnectorButton(attempt + 1), 150);
              } else {
                console.warn("[connector-debug] restore click gave up: matching project overview connector button not found", {
                  expectedSource: normalizedRestoreState.source,
                  expectedProjectId: normalizedRestoreState.projectId,
                  candidateCount: candidates.length,
                  candidates: candidateSummaries,
                });
              }
            };
  
            window.setTimeout(() => clickConnectorButton(), 500);
            return true;
          }
  
          function scheduleProjectComposerConnectorBrowserRestore(restoreState) {
            const normalizedRestoreState = normalizePlaygroundProjectComposerConnectorRestoreState(restoreState);
            console.info("[connector-debug] schedule project composer connector browser restore received", {
              restoreState,
              normalizedRestoreState,
            });
            if (!normalizedRestoreState || normalizedRestoreState.mode !== "project-composer") {
              return false;
            }
  
            const restoredProjectId = normalizedRestoreState.projectDraft?.id || "";
            const restoreKey = [
              normalizedRestoreState.provider,
              normalizedRestoreState.mode,
              normalizedRestoreState.source,
              normalizedRestoreState.projectComposerMode,
              restoredProjectId,
              normalizedRestoreState.savedAt,
            ].join(":");
            if (projectComposerConnectorBrowserRestoreScheduledKeyRef.current === restoreKey) {
              console.info("[connector-debug] schedule project composer connector browser restore deduped", {
                restoreKey,
                normalizedRestoreState,
              });
              return true;
            }
            projectComposerConnectorBrowserRestoreScheduledKeyRef.current = restoreKey;
  
            setActivePage("tasks");
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: normalizedRestoreState.projectComposerMode === "edit" ? restoredProjectId : "",
              view: "backlog",
              missionControlAction: "",
              projectComposerAction: "restore-connector",
              projectComposerConnectorRestoreState: normalizedRestoreState,
            });
            return true;
          }
  
          useEffect(() => {
            githubConnectedRef.current = Boolean(githubStatus.connected);
          }, [githubStatus.connected]);
  
          useEffect(() => {
            if (isDemoMode) {
              return;
            }
            void refreshSessionState();
          }, [isDemoMode, refreshSessionState]);
  
          useEffect(() => {
            if (!hasRealAccess || sessionState.status !== "authenticated" || !sessionState.userId) {
              if (sessionState.status !== "authenticated") {
                sessionBudgetSyncKeyRef.current = "";
              }
              return;
            }
  
            const syncKey = [
              sessionState.userId,
              effectiveApiKey,
              resolvedUpstreamUrl,
            ].join(":");
  
            if (sessionBudgetSyncKeyRef.current === syncKey) {
              return;
            }
  
            sessionBudgetSyncKeyRef.current = syncKey;
            void refreshSessionBudgetStatus();
          }, [
            effectiveApiKey,
            hasRealAccess,
            refreshSessionBudgetStatus,
            resolvedUpstreamUrl,
            sessionState.status,
            sessionState.userId,
          ]);
  
          useEffect(() => {
            const urlConnectorRestoreState = consumePlaygroundConnectorBrowserRestoreUrlState();
            const pendingIds = readPendingStatusIndicatorIds();
            const redirectState = readPlaygroundIntegrationRedirectState();
            const storedConnectorRestoreState = readPlaygroundConnectorBrowserRestoreState();
            const projectComposerConnectorRestoreState = readPlaygroundProjectComposerConnectorRestoreState();
            const connectorRestoreState = urlConnectorRestoreState || storedConnectorRestoreState;
            console.info("[connector-debug] startup connector restore effect", {
              urlConnectorRestoreState,
              storedConnectorRestoreState,
              projectComposerConnectorRestoreState,
              connectorRestoreState,
              redirectState,
              pendingIds,
            });
            if (connectorRestoreState) {
              scheduleProjectConnectorBrowserRestore(connectorRestoreState);
            }
            if (projectComposerConnectorRestoreState && isConnectorStatusConnected(projectComposerConnectorRestoreState.provider)) {
              scheduleProjectComposerConnectorBrowserRestore(projectComposerConnectorRestoreState);
            }
            const integrationSourcesToRefresh = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => option.source).concat("gmail");
            integrationSourcesToRefresh.forEach((source) => {
              const shouldRefresh =
                pendingIds.includes(source)
                || String(redirectState?.provider || "") === source
                || String(urlConnectorRestoreState?.provider || "") === source
                || String(storedConnectorRestoreState?.provider || "") === source
                || String(projectComposerConnectorRestoreState?.provider || "") === source;
              if (shouldRefresh) {
                refreshConnectorStatusAfterRedirect(source);
              }
            });
          }, []);
  
          useEffect(() => {
            function handleConnectorBrowserPageShow() {
              const urlRestoreState = consumePlaygroundConnectorBrowserRestoreUrlState();
              const restoreState = urlRestoreState || readPlaygroundConnectorBrowserRestoreState();
              const projectComposerRestoreState = readPlaygroundProjectComposerConnectorRestoreState();
              console.info("[connector-debug] pageshow connector restore check", {
                urlRestoreState,
                restoreState,
                projectComposerRestoreState,
              });
              if (restoreState) {
                scheduleProjectConnectorBrowserRestore(restoreState);
                refreshConnectorStatusAfterRedirect(restoreState.provider);
              }
              if (projectComposerRestoreState) {
                if (isConnectorStatusConnected(projectComposerRestoreState.provider)) {
                  scheduleProjectComposerConnectorBrowserRestore(projectComposerRestoreState);
                }
                refreshConnectorStatusAfterRedirect(projectComposerRestoreState.provider);
              }
            }
  
            window.addEventListener("pageshow", handleConnectorBrowserPageShow);
            return () => window.removeEventListener("pageshow", handleConnectorBrowserPageShow);
          }, []);
  
          useEffect(() => {
            if (!githubStatus.connected) {
              return;
            }
  
            const pendingIds = readPendingStatusIndicatorIds();
            if (!pendingIds.includes("github")) {
              return;
            }
  
            const nextItem = buildStatusIndicatorItem("github", githubStatus.profile);
            removePendingStatusIndicatorId("github");
            if (!nextItem) {
              return;
            }
  
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "github"));
            setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
          }, [githubStatus]);
  
          useEffect(() => {
            const redirectState = readPlaygroundIntegrationRedirectState();
            const redirectProvider = getPlaygroundIntegrationProvider(redirectState?.provider);
            console.info("[connector-debug] connector redirect state effect", {
              redirectProvider,
              providerConnected: isConnectorStatusConnected(redirectProvider),
              redirectState,
            });
            if (!redirectState || !redirectProvider) {
              return;
            }
  
            const savedAt = Number(redirectState.savedAt || 0);
            if (!Number.isFinite(savedAt) || Date.now() - savedAt > 1000 * 60 * 20) {
              clearPlaygroundIntegrationRedirectState();
              return;
            }
  
            const nextActivePage = typeof redirectState.activePage === "string" ? redirectState.activePage : "";
            const nextSettingsSection = typeof redirectState.settingsSection === "string" ? redirectState.settingsSection : "";
            const shouldReopenSettingsTriggerComposer = Boolean(redirectState.reopenSettingsTriggerComposer);
            const connectorBrowserContext = redirectState.connectorBrowser && typeof redirectState.connectorBrowser === "object" && !Array.isArray(redirectState.connectorBrowser)
              ? redirectState.connectorBrowser
              : null;
            const connectorBrowserSource = getPlaygroundTaskConnectorSource(connectorBrowserContext?.source) || "";
            const connectorBrowserMode = connectorBrowserContext?.mode === "project"
              ? "project"
              : connectorBrowserContext?.mode === "project-composer"
                ? "project-composer"
                : "";
            const connectorBrowserProjectId = typeof connectorBrowserContext?.projectId === "string"
              ? connectorBrowserContext.projectId.trim()
              : "";
  
            if (connectorBrowserMode === "project-composer") {
              const projectComposerRestoreState = readPlaygroundProjectComposerConnectorRestoreState();
              if (projectComposerRestoreState && isConnectorStatusConnected(redirectProvider)) {
                scheduleProjectComposerConnectorBrowserRestore(projectComposerRestoreState);
                clearPlaygroundIntegrationRedirectState();
                return;
              }
            }
  
            if (scheduleProjectConnectorBrowserRestore({
              provider: redirectProvider,
              mode: connectorBrowserMode,
              source: connectorBrowserSource,
              projectId: connectorBrowserProjectId,
              view: "overview",
              savedAt,
            })) {
              clearPlaygroundIntegrationRedirectState();
              return;
            }
  
            if (!isConnectorStatusConnected(redirectProvider)) {
              return;
            }
  
            const onboardingContext = redirectState.onboarding && typeof redirectState.onboarding === "object" && !Array.isArray(redirectState.onboarding)
              ? redirectState.onboarding
              : null;
            if (onboardingContext) {
              const onboardingStepIndex = Number.isFinite(Number(onboardingContext.stepIndex))
                ? Math.max(0, Math.min(4, Math.round(Number(onboardingContext.stepIndex))))
                : 0;
              writePlaygroundOnboardingState({ stepIndex: onboardingStepIndex });
              try {
                const url = new URL(window.location.href);
                url.searchParams.set(PLAYGROUND_ONBOARDING_QUERY_PARAM, "true");
                url.searchParams.set(PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM, String(onboardingStepIndex));
                window.history.replaceState({}, "", url.toString());
              } catch {}
              setShowPlaygroundOnboarding(true);
              clearPlaygroundIntegrationRedirectState();
              return;
            }
  
            if (nextActivePage && nextActivePage !== "settings") {
              setActivePage(nextActivePage);
            }
  
            if (nextActivePage === "settings") {
              openSettingsModal(nextSettingsSection || "profile");
              if (nextSettingsSection === "webhooks" && shouldReopenSettingsTriggerComposer) {
                openSettingsTriggerComposer();
              }
            }
  
            clearPlaygroundIntegrationRedirectState();
          }, [githubStatus.connected, gmailStatus.connected, googleDriveStatus.connected, notionStatus.connected, oneDriveStatus.connected]);
  
          useEffect(() => {
            const anyConnectorConnected = Boolean(
              githubStatus.connected
              || gmailStatus.connected
              || googleDriveStatus.connected
              || notionStatus.connected
              || oneDriveStatus.connected
            );
            if (!anyConnectorConnected) return;
            const restoreState = readPlaygroundConnectorBrowserRestoreState();
            const projectComposerRestoreState = readPlaygroundProjectComposerConnectorRestoreState();
            console.info("[connector-debug] connector connected restore effect", {
              restoreState,
              projectComposerRestoreState,
              providerConnected: isConnectorStatusConnected(restoreState?.provider),
              projectComposerProviderConnected: isConnectorStatusConnected(projectComposerRestoreState?.provider),
            });
            if (restoreState && isConnectorStatusConnected(restoreState.provider)) {
              scheduleProjectConnectorBrowserRestore(restoreState);
            }
            if (projectComposerRestoreState && isConnectorStatusConnected(projectComposerRestoreState.provider)) {
              scheduleProjectComposerConnectorBrowserRestore(projectComposerRestoreState);
            }
          }, [githubStatus.connected, gmailStatus.connected, googleDriveStatus.connected, notionStatus.connected, oneDriveStatus.connected]);
  
          useEffect(() => {
            if (isDemoMode) {
              return;
            }
            try {
              localStorage.setItem("runner_demo_api_key", apiKey);
            } catch {}
          }, [apiKey, isDemoMode]);
  
          useEffect(() => {
            try {
              localStorage.setItem("runner_demo_upstream", upstreamUrl);
            } catch {}
            try {
              sessionStorage.setItem("runner_demo_upstream", upstreamUrl);
            } catch {}
          }, [upstreamUrl]);
  
          useEffect(() => {
            try {
              localStorage.setItem("runner_demo_project_id", projectId);
            } catch {}
          }, [projectId]);
  
          useEffect(() => {
            try {
              if (preferredAgentId.trim()) {
                localStorage.setItem("runner_demo_preferred_agent_id", preferredAgentId.trim());
              } else {
                localStorage.removeItem("runner_demo_preferred_agent_id");
              }
            } catch {}
          }, [preferredAgentId]);
  
          useEffect(() => {
            writeCachedIntegrationStatus("github", githubStatus);
          }, [githubStatus]);
  
          useEffect(() => {
            writeCachedIntegrationStatus("notion", notionStatus);
          }, [notionStatus]);
  
          useEffect(() => {
            writeCachedIntegrationStatus("google-drive", googleDriveStatus);
          }, [googleDriveStatus]);
  
          useEffect(() => {
            writeCachedIntegrationStatus("one-drive", oneDriveStatus);
          }, [oneDriveStatus]);
  
          useEffect(() => {
            writeCachedIntegrationStatus("gmail", gmailStatus);
          }, [gmailStatus]);
  
          useEffect(() => {
            try {
              localStorage.setItem("runner_demo_computer_agents_mode", computerAgentsMode ? "true" : "false");
            } catch {}
          }, [computerAgentsMode]);
  
          useEffect(() => {
            if (!notionStatus.connected) {
              return;
            }
  
            const pendingIds = readPendingStatusIndicatorIds();
            if (!pendingIds.includes("notion")) {
              return;
            }
  
            const nextItem = buildStatusIndicatorItem("notion", notionStatus.profile);
            removePendingStatusIndicatorId("notion");
            if (!nextItem) {
              return;
            }
  
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "notion"));
            setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
          }, [notionStatus]);
  
          useEffect(() => {
            if (!googleDriveStatus.connected) {
              return;
            }
  
            const pendingIds = readPendingStatusIndicatorIds();
            if (!pendingIds.includes("google-drive")) {
              return;
            }
  
            const nextItem = buildStatusIndicatorItem("google-drive", googleDriveStatus.profile);
            removePendingStatusIndicatorId("google-drive");
            if (!nextItem) {
              return;
            }
  
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "google-drive"));
            setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
          }, [googleDriveStatus]);
  
          useEffect(() => {
            if (!oneDriveStatus.connected) {
              return;
            }
  
            const pendingIds = readPendingStatusIndicatorIds();
            if (!pendingIds.includes("one-drive")) {
              return;
            }
  
            const nextItem = buildStatusIndicatorItem("one-drive", oneDriveStatus.profile);
            removePendingStatusIndicatorId("one-drive");
            if (!nextItem) {
              return;
            }
  
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "one-drive"));
            setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
          }, [oneDriveStatus]);
  
          useEffect(() => {
            if (!gmailStatus.connected) {
              return;
            }
  
            const pendingIds = readPendingStatusIndicatorIds();
            if (!pendingIds.includes("gmail")) {
              return;
            }
  
            const nextItem = buildStatusIndicatorItem("gmail", gmailStatus.profile);
            removePendingStatusIndicatorId("gmail");
            if (!nextItem) {
              return;
            }
  
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== "gmail"));
            setStatusIndicatorItems((current) => current.some((item) => item.id === nextItem.id) ? current : [...current, nextItem]);
          }, [gmailStatus]);
  
          useEffect(() => {
            if (!hasSessionAuth) {
              return;
            }
  
            void loadSettingsBillingCatalog();
          }, [hasSessionAuth, loadSettingsBillingCatalog]);
  
          useEffect(() => {
            if (!hasSessionAuth) {
              return;
            }
  
