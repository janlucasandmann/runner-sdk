export const CALENDAR_PROJECTS_PAGE_SHELL_EDITOR_STATE_SCRIPT = `
        const [scheduleViewMode, setScheduleViewMode] = useState("calendar");
        const [scheduleEditorMode, setScheduleEditorMode] = useState("create");
        const [selectedScheduleId, setSelectedScheduleId] = useState("");
        const [selectedScheduleOccurrenceAt, setSelectedScheduleOccurrenceAt] = useState("");
        const [scheduleDraft, setScheduleDraft] = useState(buildPlaygroundDefaultScheduleDraft());
        const [scheduleSaveState, setScheduleSaveState] = useState({
          isSaving: false,
          error: "",
        });
        const [scheduleHasUnsavedChanges, setScheduleHasUnsavedChanges] = useState(false);
        const [isScheduleTaskEditing, setIsScheduleTaskEditing] = useState(false);
        const [isScheduleDescriptionEditing, setIsScheduleDescriptionEditing] = useState(false);
        const [scheduleDetailsCollapsed, setScheduleDetailsCollapsed] = useState(false);
        const [scheduleWorkflowSearchQuery, setScheduleWorkflowSearchQuery] = useState("");
        const [scheduleBatchSearchQuery, setScheduleBatchSearchQuery] = useState("");
        const [scheduleWorkflowRunState, setScheduleWorkflowRunState] = useState({
          status: "idle",
          workflowId: "",
          context: null,
          contracts: [],
          contractId: "",
          values: {},
          error: "",
        });
        const [scheduleCalendarView, setScheduleCalendarView] = useState("week");
        const [scheduleCalendarDate, setScheduleCalendarDate] = useState(() => new Date());
        const [scheduleCurrentTime, setScheduleCurrentTime] = useState(() => new Date());
        const [scheduleContextMenu, setScheduleContextMenu] = useState(null);
        const scheduleContextMenuRef = useRef(null);
        const allowedScheduleCalendarViews = ["day", "week", "month"];
        const activeScheduleCalendarView = allowedScheduleCalendarViews.includes(scheduleCalendarView) ? scheduleCalendarView : "week";

        useEffect(() => {
          const updateScheduleCurrentTime = () => setScheduleCurrentTime(new Date());
          const intervalId = window.setInterval(updateScheduleCurrentTime, 30000);
          return () => window.clearInterval(intervalId);
        }, []);

        useEffect(() => {
          if (!scheduleContextMenu) return undefined;
          const closeScheduleContextMenu = (event) => {
            if (event?.type === "keydown" && event.key !== "Escape") return;
            if (
              event?.type !== "keydown"
              && scheduleContextMenuRef.current
              && event?.target instanceof Node
              && scheduleContextMenuRef.current.contains(event.target)
            ) {
              return;
            }
            setScheduleContextMenu(null);
          };
          window.addEventListener("pointerdown", closeScheduleContextMenu);
          window.addEventListener("keydown", closeScheduleContextMenu);
          return () => {
            window.removeEventListener("pointerdown", closeScheduleContextMenu);
            window.removeEventListener("keydown", closeScheduleContextMenu);
          };
        }, [scheduleContextMenu]);
`;
