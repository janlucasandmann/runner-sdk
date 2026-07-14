export const EVALUATIONS_PAGE_CONTROLLER_TABLES_SCRIPT = String.raw`        function renderAnalyticsCard(set, run) {
          const normalizedSetRuns = Array.isArray(set?.runs)
            ? set.runs.map((item, index) => normalizePlaygroundEvaluationRun(item, index))
            : [];
          const latestRun = run
            ? normalizePlaygroundEvaluationRun(run)
            : normalizedSetRuns[0] || null;
          const runsForChart = run ? [latestRun] : normalizedSetRuns.slice().reverse();
          const runPassRate = latestRun && latestRun.totalCount ? Math.round((latestRun.passedCount / latestRun.totalCount) * 100) + "%" : "-";
          const setAnalytics = normalizedSetRuns.reduce((state, item) => {
            const cases = Array.isArray(item.cases) ? item.cases : [];
            const completedCases = cases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error");
            if (completedCases.length > 0) {
              state.scoreSum += completedCases.reduce((sum, caseItem) => sum + Math.max(0, Math.min(1, Number(caseItem.score || 0))), 0);
              state.caseCount += completedCases.length;
              state.passedCount += completedCases.filter((caseItem) => Number(caseItem.score || 0) >= normalizePlaygroundEvaluationPassThreshold(item.passThreshold)).length;
            } else if (item.totalCount > 0) {
              state.scoreSum += Math.max(0, Math.min(1, Number(item.averageScore || 0))) * item.totalCount;
              state.caseCount += item.totalCount;
              state.passedCount += Math.max(0, Number(item.passedCount || 0));
            }
            state.costUsd += normalizePlaygroundEvaluationUsdCost(item.costUsd);
            return state;
          }, { scoreSum: 0, caseCount: 0, passedCount: 0, costUsd: 0 });
          const setAverageScore = setAnalytics.caseCount > 0 ? setAnalytics.scoreSum / setAnalytics.caseCount : null;
          const setPassRate = setAnalytics.caseCount > 0 ? Math.round((setAnalytics.passedCount / setAnalytics.caseCount) * 100) + "%" : "-";
          const values = run
            ? [
                { id: "score", label: "Average Score", value: latestRun ? formatPlaygroundEvaluationPercent(latestRun.averageScore) : "-" },
                { id: "pass-rate", label: "Pass Rate", value: runPassRate },
                { id: "cases", label: "Cases", value: String(latestRun?.totalCount || latestRun?.cases?.length || 0) },
                { id: "cost", label: "Cost (USD)", value: formatPlaygroundEvaluationCostUsd(latestRun?.costUsd) },
              ]
            : [
                { id: "score", label: "Average Score", value: setAverageScore === null ? "-" : formatPlaygroundEvaluationPercent(setAverageScore) },
                { id: "pass-rate", label: "Pass Rate", value: setPassRate },
                { id: "runs", label: "Runs", value: String(normalizedSetRuns.length) },
                { id: "cost", label: "Cost (USD)", value: formatPlaygroundEvaluationCostUsd(setAnalytics.costUsd) },
              ];
          const handleDownload = () => {
            if (typeof document === "undefined") return;
            const canvas = document.querySelector(".playground-evaluations-progress-combo-canvas");
            if (!canvas || typeof canvas.toDataURL !== "function") return;
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "evaluation-analytics.png";
            link.click();
          };
          return React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card" },
            React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
              React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Analytics"),
              React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-progress-combo-download",
                  onClick: handleDownload,
                  title: "Download chart",
                  "aria-label": "Download evaluation analytics chart",
                }, React.createElement(Download, { width: 15, height: 15, strokeWidth: 1.8 }))
              )
            ),
            React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
              values.map((item) =>
                React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                  React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                    React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot is-" + item.id, "aria-hidden": "true" }),
                    React.createElement("span", null, item.label)
                  ),
                  React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                )
              )
            ),
            React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
              React.createElement(PlaygroundEvaluationPerformanceChart, { runs: runsForChart, run: run || null })
            )
          );
        }

        function renderRunAgentCell(run, set) {
          const agentId = String(run?.targetAgentId || set?.targetAgentId || "").trim();
          const agent = getPlaygroundEvaluationAgentRecord(agentOptions, agentId);
          const label = String(run?.targetAgentName || agent?.name || agent?.label || agent?.title || agentId || "Agent").trim();
          const photoUrl = String(run?.targetAgentPhotoUrl || getPlaygroundEvaluationAgentPhotoUrl(agent)).trim();
          return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: label },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              photoUrl
                ? React.createElement("img", { src: photoUrl, alt: "" })
                : getPlaygroundEvaluationInitials(label)
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, label)
          );
        }

        function renderEvaluationSetEvaluatorCell(set) {
          const evaluator = normalizePlaygroundEvaluationEvaluator(set?.evaluator);
          const label = getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions);
          if (evaluator.type !== "agent") {
            return React.createElement("span", { className: "playground-evaluations-run-cell-label", title: label }, label);
          }
          const agent = getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId);
          const resolvedLabel = String(agent?.name || agent?.label || agent?.title || label || evaluator.agentId || "Agent evaluator").trim();
          const photoUrl = getPlaygroundEvaluationAgentPhotoUrl(agent);
          return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: resolvedLabel },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              photoUrl
                ? React.createElement("img", { src: photoUrl, alt: "" })
                : getPlaygroundEvaluationInitials(resolvedLabel)
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, resolvedLabel)
          );
        }

        function renderEvaluationSetCreatorCell(set) {
          const explicitCreator = normalizePlaygroundEvaluationPersonIdentity(set?.creator || set?.createdBy || set?.created_by || {});
          const creator = explicitCreator.name || explicitCreator.email || explicitCreator.id || explicitCreator.userId
            ? explicitCreator
            : normalizePlaygroundEvaluationPersonIdentity({});
          const label = getPlaygroundEvaluationCreatorLabel(creator);
          if (!label) {
            return React.createElement("span", { className: "playground-evaluations-run-cell-label" }, "-");
          }
          return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: label },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              creator.avatarUrl
                ? React.createElement("img", { src: creator.avatarUrl, alt: "" })
                : getPlaygroundEvaluationInitials(label)
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, label)
          );
        }

        function renderRunEnvironmentCell(run, set) {
          const source = {
            environmentType: run?.environmentType || set?.environmentType || "computer",
            environmentId: run?.environmentId || set?.environmentId || "",
            projectId: run?.projectId || set?.projectId || "",
          };
          const choice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, source, defaultEnvironmentId);
          const isProject = String(run?.environmentType || source.environmentType || "").trim().toLowerCase() === "project" || choice?.type === "project";
          const label = isProject
            ? String(run?.projectName || choice?.projectName || choice?.name || source.projectId || "Project").trim()
            : String(run?.environmentName || choice?.environmentName || choice?.name || source.environmentId || "Computer").trim();
          const Icon = isProject ? Rocket : Monitor;
          return React.createElement("span", { className: "playground-evaluations-run-environment-cell", title: label },
            React.createElement("span", { className: "playground-evaluations-run-environment-icon", "aria-hidden": "true" },
              React.createElement(Icon, { width: 13, height: 13, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, label)
          );
        }

        function renderRunsTable(set) {
          const runs = Array.isArray(set?.runs) ? set.runs : [];
          const sortOptions = [
            { id: "recent-desc", label: "Recently Updated", description: "Show newest evaluation activity first" },
            { id: "created-desc", label: "Newest Created", description: "Show newly created runs first" },
            { id: "score-desc", label: "Highest Score", description: "Show best scoring runs first" },
            { id: "name-asc", label: "Run Name (A-Z)", description: "Sort runs alphabetically" },
          ];
          const filterOptions = [
            { id: "all", label: "All Runs", description: "Show every evaluation run" },
            { id: "running", label: "Running", description: "Only show active runs" },
            { id: "completed", label: "Completed", description: "Only show completed runs" },
            { id: "failed", label: "Failed", description: "Only show failed runs" },
          ];
          const sortMode = sortOptions.some((option) => option.id === evaluationRunsSortMode) ? evaluationRunsSortMode : "recent-desc";
          const filterMode = filterOptions.some((option) => option.id === evaluationRunsFilterMode) ? evaluationRunsFilterMode : "all";
          const normalizedSearch = String(evaluationRunsSearchQuery || "").trim().toLowerCase();
          const getRunTimestamp = (run) => Date.parse(String(run.completedAt || run.updatedAt || run.createdAt || "")) || 0;
          const getRunAgentLabel = (run) => {
            const agentId = String(run?.targetAgentId || set?.targetAgentId || "").trim();
            const agent = getPlaygroundEvaluationAgentRecord(agentOptions, agentId);
            return String(run?.targetAgentName || agent?.name || agent?.label || agent?.title || agentId || "Agent").trim();
          };
          const getRunEnvironmentLabel = (run) => {
            const source = {
              environmentType: run?.environmentType || set?.environmentType || "computer",
              environmentId: run?.environmentId || set?.environmentId || "",
              projectId: run?.projectId || set?.projectId || "",
            };
            const choice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, source, defaultEnvironmentId);
            const isProject = String(run?.environmentType || source.environmentType || "").trim().toLowerCase() === "project" || choice?.type === "project";
            return isProject
              ? String(run?.projectName || choice?.projectName || choice?.name || source.projectId || "Project").trim()
              : String(run?.environmentName || choice?.environmentName || choice?.name || source.environmentId || "Computer").trim();
          };
          const filteredRuns = runs
            .filter((run) => {
              const status = String(run?.status || "").trim().toLowerCase();
              if (filterMode === "running" && status !== "running") return false;
              if (filterMode === "completed" && status !== "completed") return false;
              if (filterMode === "failed" && status !== "failed") return false;
              if (!normalizedSearch) return true;
              const haystack = [
                run?.label || "",
                run?.id || "",
                getRunAgentLabel(run),
                getRunEnvironmentLabel(run),
                status,
                formatPlaygroundEvaluationPercent(run?.averageScore),
                String(run?.totalCount || 0),
                formatPlaygroundEvaluationDate(run?.completedAt || run?.createdAt),
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedSearch);
            })
            .sort((left, right) => {
              if (sortMode === "name-asc") {
                return String(left?.label || "").localeCompare(String(right?.label || ""));
              }
              if (sortMode === "created-desc") {
                return (Date.parse(String(right?.createdAt || "")) || 0) - (Date.parse(String(left?.createdAt || "")) || 0);
              }
              if (sortMode === "score-desc") {
                return Number(right?.averageScore || 0) - Number(left?.averageScore || 0);
              }
              return getRunTimestamp(right) - getRunTimestamp(left);
            });
          const visibleCount = Math.max(5, Number(evaluationRunsVisibleCount) || 5);
          const visibleRuns = filteredRuns.slice(0, visibleCount);
          const hasMoreRuns = filteredRuns.length > visibleRuns.length;
          const hasFilters = Boolean(normalizedSearch || filterMode !== "all");
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const closeToolbarPopover = () => {
            if (typeof setEvaluationRunsToolbarPopover === "function") {
              setEvaluationRunsToolbarPopover("");
            }
          };
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
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Runs")
              )
            ),
            React.createElement("div", { className: "playground-plugins-search-row" },
              React.createElement("div", { className: "playground-plugins-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: evaluationRunsSearchQuery || "",
                  onChange: (event) => {
                    if (typeof setEvaluationRunsSearchQuery === "function") setEvaluationRunsSearchQuery(event.target.value);
                    if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount(5);
                  },
                  className: "playground-plugins-search",
                  placeholder: "Search runs",
                  "aria-label": "Search evaluation runs",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (evaluationRunsToolbarPopover === "sort" || sortMode !== "recent-desc" ? " is-active" : ""),
                    onClick: () => {
                      if (typeof setEvaluationRunsToolbarPopover === "function") setEvaluationRunsToolbarPopover((current) => current === "sort" ? "" : "sort");
                    },
                    title: activeSortOption.label,
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  evaluationRunsToolbarPopover === "sort"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        sortOptions.map((option) => renderToolbarOption({
                          option,
                          active: sortMode === option.id,
                          onClick: () => {
                            if (typeof setEvaluationRunsSortMode === "function") setEvaluationRunsSortMode(option.id);
                            if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount(5);
                            closeToolbarPopover();
                          },
                        }))
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (evaluationRunsToolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                    onClick: () => {
                      if (typeof setEvaluationRunsToolbarPopover === "function") setEvaluationRunsToolbarPopover((current) => current === "filter" ? "" : "filter");
                    },
                    title: activeFilterOption.label,
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  evaluationRunsToolbarPopover === "filter"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        filterOptions.map((option) => renderToolbarOption({
                          option,
                          active: filterMode === option.id,
                          onClick: () => {
                            if (typeof setEvaluationRunsFilterMode === "function") setEvaluationRunsFilterMode(option.id);
                            if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount(5);
                            closeToolbarPopover();
                          },
                        }))
                      )
                    : null
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-toolbar-action",
                onClick: () => {
                  if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount((current) => Math.max(5, Number(current) || 5) + 10);
                },
                disabled: !hasMoreRuns,
                style: !hasMoreRuns ? { opacity: 0.5 } : undefined,
              },
                React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Show more")
              )
            ),
            React.createElement(PlatformDataTable, {
              rows: visibleRuns,
              getRowId: (run) => run.id,
              ariaLabel: "Evaluation runs",
              className: "playground-evaluation-runs-platform-table",
              surface: "plain",
              sticky: false,
              emptyState: runs.length > 0 && hasFilters ? "No matching evaluation runs." : "No runs yet.",
              columns: [
                {
                  id: "run",
                  header: "Run",
                  accessor: (run) => run.label || "Run",
                  width: "minmax(170px, 1.5fr)",
                  cell: ({ row: run }) => React.createElement("div", { className: "playground-plugin-row-title" }, run.label || "Run"),
                },
                {
                  id: "agent",
                  header: "Agent",
                  accessor: getRunAgentLabel,
                  width: "minmax(130px, 1fr)",
                  cell: ({ row: run }) => renderRunAgentCell(run, set),
                },
                {
                  id: "environment",
                  header: "Environment",
                  accessor: getRunEnvironmentLabel,
                  width: "minmax(140px, 1.1fr)",
                  hideBelow: 760,
                  cell: ({ row: run }) => renderRunEnvironmentCell(run, set),
                },
                {
                  id: "score",
                  header: "Score",
                  accessor: (run) => Number(run.averageScore || 0),
                  width: "minmax(80px, 0.65fr)",
                  cell: ({ row: run }) => {
                    const status = String(run?.status || "").trim().toLowerCase();
                    return status === "queued" || status === "running" ? "running" : formatPlaygroundEvaluationPercent(run.averageScore);
                  },
                },
                { id: "cases", header: "Cases", accessor: (run) => Number(run.totalCount || 0), width: "minmax(70px, 0.55fr)", hideBelow: 680 },
                {
                  id: "date",
                  header: "Date",
                  accessor: getRunTimestamp,
                  width: "minmax(110px, 0.9fr)",
                  align: "end",
                  cell: ({ row: run }) => formatPlaygroundEvaluationDate(run.completedAt || run.createdAt),
                },
              ],
              onRowActivate: (run) => openRunDetail(set.id, run.id),
              getRowAriaLabel: (run) => "Open evaluation run " + (run.label || "Run"),
              getRowActions: (run) => [
                { id: "rename", label: "Rename", icon: SquarePen, onSelect: () => openEvaluationRunRenameDialog(set, run) },
                { id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, onSelect: () => handleDeleteEvaluationRun(set.id, run.id) },
              ],
            })
          );
        }

        function renderDataTable(set) {
          const rows = Array.isArray(set?.dataRows) ? set.dataRows : [];
          const pendingRows = Array.isArray(evaluationPendingThreadCasesBySetId?.[set?.id])
            ? evaluationPendingThreadCasesBySetId[set.id]
            : [];
          const hasCaseRows = pendingRows.length > 0 || rows.length > 0;
          return React.createElement("section", { className: "playground-evaluations-cases-editor-section" },
            React.createElement("div", { className: "playground-evaluations-cases-editor-header" },
              React.createElement("h2", { className: "playground-evaluations-cases-title" }, "Cases"),
              React.createElement("div", { className: "playground-evaluations-cases-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                  onClick: () => openEvaluationThreadCaseModal(set),
                }, React.createElement(MessageSquare, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "From Threads")),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                  onClick: () => openNewEvaluationCaseEditor(set),
                }, React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "Case"))
              )
            ),
            hasCaseRows
              ? React.createElement("div", { className: "playground-evaluations-case-preview-list" },
                  pendingRows.map((pending) => {
                    const isError = pending.status === "error";
                    const title = String(pending.title || pending.threadId || "").trim();
                    const statusText = isError
                      ? (pending.error || pending.message || "Case creation failed")
                      : (pending.message || "Creating case from thread");
                    return React.createElement("div", {
                        key: pending.id,
                        className: "playground-tasks-backlog-item playground-project-overview-outcome-preview playground-evaluations-data-row-preview is-pending" + (isError ? " is-pending-error" : ""),
                        "aria-busy": isError ? undefined : "true",
                      },
                      React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                        React.createElement("div", { className: "playground-tasks-backlog-leading" },
                          React.createElement("span", { className: "playground-evaluations-pending-case-icon" + (isError ? " is-error" : ""), "aria-hidden": "true" },
                            isError
                              ? React.createElement(AlertCircle, { width: 13, height: 13, strokeWidth: 1.9 })
                              : React.createElement(Loader2, { className: "playground-evaluations-pending-case-spinner", width: 13, height: 13, strokeWidth: 1.9 })
                          ),
                          React.createElement("div", { className: "playground-tasks-backlog-main" },
                            React.createElement("span", { className: "playground-tasks-backlog-ticket" }, isError ? "Case failed" : "Creating case"),
                            React.createElement("span", {
                              className: "playground-tasks-backlog-title",
                              title: title || statusText,
                            }, title ? "Refining " + title : "Refining selected thread")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-backlog-meta" },
                          pending.threadId
                            ? React.createElement("span", {
                                className: "playground-evaluations-source-thread-pill",
                                title: pending.threadId,
                              },
                                React.createElement(MessageSquare, { width: 12, height: 12, strokeWidth: 1.8 }),
                                React.createElement("span", null, "Thread")
                              )
                            : null,
                          React.createElement("span", {
                            className: "playground-evaluations-pending-case-status" + (isError ? " is-error" : ""),
                            title: statusText,
                          }, isError ? "Failed" : "Creating")
                        )
                      )
                    );
                  }),
                  rows.map((row, index) => {
                    const caseNumber = String(index + 1).padStart(3, "0");
                    const inputText = String(row.input || "").trim();
                    const runCount = normalizePlaygroundEvaluationCaseRunCount(row.runCount);
                    return React.createElement("div", {
                        key: row.id,
                        className: "playground-tasks-backlog-item playground-project-overview-outcome-preview playground-evaluations-data-row-preview",
                        role: "button",
                        tabIndex: 0,
                        onClick: () => openEvaluationCaseEditor(set.id, row, index, false),
                        onKeyDown: (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openEvaluationCaseEditor(set.id, row, index, false);
                          }
                        },
                      },
                      React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                        React.createElement("div", { className: "playground-tasks-backlog-leading" },
                          React.createElement(PlaygroundEvaluationCaseRunRing, { runCount }),
                          React.createElement("div", { className: "playground-tasks-backlog-main" },
                            React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Case " + caseNumber),
                            React.createElement("span", {
                              className: "playground-tasks-backlog-title" + (inputText ? "" : " is-empty"),
                              title: inputText || "Empty input",
                            }, inputText || "Empty input")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-backlog-meta" },
                          row.sourceThreadId
                            ? React.createElement("span", {
                                className: "playground-evaluations-source-thread-pill",
                                title: row.sourceThreadTitle || row.sourceThreadId,
                              },
                                React.createElement(MessageSquare, { width: 12, height: 12, strokeWidth: 1.8 }),
                                React.createElement("span", null, "Thread")
                              )
                            : null,
                          React.createElement("button", {
                            type: "button",
                            className: "playground-evaluations-case-delete-button",
                            "aria-label": "Delete case " + caseNumber,
                            title: "Delete case",
                            onClick: (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              updateEvaluationSet(set.id, (current) => ({
                                ...current,
                                dataRows: current.dataRows.filter((item) => item.id !== row.id),
                              }));
                            },
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
                        )
                      )
                    );
                  })
                )
		              : React.createElement("div", { className: "playground-guardrails-empty" },
		                  React.createElement("div", { className: "playground-guardrails-empty-title" }, "No cases yet")
		                ),
            React.createElement("div", { className: "playground-tasks-attachments playground-evaluations-jsonl-imports" },
              React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" },
                  React.createElement("span", { className: "playground-evaluations-imports-title" },
                    React.createElement("span", null, "Imports"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-evaluations-imports-help",
                      "aria-label": "JSONL import format",
                      onClick: (event) => event.preventDefault(),
                    },
                      React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8 }),
                      React.createElement("span", {
                        className: "playground-evaluations-pass-threshold-tooltip playground-evaluations-imports-tooltip",
                        role: "tooltip",
                      },
                        "Upload .jsonl files with one JSON object per line. Each object should include input and expectedOutput, and can optionally include evaluatorGuidance and runCount."
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-attachments-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                    onClick: openEvaluationJsonlFilePicker,
                  }, "Upload from Computer")
                )
              ),
              React.createElement("input", {
                ref: evaluationJsonlFileInputRef,
                type: "file",
                accept: ".jsonl",
                multiple: true,
                hidden: true,
                onChange: (event) => {
                  void handleEvaluationJsonlFiles(set.id, event.target.files);
                  event.target.value = "";
                },
              }),
              React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                React.createElement("div", {
                  className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (evaluationJsonlFileDragging ? " dragging" : ""),
                  onDragOver: (event) => {
                    event.preventDefault();
                    setEvaluationJsonlFileDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) return;
                    setEvaluationJsonlFileDragging(false);
                  },
                  onDrop: (event) => {
                    event.preventDefault();
                    setEvaluationJsonlFileDragging(false);
                    void handleEvaluationJsonlFiles(set.id, event.dataTransfer.files);
                  },
                },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-attachments-empty-button",
                    onClick: openEvaluationJsonlFilePicker,
                  },
                    React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "tb-popup-dropzone-title" }, evaluationJsonlFileDragging ? "Drop JSONL files here" : "Drag & drop JSONL files here"),
                    React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                  )
                )
              ),
              evaluationJsonlFileImportMessage
                ? React.createElement("div", { className: "playground-tasks-attachments-status" }, evaluationJsonlFileImportMessage)
                : null,
              evaluationJsonlFileImportError
                ? React.createElement("div", { className: "playground-environments-error" }, evaluationJsonlFileImportError)
                : null
            )
		          );
        }

        function renderEvaluationThreadButton(threadId, label) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) {
            return React.createElement("span", { className: "playground-guardrails-table-muted" }, "-");
          }
          return React.createElement("button", {
              type: "button",
              className: "playground-evaluations-thread-link",
              onClick: () => {
                if (typeof onOpenThread === "function") {
                  onOpenThread(normalizedThreadId);
                }
              },
            },
            React.createElement(ArrowUpRight, { width: 12, height: 12, strokeWidth: 1.8 }),
            React.createElement("span", null, label || normalizedThreadId)
          );
        }

        function renderRunCasesTable(set, run) {
          const cases = Array.isArray(run?.cases) ? run.cases : [];
          const sortOptions = [
            { id: "case-asc", label: "Case Order", description: "Show cases in dataset order" },
            { id: "score-desc", label: "Highest Score", description: "Show strongest cases first" },
            { id: "score-asc", label: "Lowest Score", description: "Show weakest cases first" },
          ];
          const filterOptions = [
            { id: "all", label: "All Cases", description: "Show every case" },
            { id: "running", label: "Running", description: "Only show active cases" },
            { id: "passed", label: "Passed", description: "Only show passed cases" },
            { id: "failed", label: "Failed", description: "Only show failed cases" },
            { id: "error", label: "Error", description: "Only show errored cases" },
          ];
          const sortMode = sortOptions.some((option) => option.id === evaluationCasesSortMode) ? evaluationCasesSortMode : "case-asc";
          const filterMode = filterOptions.some((option) => option.id === evaluationCasesFilterMode) ? evaluationCasesFilterMode : "all";
          const normalizedSearch = String(evaluationCasesSearchQuery || "").trim().toLowerCase();
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const getCaseDisplayStatus = (caseItem) => getPlaygroundEvaluationCaseDisplayStatus(caseItem, run.passThreshold);
          const getCaseScoreLabel = (caseItem) => isPlaygroundEvaluationCaseActive(caseItem)
            ? String(caseItem.status || "").replace(/_/g, " ")
            : formatPlaygroundEvaluationPercent(caseItem.score);
          const filteredCaseRecords = cases
            .map((caseItem, index) => ({ caseItem, index }))
            .filter(({ caseItem }) => {
              const displayStatus = getCaseDisplayStatus(caseItem);
              if (filterMode === "running" && !isPlaygroundEvaluationCaseActive(caseItem)) return false;
              if (filterMode !== "all" && filterMode !== "running" && displayStatus !== filterMode) return false;
              if (!normalizedSearch) return true;
              const haystack = [
                caseItem.threadId || "",
                caseItem.evaluatorThreadId || "",
                getCaseScoreLabel(caseItem),
                displayStatus,
                caseItem.input || "",
                caseItem.expectedOutput || "",
                caseItem.actualOutput || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedSearch);
            })
            .sort((left, right) => {
              if (sortMode === "score-desc") {
                return Number(right.caseItem?.score || 0) - Number(left.caseItem?.score || 0);
              }
              if (sortMode === "score-asc") {
                return Number(left.caseItem?.score || 0) - Number(right.caseItem?.score || 0);
              }
              return left.index - right.index;
            });
          const visibleCount = Math.max(5, Number(evaluationCasesVisibleCount) || 10);
          const visibleCaseRecords = filteredCaseRecords.slice(0, visibleCount);
          const hasMoreCases = filteredCaseRecords.length > visibleCaseRecords.length;
          const hasFilters = Boolean(normalizedSearch || filterMode !== "all");
          const closeCasesToolbarPopover = () => setEvaluationCasesToolbarPopover("");
          function renderCasesToolbarOption({ option, active, onClick }) {
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
          const caseColumns = [
            {
              id: "thread",
              header: "Thread",
              accessor: (caseItem) => caseItem.threadId || "",
              width: "minmax(160px, 1.2fr)",
              cell: ({ row: caseItem }) => React.createElement("span", { title: caseItem.threadId || "" }, caseItem.threadId || "-"),
            },
            {
              id: "evaluator",
              header: "Evaluator",
              accessor: (caseItem) => caseItem.evaluatorThreadId || "",
              width: "minmax(160px, 1.2fr)",
              hideBelow: 700,
              cell: ({ row: caseItem }) => React.createElement("span", { title: caseItem.evaluatorThreadId || "" }, caseItem.evaluatorThreadId || "-"),
            },
            {
              id: "score",
              header: "Score",
              accessor: (caseItem) => Number(caseItem.score || 0),
              width: "minmax(72px, 0.45fr)",
              cell: ({ row: caseItem }) => getCaseScoreLabel(caseItem),
            },
            {
              id: "status",
              header: "Status",
              accessor: getCaseDisplayStatus,
              width: "minmax(90px, 0.55fr)",
              cell: ({ row: caseItem }) => {
                const displayStatus = getCaseDisplayStatus(caseItem);
                return React.createElement("span", {
                  className: "playground-evaluations-status-pill" + (displayStatus === "failed" || displayStatus === "error" ? " is-failed" : ""),
                }, displayStatus.replace(/_/g, " "));
              },
            },
          ];
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Cases")
              )
            ),
            React.createElement("div", { className: "playground-plugins-search-row" },
              React.createElement("div", { className: "playground-plugins-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: evaluationCasesSearchQuery || "",
                  onChange: (event) => {
                    setEvaluationCasesSearchQuery(event.target.value);
                    setEvaluationCasesVisibleCount(10);
                  },
                  className: "playground-plugins-search",
                  placeholder: "Search cases",
                  "aria-label": "Search evaluation cases",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (evaluationCasesToolbarPopover === "sort" || sortMode !== "case-asc" ? " is-active" : ""),
                    onClick: () => setEvaluationCasesToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    title: activeSortOption.label,
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  evaluationCasesToolbarPopover === "sort"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        sortOptions.map((option) => renderCasesToolbarOption({
                          option,
                          active: sortMode === option.id,
                          onClick: () => {
                            setEvaluationCasesSortMode(option.id);
                            setEvaluationCasesVisibleCount(10);
                            closeCasesToolbarPopover();
                          },
                        }))
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (evaluationCasesToolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                    onClick: () => setEvaluationCasesToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    title: activeFilterOption.label,
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  evaluationCasesToolbarPopover === "filter"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        filterOptions.map((option) => renderCasesToolbarOption({
                          option,
                          active: filterMode === option.id,
                          onClick: () => {
                            setEvaluationCasesFilterMode(option.id);
                            setEvaluationCasesVisibleCount(10);
                            closeCasesToolbarPopover();
                          },
                        }))
                      )
                    : null
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-toolbar-action",
                onClick: () => setEvaluationCasesVisibleCount((current) => Math.max(5, Number(current) || 10) + 10),
                disabled: !hasMoreCases,
                style: !hasMoreCases ? { opacity: 0.5 } : undefined,
              },
                React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Show more")
              )
            ),
            React.createElement(PlatformDataTable, {
              rows: visibleCaseRecords.map((record) => record.caseItem),
              columns: caseColumns,
              getRowId: (caseItem) => caseItem.id,
              ariaLabel: "Evaluation cases",
              className: "playground-evaluation-cases-platform-table",
              surface: "plain",
              sticky: false,
              emptyState: cases.length > 0 && hasFilters ? "No matching cases." : "No cases yet.",
              getRowActions: (caseItem) => [
                {
                  id: "open",
                  label: "Open",
                  icon: SquarePen,
                  onSelect: () => openCaseDetail(set.id, run.id, caseItem.id),
                },
                {
                  id: "delete",
                  label: "Delete",
                  icon: Trash2,
                  danger: true,
                  separatorBefore: true,
                  onSelect: () => deleteEvaluationRunCase(set.id, run.id, caseItem.id),
                },
              ],
              getRowAriaLabel: (caseItem) => caseItem.threadId || "Evaluation case",
              onRowActivate: (caseItem) => openCaseDetail(set.id, run.id, caseItem.id),
            })
          );
        }

`;

