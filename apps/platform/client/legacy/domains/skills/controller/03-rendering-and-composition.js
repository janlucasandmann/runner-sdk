                    resizeSkillTextarea(event.currentTarget);
                  },
                  onBlur: (event) => {
                    setSkillSectionEditing((current) => ({
                      ...current,
                      [sectionId]: false,
                    }));
                    if (!canEdit) {
                      return;
                    }
                    if (sectionId === "description") {
                      void saveSelectedSkillFields({
                        description: event.currentTarget.value,
                      });
                      return;
                    }
                    const nextSections = {
                      ...parsePlaygroundSkillMarkdownSections(selectedSkill?.markdown || ""),
                      [sectionId]: event.currentTarget.value,
                    };
                    void saveSelectedSkillFields({
                      markdown: computePlaygroundSkillMarkdownFromSections(selectedSkill?.name || "Skill", nextSections),
                    });
                  },
                })
              )
            );
          }
  
          function renderSkillCodeFileChip(codeFile, options = {}) {
            const removable = options?.removable !== false;
            const onRemove = typeof options?.onRemove === "function" ? options.onRemove : null;
            return React.createElement("div", {
                key: codeFile.id,
                className: "runner-attachment runner-attachment-file",
              },
              React.createElement("div", {
                className: "runner-attachment-file-button",
                title: codeFile.name,
              },
                React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                  React.createElement("img", {
                    src: PLAYGROUND_TEXT_FILE_ICON_URL,
                    alt: "",
                    draggable: false,
                    className: "runner-attachment-file-icon",
                  })
                ),
                React.createElement("div", { className: "runner-attachment-file-name" }, codeFile.name)
              ),
              removable && onRemove
                ? React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-remove runner-attachment-remove-file",
                    onClick: (event) => {
                      event.stopPropagation();
                      onRemove(codeFile.id);
                    },
                    "aria-label": "Remove " + codeFile.name,
                  }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                : null
            );
          }
  
          function renderSkillEnvironmentFilePickerIcon(entry) {
            if (entry?.isFolder) {
              return React.createElement("img", {
                src: PLAYGROUND_FOLDER_ICON_URL,
                alt: "",
                draggable: false,
                className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
              });
            }
            return React.createElement("img", {
              src: PLAYGROUND_TEXT_FILE_ICON_URL,
              alt: "",
              draggable: false,
              className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
            });
          }
  
          function renderSkillEnvironmentFilePickerRow(row) {
            const entry = row.entry;
            const normalizedPath = normalizeHistoryPath(entry.path);
            const isSelected = skillEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
            const isExpanded = skillEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
            const metaValue = row.searchMatch
              ? getPlaygroundEntryParentPath(normalizedPath) || "Root"
              : formatPlaygroundFileDate(entry.modifiedTime || entry.createdTime);
  
            return React.createElement("div", { key: normalizedPath || entry.id },
              React.createElement("div", {
                className: "tb-file-browser-item" + (isSelected ? " selected" : ""),
                role: "button",
                tabIndex: 0,
                onClick: () => {
                  if (entry.isFolder && !row.searchMatch) {
                    toggleSkillEnvironmentFileFolder(normalizedPath);
                    return;
                  }
                  toggleSkillEnvironmentFileSelection(normalizedPath);
                },
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (entry.isFolder && !row.searchMatch) {
                      toggleSkillEnvironmentFileFolder(normalizedPath);
                      return;
                    }
                    toggleSkillEnvironmentFileSelection(normalizedPath);
                  }
                },
                style: row.searchMatch ? undefined : { paddingLeft: String(12 + row.level * 20) + "px" },
              },
                entry.isFolder && !row.searchMatch
                  ? React.createElement("button", {
                      type: "button",
                      className: "tb-file-browser-item-leading",
                      onClick: (event) => {
                        event.stopPropagation();
                        toggleSkillEnvironmentFileFolder(normalizedPath);
                      },
                    },
                      isExpanded
                        ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                        : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                    )
                  : React.createElement("div", {
                      className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                      onClick: (event) => {
                        event.stopPropagation();
                        toggleSkillEnvironmentFileSelection(normalizedPath);
                      },
                    },
                      isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                    ),
                renderSkillEnvironmentFilePickerIcon(entry),
                React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
                React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
                React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
              )
            );
          }
  
          function renderSkillEnvironmentFilePicker() {
            if (!skillEnvironmentFilePickerOpen) {
              return null;
            }
  
            const selectedFilesCount = skillEnvironmentFilePickerInventory.filter((entry) =>
              !entry.isFolder && skillEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
            ).length;
  
            return React.createElement("div", { className: "tb-runner-chat" },
              React.createElement(PlatformModalBackdrop, {
                className: "tb-file-browser-scrim",
                onClick: () => {
                  setSkillEnvironmentFilePickerOpen(false);
                  setSkillEnvironmentPopoverOpen(false);
                },
              },
                React.createElement(PlatformModalSurface, {
                  className: "tb-file-browser-modal",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "tb-file-browser-main" },
                    React.createElement("div", { className: "tb-file-browser-header" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-nav-button",
                        onClick: () => {
                          setSkillEnvironmentFilePickerOpen(false);
                          setSkillEnvironmentPopoverOpen(false);
                        },
                        "aria-label": "Close environment files",
                      }, React.createElement(X, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                      React.createElement("div", { className: "tb-file-browser-header-icon" },
                        React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 })
                      ),
                      React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                        availableSkillEnvironments.length > 1
                          ? React.createElement("div", {
                              className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell" + (skillEnvironmentPopoverOpen ? " is-open" : ""),
                            },
                              React.createElement("button", {
                                type: "button",
                                className: "playground-environments-runtime-value-button",
                                onClick: () => setSkillEnvironmentPopoverOpen((current) => !current),
                              },
                                React.createElement("span", { className: "playground-environments-runtime-value-label" }, selectedSkillEnvironment?.name || "Environment"),
                                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                              ),
                              skillEnvironmentPopoverOpen
                                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                    availableSkillEnvironments.map((environment) =>
                                      React.createElement("button", {
                                          key: environment.id,
                                          type: "button",
                                          className: "tb-popup-row tb-popup-row-select" + (environment.id === skillEnvironmentSelectionId ? " selected" : ""),
                                          onClick: () => {
                                            setSkillEnvironmentSelectionId(environment.id);
                                            setSkillEnvironmentPopoverOpen(false);
                                          },
                                        },
                                          React.createElement("span", { className: "tb-popup-check-slot" },
                                            environment.id === skillEnvironmentSelectionId
                                              ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                              : null
                                          ),
                                          React.createElement("span", null, environment.name || "Environment")
                                        )
                                    )
                                  )
                                : null
                            )
                          : React.createElement("span", { className: "tb-file-browser-breadcrumb-chip" },
                              React.createElement("span", { className: "tb-file-browser-breadcrumb active" }, selectedSkillEnvironment?.name || "Environment")
                            )
                      ),
                      React.createElement("div", { className: "tb-file-browser-count" }, selectedFilesCount + (selectedFilesCount === 1 ? " file selected" : " files selected"))
                    ),
                    React.createElement("div", { className: "tb-file-browser-search-wrap" },
                      React.createElement("div", { className: "tb-file-browser-search" },
                        React.createElement(Search, { className: "tb-file-browser-search-icon", strokeWidth: 1.9 }),
                        React.createElement("input", {
                          className: "tb-file-browser-search-input",
                          value: skillEnvironmentFilePickerSearch,
                          placeholder: "Search files...",
                          onChange: (event) => setSkillEnvironmentFilePickerSearch(event.target.value),
                        }),
                        skillEnvironmentFilePickerSearch
                          ? React.createElement("button", {
                              type: "button",
                              className: "tb-file-browser-search-clear",
                              onClick: () => setSkillEnvironmentFilePickerSearch(""),
                              "aria-label": "Clear search",
                            }, React.createElement(X, { className: "tb-file-browser-search-clear-icon", strokeWidth: 1.9 }))
                          : null
                      )
                    ),
                    React.createElement("div", { className: "tb-file-browser-list" },
                      skillEnvironmentFilePickerState.status === "loading"
                        ? React.createElement("div", { className: "tb-file-browser-empty" }, "Loading environment files...")
                        : skillEnvironmentFilePickerState.error
                          ? React.createElement("div", { className: "tb-file-browser-empty" }, skillEnvironmentFilePickerState.error)
                          : skillEnvironmentFilePickerRows.length === 0
                            ? React.createElement("div", { className: "tb-file-browser-empty" }, skillEnvironmentFilePickerSearch.trim() ? "No matching files found." : "No files found in this environment.")
                            : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                skillEnvironmentFilePickerRows.map((row) => renderSkillEnvironmentFilePickerRow(row))
                              )
                    )
                  ),
                  React.createElement("div", { className: "tb-file-browser-footer" },
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                      onClick: () => {
                        setSkillEnvironmentFilePickerOpen(false);
                        setSkillEnvironmentPopoverOpen(false);
                      },
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      type: "button",
                      className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                      onClick: () => void handleAttachSkillEnvironmentFiles(),
                      disabled: selectedFilesCount === 0 || skillCodeFilesTransferState.isProcessing,
                    },
                      React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                        skillCodeFilesTransferState.isProcessing
                          ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                          : null,
                        React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                          skillCodeFilesTransferState.isProcessing ? "Adding Files..." : "Add Files"
                        )
                      )
                    )
                  )
                )
              )
            );
          }
  
          function renderSkillRenameModal() {
            if (!skillRenameState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!skillSaveState.isSaving) {
                    closeSkillRenameDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleSkillRenameSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Skill"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this skill."),
                  React.createElement("input", {
                    ref: skillRenameInputRef,
                    className: "sidebar-thread-rename-input",
                    value: skillRenameValue,
                    onChange: (event) => setSkillRenameValue(event.target.value),
                    placeholder: "Skill name",
                    disabled: skillSaveState.isSaving,
                  }),
                  skillRenameError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, skillRenameError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeSkillRenameDialog,
                      disabled: skillSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: skillSaveState.isSaving,
                    }, skillSaveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
          function renderSkillEditModal() {
            if (!skillEditState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!skillSaveState.isSaving) {
                    closeSkillEditDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal playground-skills-edit-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleSkillEditSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Edit Skill"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Update the title and description agents see when this skill is available."),
                  React.createElement("label", { className: "playground-skills-edit-field" },
                    React.createElement("span", { className: "playground-skills-edit-label" }, "Title"),
                    React.createElement("input", {
                      ref: skillEditTitleInputRef,
                      className: "sidebar-thread-rename-input playground-skills-edit-title-input",
                      value: skillEditTitleValue,
                      onChange: (event) => {
                        setSkillEditTitleValue(event.target.value);
                        setSkillEditError("");
                      },
                      placeholder: "Skill title",
                      disabled: skillSaveState.isSaving,
                    })
                  ),
                  React.createElement("div", { className: "playground-skills-edit-description" },
                    React.createElement("div", { className: "playground-tasks-detail-section-header" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description")
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing playground-skills-edit-description-editor" },
                      React.createElement("textarea", {
                        ref: skillEditDescriptionTextareaRef,
                        className: "playground-tasks-detail-description-input is-editing playground-skills-edit-description-input",
                        value: skillEditDescriptionValue,
                        onChange: (event) => {
                          setSkillEditDescriptionValue(event.target.value);
                          setSkillEditError("");
                          resizeSkillTextarea(event.currentTarget);
                        },
                        placeholder: "Describe when this skill should be used.",
                        disabled: skillSaveState.isSaving,
                        rows: 4,
                      })
                    )
                  ),
                  skillEditError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, skillEditError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeSkillEditDialog,
                      disabled: skillSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: skillSaveState.isSaving,
                    }, skillSaveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
  	        function renderSkillListActionMenu() {
  	          if (!skillListActionMenuState || !skillListActionTarget) {
  	            return null;
  	          }
  
  	          const isDeleting = skillSaveState.isSaving && selectedSkillId === skillListActionTarget.id;
  	          const menuElement = React.createElement(PlatformPopupDismissLayer, {
  	              className: "sidebar-thread-popup-scrim",
  	              style: { zIndex: 9000 },
  	              onClick: closeSkillListActionMenu,
  	            },
  	              React.createElement("div", {
  	                className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
  	                style: getSkillListActionMenuStyle(skillListActionMenuState),
  	                onClick: (event) => event.stopPropagation(),
  	              },
  	                React.createElement(PlatformPopupSurface, {
  	                    className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in",
  	                    role: "menu",
  	                  },
  	                React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row",
  	                  onClick: () => {
  	                    closeSkillListActionMenu();
  	                    handleSkillSelect(skillListActionTarget.id);
  	                  },
  	                },
  	                  React.createElement(ChevronRight, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, "Open"))
  	                ),
  	                skillListActionTarget.isCustom ? React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row",
  	                  onClick: () => openSkillEditDialog(skillListActionTarget),
  	                },
  	                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, "Edit"))
  	                ) : null,
  	                skillListActionTarget.isCustom ? React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row",
  	                  onClick: () => openSkillRenameDialog(skillListActionTarget),
  	                },
  	                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, "Rename"))
  	                ) : null,
  	                skillListActionTarget.isCustom ? React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row is-danger",
  	                  onClick: () => {
  	                    void handleDeleteSelectedSkill(skillListActionTarget);
  	                  },
  	                  disabled: isDeleting,
  	                },
  	                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, isDeleting ? "Deleting..." : "Delete"))
  	                ) : null
  	                )
  	              )
  	            );
  	          return typeof createPortal === "function" && typeof document !== "undefined" && document.body
  	            ? createPortal(menuElement, document.body)
  	            : menuElement;
  	        }
  
          function renderSkillsCreateAction() {
            return React.createElement(PlatformPrimaryButton, {
                  type: "button",
                  size: "small",
                  className: "playground-skills-top-nav-action-button",
                  onClick: () => void createAndOpenCustomSkill(),
                  title: "Create custom skill",
                  "aria-label": "Create custom skill",
                  disabled: skillSaveState.isSaving,
                },
                  React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Custom Skill")
                );
          }

          function renderCurrentSkillDetail() {
            const skillHasVersionChanges = Boolean(
              selectedSkill?.isCustom
              && hasSelectedSkillVersionChanges()
            );
            const skillVersionControlBusy = Boolean(
              skillSaveState.isSaving
              || skillCodeFilesTransferState.isProcessing
              || skillVersionState.status === "loading"
            );
            const skillVersionControlDisabled = Boolean(
              skillVersionControlBusy
              || !skillHasVersionChanges
            );
            const skillDetailTopNavAction = skillsPageMode !== "detail"
              || !selectedSkill
              || !selectedSkill.isCustom
              ? null
              : React.createElement(PlatformVersionPublishControl, {
                  open: skillPublishMenuOpen,
                  onOpenChange: setSkillPublishMenuOpen,
                  onPublish: () => openSkillVersionSaveDialog(),
                  active: skillHasVersionChanges,
                  disabled: skillVersionControlDisabled,
                  menuDisabled: skillVersionControlDisabled,
                  actions: selectedSkill.isDraft ? [{
                    id: "discard-draft",
                    label: "Discard draft",
                    icon: Trash2,
                    onClick: handleBackToSkillsOverview,
                  }] : [
                    {
                      id: "version-history",
                      label: "Version history",
                      icon: History,
                      onClick: () => setSkillVersionsOpen(true),
                    },
                  ],
                  label: skillSaveState.isSaving ? "Saving..." : "Save Changes",
                  leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
                  publishAriaLabel: "Save skill changes",
                  className: "playground-skills-publish-control",
                });
            const skillsTopNavActions = topNavActionsContainer
              ? createPortal(React.createElement(React.Fragment, null,
                  skillsPageMode === "detail"
                    ? (skillVersionChangesState ? null : skillDetailTopNavAction)
                    : renderSkillsCreateAction()
                ), topNavActionsContainer)
              : null;
  
            if (!selectedSkill) {
              return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main" },
                skillsTopNavActions,
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                  React.createElement("div", { className: "playground-files-state" },
                    skillsLoading
                      ? React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                      : null,
                    React.createElement("span", null,
                      skillListMode === "custom"
                        ? (skillsLoading ? "Loading skills..." : "Select a skill")
                        : "Select a system skill"
                    )
                  )
                )
              );
            }
  
            const selectedSkillFamilyId = String(selectedSkill.systemFamilyId || selectedSkill.id || "").trim().toLowerCase();
	          const selectedSkillCodeFiles = normalizeSkillCodeFiles(selectedSkill.codeFiles);
            const activeSkillCodeFile = selectedSkillCodeFiles.find((file) => file.id === skillCodeEditorState.fileId) || selectedSkillCodeFiles[0] || null;
            const activeSkillCodeFileEntry = activeSkillCodeFile
              ? { name: activeSkillCodeFile.name, path: activeSkillCodeFile.name, isFolder: false, mimeType: "" }
              : null;
            const skillCodeEditorIsDirty = skillCodeEditorState.value !== skillCodeEditorState.initialValue;
  
            function selectSkillCodeFile(fileId) {
              const nextFile = selectedSkillCodeFiles.find((file) => file.id === fileId) || selectedSkillCodeFiles[0] || null;
              setSkillCodeEditorState({
                fileId: nextFile?.id || "",
                value: nextFile?.content || "",
                initialValue: nextFile?.content || "",
                isSaving: false,
                error: "",
                message: "",
              });
            }
  
            function handleSkillCodeEditorChange(value) {
              setSkillCodeEditorState((current) => ({
                ...current,
                value: typeof value === "string" ? value : "",
                error: "",
                message: "",
              }));
            }
  
            function handleSkillCodeEditorRevert() {
              setSkillCodeEditorState((current) => ({
                ...current,
                value: current.initialValue,
                error: "",
                message: "",
              }));
            }
  
            async function handleSkillCodeEditorSave() {
              if (!activeSkillCodeFile || !isSelectedSkillCodeFilesEditable || !skillCodeEditorIsDirty) {
                return;
              }
              setSkillCodeEditorState((current) => ({
                ...current,
                isSaving: true,
                error: "",
                message: "",
              }));
              const nextFiles = selectedSkillCodeFiles.map((file) =>
                file.id === activeSkillCodeFile.id
                  ? {
                      ...file,
                      content: skillCodeEditorState.value,
                      language: file.language || getPlaygroundCodeEditorLanguage({ name: file.name, path: file.name }),
                    }
                  : file
              );
              const didSave = await saveSelectedSkillCodeFiles(nextFiles);
              setSkillCodeEditorState((current) => ({
                ...current,
                isSaving: false,
                initialValue: didSave ? current.value : current.initialValue,
                error: didSave ? "" : (skillCodeFilesTransferState.error || "Failed to save code file."),
                message: didSave ? "Saved" : "",
              }));
            }
  
            function renderSkillCodeEditorBody() {
              if (!activeSkillCodeFile) {
                return React.createElement("div", { className: "playground-servers-code-empty" },
                  isSelectedSkillCodeFilesEditable ? "Add a file to start editing this skill." : "No source files available for this skill."
                );
              }
              if (SkillCodeEditorComponent) {
                return React.createElement("div", { className: "playground-code-preview-editor-shell playground-servers-code-editor-shell" },
                  React.createElement(SkillCodeEditorComponent, {
                    path: activeSkillCodeFile.name,
                    height: "100%",
                    language: activeSkillCodeFile.language || getPlaygroundCodeEditorLanguage(activeSkillCodeFileEntry),
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value: skillCodeEditorState.value,
                    onChange: handleSkillCodeEditorChange,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      readOnly: !isSelectedSkillCodeFilesEditable,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "gutter",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: "off",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                );
              }
              return React.createElement("textarea", {
                className: "playground-code-preview-textarea playground-servers-source-editor-textarea playground-servers-code-editor-shell",
                value: skillCodeEditorState.value,
                onChange: (event) => handleSkillCodeEditorChange(event.target.value),
                readOnly: !isSelectedSkillCodeFilesEditable,
                spellCheck: false,
                wrap: "off",
              });
            }
  
            const skillResourceMetadata = {
              permissionSet: selectedSkill.permissionSet || null,
              accessControl: selectedSkill.accessControl || null,
              ...(selectedSkill.metadata && typeof selectedSkill.metadata === "object"
                ? selectedSkill.metadata
                : {}),
            };
            const explicitSkillSourceFolders = Array.from(new Set(
              (Array.isArray(skillResourceMetadata.sourceFolders)
                ? skillResourceMetadata.sourceFolders
                : [])
                .map((folderPath) => normalizeHistoryPath(folderPath))
                .filter(Boolean)
            ));
            const skillWorkspaceSourceById = new Map();
            const skillWorkspaceFolderPaths = new Set(explicitSkillSourceFolders);
            selectedSkillCodeFiles.forEach((codeFile) => {
              const normalizedPath = normalizeHistoryPath(codeFile.name);
              const pathParts = normalizedPath.split("/").filter(Boolean);
              pathParts.pop();
              let currentPath = "";
              pathParts.forEach((pathPart) => {
                currentPath = currentPath ? currentPath + "/" + pathPart : pathPart;
                skillWorkspaceFolderPaths.add(currentPath);
              });
            });
            const sortedSkillWorkspaceFolderPaths = Array.from(skillWorkspaceFolderPaths)
              .sort((left, right) => {
                const depthDelta = left.split("/").length - right.split("/").length;
                return depthDelta || left.localeCompare(right);
              });
            const skillWorkspaceFiles = [];
            sortedSkillWorkspaceFolderPaths.forEach((folderPath) => {
              const pathParts = folderPath.split("/").filter(Boolean);
              const parentPath = pathParts.slice(0, -1).join("/");
              const entry = {
                id: "skill-folder:" + folderPath,
                label: pathParts[pathParts.length - 1] || folderPath,
                tabLabel: folderPath,
                path: folderPath,
                parentId: parentPath ? "skill-folder:" + parentPath : null,
                depth: Math.max(0, pathParts.length - 1),
                isFolder: true,
                selectable: isSelectedSkillCodeFilesEditable,
                renameDisabled: !isSelectedSkillCodeFilesEditable,
                deleteDisabled: !isSelectedSkillCodeFilesEditable,
                moveDisabled: !isSelectedSkillCodeFilesEditable,
                dropDisabled: !isSelectedSkillCodeFilesEditable,
              };
              skillWorkspaceFiles.push(entry);
              skillWorkspaceSourceById.set(entry.id, entry);
            });
            selectedSkillCodeFiles
              .slice()
              .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
              .forEach((codeFile) => {
                const normalizedPath = normalizeHistoryPath(codeFile.name);
                const pathParts = normalizedPath.split("/").filter(Boolean);
                const parentPath = pathParts.slice(0, -1).join("/");
                const entry = {
                  id: codeFile.id,
                  label: pathParts[pathParts.length - 1] || codeFile.name,
                  tabLabel: codeFile.name,
                  path: normalizedPath,
                  parentId: parentPath ? "skill-folder:" + parentPath : null,
                  depth: Math.max(0, pathParts.length - 1),
                  isFolder: false,
                  selectable: isSelectedSkillCodeFilesEditable,
                  renameDisabled: !isSelectedSkillCodeFilesEditable,
                  deleteDisabled: !isSelectedSkillCodeFilesEditable,
                  moveDisabled: !isSelectedSkillCodeFilesEditable,
                };
                skillWorkspaceFiles.push(entry);
                skillWorkspaceSourceById.set(entry.id, {
                  ...entry,
                  codeFile,
                });
              });

            async function persistSkillSourceFolders(nextFolderPaths) {
              const normalizedFolderPaths = Array.from(new Set(
                (Array.isArray(nextFolderPaths) ? nextFolderPaths : [])
                  .map((folderPath) => normalizeHistoryPath(folderPath))
                  .filter(Boolean)
              )).sort();
              await updateSelectedSkillAccessMetadata({
                ...skillResourceMetadata,
                sourceFolders: normalizedFolderPaths,
              });
            }

            async function createSkillSourceFile() {
              if (!isSelectedSkillCodeFilesEditable) return;
              const requestedPath = window.prompt("File path", "file.js");
              const normalizedPath = normalizeHistoryPath(requestedPath);
              if (!normalizedPath) return;
              if (selectedSkillCodeFiles.some((file) => normalizeHistoryPath(file.name) === normalizedPath)) {
                setSkillCodeFilesTransferState({
                  isProcessing: false,
                  error: "A source file with this path already exists.",
                });
                return;
              }
              const nextFile = buildPlaygroundSkillCodeFileRecord(normalizedPath, "");
              const didSave = await saveSelectedSkillCodeFiles([...selectedSkillCodeFiles, nextFile]);
              if (didSave) {
                setSkillCodeEditorState({
                  fileId: nextFile.id,
                  value: "",
                  initialValue: "",
                  isSaving: false,
                  error: "",
                  message: "",
                });
              }
            }

            async function createSkillSourceFolder() {
              if (!isSelectedSkillCodeFilesEditable) return;
              const requestedPath = window.prompt("Folder path", "scripts");
              const normalizedPath = normalizeHistoryPath(requestedPath);
              if (!normalizedPath || skillWorkspaceFolderPaths.has(normalizedPath)) return;
              await persistSkillSourceFolders([...explicitSkillSourceFolders, normalizedPath]);
            }

            async function renameSkillWorkspaceEntry(workspaceFile) {
              if (!isSelectedSkillCodeFilesEditable || !workspaceFile) return;
              const sourceEntry = skillWorkspaceSourceById.get(workspaceFile.id);
              if (!sourceEntry) return;
              const currentPath = normalizeHistoryPath(sourceEntry.path);
              const requestedPath = window.prompt(
                sourceEntry.isFolder ? "Rename folder" : "Rename file",
                currentPath
              );
              const nextPath = normalizeHistoryPath(requestedPath);
              if (!nextPath || nextPath === currentPath) return;
              if (sourceEntry.isFolder) {
                const nextFiles = selectedSkillCodeFiles.map((codeFile) => {
                  const filePath = normalizeHistoryPath(codeFile.name);
                  if (filePath !== currentPath && !filePath.startsWith(currentPath + "/")) {
                    return codeFile;
                  }
                  return {
                    ...codeFile,
                    name: nextPath + filePath.slice(currentPath.length),
                  };
                });
                const nextFolders = explicitSkillSourceFolders.map((folderPath) =>
                  folderPath === currentPath || folderPath.startsWith(currentPath + "/")
                    ? nextPath + folderPath.slice(currentPath.length)
                    : folderPath
                );
                const didSave = await saveSelectedSkillCodeFiles(nextFiles);
                if (didSave) await persistSkillSourceFolders(nextFolders);
                return;
              }
              const nextFiles = selectedSkillCodeFiles.map((codeFile) =>
                codeFile.id === sourceEntry.codeFile?.id
                  ? {
                      ...codeFile,
                      name: nextPath,
                      language: getPlaygroundCodeEditorLanguage({
                        name: nextPath,
                        path: nextPath,
                        isDirectory: false,
                        mimeType: "",
                      }) || codeFile.language,
                    }
                  : codeFile
              );
              await saveSelectedSkillCodeFiles(nextFiles);
            }

            async function deleteSkillWorkspaceEntries(workspaceFiles) {
              if (!isSelectedSkillCodeFilesEditable || !Array.isArray(workspaceFiles)) return;
              const selectedFolderPaths = workspaceFiles
                .map((workspaceFile) => skillWorkspaceSourceById.get(workspaceFile.id))
                .filter((entry) => entry?.isFolder)
                .map((entry) => normalizeHistoryPath(entry.path));
              const selectedFileIds = new Set(
                workspaceFiles
                  .map((workspaceFile) => skillWorkspaceSourceById.get(workspaceFile.id))
                  .filter((entry) => entry && !entry.isFolder && entry.codeFile?.id)
                  .map((entry) => entry.codeFile.id)
              );
              const nextFiles = selectedSkillCodeFiles.filter((codeFile) => {
                const filePath = normalizeHistoryPath(codeFile.name);
                if (selectedFileIds.has(codeFile.id)) return false;
                return !selectedFolderPaths.some((folderPath) =>
                  filePath === folderPath || filePath.startsWith(folderPath + "/")
                );
              });
              const nextFolders = explicitSkillSourceFolders.filter((folderPath) =>
                !selectedFolderPaths.some((selectedFolderPath) =>
                  folderPath === selectedFolderPath || folderPath.startsWith(selectedFolderPath + "/")
                )
              );
              const didSave = await saveSelectedSkillCodeFiles(nextFiles);
              if (didSave) await persistSkillSourceFolders(nextFolders);
            }

            async function moveSkillWorkspaceEntries({ files, destinationFolder }) {
              if (!isSelectedSkillCodeFilesEditable || !Array.isArray(files)) return;
              const destinationEntry = destinationFolder
                ? skillWorkspaceSourceById.get(destinationFolder.id)
                : null;
              const destinationPath = destinationEntry?.isFolder
                ? normalizeHistoryPath(destinationEntry.path)
                : "";
              const movingEntries = files
                .map((workspaceFile) => skillWorkspaceSourceById.get(workspaceFile.id))
                .filter(Boolean);
              const movingFolderPaths = movingEntries
                .filter((entry) => entry.isFolder)
                .map((entry) => normalizeHistoryPath(entry.path));
              if (movingFolderPaths.some((folderPath) =>
                destinationPath === folderPath || destinationPath.startsWith(folderPath + "/")
              )) {
                return;
              }
              const pathMoves = movingEntries.map((entry) => {
                const currentPath = normalizeHistoryPath(entry.path);
                const baseName = currentPath.split("/").filter(Boolean).pop() || currentPath;
                return {
                  entry,
                  currentPath,
                  nextPath: destinationPath ? destinationPath + "/" + baseName : baseName,
                };
              });
              const nextFiles = selectedSkillCodeFiles.map((codeFile) => {
                const currentFilePath = normalizeHistoryPath(codeFile.name);
                const enclosingFolderMove = pathMoves.find(({ entry, currentPath }) =>
                  entry.isFolder
                  && (currentFilePath === currentPath || currentFilePath.startsWith(currentPath + "/"))
                );
                if (enclosingFolderMove) {
                  return {
                    ...codeFile,
                    name: enclosingFolderMove.nextPath
                      + currentFilePath.slice(enclosingFolderMove.currentPath.length),
                  };
                }
                const directFileMove = pathMoves.find(({ entry }) =>
                  !entry.isFolder && entry.codeFile?.id === codeFile.id
                );
                return directFileMove
                  ? { ...codeFile, name: directFileMove.nextPath }
                  : codeFile;
              });
              const nextFolders = explicitSkillSourceFolders.map((folderPath) => {
                const enclosingFolderMove = pathMoves.find(({ entry, currentPath }) =>
                  entry.isFolder
                  && (folderPath === currentPath || folderPath.startsWith(currentPath + "/"))
                );
                return enclosingFolderMove
                  ? enclosingFolderMove.nextPath + folderPath.slice(enclosingFolderMove.currentPath.length)
                  : folderPath;
              });
              const didSave = await saveSelectedSkillCodeFiles(nextFiles);
              if (didSave) await persistSkillSourceFolders(nextFolders);
            }

            async function selectSkillWorkspaceFile(fileId) {
              const sourceEntry = skillWorkspaceSourceById.get(fileId);
              if (!sourceEntry || sourceEntry.isFolder) return;
              if (skillCodeEditorIsDirty) {
                await handleSkillCodeEditorSave();
              }
              selectSkillCodeFile(sourceEntry.codeFile?.id || fileId);
            }

            const isSystemSkillSourceLoading = Boolean(
              selectedSkill.isSystem
              && !systemSkillSourceCatalog[selectedSkillFamilyId]
            );
            const skillMetadataSection = renderSkillIdentitySection(skillResourceMetadata);
            const skillCodeWorkspace = React.createElement(React.Fragment, null,
              isSelectedSkillCodeFilesEditable
                ? React.createElement("input", {
                    ref: skillCodeFileInputRef,
                    type: "file",
                    multiple: true,
                    hidden: true,
                    onChange: (event) => void handleSkillCodeFileInputChange(event),
                  })
                : null,
              React.createElement(PlatformCodeEditorWorkspace, {
                className: "skill-detail-page__code-workspace" + (isSkillCodeDragging ? " is-dragging" : ""),
                ariaLabel: (selectedSkill.name || "Skill") + " source editor",
                variant: "full-screen",
                files: skillWorkspaceFiles,
                activeFileId: activeSkillCodeFile?.id || "",
                onFileSelect: selectSkillWorkspaceFile,
                onFileRename: isSelectedSkillCodeFilesEditable ? renameSkillWorkspaceEntry : undefined,
                onFilesDelete: isSelectedSkillCodeFilesEditable ? deleteSkillWorkspaceEntries : undefined,
                onFilesMove: isSelectedSkillCodeFilesEditable ? moveSkillWorkspaceEntries : undefined,
                onCreateFile: isSelectedSkillCodeFilesEditable ? createSkillSourceFile : undefined,
                onUploadFiles: isSelectedSkillCodeFilesEditable ? openSkillCodeFilePicker : undefined,
                onCreateFolder: isSelectedSkillCodeFilesEditable ? createSkillSourceFolder : undefined,
                fileCreationDisabled: skillCodeFilesTransferState.isProcessing || skillSaveState.isSaving,
                isLoadingFiles: isSystemSkillSourceLoading,
                loadingFilesMessage: "Loading skill source...",
                emptyFiles: selectedSkill.isSystem
                  ? "No source files are exposed for this system skill."
                  : "No source files yet.",
                editor: renderSkillCodeEditorBody(),
                markdownEditor: activeSkillCodeFile
                  ? {
                      value: skillCodeEditorState.value,
                      onChange: handleSkillCodeEditorChange,
                      placeholder: "Write skill instructions in Markdown...",
                      ariaLabel: activeSkillCodeFile.name + " Markdown content",
                      readOnly: !isSelectedSkillCodeFilesEditable,
                      historyKey: activeSkillCodeFile.id,
                    }
                  : undefined,
                historyControls: isSelectedSkillCodeFilesEditable
                  ? {
                      onUndo: () => {},
                      onRedo: () => {},
                      undoDisabled: true,
                      redoDisabled: true,
                    }
                  : undefined,
                onDragOver: (event) => {
                  event.preventDefault();
                  if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) return;
                  setIsSkillCodeDragging(true);
                },
                onDragLeave: (event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) return;
                  setIsSkillCodeDragging(false);
                },
                onDrop: (event) => void handleSkillCodeFileDrop(event),
              })
            );
            const skillCodeNotice = skillSaveState.error || skillCodeFilesTransferState.error
              ? React.createElement("div", {
                  className: "playground-environments-error playground-environments-editor-notice",
                  role: "alert",
                }, skillSaveState.error || skillCodeFilesTransferState.error)
              : null;

            const normalizedWorkspaceTeams = (Array.isArray(workspaceTeams) ? workspaceTeams : [])
              .map((team) => {
                const id = String(team?.id || team?.teamId || "").trim();
                if (!id) return null;
                return {
                  ...team,
                  id,
                  name: String(team?.name || team?.title || "Team").trim() || "Team",
                  kind: "team",
                  roleId: String(team?.roleId || "member"),
                  roleLabel: String(team?.roleLabel || team?.role || "Member"),
                  createdAt: String(team?.createdAt || ""),
                  profileImageUrl: String(
                    team?.profileImageUrl
                    || team?.imageUrl
                    || team?.avatarUrl
                    || ""
                  ),
                };
              })
              .filter(Boolean);
            const sharedSkillTeamIds = getPlatformSharedTeamIds(skillResourceMetadata);
            const sharedSkillTeamIdSet = new Set(sharedSkillTeamIds);
            const skillWorkspaceTeamById = new Map(
              normalizedWorkspaceTeams.map((team) => [String(team.id), team])
            );
            const skillAccessTeams = sharedSkillTeamIds.map((teamId) =>
              skillWorkspaceTeamById.get(String(teamId))
              || {
                id: String(teamId),
                name: "Team",
                kind: "team",
                roleId: "member",
                roleLabel: "Member",
                createdAt: "",
                profileImageUrl: "",
              }
            );
            const availableSkillAccessTeams = normalizedWorkspaceTeams.filter(
              (team) => !sharedSkillTeamIdSet.has(String(team.id))
            );
            const selectedSkillSystemPrincipal = getPlatformSystemAccessPrincipal(skillAccessPrincipalId);
            const selectedSkillAccessTeam = skillAccessPrincipalId && !selectedSkillSystemPrincipal
              ? skillAccessTeams.find((team) => String(team.id) === String(skillAccessPrincipalId)) || null
              : null;
            const skillAccessAddTeamsControl = selectedSkill.isCustom
              ? React.createElement(PlatformButtonSelector, {
                  mode: "popup",
                  buttonVariant: "secondary",
                  buttonSize: "small",
                  label: "Add Teams",
                  leading: React.createElement(Plus, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  open: skillAccessTeamMenuOpen,
                  onOpenChange: setSkillAccessTeamMenuOpen,
                  closeOnSelect: true,
                  popupAriaLabel: "Add teams with skill access",
                  popupAlignment: "right",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupWidth: 240,
                  disabled: skillSaveState.isSaving,
                },
                availableSkillAccessTeams.length
                  ? availableSkillAccessTeams.map((team) =>
                      React.createElement("button", {
                        key: team.id,
                        type: "button",
                        role: "menuitem",
                        className: "platform-data-table__menu-item",
                        onClick: () => {
                          setSkillAccessTeamMenuOpen(false);
                          void updateSelectedSkillAccessMetadata(
                            buildPlatformTeamAccessMetadata(
                              skillResourceMetadata,
                              team.id,
                              true,
                              "skill_team_role"
                            )
                          );
                        },
                      },
                        React.createElement(Users, {
                          className: "platform-data-table__menu-icon",
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                        }),
                        React.createElement("span", {
                          className: "platform-data-table__menu-copy",
                        }, team.name)
                      )
                    )
                  : React.createElement("div", {
                      className: "playground-project-teams-menu-empty",
                    }, "All available teams have access.")
              )
              : null;
            const skillPermissionActionDefinitions = PLAYGROUND_PERMISSION_ACTION_DEFINITIONS.filter(
              (definition) => Array.isArray(definition?.subjectTypes)
                && definition.subjectTypes.some((subjectType) =>
                  subjectType === "skill" || subjectType === "skill_team_role"
                )
            );
            const skillAccessSettingsContent = React.createElement(PlatformResourceAccessSettings, {
              teams: skillAccessTeams,
              resourceLabel: "Skill",
              selectedPrincipalId: skillAccessPrincipalId,
              onSelectedPrincipalIdChange: (principalId) => {
                setSkillAccessRoleId("member");
                setSkillAccessPrincipalId(String(principalId || ""));
              },
              subjectType: "skill",
              teamSubjectType: "skill_team_role",
              systemPermissionSet: getPlatformSystemPrincipalPermissionSet(
                skillResourceMetadata,
                selectedSkillSystemPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
                "skill",
                skillResourceMetadata.permissionSet
              ),
              onSystemPermissionSetChange: selectedSkill.isCustom
                ? (permissionSet) => void updateSelectedSkillAccessMetadata(
                    buildPlatformSystemPrincipalPermissionMetadata(
                      skillResourceMetadata,
                      selectedSkillSystemPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
                      permissionSet,
                      "skill"
                    )
                  )
                : undefined,
              systemRolePermissionSet: getPlatformSystemPrincipalRolePermissionSet(
                skillResourceMetadata,
                PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
                skillAccessRoleId,
                "skill_team_role"
              ),
              onSystemRolePermissionSetChange: selectedSkill.isCustom
                ? (roleId, permissionSet) => void updateSelectedSkillAccessMetadata(
                    buildPlatformSystemPrincipalRolePermissionMetadata(
                      skillResourceMetadata,
                      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
                      roleId,
                      permissionSet,
                      "skill_team_role"
                    )
                  )
                : undefined,
              selectedRoleId: skillAccessRoleId,
              onSelectedRoleIdChange: setSkillAccessRoleId,
              teamPermissionSet: selectedSkillAccessTeam
                ? getPlatformTeamRolePermissionSet(
                    skillResourceMetadata,
                    selectedSkillAccessTeam.id,
                    skillAccessRoleId,
                    "skill_team_role"
                  )
                : null,
              onTeamPermissionSetChange: selectedSkill.isCustom && selectedSkillAccessTeam
                ? (roleId, permissionSet) => void updateSelectedSkillAccessMetadata(
                    buildPlatformTeamRolePermissionMetadata(
                      skillResourceMetadata,
                      selectedSkillAccessTeam.id,
                      roleId,
                      permissionSet,
                      "skill_team_role"
                    )
                  )
                : undefined,
              actionDefinitions: skillPermissionActionDefinitions,
              animationKey: selectedSkill.id + ":" + skillAccessRoleId,
              disabled: !selectedSkill.isCustom,
              backLabel: "Settings",
              className: "skill-detail-page__access-settings",
              tableProps: {
                className: "skill-detail-page__access-table",
                title: "Manage Skill Access",
                titleTooltip: "Controls which agents, organization roles, and teams can view, use, update, publish, or manage this skill.",
                trailing: skillAccessAddTeamsControl,
                selectedIds: skillAccessSelectedTeamIds,
                onSelectedIdsChange: setSkillAccessSelectedTeamIds,
                pagination: {},
                busy: skillSaveState.isSaving,
                onRemoveTeams: selectedSkill.isCustom
                  ? (teams) => {
                      let nextMetadata = skillResourceMetadata;
                      teams.forEach((team) => {
                        nextMetadata = buildPlatformTeamAccessMetadata(
                          nextMetadata,
                          team.id,
                          false,
                          "skill_team_role"
                        );
                      });
                      setSkillAccessPrincipalId("");
                      setSkillAccessSelectedTeamIds(new Set());
                      void updateSelectedSkillAccessMetadata(nextMetadata);
                    }
                  : undefined,
                getTeamProfileImageUrl: (team) => String(team.profileImageUrl || ""),
                formatCreatedAt: (value) => value
                  ? formatRelativeThreadTime(value)
                  : "—",
                error: skillSaveState.error || null,
              },
            });
            const skillSettingsComposition = renderSkillSettingsComposition(
              skillAccessSettingsContent,
              skillResourceMetadata
            );
            const skillSettingsTabContent = skillSettingsComposition.content;
            const skillSettingsSidebar = skillSettingsComposition.sidebar;
            const skillVersionsSidebar = selectedSkill.isCustom && !selectedSkill.isDraft
              ? React.createElement(PlatformVersionHistorySidebar, {
                  open: skillVersionsOpen,
                  title: "Version history",
                  sectionTitle: "All Versions",
                  className: "skill-detail-page__versions-sidebar",
                  width: "var(--playground-thread-task-detail-width, min(42vw, 520px))",
                  portal: true,
                  portalTarget: skillVersionsDrawerContainer,
                  versions: skillVersionState.versions,
                  activeVersionId: skillVersionState.publishedVersionId,
                  selectedVersionId: skillVersionState.currentVersionId,
                  loading: skillVersionState.status === "loading",
                  loadingMessage: "Loading versions",
                  error: skillVersionState.error || null,
                  emptyDescription: "Publish this skill to create its first version.",
                  busy: skillSaveState.isSaving || skillVersionState.status === "loading",
                  onClose: () => { setSkillVersionChangesState(null); setSkillVersionsOpen(false); },
                  onSelectVersion: (versionId) => void restoreSelectedSkillVersion(versionId),
                  onPublishVersion: (versionId) => void publishSelectedSkillVersion(versionId),
                  canPublishVersion: (version) => canPublishSelectedSkillVersion(version),
                  onViewChanges: () => openSkillVersionChangesPage(),
                  getVersionActions: (version) => getSelectedSkillVersionActions(version),
                  getVersionCreatedAt: (version) => formatRelativeThreadTime(
                    version?.createdAt || version?.updatedAt || version?.publishedAt
                  ) || "—",
                })
              : null;
            const skillVersionChangesSurface = renderSkillVersionChangesSurface(skillDetailTopNavAction);

            return React.createElement(React.Fragment, null,
              skillsTopNavActions,
              skillVersionChangesSurface
                ? skillVersionChangesSurface
                : React.createElement(React.Fragment, null,
                    renderSkillTitleActions(),
                    React.createElement(SkillDetailPage, {
                      activeTab: skillDetailTab,
                      metadata: skillMetadataSection,
                      notice: skillCodeNotice,
                      code: skillCodeWorkspace,
                      settings: skillSettingsTabContent,
                      sidebar: skillSettingsSidebar,
                      className: "playground-skills-detail-page",
                    })
                  ),
              skillVersionsSidebar,
              renderSkillVersionSaveDialog(),
              renderSkillVersionEditDialog(),
              renderSkillSendToTeamModal()
            );
          }
  
          function renderSkillsOverviewPage() {
            const skillsTopNavActions = topNavActionsContainer
              ? createPortal(renderSkillsCreateAction(), topNavActionsContainer)
              : null;
            const rows = allSkills.map((skill) => {
              const updatedAt = Date.parse(String(skill?.updatedAt || skill?.createdAt || ""));
              const systemSkillFamilyId = String(
                skill?.systemFamilyId
                || getPlaygroundSkillFamilyId(skill?.id)
                || skill?.id
                || ""
              ).trim().toLowerCase();
              return {
                ...skill,
                id: String(skill?.id || ""),
                name: String(skill?.name || skill?.id || "Skill"),
                description: String(skill?.description || ""),
                searchText: [skill?.name, skill?.description, skill?.id].filter(Boolean).join(" "),
                icon: renderSkillIcon(skill, "playground-environments-list-item-icon"),
                isComputerAgents: systemSkillFamilyId === "computer_agents",
                isActive: skill?.isActive !== false,
                isCustom: Boolean(skill?.isCustom),
                creatorName: String(
                  skill?.creatorName
                  || (skill?.isCustom
                    ? currentUserName || currentUserEmail || "You"
                    : "Computer Agents")
                ).trim(),
                creatorAvatarUrl: String(
                  skill?.creatorAvatarUrl
                  || (skill?.isCustom
                    ? currentUserAvatarUrl
                    : COMPUTER_AGENTS_CREATOR_PROFILE_URL)
                  || ""
                ).trim(),
                updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
                updatedLabel: formatRelativeThreadTime(skill?.updatedAt || skill?.createdAt) || (skill?.isCustom ? "Recently" : "System"),
              };
            });
  
            return React.createElement("section", {
                className: "playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page playground-skills-overview-page is-develop-configure-page",
              },
              skillsTopNavActions,
              React.createElement(SkillsOverviewPage, {
                rows,
                mode: skillListMode,
                onModeChange: handleSkillListModeChange,
                period: skillsOverviewChartTimescale,
                onPeriodChange: setSkillsOverviewChartTimescale,
                controlsPortalId: "playground-tools-overview-controls",
                loading: skillsLoading && !skillsLoaded,
                mutating: skillSaveState.isSaving,
                onOpen: (skill) => handleSkillSelect(skill.id),
                onCreate: () => void createAndOpenCustomSkill(),
                onEdit: openSkillEditDialog,
                onRename: openSkillRenameDialog,
                onDelete: (skillsToDelete) => {
                  const [skill] = skillsToDelete;
                  if (skill) void handleDeleteSelectedSkill(skill);
                },
              })
            );
          }
  
          return React.createElement(React.Fragment, null,
            toolbarPopover
              ? React.createElement(PlatformPopupDismissLayer, {
                  className: "playground-files-search-backdrop",
                  onClick: () => setToolbarPopover(""),
                })
              : null,
            skillsPageMode === "detail"
              ? React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page" },
                  renderCurrentSkillDetail()
                )
              : renderSkillsOverviewPage(),
            renderSkillListActionMenu(),
            renderSkillRenameModal(),
            renderSkillEditModal(),
            renderSkillEnvironmentFilePicker()
          );
        }
  
