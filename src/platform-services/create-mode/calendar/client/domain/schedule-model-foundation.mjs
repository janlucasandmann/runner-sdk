export const CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT = `
      const PLAYGROUND_CALENDAR_SCHEDULE_TARGET_OPTIONS = [
        { id: "task", label: "Task" },
        { id: "loop", label: "Loop" },
        { id: "workflow", label: "Workflow" },
        { id: "batch", label: "Batch" },
      ];

      function normalizePlaygroundScheduleTargetType(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (normalized === "workflow" || normalized === "metronome" || normalized === "metronome_run") {
          return "workflow";
        }
        if (normalized === "loop" || normalized === "loop_task" || normalized === "metronome_loop") {
          return "loop";
        }
        if (normalized === "batch" || normalized === "batch_job" || normalized === "batch_job_run") {
          return "batch";
        }
        return "task";
      }

      function buildPlaygroundDefaultScheduleDraft() {
        const now = new Date().toISOString();
        const nextHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        return {
          id: "",
          userId: "",
          name: "New Scheduled Task",
          description: "",
          taskColor: "blue",
          priority: "medium",
          releaseId: null,
          dependencyIds: [],
          targetType: "task",
          workflowId: null,
          workflowName: null,
          batchJobId: null,
          batchJobName: null,
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
