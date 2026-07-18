export const PROJECTS_VIEWS_01_FRAGMENT = `        function renderTaskCard(task, extraMeta) {
          const assignee = task.assigneeAgentId ? assignableActorsById[task.assigneeAgentId] : null;
          const isHumanTask = isHumanAssignedTask(task);
          const sprint = task.sprintId ? sprintsById[task.sprintId] : null;
          const priorityClass = "playground-tasks-chip is-priority-" + task.priority;
          const statusClass = "playground-tasks-chip" + (task.status === "done" ? " is-status-done" : "");
          return React.createElement("div", {
              key: task.id,
              className: "playground-tasks-card" + (selectedTaskId === task.id ? " is-active" : ""),
              role: "button",
              tabIndex: 0,
              onClick: () => handleSelectTask(task.id),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelectTask(task.id);
                }
              },
            },
              React.createElement("div", { className: "playground-tasks-card-header" },
                React.createElement("div", null,
                  React.createElement("div", {
                    className: "playground-tasks-card-title" + (task.status === "done" ? " is-complete" : ""),
                  }, task.title || "Untitled Task"),
                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
                    content: task.description || "Add task details, dependencies, and assignment context from the right-hand pane.",
                    className: "playground-tasks-card-copy tb-message-markdown",
                  })
                ),
                React.createElement("div", { className: "playground-tasks-card-actions" },
                  React.createElement("span", { className: priorityClass }, getPlaygroundTaskPriorityLabel(task.priority)),
                  React.createElement("span", { className: statusClass }, getPlaygroundTaskStatusLabel(task.status))
                )
              ),
              React.createElement("div", { className: "playground-tasks-card-meta" },
                sprint
                  ? React.createElement("span", { className: "playground-tasks-chip" }, sprint.name)
                  : React.createElement("span", { className: "playground-tasks-chip" }, "No sprint"),
                assignee
                  ? React.createElement("span", { className: "playground-tasks-chip" }, assignee.name || "Assigned")
                  : React.createElement("span", { className: "playground-tasks-chip" }, "Unassigned"),
                task.dueAt
                  ? React.createElement("span", { className: "playground-tasks-meta-copy" }, "Due " + formatPlaygroundTaskDateTime(task.dueAt))
                  : null,
                extraMeta || null
              ),
              React.createElement("div", { className: "playground-tasks-inline-actions" },
                isHumanTask
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: (event) => {
                        void handleToggleTaskDone(task, event);
                      },
                      disabled: saveState.isSaving,
                    },
                      React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, task.status === "done" ? "Reopen Task" : "Mark Done")
                    )
                  : React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: (event) => {
                        event.stopPropagation();
                        void handleStartTaskThread(task);
                      },
                      disabled: saveState.isSaving || isTaskThreadLaunchLocked(task),
                    },
                      React.createElement(MessageCircle, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Start Thread")
                    )
              )
            );
        }

        function renderProjectCard(project, index) {
          const summary = {
            ...buildEmptyPlaygroundProjectSummary(),
            ...(project.summary && typeof project.summary === "object" ? project.summary : {}),
          };
          const wallpaper = getPlaygroundProjectWallpaperConfig(project, index);
          const projectIconConfig = getPlaygroundProjectIconConfig(project.icon);
          const ProjectIcon = projectIconConfig.icon;
          const projectBlueprint = getPlaygroundProjectBlueprint(project.projectType || project.type || project.metadata?.projectType || project.metadata?.blueprintId);
          const isProjectCardMenuOpen = projectCardMenuProjectId === project.id;

          return React.createElement("div", {
              key: project.id,
              className: "playground-tasks-project-card",
              role: "button",
              tabIndex: 0,
              style: {
                backgroundImage: 'linear-gradient(180deg, rgba(9, 10, 12, 0.12), rgba(9, 10, 12, 0.48)), url("' + wallpaper.url + '")',
              },
              onClick: () => handleSelectProject(project.id),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelectProject(project.id);
                }
            },
            },
              React.createElement("div", { className: "playground-tasks-project-card-hero" },
                React.createElement("div", { className: "playground-tasks-project-card-top" },
                  React.createElement("div", { className: "playground-tasks-project-card-icon" },
                    React.createElement(ProjectIcon, { width: 20, height: 20, strokeWidth: 1.9 })
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-card-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (isProjectCardMenuOpen ? " is-active" : ""),
                      "aria-label": "Project actions",
                      "aria-expanded": isProjectCardMenuOpen ? "true" : "false",
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setProjectCardMenuProjectId((current) => current === project.id ? "" : project.id);
                      },
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    isProjectCardMenuOpen
                      ? React.createElement(PlatformPopupSurface, {
                          className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in",
                          onClick: (event) => event.stopPropagation(),
                        },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-row",
                            onClick: (event) => {
                              event.stopPropagation();
                              setProjectCardMenuProjectId("");
                              openProjectComposerForEdit(project);
                            },
                          },
                            React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, "Edit Project"),
                              React.createElement("span", null, "Change icon, title, description, and card background.")
                            )
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                            onClick: (event) => {
                              event.stopPropagation();
                              setProjectCardMenuProjectId("");
                              void handleDeleteProject(project.id);
                            },
                          },
                            React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, "Delete Project"),
                              React.createElement("span", null, "Remove this project and its planning scope.")
                            )
                          )
                        )
                      : null
                  )
                ),
                React.createElement("div", { className: "playground-tasks-project-card-kicker" }, projectBlueprint.shortTitle || "Project Workspace"),
                React.createElement("div", { className: "playground-tasks-project-card-title" }, project.name || "Untitled Project"),
                React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: project.description || "Open this project to access its environments, active threads, and sprint-driven task board.",
                  className: "playground-tasks-project-card-copy tb-message-markdown",
                })
              ),
              React.createElement("div", { className: "playground-tasks-project-card-body" },
                React.createElement("div", { className: "playground-tasks-project-card-metrics" },
                  React.createElement("span", { className: "playground-tasks-chip" }, summary.threadsCount + " threads"),
                  React.createElement("span", { className: "playground-tasks-chip" }, summary.openTasksCount + " open tasks"),
                  React.createElement("span", { className: "playground-tasks-chip" }, projectBlueprint.shortTitle || "Project")
                )
              )
            );
        }

        function renderProjectWallpaperPicker() {
          return null;
        }

        function renderIssueComposerField(label, control, options = {}) {
          return React.createElement("label", {
              className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" + (options.full ? " is-full" : ""),
            },
            React.createElement("div", { className: "playground-tasks-project-modal-label" }, label),
            control
          );
        }

        function renderProjectIssueComposerDialog() {
          if (!issueComposerOpen) {
            return null;
          }

          const normalizedIssueType = normalizePlaygroundTaskType(issueComposerDraft.taskType);
          const selectedDependencyId = normalizePlaygroundIdList(issueComposerDraft.dependencyIds)[0] || "";
          const parentTicketCandidates = tasks
            .filter((task) => task?.id && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          const dependencyCandidates = tasks
            .filter((task) => task?.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          const scheduleMode = issueComposerDraft.scheduledStartAt
            ? (issueComposerDraft.scheduleType === "recurring" ? "recurring" : "one-time")
            : "none";
          const recurrencePresetId = getPlaygroundTaskSchedulePresetId(issueComposerDraft.cronExpression) || "daily";
          const selectedIssueEnvironment = issueComposerDraft.environmentId
            ? availableBacklogEnvironments.find((environment) => environment?.id === issueComposerDraft.environmentId) || null
            : null;
          const issueEnvironmentLabel = selectedIssueEnvironment
            ? ((selectedIssueEnvironment.name || selectedIssueEnvironment.id) + (selectedIssueEnvironment.isDefault ? " (Default)" : ""))
            : (availableBacklogEnvironments.length > 0 ? "Select environment" : "No environments");

          function renderIssueComposerEnvironmentOptionRow(environment) {
            const isSelected = selectedIssueEnvironment?.id === environment.id;
            return React.createElement("button", {
                key: environment.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (isSelected ? " selected" : ""),
                onClick: () => {
                  updateIssueComposerField("environmentId", environment.id);
                  setIssueComposerEnvironmentPopoverOpen(false);
                },
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                isSelected
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, (environment.name || environment.id) + (environment.isDefault ? " (Default)" : "")),
                React.createElement("span", null, "Use this computer for this issue.")
              )
            );
          }

          function renderIssueComposerComputerSelector() {
            return React.createElement("div", { className: "playground-tasks-project-modal-environment-picker playground-tasks-issue-modal-computer-picker" },
              renderPlaygroundPlatformPopup({
                open: issueComposerEnvironmentPopoverOpen,
                shellRef: issueComposerEnvironmentPopoverRef,
                shellClassName: "playground-environments-runtime-popup-shell playground-tasks-detail-select-shell",
                menuClassName: "playground-tasks-toolbar-popup-menu-environment",
                trigger: React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger playground-tasks-project-modal-environment-button" + (selectedIssueEnvironment ? "" : " is-empty") + (issueComposerEnvironmentPopoverOpen ? " is-active" : ""),
                  onClick: () => {
                    setIssueComposerDetailSelectPopover("");
                    setIssueComposerEnvironmentPopoverOpen((current) => !current);
                  },
                  title: issueEnvironmentLabel,
                  "aria-expanded": issueComposerEnvironmentPopoverOpen ? "true" : "false",
                  disabled: availableBacklogEnvironments.length === 0,
                },
                  React.createElement(Monitor, { className: "playground-tasks-project-modal-environment-icon", strokeWidth: 1.8 }),
                  React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueEnvironmentLabel),
                  React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                ),
                children: availableBacklogEnvironments.length > 0
                  ? availableBacklogEnvironments.map((environment) => renderIssueComposerEnvironmentOptionRow(environment))
                  : React.createElement("div", { className: "tb-popup-empty-state" }, "No environments available."),
              })
            );
          }

          function renderIssueComposerDescriptionField() {
            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                  [
                    { id: "bold", label: "Bold", icon: Bold },
                    { id: "italic", label: "Italic", icon: Italic },
                    { id: "underline", label: "Underline", icon: Underline },
                    { id: "list", label: "List", icon: List },
                  ].map((action) =>
                    React.createElement("button", {
                      key: action.id,
                      type: "button",
                      className: "playground-tasks-detail-format-button",
                      title: action.label,
                      "aria-label": action.label,
                      onMouseDown: (event) => event.preventDefault(),
                      onClick: () => handleIssueComposerDescriptionFormat(action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isIssueComposerDescriptionEditing ? " is-editing" : " is-preview") },
                !isIssueComposerDescriptionEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      String(issueComposerDraft.description || "").trim()
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: issueComposerDraft.description,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, "Describe the expected outcome, context, constraints, and acceptance criteria.")
                    )
                  : null,
                React.createElement("textarea", {
                  ref: issueComposerDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input " + (isIssueComposerDescriptionEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isIssueComposerDescriptionEditing ? "Describe the expected outcome, context, constraints, and acceptance criteria." : "",
                  value: issueComposerDraft.description || "",
                  onFocus: (event) => {
                    setIsIssueComposerDescriptionEditing(true);
                    resizeTaskDescriptionTextarea(event.currentTarget);
                  },
                  onChange: (event) => {
                    updateIssueComposerField("description", event.target.value);
                    resizeTaskDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: () => setIsIssueComposerDescriptionEditing(false),
                })
              )
            );
          }

          function toggleIssueComposerDetailSelectPopover(nextPopoverId) {
            setIssueComposerEnvironmentPopoverOpen(false);
            setIssueComposerDetailSelectPopover((current) => current === nextPopoverId ? "" : nextPopoverId);
          }

          function renderIssueComposerDetailSelectOptionRow({ key, label, description, selected, onClick, disabled = false }) {
            return React.createElement("button", {
                key,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (selected ? " selected" : ""),
                onClick,
                disabled,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                selected
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, label),
                description
                  ? React.createElement("span", null, description)
                  : null
              )
            );
          }

          function renderIssueComposerDetailSelectControl({
            popoverId,
            valueLabel,
            disabled = false,
            isEmpty = false,
            buttonContent = null,
            menuClassName = "",
            children,
          }) {
            const isOpen = issueComposerDetailSelectPopover === popoverId;
            return renderPlaygroundPlatformPopup({
              open: isOpen,
              shellRef: isOpen ? issueComposerDetailSelectPopoverRef : null,
              shellClassName: "playground-environments-runtime-popup-shell playground-tasks-detail-select-shell",
              menuClassName,
              trigger: React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (isEmpty ? " is-empty" : "") + (isOpen ? " is-active" : ""),
                disabled,
                onClick: () => {
                  if (disabled) return;
                  toggleIssueComposerDetailSelectPopover(popoverId);
                },
                title: valueLabel,
                "aria-expanded": isOpen ? "true" : "false",
              },
                buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
                React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
              ),
              children,
            });
          }

          function renderIssueComposerDetailFact(label, control) {
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
          }

          function renderIssueComposerPersonValue(actorId, label) {
            const normalizedActorId = String(actorId || "").trim();
            return React.createElement("span", { className: "playground-tasks-detail-person-value" },
              normalizedActorId ? renderTaskActorAvatar(normalizedActorId, "playground-tasks-detail-person-avatar") : null,
              React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, label)
            );
          }

          function renderIssueComposerAgentRow(actor, options = {}) {
            const mode = getPlaygroundTaskAssigneePopupMode(actor);
            const actorLabel = getTaskAssigneeName(actor.id, actor.name || "Unknown");
            const actorDescription = options.reviewer
              ? (mode === "humans" ? "Human reviewer" : (mode === "teams" ? "Agent squad reviewer" : "Agent reviewer"))
              : (mode === "humans" ? "Human" : (mode === "teams" ? "Agent squad" : "Agent"));
            const isSelected = options.reviewer
              ? (issueComposerDraft.reviewRequired && issueComposerDraft.reviewerAgentId === actor.id)
              : issueComposerDraft.assigneeAgentId === actor.id;
            return React.createElement("button", {
                key: actor.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (isSelected ? " selected" : ""),
                onClick: () => {
                  if (options.reviewer) {
                    updateIssueComposerDraft((current) => ({
                      ...current,
                      reviewRequired: true,
                      reviewerAgentId: actor.id,
                    }));
                  } else {
                    updateIssueComposerField("assigneeAgentId", actor.id);
                  }
                  setIssueComposerDetailSelectPopover("");
                },
              },
              renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, actorLabel),
                React.createElement("span", null, actorDescription)
              ),
              React.createElement("span", { className: "tb-popup-check-slot" },
                isSelected
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              )
            );
          }

          function renderIssueComposerReviewerNoneRow() {
            return React.createElement("button", {
                key: "__none__",
                type: "button",
                className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (!issueComposerDraft.reviewRequired ? " selected" : ""),
                onClick: () => {
                  updateIssueComposerDraft((current) => ({
                    ...current,
                    reviewRequired: false,
                    reviewerAgentId: null,
                  }));
                  setIssueComposerDetailSelectPopover("");
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
                !issueComposerDraft.reviewRequired
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              )
            );
          }

          function renderIssueComposerDetailsSection() {
            const issueType = normalizePlaygroundTaskType(issueComposerDraft.taskType);
            const IssueTypeIcon = issueType === "subtask" ? Check : (issueType === "loop" ? RefreshCw : Bookmark);
            const issueTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === issueType)?.label || "Task";
            const issueStatusLabel = PLAYGROUND_TASK_STATUS_OPTIONS.find((option) => option.id === issueComposerDraft.status)?.label || "To do";
            const issuePriorityPresentation = getPlaygroundTaskPriorityPresentation(issueComposerDraft.priority);
            const issueColorPresentation = getPlaygroundTaskColorPresentation(issueComposerDraft.taskColor);
            const selectedRelease = issueComposerDraft.releaseId ? releases.find((release) => release.id === issueComposerDraft.releaseId) || null : null;
            const selectedSprint = issueComposerDraft.sprintId ? sprints.find((sprint) => sprint.id === issueComposerDraft.sprintId) || null : null;
            const selectedAssignee = issueComposerDraft.assigneeAgentId ? assignableActors.find((actor) => actor.id === issueComposerDraft.assigneeAgentId) || null : null;
            const assigneeLabel = selectedAssignee ? getTaskAssigneeOptionLabel(selectedAssignee) : "Unassigned";
            const selectedReviewer = issueComposerDraft.reviewRequired && issueComposerDraft.reviewerAgentId
              ? assignableActors.find((actor) => actor.id === issueComposerDraft.reviewerAgentId) || null
              : null;
            const reviewerLabel = issueComposerDraft.reviewRequired
              ? (selectedReviewer ? getTaskAssigneeOptionLabel(selectedReviewer) : "Reviewer")
              : "No review";
            const selectedDependencyTask = selectedDependencyId ? tasks.find((task) => task.id === selectedDependencyId) || null : null;
            const dependencyLabel = selectedDependencyTask
              ? ((taskTicketNumbersById[selectedDependencyTask.id] || selectedDependencyTask.ticketNumber || "000") + " - " + (selectedDependencyTask.title || "Untitled Task"))
              : "None";
            const scheduleLabel = scheduleMode === "recurring" ? "Recurring" : (scheduleMode === "one-time" ? "One-time" : "None");

            return React.createElement("div", {
                className: "playground-tasks-detail-facts playground-tasks-issue-details-section" + (issueComposerDetailSelectPopover ? " is-popover-open" : ""),
              },
              React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-detail-facts-toggle" + (issueComposerDetailsCollapsed ? " is-collapsed" : ""),
                  onClick: () => setIssueComposerDetailsCollapsed((current) => !current),
                  title: issueComposerDetailsCollapsed ? "Expand details" : "Collapse details",
                  "aria-label": issueComposerDetailsCollapsed ? "Expand details" : "Collapse details",
                  "aria-expanded": issueComposerDetailsCollapsed ? "false" : "true",
                }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              !issueComposerDetailsCollapsed
                ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                    renderIssueComposerDetailFact("Type",
                      React.createElement("div", { className: "playground-tasks-type-control" },
                        renderIssueComposerDetailSelectControl({
                          popoverId: "type",
                          valueLabel: issueTypeLabel,
                          buttonContent: React.createElement("span", { className: "playground-tasks-detail-type-value" },
                            React.createElement(IssueTypeIcon, { className: "playground-tasks-detail-type-icon", strokeWidth: 1.9 }),
                            React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueTypeLabel)
                          ),
                          children: PLAYGROUND_TASK_TYPE_OPTIONS.map((option) =>
                            renderIssueComposerDetailSelectOptionRow({
                              key: option.id,
                              label: option.label,
                              selected: issueType === option.id,
                              onClick: () => {
                                const nextType = normalizePlaygroundTaskType(option.id);
                                updateIssueComposerDraft((current) => ({
                                  ...current,
                                  taskType: nextType,
                                  parentTaskId: nextType === "subtask" ? current.parentTaskId : null,
                                }));
                                setIssueComposerDetailSelectPopover("");
                              },
                            })
                          ),
                        })
                      )
                    ),
                    renderIssueComposerDetailFact("Status",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "status",
                        valueLabel: issueStatusLabel,
                        children: PLAYGROUND_TASK_STATUS_OPTIONS.map((option) =>
                          renderIssueComposerDetailSelectOptionRow({
                            key: option.id,
                            label: option.label,
                            selected: issueComposerDraft.status === option.id,
                            onClick: () => {
                              updateIssueComposerDraft((current) => ({
                                ...current,
                                status: option.id,
                                dependencyIds: option.id === "blocked" ? normalizePlaygroundIdList(current.dependencyIds) : [],
                                completedAt: option.id === "done" ? (current.completedAt || new Date().toISOString()) : null,
                              }));
                              setIssueComposerDetailSelectPopover("");
                            },
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Priority",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "priority",
                        valueLabel: issuePriorityPresentation.label,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + issuePriorityPresentation.toneClassName,
                          },
                          renderPlaygroundTaskPriorityGlyph(issueComposerDraft.priority),
                          React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, issuePriorityPresentation.label)
                        ),
                        children: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                          renderIssueComposerDetailSelectOptionRow({
                            key: option.id,
                            label: getPlaygroundTaskPriorityPresentation(option.id).label,
                            selected: issueComposerDraft.priority === option.id,
                            onClick: () => {
                              updateIssueComposerField("priority", option.id);
                              setIssueComposerDetailSelectPopover("");
                            },
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Color",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "color",
                        valueLabel: issueColorPresentation.label,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-detail-color-value",
                            style: getPlaygroundTaskColorStyle(issueComposerDraft.taskColor),
                          },
                          React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueColorPresentation.label)
                        ),
                        children: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                          renderIssueComposerDetailSelectOptionRow({
                            key: option.id,
                            label: React.createElement("span", {
                                className: "playground-tasks-detail-select-popup-label-slot",
                                style: getPlaygroundTaskColorStyle(option.id),
                              },
                              React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                              React.createElement("span", null, option.label)
                            ),
                            selected: getPlaygroundTaskColorId(issueComposerDraft.taskColor) === option.id,
                            onClick: () => {
                              updateIssueComposerField("taskColor", option.id);
                              setIssueComposerDetailSelectPopover("");
                            },
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Milestone",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "release",
                        valueLabel: selectedRelease ? (selectedRelease.name || "Untitled Milestone") : "None",
                        isEmpty: !selectedRelease,
                        children: [
                          renderIssueComposerDetailSelectOptionRow({
                            key: "__none__",
                            label: "None",
                            selected: !selectedRelease,
                            onClick: () => {
                              updateIssueComposerField("releaseId", null);
                              setIssueComposerDetailSelectPopover("");
                            },
                          }),
                          ...releases
                            .slice()
                            .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                            .map((release) =>
                              renderIssueComposerDetailSelectOptionRow({
                                key: release.id,
                                label: release.name || "Untitled Milestone",
                                description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                                selected: issueComposerDraft.releaseId === release.id,
                                onClick: () => {
                                  updateIssueComposerField("releaseId", release.id);
                                  setIssueComposerDetailSelectPopover("");
                                },
                              })
                            ),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Sprint",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "sprint",
                        valueLabel: selectedSprint ? (selectedSprint.name || "Untitled Sprint") : "None",
                        isEmpty: !selectedSprint,
                        children: [
                          renderIssueComposerDetailSelectOptionRow({
                            key: "__none__",
                            label: "None",
                            selected: !selectedSprint,
                            onClick: () => {
                              updateIssueComposerField("sprintId", null);
                              setIssueComposerDetailSelectPopover("");
                            },
                          }),
                          ...sprints
                            .slice()
                            .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                            .map((sprint) =>
                              renderIssueComposerDetailSelectOptionRow({
                                key: sprint.id,
                                label: sprint.name || "Untitled Sprint",
                                selected: issueComposerDraft.sprintId === sprint.id,
                                onClick: () => {
                                  updateIssueComposerField("sprintId", sprint.id);
                                  setIssueComposerDetailSelectPopover("");
                                },
                              })
                            ),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Assignee",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "assignee",
                        valueLabel: assigneeLabel,
                        isEmpty: !selectedAssignee,
                        buttonContent: renderIssueComposerPersonValue(issueComposerDraft.assigneeAgentId, assigneeLabel),
                        menuClassName: "tb-popup-menu-inline-agent",
                        children: assignableActors.length > 0
                          ? assignableActors.map((actor) => renderIssueComposerAgentRow(actor))
                          : React.createElement("div", { className: "tb-popup-empty-state" }, "No assignees yet."),
                      })
                    ),
                    renderIssueComposerDetailFact("Reviewer",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "reviewer",
                        valueLabel: reviewerLabel,
                        isEmpty: !issueComposerDraft.reviewRequired,
                        buttonContent: renderIssueComposerPersonValue(issueComposerDraft.reviewRequired ? issueComposerDraft.reviewerAgentId : "", reviewerLabel),
                        menuClassName: "tb-popup-menu-inline-agent",
                        children: [
                          renderIssueComposerReviewerNoneRow(),
                          ...assignableActors.map((actor) => renderIssueComposerAgentRow(actor, { reviewer: true })),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Blocked by",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "blocked-by",
                        valueLabel: dependencyLabel,
                        isEmpty: !selectedDependencyId,
                        menuClassName: "playground-tasks-toolbar-popup-menu-wide",
                        children: [
                          renderIssueComposerDetailSelectOptionRow({
                            key: "__none__",
                            label: "None",
                            selected: !selectedDependencyId,
                            onClick: () => {
                              updateIssueComposerDraft((current) => ({
                                ...current,
                                dependencyIds: [],
                                status: current.status === "blocked" ? "todo" : current.status,
                              }));
                              setIssueComposerDetailSelectPopover("");
                            },
                          }),
                          ...dependencyCandidates.map((task) =>
                            renderIssueComposerDetailSelectOptionRow({
                              key: task.id,
                              label: (taskTicketNumbersById[task.id] || task.ticketNumber || "000") + " - " + (task.title || "Untitled Task"),
                              selected: selectedDependencyId === task.id,
                              onClick: () => {
                                updateIssueComposerDraft((current) => ({
                                  ...current,
                                  dependencyIds: [task.id],
                                  status: "blocked",
                                }));
                                setIssueComposerDetailSelectPopover("");
                              },
                            })
                          ),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Schedule",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "schedule",
                        valueLabel: scheduleLabel,
                        isEmpty: scheduleMode === "none",
                        children: [
                          { id: "none", label: "None" },
                          { id: "one-time", label: "One-time" },
                          { id: "recurring", label: "Recurring" },
                        ].map((option) =>
                          renderIssueComposerDetailSelectOptionRow({
                            key: option.id,
                            label: option.label,
                            selected: scheduleMode === option.id,
                            onClick: () => {
                              updateIssueComposerDraft((current) => ({
                                ...current,
                                scheduledStartAt: option.id === "none" ? null : current.scheduledStartAt,
                                scheduledEndAt: option.id === "none" ? null : current.scheduledEndAt,
                                scheduleType: option.id === "recurring" ? "recurring" : "one-time",
                                cronExpression: option.id === "recurring"
                                  ? (current.cronExpression || buildPlaygroundCronExpressionForPreset("daily", current.scheduledStartAt || Date.now()))
                                  : null,
                              }));
                              setIssueComposerDetailSelectPopover("");
                            },
                          })
                        ),
                      })
                    )
                  )
                : null
            );
          }

          return renderPlaygroundPlatformModal({
            open: issueComposerOpen,
            visible: issueComposerVisible,
            closing: issueComposerClosing,
            onClose: () => closeProjectIssueComposer(),
            as: "form",
            backdropClassName: "playground-tasks-project-issue-backdrop",
            className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal",
            ariaLabel: "New issue",
            surfaceProps: {
              onSubmit: (event) => void handleSaveProjectIssue(event),
            },
            children: React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
	                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
	                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
	                    React.createElement(Bookmark, { width: 18, height: 18, strokeWidth: 1.9 })
	                  ),
	                  React.createElement("input", {
	                    type: "text",
	                    className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
	                    value: issueComposerDraft.title || "",
	                    placeholder: "Issue title",
	                    autoFocus: true,
	                    onChange: (event) => updateIssueComposerField("title", event.target.value),
	                  })
	                ),
	                renderIssueComposerComputerSelector(),
	                React.createElement("button", {
	                  type: "button",
	                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: () => closeProjectIssueComposer(),
                  title: "Close",
                  disabled: issueComposerSaveState.isSaving,
	                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
		              ),
		              React.createElement("div", { className: "playground-tasks-issue-modal-body" },
		                renderIssueComposerDescriptionField(),
		                renderIssueComposerDetailsSection(),
	                issueComposerSaveState.error
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, issueComposerSaveState.error)
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-environments-action-button",
                  onClick: () => closeProjectIssueComposer(),
                  disabled: issueComposerSaveState.isSaving,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  className: "playground-environments-action-button is-primary",
                  disabled: issueComposerSaveState.isSaving || !String(issueComposerDraft.title || "").trim(),
                }, issueComposerSaveState.isSaving ? "Creating..." : "Create Issue")
              )
            )
          });
        }

        function renderProjectComposerDialog(options = {}) {
          const embedded = options?.embedded === true;
          if (!projectComposerOpen || (!embedded && missionControlSetupOpen)) {
            return null;
          }

          const selectedProjectIcon = getPlaygroundProjectIconConfig(projectDraft.icon);
          const SelectedProjectIcon = selectedProjectIcon.icon;
          const selectedProjectBlueprint = getPlaygroundProjectBlueprint(projectDraft.projectType || projectDraft.type || projectDraft.metadata?.projectType || projectDraft.metadata?.blueprintId);
          const projectAttachments = normalizePlaygroundTaskAttachmentList(projectDraft.attachments);
          const hasProjectAttachments = projectAttachments.length > 0;
          const projectConnectorEntries = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, projectDraft);
            const isConnected = taskConnectorConfigByKey[option.key]?.connected !== false;
            return {
              ...option,
              selection,
              valueLabel: selection?.valueLabel || (isConnected ? "None" : "Connect"),
            };
          });
          const selectedProjectEnvironmentId = activeProjectAttachmentEnvironmentId
            || projectComposerDefaultEnvironmentId
            || projectComposerAvailableEnvironments[0]?.id
            || "";
          const selectedProjectEnvironmentOption = selectedProjectEnvironmentId
            ? projectComposerAvailableEnvironments.find((environment) => environment.id === selectedProjectEnvironmentId) || activeProjectAttachmentEnvironment
            : null;
          const projectDefaultEnvironmentLabel = selectedProjectEnvironmentOption
            ? (selectedProjectEnvironmentOption.name + (selectedProjectEnvironmentOption.isDefault ? " (Default)" : ""))
            : (projectComposerAvailableEnvironments.length > 0 ? "Select environment" : "No environments");

          function renderProjectComposerEnvironmentOptionRow(environment) {
            return React.createElement("button", {
                key: environment.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (selectedProjectEnvironmentId === environment.id ? " selected" : ""),
                onClick: () => {
                  setProjectDraft((current) => ({
                    ...current,
                    defaultEnvironmentId: environment.id,
                  }));
                  setProjectComposerEnvironmentPopoverOpen(false);
                  setProjectAttachmentTransferState((current) => ({
                    ...current,
                    error: "",
                  }));
                },
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                selectedProjectEnvironmentId === environment.id
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, environment.name + (environment.isDefault ? " (Default)" : "")),
                React.createElement("span", null, "Use this computer for project-wide files.")
              )
            );
          }

          function renderProjectComposerEnvironmentPicker() {
            return React.createElement("div", { className: "playground-tasks-project-modal-environment-picker" },
              React.createElement("div", {
                className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell" + (projectComposerEnvironmentPopoverOpen ? " is-open" : ""),
                ref: projectComposerEnvironmentPopoverRef,
              },
                React.createElement("button", {
                  type: "button",
	                  className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger playground-tasks-project-modal-environment-button" + (selectedProjectEnvironmentOption ? "" : " is-empty") + (projectComposerEnvironmentPopoverOpen ? " is-active" : ""),
	                  onClick: () => {
	                    setProjectIconPickerOpen(false);
	                    setProjectBlueprintPickerOpen(false);
	                    setProjectComposerEnvironmentPopoverOpen((current) => !current);
	                  },
                  title: projectDefaultEnvironmentLabel,
                  "aria-expanded": projectComposerEnvironmentPopoverOpen ? "true" : "false",
                  disabled: projectComposerAvailableEnvironments.length === 0,
                },
                  React.createElement(Monitor, { className: "playground-tasks-project-modal-environment-icon", strokeWidth: 1.8 }),
                  React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, projectDefaultEnvironmentLabel),
                  React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                ),
                projectComposerEnvironmentPopoverOpen
                  ? React.createElement(PlatformPopupSurface, {
                      className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-tasks-toolbar-popup-menu-environment",
                    },
                      projectComposerAvailableEnvironments.length > 0
                        ? projectComposerAvailableEnvironments.map((environment) => renderProjectComposerEnvironmentOptionRow(environment))
                        : React.createElement("div", { className: "tb-popup-empty-state" }, "No environments available.")
                    )
                  : null
              )
            );
          }

          function handleProjectBlueprintSelection(blueprint) {
            setProjectDraft((current) => {
              const currentRecord = current && typeof current === "object" ? current : {};
              const currentMetadata = currentRecord.metadata && typeof currentRecord.metadata === "object" && !Array.isArray(currentRecord.metadata)
                ? currentRecord.metadata
                : {};
              const previousWallpaperId = String(currentRecord.wallpaperId || currentMetadata.wallpaperId || "").trim();
              const nextDraft = applyPlaygroundProjectBlueprintToDraft(currentRecord, blueprint.id, {
                replaceRules: true,
              });
              const nextMetadata = nextDraft.metadata && typeof nextDraft.metadata === "object" && !Array.isArray(nextDraft.metadata)
                ? nextDraft.metadata
                : {};
              return {
                ...nextDraft,
                wallpaperId: previousWallpaperId || nextDraft.wallpaperId || "",
                metadata: {
                  ...nextMetadata,
                  wallpaperId: previousWallpaperId || nextMetadata.wallpaperId || "",
                },
              };
            });
            setProjectBlueprintPickerOpen(false);
            setProjectIconPickerOpen(false);
            setProjectComposerEnvironmentPopoverOpen(false);
          }

          function renderProjectBlueprintOption(blueprint) {
            const BlueprintIcon = blueprint.Icon || getPlaygroundProjectIconConfig(blueprint.iconId).icon;
            const isActive = selectedProjectBlueprint.id === blueprint.id;
            return React.createElement("button", {
                key: blueprint.id,
                type: "button",
                className: "playground-tasks-project-blueprint-option" + (isActive ? " is-active" : ""),
                onClick: () => handleProjectBlueprintSelection(blueprint),
              },
              React.createElement("span", {
                className: "playground-tasks-project-blueprint-icon",
                style: { "--project-blueprint-accent": blueprint.color || "#66A6FF" },
                "aria-hidden": "true",
              }, React.createElement(BlueprintIcon, { width: 15, height: 15, strokeWidth: 1.85 })),
              React.createElement("span", { className: "playground-tasks-project-blueprint-copy" },
                React.createElement("span", { className: "playground-tasks-project-blueprint-title" }, blueprint.title),
                React.createElement("span", { className: "playground-tasks-project-blueprint-description" }, blueprint.description)
              )
            );
          }

	          function renderProjectBlueprintSelector() {
	            const BlueprintIcon = selectedProjectBlueprint.Icon || getPlaygroundProjectIconConfig(selectedProjectBlueprint.iconId).icon;
	            return React.createElement("div", {
	                className: "playground-tasks-project-blueprint-section playground-tasks-toolbar-popup-shell" + (projectBlueprintPickerOpen ? " is-open" : ""),
	                ref: projectBlueprintPickerRef,
	              },
	              React.createElement("button", {
	                type: "button",
	                className: "playground-tasks-project-blueprint-trigger",
	                onClick: () => {
	                  setProjectIconPickerOpen(false);
	                  setProjectComposerEnvironmentPopoverOpen(false);
	                  setProjectBlueprintPickerOpen((current) => !current);
	                },
	                "aria-haspopup": "listbox",
	                "aria-expanded": projectBlueprintPickerOpen ? "true" : "false",
	              },
                React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-main" },
                    React.createElement("span", {
                      className: "playground-tasks-project-blueprint-icon",
                      style: { "--project-blueprint-accent": selectedProjectBlueprint.color || "#66A6FF" },
                      "aria-hidden": "true",
                    }, React.createElement(BlueprintIcon, { width: 15, height: 15, strokeWidth: 1.85 })),
                  React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-copy" },
                    React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-title" }, selectedProjectBlueprint.title),
                  React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-description" }, selectedProjectBlueprint.description)
                    )
	                ),
	                React.createElement(ChevronDown, { className: "playground-tasks-project-blueprint-chevron", strokeWidth: 1.8 })
	              ),
	              projectBlueprintPickerOpen
	                ? React.createElement(PlatformPopupSurface, {
	                    className: "playground-tasks-toolbar-popup-menu playground-tasks-project-blueprint-popover playground-tasks-toolbar-popup-menu-animate-down-in",
	                    role: "listbox",
	                  },
	                    React.createElement("div", { className: "playground-tasks-project-blueprint-grid" },
	                      PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.map((blueprint) => renderProjectBlueprintOption(blueprint))
	                    )
	                  )
	                : null
	            );
	          }

          function getProjectDraftLeadDisplay() {
            const metadata = projectDraft?.metadata && typeof projectDraft.metadata === "object" && !Array.isArray(projectDraft.metadata)
              ? projectDraft.metadata
              : {};
            const metadataLead = metadata.lead && typeof metadata.lead === "object" && !Array.isArray(metadata.lead)
              ? metadata.lead
              : {};
            const leadName = String(
              projectDraft?.leadName
                || metadata.leadName
                || metadataLead.name
                || currentUserName
                || currentUserEmail
                || "Project Lead"
            ).trim();
            const leadEmail = String(
              projectDraft?.leadEmail
                || metadata.leadEmail
                || metadataLead.email
                || currentUserEmail
                || ""
            ).trim();
            const leadAvatarUrl = String(
              projectDraft?.leadAvatarUrl
                || metadata.leadAvatarUrl
                || metadataLead.avatarUrl
                || metadataLead.photoUrl
                || currentUserAvatarUrl
                || ""
            ).trim();
            return {
              name: leadName || "Project Lead",
              email: leadEmail,
              avatarUrl: leadAvatarUrl,
            };
          }

          function assignCurrentUserAsProjectLead(event) {
            if (event?.preventDefault) {
              event.preventDefault();
            }
            const leadName = String(currentUserName || currentUserEmail || "Project Lead").trim();
            const leadEmail = String(currentUserEmail || "").trim();
            const leadAvatarUrl = String(currentUserAvatarUrl || "").trim();
            const leadUserId = leadEmail || leadName || "current";
            setProjectDraft((current) => {
              const currentRecord = current && typeof current === "object" ? current : {};
              const currentMetadata = currentRecord.metadata && typeof currentRecord.metadata === "object" && !Array.isArray(currentRecord.metadata)
                ? currentRecord.metadata
                : {};
              return {
                ...currentRecord,
                leadUserId,
                leadName,
                leadEmail,
                leadAvatarUrl,
                metadata: {
                  ...currentMetadata,
                  leadUserId,
                  leadName,
                  leadEmail,
                  leadAvatarUrl,
                  lead: {
                    userId: leadUserId,
                    name: leadName,
                    email: leadEmail,
                    avatarUrl: leadAvatarUrl,
                  },
                },
              };
            });
          }

          function renderProjectLeadSelector(options = {}) {
            const lead = getProjectDraftLeadDisplay();
            const label = String(options?.label || "Lead").trim() || "Lead";
            return React.createElement("button", {
                type: "button",
                className: "playground-tasks-project-lead-selector",
                onClick: assignCurrentUserAsProjectLead,
                title: "Project lead",
              },
              React.createElement("span", { className: "playground-tasks-project-lead-label" }, label),
              React.createElement("span", { className: "playground-tasks-project-lead-person" },
                canRenderAvatarImage(lead.avatarUrl)
                  ? React.createElement("img", {
                      className: "playground-tasks-project-lead-avatar",
                      src: lead.avatarUrl,
                      alt: lead.name,
                      draggable: false,
                    })
                  : React.createElement("span", { className: "playground-tasks-project-lead-avatar" },
                      React.createElement(User, { width: 13, height: 13, strokeWidth: 1.8 })
                    ),
                React.createElement("span", { className: "playground-tasks-project-lead-copy" },
                  React.createElement("span", { className: "playground-tasks-project-lead-name" }, lead.name),
                  lead.email
                    ? React.createElement("span", { className: "playground-tasks-project-lead-email" }, lead.email)
                    : null
                )
              ),
              React.createElement(ChevronDown, { className: "playground-tasks-project-lead-chevron", strokeWidth: 1.8 })
            );
          }

          const isInitialProjectSetupModal = !embedded && projectComposerMode === "create";

          function renderProjectInitialSetupField(label, child, className = "") {
            return React.createElement("div", {
                className: "playground-tasks-project-initial-setup-field" + (className ? " " + className : ""),
              },
              React.createElement("div", { className: "playground-tasks-project-initial-setup-label" }, label),
              child
            );
          }

          function renderProjectInitialGoalField() {
            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Project goal"),
                React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                  [
                    { id: "bold", label: "Bold", icon: Bold },
                    { id: "italic", label: "Italic", icon: Italic },
                    { id: "underline", label: "Underline", icon: Underline },
                    { id: "list", label: "List", icon: List },
                  ].map((action) =>
                    React.createElement("button", {
                      key: action.id,
                      type: "button",
                      className: "playground-tasks-detail-format-button",
                      title: action.label,
                      "aria-label": action.label,
                      onMouseDown: (event) => event.preventDefault(),
                      onClick: () => handleProjectDescriptionFormat(action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isProjectDescriptionEditing ? " is-editing" : " is-preview") },
                !isProjectDescriptionEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      String(projectDraft.description || "").trim()
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: projectDraft.description,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, "Define the project goal, scope, working style, and constraints.")
                    )
                  : null,
                React.createElement("textarea", {
                  ref: projectDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input " + (isProjectDescriptionEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isProjectDescriptionEditing ? "Define the project goal, scope, working style, and constraints." : "",
                  value: projectDraft.description,
                  onFocus: () => setProjectDescriptionEditing(true),
                  onChange: (event) => {
                    setProjectDraft((current) => ({ ...current, description: event.target.value }));
                    resizeTaskDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: () => {
                    setProjectDescriptionEditing(false);
                  },
                })
              )
            );
          }

          const projectComposerForm = React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "playground-tasks-project-modal playground-tasks-project-composer-modal"
                    + (isInitialProjectSetupModal ? " playground-tasks-project-initial-setup-modal" : "")
                    + (isInitialProjectSetupModal && projectInitialSetupModalVisible ? " is-visible" : "")
                    + (isInitialProjectSetupModal && projectInitialSetupModalClosing ? " is-closing" : ""),
                  onClick: (event) => event.stopPropagation(),
                  onKeyDown: handleComposerSubmitShortcut,
                  onSubmit: (event) => void (projectComposerMode === "edit" ? handleSaveProject(event) : handleCreateProject(event)),
                },
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-project-modal-icon-trigger" + (projectIconPickerOpen ? " is-active" : ""),
                      onClick: (event) => {
                        event.preventDefault();
                        setProjectIconPickerOpen((current) => !current);
                      },
                      title: "Choose project icon",
                    },
                      React.createElement(SelectedProjectIcon, { width: 20, height: 20, strokeWidth: 1.9 })
                    ),
                    React.createElement("input", {
                      className: "playground-tasks-project-modal-name-input",
                      value: projectDraft.name,
                      onChange: (event) => updateProjectDraftName(event.target.value),
                      placeholder: "Project name",
                      autoFocus: !embedded,
                    }),
                    projectIconPickerOpen
                      ? React.createElement("div", { className: "playground-tasks-project-icon-picker" },
                          PLAYGROUND_PROJECT_ICON_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isActive = projectDraft.icon === option.id;
                            return React.createElement("button", {
                              key: option.id,
                              type: "button",
                              className: "playground-tasks-project-icon-option" + (isActive ? " is-active" : ""),
                              title: option.label,
                              onClick: (event) => {
                                event.preventDefault();
                                setProjectDraft((current) => ({ ...current, icon: option.id }));
                                setProjectIconPickerOpen(false);
                              },
                            },
                              React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.9 })
                            );
                          })
                        )
                      : null
                  ),
                  renderProjectComposerEnvironmentPicker(),
                  embedded
                    ? null
                    : React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: () => closeProjectComposer(),
                        title: "Close",
	                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                ),
	                embedded ? renderProjectWallpaperPicker() : null,
	                isInitialProjectSetupModal
	                  ? React.createElement("div", { className: "playground-tasks-project-initial-setup-body" },
	                      renderProjectLeadSelector({ label: "Project lead" }),
	                      renderProjectBlueprintSelector(),
	                      renderProjectInitialGoalField()
	                    )
	                  : null,
	                isInitialProjectSetupModal ? null : renderProjectBlueprintSelector(),
	                isInitialProjectSetupModal ? null : renderProjectLeadSelector(),
	                isInitialProjectSetupModal ? null : React.createElement("div", { className: "playground-tasks-attachments playground-tasks-project-modal-attachments" },
	                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
	                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
	                      React.createElement("div", { className: "playground-tasks-attachments-actions" },
	                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                          onClick: openProjectEnvironmentFilePicker,
                          disabled: projectAttachmentTransferState.isProcessing || !activeProjectAttachmentEnvironmentId,
                          title: activeProjectAttachmentEnvironmentId
                            ? "Add files from " + (activeProjectAttachmentEnvironment?.name || "the selected environment")
                            : "Select an environment first",
	                        }, "Upload from Computer")
                      )
                    ),
                    React.createElement("input", {
                      ref: projectAttachmentInputRef,
                      type: "file",
                      multiple: true,
                      hidden: true,
                      onChange: (event) => void handleProjectAttachmentInputChange(event),
                    }),
                    React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                      React.createElement("div", {
                        className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isProjectAttachmentDragging ? " dragging" : "") + (hasProjectAttachments ? " is-filled" : ""),
                        onDragOver: (event) => {
                          event.preventDefault();
                          if (!activeProjectAttachmentEnvironmentId) {
                            return;
                          }
                          setIsProjectAttachmentDragging(true);
                        },
                        onDragLeave: (event) => {
                          if (event.currentTarget.contains(event.relatedTarget)) {
                            return;
                          }
                          setIsProjectAttachmentDragging(false);
                        },
                        onDrop: (event) => void handleProjectAttachmentDrop(event),
                      },
                        hasProjectAttachments
                          ? React.createElement(React.Fragment, null,
                              React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                React.createElement("span", null, isProjectAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-tasks-attachments-browse",
                                  onClick: openProjectAttachmentPicker,
                                }, "browse.")
                              ),
                              React.createElement("div", { className: "runner-attachments" },
                                projectAttachments.map((attachment) =>
                                  renderTaskAttachmentChip(attachment, {
                                    removable: true,
                                    activeAttachmentId: projectPreviewedAttachmentId,
                                    onPreview: handleProjectAttachmentPreviewToggle,
                                    onRemove: handleRemoveProjectAttachment,
                                  })
                                )
                              )
                            )
                          : React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-attachments-empty-button",
                              onClick: openProjectAttachmentPicker,
                            },
                              React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                              React.createElement("span", { className: "tb-popup-dropzone-title" }, isProjectAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                              React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                            )
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-connectors playground-tasks-project-modal-connectors" },
                      React.createElement("div", { className: "playground-plugins-section-header playground-tasks-project-modal-plugins-header" },
                        React.createElement("div", { className: "playground-plugins-section-copy" },
                          React.createElement("h3", { className: "playground-plugins-section-title" }, "Project Plugins"),
                          React.createElement("div", { className: "playground-tasks-secondary-copy" },
                            "Connect project-scoped plugin access so agents can read and write the right repositories, drives, and workspaces while they work."
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-connectors-list" },
                        projectConnectorEntries.map((connector) =>
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
                                onClick: () => openProjectComposerConnectorBrowser(connector.source),
                              }, connector.valueLabel)
                            )
                          )
                        )
                      )
                    ),
                    previewedProjectAttachment
                      ? React.createElement("div", { className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-tasks-detail-preview-host playground-tasks-project-modal-preview" },
                          React.createElement(RunnerDocumentPreviewDrawer, {
                            attachment: previewedProjectAttachment,
                            backendUrl,
                            requestHeaders,
                            inline: true,
                            onClose: () => setProjectPreviewedAttachmentId(""),
                            showResizeHandle: false,
                          })
                        )
                      : null,
                    projectAttachmentTransferState.isProcessing
                      ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Uploading attachments...")
                      : null,
	                    projectAttachmentTransferState.error
	                      ? React.createElement("div", { className: "playground-environments-error" }, projectAttachmentTransferState.error)
	                      : null
	                  ),
	                isInitialProjectSetupModal ? null : React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
	                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
	                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Goal"),
	                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                      [
                        { id: "bold", label: "Bold", icon: Bold },
                        { id: "italic", label: "Italic", icon: Italic },
                        { id: "underline", label: "Underline", icon: Underline },
                        { id: "list", label: "List", icon: List },
                      ].map((action) =>
                        React.createElement("button", {
                          key: action.id,
                          type: "button",
                          className: "playground-tasks-detail-format-button",
                          title: action.label,
                          "aria-label": action.label,
                          onMouseDown: (event) => event.preventDefault(),
                          onClick: () => handleProjectDescriptionFormat(action.id),
                        }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isProjectDescriptionEditing ? " is-editing" : " is-preview") },
                    !isProjectDescriptionEditing
                      ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                          String(projectDraft.description || "").trim()
                            ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                content: projectDraft.description,
                                className: "playground-tasks-detail-description-preview tb-message-markdown",
                              })
                            : React.createElement("div", {
                                className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                              }, "Define the project goal, scope, working style, and constraints.")
                        )
                      : null,
                    React.createElement("textarea", {
                      ref: projectDescriptionTextareaRef,
                      className: "playground-tasks-detail-description-input " + (isProjectDescriptionEditing ? "is-editing" : "is-preview"),
                      rows: 1,
                      placeholder: isProjectDescriptionEditing ? "Define the project goal, scope, working style, and constraints." : "",
                      value: projectDraft.description,
                      onFocus: () => setProjectDescriptionEditing(true),
                      onChange: (event) => {
                        setProjectDraft((current) => ({ ...current, description: event.target.value }));
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      },
                      onBlur: () => {
                        setProjectDescriptionEditing(false);
                      },
                    })
                  )
                ),
                projectSaveState.error
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, projectSaveState.error)
                  : null,
                embedded
                  ? React.createElement("div", { className: "playground-tasks-project-modal-actions playground-mission-control-setup-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-mission-control-studio-save-button",
                        onClick: () => void handleSaveProjectFromStudio(),
                        disabled: projectSaveState.isSaving || !String(projectDraft.name || "").trim(),
                      }, projectSaveState.isSaving ? "Saving..." : "Save Project")
                    )
                  : React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => closeProjectComposer(),
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "submit",
                        className: "playground-environments-action-button is-primary",
                        disabled: projectSaveState.isSaving || !String(projectDraft.name || "").trim(),
                      }, projectSaveState.isSaving
                        ? "Saving..."
                        : "Save Project")
                    )
              )
          ;

	          if (embedded) {
	            return React.createElement(React.Fragment, null,
	              React.createElement("div", { className: "playground-mission-control-setup-form" },
	                projectComposerForm
	              )
	            );
	          }

	          if (isInitialProjectSetupModal) {
	            return React.createElement(PlatformModal, {
	                open: projectComposerOpen && !projectInitialSetupModalClosing,
	                visible: projectInitialSetupModalVisible,
	                closing: projectInitialSetupModalClosing,
	                title: "New Project",
	                as: "form",
	                size: "medium",
	                showHeader: false,
	                showFooter: false,
	                className: "playground-tasks-project-modal playground-tasks-project-composer-modal playground-tasks-project-initial-setup-modal",
	                backdropClassName: "playground-tasks-project-modal-backdrop playground-tasks-project-initial-setup-backdrop",
	                bodyClassName: "playground-tasks-project-initial-setup-modal-body-slot",
	                bodyProps: {
	                  style: {
	                    padding: 0,
	                    overflow: "visible",
	                  },
	                },
	                animationDurationMs: projectInitialSetupModalAnimationMs,
	                onClose: () => closeProjectComposer(),
	                surfaceProps: {
	                  onKeyDown: handleComposerSubmitShortcut,
	                  onSubmit: (event) => void handleCreateProject(event),
	                },
	              },
	              projectComposerForm.props.children
	            );
	          }

	          return React.createElement(PlatformModalBackdrop, {
	              className: "playground-tasks-project-modal-backdrop",
	              onClick: () => closeProjectComposer(),
	            },
	            projectComposerForm
`;
