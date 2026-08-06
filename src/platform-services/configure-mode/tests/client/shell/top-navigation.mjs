export const TESTS_APP_TOP_NAVIGATION_SCRIPT = `        function renderTestsPageNav() {
          const isOverview = testsPageMode === "overview";
          const pathItems = [
            { label: "Configure" },
            {
              label: "Tests",
              onClick: openTestsOverviewPage,
            },
          ];
          if (testsPageMode === "detail" || testsPageMode === "case" || testsPageMode === "run") {
            pathItems.push({
              label: selectedTestPlanName || "Test Plan",
              onClick: testsPageMode === "run" || testsPageMode === "case"
                ? () => openTestPlanDetailPage(selectedTestPlanId, selectedTestPlanName)
                : undefined,
              trailing: testsPageMode === "detail"
                ? React.createElement("span", {
                    id: "playground-tests-title-actions",
                    className: "playground-agent-title-actions-root playground-tests-title-actions-root",
                  })
                : null,
            });
          }
          if (testsPageMode === "case") {
            pathItems.push({
              label: selectedTestCaseName || "Test Case",
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
            center: testsPageMode === "detail" || testsPageMode === "case"
              ? React.createElement("div", {
                  id: "playground-tests-section-controls",
                  className: "playground-tests-section-controls",
                })
              : null,
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
