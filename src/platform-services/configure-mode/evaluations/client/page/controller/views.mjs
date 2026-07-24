export const EVALUATIONS_PAGE_CONTROLLER_VIEWS_SCRIPT = String.raw`        function renderOverview() {
          const evaluationOverviewRows = normalizedSets
            .map((set) => {
              const id = String(set?.id || "").trim();
              const name = String(set?.name || "Untitled Evaluation").trim();
              const evaluator = normalizePlaygroundEvaluationEvaluator(set?.evaluator);
              const evaluatorAgent = evaluator.type === "agent"
                ? getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId)
                : null;
              const evaluatorLabel = getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions);
              const evaluatorAvatarUrl = evaluatorAgent
                ? getPlaygroundEvaluationAgentPhotoUrl(evaluatorAgent)
                : "";
              const explicitCreator = getPlaygroundEvaluationCreatorIdentity(set);
              const creator = explicitCreator.name || explicitCreator.email || explicitCreator.id || explicitCreator.userId
                ? explicitCreator
                : currentEvaluationCreator;
              const creatorLabel = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
              const updatedValue = set?.updatedAt || set?.createdAt || "";
              const updatedDate = new Date(updatedValue || "");
              const caseCount = Array.isArray(set?.dataRows) ? set.dataRows.length : 0;
              const runCount = Array.isArray(set?.runs) ? set.runs.length : 0;
              return {
                id,
                name,
                evaluatorLabel,
                evaluatorType: evaluator.type,
                evaluatorAvatarUrl,
                evaluatorFallback: getPlaygroundEvaluationInitials(evaluatorLabel),
                caseCount,
                runCount,
                creatorLabel,
                creatorAvatarUrl: creator.avatarUrl || "",
                creatorFallback: getPlaygroundEvaluationInitials(creatorLabel),
                updatedAt: Number.isFinite(updatedDate.getTime()) ? updatedDate.getTime() : 0,
                updatedLabel: formatPlaygroundEvaluationDate(updatedValue),
                updatedTitle: Number.isFinite(updatedDate.getTime()) ? updatedDate.toLocaleString() : "",
                canRun: getEvaluationRunnableCaseCount(set) > 0,
                searchText: [
                  name,
                  set?.description,
                  evaluatorLabel,
                  creatorLabel,
                  String(caseCount),
                  String(runCount),
                  id,
                ].filter(Boolean).join(" "),
              };
            })
            .filter((set) => set.id);

          return React.createElement(EvaluationsOverviewPage, {
            rows: evaluationOverviewRows,
            loading: evaluationBackendSyncState.status === "loading" && evaluationOverviewRows.length === 0,
            error: evaluationBackendSyncState.error || "",
            controlsPortalId: "playground-evaluations-overview-controls",
            onOpen: (set) => openSetDetail(set.id),
            onCreate: openEvaluationCreateModal,
            onRename: (set) => {
              const sourceSet = normalizedSets.find((candidate) => candidate.id === set.id);
              if (sourceSet) openEvaluationRenameDialog(sourceSet);
            },
            onRun: (set) => openRunEvaluationModal(set.id),
            onDelete: (set) => handleDeleteEvaluation(set.id),
          });
        }

        function renderEvaluationDetailSidebarRow(key, label, value, options = {}) {
          return React.createElement("div", {
              key,
              className: "playground-evaluations-detail-sidebar-row" + (options.className ? " " + options.className : ""),
            },
            React.createElement("span", { className: "playground-evaluations-detail-sidebar-label" }, label),
            React.createElement(options.control ? "div" : "span", {
              className: "playground-evaluations-detail-sidebar-value",
              title: options.title || (typeof value === "string" ? value : undefined),
            }, value)
          );
        }

        function renderDetail() {
          if (!activeSet) {
            return renderOverview();
          }
          const activeDetailTab = evaluationDetailTab === "settings" || evaluationDetailTab === "data"
            ? "settings"
            : "general";
          const creator = normalizePlaygroundEvaluationPersonIdentity(activeSet.creator || activeSet.createdBy || activeSet.created_by || {});
          const creatorLabel = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
          const creatorValue = React.createElement("span", {
              className: "playground-evaluations-detail-person",
              title: creatorLabel,
            },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              creator.avatarUrl
                ? React.createElement("img", { src: creator.avatarUrl, alt: "" })
                : getPlaygroundEvaluationInitials(creatorLabel)
            ),
            React.createElement("span", null, creatorLabel)
          );
          const evaluator = normalizePlaygroundEvaluationEvaluator(activeSet.evaluator);
          const evaluatorAgent = evaluator.type === "agent"
            ? getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId)
            : null;
          const evaluatorAgentLabel = String(
            evaluatorAgent?.name
            || evaluatorAgent?.label
            || evaluatorAgent?.title
            || getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions)
            || "Agent evaluator"
          ).trim();
          const evaluatorAgentPhotoUrl = getPlaygroundEvaluationAgentPhotoUrl(evaluatorAgent);
          const evaluatorAgentOptions = agentOptions
            .filter((agent) => String(agent?.id || "").trim())
            .map((agent) => {
              const agentId = String(agent.id).trim();
              const agentLabel = String(agent.name || agent.label || agent.title || agentId).trim();
              const agentPhotoUrl = getPlaygroundEvaluationAgentPhotoUrl(agent);
              return {
                value: agentId,
                label: agentLabel,
                leading: React.createElement("span", {
                    className: "playground-evaluations-run-agent-avatar",
                    "aria-hidden": "true",
                  }, agentPhotoUrl
                    ? React.createElement("img", { src: agentPhotoUrl, alt: "" })
                    : getPlaygroundEvaluationInitials(agentLabel)),
              };
            });
          const evaluatorValue = evaluator.type === "agent"
            ? React.createElement(PlatformSelector, {
                value: evaluator.agentId,
                options: evaluatorAgentOptions,
                onValueChange: (nextAgentId) => updateEvaluationSet(activeSet.id, (current) => ({
                  ...current,
                  evaluator: {
                    ...normalizePlaygroundEvaluationEvaluator(current.evaluator),
                    type: "agent",
                    agentId: nextAgentId,
                  },
                })),
                ariaLabel: "Choose evaluator agent",
                label: React.createElement("span", {
                    className: "playground-evaluations-run-agent-cell playground-evaluations-detail-evaluator-value",
                    title: evaluatorAgentLabel,
                  },
                  React.createElement("span", {
                    className: "playground-evaluations-run-agent-avatar",
                    "aria-hidden": "true",
                  }, evaluatorAgentPhotoUrl
                    ? React.createElement("img", { src: evaluatorAgentPhotoUrl, alt: "" })
                    : getPlaygroundEvaluationInitials(evaluatorAgentLabel)),
                  React.createElement("span", {
                    className: "playground-evaluations-run-cell-label",
                  }, evaluatorAgentLabel)
                ),
                alignment: "end",
                popupAlignment: "right",
                popupWidth: 260,
                popupMaxHeight: "min(320px, calc(100vh - 180px))",
                className: "playground-evaluations-detail-evaluator-selector",
                triggerClassName: "playground-evaluations-detail-evaluator-trigger",
                popupClassName: "playground-evaluations-detail-evaluator-menu",
                optionClassName: "playground-evaluations-detail-evaluator-option",
              })
            : renderEvaluationSetEvaluatorCell(activeSet);
          const passThresholdLabel = React.createElement("span", {
              className: "playground-evaluations-pass-threshold-label-group",
            },
            React.createElement("span", null, "Pass Threshold"),
            React.createElement("button", {
              type: "button",
              className: "playground-evaluations-pass-threshold-help",
              "aria-label": "Pass threshold information",
              onClick: (event) => event.preventDefault(),
            },
              React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8 }),
              React.createElement("span", { className: "playground-evaluations-pass-threshold-tooltip", role: "tooltip" },
                "Minimum score a case must reach to count as passed. The run pass rate is calculated from cases at or above this threshold."
              )
            )
          );
          const properties = React.createElement("div", { className: "playground-evaluations-detail-sidebar-list" },
            renderEvaluationDetailSidebarRow("evaluator", "Evaluator", evaluatorValue, {
              className: evaluator.type === "agent" ? "is-evaluator-selector" : "",
              control: evaluator.type === "agent",
            }),
            renderEvaluationDetailSidebarRow("pass-threshold", passThresholdLabel, renderEvaluationPassThresholdInline(activeSet, { showLabel: false }), {
              className: "is-pass-threshold",
            }),
            renderEvaluationDetailSidebarRow("creator", "Creator", creatorValue),
            renderEvaluationDetailSidebarRow("cases", "Cases", String(Array.isArray(activeSet.dataRows) ? activeSet.dataRows.length : 0)),
            renderEvaluationDetailSidebarRow("runs", "Runs", String(Array.isArray(activeSet.runs) ? activeSet.runs.length : 0)),
            renderEvaluationDetailSidebarRow("created", "Created", formatPlaygroundEvaluationDate(activeSet.createdAt)),
            renderEvaluationDetailSidebarRow("updated", "Updated", formatPlaygroundEvaluationDate(activeSet.updatedAt || activeSet.createdAt)),
            renderEvaluationDetailSidebarRow("owner", "Owner", renderEvaluationOwnerSelector(activeSet), {
              className: "is-owner",
              control: true,
            })
          );
          const detailContent = activeDetailTab === "settings"
            ? evaluationAccessTeamId
              ? renderEvaluationAccessSettings()
              : React.createElement(React.Fragment, null,
                  renderEvaluationDescriptionEditor(activeSet),
                  renderEvaluationGuidanceEditor(activeSet),
                  renderDataTable(activeSet),
                  renderEvaluationImportsSection(activeSet),
                  renderEvaluationAccessSettings()
                )
            : React.createElement(React.Fragment, null,
                renderAnalyticsCard(activeSet),
                renderRunsTable(activeSet)
              );
          return React.createElement(EvaluationDetailPage, {
              properties,
              sidebarCollapsed: evaluationDetailSidebarCollapsed,
            },
            detailContent
          );
        }

        function renderRun() {
          if (!activeSet || !activeRun) {
            return renderDetail();
          }
          const runStatus = String(activeRun.status || "completed").trim().toLowerCase();
          const runStatusVariant = runStatus === "completed"
            ? "green"
            : runStatus === "failed"
              ? "red"
              : runStatus === "running"
                ? "blue"
                : "gray";
          const runVersionLabel = activeRun.targetAgentVersionLabel
            || (activeRun.targetAgentVersionNumber ? "Version " + activeRun.targetAgentVersionNumber : "Current");
          const runProperties = React.createElement("div", { className: "playground-evaluations-detail-sidebar-list" },
            renderEvaluationDetailSidebarRow("evaluation", "Evaluation", activeSet.name || "Untitled Evaluation"),
            renderEvaluationDetailSidebarRow("status", "Status", React.createElement(PlatformLabel, {
              variant: runStatusVariant,
            }, runStatus.replace(/_/g, " "))),
            renderEvaluationDetailSidebarRow("agent", "Agent", renderRunAgentCell(activeRun, activeSet)),
            renderEvaluationDetailSidebarRow("environment", "Environment", renderRunEnvironmentCell(activeRun, activeSet)),
            renderEvaluationDetailSidebarRow("evaluator", "Evaluator", renderEvaluationSetEvaluatorCell({
              ...activeSet,
              evaluator: activeRun.evaluator,
            })),
            renderEvaluationDetailSidebarRow("version", "Agent Version", runVersionLabel),
            renderEvaluationDetailSidebarRow("threshold", "Pass Threshold", formatPlaygroundEvaluationPercent(activeRun.passThreshold)),
            renderEvaluationDetailSidebarRow("cases", "Cases", String(activeRun.totalCount || activeRun.cases?.length || 0)),
            renderEvaluationDetailSidebarRow("created", "Started", formatPlaygroundEvaluationDate(activeRun.createdAt)),
            renderEvaluationDetailSidebarRow("completed", "Completed", runStatus === "running" || runStatus === "queued"
              ? "-"
              : formatPlaygroundEvaluationDate(activeRun.completedAt || activeRun.createdAt))
          );
          const runActions = React.createElement("div", { className: "playground-evaluations-detail-sidebar-actions" },
            React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-evaluations-detail-sidebar-action",
                onClick: () => openRunEvaluationModal(activeSet.id),
                disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.85 })
              ),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, "Run Again")
            ),
            React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-evaluations-detail-sidebar-action",
                onClick: () => handleDeleteEvaluationRun(activeSet.id, activeRun.id),
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.85 })
              ),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, "Delete Run")
            )
          );
          return React.createElement(EvaluationDetailPage, {
              variant: "run",
              ariaLabel: "Evaluation run details",
              className: "playground-evaluations-run-detail-page",
              properties: runProperties,
              actions: runActions,
            },
            React.createElement(React.Fragment, null,
              renderAnalyticsCard(activeSet, activeRun),
              renderRunCasesTable(activeSet, activeRun)
            )
          );
        }

`;
