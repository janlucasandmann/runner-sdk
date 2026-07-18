export const TEAMS_TOP_NAVIGATION_SCRIPT = `        function renderTeamPageNav() {
          const isTeamOverview = !teamPageSelectedTeamId;
          return renderAppHeader({
            className: "playground-settings-top-navbar",
            pathItems: [{ label: "Configure" }, { label: "Teams" }],
            includeSearchDivider: isTeamOverview,
            extraActions: isTeamOverview
              ? React.createElement("div", {
                  id: "playground-teams-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : null,
          });
        }
`;
