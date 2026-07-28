export function createSecurityTopNavigationScript(options = {}) {
  const documentationUrl =
    typeof options.documentationUrl === "string" &&
    options.documentationUrl.trim()
      ? options.documentationUrl.trim()
      : "/developers";

  return `        function renderDevelopSecurityNav() {
          const isSecurityDetailView = resourcesHeaderState.mode === "detail"
            && ["security_repository", "security_run", "security_finding"].includes(
              resourcesHeaderState.resourceType
            );
          const securityDocumentationUrl = ${JSON.stringify(documentationUrl)};
          const returnToSecurityOverview = () => {
            if (typeof resourcesHeaderState.onOverviewClick === "function") {
              resourcesHeaderState.onOverviewClick();
              return;
            }
            openDevelopSecurityPage({ forceOverview: true, preserveSidebarMode: true });
          };
          const renderSecurityRepositoryActions = () => {
            if (
              resourcesHeaderState.resourceType !== "security_repository"
              || !String(resourcesHeaderState.resourceId || "").trim()
            ) {
              return null;
            }
            const resourceId = String(resourcesHeaderState.resourceId || "").trim();
            const actionsOpen = Boolean(resourcesHeaderState.actionsOpen);
            const closeActions = () => {
              if (typeof resourcesHeaderState.onActionsOpenChange === "function") {
                resourcesHeaderState.onActionsOpenChange(false);
              }
            };
            return React.createElement(React.Fragment, null,
              actionsOpen
                ? React.createElement(PlatformPopupDismissLayer, {
                    className: "sidebar-thread-popup-scrim",
                    onClick: closeActions,
                  })
                : null,
              React.createElement(PlatformPopup, {
                  open: actionsOpen,
                  rootClassName: "playground-security-repository-title-actions-shell",
                  surfaceClassName: "playground-security-repository-title-actions-popup",
                  surfaceProps: {
                    role: "menu",
                    "aria-label": "Security Agent actions",
                    width: 280,
                    maxWidth: "calc(100vw - 16px)",
                    onClick: (event) => event.stopPropagation(),
                  },
                  animation: "down-in",
                  variant: "minimal",
                  portal: true,
                  placement: "bottom-start",
                  trigger: React.createElement(PlatformIconButton, {
                    type: "button",
                    size: "compact",
                    active: actionsOpen,
                    title: "Security Agent actions",
                    "aria-label": "Security Agent actions",
                    "aria-haspopup": "menu",
                    "aria-expanded": actionsOpen ? "true" : "false",
                    disabled: Boolean(resourcesHeaderState.versionBusy),
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (typeof resourcesHeaderState.onActionsOpenChange === "function") {
                        resourcesHeaderState.onActionsOpenChange(!actionsOpen);
                      }
                    },
                  }, React.createElement(Ellipsis, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                  }))
                },
                React.createElement("div", {
                  className: "tb-popup-row playground-thread-nav-popup-static-row",
                },
                  React.createElement("span", {
                    className: "tb-popup-check-slot",
                    "aria-hidden": "true",
                  }),
                  React.createElement("div", {
                    className: "playground-tasks-toolbar-popup-item-copy",
                  },
                    React.createElement("span", null, "Resource ID"),
                    React.createElement("span", {
                      className: "playground-thread-nav-popup-thread-id",
                      title: resourceId,
                    }, resourceId)
                  )
                ),
                React.createElement("div", {
                  className: "playground-thread-nav-popup-divider",
                  "aria-hidden": "true",
                }),
                React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => {
                    closeActions();
                    const docsWindow = window.open(
                      securityDocumentationUrl,
                      "_blank",
                      "noopener,noreferrer"
                    );
                    if (docsWindow) docsWindow.opener = null;
                  },
                },
                  React.createElement(BookOpen, {
                    className: "tb-popup-icon",
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                  }),
                  React.createElement("span", {
                    className: "tb-popup-label",
                  }, "Documentation")
                ),
                React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  disabled: typeof resourcesHeaderState.onDelete !== "function",
                  onClick: () => {
                    closeActions();
                    if (typeof resourcesHeaderState.onDelete === "function") {
                      resourcesHeaderState.onDelete();
                    }
                  },
                },
                  React.createElement(Trash2, {
                    className: "tb-popup-icon",
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                  }),
                  React.createElement("span", {
                    className: "tb-popup-label",
                  }, "Delete")
                )
              )
            );
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
                  trailing: resourcesHeaderState.resourceType === "security_repository"
                    ? React.createElement("span", {
                        className: "playground-security-repository-title-actions",
                      },
                        resourcesHeaderState.versionNumber !== null
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
                        renderSecurityRepositoryActions()
                      )
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
}

export const SECURITY_TOP_NAVIGATION_SCRIPT =
  createSecurityTopNavigationScript();
