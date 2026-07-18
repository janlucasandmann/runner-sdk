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
  
          function renderCurrentSkillDetail() {
            const skillsSearchAction = React.createElement("div", {
                className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-environments-search-shell",
              },
              React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain" + (toolbarPopover === "search" ? " is-active" : ""),
                onClick: () => toggleToolbarPopover("search"),
                title: skillListMode === "custom" ? "Search custom skills" : skillListMode === "system" ? "Search system skills" : "Search skills",
                "aria-label": skillListMode === "custom" ? "Search custom skills" : skillListMode === "system" ? "Search system skills" : "Search skills",
              }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
              toolbarPopover === "search"
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                    React.createElement("div", { className: "playground-tasks-project-search-header" },
                      React.createElement("div", { className: "playground-tasks-project-search-title" }, skillListMode === "custom" ? "Search Custom Skills" : skillListMode === "system" ? "Search System Skills" : "Search Skills"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-project-search-close",
                        onClick: () => setToolbarPopover(""),
                      }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                    ),
                    React.createElement("div", { className: "playground-tasks-project-search-body" },
                      React.createElement("div", { className: "playground-files-search-field" },
                        React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                        React.createElement("input", {
                          ref: searchPopupInputRef,
                          type: "text",
                          className: "playground-files-search-field-input",
                          placeholder: skillListMode === "custom"
                            ? "Search custom skills by name or description..."
                            : skillListMode === "system"
                              ? "Search system skills by name or description..."
                              : "Search skills by name or description...",
                          value: searchPopupQuery,
                          onChange: (event) => setSearchPopupQuery(event.target.value),
                        })
                      ),
                      searchPopupQuery.trim()
                        ? searchResults.length > 0
                          ? React.createElement("div", { className: "playground-files-search-results" },
                              searchResults.map((skill) =>
                                React.createElement("button", {
                                    key: skill.id,
                                    type: "button",
                                    className: "playground-files-search-result",
                                    onClick: () => handleSkillSelect(skill.id),
                                  },
                                    renderSkillIcon(skill, "playground-files-entry-icon"),
                                    React.createElement("div", { className: "playground-files-search-result-copy" },
                                      React.createElement("div", { className: "playground-files-search-result-name" }, skill.name || skill.id),
                                      React.createElement("div", { className: "playground-files-search-result-path" }, skill.description || skill.id)
                                    )
                                  )
                              )
                            )
                          : React.createElement("div", { className: "playground-files-search-empty" }, skillListMode === "custom" ? "No matching custom skills found." : skillListMode === "system" ? "No matching system skills found." : "No matching skills found.")
                        : React.createElement("div", { className: "playground-tasks-project-search-hint" }, skillListMode === "custom" ? "Type a custom skill name or description to search." : skillListMode === "system" ? "Type a system skill name or description to search." : "Type a skill name or description to search.")
                    )
                  )
                : null
            );
            const skillsCreateAction = React.createElement("button", {
              type: "button",
              className: "playground-top-nav-private-chat-button playground-skills-top-nav-action-button",
              onClick: openSkillComposer,
              title: "Create custom skill",
              "aria-label": "Create custom skill",
              disabled: skillComposerSaveState.isSaving || !baseSkillProjectId,
            },
              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Skill")
            );
            const skillDetailTopNavAction = !selectedSkill || !selectedSkill.isCustom
              ? null
              : React.createElement("button", {
                  type: "button",
                  className: "playground-top-nav-private-chat-button playground-skills-top-nav-action-button",
                  onClick: () => openSkillEditDialog(selectedSkill),
                  title: "Edit skill",
                  "aria-label": "Edit skill",
                  disabled: skillSaveState.isSaving,
                },
                  React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Edit")
                );
            const skillsTopNavActions = topNavActionsContainer
              ? createPortal(React.createElement(React.Fragment, null,
                  skillsPageMode === "detail" ? skillDetailTopNavAction : null,
                  skillsCreateAction
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
            const selectedSkillToggleId = normalizePlaygroundEnabledSkillIds([selectedSkill.systemFamilyId || selectedSkill.id])[0] || selectedSkillFamilyId;
            const normalizedEnabledSkillIds = normalizePlaygroundEnabledSkillIds(enabledSkillIds);
            const isSelectedSkillEnabled = selectedSkillToggleId
              ? normalizedEnabledSkillIds.includes(selectedSkillToggleId)
              : Boolean(selectedSkill.isActive);
            function handleToggleSelectedSkillEnabled() {
              if (!selectedSkillToggleId || typeof onSkillsChange !== "function") {
                return;
              }
              const currentEnabledSkillIds = normalizePlaygroundEnabledSkillIds(enabledSkillIds);
              const nextEnabledSkillIds = currentEnabledSkillIds.includes(selectedSkillToggleId)
                ? currentEnabledSkillIds.filter((skillId) => skillId !== selectedSkillToggleId)
                : [...currentEnabledSkillIds, selectedSkillToggleId];
              onSkillsChange(nextEnabledSkillIds);
            }
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
  
            function renderSkillCodeFileRow(codeFile) {
              const isActive = activeSkillCodeFile?.id === codeFile.id;
              return React.createElement("button", {
                  key: codeFile.id,
                  type: "button",
                  className: "playground-servers-code-file-row" + (isActive ? " is-active" : ""),
                  onClick: () => selectSkillCodeFile(codeFile.id),
                },
                React.createElement("span", { className: "playground-servers-code-file-chevron", "aria-hidden": "true" }),
                React.createElement("span", { className: "playground-servers-code-file-icon", "aria-hidden": "true" },
                  React.createElement(PlaygroundFileIcon, { entry: { name: codeFile.name, path: codeFile.name, isFolder: false }, className: "playground-skills-code-file-icon" })
                ),
                React.createElement("span", { className: "playground-servers-code-file-name" }, codeFile.name || "Untitled")
              );
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
  
            const skillSourceFilesSection = React.createElement("div", {
                className: "playground-servers-code-workspace playground-skills-code-workspace" + (isSkillCodeDragging ? " is-dragging" : ""),
                onDragOver: (event) => {
                  event.preventDefault();
                  if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) {
                    return;
                  }
                  setIsSkillCodeDragging(true);
                },
                onDragLeave: (event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) {
                    return;
                  }
                  setIsSkillCodeDragging(false);
                },
                onDrop: (event) => void handleSkillCodeFileDrop(event),
              },
              isSelectedSkillCodeFilesEditable
                ? React.createElement("input", {
                    ref: skillCodeFileInputRef,
                    type: "file",
                    multiple: true,
                    hidden: true,
                    onChange: (event) => void handleSkillCodeFileInputChange(event),
                  })
                : null,
              React.createElement("aside", { className: "playground-servers-code-sidebar" },
                React.createElement("div", { className: "playground-servers-code-sidebar-header" },
                  React.createElement("div", { className: "playground-servers-code-sidebar-title" }, "Files"),
                  isSelectedSkillCodeFilesEditable
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-servers-code-add-file-button",
                        onClick: openSkillCodeFilePicker,
                        disabled: skillCodeFilesTransferState.isProcessing,
                      },
                        React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Add File")
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-servers-code-file-list" },
                  selectedSkillCodeFiles.length > 0
                    ? selectedSkillCodeFiles.map((codeFile) => renderSkillCodeFileRow(codeFile))
                    : React.createElement("div", { className: "playground-servers-code-empty" },
                        isSelectedSkillCodeFilesEditable ? "No source files yet." : "No source files."
                      )
                )
              ),
              React.createElement("section", { className: "playground-servers-code-editor-main" },
                React.createElement("div", { className: "playground-servers-code-editor-body" }, renderSkillCodeEditorBody()),
                React.createElement("div", { className: "playground-servers-code-editor-statusbar" },
                  React.createElement("div", {
                      className: "playground-servers-source-preview-status" + ((skillCodeEditorState.error || skillCodeFilesTransferState.error) ? " is-error" : ""),
                    },
                    skillCodeEditorState.error
                      || skillCodeFilesTransferState.error
                      || (skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing
                        ? "Saving..."
                        : skillCodeEditorState.message
                          ? skillCodeEditorState.message
                          : activeSkillCodeFile
                            ? (isSelectedSkillCodeFilesEditable
                              ? (skillCodeEditorIsDirty ? "Unsaved changes" : formatPlaygroundCodeEditorLanguageLabel(activeSkillCodeFileEntry))
                              : "Read-only")
                            : "")
                  ),
                  isSelectedSkillCodeFilesEditable
                    ? React.createElement("div", { className: "playground-servers-code-editor-status-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: handleSkillCodeEditorRevert,
                          disabled: !skillCodeEditorIsDirty || skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing,
                        }, React.createElement("span", null, "Revert")),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-environments-action-button is-primary",
                          onClick: () => void handleSkillCodeEditorSave(),
                          disabled: !skillCodeEditorIsDirty || skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing,
                        },
                          skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing
                            ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                            : React.createElement(HardDrive, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing ? "Saving..." : "Save")
                        )
                      )
                    : null
                )
              )
            );
  
            const skillHeroPreview = React.createElement("section", { className: "playground-plugin-detail-carousel playground-skills-detail-hero-preview" },
              React.createElement("div", { className: "playground-plugin-detail-carousel-copy" },
                React.createElement("span", { className: "playground-plugin-detail-carousel-eyebrow" }, selectedSkill.isCustom ? "Custom Skill" : "System Skill"),
                React.createElement("h3", { className: "playground-plugin-detail-carousel-title" }, selectedSkill.name || "Skill workspace"),
                React.createElement("p", { className: "playground-plugin-detail-carousel-description" },
                  selectedSkill.description || "Use this skill to extend what agents can do during a run."
                )
              )
            );
  
            function renderSkillDefaultOptionsMenu(options, currentId, onSelect) {
              return React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                options.map((option) =>
                  React.createElement("button", {
                      key: option.id,
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (currentId === option.id ? " selected" : ""),
                      onClick: () => onSelect(option.id),
                    },
                    React.createElement("span", { className: "tb-popup-check-slot" },
                      currentId === option.id
                        ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                        : null
                    ),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, option.label || option.id),
                      option.description
                        ? React.createElement("small", null, option.description)
                        : null
                    )
                  )
                )
              );
            }
  
            function renderSkillDefaultSelectRow({ label, value, currentId, triggerRef, popoverRef, isOpen, setOpen, options, onSelect }) {
              return React.createElement("div", { key: label, className: "playground-tasks-detail-fact playground-skills-defaults-row" },
                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                  React.createElement("button", {
                      ref: triggerRef,
                      type: "button",
                      className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger",
                      onClick: () => setOpen((current) => !current),
                    },
                    React.createElement("span", null, value),
                    React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                  ),
                  isOpen
                    ? renderSkillPopoverMenu(
                        triggerRef,
                        popoverRef,
                        renderSkillDefaultOptionsMenu(options, currentId, onSelect)
                      )
                    : null
                )
              );
            }
  
            function renderSkillDefaultModelSettings() {
              if (selectedSkillFamilyId !== "image_generation" && selectedSkillFamilyId !== "video_generation" && selectedSkillFamilyId !== "deep_research" && selectedSkillFamilyId !== "research") {
                return null;
              }
              const deepResearchMeta = getSkillDeepResearchModelMeta(skillDeepResearchDefaultModel);
              const imageModelMeta = getSkillImageGenerationModelMeta(skillImageGenerationDefaultModel);
              const imageQualityMeta = getSkillImageGenerationQualityMeta(skillImageGenerationDefaultQuality);
              const videoModelMeta = getSkillVideoGenerationModelMeta(skillVideoGenerationDefaultModel);
              const rows = [];
              if (selectedSkillFamilyId === "image_generation") {
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Model",
                  value: imageModelMeta?.label || skillImageGenerationDefaultModel,
                  currentId: imageModelMeta?.id || skillImageGenerationDefaultModel,
                  triggerRef: skillImageGenerationModelTriggerRef,
                  popoverRef: skillImageGenerationModelPopoverRef,
                  isOpen: skillImageGenerationModelPopoverOpen,
                  setOpen: setSkillImageGenerationModelPopoverOpen,
                  options: PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS,
                  onSelect: updateSkillImageGenerationDefaultModel,
                }));
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Quality",
                  value: imageQualityMeta?.label || skillImageGenerationDefaultQuality,
                  currentId: imageQualityMeta?.id || skillImageGenerationDefaultQuality,
                  triggerRef: skillImageGenerationQualityTriggerRef,
                  popoverRef: skillImageGenerationQualityPopoverRef,
                  isOpen: skillImageGenerationQualityPopoverOpen,
                  setOpen: setSkillImageGenerationQualityPopoverOpen,
                  options: PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS,
                  onSelect: updateSkillImageGenerationDefaultQuality,
                }));
              } else if (selectedSkillFamilyId === "video_generation") {
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Model",
                  value: videoModelMeta?.label || skillVideoGenerationDefaultModel,
                  currentId: videoModelMeta?.id || skillVideoGenerationDefaultModel,
                  triggerRef: skillVideoGenerationModelTriggerRef,
                  popoverRef: skillVideoGenerationModelPopoverRef,
                  isOpen: skillVideoGenerationModelPopoverOpen,
                  setOpen: setSkillVideoGenerationModelPopoverOpen,
                  options: PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS,
                  onSelect: updateSkillVideoGenerationDefaultModel,
                }));
              } else {
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Model",
                  value: deepResearchMeta?.label || skillDeepResearchDefaultModel,
                  currentId: deepResearchMeta?.id || skillDeepResearchDefaultModel,
                  triggerRef: skillDeepResearchModelTriggerRef,
                  popoverRef: skillDeepResearchModelPopoverRef,
                  isOpen: skillDeepResearchModelPopoverOpen,
                  setOpen: setSkillDeepResearchModelPopoverOpen,
                  options: PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS,
                  onSelect: updateSkillDeepResearchDefaultModel,
                }));
              }
              return React.createElement("section", { className: "playground-tasks-detail-facts playground-environments-editor-facts playground-server-details-card playground-skills-defaults-card" },
                React.createElement("div", { className: "playground-tasks-detail-facts-body playground-skills-defaults-body" },
                  React.createElement("div", { className: "playground-skills-defaults-heading" },
                    React.createElement("div", null,
                      React.createElement("h3", { className: "playground-skills-defaults-title" }, "Default generation settings"),
                      React.createElement("p", { className: "playground-skills-defaults-description" },
                        "Agents use these defaults unless a thread prompt asks for another model or quality."
                      )
                    )
                  ),
                  ...rows
                )
              );
            }
  
  	          const skillDetailTabs = [
  	            { id: "general", label: "General" },
  	            { id: "sourceFiles", label: "Source Files" },
  	          ];
            const skillDetailTabsElement = React.createElement("div", {
                className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-server-detail-tabs playground-skills-detail-tabs",
              },
              React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                skillDetailTabs.map((tab) =>
                  React.createElement("button", {
                    key: tab.id,
                    type: "button",
                    className: "playground-project-overview-chart-tab" + (skillDetailTab === tab.id ? " is-active" : ""),
                    onClick: () => setSkillDetailTab(tab.id),
                  }, tab.label)
                )
              )
            );
  
  	          const generalTabContent = React.createElement(React.Fragment, null,
  	            skillHeroPreview,
  	            renderSkillDefaultModelSettings(),
  	            renderSkillMarkdownSection({
  	              sectionId: "usage",
  	              title: "Usage",
                content: selectedSkillSections.usage,
                emptyLabel: "Add Usage here",
              }),
              renderSkillMarkdownSection({
                sectionId: "process",
                title: "Process",
                content: selectedSkillSections.process,
                emptyLabel: "Add Process here",
              }),
              renderSkillMarkdownSection({
                sectionId: "outputFormat",
                title: "Output",
                content: selectedSkillSections.outputFormat,
                emptyLabel: "Add Output guidance here",
              }),
              renderSkillMarkdownSection({
                sectionId: "configuration",
                title: "Config",
                content: selectedSkillSections.configuration,
                emptyLabel: "Add Config here",
              }),
              renderSkillMarkdownSection({
                sectionId: "examplePrompts",
                title: "Examples",
                content: selectedSkillSections.examplePrompts,
                emptyLabel: "Add Examples here",
  	            })
  	          );
  	          const activeSkillDetailTabContent = skillDetailTab === "sourceFiles"
  	            ? skillSourceFilesSection
  	            : generalTabContent;
  
  	          return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main playground-skills-detail-page" + (skillDetailTab === "sourceFiles" ? " is-source-files-tab" : "") },
  	            skillsTopNavActions,
  	            React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
  	              React.createElement("div", { className: "playground-skills-detail-content" },
  	                React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header playground-develop-server-kind-header playground-plugin-detail-title-row" },
  	                  React.createElement("div", { className: "playground-plugin-detail-title-main" },
  	                    React.createElement("div", { className: "playground-plugin-detail-header-icon-shell playground-skills-detail-header-icon-shell" },
  	                      renderSkillIcon(selectedSkill, "playground-skills-detail-header-icon")
  	                    ),
  	                    React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title playground-plugin-detail-title" }, selectedSkill.name || selectedSkill.id || "Untitled skill")
  	                  ),
  	                  React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
  	                    React.createElement(PlatformSecondaryButton, {
  	                      type: "button",
  	                      className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-develop-server-metrics-add-button playground-plugin-detail-connect-button playground-skills-detail-enable-button" + (isSelectedSkillEnabled ? " is-destructive" : ""),
  	                      onClick: handleToggleSelectedSkillEnabled,
  	                      disabled: !selectedSkillToggleId || typeof onSkillsChange !== "function",
  	                    }, isSelectedSkillEnabled ? "Disable" : "Enable")
  	                  )
  	                ),
                  skillsError && skillListMode === "custom"
                    ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, skillsError)
                    : null,
                  skillSaveState.error
                    ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, skillSaveState.error)
                    : null,
                  skillDetailTabsElement,
                  activeSkillDetailTabContent
                )
              ),
            );
          }
  
          function renderSkillsOverviewPage() {
            const rows = displaySkills.map((skill) => {
              const updatedAt = Date.parse(String(skill?.updatedAt || skill?.createdAt || ""));
              return {
                ...skill,
                id: String(skill?.id || ""),
                name: String(skill?.name || skill?.id || "Skill"),
                searchText: [skill?.name, skill?.description, skill?.id].filter(Boolean).join(" "),
                icon: renderSkillIcon(skill, "playground-environments-list-item-icon"),
                isActive: skill?.isActive !== false,
                isCustom: Boolean(skill?.isCustom),
                updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
                updatedLabel: formatRelativeThreadTime(skill?.updatedAt || skill?.createdAt) || (skill?.isCustom ? "Recently" : "System"),
              };
            });
  
            return React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page" },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                React.createElement(SkillsOverviewPage, {
                  rows,
                  mode: skillListMode,
                  onModeChange: handleSkillListModeChange,
                  period: skillsOverviewChartTimescale,
                  onPeriodChange: setSkillsOverviewChartTimescale,
                  controlsPortalId: "playground-tools-overview-controls",
                  loading: skillsLoading && !skillsLoaded,
                  mutating: skillSaveState.isSaving || skillComposerSaveState.isSaving,
                  onOpen: (skill) => handleSkillSelect(skill.id),
                  onCreate: openSkillComposer,
                  onEdit: openSkillEditDialog,
                  onRename: openSkillRenameDialog,
                  onDelete: (skillsToDelete) => {
                    const [skill] = skillsToDelete;
                    if (skill) void handleDeleteSelectedSkill(skill);
                  },
                })
              )
            );
          }
  
          function renderSkillComposerDialog() {
            if (!skillComposerOpen) {
              return null;
            }
  
            const selectedSkillComposerIcon = getPlaygroundSkillIconConfig(skillComposerDraft.icon);
            const SelectedSkillComposerIcon = selectedSkillComposerIcon.icon;
            const composerCodeFiles = normalizeSkillCodeFiles(skillComposerDraft.codeFiles);
  
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop",
                onClick: () => {
                  if (!skillComposerSaveState.isSaving) {
                    closeSkillComposer();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                    as: "form",
                    className: "playground-tasks-project-modal playground-skill-composer-modal",
                    onClick: (event) => event.stopPropagation(),
                    onKeyDown: handleComposerSubmitShortcut,
                    onSubmit: (event) => void handleSkillComposerSubmit(event),
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-project-modal-icon-trigger" + (skillComposerIconPickerOpen ? " is-active" : ""),
                        onClick: (event) => {
                          event.preventDefault();
                          setSkillComposerIconPickerOpen((current) => !current);
                        },
                        title: "Choose skill icon",
                      },
                        React.createElement(SelectedSkillComposerIcon, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("input", {
                        className: "playground-tasks-project-modal-name-input",
                        value: skillComposerDraft.name,
                        onChange: (event) => updateSkillComposerField("name", event.target.value),
                        placeholder: "Skill name",
                        autoFocus: true,
                        disabled: skillComposerSaveState.isSaving,
                      }),
                      skillComposerIconPickerOpen
                        ? React.createElement("div", { className: "playground-tasks-project-icon-picker" },
                            PLAYGROUND_SKILL_ICON_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              const isActive = getPlaygroundSkillIconId(skillComposerDraft.icon) === option.id;
                              return React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "playground-tasks-project-icon-option" + (isActive ? " is-active" : ""),
                                title: option.label,
                                onClick: (event) => {
                                  event.preventDefault();
                                  updateSkillComposerField("icon", option.id);
                                  setSkillComposerIconPickerOpen(false);
                                },
                              },
                                React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.9 })
                              );
                            })
                          )
                        : null
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: closeSkillComposer,
                      title: "Close",
                      disabled: skillComposerSaveState.isSaving,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-skill-composer-modal-body" },
                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
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
                              disabled: skillComposerSaveState.isSaving,
                              onMouseDown: (event) => event.preventDefault(),
                              onClick: () => handleSkillComposerDescriptionFormat(action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isSkillComposerDescriptionEditing ? " is-editing" : " is-preview") },
                        !isSkillComposerDescriptionEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              String(skillComposerDraft.description || "").trim()
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: skillComposerDraft.description,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, "Add a short description for this custom skill.")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: skillComposerDescriptionTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isSkillComposerDescriptionEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isSkillComposerDescriptionEditing ? "Add a short description for this custom skill." : "",
                          value: skillComposerDraft.description,
                          disabled: skillComposerSaveState.isSaving,
                          onFocus: () => setIsSkillComposerDescriptionEditing(true),
                          onChange: (event) => {
                            updateSkillComposerField("description", event.target.value);
                            resizeSkillTextarea(event.currentTarget);
                          },
                          onBlur: () => setIsSkillComposerDescriptionEditing(false),
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-attachments" },
                      React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Code Files"),
                        React.createElement("div", { className: "playground-tasks-attachments-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                            onClick: openSkillComposerEnvironmentFilePicker,
                            disabled: skillCodeFilesTransferState.isProcessing || availableSkillEnvironments.length === 0,
                            title: availableSkillEnvironments.length > 0
                              ? "Add files from " + (selectedSkillEnvironment?.name || "an environment")
                              : "No environments available",
  	                        }, "From Environment")
                        )
                      ),
                      React.createElement("input", {
                        ref: skillComposerCodeFileInputRef,
                        type: "file",
                        multiple: true,
                        hidden: true,
                        onChange: (event) => void handleSkillComposerCodeFileInputChange(event),
                      }),
                      React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                        React.createElement("div", {
                          className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isSkillComposerCodeDragging ? " dragging" : "") + (composerCodeFiles.length > 0 ? " is-filled" : ""),
                          onDragOver: (event) => {
                            event.preventDefault();
                            if (skillCodeFilesTransferState.isProcessing) {
                              return;
                            }
                            setIsSkillComposerCodeDragging(true);
                          },
                          onDragLeave: (event) => {
                            if (event.currentTarget.contains(event.relatedTarget)) {
                              return;
                            }
                            setIsSkillComposerCodeDragging(false);
                          },
                          onDrop: (event) => void handleSkillComposerCodeFileDrop(event),
                        },
                          composerCodeFiles.length > 0
                            ? React.createElement(React.Fragment, null,
                                React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                  React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                  React.createElement("span", null, isSkillComposerCodeDragging ? "Drop files here" : "Drop files to attach, or"),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-tasks-attachments-browse",
                                    disabled: skillCodeFilesTransferState.isProcessing,
                                    onClick: () => skillComposerCodeFileInputRef.current?.click?.(),
                                  }, "browse.")
                                ),
                                React.createElement("div", { className: "runner-attachments" },
                                  composerCodeFiles.map((codeFile) => renderSkillCodeFileChip(codeFile, {
                                    removable: true,
                                    onRemove: handleRemoveSkillComposerCodeFile,
                                  }))
                                )
                              )
                            : React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-attachments-empty-button",
                                disabled: skillCodeFilesTransferState.isProcessing,
                                onClick: () => skillComposerCodeFileInputRef.current?.click?.(),
                              },
                                React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                React.createElement("span", { className: "tb-popup-dropzone-title" }, isSkillComposerCodeDragging ? "Drop files here" : "Drag & drop files here"),
                                React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                              )
                        )
                      ),
                      skillCodeFilesTransferState.isProcessing
                        ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Adding code files...")
                        : null,
                      skillCodeFilesTransferState.error
                        ? React.createElement("div", { className: "playground-environments-error" }, skillCodeFilesTransferState.error)
                        : null
                    )
                  ),
                  skillComposerSaveState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, skillComposerSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: closeSkillComposer,
                      disabled: skillComposerSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: skillComposerSaveState.isSaving || !String(skillComposerDraft.name || "").trim() || !baseSkillProjectId,
                    }, skillComposerSaveState.isSaving ? "Creating..." : "Create Skill")
                  )
                )
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
            renderSkillEnvironmentFilePicker(),
            renderSkillComposerDialog()
          );
        }
  
