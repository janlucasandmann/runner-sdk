export const TESTS_APP_TOP_NAVIGATION_SCRIPT = `        function renderTestsPageNav() {
          const isOverview = testsPageMode === "overview";
          const isRunLevel = testsPageMode === "run"
            || testsPageMode === "run-technical";
          const pathItems = [{ label: "Configure" }];
          if (!isRunLevel && testsPageMode !== "case") {
            pathItems.push({
              label: "Tests",
              onClick: () => requestPlatformNavigation(openTestsOverviewPage),
            });
          }
          if (
            testsPageMode === "detail"
            || testsPageMode === "configuration"
            || testsPageMode === "case"
            || testsPageMode === "run"
            || testsPageMode === "run-technical"
          ) {
            pathItems.push({
              label: selectedTestPlanName || "Test Plan",
              onClick: testsPageMode === "run"
                || testsPageMode === "run-technical"
                || testsPageMode === "case"
                || testsPageMode === "configuration"
                ? () => requestPlatformNavigation(() => (
                    openTestPlanDetailPage(selectedTestPlanId, selectedTestPlanName)
                  ))
                : undefined,
              trailing: testsPageMode === "detail"
                ? React.createElement("span", {
                    id: "playground-tests-title-actions",
                    className: "playground-agent-title-actions-root playground-tests-title-actions-root",
                  })
                : null,
            });
          }
          if (testsPageMode === "configuration") {
            pathItems.push({
              label: "Raw Configuration",
            });
          }
          if (testsPageMode === "case") {
            pathItems.push({
              label: selectedTestCaseName || "Test Case",
            });
          }
          if (testsPageMode === "run" || testsPageMode === "run-technical") {
            pathItems.push({
              label: selectedTestRunName || "Test Run",
              onClick: testsPageMode === "run-technical"
                ? () => requestPlatformNavigation(() => (
                    openTestRunDetailPage(
                      selectedTestPlanId,
                      selectedTestRunId,
                      selectedTestPlanName,
                      selectedTestRunName
                    )
                  ))
                : undefined,
            });
          }
          if (testsPageMode === "run-technical") {
            pathItems.push({
              label: "Details",
            });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems,
            center: isOverview
              ? React.createElement(PlatformSwitch, {
                  className: "playground-tests-overview-scope-switch",
                  value: testsOverviewScope === "created"
                    ? "created"
                    : testsOverviewScope === "shared"
                      ? "shared"
                      : "all",
                  options: [
                    { value: "all", label: "All Tests" },
                    { value: "created", label: "Created by me" },
                    { value: "shared", label: "Shared with me" },
                  ],
                  onValueChange: (nextScope) => setTestsOverviewScope(
                    nextScope === "created" || nextScope === "shared" ? nextScope : "all"
                  ),
                  ariaLabel: "Test scope",
                })
              : testsPageMode === "detail" || testsPageMode === "case"
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
