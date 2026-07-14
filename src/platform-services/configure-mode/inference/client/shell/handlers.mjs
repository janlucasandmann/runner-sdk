export const INFERENCE_APP_HANDLERS_SCRIPT = `        const handleSettingsInferenceConnectionTest = useCallback(async () => {
          if (!settingsCanConfigureBusinessFeatures) {
            setSettingsPlatformConfigError("Upgrade to Team to configure inference.");
            setSettingsPlatformConfigSuccess("");
            return;
          }

          const trimmedBaseUrl = String(settingsInferenceSettings.baseUrl || "").trim();
          if (!trimmedBaseUrl) {
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
          try {
            let availableModels = [];
            let checkedAt = new Date().toISOString();
            if (hasRealAccess) {
              const response = await fetch(proxyBackendBase + "/billing/inference/test", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  inference: {
                    providerType: settingsInferenceSettings.providerType,
                    baseUrl: trimmedBaseUrl,
                    apiKey: settingsInferenceApiKeyInput.trim() || undefined,
                  },
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Connection test failed.");
              }
              availableModels = Array.isArray(data?.availableModels) ? data.availableModels : [];
              checkedAt = typeof data?.checkedAt === "string" && data.checkedAt ? data.checkedAt : checkedAt;
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 320));
              availableModels = buildDemoInferenceModelOptions(
                settingsInferenceSettings.providerType,
                settingsInferenceSettings.defaultModel
              );
            }
            const normalizedDiscoveredModels = mergeDemoInferenceModelLists(
              availableModels,
              settingsInferenceSettings.defaultModel ? [settingsInferenceSettings.defaultModel] : []
            );
            setSettingsInferenceSettings((current) => ({
              ...current,
              availableModels: mergeDemoInferenceModelLists(current.availableModels, normalizedDiscoveredModels),
              apiKeyConfigured: settingsClearInferenceApiKey
                ? Boolean(settingsInferenceApiKeyInput.trim())
                : (current.apiKeyConfigured || Boolean(settingsInferenceApiKeyInput.trim())),
              healthStatus: "healthy",
              lastValidatedAt: checkedAt,
              lastError: "",
            }));
            setSettingsPlatformConfigSuccess(
              normalizedDiscoveredModels.length > 0
                ? "Inference endpoint connected successfully. Discovered models were added to your list."
                : "Inference endpoint connected successfully."
            );
          } catch (error) {
            setSettingsInferenceSettings((current) => ({
              ...current,
              healthStatus: "error",
              lastError: error instanceof Error ? error.message : "Connection test failed.",
            }));
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Connection test failed.");
          } finally {
            setSettingsPlatformConfigTesting(false);
          }
        }, [
          settingsCanConfigureBusinessFeatures,
          settingsClearInferenceApiKey,
          settingsInferenceApiKeyInput,
          settingsInferenceSettings.baseUrl,
          settingsInferenceSettings.defaultModel,
          settingsInferenceSettings.providerType,
          authRequestHeaders,
          hasRealAccess,
          proxyBackendBase,
        ]);

        const handleSettingsInferenceSave = useCallback(async (inferenceSettingsOverride = null, options = null) => {
          if (!settingsCanConfigureBusinessFeatures) {
            setSettingsPlatformConfigError("Upgrade to Team to configure inference.");
            setSettingsPlatformConfigSuccess("");
            return;
          }

          const saveOptions = options && typeof options === "object" ? options : {};
          const sourceInferenceSettings = inferenceSettingsOverride
            ? normalizeDemoSettingsInferenceSettings(inferenceSettingsOverride)
            : settingsInferenceSettings;
          const apiKeyInputValue = typeof saveOptions.apiKeyInputOverride === "string"
            ? saveOptions.apiKeyInputOverride
            : settingsInferenceApiKeyInput;
          const clearApiKey = typeof saveOptions.clearApiKeyOverride === "boolean"
            ? saveOptions.clearApiKeyOverride
            : settingsClearInferenceApiKey;
          const normalizedApiKeyInput = String(apiKeyInputValue || "").trim();
          const trimmedBaseUrl = String(sourceInferenceSettings.baseUrl || "").trim();

          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          try {
            const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
              ...sourceInferenceSettings,
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
            });
            if (hasRealAccess) {
              const response = await fetch(proxyBackendBase + "/billing/preferences", {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  inference: {
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
                  },
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save inference settings.");
              }
              const persistedBillingPreferences = normalizeDemoSettingsBillingPreferences(data?.billing);
              const backendPersistedInferenceApiKeyPreview = typeof data?.inference?.apiKeyPreview === "string"
                ? data.inference.apiKeyPreview.trim()
                : "";
              const persistedInferenceApiKeyPreview = backendPersistedInferenceApiKeyPreview.length >= nextInferenceSettings.apiKeyPreview.length
                ? backendPersistedInferenceApiKeyPreview
                : nextInferenceSettings.apiKeyPreview;
              const persistedInferenceSettings = normalizeDemoSettingsInferenceSettings({
                ...data?.inference,
                apiKeyPreview: persistedInferenceApiKeyPreview,
              });
              setSettingsBillingPreferences(persistedBillingPreferences);
              setSettingsInferenceSettings(persistedInferenceSettings);
              writeDemoSettingsPlatformConfig({
                billing: persistedBillingPreferences,
                inference: persistedInferenceSettings,
              });
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 180));
              setSettingsInferenceSettings(nextInferenceSettings);
              writeDemoSettingsPlatformConfig({
                billing: settingsBillingPreferences,
                inference: nextInferenceSettings,
              });
            }
            if (clearApiKey || normalizedApiKeyInput) {
              setSettingsInferenceApiKeyInput("");
              setSettingsInferenceApiKeyEditing(false);
            }
            if (clearApiKey) {
              setSettingsClearInferenceApiKey(false);
            }
            setSettingsPlatformConfigSuccess("");
          } catch (error) {
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Failed to save inference settings.");
          } finally {
            setSettingsPlatformConfigSaving(false);
          }
        }, [
          settingsBillingPreferences,
          settingsCanConfigureBusinessFeatures,
          settingsClearInferenceApiKey,
          settingsInferenceApiKeyInput,
          settingsInferenceSettings,
          authRequestHeaders,
          hasRealAccess,
          proxyBackendBase,
        ]);

        const queueSettingsInferenceAutosave = useCallback((nextInferenceSettings, options = {}) => {
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          if (settingsInferenceAutosaveTimerRef.current) {
            window.clearTimeout(settingsInferenceAutosaveTimerRef.current);
            settingsInferenceAutosaveTimerRef.current = null;
          }
          const normalizedInferenceSettings = normalizeDemoSettingsInferenceSettings(nextInferenceSettings);
          if (!settingsCanConfigureBusinessFeatures) {
            return;
          }
          if (options.immediate) {
            void handleSettingsInferenceSave(normalizedInferenceSettings, options);
            return;
          }
          settingsInferenceAutosaveTimerRef.current = window.setTimeout(() => {
            settingsInferenceAutosaveTimerRef.current = null;
            void handleSettingsInferenceSave(normalizedInferenceSettings, options);
          }, 520);
        }, [handleSettingsInferenceSave, settingsCanConfigureBusinessFeatures]);

        const handleSettingsInferenceAddModels = useCallback((rawValue) => {
          const nextModels = parseDemoInferenceModelInput(rawValue);
          if (nextModels.length === 0) {
            return false;
          }
          const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
            ...settingsInferenceSettings,
            availableModels: mergeDemoInferenceModelLists(settingsInferenceSettings.availableModels, nextModels),
          });
          setSettingsInferenceSettings(nextInferenceSettings);
          setSettingsInferenceModelInput("");
          queueSettingsInferenceAutosave(nextInferenceSettings, { immediate: true });
          return true;
        }, [queueSettingsInferenceAutosave, settingsInferenceSettings]);

        const handleSettingsInferenceRemoveModel = useCallback((modelId) => {
          const normalizedModelId = String(modelId || "").trim();
          if (!normalizedModelId) {
            return;
          }
          const nextInferenceSettings = normalizeDemoSettingsInferenceSettings({
            ...settingsInferenceSettings,
            availableModels: settingsInferenceSettings.availableModels.filter((entry) => entry !== normalizedModelId),
          });
          setSettingsInferenceSettings(nextInferenceSettings);
          queueSettingsInferenceAutosave(nextInferenceSettings, { immediate: true });
        }, [queueSettingsInferenceAutosave, settingsInferenceSettings]);
`;

