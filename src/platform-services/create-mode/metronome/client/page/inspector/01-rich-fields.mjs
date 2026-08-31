export const METRONOME_INSPECTOR_01_FRAGMENT = String.raw`
          const renderInspector = () => {
            if (!selectedNode) return null;
            const kind = selectedNode.data?.kind || "action";
            const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
            const config = selectedNode.data?.config || {};
            const subtype = selectedNode.data?.subtype || meta.subtypes[0]?.id || "";
            const selectedConditionType = kind === "condition"
              ? normalizeMetronomeConditionType(config.conditionType || subtype)
              : "";
            const selectedLoopType = kind === "loop"
              ? normalizeMetronomeLoopType(config.loopType || subtype)
              : "";
            const selectedFunctionInvokeState = metronomeFunctionInvokeState.nodeId === selectedNodeId
              ? metronomeFunctionInvokeState
              : { nodeId: selectedNodeId || "", status: "idle", error: "", resultText: "" };
            const conditionBranches = kind === "condition"
              ? normalizeMetronomeConditionBranches(config.conditions, selectedConditionType)
              : [];
            const editableConditionBranchCount = conditionBranches.filter((branch) => branch.id !== "else").length;
            const canEditConditionBranches = selectedConditionType === "previous_output_contains" || selectedConditionType === "json";
            const canAddConditionBranches = canEditConditionBranches;
            const updateConditionBranch = (branchId, patch) => {
              const nextBranches = normalizeMetronomeConditionBranches(conditionBranches.map((branch) => branch.id === branchId
                ? { ...branch, ...(patch || {}) }
                : branch
              ), selectedConditionType);
              updateSelectedNodeConfigPatch({ conditions: nextBranches });
            };
            const addConditionBranch = () => {
              if (!canAddConditionBranches) return;
              const elseBranch = conditionBranches.find((branch) => branch.id === "else") || { id: "else", label: "Else", rule: "" };
              const branchesBeforeElse = conditionBranches.filter((branch) => branch.id !== "else");
              const nextBranches = normalizeMetronomeConditionBranches([
                ...branchesBeforeElse,
                { id: createMetronomeConditionBranchId(), label: "", rule: "" },
                elseBranch,
              ], selectedConditionType);
              updateSelectedNodeConfigPatch({ conditions: nextBranches });
            };
            const removeConditionBranch = (branchId) => {
              if (!canEditConditionBranches || branchId === "else" || editableConditionBranchCount <= 1) return;
              updateSelectedNodeConfigPatch({
                conditions: normalizeMetronomeConditionBranches(
                  conditionBranches.filter((branch) => branch.id !== branchId),
                  selectedConditionType
                ),
              });
            };
            const selectedTriggerType = kind === "trigger"
              ? String(config.triggerType || subtype || "thread_event").trim() || "thread_event"
              : "";
            const normalizedThreadCommand = (value) => {
              return normalizeMetronomeThreadTriggerCommand(value) || "@";
            };
            const closeMetronomeDynamicContentPicker = () => {
              setMetronomeDynamicContentPicker({ fieldKey: "", query: "", anchorPoint: null });
            };
            const getMetronomeInspectorPickerAnchorPoint = (event) => {
              const trigger = event?.currentTarget;
              const inspector = trigger?.closest?.(".playground-metronome-node-inspector");
              const inspectorRect = inspector?.getBoundingClientRect?.();
              if (!inspectorRect) return null;
              return {
                x: inspectorRect.left,
                y: inspectorRect.top,
              };
            };
            const insertMetronomeRichFieldText = (fieldKey, insertion, options = {}) => {
              const textarea = promptExtensionTextareaRef.current;
              const current = String(config[fieldKey] || "");
              const start = typeof textarea?.selectionStart === "number" ? textarea.selectionStart : current.length;
              const end = typeof textarea?.selectionEnd === "number" ? textarea.selectionEnd : current.length;
              const replacement = String(insertion || "");
              if (!replacement) return;
              const nextValue = current.slice(0, start) + replacement + current.slice(end);
              const nextSelectionStart = start + Number(options.selectionStartOffset ?? replacement.length);
              const nextSelectionEnd = start + Number(options.selectionEndOffset ?? options.selectionStartOffset ?? replacement.length);
              updateSelectedNodeConfig(fieldKey, nextValue);
              setActiveMetronomeRichTextField(fieldKey);
              window.setTimeout(() => {
                if (!textarea) return;
                textarea.focus();
                textarea.setSelectionRange(
                  Math.max(0, Math.min(nextValue.length, nextSelectionStart)),
                  Math.max(0, Math.min(nextValue.length, nextSelectionEnd))
                );
                if (typeof resizeTaskDescriptionTextarea === "function") {
                  resizeTaskDescriptionTextarea(textarea);
                }
              }, 0);
            };
            const handleMetronomeRichFieldFormat = (fieldKey, formatType) => {
              const textarea = promptExtensionTextareaRef.current;
              const current = String(config[fieldKey] || "");
              const start = typeof textarea?.selectionStart === "number" ? textarea.selectionStart : current.length;
              const end = typeof textarea?.selectionEnd === "number" ? textarea.selectionEnd : current.length;
              const selected = current.slice(start, end);
              let before = "";
              let after = "";
              let fallbackText = "text";
              if (formatType === "bold") {
                before = "**";
                after = "**";
                fallbackText = "important context";
              } else if (formatType === "italic") {
                before = "_";
                after = "_";
                fallbackText = "context";
              } else if (formatType === "underline") {
                before = "<u>";
                after = "</u>";
                fallbackText = "context";
              } else if (formatType === "list") {
                before = current && !current.endsWith("\n") ? "\n- " : "- ";
                fallbackText = "instruction";
              }
              const replacement = selected || fallbackText;
              insertMetronomeRichFieldText(fieldKey, before + replacement + after, {
                selectionStartOffset: before.length,
                selectionEndOffset: before.length + replacement.length,
              });
            };
            const openMetronomeDynamicContentPicker = (fieldKey, event) => {
              event.preventDefault();
              event.stopPropagation();
              if (metronomeDynamicContentPicker.fieldKey === fieldKey) {
                closeMetronomeDynamicContentPicker();
                return;
              }
              setActiveMetronomeRichTextField(fieldKey);
              closeMetronomeAttachmentPopover({ immediate: true });
              closeMetronomePromptPicker();
              setMetronomeDynamicContentPicker({
                fieldKey,
                query: "",
                anchorPoint: getMetronomeInspectorPickerAnchorPoint(event),
              });
              window.setTimeout(() => {
                const textarea = promptExtensionTextareaRef.current;
                if (!textarea) return;
                textarea.focus();
                if (typeof resizeTaskDescriptionTextarea === "function") {
                  resizeTaskDescriptionTextarea(textarea);
                }
              }, 0);
            };
            const insertMetronomeDynamicContentItem = (fieldKey, item) => {
              const token = String(item?.token || buildMetronomeDynamicContentToken(item) || "").trim();
              if (!token) return;
              insertMetronomeRichFieldText(fieldKey, token, {
                selectionStartOffset: token.length,
                selectionEndOffset: token.length,
              });
            };
            const openMetronomePromptPicker = (fieldKey, event) => {
              event.preventDefault();
              event.stopPropagation();
              if (metronomePromptPicker.fieldKey === fieldKey) {
                closeMetronomePromptPicker();
                return;
              }
              setActiveMetronomeRichTextField(fieldKey);
              closeMetronomeAttachmentPopover({ immediate: true });
              closeMetronomeDynamicContentPicker();
              setMetronomePromptPicker({
                fieldKey,
                query: "",
                selectingPromptId: "",
                anchorPoint: getMetronomeInspectorPickerAnchorPoint(event),
              });
            };
            const insertMetronomePromptItem = async (fieldKey, prompt) => {
              const promptId = String(prompt?.id || "").trim();
              if (!promptId) return;
              const selectionToken = metronomePromptSelectionTokenRef.current + 1;
              metronomePromptSelectionTokenRef.current = selectionToken;
              setMetronomePromptPicker((current) => ({
                ...current,
                selectingPromptId: promptId,
              }));
              setMetronomePromptPickerState((current) => ({ ...current, error: "" }));
              try {
                const resolvedPrompt = prompt?.hasInlineMarkdown
                  ? prompt
                  : await fetchMetronomePromptApi(promptId, {
                      backendUrl,
                      apiKey,
                      requestHeaders,
                    });
                if (metronomePromptSelectionTokenRef.current !== selectionToken) return;
                const markdown = String(resolvedPrompt?.markdown || "").trim();
                if (!markdown) {
                  throw new Error("This prompt does not contain any instructions yet.");
                }
                const currentValue = String(config[fieldKey] || "");
                const textarea = promptExtensionTextareaRef.current;
                const selectionStart = typeof textarea?.selectionStart === "number"
                  ? textarea.selectionStart
                  : currentValue.length;
                const selectionEnd = typeof textarea?.selectionEnd === "number"
                  ? textarea.selectionEnd
                  : selectionStart;
                const contentBeforeSelection = currentValue.slice(0, selectionStart);
                const contentAfterSelection = currentValue.slice(selectionEnd);
                const prefix = contentBeforeSelection && !/\n\s*$/.test(contentBeforeSelection) ? "\n\n" : "";
                const suffix = contentAfterSelection && !/^\s*\n/.test(contentAfterSelection) ? "\n\n" : "";
                const insertion = prefix + markdown + suffix;
                const caretOffset = prefix.length + markdown.length;
                insertMetronomeRichFieldText(fieldKey, insertion, {
                  selectionStartOffset: caretOffset,
                  selectionEndOffset: caretOffset,
                });
                closeMetronomePromptPicker();
              } catch (error) {
                if (metronomePromptSelectionTokenRef.current !== selectionToken) return;
                setMetronomePromptPicker((current) => ({
                  ...current,
                  selectingPromptId: "",
                }));
                setMetronomePromptPickerState((current) => ({
                  ...current,
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to insert this prompt.",
                }));
              }
            };
            const renderMetronomeFieldTooltip = (copy) => copy
              ? React.createElement(MetronomeInspectorInfoTooltip, {
                  ariaLabel: "More information",
                  description: copy,
                })
              : null;
            const renderMetronomeFieldTitle = (title, tooltip) => React.createElement(MetronomeInspectorFieldTitle, {
              title,
              tooltip: renderMetronomeFieldTooltip(tooltip),
            });
            const renderMetronomeInspectorSelect = ({
              id,
              value,
              options = [],
              onChange,
              placeholder = "Select...",
              searchPlaceholder = "Search options...",
              disabled = false,
            } = {}) => {
              const selectId = String(id || "").trim();
              return React.createElement(MetronomeInspectorSelect, {
                key: selectId,
                value,
                options,
                onValueChange: (nextValue, option) => {
                  if (typeof onChange === "function") onChange(nextValue, option);
                },
                ariaLabel: searchPlaceholder,
                placeholder,
                searchPlaceholder,
                className: "playground-metronome-select",
                disabled: disabled || !selectId,
                onOpenChange: (nextOpen) => {
                  if (!nextOpen) return;
                  closeMetronomeSchedulePopover({ immediate: true });
                },
              });
            };
            const renderMetronomeDataBindingSelect = ({
              title,
              tooltip = "",
              fieldKey = "inputBinding",
              fallback = "last.text",
              options = METRONOME_WORKFLOW_DATA_BINDING_OPTIONS,
              className = "",
            } = {}) => React.createElement(MetronomeInspectorField, { className },
              renderMetronomeFieldTitle(title || "Input binding", tooltip || "Choose which upstream workflow output this node should consume."),
              renderMetronomeInspectorSelect({
                id: "data-binding-" + fieldKey,
                value: normalizeMetronomeDataBinding(config[fieldKey] || config[fieldKey.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase())], fallback),
                options,
                onChange: (nextValue) => updateSelectedNodeConfig(fieldKey, nextValue),
                searchPlaceholder: "Select input...",
              })
            );
            const renderMetronomeJsonEditorField = ({ title, tooltip = "", fieldKey, value, path = "config.json" }) => React.createElement(MetronomeInspectorField, null,
              renderMetronomeFieldTitle(title, tooltip),
              React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                React.createElement(MetronomeGeneratedCodeEditor, {
                  file: { path, language: "json" },
                  value: value === undefined ? String(config[fieldKey] || "") : String(value || ""),
                  readOnly: isActiveWorkflowBuiltIn,
                  onChange: (nextValue) => updateSelectedNodeConfig(fieldKey, String(nextValue || "")),
                })
              )
            );
            const getMetronomeTriggerStatusLabel = (status) => {
              const normalized = String(status || "").trim().toLowerCase();
              if (normalized === "matched") return "Matched";
              if (normalized === "ignored") return "Ignored";
              if (normalized === "failed") return "Failed";
              if (normalized === "unauthorized") return "Unauthorized";
              return normalized ? normalized[0].toUpperCase() + normalized.slice(1) : "Unknown";
            };
            const handleTestMetronomeTrigger = () => {
              if (!activeWorkflow?.id) {
                setMetronomeTriggerTestState({ status: "error", message: "Save this Metronome before testing a trigger." });
                return;
              }
              if (!isMetronomeApiAvailable) {
                setMetronomeTriggerTestState({ status: "error", message: "Trigger tests require the backend API." });
                return;
              }
              const normalizedTriggerType = selectedTriggerType === "thread"
                ? "thread_event"
                : String(selectedTriggerType || "manual_test").trim() || "manual_test";
              const workflowIdForTest = String(activeWorkflow.id || "").trim();
              const definition = createMetronomeWorkflowDefinition(
                activeMetronomeEditorWorkflow || activeWorkflow,
                nodes,
                edges
              );
              setMetronomeTriggerTestState({ status: "loading", message: "Testing trigger..." });
              void testRunMetronomeWorkflowApi(workflowIdForTest, definition, {
                triggerType: normalizedTriggerType,
                inputs: {
                  source: "trigger_diagnostics",
                  prompt: "Trigger diagnostics test",
                  selectedNodeId: selectedNodeId || null,
                },
              })
                .then((run) => {
                  setIsMetronomeApiAvailable(true);
                  return run;
                })
                .then((run) => {
	                  const normalizedRun = normalizeMetronomeRun(run);
	                  setMetronomeRuns((current) => [normalizedRun, ...current.filter((item) => item.id !== normalizedRun.id)]);
	                  setSelectedMetronomeRunId(normalizedRun.id);
	                  setMetronomeEditorHighlightRunId(normalizedRun.id);
	                  setSelectedNodeId("");
	                  setMetronomeEditorMode("settings");
	                  setMetronomeRunInlineDetailId(normalizedRun.id);
	                  setMetronomeTriggerTestState({ status: "success", message: "Trigger test started." });
                  return fetchMetronomeTriggerEventsApi(workflowIdForTest, 20);
                })
                .then((items) => {
                  setMetronomeTriggerEvents(items);
                  setMetronomeTriggerEventsError("");
                })
                .catch((error) => {
                  setMetronomeTriggerTestState({ status: "error", message: error?.message || "Failed to test trigger." });
                });
            };
            const renderMetronomeTriggerDiagnostics = () => {
              const normalizedSelectedTriggerType = selectedTriggerType === "thread" ? "thread_event" : String(selectedTriggerType || "").trim();
              const eventsForTrigger = metronomeTriggerEvents.filter((event) => {
                const eventType = String(event?.triggerType || "").trim();
                if (!normalizedSelectedTriggerType) return true;
                return eventType === normalizedSelectedTriggerType
                  || (normalizedSelectedTriggerType === "thread_event" && eventType === "thread");
              });
              return React.createElement("div", { className: "playground-metronome-trigger-diagnostics" },
                React.createElement("div", { className: "playground-metronome-trigger-diagnostics-header" },
                  React.createElement("div", { className: "playground-metronome-trigger-diagnostics-title" }, "Trigger diagnostics"),
                  React.createElement("div", { className: "playground-metronome-trigger-diagnostics-actions" },
                    React.createElement("div", { className: "playground-metronome-trigger-diagnostics-meta" },
                      isLoadingMetronomeTriggerEvents ? "Loading" : eventsForTrigger.length ? eventsForTrigger.length + " recent" : "No events"
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-trigger-diagnostics-test",
                      disabled: metronomeTriggerTestState.status === "loading",
                      onClick: handleTestMetronomeTrigger,
                    }, metronomeTriggerTestState.status === "loading" ? "Testing" : "Test trigger")
                  )
                ),
                metronomeTriggerTestState.status === "error" && metronomeTriggerTestState.message
                  ? React.createElement("div", { className: "playground-metronome-trigger-diagnostics-empty is-error" }, metronomeTriggerTestState.message)
                  : null,
                metronomeTriggerEventsError
                  ? React.createElement("div", { className: "playground-metronome-trigger-diagnostics-empty is-error" }, metronomeTriggerEventsError)
                  : isLoadingMetronomeTriggerEvents
                    ? React.createElement("div", { className: "playground-metronome-trigger-diagnostics-empty" }, "Loading recent trigger events...")
                    : eventsForTrigger.length
                      ? React.createElement("div", { className: "playground-metronome-trigger-diagnostics-list" },
                          eventsForTrigger.slice(0, 5).map((event) => {
                            const status = String(event.status || "").toLowerCase();
                            const eventSummary = event.summary || event.reason || event.sourceEventId || "Received trigger event";
                            return React.createElement("div", { key: event.id, className: "playground-metronome-trigger-diagnostics-row" },
                              React.createElement("div", { className: "playground-metronome-trigger-diagnostics-row-top" },
                                React.createElement("span", { className: "playground-metronome-trigger-diagnostics-summary" }, eventSummary),
                                React.createElement("span", { className: "playground-metronome-trigger-diagnostics-status is-" + (status || "unknown") },
                                  getMetronomeTriggerStatusLabel(status)
                                )
                              ),
                              React.createElement("div", { className: "playground-metronome-trigger-diagnostics-row-meta" },
                                React.createElement("span", null, formatMetronomeDeploymentTimestamp(event.createdAt)),
                                event.runId
                                  ? React.createElement("button", {
                                      type: "button",
	                                      className: "playground-metronome-trigger-diagnostics-link",
	                                      onClick: () => {
	                                        setSelectedMetronomeRunId(event.runId);
	                                        setSelectedNodeId("");
	                                        setMetronomeEditorMode("settings");
	                                        setMetronomeRunInlineDetailId(event.runId);
	                                      },
                                    }, "Run " + event.runId.slice(0, 8))
                                  : React.createElement("span", null, event.reason || "No run")
                              )
                            );
                          })
                        )
                      : React.createElement("div", { className: "playground-metronome-trigger-diagnostics-empty" },
                          "No trigger events recorded for this trigger type yet."
                        )
              );
            };
            const renderMetronomeTriggerDiagnosticsModal = () => {
              if (!isMetronomeTriggerDiagnosticsModalOpen) return null;
              const modalElement = React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop playground-metronome-trigger-diagnostics-modal-backdrop",
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget) {
                    setIsMetronomeTriggerDiagnosticsModalOpen(false);
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  className: "playground-tasks-project-modal playground-metronome-trigger-diagnostics-modal",
                  onMouseDown: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("div", { className: "playground-tasks-project-modal-name-input" }, "Evaluate Node")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => setIsMetronomeTriggerDiagnosticsModalOpen(false),
                      title: "Close",
                      "aria-label": "Close diagnostics",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.9 }))
                  ),
                  renderMetronomeTriggerDiagnostics()
                )
              );
              return typeof document !== "undefined" && typeof createPortal === "function"
                ? createPortal(modalElement, document.body)
                : modalElement;
            };
            const renderMetronomeDynamicContentPicker = (fieldKey, iconStrokeWidth = 1.9) => {
              const isOpen = metronomeDynamicContentPicker.fieldKey === fieldKey;
              const rawQuery = String(metronomeDynamicContentPicker.query || "").trim();
              const normalizedQuery = rawQuery.toLowerCase();
              const searchableGroups = metronomeDynamicContentGroups
                .map((group) => {
                  const groupSearchText = [
                    group.title,
                    group.subtitle,
                  ].join(" ").toLowerCase();
                  const items = (Array.isArray(group.items) ? group.items : []).filter((item) => {
                    if (!normalizedQuery) return true;
                    const itemSearchText = [
                      groupSearchText,
                      item.label,
                      item.path,
                      item.type,
                      item.description,
                      item.token,
                    ].join(" ").toLowerCase();
                    return itemSearchText.includes(normalizedQuery);
                  });
                  return items.length ? { ...group, items } : null;
                })
                .filter(Boolean);
              return React.createElement(MetronomeInspectorPickerPopup, {
                open: isOpen,
                title: "Dynamic content",
                description: "Insert outputs from upstream nodes or workflow context.",
                onClose: closeMetronomeDynamicContentPicker,
                showHeader: false,
                placement: "left-start",
                portalAnchorPoint: metronomeDynamicContentPicker.anchorPoint || null,
                rootClassName: "playground-metronome-dynamic-content-popup-shell",
                surfaceClassName: "playground-metronome-dynamic-content-picker",
                surfaceProps: {
                  "data-metronome-inspector-side": "left",
                },
                searchHeader: {
                  showSearchIcon: true,
                  value: metronomeDynamicContentPicker.query || "",
                  onChange: (event) => setMetronomeDynamicContentPicker((current) => ({
                    ...current,
                    query: event.target.value,
                  })),
                  placeholder: "Search outputs and context",
                  autoFocus: isOpen,
                  "aria-label": "Search dynamic content",
                },
                trigger: React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-detail-format-button playground-metronome-dynamic-content-trigger" + (isOpen ? " is-active" : ""),
                  title: "Insert dynamic content",
                  "aria-label": "Insert dynamic content",
                  "aria-haspopup": "dialog",
                  "aria-expanded": isOpen ? "true" : "false",
                  "aria-pressed": isOpen ? "true" : "false",
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: (event) => openMetronomeDynamicContentPicker(fieldKey, event),
                }, React.createElement(Zap, { width: 14, height: 14, strokeWidth: iconStrokeWidth })),
              },
                searchableGroups.length
                  ? React.createElement("div", { className: "playground-metronome-inspector-picker-list" },
                      searchableGroups.map((group) => React.createElement("div", {
                        key: group.id,
                        className: "playground-metronome-dynamic-content-group",
                      },
                        group.id === "workflow"
                          ? null
                          : React.createElement("div", { className: "playground-metronome-dynamic-content-group-heading" },
                              React.createElement("span", { className: "playground-metronome-dynamic-content-group-title" }, group.title),
                              group.subtitle
                                ? React.createElement("span", { className: "playground-metronome-dynamic-content-group-subtitle" }, group.subtitle)
                                : null
                            ),
                        group.items.map((item) => React.createElement(MetronomeInspectorPickerRow, {
                          key: group.id + ":" + item.path,
                          label: item.label || item.path,
                          description: item.token || item.path,
                          trailing: item.type || "value",
                          onMouseDown: (event) => event.preventDefault(),
                          onClick: () => insertMetronomeDynamicContentItem(fieldKey, item),
                          title: item.token || item.path,
                        }))
                      ))
                    )
                  : React.createElement(MetronomeInspectorPickerState, null,
                      normalizedQuery
                        ? "No matching dynamic content."
                        : "Connect an upstream node to expose its outputs here."
                    )
              );
            };
            const renderMetronomePromptPicker = (fieldKey, iconStrokeWidth = 1.9) => {
              const isOpen = metronomePromptPicker.fieldKey === fieldKey;
              const normalizedQuery = String(metronomePromptPicker.query || "").trim().toLowerCase();
              const prompts = (Array.isArray(metronomePromptPickerState.prompts)
                ? metronomePromptPickerState.prompts
                : []
              ).filter((prompt) => {
                if (!normalizedQuery) return true;
                return [prompt.name, prompt.description, prompt.id]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizedQuery);
              });
              const trigger = React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-format-button playground-metronome-prompt-picker-trigger" + (isOpen ? " is-active" : ""),
                title: "Insert prompt",
                "aria-label": "Insert prompt",
                "aria-haspopup": "dialog",
                "aria-expanded": isOpen ? "true" : "false",
                "aria-pressed": isOpen ? "true" : "false",
                onMouseDown: (event) => event.preventDefault(),
                onClick: (event) => openMetronomePromptPicker(fieldKey, event),
              }, React.createElement(MessageSquareText, { width: 14, height: 14, strokeWidth: iconStrokeWidth }));
              return React.createElement(MetronomeInspectorPickerPopup, {
                open: isOpen,
                title: "Prompts",
                description: "Insert a reusable prompt into these instructions.",
                onClose: closeMetronomePromptPicker,
                showHeader: false,
                placement: "left-start",
                portalAnchorPoint: metronomePromptPicker.anchorPoint || null,
                rootClassName: "playground-metronome-prompt-picker-popup-shell",
                surfaceClassName: "playground-metronome-prompt-picker",
                surfaceProps: {
                  "data-metronome-inspector-side": "left",
                },
                searchHeader: {
                  showSearchIcon: true,
                  autoFocus: isOpen,
                  value: metronomePromptPicker.query || "",
                  onChange: (event) => setMetronomePromptPicker((current) => ({
                    ...current,
                    query: event.target.value,
                  })),
                  placeholder: "Search prompts",
                  "aria-label": "Search prompts",
                },
                trigger,
              },
                metronomePromptPickerState.status === "loading"
                  ? React.createElement(MetronomeInspectorPickerState, { className: "playground-metronome-prompt-picker-state" },
                      React.createElement(Loader2, { className: "is-spinning", width: 15, height: 15, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Loading prompts...")
                    )
                  : prompts.length
                    ? React.createElement("div", { className: "playground-metronome-inspector-picker-list" },
                        metronomePromptPickerState.error
                          ? React.createElement("div", { className: "playground-metronome-prompt-picker-error" }, metronomePromptPickerState.error)
                          : null,
                        prompts.map((prompt) => {
                          const isSelecting = metronomePromptPicker.selectingPromptId === prompt.id;
                          return React.createElement(MetronomeInspectorPickerRow, {
                            key: prompt.id,
                            className: "playground-metronome-prompt-picker-row" + (isSelecting ? " is-loading" : ""),
                            label: prompt.name,
                            description: prompt.description || "Reusable prompt",
                            trailing: isSelecting
                              ? React.createElement(Loader2, { className: "is-spinning", width: 11, height: 11, strokeWidth: 1.9 })
                              : "Prompt",
                            disabled: Boolean(metronomePromptPicker.selectingPromptId),
                            onMouseDown: (event) => event.preventDefault(),
                            onClick: () => void insertMetronomePromptItem(fieldKey, prompt),
                            title: prompt.name,
                          });
                        })
                      )
                    : React.createElement(MetronomeInspectorPickerState, { className: "playground-metronome-prompt-picker-state" },
                        metronomePromptPickerState.error
                          || (normalizedQuery ? "No matching prompts." : "No prompts are available yet.")
                      )
              );
            };
            const renderMetronomeRichTextField = ({ fieldKey, title, placeholder, tooltip, description, isInstructionsField: forceInstructionsField = false }) => {
              const fieldValue = String(config[fieldKey] || "");
              const isEditing = activeMetronomeRichTextField === fieldKey;
              const isInstructionsField = forceInstructionsField
                || fieldKey === "promptExtension"
                || (kind === "action" && fieldKey === "message");
              const supportsMetronomeAttachments = isInstructionsField
                || (kind === "action" && fieldKey === "message")
                || (kind === "imagine" && fieldKey === "prompt");
              const hasMetronomeAttachments = Array.isArray(config.attachments) && config.attachments.length > 0;
              const focusRichTextarea = () => {
                setActiveMetronomeRichTextField(fieldKey);
                window.setTimeout(() => {
                  const textarea = promptExtensionTextareaRef.current;
                  if (!textarea) return;
                  textarea.focus();
                  const valueLength = String(textarea.value || "").length;
                  textarea.setSelectionRange(valueLength, valueLength);
                }, 0);
              };
              const syncMetronomeInstructionsHighlightScroll = (event) => {
                const editor = event.currentTarget?.parentElement;
                const highlight = editor?.querySelector?.(".playground-metronome-instructions-highlight");
                if (!highlight) return;
                highlight.scrollTop = event.currentTarget.scrollTop;
                highlight.scrollLeft = event.currentTarget.scrollLeft;
              };
              const renderMetronomeInstructionsHighlight = (value) => {
                const text = String(value || "");
                const parts = text ? text.split(/(\{\{[\s\S]*?\}\})/g) : [""];
                return React.createElement("div", {
                  className: "playground-metronome-instructions-highlight",
                  "aria-hidden": "true",
                },
                  parts.map((part, index) => {
                    const isDynamicToken = /^\{\{[\s\S]*\}\}$/.test(part);
                    return React.createElement("span", {
                      key: index,
                      className: isDynamicToken ? "playground-metronome-instructions-highlight-token" : undefined,
                    }, part);
                  })
                );
              };
              const renderMetronomeAttachmentTrigger = () => {
                if (!supportsMetronomeAttachments) return null;
                const isAttachmentPopoverOpenForField = isMetronomeAttachmentPopoverOpen
                  && activeMetronomeRichTextField === fieldKey;
                const trigger = React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-format-button playground-metronome-instructions-attachments-trigger"
                      + (isAttachmentPopoverOpenForField ? " is-active" : "")
                      + (hasMetronomeAttachments ? " has-attachments" : ""),
                    title: "Attachments",
                    "aria-label": "Attachments",
                    "aria-expanded": isAttachmentPopoverOpenForField ? "true" : "false",
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: (event) => {
                      event.stopPropagation();
                      setActiveMetronomeRichTextField(fieldKey);
                      closeMetronomeDynamicContentPicker();
                      closeMetronomePromptPicker();
                      if (isAttachmentPopoverOpenForField && !isMetronomeAttachmentPopoverClosing) {
                        closeMetronomeAttachmentPopover();
                        return;
                      }
                      if (metronomeAttachmentPopoverCloseTimerRef.current && typeof window !== "undefined") {
                        window.clearTimeout(metronomeAttachmentPopoverCloseTimerRef.current);
                        metronomeAttachmentPopoverCloseTimerRef.current = null;
                      }
                      setIsMetronomeAttachmentPopoverClosing(false);
                      setIsMetronomeAttachmentPopoverOpen(true);
                    },
                  }, React.createElement(Paperclip, { width: 14, height: 14, strokeWidth: 1.9 }));
                return React.createElement(MetronomeInspectorToolbarPopup, {
                  open: isAttachmentPopoverOpenForField,
                  animation: isMetronomeAttachmentPopoverClosing ? "down-out" : "down-in",
                  rootClassName: "playground-metronome-instructions-attachments-shell",
                  surfaceClassName: "playground-metronome-instructions-attachments-popover",
                  surfaceProps: {
                    role: "dialog",
                    "aria-label": "Attachments",
                    width: "min(330px, calc(100vw - 32px))",
                    maxHeight: "min(430px, calc(100dvh - 24px))",
                    onMouseDown: (event) => event.stopPropagation(),
                    onPointerDown: (event) => event.stopPropagation(),
                    onClick: (event) => event.stopPropagation(),
                  },
                  trigger,
                },
                  renderThreadAttachments({ borderless: true, buttonLabel: "Upload from Computer" })
                );
              };
              if (isInstructionsField) {
                return React.createElement("div", { className: "playground-tasks-detail-description playground-metronome-instructions-field" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title playground-metronome-prompt-title-row" },
                      React.createElement("span", null, title),
                      renderMetronomeFieldTooltip(tooltip)
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                      renderMetronomeAttachmentTrigger(),
                      renderMetronomeDynamicContentPicker(fieldKey),
                      renderMetronomePromptPicker(fieldKey)
                    )
                  ),
                  description
                    ? React.createElement("p", { className: "playground-tasks-detail-description-help" }, description)
                    : null,
                  React.createElement("div", {
                    className: "playground-tasks-detail-description-editor is-editing",
                    onMouseDown: (event) => {
                      if (event.target && event.target.tagName === "TEXTAREA") return;
                      event.preventDefault();
                      focusRichTextarea();
                    },
                  },
                    renderMetronomeInstructionsHighlight(fieldValue),
                    React.createElement(MetronomeInspectorTextarea, {
                      ref: promptExtensionTextareaRef,
                      className: "playground-tasks-detail-description-input is-editing has-dynamic-highlight",
                      rows: 4,
                      placeholder,
                      value: fieldValue,
                      onFocus: () => setActiveMetronomeRichTextField(fieldKey),
                      onChange: (event) => updateSelectedNodeConfig(fieldKey, event.target.value),
                      onScroll: syncMetronomeInstructionsHighlightScroll,
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                    })
                  )
                );
              }
              return React.createElement("div", { className: "playground-tasks-detail-description" },
                React.createElement("div", { className: "playground-tasks-detail-section-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title playground-metronome-prompt-title-row" },
                    React.createElement("span", null, title),
                    renderMetronomeFieldTooltip(tooltip)
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                    renderMetronomeAttachmentTrigger(),
                    renderMetronomeDynamicContentPicker(fieldKey, 2),
                    [
                      { id: "bold", label: "Bold", icon: Bold },
                      { id: "italic", label: "Italic", icon: Italic },
                      { id: "underline", label: "Underline", icon: Underline },
                      { id: "list", label: "List", icon: List },
                    ].map((action) => {
                      const ActionIcon = action.icon;
                      return React.createElement("button", {
                        key: action.id,
                        type: "button",
                        className: "playground-tasks-detail-format-button",
                        title: action.label,
                        "aria-label": action.label,
                        onMouseDown: (event) => event.preventDefault(),
                        onClick: () => handleMetronomeRichFieldFormat(fieldKey, action.id),
                      }, React.createElement(ActionIcon, { width: 14, height: 14, strokeWidth: 1.8 }));
                    })
                  )
                ),
                description
                  ? React.createElement("p", { className: "playground-tasks-detail-description-help" }, description)
                  : null,
                React.createElement("div", {
                  className: "playground-tasks-detail-description-editor" + (isEditing ? " is-editing" : " is-preview"),
                  onMouseDown: (event) => {
                    if (event.target && event.target.tagName === "TEXTAREA") {
                      return;
                    }
                    const textarea = event.currentTarget.querySelector("textarea");
                    if (!textarea) {
                      return;
                    }
                    event.preventDefault();
                    setActiveMetronomeRichTextField(fieldKey);
                    window.setTimeout(() => {
                      textarea.focus();
                      const valueLength = String(textarea.value || "").length;
                      textarea.setSelectionRange(valueLength, valueLength);
                      if (typeof resizeTaskDescriptionTextarea === "function") {
                        resizeTaskDescriptionTextarea(textarea);
                      }
                    }, 0);
                  },
                },
                  !isEditing
                    ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                        React.createElement("div", { className: "playground-tasks-detail-description-preview" },
                          fieldValue
                            ? React.createElement(PlaygroundTaskDescriptionMarkdown, { content: fieldValue })
                            : React.createElement("span", { className: "playground-tasks-detail-description-placeholder" }, placeholder)
                        )
                      )
                    : null,
                  React.createElement(MetronomeInspectorTextarea, {
                    ref: promptExtensionTextareaRef,
                    className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                    rows: 1,
                    placeholder: isEditing ? placeholder : "",
                    value: fieldValue,
                    onFocus: (event) => {
                      setActiveMetronomeRichTextField(fieldKey);
                      if (typeof resizeTaskDescriptionTextarea === "function") {
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      }
                    },
                    onChange: (event) => {
                      updateSelectedNodeConfig(fieldKey, event.target.value);
                      if (typeof resizeTaskDescriptionTextarea === "function") {
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      }
                    },
                    onBlur: () => setActiveMetronomeRichTextField(""),
                  })
                )
              );
            };
            const renderConditionHint = () => {
              if (selectedConditionType === "previous_output_contains") {
                return "Each branch checks whether the incoming input contains its substring. Default runs when nothing matches.";
              }
              if (selectedConditionType === "database_document_field") {
                return "Reads the selected document field and routes through True or False based on the operator.";
              }
              if (selectedConditionType === "ticket_status") {
                return "Checks the current status of a ticket in a project and routes through True or False.";
              }
              if (selectedConditionType === "json") {
                return "Evaluates branch rules against the accumulated workflow context. Use expressions such as input.0.summary contains 'ready'. Default runs when nothing matches.";
              }
              return "";
            };
            const renderMetronomeAgentSelector = (options = {}) => {
              const selectorTitle = String(options?.title || "Agent").trim() || "Agent";
              const selectedAgent = metronomeAgentOptions.find((option) => option.id === config.agentId)
                || defaultMetronomeAgentOption
                || metronomeAgentOptions[0]
                || null;
              const agentOptions = metronomeAgentOptions.map((agent) => {
                const agentName = agent.name || "Agent";
                return {
                  value: agent.id,
                  name: agentName,
                  avatarUrl: getMetronomeProfileImageUrl(agent),
                };
              });
              return React.createElement(MetronomeInspectorField, {
                className: "playground-metronome-inspector-selector-field playground-metronome-agent-selector-field",
              },
                renderMetronomeFieldTitle(selectorTitle),
                React.createElement(PlatformAgentSelector, {
                  value: selectedAgent?.id || config.agentId || "",
                  options: agentOptions,
                  placeholder: metronomeAgentOptions.length ? "Select agent" : "No agents available",
                  searchPlaceholder: "Select an agent...",
                  searchAriaLabel: "Select an agent",
                  ariaLabel: "Select workflow agent",
                  disabled: isActiveWorkflowBuiltIn || !metronomeAgentOptions.length,
                  onValueChange: (nextAgentId) => {
                    const nextAgent = metronomeAgentOptions.find((agent) => agent.id === nextAgentId) || null;
                    if (!nextAgent) return;
                    updateSelectedNodeConfigPatch({
                      agentId: nextAgent.id,
                      agentName: nextAgent.name || "",
                    });
                  },
                  alignment: "end",
                  popupAlignment: "right",
                  fullWidth: true,
                  popupWidth: "min(280px, calc(100vw - 48px))",
                  popupMaxWidth: "calc(100vw - 48px)",
                  popupMaxHeight: "min(320px, calc(100vh - 120px))",
                  className: "playground-metronome-select playground-metronome-inspector-central-selector playground-metronome-agent-central-selector",
                  triggerClassName: "playground-metronome-inspector-central-selector-trigger",
                  popupClassName: "playground-metronome-inspector-central-selector-popup playground-metronome-agent-selector-popup",
                  onOpenChange: (nextOpen) => {
                    if (nextOpen) closeMetronomeSchedulePopover({ immediate: true });
                  },
                  onKeyDown: stopMetronomeInputKeyPropagation,
                  onKeyUp: stopMetronomeInputKeyPropagation,
                })
              );
            };
            const renderMetronomeWorkspaceSelector = (options = {}) => {
              const selectorTitle = String(options?.title || "Computer").trim() || "Computer";
              const currentContextType = config.contextType === "project" ? "project" : "computer";
              const selectedProject = metronomeProjectOptions.find((option) => option.id === config.projectId) || null;
              const selectedEnvironment = metronomeComputerOptions.find((option) => option.id === config.environmentId)
                || (currentContextType === "computer" ? defaultMetronomeComputerOption : null)
                || null;
              const selectedWorkspaceValue = currentContextType === "project" && selectedProject
                ? "project:" + selectedProject.id
                : selectedEnvironment
                  ? "computer:" + selectedEnvironment.id
                  : "";
              const workspaceOptions = [
                ...metronomeComputerOptions.map((environment) => ({
                  id: "computer:" + environment.id,
                  label: environment.name || "Computer",
                  description: "Computer",
                })),
                ...metronomeProjectOptions.map((project) => {
                  const projectEnvironmentId = getMetronomeProjectEnvironmentId(project);
                  const projectEnvironment = metronomeComputerOptions.find((option) => option.id === projectEnvironmentId) || null;
                  return {
                    id: "project:" + project.id,
                    label: project.name || "Project",
                    description: projectEnvironment
                      ? "Project on " + (projectEnvironment.name || "linked computer")
                      : "Project without linked computer",
                  };
                }),
              ];
              return React.createElement(MetronomeInspectorField, {
                className: "playground-metronome-inspector-selector-field playground-metronome-workspace-selector-field",
              },
                renderMetronomeFieldTitle(selectorTitle),
                renderMetronomeInspectorSelect({
                  id: "thread-workspace-" + (selectedNodeId || "selected"),
                  value: selectedWorkspaceValue,
                  options: workspaceOptions,
                  placeholder: workspaceOptions.length ? "Select computer" : "No computers available",
                  searchPlaceholder: "Select a computer...",
                  disabled: isActiveWorkflowBuiltIn || !workspaceOptions.length,
                  onChange: (nextWorkspaceValue) => {
                    const [nextType, ...nextIdParts] = String(nextWorkspaceValue || "").split(":");
                    const nextId = nextIdParts.join(":");
                    if (nextType === "project") {
                      const nextProject = metronomeProjectOptions.find((project) => project.id === nextId) || null;
                      if (!nextProject) return;
                      const projectEnvironmentId = getMetronomeProjectEnvironmentId(nextProject);
                      if (!projectEnvironmentId) return;
                      const projectEnvironment = metronomeComputerOptions.find((option) => option.id === projectEnvironmentId) || null;
                      updateSelectedNodeConfigPatch({
                        contextType: "project",
                        resource: "project",
                        projectId: nextProject.id,
                        projectName: nextProject.name || "",
                        environmentId: projectEnvironmentId,
                        environmentName: projectEnvironment?.name || "",
                      });
                      return;
                    }
                    const nextEnvironment = metronomeComputerOptions.find((environment) => environment.id === nextId) || null;
                    if (!nextEnvironment) return;
                    updateSelectedNodeConfigPatch({
                      contextType: "computer",
                      resource: "computer",
                      projectId: "",
                      projectName: "",
                      environmentId: nextEnvironment.id,
                      environmentName: nextEnvironment.name || "",
                    });
                  },
                })
              );
            };
            const renderMetronomeScheduleSettings = () => {
              const scheduleConfig = buildDefaultMetronomeScheduleConfig(config);
              const isRecurring = scheduleConfig.scheduleType === "recurring";
              const scheduledLocalValue = toMetronomeDatetimeLocalValue(scheduleConfig.scheduledTime);
              const selectedPresetId = scheduleConfig.schedulePresetId || getMetronomeSchedulePresetId(scheduleConfig.cronExpression) || "daily";
              const scheduleSummaryLabel = formatMetronomeScheduleSummary(scheduleConfig);
              const updateSchedulePatch = (patch) => {
                updateSelectedNodeConfigPatch({
                  ...buildDefaultMetronomeScheduleConfig({
                    ...scheduleConfig,
                    ...patch,
                  }),
                  ...patch,
                });
              };
              const schedulePopoverContent = React.createElement("div", { className: "playground-metronome-schedule-popover-body" },
                      React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-attach-header playground-metronome-schedule-mode-section" },
                        React.createElement("div", { className: "tb-popup-nav" },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-nav-button" + (isRecurring ? "" : " active"),
                            onClick: () => updateSchedulePatch({
                              scheduleType: "one-time",
                              cronExpression: "",
                            }),
                          }, "One-time"),
                          React.createElement("button", {
                            type: "button",
                            className: "tb-popup-nav-button" + (isRecurring ? " active" : ""),
                            onClick: () => {
                              const nextPresetId = selectedPresetId || "daily";
                              updateSchedulePatch({
                                scheduleType: "recurring",
                                schedulePresetId: nextPresetId,
                                cronExpression: buildMetronomeCronExpressionForPreset(nextPresetId, scheduleConfig.scheduledTime || Date.now()),
                              });
                            },
                          }, "Recurring")
                        )
                      ),
                      React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced playground-metronome-schedule-fields" },
                        React.createElement("div", { className: "tb-popup-field-row" },
                          React.createElement("label", { className: "tb-popup-field-label" }, isRecurring ? "First run" : "Run at")
                        ),
                        React.createElement("div", { className: "tb-popup-select-wrap tb-popup-select-wrap-schedule" },
                          React.createElement(MetronomeInspectorInput, {
                            type: "datetime-local",
                            className: "tb-popup-select tb-popup-select-schedule playground-tasks-schedule-input",
                            value: scheduledLocalValue,
                            min: toMetronomeDatetimeLocalValue(new Date()),
                            onChange: (event) => {
                              const nextScheduledTime = fromMetronomeDatetimeLocalValue(event.target.value);
                              updateSchedulePatch({
                                scheduledTime: nextScheduledTime,
                                cronExpression: isRecurring
                                  ? buildMetronomeCronExpressionForPreset(selectedPresetId || "daily", nextScheduledTime || Date.now())
                                  : "",
                              });
                            },
                          })
                        ),
                        isRecurring
                          ? React.createElement(React.Fragment, null,
                              React.createElement("div", { className: "tb-popup-field-row tb-popup-field-row-followup" },
                                React.createElement("label", { className: "tb-popup-field-label" }, "Repeat")
                              ),
                              React.createElement("div", { className: "tb-popup-preset-list" },
                                METRONOME_SCHEDULE_PRESETS.map((preset) =>
                                  React.createElement("button", {
                                      key: preset.id,
                                      type: "button",
                                      className: "tb-popup-preset-row" + (selectedPresetId === preset.id ? " selected" : ""),
                                      onClick: () => updateSchedulePatch({
                                        scheduleType: "recurring",
                                        schedulePresetId: preset.id,
                                        cronExpression: buildMetronomeCronExpressionForPreset(preset.id, scheduleConfig.scheduledTime || Date.now()),
                                      }),
                                    },
                                    React.createElement("span", { className: "tb-popup-check-slot" },
                                      selectedPresetId === preset.id
                                        ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.75 })
                                        : null
                                    ),
                                    React.createElement("span", null, preset.label)
                                  )
                                )
                              )
                            )
                          : null
                      )
                    );
              return React.createElement("div", { className: "playground-metronome-schedule-settings playground-tasks-detail-facts playground-tasks-schedule-timing-card" + (isMetronomeSchedulePopoverOpen ? " is-popover-open" : "") },
                React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Schedule")
                ),
                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                  React.createElement("div", { className: "playground-tasks-detail-fact" },
`;
