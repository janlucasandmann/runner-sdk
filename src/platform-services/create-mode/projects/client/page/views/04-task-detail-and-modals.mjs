export const PROJECTS_VIEWS_04_FRAGMENT = `          }) {
            const isOpen = taskDetailSelectPopover === popoverId;
            return React.createElement("div", {
                className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell" + (isOpen ? " is-open" : ""),
                ref: isOpen ? taskDetailSelectPopoverRef : null,
              },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (isEmpty ? " is-empty" : "") + (isOpen ? " is-active" : ""),
                disabled,
                onClick: () => {
                  if (disabled) return;
                  toggleTaskDetailSelectPopover(popoverId);
                },
                title: valueLabel,
                "aria-expanded": isOpen ? "true" : "false",
              },
                buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
                React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
              ),
              isOpen
                ? React.createElement(PlatformPopupSurface, {
                    className: ("tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in " + menuClassName).trim(),
                  }, children)
                : null
            );
          }

          function renderTaskDetailAssigneeRow(actor) {
            const mode = getPlaygroundTaskAssigneePopupMode(actor);
            const actorLabel = getTaskAssigneeName(actor.id, actor.name || "Unknown");
            const actorDescription = mode === "humans"
              ? "Human"
              : mode === "teams"
                ? "Agent squad"
                : "Agent";
            return React.createElement("button", {
                key: actor.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (resolvedTaskAssigneeId === actor.id ? " selected" : ""),
                onClick: () => {
                  updateDraftField("assigneeAgentId", actor.id, { autosave: true });
                  setTaskDetailSelectPopover("");
                },
              },
              renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, actorLabel),
                React.createElement("span", null, actorDescription)
              ),
              React.createElement("span", { className: "tb-popup-check-slot" },
                resolvedTaskAssigneeId === actor.id
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              )
            );
          }

          function renderTaskDetailReviewerRow(actor) {
            const mode = getPlaygroundTaskAssigneePopupMode(actor);
            const actorLabel = getTaskAssigneeName(actor.id, actor.name || "Reviewer");
            const actorDescription = mode === "humans"
              ? "Human reviewer"
              : mode === "teams"
                ? "Agent squad reviewer"
                : "Agent reviewer";
            return React.createElement("button", {
                key: actor.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (draftTask.reviewRequired && resolvedTaskReviewerId === actor.id ? " selected" : ""),
                onClick: () => {
                  updateDraftTask((current) => ({
                    ...current,
                    reviewRequired: true,
                    reviewerAgentId: actor.id,
                  }), { autosave: true });
                  setTaskDetailSelectPopover("");
                },
              },
              renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, actorLabel),
                React.createElement("span", null, actorDescription)
              ),
              React.createElement("span", { className: "tb-popup-check-slot" },
                draftTask.reviewRequired && resolvedTaskReviewerId === actor.id
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              )
            );
          }

          function renderTaskDetailReviewerNoneRow() {
            return React.createElement("button", {
                key: "__none__",
                type: "button",
                className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (!draftTask.reviewRequired ? " selected" : ""),
                onClick: () => {
                  updateDraftTask((current) => ({
                    ...current,
                    reviewRequired: false,
                    reviewerAgentId: null,
                  }), { autosave: true });
                  setTaskDetailSelectPopover("");
                },
              },
              React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar", "aria-hidden": "true" },
                React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar-fallback" }, "No")
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, "No review"),
                React.createElement("span", null, "Move directly to Finished when work is done.")
              ),
              React.createElement("span", { className: "tb-popup-check-slot" },
                !draftTask.reviewRequired
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              )
            );
          }

          function getTaskDetailThreadStatusPresentation(thread) {
            const status = resolveThreadDisplayStatus(thread?.status, thread?.completedAt || thread?.finishedAt || thread?.endedAt);
            const normalizedStatus = String(status || "").trim().toLowerCase();
            if (isPendingPermissionThreadDisplayStatus(normalizedStatus)) {
              return { label: "Permission", className: "is-permission", icon: Loader2 };
            }
            if (isRunningThreadDisplayStatus(normalizedStatus)) {
              return { label: "Running", className: "is-running", icon: Loader2 };
            }
            if (isCompletedThreadStatus(normalizedStatus)) {
              return { label: "Completed", className: "is-completed", icon: Check };
            }
            if (["failed", "cancelled", "canceled"].includes(normalizedStatus)) {
              return { label: normalizedStatus === "failed" ? "Failed" : "Cancelled", className: "is-failed", icon: X };
            }
            return {
              label: normalizedStatus
                ? normalizedStatus.replace(/[_-]+/g, " ").replace(/\\b\\w/g, (character) => character.toUpperCase())
                : "Thread",
              className: "is-running",
              icon: Loader2,
            };
          }

          function openTaskDetailThread(thread, contentMode = "chat") {
            const normalizedThreadId = String(thread?.id || "").trim();
            if (!normalizedThreadId || typeof onThreadStarted !== "function") {
              return;
            }
            setTaskDetailPopover("");
            setTaskDetailThreadToolbarPopover("");
            onThreadStarted(normalizedThreadId, {
              contentMode,
              threadRecord: thread,
              taskPreview: getThreadTaskPreview(thread) || null,
            });
          }

          function renderTaskDetailThreadOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description
                  ? React.createElement("span", null, option.description)
                  : null
              )
            );
          }

          function renderTaskDetailThreadRow(thread) {
            const { safeThread, displayThreadTitle } = getSidebarThreadTitleParts(thread);
            const threadId = String(safeThread?.id || thread?.id || "").trim();
            const statusPresentation = getTaskDetailThreadStatusPresentation(safeThread);
            const threadActor = getPlaygroundThreadActorInfo(safeThread, agentsById, "No agent");
            const taskPreview = getThreadTaskPreview(safeThread);
            const normalizedRunKind = String(taskPreview?.runKind || "").trim().toLowerCase();
            const runKindLabel = taskPreview?.reviewRequest === true
              ? "Review Changes"
              : normalizedRunKind === "review"
                ? "Review"
                : "Implementation";
            const timestamp = resolveThreadSortTimestamp(safeThread);
            const timeLabel = (typeof formatThreadSearchTimestamp === "function"
              ? formatThreadSearchTimestamp(timestamp)
              : "")
              || formatRelativeThreadTime(timestamp)
              || "Recently updated";
            const metaLabel = [
              threadActor?.name || "No agent",
              runKindLabel,
              timeLabel,
            ].filter(Boolean).join(" · ");

            return React.createElement("div", {
                key: threadId || displayThreadTitle,
                className: "playground-tasks-detail-thread-row",
                role: "button",
                tabIndex: 0,
                onClick: () => openTaskDetailThread(safeThread, "chat"),
                onKeyDown: (event) => {
                  if ((event.key === "Enter" || event.key === " ") && threadId) {
                    event.preventDefault();
                    openTaskDetailThread(safeThread, "chat");
                  }
                },
              },
              React.createElement("div", { className: "playground-tasks-detail-thread-main" },
                React.createElement("span", {
                  className: ("playground-tasks-detail-thread-status-icon " + statusPresentation.className).trim(),
                  title: statusPresentation.label,
                  "aria-label": statusPresentation.label,
                }, React.createElement(statusPresentation.icon, { strokeWidth: 2 })),
                React.createElement("span", { className: "playground-tasks-detail-thread-title", title: displayThreadTitle || safeThread.title || "" },
                  displayThreadTitle || safeThread.title || "Untitled thread"
                ),
                React.createElement("div", { className: "playground-tasks-detail-thread-meta", title: metaLabel }, metaLabel)
              ),
              React.createElement("div", { className: "playground-tasks-detail-thread-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-detail-thread-action",
                  onClick: (event) => {
                    event.stopPropagation();
                    openTaskDetailThread(safeThread, "changes");
                  },
                  title: "Open changes",
                  "aria-label": "Open changes",
                }, React.createElement(History, { width: 15, height: 15, strokeWidth: 1.8 })),
                typeof onThreadOptionsOpen === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-detail-thread-action",
                      onClick: (event) => {
                        event.stopPropagation();
                        onThreadOptionsOpen(event, threadId, { threadRecord: safeThread });
                      },
                      title: "Thread actions",
                      "aria-label": "Thread actions",
                    }, React.createElement(Ellipsis, { width: 15, height: 15, strokeWidth: 1.8 }))
                  : null
              )
            );
          }

          function renderTaskDetailThreadsSection(options = {}) {
            const contentOnly = options.contentOnly === true;
            const showThreadActions = options.showActions !== false;
            const hasThreadHistory = selectedTaskThreads.length > 0;
            const hasVisibleThreads = visibleTaskDetailThreads.length > 0;
            const taskThreadsLoading = taskDetailThreadsState.status === "loading";
            const taskStartPending = taskRunPendingIds.includes(draftTask.id) || taskRunPendingIdsRef.current.has(draftTask.id);
            const taskAgentReviewStartPending = taskAgentReviewStartPendingId === draftTask.id;
            const taskStartDisabled = isHumanAssignedTask(draftTask) || isTaskThreadLaunchLocked(draftTask);
	            const normalizedDraftTaskStatus = String(draftTask.status || "").trim().toLowerCase();
	            const isHumanReviewerForTask = isPlaygroundHumanAssigneeId(draftTask.reviewerAgentId);
	            const reviewerAgentId = String(draftTask.reviewerAgentId || "").trim();
	            const isAgentReviewerForTask = Boolean(reviewerAgentId && !isHumanReviewerForTask);
            const canHumanReviewTask = normalizedDraftTaskStatus === "in_review" && isHumanReviewerForTask;
            const canAgentReviewTask = normalizedDraftTaskStatus === "in_review" && isAgentReviewerForTask;
            const canRequestTaskChanges = (isHumanReviewerForTask || isAgentReviewerForTask)
              && (normalizedDraftTaskStatus === "in_review" || normalizedDraftTaskStatus === "done");
            const canShowAdditionalStartWork = hasThreadHistory
              && !canHumanReviewTask
              && !canAgentReviewTask
              && !isHumanAssignedTask(draftTask)
              && normalizedDraftTaskStatus !== "done";
            const emptyCopy = taskThreadsLoading
              ? "Loading ticket threads..."
              : taskDetailThreadsState.error
                ? taskDetailThreadsState.error
                : hasThreadHistory
                  ? "No ticket threads found."
                  : "No thread has run for this ticket yet.";

            return React.createElement("section", {
                className: "playground-plugins-section playground-tasks-detail-threads-section"
                  + (contentOnly ? " is-centralized-sidebar-content" : ""),
              },
              contentOnly ? null : React.createElement("div", { className: "playground-plugins-section-header" },
                React.createElement("div", { className: "playground-plugins-section-copy" },
                  React.createElement("h3", { className: "playground-plugins-section-title" }, "Threads")
                )
              ),
              hasVisibleThreads
                ? React.createElement("div", { className: "playground-tasks-detail-thread-list" },
                    visibleTaskDetailThreads.map((thread) => renderTaskDetailThreadRow(thread))
                  )
                : React.createElement("div", { className: "playground-tasks-detail-thread-empty" },
                    React.createElement("div", { className: "playground-tasks-detail-thread-empty-copy" }, emptyCopy),
                    showThreadActions && !hasThreadHistory && !taskThreadsLoading && !canHumanReviewTask && !canAgentReviewTask
                      ? React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                          type: "button",
                          className: "playground-tasks-empty-primary-button",
                          disabled: taskStartDisabled,
                          onClick: () => void handleStartTaskThread(draftTask),
                          title: isHumanAssignedTask(draftTask)
                            ? "Human-assigned tasks do not start agent threads."
                            : taskStartDisabled
                              ? "This ticket cannot be started right now."
                              : "Start work on this ticket",
                        },
                          taskStartPending
                            ? React.createElement(Loader2, { width: 12, height: 12, strokeWidth: 1.8, className: "playground-environments-spin" })
                            : React.createElement(Play, { width: 12, height: 12, strokeWidth: 2, "aria-hidden": "true" }),
                          React.createElement("span", null, taskStartPending ? "Starting..." : "Start Work")
                        )
                      : null
                  ),
              showThreadActions && (canShowAdditionalStartWork || canRequestTaskChanges || canHumanReviewTask || canAgentReviewTask)
                ? React.createElement("div", { className: "playground-tasks-detail-thread-footer" },
                    canShowAdditionalStartWork
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          disabled: taskStartDisabled,
                          onClick: () => void handleStartTaskThread(draftTask),
                          title: taskStartDisabled ? "This ticket cannot be started right now." : "Start another work thread",
                        },
                          taskStartPending
                            ? React.createElement(Loader2, { width: 12, height: 12, strokeWidth: 1.8, className: "playground-environments-spin" })
                            : React.createElement(Play, { width: 12, height: 12, strokeWidth: 2, "aria-hidden": "true" }),
                          React.createElement("span", null, taskStartPending ? "Starting..." : "Start Work")
                        )
                      : null,
                    canRequestTaskChanges || canHumanReviewTask
                      ? React.createElement(React.Fragment, null,
                          React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-review-action-button",
                            disabled: saveState.isSaving,
                            onClick: activateTaskReviewCommentMode,
                          }, "Request Changes"),
                          canHumanReviewTask
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-review-action-button is-approve",
                                disabled: saveState.isSaving,
                                onClick: () => void handleApproveTaskReview(),
                              }, "Approve")
                            : null
                        )
                      : null,
                    canAgentReviewTask
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-review-action-button is-approve",
                          disabled: saveState.isSaving || taskAgentReviewStartPending || typeof onStartAgentReviewThread !== "function",
                          onClick: () => void handleStartSelectedTaskAgentReview(),
                      }, taskAgentReviewStartPending ? "Starting..." : "Start Agent Review")
                      : null
                  )
                : null,
              options.showRunThreadAction
                ? React.createElement("div", { className: "playground-tasks-ticket-thread-run-row" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-ticket-control-button",
                      disabled: saveState.isSaving || taskStartDisabled,
                      onClick: () => void handleStartTaskThread(draftTask),
                      title: isHumanAssignedTask(draftTask)
                        ? "Human-assigned tasks do not start agent threads."
                        : taskStartDisabled
                          ? "This ticket cannot be started right now."
                          : "Run a thread from this ticket",
                    },
                      taskStartPending
                        ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-environments-spin" })
                        : React.createElement(Play, { width: 14, height: 14, strokeWidth: 2, "aria-hidden": "true" }),
                      React.createElement("span", null, taskStartPending ? "Starting..." : "Run Thread")
                    )
                  )
                : null
            );
          }

          function renderTaskCommentDock() {
            return React.createElement("div", { className: "playground-tasks-comment-dock" },
              saveState.error
                ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, saveState.error)
                : saveState.isSaving
                  ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
                  : saveState.message
                    ? React.createElement("div", { className: "playground-environments-success playground-tasks-comment-feedback" }, saveState.message)
                    : editorDirtyRef.current
                      ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Unsaved task changes")
                      : null,
              React.createElement("div", { className: "playground-tasks-comment-runner" },
                React.createElement("div", { className: "playground-tasks-comment-bar" + (getTaskCommentSubmissionDraft(taskCommentInputValue).isReview ? " is-review-mode" : "") },
                  getTaskCommentSubmissionDraft(taskCommentInputValue).isReview
                    ? React.createElement("span", { className: "playground-tasks-comment-mode-token" }, "/review")
                    : null,
                  React.createElement("textarea", {
                    ref: taskCommentTextareaRef,
                    rows: 1,
                    className: "playground-tasks-comment-input",
                    placeholder: getTaskCommentSubmissionDraft(taskCommentInputValue).isReview ? "Request changes" : "Add a comment",
                    value: taskCommentInputValue,
                    onChange: (event) => {
                      const nextValue = event.target.value;
                      if (/^\\/review(?:\\s+|$)/i.test(String(nextValue || "").trimStart())) {
                        setTaskCommentMode("review");
                        setTaskCommentInputValue(String(nextValue || "").trimStart().replace(/^\\/review(?:\\s+|$)/i, ""));
                      } else {
                        setTaskCommentInputValue(nextValue);
                      }
                      resizeTaskCommentTextarea(event.currentTarget);
                    },
                    onKeyDown: (event) => {
                      if (event.key === "Backspace" && taskCommentMode === "review" && String(taskCommentInputValue || "").length === 0) {
                        event.preventDefault();
                        setTaskCommentMode("");
                        return;
                      }
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleAddTaskComment();
                      }
                    },
                  }),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-comment-send-button",
                    onClick: handleAddTaskComment,
                    disabled: saveState.isSaving || !getTaskCommentSubmissionDraft(taskCommentInputValue).body,
                    "aria-label": "Send comment",
                    title: "Send comment",
                  },
                    React.createElement(ArrowUp, { className: "playground-tasks-comment-send-icon", strokeWidth: 1.9 })
                  )
                )
              )
            );
          }

          function renderTaskDetailFactsSection(options = {}) {
            const contentOnly = options.contentOnly === true;
            return React.createElement("div", {
                  className: "playground-tasks-detail-facts"
                    + (contentOnly ? " is-centralized-sidebar-content" : "")
                    + ((taskDetailSelectPopover || taskSkillsPopoverOpen || taskScheduleDialogState) ? " is-popover-open" : ""),
                },
                contentOnly ? null : React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-facts-toggle" + (taskDetailsCollapsed ? " is-collapsed" : ""),
                    onClick: () => setTaskDetailsCollapsed((current) => !current),
                    title: taskDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-label": taskDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-expanded": taskDetailsCollapsed ? "false" : "true",
                  }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                ),
                !taskDetailsCollapsed
                  ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Type"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    React.createElement("div", { className: "playground-tasks-type-control" },
                      renderTaskDetailSelectControl({
                        popoverId: "type",
                        valueLabel: activeTaskType === "subtask" && draftTaskParentTicketNumber
                          ? ("Subtask to " + draftTaskParentTicketNumber)
                          : activeTaskTypeLabel,
                        disabled: isTaskConfigLocked,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-detail-type-value",
                          },
                            React.createElement(ActiveTaskTypeIcon, { className: "playground-tasks-detail-type-icon", strokeWidth: 1.9 }),
                            activeTaskType === "subtask"
                              ? React.createElement(React.Fragment, null,
                                  React.createElement("span", { className: "playground-tasks-detail-type-prefix" }, "Subtask to"),
                                  draftTaskParentTicketNumber
                                    ? React.createElement("span", { className: "playground-tasks-detail-type-ticket", title: draftTaskParentLabel }, draftTaskParentTicketNumber)
                                    : null
                                )
                              : React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeTaskTypeLabel)
                          ),
                        children: PLAYGROUND_TASK_TYPE_OPTIONS.map((option) =>
                          renderTaskDetailSelectOptionRow({
                            key: option.id,
                            label: option.label,
                            selected: activeTaskType === option.id,
                            onClick: () => {
                              handleTaskTypeSelection(option.id);
                              setTaskDetailSelectPopover("");
                            },
                          })
                        ),
                      }),
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Priority"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "priority",
                      valueLabel: activeTaskPriorityPresentation.label,
                      disabled: isTaskConfigLocked,
                      buttonContent: React.createElement(React.Fragment, null,
                        React.createElement("span", {
                          className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + activeTaskPriorityPresentation.toneClassName,
                        },
                          renderPlaygroundTaskPriorityGlyph(draftTask.priority),
                          React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, activeTaskPriorityPresentation.label)
                        )
                      ),
                      children: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                        renderTaskDetailSelectOptionRow({
                          key: option.id,
                          label: getPlaygroundTaskPriorityPresentation(option.id).label,
                          selected: draftTask.priority === option.id,
                          onClick: () => {
                            updateDraftField("priority", option.id, { autosave: true });
                            setTaskDetailSelectPopover("");
                          },
                        })
                      ),
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Color"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "color",
                      valueLabel: activeTaskColorPresentation.label,
                      disabled: isTaskConfigLocked,
                      buttonContent: React.createElement("span", {
                          className: "playground-tasks-detail-color-value",
                          style: getPlaygroundTaskColorStyle(draftTask.taskColor),
                        },
                          React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeTaskColorPresentation.label)
                        ),
                      children: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                        renderTaskDetailSelectOptionRow({
                          key: option.id,
                          label: React.createElement("span", {
                              className: "playground-tasks-detail-select-popup-label-slot",
                              style: getPlaygroundTaskColorStyle(option.id),
                            },
                              React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                              React.createElement("span", null, option.label)
                            ),
                          selected: getPlaygroundTaskColorId(draftTask.taskColor) === option.id,
                          onClick: () => {
                            updateDraftField("taskColor", option.id, { autosave: true });
                            setTaskDetailSelectPopover("");
                          },
                        })
                      ),
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Milestone"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "release",
                      valueLabel: activeReleaseLabel,
                      isEmpty: !activeTaskReleaseId,
                      children: [
                        renderTaskDetailSelectOptionRow({
                          key: "__none__",
                          label: "None",
                          selected: !activeTaskReleaseId,
                          onClick: () => {
                            updateDraftField("releaseId", null, { autosave: true });
                            setTaskDetailSelectPopover("");
                          },
                        }),
                        ...releases
                          .slice()
                          .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                          .map((release) =>
                            renderTaskDetailSelectOptionRow({
                              key: release.id,
                              label: release.name || "Untitled Milestone",
                              description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                              selected: activeTaskReleaseId === release.id,
                              onClick: () => {
                                updateDraftField("releaseId", release.id, { autosave: true });
                                setTaskDetailSelectPopover("");
                              },
                            })
                          ),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Assignee"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    React.createElement("div", {
                        className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell playground-tasks-detail-assignee-shell" + (taskDetailSelectPopover === "assignee" ? " is-open" : ""),
                        ref: taskDetailSelectPopover === "assignee" ? taskDetailSelectPopoverRef : null,
                      },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (!resolvedTaskAssigneeId ? " is-empty" : "") + (taskDetailSelectPopover === "assignee" ? " is-active" : ""),
                        disabled: isTaskConfigLocked,
                        onClick: () => {
                          if (isTaskConfigLocked) return;
                          toggleTaskDetailSelectPopover("assignee");
                        },
                        title: activeAssigneeLabel,
                        "aria-expanded": taskDetailSelectPopover === "assignee" ? "true" : "false",
                      },
                        renderTaskDetailPersonValue(resolvedTaskAssigneeId, activeAssigneeLabel),
                        React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                      ),
                      taskDetailSelectPopover === "assignee"
                        ? React.createElement(PlatformPopupSurface, { className: "tb-popup-menu-inline tb-popup-menu-inline-agent playground-tasks-toolbar-popup-menu-animate-down-in" },
                            React.createElement("div", { className: "tb-popup-menu-title" }, "Assignee"),
                            React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-attach-header" },
                              React.createElement(PlatformSwitch, {
                                ariaLabel: "Assignee type",
                                value: taskDetailAssigneePopupMode,
                                options: taskDetailAvailableAssigneePopupModes.map((mode) => ({
                                  value: mode,
                                  label: mode === "teams" ? "Squads" : mode === "humans" ? "Humans" : "Agents",
                                })),
                                onValueChange: setTaskDetailAssigneePopupMode,
                              })
                            ),
                            React.createElement("div", { className: "tb-popup-menu-inline-body tb-popup-menu-inline-body-agent" },
                              filteredTaskDetailAssignableActors.length > 0
                                ? filteredTaskDetailAssignableActors.map((actor) => renderTaskDetailAssigneeRow(actor))
                                : React.createElement("div", { className: "tb-popup-menu-inline-empty" },
                                    React.createElement("div", { className: "tb-popup-empty-state" }, "No assignees yet.")
                                  )
                            )
                          )
                        : null
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Reviewer"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "reviewer",
                      valueLabel: activeReviewerLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !draftTask.reviewRequired,
                      buttonContent: renderTaskDetailPersonValue(resolvedTaskReviewerId, activeReviewerLabel),
                      children: [
                        renderTaskDetailReviewerNoneRow(),
                        ...assignableActors.map((actor) => renderTaskDetailReviewerRow(actor)),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Environment"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "environment",
                      valueLabel: activeEnvironmentLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: false,
                      menuClassName: "playground-tasks-toolbar-popup-menu-environment",
                      children: [
                        renderTaskDetailSelectOptionRow({
                          key: "__project_default__",
                          label: "Project Default",
                          description: projectDefaultEnvironment?.name || "Uses the project's default environment",
                          selected: !draftTask.environmentId,
                          onClick: () => {
                            handleTaskEnvironmentSelectionChange("");
                            setTaskDetailSelectPopover("");
                          },
                        }),
                        ...availableBacklogEnvironments.map((environment) =>
                          renderTaskDetailSelectOptionRow({
                            key: environment.id,
                            label: environment.name + (environment.isDefault ? " (Default)" : ""),
                            selected: draftTask.environmentId === environment.id,
                            onClick: () => {
                              handleTaskEnvironmentSelectionChange(environment.id);
                              setTaskDetailSelectPopover("");
                            },
                          })
                        ),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Blocked by"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "blocked-by",
                      valueLabel: activeBlockedByLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !blockedByTaskId,
                      menuClassName: "playground-tasks-toolbar-popup-menu-wide",
                      children: [
                        renderTaskDetailSelectOptionRow({
                          key: "__none__",
                          label: "None",
                          selected: !blockedByTaskId,
                          onClick: () => {
                            updateDraftTask((current) => ({
                              ...current,
                              dependencyIds: [],
                              status: current.status === "blocked" ? "todo" : current.status,
                              completedAt: current.status === "done"
                                ? (current.completedAt || new Date().toISOString())
                                : null,
                            }), { autosave: true });
                            setTaskDetailSelectPopover("");
                          },
                        }),
                        ...dependencyCandidates.map((task) => {
                          const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                          return renderTaskDetailSelectOptionRow({
                            key: task.id,
                            label: taskTicketNumber + " - " + (task.title || "Untitled Task"),
                            selected: blockedByTaskId === task.id,
                            onClick: () => {
                              updateDraftTask((current) => ({
                                ...current,
                                dependencyIds: [task.id],
                                status: "blocked",
                                completedAt: current.status === "done"
                                  ? (current.completedAt || new Date().toISOString())
                                  : null,
                              }), { autosave: true });
                              setTaskDetailSelectPopover("");
                            },
                          });
                        }),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Schedule"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    React.createElement("div", { className: "playground-tasks-schedule-anchor" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (taskScheduleSummary ? "" : " is-empty") + (taskScheduleDialogState ? " is-active" : ""),
                        disabled: isTaskConfigLocked,
                        onClick: openTaskScheduleDialog,
                      },
                        React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, taskScheduleSummary || "None"),
                        React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                      ),
                      renderTaskScheduleDialog()
                    )
                  )
                ))
                  : null
              )
          }
	          const taskDetailNavbar = React.createElement("div", {
                className: "playground-content-nav playground-tasks-detail-navbar",
              },
	                isFullPageTaskDetail
	                  ? React.createElement("div", { className: "playground-tasks-ticket-page-nav-title" },
	                      React.createElement("button", {
	                        type: "button",
	                        className: "playground-tasks-ticket-page-nav-ticket-row",
	                        onClick: handleCloseTaskDetail,
	                        title: "Back to project",
	                        "aria-label": "Back to project",
	                      },
	                        React.createElement("span", { className: "playground-tasks-ticket-page-nav-back", "aria-hidden": "true" },
	                          React.createElement(ChevronLeft, { width: 12, height: 12, strokeWidth: 1.9 })
	                        ),
	                        React.createElement("span", { className: "playground-tasks-ticket-page-nav-ticket" }, activeTicketNumber)
	                      ),
	                      React.createElement("input", {
	                        type: "text",
	                        className: "playground-content-title playground-tasks-detail-navbar-title-input playground-tasks-ticket-page-nav-title-input",
                        value: taskTitleInputValue,
                        placeholder: "Task",
                        "aria-label": "Task title",
                        title: taskTitleInputValue || "Task",
                        onChange: (event) => setTaskTitleInputValue(event.target.value),
                        onBlur: commitTaskTitleInput,
                        readOnly: isTaskConfigLocked,
                        onKeyDown: (event) => {
                          if (isTaskConfigLocked) {
                            return;
                          }
                          if (event.key === "Enter") {
                            event.preventDefault();
                            event.currentTarget.blur();
                            return;
                          }
                          if (event.key === "Escape") {
                            event.preventDefault();
                            taskTitleSkipCommitRef.current = true;
                            setTaskTitleInputValue(draftTask.title || "New Task");
                            event.currentTarget.blur();
                          }
                        },
                      })
                    )
                  : React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
                      React.createElement("div", { className: "playground-tasks-detail-navbar-title-meta" },
                        React.createElement("div", {
                          className: "playground-tasks-backlog-project-icon "
                            + (activeTaskType === "subtask" ? "is-subtask" : (activeTaskType === "loop" ? "is-loop" : "is-task")),
                          "aria-hidden": "true",
                        },
                          React.createElement(ActiveTaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 })
                        ),
                        renderPlaygroundTaskPriorityIcon(draftTask.priority, "playground-tasks-backlog-priority"),
                        React.createElement("span", { className: "playground-tasks-detail-navbar-ticket" }, activeTicketNumber)
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                        React.createElement("input", {
                          type: "text",
                          className: "playground-content-title playground-tasks-detail-navbar-title-input",
                          value: taskTitleInputValue,
                          placeholder: "Task",
                          "aria-label": "Task title",
                          title: taskTitleInputValue || "Task",
                          onChange: (event) => setTaskTitleInputValue(event.target.value),
                          onBlur: commitTaskTitleInput,
                          readOnly: isTaskConfigLocked,
                          onKeyDown: (event) => {
                            if (isTaskConfigLocked) {
                              return;
                            }
                            if (event.key === "Enter") {
                              event.preventDefault();
                              event.currentTarget.blur();
                              return;
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              taskTitleSkipCommitRef.current = true;
                              setTaskTitleInputValue(draftTask.title || "New Task");
                              event.currentTarget.blur();
                            }
                          },
                        })
                      )
                    ),
                React.createElement("div", { className: "playground-content-nav-center" }),
	                React.createElement("div", {
	                  className: "playground-content-nav-right playground-tasks-detail-navbar-actions",
	                  ref: taskDetailActionsRef,
		                },
				                  isFullPageTaskDetail
				                    ? React.createElement("div", { className: "playground-tasks-ticket-page-actions" },
				                        React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
				                          React.createElement("button", {
				                            type: "button",
				                            className: "playground-files-header-icon-button is-plain" + (taskDetailPopover === "menu" ? " is-active" : ""),
				                            onClick: () => setTaskDetailPopover((current) => current === "menu" ? "" : "menu"),
				                            title: "Task actions",
				                            "aria-label": "Task actions",
				                          }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
				                          taskDetailPopover === "menu"
				                            ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
				                                React.createElement("button", {
				                                  type: "button",
				                                  className: "tb-popup-row playground-tasks-detail-menu-item-danger",
				                                  disabled: saveState.isSaving,
				                                  onClick: () => {
				                                    setTaskDetailPopover("");
				                                    void handleDeleteTask(draftTask.id);
				                                  },
				                                },
				                                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
				                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
				                                    React.createElement("span", null, "Delete"),
				                                    React.createElement("span", null, "Remove this ticket from the project.")
				                                  )
				                                )
				                              )
				                            : null
				                        ),
				                        React.createElement("button", {
				                          type: "button",
				                          className: "playground-files-header-icon-button is-plain playground-tasks-ticket-sidebar-toggle-button",
				                          onClick: () => setTicketDetailSidebarCollapsed((current) => !current),
				                          title: ticketDetailSidebarCollapsed ? "Open sidebar" : "Close sidebar",
				                          "aria-label": ticketDetailSidebarCollapsed ? "Open sidebar" : "Close sidebar",
				                          "aria-pressed": ticketDetailSidebarCollapsed ? "true" : "false",
				                        },
				                          ticketDetailSidebarCollapsed
				                            ? React.createElement(PanelLeftOpen, { width: 16, height: 16, strokeWidth: 1.8 })
				                            : React.createElement(PanelLeftClose, { width: 16, height: 16, strokeWidth: 1.8 })
				                        )
				                      )
				                    : React.createElement(React.Fragment, null,
			                        React.createElement("div", { className: "playground-tasks-detail-navbar-status" },
			                          renderTaskPreviewStatusControl(draftTask)
		                        ),
		                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
	                    React.createElement("button", {
	                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (taskDetailPopover === "menu" ? " is-active" : ""),
                      onClick: () => setTaskDetailPopover((current) => current === "menu" ? "" : "menu"),
                      title: "Task actions",
                      "aria-label": "Task actions",
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    taskDetailPopover === "menu"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          renderTaskActionsMenu(draftTask, {
                            closeMenu: () => setTaskDetailPopover(""),
                            includeFullScreenAction: true,
	                          })
	                        )
	                      : null
	                  )
	                    ),
	                  isFullPageTaskDetail
	                    ? null
	                    : React.createElement("button", {
	                        type: "button",
	                        className: "playground-files-header-icon-button is-plain playground-tasks-detail-close-button",
	                        onClick: handleCloseTaskDetail,
	                        title: "Close task detail",
	                        "aria-label": "Close task detail",
	                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                )
	              );
	          const taskDetailMain = React.createElement("div", {
              className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
              ref: taskDetailMainRef,
            },
              isFullPageTaskDetail ? null : taskDetailNavbar,
              React.createElement("div", { className: "playground-tasks-detail-body" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                isFullPageTaskDetail ? null : renderTaskDetailThreadsSection(),
                React.createElement(PlatformInstructionsEditor, {
                  value: String(draftTask.description || ""),
                  onChange: (nextValue) => updateDraftField("description", nextValue),
                  title: "Description",
                  placeholder: "Add description here",
                  ariaLabel: "Ticket description",
                  readOnly: isTaskConfigLocked,
                  historyKey: "ticket-description:" + draftTask.id,
                  onEditingChange: (editing) => {
                    setIsTaskDescriptionEditing(editing);
                    if (!editing) {
                      commitDraftTaskIfDirty();
                    }
                  },
                }),
                isFullPageTaskDetail ? null : renderTaskDetailFactsSection(),
                React.createElement("div", { className: "playground-tasks-attachments" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                    React.createElement("div", { className: "playground-tasks-attachments-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                      onClick: openTaskEnvironmentFilePicker,
                      disabled: isTaskConfigLocked || taskAttachmentTransferState.isProcessing || !activeTaskEnvironmentId,
                      title: activeTaskEnvironmentId
                        ? "Add files from " + (activeTaskEnvironment?.name || "the selected computer")
                        : "Select a computer first",
                      }, "Upload from Computer")
                    )
                  ),
                  React.createElement("input", {
                    ref: taskAttachmentInputRef,
                    type: "file",
                    multiple: true,
                    hidden: true,
                    disabled: isTaskConfigLocked,
                    onChange: (event) => void handleTaskAttachmentInputChange(event),
                  }),
                  React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                    React.createElement("div", {
                      className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isTaskAttachmentDragging ? " dragging" : "") + (hasTaskAttachments ? " is-filled" : ""),
                      onDragOver: (event) => {
                        event.preventDefault();
                        if (!activeTaskEnvironmentId || isTaskConfigLocked) {
                          return;
                        }
                        setIsTaskAttachmentDragging(true);
                      },
                      onDragLeave: (event) => {
                        if (event.currentTarget.contains(event.relatedTarget)) {
                          return;
                        }
                        setIsTaskAttachmentDragging(false);
                      },
                      onDrop: (event) => void handleTaskAttachmentDrop(event),
                    },
                      hasTaskAttachments
                        ? React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "playground-tasks-attachments-topline" },
                              React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                              React.createElement("span", null, isTaskAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-attachments-browse",
                                disabled: isTaskConfigLocked,
                                onClick: openTaskAttachmentPicker,
                              }, "browse.")
                            ),
                            React.createElement("div", { className: "runner-attachments" },
                              draftTask.attachments.map((attachment) => renderTaskAttachmentChip(attachment, { removable: !isTaskConfigLocked }))
                            )
                          )
                        : React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-attachments-empty-button",
                            disabled: isTaskConfigLocked,
                            onClick: openTaskAttachmentPicker,
                          },
                            React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                            React.createElement("span", { className: "tb-popup-dropzone-title" }, isTaskAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                            React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                          )
                    )
                  ),
                  taskAttachmentTransferState.isProcessing
                    ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Uploading attachments...")
                    : null,
                  taskAttachmentTransferState.error
                    ? React.createElement("div", { className: "playground-environments-error" }, taskAttachmentTransferState.error)
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-skills" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Skills"),
                    React.createElement("div", {
                      className: "playground-tasks-skills-popup-shell tb-runner-chat",
                      ref: taskSkillsActionsRef,
                    },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-tasks-skills-manage-button" + (taskSkillsPopoverOpen ? " is-active" : ""),
                        disabled: isTaskConfigLocked,
                        onClick: () => {
                          setTaskDetailPopover("");
                          setTaskSkillsPopoverOpen((current) => !current);
                        },
                      }, "Manage Skills"),
                      taskSkillsPopoverOpen
                        ? React.createElement(PlatformPopupSurface, { className: "tb-popup-menu-skills", animation: "up-in" },
                            React.createElement("div", { className: "tb-popup-attach-topbar" },
                              React.createElement("button", {
                                type: "button",
                                className: "tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close",
                                onClick: () => setTaskSkillsPopoverOpen(false),
                                "aria-label": "Close skills popup",
                              }, React.createElement(X, { className: "tb-popup-attach-topbar-icon", strokeWidth: 1.75 })),
                              React.createElement("div", { className: "tb-popup-attach-topbar-title" }, "Skills"),
                              React.createElement("button", {
                                type: "button",
                                className: "tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm",
                                onClick: () => setTaskSkillsPopoverOpen(false),
                                "aria-label": "Done",
                              }, React.createElement(Check, { className: "tb-popup-attach-topbar-icon", strokeWidth: 2 }))
                            ),
                            React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-attach-header" },
                              React.createElement(PlatformSwitch, {
                                ariaLabel: "Skill source",
                                value: taskSkillsTab,
                                options: [
                                  { value: "system", label: "System" },
                                  { value: "custom", label: "Custom" },
                                ],
                                onValueChange: setTaskSkillsTab,
                              })
                            ),
                            React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced tb-popup-panel-section-skills-body" },
                              (taskSkillsTab === "system" ? taskSystemSkillItems : taskCustomSkillItems).map((skill) => {
                                const isEnabled = getEffectivePlaygroundTaskEnabledSkillIds(draftTask).includes(skill.id);
                                return React.createElement("button", {
                                    key: skill.id,
                                    type: "button",
                                    className: "tb-popup-row tb-popup-row-skill" + (isEnabled ? " selected" : ""),
                                    disabled: isTaskConfigLocked,
                                    onClick: () => toggleTaskSkill(skill.id),
                                  },
                                    renderTaskSkillIcon(skill, "tb-popup-icon"),
                                    React.createElement("span", { className: "tb-popup-label" }, skill.name),
                                    React.createElement("span", { className: "tb-popup-check-slot" },
                                      isEnabled
                                        ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.75 })
                                        : null
                                    )
                                  );
                              }),
                              taskSkillsTab === "custom" && projectCustomSkillsLoading
                                ? React.createElement("div", { className: "tb-popup-loading-row" },
                                    React.createElement("span", { className: "tb-popup-loading-spinner", "aria-hidden": "true" }),
                                    React.createElement("span", { className: "tb-popup-loading-label" }, "Loading custom skills...")
                                  )
                                : null,
                              taskSkillsTab === "custom" && !projectCustomSkillsLoading && taskCustomSkillItems.length === 0
                                ? React.createElement("div", { className: "tb-popup-empty-state" }, "No custom skills yet.")
                                : null
                            )
                          )
                        : null
                    )
                  ),
                  taskSkillEntries.length > 0
                    ? React.createElement("div", { className: "playground-tasks-skills-list" },
                        taskSkillEntries.map((skill) =>
                          React.createElement("div", {
                            key: skill.id,
                            className: "playground-tasks-skill-pill",
                            title: skill.name,
                          },
                            renderTaskSkillIcon(skill, "playground-tasks-skill-pill-icon"),
                            React.createElement("span", { className: "playground-tasks-skill-pill-label" }, skill.name),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-skill-pill-remove",
                              disabled: isTaskConfigLocked,
                              onClick: (event) => {
                                event.stopPropagation();
                                removeTaskSkill(skill.id);
                              },
                              "aria-label": "Remove " + skill.name,
                              title: "Remove " + skill.name,
                            }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.9 }))
                          )
                        )
                      )
                    : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No skills selected.")
                ),
                React.createElement("div", { className: "playground-tasks-connectors" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Connectors"),
                  React.createElement("div", { className: "playground-tasks-connectors-list" },
                    taskConnectorEntries.map((connector) =>
                      React.createElement("div", {
                        key: connector.key,
                        className: "playground-tasks-connector-row",
                      },
                        React.createElement("div", { className: "playground-tasks-connector-service" },
                          renderTaskConnectorServiceIcon(connector.source, "playground-tasks-connector-service-icon"),
                          React.createElement("span", { className: "playground-tasks-connector-service-label" }, connector.label)
                        ),
                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-detail-fact-button" + (connector.selection ? "" : " is-empty"),
                            disabled: isTaskConfigLocked,
                            onClick: () => openTaskConnectorBrowser(connector.source),
                          }, connector.valueLabel)
                        )
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-subtasks" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Subtasks"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-subtasks-add-button",
                      onClick: () => openBacklogSubtaskComposer(activeTicketNumber),
                      title: "Add subtask",
                      "aria-label": "Add subtask",
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
                  ),
                  draftTaskSubtasks.length > 0
                    ? React.createElement("div", { className: "playground-tasks-subtasks-list" },
                        draftTaskSubtasks.map((subtask) => {
                          const subtaskTicketNumber = taskTicketNumbersById[subtask.id] || subtask.ticketNumber || "000";
                          return React.createElement("button", {
                              key: subtask.id,
                              type: "button",
                              className: "playground-tasks-subtask-row",
                              onClick: () => handleSelectTask(subtask.id, { screen: projectTaskDetailScreenOpen }),
                            },
                              React.createElement("div", { className: "playground-tasks-subtask-main" },
                                React.createElement("span", { className: "playground-tasks-subtask-ticket" }, subtaskTicketNumber),
                                React.createElement("span", { className: "playground-tasks-subtask-title" }, subtask.title || "Untitled Subtask")
                              ),
                              React.createElement("span", { className: "playground-tasks-subtask-meta" }, getPlaygroundTaskStatusLabel(subtask.status))
                            );
                        })
                      )
                    : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No subtasks yet.")
                ),
                React.createElement("div", { className: "playground-tasks-comments" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar playground-tasks-comments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Comments"),
                    React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-subtasks-add-button playground-tasks-comments-add-button" + (taskCommentComposerOpen ? " is-active" : ""),
                          onClick: () => {
                            setTaskCommentComposerOpen((current) => {
                              const nextValue = !current;
                              if (nextValue && typeof window !== "undefined") {
                                window.setTimeout(focusTaskCommentTextarea, 0);
                              }
                              return nextValue;
                            });
                          },
                          title: taskCommentComposerOpen ? "Close comment" : "Add comment",
                          "aria-label": taskCommentComposerOpen ? "Close comment" : "Add comment",
                          "aria-expanded": taskCommentComposerOpen ? "true" : "false",
                        }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
                  ),
                  taskComments.length > 0
                    ? React.createElement("div", { className: "playground-tasks-comments-list" },
                        taskComments.map((comment) =>
                          React.createElement("div", {
                            key: comment.id,
                            className: "playground-tasks-comment",
                          },
                            renderTaskCommentAvatar(comment, "playground-tasks-comment-avatar"),
                            React.createElement("div", { className: "playground-tasks-comment-body" },
                              React.createElement("div", { className: "playground-tasks-comment-meta" },
                                React.createElement("span", { className: "playground-tasks-comment-author" }, getTaskCommentDisplayName(comment)),
                                React.createElement("span", { className: "playground-tasks-comment-time" }, formatRelativeThreadTime(comment.createdAt) || formatPlaygroundFileDate(comment.createdAt))
                              ),
                              React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                content: comment.text,
                                className: "playground-tasks-comment-text tb-message-markdown",
                              })
                            )
                        )
                      )
                    )
                    : React.createElement("div", { className: "playground-tasks-secondary-copy playground-tasks-comment-empty" }, "No comments yet.")
                  ,
                  taskCommentComposerOpen ? renderTaskCommentDock() : null
                )
                ),
                null
              )
            );
            const taskDetailPreview = previewedTaskAttachment
              ? React.createElement("div", {
                  className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-tasks-detail-preview-host",
                },
                  React.createElement(RunnerDocumentPreviewDrawer, {
                    attachment: previewedTaskAttachment,
                    backendUrl,
                    requestHeaders,
                    inline: true,
                    onClose: () => setPreviewedTaskAttachmentId(""),
                    showResizeHandle: false,
                  })
                )
              : null;

            if (isFullPageTaskDetail) {
              return React.createElement(TicketDetailPage, {
                  header: taskDetailNavbar,
                  details: renderTaskDetailFactsSection({ contentOnly: true }),
                  detailsActions: React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-facts-toggle" + (taskDetailsCollapsed ? " is-collapsed" : ""),
                    onClick: () => setTaskDetailsCollapsed((current) => !current),
                    title: taskDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-label": taskDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-expanded": taskDetailsCollapsed ? "false" : "true",
                  }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 })),
                  threads: renderTaskDetailThreadsSection({
                    contentOnly: true,
                    showActions: false,
                    showRunThreadAction: true,
                  }),
                  preview: taskDetailPreview,
                  sidebarCollapsed: ticketDetailSidebarCollapsed,
                  sidebarPopoverOpen: Boolean(taskDetailSelectPopover || taskSkillsPopoverOpen || taskScheduleDialogState),
                },
                taskDetailMain
              );
            }

	          return React.createElement("div", {
	              className: "playground-tasks-detail-shell"
	                + (previewedTaskAttachment ? " is-preview-open" : ""),
	            },
              taskDetailMain,
              React.createElement("div", { className: "playground-tasks-detail-preview-pane" }, taskDetailPreview)
            );
        }

        function renderProjectTaskDetailScreen() {
          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace playground-tasks-ticket-screen",
            },
            React.createElement("section", {
                className: "playground-environments-detail playground-tasks-project-workspace-detail playground-tasks-ticket-screen-detail",
              },
              React.createElement("div", {
                  className: "playground-environments-detail-scroll playground-tasks-project-workspace-scroll playground-tasks-ticket-screen-scroll",
                },
                React.createElement("div", { className: "playground-project-workspace-inner playground-tasks-ticket-screen-inner" },
                  React.createElement("div", { className: "playground-tasks-ticket-screen-panel" },
                    renderTaskDetail()
                  )
                )
              )
            )
          );
        }

        const isProjectTaskDetailScreenOpen = Boolean(
          projectTaskDetailScreenOpen
          && selectedProjectId
          && selectedTaskId
          && (taskView === "backlog" || taskView === "board")
        );
        const isTaskDetailOpen = Boolean(
          selectedProjectId
          && selectedTaskId
          && taskView !== "threads"
          && !isProjectTaskDetailScreenOpen
          && taskView !== "backlog"
          && taskView !== "board"
        );
        const isScheduleDetailOpen = Boolean(isCalendarContext && scheduleViewMode === "setup");
        const isMissionControlDetailOpen = Boolean(selectedProjectId && missionControlStrategyOpen);
        const isDetailOpen = isTaskDetailOpen || isScheduleDetailOpen || isMissionControlDetailOpen;
        const isTaskAttachmentPreviewOpen = Boolean((isTaskDetailOpen || isScheduleDetailOpen) && previewedTaskAttachment);

        function renderProjectWallpaperTransitionLayer() {
          return null;
        }

        const isProjectInitialSetupModalOpen = Boolean(
          projectComposerOpen
          && projectComposerMode === "create"
          && !missionControlSetupOpen
          && !selectedProject
        );

        if (isDetailOnlyMode) {
          return React.createElement("div", { className: "playground-tasks-page is-inline-detail" },
            React.createElement("aside", { className: "playground-environments-detail playground-tasks-detail-panel is-inline-detail" },
              renderTaskDetail()
            ),
            renderTaskEnvironmentFilePicker(),
            renderTaskConnectorBrowser(),
            renderProjectConnectorBrowser(),
            renderBoardBlockedPickerDialog(),
            renderTaskParentPickerDialog(),
            renderTaskEnvironmentChangeDialog(),
            renderTaskDeleteDialog(),
            renderProjectIssueComposerDialog(),
            renderProjectComposerDialog(),
            renderReleaseComposerDialog(),
            renderCalendarUpgradeModal(),
            renderProjectAgentUpgradeModal(),
            renderProjectEnvironmentFilePicker()
          );
        }

        return React.createElement("div", { className: "playground-tasks-page" },
          renderProjectWallpaperTransitionLayer(),
          React.createElement("div", { className: "playground-tasks-shell" + (isDetailOpen ? " is-detail-open" : "") + (isTaskAttachmentPreviewOpen ? " is-preview-open" : "") },
            React.createElement("section", { className: "playground-tasks-main" },
              React.createElement("div", {
                  className: "playground-tasks-main-scroll" + (selectedProject || (projectComposerOpen && !isProjectInitialSetupModalOpen) || isStandaloneCalendarMode ? " is-project-workspace" : " is-projects-home"),
                  onClick: handleTaskSurfaceClick,
                },
                !selectedProject && (!projectComposerOpen || isProjectInitialSetupModalOpen) && !isStandaloneCalendarMode && !useUnifiedProjectNav
                  ? React.createElement("div", { className: "playground-content-nav playground-tasks-project-navbar playground-tasks-project-home-navbar playground-tasks-home-width" },
                      React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                        React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                          React.createElement("div", { className: "playground-content-title" }, "Projects")
                        )
                      ),
                      React.createElement("div", { className: "playground-content-nav-center" }),
                      React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions", ref: projectSidebarActionsRef },
                        React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-search-shell" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "search" ? " is-active" : ""),
                            onClick: () => setProjectSidebarPopover((current) => current === "search" ? "" : "search"),
                            title: "Search projects",
                          }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                          projectSidebarPopover === "search"
                            ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                React.createElement("div", { className: "playground-tasks-project-search-header" },
                                  React.createElement("div", { className: "playground-tasks-project-search-title" }, "Search Projects"),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-tasks-project-search-close",
                                    onClick: () => setProjectSidebarPopover(""),
                                  }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                                ),
                                React.createElement("div", { className: "playground-tasks-project-search-body" },
                                  React.createElement("div", { className: "playground-files-search-field" },
                                    React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                                    React.createElement("input", {
                                      type: "text",
                                      className: "playground-files-search-field-input",
                                      placeholder: "Search projects by name or description...",
                                      value: searchQuery,
                                      onChange: (event) => setSearchQuery(event.target.value),
                                    })
                                  ),
                                  React.createElement("div", { className: "playground-tasks-project-search-hint" }, "Filter projects by name, description, open tasks, threads, or environments.")
                                )
                              )
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button",
                          onClick: () => openProjectComposer(),
                          title: "New project",
                        }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 }))
                      )
                    )
                  : null,
                !selectedProject && !isStandaloneCalendarMode && projectLoadState.status === "error" && projects.length > 0
                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-home-width" },
                      React.createElement("span", null, projectLoadState.error || "Failed to refresh projects."),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => void loadProjects(),
                      }, "Retry")
                    )
                  : null,
                isStandaloneCalendarMode
                  ? renderStandaloneCalendarWorkspace()
                  : projectComposerOpen && !selectedProject && !isProjectInitialSetupModalOpen
                    ? renderProjectComposerSetupWorkspace()
                    : selectedProject
                      ? (isProjectTaskDetailScreenOpen ? renderProjectTaskDetailScreen() : renderSelectedProjectWorkspace())
                      : renderProjectLanding()
              )
            ),
            React.createElement("aside", { className: "playground-environments-detail playground-tasks-detail-panel" + (isTaskDetailOpen || isScheduleDetailOpen ? " is-project-task-detail" : "") },
              isDetailOpen ? renderTaskDetail() : null
            )
          ),
          renderTaskEnvironmentFilePicker(),
          renderTaskConnectorBrowser(),
          renderProjectConnectorBrowser(),
          renderBoardBlockedPickerDialog(),
          renderTaskParentPickerDialog(),
          renderTaskEnvironmentChangeDialog(),
          renderTaskDeleteDialog(),
          renderMissionControlStudio(),
          renderProjectComposerDialog(),
          renderReleaseComposerDialog(),
          renderCalendarUpgradeModal(),
          renderProjectAgentUpgradeModal(),
          renderProjectEnvironmentFilePicker()
        );
      }

`;
