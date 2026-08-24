export const CONFIGURE_HOME_NOTIFICATION_ACTIONS_SCRIPT = `        function markNotificationItemsRead(items, options = {}) {
          const sourceItems = Array.isArray(items) ? items.filter(Boolean) : [];
          const inboxIds = sourceItems
            .filter((item) => item.kind === "inbox" && item.id)
            .map((item) => item.id);
          const productIds = sourceItems
            .filter((item) => item.kind === "product" && item.id)
            .map((item) => item.id);
	          const permissionIds = sourceItems
	            .filter((item) => item.kind === "permission" && item.id)
	            .flatMap((item) => getPermissionNotificationReadIds(item));
	          const humanTaskIds = sourceItems
	            .filter((item) => item.kind === "human_task" && item.id)
	            .map((item) => item.id);
	          const taskActivityIds = sourceItems
	            .filter((item) => item.kind === "task_activity" && item.id)
	            .map((item) => item.id);
	          const teamInvitationIds = sourceItems
	            .filter((item) => item.kind === "team_invitation" && item.id)
	            .map((item) => item.id);
	          const organizationInvitationIds = sourceItems
	            .filter((item) => item.kind === "organization_invitation" && item.id)
	            .map((item) => item.id);

          if (productIds.length > 0) {
            setReadProductNotificationIds((current) => {
              const next = Array.from(new Set([...current, ...productIds]));
              writeStoredNotificationIds(notificationReadStorageKey, next);
              return next;
            });
          }

	          if (permissionIds.length > 0) {
	            setReadPermissionNotificationIds((current) => {
              const next = Array.from(new Set([...current, ...permissionIds]));
              writeStoredNotificationIds(PLAYGROUND_PERMISSION_NOTIFICATION_READ_STORAGE_KEY, next, "session");
              return next;
	            });
	          }

	          if (humanTaskIds.length > 0) {
	            setReadHumanTaskNotificationIds((current) => {
              const next = Array.from(new Set([...current, ...humanTaskIds]));
              writeStoredNotificationIds(PLAYGROUND_HUMAN_TASK_NOTIFICATION_READ_STORAGE_KEY, next);
              return next;
	            });
	          }

	          if (taskActivityIds.length > 0) {
	            setReadTaskActivityNotificationIds((current) => {
              const next = Array.from(new Set([...current, ...taskActivityIds]));
              writeStoredNotificationIds(PLAYGROUND_TASK_ACTIVITY_NOTIFICATION_READ_STORAGE_KEY, next);
              return next;
	            });
	          }

	          if (teamInvitationIds.length > 0) {
	            setReadTeamInvitationNotificationIds((current) => (
              Array.from(new Set([...current, ...teamInvitationIds]))
	            ));
	          }

	          if (organizationInvitationIds.length > 0) {
	            setReadOrganizationInvitationNotificationIds((current) => (
              Array.from(new Set([...current, ...organizationInvitationIds]))
	            ));
	          }

          if (sourceItems.some((item) => item.kind === "email_verification")) {
	          setEmailVerificationNotificationDismissed(true);
          }
          if (inboxIds.length > 0) {
            const readAt = new Date().toISOString();
            setInboxNotifications((current) => current.map((notification) => (
              inboxIds.includes(notification.id)
                ? { ...notification, seenAt: notification.seenAt || readAt, readAt, updatedAt: readAt }
                : notification
            )));
            if (hasRealAccess) {
              if (options.markAllInbox) {
                void fetchJsonWithTimeout(proxyBackendBase + "/notifications/read-all", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: "{}",
                }, PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS).catch(() => {});
              } else {
                inboxIds.forEach((notificationId) => {
                  void fetchJsonWithTimeout(
                    proxyBackendBase + "/notifications/" + encodeURIComponent(notificationId),
                    {
                      method: "PATCH",
                      credentials: "include",
                      cache: "no-store",
                      headers: {
                        ...requestHeaders,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ seen: true, read: true }),
                    },
                    PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS
                  ).catch(() => {});
                });
              }
            }
          }
	      }

        function handleMarkAllNotificationsRead() {
          markNotificationItemsRead(notificationItems, { markAllInbox: true });
        }

        function handleMarkConfigureHomeNotificationsRead(items) {
          markNotificationItemsRead(items);
        }

        function markInboxNotificationRead(item, acted) {
          const notificationId = String(item?.id || "").trim();
          if (!notificationId) return;
          const readAt = new Date().toISOString();
          setInboxNotifications((current) => current.map((notification) => (
            notification.id === notificationId
              ? {
                ...notification,
                seenAt: notification.seenAt || readAt,
                readAt,
                actedAt: acted ? readAt : notification.actedAt,
                updatedAt: readAt,
              }
              : notification
          )));
          if (!hasRealAccess) return;
          void fetchJsonWithTimeout(
            proxyBackendBase + "/notifications/" + encodeURIComponent(notificationId),
            {
              method: "PATCH",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ seen: true, read: true, acted: Boolean(acted) }),
            },
            PLAYGROUND_NOTIFICATION_REQUEST_TIMEOUT_MS
          ).catch(() => {});
        }

        function handleOpenInboxNotification(item) {
          markInboxNotificationRead(item, true);
          setNotificationsOpen(false);
          const resourceType = String(item?.resourceType || "").trim().toLowerCase();
          const resourceId = String(item?.resourceId || "").trim();
          if ((resourceType === "thread" || resourceType === "agent_run") && resourceId) {
            handleThreadSelect(resourceId);
            return;
          }
          if ((resourceType === "task" || resourceType === "ticket") && resourceId) {
            handleOpenTaskActivityNotification({
              ...item,
              taskId: resourceId,
              projectId: String(item?.metadata?.projectId || "").trim(),
              taskTitle: item.title,
            });
            return;
          }
          if (resourceType === "project" && resourceId) {
            setLatestInteractedProjectId(resourceId);
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: resourceId,
              view: "overview",
              sectionId: "general",
              taskId: "",
              taskDetailMode: "default",
              missionControlAction: "",
              projectComposerAction: "",
            });
            setSidebarWorkspaceMode("work");
            setActivePage("tasks");
            return;
          }
          if (resourceType === "metronome_run" && resourceId) {
            openMetronomePage({
              workflowId: String(item?.metadata?.metronomeId || "").trim(),
              runId: resourceId,
              mode: "run-detail",
            });
            return;
          }
          if (resourceType === "evaluation_run" && resourceId) {
            openEvaluationsPage({
              evaluationId: String(item?.metadata?.evaluationId || "").trim(),
              evaluationRunId: resourceId,
              mode: "run",
            });
            return;
          }
          const actionUrl = String(item?.actionUrl || "").trim();
          if (actionUrl.startsWith("/") && !actionUrl.startsWith("//")) {
            window.location.assign(actionUrl);
          }
        }

        function handleOpenEmailVerificationSettings() {
          setNotificationsOpen(false);
          openSettingsModal("profile");
        }

	        function handleOpenPermissionNotification(threadId) {
	          setNotificationsOpen(false);
	          handleThreadSelect(threadId);
	        }

	        function handleOpenHumanTaskNotification(item) {
	          const taskRecord = item?.task || (Array.isArray(welcomeWidgetsState.tasks)
	            ? welcomeWidgetsState.tasks.find((task) => task?.id === item?.taskId)
	            : null);
	          if (!taskRecord) {
	            setNotificationsOpen(false);
	            return;
	          }
	          setNotificationsOpen(false);
	          handleOpenWelcomeWidgetTaskDetail(taskRecord);
	        }

	        function handleOpenTaskActivityNotification(item) {
	          const notificationId = String(item?.id || "").trim();
	          const taskId = String(item?.taskId || "").trim();
	          const projectId = String(item?.projectId || "").trim();
	          if (notificationId) {
	            setReadTaskActivityNotificationIds((current) => {
              const next = Array.from(new Set([...current, notificationId]));
              writeStoredNotificationIds(PLAYGROUND_TASK_ACTIVITY_NOTIFICATION_READ_STORAGE_KEY, next);
              return next;
	            });
	          }
	          setNotificationsOpen(false);
	          if (!taskId || !projectId) {
	            return;
	          }
	          const existingTask = Array.isArray(welcomeWidgetsState.tasks)
	            ? welcomeWidgetsState.tasks.find((task) => String(task?.id || "").trim() === taskId)
	            : null;
	          handleOpenWelcomeWidgetTaskDetail(existingTask || {
	            id: taskId,
	            projectId,
	            title: item?.taskTitle || item?.title || "Ticket",
	          });
	        }

        async function handleTeamInvitationDecision(item, action) {
          const invitationId = String(item?.id || "").trim();
          const normalizedAction = action === "accept" ? "accept" : "decline";
          if (!invitationId) {
            return;
          }
          if (normalizedAction === "accept") {
            const confirmed = window.confirm("Join " + (item.teamName || "this team") + "?");
            if (!confirmed) {
              return;
            }
          }
          setTeamPageActionId(invitationId + ":" + normalizedAction);
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/teams/invitations/" + encodeURIComponent(invitationId) + "/" + normalizedAction,
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: "{}",
              },
              8000
            );
            if (!response.ok) {
              if (response.status === 402) {
                setNotificationsOpen(false);
                return;
              }
              if (data?.requiredPlan === "team") {
                setNotificationsOpen(false);
                requestPlatformPlanGate({
                  entitlement: "squads.use",
                  requiredPlan: "team",
                  featureName: "team collaboration",
                  source: "team-invitation",
                });
                return;
              }
              throw new Error(data?.message || data?.error || "Failed to update team invitation.");
            }
            setTeamInvitationNotifications((current) => current.filter((invitation) => invitation.id !== invitationId));
            setReadTeamInvitationNotificationIds((current) => Array.from(new Set([...current, invitationId])));
            setNotificationsOpen(false);
            if (normalizedAction === "accept") {
              const organizationId = String(data?.organizationId || data?.data?.organizationId || item.organizationId || "").trim();
              if (organizationId) {
                setTeamPageOrganizationId(organizationId);
              }
              const teamId = String(data?.teamId || data?.data?.teamId || item.teamId || "").trim();
              if (teamId) {
                setTeamPageSelectedTeamId(teamId);
              }
              openTeamPage();
            }
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Failed to update team invitation.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleOrganizationInvitationDecision(item, action) {
          const invitationId = String(item?.id || "").trim();
          const normalizedAction = action === "accept" ? "accept" : "decline";
          if (!invitationId) {
            return;
          }
          if (normalizedAction === "accept") {
            const confirmed = window.confirm("Join " + (item.organizationName || "this organization") + "?");
            if (!confirmed) {
              return;
            }
          }
          setOrganizationPageActionId(invitationId + ":" + normalizedAction);
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/organizations/invitations/" + encodeURIComponent(invitationId) + "/" + normalizedAction,
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...baseAuthRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: "{}",
              },
              8000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update organization invitation.");
            }
            setOrganizationInvitationNotifications((current) => current.filter((invitation) => invitation.id !== invitationId));
            setReadOrganizationInvitationNotificationIds((current) => Array.from(new Set([...current, invitationId])));
            setNotificationsOpen(false);
            if (normalizedAction === "accept") {
              const organizationId = String(data?.organizationId || data?.data?.organizationId || item.organizationId || "").trim();
              openOrganizationPage();
              if (organizationId) {
                setActiveOrganizationId(organizationId);
                setOrganizationPageSelectedOrganizationId(organizationId);
                void loadOrganizationPageData({ selectedOrganizationId: organizationId });
              }
            }
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Failed to update organization invitation.");
          } finally {
            setOrganizationPageActionId("");
          }
        }
`;
