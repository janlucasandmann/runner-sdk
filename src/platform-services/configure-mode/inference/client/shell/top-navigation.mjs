export const INFERENCE_APP_TOP_NAVIGATION_SCRIPT = `        function renderInferencePageNav() {
          const selectedInferenceEndpointId = String(settingsInferenceSelectedEndpointId || "").trim();
          const selectedInferenceRunnerId = selectedInferenceEndpointId.startsWith("local-inference:")
            ? selectedInferenceEndpointId.slice("local-inference:".length)
            : "";
          const selectedInferenceRunner = selectedInferenceRunnerId
            ? settingsLocalRunnersState.devices.find((device) => String(device?.id || "") === selectedInferenceRunnerId)
            : null;
          const selectedExternalInferenceEndpoint = selectedInferenceEndpointId
            ? getDemoInferenceEndpoint(settingsInferenceEndpoints, selectedInferenceEndpointId)
            : null;
          const selectedInferenceVersionId = String(
            settingsInferenceSelectedVersionId
            || selectedExternalInferenceEndpoint?.currentVersionId
            || ""
          ).trim();
          const selectedInferenceVersion = getDemoInferenceEndpointVersion(
            selectedExternalInferenceEndpoint,
            selectedInferenceVersionId
          );
          const inferenceVersions = Array.isArray(selectedExternalInferenceEndpoint?.versions)
            ? selectedExternalInferenceEndpoint.versions
            : [];
          const latestInferenceVersionNumber = inferenceVersions.reduce(
            (latest, version) => Math.max(latest, Number(version?.number || version?.versionNumber || 0)),
            1
          );
          const isHistoricalInferenceVersion = Boolean(
            selectedExternalInferenceEndpoint
            && selectedInferenceVersionId
            && selectedInferenceVersionId !== selectedExternalInferenceEndpoint.currentVersionId
          );
          const inferenceVersionDirty = Boolean(
            selectedExternalInferenceEndpoint
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
          const selectedInferenceEndpointLabel = selectedExternalInferenceEndpoint
            ? String(selectedExternalInferenceEndpoint.name || "Inference Endpoint")
            : selectedInferenceEndpointId === "deployment-inference-endpoint"
              ? "Local Appliance Inference"
              : selectedInferenceRunner
                ? String(selectedInferenceRunner.name || selectedInferenceRunner.hostname || "Local Endpoint") + " Inference"
                : "Endpoint";
          const isInferenceOverview = !selectedInferenceEndpointId;
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: isInferenceOverview
              ? [{ label: "Inference" }]
              : [
                  {
                    label: "Inference",
                    onClick: () => openInferencePage(),
                  },
                  {
                    label: selectedInferenceEndpointLabel,
                    trailing: selectedExternalInferenceEndpoint
                      ? React.createElement(PlatformResourceHeaderActions, null,
                          React.createElement(PlatformResourceVersionLabel, {
                            resourceLabel: "inference endpoint",
                            version: Number(selectedInferenceVersion?.number || 1),
                            latestVersion: latestInferenceVersionNumber,
                            disabled: settingsPlatformConfigSaving,
                            onOpenVersionHistory: () => setSettingsInferenceVersionsOpen(true),
                          })
                        )
                      : null,
                  },
                ],
            center: isInferenceOverview
              ? null
              : React.createElement(PlatformSwitch, {
                  className: "inference-endpoint-detail__header-switch",
                  value: settingsInferenceDetailTab === "settings" ? "settings" : "general",
                  options: [
                    { value: "general", label: "General" },
                    { value: "settings", label: "Settings" },
                  ],
                  onValueChange: (nextTab) => setSettingsInferenceDetailTab(
                    nextTab === "settings" ? "settings" : "general"
                  ),
                  ariaLabel: "Inference endpoint section",
                }),
            includeSearchDivider: true,
            extraActions: isInferenceOverview
              ? React.createElement("div", {
                  id: "playground-inference-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : !selectedExternalInferenceEndpoint
                ? null
                : React.createElement(PlatformVersionPublishControl, {
                    open: settingsInferencePublishMenuOpen,
                    onOpenChange: setSettingsInferencePublishMenuOpen,
                    onPublish: () => openSettingsInferenceSaveDialog("new"),
                    leading: React.createElement(Bookmark, {
                      width: 14,
                      height: 14,
                      strokeWidth: 1.8,
                      "aria-hidden": "true",
                    }),
                    label: settingsPlatformConfigSaving ? "Saving..." : "Save Changes",
                    publishAriaLabel: "Review and save inference endpoint changes",
                    menuAriaLabel: "Inference endpoint save options",
                    disabled: settingsPlatformConfigSaving
                      || !settingsCanConfigureBusinessFeatures
                      || !inferenceVersionDirty
                      || isHistoricalInferenceVersion,
                    menuDisabled: settingsPlatformConfigSaving
                      || !settingsCanConfigureBusinessFeatures
                      || isHistoricalInferenceVersion,
                    active: inferenceVersionDirty,
                    actions: [
                      {
                        id: "revert",
                        label: "Revert all changes",
                        icon: Undo2,
                        disabled: !inferenceVersionDirty,
                        onClick: handleSettingsInferenceRevertChanges,
                      },
                    ],
                  }),
          });
        }

`;
