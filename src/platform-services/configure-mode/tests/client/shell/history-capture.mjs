export const TESTS_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "tests") {
            return {
              page: "tests",
              mode: testsPageMode,
              testPlanId: selectedTestPlanId,
              testPlanName: selectedTestPlanName,
              testCaseId: selectedTestCaseId,
              testCaseName: selectedTestCaseName,
              testRunId: selectedTestRunId,
              testRunName: selectedTestRunName,
            };
          }

`;
