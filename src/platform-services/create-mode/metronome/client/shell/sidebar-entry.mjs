export const METRONOME_APP_SIDEBAR_ENTRY_SCRIPT = `
        function renderSidebarMetronomeRunEntry(entry) {
          const groupKey = String(entry?.key || "").trim();
          if (!groupKey) {
            return null;
          }
          const isCollapsed = collapsedMetronomeRunGroups[groupKey] !== false;
          const threads = Array.isArray(entry.threads) ? entry.threads : [];
          const threadLoadState = metronomeSidebarRunThreadLoadStateByKey?.[groupKey] || { status: "idle", error: "" };
          const isLoadingThreads = threadLoadState.status === "loading";
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
          const loopPresentation = getMetronomeTaskLoopPresentation(entry, {
            projects: realProjects,
            threads: realThreads,
          });
          const runTitle = loopPresentation.isTaskLoop
            ? loopPresentation.label
            : loopPresentation.isMissionControl
              ? loopPresentation.label
            : entry.workflowName || "Metronome";

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
                onClick: () => {
                  openMetronomeRunTraceThread(entry);
                },
                "aria-label": loopPresentation.isTaskLoop
                  ? "Open Loop " + runTitle
                  : loopPresentation.isMissionControl
                    ? "Open " + runTitle
                  : "Open Metronome run " + runTitle,
              },
                React.createElement("span", {
                  className: "sidebar-metronome-run-icon"
                    + (loopPresentation.isTaskLoop ? " is-loop" : "")
                    + (loopPresentation.isMissionControl ? " is-mission-control" : ""),
                },
                  loopPresentation.isTaskLoop
                    ? React.createElement(RefreshCw, { strokeWidth: 1.9 })
                    : loopPresentation.isMissionControl
                      ? React.createElement(RefreshCcwDot, { strokeWidth: 1.9 })
                    : isRunActive
                    ? React.createElement(Loader2, { className: "sidebar-thread-running-indicator", strokeWidth: 1.9 })
                    : React.createElement(WorkflowsSidebarIcon, { strokeWidth: 1.85 })
                ),
                React.createElement("span", { className: "sidebar-metronome-run-copy" },
                  React.createElement("span", { className: "sidebar-metronome-run-title" }, runTitle)
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
                    const shouldExpand = collapsedMetronomeRunGroups[groupKey] !== false;
                    setCollapsedMetronomeRunGroups((current) => ({
                      ...(current && typeof current === "object" ? current : {}),
                      [groupKey]: !shouldExpand,
                    }));
                    if (shouldExpand) {
                      void loadMetronomeSidebarRunThreads(entry);
                    }
                  },
                  "aria-label": isCollapsed ? "Expand Metronome threads" : "Collapse Metronome threads",
                  "aria-expanded": isCollapsed ? "false" : "true",
                  "aria-busy": isLoadingThreads ? "true" : "false",
                },
                  isLoadingThreads
                    ? React.createElement(Loader2, { className: "sidebar-thread-running-indicator", strokeWidth: 1.8 })
                    : React.createElement(isCollapsed ? ChevronRight : ChevronDown, { strokeWidth: 1.8 })
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
