export const CONFIGURE_HOME_TOP_NAVIGATION_SCRIPT = `        function renderConfigureHomeNav() {
          return renderAppHeader({
            className: "playground-configure-navbar",
            pathItems: [{ label: "Configure" }, { label: "Overview" }],
          });
        }
`;
