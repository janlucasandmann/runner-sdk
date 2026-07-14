export const PROJECTS_STATUS_RUNTIME_SCRIPT = `
      function buildTaskRunStatusIndicatorItem(taskRunState) {
        const normalizedTaskId = typeof taskRunState?.taskId === "string" ? taskRunState.taskId.trim() : "";
        if (!normalizedTaskId) {
          return null;
        }

        const ticketPrefix = typeof taskRunState?.ticketNumber === "string" && taskRunState.ticketNumber.trim()
          ? taskRunState.ticketNumber.trim() + " "
          : "";
        const taskLabel = ticketPrefix + (typeof taskRunState?.title === "string" && taskRunState.title.trim()
          ? taskRunState.title.trim()
          : "Untitled Task");
        const phase = typeof taskRunState?.phase === "string" ? taskRunState.phase.trim().toLowerCase() : "";
        const runKind = typeof taskRunState?.runKind === "string" ? taskRunState.runKind.trim().toLowerCase() : "";

        if (phase === "starting") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: runKind === "review" ? "Review scheduled" : "Task scheduled",
            copy: taskLabel + " will begin shortly.",
          };
        }

        if (phase === "running") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: runKind === "review" ? "Review running" : "Task running",
            copy: taskLabel,
          };
        }

        if (phase === "finished") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: runKind === "review" ? "Review accepted" : "Task finished",
            copy: taskLabel,
          };
        }

        if (phase === "in_review") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: runKind === "review" ? "Review finished" : "Task ready for review",
            copy: taskLabel,
          };
        }

        if (phase === "waiting_subtasks") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: "Task waiting on subtasks",
            copy: typeof taskRunState?.error === "string" && taskRunState.error.trim()
              ? taskRunState.error.trim()
              : taskLabel,
          };
        }

        if (phase === "failed") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: "Task failed to start",
            copy: typeof taskRunState?.error === "string" && taskRunState.error.trim()
              ? taskRunState.error.trim()
              : taskLabel,
          };
        }

        if (phase === "cancelled") {
          return {
            id: "task-run:" + normalizedTaskId,
            title: "Task cancelled",
            copy: taskLabel,
          };
        }

        return null;
      }

      function buildMissionControlStatusIndicatorItem(runState) {
        const normalizedProjectId = typeof runState?.projectId === "string" ? runState.projectId.trim() : "";
        if (!normalizedProjectId) {
          return null;
        }

        const projectName = typeof runState?.projectName === "string" && runState.projectName.trim()
          ? runState.projectName.trim()
          : "Project";
        const missionLabel = projectName + " Mission Control";
        const phase = typeof runState?.phase === "string" ? runState.phase.trim().toLowerCase() : "";

        if (phase === "starting") {
          return {
            id: "mission-control:" + normalizedProjectId,
            title: "Mission Control scheduled",
            copy: missionLabel + " will begin shortly.",
          };
        }

        if (phase === "running") {
          return {
            id: "mission-control:" + normalizedProjectId,
            title: "Mission Control running",
            copy: missionLabel,
          };
        }

        if (phase === "finished") {
          return {
            id: "mission-control:" + normalizedProjectId,
            title: "Mission Control finished",
            copy: missionLabel,
          };
        }

        if (phase === "failed") {
          return {
            id: "mission-control:" + normalizedProjectId,
            title: "Mission Control failed to start",
            copy: typeof runState?.error === "string" && runState.error.trim()
              ? runState.error.trim()
              : missionLabel,
          };
        }

        if (phase === "cancelled") {
          return {
            id: "mission-control:" + normalizedProjectId,
            title: "Mission Control cancelled",
            copy: missionLabel,
          };
        }

        return null;
      }

      function buildProjectGithubPreparationStatusIndicatorItem(preparationState) {
        const normalizedProjectId = typeof preparationState?.projectId === "string" ? preparationState.projectId.trim() : "";
        const normalizedRepoFullName = typeof preparationState?.repoFullName === "string" ? preparationState.repoFullName.trim() : "";
        if (!normalizedProjectId || !normalizedRepoFullName) {
          return null;
        }

        const environmentLabel = typeof preparationState?.environmentName === "string" && preparationState.environmentName.trim()
          ? preparationState.environmentName.trim()
          : "project environment";
        const branchLabel = typeof preparationState?.branch === "string" && preparationState.branch.trim()
          ? preparationState.branch.trim()
          : "main";
        const phase = typeof preparationState?.phase === "string" ? preparationState.phase.trim().toLowerCase() : "";
        const id = "project-github-prepare:" + normalizedProjectId + ":" + normalizedRepoFullName + ":" + branchLabel;

        if (phase === "starting" || phase === "running") {
          return {
            id,
            title: "Preparing GitHub repository",
            copy: normalizedRepoFullName + " into " + environmentLabel,
            brand: "github",
            progress: null,
            indeterminate: true,
          };
        }

        if (phase === "finished") {
          return {
            id,
            title: "GitHub repository ready",
            copy: normalizedRepoFullName + " is available in " + environmentLabel,
            brand: "github",
            progress: null,
            indeterminate: false,
          };
        }

        if (phase === "failed") {
          return {
            id,
            title: "GitHub repository sync failed",
            copy: typeof preparationState?.error === "string" && preparationState.error.trim()
              ? preparationState.error.trim()
              : normalizedRepoFullName,
            brand: "github",
            progress: null,
            indeterminate: false,
          };
        }

        return null;
      }
`;
