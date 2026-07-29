export const EVALUATIONS_APP_NAVIGATION_SCRIPT = `        function openEvaluationsPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          const requestedEvaluationId = String(options.evaluationId || "").trim();
          const requestedRunId = String(options.evaluationRunId || "").trim();
          const requestedCaseId = String(options.evaluationCaseId || "").trim();
          const sourceReturnTarget = options.returnTarget && typeof options.returnTarget === "object" && !Array.isArray(options.returnTarget)
            ? options.returnTarget
            : null;
          const returnFineTuneJobId = String(sourceReturnTarget?.fineTuneJobId || sourceReturnTarget?.jobId || "").trim();
          setEvaluationRunReturnTarget(
            sourceReturnTarget?.page === "fine-tuning" && returnFineTuneJobId
              ? {
                  page: "fine-tuning",
                  fineTuneJobId: returnFineTuneJobId,
                }
              : null
          );
          if (requestedEvaluationId) {
            setSelectedEvaluationSetId(requestedEvaluationId);
          }
          if (requestedRunId) {
            setSelectedEvaluationRunId(requestedRunId);
          }
          if (requestedCaseId) {
            setSelectedEvaluationCaseId(requestedCaseId);
          }
          setEvaluationsPageMode(
            options.mode === "run" || requestedRunId
              ? "run"
              : options.mode === "dataset-case" || requestedCaseId
                ? "dataset-case"
              : options.mode === "detail" || requestedEvaluationId
                ? "detail"
                : "overview"
          );
          setActivePage("evaluations");
        }

        function openEvaluationsOverviewPage() {
          setSelectedEvaluationSetId("");
          setSelectedEvaluationRunId("");
          setSelectedEvaluationCaseId("");
          setEvaluationRunReturnTarget(null);
          openEvaluationsPage({ mode: "overview" });
        }

        function openEvaluationDetailPage(evaluationId) {
          const normalizedEvaluationId = String(evaluationId || "").trim();
          if (!normalizedEvaluationId) {
            openEvaluationsOverviewPage();
            return;
          }
          setSelectedEvaluationRunId("");
          setSelectedEvaluationCaseId("");
          setEvaluationRunReturnTarget(null);
          setEvaluationDetailTab("general");
          openEvaluationsPage({
            mode: "detail",
            evaluationId: normalizedEvaluationId,
          });
        }

        function openEvaluationCasesPage(evaluationId) {
          const normalizedEvaluationId = String(evaluationId || "").trim();
          if (!normalizedEvaluationId) {
            openEvaluationsOverviewPage();
            return;
          }
          setSelectedEvaluationRunId("");
          setSelectedEvaluationCaseId("");
          setEvaluationRunReturnTarget(null);
          setEvaluationDetailTab("cases");
          openEvaluationsPage({
            mode: "detail",
            evaluationId: normalizedEvaluationId,
          });
        }

`;
