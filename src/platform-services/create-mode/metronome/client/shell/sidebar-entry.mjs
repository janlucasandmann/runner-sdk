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
          const lastActivityTimestamp = latestThread
            ? resolveThreadSortTimestamp(latestThread)
            : entry?.updatedAt
              || entry?.updated_at
              || entry?.createdAt
              || entry?.created_at
              || entry?.startedAt
              || entry?.started_at
              || "";
          const lastActivityText = formatCompactThreadActivityTime(lastActivityTimestamp);
          const activeRunId = String(metronomeTopNavState?.runId || "").trim();
          const isActiveMetronomeEditorRun = activePage === "metronome"
            && metronomeTopNavState?.mode === "editor"
            && String(metronomeTopNavState?.workflowId || "").trim() === String(entry.metronomeId || "").trim()
            && Boolean(activeRunId)
            && activeRunId === String(entry.runId || "").trim();
          const isActiveThreadRunTrace = activePage === "thread"
            && String(metronomeRunTraceSelection?.key || "").trim() === groupKey;
          const isActive = isActiveMetronomeEditorRun || isActiveThreadRunTrace;
          const isContextMenuOpen = metronomeRunActionMenuState?.key === groupKey;
          const loopPresentation = getMetronomeTaskLoopPresentation(entry, {
            projects: realProjects,
            threads: realThreads,
          });
          const runTitle = loopPresentation.isTaskLoop
            ? loopPresentation.label
            : loopPresentation.isMissionControl
              ? loopPresentation.label
            : entry.workflowName || "Metronome";
          const leadingIcon = loopPresentation.isTaskLoop
            ? React.createElement(RefreshCw, { strokeWidth: 1.9 })
            : loopPresentation.isMissionControl
              ? React.createElement(RefreshCcwDot, { strokeWidth: 1.9 })
              : React.createElement(WorkflowsSidebarIcon, { strokeWidth: 1.85 });
          const leadingClassName = (loopPresentation.isTaskLoop ? "is-loop" : "")
            + (loopPresentation.isMissionControl ? " is-mission-control" : "");

          return React.createElement("div", {
            key: groupKey,
            className: "sidebar-metronome-run-group" + (isCollapsed ? " is-collapsed" : "") + (isActive ? " is-active" : ""),
          },
            React.createElement(SidebarThreadListItem, {
              variant: "workflow-overview",
              active: isActive,
              menuOpen: isContextMenuOpen,
              title: runTitle,
              leadingIcon,
              leadingClassName,
              leadingTitle: loopPresentation.isTaskLoop
                ? "Loop"
                : loopPresentation.isMissionControl
                  ? "Mission Control"
                  : "Workflow",
              timeLabel: lastActivityText,
              timeTitle: formatThreadSearchTimestamp(lastActivityTimestamp) || "",
              trailingAction: "chevron",
              expanded: !isCollapsed,
              chevronBusy: isLoadingThreads,
              chevronAriaLabel: isCollapsed ? "Expand workflow threads" : "Collapse workflow threads",
              onChevronClick: (event) => {
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
              onSelect: () => {
                openMetronomeRunTraceThread(entry);
              },
              onContextMenu: (event) => openMetronomeRunActionMenu(event, entry),
              selectAriaLabel: loopPresentation.isTaskLoop
                ? "Open Loop " + runTitle
                : loopPresentation.isMissionControl
                  ? "Open " + runTitle
                  : "Open workflow run " + runTitle,
            }),
            !isCollapsed && threads.length
              ? React.createElement("div", { className: "sidebar-metronome-run-threads" },
                  threads.map((thread) => renderSidebarThreadRow(thread, { metronomeChild: true }))
                )
              : null
          );
        }

`;
