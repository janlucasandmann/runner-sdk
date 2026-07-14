export const CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT = `
      function normalizePlaygroundScheduleRecord(schedule) {
        if (!schedule || typeof schedule !== "object") {
          return buildPlaygroundDefaultScheduleDraft();
        }

        const draft = buildPlaygroundDefaultScheduleDraft();
        const rawCreatedAt = typeof schedule.createdAt === "string" && schedule.createdAt
          ? schedule.createdAt
          : (typeof schedule.created_at === "string" && schedule.created_at ? schedule.created_at : "");
        const rawUpdatedAt = typeof schedule.updatedAt === "string" && schedule.updatedAt
          ? schedule.updatedAt
          : (typeof schedule.updated_at === "string" && schedule.updated_at ? schedule.updated_at : "");
        const rawCronExpression = typeof schedule.cronExpression === "string" && schedule.cronExpression.trim()
          ? schedule.cronExpression.trim()
          : (typeof schedule.cron_expression === "string" && schedule.cron_expression.trim()
            ? schedule.cron_expression.trim()
            : "");
        const rawScheduledTime = typeof schedule.scheduledTime === "string" && schedule.scheduledTime
          ? schedule.scheduledTime
          : (typeof schedule.scheduled_time === "string" && schedule.scheduled_time ? schedule.scheduled_time : "");
        const rawNextRunAt = typeof schedule.nextRunAt === "string" && schedule.nextRunAt
          ? schedule.nextRunAt
          : (typeof schedule.next_run_at === "string" && schedule.next_run_at ? schedule.next_run_at : "");
        const rawLastRunAt = typeof schedule.lastRunAt === "string" && schedule.lastRunAt
          ? schedule.lastRunAt
          : (typeof schedule.last_run_at === "string" && schedule.last_run_at ? schedule.last_run_at : "");
        const isPersistedSchedule = typeof schedule.id === "string" && schedule.id.trim().length > 0;
        const createdAt = rawCreatedAt || (isPersistedSchedule ? "" : draft.createdAt);
        const updatedAt = rawUpdatedAt || (createdAt || (isPersistedSchedule ? "" : draft.updatedAt));
        const rawScheduleType = typeof schedule.scheduleType === "string" && schedule.scheduleType.trim()
          ? schedule.scheduleType.trim().toLowerCase()
          : (typeof schedule.schedule_type === "string" && schedule.schedule_type.trim()
            ? schedule.schedule_type.trim().toLowerCase()
            : (typeof schedule.type === "string" && schedule.type.trim() ? schedule.type.trim().toLowerCase() : ""));
        const hasCronExpression = rawCronExpression.length > 0;
        const scheduleType = rawScheduleType === "recurring"
          ? "recurring"
          : rawScheduleType === "one-time"
            ? "one-time"
            : (hasCronExpression ? "recurring" : "one-time");
        const metadata = schedule.metadata && typeof schedule.metadata === "object" && !Array.isArray(schedule.metadata) ? schedule.metadata : null;
        const taskColor = getPlaygroundTaskColorId(
          schedule.taskColor
          || metadata?.taskColor
          || metadata?.color
        );
        const priority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === schedule.priority)
          ? schedule.priority
          : (PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === metadata?.priority)
            ? metadata.priority
            : draft.priority);
        const normalizedParentTaskId = normalizePlaygroundParentTaskId(
          schedule.parentTaskId
          || metadata?.parentTaskId
        );
        const taskType = normalizePlaygroundTaskType(
          schedule.taskType
          || metadata?.taskType
          || (normalizedParentTaskId ? "subtask" : draft.taskType)
        );
        const releaseId = typeof schedule.releaseId === "string" && schedule.releaseId.trim()
          ? schedule.releaseId.trim()
          : (typeof metadata?.releaseId === "string" && metadata.releaseId.trim() ? metadata.releaseId.trim() : null);
        const dependencyIds = normalizePlaygroundIdList(
          Array.isArray(schedule.dependencyIds)
            ? schedule.dependencyIds
            : (Array.isArray(metadata?.dependencyIds) ? metadata.dependencyIds : [])
        );
        const directEnabledSkills = normalizePlaygroundEnabledSkillIds(schedule.enabledSkills);
        const metadataEnabledSkills = normalizePlaygroundEnabledSkillIds(metadata?.enabledSkills);
        const enabledSkills = directEnabledSkills.length > 0
          ? directEnabledSkills
          : metadataEnabledSkills;
        const directAttachments = normalizePlaygroundTaskAttachmentList(schedule.attachments);
        const metadataAttachments = normalizePlaygroundTaskAttachmentList(metadata?.attachments);
        const attachments = directAttachments.length > 0
          ? directAttachments
          : metadataAttachments;
        const directConnectors = normalizePlaygroundTaskConnectorSelections(schedule.connectors);
        const metadataConnectors = normalizePlaygroundTaskConnectorSelections(metadata?.connectors);
        const connectors = hasPlaygroundTaskConnectorSelections(directConnectors)
          ? directConnectors
          : metadataConnectors;
        const directComments = normalizePlaygroundTaskCommentList(schedule.comments);
        const metadataComments = normalizePlaygroundTaskCommentList(metadata?.comments);
        const comments = directComments.length > 0
          ? directComments
          : metadataComments;

        return {
          ...draft,
          ...schedule,
          id: typeof schedule.id === "string" ? schedule.id : draft.id,
          userId: typeof schedule.userId === "string" ? schedule.userId : draft.userId,
          name: typeof schedule.name === "string" ? schedule.name : draft.name,
          description: typeof schedule.description === "string" ? schedule.description : draft.description,
          agentId: typeof schedule.agentId === "string" && schedule.agentId.trim() ? schedule.agentId.trim() : null,
          agentName: typeof schedule.agentName === "string" && schedule.agentName.trim() ? schedule.agentName.trim() : null,
          task: typeof schedule.task === "string" ? schedule.task : draft.task,
          taskColor,
          priority,
          taskType: normalizedParentTaskId ? taskType : "task",
          parentTaskId: normalizedParentTaskId,
          releaseId,
          dependencyIds,
          attachments,
          enabledSkills,
          connectors,
          comments,
          environmentId: typeof schedule.environmentId === "string" ? schedule.environmentId : draft.environmentId,
          environmentName: typeof schedule.environmentName === "string" && schedule.environmentName.trim() ? schedule.environmentName.trim() : null,
          appId: typeof schedule.appId === "string" && schedule.appId.trim() ? schedule.appId.trim() : null,
          contextId: typeof schedule.contextId === "string" && schedule.contextId.trim()
            ? schedule.contextId.trim()
            : (typeof schedule.context_id === "string" && schedule.context_id.trim()
              ? schedule.context_id.trim()
              : (typeof schedule.projectId === "string" && schedule.projectId.trim() ? schedule.projectId.trim() : null)),
          contextName: typeof schedule.contextName === "string" && schedule.contextName.trim()
            ? schedule.contextName.trim()
            : (typeof schedule.context_name === "string" && schedule.context_name.trim() ? schedule.context_name.trim() : null),
          scheduleType,
          cronExpression: rawCronExpression || null,
          scheduledTime: rawScheduledTime || null,
          timezone: typeof schedule.timezone === "string" && schedule.timezone.trim()
            ? schedule.timezone.trim()
            : (typeof schedule.time_zone === "string" && schedule.time_zone.trim() ? schedule.time_zone.trim() : draft.timezone),
          enabled: schedule.enabled !== false,
          lastRunAt: rawLastRunAt || null,
          nextRunAt: rawNextRunAt || null,
          runCount: Number.isFinite(schedule.runCount) ? Number(schedule.runCount) : (Number.isFinite(schedule.run_count) ? Number(schedule.run_count) : 0),
          successCount: Number.isFinite(schedule.successCount) ? Number(schedule.successCount) : (Number.isFinite(schedule.success_count) ? Number(schedule.success_count) : 0),
          failureCount: Number.isFinite(schedule.failureCount) ? Number(schedule.failureCount) : (Number.isFinite(schedule.failure_count) ? Number(schedule.failure_count) : 0),
          occurrences: Array.isArray(schedule.occurrences)
            ? schedule.occurrences
              .map((occurrence) => {
                const normalizedOccurrence = typeof occurrence === "string"
                  ? occurrence
                  : (typeof occurrence?.start === "string"
                    ? occurrence.start
                    : (typeof occurrence?.scheduledTime === "string"
                      ? occurrence.scheduledTime
                      : (occurrence instanceof Date ? occurrence.toISOString() : "")));
                return normalizedOccurrence && !Number.isNaN(new Date(normalizedOccurrence).getTime())
                  ? normalizedOccurrence
                  : "";
              })
              .filter(Boolean)
            : [],
          metadata,
          createdAt,
          updatedAt,
        };
      }

      function parsePlaygroundScheduleListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.schedules)
            ? data.schedules
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundScheduleRecord);
      }

      function getPlaygroundScheduleResponseRecord(data) {
        const source = data?.schedule || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundScheduleRecord(source)
          : null;
      }

      function getPlaygroundScheduleProjectId(schedule) {
        if (!schedule || typeof schedule !== "object") return "";
        const metadata = schedule.metadata && typeof schedule.metadata === "object" && !Array.isArray(schedule.metadata)
          ? schedule.metadata
          : null;
        const directProjectId = typeof metadata?.projectId === "string" ? metadata.projectId.trim() : "";
        if (directProjectId) return directProjectId;
        const scheduleProjectId = typeof schedule.projectId === "string" ? schedule.projectId.trim() : "";
        if (scheduleProjectId) return scheduleProjectId;
        const runnerProjectId = typeof metadata?.runnerProjectId === "string" ? metadata.runnerProjectId.trim() : "";
        if (runnerProjectId) return runnerProjectId;
        return typeof schedule.contextId === "string" ? schedule.contextId.trim() : "";
      }

`;
