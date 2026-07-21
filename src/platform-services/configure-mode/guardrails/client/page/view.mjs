export const GUARDRAILS_PAGE_VIEW_SCRIPT = `          const listContent = renderGuardrailsTable();
          const isGuardrailsDetailPage = guardrailsPageMode === "detail" && selectedGuardrailSet;
          if (!isGuardrailsDetailPage) {
            return listContent;
          }

          const guardrailCreatorIdentity = getGuardrailCreatorIdentity(selectedGuardrailSet);
          const guardrailCreatorLabel = String(
            guardrailCreatorIdentity.name
            || guardrailCreatorIdentity.email
            || guardrailCreatorIdentity.id
            || "Unknown"
          ).trim();
          const guardrailCreatorInitial = guardrailCreatorLabel.slice(0, 1).toUpperCase() || "?";
          const renderGuardrailDetailSidebarRow = (key, label, value, options = {}) =>
            React.createElement("div", {
                key,
                className: "playground-guardrails-detail-sidebar-row" + (options.className ? " " + options.className : ""),
              },
              React.createElement("span", { className: "playground-guardrails-detail-sidebar-label" }, label),
              React.createElement(options.control ? "div" : "span", {
                className: "playground-guardrails-detail-sidebar-value",
                title: options.title || (typeof value === "string" ? value : undefined),
              }, value)
            );
          const guardrailCreatorValue = React.createElement("span", {
              className: "playground-guardrails-detail-creator",
            },
            React.createElement("span", {
                className: "playground-guardrails-creator-avatar" + (guardrailCreatorIdentity.isSystem ? " is-system" : ""),
                "aria-hidden": "true",
              },
              guardrailCreatorIdentity.avatarUrl
                ? React.createElement("img", { src: guardrailCreatorIdentity.avatarUrl, alt: "" })
                : guardrailCreatorInitial
            ),
            React.createElement("span", { className: "playground-guardrails-detail-creator-name" }, guardrailCreatorLabel)
          );
          const guardrailOwnerIdentity = getGuardrailOwnerIdentity(selectedGuardrailSet);
          const guardrailOwnerLabel = String(
            guardrailOwnerIdentity.name
            || guardrailOwnerIdentity.email
            || guardrailOwnerIdentity.id
            || "Owner"
          ).trim();
          const guardrailOwnerCandidates = getGuardrailOwnerCandidates(selectedGuardrailSet);
          const guardrailOwnerOptions = guardrailOwnerCandidates.map((candidate) => {
            const value = getGuardrailOwnerCandidateKey(candidate);
            const label = String(candidate.name || candidate.email || "Team member").trim();
            const description = candidate.email && label.toLowerCase() !== candidate.email.toLowerCase()
              ? candidate.email
              : Array.isArray(candidate.teamNames) && candidate.teamNames.length
                ? candidate.teamNames.join(", ")
                : "";
            return {
              value,
              label,
              description: description || undefined,
              ariaLabel: description ? label + ", " + description : label,
              leading: React.createElement(AccountAvatar, {
                className: "playground-agents-detail-owner-option-avatar",
                imageClassName: "playground-agents-detail-owner-option-avatar-image",
                fallbackLabel: getAccountInitials(label),
                photoUrl: candidate.avatarUrl || "",
              }),
              candidate,
            };
          });
          const guardrailOwnerIdentityKeys = new Set(getGuardrailPersonIdentityKeys(guardrailOwnerIdentity));
          const selectedGuardrailOwnerOption = guardrailOwnerOptions.find((option) =>
            getGuardrailPersonIdentityKeys(option.candidate).some((key) => guardrailOwnerIdentityKeys.has(key))
          ) || null;
          const guardrailOwnerCandidateState = guardrailOwnerCandidateStateBySetId?.[selectedGuardrailSet.id] || {};
          const guardrailOwnerSelector = React.createElement(PlatformSelector, {
            value: selectedGuardrailOwnerOption?.value || getGuardrailOwnerCandidateKey(guardrailOwnerIdentity),
            options: guardrailOwnerOptions,
            open: guardrailOwnerSelectorOpen,
            onOpenChange: handleGuardrailOwnerSelectorOpenChange,
            onValueChange: (nextValue) => {
              const nextOwner = guardrailOwnerOptions.find((option) => option.value === nextValue)?.candidate;
              if (nextOwner) updateGuardrailOwner(nextOwner);
            },
            ariaLabel: "Choose guardrail owner",
            label: React.createElement("span", { className: "playground-guardrails-detail-owner-value" },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar playground-guardrails-detail-owner-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(guardrailOwnerLabel),
                photoUrl: guardrailOwnerIdentity.avatarUrl || "",
              }),
              React.createElement("span", {
                className: "playground-guardrails-detail-owner-name",
                title: guardrailOwnerIdentity.email
                  ? guardrailOwnerLabel + " · " + guardrailOwnerIdentity.email
                  : guardrailOwnerLabel,
              }, guardrailOwnerLabel)
            ),
            alignment: "end",
            popupAlignment: "right",
            disabled: selectedGuardrailSetReadonly || !isCurrentGuardrailOwner(selectedGuardrailSet),
            loading: guardrailOwnerCandidateState.status === "loading",
            loadingContent: "Loading team members...",
            emptyContent: "No human team members are available.",
            popupWidth: 260,
            popupMaxHeight: "min(320px, calc(100vh - 180px))",
            className: "playground-guardrails-detail-owner-selector",
            triggerClassName: "playground-guardrails-detail-owner-trigger",
            popupClassName: "playground-agents-detail-owner-menu playground-guardrails-detail-owner-menu",
            optionClassName: "playground-agents-detail-owner-option",
          });
          const guardrailDetailHeader = React.createElement("div", {
              className: "playground-guardrails-detail-header-copy",
            },
            React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-guardrails-detail-back-button",
                onClick: returnToGuardrailsOverview,
                title: "Back to guardrails",
                "aria-label": "Back to guardrails",
              },
              React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.8, "aria-hidden": "true" })
            ),
            React.createElement("input", {
              ref: guardrailTitleInputRef,
              type: "text",
              className: "playground-content-title playground-guardrails-title-input",
              value: selectedGuardrailSet.name || "",
              placeholder: "Untitled Guardrail Set",
              readOnly: selectedGuardrailSetReadonly,
              disabled: selectedGuardrailSetReadonly,
              onChange: (event) => updateGuardrailSet(selectedGuardrailSet.id, { name: event.target.value }),
              "aria-label": "Guardrail set name",
            })
          );
          const guardrailDetailHeaderActions = selectedGuardrailSetReadonly
            ? React.createElement("span", { className: "playground-guardrails-readonly-pill" }, "Default Set")
            : null;
          const guardrailDetailProperties = React.createElement("div", {
              className: "playground-guardrails-detail-sidebar-list",
            },
            renderGuardrailDetailSidebarRow(
              "type",
              "Type",
              selectedGuardrailSetReadonly ? "Default set" : "Custom set"
            ),
            renderGuardrailDetailSidebarRow("creator", "Creator", guardrailCreatorValue, {
              className: "is-creator",
              title: guardrailCreatorLabel,
            }),
            renderGuardrailDetailSidebarRow("owner", "Owner", guardrailOwnerSelector, {
              className: "is-owner",
              control: true,
            }),
            renderGuardrailDetailSidebarRow(
              "prompts",
              "Prompts",
              String(selectedGuardrailPrompts.length)
            ),
            renderGuardrailDetailSidebarRow(
              "created",
              "Created",
              formatGuardrailDate(selectedGuardrailSet.createdAt)
            ),
            renderGuardrailDetailSidebarRow(
              "updated",
              "Updated",
              formatGuardrailDate(selectedGuardrailSet.updatedAt)
            )
          );
          const guardrailDetailActions = selectedGuardrailSetReadonly
            ? null
            : React.createElement("div", { className: "playground-guardrails-detail-sidebar-actions" },
                React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-guardrails-detail-sidebar-action",
                    onClick: openGuardrailShareTeamModal,
                  },
                  React.createElement("span", {
                      className: "playground-project-overview-sidebar-resource-icon",
                      "aria-hidden": "true",
                    },
                    React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.85 })
                  ),
                  React.createElement("span", {
                    className: "playground-project-overview-sidebar-resource-label",
                  }, "Share with Team")
                ),
                React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-guardrails-detail-sidebar-action",
                    onClick: () => {
                      setGuardrailPublishMenuOpen(false);
                      setGuardrailVersionsHeaderMenuOpen(false);
                      setGuardrailVersionsSidebarOpen(true);
                    },
                  },
                  React.createElement("span", {
                      className: "playground-project-overview-sidebar-resource-icon",
                      "aria-hidden": "true",
                    },
                    React.createElement(History, { width: 14, height: 14, strokeWidth: 1.85 })
                  ),
                  React.createElement("span", {
                    className: "playground-project-overview-sidebar-resource-label",
                  }, "Version history")
                )
              );
          const guardrailDescriptionSection = React.createElement(PlatformInstructionsEditor, {
            value: selectedGuardrailSet.description || "",
            onChange: (value) => updateGuardrailSet(selectedGuardrailSet.id, { description: value }),
            title: "Description",
            placeholder: "Add description here",
            ariaLabel: "Guardrail description",
            readOnly: selectedGuardrailSetReadonly,
            stickyHeader: !selectedGuardrailSetReadonly,
            historyKey: selectedGuardrailSet.id || "guardrail",
            className: "playground-guardrails-description-section",
          });
          const guardrailPromptsSection = React.createElement("section", {
              className: "playground-guardrails-prompts-section",
            },
            React.createElement("div", { className: "playground-guardrails-prompts-header" },
              React.createElement("div", { className: "playground-guardrails-prompts-title" },
                React.createElement("span", null, "Prompts")
              ),
              selectedGuardrailSetReadonly
                ? null
                : React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "small",
                    className: "playground-guardrails-prompt-add-button",
                    onClick: () => addGuardrailPrompt(selectedGuardrailSet.id),
                  },
                  React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  React.createElement("span", null, "Prompt")
                )
            ),
            React.createElement("div", { className: "playground-guardrails-prompts-list" },
              selectedGuardrailPrompts.length === 0
                ? React.createElement("div", { className: "playground-guardrails-prompt-empty" }, "No prompts in this set.")
                : selectedGuardrailPrompts.map((prompt) =>
                    React.createElement("div", {
                        key: prompt.id,
                        className: "playground-tasks-backlog-item playground-guardrails-prompt-row",
                      },
                      React.createElement("div", { className: "playground-guardrails-prompt-card-header" },
                        React.createElement("input", {
                          type: "text",
                          className: "playground-guardrails-prompt-title-input",
                          value: prompt.title || "",
                          placeholder: "Untitled prompt",
                          readOnly: selectedGuardrailSetReadonly,
                          "aria-label": "Prompt title",
                          onChange: (event) => updateGuardrailPrompt(selectedGuardrailSet.id, prompt.id, { title: event.target.value }),
                        }),
                        selectedGuardrailSetReadonly
                          ? null
                          : React.createElement("button", {
                              type: "button",
                              className: "playground-guardrails-prompt-delete",
                              onClick: () => deleteGuardrailPrompt(selectedGuardrailSet.id, prompt.id),
                              "aria-label": "Delete prompt",
                            },
                            React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 })
                          )
                      ),
                      React.createElement(PlatformInstructionsEditor, {
                        variant: "minimalistic-ui",
                        title: "Prompt text",
                        value: prompt.prompt || "",
                        onChange: (value) => updateGuardrailPrompt(selectedGuardrailSet.id, prompt.id, { prompt: value }),
                        placeholder: "Add prompt text here",
                        ariaLabel: "Prompt text for " + String(prompt.title || "untitled prompt"),
                        readOnly: selectedGuardrailSetReadonly,
                        stickyHeader: false,
                        historyKey: "guardrail-prompt:" + selectedGuardrailSet.id + ":" + prompt.id,
                        className: "playground-guardrails-prompt-editor",
                      })
                    )
                  )
            )
          );
          const guardrailDetailContent = React.createElement("div", {
              className: "playground-guardrails-editor",
            },
            guardrailDescriptionSection,
            guardrailPromptsSection
          );
          const handleGuardrailDetailTabChange = (nextTab) => {
            const normalizedTab = ["general", "evaluation", "settings"].includes(String(nextTab || ""))
              ? String(nextTab)
              : "general";
            setGuardrailDetailTab(normalizedTab);
            setGuardrailAccessMenuOpen(false);
            if (normalizedTab !== "settings") {
              setGuardrailAccessTeamId("");
            }
            if (normalizedTab === "evaluation") {
              void loadGuardrailEvaluationData();
            }
            if (normalizedTab === "settings" && !teamPageLoading && !guardrailWorkspaceTeams.length && typeof loadTeamPageData === "function") {
              void loadTeamPageData({ selectedTeamId: "" });
            }
          };
          const guardrailDetailActiveContent = guardrailDetailTab === "evaluation"
            ? renderGuardrailEvaluationSection()
            : guardrailDetailTab === "settings"
              ? renderGuardrailAccessSettings()
              : guardrailDetailContent;
          const guardrailDetailSidebarToggle = React.createElement("button", {
              type: "button",
              className: "playground-project-overview-sidebar-toggle",
              onClick: () => setGuardrailDetailSidebarCollapsed((current) => !current),
              title: guardrailDetailSidebarCollapsed ? "Show guardrail sidebar" : "Hide guardrail sidebar",
              "aria-label": guardrailDetailSidebarCollapsed ? "Show guardrail sidebar" : "Hide guardrail sidebar",
              "aria-pressed": guardrailDetailSidebarCollapsed ? "true" : "false",
            },
            React.createElement(PanelRight, {
              width: 15,
              height: 15,
              strokeWidth: 1.8,
              "aria-hidden": "true",
            })
          );
          const guardrailTopNavPublishPortal = guardrailDetailTopNavActionsContainer
            && !selectedGuardrailSetReadonly
            && !guardrailVersionChangesState
            && typeof createPortal === "function"
              ? createPortal(
                  renderGuardrailPublishSplitButton(),
                  guardrailDetailTopNavActionsContainer
                )
              : null;

          return React.createElement("section", {
              className: "playground-files-page playground-guardrails-page playground-guardrails-detail-page-host",
              onKeyDownCapture: handleGuardrailsKeyboardShortcuts,
            },
            React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
              React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
                React.createElement("div", {
                    className: "playground-files-browser-body playground-guardrails-browser-body is-detail-page",
                  },
                  guardrailVersionChangesState
                    ? React.createElement("div", {
                        className: "playground-guardrails-detail playground-guardrails-version-changes-shell",
                      }, renderGuardrailVersionChangesPage())
                    : React.createElement(GuardrailDetailPage, {
                        header: guardrailDetailHeader,
                        headerActions: guardrailDetailHeaderActions,
                        activeTab: guardrailDetailTab,
                        onTabChange: handleGuardrailDetailTabChange,
                        sidebarToggle: guardrailDetailSidebarToggle,
                        sidebarCollapsed: guardrailDetailSidebarCollapsed,
                        actions: guardrailDetailActions,
                        properties: guardrailDetailProperties,
                      }, guardrailDetailActiveContent)
                )
              ),
              guardrailTopNavPublishPortal,
              renderGuardrailShareTeamModal(),
              renderGuardrailVersionModal(),
              renderGuardrailVersionSaveDialog(),
              renderGuardrailVersionsSidebarPortal()
            )
          );
        }

`;
