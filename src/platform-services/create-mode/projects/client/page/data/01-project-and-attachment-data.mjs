export const PROJECTS_DATA_01_FRAGMENT = `        function buildProjectScopedPath(path, projectId) {
          if (!projectId) return path;
          const connector = path.includes("?") ? "&" : "?";
          return path + connector + "projectId=" + encodeURIComponent(projectId);
        }

        function getPlaygroundProjectSetupRecipe(projectBlueprint) {
          return projectBlueprint?.setupRecipe && typeof projectBlueprint.setupRecipe === "object" && !Array.isArray(projectBlueprint.setupRecipe)
            ? projectBlueprint.setupRecipe
            : {};
        }

        function normalizePlaygroundProjectSetupFolderPath(value) {
          const normalized = String(value || "")
            .trim()
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean)
            .join("/");
          if (!normalized || normalized === "." || normalized.includes("..")) {
            return "";
          }
          return normalized;
        }

        function getPlaygroundProjectSetupFolderPaths(projectBlueprint) {
          const setupRecipe = getPlaygroundProjectSetupRecipe(projectBlueprint);
          const setupFolders = Array.isArray(setupRecipe.initialFolders) ? setupRecipe.initialFolders : [];
          const suggestedFolders = Array.isArray(projectBlueprint?.suggestedFolders) ? projectBlueprint.suggestedFolders : [];
          const seen = new Set();
          return setupFolders
            .concat(suggestedFolders)
            .map(normalizePlaygroundProjectSetupFolderPath)
            .filter((folderPath) => {
              if (!folderPath || seen.has(folderPath)) {
                return false;
              }
              seen.add(folderPath);
              return true;
            });
        }

        function normalizePlaygroundProjectStarterTask(value, index = 0) {
          const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
          const title = typeof value === "string"
            ? value
            : typeof source.title === "string"
              ? source.title
              : typeof source.name === "string"
                ? source.name
                : "";
          const normalizedTitle = normalizePlaygroundEditableTaskTitle(title, "");
          if (!normalizedTitle) {
            return null;
          }
          return {
            title: normalizedTitle,
            description: typeof source.description === "string" ? source.description : "",
            priority: PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === source.priority)
              ? source.priority
              : "medium",
            status: PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === source.status)
              ? source.status
              : "todo",
            taskColor: getPlaygroundTaskColorId(source.taskColor || source.color || PLAYGROUND_TASK_COLOR_OPTIONS[index % PLAYGROUND_TASK_COLOR_OPTIONS.length]?.id),
            sortOrder: Number.isFinite(source.sortOrder) ? Number(source.sortOrder) : Date.now() + index,
          };
        }

        function getPlaygroundProjectStarterTasks(projectBlueprint) {
          const setupRecipe = getPlaygroundProjectSetupRecipe(projectBlueprint);
          const starterTasks = Array.isArray(setupRecipe.starterTasks) ? setupRecipe.starterTasks : [];
          return starterTasks
            .map((task, index) => normalizePlaygroundProjectStarterTask(task, index))
            .filter(Boolean);
        }

        function resolvePlaygroundProjectSetupEnvironmentId(projectRecord, projectEnvironments = []) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const candidates = [
            normalizedProject.defaultEnvironmentId,
            normalizedProject.metadata?.defaultEnvironmentId,
            Array.isArray(projectEnvironments) && projectEnvironments.length > 0 ? projectEnvironments[0]?.id : "",
            backlogComposerEnvironmentId,
            initialEnvironmentId,
          ];
          for (const candidate of candidates) {
            const normalizedCandidate = String(candidate || "").trim();
            if (normalizedCandidate) {
              return normalizedCandidate;
            }
          }
          return "";
        }

        function isPlaygroundProjectSetupAlreadyExistsError(data) {
          const message = String(data?.message || data?.error || "").toLowerCase();
          return message.includes("already") || message.includes("exist") || message.includes("duplicate");
        }

        async function createPlaygroundProjectSetupFolders(environmentId, folderPaths = []) {
          const normalizedEnvironmentId = String(environmentId || "").trim();
          const normalizedFolderPaths = (Array.isArray(folderPaths) ? folderPaths : [])
            .map(normalizePlaygroundProjectSetupFolderPath)
            .filter(Boolean);
          if (!normalizedEnvironmentId || normalizedFolderPaths.length === 0) {
            return [];
          }

          const createdFolders = [];
          for (const folderPath of normalizedFolderPaths) {
            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/files/mkdir", {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  path: folderPath,
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok && !isPlaygroundProjectSetupAlreadyExistsError(data)) {
                throw new Error(data?.message || data?.error || "Failed to create folder.");
              }
              createdFolders.push(folderPath);
            } catch (error) {
              console.warn("[project setup] Failed to create starter folder", {
                environmentId: normalizedEnvironmentId,
                folderPath,
                error,
              });
            }
          }
          return createdFolders;
        }

        async function createPlaygroundProjectSetupTasks(projectRecord, projectBlueprint, environmentId) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const normalizedProjectId = String(normalizedProject.id || "").trim();
          const starterTasks = getPlaygroundProjectStarterTasks(projectBlueprint);
          if (!normalizedProjectId || starterTasks.length === 0) {
            return [];
          }

          const normalizedEnvironmentId = String(environmentId || "").trim();
          const createdTasks = [];
          for (let index = 0; index < starterTasks.length; index += 1) {
            const starterTask = starterTasks[index];
            const taskDraft = normalizePlaygroundTaskRecord({
              id: "",
              projectId: normalizedProjectId,
              title: starterTask.title,
              description: starterTask.description,
              status: starterTask.status,
              priority: starterTask.priority,
              taskColor: starterTask.taskColor,
              environmentId: normalizedEnvironmentId || null,
              sortOrder: starterTask.sortOrder,
              metadata: {
                runnerPlayground: {
                  source: "project_type_setup",
                  setupProfileId: projectBlueprint?.id || "blank",
                  taskColor: starterTask.taskColor,
                  environmentId: normalizedEnvironmentId || undefined,
                },
              },
            });
            const taskPayload = buildTaskUpdatePayload(taskDraft, {
              projectId: normalizedProjectId,
              environmentId: normalizedEnvironmentId || null,
              taskColor: starterTask.taskColor,
            });

            try {
              const response = await fetch(backendUrl + "/tasks", {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(taskPayload),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create task.");
              }
              const createdTask = getPlaygroundTaskResponseRecord(data);
              if (createdTask?.id) {
                createdTasks.push(createdTask);
              }
            } catch (error) {
              console.warn("[project setup] Failed to create starter task", {
                projectId: normalizedProjectId,
                title: starterTask.title,
                error,
              });
            }
          }
          return createdTasks;
        }

        async function applyPlaygroundProjectInitialSetup(projectRecord, projectBlueprint, projectEnvironments = []) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const normalizedProjectId = String(normalizedProject.id || "").trim();
          if (!normalizedProjectId) {
            return {
              folders: [],
              tasks: [],
            };
          }

          const setupEnvironmentId = resolvePlaygroundProjectSetupEnvironmentId(normalizedProject, projectEnvironments);
          const folderPaths = getPlaygroundProjectSetupFolderPaths(projectBlueprint);
          const folders = await createPlaygroundProjectSetupFolders(setupEnvironmentId, folderPaths);
          const tasks = await createPlaygroundProjectSetupTasks(normalizedProject, projectBlueprint, setupEnvironmentId);
          return {
            folders,
            tasks,
          };
        }

        function resetSaveState(message = "") {
          setSaveState({
            isSaving: false,
            error: "",
            message,
          });
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.saveState}
        function rememberTaskAttachmentObjectUrl(url) {
          if (!url || !String(url).startsWith("blob:")) return;
          taskAttachmentObjectUrlsRef.current.add(url);
        }

        function revokeTaskAttachmentObjectUrl(url) {
          if (!url || !taskAttachmentObjectUrlsRef.current.has(url)) return;
          URL.revokeObjectURL(url);
          taskAttachmentObjectUrlsRef.current.delete(url);
        }

        function revokeTaskAttachmentListObjectUrls(items) {
          (Array.isArray(items) ? items : []).forEach((attachment) => {
            revokeTaskAttachmentObjectUrl(attachment?.previewUrl);
            if (attachment?.url && attachment.url !== attachment.previewUrl) {
              revokeTaskAttachmentObjectUrl(attachment.url);
            }
          });
        }

        async function uploadTaskAttachment(file, options = {}) {
          return uploadTaskAttachmentContent({
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            data: await readFileAsBase64(file),
            options,
          });
        }

        async function uploadTaskAttachmentContent({ filename, mimeType, data, options = {} }) {
          const normalizedEnvironmentId = typeof options === "string"
            ? String(options || "").trim()
            : String(options?.environmentId || "").trim();
          const normalizedSourcePath = typeof options === "object" && options?.sourcePath
            ? normalizeHistoryPath(options.sourcePath)
            : "";
          const headers = new Headers(requestHeaders || {});
          headers.set("Content-Type", "application/json");
          const response = await fetch(backendUrl + "/attachments/upload", {
            method: "POST",
            headers,
            body: JSON.stringify({
              filename: filename || "attachment",
              mimeType: mimeType || "application/octet-stream",
              data,
              ...(normalizedEnvironmentId ? { environmentId: normalizedEnvironmentId } : {}),
            }),
          });
          const uploadResult = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(uploadResult?.message || uploadResult?.error || "Failed to upload attachment.");
          }
          const attachment = buildResolvedTaskAttachmentRecord(normalizePlaygroundTaskAttachmentRecord({
            ...(uploadResult?.attachment && typeof uploadResult.attachment === "object" ? uploadResult.attachment : {}),
            url: resolveTaskAttachmentApiUrl(
              uploadResult?.attachment?.url || "",
              uploadResult?.attachment?.id
            ) || (uploadResult?.attachment?.id ? backendUrl + "/attachments/" + encodeURIComponent(uploadResult.attachment.id) : ""),
            environmentId: normalizedEnvironmentId || uploadResult?.attachment?.environmentId || uploadResult?.attachment?.sourceEnvironmentId,
            sourcePath: normalizedSourcePath || uploadResult?.attachment?.sourcePath || uploadResult?.attachment?.workspacePath,
          }));
          if (!attachment) {
            throw new Error("Attachment upload succeeded but the attachment data is missing.");
          }
          return attachment;
        }

        function normalizeTaskConnectorBase64(content) {
          const rawValue = String(content || "");
          const normalizedInput = rawValue.includes("base64,") ? rawValue.slice(rawValue.indexOf("base64,") + "base64,".length) : rawValue;
          const sanitized = normalizedInput.replace(/\\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
          const paddingLength = sanitized.length % 4 === 0 ? 0 : 4 - (sanitized.length % 4);
          return sanitized + "=".repeat(paddingLength);
        }

        function decodeTaskConnectorBase64Text(content) {
          try {
            return atob(normalizeTaskConnectorBase64(content));
          } catch {
            return String(content || "");
          }
        }

        async function uploadTaskConnectorItem(source, item, environmentId) {
          const connectorKey = getPlaygroundTaskConnectorKey(source);
          if (!connectorKey || connectorKey === "notion") {
            throw new Error("This connector does not provide downloadable files.");
          }
          const connectorConfig = taskConnectorConfigByKey[connectorKey];
          if (!connectorConfig?.fetchFileContent) {
            throw new Error("This connector does not support file downloads.");
          }

          const payload = await connectorConfig.fetchFileContent(item);
          const filename = String(payload?.name || item?.name || "file").trim() || "file";
          const mimeType = String(payload?.mimeType || item?.mimeType || "application/octet-stream").trim() || "application/octet-stream";
          const data = payload?.encoding === "text"
            ? await blobToBase64(new Blob([typeof payload?.content === "string" ? payload.content : ""], { type: mimeType }))
            : normalizeTaskConnectorBase64(payload?.content);
          return normalizePlaygroundTaskAttachmentRecord({
            ...(await uploadTaskAttachmentContent({
              filename,
              mimeType,
              data,
              options: { environmentId },
            })),
            filename,
            ...buildPlaygroundTaskAttachmentConnectorMetadata(source, item),
          });
        }

        function resolveTaskAttachmentAssetUrl(attachment) {
          if (!attachment) return "";
          const normalizedAttachmentUrl = resolveTaskAttachmentApiUrl(attachment.url, attachment.id);
          if (normalizedAttachmentUrl) {
            return normalizedAttachmentUrl;
          }
          const workspaceDownloadUrl = getTaskAttachmentWorkspaceDownloadUrl(attachment);
          if (workspaceDownloadUrl) {
            return workspaceDownloadUrl;
          }
          if (attachment?.id) {
            return backendUrl + "/attachments/" + encodeURIComponent(attachment.id);
          }
          return "";
        }

        async function loadTaskAttachmentAsFile(attachment) {
          const assetUrl = resolveTaskAttachmentAssetUrl(attachment);
          if (!assetUrl) {
            throw new Error("Attachment file is unavailable.");
          }
          const response = await fetch(assetUrl, {
            method: "GET",
            headers: String(assetUrl).startsWith("blob:") || String(assetUrl).startsWith("data:")
              ? undefined
              : requestHeaders,
          });
          if (!response.ok) {
            throw new Error("Failed to load " + (attachment.filename || "attachment") + " (" + response.status + ")");
          }
          const blob = await response.blob();
          return new globalThis.File([blob], attachment.filename || "attachment", {
            type: attachment.mimeType || blob.type || "application/octet-stream",
          });
        }

        function appendUploadedTaskAttachments(attachments) {
          const normalizedAttachments = normalizePlaygroundTaskAttachmentList(attachments);
          if (!normalizedAttachments.length) {
            return null;
          }
          return updateDraftTask((current) => ({
            ...current,
            attachments: normalizePlaygroundTaskAttachmentList(current.attachments.concat(normalizedAttachments)),
          }), { autosave: true });
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.attachments}
        function resizeTaskDescriptionTextarea(textarea) {
          if (!textarea) return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          const nextHeight = String(textarea.value || "").trim()
            ? Math.max(singleLineHeight, textarea.scrollHeight)
            : singleLineHeight;
          textarea.style.height = nextHeight + "px";
        }

        function resizeTaskCommentTextarea(textarea) {
          if (!textarea) return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 20;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          const nextHeight = String(textarea.value || "").trim()
            ? Math.max(singleLineHeight, textarea.scrollHeight)
            : singleLineHeight;
          textarea.style.height = nextHeight + "px";
        }

        function applyTaskDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateDraftField("description", nextValue);
          window.requestAnimationFrame(() => {
            const textarea = taskDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
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

            const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
            const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
            if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
              const nextValue =
                value.slice(0, safeStart - prefix.length)
                + selectedText
                + value.slice(safeEnd + suffix.length);
              return {
                value: nextValue,
                selectionStart: safeStart - prefix.length,
                selectionEnd: safeStart - prefix.length + selectedText.length,
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
        }

        function buildTaskDescriptionListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
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
          const isOrderedList = listType === "ordered";
          const orderedListPattern = /^(\\s*)\\d+\\.\\s+/;
          const unorderedListPattern = /^(\\s*)-\\s+/;
          const activeListPattern = isOrderedList ? orderedListPattern : unorderedListPattern;
          const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => activeListPattern.test(line));
          let orderedIndex = 1;
          const nextLines = lines.map((line) => {
            if (!line.trim()) {
              return shouldRemoveList ? line : (isOrderedList ? String(orderedIndex++) + ". " : "- ");
            }
            if (shouldRemoveList) {
              return line.replace(activeListPattern, "$1");
            }
            if (!isOrderedList && unorderedListPattern.test(line)) {
              return line.replace(unorderedListPattern, "$1- ");
            }
            if (isOrderedList && orderedListPattern.test(line)) {
              orderedIndex += 1;
              return line;
            }
            return line.replace(/^(\\s*)/, "$1" + (isOrderedList ? String(orderedIndex++) + ". " : "- "));
          });
          const nextBlock = nextLines.join("\\n");
          const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
          const collapsedSelection = safeStart === safeEnd;
          const listPrefixLength = isOrderedList ? 3 : 2;
          const nextCaretOffset = shouldRemoveList
            ? Math.max(0, safeStart - lineStart - listPrefixLength)
            : safeStart - lineStart + listPrefixLength;
          return {
            value: nextValue,
            selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
            selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
          };
        }

        function buildTaskDescriptionLinkEdit(value, selectionStart, selectionEnd) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          const existingLinkMatch = selectedText.match(/^\\[([^\\]]+)\\]\\(([^)]*)\\)$/);
          if (existingLinkMatch) {
            const unwrappedText = existingLinkMatch[1];
            const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
            return {
              value: nextValue,
              selectionStart: safeStart,
              selectionEnd: safeStart + unwrappedText.length,
            };
          }

          const label = selectedText || "link text";
          const url = "url";
          const markdownLink = "[" + label + "](" + url + ")";
          const nextValue = value.slice(0, safeStart) + markdownLink + value.slice(safeEnd);
          const urlStart = safeStart + label.length + 3;
          return {
            value: nextValue,
            selectionStart: urlStart,
            selectionEnd: urlStart + url.length,
          };
        }

        function handleTaskDescriptionFormat(formatType) {
          const textarea = taskDescriptionTextareaRef.current;
          if (!textarea || !draftTask?.id) {
            return;
          }
          const value = String(draftTask?.description || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyTaskDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.editorFormatting}
        function applyReleaseDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          setReleaseDraft((current) => ({
            ...current,
            description: nextValue,
          }));
          window.requestAnimationFrame(() => {
            const textarea = releaseDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleReleaseDescriptionFormat(formatType) {
          const textarea = releaseDescriptionTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(releaseDraft?.description || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyReleaseDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function updateProjectDescriptionDraftValue(nextValue, options = {}) {
          const normalizedNextValue = String(nextValue ?? "");
          const draftProjectId = String(selectedProjectId || projectDraft?.id || selectedProject?.id || "").trim();
          if (draftProjectId) {
            projectDescriptionDirtyProjectIdRef.current = draftProjectId;
          }
          projectDescriptionRevisionRef.current += 1;
          if (options.recordHistory !== false) {
            const previousValue = String(options.previousValue ?? projectDraft?.description ?? "");
            if (previousValue !== normalizedNextValue) {
              setProjectDescriptionHistory((current) => ({
                past: [
                  ...(Array.isArray(current?.past) ? current.past : []),
                  previousValue,
                ].slice(-80),
                future: [],
              }));
            }
          }
          setProjectDraft((current) => {
            const currentProject = current
              && typeof current === "object"
              && (!draftProjectId || current.id === draftProjectId)
                ? current
                : selectedProject?.id === draftProjectId
                  ? normalizePlaygroundProjectRecord(selectedProject)
                  : {
                      ...buildPlaygroundDefaultProjectDraft(),
                      ...(draftProjectId ? { id: draftProjectId } : {}),
                    };
            return {
              ...currentProject,
              description: normalizedNextValue,
              metadata: {
                ...(currentProject.metadata && typeof currentProject.metadata === "object" && !Array.isArray(currentProject.metadata)
                  ? currentProject.metadata
                  : {}),
                description: normalizedNextValue,
              },
            };
          });
        }

        function focusProjectDescriptionTextareaAtEnd(value) {
          window.requestAnimationFrame(() => {
            const textarea = projectDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function applyProjectDescriptionHistoryValue(value) {
          updateProjectDescriptionDraftValue(value, { recordHistory: false });
          focusProjectDescriptionTextareaAtEnd(value);
        }

        function handleProjectDescriptionUndo() {
          const history = projectDescriptionHistory || { past: [], future: [] };
          const past = Array.isArray(history.past) ? history.past : [];
          if (!past.length) {
            return;
          }
          const currentValue = String(projectDraft?.description || "");
          const previousValue = past[past.length - 1];
          setProjectDescriptionHistory((current) => ({
            past: (Array.isArray(current?.past) ? current.past : []).slice(0, -1),
            future: [
              currentValue,
              ...(Array.isArray(current?.future) ? current.future : []),
            ].slice(0, 80),
          }));
          applyProjectDescriptionHistoryValue(previousValue);
        }

        function handleProjectDescriptionRedo() {
          const history = projectDescriptionHistory || { past: [], future: [] };
          const future = Array.isArray(history.future) ? history.future : [];
          if (!future.length) {
            return;
          }
          const currentValue = String(projectDraft?.description || "");
          const nextValue = future[0];
          setProjectDescriptionHistory((current) => ({
            past: [
              ...(Array.isArray(current?.past) ? current.past : []),
              currentValue,
            ].slice(-80),
            future: (Array.isArray(current?.future) ? current.future : []).slice(1),
          }));
          applyProjectDescriptionHistoryValue(nextValue);
        }

        function applyProjectDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          const previousValue = String(projectDraft?.description || "");
          updateProjectDescriptionDraftValue(nextValue, { previousValue });
          window.requestAnimationFrame(() => {
            const textarea = projectDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleProjectDescriptionFormat(formatType) {
          const textarea = projectDescriptionTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(projectDraft?.description || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd, "unordered");
          } else if (formatType === "ordered-list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd, "ordered");
          } else if (formatType === "code") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
          } else if (formatType === "link") {
            edit = buildTaskDescriptionLinkEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyProjectDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function applyProjectRuleComposerSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          setProjectRuleInputValue(nextValue);
          window.requestAnimationFrame(() => {
            const textarea = projectRuleComposerTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleProjectRuleComposerFormat(formatType) {
          const textarea = projectRuleComposerTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(projectRuleInputValue || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyProjectRuleComposerSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function applyMissionControlInstructionsSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          setMissionControlInstructionsDraft(nextValue);
          window.requestAnimationFrame(() => {
            const textarea = missionControlInstructionsTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleMissionControlInstructionsFormat(formatType) {
          const textarea = missionControlInstructionsTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(missionControlInstructionsDraft || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyMissionControlInstructionsSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function updateMissionControlDocumentDraftValue(nextValue, options = {}) {
          const normalizedNextValue = String(nextValue ?? "");
          if (options.recordHistory !== false) {
            const previousValue = String(options.previousValue ?? missionControlDocumentDraft ?? "");
            if (previousValue !== normalizedNextValue) {
              setMissionControlDocumentHistory((current) => ({
                past: [
                  ...(Array.isArray(current?.past) ? current.past : []),
                  previousValue,
                ].slice(-80),
                future: [],
              }));
            }
          }
          setMissionControlDocumentDraft(normalizedNextValue);
        }

        function focusMissionControlDocumentTextareaAtEnd(value) {
          window.requestAnimationFrame(() => {
            const textarea = missionControlDocumentTextareaRef.current;
            if (!textarea) {
              return;
            }
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function applyMissionControlDocumentHistoryValue(value) {
          updateMissionControlDocumentDraftValue(value, { recordHistory: false });
          focusMissionControlDocumentTextareaAtEnd(value);
        }

        function handleMissionControlDocumentUndo() {
          const history = missionControlDocumentHistory || { past: [], future: [] };
          const past = Array.isArray(history.past) ? history.past : [];
          if (!past.length) {
            return;
          }
          const currentValue = String(missionControlDocumentDraft || "");
          const previousValue = past[past.length - 1];
          setMissionControlDocumentHistory((current) => ({
            past: (Array.isArray(current?.past) ? current.past : []).slice(0, -1),
            future: [
              currentValue,
              ...(Array.isArray(current?.future) ? current.future : []),
            ].slice(0, 80),
          }));
          applyMissionControlDocumentHistoryValue(previousValue);
        }

        function handleMissionControlDocumentRedo() {
          const history = missionControlDocumentHistory || { past: [], future: [] };
          const future = Array.isArray(history.future) ? history.future : [];
          if (!future.length) {
            return;
          }
          const currentValue = String(missionControlDocumentDraft || "");
          const nextValue = future[0];
          setMissionControlDocumentHistory((current) => ({
            past: [
              ...(Array.isArray(current?.past) ? current.past : []),
              currentValue,
            ].slice(-80),
            future: (Array.isArray(current?.future) ? current.future : []).slice(1),
          }));
          applyMissionControlDocumentHistoryValue(nextValue);
        }

        function applyMissionControlDocumentSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          const previousValue = String(missionControlDocumentDraft || "");
          updateMissionControlDocumentDraftValue(nextValue, { previousValue });
          window.requestAnimationFrame(() => {
            const textarea = missionControlDocumentTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

	        function handleMissionControlDocumentFormat(formatType) {
	          const textarea = missionControlDocumentTextareaRef.current;
	          if (!textarea) {
	            return;
          }
          const value = String(missionControlDocumentDraft || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd, "unordered");
          } else if (formatType === "ordered-list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd, "ordered");
          } else if (formatType === "code") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
          } else if (formatType === "link") {
            edit = buildTaskDescriptionLinkEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

	          applyMissionControlDocumentSelection(edit.value, edit.selectionStart, edit.selectionEnd);
	        }

	        function applyProjectRulesSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
	          setProjectRulesDraft(nextValue);
	          window.requestAnimationFrame(() => {
	            const textarea = projectRulesTextareaRef.current;
	            if (!textarea) {
	              return;
	            }
	            const maxLength = nextValue.length;
	            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
	            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
	            textarea.focus();
	            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
	            resizeTaskDescriptionTextarea(textarea);
	          });
	        }

	        function handleProjectRulesFormat(formatType) {
	          const textarea = projectRulesTextareaRef.current;
	          if (!textarea) {
	            return;
	          }
	          const value = String(projectRulesDraft || "");
	          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
	          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
	          let edit = null;

	          if (formatType === "bold") {
	            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
	          } else if (formatType === "italic") {
	            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
	          } else if (formatType === "underline") {
	            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
	          } else if (formatType === "list") {
	            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
	          }

	          if (!edit) {
	            return;
	          }

	          applyProjectRulesSelection(edit.value, edit.selectionStart, edit.selectionEnd);
	        }

        async function appendUploadedProjectAttachments(attachments) {
          const normalizedAttachments = normalizePlaygroundTaskAttachmentList(attachments);
          if (!normalizedAttachments.length) {
            return false;
          }
          if (missionControlStrategyOpen && selectedProjectId) {
            const nextAttachments = mergePlaygroundAttachmentLists(selectedProject?.attachments, normalizedAttachments);
            await persistProjectMissionControlRecord(selectedProjectId, buildMissionControlRecordForSave(), {
              projectOverrides: {
                attachments: nextAttachments,
              },
              successMessage: "",
            });
            return true;
          }
          if (!projectComposerOpen && selectedProjectId) {
            const nextAttachments = mergePlaygroundAttachmentLists(selectedProject?.attachments, normalizedAttachments);
            await persistProjectMissionControlRecord(selectedProjectId, buildMissionControlRecordForSave(), {
              projectOverrides: {
                attachments: nextAttachments,
              },
              quiet: true,
              successMessage: "",
            });
            return true;
          }
          setProjectDraft((current) => ({
            ...current,
            attachments: mergePlaygroundAttachmentLists(current.attachments, normalizedAttachments),
          }));
          return true;
        }

        async function appendProjectAttachmentFiles(files, options = {}) {
          const normalizedFiles = (Array.isArray(files) ? files : []).filter((file) =>
            file
            && typeof file === "object"
            && typeof file.name === "string"
            && typeof file.size === "number"
            && typeof file.arrayBuffer === "function"
          );
          if (normalizedFiles.length === 0) {
            return false;
          }

          const targetEnvironmentId = String(options.environmentId || activeProjectAttachmentEnvironmentId || "").trim();
          if (!targetEnvironmentId) {
            setProjectAttachmentTransferState((current) => ({
              ...current,
              error: "Select an environment before attaching project files.",
            }));
            return false;
          }

          setProjectAttachmentTransferState((current) => ({
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
            await appendUploadedProjectAttachments(uploadedAttachments);
            setProjectAttachmentTransferState((current) => ({
              ...current,
              error: "",
              isProcessing: false,
            }));
            return true;
          } catch (error) {
            setProjectAttachmentTransferState((current) => ({
              ...current,
              error: error instanceof Error ? error.message : "Failed to upload project attachment.",
              isProcessing: false,
            }));
            return false;
          }
        }

        function buildProjectEnvironmentFolderAttachment(entry, environmentId) {
          const normalizedEnvironmentId = String(environmentId || "").trim();
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          if (!normalizedEnvironmentId || !normalizedPath) {
            return null;
          }
          const folderName = String(entry?.name || normalizedPath.split("/").pop() || "Folder").trim() || "Folder";
          return buildResolvedTaskAttachmentRecord(normalizePlaygroundTaskAttachmentRecord({
            id: "workspace-folder:" + normalizedEnvironmentId + ":" + normalizedPath,
            filename: folderName,
            mimeType: "inode/directory",
            type: "document",
            size: 0,
            uploadedAt: typeof entry?.modifiedTime === "string" && entry.modifiedTime
              ? entry.modifiedTime
              : typeof entry?.createdTime === "string" && entry.createdTime
                ? entry.createdTime
                : new Date().toISOString(),
            environmentId: normalizedEnvironmentId,
            sourcePath: normalizedPath,
            workspacePath: normalizedPath,
            isFolder: true,
            previewKindOverride: "directory",
          }));
        }

        function openProjectAttachmentPicker() {
          if (projectAttachmentTransferState.isProcessing) {
            return;
          }
          if (!activeProjectAttachmentEnvironmentId) {
            setProjectAttachmentTransferState((current) => ({
              ...current,
              error: "Select an environment before attaching project files.",
            }));
            return;
          }
          setProjectComposerEnvironmentPopoverOpen(false);
          setIsProjectAttachmentDragging(false);
          projectAttachmentInputRef.current?.click?.();
        }

        function openProjectEnvironmentFilePicker() {
          if (projectAttachmentTransferState.isProcessing) {
            return;
          }
          if (!activeProjectAttachmentEnvironmentId) {
            setProjectAttachmentTransferState((current) => ({
              ...current,
              error: "Select an environment before browsing project files.",
            }));
            return;
          }
          setProjectAttachmentTransferState((current) => ({
            ...current,
            error: "",
          }));
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectEnvironmentFilePickerSearch("");
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectEnvironmentFilePickerOpen(true);
        }

        async function handleProjectAttachmentInputChange(event) {
          const fileList = Array.from(event?.target?.files || []);
          if (event?.target) {
            event.target.value = "";
          }
          if (fileList.length === 0) {
            return;
          }
          await appendProjectAttachmentFiles(fileList, {
            environmentId: activeProjectAttachmentEnvironmentId,
          });
        }

        async function handleProjectAttachmentDrop(event) {
          event.preventDefault();
          setIsProjectAttachmentDragging(false);
          const fileList = Array.from(event?.dataTransfer?.files || []);
          if (fileList.length === 0) {
            return;
          }
          await appendProjectAttachmentFiles(fileList, {
            environmentId: activeProjectAttachmentEnvironmentId,
          });
        }

        function toggleProjectEnvironmentFileSelection(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return;
          setProjectEnvironmentFilePickerSelectedPaths((current) =>
            current.includes(normalizedPath)
              ? current.filter((value) => value !== normalizedPath)
              : current.concat(normalizedPath)
          );
        }

        function toggleProjectEnvironmentFileFolder(path) {
`;
