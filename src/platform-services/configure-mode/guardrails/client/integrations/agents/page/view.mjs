export const GUARDRAILS_AGENT_PAGE_VIEW_SCRIPT = `          const agentGuardrailsSection = React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-guardrails-section",
              key: "guardrails",
              "data-section-id": "guardrails",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Guardrails")
              )
            ),
            React.createElement("div", { className: "playground-plugins-search-row" },
              React.createElement("div", { className: "playground-plugins-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: agentGuardrailSearchQuery,
                  onChange: (event) => setAgentGuardrailSearchQuery(event.target.value),
                  className: "playground-plugins-search",
                  placeholder: "Search guardrails",
                  "aria-label": "Search agent guardrails",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell playground-agents-detail-guardrail-import-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button playground-project-overview-toolbar-action",
                    onClick: () => setAgentGuardrailImportPopoverOpen((current) => !current),
                    disabled: Boolean(isDefaultAgentConfigurationLocked),
                    title: "Add guardrail",
                    "aria-label": "Add guardrail",
                  },
                    React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Add")
                  ),
                  agentGuardrailImportPopoverOpen ? renderAgentGuardrailImportMenu() : null
                )
              )
            ),
            visibleAgentGuardrailSets.length > 0
              ? renderAgentGuardrailTable()
              : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                  normalizedAgentGuardrailSearch
                    ? "No matching guardrails on this agent."
                    : "No guardrails imported yet."
                )
          );
`;
