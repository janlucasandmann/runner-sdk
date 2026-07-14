import { CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS } from "../../../calendar/client/projects-integration/page-data/index.mjs";
export const PROJECTS_PAGE_DATA_SCRIPT = `        function buildProjectScopedPath(path, projectId) {
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

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.saveState}
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

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.attachments}
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

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.editorFormatting}
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
          setProjectDraft((current) => ({
            ...(current && typeof current === "object" ? current : buildPlaygroundDefaultProjectDraft()),
            description: normalizedNextValue,
          }));
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
          const normalizedPath = normalizeHistoryPath(path);
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

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.draftFactory}
        function buildProjectReleaseDraft(projectRecord = selectedProject) {
          const base = buildPlaygroundDefaultReleaseDraft();
          return {
            ...base,
            projectId: projectRecord?.id || null,
            sortOrder: releases.length + 1,
          };
        }

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.status}
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
          setProjectOverviewOutcomeDescriptionEditing(false);
          setProjectOverviewOutcomeSuccessCriteriaEditing(false);
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
          );

          setSelectedProjectDetail((current) => {
            if (!current?.project || current.project.id !== projectId) {
              return current;
            }
            return {
              ...current,
              project: {
                ...current.project,
                summary: nextSummary,
              },
              summary: nextSummary,
            };
          });
        }

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading}
        function openProjectAgentUpgradeModal() {
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setProjectSidebarPopover("");
          setProjectAgentUpgradeModalOpen(true);
        }

        function closeProjectAgentUpgradeModal() {
          if (projectAgentUpgradeCheckoutLoading) {
            return;
          }
          setProjectAgentUpgradeModalOpen(false);
        }

        async function handleProjectAgentUpgradeCheckout() {
          if (projectAgentUpgradeCheckoutLoading || typeof onUpgradeToIndividual !== "function") {
            return;
          }
          setProjectAgentUpgradeCheckoutLoading(true);
          try {
            await Promise.resolve(onUpgradeToIndividual());
          } finally {
            setProjectAgentUpgradeCheckoutLoading(false);
          }
        }

${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence}
        async function loadProjects() {
          setProjectLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));

          try {
            const response = await fetch(backendUrl + "/projects", {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Projects API unavailable.");
            }

            const baseProjects = sortPlaygroundProjectsByRecent(
              parsePlaygroundProjectListResponse(data).map((project) => applyProjectLocalNameOverride(project))
            );
            const nextProjects = sortPlaygroundProjectsByRecent(
              await resolvePlaygroundTeamSharedProjects({
                backendUrl,
                headers: requestHeaders,
                projects: baseProjects,
              })
            ).map((project) => applyProjectLocalNameOverride(project));
            setProjects((current) =>
              sortPlaygroundProjectsByRecent(nextProjects.map((project) => {
                const existingProject = current.find((currentProject) => currentProject?.id === project.id) || null;
                return applyProjectLocalNameOverride(mergePlaygroundProjectRecords(project, existingProject) || project);
              }))
            );
            setProjectLoadState({
              status: "ready",
              error: "",
            });

            if (selectedProjectId) {
              const refreshedProject = nextProjects.find((project) => project.id === selectedProjectId) || null;
              if (!refreshedProject) {
                handleSelectProject("");
              } else {
                setSelectedProjectDetail((current) =>
                  current?.project?.id === selectedProjectId
                    ? (() => {
                        const mergedProject = applyProjectLocalNameOverride(
                          mergePlaygroundProjectRecords(refreshedProject, current.project) || refreshedProject
                        );
                        return {
                          ...current,
                          project: mergedProject,
                          summary: mergedProject.summary || current.summary,
                        };
                      })()
                    : current
                );
              }
            }
          } catch (error) {
            setProjectLoadState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load projects from the API.",
            });
          }
        }

        function normalizeProjectCostSummaryResponse(data) {
          const totals = data?.totals && typeof data.totals === "object" ? data.totals : {};
          const byDay = Array.isArray(data?.byDay)
            ? data.byDay.map((day) => ({
                date: String(day?.date || ""),
                totalCT: Math.max(0, Number(readSettingsComputeTokens(day, "totalCT", "totalCost") || 0)),
                agentCT: Math.max(0, Number(readSettingsComputeTokens(day, "agentCT", "agentCost") || 0)),
                environmentCT: Math.max(0, Number(readSettingsComputeTokens(day, "environmentCT", "environmentCost") || 0)),
                threadCount: Math.max(0, Number(day?.threadCount || day?.totalThreads || 0)),
              })).filter((day) => day.date)
            : [];
          return {
            period: String(data?.period || "year"),
            startDate: String(data?.startDate || ""),
            endDate: String(data?.endDate || ""),
            totals: {
              totalCT: Math.max(0, Number(readSettingsComputeTokens(totals, "totalCT", "totalCost") || 0)),
              agentCT: Math.max(0, Number(readSettingsComputeTokens(totals, "agentCT", "agentCost") || 0)),
              environmentCT: Math.max(0, Number(readSettingsComputeTokens(totals, "environmentCT", "environmentCost") || 0)),
              totalThreads: Math.max(0, Number(totals?.totalThreads || 0)),
            },
            byDay,
          };
        }

        async function loadProjectWorkspace(projectId) {
          if (!projectId) {
            projectWorkspaceLoadTokenRef.current = "";
            clearProjectWorkspace();
            return;
          }

          const loadToken = projectId + ":" + Date.now().toString(36) + Math.random().toString(36).slice(2);
          projectWorkspaceLoadTokenRef.current = loadToken;
          setTaskLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));
          setProjectOverviewCostSummaryState((current) => ({
            status: current.status === "ready" ? "loading" : "loading",
            error: "",
            summary: current.summary,
          }));

          try {
            const threadsRequestTarget = new URL(backendUrl + "/threads", window.location.origin);
            threadsRequestTarget.searchParams.set("projectId", projectId);
            threadsRequestTarget.searchParams.set("limit", "500");
            const costSummaryRequestTarget = new URL(backendUrl + "/costs/summary", window.location.origin);
            costSummaryRequestTarget.searchParams.set("projectId", projectId);
            costSummaryRequestTarget.searchParams.set("period", "year");

            const [tasksResponse, releasesResponse, sprintsResponse, threadsResponse, costSummaryResult] = await Promise.all([
              fetch(backendUrl + buildProjectScopedPath("/tasks", projectId), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(backendUrl + buildProjectScopedPath("/tasks/releases", projectId), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(backendUrl + buildProjectScopedPath("/tasks/sprints", projectId), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(threadsRequestTarget.toString(), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(costSummaryRequestTarget.toString(), {
                method: "GET",
                headers: requestHeaders,
              })
                .then(async (response) => ({
                  response,
                  data: await response.json().catch(() => ({})),
                }))
                .catch((error) => ({ error })),
            ]);

            const tasksData = await tasksResponse.json().catch(() => ({}));
            const releasesData = await releasesResponse.json().catch(() => ({}));
            const sprintsData = await sprintsResponse.json().catch(() => ({}));
            const threadsData = await threadsResponse.json().catch(() => ({}));

            if (!tasksResponse.ok || !releasesResponse.ok || !sprintsResponse.ok || !threadsResponse.ok) {
              throw new Error(
                tasksData?.message || tasksData?.error
                || releasesData?.message || releasesData?.error
                || sprintsData?.message || sprintsData?.error
                || threadsData?.message || threadsData?.error
                || "Project workspace unavailable."
              );
            }

            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return;
            }

            const nextTasks = parsePlaygroundTaskListResponse(tasksData);
            const nextReleases = parsePlaygroundTaskReleaseListResponse(releasesData);
            const nextSprints = parsePlaygroundTaskSprintListResponse(sprintsData);
            const currentDetailProject = selectedProjectDetail?.project?.id === projectId
              ? selectedProjectDetail.project
              : null;
            const snapshotProjectRecord = selectedProjectSnapshot
              || projects.find((project) => project?.id === projectId)
              || normalizePlaygroundProjectRecord({
                id: projectId,
                name: "Project",
              });
            const fallbackProjectRecord = currentDetailProject
              ? mergePlaygroundProjectRecords(currentDetailProject, snapshotProjectRecord) || currentDetailProject
              : snapshotProjectRecord;
            const fallbackSummary = {
              ...buildEmptyPlaygroundProjectSummary(),
              ...(fallbackProjectRecord?.summary && typeof fallbackProjectRecord.summary === "object" ? fallbackProjectRecord.summary : {}),
            };
            const fallbackEnvironments = selectedProjectDetail?.project?.id === projectId && Array.isArray(selectedProjectDetail.environments)
              ? selectedProjectDetail.environments
              : [];
            const nextThreads = Array.isArray(threadsData?.data)
              ? threadsData.data.map(normalizeThreadItem)
              : Array.isArray(threadsData?.threads)
                ? threadsData.threads.map(normalizeThreadItem)
                : [];
            if (costSummaryResult?.error) {
              setProjectOverviewCostSummaryState({
                status: "error",
                error: costSummaryResult.error instanceof Error ? costSummaryResult.error.message : "Failed to load project cost summary.",
                summary: null,
              });
            } else if (costSummaryResult?.response?.ok) {
              setProjectOverviewCostSummaryState({
                status: "ready",
                error: "",
                summary: normalizeProjectCostSummaryResponse(costSummaryResult.data || {}),
              });
            } else {
              setProjectOverviewCostSummaryState({
                status: "error",
                error: costSummaryResult?.data?.message || costSummaryResult?.data?.error || "Failed to load project cost summary.",
                summary: null,
              });
            }

            commitLocalProjectRecord({
              ...fallbackProjectRecord,
              summary: fallbackSummary,
            }, {
              summary: fallbackSummary,
              environments: fallbackEnvironments,
              recentThreads: nextThreads.slice(0, 10),
              threads: nextThreads,
              selectImmediately: true,
            });

            setTasks(nextTasks);
            setReleases(nextReleases);
            setSprints(nextSprints);
            syncProjectSummary(projectId, nextTasks, nextSprints, nextReleases, fallbackSummary);
            setTaskLoadState({
              status: "ready",
              error: "",
            });

            const projectDetailPromise = fetch(backendUrl + "/projects/" + encodeURIComponent(projectId), {
                method: "GET",
                headers: requestHeaders,
              })
              .then(async (response) => ({
                response,
                data: await response.json().catch(() => ({})),
              }))
              .catch((error) => ({ error }));

            void projectDetailPromise.then((projectResult) => {
              if (projectWorkspaceLoadTokenRef.current !== loadToken) {
                return;
              }
              if (projectResult?.error) {
                console.warn("Failed to refresh project detail", projectResult.error);
                return;
              }
              const projectResponse = projectResult?.response;
              const projectData = projectResult?.data || {};
              if (!projectResponse?.ok) {
                console.warn("Failed to refresh project detail", projectData?.message || projectData?.error || projectResponse?.status);
                return;
              }

              const projectRecord = getPlaygroundProjectResponseRecord(projectData, fallbackProjectRecord) || fallbackProjectRecord;
              const nextSummary = {
                ...buildEmptyPlaygroundProjectSummary(),
                ...(projectData?.summary && typeof projectData.summary === "object" ? projectData.summary : {}),
              };
              const parsedEnvironments = parsePlaygroundEnvironmentListResponse(projectData);
              const nextEnvironments = parsedEnvironments.length > 0 ? parsedEnvironments : fallbackEnvironments;
              const nextRecentThreads = Array.isArray(projectData?.recentThreads)
                ? projectData.recentThreads.map(normalizeThreadItem)
                : nextThreads.slice(0, 10);

              commitLocalProjectRecord({
                ...projectRecord,
                summary: nextSummary,
              }, {
                summary: nextSummary,
                environments: nextEnvironments,
                recentThreads: nextRecentThreads,
                threads: nextThreads,
                selectImmediately: true,
              });
              syncProjectSummary(projectId, nextTasks, nextSprints, nextReleases, nextSummary);
            });
          } catch (error) {
            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return;
            }
            setTaskLoadState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load project workspace.",
            });
          }
        }

        async function loadTaskDetails(taskId) {
          if (!selectedProjectId || !taskId) {
            return null;
          }

          const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(taskId), {
            method: "GET",
            headers: requestHeaders,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to load task details.");
          }

          const refreshedTask = getPlaygroundTaskResponseRecord(data);
          if (!refreshedTask?.id) {
            throw new Error("Task details are unavailable.");
          }

          return applyRefreshedTaskDetails(refreshedTask);
        }

        useEffect(() => {
          try {
            if (selectedProjectId) {
              localStorage.setItem("runner_demo_tasks_project_scope_id", selectedProjectId);
            } else {
              localStorage.removeItem("runner_demo_tasks_project_scope_id");
            }
          } catch {}
        }, [selectedProjectId]);

	        useEffect(() => {
	          if (!selectedProjectId) {
	            reportedProjectScopeIdRef.current = "";
	            return;
	          }
	          if (typeof onProjectScopeChange !== "function") {
	            return;
	          }
	          if (reportedProjectScopeIdRef.current === selectedProjectId) {
	            return;
	          }
	          reportedProjectScopeIdRef.current = selectedProjectId;
	          onProjectScopeChange(selectedProjectId);
	        }, [onProjectScopeChange, selectedProjectId]);

        useEffect(() => {
          setBacklogComposerSubtaskCommandRequest(null);
        }, [selectedProjectId]);

	        useEffect(() => {
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	          ].join("|");
	          if (projectListAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectListAutoLoadKeyRef.current = loadKey;
	          void loadProjects();
	        }, [backendUrl, requestHeadersKey]);

        useEffect(() => {
          return () => {
            if (projectWallpaperTransitionTimerRef.current) {
              window.clearTimeout(projectWallpaperTransitionTimerRef.current);
              projectWallpaperTransitionTimerRef.current = null;
            }
            if (projectInitialSetupModalCloseTimerRef.current) {
              window.clearTimeout(projectInitialSetupModalCloseTimerRef.current);
              projectInitialSetupModalCloseTimerRef.current = null;
            }
            if (projectInitialSetupModalFrameRef.current) {
              window.cancelAnimationFrame(projectInitialSetupModalFrameRef.current);
              projectInitialSetupModalFrameRef.current = null;
            }
            if (missionControlSetupCloseTimerRef.current) {
              window.clearTimeout(missionControlSetupCloseTimerRef.current);
              missionControlSetupCloseTimerRef.current = null;
            }
            if (missionControlSetupFrameRef.current) {
              window.cancelAnimationFrame(missionControlSetupFrameRef.current);
              missionControlSetupFrameRef.current = null;
            }
            if (projectRuleComposerCloseTimerRef.current) {
              window.clearTimeout(projectRuleComposerCloseTimerRef.current);
              projectRuleComposerCloseTimerRef.current = null;
            }
            if (projectRuleComposerFrameRef.current) {
              window.cancelAnimationFrame(projectRuleComposerFrameRef.current);
              projectRuleComposerFrameRef.current = null;
            }
            if (projectOverviewOutcomeEditorCloseTimerRef.current) {
              window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
              projectOverviewOutcomeEditorCloseTimerRef.current = null;
            }
            if (projectOverviewOutcomeEditorFrameRef.current) {
              window.cancelAnimationFrame(projectOverviewOutcomeEditorFrameRef.current);
              projectOverviewOutcomeEditorFrameRef.current = null;
            }
            if (issueComposerCloseTimerRef.current) {
              window.clearTimeout(issueComposerCloseTimerRef.current);
              issueComposerCloseTimerRef.current = null;
            }
            if (issueComposerFrameRef.current) {
              window.cancelAnimationFrame(issueComposerFrameRef.current);
              issueComposerFrameRef.current = null;
            }
          };
        }, []);

        useEffect(() => {
          if (!projectComposerOpen) return undefined;

          function handleProjectComposerEscape(event) {
            if (event.key !== "Escape") return;
            if (projectOverviewOutcomeEditorState) {
              if (projectOverviewOutcomeMilestonePickerOpen) {
                setProjectOverviewOutcomeMilestonePickerOpen(false);
                return;
              }
              closeProjectOverviewOutcomeEditor();
              return;
            }
            if (missionControlSetupOutcomeMenuIndex >= 0) {
              setMissionControlSetupOutcomeMenuIndex(-1);
              return;
            }
            if (missionControlSetupOpen) {
              closeMissionControlSetupModal();
              return;
            }
            if (projectEnvironmentFilePickerOpen) {
              setProjectEnvironmentFilePickerOpen(false);
              return;
            }
            if (projectComposerEnvironmentPopoverOpen) {
              setProjectComposerEnvironmentPopoverOpen(false);
              return;
            }
            if (projectBlueprintPickerOpen) {
              setProjectBlueprintPickerOpen(false);
              return;
            }
            if (projectIconPickerOpen) {
              setProjectIconPickerOpen(false);
              return;
            }
            closeProjectComposer();
          }

          window.addEventListener("keydown", handleProjectComposerEscape);
          return () => window.removeEventListener("keydown", handleProjectComposerEscape);
        }, [missionControlSetupClosing, missionControlSetupOpen, missionControlSetupOutcomeMenuIndex, projectBlueprintPickerOpen, projectComposerEnvironmentPopoverOpen, projectComposerOpen, projectEnvironmentFilePickerOpen, projectIconPickerOpen, projectOverviewOutcomeEditorState, projectOverviewOutcomeMilestonePickerOpen]);

        useEffect(() => {
          if (!issueComposerOpen) return undefined;

          function handleIssueComposerEscape(event) {
            if (event.key !== "Escape") return;
            if (issueComposerDetailSelectPopover) {
              setIssueComposerDetailSelectPopover("");
              return;
            }
            if (issueComposerEnvironmentPopoverOpen) {
              setIssueComposerEnvironmentPopoverOpen(false);
              return;
            }
            closeProjectIssueComposer();
          }

          window.addEventListener("keydown", handleIssueComposerEscape);
          return () => window.removeEventListener("keydown", handleIssueComposerEscape);
        }, [issueComposerClosing, issueComposerDetailSelectPopover, issueComposerEnvironmentPopoverOpen, issueComposerOpen, issueComposerSaveState.isSaving]);

        useEffect(() => {
          if (!releaseComposerOpen) return undefined;

          function handleReleaseComposerEscape(event) {
            if (event.key !== "Escape") return;
            closeReleaseComposer();
          }

          window.addEventListener("keydown", handleReleaseComposerEscape);
          return () => window.removeEventListener("keydown", handleReleaseComposerEscape);
        }, [releaseComposerClosing, releaseComposerOpen, releaseDeletePending, releaseSaveState.isSaving]);

        useEffect(() => {
          if (!releaseComposerOpen) {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(releaseDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [releaseComposerOpen, releaseDraft.description]);

        useEffect(() => {
          if (!projectComposerOpen) {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(projectDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [projectComposerOpen, projectDraft.description]);

        useEffect(() => {
          if (!projectComposerOpen || projectDraft?.defaultEnvironmentId || projectComposerAvailableEnvironments.length === 0) {
            return;
          }
          setProjectDraft((current) => {
            if (current?.defaultEnvironmentId) {
              return current;
            }
            return {
              ...current,
              defaultEnvironmentId: projectComposerDefaultEnvironmentId
                || projectComposerAvailableEnvironments.find((environment) => environment.isDefault)?.id
                || projectComposerAvailableEnvironments[0]?.id
                || null,
            };
          });
        }, [projectComposerAvailableEnvironments, projectComposerDefaultEnvironmentId, projectComposerOpen, projectDraft?.defaultEnvironmentId]);

        useEffect(() => {
          if (scheduleViewMode !== "setup") {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(scheduleTaskTextareaRef.current);
            resizeTaskDescriptionTextarea(scheduleDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [scheduleDraft.description, scheduleDraft.task, scheduleViewMode]);

        useEffect(() => {
          if (!projectSidebarPopover) return undefined;

          function handleProjectSidebarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectSidebarActionsRef.current || projectSidebarActionsRef.current.contains(target)) {
              return;
            }
            setProjectSidebarPopover("");
          }

          document.addEventListener("mousedown", handleProjectSidebarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectSidebarPopoverPointerDown);
        }, [projectSidebarPopover]);

        useEffect(() => {
          if (!projectComposerEnvironmentPopoverOpen) {
            return undefined;
          }

          function handleProjectComposerEnvironmentPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectComposerEnvironmentPopoverRef.current || projectComposerEnvironmentPopoverRef.current.contains(target)) {
              return;
            }
            setProjectComposerEnvironmentPopoverOpen(false);
          }

          document.addEventListener("mousedown", handleProjectComposerEnvironmentPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectComposerEnvironmentPopoverPointerDown);
        }, [projectComposerEnvironmentPopoverOpen]);

        useEffect(() => {
          if (!issueComposerEnvironmentPopoverOpen) {
            return undefined;
          }

          function handleIssueComposerEnvironmentPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !issueComposerEnvironmentPopoverRef.current || issueComposerEnvironmentPopoverRef.current.contains(target)) {
              return;
            }
            setIssueComposerEnvironmentPopoverOpen(false);
          }

          document.addEventListener("mousedown", handleIssueComposerEnvironmentPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleIssueComposerEnvironmentPopoverPointerDown);
        }, [issueComposerEnvironmentPopoverOpen]);

        useEffect(() => {
          if (!issueComposerDetailSelectPopover) {
            return undefined;
          }

          function handleIssueComposerDetailSelectPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !issueComposerDetailSelectPopoverRef.current || issueComposerDetailSelectPopoverRef.current.contains(target)) {
              return;
            }
            setIssueComposerDetailSelectPopover("");
          }

          document.addEventListener("mousedown", handleIssueComposerDetailSelectPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleIssueComposerDetailSelectPopoverPointerDown);
        }, [issueComposerDetailSelectPopover]);

        useEffect(() => {
          if (missionControlSetupOutcomeMenuIndex < 0) {
            return undefined;
          }

          function handleMissionControlOutcomeMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !missionControlSetupOutcomeMenuRef.current || missionControlSetupOutcomeMenuRef.current.contains(target)) {
              return;
            }
            setMissionControlSetupOutcomeMenuIndex(-1);
          }

          document.addEventListener("mousedown", handleMissionControlOutcomeMenuPointerDown);
          return () => document.removeEventListener("mousedown", handleMissionControlOutcomeMenuPointerDown);
        }, [missionControlSetupOutcomeMenuIndex]);

        useEffect(() => {
          if (!projectBlueprintPickerOpen) {
            return undefined;
          }

          function handleProjectBlueprintPickerPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectBlueprintPickerRef.current || projectBlueprintPickerRef.current.contains(target)) {
              return;
            }
            setProjectBlueprintPickerOpen(false);
          }

          document.addEventListener("mousedown", handleProjectBlueprintPickerPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectBlueprintPickerPointerDown);
        }, [projectBlueprintPickerOpen]);

        useEffect(() => {
          if (!projectCardMenuProjectId) return undefined;

          function handleProjectCardMenuPointerDown(event) {
            const target = event?.target instanceof Element ? event.target : null;
            if (target?.closest(".playground-tasks-project-card-actions")) {
              return;
            }
            setProjectCardMenuProjectId("");
          }

          document.addEventListener("mousedown", handleProjectCardMenuPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectCardMenuPointerDown);
        }, [projectCardMenuProjectId]);

        useEffect(() => {
          if (!backlogToolbarPopover) return undefined;

          function handleBacklogToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !backlogToolbarActionsRef.current || backlogToolbarActionsRef.current.contains(target)) {
              return;
            }
            setBacklogToolbarPopover("");
          }

          document.addEventListener("mousedown", handleBacklogToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleBacklogToolbarPopoverPointerDown);
        }, [backlogToolbarPopover]);

        useEffect(() => {
          if (!boardToolbarPopover) return undefined;

          function handleBoardToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !boardToolbarActionsRef.current || boardToolbarActionsRef.current.contains(target)) {
              return;
            }
            setBoardToolbarPopover("");
          }

          document.addEventListener("mousedown", handleBoardToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleBoardToolbarPopoverPointerDown);
        }, [boardToolbarPopover]);

        useEffect(() => {
          if (!releaseToolbarPopover) return undefined;

          function handleReleaseToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !releaseToolbarActionsRef.current || releaseToolbarActionsRef.current.contains(target)) {
              return;
            }
            setReleaseToolbarPopover("");
          }

          document.addEventListener("mousedown", handleReleaseToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleReleaseToolbarPopoverPointerDown);
        }, [releaseToolbarPopover]);

        useEffect(() => {
          if (!releaseBacklogToolbarPopover) return undefined;

          function handleReleaseBacklogToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !releaseBacklogToolbarActionsRef.current || releaseBacklogToolbarActionsRef.current.contains(target)) {
              return;
            }
            setReleaseBacklogToolbarPopover("");
          }

          document.addEventListener("mousedown", handleReleaseBacklogToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleReleaseBacklogToolbarPopoverPointerDown);
        }, [releaseBacklogToolbarPopover]);

        useEffect(() => {
          if (!backlogTaskContextMenu) return undefined;

          function handleBacklogTaskContextMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !backlogTaskContextMenuRef.current || backlogTaskContextMenuRef.current.contains(target)) {
              return;
            }
            setBacklogTaskContextMenu(null);
          }

          function handleBacklogTaskContextMenuEscape(event) {
            if (event.key === "Escape") {
              setBacklogTaskContextMenu(null);
            }
          }

          document.addEventListener("mousedown", handleBacklogTaskContextMenuPointerDown);
          window.addEventListener("keydown", handleBacklogTaskContextMenuEscape);
          return () => {
            document.removeEventListener("mousedown", handleBacklogTaskContextMenuPointerDown);
            window.removeEventListener("keydown", handleBacklogTaskContextMenuEscape);
          };
        }, [backlogTaskContextMenu]);

        useEffect(() => {
          if (!taskStatusMenuState?.taskId) return undefined;

          function handleTaskStatusMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskStatusMenuRef.current || taskStatusMenuRef.current.contains(target)) {
              return;
            }
            setTaskStatusMenuState(null);
          }

          function handleTaskStatusMenuEscape(event) {
            if (event.key === "Escape") {
              setTaskStatusMenuState(null);
            }
          }

          document.addEventListener("mousedown", handleTaskStatusMenuPointerDown);
          window.addEventListener("keydown", handleTaskStatusMenuEscape);
          return () => {
            document.removeEventListener("mousedown", handleTaskStatusMenuPointerDown);
            window.removeEventListener("keydown", handleTaskStatusMenuEscape);
          };
        }, [taskStatusMenuState]);

        useEffect(() => {
          if (!taskDetailPopover) return undefined;

          function handleTaskDetailPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailActionsRef.current || taskDetailActionsRef.current.contains(target)) {
              return;
            }
            setTaskDetailPopover("");
          }

          document.addEventListener("mousedown", handleTaskDetailPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleTaskDetailPopoverPointerDown);
        }, [taskDetailPopover]);

        useEffect(() => {
          if (!taskDetailSelectPopover) return undefined;

          function handleTaskDetailSelectPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailSelectPopoverRef.current || taskDetailSelectPopoverRef.current.contains(target)) {
              return;
            }
            setTaskDetailSelectPopover("");
          }

          function handleTaskDetailSelectPopoverEscape(event) {
            if (event.key === "Escape") {
              setTaskDetailSelectPopover("");
            }
          }

          document.addEventListener("mousedown", handleTaskDetailSelectPopoverPointerDown);
          window.addEventListener("keydown", handleTaskDetailSelectPopoverEscape);
          return () => {
            document.removeEventListener("mousedown", handleTaskDetailSelectPopoverPointerDown);
            window.removeEventListener("keydown", handleTaskDetailSelectPopoverEscape);
          };
        }, [taskDetailSelectPopover]);

        useEffect(() => {
          if (taskDetailPopover) {
            setTaskDetailSelectPopover("");
            setBacklogTaskContextMenu(null);
          }
        }, [taskDetailPopover]);

        useEffect(() => {
          if (taskSkillsPopoverOpen) {
            setTaskDetailSelectPopover("");
          }
        }, [taskSkillsPopoverOpen]);

        useEffect(() => {
          setTaskDetailSelectPopover("");
        }, [draftTask?.id, taskDetailsCollapsed]);

        useEffect(() => {
          if (!taskSkillsPopoverOpen) return undefined;

          function handleTaskSkillsPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskSkillsActionsRef.current || taskSkillsActionsRef.current.contains(target)) {
              return;
            }
            setTaskSkillsPopoverOpen(false);
          }

          function handleTaskSkillsPopoverEscape(event) {
            if (event.key === "Escape") {
              setTaskSkillsPopoverOpen(false);
            }
          }

          document.addEventListener("mousedown", handleTaskSkillsPopoverPointerDown);
          window.addEventListener("keydown", handleTaskSkillsPopoverEscape);
          return () => {
            document.removeEventListener("mousedown", handleTaskSkillsPopoverPointerDown);
            window.removeEventListener("keydown", handleTaskSkillsPopoverEscape);
          };
        }, [taskSkillsPopoverOpen]);

	        useEffect(() => {
	          if (isStandaloneCalendarMode) {
	            projectWorkspaceAutoLoadKeyRef.current = "";
	            clearProjectWorkspace({ preserveSchedule: true });
	            return;
	          }
	          if (!selectedProjectId) {
	            projectWorkspaceAutoLoadKeyRef.current = "";
	            clearProjectWorkspace();
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	          ].join("|");
	          if (projectWorkspaceAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectWorkspaceAutoLoadKeyRef.current = loadKey;
	          void loadProjectWorkspace(selectedProjectId);
	        }, [backendUrl, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId]);

	        useEffect(() => {
            const scheduleProjectId = isStandaloneCalendarMode ? "" : selectedProjectId;
	          if (!scheduleProjectId && !isStandaloneCalendarMode) {
	            projectSchedulesAutoLoadKeyRef.current = "";
	            setSchedules([]);
	            setScheduleLoadState({
              status: "idle",
              error: "",
	            });
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            scheduleProjectId || "standalone",
	            visibleScheduleCalendarRangeKey,
	          ].join("|");
	          if (projectSchedulesAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectSchedulesAutoLoadKeyRef.current = loadKey;
	          void loadProjectSchedules(scheduleProjectId, visibleScheduleCalendarRange);
	        }, [backendUrl, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId, visibleScheduleCalendarRange, visibleScheduleCalendarRangeKey]);

	        useEffect(() => {
            const scheduleProjectId = isStandaloneCalendarMode ? "" : selectedProjectId;
	          if (!scheduleProjectId && !isStandaloneCalendarMode) {
	            projectMetronomeSchedulesAutoLoadKeyRef.current = "";
	            setCalendarMetronomeWorkflows([]);
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            scheduleProjectId || "standalone",
              isCalendarContext ? "calendar" : "background",
	          ].join("|");
	          if (projectMetronomeSchedulesAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectMetronomeSchedulesAutoLoadKeyRef.current = loadKey;
	          void loadProjectMetronomeSchedules(scheduleProjectId);
	        }, [backendUrl, isCalendarContext, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId]);

        useEffect(() => {
          if (!selectedProjectId || boardSprintId === PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID) return;
          if (sprints.some((sprint) => sprint.id === boardSprintId)) return;
          const activeSprint = sprints.find((sprint) => sprint.status === "active") || sprints[0] || null;
          setBoardSprintId(activeSprint?.id || PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID);
        }, [boardSprintId, selectedProjectId, sprints]);

        useEffect(() => {
          if (!selectedProjectId) {
            setBacklogComposerEnvironmentId("");
            return;
          }
          if (backlogComposerEnvironmentId && availableBacklogEnvironments.some((environment) => environment.id === backlogComposerEnvironmentId)) {
            return;
          }
          const nextEnvironmentId = selectedProject?.defaultEnvironmentId && availableBacklogEnvironments.some((environment) => environment.id === selectedProject.defaultEnvironmentId)
            ? selectedProject.defaultEnvironmentId
            : availableBacklogEnvironments.find((environment) => environment.isDefault)?.id
              || availableBacklogEnvironments[0]?.id
              || "";
          setBacklogComposerEnvironmentId(nextEnvironmentId);
        }, [availableBacklogEnvironments, backlogComposerEnvironmentId, selectedProject?.defaultEnvironmentId, selectedProjectId]);

        useEffect(() => {
          if (backlogComposerAgentId && assignableActors.some((agent) => agent.id === backlogComposerAgentId)) {
            return;
          }
          const nextAgentId = initialAgentId && assignableActors.some((agent) => agent.id === initialAgentId)
            ? initialAgentId
            : getPlaygroundPreferredDefaultAgent(sortedAgents)?.id
              || sortedAgents[0]?.id
              || humanAssigneeOptions[0]?.id
              || "";
          setBacklogComposerAgentId(nextAgentId);
        }, [assignableActors, backlogComposerAgentId, humanAssigneeOptions, initialAgentId, sortedAgents]);

        useEffect(() => {
          if (taskDetailAvailableAssigneePopupModes.includes(taskDetailAssigneePopupMode)) {
            return;
          }
          const nextMode = taskDetailAvailableAssigneePopupModes[0] || "agents";
          if (nextMode !== taskDetailAssigneePopupMode) {
            setTaskDetailAssigneePopupMode(nextMode);
          }
        }, [taskDetailAssigneePopupMode, taskDetailAvailableAssigneePopupModes]);

        useEffect(() => {
          if (taskView === "threads") {
            setTaskView("backlog");
          }
        }, [taskView]);

        useEffect(() => {
          if (taskView !== "backlog") {
            setBacklogToolbarPopover("");
            setBacklogSessionCompletedTaskIds((current) => current.size ? new Set() : current);
          }
        }, [taskView]);

        useEffect(() => {
          setBacklogSessionCompletedTaskIds(new Set());
        }, [selectedProjectId]);

        useEffect(() => {
          setMissionControlStrategyOpen(false);
          setBacklogComposerMissionControlCommandRequest(null);
        }, [selectedProjectId]);

        useEffect(() => {
          const normalizedThreadId = String(missionControlRunState.threadId || "").trim();
          const normalizedProjectId = String(missionControlRunState.projectId || "").trim();
          if (
            !normalizedThreadId
            || !normalizedProjectId
            || (missionControlRunState.status !== "starting" && missionControlRunState.status !== "running")
          ) {
            return undefined;
          }

          let isActive = true;
          let timeoutId = 0;

          const pollMissionControlStatus = async () => {
            try {
              const response = await fetch(
                backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/status",
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok || !isActive) {
                return;
              }

              const nextStatus = typeof data?.status === "string" && data.status.trim()
                ? data.status.trim().toLowerCase()
                : typeof data?.thread?.status === "string" && data.thread.status.trim()
                  ? data.thread.status.trim().toLowerCase()
                  : typeof data?.data?.status === "string" && data.data.status.trim()
                    ? data.data.status.trim().toLowerCase()
                    : "";

              if (nextStatus === "running" && missionControlRunState.status !== "running") {
                setMissionControlRunState((current) => current.threadId === normalizedThreadId
                  ? {
                      ...current,
                      status: "running",
                      error: "",
                    }
                  : current
                );
                if (typeof onStatusIndicatorItemChange === "function") {
                  onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                    projectId: normalizedProjectId,
                    projectName: selectedProject?.name || "Project",
                    phase: "running",
                  }));
                }
              }

              if (!nextStatus || nextStatus === "running" || nextStatus === "queued" || nextStatus === "pending" || nextStatus === "starting") {
                timeoutId = window.setTimeout(pollMissionControlStatus, 2200);
                return;
              }

              if (nextStatus === "completed") {
                if (typeof onStatusIndicatorItemChange === "function") {
                  onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                    projectId: normalizedProjectId,
                    projectName: selectedProject?.name || "Project",
                    phase: "finished",
                  }));
                }
                setMissionControlRunState((current) => current.threadId === normalizedThreadId
                  ? {
                      ...current,
                      status: "syncing",
                      error: "",
                    }
                  : current
                );
                await syncMissionControlThreadResult(normalizedThreadId, normalizedProjectId);
                return;
              }

              if (typeof onStatusIndicatorItemChange === "function") {
                onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                  projectId: normalizedProjectId,
                  projectName: selectedProject?.name || "Project",
                  phase: nextStatus === "cancelled" ? "cancelled" : "failed",
                  error: nextStatus === "cancelled" ? "" : "Mission Control run did not complete successfully.",
                }));
              }
              setMissionControlRunState((current) => current.threadId === normalizedThreadId
                ? {
                    ...current,
                    status: "failed",
                    error: "Mission Control run did not complete successfully.",
                  }
                : current
              );
            } catch {
              if (!isActive) {
                return;
              }
              timeoutId = window.setTimeout(pollMissionControlStatus, 3000);
            }
          };

          void pollMissionControlStatus();

          return () => {
            isActive = false;
            if (timeoutId) {
              window.clearTimeout(timeoutId);
            }
          };
        }, [
          backendUrl,
          missionControlRunState.projectId,
          missionControlRunState.status,
          missionControlRunState.threadId,
          onStatusIndicatorItemChange,
          requestHeaders,
          selectedProject?.name,
        ]);

        useEffect(() => {
          if (taskView !== "board") {
            setBoardToolbarPopover("");
          }
        }, [taskView]);

        useEffect(() => {
          if (taskView !== "releases") {
            setReleaseToolbarPopover("");
            setReleaseBacklogToolbarPopover("");
          }
        }, [taskView]);

        useEffect(() => {
          if (isStandaloneCalendarMode || taskView === "calendar") {
            return;
          }
          if (scheduleViewMode !== "calendar" || selectedScheduleId) {
            setSelectedScheduleId("");
            setScheduleViewMode("calendar");
            setScheduleEditorMode("create");
            resetScheduleSaveState("");
          }
        }, [isStandaloneCalendarMode, scheduleViewMode, selectedScheduleId, taskView]);

        useEffect(() => {
          if (!isStandaloneCalendarMode) {
            return;
          }
          if (taskView !== "calendar") {
            setTaskView("calendar");
          }
          setSelectedTaskId("");
          setProjectTaskDetailScreenOpen(false);
          setDraftTask(null);
        }, [isStandaloneCalendarMode, taskView]);

        useEffect(() => {
          if (!selectedTaskId || taskView === "threads") {
            const isProjectConnectorBrowserActive = projectConnectorBrowserActiveRef.current || taskConnectorBrowserMode === "project" || taskConnectorBrowserMode === "project-composer";
            setTaskDetailPopover("");
            setTaskSkillsPopoverOpen(false);
            if (!isProjectConnectorBrowserActive) {
              setTaskConnectorBrowserOpen(false);
            }
          }
        }, [selectedTaskId, taskConnectorBrowserMode, taskView]);

        useEffect(() => {
          const requestToken = String(openTaskRequest?.token || "").trim();
          if (!openTaskRequest?.taskId || !openTaskRequest?.projectId || !requestToken) {
            return;
          }
          if (handledOpenTaskRequestTokenRef.current === requestToken) {
            return;
          }
          handledOpenTaskRequestTokenRef.current = requestToken;
          setTaskView("backlog");
          setSelectedProjectId(openTaskRequest.projectId);
          setPendingExternalTaskOpenRequest({
            projectId: openTaskRequest.projectId,
            taskId: openTaskRequest.taskId,
          });
        }, [openTaskRequest]);

        useEffect(() => {
          selectedTaskIdRef.current = selectedTaskId;
        }, [selectedTaskId]);

        useEffect(() => {
          if (!selectedTaskId || (taskView !== "backlog" && taskView !== "board")) {
            setProjectTaskDetailScreenOpen(false);
          }
        }, [selectedTaskId, taskView]);

        const isTaskKeyboardNavigationBlocked = Boolean(
          boardToolbarPopover
          || backlogToolbarPopover
          || releaseBacklogToolbarPopover
          || backlogTaskContextMenu
          || taskStatusMenuState
          || taskDetailPopover
          || taskDetailSelectPopover
          || taskSkillsPopoverOpen
          || taskParentPickerState
          || boardBlockedPickerState
          || taskDeleteDialogState
          || taskScheduleDialogState
          || taskEnvironmentFilePickerOpen
          || taskEnvironmentChangeDialog
          || taskConnectorBrowserOpen
          || projectEnvironmentFilePickerOpen
        );

        useEffect(() => {
          const activeTaskNavigationIds = taskView === "board"
            ? boardNavigationTaskIds
            : taskView === "backlog"
              ? backlogNavigationTaskIds
              : [];

          if ((taskView !== "board" && taskView !== "backlog") || !selectedProjectId || !selectedTaskId || activeTaskNavigationIds.length < 2 || isTaskKeyboardNavigationBlocked) {
            return undefined;
          }

          function handleTaskNavigationKeyDown(event) {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
              return;
            }
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
              return;
            }
            if (isBoardTaskKeyboardNavigationBlockedTarget(event.target)) {
              return;
            }

            const currentSelectedTaskId = selectedTaskIdRef.current || selectedTaskId;
            const currentTaskIndex = activeTaskNavigationIds.indexOf(currentSelectedTaskId);
            if (currentTaskIndex === -1) {
              return;
            }

            const nextTaskIndex = event.key === "ArrowUp"
              ? currentTaskIndex - 1
              : currentTaskIndex + 1;
            if (nextTaskIndex < 0 || nextTaskIndex >= activeTaskNavigationIds.length) {
              return;
            }

            const nextTaskId = activeTaskNavigationIds[nextTaskIndex];
            if (!nextTaskId || nextTaskId === currentSelectedTaskId) {
              return;
            }

            event.preventDefault();
            handleSelectTask(nextTaskId, { screen: projectTaskDetailScreenOpen });
          }

          window.addEventListener("keydown", handleTaskNavigationKeyDown);
          return () => window.removeEventListener("keydown", handleTaskNavigationKeyDown);
        }, [
          backlogNavigationTaskIds,
          backlogTaskContextMenu,
          backlogToolbarPopover,
          boardBlockedPickerState,
          boardNavigationTaskIds,
          boardToolbarPopover,
          isTaskKeyboardNavigationBlocked,
          projectEnvironmentFilePickerOpen,
          projectTaskDetailScreenOpen,
          releaseBacklogToolbarPopover,
          selectedProjectId,
          selectedTaskId,
          taskStatusMenuState,
          taskConnectorBrowserOpen,
          taskDeleteDialogState,
          taskDetailPopover,
          taskDetailSelectPopover,
          taskEnvironmentChangeDialog,
          taskEnvironmentFilePickerOpen,
          taskParentPickerState,
          taskScheduleDialogState,
          taskSkillsPopoverOpen,
          taskView,
        ]);

        useEffect(() => {
          scheduleDraftRef.current = scheduleDraft;
        }, [scheduleDraft]);

        useEffect(() => () => {
          if (scheduleAutosaveTimerRef.current) {
            window.clearTimeout(scheduleAutosaveTimerRef.current);
            scheduleAutosaveTimerRef.current = null;
          }
        }, []);

	        useEffect(() => {
	          if (!selectedProjectId || !selectedTaskId || taskView === "threads") {
	            taskDetailAutoLoadKeyRef.current = "";
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	            selectedTaskId,
	            taskView,
	          ].join("|");
	          if (taskDetailAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          taskDetailAutoLoadKeyRef.current = loadKey;

	          let isActive = true;
	          void loadTaskDetails(selectedTaskId).catch((error) => {
            if (!isActive) {
              return;
            }
            console.warn("Failed to refresh task details", error);
          });

          return () => {
            isActive = false;
          };
	        }, [backendUrl, requestHeaders, requestHeadersKey, selectedProjectId, selectedTaskId, taskView]);

        useEffect(() => {
          const requestToken = String(navigationRequest?.token || "").trim();
          if (!requestToken) {
            return;
          }

          const requestedProjectId = String(navigationRequest?.projectId || "").trim();
          const requestedTaskId = String(navigationRequest?.taskId || "").trim();
          const requestedView = navigationRequest?.view === "calendar"
            ? "calendar"
            : navigationRequest?.view === "overview"
              ? "overview"
              : "backlog";
          const nextView = isStandaloneCalendarMode
            ? "calendar"
            : (requestedView === "calendar" ? "backlog" : requestedView);
          const requestedMissionControlAction = navigationRequest?.missionControlAction === "run"
            ? "run"
            : navigationRequest?.missionControlAction === "open"
              ? "open"
              : "";
          const requestedProjectComposerAction = navigationRequest?.projectComposerAction === "create"
            ? "create"
            : navigationRequest?.projectComposerAction === "edit"
              ? "edit"
            : navigationRequest?.projectComposerAction === "restore-connector"
              ? "restore-connector"
              : "";
          const requestedProjectRecord = navigationRequest?.projectRecord && typeof navigationRequest.projectRecord === "object" && !Array.isArray(navigationRequest.projectRecord)
            ? normalizePlaygroundProjectRecord(navigationRequest.projectRecord)
            : null;
          const matchingRequestedProjectRecord = requestedProjectRecord?.id && requestedProjectRecord.id === requestedProjectId
            ? requestedProjectRecord
            : null;
          const requestedProjectComposerConnectorRestoreState = requestedProjectComposerAction === "restore-connector"
            ? normalizePlaygroundProjectComposerConnectorRestoreState(navigationRequest?.projectComposerConnectorRestoreState)
            : null;
          const requestedProjectComposerDraft = navigationRequest?.projectComposerDraft && typeof navigationRequest.projectComposerDraft === "object" && !Array.isArray(navigationRequest.projectComposerDraft)
            ? {
                name: String(navigationRequest.projectComposerDraft.name || "").trim(),
                description: String(navigationRequest.projectComposerDraft.description || navigationRequest.projectComposerDraft.goal || "").trim(),
              }
            : null;

          console.info("[connector-debug] tasks navigation request received", {
            requestToken,
            requestedProjectId,
            requestedView,
            nextView,
            selectedProjectId,
            currentTaskView: taskView,
            requestedTaskId,
            activePage: "tasks",
          });

          if (requestedProjectId) {
            if (matchingRequestedProjectRecord) {
              commitLocalProjectRecord(matchingRequestedProjectRecord, {
                summary: matchingRequestedProjectRecord.summary,
                selectImmediately: true,
              });
            }
            handleSelectProject(requestedProjectId);
          } else {
            handleSelectProject("");
          }

          setTaskView(nextView);
          setPendingExternalTaskOpenRequest(
            requestedProjectId && requestedTaskId
              ? {
                  projectId: requestedProjectId,
                  taskId: requestedTaskId,
                }
              : null
          );
          if (requestedView === "calendar") {
            if (!requestedTaskId) {
              setSelectedTaskId("");
            }
            setSelectedScheduleId("");
            setScheduleViewMode("calendar");
            setScheduleEditorMode("create");
            resetScheduleSaveState("");
          }

          setPendingNavigationMissionControlRequest(
            requestedMissionControlAction && requestedProjectId
              ? {
                  token: requestToken,
                  action: requestedMissionControlAction,
                  projectId: requestedProjectId,
                  projectRecord: matchingRequestedProjectRecord,
                }
              : null
          );
          setPendingNavigationProjectComposerRequest(
            requestedProjectComposerAction === "create"
              ? {
                  token: requestToken,
                  action: "create",
                  draft: requestedProjectComposerDraft,
                }
              : requestedProjectComposerAction === "edit" && requestedProjectId
                ? {
                    token: requestToken,
                    action: "edit",
                    projectId: requestedProjectId,
                    projectRecord: matchingRequestedProjectRecord,
                  }
              : requestedProjectComposerConnectorRestoreState
                ? {
                    token: requestToken,
                    action: "restore-connector",
                    restoreState: requestedProjectComposerConnectorRestoreState,
                  }
                : null
          );
          if (typeof onNavigationRequestHandled === "function") {
            onNavigationRequestHandled(requestToken);
          }
        }, [isStandaloneCalendarMode, navigationRequest, onNavigationRequestHandled]);

        useEffect(() => {
          setProjectOverviewVisibleThreadCount(5);
          setProjectOverviewVisibleActivityCount(5);
        }, [selectedProjectId, taskView]);

        useEffect(() => {
          setProjectOverviewHomeTab("general");
          setProjectOverviewPermissionTeamId("");
          setProjectOverviewPermissionRoleId("member");
          projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
        }, [selectedProjectId]);

        useEffect(() => {
          const pendingRequestToken = String(pendingNavigationMissionControlRequest?.token || "").trim();
          const pendingProjectId = String(pendingNavigationMissionControlRequest?.projectId || "").trim();
          if (!pendingRequestToken || !pendingProjectId) {
            return;
          }
          if (selectedProjectId !== pendingProjectId || taskView !== "backlog") {
            return;
          }
          const pendingProjectRecord = pendingNavigationMissionControlRequest?.projectRecord && typeof pendingNavigationMissionControlRequest.projectRecord === "object" && !Array.isArray(pendingNavigationMissionControlRequest.projectRecord)
            ? normalizePlaygroundProjectRecord(pendingNavigationMissionControlRequest.projectRecord)
            : null;
          const resolvedPendingProject = pendingProjectRecord?.id === pendingProjectId
            ? pendingProjectRecord
            : selectedProject?.id === pendingProjectId
              ? selectedProject
              : selectedProjectSnapshot?.id === pendingProjectId
                ? selectedProjectSnapshot
                : projects.find((project) => project?.id === pendingProjectId) || null;
          if (!resolvedPendingProject?.id) {
            return;
          }
          if (pendingProjectRecord?.id === pendingProjectId) {
            commitLocalProjectRecord(pendingProjectRecord, {
              summary: pendingProjectRecord.summary,
              selectImmediately: true,
            });
          }
          if (pendingNavigationMissionControlRequest?.action === "open") {
            openMissionControlStrategySidebar();
            setPendingNavigationMissionControlRequest(null);
            return;
          }
          const didOpen = openMissionControlComposer({
            keepStrategyOpen: true,
            projectRecord: resolvedPendingProject,
          });
          if (didOpen === false) {
            return;
          }
          setPendingNavigationMissionControlRequest(null);
        }, [pendingNavigationMissionControlRequest, projects, selectedProject, selectedProjectId, selectedProjectSnapshot, taskView]);

        useEffect(() => {
          const pendingRequestToken = String(pendingNavigationProjectComposerRequest?.token || "").trim();
          if (!pendingRequestToken) {
            return;
          }
          const pendingAction = pendingNavigationProjectComposerRequest?.action === "restore-connector"
            ? "restore-connector"
            : pendingNavigationProjectComposerRequest?.action === "edit"
              ? "edit"
              : "create";
          if (pendingAction === "restore-connector") {
            const restoreState = normalizePlaygroundProjectComposerConnectorRestoreState(pendingNavigationProjectComposerRequest?.restoreState);
            const restoredProjectId = String(restoreState?.projectDraft?.id || "").trim();
            if (!restoreState) {
              setPendingNavigationProjectComposerRequest(null);
              return;
            }
            if (restoreState.projectComposerMode === "edit" && restoredProjectId && selectedProjectId !== restoredProjectId) {
              return;
            }
            openProjectComposerConnectorBrowserRestore(restoreState);
            setPendingNavigationProjectComposerRequest(null);
            return;
          }
          if (pendingAction === "edit") {
            const pendingProjectId = String(pendingNavigationProjectComposerRequest?.projectId || "").trim();
            if (!pendingProjectId || selectedProjectId !== pendingProjectId) {
              return;
            }
            const pendingProjectRecord = pendingNavigationProjectComposerRequest?.projectRecord && typeof pendingNavigationProjectComposerRequest.projectRecord === "object" && !Array.isArray(pendingNavigationProjectComposerRequest.projectRecord)
              ? normalizePlaygroundProjectRecord(pendingNavigationProjectComposerRequest.projectRecord)
              : null;
            const resolvedProject = pendingProjectRecord?.id === pendingProjectId
              ? pendingProjectRecord
              : selectedProject?.id === pendingProjectId
                ? selectedProject
                : selectedProjectSnapshot?.id === pendingProjectId
                  ? selectedProjectSnapshot
                  : projects.find((project) => project?.id === pendingProjectId) || null;
            if (!resolvedProject?.id) {
              return;
            }
            openProjectComposerForEdit(resolvedProject);
            setPendingNavigationProjectComposerRequest(null);
            return;
          }
          if (selectedProjectId) {
            return;
          }
          openProjectComposer(pendingNavigationProjectComposerRequest?.draft || {});
          setPendingNavigationProjectComposerRequest(null);
        }, [pendingNavigationProjectComposerRequest, projects, selectedProject, selectedProjectId, selectedProjectSnapshot]);

        useEffect(() => {
          if (!selectedScheduleId) return;
          if (schedulesById[selectedScheduleId]) return;
          setSelectedScheduleId("");
          setScheduleViewMode("calendar");
          setScheduleEditorMode("create");
        }, [schedulesById, selectedScheduleId]);

        useEffect(() => {
          setIsScheduleTaskEditing(false);
          setIsScheduleDescriptionEditing(false);
          setScheduleDetailsCollapsed(false);
          setTaskDetailSelectPopover("");
        }, [scheduleViewMode, selectedScheduleId]);

        useEffect(() => {
          setTaskDetailSelectPopover("");
        }, [scheduleDetailsCollapsed]);

        useEffect(() => {
          if (!selectedReleaseId) return;
          if (releasesById[selectedReleaseId]) return;
          setSelectedReleaseId("");
        }, [releasesById, selectedReleaseId]);

        useEffect(() => {
          if (!selectedProjectId || tasks.length === 0) {
            setSelectedTaskId("");
            setProjectTaskDetailScreenOpen(false);
            setDraftTask(null);
            return;
          }
          if (selectedTaskId && tasksById[selectedTaskId]) {
            return;
          }
          if (selectedTaskId && !tasksById[selectedTaskId]) {
            setSelectedTaskId("");
            setProjectTaskDetailScreenOpen(false);
          }
        }, [selectedProjectId, selectedTaskId, tasks, tasksById]);

        useEffect(() => {
          if (selectedTaskId || !projectOverviewSidebarAutoCollapsedForTaskRef.current) {
            return;
          }
          projectOverviewSidebarAutoCollapsedForTaskRef.current = false;
          setProjectOverviewSidebarCollapsed(false);
        }, [selectedTaskId]);

        useEffect(() => {
          if (!pendingExternalTaskOpenRequest) {
            return;
          }
          if (selectedProjectId !== pendingExternalTaskOpenRequest.projectId) {
            return;
          }
          if (!tasksById[pendingExternalTaskOpenRequest.taskId]) {
            return;
          }
          handleSelectTask(pendingExternalTaskOpenRequest.taskId);
          setPendingExternalTaskOpenRequest(null);
        }, [pendingExternalTaskOpenRequest, selectedProjectId, tasksById]);

        useEffect(() => {
          if (!selectedTaskSnapshot) {
            const shouldResetTaskConnectorBrowser = !(projectConnectorBrowserActiveRef.current || taskConnectorBrowserMode === "project" || taskConnectorBrowserMode === "project-composer");
            setTaskDetailPopover("");
            setTaskSkillsPopoverOpen(false);
            if (shouldResetTaskConnectorBrowser) {
              setTaskConnectorBrowserOpen(false);
            }
            setTaskParentPickerState(null);
            setPreviewedTaskAttachmentId("");
            setTaskEnvironmentFilePickerOpen(false);
            setTaskEnvironmentFilePickerInventory([]);
            setTaskEnvironmentFilePickerState({
              status: "idle",
              error: "",
            });
            setTaskEnvironmentFilePickerSearch("");
            setTaskEnvironmentFilePickerExpandedFolders([]);
            setTaskEnvironmentFilePickerSelectedPaths([]);
            setTaskEnvironmentChangeDialog(null);
            setTaskDeleteDialogState(null);
            setTaskScheduleDialogState(null);
            setTaskScheduleDialogPhase("idle");
            if (shouldResetTaskConnectorBrowser) {
              setTaskConnectorBrowserHistory([{ source: "github", folderId: null }]);
              setTaskConnectorBrowserHistoryIndex(0);
              setTaskConnectorBrowserSearchQuery("");
              setTaskConnectorBrowserPreviewId("");
              setTaskConnectorBrowserExpandedFolderIds([]);
              setTaskConnectorBrowserSelectedIds({
                github: [],
                googleDrive: [],
                oneDrive: [],
              });
              setTaskConnectorBrowserSelectedNotionId("");
              setTaskConnectorBrowserPreviewState({
                status: "idle",
                kind: "",
                content: "",
                error: "",
              });
            }
            if (taskScheduleDialogTimerRef.current) {
              window.clearTimeout(taskScheduleDialogTimerRef.current);
              taskScheduleDialogTimerRef.current = null;
            }
            setIsTaskAttachmentDragging(false);
            revokeTaskAttachmentListObjectUrls(draftTask?.attachments);
            setDraftTask(null);
            return;
          }
          if (draftTask?.id === selectedTaskSnapshot.id && editorDirtyRef.current) {
            return;
          }
          if (draftTask?.id && draftTask.id !== selectedTaskSnapshot.id) {
            revokeTaskAttachmentListObjectUrls(draftTask?.attachments);
            setPreviewedTaskAttachmentId("");
          }
          editorDirtyRef.current = false;
          resetSaveState("");
          setDraftTask(normalizePlaygroundTaskRecord({
            ...selectedTaskSnapshot,
            ticketNumber: taskTicketNumbersById[selectedTaskSnapshot.id] || selectedTaskSnapshot.ticketNumber,
          }));
        }, [draftTask?.id, selectedTaskSnapshot, taskConnectorBrowserMode, taskTicketNumbersById]);

        useEffect(() => {
          if (!draftTask?.id || draftTask.assigneeAgentId || !defaultTaskAssigneeId) {
            return;
          }
          updateDraftField("assigneeAgentId", defaultTaskAssigneeId, { autosave: true });
        }, [defaultTaskAssigneeId, draftTask?.assigneeAgentId, draftTask?.id]);

        useEffect(() => {
          setTaskTitleInputValue(draftTask?.title || "");
        }, [draftTask?.id, draftTask?.title]);

        useEffect(() => {
          setTaskCommentInputValue("");
        }, [draftTask?.id]);

        useEffect(() => {
          setIsTaskDescriptionEditing(false);
          setTaskDetailsCollapsed(false);
        }, [draftTask?.id]);

        useEffect(() => {
          if (!backlogEditingTaskId) {
            return;
          }
          const activeBacklogTask = tasks.find((task) => task.id === backlogEditingTaskId);
          if (!activeBacklogTask) {
            setBacklogEditingTaskId("");
            setBacklogTitleInputValue("");
            return;
          }
          setBacklogTitleInputValue(activeBacklogTask.title || "");
        }, [backlogEditingTaskId, tasks]);

        useEffect(() => {
          setBacklogDraggingTaskId("");
          setBacklogDropTargetKey("");
        }, [backlogFilterMode, backlogSortMode, normalizedSearchQuery, selectedProjectId]);

        useEffect(() => {
          setBoardDraggingTaskId("");
          setBoardDropLaneId("");
          setBoardBlockedPickerState(null);
        }, [boardFilterMode, normalizedSearchQuery, selectedProjectId, selectedReleaseId]);

        useEffect(() => {
          if (!boardBlockedPickerState?.taskId) {
            return;
          }
          if (!tasksById[boardBlockedPickerState.taskId]) {
            setBoardBlockedPickerState(null);
          }
        }, [boardBlockedPickerState?.taskId, tasksById]);

        useEffect(() => {
          if (!taskEnvironmentFilePickerOpen) {
            return undefined;
          }

          if (!activeTaskEnvironmentId) {
            setTaskEnvironmentFilePickerInventory([]);
            setTaskEnvironmentFilePickerState({
              status: "error",
              error: "Select an environment before browsing files.",
            });
            return undefined;
          }

          const controller = new AbortController();
          setTaskEnvironmentFilePickerState({
            status: "loading",
            error: "",
          });
          setTaskEnvironmentFilePickerSelectedPaths([]);
          setTaskEnvironmentFilePickerExpandedFolders([]);

          void fetch(
            buildPlaygroundEnvironmentFilesListUrl(backendUrl, activeTaskEnvironmentId, "", -1),
            {
              method: "GET",
              headers: requestHeaders,
              signal: controller.signal,
            }
          )
            .then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment files.");
              }
              if (controller.signal.aborted) {
                return;
              }
              setTaskEnvironmentFilePickerInventory(normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data));
              setTaskEnvironmentFilePickerState({
                status: "ready",
                error: "",
              });
            })
            .catch((error) => {
              if (controller.signal.aborted) {
                return;
              }
              setTaskEnvironmentFilePickerInventory([]);
              setTaskEnvironmentFilePickerState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load environment files.",
              });
            });

          return () => controller.abort();
        }, [activeTaskEnvironmentId, backendUrl, requestHeaders, taskEnvironmentFilePickerOpen]);

        useEffect(() => {
          if (!projectEnvironmentFilePickerOpen) {
            return undefined;
          }

          if (!activeProjectAttachmentEnvironmentId) {
            setProjectEnvironmentFilePickerInventory([]);
            setProjectEnvironmentFilePickerState({
              status: "error",
              error: "Select a default environment before browsing files.",
            });
            return undefined;
          }

          const controller = new AbortController();
          setProjectEnvironmentFilePickerState({
            status: "loading",
            error: "",
          });
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectEnvironmentFilePickerExpandedFolders([]);

          void fetch(
            buildPlaygroundEnvironmentFilesListUrl(backendUrl, activeProjectAttachmentEnvironmentId, "", -1),
            {
              method: "GET",
              headers: requestHeaders,
              signal: controller.signal,
            }
          )
            .then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment files.");
              }
              if (controller.signal.aborted) {
                return;
              }
              setProjectEnvironmentFilePickerInventory(normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data));
              setProjectEnvironmentFilePickerState({
                status: "ready",
                error: "",
              });
            })
            .catch((error) => {
              if (controller.signal.aborted) {
                return;
              }
              setProjectEnvironmentFilePickerInventory([]);
              setProjectEnvironmentFilePickerState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load environment files.",
              });
            });

          return () => controller.abort();
        }, [activeProjectAttachmentEnvironmentId, backendUrl, projectEnvironmentFilePickerOpen, requestHeaders]);

        useEffect(() => {
          if (!taskConnectorBrowserOpen && !projectConnectorBrowserDialog) {
            return undefined;
          }

          if (taskConnectorBrowserCurrentSource === "notion") {
            const notionConfig = taskConnectorConfigByKey.notion;
            if (!notionConfig?.connected || !notionConfig?.fetchDatabases || taskConnectorBrowserNotionDatabasesLoaded || taskConnectorBrowserLoadingState.notion) {
              return undefined;
            }
            void loadTaskConnectorNotionDatabases();
            return undefined;
          }

          const currentConfig = taskConnectorBrowserCurrentConfig;
          if (!currentConfig?.connected || !currentConfig?.fetchItems) {
            return undefined;
          }

          const normalizedFolderId = taskConnectorBrowserCurrentFolderId || "root";
          const loadedFolderIds = taskConnectorBrowserLoadedFolderIds[taskConnectorBrowserCurrentKey] || [];
          const loadingFolderIds = taskConnectorBrowserLoadingFolderIds[taskConnectorBrowserCurrentKey] || [];
          if (loadedFolderIds.includes(normalizedFolderId) || loadingFolderIds.includes(normalizedFolderId)) {
            return undefined;
          }

          void loadTaskConnectorFolder(taskConnectorBrowserCurrentSource, normalizedFolderId);
          return undefined;
        }, [
          loadTaskConnectorFolder,
          loadTaskConnectorNotionDatabases,
          taskConnectorBrowserCurrentConfig,
          taskConnectorBrowserCurrentFolderId,
          taskConnectorBrowserCurrentKey,
          taskConnectorBrowserCurrentSource,
          taskConnectorBrowserLoadedFolderIds,
          taskConnectorBrowserLoadingFolderIds,
          taskConnectorBrowserLoadingState.notion,
          taskConnectorBrowserNotionDatabasesLoaded,
          taskConnectorBrowserOpen,
          projectConnectorBrowserDialog,
          taskConnectorConfigByKey.notion,
        ]);

        useEffect(() => {
          if (!taskConnectorBrowserPreviewId) {
            setTaskConnectorBrowserPreviewState({
              status: "idle",
              kind: "",
              content: "",
              error: "",
            });
            return;
          }
          if (taskConnectorBrowserItems.some((item) => item.id === taskConnectorBrowserPreviewId)) {
            return;
          }
          setTaskConnectorBrowserPreviewId("");
        }, [taskConnectorBrowserItems, taskConnectorBrowserPreviewId]);

        useEffect(() => {
          if ((!taskConnectorBrowserOpen && !projectConnectorBrowserDialog) || !taskConnectorBrowserPreviewItem || taskConnectorBrowserPreviewItem.isFolder) {
            setTaskConnectorBrowserPreviewState({
              status: "idle",
              kind: "",
              content: "",
              error: "",
            });
            return undefined;
          }

          const fileKind = getPlaygroundFileKind(taskConnectorBrowserPreviewItem);
          const connectorFetchFileContent = taskConnectorBrowserCurrentSource !== "notion"
            ? taskConnectorBrowserCurrentConfig?.fetchFileContent
            : null;
          if (connectorFetchFileContent) {
            let cancelled = false;
            setTaskConnectorBrowserPreviewState({
              status: "loading",
              kind: "",
              content: "",
              error: "",
            });

            void connectorFetchFileContent(taskConnectorBrowserPreviewItem)
              .then((payload) => {
                if (cancelled) {
                  return;
                }
                if (!payload?.content) {
                  if (fileKind === "image" && taskConnectorBrowserPreviewItem.previewUrl) {
                    setTaskConnectorBrowserPreviewState({
                      status: "ready",
                      kind: "image",
                      content: taskConnectorBrowserPreviewItem.previewUrl,
                      error: "",
                    });
                  } else {
                    setTaskConnectorBrowserPreviewState({
                      status: "idle",
                      kind: "",
                      content: "",
                      error: "",
                    });
                  }
                  return;
                }

                if (fileKind === "image") {
                  const mimeType = taskConnectorBrowserPreviewItem.mimeType || payload.mimeType || "image/png";
                  setTaskConnectorBrowserPreviewState({
                    status: "ready",
                    kind: "image",
                    content: "data:" + mimeType + ";base64," + String(payload.content || "").replace(/\\s+/g, ""),
                    error: "",
                  });
                  return;
                }

                if (payload.encoding === "base64") {
                  setTaskConnectorBrowserPreviewState({
                    status: "ready",
                    kind: "text",
                    content: decodeTaskConnectorBase64Text(payload.content).slice(0, 5000),
                    error: "",
                  });
                  return;
                }

                setTaskConnectorBrowserPreviewState({
                  status: "ready",
                  kind: "text",
                  content: String(payload.content || "").slice(0, 5000),
                  error: "",
                });
              })
              .catch((error) => {
                if (cancelled) {
                  return;
                }
                if (fileKind === "image" && taskConnectorBrowserPreviewItem.previewUrl) {
                  setTaskConnectorBrowserPreviewState({
                    status: "ready",
                    kind: "image",
                    content: taskConnectorBrowserPreviewItem.previewUrl,
                    error: "",
                  });
                  return;
                }
                setTaskConnectorBrowserPreviewState({
                  status: "error",
                  kind: "",
                  content: "",
                  error: error instanceof Error ? error.message : "Failed to load preview.",
                });
              });

            return () => {
              cancelled = true;
            };
          }

          if (fileKind === "image" && taskConnectorBrowserPreviewItem.previewUrl) {
            setTaskConnectorBrowserPreviewState({
              status: "ready",
              kind: "image",
              content: taskConnectorBrowserPreviewItem.previewUrl,
              error: "",
            });
            return undefined;
          }

          setTaskConnectorBrowserPreviewState({
            status: "idle",
            kind: "",
            content: "",
            error: "",
          });
          return undefined;
        }, [
          taskConnectorBrowserCurrentConfig,
          taskConnectorBrowserCurrentSource,
          taskConnectorBrowserOpen,
          projectConnectorBrowserDialog,
          taskConnectorBrowserPreviewItem,
        ]);

        useEffect(() => {
          if (!projectEnvironmentFilePickerOpen && !taskEnvironmentFilePickerOpen && !taskEnvironmentChangeDialog && !taskScheduleDialogState && !taskConnectorBrowserOpen && !projectConnectorBrowserDialog && !taskParentPickerState && !boardBlockedPickerState) {
            return undefined;
          }

          function handleTaskOverlayEscape(event) {
            if (event.key !== "Escape") return;
            if (projectEnvironmentFilePickerOpen) {
              setProjectEnvironmentFilePickerOpen(false);
            }
            if (taskEnvironmentChangeDialog?.isSubmitting) {
              return;
            }
            if (taskEnvironmentFilePickerOpen) {
              setTaskEnvironmentFilePickerOpen(false);
            }
            if (taskEnvironmentChangeDialog) {
              setTaskEnvironmentChangeDialog(null);
            }
            if (taskScheduleDialogState) {
              closeTaskScheduleDialog();
            }
            if (taskConnectorBrowserOpen) {
              closeTaskConnectorBrowser();
            }
            if (projectConnectorBrowserDialog) {
              closeTaskConnectorBrowser();
            }
            if (taskParentPickerState) {
              setTaskParentPickerState(null);
            }
            if (boardBlockedPickerState?.isSubmitting) {
              return;
            }
            if (boardBlockedPickerState) {
              setBoardBlockedPickerState(null);
            }
          }

          window.addEventListener("keydown", handleTaskOverlayEscape);
          return () => window.removeEventListener("keydown", handleTaskOverlayEscape);
        }, [boardBlockedPickerState, projectConnectorBrowserDialog, projectEnvironmentFilePickerOpen, taskConnectorBrowserOpen, taskEnvironmentChangeDialog, taskEnvironmentFilePickerOpen, taskParentPickerState, taskScheduleDialogState]);

        useEffect(() => {
          if (!taskScheduleDialogState) {
            return undefined;
          }

          function handleTaskSchedulePointerDown(event) {
            const target = event.target instanceof Element ? event.target : null;
            if (!target || target.closest(".playground-tasks-schedule-anchor, .playground-tasks-schedule-panel")) {
              return;
            }
            closeTaskScheduleDialog();
          }

          window.addEventListener("pointerdown", handleTaskSchedulePointerDown);
          return () => window.removeEventListener("pointerdown", handleTaskSchedulePointerDown);
        }, [taskScheduleDialogState]);

        useEffect(() => () => {
          if (taskScheduleDialogTimerRef.current) {
            window.clearTimeout(taskScheduleDialogTimerRef.current);
            taskScheduleDialogTimerRef.current = null;
          }
        }, []);

        useLayoutEffect(() => {
          resizeTaskDescriptionTextarea(taskDescriptionTextareaRef.current);
        }, [draftTask?.description, draftTask?.id]);

        useLayoutEffect(() => {
          resizeTaskCommentTextarea(taskCommentTextareaRef.current);
        }, [draftTask?.id, isCalendarScheduleDetailMode, selectedScheduleId, taskCommentInputValue]);

        useEffect(() => {
          setTaskCommentComposerOpen(false);
        }, [draftTask?.id]);

        useEffect(() => {
          const textarea = taskDescriptionTextareaRef.current;
          const detailMain = taskDetailMainRef.current;
          if (!textarea || !detailMain) return undefined;

          let frameId = 0;
          const timeoutIds = [];
          const scheduleResize = () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            frameId = window.requestAnimationFrame(() => {
              resizeTaskDescriptionTextarea(taskDescriptionTextareaRef.current);
            });
          };

          scheduleResize();
          [120, 240, 360].forEach((delay) => {
            timeoutIds.push(window.setTimeout(scheduleResize, delay));
          });

          if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", scheduleResize);
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              window.removeEventListener("resize", scheduleResize);
            };
          }

          const observer = new ResizeObserver(() => {
            scheduleResize();
          });
          observer.observe(detailMain);

          return () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            observer.disconnect();
          };
        }, [draftTask?.id, previewedTaskAttachmentId]);

        useEffect(() => {
          setIsMissionControlDocumentEditing(false);
          setMissionControlDocumentHistory({ past: [], future: [] });
        }, [selectedProjectId]);

	        useEffect(() => {
	          setIsMissionControlInstructionsEditing(false);
	          setIsProjectRulesEditing(false);
	          setMissionControlCommentInputValue("");
	          setMissionControlSaveState({
            isSaving: false,
            error: "",
            message: "",
          });
        }, [selectedProjectId]);

        useEffect(() => {
          if (isMissionControlDocumentEditing) {
            return;
          }
          updateMissionControlDocumentDraftValue(String(selectedProjectMissionControl.document || ""), { recordHistory: false });
          setMissionControlDocumentHistory({ past: [], future: [] });
        }, [
          isMissionControlDocumentEditing,
          selectedProjectId,
          selectedProjectMissionControl.document,
          selectedProjectMissionControl.updatedAt,
        ]);

	        useEffect(() => {
	          if (isMissionControlInstructionsEditing) {
	            return;
          }
          setMissionControlInstructionsDraft(String(selectedProjectMissionInstructions || ""));
        }, [
          isMissionControlInstructionsEditing,
          selectedProjectId,
          selectedProjectMissionInstructions,
          selectedProjectMissionControl.instructions,
	          selectedProjectMissionControl.updatedAt,
	        ]);

	        useEffect(() => {
	          if (isProjectRulesEditing) {
	            return;
	          }
	          setProjectRulesDraft(String(selectedProjectRules || ""));
	          setProjectRuleInputValue("");
	          setProjectRuleComposerOpen(false);
	          setProjectRuleComposerVisible(false);
	          setProjectRuleComposerClosing(false);
	          setProjectRulesSaveState({
	            isSaving: false,
	            error: "",
	          });
	          setProjectRuleEditingIndex(-1);
	          setProjectRuleEditingValue("");
	        }, [
	          isProjectRulesEditing,
	          selectedProjectId,
	          selectedProjectRules,
	        ]);

	        useEffect(() => {
	          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief(selectedProjectStrategyBrief);
	          setMissionControlStrategyDraft((current) => {
	            const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(current);
	            const previousProjectId = missionControlStrategyDraftProjectIdRef.current;
	            const projectChanged = previousProjectId !== selectedProjectId;
	            missionControlStrategyDraftProjectIdRef.current = selectedProjectId;
	            if (
	              !projectChanged
	              && hasMeaningfulPlaygroundProjectStrategyBrief(currentStrategyBrief)
	              && !hasMeaningfulPlaygroundProjectStrategyBrief(nextStrategyBrief)
	            ) {
	              return currentStrategyBrief;
	            }
	            return nextStrategyBrief;
	          });
	        }, [
	          selectedProjectId,
	          selectedProjectStrategyBrief,
	          selectedProjectMissionControl.updatedAt,
	        ]);

        useEffect(() => {
          if (isMissionControlSetupOutcomesEditing) {
            return;
          }
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft);
          setMissionControlSetupOutcomesDraft(serializeMissionControlSetupOutcomesForInput(nextStrategyBrief.outcomes));
        }, [
          isMissionControlSetupOutcomesEditing,
          missionControlStrategyDraft,
          selectedProjectId,
        ]);

        useEffect(() => {
          if (!missionControlSetupOpen) {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(projectDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [
          missionControlSetupOpen,
          missionControlSetupOutcomesDraft,
          projectDraft.description,
        ]);

	        useLayoutEffect(() => {
	          if (!missionControlStrategyOpen && projectOverviewHomeTab !== "strategy" && projectOverviewHomeTab !== "rules") {
	            return;
	          }
	          resizeTaskDescriptionTextarea(missionControlDocumentTextareaRef.current);
	          resizeTaskDescriptionTextarea(missionControlInstructionsTextareaRef.current);
	          resizeTaskDescriptionTextarea(projectRulesTextareaRef.current);
	          resizeTaskDescriptionTextarea(projectRuleComposerTextareaRef.current);
	          resizeTaskDescriptionTextarea(projectRuleEditTextareaRef.current);
	        }, [missionControlDocumentDraft, missionControlInstructionsDraft, projectRulesDraft, projectRuleInputValue, projectRuleEditingValue, missionControlStrategyOpen, projectOverviewHomeTab, selectedProjectId]);

	        useEffect(() => {
	          if (!missionControlStrategyOpen && projectOverviewHomeTab !== "strategy" && projectOverviewHomeTab !== "rules") {
	            return undefined;
	          }

	          const textarea = projectOverviewHomeTab === "rules"
	            ? projectRulesTextareaRef.current
	            : missionControlDocumentTextareaRef.current;
	          const detailMain = taskDetailMainRef.current || (projectOverviewHomeTab === "rules"
	            ? projectOverviewRulesSurfaceRef.current
	            : projectOverviewStrategySurfaceRef.current);
	          if (!textarea || !detailMain) {
	            return undefined;
          }

          let frameId = 0;
          const timeoutIds = [];
          const scheduleResize = () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
	            frameId = window.requestAnimationFrame(() => {
	              resizeTaskDescriptionTextarea(missionControlDocumentTextareaRef.current);
	              resizeTaskDescriptionTextarea(missionControlInstructionsTextareaRef.current);
	              resizeTaskDescriptionTextarea(projectRulesTextareaRef.current);
	              resizeTaskDescriptionTextarea(projectRuleComposerTextareaRef.current);
	              resizeTaskDescriptionTextarea(projectRuleEditTextareaRef.current);
	            });
	          };

          scheduleResize();
          [120, 240, 360].forEach((delay) => {
            timeoutIds.push(window.setTimeout(scheduleResize, delay));
          });

          if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", scheduleResize);
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              window.removeEventListener("resize", scheduleResize);
            };
          }

          const observer = new ResizeObserver(() => {
            scheduleResize();
          });
          observer.observe(detailMain);

          return () => {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            observer.disconnect();
          };
	        }, [missionControlDocumentDraft, missionControlInstructionsDraft, projectRulesDraft, projectRuleInputValue, projectRuleEditingValue, missionControlStrategyOpen, projectOverviewHomeTab, selectedProjectId]);

        useEffect(() => {
          if (!previewedTaskAttachmentId) return;
          if (activeDetailAttachments.some((attachment) => attachment.id === previewedTaskAttachmentId)) {
            return;
          }
          setPreviewedTaskAttachmentId("");
        }, [activeDetailAttachments, previewedTaskAttachmentId]);

        useEffect(() => {
          if (!projectPreviewedAttachmentId) return;
          if (normalizePlaygroundTaskAttachmentList(projectAttachmentHostRecord?.attachments).some((attachment) => attachment.id === projectPreviewedAttachmentId)) {
            return;
          }
          setProjectPreviewedAttachmentId("");
        }, [projectAttachmentHostRecord?.attachments, projectPreviewedAttachmentId]);

        useEffect(() => () => {
          taskAttachmentObjectUrlsRef.current.forEach((url) => {
            URL.revokeObjectURL(url);
          });
          taskAttachmentObjectUrlsRef.current.clear();
        }, []);

`;
