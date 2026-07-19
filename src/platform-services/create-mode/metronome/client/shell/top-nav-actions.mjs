export const METRONOME_APP_TOP_NAV_ACTIONS_SCRIPT = `
        function renderMetronomeBreadcrumbVersionSelector() {
          const state = metronomeTopNavState && metronomeTopNavState.mode === "editor"
            ? metronomeTopNavState
            : null;
          if (!state || !state.showVersions) {
            return null;
          }
          const isBusy = Boolean(state.versionsBusy);
          const title = String(state.title || "").trim() || "Untitled Metronome";
          const canOpenHistory = typeof metronomeTopNavActionsRef.current?.openVersionHistory === "function";
          return React.createElement(PlatformVersionLabel, {
            version: state.versionNumber ?? 0,
            qualifier: state.versionIsLatest ? "Latest" : null,
            className: "playground-metronome-breadcrumb-version-label",
            disabled: isBusy || !canOpenHistory,
            "aria-label": "Open version history for " + title + ", "
              + formatPlatformVersionLabel(state.versionNumber ?? 0),
            onClick: () => {
              if (isBusy || !canOpenHistory) return;
              setMetronomeTopNavMenuOpen(false);
              setMetronomeTopNavPublishMenuOpen(false);
              metronomeTopNavActionsRef.current?.openVersionHistory?.();
            },
          });
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
              id: "revert",
              label: "Revert Changes",
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
                    }
                    setMetronomeTopNavPublishMenuOpen(nextOpen);
                  },
                  onAction: () => {
                    setMetronomeTopNavPublishMenuOpen(false);
                    return metronomeTopNavActionsRef.current?.publish?.();
                  },
                  label: "Save Changes",
                  leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
                  actionAriaLabel: "Save Metronome changes",
                  popupAriaLabel: "Metronome change options",
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
