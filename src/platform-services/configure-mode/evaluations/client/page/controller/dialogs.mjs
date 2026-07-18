export const EVALUATIONS_PAGE_CONTROLLER_DIALOGS_SCRIPT = String.raw`        function renderEvaluationTopNavActions() {
          if (!isEvaluationDetailPage || !activeSet || !evaluationTopNavActionsContainer || typeof createPortal !== "function") {
            return null;
          }

          return createPortal(
            React.createElement("div", { className: "playground-evaluations-detail-topnav-actions" },
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button",
                onClick: () => openRunEvaluationModal(activeSet.id),
                disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
              },
                React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Run Evaluation")
              ),
              React.createElement("div", {
                  className: "playground-tasks-toolbar-popup-shell",
                  ref: evaluationActionsPopoverRef,
                },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-header-icon-button is-plain" + (evaluationActionsPopoverOpen ? " is-active" : ""),
                  title: "Evaluation actions",
                  "aria-label": "Evaluation actions",
                  "aria-expanded": evaluationActionsPopoverOpen ? "true" : "false",
                  onClick: () => setEvaluationActionsPopoverOpen((current) => !current),
                }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
                evaluationActionsPopoverOpen
                  ? React.createElement(PlatformPopupSurface, {
                      className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                      onClick: (event) => event.stopPropagation(),
                    },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-popup-row",
                        onClick: () => openEvaluationRenameDialog(activeSet),
                      },
                        React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Rename")
                        )
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "tb-popup-row",
                        onClick: () => handleDeleteEvaluation(activeSet.id),
                      },
                        React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Delete")
                        )
                      )
                    )
                  : null
              )
            ),
            evaluationTopNavActionsContainer
          );
        }

        function renderEvaluationRenameModal() {
          if (!evaluationRenameState) {
            return null;
          }
          const isRunRename = evaluationRenameState.type === "run";

          return React.createElement(PlatformModalBackdrop, {
              className: "sidebar-thread-rename-scrim",
              onClick: closeEvaluationRenameDialog,
            },
              React.createElement(PlatformModalSurface, {
                as: "form",
                className: "sidebar-thread-rename-modal",
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleEvaluationRenameSubmit,
              },
                React.createElement("div", { className: "sidebar-thread-rename-title" }, isRunRename ? "Rename Evaluation Run" : "Rename Evaluation"),
                React.createElement("div", { className: "sidebar-thread-rename-copy" }, isRunRename ? "Choose a new name for this evaluation run." : "Choose a new name for this evaluation set."),
                React.createElement("input", {
                  ref: evaluationRenameInputRef,
                  className: "sidebar-thread-rename-input",
                  value: evaluationRenameValue,
                  onChange: (event) => {
                    setEvaluationRenameValue(event.target.value);
                    setEvaluationRenameError("");
                  },
                  placeholder: isRunRename ? "Run name" : "Evaluation name",
                }),
                evaluationRenameError
                  ? React.createElement("div", { className: "sidebar-thread-rename-error" }, evaluationRenameError)
                  : null,
                React.createElement("div", { className: "sidebar-thread-rename-actions" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "large",
                    type: "button",
                    className: "sidebar-thread-rename-button is-secondary",
                    onClick: closeEvaluationRenameDialog,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "large",
                    type: "submit",
                    className: "sidebar-thread-rename-button is-primary",
                  }, "Save")
                )
              )
            );
        }

        function renderEvaluationThreadCaseModal() {
          const normalizedSetId = String(evaluationThreadCaseModalSetId || "").trim();
          if (!normalizedSetId) {
            return null;
          }
          const normalizedSearch = String(evaluationThreadCaseSearchQuery || "").trim().toLowerCase();
          const selectedIds = new Set((Array.isArray(evaluationThreadCaseSelectedIds) ? evaluationThreadCaseSelectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
          const filteredThreads = sourceThreadOptions
            .filter((thread) => {
              if (!normalizedSearch) return true;
              return [
                thread.id,
                thread.title,
                thread.agentName,
                thread.environmentName,
                thread.status,
              ].join(" ").toLowerCase().includes(normalizedSearch);
            })
            .slice(0, 80);
          const isBusy = evaluationThreadCaseStatus.status === "loading" || evaluationThreadCaseStatus.status === "refreshing";
          const isGenerating = evaluationThreadCaseStatus.status === "loading";
          const selectedCount = selectedIds.size;
          const canGenerate = selectedCount > 0 && !isGenerating;
          const refreshThreadsForPicker = () => {
            if (typeof onRefreshThreadRecords !== "function" || isBusy) return;
            setEvaluationThreadCaseStatus({ status: "refreshing", message: "Refreshing threads...", error: "" });
            Promise.resolve(onRefreshThreadRecords())
              .then(() => setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" }))
              .catch((error) => setEvaluationThreadCaseStatus({ status: "error", message: "", error: error?.message || String(error) }));
          };

          return React.createElement(PlatformModalBackdrop, {
              className: "playground-evaluations-modal-backdrop",
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationThreadCaseModal,
            },
            React.createElement(PlatformModalSurface, {
                className: "playground-evaluations-modal playground-evaluations-thread-case-modal",
                onClick: (event) => event.stopPropagation(),
              },
              React.createElement("div", { className: "playground-evaluations-modal-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-evaluations-modal-title" }, "Refine Cases from Threads"),
                  React.createElement("div", { className: "playground-evaluations-modal-copy" },
                    "Select historical threads. An agent will analyze each thread and create an editable evaluation case, even if the historical run failed."
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-guardrails-row-action",
                  onClick: closeEvaluationThreadCaseModal,
                  "aria-label": "Close",
                }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-evaluations-thread-picker-toolbar" },
                React.createElement("input", {
                  className: "playground-evaluations-thread-picker-search",
                  value: evaluationThreadCaseSearchQuery,
                  placeholder: "Search threads",
                  onChange: (event) => setEvaluationThreadCaseSearchQuery(event.target.value),
                  autoFocus: true,
                }),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button",
                  onClick: refreshThreadsForPicker,
                  disabled: isBusy,
                },
                  React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Refresh")
                )
              ),
              React.createElement("div", { className: "playground-evaluations-thread-picker-list" },
                filteredThreads.length > 0
                  ? filteredThreads.map((thread) => {
                      const selected = selectedIds.has(thread.id);
                      const metaParts = [
                        thread.agentName || "No agent",
                        thread.environmentName || "",
                        thread.updatedAt ? formatPlaygroundEvaluationDate(thread.updatedAt) : "",
                        thread.messageCount ? String(thread.messageCount) + " messages" : "",
                      ].filter(Boolean);
                      return React.createElement("button", {
                          key: thread.id,
                          type: "button",
                          className: "playground-evaluations-thread-picker-row" + (selected ? " is-selected" : ""),
                          onClick: () => toggleEvaluationThreadCaseSelection(thread.id),
                        },
                        React.createElement("span", { className: "playground-evaluations-thread-picker-check", "aria-hidden": "true" },
                          selected ? React.createElement(Check, { width: 12, height: 12, strokeWidth: 2 }) : null
                        ),
                        React.createElement("span", { className: "playground-evaluations-thread-picker-main" },
                          React.createElement("span", { className: "playground-evaluations-thread-picker-title" }, thread.title || thread.id),
                          React.createElement("span", { className: "playground-evaluations-thread-picker-meta" }, metaParts.join(" / ") || thread.id)
                        ),
                        React.createElement("span", { className: "playground-evaluations-thread-picker-status" }, thread.status || "thread")
                      );
                    })
                  : React.createElement("div", { className: "playground-evaluations-thread-picker-empty" },
                      sourceThreadOptions.length > 0 ? "No matching threads." : "No eligible historical threads found."
                    )
              ),
              React.createElement("div", {
                className: "playground-evaluations-thread-picker-status-line" + (evaluationThreadCaseStatus.error ? " is-error" : ""),
              }, evaluationThreadCaseStatus.error || evaluationThreadCaseStatus.message || (selectedCount > 0 ? selectedCount + " selected" : "")),
              React.createElement("div", { className: "playground-evaluations-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button",
                  onClick: closeEvaluationThreadCaseModal,
                  disabled: isGenerating,
                }, "Cancel"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-create-button playground-metronome-publish-button",
                  onClick: handleGenerateEvaluationCasesFromThreads,
                  disabled: !canGenerate,
                }, isGenerating ? "Refining..." : "Refine Cases")
              )
            )
          );
        }

        function renderRunModal() {
          if (!evaluationRunModalOpen && !evaluationRunModalClosing) {
            return null;
          }
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet || {}, defaultEnvironmentId);
          const selectedEnvironmentKey = selectedEnvironmentChoice?.key || "";
          const selectedTargetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || targetSet?.targetAgentId || defaultAgentId);
          const selectedEvaluatorAgentId = String(form.evaluatorAgentId || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || agentOptions[0]?.id || "").trim();
          const canStartRun = Boolean(
            targetSet
            && selectedEnvironmentKey
            && selectedTargetAgentId
            && (evaluatorType !== "agent" || selectedEvaluatorAgentId)
          );
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-run-modal-backdrop"
                + (evaluationRunModalVisible ? " is-visible" : "")
                + (evaluationRunModalClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationRunModal,
            },
            React.createElement(PlatformModalSurface, {
                as: "form",
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-run-modal"
                  + (evaluationRunModalVisible ? " is-visible" : "")
                  + (evaluationRunModalClosing ? " is-closing" : ""),
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleConfirmRunEvaluation,
              },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(Play, { width: 18, height: 18, strokeWidth: 1.8 })
                  ),
                  React.createElement("input", {
                    className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                    value: form.name || "",
                    placeholder: "Run name",
                    onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), name: event.target.value })),
                    autoFocus: true,
                    "aria-label": "Run name",
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: closeEvaluationRunModal,
                  title: "Close",
                  "aria-label": "Close run evaluation modal",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-run-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-run-modal-body" },
                  React.createElement("div", { className: "playground-tasks-issue-modal-grid" },
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Agent to evaluate"),
                    React.createElement("select", {
                      className: "playground-tasks-issue-modal-select",
                      value: selectedTargetAgentId,
                      onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), targetAgentId: event.target.value })),
                    },
                      agentOptions.length > 0
                        ? agentOptions.map((agent) =>
                            React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                          )
                        : React.createElement("option", { value: "" }, "No agents available")
                    )
                  ),
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Environment"),
                    React.createElement("select", {
                      className: "playground-tasks-issue-modal-select",
                      value: selectedEnvironmentKey,
                      onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), environmentKey: event.target.value })),
                    },
                      React.createElement("optgroup", { label: "Computers" },
                        environmentChoices.filter((choice) => choice.type === "computer").length > 0
                          ? environmentChoices.filter((choice) => choice.type === "computer").map((choice) =>
                              React.createElement("option", { key: choice.key, value: choice.key }, choice.environmentName || choice.environmentId)
                            )
                          : React.createElement("option", { value: "", disabled: true }, "No computers available")
                      ),
                      React.createElement("optgroup", { label: "Projects" },
                        environmentChoices.filter((choice) => choice.type === "project").length > 0
                          ? environmentChoices.filter((choice) => choice.type === "project").map((choice) =>
                              React.createElement("option", { key: choice.key, value: choice.key, disabled: choice.disabled },
                                (choice.projectName || choice.projectId) + (choice.disabled ? " · no default computer" : "")
                              )
                            )
                          : React.createElement("option", { value: "", disabled: true }, "No projects available")
                      )
                    )
                  ),
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluator"),
                    React.createElement("select", {
                      className: "playground-tasks-issue-modal-select",
                      value: evaluatorType,
                      onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorType: event.target.value })),
                    },
                      React.createElement("option", { value: "exact" }, "Exact output"),
                      React.createElement("option", { value: "agent" }, "Agent evaluator"),
                      React.createElement("option", { value: "code" }, "Code evaluator")
                    )
                  ),
                  evaluatorType === "agent"
                    ? React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                        React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluator Agent"),
                        React.createElement("select", {
                          className: "playground-tasks-issue-modal-select",
                          value: selectedEvaluatorAgentId,
                          onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorAgentId: event.target.value })),
                        },
                          agentOptions.length > 0
                            ? agentOptions.map((agent) =>
                                React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                              )
                            : React.createElement("option", { value: "" }, "No agents available")
                        )
                      )
                    : null,
                  evaluatorType === "code"
                    ? React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field is-full" },
                        React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluator Code"),
                        React.createElement("textarea", {
                          className: "playground-tasks-issue-modal-input playground-tasks-issue-modal-textarea",
                          value: form.evaluatorCode || "",
                          placeholder: "return actual.trim() === expected.trim() ? 1 : 0;",
                          onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorCode: event.target.value })),
                        })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: closeEvaluationRunModal,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: !canStartRun,
                  }, "Run Evaluation")
                )
              )
            )
            )
          );
        }

        function renderCreateModal() {
          if (!evaluationCreateModalOpen && !evaluationCreateModalClosing) {
            return null;
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const evaluatorType = String(form.evaluatorType || "agent");
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-create-modal-backdrop"
                + (evaluationCreateModalVisible ? " is-visible" : "")
                + (evaluationCreateModalClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationCreateModal,
            },
            React.createElement(PlatformModalSurface, {
                as: "form",
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-create-modal"
                  + (evaluationCreateModalVisible ? " is-visible" : "")
                  + (evaluationCreateModalClosing ? " is-closing" : ""),
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleCreateEvaluation,
              },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(ChartColumnIncreasing, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-project-overview-outcome-editor-title-input",
                    value: form.name || "",
                    placeholder: "Evaluation name",
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), name: event.target.value })),
                    autoFocus: true,
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: closeEvaluationCreateModal,
                  title: "Close",
                  "aria-label": "Close",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-create-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-create-modal-body" },
                  React.createElement("div", { className: "playground-evaluations-form-grid" },
                    React.createElement("label", { className: "playground-evaluations-field" },
                      React.createElement("span", null, "Pass Threshold"),
                      React.createElement("input", {
                        type: "number",
                        min: "0",
                        max: "100",
                        step: "0.1",
                        className: "playground-evaluations-input",
                        value: form.passThreshold ?? "80",
                        onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), passThreshold: event.target.value })),
                      })
                    ),
                    React.createElement("label", { className: "playground-evaluations-field" },
                      React.createElement("span", null, "Evaluator"),
                      React.createElement("select", {
                        className: "playground-evaluations-select",
                        value: evaluatorType,
                        onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorType: event.target.value })),
                      },
                        React.createElement("option", { value: "exact" }, "Exact output"),
                        React.createElement("option", { value: "agent" }, "Agent"),
                        React.createElement("option", { value: "code" }, "Code")
                      )
                    )
                  ),
                  evaluatorType === "agent"
                    ? React.createElement("label", { className: "playground-evaluations-field is-full" },
                        React.createElement("span", null, "Evaluator Agent"),
                        React.createElement("select", {
                          className: "playground-evaluations-select",
                          value: form.evaluatorAgentId || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || String(agentOptions[0]?.id || "").trim(),
                          onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorAgentId: event.target.value })),
                        },
                          agentOptions.length > 0
                            ? agentOptions.map((agent) =>
                                React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                              )
                            : React.createElement("option", { value: "" }, "No agents available")
                        )
                      )
                    : null,
                  evaluatorType === "code"
                    ? React.createElement("label", { className: "playground-evaluations-field is-full" },
                        React.createElement("span", null, "Evaluator Code"),
                        React.createElement("textarea", {
                          className: "playground-evaluations-textarea",
                          value: form.evaluatorCode || "",
                          placeholder: "return actual.trim() === expected.trim() ? 1 : 0;",
                          onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorCode: event.target.value })),
                        })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: closeEvaluationCreateModal,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                  }, "Create Evaluation")
                )
              )
            )
          );
        }

        const isEvaluationRunPage = normalizedMode === "run" && activeSet && activeRun;
        const isEvaluationCasePage = normalizedMode === "case" && activeSet && activeRun && activeCase;
        const isEvaluationSubpage = isEvaluationDetailPage || isEvaluationRunPage || isEvaluationCasePage;
        const isEvaluationOverviewPage = !isEvaluationSubpage && normalizedMode !== "detail";
        const evaluationPageTitle = isEvaluationRunPage
          ? (activeRun.label || "Evaluation Run")
          : isEvaluationCasePage
            ? "Evaluation Case"
            : isEvaluationDetailPage
              ? (activeSet.name || "Untitled Evaluation")
              : "Evaluations";

        if (isEvaluationOverviewPage) {
          return React.createElement(React.Fragment, null,
            renderOverview(),
            renderRunModal(),
            renderEvaluationCaseEditorModal(),
            renderEvaluationRenameModal(),
            renderEvaluationThreadCaseModal(),
            renderCreateModal(),
            renderEvaluationVersionModal(),
            renderEvaluationVersionsSidebarPortal()
          );
        }

        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page" },
          renderEvaluationTopNavActions(),
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              evaluationVersionChangesState
                ? null
                : React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" + (isEvaluationOverviewPage ? " playground-guardrails-overview-browser-header" : "") },
                React.createElement("div", { className: "playground-files-library-header playground-guardrails-library-header" },
                  isEvaluationSubpage
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-resource-detail-back-button playground-guardrails-detail-back-button" + (isEvaluationSubpage ? " playground-evaluations-detail-back-button" : ""),
                        onClick: () => {
                          if (isEvaluationCasePage) {
                            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
                            setEvaluationsPageMode("run");
                            return;
                          }
                          if (isEvaluationRunPage) {
                            if (
                              evaluationRunReturnTarget?.page === "fine-tuning"
                              && String(evaluationRunReturnTarget?.fineTuneJobId || evaluationRunReturnTarget?.jobId || "").trim()
                              && typeof onEvaluationRunBack === "function"
                            ) {
                              onEvaluationRunBack(evaluationRunReturnTarget);
                              return;
                            }
                            setSelectedEvaluationRunId("");
                            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
                            setEvaluationsPageMode("detail");
                            return;
                          }
                          setEvaluationsPageMode("overview");
                        },
                        "aria-label": isEvaluationCasePage ? "Back to evaluation run" : isEvaluationRunPage ? "Back to evaluation" : "Back to evaluations",
                      },
                        React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Back")
                      )
                    : null,
                  React.createElement("div", { className: "playground-files-library-title-row" + (isEvaluationSubpage ? " playground-guardrails-detail-title-row" : "") },
                    React.createElement("h1", { className: "playground-files-library-title" + (isEvaluationSubpage ? " playground-guardrails-detail-title" : "") },
                      evaluationPageTitle
                    ),
                    isEvaluationDetailPage
                      ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
                          React.createElement("div", { className: "playground-evaluations-settings-header-control" },
                            renderEvaluationPassThresholdInline(activeSet)
                          ),
                          renderEvaluationPublishSplitButton()
                        )
                      : isEvaluationRunPage || isEvaluationCasePage
                        ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
                            React.createElement("span", { className: "playground-guardrails-readonly-pill" },
                              formatPlaygroundEvaluationDate(activeRun.completedAt || activeRun.createdAt)
                            )
                          )
                        : null
                  )
                )
              ),
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" + (isEvaluationOverviewPage ? " playground-guardrails-overview-browser-body" : "") },
                normalizedMode === "detail" && evaluationVersionChangesState
                  ? React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-version-changes-shell" },
                      renderEvaluationVersionChangesPage()
                    )
                  : normalizedMode === "case" ? renderCase() : normalizedMode === "run" ? renderRun() : normalizedMode === "detail" ? renderDetail() : renderOverview()
              )
            )
          ),
	          renderRunModal(),
	          renderEvaluationCaseEditorModal(),
	          renderEvaluationRenameModal(),
            renderEvaluationThreadCaseModal(),
	          renderCreateModal(),
            renderEvaluationVersionModal(),
            renderEvaluationVersionsSidebarPortal()
	        );
      }
`;
