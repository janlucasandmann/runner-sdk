export const TESTS_APP_TOP_NAVIGATION_SCRIPT = `        function renderTestsPageNav() {
          const isOverview = testsPageMode === "overview";
          const pathItems = [
            { label: "Configure" },
            {
              label: "Tests",
              onClick: openTestsOverviewPage,
            },
          ];
          if (testsPageMode === "detail" || testsPageMode === "run") {
            pathItems.push({
              label: selectedTestPlanName || "Test Plan",
              onClick: testsPageMode === "run"
                ? () => openTestPlanDetailPage(selectedTestPlanId, selectedTestPlanName)
                : undefined,
            });
          }
          if (testsPageMode === "run") {
            pathItems.push({
              label: selectedTestRunName || "Test Run",
            });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems,
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: isOverview
                ? "playground-tests-overview-controls"
                : "playground-tests-nav-actions",
              className: isOverview
                ? "playground-tools-overview-controls-slot"
                : "playground-tests-nav-actions",
            }),
          });
        }

`;
