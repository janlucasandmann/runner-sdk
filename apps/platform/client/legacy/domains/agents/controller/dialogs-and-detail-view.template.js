          function renderAgentRenameModal() {
            if (!agentRenameState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!saveState.isSaving) {
                    closeAgentRenameDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleAgentRenameSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename " + (draftAgent?.agentType === "team" ? "Squad" : "Agent")),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this " + (draftAgent?.agentType === "team" ? "squad." : "agent.")),
                  React.createElement("input", {
                    ref: agentRenameInputRef,
                    className: "sidebar-thread-rename-input",
                    value: agentRenameValue,
                    onChange: (event) => setAgentRenameValue(event.target.value),
                    placeholder: draftAgent?.agentType === "team" ? "Squad name" : "Agent name",
                    disabled: saveState.isSaving,
                  }),
                  agentRenameError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, agentRenameError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeAgentRenameDialog,
                      disabled: saveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: saveState.isSaving,
                    }, saveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
          function renderAgentListActionMenu() {
            if (!agentListActionMenuState || !agentListActionTarget) {
              return null;
            }
  
            const isDeleting = saveState.isSaving && agentListActionTarget.id === selectedAgentId;
            const targetIsTeam = agentListActionTarget.agentType === "team" || isPlaygroundTeamAgent(agentListActionTarget);
            const isProtected = Boolean(agentListActionTarget.isDefault || agentListActionTarget.isSystem);
            const menuStyle = {
              position: "fixed",
              top: agentListActionMenuState.top + "px",
            };
            if (Number.isFinite(agentListActionMenuState.right)) {
              menuStyle.right = agentListActionMenuState.right + "px";
              menuStyle.left = "auto";
            } else {
              menuStyle.left = agentListActionMenuState.left + "px";
              menuStyle.right = "auto";
            }
  
            const menuElement = React.createElement(PlatformPopupDismissLayer, {
                className: "sidebar-thread-popup-scrim",
                style: { zIndex: 360 },
                onClick: closeAgentListActionMenu,
              },
                React.createElement("div", {
                  className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
                  style: menuStyle,
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement(PlatformPopupSurface, {
                    className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu" + (agentListActionMenuClosing ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in"),
                    role: "menu",
                  },
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeAgentListActionMenu();
                        openAgentRenameDialog(agentListActionTarget);
                      },
                      disabled: isProtected || saveState.isSaving,
                    },
                      React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Rename")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeAgentListActionMenu({ animate: false });
                        openAgentSendToTeamModal(agentListActionTarget);
                      },
                      disabled: saveState.isSaving || !agentListActionTarget?.id || agentListActionTarget.id === PLAYGROUND_AGENT_DRAFT_ID,
                    },
                      React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Share with Team")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeAgentListActionMenu({ animate: false });
                        openAgentAddToSquadModal(agentListActionTarget);
                      },
                      disabled: saveState.isSaving || targetIsTeam || !agentListActionTarget?.id || agentListActionTarget.id === PLAYGROUND_AGENT_DRAFT_ID,
                    },
                      React.createElement(Layers, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Add to Agent Squad")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeAgentListActionMenu();
                        openAgentCopyModal(agentListActionTarget);
                      },
                      disabled: saveState.isSaving,
                    },
                      React.createElement(Copy, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Copy")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row is-danger",
                      onClick: () => {
                        closeAgentListActionMenu();
                        void handleDeleteAgent(agentListActionTarget.id);
                      },
                      disabled: isProtected || isDeleting || saveState.isSaving,
                    },
                      React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, isDeleting ? "Deleting..." : "Delete")
                      )
                    )
                  )
                )
              );
            return typeof createPortal === "function" && typeof document !== "undefined" && document.body
              ? createPortal(menuElement, document.body)
              : menuElement;
          }
  
          function renderAgentBulkActionMenu() {
            if (!agentBulkActionMenuState) {
              return null;
            }
            const bulkAgents = getAgentActionTargetsByIds(agentBulkActionMenuState.agentIds);
            if (bulkAgents.length < 2) {
              return null;
            }
            const bulkAgentIds = bulkAgents.map((agent) => agent.id);
            const singleAgentTargets = bulkAgents.filter((agent) => !isPlaygroundTeamAgent(agent));
            const deletableTargets = bulkAgents.filter((agent) => !agent?.isDefault && !agent?.isSystem);
            const menuStyle = {
              position: "fixed",
              top: agentBulkActionMenuState.top + "px",
              left: agentBulkActionMenuState.left + "px",
              right: "auto",
            };
  
            const menuElement = React.createElement(PlatformPopupDismissLayer, {
                className: "sidebar-thread-popup-scrim",
                style: { zIndex: 360 },
                onClick: closeAgentBulkActionMenu,
              },
                React.createElement("div", {
                  className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
                  style: menuStyle,
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement(PlatformPopupSurface, {
                    className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu" + (agentBulkActionMenuClosing ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in"),
                    role: "menu",
                  },
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeAgentBulkActionMenu({ animate: false });
                        openAgentSendToTeamModal(null, { agentIds: bulkAgentIds });
                      },
                      disabled: saveState.isSaving,
                    },
                      React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Share with Team")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeAgentBulkActionMenu({ animate: false });
                        openAgentAddToSquadModal(null, { agentIds: singleAgentTargets.map((agent) => agent.id) });
                      },
                      disabled: saveState.isSaving || singleAgentTargets.length === 0,
                    },
                      React.createElement(Layers, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Add to Agent Squad")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row is-danger",
                      onClick: () => {
                        closeAgentBulkActionMenu({ animate: false });
                        void handleDeleteAgents(deletableTargets);
                      },
                      disabled: saveState.isSaving || deletableTargets.length === 0,
                    },
                      React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Delete")
                      )
                    )
                  )
                )
              );
            return typeof createPortal === "function" && typeof document !== "undefined" && document.body
              ? createPortal(menuElement, document.body)
              : menuElement;
          }
  
          function renderAgentComposerDialog() {
            if (!agentComposerOpen) {
              return null;
            }
  
            const composerDraft = agentComposerDraft || buildPlaygroundDefaultAgentDraft(agentListMode === "teams" ? "team" : "single");
            const isTeamComposer = composerDraft.agentType === "team";
            const selectedComposerModel = getPlaygroundAgentModelMeta((composerDraft.model || "claude-haiku-4-5"), resolvedAgentModelOptions);
            const composerEnabledSkills = Array.isArray(composerDraft.enabledSkills)
              ? composerDraft.enabledSkills.map((value) => String(value || "").trim()).filter(Boolean)
              : [];
            const composerHasDeepResearchSkill = !isTeamComposer && composerEnabledSkills.includes("deep_research");
            const selectedComposerDeepResearchModel = getPlaygroundDeepResearchModelMeta(composerDraft.deepResearchModel);
            const composerReasoningOptions = ["minimal", "low", "medium", "high"].map((value) => ({
              id: value,
              label: value.replace(/^./, (letter) => letter.toUpperCase()),
            }));
            const selectedComposerReasoningOption = composerReasoningOptions.find((option) => option.id === (composerDraft.reasoningEffort || "medium")) || composerReasoningOptions[2];
            const composerSelectedSubagentIds = dedupePlaygroundAgentIds(composerDraft.teamSubagentIds).filter((value) => value !== String(composerDraft.teamOrchestratorAgentId || "").trim());
            const hasRequiredTeamSelection = !isTeamComposer || (String(composerDraft.teamOrchestratorAgentId || "").trim() && composerSelectedSubagentIds.length > 0);
            const renderAgentComposerPopoverMenu = (anchorRef, content) => {
              if (!content) {
                return null;
              }
              if (typeof document === "undefined" || !document.body) {
                return content;
              }
              const anchorElement = anchorRef?.current;
              if (!anchorElement || typeof anchorElement.getBoundingClientRect !== "function") {
                return content;
              }
              const rect = anchorElement.getBoundingClientRect();
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
              const menuWidth = Math.min(320, Math.max(220, rect.width || 280));
              const left = Math.max(20, Math.min(viewportWidth - menuWidth - 20, rect.right - menuWidth));
              const top = rect.bottom + 8;
              return createPortal(
                React.createElement("div", {
                    ref: agentComposerModelPopoverRef,
                    className: "playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal",
                    style: { top: top + "px", left: left + "px" },
                  },
                  content
                ),
                document.body
              );
            };
  
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop",
                onClick: () => {
                  if (!agentComposerSaveState.isSaving) {
                    closeAgentComposer();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                    as: "form",
                    className: "playground-tasks-project-modal playground-agent-composer-modal",
                    onClick: (event) => event.stopPropagation(),
                    onKeyDown: handleComposerSubmitShortcut,
                    onSubmit: (event) => void handleAgentComposerSubmit(event),
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("div", {
                        className: "playground-tasks-project-modal-icon-trigger",
                        "aria-hidden": "true",
                      }, isTeamComposer
                        ? React.createElement(Layers, { width: 18, height: 18, strokeWidth: 1.9 })
                        : React.createElement(Bot, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("input", {
                        className: "playground-tasks-project-modal-name-input",
                        value: composerDraft.name,
                        onChange: (event) => updateAgentComposerField("name", event.target.value),
                        placeholder: isTeamComposer ? "Squad name" : "Agent name",
                        autoFocus: true,
                        disabled: agentComposerSaveState.isSaving,
                      })
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: closeAgentComposer,
                      title: "Close",
                      disabled: agentComposerSaveState.isSaving,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-agent-composer-modal-body" },
                    isTeamComposer
                      ? React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Squad Setup"),
                          React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Orchestrator"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("select", {
                                  className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                  value: composerDraft.teamOrchestratorAgentId || "",
                                  onChange: (event) => updateAgentComposerTeamOrchestrator(event.target.value),
                                  disabled: agentComposerSaveState.isSaving || availableTeamMemberAgents.length === 0,
                                },
                                  React.createElement("option", { value: "" }, "Select orchestrator"),
                                  availableTeamMemberAgents.map((agent) =>
                                    React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.id)
                                  )
                                )
                              )
                            )
                          ),
                          availableTeamMemberAgents.filter((agent) => agent.id !== composerDraft.teamOrchestratorAgentId).length > 0
                            ? React.createElement("div", { className: "playground-agents-team-grid" },
                                availableTeamMemberAgents
                                  .filter((agent) => agent.id !== composerDraft.teamOrchestratorAgentId)
                                  .map((agent) => {
                                    const isSelected = composerSelectedSubagentIds.includes(agent.id);
                                    return React.createElement("button", {
                                        key: agent.id,
                                        type: "button",
                                        className: "playground-agents-team-card" + (isSelected ? " is-selected" : ""),
                                        onClick: () => toggleAgentComposerTeamSubagent(agent.id),
                                        disabled: agentComposerSaveState.isSaving,
                                      },
                                        React.createElement("div", { className: "playground-agents-team-card-header" },
                                          React.createElement("div", { className: "playground-agents-team-card-title" }, agent.name || agent.id),
                                          isSelected
                                            ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 2 })
                                            : null
                                        ),
                                        React.createElement("div", { className: "playground-agents-team-card-copy" }, agent.description || agent.id)
                                      );
                                  })
                              )
                            : React.createElement("div", { className: "playground-environments-muted" }, "Create a few single agents first, then assemble them into a team here."),
                          composerSelectedSubagentIds.length > 0
                            ? React.createElement("div", { className: "playground-agents-team-selected-list" },
                                composerSelectedSubagentIds.map((agentId) =>
                                  React.createElement("span", { key: agentId, className: "playground-agents-team-selected-pill" }, availableTeamMemberAgentsById[agentId]?.name || agentId)
                                )
                              )
                            : null
                        )
                      : React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Model Configuration"),
                          React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Model"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                renderPlaygroundAgentModelButton(
                                  selectedComposerModel,
                                  () => openAgentModelPicker("composer"),
                                  agentComposerSaveState.isSaving
                                )
                              )
                            ),
                            composerHasDeepResearchSkill
                              ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Deep Research Model"),
                                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                    React.createElement("div", {
                                        className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell" + (agentComposerModelPopover === "deep-research" ? " is-open" : ""),
                                      },
                                      React.createElement("button", {
                                        ref: agentComposerDeepResearchModelTriggerRef,
                                        type: "button",
                                        className: "playground-environments-runtime-value-button playground-tasks-detail-select-trigger" + (agentComposerModelPopover === "deep-research" ? " is-active" : ""),
                                        onClick: () => setAgentComposerModelPopover((current) => current === "deep-research" ? "" : "deep-research"),
                                        disabled: agentComposerSaveState.isSaving,
                                      },
                                        React.createElement("span", { className: "playground-environments-runtime-value-label" }, selectedComposerDeepResearchModel?.label || "Gemini 3.1 Flash"),
                                        React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", width: 14, height: 14, strokeWidth: 1.8 })
                                      ),
                                      agentComposerModelPopover === "deep-research"
                                        ? renderAgentComposerPopoverMenu(agentComposerDeepResearchModelTriggerRef, React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                            PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.map((option) =>
                                              React.createElement("button", {
                                                  key: option.id,
                                                  type: "button",
                                                  className: "tb-popup-row tb-popup-row-select" + ((composerDraft.deepResearchModel || "") === option.id ? " selected" : ""),
                                                  onClick: () => {
                                                    updateAgentComposerField("deepResearchModel", option.id);
                                                    setAgentComposerModelPopover("");
                                                  },
                                                },
                                                React.createElement("span", null, option.label)
                                              )
                                            )
                                          ))
                                        : null
                                    )
                                  )
                                )
                              : null,
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Reasoning Effort"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", {
                                    className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell" + (agentComposerModelPopover === "reasoning" ? " is-open" : ""),
                                  },
                                  React.createElement("button", {
                                    ref: agentComposerReasoningTriggerRef,
                                    type: "button",
                                    className: "playground-environments-runtime-value-button playground-tasks-detail-select-trigger" + (agentComposerModelPopover === "reasoning" ? " is-active" : ""),
                                    onClick: () => setAgentComposerModelPopover((current) => current === "reasoning" ? "" : "reasoning"),
                                    disabled: agentComposerSaveState.isSaving,
                                  },
                                    React.createElement("span", { className: "playground-environments-runtime-value-label" }, selectedComposerReasoningOption.label || "Medium"),
                                    React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", width: 14, height: 14, strokeWidth: 1.8 })
                                  ),
                                  agentComposerModelPopover === "reasoning"
                                    ? renderAgentComposerPopoverMenu(agentComposerReasoningTriggerRef, React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                        composerReasoningOptions.map((option) =>
                                          React.createElement("button", {
                                              key: option.id,
                                              type: "button",
                                              className: "tb-popup-row tb-popup-row-select" + ((composerDraft.reasoningEffort || "medium") === option.id ? " selected" : ""),
                                              onClick: () => {
                                                updateAgentComposerField("reasoningEffort", option.id);
                                                setAgentComposerModelPopover("");
                                              },
                                            },
                                            React.createElement("span", { className: "tb-popup-check-slot" },
                                              (composerDraft.reasoningEffort || "medium") === option.id
                                                ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                                : null
                                            ),
                                            React.createElement("span", null, option.label)
                                          )
                                        )
                                      ))
                                    : null
                                )
                              )
                            )
                          )
                        ),
                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, isTeamComposer ? "Squad Instructions" : "Instructions"),
                        React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                          [
                            { id: "bold", label: "Bold", icon: Bold },
                            { id: "italic", label: "Italic", icon: Italic },
                            { id: "underline", label: "Underline", icon: Underline },
                            { id: "list", label: "List", icon: List },
                          ].map((action) =>
                            React.createElement("button", {
                              key: "instructions-" + action.id,
                              type: "button",
                              className: "playground-tasks-detail-format-button",
                              title: action.label,
                              "aria-label": action.label,
                              disabled: agentComposerSaveState.isSaving,
                              onMouseDown: (event) => event.preventDefault(),
                              onClick: () => handleAgentComposerMarkdownFormat("instructions", agentComposerInstructionsTextareaRef, action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isAgentComposerInstructionsEditing ? " is-editing" : " is-preview") },
                        !isAgentComposerInstructionsEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              String(composerDraft.instructions || "").trim()
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: composerDraft.instructions,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, isTeamComposer ? "Add squad instructions here." : "Add agent instructions here.")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: agentComposerInstructionsTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isAgentComposerInstructionsEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isAgentComposerInstructionsEditing
                            ? (isTeamComposer ? "Add squad instructions here." : "Add agent instructions here.")
                            : "",
                          value: composerDraft.instructions || "",
                          disabled: agentComposerSaveState.isSaving,
                          onFocus: () => setIsAgentComposerInstructionsEditing(true),
                          onChange: (event) => {
                            updateAgentComposerField("instructions", event.target.value);
                            resizeAgentDescriptionTextarea(event.currentTarget);
                          },
                          onBlur: () => setIsAgentComposerInstructionsEditing(false),
                        })
                      )
                    )
                  ),
                  agentComposerSaveState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, agentComposerSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: closeAgentComposer,
                      disabled: agentComposerSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: agentComposerSaveState.isSaving || !String(composerDraft.name || "").trim() || !hasRequiredTeamSelection,
                    }, agentComposerSaveState.isSaving
                      ? (isTeamComposer ? "Creating..." : "Creating...")
                      : (isTeamComposer ? "Create Squad" : "Create Agent"))
                  )
                )
              );
          }

          const agentDetailPerformanceRangeOptions = [
            { id: "day", label: "24H", bucketCount: 1 },
            { id: "week", label: "7D", bucketCount: 7 },
            { id: "month", label: "30D", bucketCount: 30 },
          ];
          const normalizedAgentDetailPerformanceRange = agentDetailPerformanceRangeOptions.some(
            (option) => option.id === agentDetailPerformanceRange
          )
            ? agentDetailPerformanceRange
            : "month";

          function renderEditorSection(sectionId, title, description, content, headerActions, collapsible = true) {
            const isExpanded = collapsible ? expandedSections.has(sectionId) : true;
            return React.createElement("section", { className: "playground-environments-section", key: sectionId, "data-section-id": sectionId },
              React.createElement(collapsible ? "button" : "div", collapsible ? {
                type: "button",
                className: "playground-environments-section-header",
                onClick: () => toggleSection(sectionId),
              } : {
                className: "playground-environments-section-header is-static",
              },
                React.createElement("div", { className: "playground-environments-section-heading" },
                  React.createElement("div", { className: "playground-environments-section-title" }, title),
                  description
                    ? React.createElement("div", { className: "playground-environments-section-copy" }, description)
                    : null
                ),
                React.createElement("div", { className: "playground-environments-section-header-right" },
                  headerActions
                    ? React.createElement("div", {
                        onClick: collapsible ? (event) => event.stopPropagation() : undefined,
                      }, headerActions)
                    : null,
                  collapsible && isExpanded
                    ? React.createElement(ChevronDown, { className: "playground-environments-section-toggle", strokeWidth: 1.8 })
                    : collapsible
                      ? React.createElement(ChevronRight, { className: "playground-environments-section-toggle", strokeWidth: 1.8 })
                      : null
                )
              ),
              isExpanded
                ? React.createElement("div", { className: "playground-environments-section-body" }, content)
                : null
            );
          }
  
          function renderCurrentAgentEditor() {
            if (!draftAgent) {
              return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-environments-empty-state" },
                  React.createElement("div", { className: "playground-environments-empty-title" }, "No agent selected"),
                  React.createElement("div", { className: "playground-environments-empty-copy" }, "Choose an agent from the list or create a new one.")
                )
              );
            }
  
            const agentVersionChangesPage = renderAgentVersionChangesPage();
            if (agentVersionChangesPage) {
              return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main", ref: agentDetailMainRef },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                  React.createElement("div", { className: "playground-agents-detail-content is-agent-overview-general is-agent-version-changes" },
                    agentVersionChangesPage
                  )
                )
              );
            }
  
            const modelMeta = getPlaygroundAgentModelMeta(draftAgent.model, resolvedAgentModelOptions);
            const enabledSkills = Array.isArray(draftAgent.enabledSkills) ? draftAgent.enabledSkills : [];
            const selectedAgentModel = getPlaygroundAgentModelMeta((draftAgent.model || "claude-haiku-4-5"), resolvedAgentModelOptions);
            const isTeamAgent = draftAgent.agentType === "team";
            const isDefaultAgentConfigurationLocked = isPlaygroundDefaultAgentConfigurationLocked(draftAgent);
            const hasDeepResearchSkillEnabled = !isTeamAgent && enabledSkills.includes("deep_research");
            const selectedDeepResearchModel = getPlaygroundDeepResearchModelMeta(draftAgent.deepResearchModel);
            const selectedTeamOrchestrator = draftAgent.teamOrchestratorAgentId
              ? availableTeamMemberAgentsById[draftAgent.teamOrchestratorAgentId] || null
              : null;
            const selectedTeamSubagentIds = dedupePlaygroundAgentIds(draftAgent.teamSubagentIds)
              .filter((value) => value !== String(draftAgent.teamOrchestratorAgentId || "").trim());
            const teamDerivedModelMeta = selectedTeamOrchestrator
              ? getPlaygroundAgentModelMeta(selectedTeamOrchestrator.model, resolvedAgentModelOptions)
              : null;
            const shouldShowAgentAnalytics = Boolean(
              draftAgent.id && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            );
            const activeAgentAnalytics = draftAgent.id ? agentAnalyticsById[draftAgent.id] || null : null;
            const activeAgentAnalyticsSummary = activeAgentAnalytics?.summary || null;
            const activeAgentActivityBuckets = Array.isArray(activeAgentAnalytics?.charts?.activity24h)
              ? activeAgentAnalytics.charts.activity24h
              : [];
            const activeAgentStatusBuckets = Array.isArray(activeAgentAnalytics?.charts?.status24h)
              ? activeAgentAnalytics.charts.status24h
              : [];
            const isAgentAnalyticsLoading = loadingAgentAnalyticsId === draftAgent.id;
            const agentAnalyticsError = draftAgent.id ? agentAnalyticsErrorById[draftAgent.id] || "" : "";
            const analyticsSubjectLabel = isTeamAgent ? "squad" : "agent";
            const buildZeroAgentTelemetryBuckets = (count = 8) => {
              const anchor = new Date();
              anchor.setMinutes(0, 0, 0);
              return Array.from({ length: count }, (_, index) => {
                const date = new Date(anchor);
                date.setHours(anchor.getHours() - (count - 1 - index));
                return {
                  bucketStart: date.toISOString(),
                  label: String(date.getHours()).padStart(2, "0") + ":00",
                  total: 0,
                  completed: 0,
                  failed: 0,
                  cancelled: 0,
                  successRate: 0,
                  p95RuntimeMs: 0,
                };
              });
            };
            const buildAgentAnalyticsSvgLinePath = (points) => {
              if (!Array.isArray(points) || points.length === 0) {
                return "";
              }
              return points.map((point, index) => (index === 0 ? "M " : "L ") + point.x.toFixed(2) + " " + point.y.toFixed(2)).join(" ");
            };
            const resolvedAgentActivityBuckets = activeAgentActivityBuckets.length > 0
              ? activeAgentActivityBuckets
              : buildZeroAgentTelemetryBuckets(8);
            const resolvedAgentStatusBuckets = activeAgentStatusBuckets.length > 0
              ? activeAgentStatusBuckets
              : buildZeroAgentTelemetryBuckets(8);
            const agentActivityLabels = resolvedAgentActivityBuckets.map((bucket) => bucket?.label || "");
            const agentActivityCounts = resolvedAgentActivityBuckets.map((bucket) => Number(bucket?.total || 0));
            const agentActivityErrors = resolvedAgentActivityBuckets.map((bucket) => Number(bucket?.failed || 0) + Number(bucket?.cancelled || 0));
            const agentStatusSuccess = resolvedAgentStatusBuckets.map((bucket) => Number(bucket?.successRate || 0));
            const agentStatusRuntime = resolvedAgentStatusBuckets.map((bucket) => Number(bucket?.p95RuntimeMs || 0));
            const resolvedAgentAnalyticsSummary = activeAgentAnalyticsSummary || {
              totalRuns24h: 0,
              successRate24h: 0,
              failedRuns24h: 0,
              cancelledRuns24h: 0,
              p95RuntimeMs: 0,
            };
            const readAgentDetailThreadCreatedAtMs = (thread) => {
              const timestamp = Date.parse(String(thread?.createdAt || thread?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : null;
            };
            const readAgentDetailThreadAgentId = (thread) => String(
              thread?.agentId
              || thread?.agent_id
              || thread?.agent?.id
              || thread?.metadata?.agentId
              || thread?.metadata?.agent_id
              || thread?.metadata?.runnerPlayground?.agentId
              || thread?.metadata?.runnerPlayground?.agent_id
              || thread?.metadata?.runnerPlayground?.taskPreview?.agentId
              || thread?.metadata?.runnerPlayground?.taskPreview?.agent_id
              || thread?.metadata?.runner_playground?.agentId
              || thread?.metadata?.runner_playground?.agent_id
              || thread?.metadata?.runner_playground?.taskPreview?.agentId
              || thread?.metadata?.runner_playground?.taskPreview?.agent_id
              || ""
            ).trim();
            const readAgentDetailThreadTotalCT = (thread) => Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
            const readAgentDetailThreadUsageTokens = (thread) => {
              const totalTokens = Number(thread?.totalTokens ?? thread?.total_tokens);
              if (Number.isFinite(totalTokens) && totalTokens > 0) {
                return Math.round(totalTokens);
              }
              const inputTokens = Math.max(0, Number(thread?.inputTokens ?? thread?.input_tokens) || 0);
              const outputTokens = Math.max(0, Number(thread?.outputTokens ?? thread?.output_tokens) || 0);
              const cacheTokens = Math.max(0, Number(thread?.cacheTokens ?? thread?.cache_tokens) || 0);
              return Math.round(inputTokens + outputTokens + cacheTokens);
            };
            const getAgentDetailPeriodStartMs = (period) => {
              const now = new Date();
              const start = new Date(now);
              if (period === "day") {
                start.setHours(0, 0, 0, 0);
                return start.getTime();
              }
              if (period === "week") {
                start.setDate(start.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                return start.getTime();
              }
              start.setDate(start.getDate() - 29);
              start.setHours(0, 0, 0, 0);
              return start.getTime();
            };
            const buildAgentDetailCostBuckets = (period) => {
              if (period === "day") {
                const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
                return Array.from({ length: 24 }, (_, index) => {
                  const date = new Date();
                  date.setMinutes(0, 0, 0);
                  date.setHours(date.getHours() - (23 - index));
                  return {
                    key: date.toISOString().slice(0, 13),
                    label: formatter.format(date),
                    startMs: date.getTime(),
                    endMs: date.getTime() + 60 * 60 * 1000,
                  };
                });
              }
              if (period === "week") {
                const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
                return Array.from({ length: 7 }, (_, index) => {
                  const date = new Date();
                  date.setHours(0, 0, 0, 0);
                  date.setDate(date.getDate() - (6 - index));
                  return {
                    key: date.toISOString().slice(0, 10),
                    label: formatter.format(date),
                    startMs: date.getTime(),
                    endMs: date.getTime() + 24 * 60 * 60 * 1000,
                  };
                });
              }
              const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
              return Array.from({ length: 30 }, (_, index) => {
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() - (29 - index));
                return {
                  key: date.toISOString().slice(0, 10),
                  label: formatter.format(date),
                  startMs: date.getTime(),
                  endMs: date.getTime() + 24 * 60 * 60 * 1000,
                };
              });
            };
            const agentDetailPeriodStartMs = getAgentDetailPeriodStartMs(agentDetailChartTimescale);
            const agentDetailPeriodEndMs = Date.now();
            const agentDetailThreads = (Array.isArray(agentsHomeThreadRecords) ? agentsHomeThreadRecords : [])
              .filter((thread) => readAgentDetailThreadAgentId(thread) === String(draftAgent.id || "").trim())
              .filter((thread) => {
                const createdAtMs = readAgentDetailThreadCreatedAtMs(thread);
                return Number.isFinite(createdAtMs) && createdAtMs >= agentDetailPeriodStartMs && createdAtMs <= agentDetailPeriodEndMs;
              });
            const agentDetailCostBuckets = buildAgentDetailCostBuckets(agentDetailChartTimescale);
            const agentDetailCostValues = agentDetailCostBuckets.map((bucket) => agentDetailThreads.reduce((sum, thread) => {
              const createdAtMs = readAgentDetailThreadCreatedAtMs(thread);
              if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                return sum;
              }
              return sum + readAgentDetailThreadTotalCT(thread);
            }, 0));
            const hasAgentDetailCostData = agentDetailCostValues.some((value) => Math.max(0, Number(value || 0)) > 0);
            const totalAgentDetailCT = agentDetailThreads.reduce((sum, thread) => sum + readAgentDetailThreadTotalCT(thread), 0);
            const totalAgentDetailRuns = agentDetailThreads.length;
            const averageAgentDetailCT = totalAgentDetailRuns > 0 ? totalAgentDetailCT / totalAgentDetailRuns : 0;
            const lastAgentDetailThread = agentDetailThreads.slice().sort((left, right) => {
              const leftTime = readAgentDetailThreadCreatedAtMs(left) || 0;
              const rightTime = readAgentDetailThreadCreatedAtMs(right) || 0;
              return rightTime - leftTime;
            })[0] || null;
            const agentDetailPeriodLabel = agentDetailChartTimescale === "day"
              ? "Today"
              : agentDetailChartTimescale === "week"
                ? "7 days"
                : "30 days";
            const agentDetailKpis = [
              { id: "runs", value: String(totalAgentDetailRuns), label: "Runs " + agentDetailPeriodLabel },
              { id: "total-ct", value: formatSettingsComputeTokens(totalAgentDetailCT), label: "Total cost" },
              { id: "avg-ct", value: formatSettingsComputeTokens(averageAgentDetailCT), label: "Avg cost / Run" },
              { id: "success", value: formatPlaygroundServerRate(resolvedAgentAnalyticsSummary.successRate24h), label: "Success Rate (24h)" },
              { id: "last-used", value: lastAgentDetailThread ? formatPlaygroundFileDate(lastAgentDetailThread.updatedAt || lastAgentDetailThread.createdAt) : "Never", label: "Last Used" },
            ];
            const agentDetailComputeSeries = [
              {
                id: "inference",
                label: "LLM Inference",
                color: "rgb(143,196,255)",
                values: agentDetailCostValues,
              },
              {
                id: "runtime",
                label: "Computers & Resources",
                color: "rgb(103,80,255)",
                values: agentDetailCostValues.map(() => 0),
              },
            ];
            const maxAgentDetailDailyCt = Math.max(...agentDetailCostValues.map((value) => Math.max(0, Number(value || 0))), 1);
            const renderAgentDetailTimescaleControl = () => React.createElement("div", { className: "playground-environments-home-comparison-timescale" },
              React.createElement("select", {
                className: "playground-environments-home-comparison-timescale-select",
                value: agentDetailChartTimescale,
                onChange: (event) => setAgentDetailChartTimescale(String(event.target.value || "month")),
                "aria-label": "Agent detail chart timescale",
              },
                React.createElement("option", { value: "day" }, "Daily"),
                React.createElement("option", { value: "week" }, "Weekly"),
                React.createElement("option", { value: "month" }, "Monthly")
              )
            );
            const renderAgentDetailProjectOverviewStackedChart = (config) => {
              const labels = Array.isArray(config?.labels) ? config.labels : [];
              const series = Array.isArray(config?.series)
                ? config.series.filter((entry) => entry && Array.isArray(entry.values))
                : [];
              if (!labels.length || !series.length) {
                return React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No usage data in this period");
              }
  
              const frameHeight = 252;
              const svgHeight = 252;
              const marginTop = 12;
              const marginRight = 14;
              const marginBottom = 38;
              const marginLeft = 58;
              const totals = labels.map((_, index) =>
                series.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
              );
              if (!totals.some((value) => value > 0)) {
                return config?.emptyContent || React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No usage data in this period");
              }
  
              const yMax = Math.max(1, Number(config?.yMax || Math.max(...totals, 1)));
              const gridLineCount = 4;
              const tickFormatter = typeof config?.tickFormatter === "function"
                ? config.tickFormatter
                : (value) => String(Math.round(value));
              const labelStep = Math.max(1, Math.ceil(labels.length / 7));
              const visibleLabelIndexes = (() => {
                const next = [];
                for (let index = 0; index < labels.length; index += labelStep) {
                  next.push(index);
                }
                const lastIndex = labels.length - 1;
                if (lastIndex >= 0 && !next.includes(lastIndex)) {
                  if (next.length > 0 && lastIndex - next[next.length - 1] < 2) {
                    next[next.length - 1] = lastIndex;
                  } else {
                    next.push(lastIndex);
                  }
                }
                return new Set(next);
              })();
  
              return React.createElement(EnvironmentsHomeResponsiveSvgShared, {
                  frameClassName: "playground-project-overview-chart-shell",
                  frameHeight,
                  svgHeight,
                  fallbackWidth: 1200,
                  ariaLabel: config?.ariaLabel || "Agent compute usage chart",
                  svgClassName: "playground-project-overview-chart-svg",
                }, ({ svgWidth, svgHeight: measuredSvgHeight }) => {
                  const plotWidth = svgWidth - marginLeft - marginRight;
                  const plotHeight = measuredSvgHeight - marginTop - marginBottom;
                  const slotWidth = plotWidth / Math.max(labels.length, 1);
                  const barWidth = Math.min(24, Math.max(8, slotWidth * 0.56));
                  const baselineY = marginTop + plotHeight;
  
                  return React.createElement(React.Fragment, null,
                    Array.from({ length: gridLineCount + 1 }).map((_, index) => {
                      const y = marginTop + (plotHeight / gridLineCount) * index;
                      const tickValue = yMax - (yMax / gridLineCount) * index;
                      return React.createElement(React.Fragment, { key: "grid:" + index },
                        React.createElement("line", {
                          x1: marginLeft,
                          y1: y,
                          x2: svgWidth - marginRight,
                          y2: y,
                          stroke: "rgba(255,255,255,0.10)",
                          strokeWidth: "1",
                        }),
                        React.createElement("text", {
                          x: 0,
                          y,
                          textAnchor: "start",
                          dominantBaseline: "middle",
                          fill: "rgba(255,255,255,0.4)",
                          fontSize: "10",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: "400",
                        }, tickFormatter(tickValue))
                      );
                    }),
                    labels.map((label, index) => {
                      const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                      const isFirstLabel = index === 0;
                      const isLastLabel = index === labels.length - 1;
                      const labelX = isFirstLabel
                        ? marginLeft
                        : isLastLabel
                          ? svgWidth - marginRight
                          : marginLeft + slotWidth * index + slotWidth / 2;
                      let stackOffsetY = baselineY;
                      return React.createElement(React.Fragment, { key: "stack:" + index },
                        series.map((entry, seriesIndex) => {
                          const rawValue = Math.max(0, Number(entry.values[index] || 0));
                          if (rawValue <= 0) {
                            return null;
                          }
                          const segmentHeight = (rawValue / yMax) * plotHeight;
                          stackOffsetY -= segmentHeight;
                          return React.createElement("rect", {
                            key: "segment:" + seriesIndex,
                            x,
                            y: stackOffsetY,
                            width: barWidth,
                            height: Math.max(segmentHeight, 1),
                            rx: "3",
                            fill: entry.color || "rgba(255,255,255,0.8)",
                          });
                        }),
                        visibleLabelIndexes.has(index)
                          ? React.createElement("text", {
                              x: labelX,
                              y: measuredSvgHeight - 8,
                              textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                              fill: "rgba(255,255,255,0.4)",
                              fontSize: "10",
                              fontFamily: "Inter, sans-serif",
                              fontWeight: "400",
                            }, label)
                          : null
                      );
                    })
                  );
                }
              );
            };
            function PlaygroundAgentDetailStackedUsageChart({
              ariaLabel,
              labels,
              series,
              countSeries,
              emptyText,
              emptyContent,
              title,
              timescaleControl,
              isLoading,
            }) {
              const canvasRef = useRef(null);
              const chartRef = useRef(null);
              const normalizedLabels = Array.isArray(labels) ? labels : [];
              const normalizedSeries = Array.isArray(series)
                ? series.filter((entry) => entry && Array.isArray(entry.values))
                : [];
              const normalizedCountSeries = Array.isArray(countSeries)
                ? countSeries.filter((entry) => entry && Array.isArray(entry.values))
                : [];
              const totals = normalizedLabels.map((_, index) =>
                normalizedSeries.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
              );
              const hasUsageData = normalizedLabels.length > 0
                && normalizedSeries.length > 0
                && totals.some((value) => Math.max(0, Number(value || 0)) > 0);
              const chartSignature = JSON.stringify({
                labels: normalizedLabels,
                series: normalizedSeries.map((entry) => ({
                  id: entry.id,
                  label: entry.label,
                  color: entry.color,
                  values: entry.values,
                })),
                countSeries: normalizedCountSeries.map((entry) => ({
                  id: entry.id,
                  values: entry.values,
                })),
              });
  
              useEffect(() => () => {
                if (chartRef.current) {
                  chartRef.current.destroy();
                  chartRef.current = null;
                }
              }, []);
  
              useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas || typeof Chart !== "function" || !hasUsageData) {
                  if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                  }
                  return undefined;
                }
  
                const countValuesById = normalizedCountSeries.reduce((map, entry) => {
                  map[entry.id] = Array.isArray(entry.values) ? entry.values : [];
                  return map;
                }, {});
                const maxLabelCount = Math.max(2, Math.floor(normalizedLabels.length <= 7 ? 7 : 7));
                const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / maxLabelCount));
                const visibleLabelIndexes = (() => {
                  const next = new Set();
                  for (let index = 0; index < normalizedLabels.length; index += labelStep) {
                    next.add(index);
                  }
                  const lastIndex = normalizedLabels.length - 1;
                  if (lastIndex >= 0) {
                    next.add(lastIndex);
                  }
                  return next;
                })();
                const chartData = {
                  labels: normalizedLabels,
                  datasets: normalizedSeries.map((entry) => ({
                    id: entry.id,
                    label: entry.label,
                    data: entry.values.map((value) => Math.max(0, Number(value || 0))),
                    backgroundColor: entry.color || "rgba(255,255,255,0.8)",
                    borderColor: entry.color || "rgba(255,255,255,0.8)",
                    borderWidth: 0,
                    borderRadius: 3,
                    borderSkipped: false,
                    barPercentage: 0.92,
                    categoryPercentage: 0.58,
                    maxBarThickness: 24,
                    stack: "agent-detail-usage",
                  })),
                };
                const chartOptions = {
                  animation: false,
                  responsive: true,
                  maintainAspectRatio: false,
                  normalized: true,
                  interaction: {
                    intersect: true,
                    mode: "nearest",
                  },
                  layout: {
                    padding: {
                      top: 12,
                      right: 14,
                      bottom: 0,
                      left: 0,
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "rgba(8, 8, 8, 0.96)",
                      borderColor: "rgba(255, 255, 255, 0.14)",
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      titleColor: "rgba(255, 255, 255, 0.94)",
                      bodyColor: "rgba(255, 255, 255, 0.78)",
                      padding: 10,
                      callbacks: {
                        label: (context) => {
                          const datasetId = String(context.dataset?.id || "");
                          const label = String(context.dataset?.label || "Usage");
                          const value = Math.max(0, Number(context.parsed?.y || 0));
                          const runCount = Math.max(0, Number(countValuesById[datasetId]?.[context.dataIndex] || 0));
                          const runSuffix = runCount === 1 ? "1 run" : runCount + " runs";
                          return label + ": " + formatSettingsComputeTokens(value) + " · " + runSuffix;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false, drawBorder: false },
                      border: { display: false },
                      ticks: {
                        color: "rgba(255, 255, 255, 0.4)",
                        font: {
                          size: 10,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 10,
                        callback: (_value, index) => visibleLabelIndexes.has(index) ? String(normalizedLabels[index] || "") : "",
                      },
                    },
                    y: {
                      stacked: true,
                      min: 0,
                      grid: {
                        color: "rgba(255,255,255,0.10)",
                        drawTicks: false,
                      },
                      border: { display: false },
                      ticks: {
                        color: "rgba(255, 255, 255, 0.4)",
                        padding: 8,
                        maxTicksLimit: 5,
                        font: {
                          size: 10,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        },
                        callback: (value) => formatSettingsComputeTokens(value),
                      },
                    },
                  },
                };
  
                if (chartRef.current) {
                  chartRef.current.data = chartData;
                  chartRef.current.options = chartOptions;
                  chartRef.current.update("none");
                  return undefined;
                }
  
                chartRef.current = new Chart(canvas, {
                  type: "bar",
                  data: chartData,
                  options: chartOptions,
                });
                return undefined;
              }, [chartSignature, hasUsageData]);
  
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-project-overview-chart-header" },
                  React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                    React.createElement("div", { className: "playground-project-overview-chart-title" }, title || "Daily cost by Agent"),
                    timescaleControl || null
                  )
                ),
                isLoading
                  ? React.createElement("div", {
                      className: "playground-project-overview-chart-shell playground-agents-home-chartjs-frame",
                    },
                      React.createElement("div", {
                          className: "playground-overview-chart-loading",
                          style: { position: "static", inset: "auto", height: "100%" },
                          "aria-label": "Loading chart data",
                        },
                        React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 })
                      )
                    )
                  : (!normalizedLabels.length || !normalizedSeries.length || !hasUsageData)
                    ? (emptyContent || React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No usage data yet"))
                    : React.createElement(React.Fragment, null,
                        React.createElement("div", {
                            className: "playground-project-overview-chart-shell playground-agents-home-chartjs-frame",
                            role: "img",
                            "aria-label": ariaLabel || "Agent usage cost over time",
                          },
                          React.createElement("canvas", {
                            ref: canvasRef,
                            className: "playground-agents-home-chartjs-canvas",
                          })
                        ),
                        React.createElement("div", { className: "playground-project-overview-chart-footer-row" },
                          React.createElement("div", { className: "playground-settings-usage-inline-legend" },
                          normalizedSeries.map((entry) =>
                            React.createElement("div", { key: entry.id || entry.label, className: "playground-settings-usage-legend-item" },
                              React.createElement("span", {
                                className: "playground-settings-usage-legend-swatch",
                                style: { background: entry.color },
                              }),
                              React.createElement("span", null, entry.label)
                            )
                          )
                          ),
                          React.createElement("div", { "aria-hidden": "true" })
                        )
                      )
              );
            }
            const renderAgentDetailCostEmptyState = () => React.createElement("div", {
                className: "playground-project-overview-chart-empty playground-auth-users-empty-state playground-configure-usage-empty-state",
              },
              React.createElement("img", {
                className: "playground-auth-users-empty-state-image",
                src: "/img/empty-state/no-agent-usage.avif",
                alt: "",
                "aria-hidden": "true",
                draggable: "false",
              }),
              React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "No Agent Usage yet"),
              React.createElement("div", { className: "playground-auth-users-empty-state-copy" },
                "Agent usage appears here once this agent starts running and consuming credits."
              )
            );
            const renderAgentDetailCostChart = () => {
              if (agentsHomeThreadsLoading) {
                return React.createElement("div", {
                    className: "playground-project-overview-chart-shell",
                    style: { height: "252px" },
                  },
                  React.createElement("div", {
                      className: "playground-overview-chart-loading",
                      style: { position: "static", inset: "auto", height: "100%" },
                      "aria-label": "Loading chart data",
                    },
                    React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 })
                  )
                );
              }
              return renderAgentDetailProjectOverviewStackedChart({
                labels: agentDetailCostBuckets.map((bucket) => String(bucket?.label || "")),
                series: agentDetailComputeSeries,
                yMax: maxAgentDetailDailyCt,
                tickFormatter: formatSettingsComputeTokens,
                ariaLabel: "Agent usage cost by resource type",
                emptyText: agentsHomeThreadsError || "No agent compute usage yet",
                emptyContent: renderAgentDetailCostEmptyState(),
              });
            };
            const renderAgentFactCopyButton = (fieldId, value, label) => {
              const normalizedValue = String(value || "").trim();
              const isCopied = agentDetailCopiedFact === fieldId;
              return React.createElement("button", {
                  type: "button",
                  className: "playground-agents-detail-sidebar-copy-button",
                  title: isCopied ? "Copied" : "Copy " + label,
                  "aria-label": isCopied ? label + " copied" : "Copy " + label,
                  disabled: !normalizedValue,
                  onClick: async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!normalizedValue) {
                      return;
                    }
                    const copied = await copyTextToClipboard(normalizedValue);
                    if (!copied) {
                      return;
                    }
                    setAgentDetailCopiedFact(fieldId);
                    window.setTimeout(() => {
                      setAgentDetailCopiedFact((current) => current === fieldId ? "" : current);
                    }, 1400);
                  },
                },
                isCopied
                  ? React.createElement(Check, { width: 12, height: 12, strokeWidth: 1.6 })
                  : React.createElement(Copy, { width: 12, height: 12, strokeWidth: 1.45 })
              );
            };
            const renderAgentFactRow = (label, control, options = {}) => React.createElement("div", {
                className: "playground-tasks-detail-fact"
                  + (options.className ? " " + options.className : ""),
                key: label,
              },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" },
                label,
                options.labelAction || null
              ),
              React.createElement("div", {
                className: "playground-tasks-detail-fact-control"
                  + (options.valueClassName ? " " + options.valueClassName : ""),
              }, control)
            );
            const renderAgentFactValue = (value, extraClassName = "") =>
              React.createElement("span", {
                className: "playground-environments-editor-fact-value" + (extraClassName ? " " + extraClassName : ""),
              }, value);
            const renderAgentCopyableFactValue = (fieldId, value, label, extraClassName = "", displayValue = value) =>
              React.createElement("span", { className: "playground-agents-detail-sidebar-copy-value" },
                React.createElement("span", {
                  className: "playground-environments-editor-fact-value" + (extraClassName ? " " + extraClassName : ""),
                  title: displayValue,
                }, displayValue),
                renderAgentFactCopyButton(fieldId, value, label)
              );
            const renderAgentOwnerAvatar = (className, imageClassName, fallbackLabel, photoUrl) =>
              React.createElement(AccountAvatar, {
                className,
                imageClassName,
                fallbackLabel,
                photoUrl,
              });
            const renderAgentOwnerRow = (options = {}) => {
              const isCompact = Boolean(options.compact);
              const ownerIdentityForDisplay = resolvedAgentOwnerIdentity || agentOwnerIdentity || {};
              const ownerLabel = String(ownerIdentityForDisplay?.name || ownerIdentityForDisplay?.email || "Owner").trim();
              const ownerEmail = String(ownerIdentityForDisplay?.email || "").trim();
              const ownerDetail = ownerEmail && ownerLabel.toLowerCase() !== ownerEmail.toLowerCase()
                ? ownerEmail
                : "";
              const ownerMenuIsLoading = agentOwnerPopoverOpen && agentOwnerMissingTeamIds.length > 0;
              const currentOwnerKeys = new Set(getAgentIdentityMatchKeys(agentOwnerIdentity, agentOwnerIdentity));
              const ownerOptions = enrichedAgentOwnerCandidateRows.map((candidate) => {
                const candidateKeys = getAgentIdentityMatchKeys(candidate, candidate);
                const candidateKey = String(candidate.userId || candidate.email || candidate.id || candidateKeys[0] || "").trim().toLowerCase();
                const trustedCandidateName = getTrustedDisplayName(candidate.name, candidate.email);
                const candidateLabel = trustedCandidateName || candidate.email || "Team member";
                const candidateDetail = candidate.email && candidateLabel.toLowerCase() !== candidate.email.toLowerCase()
                  ? candidate.email
                  : (Array.isArray(candidate.teamNames) ? candidate.teamNames.join(", ") : "");
                return {
                  value: candidateKey || candidateLabel.toLowerCase(),
                  label: candidateLabel,
                  description: candidateDetail || undefined,
                  ariaLabel: candidateDetail ? candidateLabel + ", " + candidateDetail : candidateLabel,
                  leading: renderAgentOwnerAvatar(
                    "playground-agents-detail-owner-option-avatar",
                    "playground-agents-detail-owner-option-avatar-image",
                    getAccountInitials(candidateLabel),
                    candidate.avatarUrl || ""
                  ),
                  candidate,
                  candidateKeys,
                };
              });
              const selectedOwnerOption = ownerOptions.find((option) =>
                option.candidateKeys.some((key) => currentOwnerKeys.has(key))
              ) || null;
              return React.createElement(PlatformSelector, {
                value: selectedOwnerOption?.value || "",
                options: ownerOptions,
                open: agentOwnerPopoverOpen,
                onOpenChange: handleAgentOwnerPopoverOpenChange,
                onValueChange: (nextValue) => {
                  const selectedOwner = ownerOptions.find((option) => option.value === nextValue)?.candidate;
                  if (selectedOwner) handleAgentOwnerSelect(selectedOwner);
                },
                ariaLabel: "Choose agent owner",
                label: React.createElement("span", {
                    className: "playground-agents-detail-owner-value",
                  },
                  React.createElement("span", { className: "playground-team-member-cell playground-agents-detail-owner-member-cell" },
                    renderAgentOwnerAvatar(
                      "playground-team-member-avatar",
                      "playground-team-member-avatar-image",
                      getAccountInitials(ownerLabel),
                      ownerIdentityForDisplay?.avatarUrl || ""
                    ),
                    React.createElement("span", { className: "playground-team-member-copy" },
                      React.createElement("span", {
                        className: "playground-team-table-title",
                        title: ownerDetail ? ownerLabel + " · " + ownerDetail : ownerLabel,
                      }, ownerLabel)
                    )
                  )
                ),
                alignment: options.alignment || "start",
                fullWidth: true,
                loading: ownerOptions.length === 0 && (workspaceTeamsLoading || ownerMenuIsLoading),
                loadingContent: "Loading team members...",
                emptyContent: "No team members available.",
                popupWidth: 260,
                popupMaxHeight: "min(320px, calc(100vh - 180px))",
                className: "playground-agents-detail-owner-popup-shell playground-tasks-detail-central-selector",
                triggerClassName: "playground-tasks-detail-central-selector-trigger playground-agents-detail-sidebar-owner-row"
                  + (isCompact ? " is-compact" : ""),
                popupClassName: "playground-agents-detail-owner-menu",
                optionClassName: "playground-agents-detail-owner-option",
              });
            };
            const renderAgentPermissionRow = () => {
              const permissionSummary = getAgentPermissionSummary(draftAgent.permissionSet);
              return React.createElement("button", {
                  key: "Permissions",
                  type: "button",
                  className: "playground-project-overview-sidebar-row playground-agents-detail-sidebar-permission-row",
                  onClick: () => setAgentDetailTab("permissions"),
                  title: "Permissions: " + permissionSummary,
                  "aria-label": "Open permissions tab. " + permissionSummary,
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, "Permissions"),
                React.createElement("div", { className: "playground-project-overview-sidebar-row-value playground-agents-detail-sidebar-permission-value" },
                  React.createElement(AgentPermissionRingIcons, {
                    permissionSet: draftAgent.permissionSet,
                  })
                )
              );
            };
            const renderAgentAnalyticsKpi = (label, value, tone) => React.createElement("div", {
                className: "playground-servers-analytics-kpi",
                key: label,
              },
              React.createElement("div", { className: "playground-servers-analytics-kpi-value" }, value),
              React.createElement("button", {
                  type: "button",
                  className: "playground-database-overview-kpi-label"
                    + (tone ? " is-" + tone : "")
                    + (tone && agentAnalyticsVisibility[tone] === false ? " is-inactive" : ""),
                  onClick: () => {
                    if (!tone) {
                      return;
                    }
                    setAgentAnalyticsVisibility((current) => ({
                      ...current,
                      [tone]: current[tone] === false,
                    }));
                  },
                  "aria-pressed": tone ? (agentAnalyticsVisibility[tone] === false ? "false" : "true") : "true",
                },
                React.createElement("span", { className: "playground-database-overview-kpi-check" },
                  React.createElement(Check, { width: 9, height: 9, strokeWidth: 2.4 })
                ),
                React.createElement("span", null, label)
              )
            );
            const renderAgentTelemetryChart = (config) => {
              const labels = Array.isArray(config?.labels) ? config.labels : [];
              const series = Array.isArray(config?.series)
                ? config.series.filter((entry) => entry && agentAnalyticsVisibility[entry.key] !== false)
                : [];
              return renderPlaygroundTelemetryTimeseriesChart({
                ariaLabel: config?.ariaLabel || "Agent activity chart",
                labels,
                series,
                emptyText: config?.emptyText || "Select a metric",
                buildLinePath: buildAgentAnalyticsSvgLinePath,
                getSeriesValue: (entry, _label, index) => entry?.values?.[index],
                getXAxisLabel: (label) => String(label || ""),
                formatAxisValue: (value) => config?.formatAxisValue ? config.formatAxisValue(value) : String(value),
              });
            };
            const agentAnalyticsOverview = React.createElement("div", { className: "playground-database-overview" },
              React.createElement("div", { className: "playground-servers-analytics-kpi-grid" },
                [
                  renderAgentAnalyticsKpi("Runs (24h)", String(resolvedAgentAnalyticsSummary.totalRuns24h || 0), "requests"),
                  renderAgentAnalyticsKpi("Success rate", formatPlaygroundServerRate(resolvedAgentAnalyticsSummary.successRate24h), "success"),
                  renderAgentAnalyticsKpi("P95 runtime", formatPlaygroundExecutionDuration(resolvedAgentAnalyticsSummary.p95RuntimeMs), "latency"),
                  renderAgentAnalyticsKpi("Failed / Cancelled", String(Number(resolvedAgentAnalyticsSummary.failedRuns24h || 0) + Number(resolvedAgentAnalyticsSummary.cancelledRuns24h || 0)), "errors"),
                ]
              ),
              React.createElement("div", { className: "playground-database-overview-chart-grid" },
                React.createElement("div", { className: "playground-database-overview-chart-block" },
                  renderAgentTelemetryChart({
                    labels: agentActivityLabels,
                    series: [
                      {
                        key: "requests",
                        tone: "requests",
                        values: agentActivityCounts,
                      },
                      {
                        key: "errors",
                        tone: "errors",
                        values: agentActivityErrors,
                      },
                    ],
                    emptyText: "No " + analyticsSubjectLabel + " activity yet",
                    ariaLabel: (isTeamAgent ? "Squad" : "Agent") + " runs and failed runs over time",
                  })
                ),
                React.createElement("div", { className: "playground-database-overview-chart-block" },
                  renderAgentTelemetryChart({
                    labels: resolvedAgentStatusBuckets.map((bucket) => bucket?.label || ""),
                    series: [
                      {
                        key: "success",
                        tone: "success",
                        values: agentStatusSuccess,
                      },
                      {
                        key: "latency",
                        tone: "latency",
                        values: agentStatusRuntime,
                      },
                    ],
                    emptyText: "No runtime data yet",
                    ariaLabel: (isTeamAgent ? "Squad" : "Agent") + " success rate and runtime over time",
                    formatAxisValue: (value) => {
                      const numericValue = Number(value);
                      if (!Number.isFinite(numericValue) || numericValue <= 0) {
                        return "0";
                      }
                      return formatPlaygroundExecutionDuration(numericValue);
                    },
                  })
                )
              )
            );
  
            const agentSharedTeamIds = getAgentSharedTeamIds(draftAgent);
            const agentVisibilityLabel = agentSharedTeamIds.length > 0 ? "Public" : "Private";
            const agentProfileSection = React.createElement("div", {
                className: "playground-agents-profile-section playground-agent-detail-editor-profile",
              },
                React.createElement(PlatformProfileImagePicker, {
                  value: agentProfilePhotoUrl,
                  fallback: getAccountInitials(draftAgent.name || (isTeamAgent ? "Squad" : "Agent")),
                  options: PLAYGROUND_AGENT_PROFILE_PRESET_OPTIONS,
                  editable: canEditAgentProfilePhoto,
                  ariaLabel: "Choose agent profile picture",
                  className: "profile-editor-avatar playground-agents-profile-avatar playground-agents-detail-profile-image-picker",
                  onChange: (url) => handleAgentProfilePhotoSelection(url),
                }),
              React.createElement("div", { className: "playground-agents-profile-copy" },
                React.createElement("div", { className: "playground-agents-profile-name-wrap" },
                  React.createElement("input", {
                    type: "text",
                    className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input playground-agents-profile-name-input",
                    value: draftAgent.name || "",
                    placeholder: isTeamAgent ? "Squad" : "Agent",
                    "aria-label": isTeamAgent ? "Squad name" : "Agent name",
                    title: draftAgent.name || (isTeamAgent ? "Squad" : "Agent"),
                    onKeyDown: (event) => event.stopPropagation(),
                    onChange: (event) => updateAgentField("name", event.target.value),
                  }),
                  React.createElement("span", {
                    className: "playground-agents-visibility-label" + (agentVisibilityLabel === "Public" ? " is-public" : " is-private"),
                    title: agentVisibilityLabel === "Public" ? "Shared with a team" : "Not shared with a team",
                  }, agentVisibilityLabel)
                )
              )
            );
  
            const renderAgentModelSelectorLabel = (modelMeta) => {
              const providerIcon = getPlaygroundAgentModelProviderIcon(modelMeta);
              return React.createElement("span", {
                  className: "playground-agents-detail-selector-label playground-agents-detail-model-selector-label",
                },
                providerIcon
                  ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                      React.createElement("img", {
                        src: providerIcon.src,
                        alt: "",
                        draggable: "false",
                        className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                      })
                    )
                  : React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                      React.createElement(Bot, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                React.createElement("span", {
                  className: "playground-agents-detail-selector-label-copy",
                }, modelMeta?.label || "Select model")
              );
            };
            const renderAgentDetailModelSelector = (modelMeta, options = {}) => React.createElement(PlatformSelector, {
                value: String(modelMeta?.id || draftAgent.model || ""),
                options: [],
                label: renderAgentModelSelectorLabel(modelMeta),
                ariaLabel: "Select agent model",
                alignment: "end",
                popupAlignment: "right",
                fullWidth: true,
                disabled: Boolean(options.disabled),
                open: false,
                onOpenChange: (nextOpen) => {
                  if (nextOpen && !options.disabled) {
                    openAgentModelPicker("detail");
                  }
                },
                popupContent: React.createElement("span", { "aria-hidden": "true" }),
                popupAriaLabel: "Choose an agent model",
                className: "playground-tasks-detail-central-selector playground-agents-detail-model-selector",
                triggerClassName: "playground-tasks-detail-central-selector-trigger",
              });
            const agentPrimaryModelControl = renderAgentDetailModelSelector(
              isTeamAgent ? teamDerivedModelMeta : selectedAgentModel,
              {
                disabled: isTeamAgent || isDefaultAgentConfigurationLocked,
              }
            );
            const selectedExecutionEngine = PLAYGROUND_AGENT_EXECUTION_ENGINE_OPTIONS.find(
              (option) => option.id === normalizePlaygroundAgentExecutionEngine(draftAgent.executionEngine)
            ) || PLAYGROUND_AGENT_EXECUTION_ENGINE_OPTIONS[0];
            const renderAgentExecutionEngineIcon = (option) => React.createElement("img", {
                src: option.iconUrl,
                alt: "",
                draggable: "false",
                className: "playground-agents-detail-engine-provider-icon",
                "aria-hidden": "true",
              });
            const renderAgentExecutionEngineSelector = () => React.createElement(PlatformSelector, {
                value: selectedExecutionEngine.id,
                options: PLAYGROUND_AGENT_EXECUTION_ENGINE_OPTIONS.map((option) => ({
                  value: option.id,
                  label: option.label,
                  description: option.description,
                  leading: renderAgentExecutionEngineIcon(option),
                })),
                onValueChange: (nextExecutionEngine) => {
                  updateAgentField(
                    "executionEngine",
                    normalizePlaygroundAgentExecutionEngine(nextExecutionEngine)
                  );
                },
                ariaLabel: "Select agent engine",
                label: React.createElement("span", {
                    className: "playground-agents-detail-selector-label playground-agents-detail-execution-engine-selector-label",
                  },
                  renderAgentExecutionEngineIcon(selectedExecutionEngine),
                  React.createElement("span", {
                    className: "playground-agents-detail-selector-label-copy",
                  }, selectedExecutionEngine.label)
                ),
                alignment: "end",
                popupAlignment: "right",
                fullWidth: true,
                disabled: isDefaultAgentConfigurationLocked,
                popupWidth: 280,
                className: "playground-tasks-detail-central-selector playground-agents-detail-execution-engine-select-popup",
                triggerClassName: "playground-tasks-detail-central-selector-trigger playground-agents-detail-execution-engine-select-trigger",
                popupClassName: "playground-agents-detail-execution-engine-select-menu",
              });
            const selectedVoiceId = String(draftAgent.voiceId || "eve").trim() || "eve";
            const selectedVoiceOption = PLAYGROUND_VOICE_AGENT_VOICE_OPTIONS.find((option) => option.id === selectedVoiceId);
            const selectedVoiceLabel = selectedVoiceOption?.label || selectedVoiceId;
            const renderAgentVoiceSelector = () => React.createElement(PlatformSelector, {
                ref: agentVoicePopoverRef,
                value: selectedVoiceId,
                options: PLAYGROUND_VOICE_AGENT_VOICE_OPTIONS.map((option) => ({
                  value: option.id,
                  label: option.label,
                })),
                onValueChange: (nextVoiceId) => {
                  updateAgentVoiceSelection(nextVoiceId);
                  setAgentVoicePopoverOpen(false);
                },
                open: agentVoicePopoverOpen,
                onOpenChange: setAgentVoicePopoverOpen,
                ariaLabel: "Select agent voice",
                label: React.createElement("span", {
                    className: "playground-agents-detail-selector-label playground-agents-detail-voice-selector-label",
                  },
                  React.createElement(AudioLines, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.85,
                    "aria-hidden": "true",
                  }),
                  React.createElement("span", {
                    className: "playground-agents-detail-selector-label-copy",
                  }, selectedVoiceLabel)
                ),
                alignment: "end",
                popupAlignment: "right",
                fullWidth: true,
                  disabled: isDefaultAgentConfigurationLocked,
                popupWidth: 220,
                className: "playground-tasks-detail-central-selector playground-agents-detail-voice-select-popup",
                triggerClassName: "playground-tasks-detail-central-selector-trigger playground-agents-detail-voice-select-trigger",
                popupClassName: "playground-agents-detail-voice-select-menu",
              });
  
            const activeAgentDetailPerformanceRange = agentDetailPerformanceRangeOptions.find((option) => option.id === normalizedAgentDetailPerformanceRange)
              || agentDetailPerformanceRangeOptions[2];
            const formatAgentDetailPerformanceInteger = (value) => {
              const numericValue = Math.max(0, Math.round(Number(value || 0)));
              return numericValue.toLocaleString("en-US");
            };
            const formatAgentDetailPerformanceAxisValue = (value) => {
              const numericValue = Math.max(0, Number(value || 0));
              if (numericValue >= 1000) {
                return (numericValue / 1000).toFixed(numericValue >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
              }
              return String(Math.round(numericValue));
            };
            const getAgentDetailLocalDayKey = (dateLike) => {
              const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
              if (Number.isNaN(date.getTime())) {
                return "";
              }
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return year + "-" + month + "-" + day;
            };
            const readAgentDetailThreadTimestampMs = (...values) => {
              for (const value of values) {
                const timestamp = Date.parse(String(value || ""));
                if (Number.isFinite(timestamp)) {
                  return timestamp;
                }
              }
              return null;
            };
            const getAgentDetailThreadStatus = (thread) => String(thread?.status || thread?.state || thread?.phase || "").trim().toLowerCase();
            const isAgentDetailThreadCompleted = (thread) => {
              const status = getAgentDetailThreadStatus(thread);
              return status === "completed" || status === "complete" || status === "done" || status === "success" || status === "finished";
            };
            const isAgentDetailThreadStarted = (thread) => {
              const status = getAgentDetailThreadStatus(thread);
              return status !== "queued" && status !== "pending" && status !== "draft" && status !== "idle";
            };
            const buildAgentDetailPerformanceBuckets = (bucketCount) => {
              const now = new Date();
              const endDate = new Date(now);
              endDate.setHours(0, 0, 0, 0);
              return Array.from({ length: Math.max(1, Number(bucketCount || 30)) }, (_, index) => {
                const date = new Date(endDate);
                date.setDate(endDate.getDate() - (Math.max(1, Number(bucketCount || 30)) - 1 - index));
                const startMs = date.getTime();
                const endMs = startMs + 24 * 60 * 60 * 1000;
                return {
                  key: getAgentDetailLocalDayKey(date),
                  label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  startMs,
                  endMs,
                  runCount: 0,
                  completedCount: 0,
                  totalCT: 0,
                  totalTokens: 0,
                };
              });
            };
            const agentDetailPerformanceBuckets = buildAgentDetailPerformanceBuckets(activeAgentDetailPerformanceRange.bucketCount);
            const agentDetailPerformanceStartMs = agentDetailPerformanceBuckets[0]?.startMs || 0;
            const agentDetailPerformanceEndMs = agentDetailPerformanceBuckets[agentDetailPerformanceBuckets.length - 1]?.endMs || Date.now();
            const agentDetailPerformanceThreads = (Array.isArray(agentsHomeThreadRecords) ? agentsHomeThreadRecords : [])
              .filter((thread) => readAgentDetailThreadAgentId(thread) === String(draftAgent.id || "").trim())
              .filter((thread) => {
                const createdAtMs = readAgentDetailThreadCreatedAtMs(thread);
                return Number.isFinite(createdAtMs) && createdAtMs >= agentDetailPerformanceStartMs && createdAtMs < agentDetailPerformanceEndMs;
              });
            agentDetailPerformanceBuckets.forEach((bucket) => {
              let runCount = 0;
              let completedCount = 0;
              let totalCT = 0;
              let totalTokens = 0;
              agentDetailPerformanceThreads.forEach((thread) => {
                const createdAtMs = readAgentDetailThreadCreatedAtMs(thread);
                if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                  return;
                }
                runCount += 1;
                totalCT += readAgentDetailThreadTotalCT(thread);
                totalTokens += readAgentDetailThreadUsageTokens(thread);
                if (isAgentDetailThreadCompleted(thread)) {
                  completedCount += 1;
                }
              });
              bucket.runCount = runCount;
              bucket.completedCount = completedCount;
              bucket.totalCT = totalCT;
              bucket.totalTokens = totalTokens;
            });
            const buildAgentDetailPerformanceSeries = () => {
              return [
                { id: "runs", values: agentDetailPerformanceBuckets.map((bucket) => Math.max(0, Number(bucket?.runCount || 0))) },
              ];
            };
            const agentDetailPerformanceSeries = buildAgentDetailPerformanceSeries();
            const agentDetailPerformanceRunCount = agentDetailPerformanceThreads.length;
            const agentDetailPerformanceCompletedCount = agentDetailPerformanceBuckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket?.completedCount || 0)), 0);
            const agentDetailPerformanceCost = agentDetailPerformanceBuckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket?.totalCT || 0)), 0);
            const agentDetailPerformanceConsumedTokens = agentDetailPerformanceBuckets.reduce(
              (sum, bucket) => sum + Math.max(0, Number(bucket?.totalTokens || 0)),
              0
            );
            const agentDetailPerformanceSuccessRate = agentDetailPerformanceRunCount > 0
              ? Math.round((agentDetailPerformanceCompletedCount / agentDetailPerformanceRunCount) * 100)
              : 0;
            const agentDetailPerformanceKpis = [
              { id: "total-runs", label: "Total Runs", value: formatAgentDetailPerformanceInteger(agentDetailPerformanceRunCount) },
              { id: "cost", label: "Cost", value: formatSettingsComputeTokens(agentDetailPerformanceCost) },
              { id: "consumed-tokens", label: "Consumed Tokens", value: formatAgentDetailPerformanceInteger(agentDetailPerformanceConsumedTokens) },
              { id: "success-rate", label: "Success Rate", value: String(agentDetailPerformanceSuccessRate) + "%" },
            ];
            const maxAgentDetailPerformanceValue = Math.max(
              1,
              ...agentDetailPerformanceSeries.flatMap((entry) => Array.isArray(entry.values) ? entry.values : [])
                .map((value) => Math.max(0, Number(value || 0)))
            );
            const maxAgentDetailPerformanceDailyCt = Math.max(1, ...agentDetailPerformanceBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0))));
            function PlaygroundAgentDetailPerformanceChart({ dailyCtBuckets, maxDailyCt, maxRunValue, series }) {
              const canvasRef = useRef(null);
              const chartRef = useRef(null);
              const chartSignature = JSON.stringify({
                buckets: dailyCtBuckets.map((bucket) => ({
                  key: bucket?.key || "",
                  label: bucket?.label || "",
                  runCount: Math.max(0, Number(bucket?.runCount || 0)),
                  totalCT: Math.max(0, Number(bucket?.totalCT || 0)),
                })),
                maxDailyCt,
                maxRunValue,
                series: series.map((entry) => ({
                  id: entry.id,
                  values: Array.isArray(entry.values) ? entry.values : [],
                })),
              });
  
              useEffect(() => () => {
                if (chartRef.current) {
                  chartRef.current.destroy();
                  chartRef.current = null;
                }
              }, []);
  
              useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas || typeof Chart !== "function") {
                  return undefined;
                }
                const labels = dailyCtBuckets.map((bucket) => String(bucket?.label || ""));
                const dailyCtValues = dailyCtBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0)));
                const longRangeTickIndexes = (() => {
                  if (labels.length < 90) {
                    return null;
                  }
                  const targetCount = labels.length >= 365 ? 7 : 6;
                  const indexes = new Set();
                  for (let tickIndex = 0; tickIndex < targetCount; tickIndex += 1) {
                    indexes.add(Math.round(((labels.length - 1) * tickIndex) / Math.max(1, targetCount - 1)));
                  }
                  return indexes;
                })();
                const seriesById = series.reduce((map, entry) => {
                  map[entry.id] = Array.isArray(entry.values) ? entry.values : [];
                  return map;
                }, {});
                const makeVerticalGradient = (context, stops, fallback) => {
                  const chart = context?.chart;
                  const chartArea = chart?.chartArea;
                  const ctx = chart?.ctx;
                  if (!ctx || !chartArea) {
                    return fallback;
                  }
                  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
                  return gradient;
                };
                const hoverGuidePlugin = {
                  id: "agentDetailPerformanceHoverGuide",
                  afterDatasetsDraw: (chartInstance) => {
                    const activeElements = chartInstance?.tooltip?.getActiveElements?.() || [];
                    if (!activeElements.length) {
                      return;
                    }
                    const activeIndex = activeElements[0]?.index;
                    const activeElement = activeElements[0]?.element;
                    const chartArea = chartInstance.chartArea;
                    const ctx = chartInstance.ctx;
                    if (!ctx || !chartArea || typeof activeIndex !== "number" || !activeElement) {
                      return;
                    }
                    const x = activeElement.x;
                    const label = String(chartInstance?.data?.labels?.[activeIndex] || "");
                    if (!label) {
                      return;
                    }
                    ctx.save();
                    ctx.setLineDash([4, 4]);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, chartArea.top + 8);
                    ctx.lineTo(x, chartArea.bottom);
                    ctx.stroke();
                    ctx.restore();
                  },
                };
                const edgeToEdgeChartAreaPlugin = {
                  id: "agentDetailPerformanceEdgeToEdgeChartArea",
                  beforeDatasetsDraw: (chartInstance) => {
                    const ctx = chartInstance?.ctx;
                    const chartArea = chartInstance?.chartArea;
                    const runsScale = chartInstance?.scales?.runs;
                    if (!ctx || !chartArea || !runsScale) {
                      return;
                    }
                    const min = Number(runsScale.min || 0);
                    const max = Number(runsScale.max || 0);
                    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
                      return;
                    }
                    ctx.save();
                    ctx.setLineDash([5, 8]);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
                    ctx.lineWidth = 1;
                    for (let index = 1; index < 4; index += 1) {
                      const value = min + ((max - min) * index) / 4;
                      const y = runsScale.getPixelForValue(value);
                      if (!Number.isFinite(y)) {
                        continue;
                      }
                      ctx.beginPath();
                      ctx.moveTo(chartArea.left, y);
                      ctx.lineTo(chartArea.right, y);
                      ctx.stroke();
                    }
                    ctx.restore();
                  },
                };
                const chartData = {
                  labels,
                  datasets: [
                    {
                      id: "dailyCT",
                      type: "bar",
                      label: "Cost",
                      data: dailyCtValues,
                      yAxisID: "ct",
                      backgroundColor: (context) => makeVerticalGradient(context, [
                        [0, "rgba(102, 166, 255, 0.82)"],
                        [1, "rgba(91, 103, 230, 0.64)"],
                      ], "rgba(95, 112, 230, 0.72)"),
                      borderColor: "rgba(95, 112, 230, 0.75)",
                      borderWidth: 0,
                      borderRadius: 2,
                      barPercentage: 0.72,
                      categoryPercentage: 0.86,
                      maxBarThickness: 10,
                      order: 4,
                    },
                    {
                      id: "runs",
                      type: "line",
                      label: "Runs",
                      data: seriesById.runs || [],
                      yAxisID: "runs",
                      borderColor: "#7EFFFF",
                      backgroundColor: (context) => makeVerticalGradient(context, [
                        [0, "rgba(126, 255, 255, 0.2)"],
                        [0.62, "rgba(126, 255, 255, 0.08)"],
                        [1, "rgba(126, 255, 255, 0)"],
                      ], "rgba(126, 255, 255, 0.08)"),
                      borderWidth: 1.5,
                      fill: false,
                      pointBackgroundColor: "#7EFFFF",
                      pointBorderColor: "#050505",
                      pointBorderWidth: 2,
                      pointRadius: (context) => context.dataIndex === (seriesById.runs || []).length - 1 ? 5 : 0,
                      pointHoverRadius: 5,
                      tension: 0.28,
                      order: 2,
                    },
                  ],
                };
                const chartOptions = {
                  animation: false,
                  responsive: true,
                  maintainAspectRatio: false,
                  normalized: true,
                  interaction: {
                    intersect: false,
                    mode: "index",
                  },
                  layout: {
                    padding: {
                      top: 12,
                      right: 4,
                      bottom: 0,
                      left: 0,
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "rgba(8, 8, 8, 0.96)",
                      borderColor: "rgba(255, 255, 255, 0.14)",
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      titleColor: "rgba(255, 255, 255, 0.94)",
                      bodyColor: "rgba(255, 255, 255, 0.78)",
                      padding: 10,
                      callbacks: {
                        label: (context) => {
                          const datasetId = context.dataset?.id || "";
                          const value = Math.max(0, Number(context.parsed?.y || 0));
                          if (datasetId === "dailyCT") {
                            return "Cost: " + formatSettingsComputeTokens(value);
                          }
                          return String(context.dataset?.label || "Runs") + ": " + formatAgentDetailPerformanceInteger(value);
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      type: "category",
                      bounds: "data",
                      offset: false,
                      grid: { display: false, offset: false, drawBorder: false },
                      border: { display: false },
                      ticks: {
                        align: "inner",
                        autoSkip: false,
                        color: "rgba(255, 255, 255, 0.38)",
                        font: {
                          size: 11,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 10,
                        callback: (_value, index) => {
                          const bucket = dailyCtBuckets[index];
                          const key = String(bucket?.key || "");
                          const date = key ? new Date(key + "T00:00:00") : null;
                          if (longRangeTickIndexes) {
                            return longRangeTickIndexes.has(index)
                              ? (date && !Number.isNaN(date.getTime())
                                ? date.toLocaleDateString("en-US", { month: "short" })
                                : (labels[index] || ""))
                              : "";
                          }
                          if (labels.length === 30) {
                            return index === 0 || index === labels.length - 1 ? (labels[index] || "") : "";
                          }
                          if (labels.length <= 7) {
                            return labels[index] || "";
                          }
                          if (date && !Number.isNaN(date.getTime()) && date.getDate() <= 2) {
                            return date.toLocaleDateString("en-US", { month: "short" });
                          }
                          if (index === 0 || index === labels.length - 1) {
                            return date && !Number.isNaN(date.getTime())
                              ? date.toLocaleDateString("en-US", { month: "short" })
                              : (labels[index] || "");
                          }
                          return "";
                        },
                      },
                    },
                    runs: {
                      display: true,
                      type: "linear",
                      position: "left",
                      min: 0,
                      max: Math.max(1, Math.ceil(maxRunValue * 1.18)),
                      ticks: {
                        display: true,
                        maxTicksLimit: 4,
                        color: "rgba(255, 255, 255, 0.34)",
                        padding: 8,
                        font: {
                          size: 11,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                        },
                        callback: (value) => formatAgentDetailPerformanceInteger(value),
                      },
                      grid: {
                        display: false,
                        drawTicks: false,
                      },
                      border: { display: false },
                    },
                    ct: {
                      display: false,
                      type: "linear",
                      position: "left",
                      min: 0,
                      max: Math.max(1, Math.ceil(maxDailyCt * 1.22)),
                      ticks: {
                        display: false,
                        maxTicksLimit: 4,
                        color: "rgba(255, 255, 255, 0.34)",
                        padding: 8,
                        font: {
                          size: 11,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                        },
                        callback: (value) => formatAgentDetailPerformanceAxisValue(value),
                      },
                      grid: { display: false, drawTicks: false },
                      border: { display: false },
                    },
                  },
                };
  
                if (chartRef.current) {
                  chartRef.current.data = chartData;
                  chartRef.current.options = chartOptions;
                  chartRef.current.update("none");
                  return undefined;
                }
  
                chartRef.current = new Chart(canvas, {
                  type: "bar",
                  data: chartData,
                  options: chartOptions,
                  plugins: [edgeToEdgeChartAreaPlugin, hoverGuidePlugin],
                });
                return undefined;
              }, [chartSignature]);
  
              return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
                React.createElement("canvas", {
                  ref: canvasRef,
                  className: "playground-project-overview-progress-combo-canvas playground-agents-detail-progress-combo-canvas",
                  role: "img",
                  "aria-label": "Agent analytics: runs and usage cost",
                })
              );
            }
            const agentDetailAnalyticsMetricColors = {
              "total-runs": "#7effff",
              cost: "rgb(95, 112, 230)",
              "consumed-tokens": "#fff",
              "success-rate": "#54e5a6",
            };
            const agentDetailAnalyticsModel = {
              title: "Analytics",
              ariaLabel: "Agent analytics",
              metrics: agentDetailPerformanceKpis.map((item) => ({
                id: item.id,
                label: item.label,
                value: item.value,
                color: agentDetailAnalyticsMetricColors[item.id] || "rgba(255, 255, 255, 0.72)",
              })),
              labels: agentDetailPerformanceBuckets.map((bucket) => String(bucket?.label || "")),
              series: [
                {
                  id: "cost",
                  label: "Cost",
                  values: agentDetailPerformanceBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0))),
                  color: "#8fc4ff",
                  type: "bar",
                  axis: "secondary",
                  valueKind: "tokens",
                },
                {
                  id: "runs",
                  label: "Runs",
                  values: agentDetailPerformanceSeries.find((entry) => entry.id === "runs")?.values || [],
                  color: "#7effff",
                  type: "line",
                  axis: "primary",
                  valueKind: "count",
                },
              ],
              loading: agentsHomeThreadsLoading,
            };
            const agentUsageChartSection = React.createElement(PlatformAnalyticsSection, {
                variant: "default",
                className: "playground-agents-detail-analytics",
                analytics: agentDetailAnalyticsModel,
              }
            );
  
            const normalizedAgentDetailActionId = String(draftAgent?.id || "").trim();
            const agentDetailHasPersistedId = Boolean(
              normalizedAgentDetailActionId
              && normalizedAgentDetailActionId !== PLAYGROUND_AGENT_DRAFT_ID
            );
            const agentThreadActionControl = React.createElement("div", {
                className: "playground-tasks-detail-work-control playground-agents-detail-thread-control",
              },
              React.createElement(PlatformButtonSelector, {
                  mode: "split-action",
                  buttonVariant: "primary",
                  buttonSize: "small",
                  label: "Start a Thread",
                  actionAriaLabel: "Start a Thread",
                  popupAriaLabel: "Agent thread options",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupAlignment: "left",
                  matchTriggerWidth: true,
                  closeOnSelect: true,
                  actionDisabled: !agentDetailHasPersistedId
                    || saveState.isSaving
                    || typeof onStartThreadWithAgent !== "function",
                  popupDisabled: saveState.isSaving,
                  className: "playground-tasks-detail-work-selector playground-agents-detail-thread-selector",
                  popupClassName: "playground-tasks-detail-work-selector-popup playground-agents-detail-thread-selector-popup",
                  onAction: handleAgentProfileNewThread,
                },
                React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => openAgentSendToTeamModal(draftAgent),
                  disabled: !agentDetailHasPersistedId || isDefaultAgentConfigurationLocked,
                },
                  React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "tb-popup-label" }, "Share with a Team")
                ),
                React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: openAgentApiModal,
                  disabled: !agentDetailHasPersistedId,
                },
                  React.createElement(Code, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "tb-popup-label" }, "Use via API")
                ),
                React.createElement("button", {
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: openCurrentAgentCopyModal,
                },
                  React.createElement(Split, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "tb-popup-label" }, "Copy Agent")
                )
              )
            );
            const agentPropertiesSidebar = React.createElement(PlatformUiCard, {
                as: "section",
                variant: "sidebar",
                className: "playground-ticket-detail-sidebar-section playground-ticket-detail-sidebar-details playground-agents-detail-about-card",
              },
              React.createElement("div", {
                  className: "playground-tasks-detail-facts is-centralized-sidebar-content playground-agent-detail-sidebar-facts",
                },
                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                  renderAgentFactRow(
                    "Model",
                    agentPrimaryModelControl,
                    {
                      className: "is-model",
                      valueClassName: "playground-agents-detail-about-model-control playground-tasks-detail-central-selector",
                    }
                  ),
                  renderAgentFactRow(
                    "Engine",
                    renderAgentExecutionEngineSelector(),
                    {
                      className: "is-execution-engine",
                      valueClassName: "playground-agents-detail-about-execution-engine-control",
                    }
                  ),
                  renderAgentFactRow(
                    "Voice",
                    renderAgentVoiceSelector(),
                    {
                      className: "is-voice",
                      valueClassName: "playground-agents-detail-about-voice-control",
                    }
                  ),
                  renderAgentFactRow(
                    "Owner",
                    renderAgentOwnerRow({ compact: true, alignment: "end" }),
                    {
                      className: "is-assignee playground-agents-detail-about-owner-row",
                      valueClassName: "playground-agents-detail-about-owner-control",
                    }
                  ),
                  agentThreadActionControl
                )
              )
            );
  
  ${GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.page}          const agentDetailThreadFilterOptions = [
              { id: "all", label: "All Threads", description: "Show every agent thread" },
              { id: "running", label: "Running", description: "Only show threads still in progress" },
              { id: "permission", label: "Needs Permission", description: "Only show threads waiting for approval" },
              { id: "completed", label: "Completed", description: "Only show finished threads" },
              { id: "failed", label: "Failed", description: "Only show failed or cancelled threads" },
            ];
            const agentDetailThreadsAgentsById = allKnownAgents.reduce((map, agent) => {
              if (agent?.id) {
                map[agent.id] = agent;
              }
              return map;
            }, {});
            const agentDetailEnvironmentsById = (Array.isArray(environments) ? environments : []).reduce((map, environment) => {
              const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environment);
              if (normalizedEnvironment?.id) {
                map[normalizedEnvironment.id] = normalizedEnvironment;
              }
              return map;
            }, {});
            const selectedAgentThreadId = String(draftAgent.id || "").trim();
            const getAgentDetailThreadRecordObject = (value) =>
              value && typeof value === "object" && !Array.isArray(value) ? value : {};
            function getAgentDetailThreadMetadataParts(thread) {
              const normalizedThread = getAgentDetailThreadRecordObject(thread);
              const rawThread = getAgentDetailThreadRecordObject(normalizedThread.rawThread);
              const metadata = getAgentDetailThreadRecordObject(rawThread.metadata || normalizedThread.metadata);
              const runnerPlayground = getAgentDetailThreadRecordObject(metadata.runnerPlayground);
              const runnerPlaygroundSnake = getAgentDetailThreadRecordObject(metadata.runner_playground);
              const runner = Object.keys(runnerPlayground).length > 0 ? runnerPlayground : runnerPlaygroundSnake;
              const taskPreview = getAgentDetailThreadRecordObject(runner.taskPreview || runner.task_preview);
              const missionControl = getAgentDetailThreadRecordObject(runner.missionControl || runner.mission_control);
              const agentAssistant = getAgentDetailThreadRecordObject(runner.agentAssistant || runner.agent_assistant);
              const metronome = getAgentDetailThreadRecordObject(
                metadata.metronome
                || metadata.metronomeWorkflow
                || metadata.metronome_workflow
                || runner.metronome
                || runner.metronomeWorkflow
                || runner.metronome_workflow
              );
              const sourceRecord = getAgentDetailThreadRecordObject(rawThread.source || metadata.source || runner.source);
              const triggerRecord = getAgentDetailThreadRecordObject(rawThread.trigger || metadata.trigger || runner.trigger);
              return {
                rawThread,
                normalizedThread,
                metadata,
                runner,
                taskPreview,
                missionControl,
                agentAssistant,
                metronome,
                sourceRecord,
                triggerRecord,
              };
            }
            function readAgentDetailThreadStringFromSources(sources, keys) {
              for (const source of sources) {
                if (!source || typeof source !== "object" || Array.isArray(source)) {
                  continue;
                }
                for (const key of keys) {
                  const value = source[key];
                  if (typeof value === "string" && value.trim()) {
                    return value.trim();
                  }
                  if (typeof value === "number" && Number.isFinite(value)) {
                    return String(value);
                  }
                }
              }
              return "";
            }
            function formatAgentDetailThreadSourceLabel(value) {
              const rawValue = String(value || "").trim();
              const normalizedValue = rawValue.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
              if (!normalizedValue) {
                return "";
              }
              if (normalizedValue.includes("mission_control")) return "Mission Control";
              if (normalizedValue.includes("metronome") || normalizedValue.includes("workflow")) return "Metronome";
              if (normalizedValue.includes("email") || normalizedValue.includes("gmail") || normalizedValue === "mail" || normalizedValue.includes("inbox")) return "Email";
              if (normalizedValue.includes("slack")) return "Slack";
              if (normalizedValue.includes("discord")) return "Discord";
              if (normalizedValue.includes("telegram")) return "Telegram";
              if (normalizedValue.includes("webhook")) return "Webhook";
              if (normalizedValue.includes("api")) return "API";
              if (normalizedValue.includes("schedule") || normalizedValue.includes("cron")) return "Schedule";
              if (normalizedValue.includes("github")) return "GitHub";
              if (normalizedValue.includes("gitlab")) return "GitLab";
              if (
                normalizedValue.includes("chat")
                || normalizedValue.includes("thread")
                || normalizedValue.includes("assistant")
                || normalizedValue.includes("manual")
                || normalizedValue.includes("composer")
                || normalizedValue.includes("input")
                || normalizedValue.includes("sidebar")
                || normalizedValue.includes("private")
                || normalizedValue === "runner_web_sdk"
                || normalizedValue.includes("runner_web_sdk")
                || normalizedValue.includes("runner_web")
              ) {
                return "Chat";
              }
              return normalizedValue
                .split("_")
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
            }
            function getAgentDetailThreadSourceLabel(thread) {
              const parts = getAgentDetailThreadMetadataParts(thread);
              const sourceSources = [
                parts.rawThread,
                parts.normalizedThread,
                parts.metadata,
                parts.runner,
                parts.taskPreview,
                parts.missionControl,
                parts.agentAssistant,
                parts.metronome,
                parts.sourceRecord,
                parts.triggerRecord,
              ];
              const metronomeCue = readAgentDetailThreadStringFromSources(sourceSources, [
                "metronomeId",
                "metronome_id",
                "metronomeWorkflowId",
                "metronome_workflow_id",
                "workflowId",
                "workflow_id",
                "workflowRunId",
                "workflow_run_id",
              ]);
              if (getThreadMetronomeMetadata(thread) || metronomeCue || Object.keys(parts.metronome).length > 0) {
                return "Metronome";
              }
              const explicitSource = readAgentDetailThreadStringFromSources(sourceSources, [
                "source",
                "sourceType",
                "source_type",
                "triggerSource",
                "trigger_source",
                "trigger",
                "triggerType",
                "trigger_type",
                "origin",
                "originType",
                "origin_type",
                "channel",
                "channelType",
                "channel_type",
                "connector",
                "connectorType",
                "connector_type",
                "integration",
                "provider",
                "providerId",
                "provider_id",
                "resourceType",
                "resource_type",
                "runKind",
                "run_kind",
                "app",
                "appId",
                "app_id",
                "type",
                "kind",
              ]);
              return formatAgentDetailThreadSourceLabel(explicitSource) || "Chat";
            }
            function getAgentDetailThreadEnvironmentLabel(thread) {
              const parts = getAgentDetailThreadMetadataParts(thread);
              const taskPreview = getThreadTaskPreview(thread) || parts.taskPreview;
              const missionControl = getThreadMissionControlMetadata(thread) || parts.missionControl;
              const projectRecord = getAgentDetailThreadRecordObject(
                parts.rawThread.project
                || parts.metadata.project
                || parts.runner.project
                || taskPreview.project
                || missionControl.project
              );
              const environmentRecord = getAgentDetailThreadRecordObject(
                parts.rawThread.environment
                || parts.rawThread.computer
                || parts.metadata.environment
                || parts.metadata.computer
                || parts.runner.environment
                || parts.runner.computer
                || taskPreview.environment
              );
              const projectName = readAgentDetailThreadStringFromSources([projectRecord], [
                "projectName",
                "project_name",
                "displayName",
                "display_name",
                "name",
                "title",
              ]) || readAgentDetailThreadStringFromSources([
                taskPreview,
                missionControl,
                parts.rawThread,
                parts.normalizedThread,
                parts.metadata,
                parts.runner,
              ], [
                "projectName",
                "project_name",
              ]);
              if (projectName) {
                return projectName;
              }
              const environmentId = readAgentDetailThreadStringFromSources([environmentRecord], [
                "environmentId",
                "environment_id",
                "computerId",
                "computer_id",
                "id",
              ]) || readAgentDetailThreadStringFromSources([
                taskPreview,
                parts.rawThread,
                parts.normalizedThread,
                parts.metadata,
                parts.runner,
              ], [
                "environmentId",
                "environment_id",
                "computerId",
                "computer_id",
              ]);
              const listedEnvironment = environmentId ? agentDetailEnvironmentsById[environmentId] || null : null;
              const environmentName = readAgentDetailThreadStringFromSources([
                environmentRecord,
                listedEnvironment,
              ], [
                "environmentName",
                "environment_name",
                "computerName",
                "computer_name",
                "displayName",
                "display_name",
                "name",
                "title",
              ]) || readAgentDetailThreadStringFromSources([
                taskPreview,
                parts.rawThread,
                parts.normalizedThread,
                parts.metadata,
                parts.runner,
              ], [
                "environmentName",
                "environment_name",
                "computerName",
                "computer_name",
              ]);
              if (environmentName) {
                return environmentName;
              }
              const projectId = readAgentDetailThreadStringFromSources([projectRecord], [
                "projectId",
                "project_id",
                "id",
              ]) || readAgentDetailThreadStringFromSources([
                taskPreview,
                missionControl,
                parts.rawThread,
                parts.normalizedThread,
                parts.metadata,
                parts.runner,
              ], [
                "projectId",
                "project_id",
              ]);
              return projectId || environmentId || "Workspace";
            }
            function getAgentDetailThreadPersonLabel(identity) {
              const source = identity && typeof identity === "object" && !Array.isArray(identity) ? identity : {};
              const email = String(source.email || "").trim().toLowerCase();
              const name = String(source.name || source.displayName || source.display_name || "").trim();
              return getTrustedDisplayName(name, email)
                || (email ? formatAccountDisplayName("", email, "") : "");
            }
            function findAgentDetailThreadPersonMatch(identity) {
              const source = identity && typeof identity === "object" && !Array.isArray(identity) ? identity : {};
              const keys = new Set(getAgentIdentityMatchKeys(source, source));
              if (keys.size === 0) {
                return null;
              }
              return [agentCurrentUserIdentity, ...enrichedAgentOwnerCandidateRows].find((candidate) =>
                getAgentIdentityMatchKeys(candidate, candidate).some((key) => keys.has(key))
              ) || null;
            }
            function resolveAgentDetailThreadPersonIdentity(record, fallback = {}) {
              const identity = normalizeAgentPersonIdentity(record, fallback);
              const matchingIdentity = findAgentDetailThreadPersonMatch(identity);
              return matchingIdentity ? mergeAgentPersonIdentities(identity, matchingIdentity) : identity;
            }
            function getAgentDetailThreadTriggeredByIdentity(thread) {
              const parts = getAgentDetailThreadMetadataParts(thread);
              const identitySources = [
                parts.rawThread.triggeredBy,
                parts.rawThread.triggered_by,
                parts.rawThread.createdBy,
                parts.rawThread.created_by,
                parts.rawThread.creator,
                parts.rawThread.author,
                parts.rawThread.user,
                parts.rawThread.actor,
                parts.rawThread.initiator,
                parts.rawThread.requestedBy,
                parts.rawThread.requested_by,
                parts.metadata.triggeredBy,
                parts.metadata.triggered_by,
                parts.metadata.createdBy,
                parts.metadata.created_by,
                parts.metadata.creator,
                parts.metadata.author,
                parts.metadata.user,
                parts.metadata.actor,
                parts.metadata.initiator,
                parts.metadata.requestedBy,
                parts.metadata.requested_by,
                parts.runner.triggeredBy,
                parts.runner.triggered_by,
                parts.runner.createdBy,
                parts.runner.created_by,
                parts.runner.creator,
                parts.runner.author,
                parts.runner.user,
                parts.runner.actor,
                parts.runner.initiator,
                parts.runner.requestedBy,
                parts.runner.requested_by,
              ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
              for (const identitySource of identitySources) {
                const resolvedIdentity = resolveAgentDetailThreadPersonIdentity(identitySource, identitySource);
                const label = getAgentDetailThreadPersonLabel(resolvedIdentity);
                if (label) {
                  return resolvedIdentity;
                }
              }
              const directSources = [
                parts.rawThread,
                parts.metadata,
                parts.runner,
                parts.sourceRecord,
                parts.triggerRecord,
                parts.missionControl,
                parts.agentAssistant,
              ];
              const displayName = readAgentDetailThreadStringFromSources(directSources, [
                "triggeredByDisplayName",
                "triggered_by_display_name",
                "triggeredByName",
                "triggered_by_name",
                "createdByDisplayName",
                "created_by_display_name",
                "createdByName",
                "created_by_name",
                "creatorDisplayName",
                "creator_display_name",
                "creatorName",
                "creator_name",
                "authorName",
                "author_name",
                "userDisplayName",
                "user_display_name",
                "userName",
                "user_name",
                "requestedByName",
                "requested_by_name",
                "operatorName",
                "operator_name",
              ]);
              const email = readAgentDetailThreadStringFromSources(directSources, [
                "triggeredByEmail",
                "triggered_by_email",
                "createdByEmail",
                "created_by_email",
                "creatorEmail",
                "creator_email",
                "authorEmail",
                "author_email",
                "userEmail",
                "user_email",
                "requestedByEmail",
                "requested_by_email",
                "operatorEmail",
                "operator_email",
              ]);
              const identityKey = readAgentDetailThreadStringFromSources(directSources, [
                "triggeredByUserId",
                "triggered_by_user_id",
                "triggeredBy",
                "triggered_by",
                "createdByUserId",
                "created_by_user_id",
                "creatorUserId",
                "creator_user_id",
                "authorUserId",
                "author_user_id",
                "userId",
                "user_id",
                "requestedByUserId",
                "requested_by_user_id",
                "operatorUserId",
                "operator_user_id",
                "createdBy",
                "created_by",
                "creatorId",
                "creator_id",
              ]);
              const keyIsEmail = identityKey.includes("@");
              const resolvedIdentity = resolveAgentDetailThreadPersonIdentity({
                name: displayName,
                email: email || (keyIsEmail ? identityKey : ""),
                userId: keyIsEmail ? "" : identityKey,
                id: identityKey,
              }, {
                name: displayName,
                email,
                userId: keyIsEmail ? "" : identityKey,
                id: identityKey,
              });
              return getAgentDetailThreadPersonLabel(resolvedIdentity) ? resolvedIdentity : null;
            }
            function getAgentDetailThreadTriggeredByLabel(thread) {
              return getAgentDetailThreadPersonLabel(getAgentDetailThreadTriggeredByIdentity(thread)) || "-";
            }
            const agentDetailAllThreadRows = (Array.isArray(agentsHomeThreadRecords) ? agentsHomeThreadRecords : [])
              .map((thread) => ({
                ...normalizeThreadItem(thread),
                rawThread: thread && typeof thread === "object" && !Array.isArray(thread) ? thread : null,
              }))
              .filter((thread) => {
                const threadId = String(thread?.id || "").trim();
                if (!threadId || !selectedAgentThreadId) {
                  return false;
                }
                return readAgentDetailThreadAgentId(thread) === selectedAgentThreadId;
              });
            const agentDetailFilteredThreads = agentDetailAllThreadRows.filter((thread) => {
              const status = resolveThreadDisplayStatus(thread?.status, thread?.completedAt || thread?.finishedAt || thread?.endedAt);
              const normalizedStatus = String(status || "").trim().toLowerCase();
              if (agentDetailThreadFilterMode === "running") {
                return isRunningThreadDisplayStatus(normalizedStatus);
              }
              if (agentDetailThreadFilterMode === "permission") {
                return isPendingPermissionThreadDisplayStatus(normalizedStatus);
              }
              if (agentDetailThreadFilterMode === "completed") {
                return isCompletedThreadStatus(normalizedStatus);
              }
              if (agentDetailThreadFilterMode === "failed") {
                return ["failed", "cancelled", "canceled"].includes(normalizedStatus);
              }
              return true;
            });
            function getAgentDetailThreadSearchText(thread) {
              const threadParts = getSidebarThreadTitleParts(thread);
              const safeThread = threadParts.safeThread || thread;
              const status = resolveThreadDisplayStatus(safeThread?.status, safeThread?.completedAt || safeThread?.finishedAt || safeThread?.endedAt);
              const threadActor = getPlaygroundThreadActorInfo(safeThread, agentDetailThreadsAgentsById, "No agent");
              const taskPreview = getThreadTaskPreview(safeThread);
              return [
                threadParts.displayThreadTitle || safeThread?.title || "",
                safeThread?.id || "",
                threadParts.taskTicketNumber || "",
                threadActor?.name || "",
                status || "",
                taskPreview?.runKind || "",
                getAgentDetailThreadSourceLabel(thread),
                getAgentDetailThreadEnvironmentLabel(thread),
                getAgentDetailThreadTriggeredByLabel(thread),
                formatThreadSearchTimestamp(resolveThreadSortTimestamp(safeThread)) || "",
              ].join(" ");
            }
            const agentDetailThreadTableRowOptions = {
              getSourceLabel: getAgentDetailThreadSourceLabel,
              getEnvironmentLabel: getAgentDetailThreadEnvironmentLabel,
              getTriggeredByLabel: (thread) => getAgentDetailThreadPersonLabel(getAgentDetailThreadTriggeredByIdentity(thread)) || "-",
              getTriggeredByAvatarUrl: (thread) => {
                const identity = getAgentDetailThreadTriggeredByIdentity(thread);
                return normalizeSessionPhotoUrl(identity?.avatarUrl || identity?.photoURL || "");
              },
              getDateLabel: (thread, safeThread) => formatThreadSearchTimestamp(resolveThreadSortTimestamp(safeThread)) || "—",
              onOpenThread: (threadId, safeThread) => {
                handleAgentsHomeThreadOpen(threadId, { threadRecord: safeThread });
              },
              onThreadActions: (event, threadId, safeThread) => {
                if (typeof onThreadActionMenuOpen === "function") {
                  onThreadActionMenuOpen(event, threadId, safeThread);
                  return;
                }
                handleAgentsHomeThreadOpen(threadId, { threadRecord: safeThread });
              },
            };
            const resolvedAgentInsightsTableMode = agentDetailTab === "evaluation"
              ? "evaluations"
              : agentDetailInsightsTableMode;
            const agentInsightsTableTabs = React.createElement(PlatformDetailTabBar, {
              ariaLabel: "Agent insight data",
              value: resolvedAgentInsightsTableMode,
              tabs: [
                { id: "threads", label: "Threads" },
                { id: "evaluations", label: "Evaluations" },
              ],
              onValueChange: (nextMode) => {
                if (agentDetailTab === "evaluation") {
                  setAgentDetailTab("insights");
                }
                setAgentDetailInsightsTableMode(nextMode);
                if (nextMode === "evaluations") {
                  setAgentDetailEvaluationSelectedSetId("");
                }
              },
              variant: "minimal",
              className: "agents-overview-tab-bar playground-agent-insights-table-tabs",
            });
            const emptyAgentThreadsState = React.createElement(PlatformEmptyState, {
              icon: MessageCircle,
              title: "No threads yet",
              description: "Threads started with this agent will appear here.",
            });
            const agentThreadsSection = React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section",
                key: "threads",
                "data-section-id": "threads",
              },
              renderPlaygroundThreadOverviewTable({
                threads: agentDetailFilteredThreads,
                rowOptions: agentDetailThreadTableRowOptions,
                tableOptions: {
                  key: "agent-insights-threads-" + selectedAgentThreadId,
                  ariaLabel: "Threads for " + (draftAgent.name || "agent"),
                  variant: "minimalistic-ui",
                  sorting: {
                    value: agentDetailThreadSorting,
                    onChange: setAgentDetailThreadSorting,
                  },
                  toolbar: {
                    leading: agentInsightsTableTabs,
                    search: {
                      value: agentDetailThreadSearchQuery,
                      onChange: setAgentDetailThreadSearchQuery,
                      placeholder: "Search threads",
                      ariaLabel: "Search agent threads",
                      getSearchText: getAgentDetailThreadSearchText,
                    },
                    filters: [
                      {
                        id: "status",
                        label: "Status",
                        value: agentDetailThreadFilterMode,
                        options: agentDetailThreadFilterOptions,
                        onChange: setAgentDetailThreadFilterMode,
                      },
                    ],
                  },
                  loading: agentsHomeThreadsLoading && agentDetailAllThreadRows.length === 0,
                  error: agentsHomeThreadsError && agentDetailAllThreadRows.length === 0 ? agentsHomeThreadsError : undefined,
                  emptyState: agentDetailThreadFilterMode === "all"
                    ? emptyAgentThreadsState
                    : "No matching agent threads.",
                  noResultsState: "No matching agent threads.",
                },
              })
            );
  ${EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view}          const normalizedAgentDetailTab = agentDetailTab === "threads" || agentDetailTab === "evaluation"
              ? "insights"
              : agentDetailTab === "guardrails"
                ? "settings"
                : agentDetailTab;
  
            const teamSection = isTeamAgent
              ? React.createElement("div", { className: "playground-environments-stack" },
                  React.createElement("div", { className: "playground-agents-team-hint" },
                    React.createElement(Layers, { width: 16, height: 16, strokeWidth: 1.8 }),
                    React.createElement("div", { className: "playground-agents-team-hint-copy" },
                      React.createElement("div", { className: "playground-agents-team-hint-title" }, "Fixed Claude subagent squad"),
                      React.createElement("div", { className: "playground-agents-team-hint-description" }, "Choose one orchestrator and a fixed set of subagents. Squad membership is resolved by the backend and executed with Claude Code subagents.")
                    )
                  ),
                  React.createElement("div", { className: "playground-environments-field-grid" },
                    React.createElement("label", { className: "playground-environments-field" },
                      React.createElement("span", { className: "playground-environments-field-label" }, "Orchestrator"),
                      React.createElement("select", {
                        className: "playground-environments-select",
                        value: draftAgent.teamOrchestratorAgentId || "",
                        onChange: (event) => updateTeamOrchestratorAgent(event.target.value),
                      },
                        React.createElement("option", { value: "" }, "Select orchestrator"),
                        availableTeamMemberAgents.map((agent) =>
                          React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.id)
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-environments-field" },
                      React.createElement("span", { className: "playground-environments-field-label" }, "Execution Mode"),
                      React.createElement("div", { className: "playground-agents-team-readonly" }, "Claude Code Subagents v1")
                    )
                  ),
                  React.createElement("div", { className: "playground-agents-team-members-header" },
                    React.createElement("div", { className: "playground-agents-team-members-title" }, "Subagents"),
                    React.createElement("div", { className: "playground-agents-team-members-copy" }, selectedTeamSubagentIds.length > 0 ? selectedTeamSubagentIds.length + " selected" : "Choose one or more fixed subagents.")
                  ),
                  availableTeamMemberAgents.filter((agent) => agent.id !== draftAgent.teamOrchestratorAgentId).length > 0
                    ? React.createElement("div", { className: "playground-agents-team-grid" },
                        availableTeamMemberAgents
                          .filter((agent) => agent.id !== draftAgent.teamOrchestratorAgentId)
                          .map((agent) => {
                            const isSelected = selectedTeamSubagentIds.includes(agent.id);
                            return React.createElement("button", {
                                key: agent.id,
                                type: "button",
                                className: "playground-agents-team-card" + (isSelected ? " is-selected" : ""),
                                onClick: () => toggleTeamSubagent(agent.id),
                              },
                                React.createElement("div", { className: "playground-agents-team-card-header" },
                                  React.createElement("div", { className: "playground-agents-team-card-title" }, agent.name || agent.id),
                                  isSelected
                                    ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 2 })
                                    : null
                                ),
                                React.createElement("div", { className: "playground-agents-team-card-copy" }, agent.description || agent.id)
                              );
                          })
                      )
                    : React.createElement("div", { className: "playground-environments-muted" }, "Create a few single agents first, then assemble them into a squad here."),
                  selectedTeamSubagentIds.length > 0
                    ? React.createElement("div", { className: "playground-agents-team-selected-list" },
                        selectedTeamSubagentIds.map((agentId) =>
                          React.createElement("span", { key: agentId, className: "playground-agents-team-selected-pill" }, availableTeamMemberAgentsById[agentId]?.name || agentId)
                        )
                      )
  	                  : null
  	              )
  	            : null;
  
            const instructionsSection = React.createElement(PlatformInstructionsEditor, {
              value: draftAgent.instructions || "",
              onChange: (value) => updateAgentField("instructions", value),
              title: agentProfileSection,
              placeholder: isTeamAgent ? "Add Squad Instructions here" : "Add Instructions here",
              ariaLabel: isTeamAgent ? "Squad instructions" : "Agent instructions",
              readOnly: isDefaultAgentConfigurationLocked,
              stickyHeader: !isDefaultAgentConfigurationLocked,
              historyKey: draftAgent.id || "draft-agent",
              variant: "minimalistic-ui",
              className: "playground-agent-detail-instructions-editor",
            });
  
            const agentInsightsSection = React.createElement(React.Fragment, null,
              agentUsageChartSection,
              resolvedAgentInsightsTableMode === "evaluations"
                ? agentEvaluationsSection
                : agentThreadsSection
            );
            const agentAccessTeams = agentSharedTeamIds.map((teamId) => (
              agentShareTeamById.get(String(teamId))
              || {
                id: String(teamId),
                name: "Team",
                kind: "team",
                roleId: "member",
                roleLabel: "Member",
                createdAt: "",
              }
            ));
            const availableAgentAccessTeams = availableAgentShareTeams.filter(
              (team) => !agentSharedTeamIdSet.has(String(team.id))
            );
            const agentAccessAddTeamsControl = !isDefaultAgentConfigurationLocked
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
                  open: agentAccessTeamMenuOpen,
                  onOpenChange: (nextOpen) => {
                    if (
                      nextOpen
                      && typeof onWorkspaceTeamsRequest === "function"
                      && !workspaceTeamsLoading
                    ) {
                      requestAgentWorkspaceTeams();
                    }
                    setAgentAccessTeamMenuOpen(nextOpen);
                  },
                  closeOnSelect: true,
                  popupAriaLabel: "Add teams with agent access",
                  popupAlignment: "right",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupWidth: 240,
                  disabled: Boolean(agentAccessState.action),
                  className: "playground-project-teams-add-shell playground-agent-access-team-menu",
                  popupClassName: "playground-project-teams-menu",
                },
                availableAgentAccessTeams.length
                  ? availableAgentAccessTeams.map((team) => React.createElement("button", {
                      key: team.id,
                      type: "button",
                      role: "menuitem",
                      className: "platform-data-table__menu-item playground-project-teams-menu-row",
                      onClick: () => void handleAddAgentTeamAccess(team),
                    },
                    React.createElement("span", { className: "platform-data-table__menu-icon" },
                      React.createElement(Users, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "platform-data-table__menu-copy" }, team.name)
                  ))
                  : React.createElement("div", {
                      className: "playground-project-teams-menu-empty",
                    }, workspaceTeamsLoading ? "Loading teams..." : "All available teams have access.")
              )
              : null;
            const selectedAgentSystemAccessPrincipal = getPlatformSystemAccessPrincipal(agentAccessPrincipalId);
            const selectedAgentAccessTeam = agentAccessPrincipalId && !selectedAgentSystemAccessPrincipal
              ? agentAccessTeams.find((team) => String(team.id) === String(agentAccessPrincipalId)) || null
              : null;
            const restoreAgentDetailSidebarAfterAccess = () => {
              if (agentDetailSidebarCollapsedBeforeAccessRef.current === null) {
                return;
              }
              const shouldRestoreCollapsed = Boolean(agentDetailSidebarCollapsedBeforeAccessRef.current);
              agentDetailSidebarCollapsedBeforeAccessRef.current = null;
              setAgentDetailSidebarCollapsed(shouldRestoreCollapsed);
            };
            const handleAgentAccessPrincipalChange = (principalId) => {
              const normalizedPrincipalId = String(principalId || "").trim();
              const needsRoleSidebar = Boolean(
                normalizedPrincipalId
                && (
                  !isPlatformSystemAccessPrincipalId(normalizedPrincipalId)
                  || isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId)
                )
              );
              if (needsRoleSidebar) {
                if (agentDetailSidebarCollapsedBeforeAccessRef.current === null) {
                  agentDetailSidebarCollapsedBeforeAccessRef.current = Boolean(agentDetailSidebarCollapsed);
                }
                if (!agentDetailSidebarCollapsed) {
                  setAgentDetailSidebarCollapsed(true);
                }
              } else if (!normalizedPrincipalId) {
                restoreAgentDetailSidebarAfterAccess();
              }
              setAgentAccessRoleId("member");
              setAgentAccessPrincipalId(normalizedPrincipalId);
            };
            const agentSettingsPermissionsSummary = React.createElement(
              PlatformPermissionsSettingsSummary,
              {
                permissionSet: normalizePlaygroundPermissionSet(
                  draftAgent.permissionSet,
                  "agent"
                ),
                animationKey: agentPermissionChartAnimationKey,
                title: "Agent Permissions",
                tooltip: "Controls the permissions this agent has when working.",
                editLabel: "Manage",
                ariaLabel: "Agent permissions overview",
                className: "playground-agent-settings-permissions-summary",
                variant: "default",
                onRingAccessChange: (ringId, access) => {
                  updateDraftAgent((current) => ({
                    ...current,
                    permissionSet: updatePlaygroundPermissionRingAccess(
                      normalizePlaygroundPermissionSet(current.permissionSet, "agent"),
                      ringId,
                      access,
                      "agent"
                    ),
                  }));
                },
                onEdit: () => setAgentDetailTab("permissions"),
              }
            );
            const normalizedAgentSettingsTableMode = agentDetailSettingsTableMode === "guardrails"
              ? "guardrails"
              : "access";
            const agentSettingsTableTabs = React.createElement(PlatformDetailTabBar, {
              ariaLabel: "Agent settings resources",
              value: normalizedAgentSettingsTableMode,
              tabs: [
                { id: "access", label: "Access" },
                { id: "guardrails", label: "Guardrails" },
              ],
              onValueChange: (nextMode) => {
                const normalizedNextMode = nextMode === "guardrails" ? "guardrails" : "access";
                setAgentDetailSettingsTableMode(normalizedNextMode);
                setAgentAccessTeamMenuOpen(false);
                setAgentGuardrailImportPopoverOpen(false);
              },
              variant: "minimal",
              className: "agents-overview-tab-bar playground-agent-settings-table-tabs",
            });
            const agentAccessSettingsSection = React.createElement(PlatformResourceAccessSettings, {
              teams: agentAccessTeams,
              resourceLabel: isTeamAgent ? "Squad" : "Agent",
              selectedPrincipalId: agentAccessPrincipalId,
              onSelectedPrincipalIdChange: handleAgentAccessPrincipalChange,
              subjectType: "agent_resource",
              teamSubjectType: "agent_team_role",
              systemPermissionSet: getPlatformSystemPrincipalPermissionSet(
                getAgentMetadataRecord(draftAgent),
                selectedAgentSystemAccessPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
                "agent_resource"
              ),
              onSystemPermissionSetChange: isDefaultAgentConfigurationLocked
                ? undefined
                : updateAgentSystemAccessPermissionSet,
              systemRolePermissionSet:
                selectedAgentSystemAccessPrincipal &&
                isPlatformRoleScopedSystemAccessPrincipalId(
                  selectedAgentSystemAccessPrincipal.id
                )
                  ? getAgentSystemRolePermissionSet(
                      draftAgent,
                      selectedAgentSystemAccessPrincipal.id,
                      agentAccessRoleId
                    )
                  : null,
              onSystemRolePermissionSetChange: isDefaultAgentConfigurationLocked
                ? undefined
                : updateAgentSystemRoleAccessPermissionSet,
              roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
                id: role.id,
                label: role.label,
                description: role.description,
                meta: (isTeamAgent ? "Squad" : "Agent") + " access",
              })),
              selectedRoleId: agentAccessRoleId,
              onSelectedRoleIdChange: setAgentAccessRoleId,
              teamPermissionSet: selectedAgentAccessTeam
                ? getAgentTeamRolePermissionSet(
                    draftAgent,
                    selectedAgentAccessTeam.id,
                    agentAccessRoleId
                  )
                : null,
              onTeamPermissionSetChange: isDefaultAgentConfigurationLocked
                ? undefined
                : updateAgentTeamRoleAccessPermissionSet,
              animationKey: agentPermissionChartAnimationKey,
              disabled: isDefaultAgentConfigurationLocked,
              backLabel: "Settings",
              className: "playground-agent-access-settings",
              tableProps: {
                className: "playground-agent-access-platform-data-table",
                title: null,
                titleTooltip: "Controls the access levels and permissions users inside teams have when editing or managing this agent.",
                leading: agentSettingsTableTabs,
                trailing: agentAccessAddTeamsControl,
                selectedIds: selectedAgentAccessTeamIds,
                onSelectedIdsChange: setSelectedAgentAccessTeamIds,
                pagination: {},
                busy: Boolean(agentAccessState.action),
                onRemoveTeams: isDefaultAgentConfigurationLocked
                  ? undefined
                  : (teams) => void handleRemoveAgentTeamsAccess(teams),
                formatCreatedAt: (value) => value ? formatPlaygroundFileDate(value) : "—",
                error: agentAccessState.error || null,
              },
            });
            const agentSettingsGuardrailsSection = renderAgentGuardrailsSection({
              key: "settings-guardrails",
              leading: agentSettingsTableTabs,
            });
            const agentSettingsSection = agentAccessPrincipalId
              ? agentAccessSettingsSection
              : React.createElement(
                  React.Fragment,
                  null,
                  agentSettingsPermissionsSummary,
                  normalizedAgentSettingsTableMode === "guardrails"
                    ? agentSettingsGuardrailsSection
                    : agentAccessSettingsSection
                );
            const agentDetailActiveSection = normalizedAgentDetailTab === "permissions"
              ? null
              : normalizedAgentDetailTab === "settings"
                ? agentSettingsSection
              : normalizedAgentDetailTab === "insights"
                ? agentInsightsSection
                : React.createElement(React.Fragment, null,
  	                  isTeamAgent
  	                    ? renderEditorSection("team", "Squad Setup", "", teamSection, null, false)
  	                    : null,
  		                  instructionsSection
 		                );
            const agentDetailWorkspaceSection = React.createElement(AgentDetailPage, {
                sidebar: agentPropertiesSidebar,
                activeTab: normalizedAgentDetailTab,
                sidebarCollapsed: agentDetailSidebarCollapsed,
                sidebarPopoverOpen: Boolean(agentModelPopover || agentOwnerPopoverOpen || agentVoicePopoverOpen),
                permissions: {
                  permissionSet: draftAgent.permissionSet,
                  animationKey: agentPermissionChartAnimationKey,
                  backLabel: "Settings",
                  onBack: () => setAgentDetailTab("settings"),
                  onPermissionSetChange: (permissionSet) => {
                    updateDraftAgent((current) => ({ ...current, permissionSet }));
                  },
                },
                ariaLabel: (isTeamAgent ? "Squad" : "Agent") + " details for " + (draftAgent.name || "Untitled"),
                sidebarAriaLabel: isTeamAgent ? "Squad settings" : "Agent settings",
              },
              agentDetailActiveSection
            );
  
              return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main", ref: agentDetailMainRef },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                  React.createElement("div", { className: "playground-agents-detail-content" + ((normalizedAgentDetailTab === "general" || normalizedAgentDetailTab === "insights" || normalizedAgentDetailTab === "permissions" || normalizedAgentDetailTab === "evaluation" || normalizedAgentDetailTab === "guardrails" || normalizedAgentDetailTab === "settings") ? " is-agent-overview-general" : "") },
                    agentDetailWorkspaceSection
                  ),
  ${EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.modal}              )
              );
          }
  
          const shouldShowAgentsHome = isHomeViewActive || !selectedAgentId;
          const isDraftAgentSelected = selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID && Boolean(draftAgent);
          const selectedAgentAssistantCommandType = draftAgent?.agentType === "team" || agentListMode === "teams" ? "team" : "agent";
          const selectedDraftTeamSubagentIds = isDraftAgentSelected
            ? dedupePlaygroundAgentIds(draftAgent?.teamSubagentIds).filter((value) => value !== String(draftAgent?.teamOrchestratorAgentId || "").trim())
            : [];
          const isDraftAgentCreatable = Boolean(
            isDraftAgentSelected
            && String(draftAgent?.name || "").trim()
            && (
              selectedAgentAssistantCommandType !== "team"
              || (
                String(draftAgent?.teamOrchestratorAgentId || "").trim()
                && selectedDraftTeamSubagentIds.length > 0
              )
            )
          );
          const canShowAgentActions = Boolean(
            !shouldShowAgentsHome
            && !agentCreationSetupOpen
            && draftAgent?.id
            && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
          );
          const canShowAgentAssistant = Boolean(
            !shouldShowAgentsHome
            && !agentCreationSetupOpen
            && draftAgent?.id
            && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            && canVersionPlaygroundAgent(draftAgent)
          );
          const canShowAgentVersions = Boolean(
            !shouldShowAgentsHome
            && !agentCreationSetupOpen
            && draftAgent?.id
            && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            && canVersionPlaygroundAgent(draftAgent)
          );
          useEffect(() => {
            if (!canShowAgentVersions) {
              return undefined;
            }
  
            function handleAgentVersionKeyboardShortcut(event) {
              const isCommandShortcut = Boolean(event.metaKey || event.ctrlKey);
              if (!isCommandShortcut || event.altKey) {
                return;
              }
              const key = String(event.key || "").toLowerCase();
              if (key !== "s" && key !== "p") {
                return;
              }
  
              event.preventDefault();
              event.stopPropagation();
  	            if (saveState.isSaving || agentVersionState.status === "loading") {
  	              return;
  	            }
              if (agentVersionModal || agentVersionSaveDialog) {
  	              return;
  	            }
  
              if (hasDraftAgentVersionChanges()) {
                openAgentVersionSaveDialog({
                  mode: event.shiftKey ? "new" : undefined,
                });
              }
            }
  
            window.addEventListener("keydown", handleAgentVersionKeyboardShortcut, true);
            return () => window.removeEventListener("keydown", handleAgentVersionKeyboardShortcut, true);
          }, [
            agentVersionModal,
            agentVersionSaveDialog,
            agentVersionState.status,
            canShowAgentVersions,
            draftAgent,
            saveState.isSaving,
          ]);
          const isAgentActionTargetConfigurationLocked =
            isPlaygroundDefaultAgentConfigurationLocked(draftAgent);
          const isProtectedAgentRenameTarget = Boolean(
            isAgentActionTargetConfigurationLocked
            || (
              (draftAgent?.isDefault || draftAgent?.isSystem)
              && !isPlaygroundFunctionalAgent(draftAgent)
            )
          );
          const isProtectedAgentDeleteTarget = Boolean(
            draftAgent?.isDefault
            || draftAgent?.isSystem
            || isAgentActionTargetConfigurationLocked
          );
          const agentsTitleActions = titleActionsContainer && canShowAgentActions
            ? createPortal(
                React.createElement(PlatformPopup, {
                    open: agentActionsPopoverOpen,
                    rootRef: agentActionsPopoverRef,
                    surfaceRef: agentActionsPopoverSurfaceRef,
                    rootClassName: "playground-agent-title-actions-shell",
                    surfaceClassName: "playground-agent-title-actions-popup",
                    surfaceProps: {
                      role: "menu",
                      "aria-label": "Agent actions",
                      width: 360,
                      maxWidth: "calc(100vw - 16px)",
                    },
                    animation: "down-in",
                    variant: "minimal",
                    portal: true,
                    placement: "bottom-start",
                    trigger: React.createElement(PlatformIconButton, {
                      type: "button",
                      size: "compact",
                      active: agentActionsPopoverOpen,
                      title: "Agent actions",
                      "aria-label": "Agent actions",
                      "aria-haspopup": "menu",
                      "aria-expanded": agentActionsPopoverOpen ? "true" : "false",
                      disabled: saveState.isSaving,
                      onClick: (event) => {
                        event.stopPropagation();
                        setAgentActionsPopoverOpen((current) => !current);
                      },
                    }, React.createElement(Ellipsis, { width: 14, height: 14, strokeWidth: 1.8 }))
                  },
                  React.createElement("div", { className: "playground-agents-detail-action-menu-meta" },
                    [
                      ["ID", draftAgent.id || "Unsaved agent"],
                      ["Created", formatPlaygroundFileDate(draftAgent.createdAt)],
                      ["Updated", formatPlaygroundFileDate(draftAgent.updatedAt)],
                    ].map(([label, value]) =>
                      React.createElement("div", { key: label, className: "playground-agents-detail-action-menu-meta-row" },
                        React.createElement("span", { className: "playground-agents-detail-action-menu-meta-label" }, label),
                        React.createElement("span", {
                          className: "playground-agents-detail-action-menu-meta-value"
                            + (label === "ID" ? " is-id" : ""),
                          title: value,
                        }, value)
                      )
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setAgentActionsPopoverOpen(false);
                      openAgentSendToTeamModal(draftAgent);
                    },
                    disabled: saveState.isSaving || isAgentActionTargetConfigurationLocked,
                  },
                    React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "tb-popup-label" }, "Send to Team")
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setAgentActionsPopoverOpen(false);
                      openAgentApiModal();
                    },
                    disabled: saveState.isSaving,
                  },
                    React.createElement(Code, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "tb-popup-label" }, "Use via API")
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setAgentActionsPopoverOpen(false);
                      openCurrentAgentCopyModal();
                    },
                    disabled: saveState.isSaving,
                  },
                    React.createElement(Split, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "tb-popup-label" }, "Copy Agent")
                  ),
                  React.createElement("div", { className: "playground-agent-title-actions-divider", "aria-hidden": "true" }),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setAgentActionsPopoverOpen(false);
                      openAgentRenameDialog(draftAgent);
                    },
                    disabled: saveState.isSaving || isProtectedAgentRenameTarget,
                  },
                    React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "tb-popup-label" }, "Rename")
                  ),
                  React.createElement("button", {
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => {
                      setAgentActionsPopoverOpen(false);
                      void handleDeleteAgent(draftAgent.id);
                    },
                    disabled: saveState.isSaving || isProtectedAgentDeleteTarget,
                  },
                    React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "tb-popup-label" }, "Delete")
                  )
                ),
                titleActionsContainer
              )
            : null;
          const agentInsightsTimeframeControl = !agentVersionChangesState
            && ["insights", "threads", "evaluation"].includes(agentDetailTab)
            ? React.createElement(PlatformSwitch, {
                className: "playground-agent-detail-header-timeframe",
                value: normalizedAgentDetailPerformanceRange,
                options: agentDetailPerformanceRangeOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                })),
                onValueChange: setAgentDetailPerformanceRange,
                ariaLabel: "Agent analytics time frame",
              })
            : null;
          const agentsTopNavActions = topNavActionsContainer
            && !shouldShowAgentsHome
            && !agentCreationSetupOpen
            ? createPortal(
                React.createElement(React.Fragment, null,
                  agentInsightsTimeframeControl,
                  !agentVersionChangesState
                    ? renderAgentPublishAction()
                    : null
                ),
                topNavActionsContainer
              )
            : null;
          const agentDetailLayoutClass = "playground-agents-detail-layout"
            + (canShowAgentAssistant ? " has-assistant" : "")
            + (canShowAgentAssistant && agentAssistantOpen && !agentVersionsSidebarOpen ? " is-assistant-open" : "");
  
