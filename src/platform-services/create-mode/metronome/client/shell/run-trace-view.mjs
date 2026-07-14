export const METRONOME_APP_RUN_TRACE_VIEW_SCRIPT = `
        function getMetronomeRunTraceThreadStepIcon(step) {
          const kind = getMetronomeRunTraceStepKind(step);
          if (kind === "trigger") return Zap;
          if (kind === "condition") return Split;
          if (kind === "firecrawl") return Flame;
          if (kind === "thread" || kind === "action") return Play;
          if (kind === "end") return Square;
          if (kind === "imagine") return Clapperboard;
          if (kind === "function") return FunctionSquare;
          if (kind === "database") return Database;
          if (kind === "ticket") return Bookmark;
          if (kind === "metronome") return Metronome;
          if (kind === "loop") return RefreshCw;
          if (kind === "note") return StickyNote;
          return Circle;
        }

        function getMetronomeRunTraceThreadStepTitle(step) {
          return String(
            step?.nodeName
            || step?.nodeLabel
            || step?.label
            || step?.title
            || step?.name
            || (String(step?.kind || "").trim() ? String(step.kind).slice(0, 1).toUpperCase() + String(step.kind).slice(1) : "")
            || "Workflow step"
          ).trim();
        }

        function getMetronomeRunTraceThreadDisplayTitle(step, thread) {
          const safeStep = getMetronomeRunTraceRecord(step);
          const safeThread = getMetronomeRunTraceRecord(thread);
          const stepOutput = getMetronomeRunTraceStepOutputRecord(safeStep);
          const outputThread = getMetronomeRunTraceRecord(stepOutput.thread || stepOutput.threadRecord || stepOutput.thread_record);
          return String(
            safeThread.title
            || safeThread.threadTitle
            || safeThread.thread_title
            || safeThread.name
            || safeStep.threadTitle
            || safeStep.thread_title
            || outputThread.title
            || outputThread.threadTitle
            || outputThread.thread_title
            || getMetronomeRunTraceThreadStepTitle(safeStep)
          ).trim();
        }

        function getMetronomeRunTraceStepInput(step) {
          if (step?.input !== null && typeof step?.input !== "undefined") return step.input;
          const output = step?.output && typeof step.output === "object" ? step.output : {};
          return output.input || output.inputs || output.context || output.inputSummary || "";
        }

        function getMetronomeRunTraceConditionBranchLabel(step) {
          const output = step?.output && typeof step.output === "object" ? step.output : {};
          return String(
            step?.branchLabel
              || output.branchLabel
              || output.branch?.label
              || output.branchName
              || output.selectedBranch
              || output.selectedBranchLabel
              || "Default"
          ).trim() || "Default";
        }

        function getMetronomeRunTraceConditionReason(step) {
          const output = step?.output && typeof step.output === "object" ? step.output : {};
          return String(
            step?.branchReason
              || output.branchReason
              || output.branch?.reason
              || output.reason
              || output.message
              || ""
          ).trim();
        }

        function renderMetronomeRunTraceThreadMarkdown(value, className = "tb-message-markdown tb-message-markdown-summary") {
          const text = normalizeMetronomeRunMarkdownText(extractMetronomeReadableOutputText(value) || value);
          if (!text) return null;
          return React.createElement(PlaygroundTaskDescriptionMarkdown, {
            content: text,
            className,
          });
        }

        function parseMetronomeRunJsonDocumentValue(value) {
          if (value === null || typeof value === "undefined") return null;
          if (typeof value === "object") {
            return Array.isArray(value) || isPlaygroundDatabasePlainObject(value) ? value : null;
          }
          if (typeof value !== "string") return null;
          const trimmed = value.trim();
          if (!trimmed) return null;
          let candidate = trimmed;
          if (trimmed.startsWith("\\x60\\x60\\x60")) {
            const lines = trimmed.split(/\\n/);
            const firstLine = String(lines[0] || "").trim().toLowerCase();
            const lastLine = String(lines[lines.length - 1] || "").trim();
            if ((firstLine === "\\x60\\x60\\x60" || firstLine === "\\x60\\x60\\x60json") && lastLine === "\\x60\\x60\\x60") {
              candidate = lines.slice(1, -1).join("\\n").trim();
            }
          }
          if (!candidate.startsWith("{") && !candidate.startsWith("[")) return null;
          try {
            const parsed = JSON.parse(candidate);
            return Array.isArray(parsed) || isPlaygroundDatabasePlainObject(parsed) ? parsed : null;
          } catch {
            return null;
          }
        }

        function findMetronomeRunBalancedJsonEnd(value, startIndex) {
          const opener = String(value || "").charAt(startIndex);
          if (opener !== "{" && opener !== "[") return null;
          const stack = [opener === "{" ? "}" : "]"];
          let inString = false;
          let escaped = false;

          for (let index = startIndex + 1; index < value.length; index += 1) {
            const char = value.charAt(index);
            if (inString) {
              if (escaped) {
                escaped = false;
              } else if (char === "\\\\") {
                escaped = true;
              } else if (char === "\\\"") {
                inString = false;
              }
              continue;
            }

            if (char === "\\\"") {
              inString = true;
              continue;
            }

            if (char === "{" || char === "[") {
              stack.push(char === "{" ? "}" : "]");
              continue;
            }

            if (char === "}" || char === "]") {
              if (stack[stack.length - 1] !== char) return null;
              stack.pop();
              if (!stack.length) return index + 1;
            }
          }

          return null;
        }

        function formatMetronomeRunInlineJsonTitleLabel(value) {
          return String(value || "")
            .replace(/[_-]+/g, " ")
            .replace(/\\s+/g, " ")
            .trim()
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
        }

        function inferMetronomeRunInlineJsonTitle(prefix, fallbackTitle) {
          const tail = String(prefix || "").slice(-96);
          const match = tail.match(/([A-Za-z][A-Za-z0-9 _/-]{0,40})\\s*:\\s*$/);
          const label = match?.[1]?.trim();
          if (!label) return fallbackTitle;
          return formatMetronomeRunInlineJsonTitleLabel(label) || fallbackTitle;
        }

        function splitMetronomeRunInlineJsonContent(value, title = "JSON") {
          const normalizedContent = normalizeMetronomeRunMarkdownText(extractMetronomeReadableOutputText(value) || value);
          const text = String(normalizedContent || "").trim();
          if (!text) return [];
          const segments = [];
          let cursor = 0;
          let jsonIndex = 0;

          for (let index = 0; index < text.length; index += 1) {
            const char = text.charAt(index);
            if (char !== "{" && char !== "[") continue;
            const endIndex = findMetronomeRunBalancedJsonEnd(text, index);
            if (!endIndex) continue;
            const candidate = text.slice(index, endIndex);
            const parsed = parseMetronomeRunJsonDocumentValue(candidate);
            if (!parsed) continue;

            const before = text.slice(cursor, index).trim();
            if (before) {
              segments.push({
                kind: "markdown",
                content: before,
                id: "markdown-" + segments.length,
              });
            }
            segments.push({
              kind: "json",
              value: parsed,
              title: inferMetronomeRunInlineJsonTitle(text.slice(cursor, index), title),
              id: "json-" + jsonIndex,
            });
            jsonIndex += 1;
            cursor = endIndex;
            index = endIndex - 1;
          }

          if (!segments.length) return [];
          const after = text.slice(cursor).trim();
          if (after) {
            segments.push({
              kind: "markdown",
              content: after,
              id: "markdown-" + segments.length,
            });
          }
          return segments;
        }

        function formatMetronomeRunJsonDocumentRaw(value) {
          try {
            return JSON.stringify(value, null, 2);
          } catch {
            return String(value || "");
          }
        }

        function formatMetronomeRunJsonPreviewValue(value) {
          if (value === null) return "null";
          if (typeof value === "boolean" || typeof value === "number") return String(value);
          if (typeof value === "string") return value;
          return formatPlaygroundDatabaseFieldPreview(value);
        }

        function renderMetronomeRunJsonPreviewRows(containerValue, parentPath = [], depth = 0) {
          const entries = Array.isArray(containerValue)
            ? containerValue.map((item, index) => [String(index), item])
            : Object.entries(isPlaygroundDatabasePlainObject(containerValue) ? containerValue : {});

          if (!entries.length) {
            return React.createElement("div", {
              className: "playground-database-browser-empty-fields",
              style: { marginLeft: depth > 0 ? String(depth * 18) + "px" : undefined },
            }, "No fields.");
          }

          return React.createElement("div", { className: "playground-database-browser-field-tree" },
            entries.map(([fieldKey, fieldValue]) => {
              const fieldPath = [...parentPath, fieldKey];
              const fieldType = getPlaygroundDatabaseFieldType(fieldValue);
              const expandable = fieldType === "map" || fieldType === "array";
              const pathKey = getPlaygroundDatabasePathKey(fieldPath);
              return React.createElement("div", { key: pathKey, className: "playground-database-browser-field-node" },
                React.createElement("div", {
                    className: "playground-database-browser-field-row",
                    style: { paddingLeft: String(depth * 18) + "px" },
                  },
                  React.createElement("div", { className: "playground-database-browser-field-main" },
                    React.createElement("span", { className: "playground-database-browser-field-toggle-placeholder" }),
                    React.createElement("span", { className: "playground-database-browser-field-key" }, fieldKey),
                    React.createElement("span", { className: "playground-database-browser-field-separator" }, ":"),
                    expandable
                      ? React.createElement("div", { className: "playground-database-browser-field-group" },
                          React.createElement("span", { className: "playground-database-browser-field-type-pill" }, fieldType === "map" ? "Object" : "Array"),
                          React.createElement("span", { className: "playground-database-browser-field-preview" }, formatPlaygroundDatabaseFieldPreview(fieldValue))
                        )
                      : React.createElement("div", { className: "playground-database-browser-field-value-shell" },
                          React.createElement("span", { className: "playground-database-browser-value-static" }, formatMetronomeRunJsonPreviewValue(fieldValue))
                        )
                  )
                ),
                expandable
                  ? React.createElement("div", { className: "playground-database-browser-field-children" },
                      renderMetronomeRunJsonPreviewRows(fieldValue, fieldPath, depth + 1)
                    )
                  : null
              );
            })
          );
        }

        function renderMetronomeRunJsonDocument(value, options = {}) {
          const parsed = parseMetronomeRunJsonDocumentValue(value);
          if (!parsed) return null;
          const documentKey = String(options.key || "metronome-json").trim() || "metronome-json";
          const title = String(options.title || "JSON").trim() || "JSON";
          const viewMode = metronomeRunJsonViewModeByKey[documentKey] === "json" ? "json" : "preview";
          const rawJson = formatMetronomeRunJsonDocumentRaw(parsed);
          const MetronomeRunJsonEditorComponent = metronomeRunJsonEditorModule?.default || null;
          const switchViewMode = (nextMode) => {
            const normalizedMode = nextMode === "json" ? "json" : "preview";
            setMetronomeRunJsonViewModeByKey((current) => ({
              ...current,
              [documentKey]: normalizedMode,
            }));
          };
          return React.createElement("div", { className: "playground-metronome-run-json-document" },
            React.createElement("div", { className: "playground-metronome-run-json-header" },
              React.createElement("div", { className: "playground-metronome-run-json-title" },
                React.createElement(Braces, { width: 14, height: 14, strokeWidth: 1.9 }),
                React.createElement("span", null, title)
              ),
              React.createElement("div", { className: "content-mode-switch playground-agents-list-switch playground-database-browser-mode-switch playground-metronome-run-json-mode-switch" },
                React.createElement("button", {
                  type: "button",
                  className: "content-mode-button" + (viewMode === "preview" ? " is-active" : ""),
                  onClick: () => switchViewMode("preview"),
                }, "Preview"),
                React.createElement("button", {
                  type: "button",
                  className: "content-mode-button" + (viewMode === "json" ? " is-active" : ""),
                  onClick: () => switchViewMode("json"),
                }, "JSON")
              )
            ),
            React.createElement("div", { className: "playground-metronome-run-json-body" },
              viewMode === "json"
                ? React.createElement("div", { className: "playground-metronome-run-json-editor-shell playground-code-preview-editor-shell" },
                    MetronomeRunJsonEditorComponent
                      ? React.createElement(MetronomeRunJsonEditorComponent, {
                          path: "metronome-run:" + documentKey.replace(/[^a-z0-9_.:-]+/gi, "_") + ".json",
                          height: "100%",
                          language: "json",
                          theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                          value: rawJson,
                          beforeMount: ensurePlaygroundCodeEditorTheme,
                          options: {
                            automaticLayout: true,
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            fontSize: 12,
                            lineHeight: 20,
                            tabSize: 2,
                            insertSpaces: true,
                            renderLineHighlight: "none",
                            lineNumbersMinChars: 3,
                            overviewRulerBorder: false,
                            hideCursorInOverviewRuler: true,
                            wordWrap: "on",
                            padding: {
                              top: 12,
                              bottom: 12,
                            },
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          },
                        })
                      : !metronomeRunJsonEditorModuleError
                        ? React.createElement("div", { className: "playground-code-preview-state" },
                            React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                            React.createElement("span", null, "Loading editor...")
                          )
                        : React.createElement("pre", { className: "playground-metronome-run-json-raw" }, rawJson)
                  )
                : renderMetronomeRunJsonPreviewRows(parsed, [], 0)
            )
          );
        }

        function renderMetronomeRunTraceThreadValue(value) {
          const jsonDocument = renderMetronomeRunJsonDocument(value, {
            key: "metronome-output:" + String(metronomeRunTraceSelection?.key || "") + ":" + String(formatMetronomeRunValue(value)).slice(0, 80),
            title: "JSON",
          });
          if (jsonDocument) return jsonDocument;
          const inlineJsonSegments = splitMetronomeRunInlineJsonContent(value, "JSON");
          if (inlineJsonSegments.some((segment) => segment.kind === "json")) {
            return React.createElement("div", { className: "playground-metronome-run-json-content" },
              inlineJsonSegments.map((segment, index) => (
                segment.kind === "json"
                  ? React.createElement(React.Fragment, { key: segment.id },
                      renderMetronomeRunJsonDocument(segment.value, {
                        key: "metronome-output:" + String(metronomeRunTraceSelection?.key || "") + ":" + segment.id + ":" + index,
                        title: segment.title || "JSON",
                      })
                    )
                  : React.createElement(PlaygroundTaskDescriptionMarkdown, {
                      key: segment.id,
                      content: segment.content,
                      className: "playground-metronome-run-output-markdown tb-message-markdown",
                    })
              ))
            );
          }
          const markdown = renderMetronomeRunTraceThreadMarkdown(value, "playground-metronome-run-output-markdown tb-message-markdown");
          if (markdown) return markdown;
          const formatted = formatMetronomeRunValue(value);
          if (!formatted) return null;
          return React.createElement("pre", { className: "playground-metronome-run-output-block" }, formatted);
        }

        function isMetronomeRunTraceEmailTrigger(run) {
          const input = run?.input && typeof run.input === "object" ? run.input : {};
          const output = run?.output && typeof run.output === "object" ? run.output : {};
          const triggerType = String(run?.triggerType || input.triggerType || input.type || output.triggerType || "").toLowerCase();
          return triggerType === "email" || triggerType === "email_received" || Boolean(input.email || input.from || input.sender || input.subject);
        }

        function renderMetronomeRunTraceUserPrompt(run) {
          const input = run?.input && typeof run.input === "object" ? run.input : {};
          const attachments = getMetronomeRunTraceAttachments(run, metronomeRunTraceSelection);
          const attachmentList = attachments.length
            ? React.createElement("div", { className: "runner-attachments runner-attachments-turn" },
                attachments.map((attachment) => renderMetronomeRunTraceAttachmentChip(attachment)).filter(Boolean)
              )
            : null;
          let promptContent = null;
          if (isMetronomeRunTraceEmailTrigger(run)) {
            const email = input.email && typeof input.email === "object" ? input.email : {};
            const from = String(input.from || input.sender || email.from || email.sender || "").trim();
            const subject = String(input.subject || email.subject || "Inbound email").trim();
            const body = String(input.body || input.text || input.message || email.body || email.text || getMetronomeRunPrompt(run) || "").trim();
            promptContent = React.createElement("div", { className: "task-prompt-in-session-context is-email-origin playground-metronome-run-thread-email-message" },
              from ? React.createElement("div", { className: "playground-metronome-run-email-from" }, "From ", from) : null,
              React.createElement("div", { className: "playground-metronome-run-email-subject" }, subject),
              body ? React.createElement("div", { className: "playground-metronome-run-email-body" }, body) : null
            );
          } else {
            promptContent = React.createElement("div", { className: "task-prompt-in-session-context" },
              renderMetronomeRunTraceThreadMarkdown(getMetronomeRunPrompt(run), "tb-message-markdown tb-message-markdown-user")
            );
          }
          return React.createElement(React.Fragment, null, attachmentList, promptContent);
        }

        function getMetronomeRunTraceSteps(run) {
          const output = run?.output && typeof run.output === "object" ? run.output : {};
          const steps = Array.isArray(output.steps) ? output.steps : [];
          if (steps.length) {
            return steps.filter((step) => !isMetronomeRunTraceStarterStep(step));
          }
          const threads = Array.isArray(output.threads) ? output.threads : [];
          return threads.map((thread, index) => ({
            id: "thread:" + (thread.id || index),
            nodeId: thread.nodeId || "",
            nodeName: thread.nodeName || thread.title || "Thread",
            kind: "thread",
            threadId: thread.id || thread.threadId || thread.thread_id || "",
            agentName: thread.agentName || thread.agent_name || "",
            computerName: thread.computerName || thread.computer_name || thread.environmentName || thread.environment_name || "",
            environmentName: thread.environmentName || thread.environment_name || "",
            output: thread.output || thread.summary || thread.result || thread.data || "",
            summary: thread.summary || "",
          })).filter((step) => !isMetronomeRunTraceStarterStep(step));
        }

        function getMetronomeRunTraceStepRenderKey(step, index = 0) {
          const safeStep = getMetronomeRunTraceRecord(step);
          const key = String(
            safeStep.id
            || safeStep.stepId
            || safeStep.step_id
            || [
              safeStep.nodeId || safeStep.node_id || "",
              safeStep.index || index,
              safeStep.startedAt || safeStep.started_at || "",
            ].join(":")
          ).trim();
          return key || "metronome-step:" + index;
        }

        function getMetronomeRunTraceEnterAnimationStyle(delayMs = 0) {
          return {
            animationName: "tb-log-slide-in",
            animationDuration: "220ms",
            animationTimingFunction: "ease-out",
            animationFillMode: "both",
            animationDelay: String(Math.max(0, delayMs || 0)) + "ms",
          };
        }

        function isMetronomeRunTraceStarterStep(step) {
          const safeStep = getMetronomeRunTraceRecord(step);
          const output = getMetronomeRunTraceStepOutputRecord(safeStep);
          const candidates = [
            safeStep.summary,
            safeStep.message,
            safeStep.statusMessage,
            safeStep.status_message,
            output.summary,
            output.message,
            output.statusMessage,
            output.status_message,
            output.text,
          ];
          return candidates.some((candidate) => {
            const normalized = normalizeMetronomeRunTraceComparableText(candidate).toLowerCase();
            return normalized === "metronome run started."
              || normalized === "metronome run started"
              || normalized === "metronome run queued."
              || normalized === "metronome run queued";
          });
        }

        function buildMetronomeRunTraceChildThreadRecord(step, thread, run) {
          const threadId = getMetronomeRunTraceStepThreadId(step, thread);
          if (!threadId) return null;
          const safeThread = getMetronomeRunTraceRecord(thread);
          const safeStep = getMetronomeRunTraceRecord(step);
          const output = getMetronomeRunTraceStepOutputRecord(safeStep);
          const outputThread = getMetronomeRunTraceRecord(output.thread || output.threadRecord || output.thread_record);
          const runtimeMeta = getMetronomeRunTraceThreadRuntimeMeta(safeStep, safeThread, {
            threads: realThreadsRef.current || [],
            agents: runtimeAgentsForComposer || [],
            environments: runtimeEnvironments || [],
          });
          const selection = metronomeRunTraceSelectionRef.current || metronomeRunTraceSelection || {};
          const now = new Date().toISOString();
          const stepStatus = String(safeStep.status || outputThread.status || output.status || "").trim();
          const nextStatus = isActiveMetronomeRunStatus(stepStatus)
            ? "running"
            : stepStatus === "failed"
              ? "failed"
              : "completed";
          const title = String(
            safeThread.title
            || outputThread.title
            || getMetronomeRunTraceThreadDisplayTitle(safeStep, safeThread)
            || "Metronome thread"
          ).trim();
          const metadata = outputThread.metadata && typeof outputThread.metadata === "object" && !Array.isArray(outputThread.metadata)
            ? outputThread.metadata
            : safeThread.metadata && typeof safeThread.metadata === "object" && !Array.isArray(safeThread.metadata)
              ? safeThread.metadata
              : {};
          return normalizeThreadItem({
            ...outputThread,
            ...safeThread,
            id: threadId,
            title,
            status: nextStatus,
            agentId: outputThread.agentId || outputThread.agent_id || safeThread.agentId || safeThread.agent_id || safeStep.agentId || safeStep.agent_id || "",
            environmentId: outputThread.environmentId || outputThread.environment_id || outputThread.computerId || outputThread.computer_id || safeThread.environmentId || safeThread.environment_id || safeStep.environmentId || safeStep.environment_id || "",
            environmentName: outputThread.environmentName || outputThread.environment_name || outputThread.computerName || outputThread.computer_name || safeThread.environmentName || safeThread.environment_name || runtimeMeta?.computerName || "",
            createdAt: outputThread.createdAt || outputThread.created_at || safeThread.createdAt || safeThread.created_at || safeStep.startedAt || safeStep.started_at || now,
            updatedAt: outputThread.updatedAt || outputThread.updated_at || safeThread.updatedAt || safeThread.updated_at || safeStep.completedAt || safeStep.completed_at || now,
            metadata: {
              ...metadata,
              metronome: {
                ...(metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
                  ? metadata.metronome
                  : {}),
                metronomeId: String(selection.workflowId || run?.metronomeId || run?.workflowId || "").trim(),
                metronomeName: String(selection.workflowName || run?.workflowName || run?.metronomeName || "Metronome").trim() || "Metronome",
                runId: String(selection.runId || run?.id || run?.runId || "").trim(),
                nodeId: String(safeStep.nodeId || safeStep.node_id || "").trim(),
                nodeLabel: String(safeStep.label || safeStep.nodeName || safeStep.nodeLabel || title || "").trim(),
                nodeName: String(safeStep.label || safeStep.nodeName || safeStep.nodeLabel || title || "").trim(),
                status: stepStatus || nextStatus,
              },
              metronomeWorkflow: {
                ...(metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
                  ? metadata.metronomeWorkflow
                  : {}),
                metronomeId: String(selection.workflowId || run?.metronomeId || run?.workflowId || "").trim(),
                workflowId: String(selection.workflowId || run?.metronomeId || run?.workflowId || "").trim(),
                metronomeName: String(selection.workflowName || run?.workflowName || run?.metronomeName || "Metronome").trim() || "Metronome",
                workflowName: String(selection.workflowName || run?.workflowName || run?.metronomeName || "Metronome").trim() || "Metronome",
                runId: String(selection.runId || run?.id || run?.runId || "").trim(),
                workflowRunId: String(selection.runId || run?.id || run?.runId || "").trim(),
                nodeId: String(safeStep.nodeId || safeStep.node_id || "").trim(),
                nodeLabel: String(safeStep.label || safeStep.nodeName || safeStep.nodeLabel || title || "").trim(),
                nodeName: String(safeStep.label || safeStep.nodeName || safeStep.nodeLabel || title || "").trim(),
                status: stepStatus || nextStatus,
                isOriginThread: false,
              },
            },
          });
        }

        function collectMetronomeRunTraceChildThreads(run) {
          const output = run?.output && typeof run.output === "object" ? run.output : {};
          const runThreads = Array.isArray(output.threads) ? output.threads : [];
          return getMetronomeRunTraceSteps(run)
            .map((step) => buildMetronomeRunTraceChildThreadRecord(step, findMetronomeRunThreadForStep(step, runThreads), run))
            .filter(Boolean);
        }

        function handleMetronomeRunTraceChildThreadSelect(threadId, thread, step, run) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) return;
          const threadRecord = buildMetronomeRunTraceChildThreadRecord(step, thread, run);
          if (threadRecord) {
            upsertRealThreadRecord(threadRecord, { status: threadRecord.status || "running" });
          }
          handleThreadSelect(normalizedThreadId);
        }

        function renderMetronomeRunTraceStepLog(step, run) {
          const output = run?.output && typeof run.output === "object" ? run.output : {};
          const threads = Array.isArray(output.threads) ? output.threads : [];
          const thread = findMetronomeRunThreadForStep(step, threads);
          const kind = getMetronomeRunTraceStepKind(step);
          const isThreadStep = isMetronomeRunTraceThreadStep(step, thread);
          const threadId = getMetronomeRunTraceStepThreadId(step, thread);
          const runtimeMeta = isThreadStep
            ? getMetronomeRunTraceThreadRuntimeMeta(step, thread, {
                threads: realThreadsRef.current || [],
                agents: runtimeAgentsForComposer || [],
                environments: runtimeEnvironments || [],
              })
            : null;
          const StepIcon = getMetronomeRunTraceThreadStepIcon(step);
          const title = isThreadStep
            ? getMetronomeRunTraceThreadDisplayTitle(step, thread)
            : getMetronomeRunTraceThreadStepTitle(step);
          const readableOutputText = kind === "trigger" || kind === "condition"
            ? ""
            : isThreadStep
              ? extractMetronomeThreadReadableOutputText(step, thread)
              : extractMetronomeReadableOutputText(step?.output || step?.result || step?.data);
          const summary = String(
            kind === "condition"
              ? ""
              : isThreadStep
                ? (readableOutputText ? "" : (isActiveMetronomeRunStatus(step?.status) ? "Thread is running..." : thread?.prompt || step?.summary || step?.status || ""))
                : step?.summary || step?.status || ""
          ).trim();
          const shouldRenderOutputText = Boolean(
            readableOutputText
            && (
              isThreadStep
              || normalizeMetronomeRunTraceComparableText(readableOutputText) !== normalizeMetronomeRunTraceComparableText(summary)
            )
          );
          const conditionInput = kind === "condition" ? getMetronomeRunTraceStepInput(step) : null;
          const conditionInputText = kind === "condition" ? formatMetronomeRunValue(conditionInput) : "";
          const conditionBranchLabel = kind === "condition" ? getMetronomeRunTraceConditionBranchLabel(step) : "";
          const conditionReason = kind === "condition" ? getMetronomeRunTraceConditionReason(step) : "";
          const runtimeMetaContent = isThreadStep
            ? renderMetronomeRunTraceThreadRuntimeMeta(runtimeMeta, { showSeparator: false })
            : null;
          const stepIconContent = isThreadStep
            ? renderMetronomeRunTraceThreadStepAvatar(runtimeMeta)
            : null;
          return React.createElement("div", { className: "playground-metronome-run-trace-step playground-metronome-run-thread-log-step" },
            React.createElement("div", { className: "playground-metronome-run-trace-heading" },
              React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                stepIconContent || React.createElement(StepIcon, { width: 13, height: 13, strokeWidth: 1.9 })
              ),
              React.createElement("div", { className: "playground-metronome-run-trace-title-group" },
                React.createElement("div", { className: "playground-metronome-run-thread-title-line" },
                  React.createElement("div", { className: "playground-metronome-run-trace-title playground-metronome-run-thread-title-text" }, title),
                  threadId
                    ? React.createElement("div", { className: "playground-metronome-run-thread-meta-row" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-metronome-run-thread-link",
                          onClick: () => handleMetronomeRunTraceChildThreadSelect(threadId, thread, step, run),
                        }, "Show thread")
                      )
                    : null
                ),
                runtimeMetaContent
                  ? React.createElement("div", { className: "playground-metronome-run-thread-meta-row" },
                      runtimeMetaContent
                    )
                  : null,
              )
            ),
            summary
              ? React.createElement("div", { className: "playground-metronome-run-trace-summary" },
                  renderMetronomeRunTraceThreadValue(summary) || summary
                )
              : null,
            kind === "condition" && conditionInputText
              ? React.createElement("div", { className: "playground-metronome-run-trace-field" },
                  React.createElement("div", { className: "playground-metronome-run-trace-field-label" }, "Input"),
                  renderMetronomeRunTraceThreadValue(conditionInput)
                )
              : null,
            kind === "condition"
              ? React.createElement("div", { className: "playground-metronome-run-trace-field" },
                  React.createElement("div", { className: "playground-metronome-run-trace-field-label" }, "Branch"),
                  React.createElement("div", { className: "playground-metronome-run-branch-result" },
                    React.createElement("span", { className: "playground-metronome-run-branch-chip" }, conditionBranchLabel || "Default"),
                    conditionReason ? React.createElement("span", { className: "playground-metronome-run-branch-reason" }, conditionReason) : null
                  )
                )
              : null,
            shouldRenderOutputText
              ? renderMetronomeRunTraceThreadValue(readableOutputText)
              : null
          );
        }

        function buildMetronomeRunTraceContinuationPrompt(run, selection) {
          const steps = getMetronomeRunTraceSteps(run);
          const prompt = getMetronomeRunPrompt(run);
          const summary = getMetronomeRunSummaryText(run);
          const workflowName = String(selection?.workflowName || "Metronome").trim() || "Metronome";
          const workflowId = String(selection?.workflowId || run?.metronomeId || run?.workflowId || "").trim();
          const runId = String(selection?.runId || run?.id || run?.runId || "").trim();
          const runThreads = Array.isArray(run?.output?.threads) ? run.output.threads : [];
          const stepSummaries = steps.map((step, index) => {
            const kind = String(step?.kind || "step").trim() || "step";
            const title = getMetronomeRunTraceThreadStepTitle(step);
            const thread = findMetronomeRunThreadForStep(step, runThreads);
            const outputText = extractMetronomeReadableOutputText(step?.output || step?.result || step?.data || step?.summary || "");
            return [
              (index + 1) + ". " + title + " (" + kind + ")",
              thread?.id ? "Thread ID: " + thread.id : "",
              outputText ? "Output: " + outputText : "",
            ].filter(Boolean).join("\\n");
          }).filter(Boolean);
          return [
            "You are continuing from a Metronome workflow run.",
            "Use the workflow context below as prior work. Do not rerun the workflow unless the user explicitly asks you to. Answer the user's next message directly and continue from this run state.",
            "Workflow: " + workflowName,
            workflowId ? "Workflow ID: " + workflowId : "",
            runId ? "Run ID: " + runId : "",
            prompt ? "Original trigger or user message:\\n" + prompt : "",
            summary ? "Run summary:\\n" + summary : "",
            stepSummaries.length ? "Node trace:\\n" + stepSummaries.join("\\n\\n") : "",
          ].filter(Boolean).join("\\n\\n");
        }

        function renderMetronomeRunTraceThreadContent() {
          const selection = metronomeRunTraceSelection;
          const run = metronomeRunTraceState.run || buildFallbackMetronomeRunTraceRun(selection || {});
          const steps = getMetronomeRunTraceSteps(run);
          const rawSummaryText = getMetronomeRunSummaryText(run);
          const status = metronomeRunTraceState.status;
          const isRunWorking = status === "loading" || isActiveMetronomeRunStatus(run?.status || selection?.status);
          const summaryText = isGenericMetronomeRunSummaryText(rawSummaryText)
            ? ""
            : rawSummaryText;
          const shouldShowNoStepsMessage = !isRunWorking && !metronomeRunTraceState.error && !steps.length;
          const isExpanded = metronomeRunTraceWorkExpanded;
          return React.createElement("div", { className: "playground-metronome-run-thread-list" },
              React.createElement("div", { className: "tb-turn tb-turn-user playground-metronome-run-thread-turn" },
                React.createElement("div", { className: "tb-user-turn-shell tb-thread-history-anchor playground-metronome-run-thread-user-shell" },
                  renderMetronomeRunTraceUserPrompt(run)
                ),
                React.createElement("button", {
                  type: "button",
                  className: "tb-work-header playground-metronome-run-thread-work-header",
                  "aria-expanded": isExpanded ? "true" : "false",
                  onClick: () => setMetronomeRunTraceWorkExpanded((current) => !current),
                },
                  React.createElement("span", { className: "tb-work-label" },
                    React.createElement("span", null, status === "loading" ? "Loading Metronome run" : "Metronome Working Logs"),
                    isExpanded
                      ? React.createElement(ChevronUp, { className: "tb-chevron", strokeWidth: 1.8 })
                      : React.createElement(ChevronDown, { className: "tb-chevron", strokeWidth: 1.8 })
                  ),
                  React.createElement("div", { className: "tb-turn-environment-pill" },
                    React.createElement(Metronome, { className: "tb-turn-environment-icon", strokeWidth: 1.6 }),
                    React.createElement("span", { className: "tb-turn-environment-label" }, selection?.workflowName || "Metronome")
                  )
                ),
                React.createElement("div", {
                  className: ("tb-work-collapse playground-metronome-run-thread-work " + (isExpanded ? "is-expanded" : "collapsed")).trim(),
                },
                  React.createElement("div", { className: "tb-work-collapse-inner" },
                    React.createElement("div", { className: "agent-steps-container" },
                      metronomeRunTraceState.error
                        ? React.createElement("div", { className: "agent-step-item" },
                            React.createElement("div", { className: "agent-step-content" },
                              React.createElement("div", { className: "playground-metronome-run-sidebar-copy" }, metronomeRunTraceState.error)
                            )
                          )
                        : null,
                      steps.length
                        ? steps.map((step, index) => {
                          const stepKey = getMetronomeRunTraceStepRenderKey(step, index);
                          const animatedKeys = metronomeRunTraceAnimatedStepKeysRef.current;
                          const shouldAnimateStep = animatedKeys?.key === String(selection?.key || "").trim()
                            && animatedKeys.keys instanceof Set
                            && animatedKeys.keys.has(stepKey);
                          return React.createElement("div", {
                            key: stepKey,
                            className: "agent-step-item",
                            style: shouldAnimateStep ? getMetronomeRunTraceEnterAnimationStyle(80 + index * 45) : undefined,
                          },
                            React.createElement("div", { className: "agent-step-content" },
                              renderMetronomeRunTraceStepLog(step, run)
                            )
                          );
                        })
                        : shouldShowNoStepsMessage
                          ? React.createElement("div", { className: "agent-step-item" },
                            React.createElement("div", { className: "agent-step-content" },
                              React.createElement("div", { className: "playground-metronome-run-sidebar-copy" },
                                "No workflow steps were recorded."
                              )
                            )
                          )
                          : null
                    )
                  )
                ),
                summaryText
                  ? React.createElement("div", { className: "tb-turn-summary tb-thread-history-anchor is-latest-summary playground-metronome-run-thread-summary" },
                      React.createElement("div", { className: "tb-turn-response" },
                        renderMetronomeRunJsonDocument(summaryText, {
                          key: "metronome-summary:" + String(selection?.key || run?.id || ""),
                          title: "JSON",
                        }) || renderMetronomeRunTraceThreadMarkdown(summaryText, "tb-message-markdown tb-message-markdown-summary")
                      )
                    )
                  : null,
                isRunWorking
                  ? React.createElement("div", { className: "tb-btw-turn-pending tb-thinking-status playground-metronome-run-thread-working" },
                      React.createElement("span", { className: "tb-btw-turn-pending-loader", "aria-hidden": "true" },
                        renderMetronomeRunWorkingDotLoader()
                      ),
                      React.createElement("span", null, "Working...")
                    )
                  : null
              )
          );
        }

        function renderMetronomeRunTraceThreadSurface() {
          const selection = metronomeRunTraceSelection;
          const run = metronomeRunTraceState.run || buildFallbackMetronomeRunTraceRun(selection || {});
          return React.createElement(RunnerChat, {
            key: "metronome-run-trace:" + String(selection?.key || "") + ":" + runnerRenderKey,
            className: "playground-thread-runner playground-metronome-run-thread-surface",
            backendUrl: proxyBackendBase,
            apiKey: effectiveApiKey,
            fetchCustomSkills: computerAgentsMode ? handleFetchCustomSkills : undefined,
            speechToTextUrl: speechToTextUrl || undefined,
            requestHeaders,
            appId: "runner-web-sdk-demo",
            inputMode: computerAgentsMode ? "computer-agents" : "minimal",
            computerAgents: computerAgentsMode ? {
              ...demoComputerAgents,
              projects: {
                items: runnerWorkspaceProjects,
                selectedProjectId: latestInteractedProjectId || "",
                onProjectChange: (nextProjectId) => {
                  const normalizedProjectId = String(nextProjectId || "").trim();
                  setLatestInteractedProjectId(normalizedProjectId);
                },
              },
            } : undefined,
            environments: computerAgentsMode ? runtimeEnvironments.map((environment) => ({
              ...environment,
              ...(resolvedEnvironmentId && environment.id === resolvedEnvironmentId ? { isDefault: true } : {})
            })) : undefined,
            agents: computerAgentsMode ? runtimeAgentsForComposer.map((agent) => (
              buildPlaygroundRunnerAgentOption(agent, resolvedComposerAgentId && agent.id === resolvedComposerAgentId ? { isDefault: true } : {})
            )) : undefined,
            isAgentSelectionBlocked: computerAgentsMode ? isComposerAgentSelectionBlocked : undefined,
            onBlockedAgentSelect: computerAgentsMode ? handleBlockedComposerAgentSelect : undefined,
            skills: computerAgentsMode ? demoSkills : undefined,
            enabledSkillIds: computerAgentsMode ? runnerEnabledSkillIds : undefined,
            onSkillsChange: computerAgentsMode ? setRunnerEnabledSkillIds : undefined,
            skillDefaults: getDemoImageGenerationSkillDefaults(),
            environmentId: resolvedEnvironmentId || undefined,
            agentId: resolvedComposerAgentId || undefined,
            autoFocusComposer: true,
            keepFocusOnSubmit: true,
            showUsageInStatus: false,
            placeholder: "Continue this workflow",
            hiddenSystemPrompt: buildMetronomeRunTraceContinuationPrompt(run, selection || {}),
            emptyState: renderMetronomeRunTraceThreadContent(),
            onOpenPluginsOverview: () => {
              setSelectedPluginId("");
              openToolsView("plugins");
            },
            onOpenPlansBudget: () => {
              setSidebarWorkspaceMode("configure");
              setActivePage("settings");
              setSettingsSection("costs-plans");
            },
            onThreadIdChange: (threadId) => {
              const normalizedThreadId = String(threadId || "").trim();
              if (!normalizedThreadId) {
                return;
              }
              setMetronomeRunTraceSelection(null);
              setActivePage("thread");
              setCurrentThreadId(normalizedThreadId);
              setPendingThreadRunRequest((current) => (
                current && current.threadId === normalizedThreadId ? current : null
              ));
              void refreshThreads();
            },
            onThreadTitleChange: (threadId, nextTitle) => {
              upsertRealThreadTitle(threadId, nextTitle);
              void refreshThreads();
            },
            onRunStart: (threadId) => {
              const normalizedThreadId = String(threadId || "").trim();
              if (!normalizedThreadId) {
                return;
              }
              setMetronomeRunTraceSelection(null);
              setActivePage("thread");
              setCurrentThreadId(normalizedThreadId);
              updateRealThreadStatus(normalizedThreadId, "running");
              void refreshThreads();
              void loadThreadGroundTruthStatus(normalizedThreadId);
            },
            onThreadStatusChange: (threadId, nextStatus) => {
              const normalizedThreadId = String(threadId || "").trim();
              const normalizedStatus = String(nextStatus || "").trim();
              if (!normalizedThreadId || !normalizedStatus) {
                return;
              }
              updateRealThreadStatus(normalizedThreadId, normalizedStatus);
              if (normalizedStatus === "permission_asked" || normalizedStatus === "running") {
                void refreshThreads(undefined, normalizedThreadId, { silent: true });
              }
            },
            onRunFinish: (_result, threadId) => {
              const normalizedThreadId = String(threadId || "").trim();
              if (!normalizedThreadId) {
                return;
              }
              setActivePage("thread");
              setCurrentThreadId(normalizedThreadId);
              void loadThreadGroundTruthStatus(normalizedThreadId);
              void refreshThreads();
            },
            onRunCancel: (threadId) => {
              const normalizedThreadId = String(threadId || "").trim();
              if (!normalizedThreadId) {
                return;
              }
              setActivePage("thread");
              setCurrentThreadId(normalizedThreadId);
              updateRealThreadStatus(normalizedThreadId, "cancelled");
              void loadThreadGroundTruthStatus(normalizedThreadId);
              void refreshThreads(undefined, normalizedThreadId);
            },
            onRunError: (_error, threadId) => {
              const normalizedThreadId = String(threadId || "").trim();
              if (!normalizedThreadId) {
                return;
              }
              void loadThreadGroundTruthStatus(normalizedThreadId);
              void refreshThreads();
            },
            onAgentChange: (nextAgentId) => {
              setPreferredAgentId(String(nextAgentId || "").trim());
            },
            onEnvironmentChange: (nextEnvironmentId) => {
              setEnvironmentId(String(nextEnvironmentId || "").trim());
            },
            onDocumentPreviewOpenChange: () => {},
            onDeepResearchDetailOpenChange: () => {},
          });
        }

`;
