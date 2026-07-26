export const TESTS_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "tests") {
            return {
              page: "tests",
              mode: testsPageMode,
              testPlanId: selectedTestPlanId,
              testPlanName: selectedTestPlanName,
              testRunId: selectedTestRunId,
              testRunName: selectedTestRunName,
            };
          }

`;
