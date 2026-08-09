export const FILES_PAGE_WORKSPACE_SCRIPT = `
        function matchesFilesLibrarySearch(entry) {
          if (!normalizedFilesLibrarySearchQuery) {
            return true;
          }
          const searchText = [
            entry?.name,
            entry?.path,
            entry?.mimeType,
            entry?.type,
            entry?.extension,
          ].map((value) => String(value || "").toLowerCase()).join(" ");
          return searchText.includes(normalizedFilesLibrarySearchQuery);
        }
        const filteredCurrentEntries = useMemo(
          () => currentEntries.filter((entry) =>
            matchesPlaygroundEnvironmentEntryFilter(entry, filterMode)
            && (!projectFilterScope || matchesPlaygroundEnvironmentEntryProjectFilter(entry, currentProjectLinkedPaths))
            && matchesFilesLibrarySearch(entry)
          ),
          [currentEntries, currentProjectLinkedPaths, filterMode, normalizedFilesLibrarySearchQuery, projectFilterScope]
        );
        const visibleRows = useMemo(
          () => filterMode === "all" && !projectFilterScope && !normalizedFilesLibrarySearchQuery
            ? buildPlaygroundEnvironmentVisibleRows(environmentTree, currentPath, expandedFolders, sortMode)
            : filteredCurrentEntries.map((entry) => ({ entry, level: 0 })),
          [currentPath, environmentTree, expandedFolders, filterMode, filteredCurrentEntries, normalizedFilesLibrarySearchQuery, projectFilterScope, sortMode]
        );
        const selectionScopeEntries = viewMode === "list" ? visibleRows.map((row) => row.entry) : filteredCurrentEntries;
        const visibleSelectionState = useMemo(() => {
          const entries = [];
          const paths = [];
          const seen = new Set();
          for (const entry of selectionScopeEntries) {
            const path = normalizeHistoryPath(entry?.path || "");
            if (!path || seen.has(path)) continue;
            seen.add(path);
            entries.push(entry);
            paths.push(path);
          }
          const selectedCount = paths.reduce(
            (count, path) => count + (selectedPaths.has(path) ? 1 : 0),
            0
          );
          return {
            entries,
            paths,
            selectedCount,
            allSelected: paths.length > 0 && selectedCount === paths.length,
            indeterminate: selectedCount > 0 && selectedCount < paths.length,
          };
        }, [selectedPaths, selectionScopeEntries]);
        const breadcrumbs = useMemo(() => buildPlaygroundEnvironmentBreadcrumbs(currentPath), [currentPath]);
        const canGoBack = pathHistoryIndex > 0;
        const canGoForward = pathHistoryIndex < pathHistory.length - 1;
        const visibleEntryCount = viewMode === "list" ? visibleRows.length : filteredCurrentEntries.length;
        const isEmptyEnvironmentRoot = Boolean(
          selectedEnvironmentId
          && !normalizedCurrentPath
          && currentEntries.length === 0
        );

        const selectedEntries = useMemo(() => {
          const ordered = [];
          const seen = new Set();

          for (const entry of selectionScopeEntries) {
            const normalizedPath = normalizeHistoryPath(entry.path);
            if (selectedPaths.has(normalizedPath) && !seen.has(normalizedPath)) {
              const node = environmentTree.nodesByPath.get(normalizedPath);
              if (node) {
                ordered.push(node);
                seen.add(normalizedPath);
              }
            }
          }

          for (const value of selectedPaths) {
            const normalizedPath = normalizeHistoryPath(value);
            if (seen.has(normalizedPath)) continue;
            const node = environmentTree.nodesByPath.get(normalizedPath);
            if (node) {
              ordered.push(node);
              seen.add(normalizedPath);
            }
          }

          return ordered;
        }, [environmentTree, selectedPaths, selectionScopeEntries]);

        const singleSelectedEntry = selectedEntries.length === 1 ? selectedEntries[0] : null;
        const hasFolderOnlySelection = selectedEntries.length === 1 && Boolean(singleSelectedEntry?.isFolder);
        const selectedFileEntries = useMemo(
          () => selectedEntries.filter((entry) => entry && !entry.isFolder),
          [selectedEntries]
        );
        const activePreviewEntry = useMemo(() => {
          const normalizedPreviewPath = normalizeHistoryPath(previewTargetPath);
          if (normalizedPreviewPath && selectedPaths.has(normalizedPreviewPath)) {
            const node = environmentTree.nodesByPath.get(normalizedPreviewPath) || null;
            if (node && !node.isFolder) {
              return node;
            }
          }
          if (selectedFileEntries.length === 1) {
            return selectedFileEntries[0];
          }
          return selectedFileEntries[selectedFileEntries.length - 1] || null;
        }, [environmentTree, previewTargetPath, selectedFileEntries, selectedPaths]);

        useEffect(() => {
          function isEditableFilesShortcutTarget(target) {
            if (!(target instanceof Element)) return false;
            return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"));
          }

          function matchesFilesResourceActionShortcut(event, key, code) {
            return (event.metaKey || event.ctrlKey)
              && event.altKey
              && !event.shiftKey
              && (event.code === code || String(event.key || "").toLowerCase() === key);
          }

          function handleFilesResourceActionShortcut(event) {
            if (
              contentMode !== "files"
              || !selectedEnvironmentId
              || event.defaultPrevented
              || event.repeat
              || isEditableFilesShortcutTarget(event.target)
              || document.querySelector(".platform-modal-backdrop, .sidebar-thread-rename-scrim, [role='dialog'][aria-modal='true']")
            ) {
              return;
            }

            const actionEntries = selectedEntries.length > 0
              ? selectedEntries
              : activePreviewEntry
                ? [activePreviewEntry]
                : [];
            if (actionEntries.length === 0) return;

            if (matchesFilesResourceActionShortcut(event, "s", "KeyS")) {
              const fileEntries = actionEntries.filter((entry) => entry && !entry.isFolder);
              if (fileEntries.length === 0) return;
              event.preventDefault();
              event.stopPropagation();
              setToolbarPopover("");
              closeContextMenu();
              openFileTeamPickerDialog(fileEntries);
              return;
            }

            if (matchesFilesResourceActionShortcut(event, "r", "KeyR")) {
              if (actionEntries.length !== 1) return;
              event.preventDefault();
              event.stopPropagation();
              setToolbarPopover("");
              startRename(actionEntries[0], { showPreview: false });
              return;
            }

            if (matchesFilesResourceActionShortcut(event, "backspace", "Backspace")) {
              event.preventDefault();
              event.stopPropagation();
              setToolbarPopover("");
              void handleDeleteEntries(actionEntries);
            }
          }

          window.addEventListener("keydown", handleFilesResourceActionShortcut, true);
          return () => window.removeEventListener("keydown", handleFilesResourceActionShortcut, true);
        }, [activePreviewEntry, contentMode, selectedEntries, selectedEnvironmentId]);

        useEffect(() => {
          setIsStartingImagePreviewThread(false);
        }, [activePreviewEntry?.path]);

        const singleSelectedEntryFileKind = useMemo(
          () => (activePreviewEntry && !activePreviewEntry.isFolder ? getPlaygroundFileKind(activePreviewEntry) : ""),
          [activePreviewEntry]
        );
        const hasActiveImageMaskSelection = singleSelectedEntryFileKind === "image" && imageMaskStrokes.length > 0;

        useEffect(() => {
          setIsImageSelectionMode(false);
          setImageMaskStrokes([]);
          setImageMaskRedoStrokes([]);
          setImageMaskDraftStroke(null);
          setImageMaskImageSize({ width: 0, height: 0 });
          setIsImageCropMode(false);
          setImageCropRect(null);
          setImageCropDraftRect(null);
          setImageCropDragTarget("new");
          setImageCropHistory((current) => {
            revokeImageCropHistoryEntries(current);
            return [];
          });
          setImageCropHistoryIndex(0);
          setIsCroppingImage(false);
          setIsSavingImageCrop(false);
          imageCropStartPointRef.current = null;
          imageCropDraftRectRef.current = null;
          imageCropDragStateRef.current = null;
        }, [activePreviewEntry?.path, singleSelectedEntryFileKind]);

        function resetImageSelectionMode() {
          setIsImageSelectionMode(false);
          setImageMaskStrokes([]);
          setImageMaskRedoStrokes([]);
          setImageMaskDraftStroke(null);
        }

        function beginImageSelectionMode() {
          if (singleSelectedEntryFileKind !== "image") {
            return;
          }
          setToolbarPopover("");
          resetImageCropMode();
          setIsImageSelectionMode(true);
          setImageMaskRedoStrokes([]);
        }

        function revokeImageCropHistoryEntries(entries) {
          (Array.isArray(entries) ? entries : []).forEach((entry) => {
            if (entry?.url) {
              try {
                URL.revokeObjectURL(entry.url);
              } catch {}
            }
          });
        }

        function resetImageCropMode() {
          setIsImageCropMode(false);
          setImageCropRect(null);
          setImageCropDraftRect(null);
          setImageCropDragTarget("new");
          setImageCropHistory((current) => {
            revokeImageCropHistoryEntries(current);
            return [];
          });
          setImageCropHistoryIndex(0);
          setIsCroppingImage(false);
          setIsSavingImageCrop(false);
          imageCropStartPointRef.current = null;
          imageCropDraftRectRef.current = null;
          imageCropDragStateRef.current = null;
        }

        function beginImageCropMode() {
          if (singleSelectedEntryFileKind !== "image") {
            return;
          }
          setToolbarPopover("");
          resetImageSelectionMode();
          setIsImageCropMode(true);
          setImageCropRect(null);
          setImageCropDraftRect(null);
          setImageCropDragTarget("new");
          setImageCropHistory((current) => {
            revokeImageCropHistoryEntries(current);
            return [];
          });
          setImageCropHistoryIndex(0);
          imageCropStartPointRef.current = null;
          imageCropDraftRectRef.current = null;
          imageCropDragStateRef.current = null;
        }

        function buildImageCropRect(startPoint, endPoint) {
          const width = Math.max(1, Number(imageMaskImageSize?.width || 1));
          const height = Math.max(1, Number(imageMaskImageSize?.height || 1));
          const startX = Math.max(0, Math.min(width, Number(startPoint?.x || 0)));
          const startY = Math.max(0, Math.min(height, Number(startPoint?.y || 0)));
          const endX = Math.max(0, Math.min(width, Number(endPoint?.x || 0)));
          const endY = Math.max(0, Math.min(height, Number(endPoint?.y || 0)));
          const x = Math.min(startX, endX);
          const y = Math.min(startY, endY);
          return {
            x,
            y,
            width: Math.max(0, Math.abs(endX - startX)),
            height: Math.max(0, Math.abs(endY - startY)),
          };
        }

        function buildImageCropRectFromDrag(point) {
          const dragState = imageCropDragStateRef.current;
          if (!dragState) {
            return null;
          }
          if (dragState.mode === "new") {
            return buildImageCropRect(dragState.startPoint, point);
          }

          const imageWidth = Math.max(1, Number(imageMaskImageSize?.width || 1));
          const imageHeight = Math.max(1, Number(imageMaskImageSize?.height || 1));
          const minSize = 8;
          const startRect = dragState.startRect || { x: 0, y: 0, width: 0, height: 0 };
          let left = Number(startRect.x || 0);
          let top = Number(startRect.y || 0);
          let right = left + Number(startRect.width || 0);
          let bottom = top + Number(startRect.height || 0);
          const target = String(dragState.mode || "new");

          if (target.includes("w")) {
            left = Math.max(0, Math.min(right - minSize, Number(point.x || 0)));
          }
          if (target.includes("e")) {
            right = Math.min(imageWidth, Math.max(left + minSize, Number(point.x || 0)));
          }
          if (target.includes("n")) {
            top = Math.max(0, Math.min(bottom - minSize, Number(point.y || 0)));
          }
          if (target.includes("s")) {
            bottom = Math.min(imageHeight, Math.max(top + minSize, Number(point.y || 0)));
          }

          return {
            x: Math.max(0, Math.min(imageWidth, left)),
            y: Math.max(0, Math.min(imageHeight, top)),
            width: Math.max(0, Math.min(imageWidth, right) - Math.max(0, Math.min(imageWidth, left))),
            height: Math.max(0, Math.min(imageHeight, bottom) - Math.max(0, Math.min(imageHeight, top))),
          };
        }

        function handleImageCropPointerStart(point, target = "new") {
          const normalizedTarget = target && target !== "new" && imageCropRect ? String(target) : "new";
          imageCropDragStateRef.current = {
            mode: normalizedTarget,
            startPoint: point,
            startRect: normalizedTarget === "new" ? null : { ...imageCropRect },
          };
          setImageCropDragTarget(normalizedTarget);
          imageCropStartPointRef.current = point;
          const nextRect = normalizedTarget === "new"
            ? buildImageCropRect(point, point)
            : { ...imageCropRect };
          imageCropDraftRectRef.current = nextRect;
          setImageCropDraftRect(nextRect);
          if (normalizedTarget === "new") {
            setImageCropRect(null);
          }
        }

        function handleImageCropPointerMove(point) {
          if (!imageCropDragStateRef.current) return;
          const nextRect = buildImageCropRectFromDrag(point);
          if (!nextRect) return;
          imageCropDraftRectRef.current = nextRect;
          setImageCropDraftRect(nextRect);
        }

        function handleImageCropPointerEnd() {
          const draftRect = imageCropDraftRectRef.current || imageCropDraftRect;
          const dragState = imageCropDragStateRef.current;
          imageCropStartPointRef.current = null;
          imageCropDraftRectRef.current = null;
          imageCropDragStateRef.current = null;
          setImageCropDragTarget("new");
          setImageCropDraftRect(null);
          if (!draftRect || Number(draftRect.width || 0) < 8 || Number(draftRect.height || 0) < 8) {
            if (!dragState || dragState.mode === "new") {
              setImageCropRect(null);
            }
            return;
          }
          setImageCropRect({
            x: Math.round(Number(draftRect.x || 0)),
            y: Math.round(Number(draftRect.y || 0)),
            width: Math.round(Number(draftRect.width || 0)),
            height: Math.round(Number(draftRect.height || 0)),
          });
        }

        function undoImageSelectionStroke() {
          setImageMaskStrokes((current) => {
            if (!current.length) return current;
            const next = current.slice(0, -1);
            const removed = current[current.length - 1];
            setImageMaskRedoStrokes((redoCurrent) => [removed, ...redoCurrent]);
            return next;
          });
          setImageMaskDraftStroke(null);
        }

        function redoImageSelectionStroke() {
          setImageMaskRedoStrokes((current) => {
            if (!current.length) return current;
            const [restored, ...remaining] = current;
            setImageMaskStrokes((strokeCurrent) => [...strokeCurrent, restored]);
            return remaining;
          });
          setImageMaskDraftStroke(null);
        }

        function handleImageMaskPointerStart(point) {
          const nextStroke = {
            id: "mask-stroke-" + (++imageMaskStrokeIdRef.current),
            brushSize: point.brushSize,
            points: [{ x: point.x, y: point.y }],
          };
          setImageMaskDraftStroke(nextStroke);
          setImageMaskRedoStrokes([]);
        }

        function handleImageMaskPointerMove(point) {
          setImageMaskDraftStroke((current) => {
            if (!current) return current;
            const previousPoint = current.points[current.points.length - 1];
            const distance = previousPoint
              ? Math.hypot(Number(point.x) - Number(previousPoint.x), Number(point.y) - Number(previousPoint.y))
              : Number.POSITIVE_INFINITY;
            if (distance < Math.max(1.5, Number(current.brushSize || 1) * 0.04)) {
              return current;
            }
            return {
              ...current,
              points: [...current.points, { x: point.x, y: point.y }],
            };
          });
        }

        function handleImageMaskPointerEnd() {
          setImageMaskDraftStroke((current) => {
            if (!current || !Array.isArray(current.points) || current.points.length === 0) {
              return null;
            }
            setImageMaskStrokes((strokesCurrent) => [...strokesCurrent, current]);
            return null;
          });
        }

        const canToggleDocumentPreviewMode = singleSelectedEntryFileKind === "html" || singleSelectedEntryFileKind === "markdown";
        const hasPreviewPanel = contentMode === "files" && selectedEntries.length > 0 && isPreviewOpen && !hasFolderOnlySelection && Boolean(activePreviewEntry);
        const singleSelectedEntryDownloadUrl = useMemo(() => {
          if (!activePreviewEntry || activePreviewEntry.isFolder || !selectedEnvironmentId) return "";
          return buildPlaygroundEnvironmentDownloadUrl(backendUrl, selectedEnvironmentId, activePreviewEntry.path);
        }, [activePreviewEntry, backendUrl, selectedEnvironmentId]);
        const activeImageCropHistoryEntry = isImageCropMode && imageCropHistoryIndex > 0
          ? (imageCropHistory[imageCropHistoryIndex - 1] || null)
          : null;
        const singleSelectedEntryPreviewAttachment = useMemo(() => {
          if (!activePreviewEntry || activePreviewEntry.isFolder || !singleSelectedEntryDownloadUrl) {
            return null;
          }

          const fileKind = getPlaygroundFileKind(activePreviewEntry);
          const htmlPreviewUrl = fileKind === "html"
            ? buildPlaygroundEnvironmentHtmlPreviewUrl(backendUrl, selectedEnvironmentId, activePreviewEntry.path)
            : undefined;
          const previewCacheKey = String(activePreviewEntry.modifiedTime || activePreviewEntry.updatedAt || activePreviewEntry.size || "").trim();
          const versionedDownloadUrl = previewCacheKey
            ? singleSelectedEntryDownloadUrl + (singleSelectedEntryDownloadUrl.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(previewCacheKey)
            : singleSelectedEntryDownloadUrl;
          const effectivePreviewUrl = fileKind === "image" && activeImageCropHistoryEntry?.url
            ? activeImageCropHistoryEntry.url
            : versionedDownloadUrl;

          return {
            id: "playground-files-preview:" + selectedEnvironmentId + ":" + activePreviewEntry.path,
            filename: activePreviewEntry.name,
            mimeType: getPlaygroundPreviewMimeType(activePreviewEntry),
            type: fileKind === "image" ? "image" : "document",
            environmentId: selectedEnvironmentId,
            workspacePath: normalizeHistoryPath(activePreviewEntry.path),
            sourcePath: normalizeHistoryPath(activePreviewEntry.path),
            previewKindOverride: fileKind === "video" ? "video" : undefined,
            url: effectivePreviewUrl,
            previewUrl: effectivePreviewUrl,
            htmlPreviewUrl,
          };
        }, [activeImageCropHistoryEntry?.url, activePreviewEntry, backendUrl, selectedEnvironmentId, singleSelectedEntryDownloadUrl]);
        const hasSingleFilePreview = contentMode === "files" && Boolean(singleSelectedEntryPreviewAttachment && activePreviewEntry && !activePreviewEntry.isFolder);
        const hasFileChatPanel = false;
        const showBrowserMinimizeButton = hasPreviewPanel && hasSingleFilePreview;
        const isBrowserMinimized = browserPaneMode !== "expanded";
        const isSearchInventoryLoading = Boolean(searchInventoryLoadingByEnvironmentId[selectedEnvironmentId]);
        const searchSourceInventory = searchInventoryByEnvironmentId[selectedEnvironmentId] || currentInventory;
        const fileChatRunnerKey = hasSingleFilePreview
          ? selectedEnvironmentId + "::" + activePreviewEntry.path
          : "playground-files-chat";
        const fileChatSystemPrompt = useMemo(() => {
          if (!hasSingleFilePreview || !activePreviewEntry || !selectedEnvironmentId) {
            return "";
          }
          return [
            "<system>",
            "The user is asking about a file that already exists in the current environment.",
            "Use the file below the same way you would if it were attached from the workspace.",
            "Environment ID: " + selectedEnvironmentId,
            "File path: /" + activePreviewEntry.path,
            "</system>",
          ].join("\\n");
        }, [activePreviewEntry, hasSingleFilePreview, selectedEnvironmentId]);
        const contextTargetEntry = contextMenu?.targetPath ? environmentTree.nodesByPath.get(contextMenu.targetPath) || null : null;
        const contextTargetAttachmentProjectIds = useMemo(() => {
          if (!contextTargetEntry || contextTargetEntry.isFolder || !selectedEnvironmentId) {
            return [];
          }
          const environmentRecord = projectAttachmentLinksByEnvironmentId[selectedEnvironmentId] || null;
          const linkedProjectIds = environmentRecord?.byPath?.[normalizeHistoryPath(contextTargetEntry.path)];
          return Array.from(linkedProjectIds instanceof Set ? linkedProjectIds : []);
        }, [contextTargetEntry, projectAttachmentLinksByEnvironmentId, selectedEnvironmentId]);
        const contextTargetAttachmentProjectId = useMemo(() => {
          if (contextTargetAttachmentProjectIds.length === 0) {
            return "";
          }
          if (projectFilterScope && contextTargetAttachmentProjectIds.includes(projectFilterScope)) {
            return projectFilterScope;
          }
          return contextTargetAttachmentProjectIds[0] || "";
        }, [contextTargetAttachmentProjectIds, projectFilterScope]);
        const contextTargetAttachmentProject = useMemo(
          () => availableProjectFilters.find((project) => project.id === contextTargetAttachmentProjectId) || null,
          [availableProjectFilters, contextTargetAttachmentProjectId]
        );

        const searchResults = useMemo(() => {
          const query = searchPopupQuery.trim().toLowerCase();
          if (!query) return [];
          return searchSourceInventory
            .filter((entry) => [entry.name || "", entry.path || ""].join(" ").toLowerCase().includes(query))
            .sort((left, right) => {
              if (left.isFolder !== right.isFolder) return left.isFolder ? -1 : 1;
              return left.path.localeCompare(right.path);
            })
            .slice(0, 20);
        }, [searchPopupQuery, searchSourceInventory]);

        useEffect(() => {
          if (!normalizedCurrentPath) return;
          if (!loadedFolderPaths.has(normalizedCurrentPath)) return;
          if (environmentTree.nodesByPath.has(normalizedCurrentPath)) return;
          setCurrentPath("");
          setPathHistory([""]);
          setPathHistoryIndex(0);
          setSelectedPaths(new Set());
          setSelectionAnchorPath("");
          setPreviewTargetPath("");
        }, [environmentTree, loadedFolderPaths, normalizedCurrentPath]);

        useEffect(() => {
          setSelectedPaths((current) => {
            const next = new Set(Array.from(current).map(normalizeHistoryPath).filter((path) => {
              if (environmentTree.nodesByPath.has(path)) {
                return true;
              }
              return !loadedFolderPaths.has(getPlaygroundEntryParentPath(path));
            }));
            if (next.size === current.size && Array.from(current).every((path) => next.has(normalizeHistoryPath(path)))) {
              return current;
            }
            return next;
          });
          setExpandedFolders((current) => {
            const next = new Set(Array.from(current).map(normalizeHistoryPath).filter((path) => {
              const node = environmentTree.nodesByPath.get(path);
              return Boolean(node && node.isFolder);
            }));
            if (next.size === current.size && Array.from(current).every((path) => next.has(normalizeHistoryPath(path)))) {
              return current;
            }
            return next;
          });
          if (
            selectionAnchorPath
            && !environmentTree.nodesByPath.has(selectionAnchorPath)
            && loadedFolderPaths.has(getPlaygroundEntryParentPath(selectionAnchorPath))
          ) {
            setSelectionAnchorPath("");
          }
          if (
            previewTargetPath
            && !environmentTree.nodesByPath.has(previewTargetPath)
            && loadedFolderPaths.has(getPlaygroundEntryParentPath(previewTargetPath))
          ) {
            setPreviewTargetPath("");
          }
          if (
            renamingPath
            && !environmentTree.nodesByPath.has(renamingPath)
            && loadedFolderPaths.has(getPlaygroundEntryParentPath(renamingPath))
          ) {
            setRenamingPath("");
            setRenameValue("");
          }
        }, [environmentTree, loadedFolderPaths, previewTargetPath, renamingPath, selectionAnchorPath]);

        useEffect(() => {
          if (selectedEntries.length === 0) {
            setIsPreviewOpen(true);
          }
        }, [selectedEntries.length]);

        useEffect(() => {
          const normalizedSelectedPath = normalizeHistoryPath(activePreviewEntry?.path || "");
          if (normalizedSelectedPath && createdFileEditorPathRef.current === normalizedSelectedPath) {
            createdFileEditorPathRef.current = "";
            setDocumentPreviewMode("code");
            return;
          }
          setDocumentPreviewMode("preview");
        }, [activePreviewEntry?.path, selectedEnvironmentId]);

        useEffect(() => {
          function handleFilesArrowNavigation(event) {
            if (
              event.defaultPrevented
              || event.altKey
              || event.ctrlKey
              || event.metaKey
              || (event.key !== "ArrowUp" && event.key !== "ArrowDown")
              || renamingPath
              || toolbarPopover
              || contextMenu
              || fileProjectPickerState
              || fileComputerPickerState
              || fileTeamPickerState
              || isFilesKeyboardNavigationEditableTarget(event.target)
            ) {
              return;
            }

            const didSelect = selectAdjacentVisibleFile(event.key === "ArrowDown" ? 1 : -1, {
              extendSelection: Boolean(event.shiftKey),
            });
            if (didSelect) {
              event.preventDefault();
            }
          }

          window.addEventListener("keydown", handleFilesArrowNavigation);
          return () => window.removeEventListener("keydown", handleFilesArrowNavigation);
        }, [
          contentMode,
          contextMenu,
          fileComputerPickerState,
          fileProjectPickerState,
          fileTeamPickerState,
          renamingPath,
          environmentTree,
          selectedEntries,
          selectedPaths,
          selectionAnchorPath,
          selectionScopeEntries,
          previewTargetPath,
          singleSelectedEntry,
          toolbarPopover,
        ]);

        useEffect(() => {
          if (!hasSingleFilePreview || !hasPreviewPanel) {
            setIsPreviewMaximized(false);
            setIsFileChatOpen(false);
            setFileChatPanelWidth(null);
          }
        }, [hasPreviewPanel, hasSingleFilePreview]);

        useEffect(() => {
          if (browserPaneMode === "auto" && !hasPreviewPanel) {
            setBrowserPaneMode("expanded");
          }
        }, [browserPaneMode, hasPreviewPanel]);

        function getShellWidth() {
          return filesShellRef.current?.clientWidth || 0;
        }

        function getResolvedFileChatPanelWidth() {
          if (!hasFileChatPanel) {
            return 0;
          }
          return fileChatPanelWidth !== null ? fileChatPanelWidth : FILE_CHAT_PANEL_DEFAULT_WIDTH;
        }

        function getDefaultPreviewPanelWidth() {
          const shellWidth = getShellWidth();
          if (!shellWidth) return null;
          const reservedChatWidth = hasFileChatPanel ? getResolvedFileChatPanelWidth() : 0;
          const availableWidth = Math.max(0, shellWidth - reservedChatWidth);
          return availableWidth > 0 ? Math.round(availableWidth * 0.5) : null;
        }

        function getResolvedPreviewPanelWidth() {
          if (!hasPreviewPanel) {
            return 0;
          }
          if (previewPanelWidth !== null) {
            return previewPanelWidth;
          }
          const defaultWidth = getDefaultPreviewPanelWidth();
          return defaultWidth !== null ? defaultWidth : 0;
        }

        function getDefaultFileChatPanelWidth() {
          const shellWidth = getShellWidth();
          if (!shellWidth) {
            return FILE_CHAT_PANEL_DEFAULT_WIDTH;
          }
          const reservedPreviewWidth = hasPreviewPanel ? getResolvedPreviewPanelWidth() : 0;
          const availableWidth = Math.max(0, shellWidth - reservedPreviewWidth);
          return Math.round(Math.min(FILE_CHAT_PANEL_DEFAULT_WIDTH, availableWidth));
        }

        function stopActiveResize() {
          activeResizeStateRef.current = null;
          setActiveResizePane("");
          if (typeof document !== "undefined") {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
          }
        }

        function closeFileChatPane() {
          setIsFileChatOpen(false);
          setFileChatPanelWidth(null);
        }

        function closePreviewPane() {
          setIsPreviewOpen(false);
          setIsPreviewMaximized(false);
          setPreviewPanelWidth(null);
          closeFileChatPane();
          clearSelection();
        }

        function maybeAutoMinimizeBrowser() {}

        function expandBrowserPane() {
          const shellWidth = getShellWidth();
          if (!shellWidth) {
            setBrowserPaneMode("expanded");
            return;
          }

          let nextPreviewWidth = hasPreviewPanel ? getResolvedPreviewPanelWidth() : 0;
          let nextChatWidth = hasFileChatPanel ? getResolvedFileChatPanelWidth() : 0;
          const desiredBrowserWidth = Math.min(
            FILES_BROWSER_RESTORE_WIDTH,
            Math.max(FILES_PANE_CLOSE_THRESHOLD, Math.round(shellWidth * 0.36))
          );
          let requiredReduction = Math.max(0, desiredBrowserWidth - Math.max(0, shellWidth - nextPreviewWidth - nextChatWidth));

          while (requiredReduction > 0 && (nextPreviewWidth > 0 || nextChatWidth > 0)) {
            if (nextPreviewWidth >= nextChatWidth && nextPreviewWidth > 0) {
              const reduction = Math.min(requiredReduction, nextPreviewWidth);
              nextPreviewWidth -= reduction;
              requiredReduction -= reduction;
              continue;
            }
            if (nextChatWidth > 0) {
              const reduction = Math.min(requiredReduction, nextChatWidth);
              nextChatWidth -= reduction;
              requiredReduction -= reduction;
              continue;
            }
            break;
          }

          if (hasPreviewPanel && nextPreviewWidth < FILES_PANE_CLOSE_THRESHOLD) {
            nextPreviewWidth = 0;
            nextChatWidth = 0;
            closePreviewPane();
          } else if (hasPreviewPanel && nextPreviewWidth > 0) {
            setIsPreviewOpen(true);
            setPreviewPanelWidth(Math.round(nextPreviewWidth));
          }

          if (nextChatWidth > 0 && nextChatWidth < FILES_PANE_CLOSE_THRESHOLD) {
            nextChatWidth = 0;
          }

          if (nextChatWidth > 0) {
            setIsFileChatOpen(true);
            setFileChatPanelWidth(Math.round(nextChatWidth));
          } else {
            closeFileChatPane();
          }

          setBrowserPaneMode("expanded");
        }

        function normalizePaneWidths() {
          const shellWidth = getShellWidth();
          if (!shellWidth) {
            return;
          }

          let nextPreviewWidth = hasPreviewPanel ? getResolvedPreviewPanelWidth() : 0;
          let nextChatWidth = hasFileChatPanel ? getResolvedFileChatPanelWidth() : 0;

          if (nextPreviewWidth > 0) {
            nextPreviewWidth = Math.min(nextPreviewWidth, Math.max(0, shellWidth - nextChatWidth));
            if (nextPreviewWidth < FILES_PANE_CLOSE_THRESHOLD) {
              nextPreviewWidth = 0;
              nextChatWidth = 0;
              closePreviewPane();
            } else {
              setPreviewPanelWidth(Math.round(nextPreviewWidth));
            }
          }

          if (nextChatWidth > 0) {
            nextChatWidth = Math.min(nextChatWidth, Math.max(0, shellWidth - nextPreviewWidth));
            if (nextChatWidth < FILES_PANE_CLOSE_THRESHOLD) {
              nextChatWidth = 0;
              closeFileChatPane();
            } else {
              setFileChatPanelWidth(Math.round(nextChatWidth));
            }
          }

          maybeAutoMinimizeBrowser(nextPreviewWidth, nextChatWidth);
        }

        useEffect(() => {
          if (!hasPreviewPanel) {
            setPreviewPanelWidth(null);
            if (activeResizeStateRef.current?.pane === "preview") {
              stopActiveResize();
            }
            return;
          }

          if (previewPanelWidth !== null) {
            return;
          }

          const frame = window.requestAnimationFrame(() => {
            const nextWidth = getDefaultPreviewPanelWidth();
            if (nextWidth === null) {
              return;
            }
            if (nextWidth < FILES_PANE_CLOSE_THRESHOLD) {
              closePreviewPane();
              return;
            }
            setPreviewPanelWidth(nextWidth);
            maybeAutoMinimizeBrowser(nextWidth, hasFileChatPanel ? getResolvedFileChatPanelWidth() : 0);
          });

          return () => window.cancelAnimationFrame(frame);
        }, [fileChatPanelWidth, hasFileChatPanel, hasPreviewPanel, previewPanelWidth]);

        useEffect(() => {
          if (!hasFileChatPanel) {
            setFileChatPanelWidth(null);
            if (activeResizeStateRef.current?.pane === "chat") {
              stopActiveResize();
            }
            return;
          }

          if (fileChatPanelWidth !== null) {
            return;
          }

          const frame = window.requestAnimationFrame(() => {
            const nextWidth = getDefaultFileChatPanelWidth();
            if (nextWidth < FILES_PANE_CLOSE_THRESHOLD) {
              closeFileChatPane();
              return;
            }
            setFileChatPanelWidth(nextWidth);
            maybeAutoMinimizeBrowser(hasPreviewPanel ? getResolvedPreviewPanelWidth() : 0, nextWidth);
          });

          return () => window.cancelAnimationFrame(frame);
        }, [fileChatPanelWidth, hasFileChatPanel, hasPreviewPanel, previewPanelWidth]);

        useEffect(() => {
          if (!filesShellRef.current) {
            return;
          }

          const shell = filesShellRef.current;
          const updateWidth = () => {
            normalizePaneWidths();
          };

          updateWidth();

          if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", updateWidth);
            return () => window.removeEventListener("resize", updateWidth);
          }

          const observer = new ResizeObserver(() => updateWidth());
          observer.observe(shell);
          return () => observer.disconnect();
        }, [fileChatPanelWidth, hasFileChatPanel, hasPreviewPanel, previewPanelWidth]);

        useEffect(() => {
          function handlePointerMove(event) {
            const resizeState = activeResizeStateRef.current;
            if (!resizeState || event.pointerId !== resizeState.pointerId) {
              return;
            }

            const shellWidth = getShellWidth();
            if (!shellWidth) {
              return;
            }

            const deltaX = resizeState.startX - event.clientX;
            const desiredWidth = Math.max(0, resizeState.startWidth + deltaX);

            if (resizeState.pane === "preview") {
              if (desiredWidth < FILES_PANE_CLOSE_THRESHOLD) {
                closePreviewPane();
                stopActiveResize();
                return;
              }
              const siblingChatWidth = hasFileChatPanel ? getResolvedFileChatPanelWidth() : 0;
              const nextWidth = Math.min(desiredWidth, Math.max(0, shellWidth - siblingChatWidth));
              setPreviewPanelWidth(Math.round(nextWidth));
              maybeAutoMinimizeBrowser(nextWidth, siblingChatWidth);
              return;
            }

            if (desiredWidth < FILES_PANE_CLOSE_THRESHOLD) {
              closeFileChatPane();
              stopActiveResize();
              return;
            }
            const siblingPreviewWidth = hasPreviewPanel ? getResolvedPreviewPanelWidth() : 0;
            const nextWidth = Math.min(desiredWidth, Math.max(0, shellWidth - siblingPreviewWidth));
            setFileChatPanelWidth(Math.round(nextWidth));
            maybeAutoMinimizeBrowser(siblingPreviewWidth, nextWidth);
          }

          function stopResize(event) {
            const resizeState = activeResizeStateRef.current;
            if (!resizeState) {
              return;
            }
            if (event && typeof event.pointerId === "number" && event.pointerId !== resizeState.pointerId) {
              return;
            }
            stopActiveResize();
          }

          window.addEventListener("pointermove", handlePointerMove);
          window.addEventListener("pointerup", stopResize);
          window.addEventListener("pointercancel", stopResize);
          window.addEventListener("blur", stopActiveResize);
          return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stopResize);
            window.removeEventListener("pointercancel", stopResize);
            window.removeEventListener("blur", stopActiveResize);
          };
        }, [fileChatPanelWidth, hasFileChatPanel, hasPreviewPanel, previewPanelWidth]);

        function startPreviewResize(event) {
          if (isPreviewMaximized) {
            return;
          }
          const previewWidth = event.currentTarget.parentElement?.getBoundingClientRect().width;
          if (!previewWidth) {
            return;
          }
          activeResizeStateRef.current = {
            pane: "preview",
            pointerId: event.pointerId,
            startX: event.clientX,
            startWidth: previewWidth,
          };
          setActiveResizePane("preview");
          if (typeof document !== "undefined") {
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }
          event.currentTarget.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        }

        function startFileChatResize(event) {
          const fileChatWidth = event.currentTarget.parentElement?.getBoundingClientRect().width;
          if (!fileChatWidth) {
            return;
          }
          activeResizeStateRef.current = {
            pane: "chat",
            pointerId: event.pointerId,
            startX: event.clientX,
            startWidth: fileChatWidth,
          };
          setActiveResizePane("chat");
          if (typeof document !== "undefined") {
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }
          event.currentTarget.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        }

        function handleFileChatToggle() {
          if (!hasSingleFilePreview) {
            return;
          }
          if (isFileChatOpen) {
            setIsFileChatOpen(false);
            return;
          }
          setIsPreviewMaximized(false);
          setIsFileChatOpen(true);
        }

        function startFileChatForEntry(entry) {
          if (!entry || entry.isFolder) {
            return;
          }
          closeContextMenu();
          setSelectedPaths(new Set([entry.path]));
          setSelectionAnchorPath(entry.path);
          setPreviewTargetPath(entry.path);
          setIsPreviewOpen(true);
          setIsPreviewMaximized(false);
          setIsFileChatOpen(true);
        }

        function clearSelection() {
          setIsPreviewMaximized(false);
          setSelectedPaths(new Set());
          setSelectionAnchorPath("");
          setPreviewTargetPath("");
          setRenamingPath("");
          setRenameValue("");
        }

        function toggleFilePreviewMaximized() {
          if (!hasPreviewPanel) {
            return;
          }
          setIsPreviewMaximized((current) => {
            const nextValue = !current;
            if (nextValue) {
              setIsFileChatOpen(false);
              setFileChatPanelWidth(null);
              setPreviewPanelWidth(null);
              setBrowserPaneMode("expanded");
              setToolbarPopover("");
            }
            return nextValue;
          });
        }

        function returnFromMaximizedPreviewToFiles() {
          setIsPreviewMaximized(false);
          setIsPreviewOpen(false);
          setPreviewPanelWidth(null);
          closeFileChatPane();
          clearSelection();
        }
`;
