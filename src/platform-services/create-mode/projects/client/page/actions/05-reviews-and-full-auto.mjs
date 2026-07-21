export const PROJECTS_ACTIONS_05_FRAGMENT = `            taskType: "subtask",
            parentTaskId: parentTask.id,
          });
        }

        async function handleSaveTask() {
          if (!draftTask?.id || !selectedProjectId) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const savedTask = await patchTaskRecord(draftTask);
            commitLocalTaskRecord(savedTask);
            resetSaveState("Saved");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to save task.",
              message: "",
            });
          }
        }

        function handleRevertTask() {
          if (!selectedTaskSnapshot) return;
          editorDirtyRef.current = false;
          resetSaveState("");
          setDraftTask(normalizePlaygroundTaskRecord(selectedTaskSnapshot));
        }

        function handleCloseTaskDetail() {
          setBacklogTaskContextMenu(null);
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setTaskScheduleDialogPhase("idle");
          setMissionControlStrategyOpen(false);
          if (taskScheduleDialogTimerRef.current) {
            window.clearTimeout(taskScheduleDialogTimerRef.current);
            taskScheduleDialogTimerRef.current = null;
          }
          restoreProjectOverviewSidebarAfterTaskClose();
          setProjectTaskDetailScreenOpen(false);
          setSelectedTaskId("");
          if (typeof onCloseDetailOnly === "function") {
            onCloseDetailOnly();
          }
        }

        function handleOpenTaskThreadChanges(task) {
          const threadId = getTaskStartedThreadId(task);
          if (!threadId || typeof onThreadStarted !== "function") {
            return;
          }
          setBacklogTaskContextMenu(null);
          setTaskDetailPopover("");
          onThreadStarted(threadId, { contentMode: "changes" });
        }

        function handleOpenTaskThreadChat(task) {
          const threadId = getTaskStartedThreadId(task);
          if (!threadId || typeof onThreadStarted !== "function") {
            return;
          }
          setBacklogTaskContextMenu(null);
          setTaskDetailPopover("");
          onThreadStarted(threadId, { contentMode: "chat" });
        }

        function openBacklogTaskContextMenu(task, event) {
          if (!task?.id || !event) {
            return;
          }
          const viewportPadding = 12;
          const estimatedMenuWidth = 296;
          const estimatedMenuHeight = getTaskStartedThreadId(task) ? 180 : 128;
          const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
          const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
          const nextX = viewportWidth > 0
            ? Math.max(viewportPadding, Math.min(event.clientX, viewportWidth - estimatedMenuWidth - viewportPadding))
            : event.clientX;
          const nextY = viewportHeight > 0
            ? Math.max(viewportPadding, Math.min(event.clientY, viewportHeight - estimatedMenuHeight - viewportPadding))
            : event.clientY;
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setBacklogTaskContextMenu({
            taskId: task.id,
            x: nextX,
            y: nextY,
          });
        }

        function renderTaskActionsMenu(task, { closeMenu, includeFullScreenAction = false } = {}) {
          if (!task?.id) {
            return null;
          }
          const dismissMenu = typeof closeMenu === "function" ? closeMenu : function noop() {};
          const canRunHumanTask = isHumanAssignedTask(task);
          const startedThreadId = getTaskStartedThreadId(task);
          const canShowRevertTaskChanges = Boolean(startedThreadId);

          return React.createElement(React.Fragment, null,
            React.createElement("button", {
              type: "button",
              className: "tb-popup-row",
              onClick: () => {
                dismissMenu();
                if (canRunHumanTask) {
                  void handleToggleTaskDone(task);
                  return;
                }
                void handleStartTaskThread(task);
              },
              disabled: canRunHumanTask
                ? saveState.isSaving
                : saveState.isSaving || isTaskThreadLaunchLocked(task),
            },
              canRunHumanTask
                ? React.createElement(Check, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 })
                : React.createElement(Play, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, canRunHumanTask ? (task?.status === "done" ? "Reopen task" : "Mark complete") : "Run thread"),
                React.createElement("span", null, canRunHumanTask ? "Move this human task into Finished." : "Start a fresh agent thread from this task.")
              )
            ),
            canShowRevertTaskChanges
              ? React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  onClick: () => {
                    dismissMenu();
                    handleOpenTaskThreadChanges(task);
                  },
                  disabled: saveState.isSaving,
                },
                  React.createElement(RotateCcw, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, "Revert Changes"),
                    React.createElement("span", null, "Open the last started thread in Changes view.")
                  )
                )
              : null,
            includeFullScreenAction
              ? React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  onClick: () => {
                    dismissMenu();
                    openProjectTaskDetailScreen(task.id);
                  },
                  disabled: saveState.isSaving,
                },
                  React.createElement(Maximize2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, "Full screen"),
                    React.createElement("span", null, "Open this ticket in full screen mode.")
                  )
                )
              : null,
            React.createElement("button", {
              type: "button",
              className: "tb-popup-row playground-tasks-detail-menu-item-danger",
              onClick: () => {
                dismissMenu();
                void handleDeleteTask(task.id);
              },
              disabled: saveState.isSaving,
            },
              React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, "Delete"),
                React.createElement("span", null, "Remove this task from the project.")
              )
            )
          );
        }

        function getTaskLinkedRunPresentation(threadRecord) {
          const normalizedStatus = String(threadRecord?.status || "").trim().toLowerCase();
          if (normalizedStatus === "completed") {
            return {
              title: "Latest completed run",
              description: "",
            };
          }
          if (["running", "starting"].includes(normalizedStatus)) {
            return {
              title: "Latest run in progress",
              description: "",
            };
          }
          if (["queued", "pending", "scheduled"].includes(normalizedStatus)) {
            return {
              title: "Latest run scheduled",
              description: "",
            };
          }
          if (["failed", "cancelled"].includes(normalizedStatus)) {
            return {
              title: "Latest run needs review",
              description: "",
            };
          }
          return {
            title: "Latest linked Thread",
            description: "",
          };
        }

        function collectTaskDescendantIds(taskId) {
          const normalizedTaskId = String(taskId || "").trim();
          const descendantIds = [];
          const visited = new Set();

          function visit(parentTaskId) {
            const childTasks = allTaskChildrenByParentId[parentTaskId] || [];
            childTasks.forEach((childTask) => {
              const childTaskId = String(childTask?.id || "").trim();
              if (!childTaskId || visited.has(childTaskId)) {
                return;
              }
              visited.add(childTaskId);
              visit(childTaskId);
              descendantIds.push(childTaskId);
            });
          }

          if (normalizedTaskId) {
            visit(normalizedTaskId);
          }

          return descendantIds;
        }

        function buildTaskDeleteDialogState(taskId) {
          const normalizedTaskId = String(taskId || "").trim();
          if (!normalizedTaskId) {
            return null;
          }

          const taskRecord = tasksById[normalizedTaskId] || null;
          const directSubtasks = allTaskChildrenByParentId[normalizedTaskId] || [];
          if (!taskRecord || directSubtasks.length === 0) {
            return null;
          }

          return {
            taskId: normalizedTaskId,
            taskTitle: taskRecord.title || "Untitled Task",
            ticketNumber: taskTicketNumbersById[normalizedTaskId] || taskRecord.ticketNumber || "000",
            subtaskCount: directSubtasks.length,
            isSubmitting: false,
            error: "",
          };
        }

        async function deleteTaskRecordById(taskId) {
          const resolvedTaskId = String(taskId || "").trim();
          if (!resolvedTaskId) {
            return;
          }

          const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(resolvedTaskId), {
            method: "DELETE",
            headers: requestHeaders,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to delete task.");
          }
        }

        async function executeTaskDeletion(taskId, options = {}) {
          const resolvedTaskId = String(taskId || "").trim();
          if (!resolvedTaskId || !selectedProjectId) {
            return;
          }

          const keepSubtasks = Boolean(options.keepSubtasks);
          const directSubtasks = (allTaskChildrenByParentId[resolvedTaskId] || []).slice().sort(compareBacklogDefaultTaskOrder);

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            if (keepSubtasks && directSubtasks.length > 0) {
              const directSubtaskIdSet = new Set(
                directSubtasks
                  .map((task) => String(task?.id || "").trim())
                  .filter(Boolean)
              );
              const rootTasks = getBacklogSiblingTasks(null);
              const parentRootIndex = rootTasks.findIndex((task) => task.id === resolvedTaskId);
              const nextRootOrder = rootTasks.filter((task) => task.id !== resolvedTaskId && !directSubtaskIdSet.has(task.id));
              const insertionIndex = parentRootIndex >= 0 ? Math.min(parentRootIndex, nextRootOrder.length) : nextRootOrder.length;
              nextRootOrder.splice(insertionIndex, 0, ...directSubtasks);

              for (let index = 0; index < nextRootOrder.length; index += 1) {
                const currentTask = nextRootOrder[index];
                if (!currentTask?.id) {
                  continue;
                }
                const currentTaskId = String(currentTask.id || "").trim();
                const nextOverrides = {
                  sortOrder: buildBacklogManualSortOrder(index),
                };
                if (directSubtaskIdSet.has(currentTaskId)) {
                  nextOverrides.taskType = "task";
                  nextOverrides.parentTaskId = null;
                }
                await patchTaskRecord(currentTask, nextOverrides);
              }
            } else {
              const descendantIds = collectTaskDescendantIds(resolvedTaskId);
              for (const descendantId of descendantIds) {
                await deleteTaskRecordById(descendantId);
              }
            }

            await deleteTaskRecordById(resolvedTaskId);

            if (typeof onTaskDeleted === "function") {
              onTaskDeleted(resolvedTaskId);
            }

            if (selectedTaskId === resolvedTaskId) {
              setSelectedTaskId("");
              setDraftTask(null);
              if (typeof onCloseDetailOnly === "function") {
                onCloseDetailOnly();
              }
            }
            setTaskDeleteDialogState(null);
            await loadProjectWorkspace(selectedProjectId);
            resetSaveState("");
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete task.";
            setSaveState({
              isSaving: false,
              error: message,
              message: "",
            });
            throw new Error(message);
          }
        }

        async function handleTaskDeleteDialogDecision(keepSubtasks) {
          const dialogState = taskDeleteDialogState;
          if (!dialogState?.taskId || dialogState.isSubmitting) {
            return;
          }

          setTaskDeleteDialogState({
            ...dialogState,
            isSubmitting: true,
            error: "",
          });

          try {
            await executeTaskDeletion(dialogState.taskId, {
              keepSubtasks,
            });
          } catch (error) {
            setTaskDeleteDialogState((current) => current && current.taskId === dialogState.taskId
              ? {
                  ...current,
                  isSubmitting: false,
                  error: error instanceof Error ? error.message : "Failed to delete task.",
                }
              : current
            );
          }
        }

        async function handleDeleteTask(taskId) {
          setTaskDetailPopover("");
          const resolvedTaskId = String(taskId || "").trim();
          if (!resolvedTaskId) {
            return;
          }

          const deleteDialogState = buildTaskDeleteDialogState(resolvedTaskId);
          if (deleteDialogState) {
            setTaskDeleteDialogState(deleteDialogState);
            return;
          }

          if (!window.confirm("Delete this task?")) {
            return;
          }

          await executeTaskDeletion(resolvedTaskId, {
            keepSubtasks: false,
          });
        }

        async function handleToggleTaskDone(task, event) {
          event?.stopPropagation?.();
          if (!task?.id || !selectedProjectId) {
            return;
          }

          const nextStatus = task.status === "done" ? "todo" : "done";
          const nextBacklogSessionCompletedTaskIds = new Set(backlogSessionCompletedTaskIds);
          if (taskView === "backlog") {
            if (nextStatus === "done") {
              nextBacklogSessionCompletedTaskIds.add(task.id);
            } else {
              nextBacklogSessionCompletedTaskIds.delete(task.id);
            }
          } else {
            nextBacklogSessionCompletedTaskIds.delete(task.id);
          }
          const optimisticTask = normalizePlaygroundTaskRecord({
            ...task,
            status: nextStatus,
            completedAt: nextStatus === "done" ? new Date().toISOString() : null,
          });
          const shouldHideAfterUpdate = taskView === "backlog" && !matchesBacklogFilter(optimisticTask, backlogFilterMode, {
            keepVisibleCompletedTaskIds: nextBacklogSessionCompletedTaskIds,
          });
          const shouldKeepSelection = selectedTaskId === task.id && !shouldHideAfterUpdate;

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const updatedTask = await patchTaskRecord(task, {
              status: nextStatus,
              completedAt: optimisticTask.completedAt,
            });

            setBacklogSessionCompletedTaskIds(nextBacklogSessionCompletedTaskIds);
            commitLocalTaskRecord(updatedTask, {
              selectTask: shouldKeepSelection,
            });

            if (!shouldKeepSelection && selectedTaskId === task.id) {
              setSelectedTaskId("");
              setDraftTask(null);
            }

            resetSaveState(nextStatus === "done" ? "Task completed" : "Task reopened");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to update task.",
              message: "",
            });
          }
        }

        function getTaskPreviewStatusValue(taskRecord) {
          const boardStatus = getTaskBoardStatus(taskRecord);
          return PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === boardStatus)
            ? boardStatus
            : "todo";
        }

        function getTaskPreviewBlockedByLabel(taskRecord) {
          const dependencyIds = normalizePlaygroundIdList(taskRecord?.dependencyIds);
          const blockingTask = dependencyIds
            .map((dependencyId) => tasksById[dependencyId] || null)
            .find((dependencyTask) => dependencyTask && String(dependencyTask.status || "").trim() !== "done");
          const blockingTaskId = blockingTask?.id || dependencyIds[0] || "";
          const blockingTicketNumber = blockingTaskId
            ? (taskTicketNumbersById[blockingTaskId] || blockingTask?.ticketNumber || "")
            : "";
          return blockingTicketNumber ? "Blocked by " + blockingTicketNumber : "Blocked";
        }

        function getTaskPreviewStatusLabel(taskRecord) {
          const currentStatus = getTaskPreviewStatusValue(taskRecord);
          if (currentStatus === "blocked") {
            return getTaskPreviewBlockedByLabel(taskRecord);
          }
          return getPlaygroundTaskStatusLabel(currentStatus);
        }

        function isTaskPreviewStatusMenuOpen(taskId) {
          const normalizedTaskId = String(taskId || "").trim();
          return Boolean(normalizedTaskId && taskStatusMenuState?.taskId === normalizedTaskId);
        }

        function getTaskPreviewStatusOptions(taskRecord) {
          const currentStatus = getTaskPreviewStatusValue(taskRecord);
          const transitionOrder = currentStatus === "blocked"
            ? ["todo"]
            : (
                currentStatus === "todo"
                  ? ["in_progress", "done", "in_review"]
                  : ["todo", "in_progress", "done", "in_review"]
              );
          return transitionOrder
            .filter((status) => status !== currentStatus)
            .map((status) => PLAYGROUND_TASK_STATUS_OPTIONS.find((option) => option.id === status))
            .filter(Boolean);
        }

        async function handleTaskPreviewStatusChange(taskRecord, nextStatus, event) {
          event?.preventDefault?.();
          event?.stopPropagation?.();
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const normalizedNextStatus = String(nextStatus || "").trim();
          const allowedStatusIds = new Set(getTaskPreviewStatusOptions(normalizedTask).map((option) => option.id));
          if (!normalizedTask?.id || !selectedProjectId || !allowedStatusIds.has(normalizedNextStatus) || saveState.isSaving) {
            return;
          }

          setTaskStatusMenuState(null);

          if (normalizedNextStatus === "in_progress" && !isHumanAssignedTask(normalizedTask)) {
            await handleStartTaskThread(normalizedTask);
            return;
          }

          const completedAt = normalizedNextStatus === "done" ? new Date().toISOString() : null;
          const nextDependencyIds = [];
          const previousTask = normalizePlaygroundTaskRecord(normalizedTask);
          const optimisticTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...normalizedTask,
            status: normalizedNextStatus,
            completedAt,
            dependencyIds: nextDependencyIds,
          }));
          const nextBacklogSessionCompletedTaskIds = new Set(backlogSessionCompletedTaskIds);
          if (taskView === "backlog" && normalizedNextStatus === "done") {
            nextBacklogSessionCompletedTaskIds.add(normalizedTask.id);
          } else {
            nextBacklogSessionCompletedTaskIds.delete(normalizedTask.id);
          }
          const shouldHideAfterUpdate = taskView === "backlog" && !matchesBacklogFilter(optimisticTask, backlogFilterMode, {
            keepVisibleCompletedTaskIds: nextBacklogSessionCompletedTaskIds,
          });
          const shouldKeepSelection = selectedTaskIdRef.current === normalizedTask.id && !shouldHideAfterUpdate;

          commitLocalTaskRecord(optimisticTask, {
            selectTask: shouldKeepSelection,
            syncDraft: shouldKeepSelection,
            markClean: true,
          });
          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const updatedTask = await patchTaskRecord(normalizedTask, {
              status: normalizedNextStatus,
              completedAt,
              dependencyIds: nextDependencyIds,
            });
            setBacklogSessionCompletedTaskIds(nextBacklogSessionCompletedTaskIds);
            commitLocalTaskRecord(updatedTask, {
              selectTask: shouldKeepSelection,
            });
            if (!shouldKeepSelection && selectedTaskIdRef.current === normalizedTask.id) {
              setSelectedTaskId("");
              setDraftTask(null);
            }
            resetSaveState("Task moved to " + getPlaygroundTaskStatusLabel(normalizedNextStatus));
          } catch (error) {
            commitLocalTaskRecord(previousTask, {
              selectTask: selectedTaskIdRef.current === previousTask.id,
              syncDraft: selectedTaskIdRef.current === previousTask.id,
              markClean: true,
            });
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to update task status.",
              message: "",
            });
          }
        }

        function renderTaskPreviewStatusControl(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          if (!normalizedTask?.id) {
            return null;
          }

          const currentStatus = getTaskPreviewStatusValue(normalizedTask);
          const currentLabel = getTaskPreviewStatusLabel(normalizedTask);
          const statusOptions = getTaskPreviewStatusOptions(normalizedTask);
          const isOpen = isTaskPreviewStatusMenuOpen(normalizedTask.id);
          const isDisabled = saveState.isSaving || statusOptions.length === 0;

          return React.createElement("div", {
              className: "playground-tasks-backlog-status-control playground-tasks-toolbar-popup-shell" + (isOpen ? " is-open" : ""),
              ref: isOpen ? taskStatusMenuRef : null,
              onClick: (event) => event.stopPropagation(),
            },
            React.createElement("button", {
              type: "button",
              className: "playground-tasks-backlog-status-button",
              title: "Change status",
              "aria-label": "Change ticket status",
              "aria-expanded": isOpen ? "true" : "false",
              disabled: isDisabled,
              onClick: (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isDisabled) {
                  return;
                }
                setTaskStatusMenuState((current) => current?.taskId === normalizedTask.id
                  ? null
                  : { taskId: normalizedTask.id }
                );
              },
            },
              React.createElement(ChevronDown, { className: "playground-tasks-backlog-status-chevron", strokeWidth: 1.8 }),
              React.createElement("span", { className: "playground-tasks-backlog-status-label" }, currentLabel)
            ),
            isOpen
              ? React.createElement(PlatformPopupSurface, {
                  className: "playground-tasks-toolbar-popup-menu playground-tasks-backlog-status-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                },
                  statusOptions.map((option) =>
                    React.createElement("button", {
                        key: option.id,
                        type: "button",
                        className: "tb-popup-row tb-popup-row-select",
                        disabled: saveState.isSaving,
                        onClick: (event) => void handleTaskPreviewStatusChange(normalizedTask, option.id, event),
                      },
                      React.createElement("span", { className: "tb-popup-check-slot" }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, option.label)
                      )
                    )
                  )
                )
              : null
          );
        }

        async function handleCreateSprint() {
          if (!selectedProjectId) {
            return;
          }

          const nextName = String(sprintDraft.name || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const response = await fetch(backendUrl + "/tasks/sprints", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projectId: selectedProjectId,
                name: nextName,
                goal: sprintDraft.goal,
                status: sprintDraft.status,
                startAt: sprintDraft.startAt,
                endAt: sprintDraft.endAt,
                sortOrder: sprints.length + 1,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create sprint.");
            }
            const createdSprint = getPlaygroundTaskSprintResponseRecord(data);

            if (!createdSprint?.id) {
              throw new Error("Sprint creation failed.");
            }

            commitLocalSprintRecord(createdSprint);
            setBoardSprintId(createdSprint.id);
            setSprintDraft(buildPlaygroundDefaultSprintDraft());
            setSprintComposerOpen(false);
            resetSaveState("Sprint created");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to create sprint.",
              message: "",
            });
          }
        }

	        async function handleStartTaskThread(task, options = {}) {
          if (!task?.id) {
            return;
          }
          if (isHumanAssignedTask(task)) {
            setSaveState({
              isSaving: false,
              error: "",
              message: "Human-assigned tasks do not start agent threads.",
            });
            return;
          }
          if (isTaskThreadLaunchLocked(task)) {
            return;
          }
          if (!canStartThreads) {
            if (onRequireAuth) {
              onRequireAuth();
            } else {
              window.alert("Sign in with Computer Agents to start threads from tasks.");
            }
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const reviewRequestBody = typeof options?.reviewRequestBody === "string"
              ? options.reviewRequestBody.trim()
              : "";
            const isReviewRunRequest = String(options?.runKind || "implementation").trim().toLowerCase() === "review";
            const normalizedRunKind = isReviewRunRequest
              ? "review"
              : "implementation";
            const taskSourceForLaunch = options?.preferProvidedTask === true
              ? task
              : draftTask?.id === task.id
                ? draftTask
                : task;
            let taskToLaunch = buildPlaygroundTaskLaunchRecord(taskSourceForLaunch);
            const isSelectedDraftTask = draftTask?.id === task.id;
            const normalizedTaskId = String(task.id || "").trim();
            const baseTaskPreview = buildPlaygroundTaskThreadPreview(taskToLaunch);
            const taskPreview = {
              ...baseTaskPreview,
              runKind: normalizedRunKind,
              ...(reviewRequestBody
                ? {
                    reviewRequest: true,
                    reviewCommentId: String(options?.reviewCommentId || "").trim(),
                  }
                : {}),
            };
            taskRunPendingIdsRef.current.add(normalizedTaskId);
            setTaskRunPendingIds((current) => current.includes(normalizedTaskId) ? current : current.concat(normalizedTaskId));
            if (typeof onTaskRunStateChange === "function") {
              onTaskRunStateChange({
                taskId: normalizedTaskId,
                projectId: taskPreview.projectId || selectedProjectId || "",
                ticketNumber: taskPreview.ticketNumber || "",
                title: taskPreview.title || taskToLaunch.title || "Untitled Task",
                runKind: normalizedRunKind,
                reviewRequired: taskToLaunch.reviewRequired === true,
                reviewerAgentId: taskToLaunch.reviewerAgentId || "",
                phase: "starting",
              });
            }

            if (isSelectedDraftTask) {
              setDraftTask(taskToLaunch);
              taskAutosaveQueuedRef.current = taskToLaunch;
              await flushQueuedTaskAutosave();
              await waitForTaskAutosaveToSettle();
            }

            const enabledSkillsPayload = buildPlaygroundTaskRunEnabledSkillsPayload(taskToLaunch);
            const launchConnectors = mergePlaygroundTaskConnectorSelections(selectedProject?.connectors, taskToLaunch.connectors);
            const githubRepo = buildPlaygroundTaskGithubRepoReference({
              ...taskToLaunch,
              connectors: launchConnectors,
            }, {
              projectConnectors: selectedProject?.connectors,
            });
            const launchEnvironmentId = taskToLaunch.environmentId || backlogComposerEnvironmentId || initialEnvironmentId || "";
            const launchAgentId = taskToLaunch.assigneeAgentId || backlogComposerAgentId || initialAgentId || "";
            const projectLaunchAttachments = normalizePlaygroundTaskAttachmentList(selectedProject?.attachments);
            const launchPrompt = buildPlaygroundTaskRunPrompt(taskToLaunch, {
              projectAttachments: projectLaunchAttachments,
              reviewRequestBody,
            });
            const threadTitle = typeof options?.title === "string" && options.title.trim()
              ? options.title.trim()
              : taskPreview.ticketNumber + " " + (reviewRequestBody ? "Changes: " : "") + taskPreview.title;
            const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(task.id) + "/start-thread", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: threadTitle,
                environmentId: launchEnvironmentId || undefined,
                agentId: launchAgentId || undefined,
                enabledSkills: enabledSkillsPayload,
                githubRepo: githubRepo || undefined,
                connectors: launchConnectors,
                launchPrompt: launchPrompt,
                runKind: normalizedRunKind,
                allowAdditionalThread: true,
                taskPreview,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start thread from task.");
            }
            const threadRecord = getPlaygroundThreadResponseRecord(data);
            const updatedTask = getPlaygroundTaskResponseRecord(data);

            if (!threadRecord?.id) {
              throw new Error("Task thread creation failed.");
            }
            if (!updatedTask?.id) {
              throw new Error("Task update failed after thread start.");
            }
            const executionStarted = Boolean(data?.executionStarted);

            taskRunPendingIdsRef.current.delete(normalizedTaskId);
            setTaskRunPendingIds((current) => current.filter((taskId) => taskId !== normalizedTaskId));
            if (typeof onTaskRunStateChange === "function") {
              onTaskRunStateChange({
                taskId: updatedTask.id,
                projectId: taskPreview.projectId || selectedProjectId || "",
                threadId: threadRecord.id,
                ticketNumber: taskPreview.ticketNumber || "",
                title: updatedTask.title || taskPreview.title || "Untitled Task",
                runKind: normalizedRunKind,
                reviewRequired: updatedTask.reviewRequired === true || taskToLaunch.reviewRequired === true,
                reviewerAgentId: updatedTask.reviewerAgentId || taskToLaunch.reviewerAgentId || "",
                phase: "running",
              });
            }
            setTaskDetailThreadRecords((current) => normalizeThreadList([threadRecord].concat(Array.isArray(current) ? current : [])));
            commitLocalTaskRecord(updatedTask, {
              selectTask: selectedTaskId === updatedTask.id,
            });
            resetSaveState(typeof options?.successMessage === "string" && options.successMessage ? options.successMessage : "Thread started");
            if (onThreadStarted) {
              onThreadStarted(threadRecord.id, {
                threadRecord,
                taskPreview: {
                  ...buildPlaygroundTaskThreadPreview(updatedTask, threadRecord.id),
                  runKind: normalizedRunKind,
                  ...(reviewRequestBody
                    ? {
                        reviewRequest: true,
                        reviewCommentId: String(options?.reviewCommentId || "").trim(),
                      }
                    : {}),
                },
                ...(executionStarted
                  ? {}
                  : {
                      taskRunRequest: {
                        token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                        prompt: launchPrompt,
                        displayPrompt: reviewRequestBody || null,
                        attachments: [],
                        githubRepo: githubRepo || null,
                        enabledSkills: enabledSkillsPayload || null,
                        environmentId: launchEnvironmentId || "",
                        executionStarted,
                      },
                    }),
              });
            }
          } catch (error) {
            const normalizedTaskId = String(task.id || "").trim();
            const errorMessage = error instanceof Error ? error.message : "Failed to start task thread.";
            taskRunPendingIdsRef.current.delete(normalizedTaskId);
            setTaskRunPendingIds((current) => current.filter((taskId) => taskId !== normalizedTaskId));
            if (typeof onTaskRunStateChange === "function") {
              const failedPreview = buildPlaygroundTaskThreadPreview(task);
              onTaskRunStateChange({
                taskId: normalizedTaskId,
                projectId: failedPreview.projectId || selectedProjectId || "",
                ticketNumber: failedPreview.ticketNumber || "",
                title: failedPreview.title || task.title || "Untitled Task",
                phase: "failed",
                runKind: isReviewRunRequest ? "review" : "implementation",
                error: errorMessage,
              });
            }
            setSaveState({
              isSaving: false,
              error: errorMessage,
              message: "",
            });
	          }
	        }

	        async function saveProjectRules(rulesOverride) {
	          if (!selectedProject?.id) {
	            return;
	          }

	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const nextRules = typeof rulesOverride === "string"
	            ? rulesOverride
	            : String(projectRulesDraft || "");
	          if (nextRules === String(normalizedProject.projectRules || "")) {
	            setProjectRulesSaveState({
	              isSaving: false,
	              error: "",
	            });
	            return;
	          }

	          const nextProject = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            projectRules: nextRules,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              projectRules: nextRules,
	            },
	          });
	          const nextName = String(nextProject.name || "").trim().replace(/\\s+/g, " ");
	          if (!nextName) {
	            return;
	          }

	          setProjectRulesSaveState({
	            isSaving: true,
	            error: "",
	          });

	          try {
	            const savePayload = isPlaygroundProjectTeamSharedWithCurrentUser(nextProject)
	              ? {
	                  metadata: {
	                    projectRules: nextRules,
	                  },
	                }
	              : buildPlaygroundProjectSavePayload(nextProject, {
	                  projectRules: nextRules,
	                });
	            const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(nextProject.id), {
	              method: "PATCH",
	              headers: {
	                ...requestHeaders,
	                "Content-Type": "application/json",
	              },
	              body: JSON.stringify(savePayload),
	            });
	            const data = await response.json().catch(() => ({}));
	            if (!response.ok) {
	              throw new Error(data?.message || data?.error || "Failed to update project rules.");
	            }

	            const updatedProject = getPlaygroundProjectResponseRecord(data, nextProject);
	            if (!updatedProject?.id) {
	              throw new Error("Project update failed.");
	            }

	            commitLocalProjectRecord({
	              ...updatedProject,
	              projectRules: nextRules,
	              metadata: {
	                ...(updatedProject.metadata && typeof updatedProject.metadata === "object" ? updatedProject.metadata : {}),
	                projectRules: nextRules,
	              },
	              summary: updatedProject.summary || selectedProjectSummary,
	            }, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	            setProjectDraft((current) => current?.id === updatedProject.id
	              ? normalizePlaygroundProjectRecord({
	                  ...current,
	                  ...updatedProject,
	                  projectRules: nextRules,
	                })
	              : current
	            );
	            setProjectRulesSaveState({
	              isSaving: false,
	              error: "",
	            });
	          } catch (error) {
	            setProjectRulesSaveState({
	              isSaving: false,
	              error: error instanceof Error ? error.message : "Failed to update project rules.",
	            });
	          }
	        }

	        function commitProjectRulesIfDirty() {
	          const nextRules = String(projectRulesDraft || "");
	          if (!String(selectedProjectId || "").trim()) {
	            return;
	          }
	          if (nextRules === String(selectedProjectRules || "")) {
	            return;
	          }
	          void saveProjectRules(nextRules);
	        }

	        async function handleAddProjectRuleEntry() {
	          const nextEntry = normalizePlaygroundProjectRuleEntry(projectRuleInputValue);
	          if (!nextEntry || projectRulesSaveState.isSaving) {
	            return;
	          }

	          const currentEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	          const nextRules = serializePlaygroundProjectRuleEntries([...currentEntries, nextEntry]);
	          setProjectRulesDraft(nextRules);
	          finishCloseProjectRuleComposer();
	          await saveProjectRules(nextRules);
	        }

	        function beginProjectRuleEntryEdit(index, entry) {
	          if (projectRulesSaveState.isSaving) {
	            return;
	          }
	          setProjectRuleEditingIndex(index);
	          setProjectRuleEditingValue(String(entry || ""));
	          window.requestAnimationFrame(() => {
	            const textarea = projectRuleEditTextareaRef.current;
	            if (!textarea) {
	              return;
	            }
	            textarea.focus();
	            const length = textarea.value.length;
	            textarea.setSelectionRange(length, length);
	            resizeTaskDescriptionTextarea(textarea);
	          });
	        }

	        function cancelProjectRuleEntryEdit() {
	          setProjectRuleEditingIndex(-1);
	          setProjectRuleEditingValue("");
	        }

	        async function commitProjectRuleEntryEdit(indexToUpdate) {
	          if (projectRulesSaveState.isSaving) {
	            return;
	          }
	          const currentEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	          if (indexToUpdate < 0 || indexToUpdate >= currentEntries.length) {
	            cancelProjectRuleEntryEdit();
	            return;
	          }

	          const nextEntry = normalizePlaygroundProjectRuleEntry(projectRuleEditingValue);
	          const nextEntries = nextEntry
	            ? currentEntries.map((entry, index) => index === indexToUpdate ? nextEntry : entry)
	            : currentEntries.filter((_, index) => index !== indexToUpdate);
	          const nextRules = serializePlaygroundProjectRuleEntries(nextEntries);
	          const currentRules = serializePlaygroundProjectRuleEntries(currentEntries);
	          setProjectRuleEditingIndex(-1);
	          setProjectRuleEditingValue("");
	          if (nextRules === currentRules) {
	            return;
	          }
	          setProjectRulesDraft(nextRules);
	          await saveProjectRules(nextRules);
	        }

	        async function handleRemoveProjectRuleEntry(indexToRemove) {
	          if (projectRulesSaveState.isSaving) {
	            return;
	          }
	          const currentEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	          const nextRules = serializePlaygroundProjectRuleEntries(
	            currentEntries.filter((_, index) => index !== indexToRemove)
	          );
	          setProjectRuleEditingIndex(-1);
	          setProjectRuleEditingValue("");
	          setProjectRulesDraft(nextRules);
	          await saveProjectRules(nextRules);
	        }

	        function getProjectFullAutoEligibleTasks() {
	          if (!selectedProjectId) {
	            return [];
	          }
	          return tasks
	            .map((task) => normalizePlaygroundTaskRecord(task))
	            .filter((task) => task?.id && (task.projectId || selectedProjectId) === selectedProjectId)
	            .filter((task) => !isHumanAssignedTask(task))
	            .filter((task) => !isTaskThreadLaunchLocked(task))
	            .filter((task) => getTaskBoardStatus(task) === "todo")
	            .filter((task) => normalizePlaygroundIdList(task.dependencyIds).length === 0)
	            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
	            });
	        }

	        function startProjectFullAutoMode() {
	          if (!selectedProjectId) {
	            return;
	          }
	          if (!canStartThreads) {
	            if (onRequireAuth) {
              onRequireAuth();
	            }
	            return;
	          }
	          const nextTask = getProjectFullAutoEligibleTasks()[0] || null;
	          if (!nextTask) {
	            setSaveState({
              isSaving: false,
              error: "",
              message: "No runnable tasks are ready.",
	            });
	            setProjectFullAutoState({
              projectId: selectedProjectId,
              enabled: false,
              runningTaskId: "",
              startedCount: 0,
              error: "No runnable tasks are ready.",
	            });
	            return;
	          }
	          setProjectFullAutoState({
	            projectId: selectedProjectId,
	            enabled: true,
	            runningTaskId: "",
	            startedCount: 0,
	            error: "",
	          });
	          setSaveState({
	            isSaving: false,
	            error: "",
	            message: "Full Auto started",
	          });
	        }

	        function stopProjectFullAutoMode() {
	          setProjectFullAutoState((current) => ({
	            ...current,
	            enabled: false,
	            runningTaskId: "",
	          }));
	          setSaveState({
	            isSaving: false,
	            error: "",
	            message: "Full Auto stopped",
	          });
	        }

	        useEffect(() => {
	          if (!projectFullAutoState.enabled || projectFullAutoState.projectId !== selectedProjectId) {
	            return;
	          }

	          const runningTaskId = String(projectFullAutoState.runningTaskId || "").trim();
	          if (runningTaskId) {
	            const phase = String(taskRunStates[runningTaskId]?.phase || "").trim().toLowerCase();
	            if (phase === "finished" || phase === "in_review") {
              setProjectFullAutoState((current) => ({
                ...current,
                runningTaskId: "",
                startedCount: current.startedCount + 1,
              }));
              return;
	            }
	            if (phase === "failed" || phase === "cancelled" || phase === "waiting_subtasks") {
              const errorMessage = taskRunStates[runningTaskId]?.error || "Full Auto paused.";
              setSaveState({
                isSaving: false,
                error: errorMessage,
                message: "",
              });
              setProjectFullAutoState((current) => ({
                ...current,
                enabled: false,
                error: errorMessage,
              }));
	            }
	            return;
	          }

	          const nextTask = getProjectFullAutoEligibleTasks()[0] || null;
	          if (!nextTask) {
	            setSaveState({
              isSaving: false,
              error: "",
              message: "Full Auto complete",
	            });
	            setProjectFullAutoState((current) => ({
              ...current,
              enabled: false,
              error: "",
	            }));
	            return;
	          }

	          setProjectFullAutoState((current) => ({
	            ...current,
	            runningTaskId: nextTask.id,
	          }));
	          void handleStartTaskThread(nextTask);
	        }, [projectFullAutoState, selectedProjectId, taskRunStates, tasks]);

	        function getDraftTaskConnectorSelection(source, taskRecord = draftTask) {
          const connectorKey = getPlaygroundTaskConnectorKey(source);
          if (!connectorKey) {
            return null;
          }
          const connectors = normalizePlaygroundTaskConnectorSelections(taskRecord?.connectors);
          return connectors[connectorKey] || null;
        }

`;
