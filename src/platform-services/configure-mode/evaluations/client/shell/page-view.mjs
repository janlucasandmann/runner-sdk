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
            onRefreshThreadRecords: () => refreshThreads(80, "", { silent: true }),
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
            evaluationsSearchQuery,
            setEvaluationsSearchQuery,
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
            topNavActionsPortalId: "playground-evaluations-nav-actions",
          });
        }

`;
