export const METRONOME_APP_MENU_STATE_SCRIPT = `
        const [metronomeRunActionMenuState, setMetronomeRunActionMenuState] = useState(null);
        const [threadNavMenuOpen, setThreadNavMenuOpen] = useState(false);
        const [threadTaskListMenuOpen, setThreadTaskListMenuOpen] = useState(false);
        const [threadTaskListAvailabilityById, setThreadTaskListAvailabilityById] = useState({});
        const [threadTaskListState, setThreadTaskListState] = useState({
          threadId: "",
          status: "idle",
          error: "",
          todos: [],
          updatedAt: "",
        });
`;
