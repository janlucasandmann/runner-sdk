export const APP_HEADER_SEARCH_MODAL_SCRIPT = `        function renderAppHeaderSearchModal() {
          if (!threadSearchOpen) {
            return null;
          }

          return React.createElement(PlatformModalBackdrop, {
              className: "thread-search-scrim",
              onClick: closeThreadSearch,
            },
              React.createElement(PlatformModalSurface, {
                className: "thread-search-modal",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "thread-search-input-row" },
                  React.createElement("input", {
                    ref: threadSearchInputRef,
                    className: "thread-search-input",
                    type: "text",
                    placeholder: "Search threads and files...",
                    value: threadSearchQuery,
                    onChange: (event) => setThreadSearchQuery(event.target.value),
                  }),
                  React.createElement(Search, { className: "thread-search-input-icon", strokeWidth: 1.9 })
                ),
                React.createElement("div", { className: "thread-search-body" },
                  React.createElement("section", { className: "thread-search-section" },
                    React.createElement("div", { className: "thread-search-section-header" },
                      React.createElement("span", { className: "thread-search-section-label" }, "Actions"),
                      React.createElement("button", {
                        type: "button",
                        className: "thread-search-section-link",
                        onClick: () => {
                          setThreadSearchQuery("");
                          if (threadSearchInputRef.current) {
                            threadSearchInputRef.current.focus();
                          }
                        },
                      }, "Show All")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "thread-search-action-card",
                      onClick: handleThreadSearchCreate,
                    },
                      React.createElement(SquarePen, { className: "thread-search-action-icon", strokeWidth: 1.9 }),
                      React.createElement("span", { className: "thread-search-action-copy" }, "Create New Chat")
                    )
                  ),
                  normalizedThreadSearchQuery
                    ? React.createElement("section", { className: "thread-search-section" },
                        React.createElement("div", { className: "thread-search-section-header" },
                          React.createElement("span", { className: "thread-search-section-label" }, "Files")
                        ),
                        isThreadSearchFileLoading && filteredThreadSearchFileItems.length === 0
                          ? React.createElement("div", { className: "thread-search-empty-state" }, "Searching files...")
                          : filteredThreadSearchFileItems.length === 0
                            ? React.createElement("div", { className: "thread-search-empty-state" }, "No files found.")
                            : React.createElement("div", { className: "thread-search-result-list" },
                                filteredThreadSearchFileItems.map((fileResult) => {
                                  const filePath = normalizeHistoryPath(fileResult.entry?.path || "");
                                  const fileName = fileResult.entry?.name || filePath.split("/").filter(Boolean).pop() || filePath || "Untitled file";
                                  return React.createElement("button", {
                                    key: fileResult.key,
                                    type: "button",
                                    className: "thread-search-result",
                                    onClick: () => handleThreadSearchFileSelect(fileResult),
                                  },
                                    React.createElement(FileText, { className: "thread-search-result-icon", strokeWidth: 1.85 }),
                                    React.createElement("span", { className: "thread-search-result-copy" },
                                      React.createElement("span", { className: "thread-search-result-title" }, fileName),
                                      React.createElement("span", { className: "thread-search-result-subtitle" }, "/" + filePath)
                                    ),
                                    React.createElement("span", { className: "thread-search-result-time" }, fileResult.environmentName)
                                  );
                                })
                              )
                      )
                    : null,
                  isThreadsLoading && searchableThreadItems.length === 0
                    ? React.createElement("div", { className: "thread-search-empty-state" }, "Loading conversations...")
                    : groupedThreadSearchItems.length === 0
                      ? React.createElement("div", { className: "thread-search-empty-state" }, "No conversations found.")
                      : groupedThreadSearchItems.map((group) =>
                          React.createElement("section", {
                            key: group.key,
                            className: "thread-search-section",
                          },
                            React.createElement("div", { className: "thread-search-section-header" },
                              React.createElement("span", { className: "thread-search-section-label" }, group.label)
                            ),
                            React.createElement("div", { className: "thread-search-result-list" },
                              group.items.map((thread) =>
                                React.createElement("button", {
                                  key: thread.id,
                                  type: "button",
                                  className: "thread-search-result" + (activeSidebarThreadId === thread.id ? " is-active" : ""),
                                  onClick: () => handleThreadSearchSelect(thread.id),
                                },
                                  React.createElement("span", { className: "thread-search-result-title" }, thread.title),
                                  React.createElement("span", { className: "thread-search-result-time" }, formatThreadSearchTimestamp(resolveThreadSortTimestamp(thread)))
                                )
                              )
                            )
                          )
                        )
                ),
                React.createElement("div", { className: "thread-search-footer" },
                  React.createElement("div", { className: "thread-search-footer-copy" },
                    React.createElement(ArrowUpRight, { className: "thread-search-footer-icon", strokeWidth: 1.85 }),
                    React.createElement("span", null, "Open result")
                  ),
                  React.createElement("div", { className: "thread-search-footer-meta" },
                    React.createElement("span", null, threadSearchTotalResultCount + " result" + (threadSearchTotalResultCount === 1 ? "" : "s")),
                    React.createElement("span", { className: "thread-search-footer-separator" }, "•"),
                    React.createElement("span", null, "Esc close")
                  )
                )
              )
            );
        }
`;
