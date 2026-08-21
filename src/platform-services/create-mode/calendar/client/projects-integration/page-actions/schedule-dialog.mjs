export const CALENDAR_PROJECTS_PAGE_SCHEDULE_DIALOG_SCRIPT = `
        function closeTaskScheduleDialog() {
          if (!taskScheduleDialogState) {
            return;
          }
          if (taskScheduleDialogState.target === "issue") {
            setIssueComposerDetailSelectPopover("");
          }
          if (taskScheduleDialogTimerRef.current) {
            window.clearTimeout(taskScheduleDialogTimerRef.current);
          }
          setTaskScheduleDialogPhase("exit");
          taskScheduleDialogTimerRef.current = window.setTimeout(() => {
            setTaskScheduleDialogState(null);
            setTaskScheduleDialogPhase("idle");
            taskScheduleDialogTimerRef.current = null;
          }, 180);
        }

        function buildTaskScheduleDialogStateFromTask(taskRecord, target = "task") {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const scheduleConfig = getPlaygroundTaskScheduleConfig(normalizedTask);
          const presetId = getPlaygroundTaskSchedulePresetId(scheduleConfig.cronExpression);
          return {
            target,
            scheduleType: scheduleConfig.scheduleType,
            start: toPlaygroundDatetimeLocalValue(scheduleConfig.scheduledStartAt),
            cronExpression: scheduleConfig.cronExpression || getPlaygroundTaskSchedulePreset(presetId).cron,
            presetId,
            timezone: scheduleConfig.timezone || "UTC",
            enabled: scheduleConfig.enabled !== false,
            error: "",
          };
        }

        function buildTaskScheduleDialogStateFromSchedule(scheduleRecord) {
          const normalizedSchedule = normalizePlaygroundScheduleRecord(scheduleRecord);
          const presetId = getPlaygroundTaskSchedulePresetId(normalizedSchedule.cronExpression);
          return {
            target: "schedule",
            scheduleType: normalizedSchedule.scheduleType === "recurring" ? "recurring" : "one-time",
            start: toPlaygroundDatetimeLocalValue(normalizedSchedule.scheduledTime),
            cronExpression: normalizedSchedule.cronExpression || getPlaygroundTaskSchedulePreset(presetId).cron,
            presetId,
            timezone: normalizedSchedule.timezone || "UTC",
            enabled: normalizedSchedule.enabled !== false,
            error: "",
          };
        }

        function openTaskScheduleDialog(target = "task") {
          if (target === "schedule") {
            if (scheduleViewMode !== "setup") {
              return;
            }
          } else if (target === "issue") {
            if (!issueComposerOpen) {
              return;
            }
          } else if (!draftTask?.id) {
            return;
          }
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskDetailSelectPopover("");
          setIssueComposerDetailSelectPopover(target === "issue" ? "schedule" : "");
          if (taskScheduleDialogState) {
            closeTaskScheduleDialog();
            return;
          }
          if (taskScheduleDialogTimerRef.current) {
            window.clearTimeout(taskScheduleDialogTimerRef.current);
            taskScheduleDialogTimerRef.current = null;
          }
          setTaskScheduleDialogPhase("enter");
          setTaskScheduleDialogState(
            target === "schedule"
              ? buildTaskScheduleDialogStateFromSchedule(scheduleDraft)
              : buildTaskScheduleDialogStateFromTask(
                  target === "issue" ? issueComposerDraft : draftTask,
                  target
                )
          );
        }

        function handleTaskScheduleDialogSave() {
          if (!taskScheduleDialogState) {
            return;
          }

          const nextStart = fromPlaygroundDatetimeLocalValue(taskScheduleDialogState.start);
          const nextScheduleType = taskScheduleDialogState.scheduleType === "recurring" ? "recurring" : "one-time";
          const nextTimezone = String(taskScheduleDialogState.timezone || "").trim() || "UTC";
          const nextPresetId = taskScheduleDialogState.presetId || getPlaygroundTaskSchedulePresetId(taskScheduleDialogState.cronExpression);
          const nextCronExpression = nextScheduleType === "recurring"
            ? (nextPresetId
                ? buildPlaygroundCronExpressionForPreset(nextPresetId, nextStart || Date.now())
                : String(taskScheduleDialogState.cronExpression || "").trim())
            : null;

          if (!nextStart) {
            setTaskScheduleDialogState((current) => current
              ? {
                  ...current,
                  error: "Choose a start date and time.",
                }
              : current
            );
            return;
          }

          if (nextScheduleType === "recurring" && !nextCronExpression) {
            setTaskScheduleDialogState((current) => current
              ? {
                  ...current,
                  error: "Choose a recurring schedule.",
                }
              : current
            );
            return;
          }

          if (taskScheduleDialogState.target === "schedule") {
            updateScheduleDraft((current) => ({
              ...(current || buildProjectScheduleDraft(selectedProject)),
              scheduleType: nextScheduleType,
              scheduledTime: nextStart,
              nextRunAt: nextStart,
              cronExpression: nextScheduleType === "recurring" ? nextCronExpression : null,
              timezone: nextTimezone,
              enabled: taskScheduleDialogState.enabled !== false,
            }));
            closeTaskScheduleDialog();
            return;
          }

          if (taskScheduleDialogState.target === "issue") {
            updateIssueComposerDraft((current) => ({
              ...current,
              scheduledStartAt: nextStart,
              scheduledEndAt: null,
              scheduleType: nextScheduleType,
              cronExpression: nextScheduleType === "recurring" ? nextCronExpression : null,
              scheduleTimezone: nextTimezone,
              scheduleEnabled: taskScheduleDialogState.enabled !== false,
            }));
            closeTaskScheduleDialog();
            return;
          }

          if (!draftTask?.id) {
            return;
          }

          updateDraftTask((current) => ({
            ...current,
            scheduledStartAt: nextStart,
            scheduledEndAt: null,
            scheduleType: nextScheduleType,
            cronExpression: nextScheduleType === "recurring" ? nextCronExpression : null,
            scheduleTimezone: nextTimezone,
            scheduleEnabled: taskScheduleDialogState.enabled !== false,
          }));
          closeTaskScheduleDialog();
        }

        function handleTaskScheduleDialogClear() {
          if (!taskScheduleDialogState) {
            return;
          }

          if (taskScheduleDialogState.target === "schedule") {
            updateScheduleDraft((current) => ({
              ...(current || buildProjectScheduleDraft(selectedProject)),
              scheduleType: "one-time",
              scheduledTime: null,
              nextRunAt: null,
              cronExpression: null,
            }));
            closeTaskScheduleDialog();
            return;
          }
          if (taskScheduleDialogState.target === "issue") {
            updateIssueComposerDraft((current) => ({
              ...current,
              scheduledStartAt: null,
              scheduledEndAt: null,
              scheduleType: "one-time",
              cronExpression: null,
            }));
            closeTaskScheduleDialog();
            return;
          }

          if (!draftTask?.id) {
            return;
          }
          updateDraftTask((current) => ({
            ...current,
            scheduledStartAt: null,
            scheduledEndAt: null,
            scheduleType: "one-time",
            cronExpression: null,
          }));
          closeTaskScheduleDialog();
        }

`;
