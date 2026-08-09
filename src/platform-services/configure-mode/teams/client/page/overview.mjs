const TEAMS_PAGE_OVERVIEW_TEMPLATE = `	          const renderTeamOverview = () => React.createElement(React.Fragment, null,
            React.createElement(TeamsOverviewPage, {
              rows: teamOverviewRows,
              loading: teamPageLoading && teamOverviewRows.length === 0,
              error: teamPageError,
              controlsPortalId: "playground-teams-overview-controls",
              onOpen: (team) => openTeamDetail(team.id),
              onCreate: () => setTeamPageCreateModalOpen(true),
              onRename: (team) => {
                setTeamPageSelectedTeamId(String(team?.id || ""));
                setTeamPageRenameName(team?.name || "");
                setTeamPageRenameModalOpen(true);
              },
            }),
            renderCreateTeamModal()
          );

`;

export function createTeamsPageOverviewScript() {
  return TEAMS_PAGE_OVERVIEW_TEMPLATE;
}
