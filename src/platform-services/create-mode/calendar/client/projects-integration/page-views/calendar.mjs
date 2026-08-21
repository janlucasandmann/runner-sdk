export const CALENDAR_PROJECTS_PAGE_CALENDAR_VIEW_SCRIPT = `
        function renderScheduleActionsMenu(schedule, {
          persisted = true,
          closeMenu = () => {},
          discardDraft = closeScheduleDetail,
        } = {}) {
          return React.createElement(React.Fragment, null,
            persisted
              ? React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => {
                    closeMenu();
                    void handleTriggerSchedule(schedule.id);
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
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => {
                    closeMenu();
                    discardDraft();
                  },
                },
                  React.createElement(X, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, "Discard"),
                    React.createElement("span", null, "Close this scheduled task draft.")
                  )
                ),
            persisted
              ? React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => {
                    closeMenu();
                    void handleDeleteSchedule(schedule.id);
                  },
                },
                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, "Delete"),
                    React.createElement("span", null, "Remove this scheduled task from the project.")
                  )
                )
              : null
          );
        }

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
          const activeScheduleTargetType = normalizePlaygroundScheduleTargetType(scheduleDraft?.targetType);
          const scheduleExecutionAction = isEditing
            ? getPlaygroundScheduleExecutionAction(
                scheduleDraft,
                selectedScheduleOccurrenceAt,
                scheduleCurrentTime,
                scheduleExecutionThreadCandidates
              )
            : null;
          const ScheduleFooterIcon = scheduleExecutionAction
            ? (activeScheduleTargetType === "workflow"
              ? Metronome
              : activeScheduleTargetType === "loop"
                ? RefreshCw
                : activeScheduleTargetType === "batch"
                  ? Truck
                  : MessageSquare)
            : Bookmark;
          const panelTitle = scheduleDraft?.name || (activeScheduleTargetType === "workflow"
            ? "New Scheduled Workflow"
            : activeScheduleTargetType === "loop"
              ? "New Scheduled Loop"
              : activeScheduleTargetType === "batch"
                ? "New Scheduled Batch"
                : "New Scheduled Task");
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
          const activeScheduleTypeLabel = PLAYGROUND_CALENDAR_SCHEDULE_TARGET_OPTIONS.find((option) => option.id === activeScheduleTargetType)?.label || "Task";
          const ActiveScheduleTypeIcon = activeScheduleTargetType === "workflow"
            ? Metronome
            : activeScheduleTargetType === "loop"
              ? RefreshCw
              : activeScheduleTargetType === "batch"
                ? Truck
                : Bookmark;
          const selectedScheduleWorkflowId = String(scheduleDraft?.workflowId || "").trim();
          const selectedScheduleWorkflow = selectedScheduleWorkflowId
            ? calendarMetronomeWorkflows.find((workflow) => workflow.id === selectedScheduleWorkflowId) || null
            : null;
          const selectedScheduleBatchJobId = String(scheduleDraft?.batchJobId || "").trim();
          const selectedScheduleBatchJob = selectedScheduleBatchJobId
            ? calendarBatchJobs.find((job) => job.id === selectedScheduleBatchJobId) || null
            : null;
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
          const effectiveScheduleSkillIds = getEffectiveScheduleEnabledSkillIds(scheduleDraft);
          const scheduleSkillEntries = effectiveScheduleSkillIds
            .map((skillId) => resolveTaskSkillItem(skillId))
            .filter(Boolean);
          const scheduleSystemSkillIds = getScheduleSystemSkillIds();
          const allScheduleSystemSkillsEnabled = scheduleSystemSkillIds.length > 0
            && scheduleSystemSkillIds.every((skillId) => effectiveScheduleSkillIds.includes(skillId));
          const scheduleConnectorSelectionCount = Object.values(
            normalizePlaygroundTaskConnectorSelections(scheduleDraft?.connectors)
          ).filter(Boolean).length;
          const scheduleValidationError = getScheduleDraftValidationError(scheduleDraft);

          function createScheduleDetailSelectorOption({ value, label, description, leading = null, trailing = null, onSelect, disabled = false }) {
            return {
              value: String(value || ""),
              label,
              description: description || undefined,
              leading: leading || undefined,
              trailing: trailing || undefined,
              disabled,
              onSelect,
            };
          }

          function renderScheduleDetailSelectControl({
            popoverId,
            value,
            valueLabel,
            disabled = false,
            isEmpty = false,
            buttonContent = null,
            popupClassName = "",
            popupHeader = null,
            popupHeaderClassName = "",
            popupContent = null,
            popupAriaLabel = "",
            open = null,
            onOpenChange = null,
            popupWidth = "min(280px, calc(100vw - 48px))",
            popupMaxHeight = "min(320px, calc(100vh - 120px))",
            options = [],
            emptyContent = "No options available.",
          }) {
            const normalizedPopoverId = String(popoverId || "").trim();
            const hasControlledOpenState = typeof open === "boolean";
            const isOpen = hasControlledOpenState ? open : taskDetailSelectPopover === normalizedPopoverId;
            const selectorOptions = Array.isArray(options) ? options.filter((option) => option?.value) : [];
            return React.createElement(PlatformSelector, {
              value: String(value || ""),
              options: selectorOptions,
              onValueChange: (_nextValue, option) => {
                if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
              },
              ariaLabel: "Select calendar event " + normalizedPopoverId.replace(/-/g, " "),
              label: buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
              placeholder: valueLabel,
              disabled,
              open: isOpen,
              onOpenChange: (nextOpen) => {
                setTaskDetailPopover("");
                setTaskSkillsPopoverOpen(false);
                if (nextOpen && normalizedPopoverId === "schedule-assignee") {
                  setTaskDetailAssigneePopupMode(defaultScheduleAssigneePopupMode);
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
              popupHeaderClassName,
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

          function renderScheduleTimingCard() {
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Schedule"),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                renderScheduleDetailSelectControl({
                  popoverId: "schedule-timing",
                  value: activeScheduleSummaryLabel || "__none__",
                  valueLabel: activeScheduleSummaryLabel || "None",
                  isEmpty: !activeScheduleSummaryLabel,
                  open: Boolean(taskScheduleDialogState) && taskScheduleDialogPhase !== "exit",
                  onOpenChange: (nextOpen) => {
                    if (nextOpen) {
                      if (!taskScheduleDialogState) {
                        openTaskScheduleDialog("schedule");
                      }
                      return;
                    }
                    if (taskScheduleDialogState) {
                      closeTaskScheduleDialog();
                    }
                  },
                  popupContent: renderTaskScheduleDialog({ embedded: true }),
                  popupAriaLabel: "Edit calendar event schedule",
                  popupClassName: "playground-tasks-schedule-selector-popup",
                  popupWidth: "min(320px, calc(100vw - 48px))",
                  popupMaxHeight: "min(520px, calc(100vh - 96px))",
                })
              )
            );
          }

          function renderScheduleSkillsControl() {
            const selectedSkillLabel = scheduleSkillEntries.length > 0
              ? scheduleSkillEntries.length + " skill" + (scheduleSkillEntries.length === 1 ? "" : "s")
              : "None";
            return renderScheduleDetailSelectControl({
              popoverId: "schedule-skills",
              value: "__skills__",
              valueLabel: selectedSkillLabel,
              isEmpty: scheduleSkillEntries.length === 0,
              popupHeader: React.createElement(PlatformSwitch, {
                className: "playground-tasks-schedule-skills-source-switch",
                ariaLabel: "Skill source",
                value: taskSkillsTab,
                fullWidth: true,
                options: [
                  { value: "system", label: "System" },
                  { value: "custom", label: "Custom" },
                ],
                onValueChange: setTaskSkillsTab,
              }),
              popupContent: React.createElement("div", {
                  className: "tb-popup-panel-section tb-popup-panel-section-skills-body",
                },
                React.createElement("div", { className: "playground-tasks-schedule-skills-list" },
                  (taskSkillsTab === "system" ? taskSystemSkillItems : taskCustomSkillItems).map((skill) => {
                    const isEnabled = effectiveScheduleSkillIds.includes(skill.id);
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
                ),
                taskSkillsTab === "system"
                  ? React.createElement("div", { className: "playground-tasks-schedule-skills-all" },
                      React.createElement("span", { className: "playground-tasks-schedule-skills-all-label" }, "All system skills"),
                      React.createElement(PlatformToggle, {
                        "aria-label": "Use all system skills",
                        checked: allScheduleSystemSkillsEnabled,
                        disabled: scheduleSystemSkillIds.length === 0,
                        onCheckedChange: setAllScheduleSystemSkillsEnabled,
                      })
                    )
                  : null
              ),
              popupAriaLabel: "Choose calendar event skills",
              popupClassName: "playground-tasks-detail-skills-selector-popup",
              popupWidth: "min(360px, calc(100vw - 48px))",
              popupMaxHeight: "min(460px, calc(100vh - 96px))",
            });
          }

          function renderScheduleProjectFact() {
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Project"),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                renderScheduleDetailSelectControl({
                  popoverId: "schedule-project",
                  value: activeScheduleProjectId || "__none__",
                  valueLabel: activeScheduleProjectLabel,
                  isEmpty: !activeScheduleProjectId,
                  popupClassName: "playground-tasks-detail-project-selector-popup",
                  options: [
                    createScheduleDetailSelectorOption({
                      value: "__none__",
                      label: "None",
                      onSelect: () => {
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
                        createScheduleDetailSelectorOption({
                          value: project.id,
                          label: project.name || "Untitled Project",
                          leading: React.createElement(Folder, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                          onSelect: () => {
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
            );
          }

          function renderScheduleMilestoneFact() {
            if (!activeScheduleProjectId) return null;
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Milestone"),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                renderScheduleDetailSelectControl({
                  popoverId: "schedule-release",
                  value: activeScheduleReleaseId || "__none__",
                  valueLabel: activeScheduleReleaseLabel,
                  isEmpty: !activeScheduleReleaseId,
                  options: [
                    createScheduleDetailSelectorOption({
                      value: "__none__",
                      label: "None",
                      onSelect: () => {
                        updateScheduleDraftField("releaseId", null);
                        setTaskDetailSelectPopover("");
                      },
                    }),
                    ...releases
                      .slice()
                      .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                      .map((release) =>
                        createScheduleDetailSelectorOption({
                          value: release.id,
                          label: release.name || "Untitled Milestone",
                          description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                          onSelect: () => {
                            updateScheduleDraftField("releaseId", release.id);
                            setTaskDetailSelectPopover("");
                          },
                        })
                      ),
                  ],
                })
              )
            );
          }

          function renderScheduleBlockedByFact() {
            if (!activeScheduleProjectId) return null;
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Blocked by"),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                renderScheduleDetailSelectControl({
                  popoverId: "schedule-blocked-by",
                  value: blockedByTaskId || "__none__",
                  valueLabel: activeBlockedByLabel,
                  isEmpty: !blockedByTaskId,
                  popupClassName: "playground-tasks-detail-blocked-by-selector-popup",
                  options: [
                    createScheduleDetailSelectorOption({
                      value: "__none__",
                      label: "None",
                      onSelect: () => {
                        updateScheduleDraftField("dependencyIds", []);
                        setTaskDetailSelectPopover("");
                      },
                    }),
                    ...dependencyCandidates.map((task) => {
                      const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                      return createScheduleDetailSelectorOption({
                        value: task.id,
                        label: taskTicketNumber + " - " + (task.title || "Untitled Task"),
                        onSelect: () => {
                          updateScheduleDraftField("dependencyIds", [task.id]);
                          setTaskDetailSelectPopover("");
                        },
                      });
                    }),
                  ],
                })
              )
            );
          }

          function renderScheduleConnectorsFact() {
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Connectors"),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "small",
                  className: "playground-tasks-detail-connector-button" + (scheduleConnectorSelectionCount > 0 ? "" : " is-empty"),
                  onClick: openTaskEnvironmentFilePicker,
                },
                  React.createElement(Link2, { className: "playground-tasks-connector-service-icon", width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  scheduleConnectorSelectionCount > 0
                    ? scheduleConnectorSelectionCount + " source" + (scheduleConnectorSelectionCount === 1 ? "" : "s")
                    : "Add data"
                )
              )
            );
          }

          function renderScheduleWorkflowPicker() {
            const workflowLabel = selectedScheduleWorkflow?.name || scheduleDraft?.workflowName || "Choose workflow";
            const normalizedWorkflowSearchQuery = String(scheduleWorkflowSearchQuery || "").trim().toLowerCase();
            const visibleWorkflows = calendarMetronomeWorkflows
              .filter((workflow) => {
                if (!normalizedWorkflowSearchQuery) return true;
                return [workflow.name, workflow.description, workflow.status]
                  .map((value) => String(value || "").toLowerCase())
                  .some((value) => value.includes(normalizedWorkflowSearchQuery));
              })
              .slice()
              .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
            return React.createElement("section", {
                className: "playground-tasks-schedule-workflow-picker",
                "aria-label": "Workflow",
              },
              React.createElement("div", { className: "playground-tasks-schedule-workflow-picker-label" }, "Workflow"),
              renderScheduleDetailSelectControl({
                popoverId: "schedule-workflow",
                value: selectedScheduleWorkflowId || "__none__",
                valueLabel: workflowLabel,
                isEmpty: !selectedScheduleWorkflowId,
                popupClassName: "playground-tasks-schedule-workflow-selector-popup",
                popupWidth: "min(420px, calc(100vw - 48px))",
                popupHeader: React.createElement(PlatformPopupSearchHeader, {
                  value: scheduleWorkflowSearchQuery,
                  onChange: (event) => setScheduleWorkflowSearchQuery(event.target.value),
                  placeholder: "Search workflows...",
                  autoFocus: taskDetailSelectPopover === "schedule-workflow",
                  "aria-label": "Search Metronome workflows",
                }),
                popupHeaderClassName: "is-search-header",
                onOpenChange: (nextOpen) => {
                  setTaskDetailSelectPopover(nextOpen ? "schedule-workflow" : "");
                  if (!nextOpen) {
                    setScheduleWorkflowSearchQuery("");
                  }
                },
                emptyContent: normalizedWorkflowSearchQuery
                  ? "No matching workflows."
                  : "No Metronome workflows available.",
                options: visibleWorkflows
                  .map((workflow) => createScheduleDetailSelectorOption({
                    value: workflow.id,
                    label: workflow.name || "Untitled Workflow",
                    description: workflow.status === "active" ? "Active" : workflow.status === "paused" ? "Paused" : "Draft",
                    leading: React.createElement(Metronome, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    onSelect: () => {
                      updateScheduleDraft((current) => {
                        const base = current || buildProjectScheduleDraft(selectedProject);
                        const workflowName = workflow.name || "Untitled Workflow";
                        return {
                          ...base,
                          task: "Run workflow: " + workflowName,
                          targetType: "workflow",
                          taskType: "task",
                          parentTaskId: null,
                          workflowId: workflow.id,
                          workflowName,
                          metadata: {
                            ...((base.metadata && typeof base.metadata === "object" && !Array.isArray(base.metadata)) ? base.metadata : {}),
                            scheduleTargetType: "workflow",
                            targetKind: "metronome_run",
                            workflowId: workflow.id,
                            workflowName,
                            workflowVersionId: null,
                            workflowContractId: null,
                            workflowTriggerType: null,
                            workflowInput: null,
                            workflowInputValues: null,
                          },
                        };
                      });
                      setTaskDetailSelectPopover("");
                    },
                  })),
              })
            );
          }

          function renderScheduleBatchPicker() {
            const batchLabel = selectedScheduleBatchJob?.name || scheduleDraft?.batchJobName || "Choose Batch job";
            const normalizedBatchSearchQuery = String(scheduleBatchSearchQuery || "").trim().toLowerCase();
            const visibleBatchJobs = calendarBatchJobs
              .filter((job) => {
                if (!normalizedBatchSearchQuery) return true;
                return [job.name, job.description, job.targetKind, job.status]
                  .map((value) => String(value || "").toLowerCase())
                  .some((value) => value.includes(normalizedBatchSearchQuery));
              });
            return React.createElement("section", {
                className: "playground-tasks-schedule-workflow-picker playground-tasks-schedule-batch-picker",
                "aria-label": "Batch job",
              },
              React.createElement("div", { className: "playground-tasks-schedule-workflow-picker-label" }, "Batch"),
              renderScheduleDetailSelectControl({
                popoverId: "schedule-batch",
                value: selectedScheduleBatchJobId || "__none__",
                valueLabel: batchLabel,
                isEmpty: !selectedScheduleBatchJobId,
                popupClassName: "playground-tasks-schedule-workflow-selector-popup playground-tasks-schedule-batch-selector-popup",
                popupWidth: "min(420px, calc(100vw - 48px))",
                popupHeader: React.createElement(PlatformPopupSearchHeader, {
                  value: scheduleBatchSearchQuery,
                  onChange: (event) => setScheduleBatchSearchQuery(event.target.value),
                  placeholder: "Search Batch jobs...",
                  autoFocus: taskDetailSelectPopover === "schedule-batch",
                  "aria-label": "Search Batch jobs",
                }),
                popupHeaderClassName: "is-search-header",
                onOpenChange: (nextOpen) => {
                  setTaskDetailSelectPopover(nextOpen ? "schedule-batch" : "");
                  if (nextOpen) {
                    void loadCalendarBatchJobs();
                  } else {
                    setScheduleBatchSearchQuery("");
                  }
                },
                emptyContent: calendarBatchJobsLoadState.status === "loading"
                  ? "Loading Batch jobs..."
                  : calendarBatchJobsLoadState.status === "error"
                    ? (calendarBatchJobsLoadState.error || "Batch jobs could not be loaded.")
                    : normalizedBatchSearchQuery
                      ? "No matching Batch jobs."
                      : "No shelf Batch jobs available.",
                options: visibleBatchJobs.map((job) => createScheduleDetailSelectorOption({
                  value: job.id,
                  label: job.name || "Untitled Batch",
                  description: job.startPolicy === "stay_on_shelf"
                    ? "Stay on shelf"
                    : "Keep on shelf",
                  leading: React.createElement(Truck, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  onSelect: () => {
                    updateScheduleDraft((current) => {
                      const base = current || buildProjectScheduleDraft(selectedProject);
                      const batchJobName = job.name || "Untitled Batch";
                      return {
                        ...base,
                        task: "Start Batch job: " + batchJobName,
                        targetType: "batch",
                        taskType: "task",
                        parentTaskId: null,
                        workflowId: null,
                        workflowName: null,
                        batchJobId: job.id,
                        batchJobName,
                        metadata: {
                          ...((base.metadata && typeof base.metadata === "object" && !Array.isArray(base.metadata)) ? base.metadata : {}),
                          scheduleTargetType: "batch",
                          targetKind: "batch_job",
                          workflowId: null,
                          workflowName: null,
                          workflowVersionId: null,
                          workflowContractId: null,
                          workflowTriggerType: null,
                          workflowInput: null,
                          workflowInputValues: null,
                          batchJobId: job.id,
                          batchJobName,
                        },
                      };
                    });
                    setTaskDetailSelectPopover("");
                  },
                })),
              })
            );
          }

          function renderScheduleWorkflowConfiguration() {
            const workflowInputs = selectedScheduleWorkflowId && scheduleWorkflowRunState.status === "ready"
              ? React.createElement(PlatformMetronomeManualRunInputs, {
                  contracts: scheduleWorkflowRunState.contracts,
                  contractId: scheduleWorkflowRunState.contractId,
                  values: scheduleWorkflowRunState.values,
                  disabled: scheduleSaveState.isSaving,
                  onContractChange: handleScheduleWorkflowContractChange,
                  onValueChange: updateScheduleWorkflowRunValue,
                  onComposerSubmit: () => false,
                  renderComposerInput: ({ contract, value, disabled }) => React.createElement(PlatformInstructionsEditor, {
                    value: resolveTaskDescriptionAttachmentFiles(
                      String(value || ""),
                      scheduleDraft?.attachments
                    ),
                    onChange: handleScheduleWorkflowPromptEditorChange,
                    title: "Description",
                    placeholder: contract.inputFields[0]?.placeholder || "Add workflow input here",
                    ariaLabel: "Scheduled workflow input",
                    historyKey: "calendar-workflow-input:" + String(scheduleDraft?.id || "new") + ":" + contract.id,
                    variant: "minimalistic-ui",
                    contentVariant: "file-enabled",
                    readOnly: disabled,
                    fileUpload: {
                      upload: uploadScheduleDescriptionFiles,
                      resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                      disabled: disabled || taskAttachmentTransferState.isProcessing,
                      onActivate: (file) => {
                        const attachment = scheduleAttachments.find((item) =>
                          item.id === String(file?.attachmentId || "")
                        ) || null;
                        if (attachment) {
                          handleTaskAttachmentPreviewToggle(
                            buildResolvedTaskAttachmentRecord(attachment) || attachment
                          );
                        }
                      },
                      onRename: handleRenameScheduleDescriptionFile,
                      onRemove: handleRemoveScheduleDescriptionFile,
                    },
                    onEditingChange: setIsScheduleTaskEditing,
                  }),
                })
              : null;
            const hasStructuredWorkflowParameters = Boolean(
              activeScheduleWorkflowContract
              && Array.isArray(activeScheduleWorkflowContract.inputFields)
              && activeScheduleWorkflowContract.inputFields.some((field) => field.id !== "prompt")
            );
            return React.createElement(React.Fragment, null,
              renderScheduleWorkflowPicker(),
              selectedScheduleWorkflowId && scheduleWorkflowRunState.status === "loading"
                ? React.createElement(PlatformLoadingState, {
                    centered: true,
                    className: "playground-tasks-schedule-workflow-loading",
                    message: "Loading workflow inputs...",
                  })
                : null,
              selectedScheduleWorkflowId && scheduleWorkflowRunState.status === "error"
                ? React.createElement("div", {
                    className: "playground-environments-error playground-tasks-schedule-workflow-error",
                  }, scheduleWorkflowRunState.error || "Workflow inputs could not be loaded.")
                : null,
              workflowInputs && hasStructuredWorkflowParameters
                ? React.createElement("section", {
                    className: "playground-tasks-schedule-workflow-parameters",
                    "aria-label": "Parameters",
                  },
                    React.createElement("div", {
                      className: "playground-tasks-detail-section-title playground-tasks-schedule-workflow-parameters-title",
                    }, "Parameters"),
                    workflowInputs
                  )
                : workflowInputs
            );
          }

          return React.createElement("div", {
              className: "playground-tasks-detail-shell playground-tasks-schedule-detail-shell" + (previewedTaskAttachment ? " is-preview-open" : ""),
            },
            React.createElement("div", {
                className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
                ref: taskDetailMainRef,
              },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar" },
                React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title-meta" },
                    React.createElement("div", {
                      className: "playground-tasks-backlog-project-icon is-" + activeScheduleTargetType,
                      "aria-hidden": "true",
                    },
                      React.createElement(ActiveScheduleTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 })
                    ),
                    renderPlaygroundTaskPriorityIcon(scheduleDraft?.priority, "playground-tasks-backlog-priority")
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                    React.createElement("div", {
                      className: "playground-content-title playground-tasks-schedule-navbar-title",
                      title: scheduleDraft?.name || panelTitle,
                    }, scheduleDraft?.name || panelTitle)
                  )
                ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", {
                    className: "playground-content-nav-right playground-tasks-detail-navbar-actions",
                    ref: taskDetailActionsRef,
                  },
                  React.createElement(PlatformPopup, {
                      open: taskDetailPopover === "menu",
                      rootClassName: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell",
                      surfaceClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide",
                      surfaceProps: {
                        role: "menu",
                        "aria-label": "Schedule actions",
                      },
                      animation: "down-in",
                      variant: "minimal",
                      placement: "bottom-end",
                      trigger: React.createElement("button", {
                        type: "button",
                        className: "playground-files-header-icon-button is-plain" + (taskDetailPopover === "menu" ? " is-active" : ""),
                        onClick: (event) => {
                          event.stopPropagation();
                          setTaskDetailPopover((current) => current === "menu" ? "" : "menu");
                        },
                        title: "Schedule actions",
                        "aria-label": "Schedule actions",
                        "aria-haspopup": "menu",
                        "aria-expanded": taskDetailPopover === "menu" ? "true" : "false",
                      }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    },
                    renderScheduleActionsMenu(scheduleDraft, {
                      persisted: isEditing,
                      closeMenu: () => setTaskDetailPopover(""),
                    })
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
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                  scheduleSaveState.error
                    ? React.createElement("div", { className: "playground-environments-error" }, scheduleSaveState.error)
                    : null,
                  React.createElement("section", {
                      className: "playground-tasks-schedule-identity",
                      "aria-label": "Schedule identity",
                    },
                    React.createElement("div", { className: "playground-tasks-schedule-identity-copy" },
                      React.createElement("input", {
                        ref: scheduleTitleInputRef,
                        type: "text",
                        className: "playground-tasks-schedule-identity-name-input",
                        value: scheduleDraft?.name || "",
                        placeholder: panelTitle,
                        "aria-label": "Schedule title",
                        onChange: (event) => updateScheduleDraftField("name", event.target.value),
                      }),
                      React.createElement("textarea", {
                        className: "playground-tasks-schedule-identity-description-input",
                        value: scheduleDraft?.description || "",
                        placeholder: "Add a short description.",
                        "aria-label": "Schedule description",
                        rows: 2,
                        onChange: (event) => updateScheduleDraftField("description", event.target.value),
                      })
                    )
                  ),
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
                        "aria-expanded": scheduleDetailsCollapsed ? "false" : "true",
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
                                  value: activeScheduleTargetType,
                                  valueLabel: activeScheduleTypeLabel,
                                  buttonContent: React.createElement("span", {
                                      className: "playground-tasks-detail-type-value",
                                    },
                                      React.createElement("span", {
                                          className: "playground-tasks-detail-type-badge is-" + activeScheduleTargetType + " is-schedule-compact",
                                          "aria-hidden": "true",
                                        },
                                        React.createElement(ActiveScheduleTypeIcon, { width: 9, height: 9, strokeWidth: 1.9 })
                                      ),
                                      React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeScheduleTypeLabel)
                                    ),
                                  options: PLAYGROUND_CALENDAR_SCHEDULE_TARGET_OPTIONS.map((option) => {
                                    const OptionTypeIcon = option.id === "workflow"
                                      ? Metronome
                                      : option.id === "loop"
                                        ? RefreshCw
                                        : option.id === "batch"
                                          ? Truck
                                          : Bookmark;
                                    return createScheduleDetailSelectorOption({
                                      value: option.id,
                                      label: option.label,
                                      leading: React.createElement("span", {
                                          className: "playground-tasks-detail-type-badge is-" + option.id,
                                          "aria-hidden": "true",
                                        },
                                        React.createElement(OptionTypeIcon, { width: 10, height: 10, strokeWidth: 1.9 })
                                      ),
                                      onSelect: () => {
                                        handleScheduleTaskTypeSelection(option.id);
                                        setTaskDetailSelectPopover("");
                                      },
                                    });
                                  }),
                                })
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Priority"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-priority",
                                value: scheduleDraft?.priority || "medium",
                                valueLabel: activeSchedulePriorityPresentation.label,
                                  buttonContent: React.createElement("span", {
                                      className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + activeSchedulePriorityPresentation.toneClassName,
                                    },
                                    renderPlaygroundTaskPriorityGlyph(scheduleDraft?.priority),
                                    React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, activeSchedulePriorityPresentation.label)
                                  ),
                                options: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                                  createScheduleDetailSelectorOption({
                                    value: option.id,
                                    label: getPlaygroundTaskPriorityPresentation(option.id).label,
                                    leading: renderPlaygroundTaskPriorityGlyph(option.id),
                                    onSelect: () => {
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
                                value: getPlaygroundTaskColorId(scheduleDraft?.taskColor),
                                valueLabel: activeScheduleColorPresentation.label,
                                buttonContent: React.createElement("span", {
                                    className: "playground-tasks-detail-color-value",
                                    style: getPlaygroundTaskColorStyle(scheduleDraft?.taskColor),
                                  },
                                    React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" }),
                                    React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, activeScheduleColorPresentation.label)
                                  ),
                                options: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                                  createScheduleDetailSelectorOption({
                                    value: option.id,
                                    label: option.label,
                                    leading: React.createElement("span", {
                                        className: "playground-tasks-detail-color-value",
                                        style: getPlaygroundTaskColorStyle(option.id),
                                      },
                                      React.createElement("span", { className: "playground-tasks-detail-color-swatch", "aria-hidden": "true" })
                                    ),
                                    onSelect: () => {
                                      updateScheduleDraft((current) => ({
                                        ...(current || buildProjectScheduleDraft(selectedProject)),
                                        taskColor: option.id,
                                        metadata: {
                                          ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
                                          taskColor: option.id,
                                          taskColorExplicit: true,
                                        },
                                      }));
                                      setTaskDetailSelectPopover("");
                                    },
                                  })
                                ),
                              })
                            )
                          ),
                          renderScheduleProjectFact(),
                          renderScheduleMilestoneFact(),
                          renderScheduleBlockedByFact(),
                          renderScheduleTimingCard(),
                          React.createElement("div", { className: "playground-tasks-detail-fact is-assignee" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Assignee"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-assignee",
                                value: String(scheduleDraft?.agentId || ""),
                                valueLabel: selectedScheduleAgent?.name || "Choose agent",
                                isEmpty: !selectedScheduleAgent,
                                buttonContent: renderTaskDetailPersonValue(
                                  String(scheduleDraft?.agentId || ""),
                                  selectedScheduleAgent?.name || "Choose agent"
                                ),
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
                                  return createScheduleDetailSelectorOption({
                                    value: actor.id,
                                    label: getTaskAssigneeName(actor.id, actor.name || "Unknown"),
                                    description: mode === "humans" ? "Human" : mode === "teams" ? "Agent squad" : "Agent",
                                    leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
                                    onSelect: () => {
                                      updateScheduleDraft((current) => ({
                                        ...(current || buildProjectScheduleDraft(selectedProject)),
                                        agentId: actor.id,
                                        agentName: actor.name || null,
                                      }));
                                      setTaskDetailSelectPopover("");
                                    },
                                  });
                                }),
                              })
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-fact" },
                            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Skills"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              renderScheduleSkillsControl()
                            )
                          ),
                          renderScheduleConnectorsFact(),
                React.createElement("div", { className: "playground-tasks-detail-fact" },
                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Computer"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              renderScheduleDetailSelectControl({
                                popoverId: "schedule-environment",
                                value: String(scheduleDraft?.environmentId || "").trim() || "__project_default__",
                                valueLabel: activeScheduleEnvironmentDisplay.label,
                                isEmpty: false,
                                popupClassName: "playground-tasks-detail-environment-selector-popup",
                                options: [
                                  createScheduleDetailSelectorOption({
                                    value: "__project_default__",
                                    label: activeScheduleProject ? "Project Default" : "Default",
                                    description: selectedScheduleEnvironment?.name || (activeScheduleProject ? "Uses the project's default computer" : "Uses your default computer"),
                                    leading: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                                    onSelect: () => {
                                      updateScheduleDraft((current) => ({
                                        ...(current || buildProjectScheduleDraft(selectedProject)),
                                        environmentId: "",
                                        environmentName: null,
                                      }));
                                      setTaskDetailSelectPopover("");
                                    },
                                  }),
                                  ...availableBacklogEnvironments.map((environment) =>
                                    createScheduleDetailSelectorOption({
                                      value: environment.id,
                                      label: environment.name + (environment.isDefault ? " (Default)" : ""),
                                      leading: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                                      onSelect: () => {
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
                          )
                        )
                      : null
                  ),
                  activeScheduleTargetType === "workflow"
                    ? renderScheduleWorkflowConfiguration()
                    : activeScheduleTargetType === "batch"
                      ? renderScheduleBatchPicker()
                      : React.createElement(PlatformInstructionsEditor, {
                        value: resolveTaskDescriptionAttachmentFiles(
                          String(scheduleDraft?.task || ""),
                          scheduleDraft?.attachments
                        ),
                        onChange: handleScheduleDescriptionEditorChange,
                        title: "Description",
                        placeholder: "Add description here",
                        ariaLabel: "Calendar event description",
                        historyKey: "calendar-event-description:" + String(scheduleDraft?.id || "new"),
                        variant: "minimalistic-ui",
                        contentVariant: "file-enabled",
                        fileUpload: {
                          upload: uploadScheduleDescriptionFiles,
                          resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                          disabled: taskAttachmentTransferState.isProcessing,
                          onActivate: (file) => {
                            const attachment = scheduleAttachments.find((item) =>
                              item.id === String(file?.attachmentId || "")
                            ) || null;
                            if (attachment) {
                              handleTaskAttachmentPreviewToggle(
                                buildResolvedTaskAttachmentRecord(attachment) || attachment
                              );
                            }
                          },
                          onRename: handleRenameScheduleDescriptionFile,
                          onRemove: handleRemoveScheduleDescriptionFile,
                        },
                        onEditingChange: setIsScheduleTaskEditing,
                      })
                ),
                React.createElement("div", { className: "playground-tasks-schedule-detail-footer" },
                  React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    className: "playground-tasks-schedule-save-button",
                    onClick: () => scheduleExecutionAction
                      ? void handleOpenScheduleExecution(scheduleDraft, selectedScheduleOccurrenceAt)
                      : void handleSaveSchedule(),
                    disabled: scheduleSaveState.isSaving
                      || (!scheduleExecutionAction && (!scheduleHasUnsavedChanges || Boolean(scheduleValidationError))),
                    title: scheduleExecutionAction
                      ? scheduleExecutionAction.label
                      : (scheduleValidationError || "Save calendar event changes (Command+S)"),
                    ...(scheduleExecutionAction ? {} : { "aria-keyshortcuts": "Meta+S Control+S" }),
                    fullWidth: true,
                  },
                    scheduleSaveState.isSaving
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-tasks-schedule-save-spinner", "aria-hidden": "true" })
                      : React.createElement(ScheduleFooterIcon, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    scheduleSaveState.isSaving
                      ? (scheduleExecutionAction ? "Opening..." : "Saving...")
                      : (scheduleExecutionAction?.label || "Save Changes")
                  )
                )
              )
            ),
            previewedTaskAttachment
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
              : null
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
          nextDate.setDate(nextDate.getDate() - nextDate.getDay());
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
              React.createElement(PlatformSwitch, {
                className: "playground-tasks-calendar-view-switch",
                value: currentView,
                options: allowedScheduleCalendarViews.map((viewId) => ({
                  value: viewId,
                  label: viewId.charAt(0).toUpperCase() + viewId.slice(1),
                })),
                ariaLabel: "Calendar view",
                onValueChange: (nextView) => toolbarProps?.onView?.(nextView),
              }),
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

        function renderScheduleCalendarWeekHeader({ date, localizer }) {
          const headerDate = date instanceof Date ? date : new Date(date);
          const hasValidDate = headerDate instanceof Date && !Number.isNaN(headerDate.getTime());
          const isToday = hasValidDate && isSamePlaygroundCalendarDay(headerDate, scheduleCurrentTime);
          const dayNumber = hasValidDate
            ? (localizer?.format?.(headerDate, "dateFormat") || String(headerDate.getDate()))
            : "";
          const weekdayLabel = hasValidDate
            ? (localizer?.format?.(headerDate, "weekdayFormat")
              || new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(headerDate))
            : "";

          return React.createElement("span", {
              className: "playground-tasks-calendar-week-header",
            },
            React.createElement("span", {
              className: "playground-tasks-calendar-week-header-day" + (isToday ? " is-today" : ""),
            }, dayNumber),
            React.createElement("span", {
              className: "playground-tasks-calendar-week-header-weekday",
            }, weekdayLabel)
          );
        }

        function getProjectCalendarEventColor(colorId, opacity = 0.15) {
          const presentation = getPlaygroundTaskColorPresentation(colorId || "blue");
          const accent = String(presentation?.accent || "#016bcb").trim();
          const safeOpacity = Number.isFinite(Number(opacity))
            ? Math.max(0, Math.min(1, Number(opacity)))
            : 0.15;
          const hexMatch = accent.match(/^#([0-9a-f]{6})$/i);
          if (hexMatch) {
            const packed = Number.parseInt(hexMatch[1], 16);
            return "rgba("
              + ((packed >> 16) & 255) + ", "
              + ((packed >> 8) & 255) + ", "
              + (packed & 255) + ", " + safeOpacity + ")";
          }
          const normalizedAccent = accent.toLowerCase();
          const rgbPrefixLength = normalizedAccent.startsWith("rgba(")
            ? 5
            : normalizedAccent.startsWith("rgb(")
              ? 4
              : 0;
          const rgbChannels = rgbPrefixLength > 0
            ? normalizedAccent
                .slice(rgbPrefixLength)
                .split(",")
                .slice(0, 3)
                .map((channel) => Number.parseFloat(channel.trim()))
            : [];
          if (rgbChannels.length === 3 && rgbChannels.every((channel) => Number.isFinite(channel))) {
            return "rgba("
              + Math.max(0, Math.min(255, Math.round(rgbChannels[0]))) + ", "
              + Math.max(0, Math.min(255, Math.round(rgbChannels[1]))) + ", "
              + Math.max(0, Math.min(255, Math.round(rgbChannels[2]))) + ", " + safeOpacity + ")";
          }
          return "rgba(1, 107, 203, " + safeOpacity + ")";
        }

        function getProjectCalendarEventProps(event) {
          const resource = event?.resource && typeof event.resource === "object" ? event.resource : {};
          const isDraftEvent = resource.kind === "schedule-draft" || resource.isDraft === true;
          const editingSchedule = resource.id && scheduleDraft?.id === resource.id
            ? scheduleDraft
            : null;
          const selectedOccurrenceMs = Date.parse(String(selectedScheduleOccurrenceAt || ""));
          const eventOccurrenceMs = event?.start instanceof Date
            ? event.start.getTime()
            : Date.parse(String(event?.start || ""));
          const isSelectedOccurrence = !Number.isFinite(selectedOccurrenceMs)
            || (Number.isFinite(eventOccurrenceMs) && eventOccurrenceMs === selectedOccurrenceMs);
          const isActiveEvent = scheduleViewMode === "setup" && (
            (scheduleEditorMode === "edit"
              && Boolean(resource.id)
              && resource.id === scheduleDraft?.id
              && isSelectedOccurrence)
            || (scheduleEditorMode === "create" && isDraftEvent)
          );
          const eventColorId = getPlaygroundTaskColorId(
            editingSchedule?.taskColor
            || editingSchedule?.metadata?.taskColor
            || resource.taskColor
            || resource.metadata?.taskColor
            || "blue"
          );
          const eventClassName = [
            isDraftEvent ? "is-calendar-draft" : "",
            isActiveEvent ? "is-calendar-active" : "",
          ].filter(Boolean).join(" ");
          return {
            ...(eventClassName ? { className: eventClassName } : {}),
            style: {
              "--playground-calendar-event-surface": getProjectCalendarEventColor(eventColorId, 0.15),
              "--playground-calendar-event-border": getProjectCalendarEventColor(eventColorId, 0.5),
              "--playground-calendar-event-text": "#fff",
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
          const contextSchedule = resource?.id ? (schedulesById[resource.id] || null) : null;
          const isDraftSchedule = resource.kind === "schedule-draft" || resource.isDraft === true;
          const eventSchedule = isDraftSchedule
            ? scheduleDraft
            : resource?.id && scheduleDraft?.id === resource.id
              ? scheduleDraft
              : contextSchedule || resource;
          const eventTask = resource?.taskId ? (tasksById[resource.taskId] || null) : null;
          const contextMenuProps = contextSchedule
            ? {
                onContextMenu: (contextMenuEvent) => {
                  contextMenuEvent.preventDefault();
                  contextMenuEvent.stopPropagation();
                  setTaskDetailPopover("");
                  setScheduleContextMenu({
                    scheduleId: contextSchedule.id,
                    x: contextMenuEvent.clientX,
                    y: contextMenuEvent.clientY,
                  });
                },
              }
            : {};
          const isMetronomeEvent = resource.kind === "metronome";
          const eventScheduleTargetType = isMetronomeEvent
            ? "metronome"
            : normalizePlaygroundScheduleTargetType(
                eventSchedule?.targetType
                || eventSchedule?.metadata?.scheduleTargetType
                || eventSchedule?.metadata?.targetKind
                || resource.targetType
                || resource.metadata?.scheduleTargetType
                || resource.metadata?.targetKind
                || resource.taskType
                || resource.metadata?.taskType
              );
          const EventTaskTypeIcon = eventScheduleTargetType === "workflow"
            ? Metronome
            : eventScheduleTargetType === "loop"
              ? RefreshCw
              : eventScheduleTargetType === "batch"
                ? Truck
                : eventScheduleTargetType === "metronome"
                  ? Metronome
                  : Bookmark;
          const eventPriority = eventTask?.priority
            || eventSchedule?.priority
            || eventSchedule?.metadata?.priority
            || resource.priority
            || resource.metadata?.priority
            || "medium";
          const eventAssigneeId = eventTask?.assigneeAgentId
            || eventSchedule?.assigneeAgentId
            || eventSchedule?.agentId
            || resource.assigneeAgentId
            || resource.agentId
            || "";
          const eventAssignee = eventTask
            ? renderTaskAssigneeAvatar(eventTask, "playground-tasks-board-assignee-avatar")
            : renderTaskActorAvatar(eventAssigneeId, "playground-tasks-board-assignee-avatar");
          const eventTitle = String(title || event?.title || "").trim()
            || (isMetronomeEvent ? "Metronome" : "Untitled Task");
          const eventStartTime = formatScheduleTimeLabel(event?.start);

          return React.createElement("div", {
              className: "playground-tasks-calendar-event-inner" + (isMetronomeEvent ? " is-metronome" : ""),
              ...contextMenuProps,
            },
            React.createElement("div", { className: "playground-tasks-calendar-event-top" },
              React.createElement("span", { className: "playground-tasks-calendar-event-title" }, eventTitle),
              eventAssignee
            ),
            React.createElement("div", { className: "playground-tasks-calendar-event-meta" },
              React.createElement("span", {
                  className: "playground-tasks-calendar-event-type-icon is-" + eventScheduleTargetType,
                  "aria-hidden": "true",
                },
                React.createElement(EventTaskTypeIcon, { strokeWidth: 1.8 })
              ),
              renderPlaygroundTaskPriorityIcon(
                eventPriority,
                "playground-tasks-lane-card-priority playground-tasks-calendar-event-priority"
              ),
              eventStartTime
                ? React.createElement("span", { className: "playground-tasks-calendar-event-time" }, eventStartTime)
                : null
            )
          );
        }

        function formatScheduleTimeLabel(value) {
          try {
            return new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).format(value)
              .replace(/\\s*(am|pm)$/i, (_match, period) => " " + period.toUpperCase());
          } catch {
            return "";
          }
        }

        function renderScheduleCalendarTimeGutter({ children, slotMetrics }) {
          const gutterWrapperRef = React.useRef(null);
          const [timeGridWidth, setTimeGridWidth] = React.useState(0);
          const isTimeView = activeScheduleCalendarView === "day" || activeScheduleCalendarView === "week";
          const isCurrentRange = isTimeView && isScheduleCalendarDateVisible(
            scheduleCalendarDate,
            activeScheduleCalendarView
          );
          const firstGutterSlot = slotMetrics?.groups?.[0]?.[0] instanceof Date
            ? slotMetrics.groups[0][0]
            : null;
          const currentTimeOnGutterDate = firstGutterSlot
            ? new Date(firstGutterSlot)
            : new Date(scheduleCurrentTime);
          currentTimeOnGutterDate.setHours(
            scheduleCurrentTime.getHours(),
            scheduleCurrentTime.getMinutes(),
            scheduleCurrentTime.getSeconds(),
            scheduleCurrentTime.getMilliseconds()
          );
          const currentTimePosition = isCurrentRange && typeof slotMetrics?.getCurrentTimePosition === "function"
            ? Number(slotMetrics.getCurrentTimePosition(currentTimeOnGutterDate))
            : Number.NaN;
          const safeCurrentTimePosition = Number.isFinite(currentTimePosition)
            ? Math.max(0, Math.min(100, currentTimePosition))
            : null;
          const currentTimeLabel = formatScheduleTimeLabel(scheduleCurrentTime);

          React.useLayoutEffect(() => {
            const gutterWrapper = gutterWrapperRef.current;
            const timeGrid = gutterWrapper?.closest?.(".rbc-time-content") || null;
            if (!gutterWrapper || !timeGrid) return undefined;
            const updateTimeGridWidth = () => {
              const nextWidth = Math.max(0, Math.round(timeGrid.getBoundingClientRect().width));
              setTimeGridWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth);
            };
            updateTimeGridWidth();
            const resizeObserver = typeof ResizeObserver === "function"
              ? new ResizeObserver(updateTimeGridWidth)
              : null;
            resizeObserver?.observe(timeGrid);
            window.addEventListener("resize", updateTimeGridWidth);
            return () => {
              resizeObserver?.disconnect();
              window.removeEventListener("resize", updateTimeGridWidth);
            };
          }, []);

          return React.createElement("div", {
              className: "playground-tasks-calendar-time-gutter-wrapper",
              ref: gutterWrapperRef,
            },
            children,
            safeCurrentTimePosition !== null && currentTimeLabel
              ? React.createElement("div", {
                  className: "playground-tasks-calendar-current-time",
                  style: {
                    top: safeCurrentTimePosition + "%",
                    width: timeGridWidth > 0 ? timeGridWidth + "px" : "100vw",
                  },
                  "aria-label": "Current time " + currentTimeLabel,
                },
                  React.createElement("span", {
                    className: "playground-tasks-calendar-current-time-label",
                  }, currentTimeLabel)
                )
              : null
          );
        }

        function renderScheduleCalendarContextMenu() {
          if (!scheduleContextMenu?.scheduleId) return null;
          const contextSchedule = schedulesById[scheduleContextMenu.scheduleId] || null;
          if (!contextSchedule) return null;
          return React.createElement(PlatformPopup, {
              open: true,
              portal: true,
              portalAnchorPoint: {
                x: scheduleContextMenu.x,
                y: scheduleContextMenu.y,
              },
              portalOffset: 0,
              placement: "bottom-start",
              variant: "minimal",
              animation: "down-in",
              rootClassName: "playground-tasks-calendar-context-menu-anchor",
              rootProps: { "aria-hidden": "true" },
              surfaceRef: scheduleContextMenuRef,
              surfaceClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide",
              surfaceProps: {
                role: "menu",
                "aria-label": "Schedule actions",
              },
            },
            renderScheduleActionsMenu(contextSchedule, {
              persisted: true,
              closeMenu: () => setScheduleContextMenu(null),
            })
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
                  scrollToTime: new Date(scheduleCurrentTime.getTime() - (10 * 60 * 1000)),
                  enableAutoScroll: true,
                  style: { height: "100%" },
                  toolbar: !isStandaloneCalendarMode,
                  components: {
                    toolbar: renderScheduleCalendarToolbar,
                    event: renderProjectCalendarEvent,
                    timeGutterWrapper: renderScheduleCalendarTimeGutter,
                    week: {
                      header: renderScheduleCalendarWeekHeader,
                    },
                  },
                  views: allowedScheduleCalendarViews,
                  view: activeScheduleCalendarView,
                  onView: handleScheduleCalendarViewChange,
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
                    if (event?.resource?.kind === "schedule-draft" || event?.resource?.isDraft === true) {
                      return;
                    }
                    if (event?.resource?.id) {
                      openScheduleEditor(event.resource, event?.start);
                    }
                  },
                }),
                renderScheduleCalendarContextMenu()
              )
            )
          );
        }

`;
