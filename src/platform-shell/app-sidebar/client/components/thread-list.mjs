export function createAppSidebarThreadListScript(options = {}) {
  const metronomeSidebarEntryScript = String(options.metronomeSidebarEntryScript || "");
  const metronomeRunActionMenuScript = String(options.metronomeRunActionMenuScript || "");
  return `${metronomeSidebarEntryScript}
        function getSidebarThreadProjectPresentation(safeThread, taskPreview, safeThreadId) {
          const missionControlMetadata = getThreadMissionControlMetadata(safeThread);
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
          if (!projectId) {
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
            id: projectId,
            title: String(
              projectRecord?.name
              || cachedProjectContext?.projectName
              || taskPreview?.projectName
              || missionControlMetadata?.projectName
              || safeThread?.projectName
              || "Project"
            ).trim() || "Project",
            Icon: iconConfig.icon || Rocket,
            color: String(
              projectRecord?.color
              || projectMetadata.color
              || taskPreview?.projectColor
              || missionControlMetadata?.projectColor
              || safeThread?.projectColor
              || cachedProjectContext?.projectColor
              || ""
            ).trim(),
          };
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
            const isRunning = String(safeThread?.status || "").trim().toLowerCase() === "running";
            const needsPermissionAttention = isPendingPermissionThreadDisplayStatus(safeThread?.status) || permissionAttentionThreadIds.has(safeThreadId);
            const canManageThread = hasRealAccess && isRealThreadId(safeThreadId);
            const isMenuOpen = canManageThread && threadActionMenuState?.threadId === safeThreadId;
            const isDeleting = threadMutationState.action === "delete" && threadMutationState.threadId === safeThreadId;
            const isPinMutating = threadMutationState.action === "pin" && threadMutationState.threadId === safeThreadId;
            const threadProject = getSidebarThreadProjectPresentation(safeThread, taskPreview, safeThreadId);
            const ThreadProjectIcon = threadProject?.Icon || Rocket;
            const threadMetaText = threadMetaLabel(safeThread);
            const threadLastActivityText = formatCompactThreadActivityTime(resolveThreadSortTimestamp(safeThread));
            const handleSidebarThreadSelect = () => {
              if (metronomeChild && safeThreadId && isRealThreadId(safeThreadId)) {
                upsertRealThreadRecord(safeThread, { status: safeThread.status || "running" });
              }
              handleThreadSelect(safeThreadId);
            };

            return React.createElement("div", {
              key: safeThreadId,
              className: (pinned ? "sidebar-pinned-button" : "sidebar-thread-item") + (isActive ? " is-active" : "") + (needsPermissionAttention ? " has-permission-attention" : "") + (metronomeChild ? " is-metronome-child" : ""),
            },
              pinned
                ? React.createElement(Pin, { className: "sidebar-pin-icon", strokeWidth: 1.75 })
                : null,
              React.createElement("button", {
                type: "button",
                className: "sidebar-thread-main",
                onClick: () => requestPlatformNavigation(handleSidebarThreadSelect),
                "aria-label": "Open " + displayThreadTitle + (needsPermissionAttention ? ", permission needed" : ""),
              },
                React.createElement("div", { className: "sidebar-thread-content" },
                  React.createElement("div", { className: "sidebar-thread-title-row" },
                    threadProject
                      ? React.createElement("span", {
                          className: "sidebar-thread-project-icon",
                          title: threadProject.title,
                          style: threadProject.color ? { color: threadProject.color } : undefined,
                        }, React.createElement(ThreadProjectIcon, { strokeWidth: 1.85 }))
                      : null,
                    isRunning
                      ? React.createElement(Loader2, { className: "sidebar-thread-running-indicator", strokeWidth: 1.9 })
                      : null,
                    needsPermissionAttention
                      ? React.createElement("span", { className: "sidebar-thread-attention-dot", title: "Permission needed" })
                      : null,
                    React.createElement("span", { className: "sidebar-thread-title-copy" },
                      taskTicketNumber
                        ? React.createElement("span", { className: "sidebar-thread-ticket-number" }, taskTicketNumber)
                        : null,
                      React.createElement("span", { className: "sidebar-thread-title" }, displayThreadTitle)
                    )
                  )
                )
              ),
              React.createElement("div", { className: "sidebar-thread-side" },
                React.createElement("span", { className: "sidebar-thread-meta" },
                  threadMetaText
                    ? React.createElement("span", { className: "sidebar-thread-meta-neutral" }, threadMetaText)
                    : null
                ),
                threadLastActivityText
                  ? React.createElement("span", {
                      className: "sidebar-thread-hover-meta",
                      title: formatThreadSearchTimestamp(resolveThreadSortTimestamp(safeThread)) || "",
                    }, threadLastActivityText)
                  : null,
                canManageThread
                  ? React.createElement("button", {
                      type: "button",
                      className: "sidebar-thread-menu-button" + (isMenuOpen ? " is-open" : ""),
                      onClick: (event) => openThreadActionMenu(event, safeThreadId),
                      "aria-label": "Thread actions",
                      "aria-expanded": isMenuOpen ? "true" : "false",
                      disabled: isDeleting || isPinMutating,
                    },
                      isDeleting || isPinMutating
                        ? React.createElement(Loader2, { className: "sidebar-thread-menu-icon is-spinning", strokeWidth: 1.85 })
                        : React.createElement(EllipsisVertical, { className: "sidebar-thread-menu-icon", strokeWidth: 1.85 })
                    )
                  : null
              )
            );
          } catch (error) {
            const fallbackThread = normalizeThreadItem(thread);
            const fallbackMetronomeMeta = options?.metronomeChild ? getThreadMetronomeMetadata(fallbackThread) : null;
            const fallbackSafeThreadId = typeof fallbackThread.id === "string" && fallbackThread.id.trim() ? fallbackThread.id.trim() : generateId("thread");
            const fallbackMetaText = threadMetaLabel(fallbackThread);
            const {
              taskTicketNumber,
              displayThreadTitle: fallbackRawDisplayThreadTitle,
            } = getSidebarThreadTitleParts(fallbackThread);
            const displayThreadTitle = options?.metronomeChild && fallbackMetronomeMeta?.nodeName
              ? fallbackMetronomeMeta.nodeName
              : fallbackRawDisplayThreadTitle;
            const canManageThread = hasRealAccess && isRealThreadId(fallbackSafeThreadId);
            const isMenuOpen = canManageThread && threadActionMenuState?.threadId === fallbackSafeThreadId;
            const isDeleting = threadMutationState.action === "delete" && threadMutationState.threadId === fallbackSafeThreadId;
            const isPinMutating = threadMutationState.action === "pin" && threadMutationState.threadId === fallbackSafeThreadId;
            const fallbackLastActivityText = formatCompactThreadActivityTime(resolveThreadSortTimestamp(fallbackThread));
            const fallbackNeedsPermissionAttention = isPendingPermissionThreadDisplayStatus(fallbackThread?.status) || permissionAttentionThreadIds.has(fallbackSafeThreadId);
            const handleFallbackSidebarThreadSelect = () => {
              if (options?.metronomeChild && fallbackSafeThreadId && isRealThreadId(fallbackSafeThreadId)) {
                upsertRealThreadRecord(fallbackThread, { status: fallbackThread.status || "running" });
              }
              handleThreadSelect(fallbackSafeThreadId);
            };
            console.error("Failed to render sidebar thread row", error, thread);
            return React.createElement("div", {
              key: fallbackSafeThreadId,
              className: (options?.pinned ? "sidebar-pinned-button" : "sidebar-thread-item") + (activeSidebarThreadId === fallbackSafeThreadId ? " is-active" : "") + (fallbackNeedsPermissionAttention ? " has-permission-attention" : "") + (options?.metronomeChild ? " is-metronome-child" : ""),
            },
              options?.pinned
                ? React.createElement(Pin, { className: "sidebar-pin-icon", strokeWidth: 1.75 })
                : null,
              React.createElement("button", {
                type: "button",
                className: "sidebar-thread-main",
                onClick: () => requestPlatformNavigation(handleFallbackSidebarThreadSelect),
                "aria-label": "Open " + displayThreadTitle + (fallbackNeedsPermissionAttention ? ", permission needed" : ""),
              },
                React.createElement("div", { className: "sidebar-thread-content" },
                  React.createElement("div", { className: "sidebar-thread-title-row" },
                    fallbackNeedsPermissionAttention
                      ? React.createElement("span", { className: "sidebar-thread-attention-dot", title: "Permission needed" })
                      : null,
                    React.createElement("span", { className: "sidebar-thread-title-copy" },
                      taskTicketNumber
                        ? React.createElement("span", { className: "sidebar-thread-ticket-number" }, taskTicketNumber)
                        : null,
                      React.createElement("span", { className: "sidebar-thread-title" }, displayThreadTitle)
                    )
                  )
                )
              ),
              React.createElement("div", { className: "sidebar-thread-side" },
                React.createElement("span", { className: "sidebar-thread-meta" },
                  fallbackMetaText
                    ? React.createElement("span", { className: "sidebar-thread-meta-neutral" }, fallbackMetaText)
                    : null
                ),
                fallbackLastActivityText
                  ? React.createElement("span", {
                      className: "sidebar-thread-hover-meta",
                      title: formatThreadSearchTimestamp(resolveThreadSortTimestamp(fallbackThread)) || "",
                    }, fallbackLastActivityText)
                  : null,
                canManageThread
                  ? React.createElement("button", {
                      type: "button",
                      className: "sidebar-thread-menu-button" + (isMenuOpen ? " is-open" : ""),
                      onClick: (event) => openThreadActionMenu(event, fallbackSafeThreadId),
                      "aria-label": "Thread actions",
                      "aria-expanded": isMenuOpen ? "true" : "false",
                      disabled: isDeleting || isPinMutating,
                    },
                      isDeleting || isPinMutating
                        ? React.createElement(Loader2, { className: "sidebar-thread-menu-icon is-spinning", strokeWidth: 1.85 })
                        : React.createElement(EllipsisVertical, { className: "sidebar-thread-menu-icon", strokeWidth: 1.85 })
                    )
                  : null
              )
            );
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
