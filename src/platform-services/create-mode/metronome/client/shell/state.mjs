export const METRONOME_APP_STATE_SCRIPT = `
        const [metronomeProjectFilterId, setMetronomeProjectFilterId] = useState("");
        const [metronomeOpenWorkflowRequest, setMetronomeOpenWorkflowRequest] = useState(null);
        const [metronomeTopNavState, setMetronomeTopNavState] = useState(null);
        const [metronomeTopNavMenuOpen, setMetronomeTopNavMenuOpen] = useState(false);
        const [isMetronomeNodeDetailOpen, setIsMetronomeNodeDetailOpen] = useState(false);
        const [collapsedMetronomeRunGroups, setCollapsedMetronomeRunGroups] = useState({});
        const [metronomeRunTraceSelection, setMetronomeRunTraceSelection] = useState(null);
        const [metronomeRunTraceState, setMetronomeRunTraceState] = useState({
          key: "",
          status: "idle",
          run: null,
          error: "",
        });
        const [metronomeRunTraceWorkExpanded, setMetronomeRunTraceWorkExpanded] = useState(true);
        const [metronomeRunJsonViewModeByKey, setMetronomeRunJsonViewModeByKey] = useState({});
        const [metronomeRunJsonEditorModule, setMetronomeRunJsonEditorModule] = useState(null);
        const [metronomeRunJsonEditorModuleError, setMetronomeRunJsonEditorModuleError] = useState("");
        const [optimisticMetronomeRunEntries, setOptimisticMetronomeRunEntries] = useState({});
        const [absorbedMetronomeTriggerThreadIds, setAbsorbedMetronomeTriggerThreadIds] = useState({});
        const [metronomeRunStatusByKey, setMetronomeRunStatusByKey] = useState({});
        const [metronomeRunStatusRefreshTick, setMetronomeRunStatusRefreshTick] = useState(0);
        const metronomeRunTraceSelectionRef = useRef(null);
        const metronomeSidebarRunsLoadKeyRef = useRef("");
        const metronomeRunTraceSeenStepKeysRef = useRef({
          key: "",
          hydrated: false,
          keys: new Set(),
        });
        const metronomeRunTraceAnimatedStepKeysRef = useRef({
          key: "",
          keys: new Set(),
        });
        const absorbedMetronomeTriggerThreadIdsRef = useRef({});
        const metronomeTopNavMenuRef = useRef(null);
        const wasMetronomeVisualEditorOpenRef = useRef(false);
        const metronomeTopNavActionsRef = useRef({
          edit: null,
          rename: null,
          duplicate: null,
          share: null,
          delete: null,
          publish: null,
          run: null,
          goOverview: null,
          setMode: null,
        });
        const shouldLoadMetronomeRunJsonEditor = useMemo(() => (
          Object.values(metronomeRunJsonViewModeByKey || {}).some((mode) => mode === "json")
        ), [metronomeRunJsonViewModeByKey]);
        useEffect(() => {
          if (!shouldLoadMetronomeRunJsonEditor || metronomeRunJsonEditorModule || metronomeRunJsonEditorModuleError) {
            return;
          }

          let cancelled = false;

          void loadPlaygroundCodeEditorModule()
            .then((module) => {
              if (cancelled || !module) {
                return;
              }
              setMetronomeRunJsonEditorModule(module);
              setMetronomeRunJsonEditorModuleError("");
              void module.loader?.init?.()
                .then((monaco) => {
                  if (!cancelled) {
                    ensurePlaygroundCodeEditorTheme(monaco);
                  }
                })
                .catch(() => {});
            })
            .catch((error) => {
              if (cancelled) {
                return;
              }
              setMetronomeRunJsonEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
            });

          return () => {
            cancelled = true;
          };
        }, [shouldLoadMetronomeRunJsonEditor, metronomeRunJsonEditorModule, metronomeRunJsonEditorModuleError]);
`;
