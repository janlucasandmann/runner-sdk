export const CONFIGURE_HOME_NOTIFICATION_ACTIONS_SCRIPT = `        function handleMarkAllNotificationsRead() {
          const productIds = notificationItems
            .filter((item) => item.kind === "product" && item.id)
            .map((item) => item.id);
	          const permissionIds = notificationItems
	            .filter((item) => item.kind === "permission" && item.id)
	            .flatMap((item) => getPermissionNotificationReadIds(item));
	          const humanTaskIds = notificationItems
	            .filter((item) => item.kind === "human_task" && item.id)
	            .map((item) => item.id);
	          const teamInvitationIds = notificationItems
	            .filter((item) => item.kind === "team_invitation" && item.id)
	            .map((item) => item.id);
	          const organizationInvitationIds = notificationItems
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

	          setEmailVerificationNotificationDismissed(true);
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
              if (response.status === 402 || data?.requiredPlan === "team") {
                setNotificationsOpen(false);
                openSettingsModal("costs-plan-options");
                return;
              }
              throw new Error(data?.message || data?.error || "Failed to update team invitation.");
            }
            setTeamInvitationNotifications((current) => current.filter((invitation) => invitation.id !== invitationId));
            setReadTeamInvitationNotificationIds((current) => Array.from(new Set([...current, invitationId])));
            setNotificationsOpen(false);
            if (normalizedAction === "accept") {
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
