export function createModelsAppTopNavigationScript({ pricingUrl = "", developersUrl = "" } = {}) {
  return `        function openModelsLandingPage(url) {
          if (typeof window === "undefined") return;
          const destination = String(url || "").trim();
          if (!destination) return;
          const openedWindow = window.open(destination, "_blank", "noopener,noreferrer");
          if (openedWindow) openedWindow.opener = null;
        }

        function renderModelsPageActionsMenu() {
          return renderPlaygroundPlatformPopup({
            open: modelsPageActionsMenuOpen,
            shellRef: modelsPageActionsMenuRef,
            shellClassName: "playground-agents-overview-topnav-actions-shell playground-models-topnav-actions-shell",
            menuClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
            trigger: React.createElement("button", {
              type: "button",
              className: "playground-files-header-icon-button is-plain" + (modelsPageActionsMenuOpen ? " is-active" : ""),
              title: "Model resources",
              "aria-label": "Model resources",
              "aria-haspopup": "menu",
              "aria-expanded": modelsPageActionsMenuOpen ? "true" : "false",
              onClick: () => setModelsPageActionsMenuOpen((current) => !current),
            }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
            menuProps: {
              role: "menu",
              onClick: (event) => event.stopPropagation(),
            },
            children: React.createElement(React.Fragment, null,
              React.createElement("button", {
                type: "button",
                role: "menuitem",
                className: "tb-popup-row",
                onClick: () => {
                  setModelsPageActionsMenuOpen(false);
                  openModelsLandingPage(${JSON.stringify(pricingUrl)});
                },
              },
                React.createElement(Coins, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Pricing")
                )
              ),
              React.createElement("button", {
                type: "button",
                role: "menuitem",
                className: "tb-popup-row",
                onClick: () => {
                  setModelsPageActionsMenuOpen(false);
                  openModelsLandingPage(${JSON.stringify(developersUrl)});
                },
              },
                React.createElement(BookOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Documentation")
                )
              )
            ),
          });
        }

        function renderModelsPageNav() {
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: [{ label: "Configure" }, { label: "Models" }],
            extraActions: renderModelsPageActionsMenu(),
            includeSearchDivider: true,
          });
        }

`;
}
