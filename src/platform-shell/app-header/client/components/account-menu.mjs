export const APP_HEADER_ACCOUNT_MENU_SCRIPT = `        function renderAppHeaderAccountMenu() {
          if (!renderedAccountMenu) {
            return null;
          }

          const accountMenuAnimation = accountMenuPhase === "enter"
            ? "up-in"
            : accountMenuPhase === "exit"
              ? "up-out"
              : false;

          return React.createElement(React.Fragment, null,
            React.createElement(PlatformPopupDismissLayer, {
              className: "account-menu-scrim",
              onClick: () => setAccountMenuOpen(false),
            }),
            React.createElement(PlatformPopup, {
              open: renderedAccountMenu,
              variant: "minimal",
              rootClassName: "account-menu-root",
              surfaceClassName: "account-menu" + (accountMenuPlacement === "top-nav" ? " is-top-nav" : (sidebarOpen ? " is-sidebar-open" : "")),
              animation: accountMenuAnimation,
              surfaceProps: {
                mode: "fixed",
                role: "menu",
                "aria-label": "Account menu",
                onClick: (event) => event.stopPropagation(),
              },
            },
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row account-menu-account-button",
                onClick: hasSessionAuth ? openProfileEditor : handleSignInWithComputerAgents,
              },
                renderAccountAvatar("account-menu-avatar", "account-menu-avatar-image", accountInitials, accountAvatarUrl),
                React.createElement("div", { className: "account-menu-account-copy" },
                  React.createElement("div", { className: "account-menu-account-name" }, hasShellAccess ? accountName : "Sign in to Agentic Compute Platform"),
                  React.createElement("div", { className: "account-menu-account-email" },
                    hasSessionAuth
                      ? (accountEmail || "Connected account")
                      : hasDemoAccess
                        ? "Seeded demo workspace. Sign in to switch to a live account."
                        : "Use your existing Agentic Compute Platform account"
                  )
                ),
                React.createElement(ChevronRight, { className: "account-menu-item-chevron", strokeWidth: 1.8 })
              ),
              React.createElement("div", { className: "account-menu-section" },
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row account-menu-item",
                  onClick: openSettingsModal,
                },
                  React.createElement(Settings, { className: "account-menu-item-icon", strokeWidth: 1.8 }),
                  React.createElement("span", { className: "account-menu-item-label" }, "Settings")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row account-menu-item",
                  onClick: openHelpPage,
                },
                  React.createElement(CircleHelp, { className: "account-menu-item-icon", strokeWidth: 1.8 }),
                  React.createElement("span", { className: "account-menu-item-label" }, "Help"),
                  React.createElement(ChevronRight, { className: "account-menu-item-chevron", strokeWidth: 1.8 })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row account-menu-item",
                  onClick: openDocsPage,
                },
                  React.createElement(FileText, { className: "account-menu-item-icon", strokeWidth: 1.8 }),
                  React.createElement("span", { className: "account-menu-item-label" }, "Docs"),
                  React.createElement(ChevronRight, { className: "account-menu-item-chevron", strokeWidth: 1.8 })
                ),
                React.createElement("div", { className: "account-menu-divider" }),
                hasSessionAuth
                  ? React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row account-menu-item is-signout",
                      onClick: handleSignOutFromComputerAgents,
                    },
                      React.createElement(LogOut, { className: "account-menu-item-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "account-menu-item-label" }, "Sign out")
                    )
                  : React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row account-menu-item is-signout",
                      onClick: handleSignInWithComputerAgents,
                    },
                      React.createElement(LogIn, { className: "account-menu-item-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "account-menu-item-label" }, "Sign in")
                    )
              )
            )
          );
        }
`;
