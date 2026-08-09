export const TEAMS_TOP_NAVIGATION_SCRIPT = `        function renderTeamPageNav() {
          const isTeamOverview = !teamPageSelectedTeamId;
          const selectedTeam = isTeamOverview
            ? null
            : teamPageTeams.find((team) => String(team?.id || "") === String(teamPageSelectedTeamId || "")) || null;
          const activeTeamDetailSection = teamPageActiveTab === "permissions"
            ? "roles"
            : ["members", "resources", "roles"].includes(teamPageActiveTab)
              ? teamPageActiveTab
              : "members";
          return renderAppHeader({
            className: "playground-settings-top-navbar",
            pathItems: isTeamOverview
              ? [{ label: "Admin" }, { label: "Teams" }]
              : [
                  { label: "Admin" },
                  { label: "Teams", onClick: openTeamOverviewPage },
                  { label: String(selectedTeam?.name || "Team") },
                ],
            center: isTeamOverview
              ? null
              : React.createElement(PlatformSwitch, {
                  className: "playground-team-detail-header-switch",
                  value: activeTeamDetailSection,
                  options: [
                    { value: "members", label: "Members" },
                    { value: "resources", label: "Resources" },
                    { value: "roles", label: "Roles" },
                  ],
                  onValueChange: (nextSection) => {
                    setTeamPageActiveTab(["members", "resources", "roles"].includes(nextSection)
                      ? nextSection
                      : "members");
                  },
                  ariaLabel: "Team section",
                }),
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
