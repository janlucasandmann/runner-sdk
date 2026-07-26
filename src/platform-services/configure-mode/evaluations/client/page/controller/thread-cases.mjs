export const EVALUATIONS_PAGE_CONTROLLER_THREAD_CASES_SCRIPT = String.raw`        function openEvaluationJsonlFilePicker() {
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          if (evaluationJsonlFileInputRef.current) {
            evaluationJsonlFileInputRef.current.click();
          }
        }

        function openEvaluationJsonlWorkspacePicker(set = activeSet) {
          const normalizedSetId = String(set?.id || activeSet?.id || "").trim();
          if (!normalizedSetId) return;
          const preferredEnvironmentId = String(
            String(set?.environmentType || "computer").trim().toLowerCase() === "project"
              ? defaultEnvironmentId || ""
              : set?.environmentId || defaultEnvironmentId || ""
          ).trim();
          const selectedEnvironment = evaluationJsonlWorkspaceEnvironmentOptions.find(
            (environment) => environment.id === preferredEnvironmentId
          ) || evaluationJsonlWorkspaceEnvironmentOptions[0] || null;
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          setEvaluationJsonlWorkspaceSetId(normalizedSetId);
          setEvaluationJsonlWorkspaceEnvironmentId(selectedEnvironment?.id || "");
          setEvaluationJsonlWorkspaceSearch("");
          setEvaluationJsonlWorkspaceSelectedPaths([]);
          setEvaluationJsonlWorkspaceExpandedFolders([]);
          setEvaluationJsonlWorkspaceState({ status: "idle", error: "" });
          setEvaluationJsonlWorkspacePickerOpen(true);
        }

        function closeEvaluationJsonlWorkspacePicker() {
          if (evaluationJsonlWorkspaceImporting) return;
          setEvaluationJsonlWorkspacePickerOpen(false);
          setEvaluationJsonlWorkspaceSetId("");
          setEvaluationJsonlWorkspaceSearch("");
          setEvaluationJsonlWorkspaceSelectedPaths([]);
          setEvaluationJsonlWorkspaceExpandedFolders([]);
        }

        function toggleEvaluationJsonlWorkspaceFolder(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return;
          setEvaluationJsonlWorkspaceExpandedFolders((current) => (
            current.includes(normalizedPath)
              ? current.filter((value) => value !== normalizedPath)
              : current.concat(normalizedPath)
          ));
        }

        function toggleEvaluationJsonlWorkspaceSelection(path) {
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath || !/\.jsonl$/i.test(normalizedPath)) return;
          setEvaluationJsonlWorkspaceSelectedPaths((current) => (
            current.includes(normalizedPath)
              ? current.filter((value) => value !== normalizedPath)
              : current.concat(normalizedPath)
          ));
        }

        function isEvaluationJsonlFile(file) {
          const fileName = String(file?.name || "").trim().toLowerCase();
          return fileName.endsWith(".jsonl");
        }

        async function handleEvaluationJsonlFiles(setId, fileList) {
          const normalizedSetId = String(setId || "").trim();
          const files = Array.from(fileList || []).filter(Boolean);
          if (!normalizedSetId || files.length === 0) return false;
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          const invalidFiles = files.filter((file) => !isEvaluationJsonlFile(file));
          if (invalidFiles.length > 0) {
            setEvaluationJsonlFileImportError("Only .jsonl files can be imported.");
            return false;
          }
          try {
            const importedRows = [];
            const importErrors = [];
            for (const file of files) {
              const fileName = String(file?.name || "cases.jsonl");
              const text = typeof file.text === "function"
                ? await file.text()
                : await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = () => reject(reader.error || new Error("Failed to read " + fileName));
                    reader.readAsText(file);
                  });
              const parsed = parsePlaygroundEvaluationJsonl(text);
              if (parsed.errors.length > 0) {
                importErrors.push(fileName + ": " + parsed.errors.join(", "));
              }
              importedRows.push(...parsed.rows);
            }
            if (importErrors.length > 0) {
              setEvaluationJsonlFileImportError(importErrors.join(" "));
              return false;
            }
            if (importedRows.length === 0) {
              setEvaluationJsonlFileImportError("No valid cases found in the selected JSONL file.");
              return false;
            }
            updateEvaluationSet(normalizedSetId, (set) => ({
              ...set,
              dataRows: [...set.dataRows, ...importedRows],
            }));
            setEvaluationJsonlFileImportMessage(
              "Imported " + importedRows.length + " " + (importedRows.length === 1 ? "case" : "cases") + "."
            );
            setEvaluationDetailTab("cases");
            return true;
          } catch (error) {
            setEvaluationJsonlFileImportError(error?.message || String(error));
            return false;
          }
        }

        async function handleImportEvaluationJsonlWorkspaceFiles() {
          const normalizedSetId = String(evaluationJsonlWorkspaceSetId || activeSet?.id || "").trim();
          const environmentId = String(evaluationJsonlWorkspaceEnvironmentId || "").trim();
          const selectedEntries = evaluationJsonlWorkspaceInventory.filter((entry) => {
            const normalizedPath = normalizeHistoryPath(entry?.path);
            return !entry?.isFolder
              && /\.jsonl$/i.test(normalizedPath)
              && evaluationJsonlWorkspaceSelectedPaths.includes(normalizedPath);
          });
          if (!normalizedSetId || !environmentId || selectedEntries.length === 0 || evaluationJsonlWorkspaceImporting) {
            return;
          }

          setEvaluationJsonlWorkspaceImporting(true);
          setEvaluationJsonlWorkspaceState((current) => ({ ...current, error: "" }));
          setEvaluationJsonlFileImportError("");
          try {
            const files = [];
            for (const entry of selectedEntries) {
              const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(backendUrl, environmentId, entry.path);
              const response = await fetch(downloadUrl, {
                method: "GET",
                headers: requestHeaders,
                cache: "no-store",
              });
              if (!response.ok) {
                throw new Error("Failed to load " + (entry.name || "JSONL file") + " (" + response.status + ")");
              }
              const contents = await response.text();
              files.push({
                name: entry.name || normalizeHistoryPath(entry.path).split("/").pop() || "cases.jsonl",
                text: async () => contents,
              });
            }
            const imported = await handleEvaluationJsonlFiles(normalizedSetId, files);
            if (imported) {
              setEvaluationJsonlWorkspacePickerOpen(false);
              setEvaluationJsonlWorkspaceSetId("");
              setEvaluationJsonlWorkspaceSearch("");
              setEvaluationJsonlWorkspaceSelectedPaths([]);
              setEvaluationJsonlWorkspaceExpandedFolders([]);
            } else {
              setEvaluationJsonlWorkspaceState((current) => ({
                ...current,
                status: "ready",
                error: "The selected JSONL files could not be imported. Check their structure and try again.",
              }));
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to import workspace files.";
            setEvaluationJsonlFileImportError(message);
            setEvaluationJsonlWorkspaceState((current) => ({ ...current, error: message }));
          } finally {
            setEvaluationJsonlWorkspaceImporting(false);
          }
        }

        function renderEvaluationJsonlWorkspaceRow(row) {
          const entry = row?.entry || {};
          const normalizedPath = normalizeHistoryPath(entry.path);
          const isSelected = evaluationJsonlWorkspaceSelectedPaths.includes(normalizedPath);
          const isExpanded = evaluationJsonlWorkspaceExpandedFolders.includes(normalizedPath);
          const metaValue = row?.searchMatch
            ? getPlaygroundEntryParentPath(normalizedPath) || "Root"
            : formatPlaygroundFileDate(entry.modifiedTime || entry.createdTime);
          const activate = () => {
            if (entry.isFolder && !row?.searchMatch) {
              toggleEvaluationJsonlWorkspaceFolder(normalizedPath);
              return;
            }
            toggleEvaluationJsonlWorkspaceSelection(normalizedPath);
          };

          return React.createElement("div", { key: normalizedPath || entry.id },
            React.createElement("div", {
                className: "tb-file-browser-item" + (isSelected ? " selected" : ""),
                role: "button",
                tabIndex: 0,
                onClick: activate,
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                  }
                },
                style: row?.searchMatch ? undefined : { paddingLeft: String(12 + Number(row?.level || 0) * 20) + "px" },
              },
              entry.isFolder && !row?.searchMatch
                ? React.createElement("button", {
                    type: "button",
                    className: "tb-file-browser-item-leading",
                    onClick: (event) => {
                      event.stopPropagation();
                      toggleEvaluationJsonlWorkspaceFolder(normalizedPath);
                    },
                    "aria-label": (isExpanded ? "Collapse " : "Expand ") + (entry.name || "folder"),
                  },
                    isExpanded
                      ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                      : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                  )
                : React.createElement("div", {
                    className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                    onClick: (event) => {
                      event.stopPropagation();
                      toggleEvaluationJsonlWorkspaceSelection(normalizedPath);
                    },
                  }, isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null),
              entry.isFolder
                ? React.createElement("img", {
                    src: PLAYGROUND_FOLDER_ICON_URL,
                    alt: "",
                    draggable: false,
                    className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
                  })
                : React.createElement(FileText, {
                    className: "tb-file-browser-item-icon tb-file-browser-item-icon-file",
                    strokeWidth: 1.75,
                  }),
              React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
              React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
              React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
            )
          );
        }

        function renderEvaluationJsonlWorkspacePicker() {
          if (!evaluationJsonlWorkspacePickerOpen) return null;
          const selectedFilesCount = evaluationJsonlWorkspaceInventory.filter((entry) => (
            !entry?.isFolder
            && /\.jsonl$/i.test(String(entry?.name || entry?.path || ""))
            && evaluationJsonlWorkspaceSelectedPaths.includes(normalizeHistoryPath(entry.path))
          )).length;
          const sourceGroups = [{
            id: "computers",
            label: "Computers",
            items: evaluationJsonlWorkspaceEnvironmentOptions.map((environment) => ({
              id: environment.id,
              label: environment.label,
              active: environment.id === evaluationJsonlWorkspaceEnvironmentId,
              onSelect: () => {
                setEvaluationJsonlWorkspaceEnvironmentId(environment.id);
                setEvaluationJsonlWorkspaceSearch("");
              },
            })),
          }];

          return React.createElement("div", { className: "tb-runner-chat playground-evaluations-jsonl-workspace-picker" },
            React.createElement(PlatformFileExplorerBrowserModal, {
              open: true,
              visible: true,
              portal: false,
              size: "full",
              title: "Import Cases",
              backdropClassName: "tb-file-browser-scrim",
              className: "tb-file-browser-modal playground-evaluations-jsonl-workspace-modal",
              onClose: closeEvaluationJsonlWorkspacePicker,
              closeButtonLabel: "Close workspace files",
              sourceGroups,
              breadcrumbs: activeEvaluationJsonlWorkspaceEnvironment
                ? [{
                    id: activeEvaluationJsonlWorkspaceEnvironment.id,
                    label: activeEvaluationJsonlWorkspaceEnvironment.label,
                    onSelect: () => {},
                  }]
                : [],
              searchQuery: evaluationJsonlWorkspaceSearch,
              onSearchQueryChange: setEvaluationJsonlWorkspaceSearch,
              searchPlaceholder: "Search Files",
              onBack: () => {},
              onForward: () => {},
              canGoBack: false,
              canGoForward: false,
              filterContextKey: "evaluation-jsonl:" + String(evaluationJsonlWorkspaceEnvironmentId || ""),
              items: evaluationJsonlWorkspaceRows,
              renderItem: renderEvaluationJsonlWorkspaceRow,
              getItemKind: (row) => row?.entry?.isFolder ? "folder" : "file",
              getItemTimestamp: (row) => row?.entry?.modifiedTime || row?.entry?.createdTime,
              loading: evaluationJsonlWorkspaceState.status === "loading",
              loadingMessage: "Loading workspace files...",
              error: evaluationJsonlWorkspaceState.error || null,
              emptyMessage: ({ hasSearchQuery }) => hasSearchQuery
                ? "No JSONL files match your search"
                : "No JSONL files are available on this computer",
              confirmLabel: evaluationJsonlWorkspaceImporting
                ? "Importing Cases..."
                : "Import " + selectedFilesCount + " " + (selectedFilesCount === 1 ? "File" : "Files"),
              confirmDisabled: selectedFilesCount === 0 || evaluationJsonlWorkspaceImporting,
              onCancel: closeEvaluationJsonlWorkspacePicker,
              onConfirm: handleImportEvaluationJsonlWorkspaceFiles,
            })
          );
        }

        function finishCloseEvaluationThreadCaseModal() {
          setEvaluationThreadCaseModalSetId("");
          setEvaluationThreadCaseModalOpen(false);
          setEvaluationThreadCaseSearchQuery("");
          setEvaluationThreadCaseSelectedIds([]);
          setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" });
        }

        function closeEvaluationThreadCaseModal() {
          setEvaluationThreadCaseModalOpen(false);
        }

        function openEvaluationThreadCaseModal(set) {
          if (!set?.id) return;
          setEvaluationThreadCaseModalSetId(set.id);
          setEvaluationThreadCaseModalOpen(true);
          setEvaluationThreadCaseSearchQuery("");
          setEvaluationThreadCaseSelectedIds([]);
          setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" });
          if (typeof onRefreshThreadRecords === "function") {
            setEvaluationThreadCaseStatus({ status: "refreshing", message: "Refreshing threads...", error: "" });
            Promise.resolve(onRefreshThreadRecords())
              .then(() => {
                setEvaluationThreadCaseStatus((current) => current.status === "refreshing" ? { status: "idle", message: "", error: "" } : current);
              })
              .catch((error) => {
                setEvaluationThreadCaseStatus({ status: "error", message: "", error: error?.message || String(error) });
              });
          }
        }

        function toggleEvaluationThreadCaseSelection(threadId) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) return;
          setEvaluationThreadCaseSelectedIds((current) => {
            const ids = Array.isArray(current) ? current : [];
            if (ids.includes(normalizedThreadId)) {
              return ids.filter((id) => id !== normalizedThreadId);
            }
            return [...ids, normalizedThreadId];
          });
        }

        function updatePendingEvaluationThreadCase(setId, pendingId, patch) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedPendingId = String(pendingId || "").trim();
          if (!normalizedSetId || !normalizedPendingId) return;
          setEvaluationPendingThreadCasesBySetId((current) => {
            const source = current && typeof current === "object" ? current : {};
            const entries = Array.isArray(source[normalizedSetId]) ? source[normalizedSetId] : [];
            return {
              ...source,
              [normalizedSetId]: entries.map((entry) => entry.id === normalizedPendingId ? { ...entry, ...patch } : entry),
            };
          });
        }

        function removePendingEvaluationThreadCase(setId, pendingId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedPendingId = String(pendingId || "").trim();
          if (!normalizedSetId || !normalizedPendingId) return;
          setEvaluationPendingThreadCasesBySetId((current) => {
            const source = current && typeof current === "object" ? current : {};
            const entries = Array.isArray(source[normalizedSetId]) ? source[normalizedSetId] : [];
            const nextEntries = entries.filter((entry) => entry.id !== normalizedPendingId);
            if (nextEntries.length === entries.length) {
              return source;
            }
            const next = { ...source };
            if (nextEntries.length > 0) {
              next[normalizedSetId] = nextEntries;
            } else {
              delete next[normalizedSetId];
            }
            return next;
          });
        }

        function handleGenerateEvaluationCasesFromThreads() {
          const normalizedSetId = String(evaluationThreadCaseModalSetId || "").trim();
          if (!normalizedSetId) return;
          const targetSet = normalizedSets.find((set) => set.id === normalizedSetId) || activeSet;
          if (!targetSet) return;
          const selectedIds = new Set((Array.isArray(evaluationThreadCaseSelectedIds) ? evaluationThreadCaseSelectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
          const selectedThreads = sourceThreadOptions.filter((thread) => selectedIds.has(thread.id));
          if (selectedThreads.length === 0) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Select at least one thread." });
            return;
          }
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Evaluation backend is unavailable." });
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(targetSet.evaluator);
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet, defaultEnvironmentId);
          const targetEnvironmentId = String(selectedEnvironmentChoice?.environmentId || targetSet.environmentId || defaultEnvironmentId || "").trim();
          const targetProjectId = String(selectedEnvironmentChoice?.projectId || targetSet.projectId || "").trim();
          const refinerAgentId = getPlaygroundEvaluationDefaultId(
            agentOptions,
            evaluator.type === "agent" && evaluator.agentId
              ? evaluator.agentId
              : defaultAgentId || targetSet.targetAgentId
          );
          if (!refinerAgentId) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Select an agent before generating cases from threads." });
            return;
          }
          if (!targetEnvironmentId) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Select an environment before generating cases from threads." });
            return;
          }
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          const launchedAt = new Date().toISOString();
          const jobs = selectedThreads.map((thread, index) => ({
            pendingId: createPlaygroundEvaluationId("eval_pending_case"),
            thread,
            index,
          }));
          setEvaluationPendingThreadCasesBySetId((current) => {
            const source = current && typeof current === "object" ? current : {};
            const existing = Array.isArray(source[normalizedSetId]) ? source[normalizedSetId] : [];
            const nextEntries = jobs.map((job) => ({
              id: job.pendingId,
              threadId: job.thread.id,
              title: job.thread.title || job.thread.id,
              status: "loading",
              message: "Creating case from thread",
              createdAt: launchedAt,
            }));
            return {
              ...source,
              [normalizedSetId]: [...existing, ...nextEntries],
            };
          });
          setEvaluationDetailTab("cases");
          closeEvaluationThreadCaseModal();

          void (async () => {
            for (const job of jobs) {
              const thread = job.thread;
              updatePendingEvaluationThreadCase(normalizedSetId, job.pendingId, {
                status: "loading",
                message: "Creating case " + (job.index + 1) + " of " + jobs.length,
              });
              try {
                const response = await fetch(normalizedBackendUrl + "/evaluations/cases/from-thread", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...(requestHeaders || {}),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    threadId: thread.id,
                    thread,
                    evaluationSet: targetSet,
                    refinerAgentId,
                    environmentId: targetEnvironmentId,
                    projectId: targetProjectId,
                    environmentType: selectedEnvironmentChoice?.type || targetSet.environmentType || "computer",
                  }),
                });
                const data = await readPlaygroundEvaluationBackendJson(response, "Failed to refine evaluation case from thread.");
                const normalizedRow = normalizePlaygroundEvaluationDataRow(
                  data?.row || data?.case || data?.data || data,
                  (Array.isArray(targetSet.dataRows) ? targetSet.dataRows.length : 0) + job.index
                );
                const row = {
                  ...normalizedRow,
                  sourceThreadId: normalizedRow.sourceThreadId || thread.id,
                  sourceThreadTitle: normalizedRow.sourceThreadTitle || thread.title || thread.id,
                };
                if (!String(row.input || "").trim() || !String(row.expectedOutput || "").trim() || !String(row.evaluationGuidance || "").trim()) {
                  throw new Error("The refiner returned an incomplete case for " + thread.id + ".");
                }
                updateEvaluationSet(normalizedSetId, (set) => ({
                  ...set,
                  dataRows: [...set.dataRows, row],
                }));
                removePendingEvaluationThreadCase(normalizedSetId, job.pendingId);
              } catch (error) {
                updatePendingEvaluationThreadCase(normalizedSetId, job.pendingId, {
                  status: "error",
                  message: "Case creation failed",
                  error: error?.message || String(error),
                });
              }
            }
          })();
        }

        function buildEvaluationCaseEditorDraft(row = {}, index = 0) {
          const normalized = normalizePlaygroundEvaluationDataRow(row, index);
          return {
            ...normalized,
            runCount: String(normalizePlaygroundEvaluationCaseRunCount(normalized.runCount)),
          };
        }

        function getEvaluationCaseEditorFieldDefinition(field) {
          if (field === "expectedOutput") {
            return {
              field: "expectedOutput",
              title: "Expected Output",
              placeholder: "Reference output or expected behavior",
              description: "Define the response or behavior that should be treated as correct.",
            };
          }
          return {
            field: "input",
            title: "Input",
            placeholder: "Input sent to the agent",
            description: "Define the prompt or source text that will be sent to the agent.",
          };
        }

        function openEvaluationCaseFocusedEditor(field) {
          const definition = getEvaluationCaseEditorFieldDefinition(field);
          const value = String(evaluationCaseEditorState?.draft?.[definition.field] || "");
          setEvaluationCaseTextImportError("");
          setEvaluationCaseFocusedEditor({
            ...definition,
            value,
          });
        }

        function updateEvaluationCaseFocusedEditorValue(value) {
          setEvaluationCaseFocusedEditor((current) => current
            ? { ...current, value: String(value || "") }
            : current
          );
        }

        function closeEvaluationCaseFocusedEditor() {
          setEvaluationCaseFocusedEditor(null);
        }

        function returnFromEvaluationCaseFocusedEditor() {
          const focusedEditor = evaluationCaseFocusedEditor;
          if (!focusedEditor?.field) return;
          updateEvaluationCaseEditorDraft({
            [focusedEditor.field]: String(focusedEditor.value || ""),
          });
          setEvaluationCaseFocusedEditor(null);
        }

        function saveEvaluationCaseFocusedEditor(event) {
          if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          returnFromEvaluationCaseFocusedEditor();
        }

        function openEvaluationCaseTextFilePicker(field) {
          setEvaluationCaseTextImportError("");
          const inputRef = field === "expectedOutput"
            ? evaluationCaseExpectedOutputFileRef
            : evaluationCaseInputFileRef;
          inputRef.current?.click();
        }

        function isEvaluationCaseTextFile(file) {
          const fileName = String(file?.name || "").trim().toLowerCase();
          const mimeType = String(file?.type || "").trim().toLowerCase();
          return fileName.endsWith(".txt") || mimeType === "text/plain";
        }

        async function handleEvaluationCaseTextFile(field, event) {
          const input = event?.currentTarget || event?.target || null;
          const file = input?.files?.[0] || null;
          if (input) input.value = "";
          if (!file) return;
          if (!isEvaluationCaseTextFile(file)) {
            setEvaluationCaseTextImportError("Only .txt files can be imported into evaluation cases.");
            return;
          }
          try {
            const text = typeof file.text === "function"
              ? await file.text()
              : await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result || ""));
                  reader.onerror = () => reject(reader.error || new Error("Failed to read " + file.name));
                  reader.readAsText(file);
                });
            const definition = getEvaluationCaseEditorFieldDefinition(field);
            updateEvaluationCaseEditorDraft({ [definition.field]: String(text || "") });
            setEvaluationCaseTextImportError("");
          } catch (error) {
            setEvaluationCaseTextImportError(error?.message || "The selected text file could not be read.");
          }
        }

        function openEvaluationCaseEditor(setId, row = {}, index = 0, isNew = false) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          if (typeof window !== "undefined") {
            if (evaluationCaseEditorCloseTimerRef.current) {
              window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
              evaluationCaseEditorCloseTimerRef.current = null;
            }
            if (evaluationCaseEditorFrameRef.current) {
              window.cancelAnimationFrame(evaluationCaseEditorFrameRef.current);
              evaluationCaseEditorFrameRef.current = null;
            }
          }
          const nextState = {
            setId: normalizedSetId,
            rowId: isNew ? "" : String(row?.id || "").trim(),
            index,
            isNew,
            draft: buildEvaluationCaseEditorDraft(row, index),
          };
          setEvaluationCaseEditorState({
            ...nextState,
          });
          setEvaluationCaseFocusedEditor(null);
          setEvaluationCaseTextImportError("");
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(false);
          if (typeof window !== "undefined") {
            evaluationCaseEditorFrameRef.current = window.requestAnimationFrame(() => {
              evaluationCaseEditorFrameRef.current = window.requestAnimationFrame(() => {
                evaluationCaseEditorFrameRef.current = null;
                setEvaluationCaseEditorVisible(true);
              });
            });
          } else {
            setEvaluationCaseEditorVisible(true);
          }
        }

        function openNewEvaluationCaseEditor(set) {
          if (!set?.id) return;
          const nextIndex = Array.isArray(set.dataRows) ? set.dataRows.length : 0;
          openEvaluationCaseEditor(set.id, {
            input: "",
            expectedOutput: "",
            evaluationGuidance: "",
            optimizationRole: "train",
            runCount: 1,
          }, nextIndex, true);
        }

        function finishCloseEvaluationCaseEditor() {
          if (typeof window !== "undefined") {
            if (evaluationCaseEditorCloseTimerRef.current) {
              window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
              evaluationCaseEditorCloseTimerRef.current = null;
            }
            if (evaluationCaseEditorFrameRef.current) {
              window.cancelAnimationFrame(evaluationCaseEditorFrameRef.current);
              evaluationCaseEditorFrameRef.current = null;
            }
          }
          setEvaluationCaseEditorState(null);
          setEvaluationCaseFocusedEditor(null);
          setEvaluationCaseTextImportError("");
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(false);
        }

        function closeEvaluationCaseEditor(options = {}) {
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationCaseEditor();
            return;
          }
          if (!evaluationCaseEditorState || evaluationCaseEditorClosing) {
            return;
          }
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(true);
          if (evaluationCaseEditorCloseTimerRef.current) {
            window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
          }
          evaluationCaseEditorCloseTimerRef.current = window.setTimeout(() => {
            evaluationCaseEditorCloseTimerRef.current = null;
            finishCloseEvaluationCaseEditor();
          }, 75);
        }

        function updateEvaluationCaseEditorDraft(patch) {
          setEvaluationCaseEditorState((current) => current
            ? {
                ...current,
                draft: {
                  ...(current.draft || {}),
                  ...(patch || {}),
                },
              }
            : current
          );
        }

        function saveEvaluationCaseEditor(event) {
          if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          if (event && typeof event.stopPropagation === "function") {
            event.stopPropagation();
          }
          const state = evaluationCaseEditorState;
          if (!state?.setId) return;
          const draft = normalizePlaygroundEvaluationDataRow({
            ...(state.draft || {}),
            runCount: normalizePlaygroundEvaluationCaseRunCount(state.draft?.runCount || 1),
            updatedAt: nowIso,
          }, Number(state.index || 0));
          updateEvaluationSet(state.setId, (set) => {
            const rows = Array.isArray(set.dataRows) ? set.dataRows : [];
            const isExisting = !state.isNew && rows.some((row) => row.id === state.rowId);
            return {
              ...set,
              dataRows: isExisting
                ? rows.map((row) => row.id === state.rowId ? { ...draft, id: row.id, createdAt: row.createdAt || draft.createdAt } : row)
                : rows.concat(draft),
            };
          });
          closeEvaluationCaseEditor();
        }

        function deleteEvaluationCaseEditor() {
          const state = evaluationCaseEditorState;
          if (!state?.setId) {
            closeEvaluationCaseEditor();
            return;
          }
          if (!state.isNew && state.rowId) {
            updateEvaluationSet(state.setId, (set) => ({
              ...set,
              dataRows: (Array.isArray(set.dataRows) ? set.dataRows : []).filter((row) => row.id !== state.rowId),
            }));
          }
          closeEvaluationCaseEditor();
        }

`;
