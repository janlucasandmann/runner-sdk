export const FILES_PAGE_SHELL_SCRIPT = `
      function PlaygroundFilesPage({ backendUrl, requestHeaders, environments, initialEnvironmentId, apiKey, agentId, agents = [], isAgentSelectionBlocked, onBlockedAgentSelect, onFileChatThreadMutated, onThreadOpen, onThreadStarted, onRequestSidebarCollapse, navigationRequest, onNavigationRequestHandled, onOpenEnvironmentSettings, onCreateEnvironment, onEnvironmentMutated, onEnvironmentChange, onTopNavChange }) {
        const FILE_CHAT_PANEL_DEFAULT_WIDTH = 420;
        const FILES_BROWSER_RESTORE_WIDTH = 320;
        const FILES_PANE_CLOSE_THRESHOLD = 100;
        const projectLinkedHistoryClient = useMemo(() => new RunnerClient(), []);
        const uploadInputRef = useRef(null);
        const searchPopupInputRef = useRef(null);
        const createdFileEditorPathRef = useRef("");
        const lastHandledFilesNavigationActionTokenRef = useRef("");
        const renameInputRef = useRef(null);
        const filesShellRef = useRef(null);
        const activeResizeStateRef = useRef(null);
        const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(initialEnvironmentId || "");
        const [inventoryByEnvironmentId, setInventoryByEnvironmentId] = useState({});
        const [loadedFoldersByEnvironmentId, setLoadedFoldersByEnvironmentId] = useState({});
        const [loadingFoldersByEnvironmentId, setLoadingFoldersByEnvironmentId] = useState({});
        const [folderErrorsByEnvironmentId, setFolderErrorsByEnvironmentId] = useState({});
        const [searchInventoryByEnvironmentId, setSearchInventoryByEnvironmentId] = useState({});
        const [searchInventoryLoadingByEnvironmentId, setSearchInventoryLoadingByEnvironmentId] = useState({});
        const [currentPath, setCurrentPath] = useState("");
        const [pathHistory, setPathHistory] = useState([""]);
        const [pathHistoryIndex, setPathHistoryIndex] = useState(0);
        const [selectedPaths, setSelectedPaths] = useState(() => new Set());
        const [selectionAnchorPath, setSelectionAnchorPath] = useState("");
        const [previewTargetPath, setPreviewTargetPath] = useState("");
        const [expandedFolders, setExpandedFolders] = useState(() => new Set());
        const [renamingPath, setRenamingPath] = useState("");
        const [renameValue, setRenameValue] = useState("");
        const [viewMode, setViewMode] = useState("list");
        const [contentMode, setContentMode] = useState("files");
        const [changesViewMode, setChangesViewMode] = useState("timeline");
        const [toolbarPopover, setToolbarPopover] = useState("");
        const [filesToolbarMenuAnimation, setFilesToolbarMenuAnimation] = useState({
          popover: "",
          phase: "",
        });
        const [searchPopupQuery, setSearchPopupQuery] = useState("");
        const [filterMode, setFilterMode] = useState("all");
        const [changesOperationFilter, setChangesOperationFilter] = useState("all");
        const [changesActorFilter, setChangesActorFilter] = useState("__all__");
        const [sortMode, setSortMode] = useState("name-asc");
        const [projectFilterScope, setProjectFilterScope] = useState("");
        const [projectFilterScopeLabel, setProjectFilterScopeLabel] = useState("");
        const [filesEnvironmentMenuMode, setFilesEnvironmentMenuMode] = useState("computers");
        const [availableProjectFilters, setAvailableProjectFilters] = useState([]);
        const [availableChangeActors, setAvailableChangeActors] = useState([]);
        const [projectLinkedPathsByEnvironmentId, setProjectLinkedPathsByEnvironmentId] = useState({});
        const [isPreviewOpen, setIsPreviewOpen] = useState(true);
        const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
        const [documentPreviewMode, setDocumentPreviewMode] = useState("preview");
        const [isFileChatOpen, setIsFileChatOpen] = useState(false);
        const [autoFocusPreviewPath, setAutoFocusPreviewPath] = useState("");
        const [browserPaneMode, setBrowserPaneMode] = useState("expanded");
        const [previewPanelWidth, setPreviewPanelWidth] = useState(null);
        const [fileChatPanelWidth, setFileChatPanelWidth] = useState(null);
        const [activeResizePane, setActiveResizePane] = useState("");
        const [actionError, setActionError] = useState("");
        const [isUploadingFiles, setIsUploadingFiles] = useState(false);
        const [isCreatingFolder, setIsCreatingFolder] = useState(false);
        const [isCreatingFile, setIsCreatingFile] = useState(false);
        const [isStartingImagePreviewThread, setIsStartingImagePreviewThread] = useState(false);
        const [isImageSelectionMode, setIsImageSelectionMode] = useState(false);
        const [imageMaskStrokes, setImageMaskStrokes] = useState([]);
        const [imageMaskRedoStrokes, setImageMaskRedoStrokes] = useState([]);
        const [imageMaskDraftStroke, setImageMaskDraftStroke] = useState(null);
        const [imageMaskImageSize, setImageMaskImageSize] = useState({ width: 0, height: 0 });
        const [isImageCropMode, setIsImageCropMode] = useState(false);
        const [imageCropRect, setImageCropRect] = useState(null);
        const [imageCropDraftRect, setImageCropDraftRect] = useState(null);
        const [imageCropDragTarget, setImageCropDragTarget] = useState("new");
        const [imageCropHistory, setImageCropHistory] = useState([]);
        const [imageCropHistoryIndex, setImageCropHistoryIndex] = useState(0);
        const [isCroppingImage, setIsCroppingImage] = useState(false);
        const [isSavingImageCrop, setIsSavingImageCrop] = useState(false);
        const [uploadTargetPath, setUploadTargetPath] = useState("");
        const [isExternalFileDropActive, setIsExternalFileDropActive] = useState(false);
        const [draggedPaths, setDraggedPaths] = useState([]);
        const [dragOverTargetPath, setDragOverTargetPath] = useState("");
        const previousToolbarPopoverRef = useRef(toolbarPopover);
        const filesToolbarMenuCloseTimerRef = useRef(null);
        const [contextMenu, setContextMenu] = useState(null);
        const [contextMenuPhase, setContextMenuPhase] = useState("idle");
        const contextMenuCloseTimerRef = useRef(null);
        const [fileProjectPickerState, setFileProjectPickerState] = useState(null);
        const [fileProjectPickerValue, setFileProjectPickerValue] = useState("");
        const [fileProjectPickerError, setFileProjectPickerError] = useState("");
        const [fileComputerPickerState, setFileComputerPickerState] = useState(null);
        const [fileComputerPickerVisible, setFileComputerPickerVisible] = useState(false);
        const [fileComputerPickerClosing, setFileComputerPickerClosing] = useState(false);
        const [fileComputerPickerOpen, setFileComputerPickerOpen] = useState(false);
        const [fileComputerPickerValue, setFileComputerPickerValue] = useState("");
        const [fileComputerPickerError, setFileComputerPickerError] = useState("");
        const [fileTeamPickerState, setFileTeamPickerState] = useState(null);
        const [fileTeamPickerVisible, setFileTeamPickerVisible] = useState(false);
        const [fileTeamPickerClosing, setFileTeamPickerClosing] = useState(false);
        const [fileTeamPickerOpen, setFileTeamPickerOpen] = useState(false);
        const [fileTeamPickerValue, setFileTeamPickerValue] = useState("");
        const [fileTeamPickerError, setFileTeamPickerError] = useState("");
        const [availableFileTeams, setAvailableFileTeams] = useState([]);
        const [isLoadingFileTeams, setIsLoadingFileTeams] = useState(false);
        const [fileProjectMutationState, setFileProjectMutationState] = useState({
          path: "",
          action: "",
          error: "",
        });
        const [fileComputerTransferState, setFileComputerTransferState] = useState({
          path: "",
          action: "",
          error: "",
        });
        const [fileTeamShareState, setFileTeamShareState] = useState({
          path: "",
          action: "",
          error: "",
        });
        const [fileEnvironmentMutationState, setFileEnvironmentMutationState] = useState({
          environmentId: "",
          action: "",
        });
        const imageMaskStrokeIdRef = useRef(0);
        const imageCropStartPointRef = useRef(null);
        const imageCropDraftRectRef = useRef(null);
        const imageCropDragStateRef = useRef(null);
        const fileComputerPickerCloseTimerRef = useRef(null);
        const fileTeamPickerCloseTimerRef = useRef(null);

        const loadEnvironmentFolder = useCallback(async (environmentId, folderPath = "", options = {}) => {
          const normalizedFolderPath = normalizeHistoryPath(folderPath);
          const shouldForce = Boolean(options.force);
          const loadedFolderPaths = loadedFoldersByEnvironmentId[environmentId] || new Set();
          if (!environmentId) return [];
          if (!shouldForce && loadedFolderPaths.has(normalizedFolderPath)) {
            return inventoryByEnvironmentId[environmentId] || [];
          }

          setLoadingFoldersByEnvironmentId((current) => {
            const next = { ...current };
            const nextSet = new Set(current[environmentId] || []);
            nextSet.add(normalizedFolderPath);
            next[environmentId] = nextSet;
            return next;
          });
          setFolderErrorsByEnvironmentId((current) => ({
            ...current,
            [environmentId]: {
              ...(current[environmentId] || {}),
              [normalizedFolderPath]: "",
            },
          }));

          try {
            const response = await fetch(
              buildPlaygroundEnvironmentFilesListUrl(backendUrl, environmentId, normalizedFolderPath, 1),
              {
                method: "GET",
                headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load files.");
            }
            const normalizedInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
            setInventoryByEnvironmentId((current) => ({
              ...current,
              [environmentId]: mergePlaygroundEnvironmentInventory(
                current[environmentId] || [],
                normalizedInventory,
                normalizedFolderPath
              ),
            }));
            setLoadedFoldersByEnvironmentId((current) => {
              const next = { ...current };
              const nextSet = new Set(current[environmentId] || []);
              nextSet.add(normalizedFolderPath);
              next[environmentId] = nextSet;
              return next;
            });
            return normalizedInventory;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load files.";
            setFolderErrorsByEnvironmentId((current) => ({
              ...current,
              [environmentId]: {
                ...(current[environmentId] || {}),
                [normalizedFolderPath]: errorMessage,
              },
            }));
            return [];
          } finally {
            setLoadingFoldersByEnvironmentId((current) => {
              const next = { ...current };
              const nextSet = new Set(current[environmentId] || []);
              nextSet.delete(normalizedFolderPath);
              next[environmentId] = nextSet;
              return next;
            });
          }
        }, [backendUrl, inventoryByEnvironmentId, loadedFoldersByEnvironmentId, requestHeaders]);

        const invalidateEnvironmentSearchInventory = useCallback((environmentId) => {
          if (!environmentId) return;
          setSearchInventoryByEnvironmentId((current) => {
            if (!Object.prototype.hasOwnProperty.call(current, environmentId)) {
              return current;
            }
            const next = { ...current };
            delete next[environmentId];
            return next;
          });
        }, []);

        const refreshEnvironmentFolders = useCallback(async (environmentId, folderPaths = []) => {
          if (!environmentId) return;
          invalidateEnvironmentSearchInventory(environmentId);
          const uniqueFolderPaths = Array.from(
            new Set((Array.isArray(folderPaths) ? folderPaths : []).map((value) => normalizeHistoryPath(value)))
          );
          const pathsToRefresh = uniqueFolderPaths.length > 0 ? uniqueFolderPaths : [""];
          for (const folderPath of pathsToRefresh) {
            await loadEnvironmentFolder(environmentId, folderPath, { force: true });
          }
        }, [invalidateEnvironmentSearchInventory, loadEnvironmentFolder]);

        const loadEnvironmentSearchInventory = useCallback(async (environmentId) => {
          if (!environmentId || searchInventoryByEnvironmentId[environmentId] || searchInventoryLoadingByEnvironmentId[environmentId]) {
            return [];
          }

          setSearchInventoryLoadingByEnvironmentId((current) => ({
            ...current,
            [environmentId]: true,
          }));

          try {
            const response = await fetch(
              buildPlaygroundEnvironmentFilesListUrl(backendUrl, environmentId, "", -1),
              {
                method: "GET",
                headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to search files.");
            }
            const normalizedInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
            setSearchInventoryByEnvironmentId((current) => ({
              ...current,
              [environmentId]: normalizedInventory,
            }));
            return normalizedInventory;
          } catch {
            return [];
          } finally {
            setSearchInventoryLoadingByEnvironmentId((current) => ({
              ...current,
              [environmentId]: false,
            }));
          }
        }, [backendUrl, requestHeaders, searchInventoryByEnvironmentId, searchInventoryLoadingByEnvironmentId]);

        useEffect(() => {
          if (selectedEnvironmentId && environments.some((environment) => environment.id === selectedEnvironmentId)) {
            return;
          }
          const defaultEnvironment = environments.find((environment) => environment.isDefault) || environments[0];
          setSelectedEnvironmentId(defaultEnvironment?.id || "");
        }, [environments, selectedEnvironmentId]);

        useEffect(() => {
          const normalizedInitialEnvironmentId = String(initialEnvironmentId || "").trim();
          if (
            !normalizedInitialEnvironmentId
            || normalizedInitialEnvironmentId === selectedEnvironmentId
            || !environments.some((environment) => environment.id === normalizedInitialEnvironmentId)
          ) {
            return;
          }
          setSelectedEnvironmentId(normalizedInitialEnvironmentId);
        }, [environments, initialEnvironmentId, selectedEnvironmentId]);

        useEffect(() => {
          setCurrentPath("");
          setPathHistory([""]);
          setPathHistoryIndex(0);
          setSelectedPaths(new Set());
          setSelectionAnchorPath("");
          setPreviewTargetPath("");
          setExpandedFolders(new Set());
          setRenamingPath("");
          setRenameValue("");
          setToolbarPopover("");
          setSearchPopupQuery("");
          setFilterMode("all");
          setChangesOperationFilter("all");
          setChangesActorFilter("__all__");
          setSortMode("name-asc");
          setAvailableChangeActors([]);
          setIsPreviewOpen(true);
          setIsFileChatOpen(false);
          setBrowserPaneMode("expanded");
          activeResizeStateRef.current = null;
          if (typeof document !== "undefined") {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
          }
          setPreviewPanelWidth(null);
          setFileChatPanelWidth(null);
          setActiveResizePane("");
          setActionError("");
          setUploadTargetPath("");
          setIsExternalFileDropActive(false);
          setDraggedPaths([]);
          setDragOverTargetPath("");
          setContextMenu(null);
        }, [selectedEnvironmentId]);

        useEffect(() => {
          if (!selectedEnvironmentId) return;
          void loadEnvironmentFolder(selectedEnvironmentId, currentPath);
        }, [currentPath, loadEnvironmentFolder, selectedEnvironmentId]);

        useEffect(() => {
          if (!selectedEnvironmentId || expandedFolders.size === 0) return;
          Array.from(expandedFolders)
            .filter((path) => {
              if (!path) return false;
              if (!currentPath) return true;
              return path.startsWith(currentPath + "/");
            })
            .forEach((path) => {
              void loadEnvironmentFolder(selectedEnvironmentId, path);
            });
        }, [currentPath, expandedFolders, loadEnvironmentFolder, selectedEnvironmentId]);

        useEffect(() => {
          if (!navigationRequest) {
            return;
          }

          const requestToken = typeof navigationRequest?.token === "string" ? navigationRequest.token : "";
          const requestedProjectId = String(navigationRequest?.projectId || "").trim();
          const requestedProjectLabel = String(navigationRequest?.projectName || navigationRequest?.projectLabel || "").trim();
          const requestedEnvironmentId = String(navigationRequest?.environmentId || "").trim();
          const requestedContentMode = navigationRequest?.contentMode === "changes" ? "changes" : "files";
          const requestedAction = String(navigationRequest?.action || "").trim();
          const requestedPath = normalizeHistoryPath(navigationRequest?.path || "");
          const requestedIsFolder = Boolean(navigationRequest?.isFolder);
          const targetEnvironmentId = requestedEnvironmentId || selectedEnvironmentId;

          if (requestedEnvironmentId && requestedEnvironmentId !== selectedEnvironmentId) {
            if (requestedProjectId) {
              setProjectFilterScope(requestedProjectId);
              setProjectFilterScopeLabel(requestedProjectLabel);
              setFilesEnvironmentMenuMode("projects");
            } else {
              setProjectFilterScope("");
              setProjectFilterScopeLabel("");
              setFilesEnvironmentMenuMode("computers");
            }
            setSelectedEnvironmentId(requestedEnvironmentId);
            if (typeof onEnvironmentChange === "function") {
              onEnvironmentChange(requestedEnvironmentId);
            }
            return;
          }

          let cancelled = false;
          const targetFolderPath = requestedPath
            ? (requestedIsFolder ? requestedPath : getPlaygroundEntryParentPath(requestedPath))
            : "";
          const targetSelectionPaths = requestedPath && !requestedIsFolder ? [requestedPath] : [];

          void (async () => {
            try {
              if (requestedProjectId) {
                setProjectFilterScope(requestedProjectId);
                setProjectFilterScopeLabel(requestedProjectLabel);
                setFilesEnvironmentMenuMode("projects");
              } else if (requestedEnvironmentId) {
                setProjectFilterScope("");
                setProjectFilterScopeLabel("");
                setFilesEnvironmentMenuMode("computers");
              }
              setContentMode(requestedContentMode);
              if (requestedContentMode === "changes") {
                setToolbarPopover("");
                setContextMenu(null);
                setSelectedPaths(new Set());
                setSelectionAnchorPath("");
                setPreviewTargetPath("");
                setRenamingPath("");
                setRenameValue("");
                setIsPreviewOpen(false);
                return;
              }
              if (targetEnvironmentId) {
                await loadEnvironmentFolder(targetEnvironmentId, targetFolderPath);
              }
              if (cancelled) {
                return;
              }
              pushPath(targetFolderPath, targetSelectionPaths);
              setIsPreviewOpen(targetSelectionPaths.length > 0);
              if (
                requestedAction === "create-file"
                && requestToken
                && lastHandledFilesNavigationActionTokenRef.current !== requestToken
              ) {
                lastHandledFilesNavigationActionTokenRef.current = requestToken;
                if (typeof onNavigationRequestHandled === "function") {
                  onNavigationRequestHandled(requestToken);
                }
                window.setTimeout(() => {
                  void handleCreateFile(targetFolderPath, targetEnvironmentId);
                }, 0);
              }
            } finally {
              if (
                !cancelled
                && requestToken
                && requestedAction !== "create-file"
                && typeof onNavigationRequestHandled === "function"
              ) {
                onNavigationRequestHandled(requestToken);
              }
            }
          })();

          return () => {
            cancelled = true;
          };
        }, [
          loadEnvironmentFolder,
          navigationRequest,
          onNavigationRequestHandled,
          onEnvironmentChange,
          selectedEnvironmentId,
        ]);

        useEffect(() => {
          if (toolbarPopover !== "search" || !selectedEnvironmentId || !searchPopupQuery.trim()) return;
          if (searchInventoryByEnvironmentId[selectedEnvironmentId] || searchInventoryLoadingByEnvironmentId[selectedEnvironmentId]) {
            return;
          }
          void loadEnvironmentSearchInventory(selectedEnvironmentId);
        }, [
          loadEnvironmentSearchInventory,
          searchInventoryByEnvironmentId,
          searchInventoryLoadingByEnvironmentId,
          searchPopupQuery,
          selectedEnvironmentId,
          toolbarPopover,
        ]);

        useEffect(() => {
          if (changesActorFilter === "__all__") {
            return;
          }
          if (availableChangeActors.some((option) => option.id === changesActorFilter)) {
            return;
          }
          setChangesActorFilter("__all__");
        }, [availableChangeActors, changesActorFilter]);

        const loadProjectLinkedPaths = useCallback(async (signal = null) => {
          try {
            const [projectsResult, serversResult, tasksResult, threadsResult] = await Promise.allSettled([
              fetch(backendUrl + "/projects", {
                method: "GET",
                headers: requestHeaders,
                signal: signal || undefined,
              }),
              fetch(backendUrl + "/servers", {
                method: "GET",
                headers: requestHeaders,
                signal: signal || undefined,
              }),
              fetch(backendUrl + "/tasks", {
                method: "GET",
                headers: requestHeaders,
                signal: signal || undefined,
              }),
              fetch(backendUrl + "/threads?limit=240", {
                method: "GET",
                headers: requestHeaders,
                signal: signal || undefined,
              }),
            ]);

            let nextProjects = [];
            let nextServers = [];
            let nextTasks = [];
            let nextThreads = [];

            if (projectsResult.status === "fulfilled" && projectsResult.value.ok) {
              const data = await projectsResult.value.json().catch(() => ({}));
              nextProjects = parsePlaygroundProjectListResponse(data);
            }

            if (serversResult.status === "fulfilled" && serversResult.value.ok) {
              const data = await serversResult.value.json().catch(() => ({}));
              nextServers = parsePlaygroundServerListResponse(data);
            }

            if (tasksResult.status === "fulfilled" && tasksResult.value.ok) {
              const data = await tasksResult.value.json().catch(() => ({}));
              nextTasks = parsePlaygroundTaskListResponse(data);
            }

            if (threadsResult.status === "fulfilled" && threadsResult.value.ok) {
              const data = await threadsResult.value.json().catch(() => ({}));
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.threads)
                  ? data.threads
                  : [];
              nextThreads = normalizeThreadList(items);
            }

            const baseLinkedIndex = buildPlaygroundProjectLinkedFilePathIndex(nextProjects, nextServers, nextTasks);

            if (!(signal && signal.aborted)) {
              setAvailableProjectFilters(
                nextProjects.filter((project) => String(project?.id || "").trim())
              );
              setProjectLinkedPathsByEnvironmentId(baseLinkedIndex);
            }

            const projectDefaultEnvironmentIdsById = {};
            nextProjects.forEach((project) => {
              const normalizedProjectId = String(project?.id || "").trim();
              if (!normalizedProjectId) {
                return;
              }
              projectDefaultEnvironmentIdsById[normalizedProjectId] = String(project?.defaultEnvironmentId || "").trim();
            });

            const projectThreads = nextThreads
              .filter((thread) => getPlaygroundThreadProjectId(thread))
              .sort(compareThreadsByRecent)
              .slice(0, 60);

            if (projectThreads.length === 0) {
              return {
                projects: nextProjects,
                linkedIndex: baseLinkedIndex,
              };
            }

            const linkedActivityResults = await Promise.allSettled(projectThreads.map(async (thread) => {
              const normalizedThreadId = String(thread?.id || "").trim();
              if (!normalizedThreadId) {
                return [];
              }
              const normalizedProjectId = getPlaygroundThreadProjectId(thread);
              const [stepsResult, logsResult] = await Promise.allSettled([
                projectLinkedHistoryClient.listThreadSteps({
                  backendUrl,
                  threadId: normalizedThreadId,
                  limit: 250,
                  headers: requestHeaders,
                }),
                fetchHistoryThreadLogs({
                  client: projectLinkedHistoryClient,
                  backendUrl,
                  threadId: normalizedThreadId,
                  headers: requestHeaders,
                }),
              ]);

              const steps = stepsResult.status === "fulfilled" && Array.isArray(stepsResult.value)
                ? stepsResult.value
                : [];
              const threadLogs = logsResult.status === "fulfilled" && Array.isArray(logsResult.value)
                ? logsResult.value
                : [];

              return buildPlaygroundProjectFileActivityRowsForThreadHistory({
                thread,
                steps,
                threadLogs,
                fallbackEnvironmentId: projectDefaultEnvironmentIdsById[normalizedProjectId] || "",
              });
            }));

            const historyLinkedIndex = buildPlaygroundProjectLinkedFilePathIndexFromActivityRows(
              linkedActivityResults.flatMap((result) => result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [])
            );
            const mergedLinkedIndex = mergePlaygroundProjectLinkedFilePathIndexes(baseLinkedIndex, historyLinkedIndex);

            if (!(signal && signal.aborted)) {
              setProjectLinkedPathsByEnvironmentId(mergedLinkedIndex);
            }

            return {
              projects: nextProjects,
              linkedIndex: mergedLinkedIndex,
            };
          } catch {
            if (!(signal && signal.aborted)) {
              setAvailableProjectFilters([]);
              setProjectLinkedPathsByEnvironmentId({});
            }
            return {
              projects: [],
              linkedIndex: {},
            };
          }
        }, [backendUrl, projectLinkedHistoryClient, requestHeaders]);

        useEffect(() => {
          const controller = new AbortController();
          void loadProjectLinkedPaths(controller.signal);
          return () => controller.abort();
        }, [loadProjectLinkedPaths]);

        useEffect(() => {
          if (!toolbarPopover) return;
          const frame = toolbarPopover === "search"
            ? window.requestAnimationFrame(() => {
                if (searchPopupInputRef.current) {
                  searchPopupInputRef.current.focus();
                  searchPopupInputRef.current.select();
                }
              })
            : 0;

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              setToolbarPopover("");
            }
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => {
            if (frame) {
              window.cancelAnimationFrame(frame);
            }
            window.removeEventListener("keydown", handleKeyDown);
          };
        }, [toolbarPopover]);

        useEffect(() => {
          const isAnimatedFilesToolbarPopover = (value) => value === "create" || value === "sort" || value === "filter" || value === "projects";
          const previousPopover = previousToolbarPopoverRef.current;
          const nextPopover = toolbarPopover;
          previousToolbarPopoverRef.current = nextPopover;

          if (isAnimatedFilesToolbarPopover(nextPopover)) {
            if (filesToolbarMenuCloseTimerRef.current) {
              window.clearTimeout(filesToolbarMenuCloseTimerRef.current);
              filesToolbarMenuCloseTimerRef.current = null;
            }
            setFilesToolbarMenuAnimation({
              popover: nextPopover,
              phase: "enter",
            });
            return undefined;
          }

          if (isAnimatedFilesToolbarPopover(previousPopover)) {
            setFilesToolbarMenuAnimation({
              popover: previousPopover,
              phase: "exit",
            });
            if (filesToolbarMenuCloseTimerRef.current) {
              window.clearTimeout(filesToolbarMenuCloseTimerRef.current);
            }
            filesToolbarMenuCloseTimerRef.current = window.setTimeout(() => {
              filesToolbarMenuCloseTimerRef.current = null;
              setFilesToolbarMenuAnimation({
                popover: "",
                phase: "",
              });
            }, 180);
          }

          return undefined;
        }, [toolbarPopover]);

        useEffect(() => () => {
          if (filesToolbarMenuCloseTimerRef.current) {
            window.clearTimeout(filesToolbarMenuCloseTimerRef.current);
            filesToolbarMenuCloseTimerRef.current = null;
          }
        }, []);

        useEffect(() => {
          if (!contextMenu) return;

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              closeContextMenu();
            }
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        }, [contextMenu]);

        useEffect(() => () => {
          if (contextMenuCloseTimerRef.current !== null) {
            window.clearTimeout(contextMenuCloseTimerRef.current);
            contextMenuCloseTimerRef.current = null;
          }
        }, []);

        useEffect(() => {
          if (!fileProjectPickerState) return;

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              setFileProjectPickerState(null);
              setFileProjectPickerValue("");
              setFileProjectPickerError("");
            }
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        }, [fileProjectPickerState]);

        useEffect(() => {
          if (!fileComputerPickerState) return;

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              closeFileComputerPickerDialog();
            }
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        }, [fileComputerPickerState]);

        useEffect(() => {
          if (!fileComputerPickerState) {
            return undefined;
          }
          if (fileComputerPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileComputerPickerCloseTimerRef.current);
            fileComputerPickerCloseTimerRef.current = null;
          }
          setFileComputerPickerClosing(false);
          setFileComputerPickerVisible(false);
          const frameId = window.requestAnimationFrame(() => setFileComputerPickerVisible(true));
          return () => window.cancelAnimationFrame(frameId);
        }, [fileComputerPickerState]);

        useEffect(() => () => {
          if (fileComputerPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileComputerPickerCloseTimerRef.current);
            fileComputerPickerCloseTimerRef.current = null;
          }
        }, []);

        useEffect(() => {
          if (!fileTeamPickerState) return;

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              closeFileTeamPickerDialog();
            }
          }

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        }, [fileTeamPickerState]);

        useEffect(() => {
          if (!fileTeamPickerState) {
            return undefined;
          }
          if (fileTeamPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileTeamPickerCloseTimerRef.current);
            fileTeamPickerCloseTimerRef.current = null;
          }
          setFileTeamPickerClosing(false);
          setFileTeamPickerVisible(false);
          const frameId = window.requestAnimationFrame(() => setFileTeamPickerVisible(true));
          return () => window.cancelAnimationFrame(frameId);
        }, [fileTeamPickerState]);

        useEffect(() => () => {
          if (fileTeamPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileTeamPickerCloseTimerRef.current);
            fileTeamPickerCloseTimerRef.current = null;
          }
        }, []);

        useEffect(() => {
          if (!renamingPath || !renameInputRef.current) return;
          const frame = window.requestAnimationFrame(() => {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
          });
          return () => window.cancelAnimationFrame(frame);
        }, [renamingPath]);

        const normalizedCurrentPath = normalizeHistoryPath(currentPath);
        const currentInventory = inventoryByEnvironmentId[selectedEnvironmentId] || [];
        const currentFolderErrors = folderErrorsByEnvironmentId[selectedEnvironmentId] || {};
        const currentEnvironmentError = currentFolderErrors[normalizedCurrentPath] || "";
        const loadedFolderPaths = loadedFoldersByEnvironmentId[selectedEnvironmentId] || new Set();
        const loadingFolderPaths = loadingFoldersByEnvironmentId[selectedEnvironmentId] || new Set();
        const isCurrentEnvironmentLoading = Boolean(
          selectedEnvironmentId
          && !currentEnvironmentError
          && (!loadedFolderPaths.has(normalizedCurrentPath) || loadingFolderPaths.has(normalizedCurrentPath))
        );
        const currentProjectLinkedRecord = projectLinkedPathsByEnvironmentId[selectedEnvironmentId] || null;
        const projectAttachmentLinksByEnvironmentId = useMemo(() => {
          const next = {};

          function ensureEnvironmentRecord(environmentId) {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId) {
              return null;
            }
            if (!next[normalizedEnvironmentId]) {
              next[normalizedEnvironmentId] = {
                byPath: {},
              };
            }
            return next[normalizedEnvironmentId];
          }

          function addAttachmentLink(environmentId, path, projectId) {
            const normalizedPath = normalizeHistoryPath(path);
            const normalizedProjectId = String(projectId || "").trim();
            const environmentRecord = ensureEnvironmentRecord(environmentId);
            if (!environmentRecord || !normalizedPath || !normalizedProjectId) {
              return;
            }
            if (!environmentRecord.byPath[normalizedPath]) {
              environmentRecord.byPath[normalizedPath] = new Set();
            }
            environmentRecord.byPath[normalizedPath].add(normalizedProjectId);
          }

          availableProjectFilters.forEach((project) => {
            const normalizedProjectId = String(project?.id || "").trim();
            if (!normalizedProjectId) {
              return;
            }
            normalizePlaygroundTaskAttachmentList(project?.attachments).forEach((attachment) => {
              addAttachmentLink(
                attachment?.environmentId,
                attachment?.sourcePath || attachment?.workspacePath,
                normalizedProjectId
              );
            });
          });

          return next;
        }, [availableProjectFilters]);
        const currentProjectLinkedPaths = useMemo(() => {
          if (!currentProjectLinkedRecord) {
            return new Set();
          }
          if (projectFilterScope === "__all__") {
            return currentProjectLinkedRecord.all || new Set();
          }
          if (projectFilterScope) {
            return currentProjectLinkedRecord.byProjectId?.[projectFilterScope] || new Set();
          }
          return new Set();
        }, [currentProjectLinkedRecord, projectFilterScope]);
        const activeProjectFilterOption = useMemo(() => {
          const isChangesProjectMode = contentMode === "changes";
          if (projectFilterScope === "__all__") {
            return {
              id: "__all__",
              label: isChangesProjectMode ? "All Project Changes" : "All Project Files",
              description: isChangesProjectMode
                ? "Show changes made in the scope of any project"
                : "Show files linked to any project",
            };
          }
          if (projectFilterScope) {
            const matchingProject = availableProjectFilters.find((project) => project.id === projectFilterScope) || null;
            return {
              id: projectFilterScope,
              label: matchingProject?.name || projectFilterScopeLabel || "Project",
              description: isChangesProjectMode
                ? "Show only changes made in this project"
                : "Show only files linked to this project",
            };
          }
          return {
            id: "",
            label: isChangesProjectMode ? "All Changes" : "All Files",
            description: isChangesProjectMode
              ? "Show every recorded change in this environment"
              : "Show every file in this environment",
          };
        }, [availableProjectFilters, contentMode, projectFilterScope, projectFilterScopeLabel]);
        const environmentTree = useMemo(() => buildPlaygroundEnvironmentTree(currentInventory), [currentInventory]);
        const currentFolderNode = (environmentTree.nodesByPath.get(normalizedCurrentPath || "") || environmentTree.root || null);
        const currentEntries = useMemo(
          () => sortPlaygroundEnvironmentEntries(Array.isArray(currentFolderNode?.children) ? currentFolderNode.children : [], sortMode),
          [currentFolderNode, sortMode]
        );
        const normalizedFilesLibrarySearchQuery = String(searchPopupQuery || "").trim().toLowerCase();
`;
