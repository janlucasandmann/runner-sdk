export const INFERENCE_APP_NAVIGATION_SCRIPT = `        function openInferencePage(endpointId = "", options = {}) {
          const normalizedEndpointId = String(endpointId || "").trim();
          const requestedDetailTab = String(options?.detailTab || options?.tab || "").trim();
          const requestedVersionId = String(options?.versionId || "").trim();
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setSidebarWorkspaceMode("configure");
          setSettingsSection("inference");
          setSettingsInferenceSelectedEndpointId(normalizedEndpointId);
          setSettingsInferenceVersionsOpen(false);
          setSettingsInferencePublishMenuOpen(false);
          setSettingsInferenceVersionSaveDialog((current) => ({
            ...current,
            open: false,
            error: "",
          }));
          setSettingsInferenceDetailTab(
            normalizedEndpointId && requestedDetailTab === "settings"
              ? "settings"
              : "general"
          );
          if (normalizedEndpointId && !normalizedEndpointId.startsWith("local-inference:")) {
            const selectedEndpoint = getDemoInferenceEndpoint(
              settingsInferenceEndpoints,
              normalizedEndpointId,
            );
            if (selectedEndpoint) {
              const selectedVersion = getDemoInferenceEndpointVersion(
                selectedEndpoint,
                requestedVersionId || selectedEndpoint.currentVersionId
              );
              setSettingsInferenceSettings(
                selectedVersion ? applyDemoInferenceVersionSnapshot(selectedEndpoint, selectedVersion) : selectedEndpoint
              );
              setSettingsInferenceSelectedVersionId(String(
                selectedVersion?.id || selectedEndpoint.currentVersionId || ""
              ));
            }
          } else {
            setSettingsInferenceSelectedVersionId("");
          }
          setSettingsInferenceApiKeyInput("");
          setSettingsInferenceApiKeyEditing(false);
          setSettingsClearInferenceApiKey(false);
          setSettingsInferenceModelInput("");
          setActivePage("inference");
        }
`;
