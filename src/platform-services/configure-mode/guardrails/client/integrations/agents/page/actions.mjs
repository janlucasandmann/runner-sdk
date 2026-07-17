export const GUARDRAILS_AGENT_PAGE_ACTIONS_SCRIPT = `          function renderAgentGuardrailImportMenuContent() {
            return importableAgentGuardrailSets.length === 0
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
                      role: "menuitem",
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
                });
          }
          function renderAgentGuardrailTable() {
            return React.createElement(PlatformDataTable, {
              rows: filteredAgentGuardrailSets,
              getRowId: (set) => set.id,
              ariaLabel: "Agent guardrails",
              className: "playground-agent-guardrails-platform-table",
              surface: "plain",
              variant: "minimalistic-ui",
              sticky: false,
              sorting: {
                defaultValue: { id: "updated", direction: "desc" },
              },
              toolbar: {
                title: "Guardrails",
                search: {
                  value: agentGuardrailSearchQuery,
                  onChange: setAgentGuardrailSearchQuery,
                  placeholder: "Search guardrails",
                  ariaLabel: "Search agent guardrails",
                  getSearchText: getAgentGuardrailSearchText,
                },
                filters: [
                  {
                    id: "prompts",
                    label: "Prompts",
                    value: agentGuardrailFilterMode,
                    options: [
                      { id: "all", label: "All Guardrails", description: "Show every guardrail imported on this agent" },
                      { id: "with-prompts", label: "With Prompts", description: "Only show guardrails containing prompts" },
                      { id: "without-prompts", label: "Without Prompts", description: "Only show guardrails without prompts" },
                    ],
                    onChange: setAgentGuardrailFilterMode,
                  },
                ],
                controlsLeading: React.createElement(PlatformPopup, {
                    open: agentGuardrailImportPopoverOpen,
                    rootClassName: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell playground-agents-detail-guardrail-import-shell",
                    surfaceClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-agents-detail-guardrail-import-menu",
                    surfaceProps: {
                      role: "menu",
                      "aria-label": "Available guardrails",
                    },
                    animation: "down-in",
                    portal: true,
                    placement: "bottom-start",
                    portalOffset: 6,
                    trigger: React.createElement(PlatformSecondaryButton, {
                      size: "small",
                      type: "button",
                      onClick: () => setAgentGuardrailImportPopoverOpen((current) => !current),
                      disabled: Boolean(isDefaultAgentConfigurationLocked),
                      title: "Add guardrail",
                      "aria-label": "Add guardrail",
                      "aria-haspopup": "menu",
                      "aria-expanded": agentGuardrailImportPopoverOpen ? "true" : "false",
                    },
                      React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Add Guardrail")
                    ),
                  },
                  renderAgentGuardrailImportMenuContent()
                ),
              },
              emptyState: agentGuardrailFilterMode === "all"
                ? "No guardrails imported yet."
                : "No guardrails match this prompt filter.",
              noResultsState: "No matching guardrails on this agent.",
              columns: [
                {
                  id: "name",
                  header: "Name",
                  accessor: (set) => set.name || "Untitled Guardrail Set",
                  sortable: true,
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
                  sortable: true,
                  sortDescFirst: true,
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
                  sortable: true,
                  width: "minmax(180px, 1.5fr)",
                  hideBelow: 720,
                },
                {
                  id: "updated",
                  header: "Updated",
                  accessor: (set) => set.updatedAt || set.createdAt || "",
                  sortable: true,
                  sortDescFirst: true,
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
