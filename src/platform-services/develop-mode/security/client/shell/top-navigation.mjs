export const SECURITY_TOP_NAVIGATION_SCRIPT = `        function renderDevelopSecurityNav() {
          const isSecurityDetailView = resourcesHeaderState.mode === "detail"
            && ["security_repository", "security_run", "security_finding"].includes(
              resourcesHeaderState.resourceType
            );
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
                ...(resourcesHeaderState.parentTitle
                  ? [{
                      label: resourcesHeaderState.parentTitle,
                      onClick: typeof resourcesHeaderState.onParentClick === "function"
                        ? resourcesHeaderState.onParentClick
                        : undefined,
                    }]
                  : []),
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
            center: isSecurityDetailView
              && Array.isArray(resourcesHeaderState.sectionOptions)
              && resourcesHeaderState.sectionOptions.length
              ? React.createElement(PlatformSwitch, {
                  className: "playground-security-agent-detail-header-switch",
                  value: resourcesHeaderState.activeSection
                    || resourcesHeaderState.sectionOptions[0].value,
                  options: resourcesHeaderState.sectionOptions,
                  onValueChange: (nextSection) => {
                    if (typeof resourcesHeaderState.onSectionChange === "function") {
                      resourcesHeaderState.onSectionChange(nextSection);
                    }
                  },
                  ariaLabel: "Security Agent section",
                })
              : null,
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: "playground-develop-security-overview-controls",
              className: "playground-resource-overview-controls-slot playground-develop-security-overview-controls-slot",
            }),
          });
        }
`;
