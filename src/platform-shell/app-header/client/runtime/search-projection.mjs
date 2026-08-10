export const APP_HEADER_SEARCH_PROJECTION_SCRIPT = `        useEffect(() => {
          threadSearchFileInventoryByEnvironmentIdRef.current = threadSearchFileInventoryByEnvironmentId;
        }, [threadSearchFileInventoryByEnvironmentId]);

        const THREAD_SEARCH_RESULT_LIMIT = 20;
        const threadSearchResourceScopeKey = useMemo(() => (
          proxyBackendBase + "|" + requestHeadersSignature
        ), [proxyBackendBase, requestHeadersSignature]);
        function resolveGlobalServiceSearchQuery(value) {
          const normalizedValue = String(value || "").trimStart();
          if (!normalizedValue.startsWith("/")) {
            return null;
          }
          return normalizedValue.slice(1).trim();
        }
        const globalServiceSearchQuery = threadSearchModeLocked
          ? null
          : resolveGlobalServiceSearchQuery(threadSearchQuery);
        const isGlobalServiceSearchQuery = globalServiceSearchQuery !== null;

        useEffect(() => {
          if (threadSearchFileInventoryScopeKeyRef.current === threadSearchResourceScopeKey) {
            return;
          }
          threadSearchFileInventoryScopeKeyRef.current = threadSearchResourceScopeKey;
          threadSearchFileInventoryByEnvironmentIdRef.current = {};
          threadSearchFileInventoryLoadingIdsRef.current.clear();
          threadSearchThreadAbortControllerRef.current?.abort();
          threadSearchThreadAbortControllerRef.current = null;
          threadSearchThreadResultsCacheRef.current.clear();
          threadSearchResourceLatestRequestKeyRef.current.threads = "";
          setThreadSearchFileInventoryByEnvironmentId({});
          setThreadSearchFileInventoryLoadingByEnvironmentId({});
          setThreadSearchResourceDataByMode((current) => ({
            ...current,
            threads: {
              scopeKey: threadSearchResourceScopeKey,
              query: "",
              items: [],
              total: 0,
            },
            prompts: {
              scopeKey: threadSearchResourceScopeKey,
              items: [],
            },
          }));
          setThreadSearchResourceLoadingByMode((current) => ({
            ...current,
            threads: false,
          }));
          setThreadSearchResourceErrorByMode((current) => ({
            ...current,
            threads: "",
          }));
        }, [threadSearchResourceScopeKey]);

        const loadThreadSearchFileInventory = useCallback(async (targetEnvironmentId) => {
          const normalizedEnvironmentId = String(targetEnvironmentId || "").trim();
          if (!normalizedEnvironmentId) {
            return [];
          }
          const requestScopeKey = threadSearchResourceScopeKey;
          const requestKey = requestScopeKey + "|" + normalizedEnvironmentId;
          const cachedInventory = threadSearchFileInventoryByEnvironmentIdRef.current[normalizedEnvironmentId];
          if (
            threadSearchFileInventoryScopeKeyRef.current === requestScopeKey
            && Array.isArray(cachedInventory)
          ) {
            return cachedInventory;
          }
          if (threadSearchFileInventoryLoadingIdsRef.current.has(requestKey)) {
            return [];
          }

          threadSearchFileInventoryLoadingIdsRef.current.add(requestKey);
          setThreadSearchFileInventoryLoadingByEnvironmentId((current) => ({
            ...current,
            [normalizedEnvironmentId]: true,
          }));

          try {
            const response = await fetch(
              buildPlaygroundEnvironmentFilesListUrl(proxyBackendBase, normalizedEnvironmentId, "", -1),
              {
                method: "GET",
                headers: authRequestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to search files.");
            }
            const normalizedInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
            if (threadSearchFileInventoryScopeKeyRef.current === requestScopeKey) {
              setThreadSearchFileInventoryByEnvironmentId((current) => ({
                ...current,
                [normalizedEnvironmentId]: normalizedInventory,
              }));
            }
            return normalizedInventory;
          } catch {
            if (threadSearchFileInventoryScopeKeyRef.current === requestScopeKey) {
              setThreadSearchFileInventoryByEnvironmentId((current) => ({
                ...current,
                [normalizedEnvironmentId]: [],
              }));
            }
            return [];
          } finally {
            threadSearchFileInventoryLoadingIdsRef.current.delete(requestKey);
            if (threadSearchFileInventoryScopeKeyRef.current === requestScopeKey) {
              setThreadSearchFileInventoryLoadingByEnvironmentId((current) => ({
                ...current,
                [normalizedEnvironmentId]: false,
              }));
            }
          }
        }, [authRequestHeaders, proxyBackendBase, threadSearchResourceScopeKey]);

        const loadThreadSearchResourceMode = useCallback(async (targetMode) => {
          const normalizedMode = String(targetMode || "").trim();
          if (
            !hasRealAccess
            || !["agents", "tickets", "workflows", "prompts"].includes(normalizedMode)
          ) {
            return [];
          }

          const requestKey = normalizedMode + "|" + threadSearchResourceScopeKey;
          const cachedAt = Number(threadSearchResourceLoadedAtByModeRef.current[normalizedMode] || 0);
          const hasFreshCache = (
            threadSearchResourceLoadKeysRef.current[normalizedMode] === requestKey
            && Date.now() - cachedAt < 30000
          );
          if (hasFreshCache) {
            const cachedState = threadSearchResourceDataByMode[normalizedMode];
            return cachedState?.scopeKey === threadSearchResourceScopeKey && Array.isArray(cachedState.items)
              ? cachedState.items
              : [];
          }
          if (threadSearchResourceLoadingRequestKeysRef.current.has(requestKey)) {
            return [];
          }

          threadSearchResourceLatestRequestKeyRef.current[normalizedMode] = requestKey;
          threadSearchResourceLoadingRequestKeysRef.current.add(requestKey);
          setThreadSearchResourceDataByMode((current) => {
            const currentModeState = current[normalizedMode];
            if (currentModeState?.scopeKey === threadSearchResourceScopeKey) {
              return current;
            }
            return {
              ...current,
              [normalizedMode]: {
                scopeKey: threadSearchResourceScopeKey,
                items: [],
              },
            };
          });
          setThreadSearchResourceLoadingByMode((current) => ({
            ...current,
            [normalizedMode]: true,
          }));
          setThreadSearchResourceErrorByMode((current) => ({
            ...current,
            [normalizedMode]: "",
          }));

          try {
            let items = [];
            if (normalizedMode === "agents") {
              items = await refreshAgents();
            } else if (normalizedMode === "tickets") {
              const target = new URL(proxyBackendBase + "/tasks", window.location.origin);
              target.searchParams.set("limit", "200");
              const response = await fetch(target.toString(), {
                method: "GET",
                headers: authRequestHeaders,
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load tickets.");
              }
              items = parsePlaygroundTaskListResponse(data);
            } else if (normalizedMode === "prompts") {
              const response = await fetch(proxyBackendBase + "/prompts", {
                method: "GET",
                headers: authRequestHeaders,
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load prompts.");
              }
              items = Array.isArray(data?.prompts)
                ? data.prompts
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
            } else {
              const workflowResults = await Promise.allSettled([
                fetchMetronomeWorkflowsFromApi("", {
                  backendUrl: proxyBackendBase,
                  requestHeaders: authRequestHeaders,
                }),
                fetchMetronomeSharedWorkflowsFromTeamsApi({
                  backendUrl: proxyBackendBase,
                  requestHeaders: authRequestHeaders,
                }),
              ]);
              const ownedWorkflows = workflowResults[0].status === "fulfilled"
                ? workflowResults[0].value
                : [];
              const sharedWorkflows = workflowResults[1].status === "fulfilled"
                ? workflowResults[1].value
                : [];
              const builtInWorkflows = (Array.isArray(METRONOME_BUILT_IN_WORKFLOWS)
                ? METRONOME_BUILT_IN_WORKFLOWS
                : [])
                .map((definition) => createBuiltInMetronomeWorkflow(definition))
                .filter(Boolean);
              const workflowsById = new Map();
              [...builtInWorkflows, ...ownedWorkflows, ...sharedWorkflows].forEach((workflow) => {
                const workflowId = String(workflow?.id || "").trim();
                if (workflowId && !workflowsById.has(workflowId)) {
                  workflowsById.set(workflowId, workflow);
                }
              });
              items = Array.from(workflowsById.values());
              if (
                workflowResults.every((result) => result.status === "rejected")
                && items.length === 0
              ) {
                throw new Error("Failed to load workflows.");
              }
            }

            const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];
            if (threadSearchResourceLatestRequestKeyRef.current[normalizedMode] === requestKey) {
              threadSearchResourceLoadKeysRef.current[normalizedMode] = requestKey;
              threadSearchResourceLoadedAtByModeRef.current[normalizedMode] = Date.now();
              setThreadSearchResourceDataByMode((current) => ({
                ...current,
                [normalizedMode]: {
                  scopeKey: threadSearchResourceScopeKey,
                  items: normalizedItems,
                },
              }));
            }
            return normalizedItems;
          } catch (error) {
            if (threadSearchResourceLatestRequestKeyRef.current[normalizedMode] === requestKey) {
              threadSearchResourceLoadKeysRef.current[normalizedMode] = requestKey;
              threadSearchResourceLoadedAtByModeRef.current[normalizedMode] = 0;
              setThreadSearchResourceErrorByMode((current) => ({
                ...current,
                [normalizedMode]: error instanceof Error
                  ? error.message
                  : "Failed to load search results.",
              }));
            }
            return [];
          } finally {
            threadSearchResourceLoadingRequestKeysRef.current.delete(requestKey);
            const hasPendingRequestForMode = Array.from(
              threadSearchResourceLoadingRequestKeysRef.current
            ).some((key) => key.startsWith(normalizedMode + "|"));
            setThreadSearchResourceLoadingByMode((current) => ({
              ...current,
              [normalizedMode]: hasPendingRequestForMode,
            }));
          }
        }, [
          authRequestHeaders,
          hasRealAccess,
          proxyBackendBase,
          refreshAgents,
          threadSearchResourceDataByMode,
          threadSearchResourceScopeKey,
        ]);

        useEffect(() => {
          if (
            !threadSearchOpen
            || isGlobalServiceSearchQuery
            || !["agents", "tickets", "workflows", "prompts"].includes(threadSearchMode)
          ) {
            return;
          }
          void loadThreadSearchResourceMode(threadSearchMode);
        }, [
          loadThreadSearchResourceMode,
          isGlobalServiceSearchQuery,
          threadSearchMode,
          threadSearchOpen,
        ]);

        const searchableThreadItems = useMemo(() => {
          const uniqueThreads = new Map();
          baseThreadItems
            .slice()
            .sort(compareThreadsByRecent)
            .forEach((thread) => {
              if (!thread?.id || uniqueThreads.has(thread.id)) {
                return;
              }
              uniqueThreads.set(thread.id, thread);
            });
          return Array.from(uniqueThreads.values());
        }, [baseThreadItems]);

        function resolveExactThreadSearchId(value) {
          const normalizedValue = String(value || "").trim();
          return /^thread_[A-Za-z0-9_-]+$/.test(normalizedValue)
            ? normalizedValue
            : "";
        }

        const exactThreadSearchId = resolveExactThreadSearchId(threadSearchQuery);
        const normalizedThreadSearchQuery = threadSearchQuery.trim().toLowerCase();
        useEffect(() => {
          const searchQuery = String(threadSearchQuery || "").trim();
          const exactThreadId = resolveExactThreadSearchId(searchQuery);
          const shouldSearchRemotely = Boolean(
            threadSearchOpen
            && threadSearchMode === "threads"
            && hasRealAccess
            && !isGlobalServiceSearchQuery
            && searchQuery
          );

          threadSearchThreadAbortControllerRef.current?.abort();
          threadSearchThreadAbortControllerRef.current = null;

          if (!shouldSearchRemotely) {
            threadSearchResourceLatestRequestKeyRef.current.threads = "";
            setThreadSearchResourceLoadingByMode((current) => (
              current.threads
                ? { ...current, threads: false }
                : current
            ));
            setThreadSearchResourceErrorByMode((current) => (
              current.threads
                ? { ...current, threads: "" }
                : current
            ));
            return;
          }

          const normalizedQuery = searchQuery.toLowerCase();
          const requestIdentity = exactThreadId
            ? "id:" + exactThreadId
            : "query:" + normalizedQuery;
          const requestKey = "threads|" + threadSearchResourceScopeKey + "|" + requestIdentity;
          const cachedResult = threadSearchThreadResultsCacheRef.current.get(requestKey);
          threadSearchResourceLatestRequestKeyRef.current.threads = requestKey;

          if (cachedResult && Date.now() - cachedResult.loadedAt < 30000) {
            setThreadSearchResourceDataByMode((current) => ({
              ...current,
              threads: cachedResult,
            }));
            setThreadSearchResourceLoadingByMode((current) => ({
              ...current,
              threads: false,
            }));
            setThreadSearchResourceErrorByMode((current) => ({
              ...current,
              threads: "",
            }));
            return;
          }

          const controller = new AbortController();
          threadSearchThreadAbortControllerRef.current = controller;
          setThreadSearchResourceDataByMode((current) => ({
            ...current,
            threads: {
              scopeKey: threadSearchResourceScopeKey,
              query: normalizedQuery,
              items: [],
              total: 0,
            },
          }));
          setThreadSearchResourceLoadingByMode((current) => ({
            ...current,
            threads: true,
          }));
          setThreadSearchResourceErrorByMode((current) => ({
            ...current,
            threads: "",
          }));

          const debounceTimer = window.setTimeout(async () => {
            try {
              const response = exactThreadId
                ? await fetch(
                    proxyBackendBase + "/threads/" + encodeURIComponent(exactThreadId),
                    {
                      method: "GET",
                      headers: authRequestHeaders,
                      credentials: "include",
                      cache: "no-store",
                      signal: controller.signal,
                    }
                  )
                : await fetch(proxyBackendBase + "/threads/search", {
                    method: "POST",
                    headers: {
                      ...authRequestHeaders,
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                    signal: controller.signal,
                    body: JSON.stringify({
                      query: searchQuery,
                      limit: THREAD_SEARCH_RESULT_LIMIT,
                      offset: 0,
                      includeMessages: false,
                    }),
                  });
              const data = await response.json().catch(() => ({}));
              if (!response.ok && !(exactThreadId && response.status === 404)) {
                throw new Error(data?.message || data?.error || "Failed to search threads.");
              }

              const directThreadRecord = exactThreadId && response.ok
                ? (
                    data?.thread
                    || data?.data?.thread
                    || data?.data
                    || data
                  )
                : null;
              const rawResults = exactThreadId
                ? (
                    directThreadRecord
                    && typeof directThreadRecord === "object"
                    && !Array.isArray(directThreadRecord)
                      ? [directThreadRecord]
                      : []
                  )
                : (Array.isArray(data?.results) ? data.results : []);
              const items = normalizeThreadList(
                rawResults.map((result) => result?.thread || result)
              ).filter((thread) => (
                !isPrivateThreadRecord(thread)
                && !privateThreadIdsRef.current.has(String(thread?.id || "").trim())
                && (!exactThreadId || String(thread?.id || "").trim() === exactThreadId)
              )).slice(0, THREAD_SEARCH_RESULT_LIMIT);
              const parsedTotal = Number(data?.total);
              const total = exactThreadId
                ? items.length
                : Number.isFinite(parsedTotal)
                  ? Math.max(items.length, parsedTotal)
                  : items.length;
              const nextResult = {
                scopeKey: threadSearchResourceScopeKey,
                query: normalizedQuery,
                items,
                total,
                loadedAt: Date.now(),
              };

              if (threadSearchResourceLatestRequestKeyRef.current.threads !== requestKey) {
                return;
              }

              threadSearchThreadResultsCacheRef.current.set(requestKey, nextResult);
              if (threadSearchThreadResultsCacheRef.current.size > 24) {
                const oldestKey = threadSearchThreadResultsCacheRef.current.keys().next().value;
                if (oldestKey) {
                  threadSearchThreadResultsCacheRef.current.delete(oldestKey);
                }
              }
              setThreadSearchResourceDataByMode((current) => ({
                ...current,
                threads: nextResult,
              }));
            } catch (error) {
              if (
                controller.signal.aborted
                || threadSearchResourceLatestRequestKeyRef.current.threads !== requestKey
              ) {
                return;
              }
              setThreadSearchResourceErrorByMode((current) => ({
                ...current,
                threads: error instanceof Error
                  ? error.message
                  : "Failed to search threads.",
              }));
            } finally {
              if (threadSearchResourceLatestRequestKeyRef.current.threads === requestKey) {
                setThreadSearchResourceLoadingByMode((current) => ({
                  ...current,
                  threads: false,
                }));
              }
              if (threadSearchThreadAbortControllerRef.current === controller) {
                threadSearchThreadAbortControllerRef.current = null;
              }
            }
          }, exactThreadId ? 0 : 180);

          return () => {
            window.clearTimeout(debounceTimer);
            controller.abort();
          };
        }, [
          authRequestHeaders,
          hasRealAccess,
          isGlobalServiceSearchQuery,
          proxyBackendBase,
          threadSearchMode,
          threadSearchOpen,
          threadSearchQuery,
          threadSearchResourceScopeKey,
        ]);

        const threadSearchFileEnvironmentItems = useMemo(() => {
          if (!hasRealAccess) {
            return [];
          }
          return realEnvironments
            .filter((environment) => String(environment?.id || "").trim())
            .slice(0, 24);
        }, [hasRealAccess, realEnvironments]);

        useEffect(() => {
          if (
            !threadSearchOpen
            || threadSearchMode !== "files"
            || !hasRealAccess
            || isGlobalServiceSearchQuery
            || !normalizedThreadSearchQuery
          ) {
            return;
          }
          threadSearchFileEnvironmentItems.forEach((environment) => {
            void loadThreadSearchFileInventory(environment.id);
          });
        }, [
          hasRealAccess,
          isGlobalServiceSearchQuery,
          loadThreadSearchFileInventory,
          normalizedThreadSearchQuery,
          threadSearchFileEnvironmentItems,
          threadSearchMode,
          threadSearchOpen,
        ]);

        const filteredThreadSearchFileItems = useMemo(() => {
          if (threadSearchMode !== "files" || !normalizedThreadSearchQuery) {
            return [];
          }
          const results = [];
          threadSearchFileEnvironmentItems.forEach((environment) => {
            const inventory = threadSearchFileInventoryByEnvironmentId[environment.id] || [];
            const rows = buildPlaygroundEnvironmentSearchRows(inventory, threadSearchQuery, { filesOnly: true });
            rows.slice(0, 12).forEach((row) => {
              if (!row?.entry || row.entry.isFolder) {
                return;
              }
              results.push({
                key: environment.id + ":" + normalizeHistoryPath(row.entry.path || ""),
                environmentId: environment.id,
                environmentName: environment.name || "Computer",
                entry: row.entry,
              });
            });
          });
          return results.slice(0, 24);
        }, [
          normalizedThreadSearchQuery,
          threadSearchFileEnvironmentItems,
          threadSearchFileInventoryByEnvironmentId,
          threadSearchMode,
          threadSearchQuery,
        ]);

        const isThreadSearchFileLoading = Boolean(
          threadSearchMode === "files" &&
          normalizedThreadSearchQuery &&
          threadSearchFileEnvironmentItems.some((environment) => (
            threadSearchFileInventoryLoadingByEnvironmentId[environment.id] ||
            !Array.isArray(threadSearchFileInventoryByEnvironmentId[environment.id])
          ))
        );

        const filteredThreadSearchItems = useMemo(() => {
          if (threadSearchMode !== "threads") {
            return [];
          }
          if (normalizedThreadSearchQuery) {
            const remoteState = threadSearchResourceDataByMode.threads;
            return (
              remoteState?.scopeKey === threadSearchResourceScopeKey
              && remoteState?.query === normalizedThreadSearchQuery
              && Array.isArray(remoteState.items)
            )
              ? remoteState.items
              : [];
          }
          return searchableThreadItems.filter((thread) => {
            return Boolean(thread?.id);
          });
        }, [
          normalizedThreadSearchQuery,
          searchableThreadItems,
          threadSearchMode,
          threadSearchResourceDataByMode.threads,
          threadSearchResourceScopeKey,
        ]);

        const groupedThreadSearchItems = useMemo(() => {
          const groupsByKey = new Map();

          filteredThreadSearchItems.forEach((thread) => {
            const bucket = getThreadSearchBucket(resolveThreadSortTimestamp(thread));
            if (!groupsByKey.has(bucket.key)) {
              groupsByKey.set(bucket.key, {
                key: bucket.key,
                label: bucket.label,
                items: [],
              });
            }
            groupsByKey.get(bucket.key).items.push(thread);
          });

          return ["today", "yesterday", "last-7-days", "last-30-days", "older"]
            .map((key) => groupsByKey.get(key))
            .filter(Boolean);
        }, [filteredThreadSearchItems]);

        const currentThreadSearchAgentItems = useMemo(() => {
          const state = threadSearchResourceDataByMode.agents;
          return state?.scopeKey === threadSearchResourceScopeKey && Array.isArray(state.items)
            ? state.items
            : [];
        }, [threadSearchResourceDataByMode.agents, threadSearchResourceScopeKey]);

        const currentThreadSearchTicketItems = useMemo(() => {
          const state = threadSearchResourceDataByMode.tickets;
          return state?.scopeKey === threadSearchResourceScopeKey && Array.isArray(state.items)
            ? state.items
            : [];
        }, [threadSearchResourceDataByMode.tickets, threadSearchResourceScopeKey]);

        const currentThreadSearchWorkflowItems = useMemo(() => {
          const state = threadSearchResourceDataByMode.workflows;
          return state?.scopeKey === threadSearchResourceScopeKey && Array.isArray(state.items)
            ? state.items
            : [];
        }, [threadSearchResourceDataByMode.workflows, threadSearchResourceScopeKey]);

        const currentThreadSearchPromptItems = useMemo(() => {
          const state = threadSearchResourceDataByMode.prompts;
          return state?.scopeKey === threadSearchResourceScopeKey && Array.isArray(state.items)
            ? state.items
            : [];
        }, [threadSearchResourceDataByMode.prompts, threadSearchResourceScopeKey]);

        const threadSearchProjectsById = useMemo(() => {
          return new Map((Array.isArray(realProjects) ? realProjects : [])
            .map((project) => [String(project?.id || "").trim(), project])
            .filter(([projectId]) => Boolean(projectId)));
        }, [realProjects]);

        const filteredThreadSearchAgentItems = useMemo(() => {
          if (threadSearchMode !== "agents") {
            return [];
          }
          return currentThreadSearchAgentItems
            .filter((agent) => (
              agent?.id
              && !isPlaygroundAgentCreatorAgent(agent)
              && !isPlaygroundMissionControlAgent(agent)
            ))
            .filter((agent) => {
              if (!normalizedThreadSearchQuery) return true;
              return [
                agent?.name,
                agent?.description,
                agent?.id,
                agent?.model,
              ].map((value) => String(value || "")).join(" ").toLowerCase()
                .includes(normalizedThreadSearchQuery);
            })
            .slice()
            .sort((left, right) => String(left?.name || "").localeCompare(
              String(right?.name || ""),
              undefined,
              { sensitivity: "base" }
            ));
        }, [
          currentThreadSearchAgentItems,
          normalizedThreadSearchQuery,
          threadSearchMode,
        ]);

        const filteredThreadSearchTicketItems = useMemo(() => {
          if (threadSearchMode !== "tickets") {
            return [];
          }
          return currentThreadSearchTicketItems
            .filter((task) => String(task?.id || "").trim() && String(task?.projectId || "").trim())
            .filter((task) => {
              if (!normalizedThreadSearchQuery) return true;
              const project = threadSearchProjectsById.get(String(task?.projectId || "").trim());
              return [
                task?.title,
                task?.description,
                task?.id,
                task?.ticketNumber,
                task?.status,
                task?.priority,
                project?.name,
              ].map((value) => String(value || "")).join(" ").toLowerCase()
                .includes(normalizedThreadSearchQuery);
            })
            .slice()
            .sort((left, right) => (
              (Date.parse(right?.updatedAt || right?.createdAt || 0) || 0)
              - (Date.parse(left?.updatedAt || left?.createdAt || 0) || 0)
            ));
        }, [
          currentThreadSearchTicketItems,
          normalizedThreadSearchQuery,
          threadSearchMode,
          threadSearchProjectsById,
        ]);

        const filteredThreadSearchWorkflowItems = useMemo(() => {
          if (threadSearchMode !== "workflows") {
            return [];
          }
          return currentThreadSearchWorkflowItems
            .filter((workflow) => {
              if (!workflow?.id) return false;
              if (!normalizedThreadSearchQuery) return true;
              return [
                workflow?.name,
                workflow?.description,
                workflow?.id,
                workflow?.status,
                workflow?.triggerSummary,
                workflow?.projectName,
                workflow?.project_name,
              ].map((value) => String(value || "")).join(" ").toLowerCase()
                .includes(normalizedThreadSearchQuery);
            })
            .slice()
            .sort((left, right) => {
              const timestampDelta = getMetronomeWorkflowSortTimestamp(right)
                - getMetronomeWorkflowSortTimestamp(left);
              return timestampDelta || String(left?.name || "").localeCompare(
                String(right?.name || ""),
                undefined,
                { sensitivity: "base" }
              );
            });
        }, [
          currentThreadSearchWorkflowItems,
          normalizedThreadSearchQuery,
          threadSearchMode,
        ]);

        const filteredThreadSearchPromptItems = useMemo(() => {
          if (threadSearchMode !== "prompts") {
            return [];
          }
          return currentThreadSearchPromptItems
            .filter((prompt) => {
              if (!prompt?.id) return false;
              if (!normalizedThreadSearchQuery) return true;
              return [
                prompt?.name,
                prompt?.description,
                prompt?.id,
                prompt?.creatorName,
                prompt?.ownerName,
              ].map((value) => String(value || "")).join(" ").toLowerCase()
                .includes(normalizedThreadSearchQuery);
            })
            .slice()
            .sort((left, right) => {
              const timestampDelta = (
                Date.parse(String(right?.updatedAt || right?.createdAt || "")) || 0
              ) - (
                Date.parse(String(left?.updatedAt || left?.createdAt || "")) || 0
              );
              return timestampDelta || String(left?.name || "").localeCompare(
                String(right?.name || ""),
                undefined,
                { sensitivity: "base" },
              );
            });
        }, [
          currentThreadSearchPromptItems,
          normalizedThreadSearchQuery,
          threadSearchMode,
        ]);

        const isThreadSearchSelectedModeLoading = isGlobalServiceSearchQuery
          ? false
          : threadSearchMode === "threads"
          ? (
              normalizedThreadSearchQuery
                ? Boolean(threadSearchResourceLoadingByMode.threads)
                : isThreadsLoading
            )
          : threadSearchMode === "files"
            ? isThreadSearchFileLoading
            : Boolean(threadSearchResourceLoadingByMode[threadSearchMode]);
        const threadSearchSelectedModeError = String(
          threadSearchResourceErrorByMode[threadSearchMode] || ""
        ).trim();
        const threadSearchTotalResultCount = threadSearchMode === "threads"
          ? (
              normalizedThreadSearchQuery
                && threadSearchResourceDataByMode.threads?.scopeKey === threadSearchResourceScopeKey
                && threadSearchResourceDataByMode.threads?.query === normalizedThreadSearchQuery
                ? Number(threadSearchResourceDataByMode.threads.total) || filteredThreadSearchItems.length
                : filteredThreadSearchItems.length
            )
          : threadSearchMode === "files"
            ? filteredThreadSearchFileItems.length
            : threadSearchMode === "tickets"
              ? filteredThreadSearchTicketItems.length
              : threadSearchMode === "agents"
                ? filteredThreadSearchAgentItems.length
                : threadSearchMode === "workflows"
                  ? filteredThreadSearchWorkflowItems.length
                  : filteredThreadSearchPromptItems.length;
`;
