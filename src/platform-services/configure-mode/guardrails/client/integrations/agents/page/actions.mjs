export const GUARDRAILS_AGENT_PAGE_ACTIONS_SCRIPT = `          function renderAgentGuardrailImportMenu() {
            return React.createElement(PlatformPopupSurface, {
                className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-agents-detail-guardrail-import-menu",
              },
              importableAgentGuardrailSets.length === 0
                ? React.createElement("div", { className: "tb-popup-empty-state" },
                    availableAgentGuardrailSets.length === 0
                      ? "Create guardrail sets in Configure > Guardrails first."
                      : "All guardrail sets are already on this agent."
                  )
                : importableAgentGuardrailSets.map((set) => {
                    const promptCount = Array.isArray(set.prompts) ? set.prompts.length : 0;
                    const promptLabel = promptCount + " " + (promptCount === 1 ? "prompt" : "prompts");
                    return React.createElement("button", {
                        key: set.id,
                        type: "button",
                        className: "tb-popup-row tb-popup-row-select",
                        onClick: () => {
                          toggleAgentGuardrailSet(set.id);
                          setAgentGuardrailImportPopoverOpen(false);
                        },
                      },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        React.createElement(Plus, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, set.name || "Untitled Guardrail Set"),
                        React.createElement("span", null, promptLabel)
                      )
                    );
                  })
            );
          }
          function renderAgentGuardrailTable() {
            return React.createElement(PlatformDataTable, {
              rows: visibleAgentGuardrailSets,
              getRowId: (set) => set.id,
              ariaLabel: "Agent guardrails",
              className: "playground-agent-guardrails-platform-table",
              surface: "plain",
              sticky: false,
              columns: [
                {
                  id: "name",
                  header: "Name",
                  accessor: (set) => set.name || "Untitled Guardrail Set",
                  width: "minmax(180px, 1.5fr)",
                  cell: ({ row: set }) => React.createElement("div", { className: "playground-agents-detail-guardrail-resource-title" },
                    React.createElement("span", { className: "playground-agents-detail-guardrail-icon", "aria-hidden": "true" },
                      React.createElement(Shield, { width: 10, height: 10, strokeWidth: 1.8 })
                    ),
                    React.createElement("div", { className: "playground-plugin-row-title" }, set.name || "Untitled Guardrail Set")
                  ),
                },
                {
                  id: "prompts",
                  header: "Prompts",
                  accessor: (set) => Array.isArray(set.prompts) ? set.prompts.length : 0,
                  width: "minmax(80px, 0.65fr)",
                  cell: ({ row: set }) => {
                    const count = Array.isArray(set.prompts) ? set.prompts.length : 0;
                    return count + " " + (count === 1 ? "prompt" : "prompts");
                  },
                },
                {
                  id: "description",
                  header: "Description",
                  accessor: (set) => String(set.description || "").trim() || "—",
                  width: "minmax(180px, 1.5fr)",
                  hideBelow: 720,
                },
                {
                  id: "updated",
                  header: "Updated",
                  accessor: (set) => set.updatedAt || set.createdAt || "",
                  width: "minmax(100px, 0.8fr)",
                  align: "end",
                  cell: ({ row: set }) => formatAgentGuardrailDate(set.updatedAt || set.createdAt),
                },
              ],
              getRowActions: (set) => [{
                id: "remove",
                label: "Remove guardrail",
                icon: X,
                danger: true,
                disabled: Boolean(isDefaultAgentConfigurationLocked),
                onSelect: () => toggleAgentGuardrailSet(set.id),
              }],
            });
          }
`;
