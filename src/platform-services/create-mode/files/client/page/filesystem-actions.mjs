export const FILES_PAGE_FILESYSTEM_ACTIONS_SCRIPT = `
        function openContextMenuAt(targetEntry, nextX, nextY, options = {}) {
          const shouldSelectTarget = options.selectTarget !== false;
          if (shouldSelectTarget && targetEntry && !selectedPaths.has(targetEntry.path)) {
            setSelectedPaths(new Set([targetEntry.path]));
            setSelectionAnchorPath(targetEntry.path);
            setPreviewTargetPath(targetEntry.path);
          }

          const isMultiFileSelectionMenu = Boolean(options.multiFileSelection);
          const menuWidth = 264;
          const menuHeight = isMultiFileSelectionMenu ? 272 : (targetEntry
            ? (!targetEntry.isFolder ? 316 : 240)
            : 138);
          const requestedX = options.alignRight ? Number(nextX || 0) - menuWidth : Number(nextX || 0);
          const x = Math.min(requestedX, window.innerWidth - menuWidth - 12);
          const y = Math.min(nextY, window.innerHeight - menuHeight - 12);

          if (contextMenuCloseTimerRef.current !== null) {
            window.clearTimeout(contextMenuCloseTimerRef.current);
            contextMenuCloseTimerRef.current = null;
          }
          setContextMenuPhase("enter");

          setContextMenu({
            x: Math.max(12, x),
            y: Math.max(12, y),
            anchorPoint: options.anchorPoint
              ? {
                  x: Number(options.anchorPoint.x || 0),
                  y: Number(options.anchorPoint.y || 0),
                }
              : null,
            targetPath: targetEntry ? targetEntry.path : "",
            multiFileSelection: isMultiFileSelectionMenu,
            popupVariant: options.popupVariant === "minimal" ? "minimal" : "default",
          });
        }

        function handleEntryContextMenuButtonClick(entry, event, options = {}) {
          event.preventDefault();
          event.stopPropagation();
          const rect = event.currentTarget.getBoundingClientRect();
          if (selectedFileEntries.length > 1 && entry && selectedPaths.has(normalizeHistoryPath(entry.path))) {
            openContextMenuAt(null, rect.right, rect.bottom + 8, {
              selectTarget: false,
              multiFileSelection: true,
              alignRight: true,
              popupVariant: options.popupVariant,
              anchorPoint: { x: rect.right, y: rect.bottom },
            });
            return;
          }
          openContextMenuAt(entry, rect.right, rect.bottom + 8, {
            selectTarget: false,
            alignRight: true,
            popupVariant: options.popupVariant,
            anchorPoint: { x: rect.right, y: rect.bottom },
          });
        }

        function handleSearchResultSelect(entry) {
          setToolbarPopover("");
          setSearchPopupQuery("");
          if (!entry) return;
          if (entry.isFolder) {
            pushPath(entry.path, [entry.path]);
            setIsPreviewOpen(true);
            return;
          }
          const parentPath = getPlaygroundEntryParentPath(entry.path);
          pushPath(parentPath, [entry.path]);
          setIsPreviewOpen(true);
        }

        async function handleCreateFolder(basePath = currentPath) {
          if (!selectedEnvironmentId || isCreatingFolder) return;
          setToolbarPopover("");
          const rawName = window.prompt("Folder name");
          const folderName = String(rawName || "").trim().replace(/[\\/]+/g, "-");
          if (!folderName) return;

          const normalizedBasePath = normalizeHistoryPath(basePath);
          const targetPath = normalizeHistoryPath([normalizedBasePath, folderName].filter(Boolean).join("/"));
          setIsCreatingFolder(true);
          setActionError("");

          try {
            const response = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/mkdir",
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ path: targetPath }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create folder.");
            }
            if (normalizedBasePath) {
              setExpandedFolders((current) => new Set(current).add(normalizedBasePath));
            }
            await refreshEnvironmentFolders(selectedEnvironmentId, [normalizedBasePath]);
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to create folder.");
          } finally {
            setIsCreatingFolder(false);
          }
        }

        async function handleCreateFile(basePath = currentPath, environmentIdOverride = selectedEnvironmentId) {
          const targetEnvironmentId = String(environmentIdOverride || selectedEnvironmentId || "").trim();
          if (!targetEnvironmentId || isCreatingFile) return;
          setToolbarPopover("");
          const rawName = window.prompt("File name", "untitled.txt");
          const fileName = String(rawName || "").trim().replace(/[\\/]+/g, "-");
          if (!fileName) return;

          const normalizedBasePath = normalizeHistoryPath(basePath);
          const targetPath = normalizeHistoryPath([normalizedBasePath, fileName].filter(Boolean).join("/"));
          setIsCreatingFile(true);
          setActionError("");

          try {
            const formData = new FormData();
            const emptyFileBlob = new Blob([""], { type: "text/plain" });
            formData.append("file", emptyFileBlob, fileName);
            formData.append("path", normalizedBasePath);

            const response = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(targetEnvironmentId) + "/files/upload",
              {
                method: "POST",
                headers: requestHeaders,
                body: formData,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create file.");
            }
            if (normalizedBasePath) {
              setExpandedFolders((current) => new Set(current).add(normalizedBasePath));
            }
            await refreshEnvironmentFolders(targetEnvironmentId, [normalizedBasePath]);
            createdFileEditorPathRef.current = targetPath;
            setAutoFocusPreviewPath(targetPath);
            pushPath(normalizedBasePath, [targetPath]);
            setDocumentPreviewMode("code");
            setIsPreviewOpen(true);
            setIsPreviewMaximized(true);
            setIsFileChatOpen(false);
            setFileChatPanelWidth(null);
            setPreviewPanelWidth(null);
            setBrowserPaneMode("expanded");
            setContentMode("files");
            setChangesViewMode("timeline");
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to create file.");
          } finally {
            setIsCreatingFile(false);
          }
        }

        function openUploadPicker(targetPath = currentPath) {
          setToolbarPopover("");
          setUploadTargetPath(normalizeHistoryPath(targetPath));
          uploadInputRef.current?.click();
        }

        function isExternalFilesDrag(event) {
          const types = event.dataTransfer?.types;
          if (!types) return false;
          return Array.from(types).includes("Files");
        }

        async function uploadFilesToPath(files, targetPath = currentPath) {
          const filesToUpload = Array.from(files || []).filter((file) =>
            file && typeof file.name === "string" && typeof file.size === "number"
          );
          if (!selectedEnvironmentId || filesToUpload.length === 0) return;

          const destinationPath = normalizeHistoryPath(targetPath || currentPath);
          const uploadedPaths = [];
          const uploadedFileRecords = [];
          setIsUploadingFiles(true);
          setActionError("");

          try {
            for (const file of filesToUpload) {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("path", destinationPath);

              const response = await fetch(
                backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/upload",
                {
                  method: "POST",
                  headers: requestHeaders,
                  body: formData,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || ("Failed to upload " + file.name + "."));
              }
              const uploadedPath = normalizeHistoryPath(
                data?.path || [destinationPath, file.name].filter(Boolean).join("/")
              );
              if (uploadedPath) {
                uploadedPaths.push(uploadedPath);
                uploadedFileRecords.push({
                  id: uploadedPath,
                  path: uploadedPath,
                  name: file.name,
                  filename: file.name,
                  title: file.name,
                  size: Number(file.size || 0) || 0,
                  byteSize: Number(file.size || 0) || 0,
                  mimeType: file.type || data?.mimeType || "",
                  environmentId: selectedEnvironmentId,
                  workspacePath: uploadedPath,
                  sourcePath: uploadedPath,
                  source: "upload",
                });
              }
            }

            await refreshEnvironmentFolders(selectedEnvironmentId, [destinationPath]);
            const normalizedProjectScopeId = String(projectFilterScope || "").trim();
            const targetProject = normalizedProjectScopeId && normalizedProjectScopeId !== "__all__"
              ? availableProjectFilters.find((project) => project.id === normalizedProjectScopeId) || null
              : null;
            if (targetProject && uploadedFileRecords.length > 0) {
              const uploadedAttachments = [];
              for (const entry of uploadedFileRecords) {
                uploadedAttachments.push(await buildProjectAttachmentForEntry(entry, targetProject));
              }
              const nextAttachments = mergeFilesProjectAttachmentLists(targetProject.attachments, uploadedAttachments);
              await persistFilesProjectAttachments(targetProject.id, nextAttachments);
            }
            const uniqueUploadedPaths = Array.from(new Set(uploadedPaths));
            if (uniqueUploadedPaths.length > 0) {
              const activeUploadedPath = uniqueUploadedPaths[uniqueUploadedPaths.length - 1];
              setSelectedPaths(new Set(uniqueUploadedPaths));
              setSelectionAnchorPath(activeUploadedPath);
              setPreviewTargetPath(activeUploadedPath);
              setRenamingPath("");
              setRenameValue("");
              setToolbarPopover("");
              setContextMenu(null);
              setIsPreviewOpen(true);
            }
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to upload files.");
          } finally {
            setIsUploadingFiles(false);
            setUploadTargetPath("");
          }
        }

        async function handleUploadSelection(event) {
          const files = Array.from(event.target.files || []);
          event.target.value = "";
          await uploadFilesToPath(files, uploadTargetPath || currentPath);
        }

        function getMoveTargetPathForContext() {
          if (!contextTargetEntry) return currentPath;
          return contextTargetEntry.isFolder ? contextTargetEntry.path : getPlaygroundEntryParentPath(contextTargetEntry.path);
        }

        async function handleRenameSubmit() {
          const entry = renamingPath ? environmentTree.nodesByPath.get(renamingPath) || null : null;
          if (!entry || !selectedEnvironmentId) {
            setRenamingPath("");
            setRenameValue("");
            return;
          }

          const nextName = buildPlaygroundProtectedFilename(entry.name, renameValue, entry.isFolder);
          if (!nextName) {
            setRenamingPath("");
            setRenameValue("");
            return;
          }
          if (nextName === entry.name) {
            setRenamingPath("");
            setRenameValue("");
            return;
          }

          const parentPath = getPlaygroundEntryParentPath(entry.path);
          const destPath = normalizeHistoryPath([parentPath, nextName].filter(Boolean).join("/"));
          setActionError("");

          try {
            const response = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/move",
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sourcePath: entry.path,
                  destPath,
                }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to rename item.");
            }
            setRenamingPath("");
            setRenameValue("");
            await refreshEnvironmentFolders(selectedEnvironmentId, [parentPath]);
            setSelectedPaths(new Set([destPath]));
            setSelectionAnchorPath(destPath);
            setPreviewTargetPath(destPath);
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to rename item.");
          }
        }

        function startRename(entry, options = {}) {
          if (!entry) return;
          const renameParts = splitPlaygroundProtectedFilename(entry.name || "", entry.isFolder);
          setRenamingPath(entry.path);
          setRenameValue(renameParts.basename || "");
          setSingleSelection(entry.path, {
            showPreview: options.showPreview !== false,
          });
          closeContextMenu();
        }

        function handleRenameCancel() {
          setRenamingPath("");
          setRenameValue("");
        }

        async function handleDeleteEntries(entriesToDelete) {
          if (!selectedEnvironmentId) return;
          const uniquePaths = getPlaygroundTopLevelSelectionPaths(
            (Array.isArray(entriesToDelete) ? entriesToDelete : []).map((entry) => entry?.path)
          );
          if (uniquePaths.length === 0) return;

          const confirmLabel = uniquePaths.length === 1
            ? 'Are you sure you want to delete "' + (environmentTree.nodesByPath.get(uniquePaths[0])?.name || uniquePaths[0]) + '"?'
            : "Are you sure you want to delete " + uniquePaths.length + " items?";
          if (!window.confirm(confirmLabel)) {
            return;
          }

          setActionError("");

          try {
            for (const path of uniquePaths) {
              const encodedPath = path
                .split("/")
                .filter(Boolean)
                .map((segment) => encodeURIComponent(segment))
                .join("/");
              const response = await fetch(
                backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/" + encodedPath,
                {
                  method: "DELETE",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || ("Failed to delete " + path + "."));
              }
            }
            clearSelection();
            closeContextMenu();
            await refreshEnvironmentFolders(
              selectedEnvironmentId,
              uniquePaths.map((path) => getPlaygroundEntryParentPath(path))
            );
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to delete items.");
          }
        }

        async function handleMoveEntries(targetFolderPath) {
          if (!selectedEnvironmentId) return;
          const normalizedTargetPath = normalizeHistoryPath(targetFolderPath);
          const sourcePaths = getPlaygroundTopLevelSelectionPaths(draggedPaths);
          if (sourcePaths.length === 0) return;

          const moveOperations = sourcePaths
            .map((sourcePath) => {
              const entry = environmentTree.nodesByPath.get(sourcePath);
              if (!entry) return null;
              if (normalizedTargetPath === sourcePath || normalizedTargetPath.startsWith(sourcePath + "/")) {
                return null;
              }
              const destPath = normalizeHistoryPath([normalizedTargetPath, entry.name].filter(Boolean).join("/"));
              if (!destPath || destPath === sourcePath) {
                return null;
              }
              return { sourcePath, destPath };
            })
            .filter(Boolean);

          if (moveOperations.length === 0) {
            setDraggedPaths([]);
            setDragOverTargetPath("");
            return;
          }

          setActionError("");

          try {
            for (const moveOperation of moveOperations) {
              const response = await fetch(
                backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/move",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(moveOperation),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || ("Failed to move " + moveOperation.sourcePath + "."));
              }
            }
            clearSelection();
            await refreshEnvironmentFolders(
              selectedEnvironmentId,
              sourcePaths
                .map((path) => getPlaygroundEntryParentPath(path))
                .concat(normalizedTargetPath)
            );
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to move items.");
          } finally {
            setDraggedPaths([]);
            setDragOverTargetPath("");
          }
        }

        function handleContextMenu(event, targetEntry = null) {
          event.preventDefault();
          event.stopPropagation();
          if (selectedFileEntries.length > 1) {
            openContextMenuAt(null, event.clientX, event.clientY, {
              selectTarget: false,
              multiFileSelection: true,
            });
            return;
          }
          openContextMenuAt(targetEntry, event.clientX, event.clientY);
        }

        function handleDragStart(event, entry) {
          if (!entry || renamingPath === entry.path) {
            event.preventDefault();
            return;
          }
          const normalizedPath = normalizeHistoryPath(entry.path);
          const nextDraggedPaths = selectedPaths.has(normalizedPath) ? Array.from(selectedPaths) : [normalizedPath];
          if (!selectedPaths.has(normalizedPath)) {
            setSelectedPaths(new Set([normalizedPath]));
            setSelectionAnchorPath(normalizedPath);
            setPreviewTargetPath(normalizedPath);
          }
          setDraggedPaths(nextDraggedPaths);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", normalizedPath);
        }

        function handleDragEnd() {
          setDraggedPaths([]);
          setDragOverTargetPath("");
        }

        function canDropIntoPath(targetPath) {
          const normalizedTargetPath = normalizeHistoryPath(targetPath);
          const sourcePaths = getPlaygroundTopLevelSelectionPaths(draggedPaths);
          if (sourcePaths.length === 0) return false;
          return sourcePaths.every((sourcePath) => normalizedTargetPath !== sourcePath && !normalizedTargetPath.startsWith(sourcePath + "/"));
        }

        function handleFolderDragOver(event, entry) {
          if (isExternalFilesDrag(event)) {
            event.preventDefault();
            event.stopPropagation();
            setDragOverTargetPath("");
            setIsExternalFileDropActive(true);
            event.dataTransfer.dropEffect = "copy";
            return;
          }
          if (!entry?.isFolder || !canDropIntoPath(entry.path)) return;
          event.preventDefault();
          event.stopPropagation();
          setDragOverTargetPath(entry.path);
          event.dataTransfer.dropEffect = "move";
        }

        function handleBrowserDragOver(event) {
          if (!draggedPaths.length || !canDropIntoPath(currentPath)) return;
          event.preventDefault();
          setDragOverTargetPath("__current__");
          event.dataTransfer.dropEffect = "move";
        }

        function handleFilesBrowserDragEnter(event) {
          if (!isExternalFilesDrag(event)) return;
          event.preventDefault();
          event.stopPropagation();
          setToolbarPopover("");
          closeContextMenu();
          setDragOverTargetPath("");
          setIsExternalFileDropActive(true);
          event.dataTransfer.dropEffect = "copy";
        }

        function handleFilesBrowserDragOver(event) {
          if (isExternalFilesDrag(event)) {
            event.preventDefault();
            event.stopPropagation();
            setDragOverTargetPath("");
            setIsExternalFileDropActive(true);
            event.dataTransfer.dropEffect = "copy";
            return;
          }
          handleBrowserDragOver(event);
        }

        function handleDragLeave(event) {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setDragOverTargetPath("");
        }

        function handleFilesBrowserDragLeave(event) {
          if (!isExternalFilesDrag(event)) {
            if (isExternalFileDropActive) {
              const bounds = event.currentTarget.getBoundingClientRect();
              const hasLeftBrowser =
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom;
              if (hasLeftBrowser) {
                setIsExternalFileDropActive(false);
              }
              return;
            }
            handleDragLeave(event);
            return;
          }
          if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) {
            return;
          }
          const bounds = event.currentTarget.getBoundingClientRect();
          const hasLeftBrowser =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;
          if (hasLeftBrowser) {
            setIsExternalFileDropActive(false);
          }
        }

        async function handleFolderDrop(event, entry) {
          if (!entry?.isFolder) return;
          if (isExternalFilesDrag(event)) {
            event.preventDefault();
            event.stopPropagation();
            setIsExternalFileDropActive(false);
            setDragOverTargetPath("");
            await uploadFilesToPath(Array.from(event.dataTransfer?.files || []), entry.path);
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          await handleMoveEntries(entry.path);
        }

        async function handleBrowserDrop(event) {
          if (isExternalFilesDrag(event)) {
            event.preventDefault();
            event.stopPropagation();
            setIsExternalFileDropActive(false);
            setDragOverTargetPath("");
            await uploadFilesToPath(Array.from(event.dataTransfer?.files || []), currentPath);
            return;
          }
          if (!draggedPaths.length) return;
          event.preventDefault();
          await handleMoveEntries(currentPath);
        }

        const filterOptions = [
          { id: "all", label: "All Items", description: "Show files and folders" },
          { id: "images", label: "Images", description: "Only show image files" },
          { id: "folders", label: "Folders", description: "Only show folders" },
          { id: "files", label: "Files", description: "Only show files" },
        ];
        const changesFilterOptions = [
          { id: "all", label: "All Changes", description: "Show every file operation" },
          { id: "created", label: "Created", description: "Files created by agents or users" },
          { id: "uploaded", label: "Uploaded", description: "Files uploaded into the environment" },
          { id: "modified", label: "Modified", description: "Existing files that were changed" },
          { id: "deleted", label: "Deleted", description: "Files removed from the environment" },
        ];
        const sortOptions = [
          { id: "name-asc", label: "Name (A-Z)" },
          { id: "name-desc", label: "Name (Z-A)" },
          { id: "modified-desc", label: "Recently Updated" },
          { id: "modified-asc", label: "Oldest Updated" },
          { id: "size-desc", label: "Largest First" },
          { id: "size-asc", label: "Smallest First" },
        ];
        const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
        const activeChangesFilterOption = changesFilterOptions.find((option) => option.id === changesOperationFilter) || changesFilterOptions[0];
        const activeChangeActorOption = changesActorFilter === "__all__"
          ? { id: "__all__", label: "All Contributors" }
          : availableChangeActors.find((option) => option.id === changesActorFilter) || { id: changesActorFilter, label: "Contributor" };
        const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
        const isChangesMode = contentMode === "changes";
        const isConnectorsMode = contentMode === "connectors";
        const isFilesMode = contentMode === "files";
        const hasActiveChangesFilters = changesOperationFilter !== "all" || changesActorFilter !== "__all__";
        const changesActorOptions = [
          {
            id: "__all__",
            label: "All Contributors",
            description: "Show changes from every agent and manual edit",
          },
        ].concat(
          availableChangeActors.map((option) => ({
            id: option.id,
            label: option.label,
            description: option.id === "__manual__"
              ? "Show only direct edits made outside thread execution"
              : "Show only changes made by this contributor",
          }))
        );
        const hasVisibleEntries = viewMode === "list" ? visibleRows.length > 0 : filteredCurrentEntries.length > 0;
        const selectedEnvironment = environments.find((environment) => environment.id === selectedEnvironmentId)
          || environments.find((environment) => environment.isDefault)
          || environments[0]
          || null;
        const orderedEnvironments = useMemo(() => {
          if (!environments.length) return [];
          const pinnedId = selectedEnvironment?.id || "";
          if (!pinnedId) return [...environments];
          const pinnedEnvironment = environments.find((environment) => environment.id === pinnedId) || null;
          if (!pinnedEnvironment) return [...environments];
          return [pinnedEnvironment].concat(environments.filter((environment) => environment.id !== pinnedId));
        }, [environments, selectedEnvironment]);
        const availableDestinationComputers = useMemo(() => {
          const currentId = String(selectedEnvironmentId || "").trim();
          return (Array.isArray(environments) ? environments : [])
            .filter((environment) => {
              const environmentId = String(environment?.id || "").trim();
              return environmentId && environmentId !== currentId;
            });
        }, [environments, selectedEnvironmentId]);
        const shouldRenderFilesToolbarMenu = (popoverId) =>
          toolbarPopover === popoverId || filesToolbarMenuAnimation.popover === popoverId;
        const getFilesToolbarMenuAnimationClass = (popoverId) =>
          filesToolbarMenuAnimation.popover === popoverId && filesToolbarMenuAnimation.phase === "exit"
            ? "account-menu-animate-up-out"
            : "account-menu-animate-up-in";

        function toggleToolbarPopover(nextPopover) {
          setToolbarPopover((current) => current === nextPopover ? "" : nextPopover);
          closeContextMenu();
        }

        function applyFilesEnvironmentSelection(nextEnvironmentId, options = {}) {
          const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
          if (!normalizedEnvironmentId) {
            return;
          }
          setSelectedEnvironmentId(normalizedEnvironmentId);
          if (options?.persist !== false) {
            persistPlaygroundWorkspaceSelection(PLAYGROUND_RUNNER_CHAT_APP_ID, backendUrl, {
              mode: "computers",
              environmentId: normalizedEnvironmentId,
              projectId: "",
            });
          }
          if (typeof onEnvironmentChange === "function") {
            onEnvironmentChange(normalizedEnvironmentId);
          }
        }

        function handleEnvironmentSelect(nextEnvironmentId) {
          setProjectFilterScope("");
          setProjectFilterScopeLabel("");
          setFilesEnvironmentMenuMode("computers");
          if (isConnectorsMode) setContentMode("files");
          setToolbarPopover("");
          applyFilesEnvironmentSelection(nextEnvironmentId);
        }

        function buildFilesEnvironmentClonePayload(environment, nextName) {
          const normalizedEnvironment = normalizePlaygroundEnvironmentRecord({
            ...environment,
            name: nextName,
          });
          const profile = getPlaygroundEnvironmentComputeProfileConfig(normalizedEnvironment.computeProfile);
          const runtimes = Object.fromEntries(
            Object.entries(normalizedEnvironment?.runtimes || {}).filter(([, value]) => typeof value === "string" && value.trim())
          );
          const packages = {
            system: (normalizedEnvironment?.packages?.system || []).map((value) => String(value || "").trim()).filter(Boolean),
            python: (normalizedEnvironment?.packages?.python || []).map((value) => String(value || "").trim()).filter(Boolean),
            node: (normalizedEnvironment?.packages?.node || []).map((value) => String(value || "").trim()).filter(Boolean),
          };
          const environmentVariables = (normalizedEnvironment?.environmentVariables || [])
            .map((item) => ({
              key: String(item?.key || "").trim(),
              value: typeof item?.value === "string" ? item.value : "",
            }))
            .filter((item) => item.key);
          const secrets = (normalizedEnvironment?.secrets || [])
            .map((secret) => ({
              key: String(secret?.key || "").trim(),
              value: typeof secret?.value === "string" ? secret.value : "",
            }))
            .filter((secret) => secret.key);
          const mcpServers = (normalizedEnvironment?.mcpServers || [])
            .map((server) => ({
              id: server?.id,
              name: String(server?.name || "").trim(),
              enabled: server?.enabled !== false,
              type: server?.type === "http" ? "http" : "stdio",
              command: typeof server?.command === "string" ? server.command : "",
              url: typeof server?.url === "string" ? server.url : "",
              bearerToken: typeof server?.bearerToken === "string" ? server.bearerToken : "",
            }))
            .filter((server) => server.name);
          const documentation = (normalizedEnvironment?.documentation || [])
            .map((document, index) => ({
              id: typeof document?.id === "string" && document.id.trim() ? document.id : "doc-" + index,
              name: String(document?.name || "").trim() || ("Document " + (index + 1)),
              content: typeof document?.content === "string" ? document.content : "",
              mimeType: typeof document?.mimeType === "string" && document.mimeType.trim() ? document.mimeType : "text/plain",
            }))
            .filter((document) => document.name || document.content);
          const metadata = clonePlaygroundEnvironmentMetadata(normalizedEnvironment?.metadata);
          const pricing = metadata.pricing && typeof metadata.pricing === "object" && !Array.isArray(metadata.pricing)
            ? { ...metadata.pricing }
            : {};
          pricing.minutePrice = profile.minutePrice;
          return {
            name: String(nextName || "").trim() || "Forked Computer",
            runtimes,
            packages,
            dockerfileExtensions: typeof normalizedEnvironment?.dockerfileExtensions === "string" ? normalizedEnvironment.dockerfileExtensions : "",
            environmentVariables,
            secrets,
            setupScripts: (normalizedEnvironment?.setupScripts || []).map((value) => String(value || "")).filter((value) => value.trim()),
            mcpServers,
            documentation,
            internetAccess: normalizedEnvironment?.internetAccess !== false,
            metadata: {
              ...metadata,
              computeProfile: profile.id,
              computeResources: {
                cpuCores: profile.cpuCores,
                memoryMb: profile.memoryMb,
              },
              pricing,
              guiEnabled: profile.guiEnabled,
              officeAppsEnabled: normalizedEnvironment?.officeAppsEnabled === true && profile.id === "desktop",
            },
          };
        }

        async function createFilesEnvironmentClone(environment, nextName) {
          const payload = buildFilesEnvironmentClonePayload(environment, nextName);
          const createResponse = await fetch(backendUrl + "/environments", {
            method: "POST",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: payload.name,
              environmentVariables: payload.environmentVariables,
              secrets: payload.secrets,
              setupScripts: payload.setupScripts,
              mcpServers: payload.mcpServers,
              documentation: payload.documentation,
              internetAccess: payload.internetAccess,
              metadata: payload.metadata,
            }),
          });
          const createData = await createResponse.json().catch(() => ({}));
          if (!createResponse.ok) {
            throw new Error(createData?.message || createData?.error || "Failed to fork computer.");
          }

          const createdEnvironment = getPlaygroundEnvironmentResponseRecord(createData);
          if (!createdEnvironment?.id) {
            throw new Error("Computer creation response did not include an id.");
          }

          const updateResponse = await fetch(backendUrl + "/environments/" + encodeURIComponent(createdEnvironment.id), {
            method: "PUT",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const updateData = await updateResponse.json().catch(() => ({}));
          if (!updateResponse.ok) {
            throw new Error(updateData?.message || updateData?.error || "Failed to configure the forked computer.");
          }

          return getPlaygroundEnvironmentResponseRecord(updateData) || normalizePlaygroundEnvironmentRecord({
            ...createdEnvironment,
            ...payload,
          });
        }

        function handleOpenCurrentEnvironmentSettings() {
          const normalizedEnvironmentId = String(selectedEnvironment?.id || "").trim();
          if (!normalizedEnvironmentId) {
            return;
          }
          setToolbarPopover("");
          if (typeof onOpenEnvironmentSettings === "function") {
            onOpenEnvironmentSettings(normalizedEnvironmentId);
          }
        }

        async function handleForkCurrentEnvironment() {
          const targetEnvironment = selectedEnvironment;
          const normalizedEnvironmentId = String(targetEnvironment?.id || "").trim();
          if (!normalizedEnvironmentId) {
            return;
          }

          const suggestedName = ((targetEnvironment?.name || "Computer").trim() || "Computer") + " Copy";
          const requestedName = window.prompt("Fork computer name", suggestedName);
          const nextName = String(requestedName || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            return;
          }

          setToolbarPopover("");
          setActionError("");
          setFileEnvironmentMutationState({
            environmentId: normalizedEnvironmentId,
            action: "fork",
          });

          try {
            const savedEnvironment = await createFilesEnvironmentClone(targetEnvironment, nextName);
            if (typeof onEnvironmentMutated === "function") {
              await onEnvironmentMutated();
            }
            if (savedEnvironment?.id && typeof onOpenEnvironmentSettings === "function") {
              onOpenEnvironmentSettings(savedEnvironment.id);
            } else if (savedEnvironment?.id) {
              setSelectedEnvironmentId(savedEnvironment.id);
            }
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to fork computer.");
          } finally {
            setFileEnvironmentMutationState({
              environmentId: "",
              action: "",
            });
          }
        }

        async function handleCopyEnvironmentFromMenu(environment) {
          const normalizedEnvironmentId = String(environment?.id || "").trim();
          if (!normalizedEnvironmentId) {
            return;
          }

          const suggestedName = ((environment?.name || "Computer").trim() || "Computer") + " Copy";
          const requestedName = window.prompt("Copy computer name", suggestedName);
          const nextName = String(requestedName || "").trim().replace(/\\s+/g, " ");
          if (!nextName) {
            closeEnvironmentListActionMenu();
            return;
          }

          closeEnvironmentListActionMenu();
          setToolbarPopover("");
          setActionError("");
          setFileEnvironmentMutationState({
            environmentId: normalizedEnvironmentId,
            action: "fork",
          });

          try {
            const savedEnvironment = await createFilesEnvironmentClone(environment, nextName);
            if (typeof onEnvironmentMutated === "function") {
              await onEnvironmentMutated();
            }
            if (savedEnvironment?.id) {
              setSelectedEnvironmentId(savedEnvironment.id);
              setIsHomeViewActive(false);
            }
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to copy computer.");
          } finally {
            setFileEnvironmentMutationState({
              environmentId: "",
              action: "",
            });
          }
        }

        async function handleDeleteCurrentEnvironment() {
          const targetEnvironment = selectedEnvironment;
          const normalizedEnvironmentId = String(targetEnvironment?.id || "").trim();
          if (!normalizedEnvironmentId) {
            return;
          }
          if (targetEnvironment?.isSystem || targetEnvironment?.isDefault) {
            setToolbarPopover("");
            setActionError("Default and system computers cannot be deleted.");
            return;
          }
          if (!window.confirm("Delete this computer?")) {
            return;
          }

          const fallbackEnvironment = orderedEnvironments.find((environment) => environment.id !== normalizedEnvironmentId) || null;
          setToolbarPopover("");
          setActionError("");
          setFileEnvironmentMutationState({
            environmentId: normalizedEnvironmentId,
            action: "delete",
          });

          try {
            const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId), {
              method: "DELETE",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete computer.");
            }
            setSelectedEnvironmentId(String(fallbackEnvironment?.id || "").trim());
            if (typeof onEnvironmentMutated === "function") {
              await onEnvironmentMutated();
            }
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to delete computer.");
          } finally {
            setFileEnvironmentMutationState({
              environmentId: "",
              action: "",
            });
          }
        }
`;
