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
