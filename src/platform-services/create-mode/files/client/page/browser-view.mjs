export const FILES_PAGE_BROWSER_VIEW_SCRIPT = `
        function renderFilesModeSwitch() {
          return React.createElement(PlatformSwitch, {
            className: "playground-files-topbar-mode-switch",
            value: contentMode === "changes" ? "changes" : "files",
            options: [
              { value: "files", label: "Files" },
              { value: "changes", label: "Activity" },
            ],
            ariaLabel: "Files view",
            onValueChange: (nextMode) => {
              if (nextMode === "files") {
                setContentMode("files");
                setChangesViewMode("timeline");
                setToolbarPopover("");
                return;
              }
              setContentMode("changes");
              setIsPreviewOpen(false);
              setIsPreviewMaximized(false);
              setIsFileChatOpen(false);
              setChangesViewMode("timeline");
              setToolbarPopover("");
            },
          });
        }

        function renderFilesSearchPopover(extraClassName = "") {
          return React.createElement(PlatformPopupSurface, {
              className: "playground-files-search-popover" + (extraClassName ? " " + extraClassName : ""),
            },
              React.createElement("div", { className: "playground-files-search-popover-header" },
                React.createElement("div", { className: "playground-files-search-popover-title" }, "Search Files"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-search-popover-close",
                  onClick: () => setToolbarPopover(""),
                }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
              ),
              React.createElement("div", { className: "playground-files-search-popover-body" },
                React.createElement("div", { className: "playground-files-search-field" },
                  React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                  React.createElement("input", {
                    ref: searchPopupInputRef,
                    type: "text",
                    className: "playground-files-search-field-input",
                    placeholder: "Search by file name or path...",
                    value: searchPopupQuery,
                    onChange: (event) => setSearchPopupQuery(event.target.value),
                  })
                ),
                searchPopupQuery.trim()
                  ? searchResults.length > 0
                    ? React.createElement("div", { className: "playground-files-search-results" },
                        searchResults.map((entry) =>
                          React.createElement("button", {
                              key: entry.path,
                              type: "button",
                              className: "playground-files-search-result",
                              onClick: () => handleSearchResultSelect(entry),
                            },
                              React.createElement(PlaygroundFileIcon, { entry }),
                              React.createElement("div", { className: "playground-files-search-result-copy" },
                                React.createElement("div", { className: "playground-files-search-result-name" }, entry.name),
                                React.createElement("div", { className: "playground-files-search-result-path" }, "/" + entry.path)
                              )
                            )
                        )
                      )
                    : isSearchInventoryLoading
                      ? React.createElement(PlatformLoadingState, {
                          centered: true,
                          className: "playground-files-state",
                          message: "Searching files...",
                        })
                      : React.createElement("div", { className: "playground-files-search-empty" }, "No matching files found.")
                  : React.createElement("div", { className: "playground-files-search-empty" }, "Type a file name or path to search this environment.")
              )
            );
        }

        function renderFilesCreateMenuItems() {
          const usesAppleShortcuts = typeof navigator !== "undefined"
            && /mac|iphone|ipad/i.test(String(navigator.platform || ""));
          const shortcutModifier = usesAppleShortcuts ? "⌘" : "Ctrl";
          return React.createElement(React.Fragment, null,
            React.createElement("button", {
                type: "button",
                className: "tb-popup-row platform-instructions-editor__slash-option",
                onClick: () => void handleCreateFile(currentPath),
                disabled: !selectedEnvironmentId || isCreatingFile,
                "aria-keyshortcuts": "Meta+N Control+N",
              },
                React.createElement("span", { className: "tb-popup-icon", "aria-hidden": "true" },
                  React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "tb-popup-label" }, isCreatingFile ? "Creating..." : "Create File"),
                React.createElement("span", { className: "platform-instructions-editor__slash-shortcut", "aria-hidden": "true" }, shortcutModifier + " N")
              ),
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row platform-instructions-editor__slash-option",
                onClick: () => void handleCreateFolder(currentPath),
                disabled: !selectedEnvironmentId || isCreatingFolder,
                "aria-keyshortcuts": "Meta+Shift+N Control+Shift+N",
              },
                React.createElement("span", { className: "tb-popup-icon", "aria-hidden": "true" },
                  React.createElement(Folder, { width: 14, height: 14, strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "tb-popup-label" }, isCreatingFolder ? "Creating..." : "New Folder"),
                React.createElement("span", { className: "platform-instructions-editor__slash-shortcut", "aria-hidden": "true" }, shortcutModifier + " ⇧ N")
              ),
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row platform-instructions-editor__slash-option",
                onClick: () => openUploadPicker(currentPath),
                disabled: !selectedEnvironmentId || isUploadingFiles,
                "aria-keyshortcuts": "Meta+Shift+U Control+Shift+U",
              },
                React.createElement("span", { className: "tb-popup-icon", "aria-hidden": "true" },
                  React.createElement(ArrowUpFromLine, { width: 14, height: 14, strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "tb-popup-label" }, isUploadingFiles ? "Uploading..." : "Upload Files"),
                React.createElement("span", { className: "platform-instructions-editor__slash-shortcut", "aria-hidden": "true" }, shortcutModifier + " ⇧ U")
              )
          );
        }

        function renderFilesCreateMenu(extraClassName = "") {
          return React.createElement(PlatformPopupSurface, {
              className: "playground-files-toolbar-menu" + (extraClassName ? " " + extraClassName : ""),
            },
              renderFilesCreateMenuItems()
            );
        }

        function renderFilesAppHeaderCreateSelector() {
          if (!isFilesMode) {
            return null;
          }
          return React.createElement(PlatformButtonSelector, {
              mode: "popup",
              buttonVariant: "primary",
              buttonSize: "small",
              label: "New",
              leading: React.createElement(Plus, {
                width: 14,
                height: 14,
                strokeWidth: 1.8,
                "aria-hidden": "true",
              }),
              open: toolbarPopover === "create",
              onOpenChange: (nextOpen) => {
                if (nextOpen) {
                  setToolbarPopover("create");
                  closeContextMenu();
                } else if (toolbarPopover === "create") {
                  setToolbarPopover("");
                }
              },
              popupAriaLabel: "Create or upload files",
              popupAlignment: "right",
              popupRole: "menu",
              popupWidth: 248,
              popupClassName: "playground-files-app-header-create-menu",
              disabled: !selectedEnvironmentId,
            },
            renderFilesCreateMenuItems()
          );
        }

        function renderAnimatedFilesCreateMenu(extraClassName = "") {
          return renderFilesCreateMenu(
            [
              extraClassName,
              "playground-files-floating-menu",
              "playground-files-create-menu",
              getFilesToolbarMenuAnimationClass("create"),
            ].filter(Boolean).join(" ")
          );
        }

        function renderAnimatedFilesSortMenu(extraClassName = "") {
          return React.createElement(PlatformPopupSurface, {
              className: [
                "playground-files-toolbar-menu",
                "playground-files-floating-menu",
                getFilesToolbarMenuAnimationClass("sort"),
                extraClassName,
              ].filter(Boolean).join(" "),
            },
              React.createElement("div", { className: "playground-files-toolbar-menu-title" }, activeSortOption.label),
              options.map((option) =>
                React.createElement("button", {
                    key: option.id,
                    type: "button",
                    className: "playground-files-toolbar-menu-item" + (sortMode === option.id ? " is-active" : ""),
                    onClick: () => {
                      setSortMode(option.id);
                      setToolbarPopover("");
                    },
                  },
                    React.createElement("span", { className: "playground-files-toolbar-menu-check" }, sortMode === option.id ? "•" : ""),
                    React.createElement("div", { className: "playground-files-toolbar-menu-item-copy" },
                      React.createElement("span", null, option.label)
                    )
                  )
              )
            );
        }

        function renderAnimatedFilesFilterMenu(extraClassName = "") {
          return React.createElement(PlatformPopupSurface, {
              className: [
                "playground-files-toolbar-menu",
                "playground-files-toolbar-menu-wide",
                "playground-files-floating-menu",
                getFilesToolbarMenuAnimationClass("filter"),
                extraClassName,
              ].filter(Boolean).join(" "),
            },
              React.createElement("div", { className: "playground-files-toolbar-menu-title" }, activeFilterOption.label),
              filterOptions.map((option) =>
                React.createElement("button", {
                    key: option.id,
                    type: "button",
                    className: "playground-files-toolbar-menu-item" + (filterMode === option.id ? " is-active" : ""),
                    onClick: () => {
                      setFilterMode(option.id);
                      setToolbarPopover("");
                    },
                  },
                    React.createElement("span", { className: "playground-files-toolbar-menu-check" }, filterMode === option.id ? "•" : ""),
                    React.createElement("div", { className: "playground-files-toolbar-menu-item-copy" },
                      React.createElement("span", null, option.label),
                      React.createElement("span", null, option.description)
                    )
                  )
              )
            );
        }

        function renderFilesLibraryPathRow() {
          const activeBreadcrumbs = isConnectorsMode ? connectorBrowserBreadcrumbs : breadcrumbs;
          const handleActiveBack = isConnectorsMode
            ? () => navigateFileConnectorHistory(connectorBrowserHistoryIndex - 1)
            : handleGoBack;
          const handleActiveForward = isConnectorsMode
            ? () => navigateFileConnectorHistory(connectorBrowserHistoryIndex + 1)
            : handleGoForward;
          const activeCanGoBack = isConnectorsMode ? connectorBrowserHistoryIndex > 0 : canGoBack;
          const activeCanGoForward = isConnectorsMode
            ? connectorBrowserHistoryIndex < connectorBrowserHistory.length - 1
            : canGoForward;
          return React.createElement("div", { className: "playground-files-library-path-row" },
            React.createElement("div", { className: "playground-files-library-path-actions" },
              React.createElement("button", {
                type: "button",
                className: "playground-files-nav-button",
                onClick: handleActiveBack,
                disabled: !activeCanGoBack,
                title: "Go back",
                "aria-label": "Go back",
              }, React.createElement(ChevronLeft, { strokeWidth: 1.8, width: 14, height: 14 })),
              React.createElement("button", {
                type: "button",
                className: "playground-files-nav-button",
                onClick: handleActiveForward,
                disabled: !activeCanGoForward,
                title: "Go forward",
                "aria-label": "Go forward",
              }, React.createElement(ChevronRight, { strokeWidth: 1.8, width: 14, height: 14 }))
            ),
            React.createElement("div", { className: "playground-files-breadcrumbs", "aria-label": "Current folder path" },
              activeBreadcrumbs.map((crumb, index) =>
                React.createElement("span", {
                    key: crumb.id || "root",
                    className: "playground-files-breadcrumb-segment",
                  },
                  index > 0
                    ? React.createElement(ChevronRight, {
                        className: "playground-files-breadcrumb-separator-icon",
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      })
                    : null,
                  React.createElement("button", {
                      type: "button",
                      className: "playground-files-breadcrumb" + (index === activeBreadcrumbs.length - 1 ? " is-active" : ""),
                      onClick: isConnectorsMode ? crumb.onSelect : () => handleBreadcrumbClick(crumb.id),
                      disabled: index === activeBreadcrumbs.length - 1,
                    },
                      React.createElement("span", null, isConnectorsMode ? crumb.name : index === 0 ? "Home" : crumb.name)
                    )
                  )
              )
            )
          );
        }

        function renderFilesLibraryHeader() {
          const scopedProjectRecord = projectFilterScope && projectFilterScope !== "__all__"
            ? availableProjectFilters.find((project) => String(project?.id || "").trim() === projectFilterScope) || null
            : null;
          const scopedProjectName = String(scopedProjectRecord?.name || projectFilterScopeLabel || "").trim();
          const hasConcreteProjectScope = Boolean(projectFilterScope && projectFilterScope !== "__all__" && scopedProjectName);
          const scopedProjectTitle = hasConcreteProjectScope
            ? (/project$/i.test(scopedProjectName) ? scopedProjectName : scopedProjectName + " Project")
            : "";
          const selectedComputerName = String(selectedEnvironment?.name || "Default").trim() || "Default";
          const selectedComputerLabel = /computer$/i.test(selectedComputerName)
            ? selectedComputerName
            : selectedComputerName + " Computer";
          const scopedProjectEnvironmentId = String(scopedProjectRecord?.defaultEnvironmentId || selectedEnvironmentId || "").trim();
          const scopedProjectEnvironment = scopedProjectEnvironmentId
            ? orderedEnvironments.find((environment) => String(environment?.id || "").trim() === scopedProjectEnvironmentId)
              || environments.find((environment) => String(environment?.id || "").trim() === scopedProjectEnvironmentId)
              || null
            : null;
          const scopedProjectComputerName = String(scopedProjectEnvironment?.name || selectedEnvironment?.name || "Computer").trim() || "Computer";
          const activeSearchQuery = isConnectorsMode ? connectorBrowserSearchQuery : searchPopupQuery;
          const setActiveSearchQuery = isConnectorsMode ? setConnectorBrowserSearchQuery : setSearchPopupQuery;
          const connectorFilebaseTitle = String(activeFileConnectorSource?.label || "Connector").trim();

          return React.createElement("div", { className: "playground-files-library-header" },
            React.createElement("div", { className: "playground-files-library-title-row" },
              React.createElement("h1", { className: "playground-files-library-title" },
                isConnectorsMode
                  ? React.createElement("span", { className: "playground-files-library-title-heading is-connector" },
                      activeFileConnectorSource
                        ? renderFileConnectorSourceIcon(
                            activeFileConnectorSource,
                            "playground-files-library-title-connector-icon"
                          )
                        : null,
                      React.createElement("span", null, connectorFilebaseTitle)
                    )
                  : hasConcreteProjectScope
                  ? React.createElement("span", { className: "playground-files-library-title-heading" },
                      React.createElement("span", null, "Files on " + scopedProjectTitle),
                      React.createElement("span", { className: "playground-files-library-title-computer-badge" },
                        React.createElement(Cloud, { strokeWidth: 1.8, "aria-hidden": "true" }),
                        React.createElement("span", null, scopedProjectComputerName)
                      )
                    )
                  : selectedComputerLabel
              ),
              React.createElement("div", { className: "playground-files-library-actions" },
                React.createElement("div", { className: "playground-files-library-search-anchor" },
                  React.createElement(PlatformSearch, {
                    ref: searchPopupInputRef,
                    className: "playground-files-library-search",
                    placeholder: "Search files",
                    "aria-label": "Search files",
                    value: activeSearchQuery,
                    onFocus: () => {
                      if (toolbarPopover === "search") {
                        setToolbarPopover("");
                      }
                    },
                    onChange: (event) => {
                      setActiveSearchQuery(event.target.value);
                      if (toolbarPopover) {
                        setToolbarPopover("");
                      }
                    },
                  })
                )
              )
            ),
            React.createElement("div", { className: "playground-files-library-nav-row" },
              renderFilesLibraryPathRow(),
              React.createElement("div", { className: "playground-files-library-controls" },
                React.createElement("div", { className: "playground-files-library-control-anchor" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-library-icon-button" + (toolbarPopover === "sort" ? " is-active" : ""),
                    onClick: () => toggleToolbarPopover("sort"),
                    title: "Sort files",
                    "aria-label": "Sort files",
                  }, React.createElement(ArrowUpDown, { width: 19, height: 19, strokeWidth: 1.8 })),
                  shouldRenderFilesToolbarMenu("sort")
                    ? renderAnimatedFilesSortMenu("playground-files-toolbar-menu-align-right")
                    : null
                ),
                React.createElement("div", { className: "playground-files-library-control-anchor" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-library-icon-button" + (toolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                    onClick: () => toggleToolbarPopover("filter"),
                    title: "Filter files",
                    "aria-label": "Filter files",
                  }, React.createElement(SlidersHorizontal, { width: 19, height: 19, strokeWidth: 1.8 })),
                  shouldRenderFilesToolbarMenu("filter")
                    ? renderAnimatedFilesFilterMenu("playground-files-toolbar-menu-align-right")
                    : null
                ),
                React.createElement("span", { className: "playground-files-library-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-icon-button" + (viewMode === "grid" ? " is-active" : ""),
                  onClick: () => {
                    setViewMode("grid");
                    setToolbarPopover("");
                  },
                  title: "Grid view",
                  "aria-label": "Grid view",
                }, React.createElement(LayoutGrid, { width: 20, height: 20, strokeWidth: 1.8 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-icon-button" + (viewMode === "list" ? " is-active" : ""),
                  onClick: () => {
                    setViewMode("list");
                    setToolbarPopover("");
                  },
                  title: "List view",
                  "aria-label": "List view",
                }, React.createElement(List, { width: 21, height: 21, strokeWidth: 1.8 }))
              )
            )
          );
        }

        function renderFilesCreateButton() {
          if (!isFilesMode) {
            return null;
          }
          return React.createElement("div", { className: "playground-files-toolbar-anchor playground-files-control-create" },
            React.createElement("button", {
              type: "button",
              className: "playground-files-control-button" + (toolbarPopover === "create" ? " is-active" : ""),
              onClick: () => toggleToolbarPopover("create"),
              title: "Add files",
            },
              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Add Files")
            ),
            shouldRenderFilesToolbarMenu("create")
              ? renderAnimatedFilesCreateMenu("playground-files-toolbar-menu-align-right")
              : null
          );
        }

        const filesTopNavPayload = useMemo(() => ({
          hidePath: isPreviewMaximized && hasPreviewPanel,
          hideSidebarToggle: isPreviewMaximized && hasPreviewPanel,
          pathItems: isPreviewMaximized && hasPreviewPanel
            ? []
            : undefined,
          left: isPreviewMaximized ? null : renderFilesEnvironmentSelector(),
          center: isPreviewMaximized ? null : renderFilesModeSwitch(),
          extraActions: isPreviewMaximized ? null : renderFilesAppHeaderCreateSelector(),
          environmentId: selectedEnvironmentId,
          path: currentPath,
          contentMode: isChangesMode ? "changes" : isConnectorsMode ? "connectors" : "files",
        }), [
          contentMode,
          activeConnectorCredentialId,
          activeConnectorSourceId,
          activeFileConnectorAccount?.identity,
          activeFileConnectorAccount?.name,
          activeFileConnectorAccounts,
          activeFileConnectorSource?.label,
          activeProjectFilterOption.id,
          activeProjectFilterOption.label,
          currentPath,
          availableProjectFilters.length,
          connectorSourceState.error,
          connectorSourceState.items,
          connectorSourceState.status,
          environments.length,
          fileEnvironmentMutationState,
          filesEnvironmentMenuMode,
          hasPreviewPanel,
          isPreviewMaximized,
          isChangesMode,
          isConnectorsMode,
          isFilesMode,
          isCreatingFile,
          isCreatingFolder,
          isUploadingFiles,
          orderedEnvironments,
          projectFilterScope,
          projectFilterScopeLabel,
          selectedEnvironment?.id,
          selectedEnvironment?.isDefault,
          selectedEnvironment?.isSystem,
          selectedEnvironment?.name,
          selectedEntries.length,
          selectedEnvironmentId,
          singleSelectedEntry?.name,
          toolbarPopover,
        ]);

        useEffect(() => {
          if (typeof onTopNavChange === "function") {
            onTopNavChange(filesTopNavPayload);
          }
        }, [filesTopNavPayload, onTopNavChange]);

        useEffect(() => {
          if (typeof onTopNavChange !== "function") {
            return undefined;
          }
          return () => onTopNavChange(null);
        }, [onTopNavChange]);

        function renderFilesBrowserContent() {
          return isCurrentEnvironmentLoading
            ? React.createElement(PlatformLoadingState, {
                centered: true,
                className: "playground-files-state",
                message: "Loading files...",
              })
            : currentEnvironmentError
              ? React.createElement("div", { className: "playground-files-state is-error" }, currentEnvironmentError)
              : !selectedEnvironmentId
                ? React.createElement("div", { className: "playground-files-state" }, "Select an environment to browse files.")
                : !hasVisibleEntries
                  ? isEmptyEnvironmentRoot
                    ? React.createElement("div", { className: "playground-files-empty-workspace" },
                        React.createElement("section", { className: "playground-files-empty-folder" },
                          React.createElement("svg", {
                            className: "playground-files-empty-folder-top",
                            viewBox: "0 0 1000 92",
                            preserveAspectRatio: "none",
                            "aria-hidden": "true",
                            focusable: "false",
                          },
                            React.createElement("path", {
                              d: "M0 50 H300 C316 50 320 36 324 23 C328 11 336 4 352 4 H730 C746 4 754 11 758 23 C762 36 766 50 782 50 H1000 V80 H782 C766 80 762 66 758 53 C754 41 746 34 730 34 H352 C336 34 328 41 324 53 C320 66 316 80 300 80 H0 Z",
                              fill: "#0F0F0F",
                            }),
                            React.createElement("path", {
                              d: "M0 60 H26 C42 60 46 46 50 33 C54 21 62 14 78 14 H244 C260 14 268 21 272 33 C276 46 280 60 296 60 H1000 V80 H296 C280 80 276 66 272 53 C268 41 260 34 244 34 H78 C62 34 54 41 50 53 C46 66 42 80 26 80 H0 Z",
                              fill: "#66a6ff",
                            }),
                            React.createElement("path", {
                              d: "M0 80 H1000 V92 H0 Z",
                              fill: "#0F0F0F",
                            }),
                          ),
                          React.createElement("div", { className: "playground-files-empty-folder-inner" },
                            React.createElement("div", { className: "playground-files-empty-folder-rule" }),
                            React.createElement("div", { className: "playground-files-empty-folder-header" },
                              React.createElement("div", null,
                                React.createElement("h2", { className: "playground-files-empty-folder-title" },
                                  React.createElement("span", null, "Not a file dump."),
                                  "Workspace memory."
                                ),
                                React.createElement("div", { className: "playground-files-empty-folder-copy" },
                                  "Files give agents durable context they can read, edit, cite, and reuse across threads, projects, reports, and deployed apps."
                                )
                              ),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-files-control-button playground-files-empty-folder-upload-button",
                                onClick: () => openUploadPicker(currentPath),
                                disabled: !selectedEnvironmentId || isUploadingFiles,
                              },
                                React.createElement(ArrowUpFromLine, { width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("span", null, isUploadingFiles ? "Uploading..." : "Upload Files")
                              )
                            ),
                            React.createElement("table", { className: "playground-files-empty-folder-table" },
                              React.createElement("thead", null,
                                React.createElement("tr", null,
                                  React.createElement("th", null, "File storage"),
                                  React.createElement("th", null, "Agent workspace")
                                )
                              ),
                              React.createElement("tbody", null,
                                [
                                  ["Upload documents, images, PDFs, data, and source code", "Agents can inspect, summarize, transform, and cite each file"],
                                  ["Organize assets in folders inside each computer", "Every thread can work against the same durable file base"],
                                  ["Preview and edit text or code without leaving the workspace", "Changes are saved back for later runs, reports, and deploys"],
                                  ["Attach files to projects, tasks, and generated outputs", "Project context stays connected to the work that created it"],
                                ].map((row) =>
                                  React.createElement("tr", { key: row[0] },
                                    React.createElement("td", null, "- ", row[0]),
                                    React.createElement("td", null,
                                      React.createElement("span", { className: "playground-files-empty-folder-table-check", "aria-hidden": "true" }, "✓"),
                                      row[1]
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    : React.createElement("div", { className: "playground-files-state" },
                        projectFilterScope
                          ? projectFilterScope === "__all__"
                            ? "No project-linked files found in this location."
                            : "No files linked to the selected project were found in this location."
                          : currentEntries.length === 0
                            ? "This folder is empty"
                            : "No items match the current filter"
                      )
                  : viewMode === "list"
                    ? React.createElement("div", { className: "playground-files-entry-list" }, visibleRows.map(renderEntryRow))
                    : React.createElement("div", { className: "playground-files-grid" }, filteredCurrentEntries.map(renderGridItem));
        }

        function renderChangesBrowserContent() {
          if (!selectedEnvironmentId) {
            return React.createElement("div", { className: "playground-files-state" }, "Select an environment to inspect changes.");
          }
          return React.createElement(EnvironmentChangesPage, {
            backendUrl,
            requestHeaders,
            environmentId: selectedEnvironmentId,
            environmentName: selectedEnvironment?.name || "",
            availableProjects: availableProjectFilters,
            projectFilterScope,
            operationFilter: changesOperationFilter,
            actorFilter: changesActorFilter,
            onAvailableActorsChange: setAvailableChangeActors,
            onOperationFilterChange: setChangesOperationFilter,
            onShowInFiles: navigateToFilesSelection,
            onScreenModeChange: setChangesViewMode,
          });
        }

        const isBackgroundDropTarget = dragOverTargetPath === "__current__";

        return React.createElement("div", { className: "playground-files-page" },
          React.createElement("input", {
            ref: uploadInputRef,
            type: "file",
            className: "profile-editor-file-input",
            multiple: true,
            onChange: handleUploadSelection,
          }),
          React.createElement("div", {
            ref: filesShellRef,
            className: "playground-files-shell"
              + (hasPreviewPanel ? " has-preview" : "")
              + (hasFileChatPanel ? " has-file-chat" : "")
              + (isBrowserMinimized ? " is-browser-minimized" : "")
              + (isPreviewMaximized ? " is-preview-maximized" : "")
              + (activeResizePane ? " is-resizing" : ""),
            style: hasPreviewPanel
              ? {
                  "--playground-files-preview-width": isPreviewMaximized ? "100%" : (previewPanelWidth !== null ? previewPanelWidth + "px" : "50%"),
                  "--playground-files-chat-width": hasFileChatPanel && !isPreviewMaximized
                    ? (fileChatPanelWidth !== null ? fileChatPanelWidth + "px" : FILE_CHAT_PANEL_DEFAULT_WIDTH + "px")
                    : "0px",
                }
              : undefined,
          },
            React.createElement("button", {
              type: "button",
              className: "playground-files-browser-minimized-toggle",
              onClick: expandBrowserPane,
              title: "Expand file list",
              "aria-label": "Expand file list",
            }, React.createElement(PanelLeftOpen, {
              className: "playground-files-browser-minimized-toggle-icon",
              strokeWidth: 1.75,
            })),
            React.createElement("section", { className: "playground-files-browser" },
              React.createElement("div", { className: "playground-files-browser-header" },
                toolbarPopover
                  ? React.createElement(PlatformPopupDismissLayer, {
                      className: "playground-files-search-backdrop",
                      onClick: () => setToolbarPopover(""),
                    })
                  : null,
                React.createElement("div", { className: "playground-files-topbar" },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-files-environment-select-shell" },
                    React.createElement("button", {
	                      type: "button",
	                      className: "playground-files-inline-selector" + (toolbarPopover === "environment" ? " active" : ""),
	                      onClick: () => {
	                        setFilesEnvironmentMenuMode(isConnectorsMode ? "connectors" : projectFilterScope ? "projects" : "computers");
	                        toggleToolbarPopover("environment");
	                      },
	                    },
                      React.createElement("span", null,
                        isConnectorsMode
                          ? activeFileConnectorSource?.label || "Connectors"
                          : projectFilterScope
                          ? activeProjectFilterOption.label
                          : selectedEnvironment?.name || "No environments available"
                      ),
                      React.createElement(ChevronDown, {
                        className: "playground-files-inline-selector-chevron",
                        strokeWidth: 1.85,
                      })
	                    ),
	                    toolbarPopover === "environment" ? renderFilesEnvironmentSelectMenu() : null,
                    renderEnvironmentActionsControl()
                  ),
                  renderFilesModeSwitch(),
                  React.createElement("div", { className: "playground-files-topbar-actions" },
                    showBrowserMinimizeButton
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-files-header-icon-button is-plain",
                          onClick: () => setBrowserPaneMode("manual"),
                          title: "Minimize file list",
                          "aria-label": "Minimize file list",
                        }, React.createElement(PanelLeftClose, { width: 16, height: 16, strokeWidth: 1.8 }))
                      : null,
                    React.createElement("div", { className: "playground-files-toolbar-anchor" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-header-icon-button is-plain" + (toolbarPopover === "search" ? " is-active" : ""),
                        onClick: () => toggleToolbarPopover("search"),
                        title: "Search files",
                      }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                      toolbarPopover === "search"
                        ? React.createElement(PlatformPopupSurface, { className: "playground-files-search-popover" },
                            React.createElement("div", { className: "playground-files-search-popover-header" },
                              React.createElement("div", { className: "playground-files-search-popover-title" }, "Search Files"),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-files-search-popover-close",
                                onClick: () => setToolbarPopover(""),
                              }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                            ),
                            React.createElement("div", { className: "playground-files-search-popover-body" },
                              React.createElement("div", { className: "playground-files-search-field" },
                                React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                                React.createElement("input", {
                                  ref: searchPopupInputRef,
                                  type: "text",
                                  className: "playground-files-search-field-input",
                                  placeholder: "Search by file name or path...",
                                  value: searchPopupQuery,
                                  onChange: (event) => setSearchPopupQuery(event.target.value),
                                })
                              ),
                              searchPopupQuery.trim()
                                ? searchResults.length > 0
                                  ? React.createElement("div", { className: "playground-files-search-results" },
                                      searchResults.map((entry) =>
                                        React.createElement("button", {
                                            key: entry.path,
                                            type: "button",
                                            className: "playground-files-search-result",
                                            onClick: () => handleSearchResultSelect(entry),
                                          },
                                            React.createElement(PlaygroundFileIcon, { entry }),
                                            React.createElement("div", { className: "playground-files-search-result-copy" },
                                              React.createElement("div", { className: "playground-files-search-result-name" }, entry.name),
                                              React.createElement("div", { className: "playground-files-search-result-path" }, "/" + entry.path)
                                            )
                                          )
                                      )
                                    )
                                  : isSearchInventoryLoading
                                    ? React.createElement(PlatformLoadingState, {
                                        centered: true,
                                        className: "playground-files-state",
                                        message: "Searching files...",
                                      })
                                    : React.createElement("div", { className: "playground-files-search-empty" }, "No matching files found.")
                                : React.createElement("div", { className: "playground-files-search-empty" }, "Type a file name or path to search this environment.")
                            )
                          )
                        : null
                    ),
                    isFilesMode
                      ? React.createElement("div", { className: "playground-files-toolbar-anchor" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-files-header-icon-button" + (toolbarPopover === "create" ? " is-active" : ""),
                            onClick: () => toggleToolbarPopover("create"),
                            title: "Create or upload",
                          }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 })),
                          shouldRenderFilesToolbarMenu("create")
                            ? renderAnimatedFilesCreateMenu()
                            : null
                        )
                      : null
                  )
                ),
                isFilesMode || isConnectorsMode
                  ? renderFilesLibraryHeader()
                  : null,
                actionError
                  ? React.createElement("div", { className: "playground-files-action-error" }, actionError)
                  : null
              ),
              React.createElement("div", {
                className: "playground-files-browser-body"
                  + (isChangesMode ? " is-changes-view" : "")
                  + (isConnectorsMode ? " is-connectors-view" : "")
                  + (isFilesMode && isBackgroundDropTarget ? " is-drop-target" : "")
                  + (isFilesMode && isExternalFileDropActive ? " is-file-drop-active" : ""),
                onClick: isFilesMode
                  ? (event) => {
                      if (event.target === event.currentTarget) {
                        clearSelection();
                        closeContextMenu();
                      }
                    }
                  : undefined,
                onContextMenu: isFilesMode
                  ? (event) => {
                      if (event.target === event.currentTarget) {
                        handleContextMenu(event, null);
                      }
                    }
                  : undefined,
                onDragEnter: isFilesMode ? handleFilesBrowserDragEnter : undefined,
                onDragOver: isFilesMode ? handleFilesBrowserDragOver : undefined,
                onDragLeave: isFilesMode ? handleFilesBrowserDragLeave : undefined,
                onDrop: isFilesMode ? (event) => void handleBrowserDrop(event) : undefined,
              },
                isFilesMode && isExternalFileDropActive
                  ? React.createElement("div", { className: "playground-files-screen-drop-overlay" },
                      React.createElement("div", { className: "playground-files-screen-drop-overlay-panel" },
                        React.createElement("div", { className: "playground-files-screen-drop-overlay-illustration", "aria-hidden": "true" },
                          React.createElement("div", { className: "playground-files-screen-drop-overlay-icon-card playground-files-screen-drop-overlay-icon-card-back" },
                            React.createElement(Code, { className: "playground-files-screen-drop-overlay-icon", strokeWidth: 1.75 })
                          ),
                          React.createElement("div", { className: "playground-files-screen-drop-overlay-icon-card playground-files-screen-drop-overlay-icon-card-front" },
                            React.createElement(ImageIcon, { className: "playground-files-screen-drop-overlay-icon", strokeWidth: 1.75 })
                          ),
                          React.createElement("div", { className: "playground-files-screen-drop-overlay-icon-card playground-files-screen-drop-overlay-icon-card-side" },
                            React.createElement(FileText, { className: "playground-files-screen-drop-overlay-icon", strokeWidth: 1.75 })
                          )
                        ),
                        React.createElement("div", { className: "playground-files-screen-drop-overlay-title" }, "Add files"),
                        React.createElement("div", { className: "playground-files-screen-drop-overlay-copy" },
                          isUploadingFiles ? "Uploading files to this folder..." : "Drop files here to upload them to this folder"
                        )
                      )
                    )
                  : null,
                isChangesMode
                  ? renderChangesBrowserContent()
                  : isConnectorsMode
                    ? renderFileConnectorsBrowser()
                    : renderFilesBrowserContent()
              )
            ),
            React.createElement("aside", {
              className: "playground-files-preview",
              "aria-hidden": hasPreviewPanel ? "false" : "true",
            }, hasPreviewPanel ? renderPreviewPanel() : null)
          ),
          renderContextMenu(),
          renderFileProjectPickerModal(),
          renderFileComputerPickerModal(),
          renderFileTeamPickerModal()
        );
      }
`;
