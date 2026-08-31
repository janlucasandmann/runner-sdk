import { APP_SIDEBAR_THREAD_LIST_ITEM_SCRIPT } from "./thread-list-item.mjs";

export function createAppSidebarThreadListScript(options = {}) {
  const metronomeSidebarEntryScript = String(options.metronomeSidebarEntryScript || "");
  const metronomeRunActionMenuScript = String(options.metronomeRunActionMenuScript || "");
  return `${APP_SIDEBAR_THREAD_LIST_ITEM_SCRIPT}${metronomeSidebarEntryScript}
        function getSidebarThreadProjectPresentation(safeThread, taskPreview, safeThreadId) {
          const missionControlMetadata = getThreadMissionControlMetadata(safeThread);
          const isMissionControl = Boolean(missionControlMetadata);
          const taskContext = safeThread?.metadata?.taskContext
            && typeof safeThread.metadata.taskContext === "object"
            && !Array.isArray(safeThread.metadata.taskContext)
              ? safeThread.metadata.taskContext
              : {};
          const taskType = String(
            taskPreview?.taskType
            || taskPreview?.type
            || safeThread?.taskType
            || taskContext.taskType
            || ""
          ).trim().toLowerCase();
          const isTaskLoop = !isMissionControl && (
            taskType === "loop"
            || Boolean(String(taskContext.loopRole || "").trim())
          );
          const cachedProjectContext = safeThreadId
            ? (threadProjectContextById[safeThreadId] || null)
            : null;
          const projectId = String(
            taskPreview?.projectId
            || missionControlMetadata?.projectId
            || safeThread?.projectId
            || cachedProjectContext?.projectId
            || ""
          ).trim();
          if (!projectId && !isMissionControl) {
            return null;
          }

          const cachedProjectRecord = threadProjectRecordsById[projectId] || null;
          const listedProjectRecord = (Array.isArray(realProjects) ? realProjects : [])
            .find((project) => String(project?.id || "").trim() === projectId) || null;
          const projectRecord = mergePlaygroundProjectRecords(listedProjectRecord, cachedProjectRecord);
          const projectMetadata = projectRecord?.metadata
            && typeof projectRecord.metadata === "object"
            && !Array.isArray(projectRecord.metadata)
              ? projectRecord.metadata
              : {};
          const iconConfig = getPlaygroundProjectIconConfig(
            resolvePlaygroundProjectIconId(
              projectRecord,
              taskPreview?.projectIcon,
              missionControlMetadata?.projectIcon,
              safeThread?.projectIcon,
              cachedProjectContext?.projectIcon
            )
          );

          return {
            id: projectId || "mission-control",
            title: String(
              isMissionControl
                ? "Mission Control"
                : projectRecord?.name
              || cachedProjectContext?.projectName
              || taskPreview?.projectName
              || missionControlMetadata?.projectName
              || safeThread?.projectName
              || "Project"
            ).trim() || "Project",
            Icon: isMissionControl
              ? RefreshCcwDot
              : isTaskLoop
                ? RefreshCw
                : (iconConfig.icon || Rocket),
            isMissionControl,
            isTaskLoop,
            color: String(
              isMissionControl
                ? ""
                : projectRecord?.color
              || projectMetadata.color
              || taskPreview?.projectColor
              || missionControlMetadata?.projectColor
              || safeThread?.projectColor
              || cachedProjectContext?.projectColor
              || ""
            ).trim(),
          };
        }

        function isSidebarThreadActuallyRunning(thread, metronomeChild = false) {
          if (metronomeChild) {
            return resolveMetronomeThreadLifecycle([{ record: thread, source: "sidebar-thread" }]).isRunning;
          }
          const completedAt = String(
            thread?.completedAt
            || thread?.completed_at
            || thread?.finishedAt
            || thread?.finished_at
            || thread?.endedAt
            || thread?.ended_at
            || ""
          ).trim();
          if (completedAt) return false;
          const status = String(
            thread?.status
            || thread?.state
            || thread?.executionStatus
            || thread?.execution_status
            || ""
          ).trim().toLowerCase().replace(/[\\s-]+/g, "_");
          return ["active", "executing", "in_progress", "processing", "running", "started", "starting", "working"].includes(status);
        }

        function getSidebarThreadLeadingPresentation(threadProject, metronomeChild = false) {
          if (threadProject) {
            const ThreadProjectIcon = threadProject.Icon || Rocket;
            return {
              icon: React.createElement(ThreadProjectIcon, { strokeWidth: 1.85 }),
              className: "sidebar-thread-project-icon"
                + (threadProject.isMissionControl ? " is-mission-control" : "")
                + (threadProject.isTaskLoop ? " is-loop" : ""),
              title: threadProject.title,
              style: threadProject.color ? { color: threadProject.color } : undefined,
            };
          }
          if (metronomeChild) {
            return {
              icon: React.createElement(WorkflowsSidebarIcon, { strokeWidth: 1.85 }),
              className: "sidebar-thread-project-icon is-workflow",
              title: "Workflow thread",
              style: undefined,
            };
          }
          return null;
        }

        function renderSidebarThreadRow(thread, options = {}) {
          try {
            const { pinned = false, metronomeChild = false } = options;
            const {
              safeThread,
              taskPreview,
              taskTicketNumber,
              displayThreadTitle: rawDisplayThreadTitle,
            } = getSidebarThreadTitleParts(thread);
            const metronomeMeta = metronomeChild ? getThreadMetronomeMetadata(safeThread) : null;
            const displayThreadTitle = metronomeChild && metronomeMeta?.nodeName
              ? metronomeMeta.nodeName
              : rawDisplayThreadTitle;
            const safeThreadId = typeof safeThread.id === "string" && safeThread.id.trim() ? safeThread.id.trim() : generateId("thread");
            const isActive = activeSidebarThreadId === safeThreadId;
            const isRunning = isSidebarThreadActuallyRunning(safeThread, metronomeChild);
            const needsPermissionAttention = isPendingPermissionThreadDisplayStatus(safeThread?.status) || permissionAttentionThreadIds.has(safeThreadId);
            const canManageThread = hasRealAccess && isRealThreadId(safeThreadId);
            const isMenuOpen = canManageThread && threadActionMenuState?.threadId === safeThreadId;
            const isDeleting = threadMutationState.action === "delete" && threadMutationState.threadId === safeThreadId;
            const isPinMutating = threadMutationState.action === "pin" && threadMutationState.threadId === safeThreadId;
            const threadProject = getSidebarThreadProjectPresentation(safeThread, taskPreview, safeThreadId);
            const leadingPresentation = getSidebarThreadLeadingPresentation(threadProject, metronomeChild);
            const threadLastActivityTimestamp = resolveThreadSortTimestamp(safeThread);
            const threadLastActivityText = formatCompactThreadActivityTime(threadLastActivityTimestamp);
            const handleSidebarThreadSelect = () => {
              if (metronomeChild && safeThreadId && isRealThreadId(safeThreadId)) {
                upsertRealThreadRecord(safeThread, { status: safeThread.status || "running" });
              }
              handleThreadSelect(safeThreadId);
            };

            return React.createElement(SidebarThreadListItem, {
              key: safeThreadId,
              active: isActive,
              pinned,
              nested: metronomeChild,
              attention: needsPermissionAttention,
              running: isRunning,
              title: displayThreadTitle,
              ticketNumber: taskTicketNumber,
              leadingIcon: leadingPresentation?.icon || null,
              leadingClassName: leadingPresentation?.className || "",
              leadingTitle: leadingPresentation?.title || "",
              leadingStyle: leadingPresentation?.style,
              timeLabel: threadLastActivityText,
              timeTitle: formatThreadSearchTimestamp(threadLastActivityTimestamp) || "",
              trailingAction: canManageThread ? "menu" : "none",
              menuOpen: isMenuOpen,
              menuBusy: isDeleting || isPinMutating,
              menuDisabled: isDeleting || isPinMutating,
              onMenuClick: (event) => openThreadActionMenu(event, safeThreadId),
              onSelect: () => requestPlatformNavigation(handleSidebarThreadSelect),
              selectAriaLabel: "Open " + displayThreadTitle + (needsPermissionAttention ? ", permission needed" : ""),
            });
          } catch (error) {
            const fallbackThread = normalizeThreadItem(thread);
            const metronomeChild = Boolean(options?.metronomeChild);
            const fallbackMetronomeMeta = metronomeChild ? getThreadMetronomeMetadata(fallbackThread) : null;
            const fallbackSafeThreadId = typeof fallbackThread.id === "string" && fallbackThread.id.trim() ? fallbackThread.id.trim() : generateId("thread");
            const fallbackIsRunning = isSidebarThreadActuallyRunning(fallbackThread, metronomeChild);
            const {
              taskTicketNumber,
              displayThreadTitle: fallbackRawDisplayThreadTitle,
            } = getSidebarThreadTitleParts(fallbackThread);
            const displayThreadTitle = metronomeChild && fallbackMetronomeMeta?.nodeName
              ? fallbackMetronomeMeta.nodeName
              : fallbackRawDisplayThreadTitle;
            const canManageThread = hasRealAccess && isRealThreadId(fallbackSafeThreadId);
            const isMenuOpen = canManageThread && threadActionMenuState?.threadId === fallbackSafeThreadId;
            const isDeleting = threadMutationState.action === "delete" && threadMutationState.threadId === fallbackSafeThreadId;
            const isPinMutating = threadMutationState.action === "pin" && threadMutationState.threadId === fallbackSafeThreadId;
            const fallbackLastActivityTimestamp = resolveThreadSortTimestamp(fallbackThread);
            const fallbackLastActivityText = formatCompactThreadActivityTime(fallbackLastActivityTimestamp);
            const fallbackNeedsPermissionAttention = isPendingPermissionThreadDisplayStatus(fallbackThread?.status) || permissionAttentionThreadIds.has(fallbackSafeThreadId);
            const fallbackLeadingPresentation = getSidebarThreadLeadingPresentation(null, metronomeChild);
            const handleFallbackSidebarThreadSelect = () => {
              if (metronomeChild && fallbackSafeThreadId && isRealThreadId(fallbackSafeThreadId)) {
                upsertRealThreadRecord(fallbackThread, { status: fallbackThread.status || "running" });
              }
              handleThreadSelect(fallbackSafeThreadId);
            };
            console.error("Failed to render sidebar thread row", error, thread);
            return React.createElement(SidebarThreadListItem, {
              key: fallbackSafeThreadId,
              active: activeSidebarThreadId === fallbackSafeThreadId,
              pinned: Boolean(options?.pinned),
              nested: metronomeChild,
              attention: fallbackNeedsPermissionAttention,
              running: fallbackIsRunning,
              title: displayThreadTitle,
              ticketNumber: taskTicketNumber,
              leadingIcon: fallbackLeadingPresentation?.icon || null,
              leadingClassName: fallbackLeadingPresentation?.className || "",
              leadingTitle: fallbackLeadingPresentation?.title || "",
              timeLabel: fallbackLastActivityText,
              timeTitle: formatThreadSearchTimestamp(fallbackLastActivityTimestamp) || "",
              trailingAction: canManageThread ? "menu" : "none",
              menuOpen: isMenuOpen,
              menuBusy: isDeleting || isPinMutating,
              menuDisabled: isDeleting || isPinMutating,
              onMenuClick: (event) => openThreadActionMenu(event, fallbackSafeThreadId),
              onSelect: () => requestPlatformNavigation(handleFallbackSidebarThreadSelect),
              selectAriaLabel: "Open " + displayThreadTitle + (fallbackNeedsPermissionAttention ? ", permission needed" : ""),
            });
          }
        }

        function renderThreadActionMenu() {
          if (!threadActionMenuState || !threadActionTarget) {
            return null;
          }

          const isPinned = Boolean(threadActionTarget.isPinned);
          const hasProjectAssignment = Boolean(String(threadActionTarget.projectId || "").trim());
          const isDeleting = threadMutationState.action === "delete" && threadMutationState.threadId === threadActionTarget.id;
          const isPinMutating = threadMutationState.action === "pin" && threadMutationState.threadId === threadActionTarget.id;
          const isProjectMutating = threadMutationState.action === "project" && threadMutationState.threadId === threadActionTarget.id;
          const contextualActions = Array.isArray(threadActionMenuState.menuActions)
            ? threadActionMenuState.menuActions
            : [];

          return React.createElement(PlatformPopupDismissLayer, {
              className: "sidebar-thread-popup-scrim",
              onClick: closeThreadActionMenu,
            },
              React.createElement(PlatformPopupSurface, {
                mode: "fixed",
                variant: "minimal",
                animation: "down-in",
                className: "sidebar-thread-popup",
                style: {
                  top: threadActionMenuState.top + "px",
                  left: threadActionMenuState.left + "px",
                },
                onClick: (event) => event.stopPropagation(),
              },
                contextualActions.map((action) => {
                  const ActionIcon = action?.icon || RefreshCw;
                  return React.createElement("button", {
                    key: action?.id || action?.label || "thread-action",
                    type: "button",
                    className: "tb-popup-row sidebar-thread-popup-row",
                    onClick: () => {
                      closeThreadActionMenu();
                      if (typeof action?.onSelect === "function") {
                        action.onSelect(threadActionTarget);
                      }
                    },
                    disabled: Boolean(action?.disabled) || isDeleting || isPinMutating || isProjectMutating,
                  },
                    React.createElement(ActionIcon, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "sidebar-thread-popup-row-label" }, action?.label || "Thread action")
                  );
                }),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row sidebar-thread-popup-row",
                  onClick: () => openThreadRenameDialog(threadActionTarget),
                  disabled: isDeleting || isPinMutating || isProjectMutating,
                },
                  React.createElement(SquarePen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Rename")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row sidebar-thread-popup-row",
                  onClick: () => handleOpenThreadProjectAction(threadActionTarget),
                  disabled: isDeleting || isPinMutating || isProjectMutating,
                },
                  React.createElement(FolderOpen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" },
                    isProjectMutating
                      ? (hasProjectAssignment ? "Removing from project..." : "Adding to project...")
                      : (hasProjectAssignment ? "Remove from Project" : "Add to Project")
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row sidebar-thread-popup-row",
                  onClick: () => {
                    void handleThreadPinToggle(threadActionTarget.id);
                  },
                  disabled: isDeleting || isPinMutating || isProjectMutating,
                },
                  React.createElement(Pin, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isPinMutating ? (isPinned ? "Unpinning..." : "Pinning...") : (isPinned ? "Unpin" : "Pin"))
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row sidebar-thread-popup-row is-danger",
                  onClick: () => {
                    void handleThreadDelete(threadActionTarget.id);
                  },
                  disabled: isDeleting || isPinMutating || isProjectMutating,
                },
                  React.createElement(Trash2, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isDeleting ? "Deleting..." : "Delete")
                )
              )
            );
        }

${metronomeRunActionMenuScript}
        function renderThreadRenameModal() {
          if (!threadRenameState) {
            return null;
          }

          return React.createElement(PlatformModalBackdrop, {
              className: "sidebar-thread-rename-scrim",
              onClick: closeThreadRenameDialog,
            },
              React.createElement(PlatformModalSurface, {
                as: "form",
                className: "sidebar-thread-rename-modal",
                onClick: (event) => event.stopPropagation(),
                onSubmit: (event) => {
                  void handleThreadRenameSubmit(event);
                },
              },
                React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Thread"),
                React.createElement("div", { className: "sidebar-thread-rename-copy" },
                  "Choose a new title for this thread."
                ),
                React.createElement("input", {
                  ref: threadRenameInputRef,
                  className: "sidebar-thread-rename-input",
                  value: threadRenameValue,
                  onChange: (event) => setThreadRenameValue(event.target.value),
                  placeholder: "Thread title",
                  disabled: isThreadRenamePending,
                }),
                threadRenameError
                  ? React.createElement("div", { className: "sidebar-thread-rename-error" }, threadRenameError)
                  : null,
                React.createElement("div", { className: "sidebar-thread-rename-actions" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "large",
                    type: "button",
                    className: "sidebar-thread-rename-button is-secondary",
                    onClick: closeThreadRenameDialog,
                    disabled: isThreadRenamePending,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "large",
                    type: "submit",
                    className: "sidebar-thread-rename-button is-primary",
                    disabled: isThreadRenamePending,
                  }, isThreadRenamePending ? "Saving..." : "Save")
                )
              )
            );
        }

        function renderThreadProjectPickerModal() {
          if (!threadProjectPickerState) {
            return null;
          }

          const isProjectAssignPending = threadMutationState.action === "project"
            && threadMutationState.threadId === threadProjectPickerState.threadId;
          const availableProjects = threadProjectPickerProjects;

          return React.createElement(PlatformModalBackdrop, {
              className: "sidebar-thread-rename-scrim",
              onClick: closeThreadProjectPickerDialog,
            },
              React.createElement(PlatformModalSurface, {
                as: "form",
                className: "sidebar-thread-rename-modal sidebar-thread-project-picker-modal",
                onClick: (event) => event.stopPropagation(),
                onSubmit: (event) => {
                  void handleThreadProjectPickerSubmit(event);
                },
              },
                React.createElement("div", { className: "sidebar-thread-rename-title" }, "Add to Project"),
                React.createElement("div", { className: "sidebar-thread-rename-copy" },
                  "Attach this thread to a project so it appears in project scope, including files and activity."
                ),
                threadProjectPickerLoading
                  ? React.createElement("div", { className: "sidebar-thread-project-picker-empty" }, "Loading projects...")
                  : availableProjects.length > 0
                  ? React.createElement("div", { className: "sidebar-thread-project-picker-list" },
                    availableProjects.map((project) => {
                        const projectId = String(project?.id || "").trim();
                        const isSelected = projectId === threadProjectPickerValue;
                        return React.createElement("button", {
                            key: projectId,
                            type: "button",
                            className: "sidebar-thread-project-picker-row" + (isSelected ? " is-selected" : ""),
                            disabled: isProjectAssignPending,
                            onClick: () => setThreadProjectPickerValue(projectId),
                          },
                            React.createElement("div", { className: "playground-tasks-project-row" },
                              React.createElement("div", { className: "playground-tasks-project-row-main" },
                                React.createElement("div", { className: "playground-tasks-project-row-title" }, project?.name || "Untitled Project")
                              ),
                              isSelected
                                ? React.createElement(Check, { width: 15, height: 15, strokeWidth: 1.9, "aria-hidden": "true" })
                                : null
                            )
                          );
                      })
                    )
                  : React.createElement("div", { className: "sidebar-thread-project-picker-empty" },
                      "No projects are available yet."
                    ),
                threadProjectPickerError
                  ? React.createElement("div", { className: "sidebar-thread-rename-error" }, threadProjectPickerError)
                  : null,
                React.createElement("div", { className: "sidebar-thread-rename-actions" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "large",
                    type: "button",
                    className: "sidebar-thread-rename-button is-secondary",
                    onClick: closeThreadProjectPickerDialog,
                    disabled: isProjectAssignPending,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "large",
                    type: "submit",
                    className: "sidebar-thread-rename-button is-primary",
                    disabled: isProjectAssignPending || threadProjectPickerLoading || availableProjects.length === 0 || !threadProjectPickerValue,
                  }, isProjectAssignPending ? "Saving..." : "Add to Project")
                )
              )
            );
        }

`;
}
