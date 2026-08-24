  ${INFERENCE_APP_SCRIPT_FRAGMENTS.loadLifecycle}
  	          if (
  	            activePage === "organization"
  	            && organizationPageSelectedOrganizationId
	            && (organizationPageActiveTab === "subscription" || organizationPageActiveTab === "billing" || organizationPageActiveTab === "usage")
  	          ) {
  	            if (settingsBillingScopeIdRef.current !== billingOrganizationId) {
  	              settingsBillingScopeIdRef.current = billingOrganizationId;
  	              setSettingsBudgetStatus(null);
	              setSettingsInvoices([]);
	              setSettingsSubscriptions([]);
	              setOrganizationPageProviderBilling(null);
	              setOrganizationPageBillingDocuments([]);
	              setSettingsUsageSummary(createEmptySettingsUsageSummary());
  	              setSettingsUsageBreakdown([]);
  	              setSettingsUsageResourceItems([]);
  	              setSettingsUsageAgentItems([]);
  	              setSettingsUsageEnvironmentItems([]);
  	              setOrganizationPageBillingSummary(null);
  	              setSettingsBillingPeriodOffset(0);
  	            }
	            if (organizationPageActiveTab === "usage") {
	              if (platformDeploymentProfile.product?.usage?.mode !== "observability_only") {
	                void loadSettingsBudgetStatus();
	              }
	              void loadSettingsUsageData();
	              return;
	            }
	            if (organizationPageActiveTab === "subscription") {
	              void loadSettingsPlatformConfig();
	              void loadSettingsBudgetStatus();
	              void loadSettingsInvoices();
	              void loadSettingsUsageData();
	              return;
	            }
  	            void loadSettingsPlatformConfig();
  	            void loadSettingsBudgetStatus();
  	            void loadSettingsInvoices();
  	            if (organizationPageBillingSection === "costs-plans") {
  	              void loadSettingsUsageData();
  	            }
  	            return;
  	          }
          }, [
  	          activePage,
  	          billingOrganizationId,
  	          hasSessionAuth,
  	          organizationPageActiveTab,
  	          organizationPageBillingSection,
  	          organizationPageSelectedOrganizationId,
            loadSettingsBudgetStatus,
            loadSettingsInvoices,
            loadSettingsPlatformConfig,
            loadSettingsUsageData,
          ]);
  
  ${API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle}
          useEffect(() => {
            if (
              activePage !== "configure"
              || !hasSessionAuth
              || !platformHasCapability("commercialUsageLimits")
              || sessionStreamingConfig.status === "loading"
            ) {
              return;
            }
  
            if (settingsBillingScopeIdRef.current !== billingOrganizationId) {
              settingsBillingScopeIdRef.current = billingOrganizationId;
              setSettingsBudgetStatus(null);
              void loadSettingsBudgetStatus();
              return;
            }
  
            if (!settingsBudgetStatus) {
              void loadSettingsBudgetStatus();
            }
          }, [
            activePage,
  	          billingOrganizationId,
            hasSessionAuth,
            loadSettingsBudgetStatus,
            sessionStreamingConfig.status,
            settingsBudgetStatus,
          ]);
  
          useEffect(() => {
            if (
              !showInitialThreadWelcome
              || !hasSessionAuth
              || !platformHasCapability("commercialUsageLimits")
              || sessionStreamingConfig.status === "loading"
              || settingsBudgetStatus
            ) {
              return;
            }
  
            void loadSettingsBudgetStatus();
          }, [
            hasSessionAuth,
            loadSettingsBudgetStatus,
            sessionStreamingConfig.status,
            settingsBudgetStatus,
            showInitialThreadWelcome,
          ]);
  
          useEffect(() => {
            if (
              activePage !== "tools"
              || (toolsView !== "plugins" && toolsView !== "tags")
              || !hasSessionAuth
            ) {
              return;
            }

            let cancelled = false;
            let fallbackTimer = 0;
            let idleCallback = 0;
            const refreshConnectors = async () => {
              const refreshes = [
                loadSettingsEmailStatus,
                loadSettingsDiscordStatus,
                loadSettingsTelegramStatus,
                refreshGithubStatus,
                refreshGmailStatus,
                refreshGoogleDriveStatus,
                refreshOneDriveStatus,
                refreshNotionStatus,
                loadSettingsTriggers,
              ];
              // Keep the connector overview responsive even when its remote
              // control plane is under pressure. Small batches avoid turning
              // one page visit into a burst that exhausts the API/SQL pool.
              for (let index = 0; index < refreshes.length; index += 2) {
                if (cancelled) return;
                await Promise.allSettled(
                  refreshes
                    .slice(index, index + 2)
                    .map((refresh) => refresh()),
                );
              }
            };
            const scheduleRefresh = () => {
              if (!cancelled) void refreshConnectors();
            };
            if (typeof window.requestIdleCallback === "function") {
              idleCallback = window.requestIdleCallback(scheduleRefresh, {
                timeout: 750,
              });
            } else {
              fallbackTimer = window.setTimeout(scheduleRefresh, 150);
            }
            return () => {
              cancelled = true;
              if (idleCallback && typeof window.cancelIdleCallback === "function") {
                window.cancelIdleCallback(idleCallback);
              }
              if (fallbackTimer) {
                window.clearTimeout(fallbackTimer);
              }
            };
          }, [
            activePage,
            hasSessionAuth,
            loadSettingsDiscordStatus,
            loadSettingsEmailStatus,
            loadSettingsTelegramStatus,
            loadSettingsTriggers,
            toolsView,
          ]);
  
          useEffect(() => {
            const discordSuccess = readCurrentSearchParam("discord_success");
            const discordError = readCurrentSearchParam("discord_error");
  
            if (!discordSuccess && !discordError) {
              return;
            }
  
            setSettingsDiscordSuccess(discordSuccess);
            setSettingsDiscordError(discordError);
            setSidebarWorkspaceMode("configure");
            setToolsView("tags");
            setSelectedPluginId("discord");
            setActivePage("tools");
            if (discordSuccess) {
              window.dispatchEvent(new CustomEvent("integrations-updated"));
            }
  
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete("discord_success");
              url.searchParams.delete("discord_error");
              window.history.replaceState({}, "", url.pathname + url.search + url.hash);
            } catch {
            }
          }, []);
  
          useEffect(() => {
            if (activePage !== "tools" || (toolsView !== "plugins" && toolsView !== "tags")) {
              setSelectedPluginId("");
              setPluginsNavPopover("");
            }
          }, [activePage, toolsView]);

          useEffect(() => {
            if (activePage === "tools" && toolsView === "prompts") {
              return;
            }
            setToolsPromptsHeaderState({
              mode: "overview",
              title: "Prompts",
              promptId: "",
              versionNumber: 0,
              versionQualifier: "",
            });
          }, [activePage, toolsView]);
  
          useEffect(() => {
            const returnTarget = normalizePlatformPluginConnectionReturnTarget(
              connectorAuthReturnTargetRef.current,
            );
            const isReturningToAuthentication =
              returnTarget
              && returnTarget.resourceId === String(selectedPluginId || "").trim().toLowerCase()
              && returnTarget.toolsView === toolsView;
            setPluginDetailTab(isReturningToAuthentication ? "tutorial" : "general");
            setTagDetailPropertyPopover("");
            setTagPluginAccessPrincipalId("");
            setTagPluginAccessRoleId("member");
          }, [selectedPluginId]);
  
          useEffect(() => () => {
            Object.values(tagDetailAutosaveTimersRef.current || {}).forEach((timer) => {
              if (timer) {
                window.clearTimeout(timer);
              }
            });
            tagDetailAutosaveTimersRef.current = {};
          }, []);
  
          useEffect(() => {
            if (
              activePage !== "tools"
              || (toolsView !== "tags" && toolsView !== "plugins")
              || !selectedPluginId
            ) {
              return;
            }
            const refreshStatus = getConnectorStatusRefresh(selectedPluginId);
            if (typeof refreshStatus === "function") {
              void refreshStatus({ clearPendingOnFailure: false });
            }
            void loadTagDetailConfig(selectedPluginId);
          }, [activePage, toolsView, selectedPluginId, hasSessionAuth]);

          function listManagedConnectorStatusProviderIds() {
            return listPlatformConnectorCatalogEntries("plugin")
              .filter((entry) => (
                entry.authentication === "oauth2"
                || entry.authentication === "api-key"
                || entry.authentication === "service-account"
              ))
              .map((entry) => entry.id);
          }

          useEffect(() => {
            if (
              !hasSessionAuth
              || sessionState.status !== "authenticated"
              || !sessionState.userId
            ) {
              return;
            }
            listManagedConnectorStatusProviderIds().forEach((provider) => {
              const refreshStatus = getConnectorStatusRefresh(provider);
              if (typeof refreshStatus === "function") {
                void refreshStatus({ forceRefresh: true });
              }
            });
          }, [
            hasSessionAuth,
            sessionState.status,
            sessionState.userId,
            billingOrganizationId,
            settingsBudgetStatus?.organizationId,
          ]);
  
          useEffect(() => {
            if (activePage === "tools" && toolsView === "skills") {
              return;
            }
            setToolsSkillsHeaderState({
              mode: "overview",
              title: "",
            });
          }, [activePage, toolsView]);
  
          useEffect(() => {
            if (activePage !== "tools" || !pluginsNavPopover) {
              return;
            }
  
            function handlePluginsNavPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !pluginsNavActionsRef.current || pluginsNavActionsRef.current.contains(target)) {
                return;
              }
              setPluginsNavPopover("");
            }
  
            document.addEventListener("mousedown", handlePluginsNavPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handlePluginsNavPopoverPointerDown);
          }, [activePage, pluginsNavPopover]);
  
  	        useEffect(() => {
  	          if (!settingsModalOpen || settingsSection !== "profile") {
  	            return;
  	          }
  
            setProfileDraft(buildProfileDraftFromSession());
            setProfileSaveState({ status: "idle", error: "" });
            setSettingsVerificationError("");
            setSettingsVerificationResent(false);
            if (hasSessionAuth) {
              void loadSettingsMarketingConsent();
            }
          }, [
            hasSessionAuth,
            settingsModalOpen,
            settingsSection,
            loadSettingsMarketingConsent,
          ]);
  
          useEffect(() => {
            if (settingsSection !== "webhooks") {
              setSettingsCreatingTrigger(false);
              setSettingsSelectedTriggerId("");
              setSettingsShowTriggerSecret(false);
              setIsSettingsTriggerPromptEditing(false);
            }
  
            if (settingsSection !== "api") {
              setSettingsApiKeyDialogOpen(false);
            }
          }, [settingsSection]);
  
          useEffect(() => {
            if (!settingsCreatingTrigger) {
              return;
            }
            window.requestAnimationFrame(() => {
              resizeSettingsTriggerPromptTextarea(settingsTriggerPromptTextareaRef.current);
            });
          }, [
            settingsCreatingTrigger,
            settingsTriggerForm.actionType,
            settingsTriggerForm.message,
          ]);
  
          useEffect(() => {
            if (!settingsCreatingTrigger || settingsTriggerForm.source !== "github") {
              setSettingsTriggerGithubReposLoading(false);
              setSettingsTriggerGithubReposError("");
              if (!settingsCreatingTrigger) {
                setSettingsTriggerGithubRepos([]);
              }
              return;
            }
  
            if (!githubStatus.connected) {
              setSettingsTriggerGithubRepos([]);
              setSettingsTriggerGithubReposLoading(false);
              setSettingsTriggerGithubReposError("");
              return;
            }
  
            void loadSettingsTriggerGithubRepos();
          }, [
            githubStatus.connected,
            loadSettingsTriggerGithubRepos,
            settingsCreatingTrigger,
            settingsTriggerForm.source,
          ]);
  
          useEffect(() => {
            setSettingsShowTriggerSecret(false);
            setSettingsCopiedField("");
          }, [settingsSelectedTriggerId]);

          function buildDemoConnectorAccounts(status, connectorLabel) {
            const credentials = normalizePlatformConnectionCredentials(status?.credentials)
              .filter((credential) => credential.status !== "invalid");
            if (credentials.length === 0) {
              return [];
            }
            const configuredDefaultId = String(status?.defaultCredentialId || "").trim();
            const defaultCredential = credentials.find((credential) => (
              credential.id === configuredDefaultId || credential.isDefault
            )) || credentials[0];
            return credentials.map((credential) => ({
              id: credential.id,
              name: credential.name || credential.identity || `${connectorLabel} account`,
              identity: credential.identity || credential.name || "Connected account",
              isDefault: credential.id === defaultCredential.id,
              disabled: credential.status === "pending",
            }));
          }

          const demoComputerAgents = useMemo(() => {
            const connectorOptions = listPlatformConnectorCatalogEntries().map((connector) => {
              const providerStatus = getConnectorStatusRecord(connector.id);
              const detailConfig = getCurrentTagDetailConfig(connector.id);
              const credentials = normalizePlatformConnectionCredentials(detailConfig.credentials);
              const channelConnected = connector.id === "discord"
                ? Boolean(settingsDiscordStatus?.linked && settingsDiscordStatus?.verified)
                : connector.id === "telegram"
                  ? Boolean(settingsTelegramStatus?.linked && settingsTelegramStatus?.verified)
                  : connector.id === "email"
                    ? Boolean(settingsEmailStatus?.linked && settingsEmailStatus?.verified)
                    : false;
              const connected = Boolean(
                providerStatus?.connected
                || detailConfig.linked
                || detailConfig.verified
                || credentials.some((credential) => credential.status === "valid")
                || channelConnected
              );

              return {
                id: connector.id,
                name: connector.label,
                kind: connector.kind,
                description: connector.functionsLabel || connector.description,
                keywords: [
                  connector.shortLabel,
                  connector.category,
                  connector.categoryLabel,
                  connector.authenticationLabel,
                ].filter(Boolean),
                logoUrl: connector.logoUrl,
                connected,
                onConnect: () => {
                  setSelectedPluginId(connector.id);
                  setPluginDetailTab("tutorial");
                  openToolsView(connector.kind === "tag" ? "tags" : "plugins");
                  return false;
                },
              };
            });

            return {
              connectors: connectorOptions,
              github: {
                connected: githubStatus.connected,
                accounts: buildDemoConnectorAccounts(githubStatus, "GitHub"),
                disconnectToken: githubDisconnectToken,
                onConnect: handleGithubAuthConnect,
                onDisconnect: handleGithubAuthDisconnect,
                fetchItems: handleGithubFetchItems,
                fetchBranches: handleGithubFetchBranches,
                fetchFileContent: handleGithubFetchFileContent,
              },
              notion: {
                connected: notionStatus.connected,
                accounts: buildDemoConnectorAccounts(notionStatus, "Notion"),
                databases: notionDatabases,
                onConnect: handleNotionAuthConnect,
                onDisconnect: handleNotionAuthDisconnect,
                fetchDatabases: handleNotionFetchDatabases,
              },
              googleDrive: {
                connected: googleDriveStatus.connected,
                accounts: buildDemoConnectorAccounts(googleDriveStatus, "Google Drive"),
                rootLabel: "My Drive",
                onConnect: handleGoogleDriveAuthConnect,
                onDisconnect: handleGoogleDriveAuthDisconnect,
                onManageAccess: handleGoogleDriveManageAccess,
                fetchItems: handleGoogleDriveFetchItems,
                fetchFileContent: handleGoogleDriveFetchFileContent,
              },
              oneDrive: {
                connected: oneDriveStatus.connected,
                accounts: buildDemoConnectorAccounts(oneDriveStatus, "OneDrive"),
                rootLabel: "OneDrive",
                onConnect: handleOneDriveAuthConnect,
                onDisconnect: handleOneDriveAuthDisconnect,
                fetchItems: handleOneDriveFetchItems,
                fetchFileContent: handleOneDriveFetchFileContent,
              },
              workspace: {
                items: [
                  { id: "ws_file_runner", name: "src/react/runner-chat.tsx", mimeType: "text/typescript" },
                  { id: "ws_file_css", name: "src/react/runner-chat.css", mimeType: "text/css" },
                  { id: "ws_file_demo", name: "apps/platform/server/index.mjs", mimeType: "text/javascript" }
                ]
              },
              schedule: {
                enabled: false,
                presets: [
                  { id: "daily", label: "Every day", cron: "0 9 * * *" },
                  { id: "weekdays", label: "Every weekday", cron: "0 9 * * 1-5" },
                  { id: "weekly", label: "Every week", cron: "0 9 * * 1" }
                ]
              }
            };
          }, [
            githubDisconnectToken,
            githubStatus.connected,
            githubStatus.credentials,
            githubStatus.defaultCredentialId,
            gmailStatus.connected,
            googleDriveStatus.connected,
            googleDriveStatus.credentials,
            googleDriveStatus.defaultCredentialId,
            jiraStatus.connected,
            notionDatabases,
            notionStatus.connected,
            notionStatus.credentials,
            notionStatus.defaultCredentialId,
            oneDriveStatus.connected,
            oneDriveStatus.credentials,
            oneDriveStatus.defaultCredentialId,
            settingsDiscordStatus?.linked,
            settingsDiscordStatus?.verified,
            settingsEmailStatus?.linked,
            settingsEmailStatus?.verified,
            settingsTelegramStatus?.linked,
            settingsTelegramStatus?.verified,
            tagDetailConfigsById,
          ]);

          const runnerWorkspaceProjects = useMemo(() => {
            if (!hasRealAccess) {
              return [];
            }
            return realProjects
              .filter((project) => String(project?.id || "").trim())
              .map((project) => ({
                id: String(project.id || "").trim(),
                name: String(project.name || "").trim() || "Untitled Project",
                description: String(project.description || "").trim(),
                defaultEnvironmentId: String(project.defaultEnvironmentId || "").trim() || null,
                icon: resolvePlaygroundProjectIconId(project),
                color: project.color || null,
                metadata: project.metadata || null,
              }));
          }, [hasRealAccess, realProjects]);
          const runtimeAgents = useMemo(() => {
            if (hasRealAccess) {
              return realAgents
                .filter((agent) => !isPlaygroundAgentCreatorAgent(agent) && !isPlaygroundMissionControlAgent(agent))
                .map((agent) => buildPlaygroundRunnerAgentOption(agent));
            }
            return demoAgents.map((agent) => buildPlaygroundRunnerAgentOption(agent));
          }, [demoAgents, hasRealAccess, realAgents]);
          const welcomeComposerTaskPreviews = useMemo(() => {
            const selectedProjectId = String(welcomeWidgetsState.projectId || latestInteractedProjectId || "").trim();
            return (Array.isArray(welcomeWidgetsState.tasks) ? welcomeWidgetsState.tasks : [])
              .map((task) => normalizePlaygroundTaskRecord(task))
              .filter((task) => {
                if (!task?.id || String(task.status || "").trim() === "done") {
                  return false;
                }
                const taskProjectId = String(task.projectId || selectedProjectId || "").trim();
                return !selectedProjectId || !taskProjectId || taskProjectId === selectedProjectId;
              })
              .slice()
              .sort((left, right) => {
                const leftNeedsHuman = isPlaygroundHumanAttentionTask(left) ? 1 : 0;
                const rightNeedsHuman = isPlaygroundHumanAttentionTask(right) ? 1 : 0;
                if (leftNeedsHuman !== rightNeedsHuman) {
                  return rightNeedsHuman - leftNeedsHuman;
                }
                const leftUpdatedAt = Date.parse(left?.updatedAt || left?.createdAt || 0) || 0;
                const rightUpdatedAt = Date.parse(right?.updatedAt || right?.createdAt || 0) || 0;
                if (leftUpdatedAt !== rightUpdatedAt) {
                  return rightUpdatedAt - leftUpdatedAt;
                }
                const leftTicketNumber = parsePlaygroundTaskTicketNumber(welcomeWidgetTicketNumbersById[left.id] || left?.ticketNumber);
                const rightTicketNumber = parsePlaygroundTaskTicketNumber(welcomeWidgetTicketNumbersById[right.id] || right?.ticketNumber);
                return rightTicketNumber - leftTicketNumber;
              })
              .map((task) => ({
                ...buildWelcomeWidgetTaskPreview(task),
                showPromptPreview: true,
              }));
          }, [
            latestInteractedProjectId,
            realAgents,
            runtimeEnvironments,
            welcomeWidgetProject,
            welcomeWidgetTicketNumbersById,
            welcomeWidgetsState.projectId,
            welcomeWidgetsState.tasks,
          ]);
          const hasAnyWelcomeComposerOpenBacklogTask = useMemo(() => {
            const projectSummaryHasOpenTasks = (Array.isArray(realProjects) ? realProjects : []).some((project) => (
              Number(project?.summary?.openTasksCount || 0) > 0
            ));
            if (projectSummaryHasOpenTasks) {
              return true;
            }
            return welcomeComposerTaskPreviews.length > 0;
          }, [realProjects, welcomeComposerTaskPreviews]);
          const showWelcomeComposerCreateAgentAction = showInitialThreadWelcome
            && welcomeWidgetsState.status === "ready"
            && !hasAnyWelcomeComposerOpenBacklogTask;
          const selectedWelcomeComposerTaskPreview = useMemo(() => {
            const selectedTaskId = String(selectedWelcomeComposerTaskId || "").trim();
            if (!selectedTaskId) {
              return null;
            }
            return welcomeComposerTaskPreviews.find((taskPreview) => taskPreview.taskId === selectedTaskId) || null;
          }, [selectedWelcomeComposerTaskId, welcomeComposerTaskPreviews]);
          useEffect(() => {
            if (selectedWelcomeComposerTaskId && !selectedWelcomeComposerTaskPreview) {
              setSelectedWelcomeComposerTaskId("");
            }
          }, [selectedWelcomeComposerTaskId, selectedWelcomeComposerTaskPreview]);
          const runtimeAgentsById = useMemo(() => {
            const next = {};
            runtimeAgents.forEach((agent) => {
              const normalizedAgentId = String(agent?.id || "").trim();
              if (!normalizedAgentId) {
                return;
              }
              next[normalizedAgentId] = agent;
            });
            return next;
          }, [runtimeAgents]);
          const runtimeAgentIdsByNormalizedName = useMemo(() => {
            const next = new Map();
            runtimeAgents.forEach((agent) => {
              const normalizedAgentId = String(agent?.id || "").trim();
              const normalizedAgentName = String(agent?.name || "").trim().toLowerCase();
              if (!normalizedAgentId || !normalizedAgentName || next.has(normalizedAgentName)) {
                return;
              }
              next.set(normalizedAgentName, normalizedAgentId);
            });
            return next;
          }, [runtimeAgents]);
          const resolvedEnvironmentId = useMemo(() => {
            if (environmentId.trim()) {
              return environmentId.trim();
            }
            const persistedEnvironmentId = resolvePlaygroundPersistedWorkspaceEnvironmentId(
              PLAYGROUND_RUNNER_CHAT_APP_ID,
              proxyBackendBase,
              runtimeEnvironments,
              runnerWorkspaceProjects
            );
            if (persistedEnvironmentId) {
              return persistedEnvironmentId;
            }
            if (hasRealAccess && realEnvironments.length > 0) {
              const defaultEnvironment = realEnvironments.find((environment) => environment.isDefault) || realEnvironments[0];
              return defaultEnvironment?.id || "";
            }
            return hasRealAccess ? "" : computerAgentsMode ? "env_default" : "";
          }, [computerAgentsMode, environmentId, hasRealAccess, proxyBackendBase, realEnvironments, runnerWorkspaceProjects, runtimeEnvironments]);
          const defaultShellEnvironmentId = useMemo(() => {
            if (!hasRealAccess || realEnvironments.length === 0) {
              return "";
            }
            const defaultEnvironment = realEnvironments.find((environment) => environment?.isDefault) || realEnvironments[0];
            return defaultEnvironment?.id || "";
          }, [hasRealAccess, realEnvironments]);
          const resolvedPreferredAgentId = useMemo(() => {
            const normalizedPreferredAgentId = preferredAgentId.trim();
            if (normalizedPreferredAgentId) {
              const preferredRealAgent = realAgents.find((agent) => agent?.id === normalizedPreferredAgentId) || null;
              const isDefaultTeamAgent = preferredRealAgent?.isDefault && getPlaygroundAgentListMode(preferredRealAgent) === "teams";
              if (!hasRealAccess && !preferredRealAgent) {
                return normalizedPreferredAgentId;
              }
              if (
                preferredRealAgent
                && !isDefaultTeamAgent
                && !isPlaygroundAgentCreatorAgent(preferredRealAgent)
                && !isPlaygroundMissionControlAgent(preferredRealAgent)
              ) {
                return normalizedPreferredAgentId;
              }
            }
            const visibleRealAgents = realAgents.filter((agent) =>
              !isPlaygroundAgentCreatorAgent(agent) && !isPlaygroundMissionControlAgent(agent)
            );
            if (hasRealAccess && visibleRealAgents.length > 0) {
              const defaultAgent = getPlaygroundPreferredDefaultAgent(visibleRealAgents);
              return defaultAgent?.id || "";
            }
            return hasRealAccess ? "" : computerAgentsMode ? "agent_assistant" : "";
          }, [computerAgentsMode, hasRealAccess, preferredAgentId, realAgents]);
          const proactivelyWarmDefaultEnvironment = useCallback(async function proactivelyWarmDefaultEnvironment(nextEnvironmentId, nextAgentId = "") {
            const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
            const normalizedAgentId = String(nextAgentId || "").trim();
            if (!hasRealAccess || !normalizedEnvironmentId) {
              return;
            }
  
            const requestKey = buildPlaygroundEnvironmentWarmRequestKey(normalizedEnvironmentId, normalizedAgentId);
            const cachedUntilMs = Math.max(
              Number(proactiveDefaultEnvironmentWarmCacheUntilMsRef.current.get(requestKey) || 0),
              readSharedEnvironmentWarmCacheUntilMs(requestKey),
            );
            if (cachedUntilMs > Date.now()) {
              return;
            }
  
            const existingPromise =
              proactiveDefaultEnvironmentWarmPromisesRef.current.get(requestKey)
              || readSharedEnvironmentStartPromise(requestKey);
            if (existingPromise) {
              return existingPromise;
            }
  
            const warmPromise = (async () => {
              try {
                const response = await fetch(proxyBackendBase + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/start", {
                  method: "POST",
                  headers: {
                    ...authRequestHeaders,
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    ...(normalizedAgentId ? { agentId: normalizedAgentId } : {}),
                  }),
                });
  
                if (isUnauthorizedStatus(response.status)) {
                  proactiveDefaultEnvironmentWarmCacheUntilMsRef.current.delete(requestKey);
                  writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
                  triggerPlatformSessionRecovery();
                  return;
                }
  
                if (!response.ok) {
                  proactiveDefaultEnvironmentWarmCacheUntilMsRef.current.delete(requestKey);
                  writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
                  return;
                }
  
                const nextWarmCacheUntilMs = Date.now() + 4 * 60 * 1000;
                proactiveDefaultEnvironmentWarmCacheUntilMsRef.current.set(requestKey, nextWarmCacheUntilMs);
                writeSharedEnvironmentWarmCacheUntilMs(requestKey, nextWarmCacheUntilMs);
              } finally {
                if (proactiveDefaultEnvironmentWarmPromisesRef.current.get(requestKey) === warmPromise) {
                  proactiveDefaultEnvironmentWarmPromisesRef.current.delete(requestKey);
                }
                if (readSharedEnvironmentStartPromise(requestKey) === warmPromise) {
                  writeSharedEnvironmentStartPromise(requestKey, null);
                }
              }
            })();
  
            proactiveDefaultEnvironmentWarmPromisesRef.current.set(requestKey, warmPromise);
            writeSharedEnvironmentStartPromise(requestKey, warmPromise);
            return warmPromise;
          }, [authRequestHeaders, hasRealAccess, proxyBackendBase, triggerPlatformSessionRecovery]);
  ${ONBOARDING_APP_SCRIPT_FRAGMENTS.runtime}
          useEffect(() => {
            const shouldWarmDefaultEnvironment =
              hasRealAccess
              && Boolean(defaultShellEnvironmentId)
              && (activePage === "tasks" || showInitialThreadWelcome);
  
            if (!shouldWarmDefaultEnvironment) {
              return undefined;
            }
  
            void proactivelyWarmDefaultEnvironment(
              defaultShellEnvironmentId,
              resolvedPreferredAgentId,
            ).catch(() => undefined);
            return undefined;
          }, [
            activePage,
            defaultShellEnvironmentId,
            hasRealAccess,
            proactivelyWarmDefaultEnvironment,
            resolvedPreferredAgentId,
            showInitialThreadWelcome,
          ]);
          const buildLiveThreadTaskPreview = useCallback(function buildLiveThreadTaskPreview(taskRecord, existingPreview, threadId = "") {
            const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
            const normalizedThreadId = String(threadId || existingPreview?.threadId || "").trim();
            const assigneeAgentId = normalizedTask.assigneeAgentId || "";
            const environmentId = normalizedTask.environmentId || "";
            const assigneeAgent = assigneeAgentId
              ? (
                isPlaygroundHumanAssigneeId(assigneeAgentId)
                  ? null
                  : (runtimeAgents.find((agent) => agent.id === assigneeAgentId) || null)
              )
              : null;
            const assigneeName = assigneeAgentId
              ? (
                isPlaygroundHumanAssigneeId(assigneeAgentId)
                  ? "Me"
                  : assigneeAgent?.name
                    || (existingPreview?.assigneeAgentId === assigneeAgentId ? existingPreview?.assigneeName || "" : "")
              )
              : "";
            const assigneePhotoUrl = assigneeAgentId
              ? (
                isPlaygroundHumanAssigneeId(assigneeAgentId)
                  ? (canRenderAvatarImage(accountAvatarUrl) ? accountAvatarUrl : "")
                  : normalizeSessionPhotoUrl(assigneeAgent ? getPlaygroundAgentProfilePhotoUrl(assigneeAgent) : "")
              )
              : "";
            const environmentName = environmentId
              ? runtimeEnvironments.find((environment) => environment.id === environmentId)?.name
                || (existingPreview?.environmentId === environmentId ? existingPreview?.environmentName || "" : "")
              : "";
            return {
              ...(existingPreview && typeof existingPreview === "object" ? existingPreview : {}),
              taskId: normalizedTask.id,
              projectId: normalizedTask.projectId || existingPreview?.projectId || "",
              projectName: existingPreview?.projectName || "",
              threadId: normalizedThreadId,
              ticketNumber: normalizePlaygroundTaskTicketNumber(normalizedTask.ticketNumber || existingPreview?.ticketNumber) || "000",
              title: normalizedTask.title || existingPreview?.title || "Untitled Task",
              description: normalizedTask.description || existingPreview?.description || "",
              status: normalizedTask.status || existingPreview?.status || "todo",
              priority: normalizedTask.priority || existingPreview?.priority || "medium",
              taskType: normalizePlaygroundTaskType(normalizedTask.taskType || existingPreview?.taskType),
              assigneeAgentId,
              assigneeName,
              assigneePhotoUrl,
              reviewRequired: normalizedTask.reviewRequired === true,
              reviewerAgentId: normalizedTask.reviewerAgentId || existingPreview?.reviewerAgentId || "",
              runKind: String(existingPreview?.runKind || "").trim(),
              sourceThreadId: String(existingPreview?.sourceThreadId || "").trim(),
              environmentId,
              environmentName,
              isDeleted: false,
            };
          }, [accountAvatarUrl, runtimeAgents, runtimeEnvironments]);
          const mergeThreadTaskPreviewRecord = useCallback(function mergeThreadTaskPreviewRecord(basePreview, incomingPreview, threadId = "") {
            const base = basePreview && typeof basePreview === "object" ? basePreview : {};
            const incoming = incomingPreview && typeof incomingPreview === "object" ? incomingPreview : {};
            const normalizedThreadId = String(threadId || incoming.threadId || base.threadId || "").trim();
            const normalizedIncomingTicketNumber = normalizePlaygroundTaskTicketNumber(incoming.ticketNumber || "");
            const normalizedBaseTicketNumber = normalizePlaygroundTaskTicketNumber(base.ticketNumber || "");
            const incomingStatus = String(incoming.status || "").trim();
            const baseStatus = String(base.status || "").trim();
            const mergedStatus = baseStatus === "done" && incomingStatus && incomingStatus !== "done"
              ? baseStatus
              : (incomingStatus || baseStatus || "todo");
            return {
              ...base,
              ...incoming,
              taskId: String(incoming.taskId || base.taskId || "").trim(),
              projectId: String(incoming.projectId || base.projectId || "").trim(),
              projectName: String(incoming.projectName || base.projectName || "").trim(),
              threadId: normalizedThreadId,
              ticketNumber: normalizedIncomingTicketNumber || normalizedBaseTicketNumber || "",
              title: String(incoming.title || base.title || "").trim(),
              description: typeof incoming.description === "string"
                ? incoming.description
                : (typeof base.description === "string" ? base.description : ""),
              taskColor: getPlaygroundTaskColorId(incoming.taskColor || base.taskColor),
              status: mergedStatus,
              priority: String(incoming.priority || base.priority || "medium").trim() || "medium",
              taskType: normalizePlaygroundTaskType(incoming.taskType || base.taskType),
              assigneeAgentId: String(incoming.assigneeAgentId || base.assigneeAgentId || "").trim(),
              assigneeName: String(incoming.assigneeName || base.assigneeName || "").trim(),
              assigneePhotoUrl: String(incoming.assigneePhotoUrl || base.assigneePhotoUrl || "").trim(),
              reviewRequired: incoming.reviewRequired === true || base.reviewRequired === true,
              reviewerAgentId: String(incoming.reviewerAgentId || base.reviewerAgentId || "").trim(),
              runKind: String(incoming.runKind || base.runKind || "").trim(),
              showPromptPreview: incoming.showPromptPreview === true || base.showPromptPreview === true,
              sourceThreadId: String(incoming.sourceThreadId || base.sourceThreadId || "").trim(),
              environmentId: String(incoming.environmentId || base.environmentId || "").trim(),
              environmentName: String(incoming.environmentName || base.environmentName || "").trim(),
              isDeleted: Boolean(incoming.isDeleted || base.isDeleted),
            };
          }, []);
          const resolvedUpstreamHost = useMemo(() => {
            try {
              return new URL(resolvedUpstreamUrl).host;
            } catch {
              return resolvedUpstreamUrl || "Unknown";
            }
          }, [resolvedUpstreamUrl]);
          const resolvedEnvironmentName = useMemo(() => {
            return runtimeEnvironments.find((environment) => environment.id === resolvedEnvironmentId)?.name
              || (resolvedEnvironmentId ? resolvedEnvironmentId : "Automatic");
          }, [resolvedEnvironmentId, runtimeEnvironments]);
          const resolvedAgentName = useMemo(() => {
            return runtimeAgents.find((agent) => agent.id === resolvedPreferredAgentId)?.name
              || (resolvedPreferredAgentId ? resolvedPreferredAgentId : "Automatic");
          }, [resolvedPreferredAgentId, runtimeAgents]);
          const connectedIntegrationCount = useMemo(() => {
            return [
              githubStatus.connected,
              gmailStatus.connected,
              notionStatus.connected,
              googleDriveStatus.connected,
              oneDriveStatus.connected,
            ].filter(Boolean).length;
          }, [githubStatus.connected, gmailStatus.connected, notionStatus.connected, googleDriveStatus.connected, oneDriveStatus.connected]);
          const settingsCurrentTierId = useMemo(() => {
            if (!platformHasCapability("subscriptions")) {
              // Deployment-license profiles use the existing enterprise UI
              // feature paths without exposing subscription commerce.
              return "enterprise";
            }
            const activeSubscriptionTier = settingsSubscriptions.find((subscription) =>
              ["active", "on_trial", "past_due"].includes(String(subscription?.status || "").toLowerCase())
              && !subscription?.cancelled
              && typeof subscription?.tier === "string"
              && subscription.tier.trim()
            )?.tier;
            return normalizeSettingsTierId(
              settingsBudgetStatus?.planId
              || settingsBudgetStatus?.organizationPlan?.id
              || activeSubscriptionTier
              || settingsBudgetStatus?.tier
              || sessionState.subscriptionTier
            ) || "sandbox";
          }, [settingsBudgetStatus, sessionState.subscriptionTier, settingsSubscriptions]);
          const settingsCanConfigureUsageBilling = platformHasCapability("commercialUsageLimits")
            && settingsCurrentTierId !== "sandbox";
          const settingsCanConfigureBusinessFeatures = settingsCurrentTierId === "team" || settingsCurrentTierId === "enterprise";
          const canGenerateVideo = hasDemoAccess || (normalizeSettingsTierId(settingsCurrentTierId || accountTierId || "sandbox") || "sandbox") !== "sandbox";
          const canGenerateImagineVideo = canGenerateVideo;
          const demoSkills = useMemo(() => baseDemoSkills.map((skill) => (
            skill.id === "video_generation"
              ? { ...skill, enabled: canGenerateVideo }
              : skill
          )), [canGenerateVideo]);
          useEffect(() => {
            setRunnerEnabledSkillIds((current) => {
              const normalizedCurrent = normalizePlaygroundEnabledSkillIds(current);
              if (!canGenerateVideo) {
                const next = normalizedCurrent.filter((skillId) => skillId !== "video_generation");
                return next.length === normalizedCurrent.length ? current : next;
              }
              if (normalizedCurrent.includes("video_generation")) {
                return current;
              }
              return normalizedCurrent.concat("video_generation");
            });
          }, [canGenerateVideo]);
          const sidebarPlanTierId = hasShellAccess ? (settingsCurrentTierId || accountTierId || "sandbox") : "";
          const sidebarPlanIsPaid = hasShellAccess && sidebarPlanTierId !== "sandbox";
          const sidebarPlanName = hasShellAccess && !platformHasCapability("subscriptions")
            ? "Appliance"
            : hasShellAccess
            ? formatSubscriptionTier(sidebarPlanTierId || "sandbox") + " Plan"
            : "Computer Agents";
          const sidebarPlanActionLabel = hasShellAccess
            ? (sidebarPlanIsPaid ? "Manage Plan" : "Upgrade Plan for $0")
            : "Sign in";
          const settingsPrimarySubscription = useMemo(() => {
            return settingsSubscriptions.find((subscription) =>
              ["active", "on_trial", "past_due"].includes(String(subscription?.status || "").toLowerCase()) && !subscription?.cancelled
            ) || settingsSubscriptions[0] || null;
          }, [settingsSubscriptions]);
          const settingsUsageDashboard = useMemo(() => {
            const byDay = Array.isArray(settingsUsageSummary?.byDay)
              ? settingsUsageSummary.byDay
                .filter((entry) => entry && entry.date)
                .slice()
                .sort((left, right) => String(left.date).localeCompare(String(right.date)))
              : [];
            const periodStartValue = settingsBudgetStatus?.periodStartDate || settingsUsageSummary?.startDate || "";
            const periodEndValue = settingsBudgetStatus?.periodEndDate || settingsUsageSummary?.endDate || "";
            const periodStartDate = periodStartValue ? new Date(periodStartValue) : null;
            const periodEndDate = periodEndValue ? new Date(periodEndValue) : null;
            const hasValidPeriodBounds = Boolean(
              periodStartDate
              && periodEndDate
              && !Number.isNaN(periodStartDate.getTime())
              && !Number.isNaN(periodEndDate.getTime())
            );
            const periodDays = hasValidPeriodBounds
              ? Math.max(1, Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1000)))
              : 30;
            const totalUsedCT = Math.max(
              readSettingsComputeTokens(settingsUsageSummary?.totals, "totalCT", "totalCost"),
              settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["currentPeriodUsage", "usage", "usedCredits"]))
            );
            const quotaCT = Math.max(
              settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["includedCredits", "includedTierQuota", "tierQuota"])),
              totalUsedCT
            );
            const remainingCT = Math.max(0, quotaCT - totalUsedCT);
            const remainingPercentage = quotaCT > 0 ? clampSettingsPercentage((remainingCT / quotaCT) * 100) : 100;
            const dailyAllowanceCT = quotaCT > 0 ? Math.max(1, Math.round(quotaCT / periodDays)) : 0;
            const weeklyAllowanceCT = dailyAllowanceCT > 0 ? Math.max(dailyAllowanceCT, dailyAllowanceCT * 7) : 0;
            const last7Days = byDay.slice(-7);
            const last7UsedCT = last7Days.reduce((sum, entry) => sum + Math.max(0, Number(entry?.totalCT || 0)), 0);
            const last7ThreadCount = last7Days.reduce((sum, entry) => sum + Math.max(0, Number(entry?.threadCount || 0)), 0);
            const weeklyRemainingCT = Math.max(0, weeklyAllowanceCT - last7UsedCT);
            const weeklyRemainingPercentage = weeklyAllowanceCT > 0 ? clampSettingsPercentage((weeklyRemainingCT / weeklyAllowanceCT) * 100) : 100;
            const latestDay = byDay[byDay.length - 1] || null;
            const latestDayUsedCT = latestDay ? Math.max(0, Number(latestDay?.totalCT || 0)) : 0;
            const latestDayRemainingCT = Math.max(0, dailyAllowanceCT - latestDayUsedCT);
            const latestDayRemainingPercentage = dailyAllowanceCT > 0 ? clampSettingsPercentage((latestDayRemainingCT / dailyAllowanceCT) * 100) : 100;
            const agentUsedCT = Math.max(0, Number(settingsUsageSummary?.totals?.agentCT || 0));
            const environmentUsedCT = Math.max(0, Number(settingsUsageSummary?.totals?.environmentCT || 0));
            const agentUsagePercentage = totalUsedCT > 0 ? clampSettingsPercentage((agentUsedCT / totalUsedCT) * 100) : 0;
            const environmentUsagePercentage = totalUsedCT > 0 ? clampSettingsPercentage((environmentUsedCT / totalUsedCT) * 100) : 0;
            const dominantSource = Array.isArray(settingsUsageBreakdown)
              ? settingsUsageBreakdown
                .slice()
                .sort((left, right) => Number(right?.totalCT || 0) - Number(left?.totalCT || 0))[0] || null
              : null;
  
            return {
              periodStartValue,
              periodEndValue,
              periodDays,
              quotaCT,
              totalUsedCT,
              remainingCT,
              remainingPercentage,
              dailyAllowanceCT,
              latestDay,
              latestDayUsedCT,
              latestDayRemainingCT,
              latestDayRemainingPercentage,
              weeklyAllowanceCT,
              last7UsedCT,
              last7ThreadCount,
              weeklyRemainingCT,
              weeklyRemainingPercentage,
              agentUsedCT,
              environmentUsedCT,
              agentUsagePercentage,
              environmentUsagePercentage,
              totalThreads: Math.max(0, Number(settingsUsageSummary?.totals?.totalThreads || 0)),
              dominantSource,
            };
          }, [settingsBudgetStatus, settingsUsageBreakdown, settingsUsageSummary]);
          const settingsSelectedTrigger = useMemo(() => {
            return settingsTriggers.find((trigger) => trigger.id === settingsSelectedTriggerId) || null;
          }, [settingsSelectedTriggerId, settingsTriggers]);
  ${API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.projection}        const speechToTextUrl = useMemo(() => {
            try {
              const url = new URL(resolvedUpstreamUrl);
              url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
              url.pathname = "/ws/speech-to-text";
              url.search = "";
              url.hash = "";
              return url.toString();
            } catch {
              return "";
            }
          }, [resolvedUpstreamUrl]);
          const threadListSyncChannelRef = useRef(null);
          const threadListSyncSenderIdRef = useRef("thread-sync-" + Math.random().toString(36).slice(2));
          const emitThreadListRefreshSignal = useCallback(function emitThreadListRefreshSignal(threadId = "") {
            const payload = {
              type: "threads:refresh",
              senderId: threadListSyncSenderIdRef.current,
              threadId: String(threadId || "").trim(),
              timestamp: Date.now(),
            };
  
            try {
              threadListSyncChannelRef.current?.postMessage(payload);
            } catch {}
  
            if (typeof window !== "undefined") {
              try {
                window.localStorage.setItem("__playground_threads_refresh__", JSON.stringify(payload));
              } catch {}
            }
          }, []);
          const refreshThreads = useCallback(async function refreshThreads(limitOverride, preserveThreadIdOverride = "", options = null) {
            if (!hasRealAccess) {
              setRealThreads([]);
              setRealThreadsHasMore(false);
              threadFetchLimitRef.current = SEARCH_THREAD_FETCH_LIMIT;
              return;
            }
  
            const explicitRequestedLimit =
              Number.isFinite(limitOverride) && limitOverride > 0
                ? Math.max(1, Math.round(limitOverride))
                : 20;
            const retainedSidebarLimit = Math.max(
              SEARCH_THREAD_FETCH_LIMIT,
              Number.isFinite(threadFetchLimitRef.current) ? threadFetchLimitRef.current : SEARCH_THREAD_FETCH_LIMIT,
              Number.isFinite(threadDisplayCountRef.current) ? threadDisplayCountRef.current : 10
            );
            const requestedLimit = Math.max(explicitRequestedLimit, retainedSidebarLimit);
            threadFetchLimitRef.current = requestedLimit;
            const normalizedPreserveThreadId = String(preserveThreadIdOverride || "").trim();
            const shouldSetLoading = !Boolean(options && typeof options === "object" && options.silent);
            const requestKey = proxyBackendBase
              + "|"
              + JSON.stringify(authRequestHeaders || {})
              + "|"
              + String(requestedLimit);
            const currentInFlightRequest = threadRefreshInFlightRef.current;
            if (
              currentInFlightRequest
              && currentInFlightRequest.key === requestKey
              && currentInFlightRequest.promise
            ) {
              await currentInFlightRequest.promise.catch(() => undefined);
              return;
            }
  
            if (shouldSetLoading) {
              setIsThreadsLoading(true);
            }
            let requestPromise = null;
            try {
              requestPromise = fetch(
                proxyBackendBase
                  + "/threads?limit="
                  + encodeURIComponent(String(requestedLimit))
                  + "&view=overview",
                {
                method: "GET",
                headers: authRequestHeaders,
                },
              );
              threadRefreshInFlightRef.current = {
                key: requestKey,
                promise: requestPromise,
              };
              const response = await requestPromise;
  
              const data = await response.json().catch(() => ({}));
              if (isUnauthorizedStatus(response.status)) {
                triggerPlatformSessionRecovery();
                setRealThreads([]);
                setRealThreadsHasMore(false);
                return;
              }
              if (!response.ok) {
                return;
              }
  
              const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.threads) ? data.threads : [];
              const normalizedFetchedThreads = normalizeThreadList(items)
                .filter((thread) => !isPrivateThreadRecord(thread) && !privateThreadIdsRef.current.has(String(thread?.id || "").trim()));
              setRealThreads((current) => {
                const focusedThreadId = normalizedPreserveThreadId || currentThreadId;
                const currentById = new Map((Array.isArray(current) ? current : []).map((thread) => [thread.id, thread]));
                const fetchedThreads = normalizedFetchedThreads.map((thread) => {
                  const existingThread = currentById.get(thread.id);
                  const shouldPreserveEvaluationMetadata = existingThread && isEvaluationThreadRecord(existingThread) && !isEvaluationThreadRecord(thread);
                  const mergedThread = shouldPreserveEvaluationMetadata
                    ? normalizeThreadItem({
                        ...thread,
                        hidden: true,
                        sidebarHidden: true,
                        metadata: existingThread.metadata,
                      })
                    : thread;
                  return preserveActiveThreadStatusForStaleCompletion(existingThread, mergedThread, focusedThreadId);
                });
                const fetchedIds = new Set(fetchedThreads.map((thread) => thread.id));
                const optimisticThreads = (Array.isArray(current) ? current : []).filter((thread) => {
                  const normalizedThreadId = String(thread?.id || "").trim();
                  if (!normalizedThreadId || fetchedIds.has(normalizedThreadId)) {
                    return false;
                  }
                  if (privateThreadIdsRef.current.has(normalizedThreadId) || isPrivateThreadRecord(thread)) {
                    return false;
                  }
                  const normalizedStatus = String(thread?.status || "").trim().toLowerCase();
                  return normalizedThreadId === currentThreadId
                    || normalizedThreadId === normalizedPreserveThreadId
                    || isActiveThreadDisplayStatus(normalizedStatus)
                    || isPendingPermissionThreadDisplayStatus(normalizedStatus);
                });
                return normalizeThreadList([...optimisticThreads, ...fetchedThreads]);
              });
              setRealThreadsHasMore(Boolean(data?.has_more) || items.length >= requestedLimit);
            } catch {
              return;
            } finally {
              if (threadRefreshInFlightRef.current?.promise === requestPromise) {
                threadRefreshInFlightRef.current = null;
              }
              if (shouldSetLoading) {
                setIsThreadsLoading(false);
              }
            }
          }, [authRequestHeaders, currentThreadId, hasRealAccess, proxyBackendBase, triggerPlatformSessionRecovery]);
  
          const refreshProjects = useCallback(async function refreshProjects() {
            if (!hasRealAccess) {
              setRealProjects([]);
              return;
            }
  
            try {
              const response = await fetch(proxyBackendBase + "/projects?view=overview", {
                method: "GET",
                headers: authRequestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (isUnauthorizedStatus(response.status)) {
                setRealProjects([]);
                triggerPlatformSessionRecovery();
                return;
              }
              if (!response.ok) {
                setRealProjects([]);
                return;
              }
              const nextProjects = parsePlaygroundProjectListResponse(data);
              setRealProjects((current) =>
                sortPlaygroundProjectsByRecent(nextProjects.map((project) => {
                  const existingProject = current.find((currentProject) => currentProject?.id === project.id) || null;
                  return mergePlaygroundProjectRecords(project, existingProject) || project;
                }))
              );
            } catch {
              setRealProjects([]);
            }
          }, [authRequestHeaders, hasRealAccess, proxyBackendBase, triggerPlatformSessionRecovery]);
  
          const handleShowMoreThreads = useCallback(async function handleShowMoreThreads() {
            const nextDisplayCount = threadDisplayCount + 10;
            threadDisplayCountRef.current = nextDisplayCount;
            threadFetchLimitRef.current = Math.max(threadFetchLimitRef.current || SEARCH_THREAD_FETCH_LIMIT, SEARCH_THREAD_FETCH_LIMIT, nextDisplayCount);
            setThreadDisplayCount(nextDisplayCount);
            if (hasDemoAccess || !hasRealAccess || isThreadsLoading) {
              return;
            }
            if (realThreadsHasMore && realThreads.length < nextDisplayCount) {
              void refreshThreads(Math.max(SEARCH_THREAD_FETCH_LIMIT, nextDisplayCount + 10));
            }
          }, [hasDemoAccess, hasRealAccess, isThreadsLoading, realThreads.length, realThreadsHasMore, refreshThreads, threadDisplayCount]);
  
          const updateRealThreadStatus = useCallback(function updateRealThreadStatus(threadId, nextStatus, options = {}) {
            const normalizedThreadId = String(threadId || "").trim();
            const normalizedStatus = String(nextStatus || "").trim();
            if (!normalizedThreadId || !normalizedStatus) {
              return;
            }
            if (privateThreadIdsRef.current.has(normalizedThreadId)) {
              return;
            }
            const existingThread = realThreadsRef.current.find((thread) => thread.id === normalizedThreadId) || null;
            const nextCompletedAt = typeof options?.completedAt === "string"
              ? options.completedAt
              : String(existingThread?.completedAt || "");
            if (
              existingThread
              && String(existingThread.status || "").trim() === normalizedStatus
              && String(existingThread.completedAt || "") === nextCompletedAt
            ) {
              return;
            }
  
            setRealThreads((current) => {
              let didChange = false;
              const nextThreads = current.map((thread) => {
                if (thread.id !== normalizedThreadId) {
                  return thread;
                }
                const nextThread = {
                  ...thread,
                  status: normalizedStatus,
                  ...(typeof options?.completedAt === "string" ? { completedAt: options.completedAt } : {}),
                  ...(typeof options?.updatedAt === "string" && options.updatedAt.trim() ? { updatedAt: options.updatedAt.trim() } : {}),
                };
                const resolvedThread = preserveActiveThreadStatusForStaleCompletion(thread, nextThread, normalizedThreadId);
                if (
                  String(thread.status || "").trim() === String(resolvedThread.status || "").trim()
                  && String(thread.completedAt || "") === String(resolvedThread.completedAt || "")
                  && String(thread.updatedAt || "") === String(resolvedThread.updatedAt || "")
                ) {
                  return thread;
                }
                didChange = true;
                return resolvedThread;
              });
              return didChange ? nextThreads : current;
            });
            emitThreadListRefreshSignal(normalizedThreadId);
          }, [emitThreadListRefreshSignal]);
  
          const upsertRealThreadTitle = useCallback(function upsertRealThreadTitle(threadId, nextTitle) {
            const normalizedThreadId = String(threadId || "").trim();
            const normalizedTitle = String(nextTitle || "").trim();
            if (!normalizedThreadId || !normalizedTitle) {
              return;
            }
            if (privateThreadIdsRef.current.has(normalizedThreadId)) {
              return;
            }
  
            const nowIso = new Date().toISOString();
            setRealThreads((current) => {
              let didFind = false;
              let didChange = false;
              const nextThreads = current.map((thread) => {
                if (thread.id !== normalizedThreadId) {
                  return thread;
                }
  
                didFind = true;
                if (String(thread.title || "").trim() === normalizedTitle) {
                  return thread;
                }
  
                didChange = true;
                return normalizeThreadItem({
                  ...thread,
                  title: normalizedTitle,
                  updatedAt: nowIso,
                });
              });
  
              if (didFind) {
                return didChange ? nextThreads : current;
              }
  
              return [
                normalizeThreadItem({
                  id: normalizedThreadId,
                  title: normalizedTitle,
                  status: "active",
                  createdAt: nowIso,
                  updatedAt: nowIso,
                }),
                ...current,
              ];
            });
            emitThreadListRefreshSignal(normalizedThreadId);
          }, [emitThreadListRefreshSignal]);
  
          const upsertRealThreadRecord = useCallback(function upsertRealThreadRecord(threadRecord, options = {}) {
            const normalizedThreadId = typeof threadRecord?.id === "string" ? threadRecord.id.trim() : "";
            if (!normalizedThreadId) {
              return;
            }
            if (privateThreadIdsRef.current.has(normalizedThreadId) || isPrivateThreadRecord(threadRecord)) {
              return;
            }
  
            const nowIso = new Date().toISOString();
            const nextTaskPreview = options?.taskPreview && typeof options.taskPreview === "object" && !Array.isArray(options.taskPreview)
              ? options.taskPreview
              : null;
            const fallbackStatus = typeof options?.status === "string" ? options.status.trim() : "";
            const normalizedIncomingStatus = typeof threadRecord?.status === "string" ? threadRecord.status.trim() : "";
            const shouldPreferFallbackStatus =
              Boolean(fallbackStatus)
              && (
                !normalizedIncomingStatus
                || ["active", "created", "ready"].includes(normalizedIncomingStatus.toLowerCase())
              );
  
            setRealThreads((current) => {
              const existingThread = current.find((thread) => thread.id === normalizedThreadId) || null;
              const existingMetadata = existingThread?.metadata && typeof existingThread.metadata === "object" && !Array.isArray(existingThread.metadata)
                ? existingThread.metadata
                : {};
              const incomingMetadata = threadRecord?.metadata && typeof threadRecord.metadata === "object" && !Array.isArray(threadRecord.metadata)
                ? threadRecord.metadata
                : {};
              const existingRunnerPlayground = existingMetadata?.runnerPlayground && typeof existingMetadata.runnerPlayground === "object" && !Array.isArray(existingMetadata.runnerPlayground)
                ? existingMetadata.runnerPlayground
                : {};
              const incomingRunnerPlayground = incomingMetadata?.runnerPlayground && typeof incomingMetadata.runnerPlayground === "object" && !Array.isArray(incomingMetadata.runnerPlayground)
                ? incomingMetadata.runnerPlayground
                : {};
              const existingTaskPreview = existingRunnerPlayground?.taskPreview && typeof existingRunnerPlayground.taskPreview === "object" && !Array.isArray(existingRunnerPlayground.taskPreview)
                ? existingRunnerPlayground.taskPreview
                : null;
              const incomingTaskPreview = incomingRunnerPlayground?.taskPreview && typeof incomingRunnerPlayground.taskPreview === "object" && !Array.isArray(incomingRunnerPlayground.taskPreview)
                ? incomingRunnerPlayground.taskPreview
                : null;
              const mergedTaskPreview = nextTaskPreview || incomingTaskPreview || existingTaskPreview;
  
              const normalizedThread = normalizeThreadItem({
                ...(existingThread || {}),
                ...(threadRecord || {}),
                id: normalizedThreadId,
                status: shouldPreferFallbackStatus
                  ? fallbackStatus
                  : normalizedIncomingStatus || fallbackStatus || existingThread?.status || "",
                createdAt: typeof threadRecord?.createdAt === "string" && threadRecord.createdAt.trim()
                  ? threadRecord.createdAt.trim()
                  : existingThread?.createdAt || nowIso,
                updatedAt: typeof threadRecord?.updatedAt === "string" && threadRecord.updatedAt.trim()
                  ? threadRecord.updatedAt.trim()
                  : existingThread?.updatedAt
                    || (typeof threadRecord?.createdAt === "string" && threadRecord.createdAt.trim() ? threadRecord.createdAt.trim() : "")
                    || nowIso,
                metadata: {
                  ...existingMetadata,
                  ...incomingMetadata,
                  runnerPlayground: {
                    ...existingRunnerPlayground,
                    ...incomingRunnerPlayground,
                    ...(mergedTaskPreview
                      ? {
                          taskPreview: {
                            ...(existingTaskPreview || {}),
                            ...(incomingTaskPreview || {}),
                            ...mergedTaskPreview,
                            threadId: normalizedThreadId,
                          },
                        }
                      : {}),
                  },
                },
              });
  
              const existingIndex = current.findIndex((thread) => thread.id === normalizedThreadId);
              if (existingIndex === -1) {
                return [normalizedThread].concat(current);
              }
              return current.map((thread) => thread.id === normalizedThreadId ? normalizedThread : thread);
            });
            emitThreadListRefreshSignal(normalizedThreadId);
          }, [emitThreadListRefreshSignal]);
  
          const updateThreadTaskPreviewStatus = useCallback(function updateThreadTaskPreviewStatus(threadId, taskId, nextTaskStatus) {
            const normalizedThreadId = String(threadId || "").trim();
            const normalizedTaskId = String(taskId || "").trim();
            const normalizedTaskStatus = String(nextTaskStatus || "").trim();
            if (!normalizedThreadId || !normalizedTaskId || !normalizedTaskStatus) {
              return;
            }
  
            setRealThreads((current) => {
              let didChange = false;
              const nextThreads = current.map((thread) => {
                if (thread.id !== normalizedThreadId) {
                  return thread;
                }
  
                const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
                  ? thread.metadata
                  : {};
                const runnerPlaygroundMetadata = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
                  ? metadata.runnerPlayground
                  : {};
                const taskPreview = runnerPlaygroundMetadata?.taskPreview && typeof runnerPlaygroundMetadata.taskPreview === "object" && !Array.isArray(runnerPlaygroundMetadata.taskPreview)
                  ? runnerPlaygroundMetadata.taskPreview
                  : null;
  
                if (!taskPreview || String(taskPreview.taskId || "").trim() !== normalizedTaskId) {
                  return thread;
                }
                if (String(taskPreview.status || "").trim() === normalizedTaskStatus) {
                  return thread;
                }
  
                didChange = true;
                return normalizeThreadItem({
                  ...thread,
                  metadata: {
                    ...metadata,
                    runnerPlayground: {
                      ...runnerPlaygroundMetadata,
                      taskPreview: {
                        ...taskPreview,
                        status: normalizedTaskStatus,
                      },
                    },
                  },
                });
              });
  
              return didChange ? nextThreads : current;
            });
  
            setThreadTaskPreviewOverrides((current) => {
              const existingPreview = current[normalizedThreadId];
              if (
                !existingPreview
                || String(existingPreview.taskId || "").trim() !== normalizedTaskId
                || String(existingPreview.status || "").trim() === normalizedTaskStatus
              ) {
                return current;
              }
              return {
                ...current,
                [normalizedThreadId]: {
                  ...existingPreview,
                  status: normalizedTaskStatus,
                },
              };
            });
          }, []);
  
          const upsertThreadTaskPreview = useCallback(function upsertThreadTaskPreview(threadId, nextTaskPreview) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || !nextTaskPreview || typeof nextTaskPreview !== "object") {
              return;
            }
  
            setThreadTaskPreviewOverrides((current) => {
              const existingPreview = current[normalizedThreadId] || null;
              if (JSON.stringify(existingPreview || null) === JSON.stringify(nextTaskPreview)) {
                return current;
              }
              return {
                ...current,
                [normalizedThreadId]: nextTaskPreview,
              };
            });
  
            setRealThreads((current) => {
              let didChange = false;
              const nextThreads = current.map((thread) => {
                if (thread.id !== normalizedThreadId) {
                  return thread;
                }
  
                const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
                  ? thread.metadata
                  : {};
                const runnerPlaygroundMetadata = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
                  ? metadata.runnerPlayground
                  : {};
                const currentPreview = runnerPlaygroundMetadata?.taskPreview && typeof runnerPlaygroundMetadata.taskPreview === "object" && !Array.isArray(runnerPlaygroundMetadata.taskPreview)
                  ? runnerPlaygroundMetadata.taskPreview
                  : null;
  
                if (JSON.stringify(currentPreview || null) === JSON.stringify(nextTaskPreview)) {
                  return thread;
                }
  
                didChange = true;
                return normalizeThreadItem({
                  ...thread,
                  metadata: {
                    ...metadata,
                    runnerPlayground: {
                      ...runnerPlaygroundMetadata,
                      taskPreview: nextTaskPreview,
                    },
                  },
                });
              });
              return didChange ? nextThreads : current;
            });
          }, []);
  
          const markThreadTaskPreviewDeleted = useCallback(function markThreadTaskPreviewDeleted(threadId, taskPreview) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || !taskPreview?.taskId) {
              return;
            }
  
            const nextPreview = {
              ...taskPreview,
              isDeleted: true,
            };
  
            upsertThreadTaskPreview(normalizedThreadId, nextPreview);
          }, [upsertThreadTaskPreview]);
  
          const loadThreadGroundTruthStatus = useCallback(async function loadThreadGroundTruthStatus(threadId) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!hasRealAccess || !isRealThreadId(normalizedThreadId)) {
              return "";
            }
  
            try {
              const response = await fetch(
                proxyBackendBase + "/threads/" + encodeURIComponent(normalizedThreadId) + "/status",
                {
                  method: "GET",
                  headers: authRequestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                return "";
              }
  
              const nextStatus =
                typeof data?.status === "string" && data.status.trim()
                  ? data.status.trim()
                  : typeof data?.thread?.status === "string" && data.thread.status.trim()
                    ? data.thread.status.trim()
                    : typeof data?.data?.status === "string" && data.data.status.trim()
                      ? data.data.status.trim()
                      : "";
              const completedAt =
                typeof data?.completedAt === "string" && data.completedAt.trim()
                  ? data.completedAt.trim()
                  : typeof data?.thread?.completedAt === "string" && data.thread.completedAt.trim()
                    ? data.thread.completedAt.trim()
                    : typeof data?.data?.completedAt === "string" && data.data.completedAt.trim()
                      ? data.data.completedAt.trim()
                      : "";
              const updatedAt =
                typeof data?.updatedAt === "string" && data.updatedAt.trim()
                  ? data.updatedAt.trim()
                  : typeof data?.thread?.updatedAt === "string" && data.thread.updatedAt.trim()
                    ? data.thread.updatedAt.trim()
                    : typeof data?.data?.updatedAt === "string" && data.data.updatedAt.trim()
                      ? data.data.updatedAt.trim()
                      : "";
              let resolvedNextStatus = resolveThreadDisplayStatus(nextStatus, completedAt);
              const existingThread = realThreadsRef.current.find((thread) => thread.id === normalizedThreadId) || null;
              const preservedThread = preserveActiveThreadStatusForStaleCompletion(
                existingThread,
                {
                  ...(existingThread || {}),
                  id: normalizedThreadId,
                  status: resolvedNextStatus,
                  completedAt,
                  updatedAt: updatedAt || existingThread?.updatedAt || "",
                },
                normalizedThreadId
              );
              resolvedNextStatus = String(preservedThread?.status || resolvedNextStatus || "").trim();
  
              if (resolvedNextStatus) {
                updateRealThreadStatus(normalizedThreadId, resolvedNextStatus, { completedAt, updatedAt });
              }
  
              return resolvedNextStatus;
            } catch {
              return "";
            }
          }, [authRequestHeaders, hasRealAccess, proxyBackendBase, updateRealThreadStatus]);
  
          const upsertStatusIndicatorItem = useCallback(function upsertStatusIndicatorItem(nextItem) {
            if (!nextItem?.id) {
              return;
            }
  
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== nextItem.id));
            setStatusIndicatorItems((current) => {
              const existingIndex = current.findIndex((item) => item.id === nextItem.id);
              if (existingIndex === -1) {
                return current.concat(nextItem);
              }
              return current.map((item) => item.id === nextItem.id ? { ...item, ...nextItem } : item);
            });
          }, []);
  
          const removeStatusIndicatorItem = useCallback(function removeStatusIndicatorItem(itemId) {
            const normalizedItemId = String(itemId || "").trim();
            if (!normalizedItemId) {
              return;
            }
            setStatusIndicatorItems((current) => current.filter((item) => item.id !== normalizedItemId));
            setDismissedStatusIndicatorIds((current) => current.filter((id) => id !== normalizedItemId));
          }, []);
  
          const applyTaskRunState = useCallback(function applyTaskRunState(nextPartialState) {
            const normalizedTaskId = typeof nextPartialState?.taskId === "string" ? nextPartialState.taskId.trim() : "";
            if (!normalizedTaskId) {
              return;
            }
  
            let nextTaskRunState = null;
            setTaskRunStates((current) => {
              const existing = current[normalizedTaskId] && typeof current[normalizedTaskId] === "object"
                ? current[normalizedTaskId]
                : {};
              nextTaskRunState = {
                ...existing,
                ...nextPartialState,
                taskId: normalizedTaskId,
              };
              return {
                ...current,
                [normalizedTaskId]: nextTaskRunState,
              };
            });
  
            const nextIndicatorItem = buildTaskRunStatusIndicatorItem(nextTaskRunState);
            if (nextIndicatorItem) {
              upsertStatusIndicatorItem(nextIndicatorItem);
            } else {
              removeStatusIndicatorItem("task-run:" + normalizedTaskId);
            }
  
            const normalizedThreadId = typeof nextTaskRunState?.threadId === "string" ? nextTaskRunState.threadId.trim() : "";
            const normalizedPhase = typeof nextTaskRunState?.phase === "string" ? nextTaskRunState.phase.trim().toLowerCase() : "";
  	          if (normalizedThreadId && normalizedPhase === "running") {
  	            updateThreadTaskPreviewStatus(
                normalizedThreadId,
                normalizedTaskId,
                String(nextTaskRunState.runKind || "").trim().toLowerCase() === "review" ? "in_review" : "in_progress"
  	            );
            } else if (normalizedThreadId && normalizedPhase === "waiting_subtasks") {
              updateThreadTaskPreviewStatus(normalizedThreadId, normalizedTaskId, "in_progress");
  	          } else if (normalizedThreadId && normalizedPhase === "finished") {
  	            updateThreadTaskPreviewStatus(normalizedThreadId, normalizedTaskId, nextTaskRunState.taskStatus || "done");
  	          } else if (normalizedThreadId && normalizedPhase === "in_review") {
  	            updateThreadTaskPreviewStatus(normalizedThreadId, normalizedTaskId, nextTaskRunState.taskStatus || "in_review");
  	          }
  	        }, [removeStatusIndicatorItem, updateThreadTaskPreviewStatus, upsertStatusIndicatorItem]);
  
  	        const getRuntimeTaskActorName = useCallback(function getRuntimeTaskActorName(actorId, fallback = "") {
  	          const normalizedActorId = String(actorId || "").trim();
  	          if (!normalizedActorId) {
  	            return fallback;
  	          }
  	          if (isPlaygroundHumanAssigneeId(normalizedActorId)) {
  	            return "Me";
  	          }
  	          return runtimeAgents.find((agent) => agent?.id === normalizedActorId)?.name || fallback || normalizedActorId;
  	        }, [runtimeAgents]);
  
  	        const buildTaskReviewThreadPreview = useCallback(function buildTaskReviewThreadPreview(taskRecord, threadId = "", sourceThreadId = "", options = {}) {
  	          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
  	          const reviewerAgentId = String(normalizedTask.reviewerAgentId || "").trim();
  	          const reviewerAgent = reviewerAgentId
  	            ? runtimeAgents.find((agent) => agent?.id === reviewerAgentId) || null
  	            : null;
  	          const environmentId = String(normalizedTask.environmentId || "").trim();
  	          const environmentName = environmentId
  	            ? runtimeEnvironments.find((environment) => environment?.id === environmentId)?.name || environmentId
  	            : "";
  	          const projectId = String(normalizedTask.projectId || options?.projectId || "").trim();
  	          const projectName = String(options?.projectName || normalizedTask.projectName || "").trim();
  	          return {
  	            taskId: normalizedTask.id,
  	            projectId,
  	            projectName,
  	            threadId: String(threadId || "").trim(),
  	            ticketNumber: normalizePlaygroundTaskTicketNumber(normalizedTask.ticketNumber) || "000",
  	            title: normalizedTask.title || "Untitled Task",
  	            description: normalizedTask.description || "",
  	            taskColor: normalizedTask.taskColor || PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
  	            status: "in_review",
  	            priority: normalizedTask.priority || "medium",
  	            taskType: normalizePlaygroundTaskType(normalizedTask.taskType),
  	            assigneeAgentId: reviewerAgentId,
  	            assigneeName: getRuntimeTaskActorName(reviewerAgentId, "Reviewer"),
  	            assigneePhotoUrl: reviewerAgent ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(reviewerAgent)) : "",
  	            reviewRequired: true,
  	            reviewerAgentId,
  	            runKind: "review",
  	            sourceThreadId: String(sourceThreadId || "").trim(),
  	            environmentId,
  	            environmentName,
  	          };
  	        }, [getRuntimeTaskActorName, runtimeAgents, runtimeEnvironments]);
  
  	        const buildTaskReviewRunPrompt = useCallback(function buildTaskReviewRunPrompt(taskRecord, options = {}) {
  	          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
  	          const newline = String.fromCharCode(10);
  	          const paragraphBreak = newline + newline;
  	          const ticketNumber = normalizePlaygroundTaskTicketNumber(normalizedTask.ticketNumber) || "000";
  		          const implementationThreadId = String(options?.implementationThreadId || "").trim();
  		          const projectId = String(options?.projectId || normalizedTask.projectId || "").trim();
  		          const projectName = String(options?.projectName || normalizedTask.projectName || "").trim();
  		          const projectRecord = options?.projectRecord && typeof options.projectRecord === "object"
  		            ? options.projectRecord
  		            : projectId
  		              ? realProjects.find((project) => project?.id === projectId) || null
  		              : null;
		          const projectKnowledgeSection = buildPlaygroundProjectKnowledgeAgentPromptSection(projectRecord);
  		          const projectRulesSection = buildPlaygroundProjectRulesPromptSection(projectRecord);
  		          const reviewerName = getRuntimeTaskActorName(normalizedTask.reviewerAgentId, "Reviewer");
  	          const assigneeName = getRuntimeTaskActorName(normalizedTask.assigneeAgentId, "Assignee");
  	          const environmentId = String(normalizedTask.environmentId || "").trim();
  	          const environmentName = environmentId
  	            ? runtimeEnvironments.find((environment) => environment?.id === environmentId)?.name || environmentId
  	            : "Default";
  	          const commentLines = normalizePlaygroundTaskCommentList(normalizedTask.comments)
  	            .slice()
  	            .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")))
  	            .map((comment) => "- " + (comment.authorName || "Computer Agents") + ": " + comment.text);
  	          const taskAttachmentsSection = buildPlaygroundAttachmentPromptSection("Task attachments:", normalizedTask.attachments, {
  	            copy: "These files are attached specifically to this task.",
  	          });
  	          const implementationThreadInspectionSection = implementationThreadId
  	            ? [
  	                "Implementation thread inspection:",
  	                "- Inspect the exact implementation thread before approving or requesting changes: " + implementationThreadId,
  	                "- Use the Computer Agents skill for details, messages, and logs:",
  	                "  python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads get " + implementationThreadId,
  	                "  python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads messages " + implementationThreadId + " --limit 80",
  	                "  python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py threads logs " + implementationThreadId,
  	                "- Use the thread logs and file/change entries to verify what the implementation agent actually changed.",
  	              ].join(newline)
  	            : "";
  
  	          return wrapPlaygroundHiddenSystemPrompt([
  	            "Review this completed backlog ticket as the configured reviewer.",
  	            projectName || projectId ? "Project: " + [projectName, projectId ? "(" + projectId + ")" : ""].filter(Boolean).join(" ") : "",
  	            "Task ID: " + normalizedTask.id,
  	            "Ticket: " + ticketNumber,
  	            "Title: " + (normalizedTask.title || "Untitled Task"),
  	            "Type: " + getPlaygroundTaskTypeLabel(normalizedTask.taskType),
  	            "Status: In Review",
  	            "Implementation assignee: " + assigneeName,
  	            "Reviewer: " + reviewerName,
  		            implementationThreadId ? "Implementation thread ID to review: " + implementationThreadId : "",
  		            "Environment: " + environmentName,
		            projectKnowledgeSection,
  		            projectRulesSection,
  		            [
                "Review expectations:",
                "- The project id, task id, and implementation thread id above are authoritative. Do not list all projects or all tasks just to discover this context.",
                "- Use direct lookups for the provided project/task when you need project management context such as milestones, dependencies, comments, or nearby work.",
                "- Inspect the provided implementation thread id and verify the ticket's acceptance criteria, deployment state, and smoke-test evidence.",
                "- If the implementation is accepted, add a concise approval comment and update the ticket status to done.",
                "- If changes are required, add a concrete review comment that the assignee can act on, set the ticket status back to todo, and keep completedAt empty.",
                "- Do not mark the ticket done just because this review thread finished. The ticket is done only after you explicitly accept the work.",
  	            ].join(newline),
  	            implementationThreadInspectionSection,
  	            normalizedTask.description
                ? "Description:" + newline + normalizedTask.description
                : "Description:" + newline + "None provided.",
  	            commentLines.length > 0 ? "Existing comments:" + newline + commentLines.join(newline) : "",
  	            taskAttachmentsSection,
  	          ].filter(Boolean).join(paragraphBreak));
  		        }, [getRuntimeTaskActorName, realProjects, runtimeEnvironments]);
  
  	        const startAgentReviewThreadForTask = useCallback(async function startAgentReviewThreadForTask(taskRecord, implementationThreadId, taskRunState = {}) {
  	          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
  	          const normalizedTaskId = String(normalizedTask.id || "").trim();
  	          const normalizedImplementationThreadId = String(implementationThreadId || "").trim();
  	          const reviewerAgentId = String(normalizedTask.reviewerAgentId || "").trim();
  	          const reviewProjectId = String(normalizedTask.projectId || taskRunState?.projectId || "").trim();
  		          const reviewProjectRecord = taskRunState?.projectRecord && typeof taskRunState.projectRecord === "object"
  		            ? taskRunState.projectRecord
  		            : reviewProjectId
  		              ? realProjects.find((project) => project?.id === reviewProjectId) || null
  		              : null;
		          const reviewProjectName = String(
  		            taskRunState?.projectName
  		            || reviewProjectRecord?.name
  		            || ""
		          ).trim();
		          const reviewProjectKnowledgeContext = buildPlaygroundProjectKnowledgeRunContext(
		            reviewProjectRecord,
		            "project_task_review"
		          );
  	          if (!hasRealAccess) {
  	            throw new Error("Sign in before starting an agent review.");
  	          }
  	          if (!normalizedTaskId) {
  	            throw new Error("Task details are unavailable.");
  	          }
  	          if (!reviewerAgentId) {
  	            throw new Error("This task does not have a reviewer agent.");
  	          }
  		          if (isPlaygroundHumanAssigneeId(reviewerAgentId)) {
  		            throw new Error("This task is assigned to a human reviewer.");
  		          }
  
  		          const startKey = normalizedTaskId + ":" + (normalizedImplementationThreadId || "latest");
  	          if (taskReviewThreadStartKeysRef.current.has(startKey)) {
  	            throw new Error("Agent review is already starting for this thread.");
  	          }
  	          taskReviewThreadStartKeysRef.current.add(startKey);
  
  	          const taskForReview = normalizePlaygroundTaskRecord({
  	            ...normalizedTask,
  	            projectId: normalizedTask.projectId || reviewProjectId,
  	            projectName: reviewProjectName,
  	          });
  		          const reviewPrompt = buildTaskReviewRunPrompt(taskForReview, {
  		            implementationThreadId: normalizedImplementationThreadId,
  		            projectId: reviewProjectId,
  		            projectName: reviewProjectName,
  		            projectRecord: reviewProjectRecord,
  		          });
  	          const taskPreview = buildTaskReviewThreadPreview(taskForReview, "", normalizedImplementationThreadId, {
  	            projectId: reviewProjectId,
  	            projectName: reviewProjectName,
  	          });
  
  	          try {
                const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTaskId) + "/run-thread", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: (taskPreview.ticketNumber ? taskPreview.ticketNumber + " " : "") + "Review: " + taskPreview.title,
                  executionMode: "deferred",
                  idempotencyKey: "project-task-review-" + normalizedTaskId + "-" + (
                    globalThis.crypto?.randomUUID?.()
                    || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
                  ),
                  environmentId: normalizedTask.environmentId || undefined,
                  agentId: reviewerAgentId,
                  enabledSkills: {
                    taskManagement: true,
                    computerAgents: true,
                  },
                  connectors: normalizedTask.connectors,
                  attachments: normalizePlaygroundTaskAttachmentList(normalizedTask.attachments),
                  launchPrompt: reviewPrompt,
		          ...(reviewProjectKnowledgeContext ? { knowledgeContext: reviewProjectKnowledgeContext } : {}),
                  runKind: "review",
                  allowAdditionalThread: true,
                  taskPreview,
                  metadata: {
		            ...(reviewProjectKnowledgeContext ? { knowledgeContext: reviewProjectKnowledgeContext } : {}),
                    triggerKind: "manual",
                    source: "project_task_review",
                    runKind: "review",
                    runnerPlayground: {
		              ...(reviewProjectKnowledgeContext ? { knowledgeContext: reviewProjectKnowledgeContext } : {}),
                      enabledSkills: {
                        taskManagement: true,
                        computerAgents: true,
                      },
                      connectors: normalizedTask.connectors,
                      taskPreview,
                    },
                  },
                }),
  	            });
  	            const data = await response.json().catch(() => ({}));
  	            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to start review thread.");
  	            }
  
  	            const threadRecord = getPlaygroundThreadResponseRecord(data);
  	            const updatedTask = getPlaygroundTaskResponseRecord(data) || normalizedTask;
  	            if (!threadRecord?.id) {
                throw new Error("Review thread creation failed.");
  	            }
  
  	            const executionStarted = Boolean(data?.executionStarted);
  	            const reviewTaskPreview = buildTaskReviewThreadPreview(updatedTask, threadRecord.id, normalizedImplementationThreadId, {
                projectId: updatedTask.projectId || reviewProjectId,
                projectName: reviewProjectName,
  	            });
  	            upsertRealThreadRecord(threadRecord, {
                taskPreview: reviewTaskPreview,
                status: "running",
  	            });
  	            setLatestInteractedProjectId(updatedTask.projectId || normalizedTask.projectId || taskRunState.projectId || latestInteractedProjectId || "");
  	            setThreadAgentSelectionOverride(null);
  	            setPendingThreadRunRequest(executionStarted
                ? null
                : {
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    threadId: threadRecord.id,
                    prompt: reviewPrompt,
                    displayPrompt: null,
                    agentId: reviewerAgentId,
                    attachments: [],
                    githubRepo: null,
                    enabledSkills: {
                      taskManagement: true,
                      computerAgents: true,
                    },
                    environmentId: normalizedTask.environmentId || "",
		            knowledgeContext: reviewProjectKnowledgeContext,
                  });
  	            setActivePage("thread");
  	            setCurrentThreadId(threadRecord.id);
  	            setContentMode("chat");
  	            setThreadListMode("threads");
  	            setChangesNavigationTarget(null);
  	            setRunnerRenderKey((current) => current + 1);
  	            applyTaskRunState({
                taskId: normalizedTaskId,
                projectId: updatedTask.projectId || reviewProjectId || taskRunState.projectId || "",
                threadId: threadRecord.id,
                ticketNumber: reviewTaskPreview.ticketNumber || taskRunState.ticketNumber || "",
                title: updatedTask.title || reviewTaskPreview.title || "Untitled Task",
                runKind: "review",
                phase: "running",
                taskStatus: "in_review",
  	            });
  	            void refreshThreads(undefined, threadRecord.id);
  	            if (executionStarted) {
                void loadThreadGroundTruthStatus(threadRecord.id);
  	            }
  	            return threadRecord;
  	          } catch (error) {
  	            taskReviewThreadStartKeysRef.current.delete(startKey);
  	            console.warn("Failed to start task review thread", {
                taskId: normalizedTaskId,
                implementationThreadId: normalizedImplementationThreadId,
                error,
  	            });
  	            applyTaskRunState({
                taskId: normalizedTaskId,
                threadId: normalizedImplementationThreadId,
                projectId: taskRunState.projectId || reviewProjectId || normalizedTask.projectId || "",
                ticketNumber: taskRunState.ticketNumber || taskPreview.ticketNumber || "",
                title: taskRunState.title || normalizedTask.title || "Untitled Task",
                runKind: "implementation",
                phase: "in_review",
                taskStatus: "in_review",
                error: error instanceof Error ? error.message : "Failed to start review thread.",
  	            });
  	            throw error;
  	          }
  	        }, [
  	          applyTaskRunState,
  	          authRequestHeaders,
  	          buildTaskReviewRunPrompt,
  	          buildTaskReviewThreadPreview,
  	          hasRealAccess,
  	          latestInteractedProjectId,
  	          loadThreadGroundTruthStatus,
  	          proxyBackendBase,
  	          realProjects,
  	          refreshThreads,
  	          upsertRealThreadRecord,
  	        ]);
  
  	        const syncCompletedTaskRun = useCallback(async function syncCompletedTaskRun(taskRunState) {
            const normalizedTaskId = typeof taskRunState?.taskId === "string" ? taskRunState.taskId.trim() : "";
            const normalizedThreadId = typeof taskRunState?.threadId === "string" ? taskRunState.threadId.trim() : "";
            if (!hasRealAccess || !normalizedTaskId || !normalizedThreadId) {
              return;
            }
            if (taskCompletionSyncInFlightRef.current.has(normalizedTaskId)) {
              return;
            }
  
            taskCompletionSyncInFlightRef.current.add(normalizedTaskId);
  
            try {
              const currentTaskResponse = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTaskId), {
                method: "GET",
                headers: authRequestHeaders,
              });
              const currentTaskData = await currentTaskResponse.json().catch(() => ({}));
              if (!currentTaskResponse.ok) {
                throw new Error(currentTaskData?.message || currentTaskData?.error || "Failed to load task before marking it as finished.");
              }
  
              const currentTaskRecord = normalizePlaygroundTaskRecord(getPlaygroundTaskResponseRecord(currentTaskData));
              if (!currentTaskRecord?.id) {
                throw new Error("Task details were unavailable when finishing the task.");
              }
  
  	            const currentTaskDetails = currentTaskData?.details && typeof currentTaskData.details === "object" && !Array.isArray(currentTaskData.details)
                ? currentTaskData.details
                : {};
  	            const normalizedRunKind = String(taskRunState?.runKind || "").trim().toLowerCase();
  	            const isReviewRun = normalizedRunKind === "review";
  	            const runStateReviewerAgentId = String(taskRunState?.reviewerAgentId || "").trim();
  	            const currentTaskForCompletion = normalizePlaygroundTaskRecord({
                ...currentTaskRecord,
                reviewRequired: currentTaskRecord.reviewRequired === true
                  || taskRunState?.reviewRequired === true
                  || Boolean(runStateReviewerAgentId),
                reviewerAgentId: currentTaskRecord.reviewerAgentId || runStateReviewerAgentId || null,
  	            });
  	            const incompleteSubtasksById = new Map();
              const recordIncompleteSubtask = (subtaskRecord) => {
                const normalizedSubtask = normalizePlaygroundTaskRecord(subtaskRecord);
                if (normalizedSubtask?.id && String(normalizedSubtask.status || "").trim() !== "done") {
                  incompleteSubtasksById.set(normalizedSubtask.id, normalizedSubtask);
                }
              };
              if (Array.isArray(currentTaskDetails.subtasks)) {
                currentTaskDetails.subtasks.forEach(recordIncompleteSubtask);
              }
              const incompleteSubtasks = Array.from(incompleteSubtasksById.values());
              if (incompleteSubtasks.length > 0) {
                const previewLabels = incompleteSubtasks
                  .slice(0, 3)
                  .map((subtask) => subtask.ticketNumber || subtask.title || subtask.id)
                  .filter(Boolean);
                const suffix = incompleteSubtasks.length > previewLabels.length
                  ? " +" + String(incompleteSubtasks.length - previewLabels.length) + " more"
                  : "";
                applyTaskRunState({
                  taskId: normalizedTaskId,
                  threadId: normalizedThreadId,
                  projectId: taskRunState.projectId || "",
                  ticketNumber: taskRunState.ticketNumber || "",
                  title: taskRunState.title || "Untitled Task",
                  phase: "waiting_subtasks",
                  error: "Finish subtasks before closing parent: " + previewLabels.join(", ") + suffix,
                });
                return;
  	            }
  
  	            if (isReviewRun) {
                const reviewResolvedStatus = currentTaskRecord.status === "done"
                  ? "done"
                  : currentTaskRecord.status === "blocked"
                    ? "blocked"
                    : currentTaskRecord.status === "todo"
                      ? "todo"
                      : currentTaskRecord.status === "in_progress"
                        ? "in_progress"
                        : "in_review";
                applyTaskRunState({
                  taskId: normalizedTaskId,
                  threadId: normalizedThreadId,
                  projectId: taskRunState.projectId || currentTaskRecord.projectId || "",
                  ticketNumber: taskRunState.ticketNumber || currentTaskRecord.ticketNumber || "",
                  title: taskRunState.title || currentTaskRecord.title || "Untitled Task",
                  runKind: "review",
                  phase: reviewResolvedStatus === "done" ? "finished" : "in_review",
                  taskStatus: reviewResolvedStatus,
                });
                updateThreadTaskPreviewStatus(normalizedThreadId, normalizedTaskId, reviewResolvedStatus);
                taskCompletionSyncedThreadKeysRef.current.add(normalizedTaskId + ":" + normalizedThreadId);
                return;
  	            }
  
  			            const shouldMoveToReview = hasPlaygroundIndependentReviewer(currentTaskForCompletion);
  		            const nextTaskStatus = shouldMoveToReview ? "in_review" : "done";
  	            const completedAt = shouldMoveToReview ? null : new Date().toISOString();
  	            const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTaskId), {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  projectId: currentTaskRecord.projectId || taskRunState.projectId || "",
                  releaseId: currentTaskRecord.releaseId,
                  ticketNumber: currentTaskRecord.ticketNumber,
                  type: currentTaskRecord.taskType,
                  parentTaskId: currentTaskRecord.taskType === "subtask" ? currentTaskRecord.parentTaskId : null,
                  title: currentTaskRecord.title,
                  description: currentTaskRecord.description,
                  status: nextTaskStatus,
                  priority: currentTaskRecord.priority,
                  sprintId: currentTaskRecord.sprintId,
                  assigneeAgentId: isPlaygroundHumanAssigneeId(currentTaskForCompletion.assigneeAgentId)
                    ? null
                    : currentTaskForCompletion.assigneeAgentId,
                  reviewRequired: currentTaskForCompletion.reviewRequired,
                  reviewerAgentId: currentTaskForCompletion.reviewerAgentId,
                  environmentId: currentTaskForCompletion.environmentId,
                  dependencyIds: currentTaskForCompletion.dependencyIds,
                  linkedThreadIds: currentTaskForCompletion.linkedThreadIds,
                  lastStartedThreadId: normalizedThreadId,
                  scheduledStartAt: currentTaskRecord.scheduledStartAt,
                  scheduledEndAt: currentTaskRecord.scheduledEndAt,
                  dueAt: currentTaskRecord.dueAt,
                  completedAt,
                  sortOrder: Number.isFinite(currentTaskRecord.sortOrder) ? currentTaskRecord.sortOrder : Date.now(),
                  metadata: buildPlaygroundTaskMetadata(currentTaskForCompletion, {
                    ticketNumber: currentTaskForCompletion.ticketNumber,
                    taskType: currentTaskForCompletion.taskType,
  		                parentTaskId: currentTaskForCompletion.parentTaskId,
  		                assigneeAgentId: currentTaskForCompletion.assigneeAgentId,
  		                reviewRequired: currentTaskForCompletion.reviewRequired,
  		                reviewerAgentId: currentTaskForCompletion.reviewerAgentId,
  		                environmentId: currentTaskForCompletion.environmentId,
                    taskColor: currentTaskForCompletion.taskColor,
                    scheduleType: currentTaskForCompletion.scheduleType,
                    cronExpression: currentTaskForCompletion.cronExpression,
                    scheduleTimezone: currentTaskForCompletion.scheduleTimezone,
                    scheduleEnabled: currentTaskForCompletion.scheduleEnabled,
                    attachments: currentTaskForCompletion.attachments,
                    enabledSkills: currentTaskForCompletion.enabledSkills,
                    connectors: currentTaskForCompletion.connectors,
                    comments: currentTaskForCompletion.comments,
                  }),
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                const serverIncompleteSubtasks = Array.isArray(data?.incompleteSubtasks)
                  ? data.incompleteSubtasks.map((subtask) => normalizePlaygroundTaskRecord(subtask)).filter((subtask) => subtask?.id)
                  : [];
                if (response.status === 409 && serverIncompleteSubtasks.length > 0) {
                  const previewLabels = serverIncompleteSubtasks
                    .slice(0, 3)
                    .map((subtask) => subtask.ticketNumber || subtask.title || subtask.id)
                    .filter(Boolean);
                  const suffix = serverIncompleteSubtasks.length > previewLabels.length
                    ? " +" + String(serverIncompleteSubtasks.length - previewLabels.length) + " more"
                    : "";
                  applyTaskRunState({
                    taskId: normalizedTaskId,
                    threadId: normalizedThreadId,
                    projectId: taskRunState.projectId || "",
                    ticketNumber: taskRunState.ticketNumber || "",
                    title: taskRunState.title || "Untitled Task",
                    phase: "waiting_subtasks",
                    error: "Finish subtasks before closing parent: " + previewLabels.join(", ") + suffix,
                  });
                  return;
                }
                throw new Error(data?.message || data?.error || "Failed to mark task as finished.");
              }
  
  		            applyTaskRunState({
  	              taskId: normalizedTaskId,
  	              threadId: normalizedThreadId,
  	              projectId: taskRunState.projectId || "",
  			              ticketNumber: taskRunState.ticketNumber || "",
  			              title: taskRunState.title || "Untitled Task",
  			              runKind: normalizedRunKind || "implementation",
  			              phase: shouldMoveToReview ? "in_review" : "finished",
  			              taskStatus: nextTaskStatus,
  			            });
  		          } catch (error) {
  	            applyTaskRunState({
                taskId: normalizedTaskId,
                threadId: normalizedThreadId,
                projectId: taskRunState.projectId || "",
                ticketNumber: taskRunState.ticketNumber || "",
                title: taskRunState.title || "Untitled Task",
                runKind: taskRunState.runKind || "implementation",
                phase: "failed",
                error: error instanceof Error ? error.message : "Failed to mark task as finished.",
  	            });
            } finally {
              taskCompletionSyncInFlightRef.current.delete(normalizedTaskId);
            }
  		        }, [applyTaskRunState, authRequestHeaders, hasRealAccess, proxyBackendBase, updateThreadTaskPreviewStatus]);
  
          const refreshEnvironments = useCallback(async function refreshEnvironments() {
            if (!hasRealAccess) {
              setRealEnvironments([]);
              return;
            }
  
            const parseResponse = async (response) => {
              const text = await response.text();
              let parsed = {};
              try {
                parsed = text ? JSON.parse(text) : {};
              } catch {
                parsed = {};
              }
              return parsed;
            };
  
            try {
              const response = await fetch(proxyBackendBase + "/environments", {
                method: "GET",
                headers: authRequestHeaders,
              });
  
              if (response.ok) {
                const parsed = await parseResponse(response);
                const items = parsePlaygroundEnvironmentListResponse(parsed);
                // An empty catalog is not a valid settled state for the shell:
                // the default endpoint lazily provisions the account's first
                // selectable computer. This is especially important for the
                // files page, which receives the catalog directly as a prop.
                if (items.length > 0) {
                  setRealEnvironments(items);
                  return;
                }
              } else {
                if (isUnauthorizedStatus(response.status)) {
                  setRealEnvironments([]);
                  triggerPlatformSessionRecovery();
                  return;
                }
              }
  
              const fallbackResponse = await fetch(proxyBackendBase + "/environments/default", {
                method: "GET",
                headers: authRequestHeaders,
                credentials: "include",
              });
  
              if (isUnauthorizedStatus(fallbackResponse.status)) {
                setRealEnvironments([]);
                triggerPlatformSessionRecovery();
                return;
              }
  
              if (!fallbackResponse.ok) {
                setRealEnvironments([]);
                return;
              }
  
              const parsed = await parseResponse(fallbackResponse);
              const fallbackEnvironment = getPlaygroundEnvironmentResponseRecord(parsed);
              setRealEnvironments(fallbackEnvironment ? [fallbackEnvironment] : []);
            } catch {
              setRealEnvironments([]);
            }
          }, [
            authRequestHeaders,
            hasRealAccess,
            proxyBackendBase,
            triggerPlatformSessionRecovery,
          ]);
  
          const refreshAgents = useCallback(async function refreshAgents(options = {}) {
            if (!hasRealAccess) {
              setRealAgents([]);
              realAgentsRef.current = [];
              realAgentsScopeKeyRef.current = "";
              return [];
            }

            const scopeKey = activeAgentRequestScopeKey;
            const cached = readCachedPlaygroundAgentList(scopeKey);
            if (
              cached
              && activeAgentRequestScopeKeyRef.current === scopeKey
              && (
                realAgentsScopeKeyRef.current !== scopeKey
                || realAgentsRef.current.length === 0
              )
            ) {
              realAgentsScopeKeyRef.current = scopeKey;
              realAgentsRef.current = cached.agents;
              setRealAgents(cached.agents);
            }
            if (cached?.isFresh && options?.force !== true) {
              return cached.agents;
            }

            const inFlight = agentRefreshInFlightRef.current;
            if (inFlight?.scopeKey === scopeKey && inFlight?.promise) {
              return inFlight.promise;
            }

            const request = (async () => {
              try {
                const response = await fetch(proxyBackendBase + "/agents?view=overview&limit=100", {
                  method: "GET",
                  headers: authRequestHeaders,
                  cache: "no-store",
                });

                const text = await response.text();
                let parsed = {};
                try {
                  parsed = text ? JSON.parse(text) : {};
                } catch {
                  parsed = {};
                }

                if (isUnauthorizedStatus(response.status)) {
                  if (activeAgentRequestScopeKeyRef.current === scopeKey) {
                    setRealAgents([]);
                    realAgentsRef.current = [];
                    realAgentsScopeKeyRef.current = "";
                    triggerPlatformSessionRecovery();
                  }
                  return [];
                }

                if (!response.ok) {
                  return realAgentsScopeKeyRef.current === scopeKey
                    ? realAgentsRef.current
                    : cached?.agents || [];
                }

                const nextAgents = parsePlaygroundAgentListResponse(parsed);
                writeCachedPlaygroundAgentList(scopeKey, nextAgents);
                if (activeAgentRequestScopeKeyRef.current === scopeKey) {
                  const currentAgents = realAgentsScopeKeyRef.current === scopeKey
                    ? realAgentsRef.current
                    : [];
                  const committedAgents = arePlaygroundAgentListsEquivalent(currentAgents, nextAgents)
                    ? currentAgents
                    : nextAgents;
                  realAgentsScopeKeyRef.current = scopeKey;
                  realAgentsRef.current = committedAgents;
                  if (committedAgents !== currentAgents) {
                    setRealAgents(committedAgents);
                  }
                  return committedAgents;
                }
                return nextAgents;
              } catch {
                return realAgentsScopeKeyRef.current === scopeKey
                  ? realAgentsRef.current
                  : cached?.agents || [];
              }
            })();

            agentRefreshInFlightRef.current = {
              scopeKey,
              promise: request,
            };
            try {
              return await request;
            } finally {
              if (agentRefreshInFlightRef.current?.promise === request) {
                agentRefreshInFlightRef.current = {
                  scopeKey: "",
                  promise: null,
                };
              }
            }
          }, [
            activeAgentRequestScopeKey,
            authRequestHeaders,
            hasRealAccess,
            proxyBackendBase,
            triggerPlatformSessionRecovery,
          ]);
  
          const refreshServers = useCallback(async function refreshServers() {
            if (!hasRealAccess) {
              setRealServers([]);
              return;
            }
  
            try {
              const response = await fetch(proxyBackendBase + "/servers", {
                method: "GET",
                headers: authRequestHeaders,
              });
  
              const text = await response.text();
              let parsed = {};
              try {
                parsed = text ? JSON.parse(text) : {};
              } catch {
                parsed = {};
              }
  
              if (isUnauthorizedStatus(response.status)) {
                setRealServers([]);
                triggerPlatformSessionRecovery();
                return;
              }
  
              if (!response.ok) {
                setRealServers([]);
                return;
              }
  
              setRealServers(parsePlaygroundServerListResponse(parsed));
            } catch {
              setRealServers([]);
            }
          }, [authRequestHeaders, hasRealAccess, proxyBackendBase, triggerPlatformSessionRecovery]);
  
  ${DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics}
          function handleNewThread(options = {}) {
            const nextInitialPrompt = normalizePlaygroundInitialPrompt(options?.initialPrompt);
            const requestedKnowledgeContext = options?.knowledgeContext
              && typeof options.knowledgeContext === "object"
              && !Array.isArray(options.knowledgeContext)
              ? options.knowledgeContext
              : null;
            const knowledgeLibraryIds = Array.from(new Set(
              [
                ...(Array.isArray(options?.knowledgeLibraryIds) ? options.knowledgeLibraryIds : []),
                ...(Array.isArray(requestedKnowledgeContext?.libraryIds) ? requestedKnowledgeContext.libraryIds : []),
                ...(Array.isArray(requestedKnowledgeContext?.bindings)
                  ? requestedKnowledgeContext.bindings.map((binding) => binding?.libraryId || binding?.id)
                  : []),
              ]
                .map((libraryId) => String(libraryId || "").trim())
                .filter(Boolean)
            ));
            const promptAttachment = options?.promptAttachment && typeof options.promptAttachment === "object"
              ? options.promptAttachment
              : null;
            const normalizedPromptAttachmentId = String(promptAttachment?.id || "").trim();
            const requestedEnabledSkillIds = normalizePlaygroundEnabledSkillIds(options?.enabledSkillIds);
            const previousThreadId = String(currentThreadId || "").trim();
            if (isPrivateThreadId(previousThreadId)) {
              discardPrivateThread(previousThreadId);
            }
            metronomeRunTraceSelectionRef.current = null;
            setSidebarWorkspaceMode("work");
            setInitialLandingPrompt(nextInitialPrompt);
            setInitialThreadPrivateMode(options?.privateMode === true);
            setActivePage("thread");
            setCurrentThreadId("");
            setMetronomeRunTraceSelection(null);
            setThreadAgentSelectionOverride(null);
            setPendingThreadRunRequest(null);
            setPendingThreadKnowledgeContext(knowledgeLibraryIds.length > 0
              ? {
                  ...(requestedKnowledgeContext || {}),
                  enabled: true,
                  libraryIds: knowledgeLibraryIds,
                }
              : null);
            setPendingThreadPromptAttachmentRequest(normalizedPromptAttachmentId
              ? {
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                  prompt: {
                    id: normalizedPromptAttachmentId,
                    name: String(promptAttachment?.name || "Untitled prompt").trim() || "Untitled prompt",
                    description: String(promptAttachment?.description || ""),
                    markdown: String(
                      promptAttachment?.markdown
                      ?? promptAttachment?.currentVersion?.markdown
                      ?? ""
                    ),
                    currentVersionId: String(
                      promptAttachment?.currentVersionId
                      || promptAttachment?.currentVersion?.id
                      || ""
                    ).trim(),
                    currentVersionNumber: Number(
                      promptAttachment?.currentVersionNumber
                      || promptAttachment?.currentVersion?.number
                      || 1
                    ),
                  },
                }
              : null);
            if (requestedEnabledSkillIds.length > 0) {
              setRunnerEnabledSkillIds((current) => Array.from(new Set([
                ...normalizePlaygroundEnabledSkillIds(current),
                ...requestedEnabledSkillIds,
              ])));
            }
            setContentMode("chat");
            setChangesNavigationTarget(null);
            setThreadListMode("threads");
            setRunnerRenderKey((current) => current + 1);
          }
  
          function handleThreadSelect(threadId) {
            if (!threadId) return;
            if (hasRealAccess && !isRealThreadId(threadId)) return;
            const previousThreadId = String(currentThreadId || "").trim();
            if (previousThreadId !== threadId && isPrivateThreadId(previousThreadId)) {
              discardPrivateThread(previousThreadId);
            }
            setInitialThreadPrivateMode(false);
            setThreadNavMenuOpen(false);
            metronomeRunTraceSelectionRef.current = null;
            setSidebarWorkspaceMode("work");
            setActivePage("thread");
            setCurrentThreadId(threadId);
            setMetronomeRunTraceSelection(null);
            setThreadAgentSelectionOverride(null);
            setPendingThreadRunRequest(null);
            setPendingThreadDocumentPreviewRequest(null);
            setPendingThreadPromptAttachmentRequest(null);
            setPendingThreadKnowledgeContext(null);
            setThreadTaskOpenRequest(null);
            setThreadSubagentDetailOpen(false);
            setThreadDeepResearchDetailOpen(false);
            setThreadDocumentPreviewOpen(false);
            setContentMode("chat");
            setChangesNavigationTarget(null);
            setThreadListMode("threads");
            setRunnerRenderKey((current) => current + 1);
            void refreshThreads(undefined, threadId, { silent: true });
          }
  
          function closeThreadActionMenu() {
            setThreadActionMenuState(null);
          }
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.runMenuControls}
          function openThreadActionMenu(event, threadId, threadRecord = null, options = {}) {
            event.preventDefault();
            event.stopPropagation();
  
            const rect = event.currentTarget.getBoundingClientRect();
            const menuWidth = 240;
            const menuActions = Array.isArray(options?.menuActions)
              ? options.menuActions.filter(Boolean)
              : [];
            const menuHeight = 182 + (menuActions.length * 40);
            const openUpward = rect.bottom + menuHeight > window.innerHeight - 12 && rect.top - menuHeight >= 12;
            const top = openUpward
              ? Math.max(12, rect.top - menuHeight - 8)
              : Math.min(window.innerHeight - menuHeight - 12, rect.bottom + 8);
            const left = Math.min(
              Math.max(12, rect.right - menuWidth),
              Math.max(12, window.innerWidth - menuWidth - 12),
            );
  
            setThreadNavMenuOpen(false);
            setThreadTaskListMenuOpen(false);
            setMetronomeRunActionMenuState(null);
            setThreadActionMenuState({
              threadId,
              top,
              left,
              threadRecord: threadRecord && typeof threadRecord === "object" ? threadRecord : null,
              menuActions,
            });
          }
  
          const loadThreadTaskListForThread = useCallback(async (threadId, options = {}) => {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || !hasRealAccess || !isRealThreadId(normalizedThreadId) || isPrivateThreadId(normalizedThreadId)) {
              if (normalizedThreadId) {
                setThreadTaskListAvailabilityById((current) => ({
                  ...(current && typeof current === "object" ? current : {}),
                  [normalizedThreadId]: "empty",
                }));
              }
              setThreadTaskListState((current) => (
                current.threadId === normalizedThreadId
                  ? { threadId: normalizedThreadId, status: "idle", error: "", todos: [], updatedAt: "" }
                  : current
              ));
              return [];
            }
  
            setThreadTaskListState((current) => ({
              threadId: normalizedThreadId,
              status: current.threadId === normalizedThreadId && Array.isArray(current.todos) && current.todos.length > 0
                ? "refreshing"
                : "loading",
              error: "",
              todos: current.threadId === normalizedThreadId && Array.isArray(current.todos) ? current.todos : [],
              updatedAt: current.threadId === normalizedThreadId ? current.updatedAt || "" : "",
            }));
  
            try {
              const response = await fetch(proxyBackendBase + "/threads/" + encodeURIComponent(normalizedThreadId) + "/logs?compact=1&includeConversation=0", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load task list.");
              }
              const todos = extractLatestThreadTodoList(data);
              setThreadTaskListAvailabilityById((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                [normalizedThreadId]: Array.isArray(todos) && todos.length > 0 ? "available" : "empty",
              }));
              setThreadTaskListState({
                threadId: normalizedThreadId,
                status: "loaded",
                error: "",
                todos,
                updatedAt: new Date().toISOString(),
              });
              return todos;
            } catch (error) {
              setThreadTaskListAvailabilityById((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                [normalizedThreadId]: "empty",
              }));
              setThreadTaskListState((current) => ({
                threadId: normalizedThreadId,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load task list.",
                todos: current.threadId === normalizedThreadId && Array.isArray(current.todos) ? current.todos : [],
                updatedAt: current.threadId === normalizedThreadId ? current.updatedAt || "" : "",
              }));
              return [];
            }
          }, [hasRealAccess, proxyBackendBase, requestHeaders]);
  
          const handleThreadTaskListChange = useCallback((threadId, log) => {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || !hasRealAccess || !isRealThreadId(normalizedThreadId) || isPrivateThreadId(normalizedThreadId)) {
              return;
            }
            const todos = extractLatestThreadTodoList({ logs: [log] });
            setThreadTaskListAvailabilityById((current) => ({
              ...(current && typeof current === "object" ? current : {}),
              [normalizedThreadId]: "available",
            }));
            if (Array.isArray(todos) && todos.length > 0) {
              setThreadTaskListState({
                threadId: normalizedThreadId,
                status: "loaded",
                error: "",
                todos,
                updatedAt: new Date().toISOString(),
              });
            }
          }, [hasRealAccess]);
  
          function toggleThreadTaskListMenu(event) {
            event.preventDefault();
            event.stopPropagation();
            const normalizedThreadId = String(activeThreadTaskListTargetId || selectedKnownThread?.id || currentThreadId || "").trim();
            if (!normalizedThreadId) {
              return;
            }
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
            setMetronomeRunActionMenuState(null);
            const willOpen = !threadTaskListMenuOpen;
            setThreadTaskListMenuOpen(willOpen);
            if (willOpen) {
              void loadThreadTaskListForThread(normalizedThreadId, { force: true });
            }
          }
  
          function handleThreadNavMenuOpenChange(open) {
            const nextOpen = Boolean(open);
            if (nextOpen && !selectedThreadNavRecord?.id) {
              return;
            }
            setThreadActionMenuState(null);
            setThreadTaskListMenuOpen(false);
            setMetronomeRunActionMenuState(null);
            setThreadNavMenuOpen(nextOpen);
          }
  
          function openThreadRenameDialog(thread) {
            if (!thread?.id) return;
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
  	          setThreadRenameState({
  	            threadId: thread.id,
  	            originalTitle: thread.title || "Untitled thread",
  	            threadRecord: thread && typeof thread === "object" ? thread : null,
  	          });
            setThreadRenameValue(thread.title || "");
            setThreadRenameError("");
          }
  
          async function loadThreadProjectPickerProjects() {
            if (!hasRealAccess) {
              setThreadProjectPickerProjects([]);
              return;
            }
  
            setThreadProjectPickerLoading(true);
            try {
              const response = await fetch(proxyBackendBase + "/projects", {
                method: "GET",
                headers: authRequestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load projects.");
              }
              const nextProjects = sortPlaygroundProjectsByRecent(parsePlaygroundProjectListResponse(data));
              setThreadProjectPickerProjects(nextProjects);
              setThreadProjectPickerValue((current) => current || (nextProjects[0]?.id || ""));
            } catch (error) {
              setThreadProjectPickerProjects([]);
              setThreadProjectPickerError(error instanceof Error ? error.message : "Failed to load projects.");
            } finally {
              setThreadProjectPickerLoading(false);
            }
          }
  
          function openThreadProjectPickerDialog(thread) {
            if (!thread?.id) return;
            const currentProjectId = typeof thread?.projectId === "string" ? thread.projectId.trim() : "";
            const defaultProjectId = currentProjectId || String(latestInteractedProjectId || "").trim() || "";
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
            setThreadProjectPickerState({
              threadId: thread.id,
              currentProjectId,
              threadRecord: thread && typeof thread === "object" ? thread : null,
            });
            setThreadProjectPickerValue(defaultProjectId);
            setThreadProjectPickerError("");
            setThreadProjectPickerProjects([]);
            void loadThreadProjectPickerProjects();
          }
  
          function closeThreadRenameDialog() {
            if (threadMutationState.action === "rename") {
              return;
            }
            setThreadRenameState(null);
            setThreadRenameValue("");
            setThreadRenameError("");
          }
  
          function closeThreadProjectPickerDialog() {
            if (threadMutationState.action === "project") {
              return;
            }
            setThreadProjectPickerState(null);
            setThreadProjectPickerValue("");
            setThreadProjectPickerProjects([]);
            setThreadProjectPickerError("");
          }
  
          function getThreadResponseRecord(data) {
            if (data?.thread && typeof data.thread === "object") {
              return data.thread;
            }
            if (data?.data && typeof data.data === "object") {
              return data.data;
            }
            return data && typeof data === "object" ? data : {};
          }
  
          async function persistThreadProjectAssignment(threadId, nextProjectId, threadRecord = null, nextProjectName = "") {
            const normalizedThreadId = String(threadId || "").trim();
            const normalizedProjectId = String(nextProjectId || "").trim();
            if (!normalizedThreadId) {
              return;
            }
  
            const originalThread = baseThreadItems.find((thread) => thread.id === normalizedThreadId)
              || (threadRecord ? normalizeThreadItem(threadRecord) : null);
  
            setThreadMutationState({
              threadId: normalizedThreadId,
              action: "project",
            });
  
            try {
              const response = await fetch(proxyBackendBase + "/threads/" + encodeURIComponent(normalizedThreadId), {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  projectId: normalizedProjectId || null,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || (normalizedProjectId ? "Failed to add thread to project." : "Failed to remove thread from project."));
              }
  
              const threadResponseRecord = getThreadResponseRecord(data);
              const normalizedUpdatedThread = normalizeThreadItem({
                ...(originalThread || {}),
                ...threadResponseRecord,
                projectId: typeof threadResponseRecord?.projectId === "string"
                  ? threadResponseRecord.projectId.trim()
                  : normalizedProjectId,
                projectName: normalizedProjectId
                  ? (
                      typeof threadResponseRecord?.projectName === "string" && threadResponseRecord.projectName.trim()
                        ? threadResponseRecord.projectName.trim()
                        : String(nextProjectName || originalThread?.projectName || "").trim()
                    )
                  : "",
                metadata: threadResponseRecord?.metadata && typeof threadResponseRecord.metadata === "object"
                  ? threadResponseRecord.metadata
                  : originalThread?.metadata,
              });
  
              setRealThreads((current) => {
                const existingIndex = current.findIndex((thread) => thread.id === normalizedThreadId);
                if (existingIndex === -1) {
                  return [normalizedUpdatedThread].concat(current);
                }
                return current.map((thread) => (
                  thread.id === normalizedThreadId ? normalizedUpdatedThread : thread
                ));
              });
  
              setThreadProjectContextById((current) => {
                if (!normalizedProjectId) {
                  if (!Object.prototype.hasOwnProperty.call(current, normalizedThreadId)) {
                    return current;
                  }
                  const next = { ...current };
                  delete next[normalizedThreadId];
                  return next;
                }
                return {
                  ...current,
                  [normalizedThreadId]: {
                    projectId: normalizedProjectId,
                    projectName: String(nextProjectName || threadProjectContextById[normalizedThreadId]?.projectName || "").trim(),
                  },
                };
              });
  
              if (normalizedProjectId) {
                setLatestInteractedProjectId(normalizedProjectId);
              }
  
              emitThreadMutationSignal("project", normalizedThreadId, normalizedUpdatedThread);
              await refreshThreads();
            } finally {
              setThreadMutationState({
                threadId: "",
                action: "",
              });
            }
          }
  
          function handleOpenThreadProjectAction(thread) {
            const currentProjectId = typeof thread?.projectId === "string" ? thread.projectId.trim() : "";
            if (currentProjectId) {
              setThreadActionMenuState(null);
              setThreadNavMenuOpen(false);
              void persistThreadProjectAssignment(thread.id, "", thread).catch((error) => {
                window.alert(error instanceof Error ? error.message : "Failed to remove thread from project.");
              });
              return;
            }
            openThreadProjectPickerDialog(thread);
          }
  
          function buildThreadPinnedMetadata(thread, pinned) {
            const currentMetadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
              ? thread.metadata
              : {};
            const currentRunnerPlayground = currentMetadata?.runnerPlayground && typeof currentMetadata.runnerPlayground === "object" && !Array.isArray(currentMetadata.runnerPlayground)
              ? currentMetadata.runnerPlayground
              : {};
            const nextRunnerPlayground = {
              ...currentRunnerPlayground,
              pinnedInSidebar: pinned,
            };
  
            if (pinned) {
              nextRunnerPlayground.pinnedAt = currentRunnerPlayground.pinnedAt || new Date().toISOString();
            } else {
              delete nextRunnerPlayground.pinnedAt;
            }
  
            return {
              ...currentMetadata,
              runnerPlayground: nextRunnerPlayground,
            };
          }
  
  	        async function handleThreadPinToggle(threadId) {
  	          const targetThread = baseThreadItems.find((thread) => thread.id === threadId)
  	            || (
  	              threadActionMenuState?.threadId === threadId && threadActionMenuState.threadRecord
  	                ? normalizeThreadItem(threadActionMenuState.threadRecord)
  	                : null
  	            );
  	          if (!targetThread) {
  	            return;
  	          }
  
            const nextPinned = !targetThread.isPinned;
            const nextMetadata = buildThreadPinnedMetadata(targetThread, nextPinned);
  
            setThreadNavMenuOpen(false);
            setThreadMutationState({
              threadId,
              action: "pin",
            });
  
            try {
              const response = await fetch(proxyBackendBase + "/threads/" + encodeURIComponent(threadId), {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  metadata: nextMetadata,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || ("Failed to " + (nextPinned ? "pin" : "unpin") + " thread."));
              }
  
              const threadRecord = getThreadResponseRecord(data);
              const normalizedUpdatedThread = normalizeThreadItem({
                ...targetThread,
                ...threadRecord,
                metadata: threadRecord?.metadata && typeof threadRecord.metadata === "object" ? threadRecord.metadata : nextMetadata,
              });
  
              setRealThreads((current) => {
                const existingIndex = current.findIndex((thread) => thread.id === threadId);
                if (existingIndex === -1) {
                  return [normalizedUpdatedThread].concat(current);
                }
                return current.map((thread) => (thread.id === threadId ? normalizedUpdatedThread : thread));
              });
              emitThreadMutationSignal("pin", threadId, normalizedUpdatedThread);
              setThreadActionMenuState(null);
              void refreshThreads();
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Failed to update thread pin state.");
            } finally {
              setThreadMutationState({
                threadId: "",
                action: "",
              });
            }
          }
  
          async function handleThreadRenameSubmit(event) {
            event.preventDefault();
            if (!threadRenameState?.threadId) {
              return;
            }
  
            const nextTitle = String(threadRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextTitle) {
              setThreadRenameError("Thread title cannot be empty.");
              return;
            }
  
            if (nextTitle === threadRenameState.originalTitle) {
              closeThreadRenameDialog();
              return;
            }
  
            setThreadMutationState({
              threadId: threadRenameState.threadId,
              action: "rename",
            });
            setThreadRenameError("");
  
            try {
              const response = await fetch(proxyBackendBase + "/threads/" + encodeURIComponent(threadRenameState.threadId), {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: nextTitle,
                }),
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to rename thread.");
              }
  
              const threadRecord = getThreadResponseRecord(data);
  	            const originalThread = baseThreadItems.find((thread) => thread.id === threadRenameState.threadId)
  	              || (threadRenameState.threadRecord ? normalizeThreadItem(threadRenameState.threadRecord) : null);
              const normalizedUpdatedThread = normalizeThreadItem({
                ...(originalThread || {}),
                ...threadRecord,
                title: typeof threadRecord?.title === "string" && threadRecord.title.trim()
                  ? threadRecord.title.trim()
                  : nextTitle,
                metadata: threadRecord?.metadata && typeof threadRecord.metadata === "object"
                  ? threadRecord.metadata
                  : originalThread?.metadata,
              });
  
              setRealThreads((current) => {
                const existingIndex = current.findIndex((thread) => thread.id === threadRenameState.threadId);
                if (existingIndex === -1) {
                  return [normalizedUpdatedThread].concat(current);
                }
                return current.map((thread) => (
                  thread.id === threadRenameState.threadId ? normalizedUpdatedThread : thread
                ));
              });
  
              setThreadRenameState(null);
              setThreadRenameValue("");
              setThreadRenameError("");
              emitThreadMutationSignal("rename", threadRenameState.threadId, normalizedUpdatedThread);
              void refreshThreads();
            } catch (error) {
              setThreadRenameError(error instanceof Error ? error.message : "Failed to rename thread.");
            } finally {
              setThreadMutationState({
                threadId: "",
                action: "",
              });
            }
          }
  
          async function handleThreadProjectPickerSubmit(event) {
            event.preventDefault();
            if (!threadProjectPickerState?.threadId) {
              return;
            }
  
            const nextProjectId = String(threadProjectPickerValue || "").trim();
            const nextProjectName = String(
              threadProjectPickerProjects.find((project) => String(project?.id || "").trim() === nextProjectId)?.name || ""
            ).trim();
            if (!nextProjectId) {
              setThreadProjectPickerError("Choose a project first.");
              return;
            }
  
            if (nextProjectId === String(threadProjectPickerState.currentProjectId || "").trim()) {
              closeThreadProjectPickerDialog();
              return;
            }
  
            const originalThread = baseThreadItems.find((thread) => thread.id === threadProjectPickerState.threadId)
              || (threadProjectPickerState.threadRecord ? normalizeThreadItem(threadProjectPickerState.threadRecord) : null);
  
            setThreadMutationState({
              threadId: threadProjectPickerState.threadId,
              action: "project",
            });
            setThreadProjectPickerError("");
  
            try {
              await persistThreadProjectAssignment(threadProjectPickerState.threadId, nextProjectId, originalThread, nextProjectName);
              setThreadProjectPickerState(null);
              setThreadProjectPickerValue("");
              setThreadProjectPickerProjects([]);
              setThreadProjectPickerError("");
            } catch (error) {
              setThreadProjectPickerError(error instanceof Error ? error.message : "Failed to add thread to project.");
            }
          }
  
          async function handleThreadDelete(threadId) {
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
            setThreadMutationState({
              threadId,
              action: "delete",
            });
  
            try {
              const response = await fetch(proxyBackendBase + "/threads/" + encodeURIComponent(threadId), {
                method: "DELETE",
                headers: authRequestHeaders,
              });
              const data = await response.json().catch(() => ({}));
  
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete thread.");
              }
  
              setRealThreads((current) => current.filter((thread) => thread.id !== threadId));
              emitThreadMutationSignal("delete", threadId, null);
  
              if (currentThreadId === threadId) {
                handleNewThread();
              }
  
              void refreshThreads();
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Failed to delete thread.");
            } finally {
              setThreadMutationState({
                threadId: "",
                action: "",
              });
            }
          }
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.runActions}
          function getSidebarModeForResourcesView(view) {
            if (view === "servers") {
              return "develop";
            }
            if (view === "computers" || view === "agents") {
              return "configure";
            }
            return "work";
          }
  
          function getSidebarModeForToolsView(view) {
            return view === "actions" ? "develop" : "configure";
          }
  
  	        function getDevelopServerPageItems() {
  	          return [
  	            { id: "web-apps", kind: "web_app", label: "Web Apps", Icon: Globe },
  	            { id: "apis", kind: "api", label: "APIs", Icon: Code2 },
  	            { id: "functions", kind: "function", label: "Functions", Icon: FunctionSquare },
  	            { id: "databases", kind: "database", label: "Databases", Icon: Database },
  	            { id: "authentication", kind: "auth", label: "Authentication", Icon: UsersRound },
  	            { id: "agent-runtime", kind: "agent_runtime", label: "Agent Runtime", Icon: Bot },
  	            { id: "voice-agents", kind: "voice_agent", label: "Voice Agents", Icon: AudioLines },
                    { id: "secrets", kind: "secrets", label: "Secrets", Icon: Vault },
  	            { id: "payments", kind: "payments", label: "Payments", Icon: ReceiptText },
  	          ];
  	        }
  
          function normalizeDevelopServerPageKind(kind) {
            const normalizedKind = normalizePlaygroundServerOverviewKind(kind);
            return getDevelopServerPageItems().some((item) => item.kind === normalizedKind) ? normalizedKind : "";
          }
  
          function getDevelopServerPageItem(kind) {
            const normalizedKind = normalizeDevelopServerPageKind(kind);
            return getDevelopServerPageItems().find((item) => item.kind === normalizedKind) || null;
          }
  
          function openResourcesView(nextView, options = {}) {
            const normalizedView = nextView === "servers" ? "servers" : nextView === "computers" ? "computers" : "agents";
            if (normalizedView === "computers" && options.create === true) {
              openPlatformResourceCreationModal("computer");
              return;
            }
            const normalizedServerKind = normalizedView === "servers"
              ? normalizeDevelopServerPageKind(options.serverKind)
              : "";
            const normalizedResourceId = normalizedView === "servers" ? String(options.resourceId || "").trim() : "";
            const normalizedResourceType = normalizedResourceId
              ? (options.resourceType === "database" ? "database" : "server")
              : "";
            const shouldCreateServer = Boolean(
              normalizedView === "servers"
              && options.create === true
              && normalizedServerKind
              && normalizedServerKind !== "voice_agent"
            );
            setAccountMenuOpen(false);
            setProfileEditorOpen(false);
            setResourcesView(normalizedView);
            setResourcesServerKind(normalizedServerKind);
            setResourcesNavigationTarget({
              token: normalizedResourceId ? createPlaygroundPlatformNavigationToken() : 0,
              resourceType: normalizedResourceType,
              resourceId: normalizedResourceId,
              serverCreationToken: shouldCreateServer ? createPlaygroundPlatformNavigationToken() : 0,
              serverCreationKind: shouldCreateServer ? normalizedServerKind : "",
            });
            setResourcesHeaderState({
              mode: "overview",
              title: "",
            });
            if (!options.preserveSidebarMode) {
              setSidebarWorkspaceMode(getSidebarModeForResourcesView(normalizedView));
            }
            setActivePage("resources");
            if (options.forceOverview || shouldCreateServer) {
              setResourcesBackRequestToken((current) => current + 1);
            }
            if (normalizedView === "computers") {
              setEnvironmentsNavigationTargetId("");
              setEnvironmentsOpenToken((current) => current + 1);
            }
          }
  
          function openToolsView(nextView, options = {}) {
            const normalizedView = nextView === "actions"
              ? "actions"
              : nextView === "skills"
                ? "skills"
                : nextView === "prompts"
                  ? "prompts"
                : nextView === "tags"
                  ? "tags"
                  : "plugins";
            setAccountMenuOpen(false);
            setProfileEditorOpen(false);
            setToolsView(normalizedView);
            if (normalizedView === "skills") {
              if (options.create === true) {
                setToolsSkillsOpenRequest({
                  action: "create",
                  skillId: "",
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                });
              } else if (options.skillId) {
                setToolsSkillsOpenRequest({
                  action: "open",
                  skillId: String(options.skillId || "").trim(),
                  skillTab: options.skillTab === "settings" ? "settings" : "code",
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                });
              } else {
                setToolsSkillsOpenRequest(null);
              }
            }
            if (normalizedView === "prompts") {
              if (options.create === true) {
                setToolsPromptsOpenRequest({
                  action: "create",
                  promptId: "",
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                });
              } else if (options.promptId) {
                setToolsPromptsOpenRequest({
                  action: "open",
                  promptId: String(options.promptId || "").trim(),
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                });
              } else {
                setToolsPromptsOpenRequest(null);
              }
            }
            if (options.forceOverview) {
              if (normalizedView === "plugins" || normalizedView === "tags") {
                setSelectedPluginId("");
              } else if (normalizedView === "skills") {
                setToolsSkillsBackRequestToken((current) => current + 1);
              } else if (normalizedView === "prompts") {
                setToolsPromptsBackRequestToken((current) => current + 1);
              }
            }
            if (!options.preserveSidebarMode) {
              setSidebarWorkspaceMode(getSidebarModeForToolsView(normalizedView));
            }
            setActivePage("tools");
          }

          function normalizeProjectResourceNavigationOrigin(resourceType, resource, projectOrigin = {}) {
            const normalizedResourceType = String(resourceType || "").trim();
            if (!["prompt", "knowledge", "evaluation", "metronome", "web_app", "function", "database"].includes(normalizedResourceType)) {
              return null;
            }
            const resourceId = String(
              resource?.id
              || resource?.resourceId
              || resource?.promptId
              || resource?.libraryId
              || resource?.evaluationId
              || resource?.workflowId
              || ""
            ).trim();
            const projectId = String(projectOrigin?.projectId || "").trim();
            if (!resourceId || !projectId) return null;
            const projectRecord = projectOrigin?.projectRecord
              && typeof projectOrigin.projectRecord === "object"
              && !Array.isArray(projectOrigin.projectRecord)
              && String(projectOrigin.projectRecord.id || "").trim() === projectId
                ? projectOrigin.projectRecord
                : null;
            const resourceSnapshot = projectOrigin?.projectResourceSnapshot
              && typeof projectOrigin.projectResourceSnapshot === "object"
              && !Array.isArray(projectOrigin.projectResourceSnapshot)
              && String(projectOrigin.projectResourceSnapshot.projectId || "").trim() === projectId
                ? {
                    projectId,
                    serverResources: Array.isArray(projectOrigin.projectResourceSnapshot.serverResources)
                      ? projectOrigin.projectResourceSnapshot.serverResources.slice()
                      : [],
                    fileActivity: Array.isArray(projectOrigin.projectResourceSnapshot.fileActivity)
                      ? projectOrigin.projectResourceSnapshot.fileActivity.slice()
                      : [],
                  }
                : null;
            return {
              projectId,
              projectName: String(
                projectOrigin?.projectName
                || projectOrigin?.name
                || projectRecord?.name
                || "Project"
              ).trim() || "Project",
              projectRecord,
              projectResourceSnapshot: resourceSnapshot,
              resourceType: normalizedResourceType,
              resourceId,
              sectionId: "resources",
            };
          }

          function openProjectLinkedResourceFromProject(resourceType, resource, projectOrigin = {}) {
            const origin = normalizeProjectResourceNavigationOrigin(resourceType, resource, projectOrigin);
            if (!origin) return;
            projectResourceNavigationOriginRef.current = origin;
            setProjectResourceNavigationOrigin(origin);

            if (origin.resourceType === "prompt") {
              openToolsView("prompts", { promptId: origin.resourceId });
              return;
            }
            if (origin.resourceType === "knowledge") {
              openKnowledgeLibraryPage(
                origin.resourceId,
                String(resource?.name || resource?.title || "").trim()
              );
              return;
            }
            if (origin.resourceType === "evaluation") {
              openEvaluationDetailPage(origin.resourceId);
              return;
            }
            if (origin.resourceType === "metronome") {
              openMetronomePage({ workflowId: origin.resourceId });
              return;
            }
            openResourcesView("servers", {
              serverKind: origin.resourceType,
              resourceId: origin.resourceId,
              resourceType: origin.resourceType === "database" ? "database" : "server",
            });
          }

          function isProjectResourceNavigationOriginActive(origin = projectResourceNavigationOrigin) {
            if (!origin?.resourceId) return false;
            if (origin.resourceType === "prompt") {
              return activePage === "tools"
                && toolsView === "prompts"
                && toolsPromptsHeaderState.mode === "detail"
                && String(toolsPromptsHeaderState.promptId || "").trim() === origin.resourceId;
            }
            if (origin.resourceType === "knowledge") {
              return activePage === "knowledge"
                && knowledgePageMode === "library"
                && String(selectedKnowledgeLibraryId || "").trim() === origin.resourceId;
            }
            if (origin.resourceType === "evaluation") {
              return activePage === "evaluations"
                && evaluationsPageMode === "detail"
                && String(selectedEvaluationSetId || "").trim() === origin.resourceId;
            }
            if (origin.resourceType === "metronome") {
              return activePage === "metronome"
                && metronomeTopNavState?.mode === "editor"
                && String(metronomeTopNavState?.workflowId || "").trim() === origin.resourceId;
            }
            return activePage === "resources"
              && activeResourcesView === "servers"
              && resourcesHeaderState.mode === "detail"
              && activeResourcesServerKind === origin.resourceType
              && String(resourcesHeaderState.resourceId || "").trim() === origin.resourceId;
          }

          function returnToProjectResourceOrigin(origin = projectResourceNavigationOrigin) {
            const projectId = String(origin?.projectId || "").trim();
            if (!projectId) return;
            const projectName = String(origin?.projectName || "Project").trim() || "Project";
            const projectRecord = origin?.projectRecord
              && typeof origin.projectRecord === "object"
              && !Array.isArray(origin.projectRecord)
              && String(origin.projectRecord.id || "").trim() === projectId
                ? origin.projectRecord
                : null;
            const projectResourceSnapshot = origin?.projectResourceSnapshot
              && typeof origin.projectResourceSnapshot === "object"
              && !Array.isArray(origin.projectResourceSnapshot)
              && String(origin.projectResourceSnapshot.projectId || "").trim() === projectId
                ? origin.projectResourceSnapshot
                : null;
            projectResourceNavigationOriginRef.current = null;
            setProjectResourceNavigationOrigin(null);
            setLatestInteractedProjectId(projectId);
            setTasksHeaderState({
              mode: "project",
              title: projectName,
              view: "overview",
              sectionId: "resources",
              projectId,
              detailMode: "",
              taskId: "",
              scheduleId: "",
            });
            setTasksPageNavigationRequest({
              token: createPlaygroundPlatformNavigationToken(),
              projectId,
              view: "overview",
              sectionId: "resources",
              taskId: "",
              taskDetailMode: "",
              missionControlAction: "",
              projectComposerAction: "",
              projectRecord,
              projectResourceSnapshot,
            });
            setSidebarWorkspaceMode("work");
            setActivePage("tasks");
          }

          function resolveProjectResourceBreadcrumbItems(pathItems) {
            if (!Array.isArray(pathItems) || !pathItems.length) return pathItems;
            const origin = projectResourceNavigationOrigin;
            if (!isProjectResourceNavigationOriginActive(origin)) return pathItems;
            const resourceItem = pathItems[pathItems.length - 1];
            if (!resourceItem) return pathItems;
            return [
              {
                label: origin.projectName,
                onClick: () => requestPlatformNavigation(() => returnToProjectResourceOrigin(origin)),
              },
              resourceItem,
            ];
          }

  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.navigation}
  ${MODELS_APP_SCRIPT_FRAGMENTS.navigation}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.navigation}${TESTS_APP_SCRIPT_FRAGMENTS.navigation}${KNOWLEDGE_APP_SCRIPT_FRAGMENTS.navigation}${ASSURANCE_APP_SCRIPT_FRAGMENTS.navigation}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.navigation}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.navigation}${MARKETPLACE_APP_SCRIPT_FRAGMENTS.navigation}${API_KEYS_APP_SCRIPT_FRAGMENTS.navigation}
  ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.navigation}
  ${SECURITY_APP_SCRIPT_FRAGMENTS.navigation}
  ${EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.navigation}
  ${SECURITY_APP_SCRIPT_FRAGMENTS.setupReturnLifecycle}
          function openBatchesOverviewPage(options = {}) {
            setAccountMenuOpen(false);
            setProfileEditorOpen(false);
            setSidebarWorkspaceMode("work");
            setResourcesHeaderState({ mode: "overview", title: "" });
            const draft = options && options.draft && typeof options.draft === "object"
              ? options.draft
              : null;
            const jobId = String(options?.jobId || "").trim();
            if (draft) {
              try {
                globalThis.sessionStorage?.setItem(
                  "computer_agents_batch_draft_v1",
                  JSON.stringify(draft)
                );
              } catch (_error) {
                // The workspace also accepts a same-window custom event below.
              }
            }
            if (jobId) {
              try {
                globalThis.sessionStorage?.setItem("computer_agents_batch_open_v1", jobId);
              } catch (_error) {
                // Same-window navigation also dispatches the event below.
              }
            }
            setActivePage("batches");
            if (draft) {
              globalThis.setTimeout(() => {
                globalThis.dispatchEvent?.(new CustomEvent(
                  "computer-agents:open-batch-composer",
                  { detail: draft }
                ));
              }, 0);
            }
            if (jobId) {
              globalThis.setTimeout(() => {
                globalThis.dispatchEvent?.(new CustomEvent(
                  "computer-agents:open-batch",
                  { detail: jobId }
                ));
              }, 0);
            }
          }

          function openBatchComposer(draft = {}) {
            openBatchesOverviewPage({ draft });
          }

          if (typeof globalThis.window !== "undefined") {
            globalThis.window.computerAgentsOpenBatchComposer = openBatchComposer;
            globalThis.window.computerAgentsOpenBatch = (jobId) => {
              openBatchesOverviewPage({ jobId });
            };
          }

          function isSidebarPageAvailableForMode(mode) {
            if (activePage === "thread") {
              return true;
            }
            if (mode === "work") {
              return activePage === "tasks"
                || activePage === "files"
                || activePage === "metronome"
                || activePage === "batches"
                || activePage === "calendar";
            }
            if (mode === "admin") {
              return (activePage === "configure" && configureHomeTab === "notifications")
                || activePage === "organization"
                || activePage === "team";
            }
            if (mode === "configure") {
              return (activePage === "configure" && configureHomeTab !== "notifications")
                || activePage === "tests"
                || activePage === "knowledge"
                || activePage === "assurance"
                || activePage === "models"
                || activePage === "resource-templates"
                || activePage === "inference"
                || (isResourcesPage && (activeResourcesView === "agents" || activeResourcesView === "computers"))
                || (activePage === "tools" && (toolsView === "plugins" || toolsView === "tags" || toolsView === "skills" || toolsView === "prompts"));
            }
            return activePage === "develop"
              || activePage === "develop-webhooks"
              || activePage === "develop-api-keys"
              || activePage === "develop-security"
              || activePage === "develop-evidence-agents"
              || (isResourcesPage && activeResourcesView === "servers")
              || (activePage === "tools" && toolsView === "actions");
          }
  
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.modeNavigation}
          function handleOpenPluginsShortcut() {
            openToolsView("plugins", { forceOverview: true });
          }
  
          function handleOpenTagsShortcut() {
            openToolsView("tags", { forceOverview: true });
          }
  
          function handleOpenSkillsShortcut() {
            openToolsView("skills", { forceOverview: true });
          }

          function handleOpenPromptsShortcut() {
            openToolsView("prompts", { forceOverview: true });
          }
  
          function handleOpenActionsShortcut() {
            openToolsView("actions");
          }
  
          function handleOpenTasksShortcut() {
            setTasksProjectBackRequestToken((current) => String(latestInteractedProjectId || "").trim() ? current : current + 1);
            const lastWorkedProjectId = String(latestInteractedProjectId || "").trim();
            // Keep the existing overview reset behavior when there is no project history,
            // but reopen the last project directly when one has been used before.
            if (lastWorkedProjectId) {
              setTasksPageNavigationRequest({
                token: createPlaygroundPlatformNavigationToken(),
                projectId: lastWorkedProjectId,
                view: "overview",
                sectionId: "general",
                taskId: "",
                taskDetailMode: "default",
                missionControlAction: "",
                projectComposerAction: "",
              });
            }
            setSidebarWorkspaceMode("work");
            setActivePage("tasks");
          }
  
          function handleOpenFilesShortcut() {
            setFilesPageNavigationRequest({
              token: createPlaygroundPlatformNavigationToken(),
              environmentId: "",
              path: "",
              isFolder: true,
              contentMode: "files",
            });
            setSidebarWorkspaceMode("work");
            setActivePage("files");
          }
  
          function handleOpenResourcesShortcut() {
            openResourcesView("agents", { forceOverview: true });
          }
  
          function handleOpenEnvironmentsShortcut() {
            openResourcesView("computers", { forceOverview: true });
          }
  
          function handleOpenAgentsShortcut() {
            openResourcesView("agents", { forceOverview: true });
          }
  
          function renderAccountAvatar(className, imageClassName, fallbackLabel, photoUrl) {
            return React.createElement(AccountAvatar, {
              className,
              imageClassName,
              fallbackLabel,
              photoUrl,
            });
          }
  
          function renderSettingsDetailHeader(title, subtitle, actions) {
            return React.createElement("div", { className: "playground-environments-detail-header" },
              React.createElement("div", { className: "playground-environments-detail-header-copy" },
                React.createElement("div", { className: "playground-environments-detail-title-row" },
                  React.createElement("div", { className: "playground-environments-detail-title" }, title)
                ),
                React.createElement("div", { className: "playground-environments-detail-subtitle" }, subtitle)
              ),
              actions
                ? React.createElement("div", { className: "playground-environments-detail-actions" }, actions)
                : null
            );
          }
  
          function renderSettingsSummaryCard(title, rows, footer) {
            return React.createElement("div", { className: "playground-environments-summary-card" },
              React.createElement("div", { className: "playground-environments-summary-title" }, title),
              (rows || []).map((row, index) =>
                React.createElement("div", {
                    key: title + ":" + index,
                    className: "playground-environments-summary-row",
                  },
                    React.createElement("span", null, row.label),
                    React.createElement("span", null, row.value)
                  )
              ),
              footer || null
            );
          }
  
          function renderSettingsNote(title, body, actions, options = {}) {
            return React.createElement("div", {
                className: "playground-settings-note" + (options.isDanger ? " is-danger" : ""),
              },
                React.createElement("div", { className: "playground-settings-note-title" }, title),
                body,
                actions
                  ? React.createElement("div", { className: "playground-settings-actions" }, actions)
                  : null
              );
          }
  
          function renderSettingsBanner(type, message) {
            if (!message) {
              return null;
            }
  
            const icon = type === "error" ? AlertCircle : Check;
            return React.createElement("div", {
                className: "playground-settings-banner is-" + (type === "error" ? "error" : "success"),
              },
                React.createElement(icon, { className: "playground-settings-banner-icon", strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-settings-banner-copy" }, message)
              );
          }
  
          function renderSettingsInlineStatus(type, message) {
            if (!message) {
              return null;
            }
  
            const Icon = type === "error" ? AlertCircle : Check;
            return React.createElement("div", {
                className: "playground-settings-inline-status is-" + (type === "error" ? "error" : "success"),
              },
                React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, message)
              );
          }
  
          const handleSettingsUsageBillingSave = useCallback(async (billingPreferencesOverride = null) => {
            if (!settingsCanConfigureUsageBilling) {
              setSettingsPlatformConfigError("Upgrade to Builder to configure a metered usage limit.");
              setSettingsPlatformConfigSuccess("");
              return;
            }
  
            setSettingsPlatformConfigSaving(true);
            setSettingsPlatformConfigError("");
            setSettingsPlatformConfigSuccess("");
            try {
              const nextBillingPreferences = normalizeDemoSettingsBillingPreferences(
                billingPreferencesOverride || settingsBillingPreferences,
              );
              const nextBillingPreferencesBody = {
                ...nextBillingPreferences,
                resourceEmailAlerts: nextBillingPreferences.emailAlerts,
              };
              if (hasRealAccess) {
                const response = await fetch(proxyBackendBase + "/billing/organization/usage-controls", {
                  method: "PATCH",
                  headers: {
                    ...billingAuthRequestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    overageEnabled: nextBillingPreferencesBody.usageBillingEnabled,
                    monthlyOverageLimitUsd: nextBillingPreferencesBody.monthlyResourceSpendLimit,
                  }),
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to save the resource spend cap.");
                }
                setSettingsBillingPreferences(normalizeDemoSettingsBillingPreferences({
                  ...nextBillingPreferences,
                  usageBillingEnabled: data?.controls?.overageEnabled,
                  monthlyResourceSpendLimit: data?.controls?.monthlyOverageLimitUsd,
                }));
                setOrganizationPageBillingSummary((current) => current && typeof current === "object"
                  ? {
                      ...current,
                      plan: current.plan && typeof current.plan === "object"
                        ? {
                            ...current.plan,
                            overageEnabled: Boolean(data?.controls?.overageEnabled),
                            monthlyOverageLimitUsd: Math.max(0, Number(data?.controls?.monthlyOverageLimitUsd || 0)),
                          }
                        : current.plan,
                    }
                  : current);
              } else {
                await new Promise((resolve) => window.setTimeout(resolve, 180));
                setSettingsBillingPreferences(nextBillingPreferences);
                writeDemoSettingsPlatformConfig({
                  billing: nextBillingPreferences,
                  inference: settingsInferenceSettings,
                  inferenceEndpoints: settingsInferenceEndpoints,
                });
              }
              setSettingsPlatformConfigSuccess("");
            } catch (error) {
              setSettingsPlatformConfigError(error instanceof Error ? error.message : "Failed to save the resource spend cap.");
            } finally {
              setSettingsPlatformConfigSaving(false);
            }
          }, [billingAuthRequestHeaders, hasRealAccess, proxyBackendBase, settingsBillingPreferences, settingsCanConfigureUsageBilling, settingsInferenceEndpoints, settingsInferenceSettings]);
  
          const queueSettingsResourceCapAutosave = useCallback((nextBillingPreferences, immediate = false) => {
            setSettingsBillingPreferences(nextBillingPreferences);
            setSettingsPlatformConfigError("");
            setSettingsPlatformConfigSuccess("");
            if (settingsResourceCapAutosaveTimerRef.current) {
              window.clearTimeout(settingsResourceCapAutosaveTimerRef.current);
              settingsResourceCapAutosaveTimerRef.current = null;
            }
            const normalizedPreferences = normalizeDemoSettingsBillingPreferences(nextBillingPreferences);
            if (!settingsCanConfigureUsageBilling) {
              return;
            }
            if (immediate) {
              void handleSettingsUsageBillingSave(normalizedPreferences);
              return;
            }
            settingsResourceCapAutosaveTimerRef.current = window.setTimeout(() => {
              settingsResourceCapAutosaveTimerRef.current = null;
              void handleSettingsUsageBillingSave(normalizedPreferences);
            }, 520);
          }, [handleSettingsUsageBillingSave, settingsCanConfigureUsageBilling]);
  
