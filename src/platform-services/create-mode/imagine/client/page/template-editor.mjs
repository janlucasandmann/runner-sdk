export const IMAGINE_PAGE_TEMPLATE_EDITOR_SCRIPT = String.raw`          const updateTemplateDraft = useCallback((field, value) => {
            setTemplateDraft((current) => ({
              ...current,
              [field]: value,
            }));
            setTemplateFormError("");
          }, []);

          const applyTemplateMarkdownSelection = useCallback((field, textareaRef, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) => {
            setTemplateDraft((current) => ({
              ...current,
              [field]: nextValue,
            }));
            setTemplateFormError("");
            window.requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            });
          }, []);

          const buildWrappedTemplateMarkdownEdit = useCallback((value, selectionStart, selectionEnd, prefix, suffix = prefix) => {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            if (safeStart !== safeEnd) {
              if (
                selectedText.startsWith(prefix)
                && selectedText.endsWith(suffix)
                && selectedText.length >= prefix.length + suffix.length
              ) {
                const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
                const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
                return {
                  value: nextValue,
                  selectionStart: safeStart,
                  selectionEnd: safeStart + unwrappedText.length,
                };
              }
              const wrappedText = prefix + selectedText + suffix;
              const nextValue = value.slice(0, safeStart) + wrappedText + value.slice(safeEnd);
              return {
                value: nextValue,
                selectionStart: safeStart + prefix.length,
                selectionEnd: safeStart + prefix.length + selectedText.length,
              };
            }
            const insertedText = prefix + suffix;
            const nextValue = value.slice(0, safeStart) + insertedText + value.slice(safeEnd);
            return {
              value: nextValue,
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length,
            };
          }, []);

          const buildTemplateMarkdownListEdit = useCallback((value, selectionStart, selectionEnd) => {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\\n", safeEnd);
            if (lineEnd === -1) {
              lineEnd = value.length;
            }
            const block = value.slice(lineStart, lineEnd);
            const lines = block.split("\\n");
            const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^(\\s*)-\\s+/.test(line));
            const nextLines = lines.map((line) => {
              if (!line.trim()) {
                return shouldRemoveList ? line : "- ";
              }
              if (shouldRemoveList) {
                return line.replace(/^(\\s*)-\\s+/, "$1");
              }
              if (/^(\\s*)-\\s+/.test(line)) {
                return line;
              }
              return line.replace(/^(\\s*)/, "$1- ");
            });
            const nextBlock = nextLines.join("\\n");
            const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
            const collapsedSelection = safeStart === safeEnd;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - 2)
              : safeStart - lineStart + 2;
            return {
              value: nextValue,
              selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
              selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
            };
          }, []);

          const handleTemplateMarkdownFormat = useCallback((field, textareaRef, formatType) => {
            const textarea = textareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(templateDraft?.[field] || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;

            if (formatType === "bold") {
              edit = buildWrappedTemplateMarkdownEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedTemplateMarkdownEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedTemplateMarkdownEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildTemplateMarkdownListEdit(value, selectionStart, selectionEnd);
            }

            if (!edit) {
              return;
            }

            applyTemplateMarkdownSelection(field, textareaRef, edit.value, edit.selectionStart, edit.selectionEnd);
          }, [applyTemplateMarkdownSelection, buildTemplateMarkdownListEdit, buildWrappedTemplateMarkdownEdit, templateDraft]);

          const inferTemplateAssetType = useCallback((file) => {
            const mimeType = String(file?.type || "").toLowerCase();
            const fileName = String(file?.name || "").toLowerCase();
            if (mimeType.startsWith("image/") || /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(fileName)) {
              return "image";
            }
            if (mimeType.startsWith("video/") || /\.(m4v|mkv|mov|mp4|webm)$/i.test(fileName)) {
              return "video";
            }
            return "";
          }, []);

          const inferTemplateAssetMimeType = useCallback((fileName, fallbackType = "") => {
            const normalizedFallback = String(fallbackType || "").trim();
            if (normalizedFallback) {
              return normalizedFallback;
            }
            const normalizedFileName = String(fileName || "").toLowerCase();
            if (normalizedFileName.endsWith(".avif")) return "image/avif";
            if (normalizedFileName.endsWith(".gif")) return "image/gif";
            if (normalizedFileName.endsWith(".jpg") || normalizedFileName.endsWith(".jpeg")) return "image/jpeg";
            if (normalizedFileName.endsWith(".png")) return "image/png";
            if (normalizedFileName.endsWith(".svg")) return "image/svg+xml";
            if (normalizedFileName.endsWith(".webp")) return "image/webp";
            if (normalizedFileName.endsWith(".webm")) return "video/webm";
            if (normalizedFileName.endsWith(".mov")) return "video/quicktime";
            if (normalizedFileName.endsWith(".m4v")) return "video/x-m4v";
            if (normalizedFileName.endsWith(".mkv")) return "video/x-matroska";
            if (normalizedFileName.endsWith(".mp4")) return "video/mp4";
            return "";
          }, []);

          const buildTemplateDraftAssetPatch = useCallback((assets) => {
            const normalizedAssets = (Array.isArray(assets) ? assets : [])
              .filter((asset) => asset && asset.url)
              .map((asset, index) => ({
                id: String(asset.id || ("template-asset-" + Date.now().toString(36) + "-" + index + "-" + Math.random().toString(36).slice(2, 8))),
                type: asset.type === "video" ? "video" : "image",
                url: String(asset.url || ""),
                title: String(asset.title || asset.fileName || ("Reference asset " + (index + 1))).trim(),
                fileName: String(asset.fileName || asset.title || ("reference-asset-" + (index + 1))).trim(),
                mimeType: String(asset.mimeType || ""),
                aspectRatio: String(asset.aspectRatio || "").trim(),
                size: Number(asset.size || 0) || 0,
                durationSeconds: Number(asset.durationSeconds || 0) || 0,
              }));
            const firstAsset = normalizedAssets[0] || null;
            const firstImageAsset = normalizedAssets.find((asset) => asset.type === "image") || null;
            const firstVideoAsset = normalizedAssets.find((asset) => asset.type === "video") || null;
            return {
              assets: normalizedAssets,
              imageUrl: firstAsset?.type === "image" ? firstAsset.url : "",
              videoUrl: firstAsset?.type === "video" ? firstAsset.url : "",
              aspectRatio: firstAsset?.aspectRatio || firstImageAsset?.aspectRatio || firstVideoAsset?.aspectRatio || "4 / 3",
            };
          }, []);

          const readTemplateAssetFile = useCallback((file) => new Promise((resolve, reject) => {
            const assetType = inferTemplateAssetType(file);
            if (!assetType) {
              reject(new Error("Choose image or video files to create a template."));
              return;
            }
            const fileName = String(file?.name || (assetType === "video" ? "reference-video" : "reference-image")).trim();
            const mimeType = inferTemplateAssetMimeType(fileName, file?.type);
            const reader = new FileReader();
            const resolveAsset = (url, aspectRatio, extra = {}) => {
              resolve({
                id: "template-asset-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
                type: assetType,
                url,
                title: fileName,
                fileName,
                mimeType,
                aspectRatio,
                size: Number(file?.size || 0) || 0,
                ...extra,
              });
            };
            reader.onload = () => {
              const assetUrl = String(reader.result || "");
              if (!assetUrl) {
                reject(new Error("Could not read that file."));
                return;
              }
              if (assetType === "video") {
                const video = document.createElement("video");
                video.preload = "metadata";
                video.muted = true;
                video.playsInline = true;
                video.onloadedmetadata = () => {
                  const width = video.videoWidth || 16;
                  const height = video.videoHeight || 9;
                  resolveAsset(assetUrl, width + " / " + height, {
                    durationSeconds: Number(video.duration || 0) || 0,
                  });
                };
                video.onerror = () => {
                  resolveAsset(assetUrl, "16 / 9");
                };
                video.src = assetUrl;
                return;
              }
              const image = new Image();
              image.onload = () => {
                const width = image.naturalWidth || 4;
                const height = image.naturalHeight || 3;
                resolveAsset(assetUrl, width + " / " + height);
              };
              image.onerror = () => {
                resolveAsset(assetUrl, "4 / 3");
              };
              image.src = assetUrl;
            };
            reader.onerror = () => {
              reject(new Error("Could not read that file."));
            };
            reader.readAsDataURL(file);
          }), [inferTemplateAssetMimeType, inferTemplateAssetType]);

          const handleTemplateAssetFiles = useCallback((fileList, options = {}) => {
            const files = Array.from(fileList || []).filter(Boolean);
            const supportedFiles = files.filter((file) => inferTemplateAssetType(file));
            if (!supportedFiles.length) {
              setTemplateFormError("Choose image or video files to create a template.");
              return Promise.resolve([]);
            }
            return Promise.all(supportedFiles.map((file) => readTemplateAssetFile(file)))
              .then((nextAssets) => {
                setTemplateDraft((current) => {
                  const currentAssets = options.replace ? [] : (Array.isArray(current.assets) ? current.assets : []);
                  return {
                    ...current,
                    ...buildTemplateDraftAssetPatch(currentAssets.concat(nextAssets)),
                  };
                });
                setTemplateFormError("");
                return nextAssets;
              })
              .catch((error) => {
                const message = error instanceof Error ? error.message : String(error || "Could not read those files.");
                setTemplateFormError(message);
                return [];
              });
          }, [buildTemplateDraftAssetPatch, inferTemplateAssetType, readTemplateAssetFile]);

          const removeTemplateAssetAtIndex = useCallback((assetIndex) => {
            const normalizedIndex = Number(assetIndex);
            setTemplateDraft((current) => {
              const currentAssets = Array.isArray(current.assets) ? current.assets : [];
              return {
                ...current,
                ...buildTemplateDraftAssetPatch(currentAssets.filter((_asset, index) => index !== normalizedIndex)),
              };
            });
            setTemplateFormError("");
          }, [buildTemplateDraftAssetPatch]);

          const openCreateReferenceFileBrowser = useCallback(() => {
            setTemplateFormError("");
            setCreateReferenceImportState({ status: "idle", error: "" });
            setCreateReferenceFileBrowserRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              source: "workspace",
            });
          }, []);

          const buildCreateReferenceDownloadUrl = useCallback((fileId) => {
            const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
            const normalizedEnvironmentId = String(createReferenceEnvironmentIdRef.current || environmentId || "").trim();
            let normalizedPath = String(fileId || "").trim().replace(/^\/+/, "");
            if (normalizedPath.startsWith("workspace/")) {
              normalizedPath = normalizedPath.slice("workspace/".length);
            }
            if (!normalizedBackendUrl || !normalizedEnvironmentId || !normalizedPath) {
              return "";
            }
            const encodedPath = normalizedPath
              .split("/")
              .filter(Boolean)
              .map((segment) => encodeURIComponent(segment))
              .join("/");
            return normalizedBackendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/files/download/" + encodedPath;
          }, [backendUrl, environmentId]);

          const importCreateReferenceWorkspaceFiles = useCallback(async (fileIds) => {
            const normalizedFileIds = (Array.isArray(fileIds) ? fileIds : [fileIds])
              .map((fileId) => String(fileId || "").trim())
              .filter(Boolean);
            if (!normalizedFileIds.length) {
              return;
            }
            const firstDownloadUrl = buildCreateReferenceDownloadUrl(normalizedFileIds[0]);
            if (!firstDownloadUrl) {
              const message = "Select a computer before choosing reference assets.";
              setCreateReferenceImportState({ status: "error", error: message });
              setTemplateFormError(message);
              return;
            }
            setCreateReferenceImportState({ status: "loading", error: "" });
            try {
              const importedFiles = [];
              for (const normalizedFileId of normalizedFileIds) {
                const downloadUrl = buildCreateReferenceDownloadUrl(normalizedFileId);
                if (!downloadUrl) {
                  continue;
                }
                const headers = new Headers(requestHeaders || undefined);
                const normalizedApiKey = String(apiKey || "").trim();
                if (normalizedApiKey && !headers.has("Authorization")) {
                  headers.set("Authorization", "Bearer " + normalizedApiKey);
                }
                if (normalizedApiKey && !headers.has("x-api-key")) {
                  headers.set("x-api-key", normalizedApiKey);
                }
                const response = await fetch(downloadUrl, { method: "GET", headers });
                if (!response.ok) {
                  throw new Error("Could not load that file from Computer Agents files.");
                }
                const blob = await response.blob();
                const fileName = normalizedFileId.split("/").filter(Boolean).pop() || "reference-asset";
                const mimeType = inferTemplateAssetMimeType(fileName, blob.type);
                const fileShape = {
                  name: fileName,
                  type: mimeType,
                  size: blob.size,
                };
                if (!inferTemplateAssetType(fileShape)) {
                  throw new Error("Choose image or video files to create a template.");
                }
                const BrowserFile = globalThis.File;
                if (typeof BrowserFile === "function") {
                  importedFiles.push(new BrowserFile([blob], fileName, { type: mimeType || blob.type || "application/octet-stream" }));
                } else {
                  try {
                    Object.defineProperty(blob, "name", { value: fileName, configurable: true });
                  } catch (_error) {
                    blob.name = fileName;
                  }
                  importedFiles.push(blob);
                }
              }
              await handleTemplateAssetFiles(importedFiles);
              setCreateReferenceImportState({ status: "idle", error: "" });
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error || "Could not import those assets.");
              setCreateReferenceImportState({ status: "error", error: message });
              setTemplateFormError(message);
            }
          }, [apiKey, buildCreateReferenceDownloadUrl, handleTemplateAssetFiles, inferTemplateAssetMimeType, inferTemplateAssetType, requestHeaders]);

          const handleCreateReferenceWorkspaceAttach = useCallback((fileIds) => {
            const normalizedFileIds = (Array.isArray(fileIds) ? fileIds : [fileIds])
              .map((fileId) => String(fileId || "").trim())
              .filter(Boolean);
            if (!normalizedFileIds.length) {
              return;
            }
            void importCreateReferenceWorkspaceFiles(normalizedFileIds);
          }, [importCreateReferenceWorkspaceFiles]);

          const handleCreateReferenceEnvironmentChange = useCallback((nextEnvironmentId) => {
            createReferenceEnvironmentIdRef.current = String(nextEnvironmentId || "");
            if (typeof onEnvironmentChange === "function") {
              onEnvironmentChange(nextEnvironmentId);
            }
          }, [onEnvironmentChange]);

          const resetTemplateDraft = useCallback(() => {
            setTemplateDraft({
              title: "",
              description: "",
              prompt: "",
              assets: [],
              imageUrl: "",
              videoUrl: "",
              aspectRatio: "4 / 3",
              defaultAspectRatio: "",
              defaultStyles: ["professional"],
            });
            setEditingTemplateId("");
            setTemplateFormError("");
            setCreateAspectRatioSelectorOpen(false);
            setCreateStylePickerOpen(false);
          }, []);

          const handleCreateTemplateSubmit = useCallback((event) => {
            event.preventDefault();
            const title = String(templateDraft.title || "").trim();
            const description = String(templateDraft.description || "").trim();
            const prompt = String(templateDraft.prompt || "").trim();
            if (!title) {
              setTemplateFormError("Add a template name.");
              return;
            }
            if (!description) {
              setTemplateFormError("Add a short description.");
              return;
            }
            const draftAssets = Array.isArray(templateDraft.assets)
              ? templateDraft.assets.filter((asset) => asset && asset.url)
              : [];
            if (!draftAssets.length) {
              setTemplateFormError("Upload at least one reference image or video.");
              return;
            }
            const firstAsset = draftAssets[0] || null;
            const firstImageAsset = draftAssets.find((asset) => asset.type === "image") || null;
            const firstVideoAsset = draftAssets.find((asset) => asset.type === "video") || null;
            const id = editingTemplateId || ("custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8));
            const nextTemplate = {
              id,
              title,
              description,
              prompt: prompt || ("Create in the same style as the " + title + " template."),
              placeholder: title,
              defaultStyles: Array.isArray(templateDraft.defaultStyles) && templateDraft.defaultStyles.length
                ? templateDraft.defaultStyles
                : ["professional"],
              defaultAspectRatio: String(templateDraft.defaultAspectRatio || "").trim(),
              assets: draftAssets,
              imageUrl: firstAsset?.type === "image" ? firstAsset.url : (firstImageAsset?.url || ""),
              videoUrl: firstAsset?.type === "video" ? firstAsset.url : (firstVideoAsset?.url || ""),
              mediaType: firstAsset?.type === "video" ? "video" : "image",
              tone: firstAsset?.type === "image"
                ? "url('" + firstAsset.url + "') center / cover no-repeat"
                : "linear-gradient(135deg, rgba(102, 166, 255, 0.2), rgba(255, 255, 255, 0.06))",
              aspectRatio: firstAsset?.aspectRatio || templateDraft.aspectRatio || "4 / 3",
              size: "custom",
              isCustom: true,
            };
            setCustomTemplates((current) => {
              if (!editingTemplateId) {
                return [nextTemplate].concat(current);
              }
              return current.map((template) => template.id === editingTemplateId ? nextTemplate : template);
            });
            resetTemplateDraft();
            setSelectedTemplateId(id);
            setActiveImagineTab("my-templates");
          }, [editingTemplateId, resetTemplateDraft, setActiveImagineTab, templateDraft]);

          const handleStartCustomTemplate = useCallback(() => {
            resetTemplateDraft();
            setSelectedTemplateId("");
            setActiveImagineTab("create-template");
          }, [resetTemplateDraft, setActiveImagineTab]);

          const handleEditCustomTemplate = useCallback((template) => {
            if (!template?.isCustom) {
              return;
            }
            setEditingTemplateId(template.id);
            const templateAssets = normalizePlaygroundImagineTemplateAssets(template);
            const firstAsset = templateAssets[0] || null;
            setTemplateDraft({
              title: String(template.title || ""),
              description: String(template.description || ""),
              prompt: String(template.prompt || ""),
              assets: templateAssets,
              imageUrl: firstAsset?.type === "image" ? firstAsset.url : "",
              videoUrl: firstAsset?.type === "video" ? firstAsset.url : "",
              aspectRatio: String(firstAsset?.aspectRatio || template.aspectRatio || "4 / 3"),
              defaultAspectRatio: String(template.defaultAspectRatio || ""),
              defaultStyles: Array.isArray(template.defaultStyles) && template.defaultStyles.length
                ? template.defaultStyles
                : ["professional"],
            });
            setTemplateFormError("");
            setCreateAspectRatioSelectorOpen(false);
            setCreateStylePickerOpen(false);
            setSelectedTemplateId("");
            setActiveImagineTab("create-template");
          }, [setActiveImagineTab]);

          const handleToggleFavouriteTemplate = useCallback((templateId) => {
            const normalizedTemplateId = String(templateId || "").trim();
            if (!normalizedTemplateId) {
              return;
            }
            setFavouriteTemplateIds((current) => {
              const currentIds = Array.isArray(current)
                ? current.map((id) => String(id || "").trim()).filter(Boolean)
                : [];
              return currentIds.includes(normalizedTemplateId)
                ? currentIds.filter((id) => id !== normalizedTemplateId)
                : currentIds.concat(normalizedTemplateId);
            });
          }, []);

          const handleDeleteCustomTemplate = useCallback((template) => {
            if (!template?.isCustom) {
              return;
            }
            const templateTitle = String(template.title || "this template").trim() || "this template";
            if (typeof window !== "undefined" && !window.confirm("Delete " + templateTitle + "?")) {
              return;
            }
            setCustomTemplates((current) => current.filter((item) => item.id !== template.id));
            setFavouriteTemplateIds((current) => (
              Array.isArray(current) ? current.filter((id) => id !== template.id) : []
            ));
            if (selectedTemplateId === template.id) {
              setSelectedTemplateId("");
            }
            if (editingTemplateId === template.id) {
              resetTemplateDraft();
            }
            setActiveImagineTab("my-templates");
          }, [editingTemplateId, resetTemplateDraft, selectedTemplateId, setActiveImagineTab]);

          const handleCreateAspectRatioSelect = useCallback((nextAspectRatio) => {
            updateTemplateDraft("defaultAspectRatio", String(nextAspectRatio || "").trim());
            setCreateAspectRatioSelectorOpen(false);
          }, [updateTemplateDraft]);

          const toggleCreateStyleOption = useCallback((styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setTemplateDraft((current) => {
              const currentStyles = Array.isArray(current.defaultStyles)
                ? current.defaultStyles.map((id) => String(id || "").trim()).filter(Boolean)
                : [];
              return {
                ...current,
                defaultStyles: currentStyles.includes(normalizedStyleId)
                  ? currentStyles.filter((id) => id !== normalizedStyleId)
                  : currentStyles.concat(normalizedStyleId),
              };
            });
            setTemplateFormError("");
          }, []);

          const removeCreateStyleOption = useCallback((styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setTemplateDraft((current) => ({
              ...current,
              defaultStyles: Array.isArray(current.defaultStyles)
                ? current.defaultStyles.filter((id) => id !== normalizedStyleId)
                : [],
            }));
            setTemplateFormError("");
          }, []);

          const renderCreateAspectRatioSelector = () => React.createElement("section", { className: "playground-imagine-template-aspect-row" },
            React.createElement("div", { className: "playground-imagine-template-row-title" }, "Default aspect ratio"),
            React.createElement("div", {
              ref: createAspectRatioSelectorRef,
              className: "playground-imagine-template-aspect-select playground-tasks-toolbar-popup-shell",
            },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-imagine-template-aspect-button" + (templateDraft.defaultAspectRatio ? "" : " is-empty"),
                onClick: () => setCreateAspectRatioSelectorOpen((current) => !current),
              },
                React.createElement("span", null, selectedCreateAspectRatioOption.label),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              createAspectRatioSelectorOpen
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-imagine-template-aspect-menu" },
                    aspectRatioOptions.map((option) => React.createElement("button", {
                      key: "create-aspect:" + (option.value || "none"),
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (templateDraft.defaultAspectRatio === option.value ? " selected" : ""),
                      onClick: () => handleCreateAspectRatioSelect(option.value),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        templateDraft.defaultAspectRatio === option.value
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, option.label),
                        React.createElement("span", null, option.description)
                      )
                    ))
                  )
                : null
            )
          );

          const renderCreateStylePicker = () => React.createElement("section", { ref: createStylePickerRef, className: "playground-imagine-template-style-picker" },
            React.createElement("div", { className: "playground-imagine-template-style-picker-header" },
              React.createElement("div", { className: "playground-imagine-template-section-title" }, "Default Styles"),
              React.createElement("button", {
                type: "button",
                className: "playground-imagine-template-style-manage-button" + (createStylePickerOpen ? " is-active" : ""),
                onClick: () => setCreateStylePickerOpen((current) => !current),
              }, "Manage Styles")
            ),
            React.createElement("div", { className: "playground-imagine-template-style-pill-list" },
              selectedCreateStyleOptions.length
                ? selectedCreateStyleOptions.map((style) => {
                    const StyleIcon = style.Icon || Paintbrush;
                    return React.createElement("span", { key: "create-selected-style:" + style.id, className: "playground-imagine-template-style-pill is-selected" },
                      React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-template-style-pill-remove",
                        "aria-label": "Remove " + style.label,
                        onClick: (event) => {
                          event.stopPropagation();
                          removeCreateStyleOption(style.id);
                        },
                      }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.8 }))
                    );
                  })
                : React.createElement("span", { className: "playground-imagine-template-style-pill is-empty" },
                    React.createElement(Paintbrush, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                    React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, "No style selected")
                  )
            ),
            createStylePickerOpen
              ? React.createElement("div", { className: "playground-imagine-template-style-picker-options" },
                  styleOptions.map((style) => {
                    const StyleIcon = style.Icon || Paintbrush;
                    const isSelected = Array.isArray(templateDraft.defaultStyles) && templateDraft.defaultStyles.includes(style.id);
                    return React.createElement("button", {
                      key: "create-style:" + style.id,
                      type: "button",
                      className: "playground-imagine-template-style-pill" + (isSelected ? " is-selected" : ""),
                      onClick: () => toggleCreateStyleOption(style.id),
                    },
                      React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        isSelected
                          ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                          : null
                      )
                    );
                  })
                )
              : null
          );

          const createMarkdownFormatActions = [
            { id: "bold", label: "Bold", Icon: Bold },
            { id: "italic", label: "Italic", Icon: Italic },
            { id: "underline", label: "Underline", Icon: Underline },
            { id: "list", label: "List", Icon: List },
          ];

          const renderCreateMarkdownSection = ({ title, field, textareaRef, placeholder }) =>
            React.createElement("section", { className: "playground-tasks-detail-description playground-imagine-create-markdown-section" + (field === "description" ? " is-description" : "") },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("h3", { className: "playground-tasks-detail-section-title" }, title),
                React.createElement("div", { className: "playground-tasks-detail-format-actions", "aria-label": title + " formatting" },
                  createMarkdownFormatActions.map((action) =>
                    React.createElement("button", {
                      key: title + ":" + action.id,
                      type: "button",
                      className: "playground-tasks-detail-format-button",
                      "aria-label": action.label,
                      onClick: () => handleTemplateMarkdownFormat(field, textareaRef, action.id),
                    }, React.createElement(action.Icon, { width: 14, height: 14, strokeWidth: 1.75 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing playground-imagine-create-markdown-editor" },
                React.createElement("textarea", {
                  ref: textareaRef,
                  className: "playground-tasks-detail-description-input is-editing playground-imagine-create-markdown-input",
                  value: templateDraft[field],
                  onChange: (event) => updateTemplateDraft(field, event.target.value),
                  placeholder,
                })
              )
            );

          const renderCreateTemplateAssetChip = (asset, index) => {
            const resolvedAsset = asset || {};
            const assetTitle = String(resolvedAsset.title || resolvedAsset.fileName || ("Reference asset " + (index + 1))).trim();
            const isVideoAsset = resolvedAsset.type === "video";
            const assetUrl = String(resolvedAsset.url || "").trim();
            return React.createElement("div", {
              key: resolvedAsset.id || assetTitle + ":" + index,
              className: "runner-attachment " + (isVideoAsset ? "runner-attachment-file" : "runner-attachment-image"),
            },
              isVideoAsset
                ? React.createElement(React.Fragment, null,
                    React.createElement("button", {
                      type: "button",
                      className: "runner-attachment-file-button",
                      tabIndex: -1,
                      "aria-label": assetTitle,
                    },
                      React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                        React.createElement(Film, { strokeWidth: 1.8 })
                      ),
                      React.createElement("div", { className: "runner-attachment-file-name", title: assetTitle }, assetTitle)
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "runner-attachment-remove runner-attachment-remove-file",
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeTemplateAssetAtIndex(index);
                      },
                      "aria-label": "Remove " + assetTitle,
                    }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "runner-attachment-image-frame" },
                      React.createElement("button", {
                        type: "button",
                        className: "runner-attachment-image-button",
                        tabIndex: -1,
                        "aria-label": assetTitle,
                      },
                        assetUrl
                          ? React.createElement("img", {
                              src: assetUrl,
                              alt: "",
                              draggable: false,
                              className: "runner-attachment-image-preview",
                            })
                          : React.createElement(ImageIcon, { className: "runner-attachment-image-preview", strokeWidth: 1.8 })
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "runner-attachment-remove runner-attachment-remove-image",
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeTemplateAssetAtIndex(index);
                      },
                      "aria-label": "Remove " + assetTitle,
                    }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                  )
            );
          };

`;
