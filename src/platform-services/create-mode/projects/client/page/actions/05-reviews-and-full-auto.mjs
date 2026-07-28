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

        function handleTaskDetailBack() {
          const parentTaskId = isPlaygroundSubtaskRecord(draftTask)
            ? getPlaygroundTaskParentTaskId(draftTask)
            : null;
          if (parentTaskId) {
            openProjectTaskDetailScreen(parentTaskId);
            return;
          }
          handleCloseTaskDetail();
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
                React.createElement("span", null, canRunHumanTask ? "Move this human task into Done." : "Start a fresh agent thread from this task.")
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
          return PLAYGROUND_TASK_MANUAL_STATUS_OPTIONS.filter((option) => option.id !== currentStatus);
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

          const completedAt = isPlaygroundTaskTerminalStatus(normalizedNextStatus) ? new Date().toISOString() : null;
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
          const statusOptions = getTaskPreviewStatusOptions(normalizedTask);
          const isOpen = isTaskPreviewStatusMenuOpen(normalizedTask.id);
          const isDisabled = saveState.isSaving || statusOptions.length === 0;

          return React.createElement(PlatformSelector, {
            value: currentStatus,
            options: statusOptions.map((option) => ({
              value: option.id,
              label: option.label,
              leading: renderPlaygroundTaskStatusGlyph(option.id),
            })),
            onValueChange: (nextStatus) => {
              void handleTaskPreviewStatusChange(normalizedTask, nextStatus);
            },
            ariaLabel: "Change ticket status",
            label: renderPlaygroundTaskStatusValue(
              currentStatus,
              "playground-tasks-backlog-status-label"
            ),
            disabled: isDisabled,
            open: isOpen,
            onOpenChange: (nextOpen) => {
              setTaskStatusMenuState((current) => {
                if (nextOpen) {
                  return { taskId: normalizedTask.id };
                }
                return current?.taskId === normalizedTask.id ? null : current;
              });
            },
            alignment: "end",
            popupAlignment: "right",
            popupWidth: "176px",
            className: "playground-tasks-backlog-status-control" + (isOpen ? " is-open" : ""),
            triggerClassName: "playground-tasks-backlog-status-button",
            popupClassName: "playground-tasks-backlog-status-menu",
            optionClassName: "playground-tasks-backlog-status-option",
            onClick: (event) => event.stopPropagation(),
          });
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
            const taskRunIdempotencyKey = typeof options?.idempotencyKey === "string" && options.idempotencyKey.trim()
              ? options.idempotencyKey.trim()
              : "project-task-" + normalizedTaskId + "-" + (
                  globalThis.crypto?.randomUUID?.()
                  || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
                );
            const taskRunRequest = {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
                "Idempotency-Key": taskRunIdempotencyKey,
              },
              body: JSON.stringify({
                title: threadTitle,
                executionMode: "deferred",
                idempotencyKey: taskRunIdempotencyKey,
                environmentId: launchEnvironmentId || undefined,
                agentId: launchAgentId || undefined,
                moveToInProgress: true,
                metadata: {
                  triggerKind: "manual",
                  source: normalizedRunKind === "review"
                    ? "project_task_review"
                    : "project_task",
                  runKind: normalizedRunKind,
                  runnerPlayground: {
                    enabledSkills: enabledSkillsPayload,
                    githubRepo: githubRepo || undefined,
                    connectors: launchConnectors,
                    taskPreview,
                  },
                },
              }),
            };
            let response;
            try {
              response = await fetch(
                backendUrl + "/tasks/" + encodeURIComponent(task.id) + "/run-thread",
                taskRunRequest,
              );
            } catch {
              response = await fetch(
                backendUrl + "/tasks/" + encodeURIComponent(task.id) + "/run-thread",
                taskRunRequest,
              );
            }
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start thread from task.");
            }
            const threadRecord = getPlaygroundThreadResponseRecord(data);
            const updatedTask = getPlaygroundTaskResponseRecord(data);
            const agentSessionRecord = data?.agentSession && typeof data.agentSession === "object"
              ? data.agentSession
              : null;

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
            if (agentSessionRecord?.id) {
              setSelectedProjectDetail((current) => {
                if (!current?.project?.id || current.project.id !== updatedTask.projectId) {
                  return current;
                }
                const currentSessions = Array.isArray(current.agentSessions)
                  ? current.agentSessions
                  : [];
                return {
                  ...current,
                  agentSessions: [
                    agentSessionRecord,
                    ...currentSessions.filter((session) => (
                      String(session?.id || "").trim() !== String(agentSessionRecord.id).trim()
                    )),
                  ],
                };
              });
            }
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

	        function normalizeProjectFullAutoRun(run, projectId = selectedProjectId) {
	          const source = run && typeof run === "object" && !Array.isArray(run) ? run : {};
	          const normalizedStatus = String(source.status || "idle").trim().toLowerCase() || "idle";
	          return {
	            projectId: String(source.projectId || projectId || "").trim(),
	            runId: String(source.id || "").trim(),
	            status: normalizedStatus,
	            steps: Array.isArray(source.steps) ? source.steps : [],
	            startedCount: Math.max(0, Number(source.startedCount) || 0),
	            completedCount: Math.max(0, Number(source.completedCount) || 0),
	            failedCount: Math.max(0, Number(source.failedCount) || 0),
	            isLoading: false,
	            isSaving: false,
	            error: String(source.lastErrorMessage || "").trim(),
	          };
	        }

	        async function refreshProjectFullAutoRun(projectId, runId = "", options = {}) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedRunId = String(runId || "").trim();
	          if (!normalizedProjectId) {
	            return null;
	          }
	          if (!options?.silent) {
	            setProjectFullAutoState((current) => ({
	              ...current,
	              projectId: normalizedProjectId,
	              isLoading: true,
	              error: "",
	            }));
	          }
	          try {
	            const path = normalizedRunId
	              ? (
	                  "/projects/" + encodeURIComponent(normalizedProjectId)
	                  + "/automation-runs/" + encodeURIComponent(normalizedRunId)
	                )
	              : (
	                  "/projects/" + encodeURIComponent(normalizedProjectId)
	                  + "/automation-runs/latest"
	                );
	            const response = await fetch(backendUrl + path, {
	              method: "GET",
	              headers: requestHeaders,
	            });
	            if (response.status === 404) {
	              const emptyState = {
	                projectId: normalizedProjectId,
	                runId: "",
	                status: "idle",
	                steps: [],
	                startedCount: 0,
	                completedCount: 0,
	                failedCount: 0,
	                isLoading: false,
	                isSaving: false,
	                error: "",
	              };
	              setProjectFullAutoState(emptyState);
	              return null;
	            }
	            const data = await response.json().catch(() => ({}));
	            if (!response.ok) {
	              throw new Error(data?.message || data?.error || "Failed to load Full Auto.");
	            }
	            const nextState = normalizeProjectFullAutoRun(data?.automationRun, normalizedProjectId);
	            setProjectFullAutoState(nextState);
	            if (["completed", "failed", "cancelled"].includes(nextState.status)) {
	              void loadProjectWorkspace(normalizedProjectId);
	            }
	            return data?.automationRun || null;
	          } catch (error) {
	            setProjectFullAutoState((current) => ({
	              ...current,
	              projectId: normalizedProjectId,
	              isLoading: false,
	              isSaving: false,
	              error: error instanceof Error ? error.message : "Failed to load Full Auto.",
	            }));
	            return null;
	          }
	        }

	        async function startProjectFullAutoMode() {
	          if (!selectedProjectId || projectFullAutoState.isSaving) {
	            return;
	          }
	          if (!canStartThreads) {
	            if (onRequireAuth) {
	              onRequireAuth();
	            }
	            return;
	          }
	          setProjectFullAutoState((current) => ({
	            ...current,
	            projectId: selectedProjectId,
	            isSaving: true,
	            error: "",
	          }));
	          try {
	            const idempotencyKey = "project-full-auto-"
	              + selectedProjectId + "-"
	              + (
	                globalThis.crypto?.randomUUID?.()
	                || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
	              );
	            const response = await fetch(
	              backendUrl + "/projects/" + encodeURIComponent(selectedProjectId) + "/automation-runs",
	              {
	                method: "POST",
	                headers: {
	                  ...requestHeaders,
	                  "Content-Type": "application/json",
	                  "Idempotency-Key": idempotencyKey,
	                },
	                body: JSON.stringify({
	                  maxTasks: 100,
	                  stopOnFailure: true,
	                  idempotencyKey,
	                }),
	              },
	            );
	            const data = await response.json().catch(() => ({}));
	            if (!response.ok) {
	              throw new Error(data?.message || data?.error || "Failed to start Full Auto.");
	            }
	            setProjectFullAutoState(
	              normalizeProjectFullAutoRun(data?.automationRun, selectedProjectId),
	            );
	          } catch (error) {
	            setProjectFullAutoState((current) => ({
	              ...current,
	              isSaving: false,
	              error: error instanceof Error ? error.message : "Failed to start Full Auto.",
	            }));
	          }
	        }

	        async function performProjectFullAutoAction(action) {
	          const normalizedAction = String(action || "").trim().toLowerCase();
	          const runId = String(projectFullAutoState.runId || "").trim();
	          if (
	            !selectedProjectId
	            || !runId
	            || !["pause", "resume", "cancel"].includes(normalizedAction)
	            || projectFullAutoState.isSaving
	          ) {
	            return;
	          }
	          setProjectFullAutoState((current) => ({
	            ...current,
	            isSaving: true,
	            error: "",
	          }));
	          try {
	            const response = await fetch(
	              backendUrl + "/projects/" + encodeURIComponent(selectedProjectId)
	                + "/automation-runs/" + encodeURIComponent(runId)
	                + "/" + normalizedAction,
	              {
	                method: "POST",
	                headers: {
	                  ...requestHeaders,
	                  "Content-Type": "application/json",
	                },
	                body: "{}",
	              },
	            );
	            const data = await response.json().catch(() => ({}));
	            if (!response.ok) {
	              throw new Error(
	                data?.message || data?.error || "Failed to update Full Auto.",
	              );
	            }
	            setProjectFullAutoState(
	              normalizeProjectFullAutoRun(data?.automationRun, selectedProjectId),
	            );
	          } catch (error) {
	            setProjectFullAutoState((current) => ({
	              ...current,
	              isSaving: false,
	              error: error instanceof Error ? error.message : "Failed to update Full Auto.",
	            }));
	          }
	        }

	        function stopProjectFullAutoMode() {
	          void performProjectFullAutoAction("pause");
	        }

	        function resumeProjectFullAutoMode() {
	          void performProjectFullAutoAction("resume");
	        }

	        function cancelProjectFullAutoMode() {
	          void performProjectFullAutoAction("cancel");
	        }

	        useEffect(() => {
	          if (!selectedProjectId) {
	            return;
	          }
	          void refreshProjectFullAutoRun(selectedProjectId);
	        }, [selectedProjectId]);

	        useEffect(() => {
	          const runId = String(projectFullAutoState.runId || "").trim();
	          if (
	            !selectedProjectId
	            || projectFullAutoState.projectId !== selectedProjectId
	            || !runId
	            || !["queued", "running"].includes(projectFullAutoState.status)
	          ) {
	            return undefined;
	          }
	          const intervalId = window.setInterval(() => {
	            void refreshProjectFullAutoRun(selectedProjectId, runId, {
	              silent: true,
	            });
	          }, 2500);
	          return () => window.clearInterval(intervalId);
	        }, [
	          projectFullAutoState.projectId,
	          projectFullAutoState.runId,
	          projectFullAutoState.status,
	          selectedProjectId,
	        ]);

	        function getDraftTaskConnectorSelection(source, taskRecord = draftTask) {
          const connectorKey = getPlaygroundTaskConnectorKey(source);
          if (!connectorKey) {
            return null;
          }
          const connectors = normalizePlaygroundTaskConnectorSelections(taskRecord?.connectors);
          return connectors[connectorKey] || null;
        }

`;
