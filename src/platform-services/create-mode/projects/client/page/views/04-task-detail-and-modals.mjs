export const PROJECTS_VIEWS_04_FRAGMENT = `          }) {
            const normalizedPopoverId = String(popoverId || "").trim();
            const hasControlledOpenState = typeof open === "boolean";
            const isOpen = hasControlledOpenState ? open : taskDetailSelectPopover === popoverId;
            const selectorOptions = Array.isArray(options) ? options.filter((option) => option?.value) : [];
            return React.createElement(PlatformSelector, {
              value: String(value || ""),
              options: selectorOptions,
              onValueChange: (_nextValue, option) => {
                if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
              },
              ariaLabel: "Select ticket " + normalizedPopoverId.replace(/-/g, " "),
              label: buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
              placeholder: valueLabel,
              disabled,
              open: isOpen,
              onOpenChange: (nextOpen) => {
                setTaskDetailPopover("");
                setTaskSkillsPopoverOpen(false);
                if (nextOpen && normalizedPopoverId === "assignee") {
                  setTaskDetailAssigneePopupMode(defaultTaskAssigneePopupMode);
                }
                if (typeof onOpenChange === "function") {
                  onOpenChange(nextOpen);
                  return;
                }
                setTaskDetailSelectPopover(nextOpen ? normalizedPopoverId : "");
              },
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent,
              popupHeader,
              popupContent,
              popupAriaLabel: popupAriaLabel || undefined,
              popupWidth,
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight,
              className: "playground-tasks-detail-central-selector" + (isEmpty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: ("playground-tasks-detail-central-selector-popup " + popupClassName).trim(),
            });
          }

          function getTaskDetailThreadStatusPresentation(thread) {
            const status = resolvePlaygroundTaskThreadStatus(
              thread?.status,
              thread?.completedAt || thread?.finishedAt || thread?.endedAt,
              thread?.updatedAt
            );
            const normalizedStatus = String(status || "").trim().toLowerCase();
            if (isPendingPermissionThreadDisplayStatus(normalizedStatus)) {
              return { label: "Permission", className: "is-permission", icon: Loader2 };
            }
            if (isPlaygroundTaskThreadStatusActive(normalizedStatus)) {
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
                : "Status unavailable",
              className: "is-neutral",
              icon: History,
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
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-thread-actions" },
                typeof onThreadOptionsOpen === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-detail-thread-action",
                      onClick: (event) => {
                        event.stopPropagation();
                        onThreadOptionsOpen(event, threadId, {
                          threadRecord: safeThread,
                          menuActions: [{
                            id: "restart-ticket-thread",
                            label: "Restart Thread",
                            icon: RefreshCw,
                            disabled: saveState.isSaving || isTaskThreadLaunchLocked(draftTask),
                            onSelect: () => void handleStartTaskThread(draftTask, {
                              successMessage: "Thread restarted",
                            }),
                          }],
                        });
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
                    React.createElement("div", {
                      className: "playground-tasks-ticket-thread-divider",
                      "aria-hidden": "true",
                    }),
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      size: "small",
                      fullWidth: true,
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

          function renderTaskCommentDialog() {
            const commentSubmission = getTaskCommentSubmissionDraft(taskCommentInputValue);
            return React.createElement(PlatformModal, {
              open: taskCommentComposerOpen,
              title: commentSubmission.isReview ? "Request Changes" : "Add Comment",
              showHeader: false,
              size: "medium",
              as: "form",
              className: "playground-tasks-comment-modal",
              bodyClassName: "playground-tasks-comment-modal-body",
              footerClassName: "playground-tasks-comment-modal-footer",
              closeButtonDisabled: saveState.isSaving,
              onClose: () => closeTaskCommentComposer(),
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void handleAddTaskComment();
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "medium",
                  disabled: saveState.isSaving,
                  onClick: closeTaskCommentComposer,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  type: "submit",
                  size: "medium",
                  disabled: saveState.isSaving || !commentSubmission.body,
                }, saveState.isSaving
                  ? "Adding..."
                  : (commentSubmission.isReview ? "Request Changes" : "Add Comment"))
              ),
            },
              React.createElement(PlatformInstructionsEditor, {
                value: taskCommentInputValue,
                onChange: (nextValue) => {
                  if (/^\\/review(?:\\s+|$)/i.test(String(nextValue || "").trimStart())) {
                    setTaskCommentMode("review");
                    setTaskCommentInputValue(String(nextValue || "").trimStart().replace(/^\\/review(?:\\s+|$)/i, ""));
                  } else {
                    setTaskCommentInputValue(nextValue);
                  }
                },
                title: commentSubmission.isReview ? "Request Changes" : "Add Comment",
                placeholder: commentSubmission.isReview ? "Request changes" : "Add a comment",
                ariaLabel: commentSubmission.isReview ? "Change request" : "Comment",
                historyKey: "ticket-comment:" + String(draftTask?.id || ""),
                stickyHeader: false,
                variant: "minimalistic-ui",
                className: "playground-tasks-comment-modal-instructions",
              }),
              saveState.error
                ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, saveState.error)
                : null
            );
          }

          function renderTaskDetailFactsSection(options = {}) {
            const contentOnly = options.contentOnly === true;
            return React.createElement("div", {
                  className: "playground-tasks-detail-facts"
                    + (contentOnly ? " is-centralized-sidebar-content" : "")
                    + ((taskDetailSelectPopover || taskScheduleDialogState) ? " is-popover-open" : ""),
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
                        value: activeTaskType,
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
                        options: PLAYGROUND_TASK_TYPE_OPTIONS.map((option) =>
                          createTaskDetailSelectorOption({
                            value: option.id,
                            label: option.label,
                            onSelect: () => {
                              handleTaskTypeSelection(option.id);
                            },
                          })
                        ),
                      }),
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Creator"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskCreatorValue(draftTask)
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Priority"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "priority",
                      value: draftTask.priority,
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
                      options: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                        createTaskDetailSelectorOption({
                          value: option.id,
                          label: getPlaygroundTaskPriorityPresentation(option.id).label,
                          leading: renderPlaygroundTaskPriorityGlyph(option.id),
                          onSelect: () => {
                            updateDraftField("priority", option.id, { autosave: true });
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
                      value: getPlaygroundTaskColorId(draftTask.taskColor),
                      valueLabel: activeTaskColorPresentation.label,
                      disabled: isTaskConfigLocked,
                      buttonContent: React.createElement("span", {
                          className: "playground-tasks-detail-color-value",
                          style: getPlaygroundTaskColorStyle(draftTask.taskColor),
                        },
                          React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeTaskColorPresentation.label)
                        ),
                      options: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                        createTaskDetailSelectorOption({
                          value: option.id,
                          label: React.createElement("span", {
                              className: "playground-tasks-detail-select-popup-label-slot",
                              style: getPlaygroundTaskColorStyle(option.id),
                            },
                              React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                              React.createElement("span", null, option.label)
                            ),
                          onSelect: () => {
                            updateDraftField("taskColor", option.id, { autosave: true });
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
                      value: activeTaskReleaseId || "__none__",
                      valueLabel: activeReleaseLabel,
                      isEmpty: !activeTaskReleaseId,
                      options: [
                        createTaskDetailSelectorOption({
                          value: "__none__",
                          label: "None",
                          onSelect: () => {
                            updateDraftField("releaseId", null, { autosave: true });
                          },
                        }),
                        ...releases
                          .slice()
                          .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                          .map((release) =>
                            createTaskDetailSelectorOption({
                              value: release.id,
                              label: release.name || "Untitled Milestone",
                              description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                              onSelect: () => {
                                updateDraftField("releaseId", release.id, { autosave: true });
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
                    renderTaskDetailSelectControl({
                      popoverId: "assignee",
                      value: resolvedTaskAssigneeId,
                      valueLabel: activeAssigneeLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !resolvedTaskAssigneeId,
                      buttonContent: renderTaskDetailPersonValue(resolvedTaskAssigneeId, activeAssigneeLabel),
                      popupClassName: "playground-tasks-detail-assignee-selector-popup",
                      popupHeader: taskDetailAvailableAssigneePopupModes.length > 1
                        ? React.createElement(PlatformSwitch, {
                            className: "playground-tasks-detail-assignee-mode-switch",
                            ariaLabel: "Assignee type",
                            value: taskDetailAssigneePopupMode,
                            options: taskDetailAvailableAssigneePopupModes.map((mode) => ({
                              value: mode,
                              label: mode === "teams" ? "Squads" : mode === "humans" ? "Humans" : "Agents",
                            })),
                            onValueChange: setTaskDetailAssigneePopupMode,
                          })
                        : null,
                      emptyContent: "No assignees yet.",
                      options: filteredTaskDetailAssignableActors.map((actor) => {
                        const mode = getPlaygroundTaskAssigneePopupMode(actor);
                        return createTaskDetailSelectorOption({
                          value: actor.id,
                          label: getTaskAssigneeName(actor.id, actor.name || "Unknown"),
                          description: mode === "humans" ? "Human" : mode === "teams" ? "Agent squad" : "Agent",
                          leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
                          onSelect: () => updateDraftField("assigneeAgentId", actor.id, { autosave: true }),
                        });
                      }),
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Reviewer"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "reviewer",
                      value: draftTask.reviewRequired && resolvedTaskReviewerId ? resolvedTaskReviewerId : "__none__",
                      valueLabel: activeReviewerLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !draftTask.reviewRequired,
                      buttonContent: renderTaskDetailPersonValue(resolvedTaskReviewerId, activeReviewerLabel),
                      options: [
                        createTaskDetailSelectorOption({
                          value: "__none__",
                          label: "No review",
                          description: "Move directly to Finished when work is done.",
                          leading: React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar", "aria-hidden": "true" },
                            React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar-fallback" }, "No")
                          ),
                          onSelect: () => updateDraftTask((current) => ({
                            ...current,
                            reviewRequired: false,
                            reviewerAgentId: null,
                          }), { autosave: true }),
                        }),
                        ...assignableActors.map((actor) => {
                          const mode = getPlaygroundTaskAssigneePopupMode(actor);
                          return createTaskDetailSelectorOption({
                            value: actor.id,
                            label: getTaskAssigneeName(actor.id, actor.name || "Reviewer"),
                            description: mode === "humans" ? "Human reviewer" : mode === "teams" ? "Agent squad reviewer" : "Agent reviewer",
                            leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
                            onSelect: () => updateDraftTask((current) => ({
                              ...current,
                              reviewRequired: true,
                              reviewerAgentId: actor.id,
                            }), { autosave: true }),
                          });
                        }),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Environment"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderTaskDetailSelectControl({
                      popoverId: "environment",
                      value: draftTask.environmentId || "__project_default__",
                      valueLabel: activeEnvironmentLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: false,
                      popupClassName: "playground-tasks-detail-environment-selector-popup",
                      options: [
                        createTaskDetailSelectorOption({
                          value: "__project_default__",
                          label: "Project Default",
                          description: projectDefaultEnvironment?.name || "Uses the project's default environment",
                          onSelect: () => {
                            handleTaskEnvironmentSelectionChange("");
                          },
                        }),
                        ...availableBacklogEnvironments.map((environment) =>
                          createTaskDetailSelectorOption({
                            value: environment.id,
                            label: environment.name + (environment.isDefault ? " (Default)" : ""),
                            onSelect: () => {
                              handleTaskEnvironmentSelectionChange(environment.id);
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
                      value: blockedByTaskId || "__none__",
                      valueLabel: activeBlockedByLabel,
                      disabled: isTaskConfigLocked,
                      isEmpty: !blockedByTaskId,
                      popupClassName: "playground-tasks-detail-blocked-by-selector-popup",
                      options: [
                        createTaskDetailSelectorOption({
                          value: "__none__",
                          label: "None",
                          onSelect: () => {
                            updateDraftTask((current) => ({
                              ...current,
                              dependencyIds: [],
                              status: current.status === "blocked" ? "todo" : current.status,
                              completedAt: current.status === "done"
                                ? (current.completedAt || new Date().toISOString())
                                : null,
                            }), { autosave: true });
                          },
                        }),
                        ...dependencyCandidates.map((task) => {
                          const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                          return createTaskDetailSelectorOption({
                            value: task.id,
                            label: taskTicketNumber + " - " + (task.title || "Untitled Task"),
                            onSelect: () => {
                              updateDraftTask((current) => ({
                                ...current,
                                dependencyIds: [task.id],
                                status: "blocked",
                                completedAt: current.status === "done"
                                  ? (current.completedAt || new Date().toISOString())
                                  : null,
                              }), { autosave: true });
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
                    renderTaskDetailSelectControl({
                      popoverId: "schedule",
                      value: taskScheduleSummary || "__none__",
                      valueLabel: taskScheduleSummary || "None",
                      disabled: isTaskConfigLocked,
                      isEmpty: !taskScheduleSummary,
                      open: Boolean(taskScheduleDialogState) && taskScheduleDialogPhase !== "exit",
                      onOpenChange: (nextOpen) => {
                        if (nextOpen) {
                          if (!taskScheduleDialogState) {
                            openTaskScheduleDialog();
                          }
                          return;
                        }
                        if (taskScheduleDialogState) {
                          closeTaskScheduleDialog();
                        }
                      },
                      popupContent: renderTaskScheduleDialog({ embedded: true }),
                      popupAriaLabel: "Edit ticket schedule",
                      popupClassName: "playground-tasks-schedule-selector-popup",
                      popupWidth: "min(320px, calc(100vw - 48px))",
                      popupMaxHeight: "min(520px, calc(100vh - 96px))",
                    })
                  )
                ))
                  : null
              )
          }
          const taskDetailBackDestination = taskView === "board" ? "Board" : "Backlog";
	          const isTicketDetailSidebarEffectivelyCollapsed = Boolean(
	            ticketDetailSidebarCollapsed || (isFullPageTaskDetail && previewedTaskAttachment)
	          );
	          const taskDetailNavbar = React.createElement("div", {
                className: "playground-content-nav playground-tasks-detail-navbar",
              },
	                isFullPageTaskDetail
	                  ? React.createElement("div", { className: "playground-tasks-ticket-page-nav-title" },
	                      React.createElement("button", {
	                        type: "button",
	                        className: "playground-files-header-icon-button is-plain playground-tasks-ticket-page-back-link",
	                        onClick: handleCloseTaskDetail,
	                        title: "Back to " + taskDetailBackDestination,
	                        "aria-label": "Back to " + taskDetailBackDestination,
	                      }, React.createElement(ArrowLeft, {
	                        width: 16,
	                        height: 16,
	                        strokeWidth: 1.8,
	                        "aria-hidden": "true",
	                      })),
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
			                        React.createElement(PlatformPopup, {
			                            open: taskDetailPopover === "menu",
			                            rootClassName: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell",
			                            surfaceClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide",
			                            surfaceProps: {
			                              role: "menu",
			                              "aria-label": "Task actions",
			                            },
			                            animation: "down-in",
			                            variant: "minimal",
			                            placement: "bottom-end",
			                            trigger: React.createElement("button", {
			                              type: "button",
			                              className: "playground-files-header-icon-button is-plain" + (taskDetailPopover === "menu" ? " is-active" : ""),
			                              onClick: () => setTaskDetailPopover((current) => current === "menu" ? "" : "menu"),
			                              title: "Task actions",
			                              "aria-label": "Task actions",
			                              "aria-haspopup": "menu",
			                              "aria-expanded": taskDetailPopover === "menu" ? "true" : "false",
			                            }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
			                          },
			                          React.createElement("button", {
			                            type: "button",
			                            role: "menuitem",
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
			                        ),
			                        React.createElement("button", {
				                          type: "button",
				                          className: "playground-files-header-icon-button is-plain playground-tasks-ticket-sidebar-toggle-button",
				                          onClick: () => {
				                            if (previewedTaskAttachment) {
				                              setPreviewedTaskAttachmentId("");
				                              setTicketDetailSidebarCollapsed(false);
				                              return;
				                            }
				                            setTicketDetailSidebarCollapsed((current) => !current);
				                          },
				                          title: isTicketDetailSidebarEffectivelyCollapsed ? "Open sidebar" : "Close sidebar",
				                          "aria-label": isTicketDetailSidebarEffectivelyCollapsed ? "Open sidebar" : "Close sidebar",
				                          "aria-pressed": isTicketDetailSidebarEffectivelyCollapsed ? "true" : "false",
				                        },
				                          isTicketDetailSidebarEffectivelyCollapsed
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
                React.createElement(PlatformAttachments, {
                  className: "playground-tasks-ticket-attachments",
                  items: draftTask.attachments.map((attachment) => buildTaskAttachmentListItem(attachment, {
                    removable: !isTaskConfigLocked,
                  })),
                  inputRef: taskAttachmentInputRef,
                  disabled: isTaskConfigLocked,
                  processing: taskAttachmentTransferState.isProcessing,
                  dragging: isTaskAttachmentDragging,
                  uploadFromComputerDisabled: !activeTaskEnvironmentId,
                  uploadFromComputerTitle: activeTaskEnvironmentId
                    ? "Add files from " + (activeTaskEnvironment?.name || "the selected computer")
                    : "Select a computer first",
                  statusMessage: taskAttachmentTransferState.isProcessing
                    ? "Uploading attachments..."
                    : null,
                  errorMessage: taskAttachmentTransferState.error || null,
                  onUploadFromComputer: openTaskEnvironmentFilePicker,
                  onBrowse: openTaskAttachmentPicker,
                  onInputChange: (event) => void handleTaskAttachmentInputChange(event),
                  onDraggingChange: setIsTaskAttachmentDragging,
                  onFilesDrop: (_files, event) => void handleTaskAttachmentDrop(event),
                }),
                React.createElement("div", { className: "playground-tasks-connectors" },
                  React.createElement("div", { className: "playground-tasks-connectors-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Connectors")
                  ),
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
                React.createElement(PlatformSubtasks, {
                  className: "playground-tasks-ticket-subtasks",
                  disabled: isTaskConfigLocked,
                  onAdd: () => openProjectSubtaskIssueComposer(draftTask.id),
                  items: draftTaskSubtasks.map((subtask) => ({
                    id: subtask.id,
                    title: subtask.title || "Untitled Subtask",
                    metadata: taskTicketNumbersById[subtask.id] || subtask.ticketNumber || "000",
                    status: getPlaygroundTaskStatusLabel(subtask.status),
                    statusVariant: subtask.status === "done"
                      ? "green"
                      : (subtask.status === "blocked"
                          ? "red"
                          : (["in_progress", "in_review"].includes(subtask.status) ? "blue" : "gray")),
                    onActivate: () => handleSelectTask(subtask.id, { screen: projectTaskDetailScreenOpen }),
                  })),
                }),
                React.createElement("div", { className: "playground-tasks-comments" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar playground-tasks-comments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Comments"),
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      size: "small",
                      className: "playground-tasks-comments-add-button",
                      disabled: isTaskConfigLocked,
                      onClick: () => openTaskCommentComposer(),
                    },
                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9, "aria-hidden": "true" }),
                      React.createElement("span", null, "Comment")
                    )
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
                )
                ),
                renderTaskCommentDialog()
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
                    showHeaderCopy: false,
                    showCloseButton: false,
                    showResizeHandle: false,
                  })
                )
              : null;
            const taskAttachmentPreviewPortalTarget = isFullPageTaskDetail
              && attachmentPreviewPortalId
              && typeof document !== "undefined"
              ? document.getElementById(attachmentPreviewPortalId)
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
                  previewTitle: previewedTaskAttachment?.filename || "Attachment preview",
                  previewHeaderActions: previewedTaskAttachment && !isTaskConfigLocked
                    ? React.createElement(PlatformAttachmentActionMenu, {
                        name: previewedTaskAttachment.filename || "Attachment",
                        onRename: (nextName) => handleRenameTaskAttachment(previewedTaskAttachment.id, nextName),
                        onDelete: () => handleRemoveTaskAttachment(previewedTaskAttachment.id),
                      })
                    : null,
                  previewPortalTarget: taskAttachmentPreviewPortalTarget,
                  onPreviewClose: () => setPreviewedTaskAttachmentId(""),
                  sidebarCollapsed: ticketDetailSidebarCollapsed,
                  sidebarPopoverOpen: Boolean(taskDetailSelectPopover || taskScheduleDialogState),
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
