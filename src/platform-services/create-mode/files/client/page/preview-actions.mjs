export const FILES_PAGE_PREVIEW_ACTIONS_SCRIPT = `
        function closeContextMenu() {
          if (!contextMenu) {
            return;
          }
          if (contextMenuCloseTimerRef.current !== null) {
            window.clearTimeout(contextMenuCloseTimerRef.current);
            contextMenuCloseTimerRef.current = null;
          }
          setContextMenuPhase("exit");
          contextMenuCloseTimerRef.current = window.setTimeout(() => {
            setContextMenu(null);
            setContextMenuPhase("idle");
            contextMenuCloseTimerRef.current = null;
          }, 180);
        }

        async function handleCopyEntry(entry) {
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          if (!normalizedPath) {
            return;
          }
          try {
            if (!navigator?.clipboard?.writeText) {
              throw new Error("Clipboard is unavailable.");
            }
            await navigator.clipboard.writeText("/" + normalizedPath);
            closeContextMenu();
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to copy file path.");
          }
        }

        async function handleDownloadFolderEntry(entry, normalizedEnvironmentId, normalizedPath) {
          const entryName = String(entry?.name || normalizedPath.split("/").pop() || "folder");
          const zipFilename = entryName.toLowerCase().endsWith(".zip") ? entryName : entryName + ".zip";
          const directDownloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedEnvironmentId, normalizedPath);
          if (directDownloadUrl) {
            try {
              const directResponse = await fetch(directDownloadUrl, {
                method: "GET",
                headers: requestHeaders,
              });
              const directContentType = String(directResponse.headers.get("content-type") || "").toLowerCase();
              if (directResponse.ok && !directContentType.includes("application/json")) {
                const directBlob = await directResponse.blob();
                if (directBlob.size > 0) {
                  triggerPlaygroundBlobDownload(
                    directContentType.includes("application/zip") ? directBlob : new Blob([directBlob], { type: "application/zip" }),
                    zipFilename
                  );
                  return;
                }
              }
            } catch {
              // Fall through to client-side zip creation when the backend does not yet support folder downloads.
            }
          }

          const listResponse = await fetch(
            buildPlaygroundEnvironmentFilesListUrl(backendUrl, normalizedEnvironmentId, normalizedPath, -1),
            {
              method: "GET",
              headers: requestHeaders,
            }
          );
          const listData = await listResponse.json().catch(() => ({}));
          if (!listResponse.ok) {
            throw new Error(listData?.message || listData?.error || "Failed to load folder contents.");
          }

          const normalizedInventory = normalizePlaygroundEnvironmentInventory(listData?.files || listData?.items || listData);
          const rootName = normalizePlaygroundZipPath(entryName) || "folder";
          const sourceEntries = [{
            path: rootName,
            isDirectory: true,
            modifiedAt: new Date(entry?.modifiedTime || entry?.createdTime || Date.now()),
          }];
          const knownDirectoryPaths = new Set([rootName + "/"]);
          const addDirectoryEntry = (directoryPath, modifiedAt = new Date()) => {
            const normalizedDirectoryPath = normalizePlaygroundZipPath(directoryPath, true);
            if (!normalizedDirectoryPath || knownDirectoryPaths.has(normalizedDirectoryPath)) {
              return;
            }
            knownDirectoryPaths.add(normalizedDirectoryPath);
            sourceEntries.push({
              path: normalizedDirectoryPath,
              isDirectory: true,
              modifiedAt,
            });
          };

          const descendants = normalizedInventory
            .map((item) => ({
              ...item,
              path: normalizeHistoryPath(item?.path || ""),
            }))
            .filter((item) => item.path && (item.path === normalizedPath || item.path.startsWith(normalizedPath + "/")))
            .sort((left, right) => {
              if (left.isFolder !== right.isFolder) return left.isFolder ? -1 : 1;
              return left.path.localeCompare(right.path);
            });

          for (const item of descendants) {
            if (item.path === normalizedPath) {
              continue;
            }
            const relativePath = item.path.slice(normalizedPath.length).replace(/^\\/+/, "");
            if (!relativePath) {
              continue;
            }
            const zipPath = rootName + "/" + relativePath;
            const modifiedAt = new Date(item.modifiedTime || item.createdTime || Date.now());
            const parentParts = relativePath.split("/").filter(Boolean).slice(0, -1);
            let currentParent = rootName;
            for (const part of parentParts) {
              currentParent += "/" + part;
              addDirectoryEntry(currentParent, modifiedAt);
            }
            if (item.isFolder) {
              addDirectoryEntry(zipPath, modifiedAt);
              continue;
            }

            const fileDownloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedEnvironmentId, item.path);
            if (!fileDownloadUrl) {
              continue;
            }
            const fileResponse = await fetch(fileDownloadUrl, {
              method: "GET",
              headers: requestHeaders,
            });
            if (!fileResponse.ok) {
              const errorText = await fileResponse.text().catch(() => "");
              throw new Error(errorText || "Failed to download " + item.path + ".");
            }
            sourceEntries.push({
              path: zipPath,
              isDirectory: false,
              data: new Uint8Array(await fileResponse.arrayBuffer()),
              modifiedAt,
            });
          }

          const zipBlob = createPlaygroundZipBlob(sourceEntries);
          triggerPlaygroundBlobDownload(zipBlob, zipFilename);
        }

        async function handleDownloadEntry(entry) {
          const normalizedEnvironmentId = String(selectedEnvironmentId || "").trim();
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          if (!normalizedEnvironmentId || !normalizedPath) {
            return;
          }
          if (entry?.isFolder) {
            closeContextMenu();
            setActionError("");
            try {
              await handleDownloadFolderEntry(entry, normalizedEnvironmentId, normalizedPath);
            } catch (error) {
              setActionError(error instanceof Error ? error.message : "Failed to download folder.");
            }
            return;
          }
          const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedEnvironmentId, normalizedPath);
          if (!downloadUrl) {
            return;
          }
          const anchor = document.createElement("a");
          anchor.href = downloadUrl;
          const entryName = String(entry?.name || normalizedPath.split("/").pop() || (entry?.isFolder ? "folder" : "file"));
          anchor.download = entry?.isFolder && !entryName.toLowerCase().endsWith(".zip") ? entryName + ".zip" : entryName;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          closeContextMenu();
        }

        async function handleDownloadEntries(entriesToDownload) {
          const normalizedEnvironmentId = String(selectedEnvironmentId || "").trim();
          const fileEntries = (Array.isArray(entriesToDownload) ? entriesToDownload : [])
            .filter((entry) => entry && !entry.isFolder);
          if (!normalizedEnvironmentId || fileEntries.length === 0) {
            return;
          }
          closeContextMenu();
          if (fileEntries.length === 1) {
            await handleDownloadEntry(fileEntries[0]);
            return;
          }
          const sourceEntries = [];
          const usedZipPaths = new Set();
          const getUniqueZipPath = (entry) => {
            const normalizedName = normalizePlaygroundZipPath(entry?.name || normalizeHistoryPath(entry?.path || "").split("/").pop() || "file") || "file";
            if (!usedZipPaths.has(normalizedName)) {
              usedZipPaths.add(normalizedName);
              return normalizedName;
            }
            const dotIndex = normalizedName.lastIndexOf(".");
            const baseName = dotIndex > 0 ? normalizedName.slice(0, dotIndex) : normalizedName;
            const extension = dotIndex > 0 ? normalizedName.slice(dotIndex) : "";
            let suffix = 2;
            let nextPath = baseName + "-" + suffix + extension;
            while (usedZipPaths.has(nextPath)) {
              suffix += 1;
              nextPath = baseName + "-" + suffix + extension;
            }
            usedZipPaths.add(nextPath);
            return nextPath;
          };
          try {
            for (const entry of fileEntries) {
              const normalizedPath = normalizeHistoryPath(entry?.path || "");
              const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedEnvironmentId, normalizedPath);
              if (!downloadUrl) {
                continue;
              }
              const response = await fetch(downloadUrl, {
                method: "GET",
                headers: requestHeaders,
              });
              if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || "Failed to download " + normalizedPath + ".");
              }
              sourceEntries.push({
                path: getUniqueZipPath(entry),
                isDirectory: false,
                data: new Uint8Array(await response.arrayBuffer()),
                modifiedAt: new Date(entry?.modifiedTime || entry?.createdTime || Date.now()),
              });
            }
            if (sourceEntries.length > 0) {
              const zipBlob = createPlaygroundZipBlob(sourceEntries);
              triggerPlaygroundBlobDownload(zipBlob, "selected-files.zip");
            }
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to download selected files.");
          }
        }

        async function buildThreadAttachmentForFileEntry(entry, options = {}) {
          const normalizedEnvironmentId = String(options?.environmentId || selectedEnvironmentId || "").trim();
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          if (!normalizedEnvironmentId || !normalizedPath || entry?.isFolder) {
            throw new Error("This file cannot be attached to a thread.");
          }
          const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, normalizedEnvironmentId, normalizedPath);
          const response = await fetch(downloadUrl, {
            method: "GET",
            headers: requestHeaders,
          });
          if (!response.ok) {
            throw new Error("Failed to load " + (entry?.name || "file") + " (" + response.status + ")");
          }
          const blob = await response.blob();
          const attachmentFile = new globalThis.File([blob], entry?.name || "file", {
            type: entry?.mimeType || blob.type || "application/octet-stream",
          });
          return uploadFilesPageAttachment(attachmentFile, {
            environmentId: normalizedEnvironmentId,
            sourcePath: normalizedPath,
          });
        }

        function drawNaturalImageMaskStroke(ctx, stroke) {
          const points = Array.isArray(stroke?.points) ? stroke.points : [];
          if (!points.length) return;
          const lineWidth = Math.max(2, Number(stroke?.brushSize || 1));
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = "rgba(0, 0, 0, 1)";
          ctx.fillStyle = "rgba(0, 0, 0, 1)";
          if (points.length === 1) {
            const point = points[0];
            ctx.beginPath();
            ctx.arc(Number(point.x || 0), Number(point.y || 0), lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
          }
          ctx.beginPath();
          ctx.moveTo(Number(points[0]?.x || 0), Number(points[0]?.y || 0));
          for (let index = 1; index < points.length; index += 1) {
            ctx.lineTo(Number(points[index]?.x || 0), Number(points[index]?.y || 0));
          }
          ctx.stroke();
        }

        function createImageSelectionMaskBlob() {
          return new Promise((resolve, reject) => {
            const width = Math.round(Number(imageMaskImageSize?.width || 0));
            const height = Math.round(Number(imageMaskImageSize?.height || 0));
            const strokes = Array.isArray(imageMaskStrokes) ? imageMaskStrokes : [];
            if (!width || !height || !strokes.length || typeof document === "undefined") {
              resolve(null);
              return;
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = "destination-out";
            strokes.forEach((stroke) => drawNaturalImageMaskStroke(ctx, stroke));
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error("Failed to create image edit mask."));
                return;
              }
              resolve(blob);
            }, "image/png");
          });
        }

        async function buildImageSelectionMaskAttachment(entry, environmentId) {
          if (singleSelectedEntryFileKind !== "image" || !hasActiveImageMaskSelection) {
            return null;
          }
          const maskBlob = await createImageSelectionMaskBlob();
          if (!maskBlob) {
            return null;
          }
          const rawBaseName = String(entry?.name || "image");
          const lastDotIndex = rawBaseName.lastIndexOf(".");
          const baseNameWithoutExtension = lastDotIndex > 0 ? rawBaseName.slice(0, lastDotIndex) : rawBaseName;
          const normalizedBaseName = baseNameWithoutExtension
            .replace(new RegExp("[^a-zA-Z0-9._-]+", "g"), "_")
            .replace(new RegExp("^_+|_+$", "g"), "")
            || "image";
          const maskFilename = normalizedBaseName + "-selected-region-mask.png";
          const maskFile = new globalThis.File([maskBlob], maskFilename, { type: "image/png" });
          const maskAttachment = await uploadFilesPageAttachment(maskFile, {
            environmentId,
          });
          return maskAttachment
            ? {
                ...maskAttachment,
                hiddenFromTurnDisplay: true,
                runnerAttachmentRole: "image_edit_mask",
              }
            : null;
        }

        function buildImageSelectionInpaintPrompt(entry, maskAttachment) {
          const maskFilename = String(maskAttachment?.filename || maskAttachment?.name || "selected-region-mask.png").trim();
          const sourcePath = normalizeHistoryPath(entry?.path || "");
          return [
            "<system>",
            "The user painted a selected region on the source image before submitting this prompt.",
            "Treat the request as an image editing/inpainting task and use the Image Generation skill.",
            "Use the source image with --input and the selected-region mask with --mask.",
            "Source image filename: " + String(entry?.name || "image").trim(),
            sourcePath ? "Source image workspace path: /workspace/" + sourcePath : "",
            maskFilename ? "Mask attachment filename: " + maskFilename : "",
            maskFilename ? "The mask attachment is available in the thread attachments alongside the source image." : "",
            "The mask is an OpenAI edit mask: transparent pixels mark exactly the selected area to change, and opaque pixels must be preserved.",
            "Only change the masked region. Preserve everything outside the selected region unless the user explicitly asks otherwise.",
            "</system>",
          ].filter(Boolean).join("\\n");
        }

        function createImageCanvasBlob(canvas, type, quality) {
          return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error("Failed to create cropped image."));
                return;
              }
              resolve(blob);
            }, type, quality);
          });
        }

        function loadImageElementFromBlob(blob) {
          return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(blob);
            const image = new Image();
            image.onload = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(image);
            };
            image.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              reject(new Error("Failed to load image for cropping."));
            };
            image.src = objectUrl;
          });
        }

        async function createCroppedImageBlob(sourceBlob, cropRect, entry) {
          const rect = {
            x: Math.max(0, Math.round(Number(cropRect?.x || 0))),
            y: Math.max(0, Math.round(Number(cropRect?.y || 0))),
            width: Math.max(1, Math.round(Number(cropRect?.width || 0))),
            height: Math.max(1, Math.round(Number(cropRect?.height || 0))),
          };
          const imageSource = typeof createImageBitmap === "function"
            ? await createImageBitmap(sourceBlob)
            : await loadImageElementFromBlob(sourceBlob);
          const sourceWidth = Math.max(1, Number(imageSource?.width || imageSource?.naturalWidth || imageMaskImageSize?.width || rect.width));
          const sourceHeight = Math.max(1, Number(imageSource?.height || imageSource?.naturalHeight || imageMaskImageSize?.height || rect.height));
          const safeX = Math.max(0, Math.min(sourceWidth - 1, rect.x));
          const safeY = Math.max(0, Math.min(sourceHeight - 1, rect.y));
          const safeRect = {
            x: safeX,
            y: safeY,
            width: Math.max(1, Math.min(rect.width, sourceWidth - safeX)),
            height: Math.max(1, Math.min(rect.height, sourceHeight - safeY)),
          };
          const canvas = document.createElement("canvas");
          canvas.width = safeRect.width;
          canvas.height = safeRect.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Image crop canvas is unavailable.");
          }
          ctx.drawImage(
            imageSource,
            safeRect.x,
            safeRect.y,
            safeRect.width,
            safeRect.height,
            0,
            0,
            safeRect.width,
            safeRect.height
          );
          if (typeof imageSource?.close === "function") {
            imageSource.close();
          }
          const sourceType = String(sourceBlob?.type || getPlaygroundPreviewMimeType(entry) || "").toLowerCase();
          const outputType = ["image/jpeg", "image/png", "image/webp"].includes(sourceType) ? sourceType : "image/png";
          return createImageCanvasBlob(canvas, outputType, outputType === "image/jpeg" || outputType === "image/webp" ? 0.92 : undefined);
        }

        async function getImageCropSourceBlob() {
          if (activeImageCropHistoryEntry?.blob) {
            return activeImageCropHistoryEntry.blob;
          }
          if (!singleSelectedEntryDownloadUrl) {
            throw new Error("No source image is available for cropping.");
          }
          const response = await fetch(singleSelectedEntryDownloadUrl, {
            method: "GET",
            headers: requestHeaders,
            cache: "no-store",
          });
          if (!response.ok) {
            throw new Error("Failed to load image for cropping (" + response.status + ").");
          }
          return response.blob();
        }

        async function applyImageCropToActivePreview() {
          if (!activePreviewEntry || activePreviewEntry.isFolder || !selectedEnvironmentId || !singleSelectedEntryDownloadUrl || !imageCropRect || isCroppingImage || isSavingImageCrop) {
            return;
          }
          setIsCroppingImage(true);
          setActionError("");

          try {
            const sourceBlob = await getImageCropSourceBlob();
            const croppedBlob = await createCroppedImageBlob(sourceBlob, imageCropRect, activePreviewEntry);
            const croppedUrl = URL.createObjectURL(croppedBlob);
            const nextIndex = imageCropHistoryIndex + 1;
            setImageCropHistory((current) => {
              const kept = current.slice(0, imageCropHistoryIndex);
              revokeImageCropHistoryEntries(current.slice(imageCropHistoryIndex));
              return [
                ...kept,
                {
                  blob: croppedBlob,
                  url: croppedUrl,
                  width: Math.round(Number(imageCropRect.width || 0)),
                  height: Math.round(Number(imageCropRect.height || 0)),
                },
              ];
            });
            setImageCropHistoryIndex(nextIndex);
            setImageCropRect(null);
            setImageCropDraftRect(null);
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to crop image.");
          } finally {
            setIsCroppingImage(false);
          }
        }

        useEffect(() => {
          if (!isImageCropMode || !imageCropRect || isCroppingImage || isSavingImageCrop) {
            return;
          }

          function handleImageCropEnterKey(event) {
            if (event.key !== "Enter" || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey || event.repeat || event.isComposing) {
              return;
            }
            const target = event.target;
            const editableTarget = target instanceof HTMLElement
              && (
                target.tagName === "INPUT"
                || target.tagName === "TEXTAREA"
                || target.tagName === "SELECT"
                || target.isContentEditable
              );
            if (editableTarget) {
              return;
            }
            event.preventDefault();
            void applyImageCropToActivePreview();
          }

          window.addEventListener("keydown", handleImageCropEnterKey);
          return () => window.removeEventListener("keydown", handleImageCropEnterKey);
        }, [imageCropRect, isCroppingImage, isImageCropMode, isSavingImageCrop]);

        async function saveImageCropToActivePreview() {
          if (!activePreviewEntry || activePreviewEntry.isFolder || !selectedEnvironmentId || !activeImageCropHistoryEntry?.blob || isCroppingImage || isSavingImageCrop) {
            return;
          }
          setIsSavingImageCrop(true);
          setActionError("");

          try {
            const croppedBlob = activeImageCropHistoryEntry.blob;
            const parentPath = getPlaygroundEntryParentPath(activePreviewEntry.path);
            const formData = new FormData();
            formData.append("file", croppedBlob, activePreviewEntry.name || "image.png");
            formData.append("path", parentPath);
            const uploadResponse = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(selectedEnvironmentId) + "/files/upload",
              {
                method: "POST",
                headers: requestHeaders,
                body: formData,
              }
            );
            const uploadData = await uploadResponse.json().catch(() => ({}));
            if (!uploadResponse.ok) {
              throw new Error(uploadData?.message || uploadData?.error || "Failed to save cropped image.");
            }
            await refreshEnvironmentFolders(selectedEnvironmentId, [parentPath]);
            resetImageCropMode();
            setIsPreviewOpen(true);
            setPreviewTargetPath(activePreviewEntry.path);
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to save cropped image.");
            setIsSavingImageCrop(false);
          }
        }

        function undoImageCropHistory() {
          setImageCropHistoryIndex((current) => Math.max(0, current - 1));
          setImageCropRect(null);
          setImageCropDraftRect(null);
          imageCropStartPointRef.current = null;
          imageCropDraftRectRef.current = null;
          imageCropDragStateRef.current = null;
        }

        function redoImageCropHistory() {
          setImageCropHistoryIndex((current) => Math.min(imageCropHistory.length, current + 1));
          setImageCropRect(null);
          setImageCropDraftRect(null);
          imageCropStartPointRef.current = null;
          imageCropDraftRectRef.current = null;
          imageCropDragStateRef.current = null;
        }

        async function handleStartChatForEntries(entriesToAttach) {
          const fileEntries = (Array.isArray(entriesToAttach) ? entriesToAttach : [])
            .filter((entry) => entry && !entry.isFolder);
          if (!fileEntries.length || !selectedEnvironmentId || typeof onThreadOpen !== "function") {
            return;
          }

          closeContextMenu();
          setActionError("");

          try {
            const attachments = [];
            for (const entry of fileEntries) {
              attachments.push(await buildThreadAttachmentForFileEntry(entry));
            }
            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            if (apiKey) {
              headers.set("X-API-Key", apiKey);
            }
            const title = fileEntries.length === 1
              ? "Chat with " + (fileEntries[0]?.name || "file")
              : "Chat with " + fileEntries.length + " files";
            const response = await fetch(backendUrl + "/threads", {
              method: "POST",
              headers,
              body: JSON.stringify({
                title,
                appId: "runner-web-sdk-demo",
                environmentId: selectedEnvironmentId,
                ...(agentId ? { agentId } : {}),
                attachments,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start chat.");
            }
            const threadRecord = data?.thread && typeof data.thread === "object" ? data.thread : data?.data || data;
            const threadId = String(threadRecord?.id || data?.id || "").trim();
            if (!threadId) {
              throw new Error("Thread creation succeeded but no thread id was returned.");
            }
            onThreadOpen(threadId, threadRecord?.id ? { threadRecord } : {});
          } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to start chat.");
          }
        }

        async function generateFilesPageThreadTitle(threadId, prompt) {
          const normalizedThreadId = String(threadId || "").trim();
          const normalizedPrompt = String(prompt || "").trim();
          const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
          if (!normalizedThreadId || !normalizedPrompt || !normalizedBackendUrl) {
            return "";
          }

          const headers = new Headers(requestHeaders || {});
          headers.set("Content-Type", "application/json");
          if (apiKey) {
            headers.set("X-API-Key", apiKey);
          }

          const response = await fetch(
            normalizedBackendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/generate-title",
            {
              method: "POST",
              headers,
              body: JSON.stringify({ message: normalizedPrompt }),
            }
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to generate thread title.");
          }

          const generatedTitle =
            String(data?.thread?.title || "").trim()
            || String(data?.title || "").trim();
          return generatedTitle;
        }

        async function handleFilePreviewExternalRunRequest(entry, runRequest, sourceEnvironmentId = selectedEnvironmentId) {
          const normalizedThreadId = String(runRequest?.threadId || "").trim();
          const normalizedPrompt = String(runRequest?.prompt || runRequest?.displayPrompt || "").trim();
          const normalizedRunEnvironmentId = String(runRequest?.environmentId || selectedEnvironmentId || "").trim();
          const normalizedSourceEnvironmentId = String(sourceEnvironmentId || selectedEnvironmentId || "").trim();
          if (!entry || entry.isFolder || !normalizedThreadId || !normalizedPrompt || !normalizedSourceEnvironmentId) {
            return;
          }
          if (typeof onThreadStarted !== "function" && typeof onThreadOpen !== "function") {
            return;
          }

          setIsStartingImagePreviewThread(true);
          setActionError("");

          let didRequestNavigation = false;
          try {
            const attachment = await buildThreadAttachmentForFileEntry(entry, {
              environmentId: normalizedSourceEnvironmentId,
            });
            const isImagePreviewRequest = getPlaygroundFileKind(entry) === "image";
            const maskAttachment = isImagePreviewRequest
              ? await buildImageSelectionMaskAttachment(entry, normalizedSourceEnvironmentId)
              : null;
            const selectionPrompt = maskAttachment
              ? buildImageSelectionInpaintPrompt(entry, maskAttachment)
              : "";
            const executionPrompt = selectionPrompt
              ? selectionPrompt + "\\n\\n" + (runRequest?.prompt || normalizedPrompt)
              : (runRequest?.prompt || normalizedPrompt);
            const displayPrompt = runRequest?.displayPrompt || normalizedPrompt;
            const fallbackThreadTitle = "Chat with " + (String(entry?.name || "").trim() || "file");
            const generatedThreadRecord = {
              id: normalizedThreadId,
              title: fallbackThreadTitle,
              updatedAt: new Date().toISOString(),
            };
            const previewAttachment = buildPlaygroundThreadPreviewAttachment(
              backendUrl,
              normalizedSourceEnvironmentId,
              normalizeHistoryPath(entry.path || "")
            );
            if (typeof onFileChatThreadMutated === "function") {
              onFileChatThreadMutated();
            }
            if (typeof onThreadStarted === "function") {
              didRequestNavigation = true;
              onThreadStarted(normalizedThreadId, {
                threadRecord: generatedThreadRecord,
                taskRunRequest: {
                  ...runRequest,
                  token: runRequest?.token || ("image-preview:" + Date.now().toString(36) + Math.random().toString(36).slice(2)),
                  threadId: normalizedThreadId,
                  prompt: executionPrompt,
                  displayPrompt,
                  agentId: runRequest?.agentId || agentId || null,
                  attachments: [
                    ...(Array.isArray(runRequest?.attachments) ? runRequest.attachments : []),
                    attachment,
                    ...(maskAttachment ? [maskAttachment] : []),
                  ],
                  environmentId: normalizedRunEnvironmentId,
                  executionStarted: false,
                },
                documentPreviewAttachment: previewAttachment || attachment,
                documentPreviewToken: "file-preview:" + normalizedThreadId + ":" + normalizeHistoryPath(entry.path || ""),
              });
            } else {
              didRequestNavigation = true;
              onThreadOpen(normalizedThreadId, {
                ...(generatedThreadRecord ? { threadRecord: generatedThreadRecord } : {}),
                documentPreviewAttachment: previewAttachment || attachment,
                documentPreviewToken: "file-preview:" + normalizedThreadId + ":" + normalizeHistoryPath(entry.path || ""),
              });
            }
            void generateFilesPageThreadTitle(normalizedThreadId, displayPrompt)
              .then((generatedTitle) => {
                if (generatedTitle && typeof onFileChatThreadMutated === "function") {
                  onFileChatThreadMutated();
                }
              })
              .catch((titleError) => {
                console.warn("[PlaygroundFilesPage] Failed to generate file chat title", titleError);
              });
            if (maskAttachment) {
              resetImageSelectionMode();
            }
          } catch (error) {
            didRequestNavigation = false;
            setActionError(error instanceof Error ? error.message : "Failed to start file chat.");
          } finally {
            if (didRequestNavigation && typeof window !== "undefined") {
              window.setTimeout(() => setIsStartingImagePreviewThread(false), 10000);
            } else {
              setIsStartingImagePreviewThread(false);
            }
          }
        }
`;
