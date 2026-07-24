export const SECURITY_TOP_NAVIGATION_SCRIPT = `        function renderDevelopSecurityNav() {
          const isSecurityDetailView = resourcesHeaderState.mode === "detail"
            && resourcesHeaderState.resourceType === "security_repository";
          const returnToSecurityOverview = () => {
            if (typeof resourcesHeaderState.onOverviewClick === "function") {
              resourcesHeaderState.onOverviewClick();
              return;
            }
            openDevelopSecurityPage({ forceOverview: true, preserveSidebarMode: true });
          };
          const securityPathItems = isSecurityDetailView
            ? [
                { label: "Develop", onClick: () => openDevelopHome() },
                { label: "Security Agents", onClick: returnToSecurityOverview },
                {
                  label: resourcesHeaderState.title || "Repository",
                  trailing: resourcesHeaderState.versionNumber !== null
                    && resourcesHeaderState.versionNumber !== undefined
                    ? React.createElement(PlatformVersionLabel, {
                        version: resourcesHeaderState.versionNumber,
                        qualifier: resourcesHeaderState.versionIsLatest ? "Latest" : null,
                        className: "agent-breadcrumb-version-label",
                        disabled: Boolean(resourcesHeaderState.versionBusy),
                        "aria-label": "Open security repository version history",
                        onClick: (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (typeof resourcesHeaderState.onVersionClick === "function") {
                            resourcesHeaderState.onVersionClick();
                          }
                        },
                      })
                    : null,
                },
              ]
            : [
                { label: "Develop", onClick: () => openDevelopHome() },
                { label: "Security Agents" },
              ];
          return renderAppHeader({
            className: "playground-develop-navbar playground-develop-security-navbar",
            pathItems: securityPathItems,
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-develop-security-overview-controls",
              className: "playground-resource-overview-controls-slot playground-develop-security-overview-controls-slot",
            }),
          });
        }
`;
