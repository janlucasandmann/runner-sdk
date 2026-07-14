export const FINE_TUNING_PAGE_CONTROLLER_DETAIL_SCRIPT = String.raw`        function renderKpiCard(job) {
          const hasAfter = hasPlaygroundFineTuningAfterResult(job);
          const afterScore = hasAfter ? job.afterScore : job.beforeScore;
          const improvement = hasAfter ? Math.max(0, afterScore - job.beforeScore) : 0;
          const metrics = [
            { id: "before", label: "Before", value: formatPlaygroundFineTuningPercent(job.beforeScore) },
            { id: "after", label: "After", value: hasAfter ? formatPlaygroundFineTuningPercent(job.afterScore) : "Pending" },
            { id: "improvement", label: "Improvement", value: hasAfter ? "+" + Math.round(improvement * 100) : "Not run" },
            { id: "cost", label: "Cost", value: formatPlaygroundFineTuningUsdCost(job.costUsd) },
          ];
          const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job.targetAgentId || job.agentId)) || null;
          const agentName = normalizePlaygroundFineTuningString(job.agentName || job.targetAgentName || agent?.name || agent?.label || agent?.title || "Agent");
          const agentPhotoUrl = normalizePlaygroundFineTuningString(job.agentPhotoUrl || job.targetAgentPhotoUrl || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL);
          const computerName = normalizePlaygroundFineTuningString(job.environmentName || "Computer");
          const threadId = normalizePlaygroundFineTuningString(job.threadId);
          const handleDownload = () => {
            if (typeof document === "undefined") return;
            const canvas = document.querySelector(".playground-fine-tuning-progress-combo-canvas");
            if (!canvas || typeof canvas.toDataURL !== "function") return;
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "fine-tuning-analytics.png";
            link.click();
          };
          return React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card playground-fine-tuning-kpi-card" },
            React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
              React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Analytics"),
              React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-progress-combo-download",
                  onClick: handleDownload,
                  title: "Download chart",
                  "aria-label": "Download fine-tuning analytics chart",
                }, React.createElement(Download, { width: 15, height: 15, strokeWidth: 1.8 }))
              )
            ),
            React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
              metrics.map((item) =>
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
              React.createElement(PlaygroundFineTuningPerformanceChart, { job })
            ),
            React.createElement("div", { className: "playground-fine-tuning-analytics-footer" },
              React.createElement("div", { className: "playground-fine-tuning-analytics-agent", title: agentName + " on " + computerName },
                React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
                  agentPhotoUrl
                    ? React.createElement("img", { src: agentPhotoUrl, alt: "" })
                    : getPlaygroundFineTuningInitials(agentName)
                ),
                React.createElement("span", { className: "playground-fine-tuning-analytics-agent-main" }, agentName),
                React.createElement("span", { className: "playground-fine-tuning-analytics-agent-meta" }, "on " + computerName)
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-fine-tuning-thread-link",
                onClick: () => {
                  if (threadId && typeof onOpenThread === "function") onOpenThread(threadId);
                },
                disabled: !threadId || typeof onOpenThread !== "function",
                title: threadId || "Fine-tune thread is not available yet",
              }, threadId || "Thread pending")
            )
          );
        }

        function renderJobDetails(job) {
          const version = job.createdAgentVersion || {};
          const versionStatus = normalizePlaygroundFineTuningString(job.agentVersionCreationStatus || version.status || "pending").toLowerCase();
          const versionStatusLabel = versionStatus === "saved"
            ? "Version saved"
            : versionStatus === "pending" || versionStatus === "running"
              ? "Creating version"
              : versionStatus === "error"
                ? "Version failed"
                : "Version pending";
          const versionValue = version.version
            ? "Version " + version.version
            : versionStatus === "saved"
              ? "Saved"
              : versionStatus === "error"
                ? "Failed"
                : "Pending";
          const versionError = normalizePlaygroundFineTuningString(job.agentVersionError || version.error);
          const facts = [
            ["Agent", job.agentName],
            ["Computer", job.environmentName],
            ["Thread", job.threadId || "-"],
            ["Version", versionValue],
            ["Status", versionStatusLabel],
            ["Created", formatPlaygroundFineTuningDateTime(job.createdAt)],
          ];
          if (versionError) {
            facts.push(["Version Error", versionError]);
          }
          const factRows = facts.map(([label, value]) => ({ id: label, label, value }));
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Job Details")
              )
            ),
            React.createElement(PlatformDataTable, {
              rows: factRows,
              getRowId: (fact) => fact.id,
              ariaLabel: "Fine-tuning job details",
              className: "playground-fine-tuning-detail-platform-table",
              surface: "plain",
              sticky: false,
              rowMinHeight: 46,
              columns: [
                { id: "field", header: "Field", accessor: "label", width: "minmax(130px, 0.42fr)" },
                {
                  id: "value",
                  header: "Value",
                  accessor: "value",
                  width: "minmax(180px, 1fr)",
                  cell: ({ row: fact }) => fact.label === "Thread" && job.threadId && typeof onOpenThread === "function"
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-fine-tuning-reference-link",
                        onClick: () => onOpenThread(job.threadId),
                        title: job.threadId,
                      }, job.threadId)
                    : fact.value,
                },
              ],
            })
          );
        }

        function renderEvaluationRunReferences(job) {
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Evaluation Runs")
              )
            ),
            React.createElement(PlatformDataTable, {
              rows: job.evaluationRuns,
              getRowId: (reference) => reference.evaluationSetId,
              ariaLabel: "Fine-tuning evaluation runs",
              className: "playground-fine-tuning-reference-platform-table",
              surface: "plain",
              sticky: false,
              rowMinHeight: 46,
              emptyState: "No evaluation runs captured.",
              columns: [
                {
                  id: "evaluation",
                  header: "Evaluation",
                  accessor: (reference) => reference.evaluationSetName || "",
                  width: "minmax(170px, 1fr)",
                  cell: ({ row: reference }) => React.createElement("span", { title: reference.evaluationSetName }, reference.evaluationSetName),
                },
                {
                  id: "before",
                  header: "Before",
                  accessor: (reference) => reference.beforeRunLabel || reference.beforeRunId || "",
                  width: "minmax(120px, 0.75fr)",
                  cell: ({ row: reference }) => reference.beforeRunId && typeof onOpenEvaluationRun === "function"
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-fine-tuning-reference-link",
                        onClick: () => onOpenEvaluationRun(reference.evaluationSetId, reference.beforeRunId, {
                          page: "fine-tuning",
                          fineTuneJobId: job.id,
                        }),
                      }, reference.beforeRunLabel || reference.beforeRunId)
                    : React.createElement("span", { className: "playground-guardrails-table-muted" }, reference.beforeRunLabel || "-"),
                },
                {
                  id: "after",
                  header: "After",
                  accessor: (reference) => reference.afterRunLabel || reference.afterRunId || "",
                  width: "minmax(120px, 0.75fr)",
                  cell: ({ row: reference }) => reference.afterRunId && typeof onOpenEvaluationRun === "function"
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-fine-tuning-reference-link",
                        onClick: () => onOpenEvaluationRun(reference.evaluationSetId, reference.afterRunId, {
                          page: "fine-tuning",
                          fineTuneJobId: job.id,
                        }),
                      }, reference.afterRunLabel || reference.afterRunId)
                    : React.createElement("span", { className: "playground-guardrails-table-muted" }, reference.status === "not_run" ? "Not run" : (reference.afterRunLabel || "-")),
                },
                {
                  id: "delta",
                  header: "Delta",
                  accessor: (reference) => Number(reference.afterScore || 0) - Number(reference.beforeScore || 0),
                  width: "minmax(90px, 0.5fr)",
                  align: "end",
                  cell: ({ row: reference }) => !hasPlaygroundFineTuningAfterResult({ status: job.status, evaluationRuns: [reference] })
                    ? "-"
                    : "+" + Math.max(0, Math.round((reference.afterScore - reference.beforeScore) * 100)) + " pts",
                },
              ],
            })
          );
        }

        function renderFineTuningDetailTabs() {
          const tabs = [
            { id: "analysis", label: "Analysis" },
            { id: "changes", label: "Agent Changes" },
          ];
          return React.createElement("div", { className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-evaluations-detail-tabs playground-fine-tuning-detail-tabs", role: "tablist", "aria-label": "Fine-tuning details tabs" },
            React.createElement("div", { className: "playground-project-overview-chart-tabs" },
              tabs.map((tab) =>
                React.createElement("button", {
                  key: tab.id,
                  type: "button",
                  role: "tab",
                  "aria-selected": fineTuningDetailTab === tab.id ? "true" : "false",
                  className: "playground-project-overview-chart-tab" + (fineTuningDetailTab === tab.id ? " is-active" : ""),
                  onClick: () => setFineTuningDetailTab(tab.id),
                }, tab.label)
              )
            )
          );
        }

        function renderAnalysis(analysisSummary) {
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section playground-fine-tuning-analysis-section playground-fine-tuning-tab-panel",
            },
            analysisSummary
              ? (
                  typeof PlaygroundTaskDescriptionMarkdown === "function"
                    ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: analysisSummary,
                        className: "playground-fine-tuning-analysis-content tb-message-markdown",
                      })
                    : React.createElement("div", { className: "playground-fine-tuning-analysis-content tb-message-markdown" }, analysisSummary)
                )
              : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No analysis captured.")
          );
        }

        function renderDiff(job, options = {}) {
          const files = buildPlaygroundFineTuningDiffFiles(job);
          const showHeader = options.showHeader !== false;
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section playground-fine-tuning-tab-panel",
            },
            showHeader
              ? React.createElement("div", { className: "playground-plugins-section-header" },
                  React.createElement("div", { className: "playground-plugins-section-copy" },
                    React.createElement("h3", { className: "playground-plugins-section-title" }, "Agent Changes")
                  )
                )
              : null,
            files.length
              ? React.createElement("div", { className: "playground-fine-tuning-diff-list" },
                  files.map((file) =>
                    React.createElement("div", { key: file.id || file.filePath, className: "playground-version-changes-file-card" },
                      React.createElement(RunnerFileDiffSurface, {
                        filePath: file.filePath,
                        diffContent: file.diffContent || "",
                        fileContent: file.fileContent || file.afterContent || "",
                        additions: file.additions,
                        deletions: file.deletions,
                        emptyMessage: "No diff is available for this file.",
                      })
                    )
                  )
                )
              : React.createElement("div", { className: "playground-version-changes-empty" }, "No changes captured.")
          );
        }

        function renderDetail() {
          if (!selectedJob) {
            return renderOverview();
          }
          const job = normalizePlaygroundFineTuningJob(selectedJob);
          const analysisSummary = sanitizePlaygroundFineTuningAnalysisSummary(job.analysisSummary);
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail playground-fine-tuning-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              renderKpiCard(job),
              renderEvaluationRunReferences(job),
              renderFineTuningDetailTabs(),
              fineTuningDetailTab === "changes"
                ? renderDiff(job, { showHeader: false })
                : renderAnalysis(analysisSummary)
            )
          );
        }

`;

