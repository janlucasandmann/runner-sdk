import { CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS } from "../../../calendar/client/projects-integration/page-connectors/index.mjs";
export const PROJECTS_PAGE_CONNECTORS_SCRIPT = `        function getProjectConnectorBrowserProjectRecord() {
          const projectId = String(
            projectConnectorBrowserDialog?.projectId
            || selectedProjectId
            || ""
          ).trim();
          if (!projectId) {
            return null;
          }
          return selectedProject?.id === projectId
            ? selectedProject
            : selectedProjectSnapshot?.id === projectId
              ? selectedProjectSnapshot
              : projects.find((project) => project?.id === projectId)
                || { id: projectId, connectors: buildPlaygroundDefaultTaskConnectors() };
        }

        async function persistProjectConnectorSelection(source, nextSelection, projectRecordOverride = null) {
          const connectorKey = getPlaygroundTaskConnectorKey(source);
          const baseProject = normalizePlaygroundProjectRecord(projectRecordOverride || selectedProject || buildPlaygroundDefaultProjectDraft());
          if (!connectorKey || !baseProject?.id) {
            return null;
          }

          const nextConnectors = normalizePlaygroundTaskConnectorSelections(baseProject.connectors);
          nextConnectors[connectorKey] = nextSelection;
          const nextMetadata = {
            ...(baseProject.metadata && typeof baseProject.metadata === "object" ? baseProject.metadata : {}),
            ...buildPlaygroundProjectMissionControlMetadataFragment(baseProject),
          };
          if (hasPlaygroundTaskConnectorSelections(nextConnectors)) {
            nextMetadata.connectors = nextConnectors;
          } else {
            nextMetadata.connectors = null;
          }

          const normalizedProjectAttachments = normalizePlaygroundTaskAttachmentList(baseProject.attachments);
          const optimisticProject = normalizePlaygroundProjectRecord({
            ...baseProject,
            connectors: nextConnectors,
            metadata: nextMetadata,
            updatedAt: new Date().toISOString(),
          });
          commitLocalProjectRecord(optimisticProject, {
            summary: optimisticProject.summary || selectedProjectSummary,
            environments: selectedProjectEnvironments,
            recentThreads: selectedProjectRecentThreads,
            threads: selectedProjectDetail?.threads,
            selectImmediately: true,
          });

          try {
            const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(baseProject.id), {
              method: "PATCH",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: baseProject.name || "Untitled Project",
                description: baseProject.description,
                color: baseProject.color || getPlaygroundProjectAccent(baseProject, projects.length),
                defaultEnvironmentId: baseProject.defaultEnvironmentId || undefined,
                attachments: normalizedProjectAttachments,
                metadata: {
                  ...nextMetadata,
                  name: baseProject.name || "Untitled Project",
                  description: baseProject.description,
                  icon: getPlaygroundProjectIconId(baseProject.icon),
                  wallpaperId: getPlaygroundProjectWallpaperId(baseProject.wallpaperId, PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id),
                  useCardBackgroundAsWallpaper: baseProject.useCardBackgroundAsWallpaper !== false,
                  defaultEnvironmentId: baseProject.defaultEnvironmentId || null,
                  attachments: normalizedProjectAttachments,
                },
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update project connectors.");
            }
            const updatedProject = getPlaygroundProjectResponseRecord(data, optimisticProject);
            if (updatedProject?.id) {
              commitLocalProjectRecord({
                ...updatedProject,
                connectors: nextConnectors,
                metadata: {
                  ...(updatedProject.metadata && typeof updatedProject.metadata === "object" ? updatedProject.metadata : {}),
                  ...nextMetadata,
                },
                summary: updatedProject.summary || selectedProjectSummary,
              }, {
                summary: updatedProject.summary || selectedProjectSummary,
                environments: selectedProjectEnvironments,
                recentThreads: selectedProjectRecentThreads,
                threads: selectedProjectDetail?.threads,
                selectImmediately: true,
              });
            }
            const persistedProject = normalizePlaygroundProjectRecord({
              ...(updatedProject || optimisticProject),
              connectors: nextConnectors,
            });
            if (connectorKey === "github" && nextSelection) {
              void prepareProjectGithubConnectorRepositories(persistedProject, nextSelection).catch((error) => {
                console.warn("[project connectors] Failed to prepare GitHub repository in project environment.", error);
              });
            }
            return updatedProject || optimisticProject;
          } catch (error) {
            commitLocalProjectRecord(baseProject, {
              summary: baseProject.summary || selectedProjectSummary,
              environments: selectedProjectEnvironments,
              recentThreads: selectedProjectRecentThreads,
              threads: selectedProjectDetail?.threads,
              selectImmediately: true,
            });
            throw error;
          }
        }

        useEffect(() => {
          const disconnectToken = String(taskConnectorConfigByKey.github?.disconnectToken || "").trim();
          if (!disconnectToken || handledGithubDisconnectTokenRef.current === disconnectToken) {
            return;
          }
          if (!selectedProject?.id) {
            return;
          }

          const githubSelection = getDraftTaskConnectorSelection("github", selectedProject);
          if (!githubSelection) {
            handledGithubDisconnectTokenRef.current = disconnectToken;
            return;
          }

          handledGithubDisconnectTokenRef.current = disconnectToken;
          setTaskConnectorBrowserSelectedIds((current) => ({
            ...current,
            github: [],
          }));
          if (taskConnectorBrowserCurrentKey === "github") {
            setTaskConnectorBrowserPreviewId("");
          }

          void persistProjectConnectorSelection("github", null).catch((error) => {
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              github: error instanceof Error ? error.message : "Failed to reset GitHub connector selection.",
            }));
          });
        }, [selectedProject, taskConnectorBrowserCurrentKey, taskConnectorConfigByKey.github?.disconnectToken]);

        function syncTaskConnectorBrowserSelectionsFromTask(taskRecord = draftTask) {
          const connectors = normalizePlaygroundTaskConnectorSelections(taskRecord?.connectors);
          setTaskConnectorBrowserSelectedIds({
            github: connectors.github?.selectedIds || connectors.github?.items?.map((item) => item.id) || [],
            googleDrive: connectors.googleDrive?.selectedIds || connectors.googleDrive?.items?.map((item) => item.id) || [],
            oneDrive: connectors.oneDrive?.selectedIds || connectors.oneDrive?.items?.map((item) => item.id) || [],
          });
          setTaskConnectorBrowserSelectedNotionId(
            connectors.notion?.selectedIds?.[0]
            || connectors.notion?.items?.[0]?.id
            || ""
          );
          if (connectors.notion?.items?.length) {
            setTaskConnectorBrowserNotionDatabases((current) => {
              const existing = new Map((Array.isArray(current) ? current : []).map((item) => [item.id, item]));
              connectors.notion.items.forEach((item) => {
                if (!item?.id || item.id === "__entire_workspace__") {
                  return;
                }
                existing.set(item.id, {
                  id: item.id,
                  name: item.name,
                  icon: "",
                });
              });
              return Array.from(existing.values());
            });
          }
        }

        function closeTaskConnectorBrowser() {
          console.info("[connector-debug] closeTaskConnectorBrowser called", {
            taskConnectorBrowserOpen,
            taskConnectorBrowserMode,
            projectConnectorDialog: projectConnectorBrowserDialog,
            projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
            currentSource: taskConnectorBrowserCurrentSource,
          });
          if (taskConnectorBrowserOpenFrameRef.current) {
            window.cancelAnimationFrame(taskConnectorBrowserOpenFrameRef.current);
            taskConnectorBrowserOpenFrameRef.current = null;
          }
          const wasProjectConnectorBrowserActive = projectConnectorBrowserActiveRef.current || taskConnectorBrowserMode === "project" || taskConnectorBrowserMode === "project-composer";
          projectConnectorBrowserActiveRef.current = false;
          if (wasProjectConnectorBrowserActive) {
            clearPlaygroundConnectorBrowserRestoreState();
            setProjectConnectorBrowserDialog(null);
          }
          setTaskConnectorBrowserOpen(false);
          setTaskConnectorBrowserMode("task");
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

        function switchTaskConnectorBrowserSource(nextSource) {
          const normalizedSource = getPlaygroundTaskConnectorSource(nextSource) || "github";
          const connectorKey = getPlaygroundTaskConnectorKey(normalizedSource);
          if (connectorKey === "notion") {
            setTaskConnectorBrowserNotionDatabases([]);
            setTaskConnectorBrowserNotionDatabasesLoaded(false);
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              notion: "",
            }));
            setTaskConnectorBrowserLoadingState((current) => ({
              ...current,
              notion: false,
            }));
          } else if (connectorKey) {
            setTaskConnectorBrowserItemsBySource((current) => ({
              ...current,
              [connectorKey]: [],
            }));
            setTaskConnectorBrowserLoadedFolderIds((current) => ({
              ...current,
              [connectorKey]: [],
            }));
            setTaskConnectorBrowserLoadingFolderIds((current) => ({
              ...current,
              [connectorKey]: [],
            }));
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              [connectorKey]: "",
            }));
            setTaskConnectorBrowserLoadingState((current) => ({
              ...current,
              [connectorKey]: false,
            }));
          }
          setTaskConnectorBrowserHistory([{ source: normalizedSource, folderId: null }]);
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

        function openTaskConnectorBrowser(source) {
          projectConnectorBrowserActiveRef.current = false;
          const normalizedSource = getPlaygroundTaskConnectorSource(source) || "github";
          setTaskConnectorBrowserMode("task");
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          syncTaskConnectorBrowserSelectionsFromTask(isCalendarScheduleDetailMode ? scheduleDraft : draftTask);
          switchTaskConnectorBrowserSource(normalizedSource);
          setTaskConnectorBrowserRenderKey((current) => current + 1);
          setTaskConnectorBrowserOpen(true);
        }

        function openProjectComposerConnectorBrowser(source, options = {}) {
          projectConnectorBrowserActiveRef.current = true;
          const normalizedSource = getPlaygroundTaskConnectorSource(source) || "github";
          const connectorProjectDraft = options?.projectDraft && typeof options.projectDraft === "object" && !Array.isArray(options.projectDraft)
            ? options.projectDraft
            : projectDraft;
          setTaskConnectorBrowserMode("project-composer");
          setProjectConnectorBrowserDialog(null);
          setProjectIconPickerOpen(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          syncTaskConnectorBrowserSelectionsFromTask(connectorProjectDraft);
          switchTaskConnectorBrowserSource(normalizedSource);
          setTaskConnectorBrowserRenderKey((current) => current + 1);
          setTaskConnectorBrowserOpen(true);
        }

        function openProjectComposerConnectorBrowserRestore(restoreState) {
          const normalizedRestoreState = normalizePlaygroundProjectComposerConnectorRestoreState(restoreState);
          console.info("[connector-debug] tasks project composer connector browser restore received", {
            restoreState,
            normalizedRestoreState,
          });
          if (!normalizedRestoreState || normalizedRestoreState.mode !== "project-composer") {
            return false;
          }

          clearPlaygroundProjectComposerConnectorRestoreState();
          projectDraftNameDirtyRef.current = false;
          projectDraftTypedNameRef.current = "";
          setProjectComposerMode(normalizedRestoreState.projectComposerMode);
          setProjectDraft(normalizedRestoreState.projectDraft);
          setProjectDescriptionEditing(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectIconPickerOpen(false);
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
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          setMissionControlStrategyOpen(false);
          setMissionControlSetupOpen(true);
          setMissionControlSetupResetToken((current) => current + 1);
          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          void ensureMissionControlAgent();

          const restoredProjectId = normalizedRestoreState.projectDraft?.id || "";
          setSelectedProjectId(normalizedRestoreState.projectComposerMode === "edit" ? restoredProjectId : "");
          if (normalizedRestoreState.projectComposerMode !== "edit") {
            clearProjectWorkspace();
          }
          setProjectComposerOpen(true);
          window.setTimeout(() => {
            openProjectComposerConnectorBrowser(normalizedRestoreState.source, {
              projectDraft: normalizedRestoreState.projectDraft,
            });
          }, 250);
          return true;
        }

        function requestProjectConnectorBrowserOpen(source, options = {}) {
          const requestedProjectId = String(
            options?.projectId
            || selectedProject?.id
            || selectedProjectId
            || ""
          ).trim();
          const normalizedSource = getPlaygroundTaskConnectorSource(source) || "github";
          console.info("[connector-debug] requestProjectConnectorBrowserOpen:start", {
            source,
            normalizedSource,
            requestedProjectId,
            options,
            selectedProjectId,
            selectedProjectRecordId: selectedProject?.id || "",
            selectedProjectSnapshotId: selectedProjectSnapshot?.id || "",
            projectsCount: projects.length,
            taskView,
            taskConnectorBrowserOpen,
            taskConnectorBrowserMode,
            projectConnectorDialog: projectConnectorBrowserDialog,
            projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
          });
          if (!requestedProjectId) {
            console.warn("[connector-debug] requestProjectConnectorBrowserOpen aborted: missing project id", {
              source,
              normalizedSource,
              options,
              selectedProjectId,
              selectedProjectRecordId: selectedProject?.id || "",
            });
            return;
          }
          const projectRecord = options?.projectRecord
            || (selectedProject?.id === requestedProjectId ? selectedProject : null)
            || (selectedProjectSnapshot?.id === requestedProjectId ? selectedProjectSnapshot : null)
            || projects.find((project) => project?.id === requestedProjectId)
            || { id: requestedProjectId };
          console.info("[connector-debug] requestProjectConnectorBrowserOpen:resolved project record", {
            requestedProjectId,
            projectRecordId: projectRecord?.id || "",
            projectRecordName: projectRecord?.title || projectRecord?.name || "",
            hasConnectors: Boolean(projectRecord?.connectors),
          });
          projectConnectorBrowserActiveRef.current = true;
          setTaskView("overview");
          setSelectedTaskId("");
          setDraftTask(null);
          setTaskConnectorBrowserMode("project");
          setTaskConnectorBrowserOpen(false);
          setProjectSidebarPopover("");
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          syncTaskConnectorBrowserSelectionsFromTask(projectRecord);
          switchTaskConnectorBrowserSource(normalizedSource);
          setTaskConnectorBrowserRenderKey((current) => current + 1);
          setProjectConnectorBrowserDialog({
            token: String(options?.token || "") || Date.now().toString(36) + Math.random().toString(36).slice(2),
            projectId: requestedProjectId,
            source: normalizedSource,
          });
          window.setTimeout(() => {
            const portalCount = typeof document !== "undefined"
              ? document.querySelectorAll(".playground-tasks-connector-browser-portal").length
              : 0;
            const scrimCount = typeof document !== "undefined"
              ? document.querySelectorAll(".tb-file-browser-scrim").length
              : 0;
            const projectModeCount = typeof document !== "undefined"
              ? document.querySelectorAll('[data-connector-browser-mode="project"]').length
              : 0;
            console.info("[connector-debug] requestProjectConnectorBrowserOpen:dom after state", {
              requestedProjectId,
              normalizedSource,
              portalCount,
              scrimCount,
              projectModeCount,
            });
          }, 75);
        }

        function navigateTaskConnectorBrowserToFolder(folderId) {
          const nextEntry = {
            source: taskConnectorBrowserCurrentSource,
            folderId,
          };
          setTaskConnectorBrowserHistory((current) => current.slice(0, taskConnectorBrowserHistoryIndex + 1).concat(nextEntry));
          setTaskConnectorBrowserHistoryIndex((current) => current + 1);
          setTaskConnectorBrowserPreviewId("");
          setTaskConnectorBrowserExpandedFolderIds([]);
        }

        function navigateTaskConnectorBrowserToBreadcrumb(index) {
          const nextEntry = taskConnectorBrowserPath[index];
          if (!nextEntry) {
            return;
          }
          navigateTaskConnectorBrowserToFolder(nextEntry.id);
        }

        function goTaskConnectorBrowserBack() {
          if (taskConnectorBrowserHistoryIndex <= 0) {
            return;
          }
          setTaskConnectorBrowserHistoryIndex((current) => current - 1);
          setTaskConnectorBrowserPreviewId("");
          setTaskConnectorBrowserExpandedFolderIds([]);
        }

        function goTaskConnectorBrowserForward() {
          if (taskConnectorBrowserHistoryIndex >= taskConnectorBrowserHistory.length - 1) {
            return;
          }
          setTaskConnectorBrowserHistoryIndex((current) => current + 1);
          setTaskConnectorBrowserPreviewId("");
          setTaskConnectorBrowserExpandedFolderIds([]);
        }

        function toggleTaskConnectorBrowserSelectedId(sourceKey, itemId) {
          setTaskConnectorBrowserSelectedIds((current) => ({
            ...current,
            [sourceKey]: (current[sourceKey] || []).includes(itemId)
              ? (current[sourceKey] || []).filter((value) => value !== itemId)
              : (current[sourceKey] || []).concat(itemId),
          }));
        }

        async function toggleTaskConnectorBrowserFolderExpansion(folderId, event) {
          event?.stopPropagation?.();
          const isExpanded = taskConnectorBrowserExpandedFolderIds.includes(folderId);
          if (!isExpanded && taskConnectorBrowserCurrentSource !== "notion" && taskConnectorBrowserCurrentConfig?.fetchItems) {
            await loadTaskConnectorFolder(taskConnectorBrowserCurrentSource, folderId);
          }
          setTaskConnectorBrowserExpandedFolderIds((current) =>
            current.includes(folderId)
              ? current.filter((value) => value !== folderId)
              : current.concat(folderId)
          );
        }

        function handleTaskConnectorBrowserItemClick(item) {
          setTaskConnectorBrowserPreviewId(item.id);
          if (item.isFolder) {
            navigateTaskConnectorBrowserToFolder(item.id);
            return;
          }

          if (taskConnectorBrowserCurrentSource === "notion") {
            setTaskConnectorBrowserSelectedNotionId((current) => current === item.id ? "" : item.id);
            return;
          }

          toggleTaskConnectorBrowserSelectedId(taskConnectorBrowserCurrentKey, item.id);
        }

        async function handleApplyTaskConnectorSelection() {
          const isProjectComposerConnectorMode = taskConnectorBrowserMode === "project-composer";
          const isProjectConnectorMode = isProjectConnectorBrowserContext;
          const projectConnectorRecord = isProjectConnectorMode
            ? (isProjectComposerConnectorMode ? projectDraft : getProjectConnectorBrowserProjectRecord())
            : null;
          if (isProjectConnectorMode && !isProjectComposerConnectorMode && !projectConnectorRecord?.id) {
            return;
          }
          if (!isProjectConnectorMode && !draftTask?.id && !isCalendarScheduleDetailMode) {
            return;
          }

          const connectorRecord = isProjectConnectorMode ? projectConnectorRecord : (isCalendarScheduleDetailMode ? scheduleDraft : draftTask);
          const currentSelection = getDraftTaskConnectorSelection(taskConnectorBrowserCurrentSource, connectorRecord);
          const selectedIds = taskConnectorBrowserCurrentSource === "notion"
            ? (taskConnectorBrowserSelectedNotionId ? [taskConnectorBrowserSelectedNotionId] : [])
            : (taskConnectorBrowserSelectedIds[taskConnectorBrowserCurrentKey] || []);
          const selectedItems = resolvePlaygroundTaskConnectorSelectedItems(
            taskConnectorBrowserItems,
            currentSelection,
            selectedIds
          );
          const nextSelection = selectedItems.length > 0
            ? buildPlaygroundTaskConnectorSelection(taskConnectorBrowserCurrentSource, selectedItems, selectedIds)
            : null;

          if (!nextSelection && !currentSelection) {
            return;
          }

          if (isProjectConnectorMode) {
            if (isProjectComposerConnectorMode) {
              setProjectDraft((current) => {
                const nextConnectors = normalizePlaygroundTaskConnectorSelections(current?.connectors);
                nextConnectors[taskConnectorBrowserCurrentKey] = nextSelection;
                return {
                  ...(current || buildPlaygroundDefaultProjectDraft()),
                  connectors: nextConnectors,
                  metadata: {
                    ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
                    connectors: hasPlaygroundTaskConnectorSelections(nextConnectors) ? nextConnectors : null,
                  },
                };
              });
              closeTaskConnectorBrowser();
              return;
            }
            try {
              await persistProjectConnectorSelection(taskConnectorBrowserCurrentSource, nextSelection, projectConnectorRecord);
              closeTaskConnectorBrowser();
            } catch (error) {
              setTaskConnectorBrowserErrors((current) => ({
                ...current,
                [taskConnectorBrowserCurrentKey]: error instanceof Error ? error.message : "Failed to update project connectors.",
              }));
            }
            return;
          }

          if (taskConnectorBrowserCurrentSource === "notion") {
            if (isCalendarScheduleDetailMode) {
              updateScheduleDraft((current) => {
                const nextConnectors = normalizePlaygroundTaskConnectorSelections(current?.connectors);
                nextConnectors[taskConnectorBrowserCurrentKey] = nextSelection;
                return {
                  ...(current || buildProjectScheduleDraft(selectedProject)),
                  connectors: nextConnectors,
                };
              });
              closeTaskConnectorBrowser();
              return;
            }
            updateDraftTask((current) => {
              const nextConnectors = normalizePlaygroundTaskConnectorSelections(current.connectors);
              nextConnectors[taskConnectorBrowserCurrentKey] = nextSelection;
              return {
                ...current,
                connectors: nextConnectors,
              };
            }, { autosave: true });
            closeTaskConnectorBrowser();
            return;
          }

          const targetEnvironmentId = String(activeTaskEnvironmentId || "").trim();
          if (!targetEnvironmentId && selectedItems.some((item) => !item.isFolder)) {
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              [taskConnectorBrowserCurrentKey]: "Select an environment before attaching connector files.",
            }));
            return;
          }

          const existingSelectedIds = new Set(currentSelection?.selectedIds || []);
          const newFileItems = selectedItems.filter((item) => !item.isFolder && !existingSelectedIds.has(item.id));
          let uploadedAttachments = [];

          if (newFileItems.length > 0) {
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: "",
              isProcessing: true,
            }));
            setTaskConnectorBrowserErrors((current) => ({
              ...current,
              [taskConnectorBrowserCurrentKey]: "",
            }));

            try {
              for (const item of newFileItems) {
                uploadedAttachments.push(await uploadTaskConnectorItem(
                  taskConnectorBrowserCurrentSource,
                  item,
                  targetEnvironmentId
                ));
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to attach connector files.";
              setTaskAttachmentTransferState((current) => ({
                ...current,
                error: errorMessage,
                isProcessing: false,
              }));
              setTaskConnectorBrowserErrors((current) => ({
                ...current,
                [taskConnectorBrowserCurrentKey]: errorMessage,
              }));
              return;
            }
          }

          const currentAttachments = normalizePlaygroundTaskAttachmentList(connectorRecord?.attachments);
          const removedAttachments = getPlaygroundTaskConnectorRemovedAttachments(
            currentAttachments,
            taskConnectorBrowserCurrentSource,
            selectedItems
          );
          if (removedAttachments.length > 0) {
            revokeTaskAttachmentListObjectUrls(removedAttachments);
            if (removedAttachments.some((attachment) => attachment.id === previewedTaskAttachmentId)) {
              setPreviewedTaskAttachmentId("");
            }
          }

          if (isCalendarScheduleDetailMode) {
            updateScheduleDraft((current) => {
              const nextConnectors = normalizePlaygroundTaskConnectorSelections(current?.connectors);
              nextConnectors[taskConnectorBrowserCurrentKey] = nextSelection;
              return {
                ...(current || buildProjectScheduleDraft(selectedProject)),
                connectors: nextConnectors,
                attachments: reconcilePlaygroundTaskConnectorAttachments(
                  current?.attachments,
                  taskConnectorBrowserCurrentSource,
                  selectedItems,
                  uploadedAttachments
                ),
              };
            });
          } else {
            updateDraftTask((current) => {
              const nextConnectors = normalizePlaygroundTaskConnectorSelections(current.connectors);
              nextConnectors[taskConnectorBrowserCurrentKey] = nextSelection;
              return {
                ...current,
                connectors: nextConnectors,
                attachments: reconcilePlaygroundTaskConnectorAttachments(
                  current.attachments,
                  taskConnectorBrowserCurrentSource,
                  selectedItems,
                  uploadedAttachments
                ),
              };
            }, { autosave: true });
          }
          setTaskAttachmentTransferState((current) => ({
            ...current,
            error: "",
            isProcessing: false,
          }));
          closeTaskConnectorBrowser();
        }

        function toggleDraftDependency(taskId, options = {}) {
          updateDraftTask((current) => {
            const nextDependencyIds = current.dependencyIds.includes(taskId)
              ? current.dependencyIds.filter((value) => value !== taskId)
              : current.dependencyIds.concat(taskId);
            return {
              ...current,
              dependencyIds: normalizePlaygroundIdList(nextDependencyIds).filter((value) => value !== current.id),
            };
          }, options);
        }

        function openTaskAttachmentPicker() {
          if (taskAttachmentTransferState.isProcessing) {
            return;
          }
          if (!activeTaskEnvironmentId) {
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: "Select an environment before attaching files.",
            }));
            return;
          }
          setIsTaskAttachmentDragging(false);
          taskAttachmentInputRef.current?.click?.();
        }

        function openTaskEnvironmentFilePicker() {
          if (taskAttachmentTransferState.isProcessing) {
            return;
          }
          if (!activeTaskEnvironmentId) {
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: "Select an environment before attaching files from the workspace.",
            }));
            return;
          }
          setTaskAttachmentTransferState((current) => ({
            ...current,
            error: "",
          }));
          setTaskEnvironmentFilePickerSearch("");
          setTaskEnvironmentFilePickerSelectedPaths([]);
          setTaskEnvironmentFilePickerOpen(true);
        }

        function normalizeTaskAttachmentUploadFiles(files) {
          return (Array.isArray(files) ? files : []).filter((file) =>
            file
            && typeof file === "object"
            && typeof file.name === "string"
            && typeof file.size === "number"
            && typeof file.arrayBuffer === "function"
          );
        }

        async function uploadTaskAttachmentFiles(files, options = {}) {
          const normalizedFiles = normalizeTaskAttachmentUploadFiles(files);
          if (normalizedFiles.length === 0) {
            return [];
          }

          const targetEnvironmentId = String(options.environmentId || "").trim();
          if (!targetEnvironmentId && options.allowWithoutEnvironment !== true) {
            const error = new Error("Select an environment before attaching files.");
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: error.message,
            }));
            throw error;
          }

          setTaskAttachmentTransferState((current) => ({
            ...current,
            error: "",
            isProcessing: true,
          }));

          try {
            const uploadedAttachments = [];
            for (let index = 0; index < normalizedFiles.length; index += 1) {
              uploadedAttachments.push(await uploadTaskAttachment(normalizedFiles[index], {
                environmentId: targetEnvironmentId,
                sourcePath: Array.isArray(options.sourcePaths) ? options.sourcePaths[index] : "",
              }));
            }
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: "",
              isProcessing: false,
            }));
            return uploadedAttachments;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to upload attachment.";
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: errorMessage,
              isProcessing: false,
            }));
            setSaveState((current) => ({
              ...current,
              error: errorMessage,
              message: "",
            }));
            throw error;
          }
        }

        async function appendTaskAttachmentFiles(files, options = {}) {
          if (!draftTask?.id && !isCalendarScheduleDetailMode) {
            return false;
          }
          const normalizedFiles = normalizeTaskAttachmentUploadFiles(files);
          if (normalizedFiles.length === 0) {
            return false;
          }

          const sourceTaskId = draftTask?.id || "";

          try {
            const uploadedAttachments = await uploadTaskAttachmentFiles(normalizedFiles, {
              ...options,
              environmentId: String(options.environmentId || activeTaskEnvironmentId || "").trim(),
            });
            if (isCalendarScheduleDetailMode) {
              return Boolean(appendUploadedScheduleAttachments(uploadedAttachments));
            }
            if (selectedTaskIdRef.current !== sourceTaskId) {
              return false;
            }
            return Boolean(appendUploadedTaskAttachments(uploadedAttachments));
          } catch {
            return false;
          }
        }

        function buildTaskDescriptionUploadedFiles(attachments) {
          return normalizePlaygroundTaskAttachmentList(attachments).map((attachment) => ({
            src: resolveTaskAttachmentInlineImageUrl(attachment),
            name: attachment.filename || "Attachment",
            alt: attachment.filename || "Attachment",
            size: Number(attachment.size) || 0,
            mimeType: String(attachment.mimeType || ""),
            attachmentId: attachment.id || "",
            metadata: { taskAttachment: attachment },
          })).filter((file) => Boolean(file.src));
        }

        async function resolveTaskDescriptionFilePreviewSource(file, signal) {
          const rawSource = String(file?.src || "").trim();
          if (!rawSource) {
            throw new Error("Attachment preview is unavailable.");
          }
          const rawSourceLower = rawSource.toLowerCase();
          if (rawSourceLower.startsWith("blob:") || rawSourceLower.startsWith("data:")) {
            return rawSource;
          }

          const attachmentId = String(file?.attachmentId || "").trim();
          const candidateSources = [
            attachmentId ? getTaskAttachmentStableApiUrl(attachmentId) : "",
            resolveTaskAttachmentApiUrl(rawSource, attachmentId),
            rawSource,
          ].filter((source, index, sources) =>
            Boolean(source) && sources.indexOf(source) === index
          );
          let lastError = null;
          for (const candidateSource of candidateSources) {
            if (signal?.aborted) {
              throw signal.reason || new DOMException("Preview loading was cancelled.", "AbortError");
            }
            let candidateUrl;
            let backendOrigin = "";
            try {
              candidateUrl = new URL(candidateSource, window.location.origin);
              backendOrigin = backendUrl
                ? new URL(backendUrl, window.location.origin).origin
                : "";
            } catch {
              continue;
            }
            const isAuthenticatedPlatformSource =
              candidateUrl.origin === window.location.origin
              || Boolean(backendOrigin && candidateUrl.origin === backendOrigin);
            if (!isAuthenticatedPlatformSource) {
              return candidateUrl.toString();
            }
            try {
              const response = await fetch(candidateUrl.toString(), {
                method: "GET",
                headers: requestHeaders,
                credentials: candidateUrl.origin === window.location.origin
                  ? "same-origin"
                  : "include",
                signal,
              });
              if (!response.ok) {
                throw new Error(
                  "Failed to load attachment preview (" + response.status + ")."
                );
              }
              return await response.blob();
            } catch (error) {
              if (signal?.aborted) throw error;
              lastError = error;
            }
          }
          throw lastError || new Error("Attachment preview is unavailable.");
        }

        async function uploadTaskDescriptionFiles(files) {
          const sourceTaskId = String(draftTask?.id || "").trim();
          if (!sourceTaskId) {
            throw new Error("Ticket is unavailable.");
          }
          const uploadedAttachments = await uploadTaskAttachmentFiles(files, {
            environmentId: activeTaskEnvironmentId,
            allowWithoutEnvironment: true,
          });
          if (selectedTaskIdRef.current !== sourceTaskId) {
            throw new Error("The selected ticket changed before the file upload completed.");
          }
          return buildTaskDescriptionUploadedFiles(uploadedAttachments);
        }

        async function uploadIssueComposerDescriptionFiles(files) {
          const uploadedAttachments = await uploadTaskAttachmentFiles(files, {
            environmentId: String(issueComposerDraft?.environmentId || "").trim(),
            allowWithoutEnvironment: true,
          });
          return buildTaskDescriptionUploadedFiles(uploadedAttachments);
        }

        function handleRenameIssueComposerDescriptionFile(file, nextName) {
          const attachmentId = String(file?.attachmentId || "").trim();
          const normalizedName = String(nextName || "").trim();
          if (!attachmentId || !normalizedName) return;
          updateIssueComposerDraft((current) => ({
            ...current,
            attachments: normalizePlaygroundTaskAttachmentList(current.attachments).map((attachment) =>
              attachment.id === attachmentId
                ? { ...attachment, filename: normalizedName }
                : attachment
            ),
          }));
        }

        function handleRemoveIssueComposerDescriptionFile(file) {
          const attachmentId = String(file?.attachmentId || "").trim();
          if (!attachmentId) return;
          updateIssueComposerDraft((current) => {
            const targetAttachment = normalizePlaygroundTaskAttachmentList(current.attachments)
              .find((attachment) => attachment.id === attachmentId) || null;
            if (!targetAttachment) return current;
            revokeTaskAttachmentObjectUrl(targetAttachment.previewUrl);
            revokeTaskAttachmentObjectUrl(targetAttachment.url);
            return {
              ...current,
              description: removeTaskDescriptionAttachmentReference(
                current.description,
                targetAttachment
              ),
              attachments: normalizePlaygroundTaskAttachmentList(current.attachments)
                .filter((attachment) => attachment.id !== attachmentId),
            };
          });
        }

        async function handleTaskAttachmentInputChange(event) {
          const fileList = Array.from(event?.target?.files || []);
          if (event?.target) {
            event.target.value = "";
          }
          if (fileList.length === 0) {
            return;
          }
          await appendTaskAttachmentFiles(fileList, {
            environmentId: activeTaskEnvironmentId,
          });
        }

        async function handleTaskAttachmentDrop(event) {
          event.preventDefault();
          setIsTaskAttachmentDragging(false);
          const fileList = Array.from(event?.dataTransfer?.files || []);
          if (fileList.length === 0) {
            return;
          }
          await appendTaskAttachmentFiles(fileList, {
            environmentId: activeTaskEnvironmentId,
          });
        }

        function toggleTaskEnvironmentFileSelection(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return;
          setTaskEnvironmentFilePickerSelectedPaths((current) =>
            current.includes(normalizedPath)
              ? current.filter((value) => value !== normalizedPath)
              : current.concat(normalizedPath)
          );
        }

        function toggleTaskEnvironmentFileFolder(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return;
          setTaskEnvironmentFilePickerExpandedFolders((current) =>
            current.includes(normalizedPath)
              ? current.filter((value) => value !== normalizedPath)
              : current.concat(normalizedPath)
          );
        }

        async function handleAttachTaskEnvironmentFiles() {
          if (!taskEnvironmentFilePickerOpen || !activeTaskEnvironmentId) {
            return;
          }
          const selectedEntries = taskEnvironmentFilePickerInventory.filter((entry) =>
            !entry.isFolder && taskEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
          );
          if (!selectedEntries.length) {
            return;
          }

          setTaskEnvironmentFilePickerState((current) => ({
            ...current,
            error: "",
          }));
          setTaskAttachmentTransferState((current) => ({
            ...current,
            error: "",
            isProcessing: true,
          }));

          try {
            const files = [];
            const sourcePaths = [];

            for (const entry of selectedEntries) {
              const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, activeTaskEnvironmentId, entry.path);
              const response = await fetch(downloadUrl, {
                method: "GET",
                headers: requestHeaders,
              });
              if (!response.ok) {
                throw new Error("Failed to load " + (entry.name || "file") + " (" + response.status + ")");
              }
              const blob = await response.blob();
              files.push(new globalThis.File([blob], entry.name || "file", {
                type: entry.mimeType || blob.type || "application/octet-stream",
              }));
              sourcePaths.push(entry.path);
            }

            const attached = await appendTaskAttachmentFiles(files, {
              environmentId: activeTaskEnvironmentId,
              sourcePaths,
            });
            if (attached) {
              setTaskEnvironmentFilePickerOpen(false);
              setTaskEnvironmentFilePickerSelectedPaths([]);
              setTaskEnvironmentFilePickerSearch("");
            } else {
              setTaskAttachmentTransferState((current) => ({
                ...current,
                isProcessing: false,
              }));
            }
          } catch (error) {
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: error instanceof Error ? error.message : "Failed to attach environment files.",
              isProcessing: false,
            }));
            setTaskEnvironmentFilePickerState((current) => ({
              ...current,
              error: error instanceof Error ? error.message : "Failed to attach environment files.",
            }));
          }
        }

        function handleTaskEnvironmentSelectionChange(nextEnvironmentId) {
          const normalizedNextEnvironmentId = String(nextEnvironmentId || "").trim();
          const explicitEnvironmentId = String(draftTask?.environmentId || "").trim();

          if (normalizedNextEnvironmentId === explicitEnvironmentId) {
            return;
          }

          if (taskAttachmentTransferState.isProcessing) {
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: "Wait for attachment uploads to finish before changing the environment.",
            }));
            return;
          }

          if (!draftTask?.attachments?.length || normalizedNextEnvironmentId === activeTaskEnvironmentId) {
            updateDraftField("environmentId", normalizedNextEnvironmentId || null, { autosave: true });
            return;
          }

          setTaskEnvironmentChangeDialog({
            previousEnvironmentId: activeTaskEnvironmentId,
            nextEnvironmentId: normalizedNextEnvironmentId,
            attachmentCount: draftTask.attachments.length,
            error: "",
            isSubmitting: false,
          });
        }

        async function handleTaskEnvironmentChangeDecision(copyAttachments) {
          if (!taskEnvironmentChangeDialog || !draftTask?.id) {
            return;
          }

          const nextEnvironmentId = String(taskEnvironmentChangeDialog.nextEnvironmentId || "").trim();

          if (!copyAttachments || !nextEnvironmentId) {
            setPreviewedTaskAttachmentId("");
            revokeTaskAttachmentListObjectUrls(draftTask.attachments);
            updateDraftTask((current) => {
              const nextConnectors = (current.attachments || []).reduce(
                (selectionState, attachment) => removePlaygroundAttachmentFromConnectorSelections(selectionState, attachment),
                current.connectors
              );
              return {
                ...current,
                environmentId: nextEnvironmentId || null,
                attachments: [],
                connectors: nextConnectors,
              };
            }, { autosave: true });
            setTaskEnvironmentChangeDialog(null);
            setTaskEnvironmentFilePickerOpen(false);
            setTaskEnvironmentFilePickerSelectedPaths([]);
            return;
          }

          setTaskEnvironmentChangeDialog((current) => current
            ? {
                ...current,
                error: "",
                isSubmitting: true,
              }
            : current
          );
          setTaskAttachmentTransferState((current) => ({
            ...current,
            error: "",
            isProcessing: true,
          }));

          try {
            const copiedAttachments = [];
            for (const attachment of draftTask.attachments) {
              const attachmentFile = await loadTaskAttachmentAsFile(attachment);
              const copiedAttachment = normalizePlaygroundTaskAttachmentRecord({
                ...(await uploadTaskAttachment(attachmentFile, {
                  environmentId: nextEnvironmentId,
                  sourcePath: normalizeHistoryPath(attachment.sourcePath || attachment.workspacePath),
                })),
                ...buildPlaygroundTaskAttachmentConnectorMetadata(attachment?.connectorSource, attachment),
              });
              if (copiedAttachment) {
                copiedAttachments.push(copiedAttachment);
              }
            }

            setPreviewedTaskAttachmentId("");
            updateDraftTask((current) => ({
              ...current,
              environmentId: nextEnvironmentId,
              attachments: copiedAttachments,
            }), { autosave: true });
            setTaskEnvironmentChangeDialog(null);
            setTaskEnvironmentFilePickerOpen(false);
            setTaskEnvironmentFilePickerSelectedPaths([]);
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: "",
              isProcessing: false,
            }));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to copy attachments to the new environment.";
            setTaskEnvironmentChangeDialog((current) => current
              ? {
                  ...current,
                  error: errorMessage,
                  isSubmitting: false,
                }
              : current
            );
            setTaskAttachmentTransferState((current) => ({
              ...current,
              error: errorMessage,
              isProcessing: false,
            }));
          }
        }

        function handleTaskAttachmentPreviewToggle(attachment) {
          if (!attachment?.id) return;
          setPreviewedTaskAttachmentId((current) => current === attachment.id ? "" : attachment.id);
        }

        function handleRemoveTaskAttachment(attachmentId) {
          if (!draftTask?.id) return;
          const targetAttachment = draftTask.attachments.find((attachment) => attachment.id === attachmentId) || null;
          if (!targetAttachment) return;
          revokeTaskAttachmentObjectUrl(targetAttachment.previewUrl);
          revokeTaskAttachmentObjectUrl(targetAttachment.url);
          if (previewedTaskAttachmentId === attachmentId) {
            setPreviewedTaskAttachmentId("");
          }
          updateDraftTask((current) => ({
            ...current,
            description: removeTaskDescriptionAttachmentReference(
              current.description,
              targetAttachment
            ),
            attachments: current.attachments.filter((attachment) => attachment.id !== attachmentId),
            connectors: removePlaygroundAttachmentFromConnectorSelections(current.connectors, targetAttachment),
          }), { autosave: true });
        }

        function handleRenameTaskAttachment(attachmentId, nextName) {
          if (!draftTask?.id) return;
          const normalizedAttachmentId = String(attachmentId || "").trim();
          const normalizedName = String(nextName || "").trim();
          if (!normalizedAttachmentId || !normalizedName) return;
          updateDraftTask((current) => ({
            ...current,
            attachments: current.attachments.map((attachment) =>
              attachment.id === normalizedAttachmentId
                ? { ...attachment, filename: normalizedName }
                : attachment
            ),
          }), { autosave: true });
        }

${CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.attachmentRemoval}
        function buildTaskAttachmentListItem(attachment, options = {}) {
          const resolvedAttachment = buildResolvedTaskAttachmentRecord(attachment) || attachment;
          const previewUrl = resolveTaskAttachmentPreviewUrl(resolvedAttachment);
          const normalizedAttachmentMimeType = String(resolvedAttachment.mimeType || "").toLowerCase();
          const isFolderAttachment = Boolean(
            resolvedAttachment.isFolder
            || resolvedAttachment.type === "directory"
            || String(resolvedAttachment.previewKindOverride || "").toLowerCase() === "directory"
            || normalizedAttachmentMimeType === "inode/directory"
          );
          const isImage = !isFolderAttachment
            && (resolvedAttachment.type === "image" || normalizedAttachmentMimeType.startsWith("image/"));
          const activeAttachmentId = typeof options.activeAttachmentId === "string"
            ? options.activeAttachmentId
            : previewedTaskAttachmentId;
          const isRemovable = options.removable !== false;
          const handlePreview = typeof options.onPreview === "function"
            ? options.onPreview
            : handleTaskAttachmentPreviewToggle;
          const handleRemove = typeof options.onRemove === "function"
            ? options.onRemove
            : handleRemoveTaskAttachment;
          const imageFetchHeaders = previewUrl
            && !String(previewUrl).startsWith("blob:")
            && !String(previewUrl).startsWith("data:")
            ? requestHeaders
            : undefined;
          const metadataParts = [
            Number(resolvedAttachment.size) > 0
              ? formatPlaygroundFileSize(resolvedAttachment.size)
              : "",
            resolvedAttachment.uploadedAt
              ? formatPlaygroundFileDate(resolvedAttachment.uploadedAt)
              : "",
          ].filter(Boolean);

          return {
            id: resolvedAttachment.id,
            name: resolvedAttachment.filename || "Attachment",
            metadata: metadataParts.join(" · "),
            active: activeAttachmentId === resolvedAttachment.id,
            preview: isImage && previewUrl
              ? React.createElement(RunnerImagePreviewSurface, {
                  src: previewUrl,
                  alt: resolvedAttachment.filename,
                  mimeType: resolvedAttachment.mimeType,
                  className: "platform-attachments__image-surface",
                  imageClassName: "platform-attachments__image",
                  fetchHeaders: imageFetchHeaders,
                  interactive: false,
                  loadStrategy: "visible",
                })
              : React.createElement("img", {
                  src: isFolderAttachment ? PLAYGROUND_FOLDER_ICON_URL : PLAYGROUND_TEXT_FILE_ICON_URL,
                  alt: "",
                  draggable: false,
                }),
            onActivate: () => handlePreview(resolvedAttachment),
            onRename: isRemovable
              ? (nextName) => handleRenameTaskAttachment(resolvedAttachment.id, nextName)
              : undefined,
            onRemove: isRemovable ? () => handleRemove(resolvedAttachment.id) : undefined,
            removeLabel: "Remove " + (resolvedAttachment.filename || "attachment"),
          };
        }

        function renderTaskAttachmentChip(attachment, options = {}) {
          const resolvedAttachment = buildResolvedTaskAttachmentRecord(attachment) || attachment;
          const previewUrl = resolveTaskAttachmentPreviewUrl(resolvedAttachment);
          const normalizedAttachmentMimeType = String(resolvedAttachment.mimeType || "").toLowerCase();
          const isFolderAttachment = Boolean(
            resolvedAttachment.isFolder
            || resolvedAttachment.type === "directory"
            || String(resolvedAttachment.previewKindOverride || "").toLowerCase() === "directory"
            || normalizedAttachmentMimeType === "inode/directory"
          );
          const isImage = !isFolderAttachment && (resolvedAttachment.type === "image" || normalizedAttachmentMimeType.startsWith("image/"));
          const activeAttachmentId = typeof options.activeAttachmentId === "string"
            ? options.activeAttachmentId
            : previewedTaskAttachmentId;
          const isActive = activeAttachmentId === resolvedAttachment.id;
          const isRemovable = options.removable !== false;
          const handlePreview = typeof options.onPreview === "function"
            ? options.onPreview
            : handleTaskAttachmentPreviewToggle;
          const handleRemove = typeof options.onRemove === "function"
            ? options.onRemove
            : handleRemoveTaskAttachment;
          const imageFetchHeaders = previewUrl && !String(previewUrl).startsWith("blob:") && !String(previewUrl).startsWith("data:")
            ? requestHeaders
            : undefined;

          return React.createElement("div", {
            key: resolvedAttachment.id,
            className: ("runner-attachment " + (isImage ? "runner-attachment-image" : "runner-attachment-file") + (isActive ? " runner-attachment-document-active" : "")).trim(),
          },
            isImage
              ? React.createElement(React.Fragment, null,
                  React.createElement("span", { className: "runner-attachment-image-frame" },
                    previewUrl
                      ? React.createElement(RunnerImagePreviewSurface, {
                          src: previewUrl,
                          alt: resolvedAttachment.filename,
                          mimeType: resolvedAttachment.mimeType,
                          className: "runner-attachment-image-button is-clickable",
                          imageClassName: "runner-attachment-image-preview",
                          fetchHeaders: imageFetchHeaders,
                          onActivate: () => handlePreview(resolvedAttachment),
                        })
                      : React.createElement("span", { className: "runner-attachment-image-placeholder", "aria-hidden": "true" },
                          React.createElement("img", { src: PLAYGROUND_TEXT_FILE_ICON_URL, alt: "", draggable: false })
                        )
                  ),
                  isRemovable
                    ? React.createElement("button", {
                        type: "button",
                        className: "runner-attachment-remove runner-attachment-remove-image",
                        onClick: (event) => {
                          event.stopPropagation();
                          handleRemove(resolvedAttachment.id);
                        },
                        "aria-label": "Remove " + resolvedAttachment.filename,
                      }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                    : null
                )
              : React.createElement(React.Fragment, null,
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-file-button",
                    onClick: () => handlePreview(resolvedAttachment),
                    "aria-label": "Preview " + resolvedAttachment.filename,
                  },
                    React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                      React.createElement("img", {
                        src: isFolderAttachment ? PLAYGROUND_FOLDER_ICON_URL : PLAYGROUND_TEXT_FILE_ICON_URL,
                        alt: "",
                        draggable: false,
                        className: "runner-attachment-file-icon",
                      })
                    ),
                    React.createElement("div", { className: "runner-attachment-file-name", title: resolvedAttachment.filename }, resolvedAttachment.filename)
                  ),
                  isRemovable
                    ? React.createElement("button", {
                        type: "button",
                        className: "runner-attachment-remove runner-attachment-remove-file",
                        onClick: (event) => {
                          event.stopPropagation();
                          handleRemove(resolvedAttachment.id);
                        },
                        "aria-label": "Remove " + resolvedAttachment.filename,
                      }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                    : null
                )
          );
        }

        function renderTaskEnvironmentFilePickerIcon(entry) {
          if (entry?.isFolder) {
            return React.createElement("img", {
              src: PLAYGROUND_FOLDER_ICON_URL,
              alt: "",
              draggable: false,
              className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
            });
          }
          if (getPlaygroundFileKind(entry) === "image") {
            return React.createElement(ImageIcon, {
              className: "tb-file-browser-item-icon tb-file-browser-item-icon-file",
              strokeWidth: 1.75,
            });
          }
          return React.createElement("img", {
            src: PLAYGROUND_TEXT_FILE_ICON_URL,
            alt: "",
            draggable: false,
            className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
          });
        }

        function renderTaskEnvironmentFilePickerRow(row) {
          const entry = row.entry;
          const normalizedPath = normalizeHistoryPath(entry.path);
          const isSelected = taskEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
          const isExpanded = taskEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
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
                  toggleTaskEnvironmentFileFolder(normalizedPath);
                  return;
                }
                toggleTaskEnvironmentFileSelection(normalizedPath);
              },
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (entry.isFolder && !row.searchMatch) {
                    toggleTaskEnvironmentFileFolder(normalizedPath);
                    return;
                  }
                  toggleTaskEnvironmentFileSelection(normalizedPath);
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
                      toggleTaskEnvironmentFileFolder(normalizedPath);
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
                      toggleTaskEnvironmentFileSelection(normalizedPath);
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

        function renderTaskEnvironmentFilePicker() {
          if (!taskEnvironmentFilePickerOpen) {
            return null;
          }

          const selectedFilesCount = taskEnvironmentFilePickerInventory.filter((entry) =>
            !entry.isFolder && taskEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
          ).length;
          const sourceGroups = [
            {
              id: "computers",
              label: "Computers",
              items: activeTaskEnvironment
                ? [{
                    id: String(activeTaskEnvironment.id || activeTaskEnvironmentId || "workspace"),
                    label: activeTaskEnvironment.name || "Computer",
                    active: true,
                    onSelect: () => {},
                  }]
                : [],
            },
            {
              id: "integrations",
              label: "Integrations",
              items: PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => ({
                id: option.source,
                label: option.label,
                icon: renderTaskConnectorServiceIcon(
                  option.source,
                  "tb-file-browser-source-brand-icon"
                ),
                note: taskConnectorConfigByKey[option.key]?.connected === false ? "Connect" : undefined,
                onSelect: () => {
                  setTaskEnvironmentFilePickerOpen(false);
                  openTaskConnectorBrowser(option.source);
                },
              })),
            },
          ];

          return React.createElement("div", { className: "tb-runner-chat" },
            React.createElement(PlatformFileExplorerBrowserModal, {
              open: true,
              visible: true,
              portal: false,
              size: "full",
              title: "Attach files",
              backdropClassName: "tb-file-browser-scrim",
              className: "tb-file-browser-modal",
              onClose: () => setTaskEnvironmentFilePickerOpen(false),
              closeButtonLabel: "Close workspace files",
              sourceGroups,
              breadcrumbs: [{
                id: String(activeTaskEnvironment?.id || activeTaskEnvironmentId || "workspace"),
                label: activeTaskEnvironment?.name || "Computer",
                onSelect: () => {},
              }],
              searchQuery: taskEnvironmentFilePickerSearch,
              onSearchQueryChange: setTaskEnvironmentFilePickerSearch,
              searchPlaceholder: "Search Files",
              onBack: () => {},
              onForward: () => {},
              canGoBack: false,
              canGoForward: false,
              filterContextKey: "workspace:" + String(activeTaskEnvironmentId || ""),
              items: taskEnvironmentFilePickerRows,
              renderItem: renderTaskEnvironmentFilePickerRow,
              getItemKind: (row) => {
                const entry = row?.entry;
                if (entry?.isFolder) return "folder";
                if (getPlaygroundFileKind(entry) === "image") return "image";
                if (/\.pdf$/i.test(String(entry?.name || ""))) return "pdf";
                return "file";
              },
              getItemTimestamp: (row) => row?.entry?.modifiedTime || row?.entry?.createdTime,
              loading: taskEnvironmentFilePickerState.status === "loading",
              loadingMessage: "Loading workspace files...",
              error: taskEnvironmentFilePickerState.error || null,
              emptyMessage: ({ activeFilter, hasSearchQuery }) =>
                hasSearchQuery
                  ? "No files match your search"
                  : activeFilter === "recent"
                    ? "No recently changed files"
                    : activeFilter === "images"
                      ? "No images in this folder"
                      : activeFilter === "pdfs"
                        ? "No PDFs in this folder"
                        : "This folder is empty",
              confirmLabel: React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                taskAttachmentTransferState.isProcessing
                  ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                  : null,
                React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                  taskAttachmentTransferState.isProcessing ? "Attaching Files..." : "Attach Files"
                )
              ),
              confirmDisabled: selectedFilesCount === 0 || taskAttachmentTransferState.isProcessing,
              onCancel: () => setTaskEnvironmentFilePickerOpen(false),
              onConfirm: handleAttachTaskEnvironmentFiles,
            })
          );
        }

        function renderTaskConnectorServiceIcon(source, className) {
          const option = getPlaygroundTaskConnectorOption(source);
          if (!option?.logoUrl) {
            return React.createElement(Link2, { className, strokeWidth: 1.8 });
          }
          return React.createElement("img", {
            src: option.logoUrl,
            alt: "",
            draggable: false,
            className: className + (option.key === "github" ? " is-github" : ""),
          });
        }

        function renderTaskConnectorBrowserItemIcon(item) {
          if (item?.isFolder) {
            return React.createElement("img", {
              src: PLAYGROUND_FOLDER_ICON_URL,
              alt: "",
              draggable: false,
              className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
            });
          }
          if (String(item?.mimeType || "").startsWith("application/x-notion-")) {
            return renderTaskConnectorServiceIcon("notion", "tb-file-browser-item-icon tb-file-browser-source-brand-icon");
          }
          if (getPlaygroundFileKind(item) === "image") {
            return React.createElement(ImageIcon, {
              className: "tb-file-browser-item-icon tb-file-browser-item-icon-file",
              strokeWidth: 1.75,
            });
          }
          return React.createElement("img", {
            src: PLAYGROUND_TEXT_FILE_ICON_URL,
            alt: "",
            draggable: false,
            className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
          });
        }

        function renderTaskConnectorBrowserItem(item, depth = 0) {
          const isSelected = taskConnectorBrowserSelectedFileIds.includes(item.id);
          const isPreviewActive = taskConnectorBrowserPreviewItem?.id === item.id;
          const isExpanded = taskConnectorBrowserExpandedFolderIds.includes(item.id);
          const isFolderLoading = (taskConnectorBrowserLoadingFolderIds[taskConnectorBrowserCurrentKey] || []).includes(item.id);
          const nestedItems = taskConnectorBrowserSearchQuery.trim() ? [] : fileItemsForParent(taskConnectorBrowserItems, item.id);
          const showGithubFolderCheckbox = taskConnectorBrowserCurrentSource === "github" && item.isFolder;

          return React.createElement("div", { key: item.id },
            React.createElement("div", {
              className: "tb-file-browser-item" + (isPreviewActive ? " preview" : "") + (isSelected ? " selected" : ""),
              role: "button",
              tabIndex: 0,
              onClick: () => handleTaskConnectorBrowserItemClick(item),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleTaskConnectorBrowserItemClick(item);
                }
              },
              style: { paddingLeft: String(12 + depth * 20) + "px" },
            },
              item.isFolder
                ? React.createElement("button", {
                    type: "button",
                    className: "tb-file-browser-item-leading",
                    onClick: (event) => void toggleTaskConnectorBrowserFolderExpansion(item.id, event),
                  }, isFolderLoading
                    ? React.createElement(Loader2, { className: "tb-file-browser-folder-chevron tb-file-browser-folder-chevron-spin", strokeWidth: 1.8 })
                    : isExpanded
                      ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                      : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                  )
                : React.createElement("div", {
                    className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                    onClick: (event) => {
                      event.stopPropagation();
                      handleTaskConnectorBrowserItemClick(item);
                    },
                  },
                    isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                  ),
              showGithubFolderCheckbox
                ? React.createElement("div", {
                    className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                    onClick: (event) => {
                      event.stopPropagation();
                      toggleTaskConnectorBrowserSelectedId("github", item.id);
                    },
                  },
                    isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                  )
                : null,
              renderTaskConnectorBrowserItemIcon(item),
              React.createElement("span", { className: "tb-file-browser-item-name", title: item.name }, item.name),
              React.createElement("span", { className: "tb-file-browser-item-meta" }, formatPlaygroundFileDate(item.modifiedTime || item.createdTime)),
              React.createElement("span", { className: "tb-file-browser-item-size" }, item.isFolder ? "" : formatPlaygroundFileSize(item.size))
            ),
            item.isFolder && isExpanded && nestedItems.length > 0
              ? React.createElement("div", { className: "tb-file-browser-item-children" },
                  nestedItems.map((nestedItem) => renderTaskConnectorBrowserItem(nestedItem, depth + 1))
                )
              : null
          );
        }

        function renderTaskConnectorBrowserPreview() {
          if (!taskConnectorBrowserPreviewItem) {
            return null;
          }

          const previewKind = taskConnectorBrowserPreviewState.kind || "";
          const previewContent = taskConnectorBrowserPreviewState.content || "";
          const fileKind = getPlaygroundFileKind(taskConnectorBrowserPreviewItem);
          const typeLabel = String(taskConnectorBrowserPreviewItem?.mimeType || "").startsWith("application/x-notion-")
            ? (taskConnectorBrowserPreviewItem.id === "__entire_workspace__" ? "workspace" : "database")
            : taskConnectorBrowserPreviewItem.isFolder
              ? "folder"
              : fileKind;

          return React.createElement("div", { className: "tb-file-browser-preview" },
            React.createElement("div", { className: "tb-file-browser-preview-header" },
              React.createElement("div", { className: "tb-file-browser-preview-art" },
                taskConnectorBrowserPreviewState.status === "loading"
                  ? React.createElement(Loader2, { className: "tb-file-browser-preview-loader", strokeWidth: 1.75 })
                  : previewKind === "image" && previewContent
                    ? React.createElement("img", {
                        src: previewContent,
                        alt: taskConnectorBrowserPreviewItem.name,
                        className: "tb-file-browser-preview-image",
                      })
                    : previewKind === "text" && previewContent
                      ? React.createElement("pre", { className: "tb-file-browser-preview-text" }, previewContent)
                      : renderTaskConnectorBrowserItemIcon(taskConnectorBrowserPreviewItem)
              ),
              React.createElement("h3", { className: "tb-file-browser-preview-name" }, taskConnectorBrowserPreviewItem.name),
              React.createElement("p", { className: "tb-file-browser-preview-subtitle" },
                taskConnectorBrowserPreviewItem.isFolder
                  ? "Folder"
                  : formatPlaygroundFileSize(taskConnectorBrowserPreviewItem.size)
              )
            ),
            React.createElement("div", { className: "tb-file-browser-preview-info" },
              React.createElement("div", { className: "tb-file-browser-preview-info-title" }, "Information"),
              React.createElement("div", { className: "tb-file-browser-preview-info-row" },
                React.createElement("span", null, "Modified"),
                React.createElement("span", null, formatPlaygroundFileDate(taskConnectorBrowserPreviewItem.modifiedTime))
              ),
              React.createElement("div", { className: "tb-file-browser-preview-info-row" },
                React.createElement("span", null, "Created"),
                React.createElement("span", null, formatPlaygroundFileDate(taskConnectorBrowserPreviewItem.createdTime))
              ),
              React.createElement("div", { className: "tb-file-browser-preview-info-row" },
                React.createElement("span", null, "Type"),
                React.createElement("span", null, typeLabel || "file")
              ),
              taskConnectorBrowserPreviewState.error
                ? React.createElement("div", { className: "tb-file-browser-empty" }, taskConnectorBrowserPreviewState.error)
                : null
            )
          );
        }

        function renderProjectConnectorBrowserSidebar() {
          return React.createElement("div", { className: "tb-file-browser-sidebar" },
            React.createElement("div", { className: "tb-file-browser-search-wrap" },
              React.createElement("div", { className: "tb-file-browser-search" },
                React.createElement(Search, { className: "tb-file-browser-search-icon", strokeWidth: 1.9 }),
                React.createElement("input", {
                  className: "tb-file-browser-search-input",
                  value: taskConnectorBrowserSearchQuery,
                  placeholder: "Search files...",
                  onChange: (event) => setTaskConnectorBrowserSearchQuery(event.target.value),
                }),
                taskConnectorBrowserSearchQuery
                  ? React.createElement("button", {
                      type: "button",
                      className: "tb-file-browser-search-clear",
                      onClick: () => setTaskConnectorBrowserSearchQuery(""),
                      "aria-label": "Clear search",
                    }, React.createElement(X, { className: "tb-file-browser-search-clear-icon", strokeWidth: 1.9 }))
                  : null
              )
            ),
            React.createElement("div", { className: "tb-file-browser-sidebar-section" },
              React.createElement("div", { className: "tb-file-browser-sidebar-title" }, "Integrations"),
              React.createElement("div", { className: "tb-file-browser-sidebar-list" },
                PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) =>
                  React.createElement("button", {
                    key: option.key,
                    type: "button",
                    className: "tb-file-browser-source-row" + (taskConnectorBrowserCurrentSource === option.source ? " active" : ""),
                    onClick: () => {
                      const nextSource = getPlaygroundTaskConnectorSource(option.source) || "github";
                      setProjectConnectorBrowserDialog((current) => current
                        ? {
                            ...current,
                            source: nextSource,
                          }
                        : current
                      );
                      switchTaskConnectorBrowserSource(nextSource);
                    },
                  },
                    renderTaskConnectorServiceIcon(option.source, "tb-file-browser-source-brand-icon"),
                    React.createElement("span", { className: "tb-file-browser-source-label" }, option.label),
                    taskConnectorConfigByKey[option.key]?.connected === false
                      ? React.createElement("span", { className: "tb-file-browser-source-note" }, "Connect")
                      : null
                  )
                )
              )
            )
          );
        }

        function renderProjectConnectorBrowser() {
          if (taskConnectorBrowserOpen) {
            if (projectConnectorBrowserDialog || taskConnectorBrowserMode === "project" || projectConnectorBrowserActiveRef.current) {
              console.info("[connector-debug] renderProjectConnectorBrowser skipped: task connector browser is already open", {
                taskConnectorBrowserOpen,
                taskConnectorBrowserMode,
                projectConnectorDialog: projectConnectorBrowserDialog,
                projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
                currentSource: taskConnectorBrowserCurrentSource,
              });
            }
            return null;
          }
          const dialog = projectConnectorBrowserDialog;
          if (!dialog) {
            return null;
          }

          const projectRecord = getProjectConnectorBrowserProjectRecord();
          if (!projectRecord?.id) {
            console.warn("[connector-debug] renderProjectConnectorBrowser skipped: missing project record", {
              dialog,
              selectedProjectId,
              selectedProjectRecordId: selectedProject?.id || "",
              selectedProjectSnapshotId: selectedProjectSnapshot?.id || "",
              projectsCount: projects.length,
            });
            return null;
          }

          const currentConfig = taskConnectorBrowserCurrentConfig;
          const isConnected = Boolean(currentConfig?.connected);
          const currentError = taskConnectorBrowserErrors[taskConnectorBrowserCurrentKey] || "";
          const isLoading = Boolean(taskConnectorBrowserLoadingState[taskConnectorBrowserCurrentKey]);
          const currentSavedSelection = getDraftTaskConnectorSelection(taskConnectorBrowserCurrentSource, projectRecord);
          const hasSelection = taskConnectorBrowserSelectedFileIds.length > 0;
          const primaryActionLabel = hasSelection
            ? "Use " + (taskConnectorBrowserSelectedLabel || "Selection")
            : currentSavedSelection
              ? "Clear Selection"
              : "Use Selection";

          console.info("[connector-debug] renderProjectConnectorBrowser rendering", {
            dialog,
            projectRecordId: projectRecord.id,
            currentSource: taskConnectorBrowserCurrentSource,
            currentKey: taskConnectorBrowserCurrentKey,
            isConnected,
            isLoading,
            currentError,
            hasSelection,
            hasSavedSelection: Boolean(currentSavedSelection),
          });

          const connectorBrowserElement = React.createElement("div", {
            key: "project-connector-browser:" + String(dialog.token || "") + ":" + taskConnectorBrowserCurrentSource,
            className: "tb-runner-chat playground-tasks-connector-browser-portal",
            "data-connector-browser-mode": "project",
            "data-connector-browser-source": taskConnectorBrowserCurrentSource,
          },
            React.createElement(PlatformModalBackdrop, {
              className: "tb-file-browser-scrim",
              onClick: closeTaskConnectorBrowser,
            },
              React.createElement(PlatformModalSurface, {
                className: "tb-file-browser-modal",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "tb-file-browser-body" },
                  renderProjectConnectorBrowserSidebar(),
                  React.createElement("div", { className: "tb-file-browser-main" },
                    !isConnected
                      ? React.createElement("div", { className: "tb-file-browser-auth-screen" },
                          React.createElement("div", { className: "tb-file-browser-auth-card" },
                            React.createElement("div", { className: "tb-file-browser-auth-icon-wrap" },
                              renderTaskConnectorServiceIcon(taskConnectorBrowserCurrentSource, "tb-file-browser-auth-icon")
                            ),
                            React.createElement("h3", { className: "tb-file-browser-auth-title" },
                              "Connect to " + taskConnectorBrowserCurrentOption.label
                            ),
                            React.createElement("p", { className: "tb-file-browser-auth-copy" },
                              taskConnectorBrowserCurrentSource === "notion"
                                ? "Connect your Notion workspace to browse and select databases."
                                : "Connect your " + taskConnectorBrowserCurrentOption.label + " to browse and select files."
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "tb-file-browser-auth-button",
                              onClick: () => {
                                const connectorBrowserPayload = {
                                  mode: "project",
                                  source: taskConnectorBrowserCurrentSource,
                                  projectId: String(projectRecord.id || selectedProjectId || ""),
                                  view: "overview",
                                };
                                console.info("[connector-debug] project connector auth button clicked", {
                                  connectorBrowser: connectorBrowserPayload,
                                  hasOnConnect: typeof currentConfig?.onConnect === "function",
                                  isConnected,
                                });
                                currentConfig?.onConnect?.({
                                  connectorBrowser: connectorBrowserPayload,
                                });
                              },
                            }, "Connect " + taskConnectorBrowserCurrentOption.label)
                          )
                        )
                      : React.createElement(React.Fragment, null,
                          React.createElement("div", { className: "tb-file-browser-header" },
                            React.createElement("button", {
                              type: "button",
                              className: "tb-file-browser-nav-button",
                              onClick: goTaskConnectorBrowserBack,
                              disabled: taskConnectorBrowserHistoryIndex <= 0,
                            }, React.createElement(ChevronLeft, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                            React.createElement("button", {
                              type: "button",
                              className: "tb-file-browser-nav-button",
                              onClick: goTaskConnectorBrowserForward,
                              disabled: taskConnectorBrowserHistoryIndex >= taskConnectorBrowserHistory.length - 1,
                            }, React.createElement(ChevronRight, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                            React.createElement("div", { className: "tb-file-browser-header-icon" },
                              renderTaskConnectorServiceIcon(taskConnectorBrowserCurrentSource, "tb-file-browser-source-brand-icon")
                            ),
                            React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                              taskConnectorBrowserPath.map((crumb, index) =>
                                React.createElement("span", {
                                  key: String(crumb.id || "root") + ":" + index,
                                  className: "tb-file-browser-breadcrumb-chip",
                                },
                                  index > 0 ? React.createElement("span", { className: "tb-file-browser-breadcrumb-sep" }, "/") : null,
                                  React.createElement("button", {
                                    type: "button",
                                    className: "tb-file-browser-breadcrumb" + (index === taskConnectorBrowserPath.length - 1 ? " active" : ""),
                                    onClick: () => navigateTaskConnectorBrowserToBreadcrumb(index),
                                  }, crumb.name)
                                )
                              )
                            ),
                            currentConfig?.onDisconnect
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "tb-file-browser-toolbar-button",
                                  onClick: () => currentConfig.onDisconnect?.(),
                                  title: "Disconnect " + taskConnectorBrowserCurrentOption.label,
                                }, React.createElement(LogOut, { className: "tb-file-browser-toolbar-icon", strokeWidth: 1.8 }))
                              : null
                          ),
                          React.createElement("div", { className: "tb-file-browser-list" },
                            isLoading
                              ? React.createElement("div", { className: "tb-file-browser-empty" },
                                  "Loading " + taskConnectorBrowserCurrentOption.label + "..."
                                )
                              : currentError
                                ? React.createElement("div", { className: "tb-file-browser-empty" }, currentError)
                                : taskConnectorBrowserFilteredItems.length === 0
                                  ? React.createElement("div", { className: "tb-file-browser-empty" },
                                      taskConnectorBrowserSearchQuery.trim()
                                        ? "No files match your search"
                                        : taskConnectorBrowserCurrentSource === "notion"
                                          ? "No Notion databases found"
                                          : "This folder is empty"
                                    )
                                  : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                      taskConnectorBrowserFilteredItems.map((item) => renderTaskConnectorBrowserItem(item))
                                    )
                          )
                        )
                  ),
                  renderTaskConnectorBrowserPreview()
                ),
                React.createElement("div", { className: "tb-file-browser-footer" },
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                    onClick: closeTaskConnectorBrowser,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                    onClick: handleApplyTaskConnectorSelection,
                    disabled: (!hasSelection && !currentSavedSelection) || taskAttachmentTransferState.isProcessing,
                  }, primaryActionLabel)
                )
              )
            )
          );

          return typeof document !== "undefined" && document.body
            ? createPortal(connectorBrowserElement, document.body)
            : connectorBrowserElement;
        }

        function renderTaskConnectorBrowser() {
          if (!taskConnectorBrowserOpen) {
            if (projectConnectorBrowserDialog || taskConnectorBrowserMode === "project" || taskConnectorBrowserMode === "project-composer" || projectConnectorBrowserActiveRef.current) {
              console.info("[connector-debug] renderTaskConnectorBrowser skipped: open flag false", {
                taskConnectorBrowserOpen,
                taskConnectorBrowserMode,
                projectConnectorDialog: projectConnectorBrowserDialog,
                projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
                currentSource: taskConnectorBrowserCurrentSource,
              });
            }
            return null;
          }

          const isProjectComposerConnectorMode = taskConnectorBrowserMode === "project-composer";
          const isProjectConnectorMode = isProjectConnectorBrowserContext;
          const projectConnectorRecord = isProjectConnectorMode
            ? (isProjectComposerConnectorMode ? projectDraft : getProjectConnectorBrowserProjectRecord())
            : null;
          if (isProjectConnectorMode && !isProjectComposerConnectorMode && !projectConnectorRecord?.id) {
            console.warn("[connector-debug] renderTaskConnectorBrowser skipped: project mode without project record", {
              taskConnectorBrowserOpen,
              taskConnectorBrowserMode,
              projectConnectorDialog: projectConnectorBrowserDialog,
              projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
              selectedProjectId,
              selectedProjectRecordId: selectedProject?.id || "",
              selectedProjectSnapshotId: selectedProjectSnapshot?.id || "",
              projectsCount: projects.length,
              currentSource: taskConnectorBrowserCurrentSource,
            });
            return null;
          }

          const currentConfig = taskConnectorBrowserCurrentConfig;
          const isConnected = Boolean(currentConfig?.connected);
          const currentError = taskConnectorBrowserErrors[taskConnectorBrowserCurrentKey] || "";
          const isLoading = Boolean(taskConnectorBrowserLoadingState[taskConnectorBrowserCurrentKey]);
          const currentSavedSelection = getDraftTaskConnectorSelection(
            taskConnectorBrowserCurrentSource,
            isProjectConnectorMode ? projectConnectorRecord : (isCalendarScheduleDetailMode ? scheduleDraft : draftTask)
          );
          const hasSelection = taskConnectorBrowserSelectedFileIds.length > 0;
          const primaryActionLabel = isProjectConnectorMode
            ? (hasSelection
                ? "Use " + (taskConnectorBrowserSelectedLabel || "Selection")
                : currentSavedSelection
                  ? "Clear Selection"
                  : "Use Selection")
            : hasSelection
              ? (taskConnectorBrowserCurrentSource === "notion"
                  ? "Use " + (taskConnectorBrowserSelectedLabel || "Database")
                  : "Attach " + (taskConnectorBrowserSelectedLabel || "Files"))
              : currentSavedSelection
                ? "Clear Selection"
                : (taskConnectorBrowserCurrentSource === "notion" ? "Use Database" : "Attach Files");

          console.info("[connector-debug] renderTaskConnectorBrowser rendering", {
            isProjectConnectorMode,
            projectConnectorRecordId: projectConnectorRecord?.id || "",
            taskConnectorBrowserOpen,
            taskConnectorBrowserMode,
            projectConnectorDialog: projectConnectorBrowserDialog,
            projectConnectorActiveRef: projectConnectorBrowserActiveRef.current,
            currentSource: taskConnectorBrowserCurrentSource,
            currentKey: taskConnectorBrowserCurrentKey,
            isConnected,
            isLoading,
            currentError,
            hasSelection,
            hasSavedSelection: Boolean(currentSavedSelection),
          });

          const connectorSourceGroups = [
            !isProjectConnectorMode && activeTaskEnvironment
              ? {
                  id: "computers",
                  label: "Computers",
                  items: [{
                    id: String(activeTaskEnvironment.id || activeTaskEnvironmentId || "workspace"),
                    label: activeTaskEnvironment.name || "Computer",
                    onSelect: () => {
                      closeTaskConnectorBrowser();
                      openTaskEnvironmentFilePicker();
                    },
                  }],
                }
              : null,
            {
              id: "integrations",
              label: "Integrations",
              items: PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => ({
                id: option.source,
                label: option.label,
                icon: renderTaskConnectorServiceIcon(option.source, "tb-file-browser-source-brand-icon"),
                note: taskConnectorConfigByKey[option.key]?.connected === false ? "Connect" : undefined,
                active: taskConnectorBrowserCurrentSource === option.source,
                onSelect: () => switchTaskConnectorBrowserSource(option.source),
              })),
            },
          ].filter(Boolean);
          const connectorAuthContent = !isConnected
            ? React.createElement("div", { className: "tb-file-browser-auth-screen" },
                React.createElement("div", { className: "tb-file-browser-auth-card" },
                  React.createElement("div", { className: "tb-file-browser-auth-icon-wrap" },
                    renderTaskConnectorServiceIcon(taskConnectorBrowserCurrentSource, "tb-file-browser-auth-icon")
                  ),
                  React.createElement("h3", { className: "tb-file-browser-auth-title" },
                    "Connect to " + taskConnectorBrowserCurrentOption.label
                  ),
                  React.createElement("p", { className: "tb-file-browser-auth-copy" },
                    taskConnectorBrowserCurrentSource === "notion"
                      ? "Connect your Notion workspace to browse and select databases."
                      : "Connect your " + taskConnectorBrowserCurrentOption.label + " to browse and select files."
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "tb-file-browser-auth-button",
                    onClick: () => {
                      const connectorBrowserPayload = {
                        mode: isProjectComposerConnectorMode
                          ? "project-composer"
                          : isProjectConnectorMode
                            ? "project"
                            : "task",
                        source: taskConnectorBrowserCurrentSource,
                        projectId: isProjectConnectorMode
                          ? String(projectConnectorRecord?.id || selectedProjectId || "")
                          : String(selectedProjectId || ""),
                        view: isProjectConnectorMode ? "overview" : taskView,
                      };
                      currentConfig?.onConnect?.({
                        connectorBrowser: connectorBrowserPayload,
                        projectComposerMode,
                        projectDraft: isProjectComposerConnectorMode ? projectDraft : undefined,
                      });
                    },
                  }, "Connect " + taskConnectorBrowserCurrentOption.label)
                )
              )
            : null;

          return React.createElement("div", {
              key: "connector-browser:" + taskConnectorBrowserRenderKey,
              className: "tb-runner-chat playground-tasks-connector-browser-portal",
              "data-connector-browser-mode": isProjectConnectorMode ? "project" : "task",
              "data-connector-browser-source": taskConnectorBrowserCurrentSource,
            },
            React.createElement(PlatformFileExplorerBrowserModal, {
              open: true,
              visible: true,
              portal: false,
              size: "full",
              title: "Attach connector data",
              backdropClassName: "tb-file-browser-scrim",
              className: "tb-file-browser-modal",
              onClose: closeTaskConnectorBrowser,
              closeButtonLabel: "Close connector explorer",
              sourceGroups: connectorSourceGroups,
              breadcrumbs: taskConnectorBrowserPath.map((crumb, index) => ({
                id: String(crumb.id || "root") + ":" + index,
                label: crumb.name,
                onSelect: () => navigateTaskConnectorBrowserToBreadcrumb(index),
              })),
              searchQuery: taskConnectorBrowserSearchQuery,
              onSearchQueryChange: setTaskConnectorBrowserSearchQuery,
              searchPlaceholder: "Search Files",
              onBack: goTaskConnectorBrowserBack,
              onForward: goTaskConnectorBrowserForward,
              canGoBack: taskConnectorBrowserHistoryIndex > 0,
              canGoForward: taskConnectorBrowserHistoryIndex < taskConnectorBrowserHistory.length - 1,
              headerIcon: renderTaskConnectorServiceIcon(
                taskConnectorBrowserCurrentSource,
                "tb-file-browser-source-brand-icon"
              ),
              headerTitle: taskConnectorBrowserCurrentOption.label,
              headerActions: currentConfig?.onDisconnect
                ? React.createElement("button", {
                    type: "button",
                    className: "tb-file-browser-toolbar-button",
                    onClick: () => currentConfig.onDisconnect?.(),
                    title: "Disconnect " + taskConnectorBrowserCurrentOption.label,
                    "aria-label": "Disconnect " + taskConnectorBrowserCurrentOption.label,
                  }, React.createElement(LogOut, { className: "tb-file-browser-toolbar-icon", strokeWidth: 1.8 }))
                : null,
              filterContextKey: "connector:" + taskConnectorBrowserCurrentSource,
              items: isConnected ? taskConnectorBrowserFilteredItems : [],
              renderItem: (item) => renderTaskConnectorBrowserItem(item),
              getItemKind: (item) => {
                if (item?.isFolder) return "folder";
                if (getPlaygroundFileKind(item) === "image") return "image";
                if (/\.pdf$/i.test(String(item?.name || ""))) return "pdf";
                return "file";
              },
              getItemTimestamp: (item) => item?.modifiedTime || item?.createdTime,
              loading: isConnected && isLoading,
              loadingMessage: "Loading " + taskConnectorBrowserCurrentOption.label + "...",
              error: isConnected ? currentError || null : null,
              emptyMessage: ({ hasSearchQuery }) => hasSearchQuery
                ? "No files match your search"
                : taskConnectorBrowserCurrentSource === "notion"
                  ? "No Notion databases found"
                  : "This folder is empty",
              content: connectorAuthContent,
              preview: isConnected ? renderTaskConnectorBrowserPreview() : null,
              previewTitle: "Preview",
              onPreviewClose: () => setTaskConnectorBrowserPreviewId(""),
              cancelLabel: "Cancel",
              confirmLabel: React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                taskAttachmentTransferState.isProcessing && taskConnectorBrowserCurrentSource !== "notion"
                  ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                  : null,
                React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                  taskAttachmentTransferState.isProcessing && taskConnectorBrowserCurrentSource !== "notion"
                    ? "Attaching Files..."
                    : primaryActionLabel
                )
              ),
              confirmDisabled: !isConnected
                || ((!hasSelection && !currentSavedSelection) || taskAttachmentTransferState.isProcessing),
              onCancel: closeTaskConnectorBrowser,
              onConfirm: handleApplyTaskConnectorSelection,
            })
          );
        }

        function renderTaskParentPickerDialog() {
          const isScheduleParentPicker = taskParentPickerState?.mode === "schedule";
          if (!taskParentPickerState || (!draftTask?.id && !isScheduleParentPicker)) {
            return null;
          }

          const parentCandidateTasks = isScheduleParentPicker ? scheduleParentCandidateTasks : taskParentCandidateTasks;

          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-confirm-scrim playground-tasks-parent-picker-scrim",
              onClick: () => setTaskParentPickerState(null),
            },
            React.createElement(PlatformModalSurface, {
              className: "playground-tasks-confirm-dialog playground-tasks-parent-picker-dialog",
              onClick: (event) => event.stopPropagation(),
            },
              React.createElement("div", { className: "playground-tasks-confirm-title" }, "Choose parent task"),
              React.createElement("div", { className: "playground-tasks-confirm-copy" },
                "Subtasks stay nested under their parent in backlog and are hidden from the board."
              ),
              parentCandidateTasks.length > 0
                ? React.createElement("div", { className: "playground-tasks-parent-picker-list" },
                    parentCandidateTasks.map((task) => {
                      const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                      return React.createElement("button", {
                          key: task.id,
                          type: "button",
                          className: "playground-tasks-parent-picker-row",
                          onClick: () => {
                            if (isScheduleParentPicker) {
                              handleSelectScheduleParent(task.id);
                              return;
                            }
                            handleSelectTaskParent(task.id);
                          },
                        },
                          React.createElement("div", { className: "playground-tasks-parent-picker-row-main" },
                            React.createElement("div", { className: "playground-tasks-parent-picker-row-title" }, task.title || "Untitled Task"),
                            React.createElement("div", { className: "playground-tasks-parent-picker-row-copy" },
                              getPlaygroundTaskStatusLabel(task.status)
                            )
                          ),
                          React.createElement("span", { className: "playground-tasks-parent-picker-row-ticket" }, taskTicketNumber)
                        );
                    })
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    "Create another task first, then convert this one into a subtask."
                  ),
              React.createElement("div", { className: "playground-tasks-confirm-actions" },
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-environments-action-button is-secondary",
                  onClick: () => setTaskParentPickerState(null),
                }, "Cancel")
              )
            )
          );
        }

        function renderBoardBlockedPickerDialog() {
          if (!boardBlockedPickerState) {
            return null;
          }

          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-confirm-scrim playground-tasks-parent-picker-scrim",
              onClick: () => {
                if (!boardBlockedPickerState.isSubmitting) {
                  setBoardBlockedPickerState(null);
                }
              },
            },
            React.createElement(PlatformModalSurface, {
              className: "playground-tasks-confirm-dialog playground-tasks-parent-picker-dialog",
              onClick: (event) => event.stopPropagation(),
            },
              React.createElement("div", { className: "playground-tasks-confirm-title" },
                "Block " + boardBlockedPickerState.ticketNumber + " by which ticket?"
              ),
              React.createElement("div", { className: "playground-tasks-confirm-copy" },
                "Choose the ticket that needs to be completed before ",
                React.createElement("strong", null, boardBlockedPickerState.ticketNumber + " " + boardBlockedPickerState.taskTitle),
                "."
              ),
              boardBlockedPickerState.error
                ? React.createElement("div", { className: "playground-environments-error" }, boardBlockedPickerState.error)
                : null,
              boardBlockedTaskCandidates.length > 0
                ? React.createElement("div", { className: "playground-tasks-parent-picker-list" },
                    boardBlockedTaskCandidates.map((task) => {
                      const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "000";
                      return React.createElement("button", {
                          key: task.id,
                          type: "button",
                          className: "playground-tasks-parent-picker-row",
                          disabled: boardBlockedPickerState.isSubmitting,
                          onClick: () => void handleBoardBlockedDependencySelection(task.id),
                        },
                          React.createElement("div", { className: "playground-tasks-parent-picker-row-main" },
                            React.createElement("div", { className: "playground-tasks-parent-picker-row-title" }, task.title || "Untitled Task"),
                            React.createElement("div", { className: "playground-tasks-parent-picker-row-copy" },
                              getPlaygroundTaskStatusLabel(getTaskBoardStatus(task))
                            )
                          ),
                          React.createElement("span", { className: "playground-tasks-parent-picker-row-ticket" }, taskTicketNumber)
                        );
                    })
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    "Create another ticket first, then you can block this task from the board."
                  ),
              React.createElement("div", { className: "playground-tasks-confirm-actions" },
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-environments-action-button is-secondary",
                  onClick: () => setBoardBlockedPickerState(null),
                  disabled: boardBlockedPickerState.isSubmitting,
                }, "Cancel")
              )
            )
          );
        }

        function renderTaskEnvironmentChangeDialog() {
          if (!taskEnvironmentChangeDialog) {
            return null;
          }

          const nextEnvironment = taskEnvironmentChangeDialog.nextEnvironmentId
            ? environmentsById[taskEnvironmentChangeDialog.nextEnvironmentId] || null
            : null;

          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-confirm-scrim",
              onClick: () => {
                if (!taskEnvironmentChangeDialog.isSubmitting) {
                  setTaskEnvironmentChangeDialog(null);
                }
              },
            },
            React.createElement(PlatformModalSurface, {
              className: "playground-tasks-confirm-dialog",
              onClick: (event) => event.stopPropagation(),
            },
              React.createElement("div", { className: "playground-tasks-confirm-title" },
                nextEnvironment
                  ? "Copy attachments to " + (nextEnvironment.name || "the new environment") + "?"
                  : "Remove existing attachments?"
              ),
              React.createElement("div", { className: "playground-tasks-confirm-copy" },
                nextEnvironment
                  ? "This task already has " + taskEnvironmentChangeDialog.attachmentCount + " attachment" + (taskEnvironmentChangeDialog.attachmentCount === 1 ? "" : "s") + ". Copy them into the newly selected environment, or remove them from the task."
                  : "This task no longer has a target environment. Existing attachments will be removed from the task."
              ),
              taskEnvironmentChangeDialog.error
                ? React.createElement("div", { className: "playground-environments-error" }, taskEnvironmentChangeDialog.error)
                : null,
              React.createElement("div", { className: "playground-tasks-confirm-actions" },
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-environments-action-button is-secondary",
                  onClick: () => setTaskEnvironmentChangeDialog(null),
                  disabled: taskEnvironmentChangeDialog.isSubmitting,
                }, "Cancel"),
                nextEnvironment
                  ? React.createElement(PlatformSecondaryButton, {
                    size: "medium",
                      type: "button",
                      className: "playground-environments-action-button is-secondary",
                      onClick: () => void handleTaskEnvironmentChangeDecision(false),
                      disabled: taskEnvironmentChangeDialog.isSubmitting,
                    }, "No, remove them")
                  : null,
                React.createElement("button", {
                  type: "button",
                  className: "playground-environments-action-button",
                  onClick: () => void handleTaskEnvironmentChangeDecision(Boolean(nextEnvironment)),
                  disabled: taskEnvironmentChangeDialog.isSubmitting,
                }, taskEnvironmentChangeDialog.isSubmitting
                  ? (nextEnvironment ? "Copying..." : "Removing...")
                  : (nextEnvironment ? "Copy Files" : "Remove Attachments")
                )
              )
            )
          );
        }

        function renderTaskDeleteDialog() {
          if (!taskDeleteDialogState) {
            return null;
          }

          return React.createElement(PlatformModalBackdrop, {
              className: "playground-tasks-confirm-scrim",
              onClick: () => {
                if (!taskDeleteDialogState.isSubmitting) {
                  setTaskDeleteDialogState(null);
                }
              },
            },
            React.createElement(PlatformModalSurface, {
              className: "playground-tasks-confirm-dialog",
              onClick: (event) => event.stopPropagation(),
            },
              React.createElement("div", { className: "playground-tasks-confirm-title" },
                "Delete " + taskDeleteDialogState.ticketNumber + "?"
              ),
              React.createElement("div", { className: "playground-tasks-confirm-copy" },
                "\\\"" + taskDeleteDialogState.taskTitle + "\\\" has " + taskDeleteDialogState.subtaskCount + " subtask" + (taskDeleteDialogState.subtaskCount === 1 ? "" : "s") + ". Keep them and convert them into tasks, or delete them together with this task."
              ),
              taskDeleteDialogState.error
                ? React.createElement("div", { className: "playground-environments-error" }, taskDeleteDialogState.error)
                : null,
              React.createElement("div", { className: "playground-tasks-confirm-actions" },
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-environments-action-button is-secondary",
                  onClick: () => setTaskDeleteDialogState(null),
                  disabled: taskDeleteDialogState.isSubmitting,
                }, "Cancel"),
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-environments-action-button is-secondary",
                  onClick: () => void handleTaskDeleteDialogDecision(true),
                  disabled: taskDeleteDialogState.isSubmitting,
                }, taskDeleteDialogState.isSubmitting ? "Keeping subtasks..." : "Keep Subtasks"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-environments-action-button is-danger",
                  onClick: () => void handleTaskDeleteDialogDecision(false),
                  disabled: taskDeleteDialogState.isSubmitting,
                }, taskDeleteDialogState.isSubmitting ? "Deleting..." : "Delete All")
              )
            )
          );
        }

${CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView}


`;
