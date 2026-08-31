export const METRONOME_APP_RUN_CONTROLLER_SCRIPT = `
        function openMetronomePage(options = {}) {
          const normalizedProjectId = String(options?.projectId || "").trim();
          const normalizedWorkflowId = String(options?.workflowId || "").trim();
          const normalizedRunId = String(options?.runId || "").trim();
          const shouldCreateWorkflow = Boolean(options?.createWorkflow);
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
          setMetronomeOpenWorkflowRequest(normalizedWorkflowId || shouldCreateWorkflow
            ? {
                workflowId: normalizedWorkflowId,
                runId: normalizedRunId,
                mode: requestedMode,
                action: shouldCreateWorkflow ? "create" : "",
                token: Date.now(),
              }
            : null);
          setActivePage("metronome");
        }

        function openMetronomeOverviewPage() {
          const goOverview = metronomeTopNavActionsRef.current?.goOverview;
          if (typeof goOverview === "function") {
            goOverview();
          }
          openMetronomePage();
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

        function enrichMetronomeRunTraceConditionSteps(steps, workflow) {
          const definition = workflow?.definition && typeof workflow.definition === "object"
            ? workflow.definition
            : {};
          const workflowNodes = Array.isArray(workflow?.nodes)
            ? workflow.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          if (!workflowNodes.length) return Array.isArray(steps) ? steps : [];
          const nodesById = new Map(
            workflowNodes
              .map((node) => [String(node?.id || "").trim(), node])
              .filter(([nodeId]) => Boolean(nodeId))
          );
          return (Array.isArray(steps) ? steps : []).map((step) => {
            const nodeId = String(step?.nodeId || step?.node_id || "").trim();
            const workflowNode = nodesById.get(nodeId) || null;
            if (!workflowNode) {
              return step;
            }
            const nodeData = workflowNode?.data && typeof workflowNode.data === "object" && !Array.isArray(workflowNode.data)
              ? workflowNode.data
              : {};
            const workflowNodeName = String(
              nodeData.label
              || workflowNode.label
              || nodeData.name
              || workflowNode.name
              || nodeData.title
              || workflowNode.title
              || ""
            ).trim();
            const isCondition = String(step?.kind || step?.nodeType || nodeData.kind || workflowNode.kind || "").trim().toLowerCase() === "condition";
            return {
              ...step,
              ...(workflowNodeName
                ? {
                    label: workflowNodeName,
                    nodeLabel: workflowNodeName,
                    nodeName: workflowNodeName,
                  }
                : {}),
              ...(isCondition ? { conditionNode: workflowNode } : {}),
            };
          });
        }

        function normalizeMetronomeRunTraceResponse(data, selection, workflow = null) {
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
          const runSteps = normalizedTimelineSteps.length
            ? normalizedTimelineSteps
            : Array.isArray(output.steps)
              ? output.steps
              : Array.isArray(fallbackOutput.steps)
                ? fallbackOutput.steps
                : [];
          const enrichedRunSteps = enrichMetronomeRunTraceConditionSteps(runSteps, workflow);
          const timelineThreads = enrichedRunSteps
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
          const mergedTimelineThreads = mergeMetronomeThreadLifecycleRecordLists(
            Array.isArray(output.threads) ? output.threads : [],
            timelineThreads,
          );
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
              steps: enrichedRunSteps,
              threads: mergedTimelineThreads.length
                ? mergedTimelineThreads
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
            const rowOutput = row?.output && typeof row.output === "object" && !Array.isArray(row.output) ? row.output : {};
            const rowInput = row?.input && typeof row.input === "object" && !Array.isArray(row.input) ? row.input : {};
            const metadata = row?.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
            const rawStepId = String(row?.id || row?.stepId || row?.step_id || "").trim();
            const localStepId = stripMetronomeRunStepPrefix(rawStepId, runId);
            const nodeId = String(row?.nodeId || row?.node_id || rowOutput.nodeId || rowOutput.node_id || "").trim();
            const finalStep = (localStepId && finalById.get(localStepId))
              || finalById.get(String(index))
              || (nodeId ? finalByNodeId.get(nodeId) : null)
              || null;
            const finalOutput = finalStep?.output && typeof finalStep.output === "object" && !Array.isArray(finalStep.output)
              ? finalStep.output
              : {};
            const finalInput = finalStep?.input && typeof finalStep.input === "object" && !Array.isArray(finalStep.input)
              ? finalStep.input
              : {};
            const getStepOutputThread = (value) => {
              const safeValue = value && typeof value === "object" && !Array.isArray(value) ? value : {};
              const thread = safeValue.thread || safeValue.threadRecord || safeValue.thread_record;
              return thread && typeof thread === "object" && !Array.isArray(thread) ? thread : null;
            };
            const finalOutputThread = getStepOutputThread(finalOutput);
            const rowOutputThread = getStepOutputThread(rowOutput);
            const mergedOutputThread = finalOutputThread || rowOutputThread
              ? mergeMetronomeThreadLifecycleRecords(finalOutputThread || {}, rowOutputThread || {})
              : null;
            const output = {
              ...finalOutput,
              ...rowOutput,
              ...(mergedOutputThread ? { thread: mergedOutputThread } : {}),
            };
            const input = { ...finalInput, ...rowInput };
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
            const startedAt = row?.startedAt || row?.started_at || finalStep?.startedAt || finalStep?.started_at || "";
            const completedAt = row?.completedAt || row?.completed_at || finalStep?.completedAt || finalStep?.completed_at || "";
            const lifecycle = resolveMetronomeThreadLifecycle([
              { record: finalStep || {}, source: "final-step", priority: 100 },
              { record: output, source: "step-output", priority: 200 },
              { record: row || {}, source: "timeline-row", priority: 300 },
              { record: mergedOutputThread || {}, source: "output-thread", priority: 400 },
            ], {
              nodeId: nodeId || String(finalStep?.nodeId || finalStep?.node_id || "").trim(),
              startedAt,
            });
            return {
              ...(finalStep && typeof finalStep === "object" && !Array.isArray(finalStep) ? finalStep : {}),
              id: localStepId || rawStepId || "timeline-step-" + index,
              index: index + 1,
              nodeId: nodeId || String(finalStep?.nodeId || finalStep?.node_id || "").trim(),
              edgeId: String(input.edgeId || input.edge_id || finalStep?.edgeId || finalStep?.edge_id || "").trim(),
              selectedEdgeId,
              kind,
              label,
              status: lifecycle.status || String(row?.status || finalStep?.status || "").trim(),
              summary,
              branchId: output.branchId || output.branch_id || finalStep?.branchId || finalStep?.branch_id || null,
              branchLabel: output.branchLabel || output.branch_label || finalStep?.branchLabel || finalStep?.branch_label || null,
              branchRule: output.branchRule || output.branch_rule || finalStep?.branchRule || finalStep?.branch_rule || null,
              branchMatched: typeof output.branchMatched === "boolean" ? output.branchMatched : finalStep?.branchMatched,
              branchReason: output.branchReason || output.branch_reason || finalStep?.branchReason || finalStep?.branch_reason || "",
              startedAt,
              completedAt,
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

        function expandMetronomeSidebarRunGroup(entry) {
          const workflowId = String(entry?.metronomeId || entry?.workflowId || "").trim();
          const runId = String(entry?.runId || entry?.workflowRunId || "").trim();
          const key = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: workflowId, runId }) || "").trim();
          if (!workflowId || !runId || !key) {
            return;
          }
          setCollapsedMetronomeRunGroups((current) => ({
            ...(current && typeof current === "object" ? current : {}),
            [key]: false,
          }));
          void loadMetronomeSidebarRunThreads({
            ...entry,
            key,
            metronomeId: workflowId,
            runId,
          });
        }

        function openMetronomeRunTraceThread(entry) {
          const workflowId = String(entry?.metronomeId || "").trim();
          const runId = String(entry?.runId || "").trim();
          const key = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: workflowId, runId }) || "").trim();
          if (!workflowId || !runId || !key) {
            return;
          }
          expandMetronomeSidebarRunGroup(entry);
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
            originThread: entry?.originThread || findMetronomeRunOriginThread(entry, realThreads),
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
          setMetronomeRunActivitySearchQuery("");
          setMetronomeRunActivityTimeRange(null);
          setMetronomeRunActivityChartHeight(null);
          setMetronomeRunActivitySelectedItemId("");
          setRunnerRenderKey((current) => current + 1);
        }

        function mergeMetronomeRunEntryThreads(...threadGroups) {
          return mergeMetronomeThreadLifecycleRecordLists(...threadGroups)
            .map((thread) => normalizeThreadItem(thread || {}))
            .sort(compareThreadsByRecent);
        }

        function mergeMetronomeChildThreadsIntoRealThreads(current, incomingThreads) {
          const existingById = new Map(
            (Array.isArray(current) ? current : [])
              .map((thread) => [String(thread?.id || "").trim(), thread])
              .filter(([threadId]) => Boolean(threadId))
          );
          let didChange = false;
          (Array.isArray(incomingThreads) ? incomingThreads : []).forEach((thread) => {
            const threadId = String(thread?.id || "").trim();
            if (!threadId || privateThreadIdsRef.current.has(threadId) || isPrivateThreadRecord(thread)) {
              return;
            }
            const existing = existingById.get(threadId) || null;
            const merged = normalizeThreadItem(
              existing ? mergeMetronomeThreadLifecycleRecords(existing, thread) : thread
            );
            if (!existing || JSON.stringify(existing) !== JSON.stringify(merged)) {
              didChange = true;
              existingById.set(threadId, merged);
            }
          });
          return didChange ? normalizeThreadList(Array.from(existingById.values())) : current;
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
            originThread: normalizedThread,
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
                originThread: entry?.originThread || existing?.originThread || null,
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
          const threads = collectMetronomeRunTraceChildThreads(runForThreads, {
            workflowId: metronomeId,
            runId,
            workflowName,
          });
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

        async function loadMetronomeSidebarRunThreads(entry, options = {}) {
          const workflowId = String(entry?.metronomeId || entry?.workflowId || "").trim();
          const runId = String(entry?.runId || entry?.workflowRunId || "").trim();
          const key = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: workflowId, runId }) || "").trim();
          if (!workflowId || !runId || !key || !hasRealAccess) {
            return [];
          }

          const currentLoadStatus = String(metronomeSidebarRunThreadLoadStateByKey?.[key]?.status || "idle").trim();
          const shouldRefreshActiveRun = isActiveMetronomeRunStatus(entry?.status);
          const isBackgroundRefresh = options?.background === true;
          if (currentLoadStatus === "loading" || (currentLoadStatus === "loaded" && !options?.force && !shouldRefreshActiveRun)) {
            return Array.isArray(entry?.threads) ? entry.threads : [];
          }

          if (!isBackgroundRefresh) {
            setMetronomeSidebarRunThreadLoadStateByKey((current) => ({
              ...(current && typeof current === "object" ? current : {}),
              [key]: { status: "loading", error: "" },
            }));
          }

          const selection = {
            key,
            workflowId,
            runId,
            workflowName: String(entry?.workflowName || "Metronome").trim() || "Metronome",
            status: String(entry?.status || "").trim(),
            input: entry?.input || null,
            threads: Array.isArray(entry?.threads) ? entry.threads : [],
            latestThread: entry?.latestThread || null,
            originThread: entry?.originThread || null,
          };

          try {
            const [timelineResponse, workflowResponse] = await Promise.all([
              fetchJsonWithTimeout(
                proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId) + "/runs/" + encodeURIComponent(runId) + "/timeline?view=compact",
                {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: authRequestHeaders,
                },
                12000
              ),
              isBackgroundRefresh
                ? Promise.resolve(null)
                : fetchJsonWithTimeout(
                    proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId),
                    {
                      method: "GET",
                      credentials: "include",
                      cache: "no-store",
                      headers: authRequestHeaders,
                    },
                    8000
                  ).catch(() => null),
            ]);
            const { response, data } = timelineResponse;
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load run threads.");
            }

            const workflowData = workflowResponse?.response?.ok
              ? workflowResponse.data?.data
                || workflowResponse.data?.metronome
                || workflowResponse.data?.workflow
                || workflowResponse.data
              : null;
            const workflow = workflowData && typeof workflowData === "object" && !Array.isArray(workflowData)
              ? normalizeMetronomeWorkflow(workflowData)
              : null;
            const run = normalizeMetronomeRunTraceResponse(data, selection, workflow);
            const threads = collectMetronomeRunTraceChildThreads(run, selection);
            if (threads.length) {
              setRealThreads((current) => mergeMetronomeChildThreadsIntoRealThreads(current, threads));
            }

            const latestThread = threads.reduce((latest, thread) => (
              !latest || resolveThreadSortTimestamp(thread) > resolveThreadSortTimestamp(latest) ? thread : latest
            ), entry?.latestThread || null);
            upsertOptimisticMetronomeRunEntry({
              ...entry,
              kind: "metronome-run",
              key,
              metronomeId: workflowId,
              runId,
              workflowName: String(entry?.workflowName || run?.metronomeName || run?.workflowName || "Metronome").trim() || "Metronome",
              status: String(run?.status || entry?.status || "").trim(),
              input: run?.input || entry?.input || null,
              threads,
              latestThread,
              originThread: entry?.originThread || null,
            });
            setMetronomeRunStatusByKey((current) => ({
              ...(current && typeof current === "object" ? current : {}),
              [key]: String(run?.status || entry?.status || "").trim(),
            }));
            setMetronomeSidebarRunThreadLoadStateByKey((current) => ({
              ...(current && typeof current === "object" ? current : {}),
              [key]: { status: "loaded", error: "" },
            }));
            return threads;
          } catch (error) {
            if (!isBackgroundRefresh) {
              setMetronomeSidebarRunThreadLoadStateByKey((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                [key]: {
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to load run threads.",
                },
              }));
            }
            return [];
          }
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
                    proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId) + "/runs?limit=1",
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
            metronomeSidebarRunsLoadKeyRef.current = "";
            return undefined;
          }
          void loadRecentMetronomeSidebarRuns();
          return undefined;
        }, [activePage, hasDemoAccess, hasRealAccess, loadRecentMetronomeSidebarRuns]);

        const expandedActiveMetronomeRunPollEntries = Object.values(
          optimisticMetronomeRunEntries && typeof optimisticMetronomeRunEntries === "object"
            ? optimisticMetronomeRunEntries
            : {}
        ).filter((entry) => {
          const key = String(entry?.key || "").trim();
          return key
            && collapsedMetronomeRunGroups[key] === false
            && isActiveMetronomeRunStatus(entry?.status)
            && !(
              activePage === "thread"
              && key === String(metronomeRunTraceSelection?.key || "").trim()
            );
        });
        const expandedActiveMetronomeRunPollSignature = expandedActiveMetronomeRunPollEntries
          .map((entry) => [entry.key, entry.status].join(":"))
          .sort()
          .join("|");

        useEffect(() => {
          if (!hasRealAccess || !expandedActiveMetronomeRunPollSignature) {
            return undefined;
          }
          let cancelled = false;
          let timer = null;
          const entries = expandedActiveMetronomeRunPollEntries.slice();
          const schedule = (delayMs) => {
            if (cancelled) return;
            timer = setTimeout(poll, delayMs);
          };
          const poll = async () => {
            await Promise.allSettled(entries.map((entry) => loadMetronomeSidebarRunThreads(entry, {
              force: true,
              background: true,
            })));
            schedule(document.visibilityState === "hidden" ? 10000 : 1000);
          };
          schedule(250);
          return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
          };
        }, [
          expandedActiveMetronomeRunPollSignature,
          hasRealAccess,
          proxyBackendBase,
          requestHeadersSignature,
        ]);

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

        useEffect(() => {
          if (!hasRealAccess || !showInitialThreadWelcome) {
            if (!hasRealAccess) {
              setMetronomeComposerWorkflowTriggers([]);
            }
            return undefined;
          }

          let cancelled = false;
          const loadComposerWorkflowTriggers = async () => {
            try {
              const workflows = await fetchMetronomeWorkflowsFromApi("", {
                backendUrl: proxyBackendBase,
                requestHeaders: authRequestHeaders,
                limit: 250,
              });
              if (!cancelled) {
                setMetronomeComposerWorkflowTriggers(
                  listMetronomeThreadTriggerOptions(workflows, {
                    activeOnly: true,
                    dedupe: true,
                  })
                );
              }
            } catch (error) {
              if (!cancelled) {
                console.warn("Failed to load workflow commands for the composer", error);
                setMetronomeComposerWorkflowTriggers([]);
              }
            }
          };

          void loadComposerWorkflowTriggers();
          const handleWindowFocus = () => {
            void loadComposerWorkflowTriggers();
          };
          window.addEventListener("focus", handleWindowFocus);
          return () => {
            cancelled = true;
            window.removeEventListener("focus", handleWindowFocus);
          };
        }, [
          authRequestHeaders,
          hasRealAccess,
          proxyBackendBase,
          requestHeadersSignature,
          showInitialThreadWelcome,
        ]);

        async function handleComposerMetronomeWorkflowTriggerSubmit(payload) {
          const workflow = payload?.workflow && typeof payload.workflow === "object"
            ? payload.workflow
            : {};
          const workflowId = String(workflow.workflowId || workflow.id || "").trim();
          const workflowName = String(workflow.name || "Metronome").trim() || "Metronome";
          const triggerCommand = normalizeMetronomeThreadTriggerCommand(
            payload?.command || workflow.command
          );
          if (!workflowId || !triggerCommand || triggerCommand === "@") {
            throw new Error("This workflow command is no longer available.");
          }

          const message = String(payload?.prompt || "").trim();
          const prompt = message || triggerCommand;
          const randomId = globalThis.crypto?.randomUUID?.()
            || (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2));
          const run = await createMetronomeThreadCommandRunApi(workflowId, {
            command: triggerCommand,
            prompt,
            idempotencyKey: "composer-thread-trigger:" + workflowId + ":" + randomId,
            inputs: {
              source: "composer_thread_trigger",
              triggerType: "thread_event",
              triggerCommand,
              command: triggerCommand,
              message: prompt,
              attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
              projectId: String(payload?.projectId || "").trim() || null,
              environmentId: String(payload?.environmentId || "").trim() || null,
              agentId: String(payload?.agentId || "").trim() || null,
              agentName: String(payload?.agentName || "").trim() || null,
              reasoningEffort: String(payload?.reasoningEffort || "").trim() || null,
              githubRepo: payload?.githubRepo || null,
              enabledSkills: payload?.enabledSkills || null,
              connectors: payload?.connectors || null,
              knowledgeContext: payload?.knowledgeContext || null,
              quotedSelection: payload?.quotedSelection || null,
            },
          });
          const runId = String(run?.id || "").trim();
          if (!runId) {
            throw new Error("The workflow started without returning a run id.");
          }

          handleMetronomeWorkflowRunFromThread({
            workflowId,
            workflowName,
            runId,
            status: String(run?.status || "running").trim() || "running",
            triggerCommand,
            userMessage: prompt,
            attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
            directComposerTrigger: true,
          });
          return true;
        }

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
          const isDirectComposerTrigger = payload?.directComposerTrigger === true;
          const triggerThread = isDirectComposerTrigger
            ? null
            : buildOptimisticMetronomeRunThread(payload);
          if (sourceThreadId) {
            registerAbsorbedMetronomeTriggerThread(sourceThreadId, key);
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
              source: isDirectComposerTrigger ? "composer_thread_trigger" : "thread_event",
              threadId: sourceThreadId,
              message: String(payload?.userMessage || payload?.triggerCommand || "").trim(),
              triggerCommand: String(payload?.triggerCommand || "").trim(),
              attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
            },
            threads: [],
            latestThread: triggerThread?.id ? triggerThread : null,
            originThread: triggerThread?.id ? triggerThread : null,
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
            if (registeredGroupKey && registeredGroupKey !== entry.key) {
              return;
            }
            registerAbsorbedMetronomeTriggerThread(sourceThreadId, entry.key);
            entries.push({
              entry,
              shouldOpen: isActiveSourceThread || activeThreadId === createMetronomeRunTraceThreadId(entry.key),
            });
          });

          if (entries.length === 0) {
            return;
          }

          entries.forEach(({ entry }) => upsertOptimisticMetronomeRunEntry(entry));

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
          let conditionWorkflowRequest = null;
          const loadRunTraceWorkflow = () => {
            if (conditionWorkflowRequest) return conditionWorkflowRequest;
            conditionWorkflowRequest = fetchJsonWithTimeout(
              proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId),
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: authRequestHeaders,
              },
              6000
            ).then(({ response, data }) => {
              if (!response.ok) return null;
              const rawWorkflow = data?.data && typeof data.data === "object"
                ? data.data
                : data?.metronome && typeof data.metronome === "object"
                  ? data.metronome
                  : data?.workflow && typeof data.workflow === "object"
                    ? data.workflow
                    : data;
              return rawWorkflow && typeof rawWorkflow === "object"
                ? normalizeMetronomeWorkflow(rawWorkflow)
                : null;
            }).catch(() => null);
            return conditionWorkflowRequest;
          };
          const scheduleRunTraceReload = (run, failed) => {
            if (cancelled) return;
            const startedAt = Date.parse(String(run?.startedAt || run?.createdAt || ""));
            const elapsedMs = Number.isFinite(startedAt) ? Math.max(0, Date.now() - startedAt) : 0;
            const delayMs = failed
              ? 5000
              : document.visibilityState === "hidden"
                ? 10000
                : elapsedMs >= 60 * 60 * 1000
                  ? 5000
                  : elapsedMs >= 10 * 60 * 1000
                    ? 2500
                    : 1000;
            reloadTimer = setTimeout(loadRunTrace, delayMs);
          };
          const loadRunTrace = async () => {
            try {
              const [timelineResponse, conditionWorkflow] = await Promise.all([
                fetchJsonWithTimeout(
                  proxyBackendBase + "/metronomes/" + encodeURIComponent(workflowId) + "/runs/" + encodeURIComponent(runId) + "/timeline?view=compact",
                  { method: "GET", headers: authRequestHeaders },
                  12000
                ),
                loadRunTraceWorkflow(),
              ]);
              const { response, data } = timelineResponse;
              if (cancelled) return;
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load Metronome run.");
              }
              const nextRun = normalizeMetronomeRunTraceResponse(data, selection, conditionWorkflow);
              const nextStepKeys = getMetronomeRunTraceSteps(nextRun)
                .map((step, index) => getMetronomeRunTraceStepRenderKey(step, index))
                .filter(Boolean);
              const previousSeen = metronomeRunTraceSeenStepKeysRef.current;
              if (!previousSeen || previousSeen.key !== key || !previousSeen.hydrated) {
                metronomeRunTraceSeenStepKeysRef.current = {
                  key,
                  hydrated: true,
                  keys: new Set(nextStepKeys),
                };
                metronomeRunTraceAnimatedStepKeysRef.current = {
                  key,
                  keys: new Set(),
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
              const nextTraceThreads = collectMetronomeRunTraceChildThreads(nextRun, selection);
              if (nextTraceThreads.length) {
                setRealThreads((current) => mergeMetronomeChildThreadsIntoRealThreads(current, nextTraceThreads));
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
                    originThread: existing?.originThread || selection?.originThread || null,
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
            const normalizedRunId = String(detail.runId || "").trim();
            if (detail.mode === "run-overview") {
              const key = getSidebarMetronomeRunGroupKey({
                metronomeId: normalizedWorkflowId,
                runId: normalizedRunId,
              });
              if (!normalizedRunId || !key) {
                return;
              }
              const workflowName = String(detail.workflowName || "Metronome").trim() || "Metronome";
              const message = String(detail.userMessage || "").trim();
              openMetronomeRunTraceThread({
                kind: "metronome-run",
                key,
                metronomeId: normalizedWorkflowId,
                runId: normalizedRunId,
                workflowName,
                status: String(detail.status || "running").trim() || "running",
                input: message
                  ? { source: "thread_event", message }
                  : null,
                threads: [],
                latestThread: null,
                originThread: null,
              });
              return;
            }
            openMetronomePage({
              workflowId: normalizedWorkflowId,
              runId: normalizedRunId,
              mode: detail.mode === "run-detail" ? "run-detail" : detail.mode === "runs" ? "runs" : detail.mode === "code" ? "code" : "edit",
            });
          };
          window.addEventListener("playground:open-metronome-workflow", handleOpenMetronomeWorkflow);
          return () => {
            window.removeEventListener("playground:open-metronome-workflow", handleOpenMetronomeWorkflow);
          };
        }, []);

`;
