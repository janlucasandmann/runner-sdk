export const FINE_TUNING_PAGE_CONTROLLER_CREATE_MODAL_SCRIPT = String.raw`        function renderCreateModal() {
          if (!fineTuningCreateModalOpen && !modalClosing) return null;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedEvaluationSets = normalizedEvaluationSets.filter((set) => selectedSetIds.includes(set.id));
          const selectedFineTunerAgentId = normalizePlaygroundFineTuningString(
            form.agentId || defaultAgentId || normalizedAgents[0]?.id || ""
          );
          const selectedFineTunerAgent = normalizedAgents.find((agent) => (
            normalizePlaygroundFineTuningString(agent?.id) === selectedFineTunerAgentId
          )) || null;
          const selectedFineTunerAgentLabel = normalizePlaygroundFineTuningString(
            selectedFineTunerAgent?.name
            || selectedFineTunerAgent?.label
            || selectedFineTunerAgent?.title
            || selectedFineTunerAgent?.id
            || "Select agent"
          );
          const selectedFineTunerAgentPhotoUrl = normalizePlaygroundFineTuningString(
            selectedFineTunerAgent?.photoUrl
            || selectedFineTunerAgent?.photoURL
            || selectedFineTunerAgent?.avatarUrl
            || selectedFineTunerAgent?.avatarURL
          );
          const fineTunerAgentOptions = normalizedAgents.map((agent) => {
            const value = normalizePlaygroundFineTuningString(agent?.id);
            const label = normalizePlaygroundFineTuningString(agent?.name || agent?.label || agent?.title || value) || "Agent";
            const photoUrl = normalizePlaygroundFineTuningString(
              agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL
            );
            return {
              value,
              label,
              leading: React.createElement(AccountAvatar, {
                className: "playground-fine-tuning-create-selector-avatar",
                imageClassName: "playground-fine-tuning-create-selector-avatar-image",
                fallbackLabel: getPlaygroundFineTuningInitials(label),
                photoUrl,
              }),
            };
          });
          const selectedEnvironmentId = normalizePlaygroundFineTuningString(
            form.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || ""
          );
          const selectedEnvironment = normalizedEnvironments.find((environment) => (
            normalizePlaygroundFineTuningString(environment?.id) === selectedEnvironmentId
          )) || null;
          const selectedEnvironmentLabel = normalizePlaygroundFineTuningString(
            selectedEnvironment?.name
            || selectedEnvironment?.label
            || selectedEnvironment?.title
            || selectedEnvironment?.id
            || "Select computer"
          );
          const environmentOptions = normalizedEnvironments.map((environment) => {
            const value = normalizePlaygroundFineTuningString(environment?.id);
            return {
              value,
              label: normalizePlaygroundFineTuningString(
                environment?.name || environment?.label || environment?.title || value
              ) || "Computer",
              leading: React.createElement(Monitor, {
                width: 14,
                height: 14,
                strokeWidth: 1.8,
              }),
            };
          });
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
            React.createElement(React.Fragment, null,
              fineTuningEvaluationSetsLoading && !normalizedEvaluationSets.length
                ? React.createElement("div", { className: "playground-fine-tuning-evaluation-menu-empty", role: "status" }, "Loading evaluation sets...")
                : normalizedEvaluationSets.length
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
                : React.createElement("div", { className: "playground-fine-tuning-evaluation-menu-empty" },
                    fineTuningEvaluationSetsError || "No evaluation sets available."
                  )
            );
          return React.createElement(PlatformModal, {
              open: fineTuningCreateModalOpen,
              visible: modalVisible,
              closing: modalClosing,
              animationDurationMs: 75,
              portal: true,
              as: "form",
              size: "medium",
              maxHeight: "min(720px, calc(100vh - 48px))",
              scrollable: true,
              title: "New Fine-Tune",
              headerVariant: "search",
              headerSearchProps: {
                icon: TestTubeDiagonal,
                value: form.name || "",
                placeholder: "Fine-tune job name",
                "aria-label": "Fine-tune job name",
                autoComplete: "off",
                disabled: createBusy,
                onChange: (event) => updateCreateForm({ name: event.target.value }),
              },
              onClose: () => {
                if (!createBusy) closeCreateModal();
              },
              closeOnBackdrop: !createBusy,
              closeOnEscape: !createBusy,
              closeButtonDisabled: createBusy,
              closeButtonLabel: "Close new fine-tune modal",
              ariaLabel: "Create a new fine-tune job",
              className: "playground-new-issue-modal playground-fine-tuning-create-modal",
              backdropClassName: "playground-fine-tuning-create-modal-backdrop",
              bodyClassName: "playground-new-issue-modal__body playground-fine-tuning-create-modal-platform-body",
              footerClassName: "playground-new-issue-modal__footer playground-fine-tuning-modal-actions",
              surfaceProps: { onSubmit: handleCreateFineTuningJob },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "medium",
                  onClick: () => closeCreateModal(),
                  disabled: createBusy,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: createBusy || !String(form.name || "").trim(),
                  "aria-busy": createBusy || undefined,
                }, createBusy ? "Starting..." : "Start Fine-Tune")
              ),
            },
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-create-modal-shell playground-fine-tuning-create-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-create-modal-body playground-fine-tuning-create-modal-body" },
                  React.createElement("div", { className: "playground-evaluations-form-grid" },
                React.createElement("div", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Fine-Tuner Agent"),
                  React.createElement(PlatformSelector, {
                    value: selectedFineTunerAgentId,
                    options: fineTunerAgentOptions,
                    onValueChange: (nextValue) => updateCreateForm({ agentId: nextValue }),
                    ariaLabel: "Select fine-tuner agent",
                    label: React.createElement("span", { className: "playground-fine-tuning-create-selector-value" },
                      React.createElement(AccountAvatar, {
                        className: "playground-fine-tuning-create-selector-avatar",
                        imageClassName: "playground-fine-tuning-create-selector-avatar-image",
                        fallbackLabel: getPlaygroundFineTuningInitials(selectedFineTunerAgentLabel),
                        photoUrl: selectedFineTunerAgentPhotoUrl,
                      }),
                      React.createElement("span", null, selectedFineTunerAgentLabel)
                    ),
                    placeholder: "Select agent",
                    disabled: createBusy || fineTunerAgentOptions.length === 0,
                    alignment: "end",
                    popupAlignment: "right",
                    fullWidth: true,
                    emptyContent: "No agents available.",
                    popupWidth: "min(280px, calc(100vw - 48px))",
                    popupMaxWidth: "calc(100vw - 48px)",
                    popupMaxHeight: "min(320px, calc(100vh - 120px))",
                    className: "playground-tasks-detail-central-selector playground-fine-tuning-create-selector",
                    triggerClassName: "playground-tasks-detail-central-selector-trigger playground-fine-tuning-create-selector-trigger",
                    popupClassName: "playground-tasks-detail-central-selector-popup playground-fine-tuning-create-selector-popup",
                  })
                ),
                React.createElement("div", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Computer"),
                  React.createElement(PlatformSelector, {
                    value: selectedEnvironmentId,
                    options: environmentOptions,
                    onValueChange: (nextValue) => updateCreateForm({ environmentId: nextValue }),
                    ariaLabel: "Select computer",
                    label: React.createElement("span", { className: "playground-fine-tuning-create-selector-value" },
                      React.createElement(Monitor, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      }),
                      React.createElement("span", null, selectedEnvironmentLabel)
                    ),
                    placeholder: "Select computer",
                    disabled: createBusy || environmentOptions.length === 0,
                    alignment: "end",
                    popupAlignment: "right",
                    fullWidth: true,
                    emptyContent: "No computers available.",
                    popupWidth: "min(280px, calc(100vw - 48px))",
                    popupMaxWidth: "calc(100vw - 48px)",
                    popupMaxHeight: "min(320px, calc(100vh - 120px))",
                    className: "playground-tasks-detail-central-selector playground-fine-tuning-create-selector",
                    triggerClassName: "playground-tasks-detail-central-selector-trigger playground-fine-tuning-create-selector-trigger",
                    popupClassName: "playground-tasks-detail-central-selector-popup playground-fine-tuning-create-selector-popup",
                  })
                ),
                React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor playground-mission-control-modal-outcomes-editor playground-fine-tuning-evaluation-picker" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Evaluation Sets"),
                    React.createElement(PlatformPopup, {
                      open: evaluationSetPickerOpen,
                      rootRef: evaluationSetPickerRef,
                      surfaceRef: evaluationSetPickerSurfaceRef,
                      rootClassName: "playground-fine-tuning-evaluation-menu-shell",
                      surfaceClassName: "playground-fine-tuning-evaluation-menu",
                      surfaceProps: {
                        role: "menu",
                        "aria-label": "Evaluation sets",
                        width: "min(320px, calc(100vw - 64px))",
                        maxWidth: "calc(100vw - 32px)",
                        maxHeight: "270px",
                        onClick: (event) => event.stopPropagation(),
                      },
                      animation: "down-in",
                      variant: "minimal",
                      portal: true,
                      placement: "bottom-end",
                      portalOffset: 6,
                      trigger: React.createElement("button", {
                        type: "button",
                        className: "playground-mission-control-modal-outcome-add",
                        onClick: () => setEvaluationSetPickerOpen((current) => !current),
                        title: "Add evaluation sets",
                        "aria-label": "Add evaluation sets",
                        "aria-expanded": evaluationSetPickerOpen ? "true" : "false",
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 })),
                    }, renderEvaluationSetPickerMenu())
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
                          },
                            fineTuningEvaluationSetsLoading && !normalizedEvaluationSets.length
                              ? "Loading evaluation sets..."
                              : normalizedEvaluationSets.length
                                ? "Add evaluation sets"
                                : fineTuningEvaluationSetsError || "No evaluation sets available."
                          )
                    )
                  )
                ),
                React.createElement(PlatformInstructionsEditor, {
                  value: String(form.instructions || ""),
                  onChange: (value) => updateCreateForm({ instructions: String(value || "") }),
                  title: "Instructions",
                  placeholder: "Add fine-tuning instructions here.",
                  ariaLabel: "Fine-tuning instructions",
                  readOnly: createBusy,
                  stickyHeader: false,
                  historyKey: "fine-tuning-create-instructions",
                  variant: "minimalistic-ui",
                  contentVariant: "text",
                  className: "playground-fine-tuning-instructions-section",
                }),
                createError ? React.createElement("div", { className: "playground-fine-tuning-create-error" }, createError) : null
                  )
                )
              )
          );
        }

`;
