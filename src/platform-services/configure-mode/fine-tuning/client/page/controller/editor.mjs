export const FINE_TUNING_PAGE_CONTROLLER_EDITOR_SCRIPT = String.raw`        function updateCreateForm(patch) {
          if (typeof setFineTuningCreateForm === "function") {
            setFineTuningCreateForm((current) => ({ ...(current || {}), ...(patch || {}) }));
          }
        }

        function resizeFineTuningInstructionsTextarea(textarea) {
          if (!textarea || typeof window === "undefined") return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          textarea.style.height = Math.max(118, singleLineHeight, textarea.scrollHeight) + "px";
        }

        function focusFineTuningInstructionsTextareaAtEnd(value) {
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = fineTuningInstructionsTextareaRef.current;
            if (!textarea) return;
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeFineTuningInstructionsTextarea(textarea);
          });
        }

        function updateFineTuningInstructionsValue(value, options = {}) {
          const nextValue = String(value ?? "");
          const previousValue = String(fineTuningCreateForm?.instructions || "");
          if (previousValue === nextValue) return;
          if (options.recordHistory !== false) {
            setFineTuningInstructionsHistory((current) => ({
              past: [...(Array.isArray(current.past) ? current.past : []), previousValue].slice(-80),
              future: [],
            }));
          }
          updateCreateForm({ instructions: nextValue });
        }

        function applyFineTuningInstructionsHistoryValue(value) {
          updateCreateForm({ instructions: String(value ?? "") });
          focusFineTuningInstructionsTextareaAtEnd(value);
        }

        function handleFineTuningInstructionsUndo() {
          const historyPast = Array.isArray(fineTuningInstructionsHistory.past) ? fineTuningInstructionsHistory.past : [];
          if (!historyPast.length) return;
          const currentValue = String(fineTuningCreateForm?.instructions || "");
          const previousValue = historyPast[historyPast.length - 1];
          setFineTuningInstructionsHistory((current) => {
            const past = Array.isArray(current.past) ? current.past : [];
            const future = Array.isArray(current.future) ? current.future : [];
            return {
              past: past.slice(0, -1),
              future: [currentValue, ...future].slice(0, 80),
            };
          });
          applyFineTuningInstructionsHistoryValue(previousValue);
        }

        function handleFineTuningInstructionsRedo() {
          const historyFuture = Array.isArray(fineTuningInstructionsHistory.future) ? fineTuningInstructionsHistory.future : [];
          if (!historyFuture.length) return;
          const currentValue = String(fineTuningCreateForm?.instructions || "");
          const nextValue = historyFuture[0];
          setFineTuningInstructionsHistory((current) => {
            const past = Array.isArray(current.past) ? current.past : [];
            const future = Array.isArray(current.future) ? current.future : [];
            return {
              past: [...past, currentValue].slice(-80),
              future: future.slice(1),
            };
          });
          applyFineTuningInstructionsHistoryValue(nextValue);
        }

        function buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          if (safeStart !== safeEnd) {
            if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length >= prefix.length + suffix.length) {
              const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
              const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
              return { value: nextValue, selectionStart: safeStart, selectionEnd: safeStart + unwrappedText.length };
            }
            const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
            const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
            if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
              const nextValue = value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length);
              return { value: nextValue, selectionStart: safeStart - prefix.length, selectionEnd: safeStart - prefix.length + selectedText.length };
            }
            const wrappedText = prefix + selectedText + suffix;
            const nextValue = value.slice(0, safeStart) + wrappedText + value.slice(safeEnd);
            return { value: nextValue, selectionStart: safeStart + prefix.length, selectionEnd: safeStart + prefix.length + selectedText.length };
          }
          const insertedText = prefix + suffix;
          const nextValue = value.slice(0, safeStart) + insertedText + value.slice(safeEnd);
          return { value: nextValue, selectionStart: safeStart + prefix.length, selectionEnd: safeStart + prefix.length };
        }

        function buildFineTuningMarkdownListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
          let lineEnd = value.indexOf("\n", safeEnd);
          if (lineEnd === -1) lineEnd = value.length;
          const block = value.slice(lineStart, lineEnd);
          const lines = block.split("\n");
          const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
          const isOrderedList = listType === "ordered";
          const orderedListPattern = /^(\s*)\d+\.\s+/;
          const unorderedListPattern = /^(\s*)-\s+/;
          const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => (
            isOrderedList ? orderedListPattern.test(line) : unorderedListPattern.test(line)
          ));
          let orderedIndex = 1;
          const nextLines = lines.map((line) => {
            if (!line.trim()) return shouldRemoveList ? line : isOrderedList ? String(orderedIndex++) + ". " : "- ";
            if (shouldRemoveList) return line.replace(isOrderedList ? orderedListPattern : unorderedListPattern, "$1");
            if (!isOrderedList && unorderedListPattern.test(line)) return line;
            if (isOrderedList && orderedListPattern.test(line)) {
              orderedIndex += 1;
              return line;
            }
            const cleanLine = line.replace(/^(\s*)(?:-\s+|\d+\.\s+)/, "$1");
            return cleanLine.replace(/^(\s*)/, (_match, indent) => String(indent || "") + (isOrderedList ? String(orderedIndex++) + ". " : "- "));
          });
          const nextBlock = nextLines.join("\n");
          const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
          const collapsedSelection = safeStart === safeEnd;
          const markerLength = isOrderedList ? 3 : 2;
          const nextCaretOffset = shouldRemoveList ? Math.max(0, safeStart - lineStart - markerLength) : safeStart - lineStart + markerLength;
          return {
            value: nextValue,
            selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
            selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
          };
        }

        function buildFineTuningMarkdownLinkEdit(value, selectionStart, selectionEnd) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
          if (existingLinkMatch) {
            const unwrappedText = existingLinkMatch[1];
            const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
            return { value: nextValue, selectionStart: safeStart, selectionEnd: safeStart + unwrappedText.length };
          }
          const label = selectedText || "link text";
          const url = "url";
          const markdownLink = "[" + label + "](" + url + ")";
          const nextValue = value.slice(0, safeStart) + markdownLink + value.slice(safeEnd);
          const urlStart = safeStart + label.length + 3;
          return { value: nextValue, selectionStart: urlStart, selectionEnd: urlStart + url.length };
        }

        function applyFineTuningMarkdownSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateFineTuningInstructionsValue(nextValue);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = fineTuningInstructionsTextareaRef.current;
            if (!textarea) return;
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeFineTuningInstructionsTextarea(textarea);
          });
        }

        function handleFineTuningInstructionsFormat(formatType) {
          const textarea = fineTuningInstructionsTextareaRef.current;
          if (!textarea) return;
          const value = String(fineTuningCreateForm?.instructions || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;
          if (formatType === "bold") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildFineTuningMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
          } else if (formatType === "ordered-list") {
            edit = buildFineTuningMarkdownListEdit(value, selectionStart, selectionEnd, "ordered");
          } else if (formatType === "code") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
          } else if (formatType === "link") {
            edit = buildFineTuningMarkdownLinkEdit(value, selectionStart, selectionEnd);
          }
          if (!edit) return;
          applyFineTuningMarkdownSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function closeCreateModal(options = {}) {
          if (createBusy && !options.force) return;
          setEvaluationSetPickerOpen(false);
          if (options.animate === false || typeof window === "undefined") {
            setModalVisible(false);
            setModalClosing(false);
            if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(false);
            return;
          }
          setModalVisible(false);
          setModalClosing(true);
          if (modalCloseTimerRef.current) window.clearTimeout(modalCloseTimerRef.current);
          modalCloseTimerRef.current = window.setTimeout(() => {
            modalCloseTimerRef.current = null;
            setModalClosing(false);
            if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(false);
          }, 75);
        }

        function openCreateModal() {
          const currentForm = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const defaultSetIds = Array.isArray(currentForm.evaluationSetIds) && currentForm.evaluationSetIds.length
            ? currentForm.evaluationSetIds
            : normalizedEvaluationSets[0]?.id ? [normalizedEvaluationSets[0].id] : [];
          const currentRunIds = currentForm.evaluationRunIds && typeof currentForm.evaluationRunIds === "object" && !Array.isArray(currentForm.evaluationRunIds)
            ? currentForm.evaluationRunIds
            : {};
          const defaultRunIds = {};
          defaultSetIds.forEach((setId) => {
            const set = normalizedEvaluationSets.find((item) => item.id === String(setId || "").trim()) || null;
            const latestRun = getPlaygroundFineTuningLatestRun(set);
            defaultRunIds[setId] = normalizePlaygroundFineTuningString(currentRunIds[setId] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
          });
          updateCreateForm({
            name: formatPlaygroundFineTuningDefaultJobName(),
            agentId: currentForm.agentId || defaultAgentId || normalizedAgents[0]?.id || "",
            environmentId: currentForm.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || "",
            evaluationSetIds: defaultSetIds,
            evaluationRunIds: defaultRunIds,
            instructions: currentForm.instructions || "",
            verifyAfter: true,
          });
          if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(true);
        }

        function upsertFineTuningJob(job, options = {}) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id || typeof setFineTuningJobs !== "function") return normalizedJob;
          setFineTuningJobs((current) => {
            const jobs = Array.isArray(current) ? current.map((item, index) => normalizePlaygroundFineTuningJob(item, index)) : [];
            const existingJob = jobs.find((item) => item.id === normalizedJob.id) || null;
            const mergedJob = existingJob ? mergePlaygroundFineTuningJobRecords(existingJob, normalizedJob) : normalizedJob;
            if (options.persist) {
              void persistFineTuningRuntimeJob(mergedJob).catch(() => {});
            }
            return [mergedJob, ...jobs.filter((item) => item.id !== normalizedJob.id)];
          });
          if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId(normalizedJob.id);
          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("detail");
          return normalizedJob;
        }

        function patchFineTuningJob(jobId, updater, options = {}) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          if (!normalizedJobId || typeof setFineTuningJobs !== "function" || typeof updater !== "function") return;
          setFineTuningJobs((current) => (Array.isArray(current) ? current : []).map((item, index) => {
            const normalizedItem = normalizePlaygroundFineTuningJob(item, index);
            if (normalizedItem.id !== normalizedJobId) return item;
            const nextJob = mergePlaygroundFineTuningJobRecords(normalizedItem, updater(normalizedItem));
            if (options.persist) {
              void persistFineTuningRuntimeJob(nextJob).catch(() => {});
            }
            return nextJob;
          }));
        }

        function buildStoppedFineTuningJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const cancellationReferences = normalizedJob.evaluationRuns.map((reference) => ({
            ...reference,
            status: isFineTuningEvaluationRunActive(reference.status) || reference.status === "pending"
              ? "cancelled"
              : reference.status,
          }));
          return normalizePlaygroundFineTuningJob({
            ...mergeFineTuningVerificationReferences(normalizedJob, cancellationReferences, "cancelled"),
            status: "cancelled",
            error: "",
            updatedAt: new Date().toISOString(),
          });
        }

        async function stopFineTuningJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedJobId = normalizePlaygroundFineTuningString(normalizedJob.id);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedJobId || !normalizedBackendUrl || fineTuningStopJobId === normalizedJobId) return;
          const stoppedJob = buildStoppedFineTuningJob(normalizedJob);
          setFineTuningStopJobId(normalizedJobId);
          patchFineTuningJob(normalizedJobId, () => stoppedJob);
          try {
            const headers = {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            };
            const threadId = normalizePlaygroundFineTuningString(normalizedJob.threadId);
            const stopRequests = [
              fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId) + "/cancel", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers,
                body: JSON.stringify({}),
              }),
            ];
            if (threadId) {
              stopRequests.push(fetch(normalizedBackendUrl + "/threads/" + encodeURIComponent(threadId) + "/cancel", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers,
                body: JSON.stringify({}),
              }));
            }
            const [jobResult] = await Promise.allSettled(stopRequests);
            let backendJob = null;
            if (jobResult.status === "fulfilled") {
              const data = await jobResult.value.json().catch(() => ({}));
              if (jobResult.value.ok) {
                backendJob = normalizePlaygroundFineTuningJob(data?.job || data?.data || data);
              }
            }
            const nextJob = backendJob?.id
              ? mergePlaygroundFineTuningJobRecords(stoppedJob, {
                  ...backendJob,
                  status: "cancelled",
                  evaluationRuns: stoppedJob.evaluationRuns,
                })
              : stoppedJob;
            patchFineTuningJob(normalizedJobId, () => nextJob, { persist: true });
          } finally {
            setFineTuningStopJobId("");
          }
        }

`;

