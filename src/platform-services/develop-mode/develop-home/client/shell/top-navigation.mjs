export const DEVELOP_HOME_TOP_NAVIGATION_SCRIPT = `        function renderDevelopHomeNav() {
          return renderAppHeader({
            className: "playground-develop-navbar",
            pathItems: [{ label: "Develop" }, { label: "Home" }],
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-develop-overview-controls",
              className: "playground-develop-overview-controls-slot",
            }),
          });
        }

        function renderDevelopWebhooksNav() {
          return renderAppHeader({
            className: "playground-develop-navbar playground-develop-webhooks-navbar",
            pathItems: settingsSelectedTrigger
              ? [
                  { label: "Develop", onClick: () => openDevelopHome() },
                  { label: "Webhooks", onClick: () => setSettingsSelectedTriggerId("") },
                  { label: settingsSelectedTrigger.name || "Webhook" },
                ]
              : [
                  { label: "Develop", onClick: () => openDevelopHome() },
                  { label: "Webhooks" },
                ],
            extraActions: !settingsSelectedTrigger
              ? React.createElement("div", {
                  id: "playground-develop-webhooks-overview-controls",
                  className: "playground-develop-webhooks-overview-controls-slot",
                })
              : null,
          });
        }
`;
