export const EVALUATIONS_PAGE_CONTROLLER_TABLES_SCRIPT = String.raw`        function renderAnalyticsCard(set, run) {
          const normalizedSetRuns = Array.isArray(set?.runs)
            ? set.runs.map((item, index) => normalizePlaygroundEvaluationRun(item, index))
            : [];
          const latestRun = run
            ? normalizePlaygroundEvaluationRun(run)
            : normalizedSetRuns[0] || null;
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
          const now = Date.now();
          const timeframeWindow = evaluationAnalyticsTimeframe === "day"
            ? 24 * 60 * 60 * 1000
            : evaluationAnalyticsTimeframe === "week"
              ? 7 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000;
          const chartRuns = normalizedSetRuns
            .slice()
            .reverse()
            .filter((item) => {
              if (run) return true;
              const timestamp = Date.parse(String(item.completedAt || item.updatedAt || item.createdAt || ""));
              return !Number.isFinite(timestamp) || now - timestamp <= timeframeWindow;
            });
          const runCases = Array.isArray(latestRun?.cases) ? latestRun.cases : [];
          const labels = run
            ? runCases.map((_caseItem, index) => "Case " + (index + 1))
            : chartRuns.map((item, index) => String(item.label || ("Run " + (index + 1))));
          const scoreValues = run
            ? runCases.map((caseItem) => Math.round(Math.max(0, Math.min(1, Number(caseItem.score || 0))) * 100))
            : chartRuns.map((item) => Math.round(Math.max(0, Math.min(1, Number(item.averageScore || 0))) * 100));
          const passRateValues = run
            ? runCases.map((caseItem, index) => {
                const completedCases = runCases.slice(0, index + 1).filter((candidate) => !isPlaygroundEvaluationCaseActive(candidate));
                const passedCases = completedCases.filter((candidate) => Number(candidate.score || 0) >= normalizePlaygroundEvaluationPassThreshold(latestRun?.passThreshold));
                return completedCases.length ? Math.round((passedCases.length / completedCases.length) * 100) : 0;
              })
            : chartRuns.map((item) => item.totalCount ? Math.round((Number(item.passedCount || 0) / item.totalCount) * 100) : 0);
          const hasRecordedChartData = run
            ? runCases.some((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem))
            : chartRuns.length > 0;
          const analytics = {
            ariaLabel: run ? "Evaluation run analytics" : "Evaluation analytics",
            metrics: values.map((item, index) => ({
              ...item,
              color: ["#8fc4ff", "#7657ff", "#7effff", "#9ff6ce"][index] || "#fff",
            })),
            labels,
            hasData: hasRecordedChartData,
            series: [
              {
                id: "score",
                label: run ? "Case score" : "Average score",
                values: scoreValues,
                color: "#8fc4ff",
                valueKind: "percent",
              },
              {
                id: "pass-rate",
                label: "Pass rate",
                values: passRateValues,
                color: "#4da3ff",
                valueKind: "percent",
              },
            ],
          };
          return React.createElement(PlatformAnalyticsSection, {
            variant: "default",
            title: "Analytics",
            analytics,
            className: "playground-evaluations-analytics-card",
            timeframe: run ? undefined : {
              value: evaluationAnalyticsTimeframe,
              options: [
                { value: "day", label: "24H" },
                { value: "week", label: "7D" },
                { value: "month", label: "30D" },
              ],
              onValueChange: setEvaluationAnalyticsTimeframe,
              ariaLabel: "Evaluation analytics time frame",
            },
          });
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
          const tableMode = evaluationRunsTableMode === "scores" ? "scores" : "runs";
          const filterOptions = [
            { id: "all", label: "All Runs", description: "Show every evaluation run" },
            { id: "running", label: "Running", description: "Only show active runs" },
            { id: "completed", label: "Completed", description: "Only show completed runs" },
            { id: "failed", label: "Failed", description: "Only show failed runs" },
          ];
          const filterMode = filterOptions.some((option) => option.id === evaluationRunsFilterMode) ? evaluationRunsFilterMode : "all";
          const normalizedSearch = String(evaluationRunsSearchQuery || "").trim().toLowerCase();
          const getRunTimestamp = (run) => Date.parse(String(run.completedAt || run.updatedAt || run.createdAt || "")) || 0;
          const getRunAgentLabel = (run) => {
            const agentId = String(run?.targetAgentId || set?.targetAgentId || "").trim();
            const agent = getPlaygroundEvaluationAgentRecord(agentOptions, agentId);
            return String(run?.targetAgentName || agent?.name || agent?.label || agent?.title || agentId || "Agent").trim();
          };
          const getRunEnvironmentIdentity = (run) => {
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
            const resourceId = isProject
              ? String(source.projectId || choice?.projectId || "").trim()
              : String(source.environmentId || choice?.environmentId || "").trim();
            const type = isProject ? "project" : "computer";
            return {
              type,
              label,
              key: type + ":" + (resourceId || label.toLowerCase()),
            };
          };
          const getRunEnvironmentLabel = (run) => getRunEnvironmentIdentity(run).label;
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
            });
          const allScoreRows = buildPlaygroundEvaluationScoreRows(runs, {
            targetAgentId: set?.targetAgentId || "",
            environmentType: set?.environmentType || "computer",
            environmentId: set?.environmentId || "",
            projectId: set?.projectId || "",
          }).map((row) => ({
            ...row,
            agentLabel: getRunAgentLabel(row.latestRun),
            environmentLabel: getRunEnvironmentLabel(row.latestRun),
          }));
          const scoreRows = allScoreRows
            .filter((row) => {
              if (!normalizedSearch) return true;
              return [
                row.agentLabel,
                row.environmentLabel,
                formatPlaygroundEvaluationPercent(row.latestScore),
                formatPlaygroundEvaluationPercent(row.averageScore),
                String(row.runCount),
                formatPlaygroundEvaluationDate(row.latestRun?.completedAt || row.latestRun?.createdAt),
              ].join(" ").toLowerCase().includes(normalizedSearch);
            });
          const tableRows = tableMode === "scores" ? scoreRows : filteredRuns;
          const hasFilters = Boolean(normalizedSearch || (tableMode === "runs" && filterMode !== "all"));
          const runHistoryUnavailable = runs.length === 0 && evaluationRunHistorySyncState.status === "error";
          const tableTabs = React.createElement(PlatformDetailTabBar, {
            ariaLabel: "Evaluation result views",
            value: tableMode,
            tabs: [
              { id: "runs", label: "Runs" },
              { id: "scores", label: "Scores" },
            ],
            onValueChange: (value) => {
              const nextMode = value === "scores" ? "scores" : "runs";
              setEvaluationRunsTableMode(nextMode);
              if (nextMode !== "runs") {
                setSelectedEvaluationRunIds(new Set());
              }
            },
            variant: "minimal",
            className: "playground-evaluations-runs-table-tabs",
          });
          const runColumns = [
            {
              id: "run",
              header: "Run",
              accessor: (run) => run.label || "Run",
              sortable: true,
              width: "minmax(170px, 1.5fr)",
              cell: ({ row: run }) => React.createElement("div", { className: "playground-plugin-row-title" }, run.label || "Run"),
            },
            {
              id: "agent",
              header: "Agent",
              accessor: getRunAgentLabel,
              sortable: true,
              width: "minmax(130px, 1fr)",
              cell: ({ row: run }) => renderRunAgentCell(run, set),
            },
            {
              id: "environment",
              header: "Environment",
              accessor: getRunEnvironmentLabel,
              sortable: true,
              width: "minmax(140px, 1.1fr)",
              hideBelow: 760,
              cell: ({ row: run }) => renderRunEnvironmentCell(run, set),
            },
            {
              id: "score",
              header: "Score",
              accessor: (run) => Number(run.averageScore || 0),
              sortable: true,
              width: "minmax(80px, 0.65fr)",
              cell: ({ row: run }) => {
                const status = String(run?.status || "").trim().toLowerCase();
                return status === "queued" || status === "running" ? "running" : formatPlaygroundEvaluationPercent(run.averageScore);
              },
            },
            { id: "cases", header: "Cases", accessor: (run) => Number(run.totalCount || 0), sortable: true, width: "minmax(70px, 0.55fr)", hideBelow: 680 },
            {
              id: "date",
              header: "Date",
              accessor: getRunTimestamp,
              sortable: true,
              sortDescFirst: true,
              width: "minmax(110px, 0.9fr)",
              align: "end",
              cell: ({ row: run }) => formatPlaygroundEvaluationDate(run.completedAt || run.createdAt),
            },
          ];
          const scoreColumns = [
            {
              id: "agent",
              header: "Agent",
              accessor: (row) => row.agentLabel,
              sortable: true,
              width: "minmax(190px, 1.35fr)",
              cell: ({ row }) => renderRunAgentCell(row.latestRun, set),
            },
            {
              id: "environment",
              header: "Environment",
              accessor: (row) => row.environmentLabel,
              sortable: true,
              width: "minmax(170px, 1.2fr)",
              cell: ({ row }) => renderRunEnvironmentCell(row.latestRun, set),
            },
            {
              id: "latestScore",
              header: "Latest Score",
              accessor: (row) => row.latestScore,
              sortable: true,
              sortDescFirst: true,
              width: "minmax(100px, 0.75fr)",
              cell: ({ row }) => formatPlaygroundEvaluationPercent(row.latestScore),
            },
            {
              id: "averageScore",
              header: "Avg Score",
              accessor: (row) => row.averageScore,
              sortable: true,
              sortDescFirst: true,
              width: "minmax(100px, 0.75fr)",
              cell: ({ row }) => formatPlaygroundEvaluationPercent(row.averageScore),
            },
            {
              id: "runs",
              header: "Runs",
              accessor: (row) => row.runCount,
              sortable: true,
              width: "minmax(70px, 0.5fr)",
            },
            {
              id: "date",
              header: "Date",
              accessor: (row) => row.latestTimestamp,
              sortable: true,
              sortDescFirst: true,
              width: "minmax(110px, 0.8fr)",
              align: "end",
              cell: ({ row }) => formatPlaygroundEvaluationDate(row.latestRun?.completedAt || row.latestRun?.createdAt),
            },
          ];
          const emptyState = runHistoryUnavailable
            ? React.createElement(PlatformEmptyState, {
                icon: ChartColumnIncreasing,
                title: "Run history is unavailable",
                description: "Existing evaluation runs could not be loaded. Your run history has not been cleared.",
                primaryAction: {
                  label: "Retry",
                  onClick: () => {
                    void reloadBackendEvaluationRunHistory(set?.id, { maxAttempts: 3 }).catch(() => {});
                  },
                },
              })
            : tableMode === "scores"
              ? allScoreRows.length > 0 && normalizedSearch
                ? React.createElement(PlatformEmptyState, {
                    icon: Search,
                    title: "No matching scores",
                    description: "Adjust the search to find an agent score.",
                  })
                : React.createElement(PlatformEmptyState, {
                    icon: ChartColumnIncreasing,
                    title: "No scores yet",
                    description: "Completed evaluation runs will appear here for comparison.",
                  })
              : runs.length > 0 && hasFilters
                ? React.createElement(PlatformEmptyState, {
                    icon: Search,
                    title: "No matching runs",
                    description: "Adjust the search or filter to find an evaluation run.",
                  })
                : React.createElement(PlatformEmptyState, {
                    icon: ChartColumnIncreasing,
                    title: "No evaluation runs yet",
                    description: "Run this evaluation to measure performance across its cases.",
                  });
          return React.createElement(PlatformDataTable, {
              key: "evaluation-results-" + tableMode,
              rows: tableRows,
              getRowId: (row) => row.id,
              ariaLabel: tableMode === "scores" ? "Evaluation scores" : "Evaluation runs",
              className: "playground-evaluation-runs-platform-table playground-evaluations-runs-section" + (tableMode === "scores" ? " is-scores-view" : ""),
              surface: "plain",
              variant: "minimalistic-ui",
              sticky: false,
              pagination: {},
              sorting: {
                defaultValue: tableMode === "scores"
                  ? { id: "latestScore", direction: "desc" }
                  : { id: "date", direction: "desc" },
              },
              selection: tableMode === "runs"
                ? {
                    enabled: true,
                    value: selectedEvaluationRunIds,
                    onChange: ({ selectedIds }) => setSelectedEvaluationRunIds(new Set(selectedIds)),
                    ariaLabel: (run) => "Select " + (run.label || "evaluation run"),
                  }
                : undefined,
              emptyState,
              toolbar: {
                leading: tableTabs,
                search: {
                  value: evaluationRunsSearchQuery || "",
                  onChange: (value) => {
                    if (typeof setEvaluationRunsSearchQuery === "function") setEvaluationRunsSearchQuery(value);
                  },
                  placeholder: tableMode === "scores" ? "Search scores" : "Search runs",
                  ariaLabel: tableMode === "scores" ? "Search evaluation scores" : "Search evaluation runs",
                  manual: true,
                },
                filters: tableMode === "runs"
                  ? [{
                      id: "run-status",
                      label: "Filter",
                      value: filterMode,
                      options: filterOptions,
                      onChange: (value) => {
                        if (typeof setEvaluationRunsFilterMode === "function") setEvaluationRunsFilterMode(value);
                      },
                    }]
                  : [],
              },
              columns: tableMode === "scores" ? scoreColumns : runColumns,
              onRowActivate: (row) => {
                const run = tableMode === "scores" ? row.latestRun : row;
                if (run?.id) openRunDetail(set.id, run.id);
              },
              getRowAriaLabel: (row) => tableMode === "scores"
                ? "Open latest evaluation run for " + row.agentLabel + " in " + row.environmentLabel
                : "Open evaluation run " + (row.label || "Run"),
              getRowActions: tableMode === "runs"
                ? (run, state) => {
                    const targetRuns = Array.isArray(state?.targetRows) && state.targetRows.length
                      ? state.targetRows
                      : [run];
                    if (targetRuns.length > 1) {
                      return [{
                        id: "delete-selected",
                        label: "Delete selected",
                        icon: Trash2,
                        danger: true,
                        onSelect: () => handleDeleteEvaluationRuns(set.id, targetRuns.map((targetRun) => targetRun.id)),
                      }];
                    }
                    return [
                      { id: "rename", label: "Rename", icon: SquarePen, onSelect: () => openEvaluationRunRenameDialog(set, run) },
                      { id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, onSelect: () => handleDeleteEvaluationRun(set.id, run.id) },
                    ];
                  }
                : undefined,
            });
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
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "small",
                  onClick: () => openEvaluationThreadCaseModal(set),
                }, React.createElement(MessageSquare, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "From Threads")),
                React.createElement(PlatformButtonSelector, {
                    mode: "split-action",
                    buttonVariant: "primary",
                    buttonSize: "small",
                    label: "Case",
                    leading: React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }),
                    actionAriaLabel: "Add case",
                    popupAriaLabel: "Case import options",
                    onAction: () => openNewEvaluationCaseEditor(set),
                    closeOnSelect: true,
                    popupAlignment: "right",
                    popupRole: "menu",
                    popupVariant: "minimal",
                    popupWidth: 230,
                    popupClassName: "playground-evaluations-case-import-menu",
                  },
                  React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "platform-data-table__menu-item",
                      onClick: openEvaluationJsonlFilePicker,
                    },
                    React.createElement(FileText, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Upload JSONL file")
                  ),
                  React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "platform-data-table__menu-item",
                      onClick: () => openEvaluationJsonlWorkspacePicker(set),
                    },
                    React.createElement(FolderOpen, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Upload from Workspace")
                  )
                )
              )
            ),
            React.createElement("input", {
              ref: evaluationJsonlFileInputRef,
              type: "file",
              accept: ".jsonl,application/x-ndjson,application/jsonl",
              multiple: true,
              hidden: true,
              onChange: (event) => {
                void handleEvaluationJsonlFiles(set.id, event.target.files);
                event.target.value = "";
              },
            }),
            evaluationJsonlFileImportError
              ? React.createElement("div", {
                  className: "playground-evaluations-case-import-feedback is-error",
                  role: "alert",
                }, evaluationJsonlFileImportError)
              : evaluationJsonlFileImportMessage
                ? React.createElement("div", {
                    className: "playground-evaluations-case-import-feedback",
                    role: "status",
                  }, evaluationJsonlFileImportMessage)
                : null,
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
		              : React.createElement(PlatformEmptyState, {
		                  icon: ListTodo,
		                  title: "No cases yet",
		                  description: "Add a case or refine an existing thread to build this evaluation dataset.",
		                })
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
              onClick: (event) => {
                event?.stopPropagation?.();
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
          const normalizedRunEvaluator = normalizePlaygroundEvaluationEvaluator(run?.evaluator);
          const runEvaluator = normalizedRunEvaluator.type === "agent" && !normalizedRunEvaluator.agentId
            ? normalizePlaygroundEvaluationEvaluator(set?.evaluator)
            : normalizedRunEvaluator;
          const runEvaluatorLabel = getPlaygroundEvaluationEvaluatorLabel(runEvaluator, agentOptions);
          const renderRunEvaluatorCell = () => renderEvaluationSetEvaluatorCell({
            evaluator: runEvaluator,
          });
          const filterOptions = [
            { id: "all", label: "All Cases", description: "Show every case" },
            { id: "running", label: "Running", description: "Only show active cases" },
            { id: "passed", label: "Passed", description: "Only show passed cases" },
            { id: "failed", label: "Failed", description: "Only show failed cases" },
            { id: "error", label: "Error", description: "Only show errored cases" },
          ];
          const filterMode = filterOptions.some((option) => option.id === evaluationCasesFilterMode) ? evaluationCasesFilterMode : "all";
          const normalizedSearch = String(evaluationCasesSearchQuery || "").trim().toLowerCase();
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
                runEvaluatorLabel,
                getCaseScoreLabel(caseItem),
                displayStatus,
                caseItem.input || "",
                caseItem.expectedOutput || "",
                caseItem.actualOutput || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedSearch);
            });
          const visibleCount = Math.max(5, Number(evaluationCasesVisibleCount) || 10);
          const visibleCaseRecords = filteredCaseRecords.slice(0, visibleCount);
          const hasMoreCases = filteredCaseRecords.length > visibleCaseRecords.length;
          const hasFilters = Boolean(normalizedSearch || filterMode !== "all");
          const caseColumns = [
            {
              id: "thread",
              header: "Thread",
              accessor: (caseItem) => caseItem.threadId || "",
              sortable: true,
              width: "minmax(160px, 1.2fr)",
              cell: ({ row: caseItem }) => renderEvaluationThreadButton(caseItem.threadId, caseItem.threadId),
            },
            {
              id: "evaluator",
              header: "Evaluator",
              accessor: () => runEvaluatorLabel,
              sortable: true,
              width: "minmax(160px, 1.2fr)",
              hideBelow: 700,
              cell: () => renderRunEvaluatorCell(),
            },
            {
              id: "score",
              header: "Score",
              accessor: (caseItem) => Number(caseItem.score || 0),
              sortable: true,
              sortDescFirst: true,
              width: "minmax(72px, 0.45fr)",
              cell: ({ row: caseItem }) => getCaseScoreLabel(caseItem),
            },
            {
              id: "status",
              header: "Status",
              accessor: getCaseDisplayStatus,
              sortable: true,
              width: "minmax(90px, 0.55fr)",
              cell: ({ row: caseItem }) => {
                const displayStatus = getCaseDisplayStatus(caseItem);
                const statusVariant = displayStatus === "passed"
                  ? "green"
                  : displayStatus === "error"
                    ? "red"
                    : isPlaygroundEvaluationCaseActive(caseItem)
                      ? "blue"
                      : "gray";
                return React.createElement(PlatformLabel, {
                  variant: statusVariant,
                }, displayStatus.replace(/_/g, " "));
              },
            },
          ];
          return React.createElement(PlatformDataTable, {
            rows: visibleCaseRecords.map((record) => record.caseItem),
            columns: caseColumns,
            getRowId: (caseItem) => caseItem.id,
            ariaLabel: "Evaluation cases",
            className: "playground-evaluation-cases-platform-table playground-evaluations-cases-section",
            surface: "plain",
            variant: "minimalistic-ui",
            sticky: false,
            pagination: false,
            emptyState: hasFilters
              ? React.createElement(PlatformEmptyState, {
                  icon: Search,
                  title: "No matching cases",
                  description: "Adjust the search or filter to find an evaluation case.",
                })
              : React.createElement(PlatformEmptyState, {
                  icon: ChartColumnIncreasing,
                  title: "No evaluation cases yet",
                  description: "Cases will appear here as this evaluation run progresses.",
                }),
            toolbar: {
              title: "Cases",
              search: {
                value: evaluationCasesSearchQuery || "",
                onChange: (value) => {
                  setEvaluationCasesSearchQuery(value);
                  setEvaluationCasesVisibleCount(10);
                },
                placeholder: "Search cases",
                ariaLabel: "Search evaluation cases",
                manual: true,
              },
              filters: [{
                id: "case-status",
                label: "Filter",
                value: filterMode,
                options: filterOptions,
                onChange: (value) => {
                  setEvaluationCasesFilterMode(value);
                  setEvaluationCasesVisibleCount(10);
                },
              }],
              trailing: hasMoreCases
                ? React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "small",
                    onClick: () => setEvaluationCasesVisibleCount((current) => Math.max(5, Number(current) || 10) + 10),
                  },
                    React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Show more")
                  )
                : null,
            },
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
          });
        }

`;
