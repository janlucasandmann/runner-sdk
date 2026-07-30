export const FINE_TUNING_APP_PAGE_VIEW_SCRIPT = String.raw`        function renderFineTuningPage() {
          return React.createElement(PlaygroundFineTuningPage, {
            shouldLoadData: activePage === "fine-tuning",
            backendUrl: proxyBackendBase,
            requestHeaders,
            agents: runtimeAgents,
            environments: runtimeEnvironments,
            evaluationSets,
            setEvaluationSets,
            workspaceTeams: teamPageTeams,
            workspaceTeamsLoading: teamPageLoading,
            onWorkspaceTeamsRequest: (options = {}) => {
              const requestedTeamId = String(options?.selectedTeamId || "").trim();
              void loadTeamPageData({ selectedTeamId: requestedTeamId });
            },
            fineTuningJobs,
            setFineTuningJobs,
            selectedFineTuningJobId,
            setSelectedFineTuningJobId,
            fineTuningPageMode,
            setFineTuningPageMode,
            fineTuningDetailTab,
            setFineTuningDetailTab,
            fineTuningCreateModalOpen,
            setFineTuningCreateModalOpen,
            fineTuningCreateForm,
            setFineTuningCreateForm,
            defaultAgentId: resolvedComposerAgentId || resolvedPreferredAgentId || "",
            defaultEnvironmentId: resolvedEnvironmentId || environmentId || "",
            currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
            currentUserName: hasSessionAuth ? accountName : "Me",
            currentUserEmail: hasSessionAuth ? accountEmail : "",
            currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
            onOpenThread: handleThreadSelect,
            onOpenEvaluationRun: (evaluationId, evaluationRunId, sourceContext = {}) => {
              const fineTuneJobId = String(
                sourceContext?.fineTuneJobId
                || sourceContext?.jobId
                || selectedFineTuningJobId
                || ""
              ).trim();
              openEvaluationsPage({
                mode: "run",
                evaluationId,
                evaluationRunId,
                returnTarget: fineTuneJobId
                  ? {
                      page: "fine-tuning",
                      fineTuneJobId,
                    }
                  : null,
              });
            },
            onFineTuningThreadStarted: (threadRecord) => {
              if (threadRecord?.id) {
                upsertRealThreadRecord(threadRecord);
              }
              void refreshThreads(undefined, String(threadRecord?.id || "").trim(), { silent: true });
            },
            onAgentVersionCreated: (agentId, version) => {
              const normalizedAgentId = String(agentId || "").trim();
              const sourceVersion = version && typeof version === "object" && !Array.isArray(version) ? version : null;
              if (!normalizedAgentId || !sourceVersion?.id) return;
              setRealAgents((current) => (Array.isArray(current) ? current : []).map((agent) => {
                if (String(agent?.id || "").trim() !== normalizedAgentId) return agent;
                const normalizedVersion = typeof normalizePlaygroundAgentVersion === "function"
                  ? normalizePlaygroundAgentVersion(sourceVersion)
                  : sourceVersion;
                const existingVersions = typeof readPlaygroundAgentVersions === "function"
                  ? readPlaygroundAgentVersions(agent)
                  : (Array.isArray(agent?.agentVersions) ? agent.agentVersions : Array.isArray(agent?.versions) ? agent.versions : []);
                const nextVersions = [normalizedVersion]
                  .concat((Array.isArray(existingVersions) ? existingVersions : []).filter((existingVersion) => String(existingVersion?.id || "").trim() !== String(normalizedVersion.id || "").trim()));
                if (typeof createPlaygroundAgentWithVersionList === "function") {
                  return createPlaygroundAgentWithVersionList(agent, nextVersions, normalizedVersion.id);
                }
                const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? { ...agent.metadata } : {};
                metadata.agentVersions = nextVersions;
                metadata.agent_versions = nextVersions;
                return {
                  ...agent,
                  agentVersions: nextVersions,
                  versions: nextVersions,
                  metadata,
                };
              }));
            },
            onAgentsRefresh: refreshAgents,
            topNavActionsPortalId: fineTuningPageMode === "detail"
              ? "playground-fine-tuning-nav-actions"
              : "",
          });
        }

`;
