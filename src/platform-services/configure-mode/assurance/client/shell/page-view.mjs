export const ASSURANCE_APP_PAGE_VIEW_SCRIPT = String.raw`        function renderAssurancePage() {
          return React.createElement(AssuranceWorkspacePage, {
            shouldLoadData: activePage === "assurance",
            backendUrl: proxyBackendBase,
            requestHeaders,
            mode: assurancePageMode,
            overviewScope: assuranceOverviewScope,
            selectedPolicyId: selectedAssurancePolicyId,
            selectedRunId: selectedAssuranceRunId,
            controlsPortalId: assurancePageMode === "overview"
              ? "playground-assurance-overview-controls"
              : "playground-assurance-nav-actions",
            sectionControlsPortalId: assurancePageMode === "detail"
              ? "playground-assurance-section-controls"
              : undefined,
            defaultProjectId: latestInteractedProjectId || "",
            projects: runnerWorkspaceProjects,
            workspaceTeams: teamPageTeams,
            currentUser: {
              id: hasSessionAuth ? (sessionState.userId || accountEmail || "") : "",
              userId: hasSessionAuth ? (sessionState.userId || "") : "",
              name: hasSessionAuth ? accountName : "Me",
              email: hasSessionAuth ? accountEmail : "",
              avatarUrl: hasSessionAuth ? accountAvatarUrl : "",
            },
            onNavigationGuardChange: registerPlatformNavigationGuard,
            onNavigationRequest: requestPlatformNavigation,
            onOpenPolicy: (policyId, policyName = "") => {
              openAssurancePolicyDetailPage(policyId, policyName);
            },
            onOpenRun: (policyId, runId, policyName = "") => {
              openAssuranceRunDetailPage(
                policyId,
                runId,
                policyName,
                "Run " + String(runId || "").slice(-8)
              );
            },
            onIdentityChange: (identity = {}) => {
              const policyId = String(identity.policyId || "").trim();
              const policyName = String(identity.policyName || "").trim();
              const runId = String(identity.runId || "").trim();
              const runLabel = String(identity.runLabel || "").trim();
              if (policyId) setSelectedAssurancePolicyId(policyId);
              if (policyName) setSelectedAssurancePolicyName(policyName);
              if (runId) setSelectedAssuranceRunId(runId);
              if (runLabel) setSelectedAssuranceRunName(runLabel);
            },
          });
        }

`;
