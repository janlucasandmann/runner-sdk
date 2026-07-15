export const INFERENCE_APP_TOP_NAVIGATION_SCRIPT = `        function renderInferencePageNav() {
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: [{ label: "Configure" }, { label: "Inference" }],
          });
        }

`;
