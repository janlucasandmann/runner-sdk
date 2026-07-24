export const PROJECTS_VIEWS_04_FRAGMENT = `          }) {
            const normalizedPopoverId = String(popoverId || "").trim();
            const hasControlledOpenState = typeof open === "boolean";
            const isOpen = hasControlledOpenState ? open : taskDetailSelectPopover === popoverId;
            const selectorOptions = Array.isArray(options) ? options.filter((option) => option?.value) : [];
            return React.createElement(PlatformSelector, {
              value: String(value || ""),
              options: selectorOptions,
              onValueChange: (_nextValue, option) => {
                if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
              },
              ariaLabel: "Select ticket " + normalizedPopoverId.replace(/-/g, " "),
              label: buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
              placeholder: valueLabel,
              disabled,
              open: isOpen,
              onOpenChange: (nextOpen) => {
                setTaskDetailPopover("");
                setTaskSkillsPopoverOpen(false);
                if (nextOpen && normalizedPopoverId === "assignee") {
                  setTaskDetailAssigneePopupMode(defaultTaskAssigneePopupMode);
                }
                if (normalizedPopoverId === "status") {
                  setTaskDetailStatusSearchQuery("");
                }
                if (normalizedPopoverId === "type") {
                  setTaskDetailTypeSearchQuery("");
                }
                if (normalizedPopoverId === "priority") {
                  setTaskDetailPrioritySearchQuery("");
                }
                if (typeof onOpenChange === "function") {
                  onOpenChange(nextOpen);
                  return;
                }
                setTaskDetailSelectPopover(nextOpen ? normalizedPopoverId : "");
              },
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent,
              popupHeader,
              popupHeaderClassName,
              popupContent,
              popupAriaLabel: popupAriaLabel || undefined,
              popupWidth,
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight,
              className: "playground-tasks-detail-central-selector" + (isEmpty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: ("playground-tasks-detail-central-selector-popup " + popupClassName).trim(),
            });
          }

          function getTaskActivityActorComment(event) {
            return {
              id: event?.id || "",
              authorType: event?.actorType || "user",
              authorAgentId: event?.actorAgentId || undefined,
              authorUserId: event?.actorUserId || undefined,
              authorName: event?.actorName || undefined,
              authorAvatarUrl: event?.actorAvatarUrl || undefined,
            };
          }

          function getTaskActivityActorName(event) {
            if (event?.eventType === "created" && !event?.actorName) {
              return getTaskCreatorIdentity(draftTask).name;
            }
            return getTaskCommentDisplayName(getTaskActivityActorComment(event));
          }

          function renderTaskActivityActorAvatar(event) {
            if (event?.eventType === "created" && !event?.actorName) {
              const creator = getTaskCreatorIdentity(draftTask);
              return renderAgentNameAvatar(
                creator.name,
                "playground-tasks-activity-avatar",
                creator.photoUrl
              );
            }
            return renderTaskCommentAvatar(
              getTaskActivityActorComment(event),
              "playground-tasks-activity-avatar"
            );
          }

          function getTaskActivityEvents() {
            const normalizedTaskDescription = String(draftTask.description || "")
              .replaceAll(String.fromCharCode(13), "")
              .replace(/\s+/g, " ")
              .trim();
            const comments = normalizePlaygroundTaskCommentList(draftTask.comments)
              .filter((comment) => {
                if (!normalizedTaskDescription) {
                  return true;
                }
                const normalizedCommentText = String(comment.text || "")
                  .replaceAll(String.fromCharCode(13), "")
                  .replace(/\s+/g, " ")
                  .trim();
                return normalizedCommentText !== normalizedTaskDescription;
              });
            const commentsById = new Map(comments.map((comment) => [comment.id, comment]));
            const repliesByParentCommentId = new Map();
            comments.forEach((comment) => {
              const parentCommentId = String(comment.parentCommentId || "").trim();
              if (!parentCommentId) {
                return;
              }
              const replies = repliesByParentCommentId.get(parentCommentId) || [];
              replies.push(comment);
              repliesByParentCommentId.set(parentCommentId, replies);
            });
            repliesByParentCommentId.forEach((replies) => {
              replies.sort((left, right) => {
                const leftTime = Date.parse(left.createdAt || "") || 0;
                const rightTime = Date.parse(right.createdAt || "") || 0;
                return leftTime - rightTime;
              });
            });
            const threadsById = new Map(selectedTaskThreads.map((thread) => [String(thread?.id || "").trim(), thread]));
            const creator = getTaskCreatorIdentity(draftTask);
            const syntheticEvents = [{
              id: "task_activity_created_" + draftTask.id,
              eventType: "created",
              sourceId: draftTask.id,
              actorType: creator.type,
              actorUserId: creator.type === "user" ? (draftTask.createdByUserId || currentUserId || "") : undefined,
              actorAgentId: creator.type === "agent" ? (draftTask.creator?.agentId || undefined) : undefined,
              actorName: creator.name,
              actorAvatarUrl: creator.photoUrl,
              createdAt: draftTask.createdAt,
            }];

            comments.forEach((comment) => {
              if (comment.parentCommentId) {
                return;
              }
              syntheticEvents.push({
                id: "task_activity_comment_" + comment.id,
                eventType: "comment_added",
                sourceId: comment.id,
                actorType: comment.authorType,
                actorUserId: comment.authorUserId,
                actorAgentId: comment.authorAgentId,
                actorName: comment.authorName,
                actorAvatarUrl: comment.authorAvatarUrl,
                commentId: comment.id,
                comment,
                createdAt: comment.createdAt,
              });
            });
            selectedTaskThreads.forEach((thread) => {
              const threadId = String(thread?.id || "").trim();
              if (!threadId) {
                return;
              }
              syntheticEvents.push({
                id: "task_activity_thread_" + threadId,
                eventType: "thread_started",
                sourceId: threadId,
                actorType: thread?.agentId ? "agent" : "user",
                actorUserId: thread?.agentId ? undefined : (thread?.createdByUserId || currentUserId || undefined),
                actorAgentId: thread?.agentId || undefined,
                actorName: thread?.agentId ? getTaskAssigneeName(thread.agentId, "Agent") : undefined,
                threadId,
                thread,
                createdAt: thread?.createdAt || thread?.updatedAt || draftTask.updatedAt,
              });
            });

            return normalizePlaygroundTaskActivityList([
              ...(Array.isArray(draftTask.activity) ? draftTask.activity : []),
              ...syntheticEvents,
            ]).map((event) => ({
              ...event,
              comment: event.comment || (event.commentId ? commentsById.get(event.commentId) || null : null),
              replies: event.commentId
                ? repliesByParentCommentId.get(event.commentId) || []
                : [],
              thread: event.thread || (event.threadId ? threadsById.get(event.threadId) || null : null),
            })).filter((event) => {
              const normalizedFieldName = String(event.fieldName || "").trim().toLowerCase();
              if (event.eventType === "field_changed" && normalizedFieldName === "description") {
                return false;
              }
              if (event.eventType === "comment_added") {
                return Boolean(event.comment && !event.comment.parentCommentId);
              }
              return true;
            });
          }

          function formatTaskActivityFieldValue(fieldName, value) {
            const normalizedValue = value === null || value === undefined ? "" : String(value).trim();
            if (!normalizedValue) {
              return "";
            }
            if (fieldName === "status") {
              return getPlaygroundTaskStatusLabel(normalizedValue === "backlog" ? "todo" : normalizedValue);
            }
            if (fieldName === "priority") {
              return PLAYGROUND_TASK_PRIORITY_OPTIONS.find((option) => option.id === normalizedValue)?.label || normalizedValue;
            }
            if (fieldName === "assigneeAgentId") {
              return getTaskAssigneeName(normalizedValue, normalizedValue);
            }
            if (fieldName === "releaseId" || fieldName === "milestoneId") {
              return releasesById[normalizedValue]?.name || normalizedValue;
            }
            if (fieldName === "sprintId") {
              return sprintsById[normalizedValue]?.name || normalizedValue;
            }
            if (["dueAt", "scheduledStartAt", "scheduledEndAt"].includes(fieldName)) {
              return formatPlaygroundFileDate(normalizedValue) || normalizedValue;
            }
            return normalizedValue;
          }

          function renderTaskActivityEventSummary(event) {
            const actorName = getTaskActivityActorName(event);
            const actor = React.createElement("strong", null, actorName);
            if (event.eventType === "created") {
              return React.createElement(React.Fragment, null, actor, " created the issue");
            }
            if (event.eventType === "status_changed") {
              const previousStatus = formatTaskActivityFieldValue("status", event.previousValue);
              const nextStatus = formatTaskActivityFieldValue("status", event.nextValue);
              return React.createElement(
                React.Fragment,
                null,
                actor,
                " moved from ",
                React.createElement("strong", null, previousStatus || "Unknown"),
                " to ",
                React.createElement("strong", null, nextStatus || "Unknown")
              );
            }
            if (event.eventType === "thread_started") {
              const threadTitle = String(event.thread?.title || event.metadata?.threadTitle || "Untitled thread").trim();
              return React.createElement(
                React.Fragment,
                null,
                actor,
                " started ",
                React.createElement("strong", null, threadTitle)
              );
            }
            if (event.eventType === "field_changed") {
              const fieldName = String(event.fieldName || "").trim();
              const nextValue = formatTaskActivityFieldValue(fieldName, event.nextValue);
              const previousValue = formatTaskActivityFieldValue(fieldName, event.previousValue);
              if (fieldName === "title") {
                return React.createElement(React.Fragment, null, actor, " renamed the issue to ", React.createElement("strong", null, nextValue));
              }
              if (fieldName === "dueAt") {
                return React.createElement(
                  React.Fragment,
                  null,
                  actor,
                  nextValue ? " set the due date to " : " cleared the due date",
                  nextValue ? React.createElement("strong", null, nextValue) : null
                );
              }
              if (fieldName === "assigneeAgentId") {
                return React.createElement(
                  React.Fragment,
                  null,
                  actor,
                  nextValue ? " assigned the issue to " : " removed the assignee",
                  nextValue ? React.createElement("strong", null, nextValue) : null
                );
              }
              if (fieldName === "releaseId" || fieldName === "milestoneId") {
                return React.createElement(
                  React.Fragment,
                  null,
                  actor,
                  nextValue ? " changed milestone to " : " cleared milestone",
                  nextValue ? React.createElement("strong", null, nextValue) : null
                );
              }
              if (fieldName === "dependencyIds") {
                return React.createElement(React.Fragment, null, actor, " updated the issue blockers");
              }
              const fieldLabel = fieldName
                .replace(/Id$/, "")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .toLowerCase();
              return React.createElement(
                React.Fragment,
                null,
                actor,
                " changed ",
                fieldLabel || "the issue",
                previousValue ? " from " : " to ",
                previousValue ? React.createElement("strong", null, previousValue) : null,
                previousValue ? " to " : null,
                React.createElement("strong", null, nextValue || "None")
              );
            }
            return actor;
          }

          function renderTaskActivitySection() {
            const taskAgentReviewStartPending = taskAgentReviewStartPendingId === draftTask.id;
            const normalizedDraftTaskStatus = String(draftTask.status || "").trim().toLowerCase();
            const isHumanReviewerForTask = isPlaygroundHumanAssigneeId(draftTask.reviewerAgentId);
            const reviewerAgentId = String(draftTask.reviewerAgentId || "").trim();
            const isAgentReviewerForTask = Boolean(reviewerAgentId && !isHumanReviewerForTask);
            const canHumanReviewTask = normalizedDraftTaskStatus === "in_review" && isHumanReviewerForTask;
            const canAgentReviewTask = normalizedDraftTaskStatus === "in_review" && isAgentReviewerForTask;
            const canRequestTaskChanges = (isHumanReviewerForTask || isAgentReviewerForTask)
              && (normalizedDraftTaskStatus === "in_review" || normalizedDraftTaskStatus === "done");
            const activityItems = getTaskActivityEvents().map((event) => {
              const comment = event.comment;
              const thread = event.thread;
              const isComment = event.eventType === "comment_added" && comment;
              const isThread = event.eventType === "thread_started";
              const isStatus = event.eventType === "status_changed";
              const isFieldChange = event.eventType === "field_changed";
              const isMilestoneChange = isFieldChange
                && ["releaseId", "milestoneId"].includes(String(event.fieldName || "").trim());
              const isScheduleChange = isFieldChange
                && [
                  "dueAt",
                  "scheduledStartAt",
                  "scheduledEndAt",
                  "scheduleType",
                  "cronExpression",
                  "scheduleTimezone",
                  "scheduleEnabled",
                ].includes(String(event.fieldName || "").trim());
              const threadStatus = isThread && thread
                ? getTaskDetailThreadStatusPresentation(thread)
                : null;
              const threadStatusVariant = threadStatus?.className === "is-completed"
                ? "green"
                : threadStatus?.className === "is-running"
                  ? "blue"
                  : threadStatus?.className === "is-permission"
                    ? "yellow"
                    : threadStatus?.className === "is-failed"
                      ? "red"
                      : "gray";
              return {
                id: event.id,
                tone: isComment ? "comment" : isThread ? "thread" : isStatus ? "status" : "created",
                summary: isComment
                  ? React.createElement("strong", null, getTaskCommentDisplayName(comment))
                  : renderTaskActivityEventSummary(event),
                timestamp: formatRelativeThreadTime(event.createdAt) || formatPlaygroundFileDate(event.createdAt),
                avatar: isStatus
                  ? renderPlaygroundTaskStatusGlyph(
                      event.nextValue,
                      "platform-activity-timeline__status-icon"
                    )
                  : isFieldChange
                    ? null
                    : renderTaskActivityActorAvatar(event),
                icon: isMilestoneChange
                  ? Flag
                  : isScheduleChange
                    ? CalendarIcon
                    : isFieldChange
                      ? PencilRuler
                      : undefined,
                content: isComment
                  ? React.createElement(React.Fragment, null,
                      React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: comment.text,
                        className: "playground-tasks-activity-comment-text tb-message-markdown",
                      }),
                      Array.isArray(comment.attachments) && comment.attachments.length
                        ? React.createElement("div", {
                            className: "playground-tasks-activity-comment-attachments",
                          }, comment.attachments.map((attachment) =>
                            renderTaskAttachmentChip(attachment, { removable: false })
                          ))
                        : null
                    )
                  : null,
                replies: isComment
                  ? (Array.isArray(event.replies) ? event.replies : []).map((reply) => ({
                      id: reply.id,
                      author: getTaskCommentDisplayName(reply),
                      timestamp: formatRelativeThreadTime(reply.createdAt) || formatPlaygroundFileDate(reply.createdAt),
                      avatar: renderTaskCommentAvatar(
                        reply,
                        "playground-tasks-activity-reply-avatar"
                      ),
                      content: React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: reply.text,
                        className: "playground-tasks-activity-reply-text tb-message-markdown",
                      }),
                    }))
                  : undefined,
                replyComposer: isComment
                  ? {
                      onSubmit: (body) => handleAddTaskComment({
                        inline: true,
                        parentCommentId: comment.id,
                        body,
                      }),
                      avatar: renderAgentNameAvatar(
                        currentUserName || "Me",
                        "playground-tasks-activity-reply-composer-avatar",
                        canRenderAvatarImage(currentUserAvatarUrl) ? currentUserAvatarUrl : ""
                      ),
                      disabled: isTaskConfigLocked,
                    }
                  : undefined,
                actions: isComment
                  && isTaskCommentByCurrentUser(comment)
                  && !isTaskConfigLocked
                  ? {
                      editableValue: comment.text,
                      disabled: saveState.isSaving,
                      onEdit: (nextText) => handleEditTaskComment(comment.id, nextText),
                      onDelete: () => handleDeleteTaskComment(comment.id),
                    }
                  : undefined,
                trailing: threadStatus
                  ? React.createElement(PlatformLabel, {
                      variant: threadStatusVariant,
                    }, threadStatus.label)
                  : null,
                onActivate: isThread && thread
                  ? () => openTaskDetailThread(thread, "chat")
                  : undefined,
                ariaLabel: isThread && thread
                  ? "Open thread " + String(thread.title || thread.id || "")
                  : undefined,
              };
            });
            return React.createElement(PlatformActivityTimeline, {
              className: "playground-tasks-activity",
              items: activityItems,
              headerActions: canRequestTaskChanges || canHumanReviewTask || canAgentReviewTask
                ? React.createElement(React.Fragment, null,
                    canRequestTaskChanges
                      ? React.createElement(PlatformSecondaryButton, {
                          type: "button",
                          size: "small",
                          disabled: saveState.isSaving,
                          onClick: activateTaskReviewCommentMode,
                        }, "Request Changes")
                      : null,
                    canHumanReviewTask
                      ? React.createElement(PlatformPrimaryButton, {
                          type: "button",
                          size: "small",
                          disabled: saveState.isSaving,
                          onClick: () => void handleApproveTaskReview(),
                        }, "Approve")
                      : null,
                    canAgentReviewTask
                      ? React.createElement(PlatformPrimaryButton, {
                          type: "button",
                          size: "small",
                          disabled: saveState.isSaving
                            || taskAgentReviewStartPending
                            || typeof onStartAgentReviewThread !== "function",
                          onClick: () => void handleStartSelectedTaskAgentReview(),
                        }, taskAgentReviewStartPending ? "Starting..." : "Start Agent Review")
                      : null
                  )
                : null,
              composer: {
                value: taskActivityCommentValue,
                onChange: (nextValue) => {
                  setTaskActivityCommentValue(nextValue);
                  if (taskActivityCommentError) {
                    setTaskActivityCommentError("");
                  }
                },
                onSubmit: async (files) => Boolean(await handleAddTaskComment({
                  inline: true,
                  body: taskActivityCommentValue,
                  files,
                })),
                allowAttachments: true,
                disabled: isTaskConfigLocked,
                submitting: taskActivityCommentPending,
                errorMessage: taskActivityCommentError,
              },
            });
          }

          function getTaskDetailThreadStatusPresentation(thread) {
            const status = resolvePlaygroundTaskThreadStatus(
              thread?.status,
              thread?.completedAt || thread?.finishedAt || thread?.endedAt,
              thread?.updatedAt
            );
            const normalizedStatus = String(status || "").trim().toLowerCase();
            if (isPendingPermissionThreadDisplayStatus(normalizedStatus)) {
              return { label: "Permission", className: "is-permission", icon: Loader2 };
            }
            if (isPlaygroundTaskThreadStatusActive(normalizedStatus)) {
              return { label: "Running", className: "is-running", icon: Loader2 };
            }
            if (isCompletedThreadStatus(normalizedStatus)) {
              return { label: "Completed", className: "is-completed", icon: Check };
            }
            if (["failed", "cancelled", "canceled"].includes(normalizedStatus)) {
              return { label: normalizedStatus === "failed" ? "Failed" : "Cancelled", className: "is-failed", icon: X };
            }
            return {
              label: normalizedStatus
                ? normalizedStatus.replace(/[_-]+/g, " ").replace(/\\b\\w/g, (character) => character.toUpperCase())
                : "Status unavailable",
              className: "is-neutral",
              icon: History,
            };
          }

          function openTaskDetailThread(thread, contentMode = "chat") {
            const normalizedThreadId = String(thread?.id || "").trim();
            if (!normalizedThreadId || typeof onThreadStarted !== "function") {
              return;
            }
            setTaskDetailPopover("");
            setTaskDetailThreadToolbarPopover("");
            onThreadStarted(normalizedThreadId, {
              contentMode,
              threadRecord: thread,
              taskPreview: getThreadTaskPreview(thread) || null,
            });
          }

          function renderTaskCommentDialog() {
            const commentSubmission = getTaskCommentSubmissionDraft(taskCommentInputValue);
            return React.createElement(PlatformModal, {
              open: taskCommentComposerOpen,
              title: commentSubmission.isReview ? "Request Changes" : "Add Comment",
              showHeader: false,
              size: "medium",
              as: "form",
              className: "playground-tasks-comment-modal",
              bodyClassName: "playground-tasks-comment-modal-body",
              footerClassName: "playground-tasks-comment-modal-footer",
              closeButtonDisabled: saveState.isSaving,
              onClose: () => closeTaskCommentComposer(),
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void handleAddTaskComment();
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "medium",
                  disabled: saveState.isSaving,
                  onClick: closeTaskCommentComposer,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  type: "submit",
                  size: "medium",
                  disabled: saveState.isSaving || !commentSubmission.body,
                }, saveState.isSaving
                  ? "Adding..."
                  : (commentSubmission.isReview ? "Request Changes" : "Add Comment"))
              ),
            },
              React.createElement(PlatformInstructionsEditor, {
                value: taskCommentInputValue,
                onChange: (nextValue) => {
                  if (/^\\/review(?:\\s+|$)/i.test(String(nextValue || "").trimStart())) {
                    setTaskCommentMode("review");
                    setTaskCommentInputValue(String(nextValue || "").trimStart().replace(/^\\/review(?:\\s+|$)/i, ""));
                  } else {
                    setTaskCommentInputValue(nextValue);
                  }
                },
                title: commentSubmission.isReview ? "Request Changes" : "Add Comment",
                placeholder: commentSubmission.isReview ? "Request changes" : "Add a comment",
                ariaLabel: commentSubmission.isReview ? "Change request" : "Comment",
                historyKey: "ticket-comment:" + String(draftTask?.id || ""),
                stickyHeader: false,
                variant: "minimalistic-ui",
                className: "playground-tasks-comment-modal-instructions",
              }),
              saveState.error
                ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, saveState.error)
                : null
            );
          }

          function renderTaskWorkActionControl() {
            const hasStartedThread = taskHasStartedThread(draftTask);
            const reviewerAgentId = String(draftTask.reviewerAgentId || "").trim();
            const hasRunnableReviewer = Boolean(
              reviewerAgentId
              && !isPlaygroundHumanAssigneeId(reviewerAgentId)
              && typeof onStartAgentReviewThread === "function"
            );
            const taskThreadStartPending = taskRunPendingIds.includes(draftTask.id)
              || taskRunPendingIdsRef.current.has(draftTask.id);
            const taskReviewStartPending = taskAgentReviewStartPendingId === draftTask.id;
            const actionPending = taskThreadStartPending || taskReviewStartPending;
            const mainActionKind = !hasStartedThread
              ? "start"
              : hasRunnableReviewer
                ? "review"
                : "rerun";
            const mainActionLabel = actionPending
              ? (mainActionKind === "review" ? "Starting Review..." : "Starting...")
              : mainActionKind === "start"
                ? "Start Work"
                : mainActionKind === "review"
                  ? "Start Review"
                  : "Rerun Thread";
            const threadActionDisabled = isTaskConfigLocked
              || draftTask.status === "canceled"
              || isHumanAssignedTask(draftTask)
              || actionPending;
            const reviewActionDisabled = isTaskConfigLocked
              || draftTask.status === "canceled"
              || !hasRunnableReviewer
              || actionPending;
            const mainActionDisabled = mainActionKind === "review"
              ? reviewActionDisabled
              : threadActionDisabled;
            const popupActionLabel = !hasStartedThread
              ? "Run Review"
              : hasRunnableReviewer
                ? "Rerun Thread"
                : "Start Review";
            const popupActionDisabled = !hasStartedThread
              || !hasRunnableReviewer
              || threadActionDisabled;

            return React.createElement("div", {
                className: "playground-tasks-detail-work-control",
              },
              React.createElement(PlatformButtonSelector, {
                  mode: "split-action",
                  buttonVariant: "primary",
                  buttonSize: "small",
                  label: mainActionLabel,
                  actionAriaLabel: mainActionLabel,
                  popupAriaLabel: "Ticket work options",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupAlignment: "left",
                  matchTriggerWidth: true,
                  closeOnSelect: true,
                  actionDisabled: mainActionDisabled,
                  popupDisabled: false,
                  className: "playground-tasks-detail-work-selector",
                  popupClassName: "playground-tasks-detail-work-selector-popup",
                  onAction: () => {
                    if (mainActionKind === "review") {
                      return handleStartSelectedTaskAgentReview();
                    }
                    return handleStartTaskThread(draftTask);
                  },
                },
                React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  disabled: popupActionDisabled,
                  onClick: () => {
                    if (popupActionDisabled) {
                      return;
                    }
                    if (hasRunnableReviewer) {
                      void handleStartTaskThread(draftTask);
                    }
                  },
                }, popupActionLabel)
              )
            );
          }

          function renderTaskDetailFactsSection(options = {}) {
            const contentOnly = options.contentOnly === true;
            const activeTaskStatus = PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === draftTask.status)
              ? draftTask.status
              : "todo";
            const activeTaskStatusPresentation = getPlaygroundTaskStatusPresentation(activeTaskStatus);
            const normalizedTaskStatusSearchQuery = String(taskDetailStatusSearchQuery || "").trim().toLowerCase();
            const taskDetailStatusOptions = PLAYGROUND_TASK_MANUAL_STATUS_OPTIONS
              .map((option, index) => ({
                ...option,
                shortcut: String(index + 1),
              }))
              .filter((option) => (
                !normalizedTaskStatusSearchQuery
                || option.label.toLowerCase().includes(normalizedTaskStatusSearchQuery)
              ));
            const normalizedTaskTypeSearchQuery = String(taskDetailTypeSearchQuery || "").trim().toLowerCase();
            const taskDetailTypeOptions = PLAYGROUND_TASK_TYPE_OPTIONS
              .map((option, index) => ({
                ...option,
                shortcut: String(index + 1),
              }))
              .filter((option) => (
                !normalizedTaskTypeSearchQuery
                || option.label.toLowerCase().includes(normalizedTaskTypeSearchQuery)
              ));
            const normalizedTaskPrioritySearchQuery = String(taskDetailPrioritySearchQuery || "").trim().toLowerCase();
            const taskDetailPriorityOptions = PLAYGROUND_TASK_PRIORITY_OPTIONS
              .map((option, index) => ({
                ...option,
                shortcut: String(index + 1),
              }))
              .filter((option) => (
                !normalizedTaskPrioritySearchQuery
                || option.label.toLowerCase().includes(normalizedTaskPrioritySearchQuery)
              ));

            function renderTaskDetailTypeBadge(taskType) {
              const normalizedTaskType = normalizePlaygroundTaskType(taskType);
              const TaskTypeIcon = normalizedTaskType === "subtask"
                ? Check
                : (normalizedTaskType === "loop" ? RefreshCw : Bookmark);
              return React.createElement("span", {
                  className: "playground-tasks-detail-type-badge is-" + normalizedTaskType,
                  "aria-hidden": "true",
                },
                React.createElement(TaskTypeIcon, { width: 10, height: 10, strokeWidth: 1.9 })
              );
            }
            return React.createElement("div", {
                  className: "playground-tasks-detail-facts"
                    + (contentOnly ? " is-centralized-sidebar-content" : "")
                    + ((taskDetailSelectPopover || taskScheduleDialogState) ? " is-popover-open" : ""),
                },
                contentOnly ? null : React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-facts-toggle" + (taskDetailsCollapsed ? " is-collapsed" : ""),
                    onClick: () => setTaskDetailsCollapsed((current) => !current),
                    title: taskDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-label": taskDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-expanded": taskDetailsCollapsed ? "false" : "true",
                  }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                ),
                contentOnly || !taskDetailsCollapsed
                  ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                React.createElement("div", { className: "playground-tasks-detail-fact is-status" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Status"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "status",
                      value: activeTaskStatus,
                      valueLabel: activeTaskStatusPresentation.label,
                      disabled: isTaskConfigLocked,
                      buttonContent: renderPlaygroundTaskStatusValue(activeTaskStatus, "playground-tasks-detail-status-value"),
                      popupClassName: "playground-tasks-detail-status-selector-popup",
                      popupHeader: React.createElement(PlatformPopupSearchHeader, {
                        value: taskDetailStatusSearchQuery,
                        onChange: (event) => setTaskDetailStatusSearchQuery(event.target.value),
                        placeholder: "Change status...",
                        shortcut: "S",
                        autoFocus: taskDetailSelectPopover === "status",
                        "aria-label": "Search ticket statuses",
                      }),
                      popupHeaderClassName: "is-search-header",
                      emptyContent: "No matching statuses.",
                      options: taskDetailStatusOptions.map((option) =>
                        createTaskDetailSelectorOption({
                          value: option.id,
                          label: option.label,
                          leading: renderPlaygroundTaskStatusGlyph(option.id),
                          trailing: option.shortcut,
                          onSelect: () => selectTaskDetailStatus(option.id),
                        })
                      ),
                    })
                  )
                ),
                activeTaskStatus === "blocked"
                  ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                      React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Blocked by"),
                      React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                        renderTaskDetailSelectControl({
                          popoverId: "blocked-by",
                          value: blockedByTaskId || "__none__",
                          valueLabel: activeBlockedByLabel,
                          disabled: isTaskConfigLocked,
                          isEmpty: !blockedByTaskId,
                          popupClassName: "playground-tasks-detail-blocked-by-selector-popup",
                          options: [
                            createTaskDetailSelectorOption({
                              value: "__none__",
                              label: "None",
                              onSelect: () => {
                                updateDraftTask((current) => ({
                                  ...current,
                                  dependencyIds: [],
                                  status: "todo",
                                  completedAt: null,
                                }), { autosave: true });
                              },
                            }),
                            ...dependencyCandidates.map((task) => {
                              const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                              return createTaskDetailSelectorOption({
                                value: task.id,
                                label: taskTicketNumber + " - " + (task.title || "Untitled Task"),
                                onSelect: () => {
                                  updateDraftTask((current) => ({
                                    ...current,
                                    dependencyIds: [task.id],
                                    status: "blocked",
                                    completedAt: null,
                                  }), { autosave: true });
                                },
                              });
                            }),
                          ],
                        })
                      )
                    )
                  : null,
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Type"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    React.createElement("div", { className: "playground-tasks-type-control" },
                      renderTaskDetailSelectControl({
                        popoverId: "type",
                        value: activeTaskType,
                        valueLabel: activeTaskType === "subtask" && draftTaskParentTicketNumber
                          ? ("Subtask to " + draftTaskParentTicketNumber)
                          : activeTaskTypeLabel,
                        disabled: isTaskConfigLocked,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-detail-type-value",
                          },
                            renderTaskDetailTypeBadge(activeTaskType),
                            activeTaskType === "subtask"
                              ? React.createElement(React.Fragment, null,
                                  React.createElement("span", { className: "playground-tasks-detail-type-prefix" }, "Subtask to"),
                                  draftTaskParentTicketNumber
                                    ? React.createElement("span", { className: "playground-tasks-detail-type-ticket", title: draftTaskParentLabel }, draftTaskParentTicketNumber)
                                    : null
                                )
                              : React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeTaskTypeLabel)
                          ),
                        popupClassName: "playground-tasks-detail-type-selector-popup",
                        popupHeader: React.createElement(PlatformPopupSearchHeader, {
                          value: taskDetailTypeSearchQuery,
                          onChange: (event) => setTaskDetailTypeSearchQuery(event.target.value),
                          placeholder: "Change type...",
                          shortcut: "T",
                          autoFocus: taskDetailSelectPopover === "type",
                          "aria-label": "Search ticket types",
                        }),
                        popupHeaderClassName: "is-search-header",
                        emptyContent: "No matching ticket types.",
                        options: taskDetailTypeOptions.map((option) =>
                          createTaskDetailSelectorOption({
                            value: option.id,
                            label: option.label,
                            leading: renderTaskDetailTypeBadge(option.id),
                            trailing: option.shortcut,
                            onSelect: () => handleTaskTypeSelection(option.id),
                          })
                        ),
                      }),
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Priority"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "priority",
                      value: draftTask.priority,
                      valueLabel: activeTaskPriorityPresentation.label,
                      disabled: isTaskConfigLocked,
                      buttonContent: React.createElement(React.Fragment, null,
                        React.createElement("span", {
                          className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + activeTaskPriorityPresentation.toneClassName,
                        },
                          renderPlaygroundTaskPriorityGlyph(draftTask.priority),
                          React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, activeTaskPriorityPresentation.label)
                        )
                      ),
                      popupClassName: "playground-tasks-detail-priority-selector-popup",
                      popupHeader: React.createElement(PlatformPopupSearchHeader, {
                        value: taskDetailPrioritySearchQuery,
                        onChange: (event) => setTaskDetailPrioritySearchQuery(event.target.value),
                        placeholder: "Change priority...",
                        shortcut: "P",
                        autoFocus: taskDetailSelectPopover === "priority",
                        "aria-label": "Search ticket priorities",
                      }),
                      popupHeaderClassName: "is-search-header",
                      emptyContent: "No matching priorities.",
                      options: taskDetailPriorityOptions.map((option) =>
                        createTaskDetailSelectorOption({
                          value: option.id,
                          label: getPlaygroundTaskPriorityPresentation(option.id).label,
                          leading: renderPlaygroundTaskPriorityGlyph(option.id),
                          trailing: option.shortcut,
                          onSelect: () => selectTaskDetailPriority(option.id),
                        })
                      ),
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Reviewer"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "reviewer",
                      value: draftTask.reviewRequired && resolvedTaskReviewerId ? resolvedTaskReviewerId : "__none__",
                      valueLabel: activeReviewerLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !draftTask.reviewRequired,
                      buttonContent: renderTaskDetailPersonValue(resolvedTaskReviewerId, activeReviewerLabel),
                      options: [
                        createTaskDetailSelectorOption({
                          value: "__none__",
                          label: "No review",
                          description: "Move directly to Done when work is done.",
                          leading: React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar", "aria-hidden": "true" },
                            React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar-fallback" }, "No")
                          ),
                          onSelect: () => updateDraftTask((current) => ({
                            ...current,
                            reviewRequired: false,
                            reviewerAgentId: null,
                          }), { autosave: true }),
                        }),
                        ...assignableActors.map((actor) => {
                          const mode = getPlaygroundTaskAssigneePopupMode(actor);
                          return createTaskDetailSelectorOption({
                            value: actor.id,
                            label: getTaskAssigneeName(actor.id, actor.name || "Reviewer"),
                            description: mode === "humans" ? "Human reviewer" : mode === "teams" ? "Agent squad reviewer" : "Agent reviewer",
                            leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
                            onSelect: () => updateDraftTask((current) => ({
                              ...current,
                              reviewRequired: true,
                              reviewerAgentId: actor.id,
                            }), { autosave: true }),
                          });
                        }),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Milestone"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "release",
                      value: activeTaskReleaseId || "__none__",
                      valueLabel: activeReleaseLabel,
                      isEmpty: !activeTaskReleaseId,
                      options: [
                        createTaskDetailSelectorOption({
                          value: "__none__",
                          label: "None",
                          onSelect: () => {
                            updateDraftField("releaseId", null, { autosave: true });
                          },
                        }),
                        ...releases
                          .slice()
                          .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                          .map((release) =>
                            createTaskDetailSelectorOption({
                              value: release.id,
                              label: release.name || "Untitled Milestone",
                              description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                              onSelect: () => {
                                updateDraftField("releaseId", release.id, { autosave: true });
                              },
                            })
                          ),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Schedule"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "schedule",
                      value: taskScheduleSummary || "__none__",
                      valueLabel: taskScheduleSummary || "None",
                      disabled: isTaskConfigLocked,
                      isEmpty: !taskScheduleSummary,
                      open: Boolean(taskScheduleDialogState) && taskScheduleDialogPhase !== "exit",
                      onOpenChange: (nextOpen) => {
                        if (nextOpen) {
                          if (!taskScheduleDialogState) {
                            openTaskScheduleDialog();
                          }
                          return;
                        }
                        if (taskScheduleDialogState) {
                          closeTaskScheduleDialog();
                        }
                      },
                      popupContent: renderTaskScheduleDialog({ embedded: true }),
                      popupAriaLabel: "Edit ticket schedule",
                      popupClassName: "playground-tasks-schedule-selector-popup",
                      popupWidth: "min(320px, calc(100vw - 48px))",
                      popupMaxHeight: "min(520px, calc(100vh - 96px))",
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact is-assignee" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Assignee"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "assignee",
                      value: resolvedTaskAssigneeId,
                      valueLabel: activeAssigneeLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !resolvedTaskAssigneeId,
                      buttonContent: renderTaskDetailPersonValue(resolvedTaskAssigneeId, activeAssigneeLabel),
                      popupClassName: "playground-tasks-detail-assignee-selector-popup",
                      popupHeader: taskDetailAvailableAssigneePopupModes.length > 1
                        ? React.createElement(PlatformSwitch, {
                            className: "playground-tasks-detail-assignee-mode-switch",
                            ariaLabel: "Assignee type",
                            value: taskDetailAssigneePopupMode,
                            options: taskDetailAvailableAssigneePopupModes.map((mode) => ({
                              value: mode,
                              label: mode === "teams" ? "Squads" : mode === "humans" ? "Humans" : "Agents",
                            })),
                            onValueChange: setTaskDetailAssigneePopupMode,
                          })
                        : null,
                      emptyContent: "No assignees yet.",
                      options: filteredTaskDetailAssignableActors.map((actor) => {
                        const mode = getPlaygroundTaskAssigneePopupMode(actor);
                        return createTaskDetailSelectorOption({
                          value: actor.id,
                          label: getTaskAssigneeName(actor.id, actor.name || "Unknown"),
                          description: mode === "humans" ? "Human" : mode === "teams" ? "Agent squad" : "Agent",
                          leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
                          onSelect: () => updateDraftField("assigneeAgentId", actor.id, { autosave: true }),
                        });
                      }),
                    })
                  )
                ),
                contentOnly ? renderTaskWorkActionControl() : null)
                  : null
              )
          }
	          const taskDetailBreadcrumbActionsPortalTarget = isFullPageTaskDetail
	            && typeof document !== "undefined"
	            ? document.getElementById("playground-ticket-breadcrumb-actions-root")
	            : null;
	          const taskDetailBreadcrumbActionsPortal = taskDetailBreadcrumbActionsPortalTarget
	            ? createPortal(
	                React.createElement(PlatformPopup, {
	                    open: taskDetailPopover === "menu",
	                    rootClassName: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-ticket-breadcrumb-actions",
	                    surfaceClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide",
	                    surfaceProps: {
	                      role: "menu",
	                      "aria-label": "Task actions",
	                    },
	                    animation: "down-in",
	                    variant: "minimal",
	                    placement: "bottom-end",
	                    trigger: React.createElement("button", {
	                      type: "button",
	                      className: "playground-files-header-icon-button is-plain" + (taskDetailPopover === "menu" ? " is-active" : ""),
	                      onClick: () => setTaskDetailPopover((current) => current === "menu" ? "" : "menu"),
	                      title: "Task actions",
	                      "aria-label": "Task actions",
	                      "aria-haspopup": "menu",
	                      "aria-expanded": taskDetailPopover === "menu" ? "true" : "false",
	                    }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
	                  },
	                  React.createElement("button", {
	                    type: "button",
	                    role: "menuitem",
	                    className: "tb-popup-row playground-tasks-detail-menu-item-danger",
	                    disabled: saveState.isSaving,
	                    onClick: () => {
	                      setTaskDetailPopover("");
	                      void handleDeleteTask(draftTask.id);
	                    },
	                  },
	                    React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
	                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                      React.createElement("span", null, "Delete"),
	                      React.createElement("span", null, "Remove this ticket from the project.")
	                    )
	                  )
	                ),
	                taskDetailBreadcrumbActionsPortalTarget
	              )
	            : null;
	          const taskDetailNavbar = isFullPageTaskDetail
	            ? null
	            : React.createElement("div", {
	                className: "playground-content-nav playground-tasks-detail-navbar",
	              },
	                  React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
	                      React.createElement("div", { className: "playground-tasks-detail-navbar-title-meta" },
	                        React.createElement("div", {
                          className: "playground-tasks-backlog-project-icon "
                            + (activeTaskType === "subtask" ? "is-subtask" : (activeTaskType === "loop" ? "is-loop" : "is-task")),
                          "aria-hidden": "true",
                        },
                          React.createElement(ActiveTaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 })
                        ),
                        renderPlaygroundTaskPriorityIcon(draftTask.priority, "playground-tasks-backlog-priority"),
                        React.createElement("span", { className: "playground-tasks-detail-navbar-ticket" }, activeTicketNumber)
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                        React.createElement("input", {
                          type: "text",
                          className: "playground-content-title playground-tasks-detail-navbar-title-input",
                          value: taskTitleInputValue,
                          placeholder: "Task",
                          "aria-label": "Task title",
                          title: taskTitleInputValue || "Task",
                          onChange: (event) => setTaskTitleInputValue(event.target.value),
                          onBlur: commitTaskTitleInput,
                          readOnly: isTaskConfigLocked,
                          onKeyDown: (event) => {
                            if (isTaskConfigLocked) {
                              return;
                            }
                            if (event.key === "Enter") {
                              event.preventDefault();
                              event.currentTarget.blur();
                              return;
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              taskTitleSkipCommitRef.current = true;
                              setTaskTitleInputValue(draftTask.title || "New Task");
                              event.currentTarget.blur();
                            }
                          },
	                        })
	                      )
	                    ),
	                  React.createElement("div", { className: "playground-content-nav-center" }),
	                  React.createElement("div", {
	                    className: "playground-content-nav-right playground-tasks-detail-navbar-actions",
	                    ref: taskDetailActionsRef,
	                  },
	                    React.createElement(React.Fragment, null,
			                        React.createElement("div", { className: "playground-tasks-detail-navbar-status" },
			                          renderTaskPreviewStatusControl(draftTask)
		                        ),
		                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
	                    React.createElement("button", {
	                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (taskDetailPopover === "menu" ? " is-active" : ""),
                      onClick: () => setTaskDetailPopover((current) => current === "menu" ? "" : "menu"),
                      title: "Task actions",
                      "aria-label": "Task actions",
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    taskDetailPopover === "menu"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          renderTaskActionsMenu(draftTask, {
                            closeMenu: () => setTaskDetailPopover(""),
                            includeFullScreenAction: true,
	                          })
	                        )
		                      : null
		                  )
	                    ),
	                    React.createElement("button", {
	                      type: "button",
	                      className: "playground-files-header-icon-button is-plain playground-tasks-detail-close-button",
	                      onClick: handleCloseTaskDetail,
	                      title: "Close task detail",
	                      "aria-label": "Close task detail",
	                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                  )
	                );
	          const taskDescriptionEditorTitle = isFullPageTaskDetail
	            ? React.createElement("input", {
	                type: "text",
	                className: "playground-tasks-ticket-editor-title-input",
	                value: taskTitleInputValue,
	                placeholder: "Untitled ticket",
	                "aria-label": "Ticket title",
	                title: taskTitleInputValue || "Untitled ticket",
	                onChange: (event) => setTaskTitleInputValue(event.target.value),
	                onBlur: commitTaskTitleInput,
	                readOnly: isTaskConfigLocked,
	                onKeyDown: (event) => {
	                  if (isTaskConfigLocked) {
	                    return;
	                  }
	                  if (event.key === "Enter") {
	                    event.preventDefault();
	                    event.currentTarget.blur();
	                    return;
	                  }
	                  if (event.key === "Escape") {
	                    event.preventDefault();
	                    taskTitleSkipCommitRef.current = true;
	                    setTaskTitleInputValue(draftTask.title || "");
	                    event.currentTarget.blur();
	                  }
	                },
	              })
	            : "Description";
	          const taskDetailMain = React.createElement("div", {
              className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
              ref: taskDetailMainRef,
            },
              taskDetailNavbar,
              React.createElement("div", { className: "playground-tasks-detail-body" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                React.createElement(PlatformInstructionsEditor, {
                  value: resolveTaskDescriptionAttachmentFiles(
                    String(draftTask.description || ""),
                    draftTask.attachments
                  ),
	                  onChange: handleTaskDescriptionEditorChange,
                  title: taskDescriptionEditorTitle,
                  placeholder: "Add description here",
                  ariaLabel: "Ticket description",
                  readOnly: isTaskConfigLocked,
                  historyKey: "ticket-description:" + draftTask.id,
                  variant: "minimalistic-ui",
                  contentVariant: "file-enabled",
                  fileUpload: {
                    upload: uploadTaskDescriptionFiles,
                    resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                    disabled: isTaskConfigLocked || taskAttachmentTransferState.isProcessing,
                    onActivate: (file) => {
                      const attachment = draftTask.attachments.find((item) =>
                        item.id === String(file?.attachmentId || "")
                      ) || null;
                      if (attachment) {
                        handleTaskAttachmentPreviewToggle(
                          buildResolvedTaskAttachmentRecord(attachment) || attachment
                        );
                      }
                    },
                    onRename: (file, nextName) => handleRenameTaskAttachment(
                      String(file?.attachmentId || ""),
                      nextName
                    ),
                    onRemove: (file) => handleRemoveTaskAttachment(
                      String(file?.attachmentId || "")
                    ),
                  },
                  onEditingChange: (editing) => {
                    setIsTaskDescriptionEditing(editing);
                    if (!editing) {
                      commitDraftTaskIfDirty();
                    }
                  },
                }),
                isFullPageTaskDetail ? null : renderTaskDetailFactsSection(),
                isPlaygroundSubtaskRecord(draftTask)
                  ? null
                  : React.createElement(PlatformSubtasks, {
                      className: "playground-tasks-ticket-subtasks",
                      appearance: "minimal",
                      disabled: isTaskConfigLocked,
                      onAdd: () => openProjectSubtaskIssueComposer(draftTask.id),
                      items: draftTaskSubtasks.map((subtask) => {
                        const isHumanSubtask = isHumanAssignedTask(subtask);
                        const isCanceledSubtask = subtask.status === "canceled";
                        return {
                          id: subtask.id,
                          taskType: "subtask",
                          className: isTaskPreviewStatusMenuOpen(subtask.id) ? "is-status-menu-open" : "",
                          style: getPlaygroundTaskColorStyle(subtask.taskColor),
                          leading: React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.9 }),
                          priority: renderPlaygroundTaskPriorityIcon(subtask.priority, "playground-tasks-backlog-priority"),
                          ticketNumber: taskTicketNumbersById[subtask.id] || subtask.ticketNumber || "000",
                          title: subtask.title || "Untitled Subtask",
                          completed: subtask.status === "done",
                          statusContent: renderTaskPreviewStatusControl(subtask),
                          assignee: renderTaskAssigneeAvatar(subtask, "playground-tasks-backlog-assignee-avatar"),
                          action: React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-backlog-run-button" + (isHumanSubtask && !isPlaygroundTaskTerminalStatus(subtask.status) ? " is-human-unchecked" : ""),
                            "aria-label": isCanceledSubtask
                              ? "Canceled task"
                              : (isHumanSubtask ? (subtask.status === "done" ? "Reopen task" : "Complete task") : "Run task"),
                            title: isCanceledSubtask
                              ? "Canceled"
                              : (isHumanSubtask ? (subtask.status === "done" ? "Reopen task" : "Complete task") : "Run task"),
                            disabled: isTaskConfigLocked || isCanceledSubtask || (isHumanSubtask
                              ? saveState.isSaving
                              : saveState.isSaving || isTaskThreadLaunchLocked(subtask)),
                            onClick: (event) => {
                              if (isHumanSubtask) {
                                void handleToggleTaskDone(subtask, event);
                                return;
                              }
                              event.stopPropagation();
                              void handleStartTaskThread(subtask);
                            },
                          },
                            isHumanSubtask
                              ? (
                                subtask.status === "done"
                                  ? React.createElement(Check, {
                                      width: 13,
                                      height: 13,
                                      strokeWidth: 2,
                                      "aria-hidden": "true",
                                    })
                                  : null
                              )
                              : React.createElement(Play, {
                                  width: 13,
                                  height: 13,
                                  strokeWidth: 1.9,
                                  fill: "currentColor",
                                  "aria-hidden": "true",
                                })
                          ),
                          onActivate: () => handleSelectTask(subtask.id, { screen: projectTaskDetailScreenOpen }),
                        };
                      }),
                    }),
                renderTaskActivitySection()
                ),
                renderTaskCommentDialog()
              )
            );
            const taskDetailPreview = previewedTaskAttachment
              ? React.createElement("div", {
                  className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-tasks-detail-preview-host",
                },
                  React.createElement(RunnerDocumentPreviewDrawer, {
                    attachment: previewedTaskAttachment,
                    backendUrl,
                    requestHeaders,
                    inline: true,
                    onClose: () => setPreviewedTaskAttachmentId(""),
                    showHeaderCopy: false,
                    showCloseButton: false,
                    showResizeHandle: false,
                  })
                )
              : null;
            const taskAttachmentPreviewPortalTarget = isFullPageTaskDetail
              && attachmentPreviewPortalId
              && typeof document !== "undefined"
              ? document.getElementById(attachmentPreviewPortalId)
              : null;

            if (isFullPageTaskDetail) {
              return React.createElement(React.Fragment, null,
                taskDetailBreadcrumbActionsPortal,
                React.createElement(TicketDetailPage, {
                    details: renderTaskDetailFactsSection({ contentOnly: true }),
                    preview: taskDetailPreview,
                    previewTitle: previewedTaskAttachment?.filename || "Attachment preview",
                    previewHeaderActions: previewedTaskAttachment
                      && isPreviewedTaskAttachmentEditable
                      && !isTaskConfigLocked
                      ? React.createElement(PlatformAttachmentActionMenu, {
                          name: previewedTaskAttachment.filename || "Attachment",
                          onRename: (nextName) => handleRenameTaskAttachment(previewedTaskAttachment.id, nextName),
                          onDelete: () => handleRemoveTaskAttachment(previewedTaskAttachment.id),
                        })
                      : null,
                    previewPortalTarget: taskAttachmentPreviewPortalTarget,
                    onPreviewClose: () => setPreviewedTaskAttachmentId(""),
                    sidebarPopoverOpen: Boolean(taskDetailSelectPopover || taskScheduleDialogState),
                  },
                  taskDetailMain
                )
              );
            }

	          return React.createElement("div", {
	              className: "playground-tasks-detail-shell"
	                + (previewedTaskAttachment ? " is-preview-open" : ""),
	            },
              taskDetailMain,
              React.createElement("div", { className: "playground-tasks-detail-preview-pane" }, taskDetailPreview)
            );
        }

        function renderProjectTaskDetailScreen() {
          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace playground-tasks-ticket-screen",
            },
            React.createElement("section", {
                className: "playground-environments-detail playground-tasks-project-workspace-detail playground-tasks-ticket-screen-detail",
              },
              React.createElement("div", {
                  className: "playground-environments-detail-scroll playground-tasks-project-workspace-scroll playground-tasks-ticket-screen-scroll",
                },
                React.createElement("div", { className: "playground-project-workspace-inner playground-tasks-ticket-screen-inner" },
                  React.createElement("div", { className: "playground-tasks-ticket-screen-panel" },
                    renderTaskDetail()
                  )
                )
              )
            )
          );
        }

        const isProjectTaskDetailScreenOpen = Boolean(
          projectTaskDetailScreenOpen
          && selectedProjectId
          && selectedTaskId
          && (taskView === "overview" || taskView === "backlog" || taskView === "board")
        );
        const isTaskDetailOpen = Boolean(
          selectedProjectId
          && selectedTaskId
          && taskView !== "threads"
          && !isProjectTaskDetailScreenOpen
          && taskView !== "backlog"
          && taskView !== "board"
        );
        const isScheduleDetailOpen = Boolean(isCalendarContext && scheduleViewMode === "setup");
        const isMissionControlDetailOpen = Boolean(selectedProjectId && missionControlStrategyOpen);
        const isDetailOpen = isTaskDetailOpen || isScheduleDetailOpen || isMissionControlDetailOpen;
        const isTaskAttachmentPreviewOpen = Boolean((isTaskDetailOpen || isScheduleDetailOpen) && previewedTaskAttachment);

        function renderProjectWallpaperTransitionLayer() {
          return null;
        }

        const isProjectInitialSetupModalOpen = Boolean(
          projectComposerOpen
          && projectComposerMode === "create"
          && !missionControlSetupOpen
          && !selectedProject
        );

        if (isDetailOnlyMode) {
          return React.createElement("div", { className: "playground-tasks-page is-inline-detail" },
            React.createElement("aside", { className: "playground-environments-detail playground-tasks-detail-panel is-inline-detail" },
              renderTaskDetail()
            ),
            renderTaskEnvironmentFilePicker(),
            renderTaskConnectorBrowser(),
            renderProjectConnectorBrowser(),
            renderBoardBlockedPickerDialog(),
            renderTaskParentPickerDialog(),
            renderTaskEnvironmentChangeDialog(),
            renderTaskDeleteDialog(),
            renderProjectIssueComposerDialog(),
            renderProjectComposerDialog(),
            renderReleaseComposerDialog(),
            renderCalendarUpgradeModal(),
            renderProjectAgentUpgradeModal(),
            renderProjectEnvironmentFilePicker()
          );
        }

        return React.createElement("div", { className: "playground-tasks-page" },
          renderProjectWallpaperTransitionLayer(),
          React.createElement("div", { className: "playground-tasks-shell" + (isDetailOpen ? " is-detail-open" : "") + (isTaskAttachmentPreviewOpen ? " is-preview-open" : "") },
            React.createElement("section", { className: "playground-tasks-main" },
              React.createElement("div", {
                  className: "playground-tasks-main-scroll" + (selectedProject || (projectComposerOpen && !isProjectInitialSetupModalOpen) || isStandaloneCalendarMode ? " is-project-workspace" : " is-projects-home"),
                  onClick: handleTaskSurfaceClick,
                },
                !selectedProject && (!projectComposerOpen || isProjectInitialSetupModalOpen) && !isStandaloneCalendarMode && !useUnifiedProjectNav
                  ? React.createElement("div", { className: "playground-content-nav playground-tasks-project-navbar playground-tasks-project-home-navbar playground-tasks-home-width" },
                      React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                        React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                          React.createElement("div", { className: "playground-content-title" }, "Projects")
                        )
                      ),
                      React.createElement("div", { className: "playground-content-nav-center" }),
                      React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions", ref: projectSidebarActionsRef },
                        React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-search-shell" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "search" ? " is-active" : ""),
                            onClick: () => setProjectSidebarPopover((current) => current === "search" ? "" : "search"),
                            title: "Search projects",
                          }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                          projectSidebarPopover === "search"
                            ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                React.createElement("div", { className: "playground-tasks-project-search-header" },
                                  React.createElement("div", { className: "playground-tasks-project-search-title" }, "Search Projects"),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-tasks-project-search-close",
                                    onClick: () => setProjectSidebarPopover(""),
                                  }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                                ),
                                React.createElement("div", { className: "playground-tasks-project-search-body" },
                                  React.createElement("div", { className: "playground-files-search-field" },
                                    React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                                    React.createElement("input", {
                                      type: "text",
                                      className: "playground-files-search-field-input",
                                      placeholder: "Search projects by name or description...",
                                      value: searchQuery,
                                      onChange: (event) => setSearchQuery(event.target.value),
                                    })
                                  ),
                                  React.createElement("div", { className: "playground-tasks-project-search-hint" }, "Filter projects by name, description, open tasks, threads, or environments.")
                                )
                              )
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button",
                          onClick: () => openProjectComposer(),
                          title: "New project",
                        }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 }))
                      )
                    )
                  : null,
                !selectedProject && !isStandaloneCalendarMode && projectLoadState.status === "error" && projects.length > 0
                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-home-width" },
                      React.createElement("span", null, projectLoadState.error || "Failed to refresh projects."),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => void loadProjects(),
                      }, "Retry")
                    )
                  : null,
                isStandaloneCalendarMode
                  ? renderStandaloneCalendarWorkspace()
                  : projectComposerOpen && !selectedProject && !isProjectInitialSetupModalOpen
                    ? renderProjectComposerSetupWorkspace()
                    : selectedProject
                      ? (isProjectTaskDetailScreenOpen ? renderProjectTaskDetailScreen() : renderSelectedProjectWorkspace())
                      : renderProjectLanding()
              )
            ),
            React.createElement("aside", { className: "playground-environments-detail playground-tasks-detail-panel" + (isTaskDetailOpen || isScheduleDetailOpen ? " is-project-task-detail" : "") },
              isDetailOpen ? renderTaskDetail() : null
            )
          ),
          renderTaskEnvironmentFilePicker(),
          renderTaskConnectorBrowser(),
          renderProjectConnectorBrowser(),
          renderBoardBlockedPickerDialog(),
          renderTaskParentPickerDialog(),
          renderTaskEnvironmentChangeDialog(),
          renderTaskDeleteDialog(),
          renderMissionControlStudio(),
          renderProjectIssueComposerDialog(),
          renderProjectComposerDialog(),
          renderReleaseComposerDialog(),
          renderCalendarUpgradeModal(),
          renderProjectAgentUpgradeModal(),
          renderProjectEnvironmentFilePicker()
        );
      }

`;
