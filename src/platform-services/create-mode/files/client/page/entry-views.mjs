export const FILES_PAGE_ENTRY_VIEWS_SCRIPT = `
        function renderEntryName(entry) {
          if (renamingPath !== entry.path) {
            return React.createElement("div", { className: "playground-files-entry-name" }, entry.name);
          }
          const renameParts = splitPlaygroundProtectedFilename(entry.name || "", entry.isFolder);

          return React.createElement("div", { className: "playground-files-rename-control" },
            React.createElement("input", {
              ref: renameInputRef,
              type: "text",
              className: "playground-files-rename-input",
              value: renameValue,
              onChange: (event) => setRenameValue(event.target.value),
              onClick: (event) => event.stopPropagation(),
              onKeyDown: (event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleRenameSubmit();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  handleRenameCancel();
                }
              },
              onBlur: () => {
                void handleRenameSubmit();
              },
            }),
            renameParts.extension
              ? React.createElement("span", { className: "playground-files-rename-extension" }, renameParts.extension)
              : null
          );
        }

        function renderEntryRow(row) {
          const entry = row.entry;
          const isActive = selectedPaths.has(entry.path);
          const isExpanded = entry.isFolder && expandedFolders.has(entry.path);
          const isFolderLoading = entry.isFolder && loadingFolderPaths.has(entry.path);
          const canExpandFolder = entry.isFolder && (
            entry.hasChildren
            || isExpanded
            || isFolderLoading
            || (Array.isArray(entry.children) && entry.children.length > 0)
          );
          const isDragSource = draggedPaths.includes(entry.path);
          const isDropTarget = dragOverTargetPath === entry.path && entry.isFolder;

          return React.createElement("div", {
              key: entry.id,
              className: "playground-files-entry-row"
                + (isActive ? " is-active" : "")
                + (isDropTarget ? " is-drop-target" : "")
                + (isDragSource ? " is-dragging" : ""),
              "data-playground-file-path": entry.path,
              style: { paddingLeft: 12 + row.level * 18 + "px" },
              draggable: renamingPath !== entry.path,
              onClick: (event) => handleEntrySelection(entry, event),
              onDoubleClick: () => handleEntryDoubleClick(entry),
              onContextMenu: (event) => handleContextMenu(event, entry),
              onDragStart: (event) => handleDragStart(event, entry),
              onDragEnd: handleDragEnd,
              onDragOver: entry.isFolder ? (event) => handleFolderDragOver(event, entry) : undefined,
              onDragLeave: handleDragLeave,
              onDrop: entry.isFolder ? (event) => void handleFolderDrop(event, entry) : undefined,
            },
              canExpandFolder
                ? React.createElement("button", {
                    type: "button",
                    className: "playground-files-entry-chevron-button",
                    onClick: (event) => {
                      event.stopPropagation();
                      toggleFolderExpansion(entry.path);
                    },
                  }, isExpanded
                    ? isFolderLoading
                      ? React.createElement(Loader2, { className: "playground-files-entry-chevron is-spinning", strokeWidth: 1.8 })
                      : React.createElement(ChevronDown, { className: "playground-files-entry-chevron", strokeWidth: 1.8 })
                    : isFolderLoading
                      ? React.createElement(Loader2, { className: "playground-files-entry-chevron is-spinning", strokeWidth: 1.8 })
                      : React.createElement(ChevronRight, { className: "playground-files-entry-chevron", strokeWidth: 1.8 }))
                : React.createElement("div", { className: "playground-files-entry-chevron is-placeholder" }),
              React.createElement("div", { className: "playground-files-entry-main" },
                React.createElement(PlaygroundFileIcon, { entry, environmentId: selectedEnvironmentId, backendUrl, useThumbnail: true }),
                React.createElement("div", { className: "playground-files-entry-copy" }, renderEntryName(entry))
              ),
              React.createElement("div", { className: "playground-files-entry-meta" },
                React.createElement("span", { className: "playground-files-entry-date" }, formatPlaygroundFileDate(entry.modifiedTime)),
                React.createElement("span", { className: "playground-files-entry-size" }, entry.isFolder ? "-" : formatPlaygroundFileSize(entry.size))
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-entry-options-button",
                onClick: (event) => handleEntryContextMenuButtonClick(entry, event),
                "aria-label": "Open file options",
              }, React.createElement(Ellipsis, {
                className: "playground-files-entry-options-icon",
                strokeWidth: 1.8,
              }))
            );
        }

        function renderGridItem(entry) {
          const isActive = selectedPaths.has(entry.path);
          const isDragSource = draggedPaths.includes(entry.path);
          const isDropTarget = dragOverTargetPath === entry.path && entry.isFolder;

          return React.createElement("div", {
              key: entry.id,
              className: "playground-files-grid-item"
                + (isActive ? " is-active" : "")
                + (isDropTarget ? " is-drop-target" : "")
                + (isDragSource ? " is-dragging" : ""),
              "data-playground-file-path": entry.path,
              draggable: renamingPath !== entry.path,
              onClick: (event) => handleEntrySelection(entry, event),
              onDoubleClick: () => handleEntryDoubleClick(entry),
              onContextMenu: (event) => handleContextMenu(event, entry),
              onDragStart: (event) => handleDragStart(event, entry),
              onDragEnd: handleDragEnd,
              onDragOver: entry.isFolder ? (event) => handleFolderDragOver(event, entry) : undefined,
              onDragLeave: handleDragLeave,
              onDrop: entry.isFolder ? (event) => void handleFolderDrop(event, entry) : undefined,
            },
              React.createElement(PlaygroundFileIcon, { entry, size: "large", environmentId: selectedEnvironmentId, backendUrl, useThumbnail: true }),
              renamingPath === entry.path
                ? (() => {
                    const renameParts = splitPlaygroundProtectedFilename(entry.name || "", entry.isFolder);
                    return React.createElement("div", { className: "playground-files-rename-control is-grid" },
                      React.createElement("input", {
                        ref: renameInputRef,
                        type: "text",
                        className: "playground-files-rename-input is-grid",
                        value: renameValue,
                        onChange: (event) => setRenameValue(event.target.value),
                        onClick: (event) => event.stopPropagation(),
                        onKeyDown: (event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleRenameSubmit();
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            handleRenameCancel();
                          }
                        },
                        onBlur: () => {
                          void handleRenameSubmit();
                        },
                      }),
                      renameParts.extension
                        ? React.createElement("span", { className: "playground-files-rename-extension" }, renameParts.extension)
                        : null
                    );
                  })()
                : React.createElement("div", { className: "playground-files-grid-item-name" }, entry.name),
              React.createElement("div", { className: "playground-files-grid-item-meta" },
                entry.isFolder
                  ? formatPlaygroundFileDate(entry.modifiedTime)
                  : formatPlaygroundFileSize(entry.size) + " • " + formatPlaygroundFileDate(entry.modifiedTime)
              )
            );
        }

        function renderFileChatSidebar() {
          if (!hasSingleFilePreview || !activePreviewEntry) {
            return null;
          }

          return React.createElement("div", { className: "playground-files-chat-shell" },
            React.createElement("button", {
              type: "button",
              className: "playground-files-chat-resize-handle",
              onPointerDown: startFileChatResize,
              "aria-label": "Resize file chat sidebar",
            }),
            React.createElement("div", { className: "playground-files-chat-header" },
              React.createElement("div", { className: "playground-files-chat-header-copy" },
                React.createElement("div", { className: "playground-files-chat-title" }, "File Chat")
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-chat-close",
                onClick: () => setIsFileChatOpen(false),
                "aria-label": "Close file chat",
              }, React.createElement(X, { className: "playground-files-chat-close-icon", strokeWidth: 1.9 }))
            ),
            React.createElement("div", { className: "playground-files-chat-body" },
              React.createElement("div", { className: "runner-host" },
                React.createElement(RunnerChat, {
                  key: fileChatRunnerKey,
                  backendUrl,
                  apiKey: apiKey,
                  requestHeaders,
                  environmentId: selectedEnvironmentId || undefined,
                  agentId: agentId || undefined,
                  skillDefaults: getDemoImageGenerationSkillDefaults(),
                  className: "playground-files-chat-runner",
                  inputMode: "minimal",
                  placeholder: "Ask about the file",
                  hiddenSystemPrompt: fileChatSystemPrompt,
                  emptyState: renderFileChatEmptyState(),
                  showUsageInStatus: false,
                  onThreadIdChange: () => {
                    if (typeof onFileChatThreadMutated === "function") {
                      onFileChatThreadMutated();
                    }
                  },
                  onRunFinish: () => {
                    if (typeof onFileChatThreadMutated === "function") {
                      onFileChatThreadMutated();
                    }
                  },
                })
              )
            )
          );
        }

        function getActivePreviewTitle() {
          if (activePreviewEntry?.name) {
            return activePreviewEntry.name;
          }
          return selectedEntries.length > 0 ? selectedEntries.length + " items selected" : "Preview";
        }

        function renderFilePreviewHeaderCopy() {
          if (!isPreviewMaximized) {
            return null;
          }
          const previewTitle = getActivePreviewTitle();
          return React.createElement("div", { className: "playground-files-preview-breadcrumb playground-files-preview-title-only", "aria-label": "Preview title" },
            React.createElement("span", {
              className: "playground-files-preview-breadcrumb-item is-current",
              title: previewTitle,
            }, previewTitle)
          );
        }

        function renderFilePreviewMaximizeButton() {
          const PreviewSizeIcon = isPreviewMaximized ? Minimize2 : Maximize2;
          return React.createElement("button", {
            type: "button",
            className: "tb-attachment-preview-drawer-action playground-files-preview-maximize-button",
            onClick: toggleFilePreviewMaximized,
            title: isPreviewMaximized ? "Exit full screen" : "Full screen",
            "aria-label": isPreviewMaximized ? "Exit full screen" : "Full screen",
            "aria-pressed": isPreviewMaximized ? "true" : "false",
          }, React.createElement(PreviewSizeIcon, { className: "tb-attachment-preview-drawer-action-icon", strokeWidth: 1.9 }));
        }

        function renderFilePreviewThreadComposer(entry) {
          if (!entry || entry.isFolder) {
            return null;
          }
          const sourceEnvironmentId = String(selectedEnvironmentId || "").trim();
          const fileKind = getPlaygroundFileKind(entry);
          const composerAgents = (Array.isArray(agents) ? agents : [])
            .map((agent) => buildPlaygroundRunnerAgentOption(agent, String(agent?.id || "").trim() === String(agentId || "").trim() ? { isDefault: true } : {}))
            .filter((agent) => agent.id);
          const composerEnvironments = (Array.isArray(environments) ? environments : [])
            .map((environment) => ({
              id: String(environment?.id || "").trim(),
              name: String(environment?.name || environment?.label || "Computer").trim() || "Computer",
              isDefault: String(environment?.id || "").trim() === sourceEnvironmentId,
            }))
            .filter((environment) => environment.id);
          return React.createElement(RunnerChat, {
            key: "files-preview-composer:" + sourceEnvironmentId + ":" + normalizeHistoryPath(entry.path || entry.name || ""),
            className: "playground-files-image-thread-composer" + (isStartingImagePreviewThread ? " is-starting-thread" : ""),
            backendUrl,
            apiKey,
            requestHeaders,
            appId: "runner-web-sdk-demo",
            environmentId: sourceEnvironmentId,
            agentId: agentId || "",
            agents: composerAgents,
            isAgentSelectionBlocked,
            onBlockedAgentSelect,
            environments: composerEnvironments,
            inputMode: "computer-agents",
            placeholder: fileKind === "image" ? "Ask about this image" : fileKind === "video" ? "Ask about this video" : "Ask about this file",
            autoCreateThread: true,
            autoFocusComposer: false,
            keepFocusOnSubmit: false,
            showUsageInStatus: false,
            maxAttachments: 10,
            disabled: isStartingImagePreviewThread,
            uploadFiles: (files) => Promise.all((Array.isArray(files) ? files : []).map((file) =>
              uploadFilesPageAttachment(file, {
                environmentId: selectedEnvironmentId,
              })
            )),
            onEnvironmentChange: (nextEnvironmentId) => {
              const normalizedNextEnvironmentId = String(nextEnvironmentId || "").trim();
              if (normalizedNextEnvironmentId) {
                setSelectedEnvironmentId(normalizedNextEnvironmentId);
              }
            },
            onExternalRunRequestCreate: (runRequest) => {
              void handleFilePreviewExternalRunRequest(entry, runRequest, sourceEnvironmentId);
              return true;
            },
            onRunError: (error) => {
              setActionError(error instanceof Error ? error.message : "Failed to start file chat.");
            },
          });
        }

        function renderPreviewPanel() {
          if (selectedEntries.length === 0) {
            return null;
          }

          if (!activePreviewEntry) {
            const folderCount = selectedEntries.filter((entry) => entry.isFolder).length;
            const fileCount = selectedEntries.length - folderCount;
            return React.createElement("div", { className: "playground-files-preview-shell" },
              React.createElement("div", { className: "playground-files-preview-top" },
                React.createElement("div", { className: "playground-files-preview-top-actions" },
                  renderFilePreviewMaximizeButton(),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-chat-close",
                    onClick: closePreviewPane,
                    "aria-label": "Close file preview",
                  }, React.createElement(X, { className: "playground-files-chat-close-icon", strokeWidth: 1.9 }))
                ),
                React.createElement("div", { className: "playground-files-preview-selection-badge" }, String(selectedEntries.length)),
                React.createElement("div", { className: "playground-files-preview-name" }, selectedEntries.length + " items selected"),
                React.createElement("div", { className: "playground-files-preview-meta" }, folderCount + " folders, " + fileCount + " files")
              ),
              React.createElement("div", { className: "playground-files-preview-info is-list" },
                React.createElement("div", { className: "playground-files-preview-info-title" }, "Selected Items"),
                selectedEntries.slice(0, 10).map((entry) =>
                  React.createElement("div", { key: entry.path, className: "playground-files-preview-selection-row" },
                    React.createElement(PlaygroundFileIcon, { entry }),
                    React.createElement("span", null, entry.name)
                  )
                ),
                selectedEntries.length > 10
                  ? React.createElement("div", { className: "playground-files-preview-selection-more" }, "+" + (selectedEntries.length - 10) + " more items")
                  : null
              ),
              React.createElement("div", { className: "playground-files-preview-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-preview-button is-danger",
                  onClick: () => void handleDeleteEntries(selectedEntries),
                },
                  React.createElement(Trash2, { width: 12, height: 12, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Delete " + selectedEntries.length + " Items")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-preview-button",
                  onClick: clearSelection,
                }, "Clear Selection")
              )
            );
          }

          const shouldAutoFocusSelectedEntry = Boolean(
            activePreviewEntry
            && normalizeHistoryPath(autoFocusPreviewPath) === normalizeHistoryPath(activePreviewEntry.path)
          );
          const previewHeaderActions = singleSelectedEntryFileKind === "image" && isImageSelectionMode
            ? React.createElement("div", { className: "playground-files-image-selection-controls" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-image-selection-button is-icon",
                  onClick: undoImageSelectionStroke,
                  disabled: imageMaskStrokes.length === 0,
                  title: "Undo selection stroke",
                  "aria-label": "Undo selection stroke",
                }, React.createElement(RotateCcw, { width: 16, height: 16, strokeWidth: 1.9 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-image-selection-button is-icon",
                  onClick: redoImageSelectionStroke,
                  disabled: imageMaskRedoStrokes.length === 0,
                  title: "Redo selection stroke",
                  "aria-label": "Redo selection stroke",
                }, React.createElement(RotateCw, { width: 16, height: 16, strokeWidth: 1.9 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-image-selection-button",
                  onClick: resetImageSelectionMode,
                }, "Cancel")
              )
            : singleSelectedEntryFileKind === "image" && isImageCropMode
              ? React.createElement("div", { className: "playground-files-image-selection-controls" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-image-selection-button is-icon is-plain",
                    onClick: undoImageCropHistory,
                    disabled: imageCropHistoryIndex <= 0 || isCroppingImage || isSavingImageCrop,
                    title: "Undo crop",
                    "aria-label": "Undo crop",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.9 })),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-image-selection-button is-icon is-plain",
                    onClick: redoImageCropHistory,
                    disabled: imageCropHistoryIndex >= imageCropHistory.length || isCroppingImage || isSavingImageCrop,
                    title: "Redo crop",
                    "aria-label": "Redo crop",
                  }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.9 })),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-image-selection-button is-plain",
                    onClick: resetImageCropMode,
                    disabled: isCroppingImage || isSavingImageCrop,
                  }, "Cancel"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-image-selection-button",
                    onClick: () => void applyImageCropToActivePreview(),
                    disabled: !imageCropRect || isCroppingImage || isSavingImageCrop,
                  },
                    isCroppingImage
                      ? React.createElement(Loader2, { className: "is-spinning", width: 14, height: 14, strokeWidth: 1.9 })
                      : React.createElement(Crop, { width: 14, height: 14, strokeWidth: 1.9 }),
                    React.createElement("span", null, isCroppingImage ? "Cropping..." : "Apply Crop")
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-image-selection-button",
                    onClick: () => void saveImageCropToActivePreview(),
                    disabled: imageCropHistoryIndex <= 0 || isCroppingImage || isSavingImageCrop,
                  },
                    isSavingImageCrop
                      ? React.createElement(Loader2, { className: "is-spinning", width: 14, height: 14, strokeWidth: 1.9 })
                      : React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.9 }),
                    React.createElement("span", null, isSavingImageCrop ? "Saving..." : "Save")
                  )
                )
            : React.createElement(React.Fragment, null,
                singleSelectedEntryFileKind === "image"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-preview-select-button",
                        onClick: beginImageSelectionMode,
                        title: "Select image area",
                      },
                        React.createElement(LassoSelect, { width: 14, height: 14, strokeWidth: 1.9 }),
                        React.createElement("span", null, "Select")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-preview-select-button is-crop",
                        onClick: beginImageCropMode,
                        title: "Crop image",
                      },
                        React.createElement(Crop, { width: 14, height: 14, strokeWidth: 1.9 }),
                        React.createElement("span", null, "Crop")
                      ),
                      React.createElement("span", { className: "tb-image-preview-header-divider", "aria-hidden": "true" })
                    )
                  : null,
                canToggleDocumentPreviewMode
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-files-preview-select-button playground-files-preview-mode-toggle" + (documentPreviewMode === "code" ? " is-active" : ""),
                      onClick: () => setDocumentPreviewMode((current) => current === "code" ? "preview" : "code"),
                      title: documentPreviewMode === "code" ? "Switch to preview mode" : "Switch to code view",
                      "aria-label": documentPreviewMode === "code" ? "Switch to preview mode" : "Switch to code view",
                      "aria-pressed": documentPreviewMode === "code" ? "true" : "false",
                    },
                      documentPreviewMode === "code"
                        ? React.createElement(Eye, { width: 14, height: 14, strokeWidth: 1.9 })
                        : React.createElement(Code, { width: 14, height: 14, strokeWidth: 1.9 }),
                      React.createElement("span", null, documentPreviewMode === "code" ? "Preview" : "Code")
                    )
                  : null,
                singleSelectedEntryFileKind !== "image"
                  ? React.createElement("span", { className: "tb-image-preview-header-divider", "aria-hidden": "true" })
                  : null,
                React.createElement("button", {
                  type: "button",
                  className: "tb-attachment-preview-drawer-action",
                  onClick: (event) => handleEntryContextMenuButtonClick(activePreviewEntry, event),
                  title: "File actions",
                  "aria-label": "File actions",
                }, React.createElement(Ellipsis, { className: "tb-attachment-preview-drawer-action-icon", strokeWidth: 1.9 })),
                renderFilePreviewMaximizeButton()
              );

          if (
            !activePreviewEntry.isFolder
            && (
              singleSelectedEntryFileKind === "code"
              || (canToggleDocumentPreviewMode && documentPreviewMode === "code")
            )
          ) {
            const codePreview = React.createElement(PlaygroundCodeEditorPreview, {
              key: selectedEnvironmentId + ":" + activePreviewEntry.path,
              entry: activePreviewEntry,
              environmentId: selectedEnvironmentId,
              backendUrl,
              requestHeaders,
              headerActions: previewHeaderActions,
              headerCopy: renderFilePreviewHeaderCopy(),
              autoFocus: shouldAutoFocusSelectedEntry,
              onAutoFocusComplete: () => setAutoFocusPreviewPath(""),
              onClose: closePreviewPane,
              onResizeStart: isPreviewMaximized ? undefined : startPreviewResize,
              onSaveSuccess: () => refreshEnvironmentFolders(
                selectedEnvironmentId,
                [getPlaygroundEntryParentPath(activePreviewEntry.path)]
              ),
              showCloseButton: true,
              showResizeHandle: !isPreviewMaximized,
            });
            return React.createElement("div", { className: "playground-files-image-thread-shell" },
              codePreview,
              renderFilePreviewThreadComposer(activePreviewEntry),
              isStartingImagePreviewThread
                ? React.createElement("div", { className: "playground-files-image-thread-loading", "aria-live": "polite" },
                    React.createElement(Loader2, { className: "is-spinning", strokeWidth: 1.85 }),
                    React.createElement("span", null, "Opening thread...")
                  )
              : null
            );
          }

          if (!activePreviewEntry.isFolder && singleSelectedEntryPreviewAttachment && singleSelectedEntryFileKind === "presentation") {
            const presentationPreview = React.createElement("div", { className: "playground-files-preview-shell playground-files-presentation-preview-shell" },
              React.createElement("div", { className: "playground-files-presentation-preview-header" },
                React.createElement("div", { className: "playground-files-presentation-preview-title-row" },
                  React.createElement(PlaygroundFileIcon, { entry: activePreviewEntry }),
                  React.createElement("span", {
                    className: "playground-files-presentation-preview-title",
                    title: activePreviewEntry.name,
                  }, activePreviewEntry.name)
                ),
                React.createElement("div", { className: "playground-files-preview-top-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "tb-attachment-preview-drawer-action",
                    onClick: (event) => handleEntryContextMenuButtonClick(activePreviewEntry, event),
                    title: "File actions",
                    "aria-label": "File actions",
                  }, React.createElement(Ellipsis, { className: "tb-attachment-preview-drawer-action-icon", strokeWidth: 1.9 })),
                  renderFilePreviewMaximizeButton(),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-chat-close",
                    onClick: closePreviewPane,
                    "aria-label": "Close file preview",
                  }, React.createElement(X, { className: "playground-files-chat-close-icon", strokeWidth: 1.9 }))
                )
              ),
              React.createElement("div", { className: "playground-files-presentation-preview-body" },
                React.createElement("div", { className: "playground-files-presentation-preview-icon", "aria-hidden": "true" },
                  React.createElement(FileText, { strokeWidth: 1.7 })
                ),
                React.createElement("div", { className: "playground-files-presentation-preview-name" }, activePreviewEntry.name),
                React.createElement("div", { className: "playground-files-presentation-preview-copy" },
                  "PowerPoint preview is not available in this browser. Download the file or ask an agent to inspect it from the workspace."
                ),
                React.createElement("div", { className: "playground-files-presentation-preview-actions" },
                  React.createElement(PlatformPrimaryButton, {
                    size: "large",
                    type: "button",
                    className: "playground-files-preview-button is-primary",
                    onClick: () => void handleDownloadEntry(activePreviewEntry),
                  },
                    React.createElement(Download, { width: 12, height: 12, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Download")
                  )
                )
              )
            );
            return React.createElement("div", { className: "playground-files-image-thread-shell" },
              presentationPreview,
              renderFilePreviewThreadComposer(activePreviewEntry),
              isStartingImagePreviewThread
                ? React.createElement("div", { className: "playground-files-image-thread-loading", "aria-live": "polite" },
                    React.createElement(Loader2, { className: "is-spinning", strokeWidth: 1.85 }),
                    React.createElement("span", null, "Opening thread...")
                  )
                : null
            );
          }

          if (!activePreviewEntry.isFolder && singleSelectedEntryPreviewAttachment) {
            const previewDrawer = React.createElement(RunnerDocumentPreviewDrawer, {
              attachment: singleSelectedEntryPreviewAttachment,
              backendUrl,
              requestHeaders,
              headerCopy: renderFilePreviewHeaderCopy(),
              headerActions: previewHeaderActions,
              showPreviewCodeToggle: singleSelectedEntryFileKind === "spreadsheet",
              imagePreviewInteractive: !isPreviewMaximized && !isImageSelectionMode && !isImageCropMode,
              enableImageWheelZoom: singleSelectedEntryFileKind === "image" && !isImageSelectionMode && !isImageCropMode,
              imagePreviewReservedBottom: singleSelectedEntryFileKind === "image" ? 132 : 0,
              imagePreviewFullscreen: singleSelectedEntryFileKind === "image" && isPreviewMaximized,
              imagePreviewOverlay: singleSelectedEntryFileKind === "image" && isImageSelectionMode
                ? React.createElement(PlaygroundImageSelectionMaskOverlay, {
                    active: true,
                    naturalSize: imageMaskImageSize,
                    strokes: imageMaskStrokes,
                    draftStroke: imageMaskDraftStroke,
                    brushSize: 44,
                    onPointerStart: handleImageMaskPointerStart,
                    onPointerMove: handleImageMaskPointerMove,
                    onPointerEnd: handleImageMaskPointerEnd,
                  })
                : singleSelectedEntryFileKind === "image" && isImageCropMode
                  ? React.createElement(PlaygroundImageCropOverlay, {
                      active: true,
                      naturalSize: imageMaskImageSize,
                      cropRect: imageCropRect,
                      draftRect: imageCropDraftRect,
                      dragTarget: imageCropDragTarget,
                      onPointerStart: handleImageCropPointerStart,
                      onPointerMove: handleImageCropPointerMove,
                      onPointerEnd: handleImageCropPointerEnd,
                    })
                  : null,
              onImagePreviewLoad: (dimensions) => {
                setImageMaskImageSize({
                  width: Math.round(Number(dimensions?.naturalWidth || 0)),
                  height: Math.round(Number(dimensions?.naturalHeight || 0)),
                });
              },
              onDocumentBlobSave: singleSelectedEntryFileKind === "spreadsheet"
                ? async (blob, options = {}) => {
                    const formData = new FormData();
                    formData.append("file", blob, options.filename || activePreviewEntry.name || "spreadsheet");
                    formData.append("path", getPlaygroundEntryParentPath(activePreviewEntry.path));
                    const response = await fetch(
                      backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/upload",
                      {
                        method: "POST",
                        headers: requestHeaders,
                        body: formData,
                      }
                    );
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) {
                      throw new Error(data?.message || data?.error || "Failed to save spreadsheet.");
                    }
                    await refreshEnvironmentFolders(
                      selectedEnvironmentId,
                      [getPlaygroundEntryParentPath(activePreviewEntry.path)]
                    );
                  }
                : undefined,
              inline: true,
              onClose: closePreviewPane,
              onResizeStart: isPreviewMaximized ? undefined : startPreviewResize,
              showCloseButton: !isImageSelectionMode && !isImageCropMode,
              showResizeHandle: !isPreviewMaximized,
            });
            return React.createElement("div", { className: "playground-files-image-thread-shell" + (isImageSelectionMode ? " is-selecting-region" : "") + (isImageCropMode ? " is-cropping-image" : "") },
              previewDrawer,
              renderFilePreviewThreadComposer(activePreviewEntry),
              isStartingImagePreviewThread
                ? React.createElement("div", { className: "playground-files-image-thread-loading", "aria-live": "polite" },
                    React.createElement(Loader2, { className: "is-spinning", strokeWidth: 1.85 }),
                    React.createElement("span", null, "Opening thread...")
                  )
                : null
            );
          }

          const isFolderSelection = Boolean(activePreviewEntry.isFolder);
          const infoRows = [
            ["Type", isFolderSelection ? "Folder" : formatPlaygroundFileTypeLabel(activePreviewEntry)],
            ["Modified", formatPlaygroundFileDate(activePreviewEntry.modifiedTime)],
            [
              "Size",
              isFolderSelection
                ? formatPlaygroundFolderItemCount(activePreviewEntry)
                : formatPlaygroundFileSize(activePreviewEntry.size),
            ],
            ["Location", "/" + (getPlaygroundEntryParentPath(activePreviewEntry.path) || "")],
          ];

          const fallbackPreview = React.createElement("div", { className: "playground-files-preview-shell" },
            React.createElement("div", { className: "playground-files-preview-top" },
              React.createElement("div", { className: "playground-files-preview-top-actions" },
                renderFilePreviewMaximizeButton(),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-chat-close",
                  onClick: closePreviewPane,
                  "aria-label": "Close file preview",
                }, React.createElement(X, { className: "playground-files-chat-close-icon", strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-files-preview-hero" + (isFolderSelection ? " is-folder" : "") },
                React.createElement(PlaygroundFileIcon, {
                  entry: activePreviewEntry,
                  size: "large",
                  className: isFolderSelection ? "playground-files-preview-folder-icon" : "",
                })
              ),
              React.createElement("div", { className: "playground-files-preview-name" }, activePreviewEntry.name),
              React.createElement("div", { className: "playground-files-preview-meta" },
                isFolderSelection
                  ? formatPlaygroundFolderItemCount(activePreviewEntry)
                  : formatPlaygroundFileSize(activePreviewEntry.size)
              )
            ),
            React.createElement("div", { className: "playground-files-preview-info" },
              React.createElement("div", { className: "playground-files-preview-info-title" }, "Information"),
              infoRows.map(([label, value]) =>
                React.createElement("div", { key: label, className: "playground-files-preview-info-row" },
                  React.createElement("span", null, label),
                  React.createElement("span", null, value)
                )
              )
            ),
            React.createElement("div", { className: "playground-files-preview-actions" },
              isFolderSelection
                ? React.createElement(PlatformPrimaryButton, {
                  size: "large",
                    type: "button",
                    className: "playground-files-preview-button is-primary",
                    onClick: () => navigateToPath(activePreviewEntry.path),
                  }, "Open Folder")
                : singleSelectedEntryDownloadUrl
                  ? React.createElement("a", {
                      className: "playground-files-preview-button is-primary",
                      href: singleSelectedEntryDownloadUrl,
                      target: "_blank",
                      rel: "noreferrer",
                    },
                      React.createElement(ArrowUpRight, { width: 12, height: 12, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Open")
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
          return isFolderSelection
            ? fallbackPreview
            : React.createElement("div", { className: "playground-files-image-thread-shell" },
                fallbackPreview,
                renderFilePreviewThreadComposer(activePreviewEntry),
                isStartingImagePreviewThread
                  ? React.createElement("div", { className: "playground-files-image-thread-loading", "aria-live": "polite" },
                      React.createElement(Loader2, { className: "is-spinning", strokeWidth: 1.85 }),
                      React.createElement("span", null, "Opening thread...")
                    )
                  : null
              );
        }
`;
