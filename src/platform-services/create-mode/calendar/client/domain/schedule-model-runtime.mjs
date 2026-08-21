export const CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT = `
      function getPlaygroundScheduleExecutionSources(schedule) {
        const source = schedule && typeof schedule === "object" && !Array.isArray(schedule) ? schedule : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        return [
          source,
          source.execution,
          source.lastExecution,
          metadata,
          metadata.execution,
          metadata.lastExecution,
        ].filter((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
      }

      function readPlaygroundScheduleExecutionId(sources, keys) {
        for (const source of Array.isArray(sources) ? sources : []) {
          for (const key of keys) {
            const value = typeof source?.[key] === "string" ? source[key].trim() : "";
            if (value) return value;
          }
        }
        return "";
      }

      function getPlaygroundScheduleExecutionHistory(schedule) {
        const source = schedule && typeof schedule === "object" && !Array.isArray(schedule) ? schedule : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        const history = [
          source.executionHistory,
          source.scheduleExecutions,
          metadata.executionHistory,
          metadata.scheduleExecutions,
        ].find((candidate) => Array.isArray(candidate)) || [];
        return history.filter((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
      }

      function getPlaygroundScheduleThreadSources(thread) {
        const source = thread && typeof thread === "object" && !Array.isArray(thread) ? thread : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const taskPreview = runnerPlayground.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
          ? runnerPlayground.taskPreview
          : {};
        return [source, metadata, metadata.execution, runnerPlayground, taskPreview]
          .filter((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
      }

      function findPlaygroundScheduleExecutionThreadId(schedule, occurrenceAt = "", threadRecords = []) {
        const scheduleId = String(schedule?.id || "").trim();
        if (!scheduleId) return "";
        const occurrenceTime = new Date(occurrenceAt || schedule?.scheduledTime || "").getTime();
        const candidates = (Array.isArray(threadRecords) ? threadRecords : [])
          .map((thread) => {
            const sources = getPlaygroundScheduleThreadSources(thread);
            const linkedScheduleId = readPlaygroundScheduleExecutionId(sources, [
              "scheduleId", "schedule_id", "sourceScheduleId", "source_schedule_id",
            ]);
            const threadId = readPlaygroundScheduleExecutionId(sources, ["threadId", "thread_id", "id"]);
            if (linkedScheduleId !== scheduleId || !threadId) return null;
            const scheduledFor = readPlaygroundScheduleExecutionId(sources, [
              "scheduledFor", "scheduled_for", "scheduledAt", "scheduled_at", "occurrenceAt", "occurrence_at",
            ]);
            const threadTime = new Date(
              scheduledFor
              || thread?.startedAt
              || thread?.started_at
              || thread?.createdAt
              || thread?.created_at
              || ""
            ).getTime();
            return {
              threadId,
              distance: Number.isFinite(occurrenceTime) && Number.isFinite(threadTime)
                ? Math.abs(threadTime - occurrenceTime)
                : Number.POSITIVE_INFINITY,
              threadTime,
            };
          })
          .filter(Boolean)
          .sort((left, right) => {
            if (left.distance !== right.distance) return left.distance - right.distance;
            return (right.threadTime || 0) - (left.threadTime || 0);
          });
        if (candidates.length === 0) return "";
        if (String(schedule?.scheduleType || "") !== "recurring") {
          return candidates[0].threadId;
        }
        return candidates[0].distance <= (24 * 60 * 60 * 1000) ? candidates[0].threadId : "";
      }

      function getPlaygroundScheduleExecutionRecord(schedule, occurrenceAt = "", threadRecords = []) {
        const occurrenceTime = new Date(occurrenceAt || "").getTime();
        const history = getPlaygroundScheduleExecutionHistory(schedule);
        let historyRecord = null;
        if (history.length > 0 && Number.isFinite(occurrenceTime)) {
          const rankedHistory = history
            .map((record) => {
              const scheduledFor = String(
                record.scheduledFor || record.scheduled_for || record.occurrenceAt || record.occurrence_at || ""
              ).trim();
              const scheduledForTime = new Date(scheduledFor).getTime();
              return {
                record,
                distance: Number.isFinite(scheduledForTime)
                  ? Math.abs(scheduledForTime - occurrenceTime)
                  : Number.POSITIVE_INFINITY,
              };
            })
            .sort((left, right) => left.distance - right.distance);
          if (rankedHistory[0] && rankedHistory[0].distance <= (5 * 60 * 1000)) {
            historyRecord = rankedHistory[0].record;
          }
        }
        if (!historyRecord && history.length > 0 && String(schedule?.scheduleType || "") !== "recurring") {
          historyRecord = history[history.length - 1];
        }

        const hasUnmatchedRecurringOccurrence = !historyRecord
          && history.length > 0
          && String(schedule?.scheduleType || "") === "recurring"
          && Number.isFinite(occurrenceTime);
        const sources = historyRecord
          ? [historyRecord].concat(getPlaygroundScheduleExecutionSources(schedule))
          : hasUnmatchedRecurringOccurrence
            ? []
            : getPlaygroundScheduleExecutionSources(schedule);
        const directThreadId = readPlaygroundScheduleExecutionId(sources, [
            "threadId", "thread_id", "executionThreadId", "execution_thread_id",
            "lastThreadId", "last_thread_id", "originThreadId", "origin_thread_id",
            "sourceThreadId", "source_thread_id",
          ]);
        return {
          threadId: directThreadId || findPlaygroundScheduleExecutionThreadId(schedule, occurrenceAt, threadRecords),
          workflowRunId: readPlaygroundScheduleExecutionId(sources, [
            "workflowRunId", "workflow_run_id", "metronomeRunId", "metronome_run_id",
            "lastWorkflowRunId", "last_workflow_run_id", "runId", "run_id",
          ]),
        };
      }

      function getPlaygroundScheduleExecutionAction(schedule, occurrenceAt = "", nowValue = Date.now(), threadRecords = []) {
        const source = schedule && typeof schedule === "object" && !Array.isArray(schedule) ? schedule : {};
        const eventAt = String(
          occurrenceAt
          || source.scheduledTime
          || source.scheduled_time
          || source.lastRunAt
          || source.last_run_at
          || ""
        ).trim();
        const eventTime = new Date(eventAt).getTime();
        const nowTime = nowValue instanceof Date ? nowValue.getTime() : Number(nowValue);
        if (!Number.isFinite(eventTime) || !Number.isFinite(nowTime) || eventTime >= nowTime) {
          return null;
        }
        const execution = getPlaygroundScheduleExecutionRecord(source, eventAt, threadRecords);
        if (!execution.threadId && !execution.workflowRunId) {
          return null;
        }
        const targetType = normalizePlaygroundScheduleTargetType(
          source.targetType
          || source.target_type
          || source.metadata?.scheduleTargetType
          || source.metadata?.targetType
          || source.metadata?.targetKind
        );
        return {
          ...execution,
          targetType,
          label: targetType === "workflow"
            ? "View Workflow"
            : targetType === "loop"
              ? "View Loop"
              : "View Thread",
        };
      }

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
          || "blue"
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
        const targetType = normalizePlaygroundScheduleTargetType(
          schedule.targetType
          || schedule.target_type
          || metadata?.scheduleTargetType
          || metadata?.targetType
          || metadata?.targetKind
          || taskType
        );
        const workflowId = typeof schedule.workflowId === "string" && schedule.workflowId.trim()
          ? schedule.workflowId.trim()
          : (typeof schedule.workflow_id === "string" && schedule.workflow_id.trim()
            ? schedule.workflow_id.trim()
            : (typeof metadata?.workflowId === "string" && metadata.workflowId.trim()
              ? metadata.workflowId.trim()
              : (typeof metadata?.metronomeId === "string" && metadata.metronomeId.trim() ? metadata.metronomeId.trim() : null)));
        const workflowName = typeof schedule.workflowName === "string" && schedule.workflowName.trim()
          ? schedule.workflowName.trim()
          : (typeof schedule.workflow_name === "string" && schedule.workflow_name.trim()
            ? schedule.workflow_name.trim()
            : (typeof metadata?.workflowName === "string" && metadata.workflowName.trim()
              ? metadata.workflowName.trim()
              : (typeof metadata?.metronomeName === "string" && metadata.metronomeName.trim() ? metadata.metronomeName.trim() : null)));
        const batchJobId = typeof schedule.batchJobId === "string" && schedule.batchJobId.trim()
          ? schedule.batchJobId.trim()
          : (typeof schedule.batch_job_id === "string" && schedule.batch_job_id.trim()
            ? schedule.batch_job_id.trim()
            : (typeof metadata?.batchJobId === "string" && metadata.batchJobId.trim()
              ? metadata.batchJobId.trim()
              : (typeof metadata?.batch_job_id === "string" && metadata.batch_job_id.trim() ? metadata.batch_job_id.trim() : null)));
        const batchJobName = typeof schedule.batchJobName === "string" && schedule.batchJobName.trim()
          ? schedule.batchJobName.trim()
          : (typeof schedule.batch_job_name === "string" && schedule.batch_job_name.trim()
            ? schedule.batch_job_name.trim()
            : (typeof metadata?.batchJobName === "string" && metadata.batchJobName.trim()
              ? metadata.batchJobName.trim()
              : (typeof metadata?.batch_job_name === "string" && metadata.batch_job_name.trim() ? metadata.batch_job_name.trim() : null)));
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
          targetType,
          workflowId: targetType === "workflow" ? workflowId : null,
          workflowName: targetType === "workflow" ? workflowName : null,
          batchJobId: targetType === "batch" ? batchJobId : null,
          batchJobName: targetType === "batch" ? batchJobName : null,
          taskType: targetType === "loop" ? "loop" : "task",
          parentTaskId: null,
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
