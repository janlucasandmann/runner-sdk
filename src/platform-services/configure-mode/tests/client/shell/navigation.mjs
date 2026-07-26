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
          const requestedRunId = String(options.testRunId || options.runId || "").trim();
          const requestedPlanName = String(options.testPlanName || options.planName || "").trim();
          const requestedRunName = String(options.testRunName || options.runName || "").trim();
          if (requestedPlanId) setSelectedTestPlanId(requestedPlanId);
          if (requestedPlanName) setSelectedTestPlanName(requestedPlanName);
          if (requestedRunId) setSelectedTestRunId(requestedRunId);
          if (requestedRunName) setSelectedTestRunName(requestedRunName);
          setTestsPageMode(
            options.mode === "run" || requestedRunId
              ? "run"
              : options.mode === "detail" || requestedPlanId
                ? "detail"
                : "overview"
          );
          setActivePage("tests");
        }

        function openTestsOverviewPage() {
          setSelectedTestPlanId("");
          setSelectedTestPlanName("");
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
          setSelectedTestRunId("");
          setSelectedTestRunName("");
          openTestsPage({
            mode: "detail",
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
          openTestsPage({
            mode: "run",
            testPlanId: normalizedPlanId,
            testRunId: normalizedRunId,
            testPlanName,
            testRunName,
          });
        }

`;
