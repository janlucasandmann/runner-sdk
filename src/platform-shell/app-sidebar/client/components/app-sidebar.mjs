export const APP_SIDEBAR_COMPONENT_SCRIPT = `        function renderExpandedSidebarContent() {
          const shouldRenderSidebarThreads = sidebarWorkspaceMode === "work";
          const shouldShowSidebarThreadSection = shouldRenderSidebarThreads && (isThreadsLoading || pinnedThreadItems.length > 0 || baseThreadItems.length > 0 || displayedSidebarThreadEntries.length > 0);
          const sidebarNavigationItems = getSidebarNavigationItems();
          const sidebarFooterNavigationItems = getSidebarFooterNavigationItems();
          const sidebarOrganizationDisplay = getActiveSidebarOrganizationDisplay();
          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-sidebar-top" },
              React.createElement("div", {
                className: "playground-sidebar-brand",
              },
                React.createElement("img", {
                  className: "playground-sidebar-brand-logo",
                  src: APP_SIDEBAR_LOGO_URL,
                  alt: "Computer Agents",
                  width: 16,
                  height: 16,
                })
              ),
              renderAppSidebarModeSelector(),
              React.createElement("div", { className: "app-sidebar-top-actions" },
                React.createElement(PlatformIconButton, {
                  className: "app-sidebar-top-action",
                  onClick: openThreadSearch,
                  "aria-label": "Search",
                  "aria-keyshortcuts": "Meta+K Control+K",
                  tooltip: "Search",
                  tooltipShortcut: "⌘ K",
                  tooltipPlacement: "bottom",
                  tooltipAlign: "end",
                }, React.createElement(Search, { className: "app-sidebar-top-action-icon", strokeWidth: 1.7 })),
                React.createElement(PlatformIconButton, {
                  className: "app-sidebar-top-action",
                  onClick: () => setSidebarOpen(false),
                  "aria-label": "Collapse sidebar",
                  "aria-keyshortcuts": "Meta+B Control+B",
                  tooltip: "Close sidebar",
                  tooltipShortcut: "⌘ B",
                  tooltipPlacement: "bottom",
                  tooltipAlign: "end",
                }, React.createElement(PanelLeft, { className: "app-sidebar-top-action-icon", strokeWidth: 1.7 }))
              )
            ),
            React.createElement("div", { className: "sidebar-action-list" },
              sidebarNavigationItems.map(renderSidebarNavigationButton)
            ),
            shouldRenderSidebarThreads && !threadsSectionCollapsed && pinnedThreadItems.length > 0
              ? React.createElement("div", { className: "sidebar-pinned-list" },
                  pinnedThreadItems.map((thread) => renderSidebarThreadRow(thread, { pinned: true }))
                )
              : null,
            shouldShowSidebarThreadSection
              ? React.createElement("div", { className: "sidebar-thread-section" },
                  React.createElement("button", {
                    type: "button",
                    className: "sidebar-thread-section-header" + (threadsSectionCollapsed ? " is-collapsed" : ""),
                    onClick: () => setThreadsSectionCollapsed((current) => !current),
                    "aria-expanded": threadsSectionCollapsed ? "false" : "true",
                  },
                    React.createElement("div", { className: "sidebar-thread-section-title" }, "Threads"),
                    React.createElement(ChevronDown, { className: "sidebar-thread-section-chevron", strokeWidth: 1.8 })
                  ),
                  !threadsSectionCollapsed
                    ? React.createElement("div", { className: "sidebar-thread-scroll" },
                        displayedThreadItems.length === 0
                          ? baseThreadItems.length === 0
                            ? React.createElement("div", { className: "sidebar-empty-state" }, sidebarEmptyStateCopy)
                            : null
                          : React.createElement("div", { className: "sidebar-thread-list" },
                              displayedSidebarThreadEntries.map((entry) => (
                                entry?.kind === "metronome-run"
                                  ? renderSidebarMetronomeRunEntry(entry)
                                  : renderSidebarThreadRow(entry.thread)
                              )),
                              hasMoreThreadItems
                                ? React.createElement("button", {
                                    type: "button",
                                    className: "sidebar-show-more",
                                    onClick: () => void handleShowMoreThreads()
                                  }, "Show more threads")
                                : null
                            )
                      )
                    : null
                )
              : null,
            React.createElement("div", { className: "sidebar-footer" },
              renderStatusIndicators(),
              sidebarFooterNavigationItems.map(renderSidebarNavigationButton),
              React.createElement("button", {
                type: "button",
                className: "sidebar-organization-card" + (accountMenuOpen && accountMenuPlacement === "sidebar" ? " is-open" : ""),
                onClick: () => toggleAccountMenuFrom("sidebar"),
                "aria-label": "Open account menu for " + sidebarOrganizationDisplay.name,
                "aria-expanded": accountMenuOpen && accountMenuPlacement === "sidebar" ? "true" : "false",
                title: platformHasCapability("subscriptions")
                  ? sidebarOrganizationDisplay.name + " · " + sidebarPlanName
                  : sidebarOrganizationDisplay.name,
              },
                renderAccountAvatar("sidebar-organization-avatar", "sidebar-organization-avatar-image", accountInitials, accountAvatarUrl),
                React.createElement("span", {
                  className: "sidebar-organization-main",
                },
                  React.createElement("span", { className: "sidebar-organization-copy" },
                    React.createElement("span", { className: "sidebar-organization-name" }, sidebarOrganizationDisplay.name),
                    platformHasCapability("subscriptions")
                      ? React.createElement("span", { className: "sidebar-organization-plan" }, sidebarPlanName)
                      : null
                  )
                ),
                React.createElement("span", {
                  className: "sidebar-organization-menu-button",
                  "aria-hidden": "true",
                },
                  React.createElement(EllipsisVertical, { className: "sidebar-organization-menu-icon", strokeWidth: 1.8 })
                )
              )
            )
          );
        }

        function renderCollapsedSidebarRail() {
          const sidebarNavigationItems = getSidebarNavigationItems();
          const sidebarFooterNavigationItems = getSidebarFooterNavigationItems();
          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "sidebar-rail-top" },
              React.createElement("button", {
                type: "button",
                className: "sidebar-rail-logo-button",
                onClick: () => setSidebarOpen(true),
                "aria-label": "Open sidebar",
                "aria-keyshortcuts": "Meta+B Control+B",
                title: "Open sidebar · ⌘ B"
              },
                React.createElement("img", {
                  className: "sidebar-rail-logo",
                  src: APP_SIDEBAR_LOGO_URL,
                  alt: "Computer Agents",
                  width: 16,
                  height: 16,
                }),
                React.createElement(PanelLeftOpen, { className: "sidebar-rail-logo-open-icon", strokeWidth: 1.5 })
              )
            ),
            React.createElement("div", { className: "sidebar-rail-actions" },
              sidebarNavigationItems.map((item) => {
                if (item?.type === "subtitle" || item?.type === "subcategory") {
                  return React.createElement("div", {
                    key: item.id,
                    className: "sidebar-rail-section-spacer",
                    "aria-hidden": "true",
                  });
                }
                const Icon = getPlaygroundSafeIconComponent(item.Icon, Circle);
                return React.createElement("button", {
                  key: item.id,
                  type: "button",
                  className: "sidebar-rail-button" + (item.active ? " is-active" : ""),
                  onClick: () => handleSidebarNavigationItemClick(item),
                  "aria-label": item.label,
                  title: item.label,
                }, React.createElement(Icon, { className: "sidebar-rail-icon", strokeWidth: 1.5 }));
              })
            ),
            React.createElement("div", { className: "sidebar-rail-footer" },
              sidebarFooterNavigationItems.filter((item) => item?.type !== "subtitle" && item?.type !== "subcategory").map((item) => {
                const Icon = getPlaygroundSafeIconComponent(item.Icon, Circle);
                return React.createElement("button", {
                  key: item.id,
                  type: "button",
                  className: "sidebar-rail-button" + (item.active ? " is-active" : ""),
                  onClick: () => handleSidebarNavigationItemClick(item),
                  "aria-label": item.label,
                  title: item.label,
                }, React.createElement(Icon, { className: "sidebar-rail-icon", strokeWidth: 1.5 }));
              }),
              React.createElement("button", {
                type: "button",
                className: "sidebar-rail-account" + (accountMenuOpen && accountMenuPlacement === "sidebar" ? " is-open" : ""),
                onClick: () => toggleAccountMenuFrom("sidebar"),
                "aria-label": "Open account menu",
                "aria-expanded": accountMenuOpen && accountMenuPlacement === "sidebar" ? "true" : "false",
                title: hasShellAccess ? accountName : "Sign in",
              },
                renderAccountAvatar("sidebar-account-avatar", "sidebar-account-avatar-image", accountInitials, accountAvatarUrl)
              )
            )
          );
        }

        function renderAppSidebar() {
          return React.createElement("aside", {
              className: "playground-sidebar" + (sidebarOpen ? "" : " is-collapsed"),
            },
            React.createElement("div", {
              className: "playground-sidebar-panel",
              "aria-hidden": sidebarOpen ? "false" : "true",
            }, renderExpandedSidebarContent()),
            React.createElement("div", {
              className: "playground-sidebar-rail",
              "aria-hidden": sidebarOpen ? "true" : "false",
            }, renderCollapsedSidebarRail())
          );
        }

`;
