export const BATCHES_APP_TOP_NAVIGATION_SCRIPT = `        function renderBatchesPageNav() {
          return renderAppHeader({
            className: "playground-batches-navbar",
            pathItems: [{ label: "Create" }, { label: "Batches" }],
            center: React.createElement("div", {
              id: "playground-batches-overview-scope",
              className: "playground-resource-overview-scope-slot",
            }),
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-batches-overview-controls",
              className: "playground-resource-overview-controls-slot",
            }),
          });
        }

`;
