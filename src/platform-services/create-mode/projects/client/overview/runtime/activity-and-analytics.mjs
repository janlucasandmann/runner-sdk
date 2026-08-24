export const PROJECT_OVERVIEW_ACTIVITY_ANALYTICS_FRAGMENT = String.raw`
          function resolveProjectOverviewActivityActor(agentId, fallbackName, fallbackActor) {
            const normalizedAgentId = String(agentId || "").trim();
            const fallbackSnapshot = getProjectOverviewActivityActorSnapshot(fallbackActor || {});
            const fallbackSnapshotName = String(fallbackSnapshot.name || "").trim();
            const rawFallback = String(fallbackName || "").trim();
            const fallback = (rawFallback && rawFallback.toLowerCase() !== "agent" ? rawFallback : "") || fallbackSnapshotName || rawFallback;
            let resolvedAgent = normalizedAgentId && agentsById ? agentsById[normalizedAgentId] || null : null;
            if (!resolvedAgent && normalizedAgentId && typeof assignableActorsById !== "undefined" && assignableActorsById) {
              resolvedAgent = assignableActorsById[normalizedAgentId] || null;
            }
            const fallbackKey = fallback.toLowerCase();
            if (!resolvedAgent && fallbackKey) {
              const candidates = []
                .concat(Object.values(agentsById || {}))
                .concat(typeof sortedAgents !== "undefined" && Array.isArray(sortedAgents) ? sortedAgents : [])
                .concat(typeof assignableActors !== "undefined" && Array.isArray(assignableActors) ? assignableActors : []);
              resolvedAgent = candidates.find((agent) =>
                String(agent?.name || "").trim().toLowerCase() === fallbackKey
                || String(agent?.label || "").trim().toLowerCase() === fallbackKey
              ) || null;
            }
            const actorName = String(resolvedAgent?.name || resolvedAgent?.label || fallbackSnapshotName || fallback || "Agent").trim();
            let photoUrl = resolvedAgent && typeof getPlaygroundAgentProfilePhotoUrl === "function"
              ? getPlaygroundAgentProfilePhotoUrl(resolvedAgent)
              : "";
            if (!photoUrl) {
              photoUrl = String(fallbackSnapshot.photoUrl || "").trim();
            }
            if (!photoUrl) {
              const defaultPhotoUrls = {
                spark: "/img/agent-profile-pics/spark.webp",
                forge: "/img/agent-profile-pics/forge.webp",
                foundry: "/img/agent-profile-pics/foundry.webp",
              };
              photoUrl = defaultPhotoUrls[actorName.toLowerCase()] || "";
            }
            return {
              id: normalizedAgentId || fallbackSnapshot.id || "",
              name: actorName || "Agent",
              photoUrl: photoUrl && typeof normalizeSessionPhotoUrl === "function" ? normalizeSessionPhotoUrl(photoUrl) : photoUrl,
            };
          }

          function formatProjectOverviewActivityTimeLabel(value, fallbackLabel = "") {
            const parsed = typeof value === "number"
              ? value
              : Date.parse(String(value || ""));
            if (!Number.isFinite(parsed) || parsed <= 0) {
              const fallback = String(fallbackLabel || "").trim();
              const compactMatch = fallback.match(/^(\d+)\s*([MHDW])$/i);
              if (!compactMatch) return fallback;
              const amount = Math.max(1, Number(compactMatch[1]) || 1);
              const unitKey = compactMatch[2].toUpperCase();
              const unit = unitKey === "M"
                ? "minute"
                : unitKey === "H"
                  ? "hour"
                  : unitKey === "D"
                    ? "day"
                    : "week";
              return amount + " " + unit + (amount === 1 ? "" : "s") + " ago";
            }
            const diffMs = Math.max(0, Date.now() - parsed);
            const minuteMs = 60 * 1000;
            const hourMs = 60 * minuteMs;
            const dayMs = 24 * hourMs;
            const weekMs = 7 * dayMs;
            const monthMs = 30 * dayMs;
            const amount = diffMs < hourMs
              ? Math.max(1, Math.round(diffMs / minuteMs))
              : diffMs < dayMs
                ? Math.max(1, Math.round(diffMs / hourMs))
                : diffMs < weekMs
                  ? Math.max(1, Math.round(diffMs / dayMs))
                  : diffMs < monthMs
                    ? Math.max(1, Math.round(diffMs / weekMs))
                    : Math.max(1, Math.round(diffMs / monthMs));
            const unit = diffMs < hourMs
              ? "minute"
              : diffMs < dayMs
                ? "hour"
                : diffMs < weekMs
                  ? "day"
                  : diffMs < monthMs
                    ? "week"
                    : "month";
            return amount + " " + unit + (amount === 1 ? "" : "s") + " ago";
          }

          function buildProjectOverviewActivityItems() {
            const items = [];
            projectOverviewFilteredThreads.forEach((thread) => {
              const { safeThread, displayThreadTitle } = typeof getSidebarThreadTitleParts === "function"
                ? getSidebarThreadTitleParts(thread)
                : { safeThread: thread, displayThreadTitle: thread?.title || "Untitled thread" };
              const threadActor = typeof getPlaygroundThreadActorInfo === "function"
                ? getPlaygroundThreadActorInfo(safeThread, agentsById, "Agent")
                : { id: String(safeThread?.agentId || "").trim(), name: "Agent" };
              const threadTaskPreview = typeof getThreadTaskPreview === "function"
                ? getThreadTaskPreview(safeThread)
                : null;
              const threadTaskId = String(threadTaskPreview?.taskId || safeThread?.taskId || "").trim();
              const threadTask = threadTaskId ? normalizedOverviewTasksById[threadTaskId] || null : null;
              const threadActivityActor = resolveProjectOverviewActivityActor(threadActor?.id, threadActor?.name || "Agent", {
                ...safeThread,
                ...threadActor,
              });
              const timestamp = Date.parse(String(safeThread?.updatedAt || safeThread?.createdAt || ""));
              items.push({
                id: "thread:" + String(safeThread?.id || displayThreadTitle || items.length),
                actorId: String(threadActivityActor.id || threadActor?.id || "").trim(),
                actor: threadActivityActor.name,
                photoUrl: threadActivityActor.photoUrl,
                task: threadTask,
                verb: "worked on",
                object: displayThreadTitle || "Untitled thread",
                taskId: threadTaskId,
                permissionActionId: "project_threads_create",
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: formatProjectOverviewActivityTimeLabel(safeThread?.updatedAt || safeThread?.createdAt),
              });
            });
            scopedProjectOverviewFileActivityItems.forEach((row, index) => {
              const assigneeId = String(row?.assigneeId || "").trim();
              const fileActivityActor = resolveProjectOverviewActivityActor(assigneeId, row?.assignee || "Agent", row);
              const fileTaskId = String(row?.taskId || "").trim();
              const fileTask = fileTaskId ? normalizedOverviewTasksById[fileTaskId] || null : null;
              const timestamp = Number(row?.timestamp || 0);
              items.push({
                id: "file:" + String(row?.id || row?.path || index),
                actorId: assigneeId,
                actor: fileActivityActor.name,
                photoUrl: fileActivityActor.photoUrl,
                task: fileTask,
                verb: String(row?.operation || "").trim().toLowerCase() || "updated",
                object: String(row?.title || row?.path || "file").trim(),
                taskId: fileTaskId,
                permissionActionId: String(row?.operationKind || row?.operation || "").toLowerCase().match(/read|view|open|list/)
                  ? "project_resources_view"
                  : "project_resources_manage",
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: formatProjectOverviewActivityTimeLabel(timestamp, row?.dateLabel),
              });
            });
            normalizedOverviewTasks.forEach((task) => {
              const assigneeId = String(task?.assigneeAgentId || "").trim();
              const timestamp = Date.parse(String(task?.updatedAt || task?.createdAt || ""));
              const actorName = typeof getTaskAssigneeName === "function"
                ? getTaskAssigneeName(assigneeId, "Agent")
                : "Agent";
              const taskActivityActor = resolveProjectOverviewActivityActor(assigneeId, actorName, task);
              items.push({
                id: "task:" + String(task?.id || task?.title || items.length),
                actorId: assigneeId,
                actor: taskActivityActor.name,
                photoUrl: taskActivityActor.photoUrl,
                task,
                verb: String(task?.createdAt || "") === String(task?.updatedAt || "") ? "created" : "updated",
                object: task?.title || "Untitled task",
                taskId: String(task?.id || "").trim(),
                permissionActionId: "project_issues_manage",
                time: Number.isFinite(timestamp) ? timestamp : 0,
                timeLabel: formatProjectOverviewActivityTimeLabel(task?.updatedAt || task?.createdAt),
              });
            });
            return items
              .filter((item) => item.object)
              .sort((left, right) => (right.time || 0) - (left.time || 0));
          }

          function renderProjectOverviewActivityAvatar(item, className = "playground-project-overview-activity-avatar") {
            const actorId = String(item?.actorId || item?.task?.assigneeAgentId || "").trim();
            if (actorId && typeof renderTaskActorAvatar === "function") {
              const avatar = renderTaskActorAvatar(actorId, className);
              if (avatar) {
                return avatar;
              }
            }
            if (item?.task && typeof renderTaskAssigneeAvatar === "function") {
              const avatar = renderTaskAssigneeAvatar(item.task, className);
              if (avatar) {
                return avatar;
              }
            }
            if (typeof renderAgentNameAvatar === "function") {
              return renderAgentNameAvatar(item?.actor, className, item?.photoUrl);
            }
            return React.createElement("div", { className });
          }

          function getProjectOverviewActivityParticipantKey(item) {
            const actorId = String(item?.actorId || item?.task?.assigneeAgentId || "").trim();
            if (actorId) {
              return "id:" + actorId;
            }
            const actorName = String(item?.actor || "").trim().toLowerCase();
            return actorName ? "name:" + actorName : "";
          }

          function buildProjectOverviewActivityParticipants(items) {
            const seen = new Set();
            return (Array.isArray(items) ? items : [])
              .filter((item) => {
                const key = getProjectOverviewActivityParticipantKey(item);
                if (!key || seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              })
              .slice(0, 5);
          }

          function renderProjectOverviewActivityParticipants(items) {
            const participants = buildProjectOverviewActivityParticipants(items);
            if (!participants.length) {
              return null;
            }
            return React.createElement("div", { className: "playground-project-overview-activity-participants", "aria-label": "Activity participants" },
              participants.map((item) =>
                React.cloneElement(
                  renderProjectOverviewActivityAvatar(item, "playground-project-overview-activity-participant-avatar"),
                  { key: getProjectOverviewActivityParticipantKey(item) || item.id }
                )
              )
            );
          }

          function getProjectOverviewActivityPermissionSet() {
            if (typeof normalizePlaygroundPermissionSet !== "function") {
              return null;
            }
            return normalizePlaygroundPermissionSet(
              projectOverviewDraft?.permissionSet
                || projectOverviewDraft?.metadata?.permissionSet
                || selectedProject?.permissionSet
                || selectedProject?.metadata?.permissionSet,
              "project"
            );
          }

          function renderProjectOverviewActivityPermissionRing(item) {
            if (
              !item?.permissionActionId
              || typeof renderPlaygroundPermissionMiniRingIcon !== "function"
              || typeof getPlaygroundPermissionActionDefinition !== "function"
              || typeof getPlaygroundPermissionActionRingId !== "function"
            ) {
              return null;
            }
            const actionDefinition = getPlaygroundPermissionActionDefinition(item.permissionActionId);
            if (!actionDefinition) {
              return null;
            }
            const permissionSet = getProjectOverviewActivityPermissionSet();
            const actionRingId = getPlaygroundPermissionActionRingId(permissionSet, actionDefinition);
            const ringDefinition = typeof getPlaygroundPermissionRingDefinition === "function"
              ? getPlaygroundPermissionRingDefinition(actionRingId)
              : null;
            const actionAccess = typeof getPlaygroundPermissionActionAccess === "function"
              ? getPlaygroundPermissionActionAccess(permissionSet, actionDefinition)
              : "";
            const accessLabel = typeof getPlaygroundPermissionAccessLabel === "function" && actionAccess
              ? getPlaygroundPermissionAccessLabel(actionAccess)
              : "";
            const label = [
              actionDefinition.label,
              ringDefinition?.label || "",
              accessLabel,
            ].filter(Boolean).join(" · ");
            const ringTitle = ringDefinition
              ? [ringDefinition.label, ringDefinition.title].filter(Boolean).join(" · ")
              : (actionRingId || "Permission ring");
            const ringDescription = ringDefinition?.description || "";
            return React.createElement("span", {
                className: "playground-project-overview-activity-permission",
                "aria-label": label,
                tabIndex: 0,
              },
              renderPlaygroundPermissionMiniRingIcon(actionRingId),
              React.createElement("span", { className: "playground-project-overview-activity-permission-tooltip", role: "tooltip" },
                React.createElement("span", { className: "playground-project-overview-activity-permission-tooltip-title" }, ringTitle),
                ringDescription
                  ? React.createElement("span", { className: "playground-project-overview-activity-permission-tooltip-copy" }, ringDescription)
                  : null
              )
            );
          }

          function getProjectOverviewTaskActivityActorName(event) {
            const actorName = String(event?.actorName || "").trim();
            if (actorName) {
              return actorName;
            }
            const fallbackActor = resolveProjectOverviewActivityActor(
              event?.actorAgentId,
              event?.actorType === "system" ? "Computer Agents" : "User",
              event
            );
            return fallbackActor.name;
          }

          function renderProjectOverviewTaskActivityActorAvatar(
            event,
            className = "playground-tasks-activity-avatar"
          ) {
            if (typeof renderTaskCommentAvatar === "function") {
              return renderTaskCommentAvatar({
                id: event?.id || "",
                authorType: event?.actorType || "user",
                authorAgentId: event?.actorAgentId || undefined,
                authorUserId: event?.actorUserId || undefined,
                authorName: event?.actorName || undefined,
                authorAvatarUrl: event?.actorAvatarUrl || undefined,
              }, className);
            }
            const actor = resolveProjectOverviewActivityActor(
              event?.actorAgentId,
              event?.actorName || "User",
              event
            );
            return renderAgentNameAvatar(
              actor.name,
              className,
              actor.photoUrl
            );
          }

          function getProjectOverviewTaskActivityParticipantKey(event) {
            const actorAgentId = String(event?.actorAgentId || "").trim();
            if (actorAgentId) {
              return "agent:" + actorAgentId;
            }
            const actorUserId = String(event?.actorUserId || "").trim();
            if (actorUserId) {
              return "user:" + actorUserId;
            }
            const actorName = getProjectOverviewTaskActivityActorName(event).toLowerCase();
            return actorName ? "name:" + actorName : "";
          }

          function renderProjectOverviewTaskActivityParticipants(events) {
            const seen = new Set();
            const participants = (Array.isArray(events) ? events : []).filter((event) => {
              const key = getProjectOverviewTaskActivityParticipantKey(event);
              if (!key || seen.has(key)) {
                return false;
              }
              seen.add(key);
              return true;
            });
            if (!participants.length) {
              return null;
            }
            return React.createElement("div", {
              className: "playground-project-overview-activity-participants",
              "aria-label": "Recent activity participants",
            }, participants.map((event) =>
              React.cloneElement(
                renderProjectOverviewTaskActivityActorAvatar(
                  event,
                  "playground-project-overview-activity-participant-avatar"
                ),
                {
                  key: getProjectOverviewTaskActivityParticipantKey(event) || event.id,
                  title: getProjectOverviewTaskActivityActorName(event),
                }
              )
            ));
          }

          function formatProjectOverviewTaskActivityFieldValue(fieldName, value) {
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

          function renderProjectOverviewTaskActivitySummary(event) {
            const actor = React.createElement("strong", null, getProjectOverviewTaskActivityActorName(event));
            if (event.eventType === "project_update_posted") {
              return React.createElement(
                React.Fragment,
                null,
                actor,
                " posted a project update"
              );
            }
            if (event.eventType === "created") {
              return React.createElement(React.Fragment, null, actor, " created the issue");
            }
            if (event.eventType === "status_changed") {
              const previousStatus = formatProjectOverviewTaskActivityFieldValue("status", event.previousValue);
              const nextStatus = formatProjectOverviewTaskActivityFieldValue("status", event.nextValue);
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
              const threadTitle = String(event.thread?.title || event.metadata?.threadTitle || event.task?.title || "Untitled thread").trim();
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
              const nextValue = formatProjectOverviewTaskActivityFieldValue(fieldName, event.nextValue);
              const previousValue = formatProjectOverviewTaskActivityFieldValue(fieldName, event.previousValue);
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

          function getProjectOverviewTaskActivityEvents() {
            const taskEvents = (projectOverviewTaskActivityState?.items || [])
              .filter((event) => {
                const fieldName = String(event?.fieldName || "").trim().toLowerCase();
                return event?.eventType !== "comment_added"
                  && !(event?.eventType === "field_changed" && fieldName === "description");
              });
            return taskEvents
              .concat(buildProjectOverviewUpdateActivityEvents())
              .sort((left, right) => {
                const leftTime = Date.parse(String(left?.createdAt || ""));
                const rightTime = Date.parse(String(right?.createdAt || ""));
                return (Number.isFinite(rightTime) ? rightTime : 0)
                  - (Number.isFinite(leftTime) ? leftTime : 0);
              })
              .slice(0, 5);
          }

          function buildProjectOverviewTaskActivityTimelineItems(events = getProjectOverviewTaskActivityEvents()) {
            return events.map((event) => {
                if (event.eventType === "project_update_posted") {
                  return {
                    id: event.id,
                    tone: "created",
                    summary: renderProjectOverviewTaskActivitySummary(event),
                    timestamp: formatRelativeThreadTime(event.createdAt)
                      || formatPlaygroundFileDate(event.createdAt),
                    trailing: renderProjectOverviewUpdateStatus(event.projectUpdate?.status),
                    avatar: renderProjectOverviewTaskActivityActorAvatar(event),
                  };
                }
                const isThread = event.eventType === "thread_started";
                const isStatus = event.eventType === "status_changed";
                const isFieldChange = event.eventType === "field_changed";
                const fieldName = String(event.fieldName || "").trim();
                const isPriorityChange = isFieldChange && fieldName === "priority";
                const isMilestoneChange = isFieldChange && ["releaseId", "milestoneId"].includes(fieldName);
                const isScheduleChange = isFieldChange && [
                  "dueAt",
                  "scheduledStartAt",
                  "scheduledEndAt",
                  "scheduleType",
                  "cronExpression",
                  "scheduleTimezone",
                  "scheduleEnabled",
                ].includes(fieldName);
                const task = event.task
                  || (event.taskId ? normalizedOverviewTasksById[event.taskId] || null : null);
                const taskId = String(event.taskId || task?.id || "").trim();
                const ticketNumber = taskId
                  ? String(taskTicketNumbersById[taskId] || task?.ticketNumber || "").trim()
                  : "";
                const ticketLabel = [ticketNumber, task?.title || ""].filter(Boolean).join(" ");
                return {
                  id: event.id,
                  tone: isThread ? "thread" : isStatus ? "status" : "created",
                  summary: renderProjectOverviewTaskActivitySummary(event),
                  timestamp: formatRelativeThreadTime(event.createdAt)
                    || formatPlaygroundFileDate(event.createdAt),
                  trailing: ticketLabel
                    ? React.createElement("span", {
                        className: "playground-project-overview-task-activity-ticket",
                        title: ticketLabel,
                      }, ticketLabel)
                    : null,
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
                        : renderProjectOverviewTaskActivityActorAvatar(event),
                  icon: isMilestoneChange
                    ? Milestone
                    : isScheduleChange
                      ? CalendarIcon
                      : isFieldChange
                        ? PencilRuler
                        : undefined,
                  onActivate: taskId && typeof openProjectTaskDetailScreen === "function"
                    ? () => openProjectTaskDetailScreen(taskId)
                    : undefined,
                  ariaLabel: ticketLabel ? "Open " + ticketLabel : undefined,
                };
              });
          }

          function renderProjectOverviewActivitySection() {
            const activityEvents = getProjectOverviewTaskActivityEvents();
            const activityTimelineItems = buildProjectOverviewTaskActivityTimelineItems(activityEvents);
            const activeProjectOverviewSectionTab = projectOverviewActivityTab === "activity"
              ? "activity"
              : "threads";
            const isThreadsTab = activeProjectOverviewSectionTab === "threads";
            const isActivityTab = activeProjectOverviewSectionTab === "activity";
            const projectOverviewSectionTabs = React.createElement(PlatformDetailTabBar, {
              ariaLabel: "Project activity",
              value: activeProjectOverviewSectionTab,
              tabs: [
                { id: "threads", label: "Threads" },
                { id: "activity", label: "Activity" },
              ],
              onValueChange: setProjectOverviewActivityTab,
              variant: "minimal",
              className: "playground-project-overview-activity-tabs",
              endActions: isActivityTab
                ? renderProjectOverviewTaskActivityParticipants(activityEvents)
                : null
            });
            return React.createElement("section", { className: "playground-project-overview-activity-card is-main" },
              isActivityTab
                ? React.createElement(
                    "div",
                    { className: "playground-project-overview-activity-header" },
                    projectOverviewSectionTabs
                  )
                : null,
              isThreadsTab
                ? renderProjectOverviewThreadsSection({
                    embedded: true,
                    toolbarLeading: projectOverviewSectionTabs,
                  })
                : isActivityTab
                ? (
                    projectOverviewTaskActivityState?.status === "loading" && activityTimelineItems.length === 0
                      ? React.createElement(PlatformLoadingState, {
                          className: "playground-project-overview-task-activity-loading",
                          message: "Loading activity...",
                          centered: true,
                        })
                      : React.createElement(PlatformActivityTimeline, {
                          className: "playground-project-overview-task-activity-timeline",
                          title: null,
                          items: activityTimelineItems,
                          emptyTitle: projectOverviewTaskActivityState?.status === "error"
                            ? "Activity unavailable"
                            : "No activity yet",
                          emptyDescription: projectOverviewTaskActivityState?.status === "error"
                            ? projectOverviewTaskActivityState.error
                            : "Ticket actions will appear here as work progresses.",
                        })
                  )
                : null
            );
          }

          function getProjectOverviewProgressStats() {
            const scopeCount = Math.max(
              0,
              Number(selectedProjectTaskStatusOverview?.total) || 0,
              Number(selectedProjectSummary?.tasksCount) || 0,
              normalizedOverviewTasks.length
            );
            const completedCount = Math.max(0, Math.min(scopeCount, Number(selectedProjectTaskStatusOverview?.done) || 0));
            const startedCount = Math.max(0, Math.min(
              scopeCount,
              completedCount + (Number(selectedProjectTaskStatusOverview?.inProgress) || 0)
            ));
            return {
              scopeCount,
              startedCount,
              completedCount,
              rows: [
                { id: "scope", label: "Scope", value: scopeCount, percent: 100 },
                { id: "started", label: "Started", value: startedCount, percent: scopeCount > 0 ? Math.round((startedCount / scopeCount) * 100) : 0 },
                { id: "completed", label: "Completed", value: completedCount, percent: scopeCount > 0 ? Math.round((completedCount / scopeCount) * 100) : 0 },
              ],
            };
          }

          function parseProjectOverviewTaskTimelineTimestamp(...values) {
            for (const value of values) {
              if (typeof value === "number" && Number.isFinite(value) && value > 0) {
                return value;
              }
              if (typeof value !== "string" || !value.trim()) {
                continue;
              }
              const timestamp = Date.parse(value.trim());
              if (Number.isFinite(timestamp)) {
                return timestamp;
              }
            }
            return null;
          }

          function getProjectOverviewTaskStatusId(task) {
            return String(task?.status || "").trim().toLowerCase();
          }

          function isProjectOverviewTaskStartedStatus(status) {
            return status === "in_progress" || status === "in_review" || status === "done";
          }

          function isProjectOverviewTaskCompletedStatus(status) {
            return status === "done";
          }

          function buildProjectOverviewThreadTimestampById() {
            return projectThreads.reduce((map, thread) => {
              const threadId = String(thread?.id || thread?.threadId || "").trim();
              if (!threadId) {
                return map;
              }
              const timestamp = parseProjectOverviewTaskTimelineTimestamp(
                thread?.startedAt,
                thread?.createdAt,
                thread?.updatedAt,
                thread?.completedAt,
                thread?.finishedAt,
                thread?.endedAt
              );
              if (Number.isFinite(timestamp)) {
                map[threadId] = timestamp;
              }
              return map;
            }, Object.create(null));
          }

          function getProjectOverviewTaskEarliestLinkedThreadTimestamp(task, threadTimestampById) {
            const threadIds = new Set();
            if (typeof task?.lastStartedThreadId === "string" && task.lastStartedThreadId.trim()) {
              threadIds.add(task.lastStartedThreadId.trim());
            }
            if (Array.isArray(task?.linkedThreadIds)) {
              task.linkedThreadIds.forEach((threadId) => {
                if (typeof threadId === "string" && threadId.trim()) {
                  threadIds.add(threadId.trim());
                }
              });
            }
            let earliest = null;
            threadIds.forEach((threadId) => {
              const timestamp = threadTimestampById?.[threadId];
              if (!Number.isFinite(timestamp)) {
                return;
              }
              earliest = earliest === null ? timestamp : Math.min(earliest, timestamp);
            });
            return earliest;
          }

          function buildProjectOverviewProgressSeriesForBuckets(dailyCtBuckets) {
            const tasksForTimeline = Array.isArray(normalizedOverviewTasks) ? normalizedOverviewTasks : [];
            const threadTimestampById = buildProjectOverviewThreadTimestampById();
            const bucketEndTimes = dailyCtBuckets.map((bucket) => {
              const key = String(bucket?.key || "").trim();
              const timestamp = Date.parse(key + "T23:59:59.999");
              return Number.isFinite(timestamp) ? timestamp : null;
            });
            const scopeValues = [];
            const startedValues = [];
            const completedValues = [];

            bucketEndTimes.forEach((bucketEndTime) => {
              let scopeCount = 0;
              let startedCount = 0;
              let completedCount = 0;

              tasksForTimeline.forEach((task) => {
                const createdAt = parseProjectOverviewTaskTimelineTimestamp(
                  task?.createdAt,
                  task?.created_at,
                  task?.insertedAt,
                  task?.metadata?.createdAt
                );
                const taskExistsByBucket = bucketEndTime === null
                  || createdAt === null
                  || createdAt <= bucketEndTime;
                if (!taskExistsByBucket) {
                  return;
                }

                scopeCount += 1;

                const status = getProjectOverviewTaskStatusId(task);
                const linkedStartedAt = getProjectOverviewTaskEarliestLinkedThreadTimestamp(task, threadTimestampById);
                const fallbackStartedAt = isProjectOverviewTaskStartedStatus(status)
                  ? parseProjectOverviewTaskTimelineTimestamp(
                      linkedStartedAt,
                      task?.startedAt,
                      task?.updatedAt,
                      task?.createdAt
                    )
                  : null;
                const startedAt = linkedStartedAt !== null ? linkedStartedAt : fallbackStartedAt;
                if (
                  startedAt !== null
                  && (bucketEndTime === null || startedAt <= bucketEndTime)
                ) {
                  startedCount += 1;
                }

                const completedAt = parseProjectOverviewTaskTimelineTimestamp(
                  task?.completedAt,
                  task?.finishedAt,
                  task?.closedAt,
                  isProjectOverviewTaskCompletedStatus(status) ? task?.updatedAt : null,
                  isProjectOverviewTaskCompletedStatus(status) ? task?.createdAt : null
                );
                if (
                  completedAt !== null
                  && (bucketEndTime === null || completedAt <= bucketEndTime)
                ) {
                  completedCount += 1;
                }
              });

              scopeValues.push(scopeCount);
              startedValues.push(Math.min(startedCount, scopeCount));
              completedValues.push(Math.min(completedCount, scopeCount));
            });

            return [
              { id: "scope", values: scopeValues },
              { id: "started", values: startedValues },
              { id: "completed", values: completedValues },
            ];
          }

          function buildProjectOverviewDailyCtBuckets(bucketCount) {
            const now = new Date();
            const endDate = new Date(now);
            endDate.setHours(0, 0, 0, 0);
            const buckets = [];
            const bucketIndexByKey = new Map();
            for (let index = 0; index < bucketCount; index += 1) {
              const date = new Date(endDate);
              date.setDate(endDate.getDate() - (bucketCount - 1 - index));
              const key = getProjectOverviewLocalDayKey(date);
              const bucket = {
                key,
                label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                totalCT: 0,
              };
              bucketIndexByKey.set(key, buckets.length);
              buckets.push(bucket);
            }

            const projectCostSummary = projectOverviewCostSummaryState?.summary;
            const projectCostSummaryDays = Array.isArray(projectCostSummary?.byDay) ? projectCostSummary.byDay : [];
            if (projectOverviewCostSummaryState?.status === "ready" && projectCostSummary) {
              projectCostSummaryDays.forEach((day) => {
                const timestamp = Date.parse(String(day?.date || "") + "T00:00:00");
                if (!Number.isFinite(timestamp)) {
                  return;
                }
                const bucketIndex = bucketIndexByKey.get(getProjectOverviewLocalDayKey(new Date(timestamp)));
                if (typeof bucketIndex !== "number") {
                  return;
                }
                buckets[bucketIndex].totalCT += Math.max(0, Number(readSettingsComputeTokens(day, "totalCT", "totalCost") || 0));
              });
              return buckets;
            }

            projectThreads.forEach((thread) => {
              const timestamp = Date.parse(String(thread?.updatedAt || thread?.createdAt || ""));
              if (!Number.isFinite(timestamp)) {
                return;
              }
              const bucketIndex = bucketIndexByKey.get(getProjectOverviewLocalDayKey(new Date(timestamp)));
              if (typeof bucketIndex !== "number") {
                return;
              }
              buckets[bucketIndex].totalCT += Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
            });
            return buckets;
          }

          function getProjectOverviewProgressBucketCount() {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            const candidateTimestamps = [
              selectedProject?.startDate,
              selectedProject?.createdAt,
              selectedProject?.metadata?.startDate,
              selectedProject?.metadata?.createdAt,
              ...normalizedOverviewTasks.flatMap((task) => [
                task?.createdAt,
                task?.created_at,
              ]),
            ]
              .map((value) => parseProjectOverviewTaskTimelineTimestamp(value))
              .filter((value) => Number.isFinite(value) && value <= now.getTime());
            if (!candidateTimestamps.length) {
              return 30;
            }
            const earliestTimestamp = Math.min(...candidateTimestamps);
            const elapsedDays = Math.floor((now.getTime() - earliestTimestamp) / (24 * 60 * 60 * 1000));
            return Math.min(365, Math.max(2, elapsedDays + 1));
          }

          function buildProjectOverviewSidebarProgressAnalytics() {
            const progressStats = getProjectOverviewProgressStats();
            const resourceCount = Array.isArray(projectOverviewAllResourceRows)
              ? projectOverviewAllResourceRows.length
              : 0;
            const dailyCtBuckets = buildProjectOverviewDailyCtBuckets(getProjectOverviewProgressBucketCount());
            const progressSeries = buildProjectOverviewProgressSeriesForBuckets(dailyCtBuckets);
            const metricColors = {
              scope: "#8fc4ff",
              started: "#7657ff",
              completed: "#7effff",
              resources: "#9ff6ce",
            };
            const seriesColors = {
              scope: "#8fc4ff",
              started: "#4da3ff",
              completed: "#7657ff",
            };
            return {
              ariaLabel: "Project progress",
              metrics: progressStats.rows.concat({
                id: "resources",
                label: "Resources",
                value: resourceCount,
              }).map((row) => ({
                id: row.id,
                label: row.label,
                value: formatProjectOverviewInteger(row.value),
                color: metricColors[row.id] || "rgba(255, 255, 255, 0.72)",
              })),
              labels: dailyCtBuckets.map((bucket) => String(bucket?.label || "")),
              series: progressSeries.map((entry) => ({
                id: entry.id,
                label: entry.id === "scope" ? "Scope" : entry.id === "started" ? "Started" : "Completed",
                values: entry.values,
                color: seriesColors[entry.id] || "rgba(255, 255, 255, 0.72)",
                type: "line",
                axis: "primary",
                valueKind: "count",
                fill: entry.id === "completed",
                fillColor: entry.id === "completed" ? "rgba(118, 87, 255, 0.22)" : undefined,
              })),
              hasData: progressStats.scopeCount > 0 || resourceCount > 0,
              loading: taskLoadState?.status === "loading" && progressStats.scopeCount === 0 && resourceCount === 0,
            };
          }

          function renderProjectOverviewProgressAnalyticsSection() {
            return React.createElement(PlatformAnalyticsSection, {
              variant: "default",
              title: "Activity",
              analytics: buildProjectOverviewSidebarProgressAnalytics(),
              className: "playground-evaluations-analytics-card playground-project-overview-progress-analytics",
            });
          }

          function renderProjectOverviewSpotlightCard(task) {
            const boardStatus = typeof getTaskBoardStatus === "function"
              ? getTaskBoardStatus(task)
              : String(task?.status || "").trim().toLowerCase();
            const taskType = normalizePlaygroundTaskType(task?.taskType || task?.type);
            const TaskTypeIcon = getPlaygroundTaskTypeIcon(taskType);
            const taskId = String(task?.id || "").trim();
            const taskTicketNumber = taskTicketNumbersById[taskId] || task?.ticketNumber || "001";
            const statusLabel = getPlaygroundTaskStatusLabel(boardStatus);
            return React.createElement(PlatformTicketItem, {
              key: taskId || taskTicketNumber,
              variant: "card",
              title: task?.title || "Untitled Task",
              taskType,
              typeIcon: React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 }),
              priority: renderPlaygroundTaskPriorityIcon(task?.priority, "playground-tasks-lane-card-priority"),
              ticketNumber: taskTicketNumber,
              status: React.createElement("span", {
                className: "playground-tasks-lane-card-status",
                title: statusLabel,
              }, statusLabel),
              assignee: renderTaskAssigneeAvatar(task, "playground-tasks-board-assignee-avatar"),
              completed: task?.status === "done",
              active: selectedTaskId === taskId,
              style: getPlaygroundTaskColorStyle(task?.taskColor),
              onClick: () => {
                if (taskId) {
                  openProjectTaskDetailScreen(taskId);
                }
              },
              onContextMenu: (event) => {
                if (!taskId) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                openBacklogTaskContextMenu(task, event, {
                  includeOpenAction: true,
                  useWorkActions: true,
                });
              },
            });
          }

          function getProjectOverviewSpotlightTasks() {
            const statusOrder = {
              in_review: 1,
              review: 1,
              in_progress: 2,
              doing: 2,
              backlog: 3,
              todo: 3,
              to_do: 3,
              blocked: 4,
            };
            return (Array.isArray(normalizedOverviewTasks) ? normalizedOverviewTasks : [])
              .filter((task) => typeof isPlaygroundSubtaskRecord !== "function" || !isPlaygroundSubtaskRecord(task))
              .map((task, index) => {
                const boardStatus = typeof getTaskBoardStatus === "function"
                  ? getTaskBoardStatus(task)
                  : String(task?.status || "").trim().toLowerCase();
                const normalizedBoardStatus = String(boardStatus || "")
                  .trim()
                  .toLowerCase()
                  .replaceAll("-", "_")
                  .replace(/\s+/g, "_");
                return { task, index, rank: statusOrder[normalizedBoardStatus] || 0 };
              })
              .filter((entry) => entry.rank > 0)
              .sort((left, right) => left.rank - right.rank || left.index - right.index)
              .slice(0, 3)
              .map((entry) => entry.task);
          }

          function renderProjectOverviewSpotlightSection() {
            const spotlightTasks = getProjectOverviewSpotlightTasks();
            return React.createElement("section", {
              className: "playground-project-overview-spotlight",
              "aria-label": "Spotlight",
            },
              React.createElement("div", { className: "playground-project-overview-spotlight__header" },
                React.createElement("h2", { className: "playground-project-overview-spotlight__title" }, "Spotlight"),
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "small",
                  className: "playground-project-overview-spotlight__view-all",
                  onClick: () => {
                    if (typeof setTaskView === "function") {
                      setTaskView("backlog");
                    }
                  },
                }, "View all")
              ),
              spotlightTasks.length > 0
                ? React.createElement("div", { className: "playground-project-overview-spotlight__grid" },
                    spotlightTasks.map((task) => renderProjectOverviewSpotlightCard(task))
                  )
                : null,
              renderBacklogTaskContextMenu()
            );
          }

          function renderProjectOverviewWidgetHeader(title, Icon, action) {
            return React.createElement("div", { className: "playground-project-overview-widget-header" },
              React.createElement("div", { className: "playground-project-overview-widget-title-wrap" },
                React.createElement("span", { className: "playground-project-overview-widget-icon", "aria-hidden": "true" },
                  Icon ? React.createElement(Icon, { strokeWidth: 1.8 }) : null
                ),
                React.createElement("span", { className: "playground-project-overview-widget-title" }, title)
              ),
              action ? React.createElement("button", {
                type: "button",
                className: "playground-project-overview-widget-action",
                onClick: action.onClick,
              }, action.label) : null
            );
          }

          function renderProjectOverviewWidgetListItem({ key, Icon, title, meta, onClick }) {
            const elementType = typeof onClick === "function" ? "button" : "div";
            return React.createElement(elementType, {
                key,
                type: elementType === "button" ? "button" : undefined,
                className: "playground-project-overview-widget-list-item",
                onClick,
              },
              React.createElement("span", { className: "playground-project-overview-widget-list-icon", "aria-hidden": "true" },
                Icon ? React.createElement(Icon, { strokeWidth: 1.8 }) : null
              ),
              React.createElement("span", { className: "playground-project-overview-widget-list-copy" },
                React.createElement("span", { className: "playground-project-overview-widget-list-title", title }, title),
                meta ? React.createElement("span", { className: "playground-project-overview-widget-list-meta", title: meta }, meta) : null
              )
            );
          }

          function renderProjectOverviewProgressWidget() {
            const progressStats = getProjectOverviewProgressStats();
            const chartWidth = 220;
            const chartHeight = 86;
            const paddingX = 4;
            const paddingTop = 8;
            const paddingBottom = 18;
            const maxValue = Math.max(1, progressStats.scopeCount, progressStats.startedCount, progressStats.completedCount);
            const pointCount = 5;
            function makeValues(target, curve) {
              return curve.map((factor) => Math.round(Math.max(0, target) * factor));
            }
            const series = [
              { id: "scope", values: makeValues(progressStats.scopeCount, [0, 0.28, 0.48, 0.72, 1]) },
              { id: "started", values: makeValues(progressStats.startedCount, [0, 0.16, 0.55, 0.82, 1]) },
              { id: "completed", values: makeValues(progressStats.completedCount, [0, 0.08, 0.3, 0.68, 1]) },
            ];
            function getPoint(value, index) {
              const x = paddingX + (index / Math.max(1, pointCount - 1)) * (chartWidth - paddingX * 2);
              const y = paddingTop + (1 - (value / maxValue)) * (chartHeight - paddingTop - paddingBottom);
              return { x, y };
            }
            function buildPath(values) {
              return values.map((value, index) => {
                const point = getPoint(value, index);
                return (index === 0 ? "M" : "L") + point.x.toFixed(1) + " " + point.y.toFixed(1);
              }).join(" ");
            }
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Progress", ChartNoAxesColumnIncreasing),
              React.createElement("div", { className: "playground-project-overview-widget-progress-chart" },
                React.createElement("svg", {
                  className: "playground-project-overview-widget-progress-svg",
                  viewBox: "0 0 " + chartWidth + " " + chartHeight,
                  preserveAspectRatio: "none",
                  role: "img",
                  "aria-label": "Project progress by task status",
                },
                  [0.33, 0.66].map((fraction) =>
                    React.createElement("line", {
                      key: "guide:" + fraction,
                      className: "playground-project-overview-widget-progress-guide",
                      x1: paddingX,
                      x2: chartWidth - paddingX,
                      y1: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                      y2: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                    })
                  ),
                  React.createElement("line", {
                    className: "playground-project-overview-widget-progress-axis",
                    x1: paddingX,
                    x2: chartWidth - paddingX,
                    y1: chartHeight - paddingBottom,
                    y2: chartHeight - paddingBottom,
                  }),
                  series.map((entry) =>
                    React.createElement("path", {
                      key: entry.id,
                      className: "playground-project-overview-widget-progress-line is-" + entry.id,
                      d: buildPath(entry.values),
                    })
                  ),
                  series.map((entry) => {
                    const point = getPoint(entry.values[entry.values.length - 1] || 0, entry.values.length - 1);
                    return React.createElement("circle", {
                      key: "dot:" + entry.id,
                      className: "playground-project-overview-widget-progress-dot",
                      cx: point.x,
                      cy: point.y,
                      r: 4,
                      fill: entry.id === "completed" ? "rgb(56, 204, 164)" : entry.id === "started" ? "rgb(122, 126, 255)" : "rgba(255, 255, 255, 0.7)",
                    });
                  })
                ),
                React.createElement("div", { className: "playground-project-overview-widget-rows" },
                  progressStats.rows.map((row) =>
                    React.createElement("div", { key: row.id, className: "playground-project-overview-widget-row" },
                      React.createElement("div", { className: "playground-project-overview-widget-row-name" },
                        React.createElement("span", { className: "playground-project-overview-widget-swatch is-" + row.id }),
                        React.createElement("span", null, row.label)
                      ),
                      React.createElement("div", { className: "playground-project-overview-widget-row-percent" }, row.percent + "%"),
                      React.createElement("div", { className: "playground-project-overview-widget-row-value" }, row.value)
                    )
                  )
                )
              )
            );
          }

          function renderProjectOverviewCostWidget() {
            const visibleBuckets = projectThreadTimeline.slice(-10);
            const maxBucketTotal = Math.max(1, ...visibleBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0))));
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Cost Observability", Coins, {
                label: "Details",
                onClick: () => typeof setProjectOverviewHomeTab === "function" && setProjectOverviewHomeTab("general"),
              }),
              React.createElement("div", { className: "playground-project-overview-cost-widget-main" },
                React.createElement("div", { className: "playground-project-overview-cost-widget-value" }, formatProjectOverviewCt(projectTotalCt)),
                React.createElement("div", { className: "playground-project-overview-cost-widget-label" }, "Spent on project"),
                projectHasCostData
                  ? React.createElement("div", { className: "playground-project-overview-cost-widget-bars", "aria-label": "Project cost by resource type" },
                      visibleBuckets.map((bucket, bucketIndex) => {
                        const total = Math.max(0, Number(bucket?.totalCT || 0));
                        return React.createElement("div", {
                            key: String(bucket?.key || bucketIndex),
                            className: "playground-project-overview-cost-widget-bar",
                            title: String(bucket?.label || "") + " · " + formatProjectOverviewAxisCt(total),
                          },
                          projectComputeSeries.map((entry) => {
                            const rawValue = Math.max(0, Number(entry.values[projectThreadTimeline.length - visibleBuckets.length + bucketIndex] || 0));
                            if (rawValue <= 0 || total <= 0) {
                              return null;
                            }
                            return React.createElement("span", {
                              key: entry.id,
                              className: "playground-project-overview-cost-widget-segment",
                              style: {
                                height: Math.max(1, (rawValue / maxBucketTotal) * 100) + "%",
                                background: entry.color,
                              },
                            });
                          })
                        );
                      })
                    )
                  : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project cost yet.")
              )
            );
          }

          function getProjectOverviewResourceHaystack(resource) {
            return [
              resource?.type,
              resource?.kind,
              resource?.resourceType,
              resource?.resourceKind,
              resource?.serverKind,
              resource?.title,
              resource?.name,
              resource?.label,
            ].join(" ").toLowerCase();
          }

          function isProjectOverviewMetronomeResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("metronome") || haystack.includes("schedule") || haystack.includes("cron");
          }

          function isProjectOverviewWebAppResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("web app")
              || haystack.includes("web-app")
              || haystack.includes("web_app")
              || haystack.includes("webapp")
              || haystack.includes("frontend app")
              || haystack.includes("hosted app");
          }

          function isProjectOverviewDatabaseResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("database")
              || haystack.includes("datastore")
              || haystack.includes("data store")
              || haystack.includes("firestore")
              || haystack.includes("postgres");
          }

          function renderProjectOverviewMetronomesWidget() {
            const metronomeResources = allOverviewResourceItems.filter((item) => isProjectOverviewMetronomeResource(item)).slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Metronomes", Metronome, {
                label: "Open",
                onClick: () => typeof onOpenProjectMetronomes === "function" && onOpenProjectMetronomes({ projectId: normalizedSelectedProjectId }),
              }),
              metronomeResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    metronomeResources.map((resource, index) => {
                      const title = String(resource?.title || resource?.name || resource?.label || "Metronome").trim();
                      const meta = [resource?.status || "", resource?.dateLabel || resource?.updatedAt || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || title || index),
                        Icon: Metronome,
                        title,
                        meta,
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project metronomes yet.")
            );
          }

          function renderProjectOverviewFilesWidget() {
            const visibleFiles = filteredProjectFileActivityItems.slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Files", FolderOpen, {
                label: "Open",
                onClick: () => {
                  if (typeof onOpenFilesPage !== "function") return;
                  onOpenFilesPage({
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    projectId: normalizedSelectedProjectId,
                    environmentId: activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                  });
                },
              }),
              visibleFiles.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    visibleFiles.map((row, index) => {
                      const title = String(row?.title || row?.path || "Untitled file").trim();
                      const meta = [row?.operation || "Modified", row?.dateLabel || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(row?.id || row?.path || title || index),
                        Icon: FolderOpen,
                        title,
                        meta,
                        onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(row),
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project file activity yet.")
            );
          }

          function renderProjectOverviewResourcesWidget() {
            const metronomeResources = allOverviewResourceItems
              .filter((item) => isProjectOverviewMetronomeResource(item))
              .map((resource, index) => {
                const title = String(resource?.title || resource?.name || resource?.label || "Metronome").trim();
                return {
                  key: "metronome:" + String(resource?.id || title || index),
                  Icon: Metronome,
                  title,
                  meta: [resource?.status || "Metronome", resource?.dateLabel || resource?.updatedAt || ""].filter(Boolean).join(" · "),
                  onClick: () => typeof onOpenProjectMetronomes === "function" && onOpenProjectMetronomes({ projectId: normalizedSelectedProjectId }),
                };
              });
            const serverResources = overviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item))
              .map((resource, index) => {
                const title = String(resource?.title || resource?.name || resource?.label || "Resource").trim();
                return {
                  key: "server:" + String(resource?.id || title || index),
                  Icon: Server,
                  title,
                  meta: [resource?.type || resource?.kind || resource?.resourceType || "Server resource", resource?.status || ""].filter(Boolean).join(" · "),
                  onClick: () => {
                    if (typeof setProjectOverviewHomeTab === "function") {
                      setProjectOverviewHomeTab("resources");
                    }
                    if (typeof setProjectOverviewFilesSubview === "function") {
                      setProjectOverviewFilesSubview("resources");
                    }
                  },
                };
              });
            const imagineResources = projectOverviewImagineResources.map((resource, index) => {
              const resourcePath = String(resource?.path || resource?.sourcePath || resource?.workspacePath || "").trim();
              const title = String(resource?.title || resource?.filename || getHistoryPathName(resourcePath) || "Untitled visual").trim();
              const candidate = [resource?.mimeType, resource?.contentType, resource?.type, resource?.fileType, resourcePath, title].join(" ");
              const isVideoResource = /^video\//i.test(String(candidate || "")) || /\.(m4v|mkv|mov|mp4|webm)$/i.test(String(candidate || ""));
              return {
                key: "imagine:" + String(resource?.id || resourcePath || title || index),
                Icon: isVideoResource ? Film : ImageIcon,
                title,
                meta: [isVideoResource ? "Video" : "Image", resource?.dateLabel || ""].filter(Boolean).join(" · "),
                onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(resource),
              };
            });
            const combinedResources = []
              .concat(metronomeResources)
              .concat(serverResources)
              .concat(imagineResources);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Resources", Server, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("resources");
                  }
                },
              }),
              combinedResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    combinedResources.map((resource) => renderProjectOverviewWidgetListItem(resource))
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No project resources yet.")
            );
          }

          function renderProjectOverviewServerResourcesWidget() {
            const visibleResources = overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item)).slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Server Resources", Server, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("resources");
                  }
                },
              }),
              visibleResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    visibleResources.map((resource, index) => {
                      const title = String(resource?.title || resource?.name || resource?.label || "Resource").trim();
                      const meta = [resource?.type || resource?.kind || resource?.resourceType || "Resource", resource?.status || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || title || index),
                        Icon: Server,
                        title,
                        meta,
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No server resources yet.")
            );
          }

          function renderProjectOverviewImagineWidget() {
            const visibleImagineResources = projectOverviewImagineResources.slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Imagine Resources", Clapperboard, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("imagine");
                  }
                },
              }),
              visibleImagineResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    visibleImagineResources.map((resource, index) => {
                      const resourcePath = String(resource?.path || resource?.sourcePath || resource?.workspacePath || "").trim();
                      const title = String(resource?.title || resource?.filename || getHistoryPathName(resourcePath) || "Untitled visual").trim();
                      const candidate = [resource?.mimeType, resource?.contentType, resource?.type, resource?.fileType, resourcePath, title].join(" ");
                      const isVideoResource = /^video\//i.test(String(candidate || "")) || /\.(m4v|mkv|mov|mp4|webm)$/i.test(String(candidate || ""));
                      const meta = [isVideoResource ? "Video" : "Image", resource?.dateLabel || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || resourcePath || title || index),
                        Icon: isVideoResource ? Film : ImageIcon,
                        title,
                        meta,
                        onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(resource),
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No imagine resources yet.")
            );
          }

          function renderProjectOverviewUsersWidget() {
            const summary = selectedProjectSummary && typeof selectedProjectSummary === "object" && !Array.isArray(selectedProjectSummary)
              ? selectedProjectSummary
              : {};
            const activeUsers = Math.max(0, Number(summary.activeUsers || summary.activeUsersCount || summary.usersCount || summary.dau || 0));
            const totalUsers = Math.max(activeUsers, Number(summary.totalUsers || summary.totalUsersCount || summary.usersCount || 0));
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Users", UsersRound),
              React.createElement("div", { className: "playground-project-overview-widget-metric" },
                React.createElement("div", { className: "playground-project-overview-widget-metric-value" }, formatProjectOverviewInteger(activeUsers)),
                React.createElement("div", { className: "playground-project-overview-widget-metric-label" }, "Daily active users"),
                totalUsers > 0
                  ? React.createElement("div", { className: "playground-project-overview-widget-metric-meta" }, formatProjectOverviewInteger(totalUsers) + " total users")
                  : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No user activity yet.")
              )
            );
          }
`;
