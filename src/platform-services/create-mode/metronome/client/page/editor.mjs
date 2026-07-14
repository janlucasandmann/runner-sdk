export const METRONOME_PAGE_EDITOR_SCRIPT = String.raw`
          const renderInspectorPortal = () => {
            const inspector = renderInspector();
            if (!inspector) return null;
            if (!inspectorPortalId || typeof document === "undefined" || typeof createPortal !== "function") {
              return inspectorPortalId ? null : inspector;
            }
            const portalTarget = document.getElementById(inspectorPortalId);
            return portalTarget ? createPortal(inspector, portalTarget) : null;
          };

          const renderInlineNodeInspector = () => {
            const inspector = renderInspector();
            if (!inspector) return null;
            return React.createElement("aside", {
              className: "playground-metronome-inline-node-inspector",
              onClick: (event) => event.stopPropagation(),
              onMouseDown: (event) => event.stopPropagation(),
            }, inspector);
          };

          const renderMetronomePublishSidebarPortal = () => {
            const sidebar = renderMetronomePublishSidebar();
            if (!sidebar) return null;
            if (!inspectorPortalId || typeof document === "undefined" || typeof createPortal !== "function") {
              return inspectorPortalId ? null : sidebar;
            }
            const portalTarget = document.getElementById(inspectorPortalId);
            return portalTarget ? createPortal(sidebar, portalTarget) : null;
          };

          const renderMetronomeCodeFileRow = (file) => {
            const normalizedPath = String(file?.path || "").trim();
            if (!normalizedPath) return null;
            const isActive = normalizedPath === String(activeMetronomeCodeFile?.path || activeMetronomeCodeFilePath || "");
            const Icon = normalizedPath === "requirements.txt" ? Package : FileText;
            return React.createElement("button", {
              key: normalizedPath,
              type: "button",
              className: "playground-servers-code-file-row playground-metronome-code-file-row" + (isActive ? " is-active" : ""),
              onClick: () => handleMetronomeCodeFileSelect(normalizedPath),
            },
              React.createElement("span", { className: "playground-servers-code-file-chevron", "aria-hidden": "true" }),
              React.createElement("span", { className: "playground-servers-code-file-icon", "aria-hidden": "true" },
                React.createElement(Icon, { width: 15, height: 15, strokeWidth: 1.8 })
              ),
              React.createElement("span", { className: "playground-servers-code-file-name" }, normalizedPath)
            );
          };

          const getMetronomeVersionPopupActions = (options = {}) => {
            const isBusy = Boolean(options.isBusy) || metronomePublishState.status === "loading";
            const hasVersionChanges = hasActiveMetronomeVersionChanges();
            return [
              {
                id: "save-new",
                label: "Save to new Version",
                Icon: GitBranchPlus,
                shortcut: "⇧⌘S",
                disabled: isBusy || isActiveWorkflowBuiltIn || !hasVersionChanges,
                onClick: () => openCreateWorkflowVersionModal(),
              },
              {
                id: "revert",
                label: "Revert to last saved Version",
                Icon: Undo2,
                disabled: isBusy || isActiveWorkflowBuiltIn || !activeWorkflowDeployments.length || !hasVersionChanges,
                onClick: () => void revertActiveWorkflowToLastSavedVersion(),
              },
            ];
          };

          const renderMetronomeVersionSelector = () => {
            if (!activeWorkflow || isActiveWorkflowBuiltIn) return null;
            const isBusy = metronomePublishState.status === "loading";
            const activeDeploymentId = String(activeWorkflowDeployment?.id || activeWorkflow?.activeDeploymentId || "").trim();
            const selectedDeploymentId = String(
              activeWorkflow?.metadata?.restoredFromDeploymentId
              || activeWorkflow?.metadata?.restored_from_deployment_id
              || activeDeploymentId
              || ""
            ).trim();
            const selectedDeployment = selectedDeploymentId
              ? activeWorkflowDeployments.find((deployment) => deployment.id === selectedDeploymentId) || null
              : null;
            const currentTitle = selectedDeployment
              ? String(selectedDeployment.label || ("Version " + (selectedDeployment.version || ""))).trim() || "Version"
              : "No versions";
            const getDeploymentMeta = (deployment) => {
              if (!deployment) return "";
              const deploymentId = String(deployment.id || "").trim();
              const status = deploymentId && deploymentId === activeDeploymentId
                ? "Published"
                : (String(deployment.status || "").toLowerCase() === "active" ? "Published" : "Saved");
              const timestamp = String(deployment.publishedAt || deployment.updatedAt || deployment.createdAt || "").trim();
              const formattedTimestamp = timestamp ? formatMetronomeDeploymentTimestamp(timestamp) : "";
              return status + (formattedTimestamp ? " · " + formattedTimestamp : "");
            };
            const toggleSelectorMenu = (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (isBusy) return;
              setIsMetronomePublishActionsMenuOpen(false);
              setIsMetronomePublishSettingsMenuOpen(false);
              setIsMetronomeVersionsHeaderMenuOpen(false);
              setIsMetronomeVersionSelectorMenuOpen((current) => !current);
            };
            return renderPlaygroundPlatformPopup({
              open: isMetronomeVersionSelectorMenuOpen,
              shellRef: metronomeVersionSelectorMenuRef,
              shellClassName: "playground-agents-detail-publish-split-shell playground-agents-detail-version-selector-shell playground-metronome-detail-version-selector-shell",
              menuClassName: "playground-agents-detail-publish-menu playground-agents-detail-version-selector-menu playground-metronome-detail-version-selector-menu",
              trigger: React.createElement("div", {
                  className: "playground-metronome-create-button playground-metronome-publish-button playground-agents-detail-header-publish-button playground-agents-detail-publish-split-control playground-agents-detail-version-selector-control playground-metronome-detail-version-selector-control"
                    + (isMetronomeVersionSelectorMenuOpen ? " is-active" : "")
                    + (isBusy ? " is-disabled" : ""),
                },
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-main playground-agents-detail-version-selector-main playground-metronome-detail-version-selector-main",
                    title: currentTitle,
                    "aria-label": "Choose Metronome version",
                    "aria-haspopup": "menu",
                    "aria-expanded": isMetronomeVersionSelectorMenuOpen ? "true" : "false",
                    disabled: isBusy,
                    onClick: toggleSelectorMenu,
                  },
                  React.createElement(GitBranchPlus, { className: "playground-agents-detail-version-selector-icon", width: 13, height: 13, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "playground-agents-detail-version-selector-label" }, currentTitle)
                ),
                React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-chevron",
                    title: "Choose Metronome version",
                    "aria-label": "Choose Metronome version",
                    "aria-haspopup": "menu",
                    "aria-expanded": isMetronomeVersionSelectorMenuOpen ? "true" : "false",
                    disabled: isBusy,
                    onClick: toggleSelectorMenu,
                  },
                  React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                )
              ),
              menuProps: {
                role: "menu",
                onClick: (event) => event.stopPropagation(),
              },
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-agents-detail-version-selector-list playground-metronome-detail-version-selector-list", role: "group", "aria-label": "Metronome versions" },
                  activeWorkflowDeployments.length
                    ? activeWorkflowDeployments.map((deployment, index) => {
                        const deploymentId = String(deployment?.id || "").trim() || "version-" + index;
                        const isSelected = deploymentId === selectedDeploymentId;
                        const title = String(deployment.label || ("Version " + (deployment.version || ""))).trim() || "Version";
                        return React.createElement("button", {
                            key: deploymentId,
                            type: "button",
                            className: "tb-popup-row playground-agents-detail-version-selector-option" + (isSelected ? " is-selected" : ""),
                            role: "menuitemradio",
                            "aria-checked": isSelected ? "true" : "false",
                            disabled: isBusy || isSelected,
                            onClick: () => {
                              if (isBusy || isSelected) return;
                              setIsMetronomeVersionSelectorMenuOpen(false);
                              void restoreActiveWorkflowVersion(deploymentId);
                            },
                          },
                          React.createElement("span", { className: "playground-agents-detail-version-selector-option-check" },
                            isSelected
                              ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 2.2 })
                              : null
                          ),
                          React.createElement("span", { className: "playground-agents-detail-version-selector-option-copy" },
                            React.createElement("span", { className: "playground-agents-detail-version-selector-option-title" }, title),
                            React.createElement("span", { className: "playground-agents-detail-version-selector-option-meta" }, getDeploymentMeta(deployment))
                          )
                        );
                      })
                    : React.createElement("div", { className: "playground-agents-detail-version-selector-empty" },
                        isLoadingMetronomeVersions
                          ? "Loading versions..."
                          : metronomeVersionsError || "No versions yet."
                      )
                ),
                React.createElement("div", { className: "playground-agents-detail-version-selector-footer playground-metronome-detail-version-selector-footer" },
                  React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row playground-agents-detail-version-selector-new-button",
                      role: "menuitem",
                      disabled: isBusy,
                      onClick: () => {
                        if (isBusy) return;
                        setIsMetronomeVersionSelectorMenuOpen(false);
                        openCreateWorkflowVersionModal();
                      },
                    },
                    React.createElement(GitBranchPlus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.1 }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, "New Version")
                    )
                  ),
                  React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row playground-agents-detail-version-selector-new-button",
                      role: "menuitem",
                      disabled: isBusy || isLoadingMetronomeVersions || !activeWorkflowDeployments.length,
                      onClick: () => {
                        if (isBusy || isLoadingMetronomeVersions || !activeWorkflowDeployments.length) return;
                        setIsMetronomeVersionSelectorMenuOpen(false);
                        openMetronomeVersionChangesPage();
                      },
                    },
                    React.createElement(History, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.1 }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, "Version history")
                    )
                  )
                )
              )
            });
          };

          const renderMetronomePublishControl = () => {
            if (!activeWorkflow) return null;
            if (isActiveWorkflowBuiltIn) {
              return React.createElement("button", {
                type: "button",
                className: "playground-metronome-create-button playground-metronome-publish-button",
                onClick: () => void copyBuiltInWorkflow(activeWorkflow),
              },
                React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Copy")
              );
            }
            const isBusy = metronomePublishState.status === "loading";
            const hasMetronomePublishChanges = hasActiveMetronomeVersionChanges();
            const isMetronomePublishControlDisabled = Boolean(isBusy || !hasMetronomePublishChanges);
            const versionPopupActions = getMetronomeVersionPopupActions({ isBusy });
            return renderPlaygroundPlatformPopup({
              open: isMetronomePublishActionsMenuOpen,
              shellRef: metronomePublishMenuRef,
              shellClassName: "playground-agents-detail-publish-split-shell playground-metronome-detail-publish-split-shell",
              menuClassName: "playground-agents-detail-publish-menu playground-metronome-detail-publish-menu",
              trigger: React.createElement("div", {
                  className: "playground-metronome-create-button playground-metronome-publish-button playground-agents-detail-header-publish-button playground-agents-detail-publish-split-control playground-metronome-detail-header-publish-button"
                    + (isMetronomePublishMenuOpen ? " is-active" : "")
                    + (isMetronomePublishControlDisabled ? " is-disabled" : ""),
                },
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-main",
                    title: "Save and publish Metronome changes",
                    "aria-label": "Save and publish Metronome changes",
                    disabled: isMetronomePublishControlDisabled,
                    onClick: () => {
                      setSelectedNodeId("");
                      setIsMetronomeRunSidebarOpen(false);
                      setIsMetronomeRunSidebarMenuOpen(false);
                      setIsMetronomePublishActionsMenuOpen(false);
                      setIsMetronomeVersionSelectorMenuOpen(false);
                      setIsMetronomePublishSettingsMenuOpen(false);
                      setIsMetronomeVersionsHeaderMenuOpen(false);
                      void publishActiveWorkflowVersion();
                    },
                  },
                  React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Save & Publish")
                ),
                React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-chevron",
                    title: "Version save options",
                    "aria-label": "Version save options",
                    "aria-haspopup": "menu",
                    "aria-expanded": isMetronomePublishActionsMenuOpen ? "true" : "false",
                    disabled: isMetronomePublishControlDisabled,
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsMetronomeVersionSelectorMenuOpen(false);
                      setIsMetronomePublishActionsMenuOpen((current) => !current);
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
                versionPopupActions.map((action) => React.createElement("button", {
                    key: action.id || action.label,
                    type: "button",
                    className: "tb-popup-row",
                    role: "menuitem",
                    disabled: isBusy || action.disabled,
                    onClick: () => {
                      setIsMetronomePublishActionsMenuOpen(false);
                      void action.onClick();
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
          };

          const renderMetronomeHeaderControls = () => React.createElement("div", { className: "playground-metronome-detail-header-controls" },
            renderMetronomeVersionSelector(),
            renderMetronomePublishControl()
          );

          const renderMetronomeDeploymentHistory = () => {
            if (isLoadingMetronomeDeploymentEvents) {
              if (!visibleMetronomeDeploymentEvents.length) {
                return React.createElement("div", { className: "playground-metronome-deployment-history-empty" }, "Loading deployment history...");
              }
            }
            if (metronomeDeploymentEventsError) {
              if (!visibleMetronomeDeploymentEvents.length) {
                return React.createElement("div", { className: "playground-metronome-deployment-history-empty is-error" }, metronomeDeploymentEventsError);
              }
            }
            if (!visibleMetronomeDeploymentEvents.length) {
              return React.createElement("div", { className: "playground-metronome-deployment-history-empty" },
                "Publish or unpublish this workflow to create deployment history."
              );
            }
            return React.createElement("div", { className: "playground-metronome-deployment-history-list" },
              visibleMetronomeDeploymentEvents.map((event) => {
                const action = String(event.action || "").toLowerCase();
                const isUnpublish = action === "unpublish";
                const versionLabel = event.label || (event.version ? "Version " + event.version : event.versionId ? "Version " + event.versionId.slice(0, 8) : "Workflow");
                return React.createElement("div", { key: event.id, className: "playground-metronome-deployment-history-row" },
                  React.createElement("div", { className: "playground-metronome-deployment-history-icon is-" + (isUnpublish ? "unpublish" : "publish") },
                    React.createElement(isUnpublish ? PauseCircle : Rocket, { width: 13, height: 13, strokeWidth: 1.8 })
                  ),
                  React.createElement("div", { className: "playground-metronome-deployment-history-main" },
                    React.createElement("div", { className: "playground-metronome-deployment-history-title" },
                      isUnpublish ? "Unpublished workflow" : "Published " + versionLabel
                    ),
                    React.createElement("div", { className: "playground-metronome-deployment-history-meta" },
                      formatMetronomeDeploymentTimestamp(event.createdAt)
                      + " · "
                      + (event.status || (isUnpublish ? "unpublished" : "published"))
                      + (event.nodeCount ? " · " + event.nodeCount + " nodes" : "")
                    )
                  )
                );
              })
            );
          };

          const renderMetronomePublishSidebar = () => {
            if (!isMetronomePublishMenuOpen || !activeWorkflow) return null;
            const isBusy = metronomePublishState.status === "loading";
            const isValidating = metronomePublishState.status === "validating";
            const publishIssues = Array.isArray(metronomePublishState.issues) ? metronomePublishState.issues : [];
            const activeDeploymentId = String(activeWorkflowDeployment?.id || activeWorkflow?.activeDeploymentId || "").trim();
            const selectedDeploymentId = String(
              activeWorkflow?.metadata?.restoredFromDeploymentId
              || activeWorkflow?.metadata?.restored_from_deployment_id
              || activeDeploymentId
              || ""
            ).trim();
            const versionHeaderActions = getMetronomeVersionPopupActions({ isBusy });
            const stateContent = React.createElement(React.Fragment, null,
              isValidating
                ? React.createElement("div", { className: "playground-metronome-publish-state" },
                    metronomePublishState.message || "Checking workflow before publishing..."
                  )
                : null,
              metronomePublishState.status === "error"
                ? React.createElement("div", { className: "playground-metronome-publish-issues" },
                    React.createElement("div", { className: "playground-metronome-publish-issues-title" }, "Resolve before publishing"),
                    publishIssues.length
                      ? React.createElement("ul", { className: "playground-metronome-publish-issues-list" },
                          publishIssues.slice(0, 8).map((issue, index) => React.createElement("li", {
                            key: String(issue.code || "issue") + "-" + String(issue.nodeId || issue.edgeId || index),
                            className: "playground-metronome-publish-issues-item",
                          },
                            React.createElement("span", { className: "playground-metronome-publish-issues-dot", "aria-hidden": "true" }),
                            React.createElement("span", null, issue.message || "Resolve this workflow issue before publishing.")
                          ))
                        )
                      : React.createElement("div", null, metronomePublishState.message || "The workflow is not ready to publish.")
                  )
                : null
            );
            return React.createElement(PlaygroundVersionSidebar, {
              open: isMetronomePublishMenuOpen,
              title: "Publish Metronome",
              className: "playground-metronome-workflow-versions-sidebar",
              versions: activeWorkflowDeployments,
              activeVersionId: activeDeploymentId,
              selectedVersionId: selectedDeploymentId,
              state: metronomePublishState,
              busy: isBusy,
              openMenuId: openMetronomeVersionMenuId,
              onOpenMenuIdChange: setOpenMetronomeVersionMenuId,
              headerMenuOpen: isMetronomeVersionsHeaderMenuOpen,
              headerMenuActions: versionHeaderActions,
              headerMenuDisabled: isBusy,
              onHeaderMenuOpenChange: setIsMetronomeVersionsHeaderMenuOpen,
              onClose: () => {
                setOpenMetronomeVersionMenuId("");
                setIsMetronomePublishActionsMenuOpen(false);
                setIsMetronomePublishSettingsMenuOpen(false);
                setIsMetronomeVersionsHeaderMenuOpen(false);
                setMetronomeVersionChangesState(null);
                setIsMetronomePublishMenuOpen(false);
              },
              onSaveVersion: openCreateWorkflowVersionModal,
              onSelectVersion: (versionId) => void restoreActiveWorkflowVersion(versionId),
              onPublishVersion: (versionId) => void publishMetronomeDeploymentVersion(versionId),
              canPublishVersion: (deployment) => canPublishMetronomeDeploymentVersion(deployment),
              stateContent,
              unpublishLabel: "Unpublish workflow",
              versionsSectionFooter: React.createElement("div", { className: "playground-metronome-publish-section-footer playground-agents-version-compare-footer" },
                React.createElement(PlatformSecondaryButton, {
                  size: "large",
                  type: "button",
                  className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-agents-version-compare-button",
                  disabled: isBusy || !activeWorkflowDeployments.length,
                  onClick: () => openMetronomeVersionChangesPage(),
                },
                  React.createElement(Code2, { width: 13, height: 13, strokeWidth: 1.8 }),
                  React.createElement("span", null, "View Changes")
                )
              ),
              getVersionTitle: (deployment) => String(deployment.label || ("Version " + deployment.version)).trim(),
              getVersionDescription: () => "",
              getVersionMeta: (deployment) => (
                (deployment.publishedAt ? "Published " : "Saved ")
                + formatMetronomeDeploymentTimestamp(deployment.publishedAt || deployment.createdAt)
                + " · "
                + String(deployment.nodeCount || 0)
                + " nodes · "
                + String(deployment.edgeCount || 0)
                + " connections"
              ),
              getRowMenuItems: (deployment) => [
                {
                  id: "edit",
                  label: "Edit version",
                  icon: SquarePen,
                  onClick: () => openEditWorkflowVersionModal(deployment.id),
                },
                {
                  id: "compare",
                  label: "View Changes",
                  icon: Code2,
                  onClick: () => openMetronomeVersionChangesPage(deployment.id),
                },
                {
                  id: "delete",
                  label: "Delete version",
                  icon: Trash2,
                  danger: true,
                  onClick: () => void deleteWorkflowVersion(deployment.id),
                },
              ],
            });
          };

          const renderMetronomeVersionChangesPage = () => {
            if (!metronomeVersionChangesState) {
              return null;
            }
            const sources = buildMetronomeVersionCompareSources();
            const currentEditorSource = sources.find((source) => source.id === METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
            const requestedLeftSourceId = String(metronomeVersionChangesState.leftSourceId || "").trim()
              || getDefaultMetronomeVersionCompareLeftSourceId();
            const requestedRightSourceId = String(metronomeVersionChangesState.rightSourceId || "").trim()
              || METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID;
            const leftSource = resolveMetronomeVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
            const rightSource = resolveMetronomeVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
            if (!leftSource || !rightSource) {
              return null;
            }
            const diffFiles = buildMetronomeVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
            const compareOptions = sources.map((source) =>
              React.createElement("option", { key: source.id, value: source.id }, source.label)
            );
            const renderCompareSelect = (value, side, ariaLabel) =>
              React.createElement("label", { className: "playground-version-changes-select-shell" },
                React.createElement("span", { className: "playground-version-changes-select-control-wrap" },
                  React.createElement("select", {
                    className: "playground-version-changes-select-control",
                    value,
                    onChange: (event) => handleMetronomeVersionCompareSourceChange(side, event.target.value),
                    "aria-label": ariaLabel,
                  }, compareOptions),
                  React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
                )
              );
            return renderPlaygroundVersionChangesPage({
              title: "Changes",
              backText: "Back",
              backLabel: "Back to Metronome",
              onBack: closeMetronomeVersionChangesPage,
              compareControls: React.createElement(React.Fragment, null,
                renderCompareSelect(leftSource.id, "left", "Base version"),
                React.createElement("span", { className: "playground-version-changes-select-arrow", "aria-hidden": "true" }, "→"),
                renderCompareSelect(rightSource.id, "right", "Compare version")
              ),
              actions: renderMetronomeHeaderControls(),
              files: diffFiles,
              emptyMessage: "No changes between these versions.",
            });
          };

          const renderCodeMode = () => {
            const codeStatusMessage = metronomeCodeRunState.message
              || (isMetronomeCodeDirty ? "Unsaved changes" : (activeMetronomeCodeFile?.path || "Generated from visual workflow"));
            const codeStatusClassName = "playground-metronome-code-statusbar-message is-" + (metronomeCodeRunState.status || "idle");
            return React.createElement("div", { className: "playground-metronome-code-view playground-resources-page is-develop-server-kind-page" },
              React.createElement("div", { className: "playground-metronome-palette-header playground-metronome-code-header" },
                React.createElement("div", { className: "playground-metronome-code-header-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-palette-back-button",
                    onClick: returnToMetronomeOverview,
                    title: "Back to Metronomes",
                    "aria-label": "Back to Metronomes",
                  }, React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.9 })),
                  React.createElement("div", { className: "playground-metronome-palette-title" }, activeWorkflow?.name || "Metronome")
                ),
                renderMetronomeHeaderControls()
              ),
              React.createElement("div", { className: "playground-server-detail-content is-code-tab playground-metronome-code-content" },
                React.createElement("div", { className: "playground-servers-code-workspace playground-metronome-code-workspace" },
                  React.createElement("aside", { className: "playground-servers-code-sidebar" },
                    React.createElement("div", { className: "playground-servers-code-sidebar-header" },
                      React.createElement("div", { className: "playground-servers-code-sidebar-title" }, "Files")
                    ),
                    React.createElement("div", { className: "playground-servers-code-file-list" },
                      metronomeCodeFiles.length
                        ? metronomeCodeFiles.map((file) => renderMetronomeCodeFileRow(file))
                        : React.createElement("div", { className: "playground-servers-code-empty" }, "No code files.")
                    )
                  ),
                  React.createElement("section", { className: "playground-servers-code-editor-main" },
                    React.createElement("div", { className: "playground-servers-code-editor-body" },
                      activeMetronomeCodeFile
                        ? React.createElement(MetronomeGeneratedCodeEditor, {
                            file: activeMetronomeCodeFile,
                          value: activeMetronomeCodeFile.value,
                          onChange: handleMetronomeCodeFileChange,
                          readOnly: isActiveWorkflowBuiltIn,
                        })
                        : React.createElement("div", { className: "playground-servers-code-empty" }, "Select a file to edit.")
                    ),
                    React.createElement("div", { className: "playground-servers-code-editor-statusbar" },
                      React.createElement("div", { className: codeStatusClassName }, codeStatusMessage),
                      React.createElement("div", { className: "playground-servers-code-editor-status-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: handleRevertMetronomeCodeDraft,
                          disabled: isActiveWorkflowBuiltIn || !isMetronomeCodeDirty,
                        }, React.createElement("span", null, "Revert")),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-environments-action-button is-primary",
                          onClick: handleApplyMetronomeCodeDraft,
                          disabled: isActiveWorkflowBuiltIn || !isMetronomeCodeDirty,
                        },
                          React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Save")
                        )
                      )
                    )
                  )
                )
              )
            );
          };

          const renderMetronomeRunStatusLabel = (run) => {
            const status = String(run?.status || "completed").toLowerCase();
            return React.createElement("span", {
              className: "playground-metronome-run-status" + (status === "completed" ? " is-completed" : ""),
            }, status || "completed");
          };

          const formatMetronomeRunTimestamp = (value) => {
            if (!value) return "Just now";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "Just now";
            return date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          };

          const isGenericMetronomeRunPromptText = (value) => {
            const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
            return !normalized
              || normalized === "manual workflow run"
              || normalized === "manual trigger received.";
          };

          const readMetronomeRunPromptCandidate = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              return isGenericMetronomeRunPromptText(trimmed) ? "" : trimmed;
            }
            if (typeof value !== "object") {
              const trimmed = String(value || "").trim();
              return isGenericMetronomeRunPromptText(trimmed) ? "" : trimmed;
            }
            const preferredKeys = [
              "userMessage",
              "user_message",
              "displayMessage",
              "display_message",
              "triggerMessage",
              "trigger_message",
              "message",
              "prompt",
              "body",
              "text",
              "content",
            ];
            for (const key of preferredKeys) {
              const candidate = readMetronomeRunPromptCandidate(value[key]);
              if (candidate) return candidate;
            }
            for (const key of ["thread", "trigger", "event", "input", "inputs", "payload", "email"]) {
              const nested = value[key];
              if (nested && typeof nested === "object") {
                const candidate = readMetronomeRunPromptCandidate(nested);
                if (candidate) return candidate;
              }
            }
            return "";
          };

          const getMetronomeRunPrompt = (run) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const candidates = [
              run?.prompt,
              run?.displayPrompt,
              run?.displayMessage,
              run?.userMessage,
              run?.message,
              run?.input,
              run?.inputs,
              output?.trigger,
              output?.input,
              output?.inputs,
              output?.prompt,
              output?.message,
            ];
            const triggerStep = steps.find((step) => String(step?.kind || "").toLowerCase() === "trigger") || steps[0] || null;
            if (triggerStep) {
              candidates.push(triggerStep.input, triggerStep.inputs, triggerStep.output, triggerStep.summary);
            }
            for (const candidate of candidates) {
              const prompt = readMetronomeRunPromptCandidate(candidate);
              if (prompt) return prompt;
            }
            return "Manual workflow run";
          };

          const getMetronomeRunStepIcon = (step) => {
            const kind = String(step?.kind || "").toLowerCase();
            if (kind === "trigger") return Zap;
            if (kind === "action") return Play;
            if (kind === "condition") return Split;
            if (kind === "end") return Square;
            if (kind === "imagine") return Clapperboard;
            if (kind === "function") return FunctionSquare;
            if (kind === "firecrawl") return Flame;
            if (kind === "table") return typeof TableProperties !== "undefined" ? TableProperties : Database;
            if (kind === "database") return Database;
            if (kind === "ticket") return Bookmark;
            if (kind === "metronome") return Metronome;
            if (kind === "loop") return RefreshCw;
            if (kind === "approval") return Shield;
            if (kind === "note") return StickyNote;
            return Circle;
          };

          const formatMetronomeRunValue = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return "";
              try {
                return JSON.stringify(JSON.parse(trimmed), null, 2);
              } catch (_error) {
                return trimmed;
              }
            }
            try {
              return JSON.stringify(value, null, 2);
            } catch (_error) {
              return String(value || "");
            }
          };

          const extractMetronomeReadableOutputText = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return "";
              try {
                return extractMetronomeReadableOutputText(JSON.parse(trimmed));
              } catch (_error) {
                return trimmed;
              }
            }
            if (typeof value !== "object") {
              return String(value || "").trim();
            }
            if (Array.isArray(value)) {
              return value
                .map((item) => extractMetronomeReadableOutputText(item))
                .filter(Boolean)
                .join("\n\n");
            }
            const preferredKeys = [
              "output_text",
              "outputText",
              "markdown",
              "text",
              "message",
              "summary",
              "content",
              "response",
            ];
            for (const key of preferredKeys) {
              const extracted = extractMetronomeReadableOutputText(value[key]);
              if (extracted) return extracted;
            }
            for (const key of ["result", "output", "data"]) {
              const nested = value[key];
              if (nested && typeof nested === "object" && !Array.isArray(nested)) {
                const extracted = extractMetronomeReadableOutputText(nested);
                if (extracted) return extracted;
              }
            }
            return "";
          };

          const hasMetronomeRunOutput = (value) => {
            if (!value || typeof value !== "object") return Boolean(formatMetronomeRunValue(value));
            return Object.keys(value).some((key) => {
              if (["selectedEdgeId", "branchId", "branchLabel", "branchRule", "branchMatched", "branchReason"].includes(key)) {
                return false;
              }
              const item = value[key];
              if (item === null || typeof item === "undefined") return false;
              if (typeof item === "string") return item.trim().length > 0;
              if (Array.isArray(item)) return item.length > 0;
              if (typeof item === "object") return Object.keys(item).length > 0;
              return true;
            });
          };

          const findMetronomeRunThreadForStep = (step, threads) => {
            const nodeId = String(step?.nodeId || "").trim();
            if (!nodeId || !Array.isArray(threads)) return null;
            return threads.find((thread) => String(thread?.nodeId || "").trim() === nodeId) || null;
          };

          const extractMetronomeThreadReadableOutputText = (step, thread) => {
            const candidates = [
              step?.output,
              step?.result,
              step?.data,
              thread?.output,
              thread?.result,
              thread?.data,
              thread?.summary,
              step?.summary,
            ];
            for (const candidate of candidates) {
              const text = extractMetronomeReadableOutputText(candidate);
              if (text) return text;
            }
            return "";
          };

          const getMetronomeNumberFromPath = (source, path) => {
            const parts = String(path || "").split(".").filter(Boolean);
            let current = source;
            for (const part of parts) {
              if (!current || typeof current !== "object") return null;
              current = current[part];
            }
            const numeric = Number(current);
            return Number.isFinite(numeric) ? numeric : null;
          };

          const firstMetronomeFiniteNumber = (source, paths) => {
            for (const path of paths) {
              const value = getMetronomeNumberFromPath(source, path);
              if (Number.isFinite(value)) return value;
            }
            return null;
          };

          const calculateMetronomeRunCostBreakdown = (run) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const topLevelLlm = firstMetronomeFiniteNumber(output, [
              "usage.llmCt",
              "usage.llm_ct",
              "usage.llmInferenceCt",
              "usage.llm_inference_ct",
              "usage.inferenceCt",
              "usage.inference_ct",
              "cost.llmCt",
              "costs.llmCt",
              "llmCt",
              "llm_ct",
            ]);
            const topLevelResources = firstMetronomeFiniteNumber(output, [
              "usage.resourcesCt",
              "usage.resourceCt",
              "usage.resources_ct",
              "usage.resource_ct",
              "usage.computerCt",
              "usage.computer_ct",
              "usage.serverCt",
              "usage.server_ct",
              "cost.resourcesCt",
              "costs.resourcesCt",
              "resourcesCt",
              "resourceCt",
              "resources_ct",
              "resource_ct",
            ]);
            const shouldSumLlm = !Number.isFinite(topLevelLlm);
            const shouldSumResources = !Number.isFinite(topLevelResources);
            let llmInference = shouldSumLlm ? 0 : topLevelLlm;
            let resources = shouldSumResources ? 0 : topLevelResources;
            if (shouldSumLlm || shouldSumResources) {
              const steps = Array.isArray(output.steps) ? output.steps : [];
              steps.forEach((step) => {
                if (shouldSumLlm) {
                  const stepLlm = firstMetronomeFiniteNumber(step, [
                    "usage.llmCt",
                    "usage.llm_ct",
                    "usage.llmInferenceCt",
                    "usage.llm_inference_ct",
                    "usage.inferenceCt",
                    "usage.inference_ct",
                    "cost.llmCt",
                    "costs.llmCt",
                    "llmCt",
                    "llm_ct",
                  ]);
                  if (Number.isFinite(stepLlm)) llmInference += stepLlm;
                }
                if (shouldSumResources) {
                  const stepResources = firstMetronomeFiniteNumber(step, [
                    "usage.resourcesCt",
                    "usage.resourceCt",
                    "usage.resources_ct",
                    "usage.resource_ct",
                    "usage.computerCt",
                    "usage.computer_ct",
                    "usage.serverCt",
                    "usage.server_ct",
                    "cost.resourcesCt",
                    "costs.resourcesCt",
                    "resourcesCt",
                    "resourceCt",
                    "resources_ct",
                    "resource_ct",
                  ]);
                  if (Number.isFinite(stepResources)) resources += stepResources;
                }
              });
            }
            return {
              llmInference: Math.max(0, llmInference || 0),
              resources: Math.max(0, resources || 0),
            };
          };

          const formatMetronomeRunCostCt = (value) => {
            const numeric = Number(value);
            const dollars = Number.isFinite(numeric) ? Math.max(0, numeric) / 100 : 0;
            const smallValue = dollars > 0 && dollars < 0.01;
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: smallValue ? 4 : 2,
              maximumFractionDigits: smallValue ? 4 : 2,
            }).format(dollars);
          };

          const normalizeMetronomeMarkdownText = (value) => String(value || "")
            .replace(/\\\\r\\\\n/g, "\n")
            .replace(/\\\\n/g, "\n")
            .replace(/\\\\r/g, "\n")
            .replace(new RegExp("\\\\\\\\([*_\\\\x60\\\\[\\\\]\\\\(\\\\)#+\\\\-.!>])", "g"), "$1")
            .trim();

          const renderMetronomeRunOutputMarkdown = (value, fallback = "") => {
            const text = normalizeMetronomeMarkdownText(extractMetronomeReadableOutputText(value) || fallback);
            if (!text) return null;
            return React.createElement(PlaygroundTaskDescriptionMarkdown, {
              content: text,
              className: "playground-tasks-comment-text playground-metronome-run-output-markdown tb-message-markdown",
            });
          };

          const renderMetronomeRunTraceValue = (value, fallback = "") => {
            const readableText = normalizeMetronomeMarkdownText(extractMetronomeReadableOutputText(value) || fallback);
            if (readableText) {
              return renderMetronomeRunOutputMarkdown(readableText);
            }
            const formatted = formatMetronomeRunValue(value || fallback);
            if (!formatted) return null;
            return React.createElement("pre", { className: "playground-metronome-run-output-block" }, formatted);
          };

          const getMetronomeRunStepInput = (step) => {
            if (step?.input !== null && typeof step?.input !== "undefined") return step.input;
            const output = step?.output && typeof step.output === "object" ? step.output : {};
            return output.input || output.inputs || output.previous || output.context || output.inputSummary || "";
          };

          const getMetronomeRunConditionBranchLabel = (step) => {
            const output = step?.output && typeof step.output === "object" ? step.output : {};
            return String(
              step?.branchLabel
                || output.branchLabel
                || output.branch?.label
                || output.branchName
                || output.selectedBranch
                || output.selectedBranchLabel
                || "Default"
            ).trim() || "Default";
          };

          const getMetronomeRunConditionReason = (step) => {
            const output = step?.output && typeof step.output === "object" ? step.output : {};
            return String(
              step?.branchReason
                || output.branchReason
                || output.branch?.reason
                || output.reason
                || output.message
                || ""
            ).trim();
          };

          const isGenericMetronomeRunSummaryText = (value) => {
            const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
            return !normalized
              || normalized === "metronome run completed."
              || normalized === "metronome run completed"
              || normalized === "workflow reached the end node."
              || normalized === "workflow reached the end node";
          };

          const getMetronomeRunSummaryText = (run) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const threads = Array.isArray(output.threads) ? output.threads : [];
            for (let index = threads.length - 1; index >= 0; index -= 1) {
              const thread = threads[index];
              const threadText = extractMetronomeReadableOutputText(thread?.summary)
                || extractMetronomeReadableOutputText(thread?.output)
                || extractMetronomeReadableOutputText(thread?.result)
                || extractMetronomeReadableOutputText(thread?.data);
              if (threadText && !isGenericMetronomeRunSummaryText(threadText)) {
                return threadText;
              }
            }
            for (let index = steps.length - 1; index >= 0; index -= 1) {
              const step = steps[index];
              const kind = String(step?.kind || "").toLowerCase();
              const subtype = String(step?.subtype || step?.type || "").toLowerCase();
              const isThreadStep = kind === "thread" || subtype === "thread" || subtype === "start_thread";
              if (!isThreadStep) continue;
              const thread = findMetronomeRunThreadForStep(step, threads);
              const threadText = extractMetronomeThreadReadableOutputText(step, thread);
              if (threadText && !isGenericMetronomeRunSummaryText(threadText)) {
                return threadText;
              }
            }
            const candidates = [
              output.runSummary,
              output.run_summary,
              output.summary,
              output.message,
              run?.summary,
              run?.result,
              run?.error,
            ];
            for (const candidate of candidates) {
              const text = extractMetronomeReadableOutputText(candidate);
              if (text && !isGenericMetronomeRunSummaryText(text)) return text;
            }
            const finalStep = steps[steps.length - 1] || null;
            const finalStepText = extractMetronomeReadableOutputText(finalStep?.output) || String(finalStep?.summary || "").trim();
            if (finalStepText && !isGenericMetronomeRunSummaryText(finalStepText)) return finalStepText;
            const completedStepCount = steps.length;
            const threadCount = threads.length;
            if (completedStepCount || threadCount) {
              return "Workflow completed with " + completedStepCount + " step" + (completedStepCount === 1 ? "" : "s")
                + (threadCount ? " and " + threadCount + " thread" + (threadCount === 1 ? "" : "s") : "") + ".";
            }
            return "";
          };

          const isMetronomeRunEmailTrigger = (run) => {
            const input = run?.input && typeof run.input === "object" ? run.input : {};
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const triggerType = String(run?.triggerType || input.triggerType || input.type || output.triggerType || "").toLowerCase();
            return triggerType === "email" || triggerType === "email_received" || Boolean(input.email || input.from || input.sender || input.subject);
          };

          const renderMetronomeRunTriggerMessage = (run) => {
            const input = run?.input && typeof run.input === "object" ? run.input : {};
            const prompt = getMetronomeRunPrompt(run);
            if (isMetronomeRunEmailTrigger(run)) {
              const email = input.email && typeof input.email === "object" ? input.email : {};
              const from = String(input.from || input.sender || email.from || email.sender || "").trim();
              const subject = String(input.subject || email.subject || "Inbound email").trim();
              const body = String(input.body || input.text || input.message || email.body || email.text || prompt || "").trim();
              return React.createElement("div", { className: "playground-metronome-run-user-row" },
                React.createElement("div", { className: "playground-metronome-run-user-bubble playground-metronome-run-email-bubble" },
                  from
                    ? React.createElement("div", { className: "playground-metronome-run-email-from" }, "From ", from)
                    : null,
                  React.createElement("div", { className: "playground-metronome-run-email-subject" }, subject),
                  body
                    ? React.createElement("div", { className: "playground-metronome-run-email-body" }, body)
                    : null
                )
              );
            }
            if (!prompt) return null;
            return React.createElement("div", { className: "playground-metronome-run-user-row" },
              React.createElement("div", { className: "playground-metronome-run-user-bubble" }, prompt)
            );
          };

          const renderMetronomeRunTrace = (run, { includeComposerPrompt = false } = {}) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const threads = Array.isArray(output.threads) ? output.threads : [];
            const logs = Array.isArray(output.logs) ? output.logs : [];
            const prompt = getMetronomeRunPrompt(run);
            const traceNodeById = new Map((Array.isArray(nodes) ? nodes : []).map((node) => [String(node?.id || ""), node]));
            const traceItems = [];
            if (includeComposerPrompt) {
              const triggerMessage = renderMetronomeRunTriggerMessage(run);
              if (triggerMessage) {
                traceItems.push(React.cloneElement(triggerMessage, { key: "prompt" }));
              }
            }
            if (steps.length) {
              steps.forEach((step, index) => {
                const StepIcon = getMetronomeRunStepIcon(step);
                const thread = findMetronomeRunThreadForStep(step, threads);
                const stepKind = String(step.kind || "").toLowerCase();
                const stepSubtype = String(step.subtype || step.type || "").toLowerCase();
                const rawStepLabel = String(step.label || "").trim();
                const stepNode = traceNodeById.get(String(step.nodeId || "").trim()) || null;
                const isThreadStep = stepKind === "thread"
                  || stepSubtype === "thread"
                  || stepSubtype === "start_thread"
                  || /start\s+agent\s+thread/i.test(rawStepLabel);
                const stepTitle = stepNode
                  ? getMetronomeNodeDisplayLabel(stepNode)
                  : normalizeMetronomeNodeLabel(rawStepLabel || getMetronomeSubtypeLabel(step.kind, step.subtype) || step.kind || "Workflow step", stepKind || step.kind, stepSubtype || step.subtype);
                const readableOutputText = stepKind === "trigger" || stepKind === "condition"
                  ? ""
                  : isThreadStep
                    ? extractMetronomeThreadReadableOutputText(step, thread)
                    : extractMetronomeReadableOutputText(step.output);
                const conditionInput = stepKind === "condition" ? getMetronomeRunStepInput(step) : null;
                const conditionInputText = stepKind === "condition" ? formatMetronomeRunValue(conditionInput) : "";
                const conditionBranchLabel = stepKind === "condition" ? getMetronomeRunConditionBranchLabel(step) : "";
                const conditionReason = stepKind === "condition" ? getMetronomeRunConditionReason(step) : "";
                const summary = String(
                  isThreadStep
                    ? (readableOutputText ? "" : thread?.prompt || step.status || "Completed")
                    : stepKind === "condition"
                      ? ""
                    : step.summary || step.status || "Completed"
                ).trim();
                const shouldRenderOutputText = Boolean(
                  readableOutputText
                  && (
                    isThreadStep
                    || normalizeMetronomeMarkdownText(readableOutputText).replace(/\s+/g, " ") !== normalizeMetronomeMarkdownText(summary).replace(/\s+/g, " ")
                  )
                );
                traceItems.push(React.createElement("div", { key: step.id || step.nodeId || index, className: "playground-metronome-run-trace-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(StepIcon, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title-group" },
                      React.createElement("div", { className: "playground-metronome-run-trace-title" }, stepTitle),
                      thread?.id
                        ? React.createElement("div", { className: "playground-metronome-run-thread-meta-row" },
                            React.createElement("span", { className: "playground-metronome-run-thread-id" }, thread.id),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-metronome-run-thread-link",
                              onClick: () => {
                                if (typeof onThreadOpen === "function") {
                                  onThreadOpen(thread.id, { contentMode: "chat" });
                                }
                              },
                            }, "Show thread")
                          )
                        : null
                    )
                  ),
                  summary
                    ? React.createElement("div", { className: "playground-metronome-run-trace-summary" }, summary)
                    : null,
                  stepKind === "condition" && conditionInputText
                    ? React.createElement("div", { className: "playground-metronome-run-trace-field" },
                        React.createElement("div", { className: "playground-metronome-run-trace-field-label" }, "Input"),
                        renderMetronomeRunTraceValue(conditionInput)
                      )
                    : null,
                  stepKind === "condition"
                    ? React.createElement("div", { className: "playground-metronome-run-trace-field" },
                        React.createElement("div", { className: "playground-metronome-run-trace-field-label" }, "Branch"),
                        React.createElement("div", { className: "playground-metronome-run-branch-result" },
                          React.createElement("span", { className: "playground-metronome-run-branch-chip" }, conditionBranchLabel || "Default"),
                          conditionReason
                            ? React.createElement("span", { className: "playground-metronome-run-branch-reason" }, conditionReason)
                            : null
                        )
                      )
                    : null,
                  shouldRenderOutputText
                    ? renderMetronomeRunOutputMarkdown(readableOutputText)
                    : null
                ));
              });
              const runSummaryText = getMetronomeRunSummaryText(run);
              if (runSummaryText) {
                traceItems.push(React.createElement("div", { key: "run-summary", className: "playground-metronome-run-trace-step playground-metronome-run-trace-summary-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(FileText, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title-group" },
                      React.createElement("div", { className: "playground-metronome-run-trace-title" }, "Run summary")
                    )
                  ),
                  renderMetronomeRunOutputMarkdown(runSummaryText)
                ));
              }
            } else if (logs.length) {
              logs.forEach((log, index) => {
                traceItems.push(React.createElement("div", { key: log.id || index, className: "playground-metronome-run-trace-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(MessageSquare, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title" }, String(log.message || "Workflow event"))
                  )
                ));
              });
            }
            if (!traceItems.length) {
              traceItems.push(React.createElement("div", { key: "empty", className: "playground-metronome-run-sidebar-copy" },
                metronomeRunState.status === "loading"
                  ? "Waiting for the first workflow event..."
                  : "No run trace has been recorded yet."
              ));
            }
            const triggerMessage = includeComposerPrompt ? renderMetronomeRunTriggerMessage(run) : null;
            const workTraceItems = traceItems.filter((item) => {
              const itemKey = item && item.key != null ? String(item.key) : "";
              return itemKey !== "prompt" && itemKey !== "run-summary";
            });
            const displayedWorkTraceItems = workTraceItems.length
              ? workTraceItems
              : [
                  React.createElement("div", { key: "empty-work", className: "playground-metronome-run-sidebar-copy" },
                    metronomeRunState.status === "loading"
                      ? "Loading workflow trace..."
                      : "No workflow steps were recorded."
                  ),
                ];
            const summaryText = getMetronomeRunSummaryText(run);
            const isExpanded = metronomeRunTraceWorkExpanded;
            return React.createElement("div", { className: "tb-runner-chat playground-metronome-run-thread-list is-work-log-surface" },
              React.createElement("div", { className: "tb-turn tb-turn-user playground-metronome-run-thread-turn" },
                triggerMessage
                  ? React.createElement("div", { className: "tb-user-turn-shell tb-thread-history-anchor playground-metronome-run-thread-user-shell" },
                      triggerMessage
                    )
                  : null,
                React.createElement("button", {
                  type: "button",
                  className: "tb-work-header playground-metronome-run-thread-work-header",
                  "aria-expanded": isExpanded ? "true" : "false",
                  onClick: () => setMetronomeRunTraceWorkExpanded((current) => !current),
                },
                  React.createElement("span", { className: "tb-work-label" },
                    React.createElement("span", null, metronomeRunState.status === "loading" ? "Loading Metronome run" : "Metronome Working Logs"),
                    isExpanded
                      ? React.createElement(ChevronUp, { className: "tb-chevron", strokeWidth: 1.8 })
                      : React.createElement(ChevronDown, { className: "tb-chevron", strokeWidth: 1.8 })
                  ),
                  React.createElement("div", { className: "tb-turn-environment-pill" },
                    React.createElement(Metronome, { className: "tb-turn-environment-icon", strokeWidth: 1.6 }),
                    React.createElement("span", { className: "tb-turn-environment-label" }, activeWorkflow?.name || "Metronome")
                  )
                ),
                React.createElement("div", {
                  className: ("tb-work-collapse playground-metronome-run-thread-work " + (isExpanded ? "is-expanded" : "collapsed")).trim(),
                },
                  React.createElement("div", { className: "tb-work-collapse-inner" },
                    React.createElement("div", { className: "agent-steps-container" },
                      displayedWorkTraceItems.map((item, index) => React.createElement("div", {
                        key: (item && item.key != null ? String(item.key) : "trace") + ":" + index,
                        className: "agent-step-item",
                      },
                        React.createElement("div", { className: "agent-step-content" }, item)
                      ))
                    )
                  )
                ),
                summaryText
                  ? React.createElement("div", { className: "tb-turn-summary tb-thread-history-anchor is-latest-summary playground-metronome-run-thread-summary" },
                      React.createElement("div", { className: "tb-turn-response" },
                        renderMetronomeRunOutputMarkdown(summaryText)
                      )
                    )
                  : null
              )
            );
          };

          const renderMetronomeInlineRunDetail = (run) => {
            if (!run) {
              return React.createElement("div", { className: "playground-metronome-runs-view playground-metronome-run-thread-view" },
                React.createElement("div", { className: "playground-metronome-run-thread-empty" },
                  isLoadingMetronomeRuns ? "Loading run trace..." : "Run trace is not available."
                )
              );
            }
            return React.createElement("div", { className: "playground-metronome-runs-view playground-metronome-run-thread-view" },
              React.createElement("div", { className: "playground-metronome-run-thread-header" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-run-thread-back",
                  onClick: () => setMetronomeRunInlineDetailId(""),
                },
                  React.createElement(ChevronLeft, { width: 15, height: 15, strokeWidth: 1.9 }),
                  React.createElement("span", null, "Runs")
                ),
                React.createElement("div", { className: "playground-metronome-run-thread-heading" },
                  React.createElement("div", { className: "playground-metronome-run-thread-title-row" },
                    React.createElement(Metronome, { width: 17, height: 17, strokeWidth: 1.8 }),
                    React.createElement("h2", { className: "playground-metronome-run-thread-page-title" }, activeWorkflow?.name || "Metronome run")
                  ),
                  React.createElement("div", { className: "playground-metronome-run-thread-page-meta" },
                    React.createElement("span", null, run.id || "Run"),
                    React.createElement("span", null, formatMetronomeRunTimestamp(run.createdAt || run.startedAt))
                  )
                )
              ),
              React.createElement("div", { className: "playground-metronome-run-thread-body" },
                renderMetronomeRunTrace(run, { includeComposerPrompt: true })
              )
            );
          };

          const renderRunsMode = () => {
            const inlineRun = metronomeRunInlineDetailId
              ? metronomeRuns.find((run) => run.id === metronomeRunInlineDetailId) || null
              : null;
            if (metronomeRunInlineDetailId) {
              return renderMetronomeInlineRunDetail(inlineRun);
            }
            const normalizedRunSearchQuery = String(metronomeRunSearchQuery || "").trim().toLowerCase();
            const getRunStatusId = (run) => {
              const status = String(run?.status || "completed").trim().toLowerCase();
              if (!status) return "completed";
              if (status === "queued" || status === "pending" || status === "running" || status === "in_progress") return "running";
              if (status === "error" || status === "failed") return "failed";
              if (status === "succeeded" || status === "success") return "completed";
              return status;
            };
            const getRunStartedTimestamp = (run) => {
              const parsed = Date.parse(run?.startedAt || run?.createdAt || run?.updatedAt || "");
              return Number.isFinite(parsed) ? parsed : 0;
            };
            const getRunStepsCount = (run) => (run?.output?.steps || []).length || 0;
            const getRunThreadsCount = (run) => (run?.output?.threads || []).length || 0;
            const activeRunFilter = METRONOME_RUN_FILTER_OPTIONS.find((option) => option.id === metronomeRunFilter) || METRONOME_RUN_FILTER_OPTIONS[0];
            const visibleMetronomeRunRows = metronomeRuns
              .filter((run) => {
                const statusId = getRunStatusId(run);
                if (metronomeRunFilter !== "all" && statusId !== metronomeRunFilter) return false;
                if (!normalizedRunSearchQuery) return true;
                const haystack = [
                  getMetronomeRunPrompt(run),
                  run?.id,
                  statusId,
                  formatMetronomeRunTimestamp(run?.createdAt),
                ].map((value) => String(value || "").toLowerCase()).join(" ");
                return haystack.includes(normalizedRunSearchQuery);
              })
              .sort((left, right) => {
                if (metronomeRunSort === "run") {
                  return getMetronomeRunPrompt(left).localeCompare(getMetronomeRunPrompt(right), undefined, { sensitivity: "base" });
                }
                if (metronomeRunSort === "status") {
                  const statusDelta = getRunStatusId(left).localeCompare(getRunStatusId(right), undefined, { sensitivity: "base" });
                  if (statusDelta) return statusDelta;
                }
                if (metronomeRunSort === "steps") {
                  const stepsDelta = getRunStepsCount(right) - getRunStepsCount(left);
                  if (stepsDelta) return stepsDelta;
                }
                return getRunStartedTimestamp(right) - getRunStartedTimestamp(left);
              });
            const visibleMetronomeRunIds = visibleMetronomeRunRows
              .map((run) => String(run?.id || "").trim())
              .filter(Boolean);
            const selectedVisibleMetronomeRunIds = visibleMetronomeRunIds
              .filter((runId) => selectedMetronomeRunIds.has(runId));
            const allVisibleMetronomeRunsSelected = visibleMetronomeRunIds.length > 0
              && selectedVisibleMetronomeRunIds.length === visibleMetronomeRunIds.length;
            const openMetronomeRunFullScreen = (runId) => {
              const normalizedRunId = String(runId || "").trim();
              if (!normalizedRunId) return;
              setSelectedNodeId("");
              setIsMetronomePublishActionsMenuOpen(false);
              setIsMetronomePublishMenuOpen(false);
              setMetronomeRunToolbarPopover("");
              setMetronomeRunActionMenu(null);
              setIsMetronomeRunSidebarMenuOpen(false);
              setIsMetronomeRunSidebarOpen(false);
              setSelectedMetronomeRunId(normalizedRunId);
              setMetronomeRunInlineDetailId(normalizedRunId);
            };
            const getMetronomeRunActionTargetIds = (runId) => {
              const normalizedRunId = String(runId || "").trim();
              const selectedIds = Array.from(selectedMetronomeRunIds || [])
                .map((id) => String(id || "").trim())
                .filter((id) => id && metronomeRuns.some((run) => String(run?.id || "").trim() === id));
              if (normalizedRunId && selectedMetronomeRunIds.has(normalizedRunId) && selectedIds.length > 1) {
                return selectedIds;
              }
              return normalizedRunId ? [normalizedRunId] : [];
            };
            const removeMetronomeRunsLocally = (runIds) => {
              const deletedIdSet = new Set((Array.isArray(runIds) ? runIds : []).map((id) => String(id || "").trim()).filter(Boolean));
              if (!deletedIdSet.size) return;
              setMetronomeRuns((current) => current.filter((run) => !deletedIdSet.has(String(run?.id || "").trim())));
              setSelectedMetronomeRunIds((current) => {
                const next = new Set(current || []);
                deletedIdSet.forEach((runId) => next.delete(runId));
                return next;
              });
              setSelectedMetronomeRunId((current) => deletedIdSet.has(String(current || "").trim()) ? "" : current);
              setMetronomeRunInlineDetailId((current) => deletedIdSet.has(String(current || "").trim()) ? "" : current);
            };
            const deleteMetronomeRunsByIds = (runIds) => {
              const targetIds = Array.from(new Set((Array.isArray(runIds) ? runIds : [])
                .map((id) => String(id || "").trim())
                .filter(Boolean)));
              if (!targetIds.length) return;
              setMetronomeRunActionMenu(null);
              const confirmed = window.confirm("Delete " + (targetIds.length > 1 ? targetIds.length + " Metronome runs" : "this Metronome run") + "?");
              if (!confirmed) return;
              setMetronomeRunState({ status: "loading", message: "Deleting run" + (targetIds.length > 1 ? "s" : "") + "..." });
              void Promise.allSettled(targetIds.map(async (runId) => {
                const run = metronomeRuns.find((item) => String(item?.id || "").trim() === runId) || null;
                const workflowId = String(run?.metronomeId || activeWorkflow?.id || "").trim();
                if (workflowId && runId) {
                  try {
                    await deleteMetronomeRunApi(workflowId, runId);
                  } catch (error) {
                    if (error?.status !== 404 && error?.status !== 405) {
                      throw error;
                    }
                  }
                }
                return runId;
              })).then((results) => {
                const deletedIds = results
                  .filter((result) => result.status === "fulfilled")
                  .map((result) => result.value)
                  .filter(Boolean);
                if (deletedIds.length) {
                  removeMetronomeRunsLocally(deletedIds);
                }
                const failed = results.find((result) => result.status === "rejected");
                if (failed) {
                  setMetronomeRunState({
                    status: "error",
                    message: failed.reason instanceof Error ? failed.reason.message : "Failed to delete one or more runs.",
                  });
                } else {
                  setMetronomeRunState({ status: "idle", message: "" });
                }
              });
            };
            const metronomeRunColumns = [
              {
                id: "run",
                header: "Run",
                accessor: getMetronomeRunPrompt,
                sortable: true,
                width: "minmax(260px, 1.6fr)",
                cell: ({ row: run }) => React.createElement("div", { className: "playground-metronome-table-main" },
                  React.createElement("div", { className: "playground-metronome-table-title" }, getMetronomeRunPrompt(run)),
                  React.createElement("div", { className: "playground-metronome-table-subtitle" }, run.id || "Draft run")
                ),
              },
              {
                id: "recent",
                header: "Started",
                accessor: getRunStartedTimestamp,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(130px, 0.78fr)",
                cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, formatMetronomeRunTimestamp(run.createdAt)),
              },
              {
                id: "steps",
                header: "Steps",
                accessor: getRunStepsCount,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(80px, 0.42fr)",
                align: "end",
                hideBelow: 650,
                cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, String(getRunStepsCount(run))),
              },
              {
                id: "threads",
                header: "Threads",
                accessor: getRunThreadsCount,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(85px, 0.45fr)",
                align: "end",
                hideBelow: 760,
                cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, String(getRunThreadsCount(run))),
              },
              {
                id: "status",
                header: "Status",
                accessor: getRunStatusId,
                sortable: true,
                width: "minmax(105px, 0.58fr)",
                cell: ({ row: run }) => renderMetronomeRunStatusLabel(run),
              },
            ];
            const metronomeRunsPlatformTable = React.createElement(PlatformDataTable, {
              rows: visibleMetronomeRunRows,
              columns: metronomeRunColumns,
              getRowId: (run) => String(run?.id || ""),
              ariaLabel: "Metronome runs",
              className: "playground-metronome-runs-platform-data-table",
              sorting: {
                value: { id: metronomeRunSort, direction: metronomeRunSortDirection },
                onChange: (next) => {
                  if (!next) {
                    setMetronomeRunSort("recent");
                    setMetronomeRunSortDirection("desc");
                    return;
                  }
                  setMetronomeRunSort(next.id);
                  setMetronomeRunSortDirection(next.direction);
                },
              },
              selection: {
                enabled: true,
                value: selectedMetronomeRunIds,
                onChange: ({ selectedIds }) => setSelectedMetronomeRunIds(new Set(selectedIds)),
                ariaLabel: (run) => "Select run " + String(run?.id || ""),
              },
              toolbar: {
                search: {
                  value: metronomeRunSearchQuery,
                  onChange: setMetronomeRunSearchQuery,
                  placeholder: "Search runs",
                  manual: true,
                },
                filters: [{
                  id: "run-status",
                  label: "Filter",
                  value: metronomeRunFilter,
                  onChange: setMetronomeRunFilter,
                  options: METRONOME_RUN_FILTER_OPTIONS,
                }],
              },
              onRowActivate: (run) => openMetronomeRunFullScreen(run.id),
              getRowActions: () => [{
                id: "delete",
                label: "Delete",
                icon: Trash2,
                danger: true,
                onSelect: ({ rows }) => deleteMetronomeRunsByIds(rows.map((run) => run.id)),
              }],
              loading: isLoadingMetronomeRuns,
              error: metronomeRunsError
                ? React.createElement("div", { className: "playground-metronome-table-main" },
                    React.createElement("div", { className: "playground-metronome-table-title" }, "Runs unavailable"),
                    React.createElement("div", { className: "playground-metronome-table-subtitle" }, metronomeRunsError)
                  )
                : null,
              emptyState: React.createElement("div", { className: "playground-metronome-table-main" },
                React.createElement("div", { className: "playground-metronome-table-title" }, metronomeRuns.length ? "No matching runs" : "No runs yet"),
                React.createElement("div", { className: "playground-metronome-table-subtitle" }, metronomeRuns.length ? "Try a different search term or filter." : "Start this workflow from the Run button.")
              ),
              noResultsState: "No matching runs.",
            });
            return React.createElement("div", { className: "playground-metronome-runs-view" },
              React.createElement("div", { className: "playground-metronome-runs-header" },
                React.createElement("div", null,
                  React.createElement("h2", { className: "playground-metronome-runs-title" }, "Runs")
                ),
                React.createElement("div", { className: "playground-metronome-runs-actions" },
                  renderMetronomeHeaderControls()
                )
              ),
              React.createElement("div", { className: "playground-metronome-runs-layout" },
                React.createElement("section", {
                    className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-team-grid-table-section playground-metronome-runs-table-section",
                  },
                  metronomeRunsPlatformTable
                )
              )
            );
          };

          const renderMetronomeRunSidebar = () => {
            if (!isMetronomeRunSidebarOpen) return null;
            const isRunning = metronomeRunState.status === "loading";
            const selectedRunForSidebar = selectedMetronomeRunId
              ? metronomeRuns.find((run) => run.id === selectedMetronomeRunId) || null
              : null;
            const selectedRunCosts = calculateMetronomeRunCostBreakdown(selectedRunForSidebar);
            const selectedAgentId = metronomeRunAgentId || defaultMetronomeAgentOption?.id || "";
            const selectedEnvironmentId = metronomeRunEnvironmentId || defaultMetronomeComputerOption?.id || "";
            const startedLabel = selectedRunForSidebar
              ? formatMetronomeRunTimestamp(selectedRunForSidebar.startedAt || selectedRunForSidebar.createdAt)
              : "Not started";
            const addSelectedRunToProject = () => {
              setIsMetronomeRunSidebarMenuOpen(false);
              if (!selectedRunForSidebar) {
                setMetronomeRunState({ status: "error", message: "Start or select a run before adding it to a project." });
                return;
              }
              const defaultProject = metronomeProjectOptions[0] || null;
              const nextProjectId = window.prompt("Project ID", defaultProject?.id || "");
              const normalizedProjectId = String(nextProjectId || "").trim();
              if (!normalizedProjectId) return;
              const selectedProject = metronomeProjectOptions.find((option) => option.id === normalizedProjectId) || null;
              setMetronomeRuns((current) => current.map((run) => run.id === selectedRunForSidebar.id
                ? {
                    ...run,
                    projectId: normalizedProjectId,
                    projectName: selectedProject?.name || normalizedProjectId,
                    updatedAt: new Date().toISOString(),
                  }
                : run
              ));
              setMetronomeRunState({ status: "idle", message: "" });
            };
            const deleteSelectedRun = () => {
              setIsMetronomeRunSidebarMenuOpen(false);
              if (!selectedRunForSidebar) {
                setMetronomeRunState({ status: "error", message: "Select a run before deleting it." });
                return;
              }
              const confirmed = window.confirm("Delete this Metronome run?");
              if (!confirmed) return;
              const runId = selectedRunForSidebar.id;
              const workflowId = selectedRunForSidebar.metronomeId || activeWorkflow?.id || "";
              const removeRunLocally = () => {
                setMetronomeRuns((current) => current.filter((run) => run.id !== runId));
                setSelectedMetronomeRunId("");
                setMetronomeRunState({ status: "idle", message: "" });
              };
              if (workflowId && runId) {
                void deleteMetronomeRunApi(workflowId, runId)
                  .then(removeRunLocally)
                  .catch((error) => {
                    if (error?.status === 404 || error?.status === 405) {
                      removeRunLocally();
                      return;
                    }
                    setMetronomeRunState({
                      status: "error",
                      message: error instanceof Error ? error.message : "Failed to delete run.",
                    });
                  });
              } else {
                removeRunLocally();
              }
            };
            return React.createElement("aside", { className: "playground-metronome-node-inspector playground-metronome-run-sidebar" },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-metronome-run-sidebar-header" },
                React.createElement("div", { className: "playground-metronome-run-sidebar-title" }, selectedRunForSidebar ? "Run trace" : "New chat"),
                React.createElement("div", { className: "playground-metronome-run-sidebar-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-run-sidebar-new-run",
                    onClick: () => {
                      setSelectedMetronomeRunId("");
                      setMetronomeRunState({ status: "idle", message: "" });
                      setIsMetronomeRunSidebarMenuOpen(false);
                    },
                  },
                    React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }),
                    React.createElement("span", null, "New Run")
                  ),
                  React.createElement("span", { className: "playground-metronome-run-sidebar-divider", "aria-hidden": "true" }),
                  React.createElement("span", { className: "playground-metronome-run-sidebar-menu-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-run-sidebar-menu-trigger",
                      onClick: () => setIsMetronomeRunSidebarMenuOpen((open) => !open),
                      "aria-label": "Run options",
                      "aria-expanded": isMetronomeRunSidebarMenuOpen ? "true" : "false",
                    }, React.createElement(Ellipsis, { width: 15, height: 15, strokeWidth: 1.8 })),
                    isMetronomeRunSidebarMenuOpen
                      ? React.createElement(PlatformPopupSurface, {
                          className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-metronome-run-sidebar-menu",
                          role: "menu",
                        },
                          React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
                            React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, "Workflow ID"),
                              React.createElement("span", { className: "playground-thread-nav-popup-thread-id" }, activeWorkflow?.id || "Draft workflow")
                            )
                          ),
                          React.createElement("div", { className: "playground-thread-nav-popup-divider" }),
                          React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
                            React.createElement("div", { className: "playground-thread-nav-popup-fact" },
                              React.createElement("span", { className: "playground-thread-nav-popup-fact-label" }, "Started"),
                              React.createElement("span", { className: "playground-thread-nav-popup-fact-value" }, startedLabel)
                            )
                          ),
                          React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
                            React.createElement("div", { className: "playground-thread-nav-popup-fact" },
                              React.createElement("span", { className: "playground-thread-nav-popup-fact-label" }, "LLM Inference"),
                              React.createElement("span", { className: "playground-thread-nav-popup-fact-value" }, formatMetronomeRunCostCt(selectedRunCosts.llmInference))
                            )
                          ),
                          React.createElement("div", { className: "tb-popup-row playground-thread-nav-popup-static-row" },
                            React.createElement("div", { className: "playground-thread-nav-popup-fact" },
                              React.createElement("span", { className: "playground-thread-nav-popup-fact-label" }, "Resources"),
                              React.createElement("span", { className: "playground-thread-nav-popup-fact-value" }, formatMetronomeRunCostCt(selectedRunCosts.resources))
                            )
                          ),
                          React.createElement("div", { className: "playground-thread-nav-popup-divider" }),
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-row",
                            onClick: addSelectedRunToProject,
                          },
                            React.createElement(FolderOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Add to Project")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-row is-danger",
                            onClick: deleteSelectedRun,
                          },
                            React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Delete Run")
                          )
                        )
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-metronome-inspector-close",
                    onClick: closeMetronomeRunSidebar,
                    "aria-label": "Close run panel",
                  }, React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 }))
                )
              ),
              React.createElement("div", { className: "playground-metronome-run-sidebar-body" },
                selectedRunForSidebar
                  ? renderMetronomeRunTrace(selectedRunForSidebar, { includeComposerPrompt: true })
                  : React.createElement("div", { className: "playground-metronome-run-empty-state" },
                      React.createElement("div", { className: "playground-metronome-run-empty-card" },
                        React.createElement("img", {
                          className: "playground-metronome-run-empty-image",
                          src: "/img/empty-state/metronome.webp",
                          alt: "",
                          "aria-hidden": "true",
                        }),
                        React.createElement("h3", { className: "playground-metronome-run-empty-title" }, "Preview your workflow"),
                        React.createElement("p", { className: "playground-metronome-run-empty-copy" }, "Send a prompt as if you're the user.")
                      )
                    ),
                isRunning
                  ? React.createElement("div", { className: "playground-metronome-run-running-row" },
                      React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Running workflow...")
                    )
                  : null,
                metronomeRunState.message && metronomeRunState.status === "error"
                  ? React.createElement("div", { className: "playground-metronome-run-sidebar-log is-error" }, metronomeRunState.message)
                  : null
              ),
              React.createElement("div", { className: "playground-metronome-run-sidebar-composer" },
                React.createElement(RunnerChat, {
                  key: "metronome-run-composer:" + (activeWorkflow?.id || "new") + ":" + (selectedRunForSidebar?.id || "draft"),
                  className: "playground-metronome-run-sidebar-runner-chat",
                  backendUrl,
                  apiKey,
                  requestHeaders,
                  appId: "runner-web-sdk-demo",
                  environmentId: selectedEnvironmentId,
                  agentId: selectedAgentId,
                  agents: metronomeAgentOptions,
                  environments: metronomeComputerOptions,
                  inputMode: "computer-agents",
                  placeholder: "Message this workflow...",
                  autoCreateThread: true,
                  autoFocusComposer: !selectedRunForSidebar,
                  keepFocusOnSubmit: true,
                  showUsageInStatus: false,
                  maxAttachments: 10,
                  disabled: isRunning,
                  onAgentChange: (nextAgentId) => {
                    const normalizedNextAgentId = String(nextAgentId || "").trim();
                    if (normalizedNextAgentId) {
                      setMetronomeRunAgentId(normalizedNextAgentId);
                    }
                  },
                  onEnvironmentChange: (nextEnvironmentId) => {
                    const normalizedNextEnvironmentId = String(nextEnvironmentId || "").trim();
                    if (normalizedNextEnvironmentId) {
                      setMetronomeRunEnvironmentId(normalizedNextEnvironmentId);
                    }
                  },
                  onExternalRunRequestCreate: (request) => {
                    const prompt = String(request?.displayPrompt || request?.prompt || "").trim();
                    setMetronomeRunPrompt(prompt);
                    if (request?.agentId) {
                      setMetronomeRunAgentId(String(request.agentId || "").trim());
                    }
                    if (request?.environmentId) {
                      setMetronomeRunEnvironmentId(String(request.environmentId || "").trim());
                    }
                    void startMetronomeRun(prompt, {
                      agentId: request?.agentId || selectedAgentId,
                      environmentId: request?.environmentId || selectedEnvironmentId,
                      sourceThreadId: request?.threadId || null,
                      attachments: Array.isArray(request?.attachments) ? request.attachments : [],
                      enabledSkills: request?.enabledSkills || null,
                    });
                    return true;
                  },
                  onRunError: (error) => {
                    setMetronomeRunState({
                      status: "error",
                      message: error instanceof Error ? error.message : "Failed to start workflow run.",
                    });
                  },
                  onOpenPlansBudget: () => {},
                  onDocumentPreviewOpenChange: () => {},
                  onDeepResearchDetailOpenChange: () => {},
                })
              )
            );
          };

          const renderMetronomeRunSidebarPortal = () => {
            const sidebar = renderMetronomeRunSidebar();
            if (!sidebar) return null;
            if (!inspectorPortalId || typeof document === "undefined" || typeof createPortal !== "function") {
              return inspectorPortalId ? null : sidebar;
            }
            const portalTarget = document.getElementById(inspectorPortalId);
            return portalTarget ? createPortal(sidebar, portalTarget) : null;
          };

          const renderMetronomeChangesMode = () => React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-metronome-editor" },
              React.createElement("main", { className: "playground-metronome-editor-main" },
                React.createElement("div", { className: "playground-metronome-version-changes-shell" },
                  renderMetronomeVersionChangesPage()
                )
              )
            ),
            renderMetronomePublishSidebarPortal(),
            renderMetronomeRunSidebarPortal()
          );
`;
