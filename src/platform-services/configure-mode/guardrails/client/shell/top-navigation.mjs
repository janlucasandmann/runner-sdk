export const GUARDRAILS_APP_TOP_NAVIGATION_SCRIPT = `        function renderGuardrailsPageNav() {
          const activeGuardrailSet = (Array.isArray(allGuardrailSets) ? allGuardrailSets : [])
            .find((set) => set?.id === selectedGuardrailSetId);
          const activeGuardrailVersions = activeGuardrailSet
            ? readPlaygroundGuardrailVersions(activeGuardrailSet)
            : [];
          const selectedGuardrailVersion = activeGuardrailSet
            ? (
                playgroundGuardrailVersionController.getSelectedVersion(activeGuardrailSet)
                || playgroundGuardrailVersionController.getActiveVersion(activeGuardrailSet)
                || activeGuardrailVersions[0]
                || null
              )
            : null;
          const latestGuardrailVersionNumber = activeGuardrailVersions.reduce((latestVersion, version) => {
            const versionNumber = Number(version?.version);
            return Number.isFinite(versionNumber)
              ? Math.max(latestVersion, versionNumber)
              : latestVersion;
          }, -1);
          const guardrailsPathItems = [
            { label: "Configure" },
            {
              label: "Guardrails",
              onClick: guardrailsPageMode === "detail"
                ? () => requestPlatformNavigation(openGuardrailsOverviewPage)
                : undefined,
            },
          ];
          if (guardrailsPageMode === "detail" && activeGuardrailSet?.name) {
            guardrailsPathItems.push({
              label: activeGuardrailSet.name,
              trailing: selectedGuardrailVersion && !isPlaygroundDefaultGuardrailSet(activeGuardrailSet)
                ? React.createElement(PlatformVersionLabel, {
                    version: selectedGuardrailVersion.version,
                    qualifier: Number(selectedGuardrailVersion.version) === latestGuardrailVersionNumber
                      ? "Latest"
                      : null,
                    className: "agent-breadcrumb-version-label playground-guardrail-breadcrumb-version-label",
                    disabled: guardrailVersionState.status === "loading",
                    "aria-label": "Open guardrail version history",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setGuardrailDetailActionsMenuOpen(false);
                      setGuardrailPublishMenuOpen(false);
                      setGuardrailVersionsHeaderMenuOpen(false);
                      setGuardrailVersionsSidebarOpen(true);
                    },
                  })
                : null,
            });
          }
          const isGuardrailsOverview = guardrailsPageMode !== "detail";
          const isGuardrailVersionHistoryOpen = Boolean(
            guardrailsPageMode === "detail"
            && activeGuardrailSet
            && !isPlaygroundDefaultGuardrailSet(activeGuardrailSet)
            && guardrailVersionsSidebarOpen
          );
          const canShowGuardrailDetailActions = Boolean(
            guardrailsPageMode === "detail"
            && activeGuardrailSet
            && !isPlaygroundDefaultGuardrailSet(activeGuardrailSet)
            && !isGuardrailVersionHistoryOpen
          );
          const guardrailDetailTopNavActions = canShowGuardrailDetailActions
            ? React.createElement("span", { className: "playground-guardrails-detail-topnav-actions" },
                React.createElement("span", {
                  id: "playground-guardrails-detail-publish-controls",
                  className: "playground-guardrails-detail-publish-controls",
                }),
                renderPlaygroundPlatformPopup({
                  open: guardrailDetailActionsMenuOpen,
                  shellRef: guardrailDetailActionsMenuRef,
                  shellClassName: "playground-guardrails-action-menu-shell playground-guardrails-detail-action-menu-shell",
                  menuClassName: "playground-agents-detail-publish-menu playground-guardrails-action-menu",
                  trigger: React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain" + (guardrailDetailActionsMenuOpen ? " is-active" : ""),
                    title: "Guardrail actions",
                    "aria-label": "Guardrail actions",
                    "aria-haspopup": "menu",
                    "aria-expanded": guardrailDetailActionsMenuOpen ? "true" : "false",
                    onClick: () => {
                      setGuardrailSetActionMenuId("");
                      setGuardrailDetailActionsMenuOpen((current) => !current);
                    },
                  }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
                  menuProps: {
                    role: "menu",
                    onClick: (event) => event.stopPropagation(),
                  },
                  children: renderGuardrailActionMenuItems(activeGuardrailSet.id, { includeMetadata: true }),
                })
              )
            : null;
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: guardrailsPathItems,
            extraActions: isGuardrailsOverview
              ? React.createElement("div", {
                  id: "playground-guardrails-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : guardrailDetailTopNavActions,
            includeSearchDivider: isGuardrailsOverview || canShowGuardrailDetailActions,
            hideCommonActions: isGuardrailVersionHistoryOpen,
          });
        }

`;
