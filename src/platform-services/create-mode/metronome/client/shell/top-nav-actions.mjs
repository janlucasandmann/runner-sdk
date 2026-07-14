export const METRONOME_APP_TOP_NAV_ACTIONS_SCRIPT = `
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
          return React.createElement(React.Fragment, null,
            isReadOnly
              ? null
              : React.createElement("button", {
                  type: "button",
                  className: "playground-top-nav-private-chat-button",
                  onClick: () => metronomeTopNavActionsRef.current?.run?.(),
                },
                  React.createElement(Play, { strokeWidth: 1.8 }),
                  React.createElement("span", null, "Run")
                ),
            React.createElement("div", { className: "playground-metronome-top-nav-menu-shell", ref: metronomeTopNavMenuRef },
              React.createElement("button", {
                type: "button",
                className: "playground-top-nav-private-chat-button playground-metronome-top-nav-menu-trigger" + (metronomeTopNavMenuOpen ? " is-active" : ""),
                "aria-label": "Metronome actions",
                "aria-expanded": metronomeTopNavMenuOpen ? "true" : "false",
                onClick: () => setMetronomeTopNavMenuOpen((current) => !current),
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
