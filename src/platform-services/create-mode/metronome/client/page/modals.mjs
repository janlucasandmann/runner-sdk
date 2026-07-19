export const METRONOME_PAGE_MODALS_SCRIPT = String.raw`
          const renderEditor = () => metronomeVersionChangesState
            ? renderMetronomeChangesMode()
            : metronomeEditorMode === "code"
            ? React.createElement(React.Fragment, null,
                renderCodeMode(),
                renderMetronomeVersionHistorySidebarPortal()
              )
            : metronomeEditorMode === "runs"
              ? React.createElement(React.Fragment, null,
                  renderRunsMode(),
                  renderMetronomeVersionHistorySidebarPortal()
                )
              : React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-metronome-editor" },
                    React.createElement("main", { className: "playground-metronome-editor-main" },
                      isMetronomeFlowReady
                        ? React.createElement(ReactFlowProvider, { key: metronomeFlowGraphKey + "|mount:" + metronomeFlowMountVersion },
                            React.createElement(MetronomeFlowCanvas, {
                              key: metronomeFlowGraphKey,
                              nodes: renderedMetronomeNodes,
                              edges: renderedMetronomeEdges,
                              nodeTypes,
                              edgeTypes,
                              onNodesChange: handleNodesChangeWithHistory,
                              onEdgesChange: handleEdgesChangeWithHistory,
                              onConnect: handleConnect,
                              onNodeDragStop: handleMetronomeNodeDragStop,
                              onCreateNode: handleCreateNode,
                              onSelectNode: selectMetronomeNodeFromCanvas,
                              onPaneClick: () => setSelectedNodeId(""),
                              onUndo: undoGraphChange,
                              onRedo: redoGraphChange,
                              canUndo: graphUndoStack.length > 0,
                              canRedo: graphRedoStack.length > 0,
                              readOnly: isActiveWorkflowBuiltIn,
                              interactionMode: metronomeCanvasInteractionMode,
                              onInteractionModeChange: setMetronomeCanvasInteractionMode,
                              onViewportChange: (viewport) => {
                                const nextZoom = Number(viewport?.zoom);
                                if (Number.isFinite(nextZoom) && nextZoom > 0) {
                                  setMetronomeFlowZoom(nextZoom);
                                }
                              },
                            })
                          )
                        : React.createElement("div", { className: "playground-metronome-flow" }),
                      renderPalette(),
                      renderInlineNodeInspector()
                    )
                  ),
                  renderMetronomeVersionHistorySidebarPortal()
                );

          const renderWorkflowNameModal = () => {
            if (!workflowNameModal) return null;
            const isCreate = workflowNameModal.mode === "create";
            const wallpaperOptions = isCreate ? [] : getMetronomeWorkflowWallpaperOptions();
            const currentWallpaperId = getMetronomeWorkflowWallpaperId(workflowWallpaperDraftId, wallpaperOptions[0]?.id || "");
            const currentWallpaper = getMetronomeWorkflowWallpaperConfig(currentWallpaperId);
            const getWorkflowWallpaperPreviewUrl = (wallpaper) => String(wallpaper?.url || "").trim();
            const buildWorkflowWallpaperPreviewImage = (wallpaper) => {
              const url = getWorkflowWallpaperPreviewUrl(wallpaper);
              return url ? "url(" + JSON.stringify(url) + ")" : undefined;
            };
            const stepWorkflowWallpaper = (direction) => {
              if (!wallpaperOptions.length) return;
              const currentIndex = wallpaperOptions.findIndex((wallpaper) => wallpaper.id === currentWallpaperId);
              const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
              const step = direction === "prev" ? -1 : 1;
              const nextIndex = (safeCurrentIndex + step + wallpaperOptions.length) % wallpaperOptions.length;
              const nextWallpaper = wallpaperOptions[nextIndex] || wallpaperOptions[0];
              if (!nextWallpaper?.id || nextWallpaper.id === currentWallpaperId) {
                return;
              }
              if (workflowWallpaperTransitionTimerRef.current) {
                window.clearTimeout(workflowWallpaperTransitionTimerRef.current);
                workflowWallpaperTransitionTimerRef.current = null;
              }
              workflowWallpaperPreloadTokenRef.current += 1;
              setWorkflowWallpaperTransition({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                direction: step > 0 ? "next" : "prev",
                fromPreview: buildWorkflowWallpaperPreviewImage(wallpaperOptions[safeCurrentIndex] || currentWallpaper),
                toPreview: buildWorkflowWallpaperPreviewImage(nextWallpaper),
              });
              setWorkflowWallpaperDraftId(nextWallpaper.id);
              workflowWallpaperTransitionTimerRef.current = window.setTimeout(() => {
                setWorkflowWallpaperTransition(null);
                workflowWallpaperTransitionTimerRef.current = null;
              }, 380);
            };
            const isWorkflowWallpaperPreviewTransitioning = workflowWallpaperTransition
              && typeof workflowWallpaperTransition.fromPreview === "string"
              && typeof workflowWallpaperTransition.toPreview === "string";
            return React.createElement(PlatformModal, {
              open: !workflowNameModalClosing,
              animationDurationMs: typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number"
                ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS
                : 60,
              onClose: () => closeWorkflowNameModal(),
              onExited: finishCloseWorkflowNameModal,
              as: "form",
              size: isCreate ? "small" : "medium",
              className: "playground-metronome-workflow-name-modal"
                + (isCreate ? " is-create" : " is-edit"),
              title: isCreate ? "Create Metronome Workflow" : "Edit Metronome",
              closeButtonLabel: isCreate ? "Close create Metronome modal" : "Close edit Metronome modal",
              initialFocusRef: workflowNameInputRef,
              bodyClassName: "playground-metronome-workflow-name-modal__body",
              footerClassName: "playground-metronome-workflow-name-modal__footer",
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void commitWorkflowNameModal();
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: () => closeWorkflowNameModal(),
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: !String(workflowNameDraft || "").trim(),
                }, isCreate ? "Create" : "Save")
              ),
            },
              React.createElement("label", {
                className: "playground-tasks-project-modal-field playground-metronome-workflow-name-modal__field",
              },
                React.createElement("span", {
                  className: "playground-tasks-project-modal-label",
                }, "Name"),
                React.createElement("input", {
                  ref: workflowNameInputRef,
                  className: "playground-environments-input playground-metronome-workflow-name-modal__input",
                  value: workflowNameDraft,
                  placeholder: "Metronome name",
                  autoComplete: "off",
                  required: true,
                  onChange: (event) => setWorkflowNameDraft(event.target.value),
                })
              ),
                wallpaperOptions.length
                  ? React.createElement("div", { className: "playground-tasks-project-wallpaper-field playground-metronome-workflow-wallpaper-field" },
                      React.createElement("div", { className: "playground-tasks-project-initial-setup-label" }, "Background"),
                      React.createElement("div", { className: "playground-tasks-project-wallpaper-picker playground-metronome-workflow-wallpaper-picker" },
                        React.createElement("div", {
                            className: "playground-tasks-project-wallpaper-picker-preview"
                              + (isWorkflowWallpaperPreviewTransitioning ? " is-" + workflowWallpaperTransition.direction : ""),
                            style: isWorkflowWallpaperPreviewTransitioning ? undefined : { backgroundImage: buildWorkflowWallpaperPreviewImage(currentWallpaper) },
                            "aria-hidden": "true",
                          },
                          isWorkflowWallpaperPreviewTransitioning
                            ? React.createElement(React.Fragment, { key: workflowWallpaperTransition.token },
                                React.createElement("div", {
                                  className: "playground-tasks-project-wallpaper-picker-preview-image is-outgoing",
                                  style: { backgroundImage: workflowWallpaperTransition.fromPreview },
                                }),
                                React.createElement("div", {
                                  className: "playground-tasks-project-wallpaper-picker-preview-image is-incoming",
                                  style: { backgroundImage: workflowWallpaperTransition.toPreview },
                                })
                              )
                            : React.createElement("div", {
                                key: currentWallpaperId || "current",
                                className: "playground-tasks-project-wallpaper-picker-preview-image is-current",
                                style: { backgroundImage: buildWorkflowWallpaperPreviewImage(currentWallpaper) },
                              })
                        ),
                        React.createElement("div", { className: "playground-tasks-project-wallpaper-picker-controls" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-project-wallpaper-picker-button",
                            onClick: () => stepWorkflowWallpaper("prev"),
                            "aria-label": "Previous background image",
                            title: "Previous background image",
                          }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                          React.createElement("div", { className: "playground-tasks-project-wallpaper-picker-label" },
                            currentWallpaper?.name || "Background"
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-project-wallpaper-picker-button",
                            onClick: () => stepWorkflowWallpaper("next"),
                            "aria-label": "Next background image",
                            title: "Next background image",
                          }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
                        )
                      )
                    )
                  : null
            );
          };

          const renderWorkflowVersionModal = () => {
            if (!workflowVersionModal) return null;
            const isBusy = metronomePublishState.status === "loading";
            const isEdit = workflowVersionModal.mode === "edit";
            const renderDescriptionField = () => React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor playground-agents-version-description-editor playground-metronome-version-description-editor" },
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
                      onClick: () => applyWorkflowVersionDescriptionFormat(action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isWorkflowVersionDescriptionEditing ? " is-editing" : " is-preview") },
                !isWorkflowVersionDescriptionEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      String(workflowVersionDescriptionDraft || "").trim()
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: workflowVersionDescriptionDraft,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, "Describe what changed in this version.")
                    )
                  : null,
                React.createElement("textarea", {
                  ref: workflowVersionDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input " + (isWorkflowVersionDescriptionEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  maxLength: 240,
                  placeholder: isWorkflowVersionDescriptionEditing ? "Describe what changed in this version." : "",
                  value: workflowVersionDescriptionDraft || "",
                  autoFocus: true,
                  disabled: isBusy,
                  onFocus: () => setIsWorkflowVersionDescriptionEditing(true),
                  onChange: (event) => setWorkflowVersionDescriptionDraft(event.target.value),
                  onBlur: () => setIsWorkflowVersionDescriptionEditing(false),
                  onKeyDown: (event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeWorkflowVersionModal();
                    }
                  },
                })
              )
            );
            return renderPlaygroundPlatformModal({
              open: Boolean(workflowVersionModal),
              visible: workflowVersionModalVisible,
              closing: workflowVersionModalClosing,
              onClose: () => closeWorkflowVersionModal(),
              as: "form",
              backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-version-modal-backdrop playground-metronome-version-modal-backdrop",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal playground-metronome-version-modal",
              ariaLabel: isEdit ? "Edit Metronome version" : "New Metronome version",
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void commitWorkflowVersionModal();
                },
                onKeyDown: (event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeWorkflowVersionModal();
                  }
                },
              },
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                    React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                      React.createElement(isEdit ? SquarePen : GitBranchPlus, { width: 18, height: 18, strokeWidth: 1.9 })
                    ),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                      value: workflowVersionNameDraft,
                      "aria-label": "Version identifier",
                      readOnly: true,
                      tabIndex: -1,
                      disabled: isBusy,
                    })
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
                    onClick: () => closeWorkflowVersionModal(),
                    title: "Close",
                    disabled: isBusy,
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                ),
                React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                  renderDescriptionField(),
                  metronomePublishState.status === "error" && metronomePublishState.message
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, metronomePublishState.message)
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeWorkflowVersionModal(),
                    disabled: isBusy,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: isBusy,
                  }, isBusy ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Version" : "Create Version"))
                )
              )
            });
          };

          const renderWorkflowVersionSaveDialog = () => {
            if (!workflowVersionSaveDialog) return null;
            const versionData = buildMetronomeVersionSaveDialogData();
            const isBusy = metronomePublishState.status === "loading"
              || metronomePublishState.status === "validating";
            return React.createElement(PlatformVersionSaveDialog, {
              open: true,
              title: "Review changes",
              currentVersion: versionData.currentVersion,
              nextVersion: versionData.nextVersion,
              currentDescription: versionData.currentDescription,
              initialMode: workflowVersionSaveDialog.initialMode || "new",
              canSaveCurrent: versionData.canSaveCurrent,
              instanceKey: workflowVersionSaveDialog.key,
              pending: isBusy,
              error: metronomePublishState.status === "error"
                ? metronomePublishState.message
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
              onClose: () => {
                if (!isBusy) setWorkflowVersionSaveDialog(null);
              },
              onSubmit: async (details) => {
                const published = await publishActiveWorkflowVersion(details);
                if (!published) {
                  throw new Error("The workflow could not be saved and published. Review the validation details and try again.");
                }
                setWorkflowVersionSaveDialog(null);
              },
            });
          };

          const renderMetronomeShareWorkflowModal = () => {
            if (!metronomeShareWorkflow || isMetronomeWorkflowBuiltIn(metronomeShareWorkflow)) return null;
            const isBusy = metronomeShareState.status === "loading" || metronomeShareState.status === "sharing";
            const accessOptions = [
              { value: "use", label: "Use" },
              { value: "edit", label: "Edit" },
              { value: "manage", label: "Manage" },
            ];
            return React.createElement(PlatformModalBackdrop, {
              className: "playground-metronome-name-modal-backdrop",
              role: "dialog",
              "aria-modal": "true",
              onMouseDown: (event) => {
                if (event.target === event.currentTarget) {
                  closeMetronomeShareWorkflowModal();
                }
              },
            },
              React.createElement(PlatformModalSurface, { className: "playground-metronome-name-modal is-share-workflow" },
                React.createElement("div", { className: "playground-metronome-name-modal-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-metronome-name-modal-title" }, "Share Metronome"),
                    React.createElement("div", { className: "playground-metronome-name-modal-copy" },
                      "Share \"" + (metronomeShareWorkflow.name || "Untitled Metronome") + "\" with a team."
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-icon-button playground-metronome-name-modal-close",
                    onClick: closeMetronomeShareWorkflowModal,
                    disabled: isBusy,
                    "aria-label": "Close",
                  },
                    React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 })
                  )
                ),
                React.createElement("div", { className: "playground-metronome-name-modal-body" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    React.createElement("label", { className: "playground-metronome-field-label" }, "Team"),
                    React.createElement("select", {
                      className: "playground-metronome-select",
                      value: metronomeShareTeamId,
                      disabled: isBusy || metronomeShareTeams.length === 0,
                      onChange: (event) => setMetronomeShareTeamId(event.target.value),
                    },
                      React.createElement("option", { value: "" }, metronomeShareTeams.length ? "Select team" : "No teams available"),
                      metronomeShareTeams.map((team) => React.createElement("option", { key: team.id, value: team.id }, team.name || "Untitled team"))
                    )
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    React.createElement("label", { className: "playground-metronome-field-label" }, "Access"),
                    React.createElement("select", {
                      className: "playground-metronome-select",
                      value: metronomeShareAccessLevel,
                      disabled: isBusy,
                      onChange: (event) => setMetronomeShareAccessLevel(event.target.value),
                    },
                      accessOptions.map((option) => React.createElement("option", { key: option.value, value: option.value }, option.label))
                    )
                  ),
                  metronomeShareState.message
                    ? React.createElement("p", {
                        className: "playground-metronome-share-status" + (metronomeShareState.status === "error" ? " is-error" : ""),
                      }, metronomeShareState.message)
                    : null,
                  React.createElement("div", { className: "playground-metronome-name-modal-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "playground-metronome-secondary-button",
                      onClick: closeMetronomeShareWorkflowModal,
                      disabled: isBusy,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "button",
                      className: "playground-metronome-primary-button",
                      onClick: () => void shareMetronomeWorkflowWithTeam(),
                      disabled: isBusy || !metronomeShareTeamId,
                    }, metronomeShareState.status === "sharing" ? "Sharing..." : "Share")
                  )
                )
              )
            );
          };

          const renderMetronomeDeploymentHistoryModal = () => {
            if (!isMetronomeDeploymentHistoryModalOpen) return null;
            return React.createElement(PlatformModalBackdrop, {
              className: "playground-metronome-name-modal-backdrop",
              role: "dialog",
              "aria-modal": "true",
            },
              React.createElement(PlatformModalSurface, { className: "playground-metronome-name-modal playground-metronome-deployment-history-modal" },
                React.createElement("div", { className: "playground-metronome-name-modal-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-metronome-name-modal-title" }, "Deployment history"),
                    React.createElement("div", { className: "playground-metronome-name-modal-copy" },
                      "Published and unpublished versions for this Metronome workflow."
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-icon-button playground-metronome-name-modal-close",
                    onClick: () => setIsMetronomeDeploymentHistoryModalOpen(false),
                    "aria-label": "Close",
                  },
                    React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 })
                  )
                ),
                React.createElement("div", { className: "playground-metronome-name-modal-body" },
                  renderMetronomeDeploymentHistory()
                )
              )
            );
          };

          return React.createElement(React.Fragment, null,
            React.createElement("div", {
              className: "playground-metronome-page"
                + (isEditor ? " is-editor" : " is-overview")
                + (isEditor && metronomeEditorMode === "code" ? " is-code" : ""),
            }, isEditor ? renderEditor() : renderOverview()),
            renderWorkflowNameModal(),
            renderWorkflowVersionModal(),
            renderWorkflowVersionSaveDialog(),
            renderMetronomeShareWorkflowModal(),
            renderMetronomeDeploymentHistoryModal()
          );
        }
`;
