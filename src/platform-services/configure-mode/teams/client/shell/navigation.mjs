export const TEAMS_NAVIGATION_SCRIPT = `        function openTeamPage() {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setSidebarWorkspaceMode("configure");
          setActivePage("team");
        }

        function openTeamOverviewPage() {
          setTeamPageSelectedTeamId("");
          setTeamPageActiveTab("members");
          setTeamPageSelectedRoleId("member");
          setTeamPageMembers([]);
          setTeamPageInvitations([]);
          setTeamPageShares([]);
          openTeamPage();
        }
`;
