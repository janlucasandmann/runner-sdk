export const CONFIGURE_HOME_TOP_NAVIGATION_SCRIPT = `        function openConfigureHomeCreateTarget(targetId) {
          const normalizedTargetId = String(targetId || "").trim();
          if (!normalizedTargetId) return;

          if (normalizedTargetId === "agent" || normalizedTargetId === "computer") {
            openPlatformResourceCreationModal(normalizedTargetId);
            return;
          }

          requestPlatformNavigation(() => {
            if (normalizedTargetId === "skill") {
              openToolsView("skills", { create: true, forceOverview: true });
              return;
            }
            if (normalizedTargetId === "team") {
              openTeamOverviewPage();
              setTeamPageCreateModalOpen(true);
              return;
            }
            if (normalizedTargetId === "organization") {
              openOrganizationOverviewPage();
              setOrganizationPageCreateModalOpen(true);
            }
          });
        }

        function renderConfigureHomeCreateSelector() {
          const createTargets = [
            { id: "agent", label: "Agent", Icon: Bot },
            { id: "computer", label: "Computer", Icon: Monitor },
            { id: "skill", label: "Skill", Icon: Sparkles },
            { id: "team", label: "Team", Icon: Users },
            { id: "organization", label: "Organization", Icon: Building2 },
          ];
          return React.createElement(PlatformButtonSelector, {
            mode: "popup",
            buttonVariant: "primary",
            buttonSize: "small",
            label: "New",
            leading: React.createElement(Plus, {
              width: 14,
              height: 14,
              strokeWidth: 1.8,
              "aria-hidden": "true",
            }),
            popupAriaLabel: "Create new",
            popupAlignment: "right",
            popupRole: "menu",
            popupVariant: "minimal",
            popupWidth: 200,
            popupClassName: "configure-home-create-menu",
          },
            createTargets.map(({ id, label, Icon }) => React.createElement("button", {
              key: id,
              type: "button",
              role: "menuitem",
              className: "tb-popup-row",
              onClick: () => openConfigureHomeCreateTarget(id),
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

        function renderConfigureHomeNav() {
          const isNotificationsPage = configureHomeTab === "notifications";
          return renderAppHeader({
            className: "playground-configure-navbar",
            pathItems: [
              { label: "Configure" },
              { label: isNotificationsPage ? "Notifications" : "Overview" },
            ],
            includeSearchDivider: true,
            extraActions: isNotificationsPage ? null : renderConfigureHomeCreateSelector(),
          });
        }
`;
