export const FINE_TUNING_PAGE_CONTROLLER_CREATE_MODAL_SCRIPT = String.raw`        function renderCreateModal() {
          if (!fineTuningCreateModalOpen && !modalClosing) return null;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedEvaluationSets = normalizedEvaluationSets.filter((set) => selectedSetIds.includes(set.id));
          const canUndoInstructions = Array.isArray(fineTuningInstructionsHistory.past) && fineTuningInstructionsHistory.past.length > 0;
          const canRedoInstructions = Array.isArray(fineTuningInstructionsHistory.future) && fineTuningInstructionsHistory.future.length > 0;
          const renderInstructionsToolbarButton = (action) =>
            React.createElement("button", {
              key: action.id,
              type: "button",
              className: "playground-tasks-detail-format-button",
              title: action.label,
              "aria-label": action.label,
              disabled: Boolean(action.disabled || createBusy),
              onMouseDown: (event) => event.preventDefault(),
              onClick: action.onClick,
            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: action.strokeWidth || 1.8 }));
          const textFormatActions = [
            { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
            { id: "italic", label: "Italic", icon: Italic },
            { id: "underline", label: "Underline", icon: Underline },
          ];
          const listFormatActions = [
            { id: "list", label: "List", icon: List },
            { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
          ];
          const insertFormatActions = [
            { id: "code", label: "Code", icon: CodeXml },
            { id: "link", label: "Link", icon: Link2 },
          ];
          const renderMarkdownPreview = () => {
            const content = String(form.instructions || "").trim();
            if (!content) {
              return React.createElement("div", {
                className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
              }, "Add fine-tuning instructions here.");
            }
            return typeof PlaygroundTaskDescriptionMarkdown === "function"
              ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: form.instructions || "",
                  className: "playground-tasks-detail-description-preview tb-message-markdown",
                })
              : React.createElement("div", { className: "playground-tasks-detail-description-preview tb-message-markdown" }, form.instructions || "");
          };
          const toggleEvaluationSet = (setId) => {
            const normalizedSetId = normalizePlaygroundFineTuningString(setId);
            if (!normalizedSetId) return;
            if (selectedSetIds.includes(normalizedSetId)) {
              const nextRunIds = { ...selectedRunIds };
              delete nextRunIds[normalizedSetId];
              updateCreateForm({
                evaluationSetIds: selectedSetIds.filter((id) => id !== normalizedSetId),
                evaluationRunIds: nextRunIds,
              });
              return;
            }
            const set = normalizedEvaluationSets.find((item) => item.id === normalizedSetId) || null;
            const latestRun = getPlaygroundFineTuningLatestRun(set);
            updateCreateForm({
              evaluationSetIds: Array.from(new Set([...selectedSetIds, normalizedSetId])),
              evaluationRunIds: {
                ...selectedRunIds,
                [normalizedSetId]: normalizePlaygroundFineTuningString(latestRun?.id || latestRun?.runId || latestRun?.run_id || ""),
              },
            });
          };
          const updateEvaluationSetRun = (setId, runId) => {
            const normalizedSetId = normalizePlaygroundFineTuningString(setId);
            if (!normalizedSetId) return;
            updateCreateForm({
              evaluationRunIds: {
                ...selectedRunIds,
                [normalizedSetId]: normalizePlaygroundFineTuningString(runId),
              },
            });
          };
          const getEvaluationSetMeta = (set) => {
            const caseCount = Array.isArray(set?.dataRows) ? set.dataRows.length : Number(set?.caseCount || 0) || 0;
            const score = getPlaygroundFineTuningEvaluationScore(set);
            return caseCount + " " + (caseCount === 1 ? "case" : "cases") + " · " + formatPlaygroundFineTuningPercent(score);
          };
          const renderEvaluationSetPickerMenu = () =>
            React.createElement(PlatformPopupSurface, {
                className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-fine-tuning-evaluation-menu",
                onClick: (event) => event.stopPropagation(),
              },
              normalizedEvaluationSets.length
                ? normalizedEvaluationSets.map((set) => {
                    const checked = selectedSetIds.includes(set.id);
                    return React.createElement("button", {
                        key: set.id,
                        type: "button",
                        className: "tb-popup-row tb-popup-row-select" + (checked ? " selected" : ""),
                        onClick: () => toggleEvaluationSet(set.id),
                        "aria-pressed": checked ? "true" : "false",
                      },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        checked ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, set.name || "Untitled Evaluation"),
                        React.createElement("span", { className: "playground-fine-tuning-evaluation-meta" }, getEvaluationSetMeta(set))
                      )
                    );
                  })
                : React.createElement("div", { className: "playground-fine-tuning-evaluation-menu-empty" }, "No evaluation sets available.")
            );
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-create-modal-backdrop playground-fine-tuning-create-modal-backdrop"
                + (modalVisible ? " is-visible" : "")
                + (modalClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeCreateModal,
            },
            React.createElement(PlatformModalSurface, {
              as: "form",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-create-modal playground-fine-tuning-create-modal"
                + (modalVisible ? " is-visible" : "")
                + (modalClosing ? " is-closing" : ""),
              onClick: (event) => event.stopPropagation(),
              onSubmit: handleCreateFineTuningJob,
            },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(TestTubeDiagonal, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-project-overview-outcome-editor-title-input",
                    value: form.name || "",
                    placeholder: "Fine-tune job name",
                    onChange: (event) => updateCreateForm({ name: event.target.value }),
                    autoFocus: true,
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: () => closeCreateModal(),
                  title: "Close",
                  "aria-label": "Close",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-create-modal-shell playground-fine-tuning-create-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-create-modal-body playground-fine-tuning-create-modal-body" },
                  React.createElement("div", { className: "playground-evaluations-form-grid" },
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Fine-Tuner Agent"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: form.agentId || defaultAgentId || normalizedAgents[0]?.id || "",
                    onChange: (event) => updateCreateForm({ agentId: event.target.value }),
                  },
                    normalizedAgents.length
                      ? normalizedAgents.map((agent) => React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id))
                      : React.createElement("option", { value: "" }, "No agents available")
                  )
                ),
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Computer"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: form.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || "",
                    onChange: (event) => updateCreateForm({ environmentId: event.target.value }),
                  },
                    normalizedEnvironments.length
                      ? normalizedEnvironments.map((environment) => React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.label || environment.id))
                      : React.createElement("option", { value: "" }, "No computers available")
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor playground-mission-control-modal-outcomes-editor playground-fine-tuning-evaluation-picker" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Evaluation Sets"),
                    React.createElement("div", {
                        className: "playground-fine-tuning-evaluation-menu-shell playground-tasks-toolbar-popup-shell" + (evaluationSetPickerOpen ? " is-open" : ""),
                        ref: evaluationSetPickerRef,
                        onClick: (event) => event.stopPropagation(),
                      },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-mission-control-modal-outcome-add",
                        onClick: () => setEvaluationSetPickerOpen((current) => !current),
                        title: "Add evaluation sets",
                        "aria-label": "Add evaluation sets",
                        "aria-expanded": evaluationSetPickerOpen ? "true" : "false",
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 })),
                      evaluationSetPickerOpen ? renderEvaluationSetPickerMenu() : null
                    )
                  ),
                  React.createElement("div", { className: "playground-fine-tuning-evaluation-picker-body" },
                    React.createElement("div", { className: "playground-fine-tuning-evaluation-list playground-mission-control-modal-outcomes-list" },
                      selectedEvaluationSets.length
                        ? selectedEvaluationSets.map((set) => {
                            const runs = getPlaygroundFineTuningRuns(set);
                            const latestRun = getPlaygroundFineTuningLatestRun(set);
                            const selectedRunId = normalizePlaygroundFineTuningString(selectedRunIds[set.id] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
                            return React.createElement("div", {
                                key: set.id,
                                role: "button",
                                tabIndex: 0,
                                className: "playground-fine-tuning-evaluation-option playground-mission-control-modal-outcome-row is-selected",
                                onClick: () => toggleEvaluationSet(set.id),
                                onKeyDown: (event) => {
                                  if (event.key !== "Enter" && event.key !== " ") return;
                                  event.preventDefault();
                                  toggleEvaluationSet(set.id);
                                },
                                "aria-pressed": "true",
                              },
                              React.createElement("div", { className: "playground-mission-control-modal-outcome-copy" },
                                React.createElement("span", { className: "playground-mission-control-modal-outcome-input playground-fine-tuning-evaluation-name" }, set.name || "Untitled Evaluation")
                              ),
                              React.createElement("select", {
                                  className: "playground-fine-tuning-evaluation-run-select",
                                  value: selectedRunId,
                                  disabled: !runs.length,
                                  onClick: (event) => event.stopPropagation(),
                                  onPointerDown: (event) => event.stopPropagation(),
                                  onChange: (event) => {
                                    event.stopPropagation();
                                    updateEvaluationSetRun(set.id, event.target.value);
                                  },
                                  "aria-label": "Fine-tune baseline run for " + (set.name || "evaluation set"),
                                },
                                runs.length
                                  ? runs.map((run) => React.createElement("option", { key: run.id, value: run.id }, run.label || run.id))
                                  : React.createElement("option", { value: "" }, "No runs")
                              ),
                              React.createElement("span", {
                                className: "playground-mission-control-modal-outcome-menu-trigger",
                                "aria-hidden": "true",
                              },
                                React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.9 })
                              )
                            );
                          })
                        : React.createElement("button", {
                            type: "button",
                            className: "playground-mission-control-modal-outcomes-empty",
                            onClick: () => setEvaluationSetPickerOpen(true),
                          }, normalizedEvaluationSets.length ? "Add evaluation sets" : "No evaluation sets available.")
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-fine-tuning-instructions-section" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Instructions"),
                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                      renderInstructionsToolbarButton({
                        id: "undo",
                        label: "Undo",
                        icon: Undo2,
                        disabled: !canUndoInstructions,
                        onClick: handleFineTuningInstructionsUndo,
                      }),
                      renderInstructionsToolbarButton({
                        id: "redo",
                        label: "Redo",
                        icon: Redo2,
                        disabled: !canRedoInstructions,
                        onClick: handleFineTuningInstructionsRedo,
                      }),
                      React.createElement("span", { key: "history-divider", className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
                      textFormatActions.map((action) =>
                        renderInstructionsToolbarButton({
                          ...action,
                          onClick: () => handleFineTuningInstructionsFormat(action.id),
                        })
                      ),
                      React.createElement("span", { key: "list-divider-start", className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
                      listFormatActions.map((action) =>
                        renderInstructionsToolbarButton({
                          ...action,
                          onClick: () => handleFineTuningInstructionsFormat(action.id),
                        })
                      ),
                      React.createElement("span", { key: "list-divider-end", className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
                      insertFormatActions.map((action) =>
                        renderInstructionsToolbarButton({
                          ...action,
                          onClick: () => handleFineTuningInstructionsFormat(action.id),
                        })
                      )
                    )
                  ),
                  React.createElement("div", {
                      className: "playground-tasks-detail-description-editor" + (isFineTuningInstructionsEditing ? " is-editing" : " is-preview"),
                      onClick: () => {
                        setIsFineTuningInstructionsEditing(true);
                        focusFineTuningInstructionsTextareaAtEnd(form.instructions || "");
                      },
                    },
                    !isFineTuningInstructionsEditing
                      ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" }, renderMarkdownPreview())
                      : null,
                    React.createElement("textarea", {
                      ref: fineTuningInstructionsTextareaRef,
                      className: "playground-tasks-detail-description-input " + (isFineTuningInstructionsEditing ? "is-editing" : "is-preview"),
                      rows: 1,
                      placeholder: isFineTuningInstructionsEditing ? "Add fine-tuning instructions here." : "",
                      value: form.instructions || "",
                      disabled: createBusy,
                      onFocus: () => setIsFineTuningInstructionsEditing(true),
                      onChange: (event) => {
                        updateFineTuningInstructionsValue(event.target.value);
                        resizeFineTuningInstructionsTextarea(event.currentTarget);
                      },
                      onBlur: () => setIsFineTuningInstructionsEditing(false),
                    })
                  )
                ),
                createError ? React.createElement("div", { className: "playground-fine-tuning-create-error" }, createError) : null
                  )
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeCreateModal(),
                    disabled: createBusy,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: createBusy,
                  }, createBusy ? "Starting..." : "Start Fine-Tune")
                )
              )
            )
          );
        }

`;

