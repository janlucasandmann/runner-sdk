export const CALENDAR_PROJECTS_PAGE_SHELL_EDITOR_STATE_SCRIPT = `
        const [scheduleViewMode, setScheduleViewMode] = useState("calendar");
        const [scheduleEditorMode, setScheduleEditorMode] = useState("create");
        const [selectedScheduleId, setSelectedScheduleId] = useState("");
        const [scheduleDraft, setScheduleDraft] = useState(buildPlaygroundDefaultScheduleDraft());
        const [scheduleSaveState, setScheduleSaveState] = useState({
          isSaving: false,
          error: "",
        });
        const [isScheduleTaskEditing, setIsScheduleTaskEditing] = useState(false);
        const [isScheduleDescriptionEditing, setIsScheduleDescriptionEditing] = useState(false);
        const [scheduleDetailsCollapsed, setScheduleDetailsCollapsed] = useState(false);
        const [scheduleCalendarView, setScheduleCalendarView] = useState("week");
        const [scheduleCalendarDate, setScheduleCalendarDate] = useState(() => new Date());
        const allowedScheduleCalendarViews = ["day", "week", "month"];
        const activeScheduleCalendarView = allowedScheduleCalendarViews.includes(scheduleCalendarView) ? scheduleCalendarView : "week";
`;
