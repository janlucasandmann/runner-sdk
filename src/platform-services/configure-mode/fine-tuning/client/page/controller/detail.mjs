export const FINE_TUNING_PAGE_CONTROLLER_DETAIL_SCRIPT = String.raw`        function renderKpiCard(job) {
          const hasAfter = hasPlaygroundFineTuningAfterResult(job);
          const afterScore = hasAfter ? job.afterScore : job.beforeScore;
          const improvement = hasAfter ? Math.max(0, afterScore - job.beforeScore) : 0;
          const analytics = {
            ariaLabel: "Fine-tuning performance analytics",
            metrics: [
              { id: "before", label: "Before", value: formatPlaygroundFineTuningPercent(job.beforeScore), color: "#8fc4ff" },
              { id: "after", label: "After", value: hasAfter ? formatPlaygroundFineTuningPercent(job.afterScore) : "Pending", color: "#4da3ff" },
              { id: "improvement", label: "Improvement", value: hasAfter ? "+" + Math.round(improvement * 100) + " pts" : "Not run", color: "#7657ff" },
              { id: "cost", label: "Cost", value: formatPlaygroundFineTuningUsdCost(job.costUsd), color: "#9ff6ce" },
            ],
            labels: ["Before", "After"],
            series: [
              {
                id: "score",
                label: "Evaluation score",
                values: [
                  Math.round(Math.max(0, Math.min(1, Number(job.beforeScore || 0))) * 100),
                  Math.round(Math.max(0, Math.min(1, Number(afterScore || 0))) * 100),
                ],
                color: "#4da3ff",
                valueKind: "percent",
                fill: true,
              },
            ],
          };
          return React.createElement(PlatformAnalyticsSection, {
            variant: "framed",
            title: "Analytics",
            analytics,
            className: "playground-fine-tuning-kpi-card",
          });
        }

        function renderFineTuningDescriptionEditor(job) {
          return React.createElement(PlatformInstructionsEditor, {
            value: String(job?.description || ""),
            onChange: (value) => patchFineTuningJob(job.id, (current) => ({
              ...current,
              description: String(value || ""),
            }), { persist: true, delayMs: 450 }),
            title: "Description",
            placeholder: "Describe the purpose, scope, and expected outcome of this fine-tuning job.",
            ariaLabel: "Fine-tuning description",
            stickyHeader: true,
            historyKey: "fine-tuning-description:" + job.id,
            className: "playground-fine-tuning-description-section",
          });
        }

        function renderFineTuningInstructionsEditor(job) {
          return React.createElement(PlatformInstructionsEditor, {
            value: String(job?.instructions || ""),
            onChange: (value) => patchFineTuningJob(job.id, (current) => ({
              ...current,
              instructions: String(value || ""),
            }), { persist: true, delayMs: 450 }),
            title: "Fine-Tuning Instructions",
            placeholder: "Add instructions that guide how the target agent should be improved.",
            ariaLabel: "Fine-tuning instructions",
            stickyHeader: true,
            historyKey: "fine-tuning-instructions:" + job.id,
            className: "playground-fine-tuning-instructions-section",
          });
        }

        function renderEvaluationRunReferences(job) {
          return React.createElement(PlatformDataTable, {
              rows: job.evaluationRuns,
              getRowId: (reference) => reference.evaluationSetId,
              ariaLabel: "Fine-tuning evaluation runs",
              className: "playground-fine-tuning-reference-platform-table",
              variant: "minimalistic-ui",
              sticky: false,
              rowMinHeight: 46,
              emptyState: "No evaluation runs captured.",
              toolbar: {
                title: "Evaluation Runs",
              },
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
            });
        }

        function renderAnalysis(analysisSummary) {
          return React.createElement(PlatformUiCard, {
              as: "section",
              className: "playground-fine-tuning-analysis-section playground-fine-tuning-tab-panel",
            },
            React.createElement("h2", { className: "playground-fine-tuning-content-title" }, "Analysis"),
            analysisSummary
              ? (typeof PlaygroundTaskDescriptionMarkdown === "function"
                  ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                      content: analysisSummary,
                      className: "playground-fine-tuning-analysis-content tb-message-markdown",
                    })
                  : React.createElement("div", { className: "playground-fine-tuning-analysis-content tb-message-markdown" }, analysisSummary))
              : React.createElement(PlatformEmptyState, {
                  icon: ChartColumnIncreasing,
                  title: "No analysis available yet",
                  description: "The fine-tuning analysis will appear here after the job has produced a result.",
                })
          );
        }

        function renderDiff(job, options = {}) {
          const files = buildPlaygroundFineTuningDiffFiles(job);
          const showHeader = options.showHeader !== false;
          return React.createElement("section", { className: "playground-fine-tuning-changes-section playground-fine-tuning-tab-panel" },
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
          const status = normalizePlaygroundFineTuningString(job.status || "pending").toLowerCase();
          const statusLabel = status
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase()) || "Pending";
          const statusVariant = new Set(["completed", "complete", "saved", "published"]).has(status)
            ? "green"
            : new Set(["error", "failed", "cancelled", "canceled"]).has(status)
              ? "red"
              : isPlaygroundFineTuningActiveStatus(status)
                ? "blue"
                : "gray";
          const version = job.createdAgentVersion || {};
          const versionValue = version.version
            ? "Version " + version.version
            : isPlaygroundFineTuningAgentVersionReady(job.agentVersionCreationStatus || version.status)
              ? "Saved"
              : "Pending";
          const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job.targetAgentId || job.agentId)) || null;
          const agentName = normalizePlaygroundFineTuningString(job.agentName || job.targetAgentName || agent?.name || agent?.label || agent?.title || "Agent");
          const agentPhotoUrl = normalizePlaygroundFineTuningString(job.agentPhotoUrl || job.targetAgentPhotoUrl || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL);
          const environmentName = normalizePlaygroundFineTuningString(job.environmentName || "Computer");
          const threadId = normalizePlaygroundFineTuningString(job.threadId);
          const renderSidebarRow = (key, label, value, options = {}) => React.createElement("div", {
              key,
              className: "playground-fine-tuning-detail-sidebar-row" + (options.className ? " " + options.className : ""),
            },
            React.createElement("span", { className: "playground-fine-tuning-detail-sidebar-label" }, label),
            React.createElement("span", {
              className: "playground-fine-tuning-detail-sidebar-value",
              title: options.title || (typeof value === "string" ? value : undefined),
            }, value)
          );
          const header = React.createElement("div", { className: "playground-fine-tuning-detail-header-copy" },
            React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-fine-tuning-detail-inline-back-button",
                onClick: () => {
                  if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("overview");
                },
                title: "Back to fine-tuning jobs",
                "aria-label": "Back to fine-tuning jobs",
              },
              React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.8, "aria-hidden": "true" })
            ),
            React.createElement("h1", { className: "playground-content-title playground-fine-tuning-detail-title" }, job.name || "Untitled Fine-Tune")
          );
          const agentValue = React.createElement("span", { className: "playground-fine-tuning-detail-person", title: agentName },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              agentPhotoUrl
                ? React.createElement("img", { src: agentPhotoUrl, alt: "" })
                : getPlaygroundFineTuningInitials(agentName)
            ),
            React.createElement("span", null, agentName)
          );
          const environmentValue = React.createElement("span", { className: "playground-fine-tuning-detail-environment", title: environmentName },
            React.createElement(Monitor, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" }),
            React.createElement("span", null, environmentName)
          );
          const properties = React.createElement("div", { className: "playground-fine-tuning-detail-sidebar-list" },
            renderSidebarRow("status", "Status", React.createElement(PlatformLabel, { variant: statusVariant }, statusLabel)),
            renderSidebarRow("agent", "Agent", agentValue),
            renderSidebarRow("environment", "Environment", environmentValue),
            renderSidebarRow("version", "Version", versionValue),
            renderSidebarRow("sets", "Evaluation Sets", String(Array.isArray(job.evaluationSets) ? job.evaluationSets.length : 0)),
            renderSidebarRow("cost", "Cost", formatPlaygroundFineTuningUsdCost(job.costUsd)),
            renderSidebarRow("created", "Created", formatPlaygroundFineTuningDateTime(job.createdAt)),
            renderSidebarRow("updated", "Updated", formatPlaygroundFineTuningDateTime(job.updatedAt || job.createdAt)),
            renderSidebarRow("owner", "Owner", renderFineTuningOwnerSelector(job), {
              className: "playground-fine-tuning-detail-owner-row",
            })
          );
          const showStopButton = canStopPlaygroundFineTuningJob(job);
          const isStopping = fineTuningStopJobId === job.id;
          const actions = React.createElement("div", { className: "playground-fine-tuning-detail-sidebar-actions" },
            threadId && typeof onOpenThread === "function"
              ? React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-fine-tuning-detail-sidebar-action",
                  onClick: () => onOpenThread(threadId),
                },
                React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                  React.createElement(MessageSquare, { width: 14, height: 14, strokeWidth: 1.85 })
                ),
                React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, "Open Thread")
              )
              : null,
            showStopButton
              ? React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-fine-tuning-detail-sidebar-action",
                  onClick: () => stopFineTuningJob(job),
                  disabled: isStopping,
                },
                React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                  isStopping
                    ? React.createElement(Loader2, { className: "is-spinning", width: 14, height: 14, strokeWidth: 1.85 })
                    : React.createElement(Square, { width: 13, height: 13, strokeWidth: 1.85 })
                ),
                React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, isStopping ? "Stopping" : "Stop Job")
              )
              : null
          );
          const sidebarToggle = React.createElement("button", {
              type: "button",
              className: "playground-project-overview-sidebar-toggle",
              onClick: () => setFineTuningDetailSidebarCollapsed((current) => !current),
              title: fineTuningDetailSidebarCollapsed ? "Show fine-tuning sidebar" : "Hide fine-tuning sidebar",
              "aria-label": fineTuningDetailSidebarCollapsed ? "Show fine-tuning sidebar" : "Hide fine-tuning sidebar",
              "aria-pressed": fineTuningDetailSidebarCollapsed ? "true" : "false",
            },
            React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8, "aria-hidden": "true" })
          );
          const detailContent = fineTuningDetailTab === "analysis"
            ? renderAnalysis(analysisSummary)
            : fineTuningDetailTab === "changes"
              ? renderDiff(job, { showHeader: false })
              : fineTuningDetailTab === "settings"
                ? (fineTuningAccessTeamId
                    ? renderFineTuningAccessSettings(job)
                    : React.createElement(React.Fragment, null,
                        renderFineTuningDescriptionEditor(job),
                        renderFineTuningInstructionsEditor(job),
                        renderFineTuningAccessSettings(job)
                      ))
                : React.createElement(React.Fragment, null,
                    renderKpiCard(job),
                    renderEvaluationRunReferences(job)
                  );
          return React.createElement(FineTuningDetailPage, {
              header,
              headerActions: React.createElement(PlatformLabel, { variant: statusVariant }, statusLabel),
              activeTab: ["analysis", "changes", "settings"].includes(fineTuningDetailTab) ? fineTuningDetailTab : "general",
              onTabChange: (nextTab) => {
                setFineTuningDetailTab(nextTab);
                if (nextTab === "settings" && !(Array.isArray(workspaceTeams) && workspaceTeams.length) && typeof onWorkspaceTeamsRequest === "function") {
                  onWorkspaceTeamsRequest({ selectedTeamId: "" });
                }
              },
              sidebarToggle,
              sidebarCollapsed: fineTuningDetailSidebarCollapsed,
              properties,
              actions,
            },
            detailContent
          );
        }

`;
