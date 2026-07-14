export const ORGANIZATIONS_ROLE_PERMISSIONS_SCRIPT = `      function createPlaygroundOrganizationRolePermissionSet(roleId) {
        const normalizedRoleId = normalizePlaygroundOrganizationRoleId(roleId, "member");
        if (normalizedRoleId === "owner") {
          return createPlaygroundFullAccessPermissionSet("organization_role");
        }
        const teamRoleId = normalizedRoleId === "admin"
          ? "admin"
          : normalizedRoleId === "developer"
            ? "contributor"
            : "member";
        const permissionSet = normalizePlaygroundPermissionSet(
          createPlaygroundTeamRolePermissionSet(teamRoleId),
          "organization_role"
        );
        const organizationActionIds = [
          "organization_workspace_view",
          "organization_member_invite",
          "organization_member_remove",
          "organization_role_update",
          "organization_resource_manage",
          "organization_billing_manage",
          "organization_settings_update",
        ];
        organizationActionIds.forEach((actionId) => {
          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
          if (!actionDefinition) return;
          let access = "no_access";
          if (normalizedRoleId === "admin") access = "full_access";
          else if (actionId === "organization_workspace_view") access = normalizedRoleId === "viewer" ? "read_only" : "full_access";
          else if (normalizedRoleId === "billing" && actionId === "organization_billing_manage") access = "full_access";
          else if (normalizedRoleId === "developer" && actionId === "organization_resource_manage") access = "full_access";
          else if (normalizedRoleId === "member" && actionId === "organization_resource_manage") access = "ask_for_permission";
          permissionSet.actions[actionId] = {
            ...(permissionSet.actions[actionId] || {}),
            ringId: actionDefinition.ringId,
            access,
          };
        });
        if (normalizedRoleId === "viewer") {
          permissionSet.defaultAccess = "read_only";
          Object.keys(permissionSet.rings || {}).forEach((ringId) => {
            permissionSet.rings[ringId] = {
              ...(permissionSet.rings[ringId] || {}),
              defaultAccess: ringId === "ring_1" ? "read_only" : "no_access",
            };
          });
        }
        if (normalizedRoleId === "billing") {
          permissionSet.defaultAccess = "read_only";
          if (permissionSet.rings?.ring_3) {
            permissionSet.rings.ring_3 = { ...permissionSet.rings.ring_3, defaultAccess: "ask_for_permission" };
          }
        }
        return permissionSet;
      }

      function normalizePlaygroundOrganizationRolePermissionSets(value) {
        const inputSets = isPlaygroundPermissionRecord(value) ? value : {};
        return PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.reduce((rolePermissionSets, role) => {
          rolePermissionSets[role.id] = role.id === "owner"
            ? createPlaygroundOrganizationRolePermissionSet(role.id)
            : normalizePlaygroundPermissionSet(
                inputSets[role.id] || createPlaygroundOrganizationRolePermissionSet(role.id),
                "organization_role"
              );
          return rolePermissionSets;
        }, {});
      }
`;
