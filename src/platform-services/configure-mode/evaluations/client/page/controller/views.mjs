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

        function renderDetail() {
          if (!activeSet) {
            return renderOverview();
          }
          const activeDetailTab = evaluationDetailTab === "settings" || evaluationDetailTab === "data"
            ? "settings"
            : "general";
          const creator = normalizePlaygroundEvaluationPersonIdentity(activeSet.creator || activeSet.createdBy || activeSet.created_by || {});
          const creatorLabel = getPlaygroundEvaluationCreatorLabel(creator) || "Unknown";
          const renderSidebarRow = (key, label, value, options = {}) => React.createElement("div", {
              key,
              className: "playground-evaluations-detail-sidebar-row" + (options.className ? " " + options.className : ""),
            },
            React.createElement("span", { className: "playground-evaluations-detail-sidebar-label" }, label),
            React.createElement(options.control ? "div" : "span", {
              className: "playground-evaluations-detail-sidebar-value",
              title: options.title || (typeof value === "string" ? value : undefined),
            }, value)
          );
          const detailHeader = React.createElement("div", { className: "playground-evaluations-detail-header-copy" },
            React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-evaluations-detail-inline-back-button",
                onClick: () => setEvaluationsPageMode("overview"),
                title: "Back to evaluations",
                "aria-label": "Back to evaluations",
              },
              React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.8, "aria-hidden": "true" })
            ),
            React.createElement("input", {
              type: "text",
              className: "playground-content-title playground-evaluations-title-input",
              value: activeSet.name || "",
              placeholder: "Untitled Evaluation",
              onChange: (event) => updateEvaluationSet(activeSet.id, (current) => ({
                ...current,
                name: event.target.value,
              })),
              "aria-label": "Evaluation name",
            })
          );
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
            renderSidebarRow("evaluator", "Evaluator", renderEvaluationSetEvaluatorCell(activeSet)),
            renderSidebarRow("pass-threshold", passThresholdLabel, renderEvaluationPassThresholdInline(activeSet, { showLabel: false }), {
              className: "is-pass-threshold",
            }),
            renderSidebarRow("creator", "Creator", creatorValue),
            renderSidebarRow("cases", "Cases", String(Array.isArray(activeSet.dataRows) ? activeSet.dataRows.length : 0)),
            renderSidebarRow("runs", "Runs", String(Array.isArray(activeSet.runs) ? activeSet.runs.length : 0)),
            renderSidebarRow("created", "Created", formatPlaygroundEvaluationDate(activeSet.createdAt)),
            renderSidebarRow("updated", "Updated", formatPlaygroundEvaluationDate(activeSet.updatedAt || activeSet.createdAt)),
            renderSidebarRow("owner", "Owner", renderEvaluationOwnerSelector(activeSet), {
              className: "is-owner",
              control: true,
            })
          );
          const actions = React.createElement("div", { className: "playground-evaluations-detail-sidebar-actions" },
            React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-evaluations-detail-sidebar-action",
                onClick: () => openRunEvaluationModal(activeSet.id),
                disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.85 })
              ),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, "Run Evaluation")
            ),
            React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-evaluations-detail-sidebar-action",
                onClick: () => {
                  setEvaluationPublishMenuOpen(false);
                  setEvaluationVersionsHeaderMenuOpen(false);
                  setEvaluationVersionsSidebarOpen(true);
                },
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(History, { width: 14, height: 14, strokeWidth: 1.85 })
              ),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, "Version history")
            )
          );
          const sidebarToggle = React.createElement("button", {
              type: "button",
              className: "playground-project-overview-sidebar-toggle",
              onClick: () => setEvaluationDetailSidebarCollapsed((current) => !current),
              title: evaluationDetailSidebarCollapsed ? "Show evaluation sidebar" : "Hide evaluation sidebar",
              "aria-label": evaluationDetailSidebarCollapsed ? "Show evaluation sidebar" : "Hide evaluation sidebar",
              "aria-pressed": evaluationDetailSidebarCollapsed ? "true" : "false",
            },
            React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8, "aria-hidden": "true" })
          );
          const handleEvaluationDetailTabChange = (nextTab) => {
            const normalizedTab = nextTab === "settings" ? "settings" : "general";
            setEvaluationDetailTab(normalizedTab);
            setEvaluationAccessMenuOpen(false);
            if (normalizedTab !== "settings") {
              setEvaluationAccessTeamId("");
            } else if (!teamPageLoading && !evaluationWorkspaceTeams.length && typeof loadTeamPageData === "function") {
              void loadTeamPageData({ selectedTeamId: "" });
            }
          };
          const detailContent = activeDetailTab === "settings"
            ? evaluationAccessTeamId
              ? renderEvaluationAccessSettings()
              : React.createElement(React.Fragment, null,
                  renderEvaluationGuidanceEditor(activeSet),
                  renderDataTable(activeSet),
                  renderEvaluationAccessSettings()
                )
            : React.createElement(React.Fragment, null,
                renderAnalyticsCard(activeSet),
                renderRunsTable(activeSet)
              );
          return React.createElement(EvaluationDetailPage, {
              header: detailHeader,
              activeTab: activeDetailTab,
              onTabChange: handleEvaluationDetailTabChange,
              sidebarToggle,
              sidebarCollapsed: evaluationDetailSidebarCollapsed,
              properties,
              actions,
            },
            detailContent
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
