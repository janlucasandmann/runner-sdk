export const VERSION_SIDEBAR_SCRIPT = String.raw`
      function PlaygroundVersionSidebar(props = {}) {
        const versions = Array.isArray(props.versions) ? props.versions : [];
        const state = props.state && typeof props.state === "object" ? props.state : {};
        const stateStatus = String(state.status || "idle").trim().toLowerCase();
        const isBusy = Boolean(props.busy) || stateStatus === "loading";
        const activeVersionId = String(props.activeVersionId || "").trim();
        const selectedVersionId = String(props.selectedVersionId || activeVersionId || "").trim();
        const openMenuId = String(props.openMenuId || "").trim();
        const onOpenMenuIdChange = typeof props.onOpenMenuIdChange === "function"
          ? props.onOpenMenuIdChange
          : () => {};
        const headerMenuRef = React.useRef(null);
        const headerMenuActions = (Array.isArray(props.headerMenuActions) ? props.headerMenuActions : [])
          .filter((action) => action && typeof action.onClick === "function");
        const headerMenuOpen = Boolean(props.headerMenuOpen && headerMenuActions.length);
        const onHeaderMenuOpenChange = typeof props.onHeaderMenuOpenChange === "function"
          ? props.onHeaderMenuOpenChange
          : () => {};
        const onSelectVersion = typeof props.onSelectVersion === "function"
          ? props.onSelectVersion
          : (typeof props.onRestoreVersion === "function" ? props.onRestoreVersion : null);
        const className = [
          "playground-agents-versions-sidebar",
          "playground-metronome-node-inspector",
          "playground-metronome-publish-sidebar",
          props.className || "",
        ].filter(Boolean).join(" ");
        const title = String(props.title || "Versions").trim() || "Versions";
        const sectionTitle = String(props.sectionTitle || "Saved versions").trim() || "Saved versions";
        const emptyTitle = String(props.emptyTitle || "No saved versions yet").trim() || "No saved versions yet";
        const emptyCopy = String(props.emptyCopy || "Create a version to track changes over time.").trim();
        const getVersionTitle = typeof props.getVersionTitle === "function"
          ? props.getVersionTitle
          : (version) => String(version?.label || ("Version " + (version?.version || ""))).trim() || "Version";
        const getVersionDescription = typeof props.getVersionDescription === "function"
          ? props.getVersionDescription
          : (version) => String(version?.description || "").trim();
        const getVersionMeta = typeof props.getVersionMeta === "function"
          ? props.getVersionMeta
          : (version) => {
              const createdAt = String(version?.publishedAt || version?.createdAt || "").trim();
              return (version?.publishedAt ? "Published" : "Saved") + (createdAt ? " " + createdAt : "");
            };
        const getRowMenuItems = typeof props.getRowMenuItems === "function"
          ? props.getRowMenuItems
          : (version) => {
              const items = [];
              if (typeof props.onRestoreVersion === "function") {
                items.push({
                  id: "restore",
                  label: "Restore version",
                  icon: RotateCcw,
                  onClick: () => props.onRestoreVersion(version.id),
                });
              }
              if (typeof props.onDeleteVersion === "function") {
                items.push({
                  id: "delete",
                  label: "Delete version",
                  icon: Trash2,
                  danger: true,
                  onClick: () => props.onDeleteVersion(version.id),
                });
              }
              return items;
            };
        const hasFooterActions = typeof props.onPublishCurrent === "function"
          || typeof props.onUnpublishActive === "function";

        React.useEffect(() => {
          if (!headerMenuOpen) {
            return undefined;
          }

          function handleHeaderMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !headerMenuRef.current || headerMenuRef.current.contains(target)) {
              return;
            }
            onHeaderMenuOpenChange(false);
          }

          function handleHeaderMenuEscape(event) {
            if (event.key === "Escape") {
              onHeaderMenuOpenChange(false);
            }
          }

          document.addEventListener("mousedown", handleHeaderMenuPointerDown);
          window.addEventListener("keydown", handleHeaderMenuEscape);
          return () => {
            document.removeEventListener("mousedown", handleHeaderMenuPointerDown);
            window.removeEventListener("keydown", handleHeaderMenuEscape);
          };
        }, [headerMenuOpen]);

        const renderStateContent = () => {
          if (props.stateContent) {
            return props.stateContent;
          }
          if (stateStatus === "validating") {
            return React.createElement("div", { className: "playground-metronome-publish-state" },
              state.message || "Checking before publishing..."
            );
          }
          if (stateStatus === "error") {
            return React.createElement("div", { className: "playground-metronome-publish-state is-error" },
              state.error || state.message || "Failed to update versions."
            );
          }
          if (props.showSuccessState && stateStatus === "success" && state.message) {
            return React.createElement("div", { className: "playground-metronome-publish-state is-success" }, state.message);
          }
          return null;
        };

        const renderEmptyState = () => React.createElement("div", { className: "playground-metronome-publish-empty-state" },
          React.createElement("div", { className: "playground-metronome-publish-empty-card" },
            React.createElement("img", {
              className: "playground-metronome-publish-empty-image",
              src: props.emptyImageSrc || "/img/empty-state/metronome.webp",
              alt: "",
              "aria-hidden": "true",
            }),
            React.createElement("h3", { className: "playground-metronome-publish-empty-title" }, emptyTitle),
            emptyCopy ? React.createElement("p", { className: "playground-metronome-publish-empty-copy" }, emptyCopy) : null
          )
        );

        const renderVersionRow = (version, index) => {
          const versionId = String(version?.id || "").trim() || "version-" + index;
          const isActiveVersion = versionId === activeVersionId || String(version?.status || "").toLowerCase() === "active";
          const isSelectedVersion = versionId === selectedVersionId;
          const versionTitle = getVersionTitle(version, { isActiveVersion, isSelectedVersion, index });
          const versionDescription = getVersionDescription(version, { isActiveVersion, isSelectedVersion, index });
          const versionMeta = getVersionMeta(version, { isActiveVersion, isSelectedVersion, index });
          const rowMenuItems = (getRowMenuItems(version, { isActiveVersion, isSelectedVersion, index, isBusy }) || [])
            .filter((item) => item && typeof item.onClick === "function");

          const handleSelect = () => {
            if (!onSelectVersion || isBusy || isSelectedVersion) {
              return;
            }
            onSelectVersion(versionId, version);
          };

          return React.createElement("div", {
            key: versionId,
            className: "playground-metronome-publish-row"
              + (isActiveVersion ? " is-active" : "")
              + (isSelectedVersion ? " is-selected" : ""),
          },
            React.createElement("button", {
              type: "button",
              className: "playground-metronome-publish-row-checkbox" + (isSelectedVersion ? " is-selected" : ""),
              disabled: isBusy || isSelectedVersion || !onSelectVersion,
              onClick: handleSelect,
              "aria-label": "Display " + versionTitle,
              "aria-pressed": isSelectedVersion ? "true" : "false",
            },
              isSelectedVersion
                ? React.createElement(Check, { width: 16, height: 16, strokeWidth: 2.5 })
                : null
            ),
            React.createElement("button", {
              type: "button",
              className: "playground-metronome-publish-row-main",
              disabled: isBusy || isSelectedVersion || !onSelectVersion,
              onClick: handleSelect,
            },
              React.createElement("div", { className: "playground-metronome-publish-row-title" },
                React.createElement("span", null, versionTitle),
                isActiveVersion
                  ? React.createElement("span", { className: "playground-metronome-publish-active-chip" },
                      React.createElement(Check, { width: 11, height: 11, strokeWidth: 2 }),
                      React.createElement("span", null, props.activeLabel || "Published")
                    )
                  : null
              ),
              versionDescription
                ? React.createElement("div", { className: "playground-metronome-publish-row-description" }, versionDescription)
                : null,
              versionMeta
                ? React.createElement("div", { className: "playground-metronome-publish-row-copy playground-metronome-publish-row-meta" }, versionMeta)
                : null
            ),
            React.createElement("div", { className: "playground-metronome-publish-row-actions" },
              isActiveVersion || typeof props.onPublishVersion !== "function"
                ? null
                : React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-secondary-button playground-metronome-publish-row-action",
                    disabled: isBusy,
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      props.onPublishVersion(versionId, version);
                    },
                  },
                    React.createElement(Rocket, { width: 13, height: 13, strokeWidth: 1.8 }),
                    React.createElement("span", null, props.rowPublishLabel || "Publish")
                  ),
              rowMenuItems.length
                ? React.createElement("span", { className: "playground-metronome-publish-row-menu-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-publish-row-menu-trigger" + (openMenuId === versionId ? " is-open" : ""),
                      disabled: isBusy,
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onOpenMenuIdChange((current) => String(current || "") === versionId ? "" : versionId);
                      },
                      "aria-label": "Version options",
                      "aria-expanded": openMenuId === versionId ? "true" : "false",
                    }, React.createElement(EllipsisVertical, { width: 15, height: 15, strokeWidth: 1.8 })),
                    openMenuId === versionId
                      ? React.createElement("div", {
                          className: "playground-metronome-publish-row-menu",
                          role: "menu",
                          onClick: (event) => event.stopPropagation(),
                        },
                          rowMenuItems.map((item) => {
                            const Icon = item.icon || SquarePen;
                            return React.createElement("button", {
                              key: item.id || item.label,
                              type: "button",
                              className: "playground-metronome-publish-row-menu-item" + (item.danger ? " is-danger" : ""),
                              onClick: (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onOpenMenuIdChange("");
                                item.onClick(versionId, version);
                              },
                            },
                              React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("span", null, item.label || "Action")
                            );
                          })
                        )
                      : null
                  )
                : null
            )
          );
        };

        const renderHeaderMenu = () => {
          if (!headerMenuActions.length || typeof renderPlaygroundPlatformPopup !== "function") {
            return null;
          }
          const headerMenuDisabled = Boolean(props.headerMenuDisabled) || isBusy;
          return renderPlaygroundPlatformPopup({
            open: headerMenuOpen,
            shellRef: headerMenuRef,
            shellClassName: "playground-metronome-publish-sidebar-header-menu-shell",
            menuClassName: "playground-agents-detail-publish-menu playground-metronome-publish-sidebar-header-menu",
            trigger: React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-metronome-publish-sidebar-header-menu-trigger" + (headerMenuOpen ? " is-open" : ""),
                disabled: headerMenuDisabled,
                onClick: (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onHeaderMenuOpenChange(!headerMenuOpen);
                },
                "aria-label": props.headerMenuLabel || "Version actions",
                "aria-haspopup": "menu",
                "aria-expanded": headerMenuOpen ? "true" : "false",
              },
              React.createElement(EllipsisVertical, { width: 15, height: 15, strokeWidth: 1.9 })
            ),
            menuProps: {
              role: "menu",
              onClick: (event) => event.stopPropagation(),
            },
            children: React.createElement(React.Fragment, null,
              headerMenuActions.map((action) => {
                const Icon = action.Icon || action.icon || SquarePen;
                const isActionDisabled = headerMenuDisabled || Boolean(action.disabled);
                return React.createElement("button", {
                    key: action.id || action.label,
                    type: "button",
                    className: "tb-popup-row" + (action.danger ? " is-danger" : ""),
                    role: "menuitem",
                    disabled: isActionDisabled,
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (isActionDisabled) {
                        return;
                      }
                      onHeaderMenuOpenChange(false);
                      void action.onClick();
                    },
                  },
                  React.createElement(Icon, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.15 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, action.label || "Action")
                  ),
                  action.shortcut
                    ? React.createElement("span", {
                        className: "playground-agents-detail-publish-menu-shortcut playground-metronome-publish-sidebar-header-menu-shortcut",
                        "aria-hidden": "true",
                      }, action.shortcut)
                    : null
                );
              })
            )
          });
        };

        return React.createElement("aside", {
            className,
            "aria-hidden": props.open === false ? "true" : "false",
          },
          React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-metronome-inspector-header" },
            React.createElement("div", { className: "playground-tasks-detail-navbar-title playground-metronome-inspector-navbar-title" },
              React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                React.createElement("div", { className: "playground-content-title playground-tasks-detail-navbar-title-input playground-metronome-inspector-title-input" }, title)
              )
            ),
            React.createElement("div", { className: "playground-content-nav-center" }),
            renderHeaderMenu(),
            React.createElement("button", {
              type: "button",
              className: "playground-files-header-icon-button is-plain playground-metronome-inspector-close",
              onClick: props.onClose,
              "aria-label": "Close versions",
            }, React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 }))
          ),
          React.createElement("div", { className: "playground-metronome-inspector-body" },
            React.createElement("div", { className: "playground-metronome-publish-sidebar-section-title" },
              React.createElement("span", { className: "playground-metronome-publish-sidebar-section-title-text" }, sectionTitle),
              React.createElement("span", { className: "playground-metronome-publish-title-actions" },
                typeof props.onSaveVersion === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-metronome-publish-version-button",
                      disabled: isBusy,
                      onClick: props.onSaveVersion,
                    },
                      React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, props.saveVersionLabel || "Version")
                    )
                  : null,
                props.titleActionsExtra || null
              )
            ),
            renderStateContent(),
            React.createElement("div", { className: "playground-metronome-publish-list-container" },
              React.createElement("div", { className: "playground-metronome-publish-list" },
                versions.length ? versions.map(renderVersionRow) : renderEmptyState()
              )
            ),
            props.versionsSectionFooter || null
          ),
          hasFooterActions
            ? React.createElement("div", { className: "playground-metronome-publish-sidebar-actions" },
                typeof props.onPublishCurrent === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-primary-button playground-metronome-publish-new-button",
                      disabled: isBusy,
                      onClick: props.onPublishCurrent,
                    },
                      React.createElement(Rocket, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, isBusy ? (props.busyPublishCurrentLabel || "Publishing...") : (props.publishCurrentLabel || "Publish current editor"))
                    )
                  : null,
                typeof props.onUnpublishActive === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-secondary-button playground-metronome-publish-new-button",
                      disabled: isBusy,
                      onClick: props.onUnpublishActive,
                    },
                      React.createElement(PauseCircle, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, isBusy ? (props.busyUnpublishLabel || "Working...") : (props.unpublishLabel || "Unpublish"))
                    )
                  : null
              )
            : null
        );
      }
`;
