  ${SETTINGS_MODAL_PAGE_SCRIPT}
  
  ${ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS.setup}${ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS.subscription}${ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS.identityAndBilling}${ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS.identityAccess}${ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS.members}${ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS.rolesAndView}
  ${TEAMS_PAGE_SCRIPT_FRAGMENTS.setup}${TEAMS_PAGE_SCRIPT_FRAGMENTS.overview}${TEAMS_PAGE_SCRIPT_FRAGMENTS.members}${TEAMS_PAGE_SCRIPT_FRAGMENTS.resourcesFoundation}${IMAGINE_APP_SCRIPT_FRAGMENTS.teamResourceNavigation}
  
  ${TEAMS_PAGE_SCRIPT_FRAGMENTS.resourcesView}${TEAMS_PAGE_SCRIPT_FRAGMENTS.rolesAndView}
          useEffect(() => {
            if (!hasRealAccess) {
              setRealEnvironments([]);
              return;
            }
            const delayMs = activePage === "resources" && resourcesView === "servers" && resourcesServerKind === "database"
              ? 5000
              : 0;
            const retryDelays = activePage === "files"
              ? [delayMs, 1500, 5000]
              : [delayMs];
            let cancelled = false;
            let timer = null;
            let attemptIndex = 0;
  
            const scheduleNextEnvironmentRefresh = () => {
              const nextDelay = retryDelays[attemptIndex];
              timer = window.setTimeout(async () => {
                await refreshEnvironments();
                if (cancelled) return;
                attemptIndex += 1;
                if (
                  activePage === "files"
                  && realEnvironmentsRef.current.length === 0
                  && attemptIndex < retryDelays.length
                ) {
                  scheduleNextEnvironmentRefresh();
                }
              }, nextDelay);
            };
  
            scheduleNextEnvironmentRefresh();
            return () => {
              cancelled = true;
              if (timer !== null) {
                window.clearTimeout(timer);
              }
            };
          }, [activePage, hasRealAccess, refreshEnvironments, resourcesServerKind, resourcesView]);
  
          useEffect(() => {
            if (!hasRealAccess) {
              setRealAgents([]);
              realAgentsRef.current = [];
              realAgentsScopeKeyRef.current = "";
              return;
            }
            const delayMs = activePage === "resources" && resourcesView === "servers" && resourcesServerKind === "database"
              ? 5000
              : 0;
            const shouldRecoverTicketAgents = (
              activePage === "tasks"
              || activePage === "calendar"
              || Boolean(threadTaskOpenRequest)
            );
            const retryDelays = shouldRecoverTicketAgents
              ? [delayMs, 1500, 5000]
              : [delayMs];
            let cancelled = false;
            let timer = null;
            let attemptIndex = 0;

            const scheduleNextAgentRefresh = () => {
              const nextDelay = retryDelays[attemptIndex];
              timer = window.setTimeout(async () => {
                const nextAgents = await refreshAgents();
                if (cancelled) return;
                attemptIndex += 1;
                if (
                  shouldRecoverTicketAgents
                  && nextAgents.length === 0
                  && attemptIndex < retryDelays.length
                ) {
                  scheduleNextAgentRefresh();
                }
              }, nextDelay);
            };

            scheduleNextAgentRefresh();
            return () => {
              cancelled = true;
              if (timer !== null) {
                window.clearTimeout(timer);
              }
            };
          }, [
            activePage,
            hasRealAccess,
            refreshAgents,
            resourcesServerKind,
            resourcesView,
            threadTaskOpenRequest,
          ]);
  
          useEffect(() => {
            if (!hasRealAccess) {
              setRealServers([]);
              return;
            }
            if (activePage === "resources" && resourcesView === "servers" && resourcesServerKind === "database") {
              return;
            }
            if (activePage !== "develop" && !(activePage === "resources" && String(resourcesServerKind || "").trim())) {
              return;
            }
            void refreshServers();
          }, [activePage, hasRealAccess, refreshServers, resourcesServerKind, resourcesView]);
  
          useEffect(() => {
            if (!hasRealAccess) {
              setRealProjects([]);
              return;
            }
            if (activePage === "tasks" || activePage === "calendar") {
              return;
            }
            const delayMs = activePage === "resources" && resourcesView === "servers" && resourcesServerKind === "database"
              ? 5000
              : 0;
            const timer = window.setTimeout(() => void refreshProjects(), delayMs);
            return () => window.clearTimeout(timer);
          }, [activePage, hasRealAccess, refreshProjects, resourcesServerKind, resourcesView]);
  
          useEffect(() => {
            if (!hasRealAccess) {
              return;
            }
            if (activePage !== "thread" && !showInitialThreadWelcome) {
              return;
            }
            void refreshThreads(20);
          }, [activePage, hasRealAccess, refreshThreads, showInitialThreadWelcome]);
  
          useEffect(() => {
            if (
              !hasRealAccess
              || typeof window === "undefined"
              || (activePage !== "thread" && !showInitialThreadWelcome)
            ) {
              return;
            }
  
            let isDisposed = false;
  
            const handleIncomingThreadRefresh = (payload) => {
              if (
                isDisposed
                || !payload
                || payload.type !== "threads:refresh"
                || String(payload.senderId || "").trim() === threadListSyncSenderIdRef.current
              ) {
                return;
              }
              void refreshThreads(20, String(payload.threadId || "").trim(), { silent: true });
            };
  
            let syncChannel = null;
            if (typeof BroadcastChannel !== "undefined") {
              syncChannel = new BroadcastChannel("playground-thread-list-sync");
              threadListSyncChannelRef.current = syncChannel;
              syncChannel.onmessage = (event) => {
                handleIncomingThreadRefresh(event?.data);
              };
            }
  
            const handleStorage = (event) => {
              if (event.key !== "__playground_threads_refresh__" || !event.newValue) {
                return;
              }
              try {
                handleIncomingThreadRefresh(JSON.parse(event.newValue));
              } catch {}
            };
  
            const triggerSilentRefresh = () => {
              void refreshThreads(20, "", { silent: true });
            };
  
            const handleWindowFocus = () => {
              triggerSilentRefresh();
            };
  
            const handleVisibilityChange = () => {
              if (document.visibilityState === "visible") {
                triggerSilentRefresh();
              }
            };
  
            window.addEventListener("storage", handleStorage);
            window.addEventListener("focus", handleWindowFocus);
            document.addEventListener("visibilitychange", handleVisibilityChange);
  
            const hasLiveThreadListActivity = () => (
              (realThreadsRef.current || []).some((thread) => {
                const normalizedStatus = String(thread?.status || "").trim().toLowerCase();
                return isActiveThreadDisplayStatus(normalizedStatus)
                  || isPendingPermissionThreadDisplayStatus(normalizedStatus)
                  || normalizedStatus.includes("progress")
                  || normalizedStatus.includes("work")
                  || normalizedStatus.includes("stream");
              })
            );
  
            let refreshTimer = 0;
            const scheduleNextThreadRefresh = () => {
              if (isDisposed) {
                return;
              }
              const isPageHidden = document.visibilityState === "hidden";
              const refreshDelayMs = isPageHidden
                ? 60000
                : hasLiveThreadListActivity()
                  ? 10000
                  : 60000;
              refreshTimer = window.setTimeout(() => {
                if (isDisposed) {
                  return;
                }
                if (document.visibilityState === "visible") {
                  triggerSilentRefresh();
                }
                scheduleNextThreadRefresh();
              }, refreshDelayMs);
            };
            scheduleNextThreadRefresh();
  
            return () => {
              isDisposed = true;
              if (refreshTimer) {
                window.clearTimeout(refreshTimer);
              }
              window.removeEventListener("storage", handleStorage);
              window.removeEventListener("focus", handleWindowFocus);
              document.removeEventListener("visibilitychange", handleVisibilityChange);
              if (threadListSyncChannelRef.current === syncChannel) {
                threadListSyncChannelRef.current = null;
              }
              if (syncChannel) {
                syncChannel.close();
              }
            };
          }, [activePage, hasRealAccess, refreshThreads, showInitialThreadWelcome]);
  
          useEffect(() => {
            if (!hasRealAccess || typeof window === "undefined") {
              return;
            }
  
            const deleteTrackedPrivateThreads = (keepalive = false) => {
              Array.from(privateThreadIdsRef.current).forEach((threadId) => {
                void deletePrivateThreadId(threadId, { keepalive });
              });
            };
  
            const handlePageLeave = () => {
              deleteTrackedPrivateThreads(true);
            };
  
            window.addEventListener("pagehide", handlePageLeave);
            window.addEventListener("beforeunload", handlePageLeave);
  
            return () => {
              window.removeEventListener("pagehide", handlePageLeave);
              window.removeEventListener("beforeunload", handlePageLeave);
              deleteTrackedPrivateThreads(false);
            };
          }, [deletePrivateThreadId, hasRealAccess]);
  
          useEffect(() => {
            if (activePage === "thread" || !isPrivateThreadId(currentThreadId)) {
              return;
            }
  
            const discardedThreadId = String(currentThreadId || "").trim();
            discardPrivateThread(discardedThreadId);
            setCurrentThreadId("");
          }, [activePage, currentThreadId, discardPrivateThread, privateThreadIds]);
  
          useEffect(() => {
            if (activePage !== "thread" || !hasRealAccess || !isRealThreadId(currentThreadId)) {
              return;
            }
  
            void loadThreadGroundTruthStatus(currentThreadId);
          }, [activePage, currentThreadId, hasRealAccess, loadThreadGroundTruthStatus]);
  
          useEffect(() => {
            const trackedRuns = Object.values(taskRunStates || {});
            if (!trackedRuns.length) {
              return;
            }
  
            trackedRuns.forEach((taskRunState) => {
              const normalizedThreadId = typeof taskRunState?.threadId === "string" ? taskRunState.threadId.trim() : "";
              const currentPhase = typeof taskRunState?.phase === "string" ? taskRunState.phase.trim().toLowerCase() : "";
              const normalizedRunKind = typeof taskRunState?.runKind === "string" ? taskRunState.runKind.trim().toLowerCase() : "";
              const syncedThreadKey = String(taskRunState?.taskId || "").trim() + ":" + normalizedThreadId;
  	            if (
                !normalizedThreadId
                || currentPhase === "finished"
                || currentPhase === "failed"
                || currentPhase === "cancelled"
                || taskCompletionSyncedThreadKeysRef.current.has(syncedThreadKey)
                || (currentPhase === "in_review" && normalizedRunKind !== "review")
              ) {
                return;
              }
  
              const matchingThread = realThreads.find((thread) => thread.id === normalizedThreadId) || null;
              const threadStatus = String(matchingThread?.status || "").trim().toLowerCase();
              if (!threadStatus) {
                return;
              }
  
              if (threadStatus === "running" && currentPhase === "starting") {
                applyTaskRunState({
                  taskId: taskRunState.taskId,
                  threadId: normalizedThreadId,
                  projectId: taskRunState.projectId || "",
                  ticketNumber: taskRunState.ticketNumber || "",
                  title: taskRunState.title || "Untitled Task",
                  phase: "running",
                });
                return;
              }
  
              if (threadStatus === "completed") {
                void syncCompletedTaskRun(taskRunState);
                return;
              }
  
              if (threadStatus === "failed" || threadStatus === "cancelled") {
                applyTaskRunState({
                  taskId: taskRunState.taskId,
                  threadId: normalizedThreadId,
                  projectId: taskRunState.projectId || "",
                  ticketNumber: taskRunState.ticketNumber || "",
                  title: taskRunState.title || "Untitled Task",
                  phase: threadStatus,
                });
              }
            });
          }, [applyTaskRunState, realThreads, syncCompletedTaskRun, taskRunStates]);
  
          useEffect(() => {
            threadDisplayCountRef.current = 10;
            threadFetchLimitRef.current = SEARCH_THREAD_FETCH_LIMIT;
            setThreadDisplayCount(10);
          }, [threadListMode]);
  
          useEffect(() => {
            if (activePage === "thread" && !currentThreadId && contentMode !== "chat") {
              setContentMode("chat");
            }
          }, [activePage, contentMode, currentThreadId]);
  
          useEffect(() => {
            if (!pendingThreadComposerPlusOpen) {
              return;
            }
            if (activePage !== "thread" || currentThreadId) {
              return;
            }
  
            let cancelled = false;
            let attemptCount = 0;
  
            function tryOpenComposerPlus() {
              if (cancelled) {
                return;
              }
              const plusButton = document.querySelector(".playground-thread-runner .task-attachment-button-full");
              if (plusButton instanceof HTMLButtonElement) {
                plusButton.click();
                plusButton.focus();
                setPendingThreadComposerPlusOpen(false);
                return;
              }
              attemptCount += 1;
              if (attemptCount < 20) {
                window.setTimeout(tryOpenComposerPlus, 80);
                return;
              }
              setPendingThreadComposerPlusOpen(false);
            }
  
            const startId = window.setTimeout(tryOpenComposerPlus, 120);
            return () => {
              cancelled = true;
              window.clearTimeout(startId);
            };
          }, [activePage, currentThreadId, pendingThreadComposerPlusOpen]);
  
          const demoThreadCatalog = useMemo(() => (
            normalizeThreadList([
              ...DEMO_PINNED_THREADS,
              ...DEMO_RECENT_THREADS,
              ...DEMO_SCHEDULED_THREADS,
            ])
          ), []);
  
          const evaluationThreadIds = useMemo(() => {
            const ids = new Set();
            (Array.isArray(evaluationSets) ? evaluationSets : []).forEach((set) => {
              const normalizedSet = normalizePlaygroundEvaluationSet(set);
              normalizedSet.runs.forEach((run) => {
                run.cases.forEach((caseItem) => {
                  const threadId = String(caseItem.threadId || "").trim();
                  const evaluatorThreadId = String(caseItem.evaluatorThreadId || "").trim();
                  if (threadId) ids.add(threadId);
                  if (evaluatorThreadId) ids.add(evaluatorThreadId);
                });
              });
            });
            return ids;
          }, [evaluationSets]);
  
          const baseThreadItems = useMemo(() => {
            if (hasDemoAccess) {
              if (!currentThreadId) {
                return [];
              }
              const matchedDemoThread = demoThreadCatalog.find((thread) => thread.id === currentThreadId) || null;
              return matchedDemoThread ? [matchedDemoThread] : [];
            }
  
            if (!hasRealAccess) {
              return [];
            }
  
            const threads = realThreads.filter((thread) => {
              const normalizedThreadId = String(thread?.id || "").trim();
              return !privateThreadIdsRef.current.has(normalizedThreadId)
                && !evaluationThreadIds.has(normalizedThreadId)
                && !isPrivateThreadRecord(thread)
                && !isAbsorbedMetronomeTriggerThread(thread)
                && !isEvaluationThreadRecord(thread);
            });
  
            if (!currentThreadId || threads.some((thread) => thread.id === currentThreadId)) {
              return threads;
            }
  
            if (!isRealThreadId(currentThreadId) || isPrivateThreadId(currentThreadId)) {
              return threads;
            }
  
            if (absorbedMetronomeTriggerThreadIdsRef.current?.[String(currentThreadId || "").trim()]) {
              return threads;
            }
  
            if (evaluationThreadIds.has(String(currentThreadId || "").trim())) {
              return threads;
            }
  
            const currentRealThread = realThreads.find((thread) => String(thread?.id || "").trim() === String(currentThreadId || "").trim()) || null;
            if (currentRealThread && isEvaluationThreadRecord(currentRealThread)) {
              return threads;
            }
  
            return [
              normalizeThreadItem({
                id: currentThreadId,
                title: "Current thread",
                messageCount: 0,
                createdAt: new Date().toISOString(),
              }),
              ...threads,
            ];
          }, [absorbedMetronomeTriggerThreadIds, currentThreadId, demoThreadCatalog, evaluationThreadIds, hasDemoAccess, hasRealAccess, privateThreadIds, realThreads]);
  
          const activeSidebarThreadId = useMemo(() => {
            return activePage === "thread" ? currentThreadId : "";
          }, [activePage, currentThreadId]);
  
          useEffect(() => {
            if (!threadActionMenuState) {
              return;
            }
  
  	          const fallbackThreadId = String(threadActionMenuState.threadRecord?.id || "").trim();
  	          const targetStillExists = baseThreadItems.some((thread) => thread.id === threadActionMenuState.threadId)
  	            || (fallbackThreadId && fallbackThreadId === threadActionMenuState.threadId);
            if (!targetStillExists) {
              setThreadActionMenuState(null);
              return;
            }
  
            function handleKeyDown(event) {
              if (event.key === "Escape") {
                event.preventDefault();
                setThreadActionMenuState(null);
              }
            }
  
            function handleViewportChange() {
              setThreadActionMenuState(null);
            }
  
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("resize", handleViewportChange);
            window.addEventListener("scroll", handleViewportChange, true);
            return () => {
              window.removeEventListener("keydown", handleKeyDown);
              window.removeEventListener("resize", handleViewportChange);
              window.removeEventListener("scroll", handleViewportChange, true);
            };
          }, [baseThreadItems, threadActionMenuState]);
  
          useEffect(() => {
            if (!threadNavMenuOpen) {
              return;
            }
  
            const hasThreadSideDetailOpen =
              activePage === "thread" &&
              hasRealAccess &&
              (Boolean(threadTaskOpenRequest) || Boolean(threadSubagentDetailOpen));
            const normalizedCurrentThreadId = String(currentThreadId || "").trim();
            const hasThreadTarget = Boolean(normalizedCurrentThreadId) && (
              baseThreadItems.some((thread) => thread.id === normalizedCurrentThreadId)
              || evaluationThreadIds.has(normalizedCurrentThreadId)
              || (isRealThreadId(normalizedCurrentThreadId) && !isPrivateThreadId(normalizedCurrentThreadId))
              || realThreads.some((thread) => {
                const normalizedThreadId = String(thread?.id || "").trim();
                return normalizedThreadId === normalizedCurrentThreadId && isEvaluationThreadRecord(thread);
              })
            );
  
            if (activePage !== "thread" || hasThreadSideDetailOpen || !hasThreadTarget) {
              setThreadNavMenuOpen(false);
              return;
            }
  
            function handleViewportChange() {
              setThreadNavMenuOpen(false);
            }

            window.addEventListener("resize", handleViewportChange);
            window.addEventListener("scroll", handleViewportChange, true);
            return () => {
              window.removeEventListener("resize", handleViewportChange);
              window.removeEventListener("scroll", handleViewportChange, true);
            };
          }, [activePage, baseThreadItems, currentThreadId, evaluationThreadIds, hasRealAccess, realThreads, threadNavMenuOpen, threadSubagentDetailOpen, threadTaskOpenRequest]);
  
          useEffect(() => {
            if (!threadTaskListMenuOpen) {
              return;
            }
  
            const hasThreadSideDetailOpen =
              activePage === "thread" &&
              hasRealAccess &&
              (Boolean(threadTaskOpenRequest) || Boolean(threadSubagentDetailOpen));
            const hasThreadTarget = (Boolean(currentThreadId) && baseThreadItems.some((thread) => thread.id === currentThreadId))
              || Boolean(metronomeRunTraceSelection?.key);
  
            if (activePage !== "thread" || hasThreadSideDetailOpen || !hasThreadTarget) {
              setThreadTaskListMenuOpen(false);
              return;
            }
  
            function handlePointerDown(event) {
              const target = event.target instanceof Node ? event.target : null;
              if (!target || !threadTaskListMenuRef.current || threadTaskListMenuRef.current.contains(target)) {
                return;
              }
              setThreadTaskListMenuOpen(false);
            }
  
            function handleKeyDown(event) {
              if (event.key === "Escape") {
                event.preventDefault();
                setThreadTaskListMenuOpen(false);
              }
            }
  
            function handleViewportChange() {
              setThreadTaskListMenuOpen(false);
            }
  
            document.addEventListener("mousedown", handlePointerDown);
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("resize", handleViewportChange);
            window.addEventListener("scroll", handleViewportChange, true);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
              window.removeEventListener("keydown", handleKeyDown);
              window.removeEventListener("resize", handleViewportChange);
              window.removeEventListener("scroll", handleViewportChange, true);
            };
          }, [activePage, baseThreadItems, currentThreadId, hasRealAccess, metronomeRunTraceSelection, threadTaskListMenuOpen, threadSubagentDetailOpen, threadTaskOpenRequest]);
  
          useEffect(() => {
            if (!settingsPlansMenuOpen) {
              return undefined;
            }
  
            function handleSettingsPlansMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !settingsPlansMenuRef.current || settingsPlansMenuRef.current.contains(target)) {
                return;
              }
              setSettingsPlansMenuOpen(false);
            }
  
            function handleSettingsPlansMenuEscape(event) {
              if (event.key === "Escape") {
                setSettingsPlansMenuOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSettingsPlansMenuPointerDown);
            window.addEventListener("keydown", handleSettingsPlansMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleSettingsPlansMenuPointerDown);
              window.removeEventListener("keydown", handleSettingsPlansMenuEscape);
            };
          }, [settingsPlansMenuOpen]);
  
          useEffect(() => {
            if (!settingsResourceCapInfoOpen) {
              return undefined;
            }
  
            function handleSettingsResourceCapInfoPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !settingsResourceCapInfoRef.current || settingsResourceCapInfoRef.current.contains(target)) {
                return;
              }
              setSettingsResourceCapInfoOpen(false);
            }
  
            function handleSettingsResourceCapInfoEscape(event) {
              if (event.key === "Escape") {
                setSettingsResourceCapInfoOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSettingsResourceCapInfoPointerDown);
            window.addEventListener("keydown", handleSettingsResourceCapInfoEscape);
            return () => {
              document.removeEventListener("mousedown", handleSettingsResourceCapInfoPointerDown);
              window.removeEventListener("keydown", handleSettingsResourceCapInfoEscape);
            };
          }, [settingsResourceCapInfoOpen]);
  
          useEffect(() => {
            const isBillingOverviewOpen = (
              activePage === "organization"
              && organizationPageActiveTab === "billing"
              && organizationPageBillingSection === "costs-plans"
            );
            if (!isBillingOverviewOpen) {
              setSettingsPlansMenuOpen(false);
              setSettingsChangePlanModalOpen(false);
              setSettingsTopUpModalOpen(false);
              setSettingsResourceCapInfoOpen(false);
            }
          }, [activePage, organizationPageActiveTab, organizationPageBillingSection, settingsSection]);
  
          useEffect(() => {
            return () => {
              if (settingsResourceCapAutosaveTimerRef.current) {
                window.clearTimeout(settingsResourceCapAutosaveTimerRef.current);
                settingsResourceCapAutosaveTimerRef.current = null;
              }
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.cleanup}          };
          }, []);
  
          useEffect(() => {
            if (!threadRenameState || !threadRenameInputRef.current) {
              return;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              threadRenameInputRef.current?.focus();
              threadRenameInputRef.current?.select();
            });
  
            function handleKeyDown(event) {
              if (event.key === "Escape" && threadMutationState.action !== "rename") {
                event.preventDefault();
                setThreadRenameState(null);
                setThreadRenameValue("");
                setThreadRenameError("");
              }
            }
  
            window.addEventListener("keydown", handleKeyDown);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, [threadMutationState.action, threadRenameState]);
  
          useEffect(() => {
            if (!threadRenameState) {
              return;
            }
  
  	          const fallbackThreadId = String(threadRenameState.threadRecord?.id || "").trim();
  	          const targetStillExists = baseThreadItems.some((thread) => thread.id === threadRenameState.threadId)
  	            || (fallbackThreadId && fallbackThreadId === threadRenameState.threadId);
            if (!targetStillExists) {
              setThreadRenameState(null);
              setThreadRenameValue("");
              setThreadRenameError("");
            }
          }, [baseThreadItems, threadRenameState]);
  
          useEffect(() => {
            if (!threadProjectPickerState) {
              return;
            }
  
            function handleKeyDown(event) {
              if (event.key === "Escape" && threadMutationState.action !== "project") {
                event.preventDefault();
                setThreadProjectPickerState(null);
                setThreadProjectPickerValue("");
                setThreadProjectPickerError("");
              }
            }
  
            window.addEventListener("keydown", handleKeyDown);
            return () => {
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, [threadMutationState.action, threadProjectPickerState]);
  
          useEffect(() => {
            if (!threadProjectPickerState) {
              return;
            }
  
  	          const fallbackThreadId = String(threadProjectPickerState.threadRecord?.id || "").trim();
  	          const targetStillExists = baseThreadItems.some((thread) => thread.id === threadProjectPickerState.threadId)
  	            || (fallbackThreadId && fallbackThreadId === threadProjectPickerState.threadId);
            if (!targetStillExists) {
              setThreadProjectPickerState(null);
              setThreadProjectPickerValue("");
              setThreadProjectPickerError("");
            }
          }, [baseThreadItems, threadProjectPickerState]);
  
          useEffect(() => {
            if (!threadProjectPickerState) {
              return;
            }
            if (threadProjectPickerProjects.length === 0) {
              return;
            }
            const currentValue = String(threadProjectPickerValue || "").trim();
            const hasCurrentMatch = currentValue && threadProjectPickerProjects.some((project) => project.id === currentValue);
            if (!hasCurrentMatch) {
              setThreadProjectPickerValue(threadProjectPickerProjects[0]?.id || "");
            }
          }, [threadProjectPickerProjects, threadProjectPickerState, threadProjectPickerValue]);
  
          const pinnedThreadItems = useMemo(() => {
            if (hasDemoAccess) {
              return [];
            }
  
            if (!hasRealAccess) {
              return [];
            }
            return baseThreadItems
              .filter((thread) => thread.isPinned)
              .sort((left, right) => {
                const pinnedTimestampDelta = getThreadPinnedSortTimestamp(right) - getThreadPinnedSortTimestamp(left);
                if (pinnedTimestampDelta !== 0) {
                  return pinnedTimestampDelta;
                }
                return compareThreadsByRecent(left, right);
              });
          }, [baseThreadItems, hasDemoAccess, hasRealAccess]);
  
          const scheduledThreadItems = useMemo(() => {
            if (hasDemoAccess) {
              return [];
            }
  
            if (hasRealAccess) {
              return realThreads.filter((thread) => {
                const normalizedThreadId = String(thread?.id || "").trim();
                return thread.isScheduled && !privateThreadIdsRef.current.has(normalizedThreadId) && !evaluationThreadIds.has(normalizedThreadId) && !isPrivateThreadRecord(thread) && !isEvaluationThreadRecord(thread);
              });
            }
            return [];
          }, [evaluationThreadIds, hasDemoAccess, hasRealAccess, privateThreadIds, realThreads]);
  
          const recentThreadItems = useMemo(() => {
            return baseThreadItems
              .filter((thread) => !thread.isPinned)
              .slice()
              .sort(compareThreadsByRecent);
          }, [baseThreadItems]);
  
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.searchProjection}
  
          const activeRunnerThreadId = useMemo(() => {
            return isRealThreadId(currentThreadId) ? currentThreadId : "";
          }, [currentThreadId]);
  
          const selectedKnownThread = useMemo(() => {
            if (!currentThreadId) {
              return null;
            }
            return [...pinnedThreadItems, ...baseThreadItems, ...scheduledThreadItems]
              .find((thread) => thread.id === currentThreadId) || null;
          }, [baseThreadItems, currentThreadId, pinnedThreadItems, scheduledThreadItems]);
          const activeEvaluationThreadContext = useMemo(() => {
            const normalizedThreadId = String(currentThreadId || "").trim();
            if (activePage !== "thread" || !normalizedThreadId) {
              return null;
            }
            const normalizedEvaluationSets = (Array.isArray(evaluationSets) ? evaluationSets : [])
              .map((set) => typeof normalizePlaygroundEvaluationSet === "function" ? normalizePlaygroundEvaluationSet(set) : set)
              .filter(Boolean);
            for (const evaluationSet of normalizedEvaluationSets) {
              const runs = Array.isArray(evaluationSet?.runs) ? evaluationSet.runs : [];
              for (const run of runs) {
                const cases = Array.isArray(run?.cases) ? run.cases : [];
                for (const caseItem of cases) {
                  const evaluationThreadId = String(caseItem?.threadId || "").trim();
                  const evaluatorThreadId = String(caseItem?.evaluatorThreadId || "").trim();
                  if (normalizedThreadId !== evaluationThreadId && normalizedThreadId !== evaluatorThreadId) {
                    continue;
                  }
                  return {
                    evaluationSetId: String(evaluationSet?.id || "").trim(),
                    evaluationName: String(evaluationSet?.name || "").trim() || "Evaluation",
                    runId: String(run?.id || "").trim(),
                    runLabel: String(run?.label || "").trim() || "Run",
                    passThreshold: Number.isFinite(Number(run?.passThreshold ?? evaluationSet?.passThreshold))
                      ? Math.max(0, Math.min(1, Number(run?.passThreshold ?? evaluationSet?.passThreshold)))
                      : 0.8,
                    caseId: String(caseItem?.id || "").trim(),
                    caseItem,
                    evaluationThreadId,
                    evaluatorThreadId,
                    threadKind: normalizedThreadId === evaluatorThreadId ? "Evaluator" : "Evaluation",
                  };
                }
              }
            }
            return null;
          }, [activePage, currentThreadId, evaluationSets]);
  
          function normalizePlaygroundEvaluatorKpiRatio(value) {
            if (value === null || value === undefined || value === "") {
              return null;
            }
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) {
                return null;
              }
              const percentMatch = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)\s*%$/);
              if (percentMatch) {
                const numericPercent = Number(percentMatch[1]);
                return Number.isFinite(numericPercent) ? Math.max(0, Math.min(1, numericPercent / 100)) : null;
              }
            }
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) {
              return null;
            }
            return Math.max(0, Math.min(1, numeric > 1 ? numeric / 100 : numeric));
          }
  
          function readPlaygroundEvaluatorKpiRatio(source, keys) {
            if (!source || typeof source !== "object" || Array.isArray(source)) {
              return null;
            }
            for (const key of keys) {
              if (Object.prototype.hasOwnProperty.call(source, key)) {
                const ratio = normalizePlaygroundEvaluatorKpiRatio(source[key]);
                if (ratio !== null) {
                  return ratio;
                }
              }
            }
            return null;
          }
  
          function readPlaygroundEvaluatorKpiBoolean(source, keys) {
            if (!source || typeof source !== "object" || Array.isArray(source)) {
              return null;
            }
            for (const key of keys) {
              if (!Object.prototype.hasOwnProperty.call(source, key)) {
                continue;
              }
              const rawValue = source[key];
              if (typeof rawValue === "boolean") {
                return rawValue;
              }
              const normalized = String(rawValue || "").trim().toLowerCase();
              if (["true", "passed", "pass", "yes", "1"].includes(normalized)) {
                return true;
              }
              if (["false", "failed", "fail", "no", "0"].includes(normalized)) {
                return false;
              }
            }
            return null;
          }
  
          function formatPlaygroundEvaluatorKpiPercent(value, fallback = "—") {
            const ratio = normalizePlaygroundEvaluatorKpiRatio(value);
            return ratio === null ? fallback : Math.round(ratio * 100) + "%";
          }
  
          function buildPlaygroundEvaluatorResultKpis(jsonValue, context) {
            const source = jsonValue && typeof jsonValue === "object" && !Array.isArray(jsonValue) ? jsonValue : {};
            const nestedResult = source.result && typeof source.result === "object" && !Array.isArray(source.result) ? source.result : {};
            const caseItem = context?.caseItem && typeof context.caseItem === "object" ? context.caseItem : {};
            const passThreshold = normalizePlaygroundEvaluatorKpiRatio(context?.passThreshold) ?? 0.8;
            const score = readPlaygroundEvaluatorKpiRatio(source, ["score", "grade", "rating"])
              ?? readPlaygroundEvaluatorKpiRatio(nestedResult, ["score", "grade", "rating"])
              ?? normalizePlaygroundEvaluatorKpiRatio(caseItem.score);
            const confidence = readPlaygroundEvaluatorKpiRatio(source, ["confidence", "confidenceScore", "confidence_score"])
              ?? readPlaygroundEvaluatorKpiRatio(nestedResult, ["confidence", "confidenceScore", "confidence_score"]);
            const explicitPassed = readPlaygroundEvaluatorKpiBoolean(source, ["passed", "pass", "success", "result"])
              ?? readPlaygroundEvaluatorKpiBoolean(nestedResult, ["passed", "pass", "success", "result"]);
            const passed = explicitPassed === null
              ? (score === null ? false : score >= passThreshold)
              : explicitPassed;
            return { score, confidence, passed };
          }
  
          function renderEvaluatorThreadUserPromptContent() {
            if (!activeEvaluationThreadContext || activeEvaluationThreadContext.threadKind !== "Evaluator") {
              return undefined;
            }
            const evaluationThreadId = String(activeEvaluationThreadContext.evaluationThreadId || "").trim();
            const runLabel = String(activeEvaluationThreadContext.runLabel || "").trim() || "Run";
            const evaluationName = String(activeEvaluationThreadContext.evaluationName || "").trim() || "Evaluation";
            return React.createElement("span", { className: "playground-evaluator-thread-prompt" },
              "Evaluate ",
              evaluationThreadId
                ? React.createElement("button", {
                    type: "button",
                    className: "playground-evaluator-thread-link",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleThreadSelect(evaluationThreadId);
                    },
                    title: "Open evaluation thread " + evaluationThreadId,
                  }, evaluationThreadId)
                : React.createElement("span", { className: "playground-evaluator-thread-muted" }, "evaluation thread"),
              React.createElement("span", { className: "playground-evaluator-thread-muted" }, " on " + runLabel + " for " + evaluationName)
            );
          }
  
          function renderEvaluatorRunSummaryJsonSegment({ value }) {
            if (!activeEvaluationThreadContext || activeEvaluationThreadContext.threadKind !== "Evaluator") {
              return undefined;
            }
            const result = buildPlaygroundEvaluatorResultKpis(value, activeEvaluationThreadContext);
            const statusLabel = result.passed ? "Passed" : "Did not pass";
            const StatusIcon = result.passed ? CircleCheckBig : AlertCircle;
            const kpis = [
              { label: "Score", value: formatPlaygroundEvaluatorKpiPercent(result.score) },
              { label: "Confidence", value: formatPlaygroundEvaluatorKpiPercent(result.confidence) },
              {
                label: "Result",
                value: statusLabel,
                icon: React.createElement(StatusIcon, {
                  className: "playground-evaluator-summary-kpi-status-icon " + (result.passed ? "is-passed" : "is-failed"),
                  strokeWidth: 1.9,
                }),
              },
            ];
            return React.createElement("div", { className: "tb-run-summary-json-document playground-evaluator-summary-kpi-card" },
              React.createElement("div", { className: "tb-run-summary-json-header" },
                React.createElement("div", { className: "tb-run-summary-json-title" },
                  React.createElement(ChartColumnIncreasing, { className: "tb-run-summary-json-title-icon", strokeWidth: 1.9 }),
                  React.createElement("span", null, "Evaluation Result")
                )
              ),
              React.createElement("div", { className: "playground-evaluator-summary-kpi-grid" },
                kpis.map((item) => React.createElement("div", { key: item.label, className: "playground-evaluator-summary-kpi" },
                  React.createElement("div", { className: "playground-evaluator-summary-kpi-label" }, item.label),
                  React.createElement("div", { className: "playground-evaluator-summary-kpi-value" },
                    item.icon || null,
                    React.createElement("span", null, item.value)
                  )
                ))
              )
            );
          }
          const selectedThreadTaskListTargetId = String(selectedKnownThread?.id || currentThreadId || "").trim();
  
          const openCurrentThreadTaskListMenu = useCallback(() => {
            const normalizedThreadId = String(selectedKnownThread?.id || currentThreadId || "").trim();
            if (!normalizedThreadId) {
              return;
            }
            setThreadActionMenuState(null);
            setThreadNavMenuOpen(false);
            setThreadTaskListMenuOpen(true);
            void loadThreadTaskListForThread(normalizedThreadId, { force: true });
          }, [currentThreadId, loadThreadTaskListForThread, selectedKnownThread?.id]);
  
          useEffect(() => {
            function handleOpenThreadTaskList() {
              openCurrentThreadTaskListMenu();
            }
  
            window.addEventListener("playground:open-thread-task-list", handleOpenThreadTaskList);
            return () => {
              window.removeEventListener("playground:open-thread-task-list", handleOpenThreadTaskList);
            };
          }, [openCurrentThreadTaskListMenu]);
  
          useEffect(() => {
            const normalizedThreadId = String(currentThreadId || "").trim();
            const isMetronomeOverviewThread = Boolean(metronomeRunTraceSelection?.key);
            if (activePage !== "thread" || !hasRealAccess || (!isMetronomeOverviewThread && (!isRealThreadId(normalizedThreadId) || isPrivateThreadId(normalizedThreadId)))) {
              setThreadTaskListState((current) => (
                current.threadId
                  ? { threadId: "", status: "idle", error: "", todos: [], updatedAt: "" }
                  : current
              ));
              return undefined;
            }
            if (!threadTaskListMenuOpen) {
              return undefined;
            }
            if (isMetronomeOverviewThread) {
              return undefined;
            }
  
            let cancelled = false;
            const loadTaskList = async () => {
              if (cancelled) {
                return;
              }
              await loadThreadTaskListForThread(normalizedThreadId, { force: true });
            };
  
            void loadTaskList();
  
            return () => {
              cancelled = true;
            };
          }, [
            activePage,
            currentThreadId,
            hasRealAccess,
            loadThreadTaskListForThread,
            metronomeRunTraceSelection,
            threadTaskListMenuOpen,
          ]);
  
          const activeResourcesView = activePage === "agents"
            ? "agents"
            : activePage === "environments"
              ? "computers"
              : resourcesView;
          const activeResourcesServerKind = activeResourcesView === "servers" ? resourcesServerKind : "";
          const isResourcesPage = activePage === "resources" || activePage === "agents" || activePage === "environments";
          const isAgentDetailsShellActive = Boolean(
            isResourcesPage
            && activeResourcesView === "agents"
            && resourcesHeaderState.mode === "detail"
          );
          const wasAgentDetailsShellActiveRef = useRef(false);
          useLayoutEffect(() => {
            const enteredAgentDetails = isAgentDetailsShellActive && !wasAgentDetailsShellActiveRef.current;
            wasAgentDetailsShellActiveRef.current = isAgentDetailsShellActive;
            if (enteredAgentDetails) {
              setSidebarOpen(false);
            }
          }, [isAgentDetailsShellActive]);
          const isSourceDeployableCodeContentRoute = Boolean(
            isResourcesPage
            && activeResourcesView === "servers"
            && ["function", "web_app"].includes(activeResourcesServerKind)
            && resourcesHeaderState.mode === "detail"
            && resourcesHeaderState.resourceType === "server"
            && resourcesHeaderState.activeSection === "code"
          );
          const hasGuardrailsVersionsDrawerSlot = activePage === "guardrails";
          const hasEvaluationsVersionsDrawerSlot = activePage === "evaluations";
          const hasSecurityVersionsDrawerSlot = activePage === "develop-security";
          const hasSkillsVersionsDrawerSlot = activePage === "tools" && toolsView === "skills";
          const hasPromptsVersionsDrawerSlot = activePage === "tools" && toolsView === "prompts";
          const hasTestsVersionsDrawerSlot = activePage === "tests";
          const hasResourcesVersionsDrawerSlot = (
            isResourcesPage
            && (activeResourcesView === "agents" || activeResourcesView === "computers" || activeResourcesView === "servers")
          ) || hasGuardrailsVersionsDrawerSlot || hasEvaluationsVersionsDrawerSlot
            || hasSecurityVersionsDrawerSlot || hasSkillsVersionsDrawerSlot
            || hasPromptsVersionsDrawerSlot
            || hasTestsVersionsDrawerSlot;
          const selectedGlobalGuardrailSet = allGuardrailSets.find((set) => set?.id === selectedGuardrailSetId) || null;
          const isGuardrailsVersionsDrawerOpen = Boolean(
            hasGuardrailsVersionsDrawerSlot
            && guardrailsPageMode === "detail"
            && selectedGlobalGuardrailSet
            && !isPlaygroundDefaultGuardrailSet(selectedGlobalGuardrailSet)
            && guardrailVersionsSidebarOpen
          );
          const isResourcesVersionsDrawerOpen = (
            isResourcesPage
            && hasResourcesVersionsDrawerSlot
            && isAgentVersionsDetailOpen
          ) || (
            hasSkillsVersionsDrawerSlot
            && isAgentVersionsDetailOpen
          ) || (
            hasPromptsVersionsDrawerSlot
            && isAgentVersionsDetailOpen
          ) || isGuardrailsVersionsDrawerOpen || (
            hasEvaluationsVersionsDrawerSlot
            && isAgentVersionsDetailOpen
          ) || (
            hasSecurityVersionsDrawerSlot
            && isAgentVersionsDetailOpen
          ) || (
            hasTestsVersionsDrawerSlot
            && isAgentVersionsDetailOpen
          );
  
          useEffect(() => {
            if (!isResourcesVersionsDrawerOpen) {
              return;
            }
            setNotificationsOpen(false);
            if (accountMenuPlacement === "top-nav") {
              setAccountMenuOpen(false);
            }
          }, [accountMenuPlacement, isResourcesVersionsDrawerOpen]);
  
          const platformNavigationHistoryRef = useRef([]);
          const platformNavigationInitializedRef = useRef(false);
          const platformNavigationLastKeyRef = useRef("");
          const platformNavigationRestoreRef = useRef(null);
  
          const currentPlatformNavigationEntry = useMemo(() => {
            if (activePage === "thread") {
              return {
                page: "thread",
                threadId: currentThreadId,
                contentMode: contentMode === "changes" ? "changes" : "chat",
              };
            }
  
            if (activePage === "tasks" || activePage === "calendar") {
              const requestedView = activePage === "calendar"
                ? "calendar"
                : tasksHeaderState.view === "board"
                  ? "board"
                  : tasksHeaderState.view === "backlog"
                    ? "backlog"
                    : "overview";
              return {
                page: activePage,
                mode: tasksHeaderState.mode === "project"
                  ? "project"
                  : activePage === "calendar"
                    ? "calendar"
                    : "overview",
                view: requestedView,
                projectId: tasksHeaderState.projectId,
                detailMode: tasksHeaderState.detailMode,
                taskId: tasksHeaderState.taskId,
                scheduleId: tasksHeaderState.scheduleId,
              };
            }
  
            if (activePage === "metronome") {
              const metronomeEditorOpen = metronomeTopNavState?.mode === "editor";
              return {
                page: "metronome",
                mode: metronomeEditorOpen ? "detail" : "overview",
                projectId: metronomeProjectFilterId,
                workflowId: metronomeEditorOpen ? metronomeTopNavState?.workflowId : "",
                editorMode: metronomeEditorOpen ? metronomeTopNavState?.editorMode : "",
              };
            }
  
            if (isResourcesPage) {
              return {
                page: "resources",
                mode: resourcesHeaderState.mode === "detail" ? "detail" : "overview",
                resourceView: activeResourcesView,
                resourceType: resourcesHeaderState.resourceType,
                resourceId: resourcesHeaderState.resourceId,
                serverKind: activeResourcesServerKind,
              };
            }
  
            if (activePage === "tools" || activePage === "plugins" || activePage === "skills") {
              return {
                page: "tools",
                mode: ((toolsView === "plugins" || toolsView === "tags") && selectedPluginId)
                  || (toolsView === "skills" && toolsSkillsHeaderState.mode === "detail")
                  || (toolsView === "prompts" && toolsPromptsHeaderState.mode === "detail")
                  ? "detail"
                  : "overview",
                toolsView,
                pluginId: toolsView === "plugins" || toolsView === "tags" ? selectedPluginId : "",
                skillId: toolsView === "skills" ? toolsSkillsHeaderState.skillId : "",
                promptId: toolsView === "prompts" ? toolsPromptsHeaderState.promptId : "",
              };
            }
  
            if (activePage === "files") {
              return {
                page: "files",
                environmentId: filesPageTopNav?.environmentId || environmentId,
                path: filesPageTopNav?.path || "",
                contentMode: filesPageTopNav?.contentMode === "changes"
                  ? "changes"
                  : filesPageTopNav?.contentMode === "connectors"
                    ? "connectors"
                    : "files",
              };
            }
  
  ${TEAMS_APP_SCRIPT_FRAGMENTS.historyCapture}
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.historyCapture}
            if (activePage === "imagine") {
              return {
                page: "imagine",
                imagineView: imagineActiveView,
                mediaMode: imagineMediaMode,
                filterMode: imagineFilterMode,
                sortMode: imagineSortMode,
              };
            }
  
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyCapture}${MODELS_APP_SCRIPT_FRAGMENTS.historyCapture}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.historyCapture}${TESTS_APP_SCRIPT_FRAGMENTS.historyCapture}${ASSURANCE_APP_SCRIPT_FRAGMENTS.historyCapture}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyCapture}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyCapture}${MARKETPLACE_APP_SCRIPT_FRAGMENTS.historyCapture}${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyCapture}
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture}
            return {
              page: activePage || "thread",
            };
          }, [
            activePage,
            activeResourcesServerKind,
            activeResourcesView,
            assurancePageMode,
            contentMode,
            configureHomeTab,
            currentThreadId,
            environmentId,
            evaluationsPageMode,
            fineTuningPageMode,
            testsPageMode,
            filesPageTopNav?.contentMode,
            filesPageTopNav?.environmentId,
            filesPageTopNav?.path,
            guardrailsPageMode,
            imagineActiveView,
            imagineFilterMode,
            imagineMediaMode,
            imagineSortMode,
            isResourcesPage,
            metronomeProjectFilterId,
            metronomeTopNavState?.editorMode,
            metronomeTopNavState?.mode,
            metronomeTopNavState?.workflowId,
  	          modelsPageTab,
  	          organizationPageActiveTab,
  	          organizationPageBillingSection,
            organizationPageSelectedOrganizationId,
            resourcesHeaderState.mode,
            resourcesHeaderState.resourceId,
            resourcesHeaderState.resourceType,
            resourceTemplateSelectedId,
            resourceTemplateTypeFilter,
            selectedAssurancePolicyId,
            selectedAssurancePolicyName,
            selectedAssuranceRunId,
            selectedAssuranceRunName,
            selectedPluginId,
            selectedGuardrailSetId,
            selectedEvaluationRunId,
            selectedEvaluationCaseId,
            selectedEvaluationSetId,
            selectedFineTuningJobId,
            selectedTestPlanId,
            selectedTestPlanName,
            selectedTestCaseId,
            selectedTestCaseName,
            selectedTestRunId,
            selectedTestRunName,
            settingsSelectedTriggerId,
            settingsSection,
            tasksHeaderState.detailMode,
            tasksHeaderState.mode,
            tasksHeaderState.projectId,
            tasksHeaderState.scheduleId,
            tasksHeaderState.taskId,
            tasksHeaderState.view,
            teamPageActiveTab,
            teamPageSelectedRoleId,
            teamPageSelectedTeamId,
            toolsSkillsHeaderState.mode,
            toolsSkillsHeaderState.skillId,
            toolsPromptsHeaderState.mode,
            toolsPromptsHeaderState.promptId,
            toolsView,
          ]);
  
          const applyPlatformNavigationEntry = useCallback((rawEntry) => {
            const entry = normalizePlaygroundPlatformNavigationEntry(rawEntry);
            if (!entry) return;
            const entryKey = getPlaygroundPlatformNavigationEntryKey(entry);
            platformNavigationRestoreRef.current = {
              key: entryKey,
              startedAt: Date.now(),
            };
  
            setAccountMenuOpen(false);
            setNotificationsOpen(false);
            setProfileEditorOpen(false);
            setThreadSearchOpen(false);
            setThreadActionMenuState(null);
	            setThreadNavMenuOpen(false);
	            setThreadTaskListMenuOpen(false);
	            setMetronomeTopNavMenuOpen(false);
	            setMetronomeTopNavPublishMenuOpen(false);
	            setImagineToolbarPopover("");
            setPluginsNavPopover("");
  
            if (entry.page === "thread") {
              setSidebarWorkspaceMode("work");
              setActivePage("thread");
              setCurrentThreadId(entry.threadId || "");
              setContentMode(entry.contentMode === "changes" ? "changes" : "chat");
              setThreadListMode("threads");
              setChangesNavigationTarget(null);
              setThreadTaskOpenRequest(null);
              setThreadSubagentDetailOpen(false);
              setThreadDeepResearchDetailOpen(false);
              setThreadDocumentPreviewOpen(false);
              setRunnerRenderKey((current) => current + 1);
              return;
            }
  
            if (entry.page === "tasks" || entry.page === "calendar") {
              const requestedView = entry.page === "calendar"
                ? "calendar"
                : entry.view === "board"
                  ? "board"
                  : entry.view === "overview"
                    ? "overview"
                    : "backlog";
              setSidebarWorkspaceMode("work");
              setTasksPageNavigationRequest({
                token: createPlaygroundPlatformNavigationToken(),
                projectId: entry.projectId || "",
                view: requestedView,
                taskId: entry.taskId || "",
                taskDetailMode: entry.detailMode === "task" ? "screen" : "",
                missionControlAction: entry.detailMode === "mission-control" ? "open" : "",
                projectComposerAction: "",
              });
              setActivePage(entry.page === "calendar" ? "calendar" : "tasks");
              return;
            }
  
            if (entry.page === "metronome") {
              openMetronomePage({
                projectId: entry.projectId || "",
                workflowId: entry.workflowId || "",
              });
              if (!entry.workflowId) {
                window.setTimeout(() => {
                  const goOverview = metronomeTopNavActionsRef.current?.goOverview;
                  if (typeof goOverview === "function") {
                    goOverview();
                  }
                }, 0);
              }
              if (entry.workflowId && entry.editorMode) {
                [0, 100, 300].forEach((delay) => {
                  window.setTimeout(() => {
                    const setMode = metronomeTopNavActionsRef.current?.setMode;
                    if (typeof setMode === "function") {
                      setMode(
                        entry.editorMode === "runs" || entry.editorMode === "settings"
                          ? "settings"
                          : entry.editorMode === "code"
                            ? "code"
                            : "edit"
                      );
                    }
                  }, delay);
                });
              }
              return;
            }
  
            if (entry.page === "resources") {
              const resourceView = entry.resourceView === "servers"
                ? "servers"
                : entry.resourceView === "computers"
                  ? "computers"
                  : "agents";
              openResourcesView(resourceView, { serverKind: entry.serverKind || "" });
              if (entry.mode !== "detail" || !entry.resourceId) {
                setResourcesBackRequestToken((current) => current + 1);
              }
              if (resourceView === "agents") {
                if (entry.resourceId === PLAYGROUND_AGENT_DRAFT_ID) {
                  setAgentCreationPageModelId("");
                  setAgentCreationPageRequestToken((current) => current + 1);
                } else if (entry.resourceId) {
                  setAgentPageSelectionRequest({
                    agentId: entry.resourceId,
                    token: createPlaygroundPlatformNavigationToken(),
                  });
                }
              } else if (resourceView === "computers" && entry.resourceId) {
                setEnvironmentsNavigationTargetId(entry.resourceId);
                setEnvironmentsOpenToken((current) => current + 1);
              } else if (resourceView === "servers" && entry.resourceId) {
                setResourcesNavigationTarget({
                  token: Date.now(),
                  resourceType: entry.resourceType === "database" ? "database" : "server",
                  resourceId: entry.resourceId,
                });
              }
              return;
            }
  
            if (entry.page === "tools") {
              const nextToolsView = entry.toolsView === "actions"
                ? "actions"
                : entry.toolsView === "skills"
                  ? "skills"
                  : entry.toolsView === "prompts"
                    ? "prompts"
                  : entry.toolsView === "tags"
                    ? "tags"
                  : "plugins";
              openToolsView(
                nextToolsView,
                nextToolsView === "skills" && entry.skillId
                  ? { skillId: entry.skillId }
                  : nextToolsView === "prompts" && entry.promptId
                    ? { promptId: entry.promptId }
                    : {},
              );
              if (nextToolsView === "plugins" || nextToolsView === "tags") {
                setSelectedPluginId(entry.pluginId || "");
              } else if (nextToolsView === "skills" && !entry.skillId) {
                setToolsSkillsBackRequestToken((current) => current + 1);
              } else if (nextToolsView === "prompts" && !entry.promptId) {
                setToolsPromptsBackRequestToken((current) => current + 1);
              }
              return;
            }
  
            if (entry.page === "files") {
              setSidebarWorkspaceMode("work");
              if (entry.environmentId || entry.path) {
                setFilesPageNavigationRequest({
                  token: createPlaygroundPlatformNavigationToken(),
                  environmentId: entry.environmentId || "",
                  path: entry.path || "",
                  isFolder: entry.isFolder !== "false",
                  contentMode: entry.contentMode === "changes"
                    ? "changes"
                    : entry.contentMode === "connectors"
                      ? "connectors"
                      : "files",
                });
              }
              setActivePage("files");
              return;
            }
  
            if (entry.page === "settings") {
              setSidebarWorkspaceMode("configure");
              setActivePage("configure");
              openSettingsModal(entry.sectionId || "profile");
              return;
            }
  
  ${TEAMS_APP_SCRIPT_FRAGMENTS.historyRestore}
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.historyRestore}
            if (entry.page === "imagine") {
              setImagineActiveView(
                entry.imagineView === "my-templates" || entry.imagineView === "favourites" || entry.imagineView === "create-template"
                  ? entry.imagineView
                  : "explore"
              );
              setImagineMediaMode(entry.mediaMode === "video" ? "video" : "image");
              setImagineFilterMode(entry.filterMode || "all");
              setImagineSortMode(entry.sortMode || "featured");
              openImaginePage();
              return;
            }
  
  ${MODELS_APP_SCRIPT_FRAGMENTS.historyRestore}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.historyRestore}${TESTS_APP_SCRIPT_FRAGMENTS.historyRestore}${ASSURANCE_APP_SCRIPT_FRAGMENTS.historyRestore}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.historyRestore}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.historyRestore}${MARKETPLACE_APP_SCRIPT_FRAGMENTS.historyRestore}${API_KEYS_APP_SCRIPT_FRAGMENTS.historyRestore}${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyRestore}
  ${SECURITY_APP_SCRIPT_FRAGMENTS.historyRestore}
  ${EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.historyRestore}
  ${INFERENCE_APP_SCRIPT_FRAGMENTS.historyRestore}
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyRestore}
            setActivePage(entry.page || "thread");
          }, []);
  
          useEffect(() => {
            const entry = normalizePlaygroundPlatformNavigationEntry(currentPlatformNavigationEntry);
            if (!entry || typeof window === "undefined" || !window.history) {
              return;
            }
  
            const entryKey = getPlaygroundPlatformNavigationEntryKey(entry);
            if (!entryKey) {
              return;
            }
  
            const pendingRestore = platformNavigationRestoreRef.current;
            if (pendingRestore) {
              if (pendingRestore.key === entryKey) {
                platformNavigationRestoreRef.current = null;
                platformNavigationLastKeyRef.current = entryKey;
                return;
              }
              if (Date.now() - pendingRestore.startedAt < PLAYGROUND_PLATFORM_NAVIGATION_RESTORE_SUPPRESSION_MS) {
                return;
              }
              platformNavigationRestoreRef.current = null;
            }
  
            if (platformNavigationLastKeyRef.current === entryKey) {
              return;
            }
  
            const nextState = buildPlaygroundPlatformNavigationState(entry);
            if (!nextState) {
              return;
            }
  
            platformNavigationHistoryRef.current = appendPlaygroundPlatformNavigationHistory(platformNavigationHistoryRef.current, entry);
            window.__runnerPlatformNavigationHistory = platformNavigationHistoryRef.current;
  
            if (!platformNavigationInitializedRef.current) {
              platformNavigationInitializedRef.current = true;
              platformNavigationLastKeyRef.current = entryKey;
              window.history.replaceState({
                ...(window.history.state && typeof window.history.state === "object" ? window.history.state : {}),
                ...nextState,
              }, "");
              return;
            }
  
            platformNavigationLastKeyRef.current = entryKey;
            window.history.pushState({
              ...(window.history.state && typeof window.history.state === "object" ? window.history.state : {}),
              ...nextState,
            }, "");
          }, [currentPlatformNavigationEntry]);
  
          useEffect(() => {
            function handlePlatformNavigationPopState(event) {
              const entry = getPlaygroundPlatformNavigationStateEntry(event.state);
              if (!entry) {
                return;
              }
              requestPlatformNavigation(
                () => applyPlatformNavigationEntry(entry),
                {
                  onCancel: () => {
                    const currentEntry = normalizePlaygroundPlatformNavigationEntry(currentPlatformNavigationEntry);
                    const currentState = buildPlaygroundPlatformNavigationState(currentEntry);
                    if (!currentState) {
                      return;
                    }
                    window.history.pushState({
                      ...(window.history.state && typeof window.history.state === "object" ? window.history.state : {}),
                      ...currentState,
                    }, "");
                  },
                }
              );
            }
  
            window.addEventListener("popstate", handlePlatformNavigationPopState);
            return () => window.removeEventListener("popstate", handlePlatformNavigationPopState);
          }, [applyPlatformNavigationEntry, currentPlatformNavigationEntry, requestPlatformNavigation]);
  
          useEffect(() => {
            if (activePage !== "resources" || activeResourcesView !== "servers" || !hasSessionAuth) {
              return;
            }
            if (activeResourcesServerKind === "database") {
              return;
            }
            void loadSettingsPlatformConfig();
          }, [activePage, activeResourcesServerKind, activeResourcesView, hasSessionAuth, loadSettingsPlatformConfig]);
  
  ${DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.resourceMetricsLifecycle}
          const selectedThreadTitle = useMemo(() => {
            if (activePage === "tools" || activePage === "plugins" || activePage === "skills") {
              return "Tools";
            }
            if (activePage === "files") {
              return "Files";
            }
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle}          if (activePage === "models") {
              return "Models";
            }
  ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.selectedTitle}${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.selectedTitle}${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle}${API_KEYS_APP_SCRIPT_FRAGMENTS.selectedTitle}${SECURITY_APP_SCRIPT_FRAGMENTS.selectedTitle}${EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.selectedTitle}          if (isResourcesPage) {
              return "Resources";
            }
            if (activePage === "tasks") {
              return "Projects";
            }
            if (activePage === "calendar") {
              return "Calendar";
            }
            if (activePage === "thread" && metronomeRunTraceSelection?.key) {
              return metronomeRunTraceSelection.workflowName || "Metronome run";
            }
            if (!hasRealAccess && !currentThreadId) {
              return hasDemoAccess ? "ACP Demo" : "Sign In Required";
            }
            if (!currentThreadId) {
              return "New Thread";
            }
            return selectedKnownThread?.title || "Current thread";
          }, [activePage, currentThreadId, hasDemoAccess, hasRealAccess, isResourcesPage, metronomeRunTraceSelection, selectedKnownThread, settingsSelectedTrigger, settingsSelectedTriggerId]);
          const selectedThreadNavRecord = useMemo(() => {
            if (selectedKnownThread?.id) {
              return selectedKnownThread;
            }
            const normalizedThreadId = String(currentThreadId || "").trim();
            if (activePage !== "thread" || !normalizedThreadId || metronomeRunTraceSelection?.key) {
              return null;
            }
            const matchingRealThread = Array.isArray(realThreads)
              ? realThreads.find((thread) => String(thread?.id || "").trim() === normalizedThreadId)
              : null;
            if (matchingRealThread) {
              return matchingRealThread;
            }
            if (!activeEvaluationThreadContext && !isRealThreadId(normalizedThreadId)) {
              return null;
            }
            return {
              id: normalizedThreadId,
              title: activeEvaluationThreadContext?.threadKind || "Current thread",
              createdAt: "",
              updatedAt: "",
              agentCT: 0,
              environmentCT: 0,
            };
          }, [activeEvaluationThreadContext, activePage, currentThreadId, metronomeRunTraceSelection?.key, realThreads, selectedKnownThread]);
          const showThreadNavMutationActions = Boolean(selectedKnownThread?.id && !activeEvaluationThreadContext);
          const selectedThreadStartedLabel = useMemo(() => {
            const startedAt = typeof selectedThreadNavRecord?.createdAt === "string" ? selectedThreadNavRecord.createdAt.trim() : "";
            return startedAt ? formatPlaygroundFileDate(startedAt) : "Unknown";
          }, [selectedThreadNavRecord]);
          const selectedThreadUpdatedLabel = useMemo(() => {
            const updatedAt = typeof selectedThreadNavRecord?.updatedAt === "string" ? selectedThreadNavRecord.updatedAt.trim() : "";
            const fallbackStartedAt = typeof selectedThreadNavRecord?.createdAt === "string" ? selectedThreadNavRecord.createdAt.trim() : "";
            const effectiveUpdatedAt = updatedAt || fallbackStartedAt;
            return effectiveUpdatedAt ? formatPlaygroundFileDate(effectiveUpdatedAt) : "Unknown";
          }, [selectedThreadNavRecord]);
          const selectedThreadAgentCtLabel = useMemo(() => {
            return formatSettingsComputeTokens(selectedThreadNavRecord?.agentCT || 0);
          }, [selectedThreadNavRecord]);
          const selectedThreadEnvironmentCtLabel = useMemo(() => {
            return formatSettingsComputeTokens(selectedThreadNavRecord?.environmentCT || 0);
          }, [selectedThreadNavRecord]);
          const selectedThreadTaskListState = threadTaskListState.threadId === String(currentThreadId || "").trim()
            ? threadTaskListState
            : { threadId: String(currentThreadId || "").trim(), status: "idle", error: "", todos: [], updatedAt: "" };
          const selectedThreadTaskListTodos = Array.isArray(selectedThreadTaskListState.todos)
            ? selectedThreadTaskListState.todos
            : [];
          const selectedThreadTaskListCompletedCount = selectedThreadTaskListTodos.filter((todo) => todo?.completed).length;
          const selectedThreadTaskListCountLabel = selectedThreadTaskListTodos.length > 0
            ? selectedThreadTaskListCompletedCount + "/" + selectedThreadTaskListTodos.length + " completed"
            : selectedThreadTaskListState.status === "loading"
              ? "Loading"
              : "No tasks";
          const rawSelectedThreadTaskPreview = useMemo(() => {
            if (!selectedKnownThread) {
              return null;
            }
            return getThreadTaskPreview(selectedKnownThread);
          }, [selectedKnownThread]);
          const rawSelectedThreadMissionControlMetadata = useMemo(() => {
            if (!selectedKnownThread) {
              return null;
            }
            return getThreadMissionControlMetadata(selectedKnownThread);
          }, [selectedKnownThread]);
          const selectedThreadTaskPreview = useMemo(() => {
            if (!currentThreadId) {
              return null;
            }
            const overridePreview = threadTaskPreviewOverrides[currentThreadId];
            const basePreview = overridePreview && typeof overridePreview === "object" && overridePreview.taskId
              ? overridePreview
              : rawSelectedThreadTaskPreview;
            if (!basePreview) {
              return null;
            }
            const normalizedAssigneeId = String(basePreview.assigneeAgentId || "").trim();
            const inferredRunKind = String(basePreview.runKind || "").trim()
              || (
                String(basePreview.sourceThreadId || "").trim()
                || /^review[:\s-]/i.test(String(selectedKnownThread?.title || "").trim())
                  ? "review"
                  : ""
              );
            const shouldPatchRunKind = Boolean(inferredRunKind && inferredRunKind !== String(basePreview.runKind || "").trim());
            const assigneeAgent = normalizedAssigneeId && !isPlaygroundHumanAssigneeId(normalizedAssigneeId)
              ? (runtimeAgents.find((agent) => agent.id === normalizedAssigneeId) || null)
              : null;
            const resolvedAssigneePhotoUrl = normalizedAssigneeId
              ? (
                isPlaygroundHumanAssigneeId(normalizedAssigneeId)
                  ? (canRenderAvatarImage(accountAvatarUrl) ? accountAvatarUrl : "")
                  : normalizeSessionPhotoUrl(assigneeAgent ? getPlaygroundAgentProfilePhotoUrl(assigneeAgent) : "")
              )
              : "";
            if (resolvedAssigneePhotoUrl === String(basePreview.assigneePhotoUrl || "").trim() && !shouldPatchRunKind) {
              return basePreview;
            }
            return {
              ...basePreview,
              assigneePhotoUrl: resolvedAssigneePhotoUrl,
              ...(shouldPatchRunKind ? { runKind: inferredRunKind } : {}),
            };
          }, [accountAvatarUrl, currentThreadId, rawSelectedThreadTaskPreview, runtimeAgents, selectedKnownThread?.title, threadTaskPreviewOverrides]);
          useEffect(() => {
            selectedThreadTaskPreviewRef.current = selectedThreadTaskPreview;
          }, [selectedThreadTaskPreview]);
          const selectedThreadAgentId = useMemo(() => {
            const explicitThreadAgentId = typeof selectedKnownThread?.agentId === "string"
              ? selectedKnownThread.agentId.trim()
              : "";
            if (explicitThreadAgentId) {
              return explicitThreadAgentId;
            }
            return typeof selectedThreadTaskPreview?.assigneeAgentId === "string"
              ? selectedThreadTaskPreview.assigneeAgentId.trim()
              : "";
          }, [selectedKnownThread, selectedThreadTaskPreview]);
          const resolvedTaskInputAgentId = useMemo(() => {
            const overrideAgentId =
              activePage === "thread"
              && currentThreadId
              && threadAgentSelectionOverride
              && threadAgentSelectionOverride.threadId === currentThreadId
                ? String(threadAgentSelectionOverride.agentId || "").trim()
                : "";
            if (overrideAgentId) {
              return overrideAgentId;
            }
            if (activePage === "thread" && currentThreadId && selectedThreadAgentId) {
              return selectedThreadAgentId;
            }
            return resolvedPreferredAgentId;
          }, [
            activePage,
            currentThreadId,
            resolvedPreferredAgentId,
            selectedThreadAgentId,
            threadAgentSelectionOverride,
          ]);
          const isFreeComposerAgentPlan = platformHasCapability("subscriptions")
            && (normalizeSettingsTierId(settingsCurrentTierId || accountTierId || "sandbox") || "sandbox") === "sandbox";
          const runtimeAgentsForComposer = useMemo(() => {
            const normalizedRuntimeAgents = Array.isArray(runtimeAgents) ? runtimeAgents : [];
            return ensurePlaygroundComposerDefaultChoices(normalizedRuntimeAgents);
          }, [runtimeAgents]);
          const resolvedComposerAgentId = useMemo(() => {
            const normalizedAgentId = String(resolvedTaskInputAgentId || "").trim();
            if (!isFreeComposerAgentPlan) {
              return normalizedAgentId;
            }
            const selectedAgent = runtimeAgentsForComposer.find((agent) => String(agent?.id || "").trim() === normalizedAgentId) || null;
            if (selectedAgent && !isPlaygroundFreePlanLockedComposerAgent(selectedAgent)) {
              return normalizedAgentId;
            }
            const sparkAgent = runtimeAgentsForComposer.find((agent) => isPlaygroundAssistantAgent(agent));
            const selectableAgent = runtimeAgentsForComposer.find((agent) => !isPlaygroundFreePlanLockedComposerAgent(agent));
            return String((sparkAgent || selectableAgent || runtimeAgentsForComposer[0])?.id || "").trim();
          }, [isFreeComposerAgentPlan, resolvedTaskInputAgentId, runtimeAgentsForComposer]);
          useEffect(() => {
            if (!isFreeComposerAgentPlan) {
              return;
            }
            const normalizedPreferredAgentId = String(preferredAgentId || "").trim();
            if (!normalizedPreferredAgentId) {
              return;
            }
            const preferredAgent = runtimeAgentsForComposer.find((agent) => String(agent?.id || "").trim() === normalizedPreferredAgentId) || null;
            if (preferredAgent && !isPlaygroundFreePlanLockedComposerAgent(preferredAgent)) {
              return;
            }
            const nextAgent = runtimeAgentsForComposer.find((agent) => isPlaygroundAssistantAgent(agent))
              || runtimeAgentsForComposer.find((agent) => !isPlaygroundFreePlanLockedComposerAgent(agent))
              || runtimeAgentsForComposer[0];
            const nextAgentId = String(nextAgent?.id || "").trim();
            if (!nextAgentId || nextAgentId === normalizedPreferredAgentId) {
              return;
            }
            setPreferredAgentId(nextAgentId);
            setThreadAgentSelectionOverride(null);
          }, [isFreeComposerAgentPlan, preferredAgentId, runtimeAgentsForComposer]);
          const metronomeAgentsForComposer = useMemo(() => {
            const seenAgentIds = new Set();
            const nextAgents = [];
            const addAgentOption = (agent) => {
              if (!agent || typeof agent !== "object") {
                return;
              }
              if (isPlaygroundAgentCreatorAgent(agent) || isPlaygroundMissionControlAgent(agent)) {
                return;
              }
              const option = buildPlaygroundRunnerAgentOption(agent);
              const optionId = String(option?.id || "").trim();
              if (!optionId || seenAgentIds.has(optionId)) {
                return;
              }
              seenAgentIds.add(optionId);
              nextAgents.push(option);
            };
  
            (Array.isArray(runtimeAgentsForComposer) ? runtimeAgentsForComposer : []).forEach(addAgentOption);
            if (hasRealAccess) {
              (Array.isArray(realAgents) ? realAgents : []).forEach(addAgentOption);
            }
  
            return ensurePlaygroundComposerDefaultChoices(nextAgents);
          }, [hasRealAccess, realAgents, runtimeAgentsForComposer]);
          const isComposerAgentSelectionBlocked = useCallback((agent) => {
            return isFreeComposerAgentPlan && isPlaygroundFreePlanLockedComposerAgent(agent);
          }, [isFreeComposerAgentPlan]);
          const handleBlockedComposerAgentSelect = useCallback(() => {
            requestPlatformPlanGate({
              entitlement: "agents.custom.create",
              requiredPlan: "builder",
              featureName: "additional and custom agents",
              source: "composer",
            });
          }, []);
          const openAgentDetailsInResources = useCallback((nextAgentId, options = {}) => {
            const normalizedAgentId = String(nextAgentId || "").trim();
            if (!normalizedAgentId) {
              return;
            }
            void refreshAgents();
            if (options.closeSidebar !== false) {
              setSidebarOpen(false);
            }
            setAgentPageSelectionRequest({
              agentId: normalizedAgentId,
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
            setSidebarWorkspaceMode("work");
            setResourcesView("agents");
            setResourcesHeaderState({
              mode: "overview",
              title: "",
            });
            setActivePage("resources");
          }, [refreshAgents]);
  ${RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.actions}          const openAgentCreationInResources = useCallback((options = {}) => {
            openPlatformResourceCreationModal("agent", options);
          }, []);
          const handleThreadTurnAgentClick = useCallback((payload = {}) => {
            const requestedAgentId = String(payload?.agentId || "").trim();
            const normalizedAgentName = String(payload?.agentName || "").trim().toLowerCase();
            let resolvedAgentId = requestedAgentId;
  
            if (!resolvedAgentId && normalizedAgentName) {
              resolvedAgentId = runtimeAgentIdsByNormalizedName.get(normalizedAgentName) || "";
            }
  
            if (!resolvedAgentId) {
              const fallbackAgentId = String(selectedThreadAgentId || resolvedTaskInputAgentId || "").trim();
              const fallbackAgent = fallbackAgentId ? (runtimeAgentsById[fallbackAgentId] || null) : null;
              const fallbackAgentName = String(fallbackAgent?.name || "").trim().toLowerCase();
              if (fallbackAgentId && (!normalizedAgentName || normalizedAgentName === fallbackAgentName)) {
                resolvedAgentId = fallbackAgentId;
              }
            }
  
            if (!resolvedAgentId) {
              return;
            }
  
            openAgentDetailsInResources(resolvedAgentId, { closeSidebar: false });
          }, [
            openAgentDetailsInResources,
            resolvedTaskInputAgentId,
            runtimeAgentIdsByNormalizedName,
            runtimeAgentsById,
            selectedThreadAgentId,
          ]);
          const handleThreadSummaryWorkspacePathClick = useCallback((payload = {}) => {
            const normalizedPath = normalizeHistoryPath(payload?.path || "");
            const normalizedEnvironmentId = String(payload?.environmentId || environmentId || "").trim();
            if (!normalizedPath || !normalizedEnvironmentId) {
              return;
            }
  
            if (payload?.sourceType === "deep_research_report") {
              setThreadTaskOpenRequest(null);
              setThreadSubagentDetailOpen(false);
              setThreadDeepResearchDetailOpen(false);
              setThreadPreviewAttachment(null);
              setEnvironmentId(normalizedEnvironmentId);
              setFilesPageNavigationRequest({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                environmentId: normalizedEnvironmentId,
                path: normalizedPath,
                isFolder: false,
                contentMode: "files",
              });
              setActivePage("files");
              return;
            }
  
            setThreadTaskOpenRequest(null);
            setThreadSubagentDetailOpen(false);
            setThreadDeepResearchDetailOpen(false);
            setEnvironmentId(normalizedEnvironmentId);
            setFilesPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              environmentId: normalizedEnvironmentId,
              path: normalizedPath,
              isFolder: false,
              contentMode: "files",
            });
            setActivePage("files");
          }, [environmentId]);
          const selectedThreadTaskPreviewTaskId = typeof selectedThreadTaskPreview?.taskId === "string"
            ? selectedThreadTaskPreview.taskId.trim()
            : "";
          const selectedThreadTaskPreviewDeleted = Boolean(selectedThreadTaskPreview?.isDeleted);
          const selectedThreadCachedProjectContext = currentThreadId
            ? (threadProjectContextById[currentThreadId] || null)
            : null;
          const selectedThreadProjectId = typeof selectedThreadTaskPreview?.projectId === "string" && selectedThreadTaskPreview.projectId.trim()
            ? selectedThreadTaskPreview.projectId.trim()
            : (typeof rawSelectedThreadMissionControlMetadata?.projectId === "string" && rawSelectedThreadMissionControlMetadata.projectId.trim()
              ? rawSelectedThreadMissionControlMetadata.projectId.trim()
            : (typeof selectedKnownThread?.projectId === "string" && selectedKnownThread.projectId.trim()
              ? selectedKnownThread.projectId.trim()
              : (typeof selectedThreadCachedProjectContext?.projectId === "string" ? selectedThreadCachedProjectContext.projectId.trim() : "")));
          const cachedSelectedThreadProjectRecord = selectedThreadProjectId
            ? (threadProjectRecordsById[selectedThreadProjectId] || null)
            : null;
          const listedSelectedThreadProjectRecord = selectedThreadProjectId
            ? (Array.isArray(realProjects) ? realProjects : [])
                .find((project) => String(project?.id || "").trim() === selectedThreadProjectId) || null
            : null;
          const selectedThreadProjectRecord = useMemo(() => {
            if (!selectedThreadProjectId) {
              return null;
            }
            const welcomeProjectRecord = welcomeWidgetProject?.id === selectedThreadProjectId
              ? welcomeWidgetProject
              : null;
            const cachedProjectRecord = cachedSelectedThreadProjectRecord?.id === selectedThreadProjectId
              ? cachedSelectedThreadProjectRecord
              : null;
            const listedProjectRecord = listedSelectedThreadProjectRecord?.id === selectedThreadProjectId
              ? listedSelectedThreadProjectRecord
              : null;
            return mergePlaygroundProjectRecords(
              listedProjectRecord,
              mergePlaygroundProjectRecords(cachedProjectRecord, welcomeProjectRecord)
            );
          }, [cachedSelectedThreadProjectRecord, listedSelectedThreadProjectRecord, selectedThreadProjectId, welcomeWidgetProject]);
          const selectedThreadProjectName = useMemo(() => {
            return String(
              selectedThreadProjectRecord?.name
              || selectedThreadCachedProjectContext?.projectName
              || rawSelectedThreadMissionControlMetadata?.projectName
              || selectedThreadTaskPreview?.projectName
              || selectedKnownThread?.projectName
              || ""
            ).trim();
          }, [rawSelectedThreadMissionControlMetadata?.projectName, selectedKnownThread?.projectName, selectedThreadCachedProjectContext?.projectName, selectedThreadProjectRecord?.name, selectedThreadTaskPreview?.projectName]);
          const selectedThreadProjectMetadata = selectedThreadProjectRecord?.metadata
            && typeof selectedThreadProjectRecord.metadata === "object"
            && !Array.isArray(selectedThreadProjectRecord.metadata)
              ? selectedThreadProjectRecord.metadata
              : {};
          const selectedThreadProjectIconConfig = useMemo(() => getPlaygroundProjectIconConfig(
            resolvePlaygroundProjectIconId(
              selectedThreadProjectRecord,
              selectedThreadTaskPreview?.projectIcon,
              rawSelectedThreadMissionControlMetadata?.projectIcon,
              selectedKnownThread?.projectIcon,
              selectedThreadCachedProjectContext?.projectIcon
            )
          ), [
            rawSelectedThreadMissionControlMetadata?.projectIcon,
            selectedKnownThread?.projectIcon,
            selectedThreadCachedProjectContext?.projectIcon,
            selectedThreadProjectRecord,
            selectedThreadTaskPreview?.projectIcon,
          ]);
          const selectedThreadProjectColor = String(
            selectedThreadProjectRecord?.color
            || selectedThreadProjectMetadata.color
            || selectedThreadTaskPreview?.projectColor
            || rawSelectedThreadMissionControlMetadata?.projectColor
            || selectedKnownThread?.projectColor
            || selectedThreadCachedProjectContext?.projectColor
            || ""
          ).trim();
          const selectedThreadTaskTicketNumber = selectedThreadTaskPreview?.taskId && !selectedThreadTaskPreview?.isDeleted
            ? formatPlaygroundProjectTicketNumber(
                selectedThreadProjectRecord || {
                  id: selectedThreadProjectId,
                  name: selectedThreadProjectName,
                },
                selectedThreadTaskPreview.ticketNumber
                  || selectedThreadTaskPreview?.metadata?.ticketNumber
                  || ""
              )
            : "";
          const selectedThreadTaskType = normalizePlaygroundTaskType(
            selectedThreadTaskPreview?.taskType
            || selectedThreadTaskPreview?.type
            || selectedThreadTaskPreview?.metadata?.taskType
            || "task"
          );
  	        const selectedThreadProjectContextPrompt = useMemo(() => {
  	          const previewTaskId = typeof selectedThreadTaskPreview?.taskId === "string"
  	            ? selectedThreadTaskPreview.taskId.trim()
  	            : "";
  	          if (!previewTaskId) {
  	            return "";
  	          }
  	          const previewTaskRecord = normalizePlaygroundTaskRecord({
  	            id: previewTaskId,
  	            projectId: selectedThreadProjectId,
  	            releaseId: selectedThreadTaskPreview?.releaseId,
  	            ticketNumber: selectedThreadTaskPreview?.ticketNumber,
  	            title: selectedThreadTaskPreview?.title,
  	            description: selectedThreadTaskPreview?.description,
  	            status: selectedThreadTaskPreview?.status || "todo",
  	            metadata: selectedThreadTaskPreview?.metadata,
  	          });
  		          return [
  		            buildPlaygroundProjectStrategyBriefPromptSection(selectedThreadProjectRecord, {
  		              taskRecord: previewTaskRecord,
  		            }),
  		            buildPlaygroundProjectRulesPromptSection(selectedThreadProjectRecord),
  		            buildPlaygroundProjectResourcePromptSection(selectedThreadProjectRecord, {
  		              projectId: selectedThreadProjectId,
  		              projectName: selectedThreadProjectName,
  		            }),
  		          ].filter(Boolean).join(String.fromCharCode(10) + String.fromCharCode(10));
  		        }, [selectedThreadProjectId, selectedThreadProjectName, selectedThreadProjectRecord, selectedThreadTaskPreview]);
  	        const selectedThreadTaskTitle = useMemo(() => {
            if (!selectedThreadTaskPreview?.taskId || selectedThreadTaskPreview?.isDeleted) {
              return "";
            }
            const ticketNumber = normalizePlaygroundTaskTicketNumber(selectedThreadTaskPreview.ticketNumber || "");
            const title = String(selectedThreadTaskPreview.title || "").trim() || "Untitled Task";
            return (ticketNumber ? (ticketNumber + " ") : "") + title;
          }, [selectedThreadTaskPreview]);
          useEffect(() => {
            setThreadFollowUpActionState({
              action: "",
              error: "",
            });
          }, [activeRunnerThreadId, currentThreadId]);
          const loadSelectedThreadFollowUpTask = useCallback(async function loadSelectedThreadFollowUpTask() {
            const normalizedTaskId = String(selectedThreadTaskPreviewTaskId || "").trim();
            if (!hasRealAccess || !normalizedTaskId) {
              throw new Error("Task details are unavailable.");
            }
  
            const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(normalizedTaskId), {
              method: "GET",
              headers: authRequestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load task details.");
            }
            const taskRecord = getPlaygroundTaskResponseRecord(data);
            if (!taskRecord?.id) {
              throw new Error("Task details are unavailable.");
            }
            const previewTask = selectedThreadTaskPreview && typeof selectedThreadTaskPreview === "object"
              ? selectedThreadTaskPreview
              : {};
            const previewLinkedThreadIds = Array.from(new Set([
              ...normalizePlaygroundIdList(previewTask.linkedThreadIds),
              String(previewTask.threadId || "").trim(),
              String(previewTask.sourceThreadId || "").trim(),
            ].filter(Boolean)));
            return normalizePlaygroundTaskRecord({
              ...taskRecord,
              projectId: taskRecord.projectId || previewTask.projectId || "",
              ticketNumber: taskRecord.ticketNumber || previewTask.ticketNumber || "",
              title: taskRecord.title || previewTask.title || "Untitled Task",
              description: typeof taskRecord.description === "string" && taskRecord.description.trim()
                ? taskRecord.description
                : (typeof previewTask.description === "string" ? previewTask.description : ""),
              taskColor: taskRecord.taskColor || previewTask.taskColor || PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
              priority: taskRecord.priority || previewTask.priority || "medium",
              taskType: taskRecord.taskType || previewTask.taskType || "task",
              environmentId: taskRecord.environmentId || previewTask.environmentId || "",
              reviewRequired: taskRecord.reviewRequired === true || previewTask.reviewRequired === true,
              reviewerAgentId: taskRecord.reviewerAgentId || previewTask.reviewerAgentId || null,
              linkedThreadIds: Array.from(new Set([
                ...normalizePlaygroundIdList(taskRecord.linkedThreadIds),
                ...previewLinkedThreadIds,
              ])),
              lastStartedThreadId: taskRecord.lastStartedThreadId || previewTask.threadId || previewTask.sourceThreadId || "",
            });
          }, [
            authRequestHeaders,
            hasRealAccess,
            proxyBackendBase,
            selectedThreadTaskPreview,
            selectedThreadTaskPreviewTaskId,
          ]);
          const buildThreadFollowUpTaskPatchPayload = useCallback(function buildThreadFollowUpTaskPatchPayload(taskRecord, overrides = {}) {
            const normalizedTask = normalizePlaygroundTaskRecord({
              ...normalizePlaygroundTaskRecord(taskRecord),
              ...overrides,
            });
            const normalizedThreadId = String(
              overrides.lastStartedThreadId
              || normalizedTask.lastStartedThreadId
              || activeRunnerThreadId
              || currentThreadId
              || selectedThreadTaskPreview?.threadId
              || ""
            ).trim();
            const linkedThreadIds = Array.from(new Set([
              ...normalizePlaygroundIdList(normalizedTask.linkedThreadIds),
              ...(normalizedThreadId ? [normalizedThreadId] : []),
            ]));
  
            return {
              projectId: normalizedTask.projectId || selectedThreadProjectId || "",
              releaseId: normalizedTask.releaseId,
              ticketNumber: normalizedTask.ticketNumber,
              type: normalizedTask.taskType,
              parentTaskId: normalizedTask.taskType === "subtask" ? normalizedTask.parentTaskId : null,
              title: normalizedTask.title,
              description: normalizedTask.description,
              status: normalizedTask.status,
              priority: normalizedTask.priority,
              sprintId: normalizedTask.sprintId,
              assigneeAgentId: isPlaygroundHumanAssigneeId(normalizedTask.assigneeAgentId)
                ? null
                : normalizedTask.assigneeAgentId,
              reviewRequired: normalizedTask.reviewRequired,
              reviewerAgentId: normalizedTask.reviewerAgentId,
              environmentId: normalizedTask.environmentId,
              dependencyIds: normalizedTask.dependencyIds,
              linkedThreadIds,
              lastStartedThreadId: normalizedThreadId || normalizedTask.lastStartedThreadId,
              scheduledStartAt: normalizedTask.scheduledStartAt,
              scheduledEndAt: normalizedTask.scheduledEndAt,
              dueAt: normalizedTask.dueAt,
              completedAt: normalizedTask.completedAt,
              sortOrder: Number.isFinite(normalizedTask.sortOrder) ? normalizedTask.sortOrder : Date.now(),
              metadata: buildPlaygroundTaskMetadata(normalizedTask, {
                ticketNumber: normalizedTask.ticketNumber,
                taskType: normalizedTask.taskType,
                parentTaskId: normalizedTask.parentTaskId,
                assigneeAgentId: normalizedTask.assigneeAgentId,
                reviewRequired: normalizedTask.reviewRequired,
                reviewerAgentId: normalizedTask.reviewerAgentId,
                environmentId: normalizedTask.environmentId,
                taskColor: normalizedTask.taskColor,
                scheduleType: normalizedTask.scheduleType,
                cronExpression: normalizedTask.cronExpression,
                scheduleTimezone: normalizedTask.scheduleTimezone,
                scheduleEnabled: normalizedTask.scheduleEnabled,
                attachments: normalizedTask.attachments,
                enabledSkills: normalizedTask.enabledSkills,
                connectors: normalizedTask.connectors,
                comments: normalizedTask.comments,
              }),
            };
          }, [activeRunnerThreadId, currentThreadId, selectedThreadProjectId, selectedThreadTaskPreview]);
          const resolveThreadFollowUpNextTaskCandidate = useCallback(async function resolveThreadFollowUpNextTaskCandidate(projectId, currentTaskId, options = {}) {
            const normalizedProjectId = String(projectId || "").trim();
            const normalizedCurrentTaskId = String(currentTaskId || "").trim();
            if (!hasRealAccess || !normalizedProjectId) {
              return null;
            }
  
            const requestOptions = {
              method: "GET",
              headers: authRequestHeaders,
              ...(options?.signal ? { signal: options.signal } : {}),
            };
            const [projectResult, tasksResult] = await Promise.allSettled([
              fetch(proxyBackendBase + "/projects/" + encodeURIComponent(normalizedProjectId), requestOptions),
              fetch(proxyBackendBase + "/tasks?projectId=" + encodeURIComponent(normalizedProjectId), requestOptions),
            ]);
  
            let projectRecord = selectedThreadProjectRecord || null;
            if (projectResult.status === "fulfilled") {
              const projectResponse = projectResult.value;
              const projectData = await projectResponse.json().catch(() => ({}));
              if (projectResponse.ok) {
                projectRecord = getPlaygroundProjectResponseRecord(projectData, projectRecord) || projectRecord;
              }
            }
  
            if (tasksResult.status !== "fulfilled") {
              throw tasksResult.reason;
            }
            const tasksResponse = tasksResult.value;
            const tasksData = await tasksResponse.json().catch(() => ({}));
            if (!tasksResponse.ok) {
              throw new Error(tasksData?.message || tasksData?.error || "Failed to load project tasks.");
            }
  
            const nextTasks = parsePlaygroundTaskListResponse(tasksData)
              .map((task) => normalizePlaygroundTaskRecord(task))
              .filter((task) => {
                const taskProjectId = String(task?.projectId || normalizedProjectId || "").trim();
                return task?.id && (!taskProjectId || taskProjectId === normalizedProjectId);
              });
            const ticketNumbersById = buildPlaygroundTaskTicketNumberMap(nextTasks);
            const tasksById = new Map(nextTasks.map((task) => [task.id, task]));
            const hasIncompleteDependency = (task) => normalizePlaygroundIdList(task?.dependencyIds).some((dependencyId) => {
              const dependencyTask = tasksById.get(dependencyId) || null;
              return !dependencyTask || String(dependencyTask.status || "").trim() !== "done";
            });
            const getEffectiveTaskStatus = (task) => {
              const normalizedTaskId = String(task?.id || "").trim();
              const taskRunState = normalizedTaskId && taskRunStates[normalizedTaskId] && typeof taskRunStates[normalizedTaskId] === "object"
                ? taskRunStates[normalizedTaskId]
                : null;
              const taskRunPhase = String(taskRunState?.phase || "").trim().toLowerCase();
              if (taskRunPhase === "starting" || taskRunPhase === "running") {
                return "in_progress";
              }
              const rawStatus = String(task?.status || "").trim().toLowerCase();
              if (rawStatus === "done" || rawStatus === "in_review") {
                return rawStatus;
              }
              if (rawStatus === "blocked") {
                return hasIncompleteDependency(task) ? "blocked" : "todo";
              }
              if (rawStatus === "in_progress") {
                return taskHasStartedThread(task) ? "in_progress" : "todo";
              }
              return "todo";
            };
            const nextTask = nextTasks
              .filter((task) => String(task.id || "").trim() !== normalizedCurrentTaskId)
              .filter((task) => !isPlaygroundHumanAssigneeId(task.assigneeAgentId))
              .filter((task) => getEffectiveTaskStatus(task) === "todo")
              .sort((left, right) => {
                const leftTicketNumber = parsePlaygroundTaskTicketNumber(ticketNumbersById[left.id] || left.ticketNumber);
                const rightTicketNumber = parsePlaygroundTaskTicketNumber(ticketNumbersById[right.id] || right.ticketNumber);
                if (leftTicketNumber !== rightTicketNumber) {
                  return leftTicketNumber - rightTicketNumber;
                }
                  return comparePlaygroundTaskTicketOrder(left, right);
                })[0] || null;
            const currentTask = tasksById.get(normalizedCurrentTaskId) || null;
  
            return {
              projectId: normalizedProjectId,
              project: projectRecord,
              task: nextTask,
              projectTasks: nextTasks,
              currentTask,
              currentTaskStatus: currentTask ? getEffectiveTaskStatus(currentTask) : "",
              ticketNumbersById,
            };
          }, [
            authRequestHeaders,
            hasRealAccess,
            proxyBackendBase,
            selectedThreadProjectRecord,
            taskRunStates,
          ]);
          useEffect(() => {
            const normalizedProjectId = String(selectedThreadProjectId || "").trim();
            const normalizedTaskId = String(selectedThreadTaskPreviewTaskId || "").trim();
            const shouldResolveThreadTaskState =
              activePage === "thread"
              && hasRealAccess
              && !selectedThreadTaskPreviewDeleted
              && normalizedProjectId
              && normalizedTaskId;
  
            if (!shouldResolveThreadTaskState) {
              setThreadFollowUpNextTaskState({
                key: "",
                status: "idle",
                projectId: "",
                task: null,
                projectTasks: [],
                currentTask: null,
                currentTaskStatus: "",
                project: null,
                ticketNumbersById: {},
                error: "",
              });
              return;
            }
  
            const controller = new AbortController();
            const stateKey = normalizedProjectId + ":" + normalizedTaskId;
            setThreadFollowUpNextTaskState((current) => (
              current.key === stateKey && current.status === "ready"
                ? current
                : {
                    key: stateKey,
                    status: "loading",
                    projectId: normalizedProjectId,
                    task: current.key === stateKey ? current.task : null,
                    projectTasks: current.key === stateKey && Array.isArray(current.projectTasks) ? current.projectTasks : [],
                    currentTask: current.key === stateKey ? current.currentTask : null,
                    currentTaskStatus: current.key === stateKey ? current.currentTaskStatus : "",
                    project: current.key === stateKey ? current.project : null,
                    ticketNumbersById: current.key === stateKey ? current.ticketNumbersById : {},
                    error: "",
                  }
            ));
  
            void resolveThreadFollowUpNextTaskCandidate(normalizedProjectId, normalizedTaskId, {
              signal: controller.signal,
            }).then((result) => {
              if (controller.signal.aborted) {
                return;
              }
              setThreadFollowUpNextTaskState({
                key: stateKey,
                status: "ready",
                projectId: normalizedProjectId,
                task: result?.task || null,
                projectTasks: Array.isArray(result?.projectTasks) ? result.projectTasks : [],
                currentTask: result?.currentTask || null,
                currentTaskStatus: result?.currentTaskStatus || "",
                project: result?.project || null,
                ticketNumbersById: result?.ticketNumbersById || {},
                error: "",
              });
            }).catch((error) => {
              if (controller.signal.aborted) {
                return;
              }
              setThreadFollowUpNextTaskState({
                key: stateKey,
                status: "error",
                projectId: normalizedProjectId,
                task: null,
                projectTasks: [],
                currentTask: null,
                currentTaskStatus: "",
                project: null,
                ticketNumbersById: {},
                error: error instanceof Error ? error.message : "Failed to load next task.",
              });
            });
  
            return () => controller.abort();
          }, [
            activePage,
            hasRealAccess,
            resolveThreadFollowUpNextTaskCandidate,
            selectedKnownThread?.completedAt,
            selectedKnownThread?.endedAt,
            selectedKnownThread?.finishedAt,
            selectedThreadProjectId,
            selectedKnownThread?.status,
            selectedThreadTaskPreview?.runKind,
            selectedThreadTaskPreview?.status,
            selectedThreadTaskPreviewDeleted,
            selectedThreadTaskPreviewTaskId,
          ]);
          const handleThreadFollowUpStartAgentReview = useCallback(async function handleThreadFollowUpStartAgentReview() {
            const normalizedThreadId = String(
              selectedThreadTaskPreview?.sourceThreadId
              || activeRunnerThreadId
              || currentThreadId
              || selectedThreadTaskPreview?.threadId
              || ""
            ).trim();
            if (!normalizedThreadId) {
              throw new Error("Thread details are unavailable.");
            }
  
            setThreadFollowUpActionState({
              action: "start-agent-review",
              error: "",
            });
            try {
              const taskRecord = await loadSelectedThreadFollowUpTask();
              const reviewerAgentId = String(taskRecord.reviewerAgentId || selectedThreadTaskPreview?.reviewerAgentId || "").trim();
              if (!reviewerAgentId || isPlaygroundHumanAssigneeId(reviewerAgentId)) {
                throw new Error("This task does not have an agent reviewer.");
              }
              const reviewThread = await startAgentReviewThreadForTask({
                ...taskRecord,
                reviewRequired: true,
                reviewerAgentId,
              }, normalizedThreadId, {
  	              taskId: taskRecord.id,
  	              projectId: taskRecord.projectId || selectedThreadProjectId || "",
  	              projectName: selectedThreadProjectName || selectedThreadTaskPreview?.projectName || "",
  	              projectRecord: selectedThreadProjectRecord,
  	              threadId: normalizedThreadId,
                ticketNumber: taskRecord.ticketNumber || selectedThreadTaskPreview?.ticketNumber || "",
                title: taskRecord.title || selectedThreadTaskPreview?.title || "Untitled Task",
                runKind: "implementation",
                phase: "in_review",
                taskStatus: "in_review",
              });
              if (!reviewThread?.id) {
                throw new Error("Review thread could not be started.");
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to start agent review.";
              setThreadFollowUpActionState({
                action: "",
                error: message,
              });
              throw error;
            } finally {
              setThreadFollowUpActionState((current) => (
                current.action === "start-agent-review"
                  ? { action: "", error: "" }
                  : current
              ));
            }
          }, [
            activeRunnerThreadId,
            currentThreadId,
  	          loadSelectedThreadFollowUpTask,
  	          selectedThreadProjectId,
  	          selectedThreadProjectName,
  	          selectedThreadProjectRecord,
  	          selectedThreadTaskPreview,
  	          startAgentReviewThreadForTask,
  	        ]);
          const handleThreadFollowUpApprove = useCallback(async function handleThreadFollowUpApprove() {
            const normalizedThreadId = String(activeRunnerThreadId || currentThreadId || selectedThreadTaskPreview?.threadId || "").trim();
            setThreadFollowUpActionState({
              action: "approve",
              error: "",
            });
            try {
              const taskRecord = await loadSelectedThreadFollowUpTask();
              const currentPreview = selectedThreadTaskPreviewRef.current || selectedThreadTaskPreview || {};
              const normalizedRunKind = String(currentPreview?.runKind || "").trim().toLowerCase();
              const reviewerAgentId = String(taskRecord.reviewerAgentId || currentPreview?.reviewerAgentId || "").trim();
              const normalizedTaskStatus = String(taskRecord.status || currentPreview?.status || "").trim().toLowerCase();
              const canApproveFromThisThread = normalizedRunKind === "review" || isPlaygroundHumanAssigneeId(reviewerAgentId);
              if (normalizedTaskStatus !== "in_review" || !canApproveFromThisThread) {
                throw new Error("Open a review thread before approving this task.");
              }
              const completedAt = new Date().toISOString();
              const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(taskRecord.id), {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(buildThreadFollowUpTaskPatchPayload(taskRecord, {
                  status: "done",
                  completedAt,
                  lastStartedThreadId: normalizedThreadId || taskRecord.lastStartedThreadId,
                })),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to approve task.");
              }
              const updatedTask = getPlaygroundTaskResponseRecord(data);
              if (!updatedTask?.id) {
                throw new Error("Task approval response was invalid.");
              }
  
              if (normalizedThreadId) {
                const nextPreview = buildLiveThreadTaskPreview(updatedTask, selectedThreadTaskPreviewRef.current, normalizedThreadId);
                upsertThreadTaskPreview(normalizedThreadId, nextPreview);
              }
              applyTaskRunState({
                taskId: updatedTask.id,
                projectId: updatedTask.projectId || selectedThreadProjectId || "",
                threadId: normalizedThreadId,
                ticketNumber: updatedTask.ticketNumber || selectedThreadTaskPreview?.ticketNumber || "",
                title: updatedTask.title || selectedThreadTaskPreview?.title || "Untitled Task",
                runKind: String(selectedThreadTaskPreview?.runKind || "").trim().toLowerCase() || "implementation",
                phase: "finished",
                taskStatus: "done",
              });
              void refreshThreads(undefined, normalizedThreadId, { silent: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to approve task.";
              setThreadFollowUpActionState({
                action: "",
                error: message,
              });
              throw error;
            } finally {
              setThreadFollowUpActionState((current) => (
                current.action === "approve"
                  ? { action: "", error: "" }
                  : current
              ));
            }
          }, [
            activeRunnerThreadId,
            applyTaskRunState,
            authRequestHeaders,
            buildLiveThreadTaskPreview,
            buildThreadFollowUpTaskPatchPayload,
            currentThreadId,
            loadSelectedThreadFollowUpTask,
            proxyBackendBase,
            refreshThreads,
            selectedThreadProjectId,
  	          selectedThreadTaskPreview,
  	          upsertThreadTaskPreview,
  	        ]);
          const handleThreadFollowUpStartNextTask = useCallback(async function handleThreadFollowUpStartNextTask() {
            const normalizedProjectId = String(selectedThreadProjectId || selectedThreadTaskPreview?.projectId || "").trim();
            const normalizedCurrentTaskId = String(selectedThreadTaskPreviewTaskId || "").trim();
            const stateKey = normalizedProjectId + ":" + normalizedCurrentTaskId;
            setThreadFollowUpActionState({
              action: "start-next-task",
              error: "",
            });
  
            try {
              const candidateResult = threadFollowUpNextTaskState.key === stateKey && threadFollowUpNextTaskState.status === "ready"
                ? threadFollowUpNextTaskState
                : await resolveThreadFollowUpNextTaskCandidate(normalizedProjectId, normalizedCurrentTaskId);
              const taskToLaunch = normalizePlaygroundTaskRecord(candidateResult?.task);
              if (!taskToLaunch?.id) {
                throw new Error("No open task is ready to start.");
              }
              if (isPlaygroundHumanAssigneeId(taskToLaunch.assigneeAgentId)) {
                throw new Error("The next ready task is assigned to a human.");
              }
  
              const projectRecord = candidateResult?.project
                || selectedThreadProjectRecord
                || (normalizedProjectId ? { id: normalizedProjectId, name: selectedThreadProjectName } : null);
              const ticketNumbersById = candidateResult?.ticketNumbersById && typeof candidateResult.ticketNumbersById === "object"
                ? candidateResult.ticketNumbersById
                : {};
              const projectName = String(projectRecord?.name || selectedThreadProjectName || "").trim();
              const taskPreview = {
                ...buildWelcomeWidgetTaskPreview(taskToLaunch, "", {
                  projectId: normalizedProjectId,
                  projectName,
                  ticketNumbersById,
                }),
                runKind: "implementation",
              };
  
              applyTaskRunState({
                taskId: taskToLaunch.id,
                projectId: taskPreview.projectId || normalizedProjectId || "",
                ticketNumber: taskPreview.ticketNumber || "",
                title: taskPreview.title || taskToLaunch.title || "Untitled Task",
                runKind: "implementation",
                reviewRequired: taskToLaunch.reviewRequired === true,
                reviewerAgentId: taskToLaunch.reviewerAgentId || "",
                phase: "starting",
              });
  
              const candidateProjectTasks = Array.isArray(candidateResult?.projectTasks) ? candidateResult.projectTasks : [];
              const enabledSkillsPayload = await buildWelcomeWidgetEnabledSkillsPayload(taskToLaunch, {
                projectTasks: candidateProjectTasks,
                ticketNumbersById,
              });
              const launchConnectors = mergePlaygroundTaskConnectorSelections(projectRecord?.connectors, taskToLaunch.connectors);
              const launchEnvironmentId = String(
                taskToLaunch.environmentId
                || projectRecord?.defaultEnvironmentId
                || environmentId
                || ""
              ).trim();
              const githubRepo = buildWelcomeWidgetGithubRepoReference({
                ...taskToLaunch,
                connectors: launchConnectors,
              }, {
                projectConnectors: projectRecord?.connectors,
              });
              const projectLaunchAttachments = normalizePlaygroundTaskAttachmentList(projectRecord?.attachments);
  	            const launchPrompt = buildWelcomeWidgetTaskRunPrompt({
  	              ...taskToLaunch,
  	              connectors: launchConnectors,
  	            }, {
  	              projectAttachments: projectLaunchAttachments,
  	              projectTasks: candidateProjectTasks,
  	              projectId: normalizedProjectId,
  	              projectName,
  	              projectRecord,
  	              ticketNumbersById,
  	            });
              const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(taskToLaunch.id) + "/run-thread", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: taskPreview.ticketNumber + " " + taskPreview.title,
                  executionMode: "deferred",
                  idempotencyKey: "project-task-" + String(taskToLaunch.id || "") + "-" + (
                    globalThis.crypto?.randomUUID?.()
                    || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
                  ),
                  environmentId: launchEnvironmentId || undefined,
                  agentId: taskToLaunch.assigneeAgentId || undefined,
                  enabledSkills: enabledSkillsPayload,
                  githubRepo: githubRepo || undefined,
                  connectors: launchConnectors,
                  launchPrompt,
                  runKind: "implementation",
                  allowAdditionalThread: true,
                  taskPreview,
                  metadata: {
                    triggerKind: "manual",
                    source: "project_task",
                    runKind: "implementation",
                    runnerPlayground: {
                      enabledSkills: enabledSkillsPayload,
                      githubRepo: githubRepo || undefined,
                      connectors: launchConnectors,
                      taskPreview,
                    },
                  },
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to start the next task.");
              }
  
              const threadRecord = getPlaygroundThreadResponseRecord(data);
              const updatedTask = getPlaygroundTaskResponseRecord(data);
              if (!threadRecord?.id || !updatedTask?.id) {
                throw new Error("Next task thread creation failed.");
              }
  
              const executionStarted = Boolean(data?.executionStarted);
              const nextTaskPreview = {
                ...buildWelcomeWidgetTaskPreview(updatedTask, threadRecord.id, {
                  projectId: normalizedProjectId,
                  projectName,
                  ticketNumbersById,
                }),
                runKind: "implementation",
              };
              updateWelcomeWidgetTaskLocally(updatedTask);
              upsertRealThreadRecord(threadRecord, {
                taskPreview: nextTaskPreview,
                status: "running",
              });
              upsertThreadTaskPreview(threadRecord.id, nextTaskPreview);
              if (updatedTask.environmentId || launchEnvironmentId) {
                setEnvironmentId(updatedTask.environmentId || launchEnvironmentId);
              }
              setLatestInteractedProjectId(updatedTask.projectId || normalizedProjectId || latestInteractedProjectId || "");
              setThreadAgentSelectionOverride(null);
              setPendingThreadRunRequest(executionStarted
                ? null
                : {
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    threadId: threadRecord.id,
                    prompt: launchPrompt,
                    displayPrompt: null,
                    agentId: taskToLaunch.assigneeAgentId || null,
                    attachments: [],
                    githubRepo: githubRepo || null,
                    enabledSkills: enabledSkillsPayload || null,
                    environmentId: launchEnvironmentId || "",
                  });
              setActivePage("thread");
              setCurrentThreadId(threadRecord.id);
              setContentMode("chat");
              setThreadListMode("threads");
              setChangesNavigationTarget(null);
              setRunnerRenderKey((current) => current + 1);
              applyTaskRunState({
                taskId: updatedTask.id,
                projectId: nextTaskPreview.projectId || normalizedProjectId || "",
                threadId: threadRecord.id,
                ticketNumber: nextTaskPreview.ticketNumber || "",
                title: updatedTask.title || nextTaskPreview.title || "Untitled Task",
                runKind: "implementation",
                reviewRequired: updatedTask.reviewRequired === true || taskToLaunch.reviewRequired === true,
                reviewerAgentId: updatedTask.reviewerAgentId || taskToLaunch.reviewerAgentId || "",
                phase: "running",
              });
              void refreshThreads(undefined, threadRecord.id);
              if (executionStarted) {
                void loadThreadGroundTruthStatus(threadRecord.id);
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to start the next task.";
              setThreadFollowUpActionState({
                action: "",
                error: message,
              });
              throw error;
            } finally {
              setThreadFollowUpActionState((current) => (
                current.action === "start-next-task"
                  ? { action: "", error: "" }
                  : current
              ));
            }
          }, [
            applyTaskRunState,
            authRequestHeaders,
            currentThreadId,
            environmentId,
            latestInteractedProjectId,
            loadThreadGroundTruthStatus,
            proxyBackendBase,
            refreshThreads,
            resolveThreadFollowUpNextTaskCandidate,
            selectedThreadProjectId,
            selectedThreadProjectName,
            selectedThreadProjectRecord,
            selectedThreadTaskPreview?.projectId,
            selectedThreadTaskPreviewTaskId,
            threadFollowUpNextTaskState,
            upsertRealThreadRecord,
            upsertThreadTaskPreview,
          ]);
          const handleThreadFollowUpRequestChanges = useCallback(function handleThreadFollowUpRequestChanges() {
            setThreadFollowUpActionState({
              action: "",
              error: "",
            });
          }, []);
          const selectedThreadFollowUpActions = useMemo(() => {
            const normalizedTaskId = String(selectedThreadTaskPreviewTaskId || "").trim();
            const reviewerAgentId = String(selectedThreadTaskPreview?.reviewerAgentId || "").trim();
  		          const normalizedRunKind = String(selectedThreadTaskPreview?.runKind || "").trim().toLowerCase();
            const nextTaskStateKey = String(selectedThreadProjectId || selectedThreadTaskPreview?.projectId || "").trim()
              + ":"
              + normalizedTaskId;
            const hasFreshFollowUpTaskStatus =
              threadFollowUpNextTaskState.key === nextTaskStateKey
              && threadFollowUpNextTaskState.status === "ready"
              && Boolean(threadFollowUpNextTaskState.currentTaskStatus);
  		          const normalizedTaskStatus = hasFreshFollowUpTaskStatus
  		            ? String(threadFollowUpNextTaskState.currentTaskStatus || "").trim().toLowerCase()
  		            : String(selectedThreadTaskPreview?.status || "").trim().toLowerCase();
  		          const normalizedThreadStatus = String(selectedKnownThread?.status || "").trim().toLowerCase();
            const selectedThreadCompletionTimestamp = String(
              selectedKnownThread?.completedAt
              || selectedKnownThread?.finishedAt
              || selectedKnownThread?.endedAt
              || ""
            ).trim();
  		          const isTaskInReview = normalizedTaskStatus === "in_review";
  		          const isTaskDone = ["done", "finished", "completed"].includes(normalizedTaskStatus);
  		          const isReviewThreadCompleted = normalizedRunKind === "review" && (isCompletedThreadStatus(normalizedThreadStatus) || Boolean(selectedThreadCompletionTimestamp));
  		          const isCompletedReviewThread = normalizedRunKind === "review" && isTaskDone;
            const isHumanReviewer = isPlaygroundHumanAssigneeId(reviewerAgentId);
            const isAgentReviewer = Boolean(reviewerAgentId && !isHumanReviewer);
            if (
              activePage !== "thread"
              || !normalizedTaskId
              || selectedThreadTaskPreviewDeleted
            ) {
              return [];
            }
  
            const busyAction = String(threadFollowUpActionState.action || "").trim();
            const isBusy = Boolean(busyAction);
            const actions = [];
            const nextTaskReady = threadFollowUpNextTaskState.status === "ready"
              && threadFollowUpNextTaskState.task?.id
              && threadFollowUpNextTaskState.key === nextTaskStateKey;
            if (nextTaskReady) {
              const nextTask = normalizePlaygroundTaskRecord(threadFollowUpNextTaskState.task);
              const nextTaskTicketNumber = normalizePlaygroundTaskTicketNumber(
                threadFollowUpNextTaskState.ticketNumbersById?.[nextTask.id] || nextTask.ticketNumber || ""
              );
              const nextTaskTitle = String(nextTask.title || "Untitled Task").trim();
              const nextTaskLabel = [nextTaskTicketNumber, nextTaskTitle].filter(Boolean).join(" ").trim();
              actions.push({
                id: "start-next-task",
                label: nextTaskLabel ? "Start next Task: " + nextTaskLabel : "Start next Task",
                disabled: isBusy,
                pending: busyAction === "start-next-task",
                onClick: handleThreadFollowUpStartNextTask,
              });
            }
            if (isAgentReviewer && normalizedRunKind !== "review" && isTaskInReview) {
              actions.push({
                id: "start-agent-review",
                label: "Start Agent Review",
                disabled: isBusy,
                pending: busyAction === "start-agent-review",
                onClick: handleThreadFollowUpStartAgentReview,
              });
            }
            if (!isCompletedReviewThread && !isReviewThreadCompleted && normalizedRunKind !== "review" && isHumanReviewer && isTaskInReview) {
              actions.push({
                id: "approve",
                label: "Approve",
                disabled: isBusy,
                pending: busyAction === "approve",
                onClick: handleThreadFollowUpApprove,
              });
            }
            actions.push({
                id: "request-changes",
                label: "Request Changes",
                disabled: isBusy,
                focusComposer: true,
                onClick: handleThreadFollowUpRequestChanges,
            });
            return actions;
          }, [
            activePage,
            handleThreadFollowUpApprove,
            handleThreadFollowUpRequestChanges,
            handleThreadFollowUpStartNextTask,
            handleThreadFollowUpStartAgentReview,
            selectedKnownThread?.completedAt,
            selectedKnownThread?.endedAt,
            selectedKnownThread?.finishedAt,
            selectedKnownThread?.status,
            selectedThreadProjectId,
            selectedThreadTaskPreview?.projectId,
            selectedThreadTaskPreview?.runKind,
            selectedThreadTaskPreview?.reviewerAgentId,
            selectedThreadTaskPreview?.status,
            selectedThreadTaskPreviewDeleted,
            selectedThreadTaskPreviewTaskId,
            threadFollowUpActionState.action,
            threadFollowUpNextTaskState.currentTaskStatus,
            threadFollowUpNextTaskState.key,
            threadFollowUpNextTaskState.status,
            threadFollowUpNextTaskState.task,
          ]);
          const openSelectedThreadTaskDetail = useCallback(() => {
            const taskId = String(selectedThreadTaskPreview?.taskId || "").trim();
            const projectId = String(selectedThreadTaskPreview?.projectId || selectedThreadProjectId || "").trim();
            const threadId = String(activeRunnerThreadId || currentThreadId || selectedThreadTaskPreview?.threadId || "").trim();
            if (!taskId || !projectId) {
              return;
            }
            const directProjectRecord = selectedThreadProjectRecord?.id === projectId
              ? selectedThreadProjectRecord
              : {
                  id: projectId,
                  name: selectedThreadProjectName || "Project",
                  icon: selectedThreadProjectIconConfig?.id || "",
                  color: selectedThreadProjectColor || "",
                };
            const directTaskRecord = {
              ...(selectedThreadTaskPreview && typeof selectedThreadTaskPreview === "object"
                ? selectedThreadTaskPreview
                : {}),
              id: taskId,
              projectId,
              ticketNumber: selectedThreadTaskPreview?.ticketNumber || "",
              title: selectedThreadTaskPreview?.title || "Untitled Task",
              taskType: selectedThreadTaskType,
            };
            if (threadId) {
              setThreadProjectContextById((current) => ({
                ...current,
                [threadId]: {
                  ...(current[threadId] || {}),
                  projectId,
                  projectName: String(selectedThreadTaskPreview?.projectName || selectedThreadProjectName || current[threadId]?.projectName || "").trim(),
                  projectIcon: String(selectedThreadProjectIconConfig?.id || current[threadId]?.projectIcon || "").trim(),
                  projectColor: String(selectedThreadProjectColor || current[threadId]?.projectColor || "").trim(),
                },
              }));
            }
            setLatestInteractedProjectId(projectId);
            setThreadNavMenuOpen(false);
            setThreadTaskOpenRequest(null);
            setTasksHeaderState({
              mode: "project",
              title: selectedThreadProjectName || directProjectRecord.name || "Project",
              icon: selectedThreadProjectIconConfig?.id || directProjectRecord.icon || "",
              color: selectedThreadProjectColor || directProjectRecord.color || "",
              view: "overview",
              extraActions: null,
              projectId,
              taskId,
              ticketNumber: selectedThreadTaskTicketNumber,
              taskType: selectedThreadTaskType,
              detailMode: "task",
            });
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId,
              taskId,
              view: "overview",
              taskDetailMode: "screen",
              projectRecord: directProjectRecord,
              taskRecord: directTaskRecord,
            });
            setActivePage("tasks");
          }, [
            activeRunnerThreadId,
            currentThreadId,
            selectedThreadProjectId,
            selectedThreadProjectColor,
            selectedThreadProjectIconConfig,
            selectedThreadProjectName,
            selectedThreadProjectRecord,
            selectedThreadTaskTicketNumber,
            selectedThreadTaskType,
            selectedThreadTaskPreview,
          ]);
          const openSelectedThreadProject = useCallback(() => {
            const projectId = String(selectedThreadProjectId || selectedThreadTaskPreview?.projectId || "").trim();
            if (!projectId) {
              return;
            }
            const directProjectRecord = selectedThreadProjectRecord?.id === projectId
              ? selectedThreadProjectRecord
              : {
                  id: projectId,
                  name: selectedThreadProjectName || "Project",
                  icon: selectedThreadProjectIconConfig?.id || "",
                  color: selectedThreadProjectColor || "",
                };
            setLatestInteractedProjectId(projectId);
            setThreadNavMenuOpen(false);
            setThreadTaskOpenRequest(null);
            setTasksHeaderState({
              mode: "project",
              title: selectedThreadProjectName || directProjectRecord.name || "Project",
              icon: selectedThreadProjectIconConfig?.id || directProjectRecord.icon || "",
              color: selectedThreadProjectColor || directProjectRecord.color || "",
              view: "overview",
              extraActions: null,
              projectId,
              taskId: "",
              ticketNumber: "",
              taskType: "",
              detailMode: "",
            });
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId,
              view: "overview",
              missionControlAction: "",
              projectComposerAction: "",
              projectRecord: directProjectRecord,
            });
            setActivePage("tasks");
          }, [
            selectedThreadProjectColor,
            selectedThreadProjectIconConfig,
            selectedThreadProjectId,
            selectedThreadProjectName,
            selectedThreadProjectRecord,
            selectedThreadTaskPreview?.projectId,
          ]);
          const selectedThreadShellBackground = useMemo(() => {
            return "";
          }, []);
          const selectedThreadMissionControlPreview = useMemo(() => {
            if (!rawSelectedThreadMissionControlMetadata) {
              return null;
            }
            const projectName = String(
              selectedThreadProjectRecord?.name
              || rawSelectedThreadMissionControlMetadata.projectName
              || "Project"
            ).trim() || "Project";
            const projectIconConfig = getPlaygroundProjectIconConfig(resolvePlaygroundProjectIconId(
              selectedThreadProjectRecord,
              rawSelectedThreadMissionControlMetadata.projectIcon
            ));
            const ProjectIcon = projectIconConfig.icon;
            return {
              prompt: String(rawSelectedThreadMissionControlMetadata.userPrompt || "").trim(),
              projectName,
              projectIcon: React.createElement(ProjectIcon, { strokeWidth: 1.8 }),
              agentName: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
              agentPhotoUrl: PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL,
            };
          }, [rawSelectedThreadMissionControlMetadata, selectedThreadProjectRecord]);
          useEffect(() => {
            const normalizedThreadId = String(currentThreadId || "").trim();
            if (!normalizedThreadId || !rawSelectedThreadTaskPreview?.taskId) {
              return;
            }
            setThreadTaskPreviewOverrides((current) => {
              const existingPreview = current[normalizedThreadId];
              const nextPreview = mergeThreadTaskPreviewRecord(existingPreview, rawSelectedThreadTaskPreview, normalizedThreadId);
              if (JSON.stringify(existingPreview || null) === JSON.stringify(nextPreview)) {
                return current;
              }
              return {
                ...current,
                [normalizedThreadId]: nextPreview,
              };
            });
          }, [currentThreadId, mergeThreadTaskPreviewRecord, rawSelectedThreadTaskPreview]);
          useEffect(() => {
            const normalizedThreadId = String(currentThreadId || "").trim();
            const normalizedProjectId = String(
              selectedThreadTaskPreview?.projectId
              || rawSelectedThreadMissionControlMetadata?.projectId
              || rawSelectedThreadTaskPreview?.projectId
              || selectedKnownThread?.projectId
              || ""
            ).trim();
            if (!normalizedThreadId || !normalizedProjectId) {
              return;
            }
            const nextProjectName = String(
              selectedThreadProjectRecord?.name
              || rawSelectedThreadMissionControlMetadata?.projectName
              || selectedThreadTaskPreview?.projectName
              || rawSelectedThreadTaskPreview?.projectName
              || ""
            ).trim();
            const nextProjectIcon = String(selectedThreadProjectIconConfig?.id || "").trim();
            const nextProjectColor = String(selectedThreadProjectColor || "").trim();
            setThreadProjectContextById((current) => {
              const existingContext = current[normalizedThreadId];
              if (
                existingContext
                && existingContext.projectId === normalizedProjectId
                && String(existingContext.projectName || "").trim() === nextProjectName
                && String(existingContext.projectIcon || "").trim() === nextProjectIcon
                && String(existingContext.projectColor || "").trim() === nextProjectColor
              ) {
                return current;
              }
              return {
                ...current,
                [normalizedThreadId]: {
                  projectId: normalizedProjectId,
                  projectName: nextProjectName,
                  projectIcon: nextProjectIcon,
                  projectColor: nextProjectColor,
                },
              };
            });
          }, [
            currentThreadId,
            rawSelectedThreadMissionControlMetadata,
            rawSelectedThreadTaskPreview,
            selectedKnownThread,
            selectedThreadProjectColor,
            selectedThreadProjectIconConfig,
            selectedThreadProjectRecord,
            selectedThreadTaskPreview,
          ]);
          const isProjectThreadPage = activePage === "thread" && Boolean(selectedThreadProjectId);
          const isProjectShellContext = activePage === "tasks" || isProjectThreadPage;
          const isAgentShellContext = isResourcesPage && activeResourcesView === "agents";
  
          useEffect(() => {
            const cachedProjectIdentityIsAuthoritative = cachedSelectedThreadProjectRecord?.id === selectedThreadProjectId
              && (
                cachedSelectedThreadProjectRecord.__projectDetailsLoaded === true
                || hasPlaygroundExplicitProjectIcon(cachedSelectedThreadProjectRecord)
              );
            if (activePage !== "thread" || !hasRealAccess || !selectedThreadProjectId || cachedProjectIdentityIsAuthoritative) {
              return undefined;
            }
  
            const controller = new AbortController();
  
            void (async () => {
              try {
                const response = await fetch(proxyBackendBase + "/projects/" + encodeURIComponent(selectedThreadProjectId), {
                  method: "GET",
                  headers: authRequestHeaders,
                  signal: controller.signal,
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  return;
                }
                const fallbackProject = welcomeWidgetProject?.id === selectedThreadProjectId
                  ? welcomeWidgetProject
                  : null;
                const nextProjectRecord = getPlaygroundProjectResponseRecord(data, fallbackProject);
                if (!nextProjectRecord?.id || controller.signal.aborted) {
                  return;
                }
                setThreadProjectRecordsById((current) => ({
                  ...current,
                  [selectedThreadProjectId]: mergePlaygroundProjectRecords({
                    ...nextProjectRecord,
                    __projectDetailsLoaded: true,
                  }, current[selectedThreadProjectId]) || nextProjectRecord,
                }));
              } catch {}
            })();
  
            return () => controller.abort();
          }, [
            activePage,
            authRequestHeaders,
            cachedSelectedThreadProjectRecord,
            hasRealAccess,
            proxyBackendBase,
            selectedThreadProjectId,
            welcomeWidgetProject,
          ]);
  
          useEffect(() => {
            if (typeof document === "undefined" || activePage === "tasks") {
              return undefined;
            }
            const rootStyle = document.documentElement.style;
            const fallbackBackground = "#000000";
            const nextBackground = activePage === "thread"
              ? fallbackBackground
              : isAgentShellContext
                ? PLAYGROUND_AGENTS_SHELL_BACKGROUND
                : fallbackBackground;
            rootStyle.setProperty(
              "--playground-app-bg",
              nextBackground
            );
            return () => {
              rootStyle.setProperty("--playground-app-bg", fallbackBackground);
            };
          }, [activePage, isAgentShellContext, selectedThreadShellBackground]);
  
          useEffect(() => {
            if (
              activePage !== "thread"
              || !hasRealAccess
              || !activeRunnerThreadId
              || !selectedThreadTaskPreviewTaskId
              || selectedThreadTaskPreviewDeleted
            ) {
              return;
            }
  
            if (selectedThreadTaskPreviewFetchThreadIdRef.current !== activeRunnerThreadId) {
              selectedThreadTaskPreviewFetchThreadIdRef.current = activeRunnerThreadId;
              selectedThreadTaskPreviewFetchKeysRef.current.clear();
            }
  
  	          const selectedThreadTaskPreviewVersionKey = [
  	            selectedKnownThread?.status || "",
  	            selectedKnownThread?.updatedAt || "",
  	            selectedKnownThread?.completedAt || "",
  	          ].join(":");
  	          const previewFetchKey = activeRunnerThreadId + ":" + selectedThreadTaskPreviewTaskId + ":" + selectedThreadTaskPreviewVersionKey;
            if (selectedThreadTaskPreviewFetchKeysRef.current.has(previewFetchKey)) {
              return;
            }
            selectedThreadTaskPreviewFetchKeysRef.current.add(previewFetchKey);
  
            let cancelled = false;
  
            const syncTaskPreview = async () => {
              try {
                const latestTaskPreview = selectedThreadTaskPreviewRef.current;
                if (!latestTaskPreview || latestTaskPreview.isDeleted) {
                  return;
                }
                const response = await fetch(proxyBackendBase + "/tasks/" + encodeURIComponent(selectedThreadTaskPreviewTaskId), {
                  method: "GET",
                  headers: authRequestHeaders,
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  if (response.status === 404 && !cancelled && !latestTaskPreview.isDeleted) {
                    markThreadTaskPreviewDeleted(activeRunnerThreadId, latestTaskPreview);
                    setThreadTaskOpenRequest((current) => (
                      current && String(current.taskId || "").trim() === selectedThreadTaskPreviewTaskId
                        ? null
                        : current
                    ));
                  }
                  return;
                }
                const taskRecord = getPlaygroundTaskResponseRecord(data);
                if (!taskRecord?.id || cancelled) {
                  return;
                }
                const nextPreview = buildLiveThreadTaskPreview(taskRecord, latestTaskPreview, activeRunnerThreadId);
                if (cancelled) {
                  return;
                }
                upsertThreadTaskPreview(activeRunnerThreadId, nextPreview);
              } catch {}
            };
  
            void syncTaskPreview();
  
            return () => {
              cancelled = true;
            };
          }, [
            activePage,
            activeRunnerThreadId,
            authRequestHeaders,
            buildLiveThreadTaskPreview,
            hasRealAccess,
            markThreadTaskPreviewDeleted,
  	          proxyBackendBase,
  	          selectedKnownThread?.completedAt,
  	          selectedKnownThread?.status,
  	          selectedKnownThread?.updatedAt,
  	          selectedThreadTaskPreviewDeleted,
  	          selectedThreadTaskPreviewTaskId,
  	          upsertThreadTaskPreview,
          ]);
  
          useEffect(() => {
            if (!selectedThreadTaskPreview || activePage !== "thread") {
              return;
            }
            if (selectedThreadTaskPreview.environmentId) {
              setEnvironmentId(selectedThreadTaskPreview.environmentId);
            }
          }, [activePage, selectedThreadTaskPreview]);
  
          useEffect(() => {
            if (activePage === "thread") {
              return;
            }
            setThreadAgentSelectionOverride(null);
          }, [activePage]);
  
          useEffect(() => {
            if (!threadTaskOpenRequest) {
              return;
            }
            if (activePage !== "thread") {
              setThreadTaskOpenRequest(null);
              return;
            }
            if (threadTaskOpenRequest.threadId && activeRunnerThreadId && threadTaskOpenRequest.threadId !== activeRunnerThreadId) {
              setThreadTaskOpenRequest(null);
            }
          }, [activePage, activeRunnerThreadId, threadTaskOpenRequest]);
  
          useEffect(() => {
            if (!threadTaskOpenRequest) {
              return undefined;
            }
  
            function handleThreadTaskDetailEscape(event) {
              if (event.key === "Escape") {
                setThreadTaskOpenRequest(null);
              }
            }
  
            window.addEventListener("keydown", handleThreadTaskDetailEscape);
            return () => window.removeEventListener("keydown", handleThreadTaskDetailEscape);
          }, [threadTaskOpenRequest]);
  
          useEffect(() => {
            if (activePage !== "thread") {
              setThreadSubagentDetailOpen(false);
              setThreadDeepResearchDetailOpen(false);
              setThreadDocumentPreviewOpen(false);
            }
          }, [activePage]);
          useEffect(() => {
            if (threadTaskOpenRequest) {
              setThreadSubagentDetailOpen(false);
            }
          }, [threadTaskOpenRequest]);
          useEffect(() => {
            if (activePage !== "thread") {
              setThreadPreviewAttachment(null);
            }
          }, [activePage]);
          useEffect(() => {
            if (threadTaskOpenRequest || threadSubagentDetailOpen || threadDeepResearchDetailOpen || threadDocumentPreviewOpen) {
              setThreadPreviewAttachment(null);
            }
          }, [threadDeepResearchDetailOpen, threadDocumentPreviewOpen, threadSubagentDetailOpen, threadTaskOpenRequest]);
          const threadActionTarget = useMemo(() => {
            if (!threadActionMenuState?.threadId) {
              return null;
            }
            return baseThreadItems.find((thread) => thread.id === threadActionMenuState.threadId)
              || (threadActionMenuState.threadRecord ? normalizeThreadItem(threadActionMenuState.threadRecord) : null)
              || normalizeThreadItem({
                id: threadActionMenuState.threadId,
                title: "Thread",
              });
          }, [baseThreadItems, threadActionMenuState]);
          const isThreadRenamePending = threadMutationState.action === "rename"
            && threadMutationState.threadId === threadRenameState?.threadId;
  
          const visibleThreadItems = recentThreadItems;
          const displayedThreadItems = visibleThreadItems.slice(0, threadDisplayCount);
  ${METRONOME_APP_SCRIPT_FRAGMENTS.sidebarState}
          const hasMoreThreadItems =
            displayedThreadItems.length < visibleThreadItems.length || realThreadsHasMore;
          const sidebarEmptyStateCopy = isThreadsLoading
            ? "Loading threads…"
            : hasDemoAccess
              ? "Explore seeded demo threads."
              : !hasRealAccess
              ? sessionState.status === "loading"
                ? "Checking your account..."
                : "Sign in to load your threads."
              : "No threads yet.";
          const isThreadTaskDetailOpen = activePage === "thread" && Boolean(threadTaskOpenRequest) && hasRealAccess;
          const isThreadSubagentDetailOpen =
            activePage === "thread" &&
            Boolean(threadSubagentDetailOpen) &&
            !threadDeepResearchDetailOpen &&
            !threadTaskOpenRequest &&
            hasRealAccess;
          const isThreadDeepResearchDetailOpen =
            activePage === "thread" &&
            Boolean(threadDeepResearchDetailOpen) &&
            !threadTaskOpenRequest &&
            !threadSubagentDetailOpen &&
            hasRealAccess;
          const isThreadDocumentPreviewDetailOpen =
            activePage === "thread" &&
            Boolean(threadDocumentPreviewOpen) &&
            !threadTaskOpenRequest &&
            !threadSubagentDetailOpen &&
            !threadDeepResearchDetailOpen &&
            hasRealAccess;
          const isThreadSideDetailOpen = isThreadTaskDetailOpen || isThreadSubagentDetailOpen || isThreadDeepResearchDetailOpen || isThreadDocumentPreviewDetailOpen;
          const isResourcesSideDetailOpen = activePage === "resources" && Boolean(resourcesHeaderState?.sideDetailOpen) && hasRealAccess;
  
