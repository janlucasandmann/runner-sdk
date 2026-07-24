export const SECURITY_PAGE_VIEW_SCRIPT = `        function renderDevelopSecurityPage() {
          return React.createElement(DevelopSecurityWorkspacePage, {
            controlsPortalId: "playground-develop-security-overview-controls",
            versionsDrawerPortalId: "playground-agent-versions-drawer-root",
            githubConnectionStatus: githubStatus,
            viewerIdentity: {
              id: hasSessionAuth ? (sessionState.userId || accountEmail || "") : "",
              userId: hasSessionAuth ? (sessionState.userId || "") : "",
              name: hasSessionAuth ? accountName : "Me",
              email: hasSessionAuth ? accountEmail : "",
              avatarUrl: hasSessionAuth ? accountAvatarUrl : "",
            },
            workspaceTeams: teamPageTeams,
            workspaceTeamsLoading: teamPageLoading,
            workspaceTeamsRequiresPlan: teamPageRequiresPlan,
            onWorkspaceTeamsRequest: (options = {}) => {
              const requestedTeamId = String(options?.selectedTeamId || options?.teamId || "").trim();
              void loadTeamPageData({ selectedTeamId: requestedTeamId });
            },
            onConnectGitHub: handleGithubAuthConnect,
            onDisconnectGitHub: handleGithubAuthDisconnect,
            onResourcesHeaderChange: setResourcesHeaderState,
            onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen,
            onNavigationGuardChange: registerPlatformNavigationGuard,
          });
        }
`;
