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
              const rawValue = String(value || "").trim();
              if (!rawValue) return "@";
              return rawValue.startsWith("@") ? rawValue : "@" + rawValue;
            };
            const closeMetronomeDynamicContentPicker = () => {
              setMetronomeDynamicContentPicker({ fieldKey: "", query: "" });
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
              setIsMetronomeAgentSelectorOpen(false);
              setIsMetronomeWorkspaceSelectorOpen(false);
              setMetronomeDynamicContentPicker({
                fieldKey,
                query: "",
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
            const openMetronomeFieldTooltip = (copy, event) => {
              const nextCopy = String(copy || "").trim();
              const rect = event?.currentTarget?.getBoundingClientRect?.();
              if (!nextCopy || !rect) return;
              setMetronomeFieldTooltipPortal({
                copy: nextCopy,
                rect: {
                  left: rect.left,
                  right: rect.right,
                  top: rect.top,
                  bottom: rect.bottom,
                  width: rect.width,
                  height: rect.height,
                },
              });
            };
            const closeMetronomeFieldTooltip = () => {
              setMetronomeFieldTooltipPortal({ copy: "", rect: null });
            };
            const renderMetronomeFieldTooltipPortal = () => {
              const copy = String(metronomeFieldTooltipPortal.copy || "").trim();
              const rect = metronomeFieldTooltipPortal.rect;
              if (!copy || !rect) return null;
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
              const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
              const tooltipWidth = Math.min(260, Math.max(220, viewportWidth - 24));
              const rightSideLeft = rect.right + 8;
              const leftSideLeft = rect.left - tooltipWidth - 8;
              const tooltipLeft = rightSideLeft + tooltipWidth <= viewportWidth - 12
                ? rightSideLeft
                : Math.max(12, leftSideLeft);
              const tooltipTop = Math.max(12, Math.min(rect.top + (rect.height / 2) - 20, viewportHeight - 84));
              const tooltip = React.createElement(PlatformPopupSurface, {
                className: "playground-metronome-field-tooltip-popover is-portal",
                mode: "fixed",
                style: {
                  left: tooltipLeft + "px",
                  top: tooltipTop + "px",
                  width: tooltipWidth + "px",
                },
              }, copy);
              return typeof document !== "undefined" && typeof createPortal === "function"
                ? createPortal(tooltip, document.body)
                : tooltip;
            };
            const renderMetronomeFieldTooltip = (copy) => copy
              ? React.createElement("span", {
                  className: "playground-metronome-field-tooltip",
                  tabIndex: 0,
                  "aria-label": copy,
                  onMouseEnter: (event) => openMetronomeFieldTooltip(copy, event),
                  onMouseLeave: closeMetronomeFieldTooltip,
                  onFocus: (event) => openMetronomeFieldTooltip(copy, event),
                  onBlur: closeMetronomeFieldTooltip,
                  onKeyDown: (event) => {
                    if (event.key === "Escape") {
                      closeMetronomeFieldTooltip();
                    }
                  },
                },
                  React.createElement(Info, { width: 11, height: 11, strokeWidth: 2 })
                )
              : null;
            const renderMetronomeFieldTitle = (title, tooltip) => React.createElement("label", {
              className: "playground-metronome-field-label playground-metronome-field-title",
            },
              React.createElement("span", null, title),
              renderMetronomeFieldTooltip(tooltip)
            );
            const normalizeMetronomeInspectorSelectOption = (option) => {
              const source = option && typeof option === "object" ? option : { value: option, label: option };
              const value = String(source.value ?? source.id ?? "").trim();
              const label = String(source.label ?? source.name ?? source.title ?? source.id ?? source.value ?? "").trim();
              return {
                ...source,
                value,
                id: value,
                label: label || value,
                description: String(source.description || source.copy || source.subtitle || "").trim(),
              };
            };
            const renderMetronomeInspectorSelect = ({
              id,
              value,
              options = [],
              onChange,
              placeholder = "Select...",
              searchPlaceholder = "Select a model...",
              disabled = false,
            } = {}) => {
              const selectId = String(id || "").trim();
              const normalizedOptions = [];
              const seenOptionKeys = new Set();
              (Array.isArray(options) ? options : []).forEach((option) => {
                const normalizedOption = normalizeMetronomeInspectorSelectOption(option);
                const optionKey = normalizedOption.value || normalizedOption.label;
                if (!optionKey || seenOptionKeys.has(optionKey)) return;
                seenOptionKeys.add(optionKey);
                normalizedOptions.push(normalizedOption);
              });
              const selectedValue = String(value ?? "").trim();
              const selectedOption = normalizedOptions.find((option) => option.value === selectedValue) || null;
              const selectedLabel = selectedOption?.label || String(placeholder || "Select...");
              const isOpen = Boolean(selectId && metronomeInspectorSelectPopover.id === selectId);
              const isClosing = Boolean(isOpen && metronomeInspectorSelectPopover.closing);
              const query = isOpen ? String(metronomeInspectorSelectPopover.query || "") : "";
              const normalizedQuery = query.trim().toLowerCase();
              const filteredOptions = normalizedOptions.filter((option) => {
                if (!normalizedQuery) return true;
                return [option.label, option.description, option.value]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizedQuery);
              });
              const rect = isOpen && metronomeInspectorSelectPopover.rect ? metronomeInspectorSelectPopover.rect : null;
              const popupWidth = rect ? Math.min(Math.max(rect.width, 250), 320) : 280;
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
              const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
              const popupLeft = rect
                ? Math.max(12, Math.min(rect.right - popupWidth, viewportWidth - popupWidth - 12))
                : 12;
              const popupTop = rect ? Math.min(rect.bottom + 8, viewportHeight - 220) : 80;
              const popupMaxHeight = rect ? Math.max(180, Math.min(360, viewportHeight - popupTop - 12)) : 320;
              const popup = isOpen
                ? React.createElement(PlatformPopupSurface, {
                    className: "playground-metronome-inspector-select-popup",
                    animation: isClosing ? "down-out" : "down-in",
                    style: {
                      position: "fixed",
                      left: popupLeft + "px",
                      top: popupTop + "px",
                      width: popupWidth + "px",
                      maxHeight: popupMaxHeight + "px",
                      zIndex: 100000,
                    },
                    onMouseDown: (event) => event.stopPropagation(),
                    onPointerDown: (event) => event.stopPropagation(),
                    onClick: (event) => event.stopPropagation(),
                  },
                    React.createElement("label", { className: "playground-metronome-inspector-select-search" },
                      React.createElement(Search, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("input", {
                        type: "search",
                        value: query,
                        placeholder: searchPlaceholder,
                        autoFocus: true,
                        onChange: (event) => setMetronomeInspectorSelectPopover((current) => ({
                          ...current,
                          query: event.target.value,
                          closing: false,
                        })),
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                      })
                    ),
                    React.createElement("div", { className: "playground-metronome-inspector-select-list" },
                      filteredOptions.length
                        ? filteredOptions.map((option) => {
                            const isSelected = option.value === selectedValue;
                            return React.createElement("button", {
                              key: option.value || option.label,
                              type: "button",
                              className: "playground-metronome-inspector-select-option" + (isSelected ? " is-selected" : ""),
                              onClick: () => {
                                if (typeof onChange === "function") {
                                  onChange(option.value, option);
                                }
                                closeMetronomeInspectorSelectPopover();
                              },
                            },
                              React.createElement("span", { className: "playground-metronome-inspector-select-option-check" },
                                isSelected ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 1.9 }) : null
                              ),
                              React.createElement("span", { className: "playground-metronome-inspector-select-option-copy" },
                                React.createElement("span", { className: "playground-metronome-inspector-select-option-label" }, option.label),
                                option.description
                                  ? React.createElement("span", { className: "playground-metronome-inspector-select-option-description" }, option.description)
                                  : null
                              )
                            );
                          })
                        : React.createElement("div", { className: "playground-metronome-inspector-select-empty" }, "No matching options.")
                    )
                  )
                : null;
              const popupLayer = popup && typeof document !== "undefined" && typeof createPortal === "function"
                ? createPortal(popup, document.body)
                : popup;
              return React.createElement(React.Fragment, null,
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-select playground-metronome-custom-select-trigger" + (isOpen ? " is-open" : ""),
                  disabled: disabled || !selectId,
                  "aria-haspopup": "listbox",
                  "aria-expanded": isOpen ? "true" : "false",
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: (event) => {
                    event.stopPropagation();
                    if (disabled || !selectId) return;
                    const nextOpen = !isOpen || isClosing;
                    const nextRect = event.currentTarget?.getBoundingClientRect?.();
                    setIsMetronomeAgentSelectorOpen(false);
                    setIsMetronomeWorkspaceSelectorOpen(false);
                    closeMetronomeSchedulePopover({ immediate: true });
                    if (!nextOpen) {
                      closeMetronomeInspectorSelectPopover();
                      return;
                    }
                    if (metronomeInspectorSelectCloseTimerRef.current && typeof window !== "undefined") {
                      window.clearTimeout(metronomeInspectorSelectCloseTimerRef.current);
                      metronomeInspectorSelectCloseTimerRef.current = null;
                    }
                    setMetronomeInspectorSelectPopover({
                      id: selectId,
                      rect: nextRect
                        ? {
                            left: nextRect.left,
                            right: nextRect.right,
                            top: nextRect.top,
                            bottom: nextRect.bottom,
                            width: nextRect.width,
                          }
                        : null,
                      query: "",
                      closing: false,
                    });
                  },
                },
                  React.createElement("span", { className: "playground-metronome-custom-select-trigger-label" }, selectedLabel),
                  React.createElement(ChevronsUpDown, { className: "playground-metronome-custom-select-trigger-icon", width: 13, height: 13, strokeWidth: 1.55 })
                ),
                popupLayer
              );
            };
            const renderMetronomeDataBindingSelect = ({
              title,
              tooltip = "",
              fieldKey = "inputBinding",
              fallback = "last.text",
              options = METRONOME_WORKFLOW_DATA_BINDING_OPTIONS,
              className = "",
            } = {}) => React.createElement("div", { className: "playground-metronome-field" + (className ? " " + className : "") },
              renderMetronomeFieldTitle(title || "Input binding", tooltip || "Choose which upstream workflow output this node should consume."),
              renderMetronomeInspectorSelect({
                id: "data-binding-" + fieldKey,
                value: normalizeMetronomeDataBinding(config[fieldKey] || config[fieldKey.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase())], fallback),
                options,
                onChange: (nextValue) => updateSelectedNodeConfig(fieldKey, nextValue),
                searchPlaceholder: "Select input...",
              })
            );
            const renderMetronomeJsonEditorField = ({ title, tooltip = "", fieldKey, value, path = "config.json" }) => React.createElement("div", { className: "playground-metronome-field" },
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
              return React.createElement(PlatformPopup, {
                open: isOpen,
                variant: "minimal",
                portal: true,
                placement: "bottom-end",
                portalOffset: 6,
                portalCollisionPadding: 12,
                animation: "down-in",
                rootClassName: "playground-metronome-dynamic-content-popup-shell",
                surfaceClassName: "playground-metronome-dynamic-content-picker",
                surfaceProps: {
                  role: "dialog",
                  "aria-label": "Dynamic content",
                  width: "min(360px, calc(100vw - 24px))",
                  maxHeight: "min(520px, calc(100dvh - 24px))",
                  onMouseDown: (event) => event.stopPropagation(),
                  onPointerDown: (event) => event.stopPropagation(),
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
                React.createElement("div", { className: "playground-metronome-dynamic-content-picker-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-metronome-dynamic-content-picker-title" },
                      React.createElement("span", null, "Dynamic content")
                    ),
                    React.createElement("div", { className: "playground-metronome-dynamic-content-picker-copy" },
                      "Insert outputs from upstream nodes or workflow context."
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-dynamic-content-picker-close",
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: closeMetronomeDynamicContentPicker,
                    title: "Close",
                    "aria-label": "Close dynamic content",
                  }, React.createElement(X, { width: 14, height: 14, strokeWidth: 2.4 }))
                ),
                React.createElement(PlatformPopupSearchHeader, {
                  containerClassName: "playground-metronome-dynamic-content-search",
                  showSearchIcon: true,
                  value: metronomeDynamicContentPicker.query || "",
                  onChange: (event) => setMetronomeDynamicContentPicker((current) => ({
                    ...current,
                    query: event.target.value,
                  })),
                  placeholder: "Search outputs and context",
                  "aria-label": "Search dynamic content",
                }),
                searchableGroups.length
                  ? React.createElement("div", { className: "playground-metronome-dynamic-content-list" },
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
                        group.items.map((item) => React.createElement("button", {
                          key: group.id + ":" + item.path,
                          type: "button",
                          className: "playground-metronome-dynamic-content-row",
                          onMouseDown: (event) => event.preventDefault(),
                          onClick: () => insertMetronomeDynamicContentItem(fieldKey, item),
                          title: item.token || item.path,
                        },
                          React.createElement("span", { className: "playground-metronome-dynamic-content-row-main" },
                            React.createElement("span", { className: "playground-metronome-dynamic-content-row-label" }, item.label || item.path),
                            React.createElement("span", { className: "playground-metronome-dynamic-content-row-path" }, item.token || item.path)
                          ),
                          React.createElement("span", { className: "playground-metronome-dynamic-content-row-type" }, item.type || "value")
                        ))
                      ))
                    )
                  : React.createElement("div", { className: "playground-metronome-dynamic-content-empty" },
                      normalizedQuery
                        ? "No matching dynamic content."
                        : "Connect an upstream node to expose its outputs here."
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
                const rect = isMetronomeAttachmentPopoverOpen && metronomeAttachmentPopoverRect
                  ? metronomeAttachmentPopoverRect
                  : null;
                const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
                const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
                const popupWidth = Math.min(330, Math.max(260, viewportWidth - 32));
                const popupLeft = rect
                  ? Math.max(12, Math.min(rect.right - popupWidth + 28, viewportWidth - popupWidth - 12))
                  : Math.max(12, viewportWidth - popupWidth - 24);
                const popupTop = rect
                  ? Math.min(rect.bottom + 10, Math.max(12, viewportHeight - 260))
                  : 80;
                const popupMaxHeight = Math.max(220, Math.min(430, viewportHeight - popupTop - 12));
                const attachmentPopover = isMetronomeAttachmentPopoverOpen
                  ? React.createElement(PlatformPopupSurface, {
                      className: "playground-metronome-instructions-attachments-popover",
                      animation: isMetronomeAttachmentPopoverClosing ? "down-out" : "down-in",
                      style: {
                        left: popupLeft + "px",
                        top: popupTop + "px",
                        width: popupWidth + "px",
                        maxHeight: popupMaxHeight + "px",
                      },
                      onMouseDown: (event) => event.stopPropagation(),
                      onPointerDown: (event) => event.stopPropagation(),
                      onClick: (event) => event.stopPropagation(),
                    },
                      renderThreadAttachments({ borderless: true, buttonLabel: "Upload from Computer" })
                    )
                  : null;
                const attachmentPopoverLayer = attachmentPopover && typeof document !== "undefined" && typeof createPortal === "function"
                  ? createPortal(attachmentPopover, document.body)
                  : attachmentPopover;
                return React.createElement("span", { className: "playground-metronome-instructions-attachments-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-format-button playground-metronome-instructions-attachments-trigger"
                      + (isMetronomeAttachmentPopoverOpen ? " is-active" : "")
                      + (hasMetronomeAttachments ? " has-attachments" : ""),
                    title: "Attachments",
                    "aria-label": "Attachments",
                    "aria-expanded": isMetronomeAttachmentPopoverOpen ? "true" : "false",
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: (event) => {
                      event.stopPropagation();
                      setActiveMetronomeRichTextField(fieldKey);
                      closeMetronomeDynamicContentPicker();
                      if (isMetronomeAttachmentPopoverOpen && !isMetronomeAttachmentPopoverClosing) {
                        closeMetronomeAttachmentPopover();
                        return;
                      }
                      if (metronomeAttachmentPopoverCloseTimerRef.current && typeof window !== "undefined") {
                        window.clearTimeout(metronomeAttachmentPopoverCloseTimerRef.current);
                        metronomeAttachmentPopoverCloseTimerRef.current = null;
                      }
                      const nextRect = event.currentTarget?.getBoundingClientRect?.();
                      setMetronomeAttachmentPopoverRect(nextRect
                        ? {
                            left: nextRect.left,
                            right: nextRect.right,
                            top: nextRect.top,
                            bottom: nextRect.bottom,
                            width: nextRect.width,
                            height: nextRect.height,
                          }
                        : null
                      );
                      setIsMetronomeAttachmentPopoverClosing(false);
                      setIsMetronomeAttachmentPopoverOpen(true);
                    },
                  }, React.createElement(Paperclip, { width: 14, height: 14, strokeWidth: 1.9 })),
                  attachmentPopoverLayer
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
                      renderMetronomeDynamicContentPicker(fieldKey)
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
                    React.createElement("textarea", {
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
                  React.createElement("textarea", {
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
                const selectorMode = getMetronomeAgentSelectorMode(agent);
                return {
                  id: agent.id,
                  label: agent.name || "Agent",
                  description: selectorMode === "teams"
                    ? "Team agent"
                    : selectorMode === "humans"
                      ? "Human collaborator"
                      : "Agent",
                };
              });
              return React.createElement("div", {
                className: "playground-metronome-field playground-metronome-inspector-selector-field",
              },
                renderMetronomeFieldTitle(selectorTitle),
                renderMetronomeInspectorSelect({
                  id: "thread-agent-" + (selectedNodeId || "selected"),
                  value: selectedAgent?.id || config.agentId || "",
                  options: agentOptions,
                  placeholder: metronomeAgentOptions.length ? "Select agent" : "No agents available",
                  searchPlaceholder: "Select an agent...",
                  disabled: isActiveWorkflowBuiltIn || !metronomeAgentOptions.length,
                  onChange: (nextAgentId) => {
                    const nextAgent = metronomeAgentOptions.find((agent) => agent.id === nextAgentId) || null;
                    if (!nextAgent) return;
                    updateSelectedNodeConfigPatch({
                      agentId: nextAgent.id,
                      agentName: nextAgent.name || "",
                    });
                  },
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
              return React.createElement("div", {
                className: "playground-metronome-field playground-metronome-inspector-selector-field",
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
              const scheduleRect = isMetronomeSchedulePopoverOpen && metronomeSchedulePopoverRect
                ? metronomeSchedulePopoverRect
                : null;
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
              const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
              const schedulePopoverWidth = Math.min(320, Math.max(260, viewportWidth - 40));
              const schedulePopoverLeft = scheduleRect
                ? Math.max(12, Math.min(scheduleRect.right - schedulePopoverWidth, viewportWidth - schedulePopoverWidth - 12))
                : Math.max(12, viewportWidth - schedulePopoverWidth - 24);
              const schedulePopoverTop = scheduleRect
                ? Math.min(scheduleRect.bottom + 8, Math.max(12, viewportHeight - 300))
                : 80;
              const schedulePopoverMaxHeight = Math.max(260, Math.min(460, viewportHeight - schedulePopoverTop - 12));
              const schedulePopover = isMetronomeSchedulePopoverOpen
                ? React.createElement(PlatformPopupSurface, {
                    className: "playground-metronome-schedule-popover",
                    animation: isMetronomeSchedulePopoverClosing ? "down-out" : "down-in",
                    style: {
                      left: schedulePopoverLeft + "px",
                      top: schedulePopoverTop + "px",
                      width: schedulePopoverWidth + "px",
                      maxHeight: schedulePopoverMaxHeight + "px",
                    },
                    onPointerDown: (event) => event.stopPropagation(),
                  },
                    React.createElement("div", { className: "playground-metronome-schedule-popover-header" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-metronome-schedule-popover-action",
                        onClick: () => closeMetronomeSchedulePopover(),
                        "aria-label": "Close schedule",
                      }, React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 })),
                      React.createElement("div", { className: "playground-metronome-schedule-popover-title" }, "Schedule"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-metronome-schedule-popover-action",
                        onClick: () => closeMetronomeSchedulePopover(),
                        "aria-label": "Apply schedule",
                      }, React.createElement(Check, { width: 15, height: 15, strokeWidth: 1.9 }))
                    ),
                    React.createElement("div", { className: "playground-metronome-schedule-popover-body" },
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
                          React.createElement("input", {
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
                    )
                  )
                : null;
              const schedulePopoverLayer = schedulePopover && typeof document !== "undefined" && typeof createPortal === "function"
                ? createPortal(schedulePopover, document.body)
                : schedulePopover;
              return React.createElement("div", { className: "playground-metronome-schedule-settings playground-tasks-detail-facts playground-tasks-schedule-timing-card" + (isMetronomeSchedulePopoverOpen ? " is-popover-open" : "") },
                React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Schedule")
                ),
                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                  React.createElement("div", { className: "playground-tasks-detail-fact" },
`;
