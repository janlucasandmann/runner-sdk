export const TEAMS_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "team") {
            openTeamPage();
            setTeamPageSelectedTeamId(entry.teamId || "");
            setTeamPageActiveTab(entry.teamTab === "resources" || entry.teamTab === "roles" || entry.teamTab === "permissions" ? (entry.teamTab === "permissions" ? "roles" : entry.teamTab) : "members");
            setTeamPageSelectedRoleId(normalizePlaygroundTeamRoleId(entry.teamRoleId, "member"));
            return;
          }
`;

