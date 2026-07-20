export const INFERENCE_PAGE_VIEW_SCRIPT = `                const inferenceRuntimeContent = React.createElement(
                  React.Fragment,
                  null,
                  settingsRuntimeSection,
                  settingsLocalRunnersSection
                );
                const updateInferenceEndpointSettings = (patch) => {
                  const nextInferenceSettings = normalizeDemoInferenceEndpoint({
                    ...settingsInferenceSettings,
                    ...(patch && typeof patch === "object" ? patch : {}),
                  });
                  setSettingsInferenceSettings(nextInferenceSettings);
                  setSettingsInferenceEndpoints((current) =>
                    upsertDemoInferenceEndpoint(current, nextInferenceSettings)
                  );
                  queueSettingsInferenceAutosave(nextInferenceSettings);
                };

                return settingsInferenceSelectedEndpointId
                  ? React.createElement(InferenceEndpointDetailPage, {
                      endpointId: settingsInferenceSelectedEndpointId,
                      endpoints: settingsInferenceEndpoints,
                      settings: settingsInferenceSettings,
                      localRunners: settingsLocalRunnersState,
                      canConfigure: settingsCanConfigureBusinessFeatures,
                      saving: settingsPlatformConfigSaving,
                      testing: settingsPlatformConfigTesting,
                      error: settingsPlatformConfigError,
                      success: settingsPlatformConfigSuccess,
                      apiKeyValue: inferenceApiKeyDisplayValue,
                      apiKeyConfigured: settingsInferenceSettings.apiKeyConfigured && !settingsClearInferenceApiKey,
                      runtimeContent: inferenceRuntimeContent,
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
                          return;
                        }
                        queueSettingsInferenceAutosave(settingsInferenceSettings, {
                          immediate: true,
                          apiKeyInputOverride: settingsInferenceApiKeyInput,
                          clearApiKeyOverride: false,
                        });
                      },
                      onApiKeyChange: (value) => {
                        setSettingsInferenceApiKeyEditing(true);
                        setSettingsInferenceApiKeyInput(value);
                        setSettingsClearInferenceApiKey(false);
                        queueSettingsInferenceAutosave(settingsInferenceSettings, {
                          apiKeyInputOverride: value,
                          clearApiKeyOverride: false,
                        });
                      },
                      onRemoveSavedApiKey: () => {
                        setSettingsInferenceApiKeyEditing(false);
                        setSettingsInferenceApiKeyInput("");
                        setSettingsClearInferenceApiKey(true);
                        queueSettingsInferenceAutosave(settingsInferenceSettings, {
                          immediate: true,
                          apiKeyInputOverride: "",
                          clearApiKeyOverride: true,
                        });
                      },
                      onAddModels: handleSettingsInferenceAddModels,
                      onRemoveModel: handleSettingsInferenceRemoveModel,
                      onTestConnection: handleSettingsInferenceConnectionTest,
                      onRemoveEndpoint: handleSettingsInferenceRemoveEndpoint,
                      onRefreshLocalRunners: () => {
                        setSettingsLocalRunnersReloadToken((current) => current + 1);
                      },
                      onUpgrade: () => {
                        void handleSettingsSubscribe("team");
                      },
                    })
                  : React.createElement(InferenceOverviewPage, {
                      endpoints: settingsInferenceEndpoints,
                      localRunners: settingsLocalRunnersState,
                      controlsPortalId: "playground-inference-overview-controls",
                      canConfigure: settingsCanConfigureBusinessFeatures,
                      creatingEndpoint: settingsPlatformConfigSaving,
                      createError: settingsPlatformConfigError,
                      onOpenEndpoint: (endpointId) => openInferencePage(endpointId),
                      onConfigureEndpoint: handleSettingsInferenceCreateEndpoint,
                    });
              })();
              break;
`;
