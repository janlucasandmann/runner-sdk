export const TESTS_APP_PAGE_VIEW_SCRIPT = String.raw`        function renderTestsPage() {
          return React.createElement(TestsWorkspacePage, {
            shouldLoadData: activePage === "tests",
            backendUrl: proxyBackendBase,
            requestHeaders,
            mode: testsPageMode,
            selectedTestPlanId,
            selectedTestCaseId,
            selectedTestRunId,
            controlsPortalId: testsPageMode === "overview"
              ? "playground-tests-overview-controls"
              : "playground-tests-nav-actions",
            sectionControlsPortalId: testsPageMode === "detail" || testsPageMode === "case"
              ? "playground-tests-section-controls"
              : undefined,
            defaultProjectId: latestInteractedProjectId || "",
            defaultEnvironmentId: resolvedEnvironmentId || environmentId || "",
            defaultAgentId: resolvedComposerAgentId || resolvedPreferredAgentId || "",
            projects: runnerWorkspaceProjects,
            environments: runtimeEnvironments,
            agents: runtimeAgents,
            workspaceTeams: teamPageTeams,
            onOpenPlan: (planId, planName = "") => {
              openTestPlanDetailPage(planId, planName);
            },
            onOpenCase: (planId, caseId, planName = "", caseName = "") => {
              openTestCaseDetailPage(planId, caseId, planName, caseName);
            },
            onOpenRun: (planId, runId, planName = "") => {
              openTestRunDetailPage(
                planId,
                runId,
                planName,
                "Run " + String(runId || "").slice(-8)
              );
            },
            onIdentityChange: (identity = {}) => {
              const planId = String(identity.planId || "").trim();
              const planName = String(identity.planName || "").trim();
              const caseId = String(identity.caseId || "").trim();
              const caseName = String(identity.caseName || "").trim();
              const runId = String(identity.runId || "").trim();
              const runLabel = String(identity.runLabel || "").trim();
              if (planId) setSelectedTestPlanId(planId);
              if (planName) setSelectedTestPlanName(planName);
              if (caseId) setSelectedTestCaseId(caseId);
              if (caseName) setSelectedTestCaseName(caseName);
              if (runId) setSelectedTestRunId(runId);
              if (runLabel) setSelectedTestRunName(runLabel);
            },
          });
        }

`;
