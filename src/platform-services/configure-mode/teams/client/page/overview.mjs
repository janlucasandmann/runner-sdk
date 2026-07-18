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
              onOpenDocumentation: () => window.open(__TEAMS_DOCUMENTATION_URL__, "_blank", "noopener,noreferrer"),
            }),
            renderCreateTeamModal()
          );

`;

export function createTeamsPageOverviewScript(documentationUrl) {
  return TEAMS_PAGE_OVERVIEW_TEMPLATE.replace(
    "__TEAMS_DOCUMENTATION_URL__",
    JSON.stringify(String(documentationUrl || "").trim()),
  );
}
