export const PROJECTS_DATA_04_FRAGMENT = `          setPendingExternalTaskOpenRequest({
            projectId: openTaskRequest.projectId,
            taskId: openTaskRequest.taskId,
          });
        }, [openTaskRequest]);

        useEffect(() => {
          selectedTaskIdRef.current = selectedTaskId;
        }, [selectedTaskId]);

        useEffect(() => {
          if (
            !selectedTaskId
            || (
              taskView !== "overview"
              && taskView !== "backlog"
              && taskView !== "board"
            )
          ) {
            setProjectTaskDetailScreenOpen(false);
          }
        }, [selectedTaskId, taskView]);

        const isTaskKeyboardNavigationBlocked = Boolean(
          boardToolbarPopover
          || backlogToolbarPopover
          || releaseBacklogToolbarPopover
          || backlogTaskContextMenu
          || taskStatusMenuState
          || taskDetailPopover
          || taskDetailSelectPopover
          || taskSkillsPopoverOpen
          || taskParentPickerState
          || boardBlockedPickerState
          || taskDeleteDialogState
          || taskScheduleDialogState
          || taskEnvironmentFilePickerOpen
          || taskEnvironmentChangeDialog
          || taskConnectorBrowserOpen
          || projectEnvironmentFilePickerOpen
        );

        useEffect(() => {
          const activeTaskNavigationIds = taskView === "board"
            ? boardNavigationTaskIds
            : taskView === "backlog"
              ? backlogNavigationTaskIds
              : [];

          if (
            (taskView !== "board" && taskView !== "backlog")
            || !selectedProjectId
            || !selectedTaskId
            || activeTaskNavigationIds.length < 2
            || isTaskKeyboardNavigationBlocked
          ) {
            return undefined;
          }

          function handleTaskNavigationKeyDown(event) {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
              return;
            }
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
              return;
            }
            if (isBoardTaskKeyboardNavigationBlockedTarget(event.target)) {
              return;
            }

            const currentSelectedTaskId = selectedTaskIdRef.current || selectedTaskId;
            const currentTaskIndex = activeTaskNavigationIds.indexOf(currentSelectedTaskId);
            if (currentTaskIndex === -1) {
              return;
            }

            const nextTaskIndex = event.key === "ArrowUp"
              ? currentTaskIndex - 1
              : currentTaskIndex + 1;
            if (nextTaskIndex < 0 || nextTaskIndex >= activeTaskNavigationIds.length) {
              return;
            }

            const nextTaskId = activeTaskNavigationIds[nextTaskIndex];
            if (!nextTaskId || nextTaskId === currentSelectedTaskId) {
              return;
            }

            event.preventDefault();
            handleSelectTask(nextTaskId, { screen: projectTaskDetailScreenOpen });
          }

          window.addEventListener("keydown", handleTaskNavigationKeyDown);
          return () => window.removeEventListener("keydown", handleTaskNavigationKeyDown);
        }, [
          backlogNavigationTaskIds,
          backlogTaskContextMenu,
          backlogToolbarPopover,
          boardBlockedPickerState,
          boardNavigationTaskIds,
          boardToolbarPopover,
          isTaskKeyboardNavigationBlocked,
          projectEnvironmentFilePickerOpen,
          projectTaskDetailScreenOpen,
          releaseBacklogToolbarPopover,
          selectedProjectId,
          selectedTaskId,
          taskStatusMenuState,
          taskConnectorBrowserOpen,
          taskDeleteDialogState,
          taskDetailPopover,
          taskDetailSelectPopover,
          taskEnvironmentChangeDialog,
          taskEnvironmentFilePickerOpen,
          taskParentPickerState,
          taskScheduleDialogState,
          taskSkillsPopoverOpen,
          taskView,
        ]);

        useEffect(() => {
          if (!projectTaskDetailScreenOpen || !selectedProjectId || !selectedTaskId || !draftTask) {
            return undefined;
          }

          function handleTaskDetailShortcut(event) {
            if (
              event.defaultPrevented
              || event.metaKey
              || event.ctrlKey
              || event.altKey
              || event.repeat
            ) {
              return;
            }

            const key = String(event.key || "").toLowerCase();
            if (taskDetailSelectPopover === "status" && /^[1-5]$/.test(key)) {
              const statusOption = PLAYGROUND_TASK_MANUAL_STATUS_OPTIONS[Number(key) - 1];
              if (!statusOption) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              selectTaskDetailStatus(statusOption.id);
              return;
            }
            if (taskDetailSelectPopover === "type" && /^[1-3]$/.test(key)) {
              const typeOption = PLAYGROUND_TASK_TYPE_OPTIONS[Number(key) - 1];
              if (!typeOption) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              handleTaskTypeSelection(typeOption.id);
              return;
            }
            if (taskDetailSelectPopover === "priority" && /^[1-4]$/.test(key)) {
              const priorityOption = PLAYGROUND_TASK_PRIORITY_OPTIONS[Number(key) - 1];
              if (!priorityOption) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              selectTaskDetailPriority(priorityOption.id);
              return;
            }

            const shortcutPopoverId = key === "s"
              ? "status"
              : (key === "t" ? "type" : (key === "p" ? "priority" : ""));
            if (
              !shortcutPopoverId
              || event.shiftKey
              || isTaskKeyboardNavigationBlocked
              || isBoardTaskKeyboardNavigationBlockedTarget(event.target)
              || document.querySelector(".platform-modal-backdrop.is-visible, [role='dialog'][aria-modal='true']")
            ) {
              return;
            }

            event.preventDefault();
            if (shortcutPopoverId === "status") {
              setTaskDetailStatusSearchQuery("");
            } else if (shortcutPopoverId === "type") {
              setTaskDetailTypeSearchQuery("");
            } else {
              setTaskDetailPrioritySearchQuery("");
            }
            setTaskDetailSelectPopover(shortcutPopoverId);
          }

          window.addEventListener("keydown", handleTaskDetailShortcut, true);
          return () => window.removeEventListener("keydown", handleTaskDetailShortcut, true);
        }, [
          draftTask?.id,
          isTaskKeyboardNavigationBlocked,
          projectTaskDetailScreenOpen,
          selectedProjectId,
          selectedTaskId,
          taskDetailSelectPopover,
        ]);

        useEffect(() => {
          scheduleDraftRef.current = scheduleDraft;
        }, [scheduleDraft]);

        useEffect(() => () => {
          if (scheduleAutosaveTimerRef.current) {
            window.clearTimeout(scheduleAutosaveTimerRef.current);
            scheduleAutosaveTimerRef.current = null;
          }
        }, []);

	        useEffect(() => {
	          if (!selectedProjectId || !selectedTaskId || taskView === "threads") {
	            taskDetailAutoLoadKeyRef.current = "";
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	            selectedTaskId,
	            taskView,
	          ].join("|");
	          if (taskDetailAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          taskDetailAutoLoadKeyRef.current = loadKey;

	          let isActive = true;
	          void loadTaskDetails(selectedTaskId).catch((error) => {
            if (!isActive) {
              return;
            }
            console.warn("Failed to refresh task details", error);
          });

          return () => {
            isActive = false;
          };
	        }, [backendUrl, requestHeaders, requestHeadersKey, selectedProjectId, selectedTaskId, taskView]);

        useEffect(() => {
          if (!projectTaskDetailScreenOpen || !selectedProjectId || !selectedTaskId) {
            setTaskActivitySubscriptionState({
              taskId: "",
              status: "idle",
              subscribed: false,
              error: "",
            });
            return undefined;
          }

          const taskId = String(selectedTaskId || "").trim();
          const controller = new AbortController();
          setTaskActivitySubscriptionState((current) => ({
            taskId,
            status: "loading",
            subscribed: current.taskId === taskId ? current.subscribed : false,
            error: "",
          }));

          void (async () => {
            try {
              const response = await fetch(
                backendUrl + "/tasks/" + encodeURIComponent(taskId) + "/activity-subscription",
                {
                  method: "GET",
                  headers: requestHeaders,
                  signal: controller.signal,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load ticket subscription.");
              }
              if (!controller.signal.aborted && selectedTaskIdRef.current === taskId) {
                setTaskActivitySubscriptionState({
                  taskId,
                  status: "ready",
                  subscribed: Boolean(data?.subscribed),
                  error: "",
                });
              }
            } catch (error) {
              if (controller.signal.aborted) {
                return;
              }
              setTaskActivitySubscriptionState((current) => (
                current.taskId === taskId
                  ? {
                      ...current,
                      status: "error",
                      error: error instanceof Error ? error.message : "Failed to load ticket subscription.",
                    }
                  : current
              ));
            }
          })();

          return () => controller.abort();
        }, [
          backendUrl,
          projectTaskDetailScreenOpen,
          requestHeadersKey,
          selectedProjectId,
          selectedTaskId,
        ]);

        useEffect(() => {
          const requestToken = String(navigationRequest?.token || "").trim();
          if (!requestToken) {
            return;
          }

          const requestedProjectId = String(navigationRequest?.projectId || "").trim();
          const requestedTaskId = String(navigationRequest?.taskId || "").trim();
          const requestedTaskDetailMode = navigationRequest?.taskDetailMode === "screen"
            ? "screen"
            : "default";
          const requestedView = navigationRequest?.view === "calendar"
            ? "calendar"
            : navigationRequest?.view === "overview"
              ? "overview"
              : "backlog";
          const nextView = isStandaloneCalendarMode
            ? "calendar"
            : (requestedView === "calendar" ? "backlog" : requestedView);
          const requestedMissionControlAction = navigationRequest?.missionControlAction === "run"
            ? "run"
            : navigationRequest?.missionControlAction === "open"
              ? "open"
              : "";
          const requestedProjectComposerAction = navigationRequest?.projectComposerAction === "create"
            ? "create"
            : navigationRequest?.projectComposerAction === "edit"
              ? "edit"
            : navigationRequest?.projectComposerAction === "restore-connector"
              ? "restore-connector"
              : "";
          const requestedProjectRecord = navigationRequest?.projectRecord && typeof navigationRequest.projectRecord === "object" && !Array.isArray(navigationRequest.projectRecord)
            ? normalizePlaygroundProjectRecord(navigationRequest.projectRecord)
            : null;
          const matchingRequestedProjectRecord = requestedProjectRecord?.id && requestedProjectRecord.id === requestedProjectId
            ? requestedProjectRecord
            : null;
          const requestedTaskRecord = navigationRequest?.taskRecord && typeof navigationRequest.taskRecord === "object" && !Array.isArray(navigationRequest.taskRecord)
            ? normalizePlaygroundTaskRecord({
                ...navigationRequest.taskRecord,
                id: requestedTaskId,
                projectId: requestedProjectId,
              })
            : null;
          const matchingRequestedTaskRecord = requestedTaskRecord?.id === requestedTaskId
            && requestedTaskRecord.projectId === requestedProjectId
              ? requestedTaskRecord
              : null;
          const requestedProjectComposerConnectorRestoreState = requestedProjectComposerAction === "restore-connector"
            ? normalizePlaygroundProjectComposerConnectorRestoreState(navigationRequest?.projectComposerConnectorRestoreState)
            : null;
          const requestedProjectComposerDraft = navigationRequest?.projectComposerDraft && typeof navigationRequest.projectComposerDraft === "object" && !Array.isArray(navigationRequest.projectComposerDraft)
            ? {
                name: String(navigationRequest.projectComposerDraft.name || "").trim(),
                description: String(navigationRequest.projectComposerDraft.description || navigationRequest.projectComposerDraft.goal || "").trim(),
              }
            : null;

          console.info("[connector-debug] tasks navigation request received", {
            requestToken,
            requestedProjectId,
            requestedView,
            nextView,
            selectedProjectId,
            currentTaskView: taskView,
            requestedTaskId,
            activePage: "tasks",
          });

          if (requestedProjectId) {
            if (matchingRequestedProjectRecord) {
              commitLocalProjectRecord(matchingRequestedProjectRecord, {
                summary: matchingRequestedProjectRecord.summary,
                selectImmediately: true,
              });
            }
            handleSelectProject(requestedProjectId, {
              taskRecord: matchingRequestedTaskRecord,
              taskView: nextView,
              openTaskScreen: requestedTaskDetailMode === "screen",
            });
          } else {
            handleSelectProject("");
          }

          setTaskView(nextView);
          setPendingExternalTaskOpenRequest(
            requestedProjectId && requestedTaskId && !matchingRequestedTaskRecord
              ? {
                  projectId: requestedProjectId,
                  taskId: requestedTaskId,
                  screen: requestedTaskDetailMode === "screen",
                }
              : null
          );
          if (requestedView === "calendar") {
            if (!requestedTaskId) {
              setSelectedTaskId("");
            }
            setSelectedScheduleId("");
            setScheduleViewMode("calendar");
            setScheduleEditorMode("create");
            resetScheduleSaveState("");
          }

          setPendingNavigationMissionControlRequest(
            requestedMissionControlAction && requestedProjectId
              ? {
                  token: requestToken,
                  action: requestedMissionControlAction,
                  projectId: requestedProjectId,
                  projectRecord: matchingRequestedProjectRecord,
                }
              : null
          );
          setPendingNavigationProjectComposerRequest(
            requestedProjectComposerAction === "create"
              ? {
                  token: requestToken,
                  action: "create",
                  draft: requestedProjectComposerDraft,
                }
              : requestedProjectComposerAction === "edit" && requestedProjectId
                ? {
                    token: requestToken,
                    action: "edit",
                    projectId: requestedProjectId,
                    projectRecord: matchingRequestedProjectRecord,
                  }
              : requestedProjectComposerConnectorRestoreState
                ? {
                    token: requestToken,
                    action: "restore-connector",
                    restoreState: requestedProjectComposerConnectorRestoreState,
                  }
                : null
          );
          if (typeof onNavigationRequestHandled === "function") {
            onNavigationRequestHandled(requestToken);
          }
        }, [isStandaloneCalendarMode, navigationRequest, onNavigationRequestHandled]);

        useEffect(() => {
          setProjectOverviewThreadPagination((current) => ({
            pageIndex: 0,
            pageSize: Math.max(1, Number(current?.pageSize) || 5),
          }));
          setProjectOverviewVisibleActivityCount(5);
        }, [selectedProjectId, taskView]);

        useEffect(() => {
          setProjectOverviewHomeTab("general");
          setProjectOverviewPermissionTeamId("");
          setProjectOverviewPermissionRoleId("member");
          projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
        }, [selectedProjectId]);

        useEffect(() => {
          const pendingRequestToken = String(pendingNavigationMissionControlRequest?.token || "").trim();
          const pendingProjectId = String(pendingNavigationMissionControlRequest?.projectId || "").trim();
          if (!pendingRequestToken || !pendingProjectId) {
            return;
          }
          if (selectedProjectId !== pendingProjectId || taskView !== "backlog") {
            return;
          }
          const pendingProjectRecord = pendingNavigationMissionControlRequest?.projectRecord && typeof pendingNavigationMissionControlRequest.projectRecord === "object" && !Array.isArray(pendingNavigationMissionControlRequest.projectRecord)
            ? normalizePlaygroundProjectRecord(pendingNavigationMissionControlRequest.projectRecord)
            : null;
          const resolvedPendingProject = pendingProjectRecord?.id === pendingProjectId
            ? pendingProjectRecord
            : selectedProject?.id === pendingProjectId
              ? selectedProject
              : selectedProjectSnapshot?.id === pendingProjectId
                ? selectedProjectSnapshot
                : projects.find((project) => project?.id === pendingProjectId) || null;
          if (!resolvedPendingProject?.id) {
            return;
          }
          if (pendingProjectRecord?.id === pendingProjectId) {
            commitLocalProjectRecord(pendingProjectRecord, {
              summary: pendingProjectRecord.summary,
              selectImmediately: true,
            });
          }
          if (pendingNavigationMissionControlRequest?.action === "open") {
            openMissionControlStrategySidebar();
            setPendingNavigationMissionControlRequest(null);
            return;
          }
          const didOpen = openMissionControlComposer({
            keepStrategyOpen: true,
            projectRecord: resolvedPendingProject,
          });
          if (didOpen === false) {
            return;
          }
          setPendingNavigationMissionControlRequest(null);
        }, [pendingNavigationMissionControlRequest, projects, selectedProject, selectedProjectId, selectedProjectSnapshot, taskView]);

        useEffect(() => {
          const pendingRequestToken = String(pendingNavigationProjectComposerRequest?.token || "").trim();
          if (!pendingRequestToken) {
            return;
          }
          const pendingAction = pendingNavigationProjectComposerRequest?.action === "restore-connector"
            ? "restore-connector"
            : pendingNavigationProjectComposerRequest?.action === "edit"
              ? "edit"
              : "create";
          if (pendingAction === "restore-connector") {
            const restoreState = normalizePlaygroundProjectComposerConnectorRestoreState(pendingNavigationProjectComposerRequest?.restoreState);
            const restoredProjectId = String(restoreState?.projectDraft?.id || "").trim();
            if (!restoreState) {
              setPendingNavigationProjectComposerRequest(null);
              return;
            }
            if (restoreState.projectComposerMode === "edit" && restoredProjectId && selectedProjectId !== restoredProjectId) {
              return;
            }
            openProjectComposerConnectorBrowserRestore(restoreState);
            setPendingNavigationProjectComposerRequest(null);
            return;
          }
          if (pendingAction === "edit") {
            const pendingProjectId = String(pendingNavigationProjectComposerRequest?.projectId || "").trim();
            if (!pendingProjectId || selectedProjectId !== pendingProjectId) {
              return;
            }
            const pendingProjectRecord = pendingNavigationProjectComposerRequest?.projectRecord && typeof pendingNavigationProjectComposerRequest.projectRecord === "object" && !Array.isArray(pendingNavigationProjectComposerRequest.projectRecord)
              ? normalizePlaygroundProjectRecord(pendingNavigationProjectComposerRequest.projectRecord)
              : null;
            const resolvedProject = pendingProjectRecord?.id === pendingProjectId
              ? pendingProjectRecord
              : selectedProject?.id === pendingProjectId
                ? selectedProject
                : selectedProjectSnapshot?.id === pendingProjectId
                  ? selectedProjectSnapshot
                  : projects.find((project) => project?.id === pendingProjectId) || null;
            if (!resolvedProject?.id) {
              return;
            }
            openProjectComposerForEdit(resolvedProject);
            setPendingNavigationProjectComposerRequest(null);
            return;
          }
          if (selectedProjectId) {
            return;
          }
          openProjectComposer(pendingNavigationProjectComposerRequest?.draft || {});
          setPendingNavigationProjectComposerRequest(null);
        }, [pendingNavigationProjectComposerRequest, projects, selectedProject, selectedProjectId, selectedProjectSnapshot]);

        useEffect(() => {
          if (!selectedScheduleId) return;
          if (schedulesById[selectedScheduleId]) return;
          setSelectedScheduleId("");
          setScheduleViewMode("calendar");
          setScheduleEditorMode("create");
        }, [schedulesById, selectedScheduleId]);

        useEffect(() => {
          setIsScheduleTaskEditing(false);
          setIsScheduleDescriptionEditing(false);
          setScheduleDetailsCollapsed(false);
          setTaskDetailSelectPopover("");
        }, [scheduleViewMode, selectedScheduleId]);

        useEffect(() => {
          setTaskDetailSelectPopover("");
        }, [scheduleDetailsCollapsed]);

        useEffect(() => {
          if (!selectedReleaseId) return;
          if (releasesById[selectedReleaseId]) return;
          setSelectedReleaseId("");
        }, [releasesById, selectedReleaseId]);

        useEffect(() => {
          if (!selectedProjectId || tasks.length === 0) {
            setSelectedTaskId("");
            setProjectTaskDetailScreenOpen(false);
            setDraftTask(null);
            return;
          }
          if (selectedTaskId && tasksById[selectedTaskId]) {
            return;
          }
          if (selectedTaskId && !tasksById[selectedTaskId]) {
            setSelectedTaskId("");
            setProjectTaskDetailScreenOpen(false);
          }
        }, [selectedProjectId, selectedTaskId, tasks, tasksById]);

        useEffect(() => {
          if (selectedTaskId || !projectOverviewSidebarAutoCollapsedForTaskRef.current) {
            return;
          }
          projectOverviewSidebarAutoCollapsedForTaskRef.current = false;
          setProjectOverviewSidebarCollapsed(false);
        }, [selectedTaskId]);

        useEffect(() => {
          if (!pendingExternalTaskOpenRequest) {
            return;
          }
          if (selectedProjectId !== pendingExternalTaskOpenRequest.projectId) {
            return;
          }
          if (!tasksById[pendingExternalTaskOpenRequest.taskId]) {
            return;
          }
          handleSelectTask(pendingExternalTaskOpenRequest.taskId, {
            screen: pendingExternalTaskOpenRequest.screen === true,
          });
          setPendingExternalTaskOpenRequest(null);
        }, [pendingExternalTaskOpenRequest, selectedProjectId, tasksById]);

        useEffect(() => {
          if (!selectedTaskSnapshot) {
            const shouldResetTaskConnectorBrowser = !(projectConnectorBrowserActiveRef.current || taskConnectorBrowserMode === "project" || taskConnectorBrowserMode === "project-composer");
            setTaskDetailPopover("");
            setTaskSkillsPopoverOpen(false);
            if (shouldResetTaskConnectorBrowser) {
              setTaskConnectorBrowserOpen(false);
            }
            setTaskParentPickerState(null);
            setPreviewedTaskAttachmentId("");
            setTaskEnvironmentFilePickerOpen(false);
            setTaskEnvironmentFilePickerInventory([]);
            setTaskEnvironmentFilePickerState({
              status: "idle",
              error: "",
            });
            setTaskEnvironmentFilePickerSearch("");
            setTaskEnvironmentFilePickerExpandedFolders([]);
            setTaskEnvironmentFilePickerSelectedPaths([]);
            setTaskEnvironmentChangeDialog(null);
            setTaskDeleteDialogState(null);
            setTaskScheduleDialogState(null);
            setTaskScheduleDialogPhase("idle");
            if (shouldResetTaskConnectorBrowser) {
              setTaskConnectorBrowserHistory([{ source: "github", folderId: null }]);
              setTaskConnectorBrowserHistoryIndex(0);
              setTaskConnectorBrowserSearchQuery("");
              setTaskConnectorBrowserPreviewId("");
              setTaskConnectorBrowserExpandedFolderIds([]);
              setTaskConnectorBrowserSelectedIds({
                github: [],
                googleDrive: [],
                oneDrive: [],
              });
              setTaskConnectorBrowserSelectedNotionId("");
              setTaskConnectorBrowserPreviewState({
                status: "idle",
                kind: "",
                content: "",
                error: "",
              });
            }
            if (taskScheduleDialogTimerRef.current) {
              window.clearTimeout(taskScheduleDialogTimerRef.current);
              taskScheduleDialogTimerRef.current = null;
            }
            setIsTaskAttachmentDragging(false);
            revokeTaskAttachmentListObjectUrls(draftTask?.attachments);
            setDraftTask(null);
            return;
          }
          if (draftTask?.id === selectedTaskSnapshot.id && editorDirtyRef.current) {
            return;
          }
          if (draftTask?.id && draftTask.id !== selectedTaskSnapshot.id) {
            revokeTaskAttachmentListObjectUrls(draftTask?.attachments);
            setPreviewedTaskAttachmentId("");
          }
          editorDirtyRef.current = false;
          resetSaveState("");
          setDraftTask(normalizePlaygroundTaskRecord({
            ...selectedTaskSnapshot,
            ticketNumber: taskTicketNumbersById[selectedTaskSnapshot.id] || selectedTaskSnapshot.ticketNumber,
          }));
        }, [draftTask?.id, selectedTaskSnapshot, taskConnectorBrowserMode, taskTicketNumbersById]);

        useEffect(() => {
          if (!draftTask?.id || draftTask.assigneeAgentId || !defaultTaskAssigneeId) {
            return;
          }
          updateDraftField("assigneeAgentId", defaultTaskAssigneeId, { autosave: true });
        }, [defaultTaskAssigneeId, draftTask?.assigneeAgentId, draftTask?.id]);

        useEffect(() => {
          setTaskTitleInputValue(draftTask?.title || "");
        }, [draftTask?.id, draftTask?.title]);

        useEffect(() => {
          setTaskCommentInputValue("");
        }, [draftTask?.id]);

        useEffect(() => {
          setIsTaskDescriptionEditing(false);
          setTaskDetailsCollapsed(false);
        }, [draftTask?.id]);

        useEffect(() => {
          if (!backlogEditingTaskId) {
            return;
          }
          const activeBacklogTask = tasks.find((task) => task.id === backlogEditingTaskId);
          if (!activeBacklogTask) {
            setBacklogEditingTaskId("");
            setBacklogTitleInputValue("");
            return;
          }
          setBacklogTitleInputValue(activeBacklogTask.title || "");
        }, [backlogEditingTaskId, tasks]);

        useEffect(() => {
          setBacklogDraggingTaskId("");
          setBacklogDropTargetKey("");
        }, [backlogFilterMode, backlogSortMode, normalizedSearchQuery, selectedProjectId]);

        useEffect(() => {
          setBoardDraggingTaskId("");
          setBoardDropLaneId("");
          setBoardBlockedPickerState(null);
        }, [boardFilterMode, normalizedSearchQuery, selectedProjectId, selectedReleaseId]);

        useEffect(() => {
          if (!boardBlockedPickerState?.taskId) {
            return;
          }
          if (!tasksById[boardBlockedPickerState.taskId]) {
            setBoardBlockedPickerState(null);
          }
        }, [boardBlockedPickerState?.taskId, tasksById]);

        useEffect(() => {
          if (!taskEnvironmentFilePickerOpen) {
            return undefined;
          }

          if (!activeTaskEnvironmentId) {
            setTaskEnvironmentFilePickerInventory([]);
            setTaskEnvironmentFilePickerState({
              status: "error",
              error: "Select an environment before browsing files.",
            });
            return undefined;
          }

          const controller = new AbortController();
          setTaskEnvironmentFilePickerState({
            status: "loading",
            error: "",
          });
          setTaskEnvironmentFilePickerSelectedPaths([]);
          setTaskEnvironmentFilePickerExpandedFolders([]);

          void fetch(
            buildPlaygroundEnvironmentFilesListUrl(backendUrl, activeTaskEnvironmentId, "", -1),
            {
              method: "GET",
              headers: requestHeaders,
              signal: controller.signal,
            }
          )
            .then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment files.");
              }
              if (controller.signal.aborted) {
                return;
              }
              setTaskEnvironmentFilePickerInventory(normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data));
              setTaskEnvironmentFilePickerState({
                status: "ready",
                error: "",
              });
            })
            .catch((error) => {
              if (controller.signal.aborted) {
                return;
              }
              setTaskEnvironmentFilePickerInventory([]);
              setTaskEnvironmentFilePickerState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load environment files.",
              });
            });

          return () => controller.abort();
        }, [activeTaskEnvironmentId, backendUrl, requestHeaders, taskEnvironmentFilePickerOpen]);

        useEffect(() => {
          if (!projectEnvironmentFilePickerOpen) {
            return undefined;
          }

          if (!activeProjectAttachmentEnvironmentId) {
            setProjectEnvironmentFilePickerInventory([]);
            setProjectEnvironmentFilePickerState({
              status: "error",
              error: "Select a default environment before browsing files.",
            });
            return undefined;
          }

          const controller = new AbortController();
          setProjectEnvironmentFilePickerState({
            status: "loading",
            error: "",
          });
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectEnvironmentFilePickerExpandedFolders([]);

          void fetch(
            buildPlaygroundEnvironmentFilesListUrl(backendUrl, activeProjectAttachmentEnvironmentId, "", -1),
            {
              method: "GET",
              headers: requestHeaders,
              signal: controller.signal,
            }
          )
            .then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment files.");
              }
              if (controller.signal.aborted) {
                return;
              }
              setProjectEnvironmentFilePickerInventory(normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data));
              setProjectEnvironmentFilePickerState({
                status: "ready",
                error: "",
              });
            })
            .catch((error) => {
              if (controller.signal.aborted) {
                return;
              }
              setProjectEnvironmentFilePickerInventory([]);
              setProjectEnvironmentFilePickerState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load environment files.",
              });
            });

          return () => controller.abort();
        }, [activeProjectAttachmentEnvironmentId, backendUrl, projectEnvironmentFilePickerOpen, requestHeaders]);

        useEffect(() => {
          if (!taskConnectorBrowserOpen && !projectConnectorBrowserDialog) {
            return undefined;
          }

          if (taskConnectorBrowserCurrentSource === "notion") {
            const notionConfig = taskConnectorConfigByKey.notion;
            if (!notionConfig?.connected || !notionConfig?.fetchDatabases || taskConnectorBrowserNotionDatabasesLoaded || taskConnectorBrowserLoadingState.notion) {
              return undefined;
            }
            void loadTaskConnectorNotionDatabases();
            return undefined;
          }

          const currentConfig = taskConnectorBrowserCurrentConfig;
          if (!currentConfig?.connected || !currentConfig?.fetchItems) {
            return undefined;
          }

          const normalizedFolderId = taskConnectorBrowserCurrentFolderId || "root";
          const loadedFolderIds = taskConnectorBrowserLoadedFolderIds[taskConnectorBrowserCurrentKey] || [];
          const loadingFolderIds = taskConnectorBrowserLoadingFolderIds[taskConnectorBrowserCurrentKey] || [];
          if (loadedFolderIds.includes(normalizedFolderId) || loadingFolderIds.includes(normalizedFolderId)) {
            return undefined;
          }

          void loadTaskConnectorFolder(taskConnectorBrowserCurrentSource, normalizedFolderId);
          return undefined;
        }, [
          loadTaskConnectorFolder,
          loadTaskConnectorNotionDatabases,
          taskConnectorBrowserCurrentConfig,
          taskConnectorBrowserCurrentFolderId,
          taskConnectorBrowserCurrentKey,
          taskConnectorBrowserCurrentSource,
          taskConnectorBrowserLoadedFolderIds,
          taskConnectorBrowserLoadingFolderIds,
          taskConnectorBrowserLoadingState.notion,
          taskConnectorBrowserNotionDatabasesLoaded,
          taskConnectorBrowserOpen,
          projectConnectorBrowserDialog,
          taskConnectorConfigByKey.notion,
        ]);

        useEffect(() => {
          if (!taskConnectorBrowserPreviewId) {
            setTaskConnectorBrowserPreviewState({
              status: "idle",
              kind: "",
              content: "",
              error: "",
            });
            return;
          }
          if (taskConnectorBrowserItems.some((item) => item.id === taskConnectorBrowserPreviewId)) {
            return;
          }
          setTaskConnectorBrowserPreviewId("");
        }, [taskConnectorBrowserItems, taskConnectorBrowserPreviewId]);

        useEffect(() => {
          if ((!taskConnectorBrowserOpen && !projectConnectorBrowserDialog) || !taskConnectorBrowserPreviewItem || taskConnectorBrowserPreviewItem.isFolder) {
            setTaskConnectorBrowserPreviewState({
              status: "idle",
              kind: "",
              content: "",
              error: "",
            });
            return undefined;
          }

          const fileKind = getPlaygroundFileKind(taskConnectorBrowserPreviewItem);
          const connectorFetchFileContent = taskConnectorBrowserCurrentSource !== "notion"
            ? taskConnectorBrowserCurrentConfig?.fetchFileContent
            : null;
          if (connectorFetchFileContent) {
            let cancelled = false;
            setTaskConnectorBrowserPreviewState({
              status: "loading",
              kind: "",
              content: "",
              error: "",
            });

            void connectorFetchFileContent(taskConnectorBrowserPreviewItem)
              .then((payload) => {
                if (cancelled) {
                  return;
                }
                if (!payload?.content) {
                  if (fileKind === "image" && taskConnectorBrowserPreviewItem.previewUrl) {
                    setTaskConnectorBrowserPreviewState({
                      status: "ready",
                      kind: "image",
                      content: taskConnectorBrowserPreviewItem.previewUrl,
                      error: "",
                    });
                  } else {
                    setTaskConnectorBrowserPreviewState({
                      status: "idle",
                      kind: "",
                      content: "",
                      error: "",
                    });
                  }
                  return;
                }

                if (fileKind === "image") {
                  const mimeType = taskConnectorBrowserPreviewItem.mimeType || payload.mimeType || "image/png";
                  setTaskConnectorBrowserPreviewState({
                    status: "ready",
                    kind: "image",
                    content: "data:" + mimeType + ";base64," + String(payload.content || "").replace(/\\s+/g, ""),
                    error: "",
                  });
                  return;
                }

                if (payload.encoding === "base64") {
                  setTaskConnectorBrowserPreviewState({
                    status: "ready",
                    kind: "text",
                    content: decodeTaskConnectorBase64Text(payload.content).slice(0, 5000),
                    error: "",
                  });
                  return;
                }

                setTaskConnectorBrowserPreviewState({
                  status: "ready",
                  kind: "text",
                  content: String(payload.content || "").slice(0, 5000),
                  error: "",
                });
              })
              .catch((error) => {
                if (cancelled) {
                  return;
                }
                if (fileKind === "image" && taskConnectorBrowserPreviewItem.previewUrl) {
                  setTaskConnectorBrowserPreviewState({
                    status: "ready",
                    kind: "image",
                    content: taskConnectorBrowserPreviewItem.previewUrl,
                    error: "",
                  });
                  return;
                }
                setTaskConnectorBrowserPreviewState({
                  status: "error",
                  kind: "",
                  content: "",
                  error: error instanceof Error ? error.message : "Failed to load preview.",
                });
              });

            return () => {
              cancelled = true;
            };
          }

          if (fileKind === "image" && taskConnectorBrowserPreviewItem.previewUrl) {
            setTaskConnectorBrowserPreviewState({
              status: "ready",
              kind: "image",
              content: taskConnectorBrowserPreviewItem.previewUrl,
              error: "",
            });
            return undefined;
          }

          setTaskConnectorBrowserPreviewState({
            status: "idle",
            kind: "",
            content: "",
            error: "",
          });
          return undefined;
        }, [
          taskConnectorBrowserCurrentConfig,
          taskConnectorBrowserCurrentSource,
          taskConnectorBrowserOpen,
          projectConnectorBrowserDialog,
          taskConnectorBrowserPreviewItem,
        ]);

        useEffect(() => {
          if (!projectEnvironmentFilePickerOpen && !taskEnvironmentFilePickerOpen && !taskEnvironmentChangeDialog && !taskScheduleDialogState && !taskConnectorBrowserOpen && !projectConnectorBrowserDialog && !taskParentPickerState && !boardBlockedPickerState) {
            return undefined;
          }

          function handleTaskOverlayEscape(event) {
            if (event.key !== "Escape") return;
            if (projectEnvironmentFilePickerOpen) {
              setProjectEnvironmentFilePickerOpen(false);
            }
            if (taskEnvironmentChangeDialog?.isSubmitting) {
              return;
            }
            if (taskEnvironmentFilePickerOpen) {
              setTaskEnvironmentFilePickerOpen(false);
            }
            if (taskEnvironmentChangeDialog) {
              setTaskEnvironmentChangeDialog(null);
            }
            if (taskScheduleDialogState) {
              closeTaskScheduleDialog();
            }
            if (taskConnectorBrowserOpen) {
              closeTaskConnectorBrowser();
            }
            if (projectConnectorBrowserDialog) {
              closeTaskConnectorBrowser();
            }
            if (taskParentPickerState) {
              setTaskParentPickerState(null);
            }
            if (boardBlockedPickerState?.isSubmitting) {
              return;
            }
            if (boardBlockedPickerState) {
              setBoardBlockedPickerState(null);
            }
          }

          window.addEventListener("keydown", handleTaskOverlayEscape);
          return () => window.removeEventListener("keydown", handleTaskOverlayEscape);
        }, [boardBlockedPickerState, projectConnectorBrowserDialog, projectEnvironmentFilePickerOpen, taskConnectorBrowserOpen, taskEnvironmentChangeDialog, taskEnvironmentFilePickerOpen, taskParentPickerState, taskScheduleDialogState]);

        useEffect(() => {
          if (!taskScheduleDialogState) {
            return undefined;
          }

          function handleTaskSchedulePointerDown(event) {
            const target = event.target instanceof Element ? event.target : null;
            if (!target || target.closest(".playground-tasks-schedule-anchor, .playground-tasks-schedule-panel")) {
              return;
            }
            closeTaskScheduleDialog();
          }

          window.addEventListener("pointerdown", handleTaskSchedulePointerDown);
          return () => window.removeEventListener("pointerdown", handleTaskSchedulePointerDown);
        }, [taskScheduleDialogState]);

        useEffect(() => () => {
          if (taskScheduleDialogTimerRef.current) {
            window.clearTimeout(taskScheduleDialogTimerRef.current);
            taskScheduleDialogTimerRef.current = null;
          }
        }, []);

        useLayoutEffect(() => {
          resizeTaskDescriptionTextarea(taskDescriptionTextareaRef.current);
        }, [draftTask?.description, draftTask?.id]);

        useEffect(() => {
          setTaskCommentComposerOpen(false);
        }, [draftTask?.id]);

        useEffect(() => {
          const textarea = taskDescriptionTextareaRef.current;
          const detailMain = taskDetailMainRef.current;
          if (!textarea || !detailMain) return undefined;

          let frameId = 0;
          const timeoutIds = [];
          const scheduleResize = () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            frameId = window.requestAnimationFrame(() => {
              resizeTaskDescriptionTextarea(taskDescriptionTextareaRef.current);
            });
          };

          scheduleResize();
          [120, 240, 360].forEach((delay) => {
            timeoutIds.push(window.setTimeout(scheduleResize, delay));
          });

          if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", scheduleResize);
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              window.removeEventListener("resize", scheduleResize);
            };
          }

          const observer = new ResizeObserver(() => {
            scheduleResize();
          });
          observer.observe(detailMain);

          return () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            observer.disconnect();
          };
        }, [draftTask?.id, previewedTaskAttachmentId]);

        useEffect(() => {
          setIsMissionControlDocumentEditing(false);
          setMissionControlDocumentHistory({ past: [], future: [] });
        }, [selectedProjectId]);

	        useEffect(() => {
	          setIsMissionControlInstructionsEditing(false);
	          setIsProjectRulesEditing(false);
	          setMissionControlCommentInputValue("");
	          setMissionControlSaveState({
            isSaving: false,
            error: "",
            message: "",
          });
        }, [selectedProjectId]);

        useEffect(() => {
          if (isMissionControlDocumentEditing) {
            return;
          }
          updateMissionControlDocumentDraftValue(String(selectedProjectMissionControl.document || ""), { recordHistory: false });
          setMissionControlDocumentHistory({ past: [], future: [] });
        }, [
          isMissionControlDocumentEditing,
          selectedProjectId,
          selectedProjectMissionControl.document,
          selectedProjectMissionControl.updatedAt,
        ]);

	        useEffect(() => {
	          if (isMissionControlInstructionsEditing) {
	            return;
          }
          setMissionControlInstructionsDraft(String(selectedProjectMissionInstructions || ""));
        }, [
          isMissionControlInstructionsEditing,
          selectedProjectId,
          selectedProjectMissionInstructions,
          selectedProjectMissionControl.instructions,
	          selectedProjectMissionControl.updatedAt,
	        ]);

	        useEffect(() => {
	          if (isProjectRulesEditing) {
	            return;
	          }
	          setProjectRulesDraft(String(selectedProjectRules || ""));
	          setProjectRuleInputValue("");
	          setProjectRuleComposerOpen(false);
	          setProjectRuleComposerVisible(false);
	          setProjectRuleComposerClosing(false);
	          setProjectRulesSaveState({
	            isSaving: false,
	            error: "",
	          });
	          setProjectRuleEditingIndex(-1);
	          setProjectRuleEditingValue("");
	        }, [
	          isProjectRulesEditing,
	          selectedProjectId,
	          selectedProjectRules,
	        ]);

	        useEffect(() => {
	          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief(selectedProjectStrategyBrief);
	          setMissionControlStrategyDraft((current) => {
	            const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(current);
	            const previousProjectId = missionControlStrategyDraftProjectIdRef.current;
	            const projectChanged = previousProjectId !== selectedProjectId;
	            missionControlStrategyDraftProjectIdRef.current = selectedProjectId;
	            if (
	              !projectChanged
	              && hasMeaningfulPlaygroundProjectStrategyBrief(currentStrategyBrief)
	              && !hasMeaningfulPlaygroundProjectStrategyBrief(nextStrategyBrief)
	            ) {
	              return currentStrategyBrief;
	            }
	            return nextStrategyBrief;
	          });
	        }, [
	          selectedProjectId,
	          selectedProjectStrategyBrief,
	          selectedProjectMissionControl.updatedAt,
	        ]);

        useEffect(() => {
          if (!missionControlSetupOpen) {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(projectDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [
          missionControlSetupOpen,
          projectDraft.description,
        ]);

	        useLayoutEffect(() => {
	          if (!missionControlStrategyOpen && projectOverviewHomeTab !== "strategy" && projectOverviewHomeTab !== "rules") {
	            return;
	          }
	          resizeTaskDescriptionTextarea(missionControlDocumentTextareaRef.current);
	          resizeTaskDescriptionTextarea(missionControlInstructionsTextareaRef.current);
	          resizeTaskDescriptionTextarea(projectRulesTextareaRef.current);
	          resizeTaskDescriptionTextarea(projectRuleComposerTextareaRef.current);
	          resizeTaskDescriptionTextarea(projectRuleEditTextareaRef.current);
	        }, [missionControlDocumentDraft, missionControlInstructionsDraft, projectRulesDraft, projectRuleInputValue, projectRuleEditingValue, missionControlStrategyOpen, projectOverviewHomeTab, selectedProjectId]);

	        useEffect(() => {
	          if (!missionControlStrategyOpen && projectOverviewHomeTab !== "strategy" && projectOverviewHomeTab !== "rules") {
	            return undefined;
	          }

	          const textarea = projectOverviewHomeTab === "rules"
	            ? projectRulesTextareaRef.current
	            : missionControlDocumentTextareaRef.current;
	          const detailMain = taskDetailMainRef.current || (projectOverviewHomeTab === "rules"
	            ? projectOverviewRulesSurfaceRef.current
	            : projectOverviewStrategySurfaceRef.current);
	          if (!textarea || !detailMain) {
	            return undefined;
          }

          let frameId = 0;
          const timeoutIds = [];
          const scheduleResize = () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
	            frameId = window.requestAnimationFrame(() => {
	              resizeTaskDescriptionTextarea(missionControlDocumentTextareaRef.current);
	              resizeTaskDescriptionTextarea(missionControlInstructionsTextareaRef.current);
	              resizeTaskDescriptionTextarea(projectRulesTextareaRef.current);
	              resizeTaskDescriptionTextarea(projectRuleComposerTextareaRef.current);
	              resizeTaskDescriptionTextarea(projectRuleEditTextareaRef.current);
	            });
	          };

          scheduleResize();
          [120, 240, 360].forEach((delay) => {
            timeoutIds.push(window.setTimeout(scheduleResize, delay));
          });

          if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", scheduleResize);
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              window.removeEventListener("resize", scheduleResize);
            };
          }

          const observer = new ResizeObserver(() => {
            scheduleResize();
          });
          observer.observe(detailMain);

          return () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            observer.disconnect();
          };
	        }, [missionControlDocumentDraft, missionControlInstructionsDraft, projectRulesDraft, projectRuleInputValue, projectRuleEditingValue, missionControlStrategyOpen, projectOverviewHomeTab, selectedProjectId]);

        useEffect(() => {
          if (!previewedTaskAttachmentId) return;
          if (activeDetailAttachments.some((attachment) => attachment.id === previewedTaskAttachmentId)) {
            return;
          }
          setPreviewedTaskAttachmentId("");
        }, [activeDetailAttachments, previewedTaskAttachmentId]);

        useEffect(() => {
          if (!projectPreviewedAttachmentId) return;
          if (normalizePlaygroundTaskAttachmentList(projectAttachmentHostRecord?.attachments).some((attachment) => attachment.id === projectPreviewedAttachmentId)) {
            return;
          }
          setProjectPreviewedAttachmentId("");
        }, [projectAttachmentHostRecord?.attachments, projectPreviewedAttachmentId]);

        useEffect(() => () => {
          taskAttachmentObjectUrlsRef.current.forEach((url) => {
            URL.revokeObjectURL(url);
          });
          taskAttachmentObjectUrlsRef.current.clear();
        }, []);

`;
