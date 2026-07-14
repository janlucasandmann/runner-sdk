export const EVALUATIONS_PAGE_CONTROLLER_VIEWS_SCRIPT = String.raw`        function renderOverview() {
          const sortOptions = [
            { id: "updated-desc", label: "Recently Updated", description: "Show newest evaluation activity first" },
            { id: "created-desc", label: "Newest Created", description: "Show newly created evaluations first" },
            { id: "creator-asc", label: "Creator (A-Z)", description: "Sort evaluations by creator" },
            { id: "cases-desc", label: "Most Cases", description: "Show largest datasets first" },
            { id: "name-asc", label: "Evaluation Name (A-Z)", description: "Sort evaluations alphabetically" },
          ];
          const filterOptions = [
            { id: "all", label: "All", description: "Show every evaluation set" },
            { id: "with-runs", label: "With Runs", description: "Only show evaluations with previous runs" },
            { id: "without-runs", label: "Without Runs", description: "Only show evaluations without runs" },
            { id: "empty", label: "Empty Dataset", description: "Only show evaluations with no cases" },
          ];
	          const sortMode = /^(?:name|evaluator|cases|creator|updated|created)-(?:asc|desc)$/.test(String(evaluationSetsSortMode || ""))
	            ? String(evaluationSetsSortMode)
	            : "updated-desc";
          const filterMode = filterOptions.some((option) => option.id === evaluationSetsFilterMode) ? evaluationSetsFilterMode : "all";
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const query = String(evaluationsSearchQuery || "").trim().toLowerCase();
          const getSetTimestamp = (set) => Date.parse(String(set.updatedAt || set.createdAt || "")) || 0;
          const getSetLatestRun = (set) => Array.isArray(set?.runs) && set.runs.length > 0 ? set.runs[0] : null;
          const getSetCreatorLabel = (set) => getPlaygroundEvaluationCreatorLabel(set?.creator || set?.createdBy || set?.created_by || "");
          const filteredSets = normalizedSets
            .filter((set) => {
              const runCount = Array.isArray(set?.runs) ? set.runs.length : 0;
              const caseCount = Array.isArray(set?.dataRows) ? set.dataRows.length : 0;
              if (filterMode === "with-runs" && runCount === 0) return false;
              if (filterMode === "without-runs" && runCount > 0) return false;
              if (filterMode === "empty" && caseCount > 0) return false;
              if (!query) return true;
              const latestRun = getSetLatestRun(set);
              const haystack = [
                set.name,
                set.description,
                getPlaygroundEvaluationEvaluatorLabel(set.evaluator, agentOptions),
                getSetCreatorLabel(set),
                String(caseCount),
                formatPlaygroundEvaluationDate(set.updatedAt || set.createdAt),
              ].join(" ").toLowerCase();
              return haystack.includes(query);
            })
	            .sort((left, right) => {
	              const direction = String(sortMode || "").endsWith("-asc") ? 1 : -1;
	              const sortKey = String(sortMode || "updated-desc").replace(/-(?:asc|desc)$/, "");
	              let comparison = 0;
	              if (sortKey === "name") comparison = String(left?.name || "").localeCompare(String(right?.name || ""));
	              else if (sortKey === "evaluator") comparison = getPlaygroundEvaluationEvaluatorLabel(left?.evaluator, agentOptions).localeCompare(getPlaygroundEvaluationEvaluatorLabel(right?.evaluator, agentOptions));
	              else if (sortKey === "creator") comparison = getSetCreatorLabel(left).localeCompare(getSetCreatorLabel(right));
	              else if (sortKey === "cases") comparison = (Array.isArray(left?.dataRows) ? left.dataRows.length : 0) - (Array.isArray(right?.dataRows) ? right.dataRows.length : 0);
	              else if (sortKey === "created") comparison = (Date.parse(String(left?.createdAt || "")) || 0) - (Date.parse(String(right?.createdAt || "")) || 0);
	              else comparison = getSetTimestamp(left) - getSetTimestamp(right);
	              if (comparison !== 0) return comparison * direction;
	              return String(left?.name || "").localeCompare(String(right?.name || ""));
	            });
          const visibleCount = Math.max(10, Number(evaluationSetsVisibleCount) || 10);
          const visibleSets = filteredSets.slice(0, visibleCount);
          const hasMoreSets = filteredSets.length > visibleSets.length;
          const hasFilters = Boolean(query || filterMode !== "all");
          const closeToolbarPopover = () => setEvaluationSetsToolbarPopover("");
          function renderToolbarOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description ? React.createElement("span", null, option.description) : null
              )
            );
          }
          const visibleEvaluationOverviewIds = visibleSets.map((set) => String(set?.id || "").trim()).filter(Boolean);
          const selectedVisibleEvaluationOverviewIds = visibleEvaluationOverviewIds.filter((setId) => selectedEvaluationOverviewIds.has(setId));
          const allVisibleEvaluationsSelected = visibleEvaluationOverviewIds.length > 0 && selectedVisibleEvaluationOverviewIds.length === visibleEvaluationOverviewIds.length;
	          const evaluationOverviewSortId = String(sortMode || "updated-desc").replace(/-(?:asc|desc)$/, "");
	          const evaluationOverviewSortDirection = String(sortMode || "").endsWith("-asc") ? "asc" : "desc";
	          const evaluationOverviewColumns = [
	            {
	              id: "name",
	              header: "Evaluation",
	              accessor: (set) => set?.name || "",
	              sortable: true,
	              width: "minmax(220px, 1.35fr)",
	              cell: ({ row: set }) => React.createElement("div", { className: "playground-plugin-row-title", title: set.description || set.name || "" }, set.name || "Untitled Evaluation"),
	            },
	            {
	              id: "evaluator",
	              header: "Evaluator",
	              accessor: (set) => getPlaygroundEvaluationEvaluatorLabel(set?.evaluator, agentOptions),
	              sortable: true,
	              width: "minmax(155px, 0.82fr)",
	              cell: ({ row: set }) => renderEvaluationSetEvaluatorCell(set),
	            },
	            {
	              id: "cases",
	              header: "Cases",
	              accessor: (set) => Array.isArray(set?.dataRows) ? set.dataRows.length : 0,
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(80px, 0.42fr)",
	              align: "end",
	              cell: ({ row: set }) => String(Array.isArray(set?.dataRows) ? set.dataRows.length : 0),
	            },
	            {
	              id: "creator",
	              header: "Creator",
	              accessor: getSetCreatorLabel,
	              sortable: true,
	              width: "minmax(150px, 0.78fr)",
	              hideBelow: 840,
	              cell: ({ row: set }) => renderEvaluationSetCreatorCell(set),
	            },
	            {
	              id: "updated",
	              header: "Updated",
	              accessor: getSetTimestamp,
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(120px, 0.62fr)",
	              align: "end",
	              hideBelow: 1020,
	              cell: ({ row: set }) => {
	                const dateLabel = formatPlaygroundEvaluationDate(set.updatedAt || set.createdAt);
	                return React.createElement("div", { className: "playground-agents-overview-table-value is-right", title: dateLabel }, dateLabel);
	              },
	            },
	          ];
	          const getEvaluationOverviewActions = (set) => [
	            { id: "rename", label: "Rename", icon: SquarePen, onSelect: () => openEvaluationRenameDialog(set) },
	            { id: "run", label: "Run", icon: Play, disabled: getEvaluationRunnableCaseCount(set) === 0, onSelect: () => openRunEvaluationModal(set.id) },
	            { id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, onSelect: () => handleDeleteEvaluation(set.id) },
	          ];
	          const evaluationsOverviewEmptyState = normalizedSets.length === 0
	            ? React.createElement("div", { className: "playground-guardrails-empty" },
	                React.createElement("div", { className: "playground-guardrails-empty-icon" }, React.createElement(ChartColumnIncreasing, { width: 18, height: 18, strokeWidth: 1.8 })),
	                React.createElement("div", { className: "playground-guardrails-empty-title" }, "No evaluations yet"),
	                React.createElement("button", {
	                  type: "button",
	                  className: "playground-files-library-new-button playground-guardrails-empty-button",
	                  onClick: openEvaluationCreateModal,
	                }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }), "New Evaluation")
	              )
	            : (hasFilters ? "No matching evaluations." : "No evaluations yet.");
	          const evaluationsOverviewDataTable = React.createElement(PlatformDataTable, {
	            rows: visibleSets,
	            columns: evaluationOverviewColumns,
	            getRowId: (set) => String(set?.id || ""),
	            ariaLabel: "Evaluations",
	            className: "playground-evaluations-platform-data-table",
	            surface: "plain",
	            sorting: {
	              value: { id: evaluationOverviewSortId, direction: evaluationOverviewSortDirection },
	              manual: true,
	              onChange: (nextSorting) => {
	                if (!nextSorting) return;
	                setEvaluationSetsSortMode(nextSorting.id + "-" + nextSorting.direction);
	                setEvaluationSetsVisibleCount(10);
	                setEvaluationSetsToolbarPopover("");
	              },
	            },
	            selection: {
	              enabled: true,
	              value: selectedEvaluationOverviewIds,
	              onChange: ({ selectedIds }) => setSelectedEvaluationOverviewIds(new Set(selectedIds)),
	              ariaLabel: (set) => "Select " + (set?.name || "evaluation"),
	            },
	            toolbar: {
	              search: {
	                value: evaluationsSearchQuery || "",
	                onChange: (value) => {
	                  if (typeof setEvaluationsSearchQuery === "function") setEvaluationsSearchQuery(value);
	                  setEvaluationSetsVisibleCount(10);
	                },
	                placeholder: "Search evaluations",
	                manual: true,
	              },
	              filters: [{ id: "runs", label: "Runs", value: filterMode, options: filterOptions, onChange: (value) => { setEvaluationSetsFilterMode(value); setEvaluationSetsVisibleCount(10); } }],
	              primaryAction: { label: "Evaluation", icon: Plus, onClick: openEvaluationCreateModal },
	            },
	            getRowActions: getEvaluationOverviewActions,
	            getRowAriaLabel: (set) => set?.name || "Evaluation",
	            onRowActivate: (set) => openSetDetail(set.id),
	            emptyState: evaluationsOverviewEmptyState,
	            footer: hasMoreSets
	              ? React.createElement("button", { type: "button", className: "playground-files-control-button is-bare", onClick: () => setEvaluationSetsVisibleCount((current) => current + 10) }, "Show more")
	              : null,
	          });
	          return React.createElement("div", { className: "playground-plugins-page playground-guardrails-layout playground-evaluations-overview-layout playground-team-overview-page playground-agents-overview-page playground-evaluations-overview-shell is-develop-configure-page" },
            React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-team-grid-table-section playground-evaluations-overview-section",
              },
	              evaluationsOverviewDataTable
	            )
          );
        }

        function renderDetail() {
          if (!activeSet) {
            return renderOverview();
          }
          const isDataTab = evaluationDetailTab === "data";
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              React.createElement("div", { className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-evaluations-detail-tabs", role: "tablist", "aria-label": "Evaluation details tabs" },
                React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                  [
                    { id: "general", label: "General" },
                    { id: "data", label: "Settings" },
                  ].map((tab) =>
                    React.createElement("button", {
                      key: tab.id,
                      type: "button",
                      role: "tab",
                      "aria-selected": evaluationDetailTab === tab.id ? "true" : "false",
                      className: "playground-project-overview-chart-tab" + (evaluationDetailTab === tab.id ? " is-active" : ""),
                      onClick: () => setEvaluationDetailTab(tab.id),
                    }, tab.label)
                  )
                )
              ),
              isDataTab
                ? React.createElement(React.Fragment, null,
	                    renderEvaluationGuidanceEditor(activeSet),
	                    renderDataTable(activeSet)
	                  )
                : React.createElement(React.Fragment, null,
                    renderAnalyticsCard(activeSet),
                    renderRunsTable(activeSet)
                  )
            )
          );
        }

        function renderRun() {
          if (!activeSet || !activeRun) {
            return renderDetail();
          }
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              renderAnalyticsCard(activeSet, activeRun),
              renderRunCasesTable(activeSet, activeRun)
            )
          );
        }

`;
