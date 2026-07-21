export const ORGANIZATIONS_ROLE_PERMISSIONS_SCRIPT = `      function createPlaygroundOrganizationRolePermissionSet(roleId) {
        const normalizedRoleId = normalizePlaygroundOrganizationRoleId(roleId, "member");
        return createPlaygroundRolePermissionSet("organization_role", normalizedRoleId);
      }

      function normalizePlaygroundOrganizationRolePermissionSets(value) {
        const inputSets = isPlaygroundPermissionRecord(value) ? value : {};
        return PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.reduce((rolePermissionSets, role) => {
          rolePermissionSets[role.id] = role.id === "owner"
            ? createPlaygroundOrganizationRolePermissionSet(role.id)
            : normalizePlaygroundRolePermissionSet(
                inputSets[role.id],
                "organization_role",
                role.id
              );
          return rolePermissionSets;
        }, {});
      }
`;
