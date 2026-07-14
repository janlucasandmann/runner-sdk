export const GUARDRAILS_PAGE_TABLE_SCRIPT = `          const sortOptions = [
            { id: "updated", label: "Recently Updated", description: "Show newest guardrail activity first" },
            { id: "name", label: "Name", description: "Sort guardrail sets alphabetically" },
            { id: "type", label: "Type", description: "Group default and custom sets" },
            { id: "creator", label: "Creator", description: "Sort guardrail sets by creator" },
          ];
          const guardrailsSetFilterOptions = [
            { id: "all", label: "All Sets", description: "Show default and custom sets together" },
            { id: "default", label: "Default Sets", description: "Only show built-in guardrails" },
            { id: "custom", label: "Custom Sets", description: "Only show custom guardrails" },
          ];


          function renderGuardrailsTable() {
            const visibleGuardrailOverviewIds = filteredGuardrailSets.map((set) => String(set?.id || "").trim()).filter(Boolean);
            const selectedVisibleGuardrailOverviewIds = visibleGuardrailOverviewIds.filter((setId) => selectedGuardrailsOverviewIds.has(setId));
            const allVisibleGuardrailsSelected = visibleGuardrailOverviewIds.length > 0 && selectedVisibleGuardrailOverviewIds.length === visibleGuardrailOverviewIds.length;
	            const guardrailsOverviewColumns = [
	              {
	                id: "name",
	                header: "Set",
	                accessor: (set) => set?.name || "",
	                sortable: true,
	                width: "minmax(230px, 1.35fr)",
	                cell: ({ row: set }) => React.createElement("div", { className: "playground-agents-overview-name-title" }, set.name || "Untitled Guardrail Set"),
	              },
	              {
	                id: "type",
	                header: "Type",
	                accessor: (set) => isGuardrailSetReadonly(set) ? "Default" : "Custom",
	                sortable: true,
	                width: "minmax(105px, 0.56fr)",
	                cell: ({ row: set }) => {
	                  const isDefaultSet = isGuardrailSetReadonly(set);
	                  return React.createElement("span", { className: "playground-guardrails-kind-pill" + (isDefaultSet ? " is-default" : " is-custom") }, isDefaultSet ? "Default" : "Custom");
	                },
	              },
	              {
	                id: "creator",
	                header: "Creator",
	                accessor: getGuardrailCreatorLabel,
	                sortable: true,
	                width: "minmax(160px, 0.82fr)",
	                hideBelow: 760,
	                cell: ({ row: set }) => renderGuardrailCreatorCell(set),
	              },
	              {
	                id: "updated",
	                header: "Updated",
	                accessor: (set) => Date.parse(String(set?.updatedAt || set?.createdAt || "")) || 0,
	                sortable: true,
	                sortDescFirst: true,
	                width: "minmax(120px, 0.6fr)",
	                align: "end",
	                hideBelow: 920,
	                cell: ({ row: set }) => React.createElement("span", { className: "playground-guardrails-table-muted" }, formatGuardrailDate(set.updatedAt || set.createdAt)),
	              },
	            ];
	            const guardrailsOverviewDataTable = React.createElement(PlatformDataTable, {
	              rows: filteredGuardrailSets,
	              columns: guardrailsOverviewColumns,
	              getRowId: (set) => String(set?.id || ""),
	              ariaLabel: "Guardrail sets",
	              className: "playground-guardrails-platform-data-table",
	              surface: "plain",
	              sorting: {
	                value: { id: guardrailsSort, direction: guardrailsSortDirection === "desc" ? "desc" : "asc" },
	                manual: true,
	                onChange: (nextSorting) => {
	                  if (!nextSorting) return;
	                  setGuardrailsSort(nextSorting.id);
	                  setGuardrailsSortDirection(nextSorting.direction);
	                  setGuardrailsToolbarPopover("");
	                },
	              },
	              selection: {
	                enabled: true,
	                value: selectedGuardrailsOverviewIds,
	                onChange: ({ selectedIds }) => setSelectedGuardrailsOverviewIds(new Set(selectedIds)),
	                ariaLabel: (set) => "Select " + (set?.name || "guardrail set"),
	              },
	              toolbar: {
	                search: { value: guardrailsSearchQuery, onChange: setGuardrailsSearchQuery, placeholder: "Search guardrails", manual: true },
	                filters: [{ id: "type", label: "Type", value: guardrailsSetFilter, options: guardrailsSetFilterOptions, onChange: setGuardrailsSetFilter }],
	                primaryAction: { label: "New Set", icon: Plus, onClick: createGuardrailSet },
	              },
	              getRowActions: (set) => isGuardrailSetReadonly(set) ? [] : [
	                { id: "rename", label: "Rename", icon: SquarePen, onSelect: () => handleRenameGuardrailSet(set.id) },
	                { id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, onSelect: () => handleDeleteGuardrailSet(set.id) },
	              ],
	              getRowAriaLabel: (set) => set?.name || "Guardrail set",
	              onRowActivate: (set) => selectGuardrailSet(set.id),
	              emptyState: "No guardrails found.",
	            });
	            return React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-team-grid-table-section playground-guardrails-overview-table-section",
              },
	              guardrailsOverviewDataTable
	            );
          }

`;
