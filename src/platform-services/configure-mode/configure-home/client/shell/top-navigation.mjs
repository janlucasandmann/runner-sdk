export const CONFIGURE_HOME_TOP_NAVIGATION_SCRIPT = `        function renderConfigureHomeNav() {
          return renderAppHeader({
            className: "playground-configure-navbar",
            pathItems: [{ label: "Configure" }, { label: "Overview" }],
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-configure-overview-controls",
              className: "playground-configure-overview-controls-slot",
            }),
          });
        }
`;
