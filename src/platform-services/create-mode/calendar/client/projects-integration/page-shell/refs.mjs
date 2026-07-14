export const CALENDAR_PROJECTS_PAGE_SHELL_REFS_SCRIPT = `
        const scheduleDraftRef = useRef(buildPlaygroundDefaultScheduleDraft());
        const scheduleAutosaveTimerRef = useRef(null);
        const scheduleAutosaveInFlightRef = useRef(false);
        const scheduleAutosaveQueuedRef = useRef(null);
        const scheduleEditorDirtyRef = useRef(false);
`;
