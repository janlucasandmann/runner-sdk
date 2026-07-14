export const TEAMS_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "team") {
            return {
              page: "team",
              teamId: teamPageSelectedTeamId,
              teamTab: teamPageActiveTab,
              teamRoleId: teamPageSelectedRoleId,
            };
          }
`;

