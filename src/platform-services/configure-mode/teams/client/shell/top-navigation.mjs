export const TEAMS_TOP_NAVIGATION_SCRIPT = `        function renderTeamPageNav() {
          const isTeamOverview = !teamPageSelectedTeamId;
          const selectedTeam = isTeamOverview
            ? null
            : teamPageTeams.find((team) => String(team?.id || "") === String(teamPageSelectedTeamId || "")) || null;
          return renderAppHeader({
            className: "playground-settings-top-navbar",
            pathItems: isTeamOverview
              ? [{ label: "Configure" }, { label: "Teams" }]
              : [
                  { label: "Configure" },
                  { label: "Teams", onClick: openTeamOverviewPage },
                  { label: String(selectedTeam?.name || "Team") },
                ],
            includeSearchDivider: true,
            extraActions: isTeamOverview
              ? React.createElement("div", {
                  id: "playground-teams-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : React.createElement("div", {
                  id: "playground-team-detail-controls",
                  className: "playground-tools-overview-controls-slot playground-team-detail-controls-slot",
                }),
          });
        }
`;
