export const METRONOME_APP_SIDEBAR_STATE_SCRIPT = `
        const displayedSidebarThreadEntries = useMemo(() => {
          const entries = [];
          const groupsByKey = new Map();
          const optimisticEntries = Object.values(
            optimisticMetronomeRunEntries && typeof optimisticMetronomeRunEntries === "object"
              ? optimisticMetronomeRunEntries
              : {}
          ).filter((entry) => entry && typeof entry === "object");
          const optimisticRunByThreadId = new Map();
          optimisticEntries.forEach((entry) => {
            const groupKey = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
            if (!groupKey) return;
            (Array.isArray(entry?.threads) ? entry.threads : []).forEach((thread) => {
              const threadId = String(thread?.id || "").trim();
              if (!threadId) return;
              optimisticRunByThreadId.set(threadId, {
                metronomeId: String(entry?.metronomeId || "").trim(),
                runId: String(entry?.runId || "").trim(),
                workflowName: String(entry?.workflowName || "Metronome").trim() || "Metronome",
                status: String(entry?.status || "").trim(),
              });
            });
          });
          displayedThreadItems.forEach((thread) => {
            const threadId = String(thread?.id || "").trim();
            const optimisticMeta = threadId ? optimisticRunByThreadId.get(threadId) || null : null;
            const meta = getThreadMetronomeMetadata(thread) || optimisticMeta;
            const groupKey = getSidebarMetronomeRunGroupKey(meta);
            if (!groupKey) {
              entries.push({
                kind: "thread",
                key: String(thread?.id || generateId("thread")),
                thread,
              });
              return;
            }
            let group = groupsByKey.get(groupKey);
            const cachedStatus = String(metronomeRunStatusByKey?.[groupKey] || "").trim();
            if (!group) {
              group = {
                kind: "metronome-run",
                key: groupKey,
                metronomeId: meta.metronomeId,
                runId: meta.runId,
                workflowName: meta.workflowName || "Metronome",
                status: cachedStatus || meta.status || "",
                threads: [],
                latestThread: thread,
              };
              groupsByKey.set(groupKey, group);
              entries.push(group);
            } else if (cachedStatus) {
              group.status = cachedStatus;
            }
            group.threads = mergeMetronomeRunEntryThreads(group.threads, [thread]);
            if (resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(group.latestThread)) {
              group.latestThread = thread;
            }
          });
          visibleThreadItems.forEach((thread) => {
            const meta = getThreadMetronomeMetadata(thread);
            const groupKey = getSidebarMetronomeRunGroupKey(meta);
            const group = groupKey ? groupsByKey.get(groupKey) : null;
            if (!group) {
              return;
            }
            group.threads = mergeMetronomeRunEntryThreads(group.threads, [thread]);
            if (resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(group.latestThread)) {
              group.latestThread = thread;
            }
          });
          optimisticEntries.forEach((entry) => {
            const groupKey = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
            if (!groupKey) return;
            const cachedStatus = String(metronomeRunStatusByKey?.[groupKey] || "").trim();
            const existing = groupsByKey.get(groupKey);
            if (existing) {
              existing.threads = mergeMetronomeRunEntryThreads(existing.threads, Array.isArray(entry?.threads) ? entry.threads : []);
              existing.latestThread = existing.threads.reduce((latest, thread) => (
                !latest || resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(latest) ? thread : latest
              ), existing.latestThread || entry?.latestThread || null);
              existing.status = cachedStatus || String(entry?.status || existing.status || "").trim();
              return;
            }
            entries.unshift({
              kind: "metronome-run",
              key: groupKey,
              metronomeId: String(entry?.metronomeId || "").trim(),
              runId: String(entry?.runId || "").trim(),
              workflowName: String(entry?.workflowName || "Metronome").trim() || "Metronome",
              status: cachedStatus || String(entry?.status || "running").trim() || "running",
              input: entry?.input || null,
              threads: mergeMetronomeRunEntryThreads(Array.isArray(entry?.threads) ? entry.threads : []),
              latestThread: entry?.latestThread || null,
            });
          });
          return entries;
        }, [displayedThreadItems, metronomeRunStatusByKey, optimisticMetronomeRunEntries, visibleThreadItems]);
        const selectedMetronomeRunEntry = useMemo(() => {
          const selectedKey = String(metronomeRunTraceSelection?.key || "").trim();
          if (!selectedKey) {
            return null;
          }
          return displayedSidebarThreadEntries.find((entry) => (
            entry?.kind === "metronome-run" && String(entry?.key || "").trim() === selectedKey
          )) || (metronomeRunTraceSelection && typeof metronomeRunTraceSelection === "object"
            ? {
                kind: "metronome-run",
                key: selectedKey,
                metronomeId: String(metronomeRunTraceSelection.workflowId || metronomeRunTraceSelection.metronomeId || "").trim(),
                runId: String(metronomeRunTraceSelection.runId || "").trim(),
                workflowName: String(metronomeRunTraceSelection.workflowName || "Metronome").trim() || "Metronome",
                status: String(metronomeRunStatusByKey?.[selectedKey] || metronomeRunTraceSelection.status || "").trim(),
                threads: Array.isArray(metronomeRunTraceSelection.threads) ? metronomeRunTraceSelection.threads : [],
                latestThread: metronomeRunTraceSelection.latestThread || null,
              }
            : null);
        }, [displayedSidebarThreadEntries, metronomeRunStatusByKey, metronomeRunTraceSelection]);
        const selectedMetronomeRunThreadIds = useMemo(() => {
          if (!selectedMetronomeRunEntry) {
            return [];
          }
          return mergeMetronomeRunEntryThreads(
            Array.isArray(selectedMetronomeRunEntry.threads) ? selectedMetronomeRunEntry.threads : [],
            selectedMetronomeRunEntry.latestThread ? [selectedMetronomeRunEntry.latestThread] : []
          )
            .map((thread) => String(thread?.id || "").trim())
            .filter((threadId) => threadId && isRealThreadId(threadId) && !isPrivateThreadId(threadId));
        }, [selectedMetronomeRunEntry]);
        const metronomeRunActionTarget = useMemo(() => {
          const targetKey = String(metronomeRunActionMenuState?.key || "").trim();
          if (!targetKey) {
            return null;
          }
          return displayedSidebarThreadEntries.find((entry) => (
            entry?.kind === "metronome-run" && String(entry?.key || "").trim() === targetKey
          )) || metronomeRunActionMenuState.entry || null;
        }, [displayedSidebarThreadEntries, metronomeRunActionMenuState]);
        const selectedMetronomeRunTaskListTargetId = useMemo(() => {
          return selectedMetronomeRunThreadIds.find((threadId) => threadTaskListAvailabilityById[threadId] === "available") || "";
        }, [selectedMetronomeRunThreadIds, threadTaskListAvailabilityById]);
        const activeThreadTaskListTargetId = String(
          selectedMetronomeRunEntry?.key
            ? selectedMetronomeRunTaskListTargetId
            : selectedThreadTaskListTargetId
        ).trim();
        const activeThreadTaskListState = threadTaskListState.threadId === activeThreadTaskListTargetId
          ? threadTaskListState
          : { threadId: activeThreadTaskListTargetId, status: "idle", error: "", todos: [], updatedAt: "" };
        const activeThreadTaskListTodos = Array.isArray(activeThreadTaskListState.todos)
          ? activeThreadTaskListState.todos
          : [];
        const activeThreadTaskListCompletedCount = activeThreadTaskListTodos.filter((todo) => todo?.completed).length;
        const activeThreadTaskListCountLabel = activeThreadTaskListTodos.length > 0
          ? activeThreadTaskListCompletedCount + "/" + activeThreadTaskListTodos.length + " completed"
          : activeThreadTaskListState.status === "loading"
            ? "Loading"
            : "No tasks";
        const shouldShowThreadTaskListButton = Boolean(
          activeThreadTaskListTargetId && threadTaskListAvailabilityById[activeThreadTaskListTargetId] === "available"
        );
        useEffect(() => {
          const candidateThreadIds = activePage === "thread"
            ? (selectedMetronomeRunEntry?.key ? selectedMetronomeRunThreadIds : [selectedThreadTaskListTargetId])
            : [];
          const missingThreadIds = Array.from(new Set(candidateThreadIds
            .map((threadId) => String(threadId || "").trim())
            .filter((threadId) => (
              threadId
              && hasRealAccess
              && isRealThreadId(threadId)
              && !isPrivateThreadId(threadId)
              && !threadTaskListAvailabilityById[threadId]
            ))));
          if (missingThreadIds.length === 0) {
            return undefined;
          }

          let cancelled = false;
          setThreadTaskListAvailabilityById((current) => {
            const next = { ...(current && typeof current === "object" ? current : {}) };
            missingThreadIds.forEach((threadId) => {
              if (!next[threadId]) {
                next[threadId] = "loading";
              }
            });
            return next;
          });

          missingThreadIds.forEach((threadId) => {
            fetch(proxyBackendBase + "/threads/" + encodeURIComponent(threadId) + "/logs?compact=1&includeConversation=0", {
              method: "GET",
              headers: requestHeaders,
            })
              .then((response) => response.json().catch(() => ({})).then((data) => ({ response, data })))
              .then(({ response, data }) => {
                if (cancelled) {
                  return;
                }
                const todos = response.ok ? extractLatestThreadTodoList(data) : [];
                setThreadTaskListAvailabilityById((current) => ({
                  ...(current && typeof current === "object" ? current : {}),
                  [threadId]: Array.isArray(todos) && todos.length > 0 ? "available" : "empty",
                }));
              })
              .catch(() => {
                if (cancelled) {
                  return;
                }
                setThreadTaskListAvailabilityById((current) => ({
                  ...(current && typeof current === "object" ? current : {}),
                  [threadId]: "empty",
                }));
              });
          });

          return () => {
            cancelled = true;
          };
        }, [
          activePage,
          hasRealAccess,
          proxyBackendBase,
          requestHeaders,
          selectedMetronomeRunEntry?.key,
          selectedMetronomeRunThreadIds,
          selectedThreadTaskListTargetId,
          threadTaskListAvailabilityById,
        ]);
        useEffect(() => {
          if (!metronomeRunActionMenuState) {
            return undefined;
          }

          const targetStillExists = displayedSidebarThreadEntries.some((entry) => (
            entry?.kind === "metronome-run" && String(entry?.key || "").trim() === String(metronomeRunActionMenuState.key || "").trim()
          ));
          if (!targetStillExists) {
            setMetronomeRunActionMenuState(null);
            return undefined;
          }

          function handleKeyDown(event) {
            if (event.key === "Escape") {
              event.preventDefault();
              setMetronomeRunActionMenuState(null);
            }
          }

          function handleViewportChange() {
            setMetronomeRunActionMenuState(null);
          }

          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("resize", handleViewportChange);
          window.addEventListener("scroll", handleViewportChange, true);
          return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
          };
        }, [displayedSidebarThreadEntries, metronomeRunActionMenuState]);
        useEffect(() => {
          if (!hasRealAccess || activePage !== "thread") {
            return undefined;
          }
          const candidates = displayedSidebarThreadEntries
            .filter((entry) => entry?.kind === "metronome-run")
            .map((entry) => {
              const key = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
              return {
                key,
                metronomeId: String(entry?.metronomeId || "").trim(),
                runId: String(entry?.runId || "").trim(),
                status: String(entry?.status || "").trim(),
              };
            })
            .filter((entry) => (
              entry.key
              && entry.metronomeId
              && entry.runId
              && (!entry.status || isActiveMetronomeRunStatus(entry.status))
            ));
          if (candidates.length === 0) {
            return undefined;
          }

          let cancelled = false;
          let refreshTimer = null;
          const requestController = new AbortController();
          const loadStatuses = async () => {
            let hasActiveRun = false;
            await Promise.all(candidates.map(async (entry) => {
              try {
                const { response, data } = await fetchJsonWithTimeout(
                  proxyBackendBase + "/metronomes/" + encodeURIComponent(entry.metronomeId) + "/runs/" + encodeURIComponent(entry.runId),
                  { method: "GET", headers: authRequestHeaders, signal: requestController.signal },
                  10000
                );
                if (cancelled || !response.ok) {
                  return;
                }
                const run = data?.data && typeof data.data === "object" ? data.data : data;
                const nextStatus = String(run?.status || "").trim();
                if (!nextStatus) {
                  return;
                }
                if (isActiveMetronomeRunStatus(nextStatus)) {
                  hasActiveRun = true;
                }
                setMetronomeRunStatusByKey((current) => (
                  String(current?.[entry.key] || "").trim() === nextStatus
                    ? current
                    : {
                        ...(current && typeof current === "object" ? current : {}),
                        [entry.key]: nextStatus,
                      }
                ));
                setOptimisticMetronomeRunEntries((current) => {
                  const existing = current && typeof current === "object" ? current[entry.key] : null;
                  if (!existing || String(existing.status || "").trim() === nextStatus) {
                    return current;
                  }
                  return {
                    ...current,
                    [entry.key]: {
                      ...existing,
                      status: nextStatus,
                    },
                  };
                });
                setRealThreads((current) => {
                  let didChange = false;
                  const nextThreads = current.map((thread) => {
                    const meta = getThreadMetronomeMetadata(thread);
                    const groupKey = getSidebarMetronomeRunGroupKey(meta);
                    const nextThreadStatus = mapMetronomeRunStatusToThreadDisplayStatus(nextStatus);
                    const shouldUpdateThreadStatus = Boolean(nextThreadStatus && String(thread?.status || "").trim() !== nextThreadStatus);
                    if (groupKey !== entry.key || (String(meta?.status || "").trim() === nextStatus && !shouldUpdateThreadStatus)) {
                      return thread;
                    }
                    const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
                      ? thread.metadata
                      : {};
                    const metronomeWorkflow = metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
                      ? metadata.metronomeWorkflow
                      : {};
                    didChange = true;
                    return {
                      ...thread,
                      ...(shouldUpdateThreadStatus ? { status: nextThreadStatus } : {}),
                      metadata: {
                        ...metadata,
                        metronomeWorkflow: {
                          ...metronomeWorkflow,
                          status: nextStatus,
                          runStatus: nextStatus,
                          startedAt: run?.startedAt || metronomeWorkflow.startedAt || null,
                          completedAt: run?.completedAt || metronomeWorkflow.completedAt || null,
                          updatedAt: run?.updatedAt || metronomeWorkflow.updatedAt || "",
                          error: run?.error || null,
                        },
                      },
                    };
                  });
                  return didChange ? nextThreads : current;
                });
              } catch {
              }
            }));
            if (!cancelled && hasActiveRun) {
              refreshTimer = window.setTimeout(() => {
                setMetronomeRunStatusRefreshTick((current) => current + 1);
              }, 15000);
            }
          };

          void loadStatuses();
          return () => {
            cancelled = true;
            requestController.abort();
            if (refreshTimer) {
              window.clearTimeout(refreshTimer);
            }
          };
        }, [activePage, authRequestHeaders, displayedSidebarThreadEntries, hasRealAccess, metronomeRunStatusRefreshTick, proxyBackendBase]);
`;
