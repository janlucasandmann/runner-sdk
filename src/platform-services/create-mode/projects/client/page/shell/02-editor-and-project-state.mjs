export const PROJECTS_SHELL_02_FRAGMENT = `            "",
            projectEnvironmentFilePickerExpandedSet
          ).map((row) => ({ ...row, searchMatch: false }));
        }, [
          projectEnvironmentFilePickerExpandedSet,
          projectEnvironmentFilePickerInventory,
          projectEnvironmentFilePickerSearch,
          projectEnvironmentFilePickerTree,
        ]);

        const effectiveBacklogComposerAgentId = useMemo(() => {
          const normalizedAgentId = String(backlogComposerAgentId || "").trim();
          if (normalizedSubscriptionTierId !== "free") {
            return normalizedAgentId;
          }
          const selectedAgent = assignableActors.find((agent) => String(agent?.id || "").trim() === normalizedAgentId) || null;
          if (selectedAgent && !isPlaygroundFreePlanLockedComposerAgent(selectedAgent)) {
            return normalizedAgentId;
          }
          const sparkAgent = assignableActors.find((agent) => isPlaygroundAssistantAgent(agent));
          const selectableAgent = assignableActors.find((agent) => !isPlaygroundFreePlanLockedComposerAgent(agent));
          return String((sparkAgent || selectableAgent || assignableActors[0])?.id || "").trim();
        }, [assignableActors, backlogComposerAgentId, normalizedSubscriptionTierId]);

        const backlogComposerAgents = useMemo(() => {
          return assignableActors.map((agent) => ({
            ...agent,
            ...(effectiveBacklogComposerAgentId && agent.id === effectiveBacklogComposerAgentId ? { isDefault: true } : {}),
          }));
        }, [assignableActors, effectiveBacklogComposerAgentId]);

        const selectedProjectRecentThreads = useMemo(() => {
          if (selectedProjectDetail?.project?.id !== selectedProjectId) {
            return [];
          }
          if (Array.isArray(selectedProjectDetail.threads) && selectedProjectDetail.threads.length > 0) {
            return selectedProjectDetail.threads;
          }
          return Array.isArray(selectedProjectDetail.recentThreads)
            ? selectedProjectDetail.recentThreads
            : [];
        }, [selectedProjectDetail, selectedProjectId]);
        const projectOverviewThreads = useMemo(() => {
          const mergedThreads = normalizeThreadList([
            ...(Array.isArray(projectOverviewThreadRecords) ? projectOverviewThreadRecords : []),
            ...(Array.isArray(selectedProjectRecentThreads) ? selectedProjectRecentThreads : []),
          ]);
          return mergedThreads.sort(compareThreadsByRecent);
        }, [projectOverviewThreadRecords, selectedProjectRecentThreads]);
        const latestSelectedProjectMissionControlThreadId = useMemo(() => {
          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedSelectedProjectId) {
            return "";
          }
          const matchingThread = selectedProjectRecentThreads.find((threadItem) => {
            const normalizedThread = normalizeThreadItem(threadItem);
            const runnerPlaygroundMetadata = normalizedThread?.metadata?.runnerPlayground
              && typeof normalizedThread.metadata.runnerPlayground === "object"
              && !Array.isArray(normalizedThread.metadata.runnerPlayground)
              ? normalizedThread.metadata.runnerPlayground
              : null;
            const missionControlMetadata = runnerPlaygroundMetadata?.missionControl
              && typeof runnerPlaygroundMetadata.missionControl === "object"
              && !Array.isArray(runnerPlaygroundMetadata.missionControl)
              ? runnerPlaygroundMetadata.missionControl
              : null;
            const normalizedMissionControlProjectId = String(
              missionControlMetadata?.projectId
              || normalizedThread.projectId
              || ""
            ).trim();
            return normalizedThread.id
              && missionControlMetadata?.source === "project_backlog_mission_control"
              && normalizedMissionControlProjectId === normalizedSelectedProjectId;
          });
          return matchingThread?.id || "";
        }, [selectedProjectId, selectedProjectRecentThreads]);

        useEffect(() => {
          if (typeof window === "undefined" || !window.localStorage) {
            return;
          }
          try {
            window.localStorage.setItem(
              "runner-playground-project-overview-deleted-files",
              JSON.stringify(projectOverviewSuppressedFileKeys.slice(-250))
            );
          } catch {}
        }, [projectOverviewSuppressedFileKeys]);

        function getProjectOverviewFileActivityKey(projectId, environmentId, path) {
          const normalizedProjectId = String(projectId || "").trim();
          const normalizedEnvironmentId = String(environmentId || "").trim();
          const normalizedPath = normalizeHistoryPath(path || "");
          if (!normalizedProjectId || !normalizedEnvironmentId || !normalizedPath) {
            return "";
          }
          return normalizedProjectId + "::" + normalizedEnvironmentId + "::" + normalizedPath;
        }

        function normalizeProjectOverviewDeletedFileKeys(...sources) {
          const seen = new Set();
          const next = [];
          sources.forEach((source) => {
            (Array.isArray(source) ? source : []).forEach((value) => {
              const normalizedValue = String(value || "").trim();
              if (!normalizedValue || seen.has(normalizedValue)) {
                return;
              }
              seen.add(normalizedValue);
              next.push(normalizedValue);
            });
          });
          return next.slice(-250);
        }

        const selectedProjectOverviewDeletedFileKeys = useMemo(() => {
          const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : null;
          return normalizeProjectOverviewDeletedFileKeys(
            metadata?.projectOverviewDeletedFileKeys,
            projectOverviewSuppressedFileKeys
          );
        }, [projectOverviewSuppressedFileKeys, selectedProject?.metadata]);
        const selectedProjectOverviewDeletedFileKeysKey = useMemo(
          () => selectedProjectOverviewDeletedFileKeys.join("|"),
          [selectedProjectOverviewDeletedFileKeys]
        );

        function updateProjectDraftName(nextName) {
          projectDraftNameDirtyRef.current = true;
          projectDraftTypedNameRef.current = String(nextName || "");
          setProjectDraft((current) => ({
            ...current,
            name: nextName,
          }));
        }

        function preserveDirtyProjectDraftName(nextDraft, currentDraft = projectDraft) {
          const normalizedNextDraft = normalizePlaygroundProjectRecord(nextDraft || buildPlaygroundDefaultProjectDraft());
          if (!projectDraftNameDirtyRef.current || !currentDraft || typeof currentDraft !== "object") {
            return normalizedNextDraft;
          }
          const currentProjectId = String(currentDraft.id || "").trim();
          const nextProjectId = String(normalizedNextDraft.id || "").trim();
          const isSameDraft = currentProjectId === nextProjectId || (!currentProjectId && !nextProjectId);
          if (!isSameDraft) {
            return normalizedNextDraft;
          }
          return {
            ...normalizedNextDraft,
            name: projectDraftTypedNameRef.current || (typeof currentDraft.name === "string" ? currentDraft.name : normalizedNextDraft.name),
          };
        }

        useLayoutEffect(() => {
          if (!projectComposerOpen || !projectDraftNameDirtyRef.current) {
            return;
          }
          const typedName = projectDraftTypedNameRef.current;
          if (typeof typedName !== "string" || projectDraft.name === typedName) {
            return;
          }
          setProjectDraft((current) => (
            current && current.name !== typedName
              ? { ...current, name: typedName }
              : current
          ));
        }, [projectComposerOpen, projectDraft.id, projectDraft.name]);

        useEffect(() => {
          projectDraftWallpaperIdRef.current = getPlaygroundProjectWallpaperId(
            projectDraft.wallpaperId,
            PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id
          );
          projectDraftUseCardBackgroundAsWallpaperRef.current = projectDraft.useCardBackgroundAsWallpaper !== false;
        }, [projectDraft.useCardBackgroundAsWallpaper, projectDraft.wallpaperId]);

        function normalizeProjectDisplayName(value) {
          return String(value || "").trim().replace(/\\s+/g, " ");
        }

        function isPlaceholderProjectDisplayName(value) {
          const normalized = normalizeProjectDisplayName(value).toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project";
        }

        function rememberProjectLocalNameOverride(projectId, name) {
          const normalizedProjectId = String(projectId || "").trim();
          const normalizedName = normalizeProjectDisplayName(name);
          if (!normalizedProjectId) {
            return;
          }
          if (!normalizedName) {
            projectLocalNameOverridesRef.current.delete(normalizedProjectId);
            return;
          }
          projectLocalNameOverridesRef.current.set(normalizedProjectId, {
            name: normalizedName,
            updatedAt: Date.now(),
          });
        }

        function applyProjectLocalNameOverride(projectRecord) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const normalizedProjectId = String(normalizedProject.id || "").trim();
          if (!normalizedProjectId) {
            return normalizedProject;
          }

          const override = projectLocalNameOverridesRef.current.get(normalizedProjectId);
          if (!override) {
            return normalizedProject;
          }

          const overrideName = normalizeProjectDisplayName(override.name);
          if (!overrideName) {
            projectLocalNameOverridesRef.current.delete(normalizedProjectId);
            return normalizedProject;
          }

          const overrideUpdatedAt = Number(override.updatedAt) || 0;
          if (Date.now() - overrideUpdatedAt > 10 * 60 * 1000) {
            projectLocalNameOverridesRef.current.delete(normalizedProjectId);
            return normalizedProject;
          }

          const incomingName = normalizeProjectDisplayName(normalizedProject.name);
          if (incomingName === overrideName || isPlaceholderProjectDisplayName(overrideName)) {
            return normalizedProject;
          }
          if (!isPlaceholderProjectDisplayName(incomingName)) {
            return normalizedProject;
          }

          return {
            ...normalizedProject,
            name: overrideName,
          };
        }

        useEffect(() => {
	          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
	          const normalizedRecoveryThreadId = String(latestSelectedProjectMissionControlThreadId || "").trim();
	          const recoveryKey = normalizedSelectedProjectId + ":" + normalizedRecoveryThreadId;
	          const hasStrategyDocument = Boolean(String(selectedProjectMissionControl.document || "").trim());
	          if (
	            !normalizedSelectedProjectId
	            || !normalizedRecoveryThreadId
	            || hasStrategyDocument
	            || isSelectedProjectMissionControlRunning
	            || missionControlRecoveryThreadIdRef.current === recoveryKey
	            || missionControlRecoveryAttemptedKeysRef.current.has(recoveryKey)
	          ) {
	            return;
	          }

	          missionControlRecoveryAttemptedKeysRef.current.add(recoveryKey);
	          missionControlRecoveryThreadIdRef.current = recoveryKey;
	          void syncMissionControlThreadResult(normalizedRecoveryThreadId, normalizedSelectedProjectId)
	            .finally(() => {
              if (missionControlRecoveryThreadIdRef.current === recoveryKey) {
                missionControlRecoveryThreadIdRef.current = "";
              }
	            });
        }, [
          isSelectedProjectMissionControlRunning,
          latestSelectedProjectMissionControlThreadId,
          selectedProjectId,
          selectedProjectMissionControl.document,
        ]);

        const loadProjectOverviewFileActivity = useCallback(async function loadProjectOverviewFileActivity() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId || taskView !== "overview" || projectOverviewFilesSubview !== "imagine") {
            projectOverviewFileActivityLoadKeyRef.current = "";
            setProjectOverviewThreadRecords([]);
            setProjectOverviewFileActivityState((current) => ({
              projectId: normalizedProjectId,
              status: "idle",
              error: "",
              items: normalizedProjectId && current?.projectId === normalizedProjectId
                ? current.items
                : [],
            }));
            return;
          }

		          const loadKey = [
		            normalizedProjectId,
		            taskView,
		            projectOverviewFilesSubview,
		            backendUrl,
		            requestHeadersKey,
		            selectedProjectOverviewDeletedFileKeysKey,
	            activeProjectAttachmentEnvironmentId,
	            String(projectOverviewFileActivityReloadNonce || 0),
          ].join("|");
          if (projectOverviewFileActivityLoadKeyRef.current === loadKey) {
            return;
          }
          projectOverviewFileActivityLoadKeyRef.current = loadKey;

          setProjectOverviewFileActivityState((current) => ({
            projectId: normalizedProjectId,
            status: "loading",
            error: "",
            items: current?.projectId === normalizedProjectId && Array.isArray(current?.items)
              ? current.items
              : [],
          }));

          const threadHeaders = {
            ...(requestHeaders && typeof requestHeaders === "object" ? requestHeaders : {}),
          };

          let projectThreads = normalizeThreadList(selectedProjectRecentThreads);
          try {
            const threadsResponse = await fetch(backendUrl + "/threads?limit=240", {
              method: "GET",
              headers: threadHeaders,
            });
            const threadsData = await threadsResponse.json().catch(() => ({}));
            if (threadsResponse.ok) {
              const items = Array.isArray(threadsData?.data)
                ? threadsData.data
                : Array.isArray(threadsData?.threads)
                  ? threadsData.threads
                  : [];
              const fetchedProjectThreads = normalizeThreadList(items)
                .filter((thread) => getPlaygroundThreadProjectId(thread) === normalizedProjectId);
              projectThreads = normalizeThreadList([...fetchedProjectThreads, ...projectThreads])
                .sort(compareThreadsByRecent)
                .slice(0, 18);
            }
          } catch {
            projectThreads = projectThreads.slice(0, 12);
          }

          if (projectOverviewFileActivityLoadKeyRef.current !== loadKey) {
            return;
          }
          setProjectOverviewThreadRecords(projectThreads);

          if (projectThreads.length === 0) {
            setProjectOverviewFileActivityState({
              projectId: normalizedProjectId,
              status: "ready",
              error: "",
              items: [],
            });
            return;
          }

          const results = await Promise.allSettled(projectThreads.map(async (threadRecord) => {
            const thread = normalizeThreadItem(threadRecord);
            const normalizedThreadId = String(thread.id || "").trim();
            if (!normalizedThreadId) {
              return [];
            }

            const [stepsResult, logsResult] = await Promise.allSettled([
              projectOverviewHistoryClient.listThreadSteps({
                backendUrl,
                threadId: normalizedThreadId,
                limit: 250,
                headers: threadHeaders,
              }),
              fetchHistoryThreadLogs({
                client: projectOverviewHistoryClient,
                backendUrl,
                threadId: normalizedThreadId,
                headers: threadHeaders,
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
              fallbackEnvironmentId: String(
                selectedProject?.defaultEnvironmentId
                || activeProjectAttachmentEnvironmentId
                || ""
              ).trim(),
              agentsById,
            });
          }));

          if (projectOverviewFileActivityLoadKeyRef.current !== loadKey) {
            return;
          }
          const historyItems = results
            .flatMap((result) => result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [])
            .filter((row) => normalizeHistoryChangeKind(row?.operationKind) !== "deleted")
            .sort((left, right) => {
              const timeDelta = Number(right.timestamp || 0) - Number(left.timestamp || 0);
              if (timeDelta !== 0) {
                return timeDelta;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });

          const suppressedFileKeySet = new Set(selectedProjectOverviewDeletedFileKeys);

          const nextItems = historyItems
            .filter((item) => {
              const normalizedEnvironmentId = String(item?.environmentId || "").trim();
              const normalizedPath = normalizeHistoryPath(item?.path || "");
              const key = getProjectOverviewFileActivityKey(normalizedProjectId, normalizedEnvironmentId, normalizedPath);
              if (!key) {
                return true;
              }
              return !suppressedFileKeySet.has(key);
            })
            .slice(0, 40);

          setProjectOverviewFileActivityState({
            projectId: normalizedProjectId,
            status: "ready",
            error: "",
            items: nextItems,
          });
        }, [
          activeProjectAttachmentEnvironmentId,
	          agentsById,
	          backendUrl,
	          projectOverviewHistoryClient,
	          projectOverviewFileActivityReloadNonce,
	          projectOverviewFilesSubview,
		          requestHeaders,
		          requestHeadersKey,
		          selectedProject?.defaultEnvironmentId,
          selectedProjectOverviewDeletedFileKeysKey,
          selectedProjectId,
          taskView,
        ]);

        useEffect(() => {
          let cancelled = false;

          void loadProjectOverviewFileActivity()
            .catch((error) => {
              if (cancelled) {
                return;
              }
              setProjectOverviewFileActivityState({
                projectId: String(selectedProjectId || "").trim(),
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load project file activity.",
                items: [],
              });
            });

          return () => {
            cancelled = true;
          };
        }, [loadProjectOverviewFileActivity, projectOverviewFileActivityReloadNonce]);

	        const loadProjectOverviewServerResources = useCallback(async function loadProjectOverviewServerResources() {
	          const normalizedProjectId = String(selectedProjectId || "").trim();
		          if (!normalizedProjectId || taskView !== "overview") {
		            projectOverviewServerResourcesLoadKeyRef.current = "";
		            setProjectOverviewServerResourcesState((current) => ({
              ...current,
              projectId: normalizedProjectId,
              status: "idle",
              error: "",
              items: normalizedProjectId && current?.projectId === normalizedProjectId ? current.items : [],
	            }));
	            return;
	          }
		          const loadKey = [
		            normalizedProjectId,
		            taskView,
		            backendUrl,
		            requestHeadersKey,
		          ].join("|");
	          if (projectOverviewServerResourcesLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectOverviewServerResourcesLoadKeyRef.current = loadKey;

	          setProjectOverviewServerResourcesState((current) => ({
            projectId: normalizedProjectId,
            status: "loading",
            error: "",
            items: current?.projectId === normalizedProjectId && Array.isArray(current?.items)
              ? current.items
              : [],
          }));

          try {
            const response = await fetch(
              backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId) + "/resource-index",
              {
              method: "GET",
              headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load project resources.");
            }

            const readResourceIndexItems = (keys) => {
              for (const key of keys) {
                if (Array.isArray(data?.[key])) {
                  return data[key];
                }
              }
              return [];
            };
            const serverResources = readResourceIndexItems(["serverResources", "servers", "resources"]);
            const metronomeResources = readResourceIndexItems(["metronomes", "workflows"]);
            const normalizedServerResources = serverResources.map((server) => {
                const normalizedKind = canonicalizePlaygroundServerKind(server?.kind);
                const endpoint = [
                  typeof server?.customDomain === "string" ? server.customDomain.trim() : "",
                  typeof server?.serviceUrl === "string" ? server.serviceUrl.trim() : "",
                  typeof server?.cloudRunServiceName === "string" ? server.cloudRunServiceName.trim() : "",
                ].find(Boolean) || "";
                const updatedAt = String(server?.updatedAt || server?.createdAt || "").trim();
                return {
                  ...(server && typeof server === "object" ? server : {}),
                  id: String(server?.id || "").trim(),
                  title: String(server?.name || "").trim() || "Untitled Resource",
                  kind: normalizedKind || String(server?.kind || "").trim(),
                  type: formatPlaygroundServerKindLabel(normalizedKind),
                  endpoint,
                  status: String(server?.status || "").trim() || "draft",
                  updatedAt,
                  searchText: [
                    server?.name || "",
                    normalizedKind,
                    formatPlaygroundServerKindLabel(normalizedKind),
                    endpoint,
                    server?.status || "",
                    server?.id || "",
                  ].join(" ").toLowerCase(),
                };
              });
            const normalizedMetronomeResources = metronomeResources.map((metronome) => {
              const endpoint = String(
                metronome?.endpoint
                || metronome?.functionUrl
                || metronome?.triggerUrl
                || ""
              ).trim();
              const updatedAt = String(
                metronome?.updatedAt
                || metronome?.publishedAt
                || metronome?.createdAt
                || ""
              ).trim();
              return {
                ...(metronome && typeof metronome === "object" ? metronome : {}),
                id: String(metronome?.id || "").trim(),
                title: String(metronome?.name || metronome?.title || "").trim() || "Untitled Workflow",
                kind: "metronome",
                resourceType: "metronome",
                type: "Metronome",
                endpoint,
                status: String(metronome?.status || "").trim() || "draft",
                updatedAt,
                searchText: [
                  metronome?.name || metronome?.title || "",
                  "metronome",
                  endpoint,
                  metronome?.status || "",
                  metronome?.id || "",
                ].join(" ").toLowerCase(),
              };
            });
            const seenResourceIds = new Set();
            const nextItems = normalizedServerResources
              .concat(normalizedMetronomeResources)
              .filter((resource, index) => {
                const resourceId = String(
                  resource?.id
                  || resource?.title
                  || resource?.name
                  || index
                ).trim();
                const resourceKey = String(resource?.kind || resource?.type || "resource") + ":" + resourceId;
                if (seenResourceIds.has(resourceKey)) {
                  return false;
                }
                seenResourceIds.add(resourceKey);
                return true;
              })
              .sort((left, right) => {
                const leftTimestamp = Date.parse(String(left?.updatedAt || left?.createdAt || "")) || 0;
                const rightTimestamp = Date.parse(String(right?.updatedAt || right?.createdAt || "")) || 0;
                return rightTimestamp - leftTimestamp;
              });

            if (projectOverviewServerResourcesLoadKeyRef.current !== loadKey) {
              return;
            }
            setProjectOverviewServerResourcesState({
              projectId: normalizedProjectId,
              status: "ready",
              error: "",
              items: nextItems,
            });
          } catch (error) {
            if (projectOverviewServerResourcesLoadKeyRef.current !== loadKey) {
              return;
            }
            setProjectOverviewServerResourcesState((current) => ({
              projectId: normalizedProjectId,
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load project resources.",
              items: current?.projectId === normalizedProjectId && Array.isArray(current?.items)
                ? current.items
                : [],
            }));
          }
		        }, [backendUrl, requestHeaders, requestHeadersKey, selectedProjectId, taskView]);

        useEffect(() => {
          let cancelled = false;

          void loadProjectOverviewServerResources()
            .catch((error) => {
              if (cancelled) {
                return;
              }
              setProjectOverviewServerResourcesState({
                projectId: String(selectedProjectId || "").trim(),
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load project resources.",
                items: [],
              });
            });

          return () => {
            cancelled = true;
          };
        }, [loadProjectOverviewServerResources]);

        useEffect(() => {
          setProjectOverviewFileMenuState(null);
          setProjectOverviewFileMutationState({
            rowId: "",
            action: "",
            error: "",
          });
          if (taskView !== "overview") {
            setProjectOverviewThreadRecords([]);
          }
        }, [selectedProjectId, taskView]);

        useEffect(() => {
          if (!projectOverviewFileMenuState) {
            return;
          }

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              event.preventDefault();
              setProjectOverviewFileMenuState(null);
            }
          }

          function handleViewportChange() {
            setProjectOverviewFileMenuState(null);
          }

          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("resize", handleViewportChange);
          window.addEventListener("scroll", handleViewportChange, true);
          return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
          };
        }, [projectOverviewFileMenuState]);


        function closeProjectOverviewFileMenu() {
          setProjectOverviewFileMenuState(null);
        }





        const fetchProjectCustomSkills = useCallback(async function fetchProjectCustomSkills() {
          const normalizeSkills = (items) => (items || [])
            .filter((skill) => !skill.isDefault && !skill.isSystem)
            .map((skill) => ({
              id: skill.id,
              name: typeof skill.name === "string" && skill.name.trim() ? skill.name.trim() : skill.id,
              description: skill.description || "",
              icon: typeof skill.icon === "string" ? skill.icon : null,
              markdown: typeof skill.markdown === "string" ? skill.markdown : "",
              codeFiles: Array.isArray(skill.codeFiles)
                ? skill.codeFiles
                    .filter((file) => file && typeof file === "object")
                    .map((file) => ({
                      name: typeof file.name === "string" ? file.name : "",
                      content: typeof file.content === "string" ? file.content : "",
                      language: typeof file.language === "string" ? file.language : undefined,
                    }))
                    .filter((file) => file.name)
                : [],
              isCustom: true,
              enabled: true,
            }));

          if (!selectedProjectId) {
            return [];
          }

          const requestUrl = new URL("/api/playground/custom-skills", window.location.origin);
          requestUrl.searchParams.set("projectId", selectedProjectId);

          const response = await fetch(requestUrl.toString(), {
            method: "GET",
            credentials: "include",
            headers: {
              ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
              "X-Runner-Upstream-Url": upstreamUrl,
            },
          });
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to fetch custom skills");
          }

          return normalizeSkills(data?.data || data?.skills || []);
        }, [effectiveApiKey, selectedProjectId, upstreamUrl]);

        const loadTaskConnectorFolder = useCallback(async function loadTaskConnectorFolder(source, folderId, options = {}) {
          const connectorKey = getPlaygroundTaskConnectorKey(source);
          if (!connectorKey || connectorKey === "notion") {
            return [];
          }

          const connectorConfig = taskConnectorConfigByKey[connectorKey];
          if (!connectorConfig?.fetchItems) {
            return [];
          }

          const normalizedFolderId = folderId || "root";
          if (!options.force) {
            const loadedFolderIds = taskConnectorBrowserLoadedFolderIds[connectorKey] || [];
            const loadingFolderIds = taskConnectorBrowserLoadingFolderIds[connectorKey] || [];
            if (loadedFolderIds.includes(normalizedFolderId) || loadingFolderIds.includes(normalizedFolderId)) {
              return taskConnectorBrowserItemsBySource[connectorKey] || [];
            }
          }

          setTaskConnectorBrowserLoadingFolderIds((current) => ({
            ...current,
            [connectorKey]: (current[connectorKey] || []).includes(normalizedFolderId)
              ? current[connectorKey] || []
              : (current[connectorKey] || []).concat(normalizedFolderId),
          }));
          setTaskConnectorBrowserLoadingState((current) => ({
            ...current,
            [connectorKey]: true,
          }));
          setTaskConnectorBrowserErrors((current) => ({
            ...current,
            [connectorKey]: "",
          }));

          try {
            const items = await connectorConfig.fetchItems(normalizedFolderId);
            const normalizedItems = (Array.isArray(items) ? items : [])
              .map((item) => normalizePlaygroundTaskConnectorItem(item))
              .filter(Boolean);
            setTaskConnectorBrowserItemsBySource((current) => ({
              ...current,
              [connectorKey]: mergePlaygroundConnectorFolderItems(current[connectorKey] || [], normalizedFolderId, normalizedItems),
            }));
            setTaskConnectorBrowserLoadedFolderIds((current) => ({
              ...current,
              [connectorKey]: (current[connectorKey] || []).includes(normalizedFolderId)
                ? current[connectorKey] || []
                : (current[connectorKey] || []).concat(normalizedFolderId),
            }));
            return normalizedItems;
          } catch (error) {
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              [connectorKey]: error instanceof Error ? error.message : "Failed to load connector files.",
            }));
            return [];
          } finally {
            setTaskConnectorBrowserLoadingFolderIds((current) => ({
              ...current,
              [connectorKey]: (current[connectorKey] || []).filter((value) => value !== normalizedFolderId),
            }));
            setTaskConnectorBrowserLoadingState((current) => ({
              ...current,
              [connectorKey]: false,
            }));
          }
        }, [
          taskConnectorBrowserItemsBySource,
          taskConnectorBrowserLoadedFolderIds,
          taskConnectorBrowserLoadingFolderIds,
          taskConnectorConfigByKey,
        ]);

        const loadTaskConnectorNotionDatabases = useCallback(async function loadTaskConnectorNotionDatabases(options = {}) {
          const notionConfig = taskConnectorConfigByKey.notion;
          if (!notionConfig?.fetchDatabases) {
            return [];
          }

          if (!options.force && (taskConnectorBrowserNotionDatabasesLoaded || taskConnectorBrowserLoadingState.notion)) {
            return taskConnectorBrowserNotionDatabases;
          }

          setTaskConnectorBrowserLoadingState((current) => ({
            ...current,
            notion: true,
          }));
          setTaskConnectorBrowserErrors((current) => ({
            ...current,
            notion: "",
          }));

          try {
            const databases = await notionConfig.fetchDatabases();
            const normalizedDatabases = (Array.isArray(databases) ? databases : [])
              .filter((database) => database && typeof database === "object" && typeof database.id === "string" && database.id.trim())
              .map((database) => ({
                id: database.id,
                name: typeof database.name === "string" && database.name.trim() ? database.name.trim() : "Untitled database",
                icon: typeof database.icon === "string" ? database.icon : "",
              }));
            setTaskConnectorBrowserNotionDatabases(normalizedDatabases);
            setTaskConnectorBrowserNotionDatabasesLoaded(true);
            return normalizedDatabases;
          } catch (error) {
            setTaskConnectorBrowserNotionDatabases([]);
            setTaskConnectorBrowserNotionDatabasesLoaded(false);
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              notion: error instanceof Error ? error.message : "Failed to load Notion databases.",
            }));
            return [];
          } finally {
            setTaskConnectorBrowserLoadingState((current) => ({
              ...current,
              notion: false,
            }));
          }
        }, [
          taskConnectorBrowserLoadingState.notion,
          taskConnectorBrowserNotionDatabases,
          taskConnectorBrowserNotionDatabasesLoaded,
          taskConnectorConfigByKey.notion,
        ]);

        useEffect(() => {
          let isCancelled = false;

	          if (!selectedProjectId) {
	            projectCustomSkillsLoadKeyRef.current = "";
	            setProjectCustomSkills([]);
	            setProjectCustomSkillsLoading(false);
	            return undefined;
	          }
	          const loadKey = [
	            selectedProjectId,
	            effectiveApiKey,
	            upstreamUrl,
	          ].join("|");
	          if (projectCustomSkillsLoadKeyRef.current === loadKey) {
	            return undefined;
	          }
	          projectCustomSkillsLoadKeyRef.current = loadKey;

	          setProjectCustomSkillsLoading(true);
          void (async () => {
            try {
              const nextSkills = await fetchProjectCustomSkills();
              if (!isCancelled) {
                setProjectCustomSkills(Array.isArray(nextSkills) ? nextSkills : []);
              }
            } catch {
              if (!isCancelled) {
                setProjectCustomSkills([]);
              }
            } finally {
              if (!isCancelled) {
                setProjectCustomSkillsLoading(false);
              }
            }
          })();

          return () => {
            isCancelled = true;
          };
        }, [fetchProjectCustomSkills, selectedProjectId]);

        const taskSkillOptionsById = useMemo(() => {
          const next = {};

          PLAYGROUND_AGENT_SKILL_OPTIONS.forEach((skill) => {
            if (!skill?.id) return;
            next[skill.id] = {
              id: skill.id,
              name: typeof skill.label === "string" && skill.label.trim() ? skill.label.trim() : skill.id,
              description: typeof skill.description === "string" ? skill.description : "",
              isCustom: false,
              icon: null,
            };
          });

          (Array.isArray(skills) ? skills : []).forEach((skill) => {
            const skillId = typeof skill?.id === "string" ? skill.id.trim() : "";
            if (!skillId) return;
            next[skillId] = {
              id: skillId,
              name: typeof skill?.name === "string" && skill.name.trim()
                ? skill.name.trim()
                : typeof skill?.label === "string" && skill.label.trim()
                  ? skill.label.trim()
                  : next[skillId]?.name || skillId,
              description: typeof skill?.description === "string"
                ? skill.description
                : next[skillId]?.description || "",
              isCustom: false,
              icon: typeof skill?.icon === "string" ? skill.icon : next[skillId]?.icon || null,
            };
          });

          projectCustomSkills.forEach((skill) => {
            const skillId = typeof skill?.id === "string" ? skill.id.trim() : "";
            if (!skillId) return;
            next[skillId] = {
              id: skillId,
              name: typeof skill?.name === "string" && skill.name.trim()
                ? skill.name.trim()
                : next[skillId]?.name || skillId,
              description: typeof skill?.description === "string"
                ? skill.description
                : next[skillId]?.description || "",
              isCustom: true,
              icon: typeof skill?.icon === "string" ? skill.icon : null,
            };
          });

          return next;
        }, [projectCustomSkills, skills]);

        function buildTaskSkillFallbackName(skillId) {
          return String(skillId || "")
            .replace(/[_-]+/g, " ")
            .replace(/\\b\\w/g, (character) => character.toUpperCase());
        }

        function resolveTaskSkillItem(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0] || String(skillId || "").trim();
          if (!normalizedSkillId) return null;
          const option = taskSkillOptionsById[normalizedSkillId];
          if (option) {
            return option;
          }
          return {
            id: normalizedSkillId,
            name: buildTaskSkillFallbackName(normalizedSkillId),
            description: "",
            isCustom: false,
            icon: null,
          };
        }

        function getPlaygroundAgentEnabledSkillIds(agentId) {
          const normalizedAgentId = typeof agentId === "string" ? agentId.trim() : "";
          if (!normalizedAgentId) {
            return ["frontend_design"];
          }
          const matchingAgent = agentsById[normalizedAgentId];
          const enabledSkillIds = normalizePlaygroundEnabledSkillIds(matchingAgent?.enabledSkills);
          return enabledSkillIds.length > 0 ? enabledSkillIds : ["frontend_design"];
        }

        function getEffectivePlaygroundTaskEnabledSkillIds(taskLike) {
          const explicitSkillIds = normalizePlaygroundEnabledSkillIds(taskLike?.enabledSkills);
          if (explicitSkillIds.length > 0) {
            return explicitSkillIds;
          }
          const assigneeAgentId = typeof taskLike?.assigneeAgentId === "string" && taskLike.assigneeAgentId.trim()
            ? taskLike.assigneeAgentId.trim()
            : typeof taskLike?.agentId === "string" && taskLike.agentId.trim()
              ? taskLike.agentId.trim()
              : "";
          const agentSkillIds = getPlaygroundAgentEnabledSkillIds(assigneeAgentId);
          return agentSkillIds.length > 0 ? agentSkillIds : ["frontend_design"];
        }

        const taskSystemSkillItems = useMemo(() => {
          const next = [];
          const seen = new Set();
          const activeEnabledSkillIds = Array.from(new Set(
            getEffectivePlaygroundTaskEnabledSkillIds(draftTask).concat(getEffectivePlaygroundTaskEnabledSkillIds(scheduleDraft))
          ));

          function appendSkill(skillId) {
            const item = resolveTaskSkillItem(skillId);
            if (!item || item.isCustom || seen.has(item.id)) {
              return;
            }
            seen.add(item.id);
            next.push(item);
          }

          (Array.isArray(skills) ? skills : []).forEach((skill) => appendSkill(skill?.id));
          activeEnabledSkillIds.forEach((skillId) => appendSkill(skillId));

          return next;
        }, [draftTask, scheduleDraft, skills, taskSkillOptionsById]);

        const taskSystemSkillIdSet = useMemo(() => {
          return new Set(taskSystemSkillItems.map((skill) => skill.id));
        }, [taskSystemSkillItems]);

        const taskCustomSkillItems = useMemo(() => {
          const next = [];
          const seen = new Set();
          const activeEnabledSkillIds = Array.from(new Set(
            getEffectivePlaygroundTaskEnabledSkillIds(draftTask).concat(getEffectivePlaygroundTaskEnabledSkillIds(scheduleDraft))
          ));

          function appendSkill(skillId) {
            const item = resolveTaskSkillItem(skillId);
            if (!item || seen.has(item.id)) {
              return;
            }
            if (!item.isCustom && taskSystemSkillIdSet.has(item.id)) {
              return;
            }
            seen.add(item.id);
            next.push({
              ...item,
              isCustom: true,
            });
          }

          projectCustomSkills.forEach((skill) => appendSkill(skill?.id));
          activeEnabledSkillIds.forEach((skillId) => {
            if (!taskSystemSkillIdSet.has(skillId)) {
              appendSkill(skillId);
            }
          });

          return next;
        }, [draftTask, scheduleDraft, projectCustomSkills, taskSystemSkillIdSet, taskSkillOptionsById]);

        function getTaskSkillIconComponent(skill) {
          const normalizedCustomIcon = String(skill?.icon || "default").trim().toLowerCase();
          if (skill?.isCustom) {
            if (normalizedCustomIcon === "sparkles") return Sparkles;
            if (normalizedCustomIcon === "brain") return Brain;
            if (normalizedCustomIcon === "zap") return Zap;
            if (normalizedCustomIcon === "telescope") return Telescope;
            if (normalizedCustomIcon === "search") return Globe;
            if (normalizedCustomIcon === "image") return ImageIcon;
            if (normalizedCustomIcon === "code") return Code;
            if (normalizedCustomIcon === "terminal") return Terminal;
            if (normalizedCustomIcon === "file-text") return FileText;
            if (normalizedCustomIcon === "database") return Database;
            if (normalizedCustomIcon === "pen-tool") return PenTool;
            if (normalizedCustomIcon === "palette") return Paintbrush;
            if (normalizedCustomIcon === "slash") return Slash;
            if (normalizedCustomIcon === "message") return MessageSquare;
            if (normalizedCustomIcon === "mail") return Mail;
            if (normalizedCustomIcon === "calendar") return CalendarIcon;
            if (normalizedCustomIcon === "calculator") return Calculator;
            if (normalizedCustomIcon === "shield" || normalizedCustomIcon === "lock") return Shield;
            if (normalizedCustomIcon === "cloud") return Cloud;
            if (normalizedCustomIcon === "server") return Server;
            if (normalizedCustomIcon === "cpu") return Cpu;
            if (normalizedCustomIcon === "git") return GitCommitHorizontal;
            if (normalizedCustomIcon === "package") return Package;
            if (normalizedCustomIcon === "list") return ListTodo;
            return Wand2;
          }
          if (skill?.id === "image_generation") return ImageIcon;
          if (skill?.id === "video_generation") return Film;
          if (skill?.id === "web_search") return Globe;
          if (skill?.id === "research" || skill?.id === "deep_research") return Telescope;
          if (skill?.id === "pdf") return FileText;
          if (skill?.id === "frontend_design") return Slash;
          if (skill?.id === "pptx") return Layers;
          if (skill?.id === "memory") return Brain;
          if (skill?.id === "task_management") return ListTodo;
          if (skill?.id === "app_platform") return Server;
          if (skill?.id === "computer_agents") return Cpu;
          return Layers;
        }

        function renderTaskSkillIcon(skill, className) {
          if (skill?.id === "computer_agents") {
            return React.createElement("img", {
              src: RUNNER_TRANSPARENT_LOGO_URL,
              alt: "",
              "aria-hidden": "true",
              draggable: false,
              className,
              style: { objectFit: "contain" },
            });
          }
          const Icon = getTaskSkillIconComponent(skill);
          return React.createElement(Icon, { className, strokeWidth: 1.75 });
        }

        const normalizedSearchQuery = searchQuery.trim().toLowerCase();

        const filteredProjectThreads = useMemo(() => {
          return [...projectOverviewThreads]
            .filter((thread) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                thread.title || "",
                thread.id || "",
                formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || "")));
        }, [normalizedSearchQuery, projectOverviewThreads]);

        const selectedProjectAttachments = useMemo(() => {
          return normalizePlaygroundTaskAttachmentList(selectedProject?.attachments);
        }, [selectedProject?.attachments]);

        const filteredProjectAttachments = useMemo(() => {
          return [...selectedProjectAttachments]
            .filter((attachment) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                attachment.filename || attachment.name || "",
                attachment.sourcePath || attachment.workspacePath || "",
                attachment.environmentName || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
        }, [normalizedSearchQuery, selectedProjectAttachments]);

        const overviewVisibleEnvironments = useMemo(() => {
          return selectedProjectEnvironments.filter((environment) => {
            if (!normalizedSearchQuery) return true;
            const haystack = [
              environment.name || "",
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        }, [normalizedSearchQuery, selectedProjectEnvironments]);

        const overviewPluginItems = useMemo(() => {
          const items = [
            {
              id: "github",
              label: "GitHub",
              logoUrl: PLAYGROUND_GITHUB_LOGO_URL,
              description: "Browse repos and attach code directly to project work.",
              statusLabel: taskConnectorConfigByKey.github ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.github),
            },
            {
              id: "gitlab",
              label: "GitLab",
              logoUrl: "/img/04-skills/gitlab.svg",
              description: "Route merge request and push events into project threads.",
              statusLabel: "Via Actions",
              isActive: true,
            },
            {
              id: "google-drive",
              label: "Google Drive",
              logoUrl: PLAYGROUND_GOOGLE_DRIVE_LOGO_URL,
              description: "Use Drive files as shared project context for tasks and threads.",
              statusLabel: taskConnectorConfigByKey.googleDrive ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.googleDrive),
            },
            {
              id: "one-drive",
              label: "OneDrive",
              logoUrl: PLAYGROUND_ONEDRIVE_LOGO_URL,
              description: "Keep Microsoft-hosted docs available inside the project workspace.",
              statusLabel: taskConnectorConfigByKey.oneDrive ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.oneDrive),
            },
            {
              id: "notion",
              label: "Notion",
              logoUrl: PLAYGROUND_NOTION_LOGO_URL,
              description: "Reference workspace docs and databases while planning delivery.",
              statusLabel: taskConnectorConfigByKey.notion ? "Available" : "Not configured",
              isActive: Boolean(taskConnectorConfigByKey.notion),
            },
          ];
          return items.filter((item) => {
            if (!normalizedSearchQuery) return true;
            const haystack = [
              item.label || "",
              item.description || "",
              item.statusLabel || "",
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        }, [normalizedSearchQuery, taskConnectorConfigByKey]);

        const tasksById = useMemo(() => {
          const next = {};
          tasks.forEach((task) => {
            if (!task?.id) return;
            next[task.id] = task;
          });
          return next;
        }, [tasks]);

        const releasesById = useMemo(() => {
          const next = {};
          releases.forEach((release) => {
            if (!release?.id) return;
            next[release.id] = release;
          });
          return next;
        }, [releases]);

        const taskTicketNumbersById = useMemo(
          () => buildPlaygroundTaskTicketNumberMap(tasks, selectedProject),
          [selectedProject, tasks]
        );
        const taskDetailThreadSortOptions = [
          { id: "recent-desc", label: "Recently Updated", description: "Show the newest activity first" },
          { id: "created-desc", label: "Newest Created", description: "Show newly created threads first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort threads alphabetically" },
        ];
        const taskDetailThreadFilterOptions = [
          { id: "all", label: "All Threads", description: "Show every run for this ticket" },
          { id: "running", label: "Running", description: "Only show threads still in progress" },
          { id: "permission", label: "Needs Permission", description: "Only show threads waiting for approval" },
          { id: "completed", label: "Completed", description: "Only show finished threads" },
          { id: "failed", label: "Failed", description: "Only show failed or cancelled threads" },
        ];
        const activeTaskDetailThreadSortOption = taskDetailThreadSortOptions.find((option) => option.id === taskDetailThreadSortMode) || taskDetailThreadSortOptions[0];
        const activeTaskDetailThreadFilterOption = taskDetailThreadFilterOptions.find((option) => option.id === taskDetailThreadFilterMode) || taskDetailThreadFilterOptions[0];
	        const selectedTaskThreadIds = useMemo(() => {
	          const ids = [];
	          const lastStartedThreadId = typeof draftTask?.lastStartedThreadId === "string"
	            ? draftTask.lastStartedThreadId.trim()
            : "";
          if (lastStartedThreadId) {
            ids.push(lastStartedThreadId);
          }
          normalizePlaygroundIdList(draftTask?.linkedThreadIds).forEach((threadId) => {
            if (threadId) {
              ids.push(threadId);
            }
	          });
	          return Array.from(new Set(ids));
	        }, [draftTask?.lastStartedThreadId, draftTask?.linkedThreadIds]);
	        const selectedTaskThreadIdsKey = useMemo(() => selectedTaskThreadIds.join("|"), [selectedTaskThreadIds]);
	        const taskDetailThreadSummaryKey = useMemo(() => (
	          (Array.isArray(taskDetailThreadRecords) ? taskDetailThreadRecords : [])
	            .map((thread) => String(thread?.id || "").trim() + ":" + String(thread?.status || "").trim().toLowerCase())
	            .filter(Boolean)
	            .join("|")
	        ), [taskDetailThreadRecords]);
          const selectedTaskAgentSessions = useMemo(() => {
            const normalizedTaskId = String(draftTask?.id || selectedTaskId || "").trim();
            if (!normalizedTaskId) {
              return [];
            }
            return (Array.isArray(selectedProjectDetail?.agentSessions)
              ? selectedProjectDetail.agentSessions
              : [])
              .filter((session) => String(session?.taskId || session?.task_id || "").trim() === normalizedTaskId)
              .sort((left, right) => {
                const rightAttempt = Number(right?.attemptNumber ?? right?.attempt_number ?? 0);
                const leftAttempt = Number(left?.attemptNumber ?? left?.attempt_number ?? 0);
                const rightTime = Date.parse(String(right?.createdAt || right?.created_at || "")) || 0;
                const leftTime = Date.parse(String(left?.createdAt || left?.created_at || "")) || 0;
                return rightAttempt - leftAttempt || rightTime - leftTime;
              });
          }, [draftTask?.id, selectedProjectDetail?.agentSessions, selectedTaskId]);
		        const selectedTaskThreads = useMemo(() => {
          const normalizedTaskId = String(draftTask?.id || selectedTaskId || "").trim();
          if (!normalizedTaskId) {
            return [];
          }

          const linkedThreadIdSet = new Set(selectedTaskThreadIds);
          const taskTicketNumber = String(taskTicketNumbersById[normalizedTaskId] || draftTask?.ticketNumber || "").trim();
          const normalizedProjectId = String(draftTask?.projectId || selectedProjectId || "").trim();
          const matchedById = new Map();

          normalizeThreadList([
            ...(Array.isArray(selectedProjectRecentThreads) ? selectedProjectRecentThreads : []),
            ...(Array.isArray(projectOverviewThreads) ? projectOverviewThreads : []),
            ...(Array.isArray(taskDetailThreadRecords) ? taskDetailThreadRecords : []),
            ...selectedTaskAgentSessions.map((session) => {
              const sessionState = String(session?.state || "").trim().toLowerCase();
              const threadStatus = sessionState === "completed"
                ? "completed"
                : sessionState === "failed" || sessionState === "stale"
                  ? "failed"
                  : sessionState === "canceled"
                    ? "cancelled"
                    : sessionState === "awaiting_input"
                      ? "waiting_permission"
                      : "running";
              const attemptNumber = Math.max(1, Number(session?.attemptNumber ?? session?.attempt_number ?? 1) || 1);
              return {
                id: String(session?.threadId || session?.thread_id || "").trim(),
                title: "Agent attempt " + attemptNumber,
                status: threadStatus,
                agentId: String(session?.agentId || session?.agent_id || "").trim() || undefined,
                environmentId: String(session?.environmentId || session?.environment_id || "").trim() || undefined,
                projectId: normalizedProjectId,
                createdAt: session?.createdAt || session?.created_at || undefined,
                updatedAt: session?.updatedAt || session?.updated_at || undefined,
                completedAt: session?.completedAt || session?.completed_at || undefined,
                metadata: {
                  runnerPlayground: {
                    taskAgentSessionId: String(session?.id || "").trim(),
                    taskPreview: {
                      taskId: normalizedTaskId,
                      projectId: normalizedProjectId,
                      ticketNumber: taskTicketNumber || "",
                      title: draftTask?.title || "Untitled Task",
                    },
                  },
                },
              };
            }),
          ]).forEach((thread) => {
            const threadId = String(thread?.id || "").trim();
            if (!threadId) {
              return;
            }
            const taskPreview = getThreadTaskPreview(thread);
            const previewTaskId = String(taskPreview?.taskId || "").trim();
            const threadProjectId = getPlaygroundThreadProjectId(thread);
            const threadTitle = String(thread?.title || "").trim();
            const matchesLinkedThread = linkedThreadIdSet.has(threadId);
            const matchesTaskPreview = previewTaskId === normalizedTaskId;
            const matchesTicketFallback = Boolean(
              taskTicketNumber
              && normalizedProjectId
              && threadProjectId === normalizedProjectId
              && (
                threadTitle === taskTicketNumber
                || threadTitle.startsWith(taskTicketNumber + " ")
                || threadTitle.startsWith(taskTicketNumber + ":")
              )
            );
            if (matchesLinkedThread || matchesTaskPreview || matchesTicketFallback) {
              matchedById.set(threadId, thread);
            }
          });

          selectedTaskThreadIds.forEach((threadId) => {
            if (!threadId || matchedById.has(threadId)) {
              return;
            }
            matchedById.set(threadId, normalizeThreadItem({
              id: threadId,
              title: "Thread " + threadId,
              status: "",
              projectId: normalizedProjectId,
              metadata: {
                runnerPlayground: {
                  taskPreview: {
                    taskId: normalizedTaskId,
                    projectId: normalizedProjectId,
                    ticketNumber: taskTicketNumber || "",
                    title: draftTask?.title || "Untitled Task",
                  },
                },
              },
            }));
          });

          return Array.from(matchedById.values()).sort(compareThreadsByRecent);
        }, [
          draftTask?.id,
          draftTask?.projectId,
          draftTask?.ticketNumber,
          draftTask?.title,
          projectOverviewThreads,
          selectedProjectId,
          selectedProjectRecentThreads,
          selectedTaskAgentSessions,
          selectedTaskId,
          selectedTaskThreadIds,
          taskDetailThreadRecords,
          taskTicketNumbersById,
        ]);

        const visibleTaskDetailThreads = useMemo(() => {
          return selectedTaskThreads.slice().sort(compareThreadsByRecent);
        }, [selectedTaskThreads]);
        useEffect(() => {
          if (!taskDetailThreadToolbarPopover) return undefined;

          function handleTaskDetailThreadToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailThreadsToolbarRef.current || taskDetailThreadsToolbarRef.current.contains(target)) {
              return;
            }
            setTaskDetailThreadToolbarPopover("");
          }

          document.addEventListener("mousedown", handleTaskDetailThreadToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleTaskDetailThreadToolbarPointerDown);
        }, [taskDetailThreadToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewTaskToolbarPopover) return undefined;

          function handleProjectOverviewTaskToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectOverviewTasksToolbarRef.current || projectOverviewTasksToolbarRef.current.contains(target)) {
              return;
            }
            setProjectOverviewTaskToolbarPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewTaskToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewTaskToolbarPointerDown);
        }, [projectOverviewTaskToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewThreadToolbarPopover) return undefined;

          function handleProjectOverviewThreadToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectOverviewThreadsToolbarRef.current || projectOverviewThreadsToolbarRef.current.contains(target)) {
              return;
            }
            setProjectOverviewThreadToolbarPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewThreadToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewThreadToolbarPointerDown);
        }, [projectOverviewThreadToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewFileToolbarPopover) return undefined;

          function handleProjectOverviewFileToolbarPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectOverviewFilesToolbarRef.current || projectOverviewFilesToolbarRef.current.contains(target)) {
              return;
            }
            setProjectOverviewFileToolbarPopover("");
          }

          document.addEventListener("mousedown", handleProjectOverviewFileToolbarPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewFileToolbarPointerDown);
        }, [projectOverviewFileToolbarPopover]);
        useEffect(() => {
          if (!projectOverviewTeamMenuId && !projectOverviewMilestoneMenuId && !projectOverviewResourceMenuId) return undefined;

          function handleProjectOverviewMenusPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target) {
              return;
            }
            if (
              target.closest(".playground-project-team-action-shell")
              || target.closest(".playground-project-teams-add-shell")
              || target.closest(".playground-project-teams-add-menu")
            ) {
              return;
            }
            if (target.closest(".playground-project-overview-sidebar-milestone-menu-shell")) {
              return;
            }
            if (target.closest(".playground-project-resources-action-shell")) {
              return;
            }
            setProjectOverviewTeamMenuId("");
            setProjectOverviewMilestoneMenuId("");
            setProjectOverviewResourceMenuId("");
          }

          document.addEventListener("mousedown", handleProjectOverviewMenusPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectOverviewMenusPointerDown);
        }, [projectOverviewTeamMenuId, projectOverviewMilestoneMenuId, projectOverviewResourceMenuId]);
        useEffect(() => {
          setProjectOverviewThreadPagination((current) => ({
            pageIndex: 0,
            pageSize: Math.max(1, Number(current?.pageSize) || 5),
          }));
          setProjectOverviewVisibleActivityCount(5);
          setProjectOverviewSidebarPropertyPopover("");
          setProjectOverviewTeamMenuId("");
          setProjectOverviewMilestoneMenuId("");
          setProjectOverviewResourceMenuId("");
          setSelectedProjectOverviewThreadIds(new Set());
        }, [projectOverviewThreadFilterMode, projectOverviewThreadSearchQuery, projectOverviewThreadSortMode, selectedProjectId]);
        useEffect(() => {
`;
