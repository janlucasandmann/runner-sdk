export const EVALUATIONS_PAGE_CONTROLLER_SETUP_SCRIPT = String.raw`      function renderPlaygroundEvaluationsPage(options = {}) {
        return React.createElement(PlaygroundEvaluationsPageView, options);
      }

      function PlaygroundEvaluationsPageView(options = {}) {
        const {
          evaluationSets,
          setEvaluationSets,
          selectedEvaluationSetId,
          setSelectedEvaluationSetId,
          selectedEvaluationRunId,
          setSelectedEvaluationRunId,
          selectedEvaluationCaseId,
          setSelectedEvaluationCaseId,
          evaluationsPageMode,
          setEvaluationsPageMode,
          evaluationDetailTab,
          setEvaluationDetailTab,
          evaluationsSearchQuery,
          setEvaluationsSearchQuery,
          evaluationCreateModalOpen,
          setEvaluationCreateModalOpen,
          evaluationCreateForm,
          setEvaluationCreateForm,
          backendUrl,
          requestHeaders,
          agents,
          environments,
          projects,
          defaultAgentId,
          defaultEnvironmentId,
          currentUserId,
          currentUserName,
          currentUserEmail,
          currentUserAvatarUrl,
          evaluationRunModalOpen,
          setEvaluationRunModalOpen,
          evaluationRunForm,
          setEvaluationRunForm,
          evaluationRunsSearchQuery,
          setEvaluationRunsSearchQuery,
          evaluationRunsSortMode,
          setEvaluationRunsSortMode,
          evaluationRunsFilterMode,
          setEvaluationRunsFilterMode,
          evaluationRunsToolbarPopover,
          setEvaluationRunsToolbarPopover,
          evaluationRunsVisibleCount,
          setEvaluationRunsVisibleCount,
          onOpenThread,
          onEvaluationThreadStarted,
          evaluationRunReturnTarget,
          onEvaluationRunBack,
          topNavActionsPortalId,
          versionsDrawerPortalId,
          onVersionsSidebarOpenChange,
          threadRecords,
          onRefreshThreadRecords,
          shouldLoadData = false,
        } = options;
        const evaluationActionsPopoverRef = useRef(null);
        const evaluationPublishMenuRef = useRef(null);
        const evaluationRenameInputRef = useRef(null);
        const evaluationGuidanceTextareaRef = useRef(null);
        const evaluationCaseEditorTextareaRefs = useRef({});
        const evaluationCaseEditorFrameRef = useRef(null);
        const evaluationCaseEditorCloseTimerRef = useRef(null);
        const evaluationCreateModalFrameRef = useRef(null);
        const evaluationCreateModalCloseTimerRef = useRef(null);
        const evaluationRunModalFrameRef = useRef(null);
        const evaluationRunModalCloseTimerRef = useRef(null);
        const evaluationVersionDescriptionTextareaRef = useRef(null);
        const evaluationVersionModalFrameRef = useRef(null);
        const evaluationVersionModalCloseTimerRef = useRef(null);
        const evaluationVersionBaselineRef = useRef({ key: "", signature: "" });
        const evaluationVersionDraftTouchedRef = useRef(false);
        const evaluationBackendLoadRef = useRef("");
        const evaluationBackendLoadedRef = useRef(false);
        const evaluationDetailsLoadedRef = useRef(new Set());
        const evaluationBackendMigratedLocalRef = useRef(false);
        const evaluationSetPersistTimersRef = useRef(new Map());
        const evaluationSetPersistSignaturesRef = useRef(new Map());
        const evaluationJsonlFileInputRef = useRef(null);
        const announcedEvaluationThreadIdsRef = useRef(new Set());
        const hydratedEvaluationRunCostIdsRef = useRef(new Set());
        const [evaluationTopNavActionsContainer, setEvaluationTopNavActionsContainer] = useState(null);
        const [evaluationActionsPopoverOpen, setEvaluationActionsPopoverOpen] = useState(false);
        const [evaluationRenameState, setEvaluationRenameState] = useState(null);
        const [evaluationRenameValue, setEvaluationRenameValue] = useState("");
        const [evaluationRenameError, setEvaluationRenameError] = useState("");
        const [evaluationCasesSearchQuery, setEvaluationCasesSearchQuery] = useState("");
        const [evaluationCasesSortMode, setEvaluationCasesSortMode] = useState("case-asc");
        const [evaluationCasesFilterMode, setEvaluationCasesFilterMode] = useState("all");
        const [evaluationCasesToolbarPopover, setEvaluationCasesToolbarPopover] = useState("");
        const [evaluationCasesVisibleCount, setEvaluationCasesVisibleCount] = useState(10);
        const [evaluationSetsSortMode, setEvaluationSetsSortMode] = useState("updated-desc");
        const [evaluationSetsFilterMode, setEvaluationSetsFilterMode] = useState("all");
        const [evaluationSetsToolbarPopover, setEvaluationSetsToolbarPopover] = useState("");
        const [evaluationSetsVisibleCount, setEvaluationSetsVisibleCount] = useState(10);
        const [evaluationSetRowMenuId, setEvaluationSetRowMenuId] = useState("");
        const [selectedEvaluationOverviewIds, setSelectedEvaluationOverviewIds] = useState(() => new Set());
        const [evaluationRunRowMenuId, setEvaluationRunRowMenuId] = useState("");
        const [evaluationCaseRowMenuId, setEvaluationCaseRowMenuId] = useState("");
        const [evaluationCreateModalVisible, setEvaluationCreateModalVisible] = useState(false);
        const [evaluationCreateModalClosing, setEvaluationCreateModalClosing] = useState(false);
        const [evaluationRunModalVisible, setEvaluationRunModalVisible] = useState(false);
        const [evaluationRunModalClosing, setEvaluationRunModalClosing] = useState(false);
        const [evaluationGuidanceEditingId, setEvaluationGuidanceEditingId] = useState("");
        const [evaluationGuidanceHistoryById, setEvaluationGuidanceHistoryById] = useState({});
        const [evaluationCaseEditorState, setEvaluationCaseEditorState] = useState(null);
        const [evaluationCaseEditorVisible, setEvaluationCaseEditorVisible] = useState(false);
        const [evaluationCaseEditorClosing, setEvaluationCaseEditorClosing] = useState(false);
        const [evaluationCaseEditorMarkdownEditingKey, setEvaluationCaseEditorMarkdownEditingKey] = useState("");
        const [evaluationCaseEditorMarkdownHistoryByKey, setEvaluationCaseEditorMarkdownHistoryByKey] = useState({});
        const [evaluationJsonlFileDragging, setEvaluationJsonlFileDragging] = useState(false);
        const [evaluationJsonlFileImportError, setEvaluationJsonlFileImportError] = useState("");
        const [evaluationJsonlFileImportMessage, setEvaluationJsonlFileImportMessage] = useState("");
        const [evaluationThreadCaseModalSetId, setEvaluationThreadCaseModalSetId] = useState("");
        const [evaluationThreadCaseSearchQuery, setEvaluationThreadCaseSearchQuery] = useState("");
        const [evaluationThreadCaseSelectedIds, setEvaluationThreadCaseSelectedIds] = useState([]);
        const [evaluationThreadCaseStatus, setEvaluationThreadCaseStatus] = useState({ status: "idle", message: "", error: "" });
        const [evaluationPendingThreadCasesBySetId, setEvaluationPendingThreadCasesBySetId] = useState({});
        const [evaluationVersionsSidebarOpen, setEvaluationVersionsSidebarOpen] = useState(false);
        const [evaluationPublishMenuOpen, setEvaluationPublishMenuOpen] = useState(false);
        const [evaluationVersionsHeaderMenuOpen, setEvaluationVersionsHeaderMenuOpen] = useState(false);
        const [evaluationVersionState, setEvaluationVersionState] = useState({ status: "idle", message: "", error: "" });
        const [evaluationVersionModal, setEvaluationVersionModal] = useState(null);
        const [evaluationVersionModalVisible, setEvaluationVersionModalVisible] = useState(false);
        const [evaluationVersionModalClosing, setEvaluationVersionModalClosing] = useState(false);
        const [evaluationVersionNameDraft, setEvaluationVersionNameDraft] = useState("");
        const [evaluationVersionDescriptionDraft, setEvaluationVersionDescriptionDraft] = useState("");
        const [isEvaluationVersionDescriptionEditing, setIsEvaluationVersionDescriptionEditing] = useState(false);
        const [evaluationVersionChangesState, setEvaluationVersionChangesState] = useState(null);
        const [openEvaluationVersionMenuId, setOpenEvaluationVersionMenuId] = useState("");
        const [evaluationBackendSyncState, setEvaluationBackendSyncState] = useState({ status: "idle", error: "" });
        const requestHeadersSignature = useMemo(() => JSON.stringify(requestHeaders || {}), [requestHeaders]);
        const currentEvaluationCreator = normalizePlaygroundEvaluationPersonIdentity({
          id: currentUserId || currentUserEmail || "",
          userId: currentUserId || "",
          name: currentUserName || "",
          email: currentUserEmail || "",
          avatarUrl: currentUserAvatarUrl || "",
        });
        const normalizedSets = (Array.isArray(evaluationSets) ? evaluationSets : []).map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)));
        const agentOptions = Array.isArray(agents) ? agents : [];
        const environmentOptions = Array.isArray(environments) ? environments : [];
        const projectOptions = Array.isArray(projects) ? projects : [];
        const sourceThreadOptions = (Array.isArray(threadRecords) ? threadRecords : [])
          .map((thread, index) => normalizePlaygroundEvaluationSourceThread(thread, index))
          .filter((thread) => thread.id);
        const environmentChoices = buildPlaygroundEvaluationEnvironmentChoices(environmentOptions, projectOptions);
        const activeSet = normalizedSets.find((set) => set.id === selectedEvaluationSetId) || normalizedSets[0] || null;
        const activeRun = activeSet?.runs?.find((run) => run.id === selectedEvaluationRunId) || activeSet?.runs?.[0] || null;
        const activeCase = activeRun?.cases?.find((caseItem) => caseItem.id === selectedEvaluationCaseId) || null;
        const normalizedMode = evaluationsPageMode === "case" && activeSet && activeRun && activeCase
          ? "case"
          : evaluationsPageMode === "run" && activeRun
            ? "run"
            : evaluationsPageMode === "detail" && activeSet
              ? "detail"
              : "overview";
        const isEvaluationDetailPage = normalizedMode === "detail" && Boolean(activeSet);
        const nowIso = new Date().toISOString();

        async function requestEvaluationBackendJson(path, init = {}, fallbackMessage = "Evaluation request failed.") {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            throw new Error("Evaluation backend is unavailable.");
          }
          const headers = new Headers(requestHeaders || {});
          if (init.body !== undefined && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
          }
          const response = await fetch(normalizedBackendUrl + path, {
            credentials: "include",
            cache: "no-store",
            ...init,
            headers,
          });
          return await readPlaygroundEvaluationBackendJson(response, fallbackMessage);
        }

        async function fetchBackendEvaluationSetDetails(set, allRuns = [], options = {}) {
          const normalizedSet = normalizePlaygroundEvaluationSet(set);
          if (!normalizedSet.id) return normalizedSet;
          const versionsPayload = options.includeVersions === false
            ? null
            : await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(normalizedSet.id) + "/versions",
                { method: "GET" },
                "Failed to load evaluation versions."
              ).catch(() => null);
          const versions = readPlaygroundEvaluationListFromPayload(versionsPayload || {}, ["versions", "evaluationVersions", "evaluation_versions"])
            .map((version, index) => normalizePlaygroundEvaluationVersion(version, index));
          const runs = (Array.isArray(allRuns) ? allRuns : [])
            .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
            .filter((run) => String(run.evaluationSetId || run.evaluationId || "").trim() === normalizedSet.id);
          return mergePlaygroundEvaluationSetWithBackendDetails(normalizedSet, versions, runs);
        }

        async function reloadBackendEvaluationSet(setId, options = {}) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return null;
          const [setPayload, runsPayload] = await Promise.all([
            requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(normalizedSetId),
              { method: "GET" },
              "Failed to load evaluation."
            ),
            requestEvaluationBackendJson(
              "/evaluations/runs?evaluationId=" + encodeURIComponent(normalizedSetId) + "&limit=1000",
              { method: "GET" },
              "Failed to load evaluation runs."
            ).catch(() => ({ runs: [] })),
          ]);
          const backendSet = normalizePlaygroundEvaluationSet(setPayload?.evaluation || setPayload?.data || setPayload);
          const backendRuns = readPlaygroundEvaluationListFromPayload(runsPayload || {}, ["runs", "evaluationRuns", "evaluation_runs"]);
          const detailedSet = await fetchBackendEvaluationSetDetails(backendSet, backendRuns);
          if (detailedSet?.id && typeof setEvaluationSets === "function") {
            evaluationDetailsLoadedRef.current.add(detailedSet.id);
            replaceEvaluationSet(detailedSet, {
              clearRunSelection: options.clearRunSelection !== false,
              rememberBaseline: options.rememberBaseline !== false,
              select: options.select !== false,
              persist: false,
            });
            evaluationSetPersistSignaturesRef.current.set(detailedSet.id, JSON.stringify(buildPlaygroundEvaluationBackendPayload(detailedSet)));
          }
          return detailedSet;
        }

        async function migrateLocalEvaluationSetToBackend(localSet) {
          const normalizedLocalSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(localSet));
          const createdPayload = await requestEvaluationBackendJson(
            "/evaluations",
            {
              method: "POST",
              body: JSON.stringify(buildPlaygroundEvaluationBackendPayload(normalizedLocalSet)),
            },
            "Failed to migrate evaluation."
          );
          const createdSet = normalizePlaygroundEvaluationSet(createdPayload?.evaluation || createdPayload?.data || createdPayload);
          if (!createdSet.id) return null;
          const localVersions = readSelectedEvaluationVersions(normalizedLocalSet)
            .slice()
            .sort((left, right) => Number(left.version || 0) - Number(right.version || 0));
          for (const localVersion of localVersions) {
            try {
              const versionPayload = await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(createdSet.id) + "/versions",
                {
                  method: "POST",
                  body: JSON.stringify({
                    label: localVersion.label,
                    name: localVersion.label,
                    description: localVersion.description,
                    snapshot: localVersion.snapshot || buildPlaygroundEvaluationVersionSnapshot(normalizedLocalSet),
                    metadata: buildPlaygroundEvaluationBackendMetadata(normalizedLocalSet),
                  }),
                },
                "Failed to migrate evaluation version."
              );
              const createdVersion = normalizePlaygroundEvaluationVersion(versionPayload?.version || versionPayload?.data || versionPayload);
              if (localVersion.status === "active" && createdVersion.id) {
                await requestEvaluationBackendJson(
                  "/evaluations/" + encodeURIComponent(createdSet.id) + "/versions/" + encodeURIComponent(createdVersion.id) + "/publish",
                  {
                    method: "POST",
                    body: JSON.stringify({ snapshot: localVersion.snapshot || buildPlaygroundEvaluationVersionSnapshot(normalizedLocalSet) }),
                  },
                  "Failed to publish migrated evaluation version."
                ).catch(() => null);
              }
            } catch {
              // Keep migrating other durable references.
            }
          }
          const localRuns = (Array.isArray(normalizedLocalSet.runs) ? normalizedLocalSet.runs : [])
            .map((run, index) => normalizePlaygroundEvaluationRun({
              ...run,
              evaluationId: createdSet.id,
              evaluationSetId: createdSet.id,
            }, index))
            .filter((run) => run.id);
          for (const localRun of localRuns) {
            try {
              await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(createdSet.id) + "/runs",
                {
                  method: "POST",
                  body: JSON.stringify(buildPlaygroundEvaluationRunBackendPayload(localRun)),
                },
                "Failed to migrate evaluation run."
              );
            } catch {
              // Keep migrating the rest.
            }
          }
          return await reloadBackendEvaluationSet(createdSet.id, { clearRunSelection: false, select: false });
        }

        async function loadBackendEvaluationSets(options = {}) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl || typeof setEvaluationSets !== "function") return [];
          const loadKey = normalizedBackendUrl + "|" + requestHeadersSignature;
          if (!options.force && evaluationBackendLoadRef.current === loadKey) return normalizedSets;
          if (evaluationBackendLoadRef.current !== loadKey) {
            evaluationDetailsLoadedRef.current = new Set();
          }
          evaluationBackendLoadRef.current = loadKey;
          setEvaluationBackendSyncState({ status: "loading", error: "" });
          try {
            const [setsPayload, runsPayload] = await Promise.all([
              requestEvaluationBackendJson("/evaluations?limit=500", { method: "GET" }, "Failed to load evaluations."),
              requestEvaluationBackendJson("/evaluations/runs?limit=1000", { method: "GET" }, "Failed to load evaluation runs.").catch(() => ({ runs: [] })),
            ]);
            const backendSets = readPlaygroundEvaluationListFromPayload(setsPayload || {}, ["evaluations", "evaluationSets", "evaluation_sets"])
              .map((set) => normalizePlaygroundEvaluationSet(set))
              .filter((set) => set.id);
            const backendRuns = readPlaygroundEvaluationListFromPayload(runsPayload || {}, ["runs", "evaluationRuns", "evaluation_runs"])
              .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
              .filter((run) => run.id);
            let detailedSets = await Promise.all(backendSets.map((set) => fetchBackendEvaluationSetDetails(set, backendRuns, { includeVersions: false })));
            if (!detailedSets.length && !evaluationBackendMigratedLocalRef.current) {
              evaluationBackendMigratedLocalRef.current = true;
              const localSets = readPlaygroundEvaluationSetsFromStorage()
                .map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
                .filter((set) => set.id);
              if (localSets.length) {
                const migratedSets = [];
                for (const localSet of localSets) {
                  try {
                    const migratedSet = await migrateLocalEvaluationSetToBackend(localSet);
                    if (migratedSet?.id) migratedSets.push(migratedSet);
                  } catch {
                    // Keep migrating the rest; failed local entries remain in browser storage for manual recovery.
                  }
                }
                detailedSets = migratedSets;
              }
            }
            detailedSets = detailedSets
              .map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
              .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0));
            setEvaluationSets(detailedSets);
            evaluationSetPersistSignaturesRef.current = new Map(detailedSets.map((set) => [
              set.id,
              JSON.stringify(buildPlaygroundEvaluationBackendPayload(set)),
            ]));
            evaluationBackendLoadedRef.current = true;
            setEvaluationBackendSyncState({ status: "idle", error: "" });
            const selectedStillExists = detailedSets.some((set) => set.id === selectedEvaluationSetId);
            if (!selectedStillExists) {
              setSelectedEvaluationSetId(detailedSets[0]?.id || "");
              setSelectedEvaluationRunId("");
              if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
              if (!detailedSets[0]?.id) setEvaluationsPageMode("overview");
            }
            return detailedSets;
          } catch (error) {
            evaluationBackendLoadRef.current = "";
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            return normalizedSets;
          }
        }

        useEffect(() => {
          if (!shouldLoadData) {
            return undefined;
          }
          void loadBackendEvaluationSets({ force: false });
          return undefined;
        }, [backendUrl, requestHeadersSignature, shouldLoadData]);

        useEffect(() => () => {
          evaluationSetPersistTimersRef.current.forEach((timer) => {
            if (typeof window !== "undefined") {
              window.clearTimeout(timer);
            } else {
              clearTimeout(timer);
            }
          });
          evaluationSetPersistTimersRef.current.clear();
        }, []);

        useEffect(() => {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          const normalizedRunId = String(selectedEvaluationRunId || "").trim();
          const normalizedSetId = String(selectedEvaluationSetId || "").trim();
          if (!normalizedBackendUrl || !normalizedRunId || (evaluationsPageMode !== "run" && evaluationsPageMode !== "case")) {
            return undefined;
          }
          if (activeRun?.id === normalizedRunId && Array.isArray(activeRun.cases) && activeRun.cases.length > 0) {
            return undefined;
          }
          let cancelled = false;
          void (async () => {
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(normalizedRunId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readPlaygroundEvaluationBackendJson(response, "Failed to load evaluation run.");
              if (cancelled) return;
              const run = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
              if (!run.id) return;
              const runSetId = String(run.evaluationSetId || run.evaluationId || normalizedSetId || "").trim();
              if (!runSetId) return;
              if (typeof setSelectedEvaluationSetId === "function" && runSetId !== normalizedSetId) {
                setSelectedEvaluationSetId(runSetId);
              }
              upsertEvaluationRun(runSetId, run, {
                targetAgentId: run.targetAgentId,
                environmentType: run.environmentType,
                environmentId: run.environmentId,
                projectId: run.projectId,
                evaluator: run.evaluator,
                passThreshold: run.passThreshold,
              });
            } catch (error) {
              console.warn("[evaluations] Failed to hydrate selected evaluation run", error);
            }
          })();
          return () => {
            cancelled = true;
          };
        }, [
          backendUrl,
          selectedEvaluationRunId,
          selectedEvaluationSetId,
          evaluationsPageMode,
          activeRun?.id,
          activeRun?.cases?.length,
          requestHeadersSignature,
        ]);

        useEffect(() => {
          const normalizedSetId = String(activeSet?.id || selectedEvaluationSetId || "").trim();
          const needsVersionSurface = evaluationVersionsSidebarOpen
            || evaluationPublishMenuOpen
            || evaluationVersionsHeaderMenuOpen
            || Boolean(evaluationVersionChangesState)
            || Boolean(evaluationVersionModal)
            || Boolean(openEvaluationVersionMenuId);
          if (!shouldLoadData || !backendUrl || !isEvaluationDetailPage || !normalizedSetId || !needsVersionSurface) {
            return undefined;
          }
          if (evaluationDetailsLoadedRef.current.has(normalizedSetId)) {
            return undefined;
          }
          let cancelled = false;
          void reloadBackendEvaluationSet(normalizedSetId, {
            clearRunSelection: false,
            select: false,
            rememberBaseline: !evaluationVersionDraftTouchedRef.current,
          }).catch((error) => {
            if (cancelled) return;
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
          });
          return () => {
            cancelled = true;
          };
        }, [
          activeSet?.id,
          backendUrl,
          evaluationPublishMenuOpen,
          evaluationVersionChangesState,
          evaluationVersionModal,
          evaluationVersionsHeaderMenuOpen,
          evaluationVersionsSidebarOpen,
          isEvaluationDetailPage,
          openEvaluationVersionMenuId,
          requestHeadersSignature,
          selectedEvaluationSetId,
          shouldLoadData,
        ]);

        useEffect(() => {
          if (typeof onVersionsSidebarOpenChange !== "function") {
            return undefined;
          }
          onVersionsSidebarOpenChange(Boolean(evaluationVersionsSidebarOpen));
          return () => onVersionsSidebarOpenChange(false);
        }, [evaluationVersionsSidebarOpen, onVersionsSidebarOpenChange]);

        useEffect(() => {
          if (!activeSet?.id || !isEvaluationDetailPage) {
            return;
          }
          playgroundEvaluationVersionController.rememberBaseline(activeSet, evaluationVersionBaselineRef);
        }, [
          activeSet?.id,
          activeSet?.metadata?.restoredFromEvaluationVersionId,
          activeSet?.metadata?.restored_from_evaluation_version_id,
          isEvaluationDetailPage,
        ]);

        useEffect(() => {
          if (isEvaluationDetailPage) {
            return;
          }
          setEvaluationVersionsSidebarOpen(false);
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setEvaluationVersionChangesState(null);
          setOpenEvaluationVersionMenuId("");
          setEvaluationVersionModal(null);
          setEvaluationVersionModalVisible(false);
          setEvaluationVersionModalClosing(false);
          setEvaluationVersionNameDraft("");
          setEvaluationVersionDescriptionDraft("");
          setIsEvaluationVersionDescriptionEditing(false);
          evaluationVersionDraftTouchedRef.current = false;
        }, [isEvaluationDetailPage]);

        useEffect(() => {
          if (!evaluationGuidanceEditingId || typeof window === "undefined") {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeEvaluationGuidanceTextarea(evaluationGuidanceTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [evaluationGuidanceEditingId, activeSet?.id, activeSet?.evaluationGuidance]);

        useEffect(() => {
          if (!evaluationCaseEditorMarkdownEditingKey || typeof window === "undefined") {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            const textarea = evaluationCaseEditorTextareaRefs.current[evaluationCaseEditorMarkdownEditingKey];
            if (!textarea) return;
            textarea.focus();
            resizeEvaluationGuidanceTextarea(textarea);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [evaluationCaseEditorMarkdownEditingKey]);

        useEffect(() => {
          if (!evaluationCreateModalOpen) {
            if (!evaluationCreateModalClosing) {
              setEvaluationCreateModalVisible(false);
            }
            return undefined;
          }
          setEvaluationCreateModalClosing(false);
          setEvaluationCreateModalVisible(false);
          if (typeof window === "undefined") {
            setEvaluationCreateModalVisible(true);
            return undefined;
          }
          if (evaluationCreateModalCloseTimerRef.current) {
            window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
            evaluationCreateModalCloseTimerRef.current = null;
          }
          if (evaluationCreateModalFrameRef.current) {
            window.cancelAnimationFrame(evaluationCreateModalFrameRef.current);
            evaluationCreateModalFrameRef.current = null;
          }
          evaluationCreateModalFrameRef.current = window.requestAnimationFrame(() => {
            evaluationCreateModalFrameRef.current = window.requestAnimationFrame(() => {
              evaluationCreateModalFrameRef.current = null;
              setEvaluationCreateModalVisible(true);
            });
          });
          return undefined;
        }, [evaluationCreateModalOpen]);

        useEffect(() => {
          if (!evaluationRunModalOpen) {
            if (!evaluationRunModalClosing) {
              setEvaluationRunModalVisible(false);
            }
            return undefined;
          }
          setEvaluationRunModalClosing(false);
          setEvaluationRunModalVisible(false);
          if (typeof window === "undefined") {
            setEvaluationRunModalVisible(true);
            return undefined;
          }
          if (evaluationRunModalCloseTimerRef.current) {
            window.clearTimeout(evaluationRunModalCloseTimerRef.current);
            evaluationRunModalCloseTimerRef.current = null;
          }
          if (evaluationRunModalFrameRef.current) {
            window.cancelAnimationFrame(evaluationRunModalFrameRef.current);
            evaluationRunModalFrameRef.current = null;
          }
          evaluationRunModalFrameRef.current = window.requestAnimationFrame(() => {
            evaluationRunModalFrameRef.current = window.requestAnimationFrame(() => {
              evaluationRunModalFrameRef.current = null;
              setEvaluationRunModalVisible(true);
            });
          });
          return undefined;
        }, [evaluationRunModalOpen]);

        useEffect(() => {
          if (!topNavActionsPortalId || typeof document === "undefined") {
            setEvaluationTopNavActionsContainer(null);
            return undefined;
          }
          let disposed = false;
          const updateContainer = () => {
            if (disposed) return;
            setEvaluationTopNavActionsContainer(document.getElementById(topNavActionsPortalId));
          };
          updateContainer();
          const frameIds = [];
          if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
            const scheduleLookup = () => {
              const frameId = window.requestAnimationFrame(() => {
                updateContainer();
                const container = document.getElementById(topNavActionsPortalId);
                if (!container) {
                  scheduleLookup();
                }
              });
              frameIds.push(frameId);
            };
            scheduleLookup();
          }
          const observer = typeof MutationObserver !== "undefined"
            ? new MutationObserver(updateContainer)
            : null;
          if (observer && document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
          }
          return () => {
            disposed = true;
            if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
              frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
            }
            if (observer) observer.disconnect();
          };
        }, [topNavActionsPortalId, normalizedMode, activeSet?.id]);

        useEffect(() => () => {
          if (evaluationCaseEditorFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationCaseEditorFrameRef.current);
            evaluationCaseEditorFrameRef.current = null;
          }
          if (evaluationCaseEditorCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
            evaluationCaseEditorCloseTimerRef.current = null;
          }
          if (evaluationCreateModalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationCreateModalFrameRef.current);
            evaluationCreateModalFrameRef.current = null;
          }
          if (evaluationCreateModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
            evaluationCreateModalCloseTimerRef.current = null;
          }
          if (evaluationRunModalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationRunModalFrameRef.current);
            evaluationRunModalFrameRef.current = null;
          }
          if (evaluationRunModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationRunModalCloseTimerRef.current);
            evaluationRunModalCloseTimerRef.current = null;
          }
          if (evaluationVersionModalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationVersionModalFrameRef.current);
            evaluationVersionModalFrameRef.current = null;
          }
          if (evaluationVersionModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationVersionModalCloseTimerRef.current);
            evaluationVersionModalCloseTimerRef.current = null;
          }
        }, []);

        useEffect(() => {
          if (!isEvaluationDetailPage) {
            return undefined;
          }

          function handleEvaluationVersionKeyboardShortcuts(event) {
            if (event.defaultPrevented || evaluationVersionModal || evaluationVersionState.status === "loading") {
              return;
            }
            const isCommand = event.metaKey || event.ctrlKey;
            if (!isCommand) return;
            const key = String(event.key || "").toLowerCase();
            if (key === "s") {
              event.preventDefault();
              if (event.shiftKey) {
                openCreateEvaluationVersionModal();
              } else {
                saveCurrentEvaluationVersion();
              }
            } else if (key === "p" && !event.shiftKey) {
              event.preventDefault();
              if (canPublishSelectedEvaluationVersion()) {
                publishCurrentEvaluationVersion();
              } else {
                setEvaluationVersionsSidebarOpen(true);
              }
            }
          }

          window.addEventListener("keydown", handleEvaluationVersionKeyboardShortcuts);
          return () => window.removeEventListener("keydown", handleEvaluationVersionKeyboardShortcuts);
        }, [
          activeSet,
          evaluationVersionModal,
          evaluationVersionState.status,
          isEvaluationDetailPage,
        ]);

        useEffect(() => {
          if (!isEvaluationDetailPage) {
            setEvaluationActionsPopoverOpen(false);
            setEvaluationRunRowMenuId("");
            setEvaluationCaseRowMenuId("");
          }
        }, [isEvaluationDetailPage]);

        useEffect(() => {
          if (!evaluationActionsPopoverOpen) {
            return undefined;
          }

          function handleEvaluationActionsPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !evaluationActionsPopoverRef.current || evaluationActionsPopoverRef.current.contains(target)) {
              return;
            }
            setEvaluationActionsPopoverOpen(false);
          }

          function handleEvaluationActionsPopoverEscape(event) {
            if (event.key === "Escape") {
              setEvaluationActionsPopoverOpen(false);
            }
          }

          document.addEventListener("mousedown", handleEvaluationActionsPopoverPointerDown);
          window.addEventListener("keydown", handleEvaluationActionsPopoverEscape);
          return () => {
            document.removeEventListener("mousedown", handleEvaluationActionsPopoverPointerDown);
            window.removeEventListener("keydown", handleEvaluationActionsPopoverEscape);
          };
        }, [evaluationActionsPopoverOpen]);

        useEffect(() => {
          if (!evaluationRenameState || !evaluationRenameInputRef.current) {
            return;
          }
          evaluationRenameInputRef.current.focus();
          evaluationRenameInputRef.current.select();
        }, [evaluationRenameState]);

        useEffect(() => {
          if (!activeSet?.id || !activeRun?.id || (normalizedMode !== "run" && normalizedMode !== "case")) {
            return;
          }
          if (isPlaygroundEvaluationRunActive(activeRun)) {
            return;
          }
          const hasThreadIds = activeRun.cases.some((caseItem) => caseItem.threadId || caseItem.evaluatorThreadId);
          if (!hasThreadIds) {
            return;
          }
          const hasFreshCost = activeRun.costSource === "thread_usage_ct"
            && activeRun.cases.every((caseItem) => !caseItem.threadId && !caseItem.evaluatorThreadId ? true : caseItem.costSource === "thread_usage_ct");
          if (hasFreshCost) {
            return;
          }
          const hydrationKey = activeRun.id + ":" + String(activeRun.completedAt || activeRun.createdAt || "");
          if (hydratedEvaluationRunCostIdsRef.current.has(hydrationKey)) {
            return;
          }
          hydratedEvaluationRunCostIdsRef.current.add(hydrationKey);
          void hydrateEvaluationRunCosts(activeSet.id, activeRun).catch((error) => {
            hydratedEvaluationRunCostIdsRef.current.delete(hydrationKey);
            console.warn("[evaluations] Failed to hydrate run cost", error);
          });
        }, [
          activeSet?.id,
          activeRun?.id,
          activeRun?.costSource,
          activeRun?.completedAt,
          normalizedMode,
        ]);

`;

