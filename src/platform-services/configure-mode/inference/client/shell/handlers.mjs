export const INFERENCE_APP_HANDLERS_SCRIPT = `        const persistInferenceEndpointCollection = useCallback((collectionValue, preferredEndpointId = "") => {
          const collection = normalizeDemoInferenceEndpointCollection(collectionValue);
          const preferredEndpoint = getDemoInferenceEndpoint(collection, preferredEndpointId);
          const selectedEndpoint = preferredEndpoint || getDefaultDemoInferenceEndpoint(collection);
          setSettingsInferenceEndpoints(collection);
          setSettingsInferenceSettings(selectedEndpoint);
          setSettingsInferenceSelectedVersionId(String(selectedEndpoint?.currentVersionId || ""));
          writeDemoSettingsPlatformConfig({
            billing: settingsBillingPreferences,
            inference: getDefaultDemoInferenceEndpoint(collection),
            inferenceEndpoints: collection,
          });
          return { collection, selectedEndpoint };
        }, [settingsBillingPreferences]);

        const requestInferencePlanGate = useCallback(() => {
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
          requestPlatformPlanGate({
            entitlement: "inference.byo",
            requiredPlan: "team",
            featureName: "custom inference endpoints",
            source: "inference",
          });
          return false;
        }, []);

        const handleSettingsInferenceCreateEndpoint = useCallback(async (endpointInputValue = null) => {
          if (!settingsCanConfigureBusinessFeatures) {
            return requestInferencePlanGate();
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
              if (requestPlatformPlanGateFromResponse(response, data, {
                entitlement: "inference.byo",
                requiredPlan: "team",
                featureName: "custom inference endpoints",
                source: "inference",
              })) {
                return false;
              }
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
                creatorId: sessionState.userId || accountEmail || "demo-user",
                creatorUserId: sessionState.userId || accountEmail || "demo-user",
                creatorName: accountName || accountEmail || "Demo User",
                creatorEmail: accountEmail || "",
                creatorAvatarUrl: accountAvatarUrl || "",
                ownerId: sessionState.userId || accountEmail || "demo-user",
                ownerUserId: sessionState.userId || accountEmail || "demo-user",
                ownerName: accountName || accountEmail || "Demo User",
                ownerEmail: accountEmail || "",
                ownerAvatarUrl: accountAvatarUrl || "",
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
          accountAvatarUrl,
          accountEmail,
          accountName,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          requestInferencePlanGate,
          settingsCanConfigureBusinessFeatures,
          settingsInferenceEndpoints,
          sessionState.userId,
        ]);

        const handleSettingsInferenceSave = useCallback(async (saveDetails = null) => {
          if (!settingsCanConfigureBusinessFeatures) {
            requestInferencePlanGate();
            return false;
          }
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:")) {
            return;
          }

          const details = saveDetails && typeof saveDetails === "object" ? saveDetails : {};
          const selectedEndpoint = getDemoInferenceEndpoint(settingsInferenceEndpoints, endpointId);
          if (!selectedEndpoint) return false;
          const requestedMode = details.mode === "current" ? "current" : "new";
          const currentVersionId = String(selectedEndpoint.currentVersionId || "").trim();
          const mode = requestedMode === "current" && currentVersionId ? "current" : "new";
          const versionDescription = String(details.description || "").trim().slice(0, 240);
          const sourceInferenceSettings = normalizeDemoInferenceEndpoint(settingsInferenceSettings);
          const normalizedApiKeyInput = String(settingsInferenceApiKeyInput || "").trim();
          const trimmedBaseUrl = String(sourceInferenceSettings.baseUrl || "").trim();
          const nextInferenceSettings = normalizeDemoInferenceEndpoint({
            ...sourceInferenceSettings,
            id: endpointId,
            enabled: Boolean(trimmedBaseUrl),
            baseUrl: trimmedBaseUrl,
            defaultModel: "",
            availableModels: mergeDemoInferenceModelLists(sourceInferenceSettings.availableModels),
            apiKeyConfigured: settingsClearInferenceApiKey
              ? false
              : (sourceInferenceSettings.apiKeyConfigured || Boolean(normalizedApiKeyInput)),
            apiKeyPreview: settingsClearInferenceApiKey
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
          setSettingsInferenceVersionSaveDialog((current) => ({ ...current, error: "" }));
          try {
            let collection;
            if (hasRealAccess) {
              const versionPath = mode === "current"
                ? "/inference/endpoints/" + encodeURIComponent(endpointId)
                  + "/versions/" + encodeURIComponent(currentVersionId)
                : "/inference/endpoints/" + encodeURIComponent(endpointId) + "/versions";
              const response = await fetch(
                proxyBackendBase + versionPath,
                {
                  method: mode === "current" ? "PATCH" : "POST",
                  headers: {
                    ...authRequestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    endpoint: {
                      name: nextInferenceSettings.name,
                      description: nextInferenceSettings.description,
                      enabled: nextInferenceSettings.enabled,
                      providerType: nextInferenceSettings.providerType,
                      baseUrl: nextInferenceSettings.baseUrl,
                      defaultModel: "",
                      availableModels: nextInferenceSettings.availableModels,
                      apiKey: normalizedApiKeyInput || undefined,
                      clearApiKey: settingsClearInferenceApiKey,
                      lastValidatedAt: nextInferenceSettings.lastValidatedAt || null,
                      healthStatus: nextInferenceSettings.healthStatus,
                      lastError: nextInferenceSettings.lastError,
                      isDefault: nextInferenceSettings.isDefault,
                    },
                    description: versionDescription,
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (requestPlatformPlanGateFromResponse(response, data, {
                entitlement: "inference.byo",
                requiredPlan: "team",
                featureName: "custom inference endpoints",
                source: "inference",
              })) {
                return false;
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save inference endpoint.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              await new Promise((resolve) => window.setTimeout(resolve, 120));
              const now = new Date().toISOString();
              const versions = Array.isArray(selectedEndpoint.versions)
                ? [...selectedEndpoint.versions]
                : [];
              let currentVersion;
              if (mode === "current") {
                versions.splice(0, versions.length, ...versions.map((version) => {
                  if (version.id !== currentVersionId) return version;
                  currentVersion = {
                    ...version,
                    description: versionDescription,
                    snapshot: buildDemoInferenceVersionSnapshot(nextInferenceSettings),
                    updatedAt: now,
                  };
                  return currentVersion;
                }));
              } else {
                const versionNumber = Math.max(0, ...versions.map((version) => Number(version.number || version.versionNumber || 0))) + 1;
                currentVersion = {
                  id: endpointId + ":version:" + String(versionNumber),
                  number: versionNumber,
                  versionNumber,
                  label: "v" + String(versionNumber),
                  description: versionDescription,
                  status: "saved",
                  snapshot: buildDemoInferenceVersionSnapshot(nextInferenceSettings),
                  createdAt: now,
                  updatedAt: now,
                  publishedAt: null,
                };
                versions.push(currentVersion);
              }
              const persistedEndpoint = normalizeDemoInferenceEndpoint({
                ...selectedEndpoint,
                ...nextInferenceSettings,
                versions,
                currentVersionId: currentVersion?.id || currentVersionId,
                currentVersionNumber: currentVersion?.number || selectedEndpoint.currentVersionNumber,
                publishedVersionId: selectedEndpoint.publishedVersionId,
              });
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, persistedEndpoint);
            }
            persistInferenceEndpointCollection(collection, endpointId);
            if (settingsClearInferenceApiKey || normalizedApiKeyInput) {
              setSettingsInferenceApiKeyInput("");
              setSettingsInferenceApiKeyEditing(false);
            }
            if (settingsClearInferenceApiKey) setSettingsClearInferenceApiKey(false);
            setSettingsInferenceVersionSaveDialog((current) => ({
              ...current,
              open: false,
              error: "",
            }));
            setSettingsPlatformConfigSuccess(
              mode === "new" ? "Inference endpoint version created." : "Inference endpoint version updated."
            );
            return true;
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save inference endpoint.";
            setSettingsPlatformConfigError(message);
            setSettingsInferenceVersionSaveDialog((current) => ({ ...current, error: message }));
            throw error;
          } finally {
            setSettingsPlatformConfigSaving(false);
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          requestInferencePlanGate,
          settingsCanConfigureBusinessFeatures,
          settingsClearInferenceApiKey,
          settingsInferenceApiKeyInput,
          settingsInferenceEndpoints,
          settingsInferenceSelectedEndpointId,
          settingsInferenceSettings,
        ]);

        const openSettingsInferenceSaveDialog = useCallback((initialMode = "new") => {
          setSettingsInferencePublishMenuOpen(false);
          setSettingsInferenceVersionSaveDialog((current) => ({
            open: true,
            initialMode: initialMode === "current" ? "current" : "new",
            instanceKey: Number(current.instanceKey || 0) + 1,
            error: "",
          }));
        }, []);

        const handleSettingsInferenceSelectVersion = useCallback((versionIdValue) => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          const endpoint = getDemoInferenceEndpoint(settingsInferenceEndpoints, endpointId);
          const version = getDemoInferenceEndpointVersion(endpoint, versionIdValue);
          if (!endpoint || !version) return;
          setSettingsInferenceSelectedVersionId(version.id);
          setSettingsInferenceSettings(applyDemoInferenceVersionSnapshot(endpoint, version));
          setSettingsInferenceApiKeyInput("");
          setSettingsInferenceApiKeyEditing(false);
          setSettingsClearInferenceApiKey(false);
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
        }, [settingsInferenceEndpoints, settingsInferenceSelectedEndpointId]);

        const handleSettingsInferenceRevertChanges = useCallback(() => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          const endpoint = getDemoInferenceEndpoint(settingsInferenceEndpoints, endpointId);
          if (!endpoint) return;
          const selectedVersion = getDemoInferenceEndpointVersion(
            endpoint,
            settingsInferenceSelectedVersionId || endpoint.currentVersionId
          );
          setSettingsInferenceSettings(
            selectedVersion ? applyDemoInferenceVersionSnapshot(endpoint, selectedVersion) : endpoint
          );
          setSettingsInferenceApiKeyInput("");
          setSettingsInferenceApiKeyEditing(false);
          setSettingsClearInferenceApiKey(false);
          setSettingsPlatformConfigError("");
          setSettingsPlatformConfigSuccess("");
        }, [
          settingsInferenceEndpoints,
          settingsInferenceSelectedEndpointId,
          settingsInferenceSelectedVersionId,
        ]);

        const handleSettingsInferencePublishVersion = useCallback(async (versionIdValue) => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          const versionId = String(versionIdValue || "").trim();
          const endpoint = getDemoInferenceEndpoint(settingsInferenceEndpoints, endpointId);
          if (!endpoint || !versionId || endpointId.startsWith("local-inference:")) return;
          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
          try {
            let collection;
            if (hasRealAccess) {
              const response = await fetch(
                proxyBackendBase + "/inference/endpoints/" + encodeURIComponent(endpointId)
                  + "/versions/" + encodeURIComponent(versionId) + "/publish",
                { method: "POST", headers: authRequestHeaders }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to publish inference endpoint version.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              const now = new Date().toISOString();
              const nextEndpoint = normalizeDemoInferenceEndpoint({
                ...endpoint,
                publishedVersionId: versionId,
                versions: endpoint.versions.map((version) => ({
                  ...version,
                  status: version.id === versionId ? "published" : "saved",
                  publishedAt: version.id === versionId ? now : null,
                })),
              });
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, nextEndpoint);
            }
            persistInferenceEndpointCollection(collection, endpointId);
            setSettingsPlatformConfigSuccess("Inference endpoint version published.");
          } catch (error) {
            const message = error instanceof Error
              ? error.message
              : "Failed to publish inference endpoint version.";
            setSettingsPlatformConfigError(message);
            throw error;
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

        const handleSettingsInferenceConnectionTest = useCallback(async () => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!settingsCanConfigureBusinessFeatures) {
            requestInferencePlanGate();
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
              if (requestPlatformPlanGateFromResponse(response, data, {
                entitlement: "inference.byo",
                requiredPlan: "team",
                featureName: "custom inference endpoints",
                source: "inference",
              })) {
                return;
              }
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
            const normalizedCollection = normalizeDemoInferenceEndpointCollection(collection);
            const nextDraft = normalizeDemoInferenceEndpoint({
              ...settingsInferenceSettings,
              availableModels: mergeDemoInferenceModelLists(
                settingsInferenceSettings.availableModels,
                availableModels,
              ),
              healthStatus: "healthy",
              lastValidatedAt: checkedAt,
              lastError: "",
            });
            setSettingsInferenceEndpoints(normalizedCollection);
            setSettingsInferenceSettings(nextDraft);
            writeDemoSettingsPlatformConfig({
              billing: settingsBillingPreferences,
              inference: getDefaultDemoInferenceEndpoint(normalizedCollection),
              inferenceEndpoints: normalizedCollection,
            });
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
            setSettingsInferenceSettings(failedEndpoint);
            setSettingsPlatformConfigError(error instanceof Error ? error.message : "Connection test failed.");
          } finally {
            setSettingsPlatformConfigTesting(false);
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          persistInferenceEndpointCollection,
          proxyBackendBase,
          requestInferencePlanGate,
          settingsBillingPreferences,
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
          return true;
        }, [settingsInferenceSettings]);

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
        }, [settingsInferenceSettings]);

        const handleSettingsInferenceRemoveEndpoint = useCallback(async () => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:")) return;
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
              if (requestPlatformPlanGateFromResponse(response, data, {
                entitlement: "inference.byo",
                requiredPlan: "team",
                featureName: "custom inference endpoints",
                source: "inference",
              })) {
                return;
              }
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
          requestInferencePlanGate,
          settingsInferenceEndpoints,
          settingsInferenceSelectedEndpointId,
        ]);

        const handleSettingsInferenceOwnerCandidatesRequest = useCallback(async () => {
          const currentIdentity = {
            id: sessionState.userId || accountEmail || "",
            userId: sessionState.userId || "",
            name: accountName || accountEmail || "Me",
            email: accountEmail || "",
            avatarUrl: accountAvatarUrl || "",
          };
          if (!hasRealAccess || !activeOrganizationId) return [currentIdentity];
          const response = await fetch(
            proxyBackendBase
              + "/organizations/"
              + encodeURIComponent(activeOrganizationId)
              + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
            { headers: authRequestHeaders }
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to load organization members.");
          }
          const members = Array.isArray(data)
            ? data
            : Array.isArray(data?.members)
              ? data.members
              : Array.isArray(data?.organizationMembers)
                ? data.organizationMembers
                : Array.isArray(data?.organization_members)
                  ? data.organization_members
                : Array.isArray(data?.data)
                  ? data.data
                  : Array.isArray(data?.data?.members)
                    ? data.data.members
                    : Array.isArray(data?.data?.organizationMembers)
                      ? data.data.organizationMembers
                      : Array.isArray(data?.data?.organization_members)
                        ? data.data.organization_members
                    : [currentIdentity];
          return members.filter((member) => {
            const status = String(member?.status || "active").trim().toLowerCase();
            return status === "active";
          });
        }, [
          accountAvatarUrl,
          accountEmail,
          accountName,
          activeOrganizationId,
          authRequestHeaders,
          hasRealAccess,
          proxyBackendBase,
          sessionState.userId,
        ]);

        const handleSettingsInferenceOwnerTransfer = useCallback(async (nextOwnerValue) => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          const nextOwner = nextOwnerValue && typeof nextOwnerValue === "object"
            ? nextOwnerValue
            : {};
          const ownerUserId = String(nextOwner.userId || nextOwner.id || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:") || !ownerUserId) return;
          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
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
                  body: JSON.stringify({ endpoint: { ownerUserId } }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to transfer inference endpoint ownership.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              const nextEndpoint = normalizeDemoInferenceEndpoint({
                ...settingsInferenceSettings,
                ownerId: ownerUserId,
                ownerUserId,
                ownerName: String(nextOwner.name || nextOwner.email || ownerUserId).trim(),
                ownerEmail: String(nextOwner.email || "").trim(),
                ownerAvatarUrl: String(nextOwner.avatarUrl || "").trim(),
                updatedAt: new Date().toISOString(),
              });
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, nextEndpoint);
            }
            persistInferenceEndpointCollection(collection, endpointId);
          } catch (error) {
            const normalizedError = error instanceof Error
              ? error
              : new Error("Failed to transfer inference endpoint ownership.");
            setSettingsPlatformConfigError(normalizedError.message);
            throw normalizedError;
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
          settingsInferenceSettings,
        ]);

        const handleSettingsInferenceAccessMetadataChange = useCallback(async (
          nextMetadataValue,
          nextPermissionSetValue = null
        ) => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          if (!endpointId || endpointId.startsWith("local-inference:")) {
            throw new Error("Deployment-managed endpoints cannot be shared independently.");
          }
          const nextMetadata = nextMetadataValue && typeof nextMetadataValue === "object" && !Array.isArray(nextMetadataValue)
            ? nextMetadataValue
            : {};
          const nextPermissionSet = nextPermissionSetValue && typeof nextPermissionSetValue === "object" && !Array.isArray(nextPermissionSetValue)
            ? nextPermissionSetValue
            : null;
          setSettingsPlatformConfigSaving(true);
          setSettingsPlatformConfigError("");
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
                      metadata: nextMetadata,
                      permissionSet: nextPermissionSet,
                    },
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to update inference endpoint access.");
              }
              collection = normalizeDemoInferenceEndpointCollection(data);
            } else {
              const nextEndpoint = normalizeDemoInferenceEndpoint({
                ...settingsInferenceSettings,
                metadata: nextMetadata,
                permissionSet: nextPermissionSet,
                updatedAt: new Date().toISOString(),
              });
              collection = upsertDemoInferenceEndpoint(settingsInferenceEndpoints, nextEndpoint);
            }
            const persisted = persistInferenceEndpointCollection(collection, endpointId);
            return getDemoInferenceEndpoint(persisted.collection, endpointId);
          } catch (error) {
            const normalizedError = error instanceof Error
              ? error
              : new Error("Failed to update inference endpoint access.");
            setSettingsPlatformConfigError(normalizedError.message);
            throw normalizedError;
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
          settingsInferenceSettings,
        ]);

        const handleSettingsInferenceTeamShareCreate = useCallback(async (teamValue, accessMetadataValue) => {
          const endpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          const team = teamValue && typeof teamValue === "object" ? teamValue : {};
          const teamId = String(team.id || "").trim();
          if (!endpointId || !teamId) throw new Error("Choose a team before sharing this endpoint.");
          if (!hasRealAccess) {
            return { id: "tshare_" + Date.now().toString(36) };
          }
          const endpointName = String(settingsInferenceSettings.name || "Inference Endpoint").trim();
          const endpointDescription = String(
            settingsInferenceSettings.description
            || "Organization inference endpoint"
          ).trim();
          const shareMetadata = accessMetadataValue && typeof accessMetadataValue === "object" && !Array.isArray(accessMetadataValue)
            ? accessMetadataValue
            : {};
          const requestShare = async () => {
            const response = await fetch(
              proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
              {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  resourceType: "inference_endpoint",
                  resourceId: endpointId,
                  resourceName: endpointName,
                  accessLevel: "use",
                  title: endpointName,
                  description: endpointDescription,
                  metadata: {
                    ...shareMetadata,
                    resourceType: "inference_endpoint",
                    resourceKind: "inference_endpoint",
                    sharedTeamId: teamId,
                    sharedTeamName: String(team.name || "Team"),
                    title: endpointName,
                    description: endpointDescription,
                    inferenceEndpoint: {
                      id: endpointId,
                      name: endpointName,
                      providerType: settingsInferenceSettings.providerType,
                      models: settingsInferenceSettings.availableModels,
                    },
                  },
                }),
              }
            );
            const data = await response.json().catch(() => ({}));
            return { response, data };
          };
          const created = await requestShare();
          if (created.response.ok) {
            return created.data?.data || created.data?.share || created.data || {};
          }
          if (created.response.status !== 409) {
            throw new Error(created.data?.message || created.data?.error || "Failed to share inference endpoint.");
          }
          const existingResponse = await fetch(
            proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
            { headers: authRequestHeaders }
          );
          const existingData = await existingResponse.json().catch(() => ({}));
          if (!existingResponse.ok) {
            throw new Error(existingData?.message || existingData?.error || "Failed to load inference endpoint team access.");
          }
          const shares = Array.isArray(existingData?.data)
            ? existingData.data
            : Array.isArray(existingData?.shares)
              ? existingData.shares
              : [];
          return shares.find((share) => (
            String(share?.resourceType || share?.resource_type || "") === "inference_endpoint"
            && String(share?.resourceId || share?.resource_id || "") === endpointId
          )) || {};
        }, [
          authRequestHeaders,
          hasRealAccess,
          proxyBackendBase,
          settingsInferenceSelectedEndpointId,
          settingsInferenceSettings,
        ]);

        const handleSettingsInferenceTeamShareRemove = useCallback(async (teamIdValue, shareIdValue) => {
          const teamId = String(teamIdValue || "").trim();
          const shareId = String(shareIdValue || "").trim();
          if (!teamId || !shareId || !hasRealAccess) return;
          const response = await fetch(
            proxyBackendBase
              + "/teams/"
              + encodeURIComponent(teamId)
              + "/resource-shares/"
              + encodeURIComponent(shareId),
            {
              method: "DELETE",
              headers: authRequestHeaders,
            }
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to remove inference endpoint team access.");
          }
        }, [authRequestHeaders, hasRealAccess, proxyBackendBase]);
`;
