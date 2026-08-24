export const PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT = String.raw`
          const PROJECT_ACTIVITY_EVENT_TYPES = Object.freeze([
            {
              id: "project_updates",
              label: "Project updates",
              description: "Authored health and progress updates.",
              presentation: "card",
              defaultEnabled: true,
            },
            {
              id: "comments",
              label: "Comments",
              description: "Project-level comments and discussion.",
              presentation: "card",
              defaultEnabled: true,
            },
            {
              id: "mission_control",
              label: "Mission Control",
              description: "Plans, reviews, and project-level reports from Mission Control.",
              presentation: "card",
              defaultEnabled: true,
            },
            {
              id: "milestones",
              label: "Milestones",
              description: "New milestones, progress changes, and completions.",
              presentation: "mixed",
              defaultEnabled: true,
            },
            {
              id: "issue_progress",
              label: "Issue progress",
              description: "Issues created, completed, reopened, or otherwise advanced.",
              presentation: "line",
              defaultEnabled: true,
            },
            {
              id: "assignments",
              label: "Assignments",
              description: "Assignee, reviewer, and ownership changes.",
              presentation: "line",
              defaultEnabled: true,
            },
            {
              id: "schedules",
              label: "Schedules",
              description: "Due dates, planned windows, and schedule changes.",
              presentation: "line",
              defaultEnabled: true,
            },
            {
              id: "threads",
              label: "Threads",
              description: "Agent threads started from this project.",
              presentation: "line",
              defaultEnabled: true,
            },
            {
              id: "project_changes",
              label: "Project changes",
              description: "Project creation and other project-level lifecycle changes.",
              presentation: "line",
              defaultEnabled: true,
            },
          ]);

          function getProjectActivityMetadata(projectRecord = projectOverviewDraft || selectedProject) {
            return projectRecord?.metadata
              && typeof projectRecord.metadata === "object"
              && !Array.isArray(projectRecord.metadata)
                ? projectRecord.metadata
                : {};
          }

          function getProjectActivityTimelinePreferences(projectRecord = projectOverviewDraft || selectedProject) {
            const metadata = getProjectActivityMetadata(projectRecord);
            const storedPreferences = metadata.projectTimelinePreferences
              && typeof metadata.projectTimelinePreferences === "object"
              && !Array.isArray(metadata.projectTimelinePreferences)
                ? metadata.projectTimelinePreferences
                : {};
            return PROJECT_ACTIVITY_EVENT_TYPES.reduce((preferences, eventType) => {
              preferences[eventType.id] = Object.prototype.hasOwnProperty.call(storedPreferences, eventType.id)
                ? storedPreferences[eventType.id] !== false
                : eventType.defaultEnabled !== false;
              return preferences;
            }, {});
          }

          function isProjectActivityEventTypeEnabled(eventTypeId, projectRecord = projectOverviewDraft || selectedProject) {
            const preferences = getProjectActivityTimelinePreferences(projectRecord);
            return preferences[String(eventTypeId || "").trim()] !== false;
          }

          async function setProjectActivityEventTypeEnabled(eventTypeId, enabled) {
            const normalizedEventTypeId = String(eventTypeId || "").trim();
            if (!PROJECT_ACTIVITY_EVENT_TYPES.some((eventType) => eventType.id === normalizedEventTypeId)) {
              return null;
            }
            const nextPreferences = {
              ...getProjectActivityTimelinePreferences(),
              [normalizedEventTypeId]: enabled !== false,
            };
            return persistProjectOverviewSidebarProjectUpdate({}, {
              projectTimelinePreferences: nextPreferences,
            });
          }

          function getProjectActivityInteractionRecords(projectRecord = projectOverviewDraft || selectedProject) {
            const metadata = getProjectActivityMetadata(projectRecord);
            const rawRecords = metadata.projectTimelineInteractions;
            const candidates = Array.isArray(rawRecords)
              ? rawRecords
              : rawRecords && typeof rawRecords === "object"
                ? Object.entries(rawRecords).map(([eventId, value]) => ({
                    ...(value && typeof value === "object" && !Array.isArray(value) ? value : {}),
                    eventId,
                  }))
                : [];
            const seen = new Set();
            return candidates.map((record) => {
              if (!record || typeof record !== "object" || Array.isArray(record)) return null;
              const eventId = String(record.eventId || record.id || "").trim();
              if (!eventId || seen.has(eventId)) return null;
              seen.add(eventId);
              return {
                eventId,
                comments: (Array.isArray(record.comments) ? record.comments : [])
                  .map(normalizeProjectOverviewUpdateComment)
                  .filter(Boolean),
                reactions: (Array.isArray(record.reactions) ? record.reactions : [])
                  .map(normalizeProjectOverviewUpdateReaction)
                  .filter(Boolean),
                updatedAt: String(record.updatedAt || "").trim(),
              };
            }).filter(Boolean);
          }

          function getProjectActivityInteractionRecord(eventId) {
            const normalizedEventId = String(eventId || "").trim();
            return getProjectActivityInteractionRecords().find((record) => record.eventId === normalizedEventId)
              || { eventId: normalizedEventId, comments: [], reactions: [], updatedAt: "" };
          }

          async function persistProjectActivityInteractionRecord(nextRecord) {
            const normalizedEventId = String(nextRecord?.eventId || "").trim();
            if (!normalizedEventId) return null;
            const currentRecords = getProjectActivityInteractionRecords();
            const nextRecords = currentRecords
              .filter((record) => record.eventId !== normalizedEventId)
              .concat({
                eventId: normalizedEventId,
                comments: Array.isArray(nextRecord.comments) ? nextRecord.comments : [],
                reactions: Array.isArray(nextRecord.reactions) ? nextRecord.reactions : [],
                updatedAt: new Date().toISOString(),
              });
            return persistProjectOverviewSidebarProjectUpdate({}, {
              projectTimelineInteractions: nextRecords,
            });
          }

          function setProjectActivityCommentOpen(eventId, open) {
            const normalizedEventId = String(eventId || "").trim();
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedEventId,
              commentOpen: open !== false,
              emojiOpen: false,
              commentValue: open === false ? "" : current?.updateId === normalizedEventId ? current.commentValue : "",
              error: "",
            }));
          }

          function setProjectActivityEmojiOpen(eventId, open) {
            const normalizedEventId = String(eventId || "").trim();
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedEventId,
              commentOpen: false,
              emojiOpen: open !== false,
              error: "",
            }));
          }

          async function postProjectActivityComment(eventId, mentions = [], submittedBody = "") {
            const normalizedEventId = String(eventId || "").trim();
            const body = String(
              submittedBody || projectOverviewUpdateInteractionState?.commentValue || ""
            ).trim();
            if (!normalizedEventId || !body || projectOverviewUpdateInteractionState?.isSaving) return;
            const currentRecord = getProjectActivityInteractionRecord(normalizedEventId);
            const comment = normalizeProjectOverviewUpdateComment({
              id: "project_timeline_comment_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
              body,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              authorUserId: currentUserId,
              authorName: currentUserName,
              authorEmail: currentUserEmail,
              authorAvatarUrl: currentUserAvatarUrl,
            });
            if (!comment) return;
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedEventId,
              isSaving: true,
              error: "",
            }));
            let updatedProject = null;
            try {
              const projectId = String(selectedProjectId || selectedProject?.id || "").trim();
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId)
                  + "/activity/" + encodeURIComponent(normalizedEventId) + "/comments",
                {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    idempotencyKey: comment.id,
                    body,
                    mentions: Array.isArray(mentions) ? mentions : [],
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok && response.status !== 404 && response.status !== 405) {
                throw new Error(data?.message || data?.error || "Failed to add comment.");
              }
              const responseProject = response.ok
                ? getPlaygroundProjectResponseRecord(data, null)
                : null;
              if (responseProject?.id) {
                commitProjectOverviewSidebarProjectRecord(responseProject);
                updatedProject = responseProject;
              } else {
                updatedProject = await persistProjectActivityInteractionRecord({
                  ...currentRecord,
                  comments: currentRecord.comments.concat(comment),
                });
              }
            } catch (error) {
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                updateId: normalizedEventId,
                commentOpen: true,
                commentValue: body,
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to add comment.",
              }));
              return false;
            }
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedEventId,
              commentOpen: !updatedProject?.id,
              commentValue: updatedProject?.id ? "" : body,
              isSaving: false,
              error: updatedProject?.id ? "" : "Failed to add comment.",
            }));
            return Boolean(updatedProject?.id);
          }

          async function toggleProjectActivityReaction(eventId, emoji) {
            const normalizedEventId = String(eventId || "").trim();
            const normalizedEmoji = String(emoji || "").trim();
            if (!normalizedEventId || !normalizedEmoji || projectOverviewUpdateInteractionState?.reactionSaving) return;
            const currentRecord = getProjectActivityInteractionRecord(normalizedEventId);
            const viewerId = String(currentUserId || currentUserEmail || "current-user").trim();
            const existingReaction = currentRecord.reactions.find((reaction) => reaction.emoji === normalizedEmoji);
            const userIds = new Set(Array.isArray(existingReaction?.userIds) ? existingReaction.userIds : []);
            if (userIds.has(viewerId)) userIds.delete(viewerId);
            else userIds.add(viewerId);
            const nextReaction = normalizeProjectOverviewUpdateReaction({
              emoji: normalizedEmoji,
              userIds: Array.from(userIds),
            });
            const nextReactions = currentRecord.reactions
              .filter((reaction) => reaction.emoji !== normalizedEmoji)
              .concat(nextReaction ? [nextReaction] : []);
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedEventId,
              emojiOpen: false,
              reactionSaving: normalizedEmoji,
              error: "",
            }));
            const updatedProject = await persistProjectActivityInteractionRecord({
              ...currentRecord,
              reactions: nextReactions,
            });
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedEventId,
              reactionSaving: "",
              error: updatedProject?.id ? "" : "Failed to update reaction.",
            }));
          }

          function getProjectActivityEventTimestamp(...values) {
            for (const value of values) {
              if (typeof value === "number" && Number.isFinite(value) && value > 0) {
                return value < 100000000000 ? value * 1000 : value;
              }
              const normalizedValue = String(value || "").trim();
              if (!normalizedValue) continue;
              const timestamp = Date.parse(normalizedValue);
              if (Number.isFinite(timestamp)) return timestamp;
            }
            return 0;
          }

          function getProjectActivityTaskEventType(event) {
            if (event?.eventType === "thread_started") return "threads";
            if (event?.eventType === "field_changed") {
              const fieldName = String(event.fieldName || "").trim().toLowerCase();
              if (["assigneeagentid", "reviewerid", "ownerid", "leadid"].includes(fieldName)) {
                return "assignments";
              }
              if ([
                "dueat",
                "scheduledstartat",
                "scheduledendat",
                "scheduletype",
                "cronexpression",
                "scheduletimezone",
                "scheduleenabled",
              ].includes(fieldName)) {
                return "schedules";
              }
              if (["releaseid", "milestoneid"].includes(fieldName)) return "milestones";
            }
            return "issue_progress";
          }

          function getProjectActivityEventsForTask(taskId) {
            const normalizedTaskId = String(taskId || "").trim();
            if (!normalizedTaskId) return [];
            return (Array.isArray(projectOverviewTaskActivityState?.items)
              ? projectOverviewTaskActivityState.items
              : [])
              .filter((event) => {
                const eventTaskId = String(
                  event?.taskId
                    || event?.task_id
                    || event?.task?.id
                    || event?.source?.taskId
                    || event?.source?.task?.id
                    || ""
                ).trim();
                const fieldName = String(event?.fieldName || "").trim().toLowerCase();
                return eventTaskId === normalizedTaskId
                  && event?.eventType !== "comment_added"
                  && !(event?.eventType === "field_changed" && fieldName === "description")
                  && event?.eventType !== "project_update_posted";
              });
          }

          function buildProjectActivityTaskEvents() {
            return (Array.isArray(projectOverviewTaskActivityState?.items)
              ? projectOverviewTaskActivityState.items
              : [])
              .filter((event) => {
                const fieldName = String(event?.fieldName || "").trim().toLowerCase();
                return event?.eventType !== "comment_added"
                  && !(event?.eventType === "field_changed" && fieldName === "description")
                  && event?.eventType !== "project_update_posted";
              })
              .map((event, index) => ({
                id: String(event.id || "task-event-" + index + "-" + String(event.createdAt || "")),
                eventType: getProjectActivityTaskEventType(event),
                presentation: "line",
                timestamp: getProjectActivityEventTimestamp(event.createdAt),
                source: event,
              }));
          }

          function buildProjectActivityThreadEvents() {
            const existingThreadIds = new Set(
              (Array.isArray(projectOverviewTaskActivityState?.items) ? projectOverviewTaskActivityState.items : [])
                .filter((event) => event?.eventType === "thread_started")
                .map((event) => String(
                  event?.thread?.id
                    || event?.threadId
                    || event?.metadata?.threadId
                    || event?.metadata?.thread_id
                    || ""
                ).trim())
                .filter(Boolean)
            );
            return (Array.isArray(projectOverviewFilteredThreads) ? projectOverviewFilteredThreads : [])
              .map((thread, index) => {
                const threadId = String(thread?.id || "").trim();
                if (threadId && existingThreadIds.has(threadId)) return null;
                return {
                  id: "thread:" + String(threadId || index),
                  eventType: "threads",
                  presentation: "line",
                  timestamp: getProjectActivityEventTimestamp(thread?.createdAt, thread?.updatedAt),
                  source: thread,
                  isThreadRecord: true,
                };
              })
              .filter(Boolean);
          }

          function buildProjectActivityRichEvents() {
            const events = [];
            getProjectOverviewUpdateRecords().forEach((record, index) => {
              const isComment = normalizeProjectOverviewUpdateKind(record.kind) === "comment";
              events.push({
                id: "update:" + String(record.id || index + ":" + String(record.createdAt || "")),
                eventType: isComment ? "comments" : "project_updates",
                presentation: "card",
                timestamp: getProjectActivityEventTimestamp(record.createdAt, record.updatedAt),
                source: record,
                cardType: isComment ? "project_comment" : "project_update",
              });
            });
            const missionControl = selectedProjectMissionControl;
            const missionControlActivityLines = missionControl
              ? resolveProjectMissionControlActivityLines(missionControl)
              : [];
            if (
              missionControl
              && missionControlActivityLines.length > 0
              && (
                String(missionControl.summary || "").trim()
                || String(missionControl.document || "").trim()
                || String(missionControl.updatedAt || "").trim()
              )
            ) {
              events.push({
                id: "mission-control:" + String(selectedProjectId || selectedProject?.id || "project"),
                eventType: "mission_control",
                presentation: "card",
                timestamp: getProjectActivityEventTimestamp(missionControl.updatedAt, selectedProject?.updatedAt),
                source: missionControl,
                cardType: "mission_control",
              });
            }
            getProjectOverviewMilestoneRecords().forEach((release, index) => {
              events.push({
                id: "milestone:" + String(release.id || index),
                eventType: "milestones",
                presentation: "card",
                timestamp: getProjectActivityEventTimestamp(release.createdAt, release.updatedAt),
                source: release,
                cardType: "milestone_created",
              });
            });
            const creationUpdate = getProjectOverviewCreationUpdate();
            if (creationUpdate) {
              events.push({
                id: "project-created:" + String(selectedProjectId || selectedProject?.id || "project"),
                eventType: "project_changes",
                presentation: "line",
                timestamp: getProjectActivityEventTimestamp(creationUpdate.createdAt),
                source: creationUpdate,
                isProjectCreation: true,
              });
            }
            return events;
          }

          function getProjectActivityFeedEvents() {
            const seen = new Set();
            return buildProjectActivityRichEvents()
              .concat(buildProjectActivityTaskEvents(), buildProjectActivityThreadEvents())
              .filter((event) => {
                if (!event?.id || seen.has(event.id)) return false;
                seen.add(event.id);
                return isProjectActivityEventTypeEnabled(event.eventType);
              })
              .sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0));
          }

          function getProjectActivityGroupLabel(timestamp) {
            if (!timestamp) return "Earlier";
            const date = new Date(timestamp);
            if (!Number.isFinite(date.getTime())) return "Earlier";
            const now = new Date();
            const dateCalendarDay = Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            );
            const currentCalendarDay = Date.UTC(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            const elapsedCalendarDays = Math.round(
              (currentCalendarDay - dateCalendarDay) / (24 * 60 * 60 * 1000)
            );
            if (elapsedCalendarDays === 0) return "Today";
            if (elapsedCalendarDays === 1) return "Yesterday";
            const startOfCurrentWeek = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - ((now.getDay() + 6) % 7)
            );
            const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (eventDay >= startOfCurrentWeek && eventDay < now) return "This Week";
            const includeYear = date.getFullYear() !== now.getFullYear();
            try {
              return new Intl.DateTimeFormat(undefined, includeYear
                ? { month: "long", year: "numeric" }
                : { month: "long" }
              ).format(date);
            } catch {
              return "Earlier";
            }
          }

          function groupProjectActivityEvents(events) {
            const groups = [];
            (Array.isArray(events) ? events : []).forEach((event) => {
              const label = getProjectActivityGroupLabel(event.timestamp);
              let group = groups[groups.length - 1];
              if (!group || group.label !== label) {
                group = { label, events: [] };
                groups.push(group);
              }
              group.events.push(event);
            });
            return groups;
          }

          function getProjectActivityAssignmentTarget(source) {
            const fieldName = String(source?.fieldName || "").trim();
            if (fieldName !== "assigneeAgentId") {
              return null;
            }
            const rawValue = source?.nextValue;
            const valueObject = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)
              ? rawValue
              : {};
            const assigneeId = String(
              valueObject.id
                || valueObject.agentId
                || valueObject.userId
                || rawValue
                || source?.nextAssigneeAgentId
                || ""
            ).trim();
            if (!assigneeId) {
              return null;
            }
            const explicitName = String(
              valueObject.name
                || valueObject.displayName
                || valueObject.display_name
                || valueObject.fullName
                || valueObject.full_name
                || source?.nextValueName
                || source?.assigneeName
                || ""
            ).trim();
            const isHuman = typeof isPlaygroundHumanAssigneeId === "function"
              && isPlaygroundHumanAssigneeId(assigneeId);
            const assignedActor = !isHuman && typeof resolveProjectOverviewActivityActor === "function"
              ? resolveProjectOverviewActivityActor(assigneeId, explicitName || "Agent", valueObject)
              : null;
            const assignedName = isHuman
              ? String(currentUserName || explicitName || "User").trim() || "User"
              : String(
                  explicitName
                    || assignedActor?.name
                    || (typeof getTaskAssigneeName === "function" ? getTaskAssigneeName(assigneeId, assigneeId) : assigneeId)
                    || assigneeId
                ).trim() || "Agent";
            let avatar = null;
            if (typeof renderTaskActorAvatar === "function") {
              avatar = renderTaskActorAvatar(assigneeId, "playground-project-activity-line__assignee-avatar");
            }
            if (!avatar && typeof renderAgentNameAvatar === "function") {
              avatar = renderAgentNameAvatar(
                assignedName,
                "playground-project-activity-line__assignee-avatar",
                valueObject.photoUrl
                  || valueObject.photoURL
                  || valueObject.avatarUrl
                  || valueObject.avatarURL
                  || assignedActor?.photoUrl
                  || ""
              );
            }
            return {
              id: assigneeId,
              name: assignedName,
              avatar,
            };
          }

          function renderProjectActivityPriorityReference(value) {
            let decodedValue = value;
            if (typeof value === "string" && /^[{[]/.test(value.trim())) {
              try {
                decodedValue = JSON.parse(value);
              } catch {
                decodedValue = value;
              }
            }
            const valueObject = decodedValue && typeof decodedValue === "object" && !Array.isArray(decodedValue)
              ? decodedValue
              : null;
            const normalizedValue = String(
              valueObject?.id
                || valueObject?.priority
                || valueObject?.value
                || decodedValue
                || ""
            ).trim().toLowerCase();
            const label = typeof getPlaygroundTaskPriorityLabel === "function"
              ? getPlaygroundTaskPriorityLabel(normalizedValue)
              : normalizedValue || "Medium";
            return React.createElement("span", {
                className: "playground-project-activity-line__priority",
                title: label,
              },
              typeof renderPlaygroundTaskPriorityIcon === "function"
                ? renderPlaygroundTaskPriorityIcon(normalizedValue)
                : null,
              React.createElement("span", null, label)
            );
          }

          function renderProjectActivityStatusReference(value) {
            let decodedValue = value;
            if (typeof value === "string" && /^[{[]/.test(value.trim())) {
              try {
                decodedValue = JSON.parse(value);
              } catch {
                decodedValue = value;
              }
            }
            const valueObject = decodedValue && typeof decodedValue === "object" && !Array.isArray(decodedValue)
              ? decodedValue
              : null;
            const normalizedValue = String(
              valueObject?.id
                || valueObject?.status
                || valueObject?.value
                || decodedValue
                || ""
            ).trim().toLowerCase();
            const label = typeof getPlaygroundTaskStatusLabel === "function"
              ? getPlaygroundTaskStatusLabel(normalizedValue)
              : normalizedValue || "Unknown";
            return React.createElement("span", {
                className: "playground-project-activity-line__status",
                title: label,
              },
              typeof renderPlaygroundTaskStatusGlyph === "function"
                ? renderPlaygroundTaskStatusGlyph(normalizedValue)
                : null,
              React.createElement("span", null, label)
            );
          }

          function renderProjectActivityThreadSummary(thread) {
            const threadActor = typeof getPlaygroundThreadActorInfo === "function"
              ? getPlaygroundThreadActorInfo(thread, agentsById, "Agent")
              : { id: String(thread?.agentId || "").trim(), name: "Agent" };
            const actor = resolveProjectOverviewActivityActor(threadActor?.id, threadActor?.name || "Agent", thread);
            const title = String(thread?.title || "Untitled thread").trim() || "Untitled thread";
            return React.createElement(React.Fragment, null,
              React.createElement("strong", null, actor.name),
              " started ",
              React.createElement("strong", null, title)
            );
          }

          function renderProjectActivityLine(event, options = {}) {
            const source = event.source || {};
            // Keep this renderer usable outside the project overview render
            // scope as well (the ticket detail view deliberately reuses it).
            // normalizedOverviewTasksById is a view-local lookup in the
            // overview, so always prefer the task snapshot carried by the
            // event and only consult the lookup when it exists.
            const overviewTasksById = typeof normalizedOverviewTasksById !== "undefined"
              ? normalizedOverviewTasksById
              : null;
            const task = source.task || (source.taskId && overviewTasksById
              ? overviewTasksById[source.taskId] || null
              : null);
            const taskId = String(source.taskId || task?.id || "").trim();
            const ticketNumber = taskId
              ? String(
                  (typeof taskTicketNumbersById !== "undefined" ? taskTicketNumbersById[taskId] : "")
                    || task?.ticketNumber
                    || ""
                ).trim()
              : "";
            const ticketLabel = ticketNumber;
            const ticketTitle = [ticketNumber, task?.title || ""].filter(Boolean).join(" ");
            const taskType = task && typeof normalizePlaygroundTaskType === "function"
              ? normalizePlaygroundTaskType(task.taskType || task.type)
              : "";
            const TaskTypeIcon = task && typeof getPlaygroundTaskTypeIcon === "function"
              ? getPlaygroundTaskTypeIcon(taskType)
              : null;
            const isMilestoneChange = event.eventType === "milestones"
              && String(source?.eventType || "").trim() === "field_changed";
            const changedMilestoneId = isMilestoneChange
              ? String(source?.nextValue || source?.releaseId || source?.milestoneId || "").trim()
              : "";
            const changedMilestone = changedMilestoneId
              ? (typeof releasesById !== "undefined" && releasesById?.[changedMilestoneId])
                || (typeof getProjectOverviewMilestoneRecords === "function"
                  ? getProjectOverviewMilestoneRecords().find((release) => String(release?.id || "").trim() === changedMilestoneId)
                  : null)
              : null;
            const changedMilestoneName = String(changedMilestone?.name || changedMilestone?.title || "").trim();
            const milestoneReference = changedMilestoneName
              ? React.createElement("span", {
                  className: "playground-project-activity-line__milestone",
                  title: changedMilestoneName,
                },
                React.createElement("span", {
                  className: "playground-project-activity-rich-card__kind-icon is-milestone",
                  "aria-hidden": "true",
                }, React.createElement(Milestone, { width: 12, height: 12, strokeWidth: 1.8 })),
                React.createElement("span", null, changedMilestoneName)
              )
              : null;
            const isAssigneeChange = event.eventType === "assignments"
              && String(source?.eventType || "").trim() === "field_changed"
              && String(source?.fieldName || "").trim() === "assigneeAgentId";
            const isIssueCreation = String(source?.eventType || "").trim() === "created";
            const isTitleChange = String(source?.eventType || "").trim() === "field_changed"
              && String(source?.fieldName || "").trim() === "title";
            const renamedTitle = String(source?.nextValue || "").trim();
            const isPriorityChange = String(source?.eventType || "").trim().toLowerCase() === "field_changed"
              && String(source?.fieldName || "").trim().toLowerCase() === "priority";
            const previousPriorityReference = isPriorityChange
              ? renderProjectActivityPriorityReference(source?.previousValue)
              : null;
            const nextPriorityReference = isPriorityChange
              ? renderProjectActivityPriorityReference(source?.nextValue)
              : null;
            const sourceEventType = String(source?.eventType || "").trim();
            const sourceFieldName = String(source?.fieldName || "").trim().toLowerCase();
            const isStatusChange = sourceEventType === "status_changed"
              || (sourceEventType === "field_changed" && sourceFieldName === "status");
            const previousStatusReference = isStatusChange
              ? renderProjectActivityStatusReference(source?.previousValue)
              : null;
            const nextStatusReference = isStatusChange
              ? renderProjectActivityStatusReference(source?.nextValue)
              : null;
            const assignmentTarget = isAssigneeChange
              ? getProjectActivityAssignmentTarget(source)
              : null;
            if (!event.isProjectCreation && !event.isThreadRecord) {
              const sharedTimeLabel = event.timestamp && typeof formatRelativeThreadTime === "function"
                ? formatRelativeThreadTime(new Date(event.timestamp).toISOString())
                : "";
              const sharedOnActivate = options.disableActivation
                ? undefined
                : typeof options.onActivate === "function"
                  ? options.onActivate
                  : taskId && typeof openProjectTaskDetailScreen === "function"
                    ? () => openProjectTaskDetailScreen(taskId)
                    : undefined;
              return renderSharedProjectTaskActivityLine(event, {
                task,
                taskId,
                ticketNumber,
                actorName: typeof getProjectOverviewTaskActivityActorName === "function"
                  ? getProjectOverviewTaskActivityActorName(source)
                  : String(source.actorName || "Someone").trim() || "Someone",
                actorAvatar: typeof renderProjectOverviewTaskActivityActorAvatar === "function"
                  ? renderProjectOverviewTaskActivityActorAvatar(source, "playground-project-activity-line__avatar")
                  : null,
                milestoneName: changedMilestoneName,
                assignmentTarget,
                fallbackSummary: typeof renderProjectOverviewTaskActivitySummary === "function"
                  ? renderProjectOverviewTaskActivitySummary(source)
                  : null,
                timeLabel: sharedTimeLabel,
                onActivate: sharedOnActivate,
              });
            }
            const assignmentTargetReference = assignmentTarget
              ? React.createElement("span", {
                  className: "playground-project-activity-line__assignee",
                  title: assignmentTarget.name,
                },
                assignmentTarget.avatar
                  ? React.createElement("span", { className: "playground-project-activity-line__avatar-shell" }, assignmentTarget.avatar)
                  : null,
                React.createElement("span", null, assignmentTarget.name)
              )
              : null;
            let summary = null;
            let avatar = null;
            let Icon = null;
            if (event.isProjectCreation) {
              const identity = resolveProjectOverviewUpdateAuthorIdentity(source);
              summary = React.createElement(React.Fragment, null,
                React.createElement("strong", null, identity.name),
                " created the project"
              );
              avatar = renderProjectOverviewSidebarAvatar(identity.name, identity.avatarUrl);
              Icon = Rocket;
            } else if (event.isThreadRecord) {
              summary = renderProjectActivityThreadSummary(source);
              const threadActor = typeof getPlaygroundThreadActorInfo === "function"
                ? getPlaygroundThreadActorInfo(source, agentsById, "Agent")
                : { id: source?.agentId, name: "Agent" };
              const actor = resolveProjectOverviewActivityActor(threadActor?.id, threadActor?.name || "Agent", source);
              avatar = renderAgentNameAvatar(actor.name, "playground-project-activity-line__avatar", actor.photoUrl);
              Icon = MessageCircle;
            } else {
              summary = isMilestoneChange
                ? React.createElement(React.Fragment, null,
                    React.createElement("strong", null,
                      typeof getProjectOverviewTaskActivityActorName === "function"
                        ? getProjectOverviewTaskActivityActorName(source)
                        : "Someone"
                    ),
                    " changed milestone on "
                  )
                : isAssigneeChange && assignmentTarget
                  ? React.createElement(React.Fragment, null,
                      React.createElement("strong", null,
                        typeof getProjectOverviewTaskActivityActorName === "function"
                          ? getProjectOverviewTaskActivityActorName(source)
                          : "Someone"
                      ),
                      " assigned "
                    )
                : isIssueCreation
                  ? React.createElement(React.Fragment, null,
                      React.createElement("strong", null,
                        typeof getProjectOverviewTaskActivityActorName === "function"
                          ? getProjectOverviewTaskActivityActorName(source)
                          : "Someone"
                      ),
                      " created "
                    )
                : isTitleChange
                  ? React.createElement(React.Fragment, null,
                      React.createElement("strong", null,
                        typeof getProjectOverviewTaskActivityActorName === "function"
                          ? getProjectOverviewTaskActivityActorName(source)
                          : "Someone"
                      ),
                      " renamed "
                    )
                : isPriorityChange
                  ? React.createElement(React.Fragment, null,
                      React.createElement("strong", null,
                        typeof getProjectOverviewTaskActivityActorName === "function"
                          ? getProjectOverviewTaskActivityActorName(source)
                          : "Someone"
                      ),
                      " changed priority on "
                    )
                : isStatusChange
                  ? React.createElement(React.Fragment, null,
                      React.createElement("strong", null,
                        typeof getProjectOverviewTaskActivityActorName === "function"
                          ? getProjectOverviewTaskActivityActorName(source)
                          : "Someone"
                      ),
                      " moved "
                    )
                : renderProjectOverviewTaskActivitySummary(source);
              avatar = renderProjectOverviewTaskActivityActorAvatar(source, "playground-project-activity-line__avatar");
              if (event.eventType === "milestones") Icon = Milestone;
              else if (event.eventType === "schedules") Icon = CalendarIcon;
              else if (event.eventType === "threads") Icon = MessageCircle;
            }
            const timeLabel = event.timestamp && typeof formatRelativeThreadTime === "function"
              ? formatRelativeThreadTime(new Date(event.timestamp).toISOString())
              : "";
            const onActivate = options.disableActivation
              ? undefined
              : typeof options.onActivate === "function"
                ? options.onActivate
                : taskId && typeof openProjectTaskDetailScreen === "function"
                  ? () => openProjectTaskDetailScreen(taskId)
                  : event.isThreadRecord && source?.id
                    ? () => {
                        if (typeof upsertRealThreadRecord === "function") {
                          upsertRealThreadRecord(source);
                        }
                        if (typeof onThreadOpen === "function") {
                          onThreadOpen(source.id, { threadRecord: source });
                        } else if (typeof handleThreadSelect === "function") {
                          handleThreadSelect(source.id);
                        }
                      }
                    : undefined;
            return React.createElement("div", {
                key: event.id,
                className: "playground-project-activity-line"
                  + (avatar ? " has-avatar" : "")
                  + (onActivate ? " is-interactive" : ""),
                role: onActivate ? "button" : undefined,
                tabIndex: onActivate ? 0 : undefined,
                onClick: onActivate,
                onKeyDown: onActivate
                  ? (keyboardEvent) => {
                      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                        keyboardEvent.preventDefault();
                        onActivate();
                      }
                    }
                  : undefined,
              },
              React.createElement("div", { className: "playground-project-activity-line__leading" },
                avatar
                  ? React.createElement("span", { className: "playground-project-activity-line__avatar-shell" }, avatar)
                  : Icon
                    ? React.createElement("span", { className: "playground-project-activity-line__icon" },
                        React.createElement(Icon, { width: 15, height: 15, strokeWidth: 1.8 })
                      )
                    : null
              ),
              React.createElement("div", { className: "playground-project-activity-line__body" },
                React.createElement("div", { className: "playground-project-activity-line__summary" }, summary),
                ticketLabel && !isMilestoneChange
                  ? React.createElement("span", {
                      className: "playground-project-activity-line__subject",
                      title: ticketTitle,
                    },
                    TaskTypeIcon
                      ? React.createElement("span", {
                          className: "playground-tasks-lane-card-type-badge is-" + taskType,
                          "aria-hidden": "true",
                        }, React.createElement(TaskTypeIcon, { width: 12, height: 12, strokeWidth: 1.8 }))
                      : null,
                    React.createElement("span", null, ticketLabel)
                  )
                  : null,
                isAssigneeChange && assignmentTargetReference
                  ? React.createElement(React.Fragment, null,
                      React.createElement("span", { className: "playground-project-activity-line__assignee-separator" }, " to "),
                      assignmentTargetReference
                    )
                  : null,
                isTitleChange && renamedTitle
                  ? React.createElement(React.Fragment, null,
                      React.createElement("span", { className: "playground-project-activity-line__rename-separator" }, " to "),
                      React.createElement("strong", { className: "playground-project-activity-line__renamed-title" }, renamedTitle)
                    )
                  : null,
                isPriorityChange
                  ? React.createElement(React.Fragment, null,
                      React.createElement("span", { className: "playground-project-activity-line__priority-separator" }, " from "),
                      previousPriorityReference,
                      React.createElement("span", { className: "playground-project-activity-line__priority-separator" }, " to "),
                      nextPriorityReference
                    )
                  : null,
                isStatusChange
                  ? React.createElement(React.Fragment, null,
                      React.createElement("span", { className: "playground-project-activity-line__status-separator" }, " from "),
                      previousStatusReference,
                      React.createElement("span", { className: "playground-project-activity-line__status-separator" }, " to "),
                      nextStatusReference
                    )
                  : null,
                isMilestoneChange && ticketLabel
                  ? React.createElement("span", {
                      className: "playground-project-activity-line__subject",
                      title: ticketTitle,
                    },
                    TaskTypeIcon
                      ? React.createElement("span", {
                          className: "playground-tasks-lane-card-type-badge is-" + taskType,
                          "aria-hidden": "true",
                        }, React.createElement(TaskTypeIcon, { width: 12, height: 12, strokeWidth: 1.8 }))
                      : null,
                    React.createElement("span", null, ticketLabel)
                  )
                  : null,
                isMilestoneChange && milestoneReference
                  ? React.createElement(React.Fragment, null,
                      React.createElement("span", { className: "playground-project-activity-line__milestone-separator" }, " to "),
                      milestoneReference
                    )
                  : null,
                timeLabel
                  ? React.createElement("span", { className: "playground-project-activity-line__time" }, " · ", timeLabel)
                  : null
              )
            );
          }

          function renderProjectActivityInteractionSurface(event) {
            const record = getProjectActivityInteractionRecord(event.id);
            const comments = record.comments;
            const reactions = record.reactions;
            const interactionActive = projectOverviewUpdateInteractionState?.updateId === event.id;
            const commentOpen = interactionActive && projectOverviewUpdateInteractionState?.commentOpen === true;
            const emojiOpen = interactionActive && projectOverviewUpdateInteractionState?.emojiOpen === true;
            const viewerId = String(currentUserId || currentUserEmail || "current-user").trim();
            return React.createElement(React.Fragment, null,
              React.createElement("div", { className: "platform-project-update-card__interaction-actions" },
                React.createElement(PlatformIconButton, {
                    type: "button",
                    size: "small",
                    className: "platform-project-update-card__interaction-button" + (commentOpen ? " is-active" : ""),
                    title: comments.length ? "Reply" : "Comment",
                    "aria-label": "Comment on timeline event",
                    "aria-expanded": commentOpen,
                    onClick: () => setProjectActivityCommentOpen(event.id, !commentOpen),
                  },
                  React.createElement(MessageCircle, { width: 15, height: 15, strokeWidth: 1.8 })
                ),
                reactions.length
                  ? React.createElement("div", { className: "platform-project-update-card__reactions" },
                      reactions.map((reaction) => {
                        const selected = reaction.userIds.includes(viewerId);
                        return React.createElement("button", {
                            type: "button",
                            key: reaction.emoji,
                            className: "platform-project-update-card__reaction" + (selected ? " is-selected" : ""),
                            "aria-pressed": selected,
                            disabled: interactionActive
                              && projectOverviewUpdateInteractionState?.reactionSaving === reaction.emoji,
                            onClick: () => void toggleProjectActivityReaction(event.id, reaction.emoji),
                          },
                          React.createElement("span", { className: "platform-project-update-card__reaction-emoji" }, reaction.emoji),
                          React.createElement("span", null, String(reaction.count || reaction.userIds.length || 0))
                        );
                      })
                    )
                  : null,
                React.createElement(PlatformEmojiPicker, {
                  open: emojiOpen,
                  onOpenChange: (open) => setProjectActivityEmojiOpen(event.id, open),
                  onSelect: (emoji) => toggleProjectActivityReaction(event.id, emoji),
                  placement: "bottom-end",
                  ariaLabel: "React to timeline event",
                  className: "platform-project-update-card__emoji-picker",
                })
              ),
              comments.length || commentOpen
                ? React.createElement("div", { className: "platform-project-update-card__comments" },
                    comments.map((comment) => {
                      const authorName = String(comment.authorName || comment.authorEmail || "Project member").trim();
                      return React.createElement(PlatformCommentCard, {
                        key: comment.id || comment.createdAt + comment.body,
                        className: "platform-project-update-card__comment",
                        author: authorName,
                        timestamp: comment.createdAt && typeof formatRelativeThreadTime === "function"
                          ? formatRelativeThreadTime(comment.createdAt)
                          : "",
                        avatar: renderProjectOverviewSidebarAvatar(authorName, comment.authorAvatarUrl),
                        content: React.createElement(PlaygroundTaskDescriptionMarkdown, {
                          content: comment.body,
                          className: "platform-project-update-card__comment-text tb-message-markdown",
                        }),
                      });
                    }),
                    commentOpen
                      ? React.createElement(PlatformCommentComposer, {
                          ...getProjectMentionComposerProps(),
                          value: projectOverviewUpdateInteractionState?.commentValue || "",
                          onChange: (nextValue) => setProjectOverviewUpdateInteractionState((current) => ({
                            ...current,
                            updateId: event.id,
                            commentValue: nextValue,
                            error: "",
                          })),
                          onSubmit: (_files, mentions, body) => postProjectActivityComment(
                            event.id,
                            mentions,
                            body
                          ),
                          allowAttachments: false,
                          submitting: projectOverviewUpdateInteractionState?.isSaving,
                          errorMessage: projectOverviewUpdateInteractionState?.error,
                          placeholder: "Leave a comment...",
                          ariaLabel: "Timeline event comment",
                          autoFocus: true,
                          className: "platform-project-update-card__comment-composer",
                        })
                      : null
                  )
                : null
            );
          }

          function resolveProjectMissionControlAgent(source) {
            const missionControlRecord = source && typeof source === "object" && !Array.isArray(source)
              ? source
              : {};
            const directAgentId = String(missionControlRecord.agentId || missionControlRecord.agent_id || "").trim();
            const directAgentName = String(missionControlRecord.agentName || missionControlRecord.agent_name || "").trim();
            const threadId = String(missionControlRecord.lastThreadId || missionControlRecord.threadId || "").trim();
            const threadCandidates = []
              .concat(typeof selectedProjectRecentThreads !== "undefined" && Array.isArray(selectedProjectRecentThreads) ? selectedProjectRecentThreads : [])
              .concat(typeof projectOverviewThreads !== "undefined" && Array.isArray(projectOverviewThreads) ? projectOverviewThreads : []);
            const matchingThread = threadCandidates.find((thread) => String(thread?.id || "").trim() === threadId)
              || threadCandidates.find((thread) => {
                const metadata = typeof getThreadMissionControlMetadata === "function"
                  ? getThreadMissionControlMetadata(thread)
                  : null;
                return String(metadata?.projectId || "").trim() === String(selectedProjectId || "").trim();
              })
              || null;
            const threadMetadata = matchingThread?.metadata && typeof matchingThread.metadata === "object"
              ? matchingThread.metadata
              : {};
            const runnerPlaygroundMetadata = threadMetadata.runnerPlayground
              && typeof threadMetadata.runnerPlayground === "object"
              ? threadMetadata.runnerPlayground
              : {};
            const threadAgentId = String(
              matchingThread?.agentId
              || matchingThread?.agent_id
              || threadMetadata.agentId
              || threadMetadata.agent_id
              || runnerPlaygroundMetadata.agentId
              || runnerPlaygroundMetadata.agent_id
              || ""
            ).trim();
            const threadAgentName = String(
              matchingThread?.agentName
              || matchingThread?.agent_name
              || threadMetadata.agentName
              || threadMetadata.agent_name
              || runnerPlaygroundMetadata.agentName
              || runnerPlaygroundMetadata.agent_name
              || ""
            ).trim();
            return resolveProjectOverviewActivityActor(
              directAgentId || threadAgentId,
              directAgentName || threadAgentName || "Agent",
              matchingThread || missionControlRecord
            );
          }

          function resolveProjectMissionControlActivityLines(source) {
            const missionControlRecord = source && typeof source === "object" && !Array.isArray(source)
              ? source
              : {};
            const activity = missionControlRecord.activity
              || missionControlRecord.resourceActivity
              || missionControlRecord.resource_activity
              || {};
            const definitions = [
              { id: "issues", label: "Issues", icon: ListTodo },
              { id: "strategy", label: "Strategy", icon: Brain },
              { id: "milestones", label: "Milestones", icon: Milestone },
              { id: "knowledge", label: "Knowledge", icon: BookOpen },
            ];
            return definitions.map((definition) => {
              const bucket = activity[definition.id] && typeof activity[definition.id] === "object"
                ? activity[definition.id]
                : {};
              const created = Array.isArray(bucket.created) ? bucket.created : [];
              const updated = Array.isArray(bucket.updated) ? bucket.updated : [];
              const uniqueResources = new Set(
                created.concat(updated).map((value) => String(value || "").trim()).filter(Boolean)
              );
              const explicitCount = [
                bucket.count,
                bucket.total,
                bucket.totalCount,
                bucket.total_count,
              ].map(Number).find((value) => Number.isFinite(value) && value >= 0);
              const createdCount = Number(bucket.createdCount ?? bucket.created_count);
              const updatedCount = Number(bucket.updatedCount ?? bucket.updated_count);
              const count = Number.isFinite(explicitCount)
                ? Math.floor(explicitCount)
                : uniqueResources.size > 0
                  ? uniqueResources.size
                  : (Number.isFinite(createdCount) ? Math.max(0, Math.floor(createdCount)) : 0)
                    + (Number.isFinite(updatedCount) ? Math.max(0, Math.floor(updatedCount)) : 0);
              return count > 0
                ? { ...definition, count }
                : null;
            }).filter(Boolean);
          }

          function renderProjectActivityRichCard(event) {
            if (["project_update", "project_comment"].includes(event.cardType)) {
              const updateRecord = event.source?.id
                ? event.source
                : { ...event.source, id: event.id };
              const isComment = event.cardType === "project_comment";
              return React.createElement("div", {
                  key: event.id,
                  className: "playground-project-activity-rich-card " + (isComment ? "is-project-comment" : "is-project-update"),
                },
                renderProjectOverviewUpdateCard(updateRecord, {
                  ariaLabel: isComment ? "Project timeline comment" : "Project timeline update",
                  showStatus: !isComment,
                  showUpdateAction: false,
                })
              );
            }
            const isMissionControl = event.cardType === "mission_control";
            const source = event.source || {};
            if (isMissionControl && resolveProjectMissionControlActivityLines(source).length === 0) {
              return null;
            }
            const missionControlAgent = isMissionControl ? resolveProjectMissionControlAgent(source) : null;
            const milestoneMetadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
              ? source.metadata
              : {};
            const milestoneActorObject = [
              source.actor,
              source.updatedBy,
              source.updated_by,
              source.createdBy,
              source.created_by,
              source.creator,
              milestoneMetadata.actor,
              milestoneMetadata.updatedBy,
              milestoneMetadata.createdBy,
              milestoneMetadata.creator,
            ].find((value) => value && typeof value === "object" && !Array.isArray(value)) || {};
            const milestoneActorSources = [milestoneActorObject, source, milestoneMetadata];
            const readMilestoneActorValue = (keys) => {
              for (const actorSource of milestoneActorSources) {
                for (const key of keys) {
                  const value = actorSource?.[key];
                  if (typeof value === "string" && value.trim()) return value.trim();
                  if (typeof value === "number" && Number.isFinite(value)) return String(value);
                }
              }
              return "";
            };
            const milestoneActorRecord = !isMissionControl
              ? {
                  authorType: readMilestoneActorValue(["type", "kind", "actorType", "creatorType", "createdByType", "updatedByType"])
                    || (readMilestoneActorValue(["actorAgentId", "agentId", "agent_id", "creatorAgentId", "createdByAgentId", "updatedByAgentId"]) ? "agent" : "user"),
                  authorUserId: readMilestoneActorValue([
                    "userId",
                    "user_id",
                    "actorUserId",
                    "actor_user_id",
                    "updatedByUserId",
                    "updated_by_user_id",
                    "createdByUserId",
                    "created_by_user_id",
                  ]),
                  authorAgentId: readMilestoneActorValue([
                    "agentId",
                    "agent_id",
                    "actorAgentId",
                    "actor_agent_id",
                    "updatedByAgentId",
                    "updated_by_agent_id",
                    "createdByAgentId",
                    "created_by_agent_id",
                  ]),
                  authorName: readMilestoneActorValue([
                    "name",
                    "displayName",
                    "display_name",
                    "fullName",
                    "full_name",
                    "actorName",
                    "updatedByName",
                    "updated_by_name",
                    "createdByName",
                    "created_by_name",
                    "userName",
                    "username",
                  ]),
                  authorAvatarUrl: readMilestoneActorValue([
                    "avatarUrl",
                    "avatarURL",
                    "avatar_url",
                    "photoUrl",
                    "photoURL",
                    "photo_url",
                    "actorAvatarUrl",
                    "actorPhotoUrl",
                    "updatedByAvatarUrl",
                    "updated_by_avatar_url",
                    "createdByAvatarUrl",
                    "created_by_avatar_url",
                    "picture",
                  ]),
                }
              : null;
            const milestoneActorName = !isMissionControl
              ? (typeof getTaskCommentDisplayName === "function"
                ? getTaskCommentDisplayName(milestoneActorRecord)
                : String(milestoneActorRecord.authorName || "User").trim() || "User")
              : "";
            const milestoneActorAvatarUrl = !isMissionControl
              ? (() => {
                  let avatarUrl = String(milestoneActorRecord.authorAvatarUrl || "").trim();
                  if (!avatarUrl && milestoneActorRecord.authorAgentId) {
                    const actorAgent = agentsById?.[milestoneActorRecord.authorAgentId]
                      || (typeof assignableActorsById !== "undefined" ? assignableActorsById?.[milestoneActorRecord.authorAgentId] : null)
                      || null;
                    avatarUrl = actorAgent && typeof getPlaygroundAgentProfilePhotoUrl === "function"
                      ? String(getPlaygroundAgentProfilePhotoUrl(actorAgent) || "").trim()
                      : "";
                  }
                  if (!avatarUrl && typeof getTaskCommentWorkspaceMember === "function") {
                    const workspaceMember = getTaskCommentWorkspaceMember(milestoneActorRecord);
                    avatarUrl = typeof readTaskCommentMemberIdentityValue === "function"
                      ? String(readTaskCommentMemberIdentityValue(workspaceMember, [
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
                        ]) || "").trim()
                      : "";
                  }
                  if (!avatarUrl && typeof isTaskCommentByCurrentUser === "function" && isTaskCommentByCurrentUser(milestoneActorRecord)) {
                    avatarUrl = String(currentUserAvatarUrl || "").trim();
                  }
                  return typeof normalizeSessionPhotoUrl === "function"
                    ? normalizeSessionPhotoUrl(avatarUrl)
                    : avatarUrl;
                })()
              : "";
            const milestoneActorAvatar = !isMissionControl
              ? renderProjectOverviewSidebarAvatar(milestoneActorName, milestoneActorAvatarUrl)
              : null;
            const title = isMissionControl
              ? "Mission Control"
              : "Milestone added";
            const sourceName = isMissionControl
              ? String(missionControlAgent?.name || "Agent").trim() || "Agent"
              : milestoneActorName;
            const sourceAvatarUrl = isMissionControl
              ? String(missionControlAgent?.photoUrl || "").trim()
              : "";
            const body = isMissionControl
              ? String(source.summary || source.document || "Mission Control reviewed the current project state.").trim()
              : String(source.description || "A new milestone was added to the project.").trim();
            const milestoneTitle = !isMissionControl
              ? String(source.name || source.title || source.milestoneName || "Untitled Milestone").trim() || "Untitled Milestone"
              : "";
            const timeLabel = event.timestamp && typeof formatRelativeThreadTime === "function"
              ? formatRelativeThreadTime(new Date(event.timestamp).toISOString())
              : "";
            const progress = isMissionControl ? null : getProjectOverviewMilestoneProgress(source);
            const missionControlActivityLines = isMissionControl
              ? resolveProjectMissionControlActivityLines(source)
              : [];
            return React.createElement("section", {
                key: event.id,
                className: "platform-project-update-card playground-project-activity-rich-card is-" + (isMissionControl ? "mission-control" : "milestone"),
              },
              React.createElement("div", { className: "platform-project-update-card__header" },
                React.createElement("div", { className: "platform-project-update-card__meta" },
                  React.createElement("span", { className: "playground-project-activity-rich-card__kind" },
                    isMissionControl
                      ? React.createElement("span", {
                          className: "playground-project-activity-rich-card__kind-icon is-mission-control",
                          "aria-hidden": "true",
                        }, React.createElement(RefreshCcwDot, { width: 12, height: 12, strokeWidth: 1.8 }))
                      : React.createElement("span", {
                          className: "playground-project-activity-rich-card__kind-icon is-milestone",
                          "aria-hidden": "true",
                        }, React.createElement(Milestone, { width: 12, height: 12, strokeWidth: 1.8 })),
                    React.createElement("span", null, title)
                  ),
                  React.createElement("span", { className: "platform-project-update-card__author" },
                    isMissionControl
                      ? renderProjectOverviewSidebarAvatar(sourceName, sourceAvatarUrl)
                      : milestoneActorAvatar,
                    React.createElement("span", null, sourceName)
                  ),
                  timeLabel
                    ? React.createElement("span", { className: "platform-project-update-card__time" }, timeLabel)
                    : null
                )
              ),
              React.createElement("div", { className: "playground-project-activity-rich-card__content" },
                isMissionControl
                  ? missionControlActivityLines.length > 0
                    ? React.createElement("div", {
                        className: "playground-project-activity-rich-card__mission-control-lines",
                        "aria-label": "Mission Control changes",
                      }, missionControlActivityLines.map((line) =>
                        React.createElement("div", {
                          key: line.id,
                          className: "playground-project-activity-rich-card__mission-control-line",
                        },
                          React.createElement("span", {
                            className: "playground-project-activity-rich-card__mission-control-line-icon is-" + line.id,
                            "aria-hidden": "true",
                          }, React.createElement(line.icon, { width: 14, height: 14, strokeWidth: 1.8 })),
                          React.createElement("span", null, "Created and updated " + String(line.count) + " " + line.label)
                        )
                      ))
                    : React.createElement("span", { className: "playground-project-activity-rich-card__mission-control-empty" }, "No project resources changed.")
                  : React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-project-activity-rich-card__milestone-title-row" },
                        React.createElement("span", { className: "playground-project-activity-rich-card__milestone-title" }, milestoneTitle),
                        progress
                          ? React.createElement("div", { className: "playground-project-activity-rich-card__milestone-progress" },
                              React.createElement("span", { className: "playground-project-activity-rich-card__milestone-progress-label" },
                                React.createElement("span", {
                                  className: "playground-project-overview-milestones-card__progress",
                                  style: {
                                    "--project-milestone-progress": String(progress.percent) + "%",
                                  },
                                  "aria-label": String(progress.percent) + "% complete",
                                }),
                                React.createElement("span", null, String(progress.completed) + " of " + String(progress.total))
                              )
                            )
                          : null
                      ),
                      React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: body,
                        className: "tb-message-markdown",
                      })
                    )
              ),
              renderProjectActivityInteractionSurface(event)
            );
          }

          function renderProjectActivityFeedEvent(event) {
            return event.presentation === "card"
              ? renderProjectActivityRichCard(event)
              : renderProjectActivityLine(event);
          }

          function renderProjectOverviewTimelineFilter() {
            const filterOpen = projectOverviewTaskActivityToolbarPopover === "timeline-filter";
            const preferences = getProjectActivityTimelinePreferences();
            const hasHiddenEventTypes = PROJECT_ACTIVITY_EVENT_TYPES.some(
              (eventType) => preferences[eventType.id] === false
            );
            return React.createElement(PlatformPopup, {
                open: filterOpen,
                rootRef: projectOverviewTaskActivityFilterPopupRef,
                surfaceRef: projectOverviewTaskActivityFilterSurfaceRef,
                rootClassName: "playground-project-timeline-filter-shell is-central-popup",
                surfaceClassName: "platform-data-table__floating-menu playground-project-timeline-filter-menu is-central-popup",
                surfaceProps: {
                  role: "dialog",
                  "aria-label": "Filter project activity",
                },
                animation: "down-in",
                variant: "minimal",
                portal: true,
                placement: "bottom-start",
                portalOffset: 6,
                trigger: React.createElement(PlatformIconButton, {
                    type: "button",
                    size: "small",
                    className: "playground-project-activity-feed__filter"
                      + (filterOpen || hasHiddenEventTypes ? " is-active" : ""),
                    title: "Filter activity",
                    "aria-label": "Filter activity",
                    "aria-haspopup": "dialog",
                    "aria-expanded": filterOpen ? "true" : "false",
                    onClick: (event) => {
                      event.stopPropagation();
                      setProjectOverviewTaskActivityToolbarPopover((current) =>
                        current === "timeline-filter" ? "" : "timeline-filter"
                      );
                    },
                  },
                  React.createElement(ListFilter, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  })
                ),
              },
              React.createElement("div", { className: "playground-project-timeline-filter-menu__header" },
                React.createElement("span", { className: "playground-project-timeline-filter-menu__title" }, "Activity types"),
                React.createElement("span", { className: "playground-project-timeline-filter-menu__description" },
                  "Choose which events appear in this timeline."
                )
              ),
              React.createElement("div", { className: "playground-project-timeline-filter-menu__list" },
                PROJECT_ACTIVITY_EVENT_TYPES.map((eventType) =>
                  React.createElement("div", {
                      key: eventType.id,
                      className: "playground-project-timeline-filter-menu__row",
                    },
                    React.createElement("span", { className: "playground-project-timeline-filter-menu__copy" },
                      React.createElement("span", { className: "playground-project-timeline-filter-menu__label" }, eventType.label),
                      React.createElement("span", { className: "playground-project-timeline-filter-menu__row-description" }, eventType.description)
                    ),
                    React.createElement(PlatformToggle, {
                      checked: preferences[eventType.id] !== false,
                      disabled: !canManageProjectAccess,
                      "aria-label": "Show " + eventType.label + " on the project timeline",
                      onCheckedChange: (checked) => void setProjectActivityEventTypeEnabled(eventType.id, checked),
                    })
                  )
                )
              )
            );
          }

          function renderProjectOverviewStatusFeed() {
            const events = getProjectActivityFeedEvents();
            const groups = groupProjectActivityEvents(events);
            const latestProjectUpdate = getProjectOverviewUpdateRecords().find(
              (record) => normalizeProjectOverviewUpdateKind(record?.kind) === "update"
            )
              || getProjectOverviewCreationUpdate();
            const loading = projectOverviewTaskActivityState?.status === "loading" && events.length === 0;
            const activityError = projectOverviewTaskActivityState?.status === "error"
              ? String(projectOverviewTaskActivityState.error || "Project activity is currently unavailable.")
              : "";
            return React.createElement("section", { className: "playground-project-activity-feed" },
              React.createElement("div", { className: "playground-project-activity-feed__heading" },
                React.createElement("h2", { className: "playground-project-activity-feed__title" }, "Activity"),
                renderProjectOverviewTimelineFilter()
              ),
              latestProjectUpdate
                ? React.createElement("div", { className: "playground-project-activity-feed__latest-update" },
                    renderProjectOverviewUpdateCard(latestProjectUpdate, {
                      ariaLabel: "Latest project update",
                      showUpdateAction: true,
                    })
                  )
                : null,
              loading
                ? React.createElement(PlatformLoadingState, {
                    className: "playground-project-activity-feed__loading",
                    message: "Loading project activity...",
                    centered: true,
                  })
                : groups.length
                  ? React.createElement("div", { className: "playground-project-activity-feed__groups" },
                      groups.map((group) => React.createElement("section", {
                          key: group.label,
                          className: "playground-project-activity-feed__group",
                        },
                        React.createElement("h3", { className: "playground-project-activity-feed__month" }, group.label),
                        React.createElement("div", { className: "playground-project-activity-feed__events" },
                          group.events.map(renderProjectActivityFeedEvent)
                        )
                      ))
                    )
                  : React.createElement(PlatformEmptyState, {
                      className: "playground-project-activity-feed__empty",
                      icon: Rocket,
                      title: activityError ? "Activity unavailable" : "No visible activity yet",
                      description: activityError
                        || "Project events will appear here as work progresses. You can change visible event types in Settings.",
                    })
            );
          }

          function renderProjectOverviewTimelineSettingsSection(options = {}) {
            const canEdit = options.canEdit !== false;
            const preferences = getProjectActivityTimelinePreferences();
            return React.createElement("section", {
                className: "playground-project-settings-section playground-project-timeline-settings",
              },
              React.createElement("div", { className: "playground-project-settings-section__header" },
                React.createElement("div", null,
                  React.createElement("h2", { className: "playground-project-settings-section__title" }, "Project timeline"),
                  React.createElement("p", { className: "playground-project-settings-section__description" },
                    "Choose which event types appear on the project Progress page. Audit records are never deleted."
                  )
                )
              ),
              React.createElement("div", { className: "playground-project-timeline-settings__list" },
                PROJECT_ACTIVITY_EVENT_TYPES.map((eventType) =>
                  React.createElement("div", {
                      key: eventType.id,
                      className: "playground-project-timeline-settings__row",
                    },
                    React.createElement("div", { className: "playground-project-timeline-settings__copy" },
                      React.createElement("span", { className: "playground-project-timeline-settings__label" }, eventType.label),
                      React.createElement("span", { className: "playground-project-timeline-settings__description" }, eventType.description)
                    ),
                    React.createElement(PlatformToggle, {
                      checked: preferences[eventType.id] !== false,
                      disabled: !canEdit,
                      "aria-label": "Show " + eventType.label + " on the project timeline",
                      onCheckedChange: (checked) => void setProjectActivityEventTypeEnabled(eventType.id, checked),
                    })
                  )
                )
              )
            );
          }
`;
