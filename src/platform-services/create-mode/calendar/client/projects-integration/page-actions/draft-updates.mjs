export const CALENDAR_PROJECTS_PAGE_DRAFT_UPDATES_SCRIPT = `
        function updateScheduleDraft(updater) {
          const baseSchedule = normalizePlaygroundScheduleRecord(scheduleDraft || buildProjectScheduleDraft(selectedProject));
          const nextSchedule = normalizePlaygroundScheduleRecord(
            typeof updater === "function" ? updater(baseSchedule) : updater
          );
          setScheduleDraft(nextSchedule);
          scheduleEditorRevisionRef.current += 1;
          setScheduleHasUnsavedChanges(true);
          setScheduleSaveState((current) => ({
            ...current,
            error: "",
          }));
          return nextSchedule;
        }

        function updateScheduleDraftField(field, value) {
          return updateScheduleDraft((current) => ({
            ...current,
            [field]: value,
          }));
        }

`;
