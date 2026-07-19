export const PROJECTS_DATA_02_FRAGMENT = `          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return;
          setProjectEnvironmentFilePickerExpandedFolders((current) =>
            current.includes(normalizedPath)
              ? current.filter((value) => value !== normalizedPath)
              : current.concat(normalizedPath)
          );
        }

        async function handleAttachProjectEnvironmentFiles() {
          if (!projectEnvironmentFilePickerOpen || !activeProjectAttachmentEnvironmentId) {
            return;
          }
          const selectedEntries = projectEnvironmentFilePickerInventory.filter((entry) =>
            projectEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
          );
          if (!selectedEntries.length) {
            return;
          }

          setProjectEnvironmentFilePickerState((current) => ({
            ...current,
            error: "",
          }));
          setProjectAttachmentTransferState((current) => ({
            ...current,
            error: "",
            isProcessing: true,
          }));

          try {
            const uploadedAttachments = [];
            const folderAttachments = [];

            for (const entry of selectedEntries) {
              if (entry.isFolder) {
                const folderAttachment = buildProjectEnvironmentFolderAttachment(entry, activeProjectAttachmentEnvironmentId);
                if (folderAttachment) {
                  folderAttachments.push(folderAttachment);
                }
                continue;
              }
              const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, activeProjectAttachmentEnvironmentId, entry.path);
              const response = await fetch(downloadUrl, {
                method: "GET",
                headers: requestHeaders,
              });
              if (!response.ok) {
                throw new Error("Failed to load " + (entry.name || "file") + " (" + response.status + ")");
              }
              const blob = await response.blob();
              const file = new globalThis.File([blob], entry.name || "file", {
                type: entry.mimeType || blob.type || "application/octet-stream",
              });
              uploadedAttachments.push(await uploadTaskAttachment(file, {
                environmentId: activeProjectAttachmentEnvironmentId,
                sourcePath: entry.path,
              }));
            }

            const attachmentCandidates = folderAttachments.concat(uploadedAttachments);
            const attached = await appendUploadedProjectAttachments(attachmentCandidates);
            if (attached || attachmentCandidates.length > 0) {
              setProjectEnvironmentFilePickerOpen(false);
              setProjectEnvironmentFilePickerSelectedPaths([]);
              setProjectEnvironmentFilePickerSearch("");
              setProjectAttachmentTransferState((current) => ({
                ...current,
                error: "",
                isProcessing: false,
              }));
            } else {
              setProjectAttachmentTransferState((current) => ({
                ...current,
                isProcessing: false,
              }));
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to attach project environment items.";
            setProjectAttachmentTransferState((current) => ({
              ...current,
              error: errorMessage,
              isProcessing: false,
            }));
            setProjectEnvironmentFilePickerState((current) => ({
              ...current,
              error: errorMessage,
            }));
          }
        }

        function handleProjectAttachmentPreviewToggle(attachment) {
          if (!attachment?.id) return;
          setProjectPreviewedAttachmentId((current) => current === attachment.id ? "" : attachment.id);
        }

        async function handleRemoveProjectAttachment(attachmentId) {
          const currentProjectAttachments = normalizePlaygroundTaskAttachmentList(projectAttachmentHostRecord?.attachments);
          const targetAttachment = currentProjectAttachments.find((attachment) => attachment.id === attachmentId) || null;
          if (!targetAttachment) return;
          revokeTaskAttachmentObjectUrl(targetAttachment.previewUrl);
          revokeTaskAttachmentObjectUrl(targetAttachment.url);
          if (projectPreviewedAttachmentId === attachmentId) {
            setProjectPreviewedAttachmentId("");
          }
          if (missionControlStrategyOpen && selectedProjectId) {
            try {
              await persistProjectMissionControlRecord(selectedProjectId, buildMissionControlRecordForSave(), {
                projectOverrides: {
                  attachments: currentProjectAttachments.filter((attachment) => attachment.id !== attachmentId),
                },
                successMessage: "",
              });
            } catch {}
            return;
          }
          if (!projectComposerOpen && selectedProjectId) {
            try {
              await persistProjectMissionControlRecord(selectedProjectId, buildMissionControlRecordForSave(), {
                projectOverrides: {
                  attachments: currentProjectAttachments.filter((attachment) => attachment.id !== attachmentId),
                },
                quiet: true,
                successMessage: "",
              });
            } catch {}
            return;
          }
          setProjectDraft((current) => ({
            ...current,
            attachments: normalizePlaygroundTaskAttachmentList(current.attachments).filter((attachment) => attachment.id !== attachmentId),
          }));
        }

        function renderProjectEnvironmentFilePickerRow(row) {
          const entry = row.entry;
          const normalizedPath = normalizeHistoryPath(entry.path);
          const isSelected = projectEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
          const isExpanded = projectEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
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
                  toggleProjectEnvironmentFileFolder(normalizedPath);
                  return;
                }
                toggleProjectEnvironmentFileSelection(normalizedPath);
              },
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (entry.isFolder && !row.searchMatch) {
                    toggleProjectEnvironmentFileFolder(normalizedPath);
                    return;
                  }
                  toggleProjectEnvironmentFileSelection(normalizedPath);
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
                      toggleProjectEnvironmentFileFolder(normalizedPath);
                    },
                  },
                    isExpanded
                      ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                      : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                  )
                : !row.searchMatch
                  ? React.createElement("span", {
                      className: "tb-file-browser-item-leading",
                      "aria-hidden": "true",
                      style: { cursor: "default", pointerEvents: "none" },
                    })
                  : null,
              React.createElement("div", {
                className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                onClick: (event) => {
                  event.stopPropagation();
                  toggleProjectEnvironmentFileSelection(normalizedPath);
                },
              },
                isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
              ),
              renderTaskEnvironmentFilePickerIcon(entry),
              React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
              React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
              React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
            )
          );
        }

        function renderProjectEnvironmentFilePicker() {
          if (!projectEnvironmentFilePickerOpen) {
            return null;
          }

          const selectedItemsCount = projectEnvironmentFilePickerInventory.filter((entry) =>
            projectEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
          ).length;

	          const pickerElement = React.createElement("div", { className: "tb-runner-chat playground-project-environment-file-picker-portal" },
	            React.createElement(PlatformModalBackdrop, {
	              className: "tb-file-browser-scrim",
	              onClick: () => setProjectEnvironmentFilePickerOpen(false),
            },
              React.createElement(PlatformModalSurface, {
                className: "tb-file-browser-modal",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "tb-file-browser-body" },
                  renderTaskDetailFileBrowserSidebar("workspace", projectEnvironmentFilePickerSearch, setProjectEnvironmentFilePickerSearch, {
                    environment: activeProjectAttachmentEnvironment,
                    showIntegrations: false,
                  }),
                  React.createElement("div", { className: "tb-file-browser-main" },
                    React.createElement("div", { className: "tb-file-browser-header" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-nav-button",
                        onClick: () => setProjectEnvironmentFilePickerOpen(false),
                        "aria-label": "Close environment files",
                      }, React.createElement(X, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                      React.createElement("div", { className: "tb-file-browser-header-icon" },
                        React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 })
                      ),
                      React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                        React.createElement("span", { className: "tb-file-browser-breadcrumb-chip" },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-file-browser-breadcrumb active",
                          }, activeProjectAttachmentEnvironment?.name || "Environment")
                        )
                      ),
                      React.createElement("div", { className: "tb-file-browser-count" }, selectedItemsCount + (selectedItemsCount === 1 ? " item selected" : " items selected"))
                    ),
                    React.createElement("div", { className: "tb-file-browser-list" },
                      projectEnvironmentFilePickerState.status === "loading"
                        ? React.createElement("div", { className: "tb-file-browser-empty" }, "Loading environment files...")
                        : projectEnvironmentFilePickerState.error
                          ? React.createElement("div", { className: "tb-file-browser-empty" }, projectEnvironmentFilePickerState.error)
                          : projectEnvironmentFilePickerRows.length === 0
                            ? React.createElement("div", { className: "tb-file-browser-empty" }, projectEnvironmentFilePickerSearch.trim() ? "No matching files found." : "No files found in this environment.")
                            : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                projectEnvironmentFilePickerRows.map((row) => renderProjectEnvironmentFilePickerRow(row))
                              )
                    )
                  )
                ),
                React.createElement("div", { className: "tb-file-browser-footer" },
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                    onClick: () => setProjectEnvironmentFilePickerOpen(false),
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                    onClick: () => void handleAttachProjectEnvironmentFiles(),
                    disabled: selectedItemsCount === 0 || projectAttachmentTransferState.isProcessing,
                  },
                    React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                      projectAttachmentTransferState.isProcessing
                        ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                        : null,
                      React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                        projectAttachmentTransferState.isProcessing ? "Attaching Items..." : "Attach Items"
                      )
                    )
                  )
                )
              )
	            )
	          );
	          return typeof document !== "undefined" && document.body
	            ? createPortal(pickerElement, document.body)
	            : pickerElement;
	        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.draftFactory}
        function buildProjectReleaseDraft(projectRecord = selectedProject) {
          const base = buildPlaygroundDefaultReleaseDraft();
          return {
            ...base,
            projectId: projectRecord?.id || null,
            sortOrder: releases.length + 1,
          };
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.status}
        function clearProjectWorkspace(options = {}) {
          const preserveSchedule = Boolean(options?.preserveSchedule);
          setTasks([]);
          setReleases([]);
          setSprints([]);
          if (!preserveSchedule) {
            setSchedules([]);
          }
          setSelectedReleaseId("");
          setReleaseToolbarPopover("");
          setReleaseBacklogToolbarPopover("");
          setReleaseComposerOpen(false);
          setReleaseComposerVisible(false);
          setReleaseComposerClosing(false);
          setReleaseComposerMode("create");
          setReleaseDraft(buildPlaygroundDefaultReleaseDraft());
          setReleaseSaveState({
            isSaving: false,
            error: "",
          });
          if (!preserveSchedule) {
            setSelectedScheduleId("");
            setScheduleViewMode("calendar");
            setScheduleEditorMode("create");
            setScheduleDraft(buildPlaygroundDefaultScheduleDraft());
            resetScheduleSaveState("");
          }
          setSelectedTaskId("");
          setProjectTaskDetailScreenOpen(false);
          setDraftTask(null);
          setBacklogToolbarPopover("");
          setProjectOverviewCostSummaryState({
            status: "idle",
            error: "",
            summary: null,
          });
          setTaskLoadState({
            status: "idle",
            error: "",
          });
          if (!preserveSchedule) {
            setScheduleLoadState({
              status: "idle",
              error: "",
            });
          }
          setSelectedProjectDetail({
            project: null,
            summary: buildEmptyPlaygroundProjectSummary(),
            environments: [],
            recentThreads: [],
            threads: [],
          });
          editorDirtyRef.current = false;
          resetSaveState("");
        }

        function resetProjectConnectorBrowserUiState(options = {}) {
          if (taskConnectorBrowserOpenFrameRef.current) {
            window.cancelAnimationFrame(taskConnectorBrowserOpenFrameRef.current);
            taskConnectorBrowserOpenFrameRef.current = null;
          }
          projectConnectorBrowserActiveRef.current = false;
          setTaskConnectorBrowserOpen(false);
          setTaskConnectorBrowserMode("task");
          setProjectConnectorBrowserDialog(null);
          setTaskConnectorBrowserHistory([{ source: "github", folderId: null }]);
          setTaskConnectorBrowserHistoryIndex(0);
          setTaskConnectorBrowserSearchQuery("");
          setTaskConnectorBrowserPreviewId("");
          setTaskConnectorBrowserExpandedFolderIds([]);
          setTaskConnectorBrowserPreviewState({
            status: "idle",
            kind: "",
            content: "",
            error: "",
          });
        }

        function handleSelectProject(projectId, options = {}) {
          const normalizedProjectId = String(projectId || "").trim();
          const preserveProjectConnectorBrowser = Boolean(options?.preserveProjectConnectorBrowser);
          const isSameSelectedProject = Boolean(normalizedProjectId) && normalizedProjectId === selectedProjectId;
          const preserveStandaloneSchedule = Boolean(isStandaloneCalendarMode && !normalizedProjectId);
          setProjectComposerOpen(false);
          setProjectComposerMode("create");
          setProjectIconPickerOpen(false);
          setProjectSidebarPopover("");
          if (!preserveProjectConnectorBrowser) {
            resetProjectConnectorBrowserUiState();
          }
          setSelectedProjectId(normalizedProjectId);
          setSelectedTaskId("");
          setProjectTaskDetailScreenOpen(false);
          setDraftTask(null);
          if (!preserveStandaloneSchedule) {
            setSelectedScheduleId("");
            setScheduleViewMode("calendar");
            setScheduleEditorMode("create");
            setScheduleDraft(buildPlaygroundDefaultScheduleDraft());
            resetScheduleSaveState("");
          }
          setBacklogComposerKey((current) => current + 1);
          setBacklogComposerEnvironmentId("");
          setBacklogComposerAgentId(initialAgentId || "");
          setBacklogToolbarPopover("");
          setReleaseToolbarPopover("");
          setReleaseBacklogToolbarPopover("");
          setSelectedReleaseId("");
          setReleaseComposerOpen(false);
          setReleaseComposerVisible(false);
          setReleaseComposerClosing(false);
          setReleaseComposerMode("create");
          setReleaseDraft(buildPlaygroundDefaultReleaseDraft());
          setReleaseSaveState({
            isSaving: false,
            error: "",
          });
          setSearchQuery("");
          setTaskView(isStandaloneCalendarMode ? "calendar" : "overview");
          setBoardSprintId(PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID);
          setSprintComposerOpen(false);
          setSprintDraft(buildPlaygroundDefaultSprintDraft());
          editorDirtyRef.current = false;
          resetSaveState("");
          if (!normalizedProjectId) {
            clearProjectWorkspace({ preserveSchedule: isStandaloneCalendarMode });
          } else {
            setTasks([]);
            setReleases([]);
            setSprints([]);
            setSchedules([]);
            setTaskLoadState({
              status: "loading",
              error: "",
            });
            setScheduleLoadState({
              status: "loading",
              error: "",
            });
            if (isSameSelectedProject) {
              void loadProjectWorkspace(normalizedProjectId);
              void loadProjectSchedules(normalizedProjectId, visibleScheduleCalendarRange);
            }
          }
        }

        function openProjectComposer(options = {}) {
          if (projectInitialSetupModalCloseTimerRef.current) {
            window.clearTimeout(projectInitialSetupModalCloseTimerRef.current);
            projectInitialSetupModalCloseTimerRef.current = null;
          }
          if (projectInitialSetupModalFrameRef.current) {
            window.cancelAnimationFrame(projectInitialSetupModalFrameRef.current);
            projectInitialSetupModalFrameRef.current = null;
          }
          setProjectInitialSetupModalVisible(false);
          setProjectInitialSetupModalClosing(false);
          const defaultProjectEnvironmentId = projectComposerDefaultEnvironmentId || null;
          const initialName = String(options?.name || "").trim();
          const initialDescription = String(options?.description || options?.goal || "").trim();
          const initialProjectBlueprint = getPlaygroundProjectBlueprint(options?.projectType || options?.type || options?.blueprintId);
          const defaultLeadName = String(currentUserName || currentUserEmail || "Project Lead").trim();
          const defaultLeadEmail = String(currentUserEmail || "").trim();
          const defaultLeadAvatarUrl = String(currentUserAvatarUrl || "").trim();
          const defaultLeadUserId = defaultLeadEmail || defaultLeadName || "current";
          const defaultProjectDraft = buildPlaygroundDefaultProjectDraft();
          projectDraftNameDirtyRef.current = Boolean(initialName);
          projectDraftTypedNameRef.current = initialName;
          setProjectComposerMode("create");
          setProjectDraft(applyPlaygroundProjectBlueprintToDraft({
            ...defaultProjectDraft,
            ...(initialName ? { name: initialName } : {}),
            ...(initialDescription ? { description: initialDescription } : {}),
            defaultEnvironmentId: defaultProjectEnvironmentId,
            leadUserId: defaultLeadUserId,
            leadName: defaultLeadName,
            leadEmail: defaultLeadEmail,
            leadAvatarUrl: defaultLeadAvatarUrl,
            metadata: {
              ...(defaultProjectDraft.metadata || {}),
              leadUserId: defaultLeadUserId,
              leadName: defaultLeadName,
              leadEmail: defaultLeadEmail,
              leadAvatarUrl: defaultLeadAvatarUrl,
              lead: {
                userId: defaultLeadUserId,
                name: defaultLeadName,
                email: defaultLeadEmail,
                avatarUrl: defaultLeadAvatarUrl,
              },
            },
          }, initialProjectBlueprint.id, { forceVisualDefaults: true, replaceRules: true }));
          setProjectDescriptionEditing(Boolean(initialDescription));
          setProjectBlueprintPickerOpen(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectPreviewedAttachmentId("");
          setProjectAttachmentTransferState({
            uploadingIds: [],
            error: "",
            isProcessing: false,
          });
          setIsProjectAttachmentDragging(false);
          setProjectEnvironmentFilePickerOpen(false);
          setProjectEnvironmentFilePickerInventory([]);
          setProjectEnvironmentFilePickerState({
            status: "idle",
            error: "",
          });
          setProjectEnvironmentFilePickerSearch("");
          setProjectEnvironmentFilePickerExpandedFolders([]);
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectSaveState({
            isSaving: false,
            error: "",
          });
          setProjectIconPickerOpen(false);
          setProjectSidebarPopover("");
          setMissionControlStrategyOpen(false);
          setMissionControlSetupOpen(false);
          setProjectComposerOpen(true);
          projectInitialSetupModalFrameRef.current = window.requestAnimationFrame(() => {
            projectInitialSetupModalFrameRef.current = window.requestAnimationFrame(() => {
              projectInitialSetupModalFrameRef.current = null;
              setProjectInitialSetupModalVisible(true);
            });
          });
        }

        function openProjectComposerForEdit(projectRecord) {
          if (projectInitialSetupModalCloseTimerRef.current) {
            window.clearTimeout(projectInitialSetupModalCloseTimerRef.current);
            projectInitialSetupModalCloseTimerRef.current = null;
          }
          if (projectInitialSetupModalFrameRef.current) {
            window.cancelAnimationFrame(projectInitialSetupModalFrameRef.current);
            projectInitialSetupModalFrameRef.current = null;
          }
          setProjectInitialSetupModalVisible(false);
          setProjectInitialSetupModalClosing(false);
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject || buildPlaygroundDefaultProjectDraft());
          const projectIndex = projects.findIndex((project) => project.id === normalizedProject.id);
          const activeEditDraft = projectComposerOpen
            && projectComposerMode === "edit"
            && projectDraft?.id === normalizedProject.id
              ? projectDraft
              : null;
          if (!activeEditDraft) {
            projectDraftNameDirtyRef.current = false;
            projectDraftTypedNameRef.current = "";
          }
          const nextProjectDraft = activeEditDraft && projectDraftNameDirtyRef.current
            ? mergePlaygroundProjectRecords(activeEditDraft, normalizedProject) || activeEditDraft
            : normalizedProject;
          const wallpaperConfig = getPlaygroundProjectWallpaperConfig(projectRecord || nextProjectDraft, projectIndex >= 0 ? projectIndex : 0);
          setProjectComposerMode("edit");
          setProjectDraft((current) => preserveDirtyProjectDraftName({
            ...nextProjectDraft,
            wallpaperId: getPlaygroundProjectWallpaperId(nextProjectDraft.wallpaperId, wallpaperConfig.id),
          }, current));
          setProjectDescriptionEditing(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectPreviewedAttachmentId("");
          setProjectAttachmentTransferState({
            uploadingIds: [],
            error: "",
            isProcessing: false,
          });
          setIsProjectAttachmentDragging(false);
          setProjectEnvironmentFilePickerOpen(false);
          setProjectEnvironmentFilePickerInventory([]);
          setProjectEnvironmentFilePickerState({
            status: "idle",
            error: "",
          });
          setProjectEnvironmentFilePickerSearch("");
          setProjectEnvironmentFilePickerExpandedFolders([]);
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectSaveState({
            isSaving: false,
            error: "",
          });
          setProjectIconPickerOpen(false);
          setProjectSidebarPopover("");
          setMissionControlStrategyOpen(false);
          setMissionControlSetupOpen(true);
          setMissionControlSetupResetToken((current) => current + 1);
          void ensureMissionControlAgent();
          setProjectComposerOpen(true);
        }

        function finishCloseProjectComposer() {
          projectDraftNameDirtyRef.current = false;
          projectDraftTypedNameRef.current = "";
          if (projectInitialSetupModalCloseTimerRef.current) {
            window.clearTimeout(projectInitialSetupModalCloseTimerRef.current);
            projectInitialSetupModalCloseTimerRef.current = null;
          }
          if (projectInitialSetupModalFrameRef.current) {
            window.cancelAnimationFrame(projectInitialSetupModalFrameRef.current);
            projectInitialSetupModalFrameRef.current = null;
          }
          setProjectInitialSetupModalVisible(false);
          setProjectInitialSetupModalClosing(false);
          setProjectComposerOpen(false);
          setMissionControlSetupOpen(false);
          setProjectComposerMode("create");
          setProjectIconPickerOpen(false);
          setProjectBlueprintPickerOpen(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectDraft(buildPlaygroundDefaultProjectDraft());
          setProjectDescriptionEditing(false);
          setProjectPreviewedAttachmentId("");
          setProjectAttachmentTransferState({
            uploadingIds: [],
            error: "",
            isProcessing: false,
          });
          setIsProjectAttachmentDragging(false);
          setProjectEnvironmentFilePickerOpen(false);
          setProjectEnvironmentFilePickerInventory([]);
          setProjectEnvironmentFilePickerState({
            status: "idle",
            error: "",
          });
          setProjectEnvironmentFilePickerSearch("");
          setProjectEnvironmentFilePickerExpandedFolders([]);
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectSaveState({
            isSaving: false,
            error: "",
          });
        }

        function closeProjectComposer(options = {}) {
          const shouldAnimateInitialSetupClose = options?.animate !== false
            && projectComposerOpen
            && projectComposerMode === "create"
            && !missionControlSetupOpen
            && !selectedProject;
          if (shouldAnimateInitialSetupClose) {
            if (projectInitialSetupModalClosing) {
              return;
            }
            setProjectIconPickerOpen(false);
            setProjectBlueprintPickerOpen(false);
            setProjectComposerEnvironmentPopoverOpen(false);
            setProjectInitialSetupModalVisible(false);
            setProjectInitialSetupModalClosing(true);
            if (projectInitialSetupModalCloseTimerRef.current) {
              window.clearTimeout(projectInitialSetupModalCloseTimerRef.current);
            }
            projectInitialSetupModalCloseTimerRef.current = window.setTimeout(() => {
              projectInitialSetupModalCloseTimerRef.current = null;
              finishCloseProjectComposer();
            }, projectInitialSetupModalAnimationMs);
            return;
          }
          finishCloseProjectComposer();
        }

        function finishCloseProjectRuleComposer() {
          if (projectRuleComposerCloseTimerRef.current) {
            window.clearTimeout(projectRuleComposerCloseTimerRef.current);
            projectRuleComposerCloseTimerRef.current = null;
          }
          if (projectRuleComposerFrameRef.current) {
            window.cancelAnimationFrame(projectRuleComposerFrameRef.current);
            projectRuleComposerFrameRef.current = null;
          }
          setProjectRuleComposerVisible(false);
          setProjectRuleComposerClosing(false);
          setProjectRuleComposerOpen(false);
          setProjectRuleInputValue("");
        }

        function closeProjectRuleComposer(options = {}) {
          if (!projectRuleComposerOpen) {
            return;
          }
          if (options?.animate === false) {
            finishCloseProjectRuleComposer();
            return;
          }
          if (projectRuleComposerClosing) {
            return;
          }
          setProjectRuleComposerVisible(false);
          setProjectRuleComposerClosing(true);
          if (projectRuleComposerCloseTimerRef.current) {
            window.clearTimeout(projectRuleComposerCloseTimerRef.current);
          }
          projectRuleComposerCloseTimerRef.current = window.setTimeout(() => {
            projectRuleComposerCloseTimerRef.current = null;
            finishCloseProjectRuleComposer();
          }, projectRuleComposerAnimationMs);
        }

        function finishCloseMissionControlSetupModal() {
          if (missionControlSetupCloseTimerRef.current) {
            window.clearTimeout(missionControlSetupCloseTimerRef.current);
            missionControlSetupCloseTimerRef.current = null;
          }
          if (missionControlSetupFrameRef.current) {
            window.cancelAnimationFrame(missionControlSetupFrameRef.current);
            missionControlSetupFrameRef.current = null;
          }
          setMissionControlSetupVisible(false);
          setMissionControlSetupClosing(false);
          setMissionControlSetupOutcomeMenuIndex(-1);
          setMissionControlSetupOutcomeTitleDrafts({});
          setProjectOverviewOutcomeEditorState(null);
          closeProjectComposer({ animate: false });
        }

        function getMissionControlSetupProjectGoalDraft() {
          return String(
            projectDescriptionTextareaRef.current
              ? projectDescriptionTextareaRef.current.value || ""
              : projectDraft.description || ""
          );
        }

        function getMissionControlSetupProjectSnapshot() {
          const normalizedProjectId = String(projectDraft?.id || selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return null;
          }
          return normalizePlaygroundProjectRecord(
            (selectedProject?.id === normalizedProjectId ? selectedProject : null)
            || projectsById[normalizedProjectId]
            || projectDraft
          );
        }

        async function commitMissionControlSetupDraftBeforeClose() {
          const normalizedProjectId = String(projectDraft?.id || selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return true;
          }
          if (missionControlSetupCommitInFlightRef.current) {
            return false;
          }

          missionControlSetupCommitInFlightRef.current = true;
          try {
            const nextProjectGoal = getMissionControlSetupProjectGoalDraft();
            const sourceProject = getMissionControlSetupProjectSnapshot();
            const shouldSaveProjectGoal = Boolean(
              sourceProject?.id
              && String(nextProjectGoal) !== String(sourceProject.description || "")
            );
            const nextStrategyBrief = buildMissionControlSetupStrategyBriefFromDraft();
            updateMissionControlStrategyDraft(nextStrategyBrief);

            if (shouldSaveProjectGoal && String(projectDraft?.name || sourceProject.name || "").trim()) {
              await persistProjectComposerDraft({
                mode: projectDraft?.id ? "edit" : projectComposerMode,
                closeAfterSave: false,
                selectAfterSave: false,
              });
            }

            await saveMissionControlStrategyBrief(nextStrategyBrief, { throwOnError: true });
            setProjectSaveState((current) => current.error
              ? { isSaving: false, error: "" }
              : current
            );
            setMissionControlSaveState((current) => current.error
              ? { isSaving: false, error: "", message: "" }
              : current
            );
            return true;
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save Mission Control changes.";
            setProjectSaveState({
              isSaving: false,
              error: message,
            });
            setMissionControlSaveState({
              isSaving: false,
              error: message,
              message: "",
            });
            return false;
          } finally {
            missionControlSetupCommitInFlightRef.current = false;
          }
        }

        function closeMissionControlSetupModal(options = {}) {
          if (!missionControlSetupOpen) {
            return;
          }
          if (options?.persist !== false) {
            void commitMissionControlSetupDraftBeforeClose();
          }
          if (options?.animate === false) {
            finishCloseMissionControlSetupModal();
            return;
          }
          if (missionControlSetupClosing) {
            return;
          }
          setProjectIconPickerOpen(false);
          setProjectBlueprintPickerOpen(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setMissionControlSetupOutcomeMenuIndex(-1);
          setMissionControlSetupOutcomeTitleDrafts({});
          setProjectOverviewOutcomeEditorState(null);
          setMissionControlSetupVisible(false);
          setMissionControlSetupClosing(true);
          if (missionControlSetupCloseTimerRef.current) {
            window.clearTimeout(missionControlSetupCloseTimerRef.current);
          }
          missionControlSetupCloseTimerRef.current = window.setTimeout(() => {
            missionControlSetupCloseTimerRef.current = null;
            finishCloseMissionControlSetupModal();
          }, missionControlSetupAnimationMs);
        }

        useEffect(() => {
          if (!projectRuleComposerOpen) {
            setProjectRuleComposerVisible(false);
            setProjectRuleComposerClosing(false);
            return undefined;
          }
          if (projectRuleComposerCloseTimerRef.current) {
            window.clearTimeout(projectRuleComposerCloseTimerRef.current);
            projectRuleComposerCloseTimerRef.current = null;
          }
          if (projectRuleComposerFrameRef.current) {
            window.cancelAnimationFrame(projectRuleComposerFrameRef.current);
            projectRuleComposerFrameRef.current = null;
          }
          setProjectRuleComposerVisible(false);
          setProjectRuleComposerClosing(false);
          projectRuleComposerFrameRef.current = window.requestAnimationFrame(() => {
            projectRuleComposerFrameRef.current = window.requestAnimationFrame(() => {
              projectRuleComposerFrameRef.current = null;
              setProjectRuleComposerVisible(true);
            });
          });
          return undefined;
        }, [projectRuleComposerOpen]);

        useEffect(() => {
          if (!missionControlSetupOpen) {
            setMissionControlSetupVisible(false);
            setMissionControlSetupClosing(false);
            return undefined;
          }
          if (missionControlSetupCloseTimerRef.current) {
            window.clearTimeout(missionControlSetupCloseTimerRef.current);
            missionControlSetupCloseTimerRef.current = null;
          }
          if (missionControlSetupFrameRef.current) {
            window.cancelAnimationFrame(missionControlSetupFrameRef.current);
            missionControlSetupFrameRef.current = null;
          }
          setMissionControlSetupVisible(false);
          setMissionControlSetupClosing(false);
          missionControlSetupFrameRef.current = window.requestAnimationFrame(() => {
            missionControlSetupFrameRef.current = window.requestAnimationFrame(() => {
              missionControlSetupFrameRef.current = null;
              setMissionControlSetupVisible(true);
            });
          });
          return undefined;
        }, [missionControlSetupOpen]);

        useEffect(() => {
          if (!missionControlSetupOpen && projectOverviewOutcomeEditorState?.source === "mission-control-setup") {
            closeProjectOverviewOutcomeEditor({ animate: false });
          }
        }, [missionControlSetupOpen, projectOverviewOutcomeEditorState?.source]);

        useEffect(() => {
          if (!projectOverviewOutcomeEditorState) {
            setProjectOverviewOutcomeEditorVisible(false);
            setProjectOverviewOutcomeEditorClosing(false);
            return undefined;
          }
          if (projectOverviewOutcomeEditorCloseTimerRef.current) {
            window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
            projectOverviewOutcomeEditorCloseTimerRef.current = null;
          }
          if (projectOverviewOutcomeEditorFrameRef.current) {
            window.cancelAnimationFrame(projectOverviewOutcomeEditorFrameRef.current);
            projectOverviewOutcomeEditorFrameRef.current = null;
          }
          setProjectOverviewOutcomeEditorVisible(false);
          setProjectOverviewOutcomeEditorClosing(false);
          setProjectOverviewOutcomeMilestonePickerOpen(false);
          projectOverviewOutcomeEditorFrameRef.current = window.requestAnimationFrame(() => {
            projectOverviewOutcomeEditorFrameRef.current = window.requestAnimationFrame(() => {
              projectOverviewOutcomeEditorFrameRef.current = null;
              setProjectOverviewOutcomeEditorVisible(true);
            });
          });
          return undefined;
        }, [Boolean(projectOverviewOutcomeEditorState)]);

        useEffect(() => {
          if (!projectOverviewOutcomeMilestonePickerOpen) {
            return undefined;
          }
          function handleOutcomeMilestonePickerPointerDown(event) {
            const target = event.target instanceof Node ? event.target : null;
            if (target && projectOverviewOutcomeMilestonePickerRef.current?.contains(target)) {
              return;
            }
            setProjectOverviewOutcomeMilestonePickerOpen(false);
          }
          window.addEventListener("pointerdown", handleOutcomeMilestonePickerPointerDown);
          return () => window.removeEventListener("pointerdown", handleOutcomeMilestonePickerPointerDown);
        }, [projectOverviewOutcomeMilestonePickerOpen]);

        useEffect(() => {
          if (typeof onTasksHeaderChange !== "function") {
            return undefined;
          }
          if (selectedProject?.id && !isStandaloneCalendarMode) {
            onTasksHeaderChange({
              mode: "project",
              title: selectedProjectWorkspaceTitle,
              view: taskView,
              projectId: selectedProject.id,
              taskId: selectedTaskId,
              scheduleId: selectedScheduleId,
              detailMode: selectedTaskId
                ? "task"
                : missionControlStrategyOpen
                  ? "mission-control"
                  : selectedScheduleId && scheduleViewMode === "setup"
                    ? "schedule"
                    : "",
            });
          } else {
            onTasksHeaderChange({
              mode: isStandaloneCalendarMode ? "calendar" : "overview",
              title: isStandaloneCalendarMode ? "Calendar" : "Projects",
              view: isStandaloneCalendarMode ? "calendar" : "overview",
              projectId: selectedProjectId,
              taskId: selectedTaskId,
              scheduleId: selectedScheduleId,
              detailMode: selectedTaskId
                ? "task"
                : selectedScheduleId && scheduleViewMode === "setup"
                  ? "schedule"
                  : "",
            });
          }
          return undefined;
        }, [
          isStandaloneCalendarMode,
          missionControlStrategyOpen,
          onTasksHeaderChange,
          selectedProject?.id,
          selectedProjectId,
          selectedProjectWorkspaceTitle,
          selectedScheduleId,
          selectedTaskId,
          scheduleViewMode,
          taskView,
        ]);

        useEffect(() => {
          const nextToken = Number(projectNavBackRequestToken || 0);
          if (!useUnifiedProjectNav || !nextToken || handledProjectNavBackRequestTokenRef.current === nextToken) {
            return;
          }
          handledProjectNavBackRequestTokenRef.current = nextToken;
          setMissionControlSetupOpen(false);
          handleSelectProject("");
        }, [projectNavBackRequestToken, useUnifiedProjectNav]);

        useEffect(() => {
          const requestToken = String(projectNavViewRequest?.token || "").trim();
          if (!useUnifiedProjectNav || !requestToken || handledProjectNavViewRequestTokenRef.current === requestToken) {
            return;
          }
          handledProjectNavViewRequestTokenRef.current = requestToken;
          const requestedView = projectNavViewRequest?.view === "board"
            ? "board"
            : projectNavViewRequest?.view === "backlog"
              ? "backlog"
              : "overview";
          setMissionControlSetupOpen(false);
          setTaskView(requestedView);
          setSelectedTaskId("");
          setProjectTaskDetailScreenOpen(false);
          setDraftTask(null);
          setProjectSidebarPopover("");
        }, [projectNavViewRequest, useUnifiedProjectNav]);

        useEffect(() => {
          const nextToken = Number(projectNavSettingsRequestToken || 0);
          if (!useUnifiedProjectNav || !nextToken || handledProjectNavSettingsRequestTokenRef.current === nextToken) {
            return;
          }
          handledProjectNavSettingsRequestTokenRef.current = nextToken;
          if (selectedProject?.id) {
            setProjectSidebarPopover("");
            openProjectComposerForEdit(selectedProject);
          }
        }, [projectNavSettingsRequestToken, selectedProject, useUnifiedProjectNav]);

        useEffect(() => {
          const requestToken = String(projectNavIssueRequest?.token || "").trim();
          if (!useUnifiedProjectNav || !requestToken || handledProjectNavIssueRequestTokenRef.current === requestToken) {
            return;
          }
          handledProjectNavIssueRequestTokenRef.current = requestToken;
          if (projectNavIssueRequest?.action === "create") {
            openProjectIssueComposer();
          }
        }, [projectNavIssueRequest, selectedProject?.id, selectedProjectId, useUnifiedProjectNav]);

        function buildProjectWallpaperBackgroundImage(wallpaperId, fallbackProject = projectDraft) {
          const wallpaper = getPlaygroundProjectWallpaperConfig(
            wallpaperId || fallbackProject,
            0
          );
          return "linear-gradient(180deg, rgba(6, 6, 10, 0.82), rgba(6, 6, 10, 0.95)), url(" + wallpaper.url + ")";
        }

        function handleProjectWallpaperStep(direction) {
          const step = direction === "prev" ? -1 : 1;
          const currentWallpaperId = getPlaygroundProjectWallpaperId(projectDraft.wallpaperId, PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id);
          const currentIndex = PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.findIndex((wallpaper) => wallpaper.id === currentWallpaperId);
          const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
          const nextIndex = (safeCurrentIndex + step + PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.length) % PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.length;
          const nextWallpaper = PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[nextIndex] || PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0];
          if (!nextWallpaper?.id || nextWallpaper.id === currentWallpaperId) {
            return;
          }

          if (projectWallpaperTransitionTimerRef.current) {
            window.clearTimeout(projectWallpaperTransitionTimerRef.current);
            projectWallpaperTransitionTimerRef.current = null;
          }

          setProjectWallpaperTransition({
            token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            direction: step > 0 ? "next" : "prev",
            from: buildProjectWallpaperBackgroundImage(currentWallpaperId, projectDraft),
            to: buildProjectWallpaperBackgroundImage(nextWallpaper.id, projectDraft),
            fromPreview: "url(" + (PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[safeCurrentIndex]?.url || PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].url) + ")",
            toPreview: "url(" + nextWallpaper.url + ")",
          });
          projectDraftWallpaperIdRef.current = nextWallpaper.id;
          projectDraftUseCardBackgroundAsWallpaperRef.current = true;
          setProjectDraft((current) => ({
            ...current,
            wallpaperId: nextWallpaper.id,
            useCardBackgroundAsWallpaper: true,
          }));
          projectWallpaperTransitionTimerRef.current = window.setTimeout(() => {
            setProjectWallpaperTransition(null);
            projectWallpaperTransitionTimerRef.current = null;
          }, 380);
        }

        function focusMissionControlSetupTaskInput() {
          window.requestAnimationFrame(() => {
            const textarea = document.querySelector(".playground-mission-control-setup-runner textarea.sidebar-textarea")
              || document.querySelector(".playground-mission-control-setup-runner .sidebar-textarea");
            if (textarea && typeof textarea.focus === "function") {
              textarea.focus({ preventScroll: true });
            }
          });
        }

        async function handleGenerateStrategyFromProjectComposer() {
          if (projectSaveState.isSaving) {
            return;
          }
          const nextName = String(projectDraft?.name || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            focusMissionControlSetupTaskInput();
            return;
          }

          try {
            const saveMode = projectComposerMode === "edit" && projectDraft?.id ? "edit" : "create";
            await persistProjectComposerDraft({
              mode: saveMode,
              closeAfterSave: false,
              selectAfterSave: true,
            });
          } catch {
            return;
          }
          focusMissionControlSetupTaskInput();
        }

        async function handleSaveProjectFromStudio() {
          if (projectSaveState.isSaving) {
            return;
          }
          const nextName = String(projectDraft?.name || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            return;
          }
          const saveMode = projectComposerMode === "edit" && projectDraft?.id ? "edit" : "create";
          const savedProject = await persistProjectComposerDraft({
            mode: saveMode,
            closeAfterSave: false,
            selectAfterSave: true,
          }).catch(() => null);
          if (savedProject?.id) {
            setProjectComposerMode("edit");
          }
        }

        function commitLocalProjectRecord(projectRecord, extra = {}) {
          const projectRecordWithSummary = {
            ...projectRecord,
            summary: extra.summary && typeof extra.summary === "object"
              ? extra.summary
              : projectRecord?.summary,
          };
          const normalized = applyProjectLocalNameOverride(projectRecordWithSummary);
          const existingProjectRecord = selectedProjectDetail?.project?.id === normalized.id
            ? selectedProjectDetail.project
            : projects.find((project) => project?.id === normalized.id) || null;
          const committedProject = applyProjectLocalNameOverride(
            mergePlaygroundProjectRecords(projectRecordWithSummary, existingProjectRecord) || normalized
          );

          setProjects((current) => {
            const existingIndex = current.findIndex((project) => project.id === committedProject.id);
            if (existingIndex === -1) {
              return [committedProject].concat(current);
            }
            return current.map((project) => (
              project.id === committedProject.id
                ? applyProjectLocalNameOverride(mergePlaygroundProjectRecords(committedProject, project) || committedProject)
                : project
            ));
          });

          if (typeof onProjectRecordCommitted === "function") {
            onProjectRecordCommitted(committedProject);
          }

          if (selectedProjectId === committedProject.id || extra.selectImmediately) {
            setSelectedProjectDetail((current) => {
              const currentProject = current?.project?.id === committedProject.id ? current.project : null;
              const nextProject = applyProjectLocalNameOverride(
                mergePlaygroundProjectRecords(committedProject, currentProject) || committedProject
              );
              return {
                project: nextProject,
                summary: nextProject.summary || current?.summary || buildEmptyPlaygroundProjectSummary(),
                environments: Array.isArray(extra.environments) ? extra.environments : current?.environments || [],
                recentThreads: Array.isArray(extra.recentThreads) ? extra.recentThreads : current?.recentThreads || [],
                threads: Array.isArray(extra.threads) ? extra.threads : current?.threads || [],
              };
            });
          }

          return committedProject;
        }

        function syncProjectSummary(projectId, nextTasks, nextSprints, nextReleases, summarySeed) {
          if (!projectId) return;
          const nextSummary = {
            ...buildEmptyPlaygroundProjectSummary(),
            ...(summarySeed && typeof summarySeed === "object" ? summarySeed : {}),
            tasksCount: nextTasks.length,
            openTasksCount: nextTasks.filter((task) => task.status !== "done").length,
            releaseCount: nextReleases.length,
            activeReleaseCount: nextReleases.filter((release) => getPlaygroundTaskReleaseStatus(release) === "active").length,
            sprintCount: nextSprints.length,
            activeSprintCount: nextSprints.filter((sprint) => sprint.status === "active").length,
          };

          setProjects((current) =>
            current.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    summary: {
                      ...buildEmptyPlaygroundProjectSummary(),
                      ...(project.summary && typeof project.summary === "object" ? project.summary : {}),
                      ...nextSummary,
                    },
                  }
                : project
            )
`;
