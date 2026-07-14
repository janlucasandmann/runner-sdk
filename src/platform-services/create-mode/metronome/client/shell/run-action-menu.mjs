export const METRONOME_APP_RUN_ACTION_MENU_SCRIPT = `
        function renderMetronomeRunActionMenu() {
          if (!metronomeRunActionMenuState || !metronomeRunActionTarget) {
            return null;
          }

          const threads = getMetronomeRunEntryThreads(metronomeRunActionTarget);
          const representativeThread = getMetronomeRunRepresentativeThread(metronomeRunActionTarget);
          const representativeThreadId = String(representativeThread?.id || "").trim();
          const canMutateRepresentativeThread = Boolean(representativeThreadId && isRealThreadId(representativeThreadId));
          const isPinned = Boolean(representativeThread?.isPinned);
          const hasProjectAssignment = Boolean(String(representativeThread?.projectId || "").trim());
          const isDeletingRun = threadMutationState.action === "delete-metronome-run" && threadMutationState.threadId === String(metronomeRunActionTarget.key || "").trim();
          const isPinMutating = threadMutationState.action === "pin" && threadMutationState.threadId === representativeThreadId;
          const isProjectMutating = threadMutationState.action === "project" && threadMutationState.threadId === representativeThreadId;
          const startedTimestamp = threads.reduce((minimum, thread) => {
            const timestamp = getMetronomeRunThreadTimestamp(thread, "created");
            if (!timestamp) return minimum;
            return minimum ? Math.min(minimum, timestamp) : timestamp;
          }, 0);
          const updatedTimestamp = threads.reduce((maximum, thread) => {
            const timestamp = getMetronomeRunThreadTimestamp(thread, "updated");
            return timestamp ? Math.max(maximum, timestamp) : maximum;
          }, 0);
          const agentCtTotal = threads.reduce((sum, thread) => sum + Number(thread?.agentCT || thread?.agentCt || 0), 0);
          const resourceCtTotal = threads.reduce((sum, thread) => sum + Number(thread?.environmentCT || thread?.resourceCT || thread?.environmentCt || 0), 0);
          const metronomeId = String(metronomeRunActionTarget.metronomeId || metronomeRunActionTarget.workflowId || "").trim();
          const runId = String(metronomeRunActionTarget.runId || metronomeRunActionTarget.workflowRunId || "").trim();
          const renderFactRow = (label, value, title = value) => React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
            React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" }),
            React.createElement("div", { className: "playground-thread-nav-popup-fact" },
              React.createElement("span", { className: "playground-thread-nav-popup-fact-label" }, label),
              React.createElement("span", {
                className: "playground-thread-nav-popup-fact-value",
                title: title || value,
              }, value || "Unknown")
            )
          );

          return React.createElement(PlatformPopupDismissLayer, {
              className: "sidebar-thread-popup-scrim playground-thread-nav-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal",
              onClick: closeMetronomeRunActionMenu,
            },
              React.createElement(PlatformPopupSurface, {
                className: "playground-tasks-toolbar-popup-menu playground-thread-nav-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-metronome-run-action-menu",
                style: {
                  top: metronomeRunActionMenuState.top + "px",
                  left: metronomeRunActionMenuState.left + "px",
                },
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "tb-popup-menu-title" }, "Metronome Run"),
                renderFactRow("Metronome ID", metronomeId || "Unknown", metronomeId),
                renderFactRow("Run ID", runId || "Unknown", runId),
                renderFactRow("Started", startedTimestamp ? formatPlaygroundFileDate(new Date(startedTimestamp).toISOString()) : "Unknown"),
                renderFactRow("Last updated", updatedTimestamp ? formatPlaygroundFileDate(new Date(updatedTimestamp).toISOString()) : "Unknown"),
                renderFactRow("LLM Inference", formatSettingsComputeTokens(agentCtTotal)),
                renderFactRow("Resources", formatSettingsComputeTokens(resourceCtTotal)),
                React.createElement("div", { className: "playground-thread-nav-popup-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  onClick: () => {
                    if (canMutateRepresentativeThread) {
                      void handleThreadPinToggle(representativeThreadId);
                    }
                  },
                  disabled: !canMutateRepresentativeThread || isDeletingRun || isPinMutating || isProjectMutating,
                },
                  React.createElement(Pin, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null,
                      isPinMutating
                        ? (isPinned ? "Unpinning run..." : "Pinning run...")
                        : (isPinned ? "Unpin run" : "Pin run")
                    )
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  onClick: () => {
                    if (representativeThread) {
                      setMetronomeRunActionMenuState(null);
                      openThreadRenameDialog(representativeThread);
                    }
                  },
                  disabled: !canMutateRepresentativeThread || isDeletingRun || isPinMutating || isProjectMutating,
                },
                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, "Rename run")
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  onClick: () => {
                    if (representativeThread) {
                      setMetronomeRunActionMenuState(null);
                      handleOpenThreadProjectAction(representativeThread);
                    }
                  },
                  disabled: !canMutateRepresentativeThread || isDeletingRun || isPinMutating || isProjectMutating,
                },
                  React.createElement(FolderOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null,
                      isProjectMutating
                        ? (hasProjectAssignment ? "Removing from project..." : "Adding to project...")
                        : (hasProjectAssignment ? "Remove from Project" : "Add to Project")
                    )
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                  onClick: () => {
                    void handleMetronomeRunDelete(metronomeRunActionTarget);
                  },
                  disabled: isDeletingRun,
                },
                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, isDeletingRun ? "Deleting run..." : "Delete Run")
                  )
                )
              )
            );
        }

`;
