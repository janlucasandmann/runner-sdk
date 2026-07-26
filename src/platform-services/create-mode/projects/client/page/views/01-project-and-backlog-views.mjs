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

        function renderProjectIssueComposerDialog() {
          if (!issueComposerOpen) {
            return null;
          }

          const normalizedIssueType = normalizePlaygroundTaskType(issueComposerDraft.taskType);
          const issueComposerTitle = normalizedIssueType === "subtask" ? "Create Subtask" : "Create Issue";
          const selectedDependencyId = normalizePlaygroundIdList(issueComposerDraft.dependencyIds)[0] || "";
          const parentTicketCandidates = tasks
            .filter((task) => {
              const taskType = normalizePlaygroundTaskType(task?.taskType || task?.type);
              return task?.id && ["task", "loop"].includes(taskType) && !isPlaygroundTaskTerminalStatus(task.status);
            })
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

          function renderIssueComposerDescriptionField() {
            return React.createElement(PlatformInstructionsEditor, {
              value: resolveTaskDescriptionAttachmentFiles(
                issueComposerDraft.description || "",
                issueComposerDraft.attachments
              ),
              onChange: handleIssueComposerDescriptionEditorChange,
              title: "Description",
              placeholder: "Describe the expected outcome, context, constraints, and acceptance criteria.",
              ariaLabel: "Issue description",
              editorRef: issueComposerDescriptionTextareaRef,
              historyKey: "new-issue-description:" + String(selectedProjectId || selectedProject?.id || "project"),
              stickyHeader: false,
              variant: "minimalistic-ui",
              contentVariant: "file-enabled",
              fileUpload: {
                upload: uploadIssueComposerDescriptionFiles,
                resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                disabled: issueComposerSaveState.isSaving || taskAttachmentTransferState.isProcessing,
                onRename: handleRenameIssueComposerDescriptionFile,
                onRemove: handleRemoveIssueComposerDescriptionFile,
              },
              className: "playground-new-issue-modal__description",
            });
          }

          function createIssueComposerSelectorOption({ value, label, description, leading = null, onSelect, disabled = false }) {
            return {
              value: String(value || ""),
              label,
              description: description || undefined,
              leading: leading || undefined,
              disabled,
              onSelect,
            };
          }

          function renderIssueComposerDetailSelectControl({
            popoverId,
            value,
            valueLabel,
            disabled = false,
            isEmpty = false,
            buttonContent = null,
            popupClassName = "",
            popupWidth = "min(300px, calc(100vw - 48px))",
            popupMaxHeight = "min(320px, calc(100vh - 120px))",
            options = [],
            emptyContent = "No options available.",
          }) {
            const normalizedPopoverId = String(popoverId || "").trim();
            const selectorOptions = Array.isArray(options) ? options.filter((option) => option?.value) : [];
            return React.createElement(PlatformSelector, {
              value: String(value || ""),
              options: selectorOptions,
              onValueChange: (_nextValue, option) => {
                if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
                setIssueComposerDetailSelectPopover("");
              },
              ariaLabel: "Select issue " + normalizedPopoverId.replace(/-/g, " "),
              label: buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
              placeholder: valueLabel,
              disabled,
              open: issueComposerDetailSelectPopover === normalizedPopoverId,
              onOpenChange: (nextOpen) => setIssueComposerDetailSelectPopover(nextOpen ? normalizedPopoverId : ""),
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent,
              popupWidth,
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight,
              className: "playground-tasks-detail-central-selector" + (isEmpty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: ("playground-tasks-detail-central-selector-popup " + popupClassName).trim(),
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

          function createIssueComposerActorSelectorOption(actor, options = {}) {
            const mode = getPlaygroundTaskAssigneePopupMode(actor);
            const actorLabel = getTaskAssigneeName(actor.id, actor.name || "Unknown");
            const actorDescription = options.reviewer
              ? (mode === "humans" ? "Human reviewer" : (mode === "teams" ? "Agent squad reviewer" : "Agent reviewer"))
              : (mode === "humans" ? "Human" : (mode === "teams" ? "Agent squad" : "Agent"));
            return createIssueComposerSelectorOption({
              value: actor.id,
              label: actorLabel,
              description: actorDescription,
              leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
              onSelect: () => {
                  if (options.reviewer) {
                    updateIssueComposerDraft((current) => ({
                      ...current,
                      reviewRequired: true,
                      reviewerAgentId: actor.id,
                    }));
                  } else {
                    updateIssueComposerField("assigneeAgentId", actor.id);
                  }
                },
            });
          }

          function renderIssueComposerDetailsSection() {
            const issueType = normalizePlaygroundTaskType(issueComposerDraft.taskType);
            const IssueTypeIcon = issueType === "subtask" ? Check : (issueType === "loop" ? RefreshCw : Bookmark);
            const issueTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === issueType)?.label || "Task";
            const issueStatus = issueComposerDraft.status === "blocked" ? "blocked" : "todo";
            const issueStatusPresentation = getPlaygroundTaskStatusPresentation(issueStatus);
            const issueStatusLabel = issueStatusPresentation.label;
            const issuePriorityPresentation = getPlaygroundTaskPriorityPresentation(issueComposerDraft.priority);
            const issueColorPresentation = getPlaygroundTaskColorPresentation(issueComposerDraft.taskColor);
            const selectedRelease = issueComposerDraft.releaseId ? releases.find((release) => release.id === issueComposerDraft.releaseId) || null : null;
            const selectedParentTaskId = normalizePlaygroundParentTaskId(issueComposerDraft.parentTaskId);
            const selectedParentTask = selectedParentTaskId ? tasks.find((task) => task.id === selectedParentTaskId) || null : null;
            const parentTaskLabel = selectedParentTask
              ? ((taskTicketNumbersById[selectedParentTask.id] || selectedParentTask.ticketNumber || "000") + " - " + (selectedParentTask.title || "Untitled Task"))
              : "Select ticket";
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
              React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                    renderIssueComposerDetailFact("Computer",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "computer",
                        value: selectedIssueEnvironment?.id || "",
                        valueLabel: issueEnvironmentLabel,
                        isEmpty: !selectedIssueEnvironment,
                        disabled: availableBacklogEnvironments.length === 0,
                        buttonContent: React.createElement("span", { className: "playground-tasks-detail-person-value" },
                          React.createElement(Monitor, { className: "playground-tasks-project-modal-environment-icon", strokeWidth: 1.8 }),
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueEnvironmentLabel)
                        ),
                        options: availableBacklogEnvironments.map((environment) =>
                          createIssueComposerSelectorOption({
                            value: environment.id,
                            label: (environment.name || environment.id) + (environment.isDefault ? " (Default)" : ""),
                            description: "Use this computer for this issue.",
                            onSelect: () => updateIssueComposerField("environmentId", environment.id),
                          })
                        ),
                        emptyContent: "No computers available.",
                      })
                    ),
                    renderIssueComposerDetailFact("Type",
                      React.createElement("div", { className: "playground-tasks-type-control" },
                        renderIssueComposerDetailSelectControl({
                          popoverId: "type",
                          value: issueType,
                          valueLabel: issueTypeLabel,
                          buttonContent: React.createElement("span", { className: "playground-tasks-detail-type-value" },
                            React.createElement(IssueTypeIcon, { className: "playground-tasks-detail-type-icon", strokeWidth: 1.9 }),
                            React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueTypeLabel)
                          ),
                          options: PLAYGROUND_TASK_TYPE_OPTIONS.map((option) => {
                            const OptionIcon = option.id === "subtask" ? Check : (option.id === "loop" ? RefreshCw : Bookmark);
                            return createIssueComposerSelectorOption({
                              value: option.id,
                              label: option.label,
                              leading: React.createElement(OptionIcon, { width: 16, height: 16, strokeWidth: 1.9 }),
                              onSelect: () => {
                                const nextType = normalizePlaygroundTaskType(option.id);
                                updateIssueComposerDraft((current) => ({
                                  ...current,
                                  taskType: nextType,
                                  parentTaskId: nextType === "subtask" ? current.parentTaskId : null,
                                }));
                              },
                            });
                          }),
                        })
                      )
                    ),
                    issueType === "subtask"
                      ? renderIssueComposerDetailFact("Subtask to",
                          renderIssueComposerDetailSelectControl({
                            popoverId: "subtask-to",
                            value: selectedParentTaskId || "",
                            valueLabel: parentTaskLabel,
                            isEmpty: !selectedParentTaskId,
                            popupWidth: "min(380px, calc(100vw - 48px))",
                            options: parentTicketCandidates.map((task) =>
                              createIssueComposerSelectorOption({
                                value: task.id,
                                label: (taskTicketNumbersById[task.id] || task.ticketNumber || "000") + " - " + (task.title || "Untitled Task"),
                                description: getPlaygroundTaskTypeLabel(task.taskType || task.type),
                                onSelect: () => updateIssueComposerField("parentTaskId", task.id),
                              })
                            ),
                            emptyContent: "No unfinished tasks or loops available.",
                          })
                        )
                      : null,
                    renderIssueComposerDetailFact("Status",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "status",
                        value: issueStatus,
                        valueLabel: issueStatusLabel,
                        buttonContent: renderPlaygroundTaskStatusValue(issueStatus, "playground-tasks-detail-status-value"),
                        options: PLAYGROUND_TASK_STATUS_OPTIONS
                          .filter((option) => ["todo", "blocked"].includes(option.id))
                          .map((option) => createIssueComposerSelectorOption({
                            value: option.id,
                            label: option.label,
                            leading: renderPlaygroundTaskStatusGlyph(option.id),
                            onSelect: () => {
                              updateIssueComposerDraft((current) => ({
                                ...current,
                                status: option.id,
                                dependencyIds: option.id === "blocked" ? normalizePlaygroundIdList(current.dependencyIds) : [],
                                completedAt: null,
                              }));
                            },
                          })),
                      })
                    ),
                    issueStatus === "blocked"
                      ? renderIssueComposerDetailFact("Blocked by",
                          renderIssueComposerDetailSelectControl({
                            popoverId: "blocked-by",
                            value: selectedDependencyId || "__none__",
                            valueLabel: dependencyLabel,
                            isEmpty: !selectedDependencyId,
                            popupWidth: "min(380px, calc(100vw - 48px))",
                            options: [
                              createIssueComposerSelectorOption({
                                value: "__none__",
                                label: "None",
                                onSelect: () => updateIssueComposerField("dependencyIds", []),
                              }),
                              ...dependencyCandidates.map((task) =>
                                createIssueComposerSelectorOption({
                                  value: task.id,
                                  label: (taskTicketNumbersById[task.id] || task.ticketNumber || "000") + " - " + (task.title || "Untitled Task"),
                                  onSelect: () => updateIssueComposerField("dependencyIds", [task.id]),
                                })
                              ),
                            ],
                          })
                        )
                      : null,
                    renderIssueComposerDetailFact("Priority",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "priority",
                        value: issueComposerDraft.priority,
                        valueLabel: issuePriorityPresentation.label,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + issuePriorityPresentation.toneClassName,
                          },
                          renderPlaygroundTaskPriorityGlyph(issueComposerDraft.priority),
                          React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, issuePriorityPresentation.label)
                        ),
                        options: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                          createIssueComposerSelectorOption({
                            value: option.id,
                            label: getPlaygroundTaskPriorityPresentation(option.id).label,
                            leading: renderPlaygroundTaskPriorityGlyph(option.id),
                            onSelect: () => updateIssueComposerField("priority", option.id),
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Color",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "color",
                        value: getPlaygroundTaskColorId(issueComposerDraft.taskColor),
                        valueLabel: issueColorPresentation.label,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-detail-color-value",
                            style: getPlaygroundTaskColorStyle(issueComposerDraft.taskColor),
                          },
                          React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueColorPresentation.label)
                        ),
                        options: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                          createIssueComposerSelectorOption({
                            value: option.id,
                            label: React.createElement("span", {
                                className: "playground-tasks-detail-select-popup-label-slot",
                                style: getPlaygroundTaskColorStyle(option.id),
                              },
                              React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                              React.createElement("span", null, option.label)
                            ),
                            onSelect: () => updateIssueComposerField("taskColor", option.id),
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Milestone",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "release",
                        value: selectedRelease?.id || "__none__",
                        valueLabel: selectedRelease ? (selectedRelease.name || "Untitled Milestone") : "None",
                        isEmpty: !selectedRelease,
                        options: [
                          createIssueComposerSelectorOption({
                            value: "__none__",
                            label: "None",
                            onSelect: () => updateIssueComposerField("releaseId", null),
                          }),
                          ...releases
                            .slice()
                            .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                            .map((release) =>
                              createIssueComposerSelectorOption({
                                value: release.id,
                                label: release.name || "Untitled Milestone",
                                description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                                onSelect: () => updateIssueComposerField("releaseId", release.id),
                              })
                            ),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Assignee",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "assignee",
                        value: issueComposerDraft.assigneeAgentId || "__none__",
                        valueLabel: assigneeLabel,
                        isEmpty: !selectedAssignee,
                        buttonContent: renderIssueComposerPersonValue(issueComposerDraft.assigneeAgentId, assigneeLabel),
                        popupClassName: "tb-popup-menu-inline-agent",
                        options: [
                          createIssueComposerSelectorOption({
                            value: "__none__",
                            label: "Unassigned",
                            onSelect: () => updateIssueComposerField("assigneeAgentId", null),
                          }),
                          ...assignableActors.map((actor) => createIssueComposerActorSelectorOption(actor)),
                        ],
                        emptyContent: "No assignees available.",
                      })
                    ),
                    renderIssueComposerDetailFact("Reviewer",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "reviewer",
                        value: issueComposerDraft.reviewRequired ? (issueComposerDraft.reviewerAgentId || "") : "__none__",
                        valueLabel: reviewerLabel,
                        isEmpty: !issueComposerDraft.reviewRequired,
                        buttonContent: renderIssueComposerPersonValue(issueComposerDraft.reviewRequired ? issueComposerDraft.reviewerAgentId : "", reviewerLabel),
                        popupClassName: "tb-popup-menu-inline-agent",
                        options: [
                          createIssueComposerSelectorOption({
                            value: "__none__",
                            label: "No review",
                            description: "Move directly to Done when work is done.",
                            onSelect: () => updateIssueComposerDraft((current) => ({
                              ...current,
                              reviewRequired: false,
                              reviewerAgentId: null,
                            })),
                          }),
                          ...assignableActors.map((actor) => createIssueComposerActorSelectorOption(actor, { reviewer: true })),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Schedule",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "schedule",
                        value: scheduleMode,
                        valueLabel: scheduleLabel,
                        isEmpty: scheduleMode === "none",
                        options: [
                          { id: "none", label: "None" },
                          { id: "one-time", label: "One-time" },
                          { id: "recurring", label: "Recurring" },
                        ].map((option) =>
                          createIssueComposerSelectorOption({
                            value: option.id,
                            label: option.label,
                            onSelect: () => {
                              updateIssueComposerDraft((current) => ({
                                ...current,
                                scheduledStartAt: option.id === "none" ? null : (current.scheduledStartAt || new Date().toISOString()),
                                scheduledEndAt: option.id === "none" ? null : current.scheduledEndAt,
                                scheduleType: option.id === "recurring" ? "recurring" : "one-time",
                                cronExpression: option.id === "recurring"
                                  ? (current.cronExpression || buildPlaygroundCronExpressionForPreset("daily", current.scheduledStartAt || Date.now()))
                                  : null,
                              }));
                            },
                          })
                        ),
                      })
                    )
                  )
            );
          }

	          return React.createElement(PlatformModal, {
	            open: issueComposerOpen,
	            visible: issueComposerVisible,
	            closing: issueComposerClosing,
	            animationDurationMs: issueComposerAnimationMs,
	            onClose: () => closeProjectIssueComposer(),
	            as: "form",
	            size: "medium",
	            maxHeight: "80vh",
	            title: issueComposerTitle,
	            headerVariant: "search",
	            headerSearchProps: {
	              icon: Bookmark,
	              value: issueComposerDraft.title || "",
	              placeholder: "Issue title",
	              "aria-label": "Issue title",
	              autoComplete: "off",
	              onChange: (event) => updateIssueComposerField("title", event.target.value),
	              onKeyDown: (event) => {
	                if (
	                  event.key !== "Tab"
	                  || event.shiftKey
	                  || event.altKey
	                  || event.ctrlKey
	                  || event.metaKey
	                ) {
	                  return;
	                }
	                const descriptionTextarea = issueComposerDescriptionTextareaRef.current;
	                if (!descriptionTextarea) {
	                  return;
	                }
	                event.preventDefault();
	                descriptionTextarea.focus({ preventScroll: true });
	              },
	            },
	            className: "playground-new-issue-modal",
	            bodyClassName: "playground-new-issue-modal__body",
	            footerClassName: "playground-new-issue-modal__footer",
	            closeButtonLabel: "Close new issue",
	            closeButtonDisabled: issueComposerSaveState.isSaving,
	            surfaceProps: {
	              onSubmit: (event) => void handleSaveProjectIssue(event),
	            },
	            footer: React.createElement(React.Fragment, null,
	              React.createElement(PlatformSecondaryButton, {
	                type: "button",
	                size: "medium",
	                onClick: () => closeProjectIssueComposer(),
	                disabled: issueComposerSaveState.isSaving,
	              }, "Cancel"),
	              React.createElement(PlatformPrimaryButton, {
	                size: "medium",
	                type: "submit",
	                disabled: issueComposerSaveState.isSaving || !String(issueComposerDraft.title || "").trim(),
	              }, issueComposerSaveState.isSaving ? "Creating..." : issueComposerTitle)
	            ),
	          },
	            renderIssueComposerDescriptionField(),
	            renderIssueComposerDetailsSection(),
	            issueComposerSaveState.error
	              ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, issueComposerSaveState.error)
	              : null
	          );
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

          function renderProjectComposerNameControl() {
            return React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
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
            );
          }

          function renderProjectInitialSetupBody() {
            return React.createElement("div", { className: "playground-tasks-project-initial-setup-body" },
              renderProjectLeadSelector({ label: "Project lead" }),
              renderProjectBlueprintSelector(),
              renderProjectInitialGoalField()
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
                  renderProjectComposerNameControl(),
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
	                  ? renderProjectInitialSetupBody()
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
	                className: "playground-project-create-modal playground-tasks-project-initial-setup-modal",
	                bodyClassName: "playground-project-create-modal__body",
	                footer: React.createElement(React.Fragment, null,
	                  React.createElement(PlatformSecondaryButton, {
	                    type: "button",
	                    size: "medium",
	                    onClick: () => closeProjectComposer(),
	                  }, "Cancel"),
	                  React.createElement(PlatformPrimaryButton, {
	                    type: "submit",
	                    size: "medium",
	                    disabled: projectSaveState.isSaving || !String(projectDraft.name || "").trim(),
	                  }, projectSaveState.isSaving ? "Creating..." : "Create Project")
	                ),
	                animationDurationMs: projectInitialSetupModalAnimationMs,
	                onClose: () => closeProjectComposer(),
	                surfaceProps: {
	                  onKeyDown: handleComposerSubmitShortcut,
	                  onSubmit: (event) => void handleCreateProject(event),
	                },
	              },
	              React.createElement("div", { className: "playground-project-create-modal__identity" },
	                renderProjectComposerNameControl(),
	                renderProjectComposerEnvironmentPicker()
	              ),
	              renderProjectInitialSetupBody(),
	              projectSaveState.error
	                ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, projectSaveState.error)
	                : null
	            );
	          }

	          return React.createElement(PlatformModalBackdrop, {
	              className: "playground-tasks-project-modal-backdrop",
	              onClick: () => closeProjectComposer(),
	            },
	            projectComposerForm
`;
