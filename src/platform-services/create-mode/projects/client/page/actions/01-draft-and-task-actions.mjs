export const PROJECTS_ACTIONS_01_FRAGMENT = `        function updateDraftTask(updater, options = {}) {
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

        function selectTaskDetailStatus(nextStatus) {
          const normalizedStatus = String(nextStatus || "").trim().toLowerCase();
          if (!PLAYGROUND_TASK_MANUAL_STATUS_OPTIONS.some((option) => option.id === normalizedStatus)) {
            return;
          }
          updateDraftTask((current) => ({
            ...current,
            status: normalizedStatus,
            dependencyIds: [],
            completedAt: isPlaygroundTaskTerminalStatus(normalizedStatus)
              ? (current.completedAt || new Date().toISOString())
              : null,
          }), { autosave: true });
          setTaskDetailStatusSearchQuery("");
          setTaskDetailSelectPopover("");
        }

        function selectTaskDetailPriority(nextPriority) {
          const normalizedPriority = String(nextPriority || "").trim().toLowerCase();
          if (!PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === normalizedPriority)) {
            return;
          }
          updateDraftField("priority", normalizedPriority, { autosave: true });
          setTaskDetailPrioritySearchQuery("");
          setTaskDetailSelectPopover("");
        }

        function getTaskDescriptionChangeUploadedAttachments(context) {
          return normalizePlaygroundTaskAttachmentList(
            (Array.isArray(context?.uploadedFiles) ? context.uploadedFiles : [])
              .map((file) => file?.metadata?.taskAttachment)
              .filter(Boolean)
          );
        }

        function reconcileTaskDescriptionDraftRecord(taskRecord, nextDescription, context = {}) {
          const currentAttachments = normalizePlaygroundTaskAttachmentList(taskRecord?.attachments);
          const uploadedAttachments = getTaskDescriptionChangeUploadedAttachments(context);
          const candidateAttachments = normalizePlaygroundTaskAttachmentList(
            currentAttachments.concat(uploadedAttachments)
          );
          const nextAttachments = reconcileTaskDescriptionAttachments(
            String(nextDescription || ""),
            candidateAttachments
          );
          const retainedAttachmentIds = new Set(nextAttachments.map((attachment) => attachment.id));
          const removedAttachments = currentAttachments.filter((attachment) =>
            !retainedAttachmentIds.has(attachment.id)
          );
          const nextConnectors = removedAttachments.reduce(
            (connectors, attachment) => removePlaygroundAttachmentFromConnectorSelections(connectors, attachment),
            taskRecord?.connectors
          );
          return {
            ...taskRecord,
            description: String(nextDescription || ""),
            attachments: nextAttachments,
            connectors: nextConnectors,
          };
        }

        function handleTaskDescriptionEditorChange(nextValue, context = {}) {
          const previousAttachments = normalizePlaygroundTaskAttachmentList(draftTask?.attachments);
          const nextTask = updateDraftTask(
            (current) => reconcileTaskDescriptionDraftRecord(current, nextValue, context),
            { autosave: context?.source === "file-upload" || context?.source === "image-upload" }
          );
          const retainedAttachmentIds = new Set(
            normalizePlaygroundTaskAttachmentList(nextTask?.attachments).map((attachment) => attachment.id)
          );
          revokeTaskAttachmentListObjectUrls(
            previousAttachments.filter((attachment) => !retainedAttachmentIds.has(attachment.id))
          );
        }

        function handleIssueComposerDescriptionEditorChange(nextValue, context = {}) {
          updateIssueComposerDraft((current) =>
            reconcileTaskDescriptionDraftRecord(current, nextValue, context)
          );
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
            resetSaveState("Task moved to Todo");
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
            resetSaveState("Task moved to In Progress");
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
                ? "Task moved to Done"
                : normalizedTargetStatus === "blocked"
                  ? "Task moved to Blocked"
                  : normalizedTargetStatus === "in_review"
                    ? "Task moved to In Review"
                    : normalizedTargetStatus === "in_progress"
                      ? "Task moved to In Progress"
                      : "Task moved to Todo"
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

        function getTaskWorkspaceMemberByUserId(userId) {
          const normalizedUserId = String(userId || "").trim();
          if (!normalizedUserId || !Array.isArray(workspaceTeamMembers)) {
            return null;
          }
          return workspaceTeamMembers.find((member) => {
            const memberUser = member?.user && typeof member.user === "object" ? member.user : {};
            const memberProfile = member?.profile && typeof member.profile === "object" ? member.profile : {};
            return [member?.userId, member?.uid, member?.accountId, memberUser.id, memberUser.userId, memberUser.uid, memberProfile.id, memberProfile.userId, memberProfile.uid]
              .some((value) => String(value || "").trim() === normalizedUserId);
          }) || null;
        }

        function getTaskCommentWorkspaceMember(comment) {
          return getTaskWorkspaceMemberByUserId(comment?.authorUserId);
        }

        function readTaskCommentMemberIdentityValue(member, keys) {
          const metadata = member?.metadata && typeof member.metadata === "object" ? member.metadata : {};
          const sources = [member, member?.user, member?.profile, member?.account, member?.identity, metadata, metadata.user, metadata.profile]
            .filter((value) => value && typeof value === "object" && !Array.isArray(value));
          for (const source of sources) {
            for (const key of keys) {
              const value = source[key];
              if (typeof value === "string" && value.trim()) {
                return value.trim();
              }
            }
          }
          return "";
        }

        function isTaskCommentByCurrentUser(comment) {
          const authorUserId = String(comment?.authorUserId || "").trim();
          return Boolean(authorUserId && currentUserId && authorUserId === String(currentUserId).trim());
        }

        function getTaskCommentDisplayName(comment) {
          if (comment?.authorType === "agent" || comment?.authorAgentId) {
            const authorAgent = comment?.authorAgentId
              ? agentsById[comment.authorAgentId] || assignableActorsById[comment.authorAgentId] || null
              : null;
            return String(authorAgent?.name || comment?.authorName || "Agent").trim() || "Agent";
          }
          if (comment?.authorType === "system") {
            return String(comment?.authorName || "System").trim() || "System";
          }
          if (isTaskCommentByCurrentUser(comment)) {
            return String(currentUserName || comment?.authorName || "Me").trim() || "Me";
          }
          const workspaceMember = getTaskCommentWorkspaceMember(comment);
          return readTaskCommentMemberIdentityValue(workspaceMember, ["displayName", "display_name", "name", "fullName", "full_name"])
            || String(comment?.authorName || "User").trim()
            || "User";
        }

        function getTaskCommentAvatarLetter(name) {
          const initials = getAccountInitials(name || "Computer Agents");
          return (initials.charAt(0) || "C").toUpperCase();
        }

        function renderTaskCommentAvatar(comment, className) {
          const authorName = getTaskCommentDisplayName(comment);
          const authorAgent = comment?.authorAgentId
            ? agentsById[comment.authorAgentId] || assignableActorsById[comment.authorAgentId] || null
            : null;
          const workspaceMember = getTaskCommentWorkspaceMember(comment);
          const memberPhotoUrl = readTaskCommentMemberIdentityValue(workspaceMember, [
            "photoURL",
            "photoUrl",
            "photo_url",
            "avatarURL",
            "avatarUrl",
            "avatar_url",
            "avatar",
            "picture",
            "imageUrl",
            "image_url",
          ]);
          const normalizedPhotoUrl = normalizeSessionPhotoUrl(
            authorAgent
              ? getPlaygroundAgentRunnerPhotoUrl(authorAgent)
              : isTaskCommentByCurrentUser(comment) && canRenderAvatarImage(currentUserAvatarUrl)
                ? currentUserAvatarUrl
                : memberPhotoUrl || comment?.authorAvatarUrl || ""
          );
          const avatarLetter = getTaskCommentAvatarLetter(authorName);
          return React.createElement(AccountAvatar, {
            className,
            imageClassName: className + "-image",
            fallbackLabel: avatarLetter,
            photoUrl: normalizedPhotoUrl,
          });
        }

        function getTaskCreatorIdentity(task) {
          const creator = task?.creator && typeof task.creator === "object" ? task.creator : {};
          const creatorAgentId = String(creator.agentId || task?.creatorAgentId || task?.createdByAgentId || "").trim();
          const creatorUserId = String(creator.userId || task?.createdByUserId || task?.userId || "").trim();
          if (creatorAgentId) {
            const creatorAgent = agentsById[creatorAgentId] || assignableActorsById[creatorAgentId] || null;
            return {
              type: "agent",
              name: String(creatorAgent?.name || creator.name || "Agent").trim() || "Agent",
              photoUrl: normalizeSessionPhotoUrl(
                creatorAgent
                  ? getPlaygroundAgentProfilePhotoUrl(creatorAgent)
                  : creator.avatarUrl || ""
              ),
            };
          }

          const isCurrentUser = Boolean(
            creatorUserId
            && currentUserId
            && creatorUserId === String(currentUserId).trim()
          );
          const workspaceMember = getTaskWorkspaceMemberByUserId(creatorUserId);
          const memberName = readTaskCommentMemberIdentityValue(workspaceMember, [
            "displayName",
            "display_name",
            "name",
            "fullName",
            "full_name",
          ]);
          const memberPhotoUrl = readTaskCommentMemberIdentityValue(workspaceMember, [
            "photoURL",
            "photoUrl",
            "photo_url",
            "avatarURL",
            "avatarUrl",
            "avatar_url",
            "avatar",
            "picture",
            "imageUrl",
            "image_url",
          ]);
          return {
            type: "user",
            name: isCurrentUser
              ? String(currentUserName || creator.name || "User").trim() || "User"
              : memberName || String(creator.name || "User").trim() || "User",
            photoUrl: normalizeSessionPhotoUrl(
              isCurrentUser && canRenderAvatarImage(currentUserAvatarUrl)
                ? currentUserAvatarUrl
                : memberPhotoUrl || creator.avatarUrl || ""
            ),
          };
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

        function openTaskCommentComposer(options = {}) {
          setTaskCommentMode(options?.review === true ? "review" : "");
          setTaskCommentComposerOpen(true);
        }

        function closeTaskCommentComposer() {
          if (saveState.isSaving) {
            return;
          }
          setTaskCommentComposerOpen(false);
          setTaskCommentMode("");
        }

        function activateTaskReviewCommentMode() {
          openTaskCommentComposer({ review: true });
        }

        async function handleAddTaskComment(options = {}) {
          if (!draftTask?.id) {
            return;
          }
          const inline = options?.inline === true;
          const parentCommentId = String(options?.parentCommentId || "").trim();
          const isReply = Boolean(parentCommentId);
          const submittedFiles = normalizeTaskAttachmentUploadFiles(options?.files);
          const submittedBody = typeof options?.body === "string" ? options.body : taskCommentInputValue;
          const commentSubmission = isReply
            ? {
                body: String(submittedBody || "").replaceAll(String.fromCharCode(13), "").trim(),
                isReview: false,
              }
            : getTaskCommentSubmissionDraft(submittedBody);
          const nextCommentBody = commentSubmission.body;
          if (!nextCommentBody) {
            return;
          }

          if (inline && !isReply) {
            setTaskActivityCommentPending(true);
            setTaskActivityCommentError("");
          } else if (!isReply) {
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
          }

          try {
            const uploadedCommentAttachments = submittedFiles.length
              ? await uploadTaskAttachmentFiles(submittedFiles, {
                  environmentId: activeTaskEnvironmentId,
                  allowWithoutEnvironment: true,
                })
              : [];
            const commentAttachments = normalizePlaygroundTaskAttachmentList(
              uploadedCommentAttachments
            ).map((attachment) => ({
              id: attachment.id,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              type: attachment.type,
              size: attachment.size,
              uploadedAt: attachment.uploadedAt,
              url: attachment.url,
              environmentId: attachment.environmentId,
              sourcePath: attachment.sourcePath,
              workspacePath: attachment.workspacePath,
              gcsPath: attachment.gcsPath,
            }));
            const commentMetadata = {
              ...(currentUserAvatarUrl ? { authorAvatarUrl: currentUserAvatarUrl } : {}),
              ...(parentCommentId ? { parentCommentId } : {}),
              ...(commentAttachments.length ? { attachments: commentAttachments } : {}),
            };
            const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(draftTask.id) + "/comments", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                body: nextCommentBody,
                parentCommentId: parentCommentId || undefined,
                authorType: "user",
                authorName: currentUserName || undefined,
                metadata: Object.keys(commentMetadata).length ? commentMetadata : undefined,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to add comment.");
            }

            const createdCommentResponse = getPlaygroundTaskCommentResponseRecord(data);
            const createdComment = createdCommentResponse && parentCommentId && !createdCommentResponse.parentCommentId
              ? {
                  ...createdCommentResponse,
                  parentCommentId,
                }
              : createdCommentResponse;
            const createdActivityEvents = normalizePlaygroundTaskActivityList(data?.activityEvents);
            let nextTaskRecord = null;
            if (createdComment) {
              const nextComments = normalizePlaygroundTaskCommentList((draftTask.comments || []).concat(createdComment));
              nextTaskRecord = applyRefreshedTaskDetails({
                ...normalizePlaygroundTaskRecord(draftTask),
                comments: nextComments,
                activity: normalizePlaygroundTaskActivityList([
                  ...(Array.isArray(draftTask.activity) ? draftTask.activity : []),
                  ...createdActivityEvents,
                  {
                    id: "task_activity_comment_" + createdComment.id,
                    eventType: "comment_added",
                    sourceId: createdComment.id,
                    actorType: createdComment.authorType || "user",
                    actorUserId: createdComment.authorUserId,
                    actorAgentId: createdComment.authorAgentId,
                    actorName: createdComment.authorName,
                    actorAvatarUrl: createdComment.authorAvatarUrl,
                    commentId: createdComment.id,
                    comment: createdComment,
                    createdAt: createdComment.createdAt,
                  },
                ]),
              });
            } else {
              await loadTaskDetails(draftTask.id);
            }

            if (inline && !isReply) {
              setTaskActivityCommentValue("");
              setTaskActivityCommentPending(false);
              setTaskActivityCommentError("");
            } else if (!isReply) {
              setTaskCommentInputValue("");
              setTaskCommentMode("");
              setTaskCommentComposerOpen(false);
            }
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
            } else if (!inline && !isReply) {
              resetSaveState("Comment added");
            }
            return createdComment;
          } catch (error) {
            if (isReply) {
              throw error;
            }
            if (inline) {
              setTaskActivityCommentPending(false);
              setTaskActivityCommentError(error instanceof Error ? error.message : "Failed to add comment.");
            } else {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to add comment.",
                message: "",
              });
            }
          }
        }

        function applyTaskCommentMutation(savedTaskRecord, comments, activity) {
          const normalizedComments = normalizePlaygroundTaskCommentList(comments);
          const normalizedActivity = normalizePlaygroundTaskActivityList(activity);
          const normalizedSavedTask = normalizePlaygroundTaskRecord({
            ...savedTaskRecord,
            comments: normalizedComments,
            activity: normalizedActivity,
          });
          const isSelectedTask = selectedTaskIdRef.current === normalizedSavedTask.id;
          const shouldPreserveDirtyDraft = isSelectedTask && editorDirtyRef.current;

          commitLocalTaskRecord(normalizedSavedTask, {
            selectTask: isSelectedTask,
            syncDraft: isSelectedTask && !shouldPreserveDirtyDraft,
            markClean: !shouldPreserveDirtyDraft,
          });

          if (shouldPreserveDirtyDraft) {
            setDraftTask((current) => {
              if (!current || current.id !== normalizedSavedTask.id) {
                return current;
              }
              return normalizePlaygroundTaskRecord({
                ...current,
                comments: normalizedComments,
                activity: normalizedActivity,
                updatedAt: normalizedSavedTask.updatedAt,
              });
            });
          }

          return normalizedSavedTask;
        }

        async function handleEditTaskComment(commentId, nextText) {
          const normalizedCommentId = String(commentId || "").trim();
          const normalizedText = String(nextText || "")
            .replaceAll(String.fromCharCode(13), "")
            .trim();
          if (!draftTask?.id || !normalizedCommentId || !normalizedText) {
            throw new Error("Comment is unavailable.");
          }

          const comments = normalizePlaygroundTaskCommentList(draftTask.comments);
          const existingComment = comments.find((comment) => comment.id === normalizedCommentId);
          if (!existingComment || !isTaskCommentByCurrentUser(existingComment)) {
            throw new Error("You can only edit your own comments.");
          }

          const updatedComment = normalizePlaygroundTaskCommentRecord({
            ...existingComment,
            text: normalizedText,
            metadata: {
              ...(existingComment.metadata || {}),
              editedAt: new Date().toISOString(),
            },
          });
          if (!updatedComment) {
            throw new Error("Comment is unavailable.");
          }

          const nextComments = comments.map((comment) =>
            comment.id === normalizedCommentId ? updatedComment : comment
          );
          const nextActivity = normalizePlaygroundTaskActivityList(
            (Array.isArray(draftTask.activity) ? draftTask.activity : []).map((event) => {
              const eventCommentId = String(
                event.commentId || (event.eventType === "comment_added" ? event.sourceId : "")
              ).trim();
              return eventCommentId === normalizedCommentId
                ? {
                    ...event,
                    commentId: normalizedCommentId,
                    comment: updatedComment,
                  }
                : event;
            })
          );
          const savedTask = await patchTaskRecord(draftTask, {
            comments: nextComments,
            activity: nextActivity,
          });
          return applyTaskCommentMutation(savedTask, nextComments, nextActivity);
        }

        async function handleDeleteTaskComment(commentId) {
          const normalizedCommentId = String(commentId || "").trim();
          if (!draftTask?.id || !normalizedCommentId) {
            throw new Error("Comment is unavailable.");
          }

          const comments = normalizePlaygroundTaskCommentList(draftTask.comments);
          const existingComment = comments.find((comment) => comment.id === normalizedCommentId);
          if (!existingComment || !isTaskCommentByCurrentUser(existingComment)) {
            throw new Error("You can only delete your own comments.");
          }

          const removedCommentIds = new Set([normalizedCommentId]);
          let foundNestedReply = true;
          while (foundNestedReply) {
            foundNestedReply = false;
            comments.forEach((comment) => {
              if (
                comment.parentCommentId
                && removedCommentIds.has(comment.parentCommentId)
                && !removedCommentIds.has(comment.id)
              ) {
                removedCommentIds.add(comment.id);
                foundNestedReply = true;
              }
            });
          }

          const nextComments = comments.filter((comment) => !removedCommentIds.has(comment.id));
          const nextActivity = normalizePlaygroundTaskActivityList(
            (Array.isArray(draftTask.activity) ? draftTask.activity : []).filter((event) => {
              if (event.eventType !== "comment_added") {
                return true;
              }
              const eventCommentId = String(event.commentId || event.sourceId || "").trim();
              return !removedCommentIds.has(eventCommentId);
            })
          );
          const savedTask = await patchTaskRecord(draftTask, {
            comments: nextComments,
            activity: nextActivity,
          });
          return applyTaskCommentMutation(savedTask, nextComments, nextActivity);
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

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.comments}
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

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.skills}
\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.scheduleDialog}
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

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.parentPicker}
        function handleTaskTypeSelection(nextType) {
          const normalizedType = normalizePlaygroundTaskType(nextType);
          if (!draftTask?.id) {
            return;
          }
          setTaskDetailTypeSearchQuery("");
          setTaskDetailSelectPopover("");
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

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.taskType}
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

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.parentSelection}
        function commitDraftTaskIfDirty() {
          if (!editorDirtyRef.current || !draftTask?.id || !selectedProjectId) {
            return;
          }
          queueTaskAutosave(draftTask);
        }

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.draftUpdates}
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
          selectedTaskIdRef.current = normalizedTaskId;
          setSelectedTaskId(normalizedTaskId);
        }

        function openProjectTaskDetailScreen(taskId) {
          handleSelectTask(taskId, { screen: true });
        }

\${CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.taskNavigation}
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

          if (target.closest(".playground-tasks-card, .playground-tasks-backlog-item, .playground-tasks-backlog-composer-shell, .playground-tasks-lane-card, .playground-tasks-calendar-entry, .playground-tasks-ticket-screen, .playground-tasks-detail-panel, .playground-tasks-detail-shell, .playground-files-toolbar-anchor, .playground-files-control-button, .playground-files-toolbar-menu, .tb-runner-chat, .tb-popup-menu, .tb-selection-popup, .tb-file-browser-scrim, .tb-popup-modal-scrim, .platform-modal-backdrop, .playground-tasks-confirm-scrim, .playground-tasks-parent-picker-scrim")) {
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
          const incomingTask = normalizePlaygroundTaskRecord(taskRecord);
          const existingTask = draftTask?.id === incomingTask.id
            ? draftTask
            : tasks.find((task) => task.id === incomingTask.id);
          const normalized = normalizePlaygroundTaskRecord({
            ...incomingTask,
            activity: normalizePlaygroundTaskActivityList([
              ...(Array.isArray(existingTask?.activity) ? existingTask.activity : []),
              ...(Array.isArray(incomingTask.activity) ? incomingTask.activity : []),
            ]),
          });
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
                activity: normalizePlaygroundTaskActivityList([
                  ...(Array.isArray(current.activity) ? current.activity : []),
                  ...(Array.isArray(normalized.activity) ? normalized.activity : []),
                ]),
                linkedThreadIds: normalized.linkedThreadIds,
                lastStartedThreadId: normalized.lastStartedThreadId,
`;
