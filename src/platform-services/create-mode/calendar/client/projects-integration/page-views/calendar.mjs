export const CALENDAR_PROJECTS_PAGE_CALENDAR_VIEW_SCRIPT = `
        function renderScheduleDetailPanel() {
          if (scheduleViewMode !== "setup") {
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
              React.createElement("div", { className: "playground-tasks-empty" },
                React.createElement(CalendarIcon, { width: 28, height: 28, strokeWidth: 1.75 }),
                React.createElement("div", { className: "playground-tasks-empty-title" }, "Create a scheduled task"),
                React.createElement("div", { className: "playground-tasks-empty-copy" }, "Click a day or time slot in the calendar to open the schedule editor here.")
              )
            );
          }

          const isEditing = scheduleEditorMode === "edit" && Boolean(scheduleDraft?.id);
          const scheduleStats = selectedScheduleSnapshot || scheduleDraft || buildProjectScheduleDraft(selectedProject);
          const statusMeta = getPlaygroundScheduleStatusMeta(scheduleStats);
          const panelTitle = scheduleDraft?.name || "New Scheduled Task";
          const dependencyCandidates = sortedTasks
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          const activeSchedulePriorityPresentation = getPlaygroundTaskPriorityPresentation(scheduleDraft?.priority);
          const activeScheduleColorPresentation = getPlaygroundTaskColorPresentation(scheduleDraft?.taskColor);
          const selectedScheduleAgent = agentsById[String(scheduleDraft?.agentId || "").trim()] || null;
          const activeScheduleProjectId = getPlaygroundScheduleProjectId(scheduleDraft);
          const activeScheduleProject = activeScheduleProjectId
            ? (projectsById[activeScheduleProjectId] || null)
            : null;
          const activeScheduleProjectLabel = activeScheduleProjectId
            ? (activeScheduleProject?.name || scheduleDraft?.contextName || scheduleDraft?.metadata?.projectName || activeScheduleProjectId)
            : "None";
          const activeScheduleEnvironmentDisplay = resolvePlaygroundTaskEnvironmentDisplay(scheduleDraft, { projectRecord: activeScheduleProject });
          const selectedScheduleEnvironment = activeScheduleEnvironmentDisplay.environmentId
            ? availableBacklogEnvironments.find((environment) => environment.id === activeScheduleEnvironmentDisplay.environmentId) || null
            : null;
          const activeScheduleReleaseId = String(scheduleDraft?.releaseId || "").trim();
          const activeScheduleReleaseLabel = activeScheduleReleaseId
            ? (releasesById[activeScheduleReleaseId]?.name || "Milestone")
            : "None";
          const activeScheduleTaskType = normalizePlaygroundTaskType(scheduleDraft?.taskType);
          const scheduleParentTaskId = normalizePlaygroundParentTaskId(scheduleDraft?.parentTaskId);
          const scheduleParentTask = scheduleParentTaskId ? (tasksById[scheduleParentTaskId] || null) : null;
          const scheduleParentTicketNumber = scheduleParentTask
            ? (taskTicketNumbersById[scheduleParentTask.id] || scheduleParentTask.ticketNumber || "000")
            : "";
          const scheduleParentLabel = scheduleParentTask
            ? (scheduleParentTicketNumber + " " + (scheduleParentTask.title || "Untitled Task"))
            : "Choose parent";
          const activeScheduleTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === activeScheduleTaskType)?.label || "Task";
          const ActiveScheduleTypeIcon = activeScheduleTaskType === "subtask" ? Check : (activeScheduleTaskType === "loop" ? RefreshCw : Bookmark);
          const blockedByTaskId = normalizePlaygroundIdList(scheduleDraft?.dependencyIds)[0] || "";
          const activeBlockedByTask = blockedByTaskId ? (tasksById[blockedByTaskId] || null) : null;
          const activeBlockedByLabel = activeBlockedByTask
            ? ((taskTicketNumbersById[activeBlockedByTask.id] || activeBlockedByTask.ticketNumber || "000") + " - " + (activeBlockedByTask.title || "Untitled Task"))
            : "None";
          const activeScheduleSummaryLabel = formatPlaygroundTaskScheduleSummary({
            scheduledStartAt: scheduleDraft?.scheduledTime || null,
            scheduleType: scheduleDraft?.scheduleType,
            cronExpression: scheduleDraft?.cronExpression,
            scheduleTimezone: scheduleDraft?.timezone,
            scheduleEnabled: scheduleDraft?.enabled,
          });
          const activeAssigneeActor = selectedScheduleAgent;
          const defaultScheduleAssigneePopupMode = taskDetailAvailableAssigneePopupModes.includes(getPlaygroundTaskAssigneePopupMode(activeAssigneeActor))
            ? getPlaygroundTaskAssigneePopupMode(activeAssigneeActor)
            : (taskDetailAvailableAssigneePopupModes[0] || "agents");
          const scheduleAttachments = normalizePlaygroundTaskAttachmentList(scheduleDraft?.attachments);
          const hasScheduleAttachments = scheduleAttachments.length > 0;
          const scheduleComments = normalizePlaygroundTaskCommentList(scheduleDraft?.comments)
            .slice()
            .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")));
          const scheduleSkillEntries = getEffectivePlaygroundTaskEnabledSkillIds(scheduleDraft)
            .map((skillId) => resolveTaskSkillItem(skillId))
            .filter(Boolean);
          const scheduleConnectorEntries = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, scheduleDraft);
            return {
              ...option,
              selection,
              valueLabel: selection?.valueLabel || "None",
            };
          });

          function toggleScheduleDetailSelectPopover(nextPopoverId) {
            setTaskDetailPopover("");
            if (nextPopoverId === "assignee" && taskDetailSelectPopover !== "assignee") {
              setTaskDetailAssigneePopupMode(defaultScheduleAssigneePopupMode);
            }
            setTaskDetailSelectPopover((current) => current === nextPopoverId ? "" : nextPopoverId);
          }

          function renderScheduleDetailSelectOptionRow({ key, label, description, selected, onClick, disabled = false }) {
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

          function renderScheduleDetailSelectControl({
            popoverId,
            valueLabel,
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
                onClick: () => toggleScheduleDetailSelectPopover(popoverId),
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

          function renderScheduleDetailAssigneeRow(actor) {
            const mode = getPlaygroundTaskAssigneePopupMode(actor);
            const IconComponent = mode === "teams" ? Layers : User;
            return React.createElement("button", {
                key: actor.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (scheduleDraft?.agentId === actor.id ? " selected" : ""),
                onClick: () => {
                  updateScheduleDraft((current) => ({
                    ...(current || buildProjectScheduleDraft(selectedProject)),
                    agentId: actor.id,
                    agentName: actor.name || null,
                  }));
                  setTaskDetailSelectPopover("");
                },
              },
              React.createElement(IconComponent, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", { className: "tb-popup-label" }, mode === "humans" ? "Me" : (actor.name || "Unknown")),
              React.createElement("span", { className: "tb-popup-check-slot" },
                scheduleDraft?.agentId === actor.id
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              )
            );
          }

          function renderScheduleTimingCard() {
            return React.createElement("div", {
                className: "playground-tasks-detail-facts playground-tasks-schedule-timing-card" + (taskScheduleDialogState ? " is-popover-open" : ""),
              },
              React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Schedule")
              ),
              React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "When"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    React.createElement("div", { className: "playground-tasks-schedule-anchor" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (activeScheduleSummaryLabel ? "" : " is-empty") + (taskScheduleDialogState ? " is-active" : ""),
                        onClick: () => openTaskScheduleDialog("schedule"),
                      },
                        React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeScheduleSummaryLabel || "None"),
                        React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                      ),
                      renderTaskScheduleDialog()
                    )
                  )
                )
              )
            );
          }

          return React.createElement("div", { className: "playground-tasks-detail-shell playground-tasks-schedule-detail-shell" },
            React.createElement("div", { className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : "") },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar" },
                React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title-meta" },
                    React.createElement("div", {
                      className: "playground-tasks-backlog-project-icon is-task",
                      "aria-hidden": "true",
                    },
                      React.createElement(Bookmark, { width: 14, height: 14, strokeWidth: 1.9 })
                    ),
                    renderPlaygroundTaskPriorityIcon(scheduleDraft?.priority, "playground-tasks-backlog-priority"),
                    React.createElement("span", { className: "playground-tasks-detail-navbar-ticket" }, isEditing ? "Schedule" : "New")
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-content-title playground-tasks-detail-navbar-title-input",
                      value: scheduleDraft?.name || "",
                      placeholder: panelTitle,
                      "aria-label": "Schedule title",
                      title: scheduleDraft?.name || panelTitle,
                      onChange: (event) => updateScheduleDraftField("name", event.target.value),
                    })
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" }),
                React.createElement("div", {
                    className: "playground-content-nav-right playground-tasks-detail-navbar-actions",
                    ref: taskDetailActionsRef,
                  },
                  React.createElement("span", { className: "playground-tasks-schedule-status " + statusMeta.className }, statusMeta.label),
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
                          isEditing
                            ? React.createElement("button", {
                                type: "button",
                                className: "tb-popup-row",
                                onClick: () => {
                                  setTaskDetailPopover("");
                                  void handleTriggerSchedule(scheduleDraft.id);
                                },
                              },
                                React.createElement(Play, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, "Run schedule now"),
                                  React.createElement("span", null, "Trigger this scheduled task immediately.")
                                )
                              )
                            : React.createElement("button", {
                                type: "button",
                                className: "tb-popup-row",
                                onClick: () => {
                                  setTaskDetailPopover("");
                                  closeScheduleDetail();
                                },
                              },
                                React.createElement(X, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, "Discard"),
                                  React.createElement("span", null, "Close this scheduled task draft.")
                                )
                              ),
                          isEditing
                            ? React.createElement("button", {
                                type: "button",
                                className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                                onClick: () => {
                                  setTaskDetailPopover("");
                                  void handleDeleteSchedule(scheduleDraft.id);
                                },
                              },
                                React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, "Delete"),
                                  React.createElement("span", null, "Remove this scheduled task from the project.")
                                )
                              )
                            : null
                        )
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain",
                    onClick: closeScheduleDetail,
                    title: "Close task detail",
                    "aria-label": "Close task detail",
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-body" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-tasks-schedule-side-scroll" },
                  scheduleSaveState.error
                    ? React.createElement("div", { className: "playground-environments-error" }, scheduleSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-detail-description" },
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
                            onMouseDown: (event) => event.preventDefault(),
                            onClick: () => handleScheduleTaskFormat(action.id),
                            title: action.label,
                            "aria-label": action.label,
                          }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isScheduleTaskEditing ? " is-editing" : " is-preview") },
                      !isScheduleTaskEditing
                        ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                            String(scheduleDraft?.task || "").trim()
                              ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                  content: scheduleDraft.task,
                                  className: "playground-tasks-detail-description-preview tb-message-markdown",
                                })
                              : React.createElement("div", {
                                  className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                }, "Add Description here")
                          )
                        : null,
                      React.createElement("textarea", {
                        ref: scheduleTaskTextareaRef,
                        className: "playground-tasks-detail-description-input " + (isScheduleTaskEditing ? "is-editing" : "is-preview"),
                        rows: 1,
                        placeholder: isScheduleTaskEditing ? "Add Description here" : "",
                        value: scheduleDraft?.task || "",
                        onFocus: () => setIsScheduleTaskEditing(true),
                        onChange: (event) => {
                          updateScheduleDraftField("task", event.target.value);
                          resizeTaskDescriptionTextarea(event.currentTarget);
                        },
                        onBlur: () => setIsScheduleTaskEditing(false),
                      })
                    )
                  ),
                  renderScheduleTimingCard(),
                  React.createElement("div", {
                    className: "playground-tasks-detail-facts playground-tasks-schedule-detail-facts"
                      + ((taskDetailSelectPopover || taskSkillsPopoverOpen) ? " is-popover-open" : ""),
                  },
                    React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-detail-facts-toggle" + (scheduleDetailsCollapsed ? " is-collapsed" : ""),
                        onClick: () => setScheduleDetailsCollapsed((current) => !current),
                        "aria-label": scheduleDetailsCollapsed ? "Expand details" : "Collapse details",
                        title: scheduleDetailsCollapsed ? "Expand details" : "Collapse details",
                      }, React.createElement(ChevronDown, { strokeWidth: 1.8 }))
                    ),
                    !scheduleDetailsCollapsed
                      ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Type"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("div", { className: "playground-tasks-type-control" },
                                renderScheduleDetailSelectControl({
                                  popoverId: "schedule-type",
                                  valueLabel: activeScheduleTaskType === "subtask" && scheduleParentTicketNumber
                                    ? ("Subtask to " + scheduleParentTicketNumber)
                                    : activeScheduleTypeLabel,
                                  buttonContent: React.createElement("span", {
                                      className: "playground-tasks-detail-type-value",
                                    },
                                      React.createElement(ActiveScheduleTypeIcon, { className: "playground-tasks-detail-type-icon", strokeWidth: 1.9 }),
                                      activeScheduleTaskType === "subtask"
                                        ? React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: "playground-tasks-detail-type-prefix" }, "Subtask to"),
                                            scheduleParentTicketNumber
                                              ? React.createElement("span", { className: "playground-tasks-detail-type-ticket", title: scheduleParentLabel }, scheduleParentTicketNumber)
                                              : null
                                          )
                                        : React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeScheduleTypeLabel)
                                    ),
                                  children: PLAYGROUND_TASK_TYPE_OPTIONS.map((option) =>
                                    renderScheduleDetailSelectOptionRow({
                                      key: option.id,
                                      label: option.label,
                                      selected: activeScheduleTaskType === option.id,
                                      onClick: () => {
                                        handleScheduleTaskTypeSelection(option.id);
                                        setTaskDetailSelectPopover("");
                                      },
                                    })
                                  ),
                                })
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Priority"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-priority",
                                valueLabel: activeSchedulePriorityPresentation.label,
                                  buttonContent: React.createElement("span", {
                                      className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + activeSchedulePriorityPresentation.toneClassName,
                                    },
                                    renderPlaygroundTaskPriorityGlyph(scheduleDraft?.priority),
                                    React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, activeSchedulePriorityPresentation.label)
                                  ),
                                children: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                                  renderScheduleDetailSelectOptionRow({
                                    key: option.id,
                                    label: getPlaygroundTaskPriorityPresentation(option.id).label,
                                    selected: scheduleDraft?.priority === option.id,
                                    onClick: () => {
                                      updateScheduleDraftField("priority", option.id);
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
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-color",
                                valueLabel: activeScheduleColorPresentation.label,
                                buttonContent: React.createElement("span", {
                                    className: "playground-tasks-detail-color-value",
                                    style: getPlaygroundTaskColorStyle(scheduleDraft?.taskColor),
                                  },
                                    React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                                    React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeScheduleColorPresentation.label)
                                  ),
                                children: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                                  renderScheduleDetailSelectOptionRow({
                                    key: option.id,
                                    label: React.createElement("span", {
                                        className: "playground-tasks-detail-select-popup-label-slot",
                                        style: getPlaygroundTaskColorStyle(option.id),
                                      },
                                        React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                                        React.createElement("span", null, option.label)
                                      ),
                                    selected: getPlaygroundTaskColorId(scheduleDraft?.taskColor) === option.id,
                                    onClick: () => {
                                      updateScheduleDraft((current) => ({
                                        ...(current || buildProjectScheduleDraft(selectedProject)),
                                        taskColor: option.id,
                                        metadata: {
                                          ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
                                          taskColor: option.id,
                                        },
                                      }));
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
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-release",
                                valueLabel: activeScheduleReleaseLabel,
                                isEmpty: !activeScheduleReleaseId,
                                children: [
                                  renderScheduleDetailSelectOptionRow({
                                    key: "__none__",
                                    label: "None",
                                    selected: !activeScheduleReleaseId,
                                    onClick: () => {
                                      updateScheduleDraftField("releaseId", null);
                                      setTaskDetailSelectPopover("");
                                    },
                                  }),
                                  ...releases
                                    .slice()
                                    .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                                    .map((release) =>
                                      renderScheduleDetailSelectOptionRow({
                                        key: release.id,
                                        label: release.name || "Untitled Milestone",
                                        description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                                        selected: activeScheduleReleaseId === release.id,
                                        onClick: () => {
                                          updateScheduleDraftField("releaseId", release.id);
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
                                  className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (!selectedScheduleAgent ? " is-empty" : "") + (taskDetailSelectPopover === "assignee" ? " is-active" : ""),
                                  onClick: () => toggleScheduleDetailSelectPopover("assignee"),
                                  title: selectedScheduleAgent?.name || "Choose agent",
                                  "aria-expanded": taskDetailSelectPopover === "assignee" ? "true" : "false",
                                },
                                  React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, selectedScheduleAgent?.name || "Choose agent"),
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
                                          ? filteredTaskDetailAssignableActors.map((actor) => renderScheduleDetailAssigneeRow(actor))
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
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Project"),
                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                    renderScheduleDetailSelectControl({
                      popoverId: "schedule-project",
                      valueLabel: activeScheduleProjectLabel,
                      isEmpty: !activeScheduleProjectId,
                      menuClassName: "playground-tasks-toolbar-popup-menu-wide",
                      children: [
                        renderScheduleDetailSelectOptionRow({
                          key: "__none__",
                          label: "None",
                          selected: !activeScheduleProjectId,
                          onClick: () => {
                            updateScheduleDraft((current) => ({
                              ...(current || buildProjectScheduleDraft(selectedProject)),
                              contextId: null,
                              contextName: null,
                              releaseId: null,
                              dependencyIds: [],
                              metadata: {
                                ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
                                projectId: null,
                                projectName: null,
                              },
                            }));
                            setTaskDetailSelectPopover("");
                          },
                        }),
                        ...projects
                          .slice()
                          .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                          .map((project) =>
                            renderScheduleDetailSelectOptionRow({
                              key: project.id,
                              label: project.name || "Untitled Project",
                              selected: activeScheduleProjectId === project.id,
                              onClick: () => {
                                updateScheduleDraft((current) => ({
                                  ...(current || buildProjectScheduleDraft(selectedProject)),
                                  contextId: project.id,
                                  contextName: project.name || null,
                                  releaseId: null,
                                  dependencyIds: [],
                                  metadata: {
                                    ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
                                    projectId: project.id,
                                    projectName: project.name || null,
                                  },
                                }));
                                setTaskDetailSelectPopover("");
                              },
                            })
                          ),
                      ],
                    })
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Computer"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-environment",
                                valueLabel: activeScheduleEnvironmentDisplay.label,
                                isEmpty: false,
                                menuClassName: "playground-tasks-toolbar-popup-menu-environment",
                                children: [
                                  renderScheduleDetailSelectOptionRow({
                                    key: "__project_default__",
                                    label: activeScheduleProject ? "Project Default" : "Default",
                                    description: selectedScheduleEnvironment?.name || (activeScheduleProject ? "Uses the project's default computer" : "Uses your default computer"),
                                    selected: !String(scheduleDraft?.environmentId || "").trim(),
                                    onClick: () => {
                                      updateScheduleDraft((current) => ({
                                        ...(current || buildProjectScheduleDraft(selectedProject)),
                                        environmentId: "",
                                        environmentName: null,
                                      }));
                                      setTaskDetailSelectPopover("");
                                    },
                                  }),
                                  ...availableBacklogEnvironments.map((environment) =>
                                    renderScheduleDetailSelectOptionRow({
                                      key: environment.id,
                                      label: environment.name + (environment.isDefault ? " (Default)" : ""),
                                      selected: String(scheduleDraft?.environmentId || "").trim() === environment.id,
                                      onClick: () => {
                                        updateScheduleDraft((current) => ({
                                          ...(current || buildProjectScheduleDraft(selectedProject)),
                                          environmentId: environment.id,
                                          environmentName: environment.name || null,
                                        }));
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
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-blocked-by",
                                valueLabel: activeBlockedByLabel,
                                isEmpty: !blockedByTaskId,
                                menuClassName: "playground-tasks-toolbar-popup-menu-wide",
                                children: [
                                  renderScheduleDetailSelectOptionRow({
                                    key: "__none__",
                                    label: "None",
                                    selected: !blockedByTaskId,
                                    onClick: () => {
                                      updateScheduleDraftField("dependencyIds", []);
                                      setTaskDetailSelectPopover("");
                                    },
                                  }),
                                  ...dependencyCandidates.map((task) => {
                                    const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                                    return renderScheduleDetailSelectOptionRow({
                                      key: task.id,
                                      label: taskTicketNumber + " - " + (task.title || "Untitled Task"),
                                      selected: blockedByTaskId === task.id,
                                      onClick: () => {
                                        updateScheduleDraftField("dependencyIds", [task.id]);
                                        setTaskDetailSelectPopover("");
                                      },
                                    });
                                  }),
                                ],
                              })
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-tasks-attachments" },
                    React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                      React.createElement("div", { className: "playground-tasks-attachments-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                          onClick: openTaskEnvironmentFilePicker,
                          disabled: taskAttachmentTransferState.isProcessing || !activeTaskEnvironmentId,
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
                      onChange: (event) => void handleTaskAttachmentInputChange(event),
                    }),
                    React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                      React.createElement("div", {
                        className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isTaskAttachmentDragging ? " dragging" : "") + (hasScheduleAttachments ? " is-filled" : ""),
                        onDragOver: (event) => {
                          event.preventDefault();
                          if (!activeTaskEnvironmentId) {
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
                        hasScheduleAttachments
                          ? React.createElement(React.Fragment, null,
                              React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                React.createElement("span", null, isTaskAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-tasks-attachments-browse",
                                  onClick: openTaskAttachmentPicker,
                                }, "browse.")
                              ),
                              React.createElement("div", { className: "runner-attachments" },
                                scheduleAttachments.map((attachment) =>
                                  renderTaskAttachmentChip(attachment, {
                                    removable: true,
                                    onRemove: handleRemoveScheduleAttachment,
                                  })
                                )
                              )
                            )
                          : React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-attachments-empty-button",
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
                                  const isEnabled = getEffectivePlaygroundTaskEnabledSkillIds(scheduleDraft).includes(skill.id);
                                  return React.createElement("button", {
                                      key: skill.id,
                                      type: "button",
                                      className: "tb-popup-row tb-popup-row-skill" + (isEnabled ? " selected" : ""),
                                      onClick: () => toggleScheduleSkill(skill.id),
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
                    scheduleSkillEntries.length > 0
                      ? React.createElement("div", { className: "playground-tasks-skills-list" },
                          scheduleSkillEntries.map((skill) =>
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
                                onClick: (event) => {
                                  event.stopPropagation();
                                  removeScheduleSkill(skill.id);
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
                      scheduleConnectorEntries.map((connector) =>
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
                        disabled: true,
                        title: "Scheduled tasks do not support subtasks yet",
                        "aria-label": "Add subtask",
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
                    ),
                    React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No subtasks yet.")
                  ),
                  React.createElement("div", { className: "playground-tasks-comments" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Comments"),
                    scheduleComments.length > 0
                      ? React.createElement("div", { className: "playground-tasks-comments-list" },
                          scheduleComments.map((comment) =>
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
                  scheduleSaveState.error
                    ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, scheduleSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-comment-runner" },
                    React.createElement("div", { className: "playground-tasks-comment-bar" },
                      React.createElement("textarea", {
                        ref: taskCommentTextareaRef,
                        rows: 1,
                        className: "playground-tasks-comment-input",
                        placeholder: "Add a comment",
                        value: taskCommentInputValue,
                        onChange: (event) => {
                          setTaskCommentInputValue(event.target.value);
                          resizeTaskCommentTextarea(event.currentTarget);
                        },
                        onKeyDown: (event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleAddScheduleComment();
                          }
                        },
                      }),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-comment-send-button",
                        onClick: handleAddScheduleComment,
                        disabled: scheduleSaveState.isSaving || !String(taskCommentInputValue || "").trim(),
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

        function isSamePlaygroundCalendarDay(left, right) {
          return left.getFullYear() === right.getFullYear()
            && left.getMonth() === right.getMonth()
            && left.getDate() === right.getDate();
        }

        function getPlaygroundCalendarWeekStart(date) {
          const nextDate = new Date(date);
          nextDate.setHours(0, 0, 0, 0);
          const weekday = nextDate.getDay();
          const offset = weekday === 0 ? -6 : 1 - weekday;
          nextDate.setDate(nextDate.getDate() + offset);
          return nextDate;
        }

        function isScheduleCalendarDateVisible(date, view) {
          const calendarDate = date instanceof Date ? date : new Date(date);
          if (!(calendarDate instanceof Date) || Number.isNaN(calendarDate.getTime())) {
            return false;
          }
          const today = new Date();
          if (view === "day") {
            return isSamePlaygroundCalendarDay(calendarDate, today);
          }
          if (view === "week") {
            return isSamePlaygroundCalendarDay(getPlaygroundCalendarWeekStart(calendarDate), getPlaygroundCalendarWeekStart(today));
          }
          return calendarDate.getFullYear() === today.getFullYear() && calendarDate.getMonth() === today.getMonth();
        }

        function renderScheduleCalendarToolbar(toolbarProps) {
          const currentView = allowedScheduleCalendarViews.includes(toolbarProps?.view) ? toolbarProps.view : "week";
          const isTodayActive = isScheduleCalendarDateVisible(toolbarProps?.date, currentView);

          return React.createElement("div", { className: "playground-tasks-calendar-toolbar" },
            React.createElement("div", { className: "playground-tasks-calendar-toolbar-main" },
              React.createElement("div", { className: "playground-tasks-board-heading" }, toolbarProps?.label || "Calendar")
            ),
            React.createElement("div", { className: "playground-tasks-calendar-toolbar-actions" },
              React.createElement("div", { className: "playground-tasks-calendar-nav-group" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-calendar-nav-button",
                  onClick: () => toolbarProps?.onNavigate?.("PREV"),
                  title: "Previous",
                  "aria-label": "Previous",
                }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-calendar-today-button" + (isTodayActive ? " is-active" : ""),
                  onClick: () => toolbarProps?.onNavigate?.("TODAY"),
                }, "Today"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-calendar-nav-button",
                  onClick: () => toolbarProps?.onNavigate?.("NEXT"),
                  title: "Next",
                  "aria-label": "Next",
                }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "content-mode-switch playground-tasks-nav playground-tasks-calendar-view-switch" },
                allowedScheduleCalendarViews.map((viewId) =>
                  React.createElement("button", {
                    key: viewId,
                    type: "button",
                    className: "content-mode-button" + (currentView === viewId ? " is-active" : ""),
                    onClick: () => toolbarProps?.onView?.(viewId),
                  }, viewId.charAt(0).toUpperCase() + viewId.slice(1))
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-tasks-calendar-toolbar-plus",
                onClick: () => openScheduleComposer(),
                title: "New scheduled task",
                "aria-label": "New scheduled task",
              }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 }))
            )
          );
        }

        function getProjectCalendarEventProps(event) {
          if (event?.resource?.kind === "metronome") {
            return {
              style: {
                "--playground-calendar-event-surface": "rgba(102, 166, 255, 0.14)",
                "--playground-calendar-event-text": "#dbeafe",
              },
            };
          }
          const eventColorId = event?.resource?.taskColor;
          if (!eventColorId) {
            return {};
          }
          const presentation = getPlaygroundTaskColorPresentation(eventColorId);
          return {
            style: {
              "--playground-calendar-event-surface": presentation.surface,
              "--playground-calendar-event-text": presentation.text,
            },
          };
        }

        function getProjectCalendarMetronomeWorkflowId(event) {
          const resource = event?.resource && typeof event.resource === "object" ? event.resource : {};
          const directWorkflowId = String(resource.workflowId || resource.workflow_id || "").trim();
          if (resource.kind === "metronome" && directWorkflowId) {
            return directWorkflowId;
          }
          const eventId = String(event?.id || "").trim();
          const prefixedMatch = eventId.match(/^metronome(?:-calendar)?:([^:]+)/);
          if (prefixedMatch?.[1]) {
            return prefixedMatch[1];
          }
          return "";
        }

        function renderProjectCalendarEvent({ event, title }) {
          const resource = event?.resource && typeof event.resource === "object" ? event.resource : {};
          if (resource.kind === "metronome") {
            const eventTitle = String(title || event?.title || "").trim() || "Metronome";
            return React.createElement("div", { className: "playground-tasks-calendar-event-inner is-metronome" },
              React.createElement("span", {
                  className: "playground-tasks-calendar-event-type-icon is-metronome",
                  "aria-hidden": "true",
                },
                React.createElement(Metronome, { strokeWidth: 1.8 })
              ),
              React.createElement("span", { className: "playground-tasks-calendar-event-title" }, eventTitle)
            );
          }
          const eventTaskType = normalizePlaygroundTaskType(resource.taskType || resource.metadata?.taskType);
          const EventTaskTypeIcon = eventTaskType === "subtask" ? Check : Bookmark;
          const eventPriority = resource.priority || resource.metadata?.priority || "medium";
          const eventTitle = String(title || event?.title || "").trim() || "Untitled Task";

          return React.createElement("div", { className: "playground-tasks-calendar-event-inner" },
            React.createElement("span", {
                className: "playground-tasks-calendar-event-type-icon " + (eventTaskType === "subtask" ? "is-subtask" : "is-task"),
                "aria-hidden": "true",
              },
              React.createElement(EventTaskTypeIcon, { strokeWidth: 1.8 })
            ),
            renderPlaygroundTaskPriorityIcon(eventPriority, "playground-tasks-calendar-event-priority"),
            React.createElement("span", { className: "playground-tasks-calendar-event-title" }, eventTitle)
          );
        }

        function renderCalendarView() {
          return React.createElement("div", { className: "playground-tasks-scheduler" + (activeScheduleCalendarView === "day" ? " is-day-view" : "") },
            React.createElement("div", { className: "playground-tasks-scheduler-main" },
              React.createElement("div", { className: "playground-tasks-scheduler-surface playground-tasks-scheduler-calendar-surface" },
                scheduleLoadState.status === "error"
                  ? React.createElement("div", { className: "playground-environments-error" },
                      React.createElement("span", null, scheduleLoadState.error || "Failed to load schedules."),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => void loadProjectSchedules(selectedProjectId),
                      }, "Retry")
                    )
                  : null,
                React.createElement(BigCalendar, {
                  localizer: playgroundCalendarLocalizer,
                  events: projectCalendarEvents,
                  startAccessor: "start",
                  endAccessor: "end",
                  style: { height: "100%" },
                  components: {
                    toolbar: renderScheduleCalendarToolbar,
                    event: renderProjectCalendarEvent,
                  },
                  views: allowedScheduleCalendarViews,
                  view: activeScheduleCalendarView,
                  onView: (nextView) => setScheduleCalendarView(allowedScheduleCalendarViews.includes(nextView) ? nextView : "week"),
                  date: scheduleCalendarDate,
                  onNavigate: setScheduleCalendarDate,
                  eventPropGetter: getProjectCalendarEventProps,
                  selectable: true,
                  onSelectSlot: (slotInfo) => openScheduleComposerFromSlot(slotInfo),
                  onSelectEvent: (event) => {
                    const metronomeWorkflowId = getProjectCalendarMetronomeWorkflowId(event);
                    if (metronomeWorkflowId) {
                      if (typeof onOpenProjectMetronomes === "function") {
                        onOpenProjectMetronomes({ workflowId: metronomeWorkflowId });
                      }
                      return;
                    }
                    if (event?.resource?.kind === "task") {
                      openTaskFromCalendar(event.resource.taskId);
                      return;
                    }
                    handleSelectSchedule(event?.resource?.id);
                  },
                })
              )
            )
          );
        }

`;
