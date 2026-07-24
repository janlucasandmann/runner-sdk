export const CONFIGURE_HOME_NOTIFICATION_PROJECTION_SCRIPT = `        const canFetchNotificationCenter =
          hasRealAccess
          && Boolean(effectiveApiKey);
        function buildPermissionNotificationStatusReadId(thread) {
          const safeThread = normalizeThreadItem(thread);
          const threadId = typeof safeThread?.id === "string" ? safeThread.id.trim() : "";
          if (!threadId) {
            return "";
          }
          const timestamp = resolveThreadSortTimestamp(safeThread) || safeThread.startedAt || safeThread.createdAt || "";
          const timestampMs = Date.parse(timestamp || "");
          return "permission:" + threadId + ":status:" + (Number.isFinite(timestampMs) ? String(timestampMs) : "pending");
        }

        function getPermissionNotificationReadIds(notification) {
          const readIds = Array.isArray(notification?.readIds)
            ? notification.readIds
            : [notification?.id];
          return readIds
            .map((id) => String(id || "").trim())
            .filter(Boolean);
        }

        function buildPendingPermissionNotificationFallback(thread) {
          const safeThread = normalizeThreadItem(thread);
          const threadId = typeof safeThread?.id === "string" ? safeThread.id.trim() : "";
          if (!threadId) {
            return null;
          }
          const readId = buildPermissionNotificationStatusReadId(safeThread);
          return {
            id: readId || "permission:" + threadId + ":status:pending",
            readIds: readId ? [readId] : [],
            requestId: "",
            requestIds: [],
            requestCount: 0,
            threadId,
            threadTitle: safeThread.title || "Untitled thread",
            toolName: "Permission pending",
            reason: "",
            createdAt: resolveThreadSortTimestamp(safeThread) || safeThread.startedAt || safeThread.createdAt || "",
            isStatusFallback: true,
          };
        }

        const pendingPermissionDecisionThreads = useMemo(() => (
          realThreads
            .map(normalizeThreadItem)
            .filter((thread) => isPendingPermissionThreadDisplayStatus(thread.status))
        ), [realThreads]);
        const pendingPermissionNotificationThreads = useMemo(() => (
          pendingPermissionDecisionThreads
            .slice(0, 20)
            .map((thread) => ({
              id: thread.id,
              title: thread.title || "Untitled thread",
              status: thread.status,
              createdAt: thread.createdAt,
              updatedAt: thread.updatedAt,
              startedAt: thread.startedAt,
              nextRunAt: thread.nextRunAt,
            }))
        ), [pendingPermissionDecisionThreads]);
        const pendingPermissionNotificationThreadKey = useMemo(() => (
          pendingPermissionNotificationThreads
            .map((thread) => [
              thread.id,
              thread.updatedAt || "",
              thread.startedAt || "",
              thread.createdAt || "",
            ].join(":"))
            .sort()
            .join("|")
        ), [pendingPermissionNotificationThreads]);
	        const permissionNotificationItems = useMemo(() => {
	          const byThreadId = new Map();
          const pendingThreadIds = new Set();

          pendingPermissionNotificationThreads.forEach((thread) => {
            const threadId = typeof thread?.id === "string" ? thread.id.trim() : "";
            if (!threadId) {
              return;
            }
            pendingThreadIds.add(threadId);
            const fallbackNotification = buildPendingPermissionNotificationFallback(thread);
            if (fallbackNotification) {
              byThreadId.set(threadId, fallbackNotification);
            }
          });

          permissionNotifications.forEach((notification) => {
            const threadId = typeof notification?.threadId === "string" ? notification.threadId.trim() : "";
            if (!threadId || !pendingThreadIds.has(threadId)) {
              return;
            }
            byThreadId.set(threadId, notification);
          });

          return Array.from(byThreadId.values()).sort((left, right) => {
            const leftMs = Date.parse(left.createdAt || "");
            const rightMs = Date.parse(right.createdAt || "");
            return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
	          });
	        }, [pendingPermissionNotificationThreads, permissionNotifications]);
	        const humanTaskNotificationItems = useMemo(() => {
	          const ticketNumbersById = buildPlaygroundTaskTicketNumberMap(welcomeWidgetsState.tasks);
	          return (Array.isArray(welcomeWidgetsState.tasks) ? welcomeWidgetsState.tasks : [])
	            .map((task) => normalizePlaygroundTaskRecord(task))
	            .filter((task) => task?.id && isPlaygroundHumanAttentionTask(task))
	            .sort((left, right) => {
              const leftNeedsReview = left.reviewRequired && isPlaygroundHumanAssigneeId(left.reviewerAgentId) ? 1 : 0;
              const rightNeedsReview = right.reviewRequired && isPlaygroundHumanAssigneeId(right.reviewerAgentId) ? 1 : 0;
              if (leftNeedsReview !== rightNeedsReview) {
                return rightNeedsReview - leftNeedsReview;
              }
              const leftUpdatedAt = Date.parse(left.updatedAt || left.createdAt || "") || 0;
              const rightUpdatedAt = Date.parse(right.updatedAt || right.createdAt || "") || 0;
              return rightUpdatedAt - leftUpdatedAt;
	            })
	            .map((task) => {
              const timestamp = Date.parse(task.updatedAt || task.createdAt || "") || 0;
              const ticketNumber = ticketNumbersById[task.id] || task.ticketNumber || "000";
              const isReviewRequest = task.reviewRequired && isPlaygroundHumanAssigneeId(task.reviewerAgentId);
              return {
                id: "human-task:" + task.id + ":" + String(timestamp || "current"),
                kind: "human_task",
                taskId: task.id,
                task,
                ticketNumber,
                label: isReviewRequest ? "Review requested" : "Assigned to you",
                text: ticketNumber + " " + (task.title || "Untitled Task"),
                createdAt: task.updatedAt || task.createdAt || "",
              };
	            });
	        }, [welcomeWidgetsState.tasks]);
	        const notificationItems = useMemo(() => {
	          const readProducts = new Set(readProductNotificationIds);
	          const readPermissions = new Set(readPermissionNotificationIds);
	          const readHumanTasks = new Set(readHumanTaskNotificationIds);
	          const readTaskActivities = new Set(readTaskActivityNotificationIds);
	          const readTeamInvitations = new Set(readTeamInvitationNotificationIds);
	          const readOrganizationInvitations = new Set(readOrganizationInvitationNotificationIds);
	          const items = [];

          permissionNotificationItems.forEach((notification) => {
            const readIds = getPermissionNotificationReadIds(notification);
            if (!notification?.id || readIds.some((id) => readPermissions.has(id))) {
              return;
            }
            items.push({
              ...notification,
              kind: "permission",
            });
          });

	          if (hasSessionAuth && accountEmail && !sessionState.emailVerified && !emailVerificationNotificationDismissed) {
	            items.push({
              id: "email-verification:" + accountEmail,
              kind: "email_verification",
              label: "Verify your email address",
              text: "Your account email is not verified yet.",
              createdAt: "",
	            });
	          }

	          humanTaskNotificationItems.forEach((notification) => {
	            if (!notification?.id || readHumanTasks.has(notification.id)) {
              return;
	            }
	            items.push(notification);
	          });

	          taskActivityNotifications.forEach((notification) => {
	            if (!notification?.id || readTaskActivities.has(notification.id)) {
              return;
	            }
	            items.push({
	              ...notification,
	              kind: "task_activity",
	            });
	          });

	          teamInvitationNotifications.forEach((invitation) => {
            const id = String(invitation?.id || "").trim();
            if (!id || readTeamInvitations.has(id)) {
              return;
            }
            items.push({
              ...invitation,
              id,
              kind: "team_invitation",
            });
          });

	          organizationInvitationNotifications.forEach((invitation) => {
            const id = String(invitation?.id || "").trim();
            if (!id || readOrganizationInvitations.has(id)) {
              return;
            }
            items.push({
              ...invitation,
              id,
              kind: "organization_invitation",
            });
          });

	          productNotifications.forEach((notification) => {
            const id = typeof notification?.id === "string" ? notification.id.trim() : "";
            if (!id || readProducts.has(id)) {
              return;
            }
            items.push({
              ...notification,
              id,
              kind: "product",
            });
          });

          return items;
        }, [
          accountEmail,
          emailVerificationNotificationDismissed,
	          hasSessionAuth,
	          humanTaskNotificationItems,
	          permissionNotificationItems,
	          organizationInvitationNotifications,
	          productNotifications,
	          readHumanTaskNotificationIds,
	          readTaskActivityNotificationIds,
	          readOrganizationInvitationNotificationIds,
	          readPermissionNotificationIds,
          readProductNotificationIds,
          readTeamInvitationNotificationIds,
          sessionState.emailVerified,
          taskActivityNotifications,
          teamInvitationNotifications,
        ]);
        const hasVisibleNotifications = notificationItems.length > 0;
        function getNotificationPlainText(notification) {
          const source = notification && typeof notification === "object" && !Array.isArray(notification) ? notification : {};
          const directText = String(
            source.title
            || source.label
            || source.text
            || source.message
            || source.body
            || source.summary
            || ""
          ).trim();
          if (directText) {
            return directText;
          }
          const html = String(source.html || source.content || "").trim();
          if (!html) {
            return "";
          }
          try {
            if (typeof document !== "undefined" && document.createElement) {
              const element = document.createElement("div");
              element.innerHTML = DOMPurify.sanitize(html, {
                USE_PROFILES: { html: true },
                FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
              });
              return String(element.textContent || element.innerText || "").trim();
            }
          } catch {}
          return html.split("<").join(" ").split(">").join(" ").trim();
        }

        function buildNotificationSearchText(item) {
          return [
            item?.kindLabel,
            item?.label,
            item?.text,
            item?.meta,
            item?.statusLabel,
            item?.threadTitle,
            item?.toolName,
            item?.reason,
            item?.teamName,
            item?.organizationName,
            item?.taskTitle,
            item?.ticketNumber,
            item?.actorName,
          ].map((value) => String(value || "").toLowerCase()).join(" ");
        }

        const allNotificationPageItems = useMemo(() => {
          const readProducts = new Set(readProductNotificationIds);
          const readPermissions = new Set(readPermissionNotificationIds);
          const readHumanTasks = new Set(readHumanTaskNotificationIds);
          const readTaskActivities = new Set(readTaskActivityNotificationIds);
          const readTeamInvitations = new Set(readTeamInvitationNotificationIds);
          const readOrganizationInvitations = new Set(readOrganizationInvitationNotificationIds);
          const items = [];

          permissionNotificationItems.forEach((notification) => {
            const readIds = getPermissionNotificationReadIds(notification);
            const isRead = Boolean(readIds.length > 0 && readIds.every((id) => readPermissions.has(id)));
            const metaText = [
              notification.toolName || "Tool access",
              notification.createdAt ? formatThreadSearchTimestamp(notification.createdAt) : "",
            ].filter(Boolean).join(" · ");
            items.push({
              ...notification,
              id: notification.id || ("permission:" + String(notification.threadId || "")),
              kind: "permission",
              kindLabel: "Permission request",
              label: isRead ? "Permission request seen" : "Permission needed",
              text: notification.threadTitle || "Untitled thread",
              meta: metaText,
              statusLabel: isRead ? "Seen" : "Needs decision",
              unread: !isRead,
              createdAt: notification.createdAt || "",
            });
          });

          if (hasSessionAuth && accountEmail && !sessionState.emailVerified && !emailVerificationNotificationDismissed) {
            items.push({
              id: "email-verification:" + accountEmail,
              kind: "email_verification",
              kindLabel: "Account",
              label: "Verify your email address",
              text: "Your account email is not verified yet.",
              meta: "Profile settings",
              statusLabel: "Needs action",
              unread: true,
              createdAt: "",
            });
          }

          humanTaskNotificationItems.forEach((notification) => {
            items.push({
              ...notification,
              kindLabel: "Task",
              statusLabel: readHumanTasks.has(notification.id) ? "Seen" : "Needs action",
              unread: !readHumanTasks.has(notification.id),
              meta: [
                notification.ticketNumber ? ("Ticket " + notification.ticketNumber) : "",
                notification.createdAt ? formatThreadSearchTimestamp(notification.createdAt) : "",
              ].filter(Boolean).join(" · "),
            });
          });

          taskActivityNotifications.forEach((notification) => {
            const id = String(notification?.id || "").trim();
            if (!id) {
              return;
            }
            const isRead = readTaskActivities.has(id);
            items.push({
              ...notification,
              id,
              kind: "task_activity",
              kindLabel: "Ticket activity",
              label: notification.text || "Ticket updated",
              text: notification.title || notification.taskTitle || "Ticket updated",
              meta: [
                notification.actorName ? ("By " + notification.actorName) : "",
                notification.createdAt ? formatThreadSearchTimestamp(notification.createdAt) : "",
              ].filter(Boolean).join(" · "),
              statusLabel: isRead ? "Read" : "Unread",
              unread: !isRead,
              createdAt: notification.createdAt || "",
            });
          });

          teamInvitationNotifications.forEach((invitation) => {
            const id = String(invitation?.id || "").trim();
            if (!id) {
              return;
            }
            items.push({
              ...invitation,
              id,
              kind: "team_invitation",
              kindLabel: "Team",
              label: "Team invitation",
              text: invitation.teamName || "Team",
              meta: [
                invitation.role ? ("Role: " + invitation.role) : "",
                invitation.invitedByEmail ? ("From " + invitation.invitedByEmail) : "",
                invitation.createdAt ? formatThreadSearchTimestamp(invitation.createdAt) : "",
              ].filter(Boolean).join(" · "),
              statusLabel: readTeamInvitations.has(id) ? "Seen" : "Needs decision",
              unread: !readTeamInvitations.has(id),
              createdAt: invitation.createdAt || "",
            });
          });

          organizationInvitationNotifications.forEach((invitation) => {
            const id = String(invitation?.id || "").trim();
            if (!id) {
              return;
            }
            items.push({
              ...invitation,
              id,
              kind: "organization_invitation",
              kindLabel: "Organization",
              label: "Organization invitation",
              text: invitation.organizationName || "Organization",
              meta: [
                invitation.role ? ("Role: " + invitation.role) : "",
                invitation.invitedByEmail ? ("From " + invitation.invitedByEmail) : "",
                invitation.createdAt ? formatThreadSearchTimestamp(invitation.createdAt) : "",
              ].filter(Boolean).join(" · "),
              statusLabel: readOrganizationInvitations.has(id) ? "Seen" : "Needs decision",
              unread: !readOrganizationInvitations.has(id),
              createdAt: invitation.createdAt || "",
            });
          });

          productNotifications.forEach((notification) => {
            const id = typeof notification?.id === "string" ? notification.id.trim() : "";
            if (!id) {
              return;
            }
            const text = getNotificationPlainText(notification) || "Product update";
            items.push({
              ...notification,
              id,
              kind: "product",
              kindLabel: "Product",
              label: "Product update",
              text,
              meta: notification.createdAt ? formatThreadSearchTimestamp(notification.createdAt) : "",
              statusLabel: readProducts.has(id) ? "Read" : "Unread",
              unread: !readProducts.has(id),
              createdAt: notification.createdAt || "",
            });
          });

          return items.sort((left, right) => {
            const leftMs = Date.parse(left.createdAt || "");
            const rightMs = Date.parse(right.createdAt || "");
            return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
          });
        }, [
          accountEmail,
          emailVerificationNotificationDismissed,
          hasSessionAuth,
          humanTaskNotificationItems,
          organizationInvitationNotifications,
          permissionNotificationItems,
          productNotifications,
          readHumanTaskNotificationIds,
          readTaskActivityNotificationIds,
          readOrganizationInvitationNotificationIds,
          readPermissionNotificationIds,
          readProductNotificationIds,
          readTeamInvitationNotificationIds,
          sessionState.emailVerified,
          taskActivityNotifications,
          teamInvitationNotifications,
        ]);

        const visibleNotificationPageItems = useMemo(() => {
          const query = String(notificationsPageSearchQuery || "").trim().toLowerCase();
          const filteredItems = allNotificationPageItems.filter((item) => {
            if (notificationsPageFilter === "unread" && !item.unread) {
              return false;
            }
            if (notificationsPageFilter === "read" && item.unread) {
              return false;
            }
            if (notificationsPageFilter === "permission" && item.kind !== "permission") {
              return false;
            }
            if (notificationsPageFilter === "tasks" && item.kind !== "human_task" && item.kind !== "task_activity") {
              return false;
            }
            if (notificationsPageFilter === "team" && item.kind !== "team_invitation") {
              return false;
            }
            if (notificationsPageFilter === "organization" && item.kind !== "organization_invitation") {
              return false;
            }
            if (notificationsPageFilter === "product" && item.kind !== "product" && item.kind !== "email_verification") {
              return false;
            }
            if (query && !buildNotificationSearchText(item).includes(query)) {
              return false;
            }
            return true;
          });
          return filteredItems.slice().sort((left, right) => {
            if (notificationsPageSort === "oldest") {
              const leftMs = Date.parse(left.createdAt || "");
              const rightMs = Date.parse(right.createdAt || "");
              return (Number.isFinite(leftMs) ? leftMs : 0) - (Number.isFinite(rightMs) ? rightMs : 0);
            }
            if (notificationsPageSort === "type") {
              return String(left.kindLabel || left.kind || "").localeCompare(String(right.kindLabel || right.kind || ""));
            }
            const leftMs = Date.parse(left.createdAt || "");
            const rightMs = Date.parse(right.createdAt || "");
            return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
          });
        }, [allNotificationPageItems, notificationsPageFilter, notificationsPageSearchQuery, notificationsPageSort]);
`;
