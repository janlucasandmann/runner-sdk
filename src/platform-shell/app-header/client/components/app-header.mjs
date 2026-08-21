export const APP_HEADER_COMPONENT_SCRIPT = `        function toggleAccountMenuFrom(placement) {
          const normalizedPlacement = placement === "top-nav" ? "top-nav" : "sidebar";
          setAccountMenuPlacement(normalizedPlacement);
          setAccountMenuOpen((current) => accountMenuPlacement === normalizedPlacement ? !current : true);
        }

        function renderAppHeaderNotificationButton() {
          return React.createElement("button", {
            type: "button",
            className: "playground-content-menu-button" + (hasVisibleNotifications ? " has-notifications" : ""),
            "aria-label": "Notifications",
            "aria-expanded": notificationsOpen ? "true" : "false",
            onClick: () => setNotificationsOpen((current) => !current),
          },
            React.createElement(Bell, { className: "playground-content-menu-icon", strokeWidth: 1.8 })
          );
        }

        function renderAppHeaderGhostButton(options = {}) {
          const isPrivateChatVariant = options.variant === "private-chat";
          if (isPrivateChatVariant) {
            return React.createElement(PlatformSecondaryButton, {
              className: "playground-top-nav-private-chat-control",
              active: runnerComposerPrivateMode,
              "aria-label": "Private Chat",
              title: runnerComposerPrivateMode ? "Private mode active" : "Private mode",
              onClick: handleGhostModeToggle,
            },
              React.createElement(Ghost, { strokeWidth: 1.8 }),
              React.createElement("span", null, "Private Chat")
            );
          }

          return React.createElement("button", {
            type: "button",
            className: "playground-content-menu-button" + (runnerComposerPrivateMode ? " is-private-active" : ""),
            "aria-label": "Ghost mode",
            "aria-pressed": runnerComposerPrivateMode ? "true" : "false",
            title: runnerComposerPrivateMode ? "Private mode active" : "Private mode",
            onClick: handleGhostModeToggle,
          },
            React.createElement(Ghost, { className: "playground-content-menu-icon", strokeWidth: 1.8 })
          );
        }

        function renderAppHeaderCommonActions(options = {}) {
          return React.createElement(React.Fragment, null,
            options.includeGhost ? renderAppHeaderGhostButton({ variant: options.ghostVariant || "" }) : null,
            options.includeSearchDivider ? React.createElement("span", { className: "playground-top-nav-search-divider", "aria-hidden": "true" }) : null,
            renderAppHeaderNotificationButton()
          );
        }

        function renderAppHeader(options = {}) {
          const extraActions = Array.isArray(options.extraActions)
            ? options.extraActions
            : options.extraActions
              ? [options.extraActions]
              : [];
          const basePathItems = typeof resolveProjectResourceBreadcrumbItems === "function"
            ? resolveProjectResourceBreadcrumbItems(options.pathItems)
            : options.pathItems;
          const resolvedPathItems = resourceAccessNavigationState
            && Array.isArray(basePathItems)
            && basePathItems.length > 0
              ? (() => {
                  const nextPathItems = basePathItems.slice();
                  const resourceItemIndex = nextPathItems.length - 1;
                  const resourceItem = nextPathItems[resourceItemIndex];
                  const principalName = resourceAccessNavigationState.principalName || "Access";
                  const principalBreadcrumbLabel = resourceAccessNavigationState.principalKind === "team"
                    ? principalName + " Access"
                    : principalName;
                  const principalInitials = String(principalName)
                    .trim()
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part.charAt(0).toUpperCase())
                    .join("") || "T";
                  const principalProfileImageUrl = String(
                    resourceAccessNavigationState.principalProfileImageUrl || ""
                  ).trim();
                  const principalLeading = resourceAccessNavigationState.principalKind === "team"
                    ? React.createElement("span", {
                        className: "platform-resource-access-breadcrumb-avatar",
                      },
                        React.createElement("span", {
                          className: "platform-resource-access-breadcrumb-avatar__fallback",
                        }, principalInitials),
                        principalProfileImageUrl
                          ? React.createElement("img", {
                              key: principalProfileImageUrl,
                              className: "platform-resource-access-breadcrumb-avatar__image",
                              src: principalProfileImageUrl,
                              alt: "",
                              onError: (event) => {
                                event.currentTarget.style.display = "none";
                              },
                            })
                          : null
                      )
                    : null;
                  nextPathItems[resourceItemIndex] = {
                    ...(resourceItem && typeof resourceItem === "object"
                      ? resourceItem
                      : { label: String(resourceItem || resourceAccessNavigationState.resourceLabel) }),
                    onClick: () => resourceAccessNavigationState.onClose?.(),
                  };
                  nextPathItems.push({
                    label: principalBreadcrumbLabel,
                    leading: principalLeading,
                  });
                  return nextPathItems;
                })()
              : basePathItems;
          const hidePath = options.hidePath === true;
          const hideCommonActions = options.hideCommonActions === true;
          return React.createElement("div", {
              className: [
                "playground-content-nav",
                "playground-tools-navbar",
                "playground-unified-top-navbar",
                options.className || "",
              ].filter(Boolean).join(" "),
            },
            React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tools-navbar-title" },
              React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                hidePath ? null : renderAppHeaderBreadcrumbs(resolvedPathItems),
                !hidePath && options.leftExtra
                  ? React.createElement(React.Fragment, null,
                      React.createElement(ChevronRight, {
                        className: "playground-top-nav-path-separator playground-top-nav-left-extra-separator",
                        width: 12,
                        height: 12,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      }),
                      React.createElement("div", { className: "playground-top-nav-left-extra" }, options.leftExtra)
                    )
                  : null
              )
            ),
            React.createElement("div", { className: "playground-content-nav-center" },
              resourceAccessNavigationState
                ? null
                : options.center || null
            ),
            React.createElement("div", {
                className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tools-navbar-actions" + (options.rightClassName ? " " + options.rightClassName : ""),
                ref: options.rightRef || null,
              },
              ...extraActions,
              hideCommonActions
                ? null
                : renderAppHeaderCommonActions({
                    includeGhost: options.includeGhost === true,
                    ghostVariant: options.ghostVariant || "",
                    includeSearchDivider: options.includeSearchDivider === true,
                  })
            )
          );
        }
`;
