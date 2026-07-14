export const INFERENCE_PAGE_VIEW_SCRIPT = `                return React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-settings-plans-navbar" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                      React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                        React.createElement("div", { className: "playground-settings-plans-title" }, "Inference")
                      )
                    ),
                    React.createElement("div", { className: "playground-content-nav-center" }),
                    React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" })
                  ),
                  React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                    !settingsCanConfigureBusinessFeatures
                      ? React.createElement("div", { className: "playground-settings-plan-app-shell" },
                          renderSettingsBanner("error", settingsPlatformConfigError),
                          renderSettingsBanner("success", settingsPlatformConfigSuccess),
                          React.createElement("section", { className: "playground-settings-plans-budget-card playground-computer-details-card playground-settings-inference-endpoint-card" },
                            React.createElement("div", { className: "playground-settings-inference-endpoint-copy" },
                              React.createElement("div", { className: "playground-settings-card-title" }, "Inference Endpoint"),
                              React.createElement("div", { className: "playground-settings-card-copy" }, "Connect your own OpenAI-compatible endpoint for self-hosted or customer-managed models.")
                            ),
                            React.createElement("div", {
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                color: "rgba(255,255,255,0.68)",
                              },
                            },
                              React.createElement("div", null, "Inference endpoints are available on Team, Business, and Enterprise."),
                              React.createElement("div", null, "Use them to route model traffic to your own OpenAI-compatible infrastructure instead of managed model billing.")
                            ),
                            React.createElement("div", { className: "playground-settings-actions" },
                              React.createElement(PlatformPrimaryButton, {
                                size: "large",
                                type: "button",
                                className: "playground-settings-app-primary-button",
                                onClick: () => {
                                  void handleSettingsSubscribe("team");
                                },
                                disabled: settingsCheckoutLoading,
                              }, settingsCheckoutLoading ? "Loading..." : "Upgrade to Team")
                            )
                          ),
                          settingsRuntimeSection,
                          settingsLocalRunnersSection
                        )
                      : React.createElement("div", { className: "playground-settings-plan-app-shell" },
                          renderSettingsBanner("error", settingsPlatformConfigError),
                          renderSettingsBanner("success", settingsPlatformConfigSuccess),
                          React.createElement("section", { className: "playground-settings-plans-budget-card playground-computer-details-card playground-settings-inference-endpoint-card" },
                            React.createElement("div", { className: "playground-settings-inference-endpoint-copy" },
                              React.createElement("div", { className: "playground-settings-card-title" }, "Inference Endpoint"),
                              React.createElement("div", { className: "playground-settings-card-copy" }, "Store one shared endpoint for your workspace. Agents can route compatible workloads there once you connect it.")
                            ),
                            React.createElement("div", { className: "playground-settings-form-grid" },
                              React.createElement("div", { className: "playground-settings-field" },
                                React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-inference-provider" }, "Provider"),
                                React.createElement("select", {
                                  id: "settings-inference-provider",
                                  className: "playground-settings-select",
                                  value: settingsInferenceSettings.providerType,
                                  onChange: (event) => {
                                    const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
                                      ...settingsInferenceSettings,
                                      providerType: event.target.value,
                                      healthStatus: "idle",
                                      lastValidatedAt: "",
                                      lastError: "",
                                    });
                                    setSettingsInferenceSettings(nextInferenceSettings);
                                    queueSettingsInferenceAutosave(nextInferenceSettings);
                                  },
                                },
                                  SETTINGS_INFERENCE_PROVIDER_OPTIONS.map((option) =>
                                    React.createElement("option", { key: option.value, value: option.value }, option.label)
                                  )
                                )
                              ),
                              React.createElement("div", { className: "playground-settings-field" },
                                React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-inference-base-url" }, "Endpoint URL"),
                                React.createElement("input", {
                                  id: "settings-inference-base-url",
                                  type: "url",
                                  className: "playground-settings-input",
                                  value: settingsInferenceSettings.baseUrl,
                                  onChange: (event) => {
                                    const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
                                      ...settingsInferenceSettings,
                                      baseUrl: event.target.value,
                                      healthStatus: "idle",
                                      lastValidatedAt: "",
                                      lastError: "",
                                    });
                                    setSettingsInferenceSettings(nextInferenceSettings);
                                    queueSettingsInferenceAutosave(nextInferenceSettings);
                                  },
                                  placeholder: "https://models.example.com/v1",
                                })
                              ),
                              React.createElement("div", { className: "playground-settings-field playground-settings-field-span-2" },
                                React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-inference-api-key" }, "API Key"),
                                React.createElement("div", {
                                  className: "playground-settings-model-entry-row",
                                  style: { alignItems: "stretch" },
                                },
                                  React.createElement("input", {
                                    id: "settings-inference-api-key",
                                    type: "text",
                                    className: "playground-settings-input",
                                    value: inferenceApiKeyDisplayValue,
                                    onFocus: () => {
                                      if (inferenceShowingSavedApiKeyPreview) {
                                        setSettingsInferenceApiKeyEditing(true);
                                        setSettingsInferenceApiKeyInput("");
                                      }
                                    },
                                    onBlur: () => {
                                      if (!settingsInferenceApiKeyInput.trim()) {
                                        setSettingsInferenceApiKeyEditing(false);
                                      } else {
                                        queueSettingsInferenceAutosave(settingsInferenceSettings, {
                                          immediate: true,
                                          apiKeyInputOverride: settingsInferenceApiKeyInput,
                                          clearApiKeyOverride: false,
                                        });
                                      }
                                    },
                                    onChange: (event) => {
                                      const nextValue = event.target.value;
                                      setSettingsInferenceApiKeyEditing(true);
                                      setSettingsInferenceApiKeyInput(nextValue);
                                      setSettingsClearInferenceApiKey(false);
                                      queueSettingsInferenceAutosave(settingsInferenceSettings, {
                                        apiKeyInputOverride: nextValue,
                                        clearApiKeyOverride: false,
                                      });
                                    },
                                    placeholder: "sk-...",
                                  }),
                                  settingsInferenceSettings.apiKeyConfigured && !settingsClearInferenceApiKey
                                    ? React.createElement(PlatformSecondaryButton, {
                                      size: "large",
                                        type: "button",
                                        className: "playground-settings-app-secondary-button",
                                        onClick: () => {
                                          setSettingsInferenceApiKeyEditing(false);
                                          setSettingsInferenceApiKeyInput("");
                                          setSettingsClearInferenceApiKey(true);
                                          queueSettingsInferenceAutosave(settingsInferenceSettings, {
                                            immediate: true,
                                            apiKeyInputOverride: "",
                                            clearApiKeyOverride: true,
                                          });
                                        },
                                      }, "Remove Saved Key")
                                    : null
                                )
                              ),
                              React.createElement("div", { className: "playground-settings-field playground-settings-field-span-2" },
                                React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-inference-model-list-input" }, "Models"),
                                React.createElement("div", { className: "playground-settings-card-copy" },
                                  "Add one or more model ids for this workspace. You can paste multiple names separated by commas or new lines."
                                ),
                                React.createElement("div", { className: "playground-settings-model-entry-row" },
                                  React.createElement("input", {
                                    id: "settings-inference-model-list-input",
                                    type: "text",
                                    className: "playground-settings-input",
                                    value: settingsInferenceModelInput,
                                    onChange: (event) => setSettingsInferenceModelInput(event.target.value),
                                    onKeyDown: (event) => {
                                      if (event.key === "Enter" || event.key === ",") {
                                        event.preventDefault();
                                        handleSettingsInferenceAddModels(settingsInferenceModelInput);
                                      }
                                    },
                                    placeholder: "gpt-5.4-mini, gpt-4.1-mini",
                                  }),
                                  React.createElement(PlatformSecondaryButton, {
                                    size: "large",
                                    type: "button",
                                    className: "playground-settings-app-secondary-button",
                                    onClick: () => {
                                      handleSettingsInferenceAddModels(settingsInferenceModelInput);
                                    },
                                  }, "Add Model")
                                ),
                                settingsInferenceSettings.availableModels.length > 0
                                  ? React.createElement("div", { className: "playground-tasks-skills-list" },
                                      settingsInferenceSettings.availableModels.map((modelId) =>
                                        React.createElement("div", {
                                          key: modelId,
                                          className: "playground-tasks-skill-pill",
                                          title: modelId,
                                        },
                                          React.createElement("span", { className: "playground-tasks-skill-pill-label" }, modelId),
                                          React.createElement("button", {
                                            type: "button",
                                            className: "playground-tasks-skill-pill-remove",
                                            onClick: (event) => {
                                              event.stopPropagation();
                                              handleSettingsInferenceRemoveModel(modelId);
                                            },
                                            "aria-label": "Remove " + modelId,
                                            title: "Remove " + modelId,
                                          }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.9 }))
                                        )
                                      )
                                    )
                                  : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No models added yet.")
                              )
                            ),
                            showRemoveInferenceButton
                              ? React.createElement("div", { className: "playground-settings-actions", style: { justifyContent: "flex-end" } },
                                  React.createElement(PlatformSecondaryButton, {
                                    size: "large",
                                    type: "button",
                                    className: "playground-settings-app-secondary-button",
                                    onClick: () => {
                                      const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
                                        ...SETTINGS_DEFAULT_INFERENCE_SETTINGS,
                                        providerType: settingsInferenceSettings.providerType,
                                      });
                                      setSettingsInferenceSettings(nextInferenceSettings);
                                      setSettingsInferenceApiKeyInput("");
                                      setSettingsInferenceApiKeyEditing(false);
                                      setSettingsClearInferenceApiKey(true);
                                      setSettingsInferenceModelInput("");
                                      queueSettingsInferenceAutosave(nextInferenceSettings, {
                                        immediate: true,
                                        apiKeyInputOverride: "",
                                        clearApiKeyOverride: true,
                                      });
                                    },
                                    disabled: settingsPlatformConfigSaving,
                                  }, settingsPlatformConfigSaving ? "Removing..." : "Remove Inference")
                                )
                              : null
                          ),
                          settingsRuntimeSection,
                          settingsLocalRunnersSection,
                          React.createElement("div", {
                            className: "playground-settings-detail-stack",
                            style: { marginTop: "4px" },
                          },
                            React.createElement("section", { className: "playground-settings-plans-resource-cap-section" },
                              React.createElement("div", { className: "playground-settings-plans-resource-cap-heading" }, "Health & Routing"),
                              React.createElement("div", { className: "playground-tasks-detail-facts playground-settings-plans-resource-cap-facts" },
                                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Connection Status"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control playground-settings-inference-status-value" }, inferenceStatusLabel)
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Last Checked"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control playground-settings-inference-status-value" }, inferenceLastCheckedLabel)
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Routing"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control playground-settings-inference-status-value" }, inferenceRoutingLabel)
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Provider"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control playground-settings-inference-status-value" }, inferenceProviderLabel)
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Configured Models"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control playground-settings-inference-status-value" }, settingsInferenceSettings.availableModels.length > 0 ? String(settingsInferenceSettings.availableModels.length) : "None")
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "API Key"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control playground-settings-inference-status-value" }, inferenceApiKeyLabel)
                                  )
                                )
                              ),
                              settingsInferenceSettings.healthStatus === "error" && settingsInferenceSettings.lastError
                                ? React.createElement("div", { className: "playground-settings-muted-copy" }, settingsInferenceSettings.lastError)
                                : null
                            )
                          )
                        )
                  )
                );
              })();
              break;
`;

