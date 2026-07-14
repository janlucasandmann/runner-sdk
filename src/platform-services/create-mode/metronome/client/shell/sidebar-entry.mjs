export const METRONOME_APP_SIDEBAR_ENTRY_SCRIPT = `
        function renderSidebarMetronomeRunEntry(entry) {
          const groupKey = String(entry?.key || "").trim();
          if (!groupKey) {
            return null;
          }
          const isCollapsed = Boolean(collapsedMetronomeRunGroups[groupKey]);
          const threads = Array.isArray(entry.threads) ? entry.threads : [];
          const latestThread = entry.latestThread || threads[0] || null;
          const lastActivityText = latestThread
            ? formatCompactThreadActivityTime(resolveThreadSortTimestamp(latestThread))
            : "";
          const activeRunId = String(metronomeTopNavState?.runId || "").trim();
          const isActiveMetronomeEditorRun = activePage === "metronome"
            && metronomeTopNavState?.mode === "editor"
            && String(metronomeTopNavState?.workflowId || "").trim() === String(entry.metronomeId || "").trim()
            && Boolean(activeRunId)
            && activeRunId === String(entry.runId || "").trim();
          const isActiveThreadRunTrace = activePage === "thread"
            && String(metronomeRunTraceSelection?.key || "").trim() === groupKey;
          const isActive = isActiveMetronomeEditorRun || isActiveThreadRunTrace;
          const isRunActive = isActiveMetronomeRunStatus(entry?.status);
          const isMenuOpen = metronomeRunActionMenuState?.key === groupKey;
          const isDeletingRun = threadMutationState.action === "delete-metronome-run" && threadMutationState.threadId === groupKey;

          return React.createElement("div", {
            key: groupKey,
            className: "sidebar-metronome-run-group" + (isCollapsed ? " is-collapsed" : "") + (isActive ? " is-active" : ""),
          },
            React.createElement("div", {
              className: "sidebar-metronome-run-item" + (isActive ? " is-active" : ""),
            },
              React.createElement("button", {
                type: "button",
                className: "sidebar-metronome-run-main",
                onClick: () => openMetronomeRunTraceThread(entry),
                "aria-label": "Open Metronome run " + (entry.workflowName || "Metronome"),
              },
                React.createElement("span", { className: "sidebar-metronome-run-icon" },
                  isRunActive
                    ? React.createElement(Loader2, { className: "sidebar-thread-running-indicator", strokeWidth: 1.9 })
                    : React.createElement(Metronome, { strokeWidth: 1.85 })
                ),
                React.createElement("span", { className: "sidebar-metronome-run-copy" },
                  React.createElement("span", { className: "sidebar-metronome-run-title" }, entry.workflowName || "Metronome")
                )
              ),
              React.createElement("div", { className: "sidebar-metronome-run-side" },
                lastActivityText
                  ? React.createElement("span", {
                      className: "sidebar-metronome-run-time",
                      title: latestThread ? formatThreadSearchTimestamp(resolveThreadSortTimestamp(latestThread)) || "" : "",
                    }, lastActivityText)
                  : null,
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-menu-button" + (isMenuOpen ? " is-open" : ""),
                  onClick: (event) => openMetronomeRunActionMenu(event, entry),
                  "aria-label": "Metronome run actions",
                  "aria-expanded": isMenuOpen ? "true" : "false",
                  disabled: isDeletingRun,
                },
                  isDeletingRun
                    ? React.createElement(Loader2, { className: "sidebar-thread-menu-icon is-spinning", strokeWidth: 1.85 })
                    : React.createElement(EllipsisVertical, { className: "sidebar-thread-menu-icon", strokeWidth: 1.85 })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-metronome-run-toggle",
                  onClick: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCollapsedMetronomeRunGroups((current) => ({
                      ...current,
                      [groupKey]: !current[groupKey],
                    }));
                  },
                  "aria-label": isCollapsed ? "Expand Metronome threads" : "Collapse Metronome threads",
                  "aria-expanded": isCollapsed ? "false" : "true",
                },
                  React.createElement(ChevronDown, { strokeWidth: 1.8 })
                )
              )
            ),
            !isCollapsed && threads.length
              ? React.createElement("div", { className: "sidebar-metronome-run-threads" },
                  threads.map((thread) => renderSidebarThreadRow(thread, { metronomeChild: true }))
                )
              : null
          );
        }

`;
