export const CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT = `
      function buildPlaygroundDefaultScheduleDraft() {
        const now = new Date().toISOString();
        const nextHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        return {
          id: "",
          userId: "",
          name: "New Scheduled Task",
          description: "",
          taskColor: PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
          priority: "medium",
          releaseId: null,
          dependencyIds: [],
          taskType: "task",
          parentTaskId: null,
          attachments: [],
          enabledSkills: [],
          connectors: buildPlaygroundDefaultTaskConnectors(),
          comments: [],
          agentId: null,
          agentName: null,
          task: "",
          environmentId: "",
          environmentName: null,
          appId: null,
          contextId: null,
          contextName: null,
          scheduleType: "one-time",
          cronExpression: null,
          scheduledTime: nextHour,
          timezone: (() => {
            try {
              return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
            } catch {
              return "UTC";
            }
          })(),
          enabled: true,
          lastRunAt: null,
          nextRunAt: nextHour,
          runCount: 0,
          successCount: 0,
          failureCount: 0,
          metadata: null,
          createdAt: now,
          updatedAt: now,
        };
      }

`;
