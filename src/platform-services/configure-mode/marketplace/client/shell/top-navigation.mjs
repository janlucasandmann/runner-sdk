export const MARKETPLACE_APP_TOP_NAVIGATION_SCRIPT = `        function renderResourceTemplatesPageNav() {
          return renderAppHeader({
            className: "playground-settings-top-navbar",
            pathItems: [{ label: "Configure" }, { label: "Marketplace" }],
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-marketplace-overview-controls",
              className: "playground-tools-overview-controls-slot",
            }),
          });
        }

`;
