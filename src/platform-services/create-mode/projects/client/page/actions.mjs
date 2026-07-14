import { CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS } from "../../../calendar/client/projects-integration/page-actions/index.mjs";
export const PROJECTS_PAGE_ACTIONS_SCRIPT = `        function updateDraftTask(updater, options = {}) {
          const baseTask = normalizePlaygroundTaskRecord(draftTask || selectedTaskSnapshot || buildPlaygroundDefaultTaskDraft());
          const nextTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata(
            typeof updater === "function" ? updater(baseTask) : updater
          ));
          setDraftTask(nextTask);
          editorDirtyRef.current = true;
          setSaveState((current) => ({
            ...current,
            error: "",
            message: "",
          }));
          if (options.autosave) {
            queueTaskAutosave(nextTask);
          }
          return nextTask;
        }

        function updateDraftField(field, value, options = {}) {
          updateDraftTask((current) => ({
            ...current,
            [field]: value,
          }), options);
        }

        function commitTaskTitleInput() {
          if (!draftTask?.id) {
            return;
          }
          if (taskTitleSkipCommitRef.current) {
            taskTitleSkipCommitRef.current = false;
            setTaskTitleInputValue(draftTask.title || "");
            return;
          }
          const nextTitle = normalizePlaygroundEditableTaskTitle(taskTitleInputValue);
          setTaskTitleInputValue(nextTitle);
          if (nextTitle === String(draftTask.title || "").trim()) {
            return;
          }
          updateDraftTask((current) => ({
            ...current,
            title: nextTitle,
          }), { autosave: true });
        }

        function beginBacklogTitleEdit(task) {
          if (!task?.id) {
            return;
          }
          setBacklogEditingTaskId(task.id);
          setBacklogTitleInputValue(task.title || "");
        }

        function cancelBacklogTitleEdit(task) {
          setBacklogEditingTaskId("");
          setBacklogTitleInputValue(task?.title || "");
        }

        async function commitBacklogTaskTitle(task) {
          if (!task?.id) {
            return;
          }
          if (backlogTitleSkipCommitRef.current === task.id) {
            backlogTitleSkipCommitRef.current = "";
            setBacklogEditingTaskId("");
            setBacklogTitleInputValue(task.title || "");
            return;
          }
          const nextTitle = normalizePlaygroundEditableTaskTitle(backlogTitleInputValue);
          setBacklogEditingTaskId("");
          setBacklogTitleInputValue(nextTitle);
          if (nextTitle === String(task.title || "").trim()) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const savedTask = await patchTaskRecord(task, {
              title: nextTitle,
            });
            commitLocalTaskRecord(savedTask, {
              selectTask: selectedTaskIdRef.current === savedTask.id,
            });
            resetSaveState(selectedTaskIdRef.current === savedTask.id ? "Saved" : "");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to save task title.",
              message: "",
            });
          }
        }

        function commitLocalTaskRecordBatch(taskRecords) {
          const normalizedUpdates = (Array.isArray(taskRecords) ? taskRecords : [])
            .map((task) => normalizePlaygroundTaskRecord(task))
            .filter((task) => task?.id);
          if (normalizedUpdates.length === 0) {
            return [];
          }

          const updatesById = {};
          normalizedUpdates.forEach((task) => {
            updatesById[task.id] = task;
          });

          let nextTasks = tasks;
          setTasks((current) => {
            const existingIds = new Set(current.map((task) => task.id));
            nextTasks = current.map((task) => updatesById[task.id] || task);
            normalizedUpdates.forEach((task) => {
              if (!existingIds.has(task.id)) {
                nextTasks = nextTasks.concat(task);
              }
            });
            return nextTasks;
          });

          syncProjectSummary(selectedProjectId, nextTasks, sprints, releases, selectedProjectSummary);

          const selectedUpdatedTask = updatesById[selectedTaskIdRef.current];
          if (selectedUpdatedTask) {
            setDraftTask((current) => {
              if (!current || current.id !== selectedUpdatedTask.id) {
                return normalizePlaygroundTaskRecord(selectedUpdatedTask);
              }
              return normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
                ...current,
                sortOrder: selectedUpdatedTask.sortOrder,
                taskType: selectedUpdatedTask.taskType,
                parentTaskId: selectedUpdatedTask.parentTaskId,
                metadata: selectedUpdatedTask.metadata,
              }));
            });
          }

          return normalizedUpdates;
        }

        function clearBacklogDragState() {
          setBacklogDraggingTaskId("");
          setBacklogDropTargetKey("");
          setBacklogReleaseDropTargetId("");
        }

        function clearBoardDragState() {
          setBoardDraggingTaskId("");
          setBoardDropLaneId("");
        }

        function getBoardTaskAllowedDropLaneIds(taskRecord) {
          const boardStatus = getTaskBoardStatus(taskRecord);
          if (isHumanAssignedTask(taskRecord)) {
            return PLAYGROUND_TASK_BOARD_LANES
              .map((lane) => lane.id)
              .filter((laneId) => laneId !== boardStatus);
          }
          if (boardStatus === "todo") {
            return ["in_progress", "blocked"];
          }
	          if (boardStatus === "blocked") {
	            return ["todo"];
	          }
	          if (boardStatus === "in_review") {
	            return ["done", "todo", "blocked"];
	          }
	          return [];
	        }

        function canDropTaskOnBoardLane(taskRecord, laneId) {
          return getBoardTaskAllowedDropLaneIds(taskRecord).includes(String(laneId || "").trim());
        }

        function openBoardBlockedPicker(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const taskId = String(normalizedTask.id || "").trim();
          if (!taskId) {
            return;
          }
          setBoardBlockedPickerState({
            taskId,
            taskTitle: normalizedTask.title || "Untitled Task",
            ticketNumber: taskTicketNumbersById[taskId] || normalizedTask.ticketNumber || "000",
            isSubmitting: false,
            error: "",
          });
        }

        async function moveTaskToTodoFromBlocked(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          if (!normalizedTask?.id) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const updatedTask = await patchTaskRecord(normalizedTask, {
              status: "todo",
              dependencyIds: [],
              completedAt: null,
            });
            commitLocalTaskRecord(updatedTask, {
              selectTask: selectedTaskIdRef.current === updatedTask.id,
            });
            resetSaveState("Task moved to To do");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to move task.",
              message: "",
            });
          }
        }

        async function moveTaskToInProgress(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          if (!normalizedTask?.id) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const updatedTask = await patchTaskRecord(normalizedTask, {
              status: "in_progress",
              completedAt: null,
            });
            commitLocalTaskRecord(updatedTask, {
              selectTask: selectedTaskIdRef.current === updatedTask.id,
            });
            resetSaveState("Task moved to In doing");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to update task.",
              message: "",
            });
          }
        }

        async function moveHumanTaskToBoardStatus(taskRecord, targetStatus) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const normalizedTargetStatus = PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === targetStatus)
            ? targetStatus
            : "";
	          const canMoveDirectly = isHumanAssignedTask(normalizedTask)
	            || getTaskBoardStatus(normalizedTask) === "in_review"
	            || normalizedTargetStatus === "in_review";
	          if (!normalizedTask?.id || !normalizedTargetStatus || !canMoveDirectly) {
	            return;
	          }

          const completedAt = normalizedTargetStatus === "done" ? new Date().toISOString() : null;
          const optimisticTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...normalizedTask,
            status: normalizedTargetStatus,
            completedAt,
            dependencyIds: normalizedTargetStatus === "blocked"
              ? normalizePlaygroundIdList(normalizedTask.dependencyIds)
              : [],
          }));
          const previousTask = normalizePlaygroundTaskRecord(normalizedTask);
          const shouldKeepSelection = selectedTaskIdRef.current === optimisticTask.id;

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
              status: normalizedTargetStatus,
              completedAt,
              dependencyIds: optimisticTask.dependencyIds,
            });
            commitLocalTaskRecord(updatedTask, {
              selectTask: shouldKeepSelection,
            });
            resetSaveState(
              normalizedTargetStatus === "done"
                ? "Task moved to Finished"
                : normalizedTargetStatus === "blocked"
                  ? "Task moved to Blocked"
                  : normalizedTargetStatus === "in_review"
                    ? "Task moved to In Review"
                    : normalizedTargetStatus === "in_progress"
                      ? "Task moved to In doing"
                      : "Task moved to To do"
	            );
          } catch (error) {
            commitLocalTaskRecord(previousTask, {
              selectTask: shouldKeepSelection,
              syncDraft: shouldKeepSelection,
              markClean: true,
            });
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to update task.",
              message: "",
            });
          }
        }

        async function handleBoardBlockedDependencySelection(blockedByTaskId) {
          const dialogState = boardBlockedPickerState;
          const draggedTask = dialogState?.taskId ? tasksById[dialogState.taskId] || null : null;
          const normalizedBlockedByTaskId = String(blockedByTaskId || "").trim();
          if (!dialogState?.taskId || !draggedTask || !normalizedBlockedByTaskId || dialogState.isSubmitting) {
            return;
          }

          setBoardBlockedPickerState({
            ...dialogState,
            isSubmitting: true,
            error: "",
          });
          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const updatedTask = await patchTaskRecord(draggedTask, {
              status: "blocked",
              dependencyIds: [normalizedBlockedByTaskId],
              completedAt: null,
            });
            commitLocalTaskRecord(updatedTask, {
              selectTask: selectedTaskIdRef.current === updatedTask.id,
            });
            setBoardBlockedPickerState(null);
            resetSaveState("Task moved to Blocked");
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update blocked task.";
            setSaveState({
              isSaving: false,
              error: message,
              message: "",
            });
            setBoardBlockedPickerState((current) => current && current.taskId === dialogState.taskId
              ? {
                  ...current,
                  isSubmitting: false,
                  error: message,
                }
              : current
            );
          }
        }

        async function handleBoardLaneMove(taskRecord, targetLaneId) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const normalizedTargetLaneId = String(targetLaneId || "").trim();
          if (!normalizedTask?.id || !normalizedTargetLaneId || !canDropTaskOnBoardLane(normalizedTask, normalizedTargetLaneId)) {
            return;
          }

          clearBoardDragState();

          if (normalizedTargetLaneId === "in_progress") {
            if (isHumanAssignedTask(normalizedTask)) {
              await moveHumanTaskToBoardStatus(normalizedTask, "in_progress");
              return;
            }
            await handleStartTaskThread(normalizedTask);
            return;
          }

	          if (normalizedTargetLaneId === "blocked") {
	            if (isHumanAssignedTask(normalizedTask)) {
              await moveHumanTaskToBoardStatus(normalizedTask, "blocked");
              return;
	            }
	            if (getTaskBoardStatus(normalizedTask) === "in_review") {
              await moveHumanTaskToBoardStatus(normalizedTask, "blocked");
              return;
	            }
	            openBoardBlockedPicker(normalizedTask);
	            return;
	          }

	          if (normalizedTargetLaneId === "todo") {
	            if (isHumanAssignedTask(normalizedTask) || getTaskBoardStatus(normalizedTask) === "in_review") {
              await moveHumanTaskToBoardStatus(normalizedTask, "todo");
              return;
	            }
	            await moveTaskToTodoFromBlocked(normalizedTask);
	            return;
	          }

	          if (normalizedTargetLaneId === "in_review") {
	            await moveHumanTaskToBoardStatus(normalizedTask, "in_review");
	            return;
	          }

	          if (normalizedTargetLaneId === "done" && (isHumanAssignedTask(normalizedTask) || getTaskBoardStatus(normalizedTask) === "in_review")) {
	            await moveHumanTaskToBoardStatus(normalizedTask, "done");
	          }
        }

        function getBacklogManualOrderDropTargetKey(parentTaskId, insertIndex) {
          return "backlog-drop:" + (parentTaskId || "__root__") + ":" + String(insertIndex);
        }

        function getBacklogSiblingTasks(parentTaskId, options = {}) {
          const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
          const hasReleaseScope = Object.prototype.hasOwnProperty.call(options, "releaseId");
          const normalizedReleaseId = hasReleaseScope && typeof options.releaseId === "string" && options.releaseId.trim()
            ? options.releaseId.trim()
            : "";
          return tasks
            .filter((task) => normalizePlaygroundParentTaskId(getPlaygroundTaskParentTaskId(task)) === normalizedParentTaskId)
            .filter((task) => {
              if (normalizedParentTaskId || !hasReleaseScope) {
                return true;
              }
              const taskReleaseId = typeof task.releaseId === "string" && task.releaseId.trim() ? task.releaseId.trim() : "";
              return taskReleaseId === normalizedReleaseId;
            })
            .slice()
            .sort(compareBacklogDefaultTaskOrder);
        }

        function canBacklogTaskMoveToParentTask(taskRecord, parentTaskId) {
          const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
          if (!taskRecord?.id || !normalizedParentTaskId) {
            return !normalizedParentTaskId;
          }

          const targetParentTask = tasksById[normalizedParentTaskId] || null;
          if (!targetParentTask || isPlaygroundSubtaskRecord(targetParentTask) || taskRecord.id === normalizedParentTaskId) {
            return false;
          }

          const visited = new Set();
          let currentTask = targetParentTask;
          while (currentTask?.id && !visited.has(currentTask.id)) {
            if (currentTask.id === taskRecord.id) {
              return false;
            }
            visited.add(currentTask.id);
            const ancestorId = getPlaygroundTaskParentTaskId(currentTask);
            currentTask = ancestorId ? tasksById[ancestorId] || null : null;
          }

          return true;
        }

        function buildBacklogManualSortOrder(index) {
          return (index + 1) * 1000;
        }

        function getNextBacklogReleaseSectionSortOrder(releaseId) {
          const normalizedReleaseId = typeof releaseId === "string" && releaseId.trim() ? releaseId.trim() : "";
          const siblingSortOrders = tasks
            .filter((task) => !getPlaygroundTaskParentTaskId(task))
            .filter((task) => {
              const taskReleaseId = typeof task.releaseId === "string" && task.releaseId.trim() ? task.releaseId.trim() : "";
              return taskReleaseId === normalizedReleaseId;
            })
            .map((task) => Number.isFinite(task?.sortOrder) ? Number(task.sortOrder) : 0);
          if (siblingSortOrders.length === 0) {
            return buildBacklogManualSortOrder(0);
          }
          return Math.max(...siblingSortOrders) + 1000;
        }

        function canDragTaskAcrossReleaseSections(taskRecord) {
          if (!taskRecord?.id || selectedReleaseId || saveState.isSaving) {
            return false;
          }
          if (isPlaygroundSubtaskRecord(taskRecord) || getPlaygroundTaskParentTaskId(taskRecord)) {
            return false;
          }
          return true;
        }

        function canDropTaskOnBacklogReleaseSection(taskRecord, targetReleaseId) {
          if (!canDragTaskAcrossReleaseSections(taskRecord)) {
            return false;
          }
          const normalizedTargetReleaseId = typeof targetReleaseId === "string" && targetReleaseId.trim() ? targetReleaseId.trim() : "";
          const currentReleaseId = typeof taskRecord.releaseId === "string" && taskRecord.releaseId.trim() ? taskRecord.releaseId.trim() : "";
          return currentReleaseId !== normalizedTargetReleaseId;
        }

        async function handleBacklogReleaseSectionDrop(targetReleaseId) {
          const draggingTaskId = String(backlogDraggingTaskId || "").trim();
          const draggedTask = draggingTaskId ? tasksById[draggingTaskId] || null : null;
          const normalizedTargetReleaseId = typeof targetReleaseId === "string" && targetReleaseId.trim() ? targetReleaseId.trim() : "";

          clearBacklogDragState();

          if (!draggedTask?.id || !canDropTaskOnBacklogReleaseSection(draggedTask, normalizedTargetReleaseId)) {
            return;
          }

          const nextSortOrder = getNextBacklogReleaseSectionSortOrder(normalizedTargetReleaseId);
          const updatedTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...draggedTask,
            releaseId: normalizedTargetReleaseId || null,
            sortOrder: nextSortOrder,
          }));

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          commitLocalTaskRecord(updatedTask, {
            selectTask: selectedTaskIdRef.current === updatedTask.id,
          });

          try {
            const savedTask = await patchTaskRecord(updatedTask);
            commitLocalTaskRecord(savedTask, {
              selectTask: selectedTaskIdRef.current === savedTask.id,
            });
            const nextReleaseName = normalizedTargetReleaseId
              ? (releasesById[normalizedTargetReleaseId]?.name || "milestone")
              : "All other";
            resetSaveState("Moved to " + nextReleaseName);
          } catch (error) {
            await loadProjectWorkspace(selectedProjectId);
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to move ticket to milestone.",
              message: "",
            });
          }
        }

        function resolveBacklogInsertionIndex(targetSiblings, visibleSiblingIds, insertIndex) {
          const normalizedVisibleSiblingIds = normalizePlaygroundIdList(visibleSiblingIds);
          const beforeVisibleTaskId = normalizedVisibleSiblingIds[insertIndex] || "";
          const afterVisibleTaskId = insertIndex > 0 ? normalizedVisibleSiblingIds[insertIndex - 1] || "" : "";

          if (beforeVisibleTaskId) {
            const beforeIndex = targetSiblings.findIndex((task) => task.id === beforeVisibleTaskId);
            if (beforeIndex >= 0) {
              return beforeIndex;
            }
          }

          if (afterVisibleTaskId) {
            const afterIndex = targetSiblings.findIndex((task) => task.id === afterVisibleTaskId);
            if (afterIndex >= 0) {
              return afterIndex + 1;
            }
          }

          return beforeVisibleTaskId ? targetSiblings.length : 0;
        }

        async function handleBacklogTaskDrop(targetParentTaskId, visibleSiblingIds, insertIndex, targetReleaseId = undefined) {
          const draggingTaskId = String(backlogDraggingTaskId || "").trim();
          const draggedTask = draggingTaskId ? tasksById[draggingTaskId] || null : null;
          const normalizedTargetParentTaskId = normalizePlaygroundParentTaskId(targetParentTaskId);
          const targetParentTask = normalizedTargetParentTaskId ? tasksById[normalizedTargetParentTaskId] || null : null;
          const hasTargetReleaseScope = targetReleaseId !== undefined && !normalizedTargetParentTaskId;
          const normalizedTargetReleaseId = hasTargetReleaseScope && typeof targetReleaseId === "string" && targetReleaseId.trim()
            ? targetReleaseId.trim()
            : "";

          clearBacklogDragState();

          if (!draggedTask?.id || backlogSortMode !== "default") {
            return;
          }

          if (normalizedTargetParentTaskId && (!targetParentTask || !canBacklogTaskMoveToParentTask(draggedTask, normalizedTargetParentTaskId))) {
            return;
          }

          const currentParentTaskId = getPlaygroundTaskParentTaskId(draggedTask);
          const currentReleaseId = typeof draggedTask.releaseId === "string" && draggedTask.releaseId.trim()
            ? draggedTask.releaseId.trim()
            : "";
          const nextTaskType = normalizedTargetParentTaskId ? "subtask" : "task";
          const targetSiblingTasks = getBacklogSiblingTasks(
            normalizedTargetParentTaskId,
            hasTargetReleaseScope ? { releaseId: normalizedTargetReleaseId } : {}
          ).filter((task) => task.id !== draggedTask.id);
          const insertionIndex = resolveBacklogInsertionIndex(targetSiblingTasks, visibleSiblingIds, insertIndex);
          const movedTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...draggedTask,
            taskType: nextTaskType,
            parentTaskId: normalizedTargetParentTaskId,
            releaseId: hasTargetReleaseScope ? (normalizedTargetReleaseId || null) : draggedTask.releaseId,
          }));

          const nextTargetSiblingTasks = targetSiblingTasks.slice();
          nextTargetSiblingTasks.splice(insertionIndex, 0, movedTask);

          const updatesById = new Map();
          const applySiblingOrderUpdates = (siblingTasks, releaseIdScope = undefined) => {
            siblingTasks.forEach((task, siblingIndex) => {
              const currentTask = tasksById[task.id] || null;
              if (!currentTask) {
                return;
              }
              const normalizedReleaseScope = releaseIdScope !== undefined && typeof releaseIdScope === "string" && releaseIdScope.trim()
                ? releaseIdScope.trim()
                : "";
              const nextTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
                ...task,
                releaseId: releaseIdScope !== undefined ? (normalizedReleaseScope || null) : task.releaseId,
                sortOrder: buildBacklogManualSortOrder(siblingIndex),
              }));
              if (
                currentTask.sortOrder !== nextTask.sortOrder
                || normalizePlaygroundTaskType(currentTask.taskType) !== normalizePlaygroundTaskType(nextTask.taskType)
                || normalizePlaygroundParentTaskId(currentTask.parentTaskId) !== normalizePlaygroundParentTaskId(nextTask.parentTaskId)
                || ((typeof currentTask.releaseId === "string" && currentTask.releaseId.trim() ? currentTask.releaseId.trim() : "")
                  !== (typeof nextTask.releaseId === "string" && nextTask.releaseId.trim() ? nextTask.releaseId.trim() : ""))
              ) {
                updatesById.set(nextTask.id, nextTask);
              }
            });
          };

          applySiblingOrderUpdates(nextTargetSiblingTasks, hasTargetReleaseScope ? normalizedTargetReleaseId : undefined);
          if (currentParentTaskId !== normalizedTargetParentTaskId || (hasTargetReleaseScope && currentReleaseId !== normalizedTargetReleaseId)) {
            applySiblingOrderUpdates(
              getBacklogSiblingTasks(
                currentParentTaskId,
                hasTargetReleaseScope && !currentParentTaskId ? { releaseId: currentReleaseId } : {}
              ).filter((task) => task.id !== draggedTask.id),
              hasTargetReleaseScope && !currentParentTaskId ? currentReleaseId : undefined
            );
          }

          const changedTasks = Array.from(updatesById.values());
          if (changedTasks.length === 0) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          commitLocalTaskRecordBatch(changedTasks);

          try {
            const savedTasks = [];
            for (const changedTask of changedTasks) {
              savedTasks.push(await patchTaskRecord(changedTask));
            }
            commitLocalTaskRecordBatch(savedTasks);
            resetSaveState("Backlog order saved");
          } catch (error) {
            await loadProjectWorkspace(selectedProjectId);
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to update backlog order.",
              message: "",
            });
          }
        }

        function handleBacklogTaskDragStart(task, event) {
          const canManualSort = backlogSortMode === "default";
          const canReleaseReassign = canDragTaskAcrossReleaseSections(task);
          if ((!canManualSort && !canReleaseReassign) || saveState.isSaving || !task?.id) {
            event.preventDefault();
            return;
          }

          const target = event?.target instanceof Element ? event.target : null;
          if (target?.closest("input, button, textarea, a, select")) {
            event.preventDefault();
            return;
          }

          setBacklogDraggingTaskId(task.id);
          setBacklogDropTargetKey("");
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", task.id);
          }
        }

        function handleBacklogTaskDragEnd() {
          clearBacklogDragState();
        }

        function getTaskCommentDisplayName(comment) {
          if (comment?.authorAgentId && agentsById[comment.authorAgentId]?.name) {
            return agentsById[comment.authorAgentId].name;
          }
          return comment?.authorName || "Computer Agents";
        }

        function getTaskCommentAvatarLetter(name) {
          const initials = getAccountInitials(name || "Computer Agents");
          return (initials.charAt(0) || "C").toUpperCase();
        }

        function renderTaskCommentAvatar(comment, className) {
          const authorName = getTaskCommentDisplayName(comment);
          const authorAgent = comment?.authorAgentId ? agentsById[comment.authorAgentId] || null : null;
          const normalizedPhotoUrl = normalizeSessionPhotoUrl(
            typeof comment?.authorAvatarUrl === "string" && comment.authorAvatarUrl.trim()
              ? comment.authorAvatarUrl.trim()
              : authorAgent
                ? getPlaygroundAgentProfilePhotoUrl(authorAgent)
                : ""
          );
          const avatarLetter = getTaskCommentAvatarLetter(authorName);
          return React.createElement("div", { className },
            canRenderAvatarImage(normalizedPhotoUrl)
              ? React.createElement("img", {
                  className: className + "-image",
                  src: normalizedPhotoUrl,
                  alt: avatarLetter,
                })
              : React.createElement("span", { className: className + "-fallback" }, avatarLetter)
          );
        }

        function renderAgentNameAvatar(name, className, photoUrl = "") {
          const normalizedName = String(name || "").trim() || "Computer Agents";
          const avatarLetter = getTaskCommentAvatarLetter(normalizedName);
          return React.createElement("div", { className, title: normalizedName, "aria-hidden": "true" },
            canRenderAvatarImage(photoUrl)
              ? React.createElement("img", {
                  className: className + "-image",
                  src: photoUrl,
                  alt: avatarLetter,
                })
              : React.createElement("span", { className: className + "-fallback" }, avatarLetter)
          );
        }

        function renderTaskActorAvatar(actorId, className) {
          const normalizedActorId = String(actorId || "").trim();
          if (!normalizedActorId) {
            return null;
          }
          const actorName = getTaskAssigneeName(normalizedActorId, "");
          if (!actorName) {
            return null;
          }
          if (isPlaygroundHumanAssigneeId(normalizedActorId)) {
            const currentUserInitials = getAccountInitials(currentUserName || "Me");
            const currentUserPhotoUrl = canRenderAvatarImage(currentUserAvatarUrl) ? currentUserAvatarUrl : "";
            return React.createElement("div", { className, title: actorName, "aria-hidden": "true" },
              currentUserPhotoUrl
                ? React.createElement("img", {
                    className: className + "-image",
                    src: currentUserPhotoUrl,
                    alt: currentUserInitials,
                  })
                : React.createElement("span", { className: className + "-fallback" }, currentUserInitials)
            );
          }
          const actorAgent = agentsById[normalizedActorId] || assignableActorsById[normalizedActorId] || null;
          const actorPhotoUrl = actorAgent
            ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(actorAgent))
            : "";
          return renderAgentNameAvatar(actorName, className, actorPhotoUrl);
        }

        function renderTaskDetailPersonValue(actorId, label) {
          const normalizedActorId = String(actorId || "").trim();
          return React.createElement("span", { className: "playground-tasks-detail-person-value" },
            renderTaskActorAvatar(normalizedActorId, "playground-tasks-detail-person-avatar"),
            React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, label)
          );
        }

        function renderTaskAssigneeAvatar(task, className) {
          return renderTaskActorAvatar(task?.assigneeAgentId, className);
        }

        function getTaskCommentSubmissionDraft(value) {
          const rawValue = String(value || "").replaceAll(String.fromCharCode(13), "").trim();
          const isSlashReviewMode = /^\\/review(?:\\s+|$)/i.test(rawValue);
          const body = isSlashReviewMode
            ? rawValue.replace(/^\\/review(?:\\s+|$)/i, "").trim()
            : rawValue;
          return {
            body,
            isReview: taskCommentMode === "review" || isSlashReviewMode,
          };
        }

        function focusTaskCommentTextarea() {
          if (typeof window === "undefined") {
            return;
          }
          window.requestAnimationFrame(() => {
            const textarea = taskCommentTextareaRef.current;
            if (!textarea) {
              return;
            }
            textarea.focus();
            textarea.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
            resizeTaskCommentTextarea(textarea);
          });
        }

        function activateTaskReviewCommentMode() {
          setTaskCommentMode("review");
          focusTaskCommentTextarea();
        }

        async function handleAddTaskComment() {
          if (!draftTask?.id) {
            return;
          }
          const commentSubmission = getTaskCommentSubmissionDraft(taskCommentInputValue);
          const nextCommentBody = commentSubmission.body;
          if (!nextCommentBody) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(draftTask.id) + "/comments", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                body: nextCommentBody,
                authorType: "user",
                authorName: currentUserName || undefined,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to add comment.");
            }

            const createdComment = getPlaygroundTaskCommentResponseRecord(data);
            let nextTaskRecord = null;
            if (createdComment) {
              const nextComments = normalizePlaygroundTaskCommentList((draftTask.comments || []).concat(createdComment));
              nextTaskRecord = applyRefreshedTaskDetails({
                ...normalizePlaygroundTaskRecord(draftTask),
                comments: nextComments,
              });
            } else {
              await loadTaskDetails(draftTask.id);
            }

            setTaskCommentInputValue("");
            setTaskCommentMode("");
            setTaskCommentComposerOpen(false);
            if (commentSubmission.isReview) {
              const taskForReviewRequest = nextTaskRecord || normalizePlaygroundTaskRecord({
                ...draftTask,
                comments: normalizePlaygroundTaskCommentList(draftTask.comments),
              });
              await handleStartTaskThread(taskForReviewRequest, {
                allowAdditionalThread: true,
                preferProvidedTask: true,
                reviewRequestBody: nextCommentBody,
                reviewCommentId: createdComment?.id || "",
                successMessage: "Change request started",
              });
            } else {
              resetSaveState("Comment added");
            }
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to add comment.",
              message: "",
            });
          }
        }

        async function handleApproveTaskReview() {
          if (!draftTask?.id) {
            return;
          }

          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const updatedTask = await patchTaskRecord(draftTask, {
              status: "done",
              completedAt: new Date().toISOString(),
            });
            commitLocalTaskRecord(updatedTask, {
              selectTask: selectedTaskIdRef.current === updatedTask.id,
            });
            resetSaveState("Task approved");
          } catch (error) {
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to approve task.",
              message: "",
            });
          }
        }

        function getLatestImplementationThreadIdForSelectedTask() {
            const implementationThread = selectedTaskThreads
              .filter((thread) => {
                const taskPreview = getThreadTaskPreview(thread);
                const normalizedRunKind = String(taskPreview?.runKind || "").trim().toLowerCase();
                return normalizedRunKind !== "review";
              })
            .sort(compareThreadsByRecent)[0] || null;
          const latestImplementationThreadId = String(implementationThread?.id || "").trim();
          if (latestImplementationThreadId) {
            return latestImplementationThreadId;
          }
          const lastStartedThreadId = String(draftTask?.lastStartedThreadId || "").trim();
          if (lastStartedThreadId) {
            return lastStartedThreadId;
          }
          const linkedThreadIds = normalizePlaygroundIdList(draftTask?.linkedThreadIds);
          return linkedThreadIds[linkedThreadIds.length - 1] || "";
        }

        async function handleStartSelectedTaskAgentReview() {
          if (!draftTask?.id) {
            return;
          }
          if (typeof onStartAgentReviewThread !== "function") {
            setSaveState({
              isSaving: false,
              error: "Agent review cannot be started from this view.",
              message: "",
            });
            return;
          }

	          const reviewerAgentId = String(draftTask.reviewerAgentId || "").trim();
	          if (!reviewerAgentId || isPlaygroundHumanAssigneeId(reviewerAgentId)) {
	            setSaveState({
	              isSaving: false,
	              error: "This ticket does not have an agent reviewer.",
	              message: "",
	            });
	            return;
	          }
          const normalizedTask = normalizePlaygroundTaskRecord({
            ...draftTask,
            status: "in_review",
            reviewRequired: true,
            reviewerAgentId,
          });
          const implementationThreadId = getLatestImplementationThreadIdForSelectedTask();
          setTaskAgentReviewStartPendingId(normalizedTask.id);
          setSaveState({
            isSaving: true,
            error: "",
            message: "",
          });

          try {
            const reviewThread = await onStartAgentReviewThread(normalizedTask, implementationThreadId, {
              taskId: normalizedTask.id,
              projectId: normalizedTask.projectId || selectedProjectId || "",
              projectName: selectedProject?.name || "",
              ticketNumber: normalizedTask.ticketNumber || taskTicketNumbersById[normalizedTask.id] || "",
              title: normalizedTask.title || "Untitled Task",
              runKind: "review",
              phase: "in_review",
              taskStatus: "in_review",
              reviewerAgentId,
            });
            if (reviewThread?.id) {
              setTaskDetailThreadRecords((current) => normalizeThreadList([reviewThread].concat(Array.isArray(current) ? current : [])));
            }
            resetSaveState("Agent review started");
            setTaskAgentReviewStartPendingId("");
          } catch (error) {
            setTaskAgentReviewStartPendingId("");
            setSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to start agent review.",
              message: "",
            });
          }
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.comments}
        function toggleTaskSkill(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0];
          if (!normalizedSkillId) {
            return;
          }
          updateDraftTask((current) => {
            const currentSkillIds = getEffectivePlaygroundTaskEnabledSkillIds(current);
            return {
              ...current,
              enabledSkills: currentSkillIds.includes(normalizedSkillId)
                ? currentSkillIds.filter((value) => value !== normalizedSkillId)
                : currentSkillIds.concat(normalizedSkillId),
            };
          }, { autosave: true });
        }

        function removeTaskSkill(skillId) {
          const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0];
          if (!normalizedSkillId) {
            return;
          }
          updateDraftTask((current) => ({
            ...current,
            enabledSkills: getEffectivePlaygroundTaskEnabledSkillIds(current).filter((value) => value !== normalizedSkillId),
          }), { autosave: true });
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.skills}
${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.scheduleDialog}
        function openTaskParentPicker() {
          if (!draftTask?.id) {
            return;
          }
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState({
            selectedParentTaskId: getPlaygroundTaskParentTaskId(draftTask) || "",
          });
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.parentPicker}
        function handleTaskTypeSelection(nextType) {
          const normalizedType = normalizePlaygroundTaskType(nextType);
          if (!draftTask?.id) {
            return;
          }
          const currentTaskType = normalizePlaygroundTaskType(draftTask.taskType);
          if (normalizedType === "subtask") {
            openTaskParentPicker();
            return;
          }
          if (currentTaskType === normalizedType && !normalizePlaygroundParentTaskId(draftTask.parentTaskId)) {
            return;
          }
          updateDraftTask((current) => ({
            ...current,
            taskType: normalizedType,
            parentTaskId: null,
          }), { autosave: true });
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.taskType}
        function handleSelectTaskParent(parentTaskId) {
          const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
          const parentTask = normalizedParentTaskId ? tasksById[normalizedParentTaskId] || null : null;
          if (!draftTask?.id || !normalizedParentTaskId || !parentTask || isPlaygroundSubtaskRecord(parentTask)) {
            return;
          }
          setTaskView("backlog");
          updateDraftTask((current) => ({
            ...current,
            taskType: "subtask",
            parentTaskId: normalizedParentTaskId,
          }), { autosave: true });
          setTaskParentPickerState(null);
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.parentSelection}
        function commitDraftTaskIfDirty() {
          if (!editorDirtyRef.current || !draftTask?.id || !selectedProjectId) {
            return;
          }
          queueTaskAutosave(draftTask);
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.draftUpdates}
        function restoreProjectOverviewSidebarAfterTaskClose() {
          if (!projectOverviewSidebarAutoCollapsedForTaskRef.current) {
            return;
          }
          projectOverviewSidebarAutoCollapsedForTaskRef.current = false;
          setProjectOverviewSidebarCollapsed(false);
        }

        function handleSelectTask(taskId, options = {}) {
          if (!selectedProjectId) return;
          const normalizedTaskId = String(taskId || "").trim();
          if (!normalizedTaskId) return;
          const shouldAutoCollapseProjectOverviewSidebar = !options?.screen
            && taskView === "overview"
            && !projectOverviewSidebarCollapsed;
          if (shouldAutoCollapseProjectOverviewSidebar) {
            projectOverviewSidebarAutoCollapsedForTaskRef.current = true;
            setProjectOverviewSidebarCollapsed(true);
          } else if (options?.screen || taskView !== "overview") {
            projectOverviewSidebarAutoCollapsedForTaskRef.current = false;
          }
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setMissionControlStrategyOpen(false);
          setProjectTaskDetailScreenOpen(Boolean(options?.screen));
          setSelectedTaskId(normalizedTaskId);
        }

        function openProjectTaskDetailScreen(taskId) {
          handleSelectTask(taskId, { screen: true });
        }

${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.taskNavigation}
        function handleTaskSurfaceClick(event) {
          if (!selectedProjectId || (!selectedTaskId && !missionControlStrategyOpen)) {
            return;
          }

          const target = event?.target instanceof Element ? event.target : null;
          if (!target) {
            restoreProjectOverviewSidebarAfterTaskClose();
            setSelectedTaskId("");
            setMissionControlStrategyOpen(false);
            return;
          }

          if (target.closest(".playground-tasks-card, .playground-tasks-backlog-item, .playground-tasks-backlog-composer-shell, .playground-tasks-lane-card, .playground-tasks-calendar-entry, .playground-tasks-ticket-screen, .playground-tasks-detail-panel, .playground-tasks-detail-shell, .playground-files-toolbar-anchor, .playground-files-control-button, .playground-files-toolbar-menu, .tb-runner-chat, .tb-popup-menu, .tb-selection-popup, .tb-file-browser-scrim, .tb-popup-modal-scrim, .playground-tasks-confirm-scrim, .playground-tasks-parent-picker-scrim")) {
            return;
          }

          restoreProjectOverviewSidebarAfterTaskClose();
          setProjectTaskDetailScreenOpen(false);
          setSelectedTaskId("");
          setMissionControlStrategyOpen(false);
        }

        useEffect(() => {
          return () => {
            if (taskConnectorBrowserOpenFrameRef.current) {
              window.cancelAnimationFrame(taskConnectorBrowserOpenFrameRef.current);
              taskConnectorBrowserOpenFrameRef.current = null;
            }
          };
        }, []);

        function isBoardTaskKeyboardNavigationBlockedTarget(target) {
          if (!(target instanceof Element)) {
            return false;
          }
          if (target.closest("input, textarea, select")) {
            return true;
          }
          if (target.closest("[contenteditable='true'], [contenteditable='']") || target.isContentEditable) {
            return true;
          }
          return Boolean(
            target.closest(".monaco-editor, .playground-tasks-schedule-panel, .tb-popup-menu, .tb-selection-popup, .playground-tasks-confirm-scrim, .playground-tasks-parent-picker-scrim, .playground-tasks-connector-browser, .playground-files-context-menu")
          );
        }

        function commitLocalTaskRecord(taskRecord, options = {}) {
          const normalized = normalizePlaygroundTaskRecord(taskRecord);
          const shouldSelectTask = options.selectTask !== false;
          const shouldSyncDraft = options.syncDraft !== false;
          const shouldMarkClean = options.markClean !== false;
          let nextTasks = tasks;

          setTasks((current) => {
            const existingIndex = current.findIndex((task) => task.id === normalized.id);
            nextTasks = existingIndex === -1
              ? [normalized].concat(current)
              : current.map((task) => task.id === normalized.id ? normalized : task);
            return nextTasks;
          });

          syncProjectSummary(normalized.projectId || selectedProjectId, nextTasks, sprints, releases, selectedProjectSummary);
          if (shouldSelectTask) {
            setSelectedTaskId(normalized.id);
            if (shouldSyncDraft) {
              setDraftTask(normalized);
            }
          }
          if (shouldMarkClean) {
            editorDirtyRef.current = false;
          }
          if (typeof onTaskRecordCommitted === "function") {
            onTaskRecordCommitted(normalized);
          }
          return normalized;
        }

        function applyRefreshedTaskDetails(taskRecord) {
          const normalized = normalizePlaygroundTaskRecord(taskRecord);
          const isSelectedTask = selectedTaskIdRef.current === normalized.id;
          const shouldPreserveDirtyDraft = isSelectedTask && editorDirtyRef.current;

          commitLocalTaskRecord(normalized, {
            selectTask: isSelectedTask,
            syncDraft: isSelectedTask && !shouldPreserveDirtyDraft,
            markClean: !shouldPreserveDirtyDraft,
          });

          if (shouldPreserveDirtyDraft) {
            setDraftTask((current) => {
              if (!current || current.id !== normalized.id) {
                return current;
              }
              return normalizePlaygroundTaskRecord({
                ...current,
                comments: normalized.comments,
                linkedThreadIds: normalized.linkedThreadIds,
                lastStartedThreadId: normalized.lastStartedThreadId,
                status: normalized.status,
                completedAt: normalized.completedAt,
                updatedAt: normalized.updatedAt,
                metadata: normalized.metadata,
              });
            });
          }

          return normalized;
        }

        function commitLocalSprintRecord(sprintRecord) {
          const normalized = normalizePlaygroundTaskSprintRecord(sprintRecord);
          let nextSprints = sprints;

          setSprints((current) => {
            const existingIndex = current.findIndex((sprint) => sprint.id === normalized.id);
            nextSprints = existingIndex === -1
              ? current.concat(normalized)
              : current.map((sprint) => sprint.id === normalized.id ? normalized : sprint);
            return nextSprints;
          });

          syncProjectSummary(normalized.projectId || selectedProjectId, tasks, nextSprints, releases, selectedProjectSummary);
          return normalized;
        }

        function buildTaskUpdatePayload(taskRecord, overrides = {}) {
          const mergedTask = normalizePlaygroundTaskRecord({
            ...normalizePlaygroundTaskRecord(taskRecord),
            ...overrides,
          });
          const metadata = buildPlaygroundTaskMetadata(mergedTask, {
            ticketNumber: mergedTask.ticketNumber,
	            taskType: mergedTask.taskType,
	            parentTaskId: mergedTask.parentTaskId,
	            assigneeAgentId: mergedTask.assigneeAgentId,
	            reviewRequired: mergedTask.reviewRequired,
	            reviewerAgentId: mergedTask.reviewerAgentId,
	            environmentId: mergedTask.environmentId,
            taskColor: mergedTask.taskColor,
            scheduleType: mergedTask.scheduleType,
            cronExpression: mergedTask.cronExpression,
            scheduleTimezone: mergedTask.scheduleTimezone,
            scheduleEnabled: mergedTask.scheduleEnabled,
            attachments: mergedTask.attachments,
            enabledSkills: mergedTask.enabledSkills,
            connectors: mergedTask.connectors,
          });
          const nextAssigneeAgentId = isPlaygroundHumanAssigneeId(mergedTask.assigneeAgentId)
            ? null
            : mergedTask.assigneeAgentId;

          return {
            projectId: mergedTask.projectId || selectedProjectId,
            releaseId: mergedTask.releaseId,
            ticketNumber: mergedTask.ticketNumber,
            type: mergedTask.taskType,
            parentTaskId: mergedTask.taskType === "subtask" ? mergedTask.parentTaskId : null,
            title: mergedTask.title,
            description: mergedTask.description,
            status: mergedTask.status,
            priority: mergedTask.priority,
	            sprintId: mergedTask.sprintId,
	            assigneeAgentId: nextAssigneeAgentId,
	            reviewRequired: mergedTask.reviewRequired,
	            reviewerAgentId: mergedTask.reviewerAgentId,
	            environmentId: mergedTask.environmentId,
            dependencyIds: mergedTask.dependencyIds,
            linkedThreadIds: mergedTask.linkedThreadIds,
            lastStartedThreadId: mergedTask.lastStartedThreadId,
            scheduledStartAt: mergedTask.scheduledStartAt,
            scheduledEndAt: mergedTask.scheduledEndAt,
            dueAt: mergedTask.dueAt,
            completedAt: mergedTask.completedAt,
            sortOrder: mergedTask.sortOrder,
            metadata,
          };
        }

        async function handleSaveProjectIssue(event) {
          event?.preventDefault?.();
          if (issueComposerSaveState.isSaving) {
            return;
          }

          const targetProjectId = String(issueComposerDraft?.projectId || selectedProjectId || selectedProject?.id || "").trim();
          const nextTitle = normalizePlaygroundEditableTaskTitle(issueComposerDraft?.title, "");
          if (!targetProjectId) {
            setIssueComposerSaveState({
              isSaving: false,
              error: "Project is unavailable.",
            });
            return;
          }
          if (!nextTitle) {
            setIssueComposerSaveState({
              isSaving: false,
              error: "Issue title is required.",
            });
            return;
          }

          const nextTaskType = normalizePlaygroundTaskType(issueComposerDraft?.taskType);
          const nextParentTaskId = nextTaskType === "subtask"
            ? normalizePlaygroundParentTaskId(issueComposerDraft?.parentTaskId)
            : null;
          if (nextTaskType === "subtask" && !nextParentTaskId) {
            setIssueComposerSaveState({
              isSaving: false,
              error: "Choose a parent ticket for this subtask.",
            });
            return;
          }

          const nextDependencyIds = normalizePlaygroundIdList(issueComposerDraft?.dependencyIds).slice(0, 1);
          const nextStatus = nextDependencyIds.length > 0 && issueComposerDraft?.status !== "done"
            ? "blocked"
            : (PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === issueComposerDraft?.status) ? issueComposerDraft.status : "todo");
          const nextScheduleType = issueComposerDraft?.scheduleType === "recurring" ? "recurring" : "one-time";
          const nextScheduledStartAt = issueComposerDraft?.scheduledStartAt || null;
          const nextCronExpression = nextScheduleType === "recurring" && nextScheduledStartAt
            ? (issueComposerDraft?.cronExpression || buildPlaygroundCronExpressionForPreset("daily", nextScheduledStartAt))
            : null;
          const now = new Date().toISOString();
          const taskDraft = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...issueComposerDraft,
            id: "",
            projectId: targetProjectId,
            title: nextTitle,
            taskType: nextTaskType,
            parentTaskId: nextParentTaskId,
            status: nextStatus,
            priority: PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === issueComposerDraft?.priority) ? issueComposerDraft.priority : "medium",
            taskColor: getPlaygroundTaskColorId(issueComposerDraft?.taskColor),
            releaseId: issueComposerDraft?.releaseId || null,
            sprintId: issueComposerDraft?.sprintId || null,
            assigneeAgentId: issueComposerDraft?.assigneeAgentId || null,
            reviewRequired: issueComposerDraft?.reviewRequired === true,
            reviewerAgentId: issueComposerDraft?.reviewRequired === true ? (issueComposerDraft?.reviewerAgentId || null) : null,
            environmentId: issueComposerDraft?.environmentId || null,
            dependencyIds: nextDependencyIds,
            scheduledStartAt: nextScheduledStartAt,
            scheduledEndAt: issueComposerDraft?.scheduledEndAt || null,
            scheduleType: nextScheduleType,
            cronExpression: nextCronExpression,
            dueAt: issueComposerDraft?.dueAt || null,
            completedAt: nextStatus === "done" ? now : null,
            sortOrder: Date.now(),
            createdAt: now,
            updatedAt: now,
          }));

          setIssueComposerSaveState({
            isSaving: true,
            error: "",
          });

          try {
            const response = await fetch(backendUrl + "/tasks", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(buildTaskUpdatePayload(taskDraft, {
                projectId: targetProjectId,
              })),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create issue.");
            }

            const createdTask = getPlaygroundTaskResponseRecord(data);
            if (!createdTask?.id) {
              throw new Error("Issue creation failed.");
            }

            commitLocalTaskRecord(createdTask, {
              selectTask: true,
              syncDraft: true,
              markClean: true,
            });
            setTaskView("backlog");
            setProjectTaskDetailScreenOpen(true);
            finishCloseProjectIssueComposer();
          } catch (error) {
            setIssueComposerSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to create issue.",
            });
          }
        }

        async function patchTaskRecord(taskRecord, overrides = {}) {
          const resolvedTask = normalizePlaygroundTaskRecord(taskRecord);
          if (!resolvedTask?.id || !selectedProjectId) {
            throw new Error("Task is unavailable.");
          }
          const mergedTask = normalizePlaygroundTaskRecord({
            ...resolvedTask,
            ...overrides,
          });
          if (String(mergedTask.status || "").trim() === "done") {
            const incompleteSubtasks = getIncompletePlaygroundDirectSubtasks(mergedTask);
            if (incompleteSubtasks.length > 0) {
              throw new Error(formatIncompleteSubtasksMessage(incompleteSubtasks));
            }
          }

          const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(resolvedTask.id), {
            method: "PATCH",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(buildTaskUpdatePayload(resolvedTask, overrides)),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to save task.");
          }

          const savedTask = getPlaygroundTaskResponseRecord(data);
          if (!savedTask?.id) {
            throw new Error("Task save failed.");
          }

          return savedTask;
        }

        useEffect(() => {
          if (!selectedProjectId || taskLoadState.status !== "ready" || tasks.length === 0) {
            return;
          }

          const candidateTasks = tasks.filter((task) => {
            const normalizedThreadId = typeof task?.lastStartedThreadId === "string" ? task.lastStartedThreadId.trim() : "";
            if (!normalizedThreadId) {
              return false;
            }
            if (task?.status === "in_progress" || task?.status === "blocked") {
              return true;
            }
            return task?.status === "done" && getIncompletePlaygroundDirectSubtasks(task).length > 0;
          });

          if (candidateTasks.length === 0) {
            return;
          }

          let cancelled = false;

          void (async () => {
            for (const task of candidateTasks) {
              const normalizedTaskId = String(task?.id || "").trim();
              const normalizedThreadId = String(task?.lastStartedThreadId || "").trim();
              const reconciliationKey = normalizedTaskId + ":" + normalizedThreadId;
              if (!normalizedTaskId || !normalizedThreadId) {
                continue;
              }
              if (taskCompletionReconciliationInFlightRef.current.has(reconciliationKey)) {
                continue;
              }
              if (missingTaskCompletionThreadKeysRef.current.has(reconciliationKey)) {
                continue;
              }

              taskCompletionReconciliationInFlightRef.current.add(reconciliationKey);
              try {
                const incompleteSubtasks = getIncompletePlaygroundDirectSubtasks(task);
                if (incompleteSubtasks.length > 0) {
                  if (task.status !== "done" && taskWaitingSubtasksThreadKeysRef.current.has(reconciliationKey)) {
                    continue;
                  }
                  taskWaitingSubtasksThreadKeysRef.current.add(reconciliationKey);
                  const waitingTask = await patchTaskRecord(task, {
                    status: "in_progress",
                    completedAt: null,
                    lastStartedThreadId: normalizedThreadId,
                  });
                  if (!cancelled && waitingTask?.id) {
                    commitLocalTaskRecord(waitingTask, {
                      selectTask: selectedTaskId === normalizedTaskId,
                    });
                  }
                  continue;
                }
                taskWaitingSubtasksThreadKeysRef.current.delete(reconciliationKey);

                const response = await fetch(backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/status", {
                  method: "GET",
                  headers: requestHeaders,
                });
                if (response.status === 404) {
                  missingTaskCompletionThreadKeysRef.current.add(reconciliationKey);
                  try {
                    const remainingLinkedThreadIds = Array.isArray(task?.linkedThreadIds)
                      ? task.linkedThreadIds.filter((value) => String(value || "").trim() && String(value || "").trim() !== normalizedThreadId)
                      : [];
                    const cleanedTask = await patchTaskRecord(task, {
                      linkedThreadIds: remainingLinkedThreadIds,
                      lastStartedThreadId: "",
                    });
                    if (!cancelled && cleanedTask?.id) {
                      commitLocalTaskRecord(cleanedTask, {
                        selectTask: selectedTaskId === normalizedTaskId,
                      });
                    }
                  } catch (cleanupError) {
                    console.warn("Failed to clean stale task thread reference", {
                      taskId: normalizedTaskId,
                      threadId: normalizedThreadId,
                      error: cleanupError,
                    });
                  }
                  continue;
                }
                const data = await response.json().catch(() => ({}));
                if (!response.ok || cancelled) {
                  continue;
                }

                const normalizedStatus = typeof data?.status === "string" && data.status.trim()
                  ? data.status.trim().toLowerCase()
                  : typeof data?.thread?.status === "string" && data.thread.status.trim()
                    ? data.thread.status.trim().toLowerCase()
                    : typeof data?.data?.status === "string" && data.data.status.trim()
                      ? data.data.status.trim().toLowerCase()
                      : "";

                if (normalizedStatus !== "completed") {
                  continue;
                }

	                const shouldMoveToReview = hasPlaygroundIndependentReviewer(task);
                const completedTask = await patchTaskRecord(task, {
                  status: shouldMoveToReview ? "in_review" : "done",
                  completedAt: shouldMoveToReview ? null : (task.completedAt || new Date().toISOString()),
                  lastStartedThreadId: normalizedThreadId,
                });

                if (!cancelled) {
                  commitLocalTaskRecord(completedTask, {
                    selectTask: selectedTaskId === normalizedTaskId,
                  });
                }
              } catch (error) {
                console.warn("Failed to reconcile completed task thread", {
                  taskId: normalizedTaskId,
                  threadId: normalizedThreadId,
                  error,
                });
              } finally {
                taskCompletionReconciliationInFlightRef.current.delete(reconciliationKey);
              }
            }
          })();

          return () => {
            cancelled = true;
          };
        }, [backendUrl, requestHeaders, selectedProjectId, selectedTaskId, taskLoadState.status, tasks]);

        async function flushQueuedTaskAutosave() {
          if (taskAutosaveInFlightRef.current) {
            return;
          }

          taskAutosaveInFlightRef.current = true;
          try {
            while (taskAutosaveQueuedRef.current) {
              const nextTaskToSave = normalizePlaygroundTaskRecord(taskAutosaveQueuedRef.current);
              taskAutosaveQueuedRef.current = null;

              setSaveState({
                isSaving: true,
                error: "",
                message: "",
              });

              try {
                const savedTask = await patchTaskRecord(nextTaskToSave);
                const hasQueuedFollowUp = Boolean(taskAutosaveQueuedRef.current);
                const shouldKeepTaskSelected = selectedTaskIdRef.current === savedTask.id;
                commitLocalTaskRecord(savedTask, {
                  selectTask: shouldKeepTaskSelected,
                  syncDraft: shouldKeepTaskSelected && !hasQueuedFollowUp,
                  markClean: !hasQueuedFollowUp,
                });
                if (!hasQueuedFollowUp) {
                  resetSaveState(shouldKeepTaskSelected ? "Saved" : "");
                }
              } catch (error) {
                setSaveState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to save task.",
                  message: "",
                });
                break;
              }
            }
          } finally {
            taskAutosaveInFlightRef.current = false;
          }
        }

        function queueTaskAutosave(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          if (!normalizedTask?.id || !selectedProjectId) {
            return;
          }
          taskAutosaveQueuedRef.current = normalizedTask;
          void flushQueuedTaskAutosave();
        }

        async function waitForTaskAutosaveToSettle(timeoutMs = 12000) {
          const startedAt = Date.now();
          while (taskAutosaveInFlightRef.current || taskAutosaveQueuedRef.current) {
            if (Date.now() - startedAt >= timeoutMs) {
              break;
            }
            await new Promise((resolve) => window.setTimeout(resolve, 50));
          }
        }

        async function persistProjectComposerDraft(options = {}) {
          const mode = options?.mode || projectComposerMode;
          const nextName = String(projectDraft.name || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            return null;
          }
          const nextDescription = projectComposerOpen && projectDescriptionTextareaRef.current
            ? String(projectDescriptionTextareaRef.current.value || "")
            : String(projectDraft.description || "");
          const nextWallpaperId = getPlaygroundProjectWallpaperId(
            projectDraftWallpaperIdRef.current || projectDraft.wallpaperId,
            PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id
          );
          const nextUseCardBackgroundAsWallpaper = projectDraftUseCardBackgroundAsWallpaperRef.current !== false;

          setProjectSaveState({
            isSaving: true,
            error: "",
          });

          try {
            const normalizedProjectAttachments = normalizePlaygroundTaskAttachmentList(projectDraft.attachments);
            const normalizedProjectConnectors = normalizePlaygroundTaskConnectorSelections(projectDraft.connectors);
            const isEditMode = mode === "edit" && projectDraft?.id;
            const projectBlueprint = getPlaygroundProjectBlueprint(
              projectDraft.projectType
              || projectDraft.type
              || projectDraft.metadata?.projectType
              || projectDraft.metadata?.blueprintId
            );
            const projectBlueprintMetadata = buildPlaygroundProjectBlueprintMetadata(projectBlueprint);
            const projectDraftMetadataSource = isEditMode && selectedProject?.id === projectDraft.id
              ? (mergePlaygroundProjectRecords(projectDraft, selectedProject) || projectDraft)
              : projectDraft;
            const projectDraftMetadata = projectDraft.metadata && typeof projectDraft.metadata === "object" && !Array.isArray(projectDraft.metadata)
              ? projectDraft.metadata
              : {};
            const projectDraftLead = projectDraftMetadata.lead && typeof projectDraftMetadata.lead === "object" && !Array.isArray(projectDraftMetadata.lead)
              ? projectDraftMetadata.lead
              : {};
            const nextLeadUserId = String(projectDraft.leadUserId || projectDraftMetadata.leadUserId || projectDraftLead.userId || projectDraftLead.id || currentUserEmail || currentUserName || "").trim();
            const nextLeadName = String(projectDraft.leadName || projectDraftMetadata.leadName || projectDraftLead.name || currentUserName || "").trim();
            const nextLeadEmail = String(projectDraft.leadEmail || projectDraftMetadata.leadEmail || projectDraftLead.email || currentUserEmail || "").trim();
            const nextLeadAvatarUrl = String(projectDraft.leadAvatarUrl || projectDraftMetadata.leadAvatarUrl || projectDraftLead.avatarUrl || projectDraftLead.photoUrl || currentUserAvatarUrl || "").trim();
	            const nextLead = {
	              userId: nextLeadUserId,
	              name: nextLeadName,
	              email: nextLeadEmail,
	              avatarUrl: nextLeadAvatarUrl,
	            };
	            const normalizedProjectPermissionSet = normalizePlaygroundPermissionSet(
	              projectDraft.permissionSet || projectDraftMetadata.permissionSet,
	              "project"
	            );
	            const response = await fetch(isEditMode
              ? backendUrl + "/projects/" + encodeURIComponent(projectDraft.id)
              : backendUrl + "/projects", {
              method: isEditMode ? "PATCH" : "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: nextName,
                description: nextDescription,
                projectType: projectBlueprint.id,
                type: projectBlueprint.id,
                color: projectDraft.color || getPlaygroundProjectAccent(projectDraft, projects.length),
                defaultEnvironmentId: projectDraft.defaultEnvironmentId || undefined,
                leadUserId: nextLeadUserId || undefined,
                leadName: nextLeadName || undefined,
	                leadEmail: nextLeadEmail || undefined,
	                leadAvatarUrl: nextLeadAvatarUrl || undefined,
	                permissionSet: normalizedProjectPermissionSet,
	                attachments: normalizedProjectAttachments,
                connectors: normalizedProjectConnectors,
                metadata: {
                  ...(projectDraft.metadata && typeof projectDraft.metadata === "object" ? projectDraft.metadata : {}),
                  ...projectBlueprintMetadata,
                  name: nextName,
                  description: nextDescription,
                  projectType: projectBlueprint.id,
                  blueprintId: projectBlueprint.id,
                  icon: getPlaygroundProjectIconId(projectDraft.icon),
                  wallpaperId: nextWallpaperId,
                  useCardBackgroundAsWallpaper: nextUseCardBackgroundAsWallpaper,
                  leadUserId: nextLeadUserId,
                  leadName: nextLeadName,
                  leadEmail: nextLeadEmail,
                  leadAvatarUrl: nextLeadAvatarUrl,
                  lead: nextLead,
	                  defaultEnvironmentId: projectDraft.defaultEnvironmentId || null,
	                  attachments: normalizedProjectAttachments,
		                  connectors: normalizedProjectConnectors,
		                  projectRules: String(projectDraft.projectRules || ""),
		                  permissionSet: normalizedProjectPermissionSet,
		                  ...buildPlaygroundProjectMissionControlMetadataFragment(projectDraftMetadataSource),
	                },
	              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || (isEditMode ? "Failed to update project." : "Failed to create project."));
            }

            const savedProject = getPlaygroundProjectResponseRecord(data, {
              ...projectDraft,
              description: nextDescription,
              projectType: projectBlueprint.id,
              type: projectBlueprint.id,
              wallpaperId: nextWallpaperId,
              useCardBackgroundAsWallpaper: nextUseCardBackgroundAsWallpaper,
              leadUserId: nextLeadUserId,
	              leadName: nextLeadName,
	              leadEmail: nextLeadEmail,
	              leadAvatarUrl: nextLeadAvatarUrl,
	              permissionSet: normalizedProjectPermissionSet,
	              metadata: {
                ...(projectDraft.metadata && typeof projectDraft.metadata === "object" ? projectDraft.metadata : {}),
                ...projectBlueprintMetadata,
                name: nextName,
	                description: nextDescription,
	                projectType: projectBlueprint.id,
	                blueprintId: projectBlueprint.id,
	                wallpaperId: nextWallpaperId,
	                useCardBackgroundAsWallpaper: nextUseCardBackgroundAsWallpaper,
                  leadUserId: nextLeadUserId,
                  leadName: nextLeadName,
                  leadEmail: nextLeadEmail,
                  leadAvatarUrl: nextLeadAvatarUrl,
	                lead: nextLead,
		                projectRules: String(projectDraft.projectRules || ""),
		                permissionSet: normalizedProjectPermissionSet,
		                ...buildPlaygroundProjectMissionControlMetadataFragment(projectDraftMetadataSource),
	              },
	            });
            if (!savedProject?.id) {
              throw new Error(isEditMode ? "Project update failed." : "Project creation failed.");
            }

            const savedProjectEnvironments = isEditMode
              ? selectedProjectEnvironments
              : parsePlaygroundEnvironmentListResponse(data);
            rememberProjectLocalNameOverride(savedProject.id, nextName);
            projectDraftNameDirtyRef.current = false;
            projectDraftTypedNameRef.current = "";
            const committedProjectRules = String(savedProject.projectRules || projectDraft.projectRules || "");
            const committedProject = commitLocalProjectRecord({
              ...savedProject,
              projectType: projectBlueprint.id,
              type: projectBlueprint.id,
              name: nextName,
              leadUserId: nextLeadUserId,
              leadName: nextLeadName,
              leadEmail: nextLeadEmail,
              leadAvatarUrl: nextLeadAvatarUrl,
              metadata: {
                ...(savedProject.metadata && typeof savedProject.metadata === "object" ? savedProject.metadata : {}),
		                ...projectBlueprintMetadata,
		                name: nextName,
		                description: nextDescription,
		                projectType: projectBlueprint.id,
		                blueprintId: projectBlueprint.id,
                    leadUserId: nextLeadUserId,
                    leadName: nextLeadName,
                    leadEmail: nextLeadEmail,
                    leadAvatarUrl: nextLeadAvatarUrl,
                    lead: nextLead,
		                projectRules: committedProjectRules,
		                ...buildPlaygroundProjectMissionControlMetadataFragment(savedProject, projectDraftMetadataSource),
		              },
	              summary: savedProject.summary || (isEditMode ? selectedProjectSummary : savedProject.summary),
	            }, {
              summary: savedProject.summary || (isEditMode ? selectedProjectSummary : savedProject.summary),
              environments: savedProjectEnvironments,
              recentThreads: isEditMode ? selectedProjectRecentThreads : [],
              threads: isEditMode ? selectedProjectRecentThreads : [],
              selectImmediately: isEditMode,
            });

            if (!isEditMode) {
              await applyPlaygroundProjectInitialSetup(committedProject, projectBlueprint, savedProjectEnvironments);
            }

            if (options?.closeAfterSave !== false) {
              closeProjectComposer({ animate: false });
            } else {
              setProjectDraft((current) => normalizePlaygroundProjectRecord({
                ...(current && typeof current === "object" ? current : {}),
                ...committedProject,
                name: nextName,
                description: nextDescription,
                projectType: projectBlueprint.id,
                type: projectBlueprint.id,
                leadUserId: nextLeadUserId,
                leadName: nextLeadName,
                leadEmail: nextLeadEmail,
                leadAvatarUrl: nextLeadAvatarUrl,
                metadata: {
                  ...(committedProject.metadata && typeof committedProject.metadata === "object" ? committedProject.metadata : {}),
	                  ...projectBlueprintMetadata,
	                  name: nextName,
	                  description: nextDescription,
	                  projectType: projectBlueprint.id,
	                  blueprintId: projectBlueprint.id,
                    leadUserId: nextLeadUserId,
                    leadName: nextLeadName,
                    leadEmail: nextLeadEmail,
                    leadAvatarUrl: nextLeadAvatarUrl,
                    lead: nextLead,
	                  projectRules: committedProjectRules,
	                  ...buildPlaygroundProjectMissionControlMetadataFragment(committedProject, projectDraftMetadataSource),
	                },
	              }));
              setProjectSaveState({
                isSaving: false,
                error: "",
              });
            }
            if (options?.selectAfterSave !== false) {
              handleSelectProject(committedProject.id);
            }
            if (normalizedProjectConnectors.github) {
              void prepareProjectGithubConnectorRepositories(committedProject, normalizedProjectConnectors.github).catch((error) => {
                console.warn("[project connectors] Failed to prepare GitHub repository in project environment.", error);
              });
            }
            return committedProject;
          } catch (error) {
            setProjectSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : (mode === "edit" ? "Failed to update project." : "Failed to create project."),
            });
            throw error;
          }
        }

        async function handleCreateProject(event) {
          event?.preventDefault?.();
          await persistProjectComposerDraft({ mode: "create" }).catch(() => null);
        }

        async function handleSaveProject(event) {
          event?.preventDefault?.();
          if (!projectDraft?.id) {
            return;
          }
          await persistProjectComposerDraft({ mode: "edit" }).catch(() => null);
        }

	        async function saveProjectOverviewDescription(descriptionOverride) {
	          if (!selectedProject?.id) {
	            return;
          }

          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
          const hasDescriptionOverride = typeof descriptionOverride === "string";
          const nextDescription = hasDescriptionOverride
            ? descriptionOverride
            : (
                projectDraft?.id === normalizedProject.id
                  ? String(projectDraft.description || "")
                  : String(normalizedProject.description || "")
              );
          if (nextDescription === String(normalizedProject.description || "")) {
            setProjectSaveState((current) => current.error
              ? { isSaving: false, error: "" }
              : current
            );
            return;
          }

          const nextProject = {
            ...normalizedProject,
            description: nextDescription,
          };
          const nextName = String(nextProject.name || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            return;
          }

          setProjectSaveState({
            isSaving: true,
            error: "",
          });

          try {
            const normalizedProjectAttachments = normalizePlaygroundTaskAttachmentList(nextProject.attachments);
            const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(nextProject.id), {
              method: "PATCH",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: nextName,
                description: nextProject.description,
                color: nextProject.color || getPlaygroundProjectAccent(nextProject, projects.length),
                defaultEnvironmentId: nextProject.defaultEnvironmentId || undefined,
                attachments: normalizedProjectAttachments,
                metadata: {
                  ...(nextProject.metadata && typeof nextProject.metadata === "object" ? nextProject.metadata : {}),
                  name: nextName,
                  description: nextProject.description,
                  icon: getPlaygroundProjectIconId(nextProject.icon),
                  wallpaperId: getPlaygroundProjectWallpaperId(nextProject.wallpaperId, PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id),
                  useCardBackgroundAsWallpaper: nextProject.useCardBackgroundAsWallpaper !== false,
	                  defaultEnvironmentId: nextProject.defaultEnvironmentId || null,
	                  attachments: normalizedProjectAttachments,
	                  connectors: normalizePlaygroundTaskConnectorSelections(nextProject.connectors),
	                  projectRules: String(nextProject.projectRules || ""),
	                  ...buildPlaygroundProjectMissionControlMetadataFragment(nextProject),
	                },
	              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update project description.");
            }

            const updatedProject = getPlaygroundProjectResponseRecord(data, nextProject);
            if (!updatedProject?.id) {
              throw new Error("Project update failed.");
            }

            rememberProjectLocalNameOverride(updatedProject.id, nextName);
            commitLocalProjectRecord({
              ...updatedProject,
              summary: updatedProject.summary || selectedProjectSummary,
            }, {
              summary: updatedProject.summary || selectedProjectSummary,
              environments: selectedProjectEnvironments,
              recentThreads: selectedProjectRecentThreads,
              threads: selectedProjectRecentThreads,
              selectImmediately: true,
            });
            setProjectDraft((current) => current?.id === updatedProject.id
              ? {
                  ...current,
                  ...updatedProject,
                }
              : current
            );
            setProjectSaveState({
              isSaving: false,
              error: "",
            });
          } catch (error) {
            setProjectSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to update project description.",
            });
          }
        }

        async function handleDeleteProject(projectId) {
          const resolvedProjectId = String(projectId || "").trim();
          if (!resolvedProjectId || !window.confirm("Delete this project?")) {
            return;
          }

          setProjectSidebarPopover("");

          try {
            const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(resolvedProjectId), {
              method: "DELETE",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete project.");
            }

            setProjects((current) => current.filter((project) => project.id !== resolvedProjectId));
            if (selectedProjectId === resolvedProjectId) {
              handleSelectProject("");
            } else {
              void loadProjects();
            }
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Failed to delete project.");
          }
        }

        function showReleaseComposer() {
          if (releaseComposerCloseTimerRef.current) {
            window.clearTimeout(releaseComposerCloseTimerRef.current);
            releaseComposerCloseTimerRef.current = null;
          }
          if (releaseComposerFrameRef.current) {
            window.cancelAnimationFrame(releaseComposerFrameRef.current);
            releaseComposerFrameRef.current = null;
          }
          setReleaseComposerVisible(false);
          setReleaseComposerClosing(false);
          setReleaseComposerOpen(true);
          releaseComposerFrameRef.current = window.requestAnimationFrame(() => {
            releaseComposerFrameRef.current = window.requestAnimationFrame(() => {
              releaseComposerFrameRef.current = null;
              setReleaseComposerVisible(true);
            });
          });
        }

        function openReleaseComposer() {
          setReleaseComposerMode("create");
          setReleaseDraft(buildProjectReleaseDraft(selectedProject));
          setIsReleaseDescriptionEditing(false);
          setReleaseDeletePending(false);
          setReleaseSaveState({
            isSaving: false,
            error: "",
          });
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          showReleaseComposer();
        }

        function openReleaseComposerForEdit(releaseRecord) {
          const normalizedRelease = normalizePlaygroundTaskReleaseRecord(releaseRecord);
          if (!normalizedRelease?.id) {
            return;
          }
          setReleaseComposerMode("edit");
          setReleaseDraft(normalizedRelease);
          setIsReleaseDescriptionEditing(false);
          setReleaseDeletePending(false);
          setReleaseSaveState({
            isSaving: false,
            error: "",
          });
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          showReleaseComposer();
        }

        function finishCloseReleaseComposer() {
          if (releaseComposerCloseTimerRef.current) {
            window.clearTimeout(releaseComposerCloseTimerRef.current);
            releaseComposerCloseTimerRef.current = null;
          }
          if (releaseComposerFrameRef.current) {
            window.cancelAnimationFrame(releaseComposerFrameRef.current);
            releaseComposerFrameRef.current = null;
          }
          setReleaseComposerVisible(false);
          setReleaseComposerClosing(false);
          setReleaseComposerOpen(false);
          setReleaseComposerMode("create");
          setReleaseDraft(buildPlaygroundDefaultReleaseDraft());
          setIsReleaseDescriptionEditing(false);
          setReleaseDeletePending(false);
          setReleaseSaveState({
            isSaving: false,
            error: "",
          });
        }

        function closeReleaseComposer(options = {}) {
          if ((releaseSaveState.isSaving || releaseDeletePending) && options?.force !== true) {
            return;
          }
          if (options?.animate === false) {
            finishCloseReleaseComposer();
            return;
          }
          if (releaseComposerClosing) {
            return;
          }
          setReleaseComposerVisible(false);
          setReleaseComposerClosing(true);
          if (releaseComposerCloseTimerRef.current) {
            window.clearTimeout(releaseComposerCloseTimerRef.current);
          }
          releaseComposerCloseTimerRef.current = window.setTimeout(() => {
            releaseComposerCloseTimerRef.current = null;
            finishCloseReleaseComposer();
          }, releaseComposerAnimationMs);
        }

        function handleSelectRelease(releaseId) {
          const normalizedReleaseId = String(releaseId || "").trim();
          if (!normalizedReleaseId) {
            setSelectedReleaseId("");
            setSelectedTaskId("");
            setDraftTask(null);
            return;
          }
          setSelectedReleaseId(normalizedReleaseId);
          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setReleaseBacklogToolbarPopover("");
        }

        async function handleSaveRelease(event) {
          event?.preventDefault?.();
          const isEditingRelease = releaseComposerMode === "edit" && Boolean(releaseDraft?.id);
          const targetProjectId = String(releaseDraft?.projectId || selectedProjectId || "").trim();
          if (!targetProjectId) {
            return;
          }

          const nextName = String(releaseDraft.name || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            return;
          }

          const nextStartAt = resolvePlaygroundReleaseDraftDateValue(releaseDraft.startAt);
          const nextEndAt = resolvePlaygroundReleaseDraftDateValue(releaseDraft.endAt, { endOfDay: true });
          if (nextStartAt && nextEndAt && Date.parse(nextEndAt) < Date.parse(nextStartAt)) {
            setReleaseSaveState({
              isSaving: false,
              error: "End date must be on or after the start date.",
            });
            return;
          }

          setReleaseSaveState({
            isSaving: true,
            error: "",
          });
          setReleaseDeletePending(false);

          try {
            const response = await fetch(
              backendUrl + "/tasks/releases" + (isEditingRelease ? ("/" + encodeURIComponent(releaseDraft.id)) : ""),
              {
                method: isEditingRelease ? "PATCH" : "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  projectId: targetProjectId,
                  name: nextName,
                  description: typeof releaseDraft.description === "string" ? releaseDraft.description : "",
                  startAt: nextStartAt,
                  endAt: nextEndAt,
                  sortOrder: Number.isFinite(releaseDraft.sortOrder) ? Number(releaseDraft.sortOrder) : releases.length + 1,
                }),
              },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || (isEditingRelease ? "Failed to update milestone." : "Failed to create milestone."));
            }

            const savedRelease = getPlaygroundTaskReleaseResponseRecord(data);
            if (!savedRelease?.id) {
              throw new Error(isEditingRelease ? "Milestone update failed." : "Milestone creation failed.");
            }

            const nextReleases = isEditingRelease
              ? releases.map((release) => release.id === savedRelease.id ? savedRelease : release)
              : releases.concat(savedRelease);

            setReleases(nextReleases);
            syncProjectSummary(targetProjectId, tasks, sprints, nextReleases, selectedProjectSummary);
            if (!isEditingRelease) {
              setSelectedReleaseId(savedRelease.id);
              setSelectedTaskId("");
              setDraftTask(null);
            }
            closeReleaseComposer({ force: true });
          } catch (error) {
            setReleaseSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : (isEditingRelease ? "Failed to update milestone." : "Failed to create milestone."),
            });
          }
        }

        async function handleDeleteRelease(releaseId) {
          const resolvedReleaseId = String(releaseId || "").trim();
          if (!resolvedReleaseId) {
            return;
          }
          if (!window.confirm("Delete this milestone? Tickets will stay in the project and simply lose their milestone assignment.")) {
            return;
          }

          setReleaseDeletePending(true);
          setReleaseSaveState({
            isSaving: false,
            error: "",
          });

          try {
            const response = await fetch(
              backendUrl + "/tasks/releases/" + encodeURIComponent(resolvedReleaseId),
              {
                method: "DELETE",
                headers: requestHeaders,
              },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete milestone.");
            }

            const nextReleases = releases.filter((release) => release.id !== resolvedReleaseId);
            const nextTasks = tasks.map((task) =>
              task?.releaseId === resolvedReleaseId
                ? { ...task, releaseId: null }
                : task
            );

            setReleases(nextReleases);
            setTasks(nextTasks);
            setDraftTask((current) =>
              current && current.releaseId === resolvedReleaseId
                ? { ...current, releaseId: null }
                : current
            );
            if (selectedReleaseId === resolvedReleaseId) {
              setSelectedReleaseId("");
            }
            syncProjectSummary(selectedProjectId, nextTasks, sprints, nextReleases, selectedProjectSummary);
            closeReleaseComposer({ force: true });
          } catch (error) {
            setReleaseDeletePending(false);
            setReleaseSaveState({
              isSaving: false,
              error: error instanceof Error ? error.message : "Failed to delete milestone.",
            });
          }
        }

        function renderReleaseHeaderMeta(releaseRecord, options = {}) {
          const normalizedRelease = releaseRecord?.id ? normalizePlaygroundTaskReleaseRecord(releaseRecord) : null;
          const className = options.className || "playground-tasks-backlog-section-meta";
          const dateClassName = options.dateClassName || "playground-tasks-backlog-section-date";
          return React.createElement("div", { className },
            React.createElement("span", { className: dateClassName },
              getPlaygroundTaskReleaseDeadlineLabel(normalizedRelease)
            ),
            normalizedRelease?.id
              ? React.createElement("button", {
                type: "button",
                  className: "playground-tasks-release-edit-button",
                  onClick: (event) => {
                    event.stopPropagation();
                    openReleaseComposerForEdit(normalizedRelease);
                  },
                  title: "Edit milestone",
                  "aria-label": "Edit milestone",
                }, React.createElement(Ellipsis, { width: 12, height: 12, strokeWidth: 1.9 }))
              : null
          );
        }

        function renderMissionControlBacklogCard() {
          if (!selectedProject) {
            return null;
          }

          const hasStrategyDocument = Boolean(String(selectedProjectMissionControl.document || "").trim());
          const summaryText = isSelectedProjectMissionControlRunning
            ? "Mission Control is analyzing the project context, updating the backlog, and preparing the latest strategy statement."
            : String(selectedProjectMissionControl.summary || "").trim()
              || "Run Mission Control to generate the first strategy statement and backlog recommendations for this project.";

          return React.createElement("div", { className: "playground-tasks-mission-control-card" },
            React.createElement("div", {
                className: "playground-tasks-backlog-item playground-tasks-mission-control-surface",
                style: getPlaygroundTaskColorStyle("gray"),
              },
              React.createElement("div", { className: "playground-tasks-mission-control-header" },
                React.createElement("div", { className: "playground-tasks-mission-control-title" }, (selectedProject.name || "Project") + " Mission Control"),
                React.createElement("div", { className: "playground-tasks-mission-control-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-mission-control-button",
                    disabled: !hasStrategyDocument,
	                    onClick: () => {
	                      openMissionControlStrategySidebar();
	                    },
                  }, "Strategy"),
                  React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    className: "playground-tasks-mission-control-button is-primary",
                    disabled: isSelectedProjectMissionControlRunning,
                    onClick: openMissionControlComposer,
                  },
                    isSelectedProjectMissionControlRunning
                      ? React.createElement(React.Fragment, null,
                          React.createElement(Loader2, { className: "playground-tasks-mission-control-button-spinner", strokeWidth: 1.8 }),
                          React.createElement("span", null, "Running...")
                        )
                      : "Run Mission Control"
                  )
                )
              ),
              React.createElement("div", {
                className: "playground-tasks-mission-control-summary" + (hasStrategyDocument || isSelectedProjectMissionControlRunning ? "" : " is-empty"),
              }, summaryText),
              missionControlRunState.projectId === selectedProjectId && missionControlRunState.status === "failed" && missionControlRunState.error
                ? React.createElement("div", { className: "playground-tasks-mission-control-error" }, missionControlRunState.error)
                : null
            )
          );
        }

        function handleBacklogComposerRunStart() {
          setSelectedTaskId("");
          setDraftTask(null);
        }

        async function handleBacklogComposerRunFinish(_result, threadId) {
          if (!selectedProjectId) {
            return;
          }
          const normalizedThreadId = String(threadId || "").trim();
          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerSubtaskCommandRequest(null);
          setBacklogComposerMissionControlCommandRequest(null);
          setBacklogComposerKey((current) => current + 1);
          if (normalizedThreadId) {
            try {
              const response = await fetch(
                backlogComposerBackendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/result",
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (response.ok) {
                const createdTask = getPlaygroundTaskResponseRecord(data);
                if (createdTask?.id) {
                  commitLocalTaskRecord(createdTask, {
                    selectTask: false,
                    syncDraft: false,
                    markClean: false,
                  });
                }
              }
            } catch {}
          }
          await loadProjectWorkspace(selectedProjectId);
        }

        function buildPlaygroundProjectSavePayload(projectRecord, metadataOverrides = {}) {
          const normalizedInputProject = normalizePlaygroundProjectRecord(projectRecord);
          const existingProject = normalizedInputProject.id
            ? (
                selectedProject?.id === normalizedInputProject.id
                  ? selectedProject
                  : projectsById[normalizedInputProject.id] || null
              )
            : null;
          const normalizedProject = mergePlaygroundProjectRecords(projectRecord, existingProject) || normalizedInputProject;
          const projectRecordMetadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
          const existingProjectMetadata = existingProject?.metadata && typeof existingProject.metadata === "object" && !Array.isArray(existingProject.metadata)
            ? existingProject.metadata
            : {};
		          const normalizedProjectAttachments = normalizePlaygroundTaskAttachmentList(normalizedProject.attachments);
		          const normalizedProjectConnectors = normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors);
		          const normalizedProjectRules = String(normalizedProject.projectRules || "");
		          const normalizedProjectPermissionSet = normalizePlaygroundPermissionSet(
		            normalizedProject.permissionSet || normalizedProject.metadata?.permissionSet,
		            "project"
		          );
          const normalizedProjectPriority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === String(normalizedProject.priority || metadataOverrides?.priority || normalizedProject.metadata?.priority || "").trim().toLowerCase())
            ? String(normalizedProject.priority || metadataOverrides?.priority || normalizedProject.metadata?.priority || "").trim().toLowerCase()
            : "medium";
          const normalizedProjectLead = {
            userId: String(normalizedProject.leadUserId || metadataOverrides?.leadUserId || metadataOverrides?.lead?.userId || metadataOverrides?.lead?.id || normalizedProject.metadata?.leadUserId || normalizedProject.metadata?.lead?.userId || normalizedProject.metadata?.lead?.id || "").trim(),
            name: String(normalizedProject.leadName || metadataOverrides?.leadName || metadataOverrides?.lead?.name || normalizedProject.metadata?.leadName || normalizedProject.metadata?.lead?.name || "").trim(),
            email: String(normalizedProject.leadEmail || metadataOverrides?.leadEmail || metadataOverrides?.lead?.email || normalizedProject.metadata?.leadEmail || normalizedProject.metadata?.lead?.email || "").trim(),
            avatarUrl: String(normalizedProject.leadAvatarUrl || metadataOverrides?.leadAvatarUrl || metadataOverrides?.lead?.avatarUrl || normalizedProject.metadata?.leadAvatarUrl || normalizedProject.metadata?.lead?.avatarUrl || "").trim(),
          };
		          const hasMetadataMissionControlOverride = metadataOverrides
	            && typeof metadataOverrides === "object"
	            && Object.prototype.hasOwnProperty.call(metadataOverrides, "missionControl");
	          const hasKnownMissionControlMetadata = hasMetadataMissionControlOverride
            || Object.prototype.hasOwnProperty.call(projectRecord || {}, "missionControl")
            || Object.prototype.hasOwnProperty.call(projectRecordMetadata, "missionControl")
            || Object.prototype.hasOwnProperty.call(existingProject || {}, "missionControl")
            || Object.prototype.hasOwnProperty.call(existingProjectMetadata, "missionControl");
	          const rawProjectMissionControlForPayload = hasMetadataMissionControlOverride
	            ? metadataOverrides.missionControl
	            : (normalizedProject.missionControl || normalizedProject.metadata?.missionControl);
	          const normalizedProjectMissionControl = normalizePlaygroundProjectMissionControlRecord(
	            rawProjectMissionControlForPayload
	          );
	          if (
	            rawProjectMissionControlForPayload
	            && typeof rawProjectMissionControlForPayload === "object"
	            && !Array.isArray(rawProjectMissionControlForPayload)
	            && rawProjectMissionControlForPayload.strategyBriefReplace === true
	          ) {
	            normalizedProjectMissionControl.strategyBriefReplace = true;
	          }
	          const projectIndex = Math.max(0, projects.findIndex((project) => project.id === normalizedProject.id));
          const metadataPayload = {
            ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
            ...(metadataOverrides && typeof metadataOverrides === "object" ? metadataOverrides : {}),
            name: normalizedProject.name || "Project",
            description: normalizedProject.description,
            icon: getPlaygroundProjectIconId(normalizedProject.icon),
            priority: normalizedProjectPriority,
            wallpaperId: getPlaygroundProjectWallpaperId(normalizedProject.wallpaperId, PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id),
            useCardBackgroundAsWallpaper: normalizedProject.useCardBackgroundAsWallpaper !== false,
            defaultEnvironmentId: normalizedProject.defaultEnvironmentId || null,
            leadUserId: normalizedProjectLead.userId,
            leadName: normalizedProjectLead.name,
            leadEmail: normalizedProjectLead.email,
            leadAvatarUrl: normalizedProjectLead.avatarUrl,
            lead: normalizedProjectLead.userId || normalizedProjectLead.name || normalizedProjectLead.email
              ? normalizedProjectLead
              : null,
	            attachments: normalizedProjectAttachments,
	            connectors: hasPlaygroundTaskConnectorSelections(normalizedProjectConnectors) ? normalizedProjectConnectors : null,
	            projectRules: normalizedProjectRules,
	            permissionSet: normalizedProjectPermissionSet,
	          };
          if (hasKnownMissionControlMetadata || hasMeaningfulPlaygroundProjectMissionControlRecord(normalizedProjectMissionControl)) {
            metadataPayload.missionControl = normalizedProjectMissionControl;
          }
	          return {
	            name: normalizedProject.name || "Project",
	            description: normalizedProject.description,
            color: normalizedProject.color || getPlaygroundProjectAccent(normalizedProject, projectIndex),
            priority: normalizedProjectPriority,
	            defaultEnvironmentId: normalizedProject.defaultEnvironmentId || undefined,
            leadUserId: normalizedProjectLead.userId || undefined,
            leadName: normalizedProjectLead.name || undefined,
            leadEmail: normalizedProjectLead.email || undefined,
            leadAvatarUrl: normalizedProjectLead.avatarUrl || undefined,
            lead: normalizedProjectLead.userId || normalizedProjectLead.name || normalizedProjectLead.email
              ? normalizedProjectLead
              : undefined,
	            permissionSet: normalizedProjectPermissionSet,
	            attachments: normalizedProjectAttachments,
	            metadata: metadataPayload,
		          };
		        }

	        function applyProjectPermissionSetLocally(projectId, permissionSet) {
	          const normalizedProjectId = String(projectId || "").trim();
	          if (!normalizedProjectId) {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "project");
	          const mergePermissionSet = (project) => normalizePlaygroundProjectRecord({
	            ...(project && typeof project === "object" ? project : {}),
	            permissionSet: normalizedPermissionSet,
	            metadata: {
	              ...(project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata) ? project.metadata : {}),
	              permissionSet: normalizedPermissionSet,
	            },
	          });

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergePermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergePermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergePermissionSet(current.project),
	            };
	          });
	        }

	        async function persistProjectPermissionSet(nextPermissionSet) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          if (!normalizedProjectId) {
	            return null;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(nextPermissionSet, "project");
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            permissionSet: normalizedPermissionSet,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              permissionSet: normalizedPermissionSet,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            permissionSet: normalizedPermissionSet,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectPermissionSet(updater) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const currentPermissionSet = normalizePlaygroundPermissionSet(
	            normalizedProject.permissionSet || normalizedProject.metadata?.permissionSet,
	            "project"
	          );
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "project"
	          );
	          if (normalizedProjectId) {
	            applyProjectPermissionSetLocally(normalizedProjectId, nextPermissionSet);
	          }
	          void persistProjectPermissionSet(nextPermissionSet).catch((error) => {
	            console.warn("Failed to save project permissions", error);
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save project permissions.",
	            });
	          });
	        }

	        function updateProjectPermissionRingAccess(ringId, nextAccess) {
	          const ringDefinition = getPlaygroundPermissionRingDefinition(ringId);
	          updateProjectPermissionSet((currentPermissionSet) => {
	            const currentRings = currentPermissionSet.rings && typeof currentPermissionSet.rings === "object"
	              ? currentPermissionSet.rings
	              : {};
	            const currentRingPolicy = currentRings[ringDefinition.id] || {
	              defaultAccess: ringDefinition.defaultAccess,
	            };
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project",
	              rings: {
	                ...currentRings,
	                [ringDefinition.id]: {
	                  ...currentRingPolicy,
	                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ringDefinition.defaultAccess),
	                },
	              },
	            };
	          });
	        }

	        function updateProjectPermissionActionRing(actionId, nextRingId) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectPermissionSet((currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
	                  currentPermissionSet,
	                  actionDefinition,
	                  currentActionPolicy,
	                  explicitAccess,
	                  normalizePlaygroundPermissionRingId(nextRingId, actionDefinition.ringId)
	                ),
	              },
	            };
	          });
	        }

	        function updateProjectPermissionActionAccess(actionId, nextAccess) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectPermissionSet((currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const nextPolicy = buildPlaygroundPermissionActionPolicy(
	              currentPermissionSet,
	              actionDefinition,
	              currentActionPolicy,
	              nextAccess
	            );
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: nextPolicy,
	              },
	            };
	          });
	        }

	        function getProjectTeamPermissionSets(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
	            ? metadata.teamPermissionSets
	            : {};
	          return Object.entries(source).reduce((result, [teamId, permissionSet]) => {
	            const normalizedTeamId = String(teamId || "").trim();
	            if (normalizedTeamId) {
	              result[normalizedTeamId] = normalizePlaygroundPermissionSet(permissionSet, "team");
	            }
	            return result;
	          }, {});
	        }

	        function getProjectTeamPermissionSet(project, teamId, fallbackPermissionSet = null) {
	          const normalizedTeamId = String(teamId || "").trim();
	          const projectTeamPermissionSets = getProjectTeamPermissionSets(project);
	          return normalizePlaygroundPermissionSet(
	            normalizedTeamId && projectTeamPermissionSets[normalizedTeamId]
	              ? projectTeamPermissionSets[normalizedTeamId]
	              : fallbackPermissionSet,
	            "team"
	          );
	        }

	        function getProjectTeamRolePermissionSetsMap(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
	            ? metadata.teamRolePermissionSets
	            : {};
	          return Object.entries(source).reduce((result, [teamId, rolePermissionSets]) => {
	            const normalizedTeamId = String(teamId || "").trim();
	            if (!normalizedTeamId || !rolePermissionSets || typeof rolePermissionSets !== "object" || Array.isArray(rolePermissionSets)) {
	              return result;
	            }
	            result[normalizedTeamId] = PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((sets, role) => {
	              if (role.id === "owner") {
	                sets[role.id] = createPlaygroundProjectTeamRolePermissionSet(role.id);
	                return sets;
	              }
	              if (rolePermissionSets[role.id]) {
	                sets[role.id] = normalizePlaygroundPermissionSet(rolePermissionSets[role.id], "project_team_role");
	              }
	              return sets;
	            }, {});
	            return result;
	          }, {});
	        }

	        function getProjectTeamLegacyPermissionSet(project, teamId) {
	          const normalizedTeamId = String(teamId || "").trim();
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
	            ? metadata.teamPermissionSets
	            : {};
	          return normalizedTeamId && source[normalizedTeamId]
	            ? normalizePlaygroundPermissionSet(source[normalizedTeamId], "project_team_role")
	            : null;
	        }

	        function getProjectTeamRolePermissionSets(project, teamId) {
	          const normalizedTeamId = String(teamId || "").trim();
	          const allRolePermissionSets = getProjectTeamRolePermissionSetsMap(project);
	          const currentRolePermissionSets = normalizedTeamId && allRolePermissionSets[normalizedTeamId]
	            ? allRolePermissionSets[normalizedTeamId]
	            : {};
	          const legacyPermissionSet = getProjectTeamLegacyPermissionSet(project, normalizedTeamId);
	          return PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((rolePermissionSets, role) => {
	            if (role.id === "owner") {
	              rolePermissionSets[role.id] = createPlaygroundProjectTeamRolePermissionSet(role.id);
	              return rolePermissionSets;
	            }
	            rolePermissionSets[role.id] = normalizePlaygroundPermissionSet(
	              currentRolePermissionSets[role.id]
	                || legacyPermissionSet
	                || createPlaygroundProjectTeamRolePermissionSet(role.id),
	              "project_team_role"
	            );
	            return rolePermissionSets;
	          }, {});
	        }

	        function getProjectTeamRolePermissionSet(project, teamId, roleId) {
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          const rolePermissionSets = getProjectTeamRolePermissionSets(project, teamId);
	          return normalizePlaygroundPermissionSet(
	            rolePermissionSets[normalizedRoleId] || createPlaygroundProjectTeamRolePermissionSet(normalizedRoleId),
	            "project_team_role"
	          );
	        }

	        function getProjectRemovedTeamIds(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = Array.isArray(metadata.teamAccessRemovedIds)
	            ? metadata.teamAccessRemovedIds
	            : Array.isArray(metadata.removedTeamIds)
	              ? metadata.removedTeamIds
	              : [];
	          return source
	            .map((teamId) => String(teamId || "").trim())
	            .filter(Boolean);
	        }

	        function getProjectTeamAccessIds(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = Array.isArray(metadata.teamAccessIds)
	            ? metadata.teamAccessIds
	            : Array.isArray(metadata.sharedTeamIds)
	              ? metadata.sharedTeamIds
	              : [];
	          return source
	            .map((teamId) => String(teamId || "").trim())
	            .filter(Boolean);
	        }

	        function applyProjectTeamPermissionSetLocally(projectId, teamId, permissionSet) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          if (!normalizedProjectId || !normalizedTeamId) {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "team");
	          const mergeTeamPermissionSet = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            const currentTeamPermissionSets = getProjectTeamPermissionSets(project);
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...metadata,
	                teamPermissionSets: {
	                  ...currentTeamPermissionSets,
	                  [normalizedTeamId]: normalizedPermissionSet,
	                },
	              },
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeTeamPermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeTeamPermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeTeamPermissionSet(current.project),
	            };
	          });
	        }

	        function applyProjectTeamWorkspaceMembershipLocally(projectId, teamId, action) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedAction = action === "add" ? "add" : "remove";
	          if (!normalizedProjectId || !normalizedTeamId || normalizedTeamId === "all_agents") {
	            return;
	          }
	          const mergeTeamMembership = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            const currentTeamPermissionSets = getProjectTeamPermissionSets(project);
	            const nextTeamPermissionSets = { ...currentTeamPermissionSets };
	            const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(project);
	            const nextTeamRolePermissionSets = { ...currentTeamRolePermissionSets };
	            const removedTeamIds = new Set(getProjectRemovedTeamIds(project));
	            const teamAccessIds = new Set(getProjectTeamAccessIds(project));
	            if (normalizedAction === "remove") {
	              delete nextTeamPermissionSets[normalizedTeamId];
	              delete nextTeamRolePermissionSets[normalizedTeamId];
	              teamAccessIds.delete(normalizedTeamId);
	              removedTeamIds.add(normalizedTeamId);
	            } else {
	              teamAccessIds.add(normalizedTeamId);
	              removedTeamIds.delete(normalizedTeamId);
	            }
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...metadata,
	                teamAccessIds: Array.from(teamAccessIds),
	                teamPermissionSets: nextTeamPermissionSets,
	                teamRolePermissionSets: nextTeamRolePermissionSets,
	                teamAccessRemovedIds: Array.from(removedTeamIds),
	              },
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeTeamMembership(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeTeamMembership(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeTeamMembership(current.project),
	            };
	          });
	        }

	        async function persistProjectTeamWorkspaceMembership(teamId, action) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedAction = action === "add" ? "add" : "remove";
	          if (!normalizedProjectId || !normalizedTeamId || normalizedTeamId === "all_agents") {
	            return null;
	          }
	          const currentTeamPermissionSets = getProjectTeamPermissionSets(normalizedProject);
	          const nextTeamPermissionSets = { ...currentTeamPermissionSets };
	          const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(normalizedProject);
	          const nextTeamRolePermissionSets = { ...currentTeamRolePermissionSets };
	          const removedTeamIds = new Set(getProjectRemovedTeamIds(normalizedProject));
	          const teamAccessIds = new Set(getProjectTeamAccessIds(normalizedProject));
	          if (normalizedAction === "remove") {
	            delete nextTeamPermissionSets[normalizedTeamId];
	            delete nextTeamRolePermissionSets[normalizedTeamId];
	            teamAccessIds.delete(normalizedTeamId);
	            removedTeamIds.add(normalizedTeamId);
	          } else {
	            teamAccessIds.add(normalizedTeamId);
	            removedTeamIds.delete(normalizedTeamId);
	          }
	          const nextTeamAccessIds = Array.from(teamAccessIds);
	          const nextRemovedTeamIds = Array.from(removedTeamIds);
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              teamAccessIds: nextTeamAccessIds,
	              teamPermissionSets: nextTeamPermissionSets,
	              teamRolePermissionSets: nextTeamRolePermissionSets,
	              teamAccessRemovedIds: nextRemovedTeamIds,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            teamAccessIds: nextTeamAccessIds,
	            teamPermissionSets: nextTeamPermissionSets,
	            teamRolePermissionSets: nextTeamRolePermissionSets,
	            teamAccessRemovedIds: nextRemovedTeamIds,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project team access.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectTeamWorkspaceMembership(teamId, action) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedAction = action === "add" ? "add" : "remove";
	          if (!hasRealAccess || !normalizedProjectId || !normalizedTeamId || normalizedTeamId === "all_agents") {
	            return;
	          }
	          const previousTeamPermissionSets = getProjectTeamPermissionSets(normalizedProject);
	          const previousTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(normalizedProject);
	          const previousTeamAccessIds = getProjectTeamAccessIds(normalizedProject);
	          const previousRemovedTeamIds = getProjectRemovedTeamIds(normalizedProject);
	          applyProjectTeamWorkspaceMembershipLocally(normalizedProjectId, normalizedTeamId, normalizedAction);
	          void persistProjectTeamWorkspaceMembership(normalizedTeamId, normalizedAction).catch((error) => {
	            console.warn("Failed to update project team access", error);
	            const restoreProjectTeamMembership = (project) => normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...(project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata) ? project.metadata : {}),
	                teamAccessIds: previousTeamAccessIds,
	                teamPermissionSets: previousTeamPermissionSets,
	                teamRolePermissionSets: previousTeamRolePermissionSets,
	                teamAccessRemovedIds: previousRemovedTeamIds,
	              },
	            });
	            setProjects((current) => current.map((project) =>
	              project.id === normalizedProjectId ? restoreProjectTeamMembership(project) : project
	            ));
	            setProjectDraft((current) =>
	              current?.id === normalizedProjectId ? restoreProjectTeamMembership(current) : current
	            );
	            setSelectedProjectDetail((current) => {
	              if (current?.project?.id !== normalizedProjectId) {
	                return current;
	              }
	              return {
	                ...current,
	                project: restoreProjectTeamMembership(current.project),
	              };
	            });
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to update project team access.",
	            });
	          });
	        }

	        async function persistProjectTeamPermissionSet(teamId, nextPermissionSet) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          if (!normalizedProjectId || !normalizedTeamId) {
	            return null;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(nextPermissionSet, "team");
	          const currentTeamPermissionSets = getProjectTeamPermissionSets(normalizedProject);
	          const nextTeamPermissionSets = {
	            ...currentTeamPermissionSets,
	            [normalizedTeamId]: normalizedPermissionSet,
	          };
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              teamPermissionSets: nextTeamPermissionSets,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            teamPermissionSets: nextTeamPermissionSets,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project team permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectTeamPermissionSet(teamId, updater) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          if (!normalizedProjectId || !normalizedTeamId) {
	            return;
	          }
	          const selectedTeam = Array.isArray(workspaceTeams)
	            ? workspaceTeams.find((team) => String(team?.id || "") === normalizedTeamId) || null
	            : null;
	          const currentPermissionSet = getProjectTeamPermissionSet(normalizedProject, normalizedTeamId, selectedTeam?.permissionSet);
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "team"
	          );
	          applyProjectTeamPermissionSetLocally(normalizedProjectId, normalizedTeamId, nextPermissionSet);
	          void persistProjectTeamPermissionSet(normalizedTeamId, nextPermissionSet).catch((error) => {
	            console.warn("Failed to save project team permissions", error);
	            applyProjectTeamPermissionSetLocally(normalizedProjectId, normalizedTeamId, currentPermissionSet);
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save project team permissions.",
	            });
	          });
	        }

	        function updateProjectTeamPermissionRingAccess(teamId, ringId, nextAccess) {
	          const ringDefinition = getPlaygroundPermissionRingDefinition(ringId);
	          updateProjectTeamPermissionSet(teamId, (currentPermissionSet) => {
	            const currentRings = currentPermissionSet.rings && typeof currentPermissionSet.rings === "object"
	              ? currentPermissionSet.rings
	              : {};
	            const currentRingPolicy = currentRings[ringDefinition.id] || {
	              defaultAccess: ringDefinition.defaultAccess,
	            };
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "team",
	              rings: {
	                ...currentRings,
	                [ringDefinition.id]: {
	                  ...currentRingPolicy,
	                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ringDefinition.defaultAccess),
	                },
	              },
	            };
	          });
	        }

	        function updateProjectTeamPermissionActionRing(teamId, actionId, nextRingId) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamPermissionSet(teamId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "team",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
	                  currentPermissionSet,
	                  actionDefinition,
	                  currentActionPolicy,
	                  explicitAccess,
	                  normalizePlaygroundPermissionRingId(nextRingId, actionDefinition.ringId)
	                ),
	              },
	            };
	          });
	        }

	        function updateProjectTeamPermissionActionAccess(teamId, actionId, nextAccess) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamPermissionSet(teamId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const nextPolicy = buildPlaygroundPermissionActionPolicy(
	              currentPermissionSet,
	              actionDefinition,
	              currentActionPolicy,
	              nextAccess
	            );
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "team",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: nextPolicy,
	              },
	            };
	          });
	        }

	        function applyProjectTeamRolePermissionSetLocally(projectId, teamId, roleId, permissionSet) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          if (!normalizedProjectId || !normalizedTeamId || normalizedRoleId === "owner") {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "project_team_role");
	          const mergeTeamRolePermissionSet = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(project);
	            const currentRolePermissionSets = getProjectTeamRolePermissionSets(project, normalizedTeamId);
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...metadata,
	                teamRolePermissionSets: {
	                  ...currentTeamRolePermissionSets,
	                  [normalizedTeamId]: {
	                    ...currentRolePermissionSets,
	                    [normalizedRoleId]: normalizedPermissionSet,
	                  },
	                },
	              },
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeTeamRolePermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeTeamRolePermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeTeamRolePermissionSet(current.project),
	            };
	          });
	        }

	        async function persistProjectTeamRolePermissionSet(teamId, roleId, nextPermissionSet) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          if (!normalizedProjectId || !normalizedTeamId || normalizedRoleId === "owner") {
	            return null;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(nextPermissionSet, "project_team_role");
	          const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(normalizedProject);
	          const currentRolePermissionSets = getProjectTeamRolePermissionSets(normalizedProject, normalizedTeamId);
	          const nextTeamRolePermissionSets = {
	            ...currentTeamRolePermissionSets,
	            [normalizedTeamId]: {
	              ...currentRolePermissionSets,
	              [normalizedRoleId]: normalizedPermissionSet,
	            },
	          };
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              teamRolePermissionSets: nextTeamRolePermissionSets,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            teamRolePermissionSets: nextTeamRolePermissionSets,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project team role permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectTeamRolePermissionSet(teamId, roleId, updater) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          if (!normalizedProjectId || !normalizedTeamId || normalizedRoleId === "owner") {
	            return;
	          }
	          const currentPermissionSet = getProjectTeamRolePermissionSet(normalizedProject, normalizedTeamId, normalizedRoleId);
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "project_team_role"
	          );
	          applyProjectTeamRolePermissionSetLocally(normalizedProjectId, normalizedTeamId, normalizedRoleId, nextPermissionSet);
	          void persistProjectTeamRolePermissionSet(normalizedTeamId, normalizedRoleId, nextPermissionSet).catch((error) => {
	            console.warn("Failed to save project team role permissions", error);
	            applyProjectTeamRolePermissionSetLocally(normalizedProjectId, normalizedTeamId, normalizedRoleId, currentPermissionSet);
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save project team role permissions.",
	            });
	          });
	        }

	        function updateProjectTeamRolePermissionRingAccess(teamId, roleId, ringId, nextAccess) {
	          const ringDefinition = getPlaygroundPermissionRingDefinition(ringId);
	          updateProjectTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
	            const currentRings = currentPermissionSet.rings && typeof currentPermissionSet.rings === "object"
	              ? currentPermissionSet.rings
	              : {};
	            const currentRingPolicy = currentRings[ringDefinition.id] || {
	              defaultAccess: ringDefinition.defaultAccess,
	            };
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project_team_role",
	              rings: {
	                ...currentRings,
	                [ringDefinition.id]: {
	                  ...currentRingPolicy,
	                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ringDefinition.defaultAccess),
	                },
	              },
	            };
	          });
	        }

	        function updateProjectTeamRolePermissionActionRing(teamId, roleId, actionId, nextRingId) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project_team_role",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
	                  currentPermissionSet,
	                  actionDefinition,
	                  currentActionPolicy,
	                  explicitAccess,
	                  normalizePlaygroundPermissionRingId(nextRingId, actionDefinition.ringId)
	                ),
	              },
	            };
	          });
	        }

	        function updateProjectTeamRolePermissionActionAccess(teamId, roleId, actionId, nextAccess) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const nextPolicy = buildPlaygroundPermissionActionPolicy(
	              currentPermissionSet,
	              actionDefinition,
	              currentActionPolicy,
	              nextAccess
	            );
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project_team_role",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: nextPolicy,
	              },
	            };
	          });
	        }

        function buildMissionControlRecordForSave(overrides = {}) {
          const baseMissionControl = normalizePlaygroundProjectMissionControlRecord(
            selectedProjectMissionControlRef.current || selectedProjectMissionControl
          );
          const hasStrategyOverride = overrides
            && typeof overrides === "object"
            && Object.prototype.hasOwnProperty.call(overrides, "strategyBrief");
          const strategyBrief = normalizePlaygroundProjectStrategyBrief(
            hasStrategyOverride
              ? overrides.strategyBrief
              : baseMissionControl.strategyBrief
          );
          const record = normalizePlaygroundProjectMissionControlRecord({
            ...baseMissionControl,
            ...(overrides && typeof overrides === "object" ? overrides : {}),
            strategyBrief,
          });
          if (hasStrategyOverride) {
            record.strategyBriefReplace = true;
          }
          return record;
        }

        async function persistProjectMissionControlRecord(projectId, missionControlRecord, options = {}) {
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedProjectId) {
            return null;
          }

          let baseProject = normalizePlaygroundProjectRecord(
            (selectedProject?.id === normalizedProjectId ? selectedProject : null)
            || projectsById[normalizedProjectId]
            || {
              id: normalizedProjectId,
              name: "Project",
            }
          );
          const baseProjectMetadata = baseProject.metadata && typeof baseProject.metadata === "object" && !Array.isArray(baseProject.metadata)
            ? baseProject.metadata
            : {};
          const shouldRefreshBaseProjectBeforePatch = options.refreshBaseProject !== false && (
            isPlaceholderProjectDisplayName(baseProject.name)
            || (!String(baseProject.description || "").trim() && typeof baseProjectMetadata.description !== "string")
            || !getPlaygroundProjectWallpaperId(baseProject.wallpaperId || baseProjectMetadata.wallpaperId, "")
          );
          if (shouldRefreshBaseProjectBeforePatch) {
            try {
              const projectResponse = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
                method: "GET",
                headers: requestHeaders,
              });
              const projectData = await projectResponse.json().catch(() => ({}));
              if (projectResponse.ok) {
                const refreshedProject = getPlaygroundProjectResponseRecord(projectData, baseProject);
                if (refreshedProject?.id === normalizedProjectId) {
                  baseProject = refreshedProject;
                }
              }
            } catch {}
          }
          const normalizedMissionControlRecord = normalizePlaygroundProjectMissionControlRecord({
            ...getPlaygroundProjectMissionControlRecord(baseProject),
            ...(missionControlRecord && typeof missionControlRecord === "object" ? missionControlRecord : {}),
          });
          if (
            missionControlRecord
            && typeof missionControlRecord === "object"
            && !Array.isArray(missionControlRecord)
            && missionControlRecord.strategyBriefReplace === true
          ) {
            normalizedMissionControlRecord.strategyBriefReplace = true;
          }
          const nextProjectRecord = normalizePlaygroundProjectRecord({
            ...baseProject,
            ...(options.projectOverrides && typeof options.projectOverrides === "object" ? options.projectOverrides : {}),
            missionControl: normalizedMissionControlRecord,
          });
          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
            missionControl: normalizedMissionControlRecord,
            ...(options.metadataOverrides && typeof options.metadataOverrides === "object" ? options.metadataOverrides : {}),
          });
          if (!options.quiet) {
            setMissionControlSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
          }
          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
            method: "PATCH",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(savePayload),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            if (!options.quiet) {
              setMissionControlSaveState({
                isSaving: false,
                error: data?.message || data?.error || options.errorMessage || "Failed to update Mission Control.",
                message: "",
              });
            }
            throw new Error(data?.message || data?.error || "Failed to update Mission Control.");
          }

          const updatedProject = getPlaygroundProjectResponseRecord(data, {
            ...nextProjectRecord,
            missionControl: normalizedMissionControlRecord,
            metadata: savePayload.metadata,
          });
          if (updatedProject?.id) {
            commitLocalProjectRecord(updatedProject, {
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
                })
              : current
            );
          }
          if (!options.quiet) {
            setMissionControlSaveState({
              isSaving: false,
              error: "",
              message: options.successMessage || "",
            });
          }
          return updatedProject;
        }

        async function flushQueuedMissionControlAutosave() {
          if (missionControlAutosaveInFlightRef.current) {
            return;
          }

          missionControlAutosaveInFlightRef.current = true;
          try {
            while (missionControlAutosaveQueuedRef.current) {
              const nextQueuedSave = missionControlAutosaveQueuedRef.current;
              missionControlAutosaveQueuedRef.current = null;
              try {
                await persistProjectMissionControlRecord(nextQueuedSave.projectId, nextQueuedSave.record, {
                  quiet: true,
                });
              } catch (error) {
                console.warn("Failed to save Mission Control document", error);
                break;
              }
            }
          } finally {
            missionControlAutosaveInFlightRef.current = false;
          }
        }

        function queueMissionControlAutosave(nextDocument) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return;
          }

          missionControlAutosaveQueuedRef.current = {
            projectId: normalizedProjectId,
            record: buildMissionControlRecordForSave({
              document: String(nextDocument || ""),
              updatedAt: new Date().toISOString(),
            }),
          };
          void flushQueuedMissionControlAutosave();
        }

        function commitMissionControlDocumentIfDirty() {
          const nextDocument = String(missionControlDocumentDraft || "");
          if (!String(selectedProjectId || "").trim()) {
            return;
          }
          if (nextDocument === String(selectedProjectMissionControl.document || "")) {
            return;
          }
          queueMissionControlAutosave(nextDocument);
        }

        async function commitMissionControlInstructionsIfDirty() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return;
          }
          const nextInstructions = String(missionControlInstructionsDraft || "");
          const currentInstructions = String(selectedProjectMissionInstructions || "");
          if (nextInstructions === currentInstructions) {
            return;
          }
          try {
            await persistProjectMissionControlRecord(normalizedProjectId, {
              ...buildMissionControlRecordForSave(),
              instructions: nextInstructions,
              updatedAt: new Date().toISOString(),
            }, {
              successMessage: "",
            });
          } catch {}
        }

        function serializePlaygroundStrategyListForInput(values) {
          return normalizePlaygroundStrategyTextList(values).join(String.fromCharCode(10));
        }

        function serializeMissionControlSetupOutcomesForInput(outcomes) {
          return (Array.isArray(outcomes) ? outcomes : [])
            .map((outcome) => {
              const normalizedOutcome = normalizePlaygroundStrategyOutcomeRecord(outcome);
              const title = String(normalizedOutcome.title || "").trim();
              const description = String(normalizedOutcome.description || "").trim();
              return title || description
                ? title + (description ? " - " + description : "")
                : "";
            })
            .filter(Boolean)
            .join(String.fromCharCode(10));
        }

        function getMissionControlSetupOutcomeDraftLines(value) {
          const normalizedValue = String(value || "").replaceAll(String.fromCharCode(13), "");
          return normalizedValue ? normalizedValue.split(String.fromCharCode(10)) : [];
        }

        function serializeMissionControlSetupOutcomeDraftLines(lines) {
          return (Array.isArray(lines) ? lines : [])
            .map((line) => String(line || "").replaceAll(String.fromCharCode(13), ""))
            .join(String.fromCharCode(10));
        }

        function parseMissionControlSetupOutcomesInput(value, previousOutcomes = []) {
          const lines = getMissionControlSetupOutcomeDraftLines(value)
            .map((line) => line.trim().replace(/^[-*]\\s+/, "").replace(/^\\d+[.)]\\s+/, ""))
            .filter(Boolean);
          return lines.map((line, index) => {
            const previousOutcome = normalizePlaygroundStrategyOutcomeRecord(previousOutcomes[index] || {}, index);
            const parts = line.split(/\\s+-\\s+/);
            const title = String(parts.shift() || "").trim();
            const description = parts.join(" - ").trim();
            return normalizePlaygroundStrategyOutcomeRecord({
              ...previousOutcome,
              title: title || previousOutcome.title || ("Outcome " + String(index + 1)),
              description,
            }, index);
          });
        }

        function buildMissionControlSetupStrategyBriefFromDraft(outcomesDraftOverride) {
          const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraftRef.current || missionControlStrategyDraft);
          const projectGoal = String(
            projectDescriptionTextareaRef.current
              ? projectDescriptionTextareaRef.current.value
              : projectDraft.description || ""
          ).replaceAll(String.fromCharCode(13), "").trim();
          const outcomesDraft = typeof outcomesDraftOverride === "string"
            ? outcomesDraftOverride
            : missionControlSetupOutcomesDraft;
          return normalizePlaygroundProjectStrategyBrief({
            ...currentStrategyBrief,
            mission: projectGoal,
            outcomes: parseMissionControlSetupOutcomesInput(
              outcomesDraft,
              currentStrategyBrief.outcomes
            ),
          });
        }

        async function saveMissionControlStrategyBrief(nextStrategyBrief, options = {}) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return null;
          }
          const normalizedStrategyBrief = normalizePlaygroundProjectStrategyBrief(nextStrategyBrief);
          const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(
            (selectedProjectMissionControlRef.current || selectedProjectMissionControl).strategyBrief
          );
          if (JSON.stringify(normalizedStrategyBrief) === JSON.stringify(currentStrategyBrief)) {
            return null;
          }
          try {
            const updatedProject = await persistProjectMissionControlRecord(normalizedProjectId, {
              ...buildMissionControlRecordForSave(),
              strategyBrief: normalizedStrategyBrief,
              updatedAt: new Date().toISOString(),
            }, {
              successMessage: "",
            });
            if (updatedProject?.id) {
              const savedStrategyBrief = getPlaygroundProjectStrategyBriefRecord(updatedProject);
              if (JSON.stringify(savedStrategyBrief.outcomes) !== JSON.stringify(normalizedStrategyBrief.outcomes)) {
                throw new Error("Outcome changes were not confirmed by the project API.");
              }
            }
            return updatedProject;
          } catch (error) {
            if (options?.throwOnError) {
              throw error;
            }
            return null;
          }
        }

        function updateMissionControlStrategyDraft(nextStrategyBrief) {
          setMissionControlStrategyDraft(normalizePlaygroundProjectStrategyBrief(nextStrategyBrief));
        }

        function updateMissionControlStrategyTextField(field, value) {
          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            [field]: value,
          });
        }

        function updateMissionControlStrategyListField(field, value) {
          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            [field]: normalizePlaygroundStrategyTextList(value),
          });
        }

        function updateMissionControlStrategyOutcome(indexToUpdate, updates) {
          const outcomes = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft).outcomes;
          const nextOutcomes = outcomes.map((outcome, index) => index === indexToUpdate
            ? normalizePlaygroundStrategyOutcomeRecord({ ...outcome, ...updates }, index)
            : outcome
          );
          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            outcomes: nextOutcomes,
          });
        }

        function addMissionControlStrategyOutcome() {
          const outcomes = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft).outcomes;
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
            ...missionControlStrategyDraft,
            outcomes: outcomes.concat(normalizePlaygroundStrategyOutcomeRecord({
              id: "outcome-" + String(outcomes.length + 1).padStart(2, "0"),
              title: "New outcome",
              description: "",
              successCriteria: [],
            }, outcomes.length)),
          });
          setMissionControlStrategyDraft(nextStrategyBrief);
          void saveMissionControlStrategyBrief(nextStrategyBrief);
        }

        function removeMissionControlStrategyOutcome(indexToRemove) {
          const outcomes = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft).outcomes;
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
            ...missionControlStrategyDraft,
            outcomes: outcomes.filter((_, index) => index !== indexToRemove),
          });
          setMissionControlStrategyDraft(nextStrategyBrief);
          void saveMissionControlStrategyBrief(nextStrategyBrief);
        }

        function syncMissionControlSetupOutcomesDraft(nextStrategyBrief) {
          const normalizedStrategyBrief = normalizePlaygroundProjectStrategyBrief(nextStrategyBrief);
          setMissionControlSetupOutcomesDraft(serializeMissionControlSetupOutcomesForInput(normalizedStrategyBrief.outcomes));
        }

        function applyMissionControlStrategyBriefFromOutcomeEditor(nextStrategyBrief) {
          const normalizedStrategyBrief = normalizePlaygroundProjectStrategyBrief(nextStrategyBrief);
          setMissionControlStrategyDraft(normalizedStrategyBrief);
          if (missionControlSetupOpen) {
            syncMissionControlSetupOutcomesDraft(normalizedStrategyBrief);
            setIsMissionControlSetupOutcomesEditing(false);
          }
        }

        function finishCloseProjectOverviewOutcomeEditor() {
          if (projectOverviewOutcomeEditorCloseTimerRef.current) {
            window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
            projectOverviewOutcomeEditorCloseTimerRef.current = null;
          }
          if (projectOverviewOutcomeEditorFrameRef.current) {
            window.cancelAnimationFrame(projectOverviewOutcomeEditorFrameRef.current);
            projectOverviewOutcomeEditorFrameRef.current = null;
          }
          setProjectOverviewOutcomeEditorVisible(false);
          setProjectOverviewOutcomeEditorClosing(false);
          setProjectOverviewOutcomeDescriptionEditing(false);
          setProjectOverviewOutcomeSuccessCriteriaEditing(false);
          setProjectOverviewOutcomeMilestonePickerOpen(false);
          setProjectOverviewOutcomeEditorState(null);
        }

        function closeProjectOverviewOutcomeEditor(options = {}) {
          if (!projectOverviewOutcomeEditorState) {
            return;
          }
          if (options?.animate === false) {
            finishCloseProjectOverviewOutcomeEditor();
            return;
          }
          if (projectOverviewOutcomeEditorClosing) {
            return;
          }
          setProjectOverviewOutcomeEditorVisible(false);
          setProjectOverviewOutcomeEditorClosing(true);
          if (projectOverviewOutcomeEditorCloseTimerRef.current) {
            window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
          }
          projectOverviewOutcomeEditorCloseTimerRef.current = window.setTimeout(() => {
            projectOverviewOutcomeEditorCloseTimerRef.current = null;
            finishCloseProjectOverviewOutcomeEditor();
          }, projectOverviewOutcomeEditorAnimationMs);
        }

        function buildProjectOverviewOutcomeEditorDraft(outcome, index = 0) {
          const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(outcome, index);
          return {
            ...normalizedDraft,
            successCriteriaInput: serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
          };
        }

        function updateProjectOverviewOutcomeEditorDraft(updates) {
          if (typeof setProjectOverviewOutcomeEditorState !== "function") return;
          setProjectOverviewOutcomeEditorState((current) => current
            ? {
                ...current,
                draft: {
                  ...(current.draft || {}),
                  ...(updates || {}),
                },
              }
            : current
          );
        }

        function getProjectOverviewOutcomeEditorDraft(index = 0) {
          const rawDraft = projectOverviewOutcomeEditorState?.draft || {};
          const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(rawDraft, index);
          return {
            ...normalizedDraft,
            title: typeof rawDraft.title === "string" ? rawDraft.title : normalizedDraft.title,
            description: typeof rawDraft.description === "string" ? rawDraft.description : normalizedDraft.description,
            successCriteriaInput: typeof rawDraft.successCriteriaInput === "string"
              ? rawDraft.successCriteriaInput
              : serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
          };
        }

        function normalizeProjectOverviewOutcomeEditorDraftForSave(rawDraft, index = 0) {
          return normalizePlaygroundStrategyOutcomeRecord({
            ...(rawDraft || {}),
            taskIds: [],
            successCriteria: typeof rawDraft?.successCriteriaInput === "string"
              ? normalizePlaygroundStrategyTextList(rawDraft.successCriteriaInput)
              : rawDraft?.successCriteria,
          }, index);
        }

        async function saveProjectOverviewOutcomeEditor(options = {}) {
          const sourceStrategyBrief = normalizePlaygroundProjectStrategyBrief(options?.strategyBrief || missionControlStrategyDraft);
          const index = Number(projectOverviewOutcomeEditorState?.index);
          const draft = normalizeProjectOverviewOutcomeEditorDraftForSave(projectOverviewOutcomeEditorState?.draft, index);
          if (!Number.isInteger(index) || index < 0 || index > sourceStrategyBrief.outcomes.length) {
            closeProjectOverviewOutcomeEditor();
            return;
          }
          const isNewOutcome = projectOverviewOutcomeEditorState?.isNew === true || index >= sourceStrategyBrief.outcomes.length;
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
            ...missionControlStrategyDraft,
            ...sourceStrategyBrief,
            outcomes: isNewOutcome
              ? sourceStrategyBrief.outcomes.concat(draft)
              : sourceStrategyBrief.outcomes.map((outcome, outcomeIndex) => outcomeIndex === index ? draft : outcome),
          });
          applyMissionControlStrategyBriefFromOutcomeEditor(nextStrategyBrief);
          if (String(selectedProjectId || "").trim()) {
            try {
              await saveMissionControlStrategyBrief(nextStrategyBrief, { throwOnError: true });
            } catch (error) {
              setMissionControlSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save outcome.",
                message: "",
              });
              return;
            }
          }
          closeProjectOverviewOutcomeEditor();
        }

        function deleteProjectOverviewOutcomeEditor(options = {}) {
          const sourceStrategyBrief = normalizePlaygroundProjectStrategyBrief(options?.strategyBrief || missionControlStrategyDraft);
          const index = Number(projectOverviewOutcomeEditorState?.index);
          if (projectOverviewOutcomeEditorState?.isNew !== true && Number.isInteger(index) && index >= 0) {
            const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
              ...missionControlStrategyDraft,
              ...sourceStrategyBrief,
              outcomes: sourceStrategyBrief.outcomes.filter((_, outcomeIndex) => outcomeIndex !== index),
            });
            applyMissionControlStrategyBriefFromOutcomeEditor(nextStrategyBrief);
            if (String(selectedProjectId || "").trim()) {
              void saveMissionControlStrategyBrief(nextStrategyBrief);
            }
          }
          closeProjectOverviewOutcomeEditor();
        }

        function updateProjectOverviewOutcomeEditorMilestone(releaseId) {
          const normalizedReleaseId = String(releaseId || "").trim();
          const currentReleaseIds = normalizePlaygroundStrategyOutcomeReleaseIds(projectOverviewOutcomeEditorState?.draft || {});
          const nextReleaseIds = normalizedReleaseId
            ? (currentReleaseIds.includes(normalizedReleaseId)
                ? currentReleaseIds.filter((id) => id !== normalizedReleaseId)
                : currentReleaseIds.concat(normalizedReleaseId))
            : [];
          updateProjectOverviewOutcomeEditorDraft({
            releaseIds: nextReleaseIds,
            releaseId: nextReleaseIds[0] || "",
            taskIds: [],
          });
          if (!normalizedReleaseId) {
            setProjectOverviewOutcomeMilestonePickerOpen(false);
          }
        }

        function applyProjectOverviewOutcomeEditorSelection(field, textareaRef, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateProjectOverviewOutcomeEditorDraft({ [field]: nextValue });
          window.requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleProjectOverviewOutcomeEditorFormat(field, textareaRef, formatType) {
          const textarea = textareaRef.current;
          if (!textarea) {
            return;
          }
          const draft = projectOverviewOutcomeEditorState?.draft || {};
          const value = String(draft?.[field] || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyProjectOverviewOutcomeEditorSelection(field, textareaRef, edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function renderSharedProjectOverviewOutcomeEditorModal(options = {}) {
          const sourceStrategyBrief = normalizePlaygroundProjectStrategyBrief(options?.strategyBrief || missionControlStrategyDraft);
          const normalizedOverviewTasks = Array.isArray(options?.normalizedOverviewTasks)
            ? options.normalizedOverviewTasks
            : (Array.isArray(tasks) ? tasks.map((task) => normalizePlaygroundTaskRecord(task)) : []);
          const index = Number(projectOverviewOutcomeEditorState?.index);
          const draft = getProjectOverviewOutcomeEditorDraft(index);
          if (!projectOverviewOutcomeEditorState || !Number.isInteger(index) || index < 0) {
            return null;
          }
          const activeOutcomeMilestoneIds = normalizePlaygroundStrategyOutcomeReleaseIds(draft);
          const activeOutcomeMilestoneIdSet = new Set(activeOutcomeMilestoneIds);
          const activeOutcomeMilestones = activeOutcomeMilestoneIds
            .map((releaseId) => releasesById[releaseId] || null)
            .filter(Boolean);
          const activeOutcomeMilestoneTaskInfoById = activeOutcomeMilestoneIds.reduce((result, releaseId) => {
            const milestoneTasks = normalizedOverviewTasks.filter((task) => String(task?.releaseId || "").trim() === releaseId);
            result[releaseId] = {
              tasks: milestoneTasks,
              doneTasks: milestoneTasks.filter((task) => getTaskBoardStatus(task) === "done"),
            };
            return result;
          }, {});
          const sortedOutcomeMilestones = releases.slice().sort(compareTaskReleaseOrder);
          const outcomeMarkdownActions = [
            { id: "bold", label: "Bold", icon: Bold },
            { id: "italic", label: "Italic", icon: Italic },
            { id: "underline", label: "Underline", icon: Underline },
            { id: "list", label: "List", icon: List },
          ];

          function renderProjectOverviewOutcomeMarkdownEditor({
            title,
            field,
            value,
            placeholder,
            isEditing,
            setEditing,
            textareaRef,
          }) {
            const hasValue = Boolean(String(value || "").trim());
            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, title),
                React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                  outcomeMarkdownActions.map((action) =>
                    React.createElement("button", {
                      key: action.id,
                      type: "button",
                      className: "playground-tasks-detail-format-button",
                      title: action.label,
                      "aria-label": action.label,
                      onMouseDown: (event) => event.preventDefault(),
                      onClick: () => handleProjectOverviewOutcomeEditorFormat(field, textareaRef, action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isEditing ? " is-editing" : " is-preview") },
                !isEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      hasValue
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: value,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, placeholder)
                    )
                  : null,
                React.createElement("textarea", {
                  ref: textareaRef,
                  className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isEditing ? placeholder : "",
                  value,
                  onFocus: () => setEditing(true),
                  onChange: (event) => {
                    updateProjectOverviewOutcomeEditorDraft({ [field]: event.target.value });
                    resizeTaskDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: () => setEditing(false),
                })
              )
            );
          }

          function renderProjectOverviewOutcomeMilestonePicker() {
            return renderPlaygroundPlatformPopup({
              open: projectOverviewOutcomeMilestonePickerOpen,
              shellRef: projectOverviewOutcomeMilestonePickerRef,
              shellClassName: "playground-project-overview-outcome-milestone-picker-shell",
              menuClassName: "playground-project-overview-outcome-milestone-menu",
              trigger: React.createElement("button", {
                type: "button",
                className: "playground-project-overview-outcome-milestone-add",
                title: "Link milestones",
                "aria-label": "Link milestones",
                "aria-expanded": projectOverviewOutcomeMilestonePickerOpen ? "true" : "false",
                onClick: () => setProjectOverviewOutcomeMilestonePickerOpen((current) => !current),
              }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 })),
              children: sortedOutcomeMilestones.length > 0
                ? sortedOutcomeMilestones.map((release) =>
                    React.createElement("button", {
                        key: release.id,
                        type: "button",
                        className: "tb-popup-row tb-popup-row-select" + (activeOutcomeMilestoneIdSet.has(release.id) ? " selected" : ""),
                        onClick: () => updateProjectOverviewOutcomeEditorMilestone(release.id),
                      },
                      activeOutcomeMilestoneIdSet.has(release.id)
                        ? React.createElement(Check, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 })
                        : React.createElement(ListTodo, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, release.name || "Untitled milestone"),
                        React.createElement("small", null, formatPlaygroundTaskReleaseDateRange(release))
                      )
                    )
                  )
                : React.createElement("div", { className: "tb-popup-empty-state" }, "No milestones yet."),
            });
          }

          function renderProjectOverviewOutcomeMilestoneField() {
            return React.createElement("div", { className: "playground-project-overview-outcome-milestone-field" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-project-overview-outcome-milestone-title-row" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Linked milestones")
                ),
                renderProjectOverviewOutcomeMilestonePicker()
              ),
              activeOutcomeMilestones.length > 0
                ? activeOutcomeMilestones.map((milestone) => {
                    const milestoneTaskInfo = activeOutcomeMilestoneTaskInfoById[milestone.id] || { tasks: [], doneTasks: [] };
                    const milestoneTaskLabel = milestoneTaskInfo.tasks.length
                      ? milestoneTaskInfo.doneTasks.length + "/" + milestoneTaskInfo.tasks.length + " tickets done"
                      : formatPlaygroundTaskReleaseDateRange(milestone);
                    return React.createElement("div", { key: milestone.id, className: "playground-tasks-backlog-item playground-project-overview-outcome-milestone-row" },
                      React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                        React.createElement("div", { className: "playground-tasks-backlog-leading" },
                          React.createElement("div", {
                            className: "playground-tasks-backlog-project-icon is-task",
                            "aria-hidden": "true",
                          }, React.createElement(ListTodo, { width: 14, height: 14, strokeWidth: 1.9 })),
                          React.createElement("div", { className: "playground-tasks-backlog-main" },
                            React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Milestone"),
                            React.createElement("span", { className: "playground-tasks-backlog-title" }, milestone.name || "Untitled milestone")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-backlog-meta" },
                          React.createElement("span", { className: "playground-tasks-backlog-ticket" }, milestoneTaskLabel)
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-outcome-milestone-remove",
                          title: "Unlink milestone",
                          "aria-label": "Unlink milestone",
                          onClick: () => updateProjectOverviewOutcomeEditorMilestone(milestone.id),
                        }, React.createElement(Minus, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    );
                  })
                : React.createElement("button", {
                    type: "button",
                    className: "playground-mission-control-modal-outcomes-empty",
                    onClick: () => setProjectOverviewOutcomeMilestonePickerOpen(true),
                  }, "Link a milestone")
            );
          }

          const content = renderPlaygroundPlatformModal({
            open: Boolean(projectOverviewOutcomeEditorState),
            visible: projectOverviewOutcomeEditorVisible,
            closing: projectOverviewOutcomeEditorClosing,
            onClose: () => closeProjectOverviewOutcomeEditor(),
            as: "form",
            backdropClassName: "playground-mission-control-modal-backdrop playground-project-overview-outcome-editor-backdrop",
            className: "playground-tasks-project-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal",
            ariaLabel: "Edit outcome",
            surfaceProps: {
              onSubmit: (event) => {
                  event.preventDefault();
                  void saveProjectOverviewOutcomeEditor({ strategyBrief: sourceStrategyBrief });
                },
            },
            children: React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(Award, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-project-overview-outcome-editor-title-input",
                    value: draft.title,
                    placeholder: "Outcome title",
                    autoFocus: true,
                    onChange: (event) => updateProjectOverviewOutcomeEditorDraft({ title: event.target.value }),
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: () => closeProjectOverviewOutcomeEditor(),
                  title: "Close",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body" },
                  renderProjectOverviewOutcomeMarkdownEditor({
                    title: "Description",
                    field: "description",
                    value: draft.description,
                    placeholder: "What this outcome should achieve",
                    isEditing: projectOverviewOutcomeDescriptionEditing,
                    setEditing: setProjectOverviewOutcomeDescriptionEditing,
                    textareaRef: projectOverviewOutcomeDescriptionTextareaRef,
                  }),
                  renderProjectOverviewOutcomeMarkdownEditor({
                    title: "Success criteria",
                    field: "successCriteriaInput",
                    value: draft.successCriteriaInput,
                    placeholder: "One success criterion per line",
                    isEditing: projectOverviewOutcomeSuccessCriteriaEditing,
                    setEditing: setProjectOverviewOutcomeSuccessCriteriaEditing,
                    textareaRef: projectOverviewOutcomeSuccessCriteriaTextareaRef,
                  }),
                  renderProjectOverviewOutcomeMilestoneField()
                ),
                missionControlSaveState?.error
                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, missionControlSaveState.error)
                  : null,
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button playground-project-overview-outcome-delete-button",
                    onClick: () => deleteProjectOverviewOutcomeEditor({ strategyBrief: sourceStrategyBrief }),
                  }, "Delete"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeProjectOverviewOutcomeEditor(),
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: missionControlSaveState.isSaving || !String(draft.title || "").trim(),
                  }, "Save Outcome")
                )
              )
            )
          });
          return content;
        }

        async function handleMissionControlEnvironmentSelectionChange(nextEnvironmentId) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
          if (!normalizedProjectId || !normalizedEnvironmentId || normalizedEnvironmentId === getPlaygroundProjectDefaultEnvironmentId(selectedProject)) {
            setTaskDetailSelectPopover("");
            return;
          }
          try {
            await persistProjectMissionControlRecord(normalizedProjectId, buildMissionControlRecordForSave(), {
              projectOverrides: {
                defaultEnvironmentId: normalizedEnvironmentId,
              },
              successMessage: "Mission updated",
            });
          } catch {} finally {
            setTaskDetailSelectPopover("");
          }
        }

        async function handleAddMissionControlComment() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const nextCommentBody = String(missionControlCommentInputValue || "").replaceAll(String.fromCharCode(13), "").trim();
          if (!normalizedProjectId || !nextCommentBody) {
            return;
          }

          const createdComment = createPlaygroundTaskCommentRecord(nextCommentBody, {
            authorType: "user",
            name: currentUserName || "Computer Agents",
            avatarUrl: currentUserAvatarUrl || "",
          });
          if (!createdComment) {
            return;
          }

          try {
            await persistProjectMissionControlRecord(normalizedProjectId, {
              ...buildMissionControlRecordForSave(),
              comments: normalizePlaygroundTaskCommentList(selectedProjectMissionComments.concat(createdComment)),
              updatedAt: new Date().toISOString(),
            }, {
              successMessage: "Comment added",
            });
            setMissionControlCommentInputValue("");
          } catch {}
        }

        function buildMissionControlAgentPayload(agentRecord, modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, tierId = subscriptionTierId) {
          const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundMissionControlAgentDraft(modelOptions, tierId));
          const existingMetadata = normalizedAgent.metadata && typeof normalizedAgent.metadata === "object" && !Array.isArray(normalizedAgent.metadata)
            ? normalizedAgent.metadata
            : {};
          return {
            name: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
            description: String(normalizedAgent.description || "").trim() || PLAYGROUND_MISSION_CONTROL_AGENT_DESCRIPTION,
            model: getPlaygroundAgentModelMeta(normalizedAgent.model || resolvePlaygroundMissionControlAgentModelId(modelOptions, tierId), modelOptions).id,
            instructions: String(normalizedAgent.instructions || buildPlaygroundMissionControlAgentInstructions()),
            binary: String(normalizedAgent.binary || "").trim() || "Claude Code CLI",
            reasoningEffort: ["minimal", "low", "medium", "high"].includes(normalizedAgent.reasoningEffort)
              ? normalizedAgent.reasoningEffort
              : "medium",
            enabledSkills: normalizePlaygroundEnabledSkillIds(normalizedAgent.enabledSkills).filter((skillId) =>
              skillId === "task_management" || skillId === "computer_agents" || skillId === "memory"
            ),
            deepResearchModel: null,
            permissionSet: normalizePlaygroundPermissionSet(normalizedAgent.permissionSet, "agent"),
            metadata: {
              ...existingMetadata,
              runnerPlayground: {
                ...(existingMetadata.runnerPlayground && typeof existingMetadata.runnerPlayground === "object" && !Array.isArray(existingMetadata.runnerPlayground)
                  ? existingMetadata.runnerPlayground
                  : {}),
                role: PLAYGROUND_MISSION_CONTROL_AGENT_METADATA_ROLE,
                internal: true,
                managedBy: "runner-web-sdk-demo",
                version: 1,
              },
              profile: {
                email: slugifyPlaygroundAgentEmailLocalPart(PLAYGROUND_MISSION_CONTROL_AGENT_NAME) + "@" + PLAYGROUND_AGENT_EMAIL_DOMAIN,
                photoURL: PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL,
              },
            },
          };
        }

        async function alignMissionControlAgentModel(agentRecord) {
          const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord);
          if (!normalizedAgent?.id || normalizedAgent.id === PLAYGROUND_AGENT_DRAFT_ID) {
            return normalizedAgent;
          }

          const desiredModelId = resolvePlaygroundMissionControlAgentModelId(PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
          if (!desiredModelId || normalizedAgent.model === desiredModelId) {
            return normalizedAgent;
          }

          try {
            const payload = buildMissionControlAgentPayload({
              ...normalizedAgent,
              model: desiredModelId,
            }, PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
            const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(normalizedAgent.id), {
              method: "PATCH",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update Mission Control.");
            }
            return normalizePlaygroundAgentRecord(getPlaygroundAgentResponseRecord(data) || {
              ...normalizedAgent,
              ...payload,
              id: normalizedAgent.id,
              updatedAt: new Date().toISOString(),
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update Mission Control.";
            if (!isPlaygroundPaidModelSubscriptionError(errorMessage)) {
              console.warn("Failed to align Mission Control model", error);
            }
            return normalizedAgent;
          }
        }

        async function ensureMissionControlAgent() {
          const existingLocalAgent = missionControlAgent?.id && missionControlAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            ? normalizePlaygroundAgentRecord(missionControlAgent)
            : null;
          if (existingLocalAgent?.id) {
            const alignedAgent = await alignMissionControlAgentModel(existingLocalAgent);
            setMissionControlAgent(alignedAgent);
            return alignedAgent;
          }

          const existingPropAgent = (Array.isArray(agents) ? agents : []).find((agent) => isPlaygroundMissionControlAgent(agent)) || null;
          if (existingPropAgent?.id && existingPropAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
            const normalizedExistingAgent = await alignMissionControlAgentModel(existingPropAgent);
            setMissionControlAgent(normalizedExistingAgent);
            setMissionControlAgentError("");
            return normalizedExistingAgent;
          }

          if (missionControlAgentSavePromiseRef.current) {
            return missionControlAgentSavePromiseRef.current;
          }

          setMissionControlAgentPreparing(true);
          setMissionControlAgentError("");
          const savePromise = (async () => {
            let existingRemoteAgent = null;
            try {
              const listResponse = await fetch(backendUrl + "/agents?limit=200", {
                method: "GET",
                headers: requestHeaders,
              });
              const listData = await listResponse.json().catch(() => ({}));
              if (listResponse.ok) {
                existingRemoteAgent = parsePlaygroundAgentListResponse(listData).find((agent) => isPlaygroundMissionControlAgent(agent)) || null;
              }
            } catch {}

            if (existingRemoteAgent?.id && existingRemoteAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
              const normalizedExistingAgent = await alignMissionControlAgentModel(existingRemoteAgent);
              setMissionControlAgent(normalizedExistingAgent);
              return normalizedExistingAgent;
            }

            const draftAgent = buildPlaygroundMissionControlAgentDraft(PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
            const payload = buildMissionControlAgentPayload(draftAgent, PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
            const response = await fetch(backendUrl + "/agents", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to prepare Mission Control.");
            }
            const savedAgent = getPlaygroundAgentResponseRecord(data) || normalizePlaygroundAgentRecord({
              ...draftAgent,
              ...payload,
              updatedAt: new Date().toISOString(),
            });
            if (!savedAgent?.id) {
              throw new Error("Mission Control agent creation failed.");
            }
            setMissionControlAgent(savedAgent);
            return savedAgent;
          })();

          missionControlAgentSavePromiseRef.current = savePromise;
          try {
            return await savePromise;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to prepare Mission Control.";
            setMissionControlAgentError(isPlaygroundPaidModelSubscriptionError(errorMessage) ? "" : errorMessage);
            throw error;
          } finally {
            missionControlAgentSavePromiseRef.current = null;
            setMissionControlAgentPreparing(false);
          }
        }

        function buildMissionControlThreadMetadata(projectRecord, userPrompt = "") {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          return {
            runnerPlayground: {
              missionControl: {
                projectId: normalizedProject.id || selectedProjectId || "",
                projectName: normalizedProject.name || "Project",
                source: "project_backlog_mission_control",
                requestedAt: new Date().toISOString(),
                userPrompt: String(userPrompt || "").trim(),
              },
            },
          };
        }

        function buildMissionControlThreadRecord(threadId, projectRecord, userPrompt, agentId, environmentId) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          const normalizedThreadId = String(threadId || "").trim();
          return {
            id: normalizedThreadId,
            title: (normalizedProject.name || "Project") + " Mission Control",
            projectId: normalizedProject.id || selectedProjectId || "",
            environmentId: String(environmentId || "").trim() || null,
            agentId: String(agentId || "").trim() || null,
            status: "running",
            metadata: buildMissionControlThreadMetadata(normalizedProject, userPrompt),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        function openMissionControlStrategySidebar() {
          if (!selectedProjectId) {
            return;
          }
          setTaskView("overview");
          setProjectOverviewHomeTab("strategy");
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setMissionControlSetupOpen(false);
          setSelectedTaskId("");
          setDraftTask(null);
          setProjectPreviewedAttachmentId("");
          setMissionControlStrategyOpen(false);
        }

        function openMissionControlComposer(options = {}) {
          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedSelectedProjectId) {
            return false;
          }
          const requestedProjectRecord = options?.projectRecord && typeof options.projectRecord === "object" && !Array.isArray(options.projectRecord)
            ? normalizePlaygroundProjectRecord(options.projectRecord)
            : null;
          const sourceProject = requestedProjectRecord?.id === normalizedSelectedProjectId
            ? requestedProjectRecord
            : selectedProject?.id === normalizedSelectedProjectId
              ? selectedProject
              : selectedProjectSnapshot?.id === normalizedSelectedProjectId
                ? selectedProjectSnapshot
                : projects.find((project) => project?.id === normalizedSelectedProjectId) || null;
          if (!sourceProject?.id) {
            return false;
          }
          const normalizedProject = normalizePlaygroundProjectRecord(sourceProject);
          const activeEditDraft = projectComposerOpen
            && projectComposerMode === "edit"
            && projectDraft?.id === normalizedProject.id
              ? projectDraft
              : null;
          if (!activeEditDraft) {
            projectDraftNameDirtyRef.current = false;
            projectDraftTypedNameRef.current = "";
          }
          const nextProjectDraft = activeEditDraft && projectDraftNameDirtyRef.current
            ? mergePlaygroundProjectRecords(activeEditDraft, normalizedProject) || activeEditDraft
            : normalizedProject;
          const projectIndex = projects.findIndex((project) => project.id === normalizedProject.id);
          const wallpaperConfig = getPlaygroundProjectWallpaperConfig(nextProjectDraft, projectIndex >= 0 ? projectIndex : 0);
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          setMissionControlStrategyOpen(false);
          setProjectComposerMode("edit");
          setProjectDraft((current) => preserveDirtyProjectDraftName({
            ...nextProjectDraft,
            wallpaperId: getPlaygroundProjectWallpaperId(nextProjectDraft.wallpaperId, wallpaperConfig.id),
          }, current));
          setProjectDescriptionEditing(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectPreviewedAttachmentId("");
          setProjectAttachmentTransferState({
            uploadingIds: [],
            error: "",
            isProcessing: false,
          });
          setIsProjectAttachmentDragging(false);
          setProjectEnvironmentFilePickerOpen(false);
          setProjectEnvironmentFilePickerInventory([]);
          setProjectEnvironmentFilePickerState({
            status: "idle",
            error: "",
          });
          setProjectEnvironmentFilePickerSearch("");
          setProjectEnvironmentFilePickerExpandedFolders([]);
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectSaveState({
            isSaving: false,
            error: "",
          });
          setProjectIconPickerOpen(false);
          setProjectComposerOpen(true);
          setMissionControlSetupOpen(true);
          setMissionControlSetupResetToken((current) => current + 1);
          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          void ensureMissionControlAgent();
          return true;
        }

        async function handleBacklogMissionControlSubmit(payload) {
          if (!selectedProjectId || !selectedProject) {
            return;
          }

          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
          const normalizedOperatorPrompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
          const launchEnvironmentId = String(
            payload?.environmentId
            || normalizedProject.defaultEnvironmentId
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || ""
          ).trim();
          const launchAgentId = String(
            payload?.agentId
            || backlogComposerAgentId
            || initialAgentId
            || ""
          ).trim();
          const missionControlPrompt = buildPlaygroundMissionControlPrompt({
            userPrompt: normalizedOperatorPrompt,
            attachments: payload?.attachments,
            launchAgentId: launchAgentId,
          });
          const runAttachments = mergePlaygroundAttachmentLists(
            normalizedProject.attachments,
            Array.isArray(payload?.attachments) ? payload.attachments : []
          );
          const enabledSkillsPayload = buildPlaygroundMissionControlEnabledSkillsPayload(payload?.enabledSkills);
          const projectGithubRepo = payload?.githubRepo
            || buildPlaygroundGithubRepoReferenceFromConnectorSelection(normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors).github);
          const response = await fetch(backendUrl + "/threads", {
            method: "POST",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                title: (normalizedProject.name || "Project") + " Mission Control",
                appId: "runner-web-sdk-demo",
                projectId: selectedProjectId,
                environmentId: launchEnvironmentId || undefined,
                agentId: launchAgentId || undefined,
                metadata: {
                  runnerPlayground: {
                    missionControl: {
                      projectId: selectedProjectId,
                      projectName: normalizedProject.name || "Project",
                      source: "project_backlog_mission_control",
                      requestedAt: new Date().toISOString(),
                      userPrompt: normalizedOperatorPrompt,
                    },
                  },
                },
              },
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to start Mission Control.");
          }

          const threadRecord = getPlaygroundThreadResponseRecord(data);
          if (!threadRecord?.id) {
            throw new Error("Mission Control thread creation failed.");
          }
          const runnerPlaygroundMetadata = threadRecord?.metadata?.runnerPlayground
            && typeof threadRecord.metadata.runnerPlayground === "object"
            && !Array.isArray(threadRecord.metadata.runnerPlayground)
            ? threadRecord.metadata.runnerPlayground
            : {};
          const launchedThreadRecord = {
            ...(threadRecord && typeof threadRecord === "object" ? threadRecord : {}),
            projectId: selectedProjectId,
            metadata: {
              ...(threadRecord?.metadata && typeof threadRecord.metadata === "object" && !Array.isArray(threadRecord.metadata)
                ? threadRecord.metadata
                : {}),
              runnerPlayground: {
                ...runnerPlaygroundMetadata,
                missionControl: {
                  ...(runnerPlaygroundMetadata?.missionControl && typeof runnerPlaygroundMetadata.missionControl === "object" && !Array.isArray(runnerPlaygroundMetadata.missionControl)
                    ? runnerPlaygroundMetadata.missionControl
                    : {}),
                  projectId: selectedProjectId,
                  projectName: normalizedProject.name || "Project",
                  source: "project_backlog_mission_control",
                  requestedAt: new Date().toISOString(),
                  userPrompt: normalizedOperatorPrompt,
                },
              },
            },
          };

          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          setMissionControlRunState({
            threadId: launchedThreadRecord.id,
            projectId: selectedProjectId,
            status: "starting",
            error: "",
          });
          if (typeof onStatusIndicatorItemChange === "function") {
            onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
              projectId: selectedProjectId,
              projectName: normalizedProject.name || "Project",
              phase: "starting",
            }));
          }
          if (onThreadStarted) {
            onThreadStarted(launchedThreadRecord.id, {
              threadRecord: launchedThreadRecord,
              taskRunRequest: {
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                prompt: missionControlPrompt,
                displayPrompt: normalizedOperatorPrompt || "Run Mission Control",
                userPrompt: normalizedOperatorPrompt,
                agentId: launchAgentId,
                agentName: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
                attachments: runAttachments,
                githubRepo: projectGithubRepo || null,
                enabledSkills: enabledSkillsPayload,
                environmentId: launchEnvironmentId,
              },
            });
          }
        }

        function handleMissionControlSetupRunRequest(runRequest) {
          const normalizedThreadId = String(runRequest?.threadId || "").trim();
          const normalizedOperatorPrompt = String(runRequest?.displayPrompt || runRequest?.prompt || "").trim();
          const isProjectComposerRun = projectComposerOpen && (projectComposerMode === "create" || projectComposerMode === "edit");
          const baseProjectRecord = isProjectComposerRun ? projectDraft : selectedProject;
          if (!baseProjectRecord || !normalizedThreadId || !normalizedOperatorPrompt) {
            return false;
          }

          setMissionControlAgentError("");
          if (isProjectComposerRun && !String(projectDraft.name || "").trim()) {
            setProjectSaveState({
              isSaving: false,
              error: "Project name is required.",
            });
            setMissionControlSetupResetToken((current) => current + 1);
            return true;
          }

          void (async () => {
            try {
              const missionAgent = await ensureMissionControlAgent();
              const normalizedInitialProject = normalizePlaygroundProjectRecord(baseProjectRecord);
              const savedProject = isProjectComposerRun
                ? await persistProjectComposerDraft({
                    mode: projectComposerMode,
                    closeAfterSave: false,
                    selectAfterSave: false,
                  })
                : normalizedInitialProject;
              let normalizedProject = normalizePlaygroundProjectRecord(savedProject || normalizedInitialProject);
              const setupStrategyBrief = buildMissionControlSetupStrategyBriefFromDraft();
              const runProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
              if (!runProjectId) {
                throw new Error("Project is unavailable.");
              }
              const updatedProjectWithMissionContext = await persistProjectMissionControlRecord(runProjectId, buildMissionControlRecordForSave({
                strategyBrief: setupStrategyBrief,
                updatedAt: new Date().toISOString(),
              }), {
                quiet: true,
                refreshBaseProject: false,
              }).catch(() => null);
              normalizedProject = normalizePlaygroundProjectRecord(
                updatedProjectWithMissionContext
                || {
                  ...normalizedProject,
                  missionControl: {
                    ...getPlaygroundProjectMissionControlRecord(normalizedProject),
                    strategyBrief: setupStrategyBrief,
                    updatedAt: new Date().toISOString(),
                  },
                }
              );
              const launchEnvironmentId = String(
                runRequest?.environmentId
                || normalizedProject.defaultEnvironmentId
                || backlogComposerEnvironmentId
                || initialEnvironmentId
                || ""
              ).trim();
              const launchAgentId = String(missionAgent?.id || "").trim();
              if (!launchAgentId) {
                throw new Error("Mission Control agent is unavailable.");
              }

              const runAttachments = mergePlaygroundAttachmentLists(
                normalizedProject.attachments,
                Array.isArray(runRequest?.attachments) ? runRequest.attachments : []
              );
              const projectGithubRepo = runRequest?.githubRepo
                || buildPlaygroundGithubRepoReferenceFromConnectorSelection(normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors).github);
              const missionControlPrompt = buildPlaygroundMissionControlPrompt({
                projectRecord: normalizedProject,
                userPrompt: normalizedOperatorPrompt,
                attachments: runRequest?.attachments,
                launchAgentId,
              });
              const enabledSkillsPayload = buildPlaygroundMissionControlEnabledSkillsPayload(runRequest?.enabledSkills);
              const missionControlMetadata = buildMissionControlThreadMetadata(normalizedProject, normalizedOperatorPrompt);
              const patchThreadResponse = await fetch(backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: (normalizedProject.name || "Project") + " Mission Control",
                  projectId: runProjectId,
                  agentId: launchAgentId,
                  environmentId: launchEnvironmentId || undefined,
                  metadata: missionControlMetadata,
                }),
              });
              const patchThreadData = await patchThreadResponse.json().catch(() => ({}));
              if (!patchThreadResponse.ok) {
                throw new Error(patchThreadData?.message || patchThreadData?.error || "Failed to prepare Mission Control thread.");
              }
              const launchedThreadRecord = buildMissionControlThreadRecord(
                normalizedThreadId,
                normalizedProject,
                normalizedOperatorPrompt,
                launchAgentId,
                launchEnvironmentId
              );

              setSelectedTaskId("");
              setDraftTask(null);
              setBacklogComposerMissionControlCommandRequest(null);
              closeMissionControlSetupModal({ persist: false });
              setMissionControlRunState({
                threadId: normalizedThreadId,
                projectId: runProjectId,
                status: "starting",
                error: "",
              });
              if (typeof onStatusIndicatorItemChange === "function") {
                onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                  projectId: runProjectId,
                  projectName: normalizedProject.name || "Project",
                  phase: "starting",
                }));
              }
              if (isProjectComposerRun && (projectComposerMode === "create" || !selectedProjectId)) {
                handleSelectProject(runProjectId);
              }
              if (onThreadStarted) {
                onThreadStarted(normalizedThreadId, {
                  threadRecord: launchedThreadRecord,
                  taskRunRequest: {
                    token: "mission-control:" + (runRequest?.token || Date.now().toString(36) + Math.random().toString(36).slice(2)),
                    prompt: missionControlPrompt,
                    displayPrompt: normalizedOperatorPrompt,
                    userPrompt: normalizedOperatorPrompt,
                    agentId: launchAgentId,
                    agentName: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
                    attachments: runAttachments,
                    githubRepo: projectGithubRepo || null,
                    enabledSkills: enabledSkillsPayload,
                    environmentId: launchEnvironmentId,
                    quotedSelection: runRequest?.quotedSelection || null,
                  },
                });
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to start Mission Control.";
              setMissionControlAgentError(errorMessage);
              setMissionControlSetupResetToken((current) => current + 1);
              setMissionControlRunState({
                threadId: normalizedThreadId,
                projectId: String(baseProjectRecord?.id || selectedProjectId || ""),
                status: "failed",
                error: errorMessage,
              });
            }
          })();

          return true;
        }

        async function syncMissionControlThreadResult(threadId, projectId) {
          const normalizedThreadId = String(threadId || "").trim();
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedThreadId || !normalizedProjectId) {
            return;
          }
          if (missionControlSyncThreadIdRef.current === normalizedThreadId) {
            return;
          }

	          missionControlSyncThreadIdRef.current = normalizedThreadId;
		          try {
		            const threadMessages = await fetchPlaygroundThreadMessages(normalizedThreadId);
		            const parsedMissionControl = await resolvePlaygroundMissionControlRecordFromMessages(threadMessages);
		            if (!String(parsedMissionControl.document || "").trim()) {
              setMissionControlRunState((current) => current.threadId === normalizedThreadId
                ? {
                    ...current,
                    status: "failed",
                    error: "Mission Control finished without a strategy document.",
                  }
                : current
		              );
		              return;
		            }
		            const hasParsedProjectRules = parsedMissionControl
		              && typeof parsedMissionControl === "object"
		              && !Array.isArray(parsedMissionControl)
		              && Object.prototype.hasOwnProperty.call(parsedMissionControl, "projectRules");
		            const parsedProjectRules = hasParsedProjectRules
		              ? String(parsedMissionControl.projectRules || "")
		              : "";
		            const shouldPersistParsedProjectRules = hasParsedProjectRules
		              && (parsedProjectRules.trim() || parsedMissionControl.projectRulesReplace === true);
		            const projectRuleOverrides = shouldPersistParsedProjectRules
		              ? {
		                  projectRules: parsedProjectRules,
		                }
		              : null;
		            await persistProjectMissionControlRecord(normalizedProjectId, {
	              ...selectedProjectMissionControl,
	              ...parsedMissionControl,
	              lastThreadId: normalizedThreadId,
	              updatedAt: new Date().toISOString(),
	            }, {
	              quiet: true,
	              ...(projectRuleOverrides
	                ? {
	                    projectOverrides: projectRuleOverrides,
	                    metadataOverrides: projectRuleOverrides,
	                  }
	                : {}),
	            });
            if (selectedProjectId === normalizedProjectId) {
              await loadProjectWorkspace(normalizedProjectId);
            }
            setMissionControlRunState((current) => current.threadId === normalizedThreadId
              ? {
                  threadId: "",
                  projectId: "",
                  status: "idle",
                  error: "",
                }
              : current
            );
          } catch (error) {
            setMissionControlRunState((current) => current.threadId === normalizedThreadId
              ? {
                  ...current,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Mission Control sync failed.",
                }
              : current
            );
          } finally {
            if (missionControlSyncThreadIdRef.current === normalizedThreadId) {
              missionControlSyncThreadIdRef.current = "";
            }
          }
        }

        function openBacklogSubtaskComposer(ticketNumber) {
          const normalizedTicketNumber = normalizePlaygroundTaskTicketNumber(ticketNumber);
          if (!normalizedTicketNumber || !selectedProjectId) {
            return;
          }
          setTaskView("backlog");
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setMissionControlStrategyOpen(false);
          setBacklogComposerSubtaskCommandRequest({
            ticketNumber: normalizedTicketNumber,
            label: "Subtask to " + normalizedTicketNumber,
            token: Date.now(),
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
