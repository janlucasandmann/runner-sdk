export const EVALUATIONS_PAGE_CONTROLLER_VERSION_DIALOGS_SCRIPT = String.raw`        function renderEvaluationCaseEditorModal() {
          const state = evaluationCaseEditorState;
          if (!state?.setId) {
            return null;
          }
          const draft = buildEvaluationCaseEditorDraft(state.draft || {}, Number(state.index || 0));
          const runCountValue = String(state.draft?.runCount ?? draft.runCount ?? "1");
          const isNew = state.isNew === true;
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-case-editor-backdrop"
                + (evaluationCaseEditorVisible ? " is-visible" : "")
                + (evaluationCaseEditorClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationCaseEditor,
            },
            React.createElement(PlatformModalSurface, {
                as: "form",
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-case-editor-modal"
                  + (evaluationCaseEditorVisible ? " is-visible" : "")
                  + (evaluationCaseEditorClosing ? " is-closing" : ""),
                onClick: (event) => event.stopPropagation(),
                onSubmit: saveEvaluationCaseEditor,
              },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(FilePlus2, { width: 18, height: 18, strokeWidth: 1.8 })
                  ),
	                  React.createElement("div", {
	                    className: "playground-content-title playground-tasks-project-modal-name-input",
	                    style: { display: "flex", alignItems: "center" },
	                  }, isNew ? "New Case" : "Edit Case")
	                ),
	                React.createElement("div", { className: "playground-evaluations-case-editor-top-actions" },
	                  React.createElement("label", { className: "playground-evaluations-case-editor-run-field" },
	                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Runs per Evaluation"),
	                    React.createElement("input", {
	                      type: "number",
	                      min: "1",
	                      max: "50",
	                      step: "1",
	                      className: "playground-environments-input playground-evaluations-case-editor-run-input",
	                      value: runCountValue,
	                      onChange: (event) => updateEvaluationCaseEditorDraft({ runCount: event.target.value }),
	                    })
	                  ),
	                  React.createElement("button", {
	                    type: "button",
	                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
	                    onClick: closeEvaluationCaseEditor,
	                    title: "Close",
	                    "aria-label": "Close case editor",
	                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                )
	              ),
	              React.createElement("div", { className: "playground-project-overview-outcome-editor-body playground-evaluations-case-editor-body" },
	                renderEvaluationCaseEditorMarkdownSection("input", "Input", "Input sent to the agent"),
	                renderEvaluationCaseEditorMarkdownSection("expectedOutput", "Expected Output", "Reference output or expected behavior"),
	                renderEvaluationCaseEditorMarkdownSection("evaluationGuidance", "Evaluator Guidance", "Optional scoring guidance for this case"),
	                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button playground-project-overview-outcome-delete-button",
                    onClick: deleteEvaluationCaseEditor,
                  }, isNew ? "Discard" : "Delete"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: closeEvaluationCaseEditor,
	                  }, "Cancel"),
	                  React.createElement(PlatformPrimaryButton, {
	                    size: "medium",
	                    type: "button",
	                    className: "playground-environments-action-button is-primary",
	                    onClick: saveEvaluationCaseEditor,
	                  }, "Save Case")
                )
              )
            )
          );
        }

        function renderCase() {
          if (!activeSet || !activeRun || !activeCase) {
            return renderRun();
          }
          const displayStatus = getPlaygroundEvaluationCaseDisplayStatus(activeCase, activeRun.passThreshold);
          const isActiveCase = isPlaygroundEvaluationCaseActive(activeCase);
          const scoreLabel = isActiveCase ? activeCase.status.replace(/_/g, " ") : formatPlaygroundEvaluationPercent(activeCase.score);
          const reasoningDisplay = getPlaygroundEvaluationCaseDisplayReasoning(activeCase);
          const reasoning = reasoningDisplay.text || "";
          const confidenceLabel = reasoningDisplay.confidence === null || reasoningDisplay.confidence === undefined
            ? "-"
            : formatPlaygroundEvaluationPercent(reasoningDisplay.confidence);
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail playground-evaluations-case-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              React.createElement("section", { className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-evaluations-case-section" },
                React.createElement("div", { className: "playground-evaluations-case-title-row" },
                  React.createElement("h3", { className: "playground-evaluations-case-title" }, "Case Details"),
                  React.createElement("div", { className: "playground-evaluations-case-title-links" },
                    renderEvaluationThreadButton(activeCase.threadId, "Evaluation Thread"),
                    renderEvaluationThreadButton(activeCase.evaluatorThreadId, "Evaluator Thread")
                  )
                ),
                React.createElement("div", { className: "playground-evaluations-case-kpis" },
                  renderCaseKpi("Agent", renderRunAgentCell(activeRun, activeSet)),
                  renderCaseKpi("Environment", renderRunEnvironmentCell(activeRun, activeSet)),
                  renderCaseKpi("Score", React.createElement("span", { className: "playground-evaluations-case-score" }, scoreLabel)),
                  renderCaseKpi("Confidence", confidenceLabel),
                  renderCaseKpi("Status", React.createElement("span", { className: "playground-evaluations-status-pill" + (displayStatus === "failed" || displayStatus === "error" ? " is-failed" : "") }, displayStatus.replace(/_/g, " ")))
                ),
                React.createElement("div", { className: "playground-evaluations-case-detail-grid" },
                  renderCaseDetailField("Reasoning", renderEvaluationCaseMarkdown(reasoning), { wide: true, reasoning: true }),
                  renderCaseDetailField("Expected Output", renderEvaluationCaseTextValue(activeCase.expectedOutput), { wide: true }),
                  renderCaseDetailField("Actual Output", renderEvaluationCaseTextValue(activeCase.actualOutput), { wide: true })
                )
              )
            )
          );
        }

        function renderEvaluationVersionsSidebar() {
          if (!isEvaluationDetailPage || !activeSet || !evaluationVersionsSidebarOpen) {
            return null;
          }
          const versions = readSelectedEvaluationVersions();
          const metadata = getEvaluationVersionMetadata();
          const activeVersion = getSelectedEvaluationActiveVersion();
          const activeVersionId = String(activeVersion?.id || metadata.activeEvaluationVersionId || metadata.active_evaluation_version_id || "").trim();
          const selectedVersionId = String(
            metadata.restoredFromEvaluationVersionId
            || metadata.restored_from_evaluation_version_id
            || activeVersionId
            || ""
          ).trim();
          return React.createElement(PlaygroundVersionSidebar, {
            className: "playground-evaluations-versions-sidebar",
            open: evaluationVersionsSidebarOpen,
            title: "Publish Evaluation",
            versions,
            activeVersionId,
            selectedVersionId,
            state: evaluationVersionState,
            busy: evaluationVersionState.status === "loading",
            openMenuId: openEvaluationVersionMenuId,
            onOpenMenuIdChange: setOpenEvaluationVersionMenuId,
            headerMenuOpen: evaluationVersionsHeaderMenuOpen,
            headerMenuActions: getEvaluationVersionPopupActions({ includeVersionHistory: false }),
            headerMenuDisabled: evaluationVersionState.status === "loading",
            onHeaderMenuOpenChange: setEvaluationVersionsHeaderMenuOpen,
            onClose: closeEvaluationVersionsSidebar,
            onSaveVersion: () => openCreateEvaluationVersionModal({ force: true }),
            onRestoreVersion: (versionId) => restoreEvaluationVersion(versionId),
            onPublishVersion: (versionId) => publishEvaluationVersion(versionId),
            canPublishVersion: (version) => canPublishEvaluationVersion(version),
            onDeleteVersion: (versionId) => deleteEvaluationVersion(versionId),
            versionsSectionFooter: React.createElement("div", { className: "playground-metronome-publish-section-footer playground-agents-version-compare-footer" },
              React.createElement(PlatformSecondaryButton, {
                size: "large",
                type: "button",
                className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-agents-version-compare-button",
                disabled: evaluationVersionState.status === "loading" || !versions.length,
                onClick: () => openEvaluationVersionChangesPage(),
              },
                React.createElement(Code2, { width: 13, height: 13, strokeWidth: 1.8 }),
                React.createElement("span", null, "View Changes")
              )
            ),
            getRowMenuItems: (version) => [
              {
                id: "edit",
                label: "Edit version",
                icon: SquarePen,
                onClick: () => openEditEvaluationVersionModal(version.id),
              },
              {
                id: "compare",
                label: "View Changes",
                icon: Code2,
                onClick: () => openEvaluationVersionChangesPage(version.id),
              },
              {
                id: "restore",
                label: "Restore version",
                icon: RotateCcw,
                onClick: () => restoreEvaluationVersion(version.id),
              },
              {
                id: "delete",
                label: "Delete version",
                icon: Trash2,
                danger: true,
                onClick: () => deleteEvaluationVersion(version.id),
              },
            ],
            getVersionTitle: (version) => String(version.label || ("Version " + version.version)).trim(),
            getVersionDescription: () => "",
            getVersionMeta: (version) => {
              const lifecycleLabel = version.status === "active"
                ? "Published"
                : version.status === "superseded"
                  ? "Superseded"
                  : version.status === "unpublished"
                    ? "Unpublished"
                    : "Saved";
              return lifecycleLabel + " " + formatPlaygroundEvaluationDate(version.publishedAt || version.updatedAt || version.createdAt);
            },
          });
        }

        function renderEvaluationVersionsSidebarPortal() {
          const sidebar = renderEvaluationVersionsSidebar();
          if (!sidebar) {
            return null;
          }
          const drawerContainer = typeof document !== "undefined" && versionsDrawerPortalId
            ? document.getElementById(versionsDrawerPortalId)
            : null;
          if (drawerContainer && typeof createPortal === "function") {
            return createPortal(sidebar, drawerContainer);
          }
          return React.createElement("aside", {
              className: "playground-metronome-node-drawer playground-agent-versions-inline-drawer is-open",
            },
            sidebar
          );
        }

        function renderEvaluationPublishSplitButton() {
          const isBusy = evaluationVersionState.status === "loading";
          const actions = getEvaluationVersionPopupActions();
          return renderPlaygroundPlatformPopup({
            open: evaluationPublishMenuOpen,
            shellRef: evaluationPublishMenuRef,
            shellClassName: "playground-agents-detail-publish-split-shell playground-evaluations-publish-split-shell",
            menuClassName: "playground-agents-detail-publish-menu playground-evaluations-publish-menu",
            trigger: React.createElement("div", {
                className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button playground-evaluations-publish-button playground-agents-detail-publish-split-control"
                  + (evaluationVersionsSidebarOpen ? " is-active" : "")
                  + (isBusy ? " is-disabled" : ""),
              },
              React.createElement("button", {
                  type: "button",
                  className: "playground-agents-detail-publish-main",
                  title: "Open evaluation versions",
                  "aria-label": "Open evaluation versions",
                  "aria-expanded": evaluationVersionsSidebarOpen ? "true" : "false",
                  disabled: isBusy,
                  onClick: () => {
                    setEvaluationPublishMenuOpen(false);
                    setEvaluationVersionsHeaderMenuOpen(false);
                    setEvaluationVersionsSidebarOpen(true);
                  },
                },
                React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Publish")
              ),
              React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
              React.createElement("button", {
                  type: "button",
                  className: "playground-agents-detail-publish-chevron",
                  title: "Version save options",
                  "aria-label": "Version save options",
                  "aria-haspopup": "menu",
                  "aria-expanded": evaluationPublishMenuOpen ? "true" : "false",
                  disabled: isBusy,
                  onClick: (event) => {
                    event.stopPropagation();
                    setEvaluationPublishMenuOpen((current) => !current);
                  },
                },
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              )
            ),
            menuProps: {
              role: "menu",
              onClick: (event) => event.stopPropagation(),
            },
            children: React.createElement(React.Fragment, null,
              actions.map((action) => React.createElement("button", {
                  key: action.id,
                  type: "button",
                  className: "tb-popup-row",
                  role: "menuitem",
                  disabled: isBusy || action.disabled,
                  onClick: () => {
                    setEvaluationPublishMenuOpen(false);
                    action.onClick();
                  },
                },
                React.createElement(action.Icon, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.15 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, action.label)
                ),
                action.shortcut
                  ? React.createElement("span", {
                      className: "playground-agents-detail-publish-menu-shortcut",
                      "aria-hidden": "true",
                    }, action.shortcut)
                  : null
              ))
            )
          });
        }

        function renderEvaluationVersionChangesPage() {
          if (!evaluationVersionChangesState || !activeSet) {
            return null;
          }
          const versions = readSelectedEvaluationVersions();
          const sources = buildEvaluationVersionCompareSources(versions);
          const requestedLeftSourceId = String(evaluationVersionChangesState.leftSourceId || "").trim()
            || getDefaultEvaluationVersionCompareLeftSourceId(versions);
          const requestedRightSourceId = String(evaluationVersionChangesState.rightSourceId || "").trim()
            || EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID;
          const currentEditorSource = sources.find((source) => source.id === EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
          const leftSource = resolveEvaluationVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
          const rightSource = resolveEvaluationVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
          if (!leftSource || !rightSource) {
            return null;
          }
          const diffFiles = buildPlaygroundEvaluationVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
          const compareOptions = sources.map((source) =>
            React.createElement("option", { key: source.id, value: source.id }, source.label)
          );
          const renderCompareSelect = (value, side) =>
            React.createElement("label", { className: "playground-version-changes-select-shell" },
              React.createElement("span", { className: "playground-version-changes-select-control-wrap" },
                React.createElement("select", {
                  className: "playground-version-changes-select-control",
                  value,
                  onChange: (event) => handleEvaluationVersionCompareSourceChange(side, event.target.value),
                }, compareOptions),
                React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
              )
            );
          return renderPlaygroundVersionChangesPage({
            title: "Changes",
            compareControls: React.createElement(React.Fragment, null,
              renderCompareSelect(leftSource.id, "left"),
              React.createElement("span", { className: "playground-version-changes-select-arrow", "aria-hidden": "true" }, "→"),
              renderCompareSelect(rightSource.id, "right")
            ),
            actions: renderEvaluationPublishSplitButton(),
            files: diffFiles,
            backIcon: ArrowLeft,
            backText: "Back",
            backLabel: "Back to evaluation",
            onBack: closeEvaluationVersionChangesPage,
            emptyMessage: "No differences from the current editor.",
            className: "playground-evaluations-version-changes-page",
          });
        }

        function renderEvaluationVersionModal() {
          if (!evaluationVersionModal) {
            return null;
          }
          const isBusy = evaluationVersionState.status === "loading";
          const isEditMode = evaluationVersionModal.mode === "edit";
          const trimmedVersionName = String(evaluationVersionNameDraft || "").trim();
          const renderDescriptionField = () => React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor playground-agents-version-description-editor playground-evaluations-version-description-editor" },
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
                    disabled: isBusy,
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: () => applyEvaluationVersionDescriptionMarkdownFormat(action.id),
                  }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: action.id === "bold" ? 2.7 : 1.8 }))
                )
              )
            ),
            React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isEvaluationVersionDescriptionEditing ? " is-editing" : " is-preview") },
              !isEvaluationVersionDescriptionEditing
                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                    String(evaluationVersionDescriptionDraft || "").trim()
                      ? typeof PlaygroundTaskDescriptionMarkdown === "function"
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: evaluationVersionDescriptionDraft,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", { className: "playground-tasks-detail-description-preview" }, evaluationVersionDescriptionDraft)
                      : React.createElement("div", {
                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                        }, "Describe what changed in this version.")
                  )
                : null,
              React.createElement("textarea", {
                ref: evaluationVersionDescriptionTextareaRef,
                className: "playground-tasks-detail-description-input " + (isEvaluationVersionDescriptionEditing ? "is-editing" : "is-preview"),
                rows: 1,
                placeholder: isEvaluationVersionDescriptionEditing ? "Describe what changed in this version." : "",
                value: evaluationVersionDescriptionDraft || "",
                disabled: isBusy,
                onFocus: (event) => {
                  setIsEvaluationVersionDescriptionEditing(true);
                  resizeEvaluationGuidanceTextarea(event.currentTarget);
                },
                onChange: (event) => {
                  setEvaluationVersionDescriptionDraft(event.target.value);
                  resizeEvaluationGuidanceTextarea(event.currentTarget);
                },
                onBlur: () => setIsEvaluationVersionDescriptionEditing(false),
                onKeyDown: (event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeEvaluationVersionModal();
                  }
                },
              })
            )
          );
          return renderPlaygroundPlatformModal({
            open: Boolean(evaluationVersionModal),
            visible: evaluationVersionModalVisible,
            closing: evaluationVersionModalClosing,
            onClose: () => closeEvaluationVersionModal(),
            as: "form",
            backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-version-modal-backdrop playground-evaluations-version-modal-backdrop",
            className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal playground-evaluations-version-modal",
            ariaLabel: isEditMode ? "Edit evaluation version" : "New evaluation version",
            surfaceProps: {
              onSubmit: (event) => {
                event.preventDefault();
                commitEvaluationVersionModal();
              },
              onKeyDown: (event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeEvaluationVersionModal();
                }
              },
            },
            children: React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(isEditMode ? SquarePen : GitBranchPlus, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                    value: evaluationVersionNameDraft,
                    placeholder: "Version name",
                    autoFocus: true,
                    disabled: isBusy,
                    onChange: (event) => setEvaluationVersionNameDraft(event.target.value),
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: () => closeEvaluationVersionModal(),
                  title: "Close",
                  disabled: isBusy,
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                renderDescriptionField(),
                evaluationVersionState.status === "error" && evaluationVersionState.error
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, evaluationVersionState.error)
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-environments-action-button",
                  onClick: () => closeEvaluationVersionModal(),
                  disabled: isBusy,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  className: "playground-environments-action-button is-primary",
                  disabled: isBusy || !trimmedVersionName,
                }, isBusy ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Version" : "Create Version"))
              )
            )
          });
        }

`;

