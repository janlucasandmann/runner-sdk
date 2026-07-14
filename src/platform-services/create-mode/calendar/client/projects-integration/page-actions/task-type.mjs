export const CALENDAR_PROJECTS_PAGE_TASK_TYPE_SCRIPT = `
        function handleScheduleTaskTypeSelection(nextType) {
          const normalizedType = normalizePlaygroundTaskType(nextType);
          const currentTaskType = normalizePlaygroundTaskType(scheduleDraft?.taskType);
          if (normalizedType === "subtask") {
            openScheduleTaskParentPicker();
            return;
          }
          if (currentTaskType === normalizedType && !normalizePlaygroundParentTaskId(scheduleDraft?.parentTaskId)) {
            return;
          }
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            taskType: normalizedType,
            parentTaskId: null,
          }));
        }

`;
