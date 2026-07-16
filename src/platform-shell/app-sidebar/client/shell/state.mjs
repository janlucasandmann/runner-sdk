export const APP_SIDEBAR_LAYOUT_STATE_SCRIPT = `        const initialSidebarWorkspaceMode = "work";
        const [sidebarOpen, setSidebarOpen] = useState(true);
`;

export const APP_SIDEBAR_MODE_STATE_SCRIPT = `        const [sidebarWorkspaceMode, setSidebarWorkspaceMode] = useState(initialSidebarWorkspaceMode);
        const [sidebarWorkspaceMenuOpen, setSidebarWorkspaceMenuOpen] = useState(false);
        const [renderedSidebarWorkspaceMenu, setRenderedSidebarWorkspaceMenu] = useState(false);
`;
