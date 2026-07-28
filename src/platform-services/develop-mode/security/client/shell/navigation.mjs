export const SECURITY_NAVIGATION_SCRIPT = `        function openDevelopSecurityPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (options.forceOverview === true && typeof window !== "undefined") {
            const securityOverviewUrl = new URL(window.location.href);
            const securityRouteKeys = [
              "security_repository",
              "security_run",
              "security_finding",
            ];
            const hadSecurityDetailRoute = securityRouteKeys.some((key) =>
              securityOverviewUrl.searchParams.has(key)
            );
            securityRouteKeys.forEach((key) =>
              securityOverviewUrl.searchParams.delete(key)
            );
            if (hadSecurityDetailRoute) {
              window.history.pushState(
                {
                  ...window.history.state,
                  developSecurityRoute: { kind: "overview" },
                },
                "",
                securityOverviewUrl
              );
            }
            window.dispatchEvent(
              new Event("computer-agents:security-workspace-route-change")
            );
          }
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          setResourcesHeaderState({ mode: "overview", title: "" });
          setIsAgentVersionsDetailOpen(false);
          setActivePage("develop-security");
        }
`;
