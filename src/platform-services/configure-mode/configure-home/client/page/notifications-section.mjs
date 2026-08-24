export const CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT = `        function handleOpenNotificationPageItem(item) {
          if (!item) {
            return;
          }
          if (item.kind === "inbox") {
            handleOpenInboxNotification(item);
            return;
          }
          if (item.kind === "permission" && item.threadId) {
            handleOpenPermissionNotification(item.threadId);
            return;
          }
          if (item.kind === "human_task") {
            handleOpenHumanTaskNotification(item);
            return;
          }
          if (item.kind === "task_activity") {
            handleOpenTaskActivityNotification(item);
            return;
          }
          if (item.kind === "team_invitation") {
            openTeamPage();
            return;
          }
          if (item.kind === "organization_invitation") {
            openOrganizationPage();
            if (item.organizationId) {
              setOrganizationPageSelectedOrganizationId(String(item.organizationId || "").trim());
            }
            return;
          }
          if (item.kind === "email_verification") {
            handleOpenEmailVerificationSettings();
          }
        }

        function canOpenConfigureHomeNotification(item) {
          return item?.kind === "inbox"
            || item?.kind === "permission"
            || item?.kind === "human_task"
            || item?.kind === "task_activity"
            || item?.kind === "team_invitation"
            || item?.kind === "organization_invitation"
            || item?.kind === "email_verification";
        }

        function getConfigureHomeNotificationActions(item, state) {
          const targetRows = Array.isArray(state?.targetRows) && state.targetRows.length > 0
            ? state.targetRows
            : [item];
          const unreadTargetRows = targetRows.filter((target) => Boolean(target?.unread));
          const actions = unreadTargetRows.length > 0
            ? [{
                id: "mark-read",
                label: "Mark as read",
                icon: Check,
                onSelect: () => handleMarkConfigureHomeNotificationsRead([item]),
                selectedRows: {
                  label: unreadTargetRows.length === 1
                    ? "Mark as read"
                    : "Mark " + unreadTargetRows.length + " as read",
                  icon: Check,
                  onSelect: () => handleMarkConfigureHomeNotificationsRead(unreadTargetRows),
                },
              }]
            : [];
          if (item.kind === "team_invitation") {
            return [...actions,
              { id: "accept", label: "Accept", icon: Check, disabled: Boolean(teamPageActionId), onSelect: () => handleTeamInvitationDecision(item, "accept") },
              { id: "decline", label: "Decline", icon: X, disabled: Boolean(teamPageActionId), onSelect: () => handleTeamInvitationDecision(item, "decline") },
            ];
          }
          if (item.kind === "organization_invitation") {
            return [...actions,
              { id: "accept", label: "Accept", icon: Check, disabled: Boolean(organizationPageActionId), onSelect: () => handleOrganizationInvitationDecision(item, "accept") },
              { id: "decline", label: "Decline", icon: X, disabled: Boolean(organizationPageActionId), onSelect: () => handleOrganizationInvitationDecision(item, "decline") },
            ];
          }
          return canOpenConfigureHomeNotification(item)
            ? [...actions, { id: "open", label: "Open", icon: ChevronRight, onSelect: () => handleOpenNotificationPageItem(item) }]
            : actions;
        }
`;
