export const PROJECTS_PERMISSIONS_RUNTIME_SCRIPT = `
      function createPlaygroundProjectTeamRolePermissionSet(roleId) {
        const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
        if (normalizedRoleId === "owner") {
          return createPlaygroundFullAccessPermissionSet("project_team_role");
        }
        const permissionSet = createPlaygroundDefaultPermissionSet("project_team_role");
        const applyRingAccess = (ringId, access) => {
          permissionSet.rings[ringId] = {
            ...(permissionSet.rings[ringId] || {}),
            defaultAccess: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
          };
        };
        const applyActionAccess = (actionId, ringId, access) => {
          permissionSet.actions[actionId] = {
            ...(permissionSet.actions[actionId] || {}),
            ringId: normalizePlaygroundPermissionRingId(ringId, "ring_1"),
            access: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
          };
        };

        if (normalizedRoleId === "admin") {
          PLAYGROUND_PERMISSION_RING_IDS.forEach((ringId) => applyRingAccess(ringId, "full_access"));
          [
            "project_rules_view",
            "project_rules_edit",
            "project_access_manage",
          ].forEach((actionId) => {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            applyActionAccess(actionId, actionDefinition?.ringId || "ring_2", "full_access");
          });
          return permissionSet;
        }

        if (normalizedRoleId === "contributor") {
          applyRingAccess("ring_1", "full_access");
          applyRingAccess("ring_2", "full_access");
          applyRingAccess("ring_3", "ask_for_permission");
          applyActionAccess("project_rules_view", "ring_1", "full_access");
          applyActionAccess("project_rules_edit", "ring_2", "full_access");
          applyActionAccess("project_access_manage", "ring_3", "no_access");
          return permissionSet;
        }

        applyRingAccess("ring_1", "read_only");
        applyRingAccess("ring_2", "ask_for_permission");
        applyRingAccess("ring_3", "no_access");
        applyActionAccess("project_rules_view", "ring_1", "read_only");
        applyActionAccess("project_rules_edit", "ring_2", "no_access");
        applyActionAccess("project_access_manage", "ring_3", "no_access");
        return permissionSet;
      }
`;
