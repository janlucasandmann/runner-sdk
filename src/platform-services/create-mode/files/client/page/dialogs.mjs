export const FILES_PAGE_DIALOGS_SCRIPT = `
        function renderFileChatEmptyState() {
          if (!activePreviewEntry || activePreviewEntry.isFolder) {
            return null;
          }

          const infoRows = [
            ["Created", formatPlaygroundFileDate(activePreviewEntry.createdTime || activePreviewEntry.modifiedTime)],
            ["Modified", formatPlaygroundFileDate(activePreviewEntry.modifiedTime)],
            ["Size", formatPlaygroundFileSize(activePreviewEntry.size)],
            ["Type", formatPlaygroundFileTypeLabel(activePreviewEntry)],
          ];

          return React.createElement("div", { className: "playground-files-chat-empty-state" },
            React.createElement("div", { className: "playground-files-preview-info playground-files-chat-empty-info" },
              React.createElement("div", { className: "playground-files-preview-info-title" }, "Information"),
              infoRows.map(([label, value]) =>
                React.createElement("div", { key: label, className: "playground-files-preview-info-row" },
                  React.createElement("span", null, label),
                  React.createElement("span", null, value)
                )
              )
            ),
            React.createElement("div", { className: "playground-files-preview-actions playground-files-chat-empty-actions" },
              singleSelectedEntryDownloadUrl
                ? React.createElement("a", {
                    className: "playground-files-preview-button is-primary",
                    href: singleSelectedEntryDownloadUrl,
                    download: activePreviewEntry.name,
                  },
                    React.createElement(Download, { width: 12, height: 12, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Download")
                  )
                : null,
              React.createElement("div", { className: "playground-files-preview-action-row" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-preview-button",
                  onClick: () => startRename(activePreviewEntry),
                },
                  React.createElement(SquarePen, { width: 12, height: 12, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Rename")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-preview-button is-danger",
                  onClick: () => void handleDeleteEntries([activePreviewEntry]),
                },
                  React.createElement(Trash2, { width: 12, height: 12, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Delete")
                )
              )
            )
          );
        }

        function renderContextMenu() {
          if (!contextMenu) return null;
          const isMultiFileContext = Boolean(contextMenu.multiFileSelection && selectedFileEntries.length > 1);
          const contextSelectedEntries = contextTargetEntry
            ? (
                selectedEntries.some((entry) => normalizeHistoryPath(entry.path) === normalizeHistoryPath(contextTargetEntry.path))
                  ? selectedEntries
                  : [contextTargetEntry]
              )
            : selectedEntries;
          const contextSelectedFileEntries = isMultiFileContext
            ? selectedFileEntries
            : contextSelectedEntries.filter((entry) => entry && !entry.isFolder);
          const hasRenameAction = contextSelectedEntries.length === 1 && Boolean(contextTargetEntry);
          const canDelete = contextSelectedEntries.length > 0;
          const basePath = getMoveTargetPathForContext();
          const canToggleProjectAssignment = Boolean(contextTargetEntry && !contextTargetEntry.isFolder);
          const isProjectMutationPending = Boolean(
            contextTargetEntry
            && fileProjectMutationState.path === normalizeHistoryPath(contextTargetEntry.path)
            && fileProjectMutationState.action.startsWith("project-")
          );
          const isComputerSendPending = Boolean(fileComputerTransferState.action === "send");
          const isTeamSharePending = Boolean(fileTeamShareState.action === "share");
          const isFileContextTarget = Boolean(contextTargetEntry && !contextTargetEntry.isFolder);
          const isFolderContextTarget = Boolean(contextTargetEntry && contextTargetEntry.isFolder);
          const contextMenuAnimationClass = contextMenuPhase === "exit"
            ? " account-menu-animate-up-out"
            : " account-menu-animate-up-in";
          const isMinimalContextMenu = contextMenu.popupVariant === "minimal";

          const contextMenuContent = React.createElement(React.Fragment, null,
              isMultiFileContext
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-files-context-title" }, selectedFileEntries.length + " files selected"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => void handleDownloadEntries(contextSelectedFileEntries),
                    },
                      React.createElement(Download, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Download")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => openFileProjectPickerDialog(contextSelectedFileEntries),
                    },
                      React.createElement(FolderOpen, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Add to Project")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      disabled: isComputerSendPending || availableDestinationComputers.length === 0,
                      onClick: () => openFileComputerPickerDialog(contextSelectedFileEntries),
                    },
                      React.createElement(Monitor, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, isComputerSendPending ? "Sending..." : "Send to Computer")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      disabled: isTeamSharePending,
                      onClick: () => openFileTeamPickerDialog(contextSelectedFileEntries),
                    },
                      React.createElement(UsersRound, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, isTeamSharePending ? "Sharing..." : "Share with Team")
                    ),
                    React.createElement("div", { className: "playground-files-context-divider" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-context-item is-danger",
                        onClick: () => void handleDeleteEntries(contextSelectedFileEntries),
                      },
                        React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Delete")
                      )
                    )
                  )
                : null,
              !isMultiFileContext && isFileContextTarget
                ? React.createElement(React.Fragment, null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => startRename(contextTargetEntry, { showPreview: false }),
                    },
                      React.createElement(SquarePen, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Rename")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => handleDownloadEntry(contextTargetEntry),
                    },
                      React.createElement(Download, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Download")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => {
                        void handleCopyEntry(contextTargetEntry);
                      },
                    },
                      React.createElement(Copy, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Copy")
                    ),
                    canToggleProjectAssignment
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-files-context-item",
                          disabled: isProjectMutationPending,
                          onClick: () => {
                            if (contextTargetAttachmentProjectId) {
                              void handleRemoveFileFromProject(contextTargetEntry, contextTargetAttachmentProjectId);
                              return;
                            }
                            openFileProjectPickerDialog(contextTargetEntry);
                          },
                        },
                          React.createElement(FolderOpen, { width: 13, height: 13, strokeWidth: 1.8 }),
                          React.createElement("span", null,
                            isProjectMutationPending
                              ? (contextTargetAttachmentProjectId ? "Removing..." : "Saving...")
                              : (contextTargetAttachmentProjectId ? "Remove from Project" : "Add to Project")
                          )
                        )
                      : null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      disabled: isComputerSendPending || availableDestinationComputers.length === 0,
                      onClick: () => openFileComputerPickerDialog(contextTargetEntry),
                    },
                      React.createElement(Monitor, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, isComputerSendPending ? "Sending..." : "Send to Computer")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      disabled: isTeamSharePending,
                      onClick: () => openFileTeamPickerDialog(contextTargetEntry),
                    },
                      React.createElement(UsersRound, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, isTeamSharePending ? "Sharing..." : "Share with Team")
                    ),
                    canDelete
                      ? React.createElement("div", { className: "playground-files-context-divider" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-files-context-item is-danger",
                            onClick: () => void handleDeleteEntries(contextSelectedEntries),
                          },
                            React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Delete")
                          )
                        )
                      : null
                  )
                : null,
              !isMultiFileContext && !isFileContextTarget
                ? React.createElement(React.Fragment, null,
                    hasRenameAction
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-files-context-item",
                          onClick: () => startRename(contextTargetEntry, { showPreview: false }),
                        },
                          React.createElement(SquarePen, { width: 13, height: 13, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Rename")
                        )
                      : null,
                    isFolderContextTarget
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-files-context-item",
                          onClick: () => handleDownloadEntry(contextTargetEntry),
                        },
                          React.createElement(Download, { width: 13, height: 13, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Download")
                        )
                      : null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => {
                        closeContextMenu();
                        void handleCreateFolder(basePath);
                      },
                    },
                      React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "New Folder")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-context-item",
                      onClick: () => {
                        closeContextMenu();
                        openUploadPicker(basePath);
                      },
                    },
                      React.createElement(ArrowUpFromLine, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Upload Files")
                    ),
                    canDelete
                      ? React.createElement("div", { className: "playground-files-context-divider" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-files-context-item is-danger",
                            onClick: () => void handleDeleteEntries(contextSelectedEntries),
                          },
                            React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }),
                            React.createElement("span", null, contextSelectedEntries.length > 1 ? "Delete " + contextSelectedEntries.length + " Items" : "Delete")
                          )
                        )
                      : null
                  )
                : null
          );
          const contextMenuSurface = isMinimalContextMenu
            ? React.createElement(PlatformPopup, {
                open: true,
                variant: "minimal",
                portal: true,
                placement: "bottom-end",
                portalOffset: 8,
                portalAnchorPoint: contextMenu.anchorPoint || {
                  x: contextMenu.x + 264,
                  y: Math.max(0, contextMenu.y - 8),
                },
                animation: contextMenuPhase === "exit" ? "down-out" : "down-in",
                rootClassName: "playground-files-context-menu-anchor",
                surfaceClassName: "playground-files-context-menu",
                surfaceProps: {
                  role: "menu",
                  width: 264,
                  onClick: (event) => event.stopPropagation(),
                },
              }, contextMenuContent)
            : React.createElement(PlatformPopupSurface, {
                className: "playground-files-context-menu" + contextMenuAnimationClass,
                style: {
                  left: contextMenu.x + "px",
                  top: contextMenu.y + "px",
                },
              }, contextMenuContent);

          return React.createElement(React.Fragment, null,
            React.createElement(PlatformPopupDismissLayer, {
              className: "playground-files-context-backdrop",
              style: isMinimalContextMenu ? { zIndex: 10059 } : undefined,
              onClick: closeContextMenu,
              onContextMenu: (event) => {
                event.preventDefault();
                closeContextMenu();
              },
            }),
            contextMenuSurface
          );
        }

        function renderFileProjectPickerModal() {
          if (!fileProjectPickerState) {
            return null;
          }

          const isProjectAssignPending = fileProjectMutationState.action === "project-add"
            && fileProjectMutationState.path === fileProjectPickerState.path;

          return React.createElement(PlatformModalBackdrop, {
              className: "sidebar-thread-rename-scrim",
              onClick: closeFileProjectPickerDialog,
            },
              React.createElement(PlatformModalSurface, {
                as: "form",
                className: "sidebar-thread-rename-modal sidebar-thread-project-picker-modal",
                onClick: (event) => event.stopPropagation(),
                onSubmit: (event) => {
                  void handleFileProjectPickerSubmit(event);
                },
              },
                React.createElement("div", { className: "sidebar-thread-rename-title" }, "Add to Project"),
                React.createElement("div", { className: "sidebar-thread-rename-copy" },
                  "Attach ",
                  React.createElement("strong", null, fileProjectPickerState.title || "this file"),
                  " to a project. If the project uses a different environment, the file will be cloned into that workspace first."
                ),
                availableProjectFilters.length > 0
                  ? React.createElement("div", { className: "sidebar-thread-project-picker-list" },
                      availableProjectFilters.map((project) => {
                        const projectId = String(project?.id || "").trim();
                        const isSelected = projectId === fileProjectPickerValue;
                        return React.createElement("button", {
                            key: projectId,
                            type: "button",
                            className: "sidebar-thread-project-picker-row" + (isSelected ? " is-selected" : ""),
                            disabled: isProjectAssignPending,
                            onClick: () => setFileProjectPickerValue(projectId),
                          },
                            React.createElement("div", { className: "playground-tasks-project-row" },
                              React.createElement("div", { className: "playground-tasks-project-row-main" },
                                React.createElement("div", { className: "playground-tasks-project-row-title" }, project?.name || "Untitled Project")
                              )
                            )
                          );
                      })
                    )
                  : React.createElement("div", { className: "sidebar-thread-project-picker-empty" },
                      "No projects are available yet."
                    ),
                fileProjectPickerError
                  ? React.createElement("div", { className: "sidebar-thread-rename-error" }, fileProjectPickerError)
                  : null,
                React.createElement("div", { className: "sidebar-thread-rename-actions" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "large",
                    type: "button",
                    className: "sidebar-thread-rename-button is-secondary",
                    onClick: closeFileProjectPickerDialog,
                    disabled: isProjectAssignPending,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "large",
                    type: "submit",
                    className: "sidebar-thread-rename-button is-primary",
                    disabled: isProjectAssignPending || availableProjectFilters.length === 0 || !fileProjectPickerValue,
                  }, isProjectAssignPending ? "Saving..." : "Add to Project")
                )
              )
            );
        }

        function renderFileComputerPickerModal() {
          if (!fileComputerPickerState) {
            return null;
          }

          const isComputerSendPending = fileComputerTransferState.action === "send"
            && fileComputerTransferState.path === fileComputerPickerState.path;
          const selectedDestinationComputer = availableDestinationComputers.find((environment) =>
            String(environment?.id || "").trim() === String(fileComputerPickerValue || "").trim()
          ) || null;
          const selectedDestinationTitle = String(
            selectedDestinationComputer?.name
            || selectedDestinationComputer?.label
            || ""
          ).trim() || "Select Computer";
          const selectedDestinationDescription = selectedDestinationComputer
            ? (String(selectedDestinationComputer?.id || "").trim() || "Computer")
            : (availableDestinationComputers.length > 0
              ? "Choose a destination computer"
              : "No other computers are available yet");
          const modalElement = React.createElement(PlatformModalBackdrop, {
              className: "playground-team-modal-backdrop playground-team-mission-modal-backdrop"
                + (fileComputerPickerVisible ? " is-visible" : "")
                + (fileComputerPickerClosing ? " is-closing" : ""),
              onClick: closeFileComputerPickerDialog,
            },
              React.createElement(PlatformModalSurface, {
                as: "form",
                className: "playground-team-modal playground-team-mission-modal is-share-resource"
                  + (fileComputerPickerVisible ? " is-visible" : "")
                  + (fileComputerPickerClosing ? " is-closing" : ""),
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "file-computer-picker-modal-title",
                onClick: (event) => event.stopPropagation(),
                onSubmit: (event) => {
                  void handleFileComputerPickerSubmit(event);
                },
              },
                React.createElement("div", { className: "playground-team-modal-header" },
                  React.createElement("div", null,
                    React.createElement("h2", { id: "file-computer-picker-modal-title", className: "playground-team-modal-title" }, "Send to Computer")
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-team-modal-close",
                    onClick: closeFileComputerPickerDialog,
                    disabled: isComputerSendPending,
                    "aria-label": "Close send to computer modal",
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                ),
                React.createElement("div", { className: "playground-team-share-picker" },
                  React.createElement("div", {
                      className: "playground-tasks-project-blueprint-section playground-tasks-toolbar-popup-shell playground-team-share-resource-selector"
                        + (fileComputerPickerOpen ? " is-open" : ""),
                    },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-project-blueprint-trigger",
                      onClick: () => setFileComputerPickerOpen((current) => !current),
                      disabled: isComputerSendPending || availableDestinationComputers.length === 0,
                      "aria-haspopup": "listbox",
                      "aria-expanded": fileComputerPickerOpen ? "true" : "false",
                    },
                      React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-main" },
                        React.createElement("span", {
                          className: "playground-tasks-project-blueprint-icon",
                          style: { "--project-blueprint-accent": "#ffffff" },
                          "aria-hidden": "true",
                        }, React.createElement(Monitor, { width: 15, height: 15, strokeWidth: 1.85 })),
                        React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-copy" },
                          React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-title" }, selectedDestinationTitle),
                          React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-description" }, selectedDestinationDescription)
                        )
                      ),
                      React.createElement(ChevronDown, { className: "playground-tasks-project-blueprint-chevron", strokeWidth: 1.8 })
                    ),
                    fileComputerPickerOpen
                      ? React.createElement(PlatformPopupSurface, {
                          className: "playground-tasks-toolbar-popup-menu playground-tasks-project-blueprint-popover playground-tasks-toolbar-popup-menu-animate-down-in",
                          role: "listbox",
                        },
                          React.createElement("div", { className: "playground-tasks-project-blueprint-grid" },
                            availableDestinationComputers.map((environment) => {
                              const environmentId = String(environment?.id || "").trim();
                              const environmentName = String(environment?.name || environment?.label || "Computer").trim() || "Computer";
                              const isSelected = environmentId && environmentId === fileComputerPickerValue;
                              return React.createElement("button", {
                                  key: environmentId,
                                  type: "button",
                                  className: "playground-tasks-project-blueprint-option" + (isSelected ? " is-active" : ""),
                                  onClick: () => {
                                    setFileComputerPickerValue(environmentId);
                                    setFileComputerPickerOpen(false);
                                  },
                                },
                                React.createElement("span", {
                                  className: "playground-tasks-project-blueprint-icon",
                                  style: { "--project-blueprint-accent": "#ffffff" },
                                  "aria-hidden": "true",
                                }, React.createElement(Monitor, { width: 15, height: 15, strokeWidth: 1.85 })),
                                React.createElement("span", { className: "playground-tasks-project-blueprint-copy" },
                                  React.createElement("span", { className: "playground-tasks-project-blueprint-title" }, environmentName),
                                  React.createElement("span", { className: "playground-tasks-project-blueprint-description" }, environmentId || "Computer")
                                )
                              );
                            })
                          )
                        )
                      : null
                  ),
                  fileComputerPickerError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, fileComputerPickerError)
                    : null,
                  React.createElement("div", { className: "playground-team-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-button",
                      onClick: closeFileComputerPickerDialog,
                      disabled: isComputerSendPending,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "playground-team-button is-primary",
                      disabled: isComputerSendPending || availableDestinationComputers.length === 0 || !fileComputerPickerValue,
                    }, isComputerSendPending ? "Sending..." : "Send")
                  )
                )
              )
            );

          return typeof document !== "undefined" && document.body
            ? createPortal(modalElement, document.body)
            : modalElement;
        }

        function renderFileTeamPickerModal() {
          if (!fileTeamPickerState) {
            return null;
          }

          const isTeamSharePending = fileTeamShareState.action === "share"
            && fileTeamShareState.path === fileTeamPickerState.path;
          return React.createElement(PlatformResourceShareModal, {
            open: fileTeamPickerVisible && !fileTeamPickerClosing,
            resourceLabel: "File",
            resourceName: fileTeamPickerState.title || "File",
            selectionMode: "multiple",
            teams: availableFileTeams.map((team) => ({
              id: String(team?.id || "").trim(),
              name: String(team?.name || "Team").trim() || "Team",
              roleLabel: String(team?.role || "").trim() || "Team",
              profileImageUrl: String(team?.profileImageUrl || "").trim(),
            })),
            selectedTeamIds: fileTeamPickerValues,
            onSelectedTeamIdsChange: (teamIds) => {
              setFileTeamPickerValues(teamIds);
              setFileTeamPickerError("");
            },
            onClose: closeFileTeamPickerDialog,
            onShareTeams: (teamIds) => handleFileTeamPickerSubmit(teamIds),
            busy: isTeamSharePending,
            loading: isLoadingFileTeams,
            error: fileTeamPickerError,
            emptyMessage: "No teams are available yet.",
          });
        }

        function renderChangesFilterMenu() {
          return React.createElement(PlatformPopupSurface, { className: "playground-files-toolbar-menu playground-files-toolbar-menu-wide" },
            React.createElement("div", { className: "playground-files-toolbar-menu-title" }, "Changes Filter"),
            React.createElement("div", { className: "playground-files-toolbar-menu-section-label" }, "Operation"),
            changesFilterOptions.map((option) =>
              React.createElement("button", {
                  key: option.id,
                  type: "button",
                  className: "playground-files-toolbar-menu-item" + (changesOperationFilter === option.id ? " is-active" : ""),
                  onClick: () => {
                    setChangesOperationFilter(option.id);
                    setToolbarPopover("");
                  },
                },
                  React.createElement("span", { className: "playground-files-toolbar-menu-check" }, changesOperationFilter === option.id ? "•" : ""),
                  React.createElement("div", { className: "playground-files-toolbar-menu-item-copy" },
                    React.createElement("span", null, option.label),
                    React.createElement("span", null, option.description)
                  )
                )
            ),
            React.createElement("div", { className: "playground-files-toolbar-menu-divider" }),
            React.createElement("div", { className: "playground-files-toolbar-menu-section-label" }, "Contributor"),
            changesActorOptions.map((option) =>
              React.createElement("button", {
                  key: option.id,
                  type: "button",
                  className: "playground-files-toolbar-menu-item" + (changesActorFilter === option.id ? " is-active" : ""),
                  onClick: () => {
                    setChangesActorFilter(option.id);
                    setToolbarPopover("");
                  },
                },
                  React.createElement("span", { className: "playground-files-toolbar-menu-check" }, changesActorFilter === option.id ? "•" : ""),
                  React.createElement("div", { className: "playground-files-toolbar-menu-item-copy" },
                    React.createElement("span", null, option.label),
                    React.createElement("span", null, option.description)
                  )
                )
            )
          );
        }

        function renderEnvironmentActionsMenu() {
          const normalizedEnvironmentId = String(selectedEnvironment?.id || "").trim();
          const isForkingEnvironment = fileEnvironmentMutationState.action === "fork" && fileEnvironmentMutationState.environmentId === normalizedEnvironmentId;
          const isDeletingEnvironment = fileEnvironmentMutationState.action === "delete" && fileEnvironmentMutationState.environmentId === normalizedEnvironmentId;
          const isDeleteBlocked = !normalizedEnvironmentId || selectedEnvironment?.isSystem || selectedEnvironment?.isDefault;

          return React.createElement(React.Fragment, null,
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row",
                onClick: handleOpenCurrentEnvironmentSettings,
                disabled: !normalizedEnvironmentId || isForkingEnvironment || isDeletingEnvironment,
              },
                React.createElement("span", { className: "tb-popup-icon", "aria-hidden": "true" },
                  React.createElement(Settings2, { strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "tb-popup-label" }, "Computer Settings")
              ),
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row",
                onClick: () => {
                  void handleForkCurrentEnvironment();
                },
                disabled: !normalizedEnvironmentId || isForkingEnvironment || isDeletingEnvironment,
              },
                React.createElement("span", { className: "tb-popup-icon", "aria-hidden": "true" },
                  React.createElement(GitFork, { strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "tb-popup-label" }, isForkingEnvironment ? "Forking Computer..." : "Fork Computer")
              ),
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row",
                onClick: () => {
                  void handleDeleteCurrentEnvironment();
                },
                disabled: isDeleteBlocked || isForkingEnvironment || isDeletingEnvironment,
              },
                React.createElement("span", { className: "tb-popup-icon", "aria-hidden": "true" },
                  React.createElement(Trash2, { strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "tb-popup-label" }, isDeletingEnvironment ? "Deleting Computer..." : "Delete Computer")
              )
          );
        }

        function renderEnvironmentActionsControl() {
          if (isConnectorsMode) {
            return null;
          }
          const isOpen = toolbarPopover === "environment-actions";
          return React.createElement(React.Fragment, null,
            isOpen
              ? React.createElement(PlatformPopupDismissLayer, {
                  className: "playground-files-search-backdrop",
                  style: { zIndex: 12059 },
                  onClick: () => setToolbarPopover(""),
                })
              : null,
            React.createElement(PlatformPopup, {
                open: isOpen,
                variant: "minimal",
                portal: true,
                placement: "bottom-end",
                animation: "down-in",
                rootClassName: "playground-files-toolbar-anchor playground-files-environment-actions-anchor",
                surfaceProps: {
                  role: "menu",
                  "aria-label": (selectedEnvironment?.name || "Computer") + " actions",
                  width: 220,
                },
                trigger: React.createElement("button", {
                  type: "button",
                  className: "playground-files-header-icon-button is-plain" + (isOpen ? " is-active" : ""),
                  onClick: () => toggleToolbarPopover("environment-actions"),
                  disabled: !selectedEnvironmentId,
                  title: "Computer actions",
                  "aria-label": "Computer actions",
                  "aria-haspopup": "menu",
                  "aria-expanded": isOpen ? "true" : "false",
                }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
              },
              renderEnvironmentActionsMenu()
            )
          );
        }

        function handleCreateEnvironmentFromFilesMenu() {
          setToolbarPopover("");
          if (typeof onCreateEnvironment === "function") {
            onCreateEnvironment();
          }
        }

        function renderFilesEnvironmentSelectMenu() {
          const isProjectMode = filesEnvironmentMenuMode === "projects";
          const isConnectorMode = filesEnvironmentMenuMode === "connectors";
          const switchFilesEnvironmentMenuMode = (nextMode, event = null) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            const normalizedMode = nextMode === "projects"
              ? "projects"
              : nextMode === "connectors"
                ? "connectors"
                : "computers";
            setFilesEnvironmentMenuMode(normalizedMode);
            setToolbarPopover("environment");
          };
          const renderCheck = (isSelected) =>
            React.createElement("span", { className: "playground-files-environment-menu-check-slot" },
              isSelected
                ? React.createElement(Check, {
                    className: "playground-files-environment-menu-check",
                    width: 16,
                    height: 16,
                    strokeWidth: 2,
                  })
                : null
            );
          const renderProjectOption = (id, label) =>
            React.createElement("button", {
                key: id || "all-files",
                type: "button",
                className: "playground-files-environment-menu-row" + (projectFilterScope === id ? " selected" : ""),
                onClick: () => {
                  setProjectFilterScope(id);
                  setProjectFilterScopeLabel(id ? label : "");
                  setFilesEnvironmentMenuMode(id ? "projects" : "computers");
                  if (isConnectorsMode) setContentMode("files");
                  setToolbarPopover("");
                },
              },
                React.createElement("span", { className: "playground-files-environment-menu-label" }, label),
                renderCheck(projectFilterScope === id)
              );

          const stopFilesEnvironmentMenuEvent = (event) => {
            event.stopPropagation();
            event.nativeEvent?.stopImmediatePropagation?.();
          };

          return React.createElement(PlatformPopupSurface, {
              variant: "minimal",
              animation: "down-in",
              className: "playground-files-environment-menu playground-files-environment-scope-menu",
              onPointerDown: stopFilesEnvironmentMenuEvent,
              onMouseDown: stopFilesEnvironmentMenuEvent,
              onClick: stopFilesEnvironmentMenuEvent,
            },
            React.createElement("div", { className: "playground-files-environment-menu-switch" },
              React.createElement("button", {
                type: "button",
                className: "playground-files-environment-menu-switch-button" + (!isProjectMode && !isConnectorMode ? " is-active" : ""),
                onPointerDownCapture: (event) => switchFilesEnvironmentMenuMode("computers", event),
                onMouseDownCapture: (event) => switchFilesEnvironmentMenuMode("computers", event),
                onClickCapture: (event) => switchFilesEnvironmentMenuMode("computers", event),
                onPointerDown: (event) => switchFilesEnvironmentMenuMode("computers", event),
                onMouseDown: (event) => switchFilesEnvironmentMenuMode("computers", event),
                onClick: (event) => switchFilesEnvironmentMenuMode("computers", event),
              }, "Computers"),
              React.createElement("button", {
                type: "button",
                className: "playground-files-environment-menu-switch-button" + (isProjectMode ? " is-active" : ""),
                onPointerDownCapture: (event) => switchFilesEnvironmentMenuMode("projects", event),
                onMouseDownCapture: (event) => switchFilesEnvironmentMenuMode("projects", event),
                onClickCapture: (event) => switchFilesEnvironmentMenuMode("projects", event),
                onPointerDown: (event) => switchFilesEnvironmentMenuMode("projects", event),
                onMouseDown: (event) => switchFilesEnvironmentMenuMode("projects", event),
                onClick: (event) => switchFilesEnvironmentMenuMode("projects", event),
              }, "Projects"),
              React.createElement("button", {
                type: "button",
                className: "playground-files-environment-menu-switch-button" + (isConnectorMode ? " is-active" : ""),
                onPointerDownCapture: (event) => switchFilesEnvironmentMenuMode("connectors", event),
                onMouseDownCapture: (event) => switchFilesEnvironmentMenuMode("connectors", event),
                onClickCapture: (event) => switchFilesEnvironmentMenuMode("connectors", event),
                onPointerDown: (event) => switchFilesEnvironmentMenuMode("connectors", event),
                onMouseDown: (event) => switchFilesEnvironmentMenuMode("connectors", event),
                onClick: (event) => switchFilesEnvironmentMenuMode("connectors", event),
              }, "Connectors")
            ),
            React.createElement("div", { className: "playground-files-environment-menu-body" },
              isConnectorMode
                ? connectorSourceState.status === "loading" || connectorSourceState.status === "idle"
                  ? React.createElement("div", { className: "playground-files-environment-menu-empty" }, "Loading connectors...")
                  : connectorSourceState.error
                    ? React.createElement("div", { className: "playground-files-environment-menu-empty is-error" }, connectorSourceState.error)
                    : connectorSourceState.items.length > 0
                      ? connectorSourceState.items.map((source) =>
                          React.createElement("button", {
                              key: source.id,
                              type: "button",
                              className: "playground-files-environment-menu-row playground-files-connector-menu-row"
                                + (activeConnectorSourceId === source.id && isConnectorsMode ? " selected" : "")
                                + (!source.connected ? " is-disabled" : ""),
                              disabled: !source.connected,
                              onClick: () => selectFileConnectorSource(source.id),
                              title: source.connected ? "Open " + source.label + " files" : source.label + " is not connected",
                            },
                              renderFileConnectorSourceIcon(source, "playground-files-connector-menu-icon"),
                              React.createElement("span", { className: "playground-files-environment-menu-label" },
                                React.createElement("span", { className: "playground-files-connector-menu-name" }, source.label),
                                React.createElement("span", { className: "playground-files-connector-menu-identity" },
                                  source.connected ? source.identity || "Connected" : "Not connected"
                                )
                              ),
                              renderCheck(activeConnectorSourceId === source.id && isConnectorsMode)
                            )
                        )
                      : React.createElement("div", { className: "playground-files-environment-menu-empty" }, "No file connectors are available.")
                : isProjectMode
                ? [
                    renderProjectOption("", isChangesMode ? "All Changes" : "All Files"),
                    renderProjectOption("__all__", isChangesMode ? "All Project Changes" : "All Project Files"),
                    availableProjectFilters.length > 0
                      ? availableProjectFilters.map((project) =>
                          renderProjectOption(project.id, project.name || "Project")
                        )
                      : React.createElement("div", {
                          key: "empty-projects",
                          className: "playground-files-environment-menu-empty",
                        }, "No projects are available yet.")
                  ]
                : orderedEnvironments.map((environment) =>
                    React.createElement("button", {
                        key: environment.id,
                        type: "button",
                        className: "playground-files-environment-menu-row" + (selectedEnvironmentId === environment.id ? " selected" : ""),
                        onClick: () => handleEnvironmentSelect(environment.id),
                      },
                        React.createElement("span", { className: "playground-files-environment-menu-label" }, environment.name),
                        renderCheck(selectedEnvironmentId === environment.id)
                      )
                  )
            ),
            !isProjectMode && !isConnectorMode
              ? React.createElement("div", { className: "playground-files-environment-menu-footer" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-environment-create-button",
                    onClick: handleCreateEnvironmentFromFilesMenu,
                  },
                    React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Create Computer")
                  )
                )
              : null
          );
        }

        function renderFileConnectorAccountMenu() {
          const stopFileConnectorAccountMenuEvent = (event) => {
            event.stopPropagation();
            event.nativeEvent?.stopImmediatePropagation?.();
          };
          return React.createElement(PlatformPopupSurface, {
              variant: "minimal",
              animation: "down-in",
              className: "playground-files-environment-menu playground-files-connector-account-menu",
              onPointerDown: stopFileConnectorAccountMenuEvent,
              onMouseDown: stopFileConnectorAccountMenuEvent,
              onClick: stopFileConnectorAccountMenuEvent,
            },
            React.createElement("div", { className: "playground-files-environment-menu-body" },
              activeFileConnectorAccounts.length > 0
                ? activeFileConnectorAccounts.map((account) => {
                    const isSelected = account.id === activeConnectorCredentialId;
                    const identity = account.identity || account.name || "Connected account";
                    const shouldShowName = account.name && account.name !== identity;
                    return React.createElement("button", {
                        key: account.id || "default-account",
                        type: "button",
                        className: "playground-files-environment-menu-row playground-files-connector-account-row"
                          + (isSelected ? " selected" : ""),
                        onClick: () => selectFileConnectorAccount(account.id),
                        title: "Browse files as " + identity,
                      },
                        React.createElement("span", { className: "playground-files-environment-menu-label" },
                          React.createElement("span", { className: "playground-files-connector-menu-name" }, identity),
                          shouldShowName
                            ? React.createElement("span", { className: "playground-files-connector-menu-identity" }, account.name)
                            : null
                        ),
                        React.createElement("span", { className: "playground-files-environment-menu-check-slot" },
                          isSelected
                            ? React.createElement(Check, {
                                className: "playground-files-environment-menu-check",
                                width: 16,
                                height: 16,
                                strokeWidth: 2,
                              })
                            : null
                        )
                      );
                  })
                : React.createElement("div", { className: "playground-files-environment-menu-empty" }, "No connected accounts are available.")
            )
          );
        }

        function renderFilesEnvironmentSelector() {
          const sourceLabel = isConnectorsMode
            ? activeFileConnectorSource?.label || "Connectors"
            : projectFilterScope
              ? activeProjectFilterOption.label
              : selectedEnvironment?.name || "No environments available";
          const accountLabel = activeFileConnectorAccount?.identity
            || activeFileConnectorAccount?.name
            || "Connected account";
          return React.createElement("div", {
              className: "playground-files-environment-select-shell" + (isConnectorsMode ? " is-connector" : ""),
            },
            React.createElement("div", { className: "playground-files-toolbar-anchor" },
              React.createElement("button", {
                type: "button",
                className: "playground-files-inline-selector" + (toolbarPopover === "environment" ? " active" : ""),
                onClick: () => {
                  const nextMode = isConnectorsMode
                    ? "connectors"
                    : projectFilterScope
                      ? "projects"
                      : "computers";
                  setFilesEnvironmentMenuMode(nextMode);
                  toggleToolbarPopover("environment");
                },
              },
                React.createElement("span", null, sourceLabel),
                React.createElement(ChevronDown, {
                  className: "playground-files-inline-selector-chevron",
                  strokeWidth: 1.85,
                })
              ),
              toolbarPopover === "environment"
                ? renderFilesEnvironmentSelectMenu()
                : null
            ),
            isConnectorsMode && activeFileConnectorSource
              ? React.createElement(React.Fragment, null,
                  React.createElement(ChevronRight, {
                    className: "playground-files-environment-breadcrumb-chevron",
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  React.createElement("div", { className: "playground-files-toolbar-anchor" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-inline-selector playground-files-connector-account-selector"
                        + (toolbarPopover === "connector-account" ? " active" : ""),
                      onClick: () => toggleToolbarPopover("connector-account"),
                      "aria-haspopup": "menu",
                      "aria-expanded": toolbarPopover === "connector-account" ? "true" : "false",
                    },
                      React.createElement("span", null, accountLabel),
                      React.createElement(ChevronDown, {
                        className: "playground-files-inline-selector-chevron",
                        strokeWidth: 1.85,
                      })
                    ),
                    toolbarPopover === "connector-account"
                      ? renderFileConnectorAccountMenu()
                      : null
                  )
                )
              : null,
            renderEnvironmentActionsControl()
          );
        }
`;
