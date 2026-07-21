export const GUARDRAILS_PAGE_EDITOR_SCRIPT = `          function applyGuardrailVersionDescriptionMarkdownFormat(formatType) {
            const textarea = guardrailVersionDescriptionTextareaRef.current;
            const value = String(guardrailVersionDescriptionDraft || "");
            const selectionStart = textarea && typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = textarea && typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildGuardrailsWrappedMarkdownEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildGuardrailsWrappedMarkdownEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildGuardrailsWrappedMarkdownEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildGuardrailsMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
            }
            if (!edit) return;
            setGuardrailVersionDescriptionDraft(edit.value);
            window.requestAnimationFrame(() => {
              const nextTextarea = guardrailVersionDescriptionTextareaRef.current;
              if (!nextTextarea) return;
              const maxLength = edit.value.length;
              const safeSelectionStart = Math.max(0, Math.min(edit.selectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(edit.selectionEnd, maxLength));
              nextTextarea.focus();
              nextTextarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeGuardrailsDescriptionTextarea(nextTextarea);
            });
          }

          function renderGuardrailVersionModal() {
            if (!guardrailVersionModal) {
              return null;
            }
            const isBusy = guardrailVersionState.status === "loading";
            const isEditMode = guardrailVersionModal.mode === "edit";
            const trimmedVersionName = String(guardrailVersionNameDraft || "").trim();
            const renderDescriptionField = () => React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor playground-agents-version-description-editor playground-guardrails-version-description-editor" },
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
                      onClick: () => applyGuardrailVersionDescriptionMarkdownFormat(action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: action.id === "bold" ? 2.7 : 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isGuardrailVersionDescriptionEditing ? " is-editing" : " is-preview") },
                !isGuardrailVersionDescriptionEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      String(guardrailVersionDescriptionDraft || "").trim()
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: guardrailVersionDescriptionDraft,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, "Describe what changed in this version.")
                    )
                  : null,
                React.createElement("textarea", {
                  ref: guardrailVersionDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input " + (isGuardrailVersionDescriptionEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isGuardrailVersionDescriptionEditing ? "Describe what changed in this version." : "",
                  value: guardrailVersionDescriptionDraft || "",
                  disabled: isBusy,
                  onFocus: (event) => {
                    setIsGuardrailVersionDescriptionEditing(true);
                    resizeGuardrailsDescriptionTextarea(event.currentTarget);
                  },
                  onChange: (event) => {
                    setGuardrailVersionDescriptionDraft(event.target.value);
                    resizeGuardrailsDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: () => setIsGuardrailVersionDescriptionEditing(false),
                  onKeyDown: (event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeGuardrailVersionModal();
                    }
                  },
                })
              )
            );
            return renderPlaygroundPlatformModal({
              open: Boolean(guardrailVersionModal),
              visible: guardrailVersionModalVisible,
              closing: guardrailVersionModalClosing,
              onClose: () => closeGuardrailVersionModal(),
              as: "form",
              backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-version-modal-backdrop playground-guardrails-version-modal-backdrop",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal playground-guardrails-version-modal",
              ariaLabel: isEditMode ? "Edit guardrail version" : "New guardrail version",
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  commitGuardrailVersionModal();
                },
                onKeyDown: (event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeGuardrailVersionModal();
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
                      value: guardrailVersionNameDraft,
                      placeholder: "Version name",
                      autoFocus: true,
                      disabled: isBusy,
                      onChange: (event) => setGuardrailVersionNameDraft(event.target.value),
                    })
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
                    onClick: () => closeGuardrailVersionModal(),
                    title: "Close",
                    disabled: isBusy,
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                ),
                React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                  renderDescriptionField(),
                  guardrailVersionState.status === "error" && guardrailVersionState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, guardrailVersionState.error)
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeGuardrailVersionModal(),
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

          function renderGuardrailVersionSaveDialog() {
            if (!guardrailVersionSaveDialog) {
              return null;
            }
            const versionData = buildGuardrailVersionSaveDialogData();
            const isBusy = guardrailVersionState.status === "loading";
            return React.createElement(PlatformVersionSaveDialog, {
              open: true,
              title: "Review changes",
              currentVersion: versionData.currentVersion,
              nextVersion: versionData.nextVersion,
              currentDescription: versionData.currentDescription,
              initialMode: guardrailVersionSaveDialog.initialMode || "new",
              canSaveCurrent: versionData.canSaveCurrent,
              instanceKey: guardrailVersionSaveDialog.key,
              pending: isBusy,
              error: guardrailVersionState.status === "error"
                ? guardrailVersionState.error
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
              onClose: closeGuardrailVersionSaveDialog,
              onSubmit: async (details) => {
                const savedSet = await saveAndPublishCurrentGuardrailVersion(details);
                if (!savedSet) {
                  throw new Error("The guardrail could not be saved and published. Review the details and try again.");
                }
                setGuardrailVersionSaveDialog(null);
              },
            });
          }

          function handleGuardrailsKeyboardShortcuts(event) {
            if (!isGuardrailsDetailPage || selectedGuardrailSetReadonly || event.defaultPrevented) {
              return;
            }
            const isCommand = event.metaKey || event.ctrlKey;
            if (!isCommand) return;
            const key = String(event.key || "").toLowerCase();
            if (key !== "s" && key !== "p") {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (guardrailVersionModal || guardrailVersionSaveDialog || guardrailVersionState.status === "loading") {
              return;
            }
            if (hasSelectedGuardrailVersionChanges()) {
              openGuardrailVersionSaveDialog({
                mode: event.shiftKey ? "new" : undefined,
              });
            }
          }

          function addGuardrailPrompt(setId) {
            updateGuardrailSet(setId, (set) => {
              const prompts = Array.isArray(set.prompts) ? set.prompts : [];
              return {
                ...set,
                prompts: [
                  ...prompts,
                  createPlaygroundGuardrailPromptDraft({
                    title: "Instruction " + (prompts.length + 1),
                  }),
                ],
              };
            });
          }

          function updateGuardrailPrompt(setId, promptId, patch) {
            updateGuardrailSet(setId, (set) => ({
              ...set,
              prompts: (Array.isArray(set.prompts) ? set.prompts : []).map((prompt) => (
                prompt?.id === promptId
                  ? {
                      ...prompt,
                      ...patch,
                      id: prompt.id,
                      updatedAt: new Date().toISOString(),
                    }
                  : prompt
              )),
            }));
          }

          function deleteGuardrailPrompt(setId, promptId) {
            updateGuardrailSet(setId, (set) => ({
              ...set,
              prompts: (Array.isArray(set.prompts) ? set.prompts : []).filter((prompt) => prompt?.id !== promptId),
            }));
          }

          function handleGuardrailSetKeyDown(event, setId) {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            selectGuardrailSet(setId);
          }

`;
