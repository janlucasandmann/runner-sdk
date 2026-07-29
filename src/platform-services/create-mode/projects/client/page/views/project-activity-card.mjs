export const PROJECT_ACTIVITY_CARD_SCRIPT = `        function parseProjectWorkActivityTimestamp(...values) {
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

        function getProjectWorkActivityStatus(value) {
          const normalizedStatus = String(value || "").trim().toLowerCase();
          if (["done", "completed", "complete", "success", "succeeded"].includes(normalizedStatus)) {
            return "success";
          }
          if (["failed", "error", "stale"].includes(normalizedStatus)) {
            return "error";
          }
          if (["in_progress", "in_review", "running", "starting", "awaiting_input", "waiting_permission"].includes(normalizedStatus)) {
            return "running";
          }
          return "default";
        }

        function getProjectWorkActivityColor(value) {
          const status = getProjectWorkActivityStatus(value);
          if (status === "success") return "#85df7b";
          if (status === "error") return "#ff5757";
          if (status === "running") return "#4da3ff";
          return "#c980ff";
        }

        function getProjectWorkActivityPermissionRingId(permissionActionId) {
          const actionDefinition = typeof getPlaygroundPermissionActionDefinition === "function"
            ? getPlaygroundPermissionActionDefinition(permissionActionId)
            : null;
          const activityProjectDraft = typeof projectOverviewDraft !== "undefined"
            ? projectOverviewDraft
            : null;
          const permissionSet = typeof normalizePlaygroundPermissionSet === "function"
            ? normalizePlaygroundPermissionSet(
                activityProjectDraft?.permissionSet
                  || activityProjectDraft?.metadata?.permissionSet
                  || selectedProject?.permissionSet
                  || selectedProject?.metadata?.permissionSet,
                "project"
              )
            : null;
          const actionPolicy = permissionSet?.actions?.[permissionActionId];
          const configuredRingId = actionPolicy
            && typeof actionPolicy === "object"
            && !Array.isArray(actionPolicy)
              ? actionPolicy.ringId
              : "";
          return typeof normalizePlaygroundPermissionRingId === "function"
            ? normalizePlaygroundPermissionRingId(
                configuredRingId || actionDefinition?.ringId,
                actionDefinition?.ringId || "ring_2"
              )
            : String(configuredRingId || actionDefinition?.ringId || "ring_2");
        }

        function getProjectWorkActivityTaskCreatorEvent(task) {
          const existingCreatedEvent = (Array.isArray(task?.activity) ? task.activity : [])
            .find((event) => String(event?.eventType || "").trim().toLowerCase() === "created");
          if (existingCreatedEvent) {
            return existingCreatedEvent;
          }
          const creator = typeof getTaskCreatorIdentity === "function"
            ? getTaskCreatorIdentity(task)
            : {
                type: task?.creator?.agentId ? "agent" : "user",
                name: task?.creator?.name || "User",
                photoUrl: task?.creator?.avatarUrl || "",
              };
          return {
            id: "task-creator:" + String(task?.id || ""),
            actorType: creator.type || "user",
            actorUserId: creator.type === "user"
              ? String(task?.createdByUserId || task?.creator?.userId || "").trim() || undefined
              : undefined,
            actorAgentId: creator.type === "agent"
              ? String(task?.creator?.agentId || task?.creatorAgentId || task?.createdByAgentId || "").trim() || undefined
              : undefined,
            actorName: creator.name,
            actorAvatarUrl: creator.photoUrl,
          };
        }

        function getProjectWorkActivityThreadActor(thread, task) {
          const actorAgentId = String(
            thread?.agentId
              || thread?.agent_id
              || task?.assigneeAgentId
              || ""
          ).trim();
          const actorUserId = String(
            thread?.createdByUserId
              || thread?.created_by_user_id
              || thread?.userId
              || ""
          ).trim();
          return {
            id: "thread-actor:" + String(thread?.id || ""),
            actorType: actorAgentId ? "agent" : "user",
            actorAgentId: actorAgentId || undefined,
            actorUserId: actorUserId || undefined,
            actorName: actorAgentId
              ? getTaskAssigneeName(actorAgentId, "Agent")
              : String(thread?.createdByName || thread?.creatorName || "").trim() || undefined,
            actorAvatarUrl: String(
              thread?.actorAvatarUrl
                || thread?.creatorAvatarUrl
                || thread?.agentAvatarUrl
                || ""
            ).trim() || undefined,
          };
        }

        function getProjectWorkActivitySessionActor(session, task) {
          const actorAgentId = String(
            session?.agentId
              || session?.agent_id
              || session?.assigneeAgentId
              || task?.assigneeAgentId
              || ""
          ).trim();
          return {
            id: "session-actor:" + String(session?.id || ""),
            actorType: actorAgentId ? "agent" : "system",
            actorAgentId: actorAgentId || undefined,
            actorName: actorAgentId
              ? getTaskAssigneeName(actorAgentId, "Agent")
              : "Computer Agents",
            actorAvatarUrl: actorAgentId
              ? undefined
              : COMPUTER_AGENTS_CREATOR_PROFILE_URL,
          };
        }

        function getProjectWorkActivityStatusTitle(ticketNumber, status) {
          const statusTitles = {
            backlog: "Backlogged",
            todo: "Queued",
            in_progress: "Started",
            in_review: "Reviewing",
            blocked: "Blocked",
            done: "Completed",
            canceled: "Canceled",
            cancelled: "Canceled",
          };
          return (statusTitles[String(status || "").trim().toLowerCase()] || "Updated")
            + " "
            + ticketNumber;
        }

        function getProjectWorkActivityEventTitle(event, ticketNumber) {
          const eventType = String(event?.eventType || "").trim().toLowerCase();
          const fieldName = String(event?.fieldName || "").trim().toLowerCase();
          if (eventType === "created") {
            return "Created " + ticketNumber;
          }
          if (eventType === "status_changed") {
            return getProjectWorkActivityStatusTitle(ticketNumber, event?.nextValue);
          }
          if (eventType === "thread_started") {
            return "Started work " + ticketNumber;
          }
          const fieldTitles = {
            assignee_agent_id: "Assigned",
            assigneeagentid: "Assigned",
            dependency_ids: "Changed blockers",
            dependencyids: "Changed blockers",
            due_at: "Scheduled",
            dueat: "Scheduled",
            priority: "Prioritized",
            release_id: "Set milestone",
            releaseid: "Set milestone",
            milestone_id: "Set milestone",
            milestoneid: "Set milestone",
            reviewer_agent_id: "Set reviewer",
            revieweragentid: "Set reviewer",
            status: "Updated",
            task_type: "Retyped",
            tasktype: "Retyped",
            title: "Renamed",
          };
          return (fieldTitles[fieldName] || "Updated") + " " + ticketNumber;
        }

        function getProjectWorkActivityExecutionTitle(ticketNumber, status, noun = "work") {
          const normalizedStatus = String(status || "").trim().toLowerCase();
          const verb = ["failed", "error", "stale"].includes(normalizedStatus)
            ? "Failed"
            : ["done", "completed", "complete", "success", "succeeded"].includes(normalizedStatus)
              ? "Completed"
              : "Started";
          return verb + " " + noun + " " + ticketNumber;
        }

        function resolveProjectWorkActivityTimelineSelectionId(
          events,
          {
            eventId = "",
            eventType = "",
            sourceId = "",
            taskId = "",
            threadId = "",
          } = {}
        ) {
          const normalizedEvents = Array.isArray(events) ? events : [];
          const normalizedEventId = String(eventId || "").trim();
          const normalizedEventType = String(eventType || "").trim().toLowerCase();
          const normalizedSourceId = String(sourceId || "").trim();
          const normalizedTaskId = String(taskId || "").trim();
          const normalizedThreadId = String(threadId || "").trim();
          const exactEvent = normalizedEventId
            ? normalizedEvents.find(
                (event) => String(event?.id || "").trim() === normalizedEventId
              )
            : null;
          if (exactEvent?.id) {
            return String(exactEvent.id);
          }
          const matchingEvent = normalizedEvents.find((event) => {
            const candidateTaskId = String(
              event?.taskId || event?.task?.id || ""
            ).trim();
            const candidateEventType = String(
              event?.eventType || ""
            ).trim().toLowerCase();
            const candidateSourceId = String(
              event?.sourceId || ""
            ).trim();
            const candidateThreadId = String(
              event?.threadId || event?.thread?.id || ""
            ).trim();
            if (normalizedTaskId && candidateTaskId !== normalizedTaskId) {
              return false;
            }
            if (
              normalizedEventType
              && candidateEventType !== normalizedEventType
            ) {
              return false;
            }
            if (
              normalizedThreadId
              && candidateThreadId !== normalizedThreadId
              && candidateSourceId !== normalizedThreadId
            ) {
              return false;
            }
            if (
              normalizedSourceId
              && candidateSourceId !== normalizedSourceId
              && candidateThreadId !== normalizedSourceId
            ) {
              return false;
            }
            return true;
          });
          return String(matchingEvent?.id || "").trim();
        }

        function getProjectWorkActivityTimelineSelection(
          events,
          selectionCriteria,
          selectedTimelineItemId
        ) {
          const selectionId = resolveProjectWorkActivityTimelineSelectionId(
            events,
            selectionCriteria
          );
          return {
            selected: Boolean(
              selectionId
              && selectionId === String(selectedTimelineItemId || "").trim()
            ),
            onSelect: selectionId
              ? () => {
                  setProjectOverviewTaskActivityFilterMode("all");
                  setProjectOverviewTaskActivitySelectedId(selectionId);
                }
              : undefined,
          };
        }

        function renderProjectWorkActivityCard({
          title,
          permissionActionId,
          actor,
          ariaLabel,
          onSelect,
          selected = false,
        }) {
          const permissionRingId = getProjectWorkActivityPermissionRingId(permissionActionId);
          const actorName = getProjectWorkActivityActorName(actor);
          return React.createElement(PlatformActivityOverviewCard, {
            title,
            permissionRingId,
            permissionIcon: React.createElement(PlatformPermissionMiniRingIcon, {
              ringId: permissionRingId,
            }),
            actorAvatar: renderProjectWorkActivityActorAvatar(
              actor,
              "playground-project-activity-overview-card-avatar"
            ),
            actorLabel: actorName,
            "aria-label": (ariaLabel || title) + " by " + actorName,
            onClick: onSelect,
            selected,
          });
        }
`;
