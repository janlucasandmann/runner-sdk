export const DEVELOP_HOME_TOP_NAVIGATION_SCRIPT = `        function openDevelopHomeCreateTarget(targetId) {
          const normalizedTargetId = String(targetId || "").trim();
          if (!normalizedTargetId) return;

          requestPlatformNavigation(() => {
            if (normalizedTargetId === "api-key") {
              openDevelopApiKeysPage({ openCreateDialog: true });
              return;
            }
            if (normalizedTargetId === "webhook") {
              openDevelopWebhooksPage();
              openSettingsTriggerComposer();
              return;
            }
            openResourcesView("servers", {
              serverKind: normalizedTargetId,
              create: true,
              forceOverview: true,
            });
          });
        }

        function renderDevelopHomeCreateSelector() {
          const createTargets = [
            { id: "web_app", label: "Web App", Icon: Globe },
            { id: "api", label: "API", Icon: Code2 },
            { id: "function", label: "Function", Icon: FunctionSquare },
            { id: "database", label: "Database", Icon: Database },
            { id: "auth", label: "Authentication", Icon: UsersRound },
            { id: "agent_runtime", label: "Agent Runtime", Icon: Bot },
            { id: "secrets", label: "Secrets", Icon: Vault },
            { id: "payments", label: "Payments", Icon: ReceiptText },
            { id: "api-key", label: "API Key", Icon: KeyRound },
            { id: "webhook", label: "Webhook", Icon: Webhook },
          ];
          return React.createElement(PlatformButtonSelector, {
            mode: "popup",
            buttonVariant: "primary",
            buttonSize: "small",
            label: "New",
            closeOnSelect: true,
            leading: React.createElement(Plus, {
              width: 14,
              height: 14,
              strokeWidth: 1.8,
              "aria-hidden": "true",
            }),
            popupAriaLabel: "Create new development resource",
            popupAlignment: "right",
            popupRole: "menu",
            popupVariant: "minimal",
            popupWidth: 220,
            popupClassName: "develop-home-create-menu",
          },
            createTargets.map(({ id, label, Icon }) => React.createElement("button", {
              key: id,
              type: "button",
              role: "menuitem",
              className: "tb-popup-row",
              onClick: () => openDevelopHomeCreateTarget(id),
            },
              React.createElement(Icon, {
                className: "tb-popup-icon",
                width: 14,
                height: 14,
                strokeWidth: 1.8,
                "aria-hidden": "true",
              }),
              React.createElement("span", null, label)
            ))
          );
        }

        function renderDevelopHomeNav() {
          return renderAppHeader({
            className: "playground-develop-navbar",
            pathItems: [{ label: "Develop" }, { label: "Home" }],
            includeSearchDivider: true,
            extraActions: renderDevelopHomeCreateSelector(),
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
