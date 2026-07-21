export const SECURITY_TOP_NAVIGATION_SCRIPT = `        function renderDevelopSecurityNav() {
          return renderAppHeader({
            className: "playground-develop-navbar playground-develop-security-navbar",
            pathItems: [
              { label: "Develop", onClick: () => openDevelopHome() },
              { label: "Security Agents" },
            ],
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-develop-security-overview-controls",
              className: "playground-resource-overview-controls-slot playground-develop-security-overview-controls-slot",
            }),
          });
        }
`;
