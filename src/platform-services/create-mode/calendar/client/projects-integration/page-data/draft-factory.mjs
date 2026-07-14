export const CALENDAR_PROJECTS_PAGE_DRAFT_FACTORY_SCRIPT = `
        function buildProjectScheduleDraft(projectRecord = selectedProject) {
          const base = buildPlaygroundDefaultScheduleDraft();
          const projectDefaultEnvironmentId = typeof projectRecord?.defaultEnvironmentId === "string" && projectRecord.defaultEnvironmentId.trim()
            ? projectRecord.defaultEnvironmentId.trim()
            : "";
          const defaultEnvironment = (projectDefaultEnvironmentId
            ? availableBacklogEnvironments.find((environment) => environment.id === projectDefaultEnvironmentId)
            : null)
            || availableBacklogEnvironments.find((environment) => environment.isDefault)
            || availableBacklogEnvironments[0]
            || null;
          const defaultAgent = sortedAgents.find((agent) => agent.id === backlogComposerAgentId)
            || getPlaygroundPreferredDefaultAgent(sortedAgents)
            || sortedAgents[0]
            || null;

          return {
            ...base,
            agentId: defaultAgent?.id || null,
            agentName: defaultAgent?.name || null,
            environmentId: defaultEnvironment?.id || "",
            environmentName: defaultEnvironment?.name || null,
            contextId: null,
            contextName: null,
            appId: "runner_project_calendar",
            metadata: {
              projectId: null,
              projectName: null,
              taskColor: base.taskColor,
              source: "runner_playground_project_calendar",
            },
          };
        }

`;
