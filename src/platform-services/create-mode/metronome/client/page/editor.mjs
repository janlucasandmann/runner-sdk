export const METRONOME_PAGE_EDITOR_SCRIPT = String.raw`
          const renderInspectorPortal = () => {
            const inspector = renderInspector();
            if (!inspector) return null;
            if (!inspectorPortalId || typeof document === "undefined" || typeof createPortal !== "function") {
              return inspectorPortalId ? null : inspector;
            }
            const portalTarget = document.getElementById(inspectorPortalId);
            return portalTarget ? createPortal(inspector, portalTarget) : null;
          };

          const renderInlineNodeInspector = () => {
            const inspector = renderInspector();
            if (!inspector) return null;
            return React.createElement("aside", {
              className: "playground-metronome-inline-node-inspector",
              onClick: (event) => event.stopPropagation(),
              onMouseDown: (event) => event.stopPropagation(),
            }, inspector);
          };

          const renderMetronomeVersionHistorySidebarPortal = () => {
            if (!activeWorkflow || isActiveWorkflowBuiltIn) return null;
            let portalTarget = null;
            if (inspectorPortalId) {
              if (typeof document === "undefined") return null;
              portalTarget = document.getElementById(inspectorPortalId);
              if (!portalTarget) return null;
            }
            return renderMetronomeVersionHistorySidebar({
              portal: Boolean(portalTarget),
              portalTarget,
            });
          };

          const renderMetronomeDeploymentHistory = () => {
            if (isLoadingMetronomeDeploymentEvents) {
              if (!visibleMetronomeDeploymentEvents.length) {
                return React.createElement("div", { className: "playground-metronome-deployment-history-empty" }, "Loading deployment history...");
              }
            }
            if (metronomeDeploymentEventsError) {
              if (!visibleMetronomeDeploymentEvents.length) {
                return React.createElement("div", { className: "playground-metronome-deployment-history-empty is-error" }, metronomeDeploymentEventsError);
              }
            }
            if (!visibleMetronomeDeploymentEvents.length) {
              return React.createElement("div", { className: "playground-metronome-deployment-history-empty" },
                "Publish or unpublish this workflow to create deployment history."
              );
            }
            return React.createElement("div", { className: "playground-metronome-deployment-history-list" },
              visibleMetronomeDeploymentEvents.map((event) => {
                const action = String(event.action || "").toLowerCase();
                const isUnpublish = action === "unpublish";
                const versionLabel = event.label
                  || (event.version !== undefined && event.version !== null
                    ? formatMetronomeVersionLabel(event.version)
                    : event.versionId
                      ? "Version " + event.versionId.slice(0, 8)
                      : "Workflow");
                return React.createElement("div", { key: event.id, className: "playground-metronome-deployment-history-row" },
                  React.createElement("div", { className: "playground-metronome-deployment-history-icon is-" + (isUnpublish ? "unpublish" : "publish") },
                    React.createElement(isUnpublish ? PauseCircle : Rocket, { width: 13, height: 13, strokeWidth: 1.8 })
                  ),
                  React.createElement("div", { className: "playground-metronome-deployment-history-main" },
                    React.createElement("div", { className: "playground-metronome-deployment-history-title" },
                      isUnpublish ? "Unpublished workflow" : "Published " + versionLabel
                    ),
                    React.createElement("div", { className: "playground-metronome-deployment-history-meta" },
                      formatMetronomeDeploymentTimestamp(event.createdAt)
                      + " · "
                      + (event.status || (isUnpublish ? "unpublished" : "published"))
                      + (event.nodeCount ? " · " + event.nodeCount + " nodes" : "")
                    )
                  )
                );
              })
            );
          };

          const renderMetronomeVersionHistorySidebar = (options = {}) => {
            if (!activeWorkflow || isActiveWorkflowBuiltIn) return null;
            const isBusy = metronomePublishState.status === "loading";
            const isValidating = metronomePublishState.status === "validating";
            const publishIssues = Array.isArray(metronomePublishState.issues) ? metronomePublishState.issues : [];
            const activeDeploymentId = String(activeWorkflowDeployment?.id || activeWorkflow?.activeDeploymentId || "").trim();
            const selectedDeploymentId = String(
              activeWorkflow?.metadata?.restoredFromDeploymentId
              || activeWorkflow?.metadata?.restored_from_deployment_id
              || activeDeploymentId
              || ""
            ).trim();
            const stateContent = isValidating
              ? React.createElement("div", { className: "platform-version-history-sidebar__state" },
                  metronomePublishState.message || "Checking workflow before publishing..."
                )
              : metronomePublishState.status === "error"
                ? React.createElement("div", { className: "playground-metronome-publish-issues" },
                    React.createElement("div", { className: "playground-metronome-publish-issues-title" }, "Resolve before publishing"),
                    publishIssues.length
                      ? React.createElement("ul", { className: "playground-metronome-publish-issues-list" },
                          publishIssues.slice(0, 8).map((issue, index) => React.createElement("li", {
                            key: String(issue.code || "issue") + "-" + String(issue.nodeId || issue.edgeId || index),
                            className: "playground-metronome-publish-issues-item",
                          },
                            React.createElement("span", { className: "playground-metronome-publish-issues-dot", "aria-hidden": "true" }),
                            React.createElement("span", null, issue.message || "Resolve this workflow issue before publishing.")
                          ))
                        )
                      : React.createElement("div", null, metronomePublishState.message || "The workflow is not ready to publish.")
                  )
                : null;
            return React.createElement(PlatformVersionHistorySidebar, {
              open: isMetronomeVersionHistorySidebarOpen,
              title: "Version history",
              sectionTitle: "All Versions",
              className: "playground-metronome-workflow-versions-sidebar",
              width: "var(--playground-thread-task-detail-width)",
              portal: Boolean(options.portal),
              portalTarget: options.portalTarget || null,
              versions: activeWorkflowDeployments,
              activeVersionId: activeDeploymentId,
              selectedVersionId: selectedDeploymentId,
              loading: isLoadingMetronomeVersions,
              loadingMessage: "Loading versions",
              error: metronomeVersionsError || null,
              busy: isBusy || isValidating,
              stateContent,
              onClose: () => {
                setMetronomeVersionChangesState(null);
                setIsMetronomeVersionHistorySidebarOpen(false);
              },
              onSelectVersion: (versionId) => void restoreActiveWorkflowVersion(versionId),
              onPublishVersion: (versionId) => void publishMetronomeDeploymentVersion(versionId),
              canPublishVersion: (deployment) => canPublishMetronomeDeploymentVersion(deployment),
              onViewChanges: () => openMetronomeVersionChangesModal(),
              getVersionCreatedAt: (deployment) => deployment.createdAt
                ? formatMetronomeDeploymentTimestamp(deployment.createdAt)
                : "-",
              getVersionActions: (deployment) => [
                {
                  id: "edit",
                  label: "Edit description",
                  icon: SquarePen,
                  onSelect: () => openEditWorkflowVersionModal(deployment.id),
                },
                {
                  id: "compare",
                  label: "View Changes",
                  icon: Code2,
                  onSelect: () => openMetronomeVersionChangesModal(deployment.id),
                },
                {
                  id: "delete",
                  label: "Delete version",
                  icon: Trash2,
                  danger: true,
                  onSelect: () => void deleteWorkflowVersion(deployment.id),
                },
              ],
            });
          };

          const renderMetronomeVersionChangesModal = () => {
            if (!metronomeVersionChangesState) {
              return null;
            }
            const sources = buildMetronomeVersionCompareSources();
            const currentEditorSource = sources.find((source) => source.id === METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
            const requestedLeftSourceId = String(metronomeVersionChangesState.leftSourceId || "").trim()
              || getDefaultMetronomeVersionCompareLeftSourceId();
            const requestedRightSourceId = String(metronomeVersionChangesState.rightSourceId || "").trim()
              || METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID;
            const leftSource = resolveMetronomeVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
            const rightSource = resolveMetronomeVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
            if (!leftSource || !rightSource) {
              return null;
            }
            const diffFiles = buildMetronomeVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
            const compareOptions = sources.map((source) => ({
              value: source.id,
              label: source.label,
            }));
            return renderPlaygroundVersionChangesModal({
              title: "Changes",
              closeButtonLabel: "Close Metronome version changes",
              onClose: closeMetronomeVersionChangesModal,
              leftSelector: {
                value: leftSource.id,
                options: compareOptions,
                onValueChange: (value) => handleMetronomeVersionCompareSourceChange("left", value),
                ariaLabel: "Select base Metronome version",
              },
              rightSelector: {
                value: rightSource.id,
                options: compareOptions,
                onValueChange: (value) => handleMetronomeVersionCompareSourceChange("right", value),
                ariaLabel: "Select target Metronome version",
              },
              files: diffFiles,
              emptyMessage: "No changes between these versions.",
            });
          };

          const renderCodeMode = () => {
            const codeStatusMessage = metronomeCodeRunState.message
              || (isMetronomeCodeDirty ? "Unsaved changes" : (activeMetronomeCodeFile?.path || "Generated from visual workflow"));
            const codeStatusTone = ["success", "error", "loading"].includes(metronomeCodeRunState.status)
              ? metronomeCodeRunState.status
              : "default";
            const activeCodeFilePath = String(activeMetronomeCodeFile?.path || activeMetronomeCodeFilePath || "");
            const codeWorkspaceFiles = metronomeCodeFiles
              .map((file) => {
                const normalizedPath = String(file?.path || "").trim();
                if (!normalizedPath) return null;
                const Icon = normalizedPath === "requirements.txt" ? Package : FileText;
                return {
                  id: normalizedPath,
                  label: normalizedPath,
                  icon: React.createElement(Icon, { width: 15, height: 15, strokeWidth: 1.8 }),
                  dirty: String(file?.value || "") !== String(file?.originalValue ?? file?.value ?? ""),
                };
              })
              .filter(Boolean);
            return React.createElement("div", { className: "playground-metronome-code-view is-full-screen-workspace playground-resources-page is-develop-server-kind-page" },
              React.createElement("div", { className: "playground-server-detail-content is-code-tab playground-metronome-code-content" },
                React.createElement(PlatformCodeEditorWorkspace, {
                  className: "playground-metronome-code-workspace",
                  ariaLabel: "Metronome code editor",
                  variant: "full-screen",
                  files: codeWorkspaceFiles,
                  activeFileId: activeCodeFilePath,
                  onFileSelect: handleMetronomeCodeFileSelect,
                  editor: activeMetronomeCodeFile
                    ? React.createElement(PlatformMonacoCodeEditor, {
                        className: "playground-metronome-code-monaco-editor",
                        value: String(activeMetronomeCodeFile.value || ""),
                        onChange: handleMetronomeCodeFileChange,
                        language: String(
                          activeMetronomeCodeFile.language
                          || (String(activeMetronomeCodeFile.path || "").endsWith(".txt") ? "plaintext" : "python")
                        ),
                        path: "metronome/" + String(activeMetronomeCodeFile.path || "main.py"),
                        ariaLabel: String(activeMetronomeCodeFile.label || activeMetronomeCodeFile.path || "Metronome code") + " editor",
                        readOnly: isActiveWorkflowBuiltIn,
                        theme: typeof PLAYGROUND_CODE_EDITOR_THEME_NAME === "string" ? PLAYGROUND_CODE_EDITOR_THEME_NAME : "vs-dark",
                        beforeMount: ensurePlaygroundCodeEditorTheme,
                        options: {
                          smoothScrolling: true,
                          renderLineHighlight: "none",
                          wordWrap: "on",
                        },
                      })
                    : null,
                  status: codeStatusMessage,
                  statusTone: codeStatusTone,
                  historyControls: {
                    onUndo: handleMetronomeCodeUndo,
                    onRedo: handleMetronomeCodeRedo,
                    undoDisabled: isActiveWorkflowBuiltIn || metronomeCodeUndoStack.length === 0,
                    redoDisabled: isActiveWorkflowBuiltIn || metronomeCodeRedoStack.length === 0,
                  },
                })
              )
            );
          };

          const renderMetronomeRunStatusLabel = (statusId) => {
            const status = String(statusId || "completed").trim().toLowerCase() || "completed";
            const variant = status === "completed"
              ? "green"
              : status === "running"
                ? "blue"
                : status === "failed"
                  ? "red"
                  : "gray";
            const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
            return React.createElement(PlatformLabel, { variant }, label);
          };

          const formatMetronomeRunTimestamp = (value) => {
            if (!value) return "Just now";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "Just now";
            return date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          };

          const isGenericMetronomeRunPromptText = (value) => {
            const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
            return !normalized
              || normalized === "manual workflow run"
              || normalized === "manual trigger received.";
          };

          const readMetronomeRunPromptCandidate = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              return isGenericMetronomeRunPromptText(trimmed) ? "" : trimmed;
            }
            if (typeof value !== "object") {
              const trimmed = String(value || "").trim();
              return isGenericMetronomeRunPromptText(trimmed) ? "" : trimmed;
            }
            const preferredKeys = [
              "userMessage",
              "user_message",
              "displayMessage",
              "display_message",
              "triggerMessage",
              "trigger_message",
              "message",
              "prompt",
              "body",
              "text",
              "content",
            ];
            for (const key of preferredKeys) {
              const candidate = readMetronomeRunPromptCandidate(value[key]);
              if (candidate) return candidate;
            }
            for (const key of ["thread", "trigger", "event", "input", "inputs", "payload", "email"]) {
              const nested = value[key];
              if (nested && typeof nested === "object") {
                const candidate = readMetronomeRunPromptCandidate(nested);
                if (candidate) return candidate;
              }
            }
            return "";
          };

          const getMetronomeRunPrompt = (run) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const candidates = [
              run?.prompt,
              run?.displayPrompt,
              run?.displayMessage,
              run?.userMessage,
              run?.message,
              run?.input,
              run?.inputs,
              output?.trigger,
              output?.input,
              output?.inputs,
              output?.prompt,
              output?.message,
            ];
            const triggerStep = steps.find((step) => String(step?.kind || "").toLowerCase() === "trigger") || steps[0] || null;
            if (triggerStep) {
              candidates.push(triggerStep.input, triggerStep.inputs, triggerStep.output, triggerStep.summary);
            }
            for (const candidate of candidates) {
              const prompt = readMetronomeRunPromptCandidate(candidate);
              if (prompt) return prompt;
            }
            return "Manual workflow run";
          };

          const getMetronomeRunStepIcon = (step) => {
            const kind = String(step?.kind || "").toLowerCase();
            if (kind === "trigger") return Zap;
            if (kind === "action") return Play;
            if (kind === "condition") return Split;
            if (kind === "end") return Square;
            if (kind === "imagine") return Clapperboard;
            if (kind === "function") return FunctionSquare;
            if (kind === "firecrawl") return Flame;
            if (kind === "table") return typeof TableProperties !== "undefined" ? TableProperties : Database;
            if (kind === "database") return Database;
            if (kind === "ticket") return Bookmark;
            if (kind === "metronome") return Metronome;
            if (kind === "loop") return RefreshCw;
            if (kind === "approval") return Shield;
            if (kind === "note") return StickyNote;
            return Circle;
          };

          const formatMetronomeRunValue = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return "";
              try {
                return JSON.stringify(JSON.parse(trimmed), null, 2);
              } catch (_error) {
                return trimmed;
              }
            }
            try {
              return JSON.stringify(value, null, 2);
            } catch (_error) {
              return String(value || "");
            }
          };

          const extractMetronomeReadableOutputText = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return "";
              try {
                return extractMetronomeReadableOutputText(JSON.parse(trimmed));
              } catch (_error) {
                return trimmed;
              }
            }
            if (typeof value !== "object") {
              return String(value || "").trim();
            }
            if (Array.isArray(value)) {
              return value
                .map((item) => extractMetronomeReadableOutputText(item))
                .filter(Boolean)
                .join("\n\n");
            }
            const preferredKeys = [
              "output_text",
              "outputText",
              "markdown",
              "text",
              "message",
              "summary",
              "content",
              "response",
            ];
            for (const key of preferredKeys) {
              const extracted = extractMetronomeReadableOutputText(value[key]);
              if (extracted) return extracted;
            }
            for (const key of ["result", "output", "data"]) {
              const nested = value[key];
              if (nested && typeof nested === "object" && !Array.isArray(nested)) {
                const extracted = extractMetronomeReadableOutputText(nested);
                if (extracted) return extracted;
              }
            }
            return "";
          };

          const hasMetronomeRunOutput = (value) => {
            if (!value || typeof value !== "object") return Boolean(formatMetronomeRunValue(value));
            return Object.keys(value).some((key) => {
              if (["selectedEdgeId", "branchId", "branchLabel", "branchRule", "branchMatched", "branchReason"].includes(key)) {
                return false;
              }
              const item = value[key];
              if (item === null || typeof item === "undefined") return false;
              if (typeof item === "string") return item.trim().length > 0;
              if (Array.isArray(item)) return item.length > 0;
              if (typeof item === "object") return Object.keys(item).length > 0;
              return true;
            });
          };

          const findMetronomeRunThreadForStep = (step, threads) => {
            const nodeId = String(step?.nodeId || "").trim();
            if (!nodeId || !Array.isArray(threads)) return null;
            return threads.find((thread) => String(thread?.nodeId || "").trim() === nodeId) || null;
          };

          const extractMetronomeThreadReadableOutputText = (step, thread) => {
            const candidates = [
              step?.output,
              step?.result,
              step?.data,
              thread?.output,
              thread?.result,
              thread?.data,
              thread?.summary,
              step?.summary,
            ];
            for (const candidate of candidates) {
              const text = extractMetronomeReadableOutputText(candidate);
              if (text) return text;
            }
            return "";
          };

          const normalizeMetronomeMarkdownText = (value) => String(value || "")
            .replace(/\\\\r\\\\n/g, "\n")
            .replace(/\\\\n/g, "\n")
            .replace(/\\\\r/g, "\n")
            .replace(new RegExp("\\\\\\\\([*_\\\\x60\\\\[\\\\]\\\\(\\\\)#+\\\\-.!>])", "g"), "$1")
            .trim();

          const renderMetronomeRunOutputMarkdown = (value, fallback = "") => {
            const text = normalizeMetronomeMarkdownText(extractMetronomeReadableOutputText(value) || fallback);
            if (!text) return null;
            return React.createElement(PlaygroundTaskDescriptionMarkdown, {
              content: text,
              className: "playground-tasks-comment-text playground-metronome-run-output-markdown tb-message-markdown",
            });
          };

          const renderMetronomeRunTraceValue = (value, fallback = "") => {
            const readableText = normalizeMetronomeMarkdownText(extractMetronomeReadableOutputText(value) || fallback);
            if (readableText) {
              return renderMetronomeRunOutputMarkdown(readableText);
            }
            const formatted = formatMetronomeRunValue(value || fallback);
            if (!formatted) return null;
            return React.createElement("pre", { className: "playground-metronome-run-output-block" }, formatted);
          };

          const getMetronomeRunConditionPresentation = (step, conditionNode = null) => (
            buildPlatformMetronomeConditionResultPresentation(step, conditionNode)
          );

          const isGenericMetronomeRunSummaryText = (value) => {
            const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
            return !normalized
              || normalized === "metronome run completed."
              || normalized === "metronome run completed"
              || normalized === "workflow reached the end node."
              || normalized === "workflow reached the end node";
          };

          const getMetronomeRunSummaryText = (run) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const threads = Array.isArray(output.threads) ? output.threads : [];
            for (let index = threads.length - 1; index >= 0; index -= 1) {
              const thread = threads[index];
              const threadText = extractMetronomeReadableOutputText(thread?.summary)
                || extractMetronomeReadableOutputText(thread?.output)
                || extractMetronomeReadableOutputText(thread?.result)
                || extractMetronomeReadableOutputText(thread?.data);
              if (threadText && !isGenericMetronomeRunSummaryText(threadText)) {
                return threadText;
              }
            }
            for (let index = steps.length - 1; index >= 0; index -= 1) {
              const step = steps[index];
              const kind = String(step?.kind || "").toLowerCase();
              const subtype = String(step?.subtype || step?.type || "").toLowerCase();
              const isThreadStep = kind === "thread" || subtype === "thread" || subtype === "start_thread";
              if (!isThreadStep) continue;
              const thread = findMetronomeRunThreadForStep(step, threads);
              const threadText = extractMetronomeThreadReadableOutputText(step, thread);
              if (threadText && !isGenericMetronomeRunSummaryText(threadText)) {
                return threadText;
              }
            }
            const candidates = [
              output.runSummary,
              output.run_summary,
              output.summary,
              output.message,
              run?.summary,
              run?.result,
              run?.error,
            ];
            for (const candidate of candidates) {
              const text = extractMetronomeReadableOutputText(candidate);
              if (text && !isGenericMetronomeRunSummaryText(text)) return text;
            }
            const finalStep = steps[steps.length - 1] || null;
            const finalStepText = extractMetronomeReadableOutputText(finalStep?.output) || String(finalStep?.summary || "").trim();
            if (finalStepText && !isGenericMetronomeRunSummaryText(finalStepText)) return finalStepText;
            const completedStepCount = steps.length;
            const threadCount = threads.length;
            if (completedStepCount || threadCount) {
              return "Workflow completed with " + completedStepCount + " step" + (completedStepCount === 1 ? "" : "s")
                + (threadCount ? " and " + threadCount + " thread" + (threadCount === 1 ? "" : "s") : "") + ".";
            }
            return "";
          };

          const isMetronomeRunEmailTrigger = (run) => {
            const input = run?.input && typeof run.input === "object" ? run.input : {};
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const triggerType = String(run?.triggerType || input.triggerType || input.type || output.triggerType || "").toLowerCase();
            return triggerType === "email" || triggerType === "email_received" || Boolean(input.email || input.from || input.sender || input.subject);
          };

          const renderMetronomeRunTriggerMessage = (run) => {
            const input = run?.input && typeof run.input === "object" ? run.input : {};
            const prompt = getMetronomeRunPrompt(run);
            if (isMetronomeRunEmailTrigger(run)) {
              const email = input.email && typeof input.email === "object" ? input.email : {};
              const from = String(input.from || input.sender || email.from || email.sender || "").trim();
              const subject = String(input.subject || email.subject || "Inbound email").trim();
              const body = String(input.body || input.text || input.message || email.body || email.text || prompt || "").trim();
              return React.createElement("div", { className: "playground-metronome-run-user-row" },
                React.createElement("div", { className: "playground-metronome-run-user-bubble playground-metronome-run-email-bubble" },
                  from
                    ? React.createElement("div", { className: "playground-metronome-run-email-from" }, "From ", from)
                    : null,
                  React.createElement("div", { className: "playground-metronome-run-email-subject" }, subject),
                  body
                    ? React.createElement("div", { className: "playground-metronome-run-email-body" }, body)
                    : null
                )
              );
            }
            if (!prompt) return null;
            return React.createElement("div", { className: "playground-metronome-run-user-row" },
              React.createElement("div", { className: "playground-metronome-run-user-bubble" }, prompt)
            );
          };

          const getMetronomeRunningThreadLabel = (step, thread) => {
            const safeStep = step && typeof step === "object" && !Array.isArray(step) ? step : {};
            const safeThread = thread && typeof thread === "object" && !Array.isArray(thread) ? thread : {};
            const output = safeStep.output && typeof safeStep.output === "object" && !Array.isArray(safeStep.output)
              ? safeStep.output
              : {};
            const outputThread = output.thread && typeof output.thread === "object" && !Array.isArray(output.thread)
              ? output.thread
              : {};
            const records = [safeStep, outputThread, safeThread, output].flatMap((record) => {
              const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
                ? record.metadata
                : {};
              const projection = metadata.projection && typeof metadata.projection === "object" && !Array.isArray(metadata.projection)
                ? metadata.projection
                : {};
              const runProjection = metadata.runProjection && typeof metadata.runProjection === "object" && !Array.isArray(metadata.runProjection)
                ? metadata.runProjection
                : metadata.run_projection && typeof metadata.run_projection === "object" && !Array.isArray(metadata.run_projection)
                  ? metadata.run_projection
                  : {};
              return [record, metadata, projection, runProjection];
            });
            const keys = [
              "workingLabel",
              "working_label",
              "workingSummary",
              "working_summary",
              "headerSummary",
              "header_summary",
              "statusMessage",
              "status_message",
              "liveSummary",
              "live_summary",
              "thinkingSummary",
              "thinking_summary",
            ];
            for (const record of records) {
              for (const key of keys) {
                const label = String(record[key] || "").replace(/\s+/g, " ").trim();
                if (label && !/^thread is running[.!?]*$/i.test(label)) {
                  return label;
                }
              }
            }
            return "Working...";
          };

          const renderMetronomeRunningThreadStatus = (workingLabel) => (
            React.createElement("div", {
              className: "tb-work-header is-static tb-thread-live-work-status playground-metronome-running-thread-status",
            },
              React.createElement("span", { className: "tb-work-label is-live" },
                React.createElement("span", {
                  className: "tb-log-inline-status-spinner-slot tb-work-status-loader",
                  "aria-hidden": "true",
                },
                  React.createElement("img", {
                    className: "tb-log-inline-status-spinner tb-thread-live-work-spinner",
                    src: "/img/spinner.svg",
                    alt: "",
                  })
                ),
                React.createElement("span", {
                  className: "tb-work-label-copy",
                  "aria-live": "polite",
                }, workingLabel)
              )
            )
          );

          const renderMetronomeRunTrace = (run, { includeComposerPrompt = false } = {}) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const threads = Array.isArray(output.threads) ? output.threads : [];
            const logs = Array.isArray(output.logs) ? output.logs : [];
            const prompt = getMetronomeRunPrompt(run);
            const traceNodeById = new Map((Array.isArray(nodes) ? nodes : []).map((node) => [String(node?.id || ""), node]));
            const traceItems = [];
            if (includeComposerPrompt) {
              const triggerMessage = renderMetronomeRunTriggerMessage(run);
              if (triggerMessage) {
                traceItems.push(React.cloneElement(triggerMessage, { key: "prompt" }));
              }
            }
            if (steps.length) {
              steps.forEach((step, index) => {
                const StepIcon = getMetronomeRunStepIcon(step);
                const thread = findMetronomeRunThreadForStep(step, threads);
                const stepKind = String(step.kind || "").toLowerCase();
                const stepSubtype = String(step.subtype || step.type || "").toLowerCase();
                const rawStepLabel = String(step.label || "").trim();
                const stepNode = traceNodeById.get(String(step.nodeId || "").trim()) || null;
                const isThreadStep = stepKind === "thread"
                  || stepSubtype === "thread"
                  || stepSubtype === "start_thread"
                  || /start\s+agent\s+thread/i.test(rawStepLabel);
                const stepOutput = step?.output && typeof step.output === "object" ? step.output : {};
                const outputThread = stepOutput.thread && typeof stepOutput.thread === "object" ? stepOutput.thread : {};
                const threadStatus = String(step?.status || outputThread.status || thread?.status || stepOutput.status || "").trim();
                const isThreadRunning = isThreadStep && isActiveMetronomeRunStatus(threadStatus);
                const stepTitle = stepNode
                  ? getMetronomeNodeDisplayLabel(stepNode)
                  : normalizeMetronomeNodeLabel(rawStepLabel || getMetronomeSubtypeLabel(step.kind, step.subtype) || step.kind || "Workflow step", stepKind || step.kind, stepSubtype || step.subtype);
                const readableOutputText = stepKind === "trigger" || stepKind === "condition"
                  ? ""
                  : isThreadStep
                    ? extractMetronomeThreadReadableOutputText(step, thread)
                    : extractMetronomeReadableOutputText(step.output);
                const conditionPresentation = stepKind === "condition"
                  ? getMetronomeRunConditionPresentation(step, stepNode)
                  : null;
                const summary = String(
                  isThreadStep
                    ? (readableOutputText ? "" : thread?.prompt || step.status || "Completed")
                    : stepKind === "condition"
                      ? ""
                    : step.summary || step.status || "Completed"
                ).trim();
                const shouldRenderOutputText = Boolean(
                  readableOutputText
                  && (
                    isThreadStep
                    || normalizeMetronomeMarkdownText(readableOutputText).replace(/\s+/g, " ") !== normalizeMetronomeMarkdownText(summary).replace(/\s+/g, " ")
                  )
                );
                traceItems.push(React.createElement("div", { key: step.id || step.nodeId || index, className: "playground-metronome-run-trace-step" },
                  stepKind !== "condition"
                    ? React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                        React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                          React.createElement(StepIcon, { width: 13, height: 13, strokeWidth: 1.9 })
                        ),
                        React.createElement("div", { className: "playground-metronome-run-trace-title-group" },
                          React.createElement("div", { className: "playground-metronome-run-trace-title" }, stepTitle),
                          thread?.id
                            ? React.createElement("div", { className: "playground-metronome-run-thread-meta-row" },
                                React.createElement("span", { className: "playground-metronome-run-thread-id" }, thread.id),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-metronome-run-thread-link",
                                  onClick: () => {
                                    if (typeof onThreadOpen === "function") {
                                      requestMetronomeNavigation(() => (
                                        onThreadOpen(thread.id, { contentMode: "chat" })
                                      ));
                                    }
                                  },
                                }, "Show thread")
                              )
                            : null
                        )
                      )
                    : null,
                  isThreadRunning
                    ? renderMetronomeRunningThreadStatus(getMetronomeRunningThreadLabel(step, thread))
                    : summary
                    ? React.createElement("div", { className: "playground-metronome-run-trace-summary" }, summary)
                    : null,
                  conditionPresentation
                    ? React.createElement(PlatformMetronomeConditionResult, conditionPresentation)
                    : null,
                  shouldRenderOutputText && !isThreadRunning
                    ? renderMetronomeRunOutputMarkdown(readableOutputText)
                    : null
                ));
              });
              const runSummaryText = getMetronomeRunSummaryText(run);
              if (runSummaryText) {
                traceItems.push(React.createElement("div", { key: "run-summary", className: "playground-metronome-run-trace-step playground-metronome-run-trace-summary-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(FileText, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title-group" },
                      React.createElement("div", { className: "playground-metronome-run-trace-title" }, "Run summary")
                    )
                  ),
                  renderMetronomeRunOutputMarkdown(runSummaryText)
                ));
              }
            } else if (logs.length) {
              logs.forEach((log, index) => {
                traceItems.push(React.createElement("div", { key: log.id || index, className: "playground-metronome-run-trace-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(MessageSquare, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title" }, String(log.message || "Workflow event"))
                  )
                ));
              });
            }
            if (!traceItems.length) {
              traceItems.push(React.createElement("div", { key: "empty", className: "playground-metronome-run-trace-empty-copy" },
                metronomeRunState.status === "loading"
                  ? "Waiting for the first workflow event..."
                  : "No run trace has been recorded yet."
              ));
            }
            const triggerMessage = includeComposerPrompt ? renderMetronomeRunTriggerMessage(run) : null;
            const workTraceItems = traceItems.filter((item) => {
              const itemKey = item && item.key != null ? String(item.key) : "";
              return itemKey !== "prompt" && itemKey !== "run-summary";
            });
            const displayedWorkTraceItems = workTraceItems.length
              ? workTraceItems
              : [
                  React.createElement("div", { key: "empty-work", className: "playground-metronome-run-trace-empty-copy" },
                    metronomeRunState.status === "loading"
                      ? "Loading workflow trace..."
                      : "No workflow steps were recorded."
                  ),
                ];
            const summaryText = getMetronomeRunSummaryText(run);
            const isExpanded = metronomeRunTraceWorkExpanded;
            return React.createElement("div", { className: "tb-runner-chat playground-metronome-run-thread-list is-work-log-surface" },
              React.createElement("div", { className: "tb-turn tb-turn-user playground-metronome-run-thread-turn" },
                triggerMessage
                  ? React.createElement("div", { className: "tb-user-turn-shell tb-thread-history-anchor playground-metronome-run-thread-user-shell" },
                      triggerMessage
                    )
                  : null,
                React.createElement("button", {
                  type: "button",
                  className: "tb-work-header playground-metronome-run-thread-work-header",
                  "aria-expanded": isExpanded ? "true" : "false",
                  onClick: () => setMetronomeRunTraceWorkExpanded((current) => !current),
                },
                  React.createElement("span", { className: "tb-work-label" },
                    React.createElement("span", null, metronomeRunState.status === "loading" ? "Loading workflow" : "Workflow Logs"),
                    isExpanded
                      ? React.createElement(ChevronUp, { className: "tb-chevron", strokeWidth: 1.8 })
                      : React.createElement(ChevronDown, { className: "tb-chevron", strokeWidth: 1.8 })
                  )
                ),
                React.createElement("div", {
                  className: ("tb-work-collapse playground-metronome-run-thread-work " + (isExpanded ? "is-expanded" : "collapsed")).trim(),
                },
                  React.createElement("div", { className: "tb-work-collapse-inner" },
                    React.createElement("div", { className: "agent-steps-container" },
                      displayedWorkTraceItems.map((item, index) => React.createElement("div", {
                        key: (item && item.key != null ? String(item.key) : "trace") + ":" + index,
                        className: "agent-step-item",
                      },
                        React.createElement("div", { className: "agent-step-content" }, item)
                      ))
                    )
                  )
                ),
                summaryText
                  ? React.createElement("div", { className: "tb-turn-summary tb-thread-history-anchor is-latest-summary playground-metronome-run-thread-summary" },
                      React.createElement("div", { className: "tb-turn-response" },
                        renderMetronomeRunOutputMarkdown(summaryText)
                      )
                    )
                  : null
              )
            );
          };

          const renderMetronomeInlineRunDetail = (run) => {
            if (!run) {
              return React.createElement("div", { className: "playground-metronome-runs-view playground-metronome-run-thread-view" },
                React.createElement("div", { className: "playground-metronome-run-thread-empty" },
                  isLoadingMetronomeRuns ? "Loading run trace..." : "Run trace is not available."
                )
              );
            }
            return React.createElement("div", { className: "playground-metronome-runs-view playground-metronome-run-thread-view" },
              React.createElement("div", { className: "playground-metronome-run-thread-header" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-run-thread-back",
                  onClick: () => setMetronomeRunInlineDetailId(""),
                },
                  React.createElement(ChevronLeft, { width: 15, height: 15, strokeWidth: 1.9 }),
                  React.createElement("span", null, "Settings")
                ),
                React.createElement("div", { className: "playground-metronome-run-thread-heading" },
                  React.createElement("div", { className: "playground-metronome-run-thread-title-row" },
                    React.createElement(Metronome, { width: 17, height: 17, strokeWidth: 1.8 }),
                    React.createElement("h2", { className: "playground-metronome-run-thread-page-title" }, activeWorkflow?.name || "Metronome run")
                  ),
                  React.createElement("div", { className: "playground-metronome-run-thread-page-meta" },
                    React.createElement("span", null, run.id || "Run"),
                    React.createElement("span", null, formatMetronomeRunTimestamp(run.createdAt || run.startedAt))
                  )
                )
              ),
              React.createElement("div", { className: "playground-metronome-run-thread-body" },
                renderMetronomeRunTrace(run, { includeComposerPrompt: true })
              )
            );
          };

          const getActiveMetronomeExecutionBinding = () => {
            const workflow = activeMetronomeEditorWorkflow || activeWorkflow;
            if (!workflow?.id) {
              throw new Error("Save this workflow before running it.");
            }
            const selectedVersionId = String(
              activeWorkflow?.metadata?.restoredFromDeploymentId
              || activeWorkflow?.metadata?.restored_from_deployment_id
              || activeWorkflowDeployment?.id
              || activeWorkflow?.activeDeploymentId
              || ""
            ).trim();
            const canUseImmutableVersion = selectedVersionId
              && !hasActiveMetronomeVersionChanges();
            return {
              workflow,
              ...(canUseImmutableVersion
                ? { versionId: selectedVersionId }
                : { definition: createMetronomeWorkflowDefinition(workflow, nodes, edges) }),
            };
          };

          const upsertAdmittedMetronomeRun = (run, { openDetail = false } = {}) => {
            if (!run?.id) throw new Error("Metronome run did not return an id.");
            setMetronomeRuns((current) => [
              run,
              ...current.filter((item) => String(item?.id || "") !== String(run.id)),
            ]);
            setSelectedMetronomeRunId(run.id);
            if (openDetail) {
              setSelectedNodeId("");
              setMetronomeRunInlineDetailId(run.id);
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("playground:metronome-run-upserted", {
                detail: { workflow: activeWorkflow, run },
              }));
            }
            return run;
          };

          const getMetronomeManualRunContractOptions = () => ({
            agentOptions: metronomeAgentOptions,
            environmentOptions: metronomeComputerOptions,
            projectOptions: metronomeProjectOptions,
            functionOptions: metronomeFunctionOptions,
            webAppOptions: metronomeWebAppOptions,
            databaseOptions: metronomeDatabaseOptions,
            authOptions: metronomeAuthOptions,
          });

          const createMetronomeManualRunDialogState = (contracts, requestedContractId = "") => {
            const safeContracts = Array.isArray(contracts) ? contracts.filter(Boolean) : [];
            const contract = safeContracts.find((candidate) => candidate.id === requestedContractId)
              || safeContracts[0]
              || null;
            if (!contract) {
              throw new Error("This workflow does not expose a manual run contract.");
            }
            if (contract.mode === "composer") {
              if (!String(contract.composerBinding?.agentId || "").trim()) {
                throw new Error("Select an agent on the workflow thread node before running this workflow.");
              }
              if (!String(contract.composerBinding?.environmentId || "").trim()) {
                throw new Error("Select a computer on the workflow thread node before running this workflow.");
              }
            }
            const inputFields = Array.isArray(contract.inputFields) ? contract.inputFields : [];
            return {
              requestKey: Date.now().toString(36) + Math.random().toString(36).slice(2),
              contracts: safeContracts,
              contractId: contract.id,
              contract,
              status: "idle",
              error: "",
              inputFields,
              composerPayload: null,
              composerSubmitRequest: null,
              inputValues: Object.fromEntries(inputFields.map((field) => [
                field.id,
                serializeMetronomeExecutionInputValue(field),
              ])),
            };
          };

          const openManualMetronomeRunDialog = () => {
            if (!activeWorkflow?.id || isMetronomeWorkflowBuiltIn(activeWorkflow) || metronomeRunState.status === "loading") {
              return;
            }
            try {
              const workflow = activeMetronomeEditorWorkflow || activeWorkflow;
              const contracts = createMetronomeManualRunContracts(
                workflow,
                nodes,
                edges,
                getMetronomeManualRunContractOptions()
              );
              setMetronomeManualRunDialog(createMetronomeManualRunDialogState(contracts));
              setMetronomeRunState({ status: "idle", message: "" });
            } catch (error) {
              setMetronomeRunState({
                status: "error",
                message: error instanceof Error ? error.message : "This workflow cannot be run manually.",
              });
            }
          };

          const selectMetronomeManualRunContract = (contractId) => {
            setMetronomeManualRunDialog((current) => {
              if (!current || current.status === "starting") return current;
              try {
                return createMetronomeManualRunDialogState(current.contracts, contractId);
              } catch (error) {
                return {
                  ...current,
                  status: "error",
                  error: error instanceof Error ? error.message : "This trigger cannot be simulated.",
                };
              }
            });
          };

          const startManualMetronomeRun = async (dialogOverride = null) => {
            const dialog = dialogOverride || metronomeManualRunDialog;
            if (
              !dialog
              || dialog.status === "starting"
              || !activeWorkflow?.id
              || isMetronomeWorkflowBuiltIn(activeWorkflow)
              || metronomeRunState.status === "loading"
            ) {
              return null;
            }
            setMetronomeManualRunDialog((current) => current
              ? { ...current, status: "starting", error: "" }
              : current);
            setMetronomeRunState({ status: "loading", message: "Starting run..." });
            setMetronomeRunsError("");
            try {
              const binding = getActiveMetronomeExecutionBinding();
              const fixture = buildMetronomeExecutionFixture(dialog);
              const inputs = buildMetronomeManualRunInput(dialog.contract, fixture, dialog.composerPayload);
              const run = await createMetronomeRunApi(activeWorkflow.id, {
                ...binding,
                prompt: inputs.prompt,
                inputs,
              });
              upsertAdmittedMetronomeRun(run);
              setMetronomeManualRunDialog(null);
              setMetronomeRunState({ status: "idle", message: "" });
              return run;
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to start Metronome run.";
              setMetronomeManualRunDialog((current) => current
                ? { ...current, status: "error", error: message }
                : current);
              setMetronomeRunState({ status: "error", message });
              return null;
            }
          };

          const submitMetronomeManualRunComposer = async (fieldId, payload) => {
            const dialog = metronomeManualRunDialog;
            if (!dialog || dialog.status === "starting") return false;
            const nextDialog = {
              ...dialog,
              inputValues: {
                ...(dialog.inputValues || {}),
                [fieldId]: String(payload?.prompt || ""),
              },
              composerPayload: payload && typeof payload === "object" ? payload : null,
            };
            setMetronomeManualRunDialog(nextDialog);
            return Boolean(await startManualMetronomeRun(nextDialog));
          };

          const requestManualMetronomeRun = () => {
            const dialog = metronomeManualRunDialog;
            if (!dialog || dialog.status === "starting") return;
            const composerField = (Array.isArray(dialog.inputFields) ? dialog.inputFields : [])
              .find((field) => field?.control === "task-input");
            if (!composerField || !String(dialog.inputValues?.[composerField.id] || "").trim()) {
              void startManualMetronomeRun();
              return;
            }
            setMetronomeManualRunDialog((current) => current
              ? {
                  ...current,
                  composerSubmitRequest: Number(current.composerSubmitRequest || 0) + 1,
                }
              : current);
          };

          const getMetronomeCanvasTestSelection = () => {
            const selectedIds = nodes
              .filter((node) => node?.selected === true)
              .map((node) => String(node?.id || "").trim())
              .filter(Boolean);
            const focusedId = String(selectedNodeId || "").trim();
            const nodeIds = [...new Set(selectedIds.length > 1
              ? selectedIds
              : [focusedId || selectedIds[0]].filter(Boolean))];
            if (!nodeIds.length) {
              throw new Error("Select a node or connected group of nodes to test.");
            }
            return nodeIds.length === 1
              ? { type: "node", nodeId: nodeIds[0] }
              : { type: "slice", nodeIds };
          };

          const getMetronomeExecutionTestNodes = (selection) => {
            const selectedIds = selection?.type === "slice"
              ? selection.nodeIds
              : [selection?.nodeId].filter(Boolean);
            return (Array.isArray(selectedIds) ? selectedIds : [])
              .map((nodeId) => nodes.find((candidate) => String(candidate?.id || "") === String(nodeId || "")))
              .filter(Boolean);
          };

          const serializeMetronomeExecutionInputValue = (field) => {
            const value = field?.defaultValue;
            if (field?.valueType === "boolean") return value === true || String(value || "").toLowerCase() === "true";
            if (field?.valueType === "array") {
              return Array.isArray(value) ? value.map((entry) => String(entry ?? "")).join("\n") : String(value || "");
            }
            return value === null || value === undefined ? "" : String(value);
          };

          const getMetronomeExecutionInputFields = (selection) => {
            const fieldsByPath = new Map();
            getMetronomeExecutionTestNodes(selection).forEach((node) => {
              getMetronomeNodeTestInputFields(node).forEach((field) => {
                const path = String(field?.path || field?.id || "").trim();
                if (!path) return;
                const current = fieldsByPath.get(path);
                fieldsByPath.set(path, current
                  ? { ...current, required: current.required || field.required }
                  : field);
              });
            });
            return [...fieldsByPath.values()];
          };

          const setMetronomeExecutionFixturePath = (target, path, value) => {
            const parts = splitMetronomeDynamicContentPath(path);
            if (!parts.length) return;
            let cursor = target;
            parts.forEach((part, index) => {
              if (index === parts.length - 1) {
                cursor[part] = value;
                return;
              }
              if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
                cursor[part] = {};
              }
              cursor = cursor[part];
            });
          };

          const parseMetronomeExecutionInputValue = (field, rawValue) => {
            if (field.valueType === "boolean") return rawValue === true;
            if (field.valueType === "number") {
              const normalizedValue = String(rawValue ?? "").trim();
              if (!normalizedValue) return undefined;
              const numberValue = Number(normalizedValue);
              if (!Number.isFinite(numberValue)) {
                throw new Error(field.label + " must be a valid number.");
              }
              return numberValue;
            }
            if (field.valueType === "array") {
              return String(rawValue || "")
                .split(/[\n,]+/g)
                .map((entry) => entry.trim())
                .filter(Boolean);
            }
            return String(rawValue ?? "").trim();
          };

          const buildMetronomeExecutionFixture = (dialog) => {
            const fixture = {};
            (Array.isArray(dialog?.inputFields) ? dialog.inputFields : []).forEach((field) => {
              const rawValue = dialog?.inputValues?.[field.id];
              const value = parseMetronomeExecutionInputValue(field, rawValue);
              const empty = value === undefined
                || value === ""
                || (Array.isArray(value) && value.length === 0);
              if (field.required && empty) {
                throw new Error(field.label + " is required.");
              }
              if (!empty || field.valueType === "boolean") {
                setMetronomeExecutionFixturePath(fixture, field.path, value);
              }
            });
            if (typeof fixture.prompt === "string" && fixture.prompt) {
              fixture.text = fixture.prompt;
              fixture.message = fixture.prompt;
            }
            const composerAttachments = Array.isArray(dialog?.composerPayload?.attachments)
              ? dialog.composerPayload.attachments.filter(Boolean)
              : [];
            if (composerAttachments.length) {
              if (!Array.isArray(fixture.attachments)) fixture.attachments = composerAttachments;
              if (!Array.isArray(fixture.files)) fixture.files = composerAttachments;
            }
            return fixture;
          };

          const buildMetronomeExecutionRequest = (dialog) => {
            const fixture = buildMetronomeExecutionFixture(dialog);
            const workflowInput = { ...fixture, input: fixture };
            return {
              fixture,
              selection: {
                ...dialog.selection,
                boundaryContext: {
                  workflowInput,
                  nodeOutputs: {},
                  records: [],
                },
              },
              inputs: { source: "manual_ui_test", ...fixture, fixture },
            };
          };

          const openMetronomeExecutionTestDialog = () => {
            if (!activeWorkflow?.id) {
              setMetronomeRunState({ status: "error", message: "Save this workflow before testing it." });
              return;
            }
            try {
              const selection = getMetronomeCanvasTestSelection();
              const inputFields = getMetronomeExecutionInputFields(selection);
              const dialog = {
                requestKey: Date.now().toString(36) + Math.random().toString(36).slice(2),
                selection,
                status: "idle",
                preview: null,
                error: "",
                inputFields,
                composerPayload: null,
                composerSubmitRequest: null,
                inputValues: Object.fromEntries(inputFields.map((field) => [
                  field.id,
                  serializeMetronomeExecutionInputValue(field),
                ])),
              };
              setMetronomeExecutionDialog(dialog);
            } catch (error) {
              setMetronomeRunState({
                status: "error",
                message: error instanceof Error ? error.message : "Select a workflow node to test.",
              });
            }
          };

          const startMetronomeExecutionTest = async (dialogOverride = null) => {
            const dialog = dialogOverride || metronomeExecutionDialog;
            if (!dialog || dialog.status === "starting") return null;
            setMetronomeExecutionDialog((current) => current ? { ...current, status: "starting", error: "" } : current);
            try {
              const executionRequest = buildMetronomeExecutionRequest(dialog);
              const binding = getActiveMetronomeExecutionBinding();
              const preview = await previewMetronomeTestRunApi(activeWorkflow.id, {
                ...binding,
                selection: executionRequest.selection,
                inputs: executionRequest.inputs,
              });
              if (!preview?.plan?.executable) {
                throw new Error("This workflow selection cannot be executed.");
              }
              const result = await createMetronomeTestRunApi(activeWorkflow.id, {
                ...binding,
                selection: executionRequest.selection,
                fixture: executionRequest.fixture,
                inputs: executionRequest.inputs,
              });
              upsertAdmittedMetronomeRun(result.run, { openDetail: true });
              setMetronomeExecutionDialog(null);
              setMetronomeRunState({ status: "idle", message: "" });
              return result.run;
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to start workflow test.";
              setMetronomeExecutionDialog((current) => current
                ? { ...current, status: "error", error: message }
                : current);
              return null;
            }
          };

          const submitMetronomeExecutionTestComposer = async (fieldId, payload) => {
            const dialog = metronomeExecutionDialog;
            if (!dialog || dialog.status === "starting") return false;
            const nextDialog = {
              ...dialog,
              inputValues: {
                ...(dialog.inputValues || {}),
                [fieldId]: String(payload?.prompt || ""),
              },
              composerPayload: payload && typeof payload === "object" ? payload : null,
            };
            setMetronomeExecutionDialog(nextDialog);
            return Boolean(await startMetronomeExecutionTest(nextDialog));
          };

          const requestMetronomeExecutionTest = () => {
            const dialog = metronomeExecutionDialog;
            if (!dialog || dialog.status === "starting") return;
            const composerField = (Array.isArray(dialog.inputFields) ? dialog.inputFields : [])
              .find((field) => field?.control === "task-input");
            if (!composerField) {
              void startMetronomeExecutionTest();
              return;
            }
            setMetronomeExecutionDialog((current) => current
              ? {
                  ...current,
                  composerSubmitRequest: Number(current.composerSubmitRequest || 0) + 1,
                }
              : current);
          };

          const renderMetronomeSettingsMode = () => {
            const workflow = activeMetronomeEditorWorkflow || activeWorkflow;
            if (!workflow?.id) return null;
            const workflowMetadata = workflow.metadata
              && typeof workflow.metadata === "object"
              && !Array.isArray(workflow.metadata)
              ? workflow.metadata
              : {};
            const deploymentRegion = String(
              workflowMetadata.deploymentRegion
              || workflowMetadata.region
              || workflowMetadata.location
              || "europe-west1"
            ).trim() || "europe-west1";
            const isTriggeringMetronomeRun = metronomeRunState.status === "loading";
            const isRunTriggerDisabled = isMetronomeWorkflowBuiltIn(workflow);
            const inferenceBudgetPolicy = readMetronomeWorkflowInferenceBudgetPolicy(workflow);
            const isInferenceBudgetEnabled = Boolean(inferenceBudgetPolicy);
            const displayedInferenceBudgetPolicy = inferenceBudgetPolicy || {
              schemaVersion: METRONOME_INFERENCE_BUDGET_POLICY_SCHEMA_VERSION,
              unit: "usd",
              maximumAmountPerRun: 1,
            };
            const commitMetronomeInferenceBudgetPolicy = (patch) => {
              setMetronomeInferenceBudgetPolicyDraft(normalizeMetronomeInferenceBudgetPolicy({
                ...displayedInferenceBudgetPolicy,
                ...(patch && typeof patch === "object" ? patch : {}),
              }));
            };
            const budgetSettings = React.createElement(PlatformSettingsSectionList, null,
              React.createElement(PlatformSettingsSection, {
                title: "Budget per run",
                className: "playground-metronome-settings-budget-section",
                bodyPresentation: "flush",
              },
                React.createElement(PlatformServiceDetailPropertyList, {
                  className: "playground-metronome-settings-budget-list",
                },
                  React.createElement(PlatformServiceDetailProperty, { label: "Enforce budget per run" },
                    React.createElement(PlatformToggle, {
                      checked: isInferenceBudgetEnabled,
                      disabled: isActiveWorkflowBuiltIn,
                      "aria-label": "Enforce a budget for every workflow run",
                      onCheckedChange: (checked) => {
                        if (!checked) {
                          setMetronomeInferenceBudgetPolicyDraft(null);
                          return;
                        }
                        commitMetronomeInferenceBudgetPolicy({});
                      },
                    })
                  ),
                  React.createElement(PlatformServiceDetailProperty, { label: "Budget amount" },
                    React.createElement("div", { className: "playground-metronome-settings-budget-control" },
                      React.createElement("label", { className: "playground-metronome-settings-budget-input-shell" },
                        React.createElement("input", {
                          type: "number",
                          min: displayedInferenceBudgetPolicy.unit === "tokens" ? 1 : 0.01,
                          max: displayedInferenceBudgetPolicy.unit === "tokens" ? 1000000 : 10000,
                          step: displayedInferenceBudgetPolicy.unit === "tokens" ? 1 : 0.01,
                          value: displayedInferenceBudgetPolicy.maximumAmountPerRun,
                          className: "playground-metronome-settings-budget-input",
                          disabled: isActiveWorkflowBuiltIn || !isInferenceBudgetEnabled,
                          "aria-label": "Maximum workflow budget amount",
                          onChange: (event) => commitMetronomeInferenceBudgetPolicy({
                            maximumAmountPerRun: displayedInferenceBudgetPolicy.unit === "tokens"
                              ? Math.min(1000000, Math.max(1, Math.round(Number(event.target.value) || 1)))
                              : Math.min(10000, Math.max(0.01, Number(event.target.value) || 0.01)),
                          }),
                        }),
                      ),
                      React.createElement(PlatformSwitch, {
                        value: displayedInferenceBudgetPolicy.unit,
                        options: [
                          { value: "usd", label: "USD" },
                          { value: "tokens", label: "Tokens" },
                        ],
                        disabled: isActiveWorkflowBuiltIn || !isInferenceBudgetEnabled,
                        ariaLabel: "Workflow budget unit",
                        className: "playground-metronome-settings-budget-unit-switch",
                        onValueChange: (unit) => commitMetronomeInferenceBudgetPolicy({
                          unit,
                          maximumAmountPerRun: unit === displayedInferenceBudgetPolicy.unit
                            ? displayedInferenceBudgetPolicy.maximumAmountPerRun
                            : unit === "tokens"
                              ? Math.max(1, Math.round(
                                  displayedInferenceBudgetPolicy.maximumAmountPerRun
                                  * METRONOME_INFERENCE_BUDGET_TOKENS_PER_USD
                                ))
                              : Math.max(0.01,
                                  displayedInferenceBudgetPolicy.maximumAmountPerRun
                                  / METRONOME_INFERENCE_BUDGET_TOKENS_PER_USD
                                ),
                        }),
                      })
                    )
                  )
                )
              )
            );
            const creatorIdentity = resolveMetronomeWorkflowCreatorPresentation(activeWorkflow, {
              isBuiltIn: isMetronomeWorkflowBuiltIn(activeWorkflow),
            });
            const ownerIdentity = resolveMetronomeWorkflowOwnerPresentation(activeWorkflow, {
              isBuiltIn: isMetronomeWorkflowBuiltIn(activeWorkflow),
              isTeamShared: isActiveWorkflowTeamShared,
            });
            const selectedProjectScopeIds = getPlatformResourceProjectScopeIds(workflowMetadata);
            const isUpdatingProjectScope = metronomeScopeUpdateState.workflowId === String(workflow.id || "").trim()
              && metronomeScopeUpdateState.status === "loading";
            const projectScopeError = metronomeScopeUpdateState.workflowId === String(workflow.id || "").trim()
              && metronomeScopeUpdateState.status === "error"
              ? metronomeScopeUpdateState.message
              : "";
            const settingsDetails = {
              variant: "standard",
              className: "playground-metronome-settings-sidebar-card",
              propertiesClassName: "playground-metronome-settings-property-list",
              updatedAt: activeWorkflow?.updatedAt || activeWorkflow?.createdAt,
              creator: creatorIdentity,
              owner: ownerIdentity,
              ownerOptions: activeMetronomeOwnerOptions,
              onOwnerTransfer: canTransferActiveMetronomeOwnership
                ? transferActiveMetronomeOwnership
                : undefined,
              ownerSelectorProps: {
                resourceLabel: "workflow",
                open: metronomeOwnerSelectorOpen,
                onOpenChange: handleActiveMetronomeOwnerSelectorOpenChange,
                loading: metronomeOwnerCandidateState.status === "loading"
                  || metronomeOwnerTransferState.status === "loading",
                disabled: metronomeOwnerTransferState.status === "loading",
                loadingContent: metronomeOwnerTransferState.status === "loading"
                  ? "Transferring ownership..."
                  : "Loading organization members...",
                emptyContent: metronomeOwnerCandidateState.status === "error"
                  ? metronomeOwnerCandidateState.message || "Workflow owners could not be loaded."
                  : "No active organization members are available.",
              },
              scope: {
                values: selectedProjectScopeIds,
                options: metronomeProjectIdentities.map((project) => ({
                  value: project.id,
                  label: project.name,
                  leading: React.createElement(PlatformProjectIdentityIcon, {
                    icon: project.icon,
                    size: 14,
                    strokeWidth: 1.8,
                    style: { color: project.color },
                  }),
                })),
                onValuesChange: persistMetronomeWorkflowProjectScope,
                ariaLabel: "Choose workflow scope",
                title: projectScopeError || undefined,
                disabled: isActiveWorkflowBuiltIn || isUpdatingProjectScope,
                loading: isUpdatingProjectScope,
                loadingContent: "Updating workflow scope...",
              },
              primaryActions: [{
                id: "run",
                label: isTriggeringMetronomeRun ? "Starting..." : "Run",
                disabled: isRunTriggerDisabled || isTriggeringMetronomeRun,
                onSelect: openManualMetronomeRunDialog,
              }],
            };
            const settingsAccess = React.createElement(MetronomeWorkflowAccessSettings, {
              workflow,
              workspaceTeams: metronomeShareTeams,
              disabled: isActiveWorkflowBuiltIn
                || (isActiveWorkflowTeamShared && !isActiveWorkflowTeamSharedManageable),
              onMetadataChange: persistMetronomeWorkflowAccessMetadata,
              onAddTeamShare: addMetronomeWorkflowTeamAccess,
              onRemoveTeamShare: removeMetronomeWorkflowTeamAccess,
              onPermissionDetailOpenChange: setIsMetronomeSettingsAccessDetailOpen,
            });
            return React.createElement(PlatformServiceDetailFrame, {
                className: "playground-metronome-settings-frame",
              },
              React.createElement(PlatformServiceDetailPage, {
                  settings: {
                    identity: {
                      icon: React.createElement(Metronome, {
                        width: 24,
                        height: 24,
                        strokeWidth: 1.8,
                      }),
                      title: String(workflow.name || "Untitled Metronome"),
                      description: String(workflow.description || ""),
                      titlePlaceholder: "Workflow name",
                      descriptionPlaceholder: "Describe what this workflow orchestrates",
                      titleAriaLabel: "Workflow name",
                      descriptionAriaLabel: "Workflow description",
                      readOnly: true,
                      className: "playground-metronome-settings-identity",
                      iconClassName: "playground-metronome-settings-identity-icon",
                    },
                    details: settingsDetails,
                    location: React.createElement(PlatformDeploymentMap, {
                      regionCode: deploymentRegion,
                      title: "Deployment region",
                      className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map playground-metronome-deployment-map",
                    }),
                    additionalSections: budgetSettings,
                    access: settingsAccess,
                    accessDetailOpen: isMetronomeSettingsAccessDetailOpen,
                    ariaLabel: (workflow.name || "Metronome") + " settings",
                    detailsSidebarAriaLabel: "Metronome workflow information",
                    className: "playground-metronome-settings-content",
                  },
                  ariaLabel: (workflow.name || "Metronome") + " settings",
                  className: "playground-metronome-settings-page",
                }
              )
            );
          };

          const renderRunsMode = () => {
            const inlineRun = metronomeRunInlineDetailId
              ? metronomeRuns.find((run) => run.id === metronomeRunInlineDetailId) || null
              : null;
            if (metronomeRunInlineDetailId) {
              return renderMetronomeInlineRunDetail(inlineRun);
            }
            const normalizedRunSearchQuery = String(metronomeRunSearchQuery || "").trim().toLowerCase();
            const getRunStatusId = (run) => {
              const status = String(run?.status || "completed").trim().toLowerCase();
              if (!status) return "completed";
              if (status === "queued" || status === "pending" || status === "running" || status === "in_progress") return "running";
              if (status === "error" || status === "failed") return "failed";
              if (status === "succeeded" || status === "success") return "completed";
              return status;
            };
            const getRunStartedTimestamp = (run) => {
              const parsed = Date.parse(run?.startedAt || run?.createdAt || run?.updatedAt || "");
              return Number.isFinite(parsed) ? parsed : 0;
            };
            const getRunStepsCount = (run) => (run?.output?.steps || []).length || 0;
            const getRunThreadsCount = (run) => (run?.output?.threads || []).length || 0;
            const getMetronomeRunKindLabel = (run) => {
              const kind = String(run?.runKind || "workflow").trim().toLowerCase();
              if (kind === "node_test") return "Node test";
              if (kind === "slice_test") return "Slice test";
              return "Workflow run";
            };
            const isTriggeringMetronomeRun = metronomeRunState.status === "loading";
            const isRunTriggerDisabled = !activeWorkflow?.id || isMetronomeWorkflowBuiltIn(activeWorkflow);
            const creatorIdentity = resolveMetronomeWorkflowCreatorPresentation(activeWorkflow, {
              isBuiltIn: isMetronomeWorkflowBuiltIn(activeWorkflow),
            });
            const ownerIdentity = resolveMetronomeWorkflowOwnerPresentation(activeWorkflow, {
              isBuiltIn: isMetronomeWorkflowBuiltIn(activeWorkflow),
              isTeamShared: isActiveWorkflowTeamShared,
            });
            const activeRunFilter = METRONOME_RUN_FILTER_OPTIONS.find((option) => option.id === metronomeRunFilter) || METRONOME_RUN_FILTER_OPTIONS[0];
            const visibleMetronomeRunRows = metronomeRuns
              .filter((run) => {
                const statusId = getRunStatusId(run);
                if (metronomeRunFilter !== "all" && statusId !== metronomeRunFilter) return false;
                if (!normalizedRunSearchQuery) return true;
                const haystack = [
                  getMetronomeRunPrompt(run),
                  run?.id,
                  getMetronomeRunKindLabel(run),
                  run?.invocationSource,
                  statusId,
                  formatMetronomeRunTimestamp(run?.createdAt),
                ].map((value) => String(value || "").toLowerCase()).join(" ");
                return haystack.includes(normalizedRunSearchQuery);
              })
              .sort((left, right) => {
                if (metronomeRunSort === "run") {
                  return getMetronomeRunPrompt(left).localeCompare(getMetronomeRunPrompt(right), undefined, { sensitivity: "base" });
                }
                if (metronomeRunSort === "status") {
                  const statusDelta = getRunStatusId(left).localeCompare(getRunStatusId(right), undefined, { sensitivity: "base" });
                  if (statusDelta) return statusDelta;
                }
                if (metronomeRunSort === "steps") {
                  const stepsDelta = getRunStepsCount(right) - getRunStepsCount(left);
                  if (stepsDelta) return stepsDelta;
                }
                return getRunStartedTimestamp(right) - getRunStartedTimestamp(left);
              });
            const visibleMetronomeRunIds = visibleMetronomeRunRows
              .map((run) => String(run?.id || "").trim())
              .filter(Boolean);
            const selectedVisibleMetronomeRunIds = visibleMetronomeRunIds
              .filter((runId) => selectedMetronomeRunIds.has(runId));
            const allVisibleMetronomeRunsSelected = visibleMetronomeRunIds.length > 0
              && selectedVisibleMetronomeRunIds.length === visibleMetronomeRunIds.length;
            const openMetronomeRunFullScreen = (runId) => {
              const normalizedRunId = String(runId || "").trim();
              if (!normalizedRunId) return;
              setSelectedNodeId("");
              setIsMetronomeVersionHistorySidebarOpen(false);
              setMetronomeRunToolbarPopover("");
              setMetronomeRunActionMenu(null);
              setSelectedMetronomeRunId(normalizedRunId);
              setMetronomeRunInlineDetailId(normalizedRunId);
            };
            const getMetronomeRunActionTargetIds = (runId) => {
              const normalizedRunId = String(runId || "").trim();
              const selectedIds = Array.from(selectedMetronomeRunIds || [])
                .map((id) => String(id || "").trim())
                .filter((id) => id && metronomeRuns.some((run) => String(run?.id || "").trim() === id));
              if (normalizedRunId && selectedMetronomeRunIds.has(normalizedRunId) && selectedIds.length > 1) {
                return selectedIds;
              }
              return normalizedRunId ? [normalizedRunId] : [];
            };
            const removeMetronomeRunsLocally = (runIds) => {
              const deletedIdSet = new Set((Array.isArray(runIds) ? runIds : []).map((id) => String(id || "").trim()).filter(Boolean));
              if (!deletedIdSet.size) return;
              setMetronomeRuns((current) => current.filter((run) => !deletedIdSet.has(String(run?.id || "").trim())));
              setSelectedMetronomeRunIds((current) => {
                const next = new Set(current || []);
                deletedIdSet.forEach((runId) => next.delete(runId));
                return next;
              });
              setSelectedMetronomeRunId((current) => deletedIdSet.has(String(current || "").trim()) ? "" : current);
              setMetronomeRunInlineDetailId((current) => deletedIdSet.has(String(current || "").trim()) ? "" : current);
            };
            const deleteMetronomeRunsByIds = (runIds) => {
              const targetIds = Array.from(new Set((Array.isArray(runIds) ? runIds : [])
                .map((id) => String(id || "").trim())
                .filter(Boolean)));
              if (!targetIds.length) return;
              setMetronomeRunActionMenu(null);
              const confirmed = window.confirm("Delete " + (targetIds.length > 1 ? targetIds.length + " Metronome runs" : "this Metronome run") + "?");
              if (!confirmed) return;
              setMetronomeRunState({ status: "loading", message: "Deleting run" + (targetIds.length > 1 ? "s" : "") + "..." });
              void Promise.allSettled(targetIds.map(async (runId) => {
                const run = metronomeRuns.find((item) => String(item?.id || "").trim() === runId) || null;
                const workflowId = String(run?.metronomeId || activeWorkflow?.id || "").trim();
                if (workflowId && runId) {
                  try {
                    await deleteMetronomeRunApi(workflowId, runId);
                  } catch (error) {
                    if (error?.status !== 404 && error?.status !== 405) {
                      throw error;
                    }
                  }
                }
                return runId;
              })).then((results) => {
                const deletedIds = results
                  .filter((result) => result.status === "fulfilled")
                  .map((result) => result.value)
                  .filter(Boolean);
                if (deletedIds.length) {
                  removeMetronomeRunsLocally(deletedIds);
                }
                const failed = results.find((result) => result.status === "rejected");
                if (failed) {
                  setMetronomeRunState({
                    status: "error",
                    message: failed.reason instanceof Error ? failed.reason.message : "Failed to delete one or more runs.",
                  });
                } else {
                  setMetronomeRunState({ status: "idle", message: "" });
                }
              });
            };
            const metronomeRunColumns = [
              {
                id: "run",
                header: "Run ID",
                accessor: (run) => String(run?.id || ""),
                sortable: true,
                width: "minmax(260px, 1.6fr)",
                cell: ({ row: run }) => React.createElement(
                  "div",
                  { className: "playground-metronome-table-main" },
                  React.createElement("span", { className: "playground-metronome-table-title" }, run.id || "Draft run"),
                  React.createElement("span", { className: "playground-metronome-table-subtitle" },
                    getMetronomeRunKindLabel(run)
                    + (run?.invocationSource ? " · " + String(run.invocationSource).replaceAll("_", " ") : "")
                  ),
                ),
              },
              {
                id: "recent",
                header: "Started",
                accessor: getRunStartedTimestamp,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(130px, 0.78fr)",
                cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, formatMetronomeRunTimestamp(run.createdAt)),
              },
              {
                id: "steps",
                header: "Steps",
                accessor: getRunStepsCount,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(80px, 0.42fr)",
                align: "end",
                hideBelow: 650,
                cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, String(getRunStepsCount(run))),
              },
              {
                id: "threads",
                header: "Threads",
                accessor: getRunThreadsCount,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(85px, 0.45fr)",
                align: "end",
                hideBelow: 760,
                cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, String(getRunThreadsCount(run))),
              },
              {
                id: "status",
                header: "Status",
                accessor: getRunStatusId,
                sortable: true,
                width: "minmax(105px, 0.58fr)",
                cell: ({ row: run }) => renderMetronomeRunStatusLabel(getRunStatusId(run)),
              },
            ];
            const metronomeRunsPlatformTable = React.createElement(PlatformDataTable, {
              rows: visibleMetronomeRunRows,
              columns: metronomeRunColumns,
              getRowId: (run) => String(run?.id || ""),
              ariaLabel: "Metronome runs",
              className: "playground-metronome-runs-platform-data-table",
              surface: "plain",
              variant: "minimalistic-ui",
              sticky: false,
              pagination: {},
              sorting: {
                value: { id: metronomeRunSort, direction: metronomeRunSortDirection },
                onChange: (next) => {
                  if (!next) {
                    setMetronomeRunSort("recent");
                    setMetronomeRunSortDirection("desc");
                    return;
                  }
                  setMetronomeRunSort(next.id);
                  setMetronomeRunSortDirection(next.direction);
                },
              },
              selection: {
                enabled: true,
                value: selectedMetronomeRunIds,
                onChange: ({ selectedIds }) => setSelectedMetronomeRunIds(new Set(selectedIds)),
                ariaLabel: (run) => "Select run " + String(run?.id || ""),
              },
              toolbar: {
                title: "Runs",
                search: {
                  value: metronomeRunSearchQuery,
                  onChange: setMetronomeRunSearchQuery,
                  placeholder: "Search runs",
                  manual: true,
                },
                filters: [{
                  id: "run-status",
                  label: "Filter",
                  value: metronomeRunFilter,
                  onChange: setMetronomeRunFilter,
                  options: METRONOME_RUN_FILTER_OPTIONS,
                }],
              },
              onRowActivate: (run) => openMetronomeRunFullScreen(run.id),
              getRowActions: () => [{
                id: "delete",
                label: "Delete",
                icon: Trash2,
                danger: true,
                onSelect: ({ rows }) => deleteMetronomeRunsByIds(rows.map((run) => run.id)),
                selectedRows: {
                  label: "Delete selected",
                  danger: true,
                  onSelect: ({ rows }) => deleteMetronomeRunsByIds(rows.map((run) => run.id)),
                },
              }],
              loading: isLoadingMetronomeRuns,
              error: metronomeRunsError
                ? React.createElement("div", { className: "playground-metronome-table-main" },
                    React.createElement("div", { className: "playground-metronome-table-title" }, "Runs unavailable"),
                    React.createElement("div", { className: "playground-metronome-table-subtitle" }, metronomeRunsError)
                  )
                : null,
              emptyState: React.createElement("div", { className: "playground-metronome-table-main" },
                React.createElement("div", { className: "playground-metronome-table-title" }, metronomeRuns.length ? "No matching runs" : "No runs yet"),
                React.createElement("div", { className: "playground-metronome-table-subtitle" }, metronomeRuns.length ? "Try a different search term or filter." : "Published runs will appear here.")
              ),
              noResultsState: "No matching runs.",
            });
            const metronomeRunsDetailsSidebar = React.createElement(PlatformResourceDetailSidebar, {
                className: "playground-metronome-runs-sidebar",
                propertiesClassName: "playground-metronome-runs-property-list",
                attributes: [{
                  id: "updated",
                  label: "Updated",
                  value: formatMetronomeRunTimestamp(activeWorkflow?.updatedAt || activeWorkflow?.createdAt),
                }],
                creator: creatorIdentity,
                owner: ownerIdentity,
                primaryAction: React.createElement(PlatformPrimaryButton, {
                    size: "small",
                    fullWidth: true,
                    className: "playground-metronome-runs-trigger-button",
                    disabled: isRunTriggerDisabled || isTriggeringMetronomeRun,
                    onClick: openManualMetronomeRunDialog,
                  },
                  isTriggeringMetronomeRun ? "Starting..." : "Run"
                ),
              });
            return React.createElement("div", { className: "playground-metronome-runs-view" },
              React.createElement("div", { className: "playground-metronome-runs-layout" },
                React.createElement("section", {
                    className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-team-grid-table-section playground-metronome-runs-table-section",
                  },
                  metronomeRunsPlatformTable
                ),
                metronomeRunsDetailsSidebar
              )
            );
          };

`;
