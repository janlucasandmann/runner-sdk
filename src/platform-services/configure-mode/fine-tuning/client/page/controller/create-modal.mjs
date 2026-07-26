export const FINE_TUNING_PAGE_CONTROLLER_CREATE_MODAL_SCRIPT = String.raw`        function renderCreateModal() {
          if (!fineTuningCreateModalOpen && !modalClosing) return null;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedBaselineModes = form.evaluationBaselineModes && typeof form.evaluationBaselineModes === "object" && !Array.isArray(form.evaluationBaselineModes)
            ? form.evaluationBaselineModes
            : {};
          const selectedEvaluationSets = normalizedEvaluationSets.filter((set) => selectedSetIds.includes(set.id));
          const customTargetAgents = normalizedAgents.filter((agent) => !isDefaultFineTuningTargetAgent(agent));
          const selectedTargetAgentId = normalizePlaygroundFineTuningString(
            form.targetAgentId || customTargetAgents[0]?.id || ""
          );
          const selectedTargetAgent = customTargetAgents.find((agent) => (
            normalizePlaygroundFineTuningString(agent?.id) === selectedTargetAgentId
          )) || null;
          const selectedFineTunerAgentId = normalizePlaygroundFineTuningString(
            form.fineTunerAgentId || form.agentId || defaultAgentId || normalizedAgents[0]?.id || ""
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
          const buildAgentOption = (agent) => {
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
          };
          const targetAgentOptions = customTargetAgents.map(buildAgentOption);
          const fineTunerAgentOptions = normalizedAgents.map(buildAgentOption);
          const renderSelectedAgentValue = (agent, fallbackLabel) => {
            const label = normalizePlaygroundFineTuningString(
              agent?.name || agent?.label || agent?.title || agent?.id || fallbackLabel
            );
            const photoUrl = normalizePlaygroundFineTuningString(
              agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL
            );
            return React.createElement("span", { className: "playground-fine-tuning-create-selector-value" },
              React.createElement(AccountAvatar, {
                className: "playground-fine-tuning-create-selector-avatar",
                imageClassName: "playground-fine-tuning-create-selector-avatar-image",
                fallbackLabel: getPlaygroundFineTuningInitials(label),
                photoUrl,
              }),
              React.createElement("span", null, label)
            );
          };
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
          const objectiveOptions = [
            {
              value: "evaluation_targets",
              label: "Evaluation thresholds",
              description: "Use each evaluation set's pass threshold.",
            },
            {
              value: "custom",
              label: "Custom target",
              description: "Use the score and pass-rate targets below.",
            },
          ];
          const publicationOptions = [
            {
              value: "manual",
              label: "Review before publishing",
              description: "Keep the best candidate as a draft.",
            },
            {
              value: "auto_on_target",
              label: "Publish when target is met",
              description: "Publish only after independent verification.",
            },
          ];
          const toggleEvaluationSet = (setId) => {
            const normalizedSetId = normalizePlaygroundFineTuningString(setId);
            if (!normalizedSetId) return;
            if (selectedSetIds.includes(normalizedSetId)) {
              const nextRunIds = { ...selectedRunIds };
              const nextBaselineModes = { ...selectedBaselineModes };
              delete nextRunIds[normalizedSetId];
              delete nextBaselineModes[normalizedSetId];
              updateCreateForm({
                evaluationSetIds: selectedSetIds.filter((id) => id !== normalizedSetId),
                evaluationRunIds: nextRunIds,
                evaluationBaselineModes: nextBaselineModes,
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
              evaluationBaselineModes: {
                ...selectedBaselineModes,
                [normalizedSetId]: "fresh",
              },
            });
          };
          const updateEvaluationSetBaseline = (setId, value) => {
            const normalizedSetId = normalizePlaygroundFineTuningString(setId);
            if (!normalizedSetId) return;
            const normalizedValue = normalizePlaygroundFineTuningString(value);
            const existingRunId = normalizedValue.startsWith("existing:")
              ? normalizedValue.slice("existing:".length)
              : "";
            updateCreateForm({
              evaluationRunIds: {
                ...selectedRunIds,
                [normalizedSetId]: existingRunId || selectedRunIds[normalizedSetId] || "",
              },
              evaluationBaselineModes: {
                ...selectedBaselineModes,
                [normalizedSetId]: existingRunId ? "existing" : "fresh",
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
              title: "New Optimization",
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
                  disabled: createBusy
                    || !String(form.name || "").trim()
                    || !selectedTargetAgentId
                    || !selectedFineTunerAgentId
                    || !selectedEnvironmentId
                    || selectedSetIds.length === 0,
                  "aria-busy": createBusy || undefined,
                }, createBusy ? "Starting..." : "Start Optimization")
              ),
            },
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-create-modal-shell playground-fine-tuning-create-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-create-modal-body playground-fine-tuning-create-modal-body" },
                  React.createElement("div", { className: "playground-evaluations-form-grid" },
                React.createElement("div", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Target Agent"),
                  React.createElement(PlatformSelector, {
                    value: selectedTargetAgentId,
                    options: targetAgentOptions,
                    onValueChange: (nextValue) => updateCreateForm({ targetAgentId: nextValue }),
                    ariaLabel: "Select agent to optimize",
                    label: renderSelectedAgentValue(selectedTargetAgent, "Select agent"),
                    placeholder: "Select agent",
                    disabled: createBusy || targetAgentOptions.length === 0,
                    alignment: "end",
                    popupAlignment: "right",
                    fullWidth: true,
                    emptyContent: "No custom agents are available.",
                    popupWidth: "min(280px, calc(100vw - 48px))",
                    popupMaxWidth: "calc(100vw - 48px)",
                    popupMaxHeight: "min(320px, calc(100vh - 120px))",
                    className: "playground-tasks-detail-central-selector playground-fine-tuning-create-selector",
                    triggerClassName: "playground-tasks-detail-central-selector-trigger playground-fine-tuning-create-selector-trigger",
                    popupClassName: "playground-tasks-detail-central-selector-popup playground-fine-tuning-create-selector-popup",
                  })
                ),
                React.createElement("div", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Optimizer Agent"),
                  React.createElement(PlatformSelector, {
                    value: selectedFineTunerAgentId,
                    options: fineTunerAgentOptions,
                    onValueChange: (nextValue) => updateCreateForm({ fineTunerAgentId: nextValue }),
                    ariaLabel: "Select optimizer agent",
                    label: renderSelectedAgentValue(selectedFineTunerAgent, selectedFineTunerAgentLabel),
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
                  React.createElement("span", null, "Environment"),
                  React.createElement(PlatformSelector, {
                    value: selectedEnvironmentId,
                    options: environmentOptions,
                    onValueChange: (nextValue) => updateCreateForm({ environmentId: nextValue }),
                    ariaLabel: "Select environment",
                    label: React.createElement("span", { className: "playground-fine-tuning-create-selector-value" },
                      React.createElement(Monitor, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      }),
                      React.createElement("span", null, selectedEnvironmentLabel)
                    ),
                    placeholder: "Select environment",
                    disabled: createBusy || environmentOptions.length === 0,
                    alignment: "end",
                    popupAlignment: "right",
                    fullWidth: true,
                    emptyContent: "No environments available.",
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
                            const baselineMode = selectedBaselineModes[set.id] === "existing" && selectedRunId
                              ? "existing"
                              : "fresh";
                            const baselineOptions = [
                              {
                                value: "fresh",
                                label: "Fresh baseline",
                                description: "Run this evaluation before optimization.",
                              },
                              ...runs.map((run) => ({
                                value: "existing:" + run.id,
                                label: run.label || run.id,
                                description: "Use this completed run as the baseline.",
                              })),
                            ];
                            return React.createElement("div", {
                                key: set.id,
                                className: "playground-fine-tuning-evaluation-option playground-mission-control-modal-outcome-row is-selected",
                              },
                              React.createElement("div", { className: "playground-mission-control-modal-outcome-copy" },
                                React.createElement("span", { className: "playground-mission-control-modal-outcome-input playground-fine-tuning-evaluation-name" }, set.name || "Untitled Evaluation")
                              ),
                              React.createElement(PlatformSelector, {
                                value: baselineMode === "existing" ? "existing:" + selectedRunId : "fresh",
                                options: baselineOptions,
                                onValueChange: (nextValue) => updateEvaluationSetBaseline(set.id, nextValue),
                                ariaLabel: "Choose baseline for " + (set.name || "evaluation set"),
                                label: baselineMode === "existing"
                                  ? (runs.find((run) => run.id === selectedRunId)?.label || selectedRunId)
                                  : "Fresh baseline",
                                alignment: "end",
                                popupAlignment: "right",
                                popupWidth: "min(320px, calc(100vw - 48px))",
                                popupMaxHeight: 280,
                                className: "playground-tasks-detail-central-selector playground-fine-tuning-baseline-selector",
                                triggerClassName: "playground-tasks-detail-central-selector-trigger",
                                popupClassName: "playground-tasks-detail-central-selector-popup",
                              }),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-mission-control-modal-outcome-menu-trigger",
                                onClick: () => toggleEvaluationSet(set.id),
                                title: "Remove evaluation set",
                                "aria-label": "Remove " + (set.name || "evaluation set"),
                              }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.9 }))
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
                React.createElement("section", { className: "playground-fine-tuning-policy-section" },
                  React.createElement("div", { className: "playground-fine-tuning-policy-title" }, "Optimization Policy"),
                  React.createElement("div", { className: "playground-fine-tuning-policy-grid" },
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Objective"),
                      React.createElement(PlatformSelector, {
                        value: form.objectiveMode === "custom" ? "custom" : "evaluation_targets",
                        options: objectiveOptions,
                        onValueChange: (nextValue) => updateCreateForm({ objectiveMode: nextValue }),
                        ariaLabel: "Choose optimization objective",
                        label: form.objectiveMode === "custom" ? "Custom target" : "Evaluation thresholds",
                        fullWidth: true,
                        popupAlignment: "left",
                        className: "playground-tasks-detail-central-selector playground-fine-tuning-create-selector",
                        triggerClassName: "playground-tasks-detail-central-selector-trigger playground-fine-tuning-create-selector-trigger",
                        popupClassName: "playground-tasks-detail-central-selector-popup",
                      })
                    ),
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Publication"),
                      React.createElement(PlatformSelector, {
                        value: form.publicationMode === "auto_on_target" ? "auto_on_target" : "manual",
                        options: publicationOptions,
                        onValueChange: (nextValue) => updateCreateForm({ publicationMode: nextValue }),
                        ariaLabel: "Choose publication policy",
                        label: form.publicationMode === "auto_on_target" ? "Publish when target is met" : "Review before publishing",
                        fullWidth: true,
                        popupAlignment: "right",
                        className: "playground-tasks-detail-central-selector playground-fine-tuning-create-selector",
                        triggerClassName: "playground-tasks-detail-central-selector-trigger playground-fine-tuning-create-selector-trigger",
                        popupClassName: "playground-tasks-detail-central-selector-popup",
                      })
                    ),
                    form.objectiveMode === "custom"
                      ? React.createElement(React.Fragment, null,
                          React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                            React.createElement("span", null, "Target score"),
                            React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                              React.createElement("input", {
                                type: "number",
                                min: "0",
                                max: "100",
                                step: "1",
                                value: Number(form.targetScorePercent ?? 80),
                                onChange: (event) => updateCreateForm({ targetScorePercent: event.target.value }),
                                disabled: createBusy,
                              }),
                              React.createElement("span", null, "%")
                            )
                          ),
                          React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                            React.createElement("span", null, "Target pass rate"),
                            React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                              React.createElement("input", {
                                type: "number",
                                min: "0",
                                max: "100",
                                step: "1",
                                value: Number(form.targetPassRatePercent ?? 80),
                                onChange: (event) => updateCreateForm({ targetPassRatePercent: event.target.value }),
                                disabled: createBusy,
                              }),
                              React.createElement("span", null, "%")
                            )
                          )
                        )
                      : null,
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Max cost increase"),
                      React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                        React.createElement("input", {
                          type: "number",
                          min: "0",
                          max: "1000",
                          step: "1",
                          value: form.maximumCostIncreasePercent ?? "",
                          placeholder: "Not set",
                          onChange: (event) => updateCreateForm({
                            maximumCostIncreasePercent: event.target.value,
                          }),
                          disabled: createBusy,
                        }),
                        React.createElement("span", null, "%")
                      )
                    ),
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Max latency increase"),
                      React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                        React.createElement("input", {
                          type: "number",
                          min: "0",
                          max: "1000",
                          step: "1",
                          value: form.maximumLatencyIncreasePercent ?? "",
                          placeholder: "Not set",
                          onChange: (event) => updateCreateForm({
                            maximumLatencyIncreasePercent: event.target.value,
                          }),
                          disabled: createBusy,
                        }),
                        React.createElement("span", null, "%")
                      )
                    ),
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Max iterations"),
                      React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                        React.createElement("input", {
                          type: "number",
                          min: "1",
                          max: "20",
                          step: "1",
                          value: Number(form.maxIterations ?? 3),
                          onChange: (event) => updateCreateForm({ maxIterations: event.target.value }),
                          disabled: createBusy,
                        })
                      )
                    ),
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Budget"),
                      React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                        React.createElement("span", null, "$"),
                        React.createElement("input", {
                          type: "number",
                          min: "0.01",
                          step: "0.01",
                          value: Number(form.budgetUsd ?? 10),
                          onChange: (event) => updateCreateForm({ budgetUsd: event.target.value }),
                          disabled: createBusy,
                        })
                      )
                    ),
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Time limit"),
                      React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                        React.createElement("input", {
                          type: "number",
                          min: "5",
                          max: "1440",
                          step: "5",
                          value: Number(form.maxDurationMinutes ?? 120),
                          onChange: (event) => updateCreateForm({ maxDurationMinutes: event.target.value }),
                          disabled: createBusy,
                        }),
                        React.createElement("span", null, "min")
                      )
                    ),
                    React.createElement("label", { className: "playground-fine-tuning-policy-field" },
                      React.createElement("span", null, "Plateau stop"),
                      React.createElement("div", { className: "playground-fine-tuning-number-shell" },
                        React.createElement("input", {
                          type: "number",
                          min: "1",
                          max: "5",
                          step: "1",
                          value: Number(form.plateauIterations ?? 2),
                          onChange: (event) => updateCreateForm({ plateauIterations: event.target.value }),
                          disabled: createBusy,
                        }),
                        React.createElement("span", null, "iterations")
                      )
                    )
                  ),
                  React.createElement("label", { className: "playground-fine-tuning-policy-checkbox" },
                    React.createElement("input", {
                      type: "checkbox",
                      checked: form.publishBestOnLimit === true,
                      onChange: (event) => updateCreateForm({ publishBestOnLimit: event.target.checked }),
                      disabled: createBusy,
                    }),
                    React.createElement("span", null, "Publish the best verified candidate if a limit is reached")
                  )
                ),
                React.createElement(PlatformInstructionsEditor, {
                  value: String(form.instructions || ""),
                  onChange: (value) => updateCreateForm({ instructions: String(value || "") }),
                  title: "Instructions",
                  placeholder: "Add optimization instructions here.",
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
