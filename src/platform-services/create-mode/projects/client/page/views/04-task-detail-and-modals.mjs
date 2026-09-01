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
                if (nextOpen && normalizedPopoverId === "reviewer") {
                  setTaskDetailAssigneePopupMode(defaultTaskReviewerPopupMode);
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
              popupSearch,
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

          function renderTaskDetailAgentSelectControl({
            popoverId,
            value,
            valueLabel,
            disabled = false,
            isEmpty = false,
            options = [],
            emptyContent = "No matching agents or squads.",
            searchPlaceholder = "Search agents...",
          }) {
            const normalizedPopoverId = String(popoverId || "agent").trim() || "agent";
            return React.createElement(PlatformAgentSelector, {
              value: String(value || ""),
              options: Array.isArray(options) ? options : [],
              onValueChange: (_nextValue, option) => {
                if (typeof option?.data?.onSelect === "function") {
                  option.data.onSelect();
                }
              },
              ariaLabel: "Select ticket " + normalizedPopoverId.replace(/-/g, " "),
              placeholder: valueLabel,
              disabled,
              open: taskDetailSelectPopover === normalizedPopoverId,
              onOpenChange: (nextOpen) => {
                setTaskDetailSelectPopover(nextOpen ? normalizedPopoverId : "");
                setTaskDetailPopover("");
                setTaskSkillsPopoverOpen(false);
              },
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              searchPlaceholder,
              searchAriaLabel: "Search ticket " + normalizedPopoverId + " options",
              emptyContent,
              popupWidth: "min(280px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight: "min(320px, calc(100vh - 120px))",
              className: "playground-tasks-detail-central-selector" + (isEmpty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: "playground-tasks-detail-central-selector-popup playground-tasks-detail-assignee-selector-popup",
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

          function getTaskActivityTimestampValue(value) {
            if (value && typeof value === "object" && !Array.isArray(value)) {
              const seconds = Number(value.seconds ?? value._seconds ?? value.epochSeconds);
              if (Number.isFinite(seconds) && seconds > 0) {
                return seconds < 100000000000 ? seconds * 1000 : seconds;
              }
              if (typeof value.toDate === "function") {
                try {
                  const dateValue = value.toDate();
                  const dateTimestamp = dateValue instanceof Date ? dateValue.getTime() : Date.parse(String(dateValue || ""));
                  return Number.isFinite(dateTimestamp) ? dateTimestamp : 0;
                } catch {}
              }
            }
            if (typeof value === "number" && Number.isFinite(value) && value > 0) {
              return value < 100000000000 ? value * 1000 : value;
            }
            const normalizedValue = String(value || "").trim();
            if (!normalizedValue) {
              return 0;
            }
            const timestamp = Date.parse(normalizedValue);
            return Number.isFinite(timestamp) ? timestamp : 0;
          }

          function getTaskActivityEventTimestamp(event) {
            return getTaskActivityTimestampValue(
              event?.createdAt
                ?? event?.created_at
                ?? event?.timestamp
                ?? event?.occurredAt
                ?? event?.occurred_at
                ?? event?.comment?.createdAt
            );
          }

          function getTaskActivityEvents() {
            // Some task detail payloads arrive before the normalized task id is
            // copied onto draftTask. Keep the selected route id as the stable
            // identity so the guaranteed creation event is not discarded by
            // activity normalization during that short loading window.
            const taskIdentity = String(draftTask?.id || selectedTaskId || draftTask?.ticketNumber || "").trim();
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
                const leftTime = getTaskActivityEventTimestamp(left);
                const rightTime = getTaskActivityEventTimestamp(right);
                return leftTime - rightTime;
              });
            });
            const threadsById = new Map(selectedTaskThreads.map((thread) => [String(thread?.id || "").trim(), thread]));
            const creator = getTaskCreatorIdentity(draftTask);
            const taskCreatedAt = getTaskActivityTimestampValue(draftTask.createdAt);
            // The project workspace already loads the canonical task activity
            // feed (including status, priority, assignment, rename, and
            // milestone mutations). Reuse that same feed here and filter it
            // to the selected ticket. Detail responses from older deployments
            // sometimes contain only comments plus the synthetic creation
            // record, so relying exclusively on draftTask.activity makes the
            // ticket timeline silently lose those mutation events.
            const canonicalProjectActivityEvents = typeof getProjectActivityEventsForTask === "function"
              ? getProjectActivityEventsForTask(taskIdentity)
              : [];
            const canonicalActivityRecords = [
              ...(Array.isArray(draftTask.activity) ? draftTask.activity : []),
              ...(Array.isArray(draftTask.activityEvents) ? draftTask.activityEvents : []),
              ...(Array.isArray(draftTask.details?.activity) ? draftTask.details.activity : []),
              ...(Array.isArray(draftTask.details?.activityEvents) ? draftTask.details.activityEvents : []),
              ...canonicalProjectActivityEvents,
            ];
            const knownActivityTimestamps = [
              ...canonicalActivityRecords,
              ...comments,
              ...selectedTaskThreads,
            ].map(getTaskActivityEventTimestamp).filter((timestamp) => timestamp > 0);
            const inferredCreatedAt = taskCreatedAt > 0
              ? new Date(taskCreatedAt).toISOString()
              : knownActivityTimestamps.length > 0
                ? new Date(Math.max(0, Math.min(...knownActivityTimestamps) - 1)).toISOString()
                : String(draftTask.updatedAt || new Date().toISOString());
            const syntheticEvents = [{
              id: "task_activity_created_" + taskIdentity,
              eventType: "created",
              sourceId: taskIdentity,
              actorType: creator.type,
              actorUserId: creator.type === "user" ? (draftTask.createdByUserId || currentUserId || "") : undefined,
              actorAgentId: creator.type === "agent" ? (draftTask.creator?.agentId || undefined) : undefined,
              actorName: creator.name,
              actorAvatarUrl: creator.photoUrl,
              createdAt: inferredCreatedAt,
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

            const normalizedEvents = normalizePlaygroundTaskActivityList([
              ...canonicalActivityRecords,
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
            // Ticket activity follows the same newest-first convention as the
            // project Progress feed. This also keeps events with missing or
            // delayed timestamps from appearing before ticket creation.
            return normalizedEvents.sort((left, right) => {
              const timestampDifference = getTaskActivityEventTimestamp(right)
                - getTaskActivityEventTimestamp(left);
              if (timestampDifference) {
                return timestampDifference;
              }
              if (left.eventType === "created" && right.eventType !== "created") {
                return 1;
              }
              if (right.eventType === "created" && left.eventType !== "created") {
                return -1;
              }
              return String(right.id || "").localeCompare(String(left.id || ""));
            });
          }

          function formatTaskActivityFieldValue(fieldName, value) {
            const normalizedValue = value === null || value === undefined ? "" : String(value).trim();
            if (!normalizedValue) {
              return "";
            }
            if (fieldName === "status") {
              return getPlaygroundTaskStatusLabel(normalizedValue);
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

          function getTaskActivityAssignmentTarget(event) {
            const fieldName = String(event?.fieldName || "").trim().toLowerCase();
            if (!["assigneeagentid", "assigneeid"].includes(fieldName)) {
              return null;
            }
            const rawValue = event?.nextValue;
            const valueObject = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)
              ? rawValue
              : {};
            const assigneeId = decodeSharedProjectActivityFieldValue(rawValue, ["id", "agentId", "userId", "value"]);
            if (!assigneeId) {
              return null;
            }
            const explicitName = String(
              valueObject.name
                || valueObject.displayName
                || valueObject.display_name
                || valueObject.fullName
                || valueObject.full_name
                || event?.nextValueName
                || event?.assigneeName
                || ""
            ).trim();
            const assigneeName = String(
              explicitName
                || (typeof getTaskAssigneeName === "function" ? getTaskAssigneeName(assigneeId, assigneeId) : assigneeId)
                || assigneeId
            ).trim() || "Agent";
            const avatar = typeof renderTaskActorAvatar === "function"
              ? renderTaskActorAvatar(assigneeId, "playground-project-activity-line__assignee-avatar")
              : typeof renderAgentNameAvatar === "function"
                ? renderAgentNameAvatar(
                    assigneeName,
                    "playground-project-activity-line__assignee-avatar",
                    valueObject.photoUrl || valueObject.photoURL || valueObject.avatarUrl || valueObject.avatarURL || ""
                  )
                : null;
            return { id: assigneeId, name: assigneeName, avatar };
          }

          function renderTaskActivitySharedLine(event) {
            const normalizedEvent = typeof normalizePlaygroundTaskActivityRecord === "function"
              ? normalizePlaygroundTaskActivityRecord(event) || event
              : event;
            const isThread = normalizedEvent?.eventType === "thread_started";
            const thread = normalizedEvent?.thread || null;
            const threadId = String(
              normalizedEvent?.threadId
                || thread?.id
                || normalizedEvent?.sourceId
                || ""
            ).trim();
            const taskId = String(draftTask?.id || selectedTaskId || "").trim();
            const persistedTask = taskId && tasksById ? tasksById[taskId] || null : null;
            const storedTicketNumber = String(
              persistedTask?.ticketNumber || draftTask?.ticketNumber || ""
            ).trim();
            const canonicalTicketNumber = String(
              (taskId && taskTicketNumbersById ? taskTicketNumbersById[taskId] : "")
                || (typeof formatPlaygroundProjectTicketNumber === "function"
                  ? formatPlaygroundProjectTicketNumber(selectedProject, storedTicketNumber)
                  : "")
                || storedTicketNumber
                || ""
            ).trim();
            const activityTask = typeof normalizePlaygroundTaskRecord === "function"
              ? normalizePlaygroundTaskRecord({
                  ...(persistedTask || {}),
                  ...(draftTask || {}),
                  id: taskId,
                  ticketNumber: canonicalTicketNumber,
                  taskType: draftTask?.taskType || draftTask?.type || persistedTask?.taskType || persistedTask?.type || "task",
                })
              : {
                  ...(persistedTask || {}),
                  ...(draftTask || {}),
                  id: taskId,
                  ticketNumber: canonicalTicketNumber,
                };
            const source = {
              ...normalizedEvent,
              id: isThread ? threadId : normalizedEvent?.id,
              task: activityTask,
              taskId,
            };
            const sharedEvent = {
              id: normalizedEvent.id,
              eventType: isThread
                ? "threads"
                : typeof getProjectActivityTaskEventType === "function"
                  ? getProjectActivityTaskEventType(normalizedEvent)
                  : "issue_progress",
              presentation: "line",
              isThreadRecord: isThread,
              timestamp: getTaskActivityEventTimestamp(normalizedEvent),
              source,
            };
            if (isThread) {
              const timestamp = getTaskActivityEventTimestamp(normalizedEvent);
              return renderSharedProjectTaskActivityLine(sharedEvent, {
                task: activityTask,
                taskId,
                ticketNumber: canonicalTicketNumber,
                actorName: getTaskActivityActorName(normalizedEvent) || "Agent",
                actorAvatar: renderTaskActivityActorAvatar(normalizedEvent),
                fallbackSummary: renderTaskActivityEventSummary(normalizedEvent),
                timeLabel: timestamp
                  ? formatRelativeThreadTime(new Date(timestamp).toISOString())
                  : "",
                showTaskReference: false,
                onActivate: thread ? () => openTaskDetailThread(thread, "chat") : undefined,
              });
            }
            const fieldName = String(normalizedEvent?.fieldName || "").trim().toLowerCase();
            const milestoneId = ["releaseid", "milestoneid"].includes(fieldName)
              ? decodeSharedProjectActivityFieldValue(normalizedEvent?.nextValue, ["id", "releaseId", "milestoneId", "value"])
              : "";
            const milestone = milestoneId
              ? releasesById?.[milestoneId]
                || (Array.isArray(releases)
                  ? releases.find((release) => String(release?.id || "").trim() === milestoneId)
                  : null)
              : null;
            const timestamp = getTaskActivityEventTimestamp(normalizedEvent);
            return renderSharedProjectTaskActivityLine(sharedEvent, {
              task: activityTask,
              taskId,
              ticketNumber: canonicalTicketNumber,
              actorName: getTaskActivityActorName(normalizedEvent) || "Someone",
              actorAvatar: renderTaskActivityActorAvatar(normalizedEvent),
              milestoneName: String(
                milestone?.name
                  || milestone?.title
                  || normalizedEvent?.nextValueName
                  || formatTaskActivityFieldValue(normalizedEvent?.fieldName, normalizedEvent?.nextValue)
                  || ""
              ).trim(),
              assignmentTarget: getTaskActivityAssignmentTarget(normalizedEvent),
              fallbackSummary: renderTaskActivityEventSummary(normalizedEvent),
              timeLabel: timestamp
                ? formatRelativeThreadTime(new Date(timestamp).toISOString())
                : "",
            });
          }

          function renderTaskActivitySection() {
            const normalizedDraftTaskStatus = String(draftTask.status || "").trim().toLowerCase();
            const isHumanReviewerForTask = isPlaygroundHumanAssigneeId(draftTask.reviewerAgentId);
            const canHumanReviewTask = normalizedDraftTaskStatus === "in_review" && isHumanReviewerForTask;
            const activitySubscriptionMatchesTask = taskActivitySubscriptionState.taskId === draftTask.id;
            const activitySubscribed = activitySubscriptionMatchesTask
              && Boolean(taskActivitySubscriptionState.subscribed);
            const activitySubscriptionPending = activitySubscriptionMatchesTask
              && ["loading", "saving"].includes(taskActivitySubscriptionState.status);
            const activityItems = getTaskActivityEvents().map((event) => {
              const comment = event.comment;
              const thread = event.thread;
              const isComment = event.eventType === "comment_added" && comment;
              const isThread = event.eventType === "thread_started";
              const isStatus = event.eventType === "status_changed";
              const isFieldChange = event.eventType === "field_changed";
              const isPriorityChange = isFieldChange
                && String(event.fieldName || "").trim().toLowerCase() === "priority";
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
                isComment: Boolean(isComment),
                sharedLine: isComment ? null : renderTaskActivitySharedLine(event),
                tone: isComment ? "comment" : isThread ? "thread" : isStatus ? "status" : "created",
                summary: isComment
                  ? getTaskCommentDisplayName(comment)
                  : renderTaskActivityEventSummary(event),
                timestamp: formatRelativeThreadTime(event.createdAt) || formatPlaygroundFileDate(event.createdAt),
                avatar: isStatus
                  ? renderPlaygroundTaskStatusGlyph(
                      event.nextValue,
                      "platform-activity-timeline__status-icon"
                    )
                  : isPriorityChange
                    ? renderPlaygroundTaskPriorityIcon(
                        event.nextValue,
                        "platform-activity-timeline__priority-icon"
                      )
                  : isFieldChange
                    ? null
                    : renderTaskActivityActorAvatar(event),
                icon: isMilestoneChange
                  ? Milestone
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
                      ...getProjectMentionComposerProps(),
                      onSubmit: (body, mentions) => handleAddTaskComment({
                        inline: true,
                        parentCommentId: comment.id,
                        body,
                        mentions,
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
            const renderableActivityItems = activityItems.filter((item) => item.sharedLine || item.isComment);
            const selectedActivityTaskId = String(selectedTaskId || "").trim();
            const renderedActivityTaskId = String(draftTask?.id || "").trim();
            const activityTimelineStatus = String(taskActivityTimelineState?.status || "idle").trim().toLowerCase();
            const activityTimelineLoading = Boolean(selectedActivityTaskId) && (
              renderedActivityTaskId !== selectedActivityTaskId
              || String(taskActivityTimelineState?.taskId || "").trim() !== selectedActivityTaskId
              || ["idle", "loading"].includes(activityTimelineStatus)
            );
            const visibleRenderableActivityItems = renderableActivityItems.slice(
              0,
              Math.max(20, taskActivityVisibleEventCount)
            );
            taskActivityTimelineHasMoreRef.current = !activityTimelineLoading
              && visibleRenderableActivityItems.length < renderableActivityItems.length;
            const activityHeaderActions = React.createElement(React.Fragment, null,
              React.createElement(PlatformSecondaryButton, {
                type: "button",
                size: "small",
                className: "playground-tasks-activity-subscription-button",
                disabled: activitySubscriptionPending,
                "aria-pressed": activitySubscribed,
                title: activitySubscriptionMatchesTask
                  ? taskActivitySubscriptionState.error || undefined
                  : undefined,
                onClick: () => void handleToggleTaskActivitySubscription(),
              },
              React.createElement(activitySubscribed ? UserRoundMinus : UserRoundPlus, {
                width: 14,
                height: 14,
                strokeWidth: 1.8,
                "aria-hidden": "true",
              }),
              activitySubscribed ? "Unsubscribe" : "Subscribe"),
              canHumanReviewTask
                ? React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    size: "small",
                    disabled: saveState.isSaving,
                    onClick: () => void handleApproveTaskReview(),
                  }, "Approve")
                : null
            );
            const activityComposer = {
              ...getProjectMentionComposerProps(),
              value: taskActivityCommentValue,
              onChange: (nextValue) => {
                setTaskActivityCommentValue(nextValue);
                if (taskActivityCommentError) {
                  setTaskActivityCommentError("");
                }
              },
              onSubmit: async (files, mentions, body) => Boolean(await handleAddTaskComment({
                inline: true,
                body: typeof body === "string" ? body : taskActivityCommentValue,
                files,
                mentions,
              })),
              allowAttachments: true,
              disabled: isTaskConfigLocked,
              submitting: taskActivityCommentPending,
              errorMessage: taskActivityCommentError,
            };
            return React.createElement("section", {
                className: "platform-activity-timeline playground-tasks-activity",
                ref: taskActivityTimelineRef,
                "aria-busy": activityTimelineLoading || taskActivityIncrementalLoading,
              },
              React.createElement("header", { className: "platform-activity-timeline__header" },
                React.createElement("div", { className: "platform-activity-timeline__pane-heading" },
                  React.createElement("h2", { className: "platform-activity-timeline__title" }, "Activity")
                ),
                React.createElement("div", { className: "platform-activity-timeline__header-actions" }, activityHeaderActions)
              ),
              activityTimelineLoading
                ? React.createElement(PlatformLoadingState, {
                    className: "playground-tasks-activity__loading",
                    message: "Loading ticket activity...",
                    centered: true,
                  })
              : visibleRenderableActivityItems.length > 0
                ? React.createElement("ol", { className: "platform-activity-timeline__list" },
                    visibleRenderableActivityItems.map((item) => {
                      // Activity mutations and thread starts must always use the
                      // shared compact project activity line. Never fall back to
                      // a comment card for a non-comment event: that produced
                      // empty rounded cards whenever the shared renderer was not
                      // available during a hot reload.
                      if (item.sharedLine) {
                        return React.createElement("li", {
                          key: item.id,
                          className: "platform-activity-timeline__item playground-tasks-activity-shared-line-item",
                        }, item.sharedLine);
                      }
                      if (!item.isComment) {
                        return null;
                      }
                      return React.createElement("li", {
                        key: item.id,
                        className: "platform-activity-timeline__item has-content is-comment",
                      },
                        React.createElement(PlatformCommentCard, {
                          author: item.summary,
                          timestamp: item.timestamp,
                          avatar: item.avatar,
                          content: item.content,
                          replies: item.replies,
                          replyComposer: item.replyComposer,
                          actions: item.actions,
                        })
                      );
                    })
                  )
                : React.createElement(PlatformEmptyState, {
                    className: "platform-activity-timeline__empty",
                    title: "No activity yet",
                  }),
              !activityTimelineLoading && taskActivityIncrementalLoading
                ? React.createElement(PlatformLoadingState, {
                    className: "playground-tasks-activity__incremental-loading",
                    message: "Loading more activity...",
                    centered: true,
                  })
                : null,
              React.createElement(PlatformCommentComposer, activityComposer)
            );
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
                ...getProjectMentionComposerProps(),
                onMentionSelect: (mention) => setTaskCommentMentions((current) => (
                  mergeProjectMentionReference(current, mention)
                )),
                className: "playground-tasks-comment-modal-instructions",
              }),
              saveState.error
                ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, saveState.error)
                : null
            );
          }

          function renderTaskWorkActionControl() {
            const workActionConfiguration = getTaskWorkActionConfiguration(draftTask, {
              locked: isTaskConfigLocked,
            });

            return React.createElement("div", {
                className: "playground-tasks-detail-work-control",
              },
              React.createElement(PlatformButtonSelector, {
                  mode: "split-action",
                  buttonVariant: "primary",
                  buttonSize: "small",
                  label: workActionConfiguration.mainActionLabel,
                  actionAriaLabel: workActionConfiguration.mainActionLabel,
                  popupAriaLabel: "Ticket work options",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupAlignment: "left",
                  matchTriggerWidth: true,
                  fullWidth: true,
                  closeOnSelect: true,
                  actionDisabled: workActionConfiguration.mainActionDisabled,
                  popupDisabled: false,
                  className: "playground-tasks-detail-work-selector",
                  popupClassName: "playground-tasks-detail-work-selector-popup",
                  onAction: () => runTaskWorkPrimaryAction(draftTask, workActionConfiguration),
                },
                renderTaskWorkActionMenuItems(draftTask, {
                  configuration: workActionConfiguration,
                })
              )
            );
          }

          function updateTaskDetailLoop(patch) {
            updateDraftTask((current) => ({
              ...current,
              loop: normalizePlaygroundTaskLoopConfig({
                ...normalizePlaygroundTaskLoopConfig(current.loop, current),
                ...patch,
              }, current),
            }), { autosave: true });
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
            const activeTaskLoop = activeTaskType === "loop"
              ? normalizePlaygroundTaskLoopConfig(draftTask.loop, draftTask)
              : null;
            const taskDetailVerifierAgents = activeTaskType === "loop"
              ? assignableActors.filter((actor) => (
                  getPlaygroundTaskAssigneePopupMode(actor) === "agents"
                  && actor?.id
                ))
              : [];
            const selectedTaskDetailVerifier = activeTaskLoop?.verifierAgentId
              ? taskDetailVerifierAgents.find((agent) => agent.id === activeTaskLoop.verifierAgentId) || null
              : null;
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
                      popupSearch: {
                        value: taskDetailStatusSearchQuery,
                        onChange: (event) => setTaskDetailStatusSearchQuery(event.target.value),
                        placeholder: "Change status...",
                        shortcut: "S",
                        autoFocus: taskDetailSelectPopover === "status",
                        "aria-label": "Search ticket statuses",
                      },
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
                        popupSearch: {
                          value: taskDetailTypeSearchQuery,
                          onChange: (event) => setTaskDetailTypeSearchQuery(event.target.value),
                          placeholder: "Change type...",
                          shortcut: "T",
                          autoFocus: taskDetailSelectPopover === "type",
                          "aria-label": "Search ticket types",
                        },
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
                      popupSearch: {
                        value: taskDetailPrioritySearchQuery,
                        onChange: (event) => setTaskDetailPrioritySearchQuery(event.target.value),
                        placeholder: "Change priority...",
                        shortcut: "P",
                        autoFocus: taskDetailSelectPopover === "priority",
                        "aria-label": "Search ticket priorities",
                      },
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
                activeTaskType === "loop"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Verifier"),
                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                          renderTaskDetailSelectControl({
                            popoverId: "loop-verifier",
                            value: activeTaskLoop.verifierAgentId || "__automatic__",
                            valueLabel: selectedTaskDetailVerifier
                              ? getTaskAssigneeName(selectedTaskDetailVerifier.id, selectedTaskDetailVerifier.name || "Verifier")
                              : "Automatic",
                            disabled: isTaskConfigLocked,
                            isEmpty: !selectedTaskDetailVerifier,
                            buttonContent: selectedTaskDetailVerifier
                              ? renderTaskDetailPersonValue(
                                  selectedTaskDetailVerifier.id,
                                  getTaskAssigneeName(selectedTaskDetailVerifier.id, selectedTaskDetailVerifier.name || "Verifier")
                                )
                              : React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, "Automatic"),
                            popupClassName: "playground-tasks-detail-assignee-selector-popup",
                            options: [
                              createTaskDetailSelectorOption({
                                value: "__automatic__",
                                label: "Automatic",
                                description: "Use an isolated verifier run with the selected worker agent.",
                                onSelect: () => updateTaskDetailLoop({ verifierAgentId: null }),
                              }),
                              ...taskDetailVerifierAgents.map((agent) => createTaskDetailSelectorOption({
                                value: agent.id,
                                label: getTaskAssigneeName(agent.id, agent.name || "Verifier"),
                                description: "Run this agent in a read-only verifier context.",
                                leading: renderTaskActorAvatar(agent.id, "playground-tasks-detail-person-menu-avatar"),
                                onSelect: () => updateTaskDetailLoop({ verifierAgentId: agent.id }),
                              })),
                            ],
                          })
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "On regression"),
                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                          renderTaskDetailSelectControl({
                            popoverId: "loop-regression",
                            value: activeTaskLoop.regressionPolicy,
                            valueLabel: activeTaskLoop.regressionPolicy === "continue" ? "Continue" : "Stop safely",
                            disabled: isTaskConfigLocked,
                            options: [
                              createTaskDetailSelectorOption({
                                value: "stop",
                                label: "Stop safely",
                                description: "Stop when a candidate scores materially below the best result.",
                                onSelect: () => updateTaskDetailLoop({ regressionPolicy: "stop" }),
                              }),
                              createTaskDetailSelectorOption({
                                value: "continue",
                                label: "Continue",
                                description: "Allow later iterations to recover from a regression.",
                                onSelect: () => updateTaskDetailLoop({ regressionPolicy: "continue" }),
                              }),
                            ],
                          })
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-tasks-detail-fact" },
                      React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Reviewer"),
                      React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                        renderTaskDetailAgentSelectControl({
                          popoverId: "reviewer",
                          value: draftTask.reviewRequired && resolvedTaskReviewerId ? resolvedTaskReviewerId : "__none__",
                          valueLabel: activeReviewerLabel,
                          disabled: isTaskConfigLocked,
                          isEmpty: !draftTask.reviewRequired,
                          options: [
                            {
                              value: "__none__",
                              name: "No review",
                              searchText: "Move directly to Done when work is done.",
                              data: {
                                onSelect: () => updateDraftTask((current) => ({
                                  ...current,
                                  reviewRequired: false,
                                  reviewerAgentId: null,
                                }), { autosave: true }),
                              },
                            },
                            ...assignableActors.map((actor) => {
                              const mode = getPlaygroundTaskAssigneePopupMode(actor);
                              return {
                                value: actor.id,
                                name: getTaskAssigneeName(actor.id, actor.name || "Reviewer"),
                                avatarUrl: getTaskActorPhotoUrl(actor.id),
                                searchText: mode === "humans" ? "Human reviewer" : mode === "teams" ? "Agent squad reviewer" : "Agent reviewer",
                                data: {
                                  onSelect: () => updateDraftTask((current) => ({
                                    ...current,
                                    reviewRequired: true,
                                    reviewerAgentId: actor.id,
                                  }), { autosave: true }),
                                },
                              };
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
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Color"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "color",
                      value: getPlaygroundTaskColorId(draftTask.taskColor),
                      valueLabel: activeTaskColorPresentation.label,
                      disabled: isTaskConfigLocked,
                      buttonContent: renderPlaygroundTaskColorValue(draftTask.taskColor),
                      options: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                        createTaskDetailSelectorOption({
                          value: option.id,
                          label: option.label,
                          leading: renderPlaygroundTaskColorSwatch(option.id, "playground-tasks-detail-color-menu-swatch"),
                          onSelect: () => updateDraftField("taskColor", option.id, { autosave: true }),
                        })
                      ),
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
                    renderTaskDetailAgentSelectControl({
                      popoverId: "assignee",
                      value: resolvedTaskAssigneeId,
                      valueLabel: activeAssigneeLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !resolvedTaskAssigneeId,
                      emptyContent: "No assignees yet.",
                      options: assignableActors.map((actor) => {
                        const mode = getPlaygroundTaskAssigneePopupMode(actor);
                        return {
                          value: actor.id,
                          name: getTaskAssigneeName(actor.id, actor.name || "Unknown"),
                          avatarUrl: getTaskActorPhotoUrl(actor.id),
                          searchText: mode === "humans" ? "Human" : mode === "teams" ? "Agent squad" : "Agent",
                          data: {
                            onSelect: () => updateDraftField("assigneeAgentId", actor.id, { autosave: true }),
                          },
                        };
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
	          const taskDetailBreadcrumbCanRunHumanTask = isHumanAssignedTask(draftTask);
	          const taskDetailBreadcrumbStartedThreadId = getTaskStartedThreadId(draftTask);
	          const closeTaskDetailBreadcrumbActions = () => setTaskDetailPopover("");
	          const taskDetailBreadcrumbActionsPortal = taskDetailBreadcrumbActionsPortalTarget
	            ? createPortal(
	                React.createElement(PlatformResourceHeaderActions, {
	                    className: "playground-tasks-ticket-breadcrumb-actions",
	                  },
	                  React.createElement(PlatformResourceActionsMenu, {
	                      open: taskDetailPopover === "menu",
	                      onOpenChange: (nextOpen) => setTaskDetailPopover(nextOpen ? "menu" : ""),
	                      resourceLabel: "Ticket",
	                      disabled: saveState.isSaving,
	                      shortcutActions: {
	                        delete: {
	                          onInvoke: () => {
	                            closeTaskDetailBreadcrumbActions();
	                            void handleDeleteTask(draftTask.id);
	                          },
	                          disabled: saveState.isSaving,
	                        },
	                      },
	                    },
	                    React.createElement(PlatformResourceActionsInformation, {
	                      resourceLabel: "Ticket",
	                      items: [
	                        {
	                          id: "id",
	                          label: "ID",
	                          value: draftTask.id,
	                          title: draftTask.id,
	                          monospace: true,
	                        },
	                        {
	                          id: "created",
	                          label: "Created",
	                          value: formatPlaygroundFileDate(draftTask.createdAt) || "—",
	                        },
	                        {
	                          id: "updated",
	                          label: "Updated",
	                          value: formatPlaygroundFileDate(draftTask.updatedAt) || "—",
	                        },
	                      ],
	                    }),
	                    React.createElement(PlatformResourceActionsDivider, null),
	                    React.createElement(PlatformResourceActionMenuItem, {
	                      icon: taskDetailBreadcrumbCanRunHumanTask
	                        ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
	                        : React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                      label: taskDetailBreadcrumbCanRunHumanTask
	                        ? (draftTask.status === "done" ? "Reopen task" : "Mark complete")
	                        : "Run thread",
	                      disabled: taskDetailBreadcrumbCanRunHumanTask
	                        ? saveState.isSaving
	                        : saveState.isSaving || isTaskThreadLaunchLocked(draftTask),
	                      onClick: () => {
	                        closeTaskDetailBreadcrumbActions();
	                        if (taskDetailBreadcrumbCanRunHumanTask) {
	                          void handleToggleTaskDone(draftTask);
	                          return;
	                        }
	                        void handleStartTaskThread(draftTask);
	                      },
	                    }),
	                    taskDetailBreadcrumbStartedThreadId
	                      ? React.createElement(PlatformResourceActionMenuItem, {
	                          icon: React.createElement(RotateCcw, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                          label: "Revert Changes",
	                          disabled: saveState.isSaving,
	                          onClick: () => {
	                            closeTaskDetailBreadcrumbActions();
	                            handleOpenTaskThreadChanges(draftTask);
	                          },
	                        })
	                      : null,
	                    React.createElement(PlatformResourceActionsDivider, null),
	                    React.createElement(PlatformResourceActionMenuItem, {
	                      icon: React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                      label: "Delete",
	                      shortcut: "delete",
	                      danger: true,
	                      disabled: saveState.isSaving,
	                      onClick: () => {
	                        closeTaskDetailBreadcrumbActions();
	                        void handleDeleteTask(draftTask.id);
	                      },
	                    })
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
	                  },
	                    React.createElement("div", { className: "playground-tasks-detail-navbar-status" },
	                      renderTaskPreviewStatusControl(draftTask)
	                    ),
	                    React.createElement(PlatformResourceActionsMenu, {
	                        open: taskDetailPopover === "menu",
	                        onOpenChange: (nextOpen) => setTaskDetailPopover(nextOpen ? "menu" : ""),
	                        resourceLabel: "Ticket",
	                        disabled: saveState.isSaving,
	                        placement: "bottom-end",
	                        width: 272,
	                      },
	                      renderTaskActionsMenu(draftTask, {
	                        closeMenu: () => setTaskDetailPopover(""),
	                        includeFullScreenAction: true,
	                      })
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
	          const taskDescriptionEditor = React.createElement(PlatformInstructionsEditor, {
              value: resolveTaskDescriptionAttachmentFiles(
                String(draftTask.description || ""),
                draftTask.attachments
              ),
	              onChange: handleTaskDescriptionEditorChange,
              title: taskDescriptionEditorTitle,
              placeholder: "Add description here",
              ariaLabel: activeTaskType === "loop" ? "Loop goal" : "Ticket description",
              readOnly: isTaskConfigLocked,
              historyKey: "ticket-description:" + draftTask.id,
              stickyHeader: !isDetailOnlyMode,
              variant: "minimalistic-ui",
              contentVariant: "file-enabled",
              promptInsertion: typeof onOpenPromptSearch === "function"
                ? { openSearch: onOpenPromptSearch }
                : undefined,
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
            });
	          const taskDescriptionContent = activeTaskType === "loop"
	            ? React.createElement(React.Fragment, null,
	              taskDescriptionEditor,
	              renderPlaygroundTaskLoopFields({
	                task: draftTask,
	                inputIdPrefix: "playground-task-detail-loop-",
	                disabled: isTaskConfigLocked,
	                onChange: updateTaskDetailLoop,
	              })
	            )
	            : taskDescriptionEditor;
	          const taskDetailMain = React.createElement("div", {
              className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
              ref: taskDetailMainRef,
            },
              taskDetailNavbar,
              React.createElement("div", { className: "playground-tasks-detail-body" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                taskDescriptionContent,
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
                          action: isHumanSubtask
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-backlog-run-button" + (!isPlaygroundTaskTerminalStatus(subtask.status) ? " is-human-unchecked" : ""),
                                "aria-label": isCanceledSubtask
                                  ? "Canceled task"
                                  : (subtask.status === "done" ? "Reopen task" : "Complete task"),
                                title: isCanceledSubtask
                                  ? "Canceled"
                                  : (subtask.status === "done" ? "Reopen task" : "Complete task"),
                                disabled: isTaskConfigLocked || isCanceledSubtask || saveState.isSaving,
                                onClick: (event) => {
                                  void handleToggleTaskDone(subtask, event);
                                },
                              },
                                subtask.status === "done"
                                  ? React.createElement(Check, {
                                      width: 13,
                                      height: 13,
                                      strokeWidth: 2,
                                      "aria-hidden": "true",
                                    })
                                  : null
                              )
                            : null,
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

        function renderProjectTaskDetailLoadingState() {
          return React.createElement(PlatformLoadingState, {
            className: "playground-projects-loading-state playground-tasks-ticket-loading-state",
            message: "Loading ticket...",
            centered: true,
          });
        }

        const isProjectTaskDetailScreenOpen = Boolean(
          projectTaskDetailScreenOpen
          && selectedProjectId
          && selectedTaskId
          && (taskView === "overview" || taskView === "backlog" || taskView === "board")
        );
        const selectedTaskDetailHydrationId = String(selectedTaskId || "").trim();
        const taskDetailHydrationId = String(taskActivityTimelineState?.taskId || "").trim();
        const taskDetailHydrationStatus = String(taskActivityTimelineState?.status || "idle")
          .trim()
          .toLowerCase();
        const isProjectTaskDetailInitialLoading = Boolean(
          isProjectTaskDetailScreenOpen
          && selectedTaskDetailHydrationId
          && (
            taskDetailHydrationId !== selectedTaskDetailHydrationId
            || taskDetailHydrationStatus === "idle"
            || taskDetailHydrationStatus === "loading"
          )
        );
        const directTaskNavigationProjectId = String(navigationRequest?.projectId || "").trim();
        const directTaskNavigationTaskId = String(navigationRequest?.taskId || "").trim();
        const isDirectTaskNavigationPending = Boolean(
          (
            navigationRequest?.taskDetailMode === "screen"
            && directTaskNavigationProjectId
            && directTaskNavigationTaskId
            && (
              selectedProjectId !== directTaskNavigationProjectId
              || selectedTaskId !== directTaskNavigationTaskId
              || !isProjectTaskDetailScreenOpen
            )
          )
          || (
            pendingExternalTaskOpenRequest?.screen === true
            && (
              selectedProjectId !== pendingExternalTaskOpenRequest.projectId
              || selectedTaskId !== pendingExternalTaskOpenRequest.taskId
              || !isProjectTaskDetailScreenOpen
            )
          )
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
            renderBoardBlockedPickerDialog(),
            renderTaskParentPickerDialog(),
            renderTaskEnvironmentChangeDialog(),
            renderTaskDeleteDialog(),
            renderProjectIssueComposerDialog(),
            renderProjectComposerDialog(),
            renderReleaseComposerDialog(),
            renderProjectEnvironmentFilePicker()
          );
        }

        return React.createElement("div", { className: "playground-tasks-page" },
          renderProjectWallpaperTransitionLayer(),
          React.createElement("div", { className: "playground-tasks-shell" + (isDetailOpen ? " is-detail-open" : "") + (isTaskAttachmentPreviewOpen ? " is-preview-open" : "") },
            React.createElement("section", { className: "playground-tasks-main" },
              React.createElement("div", {
                  className: "playground-tasks-main-scroll" + (selectedProject || (projectComposerOpen && !isProjectInitialSetupModalOpen) || isStandaloneCalendarMode
                    ? " is-project-workspace"
                    : " is-projects-home" + (projects.length > 0 ? " has-resource-overview" : "")),
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
                  : isDirectTaskNavigationPending
                    ? renderProjectTaskDetailLoadingState()
                  : projectComposerOpen && !selectedProject && !isProjectInitialSetupModalOpen
                    ? renderProjectComposerSetupWorkspace()
                    : selectedProject
                      ? (isProjectTaskDetailScreenOpen
                          ? (isProjectTaskDetailInitialLoading
                              ? renderProjectTaskDetailLoadingState()
                              : renderProjectTaskDetailScreen())
                          : renderSelectedProjectWorkspace())
                      : renderProjectLanding()
              )
            ),
            React.createElement("aside", { className: "playground-environments-detail playground-tasks-detail-panel" + (isTaskDetailOpen || isScheduleDetailOpen ? " is-project-task-detail" : "") },
              isDetailOpen ? renderTaskDetail() : null
            )
          ),
          renderTaskEnvironmentFilePicker(),
          renderTaskConnectorBrowser(),
          renderBoardBlockedPickerDialog(),
          renderTaskParentPickerDialog(),
          renderTaskEnvironmentChangeDialog(),
          renderTaskDeleteDialog(),
          renderMissionControlStudio(),
          renderProjectIssueComposerDialog(),
          renderProjectComposerDialog(),
          renderReleaseComposerDialog(),
          renderProjectEnvironmentFilePicker()
        );
      }

`;
