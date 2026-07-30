export const TESTS_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "tests") {
            openTestsPage({
              mode: entry.mode === "case"
                ? "case"
                : entry.mode === "run"
                  ? "run"
                  : entry.mode === "detail"
                    ? "detail"
                    : "overview",
              testPlanId: entry.testPlanId || "",
              testPlanName: entry.testPlanName || "",
              testCaseId: entry.testCaseId || "",
              testCaseName: entry.testCaseName || "",
              testRunId: entry.testRunId || "",
              testRunName: entry.testRunName || "",
            });
            return;
          }

`;
