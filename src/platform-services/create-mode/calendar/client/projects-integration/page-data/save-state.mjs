export const CALENDAR_PROJECTS_PAGE_SAVE_STATE_SCRIPT = `
        function resetScheduleSaveState(error = "") {
          setScheduleSaveState({
            isSaving: false,
            error,
          });
        }

`;
