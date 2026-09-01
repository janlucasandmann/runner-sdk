export const GUARDRAILS_PAGE_VIEW_SCRIPT = `          const listContent = renderGuardrailsTable();
          const isGuardrailsDetailPage = guardrailsPageMode === "detail" && selectedGuardrailSet;
          if (!isGuardrailsDetailPage) {
            return React.createElement(React.Fragment, null,
              guardrailVersionNavigationGuard,
              listContent
            );
          }

          const guardrailCreatorIdentity = getGuardrailCreatorIdentity(selectedGuardrailSet);
          const guardrailResourceMetadata = selectedGuardrailSet?.metadata
            && typeof selectedGuardrailSet.metadata === "object"
            && !Array.isArray(selectedGuardrailSet.metadata)
              ? selectedGuardrailSet.metadata
              : {};
          const guardrailDeploymentRegion = String(
            guardrailResourceMetadata.deploymentRegion
            || guardrailResourceMetadata.region
            || guardrailResourceMetadata.location
            || "europe-west1"
          ).trim() || "europe-west1";
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
                className: "playground-project-overview-sidebar-row" + (options.className ? " " + options.className : ""),
              },
              React.createElement("div", {
                className: "playground-project-overview-sidebar-row-label",
              }, label),
              React.createElement("div", {
                className: "playground-project-overview-sidebar-row-value" + (options.valueClassName ? " " + options.valueClassName : ""),
                title: options.title || (typeof value === "string" ? value : undefined),
              }, value)
            );
          const renderGuardrailDetailIdentityValue = (identity, fallbackLabel = "Unknown") => {
            const label = String(
              identity?.name || identity?.email || identity?.id || fallbackLabel
            ).trim() || fallbackLabel;
            return React.createElement("span", {
                className: "playground-team-member-cell guardrail-detail-page__identity-value",
              },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(label),
                photoUrl: String(identity?.avatarUrl || ""),
              }),
              React.createElement("span", { className: "playground-team-member-copy" },
                React.createElement("span", {
                  className: "playground-team-table-title",
                  title: label,
                }, label)
              )
            );
          };
          const guardrailCreatorValue = renderGuardrailDetailIdentityValue(
            guardrailCreatorIdentity,
            guardrailCreatorInitial
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
              name: label,
              email: candidate.email || "",
              avatarUrl: candidate.avatarUrl || "",
              description: description || undefined,
              ariaLabel: description ? label + ", " + description : label,
              data: { candidate },
            };
          });
          const guardrailOwnerIdentityKeys = new Set(getGuardrailPersonIdentityKeys(guardrailOwnerIdentity));
          const selectedGuardrailOwnerOption = guardrailOwnerOptions.find((option) =>
            getGuardrailPersonIdentityKeys(option.data?.candidate).some((key) => guardrailOwnerIdentityKeys.has(key))
          ) || null;
          const guardrailOwnerCandidateState = guardrailOwnerCandidateStateBySetId?.[selectedGuardrailSet.id] || {};
          const guardrailOwnerSelector = React.createElement(PlatformOwnerSelector, {
            owner: {
              value: selectedGuardrailOwnerOption?.value || getGuardrailOwnerCandidateKey(guardrailOwnerIdentity),
              name: guardrailOwnerLabel,
              email: guardrailOwnerIdentity.email || "",
              avatarUrl: guardrailOwnerIdentity.avatarUrl || "",
            },
            options: guardrailOwnerOptions,
            open: guardrailOwnerSelectorOpen,
            onOpenChange: handleGuardrailOwnerSelectorOpenChange,
            onTransfer: (_nextValue, option) => {
              const nextOwner = option?.data?.candidate;
              if (nextOwner) updateGuardrailOwner(nextOwner);
            },
            ariaLabel: "Choose guardrail owner",
            resourceLabel: "guardrail",
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
          const guardrailScopeProjectId = String(
            selectedGuardrailSet.projectId
            || selectedGuardrailSet.project_id
            || guardrailResourceMetadata.projectId
            || guardrailResourceMetadata.project_id
            || ""
          ).trim();
          const guardrailSettings = {
            ariaLabel: "Guardrail settings",
            className: "guardrail-detail-page__settings-content",
            identity: {
              icon: React.createElement(Shield, {
                width: 24,
                height: 24,
                strokeWidth: 1.8,
                "aria-hidden": "true",
              }),
              title: String(selectedGuardrailSet.name || "Untitled Guardrail Set"),
              description: String(selectedGuardrailSet.description || ""),
              onTitleChange: selectedGuardrailSetReadonly
                ? undefined
                : (value) => updateGuardrailSet(selectedGuardrailSet.id, { name: value }),
              onDescriptionChange: selectedGuardrailSetReadonly
                ? undefined
                : (value) => updateGuardrailSet(selectedGuardrailSet.id, { description: value }),
              titlePlaceholder: "Untitled Guardrail Set",
              descriptionPlaceholder: "Describe when this guardrail should be applied.",
              titleAriaLabel: "Guardrail set name",
              descriptionAriaLabel: "Guardrail description",
              readOnly: selectedGuardrailSetReadonly,
              trailing: selectedGuardrailSetReadonly
                ? React.createElement(PlatformLabel, { variant: "gray" }, "Default Set")
                : null,
            },
            details: {
              variant: "standard",
              customAttributes: [
                {
                  id: "status",
                  label: "Status",
                  value: React.createElement(PlatformLabel, { variant: "green" }, "Active"),
                },
                {
                  id: "prompts",
                  label: "Prompts",
                  value: String(selectedGuardrailPrompts.length),
                },
                {
                  id: "created",
                  label: "Created",
                  value: formatGuardrailDate(selectedGuardrailSet.createdAt),
                },
              ],
              updatedAt: selectedGuardrailSet.updatedAt || selectedGuardrailSet.createdAt,
              creator: {
                value: String(
                  guardrailCreatorIdentity.id
                  || guardrailCreatorIdentity.userId
                  || guardrailCreatorIdentity.email
                  || "guardrail-creator"
                ),
                name: guardrailCreatorLabel,
                email: String(guardrailCreatorIdentity.email || ""),
                avatarUrl: String(guardrailCreatorIdentity.avatarUrl || ""),
              },
              owner: {
                value: selectedGuardrailOwnerOption?.value || getGuardrailOwnerCandidateKey(guardrailOwnerIdentity),
                name: guardrailOwnerLabel,
                email: String(guardrailOwnerIdentity.email || ""),
                avatarUrl: String(guardrailOwnerIdentity.avatarUrl || ""),
              },
              ownerOptions: guardrailOwnerOptions,
              onOwnerTransfer: (_nextValue, option) => {
                const nextOwner = option?.data?.candidate;
                if (nextOwner) updateGuardrailOwner(nextOwner);
              },
              ownerSelectorProps: {
                open: guardrailOwnerSelectorOpen,
                onOpenChange: handleGuardrailOwnerSelectorOpenChange,
                ariaLabel: "Choose guardrail owner",
                resourceLabel: "guardrail",
                alignment: "end",
                popupAlignment: "right",
                disabled: selectedGuardrailSetReadonly || !isCurrentGuardrailOwner(selectedGuardrailSet),
                loading: guardrailOwnerCandidateState.status === "loading",
                loadingContent: "Loading team members...",
                emptyContent: "No human team members are available.",
                popupWidth: 260,
                popupMaxHeight: "min(320px, calc(100vh - 180px))",
              },
              scope: guardrailScopeProjectId ? {
                values: [guardrailScopeProjectId],
                options: [{
                  value: guardrailScopeProjectId,
                  label: String(
                    selectedGuardrailSet.projectName
                    || selectedGuardrailSet.project_name
                    || guardrailResourceMetadata.projectName
                    || guardrailResourceMetadata.project_name
                    || guardrailScopeProjectId
                  ),
                  leading: React.createElement(FolderOpen, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                }],
                disabled: true,
              } : {},
              primaryActions: [{
                id: "run-evaluation",
                label: "Run Evaluation",
                onSelect: () => setGuardrailDetailTab("evaluation"),
              }],
              className: "guardrail-detail-page__properties-card",
            },
            location: React.createElement(PlatformDeploymentMap, {
              regionCode: guardrailDeploymentRegion,
              title: "Deployment region",
              className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map guardrail-detail-page__deployment-map",
            }),
            access: renderGuardrailAccessSettings(),
            accessDetailOpen: Boolean(guardrailAccessTeamId),
            detailsSidebarCollapsed: guardrailDetailSidebarCollapsed,
            detailsSidebarAriaLabel: "Guardrail properties",
            detailsSidebarClassName: "guardrail-detail-page__sidebar",
          };
          const guardrailMetadataSection = React.createElement("section", {
              className: "guardrail-detail-page__identity",
              "aria-label": "Guardrail identity",
            },
            React.createElement("span", {
                className: "guardrail-detail-page__icon",
                "aria-hidden": "true",
              },
              React.createElement(Shield, { width: 24, height: 24, strokeWidth: 1.8 })
            ),
            React.createElement("div", { className: "guardrail-detail-page__identity-copy" },
            React.createElement("input", {
              ref: guardrailTitleInputRef,
              type: "text",
              className: "guardrail-detail-page__name-input",
              value: selectedGuardrailSet.name || "",
              placeholder: "Untitled Guardrail Set",
              readOnly: selectedGuardrailSetReadonly,
              onChange: (event) => updateGuardrailSet(selectedGuardrailSet.id, { name: event.target.value }),
              "aria-label": "Guardrail set name",
            }),
            React.createElement("input", {
              type: "text",
              className: "file-resource-detail-page__description-input guardrail-detail-page__description-input",
              value: selectedGuardrailSet.description || "",
              placeholder: "Describe when this guardrail should be applied.",
              readOnly: selectedGuardrailSetReadonly,
              onChange: (event) => updateGuardrailSet(selectedGuardrailSet.id, { description: event.target.value }),
              "aria-label": "Guardrail description",
            })
            ),
            selectedGuardrailSetReadonly
              ? React.createElement(PlatformLabel, {
                  variant: "gray",
                  className: "guardrail-detail-page__default-label",
                }, "Default Set")
              : null
          );
          const guardrailPromptFiles = selectedGuardrailPrompts.map((prompt, index) => {
            const title = String(prompt?.title || "Prompt " + (index + 1)).trim() || "Untitled prompt";
            return {
              id: String(prompt.id),
              label: title,
              tabLabel: title,
              editorMode: "markdown",
              icon: React.createElement(MessageSquareText, { width: 14, height: 14, strokeWidth: 1.8 }),
              selectable: !selectedGuardrailSetReadonly,
              renameDisabled: selectedGuardrailSetReadonly,
              deleteDisabled: selectedGuardrailSetReadonly,
              moveDisabled: true,
            };
          });
          const activeGuardrailPrompt = selectedGuardrailPrompts.find((prompt) => prompt?.id === guardrailActivePromptId)
            || selectedGuardrailPrompts[0]
            || null;
          const renameGuardrailPromptFile = (file, nextTitle) => {
            if (selectedGuardrailSetReadonly || !file?.id) return;
            const prompt = selectedGuardrailPrompts.find((candidate) => candidate?.id === file.id);
            if (!prompt) return;
            const normalizedTitle = String(nextTitle || "").trim();
            if (!normalizedTitle || normalizedTitle === String(prompt.title || "").trim()) return;
            updateGuardrailPrompt(selectedGuardrailSet.id, prompt.id, { title: normalizedTitle });
          };
          const deleteGuardrailPromptFiles = (files) => {
            if (selectedGuardrailSetReadonly || !Array.isArray(files) || !files.length) return;
            const deletedIds = new Set(files.map((file) => String(file?.id || "")).filter(Boolean));
            const remainingPrompts = selectedGuardrailPrompts.filter((prompt) => !deletedIds.has(String(prompt?.id || "")));
            if (activeGuardrailPrompt && deletedIds.has(String(activeGuardrailPrompt.id))) {
              setGuardrailActivePromptId(String(remainingPrompts[0]?.id || ""));
            }
            updateGuardrailSet(selectedGuardrailSet.id, (set) => ({
              ...set,
              prompts: (Array.isArray(set.prompts) ? set.prompts : [])
                .filter((prompt) => !deletedIds.has(String(prompt?.id || ""))),
            }));
          };
          const guardrailGeneralWorkspace = React.createElement(PlatformCodeEditorWorkspace, {
            className: "guardrail-detail-page__prompt-workspace",
            ariaLabel: (selectedGuardrailSet.name || "Guardrail") + " prompt editor",
            variant: "full-screen",
            sidebarTitle: "Prompts",
            files: guardrailPromptFiles,
            activeFileId: activeGuardrailPrompt?.id || "",
            onFileSelect: setGuardrailActivePromptId,
            onFileRename: selectedGuardrailSetReadonly ? undefined : renameGuardrailPromptFile,
            onFilesDelete: selectedGuardrailSetReadonly ? undefined : deleteGuardrailPromptFiles,
            onCreateFile: selectedGuardrailSetReadonly
              ? undefined
              : () => addGuardrailPrompt(selectedGuardrailSet.id),
            createFileLabel: "Create Prompt",
            createFileButtonLabel: "Add prompt",
            emptyFiles: selectedGuardrailSetReadonly
              ? "No prompts are exposed for this guardrail."
              : "No prompts yet. Use the plus button to add one.",
            emptyEditor: "Select a prompt to edit.",
            markdownEditor: activeGuardrailPrompt
              ? {
                  value: activeGuardrailPrompt.prompt || "",
                  title: React.createElement("input", {
                    type: "text",
                    className: "guardrail-detail-page__prompt-title-input",
                    value: activeGuardrailPrompt.title || "",
                    placeholder: "Untitled prompt",
                    readOnly: selectedGuardrailSetReadonly,
                    onChange: (event) => updateGuardrailPrompt(
                      selectedGuardrailSet.id,
                      activeGuardrailPrompt.id,
                      { title: event.target.value }
                    ),
                    "aria-label": "Prompt title",
                  }),
                  onChange: (value) => updateGuardrailPrompt(
                    selectedGuardrailSet.id,
                    activeGuardrailPrompt.id,
                    { prompt: value }
                  ),
                  placeholder: "Write guardrail instructions in Markdown...",
                  ariaLabel: String(activeGuardrailPrompt.title || "Guardrail prompt") + " Markdown content",
                  readOnly: selectedGuardrailSetReadonly,
                  historyKey: "guardrail-prompt:" + selectedGuardrailSet.id + ":" + activeGuardrailPrompt.id,
                }
              : undefined,
          });
          const guardrailEvaluationWorkspace = React.createElement("div", {
              className: "playground-server-detail-content guardrail-detail-page__evaluation-content",
            },
            React.createElement("div", {
                className: "playground-server-settings-tab guardrail-detail-page__evaluation-workspace",
              },
              renderGuardrailEvaluationSection()
            )
          );
          const guardrailSettingsContent = React.createElement("div", {
              className: "playground-server-detail-content guardrail-detail-page__settings-content",
            },
            React.createElement("div", {
                className: "playground-server-settings-tab is-function-settings-tab guardrail-detail-page__settings-inner",
              },
              React.createElement(PlatformDeploymentMap, {
                regionCode: guardrailDeploymentRegion,
                title: "Deployment region",
                className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map guardrail-detail-page__deployment-map",
              }),
              renderGuardrailAccessSettings()
            )
          );
          const guardrailSettingsSidebar = React.createElement(PlatformUiCard, {
              as: "section",
              variant: "sidebar",
              cardTitle: undefined,
              className: "playground-project-overview-sidebar-card playground-server-detail-properties-card guardrail-detail-page__properties-card",
            },
            React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
              renderGuardrailDetailSidebarRow("status", "Status",
                React.createElement(PlatformLabel, { variant: "green" }, "Active")
              ),
              renderGuardrailDetailSidebarRow("prompts", "Prompts", String(selectedGuardrailPrompts.length)),
              renderGuardrailDetailSidebarRow("creator", "Creator", guardrailCreatorValue, {
                title: guardrailCreatorLabel,
                valueClassName: "playground-server-detail-sidebar-identity-cell",
              }),
              renderGuardrailDetailSidebarRow(
                "created",
                "Created",
                formatGuardrailDate(selectedGuardrailSet.createdAt)
              ),
              renderGuardrailDetailSidebarRow(
                "updated",
                "Updated",
                formatGuardrailDate(selectedGuardrailSet.updatedAt)
              ),
              renderGuardrailDetailSidebarRow("owner", "Owner", guardrailOwnerSelector, {
                className: "playground-server-detail-sidebar-owner-row",
                valueClassName: "playground-server-detail-sidebar-owner-cell",
              })
            )
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
            guardrailVersionNavigationGuard,
            React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
              React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
                React.createElement("div", {
                    className: "playground-files-browser-body playground-guardrails-browser-body is-detail-page",
                  },
                  React.createElement(GuardrailDetailPage, {
                        activeTab: guardrailDetailTab,
                        metadata: guardrailMetadataSection,
                        notice: guardrailsBackendSyncState.error
                          ? React.createElement("div", {
                              className: "playground-environments-error playground-environments-editor-notice",
                              role: "alert",
                            }, guardrailsBackendSyncState.error)
                          : null,
                        general: guardrailGeneralWorkspace,
                        evaluation: guardrailEvaluationWorkspace,
                        settings: guardrailSettings,
                        sidebar: guardrailSettingsSidebar,
                        evaluationScopeKey: String(selectedGuardrailSet.id || ""),
                        onEvaluationActivate: () => void loadGuardrailEvaluationData(),
                        onSettingsActivate: () => {
                          if (!teamPageLoading && !guardrailWorkspaceTeams.length && typeof loadTeamPageData === "function") {
                            void loadTeamPageData({ selectedTeamId: "" });
                          }
                        },
                        className: "playground-guardrails-detail-page",
                      })
                )
              ),
              guardrailTopNavPublishPortal,
              renderGuardrailShareTeamModal(),
              renderGuardrailVersionModal(),
              renderGuardrailVersionSaveDialog(),
              renderGuardrailVersionChangesModal(),
              renderGuardrailVersionsSidebarPortal()
            )
          );
        }

`;
