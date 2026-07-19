export const INFERENCE_APP_NAVIGATION_SCRIPT = `        function openInferencePage(endpointId = "") {
          const normalizedEndpointId = String(endpointId || "").trim();
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setSidebarWorkspaceMode("configure");
          setSettingsSection("inference");
          setSettingsInferenceSelectedEndpointId(normalizedEndpointId);
          if (normalizedEndpointId && !normalizedEndpointId.startsWith("local-inference:")) {
            const selectedEndpoint = getDemoInferenceEndpoint(
              settingsInferenceEndpoints,
              normalizedEndpointId,
            );
            if (selectedEndpoint) setSettingsInferenceSettings(selectedEndpoint);
          }
          setSettingsInferenceApiKeyInput("");
          setSettingsInferenceApiKeyEditing(false);
          setSettingsClearInferenceApiKey(false);
          setSettingsInferenceModelInput("");
          setActivePage("inference");
        }
`;
