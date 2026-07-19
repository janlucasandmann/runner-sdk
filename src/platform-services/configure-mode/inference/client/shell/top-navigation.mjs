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
          const selectedInferenceEndpointLabel = selectedExternalInferenceEndpoint
            ? String(selectedExternalInferenceEndpoint.name || "Inference Endpoint")
            : selectedInferenceRunner
              ? String(selectedInferenceRunner.name || selectedInferenceRunner.hostname || "Local Endpoint") + " Inference"
              : "Endpoint";
          const isInferenceOverview = !selectedInferenceEndpointId;
          return renderAppHeader({
            className: "playground-settings-top-navbar",
            pathItems: isInferenceOverview
              ? []
              : [
                {
                label: "Inference",
                onClick: () => openInferencePage(),
              },
                { label: selectedInferenceEndpointLabel },
              ],
            includeSearchDivider: isInferenceOverview,
            extraActions: isInferenceOverview
              ? React.createElement("div", {
                  id: "playground-inference-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : null,
          });
        }

`;
