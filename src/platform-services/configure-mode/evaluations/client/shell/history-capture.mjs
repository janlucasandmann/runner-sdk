export const EVALUATIONS_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "evaluations") {
            return {
              page: "evaluations",
              mode: evaluationsPageMode === "run" ? "run" : evaluationsPageMode === "detail" ? "detail" : "overview",
              evaluationId: selectedEvaluationSetId,
              evaluationRunId: selectedEvaluationRunId,
            };
          }

`;
