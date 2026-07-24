export const EVALUATIONS_APP_PAGE_VIEW_SCRIPT = `        function renderEvaluationsPage() {
          return renderPlaygroundEvaluationsPage({
            shouldLoadData: activePage === "evaluations",
            backendUrl: proxyBackendBase,
            requestHeaders,
            agents: runtimeAgents,
            environments: runtimeEnvironments,
            projects: runnerWorkspaceProjects,
            defaultAgentId: resolvedComposerAgentId || resolvedPreferredAgentId || "",
            defaultEnvironmentId: resolvedEnvironmentId || environmentId || "",
            currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
            currentUserName: hasSessionAuth ? accountName : "Me",
            currentUserEmail: hasSessionAuth ? accountEmail : "",
            currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
            workspaceTeams: teamPageTeams,
            workspaceTeamsLoading: teamPageLoading,
            onWorkspaceTeamsRequest: (options = {}) => {
              const requestedTeamId = String(options?.selectedTeamId || options?.teamId || "").trim();
              void loadTeamPageData({ selectedTeamId: requestedTeamId });
            },
            evaluationRunModalOpen,
            setEvaluationRunModalOpen,
            evaluationRunForm,
            setEvaluationRunForm,
            evaluationRunsSearchQuery,
            setEvaluationRunsSearchQuery,
            evaluationRunsSortMode,
            setEvaluationRunsSortMode,
            evaluationRunsFilterMode,
            setEvaluationRunsFilterMode,
            evaluationRunsToolbarPopover,
            setEvaluationRunsToolbarPopover,
            evaluationRunsVisibleCount,
            setEvaluationRunsVisibleCount,
            onOpenThread: handleThreadSelect,
            onEvaluationThreadStarted: (threadRecord) => {
              if (threadRecord?.id) {
                upsertRealThreadRecord(threadRecord);
              }
              void refreshThreads(undefined, String(threadRecord?.id || "").trim(), { silent: true });
            },
            threadRecords: baseThreadItems,
            onRefreshThreadRecords: () => refreshThreads(40, "", { silent: true }),
            onNavigationGuardChange: registerPlatformNavigationGuard,
            onNavigationRequest: requestPlatformNavigation,
            versionsDrawerPortalId: "playground-agent-versions-drawer-root",
            onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen,
            evaluationSets,
            setEvaluationSets,
            selectedEvaluationSetId,
            setSelectedEvaluationSetId,
            selectedEvaluationRunId,
            setSelectedEvaluationRunId,
            selectedEvaluationCaseId,
            setSelectedEvaluationCaseId,
            evaluationsPageMode,
            setEvaluationsPageMode,
            evaluationRunReturnTarget,
            onEvaluationRunBack: (target) => {
              const fineTuneJobId = String(target?.fineTuneJobId || target?.jobId || "").trim();
              setEvaluationRunReturnTarget(null);
              if (target?.page === "fine-tuning" && fineTuneJobId) {
                openFineTuningPage({
                  mode: "detail",
                  jobId: fineTuneJobId,
                });
                return;
              }
              setSelectedEvaluationRunId("");
              if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
              setEvaluationsPageMode("detail");
            },
            evaluationDetailTab,
            setEvaluationDetailTab,
            evaluationCreateModalOpen,
            setEvaluationCreateModalOpen,
            evaluationCreateForm,
            setEvaluationCreateForm,
            evaluationJsonlImportOpen,
            setEvaluationJsonlImportOpen,
            evaluationJsonlImportValue,
            setEvaluationJsonlImportValue,
            evaluationJsonlImportError,
            setEvaluationJsonlImportError,
            versionsSidebarRequestToken: evaluationVersionsSidebarRequestToken,
            topNavActionsPortalId: evaluationsPageMode === "detail"
              ? "playground-evaluations-nav-actions"
              : "",
            breadcrumbActionsPortalId: evaluationsPageMode === "detail"
              ? "playground-evaluations-breadcrumb-actions"
              : "",
          });
        }

`;
