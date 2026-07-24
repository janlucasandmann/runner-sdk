export const EVALUATIONS_PAGE_CONTROLLER_VERSION_DIALOGS_SCRIPT = String.raw`        function renderEvaluationCaseEditorModal() {
          const state = evaluationCaseEditorState;
          if (!state?.setId) {
            return null;
          }
          const draft = buildEvaluationCaseEditorDraft(state.draft || {}, Number(state.index || 0));
          const runCountValue = String(state.draft?.runCount ?? draft.runCount ?? "1");
          const isNew = state.isNew === true;
          const focusedEditor = evaluationCaseFocusedEditor;
          if (focusedEditor?.field) {
            return React.createElement(PlatformModal, {
                open: evaluationCaseEditorVisible && !evaluationCaseEditorClosing,
                visible: evaluationCaseEditorVisible,
                closing: evaluationCaseEditorClosing,
                animationDurationMs: 75,
                portal: true,
                as: "form",
                size: "large",
                maxHeight: "min(760px, calc(100vh - 48px))",
                scrollable: true,
                title: React.createElement(React.Fragment, null,
                  React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain playground-evaluations-case-focused-back-button",
                      title: "Back to case editor",
                      "aria-label": "Back to case editor",
                      onClick: returnFromEvaluationCaseFocusedEditor,
                    },
                    React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.8, "aria-hidden": "true" })
                  ),
                  React.createElement("span", null, focusedEditor.title)
                ),
                headerClassName: "playground-evaluations-case-focused-editor-header",
                titleClassName: "playground-evaluations-case-focused-editor-title",
                onClose: closeEvaluationCaseFocusedEditor,
                closeButtonLabel: "Return to case editor",
                ariaLabel: "Edit evaluation case " + focusedEditor.title,
                className: "playground-evaluations-case-editor-modal is-focused-editor",
                backdropClassName: "playground-evaluations-case-editor-backdrop",
                bodyClassName: "playground-evaluations-case-editor-body playground-evaluations-case-focused-editor-body",
                footerClassName: "playground-evaluations-case-editor-footer",
                surfaceProps: { onSubmit: saveEvaluationCaseFocusedEditor },
                footer: React.createElement(React.Fragment, null,
                  React.createElement(PlatformSecondaryButton, {
                    size: "medium",
                    type: "button",
                    onClick: closeEvaluationCaseFocusedEditor,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                  }, "Save Content")
                ),
              },
              renderEvaluationCaseEditorMarkdownSection(
                focusedEditor.field,
                focusedEditor.title,
                focusedEditor.placeholder,
                {
                  value: focusedEditor.value,
                  onChange: updateEvaluationCaseFocusedEditorValue,
                  historyKey: buildEvaluationCaseEditorFieldKey(state, focusedEditor.field) + ":focused",
                  className: "playground-evaluations-case-focused-editor",
                  autoFocus: true,
                }
              )
            );
          }
          return React.createElement(PlatformModal, {
              open: evaluationCaseEditorVisible && !evaluationCaseEditorClosing,
              visible: evaluationCaseEditorVisible,
              closing: evaluationCaseEditorClosing,
              animationDurationMs: 75,
              portal: true,
              as: "form",
              size: "medium",
              maxHeight: "min(720px, calc(100vh - 48px))",
              scrollable: true,
              title: isNew ? "New Case" : "Edit Case",
              headerActions: React.createElement("label", { className: "playground-evaluations-case-editor-run-field" },
                React.createElement("span", { className: "playground-evaluations-case-editor-run-label" }, "Runs per Evaluation"),
                React.createElement("input", {
                  type: "text",
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  className: "playground-evaluations-case-editor-run-input",
                  value: runCountValue,
                  onChange: (event) => {
                    const nextValue = String(event.target.value || "");
                    if (nextValue && !/^\d{0,2}$/.test(nextValue)) return;
                    if (nextValue && Number(nextValue) > 50) return;
                    updateEvaluationCaseEditorDraft({ runCount: nextValue });
                  },
                })
              ),
              onClose: closeEvaluationCaseEditor,
              closeButtonLabel: "Close case editor",
              ariaLabel: isNew ? "New evaluation case" : "Edit evaluation case",
              className: "playground-evaluations-case-editor-modal",
              backdropClassName: "playground-evaluations-case-editor-backdrop",
              bodyClassName: "playground-evaluations-case-editor-body",
              footerClassName: "playground-evaluations-case-editor-footer",
              surfaceProps: { onSubmit: saveEvaluationCaseEditor },
              footer: React.createElement(React.Fragment, null,
                !isNew
                  ? React.createElement(PlatformSecondaryButton, {
                      size: "medium",
                      type: "button",
                      className: "playground-evaluations-case-editor-delete-button",
                      onClick: deleteEvaluationCaseEditor,
                    }, "Delete")
                  : null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: closeEvaluationCaseEditor,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                }, "Save Case")
              ),
            },
            React.createElement("div", { className: "playground-evaluations-case-source-grid" },
              renderEvaluationCaseEditorSourceCard("input"),
              renderEvaluationCaseEditorSourceCard("expectedOutput")
            ),
            evaluationCaseTextImportError
              ? React.createElement("div", {
                  className: "playground-evaluations-case-text-import-error",
                  role: "alert",
                }, evaluationCaseTextImportError)
              : null,
            renderEvaluationCaseEditorMarkdownSection(
              "evaluationGuidance",
              renderEvaluationCaseGuidanceTitle(),
              "Optional scoring guidance for this case",
              { ariaLabel: "Evaluator Guidance" }
            )
          );
        }

        function renderCase() {
          if (!activeSet || !activeRun || !activeCase) {
            return renderRun();
          }
          const displayStatus = getPlaygroundEvaluationCaseDisplayStatus(activeCase, activeRun.passThreshold);
          const isActiveCase = isPlaygroundEvaluationCaseActive(activeCase);
          const displayStatusVariant = displayStatus === "passed"
            ? "green"
            : displayStatus === "error"
              ? "red"
              : isActiveCase
                ? "blue"
                : "gray";
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
                  renderCaseKpi("Status", React.createElement(PlatformLabel, {
                    variant: displayStatusVariant,
                  }, displayStatus.replace(/_/g, " ")))
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

        function renderEvaluationVersionsSidebar(options = {}) {
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
          const normalizedSetId = String(activeSet.id || "").trim();
          const versionsLoaded = !String(backendUrl || "").trim()
            || evaluationDetailsLoadedRef.current.has(normalizedSetId);
          const versionsError = !versionsLoaded && evaluationBackendSyncState.status === "error"
            ? evaluationBackendSyncState.error
            : "";
          const mutationStateContent = evaluationVersionState.status === "loading"
            ? React.createElement("div", { className: "platform-version-history-sidebar__state" },
                evaluationVersionState.message || "Saving evaluation version..."
              )
            : evaluationVersionState.status === "error" && evaluationVersionState.error
              ? React.createElement("div", {
                  className: "platform-version-history-sidebar__state is-error",
                  role: "alert",
                }, evaluationVersionState.error)
              : null;
          return React.createElement(PlatformVersionHistorySidebar, {
            className: "playground-evaluations-versions-sidebar",
            open: evaluationVersionsSidebarOpen,
            title: "Version history",
            sectionTitle: "All Versions",
            width: "var(--playground-thread-task-detail-width)",
            portal: Boolean(options.portal),
            portalTarget: options.portalTarget || null,
            versions,
            activeVersionId,
            selectedVersionId,
            loading: !versionsLoaded && !versionsError,
            loadingMessage: "Loading versions",
            error: versionsError || null,
            emptyDescription: "Save changes to create this evaluation's first version.",
            busy: evaluationVersionState.status === "loading",
            stateContent: mutationStateContent,
            onClose: () => {
              setEvaluationVersionChangesState(null);
              closeEvaluationVersionsSidebar();
            },
            onSelectVersion: (versionId) => void restoreEvaluationVersion(versionId),
            onPublishVersion: (versionId) => void publishEvaluationVersion(versionId),
            canPublishVersion: (version) => canPublishEvaluationVersion(version),
            onViewChanges: () => openEvaluationVersionChangesPage(),
            getVersionCreatedAt: (version) => {
              const timestamp = version.createdAt || version.updatedAt || version.publishedAt;
              return timestamp ? formatPlaygroundEvaluationDate(timestamp) : "-";
            },
            getVersionActions: (version) => [
              {
                id: "edit",
                label: "Edit description",
                icon: SquarePen,
                onSelect: () => openEditEvaluationVersionModal(version.id),
              },
              {
                id: "compare",
                label: "View Changes",
                icon: Code2,
                onSelect: () => openEvaluationVersionChangesPage(version.id),
              },
              {
                id: "delete",
                label: "Delete version",
                icon: Trash2,
                danger: true,
                disabled: version.status === "active" || versions.length <= 1,
                onSelect: () => void deleteEvaluationVersion(version.id),
              },
            ],
          });
        }

        function renderEvaluationVersionsSidebarPortal() {
          const drawerContainer = typeof document !== "undefined" && versionsDrawerPortalId
            ? document.getElementById(versionsDrawerPortalId)
            : null;
          if (drawerContainer) {
            return renderEvaluationVersionsSidebar({
              portal: true,
              portalTarget: drawerContainer,
            });
          }
          if (versionsDrawerPortalId) return null;
          return renderEvaluationVersionsSidebar();
        }

        function renderEvaluationPublishSplitButton() {
          const isBusy = evaluationVersionState.status === "loading";
          const normalizedSetId = String(activeSet?.id || "").trim();
          const versionsLoaded = !String(backendUrl || "").trim()
            || evaluationDetailsLoadedRef.current.has(normalizedSetId);
          const versionHasChanges = hasSelectedEvaluationVersionChanges();
          const isPublishControlDisabled = Boolean(isBusy || !versionsLoaded || !versionHasChanges);
          const actions = getEvaluationVersionPopupActions();
          return React.createElement(PlatformVersionPublishControl, {
            open: evaluationPublishMenuOpen,
            actions,
            rootRef: evaluationPublishMenuRef,
            active: evaluationPublishMenuOpen,
            disabled: isPublishControlDisabled,
            menuDisabled: isPublishControlDisabled,
            label: "Save Changes",
            leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
            publishAriaLabel: "Save evaluation changes",
            className: "playground-evaluations-publish-control",
            popupClassName: "playground-evaluations-publish-menu",
            onOpenChange: (nextOpen) => {
              setEvaluationVersionsHeaderMenuOpen(false);
              setEvaluationPublishMenuOpen(nextOpen);
            },
            onPublish: () => openEvaluationVersionSaveDialog(),
          });
        }

        function renderEvaluationVersionSaveDialog() {
          if (!evaluationVersionSaveDialog) {
            return null;
          }
          const versionData = buildEvaluationVersionSaveDialogData();
          const isBusy = evaluationVersionState.status === "loading";
          return React.createElement(PlatformVersionSaveDialog, {
            open: true,
            title: "Review changes",
            currentVersion: versionData.currentVersion,
            nextVersion: versionData.nextVersion,
            currentDescription: versionData.currentDescription,
            initialMode: evaluationVersionSaveDialog.initialMode || "new",
            canSaveCurrent: versionData.canSaveCurrent,
            instanceKey: evaluationVersionSaveDialog.key,
            pending: isBusy,
            error: evaluationVersionState.status === "error"
              ? evaluationVersionState.error
              : null,
            changes: versionData.diffFiles.map((file) => ({
              id: file.id,
              label: file.label || file.filePath,
              content: React.createElement(PlatformDiffViewer, {
                filePath: file.filePath,
                diffContent: file.diffContent || "",
                fileContent: file.fileContent || "",
                additions: file.additions,
                deletions: file.deletions,
                hideTopbar: true,
                embedded: true,
                defaultExpanded: true,
                maxHeight: 330,
              }),
            })),
            emptyChanges: "No changes were found between the editor and the selected version.",
            onClose: closeEvaluationVersionSaveDialog,
            onSubmit: async (details) => {
              const savedSet = await saveAndPublishCurrentEvaluationVersion(details);
              if (!savedSet) {
                throw new Error("The evaluation could not be saved and published. Review the details and try again.");
              }
              setEvaluationVersionSaveDialog(null);
            },
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
