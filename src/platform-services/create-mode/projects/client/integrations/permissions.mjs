export const PROJECTS_PERMISSIONS_RUNTIME_SCRIPT = `
      function createPlaygroundProjectTeamRolePermissionSet(roleId) {
        const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
        return createPlaygroundRolePermissionSet("project_team_role", normalizedRoleId);
      }
`;
