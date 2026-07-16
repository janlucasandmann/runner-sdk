export const API_KEYS_TOP_NAVIGATION_SCRIPT = `        function renderDevelopApiKeysNav() {
          return renderAppHeader({
            className: "playground-develop-navbar playground-develop-api-keys-navbar",
            pathItems: [{ label: "Develop", onClick: () => openDevelopHome() }, { label: "API Keys" }],
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-develop-api-keys-overview-controls",
              className: "playground-resource-overview-controls-slot playground-develop-api-keys-overview-controls-slot",
            }),
          });
        }
`;
