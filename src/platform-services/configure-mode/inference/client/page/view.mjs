export const INFERENCE_PAGE_VIEW_SCRIPT = `                const updateInferenceEndpointSettings = (patch) => {
                  const nextInferenceSettings = normalizeDemoInferenceEndpoint({
                    ...settingsInferenceSettings,
                    ...(patch && typeof patch === "object" ? patch : {}),
                  });
                  setSettingsInferenceSettings(nextInferenceSettings);
                };
                const selectedInferenceEndpoint = getDemoInferenceEndpoint(
                  settingsInferenceEndpoints,
                  settingsInferenceSelectedEndpointId
                );
                const selectedInferenceVersionId = String(
                  settingsInferenceSelectedVersionId
                  || selectedInferenceEndpoint?.currentVersionId
                  || ""
                ).trim();
                const selectedInferenceVersion = getDemoInferenceEndpointVersion(
                  selectedInferenceEndpoint,
                  selectedInferenceVersionId
                );
                const inferenceVersionDirty = Boolean(
                  selectedInferenceEndpoint
                  && selectedInferenceVersion
                  && (
                    !areDemoInferenceVersionSnapshotsEqual(
                      settingsInferenceSettings,
                      selectedInferenceVersion.snapshot
                    )
                    || settingsInferenceApiKeyInput.trim()
                    || settingsClearInferenceApiKey
                  )
                );

                return settingsInferenceSelectedEndpointId
                  ? React.createElement(InferenceEndpointDetailPage, {
                      endpointId: settingsInferenceSelectedEndpointId,
                      endpoints: settingsInferenceEndpoints,
                      settings: settingsInferenceSettings,
                      localRunners: settingsLocalRunnersState,
                      deploymentProfile: platformDeploymentProfile,
                      activeTab: settingsInferenceDetailTab,
                      usageThreads: realThreads,
                      usageAgents: runtimeAgents,
                      analyticsLoading: isThreadsLoading,
                      analyticsTimeframe: settingsInferenceAnalyticsTimeframe,
                      onAnalyticsTimeframeChange: setSettingsInferenceAnalyticsTimeframe,
                      currentUser: {
                        id: hasSessionAuth ? (sessionState.userId || accountEmail || "") : "demo-user",
                        userId: hasSessionAuth ? (sessionState.userId || "") : "demo-user",
                        name: hasSessionAuth ? accountName : "Demo User",
                        email: hasSessionAuth ? accountEmail : "",
                        avatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                      },
                      canConfigure: settingsCanConfigureBusinessFeatures,
                      saving: settingsPlatformConfigSaving,
                      testing: settingsPlatformConfigTesting,
                      error: settingsPlatformConfigError,
                      success: settingsPlatformConfigSuccess,
                      apiKeyValue: inferenceApiKeyDisplayValue,
                      apiKeyConfigured: settingsInferenceSettings.apiKeyConfigured && !settingsClearInferenceApiKey,
                      selectedVersionId: selectedInferenceVersionId,
                      versionsOpen: settingsInferenceVersionsOpen,
                      versionSaveDialog: settingsInferenceVersionSaveDialog,
                      dirty: inferenceVersionDirty,
                      onNavigationGuardChange: registerPlatformNavigationGuard,
                      onVersionHistoryOpenChange: setSettingsInferenceVersionsOpen,
                      onVersionSelect: handleSettingsInferenceSelectVersion,
                      onVersionPublish: handleSettingsInferencePublishVersion,
                      onOpenSaveDialog: openSettingsInferenceSaveDialog,
                      onCloseSaveDialog: () => setSettingsInferenceVersionSaveDialog((current) => ({
                        ...current,
                        open: false,
                        error: "",
                      })),
                      onSaveVersion: handleSettingsInferenceSave,
                      onRevertChanges: handleSettingsInferenceRevertChanges,
                      onBack: () => openInferencePage(),
                      onSettingsChange: updateInferenceEndpointSettings,
                      onApiKeyFocus: () => {
                        if (inferenceShowingSavedApiKeyPreview) {
                          setSettingsInferenceApiKeyEditing(true);
                          setSettingsInferenceApiKeyInput("");
                        }
                      },
                      onApiKeyBlur: () => {
                        if (!settingsInferenceApiKeyInput.trim()) {
                          setSettingsInferenceApiKeyEditing(false);
                        }
                      },
                      onApiKeyChange: (value) => {
                        setSettingsInferenceApiKeyEditing(true);
                        setSettingsInferenceApiKeyInput(value);
                        setSettingsClearInferenceApiKey(false);
                      },
                      onRemoveSavedApiKey: () => {
                        setSettingsInferenceApiKeyEditing(false);
                        setSettingsInferenceApiKeyInput("");
                        setSettingsClearInferenceApiKey(true);
                      },
                      onAddModels: handleSettingsInferenceAddModels,
                      onRemoveModel: handleSettingsInferenceRemoveModel,
                      onTestConnection: handleSettingsInferenceConnectionTest,
                      onRemoveEndpoint: handleSettingsInferenceRemoveEndpoint,
                      onOwnerCandidatesRequest: handleSettingsInferenceOwnerCandidatesRequest,
                      onOwnerTransfer: handleSettingsInferenceOwnerTransfer,
                      workspaceTeams: teamPageTeams,
                      workspaceTeamsLoading: teamPageLoading,
                      onWorkspaceTeamsRequest: () => {
                        if (
                          !teamPageLoading
                          && !teamPageRequiresPlan
                          && (!Array.isArray(teamPageTeams) || teamPageTeams.length === 0)
                        ) {
                          void loadTeamPageData({ selectedTeamId: "" });
                        }
                      },
                      onAccessMetadataChange: handleSettingsInferenceAccessMetadataChange,
                      onAddTeamShare: handleSettingsInferenceTeamShareCreate,
                      onRemoveTeamShare: handleSettingsInferenceTeamShareRemove,
                    })
                  : React.createElement(InferenceOverviewPage, {
                      endpoints: settingsInferenceEndpoints,
                      localRunners: settingsLocalRunnersState,
                      deploymentProfile: platformDeploymentProfile,
                      controlsPortalId: "playground-inference-overview-controls",
                      canConfigure: settingsCanConfigureBusinessFeatures,
                      onPlanRequired: requestInferencePlanGate,
                      creatingEndpoint: settingsPlatformConfigSaving,
                      createError: settingsPlatformConfigError,
                      onOpenEndpoint: (endpointId) => openInferencePage(endpointId),
                      onConfigureEndpoint: handleSettingsInferenceCreateEndpoint,
                    });
              })();
              break;
`;
