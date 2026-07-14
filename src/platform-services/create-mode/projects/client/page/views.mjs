import { CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS } from "../../../calendar/client/projects-integration/page-views/index.mjs";
import { PROJECT_OVERVIEW_SCRIPT } from "../overview/index.mjs";
export const PROJECTS_PAGE_VIEWS_SCRIPT = `        function renderTaskCard(task, extraMeta) {
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

	          const modalElement = React.createElement(React.Fragment, null,
		            React.createElement(PlatformModalBackdrop, {
		                className: "playground-tasks-project-modal-backdrop"
                      + (isInitialProjectSetupModal ? " playground-tasks-project-initial-setup-backdrop" : "")
                      + (isInitialProjectSetupModal && projectInitialSetupModalVisible ? " is-visible" : "")
                      + (isInitialProjectSetupModal && projectInitialSetupModalClosing ? " is-closing" : ""),
		                onClick: () => closeProjectComposer(),
		              },
	              projectComposerForm
	            )
	          );
          return isInitialProjectSetupModal && typeof document !== "undefined" && document.body
            ? createPortal(modalElement, document.body)
            : modalElement;
        }

        function renderReleaseComposerDialog() {
          if (!releaseComposerOpen) {
            return null;
          }

          const isEditingRelease = releaseComposerMode === "edit" && Boolean(releaseDraft?.id);
          const isReleaseActionPending = releaseSaveState.isSaving || releaseDeletePending;

          const modalElement = React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-project-modal-backdrop playground-mission-control-modal-backdrop playground-tasks-release-modal-backdrop"
                + (releaseComposerVisible ? " is-visible" : "")
                + (releaseComposerClosing ? " is-closing" : ""),
              onClick: () => closeReleaseComposer(),
            },
              React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "playground-tasks-project-modal playground-mission-control-modal playground-tasks-release-modal"
                    + (releaseComposerVisible ? " is-visible" : "")
                    + (releaseComposerClosing ? " is-closing" : ""),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": isEditingRelease ? "Edit milestone" : "New milestone",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => void handleSaveRelease(event),
                },
                React.createElement("div", { className: "playground-tasks-project-modal-top playground-tasks-release-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row playground-tasks-release-modal-name-row" },
                    React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                      React.createElement(ListTodo, { width: 18, height: 18, strokeWidth: 1.9 })
                    ),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-tasks-project-modal-name-input playground-tasks-release-modal-title-input",
                      value: releaseDraft.name,
                      placeholder: isEditingRelease ? "Milestone name" : "New Milestone",
                      autoFocus: true,
                      onChange: (event) => setReleaseDraft((current) => ({ ...current, name: event.target.value })),
                    })
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
                    onClick: () => closeReleaseComposer(),
                    title: "Close",
                    disabled: isReleaseActionPending,
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                ),
                React.createElement("div", { className: "playground-mission-control-modal-body playground-tasks-release-modal-body" },
                  React.createElement("div", { className: "playground-mission-control-modal-context playground-tasks-release-modal-context" },
                    React.createElement("div", { className: "playground-tasks-release-modal-date-row" },
                      React.createElement("label", { className: "playground-tasks-release-modal-field" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Start date"),
                        React.createElement("input", {
                          type: "date",
                          className: "playground-tasks-release-modal-input",
                          value: toPlaygroundDateInputValue(releaseDraft.startAt),
                          onChange: (event) => setReleaseDraft((current) => ({
                            ...current,
                            startAt: fromPlaygroundDateInputValue(event.target.value),
                          })),
                        })
                      ),
                      React.createElement("label", { className: "playground-tasks-release-modal-field" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "End date"),
                        React.createElement("input", {
                          type: "date",
                          className: "playground-tasks-release-modal-input",
                          value: toPlaygroundDateInputValue(releaseDraft.endAt),
                          onChange: (event) => setReleaseDraft((current) => ({
                            ...current,
                            endAt: fromPlaygroundDateInputValue(event.target.value, { endOfDay: true }),
                          })),
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-release-modal-description" },
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
                              onClick: () => handleReleaseDescriptionFormat(action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isReleaseDescriptionEditing ? " is-editing" : " is-preview") },
                        !isReleaseDescriptionEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              String(releaseDraft.description || "").trim()
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: releaseDraft.description,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, "Optional details for this milestone.")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: releaseDescriptionTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isReleaseDescriptionEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isReleaseDescriptionEditing ? "Optional details for this milestone." : "",
                          value: releaseDraft.description,
                          onFocus: () => setIsReleaseDescriptionEditing(true),
                          onChange: (event) => {
                            setReleaseDraft((current) => ({ ...current, description: event.target.value }));
                            resizeTaskDescriptionTextarea(event.currentTarget);
                          },
                          onBlur: () => {
                            setIsReleaseDescriptionEditing(false);
                          },
                        })
                      )
                    ),
                    releaseSaveState.error
                      ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, releaseSaveState.error)
                      : null
                  ),
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    isEditingRelease
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          style: { marginRight: "auto" },
                          onClick: () => void handleDeleteRelease(releaseDraft.id),
                          disabled: isReleaseActionPending,
                        }, releaseDeletePending ? "Deleting..." : "Delete")
                      : null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => closeReleaseComposer(),
                      disabled: isReleaseActionPending,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: isReleaseActionPending || !String(releaseDraft.name || "").trim(),
                    }, releaseSaveState.isSaving
                      ? (isEditingRelease ? "Saving..." : "Creating...")
                      : (isEditingRelease ? "Save Milestone" : "Create Milestone"))
                  )
                )
              )
            );

          return typeof document !== "undefined" && document.body
            ? createPortal(modalElement, document.body)
            : modalElement;
        }

        function renderProjectWorkingAgentLogoCarousel() {
          function ProjectWorkingAgentLogoCarousel() {
            const [isPulsing, setIsPulsing] = useState(false);
            const containerRef = useRef(null);
            const trackRef = useRef(null);
            const rafRef = useRef(null);
            const lastTriggeredIndexRef = useRef(-1);
            const pulseTimeoutRef = useRef(null);
            const logoPaths = [
              "/img/logos/aios-presentation/logo1.webp",
              "/img/logos/aios-presentation/logo2.webp",
              "/img/logos/aios-presentation/logo3.webp",
              "/img/logos/aios-presentation/logo4.webp",
              "/img/logos/aios-presentation/logo5.webp",
              "/img/logos/aios-presentation/logo6.webp",
              "/img/logos/aios-presentation/logo7.webp",
              "/img/logos/aios-presentation/logo8.png",
              "/img/logos/aios-presentation/logo9.png",
              "/img/logos/aios-presentation/logo10.png",
              "/img/logos/aios-presentation/logo11.png",
              "/img/logos/aios-presentation/logo12.png",
            ];
            const repeatedLogos = logoPaths.concat(logoPaths, logoPaths, logoPaths);

            useEffect(() => {
              let cancelled = false;
              const checkIconPositions = () => {
                if (cancelled) {
                  return;
                }
                const containerElement = containerRef.current;
                const trackElement = trackRef.current;
                if (containerElement && trackElement) {
                  const containerRect = containerElement.getBoundingClientRect();
                  const containerCenterX = containerRect.left + containerRect.width / 2;
                  const icons = trackElement.children;
                  for (let index = 0; index < icons.length; index += 1) {
                    const iconRect = icons[index].getBoundingClientRect();
                    const iconCenterX = iconRect.left + iconRect.width / 2;
                    if (Math.abs(iconCenterX - containerCenterX) < 5 && lastTriggeredIndexRef.current !== index) {
                      lastTriggeredIndexRef.current = index;
                      setIsPulsing(true);
                      if (pulseTimeoutRef.current) {
                        window.clearTimeout(pulseTimeoutRef.current);
                      }
                      pulseTimeoutRef.current = window.setTimeout(() => {
                        setIsPulsing(false);
                        pulseTimeoutRef.current = null;
                      }, 200);
                      break;
                    }
                  }
                }
                rafRef.current = window.requestAnimationFrame(checkIconPositions);
              };

              rafRef.current = window.requestAnimationFrame(checkIconPositions);
              return () => {
                cancelled = true;
                if (rafRef.current) {
                  window.cancelAnimationFrame(rafRef.current);
                }
                if (pulseTimeoutRef.current) {
                  window.clearTimeout(pulseTimeoutRef.current);
                }
              };
            }, []);

            return React.createElement("div", {
                ref: containerRef,
                className: "playground-projects-working-agent-logos",
                "aria-hidden": "true",
              },
              React.createElement("div", {
                className: "playground-projects-logo-carousel-line" + (isPulsing ? " is-pulsing" : ""),
              }),
              React.createElement("div", {
                  className: "playground-projects-logo-carousel-center" + (isPulsing ? " is-pulsing" : ""),
                },
                React.createElement("img", {
                  src: "/img/logos/aios-presentation/logoCentral.png",
                  alt: "",
                  draggable: false,
                })
              ),
              React.createElement("div", { className: "playground-projects-logo-carousel-mask" },
                React.createElement("div", {
                    ref: trackRef,
                    className: "playground-projects-logo-carousel-track",
                  },
                  repeatedLogos.map((logoPath, index) =>
                    React.createElement("div", {
                      key: logoPath + "-" + index,
                      className: "playground-projects-logo-carousel-item",
                    },
                      React.createElement("img", {
                        src: logoPath,
                        alt: "",
                        draggable: false,
                      })
                    )
                  )
                )
              )
            );
          }

          return React.createElement(ProjectWorkingAgentLogoCarousel);
        }

        function renderProjectWorkingAgentEmptyState() {
          const planningRows = [
            {
              title: "Mission Control",
              subtitle: "Turn a short goal into strategy, milestones, tickets, and the next steps agents should follow.",
              Icon: Rocket,
            },
            {
              title: "Backlog and board",
              subtitle: "Track planned, active, blocked, in-review, and finished work with owners, priorities, and blockers.",
              Icon: LayoutGrid,
            },
            {
              title: "Milestones",
              subtitle: "Group tasks into concrete milestones so agents work toward outcomes instead of isolated tickets.",
              Icon: CalendarIcon,
            },
          ];
          const executionRows = [
            {
              title: "Task threads",
              subtitle: "Start agent runs from tickets with project files, comments, reviewers, and previous work attached.",
              Icon: MessageSquare,
            },
            {
              title: "Project resources",
              subtitle: "Let agents create and maintain web apps, functions, databases, auth, secrets, and deployments.",
              Icon: Server,
            },
            {
              title: "Full-auto workflows",
              subtitle: "Run tasks one after another, create follow-ups when gaps appear, and trigger Mission Control when scope changes.",
              Icon: Play,
            },
          ];
          const renderProjectFeatureRow = (row) => {
            const Icon = row.Icon;
            return React.createElement("div", {
                key: row.title,
                className: "playground-configure-resource-row playground-projects-feature-row",
              },
              React.createElement("span", { className: "playground-configure-resource-icon" },
                React.createElement(Icon, { strokeWidth: 1.75 })
              ),
              React.createElement("span", { className: "playground-configure-row-copy" },
                React.createElement("span", { className: "playground-configure-row-title" }, row.title),
                React.createElement("span", { className: "playground-configure-row-subtitle" }, row.subtitle)
              )
            );
          };

          return React.createElement("div", { className: "playground-projects-working-agent-section" },
            React.createElement("div", { className: "playground-projects-working-agent-card" },
              React.createElement("img", {
                className: "playground-projects-working-agent-image",
                src: "/img/002-hero/projectsheader.webp",
                alt: "",
                width: 1915,
                height: 1277,
                draggable: false,
              }),
              React.createElement("div", { className: "playground-projects-working-agent-overlay" },
                React.createElement("h2", { className: "playground-projects-working-agent-title" },
                  "Not a chat window.",
                  React.createElement("br"),
                  React.createElement("span", { className: "playground-projects-working-agent-title-emphasis" }, "A working agent.")
                ),
                React.createElement("p", { className: "playground-projects-working-agent-copy" },
                  "A project gives every agent the surrounding plan: strategy, tickets, milestones, files, comments, reviewers, resources, and run history. Agents can return to the same workspace and continue the work instead of restarting from a prompt."
                ),
                renderProjectWorkingAgentLogoCarousel()
              )
            ),
            React.createElement("div", { className: "playground-projects-working-agent-features" },
              React.createElement("div", { className: "playground-configure-sections" },
                React.createElement("section", { className: "playground-configure-section" },
                  React.createElement("div", { className: "playground-configure-resource-list" },
                    planningRows.map(renderProjectFeatureRow)
                  )
                ),
                React.createElement("section", { className: "playground-configure-section" },
                  React.createElement("div", { className: "playground-configure-action-list" },
                    executionRows.map(renderProjectFeatureRow)
                  )
                )
              )
            )
          );
        }

        function getProjectListSummary(project) {
          const projectObject = project && typeof project === "object" && !Array.isArray(project) ? project : {};
          const summaryObject = projectObject.summary && typeof projectObject.summary === "object" && !Array.isArray(projectObject.summary)
            ? projectObject.summary
            : {};
          return buildEmptyPlaygroundProjectSummary({
            ...projectObject,
            ...summaryObject,
          });
        }

        function getProjectListBlueprint(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          return getPlaygroundProjectBlueprint(
            project?.projectType
              || project?.type
              || metadata.projectType
              || metadata.blueprintId
              || "blank"
          );
        }

        function getProjectListLead(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const lead = project?.lead && typeof project.lead === "object" && !Array.isArray(project.lead)
            ? project.lead
            : {};
          const leadName = String(
            project?.leadName
              || lead.name
              || lead.displayName
              || metadata.leadName
              || currentUserName
              || "Unassigned"
          ).trim();
          const leadAvatarUrl = String(
            project?.leadAvatarUrl
              || lead.avatarUrl
              || lead.photoURL
              || metadata.leadAvatarUrl
              || currentUserAvatarUrl
              || ""
          ).trim();
          return {
            name: leadName || "Unassigned",
            avatarUrl: leadAvatarUrl,
          };
        }

        function renderProjectListLeadAvatar(lead) {
          if (canRenderAvatarImage(lead.avatarUrl)) {
            return React.createElement("img", {
              className: "playground-projects-list-avatar",
              src: lead.avatarUrl,
              alt: lead.name || "Project lead",
              draggable: false,
            });
          }

          return React.createElement("span", { className: "playground-projects-list-avatar" },
            getAccountInitials(lead.name || "Lead")
          );
        }

        function getProjectListTargetDateLabel(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const targetDate = String(project?.targetDate || project?.dueDate || metadata.targetDate || metadata.dueDate || "").trim();
          return targetDate ? (formatPlaygroundFileDate(targetDate) || targetDate) : "";
        }

        function getProjectListPriorityLevel(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const rawPriority = project?.priority || metadata.priority || metadata.priorityLevel || "medium";
          const normalizedPriority = String(rawPriority || "").trim().toLowerCase();
          if (normalizedPriority === "urgent" || normalizedPriority === "critical" || normalizedPriority === "high" || Number(rawPriority) >= 3) {
            return 3;
          }
          if (normalizedPriority === "medium" || Number(rawPriority) === 2) {
            return 2;
          }
          if (normalizedPriority === "low" || Number(rawPriority) === 1) {
            return 1;
          }
          return 2;
        }

        function renderProjectListPriority(level) {
          return React.createElement("span", { className: "playground-projects-list-priority", title: "Priority" },
            [1, 2, 3].map((bar) =>
              React.createElement("span", {
                key: bar,
                className: "playground-projects-list-priority-bar" + (bar <= level ? " is-active" : ""),
              })
            )
          );
        }


        function renderProjectsListEmptyState() {
          return React.createElement("div", { className: "playground-projects-list-empty" },
            React.createElement("div", { className: "playground-projects-list-empty-title" }, "No projects yet"),
            React.createElement("div", { className: "playground-projects-list-empty-copy" },
              "Create a project to give agents a shared goal, task backlog, resources, files, and operating context."
            ),
            React.createElement(PlatformPrimaryButton, {
              size: "medium",
              type: "button",
              className: "playground-environments-action-button is-primary",
              onClick: () => openProjectComposer(),
            }, "Add Project")
          );
        }

        function renderProjectsHomeHeader() {
          const scopeOptions = [
            { id: "all", label: "All projects" },
            { id: "created", label: "Created by me" },
            { id: "shared", label: "Shared with me" },
          ];
          return React.createElement("div", { className: "playground-files-library-header playground-projects-library-header" },
            React.createElement("div", { className: "playground-files-library-title-row playground-projects-library-title-row" },
              React.createElement("h1", { className: "playground-files-library-title playground-projects-library-title" }, "Projects"),
              React.createElement("div", { className: "playground-files-library-actions playground-projects-library-actions" },
                React.createElement("div", { className: "playground-files-library-search-anchor playground-projects-library-search-anchor" },
                  React.createElement("label", { className: "playground-files-library-search playground-projects-library-search" },
                    React.createElement(Search, { className: "playground-files-library-search-icon", strokeWidth: 1.8 }),
                    React.createElement("input", {
                      type: "search",
                      value: searchQuery,
                      onChange: (event) => setSearchQuery(event.target.value),
                      className: "playground-files-library-search-input",
                      placeholder: "Search projects",
                      "aria-label": "Search projects",
                    })
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button playground-projects-library-new-button",
                  onClick: () => openProjectComposer(),
                }, "New")
              )
            ),
            React.createElement("div", { className: "playground-files-library-nav-row playground-projects-library-nav-row" },
              React.createElement("div", { className: "playground-files-library-tabs content-mode-switch playground-projects-library-tabs" },
                scopeOptions.map((option) =>
                  React.createElement("button", {
                    key: option.id,
                    type: "button",
                    className: "playground-files-library-tab" + (projectsHomeScope === option.id ? " is-active" : ""),
                    onClick: () => setProjectsHomeScope(option.id),
                    "aria-pressed": projectsHomeScope === option.id ? "true" : "false",
                  }, option.label)
                )
              ),
              React.createElement("div", { className: "playground-files-library-controls playground-projects-library-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-library-icon-button" + (projectsHomeToolbarPopover === "sort" || projectsHomeSortMode !== "updated-desc" ? " is-active" : ""),
                    title: "Sort projects",
                    "aria-label": "Sort projects",
                    "aria-expanded": projectsHomeToolbarPopover === "sort" ? "true" : "false",
                    onClick: () => setProjectsHomeToolbarPopover((current) => current === "sort" ? "" : "sort"),
                  }, React.createElement(ArrowUpDown, { strokeWidth: 1.8 })),
                  projectsHomeToolbarPopover === "sort"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                        projectsHomeSortOptions.map((option) =>
                          React.createElement("button", {
                            key: option.id,
                            type: "button",
                            className: "tb-popup-row tb-popup-row-select" + (projectsHomeSortMode === option.id ? " selected" : ""),
                            onClick: () => {
                              setProjectsHomeSortMode(option.id);
                              setProjectsHomeToolbarPopover("");
                            },
                          },
                            React.createElement("span", { className: "tb-popup-check-slot" },
                              projectsHomeSortMode === option.id
                                ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                : null
                            ),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, option.label),
                              option.description ? React.createElement("span", null, option.description) : null
                            )
                          )
                        )
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-library-icon-button" + (projectsHomeToolbarPopover === "filter" || projectsHomeFilterMode !== "all" ? " is-active" : ""),
                    title: "Filter projects",
                    "aria-label": "Filter projects",
                    "aria-expanded": projectsHomeToolbarPopover === "filter" ? "true" : "false",
                    onClick: () => setProjectsHomeToolbarPopover((current) => current === "filter" ? "" : "filter"),
                  }, React.createElement(SlidersHorizontal, { strokeWidth: 1.8 })),
                  projectsHomeToolbarPopover === "filter"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                        projectsHomeFilterOptions.map((option) =>
                          React.createElement("button", {
                            key: option.id,
                            type: "button",
                            className: "tb-popup-row tb-popup-row-select" + (projectsHomeFilterMode === option.id ? " selected" : ""),
                            onClick: () => {
                              setProjectsHomeFilterMode(option.id);
                              setProjectsHomeToolbarPopover("");
                            },
                          },
                            React.createElement("span", { className: "tb-popup-check-slot" },
                              projectsHomeFilterMode === option.id
                                ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                : null
                            ),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, option.label),
                              option.description ? React.createElement("span", null, option.description) : null
                            )
                          )
                        )
                      )
                    : null
                )
              )
            )
          );
        }


        function renderNoMatchingProjectsState() {
          return React.createElement("div", { className: "playground-tasks-empty" },
            React.createElement("div", { className: "playground-tasks-empty-title" }, "No projects found"),
            React.createElement("div", { className: "playground-tasks-empty-copy" }, "Adjust the search or filters to find the project you are looking for.")
          );
        }

        function renderProjectLanding() {
          if (projectLoadState.status === "loading" && projects.length === 0) {
            return React.createElement("div", { className: "playground-tasks-loading-state" },
              React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
              React.createElement("div", { className: "playground-tasks-loading-copy" }, "Loading projects…")
            );
          }

          if (projectLoadState.status === "error" && projects.length === 0) {
            return React.createElement("div", { className: "playground-tasks-empty" },
              React.createElement("div", { className: "playground-tasks-empty-title" }, "Projects unavailable"),
              React.createElement("div", { className: "playground-tasks-empty-copy" }, projectLoadState.error || "The projects API could not be reached."),
              React.createElement(PlatformPrimaryButton, {
                size: "medium",
                type: "button",
                className: "playground-environments-action-button is-primary",
                onClick: () => void loadProjects(),
              }, "Retry")
            );
          }

          const hasProjects = projects.length > 0;

          return React.createElement("div", { className: "playground-tasks-view-section playground-projects-overview-surface" + (hasProjects ? " is-card-grid" : " is-empty-hero") },
            React.createElement("div", { className: "playground-projects-overview-inner" },
              hasProjects
                ? React.createElement(React.Fragment, null,
                    renderProjectsHomeHeader(),
                    filteredProjects.length > 0
                      ? React.createElement("div", { className: "playground-tasks-project-grid" },
                          filteredProjects.map((project, index) => renderProjectCard(project, index))
                        )
                      : renderNoMatchingProjectsState()
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-projects-overview-title-block" },
                      React.createElement("div", { className: "playground-projects-overview-title-copy" },
                        React.createElement("h1", { className: "playground-project-overview-summary-title" }, "Organize your work in projects")
                      ),
                      React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-projects-overview-add-button",
                        onClick: () => openProjectComposer(),
                      },
                        React.createElement(Plus, { strokeWidth: 1.8, "aria-hidden": "true" }),
                        React.createElement("span", null, "Add Project")
                      )
                    ),
                    renderProjectWorkingAgentEmptyState()
                  )
            )
          );
        }

        function renderProjectContext() {
          if (!selectedProject) {
            return null;
          }

          return React.createElement("div", { className: "playground-tasks-project-context" },
            React.createElement("div", { className: "playground-tasks-project-meta-row" },
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.environmentsCount + " env"),
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.threadsCount + " threads"),
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.openTasksCount + " open tasks"),
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.activeSprintCount + " active sprint" + (selectedProjectSummary.activeSprintCount === 1 ? "" : "s"))
            ),
            React.createElement("div", { className: "playground-tasks-project-panel-grid" },
              React.createElement("div", { className: "playground-tasks-project-panel" },
                React.createElement("div", { className: "playground-tasks-project-panel-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Environments"),
                    React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Attach one or more environments when this project needs a runtime for threads.")
                  )
                ),
                selectedProjectEnvironments.length > 0
                  ? React.createElement("div", { className: "playground-tasks-project-list" },
                      selectedProjectEnvironments.map((environment) =>
                        React.createElement("div", { key: environment.id, className: "playground-tasks-project-row" },
                          React.createElement("div", { className: "playground-tasks-project-row-main" },
                            React.createElement("div", { className: "playground-tasks-project-row-title" }, environment.name || "Untitled Environment"),
                            React.createElement("div", { className: "playground-tasks-project-row-copy" }, "Project runtime computer")
                          ),
                          environment.id === selectedProject.defaultEnvironmentId
                            ? React.createElement("span", { className: "playground-tasks-chip" }, "Default")
                            : null
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "This project has not attached environments yet.")
              ),
              React.createElement("div", { className: "playground-tasks-project-panel" },
                React.createElement("div", { className: "playground-tasks-project-panel-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Recent Threads"),
                    React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Threads created from this project stay grouped with its planning context.")
                  )
                ),
                selectedProjectRecentThreads.length > 0
                  ? React.createElement("div", { className: "playground-tasks-project-list" },
                      selectedProjectRecentThreads.map((thread) =>
                        React.createElement("div", { key: thread.id, className: "playground-tasks-project-row" },
                          React.createElement("div", { className: "playground-tasks-project-row-main" },
                            React.createElement("div", { className: "playground-tasks-project-row-title" }, thread.title || "Untitled thread"),
                            React.createElement("div", { className: "playground-tasks-project-row-copy" }, formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "Recently updated")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            onClick: () => onThreadStarted && onThreadStarted(thread.id),
                          }, "Open")
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No project threads yet. Start one from a task or create a new thread while this project is active.")
              )
            )
          );
        }

        function renderProjectTaskHeaderSearchControl({ placeholder = "Search tasks", ariaLabel = "Search project tasks" } = {}) {
          return React.createElement("div", { className: "playground-plugins-search-shell playground-tasks-backlog-search-shell" },
            React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
            React.createElement("input", {
              type: "search",
              value: searchQuery,
              onChange: (event) => setSearchQuery(event.target.value),
              className: "playground-plugins-search",
              placeholder,
              "aria-label": ariaLabel,
            })
          );
        }

        function renderProjectReleasePickerControl({
          popover,
          setPopover,
          allLabel = "All Milestones",
          allDescription = "Show every milestone.",
        }) {
          return React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-release-filter-shell" },
            React.createElement("button", {
              type: "button",
              className: "playground-files-control-button" + (popover === "release" || selectedRelease ? " is-active" : ""),
              onClick: () => setPopover((current) => current === "release" ? "" : "release"),
            },
              React.createElement(History, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Milestones")
            ),
            popover === "release"
              ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-tasks-release-picker-menu" },
                  React.createElement("div", { className: "notification-menu-header" },
                    React.createElement("h2", { className: "notification-menu-title" }, "Milestones")
                  ),
                  React.createElement("div", { className: "notification-menu-body playground-tasks-release-picker-body" },
                    React.createElement("button", {
                      type: "button",
                      className: "notification-menu-item playground-tasks-release-picker-item" + (!selectedReleaseId ? " is-selected" : ""),
                      onClick: () => {
                        handleSelectRelease("");
                        setPopover("");
                      },
                    },
                      !selectedReleaseId
                        ? React.createElement(Check, { className: "notification-menu-icon", strokeWidth: 1.8 })
                        : React.createElement(History, { className: "notification-menu-icon", strokeWidth: 1.8 }),
                      React.createElement("div", { className: "notification-menu-copy" },
                        React.createElement("div", { className: "notification-menu-label" }, allLabel),
                        React.createElement("div", { className: "notification-menu-text" }, allDescription)
                      )
                    ),
                    sortedReleaseOptions.map((release) => {
                      const isSelected = selectedReleaseId === release.id;
                      return React.createElement("button", {
                        key: release.id,
                        type: "button",
                        className: "notification-menu-item playground-tasks-release-picker-item" + (isSelected ? " is-selected" : ""),
                        onClick: () => {
                          handleSelectRelease(release.id);
                          setPopover("");
                        },
                      },
                        isSelected
                          ? React.createElement(Check, { className: "notification-menu-icon", strokeWidth: 1.8 })
                          : React.createElement(History, { className: "notification-menu-icon", strokeWidth: 1.8 }),
                        React.createElement("div", { className: "notification-menu-copy" },
                          React.createElement("div", { className: "notification-menu-label" }, release.name || "Untitled Milestone"),
                          React.createElement("div", { className: "notification-menu-text" }, release.description || formatPlaygroundTaskReleaseDateRange(release))
                        )
                      );
                    })
                  ),
                  React.createElement("div", { className: "notification-menu-footer playground-tasks-release-picker-footer" },
                    React.createElement("button", {
                      type: "button",
                      className: "notification-menu-mark-read playground-tasks-release-picker-create",
                      onClick: () => {
                        setPopover("");
                        openReleaseComposer();
                      },
                    },
                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Add Milestone")
                    )
                  )
                )
              : null
          );
        }

        function renderProjectWorkspaceActionButtons({ releaseControl = null, showStrategy = true } = {}) {
          return React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-tasks-backlog-project-actions" },
            showStrategy
              ? React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button",
                  onClick: openMissionControlStrategySidebar,
                },
                  React.createElement(FileText, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "playground-project-overview-summary-mission-label" }, "Strategy")
                )
              : null,
            releaseControl
          );
        }

        function renderBacklogTaskListView({
          headerTitle,
          openTaskCount,
          headerAction = null,
          secondaryActions = null,
          primaryActions,
          toolbarRef,
          toolbarPopover,
          setToolbarPopover,
          filterMode,
          setFilterMode,
          activeFilterOption,
          sortMode,
          setSortMode,
          activeSortOption,
          taskRoots,
          visibleTaskIds,
          childrenByParentId,
          emptyTitle,
          emptyCopy,
          emptyAction = null,
          showComposer = false,
          composer = null,
          listFooter = null,
          allowManualDrag = true,
          groupRootTasksByRelease = false,
        }) {
          const isBacklogManualSort = allowManualDrag && sortMode === "default";
          const draggingBacklogTask = backlogDraggingTaskId ? tasksById[backlogDraggingTaskId] || null : null;

          function renderBacklogTaskTree(taskItems, parentTaskId = null, depth = 0) {
            if (!Array.isArray(taskItems) || taskItems.length === 0) {
              return null;
            }

            if (!parentTaskId && depth === 0 && groupRootTasksByRelease) {
              const releaseSections = [];
              const sectionIndexByKey = new Map();
              taskItems.forEach((task) => {
                const normalizedReleaseId = typeof task?.releaseId === "string" ? task.releaseId.trim() : "";
                const sectionKey = normalizedReleaseId || "__no_release__";
                const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
                const sectionTitle = normalizedReleaseId
                  ? (releaseRecord?.name || "Milestone unavailable")
                  : "All other";
                const sectionCopy = normalizedReleaseId
                  ? (releaseRecord?.description || "")
                  : "All tasks that are not assigned to any milestone";
                let sectionIndex = sectionIndexByKey.get(sectionKey);
                if (sectionIndex === undefined) {
                  sectionIndex = releaseSections.length;
                  sectionIndexByKey.set(sectionKey, sectionIndex);
                  releaseSections.push({
                    key: sectionKey,
                    releaseId: normalizedReleaseId,
                    title: sectionTitle,
                    copy: sectionCopy,
                    tasks: [],
                  });
                }
                releaseSections[sectionIndex].tasks.push(task);
              });

              const orderedReleaseSections = releaseSections
                .slice()
                .sort((left, right) => {
                  const leftIsAllOther = left.key === "__no_release__";
                  const rightIsAllOther = right.key === "__no_release__";
                  if (leftIsAllOther !== rightIsAllOther) {
                    return leftIsAllOther ? 1 : -1;
                  }
                  if (leftIsAllOther && rightIsAllOther) {
                    return 0;
                  }
                  const leftRelease = releasesById[left.key] || { id: left.key, name: left.title };
                  const rightRelease = releasesById[right.key] || { id: right.key, name: right.title };
                  return compareTaskReleaseOrder(leftRelease, rightRelease);
                });

              return React.createElement(React.Fragment, null,
                orderedReleaseSections.map((section) => {
                  const sectionReleaseId = section.key === "__no_release__" ? "" : section.key;
                  const isSectionDropTarget = backlogReleaseDropTargetId === section.key
                    && canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId);
                  return (
                  React.createElement("div", {
                      key: section.key,
                      className: "playground-tasks-backlog-section" + (isSectionDropTarget ? " is-release-drop-target" : ""),
                      onDragOver: (event) => {
                        if (!canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId)) {
                          return;
                        }
                        if (event.target instanceof Element && event.target.closest(".playground-tasks-backlog-item")) {
                          return;
                        }
                        event.preventDefault();
                        if (event.dataTransfer) {
                          event.dataTransfer.dropEffect = "move";
                        }
                        if (backlogReleaseDropTargetId !== section.key) {
                          setBacklogReleaseDropTargetId(section.key);
                        }
                      },
                      onDragEnter: (event) => {
                        if (!canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId)) {
                          return;
                        }
                        if (event.target instanceof Element && event.target.closest(".playground-tasks-backlog-item")) {
                          return;
                        }
                        event.preventDefault();
                        if (backlogReleaseDropTargetId !== section.key) {
                          setBacklogReleaseDropTargetId(section.key);
                        }
                      },
                      onDragLeave: (event) => {
                        const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                        if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                          return;
                        }
                        if (backlogReleaseDropTargetId === section.key) {
                          setBacklogReleaseDropTargetId("");
                        }
                      },
                      onDrop: (event) => {
                        if (!canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId)) {
                          return;
                        }
                        if (event.target instanceof Element && event.target.closest(".playground-tasks-backlog-item")) {
                          return;
                        }
                        event.preventDefault();
                        void handleBacklogReleaseSectionDrop(sectionReleaseId);
                      },
                    },
                    React.createElement("div", { className: "playground-tasks-backlog-section-header" },
                      React.createElement("div", { className: "playground-tasks-backlog-section-copy-group" },
                        React.createElement("div", { className: "playground-tasks-backlog-section-title" }, section.title)
                      ),
                      renderReleaseHeaderMeta(section.releaseId ? (releasesById[section.releaseId] || null) : null)
                    ),
                    section.tasks.map((task, siblingIndex) =>
                      React.createElement(React.Fragment, { key: task.id },
                        renderBacklogTaskRow(task, depth, null, section.tasks, siblingIndex, sectionReleaseId)
                      )
                    )
                  )
                );
                })
              );
            }

            return React.createElement(React.Fragment, null,
              taskItems.map((task, siblingIndex) =>
                React.createElement(React.Fragment, { key: task.id },
                  renderBacklogTaskRow(task, depth, parentTaskId, taskItems, siblingIndex)
                )
              )
            );
          }

          function renderBacklogTaskRow(task, depth = 0, parentTaskId = null, visibleSiblingTasks = [], siblingIndex = 0, releaseSectionId = undefined) {
            const isHumanTask = isHumanAssignedTask(task);
            const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "001";
            const visibleChildTasks = (childrenByParentId[task.id] || []).filter((childTask) => visibleTaskIds.has(childTask.id));
            const isSubtask = isPlaygroundSubtaskRecord(task);
            const isTitleEditable = selectedTaskId === task.id || backlogEditingTaskId === task.id;
            const TaskTypeIcon = isSubtask ? Check : Bookmark;
            const isRowManualSort = isBacklogManualSort;
            const isReleaseSectionDraggable = canDragTaskAcrossReleaseSections(task) && depth === 0;
            const isDraggable = (isRowManualSort || isReleaseSectionDraggable)
              && !saveState.isSaving
              && (!backlogDraggingTaskId || backlogDraggingTaskId === task.id);
            const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
            const canDropOnThisLevel = isRowManualSort && (
              !normalizedParentTaskId
              || (draggingBacklogTask?.id && isPlaygroundSubtaskRecord(draggingBacklogTask) && canBacklogTaskMoveToParentTask(draggingBacklogTask, normalizedParentTaskId))
            );
            const beforeDropTargetKey = getBacklogManualOrderDropTargetKey(normalizedParentTaskId, siblingIndex);
            const afterDropTargetKey = getBacklogManualOrderDropTargetKey(normalizedParentTaskId, siblingIndex + 1);
            const isDropBefore = isRowManualSort
              && backlogDropTargetKey === beforeDropTargetKey
              && siblingIndex === 0
              && backlogDraggingTaskId !== task.id;
            const isDropAfter = isRowManualSort
              && backlogDropTargetKey === afterDropTargetKey
              && backlogDraggingTaskId !== task.id;

            function resolveRowDropTarget(event) {
              if (!isRowManualSort || !draggingBacklogTask?.id || !canDropOnThisLevel) {
                return null;
              }
              const currentTarget = event.currentTarget;
              if (!(currentTarget instanceof Element)) {
                return null;
              }
              const rect = currentTarget.getBoundingClientRect();
              const relativeY = event.clientY - rect.top;
              const shouldInsertBefore = relativeY < rect.height / 2;
              return {
                insertIndex: shouldInsertBefore ? siblingIndex : siblingIndex + 1,
                dropTargetKey: shouldInsertBefore ? beforeDropTargetKey : afterDropTargetKey,
              };
            }

            return React.createElement("div", {
                key: task.id,
                className: "playground-tasks-backlog-tree-node" + (depth > 0 ? " is-subtask-node" : ""),
              },
              React.createElement("div", {
                  role: "button",
                  tabIndex: 0,
                className: "playground-tasks-backlog-item"
                    + (selectedTaskId === task.id ? " is-active" : "")
                    + (depth > 0 ? " is-subtask" : "")
                    + (isDraggable ? " is-draggable" : "")
                    + (isTaskPreviewStatusMenuOpen(task.id) ? " is-status-menu-open" : "")
                    + (backlogDraggingTaskId === task.id ? " is-dragging" : "")
                    + (isDropBefore ? " is-drop-before" : "")
                    + (isDropAfter ? " is-drop-after" : ""),
                  style: getPlaygroundTaskColorStyle(task.taskColor),
                  draggable: isDraggable,
                  onClick: () => openProjectTaskDetailScreen(task.id),
                  onContextMenu: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleSelectTask(task.id);
                    openBacklogTaskContextMenu(task, event);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProjectTaskDetailScreen(task.id);
                    }
                  },
                  onDragStart: (event) => handleBacklogTaskDragStart(task, event),
                  onDragEnd: handleBacklogTaskDragEnd,
                  onDragOver: (event) => {
                    const dropTarget = resolveRowDropTarget(event);
                    if (!dropTarget) {
                      return;
                    }
                    event.preventDefault();
                    if (event.dataTransfer) {
                      event.dataTransfer.dropEffect = "move";
                    }
                    if (backlogReleaseDropTargetId) {
                      setBacklogReleaseDropTargetId("");
                    }
                    if (backlogDropTargetKey !== dropTarget.dropTargetKey) {
                      setBacklogDropTargetKey(dropTarget.dropTargetKey);
                    }
                  },
                  onDragEnter: (event) => {
                    const dropTarget = resolveRowDropTarget(event);
                    if (!dropTarget) {
                      return;
                    }
                    event.preventDefault();
                    if (backlogReleaseDropTargetId) {
                      setBacklogReleaseDropTargetId("");
                    }
                    if (backlogDropTargetKey !== dropTarget.dropTargetKey) {
                      setBacklogDropTargetKey(dropTarget.dropTargetKey);
                    }
                  },
                  onDragLeave: (event) => {
                    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                      return;
                    }
                    if (isDropBefore || isDropAfter) {
                      setBacklogDropTargetKey("");
                    }
                  },
                  onDrop: (event) => {
                    const dropTarget = resolveRowDropTarget(event);
                    if (!dropTarget) {
                      return;
                    }
                    event.preventDefault();
                    void handleBacklogTaskDrop(
                      normalizedParentTaskId,
                      visibleSiblingTasks.map((item) => item.id),
                      dropTarget.insertIndex,
                      releaseSectionId
                    );
                  },
                },
                  React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                    React.createElement("div", { className: "playground-tasks-backlog-leading" },
                      React.createElement("div", {
                        className: "playground-tasks-backlog-project-icon " + (isSubtask ? "is-subtask" : "is-task"),
                        "aria-hidden": "true",
                      },
                        React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 })
                      ),
                      React.createElement("div", { className: "playground-tasks-backlog-main" },
                        renderPlaygroundTaskPriorityIcon(task.priority, "playground-tasks-backlog-priority"),
                        React.createElement("span", { className: "playground-tasks-backlog-ticket" }, taskTicketNumber),
                        isTitleEditable
                          ? React.createElement("input", {
                              type: "text",
                              className: "playground-tasks-backlog-title playground-tasks-backlog-title-input",
                              value: backlogEditingTaskId === task.id ? backlogTitleInputValue : (task.title || ""),
                              placeholder: "Untitled Task",
                              "aria-label": "Task title",
                              onFocus: (event) => {
                                event.stopPropagation();
                                handleSelectTask(task.id);
                                beginBacklogTitleEdit(task);
                              },
                              onClick: (event) => event.stopPropagation(),
                              onMouseDown: (event) => event.stopPropagation(),
                              onChange: (event) => {
                                if (backlogEditingTaskId !== task.id) {
                                  beginBacklogTitleEdit(task);
                                }
                                setBacklogTitleInputValue(event.target.value);
                              },
                              onBlur: () => {
                                void commitBacklogTaskTitle(task);
                              },
                              onKeyDown: (event) => {
                                event.stopPropagation();
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  event.currentTarget.blur();
                                  return;
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  backlogTitleSkipCommitRef.current = task.id;
                                  cancelBacklogTitleEdit(task);
                                  event.currentTarget.blur();
                                }
                              },
                            })
                          : React.createElement("span", {
                              className: "playground-tasks-backlog-title" + (task.status === "done" ? " is-complete" : ""),
                            }, task.title || "Untitled Task")
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-backlog-meta" },
                      renderTaskPreviewStatusControl(task),
                      React.createElement("div", { className: "playground-tasks-backlog-assignee-shell" },
                        renderTaskAssigneeAvatar(task, "playground-tasks-backlog-assignee-avatar")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-backlog-run-button" + (isHumanTask && task.status !== "done" ? " is-human-unchecked" : ""),
                      "aria-label": isHumanTask ? (task.status === "done" ? "Reopen task" : "Complete task") : "Run task",
                      title: isHumanTask ? (task.status === "done" ? "Reopen task" : "Complete task") : "Run task",
                      onClick: (event) => {
                        if (isHumanTask) {
                          void handleToggleTaskDone(task, event);
                          return;
                        }
                        event.stopPropagation();
                        void handleStartTaskThread(task);
                      },
                      disabled: isHumanTask
                        ? saveState.isSaving
                        : saveState.isSaving || isTaskThreadLaunchLocked(task),
                    },
                      isHumanTask
                        ? (
                          task.status === "done"
                            ? React.createElement(Check, {
                                width: 13,
                                height: 13,
                                strokeWidth: 2,
                                "aria-hidden": "true",
                              })
                            : null
                        )
                        : React.createElement(Play, {
                            width: 13,
                            height: 13,
                            strokeWidth: 1.9,
                            fill: "currentColor",
                            "aria-hidden": "true",
                          })
                    )
                  )
              ),
              visibleChildTasks.length > 0
                ? React.createElement("div", { className: "playground-tasks-backlog-children" },
                    renderBacklogTaskTree(visibleChildTasks, task.id, depth + 1)
                  )
                : null
            );
          }

          function renderBacklogTaskContextMenu() {
            if (!backlogTaskContextMenu?.taskId) {
              return null;
            }
            const contextTask = tasksById[backlogTaskContextMenu.taskId] || null;
            if (!contextTask) {
              return null;
            }
            return React.createElement("div", {
                ref: backlogTaskContextMenuRef,
                className: "playground-tasks-toolbar-popup-shell playground-tasks-backlog-context-menu-shell",
                style: {
                  left: backlogTaskContextMenu.x + "px",
                  top: backlogTaskContextMenu.y + "px",
                },
              },
              React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-tasks-backlog-context-menu" },
                renderTaskActionsMenu(contextTask, {
                  closeMenu: () => setBacklogTaskContextMenu(null),
                })
              )
            );
          }

          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-tasks-backlog-view" },
              React.createElement("div", { className: "playground-tasks-backlog-header" },
                React.createElement("div", { className: "playground-tasks-backlog-header-row" },
                  React.createElement("div", { className: "playground-tasks-backlog-header-main" },
                    React.createElement("div", { className: "playground-tasks-backlog-heading" }, headerTitle)
                  ),
                  headerAction || null
                ),
                React.createElement("div", {
                  className: "playground-tasks-backlog-header-row is-tertiary",
                  ref: toolbarRef,
                },
                  React.createElement("div", { className: "playground-tasks-backlog-secondary-actions" },
                    renderProjectTaskHeaderSearchControl({
                      placeholder: "Search tasks",
                      ariaLabel: "Search backlog tasks",
                    }),
                    React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-backlog-sort-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button is-bare is-backlog-sort" + (toolbarPopover === "sort" || sortMode !== "default" ? " is-active" : ""),
                        onClick: () => setToolbarPopover((current) => current === "sort" ? "" : "sort"),
                      },
                        React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Sort")
                      ),
                      toolbarPopover === "sort"
                        ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                            backlogSortOptions.map((option) =>
                              React.createElement("button", {
                                  key: option.id,
                                  type: "button",
                                  className: "tb-popup-row tb-popup-row-select" + (sortMode === option.id ? " selected" : ""),
                                  onClick: () => {
                                    setSortMode(option.id);
                                    setToolbarPopover("");
                                  },
                                },
                                  React.createElement("span", { className: "tb-popup-check-slot" },
                                    sortMode === option.id
                                      ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                      : null
                                  ),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, option.label)
                                  )
                                )
                            )
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-backlog-filter-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button is-bare is-backlog-filter" + (toolbarPopover === "filter" || filterMode !== "open" && filterMode !== "all" ? " is-active" : ""),
                        onClick: () => setToolbarPopover((current) => current === "filter" ? "" : "filter"),
                      },
                        React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Filter")
                      ),
                      toolbarPopover === "filter"
                        ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                            backlogFilterOptions.map((option) =>
                              React.createElement("button", {
                                  key: option.id,
                                  type: "button",
                                  className: "tb-popup-row tb-popup-row-select" + (filterMode === option.id ? " selected" : ""),
                                  onClick: () => {
                                    setFilterMode(option.id);
                                    setToolbarPopover("");
                                  },
                                },
                                  React.createElement("span", { className: "tb-popup-check-slot" },
                                    filterMode === option.id
                                      ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                      : null
                                  ),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, option.label),
                                    React.createElement("span", null, option.description)
                                  )
                                )
                            )
                          )
                        : null
                    ),
                    secondaryActions
                  ),
                  React.createElement("div", { className: "playground-tasks-backlog-tertiary-actions" }, primaryActions)
                )
              ),
              React.createElement("div", { className: "playground-tasks-backlog-list" },
                taskRoots.length > 0
                  ? renderBacklogTaskTree(taskRoots, null, 0)
                  : React.createElement("div", { className: "playground-tasks-empty playground-tasks-backlog-empty" },
                      React.createElement("div", { className: "playground-tasks-empty-title" }, emptyTitle),
                      React.createElement("div", { className: "playground-tasks-empty-copy" }, emptyCopy),
                      emptyAction
                    ),
                listFooter
              ),
              showComposer ? composer : null
            ),
            renderBacklogTaskContextMenu()
          );
        }

        function renderBacklogView() {
          const isReleaseBacklogView = Boolean(selectedRelease);
          const scopedBacklogTasks = isReleaseBacklogView ? projectReleaseTasks : tasks;
          const openScopedBacklogTaskCount = scopedBacklogTasks.filter((task) => task.status !== "done").length;
          const activeBacklogFilterValue = isReleaseBacklogView ? releaseBacklogFilterMode : backlogFilterMode;
          const activeBacklogSortValue = isReleaseBacklogView ? releaseBacklogSortMode : backlogSortMode;
          const activeBacklogFilterOptionValue = isReleaseBacklogView ? activeReleaseBacklogFilterOption : activeBacklogFilterOption;
          const activeBacklogSortOptionValue = isReleaseBacklogView ? activeReleaseBacklogSortOption : activeBacklogSortOption;
          const activeTaskRoots = isReleaseBacklogView ? releaseTaskRoots : backlogTaskRoots;
          const activeVisibleTaskIds = isReleaseBacklogView ? releaseVisibleTaskIds : backlogVisibleTaskIds;
          const activeChildrenByParentId = isReleaseBacklogView ? releaseTaskChildrenByParentId : taskChildrenByParentId;
          const shouldShowMissionControlEmptyAction = !normalizedSearchQuery
            && activeBacklogFilterValue === "open"
            && activeTaskRoots.length === 0
            && (!isReleaseBacklogView || Boolean(selectedRelease));
          const backlogEmptyTitle = normalizedSearchQuery
            ? (isReleaseBacklogView ? "No matching milestone tasks" : "No matching backlog tasks")
            : activeBacklogFilterValue === "tasks"
              ? "No tasks yet"
              : activeBacklogFilterValue === "subtasks"
                ? "No subtasks yet"
                : activeBacklogFilterValue === "all"
                  ? "No tasks yet"
                  : activeBacklogFilterValue === "done"
                    ? "No completed tasks"
                    : isReleaseBacklogView
                      ? "Milestone backlog is empty"
                      : "Backlog is empty";
          const backlogEmptyCopy = normalizedSearchQuery
            ? (isReleaseBacklogView
                ? "Clear the search or assign more tickets to this milestone."
                : "Clear the project search or add a new task below.")
            : activeBacklogFilterValue === "tasks"
              ? "Top-level tasks for this project will appear here."
              : activeBacklogFilterValue === "subtasks"
                ? "Subtasks will appear here below the tasks they belong to."
                : activeBacklogFilterValue === "all"
                  ? (isReleaseBacklogView
                      ? "Open and completed work from this milestone will appear here."
                      : "Open and completed project tasks will appear here.")
                  : activeBacklogFilterValue === "done"
                    ? (isReleaseBacklogView
                        ? "Completed work for this milestone will appear here."
                        : "Completed work from this project will appear here.")
                    : isReleaseBacklogView
                      ? "Run Mission Control to generate the first strategy and create the initial structured backlog for this project."
                      : shouldShowMissionControlEmptyAction
                        ? "Run Mission Control to generate the first strategy and create the initial structured backlog for this project."
                        : "Add a new task below to start building this project's backlog.";
          const backlogComposerBackendUrl = window.location.origin
            + "/api/task-backlog/" + encodeURIComponent(selectedProjectId)
            + (selectedReleaseId ? ("/releases/" + encodeURIComponent(selectedReleaseId)) : "");
          const backlogHeaderTitle = isReleaseBacklogView
            ? (selectedRelease.name || "Milestone")
            : "Backlog";
          const backlogHeaderAction = isReleaseBacklogView && selectedRelease
            ? React.createElement("button", {
                type: "button",
                className: "playground-files-control-button",
                onClick: () => openReleaseComposerForEdit(selectedRelease),
              },
                React.createElement(Settings2, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Settings")
              )
            : null;
          return renderBacklogTaskListView({
            headerTitle: backlogHeaderTitle,
            openTaskCount: openScopedBacklogTaskCount,
            headerAction: backlogHeaderAction,
            primaryActions: renderProjectWorkspaceActionButtons({
              showStrategy: false,
              releaseControl: renderProjectReleasePickerControl({
                popover: backlogToolbarPopover,
                setPopover: setBacklogToolbarPopover,
                allLabel: "All Tickets",
                allDescription: "Show the full project backlog.",
              }),
            }),
            toolbarRef: backlogToolbarActionsRef,
            toolbarPopover: backlogToolbarPopover,
            setToolbarPopover: setBacklogToolbarPopover,
            filterMode: activeBacklogFilterValue,
            setFilterMode: isReleaseBacklogView ? setReleaseBacklogFilterMode : setBacklogFilterMode,
            activeFilterOption: activeBacklogFilterOptionValue,
            sortMode: activeBacklogSortValue,
            setSortMode: isReleaseBacklogView ? setReleaseBacklogSortMode : setBacklogSortMode,
            activeSortOption: activeBacklogSortOptionValue,
            taskRoots: activeTaskRoots,
            visibleTaskIds: activeVisibleTaskIds,
            childrenByParentId: activeChildrenByParentId,
            emptyTitle: backlogEmptyTitle,
            emptyCopy: backlogEmptyCopy,
            emptyAction: shouldShowMissionControlEmptyAction
              ? React.createElement("div", { className: "playground-tasks-empty-actions" },
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "playground-tasks-empty-primary-button playground-tasks-empty-mission-control-button",
                    onClick: () => openMissionControlComposer({ keepStrategyOpen: true }),
                  },
                    React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                    React.createElement("span", null, "Run Mission Control")
                  )
                )
              : null,
            allowManualDrag: !isReleaseBacklogView,
            groupRootTasksByRelease: !isReleaseBacklogView,
            showComposer: true,
            listFooter: null,
            composer: React.createElement("div", {
                className: "playground-tasks-backlog-composer-shell" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
              },
                React.createElement(RunnerChat, {
                  key: selectedProjectId + ":" + (selectedReleaseId || "__all__") + ":" + backlogComposerKey,
                  className: "playground-tasks-backlog-runner",
                  backendUrl: backlogComposerBackendUrl,
                  apiKey: effectiveApiKey,
                  fetchCustomSkills: fetchProjectCustomSkills,
                  speechToTextUrl: speechToTextUrl || undefined,
                  requestHeaders,
                  appId: "runner-web-sdk-demo",
                  inputMode: "computer-agents",
                  computerAgents: computerAgents,
                  environments: backlogComposerEnvironments,
	                  agents: backlogComposerAgents,
	                  skills: skills,
	                  skillDefaults: getDemoImageGenerationSkillDefaults(),
	                  environmentId: backlogComposerEnvironmentId || undefined,
	                  agentId: effectiveBacklogComposerAgentId || undefined,
	                  autoFocusComposer: true,
	                  keepFocusOnSubmit: true,
                  enableBacklogSubtaskCommand: true,
                  backlogTaskConnectors: normalizePlaygroundTaskConnectorSelections(selectedProject?.connectors),
                  backlogSubtaskCommand: backlogComposerSubtaskCommandRequest,
                  enableBacklogMissionControlCommand: true,
                  backlogMissionControlCommand: backlogComposerMissionControlCommandRequest,
                  showUsageInStatus: false,
	                  placeholder: "Add a new task",
	                  onRunStart: handleBacklogComposerRunStart,
	                  onRunFinish: handleBacklogComposerRunFinish,
	                  onBacklogMissionControlSubmit: handleBacklogMissionControlSubmit,
	                  isAgentSelectionBlocked: (agent) => normalizedSubscriptionTierId === "free" && isPlaygroundFreePlanLockedComposerAgent(agent),
	                  onBlockedAgentSelect: openProjectAgentUpgradeModal,
	                  onAgentChange: (nextAgentId) => setBacklogComposerAgentId(nextAgentId),
                  onEnvironmentChange: (nextEnvironmentId) => setBacklogComposerEnvironmentId(nextEnvironmentId),
                  onDocumentPreviewOpenChange: () => {
                  },
                  onDeepResearchDetailOpenChange: () => {
                  },
                })
              ),
          });
        }

        function renderBoardView() {
          const boardTasks = boardVisibleTasks;
          const scopedBoardTasks = (selectedRelease ? projectReleaseTasks : tasks)
            .filter((task) => !isPlaygroundSubtaskRecord(task));
          const openScopedBoardTaskCount = scopedBoardTasks.filter((task) => getTaskBoardStatus(task) !== "done").length;
          const draggingBoardTask = boardDraggingTaskId ? tasksById[boardDraggingTaskId] || null : null;
          const hasSelectedReleaseSection = Boolean(selectedReleaseId && selectedRelease);

          function isTaskInBoardReleaseSection(taskRecord, releaseId) {
            const taskReleaseId = typeof taskRecord?.releaseId === "string" && taskRecord.releaseId.trim()
              ? taskRecord.releaseId.trim()
              : "";
            const normalizedReleaseId = typeof releaseId === "string" && releaseId.trim()
              ? releaseId.trim()
              : "";
            return taskReleaseId === normalizedReleaseId;
          }

          function renderBoardToolbar() {
            return React.createElement("div", {
                className: "playground-tasks-backlog-header",
                ref: boardToolbarActionsRef,
              },
              React.createElement("div", { className: "playground-tasks-backlog-header-row" },
                React.createElement("div", { className: "playground-tasks-backlog-header-main" },
                  React.createElement("div", { className: "playground-tasks-backlog-heading" }, "Board"),
                  React.createElement("span", { className: "playground-tasks-board-release-box-count playground-tasks-backlog-heading-count playground-tasks-backlog-open-count" }, String(openScopedBoardTaskCount))
                )
              ),
              React.createElement("div", { className: "playground-tasks-backlog-header-row is-tertiary" },
                React.createElement("div", { className: "playground-tasks-backlog-secondary-actions" },
                  renderProjectTaskHeaderSearchControl({
                    placeholder: "Search tasks",
                    ariaLabel: "Search board tasks",
                  }),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-board-filter-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-filter is-board-filter" + (boardToolbarPopover === "filter" || boardFilterMode !== "all" ? " is-active" : ""),
                      onClick: () => setBoardToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    },
                      React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Filter")
                    ),
                    boardToolbarPopover === "filter"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          boardFilterOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (boardFilterMode === option.id ? " selected" : ""),
                                onClick: () => {
                                  setBoardFilterMode(option.id);
                                  setBoardToolbarPopover("");
                                },
                              },
                                React.createElement("span", { className: "tb-popup-check-slot" },
                                  boardFilterMode === option.id
                                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                    : null
                                ),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, option.label),
                                  React.createElement("span", null, option.description)
                                )
                              )
                          )
                        )
                      : null
                  )
                ),
                React.createElement("div", { className: "playground-tasks-backlog-tertiary-actions" },
                  renderProjectWorkspaceActionButtons({
                    showStrategy: false,
                    releaseControl: renderProjectReleasePickerControl({
                      popover: boardToolbarPopover,
                      setPopover: setBoardToolbarPopover,
                      allLabel: "All Milestones",
                      allDescription: "Show every milestone on the board.",
                    }),
                  })
                )
              )
            );
          }

          function renderBoardCard(task) {
            const boardStatus = getTaskBoardStatus(task);
            const statusLabel = getPlaygroundTaskStatusLabel(boardStatus);
            const isSubtask = isPlaygroundSubtaskRecord(task);
            const TaskTypeIcon = isSubtask ? Check : Bookmark;
            const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "001";
            const taskDescription = String(task.description || "").trim() || "No description";
            const assigneeName = getTaskAssigneeName(task.assigneeAgentId, "");
            const isDraggable = canDropTaskOnBoardLane(task, "blocked") || canDropTaskOnBoardLane(task, "in_progress") || canDropTaskOnBoardLane(task, "todo");
            return React.createElement("button", {
                key: task.id,
                type: "button",
                className: "playground-tasks-lane-card"
                  + (selectedTaskId === task.id ? " is-active" : "")
                  + (isDraggable ? " is-draggable" : "")
                  + (boardDraggingTaskId === task.id ? " is-dragging" : ""),
                style: getPlaygroundTaskColorStyle(task.taskColor),
                onClick: () => openProjectTaskDetailScreen(task.id),
                draggable: isDraggable,
                onDragStart: (event) => {
                  if (!isDraggable) {
                    event.preventDefault();
                    return;
                  }
                  if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", task.id);
                  }
                  setBoardDraggingTaskId(task.id);
                  setBoardDropLaneId("");
                },
                onDragEnd: () => {
                  clearBoardDragState();
                },
              },
                React.createElement("div", { className: "playground-tasks-lane-card-header" },
                  React.createElement("div", {
                    className: "playground-tasks-lane-card-title" + (task.status === "done" ? " is-complete" : ""),
                  }, task.title || "Untitled Task"),
                  renderTaskAssigneeAvatar(task, "playground-tasks-board-assignee-avatar")
                ),
                React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: taskDescription,
                  className: "playground-tasks-lane-card-copy tb-message-markdown",
                }),
                React.createElement("div", { className: "playground-tasks-lane-card-bottom" },
                  React.createElement("div", { className: "playground-tasks-lane-card-meta-left" },
                    React.createElement("div", {
                      className: "playground-tasks-lane-card-type-badge " + (isSubtask ? "is-subtask" : "is-task"),
                      "aria-hidden": "true",
                    },
                      React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 })
                    ),
                    renderPlaygroundTaskPriorityIcon(task.priority, "playground-tasks-lane-card-priority"),
                    React.createElement("span", { className: "playground-tasks-lane-card-status", title: statusLabel }, statusLabel)
                  ),
                  React.createElement("span", { className: "playground-tasks-lane-card-ticket" }, taskTicketNumber)
                )
              );
          }

          function renderBoardReleaseLane(section, lane) {
            const normalizedSectionReleaseId = typeof section.releaseId === "string" && section.releaseId.trim()
              ? section.releaseId.trim()
              : "";
            const laneTasks = section.tasks.filter((task) => lane.statuses.includes(getTaskBoardStatus(task)));
            const laneDropTargetKey = section.key + ":" + lane.id;
            const isLaneDropTarget = boardDropLaneId === laneDropTargetKey
              && draggingBoardTask
              && isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId)
              && canDropTaskOnBoardLane(draggingBoardTask, lane.id);
            return React.createElement("div", {
                key: section.key + ":" + lane.id,
                className: "playground-tasks-board-release-box" + (isLaneDropTarget ? " is-drop-target" : ""),
              },
              React.createElement("div", { className: "playground-tasks-board-release-box-header" },
                React.createElement("div", { className: "playground-tasks-board-release-box-title" }, lane.label),
                React.createElement("span", { className: "playground-tasks-board-release-box-count" }, String(laneTasks.length))
              ),
              React.createElement("div", {
                  className: "playground-tasks-lane playground-tasks-board-release-lane-body",
                  onDragOver: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    if (event.dataTransfer) {
                      event.dataTransfer.dropEffect = "move";
                    }
                    if (boardDropLaneId !== laneDropTargetKey) {
                      setBoardDropLaneId(laneDropTargetKey);
                    }
                  },
                  onDragEnter: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    if (boardDropLaneId !== laneDropTargetKey) {
                      setBoardDropLaneId(laneDropTargetKey);
                    }
                  },
                  onDragLeave: (event) => {
                    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                      return;
                    }
                    if (boardDropLaneId === laneDropTargetKey) {
                      setBoardDropLaneId("");
                    }
                  },
                  onDrop: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    void handleBoardLaneMove(draggingBoardTask, lane.id);
                  },
                },
                laneTasks.length > 0
                  ? React.createElement("div", { className: "playground-tasks-lane-list" },
                      laneTasks.map((task) => renderBoardCard(task))
                    )
                  : null
              )
            );
          }

          function renderBoardSection(section) {
            const sectionRelease = section.releaseId ? (releasesById[section.releaseId] || null) : null;
            return React.createElement("div", {
                key: section.key,
                className: "playground-tasks-board-release-section",
              },
              React.createElement("div", { className: "playground-tasks-board-release-section-header" },
                React.createElement("div", { className: "playground-tasks-backlog-section-copy-group" },
                  React.createElement("div", { className: "playground-tasks-backlog-section-title" }, section.title)
                ),
                renderReleaseHeaderMeta(sectionRelease)
              ),
              React.createElement("div", { className: "playground-tasks-board-grid" },
                PLAYGROUND_TASK_BOARD_LANES.map((lane) => renderBoardReleaseLane(section, lane))
              )
            );
          }

          const shouldRenderBoardSections = hasSelectedReleaseSection || boardReleaseSections.length > 0;
          const shouldShowMissionControlEmptyAction = !selectedRelease
            && !normalizedSearchQuery
            && boardFilterMode === "all"
            && !shouldRenderBoardSections;
          const emptyTitle = selectedRelease
            ? "No tasks in this milestone"
            : "No tasks on the board";
          const emptyCopy = selectedRelease
            ? "Assign tasks to this milestone or adjust the filter and they will appear in the appropriate lane."
            : shouldShowMissionControlEmptyAction
              ? "Run Mission Control to generate the first strategy and create the initial structured backlog for this project."
              : "Adjust the filter or add tasks to the project and they will appear in the appropriate board lane.";

          return React.createElement("div", { className: "playground-tasks-view-section" },
            renderBoardToolbar(),
            shouldRenderBoardSections
              ? React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-tasks-board-sections" },
                    boardReleaseSections.map((section) => renderBoardSection(section))
                  )
                )
              : React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, emptyTitle),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, emptyCopy),
                  shouldShowMissionControlEmptyAction
                    ? React.createElement("div", { className: "playground-tasks-empty-actions" },
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-tasks-empty-primary-button playground-tasks-empty-mission-control-button",
                          onClick: () => openMissionControlComposer({ keepStrategyOpen: true }),
                        },
                          React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                          React.createElement("span", null, "Run Mission Control")
                        )
                      )
                    : null
                )
          );
        }

${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar}
        function renderThreadsView() {
          return React.createElement("div", { className: "playground-tasks-view-section" },
            React.createElement("div", { className: "playground-tasks-project-panel" },
              React.createElement("div", { className: "playground-tasks-project-panel-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Threads"),
                  React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Threads created inside this project stay grouped here for quick reopening.")
                )
              ),
              filteredProjectThreads.length > 0
                ? React.createElement("div", { className: "playground-tasks-project-list" },
                    filteredProjectThreads.map((thread) =>
                      React.createElement("div", { key: thread.id, className: "playground-tasks-project-row" },
                        React.createElement("div", { className: "playground-tasks-project-row-main" },
                          React.createElement("div", { className: "playground-tasks-project-row-title" }, thread.title || "Untitled thread"),
                          React.createElement("div", { className: "playground-tasks-project-row-copy" }, formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "Recently updated")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => onThreadStarted && onThreadStarted(thread.id),
                        }, "Open")
                      )
                    )
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    normalizedSearchQuery ? "No matching project threads." : "No project threads yet."
                  )
            )
          );
        }

${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.upgradeModal}
        function renderProjectAgentUpgradeModal() {
          return renderPlaygroundAgentUpgradeModal({
            isOpen: projectAgentUpgradeModalOpen,
            titleId: "playground-project-agent-upgrade-title",
            onClose: closeProjectAgentUpgradeModal,
            onCheckout: handleProjectAgentUpgradeCheckout,
            checkoutLoading: projectAgentUpgradeCheckoutLoading,
            checkoutDisabled: typeof onUpgradeToIndividual !== "function",
          });
        }

        function renderMissionControlSetupEmptyState() {
          const capabilities = [
            {
              title: "Generate Strategy",
              copy: "Turn the project goal into a clear execution plan and working context.",
              Icon: SquarePen,
            },
            {
              title: "Generate Tickets",
              copy: "Create structured backlog work with owners, order, and dependencies.",
              Icon: ListTodo,
            },
            {
              title: "Generate Outcomes",
              copy: "Define measurable project outcomes and connect them to planned work.",
              Icon: Award,
            },
            {
              title: "Update Rules",
              copy: "Capture project-level instructions agents should follow on every task.",
              Icon: Shield,
            },
          ];
          return React.createElement("div", { className: "playground-mission-control-setup-empty-card" },
            React.createElement("div", { className: "playground-mission-control-setup-empty-kicker" }, "Mission Control"),
            React.createElement("div", { className: "playground-mission-control-setup-empty-title" }, "Plan or update this project"),
            React.createElement("div", { className: "playground-mission-control-capability-list" },
              capabilities.map((capability) =>
                React.createElement("div", { key: capability.title, className: "playground-mission-control-capability-item" },
                  React.createElement(getPlaygroundSafeIconComponent(capability.Icon, Circle), { className: "playground-mission-control-capability-icon", strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-mission-control-capability-copy-shell" },
                    React.createElement("div", { className: "playground-mission-control-capability-title" }, capability.title),
                    React.createElement("div", { className: "playground-mission-control-capability-copy" }, capability.copy)
                  )
                )
              )
            )
          );
        }

        function renderMissionControlSetupView() {
          const normalizedProject = normalizePlaygroundProjectRecord(projectComposerOpen ? projectDraft : (selectedProject || buildPlaygroundDefaultProjectDraft()));
          const defaultEnvironmentId = String(
            normalizedProject.defaultEnvironmentId
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || ""
          ).trim();
          const missionControlRunnerEnvironments = availableBacklogEnvironments.map((environment) => ({
            ...environment,
            ...(defaultEnvironmentId && environment.id === defaultEnvironmentId ? { isDefault: true } : {}),
          }));
          const missionControlAgentId = String(missionControlAgent?.id || "").trim();
          const normalizedProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
          const runnerProjectId = normalizedProjectId || "draft-project";
          const isMissionControlReady = Boolean(
            canStartThreads !== false
            && missionControlAgentId
            && !missionControlAgentPreparing
            && !missionControlAgentError
            && defaultEnvironmentId
          );
          const lockedProjectConfig = {
            ...(computerAgents && typeof computerAgents === "object" ? computerAgents : {}),
            projects: {
              ...((computerAgents?.projects && typeof computerAgents.projects === "object") ? computerAgents.projects : {}),
              items: [{
                id: runnerProjectId,
                name: normalizedProject.name || "Project",
                description: normalizedProject.description || "",
                defaultEnvironmentId: defaultEnvironmentId || null,
                connectors: normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors),
                color: normalizedProject.color || null,
                metadata: normalizedProject.metadata || null,
              }],
              selectedProjectId: runnerProjectId,
            },
          };

          return React.createElement("div", { className: "playground-mission-control-setup-pane" },
            React.createElement(RunnerChat, {
              key: "mission-control-setup:" + (normalizedProject.id || selectedProjectId || "project") + ":" + missionControlSetupResetToken,
              className: "playground-mission-control-setup-runner playground-mission-control-modal-runner",
              backendUrl,
              apiKey,
              fetchCustomSkills: fetchProjectCustomSkills,
              speechToTextUrl: speechToTextUrl || undefined,
              requestHeaders,
              appId: "runner-web-sdk-demo",
              title: (normalizedProject.name || "Project") + " Mission Control",
              threadMetadata: buildMissionControlThreadMetadata(normalizedProject, ""),
              projectId: normalizedProjectId || undefined,
              inputMode: "computer-agents",
              computerAgents: lockedProjectConfig,
              environments: missionControlRunnerEnvironments,
              agents: missionControlAgentId
                ? [buildPlaygroundRunnerAgentOption(missionControlAgent, { isDefault: true })]
                : [],
              skills: skills,
              skillDefaults: getDemoImageGenerationSkillDefaults(),
              environmentId: defaultEnvironmentId || undefined,
              agentId: missionControlAgentId || undefined,
              autoFocusComposer: true,
              keepFocusOnSubmit: true,
              showUsageInStatus: false,
              disabled: !isMissionControlReady,
              placeholder: "Develop your Project strategy and tasks by prompting Mission Control",
              emptyState: renderMissionControlSetupEmptyState(),
              onExternalRunRequestCreate: handleMissionControlSetupRunRequest,
            })
          );
        }

        function renderMissionControlStudio() {
          if (!missionControlSetupOpen || !projectComposerOpen) {
            return null;
          }
          const normalizedProject = normalizePlaygroundProjectRecord(projectDraft || selectedProject || buildPlaygroundDefaultProjectDraft());
          const projectGoalDraft = String(normalizedProject.description || "");
          const hasProjectGoal = Boolean(projectGoalDraft.trim());

          function renderMissionControlGoalEditor() {
            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor" },
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
                      hasProjectGoal
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: projectGoalDraft,
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
                  value: projectGoalDraft,
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

          function handleMissionControlOutcomesBlur() {
            setIsMissionControlSetupOutcomesEditing(false);
            updateMissionControlStrategyDraft(buildMissionControlSetupStrategyBriefFromDraft());
          }

          function renderMissionControlOutcomesEditor() {
            const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraftRef.current || missionControlStrategyDraft);
            const outcomeRecords = parseMissionControlSetupOutcomesInput(missionControlSetupOutcomesDraft, currentStrategyBrief.outcomes);
            const hasOutcomeRecords = outcomeRecords.length > 0;

            function applyMissionControlSetupOutcomeRecords(nextOutcomes) {
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...currentStrategyBrief,
                mission: String(projectDraft.description || "").replaceAll(String.fromCharCode(13), "").trim(),
                outcomes: nextOutcomes.map((outcome, index) => normalizePlaygroundStrategyOutcomeRecord(outcome, index)),
              });
              updateMissionControlStrategyDraft(nextStrategyBrief);
              syncMissionControlSetupOutcomesDraft(nextStrategyBrief);
            }

            function updateMissionControlSetupOutcomeTitle(indexToUpdate, nextValue) {
              setMissionControlSetupOutcomeTitleDrafts((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                [indexToUpdate]: String(nextValue || ""),
              }));
              const nextOutcomes = outcomeRecords.map((outcome, index) => index === indexToUpdate
                ? normalizePlaygroundStrategyOutcomeRecord({ ...outcome, title: nextValue }, index)
                : outcome
              );
              applyMissionControlSetupOutcomeRecords(nextOutcomes);
            }

            function getMissionControlSetupOutcomeTitleValue(outcome, index) {
              if (
                missionControlSetupOutcomeTitleDrafts
                && typeof missionControlSetupOutcomeTitleDrafts === "object"
                && Object.prototype.hasOwnProperty.call(missionControlSetupOutcomeTitleDrafts, index)
              ) {
                return missionControlSetupOutcomeTitleDrafts[index];
              }
              return outcome.title || "";
            }

            function commitMissionControlSetupOutcomeTitle(indexToCommit) {
              setMissionControlSetupOutcomeTitleDrafts((current) => {
                if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, indexToCommit)) {
                  return current;
                }
                const nextDrafts = { ...current };
                delete nextDrafts[indexToCommit];
                return nextDrafts;
              });
              handleMissionControlOutcomesBlur();
            }

            function addMissionControlSetupOutcome() {
              setIsMissionControlSetupOutcomesEditing(true);
              setMissionControlSetupOutcomeMenuIndex(-1);
              applyMissionControlSetupOutcomeRecords(outcomeRecords.concat(normalizePlaygroundStrategyOutcomeRecord({
                id: "outcome-" + String(outcomeRecords.length + 1).padStart(2, "0"),
                title: "New outcome",
                description: "",
                successCriteria: [],
              }, outcomeRecords.length)));
            }

            function deleteMissionControlSetupOutcome(indexToDelete) {
              setMissionControlSetupOutcomeMenuIndex(-1);
              setMissionControlSetupOutcomeTitleDrafts({});
              applyMissionControlSetupOutcomeRecords(outcomeRecords.filter((_, index) => index !== indexToDelete));
            }

            function openMissionControlSetupOutcomeDetails(indexToOpen) {
              const outcome = outcomeRecords[indexToOpen];
              if (!outcome) {
                return;
              }
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...currentStrategyBrief,
                outcomes: outcomeRecords,
              });
              updateMissionControlStrategyDraft(nextStrategyBrief);
              syncMissionControlSetupOutcomesDraft(nextStrategyBrief);
              setMissionControlSetupOutcomeMenuIndex(-1);
              setProjectOverviewOutcomeEditorState({
                index: indexToOpen,
                draft: buildProjectOverviewOutcomeEditorDraft(outcome, indexToOpen),
                source: "mission-control-setup",
              });
            }

            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor playground-mission-control-modal-outcomes-editor" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Outcomes"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-mission-control-modal-outcome-add",
                  onClick: addMissionControlSetupOutcome,
                  title: "Add outcome",
                  "aria-label": "Add outcome",
                }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-outcomes-list" },
                hasOutcomeRecords
                  ? outcomeRecords.map((outcome, index) =>
                      React.createElement("div", {
                          key: outcome.id || ("mission-control-outcome-" + index),
                          className: "playground-mission-control-modal-outcome-row",
                        },
                        React.createElement("div", { className: "playground-mission-control-modal-outcome-copy" },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-mission-control-modal-outcome-input",
                            value: getMissionControlSetupOutcomeTitleValue(outcome, index),
                            placeholder: "Outcome",
                            onFocus: () => setIsMissionControlSetupOutcomesEditing(true),
                            onChange: (event) => updateMissionControlSetupOutcomeTitle(index, event.target.value),
                            onBlur: () => commitMissionControlSetupOutcomeTitle(index),
                          })
                        ),
                        React.createElement("div", {
                            className: "playground-mission-control-modal-outcome-menu-shell playground-tasks-toolbar-popup-shell" + (missionControlSetupOutcomeMenuIndex === index ? " is-open" : ""),
                            ref: missionControlSetupOutcomeMenuIndex === index ? missionControlSetupOutcomeMenuRef : null,
                          },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-mission-control-modal-outcome-menu-trigger",
                            onClick: () => setMissionControlSetupOutcomeMenuIndex((current) => current === index ? -1 : index),
                            title: "Outcome options",
                            "aria-label": "Outcome options",
                            "aria-expanded": missionControlSetupOutcomeMenuIndex === index ? "true" : "false",
                          }, React.createElement(EllipsisVertical, { width: 14, height: 14, strokeWidth: 1.8 })),
                          missionControlSetupOutcomeMenuIndex === index
                            ? React.createElement(PlatformPopupSurface, {
                                className: "playground-tasks-toolbar-popup-menu playground-mission-control-modal-outcome-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                              },
                                React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row",
                                  onClick: () => openMissionControlSetupOutcomeDetails(index),
                                },
                                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "Details")
                                  )
                                ),
                                React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                                  onClick: () => deleteMissionControlSetupOutcome(index),
                                },
                                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "Delete outcome")
                                  )
                                )
                              )
                            : null
                        )
                      )
                    )
                  : React.createElement("button", {
                      type: "button",
                      className: "playground-mission-control-modal-outcomes-empty",
                      onClick: addMissionControlSetupOutcome,
                    }, "Add the first outcome")
              )
            );
          }

          const studioElement = renderPlaygroundPlatformModal({
            open: missionControlSetupOpen && projectComposerOpen,
            visible: missionControlSetupVisible,
            closing: missionControlSetupClosing,
            onClose: () => closeMissionControlSetupModal(),
            closeOnEscape: false,
            size: "full",
            backdropClassName: "playground-tasks-project-modal-backdrop playground-mission-control-modal-backdrop",
            className: "playground-tasks-project-modal playground-mission-control-modal",
            ariaLabel: "Mission Control",
            children: React.createElement("div", { className: "playground-mission-control-modal-body" },
              React.createElement("div", { className: "playground-mission-control-modal-context" },
                renderMissionControlGoalEditor(),
                renderMissionControlOutcomesEditor(),
                missionControlAgentError
                  ? React.createElement("div", { className: "playground-mission-control-setup-error playground-environments-error" }, missionControlAgentError)
                  : null
              ),
              React.createElement("div", { className: "playground-mission-control-modal-composer" },
                renderMissionControlSetupView()
              )
            ),
          });
          return React.createElement(React.Fragment, null,
            studioElement,
            renderSharedProjectOverviewOutcomeEditorModal({
              strategyBrief: normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft),
            })
          );
        }

${PROJECT_OVERVIEW_SCRIPT}

        function renderSelectedProjectWorkspace() {
          if (!selectedProject) {
            return null;
          }

	          const projectWorkspaceTitle = selectedProjectWorkspaceTitle;
	          const selectedProjectAccessLevel = String(
	            selectedProject?.teamAccessLevel
	            || selectedProject?.metadata?.teamAccessLevel
	            || ""
	          ).trim().toLowerCase();
	          const canManageSelectedProject = Boolean(
	            isProjectCreatedByCurrentViewer(selectedProject)
	            || selectedProjectAccessLevel === "owner"
	            || selectedProjectAccessLevel === "manage"
	          );
	          const projectWorkspaceScrollClassName = "playground-environments-detail-scroll playground-tasks-project-workspace-scroll"
	            + (taskView === "overview" ? " is-overview" : "")
	            + (taskView === "backlog" ? " is-backlog" : "")
            + (taskView === "board" ? " is-board" : "");
          const projectWorkspaceScrollStyle = undefined;

          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              useUnifiedProjectNav ? null : React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-tasks-project-navbar" },
                React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-tasks-project-title-back",
                    onClick: () => {
                      setMissionControlSetupOpen(false);
                      handleSelectProject("");
                    },
                    title: "All Projects",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                    React.createElement("div", { className: "playground-content-title" }, projectWorkspaceTitle)
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" },
                  React.createElement("div", { className: "content-mode-switch playground-tasks-nav playground-tasks-project-nav-switch" },
                    projectSidebarNavItems.map((item) =>
                      React.createElement("button", {
                        key: item.id,
                        type: "button",
                        className: "content-mode-button" + (!missionControlSetupOpen && taskView === item.id ? " is-active" : ""),
                        onClick: () => {
                          setMissionControlSetupOpen(false);
                          setTaskView(item.id);
                          if (item.id === "calendar") {
                            setSelectedTaskId("");
                            setDraftTask(null);
                          }
                          setProjectSidebarPopover("");
                        },
                      }, item.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions", ref: projectSidebarActionsRef },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-search-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "search" ? " is-active" : ""),
                      onClick: () => setProjectSidebarPopover((current) => current === "search" ? "" : "search"),
                      title: "Search project",
                    }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                    projectSidebarPopover === "search"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                          React.createElement("div", { className: "playground-tasks-project-search-header" },
                            React.createElement("div", { className: "playground-tasks-project-search-title" }, "Search Project"),
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
                                placeholder: projectSearchPlaceholder,
                                value: searchQuery,
                                onChange: (event) => setSearchQuery(event.target.value),
                              })
                            ),
                            React.createElement("div", { className: "playground-tasks-project-search-hint" },
                              taskView === "overview"
                                ? "Search across tasks, threads, files, environments, assigned agents, and project plugins."
                                : taskView === "calendar"
                                ? "Filter tasks and schedules by title, task, agent, or environment."
                                : taskView === "backlog" && selectedReleaseId
                                  ? "Filter milestone tasks by title, ticket number, assignee, environment, or milestone."
                                  : "Filter tasks by title, ticket number, assignee, environment, or sprint."
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "menu" ? " is-active" : ""),
                      onClick: () => setProjectSidebarPopover((current) => current === "menu" ? "" : "menu"),
                      title: "Project actions",
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    projectSidebarPopover === "menu"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          taskView === "calendar"
                            ? React.createElement("button", {
                                type: "button",
                                className: "tb-popup-row",
                                onClick: () => {
                                  setProjectSidebarPopover("");
                                  openScheduleComposer();
                                },
                              },
                                React.createElement(Plus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, "New Scheduled Task"),
                                  React.createElement("span", null, "Create a new calendar automation for this project.")
                                )
                              )
                            : null,
	                          canManageSelectedProject
	                            ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row",
	                            onClick: () => {
                              setProjectSidebarPopover("");
                              openProjectComposerForEdit(selectedProject);
                            },
                          },
                            React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                              React.createElement("span", null, "Edit Project"),
	                              React.createElement("span", null, "Change icon, title, and description.")
	                            )
	                          )
	                            : null,
	                          canManageSelectedProject
	                            ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row playground-tasks-detail-menu-item-danger",
	                            onClick: () => {
                              setProjectSidebarPopover("");
                              void handleDeleteProject(selectedProject.id);
                            },
                          },
                            React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                              React.createElement("span", null, "Delete Project"),
	                              React.createElement("span", null, "Remove this project and its planning scope.")
	                            )
	                          )
	                            : null
	                        )
	                      : null
	                  )
                )
              ),
              React.createElement("div", {
                className: projectWorkspaceScrollClassName,
                style: projectWorkspaceScrollStyle,
              },
                React.createElement("div", { className: "playground-project-workspace-inner" },
                  taskLoadState.status === "error" && tasks.length > 0
                    ? React.createElement("div", { className: "playground-environments-error" },
                        React.createElement("span", null, taskLoadState.error || "Failed to refresh project tasks."),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => void loadProjectWorkspace(selectedProjectId),
                        }, "Retry")
                      )
                    : null,
                  taskLoadState.status === "loading" && tasks.length === 0
                    ? React.createElement("div", { className: "playground-tasks-loading-state" },
                        React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                        React.createElement("div", { className: "playground-tasks-loading-copy" }, "Loading project…")
                      )
                    : taskLoadState.status === "error" && tasks.length === 0
                      ? React.createElement("div", { className: "playground-tasks-empty" },
                          React.createElement("div", { className: "playground-tasks-empty-title" }, "Project workspace unavailable"),
                          React.createElement("div", { className: "playground-tasks-empty-copy" }, taskLoadState.error || "The tasks API could not be reached for this project."),
                          React.createElement(PlatformPrimaryButton, {
                            size: "medium",
                            type: "button",
                            className: "playground-environments-action-button is-primary",
                            onClick: () => void loadProjectWorkspace(selectedProjectId),
                          }, "Retry")
                        )
                      : React.createElement(React.Fragment, null,
                          taskView === "overview"
                            ? renderProjectOverviewView()
                            : taskView === "board"
                              ? renderBoardView()
                              : renderBacklogView()
                        )
                )
              )
            )
          );
        }

        function renderProjectComposerSetupWorkspace() {
          if (!projectComposerOpen || selectedProject) {
            return null;
          }

          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-tasks-project-navbar" },
                React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-tasks-project-title-back",
                    onClick: () => closeProjectComposer(),
                    title: "All Projects",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                    React.createElement("div", { className: "playground-content-title" }, projectDraft.name || "New Project")
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" }),
                React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions" })
              ),
              React.createElement("div", {
                className: "playground-environments-detail-scroll playground-tasks-project-workspace-scroll is-mission-control-setup",
              },
                React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, "Project Studio"),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, "Use the full-screen studio to define project settings and run Mission Control.")
                )
              )
            )
          );
        }

${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.standaloneWorkspace}
        function renderTaskDetail() {
          if (missionControlStrategyOpen && selectedProject) {
            const missionControlTaskCount = Number(selectedProjectSummary.tasksCount) || 0;
            const missionControlOpenTaskCount = Number(selectedProjectSummary.openTasksCount) || 0;
            const missionControlStatusMetrics = [
              {
                key: "backlog",
                label: "Backlog",
                count: Number(selectedProjectTaskStatusOverview.backlog) || 0,
                Icon: FolderOpen,
                toneClassName: "is-backlog",
              },
              {
                key: "in-progress",
                label: "In progress",
                count: Number(selectedProjectTaskStatusOverview.inProgress) || 0,
                Icon: Zap,
                toneClassName: "is-in-progress",
              },
              {
                key: "done",
                label: "Finished",
                count: Number(selectedProjectTaskStatusOverview.done) || 0,
                Icon: Sparkles,
                toneClassName: "is-done",
              },
            ];
            const missionControlStatusSegments = [
              {
                key: "backlog",
                count: Number(selectedProjectTaskStatusOverview.backlog) || 0,
                className: "is-backlog",
              },
              {
                key: "in-progress",
                count: Number(selectedProjectTaskStatusOverview.inProgress) || 0,
                className: "is-in-progress",
              },
              {
                key: "done",
                count: Number(selectedProjectTaskStatusOverview.done) || 0,
                className: "is-done",
              },
            ]
              .map((segment) => ({
                ...segment,
                percentage: missionControlTaskCount > 0
                  ? (segment.count / missionControlTaskCount) * 100
                  : 0,
              }))
              .filter((segment) => segment.count > 0);
            const hasStrategyDocument = Boolean(String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim());
            const canUndoMissionControlDocument = Array.isArray(missionControlDocumentHistory?.past) && missionControlDocumentHistory.past.length > 0;
            const canRedoMissionControlDocument = Array.isArray(missionControlDocumentHistory?.future) && missionControlDocumentHistory.future.length > 0;
            const renderMissionControlDocumentToolbarButton = (action) =>
              React.createElement("button", {
                key: action.id,
                type: "button",
                className: "playground-tasks-detail-format-button",
                title: action.label,
                "aria-label": action.label,
                disabled: Boolean(action.disabled),
                onMouseDown: (event) => event.preventDefault(),
                onClick: action.onClick,
              }, React.createElement(action.icon, {
                width: 14,
                height: 14,
                strokeWidth: action.strokeWidth || 1.8,
              }));
            const missionControlDocumentTextFormatActions = [
              { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
              { id: "italic", label: "Italic", icon: Italic },
              { id: "underline", label: "Underline", icon: Underline },
            ];
            const missionControlDocumentListFormatActions = [
              { id: "list", label: "List", icon: List },
              { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
            ];
            const missionControlDocumentInsertFormatActions = [
              { id: "code", label: "Code", icon: CodeXml },
              { id: "link", label: "Link", icon: Link2 },
            ];
            return React.createElement("div", { className: "playground-tasks-detail-shell" },
              React.createElement("div", { className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""), ref: taskDetailMainRef },
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar" },
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
                    React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                      React.createElement("div", { className: "playground-content-title" }, "Strategy")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-tasks-detail-navbar-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain",
                      onClick: () => setMissionControlStrategyOpen(false),
                      title: "Close strategy",
                      "aria-label": "Close strategy",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-body" },
                  React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                    React.createElement("div", { className: "playground-tasks-detail-facts" },
                      React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-detail-facts-toggle" + (missionControlDetailsCollapsed ? " is-collapsed" : ""),
                          onClick: () => setMissionControlDetailsCollapsed((current) => !current),
                          title: missionControlDetailsCollapsed ? "Expand details" : "Collapse details",
                          "aria-label": missionControlDetailsCollapsed ? "Expand details" : "Collapse details",
                          "aria-expanded": missionControlDetailsCollapsed ? "false" : "true",
                        }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                      ),
                      !missionControlDetailsCollapsed
                        ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                            missionControlTaskCount > 0
                              ? React.createElement("div", { className: "playground-mission-control-status-overview" },
                                  React.createElement("div", { className: "playground-mission-control-status-metrics" },
                                    missionControlStatusMetrics.map((metric) =>
                                      React.createElement("div", {
                                        key: metric.key,
                                        className: "playground-mission-control-status-metric",
                                      },
                                        React.createElement("div", { className: "playground-mission-control-status-value" }, String(metric.count)),
                                        metric.label
                                          ? React.createElement("div", { className: "playground-mission-control-status-label " + metric.toneClassName },
                                              React.createElement("span", null, metric.label),
                                              React.createElement(getPlaygroundSafeIconComponent(metric.Icon, Circle), { strokeWidth: 1.8 })
                                            )
                                          : null
                                      )
                                    )
                                  ),
                                  React.createElement("div", {
                                    className: "playground-mission-control-status-bar" + (missionControlStatusSegments.length === 0 ? " is-empty" : ""),
                                    "aria-label": "Project task progress overview",
                                  },
                                    missionControlStatusSegments.map((segment) =>
                                      React.createElement("div", {
                                        key: segment.key,
                                        className: "playground-mission-control-status-segment " + segment.className,
                                        style: {
                                          width: segment.percentage + "%",
                                          flex: "0 0 " + segment.percentage + "%",
                                        },
                                        title: Math.round(segment.percentage) + "% " + segment.key.replace("-", " "),
                                      })
                                    )
                                  )
                                )
                              : null,
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Number of tasks"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, String(missionControlTaskCount))
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Open tasks"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, String(missionControlOpenTaskCount))
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", {
                                className: "playground-tasks-detail-fact-label",
                                style: { whiteSpace: "nowrap" },
                              }, "Mission Confidence"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, "100%")
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-mission-control-run-button",
                              disabled: isSelectedProjectMissionControlRunning,
                              onClick: () => openMissionControlComposer({ keepStrategyOpen: true }),
                            },
                              isSelectedProjectMissionControlRunning
                                ? React.createElement(React.Fragment, null,
                                    React.createElement(Loader2, { className: "playground-mission-control-run-button-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Running Mission Control")
                                  )
                                : React.createElement(React.Fragment, null,
                                    React.createElement(Rocket, { className: "playground-mission-control-run-button-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Run Mission Control")
                                  )
                            )
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-project-strategy-notes-section" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Strategy Notes"),
                        React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                          renderMissionControlDocumentToolbarButton({
                            id: "undo",
                            label: "Undo",
                            icon: Undo2,
                            disabled: !canUndoMissionControlDocument,
                            onClick: handleMissionControlDocumentUndo,
                          }),
                          renderMissionControlDocumentToolbarButton({
                            id: "redo",
                            label: "Redo",
                            icon: Redo2,
                            disabled: !canRedoMissionControlDocument,
                            onClick: handleMissionControlDocumentRedo,
                          }),
                          React.createElement("span", {
                            key: "history-divider",
                            className: "playground-agents-detail-instructions-toolbar-divider",
                            "aria-hidden": "true",
                          }),
                          missionControlDocumentTextFormatActions.map((action) =>
                            renderMissionControlDocumentToolbarButton({
                              ...action,
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            })
                          ),
                          React.createElement("span", {
                            key: "list-divider-start",
                            className: "playground-agents-detail-instructions-toolbar-divider",
                            "aria-hidden": "true",
                          }),
                          missionControlDocumentListFormatActions.map((action) =>
                            renderMissionControlDocumentToolbarButton({
                              ...action,
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            })
                          ),
                          React.createElement("span", {
                            key: "list-divider-end",
                            className: "playground-agents-detail-instructions-toolbar-divider",
                            "aria-hidden": "true",
                          }),
                          missionControlDocumentInsertFormatActions.map((action) =>
                            renderMissionControlDocumentToolbarButton({
                              ...action,
                              onClick: () => handleMissionControlDocumentFormat(action.id),
                            })
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isMissionControlDocumentEditing ? " is-editing" : " is-preview") },
                        !isMissionControlDocumentEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              hasStrategyDocument
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: missionControlDocumentDraft,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, "Run Mission Control first to generate the project strategy and backlog plan.")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: missionControlDocumentTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isMissionControlDocumentEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isMissionControlDocumentEditing ? "Add Strategy here" : "",
                          value: missionControlDocumentDraft,
                          onFocus: () => {
                            setIsMissionControlDocumentEditing(true);
                          },
                          onChange: (event) => {
                            updateMissionControlDocumentDraftValue(event.target.value, {
                              previousValue: missionControlDocumentDraft,
                            });
                            resizeTaskDescriptionTextarea(event.currentTarget);
                          },
                          onBlur: () => {
                            setIsMissionControlDocumentEditing(false);
                            commitMissionControlDocumentIfDirty();
                          },
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-comments" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Comments"),
                      selectedProjectMissionComments.length > 0
                        ? React.createElement("div", { className: "playground-tasks-comments-list" },
                            selectedProjectMissionComments.map((comment) =>
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
                  React.createElement("div", { className: "playground-tasks-comment-dock" },
                    missionControlSaveState.error
                      ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, missionControlSaveState.error)
                      : missionControlSaveState.isSaving
                        ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
                        : missionControlSaveState.message
                          ? React.createElement("div", { className: "playground-environments-success playground-tasks-comment-feedback" }, missionControlSaveState.message)
                          : null,
                    React.createElement("div", { className: "playground-tasks-comment-runner" },
                      React.createElement("div", { className: "playground-tasks-comment-bar" },
                        React.createElement("textarea", {
                          rows: 1,
                          className: "playground-tasks-comment-input",
                          placeholder: "Add a comment",
                          value: missionControlCommentInputValue,
                          onChange: (event) => {
                            setMissionControlCommentInputValue(event.target.value);
                            resizeTaskCommentTextarea(event.currentTarget);
                          },
                          onKeyDown: (event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void handleAddMissionControlComment();
                            }
                          },
                        }),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-comment-send-button",
                          onClick: () => void handleAddMissionControlComment(),
                          disabled: missionControlSaveState.isSaving || !String(missionControlCommentInputValue || "").trim(),
                          "aria-label": "Send comment",
                          title: "Send comment",
                        },
                          React.createElement(ArrowUp, { className: "playground-tasks-comment-send-icon", strokeWidth: 1.9 })
                        )
                      )
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-preview-pane" },
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
                  : null
              )
            );
          }

          if (!draftTask && isCalendarContext && scheduleViewMode === "setup") {
            return renderScheduleDetailPanel();
          }

          if (!draftTask) {
            if (taskLoadState.status === "loading" || pendingExternalTaskOpenRequest) {
              return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-tasks-loading-state" },
                  React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                  React.createElement("div", { className: "playground-tasks-loading-copy" }, "Loading ticket…")
                )
              );
            }
            if (taskLoadState.status === "error") {
              return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, "Ticket unavailable"),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, taskLoadState.error || "The task details could not be loaded."),
                  selectedProjectId
                    ? React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                        type: "button",
                        className: "playground-environments-action-button is-primary",
                        onClick: () => void loadProjectWorkspace(selectedProjectId),
                      }, "Retry")
                    : null
                )
              );
            }
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
              React.createElement("div", { className: "playground-tasks-empty" },
                React.createElement("div", { className: "playground-tasks-empty-title" }, "Pick a task"),
                React.createElement("div", { className: "playground-tasks-empty-copy" }, "Select a task from backlog, board, or a milestone backlog to edit assignments, dependencies, attachments, and scheduling.")
              )
            );
          }

          const dependencyCandidates = sortedTasks
            .filter((task) => task.id !== draftTask.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
          });
          const startedThreadId = getTaskStartedThreadId(draftTask);
          const isTaskConfigLocked = false;
          const activeTicketNumber = taskTicketNumbersById[draftTask.id] || draftTask.ticketNumber || "001";
          const activeTaskType = normalizePlaygroundTaskType(draftTask.taskType);
          const activeTaskReleaseId = draftTask.releaseId || "";
          const blockedByTaskId = draftTask.dependencyIds[0] || "";
          const hasTaskAttachments = draftTask.attachments.length > 0;
          const taskScheduleSummary = formatPlaygroundTaskScheduleSummary(draftTask);
          const draftTaskParentLabel = draftTaskParentTask
            ? ((taskTicketNumbersById[draftTaskParentTask.id] || draftTaskParentTask.ticketNumber || "000") + " " + (draftTaskParentTask.title || "Untitled Task"))
            : "Choose parent";
          const draftTaskParentTicketNumber = draftTaskParentTask
            ? (taskTicketNumbersById[draftTaskParentTask.id] || draftTaskParentTask.ticketNumber || "000")
            : "";
          const taskComments = normalizePlaygroundTaskCommentList(draftTask.comments)
            .slice()
            .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")));
          const isFullPageTaskDetail = Boolean(projectTaskDetailScreenOpen);
          const taskSkillEntries = getEffectivePlaygroundTaskEnabledSkillIds(draftTask)
            .map((skillId) => resolveTaskSkillItem(skillId))
            .filter(Boolean);
          const taskConnectorEntries = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, draftTask);
            return {
              ...option,
              selection,
              valueLabel: selection?.valueLabel || "None",
            };
          });
          const activeTaskPriorityPresentation = getPlaygroundTaskPriorityPresentation(draftTask.priority);
          const activeTaskColorPresentation = getPlaygroundTaskColorPresentation(draftTask.taskColor);
          const ActiveTaskTypeIcon = activeTaskType === "subtask" ? Check : (activeTaskType === "loop" ? RefreshCw : Bookmark);
          const startedThreadRecord = startedThreadId
            ? selectedProjectRecentThreads.find((thread) => thread.id === startedThreadId) || null
            : null;
          const linkedRunPresentation = getTaskLinkedRunPresentation(startedThreadRecord);
          const activeTaskTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === activeTaskType)?.label || "Task";
          const activeReleaseLabel = activeTaskReleaseId
            ? (releasesById[activeTaskReleaseId]?.name || releases.find((release) => release.id === activeTaskReleaseId)?.name || "Milestone")
            : "None";
          const resolvedTaskAssigneeId = draftTask.assigneeAgentId || defaultTaskAssigneeId || "";
	          const activeAssigneeLabel = resolvedTaskAssigneeId
	            ? getTaskAssigneeName(resolvedTaskAssigneeId, "Unassigned")
	            : "Unassigned";
	          const resolvedTaskReviewerId = draftTask.reviewRequired
	            ? String(draftTask.reviewerAgentId || "").trim()
	            : "";
	          const activeReviewerLabel = draftTask.reviewRequired
	            ? (resolvedTaskReviewerId ? getTaskAssigneeName(resolvedTaskReviewerId, "Reviewer") : "Review required")
	            : "No review";
	          const activeEnvironmentDisplay = resolvePlaygroundTaskEnvironmentDisplay(draftTask, {
            projectRecord: selectedProject,
          });
          const activeEnvironmentLabel = activeEnvironmentDisplay.label;
          const projectDefaultEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(selectedProject);
          const projectDefaultEnvironment = projectDefaultEnvironmentId
            ? availableBacklogEnvironments.find((environment) => environment.id === projectDefaultEnvironmentId) || null
            : null;
          const activeBlockedByTask = blockedByTaskId ? (tasksById[blockedByTaskId] || null) : null;
          const activeBlockedByLabel = activeBlockedByTask
            ? ((taskTicketNumbersById[activeBlockedByTask.id] || activeBlockedByTask.ticketNumber || "000") + " - " + (activeBlockedByTask.title || "Untitled Task"))
            : "None";
          const activeAssigneeActor = resolvedTaskAssigneeId
            ? (assignableActorsById[resolvedTaskAssigneeId] || null)
            : null;
          const defaultTaskAssigneePopupMode = taskDetailAvailableAssigneePopupModes.includes(getPlaygroundTaskAssigneePopupMode(activeAssigneeActor))
            ? getPlaygroundTaskAssigneePopupMode(activeAssigneeActor)
            : (taskDetailAvailableAssigneePopupModes[0] || "agents");

          function toggleTaskDetailSelectPopover(nextPopoverId) {
            setTaskDetailPopover("");
            setTaskSkillsPopoverOpen(false);
            if (nextPopoverId === "assignee" && taskDetailSelectPopover !== "assignee") {
              setTaskDetailAssigneePopupMode(defaultTaskAssigneePopupMode);
            }
            setTaskDetailSelectPopover((current) => current === nextPopoverId ? "" : nextPopoverId);
          }

          function renderTaskDetailSelectOptionRow({ key, label, description, selected, onClick, disabled = false }) {
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

          function renderTaskDetailSelectControl({
            popoverId,
            valueLabel,
            disabled = false,
            isEmpty = false,
            buttonContent = null,
            menuClassName = "",
            children,
          }) {
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

            return React.createElement("section", { className: "playground-plugins-section playground-tasks-detail-threads-section" },
              React.createElement("div", { className: "playground-plugins-section-header" },
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

          function renderTaskDetailFactsSection() {
            return React.createElement("div", {
                  className: "playground-tasks-detail-facts"
                    + ((taskDetailSelectPopover || taskSkillsPopoverOpen || taskScheduleDialogState) ? " is-popover-open" : ""),
                },
                React.createElement("div", { className: "playground-tasks-detail-facts-header" },
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
	          return React.createElement("div", {
	              className: "playground-tasks-detail-shell"
	                + (previewedTaskAttachment ? " is-preview-open" : "")
	                + (isFullPageTaskDetail ? " is-ticket-full-page" : "")
	                + (isFullPageTaskDetail && ticketDetailSidebarCollapsed ? " is-ticket-sidebar-collapsed" : ""),
	            },
            React.createElement("div", { className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""), ref: taskDetailMainRef },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar" },
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
	              ),
              React.createElement("div", { className: "playground-tasks-detail-body" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                isFullPageTaskDetail ? null : renderTaskDetailThreadsSection(),
                React.createElement("div", { className: "playground-tasks-detail-description" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                      [
                        {
                          id: "bold",
                          label: "Bold",
                          icon: Bold,
                        },
                        {
                          id: "italic",
                          label: "Italic",
                          icon: Italic,
                        },
                        {
                          id: "underline",
                          label: "Underline",
                          icon: Underline,
                        },
                        {
                          id: "list",
                          label: "List",
                          icon: List,
                        },
                      ].map((action) =>
                        React.createElement("button", {
                          key: action.id,
                          type: "button",
                          className: "playground-tasks-detail-format-button",
                          title: action.label,
                          "aria-label": action.label,
                          disabled: isTaskConfigLocked,
                          onMouseDown: (event) => event.preventDefault(),
                          onClick: () => handleTaskDescriptionFormat(action.id),
                        }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isTaskDescriptionEditing ? " is-editing" : " is-preview") },
                    !isTaskDescriptionEditing
                      ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                          String(draftTask.description || "").trim()
                            ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                content: draftTask.description,
                                className: "playground-tasks-detail-description-preview tb-message-markdown",
                              })
                            : React.createElement("div", {
                                className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                              }, "Add Description here")
                        )
                      : null,
                    React.createElement("textarea", {
                      ref: taskDescriptionTextareaRef,
                      className: "playground-tasks-detail-description-input " + (isTaskDescriptionEditing ? "is-editing" : "is-preview"),
                      rows: 1,
                      placeholder: isTaskDescriptionEditing ? "Add Description here" : "",
                      value: draftTask.description,
                      readOnly: isTaskConfigLocked,
                      onFocus: () => {
                        if (!isTaskConfigLocked) {
                          setIsTaskDescriptionEditing(true);
                        }
                      },
                      onChange: (event) => {
                        updateDraftField("description", event.target.value);
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      },
                      onBlur: () => {
                        setIsTaskDescriptionEditing(false);
                        commitDraftTaskIfDirty();
                      },
                    })
                  )
                ),
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
            ),
		            isFullPageTaskDetail
		              ? React.createElement("aside", { className: "playground-tasks-ticket-screen-sidebar" },
		                  ticketDetailSidebarCollapsed
			                    ? null
			                    : React.createElement(React.Fragment, null,
			                        renderTaskDetailFactsSection(),
			                        renderTaskDetailThreadsSection({ showActions: false, showRunThreadAction: true })
			                      )
		                )
	              : null,
            React.createElement("div", { className: "playground-tasks-detail-preview-pane" },
              previewedTaskAttachment
                ? React.createElement("div", { className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-tasks-detail-preview-host" },
                    React.createElement(RunnerDocumentPreviewDrawer, {
                      attachment: previewedTaskAttachment,
                      backendUrl,
                      requestHeaders,
                      inline: true,
                      onClose: () => setPreviewedTaskAttachmentId(""),
                      showResizeHandle: false,
                    })
                  )
                : null
            )
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
