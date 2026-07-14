export const TEAMS_LOAD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (activePage !== "team" || !hasRealAccess) {
            return;
          }
          void loadTeamPageData();
        }, [activePage, hasRealAccess, teamPageSelectedTeamId, proxyBackendBase, requestHeaders]);
`;

