export const METRONOME_APP_RUN_CONTROLLER_SCRIPT = `
        function openMetronomePage(options = {}) {
          const normalizedProjectId = String(options?.projectId || "").trim();
          const normalizedWorkflowId = String(options?.workflowId || "").trim();
          const normalizedRunId = String(options?.runId || "").trim();
          const requestedMode = options?.mode === "run-detail"
            ? "run-detail"
            : options?.mode === "runs"
            ? "runs"
            : options?.mode === "code"
              ? "code"
              : options?.mode === "edit"
                ? "edit"
                : "";
          setAccountMenuOpen(false);
          setSidebarWorkspaceMode("work");
          setMetronomeRunTraceSelection(null);
          setMetronomeProjectFilterId(normalizedProjectId);
          setMetronomeOpenWorkflowRequest(normalizedWorkflowId
            ? {
                workflowId: normalizedWorkflowId,
                runId: normalizedRunId,
                mode: requestedMode,
                token: Date.now(),
              }
            : null);
          setActivePage("metronome");
        }

        function createMetronomeRunTraceThreadId(key) {
          const normalizedKey = String(key || "").trim();
          return normalizedKey ? "metronome-run:" + normalizedKey : "";
        }

        function buildFallbackMetronomeRunTraceRun(selection) {
          const threads = Array.isArray(selection?.threads) ? selection.threads : [];
          const normalizedThreads = threads.map((thread) => {
            const meta = getThreadMetronomeMetadata(thread) || {};
            return {
              id: String(thread?.id || "").trim(),
              nodeId: String(meta.nodeId || "").trim(),
              nodeName: String(meta.nodeName || thread?.title || "Thread").trim(),
              summary: String(thread?.summary || thread?.message || "").trim(),
              output: thread?.output || thread?.result || thread?.metadata?.output || null,
              createdAt: thread?.createdAt || "",
              updatedAt: thread?.updatedAt || "",
            };
          }).filter((thread) => thread.id);
          const promptCandidates = [
            selection?.input,
            selection?.latestThread?.metadata?.metronome,
            selection?.latestThread?.metadata?.metronomeWorkflow,
            ...threads.map((thread) => thread?.metadata?.metronome),
            ...threads.map((thread) => thread?.metadata?.metronomeWorkflow),
          ];
          let prompt = "";
          for (const candidate of promptCandidates) {
            prompt = readMetronomeRunPromptCandidate(candidate);
            if (prompt) break;
          }
          return {
            id: String(selection?.runId || "").trim(),
            status: String(selection?.status || "completed").trim() || "completed",
            createdAt: selection?.createdAt || selection?.latestThread?.createdAt || selection?.latestThread?.updatedAt || "",
            input: {
              source: "thread_sidebar",
              prompt,
            },
            output: {
              steps: [],
              threads: normalizedThreads,
            },
          };
        }

        function normalizeMetronomeRunTraceResponse(data, selection) {
          const rawRun = data?.data?.run
            || data?.data?.metronomeRun
            || data?.run
            || data?.metronomeRun
            || data?.data
            || data;
          const fallbackRun = buildFallbackMetronomeRunTraceRun(selection);
          const run = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
          const output = run.output && typeof run.output === "object" && !Array.isArray(run.output) ? run.output : {};
          const fallbackOutput = fallbackRun.output && typeof fallbackRun.output === "object" ? fallbackRun.output : {};
          const timelineRows = Array.isArray(data?.data?.steps)
            ? data.data.steps
            : Array.isArray(data?.steps)
              ? data.steps
              : [];
          const finalSteps = Array.isArray(output.steps) ? output.steps : [];
          const normalizedTimelineSteps = normalizeMetronomeRunTimelineSteps(timelineRows, finalSteps, run.id || run.runId || fallbackRun.id || "");
          const timelineThreads = normalizedTimelineSteps
            .map((step) => {
              const stepOutput = step?.output && typeof step.output === "object" && !Array.isArray(step.output) ? step.output : {};
              const thread = stepOutput.thread && typeof stepOutput.thread === "object" && !Array.isArray(stepOutput.thread)
                ? stepOutput.thread
                : stepOutput.threadRecord && typeof stepOutput.threadRecord === "object" && !Array.isArray(stepOutput.threadRecord)
                  ? stepOutput.threadRecord
                  : stepOutput.thread_record && typeof stepOutput.thread_record === "object" && !Array.isArray(stepOutput.thread_record)
                    ? stepOutput.thread_record
                    : null;
              return thread;
            })
            .filter(Boolean);
          return {
            ...fallbackRun,
            ...run,
            id: String(run.id || run.runId || fallbackRun.id || "").trim(),
            input: {
              ...(fallbackRun.input && typeof fallbackRun.input === "object" ? fallbackRun.input : {}),
              ...(run.input && typeof run.input === "object" ? run.input : {}),
              ...(run.inputs && typeof run.inputs === "object" ? run.inputs : {}),
            },
            output: {
              ...fallbackOutput,
              ...output,
              steps: normalizedTimelineSteps.length
                ? normalizedTimelineSteps
                : Array.isArray(output.steps) ? output.steps : Array.isArray(fallbackOutput.steps) ? fallbackOutput.steps : [],
              threads: Array.isArray(output.threads) && output.threads.length
                ? output.threads
                : timelineThreads.length
                  ? timelineThreads
                : Array.isArray(fallbackOutput.threads)
                  ? fallbackOutput.threads
                  : [],
              logs: Array.isArray(output.logs) ? output.logs : Array.isArray(fallbackOutput.logs) ? fallbackOutput.logs : [],
            },
          };
        }

        function stripMetronomeRunStepPrefix(stepId, runId) {
          const normalizedStepId = String(stepId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedStepId || !normalizedRunId) return normalizedStepId;
          const prefix = normalizedRunId + "_";
          return normalizedStepId.startsWith(prefix) ? normalizedStepId.slice(prefix.length) : normalizedStepId;
        }

        function prettifyMetronomeRunNodeKind(kind) {
          const normalized = String(kind || "").trim().replace(/[_-]+/g, " ");
          if (!normalized) return "Workflow step";
          return normalized.slice(0, 1).toUpperCase() + normalized.slice(1);
        }

        function normalizeMetronomeRunTimelineSteps(rows, finalSteps, runId) {
          const safeRows = Array.isArray(rows) ? rows : [];
          if (!safeRows.length) return [];
          const safeFinalSteps = Array.isArray(finalSteps) ? finalSteps : [];
          const finalById = new Map();
          const finalByNodeId = new Map();
          safeFinalSteps.forEach((step, index) => {
            const normalizedId = stripMetronomeRunStepPrefix(step?.id, runId);
            if (normalizedId) finalById.set(normalizedId, step);
            const nodeId = String(step?.nodeId || step?.node_id || "").trim();
            if (nodeId && !finalByNodeId.has(nodeId)) finalByNodeId.set(nodeId, step);
            if (!finalById.has(String(index))) finalById.set(String(index), step);
          });
          return safeRows.map((row, index) => {
            const output = row?.output && typeof row.output === "object" && !Array.isArray(row.output) ? row.output : {};
            const input = row?.input && typeof row.input === "object" && !Array.isArray(row.input) ? row.input : {};
            const metadata = row?.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
            const rawStepId = String(row?.id || row?.stepId || row?.step_id || "").trim();
            const localStepId = stripMetronomeRunStepPrefix(rawStepId, runId);
            const nodeId = String(row?.nodeId || row?.node_id || output.nodeId || output.node_id || "").trim();
            const finalStep = (localStepId && finalById.get(localStepId))
              || finalById.get(String(index))
              || (nodeId ? finalByNodeId.get(nodeId) : null)
              || null;
            const kind = String(row?.nodeType || row?.node_type || finalStep?.kind || finalStep?.nodeType || "action").trim().toLowerCase();
            const summary = String(
              row?.error
              || output.summary
              || output.message
              || finalStep?.summary
              || row?.status
              || ""
            ).trim();
            const label = String(
              finalStep?.label
              || finalStep?.nodeName
              || finalStep?.nodeLabel
              || output.label
              || output.nodeName
              || output.nodeLabel
              || metadata.label
              || metadata.nodeName
              || metadata.nodeLabel
              || summary
              || nodeId
              || prettifyMetronomeRunNodeKind(kind)
            ).trim();
            const selectedEdgeId = String(
              output.selectedEdgeId
              || output.selected_edge_id
              || metadata.selectedEdgeId
              || metadata.selected_edge_id
              || finalStep?.selectedEdgeId
              || finalStep?.selected_edge_id
              || ""
            ).trim();
            return {
              ...(finalStep && typeof finalStep === "object" && !Array.isArray(finalStep) ? finalStep : {}),
              id: localStepId || rawStepId || "timeline-step-" + index,
              index: index + 1,
              nodeId: nodeId || String(finalStep?.nodeId || finalStep?.node_id || "").trim(),
              edgeId: String(input.edgeId || input.edge_id || finalStep?.edgeId || finalStep?.edge_id || "").trim(),
              selectedEdgeId,
              kind,
              label,
              status: String(row?.status || finalStep?.status || "completed").trim() || "completed",
              summary,
              branchId: output.branchId || output.branch_id || finalStep?.branchId || finalStep?.branch_id || null,
              branchLabel: output.branchLabel || output.branch_label || finalStep?.branchLabel || finalStep?.branch_label || null,
              branchRule: output.branchRule || output.branch_rule || finalStep?.branchRule || finalStep?.branch_rule || null,
              branchMatched: typeof output.branchMatched === "boolean" ? output.branchMatched : finalStep?.branchMatched,
              branchReason: output.branchReason || output.branch_reason || finalStep?.branchReason || finalStep?.branch_reason || "",
              startedAt: row?.startedAt || row?.started_at || finalStep?.startedAt || finalStep?.started_at || "",
              completedAt: row?.completedAt || row?.completed_at || finalStep?.completedAt || finalStep?.completed_at || "",
              input,
              output,
              metadata,
            };
          });
        }

        function renderMetronomeRunWorkingDotLoader() {
          return React.createElement("span", {
              className: "playground-metronome-run-thread-dot-loader",
              "aria-hidden": "true",
            },
            React.createElement(PlaygroundDotLoader, {
              dotCount: 9,
              dotSize: 3,
              gap: 2,
              speed: 800,
            })
          );
        }

        function resolveMetronomeRunTraceAttachmentUrl(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment) {
            return "";
          }
          const rawUrl = String(normalizedAttachment.previewUrl || normalizedAttachment.url || "").trim();
          if (
            rawUrl.startsWith("blob:")
            || rawUrl.startsWith("data:")
            || rawUrl.startsWith("http://")
            || rawUrl.startsWith("https://")
          ) {
            return rawUrl;
          }
          if (rawUrl.startsWith("/api/real/attachments/") || rawUrl.startsWith("/api/task-backlog/")) {
            return rawUrl;
          }
          if (rawUrl.startsWith("/attachments/")) {
            return "/api/real" + rawUrl;
          }
          if (rawUrl.startsWith("/")) {
            return rawUrl;
          }
          return normalizedAttachment.id
            ? "/api/real/attachments/" + encodeURIComponent(normalizedAttachment.id)
            : rawUrl;
        }

        function getMetronomeRunTraceAttachments(run, selection) {
          const input = run?.input && typeof run.input === "object" && !Array.isArray(run.input) ? run.input : {};
          const selectionInput = selection?.input && typeof selection.input === "object" && !Array.isArray(selection.input) ? selection.input : {};
          const latestThread = selection?.latestThread && typeof selection.latestThread === "object" && !Array.isArray(selection.latestThread)
            ? selection.latestThread
            : {};
          const threadMetadata = latestThread.metadata && typeof latestThread.metadata === "object" && !Array.isArray(latestThread.metadata)
            ? latestThread.metadata
            : {};
          const attachments = [];
          const seen = new Set();
          [
            input.attachments,
            input.files,
            input.email?.attachments,
            selectionInput.attachments,
            selectionInput.files,
            selectionInput.email?.attachments,
            latestThread.attachments,
            threadMetadata.attachments,
          ].forEach((list) => {
            const items = Array.isArray(list) ? list : list ? [list] : [];
            items.forEach((attachment) => {
              const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
              if (!normalizedAttachment) {
                return;
              }
              const key = String(
                normalizedAttachment.id
                  || normalizedAttachment.fileId
                  || normalizedAttachment.url
                  || normalizedAttachment.previewUrl
                  || normalizedAttachment.filename
                  || ""
              ).trim();
              if (key && seen.has(key)) {
                return;
              }
              if (key) {
                seen.add(key);
              }
              attachments.push(normalizedAttachment);
            });
          });
          return attachments;
        }

        function renderMetronomeRunTraceAttachmentChip(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment) {
            return null;
          }
          const filename = normalizedAttachment.filename || "Attachment";
          const attachmentKey = normalizedAttachment.id || normalizedAttachment.fileId || normalizedAttachment.url || filename;
          const attachmentUrl = resolveMetronomeRunTraceAttachmentUrl(normalizedAttachment);
          const isImage = normalizedAttachment.type === "image" || String(normalizedAttachment.mimeType || "").toLowerCase().startsWith("image/");
          if (isImage) {
            return React.createElement("div", {
                key: "metronome-run-attachment:" + attachmentKey,
                className: "runner-attachment runner-attachment-image runner-attachment-readonly",
                title: filename,
              },
              React.createElement("span", { className: "runner-attachment-image-frame" },
                attachmentUrl
                  ? React.createElement("img", {
                      className: "runner-attachment-image-button runner-attachment-image-preview",
                      src: attachmentUrl,
                      alt: filename,
                      loading: "lazy",
                      decoding: "async",
                    })
                  : React.createElement("span", { className: "runner-attachment-image-placeholder", "aria-hidden": "true" },
                      React.createElement(ImageIcon, { className: "runner-attachment-file-icon", strokeWidth: 1.75 })
                    )
              )
            );
          }

          return React.createElement("div", {
              key: "metronome-run-attachment:" + attachmentKey,
              className: "runner-attachment runner-attachment-file runner-attachment-readonly",
              title: filename,
            },
            React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
              React.createElement("img", {
                className: "runner-attachment-file-icon",
                src: PLAYGROUND_TEXT_FILE_ICON_URL,
                alt: "",
                draggable: false,
              })
            ),
            React.createElement("div", { className: "runner-attachment-file-copy" },
              React.createElement("div", { className: "runner-attachment-file-name", title: filename }, filename)
            )
          );
        }

        function openMetronomeRunTraceThread(entry) {
          const workflowId = String(entry?.metronomeId || "").trim();
          const runId = String(entry?.runId || "").trim();
          const key = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: workflowId, runId }) || "").trim();
          if (!workflowId || !runId || !key) {
            return;
          }
          const syntheticThreadId = createMetronomeRunTraceThreadId(key);
          setAccountMenuOpen(false);
          setSidebarWorkspaceMode("work");
          setActivePage("thread");
          setCurrentThreadId(syntheticThreadId);
          setContentMode("chat");
          setThreadListMode("threads");
          setThreadNavMenuOpen(false);
          setThreadTaskListMenuOpen(false);
          setThreadActionMenuState(null);
          setThreadAgentSelectionOverride(null);
          setPendingThreadRunRequest(null);
          setThreadTaskOpenRequest(null);
          setChangesNavigationTarget(null);
          const nextSelection = {
            key,
            workflowId,
            runId,
            workflowName: String(entry?.workflowName || "Metronome").trim() || "Metronome",
            status: String(entry?.status || "running").trim() || "running",
            input: entry?.input || null,
            threads: Array.isArray(entry?.threads) ? entry.threads : [],
            latestThread: entry?.latestThread || null,
          };
          metronomeRunTraceSelectionRef.current = nextSelection;
          metronomeRunTraceSeenStepKeysRef.current = {
            key,
            hydrated: false,
            keys: new Set(),
          };
          metronomeRunTraceAnimatedStepKeysRef.current = {
            key,
            keys: new Set(),
          };
          setMetronomeRunTraceSelection(nextSelection);
          setMetronomeRunTraceState({
            key,
            status: "loading",
            run: buildFallbackMetronomeRunTraceRun(entry),
            error: "",
          });
          setMetronomeRunTraceWorkExpanded(true);
          setRunnerRenderKey((current) => current + 1);
        }

        function mergeMetronomeRunEntryThreads(...threadGroups) {
          const merged = [];
          const seen = new Set();
          threadGroups.flat().forEach((thread) => {
            const normalizedThread = normalizeThreadItem(thread || {});
            const threadId = String(normalizedThread?.id || "").trim();
            if (!threadId || seen.has(threadId)) {
              return;
            }
            seen.add(threadId);
            merged.push(normalizedThread);
          });
          return merged;
        }

        function buildOptimisticMetronomeRunThread(payload) {
          const normalizedThreadId = String(payload?.threadId || currentThreadId || "").trim();
          const sourceThread = normalizedThreadId
            ? baseThreadItems.find((thread) => String(thread?.id || "").trim() === normalizedThreadId)
              || (String(selectedKnownThread?.id || "").trim() === normalizedThreadId ? selectedKnownThread : null)
            : selectedKnownThread || null;
          const now = new Date().toISOString();
          const normalizedSourceThread = normalizeThreadItem(sourceThread || {});
          const metadata = normalizedSourceThread.metadata && typeof normalizedSourceThread.metadata === "object" && !Array.isArray(normalizedSourceThread.metadata)
            ? normalizedSourceThread.metadata
            : {};
          const metronomeWorkflow = metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
            ? metadata.metronomeWorkflow
            : metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
              ? metadata.metronome
              : {};
          return normalizeThreadItem({
            ...normalizedSourceThread,
            id: normalizedThreadId || normalizedSourceThread.id || generateId("thread"),
            title: normalizedSourceThread.title || "Trigger thread",
            status: normalizedSourceThread.status || String(payload?.status || "running").trim() || "running",
            attachments: Array.isArray(normalizedSourceThread.attachments) && normalizedSourceThread.attachments.length
              ? normalizedSourceThread.attachments
              : Array.isArray(payload?.attachments)
                ? payload.attachments
                : [],
            createdAt: normalizedSourceThread.createdAt || now,
            updatedAt: normalizedSourceThread.updatedAt || now,
            metadata: {
              ...metadata,
              metronomeWorkflow: {
                ...metronomeWorkflow,
                metronomeId: String(payload?.workflowId || "").trim(),
                workflowId: String(payload?.workflowId || "").trim(),
                runId: String(payload?.runId || "").trim(),
                workflowRunId: String(payload?.runId || "").trim(),
                metronomeName: String(payload?.workflowName || "Metronome").trim() || "Metronome",
                workflowName: String(payload?.workflowName || "Metronome").trim() || "Metronome",
                triggerCommand: String(payload?.triggerCommand || "").trim(),
                triggerEventId: String(payload?.triggerEventId || "").trim(),
                originThreadId: String(payload?.originThreadId || normalizedThreadId || "").trim(),
                sourceThreadId: String(payload?.sourceThreadId || normalizedThreadId || "").trim(),
                triggerThreadId: String(payload?.triggerThreadId || normalizedThreadId || "").trim(),
                isOriginThread: true,
              },
            },
          });
        }

        function registerAbsorbedMetronomeTriggerThread(threadId, groupKey) {
          const normalizedThreadId = String(threadId || "").trim();
          const normalizedGroupKey = String(groupKey || "").trim();
          if (!normalizedThreadId || !normalizedGroupKey) {
            return;
          }
          absorbedMetronomeTriggerThreadIdsRef.current = {
            ...(absorbedMetronomeTriggerThreadIdsRef.current && typeof absorbedMetronomeTriggerThreadIdsRef.current === "object"
              ? absorbedMetronomeTriggerThreadIdsRef.current
              : {}),
            [normalizedThreadId]: normalizedGroupKey,
          };
          setAbsorbedMetronomeTriggerThreadIds((current) => {
            const safeCurrent = current && typeof current === "object" ? current : {};
            if (safeCurrent[normalizedThreadId] === normalizedGroupKey) {
              return current;
            }
            return {
              ...safeCurrent,
              [normalizedThreadId]: normalizedGroupKey,
            };
          });
        }

        function buildMetronomeRunEntryFromTriggerThread(thread) {
          const normalizedThread = normalizeThreadItem(thread || {});
          const sourceThreadId = String(normalizedThread?.id || "").trim();
          const meta = getThreadMetronomeMetadata(normalizedThread);
          const key = getSidebarMetronomeRunGroupKey(meta);
          if (!sourceThreadId || !meta || !key) {
            return null;
          }
          if (!isMetronomeOriginTriggerThread(normalizedThread)) {
            return null;
          }
          const metadata = normalizedThread.metadata && typeof normalizedThread.metadata === "object" && !Array.isArray(normalizedThread.metadata)
            ? normalizedThread.metadata
            : {};
          const workflow = metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
            ? metadata.metronomeWorkflow
            : metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
              ? metadata.metronome
              : {};
          const message = readMetronomeRunPromptCandidate(workflow)
            || readMetronomeRunPromptCandidate(metadata)
            || String(normalizedThread.summary || normalizedThread.message || "").trim();
          return {
            kind: "metronome-run",
            key,
            metronomeId: meta.metronomeId,
            runId: meta.runId,
            workflowName: meta.workflowName || "Metronome",
            status: meta.status || String(workflow.status || "running").trim() || "running",
            input: {
              source: "thread_event",
              threadId: sourceThreadId,
              message,
              triggerCommand: String(workflow.triggerCommand || "").trim(),
              attachments: Array.isArray(normalizedThread.attachments) ? normalizedThread.attachments : [],
            },
            threads: [],
            latestThread: normalizedThread,
          };
        }

        function upsertOptimisticMetronomeRunEntry(entry) {
          const groupKey = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
          if (!groupKey) {
            return;
          }
          setOptimisticMetronomeRunEntries((current) => {
            const existing = current && typeof current === "object" ? current[groupKey] : null;
            const existingThreads = Array.isArray(existing?.threads) ? existing.threads : [];
            const entryThreads = Array.isArray(entry?.threads) ? entry.threads : [];
            const threads = mergeMetronomeRunEntryThreads(entryThreads, existingThreads);
            const latestThread = threads.reduce((latest, thread) => (
              !latest || resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(latest) ? thread : latest
            ), existing?.latestThread || entry?.latestThread || null);
            return {
              ...(current && typeof current === "object" ? current : {}),
              [groupKey]: {
                ...(existing && typeof existing === "object" ? existing : {}),
                ...entry,
                key: groupKey,
                threads,
                latestThread,
              },
            };
          });
        }

        function normalizeMetronomeSidebarRun(rawRun, workflow = {}) {
          const raw = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
          const output = raw.output && typeof raw.output === "object" && !Array.isArray(raw.output) ? raw.output : {};
          const input = raw.input && typeof raw.input === "object" && !Array.isArray(raw.input)
            ? raw.input
            : raw.inputs && typeof raw.inputs === "object" && !Array.isArray(raw.inputs)
              ? raw.inputs
              : {};
          return {
            ...raw,
            id: String(raw.id || raw.runId || raw.run_id || "").trim(),
            metronomeId: String(raw.metronomeId || raw.metronome_id || workflow?.id || workflow?.metronomeId || "").trim(),
            workflowName: String(workflow?.name || workflow?.workflowName || raw.workflowName || raw.metronomeName || "Metronome").trim() || "Metronome",
            status: String(raw.status || "completed").trim() || "completed",
            input,
            output,
            createdAt: String(raw.createdAt || raw.created_at || raw.queuedAt || raw.queued_at || "").trim(),
            updatedAt: String(raw.updatedAt || raw.updated_at || raw.completedAt || raw.completed_at || raw.startedAt || raw.started_at || raw.createdAt || raw.created_at || "").trim(),
            startedAt: String(raw.startedAt || raw.started_at || "").trim(),
            completedAt: String(raw.completedAt || raw.completed_at || "").trim(),
          };
        }

        function buildMetronomeRunEntryFromRun(workflow, rawRun) {
          const run = normalizeMetronomeSidebarRun(rawRun, workflow);
          const metronomeId = String(run.metronomeId || workflow?.id || workflow?.metronomeId || "").trim();
          const runId = String(run.id || "").trim();
          const key = getSidebarMetronomeRunGroupKey({ metronomeId, runId });
          if (!key) {
            return null;
          }
          const workflowName = String(run.workflowName || workflow?.name || "Metronome").trim() || "Metronome";
          const runForThreads = {
            ...run,
            workflowId: metronomeId,
            metronomeId,
            workflowName,
            metronomeName: workflowName,
            runId,
          };
          const threads = collectMetronomeRunTraceChildThreads(runForThreads);
          const activityTimestamp = run.updatedAt || run.completedAt || run.startedAt || run.createdAt || new Date().toISOString();
          const syntheticActivityThread = normalizeThreadItem({
            id: createMetronomeRunTraceThreadId(key) || key,
            title: workflowName,
            status: mapMetronomeRunStatusToThreadDisplayStatus(run.status) || run.status || "completed",
            createdAt: run.createdAt || activityTimestamp,
            updatedAt: activityTimestamp,
            metadata: {
              metronomeWorkflow: {
                metronomeId,
                workflowId: metronomeId,
                metronomeName: workflowName,
                workflowName,
                runId,
                workflowRunId: runId,
                status: run.status,
                isOriginThread: false,
              },
            },
          });
          const latestThread = threads.reduce((latest, thread) => (
            !latest || resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(latest) ? thread : latest
          ), syntheticActivityThread);
          return {
            kind: "metronome-run",
            key,
            metronomeId,
            runId,
            workflowName,
            status: run.status,
            input: run.input || null,
            createdAt: run.createdAt || "",
            updatedAt: run.updatedAt || "",
            threads,
            latestThread,
          };
        }

        const loadRecentMetronomeSidebarRuns = useCallback(async function loadRecentMetronomeSidebarRuns(options = {}) {
          if (!hasRealAccess || hasDemoAccess) {
            metronomeSidebarRunsLoadKeyRef.current = "";
            return;
          }
          const scopeKey = [
            String(activeOrganizationId || "").trim() || "__personal__",
            requestHeadersSignature,
            proxyBackendBase,
          ].join("|");
          if (!options?.force && metronomeSidebarRunsLoadKeyRef.current === scopeKey) {
            return;
          }
          metronomeSidebarRunsLoadKeyRef.current = scopeKey;
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/metronomes?limit=50", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 10000);
            if (!response.ok) {
              return;
            }
            if (metronomeSidebarRunsLoadKeyRef.current !== scopeKey) {
              return;
            }
            const workflows = getPlaygroundMetronomeListArray(data)
              .map(normalizePlaygroundCalendarMetronomeWorkflow)
              .filter((workflow) => {
                const workflowId = String(workflow?.id || "").trim();
                const status = String(workflow?.status || "").trim().toLowerCase();
                return workflowId && status !== "archived";
              })
              .slice(0, 50);
            if (!workflows.length) {
              return;
            }

            const loadedEntries = [];
            for (let index = 0; index < workflows.length; index += 6) {
              const batch = workflows.slice(index, index + 6);
              const batchResults = await Promise.all(batch.map(async (workflow) => {
                const workflowId = String(workflow?.id || "").trim();
                try {
                  const runsResult = await fetchJsonWithTimeout(
                    proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId) + "/runs?limit=3",
                    {
                      method: "GET",
                      credentials: "include",
                      cache: "no-store",
                      headers: requestHeaders,
                    },
                    10000
                  );
                  if (!runsResult.response.ok) {
                    return [];
                  }
                  const rawRuns = Array.isArray(runsResult.data?.data)
                    ? runsResult.data.data
                    : Array.isArray(runsResult.data)
                      ? runsResult.data
                      : [];
                  return rawRuns
                    .map((run) => buildMetronomeRunEntryFromRun(workflow, run))
                    .filter(Boolean);
                } catch {
                  return [];
                }
              }));
              loadedEntries.push(...batchResults.flat());
            }

            if (!loadedEntries.length) {
              return;
            }
            if (metronomeSidebarRunsLoadKeyRef.current !== scopeKey) {
              return;
            }
            setOptimisticMetronomeRunEntries((current) => {
              const safeCurrent = current && typeof current === "object" ? current : {};
              const next = { ...safeCurrent };
              loadedEntries.forEach((entry) => {
                const groupKey = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
                if (!groupKey) {
                  return;
                }
                const existing = safeCurrent[groupKey] || null;
                const threads = mergeMetronomeRunEntryThreads(
                  Array.isArray(entry?.threads) ? entry.threads : [],
                  Array.isArray(existing?.threads) ? existing.threads : []
                );
                const latestThread = threads.reduce((latest, thread) => (
                  !latest || resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(latest) ? thread : latest
                ), existing?.latestThread || entry?.latestThread || null);
                next[groupKey] = {
                  ...(existing && typeof existing === "object" ? existing : {}),
                  ...entry,
                  key: groupKey,
                  threads,
                  latestThread,
                };
              });
              return next;
            });
          } catch {
            metronomeSidebarRunsLoadKeyRef.current = "";
          }
        }, [activeOrganizationId, hasDemoAccess, hasRealAccess, proxyBackendBase, requestHeaders, requestHeadersSignature]);

        useEffect(() => {
          if (!hasRealAccess || hasDemoAccess) {
            metronomeSidebarRunsLoadKeyRef.current = "";
            return undefined;
          }
          if (activePage !== "metronome") {
            return undefined;
          }
          void loadRecentMetronomeSidebarRuns();
          return undefined;
        }, [activePage, hasDemoAccess, hasRealAccess, loadRecentMetronomeSidebarRuns]);

        useEffect(() => {
          function handleMetronomeRunUpserted(event) {
            const detail = event?.detail && typeof event.detail === "object" ? event.detail : {};
            const workflow = detail.workflow || detail.metronome || {};
            const run = detail.run || detail.metronomeRun || detail;
            const entry = buildMetronomeRunEntryFromRun(workflow, run);
            if (entry) {
              upsertOptimisticMetronomeRunEntry(entry);
            }
          }

          window.addEventListener("playground:metronome-run-upserted", handleMetronomeRunUpserted);
          return () => window.removeEventListener("playground:metronome-run-upserted", handleMetronomeRunUpserted);
        }, []);

        function handleMetronomeWorkflowRunFromThread(payload) {
          const workflowId = String(payload?.workflowId || "").trim();
          const runId = String(payload?.runId || "").trim();
          const sourceThreadId = String(payload?.threadId || "").trim();
          const payloadNodeId = String(payload?.nodeId || "").trim();
          const hasTriggerMarker = Boolean(
            payload?.isOriginThread === true
            || String(payload?.triggerCommand || "").trim()
            || String(payload?.triggerEventId || "").trim()
            || String(payload?.originThreadId || "").trim()
            || String(payload?.sourceThreadId || "").trim()
            || String(payload?.triggerThreadId || "").trim()
          );
          const key = getSidebarMetronomeRunGroupKey({ metronomeId: workflowId, runId });
          if (!workflowId || !runId || !key) {
            return;
          }
          if (payloadNodeId || payload?.isOriginThread === false || !hasTriggerMarker) {
            return;
          }
          const triggerThread = buildOptimisticMetronomeRunThread(payload);
          if (sourceThreadId) {
            registerAbsorbedMetronomeTriggerThread(sourceThreadId, key);
            setRealThreads((current) => current.filter((thread) => String(thread?.id || "").trim() !== sourceThreadId));
            setThreadActionMenuState((current) => (
              current?.threadId === sourceThreadId ? null : current
            ));
            setThreadRenameState((current) => (
              current?.threadId === sourceThreadId ? null : current
            ));
            setThreadProjectPickerState((current) => (
              current?.threadId === sourceThreadId ? null : current
            ));
          }
          const entry = {
            kind: "metronome-run",
            key,
            metronomeId: workflowId,
            runId,
            workflowName: String(payload?.workflowName || "Metronome").trim() || "Metronome",
            status: String(payload?.status || "running").trim() || "running",
            input: {
              source: "thread_event",
              threadId: sourceThreadId,
              message: String(payload?.userMessage || payload?.triggerCommand || "").trim(),
              triggerCommand: String(payload?.triggerCommand || "").trim(),
              attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
            },
            threads: [],
            latestThread: triggerThread.id ? triggerThread : null,
          };
          upsertOptimisticMetronomeRunEntry(entry);
          if (
            String(metronomeRunTraceSelection?.key || "").trim() !== key
            || String(currentThreadId || "").trim() !== createMetronomeRunTraceThreadId(key)
          ) {
            openMetronomeRunTraceThread(entry);
          }
        }

        useEffect(() => {
          if (!hasRealAccess || !Array.isArray(realThreads) || realThreads.length === 0) {
            return;
          }
          const activeThreadId = String(currentThreadId || "").trim();
          const absorbedMap = absorbedMetronomeTriggerThreadIdsRef.current && typeof absorbedMetronomeTriggerThreadIdsRef.current === "object"
            ? absorbedMetronomeTriggerThreadIdsRef.current
            : {};
          const absorbedSourceThreadIds = [];
          const entries = [];

          realThreads.forEach((thread) => {
            const sourceThreadId = String(thread?.id || "").trim();
            if (!sourceThreadId) {
              return;
            }
            const entry = buildMetronomeRunEntryFromTriggerThread(thread);
            if (!entry) {
              return;
            }
            const registeredGroupKey = String(absorbedMap[sourceThreadId] || "").trim();
            const isActiveSourceThread = Boolean(activeThreadId && activeThreadId === sourceThreadId);
            if (!registeredGroupKey && !isActiveSourceThread) {
              return;
            }
            if (registeredGroupKey && registeredGroupKey !== entry.key) {
              return;
            }
            registerAbsorbedMetronomeTriggerThread(sourceThreadId, entry.key);
            absorbedSourceThreadIds.push(sourceThreadId);
            entries.push({
              entry,
              shouldOpen: isActiveSourceThread || activeThreadId === createMetronomeRunTraceThreadId(entry.key),
            });
          });

          if (entries.length === 0) {
            return;
          }

          entries.forEach(({ entry }) => upsertOptimisticMetronomeRunEntry(entry));

          if (absorbedSourceThreadIds.length) {
            const absorbedSet = new Set(absorbedSourceThreadIds);
            setRealThreads((current) => current.filter((thread) => !absorbedSet.has(String(thread?.id || "").trim())));
          }

          const openEntry = entries.find((item) => item.shouldOpen)?.entry || null;
          if (
            openEntry
            && String(metronomeRunTraceSelectionRef.current?.key || "").trim() !== String(openEntry.key || "").trim()
          ) {
            openMetronomeRunTraceThread(openEntry);
          }
        }, [currentThreadId, hasRealAccess, realThreads]);

        useEffect(() => {
          metronomeRunTraceSelectionRef.current = metronomeRunTraceSelection;
        }, [metronomeRunTraceSelection]);

        useEffect(() => {
          const selection = metronomeRunTraceSelection;
          const key = String(selection?.key || "").trim();
          const workflowId = String(selection?.workflowId || "").trim();
          const runId = String(selection?.runId || "").trim();
          if (activePage !== "thread" || !key || !workflowId || !runId || !hasRealAccess) {
            if (!key) {
              setMetronomeRunTraceState((current) => (
                current.key ? { key: "", status: "idle", run: null, error: "" } : current
              ));
            }
            return undefined;
          }

          let cancelled = false;
          setMetronomeRunTraceState({
            key,
            status: "loading",
            run: buildFallbackMetronomeRunTraceRun(selection),
            error: "",
          });

          let reloadTimer = null;
          const scheduleRunTraceReload = (run, failed) => {
            if (cancelled) return;
            const startedAt = Date.parse(String(run?.startedAt || run?.createdAt || ""));
            const elapsedMs = Number.isFinite(startedAt) ? Math.max(0, Date.now() - startedAt) : 0;
            const delayMs = failed
              ? 15000
              : document.visibilityState === "hidden"
                ? 30000
                : elapsedMs >= 10 * 60 * 1000
                  ? 15000
                  : elapsedMs >= 60 * 1000
                    ? 10000
                    : 5000;
            reloadTimer = setTimeout(loadRunTrace, delayMs);
          };
          const loadRunTrace = async () => {
            try {
              const { response, data } = await fetchJsonWithTimeout(
                proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId) + "/runs/" + encodeURIComponent(runId) + "/timeline?view=compact",
                { method: "GET", headers: authRequestHeaders },
                12000
              );
              if (cancelled) return;
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load Metronome run.");
              }
              const nextRun = normalizeMetronomeRunTraceResponse(data, selection);
              const nextStepKeys = getMetronomeRunTraceSteps(nextRun)
                .map((step, index) => getMetronomeRunTraceStepRenderKey(step, index))
                .filter(Boolean);
              const previousSeen = metronomeRunTraceSeenStepKeysRef.current;
              if (!previousSeen || previousSeen.key !== key || !previousSeen.hydrated) {
                const shouldAnimateInitialSteps = Boolean(
                  nextStepKeys.length
                  && isActiveMetronomeRunStatus(nextRun?.status)
                  && previousSeen
                  && previousSeen.key === key
                  && previousSeen.keys instanceof Set
                  && previousSeen.keys.size === 0
                );
                metronomeRunTraceSeenStepKeysRef.current = {
                  key,
                  hydrated: true,
                  keys: new Set(nextStepKeys),
                };
                metronomeRunTraceAnimatedStepKeysRef.current = {
                  key,
                  keys: new Set(shouldAnimateInitialSteps ? nextStepKeys : []),
                };
              } else {
                const animatedKeys = nextStepKeys.filter((stepKey) => !previousSeen.keys.has(stepKey));
                metronomeRunTraceSeenStepKeysRef.current = {
                  key,
                  hydrated: true,
                  keys: new Set([...previousSeen.keys, ...nextStepKeys]),
                };
                metronomeRunTraceAnimatedStepKeysRef.current = {
                  key,
                  keys: new Set(animatedKeys),
                };
              }
              setMetronomeRunTraceState({
                key,
                status: "loaded",
                run: nextRun,
                error: "",
              });
              const nextTraceThreads = collectMetronomeRunTraceChildThreads(nextRun);
              if (nextTraceThreads.length) {
                setRealThreads((current) => {
                  const existingById = new Map((Array.isArray(current) ? current : []).map((thread) => [String(thread?.id || "").trim(), thread]));
                  let didChange = false;
                  nextTraceThreads.forEach((thread) => {
                    const threadId = String(thread?.id || "").trim();
                    if (!threadId || privateThreadIdsRef.current.has(threadId) || isPrivateThreadRecord(thread)) {
                      return;
                    }
                    const existing = existingById.get(threadId) || null;
                    if (!existing || JSON.stringify(existing) !== JSON.stringify(thread)) {
                      didChange = true;
                      existingById.set(threadId, existing ? normalizeThreadItem({ ...existing, ...thread }) : thread);
                    }
                  });
                  return didChange ? normalizeThreadList(Array.from(existingById.values())) : current;
                });
              }
              setOptimisticMetronomeRunEntries((current) => {
                const existing = current && typeof current === "object" ? current[key] : null;
                const nextThreads = mergeMetronomeRunEntryThreads(nextTraceThreads, Array.isArray(existing?.threads) ? existing.threads : []);
                const latestThread = nextThreads.reduce((latest, thread) => (
                  !latest || resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(latest) ? thread : latest
                ), existing?.latestThread || null);
                return {
                  ...(current && typeof current === "object" ? current : {}),
                  [key]: {
                    ...(existing && typeof existing === "object" ? existing : {}),
                    kind: "metronome-run",
                    key,
                    metronomeId: workflowId,
                    runId,
                    workflowName: String(selection?.workflowName || nextRun?.metronomeName || nextRun?.workflowName || existing?.workflowName || "Metronome").trim() || "Metronome",
                    status: String(nextRun?.status || existing?.status || "").trim(),
                    input: nextRun?.input || existing?.input || null,
                    threads: nextThreads,
                    latestThread,
                  },
                };
              });
              setMetronomeRunStatusByKey((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                [key]: String(nextRun?.status || "").trim(),
              }));
              if (isActiveMetronomeRunStatus(nextRun?.status) && !cancelled) {
                scheduleRunTraceReload(nextRun, false);
              }
            } catch (error) {
              if (cancelled) return;
              setMetronomeRunTraceState({
                key,
                status: "error",
                run: buildFallbackMetronomeRunTraceRun(selection),
                error: error instanceof Error ? error.message : "Failed to load Metronome run.",
              });
              scheduleRunTraceReload(buildFallbackMetronomeRunTraceRun(selection), true);
            }
          };

          void loadRunTrace();

          return () => {
            cancelled = true;
            if (reloadTimer) {
              clearTimeout(reloadTimer);
            }
          };
        }, [
          activePage,
          authRequestHeaders,
          hasRealAccess,
          metronomeRunTraceSelection,
          proxyBackendBase,
        ]);

        useEffect(() => {
          const key = String(metronomeRunTraceSelection?.key || "").trim();
          if (!key) {
            return;
          }
          if (String(currentThreadId || "").trim() !== createMetronomeRunTraceThreadId(key)) {
            setMetronomeRunTraceSelection(null);
          }
        }, [currentThreadId, metronomeRunTraceSelection?.key]);

        useEffect(() => {
          const handleOpenMetronomeWorkflow = (event) => {
            const detail = event?.detail && typeof event.detail === "object" ? event.detail : {};
            const normalizedWorkflowId = String(detail.workflowId || "").trim();
            if (!normalizedWorkflowId) {
              return;
            }
            openMetronomePage({
              workflowId: normalizedWorkflowId,
              runId: String(detail.runId || "").trim(),
              mode: detail.mode === "run-detail" ? "run-detail" : detail.mode === "runs" ? "runs" : detail.mode === "code" ? "code" : "edit",
            });
          };
          window.addEventListener("playground:open-metronome-workflow", handleOpenMetronomeWorkflow);
          return () => {
            window.removeEventListener("playground:open-metronome-workflow", handleOpenMetronomeWorkflow);
          };
        }, []);

`;
