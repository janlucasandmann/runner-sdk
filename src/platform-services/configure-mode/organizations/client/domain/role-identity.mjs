export const ORGANIZATIONS_ROLE_IDENTITY_SCRIPT = `      function normalizePlaygroundOrganizationRoleId(value, fallback = "member") {
        const normalized = String(value || "").trim().toLowerCase();
        return PLAYGROUND_ORGANIZATION_ROLE_IDS.includes(normalized) ? normalized : fallback;
      }

      function getPlaygroundOrganizationRoleDefinition(roleId) {
        const normalizedRoleId = normalizePlaygroundOrganizationRoleId(roleId, "member");
        return PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.find((role) => role.id === normalizedRoleId)
          || PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.find((role) => role.id === "member");
      }
`;
