export const GUARDRAILS_APP_TOP_NAVIGATION_SCRIPT = `        function renderGuardrailsPageNav() {
          const activeGuardrailSet = (Array.isArray(allGuardrailSets) ? allGuardrailSets : [])
            .find((set) => set?.id === selectedGuardrailSetId);
          const guardrailsPathItems = [{ label: "Configure" }, { label: "Guardrails" }];
          if (guardrailsPageMode === "detail" && activeGuardrailSet?.name) {
            guardrailsPathItems.push({ label: activeGuardrailSet.name });
          }
          const canShowGuardrailDetailActions = Boolean(
            guardrailsPageMode === "detail"
            && activeGuardrailSet
            && !isPlaygroundDefaultGuardrailSet(activeGuardrailSet)
            && !isResourcesVersionsDrawerOpen
          );
          const guardrailDetailTopNavActions = canShowGuardrailDetailActions
            ? React.createElement("span", { className: "playground-guardrails-detail-topnav-actions" },
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
                  children: renderGuardrailActionMenuItems(activeGuardrailSet.id),
                })
              )
            : null;
          return renderUnifiedTopNav({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: guardrailsPathItems,
            extraActions: guardrailDetailTopNavActions,
            includeSearchDivider: canShowGuardrailDetailActions,
            hideCommonActions: isResourcesVersionsDrawerOpen,
          });
        }

`;
