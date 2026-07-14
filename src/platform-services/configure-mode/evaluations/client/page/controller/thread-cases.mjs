export const EVALUATIONS_PAGE_CONTROLLER_THREAD_CASES_SCRIPT = String.raw`        function openEvaluationJsonlFilePicker() {
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          if (evaluationJsonlFileInputRef.current) {
            evaluationJsonlFileInputRef.current.click();
          }
        }

        function isEvaluationJsonlFile(file) {
          const fileName = String(file?.name || "").trim().toLowerCase();
          return fileName.endsWith(".jsonl");
        }

        async function handleEvaluationJsonlFiles(setId, fileList) {
          const normalizedSetId = String(setId || "").trim();
          const files = Array.from(fileList || []).filter(Boolean);
          if (!normalizedSetId || files.length === 0) return;
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          const invalidFiles = files.filter((file) => !isEvaluationJsonlFile(file));
          if (invalidFiles.length > 0) {
            setEvaluationJsonlFileImportError("Only .jsonl files can be imported.");
            return;
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
              return;
            }
            if (importedRows.length === 0) {
              setEvaluationJsonlFileImportError("No valid cases found in the selected JSONL file.");
              return;
            }
            updateEvaluationSet(normalizedSetId, (set) => ({
              ...set,
              dataRows: [...set.dataRows, ...importedRows],
            }));
            setEvaluationJsonlFileImportMessage(
              "Imported " + importedRows.length + " " + (importedRows.length === 1 ? "case" : "cases") + "."
            );
            setEvaluationDetailTab("data");
          } catch (error) {
            setEvaluationJsonlFileImportError(error?.message || String(error));
          }
        }

        function closeEvaluationThreadCaseModal() {
          setEvaluationThreadCaseModalSetId("");
          setEvaluationThreadCaseSearchQuery("");
          setEvaluationThreadCaseSelectedIds([]);
          setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" });
        }

        function openEvaluationThreadCaseModal(set) {
          if (!set?.id) return;
          setEvaluationThreadCaseModalSetId(set.id);
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
          setEvaluationDetailTab("data");
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
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(false);
          setEvaluationCaseEditorMarkdownHistoryByKey({});
          setEvaluationCaseEditorMarkdownEditingKey(buildEvaluationCaseEditorFieldKey(nextState, "input"));
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
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(false);
          setEvaluationCaseEditorMarkdownEditingKey("");
          setEvaluationCaseEditorMarkdownHistoryByKey({});
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

