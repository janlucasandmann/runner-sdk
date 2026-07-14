export const ORGANIZATIONS_INVITATION_NOTIFICATIONS_SCRIPT = `      function normalizeOrganizationInvitationNotificationRecord(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return null;
        }
        const id = String(value.id || value.invitationId || "").trim();
        if (!id) {
          return null;
        }
        const organizationName = String(value.organizationName || value.organization_name || "Organization").trim() || "Organization";
        return {
          id,
          organizationId: String(value.organizationId || value.organization_id || "").trim(),
          organizationName,
          role: String(value.role || "member").trim() || "member",
          invitedByName: String(value.invitedByName || value.invited_by_name || "").trim(),
          invitedByEmail: String(value.invitedByEmail || value.invited_by_email || "").trim(),
          createdAt: value.createdAt || value.created_at || "",
          expiresAt: value.expiresAt || value.expires_at || "",
        };
      }
`;
