export const TESTS_APP_NAVIGATION_SCRIPT = `        function openTestsPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          const requestedPlanId = String(options.testPlanId || options.planId || "").trim();
          const requestedCaseId = String(options.testCaseId || options.caseId || "").trim();
          const requestedRunId = String(options.testRunId || options.runId || "").trim();
          const requestedPlanName = String(options.testPlanName || options.planName || "").trim();
          const requestedCaseName = String(options.testCaseName || options.caseName || "").trim();
          const requestedRunName = String(options.testRunName || options.runName || "").trim();
          if (requestedPlanId) setSelectedTestPlanId(requestedPlanId);
          if (requestedPlanName) setSelectedTestPlanName(requestedPlanName);
          if (requestedCaseId) setSelectedTestCaseId(requestedCaseId);
          if (requestedCaseName) setSelectedTestCaseName(requestedCaseName);
          if (requestedRunId) setSelectedTestRunId(requestedRunId);
          if (requestedRunName) setSelectedTestRunName(requestedRunName);
          setTestsPageMode(
            options.mode === "case" || requestedCaseId
              ? "case"
              : options.mode === "run-technical"
                ? "run-technical"
                : options.mode === "run" || requestedRunId
                  ? "run"
                : options.mode === "configuration"
                  ? "configuration"
                : options.mode === "detail" || requestedPlanId
                  ? "detail"
                  : "overview"
          );
          setActivePage("tests");
        }

        function openTestsOverviewPage() {
          setSelectedTestPlanId("");
          setSelectedTestPlanName("");
          setSelectedTestCaseId("");
          setSelectedTestCaseName("");
          setSelectedTestRunId("");
          setSelectedTestRunName("");
          openTestsPage({ mode: "overview" });
        }

        function openTestPlanDetailPage(testPlanId, testPlanName = "") {
          const normalizedPlanId = String(testPlanId || "").trim();
          if (!normalizedPlanId) {
            openTestsOverviewPage();
            return;
          }
          setSelectedTestCaseId("");
          setSelectedTestCaseName("");
          setSelectedTestRunId("");
          setSelectedTestRunName("");
          openTestsPage({
            mode: "detail",
            testPlanId: normalizedPlanId,
            testPlanName,
          });
        }

        function openTestRawConfigurationPage(testPlanId, testPlanName = "") {
          const normalizedPlanId = String(testPlanId || "").trim();
          if (!normalizedPlanId) {
            openTestsOverviewPage();
            return;
          }
          setSelectedTestCaseId("");
          setSelectedTestCaseName("");
          setSelectedTestRunId("");
          setSelectedTestRunName("");
          openTestsPage({
            mode: "configuration",
            testPlanId: normalizedPlanId,
            testPlanName,
          });
        }

        function openTestRunDetailPage(testPlanId, testRunId, testPlanName = "", testRunName = "") {
          const normalizedPlanId = String(testPlanId || "").trim();
          const normalizedRunId = String(testRunId || "").trim();
          if (!normalizedRunId) {
            openTestPlanDetailPage(normalizedPlanId, testPlanName);
            return;
          }
          setSelectedTestCaseId("");
          setSelectedTestCaseName("");
          openTestsPage({
            mode: "run",
            testPlanId: normalizedPlanId,
            testRunId: normalizedRunId,
            testPlanName,
            testRunName,
          });
        }

        function openTestRunTechnicalDetailsPage(testPlanId, testRunId, testPlanName = "", testRunName = "") {
          const normalizedPlanId = String(testPlanId || "").trim();
          const normalizedRunId = String(testRunId || "").trim();
          if (!normalizedRunId) {
            openTestPlanDetailPage(normalizedPlanId, testPlanName);
            return;
          }
          setSelectedTestCaseId("");
          setSelectedTestCaseName("");
          openTestsPage({
            mode: "run-technical",
            testPlanId: normalizedPlanId,
            testRunId: normalizedRunId,
            testPlanName,
            testRunName,
          });
        }

        function openTestCaseDetailPage(testPlanId, testCaseId, testPlanName = "", testCaseName = "") {
          const normalizedPlanId = String(testPlanId || "").trim();
          const normalizedCaseId = String(testCaseId || "").trim();
          if (!normalizedCaseId) {
            openTestPlanDetailPage(normalizedPlanId, testPlanName);
            return;
          }
          setSelectedTestRunId("");
          setSelectedTestRunName("");
          openTestsPage({
            mode: "case",
            testPlanId: normalizedPlanId,
            testCaseId: normalizedCaseId,
            testPlanName,
            testCaseName,
          });
        }

`;
