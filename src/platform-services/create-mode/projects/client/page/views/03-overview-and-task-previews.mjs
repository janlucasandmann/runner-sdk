export const PROJECTS_VIEWS_03_FRAGMENT = `	                  agents: backlogComposerAgents,
	                  skills: skills,
	                  skillDefaults: getDemoImageGenerationSkillDefaults(),
	                  environmentId: backlogComposerEnvironmentId || undefined,
	                  agentId: effectiveBacklogComposerAgentId || undefined,
	                  autoFocusComposer: true,
	                  keepFocusOnSubmit: true,
                  enableBacklogSubtaskCommand: true,
                  backlogTaskConnectors: normalizePlaygroundTaskConnectorSelections(selectedProject?.connectors),
                  backlogSubtaskCommand: backlogComposerSubtaskCommandRequest,
                  enableBacklogMissionControlCommand: true,
                  backlogMissionControlCommand: backlogComposerMissionControlCommandRequest,
                  showUsageInStatus: false,
	                  placeholder: "Add a new task",
	                  onRunStart: handleBacklogComposerRunStart,
	                  onRunFinish: handleBacklogComposerRunFinish,
	                  onBacklogMissionControlSubmit: handleBacklogMissionControlSubmit,
	                  isAgentSelectionBlocked: (agent) => normalizedSubscriptionTierId === "free" && isPlaygroundFreePlanLockedComposerAgent(agent),
	                  onBlockedAgentSelect: requestProjectAgentPlanGate,
	                  onAgentChange: (nextAgentId) => setBacklogComposerAgentId(nextAgentId),
                  onEnvironmentChange: (nextEnvironmentId) => setBacklogComposerEnvironmentId(nextEnvironmentId),
                  onDocumentPreviewOpenChange: () => {
                  },
                  onDeepResearchDetailOpenChange: () => {
                  },
                })
              ),
          });
        }

\${PROJECT_ACTIVITY_CARD_SCRIPT}

        function buildProjectWorkActivityOverviewItems(
          scopedTasks,
          selectionEvents = [],
          selectedTimelineItemId = ""
        ) {
          const currentTimestamp = Date.now();
          const activityTasks = (Array.isArray(scopedTasks) ? scopedTasks : [])
            .filter((task) => task?.id && matchesTaskSearch(task));
          const activityTaskIds = new Set(activityTasks.map((task) => String(task.id)));
          const activityTasksById = new Map(activityTasks.map((task) => [String(task.id), task]));
          const timelineItems = [];
          const representedThreadIds = new Set();
          const getTimelineEntrySelection = (selectionCriteria) =>
            getProjectWorkActivityTimelineSelection(
              selectionEvents,
              selectionCriteria,
              selectedTimelineItemId
            );
          activityTasks.forEach((task) => {
            const taskId = String(task.id);
            const ticketNumber = String(
              taskTicketNumbersById[taskId] || task.ticketNumber || "000"
            ).trim();
            const taskType = normalizePlaygroundTaskType(task.taskType);
            const taskCreatorEvent = getProjectWorkActivityTaskCreatorEvent(task);
            const taskStatus = String(task.status || "").trim().toLowerCase();
            const startTime = parseProjectWorkActivityTimestamp(
              task.createdAt,
              task.created_at,
              task.metadata?.createdAt
            );
            const terminalTask = isPlaygroundTaskTerminalStatus(taskStatus);
            const endTime = parseProjectWorkActivityTimestamp(
              task.completedAt,
              task.completed_at,
              terminalTask ? task.updatedAt : null,
              task.updatedAt,
              task.updated_at,
              startTime
            );
            const taskIsActive = ["in_progress", "in_review"].includes(taskStatus);
            const taskSelection = getTimelineEntrySelection({
              eventId: taskCreatorEvent?.id,
              eventType: "created",
              sourceId: taskId,
              taskId,
            });
            timelineItems.push({
              id: "task:" + taskId,
              label: "Created " + ticketNumber,
              content: renderProjectWorkActivityCard({
                title: "Created " + ticketNumber,
                permissionActionId: "project_issues_manage",
                actor: taskCreatorEvent,
                ariaLabel: "Inspect activity for " + ticketNumber,
                onSelect: taskSelection.onSelect,
                selected: taskSelection.selected,
              }),
              startAt: startTime,
              endAt: taskIsActive ? currentTimestamp : endTime,
              kind: taskType === "subtask" || taskType === "loop"
                ? "subflow"
                : "activity",
              status: getProjectWorkActivityStatus(taskStatus),
              icon: taskType === "subtask" || taskType === "loop"
                ? GitBranch
                : Bookmark,
              color: taskType === "subtask" || taskType === "loop"
                ? "#ffd65c"
                : getProjectWorkActivityColor(taskStatus),
              ariaLabel: "Open " + ticketNumber + " " + String(task.title || "Untitled Task").trim(),
            });

            (Array.isArray(task.activity) ? task.activity : []).forEach((event) => {
              const eventType = String(event?.eventType || "").trim().toLowerCase();
              const fieldName = String(event?.fieldName || "").trim().toLowerCase();
              if (
                !event?.id
                || eventType === "created"
                || eventType === "comment_added"
                || (eventType === "field_changed" && fieldName === "description")
              ) {
                return;
              }
              const eventTime = parseProjectWorkActivityTimestamp(event.createdAt);
              if (!eventTime) {
                return;
              }
              const nextStatus = eventType === "status_changed"
                ? String(event.nextValue || "").trim()
                : "";
              const eventLabel = eventType === "status_changed"
                ? getProjectWorkActivityStatusTitle(ticketNumber, nextStatus)
                : eventType === "thread_started"
                  ? "Started work " + ticketNumber
                  : getProjectWorkActivityEventTitle(event, ticketNumber);
              const eventSelection = getTimelineEntrySelection({
                eventId: event?.id,
                eventType,
                sourceId: event?.sourceId,
                taskId,
                threadId: event?.threadId,
              });
              timelineItems.push({
                id: "event:" + taskId + ":" + event.id,
                label: eventLabel,
                content: renderProjectWorkActivityCard({
                  title: eventLabel,
                  permissionActionId: eventType === "thread_started"
                    ? "project_threads_create"
                    : "project_issues_manage",
                  actor: event,
                  ariaLabel: "Inspect activity for " + ticketNumber,
                  onSelect: eventSelection.onSelect,
                  selected: eventSelection.selected,
                }),
                startAt: eventTime,
                kind: "signal",
                status: nextStatus
                  ? getProjectWorkActivityStatus(nextStatus)
                  : eventType === "thread_started"
                    ? "running"
                    : "default",
                color: nextStatus
                  ? getProjectWorkActivityColor(nextStatus)
                  : eventType === "thread_started"
                    ? "#4da3ff"
                    : "#c980ff",
                ariaLabel: "Open " + ticketNumber,
              });
            });
          });

          (Array.isArray(selectedProjectRecentThreads) ? selectedProjectRecentThreads : []).forEach((threadRecord) => {
            const thread = normalizeThreadItem(threadRecord);
            const taskPreview = getThreadTaskPreview(thread);
            const taskId = String(taskPreview?.taskId || "").trim();
            if (!thread?.id || !taskId || !activityTaskIds.has(taskId)) {
              return;
            }
            const startTime = parseProjectWorkActivityTimestamp(
              thread.startedAt,
              thread.createdAt,
              thread.updatedAt
            );
            if (!startTime) {
              return;
            }
            const threadStatus = String(thread.status || "").trim().toLowerCase();
            const threadIsActive = ["running", "starting", "waiting_permission", "awaiting_input"].includes(threadStatus);
            const endTime = parseProjectWorkActivityTimestamp(
              thread.completedAt,
              thread.finishedAt,
              thread.endedAt,
              thread.updatedAt,
              startTime
            );
            const task = activityTasksById.get(taskId);
            const ticketNumber = String(
              taskTicketNumbersById[taskId] || task?.ticketNumber || "000"
            ).trim();
            const threadActor = getProjectWorkActivityThreadActor(thread, task);
            const threadTitle = getProjectWorkActivityExecutionTitle(
              ticketNumber,
              threadStatus,
              "work"
            );
            const threadSelection = getTimelineEntrySelection({
              eventType: "thread_started",
              sourceId: String(thread.id),
              taskId,
              threadId: String(thread.id),
            });
            representedThreadIds.add(String(thread.id));
            timelineItems.push({
              id: "thread:" + String(thread.id),
              label: threadTitle,
              content: renderProjectWorkActivityCard({
                title: threadTitle,
                permissionActionId: "project_threads_create",
                actor: threadActor,
                ariaLabel: "Inspect work activity for " + ticketNumber,
                onSelect: threadSelection.onSelect,
                selected: threadSelection.selected,
              }),
              startAt: startTime,
              endAt: threadIsActive ? currentTimestamp : endTime,
              kind: "activity",
              status: getProjectWorkActivityStatus(threadStatus),
              icon: Bot,
              color: "#4da3ff",
              ariaLabel: "Open thread " + String(thread.title || ""),
            });
          });

          (Array.isArray(selectedProjectDetail?.agentSessions)
            ? selectedProjectDetail.agentSessions
            : []).forEach((session, index) => {
              const taskId = String(session?.taskId || session?.task_id || "").trim();
              const threadId = String(session?.threadId || session?.thread_id || "").trim();
              if (
                !taskId
                || !activityTaskIds.has(taskId)
                || (threadId && representedThreadIds.has(threadId))
              ) {
                return;
              }
              const startTime = parseProjectWorkActivityTimestamp(
                session?.startedAt,
                session?.started_at,
                session?.createdAt,
                session?.created_at
              );
              if (!startTime) {
                return;
              }
              const sessionState = String(session?.state || "").trim().toLowerCase();
              const sessionIsActive = ["running", "starting", "awaiting_input"].includes(sessionState);
              const endTime = parseProjectWorkActivityTimestamp(
                session?.completedAt,
                session?.completed_at,
                session?.finishedAt,
                session?.finished_at,
                session?.updatedAt,
                session?.updated_at,
                startTime
              );
              const task = activityTasksById.get(taskId);
              const ticketNumber = String(
                taskTicketNumbersById[taskId] || task?.ticketNumber || "000"
              ).trim();
              const attemptNumber = Math.max(
                1,
                Number(session?.attemptNumber ?? session?.attempt_number ?? index + 1) || 1
              );
              const sessionActor = getProjectWorkActivitySessionActor(session, task);
              const sessionTitle = getProjectWorkActivityExecutionTitle(
                ticketNumber,
                sessionState,
                "attempt"
              );
              const sessionSelection = getTimelineEntrySelection({
                eventType: "thread_started",
                sourceId: threadId,
                taskId,
                threadId,
              });
              timelineItems.push({
                id: "session:" + String(session?.id || threadId || taskId + ":" + index),
                label: sessionTitle,
                content: renderProjectWorkActivityCard({
                  title: sessionTitle,
                  permissionActionId: "project_threads_create",
                  actor: sessionActor,
                  ariaLabel: "Inspect agent attempt " + attemptNumber + " for " + ticketNumber,
                  onSelect: sessionSelection.onSelect,
                  selected: sessionSelection.selected,
                }),
                startAt: startTime,
                endAt: sessionIsActive ? currentTimestamp : endTime,
                kind: "subflow",
                status: getProjectWorkActivityStatus(sessionState),
                icon: GitBranch,
                color: "#ffd65c",
                ariaLabel: "Open agent attempt " + attemptNumber + " for " + ticketNumber,
              });
            });

          return timelineItems;
        }
        function getProjectWorkActivityActorName(event) {
          const actorName = String(event?.actorName || "").trim();
          if (actorName) {
            return actorName;
          }
          const actorAgentId = String(event?.actorAgentId || "").trim();
          if (actorAgentId) {
            return getTaskAssigneeName(actorAgentId, actorAgentId);
          }
          return event?.actorType === "system" ? "Computer Agents" : "User";
        }

        function renderProjectWorkActivityActorAvatar(
          event,
          className = "playground-tasks-activity-avatar"
        ) {
          const isComputerAgentsActor = event?.actorType === "system";
          const actorName = getProjectWorkActivityActorName(event);
          const actorAvatarUrl = event?.actorAvatarUrl
            || (isComputerAgentsActor ? COMPUTER_AGENTS_CREATOR_PROFILE_URL : "");
          if (typeof renderTaskCommentAvatar === "function") {
            return renderTaskCommentAvatar({
              id: event?.id || "",
              authorType: event?.actorType || "user",
              authorAgentId: event?.actorAgentId || undefined,
              authorUserId: event?.actorUserId || undefined,
              authorName: actorName,
              authorAvatarUrl: actorAvatarUrl || undefined,
            }, className);
          }
          return renderAgentNameAvatar(
            actorName,
            className,
            actorAvatarUrl
          );
        }

        function formatProjectWorkActivityFieldValue(fieldName, value) {
          const normalizedValue = value === null || value === undefined
            ? ""
            : String(value).trim();
          if (!normalizedValue) {
            return "";
          }
          if (fieldName === "status") {
            return getPlaygroundTaskStatusLabel(normalizedValue);
          }
          if (fieldName === "priority") {
            return PLAYGROUND_TASK_PRIORITY_OPTIONS.find(
              (option) => option.id === normalizedValue
            )?.label || normalizedValue;
          }
          if (fieldName === "assigneeAgentId" || fieldName === "reviewerAgentId") {
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

        function renderProjectWorkActivityEventSummary(event) {
          const actor = React.createElement(
            "strong",
            null,
            getProjectWorkActivityActorName(event)
          );
          if (event?.eventType === "created") {
            return React.createElement(React.Fragment, null, actor, " created the issue");
          }
          if (event?.eventType === "status_changed") {
            const previousStatus = formatProjectWorkActivityFieldValue(
              "status",
              event.previousValue
            );
            const nextStatus = formatProjectWorkActivityFieldValue(
              "status",
              event.nextValue
            );
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
          if (event?.eventType === "thread_started") {
            const threadTitle = String(
              event.thread?.title
                || event.metadata?.threadTitle
                || event.task?.title
                || "Untitled thread"
            ).trim();
            return React.createElement(
              React.Fragment,
              null,
              actor,
              " started ",
              React.createElement("strong", null, threadTitle)
            );
          }
          if (event?.eventType === "field_changed") {
            const fieldName = String(event.fieldName || "").trim();
            const nextValue = formatProjectWorkActivityFieldValue(
              fieldName,
              event.nextValue
            );
            const previousValue = formatProjectWorkActivityFieldValue(
              fieldName,
              event.previousValue
            );
            if (fieldName === "title") {
              return React.createElement(
                React.Fragment,
                null,
                actor,
                " renamed the issue to ",
                React.createElement("strong", null, nextValue)
              );
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
            if (fieldName === "reviewerAgentId") {
              return React.createElement(
                React.Fragment,
                null,
                actor,
                nextValue ? " assigned review to " : " removed the reviewer",
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
              return React.createElement(
                React.Fragment,
                null,
                actor,
                " updated the issue blockers"
              );
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

        function getProjectWorkActivityEventLabel(event) {
          if (event?.eventType === "created") {
            return "Issue created";
          }
          if (event?.eventType === "status_changed") {
            return "Status changed";
          }
          if (event?.eventType === "thread_started") {
            return "Thread started";
          }
          if (event?.eventType === "field_changed") {
            const fieldName = String(event.fieldName || "").trim();
            const fieldLabel = fieldName
              .replace(/Id$/, "")
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .toLowerCase();
            return fieldLabel
              ? fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1) + " changed"
              : "Issue changed";
          }
          return "Activity";
        }

        function renderProjectWorkActivityPreviewRow(label, value, className = "") {
          if (value === null || value === undefined || value === "") {
            return null;
          }
          return React.createElement("div", {
              className: "playground-project-activity-preview-row"
                + (className ? " " + className : ""),
            },
            React.createElement("dt", null, label),
            React.createElement("dd", null, value)
          );
        }

        function renderProjectWorkActivityEventPreview(event, task, ticketLabel) {
          const taskId = String(event?.taskId || task?.id || "").trim();
          const fieldName = event?.eventType === "status_changed"
            ? "status"
            : String(event?.fieldName || "").trim();
          const previousValue = formatProjectWorkActivityFieldValue(
            fieldName,
            event?.previousValue
          );
          const nextValue = formatProjectWorkActivityFieldValue(
            fieldName,
            event?.nextValue
          );
          const threadTitle = event?.eventType === "thread_started"
            ? String(
                event.thread?.title
                  || event.metadata?.threadTitle
                  || task?.title
                  || "Untitled thread"
              ).trim()
            : "";
          const exactTimestamp = event?.createdAt
            ? new Date(event.createdAt).toLocaleString()
            : "";
          const ticketControl = ticketLabel
            ? React.createElement("button", {
                type: "button",
                className: "playground-project-activity-preview-ticket",
                onClick: taskId && typeof openProjectTaskDetailScreen === "function"
                  ? () => openProjectTaskDetailScreen(taskId)
                  : undefined,
              }, ticketLabel)
            : null;
          return React.createElement("div", {
              className: "playground-project-activity-preview",
            },
            React.createElement("div", {
                className: "playground-project-activity-preview-heading",
              },
              React.createElement("span", {
                  className: "playground-project-activity-preview-avatar",
                },
                renderProjectWorkActivityActorAvatar(event)
              ),
              React.createElement("div", {
                  className: "playground-project-activity-preview-heading-copy",
                },
                React.createElement("div", {
                    className: "playground-project-activity-preview-summary",
                  },
                  renderProjectWorkActivityEventSummary(event)
                ),
                exactTimestamp
                  ? React.createElement("time", {
                      className: "playground-project-activity-preview-time",
                      dateTime: event.createdAt,
                    }, exactTimestamp)
                  : null
              )
            ),
            React.createElement("dl", {
                className: "playground-project-activity-preview-details",
              },
              renderProjectWorkActivityPreviewRow("Ticket", ticketControl),
              renderProjectWorkActivityPreviewRow(
                "Activity",
                getProjectWorkActivityEventLabel(event)
              ),
              renderProjectWorkActivityPreviewRow(
                "Actor",
                getProjectWorkActivityActorName(event)
              ),
              renderProjectWorkActivityPreviewRow("Previous", previousValue),
              renderProjectWorkActivityPreviewRow("Current", nextValue),
              renderProjectWorkActivityPreviewRow("Thread", threadTitle),
              renderProjectWorkActivityPreviewRow(
                "Event ID",
                String(event?.id || "").trim(),
                "is-code"
              )
            )
          );
        }

        function getProjectWorkActivityInspectorTarget(event, task, ticketLabel) {
          const threadId = String(
            event?.threadId
              || event?.thread?.id
              || event?.metadata?.threadId
              || ""
          ).trim();
          if (
            event?.eventType === "thread_started"
            && threadId
            && typeof handleThreadSelect === "function"
          ) {
            return {
              label: "Open Thread",
              ariaLabel: "Open thread " + String(
                event?.thread?.title
                  || event?.metadata?.threadTitle
                  || task?.title
                  || threadId
              ).trim(),
              onActivate: () => handleThreadSelect(threadId),
            };
          }

          const metadata = event?.metadata && typeof event.metadata === "object"
            ? event.metadata
            : {};
          const metadataResource = metadata.resource && typeof metadata.resource === "object"
            ? metadata.resource
            : {};
          const eventResource = event?.resource && typeof event.resource === "object"
            ? event.resource
            : {};
          const resource = {
            ...metadataResource,
            ...eventResource,
          };
          const resourceId = String(
            event?.resourceId
              || metadata.resourceId
              || resource.id
              || ""
          ).trim();
          const resourcePath = String(
            event?.resourcePath
              || metadata.resourcePath
              || resource.path
              || resource.sourcePath
              || resource.workspacePath
              || ""
          ).trim();
          const resourceType = String(
            event?.resourceType
              || metadata.resourceType
              || resource.type
              || resource.kind
              || ""
          ).trim();
          if (
            (resourceId || resourcePath)
            && typeof openProjectOverviewResourceRow === "function"
          ) {
            const resourceTitle = String(
              resource.title
                || resource.name
                || resource.label
                || metadata.resourceTitle
                || resourcePath
                || resourceId
            ).trim();
            return {
              label: "Open Resource",
              ariaLabel: "Open resource " + resourceTitle,
              onActivate: () => openProjectOverviewResourceRow({
                id: resourceId,
                type: resourceType,
                kind: resource.kind || resourceType,
                title: resourceTitle,
                path: resourcePath,
                record: {
                  ...resource,
                  id: resourceId || resource.id,
                  type: resourceType || resource.type,
                  path: resourcePath || resource.path,
                },
              }),
            };
          }

          const taskId = String(event?.taskId || task?.id || "").trim();
          if (taskId && typeof openProjectTaskDetailScreen === "function") {
            return {
              label: "Open Ticket",
              ariaLabel: ticketLabel
                ? "Open ticket " + ticketLabel
                : "Open ticket",
              onActivate: () => openProjectTaskDetailScreen(taskId),
            };
          }
          return null;
        }

        function renderProjectWorkActivityInspectorAction(target) {
          if (!target?.onActivate) {
            return null;
          }
          return React.createElement(PlatformSecondaryButton, {
              type: "button",
              size: "small",
              className: "playground-project-activity-inspector-open",
              "aria-label": target.ariaLabel || target.label,
              onClick: target.onActivate,
            },
            React.createElement(ExternalLink, {
              width: 13,
              height: 13,
              strokeWidth: 1.8,
              "aria-hidden": true,
            }),
            target.label
          );
        }

\${PROJECT_ACTIVITY_LIST_SCRIPT}

        function buildProjectWorkActivityTimelineItems(events) {
          return (Array.isArray(events) ? events : [])
            .filter((event) => {
              const fieldName = String(event?.fieldName || "").trim().toLowerCase();
              return event?.eventType !== "comment_added"
                && !(event?.eventType === "field_changed" && fieldName === "description");
            })
            .map((event, index) => {
              const isThread = event?.eventType === "thread_started";
              const isStatus = event?.eventType === "status_changed";
              const isFieldChange = event?.eventType === "field_changed";
              const fieldName = String(event?.fieldName || "").trim();
              const isPriorityChange = isFieldChange && fieldName === "priority";
              const isMilestoneChange = isFieldChange
                && ["releaseId", "milestoneId"].includes(fieldName);
              const isScheduleChange = isFieldChange && [
                "dueAt",
                "scheduledStartAt",
                "scheduledEndAt",
                "scheduleType",
                "cronExpression",
                "scheduleTimezone",
                "scheduleEnabled",
              ].includes(fieldName);
              const taskId = String(event?.taskId || event?.task?.id || "").trim();
              const task = event?.task || (taskId ? tasksById[taskId] || null : null);
              const ticketNumber = taskId
                ? String(
                    taskTicketNumbersById[taskId] || task?.ticketNumber || ""
                  ).trim()
                : "";
              const ticketLabel = [ticketNumber, task?.title || ""]
                .filter(Boolean)
                .join(" ");
              const inspectorTarget = getProjectWorkActivityInspectorTarget(
                event,
                task,
                ticketLabel
              );
              return {
                id: String(event?.id || taskId + ":" + index),
                tone: isThread ? "thread" : isStatus ? "status" : "created",
                summary: renderProjectWorkActivityListSummary(
                  event,
                  ticketNumber
                ),
                avatar: isStatus
                  ? renderPlaygroundTaskStatusGlyph(
                      event?.nextValue,
                      "platform-activity-timeline__status-icon"
                    )
                  : isPriorityChange
                    ? renderPlaygroundTaskPriorityIcon(
                        event?.nextValue,
                        "platform-activity-timeline__priority-icon"
                      )
                    : isFieldChange
                      ? null
                      : renderProjectWorkActivityActorAvatar(event),
                icon: isMilestoneChange
                  ? Milestone
                  : isScheduleChange
                    ? CalendarIcon
                    : isFieldChange
                      ? PencilRuler
                      : undefined,
                onActivate: inspectorTarget?.onActivate,
                ariaLabel: inspectorTarget?.ariaLabel,
                preview: renderProjectWorkActivityEventPreview(
                  event,
                  task,
                  ticketLabel
                ),
                inspectorAction: renderProjectWorkActivityInspectorAction(
                  inspectorTarget
                ),
              };
            });
        }

\${PROJECT_ACTIVITY_LINE_SCRIPT}
\${PROJECT_ACTIVITY_FILTER_SCRIPT}
\${PROJECT_ACTIVITY_RANGE_SCRIPT}

        function renderProjectActivityOverviewView() {
          const activityTaskRecordsById = new Map([
            ...tasks,
            ...(projectOverviewTaskActivityState?.items || []).map((event) => event?.task),
          ].filter((task) => task?.id).map((task) => [String(task.id), task]));
          const activityTasks = [...activityTaskRecordsById.values()]
            .filter((task) => !selectedReleaseId || String(task?.releaseId || "") === selectedReleaseId);
          const visibleTaskIds = new Set(
            (Array.isArray(activityTasks) ? activityTasks : [])
              .filter((task) => task?.id && matchesTaskSearch(task))
              .map((task) => String(task.id))
          );
          const projectActivityEvents = (projectOverviewTaskActivityState?.items || [])
            .filter((event) => visibleTaskIds.has(String(event?.taskId || event?.task?.id || "").trim()))
            .sort((left, right) => {
              const leftTime = Date.parse(String(left?.createdAt || "")) || 0;
              const rightTime = Date.parse(String(right?.createdAt || "")) || 0;
              return leftTime - rightTime || String(left?.id || "").localeCompare(String(right?.id || ""));
            });
          const filteredProjectActivityEvents = filterProjectWorkActivityEventsByTimeRange(
            projectActivityEvents,
            projectOverviewTaskActivityTimeRange
          )
            .filter((event) =>
              matchesProjectWorkActivityFilter(
                event,
                projectOverviewTaskActivityFilterMode
              )
            );
          const projectActivityTimelineItems = buildProjectWorkActivityTimelineItems(
            filteredProjectActivityEvents
          );
          const effectiveProjectActivitySelectedId = projectActivityTimelineItems.some(
            (item) => item.id === projectOverviewTaskActivitySelectedId
          )
            ? projectOverviewTaskActivitySelectedId
            : String(projectActivityTimelineItems[0]?.id || "");
          const activityItems = buildProjectWorkActivityOverviewItems(
            activityTasks,
            projectActivityEvents,
            effectiveProjectActivitySelectedId
          );
          const hasActivityFilter = projectOverviewTaskActivityFilterMode !== "all";
          return React.createElement(PlatformActivityWorkspace, {
              className: "playground-project-activity-page",
              chartHeight: projectOverviewActivityChartHeight,
              overviewProps: getProjectActivityOverviewProps(activityItems),
              timelineLoading: projectOverviewTaskActivityState?.status === "loading"
                && projectActivityTimelineItems.length === 0,
              timelineLoadingMessage: "Loading activity...",
              timelineLoadingClassName: "playground-project-activity-feed-loading",
              timelineProps: {
                className: "playground-project-activity-timeline",
                layout: "inspector",
                title: "Activity",
                titleActions: renderProjectWorkActivityFilter(),
                headerActions: React.createElement(PlatformSearch, {
                  value: searchQuery,
                  onChange: (event) => setSearchQuery(event.target.value),
                  placeholder: "Search activity",
                  "aria-label": "Search project activity",
                }),
                inspectorTitle: "Inspector",
                items: projectActivityTimelineItems,
                selectedItemId: projectOverviewTaskActivitySelectedId,
                onSelectedItemChange: setProjectOverviewTaskActivitySelectedId,
                emptyTitle: projectOverviewTaskActivityState?.status === "error"
                  ? "Activity unavailable"
                  : normalizedSearchQuery
                    ? "No matching activity"
                    : hasActivityFilter
                      ? "No matching actions"
                      : "No activity yet",
                emptyDescription: projectOverviewTaskActivityState?.status === "error"
                  ? projectOverviewTaskActivityState.error
                  : normalizedSearchQuery
                    ? "Clear the search to show all project activity."
                    : hasActivityFilter
                      ? "Choose another action filter to show more activity."
                      : "Ticket actions and agent work will appear here.",
              },
            });
        }

        function renderBoardView() {
          const boardTasks = boardVisibleTasks;
          const visibleBoardLanes = PLAYGROUND_TASK_BOARD_LANES.filter((lane) =>
            boardTasks.some((task) => lane.statuses.includes(getTaskBoardStatus(task)))
          );
          const draggingBoardTask = boardDraggingTaskId ? tasksById[boardDraggingTaskId] || null : null;
          const hasSelectedReleaseSection = Boolean(selectedReleaseId && selectedRelease);

          function isTaskInBoardReleaseSection(taskRecord, releaseId) {
            const taskReleaseId = typeof taskRecord?.releaseId === "string" && taskRecord.releaseId.trim()
              ? taskRecord.releaseId.trim()
              : "";
            const normalizedReleaseId = typeof releaseId === "string" && releaseId.trim()
              ? releaseId.trim()
              : "";
            return taskReleaseId === normalizedReleaseId;
          }

          function renderBoardToolbar() {
            return React.createElement("div", {
                className: "playground-tasks-backlog-header is-board-list-header",
                ref: boardToolbarActionsRef,
              },
              React.createElement("div", { className: "playground-tasks-backlog-header-row" },
                React.createElement("div", { className: "playground-tasks-backlog-header-main" },
                  renderProjectWorkViewTabs(),
                  React.createElement(PlatformPopup, {
                      open: boardToolbarPopover === "filter",
                      rootClassName: "playground-tasks-board-filter-shell is-central-popup",
                      surfaceClassName: "platform-data-table__floating-menu playground-tasks-board-filter-menu is-central-popup",
                      surfaceProps: {
                        role: "menu",
                        "aria-label": "Filter board",
                      },
                      animation: "down-in",
                      variant: "minimal",
                      placement: "bottom-start",
                      trigger: React.createElement("button", {
                        type: "button",
                        className: "platform-data-table__toolbar-button is-icon-only"
                          + (boardToolbarPopover === "filter" || boardFilterMode !== "all" ? " is-open" : ""),
                        onClick: (event) => {
                          event.stopPropagation();
                          setBoardToolbarPopover((current) => current === "filter" ? "" : "filter");
                        },
                        title: "Filter board",
                        "aria-label": "Filter board",
                        "aria-haspopup": "menu",
                        "aria-expanded": boardToolbarPopover === "filter" ? "true" : "false",
                      }, React.createElement(ListFilter, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      })),
                    },
                    boardFilterOptions.map((option) =>
                      React.createElement("button", {
                        key: option.id,
                        type: "button",
                        role: "menuitemradio",
                        "aria-checked": boardFilterMode === option.id ? "true" : "false",
                        className: "platform-data-table__menu-item",
                        onClick: () => {
                          setBoardFilterMode(option.id);
                          setBoardToolbarPopover("");
                        },
                      },
                        React.createElement("span", { className: "platform-data-table__menu-icon" },
                          boardFilterMode === option.id
                            ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                            : null
                        ),
                        React.createElement("span", { className: "platform-data-table__menu-copy" },
                          React.createElement("span", { className: "platform-data-table__menu-label" }, option.label),
                          React.createElement("span", { className: "platform-data-table__menu-description" }, option.description)
                        )
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-backlog-header-actions" },
                  renderProjectAppHeaderMilestoneSelector(),
                  React.createElement(PlatformSearch, {
                    className: "playground-tasks-board-central-search",
                    value: searchQuery,
                    onChange: (event) => setSearchQuery(event.target.value),
                    placeholder: "Search tasks",
                    "aria-label": "Search board tasks",
                  })
                )
              )
            );
          }

          function renderBoardCard(task) {
            const boardStatus = getTaskBoardStatus(task);
            const statusLabel = getPlaygroundTaskStatusLabel(boardStatus);
            const taskType = normalizePlaygroundTaskType(task.taskType || task.type);
            const TaskTypeIcon = getPlaygroundTaskTypeIcon(taskType);
            const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "001";
            const isDraggable = canDropTaskOnBoardLane(task, "blocked") || canDropTaskOnBoardLane(task, "in_progress") || canDropTaskOnBoardLane(task, "todo");
            return React.createElement(PlatformTicketItem, {
                key: task.id,
                variant: "card",
                title: task.title || "Untitled Task",
                taskType,
                typeIcon: React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 }),
                priority: renderPlaygroundTaskPriorityIcon(task.priority, "playground-tasks-lane-card-priority"),
                ticketNumber: taskTicketNumber,
                status: React.createElement("span", {
                  title: statusLabel,
                  "aria-label": statusLabel,
                }, renderPlaygroundTaskStatusGlyph(
                  boardStatus,
                  "playground-tasks-lane-card-status-icon"
                )),
                createdAt: task.createdAt || task.created_at || task.metadata?.createdAt || null,
                assignee: renderTaskAssigneeAvatar(task, "playground-tasks-board-assignee-avatar"),
                completed: task.status === "done",
                active: selectedTaskId === task.id,
                className: ""
                  + (isDraggable ? " is-draggable" : "")
                  + (boardDraggingTaskId === task.id ? " is-dragging" : ""),
                style: getPlaygroundTaskColorStyle(task.taskColor),
                ticketActionMenu: ({ closeMenu }) => renderProjectTicketPreviewContextMenu(task, { closeMenu }),
                onTicketActionMenuOpen: () => handleSelectTask(task.id),
                onTicketDeleteRequest: () => void handleDeleteTask(task.id),
                ticketDeleteShortcutDisabled: saveState.isSaving || Boolean(taskDeleteDialogState),
                onClick: () => openProjectTaskDetailScreen(task.id),
                draggable: isDraggable,
                onDragStart: (event) => {
                  if (!isDraggable) {
                    event.preventDefault();
                    return;
                  }
                  if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", task.id);
                  }
                  setBoardDraggingTaskId(task.id);
                  setBoardDropLaneId("");
                },
                onDragEnd: () => {
                  clearBoardDragState();
                },
              });
          }

          function renderBoardReleaseLane(section, lane) {
            const normalizedSectionReleaseId = typeof section.releaseId === "string" && section.releaseId.trim()
              ? section.releaseId.trim()
              : "";
            const allLaneTasks = section.tasks.filter((task) => lane.statuses.includes(getTaskBoardStatus(task)));
            const laneTasks = allLaneTasks.filter((task) => boardRenderedTaskIds.has(task.id));
            const laneDropTargetKey = section.key + ":" + lane.id;
            const isLaneDropTarget = boardDropLaneId === laneDropTargetKey
              && draggingBoardTask
              && isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId)
              && canDropTaskOnBoardLane(draggingBoardTask, lane.id);
            return React.createElement("div", {
                key: section.key + ":" + lane.id,
                className: "playground-tasks-board-release-box" + (isLaneDropTarget ? " is-drop-target" : ""),
              },
              React.createElement("div", { className: "playground-tasks-board-release-box-header" },
                React.createElement("div", { className: "playground-tasks-board-release-box-title" },
                  renderPlaygroundTaskStatusGlyph(
                    lane.id,
                    "playground-tasks-board-release-box-status-icon"
                  ),
                  React.createElement("span", null, lane.label)
                ),
                React.createElement("span", { className: "playground-tasks-board-release-box-count" }, String(allLaneTasks.length))
              ),
              React.createElement("div", {
                  className: "playground-tasks-lane playground-tasks-board-release-lane-body",
                  onDragOver: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    if (event.dataTransfer) {
                      event.dataTransfer.dropEffect = "move";
                    }
                    if (boardDropLaneId !== laneDropTargetKey) {
                      setBoardDropLaneId(laneDropTargetKey);
                    }
                  },
                  onDragEnter: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    if (boardDropLaneId !== laneDropTargetKey) {
                      setBoardDropLaneId(laneDropTargetKey);
                    }
                  },
                  onDragLeave: (event) => {
                    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                      return;
                    }
                    if (boardDropLaneId === laneDropTargetKey) {
                      setBoardDropLaneId("");
                    }
                  },
                  onDrop: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    void handleBoardLaneMove(draggingBoardTask, lane.id);
                  },
                },
                laneTasks.length > 0
                  ? React.createElement("div", { className: "playground-tasks-lane-list" },
                      laneTasks.map((task) => renderBoardCard(task))
                    )
                  : null
              )
            );
          }

          function renderBoardSection(section) {
            const sectionRelease = section.releaseId ? (releasesById[section.releaseId] || null) : null;
            return React.createElement("div", {
                key: section.key,
                className: "playground-tasks-board-release-section",
              },
              React.createElement("div", { className: "playground-tasks-board-release-section-header" },
                React.createElement("div", { className: "playground-tasks-backlog-section-copy-group" },
                  React.createElement("div", { className: "playground-tasks-backlog-section-title" }, section.title)
                ),
                renderReleaseHeaderMeta(sectionRelease)
              ),
              React.createElement("div", {
                  className: "playground-tasks-board-grid",
                  style: {
                    "--playground-tasks-board-column-count": String(visibleBoardLanes.length),
                  },
                },
                visibleBoardLanes.map((lane) => renderBoardReleaseLane(section, lane))
              )
            );
          }

          const shouldRenderBoardSections = visibleBoardLanes.length > 0
            && (hasSelectedReleaseSection || boardReleaseSections.length > 0);
          const shouldShowMissionControlEmptyAction = !selectedRelease
            && !normalizedSearchQuery
            && boardFilterMode === "all"
            && !shouldRenderBoardSections;
          const emptyTitle = selectedRelease
            ? "No tasks in this milestone"
            : "No tasks on the board";
          const emptyCopy = selectedRelease
            ? "Assign tasks to this milestone or adjust the filter and they will appear in the appropriate lane."
            : shouldShowMissionControlEmptyAction
              ? "Run Mission Control to establish the project Knowledge library and create the initial structured backlog."
              : "Adjust the filter or add tasks to the project and they will appear in the appropriate board lane.";

          return React.createElement("div", { className: "playground-tasks-view-section" },
            renderBoardToolbar(),
            shouldRenderBoardSections
              ? React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-tasks-board-sections" },
                    boardReleaseSections.map((section) => renderBoardSection(section)),
                    boardHasMoreTasks
                      ? React.createElement("div", { ref: boardLoadMoreRef, className: "playground-tasks-progressive-list-loading" },
                          React.createElement(PlatformLoadingState, { as: "span", message: "Loading more tickets..." }))
                      : null
                  )
                )
              : React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, emptyTitle),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, emptyCopy),
                  shouldShowMissionControlEmptyAction
                    ? React.createElement("div", { className: "playground-tasks-empty-actions" },
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-tasks-empty-primary-button playground-tasks-empty-mission-control-button",
                          onClick: () => openMissionControlComposer(),
                        },
                          React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                          React.createElement("span", null, "Run Mission Control")
                        )
                      )
                    : null
                )
          );
        }

\${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar}
        function renderThreadsView() {
          return React.createElement("div", { className: "playground-tasks-view-section" },
            React.createElement("div", { className: "playground-tasks-project-panel" },
              React.createElement("div", { className: "playground-tasks-project-panel-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Threads"),
                  React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Threads created inside this project stay grouped here for quick reopening.")
                )
              ),
              filteredProjectThreads.length > 0
                ? React.createElement("div", { className: "playground-tasks-project-list" },
                    filteredProjectThreads.map((thread) =>
                      React.createElement("div", { key: thread.id, className: "playground-tasks-project-row" },
                        React.createElement("div", { className: "playground-tasks-project-row-main" },
                          React.createElement("div", { className: "playground-tasks-project-row-title" }, thread.title || "Untitled thread"),
                          React.createElement("div", { className: "playground-tasks-project-row-copy" }, formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "Recently updated")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => onThreadStarted && onThreadStarted(thread.id),
                        }, "Open")
                      )
                    )
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    normalizedSearchQuery ? "No matching project threads." : "No project threads yet."
                  )
            )
          );
        }

        function renderMissionControlSetupView() {
          const normalizedProject = normalizePlaygroundProjectRecord(projectComposerOpen ? projectDraft : (selectedProject || buildPlaygroundDefaultProjectDraft()));
          const selectedAgent = missionControlAgentOptions.find((agent) => agent.id === missionControlSetupAgentId) || null;
          const focusDefinitions = [
            {
              id: "issues",
              label: "Issues and backlog",
              description: "Create missing work, clean up duplicates, and keep existing issues execution-ready.",
            },
            {
              id: "strategy",
              label: "Project strategy",
              description: "Reconcile goals, outcomes, operating rules, and delivery direction.",
            },
            {
              id: "milestones",
              label: "Milestones",
              description: "Create or update measurable milestones and connect the right work.",
            },
            {
              id: "knowledge",
              label: "Project Knowledge",
              description: "Maintain the project library, Home document, decisions, and durable context.",
            },
          ];
          const renderSelector = ({ value, label, ariaLabel, options, onValueChange, disabled = false, emptyContent }) =>
            React.createElement(PlatformSelector, {
              value,
              options,
              onValueChange,
              ariaLabel,
              label: React.createElement("span", { className: "playground-mission-control-selector-value" }, label),
              placeholder: label,
              disabled,
              alignment: "end",
              popupAlignment: "right",
              popupWidth: "min(320px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight: "min(320px, calc(100vh - 120px))",
              emptyContent,
              className: "playground-tasks-detail-central-selector playground-mission-control-selector",
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: "playground-tasks-detail-central-selector-popup playground-mission-control-selector-popup",
            });

          return React.createElement(React.Fragment, null,
            React.createElement(PlatformInstructionsEditor, {
              key: "mission-control-instructions:" + (normalizedProject.id || selectedProjectId || "project") + ":" + missionControlSetupResetToken,
              value: missionControlSetupInstructions,
              onChange: setMissionControlSetupInstructions,
              title: "Instructions",
              placeholder: "Optional: tell Mission Control what changed, what needs attention, or what it should leave untouched.",
              ariaLabel: "Mission Control instructions",
              historyKey: "mission-control-instructions:" + String(normalizedProject.id || selectedProjectId || "project"),
              stickyHeader: false,
              variant: "minimalistic-ui",
              contentVariant: "text",
              className: "playground-new-issue-modal__description playground-project-command-modal__instructions playground-mission-control-instructions",
            }),
            React.createElement("section", { className: "playground-mission-control-parameters", "aria-label": "Mission Control parameters" },
              React.createElement("div", { className: "playground-mission-control-parameter-row" },
                React.createElement("div", { className: "playground-mission-control-parameter-copy" },
                  React.createElement("span", { className: "playground-mission-control-parameter-label" }, "Agent"),
                  React.createElement("span", { className: "playground-mission-control-parameter-description" }, "Runs every selected workflow stage.")
                ),
                renderSelector({
                  value: missionControlSetupAgentId,
                  label: React.createElement("span", { className: "playground-mission-control-agent-selector-label" },
                    selectedAgent
                      ? renderTaskActorAvatar(selectedAgent.id, "playground-tasks-detail-person-avatar")
                      : null,
                    React.createElement("span", null, selectedAgent?.name || "Select agent")
                  ),
                  ariaLabel: "Mission Control agent",
                  disabled: missionControlAgentOptions.length === 0 || missionControlSetupSubmitting,
                  emptyContent: "No agents are available.",
                  options: missionControlAgentOptions.map((agent) => ({
                    value: agent.id,
                    label: agent.name || "Agent",
                    description: agent.description || undefined,
                    leading: renderTaskActorAvatar(agent.id, "playground-tasks-detail-person-menu-avatar"),
                  })),
                  onValueChange: (nextAgentId) => setMissionControlSetupAgentId(nextAgentId),
                })
              ),
              React.createElement("div", { className: "playground-mission-control-focus-list" },
                focusDefinitions.map((focus) =>
                  React.createElement("div", { key: focus.id, className: "playground-mission-control-focus-row" },
                    React.createElement("div", { className: "playground-mission-control-parameter-copy" },
                      React.createElement("span", { className: "playground-mission-control-parameter-label" }, focus.label),
                      React.createElement("span", { className: "playground-mission-control-parameter-description" }, focus.description)
                    ),
                    React.createElement(PlatformToggle, {
                      checked: missionControlSetupFocus[focus.id] === true,
                      disabled: missionControlSetupSubmitting,
                      "aria-label": "Include " + focus.label,
                      onCheckedChange: (checked) => setMissionControlSetupFocus((current) => ({ ...current, [focus.id]: checked })),
                    })
                  )
                )
              )
            ),
            missionControlSetupError
              ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, missionControlSetupError)
              : null
          );
        }

        function renderMissionControlStudio() {
          if (!missionControlSetupOpen) {
            return null;
          }
          const hasMissionControlFocus = Object.values(missionControlSetupFocus || {}).some(Boolean);
          const canRunMissionControl = Boolean(
            canStartThreads !== false
            && missionControlSetupAgentId
            && hasMissionControlFocus
            && !missionControlSetupSubmitting
          );
          const studioElement = React.createElement(PlatformModal, {
            open: missionControlSetupOpen && !missionControlSetupClosing,
            visible: missionControlSetupVisible,
            closing: missionControlSetupClosing,
            onClose: () => closeMissionControlSetupModal(),
            closeOnEscape: !missionControlSetupSubmitting,
            animationDurationMs: missionControlSetupAnimationMs,
            as: "form",
            size: "large",
            maxHeight: "84vh",
            title: "Mission Control",
            className: "playground-new-issue-modal playground-project-command-modal playground-mission-control-modal",
            bodyClassName: "playground-new-issue-modal__body playground-project-command-modal__body playground-mission-control-modal__body",
            footerClassName: "playground-new-issue-modal__footer",
            ariaLabel: "Mission Control",
            closeButtonDisabled: missionControlSetupSubmitting,
            surfaceProps: {
              onSubmit: (event) => {
                event.preventDefault();
                if (canRunMissionControl) {
                  void handleMissionControlSetupSubmit();
                }
              },
            },
            footer: React.createElement(React.Fragment, null,
              React.createElement(PlatformSecondaryButton, {
                type: "button",
                size: "medium",
                disabled: missionControlSetupSubmitting,
                onClick: () => closeMissionControlSetupModal(),
              }, "Cancel"),
              React.createElement(PlatformPrimaryButton, {
                type: "button",
                size: "medium",
                disabled: !canRunMissionControl,
                onClick: () => {
                  if (canRunMissionControl) {
                    void handleMissionControlSetupSubmit();
                  }
                },
              }, missionControlSetupSubmitting ? "Starting..." : "Run Mission Control")
            )
          }, renderMissionControlSetupView());
          return studioElement;
        }

\${PROJECT_OVERVIEW_SCRIPT}

        function renderSelectedProjectWorkspace() {
          if (!selectedProject) {
            return null;
          }

          const projectWorkspaceTitle = selectedProjectWorkspaceTitle;
          const selectedProjectDetailsReady = isPlaygroundProjectDetailRecord(selectedProject);
          const selectedProjectAccessLevel = String(
            selectedProject?.teamAccessLevel
            || selectedProject?.metadata?.teamAccessLevel
            || ""
          ).trim().toLowerCase();
          const canManageSelectedProject = Boolean(
            isProjectCreatedByCurrentViewer(selectedProject)
            || selectedProjectAccessLevel === "owner"
            || selectedProjectAccessLevel === "manage"
          );
          const projectWorkspaceScrollClassName = "playground-environments-detail-scroll playground-tasks-project-workspace-scroll"
            + (taskView === "overview" ? " is-overview" : "")
            + (taskView === "backlog" ? " is-backlog" : "")
            + (taskView === "board" ? " is-board" : "");
          const projectWorkspaceScrollStyle = undefined;

          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              useUnifiedProjectNav ? null : React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-tasks-project-navbar" },
                React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-tasks-project-title-back",
                    onClick: () => {
                      setMissionControlSetupOpen(false);
                      handleSelectProject("");
                    },
                    title: "All Projects",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                    React.createElement("div", { className: "playground-content-title" }, projectWorkspaceTitle)
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" },
                  React.createElement("div", { className: "content-mode-switch playground-tasks-nav playground-tasks-project-nav-switch" },
                    projectSidebarNavItems.map((item) =>
                      React.createElement("button", {
                        key: item.id,
                        type: "button",
                        className: "content-mode-button" + (!missionControlSetupOpen && taskView === item.id ? " is-active" : ""),
                        onClick: () => {
                          setMissionControlSetupOpen(false);
                          setTaskView(item.id);
                          if (item.id === "calendar") {
                            setSelectedTaskId("");
                            setDraftTask(null);
                          }
                          setProjectSidebarPopover("");
                        },
                      }, item.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions", ref: projectSidebarActionsRef },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-search-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "search" ? " is-active" : ""),
                      onClick: () => setProjectSidebarPopover((current) => current === "search" ? "" : "search"),
                      title: "Search project",
                    }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                    projectSidebarPopover === "search"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                          React.createElement("div", { className: "playground-tasks-project-search-header" },
                            React.createElement("div", { className: "playground-tasks-project-search-title" }, "Search Project"),
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
                                placeholder: projectSearchPlaceholder,
                                value: searchQuery,
                                onChange: (event) => setSearchQuery(event.target.value),
                              })
                            ),
                            React.createElement("div", { className: "playground-tasks-project-search-hint" },
                              taskView === "overview"
                                ? "Search across tasks, threads, files, environments, assigned agents, and project plugins."
                                : taskView === "calendar"
                                ? "Filter tasks and schedules by title, task, agent, or environment."
                                : taskView === "backlog" && selectedReleaseId
                                  ? "Filter milestone tasks by title, ticket number, assignee, environment, or milestone."
                                  : "Filter tasks by title, ticket number, assignee, environment, or sprint."
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "menu" ? " is-active" : ""),
                      onClick: () => setProjectSidebarPopover((current) => current === "menu" ? "" : "menu"),
                      title: "Project actions",
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    projectSidebarPopover === "menu"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          taskView === "calendar"
                            ? React.createElement("button", {
                                type: "button",
                                className: "tb-popup-row",
                                onClick: () => {
                                  setProjectSidebarPopover("");
                                  openScheduleComposer();
                                },
                              },
                                React.createElement(Plus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, "New Scheduled Task"),
                                  React.createElement("span", null, "Create a new calendar automation for this project.")
                                )
                              )
                            : null,
	                          canManageSelectedProject
	                            ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row",
	                            onClick: () => {
                              setProjectSidebarPopover("");
                              openProjectComposerForEdit(selectedProject);
                            },
                          },
                            React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                              React.createElement("span", null, "Edit Project"),
	                              React.createElement("span", null, "Change icon, title, and description.")
	                            )
	                          )
	                            : null,
	                          canManageSelectedProject
	                            ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row playground-tasks-detail-menu-item-danger",
	                            onClick: () => {
                              setProjectSidebarPopover("");
                              void handleDeleteProject(selectedProject.id);
                            },
                          },
                            React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                              React.createElement("span", null, "Delete Project"),
	                              React.createElement("span", null, "Remove this project and its planning scope.")
	                            )
	                          )
	                            : null
	                        )
	                      : null
	                  )
                )
              ),
              React.createElement("div", {
                className: projectWorkspaceScrollClassName,
                style: projectWorkspaceScrollStyle,
              },
                React.createElement("div", {
                  className: "playground-project-workspace-inner"
                    + (taskView === "backlog" ? " is-backlog-work-view" : "")
                    + (taskView === "board" ? " is-board-work-view" : ""),
                },
                  taskLoadState.status === "loading" && (tasks.length === 0 || !selectedProjectDetailsReady)
                    ? React.createElement(PlatformLoadingState, {
                        message: "Loading project...",
                        centered: true,
                      })
                    : (taskLoadState.status === "error" && tasks.length === 0) || !selectedProjectDetailsReady
                      ? React.createElement("div", { className: "playground-tasks-empty" },
                          React.createElement("div", { className: "playground-tasks-empty-title" }, "Project workspace unavailable"),
                          React.createElement("div", { className: "playground-tasks-empty-copy" }, taskLoadState.error || "The complete project record could not be loaded."),
                          React.createElement(PlatformPrimaryButton, {
                            size: "medium",
                            type: "button",
                            className: "playground-environments-action-button is-primary",
                            onClick: () => void loadProjectWorkspace(selectedProjectId),
                          }, "Retry")
                        )
                      : React.createElement(React.Fragment, null,
                          taskView === "board"
                            ? renderBoardView()
                            : taskView === "backlog"
                              ? renderBacklogView()
                              : renderProjectOverviewView()
                        )
                )
              )
            )
          );
        }

        function renderProjectComposerSetupWorkspace() {
          if (!projectComposerOpen || selectedProject) {
            return null;
          }

          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-tasks-project-navbar" },
                React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-tasks-project-title-back",
                    onClick: () => closeProjectComposer(),
                    title: "All Projects",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                    React.createElement("div", { className: "playground-content-title" }, projectDraft.name || "New Project")
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" }),
                React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions" })
              ),
              React.createElement("div", {
                className: "playground-environments-detail-scroll playground-tasks-project-workspace-scroll is-mission-control-setup",
              },
                React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, "Project Studio"),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, "Use the full-screen studio to define project settings and run Mission Control.")
                )
              )
            )
          );
        }

\${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.standaloneWorkspace}
        function renderTaskDetail() {
          if (missionControlStrategyOpen && selectedProject) {
            const missionControlTaskCount = Number(selectedProjectSummary.tasksCount) || 0;
            const missionControlOpenTaskCount = Number(selectedProjectSummary.openTasksCount) || 0;
            const missionControlStatusMetrics = [
              {
                key: "backlog",
                label: "Backlog",
                count: Number(selectedProjectTaskStatusOverview.backlog) || 0,
                Icon: FolderOpen,
                toneClassName: "is-backlog",
              },
              {
                key: "in-progress",
                label: "In Progress",
                count: Number(selectedProjectTaskStatusOverview.inProgress) || 0,
                Icon: Zap,
                toneClassName: "is-in-progress",
              },
              {
                key: "done",
                label: "Done",
                count: Number(selectedProjectTaskStatusOverview.done) || 0,
                Icon: Sparkles,
                toneClassName: "is-done",
              },
            ];
            const missionControlStatusSegments = [
              {
                key: "backlog",
                count: Number(selectedProjectTaskStatusOverview.backlog) || 0,
                className: "is-backlog",
              },
              {
                key: "in-progress",
                count: Number(selectedProjectTaskStatusOverview.inProgress) || 0,
                className: "is-in-progress",
              },
              {
                key: "done",
                count: Number(selectedProjectTaskStatusOverview.done) || 0,
                className: "is-done",
              },
            ]
              .map((segment) => ({
                ...segment,
                percentage: missionControlTaskCount > 0
                  ? (segment.count / missionControlTaskCount) * 100
                  : 0,
              }))
              .filter((segment) => segment.count > 0);
            const deliveryExecution = selectedProjectDeliveryExecution
              && typeof selectedProjectDeliveryExecution === "object"
              && !Array.isArray(selectedProjectDeliveryExecution)
              ? selectedProjectDeliveryExecution
              : null;
            const deliveryStageLabels = {
              build: "Build",
              test: "Test",
              evaluate: "Evaluate",
              optimize: "Optimize",
              re_evaluate: "Re-evaluate",
              acceptance_evaluate: "Workflow acceptance",
              assure: "Assure",
              deliver: "Deliver",
            };
            const deliveryStages = Object.keys(deliveryStageLabels).map((stageId) => {
              const stage = deliveryExecution?.stages?.[stageId];
              return {
                id: stageId,
                label: deliveryStageLabels[stageId],
                status: String(
                  stage?.status
                  || (stageId === "acceptance_evaluate" ? "skipped" : "pending"),
                ).toLowerCase(),
                retryCount: Math.max(0, Number(stage?.retryCount) || 0),
                evidence: stage?.evidence
                  && typeof stage.evidence === "object"
                  && !Array.isArray(stage.evidence)
                  ? stage.evidence
                  : {},
                error: String(stage?.error || "").trim(),
              };
            });
            const deliveryExecutionStatus = String(deliveryExecution?.status || "").toLowerCase();
            const deliveryCostUsd = Number(deliveryExecution?.costUsd);
            const deliveryBudgetUsd = Number(deliveryExecution?.budgetUsd);
            const deliveryCurrentStageId = String(
              deliveryExecution?.currentStage || "",
            ).trim();
            const deliveryCurrentStage = deliveryStages.find(
              (stage) => stage.id === deliveryCurrentStageId,
            ) || null;
            const deliveryExecutionEvents = Array.isArray(deliveryExecution?.events)
              ? deliveryExecution.events.slice(-5).reverse()
              : [];
            const deliveryPlanStatus = String(
              selectedProjectMissionControl?.deliveryPlan?.status || "",
            ).trim().toLowerCase();
            const deliveryActionPending = Boolean(
              missionControlDeliveryActionState.action,
            );
            const assuranceEvidenceFingerprint = String(
              deliveryExecution?.stages?.assure?.evidence?.evidenceFingerprint || "",
            ).trim();
            const assuranceRunId = String(
              deliveryExecution?.bindings?.assuranceRunId || "",
            ).trim();
            const deliveryRepairEpisode = deliveryExecution?.bindings?.repairEpisode
              && typeof deliveryExecution.bindings.repairEpisode === "object"
              && !Array.isArray(deliveryExecution.bindings.repairEpisode)
              ? deliveryExecution.bindings.repairEpisode
              : null;
            const deliveryRepairStatus = String(
              deliveryExecution?.bindings?.repairStatus || "",
            ).trim().toLowerCase();
            const deliveryApprovalRequired = Boolean(
              deliveryExecutionStatus === "blocked"
              && deliveryCurrentStageId === "assure"
              && assuranceRunId
              && assuranceEvidenceFingerprint,
            );
            const retryableDeliveryStageIds = new Set([
              "build",
              "test",
              "evaluate",
              "re_evaluate",
              "acceptance_evaluate",
              "assure",
              "deliver",
            ]);
            const deliveryRetryable = Boolean(
              deliveryExecutionStatus === "failed"
              && retryableDeliveryStageIds.has(deliveryCurrentStageId),
            );
            const deliveryNeedsRevision = Boolean(
              ["failed", "cancelled"].includes(deliveryExecutionStatus)
              && !deliveryRetryable,
            );
            const deliveryStatusVariants = {
              queued: "blue",
              running: "blue",
              blocked: "yellow",
              passed: "green",
              failed: "red",
              cancelled: "gray",
              pending: "gray",
              skipped: "gray",
            };
            const formatDeliveryEvidenceFingerprint = (value) => {
              const normalized = String(value || "").trim().replace(/^sha256:/i, "");
              return normalized.length > 16
                ? normalized.slice(0, 8) + "…" + normalized.slice(-8)
                : normalized;
            };
            const getDeliveryStageEvidenceSummary = (stage) => {
              const evidence = stage?.evidence || {};
              const fingerprint = String(
                evidence.evidenceFingerprint
                || evidence.runFingerprint
                || evidence.decisionFingerprint
                || evidence.publicationEvidenceFingerprint
                || evidence.commitSha
                || "",
              ).trim();
              const reference = String(
                evidence.testRunId
                || evidence.evaluationRunId
                || evidence.optimizationJobId
                || evidence.assuranceRunId
                || evidence.dispatchId
                || "",
              ).trim();
              const averageScore = Number(evidence.averageScore);
              const passRate = Number(evidence.passRate);
              return {
                fingerprint,
                reference,
                score: Number.isFinite(averageScore)
                  ? Math.round(averageScore * 100) + "%"
                  : Number.isFinite(passRate)
                    ? Math.round(passRate * 100) + "%"
                    : "",
              };
            };
            return React.createElement("div", { className: "playground-tasks-detail-shell" },
              React.createElement("div", { className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""), ref: taskDetailMainRef },
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar" },
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
                    React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                      React.createElement("div", { className: "playground-content-title" }, "Strategy")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-tasks-detail-navbar-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain",
                      onClick: () => setMissionControlStrategyOpen(false),
                      title: "Close strategy",
                      "aria-label": "Close strategy",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-body" },
                  React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                    React.createElement("div", { className: "playground-tasks-detail-facts" },
                      React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-detail-facts-toggle" + (missionControlDetailsCollapsed ? " is-collapsed" : ""),
                          onClick: () => setMissionControlDetailsCollapsed((current) => !current),
                          title: missionControlDetailsCollapsed ? "Expand details" : "Collapse details",
                          "aria-label": missionControlDetailsCollapsed ? "Expand details" : "Collapse details",
                          "aria-expanded": missionControlDetailsCollapsed ? "false" : "true",
                        }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                      ),
                      !missionControlDetailsCollapsed
                        ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                            missionControlTaskCount > 0
                              ? React.createElement("div", { className: "playground-mission-control-status-overview" },
                                  React.createElement("div", { className: "playground-mission-control-status-metrics" },
                                    missionControlStatusMetrics.map((metric) =>
                                      React.createElement("div", {
                                        key: metric.key,
                                        className: "playground-mission-control-status-metric",
                                      },
                                        React.createElement("div", { className: "playground-mission-control-status-value" }, String(metric.count)),
                                        metric.label
                                          ? React.createElement("div", { className: "playground-mission-control-status-label " + metric.toneClassName },
                                              React.createElement("span", null, metric.label),
                                              React.createElement(getPlaygroundSafeIconComponent(metric.Icon, Circle), { strokeWidth: 1.8 })
                                            )
                                          : null
                                      )
                                    )
                                  ),
                                  React.createElement("div", {
                                    className: "playground-mission-control-status-bar" + (missionControlStatusSegments.length === 0 ? " is-empty" : ""),
                                    "aria-label": "Project task progress overview",
                                  },
                                    missionControlStatusSegments.map((segment) =>
                                      React.createElement("div", {
                                        key: segment.key,
                                        className: "playground-mission-control-status-segment " + segment.className,
                                        style: {
                                          width: segment.percentage + "%",
                                          flex: "0 0 " + segment.percentage + "%",
                                        },
                                        title: Math.round(segment.percentage) + "% " + segment.key.replace("-", " "),
                                      })
                                    )
                                  )
                                )
                              : null,
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Number of tasks"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, String(missionControlTaskCount))
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Open tasks"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, String(missionControlOpenTaskCount))
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", {
                                className: "playground-tasks-detail-fact-label",
                                style: { whiteSpace: "nowrap" },
                              }, "Mission Confidence"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, "100%")
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-mission-control-run-button",
                              disabled: isSelectedProjectMissionControlRunning,
                              onClick: () => openMissionControlComposer({ keepStrategyOpen: true }),
                            },
                              isSelectedProjectMissionControlRunning
                                ? React.createElement(React.Fragment, null,
                                    React.createElement(Loader2, { className: "playground-mission-control-run-button-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Running Mission Control")
                                  )
                                : React.createElement(React.Fragment, null,
                                    React.createElement(Rocket, { className: "playground-mission-control-run-button-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Run Mission Control")
                                  )
                            )
                          )
                        : null
                    ),
                    React.createElement(PlatformUiCard, {
                        as: "section",
                        variant: "sidebar",
                        cardTitle: "Delivery execution",
                        className: "playground-mission-control-delivery-card",
                        headerActions: deliveryExecution
                          ? React.createElement(PlatformLabel, {
                              variant: deliveryStatusVariants[deliveryExecutionStatus] || "gray",
                            }, deliveryExecutionStatus.replaceAll("_", " ") || "Queued")
                          : null,
                      },
                      deliveryExecution
                        ? React.createElement(React.Fragment, null,
                            deliveryRepairEpisode
                              ? React.createElement("div", {
                                  className: "playground-mission-control-delivery-approval",
                                },
                                React.createElement("strong", null,
                                  deliveryRepairStatus === "passed"
                                    ? "Autonomous repair passed"
                                    : deliveryRepairStatus === "exhausted"
                                      ? "Autonomous repair exhausted"
                                      : deliveryRepairStatus === "failed"
                                        ? "Autonomous repair failed"
                                        : "Autonomous repair active"
                                ),
                                React.createElement("span", null,
                                  "Attempt "
                                  + String(deliveryRepairEpisode.repairAttempt || 0)
                                  + " of "
                                  + String(deliveryRepairEpisode.maximumAttempts || 0)
                                  + " · "
                                  + String(deliveryRepairEpisode.sourceStage || "test")
                                  + " · "
                                  + formatDeliveryEvidenceFingerprint(
                                    deliveryRepairEpisode.diagnosticFingerprint,
                                  )
                                  + (
                                    Array.isArray(deliveryRepairEpisode.allowedResourceKeys)
                                    && deliveryRepairEpisode.allowedResourceKeys.length
                                      ? " · targets "
                                        + deliveryRepairEpisode.allowedResourceKeys.join(", ")
                                      : ""
                                  )
                                  + (
                                    Number.isFinite(Number(deliveryRepairEpisode.averageScore))
                                    && Number.isFinite(Number(deliveryRepairEpisode.minimumAverageScore))
                                      ? " · score "
                                        + Number(deliveryRepairEpisode.averageScore).toFixed(2)
                                        + "/"
                                        + Number(deliveryRepairEpisode.minimumAverageScore).toFixed(2)
                                      : ""
                                  )
                                )
                              )
                              : null,
                            React.createElement("div", { className: "playground-mission-control-delivery-stages" },
                              deliveryStages.map((stage) => {
                                const evidenceSummary = getDeliveryStageEvidenceSummary(stage);
                                const showEvidence = Boolean(
                                  evidenceSummary.reference
                                  || evidenceSummary.fingerprint
                                  || evidenceSummary.score,
                                );
                                return React.createElement("div", {
                                    key: stage.id,
                                    className: "playground-mission-control-delivery-stage is-" + stage.status,
                                  },
                                  React.createElement("div", {
                                      className: "playground-mission-control-delivery-stage-heading",
                                    },
                                    React.createElement("span", {
                                      className: "playground-mission-control-delivery-stage-indicator is-" + stage.status,
                                      "aria-hidden": "true",
                                    }),
                                    React.createElement("span", {
                                      className: "playground-mission-control-delivery-stage-label",
                                    }, stage.label),
                                    stage.retryCount > 0
                                      ? React.createElement("span", {
                                          className: "playground-mission-control-delivery-stage-attempt",
                                        }, "Retry " + stage.retryCount)
                                      : null,
                                    React.createElement(PlatformLabel, {
                                      variant: deliveryStatusVariants[stage.status] || "gray",
                                    }, stage.status.replaceAll("_", " "))
                                  ),
                                  showEvidence
                                    ? React.createElement("div", {
                                        className: "playground-mission-control-delivery-evidence",
                                      },
                                      evidenceSummary.reference
                                        ? React.createElement("span", {
                                            title: evidenceSummary.reference,
                                          }, evidenceSummary.reference)
                                        : null,
                                      evidenceSummary.score
                                        ? React.createElement("strong", null, evidenceSummary.score)
                                        : null,
                                      evidenceSummary.fingerprint
                                        ? React.createElement("code", {
                                            title: evidenceSummary.fingerprint,
                                          }, formatDeliveryEvidenceFingerprint(
                                            evidenceSummary.fingerprint,
                                          ))
                                        : null
                                    )
                                    : null,
                                  stage.error
                                    ? React.createElement("div", {
                                        className: "playground-mission-control-delivery-stage-error",
                                      }, stage.error)
                                    : null
                                );
                              })
                            ),
                            React.createElement("div", { className: "playground-mission-control-delivery-budget" },
                              React.createElement("span", null, "Verified cost"),
                              React.createElement("span", null,
                                (Number.isFinite(deliveryCostUsd) ? deliveryCostUsd : 0).toLocaleString(undefined, {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 2,
                                })
                                + " / "
                                + (Number.isFinite(deliveryBudgetUsd) ? deliveryBudgetUsd : 0).toLocaleString(undefined, {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 2,
                                })
                              )
                            ),
                            deliveryExecution.lastError
                              ? React.createElement("div", { className: "playground-mission-control-delivery-error" }, String(deliveryExecution.lastError))
                              : null,
                            deliveryApprovalRequired
                              ? React.createElement("div", {
                                  className: "playground-mission-control-delivery-approval",
                                },
                                React.createElement("strong", null, "Evidence approval required"),
                                React.createElement("span", null,
                                  "Approval is bound to "
                                  + formatDeliveryEvidenceFingerprint(
                                    assuranceEvidenceFingerprint,
                                  )
                                  + "."
                                )
                              )
                              : null,
                            missionControlDeliveryActionState.error
                              ? React.createElement("div", {
                                  className: "playground-mission-control-delivery-error",
                                }, missionControlDeliveryActionState.error)
                              : null,
                            deliveryExecutionEvents.length > 0
                              ? React.createElement("div", {
                                  className: "playground-mission-control-delivery-events",
                                },
                                React.createElement("div", {
                                  className: "playground-mission-control-delivery-events-title",
                                }, "Audit trail"),
                                deliveryExecutionEvents.map((event) =>
                                  React.createElement("div", {
                                      key: event.id,
                                      className: "playground-mission-control-delivery-event",
                                    },
                                    React.createElement("span", null,
                                      String(event.type || "event").replaceAll(".", " ")
                                    ),
                                    React.createElement("time", {
                                      dateTime: event.createdAt || undefined,
                                    }, formatRelativeThreadTime(event.createdAt)
                                      || formatPlaygroundFileDate(event.createdAt))
                                  )
                                )
                              )
                              : null,
                            React.createElement("div", {
                                className: "playground-mission-control-delivery-actions",
                              },
                              deliveryApprovalRequired
                                ? React.createElement(PlatformPrimaryButton, {
                                    type: "button",
                                    size: "small",
                                    disabled: deliveryActionPending,
                                    onClick: () => setMissionControlDeliveryApprovalOpen(true),
                                  }, "Approve evidence")
                                : null,
                              deliveryRetryable
                                ? React.createElement(PlatformPrimaryButton, {
                                    type: "button",
                                    size: "small",
                                    disabled: deliveryActionPending,
                                    onClick: () => void requestMissionControlDeliveryAction("retry"),
                                  }, missionControlDeliveryActionState.action === "retry"
                                    ? "Retrying…"
                                    : "Retry " + (deliveryCurrentStage?.label || "stage"))
                                : null,
                              ["queued", "running", "blocked"].includes(deliveryExecutionStatus)
                                ? React.createElement(PlatformSecondaryButton, {
                                    type: "button",
                                    size: "small",
                                    disabled: deliveryActionPending,
                                    onClick: () => void requestMissionControlDeliveryAction("reconcile"),
                                  }, missionControlDeliveryActionState.action === "reconcile"
                                    ? "Checking…"
                                    : "Check now")
                                : null,
                              ["queued", "running", "blocked"].includes(deliveryExecutionStatus)
                                ? React.createElement(PlatformSecondaryButton, {
                                    type: "button",
                                    size: "small",
                                    disabled: deliveryActionPending,
                                    onClick: () => void requestMissionControlDeliveryAction("cancel"),
                                  }, missionControlDeliveryActionState.action === "cancel"
                                    ? "Cancelling…"
                                    : "Cancel")
                                : null,
                              deliveryNeedsRevision
                                ? React.createElement(PlatformSecondaryButton, {
                                    type: "button",
                                    size: "small",
                                    disabled: deliveryActionPending || isSelectedProjectMissionControlRunning,
                                    onClick: () => openMissionControlComposer({
                                      keepStrategyOpen: true,
                                    }),
                                  }, "Revise with Mission Control")
                                : null
                            )
                          )
                        : React.createElement("div", { className: "playground-mission-control-delivery-empty" },
                            React.createElement("span", null,
                              missionControlDeliveryExecutionState.status === "loading"
                                ? "Loading the canonical execution…"
                                : missionControlDeliveryExecutionState.error
                                  ? missionControlDeliveryExecutionState.error
                                  : deliveryPlanStatus === "ready"
                                    ? "The verified delivery graph is ready to run."
                                    : "Run Mission Control to create and provision the delivery graph."
                            ),
                            deliveryPlanStatus === "ready"
                              ? React.createElement(PlatformPrimaryButton, {
                                  type: "button",
                                  size: "small",
                                  disabled: deliveryActionPending,
                                  onClick: () => void requestMissionControlDeliveryAction("start"),
                                }, missionControlDeliveryActionState.action === "start"
                                  ? "Starting…"
                                  : "Start delivery")
                              : null
                          )
                    ),
                    React.createElement("div", { className: "playground-tasks-comments" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Comments"),
                      selectedProjectMissionComments.length > 0
                        ? React.createElement("div", { className: "playground-tasks-comments-list" },
                            selectedProjectMissionComments.map((comment) =>
                              React.createElement("div", {
                                key: comment.id,
                                className: "playground-tasks-comment",
                              },
                                renderTaskCommentAvatar(comment, "playground-tasks-comment-avatar"),
                                React.createElement("div", { className: "playground-tasks-comment-body" },
                                  React.createElement("div", { className: "playground-tasks-comment-meta" },
                                    React.createElement("span", { className: "playground-tasks-comment-author" }, getTaskCommentDisplayName(comment)),
                                    React.createElement("span", { className: "playground-tasks-comment-time" }, formatRelativeThreadTime(comment.createdAt) || formatPlaygroundFileDate(comment.createdAt))
                                  ),
                                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: comment.text,
                                    className: "playground-tasks-comment-text tb-message-markdown",
                                  })
                                )
                              )
                            )
                          )
                        : React.createElement("div", { className: "playground-tasks-secondary-copy playground-tasks-comment-empty" }, "No comments yet.")
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-comment-dock" },
                    missionControlSaveState.error
                      ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, missionControlSaveState.error)
                      : missionControlSaveState.isSaving
                        ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
                        : missionControlSaveState.message
                          ? React.createElement("div", { className: "playground-environments-success playground-tasks-comment-feedback" }, missionControlSaveState.message)
                          : null,
                    React.createElement("div", { className: "playground-tasks-comment-runner" },
                      React.createElement("div", { className: "playground-tasks-comment-bar" },
                        React.createElement("textarea", {
                          rows: 1,
                          className: "playground-tasks-comment-input",
                          placeholder: "Add a comment",
                          value: missionControlCommentInputValue,
                          onChange: (event) => {
                            setMissionControlCommentInputValue(event.target.value);
                            resizeTaskCommentTextarea(event.currentTarget);
                          },
                          onKeyDown: (event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void handleAddMissionControlComment();
                            }
                          },
                        }),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-comment-send-button",
                          onClick: () => void handleAddMissionControlComment(),
                          disabled: missionControlSaveState.isSaving || !String(missionControlCommentInputValue || "").trim(),
                          "aria-label": "Send comment",
                          title: "Send comment",
                        },
                          React.createElement(ArrowUp, { className: "playground-tasks-comment-send-icon", strokeWidth: 1.9 })
                        )
                      )
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-preview-pane" },
                previewedProjectAttachment
                  ? React.createElement("div", { className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-tasks-detail-preview-host playground-tasks-project-modal-preview" },
                      React.createElement(RunnerDocumentPreviewDrawer, {
                        attachment: previewedProjectAttachment,
                        backendUrl,
                        requestHeaders,
                        inline: true,
                        onClose: () => setProjectPreviewedAttachmentId(""),
                        showResizeHandle: false,
                      })
                    )
                  : null
              ),
              React.createElement(PlatformModal, {
                  open: missionControlDeliveryApprovalOpen,
                  visible: missionControlDeliveryApprovalOpen,
                  size: "medium",
                  title: "Approve delivery evidence",
                  className: "playground-mission-control-delivery-approval-modal",
                  closeButtonDisabled: deliveryActionPending,
                  onClose: () => {
                    if (!deliveryActionPending) {
                      setMissionControlDeliveryApprovalOpen(false);
                    }
                  },
                  footer: React.createElement(React.Fragment, null,
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      size: "medium",
                      disabled: deliveryActionPending,
                      onClick: () => setMissionControlDeliveryApprovalOpen(false),
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      type: "button",
                      size: "medium",
                      disabled: deliveryActionPending
                        || !deliveryApprovalRequired,
                      onClick: async () => {
                        const approved = await approveMissionControlDeliveryAssurance();
                        if (approved) {
                          setMissionControlDeliveryApprovalOpen(false);
                        }
                      },
                    }, missionControlDeliveryActionState.action === "approve"
                      ? "Approving…"
                      : "Approve evidence")
                  ),
                },
                React.createElement("div", {
                    className: "playground-mission-control-delivery-approval-copy",
                  },
                  React.createElement("p", null,
                    "This approval is permanently bound to the exact canonical evidence fingerprint below. Changed evidence requires a new approval."
                  ),
                  React.createElement("code", {
                    title: assuranceEvidenceFingerprint,
                  }, assuranceEvidenceFingerprint || "Evidence unavailable")
                )
              )
            );
          }

          if (!draftTask && isCalendarContext && scheduleViewMode === "setup") {
            return renderScheduleDetailPanel();
          }

          if (!draftTask) {
            if (taskLoadState.status === "loading" || pendingExternalTaskOpenRequest) {
              return React.createElement(PlatformLoadingState, {
                className: "playground-environments-detail-scroll playground-environments-detail-empty playground-tasks-detail-sidebar-loading-state",
                message: "Loading ticket...",
                centered: true,
              });
            }
            if (taskLoadState.status === "error") {
              return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, "Ticket unavailable"),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, taskLoadState.error || "The task details could not be loaded."),
                  selectedProjectId
                    ? React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                        type: "button",
                        className: "playground-environments-action-button is-primary",
                        onClick: () => void loadProjectWorkspace(selectedProjectId),
                      }, "Retry")
                    : null
                )
              );
            }
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
              React.createElement("div", { className: "playground-tasks-empty" },
                React.createElement("div", { className: "playground-tasks-empty-title" }, "Pick a task"),
                React.createElement("div", { className: "playground-tasks-empty-copy" }, "Select a task from backlog, board, or a milestone backlog to edit assignments, dependencies, attachments, and scheduling.")
              )
            );
          }

          const dependencyCandidates = sortedTasks
            .filter((task) => task.id !== draftTask.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
          });
          const startedThreadId = getTaskStartedThreadId(draftTask);
          const isTaskConfigLocked = false;
          const activeTicketNumber = taskTicketNumbersById[draftTask.id] || draftTask.ticketNumber || "001";
          const activeTaskType = normalizePlaygroundTaskType(draftTask.taskType);
          const activeTaskReleaseId = draftTask.releaseId || "";
          const blockedByTaskId = draftTask.dependencyIds[0] || "";
          const hasTaskAttachments = draftTask.attachments.length > 0;
          const taskScheduleSummary = formatPlaygroundTaskScheduleSummary(draftTask);
          const draftTaskParentLabel = draftTaskParentTask
            ? ((taskTicketNumbersById[draftTaskParentTask.id] || draftTaskParentTask.ticketNumber || "000") + " " + (draftTaskParentTask.title || "Untitled Task"))
            : "Choose parent";
          const draftTaskParentTicketNumber = draftTaskParentTask
            ? (taskTicketNumbersById[draftTaskParentTask.id] || draftTaskParentTask.ticketNumber || "000")
            : "";
          const taskComments = normalizePlaygroundTaskCommentList(draftTask.comments)
            .slice()
            .sort((left, right) => {
              const leftTimestamp = Date.parse(String(left.createdAt || ""));
              const rightTimestamp = Date.parse(String(right.createdAt || ""));
              const normalizedLeftTimestamp = Number.isFinite(leftTimestamp) ? leftTimestamp : 0;
              const normalizedRightTimestamp = Number.isFinite(rightTimestamp) ? rightTimestamp : 0;
              return normalizedRightTimestamp - normalizedLeftTimestamp;
            });
          const isFullPageTaskDetail = Boolean(projectTaskDetailScreenOpen);
          const taskConnectorEntries = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, draftTask);
            return {
              ...option,
              selection,
              valueLabel: selection?.valueLabel || "None",
            };
          });
          const activeTaskPriorityPresentation = getPlaygroundTaskPriorityPresentation(draftTask.priority);
          const activeTaskColorPresentation = getPlaygroundTaskColorPresentation(draftTask.taskColor);
          const ActiveTaskTypeIcon = activeTaskType === "subtask" ? Check : (activeTaskType === "loop" ? RefreshCw : Bookmark);
          const startedThreadRecord = startedThreadId
            ? selectedProjectRecentThreads.find((thread) => thread.id === startedThreadId) || null
            : null;
          const linkedRunPresentation = getTaskLinkedRunPresentation(startedThreadRecord);
          const activeTaskTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === activeTaskType)?.label || "Task";
          const activeReleaseLabel = activeTaskReleaseId
            ? (releasesById[activeTaskReleaseId]?.name || releases.find((release) => release.id === activeTaskReleaseId)?.name || "Milestone")
            : "None";
          const resolvedTaskAssigneeId = draftTask.assigneeAgentId || defaultTaskAssigneeId || "";
	          const activeAssigneeLabel = resolvedTaskAssigneeId
	            ? getTaskAssigneeName(resolvedTaskAssigneeId, "Unassigned")
	            : "Unassigned";
	          const resolvedTaskReviewerId = draftTask.reviewRequired
	            ? String(draftTask.reviewerAgentId || "").trim()
	            : "";
	          const activeReviewerLabel = draftTask.reviewRequired
	            ? (resolvedTaskReviewerId ? getTaskAssigneeName(resolvedTaskReviewerId, "Reviewer") : "Review required")
	            : "No review";
          const activeBlockedByTask = blockedByTaskId ? (tasksById[blockedByTaskId] || null) : null;
          const activeBlockedByLabel = activeBlockedByTask
            ? ((taskTicketNumbersById[activeBlockedByTask.id] || activeBlockedByTask.ticketNumber || "000") + " - " + (activeBlockedByTask.title || "Untitled Task"))
            : "None";
          const activeAssigneeActor = resolvedTaskAssigneeId
            ? (assignableActorsById[resolvedTaskAssigneeId] || null)
            : null;
          const activeReviewerActor = resolvedTaskReviewerId
            ? (assignableActorsById[resolvedTaskReviewerId] || null)
            : null;
          const defaultTaskAssigneePopupMode = getDefaultTaskActorPopupMode(activeAssigneeActor);
          const defaultTaskReviewerPopupMode = getDefaultTaskActorPopupMode(activeReviewerActor);

          function createTaskDetailSelectorOption({ value, label, description, leading = null, trailing = null, onSelect, disabled = false }) {
            return {
              value: String(value || ""),
              label,
              description: description || undefined,
              leading: leading || undefined,
              trailing: trailing || undefined,
              disabled,
              onSelect,
            };
          }

          function renderTaskDetailSelectControl({
            popoverId,
            value,
            valueLabel,
            disabled = false,
            isEmpty = false,
            buttonContent = null,
            popupClassName = "",
            popupHeader = null,
            popupHeaderClassName = "",
            popupContent = null,
            popupAriaLabel = "",
            open = null,
            onOpenChange = null,
            popupWidth = "min(280px, calc(100vw - 48px))",
            popupMaxHeight = "min(320px, calc(100vh - 120px))",
            options = [],
            emptyContent = "No options available.",
`;
