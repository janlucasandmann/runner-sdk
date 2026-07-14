export const CALENDAR_PROJECTS_PAGE_PARENT_SELECTION_SCRIPT = `
        function handleSelectScheduleParent(parentTaskId) {
          const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
          const parentTask = normalizedParentTaskId ? tasksById[normalizedParentTaskId] || null : null;
          if (!normalizedParentTaskId || !parentTask || isPlaygroundSubtaskRecord(parentTask)) {
            return;
          }
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            taskType: "subtask",
            parentTaskId: normalizedParentTaskId,
          }));
          setTaskParentPickerState(null);
        }

`;
