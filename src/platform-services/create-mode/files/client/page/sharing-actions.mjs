export const FILES_PAGE_SHARING_ACTIONS_SCRIPT = `
        function closeFileProjectPickerDialog() {
          setFileProjectPickerState(null);
          setFileProjectPickerValue("");
          setFileProjectPickerError("");
        }

        function closeFileComputerPickerDialog(options = {}) {
          if (!options.force && fileComputerTransferState.action === "send") {
            return;
          }
          setFileComputerPickerOpen(false);
          if (fileComputerPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileComputerPickerCloseTimerRef.current);
            fileComputerPickerCloseTimerRef.current = null;
          }
          setFileComputerPickerVisible(false);
          setFileComputerPickerClosing(true);
          fileComputerPickerCloseTimerRef.current = window.setTimeout(() => {
            setFileComputerPickerState(null);
            setFileComputerPickerValue("");
            setFileComputerPickerError("");
            setFileComputerPickerClosing(false);
            fileComputerPickerCloseTimerRef.current = null;
          }, 75);
        }

        function closeFileTeamPickerDialog(options = {}) {
          if (!options.force && fileTeamShareState.action === "share") {
            return;
          }
          if (fileTeamPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileTeamPickerCloseTimerRef.current);
            fileTeamPickerCloseTimerRef.current = null;
          }
          setFileTeamPickerVisible(false);
          setFileTeamPickerClosing(true);
          fileTeamPickerCloseTimerRef.current = window.setTimeout(() => {
            setFileTeamPickerState(null);
            setFileTeamPickerValues([]);
            setFileTeamPickerError("");
            setFileTeamPickerClosing(false);
            fileTeamPickerCloseTimerRef.current = null;
          }, 75);
        }

        function setSingleSelection(path, options = {}) {
          const normalizedPath = normalizeHistoryPath(path);
          const next = normalizedPath ? new Set([normalizedPath]) : new Set();
          const shouldOpenPreview = options.showPreview !== false;
          setSelectedPaths(next);
          setSelectionAnchorPath(normalizedPath);
          setPreviewTargetPath(normalizedPath);
          setIsPreviewOpen(shouldOpenPreview && Boolean(normalizedPath));
        }

        function pushPath(nextPath, nextSelectionPaths = []) {
          const normalizedPath = normalizeHistoryPath(nextPath);
          if (normalizedPath !== currentPath) {
            const nextHistory = pathHistory.slice(0, pathHistoryIndex + 1);
            nextHistory.push(normalizedPath);
            setPathHistory(nextHistory);
            setPathHistoryIndex(nextHistory.length - 1);
            setCurrentPath(normalizedPath);
          }
          const normalizedSelectionPaths = (Array.isArray(nextSelectionPaths) ? nextSelectionPaths : [])
            .map((value) => normalizeHistoryPath(value))
            .filter(Boolean);
          setSelectedPaths(new Set(normalizedSelectionPaths));
          setSelectionAnchorPath(normalizedSelectionPaths[normalizedSelectionPaths.length - 1] || "");
          setPreviewTargetPath(normalizedSelectionPaths[normalizedSelectionPaths.length - 1] || "");
          setRenamingPath("");
          setRenameValue("");
          setToolbarPopover("");
          setContextMenu(null);
          setDragOverTargetPath("");
          setDraggedPaths([]);
        }

        function navigateToPath(nextPath) {
          pushPath(nextPath, []);
        }

        function isFilesKeyboardNavigationEditableTarget(target) {
          if (!target || typeof Element === "undefined" || !(target instanceof Element)) {
            return false;
          }
          const tagName = String(target.tagName || "").toLowerCase();
          if (["input", "textarea", "select"].includes(tagName)) {
            return true;
          }
          return Boolean(target.isContentEditable || target.closest('[contenteditable="true"], .monaco-editor'));
        }

        function scrollFileEntryIntoView(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath || typeof document === "undefined") {
            return;
          }
          window.requestAnimationFrame(() => {
            const matchingEntry = Array.from(document.querySelectorAll("[data-playground-file-path]"))
              .find((element) => normalizeHistoryPath(element.getAttribute("data-playground-file-path") || "") === normalizedPath);
            matchingEntry?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
          });
        }

        function getOrderedSelectableFileEntries() {
          return selectionScopeEntries.filter((entry) => entry && !entry.isFolder);
        }

        function getLastSelectedFilePath(nextSelectedPaths = selectedPaths) {
          const normalizedPreviewPath = normalizeHistoryPath(previewTargetPath);
          if (normalizedPreviewPath && nextSelectedPaths.has(normalizedPreviewPath)) {
            const previewEntry = environmentTree.nodesByPath.get(normalizedPreviewPath);
            if (previewEntry && !previewEntry.isFolder) {
              return normalizedPreviewPath;
            }
          }
          const orderedFiles = getOrderedSelectableFileEntries();
          for (let index = orderedFiles.length - 1; index >= 0; index -= 1) {
            const normalizedPath = normalizeHistoryPath(orderedFiles[index]?.path || "");
            if (normalizedPath && nextSelectedPaths.has(normalizedPath)) {
              return normalizedPath;
            }
          }
          for (const value of nextSelectedPaths) {
            const normalizedPath = normalizeHistoryPath(value);
            const entry = normalizedPath ? environmentTree.nodesByPath.get(normalizedPath) : null;
            if (entry && !entry.isFolder) {
              return normalizedPath;
            }
          }
          return "";
        }

        function selectAdjacentVisibleFile(direction, options = {}) {
          if (contentMode !== "files") {
            return false;
          }
          const fileEntries = getOrderedSelectableFileEntries();
          const normalizedCurrentPath = getLastSelectedFilePath() || normalizeHistoryPath(singleSelectedEntry?.path || "");
          const currentIndex = fileEntries.findIndex((entry) => normalizeHistoryPath(entry.path) === normalizedCurrentPath);
          if (currentIndex < 0) {
            return false;
          }
          const nextIndex = Math.max(0, Math.min(fileEntries.length - 1, currentIndex + direction));
          if (nextIndex === currentIndex) {
            return false;
          }
          const nextEntry = fileEntries[nextIndex];
          if (!nextEntry?.path) {
            return false;
          }
          const nextPath = normalizeHistoryPath(nextEntry.path);
          if (options.extendSelection) {
            const filePaths = fileEntries.map((entry) => normalizeHistoryPath(entry.path)).filter(Boolean);
            const anchorPath = normalizeHistoryPath(selectionAnchorPath || normalizedCurrentPath || nextPath);
            const anchorIndex = filePaths.indexOf(anchorPath);
            const targetIndex = filePaths.indexOf(nextPath);
            if (anchorIndex < 0 || targetIndex < 0) {
              return false;
            }
            const nextSelection = filePaths.slice(Math.min(anchorIndex, targetIndex), Math.max(anchorIndex, targetIndex) + 1);
            setSelectedPaths(new Set(nextSelection));
            setSelectionAnchorPath(anchorPath);
            setPreviewTargetPath(nextPath);
            setIsPreviewOpen(nextSelection.length > 0);
          } else {
            setSingleSelection(nextPath);
          }
          setContextMenu(null);
          setToolbarPopover("");
          scrollFileEntryIntoView(nextEntry.path);
          return true;
        }

        function navigateToFilesSelection(request = null) {
          const normalizedRequest = request && typeof request === "object" ? request : null;
          const requestedEnvironmentId = String(normalizedRequest?.environmentId || selectedEnvironmentId || "").trim();
          const requestedProjectId = String(normalizedRequest?.projectId || "").trim();
          const requestedProjectLabel = String(normalizedRequest?.projectName || normalizedRequest?.projectLabel || "").trim();
          const requestedContentMode = normalizedRequest?.contentMode === "changes"
            ? "changes"
            : normalizedRequest?.contentMode === "connectors"
              ? "connectors"
              : "files";
          const requestedPath = normalizeHistoryPath(normalizedRequest?.path || "");
          const requestedIsFolder = Boolean(normalizedRequest?.isFolder);
          const targetFolderPath = requestedPath
            ? (requestedIsFolder ? requestedPath : getPlaygroundEntryParentPath(requestedPath))
            : "";
          const targetSelectionPaths = requestedPath && !requestedIsFolder ? [requestedPath] : [];

          setContentMode(requestedContentMode);
          setToolbarPopover("");
          setContextMenu(null);
          setActionError("");
          if (requestedContentMode === "connectors") {
            setSelectedPaths(new Set());
            setSelectionAnchorPath("");
            setPreviewTargetPath("");
            setIsPreviewOpen(false);
            setIsPreviewMaximized(false);
            setIsFileChatOpen(false);
            return;
          }
          if (requestedProjectId) {
            setProjectFilterScope(requestedProjectId);
            setProjectFilterScopeLabel(requestedProjectLabel);
            setFilesEnvironmentMenuMode("projects");
          }
          if (requestedContentMode === "changes") {
            if (requestedEnvironmentId && requestedEnvironmentId !== selectedEnvironmentId) {
              setSelectedEnvironmentId(requestedEnvironmentId);
            }
            setSelectedPaths(new Set());
            setSelectionAnchorPath("");
            setPreviewTargetPath("");
            setRenamingPath("");
            setRenameValue("");
            setIsPreviewOpen(false);
            return;
          }

          const applySelection = async () => {
            if (requestedEnvironmentId && requestedEnvironmentId !== selectedEnvironmentId) {
              setSelectedEnvironmentId(requestedEnvironmentId);
            }
            if (requestedEnvironmentId) {
              await loadEnvironmentFolder(requestedEnvironmentId, targetFolderPath);
            }
            pushPath(targetFolderPath, targetSelectionPaths);
            setIsPreviewOpen(targetSelectionPaths.length > 0);
          };

          void applySelection();
        }

        function handleGoBack() {
          if (!canGoBack) return;
          const nextIndex = pathHistoryIndex - 1;
          setPathHistoryIndex(nextIndex);
          setCurrentPath(pathHistory[nextIndex] || "");
          clearSelection();
        }

        function handleGoForward() {
          if (!canGoForward) return;
          const nextIndex = pathHistoryIndex + 1;
          setPathHistoryIndex(nextIndex);
          setCurrentPath(pathHistory[nextIndex] || "");
          clearSelection();
        }

        function handleBreadcrumbClick(path) {
          const nextPath = normalizeHistoryPath(path);
          if (nextPath === currentPath) return;
          pushPath(nextPath, []);
        }

        function toggleFolderExpansion(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return;
          const shouldExpand = !expandedFolders.has(normalizedPath);
          setExpandedFolders((current) => {
            const next = new Set(current);
            if (next.has(normalizedPath)) {
              next.delete(normalizedPath);
            } else {
              next.add(normalizedPath);
            }
            return next;
          });
          if (shouldExpand && selectedEnvironmentId) {
            void loadEnvironmentFolder(selectedEnvironmentId, normalizedPath);
          }
        }

        function handleEntrySelection(entry, event) {
          if (!entry) return;
          const targetPath = normalizeHistoryPath(entry.path);
          if (!targetPath) return;

          if (entry.isFolder && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
            navigateToPath(targetPath);
            setContextMenu(null);
            return;
          }

          if (event.shiftKey && !entry.isFolder) {
            const orderedPaths = getOrderedSelectableFileEntries().map((value) => normalizeHistoryPath(value.path));
            const anchorPath = normalizeHistoryPath(selectionAnchorPath || getLastSelectedFilePath() || targetPath);
            const resolvedAnchorIndex = orderedPaths.indexOf(anchorPath);
            const targetIndex = orderedPaths.indexOf(targetPath);
            if (resolvedAnchorIndex >= 0 && targetIndex >= 0) {
              const nextSelection = orderedPaths.slice(Math.min(resolvedAnchorIndex, targetIndex), Math.max(resolvedAnchorIndex, targetIndex) + 1);
              setSelectedPaths(new Set(nextSelection));
              setSelectionAnchorPath(orderedPaths[resolvedAnchorIndex] || targetPath);
              setPreviewTargetPath(targetPath);
              setIsPreviewOpen(nextSelection.length > 0);
              setContextMenu(null);
              return;
            }
          }

          if ((event.metaKey || event.ctrlKey) && !entry.isFolder) {
            setSelectedPaths((current) => {
              const next = new Set(current);
              if (next.has(targetPath)) {
                next.delete(targetPath);
                const nextPreviewPath = getLastSelectedFilePath(next);
                setPreviewTargetPath(nextPreviewPath);
                setSelectionAnchorPath((currentAnchorPath) => next.has(currentAnchorPath) ? currentAnchorPath : nextPreviewPath);
              } else {
                next.add(targetPath);
                setPreviewTargetPath(targetPath);
                setSelectionAnchorPath(targetPath);
              }
              setIsPreviewOpen(next.size > 0);
              return next;
            });
            setContextMenu(null);
            return;
          }

          setSingleSelection(targetPath);
          setContextMenu(null);
        }

        function handleEntryDoubleClick(entry) {
          if (entry?.isFolder) {
            navigateToPath(entry.path);
            return;
          }
          if (entry?.path) {
            setSelectedPaths(new Set([entry.path]));
            setSelectionAnchorPath(entry.path);
            setPreviewTargetPath(entry.path);
            setIsPreviewOpen(true);
            setIsPreviewMaximized(true);
            setIsFileChatOpen(false);
            setFileChatPanelWidth(null);
            setPreviewPanelWidth(null);
            setBrowserPaneMode("expanded");
            setToolbarPopover("");
          }
        }

        function buildFilesProjectSavePayload(projectRecord) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const normalizedProjectAttachments = normalizePlaygroundTaskAttachmentList(normalizedProject.attachments);
          const projectIndex = Math.max(0, availableProjectFilters.findIndex((project) => project.id === normalizedProject.id));
          return {
            name: normalizedProject.name || "Project",
            description: normalizedProject.description,
            color: normalizedProject.color || getPlaygroundProjectAccent(normalizedProject, projectIndex),
            defaultEnvironmentId: normalizedProject.defaultEnvironmentId || undefined,
            attachments: normalizedProjectAttachments,
            metadata: {
              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
              name: normalizedProject.name || "Project",
              icon: getPlaygroundProjectIconId(normalizedProject.icon),
              wallpaperId: getPlaygroundProjectWallpaperId(normalizedProject.wallpaperId, ""),
              useCardBackgroundAsWallpaper: normalizedProject.useCardBackgroundAsWallpaper !== false,
              defaultEnvironmentId: normalizedProject.defaultEnvironmentId || null,
              attachments: normalizedProjectAttachments,
              ...buildPlaygroundProjectMissionControlMetadataFragment(normalizedProject),
            },
          };
        }

        async function persistFilesProjectAttachments(projectId, nextAttachments) {
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedProjectId) {
            throw new Error("Choose a project first.");
          }
          const baseProject = normalizePlaygroundProjectRecord(
            availableProjectFilters.find((project) => project.id === normalizedProjectId)
            || {
              id: normalizedProjectId,
              name: "Project",
            }
          );
          const nextProjectRecord = normalizePlaygroundProjectRecord({
            ...baseProject,
            attachments: normalizePlaygroundTaskAttachmentList(nextAttachments),
          });
          const savePayload = buildFilesProjectSavePayload(nextProjectRecord);
          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
            method: "PATCH",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(savePayload),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to update project attachments.");
          }
          const updatedProject = getPlaygroundProjectResponseRecord(data, {
            ...nextProjectRecord,
            metadata: savePayload.metadata,
          });
          if (updatedProject?.id) {
            setAvailableProjectFilters((current) => {
              const hasExisting = current.some((project) => project.id === updatedProject.id);
              return hasExisting
                ? current.map((project) => project.id === updatedProject.id ? updatedProject : project)
                : current.concat(updatedProject);
            });
          }
          await loadProjectLinkedPaths();
          return updatedProject;
        }

        function mergeFilesProjectAttachmentLists(...lists) {
          const mergedByKey = new Map();
          lists.forEach((list) => {
            normalizePlaygroundTaskAttachmentList(list).forEach((attachment) => {
              const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
              const attachmentKey = [
                normalizedAttachment.id,
                normalizeHistoryPath(normalizedAttachment.workspacePath),
                normalizeHistoryPath(normalizedAttachment.sourcePath),
                normalizedAttachment.filename,
              ].find((value) => typeof value === "string" && value.trim()) || generateId("attachment");
              if (!mergedByKey.has(attachmentKey)) {
                mergedByKey.set(attachmentKey, normalizedAttachment);
              }
            });
          });
          return Array.from(mergedByKey.values());
        }

        function buildUniqueEnvironmentFileName(existingEntries, filename) {
          const normalizedFilename = String(filename || "").trim() || "file";
          const lastDotIndex = normalizedFilename.lastIndexOf(".");
          const hasExtension = lastDotIndex > 0;
          const baseName = hasExtension ? normalizedFilename.slice(0, lastDotIndex) : normalizedFilename;
          const extension = hasExtension ? normalizedFilename.slice(lastDotIndex) : "";
          const existingNames = new Set(
            (Array.isArray(existingEntries) ? existingEntries : []).map((entry) => String(entry?.name || "").trim()).filter(Boolean)
          );
          if (!existingNames.has(normalizedFilename)) {
            return normalizedFilename;
          }
          let suffix = 2;
          let nextName = normalizedFilename;
          while (existingNames.has(nextName)) {
            nextName = baseName + "-" + suffix + extension;
            suffix += 1;
          }
          return nextName;
        }

        async function uploadFilesPageAttachment(file, options = {}) {
          const normalizedEnvironmentId = String(options?.environmentId || "").trim();
          const normalizedSourcePath = options?.sourcePath ? normalizeHistoryPath(options.sourcePath) : "";
          const headers = new Headers(requestHeaders || {});
          headers.set("Content-Type", "application/json");
          const response = await fetch(backendUrl + "/attachments/upload", {
            method: "POST",
            headers,
            body: JSON.stringify({
              filename: file?.name || "attachment",
              mimeType: file?.type || "application/octet-stream",
              data: await readFileAsBase64(file),
              ...(normalizedEnvironmentId ? { environmentId: normalizedEnvironmentId } : {}),
            }),
          });
          const uploadResult = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(uploadResult?.message || uploadResult?.error || "Failed to upload attachment.");
          }
          const attachment = normalizePlaygroundTaskAttachmentRecord({
            ...(uploadResult?.attachment && typeof uploadResult.attachment === "object" ? uploadResult.attachment : {}),
            url: (
              typeof uploadResult?.attachment?.url === "string" && uploadResult.attachment.url.trim()
                ? uploadResult.attachment.url.trim()
                : (uploadResult?.attachment?.id ? backendUrl + "/attachments/" + encodeURIComponent(uploadResult.attachment.id) : "")
            ),
            previewUrl: typeof uploadResult?.attachment?.previewUrl === "string" && uploadResult.attachment.previewUrl.trim()
              ? uploadResult.attachment.previewUrl.trim()
              : undefined,
            environmentId: normalizedEnvironmentId || uploadResult?.attachment?.environmentId || uploadResult?.attachment?.sourceEnvironmentId,
            sourcePath: normalizedSourcePath || uploadResult?.attachment?.sourcePath || uploadResult?.attachment?.workspacePath,
          });
          if (!attachment) {
            throw new Error("Attachment upload succeeded but the attachment data is missing.");
          }
          return attachment;
        }

        async function buildProjectAttachmentForEntry(entry, targetProject) {
          const normalizedSourceEnvironmentId = String(selectedEnvironmentId || "").trim();
          const normalizedSourcePath = normalizeHistoryPath(entry?.path || "");
          const normalizedTargetEnvironmentId = String(targetProject?.defaultEnvironmentId || "").trim();
          if (!normalizedSourceEnvironmentId || !normalizedSourcePath || !normalizedTargetEnvironmentId) {
            throw new Error("This file cannot be added because the project has no default environment.");
          }

          const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedSourceEnvironmentId, normalizedSourcePath);
          const response = await fetch(downloadUrl, {
            method: "GET",
            headers: requestHeaders,
          });
          if (!response.ok) {
            throw new Error("Failed to load " + (entry?.name || "file") + " (" + response.status + ")");
          }

          const blob = await response.blob();
          let attachmentFile = new globalThis.File([blob], entry?.name || "file", {
            type: entry?.mimeType || blob.type || "application/octet-stream",
          });
          let attachmentSourcePath = normalizedSourcePath;

          if (normalizedTargetEnvironmentId !== normalizedSourceEnvironmentId) {
            const targetRootEntries = await loadEnvironmentFolder(normalizedTargetEnvironmentId, "", { force: true });
            const nextFilename = buildUniqueEnvironmentFileName(targetRootEntries, attachmentFile.name);
            attachmentFile = new globalThis.File([blob], nextFilename, {
              type: entry?.mimeType || blob.type || "application/octet-stream",
            });

            const formData = new FormData();
            formData.append("file", attachmentFile);
            formData.append("path", "");
            const uploadResponse = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(normalizedTargetEnvironmentId) + "/files/upload",
              {
                method: "POST",
                headers: requestHeaders,
                body: formData,
              }
            );
            const uploadData = await uploadResponse.json().catch(() => ({}));
            if (!uploadResponse.ok) {
              throw new Error(uploadData?.message || uploadData?.error || "Failed to clone file into the project environment.");
            }
            attachmentSourcePath = normalizeHistoryPath(nextFilename);
            await refreshEnvironmentFolders(normalizedTargetEnvironmentId, [""]);
          }

          return uploadFilesPageAttachment(attachmentFile, {
            environmentId: normalizedTargetEnvironmentId,
            sourcePath: attachmentSourcePath,
          });
        }

        function openFileProjectPickerDialog(entryOrEntries) {
          const entries = (Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries])
            .filter((entry) => entry && !entry.isFolder);
          if (!entries.length) {
            return;
          }
          const normalizedPath = normalizeHistoryPath(entries[0].path);
          const normalizedPaths = entries.map((entry) => normalizeHistoryPath(entry.path)).filter(Boolean);
          const linkedProjectIds = Array.from(
            (projectAttachmentLinksByEnvironmentId[selectedEnvironmentId]?.byPath?.[normalizedPath] instanceof Set
              ? projectAttachmentLinksByEnvironmentId[selectedEnvironmentId].byPath[normalizedPath]
              : [])
          );
          const defaultProjectId = linkedProjectIds[0]
            || (projectFilterScope && projectFilterScope !== "__all__" ? projectFilterScope : "")
            || String(availableProjectFilters[0]?.id || "").trim();
          setFileProjectPickerState({
            path: normalizedPath,
            paths: normalizedPaths,
            title: entries.length === 1
              ? (entries[0].name || normalizedPath || "file")
              : (entries.length + " files"),
          });
          setFileProjectPickerValue(defaultProjectId);
          setFileProjectPickerError("");
          closeContextMenu();
        }

        function openFileComputerPickerDialog(entryOrEntries) {
          const entries = (Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries])
            .filter((entry) => entry && !entry.isFolder);
          if (!entries.length) {
            return;
          }
          const normalizedPath = normalizeHistoryPath(entries[0].path);
          const normalizedPaths = entries.map((entry) => normalizeHistoryPath(entry.path)).filter(Boolean);
          const defaultDestinationId = String(availableDestinationComputers[0]?.id || "").trim();
          if (fileComputerPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileComputerPickerCloseTimerRef.current);
            fileComputerPickerCloseTimerRef.current = null;
          }
          setFileComputerPickerClosing(false);
          setFileComputerPickerOpen(false);
          setFileComputerPickerState({
            path: normalizedPath,
            paths: normalizedPaths,
            title: entries.length === 1
              ? (entries[0].name || normalizedPath || "file")
              : (entries.length + " files"),
          });
          setFileComputerPickerValue(defaultDestinationId);
          setFileComputerPickerError("");
          closeContextMenu();
        }

        async function loadAvailableFileTeamsForPicker() {
          setIsLoadingFileTeams(true);
          try {
            const response = await fetch(backendUrl + "/teams", {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load teams.");
            }
            const rows = Array.isArray(data?.data)
              ? data.data
              : (Array.isArray(data?.teams) ? data.teams : []);
            const adminTeams = rows
              .map((team) => {
                let metadata = team?.metadata && typeof team.metadata === "object"
                  ? team.metadata
                  : {};
                if (typeof team?.metadata === "string") {
                  try {
                    metadata = JSON.parse(team.metadata) || {};
                  } catch {
                    metadata = {};
                  }
                }
                return {
                  id: String(team?.id || "").trim(),
                  name: String(team?.name || "Team").trim() || "Team",
                  role: String(team?.role || "").trim(),
                  profileImageUrl: String(
                    team?.profileImageUrl
                    || team?.profile_image_url
                    || metadata?.profileImageUrl
                    || metadata?.profile_image_url
                    || ""
                  ).trim(),
                };
              })
              .filter((team) => team.id && team.role === "admin");
            setAvailableFileTeams(adminTeams);
            setFileTeamPickerError((current) => current === "Failed to load teams." ? "" : current);
            return adminTeams;
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to load teams.";
            setAvailableFileTeams([]);
            setFileTeamPickerError(message);
            return [];
          } finally {
            setIsLoadingFileTeams(false);
          }
        }

        function openFileTeamPickerDialog(entryOrEntries) {
          const entries = (Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries])
            .filter((entry) => entry && !entry.isFolder);
          if (!entries.length) {
            return;
          }
          const normalizedPath = normalizeHistoryPath(entries[0].path);
          const normalizedPaths = entries.map((entry) => normalizeHistoryPath(entry.path)).filter(Boolean);
          if (fileTeamPickerCloseTimerRef.current !== null) {
            window.clearTimeout(fileTeamPickerCloseTimerRef.current);
            fileTeamPickerCloseTimerRef.current = null;
          }
          setFileTeamPickerClosing(false);
          setFileTeamPickerState({
            path: normalizedPath,
            paths: normalizedPaths,
            title: entries.length === 1
              ? (entries[0].name || normalizedPath || "file")
              : (entries.length + " files"),
          });
          setFileTeamPickerValues([]);
          setFileTeamPickerError("");
          closeContextMenu();
          void loadAvailableFileTeamsForPicker();
        }

        async function handleRemoveFileFromProject(entry, projectIdOverride = "") {
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          const normalizedProjectId = String(projectIdOverride || contextTargetAttachmentProjectId || "").trim();
          if (!normalizedPath || !normalizedProjectId || !selectedEnvironmentId) {
            return;
          }
          const targetProject = availableProjectFilters.find((project) => project.id === normalizedProjectId) || null;
          if (!targetProject) {
            return;
          }

          closeContextMenu();
          setFileProjectMutationState({
            path: normalizedPath,
            action: "project-remove",
            error: "",
          });

          try {
            const nextAttachments = normalizePlaygroundTaskAttachmentList(targetProject.attachments).filter((attachment) => {
              return !(
                String(attachment?.environmentId || "").trim() === String(selectedEnvironmentId || "").trim()
                && normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath) === normalizedPath
              );
            });
            await persistFilesProjectAttachments(normalizedProjectId, nextAttachments);
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to remove the file from the project.");
            setFileProjectMutationState({
              path: normalizedPath,
              action: "",
              error: error instanceof Error ? error.message : "Failed to remove the file from the project.",
            });
            return;
          }

          setFileProjectMutationState({
            path: "",
            action: "",
            error: "",
          });
        }

        async function handleFileProjectPickerSubmit(event) {
          event.preventDefault();
          if (!fileProjectPickerState?.path || !selectedEnvironmentId) {
            return;
          }
          const normalizedProjectId = String(fileProjectPickerValue || "").trim();
          if (!normalizedProjectId) {
            setFileProjectPickerError("Choose a project first.");
            return;
          }
          const targetProject = availableProjectFilters.find((project) => project.id === normalizedProjectId) || null;
          const pickerPaths = Array.isArray(fileProjectPickerState.paths) && fileProjectPickerState.paths.length
            ? fileProjectPickerState.paths
            : [fileProjectPickerState.path];
          const pickerEntries = pickerPaths
            .map((path) => environmentTree.nodesByPath.get(normalizeHistoryPath(path)) || null)
            .filter((entry) => entry && !entry.isFolder);
          if (!pickerEntries.length || !targetProject) {
            setFileProjectPickerError("The selected files are no longer available.");
            return;
          }

          setFileProjectPickerError("");
          setFileProjectMutationState({
            path: fileProjectPickerState.path,
            action: "project-add",
            error: "",
          });

          try {
            const uploadedAttachments = [];
            for (const entry of pickerEntries) {
              uploadedAttachments.push(await buildProjectAttachmentForEntry(entry, targetProject));
            }
            const nextAttachments = mergeFilesProjectAttachmentLists(targetProject.attachments, uploadedAttachments);
            await persistFilesProjectAttachments(normalizedProjectId, nextAttachments);
            closeFileProjectPickerDialog();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add files to the project.";
            setFileProjectPickerError(errorMessage);
            setFileProjectMutationState({
              path: fileProjectPickerState.path,
              action: "",
              error: errorMessage,
            });
            return;
          }

          setFileProjectMutationState({
            path: "",
            action: "",
            error: "",
          });
        }

        async function handleFileComputerPickerSubmit(event) {
          event.preventDefault();
          if (!fileComputerPickerState?.path || !selectedEnvironmentId) {
            return;
          }
          const normalizedDestinationId = String(fileComputerPickerValue || "").trim();
          if (!normalizedDestinationId) {
            setFileComputerPickerError("Choose a destination computer first.");
            return;
          }
          const pickerPaths = Array.isArray(fileComputerPickerState.paths) && fileComputerPickerState.paths.length
            ? fileComputerPickerState.paths
            : [fileComputerPickerState.path];
          const pickerEntries = pickerPaths
            .map((path) => environmentTree.nodesByPath.get(normalizeHistoryPath(path)) || null)
            .filter((entry) => entry && !entry.isFolder);
          if (!pickerEntries.length) {
            setFileComputerPickerError("The selected files are no longer available.");
            return;
          }

          setFileComputerPickerError("");
          setFileComputerTransferState({
            path: fileComputerPickerState.path,
            action: "send",
            error: "",
          });

          try {
            const response = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/send",
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  destinationEnvironmentId: normalizedDestinationId,
                  paths: pickerEntries.map((entry) => normalizeHistoryPath(entry.path)).filter(Boolean),
                }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to send files to another computer.");
            }
            const destinationFolders = Array.from(new Set(
              pickerEntries.map((entry) => getPlaygroundEntryParentPath(entry.path))
            ));
            await refreshEnvironmentFolders(normalizedDestinationId, destinationFolders.length ? destinationFolders : [""]);
            closeFileComputerPickerDialog({ force: true });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to send files to another computer.";
            setFileComputerPickerError(errorMessage);
            setFileComputerTransferState({
              path: fileComputerPickerState.path,
              action: "",
              error: errorMessage,
            });
            return;
          }

          setFileComputerTransferState({
            path: "",
            action: "",
            error: "",
          });
        }

        async function handleFileTeamPickerSubmit(selectedTeamIds = fileTeamPickerValues) {
          if (!fileTeamPickerState?.path || !selectedEnvironmentId) {
            return;
          }
          const normalizedTeamIds = Array.from(new Set(
            (Array.isArray(selectedTeamIds) ? selectedTeamIds : [])
              .map((teamId) => String(teamId || "").trim())
              .filter(Boolean)
          ));
          if (!normalizedTeamIds.length) {
            setFileTeamPickerError("Choose at least one team first.");
            return;
          }
          const pickerPaths = Array.isArray(fileTeamPickerState.paths) && fileTeamPickerState.paths.length
            ? fileTeamPickerState.paths
            : [fileTeamPickerState.path];
          const pickerEntries = pickerPaths
            .map((path) => environmentTree.nodesByPath.get(normalizeHistoryPath(path)) || null)
            .filter((entry) => entry && !entry.isFolder);
          if (!pickerEntries.length) {
            setFileTeamPickerError("The selected files are no longer available.");
            return;
          }

          setFileTeamPickerError("");
          setFileTeamShareState({
            path: fileTeamPickerState.path,
            action: "share",
            error: "",
          });

          try {
            const normalizedPaths = pickerEntries
              .map((entry) => normalizeHistoryPath(entry.path))
              .filter(Boolean);
            const results = await Promise.allSettled(normalizedTeamIds.map(async (teamId) => {
              const response = await fetch(
                backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/share-with-team",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ teamId, paths: normalizedPaths }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to make files available to the team.");
              }
              return teamId;
            }));
            const failedTeamIds = results.flatMap((result, index) =>
              result.status === "rejected" ? [normalizedTeamIds[index]] : []
            );
            if (failedTeamIds.length) {
              const failedTeamNames = failedTeamIds.map((teamId) =>
                availableFileTeams.find((team) => String(team?.id || "").trim() === teamId)?.name || teamId
              );
              setFileTeamPickerValues(failedTeamIds);
              throw new Error(
                (failedTeamIds.length === normalizedTeamIds.length
                  ? "Failed to share with "
                  : "Some teams were shared successfully. Failed to share with ")
                + failedTeamNames.join(", ")
                + "."
              );
            }
            closeFileTeamPickerDialog({ force: true });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to make files available to the team.";
            setFileTeamPickerError(errorMessage);
            setFileTeamShareState({
              path: fileTeamPickerState.path,
              action: "",
              error: errorMessage,
            });
            return;
          }

          setFileTeamShareState({
            path: "",
            action: "",
            error: "",
          });
        }
`;
