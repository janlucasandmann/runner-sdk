export const INFERENCE_APP_HANDLERS_SCRIPT = `        const persistInferenceEndpointCollection = useCallback((collectionValue, preferredEndpointId = "") => {
          const collection = normalizeDemoInferenceEndpointCollection(collectionValue);
          const preferredEndpoint = getDemoInferenceEndpoint(collection, preferredEndpointId);
          const selectedEndpoint = preferredEndpoint || getDefaultDemoInferenceEndpoint(collection);
          setSettingsInferenceEndpoints(collection);
          setSettingsInferenceSettings(selectedEndpoint);
          writeDemoSettingsPlatformConfig({
            billing: settingsBillingPreferences,
            inference: getDefaultDemoInferenceEndpoint(collection),
            inferenceEndpoints: collection,
          });
          return { collection, selectedEndpoint };
        }, [settingsBillingPreferences]);

        const handleSettingsInferenceCreateEndpoint = useCallback(async (endpointInputValue = null) => {
          if (!settingsCanConfigureBusinessFeatures) {
            setSettingsPlatformConfigError("Upgrade to Team to configure inference.");
            setSettingsPlatformConfigSuccess("");
            return false;
          }

          const endpointInput = endpointInputValue && typeof endpointInputValue === "object"
            ? endpointInputValue
            : {};
          const endpointName = String(endpointInput.name || "New Inference Endpoint")
            .replace(/\\s+/g, " ")
            .trim()
            .slice(0, 120) || "New Inference Endpoint";
          const providerType = String(
            endpointInput.providerType || SETTINGS_DEFAULT_INFERENCE_SETTINGS.providerType
          ).trim() || SETTINGS_DEFAULT_INFERENCE_SETTINGS.providerType;
          const baseUrl = String(endpointInput.baseUrl || "").trim().replace(/\\/+$/, "");
          const apiKey = String(endpointInput.apiKey || "").trim();
          const isDefault = settingsInferenceEndpoints.endpoints.length === 0
            || Boolean(endpointInput.isDefault);

          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          try {
            let collection;
            let createdEndpoint;
            if (hasRealAccess) {
              const response = await fetch(proxyBackendBase + "/inference/endpoints", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  endpoint: {
                    name: endpointName,
                    providerType,
                    baseUrl,
                    apiKey: apiKey || undefined,
                    enabled: false,
                    isDefault,
                  },
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create inference endpoint.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
              createdEndpoint = normalizeDemoInferenceEndpoint(data?.endpoint);
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 120));
              const endpointId = "inference_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
              createdEndpoint = normalizeDemoInferenceEndpoint({
                ...SETTINGS_DEFAULT_INFERENCE_SETTINGS,
                id: endpointId,
                name: endpointName,
                providerType,
                baseUrl,
                apiKeyConfigured: Boolean(apiKey),
                apiKeyPreview: buildDemoInferenceApiKeyPreview(apiKey),
                isDefault,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, createdEndpoint);
            }
            const persisted = persistInferenceEndpointCollection(collection, createdEndpoint.id);
            setSettingsInferenceSelectedEndpointId(createdEndpoint.id);
            setSettingsInferenceSettings(
              getDemoInferenceEndpoint(persisted.collection, createdEndpoint.id) || createdEndpoint
            );
            setSettingsInferenceApiKeyInput("");
            setSettingsInferenceApiKeyEditing(false);
            setSettingsClearInferenceApiKey(false);
            setSettingsInferenceModelInput("");
            return true;
          } catch (error) {
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Failed to create inference endpoint.");
            return false;
          } finally {
            setSettingsPlatformConfigSaving(false);
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          settingsCanConfigureBusinessFeatures,
          settingsInferenceEndpoints,
        ]);

        const handleSettingsInferenceSave = useCallback(async (inferenceSettingsOverride = null, options = null) => {
          if (!settingsCanConfigureBusinessFeatures) {
            setSettingsPlatformConfigError("Upgrade to Team to configure inference.");
            setSettingsPlatformConfigSuccess("");
            return;
          }
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:")) {
            return;
          }

          const saveOptions = options && typeof options === "object" ? options : {};
          const sourceInferenceSettings = normalizeDemoInferenceEndpoint(
            inferenceSettingsOverride || settingsInferenceSettings
          );
          const apiKeyInputValue = typeof saveOptions.apiKeyInputOverride === "string"
            ? saveOptions.apiKeyInputOverride
            : settingsInferenceApiKeyInput;
          const clearApiKey = typeof saveOptions.clearApiKeyOverride === "boolean"
            ? saveOptions.clearApiKeyOverride
            : settingsClearInferenceApiKey;
          const normalizedApiKeyInput = String(apiKeyInputValue || "").trim();
          const trimmedBaseUrl = String(sourceInferenceSettings.baseUrl || "").trim();
          const nextInferenceSettings = normalizeDemoInferenceEndpoint({
            ...sourceInferenceSettings,
            id: endpointId,
            enabled: Boolean(trimmedBaseUrl),
            baseUrl: trimmedBaseUrl,
            defaultModel: "",
            availableModels: mergeDemoInferenceModelLists(sourceInferenceSettings.availableModels),
            apiKeyConfigured: clearApiKey
              ? false
              : (sourceInferenceSettings.apiKeyConfigured || Boolean(normalizedApiKeyInput)),
            apiKeyPreview: clearApiKey
              ? ""
              : (normalizedApiKeyInput
                  ? buildDemoInferenceApiKeyPreview(normalizedApiKeyInput)
                  : sourceInferenceSettings.apiKeyPreview),
            lastError: sourceInferenceSettings.healthStatus === "error"
              ? sourceInferenceSettings.lastError
              : "",
            updatedAt: new Date().toISOString(),
          });

          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          try {
            let collection;
            if (hasRealAccess) {
              const response = await fetch(
                proxyBackendBase + "/inference/endpoints/" + encodeURIComponent(endpointId),
                {
                  method: "PATCH",
                  headers: {
                    ...authRequestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    endpoint: {
                      name: nextInferenceSettings.name,
                      enabled: nextInferenceSettings.enabled,
                      providerType: nextInferenceSettings.providerType,
                      baseUrl: nextInferenceSettings.baseUrl,
                      defaultModel: "",
                      availableModels: nextInferenceSettings.availableModels,
                      apiKey: normalizedApiKeyInput || undefined,
                      clearApiKey,
                      lastValidatedAt: nextInferenceSettings.lastValidatedAt || null,
                      healthStatus: nextInferenceSettings.healthStatus,
                      lastError: nextInferenceSettings.lastError,
                      isDefault: nextInferenceSettings.isDefault,
                    },
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save inference endpoint.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 120));
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, nextInferenceSettings);
            }
            persistInferenceEndpointCollection(collection, endpointId);
            if (clearApiKey || normalizedApiKeyInput) {
              setSettingsInferenceApiKeyInput("");
              setSettingsInferenceApiKeyEditing(false);
            }
            if (clearApiKey) setSettingsClearInferenceApiKey(false);
          } catch (error) {
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Failed to save inference endpoint.");
          } finally {
            setSettingsPlatformConfigSaving(false);
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          settingsCanConfigureBusinessFeatures,
          settingsClearInferenceApiKey,
          settingsInferenceApiKeyInput,
          settingsInferenceEndpoints,
          settingsInferenceSelectedEndpointId,
          settingsInferenceSettings,
        ]);

        const queueSettingsInferenceAutosave = useCallback((nextInferenceSettings, options = {}) => {
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          if (settingsInferenceAutosaveTimerRef.current) {
            window.clearTimeout(settingsInferenceAutosaveTimerRef.current);
            settingsInferenceAutosaveTimerRef.current = null;
          }
          const normalizedInferenceSettings = normalizeDemoInferenceEndpoint(nextInferenceSettings);
          if (!settingsCanConfigureBusinessFeatures) return;
          if (options.immediate) {
            void handleSettingsInferenceSave(normalizedInferenceSettings, options);
            return;
          }
          settingsInferenceAutosaveTimerRef.current = window.setTimeout(() => {
            settingsInferenceAutosaveTimerRef.current = null;
            void handleSettingsInferenceSave(normalizedInferenceSettings, options);
          }, 520);
        }, [handleSettingsInferenceSave, settingsCanConfigureBusinessFeatures]);

        const handleSettingsInferenceConnectionTest = useCallback(async () => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!settingsCanConfigureBusinessFeatures) {
            setSettingsPlatformConfigError("Upgrade to Team to configure inference.");
            setSettingsPlatformConfigSuccess("");
            return;
          }
          const trimmedBaseUrl = String(settingsInferenceSettings.baseUrl || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:") || !trimmedBaseUrl) {
            setSettingsPlatformConfigError("Enter an endpoint URL before testing the connection.");
            setSettingsPlatformConfigSuccess("");
            return;
          }
          try {
            new URL(trimmedBaseUrl);
          } catch {
            setSettingsPlatformConfigError("Enter a valid inference endpoint URL.");
            setSettingsPlatformConfigSuccess("");
            return;
          }

          setSettingsPlatformConfigTesting(true);
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          if (settingsInferenceAutosaveTimerRef.current) {
            window.clearTimeout(settingsInferenceAutosaveTimerRef.current);
            settingsInferenceAutosaveTimerRef.current = null;
          }
          try {
            let collection;
            let availableModels = [];
            let checkedAt = new Date().toISOString();
            if (hasRealAccess) {
              const response = await fetch(
                proxyBackendBase + "/inference/endpoints/" + encodeURIComponent(endpointId) + "/test",
                {
                  method: "POST",
                  headers: {
                    ...authRequestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    endpoint: {
                      name: settingsInferenceSettings.name,
                      providerType: settingsInferenceSettings.providerType,
                      baseUrl: trimmedBaseUrl,
                      defaultModel: settingsInferenceSettings.defaultModel,
                      availableModels: settingsInferenceSettings.availableModels,
                      apiKey: settingsInferenceApiKeyInput.trim() || undefined,
                      isDefault: settingsInferenceSettings.isDefault,
                    },
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Connection test failed.");
              }
              availableModels = Array.isArray(data?.availableModels) ? data.availableModels : [];
              checkedAt = typeof data?.checkedAt === "string" && data.checkedAt ? data.checkedAt : checkedAt;
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 320));
              availableModels = buildDemoInferenceModelOptions(
                settingsInferenceSettings.providerType,
                settingsInferenceSettings.defaultModel
              );
              const nextEndpoint = normalizeDemoInferenceEndpoint({
                ...settingsInferenceSettings,
                enabled: true,
                availableModels: mergeDemoInferenceModelLists(
                  settingsInferenceSettings.availableModels,
                  availableModels,
                ),
                apiKeyConfigured: settingsClearInferenceApiKey
                  ? Boolean(settingsInferenceApiKeyInput.trim())
                  : (settingsInferenceSettings.apiKeyConfigured || Boolean(settingsInferenceApiKeyInput.trim())),
                apiKeyPreview: settingsInferenceApiKeyInput.trim()
                  ? buildDemoInferenceApiKeyPreview(settingsInferenceApiKeyInput)
                  : settingsInferenceSettings.apiKeyPreview,
                healthStatus: "healthy",
                lastValidatedAt: checkedAt,
                lastError: "",
              });
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, nextEndpoint);
            }
            persistInferenceEndpointCollection(collection, endpointId);
            setSettingsInferenceApiKeyInput("");
            setSettingsInferenceApiKeyEditing(false);
            setSettingsClearInferenceApiKey(false);
            setSettingsPlatformConfigSuccess(
              availableModels.length > 0
                ? "Inference endpoint connected successfully. Discovered models were added."
                : "Inference endpoint connected successfully."
            );
          } catch (error) {
            const failedEndpoint = normalizeDemoInferenceEndpoint({
              ...settingsInferenceSettings,
              healthStatus: "error",
              lastError: error instanceof Error ? error.message : "Connection test failed.",
            });
            const collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, failedEndpoint);
            persistInferenceEndpointCollection(collection, endpointId);
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Connection test failed.");
          } finally {
            setSettingsPlatformConfigTesting(false);
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          settingsCanConfigureBusinessFeatures,
          settingsClearInferenceApiKey,
          settingsInferenceApiKeyInput,
          settingsInferenceEndpoints,
          settingsInferenceSelectedEndpointId,
          settingsInferenceSettings,
        ]);

        const handleSettingsInferenceAddModels = useCallback((rawValue) => {
          const nextModels = parseDemoInferenceModelInput(rawValue);
          if (nextModels.length === 0) return false;
          const nextInferenceSettings = normalizeDemoInferenceEndpoint({
            ...settingsInferenceSettings,
            availableModels: mergeDemoInferenceModelLists(
              settingsInferenceSettings.availableModels,
              nextModels,
            ),
          });
          setSettingsInferenceSettings(nextInferenceSettings);
          setSettingsInferenceModelInput("");
          queueSettingsInferenceAutosave(nextInferenceSettings, { immediate: true });
          return true;
        }, [queueSettingsInferenceAutosave, settingsInferenceSettings]);

        const handleSettingsInferenceRemoveModel = useCallback((modelId) => {
          const normalizedModelId = String(modelId || "").trim();
          if (!normalizedModelId) return;
          const nextInferenceSettings = normalizeDemoInferenceEndpoint({
            ...settingsInferenceSettings,
            availableModels: settingsInferenceSettings.availableModels.filter(
              (entry) => entry !== normalizedModelId
            ),
          });
          setSettingsInferenceSettings(nextInferenceSettings);
          queueSettingsInferenceAutosave(nextInferenceSettings, { immediate: true });
        }, [queueSettingsInferenceAutosave, settingsInferenceSettings]);

        const handleSettingsInferenceRemoveEndpoint = useCallback(async () => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:")) return;
          if (settingsInferenceAutosaveTimerRef.current) {
            window.clearTimeout(settingsInferenceAutosaveTimerRef.current);
            settingsInferenceAutosaveTimerRef.current = null;
          }
          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
          try {
            let collection;
            if (hasRealAccess) {
              const response = await fetch(
                proxyBackendBase + "/inference/endpoints/" + encodeURIComponent(endpointId),
                {
                  method: "DELETE",
                  headers: authRequestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to remove inference endpoint.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 120));
              collection = removeDemoInferenceEndpoint(settingsInferenceEndpoints, endpointId);
            }
            persistInferenceEndpointCollection(collection);
            setSettingsInferenceApiKeyInput("");
            setSettingsInferenceApiKeyEditing(false);
            setSettingsClearInferenceApiKey(false);
            setSettingsInferenceSelectedEndpointId("");
          } catch (error) {
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Failed to remove inference endpoint.");
          } finally {
            setSettingsPlatformConfigSaving(false);
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          settingsInferenceEndpoints,
          settingsInferenceSelectedEndpointId,
        ]);
`;
