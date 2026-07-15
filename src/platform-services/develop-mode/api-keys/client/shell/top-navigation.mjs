export const API_KEYS_TOP_NAVIGATION_SCRIPT = `        function renderDevelopApiKeysNav() {
          return renderAppHeader({
            className: "playground-develop-navbar playground-develop-api-keys-navbar",
            pathItems: [{ label: "Develop", onClick: () => openDevelopHome() }, { label: "API Keys" }],
          });
        }
`;
