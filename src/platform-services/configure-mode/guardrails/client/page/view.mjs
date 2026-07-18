export const GUARDRAILS_PAGE_VIEW_SCRIPT = `          const listContent = renderGuardrailsTable();
          const isGuardrailsDetailPage = guardrailsPageMode === "detail" && selectedGuardrailSet;
          const guardrailsPageTitle = isGuardrailsDetailPage
            ? (selectedGuardrailSet.name || "Untitled Guardrail Set")
            : "Guardrails";
          if (!isGuardrailsDetailPage) {
            return listContent;
          }
          function applyGuardrailDescriptionMarkdownFormat(formatType) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly) {
              return;
            }
            const textarea = guardrailsDescriptionTextareaRef.current;
            const value = String(selectedGuardrailSet.description || "");
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
            } else if (formatType === "ordered-list") {
              edit = buildGuardrailsMarkdownListEdit(value, selectionStart, selectionEnd, "ordered");
            } else if (formatType === "code") {
              edit = buildGuardrailsWrappedMarkdownEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
            } else if (formatType === "link") {
              edit = buildGuardrailsMarkdownLinkEdit(value, selectionStart, selectionEnd);
            }
            if (!edit) {
              return;
            }
            updateGuardrailSet(selectedGuardrailSet.id, { description: edit.value });
            window.requestAnimationFrame(() => {
              const nextTextarea = guardrailsDescriptionTextareaRef.current;
              if (!nextTextarea) {
                return;
              }
              const maxLength = edit.value.length;
              const safeSelectionStart = Math.max(0, Math.min(edit.selectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(edit.selectionEnd, maxLength));
              nextTextarea.focus();
              nextTextarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeGuardrailsDescriptionTextarea(nextTextarea);
            });
          }
          const renderGuardrailDescriptionToolbarButton = (action) =>
            React.createElement("button", {
              key: action.id,
              type: "button",
              className: "playground-tasks-detail-format-button",
              title: action.label,
              "aria-label": action.label,
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => applyGuardrailDescriptionMarkdownFormat(action.id),
              disabled: selectedGuardrailSetReadonly,
            }, React.createElement(action.icon, {
              width: 14,
              height: 14,
              strokeWidth: action.strokeWidth || 1.8,
            }));
          const guardrailDescriptionTextFormatActions = [
            { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
            { id: "italic", label: "Italic", icon: Italic },
            { id: "underline", label: "Underline", icon: Underline },
          ];
          const guardrailDescriptionListFormatActions = [
            { id: "list", label: "List", icon: List },
            { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
          ];
          const guardrailDescriptionInsertFormatActions = [
            { id: "code", label: "Code", icon: CodeXml },
            { id: "link", label: "Link", icon: Link2 },
          ];

          return React.createElement("section", {
              className: "playground-files-page playground-guardrails-page",
              onKeyDownCapture: handleGuardrailsKeyboardShortcuts,
            },
            React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
              React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
                guardrailVersionChangesState
                  ? null
                  : React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" + (!isGuardrailsDetailPage ? " playground-guardrails-overview-browser-header" : "") },
                    React.createElement("div", { className: "playground-files-library-header playground-guardrails-library-header" },
                    isGuardrailsDetailPage
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-resource-detail-back-button playground-guardrails-detail-back-button",
                          onClick: returnToGuardrailsOverview,
                          "aria-label": "Back to guardrails",
                        },
                          React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Back")
                        )
                      : null,
                    React.createElement("div", { className: "playground-files-library-title-row" + (isGuardrailsDetailPage ? " playground-guardrails-detail-title-row" : "") },
                      React.createElement("h1", { className: "playground-files-library-title" + (isGuardrailsDetailPage ? " playground-guardrails-detail-title" : "") },
                        isGuardrailsDetailPage
                          ? React.createElement("input", {
                              ref: guardrailTitleInputRef,
                              type: "text",
                              className: "playground-guardrails-title-input",
                              value: selectedGuardrailSet.name || "",
                              placeholder: "Untitled Guardrail Set",
                              readOnly: selectedGuardrailSetReadonly,
                              disabled: selectedGuardrailSetReadonly,
                              onChange: (event) => updateGuardrailSet(selectedGuardrailSet.id, { name: event.target.value }),
                              "aria-label": "Guardrail set name",
                            })
                          : guardrailsPageTitle
                      ),
                      isGuardrailsDetailPage
	                        ? guardrailVersionChangesState
	                          ? null
	                          : selectedGuardrailSetReadonly
	                          ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
	                              React.createElement("span", { className: "playground-guardrails-readonly-pill" }, "Default Set")
	                            )
	                          : React.createElement("div", { className: "playground-guardrails-detail-actions" },
	                              renderGuardrailPublishSplitButton()
	                            )
	                        : null
	                    ),
	                    isGuardrailsDetailPage
	                      ? null
	                      : null
	                  )
                ),
                React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" + (!isGuardrailsDetailPage ? " playground-guardrails-overview-browser-body" : "") },
                  isGuardrailsDetailPage
                    ? guardrailVersionChangesState
                      ? React.createElement("div", { className: "playground-guardrails-detail playground-guardrails-version-changes-shell" },
                          renderGuardrailVersionChangesPage()
                        )
                      : React.createElement("div", { className: "playground-guardrails-detail" },
                        React.createElement("div", { className: "playground-guardrails-editor" },
                          React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-guardrails-description-section" },
                            React.createElement("div", { className: "playground-tasks-detail-section-header" },
                              React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                              React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                                guardrailDescriptionTextFormatActions.map((action) =>
                                  renderGuardrailDescriptionToolbarButton(action)
                                ),
                                React.createElement("span", {
                                  key: "list-divider-start",
                                  className: "playground-agents-detail-instructions-toolbar-divider",
                                  "aria-hidden": "true",
                                }),
                                guardrailDescriptionListFormatActions.map((action) =>
                                  renderGuardrailDescriptionToolbarButton(action)
                                ),
                                React.createElement("span", {
                                  key: "list-divider-end",
                                  className: "playground-agents-detail-instructions-toolbar-divider",
                                  "aria-hidden": "true",
                                }),
                                guardrailDescriptionInsertFormatActions.map((action) =>
                                  renderGuardrailDescriptionToolbarButton(action)
                                )
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing" },
                            React.createElement("textarea", {
                              ref: guardrailsDescriptionTextareaRef,
                              className: "playground-tasks-detail-description-input is-editing playground-guardrails-description-input",
                              rows: 1,
                              placeholder: "Add Description here",
                              value: selectedGuardrailSet.description || "",
                              readOnly: selectedGuardrailSetReadonly,
                              onChange: (event) => {
                                updateGuardrailSet(selectedGuardrailSet.id, { description: event.target.value });
                                resizeGuardrailsDescriptionTextarea(event.currentTarget);
                              },
                            })
                            )
                          ),
                          React.createElement("div", { className: "playground-guardrails-prompts-header" },
                            React.createElement("div", { className: "playground-guardrails-prompts-title" },
                              React.createElement("span", null, "Prompts")
                            ),
                            selectedGuardrailSetReadonly
                              ? null
                              : React.createElement("button", {
                                  type: "button",
                                  className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                                  onClick: () => addGuardrailPrompt(selectedGuardrailSet.id),
                                },
                                  React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }),
                                  React.createElement("span", null, "Prompt")
                                )
                          ),
                          React.createElement("div", { className: "playground-guardrails-prompts-list" },
                            selectedGuardrailPrompts.length === 0
                              ? React.createElement("div", { className: "playground-guardrails-prompt-empty" }, "No prompts in this set.")
                              : selectedGuardrailPrompts.map((prompt) =>
                                  React.createElement("div", { key: prompt.id, className: "playground-tasks-backlog-item playground-guardrails-prompt-row" },
                                    React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                                      React.createElement("div", { className: "playground-tasks-backlog-leading" },
                                        React.createElement("div", { className: "playground-tasks-backlog-main" },
                                          React.createElement("input", {
                                            type: "text",
                                            className: "playground-guardrails-prompt-title-input",
                                            value: prompt.title || "",
                                            readOnly: selectedGuardrailSetReadonly,
                                            onChange: (event) => updateGuardrailPrompt(selectedGuardrailSet.id, prompt.id, { title: event.target.value }),
                                          }),
                                          React.createElement("textarea", {
                                            className: "playground-guardrails-prompt-body-input",
                                            value: prompt.prompt || "",
                                            placeholder: "Prompt text",
                                            readOnly: selectedGuardrailSetReadonly,
                                            onChange: (event) => updateGuardrailPrompt(selectedGuardrailSet.id, prompt.id, { prompt: event.target.value }),
                                          })
                                        )
                                      ),
                                      React.createElement("div", { className: "playground-tasks-backlog-meta" },
                                        selectedGuardrailSetReadonly
                                          ? null
                                          : React.createElement("button", {
                                              type: "button",
                                              className: "playground-guardrails-prompt-delete",
                                              onClick: () => deleteGuardrailPrompt(selectedGuardrailSet.id, prompt.id),
                                              "aria-label": "Delete prompt",
                                            }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                                      )
                                    ),
                                  )
                                )
                          )
                        )
                      )
	                    : React.createElement("div", { className: "playground-plugins-page playground-guardrails-layout playground-team-overview-page playground-agents-overview-page playground-guardrails-overview-shell is-develop-configure-page" },
	                        listContent
	                      )
                )
              )
              , renderGuardrailVersionModal()
              , renderGuardrailVersionsSidebarPortal()
            )
          );
        }

`;
