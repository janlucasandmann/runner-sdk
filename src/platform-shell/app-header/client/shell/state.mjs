export const APP_HEADER_STATE_SCRIPT = `        const [accountMenuOpen, setAccountMenuOpen] = useState(false);
        const [accountMenuPlacement, setAccountMenuPlacement] = useState("sidebar");
        const [renderedAccountMenu, setRenderedAccountMenu] = useState(false);
        const [accountMenuPhase, setAccountMenuPhase] = useState("idle");
        const [notificationsOpen, setNotificationsOpen] = useState(false);
        const [threadSearchOpen, setThreadSearchOpen] = useState(false);
        const [threadSearchQuery, setThreadSearchQuery] = useState("");
        const [threadSearchMode, setThreadSearchMode] = useState("threads");
        const [threadSearchAllActionsVisible, setThreadSearchAllActionsVisible] = useState(false);
        const [threadSearchFileInventoryByEnvironmentId, setThreadSearchFileInventoryByEnvironmentId] = useState({});
        const [threadSearchFileInventoryLoadingByEnvironmentId, setThreadSearchFileInventoryLoadingByEnvironmentId] = useState({});
        const [threadSearchResourceDataByMode, setThreadSearchResourceDataByMode] = useState({
          threads: { scopeKey: "", query: "", items: [], total: 0 },
          agents: { scopeKey: "", items: [] },
          tickets: { scopeKey: "", items: [] },
          workflows: { scopeKey: "", items: [] },
        });
        const [threadSearchResourceLoadingByMode, setThreadSearchResourceLoadingByMode] = useState({});
        const [threadSearchResourceErrorByMode, setThreadSearchResourceErrorByMode] = useState({});
`;
