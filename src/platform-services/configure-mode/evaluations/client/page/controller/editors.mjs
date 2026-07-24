export const EVALUATIONS_PAGE_CONTROLLER_EDITORS_SCRIPT = String.raw`        function resizeEvaluationGuidanceTextarea(textarea) {
          if (!textarea || typeof window === "undefined") return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          textarea.style.height = (String(textarea.value || "").trim()
            ? Math.max(singleLineHeight, textarea.scrollHeight)
            : singleLineHeight) + "px";
        }

        function updateEvaluationGuidanceValue(setId, value, options = {}) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          const nextValue = String(value ?? "");
          const currentSet = normalizedSets.find((set) => set.id === normalizedSetId) || null;
          const previousValue = String(currentSet?.evaluationGuidance || "");
          if (previousValue === nextValue) return;
          if (options.recordHistory !== false) {
            setEvaluationGuidanceHistoryById((current) => {
              const currentHistory = current[normalizedSetId] || { past: [], future: [] };
              return {
                ...current,
                [normalizedSetId]: {
                  past: [...(Array.isArray(currentHistory.past) ? currentHistory.past : []), previousValue].slice(-80),
                  future: [],
                },
              };
            });
          }
          updateEvaluationSet(normalizedSetId, (set) => ({
            ...set,
            evaluationGuidance: nextValue,
          }));
        }

        function focusEvaluationGuidanceTextareaAtEnd(value) {
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = evaluationGuidanceTextareaRef.current;
            if (!textarea) return;
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeEvaluationGuidanceTextarea(textarea);
          });
        }

        function applyEvaluationGuidanceSelection(setId, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateEvaluationGuidanceValue(setId, nextValue);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = evaluationGuidanceTextareaRef.current;
            if (!textarea) return;
            const maxLength = String(nextValue || "").length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeEvaluationGuidanceTextarea(textarea);
          });
        }

        function buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          if (safeStart !== safeEnd) {
            if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length >= prefix.length + suffix.length) {
              const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
              return {
                value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
                selectionStart: safeStart,
                selectionEnd: safeStart + unwrappedText.length,
              };
            }
            const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
            const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
            if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
              return {
                value: value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length),
                selectionStart: safeStart - prefix.length,
                selectionEnd: safeStart - prefix.length + selectedText.length,
              };
            }
            const wrappedText = prefix + selectedText + suffix;
            return {
              value: value.slice(0, safeStart) + wrappedText + value.slice(safeEnd),
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length + selectedText.length,
            };
          }
          const insertedText = prefix + suffix;
          return {
            value: value.slice(0, safeStart) + insertedText + value.slice(safeEnd),
            selectionStart: safeStart + prefix.length,
            selectionEnd: safeStart + prefix.length,
          };
        }

        function buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
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
            if (!line.trim()) {
              if (shouldRemoveList) return line;
              return isOrderedList ? String(orderedIndex++) + ". " : "- ";
            }
            if (shouldRemoveList) {
              return line.replace(isOrderedList ? orderedListPattern : unorderedListPattern, "$1");
            }
            if (!isOrderedList && unorderedListPattern.test(line)) return line;
            if (isOrderedList && orderedListPattern.test(line)) {
              orderedIndex += 1;
              return line;
            }
            const cleanLine = line.replace(/^(\s*)(?:-\s+|\d+\.\s+)/, "$1");
            return cleanLine.replace(/^(\s*)/, (_match, indent) => (
              String(indent || "") + (isOrderedList ? String(orderedIndex++) + ". " : "- ")
            ));
          });
          const nextBlock = nextLines.join("\n");
          const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
          const collapsedSelection = safeStart === safeEnd;
          const markerLength = isOrderedList ? 3 : 2;
          const nextCaretOffset = shouldRemoveList
            ? Math.max(0, safeStart - lineStart - markerLength)
            : safeStart - lineStart + markerLength;
          return {
            value: nextValue,
            selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
            selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
          };
        }

        function buildEvaluationMarkdownLinkEdit(value, selectionStart, selectionEnd) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
          if (existingLinkMatch) {
            const unwrappedText = existingLinkMatch[1];
            return {
              value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
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

        function handleEvaluationGuidanceMarkdownFormat(setId, formatType) {
          const textarea = evaluationGuidanceTextareaRef.current;
          const currentSet = normalizedSets.find((set) => set.id === setId) || null;
          if (!textarea || !currentSet) return;
          const value = String(currentSet.evaluationGuidance || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;
          if (formatType === "bold") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
          } else if (formatType === "ordered-list") {
            edit = buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, "ordered");
          } else if (formatType === "code") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
          } else if (formatType === "link") {
            edit = buildEvaluationMarkdownLinkEdit(value, selectionStart, selectionEnd);
          }
          if (!edit) return;
          applyEvaluationGuidanceSelection(setId, edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function buildEvaluationCaseEditorFieldKey(state, field) {
          const source = state && typeof state === "object" && !Array.isArray(state) ? state : {};
          const baseId = source.rowId || (source.isNew ? "new:" + String(source.index || 0) : "case");
          return "case:" + String(source.setId || "") + ":" + String(baseId || "case") + ":" + String(field || "");
        }

        function updateEvaluationRunCase(setId, runId, caseId, patch) {
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) return normalized;
            const runs = normalized.runs.map((run) => {
              if (run.id !== runId) return run;
              const cases = run.cases.map((caseItem) => (
                caseItem.id === caseId
                  ? normalizePlaygroundEvaluationRunCase({ ...caseItem, ...patch })
                  : caseItem
              ));
              const activeCases = cases.filter((caseItem) => isPlaygroundEvaluationCaseActive(caseItem));
              const errorCases = cases.filter((caseItem) => caseItem.status === "error");
              const averageScore = cases.length > 0
                ? cases.reduce((sum, caseItem) => sum + Number(caseItem.score || 0), 0) / cases.length
                : 0;
              const passThreshold = normalizePlaygroundEvaluationPassThreshold(run.passThreshold);
              return normalizePlaygroundEvaluationRun({
                ...run,
                cases,
                averageScore,
                passedCount: cases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error" && Number(caseItem.score || 0) >= passThreshold).length,
                totalCount: cases.length,
                costTokens: cases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationTokenCount(caseItem.costTokens), 0),
                costUsd: cases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationUsdCost(caseItem.costUsd), 0),
                status: activeCases.length > 0 ? "running" : errorCases.length === cases.length ? "failed" : "completed",
                completedAt: activeCases.length > 0 ? run.completedAt : new Date().toISOString(),
              });
            });
            return normalizePlaygroundEvaluationSet({
              ...normalized,
              runs,
            });
          }));
        }

        function announceEvaluationRunThreads(run) {
          if (typeof onEvaluationThreadStarted !== "function") return;
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          normalizedRun.cases.forEach((caseItem) => {
            [
              { id: caseItem.threadId, kind: "case" },
              { id: caseItem.evaluatorThreadId, kind: "evaluator", sourceThreadId: caseItem.threadId },
            ].forEach((entry) => {
              const threadId = String(entry.id || "").trim();
              if (!threadId || announcedEvaluationThreadIdsRef.current.has(threadId)) return;
              announcedEvaluationThreadIdsRef.current.add(threadId);
              onEvaluationThreadStarted({
                id: threadId,
                hidden: true,
                sidebarHidden: true,
                metadata: {
                  evaluation: {
                    setId: normalizedRun.evaluationSetId,
                    runId: normalizedRun.id,
                    caseId: caseItem.id,
                    dataRowId: caseItem.dataRowId,
                    kind: entry.kind,
                    sourceThreadId: entry.sourceThreadId || "",
                    hidden: true,
                    sidebarHidden: true,
                  },
                  runnerPlayground: {
                    type: entry.kind === "evaluator" ? "evaluation_evaluator" : "evaluation_case",
                    evaluationSetId: normalizedRun.evaluationSetId,
                    evaluationRunId: normalizedRun.id,
                    evaluationCaseId: caseItem.id,
                    evaluationDataRowId: caseItem.dataRowId,
                    evaluationKind: entry.kind,
                    sourceThreadId: entry.sourceThreadId || "",
                    hidden: true,
                    sidebarHidden: true,
                  },
                },
              });
            });
          });
        }

        function upsertEvaluationRun(setId, run) {
          const normalizedIncomingRun = normalizePlaygroundEvaluationRun(run);
          const normalizedRun = normalizePlaygroundEvaluationRun({
            ...normalizedIncomingRun,
            evaluationVersionId: normalizedIncomingRun.evaluationVersionId,
            evaluationVersionNumber: normalizedIncomingRun.evaluationVersionNumber,
            evaluationVersionLabel: normalizedIncomingRun.evaluationVersionLabel,
            targetAgentVersionId: normalizedIncomingRun.targetAgentVersionId,
            targetAgentVersionNumber: normalizedIncomingRun.targetAgentVersionNumber,
            targetAgentVersionLabel: normalizedIncomingRun.targetAgentVersionLabel,
            targetAgentVersionRevisionId: normalizedIncomingRun.targetAgentVersionRevisionId,
          });
          if (!normalizedRun.id) return;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) return normalized;
            const existingRun = normalized.runs.find((itemRun) => itemRun.id === normalizedRun.id) || null;
            const nextRun = existingRun
              ? normalizePlaygroundEvaluationRun({
                  ...existingRun,
                  ...normalizedRun,
                  evaluationVersionId: normalizedRun.evaluationVersionId || existingRun.evaluationVersionId,
                  evaluationVersionNumber: normalizedRun.evaluationVersionNumber || existingRun.evaluationVersionNumber,
                  evaluationVersionLabel: normalizedRun.evaluationVersionLabel || existingRun.evaluationVersionLabel,
                  targetAgentVersionId: normalizedRun.targetAgentVersionId || existingRun.targetAgentVersionId,
                  targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber || existingRun.targetAgentVersionNumber,
                  targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel || existingRun.targetAgentVersionLabel,
                  targetAgentVersionRevisionId: normalizedRun.targetAgentVersionRevisionId || existingRun.targetAgentVersionRevisionId,
                })
              : normalizedRun;
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalized,
              runs: [nextRun, ...normalized.runs.filter((itemRun) => itemRun.id !== normalizedRun.id)],
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            const activeVersion = getSelectedEvaluationActiveVersion(nextSet);
            const targetVersionId = String(nextRun.evaluationVersionId || activeVersion?.id || "").trim();
            if (!targetVersionId || !versions.length) {
              return nextSet;
            }
            const nextVersions = versions.map((version) => {
              if (version.id !== targetVersionId) return version;
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              const nextVersionRuns = [nextRun, ...versionRuns.filter((itemRun) => itemRun.id !== nextRun.id)];
              return normalizePlaygroundEvaluationVersion({
                ...version,
                runs: nextVersionRuns,
                runCount: nextVersionRuns.length,
                snapshot: {
                  ...(version.snapshot || {}),
                  runs: nextVersionRuns,
                },
              }, Math.max(0, Number(version.version || 1) - 1));
            });
            return createPlaygroundEvaluationWithVersionList(nextSet, nextVersions);
          }));
          announceEvaluationRunThreads(normalizedRun);
        }

        function markEvaluationRunPollingFailed(setId, runId, fallbackRun, error) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || fallbackRun?.id || "").trim();
          if (!normalizedSetId || !normalizedRunId || typeof setEvaluationSets !== "function") {
            return;
          }
          const errorMessage = error?.message || String(error || "Failed to load evaluation run.");
          let runToAnnounce = null;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            const existingRun = normalizedSet.runs.find((run) => run.id === normalizedRunId) || null;
            const sourceRun = existingRun || normalizePlaygroundEvaluationRun(fallbackRun || { id: normalizedRunId });
            if (!sourceRun.id) return normalizedSet;
            if (!isPlaygroundEvaluationRunActive(sourceRun)) {
              runToAnnounce = sourceRun;
              return normalizedSet;
            }
            const nextCases = sourceRun.cases.map((caseItem) => (
              isPlaygroundEvaluationCaseActive(caseItem)
                ? normalizePlaygroundEvaluationRunCase({
                    ...caseItem,
                    status: "error",
                    error: errorMessage,
                    completedAt: new Date().toISOString(),
                  })
                : caseItem
            ));
            const activeCases = nextCases.filter((caseItem) => isPlaygroundEvaluationCaseActive(caseItem));
            const errorCases = nextCases.filter((caseItem) => caseItem.status === "error");
            const passThreshold = normalizePlaygroundEvaluationPassThreshold(sourceRun.passThreshold);
            const nextRun = normalizePlaygroundEvaluationRun({
              ...sourceRun,
              cases: nextCases,
              averageScore: nextCases.length > 0
                ? nextCases.reduce((sum, caseItem) => sum + Number(caseItem.score || 0), 0) / nextCases.length
                : 0,
              passedCount: nextCases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error" && Number(caseItem.score || 0) >= passThreshold).length,
              totalCount: nextCases.length,
              costTokens: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationTokenCount(caseItem.costTokens), 0),
              costUsd: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationUsdCost(caseItem.costUsd), 0),
              status: activeCases.length > 0 ? "running" : errorCases.length === nextCases.length && nextCases.length > 0 ? "failed" : "completed",
              completedAt: activeCases.length > 0 ? sourceRun.completedAt : new Date().toISOString(),
            });
            runToAnnounce = nextRun;
            return normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: [nextRun, ...normalizedSet.runs.filter((run) => run.id !== normalizedRunId)],
            });
          }));
          if (runToAnnounce) {
            announceEvaluationRunThreads(runToAnnounce);
          }
        }

        async function pollEvaluationRun(setId, runId) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl || !runId) return;
          let consecutiveFailures = 0;
          for (let attempt = 0; attempt < 480; attempt += 1) {
            await sleepPlaygroundEvaluationFrontend(attempt === 0 ? 700 : 1200);
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(runId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readPlaygroundEvaluationBackendJson(response, "Failed to load evaluation run.");
              const nextRun = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
              consecutiveFailures = 0;
              if (!nextRun.id) return;
              upsertEvaluationRun(setId, nextRun);
              if (!isPlaygroundEvaluationRunActive(nextRun)) {
                return;
              }
            } catch (error) {
              consecutiveFailures += 1;
              if (consecutiveFailures >= 8) {
                throw error;
              }
            }
          }
        }

        async function hydrateEvaluationRunCosts(setId, run) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          if (!normalizedBackendUrl || !setId || !normalizedRun.id) return;
          const response = await fetch(normalizedBackendUrl + "/evaluations/runs/costs", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ run: normalizedRun }),
          });
          const data = await readPlaygroundEvaluationBackendJson(response, "Failed to calculate evaluation run cost.");
          const nextRun = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
          if (nextRun.id) {
            upsertEvaluationRun(setId, nextRun);
          }
        }

`;
