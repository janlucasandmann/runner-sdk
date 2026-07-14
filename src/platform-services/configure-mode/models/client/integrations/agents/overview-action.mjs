export const MODELS_AGENT_OVERVIEW_ACTION_SCRIPT = `              React.createElement("button", {
                type: "button",
                role: "menuitem",
                className: "tb-popup-row",
                onClick: () => {
                  setAgentsOverviewActionsMenuOpen(false);
                  if (typeof onOpenModelsPage === "function") {
                    onOpenModelsPage();
                  }
                },
              },
                React.createElement(Brain, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Models")
                )
              ),
`;
