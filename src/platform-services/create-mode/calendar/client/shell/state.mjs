export const CALENDAR_APP_STATE_SCRIPT = `
        const [calendarTopNavState, setCalendarTopNavState] = useState({
          label: "Calendar",
          view: "week",
          isTodayActive: true,
        });
        const calendarTopNavActionsRef = useRef({
          navigate: null,
          setView: null,
          create: null,
        });
`;
