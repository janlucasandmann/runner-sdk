export const CALENDAR_PROJECTS_PAGE_SHELL_COLLECTION_STATE_SCRIPT = `
        const [schedules, setSchedules] = useState([]);
        const [calendarMetronomeWorkflows, setCalendarMetronomeWorkflows] = useState([]);
        const [scheduleLoadState, setScheduleLoadState] = useState({
          status: "idle",
          error: "",
        });
        const [calendarUpgradeModalOpen, setCalendarUpgradeModalOpen] = useState(false);
        const [calendarUpgradeCheckoutLoading, setCalendarUpgradeCheckoutLoading] = useState(false);
`;
