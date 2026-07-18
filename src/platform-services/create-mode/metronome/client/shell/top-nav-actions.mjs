export const METRONOME_APP_TOP_NAV_ACTIONS_SCRIPT = `
        function renderMetronomeBreadcrumbVersionSelector() {
          const state = metronomeTopNavState && metronomeTopNavState.mode === "editor"
            ? metronomeTopNavState
            : null;
          if (!state || state.readOnly || !state.showVersions) {
            return null;
          }
          const versions = Array.isArray(state.versions) ? state.versions : [];
          const isBusy = Boolean(state.versionsBusy);
          return React.createElement(PlatformPopup, {
            open: metronomeBreadcrumbVersionMenuOpen,
            variant: "minimal",
            rootRef: metronomeBreadcrumbVersionMenuRef,
            rootClassName: "playground-metronome-breadcrumb-version-selector",
            surfaceClassName: "playground-agents-detail-publish-menu playground-agents-detail-version-selector-menu playground-metronome-detail-version-selector-menu playground-metronome-breadcrumb-version-menu",
            surfaceProps: {
              role: "menu",
              "aria-label": "Choose Metronome version",
              width: 284,
              maxHeight: "min(340px, calc(100vh - 96px))",
            },
            animation: "down-in",
            trigger: React.createElement("button", {
              type: "button",
              className: "playground-metronome-breadcrumb-version-trigger" + (metronomeBreadcrumbVersionMenuOpen ? " is-active" : ""),
              disabled: isBusy,
              "aria-label": "Choose Metronome version",
              "aria-haspopup": "menu",
              "aria-expanded": metronomeBreadcrumbVersionMenuOpen ? "true" : "false",
              onClick: () => {
                setMetronomeTopNavMenuOpen(false);
                setMetronomeTopNavPublishMenuOpen(false);
                setMetronomeBreadcrumbVersionMenuOpen((current) => !current);
              },
            },
              React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
            ),
          },
            React.createElement(React.Fragment, null,
              React.createElement("div", {
                className: "playground-agents-detail-version-selector-list playground-metronome-detail-version-selector-list",
                role: "group",
                "aria-label": "Metronome versions",
              },
                versions.length
                  ? versions.map((version) => React.createElement("button", {
                      key: version.id,
                      type: "button",
                      className: "tb-popup-row playground-agents-detail-version-selector-option" + (version.selected ? " is-selected" : ""),
                      role: "menuitemradio",
                      "aria-checked": version.selected ? "true" : "false",
                      disabled: isBusy || version.selected,
                      onClick: () => {
                        if (isBusy || version.selected) return;
                        setMetronomeBreadcrumbVersionMenuOpen(false);
                        metronomeTopNavActionsRef.current?.selectVersion?.(version.id);
                      },
                    },
                    React.createElement("span", { className: "playground-agents-detail-version-selector-option-check" },
                      version.selected
                        ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 2.2 })
                        : null
                    ),
                    React.createElement("span", { className: "playground-agents-detail-version-selector-option-copy" },
                      React.createElement("span", { className: "playground-agents-detail-version-selector-option-title" }, version.title),
                      React.createElement("span", { className: "playground-agents-detail-version-selector-option-meta" }, version.meta)
                    )
                  ))
                  : React.createElement("div", { className: "playground-agents-detail-version-selector-empty" },
                      state.versionsLoading
                        ? "Loading versions..."
                        : state.versionsError || "No versions yet."
                    )
              ),
              React.createElement("div", {
                className: "playground-agents-detail-version-selector-footer playground-metronome-detail-version-selector-footer",
              },
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-agents-detail-version-selector-new-button",
                  role: "menuitem",
                  disabled: isBusy,
                  onClick: () => {
                    if (isBusy) return;
                    setMetronomeBreadcrumbVersionMenuOpen(false);
                    metronomeTopNavActionsRef.current?.createVersion?.();
                  },
                },
                  React.createElement(GitBranchPlus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.1 }),
                  React.createElement("span", null, "New Version")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-agents-detail-version-selector-new-button",
                  role: "menuitem",
                  disabled: isBusy || state.versionsLoading || !versions.length,
                  onClick: () => {
                    if (isBusy || state.versionsLoading || !versions.length) return;
                    setMetronomeBreadcrumbVersionMenuOpen(false);
                    metronomeTopNavActionsRef.current?.openVersionHistory?.();
                  },
                },
                  React.createElement(History, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.1 }),
                  React.createElement("span", null, "Version history")
                )
              )
            )
          );
        }

        function renderMetronomeTopNavActions() {
          const state = metronomeTopNavState && metronomeTopNavState.mode === "editor"
            ? metronomeTopNavState
            : null;
          if (!state) {
            return null;
          }
          const isReadOnly = Boolean(state.readOnly);
          const canShareWithTeam = !isReadOnly && typeof metronomeTopNavActionsRef.current?.share === "function";
          const menuRows = isReadOnly
            ? [
                { id: "duplicate", label: "Duplicate", icon: Copy, action: () => metronomeTopNavActionsRef.current?.duplicate?.() },
              ]
            : [
                { id: "rename", label: "Edit", icon: SquarePen, action: () => metronomeTopNavActionsRef.current?.rename?.() },
                { id: "duplicate", label: "Duplicate", icon: Copy, action: () => metronomeTopNavActionsRef.current?.duplicate?.() },
                ...(canShareWithTeam
                  ? [{ id: "share", label: "Share with Team", icon: UsersRound, action: () => metronomeTopNavActionsRef.current?.share?.() }]
                  : []),
                { id: "delete", label: "Delete", icon: Trash2, action: () => metronomeTopNavActionsRef.current?.delete?.(), danger: true },
              ];
          const workflowId = String(state.workflowId || "").trim();
          const showPublishControl = !isReadOnly
            && state.showPublish
            && (state.editorMode === "edit" || state.editorMode === "code");
          const publishBusy = Boolean(state.publishBusy);
          const publishDisabled = Boolean(state.publishDisabled);
          const publishActions = [
            {
              id: "save-new",
              label: "Save to new Version",
              Icon: GitBranchPlus,
              shortcut: "⇧⌘S",
              disabled: publishDisabled,
              action: () => metronomeTopNavActionsRef.current?.createVersion?.(),
            },
            {
              id: "revert",
              label: "Revert to last saved Version",
              Icon: Undo2,
              disabled: publishBusy || !state.canRevertVersion,
              action: () => metronomeTopNavActionsRef.current?.revertVersion?.(),
            },
          ];
          return React.createElement(React.Fragment, null,
            showPublishControl
              ? React.createElement(PlatformButtonSelector, {
                  mode: "split-action",
                  buttonVariant: "primary",
                  buttonSize: "small",
                  open: metronomeTopNavPublishMenuOpen,
                  onOpenChange: (nextOpen) => {
                    if (nextOpen) {
                      setMetronomeTopNavMenuOpen(false);
                      setMetronomeBreadcrumbVersionMenuOpen(false);
                    }
                    setMetronomeTopNavPublishMenuOpen(nextOpen);
                  },
                  onAction: () => {
                    setMetronomeTopNavPublishMenuOpen(false);
                    return metronomeTopNavActionsRef.current?.publish?.();
                  },
                  label: "Save & Publish",
                  leading: React.createElement(Rocket, { strokeWidth: 1.8 }),
                  actionAriaLabel: "Save and publish Metronome changes",
                  popupAriaLabel: "Version save options",
                  actionDisabled: publishDisabled,
                  popupDisabled: publishDisabled,
                  active: metronomeTopNavPublishMenuOpen,
                  popupAlignment: "right",
                  popupRole: "menu",
                  popupWidth: 268,
                  popupMaxHeight: "min(260px, calc(100vh - 96px))",
                  className: "playground-metronome-detail-publish-selector",
                  popupClassName: "playground-agents-detail-publish-menu playground-metronome-detail-publish-menu",
                },
                  publishActions.map((action) => React.createElement("button", {
                    key: action.id,
                    type: "button",
                    className: "tb-popup-row",
                    role: "menuitem",
                    disabled: action.disabled,
                    onClick: () => {
                      if (action.disabled) return;
                      setMetronomeTopNavPublishMenuOpen(false);
                      action.action();
                    },
                  },
                    React.createElement(action.Icon, {
                      className: "tb-popup-icon",
                      width: 14,
                      height: 14,
                      strokeWidth: 2.15,
                    }),
                    React.createElement("span", null, action.label),
                    action.shortcut
                      ? React.createElement("span", {
                          className: "playground-agents-detail-publish-menu-shortcut",
                          "aria-hidden": "true",
                        }, action.shortcut)
                      : null
                  ))
                )
              : null,
            React.createElement("div", { className: "playground-metronome-top-nav-menu-shell", ref: metronomeTopNavMenuRef },
              React.createElement("button", {
                type: "button",
                className: "playground-top-nav-private-chat-button playground-metronome-top-nav-menu-trigger" + (metronomeTopNavMenuOpen ? " is-active" : ""),
                "aria-label": "Metronome actions",
                "aria-expanded": metronomeTopNavMenuOpen ? "true" : "false",
                onClick: () => {
                  setMetronomeTopNavPublishMenuOpen(false);
                  setMetronomeBreadcrumbVersionMenuOpen(false);
                  setMetronomeTopNavMenuOpen((current) => !current);
                },
              },
                React.createElement(Ellipsis, { strokeWidth: 1.8 })
              ),
              metronomeTopNavMenuOpen
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-metronome-top-nav-menu" },
                    workflowId
                      ? React.createElement("div", { className: "playground-metronome-top-nav-menu-id" },
                          React.createElement("span", null, "Workflow ID"),
                          React.createElement("code", null, workflowId)
                        )
                      : null,
                    menuRows.map((row) => {
                      const Icon = row.icon;
                      return React.createElement("button", {
                        key: row.id,
                        type: "button",
                        className: "tb-popup-row" + (row.danger ? " is-danger" : ""),
                        onClick: () => {
                          setMetronomeTopNavMenuOpen(false);
                          row.action();
                        },
                      },
                        React.createElement(Icon, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, row.label)
                      );
                    })
                  )
                : null
            )
          );
        }

`;
