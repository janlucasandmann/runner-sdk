export const CONFIGURE_HOME_NOTIFICATION_RECORDS_SCRIPT = `      function normalizeInAppNotificationRecord(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return null;
        }
        const id = typeof value.id === "string" ? value.id.trim() : "";
        const html = typeof value.html === "string" ? value.html.trim() : "";
        if (!id || !html) {
          return null;
        }
        return {
          id,
          html,
          createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
          expiresAt: typeof value.expiresAt === "string" ? value.expiresAt : "",
          metadata: value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata)
            ? value.metadata
            : {},
        };
      }

      function normalizeTeamInvitationNotificationRecord(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return null;
        }
        const id = String(value.id || value.invitationId || "").trim();
        if (!id) {
          return null;
        }
        const teamName = String(value.teamName || value.team_name || "Team").trim() || "Team";
        return {
          id,
          organizationId: String(value.organizationId || value.organization_id || "").trim(),
          teamId: String(value.teamId || value.team_id || "").trim(),
          teamName,
          role: String(value.role || "create").trim() || "create",
          invitedByName: String(value.invitedByName || value.invited_by_name || "").trim(),
          invitedByEmail: String(value.invitedByEmail || value.invited_by_email || "").trim(),
          createdAt: value.createdAt || value.created_at || "",
          expiresAt: value.expiresAt || value.expires_at || "",
        };
      }

      function normalizeTaskActivityNotificationRecord(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return null;
        }
        const id = String(value.id || "").trim();
        const taskId = String(value.taskId || value.task_id || "").trim();
        if (!id || !taskId) {
          return null;
        }
        const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata)
          ? value.metadata
          : {};
        return {
          id,
          taskId,
          projectId: String(value.projectId || value.project_id || "").trim(),
          organizationId: String(value.organizationId || value.organization_id || "").trim(),
          activityEventId: String(value.activityEventId || value.activity_event_id || "").trim(),
          eventType: String(value.eventType || value.event_type || "").trim(),
          title: String(value.title || metadata.taskTitle || "Ticket updated").trim() || "Ticket updated",
          text: String(value.text || value.body || value.message || "").trim(),
          actorName: String(value.actorName || value.actor_name || "").trim(),
          ticketNumber: String(metadata.ticketNumber || "").trim(),
          taskTitle: String(metadata.taskTitle || value.title || "").trim(),
          createdAt: value.createdAt || value.created_at || "",
          metadata,
        };
      }
`;
