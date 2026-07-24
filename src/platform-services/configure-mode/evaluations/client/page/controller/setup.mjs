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
          workspaceTeams = [],
          workspaceTeamsLoading = false,
          onWorkspaceTeamsRequest,
          evaluationRunModalOpen,
          setEvaluationRunModalOpen,
          evaluationRunForm,
          setEvaluationRunForm,
          evaluationRunsSearchQuery,
          setEvaluationRunsSearchQuery,
          evaluationRunsFilterMode,
          setEvaluationRunsFilterMode,
          onOpenThread,
          onEvaluationThreadStarted,
          evaluationRunReturnTarget,
          onEvaluationRunBack,
          topNavActionsPortalId,
          breadcrumbActionsPortalId,
          versionsDrawerPortalId,
          onVersionsSidebarOpenChange,
          versionsSidebarRequestToken = 0,
          threadRecords,
          onRefreshThreadRecords,
          onNavigationGuardChange,
          onNavigationRequest,
          shouldLoadData = false,
        } = options;
        const evaluationActionsPopoverRef = useRef(null);
        const evaluationActionsPopoverSurfaceRef = useRef(null);
        const evaluationPublishMenuRef = useRef(null);
        const evaluationRenameInputRef = useRef(null);
        const evaluationGuidanceTextareaRef = useRef(null);
        const evaluationCaseEditorFrameRef = useRef(null);
        const evaluationCaseEditorCloseTimerRef = useRef(null);
        const evaluationCaseInputFileRef = useRef(null);
        const evaluationCaseExpectedOutputFileRef = useRef(null);
        const evaluationCreateModalFrameRef = useRef(null);
        const evaluationCreateModalCloseTimerRef = useRef(null);
        const evaluationCreateSubmittingRef = useRef(false);
        const evaluationCreateAttemptedRef = useRef(false);
        const evaluationCreateRequestIdRef = useRef("");
        const evaluationCreateDraftIdRef = useRef("");
        const evaluationRunModalFrameRef = useRef(null);
        const evaluationRunModalCloseTimerRef = useRef(null);
        const evaluationRunSubmittingRef = useRef(false);
        const evaluationUnsavedRunResolvingRef = useRef(false);
        const evaluationVersionDescriptionTextareaRef = useRef(null);
        const evaluationVersionModalFrameRef = useRef(null);
        const evaluationVersionModalCloseTimerRef = useRef(null);
        const evaluationVersionBaselineRef = useRef({ key: "", signature: "" });
        const evaluationVersionsSidebarRequestTokenRef = useRef(Number(versionsSidebarRequestToken) || 0);
        const evaluationDetailSidebarCollapsedBeforeVersionsRef = useRef(false);
        const evaluationVersionDraftTouchedRef = useRef(false);
        const evaluationBackendLoadRef = useRef("");
        const evaluationBackendLoadedRef = useRef(false);
        const evaluationDetailsLoadedRef = useRef(new Set());
        const evaluationWorkspaceTeamsRequestRef = useRef("");
	        const evaluationRunHistoryLoadedRef = useRef(new Set());
	        const evaluationRunHistoryRequestTokenRef = useRef(new Map());
	        const evaluationRunHistoryRetryTimerRef = useRef(null);
	        const evaluationRunHistoryRetryAttemptRef = useRef(0);
	        const evaluationDetailEntryHydrationRef = useRef("");
        const evaluationBackendMigratedLocalRef = useRef(false);
        const evaluationSetPersistTimersRef = useRef(new Map());
        const evaluationSetPersistSignaturesRef = useRef(new Map());
        const evaluationJsonlFileInputRef = useRef(null);
        const announcedEvaluationThreadIdsRef = useRef(new Set());
        const hydratedEvaluationRunCostIdsRef = useRef(new Set());
        const [evaluationTopNavActionsContainer, setEvaluationTopNavActionsContainer] = useState(null);
        const [evaluationBreadcrumbActionsContainer, setEvaluationBreadcrumbActionsContainer] = useState(null);
        const [evaluationActionsPopoverOpen, setEvaluationActionsPopoverOpen] = useState(false);
        const [evaluationRenameState, setEvaluationRenameState] = useState(null);
        const [evaluationRenameValue, setEvaluationRenameValue] = useState("");
        const [evaluationRenameError, setEvaluationRenameError] = useState("");
        const [evaluationCasesSearchQuery, setEvaluationCasesSearchQuery] = useState("");
        const [evaluationCasesFilterMode, setEvaluationCasesFilterMode] = useState("all");
        const [evaluationCasesVisibleCount, setEvaluationCasesVisibleCount] = useState(10);
        const [evaluationRunRowMenuId, setEvaluationRunRowMenuId] = useState("");
        const [evaluationCaseRowMenuId, setEvaluationCaseRowMenuId] = useState("");
        const [evaluationCreateModalVisible, setEvaluationCreateModalVisible] = useState(false);
        const [evaluationCreateModalClosing, setEvaluationCreateModalClosing] = useState(false);
        const [evaluationCreateSubmitting, setEvaluationCreateSubmitting] = useState(false);
        const [evaluationRunModalVisible, setEvaluationRunModalVisible] = useState(false);
        const [evaluationRunModalClosing, setEvaluationRunModalClosing] = useState(false);
        const [evaluationRunSubmitting, setEvaluationRunSubmitting] = useState(false);
        const [evaluationUnsavedRunDialog, setEvaluationUnsavedRunDialog] = useState(null);
        const [evaluationGuidanceEditingId, setEvaluationGuidanceEditingId] = useState("");
        const [evaluationGuidanceHistoryById, setEvaluationGuidanceHistoryById] = useState({});
        const [evaluationCaseEditorState, setEvaluationCaseEditorState] = useState(null);
        const [evaluationCaseEditorVisible, setEvaluationCaseEditorVisible] = useState(false);
        const [evaluationCaseEditorClosing, setEvaluationCaseEditorClosing] = useState(false);
        const [evaluationCaseFocusedEditor, setEvaluationCaseFocusedEditor] = useState(null);
        const [evaluationCaseTextImportError, setEvaluationCaseTextImportError] = useState("");
        const [evaluationJsonlFileImportError, setEvaluationJsonlFileImportError] = useState("");
        const [evaluationJsonlFileImportMessage, setEvaluationJsonlFileImportMessage] = useState("");
        const [evaluationJsonlWorkspacePickerOpen, setEvaluationJsonlWorkspacePickerOpen] = useState(false);
        const [evaluationJsonlWorkspaceSetId, setEvaluationJsonlWorkspaceSetId] = useState("");
        const [evaluationJsonlWorkspaceEnvironmentId, setEvaluationJsonlWorkspaceEnvironmentId] = useState("");
        const [evaluationJsonlWorkspaceInventory, setEvaluationJsonlWorkspaceInventory] = useState([]);
        const [evaluationJsonlWorkspaceState, setEvaluationJsonlWorkspaceState] = useState({ status: "idle", error: "" });
        const [evaluationJsonlWorkspaceSearch, setEvaluationJsonlWorkspaceSearch] = useState("");
        const [evaluationJsonlWorkspaceSelectedPaths, setEvaluationJsonlWorkspaceSelectedPaths] = useState([]);
        const [evaluationJsonlWorkspaceExpandedFolders, setEvaluationJsonlWorkspaceExpandedFolders] = useState([]);
        const [evaluationJsonlWorkspaceImporting, setEvaluationJsonlWorkspaceImporting] = useState(false);
        const [evaluationThreadCaseModalSetId, setEvaluationThreadCaseModalSetId] = useState("");
        const [evaluationThreadCaseModalOpen, setEvaluationThreadCaseModalOpen] = useState(false);
        const [evaluationThreadCaseSearchQuery, setEvaluationThreadCaseSearchQuery] = useState("");
        const [evaluationThreadCaseSelectedIds, setEvaluationThreadCaseSelectedIds] = useState([]);
        const [evaluationThreadCaseStatus, setEvaluationThreadCaseStatus] = useState({ status: "idle", message: "", error: "" });
        const [evaluationPendingThreadCasesBySetId, setEvaluationPendingThreadCasesBySetId] = useState({});
        const [evaluationVersionsSidebarOpen, setEvaluationVersionsSidebarOpen] = useState(false);
        const [evaluationPublishMenuOpen, setEvaluationPublishMenuOpen] = useState(false);
        const [evaluationVersionsHeaderMenuOpen, setEvaluationVersionsHeaderMenuOpen] = useState(false);
        const [evaluationVersionState, setEvaluationVersionState] = useState({ status: "idle", message: "", error: "" });
        const [evaluationVersionSaveDialog, setEvaluationVersionSaveDialog] = useState(null);
        const [evaluationVersionModal, setEvaluationVersionModal] = useState(null);
        const [evaluationVersionModalVisible, setEvaluationVersionModalVisible] = useState(false);
        const [evaluationVersionModalClosing, setEvaluationVersionModalClosing] = useState(false);
        const [evaluationVersionNameDraft, setEvaluationVersionNameDraft] = useState("");
        const [evaluationVersionDescriptionDraft, setEvaluationVersionDescriptionDraft] = useState("");
        const [isEvaluationVersionDescriptionEditing, setIsEvaluationVersionDescriptionEditing] = useState(false);
        const [evaluationVersionChangesState, setEvaluationVersionChangesState] = useState(null);
	        const [openEvaluationVersionMenuId, setOpenEvaluationVersionMenuId] = useState("");
	        const [evaluationBackendSyncState, setEvaluationBackendSyncState] = useState({ status: "idle", error: "" });
	        const [evaluationRunHistorySyncState, setEvaluationRunHistorySyncState] = useState({ status: "idle", error: "" });
        const [evaluationDetailSidebarCollapsed, setEvaluationDetailSidebarCollapsed] = useState(false);
        const [evaluationAnalyticsTimeframe, setEvaluationAnalyticsTimeframe] = useState("month");
        const [evaluationRunsTableMode, setEvaluationRunsTableMode] = useState("runs");
        const [selectedEvaluationRunIds, setSelectedEvaluationRunIds] = useState(() => new Set());
        const [evaluationAccessTeamId, setEvaluationAccessTeamId] = useState("");
        const [evaluationAccessRoleId, setEvaluationAccessRoleId] = useState("member");
        const [evaluationAccessMenuOpen, setEvaluationAccessMenuOpen] = useState(false);
        const [evaluationAccessActionId, setEvaluationAccessActionId] = useState("");
        const [evaluationOwnerSelectorOpen, setEvaluationOwnerSelectorOpen] = useState(false);
	        const [evaluationOwnerCandidateStateBySetId, setEvaluationOwnerCandidateStateBySetId] = useState({});
	        const requestHeadersSignature = useMemo(() => JSON.stringify(requestHeaders || {}), [requestHeaders]);
	        const evaluationRunHistoryCacheScopeKey = useMemo(() => (
	          buildPlaygroundEvaluationRunHistoryCacheScope({
	            backendUrl,
	            requestHeaders,
	            userId: currentUserId,
	            userEmail: currentUserEmail,
	          })
	        ), [backendUrl, currentUserEmail, currentUserId, requestHeadersSignature]);
	        const currentEvaluationCreator = normalizePlaygroundEvaluationPersonIdentity({
          id: currentUserId || currentUserEmail || "",
          userId: currentUserId || "",
          name: currentUserName || "",
          email: currentUserEmail || "",
          avatarUrl: currentUserAvatarUrl || "",
        });
        const normalizedSets = deduplicatePlaygroundEvaluationSets(evaluationSets);
        const agentOptions = Array.isArray(agents) ? agents : [];
        const environmentOptions = Array.isArray(environments) ? environments : [];
        const projectOptions = Array.isArray(projects) ? projects : [];
        const sourceThreadOptions = (Array.isArray(threadRecords) ? threadRecords : [])
          .map((thread, index) => normalizePlaygroundEvaluationSourceThread(thread, index))
          .filter((thread) => thread.id);
        const environmentChoices = buildPlaygroundEvaluationEnvironmentChoices(environmentOptions, projectOptions);
        const evaluationJsonlWorkspaceEnvironmentOptions = environmentOptions
          .map((environment) => ({
            ...environment,
            id: String(environment?.id || environment?.environmentId || environment?.environment_id || "").trim(),
            label: String(environment?.name || environment?.label || environment?.title || "Computer").trim() || "Computer",
          }))
          .filter((environment) => environment.id);
        const activeEvaluationJsonlWorkspaceEnvironment = evaluationJsonlWorkspaceEnvironmentOptions.find(
          (environment) => environment.id === evaluationJsonlWorkspaceEnvironmentId
        ) || null;
        const evaluationJsonlWorkspaceBrowsableInventory = useMemo(() => (
          evaluationJsonlWorkspaceInventory.filter((entry) => entry?.isFolder || /\.jsonl$/i.test(String(entry?.name || entry?.path || "")))
        ), [evaluationJsonlWorkspaceInventory]);
        const evaluationJsonlWorkspaceTree = useMemo(() => (
          buildPlaygroundEnvironmentTree(evaluationJsonlWorkspaceBrowsableInventory)
        ), [evaluationJsonlWorkspaceBrowsableInventory]);
        const evaluationJsonlWorkspaceExpandedSet = useMemo(() => (
          new Set(evaluationJsonlWorkspaceExpandedFolders)
        ), [evaluationJsonlWorkspaceExpandedFolders]);
        const evaluationJsonlWorkspaceRows = useMemo(() => {
          const searchValue = evaluationJsonlWorkspaceSearch.trim().toLowerCase();
          if (searchValue) {
            return buildPlaygroundEnvironmentSearchRows(evaluationJsonlWorkspaceBrowsableInventory, searchValue, {
              filesOnly: true,
            });
          }
          return buildPlaygroundEnvironmentVisibleRows(
            evaluationJsonlWorkspaceTree,
            "",
            evaluationJsonlWorkspaceExpandedSet
          ).map((row) => ({ ...row, searchMatch: false }));
        }, [
          evaluationJsonlWorkspaceBrowsableInventory,
          evaluationJsonlWorkspaceExpandedSet,
          evaluationJsonlWorkspaceSearch,
          evaluationJsonlWorkspaceTree,
        ]);
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
        const isEvaluationRunActionsPage = normalizedMode === "run" && Boolean(activeSet && activeRun);
        const supportsEvaluationActionsPopover = isEvaluationDetailPage || isEvaluationRunActionsPage;
        const hasUnsavedEvaluationChanges = Boolean(
          isEvaluationDetailPage
          && activeSet
          && hasSelectedEvaluationVersionChanges()
        );
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

	        async function requestBackendEvaluationRunHistory(path, options = {}) {
	          const maxAttempts = Math.max(1, Number(options.maxAttempts) || 3);
	          let lastError = null;
	          for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
	            try {
	              return await requestEvaluationBackendJson(
	                path,
	                { method: "GET" },
	                "Failed to load evaluation runs."
	              );
	            } catch (error) {
	              lastError = error;
	              if (attempt + 1 < maxAttempts) {
	                await sleepPlaygroundEvaluationFrontend(250 * (attempt + 1));
	              }
	            }
	          }
	          throw lastError || new Error("Failed to load evaluation runs.");
	        }

	        function clearEvaluationRunHistoryRetry() {
	          const timer = evaluationRunHistoryRetryTimerRef.current;
	          if (timer !== null) {
	            if (typeof window !== "undefined") {
	              window.clearTimeout(timer);
	            } else {
	              clearTimeout(timer);
	            }
	            evaluationRunHistoryRetryTimerRef.current = null;
	          }
	        }

	        function markEvaluationRunHistoryLoaded(setIds = []) {
	          (Array.isArray(setIds) ? setIds : []).forEach((setId) => {
	            const normalizedSetId = String(setId || "").trim();
	            if (normalizedSetId) evaluationRunHistoryLoadedRef.current.add(normalizedSetId);
	          });
	          evaluationRunHistoryRetryAttemptRef.current = 0;
	          clearEvaluationRunHistoryRetry();
	          setEvaluationRunHistorySyncState({ status: "idle", error: "" });
	        }

	        function scheduleEvaluationRunHistoryRetry() {
	          if (evaluationRunHistoryRetryTimerRef.current !== null) return;
	          const attempt = Math.max(0, Number(evaluationRunHistoryRetryAttemptRef.current) || 0);
	          if (attempt >= 3) return;
	          const retryDelays = [1500, 5000, 15000];
	          evaluationRunHistoryRetryAttemptRef.current = attempt + 1;
	          const schedule = typeof window !== "undefined" ? window.setTimeout.bind(window) : setTimeout;
	          evaluationRunHistoryRetryTimerRef.current = schedule(() => {
	            evaluationRunHistoryRetryTimerRef.current = null;
	            void loadBackendEvaluationSets({ force: true, runHistoryRetry: true });
	          }, retryDelays[attempt] || retryDelays[retryDelays.length - 1]);
	        }

	        function getCachedEvaluationRunsForSet(setId) {
	          const normalizedSetId = String(setId || "").trim();
	          if (!normalizedSetId) return [];
	          const cachedRunsBySet = readPlaygroundEvaluationRunHistoryCache(evaluationRunHistoryCacheScopeKey);
	          return deduplicatePlaygroundEvaluationRuns(cachedRunsBySet[normalizedSetId]);
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
          const [setPayload, runsResult] = await Promise.all([
            requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(normalizedSetId),
              { method: "GET" },
              "Failed to load evaluation."
            ),
	            requestBackendEvaluationRunHistory(
	              "/evaluations/runs?evaluationId=" + encodeURIComponent(normalizedSetId) + "&limit=1000",
	              { maxAttempts: 3 }
	            ).then((payload) => ({ payload, error: null })).catch((error) => ({ payload: null, error })),
	          ]);
	          const backendSet = normalizePlaygroundEvaluationSet(setPayload?.evaluation || setPayload?.data || setPayload);
	          const existingSet = normalizedSets.find((set) => set.id === normalizedSetId) || null;
	          const backendRuns = runsResult.error
	            ? deduplicatePlaygroundEvaluationRuns([
	                ...(Array.isArray(existingSet?.runs) ? existingSet.runs : []),
	                ...getCachedEvaluationRunsForSet(normalizedSetId),
	              ])
	            : readPlaygroundEvaluationListFromPayload(runsResult.payload || {}, ["runs", "evaluationRuns", "evaluation_runs"])
              .map((run, index) => {
                const normalizedRun = normalizePlaygroundEvaluationRun(run, index);
                return normalizedRun.evaluationSetId
                  ? normalizedRun
                  : normalizePlaygroundEvaluationRun({
                      ...normalizedRun,
                      evaluationId: normalizedSetId,
                      evaluationSetId: normalizedSetId,
                    }, index);
              });
          const detailedSet = await fetchBackendEvaluationSetDetails(backendSet, backendRuns);
          const requiredVersionId = String(options.requiredVersionId || "").trim();
          const requiredVersion = requiredVersionId
            ? playgroundEvaluationVersionController.readVersions(detailedSet).find((version) => (
                String(version?.id || "").trim() === requiredVersionId
              ))
            : null;
          const canApplyDetailedSet = !requiredVersionId || Boolean(
            requiredVersion
            && (
              options.requirePublishedVersion !== true
              || String(requiredVersion.status || "").trim().toLowerCase() === "active"
            )
          );
          if (!canApplyDetailedSet) {
            return null;
          }
          if (detailedSet?.id && typeof setEvaluationSets === "function") {
	            evaluationDetailsLoadedRef.current.add(detailedSet.id);
	            if (!runsResult.error) {
	              markEvaluationRunHistoryLoaded([detailedSet.id]);
	            } else {
	              setEvaluationRunHistorySyncState({
	                status: "error",
	                error: runsResult.error?.message || String(runsResult.error),
	              });
	              scheduleEvaluationRunHistoryRetry();
	              console.warn("[evaluations] Failed to hydrate evaluation run history", runsResult.error);
	            }
            evaluationSetPersistSignaturesRef.current.set(detailedSet.id, JSON.stringify(buildPlaygroundEvaluationBackendPayload(detailedSet)));
            if (options.preserveDirtyDraft === false || !evaluationVersionDraftTouchedRef.current) {
              replaceEvaluationSet(detailedSet, {
                clearRunSelection: options.clearRunSelection !== false,
                rememberBaseline: options.rememberBaseline !== false,
                select: options.select !== false,
                persist: false,
              });
            } else {
              setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
                const currentSet = normalizePlaygroundEvaluationSet(item);
                if (currentSet.id !== detailedSet.id) return currentSet;
                const loadedRunIds = new Set(detailedSet.runs.map((run) => run.id));
                return normalizePlaygroundEvaluationSet({
                  ...currentSet,
                  runs: [
                    ...detailedSet.runs,
                    ...currentSet.runs.filter((run) => !loadedRunIds.has(run.id)),
                  ],
                });
              }));
            }
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
	          const loadKey = normalizedBackendUrl + "|" + requestHeadersSignature + "|" + evaluationRunHistoryCacheScopeKey;
	          if (!options.force && evaluationBackendLoadRef.current === loadKey) return normalizedSets;
	          if (evaluationBackendLoadRef.current !== loadKey) {
	            clearEvaluationRunHistoryRetry();
	            evaluationRunHistoryRetryAttemptRef.current = 0;
	            evaluationDetailsLoadedRef.current = new Set();
            evaluationRunHistoryLoadedRef.current = new Set();
            evaluationRunHistoryRequestTokenRef.current = new Map();
            evaluationDetailEntryHydrationRef.current = "";
	          }
	          evaluationBackendLoadRef.current = loadKey;
	          setEvaluationBackendSyncState({ status: "loading", error: "" });
	          setEvaluationRunHistorySyncState((current) => (
	            current.status === "error" && options.runHistoryRetry !== true
	              ? current
	              : { status: "loading", error: "" }
	          ));
	          try {
	            const [setsPayload, runsResult] = await Promise.all([
	              requestEvaluationBackendJson("/evaluations?limit=500", { method: "GET" }, "Failed to load evaluations."),
	              requestBackendEvaluationRunHistory(
	                "/evaluations/runs?limit=1000",
	                { maxAttempts: 3 }
	              ).then((payload) => ({ payload, error: null })).catch((error) => ({ payload: null, error })),
	            ]);
	            const backendSets = deduplicatePlaygroundEvaluationSets(
	              readPlaygroundEvaluationListFromPayload(setsPayload || {}, ["evaluations", "evaluationSets", "evaluation_sets"])
	                .map((set) => normalizePlaygroundEvaluationSet(set))
	                .filter((set) => set.id)
	            );
	            const cachedRunsBySet = runsResult.error
	              ? readPlaygroundEvaluationRunHistoryCache(evaluationRunHistoryCacheScopeKey)
	              : {};
	            const backendRuns = resolvePlaygroundEvaluationRunHistorySnapshot({
	              historyLoadSucceeded: !runsResult.error,
	              backendSets,
	              currentSets: normalizedSets,
	              cachedRunsBySet,
	              backendRuns: readPlaygroundEvaluationListFromPayload(runsResult.payload || {}, ["runs", "evaluationRuns", "evaluation_runs"])
	                .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
	                .filter((run) => run.id),
	            });
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
            detailedSets = deduplicatePlaygroundEvaluationSets(detailedSets)
              .map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
              .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0));
            setEvaluationSets(detailedSets);
            evaluationSetPersistSignaturesRef.current = new Map(detailedSets.map((set) => [
              set.id,
              JSON.stringify(buildPlaygroundEvaluationBackendPayload(set)),
	            ]));
	            evaluationBackendLoadedRef.current = true;
	            setEvaluationBackendSyncState({ status: "idle", error: "" });
	            if (runsResult.error) {
	              setEvaluationRunHistorySyncState({
	                status: "error",
	                error: runsResult.error?.message || String(runsResult.error),
	              });
	              scheduleEvaluationRunHistoryRetry();
	            } else {
	              markEvaluationRunHistoryLoaded(detailedSets.map((set) => set.id));
	              writePlaygroundEvaluationRunHistoryCache(evaluationRunHistoryCacheScopeKey, detailedSets);
	            }
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
	            setEvaluationRunHistorySyncState({ status: "error", error: error?.message || String(error) });
	            return normalizedSets;
	          }
	        }

	        useEffect(() => {
	          if (!shouldLoadData) {
	            return undefined;
          }
          void loadBackendEvaluationSets({ force: false });
	          return undefined;
	        }, [backendUrl, evaluationRunHistoryCacheScopeKey, requestHeadersSignature, shouldLoadData]);

	        useEffect(() => {
	          if (
	            !evaluationRunHistoryCacheScopeKey
	            || !evaluationBackendLoadedRef.current
	            || evaluationRunHistorySyncState.status !== "idle"
	          ) {
	            return;
	          }
	          writePlaygroundEvaluationRunHistoryCache(evaluationRunHistoryCacheScopeKey, evaluationSets);
	        }, [
	          evaluationRunHistoryCacheScopeKey,
	          evaluationRunHistorySyncState.status,
	          evaluationSets,
	        ]);

	        useEffect(() => () => {
	          clearEvaluationRunHistoryRetry();
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
              upsertEvaluationRun(runSetId, run);
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
          if (!shouldLoadData || !backendUrl || !isEvaluationDetailPage || !normalizedSetId) {
            evaluationDetailEntryHydrationRef.current = "";
            return undefined;
          }
          if (evaluationDetailEntryHydrationRef.current === normalizedSetId) {
            return undefined;
          }
          evaluationDetailEntryHydrationRef.current = normalizedSetId;
          let cancelled = false;
          const hydrationRequest = evaluationDetailsLoadedRef.current.has(normalizedSetId)
            ? reloadBackendEvaluationRunHistory(normalizedSetId)
            : reloadBackendEvaluationSet(normalizedSetId, {
                clearRunSelection: false,
                select: false,
                rememberBaseline: !evaluationVersionDraftTouchedRef.current,
              });
          void hydrationRequest.catch((error) => {
            if (cancelled) return;
            if (evaluationDetailEntryHydrationRef.current === normalizedSetId) {
              evaluationDetailEntryHydrationRef.current = "";
            }
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
          });
          return () => {
            cancelled = true;
          };
        }, [
          activeSet?.id,
          backendUrl,
          isEvaluationDetailPage,
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
          const requestToken = Number(versionsSidebarRequestToken) || 0;
          if (requestToken === evaluationVersionsSidebarRequestTokenRef.current) {
            return;
          }
          evaluationVersionsSidebarRequestTokenRef.current = requestToken;
          if (isEvaluationDetailPage) {
            openEvaluationVersionsSidebar();
          }
        }, [versionsSidebarRequestToken, isEvaluationDetailPage, activeSet?.id]);

        useEffect(() => {
          if (!isEvaluationDetailPage) {
            evaluationDetailSidebarCollapsedBeforeVersionsRef.current = false;
            setEvaluationDetailSidebarCollapsed(false);
            return;
          }
          if (evaluationVersionsSidebarOpen) {
            evaluationDetailSidebarCollapsedBeforeVersionsRef.current = evaluationDetailSidebarCollapsed;
            setEvaluationDetailSidebarCollapsed(true);
            return;
          }
          setEvaluationDetailSidebarCollapsed(evaluationDetailSidebarCollapsedBeforeVersionsRef.current);
        }, [evaluationVersionsSidebarOpen, isEvaluationDetailPage]);

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
          if (typeof onNavigationGuardChange !== "function") {
            return;
          }
          const evaluationName = String(activeSet?.name || "").trim() || "this evaluation";
          onNavigationGuardChange(hasUnsavedEvaluationChanges
            ? {
                id: "evaluation-details-unsaved-changes",
                active: true,
                title: "Leave without saving?",
                description: "Your changes to " + evaluationName + " have not been saved. If you leave now, they will be lost.",
                onDiscard: discardUnsavedEvaluationDraft,
              }
            : null
          );
        }, [
          activeSet?.id,
          activeSet?.name,
          hasUnsavedEvaluationChanges,
          onNavigationGuardChange,
        ]);

        useEffect(() => {
          if (typeof onNavigationGuardChange !== "function") {
            return undefined;
          }
          return () => onNavigationGuardChange(null);
        }, [onNavigationGuardChange]);

        useEffect(() => {
          if (isEvaluationDetailPage) {
            return;
          }
          setEvaluationVersionsSidebarOpen(false);
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setEvaluationVersionChangesState(null);
          setEvaluationVersionSaveDialog(null);
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
          setEvaluationAccessTeamId("");
          setEvaluationAccessRoleId("member");
          setEvaluationAccessMenuOpen(false);
          setEvaluationAccessActionId("");
          setEvaluationOwnerSelectorOpen(false);
          setEvaluationJsonlWorkspacePickerOpen(false);
          setEvaluationJsonlWorkspaceSetId("");
        }, [activeSet?.id]);

        useEffect(() => {
          const normalizedDetailTab = evaluationDetailTab === "cases" || evaluationDetailTab === "data"
            ? "cases"
            : (evaluationDetailTab === "settings" ? "settings" : "general");
          setEvaluationAccessMenuOpen(false);
          if (normalizedDetailTab !== "settings") {
            setEvaluationAccessTeamId("");
            evaluationWorkspaceTeamsRequestRef.current = "";
            return;
          }
          const activeSetId = String(activeSet?.id || "").trim();
          const hasWorkspaceTeams = Array.isArray(workspaceTeams) && workspaceTeams.length > 0;
          if (
            activeSetId
            && !workspaceTeamsLoading
            && !hasWorkspaceTeams
            && typeof onWorkspaceTeamsRequest === "function"
            && evaluationWorkspaceTeamsRequestRef.current !== activeSetId
          ) {
            evaluationWorkspaceTeamsRequestRef.current = activeSetId;
            onWorkspaceTeamsRequest({ selectedTeamId: "" });
          }
        }, [
          evaluationDetailTab,
          activeSet?.id,
          workspaceTeamsLoading,
          Array.isArray(workspaceTeams) ? workspaceTeams.length : 0,
        ]);

        useEffect(() => {
          if (!evaluationJsonlWorkspacePickerOpen) {
            return undefined;
          }
          const environmentId = String(evaluationJsonlWorkspaceEnvironmentId || "").trim();
          if (!environmentId) {
            setEvaluationJsonlWorkspaceInventory([]);
            setEvaluationJsonlWorkspaceState({
              status: "error",
              error: "No computer is available for workspace imports.",
            });
            return undefined;
          }

          const controller = new AbortController();
          setEvaluationJsonlWorkspaceState({ status: "loading", error: "" });
          setEvaluationJsonlWorkspaceSelectedPaths([]);
          setEvaluationJsonlWorkspaceExpandedFolders([]);
          const listUrl = buildPlaygroundEnvironmentFilesListUrl(backendUrl, environmentId, "", -1);
          if (!listUrl) {
            setEvaluationJsonlWorkspaceInventory([]);
            setEvaluationJsonlWorkspaceState({
              status: "error",
              error: "Workspace files are unavailable.",
            });
            return () => controller.abort();
          }
          void fetch(listUrl, {
            method: "GET",
            headers: requestHeaders,
            signal: controller.signal,
          })
            .then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load workspace files.");
              }
              if (controller.signal.aborted) return;
              setEvaluationJsonlWorkspaceInventory(
                normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data)
              );
              setEvaluationJsonlWorkspaceState({ status: "ready", error: "" });
            })
            .catch((error) => {
              if (controller.signal.aborted) return;
              setEvaluationJsonlWorkspaceInventory([]);
              setEvaluationJsonlWorkspaceState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load workspace files.",
              });
            });

          return () => controller.abort();
        }, [
          backendUrl,
          evaluationJsonlWorkspaceEnvironmentId,
          evaluationJsonlWorkspacePickerOpen,
          requestHeadersSignature,
        ]);

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

        useEffect(() => {
          if (!breadcrumbActionsPortalId || typeof document === "undefined") {
            setEvaluationBreadcrumbActionsContainer(null);
            return undefined;
          }
          let disposed = false;
          const updateContainer = () => {
            if (disposed) return;
            setEvaluationBreadcrumbActionsContainer(document.getElementById(breadcrumbActionsPortalId));
          };
          updateContainer();
          const frameIds = [];
          if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
            const scheduleLookup = () => {
              const frameId = window.requestAnimationFrame(() => {
                updateContainer();
                const container = document.getElementById(breadcrumbActionsPortalId);
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
        }, [breadcrumbActionsPortalId, normalizedMode, activeSet?.id, activeRun?.id]);

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
            if (event.defaultPrevented || evaluationVersionModal || evaluationVersionSaveDialog || evaluationVersionState.status === "loading") {
              return;
            }
            const isCommand = event.metaKey || event.ctrlKey;
            if (!isCommand) return;
            const key = String(event.key || "").toLowerCase();
            if (key === "s") {
              event.preventDefault();
              openEvaluationVersionSaveDialog({ mode: event.shiftKey ? "new" : undefined });
            } else if (key === "p" && !event.shiftKey) {
              event.preventDefault();
              openEvaluationVersionSaveDialog();
            }
          }

          window.addEventListener("keydown", handleEvaluationVersionKeyboardShortcuts);
          return () => window.removeEventListener("keydown", handleEvaluationVersionKeyboardShortcuts);
        }, [
          activeSet,
          evaluationVersionModal,
          evaluationVersionSaveDialog,
          evaluationVersionState.status,
          isEvaluationDetailPage,
        ]);

        useEffect(() => {
          if (!supportsEvaluationActionsPopover) {
            setEvaluationActionsPopoverOpen(false);
            setEvaluationRunRowMenuId("");
            setEvaluationCaseRowMenuId("");
          }
        }, [supportsEvaluationActionsPopover]);

        useEffect(() => {
          if (!evaluationActionsPopoverOpen) {
            return undefined;
          }

          function handleEvaluationActionsPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (
              !target
              || evaluationActionsPopoverRef.current?.contains(target)
              || evaluationActionsPopoverSurfaceRef.current?.contains(target)
            ) {
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
