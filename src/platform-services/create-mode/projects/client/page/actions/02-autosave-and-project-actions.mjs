export const PROJECTS_ACTIONS_02_FRAGMENT = `                status: normalized.status,
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
	            loop: mergedTask.loop,
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
            ...(Object.prototype.hasOwnProperty.call(overrides, "comments")
              ? { comments: mergedTask.comments }
              : {}),
            ...(Object.prototype.hasOwnProperty.call(overrides, "activity")
              ? { activity: mergedTask.activity }
              : {}),
          });
          const nextAssigneeAgentId = isPlaygroundHumanAssigneeId(mergedTask.assigneeAgentId)
            ? null
            : mergedTask.assigneeAgentId;

          return {
            projectId: mergedTask.projectId || selectedProjectId,
            releaseId: mergedTask.releaseId,
            ticketNumber: mergedTask.ticketNumber,
            type: mergedTask.taskType,
            loop: mergedTask.taskType === "loop" ? mergedTask.loop : null,
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
          let nextLoop = null;
          if (nextTaskType === "loop") {
            const loopGoalMarkdown = String(issueComposerDraft?.description || "");
            const parsedLoopGoal = parsePlaygroundTaskLoopGoalMarkdown(loopGoalMarkdown);
            nextLoop = normalizePlaygroundTaskLoopConfig(
              {
                ...normalizePlaygroundTaskLoopConfig(issueComposerDraft?.loop, issueComposerDraft),
                ...parsedLoopGoal,
              },
              { ...issueComposerDraft, title: nextTitle },
            );
            if (
              isPlaygroundTaskLoopGoalTemplatePristine(loopGoalMarkdown)
              || hasPlaygroundTaskLoopGoalTemplateExamples(loopGoalMarkdown)
              || !parsedLoopGoal.goal
              || !parsedLoopGoal.successCriteria
              || !parsedLoopGoal.progressSignal
              || !parsedLoopGoal.verificationCriteria
              || !nextLoop.goal
              || !nextLoop.successCriteria
              || !nextLoop.progressSignal
              || !nextLoop.verificationCriteria
            ) {
              setIssueComposerSaveState({
                isSaving: false,
                error: "Replace each Loop Goal example with the goal, success criteria, progress signal, and verification method.",
              });
              return;
            }
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
            loop: nextTaskType === "loop" ? nextLoop : null,
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

            const shouldKeepParentTaskSelected = nextTaskType === "subtask" && Boolean(nextParentTaskId);
            commitLocalTaskRecord(createdTask, {
              selectTask: !shouldKeepParentTaskSelected,
              syncDraft: !shouldKeepParentTaskSelected,
              markClean: !shouldKeepParentTaskSelected,
            });
            if (shouldKeepParentTaskSelected) {
              handleSelectTask(nextParentTaskId, { screen: true });
            } else {
              setTaskView("backlog");
              setProjectTaskDetailScreenOpen(true);
            }
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

          return normalizePlaygroundTaskRecord({
            ...savedTask,
            comments: Object.prototype.hasOwnProperty.call(overrides, "comments")
              ? savedTask.comments
              : Array.isArray(savedTask.comments) && savedTask.comments.length > 0
                ? savedTask.comments
                : resolvedTask.comments,
            activity: Object.prototype.hasOwnProperty.call(overrides, "activity")
              ? normalizePlaygroundTaskActivityList(savedTask.activity)
              : normalizePlaygroundTaskActivityList([
                  ...(Array.isArray(resolvedTask.activity) ? resolvedTask.activity : []),
                  ...(Array.isArray(savedTask.activity) ? savedTask.activity : []),
                ]),
          });
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
            const projectCreatorEmail = String(currentUserEmail || "").trim();
            const projectCreatorEmailName = projectCreatorEmail
              ? projectCreatorEmail
                  .split("@")[0]
                  .replace(/[._-]+/g, " ")
                  .replace(/\b\w/g, (character) => character.toUpperCase())
              : "";
            const projectCreatorName = typeof formatAccountDisplayName === "function"
              ? formatAccountDisplayName(
                  currentUserName,
                  projectCreatorEmail,
                  projectCreatorEmailName || "Project member"
                )
              : String(
                  currentUserName
                    || projectCreatorEmailName
                    || "Project member"
                ).trim();
            const projectCreationTimestamp = new Date().toISOString();
            const projectCreationUpdate = isEditMode
              ? null
              : {
                  id: "project_update_creation_" + Date.now().toString(36)
                    + Math.random().toString(36).slice(2, 10),
                  body: projectCreatorName + " created this project.",
                  status: "on_track",
                  kind: "project_created",
                  attachments: [],
                  comments: [],
                  reactions: [],
                  createdAt: projectCreationTimestamp,
                  updatedAt: projectCreationTimestamp,
                  authorUserId: String(currentUserId || "").trim(),
                  authorName: projectCreatorName,
                  authorEmail: projectCreatorEmail,
                  authorAvatarUrl: String(currentUserAvatarUrl || "").trim(),
                };
            const projectCreationMetadata = projectCreationUpdate
              ? {
                  createdByUserId: projectCreationUpdate.authorUserId,
                  createdByName: projectCreationUpdate.authorName,
                  createdByEmail: projectCreationUpdate.authorEmail,
                  createdByAvatarUrl: projectCreationUpdate.authorAvatarUrl,
                  createdBy: {
                    userId: projectCreationUpdate.authorUserId,
                    name: projectCreationUpdate.authorName,
                    email: projectCreationUpdate.authorEmail,
                    avatarUrl: projectCreationUpdate.authorAvatarUrl,
                  },
                  projectUpdates: [projectCreationUpdate],
                  latestUpdate: projectCreationUpdate,
                }
              : {};
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
            const projectDraftOwner = projectDraftMetadata.owner && typeof projectDraftMetadata.owner === "object" && !Array.isArray(projectDraftMetadata.owner)
              ? projectDraftMetadata.owner
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
	            const nextOwnerUserId = String(projectDraft.ownerUserId || projectDraftMetadata.ownerUserId || projectDraftOwner.userId || projectDraftOwner.id || nextLeadUserId || currentUserId || "").trim();
	            const nextOwnerName = String(projectDraft.ownerName || projectDraftMetadata.ownerName || projectDraftOwner.name || nextLeadName || currentUserName || "Project owner").trim();
	            const nextOwnerEmail = String(projectDraft.ownerEmail || projectDraftMetadata.ownerEmail || projectDraftOwner.email || nextLeadEmail || currentUserEmail || "").trim();
	            const nextOwnerAvatarUrl = String(projectDraft.ownerAvatarUrl || projectDraftMetadata.ownerAvatarUrl || projectDraftOwner.avatarUrl || projectDraftOwner.photoUrl || nextLeadAvatarUrl || "").trim();
	            const nextOwner = {
	              userId: nextOwnerUserId,
	              name: nextOwnerName,
	              email: nextOwnerEmail,
	              avatarUrl: nextOwnerAvatarUrl,
	            };
	            const normalizedProjectStatus = normalizePlaygroundProjectStatus(projectDraft.status || projectDraftMetadata.status || "backlog");
	            const normalizedProjectPriority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === String(projectDraft.priority || projectDraftMetadata.priority || "").trim().toLowerCase())
	              ? String(projectDraft.priority || projectDraftMetadata.priority || "").trim().toLowerCase()
	              : "medium";
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
                status: normalizedProjectStatus,
                priority: normalizedProjectPriority,
                defaultEnvironmentId: projectDraft.defaultEnvironmentId || undefined,
                ownerUserId: nextOwnerUserId || undefined,
                ownerName: nextOwnerName || undefined,
	                ownerEmail: nextOwnerEmail || undefined,
	                ownerAvatarUrl: nextOwnerAvatarUrl || undefined,
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
                  status: normalizedProjectStatus,
                  priority: normalizedProjectPriority,
                  ownerUserId: nextOwnerUserId,
                  ownerName: nextOwnerName,
                  ownerEmail: nextOwnerEmail,
                  ownerAvatarUrl: nextOwnerAvatarUrl,
                  owner: nextOwner,
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
                  ...projectCreationMetadata,
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
              status: normalizedProjectStatus,
              priority: normalizedProjectPriority,
              wallpaperId: nextWallpaperId,
              useCardBackgroundAsWallpaper: nextUseCardBackgroundAsWallpaper,
              ownerUserId: nextOwnerUserId,
	              ownerName: nextOwnerName,
	              ownerEmail: nextOwnerEmail,
	              ownerAvatarUrl: nextOwnerAvatarUrl,
	              owner: nextOwner,
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
                  status: normalizedProjectStatus,
                  priority: normalizedProjectPriority,
                  ownerUserId: nextOwnerUserId,
                  ownerName: nextOwnerName,
                  ownerEmail: nextOwnerEmail,
                  ownerAvatarUrl: nextOwnerAvatarUrl,
                  owner: nextOwner,
                  leadUserId: nextLeadUserId,
                  leadName: nextLeadName,
                  leadEmail: nextLeadEmail,
                  leadAvatarUrl: nextLeadAvatarUrl,
	                lead: nextLead,
		                projectRules: String(projectDraft.projectRules || ""),
		                permissionSet: normalizedProjectPermissionSet,
                    ...projectCreationMetadata,
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
            let committedProject = commitLocalProjectRecord({
              ...savedProject,
              projectType: projectBlueprint.id,
              type: projectBlueprint.id,
              name: nextName,
              status: normalizedProjectStatus,
              priority: normalizedProjectPriority,
              ownerUserId: nextOwnerUserId,
              ownerName: nextOwnerName,
              ownerEmail: nextOwnerEmail,
              ownerAvatarUrl: nextOwnerAvatarUrl,
              owner: nextOwner,
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
                    status: normalizedProjectStatus,
                    priority: normalizedProjectPriority,
                    ownerUserId: nextOwnerUserId,
                    ownerName: nextOwnerName,
                    ownerEmail: nextOwnerEmail,
                    ownerAvatarUrl: nextOwnerAvatarUrl,
                    owner: nextOwner,
                    leadUserId: nextLeadUserId,
                    leadName: nextLeadName,
                    leadEmail: nextLeadEmail,
                    leadAvatarUrl: nextLeadAvatarUrl,
                    lead: nextLead,
		                projectRules: committedProjectRules,
                    ...projectCreationMetadata,
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
              try {
                const knowledgeResource = await ensurePlaygroundProjectKnowledgeResource(committedProject, {
                  attempts: 3,
                  returnProject: true,
                });
                if (knowledgeResource?.project?.id) {
                  committedProject = commitLocalProjectRecord(knowledgeResource.project, {
                    summary: knowledgeResource.project.summary || committedProject.summary,
                    environments: savedProjectEnvironments,
                    recentThreads: [],
                    threads: [],
                    selectImmediately: false,
                  });
                }
              } catch (error) {
                // The project is already durable. Keep creation usable and let
                // selected-project reconciliation retry this idempotent link.
                console.warn("[project knowledge] Failed to attach the Strategy Knowledge resource during project creation.", error);
              }
              await applyPlaygroundProjectInitialSetup(committedProject, projectBlueprint, savedProjectEnvironments);
              const persistedOwnerUserId = String(
                savedProject.ownerUserId
                  || savedProject.userId
                  || savedProject.metadata?.ownerUserId
                  || savedProject.metadata?.owner?.userId
                  || currentUserId
                  || ""
              ).trim();
              if (nextOwnerUserId && nextOwnerUserId !== persistedOwnerUserId) {
                const transferResponse = await fetch(
                  backendUrl + "/projects/" + encodeURIComponent(committedProject.id) + "/owner",
                  {
                    method: "PATCH",
                    headers: {
                      ...requestHeaders,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ownerUserId: nextOwnerUserId }),
                  }
                );
                const transferData = await transferResponse.json().catch(() => ({}));
                if (!transferResponse.ok) {
                  throw new Error(transferData?.message || transferData?.error || "The project was created, but its owner could not be assigned.");
                }
                const transferredProject = getPlaygroundProjectResponseRecord(transferData, {
                  ...committedProject,
                  ownerUserId: nextOwnerUserId,
                  ownerName: nextOwnerName,
                  ownerEmail: nextOwnerEmail,
                  ownerAvatarUrl: nextOwnerAvatarUrl,
                  owner: nextOwner,
                  metadata: {
                    ...(committedProject.metadata && typeof committedProject.metadata === "object" ? committedProject.metadata : {}),
                    ownerUserId: nextOwnerUserId,
                    ownerName: nextOwnerName,
                    ownerEmail: nextOwnerEmail,
                    ownerAvatarUrl: nextOwnerAvatarUrl,
                    owner: nextOwner,
                  },
                });
                committedProject = commitLocalProjectRecord(transferredProject || committedProject, {
                  summary: transferredProject?.summary || committedProject.summary,
                  environments: savedProjectEnvironments,
                  recentThreads: [],
                  threads: [],
                  selectImmediately: false,
                });
              }
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
                status: normalizedProjectStatus,
                priority: normalizedProjectPriority,
                ownerUserId: nextOwnerUserId,
                ownerName: nextOwnerName,
                ownerEmail: nextOwnerEmail,
                ownerAvatarUrl: nextOwnerAvatarUrl,
                owner: nextOwner,
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
                    status: normalizedProjectStatus,
                    priority: normalizedProjectPriority,
                    ownerUserId: nextOwnerUserId,
                    ownerName: nextOwnerName,
                    ownerEmail: nextOwnerEmail,
                    ownerAvatarUrl: nextOwnerAvatarUrl,
                    owner: nextOwner,
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

        function getActiveProjectOverviewRecord() {
          const normalizedProjectId = String(selectedProjectId || selectedProject?.id || "").trim();
          if (
            normalizedProjectId
            && projectDraft?.id
            && String(projectDraft.id).trim() === normalizedProjectId
          ) {
            return normalizePlaygroundProjectRecord(projectDraft);
          }
          return normalizePlaygroundProjectRecord(selectedProject);
        }

        function commitProjectOverviewSidebarProjectRecord(projectRecord) {
          if (!projectRecord?.id || typeof commitLocalProjectRecord !== "function") {
            return;
          }
          const normalizedProjectRecord = normalizePlaygroundProjectRecord(projectRecord);
          if (typeof setProjectDraft === "function") {
            setProjectDraft((current) => {
              if (!current || String(current.id || "") !== String(normalizedProjectRecord.id || "")) {
                return current;
              }
              return normalizePlaygroundProjectRecord({
                ...current,
                ...normalizedProjectRecord,
                metadata: {
                  ...(current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                    ? current.metadata
                    : {}),
                  ...(normalizedProjectRecord.metadata && typeof normalizedProjectRecord.metadata === "object" && !Array.isArray(normalizedProjectRecord.metadata)
                    ? normalizedProjectRecord.metadata
                    : {}),
                },
              });
            });
          }
          commitLocalProjectRecord(normalizedProjectRecord, {
            summary: normalizedProjectRecord.summary || selectedProjectSummary,
            environments: selectedProjectEnvironments,
            recentThreads: selectedProjectRecentThreads,
            threads: selectedProjectRecentThreads,
            selectImmediately: true,
          });
        }

        async function persistProjectOverviewSidebarProjectUpdate(projectUpdates = {}, metadataUpdates = {}, options = {}) {
          const baseProject = getActiveProjectOverviewRecord();
          const normalizedProjectId = String(baseProject.id || selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return null;
          }
          const baseMetadata = baseProject?.metadata && typeof baseProject.metadata === "object" && !Array.isArray(baseProject.metadata)
            ? baseProject.metadata
            : {};
          const nextMetadata = {
            ...baseMetadata,
            ...(metadataUpdates && typeof metadataUpdates === "object" ? metadataUpdates : {}),
          };
          const nextProjectRecord = normalizePlaygroundProjectRecord({
            ...baseProject,
            ...(projectUpdates && typeof projectUpdates === "object" ? projectUpdates : {}),
            metadata: nextMetadata,
            updatedAt: new Date().toISOString(),
          });
          commitProjectOverviewSidebarProjectRecord(nextProjectRecord);
          if (typeof setProjectSaveState === "function") {
            setProjectSaveState({ isSaving: true, error: "", message: "" });
          }
          try {
            const payload = {
              ...buildPlaygroundProjectSavePayload(nextProjectRecord, metadataUpdates),
              ...(options.requestPayload && typeof options.requestPayload === "object"
                ? options.requestPayload
                : {}),
            };
            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
              method: "PATCH",
              headers,
              body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update project.");
            }
            const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
            const reconciledProject = normalizePlaygroundProjectRecord({
              ...(updatedProject || nextProjectRecord),
              ...(projectUpdates && typeof projectUpdates === "object" ? projectUpdates : {}),
              metadata: {
                ...(updatedProject?.metadata && typeof updatedProject.metadata === "object" && !Array.isArray(updatedProject.metadata)
                  ? updatedProject.metadata
                  : nextMetadata),
                ...(metadataUpdates && typeof metadataUpdates === "object" ? metadataUpdates : {}),
              },
            });
            if (reconciledProject?.id) {
              commitProjectOverviewSidebarProjectRecord(reconciledProject);
            }
            if (typeof setProjectSaveState === "function") {
              setProjectSaveState({ isSaving: false, error: "", message: "Saved" });
            }
            return reconciledProject;
          } catch (error) {
            commitProjectOverviewSidebarProjectRecord(baseProject);
            const normalizedError = error instanceof Error
              ? error
              : new Error("Failed to update project.");
            if (typeof setProjectSaveState === "function") {
              setProjectSaveState({
                isSaving: false,
                error: normalizedError.message,
                message: "",
              });
            }
            if (options.throwOnError === true) {
              throw normalizedError;
            }
            return null;
          }
        }

        function updateProjectOverviewSidebarProjectProperty(projectUpdates = {}, metadataUpdates = {}) {
          setProjectOverviewSidebarPropertyPopover("");
          void persistProjectOverviewSidebarProjectUpdate(projectUpdates, metadataUpdates);
        }

        function selectProjectOverviewSidebarStatus(nextStatus) {
          const normalizedStatus = normalizePlaygroundProjectStatus(nextStatus);
          if (!PLAYGROUND_PROJECT_STATUS_OPTIONS.some((option) => option.id === normalizedStatus)) {
            return;
          }
          setProjectOverviewSidebarStatusSearchQuery("");
          updateProjectOverviewSidebarProjectProperty({
            status: normalizedStatus,
          }, {
            status: normalizedStatus,
          });
        }

        function selectProjectOverviewSidebarPriority(nextPriority) {
          const normalizedPriority = String(nextPriority || "").trim().toLowerCase();
          if (!PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === normalizedPriority)) {
            return;
          }
          setProjectOverviewSidebarPrioritySearchQuery("");
          updateProjectOverviewSidebarProjectProperty({
            priority: normalizedPriority,
          }, {
            priority: normalizedPriority,
          });
        }

        function getProjectOverviewEnvironmentId(environmentOrId) {
          if (typeof environmentOrId === "string" || typeof environmentOrId === "number") {
            return String(environmentOrId || "").trim();
          }
          if (!environmentOrId || typeof environmentOrId !== "object" || Array.isArray(environmentOrId)) {
            return "";
          }
          const metadata = environmentOrId.metadata && typeof environmentOrId.metadata === "object" && !Array.isArray(environmentOrId.metadata)
            ? environmentOrId.metadata
            : {};
          const environment = environmentOrId.environment && typeof environmentOrId.environment === "object" && !Array.isArray(environmentOrId.environment)
            ? environmentOrId.environment
            : {};
          const computer = environmentOrId.computer && typeof environmentOrId.computer === "object" && !Array.isArray(environmentOrId.computer)
            ? environmentOrId.computer
            : {};
          const sources = [environmentOrId, environment, computer, metadata];
          const keys = ["environmentId", "environment_id", "computerId", "computer_id", "id"];
          for (const source of sources) {
            for (const key of keys) {
              const value = String(source?.[key] || "").trim();
              if (value) {
                return value;
              }
            }
          }
          return "";
        }

        function requestProjectOverviewComputerChange(nextEnvironmentId, selectedEnvironmentRecord = null) {
          const requestedEnvironmentId = getProjectOverviewEnvironmentId(nextEnvironmentId);
          const selectedEnvironment = selectedEnvironmentRecord && typeof selectedEnvironmentRecord === "object" && !Array.isArray(selectedEnvironmentRecord)
            ? selectedEnvironmentRecord
            : null;
          const environmentId = getProjectOverviewEnvironmentId(selectedEnvironment) || requestedEnvironmentId;
          const currentProject = getActiveProjectOverviewRecord();
          const currentProjectMetadata = currentProject.metadata && typeof currentProject.metadata === "object" && !Array.isArray(currentProject.metadata)
            ? currentProject.metadata
            : {};
          const currentEnvironmentId = String(
            currentProject.defaultEnvironmentId
              || currentProjectMetadata.defaultEnvironmentId
              || activeProjectAttachmentEnvironmentId
              || projectComposerDefaultEnvironmentId
              || getProjectOverviewEnvironmentId(
                projectComposerAvailableEnvironments.find((environment) => environment?.isDefault),
              )
              || getProjectOverviewEnvironmentId(projectComposerAvailableEnvironments[0])
              || ""
          ).trim();
          const nextEnvironment = selectedEnvironment || projectComposerAvailableEnvironments.find(
            (environment) => getProjectOverviewEnvironmentId(environment) === environmentId,
          );
          if (!environmentId || !nextEnvironment || environmentId === currentEnvironmentId) {
            setProjectOverviewSidebarPropertyPopover("");
            setProjectOverviewSidebarComputerSearchQuery("");
            if (!environmentId || !nextEnvironment) {
              setProjectSaveState((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                isSaving: false,
                error: "This computer could not be selected. Refresh the project and try again.",
                message: "",
              }));
            }
            return;
          }
          const nextEnvironmentName = String(nextEnvironment?.name || nextEnvironment?.label || "Computer").trim();
          const currentEnvironment = projectComposerAvailableEnvironments.find(
            (environment) => getProjectOverviewEnvironmentId(environment) === currentEnvironmentId,
          ) || activeProjectAttachmentEnvironment || null;
          const currentEnvironmentName = String(
            currentEnvironment?.name
              || selectedProject?.defaultEnvironmentName
              || selectedProject?.metadata?.defaultEnvironmentName
              || "Current computer",
          ).trim();

          if (!currentEnvironmentId) {
            setProjectOverviewSidebarPropertyPopover("");
            setProjectOverviewSidebarComputerSearchQuery("");
            void persistProjectOverviewSidebarProjectUpdate({
              defaultEnvironmentId: environmentId,
              defaultEnvironmentName: nextEnvironmentName,
            }, {
              defaultEnvironmentId: environmentId,
              defaultEnvironmentName: nextEnvironmentName,
            });
            return;
          }
          setProjectComputerChangeDialog({
            sourceEnvironmentId: currentEnvironmentId,
            sourceEnvironmentName: currentEnvironmentName,
            targetEnvironmentId: environmentId,
            targetEnvironmentName: nextEnvironmentName,
          });
          setProjectOverviewSidebarPropertyPopover("");
          setProjectOverviewSidebarComputerSearchQuery("");
        }

        async function confirmProjectOverviewComputerChange(cloneProjectDirectory) {
          const dialog = projectComputerChangeDialog;
          if (!dialog?.targetEnvironmentId) {
            return;
          }
          const updatedProject = await persistProjectOverviewSidebarProjectUpdate({
            defaultEnvironmentId: dialog.targetEnvironmentId,
            defaultEnvironmentName: dialog.targetEnvironmentName,
          }, {
            defaultEnvironmentId: dialog.targetEnvironmentId,
            defaultEnvironmentName: dialog.targetEnvironmentName,
          }, {
            requestPayload: {
              cloneProjectDirectory: cloneProjectDirectory === true,
            },
            throwOnError: true,
          });
          if (!updatedProject) {
            throw new Error("Failed to change the project computer.");
          }
          setProjectComputerChangeDialog(null);
        }

	        async function saveProjectOverviewDescription(descriptionOverride) {
	          if (!selectedProject?.id) {
	            return;
          }

	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
          const descriptionRevision = projectDescriptionRevisionRef.current;
	          const hasDescriptionOverride = typeof descriptionOverride === "string";
	          const nextDescription = hasDescriptionOverride
	            ? descriptionOverride
            : (
                projectDraft?.id === normalizedProject.id
                  ? String(projectDraft.description || "")
                  : String(normalizedProject.description || "")
	              );
	          if (nextDescription === String(normalizedProject.description || "")) {
            if (projectDescriptionRevisionRef.current === descriptionRevision) {
              projectDescriptionDirtyProjectIdRef.current = "";
            }
	            setProjectSaveState((current) => current.error
	              ? { isSaving: false, error: "" }
	              : current
            );
            return;
          }

	          const nextProject = {
	            ...normalizedProject,
	            description: nextDescription,
              metadata: {
                ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" && !Array.isArray(normalizedProject.metadata)
                  ? normalizedProject.metadata
                  : {}),
                description: nextDescription,
              },
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

            const responseProject = getPlaygroundProjectResponseRecord(data, nextProject);
	            const updatedProject = responseProject?.id
              ? normalizePlaygroundProjectRecord({
                  ...responseProject,
                  description: nextDescription,
                  metadata: {
                    ...(responseProject.metadata && typeof responseProject.metadata === "object" && !Array.isArray(responseProject.metadata)
                      ? responseProject.metadata
                      : {}),
                    description: nextDescription,
                  },
                })
              : null;
	            if (!updatedProject?.id) {
	              throw new Error("Project update failed.");
	            }

            const hasNewerDescriptionDraft = (
              projectDescriptionDirtyProjectIdRef.current === updatedProject.id
              && projectDescriptionRevisionRef.current !== descriptionRevision
            );
            if (!hasNewerDescriptionDraft) {
              projectDescriptionDirtyProjectIdRef.current = "";
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
	            setProjectDraft((current) => {
                if (current?.id !== updatedProject.id) {
                  return current;
                }
                if (hasNewerDescriptionDraft) {
                  return {
                    ...current,
                    ...updatedProject,
                    description: current.description,
                    metadata: {
                      ...(updatedProject.metadata && typeof updatedProject.metadata === "object" && !Array.isArray(updatedProject.metadata)
                        ? updatedProject.metadata
                        : {}),
                      ...(current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                        ? current.metadata
                        : {}),
                      description: String(current.description || ""),
                    },
                  };
                }
                return {
                  ...current,
                  ...updatedProject,
                  description: nextDescription,
                  metadata: {
                    ...(updatedProject.metadata && typeof updatedProject.metadata === "object" && !Array.isArray(updatedProject.metadata)
                      ? updatedProject.metadata
                      : {}),
                    description: nextDescription,
                  },
                };
              });
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

        async function handleDeleteProjects(projectIds) {
          const resolvedProjectIds = Array.from(new Set(
            (Array.isArray(projectIds) ? projectIds : [projectIds])
              .map((projectId) => String(projectId || "").trim())
              .filter(Boolean)
          ));
          if (!resolvedProjectIds.length) return;
          const confirmed = window.confirm(
            resolvedProjectIds.length === 1
              ? "Delete this project?"
              : "Delete " + resolvedProjectIds.length + " selected projects?"
          );
          if (!confirmed) {
            return;
          }

          setProjectSidebarPopover("");

          const results = await Promise.all(resolvedProjectIds.map(async (resolvedProjectId) => {
            try {
              const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(resolvedProjectId), {
                method: "DELETE",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete project.");
              }
              return { id: resolvedProjectId, deleted: true, error: "" };
            } catch (error) {
              return {
                id: resolvedProjectId,
                deleted: false,
                error: error instanceof Error ? error.message : "Failed to delete project.",
              };
            }
          }));
          const deletedIds = new Set(results.filter((result) => result.deleted).map((result) => result.id));
          const failures = results.filter((result) => !result.deleted);
          if (deletedIds.size) {
            setProjects((current) => current.filter((project) => !deletedIds.has(project.id)));
            if (deletedIds.has(selectedProjectId)) {
              handleSelectProject("");
            } else {
              void loadProjects();
            }
          }
          if (failures.length) {
            window.alert(
              failures.length === 1
                ? failures[0].error
                : failures.length + " projects could not be deleted."
            );
          }
        }

        async function handleDeleteProject(projectId) {
          return await handleDeleteProjects([projectId]);
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
          const nextSuccessCriteria = normalizePlaygroundStrategyTextList(
            releaseDraft.successCriteriaInput ?? releaseDraft.successCriteria
          );
          const nextMetadata = {
            ...(releaseDraft.metadata && typeof releaseDraft.metadata === "object" && !Array.isArray(releaseDraft.metadata)
              ? releaseDraft.metadata
              : {}),
            successCriteria: nextSuccessCriteria,
          };
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
                  successCriteria: nextSuccessCriteria,
                  startAt: nextStartAt,
                  endAt: nextEndAt,
                  sortOrder: Number.isFinite(releaseDraft.sortOrder) ? Number(releaseDraft.sortOrder) : releases.length + 1,
                  metadata: nextMetadata,
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
          if (!normalizedRelease?.id) {
            return null;
          }
          const className = options.className || "playground-tasks-backlog-section-meta";
          return React.createElement("div", { className },
            React.createElement("button", {
                type: "button",
                className: "playground-tasks-release-edit-button",
                onClick: (event) => {
                  event.stopPropagation();
                  openReleaseComposerForEdit(normalizedRelease);
                },
                title: "Edit milestone",
                "aria-label": "Edit milestone",
              }, React.createElement(Ellipsis, { width: 12, height: 12, strokeWidth: 1.9 }))
          );
        }

        function renderMissionControlBacklogCard() {
          if (!selectedProject) {
            return null;
          }

          const hasProjectKnowledge = Boolean(getPlaygroundProjectKnowledgeLibraryId(selectedProject));
          const summaryText = isSelectedProjectMissionControlRunning
            ? "Mission Control is analyzing the project context, updating the backlog, and maintaining the project Knowledge library."
            : String(selectedProjectMissionControl.summary || "").trim()
              || "Run Mission Control to create or update the project Knowledge library, documentation, and backlog.";

          return React.createElement("div", { className: "playground-tasks-mission-control-card" },
            React.createElement("div", {
                className: "playground-tasks-backlog-item playground-tasks-mission-control-surface",
                style: getPlaygroundTaskColorStyle("gray"),
              },
              React.createElement("div", { className: "playground-tasks-mission-control-header" },
                React.createElement("div", { className: "playground-tasks-mission-control-title" }, (selectedProject.name || "Project") + " Mission Control"),
                React.createElement("div", { className: "playground-tasks-mission-control-actions" },
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
                className: "playground-tasks-mission-control-summary" + (hasProjectKnowledge || isSelectedProjectMissionControlRunning ? "" : " is-empty"),
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
          const normalizedProjectStatus = normalizePlaygroundProjectStatus(
            normalizedProject.status
              || metadataOverrides?.status
              || normalizedProject.metadata?.status
              || normalizedProject.state
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
	          const projectIndex = Math.max(0, projects.findIndex((project) => project.id === normalizedProject.id));
          const metadataPayload = {
            ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
            ...(metadataOverrides && typeof metadataOverrides === "object" ? metadataOverrides : {}),
            name: normalizedProject.name || "Project",
            description: normalizedProject.description,
            icon: getPlaygroundProjectIconId(normalizedProject.icon),
            status: normalizedProjectStatus,
            priority: normalizedProjectPriority,
            wallpaperId: getPlaygroundProjectWallpaperId(normalizedProject.wallpaperId, PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id),
            useCardBackgroundAsWallpaper: normalizedProject.useCardBackgroundAsWallpaper !== false,
            defaultEnvironmentId: normalizedProject.defaultEnvironmentId || null,
`;
