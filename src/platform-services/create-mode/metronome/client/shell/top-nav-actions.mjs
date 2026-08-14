export const METRONOME_APP_TOP_NAV_ACTIONS_SCRIPT = `
	        function formatMetronomeHeaderTimestamp(value) {
	          if (!value) return "-";
	          const date = new Date(value);
	          if (Number.isNaN(date.getTime())) return "-";
	          return date.toLocaleString(undefined, {
	            month: "short",
	            day: "numeric",
	            year: "numeric",
	            hour: "2-digit",
	            minute: "2-digit",
	          });
	        }

	        function invokeMetronomeHeaderAction(actionName) {
	          setMetronomeTopNavMenuOpen(false);
	          setMetronomeTopNavPublishMenuOpen(false);
	          const action = metronomeTopNavActionsRef.current?.[actionName];
	          if (typeof action === "function") {
	            return action();
	          }
	          return undefined;
	        }

	        function renderMetronomeBreadcrumbActions() {
	          const state = metronomeTopNavState && metronomeTopNavState.mode === "editor"
	            ? metronomeTopNavState
	            : null;
	          if (!state) {
	            return null;
	          }
	          const title = String(state.title || "").trim() || "Untitled Metronome";
	          const workflowId = String(state.workflowId || "").trim();
	          const isBusy = Boolean(state.versionsBusy);
	          const isReadOnly = Boolean(state.readOnly);
	          const canOpenHistory = Boolean(state.showVersions)
	            && typeof metronomeTopNavActionsRef.current?.openVersionHistory === "function";
	          const canShareWithTeam = !isReadOnly
	            && typeof metronomeTopNavActionsRef.current?.share === "function";
	          const informationItems = [
	            workflowId
	              ? {
	                  id: "id",
	                  label: "ID",
	                  value: workflowId,
	                  title: workflowId,
	                  monospace: true,
	                  copyValue: workflowId,
	                  copyAriaLabel: "Copy Metronome workflow ID",
	                }
	              : null,
	            state.createdAt
	              ? { id: "created", label: "Created", value: formatMetronomeHeaderTimestamp(state.createdAt) }
	              : null,
	            state.updatedAt
	              ? { id: "updated", label: "Updated", value: formatMetronomeHeaderTimestamp(state.updatedAt) }
	              : null,
	          ].filter(Boolean);

	          return React.createElement(PlatformResourceHeaderActions, {
	              className: "playground-metronome-breadcrumb-actions",
	            },
	            state.showVersions
	              ? React.createElement(PlatformResourceVersionLabel, {
	                  resourceLabel: "Metronome workflow",
	                  version: state.versionNumber ?? 0,
	                  isLatest: Boolean(state.versionIsLatest),
	                  className: "playground-metronome-breadcrumb-version-label",
	                  disabled: isBusy || !canOpenHistory,
	                  onOpenVersionHistory: () => {
	                    if (isBusy || !canOpenHistory) return;
	                    invokeMetronomeHeaderAction("openVersionHistory");
	                  },
	                })
	              : null,
	            React.createElement(PlatformResourceActionsMenu, {
	                open: metronomeTopNavMenuOpen,
	                onOpenChange: (nextOpen) => {
	                  if (nextOpen) {
	                    setMetronomeTopNavPublishMenuOpen(false);
	                  }
	                  setMetronomeTopNavMenuOpen(nextOpen);
	                },
	                resourceLabel: "Metronome workflow",
	                disabled: isBusy,
	                shortcutActions: isReadOnly
	                  ? {}
	                  : {
	                      ...(canShareWithTeam
	                        ? { share: { onInvoke: () => invokeMetronomeHeaderAction("share") } }
	                        : {}),
	                      rename: { onInvoke: () => invokeMetronomeHeaderAction("rename") },
	                      delete: { onInvoke: () => invokeMetronomeHeaderAction("delete") },
	                    },
	              },
	              informationItems.length
	                ? React.createElement(PlatformResourceActionsInformation, {
	                    resourceLabel: "Metronome workflow",
	                    items: informationItems,
	                  })
	                : null,
	              canOpenHistory
	                ? React.createElement(PlatformResourceVersionHistoryMenuItem, {
	                    onClick: () => invokeMetronomeHeaderAction("openVersionHistory"),
	                  })
	                : null,
	              informationItems.length || canOpenHistory
	                ? React.createElement(PlatformResourceActionsDivider, null)
	                : null,
	              canShareWithTeam
	                ? React.createElement(PlatformResourceActionMenuItem, {
	                    icon: React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                    label: "Share with Team",
	                    shortcut: "share",
	                    onClick: () => invokeMetronomeHeaderAction("share"),
	                  })
	                : null,
	              React.createElement(PlatformResourceActionMenuItem, {
	                icon: React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                label: "Duplicate",
	                onClick: () => invokeMetronomeHeaderAction("duplicate"),
	              }),
	              !isReadOnly ? React.createElement(PlatformResourceActionsDivider, null) : null,
	              !isReadOnly
	                ? React.createElement(PlatformResourceActionMenuItem, {
	                    icon: React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                    label: "Rename",
	                    shortcut: "rename",
	                    onClick: () => invokeMetronomeHeaderAction("rename"),
	                  })
	                : null,
	              !isReadOnly
	                ? React.createElement(PlatformResourceActionMenuItem, {
	                    icon: React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
	                    label: "Delete",
	                    shortcut: "delete",
	                    danger: true,
	                    onClick: () => invokeMetronomeHeaderAction("delete"),
	                  })
	                : null
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
	          const showPublishControl = !state.readOnly
	            && state.showPublish
	            && (state.editorMode === "edit" || state.editorMode === "code" || state.editorMode === "settings");
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
	          return showPublishControl
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
	            : null;
	        }

`;
