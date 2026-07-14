export const CALENDAR_PROJECTS_PAGE_DRAFT_UPDATES_SCRIPT = `
        function updateScheduleDraft(updater, options = {}) {
          const baseSchedule = normalizePlaygroundScheduleRecord(scheduleDraft || buildProjectScheduleDraft(selectedProject));
          const nextSchedule = normalizePlaygroundScheduleRecord(
            typeof updater === "function" ? updater(baseSchedule) : updater
          );
          setScheduleDraft(nextSchedule);
          scheduleEditorDirtyRef.current = true;
          setScheduleSaveState((current) => ({
            ...current,
            error: "",
          }));
          if (options.autosave !== false) {
            queueScheduleAutosave(nextSchedule);
          }
          return nextSchedule;
        }

        function updateScheduleDraftField(field, value, options = {}) {
          return updateScheduleDraft((current) => ({
            ...current,
            [field]: value,
          }), options);
        }

`;
