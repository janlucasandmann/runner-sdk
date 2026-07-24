export const CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT = `        function handleOpenNotificationPageItem(item) {
          if (!item) {
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
          return item?.kind === "permission"
            || item?.kind === "human_task"
            || item?.kind === "task_activity"
            || item?.kind === "team_invitation"
            || item?.kind === "organization_invitation"
            || item?.kind === "email_verification";
        }

        function getConfigureHomeNotificationActions(item) {
          if (item.kind === "team_invitation") {
            return [
              { id: "accept", label: "Accept", icon: Check, disabled: Boolean(teamPageActionId), onSelect: () => handleTeamInvitationDecision(item, "accept") },
              { id: "decline", label: "Decline", icon: X, disabled: Boolean(teamPageActionId), onSelect: () => handleTeamInvitationDecision(item, "decline") },
            ];
          }
          if (item.kind === "organization_invitation") {
            return [
              { id: "accept", label: "Accept", icon: Check, disabled: Boolean(organizationPageActionId), onSelect: () => handleOrganizationInvitationDecision(item, "accept") },
              { id: "decline", label: "Decline", icon: X, disabled: Boolean(organizationPageActionId), onSelect: () => handleOrganizationInvitationDecision(item, "decline") },
            ];
          }
          return canOpenConfigureHomeNotification(item)
            ? [{ id: "open", label: "Open", icon: ChevronRight, onSelect: () => handleOpenNotificationPageItem(item) }]
            : [];
        }
`;
