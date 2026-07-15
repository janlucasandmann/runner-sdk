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
          teamId: String(value.teamId || value.team_id || "").trim(),
          teamName,
          role: String(value.role || "create").trim() || "create",
          invitedByName: String(value.invitedByName || value.invited_by_name || "").trim(),
          invitedByEmail: String(value.invitedByEmail || value.invited_by_email || "").trim(),
          createdAt: value.createdAt || value.created_at || "",
          expiresAt: value.expiresAt || value.expires_at || "",
        };
      }
`;
