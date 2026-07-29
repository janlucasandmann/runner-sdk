export const EVALUATIONS_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "evaluations") {
            openEvaluationsPage({
              mode: entry.mode === "run"
                ? "run"
                : entry.mode === "dataset-case"
                  ? "dataset-case"
                  : entry.mode === "detail"
                    ? "detail"
                    : "overview",
              evaluationId: entry.evaluationId || "",
              evaluationRunId: entry.evaluationRunId || "",
              evaluationCaseId: entry.evaluationCaseId || "",
            });
            return;
          }

`;
