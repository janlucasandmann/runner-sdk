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
          setEvaluationsPageMode(
            options.mode === "run" || requestedRunId
              ? "run"
              : options.mode === "detail" || requestedEvaluationId
                ? "detail"
                : "overview"
          );
          setActivePage("evaluations");
        }

`;
