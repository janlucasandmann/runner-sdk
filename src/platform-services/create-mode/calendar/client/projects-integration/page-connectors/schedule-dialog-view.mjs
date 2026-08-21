export const CALENDAR_PROJECTS_PAGE_SCHEDULE_DIALOG_VIEW_SCRIPT = `
        function renderTaskScheduleDialog({ embedded = false } = {}) {
          if (!taskScheduleDialogState) {
            return null;
          }

          const hasExistingSchedule = taskScheduleDialogState.target === "schedule"
            ? Boolean(scheduleDraft?.scheduledTime || (scheduleDraft?.scheduleType === "recurring" && scheduleDraft?.cronExpression))
            : taskScheduleDialogState.target === "issue"
              ? Boolean(issueComposerDraft?.scheduledStartAt || (issueComposerDraft?.scheduleType === "recurring" && issueComposerDraft?.cronExpression))
              : Boolean(draftTask?.scheduledStartAt || (draftTask?.scheduleType === "recurring" && draftTask?.cronExpression));
          const isRecurring = taskScheduleDialogState.scheduleType === "recurring";
          const selectedPresetId = taskScheduleDialogState.presetId || getPlaygroundTaskSchedulePresetId(taskScheduleDialogState.cronExpression);
          const animationClass = taskScheduleDialogPhase === "exit"
            ? " is-exit"
            : " is-enter";
          return React.createElement("div", {
              className: "playground-tasks-schedule-panel" + (embedded ? " is-centralized-selector-content" : animationClass),
              onClick: (event) => event.stopPropagation(),
            },
            React.createElement("div", { className: "playground-tasks-schedule-topbar" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-schedule-topbar-button is-close",
                  onClick: closeTaskScheduleDialog,
                  "aria-label": "Close schedule popup",
                }, React.createElement(X, { className: "playground-tasks-schedule-topbar-icon", strokeWidth: 1.75 })),
              React.createElement("div", { className: "playground-tasks-schedule-topbar-title" }, "Schedule"),
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-schedule-topbar-button is-confirm",
                onClick: handleTaskScheduleDialogSave,
                "aria-label": hasExistingSchedule ? "Update schedule" : "Confirm schedule",
              }, React.createElement(Check, { className: "playground-tasks-schedule-topbar-icon", strokeWidth: 2 }))
            ),
            React.createElement("div", { className: "playground-tasks-schedule-body" },
              React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-attach-header" },
                React.createElement(PlatformSwitch, {
                  className: "playground-tasks-schedule-type-switch",
                  ariaLabel: "Schedule type",
                  value: isRecurring ? "recurring" : "one-time",
                  options: [
                    { value: "one-time", label: "One-time" },
                    { value: "recurring", label: "Recurring" },
                  ],
                  onValueChange: (nextScheduleType) => setTaskScheduleDialogState((current) => {
                    if (!current) return current;
                    if (nextScheduleType !== "recurring") {
                      return { ...current, scheduleType: "one-time", error: "" };
                    }
                    const presetId = current.presetId || getPlaygroundTaskSchedulePresetId(current.cronExpression) || "daily";
                    return {
                      ...current,
                      scheduleType: "recurring",
                      presetId,
                      cronExpression: buildPlaygroundCronExpressionForPreset(presetId, fromPlaygroundDatetimeLocalValue(current.start) || Date.now()),
                      error: "",
                    };
                  }),
                })
              ),
              React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced" },
                React.createElement("div", { className: "tb-popup-field-row" },
                  React.createElement("label", { className: "tb-popup-field-label" }, "Run at"),
                  hasExistingSchedule
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-popup-link-button tb-popup-link-button-inline",
                        onClick: handleTaskScheduleDialogClear,
                      },
                        React.createElement(Trash2, { className: "tb-popup-link-chevron", strokeWidth: 1.75 }),
                        "Remove"
                      )
                    : null
                ),
                React.createElement("div", { className: "tb-popup-select-wrap tb-popup-select-wrap-schedule" },
                  React.createElement("input", {
                    type: "datetime-local",
                    className: "tb-popup-select tb-popup-select-schedule playground-tasks-schedule-input",
                    value: taskScheduleDialogState.start,
                    min: toPlaygroundDatetimeLocalValue(new Date()),
                    onChange: (event) => setTaskScheduleDialogState((current) => current
                      ? {
                          ...current,
                          start: event.target.value,
                          cronExpression: current.scheduleType === "recurring" && (current.presetId || getPlaygroundTaskSchedulePresetId(current.cronExpression))
                            ? buildPlaygroundCronExpressionForPreset(current.presetId || getPlaygroundTaskSchedulePresetId(current.cronExpression), fromPlaygroundDatetimeLocalValue(event.target.value) || Date.now())
                            : current.cronExpression,
                          error: "",
                        }
                      : current
                    ),
                    autoFocus: true,
                  })
                ),
                isRecurring
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "tb-popup-field-row tb-popup-field-row-followup" },
                        React.createElement("label", { className: "tb-popup-field-label" }, "Repeat")
                      ),
                      React.createElement("div", { className: "tb-popup-preset-list" },
                        PLAYGROUND_TASK_SCHEDULE_PRESETS.map((preset) =>
                          React.createElement("button", {
                              key: preset.id,
                              type: "button",
                              className: "tb-popup-preset-row" + (selectedPresetId === preset.id ? " selected" : ""),
                              onClick: () => setTaskScheduleDialogState((current) => current ? {
                                ...current,
                                presetId: preset.id,
                                cronExpression: buildPlaygroundCronExpressionForPreset(preset.id, fromPlaygroundDatetimeLocalValue(current.start) || Date.now()),
                                error: "",
                              } : current),
                            },
                            React.createElement("span", { className: "tb-popup-check-slot" },
                              selectedPresetId === preset.id
                                ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.75 })
                                : null
                            ),
                            React.createElement("span", null, preset.label)
                          )
                        )
                      )
                    )
                  : null
              ),
              taskScheduleDialogState.error
                ? React.createElement("div", { className: "playground-environments-error" }, taskScheduleDialogState.error)
                : null
            )
          );
        }`;
