export const INFERENCE_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "inference") {
            return {
              page: "inference",
              sectionId: "inference",
              endpointId: settingsInferenceSelectedEndpointId,
            };
          }
`;
