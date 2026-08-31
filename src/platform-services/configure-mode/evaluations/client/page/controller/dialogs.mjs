export const EVALUATIONS_PAGE_CONTROLLER_DIALOGS_SCRIPT = String.raw`        function renderEvaluationTopNavActions() {
          if (
            !supportsEvaluationActionsPopover
            || !activeSet
            || typeof createPortal !== "function"
            || (!evaluationTopNavActionsContainer && !evaluationBreadcrumbActionsContainer)
          ) {
            return null;
          }

          const rightActionsPortal = isEvaluationDatasetCasePage && evaluationTopNavActionsContainer
            ? createPortal(
                React.createElement("div", { className: "playground-evaluations-detail-topnav-actions playground-evaluations-dataset-case-topnav-actions" },
                  React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    size: "small",
                    disabled: !isEvaluationCaseEditorDirty(evaluationCaseEditorState),
                    onClick: saveEvaluationCaseEditor,
                  },
                    React.createElement(Bookmark, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Save Changes")
                  )
                ),
                evaluationTopNavActionsContainer
              )
            : isEvaluationDetailPage && evaluationTopNavActionsContainer
              ? createPortal(
                React.createElement("div", { className: "playground-evaluations-detail-topnav-actions" },
                  evaluationDetailTab !== "cases"
                    && evaluationDetailTab !== "data"
                    && evaluationDetailTab !== "settings"
                    ? React.createElement(PlatformSwitch, {
                        value: evaluationAnalyticsTimeframe,
                        options: [
                          { value: "day", label: "24H" },
                          { value: "week", label: "7D" },
                          { value: "month", label: "30D" },
                        ],
                        onValueChange: setEvaluationAnalyticsTimeframe,
                        ariaLabel: "Evaluation analytics time frame",
                      })
                    : null,
                  renderEvaluationPublishSplitButton()
                ),
                evaluationTopNavActionsContainer
              )
              : null;
          const breadcrumbActionsPortal = evaluationBreadcrumbActionsContainer
            ? createPortal(
                isEvaluationRunActionsPage
                  ? React.createElement(PlatformPopup, {
                    open: evaluationActionsPopoverOpen,
                    variant: "minimal",
                    portal: true,
                    placement: "bottom-start",
                    portalOffset: 6,
                    animation: "down-in",
                    rootRef: evaluationActionsPopoverRef,
                    surfaceRef: evaluationActionsPopoverSurfaceRef,
                    rootClassName: "playground-evaluations-breadcrumb-action-menu",
                    surfaceClassName: "playground-evaluations-breadcrumb-action-popup",
                    surfaceProps: {
                      role: "menu",
                      "aria-label": "Evaluation run actions",
                    },
                    trigger: React.createElement(PlatformIconButton, {
                      type: "button",
                      size: "compact",
                      active: evaluationActionsPopoverOpen,
                      title: "Evaluation run actions",
                      "aria-label": "Evaluation run actions",
                      "aria-haspopup": "menu",
                      "aria-expanded": evaluationActionsPopoverOpen ? "true" : "false",
                      onClick: () => setEvaluationActionsPopoverOpen((current) => !current),
                    }, React.createElement(Ellipsis, { width: 15, height: 15, strokeWidth: 1.8 }))
                  },
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        setEvaluationActionsPopoverOpen(false);
                        handleDeleteEvaluationRun(activeSet.id, activeRun.id);
                      },
                    },
                      React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Delete Run")
                    )
                  )
                  : React.createElement(PlatformPopup, {
                  open: evaluationActionsPopoverOpen,
                  variant: "minimal",
                  portal: true,
                  placement: "bottom-start",
                  portalOffset: 6,
                  animation: "down-in",
                  rootRef: evaluationActionsPopoverRef,
                  surfaceRef: evaluationActionsPopoverSurfaceRef,
                  rootClassName: "playground-evaluations-breadcrumb-action-menu",
                  surfaceClassName: "playground-evaluations-breadcrumb-action-popup",
                  surfaceProps: {
                    role: "menu",
                    "aria-label": "Evaluation actions",
                  },
                  trigger: React.createElement(PlatformIconButton, {
                    type: "button",
                    size: "compact",
                    active: evaluationActionsPopoverOpen,
                    title: "Evaluation actions",
                    "aria-label": "Evaluation actions",
                    "aria-haspopup": "menu",
                    "aria-expanded": evaluationActionsPopoverOpen ? "true" : "false",
                    onClick: () => setEvaluationActionsPopoverOpen((current) => !current),
                  }, React.createElement(Ellipsis, { width: 15, height: 15, strokeWidth: 1.8 }))
                },
                  React.createElement("div", {
                      className: "tb-popup-row playground-thread-nav-popup-static-row",
                      role: "presentation",
                    },
                    React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, "Evaluation ID"),
                      React.createElement("span", {
                        className: "playground-thread-nav-popup-thread-id",
                        title: activeSet.id,
                      }, activeSet.id)
                    )
                  ),
                  React.createElement("div", {
                    className: "playground-thread-nav-popup-divider",
                    "aria-hidden": "true",
                  }),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setEvaluationActionsPopoverOpen(false);
                      openEvaluationRenameDialog(activeSet);
                    },
                  },
                    React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Rename")
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
                    onClick: () => {
                      setEvaluationActionsPopoverOpen(false);
                      openRunEvaluationModal(activeSet.id);
                    },
                  },
                    React.createElement(Play, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Run Evaluation")
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setEvaluationActionsPopoverOpen(false);
                      openEvaluationVersionsSidebar();
                    },
                  },
                    React.createElement(History, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Version History")
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setEvaluationActionsPopoverOpen(false);
                      handleDeleteEvaluation(activeSet.id);
                    },
                  },
                    React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Delete")
                  )
                ),
                evaluationBreadcrumbActionsContainer
              )
            : null;

          return React.createElement(
            React.Fragment,
            null,
            rightActionsPortal,
            breadcrumbActionsPortal
          );
        }

        function renderEvaluationUnsavedRunDialog() {
          if (!evaluationUnsavedRunDialog?.setId) {
            return null;
          }
          const isSaving = evaluationUnsavedRunDialog.status === "saving";
          const targetSet = normalizedSets.find((set) => set.id === evaluationUnsavedRunDialog.setId) || activeSet;
          const publishedRunSource = getEvaluationPublishedRunSource(targetSet);
          const canRunSavedVersion = Boolean(
            publishedRunSource?.set
            && Array.isArray(publishedRunSource.set.dataRows)
            && publishedRunSource.set.dataRows.length > 0
          );
          return React.createElement(PlatformModal, {
              open: true,
              portal: true,
              size: "small",
              title: "Unsaved Changes",
              onClose: closeEvaluationUnsavedRunDialog,
              closeOnBackdrop: !isSaving,
              closeOnEscape: !isSaving,
              closeButtonDisabled: isSaving,
              closeButtonLabel: "Close unsaved changes dialog",
              ariaLabel: "Choose which evaluation version to run",
              className: "playground-evaluations-unsaved-run-modal",
              bodyClassName: "playground-evaluations-unsaved-run-modal-body",
              footerClassName: "playground-evaluations-modal-actions",
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  disabled: isSaving,
                  onClick: closeEvaluationUnsavedRunDialog,
                }, "Cancel"),
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  disabled: isSaving || !canRunSavedVersion,
                  onClick: runEvaluationWithoutDraftChanges,
                }, "Run Without Changes"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "button",
                  disabled: isSaving,
                  "aria-busy": isSaving || undefined,
                  onClick: () => void saveEvaluationChangesBeforeRun(),
                },
                  isSaving
                    ? React.createElement(Loader2, {
                        className: "playground-evaluations-create-submit-spinner",
                        width: 14,
                        height: 14,
                        strokeWidth: 2,
                        "aria-hidden": "true",
                      })
                    : null,
                  React.createElement("span", null, isSaving ? "Saving..." : "Save & Continue")
                )
              ),
            },
            React.createElement("p", { className: "playground-evaluations-unsaved-run-copy" },
              "This evaluation has unsaved changes. Save them as a new published version before configuring the run, or continue with the last saved version."
            ),
            evaluationUnsavedRunDialog.error
              ? React.createElement("div", {
                  className: "playground-evaluations-unsaved-run-error",
                  role: "alert",
                }, evaluationUnsavedRunDialog.error)
              : null
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
            .slice(0, 40);
          const isBusy = evaluationThreadCaseStatus.status === "loading" || evaluationThreadCaseStatus.status === "refreshing";
          const isGenerating = evaluationThreadCaseStatus.status === "loading";
          const selectedCount = selectedIds.size;
          const canGenerate = selectedCount > 0 && !isGenerating;
          const threadColumns = [
            {
              id: "title",
              header: "Title",
              accessor: (thread) => thread.title || thread.id,
              width: "minmax(250px, 1.6fr)",
              cell: ({ row: thread }) => React.createElement("span", {
                className: "playground-evaluations-thread-picker-cell is-title",
                title: thread.title || thread.id,
              }, thread.title || thread.id),
            },
            {
              id: "agent",
              header: "Agent",
              accessor: (thread) => thread.agentName || "No agent",
              width: "minmax(130px, 0.8fr)",
              cell: ({ row: thread }) => {
                const label = thread.agentName || "No agent";
                const normalizedAgentName = String(thread.agentName || "").trim().toLowerCase();
                const agent = getPlaygroundEvaluationAgentRecord(agentOptions, thread.agentId)
                  || agentOptions.find((candidate) => {
                    const candidateName = String(candidate?.name || candidate?.label || candidate?.title || "").trim().toLowerCase();
                    return normalizedAgentName && candidateName === normalizedAgentName;
                  })
                  || null;
                const photoUrl = String(thread.agentAvatarUrl || getPlaygroundEvaluationAgentPhotoUrl(agent)).trim();
                return React.createElement("span", {
                    className: "playground-evaluations-thread-picker-agent-cell",
                    title: label,
                  },
                  React.createElement("span", {
                    className: "playground-evaluations-run-agent-avatar",
                    "aria-hidden": "true",
                  }, photoUrl
                    ? React.createElement("img", { src: photoUrl, alt: "" })
                    : getPlaygroundEvaluationInitials(label)),
                  React.createElement("span", {
                    className: "playground-evaluations-thread-picker-cell is-agent-name",
                  }, label)
                );
              },
            },
            {
              id: "time",
              header: "Time",
              accessor: (thread) => thread.updatedAt || thread.createdAt || "",
              width: "minmax(110px, 0.55fr)",
              cell: ({ row: thread }) => React.createElement("span", {
                className: "playground-evaluations-thread-picker-cell is-muted",
              }, thread.updatedAt || thread.createdAt
                ? formatPlaygroundEvaluationDate(thread.updatedAt || thread.createdAt)
                : "-"),
            },
          ];

          return React.createElement(PlatformModal, {
              open: evaluationThreadCaseModalOpen,
              portal: true,
              size: "medium",
              width: "min(760px, calc(100vw - 32px))",
              maxHeight: "min(720px, calc(100vh - 48px))",
              title: "Refine Cases from Threads",
              headerActions: React.createElement(PlatformSearch, {
                className: "playground-evaluations-thread-picker-header-search",
                value: evaluationThreadCaseSearchQuery,
                placeholder: "Search threads",
                "aria-label": "Search historical threads",
                onChange: (event) => setEvaluationThreadCaseSearchQuery(event.currentTarget.value),
              }),
              onClose: closeEvaluationThreadCaseModal,
              onExited: finishCloseEvaluationThreadCaseModal,
              closeButtonDisabled: isGenerating,
              closeButtonLabel: "Close thread picker",
              ariaLabel: "Refine evaluation cases from threads",
              className: "playground-evaluations-thread-case-modal",
              bodyClassName: "playground-evaluations-thread-case-modal-body",
              footerClassName: "playground-evaluations-modal-actions",
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "medium",
                  onClick: closeEvaluationThreadCaseModal,
                  disabled: isGenerating,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  type: "button",
                  size: "medium",
                  onClick: handleGenerateEvaluationCasesFromThreads,
                  disabled: !canGenerate,
                }, isGenerating ? "Refining..." : "Refine Cases")
              ),
            },
              React.createElement(PlatformDataTable, {
                rows: filteredThreads,
                columns: threadColumns,
                getRowId: (thread) => thread.id,
                ariaLabel: "Historical threads",
                className: "playground-evaluations-thread-picker-table",
                surface: "plain",
                layout: "fill",
                variant: "minimalistic-ui",
                sticky: false,
                pagination: {
                  defaultValue: {
                    pageIndex: 0,
                    pageSize: 10,
                  },
                  pageSizeOptions: [10, 20, 40],
                },
                rowMinHeight: 44,
                selection: {
                  enabled: true,
                  value: selectedIds,
                  onChange: ({ selectedIds: nextSelectedIds }) => {
                    setEvaluationThreadCaseSelectedIds(Array.from(nextSelectedIds));
                  },
                  ariaLabel: (thread) => "Select " + (thread.title || thread.id),
                },
                loading: isBusy && filteredThreads.length === 0,
                emptyState: sourceThreadOptions.length > 0
                  ? "No matching threads."
                  : "No eligible historical threads found.",
                noResultsState: "No matching threads.",
                onRowActivate: (thread) => toggleEvaluationThreadCaseSelection(thread.id),
              })
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
          const selectedTargetAgent = getPlaygroundEvaluationAgentRecord(agentOptions, selectedTargetAgentId);
          const selectedEvaluatorAgent = getPlaygroundEvaluationAgentRecord(agentOptions, selectedEvaluatorAgentId);
          const getRunAgentLabel = (agent, fallbackId) => String(
            agent?.name
            || agent?.label
            || agent?.title
            || fallbackId
            || "Select agent"
          ).trim();
          const renderRunAgentAvatar = (agent, label) => {
            const photoUrl = getPlaygroundEvaluationAgentPhotoUrl(agent);
            return React.createElement("span", {
                className: "playground-evaluations-run-agent-avatar",
                "aria-hidden": "true",
              }, photoUrl
                ? React.createElement("img", { src: photoUrl, alt: "" })
                : getPlaygroundEvaluationInitials(label));
          };
          const createRunAgentOptions = () => agentOptions
            .filter((agent) => String(agent?.id || "").trim())
            .map((agent) => {
              const agentId = String(agent.id).trim();
              const agentLabel = getRunAgentLabel(agent, agentId);
              return {
                value: agentId,
                label: agentLabel,
                leading: renderRunAgentAvatar(agent, agentLabel),
              };
            });
          const runAgentOptions = createRunAgentOptions();
          const targetAgentLabel = getRunAgentLabel(selectedTargetAgent, selectedTargetAgentId);
          const evaluatorAgentLabel = getRunAgentLabel(selectedEvaluatorAgent, selectedEvaluatorAgentId);
          const environmentSelectorOptions = environmentChoices
            .filter((choice) => String(choice?.key || "").trim())
            .map((choice) => {
              const isProject = choice.type === "project";
              return {
                value: choice.key,
                label: isProject
                  ? (choice.projectName || choice.projectId || choice.key)
                  : (choice.environmentName || choice.environmentId || choice.key),
                description: isProject
                  ? (choice.disabled ? "Project · no default computer" : "Project")
                  : "Computer",
                leading: React.createElement(isProject ? Rocket : Monitor, {
                  width: 14,
                  height: 14,
                  strokeWidth: 1.8,
                  "aria-hidden": "true",
                }),
                disabled: Boolean(choice.disabled),
              };
            });
          const selectedEnvironmentLabel = selectedEnvironmentChoice
            ? (selectedEnvironmentChoice.type === "project"
              ? (selectedEnvironmentChoice.projectName || selectedEnvironmentChoice.projectId)
              : (selectedEnvironmentChoice.environmentName || selectedEnvironmentChoice.environmentId))
            : "Select environment";
          const evaluatorTypeOptions = [
            { value: "exact", label: "Exact output", description: "Require an exact output match." },
            { value: "agent", label: "Agent evaluator", description: "Use an agent to score each result." },
            {
              value: "code",
              label: "Code evaluator (unavailable)",
              description: "Requires the isolated grader sandbox.",
              disabled: true,
            },
          ];
          const selectedEvaluatorTypeLabel = evaluatorTypeOptions.find((option) => option.value === evaluatorType)?.label || "Agent evaluator";
          const renderRunSelector = ({
            value,
            options,
            label,
            ariaLabel,
            onValueChange,
            disabled = false,
            emptyContent = "No options available.",
          }) => React.createElement(PlatformSelector, {
            value,
            options,
            onValueChange,
            ariaLabel,
            label,
            placeholder: label,
            disabled: evaluationRunSubmitting || disabled,
            alignment: "end",
            popupAlignment: "right",
            fullWidth: true,
            emptyContent,
            popupWidth: "min(300px, calc(100vw - 48px))",
            popupMaxWidth: "calc(100vw - 48px)",
            popupMaxHeight: "min(320px, calc(100vh - 120px))",
            className: "playground-tasks-detail-central-selector",
            triggerClassName: "playground-tasks-detail-central-selector-trigger",
            popupClassName: "playground-tasks-detail-central-selector-popup",
          });
          const renderRunFact = (label, control) => React.createElement("div", {
              className: "playground-tasks-detail-fact playground-evaluations-run-modal-fact",
            },
            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
            React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
          );
          const canStartRun = Boolean(
            targetSet
            && getEvaluationRunnableCaseCount(targetSet) > 0
            && selectedEnvironmentKey
            && selectedTargetAgentId
            && evaluatorType !== "code"
            && (evaluatorType !== "agent" || selectedEvaluatorAgentId)
          );
          return React.createElement(PlatformModal, {
              open: evaluationRunModalOpen,
              visible: evaluationRunModalVisible,
              closing: evaluationRunModalClosing,
              animationDurationMs: 75,
              portal: true,
              as: "form",
              size: "medium",
              maxHeight: "min(720px, calc(100vh - 48px))",
              scrollable: true,
              title: "Run Evaluation",
              headerVariant: "search",
              headerSearchProps: {
                icon: Play,
                value: form.name || "",
                placeholder: "Run name",
                "aria-label": "Run name",
                autoComplete: "off",
                disabled: evaluationRunSubmitting,
                onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), name: event.target.value })),
              },
              onClose: () => {
                if (!evaluationRunSubmitting) closeEvaluationRunModal();
              },
              closeOnBackdrop: !evaluationRunSubmitting,
              closeOnEscape: !evaluationRunSubmitting,
              closeButtonDisabled: evaluationRunSubmitting,
              closeButtonLabel: "Close run evaluation modal",
              ariaLabel: "Run evaluation",
              className: "playground-evaluations-run-modal",
              backdropClassName: "playground-evaluations-run-modal-backdrop",
              bodyClassName: "playground-evaluations-run-modal-body",
              footerClassName: "playground-evaluations-modal-actions",
              surfaceProps: { onSubmit: handleConfirmRunEvaluation },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  disabled: evaluationRunSubmitting,
                  onClick: () => closeEvaluationRunModal(),
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: evaluationRunSubmitting || !canStartRun,
                  "aria-busy": evaluationRunSubmitting || undefined,
                },
                  evaluationRunSubmitting
                    ? React.createElement(Loader2, {
                        className: "playground-evaluations-create-submit-spinner",
                        width: 14,
                        height: 14,
                        strokeWidth: 2,
                        "aria-hidden": "true",
                      })
                    : null,
                  React.createElement("span", null, evaluationRunSubmitting ? "Preparing..." : "Run Evaluation")
                )
              ),
            },
            React.createElement("div", {
                className: "playground-tasks-detail-facts playground-tasks-issue-details-section playground-evaluations-run-modal-settings",
              },
              React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                renderRunFact("Agent to evaluate",
                  renderRunSelector({
                    value: selectedTargetAgentId,
                    options: runAgentOptions,
                    label: React.createElement("span", { className: "playground-tasks-detail-person-value" },
                      renderRunAgentAvatar(selectedTargetAgent, targetAgentLabel),
                      React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, targetAgentLabel)
                    ),
                    ariaLabel: "Select agent to evaluate",
                    onValueChange: (nextValue) => setEvaluationRunForm((current) => ({ ...(current || {}), targetAgentId: nextValue })),
                    disabled: runAgentOptions.length === 0,
                    emptyContent: "No agents available.",
                  })
                ),
                renderRunFact("Environment",
                  renderRunSelector({
                    value: selectedEnvironmentKey,
                    options: environmentSelectorOptions,
                    label: React.createElement("span", { className: "playground-tasks-detail-person-value" },
                      React.createElement(selectedEnvironmentChoice?.type === "project" ? Rocket : Monitor, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      }),
                      React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, selectedEnvironmentLabel)
                    ),
                    ariaLabel: "Select evaluation environment",
                    onValueChange: (nextValue) => setEvaluationRunForm((current) => ({ ...(current || {}), environmentKey: nextValue })),
                    disabled: environmentSelectorOptions.length === 0,
                    emptyContent: "No environments available.",
                  })
                ),
                renderRunFact("Evaluator",
                  renderRunSelector({
                    value: evaluatorType,
                    options: evaluatorTypeOptions,
                    label: React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, selectedEvaluatorTypeLabel),
                    ariaLabel: "Select evaluator type",
                    onValueChange: (nextValue) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorType: nextValue })),
                  })
                ),
                evaluatorType === "agent"
                  ? renderRunFact("Evaluator Agent",
                      renderRunSelector({
                        value: selectedEvaluatorAgentId,
                        options: runAgentOptions,
                        label: React.createElement("span", { className: "playground-tasks-detail-person-value" },
                          renderRunAgentAvatar(selectedEvaluatorAgent, evaluatorAgentLabel),
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, evaluatorAgentLabel)
                        ),
                        ariaLabel: "Select evaluator agent",
                        onValueChange: (nextValue) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorAgentId: nextValue })),
                        disabled: runAgentOptions.length === 0,
                        emptyContent: "No agents available.",
                      })
                    )
                  : null
              )
            ),
              evaluatorType === "code"
                ? React.createElement("div", { className: "playground-evaluations-create-code-field" },
                    "Code evaluators are disabled until the isolated grader sandbox is available."
                  )
                : null
          );
        }

        function renderCreateModal() {
          if (!evaluationCreateModalOpen && !evaluationCreateModalClosing) {
            return null;
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const evaluatorType = String(form.evaluatorType || "agent");
          const evaluatorTypeOptions = [
            {
              value: "agent",
              label: "Agent",
              description: "Use an agent to judge each result.",
            },
            {
              value: "exact",
              label: "Exact output",
              description: "Require the candidate output to match exactly.",
            },
            {
              value: "code",
              label: "Code (unavailable)",
              description: "Requires the isolated grader sandbox.",
              disabled: true,
            },
          ];
          const selectedEvaluatorType = evaluatorTypeOptions.find((option) => option.value === evaluatorType) || evaluatorTypeOptions[0];
          const selectedEvaluatorAgentId = form.evaluatorAgentId
            || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId)
            || String(agentOptions[0]?.id || "").trim();
          const selectedEvaluatorAgent = getPlaygroundEvaluationAgentRecord(agentOptions, selectedEvaluatorAgentId);
          const selectedEvaluatorAgentLabel = String(
            selectedEvaluatorAgent?.name
            || selectedEvaluatorAgent?.label
            || selectedEvaluatorAgent?.title
            || selectedEvaluatorAgentId
            || "Select agent"
          ).trim();
          const selectedEvaluatorAgentPhotoUrl = getPlaygroundEvaluationAgentPhotoUrl(selectedEvaluatorAgent);
          const evaluatorAgentOptions = agentOptions
            .filter((agent) => String(agent?.id || "").trim())
            .map((agent) => {
              const agentId = String(agent.id).trim();
              const agentLabel = String(agent.name || agent.label || agent.title || agentId).trim();
              const photoUrl = getPlaygroundEvaluationAgentPhotoUrl(agent);
              return {
                value: agentId,
                label: agentLabel,
                leading: React.createElement("span", {
                    className: "playground-evaluations-run-agent-avatar",
                    "aria-hidden": "true",
                  }, photoUrl
                    ? React.createElement("img", { src: photoUrl, alt: "" })
                    : getPlaygroundEvaluationInitials(agentLabel)),
              };
            });
          const renderCreateEvaluationFact = (label, control) => React.createElement("div", {
              className: "playground-tasks-detail-fact playground-evaluations-create-modal-fact",
            },
            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
            React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
          );
          const renderCreateEvaluationHelpLabel = (label, description, ariaLabel) => React.createElement("span", {
              className: "playground-evaluations-pass-threshold-label-group playground-evaluations-create-help-label",
            },
            React.createElement("span", null, label),
            React.createElement("button", {
                type: "button",
                className: "playground-evaluations-pass-threshold-help",
                "aria-label": ariaLabel,
                onClick: (event) => event.preventDefault(),
              },
              React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8, "aria-hidden": "true" }),
              React.createElement("span", {
                  className: "playground-evaluations-pass-threshold-tooltip playground-evaluations-create-help-tooltip",
                  role: "tooltip",
                },
                description
              )
            )
          );
          return React.createElement(PlatformModal, {
              open: evaluationCreateModalOpen,
              visible: evaluationCreateModalVisible,
              closing: evaluationCreateModalClosing,
              animationDurationMs: 75,
              portal: true,
              as: "form",
              size: "medium",
              maxHeight: "min(720px, calc(100vh - 48px))",
              scrollable: true,
              title: "New Evaluation",
              headerVariant: "search",
              headerSearchProps: {
                icon: ChartColumnIncreasing,
                value: form.name || "",
                placeholder: "Evaluation name",
                "aria-label": "Evaluation name",
                autoComplete: "off",
                disabled: evaluationCreateSubmitting,
                onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), name: event.target.value })),
              },
              onClose: () => {
                if (!evaluationCreateSubmitting) closeEvaluationCreateModal();
              },
              closeOnBackdrop: !evaluationCreateSubmitting,
              closeOnEscape: !evaluationCreateSubmitting,
              closeButtonDisabled: evaluationCreateSubmitting,
              closeButtonLabel: "Close new evaluation modal",
              ariaLabel: "Create a new evaluation",
              className: "playground-new-issue-modal playground-evaluations-create-modal",
              backdropClassName: "playground-evaluations-create-modal-backdrop",
              bodyClassName: "playground-new-issue-modal__body playground-evaluations-create-modal-body",
              footerClassName: "playground-new-issue-modal__footer playground-evaluations-modal-actions",
              surfaceProps: { onSubmit: handleCreateEvaluation },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  disabled: evaluationCreateSubmitting,
                  onClick: () => closeEvaluationCreateModal(),
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: evaluationCreateSubmitting || !String(form.name || "").trim() || evaluatorType === "code",
                  "aria-busy": evaluationCreateSubmitting || undefined,
                },
                  evaluationCreateSubmitting
                    ? React.createElement(Loader2, {
                        className: "playground-evaluations-create-submit-spinner",
                        width: 14,
                        height: 14,
                        strokeWidth: 2,
                        "aria-hidden": "true",
                      })
                    : null,
                  React.createElement("span", null, evaluationCreateSubmitting ? "Creating..." : "Create Evaluation")
                )
              ),
            },
            React.createElement("div", {
                className: "playground-tasks-detail-facts playground-tasks-issue-details-section playground-evaluations-create-modal-settings",
              },
              React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                renderCreateEvaluationFact(renderCreateEvaluationHelpLabel(
                    "Pass Threshold",
                    "Minimum score a case must reach to count as passed. The run pass rate is calculated from cases at or above this threshold.",
                    "Pass threshold information"
                  ),
                  React.createElement("span", { className: "playground-evaluations-create-threshold-control" },
                    React.createElement("input", {
                      type: "text",
                      inputMode: "decimal",
                      className: "playground-evaluations-create-threshold-input",
                      value: form.passThreshold ?? "80",
                      "aria-label": "Pass threshold",
                      onChange: (event) => {
                        const nextValue = String(event.target.value || "");
                        if (nextValue && !/^\d{0,3}(?:\.\d?)?$/.test(nextValue)) return;
                        if (nextValue && Number(nextValue) > 100) return;
                        setEvaluationCreateForm((current) => ({ ...(current || {}), passThreshold: nextValue }));
                      },
                    }),
                    React.createElement("span", { "aria-hidden": "true" }, "%")
                  )
                ),
                renderCreateEvaluationFact(renderCreateEvaluationHelpLabel(
                    "Evaluator",
                    "Controls how each result is scored. Agent grading supports qualitative judgment; exact output performs strict matching.",
                    "Evaluator information"
                  ),
                  React.createElement(PlatformSelector, {
                    value: evaluatorType,
                    options: evaluatorTypeOptions,
                    onValueChange: (nextValue) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorType: nextValue })),
                    ariaLabel: "Select evaluator type",
                    label: selectedEvaluatorType.label,
                    alignment: "end",
                    popupAlignment: "right",
                    fullWidth: true,
                    popupWidth: "min(320px, calc(100vw - 48px))",
                    className: "playground-tasks-detail-central-selector playground-evaluations-create-selector",
                    triggerClassName: "playground-tasks-detail-central-selector-trigger",
                    popupClassName: "playground-tasks-detail-central-selector-popup playground-evaluations-create-selector-popup",
                  })
                ),
                evaluatorType === "agent"
                  ? renderCreateEvaluationFact("Evaluator Agent",
                      React.createElement(PlatformSelector, {
                        value: selectedEvaluatorAgentId,
                        options: evaluatorAgentOptions,
                        onValueChange: (nextValue) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorAgentId: nextValue })),
                        ariaLabel: "Select evaluator agent",
                        label: React.createElement("span", { className: "playground-evaluations-create-selector-value" },
                          React.createElement("span", {
                              className: "playground-evaluations-run-agent-avatar",
                              "aria-hidden": "true",
                            }, selectedEvaluatorAgentPhotoUrl
                              ? React.createElement("img", { src: selectedEvaluatorAgentPhotoUrl, alt: "" })
                              : getPlaygroundEvaluationInitials(selectedEvaluatorAgentLabel)),
                          React.createElement("span", null, selectedEvaluatorAgentLabel)
                        ),
                        placeholder: "Select agent",
                        disabled: evaluatorAgentOptions.length === 0,
                        alignment: "end",
                        popupAlignment: "right",
                        fullWidth: true,
                        emptyContent: "No agents available.",
                        popupWidth: "min(320px, calc(100vw - 48px))",
                        className: "playground-tasks-detail-central-selector playground-evaluations-create-selector",
                        triggerClassName: "playground-tasks-detail-central-selector-trigger",
                        popupClassName: "playground-tasks-detail-central-selector-popup playground-evaluations-create-selector-popup",
                      })
                    )
                  : null
              )
            ),
            evaluatorType === "code"
              ? React.createElement("div", { className: "playground-evaluations-create-code-field" },
                  "Code evaluators are disabled until the isolated grader sandbox is available."
                )
              : null
          );
        }

        const isEvaluationRunPage = normalizedMode === "run" && activeSet && activeRun;
        const isEvaluationCasePage = normalizedMode === "case" && activeSet && activeRun && activeCase;
        const isEvaluationSubpage = isEvaluationDetailPage || isEvaluationDatasetCasePage || isEvaluationRunPage || isEvaluationCasePage;
        const isEvaluationOverviewPage = !isEvaluationSubpage && normalizedMode !== "detail";
        const evaluationPageTitle = isEvaluationDatasetCasePage
          ? String(evaluationCaseEditorState?.draft?.title || "Evaluation Case")
          : isEvaluationRunPage
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
            renderEvaluationUnsavedRunDialog(),
            renderEvaluationRenameModal(),
            renderEvaluationThreadCaseModal(),
            renderEvaluationJsonlWorkspacePicker(),
            renderCreateModal(),
            renderEvaluationVersionSaveDialog(),
            renderEvaluationVersionModal(),
            renderEvaluationVersionsSidebarPortal()
          );
        }

        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page" },
          renderEvaluationTopNavActions(),
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              evaluationVersionChangesState || isEvaluationDetailPage || isEvaluationDatasetCasePage || isEvaluationRunPage
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
                          returnToEvaluationsOverview();
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
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" + (isEvaluationOverviewPage ? " playground-guardrails-overview-browser-body" : "") + (isEvaluationDetailPage || isEvaluationDatasetCasePage || isEvaluationRunPage ? " is-detail-page playground-evaluations-detail-page-body" : "") + (isEvaluationDatasetCasePage ? " playground-evaluations-dataset-case-page-body" : "") },
                normalizedMode === "dataset-case" ? renderEvaluationDatasetCaseDetail() : normalizedMode === "case" ? renderCase() : normalizedMode === "run" ? renderRun() : normalizedMode === "detail" ? renderDetail() : renderOverview()
              )
            )
          ),
	          renderRunModal(),
	          renderEvaluationUnsavedRunDialog(),
	          renderEvaluationRenameModal(),
            renderEvaluationThreadCaseModal(),
	          renderEvaluationJsonlWorkspacePicker(),
	          renderCreateModal(),
            renderEvaluationVersionSaveDialog(),
            renderEvaluationVersionModal(),
            renderEvaluationVersionChangesModal(),
            renderEvaluationVersionsSidebarPortal()
	        );
      }
`;
