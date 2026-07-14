export const METRONOME_PAGE_INSPECTOR_SCRIPT = String.raw`
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
              setMetronomeDynamicContentPicker({ fieldKey: "", rect: null, query: "" });
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
              const rect = event.currentTarget?.getBoundingClientRect?.();
              setActiveMetronomeRichTextField(fieldKey);
              closeMetronomeAttachmentPopover({ immediate: true });
              setIsMetronomeAgentSelectorOpen(false);
              setIsMetronomeWorkspaceSelectorOpen(false);
              setMetronomeDynamicContentPicker({
                fieldKey,
                rect: rect
                  ? {
                      left: rect.left,
                      right: rect.right,
                      top: rect.top,
                      bottom: rect.bottom,
                      width: rect.width,
                      height: rect.height,
                    }
                  : null,
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
              const definition = createMetronomeWorkflowDefinition(activeWorkflow, nodes, edges);
              const workflowForTest = {
                ...activeWorkflow,
                nodes,
                edges,
                triggerSummary: deriveMetronomeTriggerSummary(nodes),
                updatedAt: new Date().toISOString(),
              };
              setMetronomeTriggerTestState({ status: "loading", message: "Testing trigger..." });
              void saveEditableMetronomeWorkflowApi(workflowForTest)
                .then((savedWorkflow) => {
                  setIsMetronomeApiAvailable(true);
                  setWorkflows((current) => replaceMetronomeWorkflowById(current, workflowForTest.id, savedWorkflow));
                  if (savedWorkflow.id && savedWorkflow.id !== activeWorkflow.id) {
                    setActiveWorkflowId(savedWorkflow.id);
                  }
                  return testRunMetronomeWorkflowApi(savedWorkflow.id, definition, {
                    triggerType: normalizedTriggerType,
                    inputs: {
                      source: "trigger_diagnostics",
                      prompt: "Trigger diagnostics test",
                      selectedNodeId: selectedNodeId || null,
                    },
                  }).then((run) => ({ run, savedWorkflow }));
                })
                .then(({ run, savedWorkflow }) => {
                  const normalizedRun = normalizeMetronomeRun(run);
                  setMetronomeRuns((current) => [normalizedRun, ...current.filter((item) => item.id !== normalizedRun.id)]);
                  setSelectedMetronomeRunId(normalizedRun.id);
                  setMetronomeEditorHighlightRunId(normalizedRun.id);
                  setIsMetronomeRunSidebarMenuOpen(false);
                  setIsMetronomeRunSidebarOpen(true);
                  setMetronomeTriggerTestState({ status: "success", message: "Trigger test started." });
                  return fetchMetronomeTriggerEventsApi(savedWorkflow.id, 20);
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
                                        setIsMetronomeRunSidebarOpen(true);
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
            const renderMetronomeDynamicContentPicker = (fieldKey) => {
              if (metronomeDynamicContentPicker.fieldKey !== fieldKey) return null;
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
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
              const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
              const inspectorElement = typeof document !== "undefined"
                ? document.querySelector(".playground-metronome-inline-node-inspector")
                : null;
              const inspectorRect = inspectorElement?.getBoundingClientRect?.() || null;
              const panelWidth = inspectorRect
                ? Math.min(360, Math.max(280, inspectorRect.width))
                : Math.min(360, Math.max(280, viewportWidth - 24));
              const panelMaxHeight = inspectorRect
                ? Math.min(Math.max(260, inspectorRect.height), Math.max(260, viewportHeight - 28))
                : Math.min(520, Math.max(260, viewportHeight - 28));
              const fallbackRect = metronomeDynamicContentPicker.rect || { left: 12, right: 12 + panelWidth, top: 64, bottom: 98 };
              const left = inspectorRect
                ? Math.max(12, Math.min(inspectorRect.left - panelWidth - 12, viewportWidth - panelWidth - 12))
                : Math.max(12, Math.min(fallbackRect.left, viewportWidth - panelWidth - 12));
              const preferredTop = inspectorRect ? inspectorRect.top : fallbackRect.bottom + 8;
              const top = Math.max(12, Math.min(preferredTop, viewportHeight - panelMaxHeight - 12));
              const picker = React.createElement(PlatformPopupSurface, {
                className: "playground-metronome-dynamic-content-picker",
                mode: "fixed",
                style: {
                  left,
                  top,
                  width: panelWidth,
                  maxHeight: panelMaxHeight,
                },
                role: "dialog",
                "aria-label": "Dynamic content",
                onMouseDown: (event) => event.stopPropagation(),
                onPointerDown: (event) => event.stopPropagation(),
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
                React.createElement("label", { className: "playground-metronome-dynamic-content-search" },
                  React.createElement(Search, { width: 14, height: 14, strokeWidth: 1.9 }),
                  React.createElement("input", {
                    type: "search",
                    value: metronomeDynamicContentPicker.query || "",
                    onChange: (event) => setMetronomeDynamicContentPicker((current) => ({
                      ...current,
                      query: event.target.value,
                    })),
                    placeholder: "Search outputs and context",
                    "aria-label": "Search dynamic content",
                  })
                ),
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
              return typeof document !== "undefined" && typeof createPortal === "function"
                ? createPortal(picker, document.body)
                : picker;
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
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-detail-format-button playground-metronome-dynamic-content-trigger" + (metronomeDynamicContentPicker.fieldKey === fieldKey ? " is-active" : ""),
                        title: "Insert dynamic content",
                        "aria-label": "Insert dynamic content",
                        "aria-pressed": metronomeDynamicContentPicker.fieldKey === fieldKey ? "true" : "false",
                        onMouseDown: (event) => event.preventDefault(),
                        onClick: (event) => openMetronomeDynamicContentPicker(fieldKey, event),
                      }, React.createElement(Zap, { width: 14, height: 14, strokeWidth: 1.9 }))
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
                  ),
                  renderMetronomeDynamicContentPicker(fieldKey)
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
                    React.createElement("button", {
                      type: "button",
                      className: "playground-tasks-detail-format-button playground-metronome-dynamic-content-trigger" + (metronomeDynamicContentPicker.fieldKey === fieldKey ? " is-active" : ""),
                      title: "Insert dynamic content",
                      "aria-label": "Insert dynamic content",
                      "aria-pressed": metronomeDynamicContentPicker.fieldKey === fieldKey ? "true" : "false",
                      onMouseDown: (event) => event.preventDefault(),
                      onClick: (event) => openMetronomeDynamicContentPicker(fieldKey, event),
                    }, React.createElement(Zap, { width: 14, height: 14, strokeWidth: 2 })),
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
                ),
                renderMetronomeDynamicContentPicker(fieldKey)
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
                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "When"),
                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                      React.createElement("div", { className: "playground-tasks-schedule-anchor playground-metronome-schedule-anchor" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (isMetronomeSchedulePopoverOpen ? " is-active" : ""),
                          onClick: (event) => {
                            event.stopPropagation();
                            if (isMetronomeSchedulePopoverOpen && !isMetronomeSchedulePopoverClosing) {
                              closeMetronomeSchedulePopover();
                              return;
                            }
                            if (metronomeSchedulePopoverCloseTimerRef.current && typeof window !== "undefined") {
                              window.clearTimeout(metronomeSchedulePopoverCloseTimerRef.current);
                              metronomeSchedulePopoverCloseTimerRef.current = null;
                            }
                            const nextRect = event.currentTarget?.getBoundingClientRect?.();
                            setMetronomeSchedulePopoverRect(nextRect
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
                            setIsMetronomeSchedulePopoverClosing(false);
                            setIsMetronomeSchedulePopoverOpen(true);
                          },
                        },
                          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, scheduleSummaryLabel || "None"),
                          React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                        ),
                        schedulePopoverLayer
                      )
                    )
                  )
                )
              );
            };
            const renderMetronomeEmailSettings = () => {
              const defaultEmailConfig = buildDefaultMetronomeEmailTriggerConfig(activeWorkflow, selectedNode, config);
              const emailLocalPart = normalizeMetronomeEmailLocalPart(config.emailLocalPart || defaultEmailConfig.emailLocalPart);
              const updateEmailLocalPart = (value, normalize = false) => {
                const nextLocalPart = normalize
                  ? normalizeMetronomeEmailLocalPart(value, emailLocalPart || defaultEmailConfig.emailLocalPart)
                  : String(value || "").replace(/@.*$/, "");
                const normalizedForAddress = normalizeMetronomeEmailLocalPart(nextLocalPart, defaultEmailConfig.emailLocalPart);
                updateSelectedNodeConfigPatch({
                  emailLocalPart: nextLocalPart,
                  emailAddress: buildMetronomeEmailAddress(normalizedForAddress),
                });
              };
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-email-address-field" },
                  renderMetronomeFieldTitle("Email address", "Forward email to this workflow-specific address to trigger the Metronome."),
                  React.createElement("div", { className: "playground-metronome-email-address-control" },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input playground-metronome-email-local-input",
                      value: config.emailLocalPart || emailLocalPart,
                      placeholder: defaultEmailConfig.emailLocalPart,
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateEmailLocalPart(event.target.value),
                      onBlur: (event) => updateEmailLocalPart(event.target.value, true),
                    }),
                    React.createElement("span", { className: "playground-metronome-email-domain" }, "@" + METRONOME_EMAIL_DOMAIN)
                  )
                ),
                React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("From", "Optional sender filter. Leave empty to allow any sender."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.fromContains || "",
                      placeholder: "customer@company.com",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("fromContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Subject", "Optional subject filter. Use this for routing support, invoices, leads, or approvals."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.subjectContains || "",
                      placeholder: "invoice",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("subjectContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Body", "Optional body filter. Leave empty to trigger on every email sent to this address."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.bodyContains || "",
                      placeholder: "urgent",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("bodyContains", event.target.value),
                    })
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching emails",
                  tooltip: "Additional instructions appended to the inbound email before the workflow continues.",
                })
              );
            };
            const renderMetronomeTelegramSettings = () => {
              const defaultTelegramConfig = buildDefaultMetronomeTelegramTriggerConfig(activeWorkflow, selectedNode, config);
              const updateTelegramCommand = (value, normalize = false) => {
                const nextCommand = normalize
                  ? normalizeMetronomeTelegramCommand(value, defaultTelegramConfig.telegramCommand)
                  : String(value || "");
                updateSelectedNodeConfig("telegramCommand", nextCommand);
              };
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-telegram-command-field" },
                  renderMetronomeFieldTitle("Command", "Send this command to the Computer Agents Telegram bot to trigger this workflow."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.telegramCommand || defaultTelegramConfig.telegramCommand,
                    placeholder: "/customer_intake",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateTelegramCommand(event.target.value),
                    onBlur: (event) => updateTelegramCommand(event.target.value, true),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("From", "Optional sender filter. Leave empty to allow every Telegram sender."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.telegramFromContains || "",
                      placeholder: "jan",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("telegramFromContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("ID", "Optional exact Telegram chat filter for private chats, groups, or channels."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.telegramChatId || "",
                      placeholder: "-1001234567890",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("telegramChatId", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Message", "Optional message filter. Leave empty to trigger whenever the command matches."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.telegramMessageContains || "",
                      placeholder: "urgent",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("telegramMessageContains", event.target.value),
                    })
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching Telegram messages",
                  tooltip: "Additional instructions appended to the inbound Telegram message before the workflow continues.",
                })
              );
            };
            const renderMetronomeFunctionTriggerSettings = () => {
              const defaultFunctionConfig = buildDefaultMetronomeFunctionTriggerConfig(activeWorkflow, selectedNode, config);
              const payloadFields = normalizeMetronomeFunctionTriggerPayloadFields(defaultFunctionConfig.payloadFields);
              const endpointUrl = resolveMetronomeFunctionTriggerEndpointUrl(activeWorkflow, selectedNode, defaultFunctionConfig, backendUrl);
              const endpointDisplayValue = endpointUrl || "Publish to get URL";
              const commitPayloadFields = (nextFields) => {
                const normalizedFields = normalizeMetronomeFunctionTriggerPayloadFields(nextFields);
                updateSelectedNodeConfigPatch({
                  payloadFields: normalizedFields,
                  payloadSchemaJson: JSON.stringify(buildMetronomeFunctionTriggerPayloadSchema(normalizedFields), null, 2),
                  samplePayloadJson: JSON.stringify(buildMetronomeFunctionTriggerSamplePayload(normalizedFields), null, 2),
                  expectedPayload: buildMetronomeFunctionTriggerSamplePayload(normalizedFields),
                });
              };
              const copyFunctionEndpoint = () => {
                if (!endpointUrl || typeof navigator === "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") return;
                void navigator.clipboard.writeText(endpointUrl);
              };
              const updatePayloadField = (rowId, patch) => {
                commitPayloadFields(payloadFields.map((field) => field.id === rowId ? { ...field, ...patch } : field));
              };
              const removePayloadField = (rowId) => {
                if (payloadFields.length <= 1) return;
                commitPayloadFields(payloadFields.filter((field) => field.id !== rowId));
              };
              const addPayloadField = () => {
                commitPayloadFields([...payloadFields, createMetronomeFunctionTriggerPayloadField()]);
              };
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-function-trigger-endpoint-field" },
                  renderMetronomeFieldTitle("Endpoint", "Publishing this workflow deploys a Computer Agents cloud function that forwards requests to this workflow."),
                  React.createElement("div", { className: "playground-metronome-function-trigger-endpoint-control" },
                    React.createElement("input", {
                      type: "text",
                      readOnly: true,
                      className: "playground-metronome-input",
                      value: endpointDisplayValue,
                      onFocus: (event) => event.currentTarget.select(),
                    }),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-trigger-endpoint-copy",
                      disabled: !endpointUrl,
                      onClick: copyFunctionEndpoint,
                      title: endpointUrl ? "Copy endpoint" : "Publish to get URL",
                      "aria-label": "Copy endpoint",
                    }, React.createElement(Copy, { width: 13, height: 13, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "Require API key"),
                      renderMetronomeFieldTooltip("When enabled, callers must include a valid Computer Agents API key to invoke this workflow function.")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-switch" + (defaultFunctionConfig.functionRequireApiKey ? " is-on" : ""),
                    role: "switch",
                    "aria-checked": defaultFunctionConfig.functionRequireApiKey ? "true" : "false",
                    onClick: () => {
                      const nextRequireApiKey = !defaultFunctionConfig.functionRequireApiKey;
                      updateSelectedNodeConfigPatch({
                        functionRequireApiKey: nextRequireApiKey,
                        requireApiKey: nextRequireApiKey,
                        authentication: nextRequireApiKey ? "api_key" : "public",
                      });
                    },
                    "aria-label": "Require API key",
                  })
                ),
                React.createElement("div", {
                  className: "playground-metronome-field playground-metronome-function-trigger-payload-field",
                  onMouseDown: stopMetronomePointerPropagation,
                  onPointerDown: stopMetronomePointerPropagation,
                  onClick: stopMetronomePointerPropagation,
                },
                  renderMetronomeFieldTitle("Payload", "Define the expected request payload. These keys become available as dynamic content for downstream nodes."),
                  React.createElement("div", { className: "playground-metronome-function-trigger-payload-builder" },
                    React.createElement("div", { className: "playground-metronome-function-trigger-payload-rows" },
                      payloadFields.map((field, index) => {
                        const rowId = field.id || "payload-" + index;
                        return React.createElement("div", {
                          key: rowId,
                          className: "playground-metronome-function-trigger-payload-row",
                          onMouseDown: stopMetronomePointerPropagation,
                          onPointerDown: stopMetronomePointerPropagation,
                          onClick: stopMetronomePointerPropagation,
                        },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: field.key || "",
                            placeholder: "key",
                            onMouseDown: stopMetronomePointerPropagation,
                            onPointerDown: stopMetronomePointerPropagation,
                            onClick: stopMetronomePointerPropagation,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updatePayloadField(rowId, { key: event.target.value, name: event.target.value }),
                          }),
                          renderMetronomeInspectorSelect({
                            id: "function-trigger-payload-type-" + (selectedNodeId || "selected") + "-" + rowId,
                            value: normalizeMetronomeFunctionTriggerPayloadType(field.type),
                            options: METRONOME_FUNCTION_TRIGGER_PAYLOAD_TYPE_OPTIONS.map((option) => ({
                              id: option.id,
                              label: option.label,
                              description: "Expected " + option.label.toLowerCase() + " value in the request payload.",
                            })),
                            searchPlaceholder: "Select type...",
                            onChange: (nextType) => updatePayloadField(rowId, { type: normalizeMetronomeFunctionTriggerPayloadType(nextType) }),
                          }),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-function-header-delete",
                            disabled: payloadFields.length <= 1,
                            "aria-label": "Delete payload field",
                            onMouseDown: stopMetronomePointerPropagation,
                            onPointerDown: stopMetronomePointerPropagation,
                            onClick: (event) => {
                              stopMetronomePointerPropagation(event);
                              removePayloadField(rowId);
                            },
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
                        );
                      })
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-trigger-payload-add",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: (event) => {
                        stopMetronomePointerPropagation(event);
                        addPayloadField();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Add payload field")
                    )
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling function calls",
                  tooltip: "Additional instructions appended to the function request payload before the workflow continues.",
                })
              );
            };
            const renderMetronomeGitHubSettings = () => {
              const defaultGitHubConfig = buildDefaultMetronomeGitHubTriggerConfig(config);
              const webhookEndpoint = typeof window !== "undefined" && window.location
                ? window.location.origin.replace(/\/$/, "") + "/api/real/metronomes/github/inbound"
                : "/api/real/metronomes/github/inbound";
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Webhook", "Add this URL as a GitHub webhook endpoint. GitHub events that match the filters below will start this workflow."),
                  React.createElement("input", {
                    type: "text",
                    readOnly: true,
                    className: "playground-metronome-input",
                    value: webhookEndpoint,
                    onFocus: (event) => event.currentTarget.select(),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Choose the GitHub webhook event that should trigger this workflow."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: normalizeMetronomeGitHubEventType(config.githubEventType || defaultGitHubConfig.githubEventType),
                    onChange: (event) => updateSelectedNodeConfig("githubEventType", normalizeMetronomeGitHubEventType(event.target.value)),
                  },
                    METRONOME_GITHUB_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Repository", "Optional repository filter. Use owner/repo or a partial repository name."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubRepositoryContains || "",
                      placeholder: "computer-agents/platform",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubRepositoryContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Branch", "Optional branch, tag, or ref filter. Useful for production branches or release tags."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubBranchContains || "",
                      placeholder: "main",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubBranchContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Actor", "Optional GitHub user or bot filter."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubActorContains || "",
                      placeholder: "github-actions",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubActorContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Action", "Optional action filter, for example opened, closed, completed, or requested."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubActionContains || "",
                      placeholder: "opened",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubActionContains", event.target.value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field" },
                    renderMetronomeFieldTitle("Payload", "Optional text filter across title, body, commit message, and serialized webhook payload."),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: config.githubPayloadContains || "",
                      placeholder: "deploy",
                      onKeyDown: stopMetronomeInputKeyPropagation,
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => updateSelectedNodeConfig("githubPayloadContains", event.target.value),
                    })
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching GitHub events",
                  tooltip: "Additional instructions appended to the GitHub webhook event before the workflow continues.",
                })
              );
            };
            const renderMetronomeProjectTicketSettings = () => {
              const defaultTicketConfig = buildDefaultMetronomeProjectTicketTriggerConfig(config);
              const selectedTicketEventType = normalizeMetronomeProjectTicketEventType(config.ticketEventType || defaultTicketConfig.ticketEventType);
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                  renderMetronomeFieldTitle("Project", "Only ticket events from this project will start the workflow."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.ticketProjectId || config.projectId || "",
                    onChange: (event) => {
                      const nextProjectId = event.target.value;
                      const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                      updateSelectedNodeConfigPatch({
                        ticketProjectId: nextProjectId,
                        ticketProjectName: nextProject?.name || "",
                        projectId: nextProjectId,
                        projectName: nextProject?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, "Select project"),
                    metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                  renderMetronomeFieldTitle("Ticket event", "Choose whether this workflow starts on a status transition or a new comment."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: selectedTicketEventType,
                    onChange: (event) => {
                      const nextEventType = normalizeMetronomeProjectTicketEventType(event.target.value);
                      updateSelectedNodeConfigPatch({
                        ticketEventType: nextEventType,
                        ticketFromStatus: config.ticketFromStatus || defaultTicketConfig.ticketFromStatus,
                        ticketToStatus: config.ticketToStatus || defaultTicketConfig.ticketToStatus,
                        ticketCommentContains: config.ticketCommentContains || "",
                      });
                    },
                  },
                    METRONOME_PROJECT_TICKET_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                selectedTicketEventType === "status_changed"
                  ? React.createElement("div", { className: "playground-metronome-email-filter-stack" },
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                        renderMetronomeFieldTitle("From status", "The previous ticket status. Leave as Any status to match every source status."),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: normalizeMetronomeProjectTicketStatus(config.ticketFromStatus || defaultTicketConfig.ticketFromStatus),
                          onChange: (event) => updateSelectedNodeConfig("ticketFromStatus", normalizeMetronomeProjectTicketStatus(event.target.value)),
                        },
                          METRONOME_PROJECT_TICKET_STATUS_OPTIONS.map((option) =>
                            React.createElement("option", { key: option.id, value: option.id }, option.label)
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                        renderMetronomeFieldTitle("To status", "The new ticket status. Use this for transitions such as To do -> In review."),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: normalizeMetronomeProjectTicketStatus(config.ticketToStatus || defaultTicketConfig.ticketToStatus),
                          onChange: (event) => updateSelectedNodeConfig("ticketToStatus", normalizeMetronomeProjectTicketStatus(event.target.value)),
                        },
                          METRONOME_PROJECT_TICKET_STATUS_OPTIONS.map((option) =>
                            React.createElement("option", { key: option.id, value: option.id }, option.label)
                          )
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-metronome-field playground-metronome-project-trigger-field" },
                      renderMetronomeFieldTitle("Comment contains", "Optional substring filter for the added ticket comment."),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: config.ticketCommentContains || "",
                        placeholder: "needs review",
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("ticketCommentContains", event.target.value),
                      })
                    ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling matching ticket events",
                  tooltip: "Additional instructions appended to the project ticket event before the workflow continues.",
                })
              );
            };
            const renderMetronomeResourceEventSettings = () => {
              const defaultResourceConfig = buildDefaultMetronomeResourceTriggerConfig(config);
              const selectedResourceEventType = normalizeMetronomeResourceEventType(config.resourceEventType || defaultResourceConfig.resourceEventType);
              const resourceOptions = selectedResourceEventType === "function_deployed" ? metronomeFunctionOptions : metronomeWebAppOptions;
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Choose which kind of successful deployment starts this workflow."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: selectedResourceEventType,
                    onChange: (event) => {
                      const nextEventType = normalizeMetronomeResourceEventType(event.target.value);
                      updateSelectedNodeConfigPatch({
                        resourceEventType: nextEventType,
                        resourceId: "",
                        resourceName: "",
                        resourceKind: nextEventType === "function_deployed" ? "function" : "web_app",
                      });
                    },
                  },
                    METRONOME_RESOURCE_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Resource", "Select a specific resource or leave empty to match every resource of this deployment type."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.resourceId || "",
                    onChange: (event) => {
                      const nextResourceId = event.target.value;
                      const nextResource = resourceOptions.find((option) => option.id === nextResourceId) || null;
                      updateSelectedNodeConfigPatch({
                        resourceId: nextResourceId,
                        resourceName: nextResource?.name || "",
                        resourceKind: selectedResourceEventType === "function_deployed" ? "function" : (nextResource?.kind || "web_app"),
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, resourceOptions.length ? "Any matching resource" : "No matching resources available"),
                    resourceOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling successful deployments",
                  tooltip: "Additional instructions appended to the deployment event before the workflow continues.",
                })
              );
            };
            const renderMetronomeDatabaseEntryTriggerSettings = () => {
              const defaultDatabaseConfig = buildDefaultMetronomeDatabaseEntryTriggerConfig(config);
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Document added events can start this workflow when a new document is inserted."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.databaseEventType || defaultDatabaseConfig.databaseEventType,
                    onChange: () => updateSelectedNodeConfig("databaseEventType", "document_created"),
                  },
                    METRONOME_DATABASE_ENTRY_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Database", "Select the database resource that should emit document events."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.databaseId || "",
                    onChange: (event) => {
                      const nextDatabaseId = event.target.value;
                      const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                      updateSelectedNodeConfigPatch({
                        databaseId: nextDatabaseId,
                        databaseName: nextDatabase?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, metronomeDatabaseOptions.length ? "Select database" : "No databases available"),
                    metronomeDatabaseOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Collection", "Only documents added to this collection will start the workflow."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.databaseCollection || "",
                    placeholder: "customers",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                  })
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling new database documents",
                  tooltip: "Additional instructions appended to the new document event before the workflow continues.",
                })
              );
            };
            const renderMetronomeAuthEventSettings = () => {
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Event", "Start this workflow when a new user registers through an auth resource."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.authEventType || "user_registered",
                    onChange: () => updateSelectedNodeConfig("authEventType", "user_registered"),
                  },
                    METRONOME_AUTH_EVENT_OPTIONS.map((option) =>
                      React.createElement("option", { key: option.id, value: option.id }, option.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Resource", "Select a specific auth resource or leave empty to match all auth registrations."),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.authResourceId || "",
                    onChange: (event) => {
                      const nextAuthResourceId = event.target.value;
                      const nextAuthResource = metronomeAuthOptions.find((option) => option.id === nextAuthResourceId) || null;
                      updateSelectedNodeConfigPatch({
                        authResourceId: nextAuthResourceId,
                        authResourceName: nextAuthResource?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, metronomeAuthOptions.length ? "Any auth resource" : "No auth resources available"),
                    metronomeAuthOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Email", "Optional filter for a domain, account, or test user."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.authEmailContains || "",
                    placeholder: "@company.com",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("authEmailContains", event.target.value),
                  })
                ),
                renderMetronomeRichTextField({
                  fieldKey: "promptExtension",
	                  title: "Instructions",
                  placeholder: "Add instructions for handling new registrations",
                  tooltip: "Additional instructions appended to the auth registration event before the workflow continues.",
                })
              );
            };
            const renderTriggerSettings = () => {
              const triggerFields = selectedTriggerType === "thread_event" || selectedTriggerType === "thread"
		                ? React.createElement(React.Fragment, null,
	                    React.createElement("div", { className: "playground-metronome-field" },
	                      renderMetronomeFieldTitle("Command", "Runs immediately when a user message starts with this command."),
	                      React.createElement("input", {
	                        type: "text",
	                        className: "playground-metronome-input",
                        value: config.threadCommand || "@metronome",
                        placeholder: "@campaign",
	                        onChange: (event) => updateSelectedNodeConfig("threadCommand", event.target.value),
	                        onBlur: (event) => updateSelectedNodeConfig("threadCommand", normalizedThreadCommand(event.target.value)),
	                      })
	                    ),
	                    renderMetronomeRichTextField({
	                      fieldKey: "promptExtension",
		                      title: "Instructions",
		                      placeholder: "Add instructions here",
	                      tooltip: "Additional instructions appended to the triggering message before the workflow continues.",
	                    })
                  )
                : selectedTriggerType === "periodic"
                  ? renderMetronomeScheduleSettings()
	                : selectedTriggerType === "email"
	                  ? renderMetronomeEmailSettings()
	                : selectedTriggerType === "telegram"
	                  ? renderMetronomeTelegramSettings()
	                : selectedTriggerType === "function"
	                  ? renderMetronomeFunctionTriggerSettings()
	                : selectedTriggerType === "github"
	                  ? renderMetronomeGitHubSettings()
	                : selectedTriggerType === "project_ticket"
	                  ? renderMetronomeProjectTicketSettings()
	                : selectedTriggerType === "resource"
	                  ? renderMetronomeResourceEventSettings()
	                : selectedTriggerType === "database_entry"
	                  ? renderMetronomeDatabaseEntryTriggerSettings()
	                : selectedTriggerType === "auth"
	                  ? renderMetronomeAuthEventSettings()
	                : React.createElement("div", { className: "playground-metronome-field" },
	                  React.createElement("div", { className: "playground-metronome-field-hint" }, "Select a configured trigger type to decide how this workflow starts.")
	                );
              return React.createElement(React.Fragment, null,
                triggerFields,
                React.createElement("div", { className: "playground-metronome-trigger-evaluate-row" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-trigger-evaluate-link",
                    onClick: () => setIsMetronomeTriggerDiagnosticsModalOpen(true),
                  }, "Evaluate Node")
                ),
                renderMetronomeTriggerDiagnosticsModal()
              );
            };
            const renderConditionSettings = () => {
              const isFixedBranches = selectedConditionType === "database_document_field" || selectedConditionType === "ticket_status";
              const branchRulePlaceholder = selectedConditionType === "json"
                ? "input.0.summary contains 'ready'"
                : selectedConditionType === "previous_output_contains"
                  ? "Substring to match"
                  : "Resolved value";
              const branchLabelPlaceholder = selectedConditionType === "json"
                ? "Branch label"
                : selectedConditionType === "previous_output_contains"
                  ? "Branch label"
                  : "Branch";
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field-hint playground-metronome-type-description" }, renderConditionHint()),
                selectedConditionType === "database_document_field"
                  ? React.createElement("div", { className: "playground-metronome-condition-fields" },
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Database"),
                        renderMetronomeInspectorSelect({
                          id: "condition-database-" + (selectedNodeId || "selected"),
                          value: config.databaseId || "",
                          options: [
                            { id: "", label: metronomeDatabaseOptions.length ? "Select database" : "No databases available" },
                            ...metronomeDatabaseOptions.map((option) => ({
                              id: option.id,
                              label: option.name,
                              description: option.description || option.id || "",
                            })),
                          ],
                          searchPlaceholder: "Select database...",
                          onChange: (nextDatabaseId) => {
                            const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                            updateSelectedNodeConfigPatch({
                              databaseId: nextDatabaseId,
                              databaseName: nextDatabase?.name || "",
                            });
                          },
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Collection"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseCollection || config.collection || "",
                          placeholder: "customers",
                          onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Document"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseDocumentId || "",
                          placeholder: "doc_123 or {{ input.0.summary }}",
                          onChange: (event) => updateSelectedNodeConfig("databaseDocumentId", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Field"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseFieldPath || "",
                          placeholder: "status",
                          onChange: (event) => updateSelectedNodeConfig("databaseFieldPath", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Operator"),
                        renderMetronomeInspectorSelect({
                          id: "condition-database-operator-" + (selectedNodeId || "selected"),
                          value: config.databaseOperator || "equals",
                          options: [
                            { id: "equals", label: "Equals" },
                            { id: "not_equals", label: "Not equals" },
                            { id: "contains", label: "Contains" },
                            { id: "not_contains", label: "Not contains" },
                          ],
                          onChange: (nextValue) => updateSelectedNodeConfig("databaseOperator", nextValue),
                          searchPlaceholder: "Select operator...",
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Comparison"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseCompareValue || "",
                          placeholder: "active",
                          onChange: (event) => updateSelectedNodeConfig("databaseCompareValue", event.target.value),
                        })
                      )
                    )
                  : null,
                selectedConditionType === "ticket_status"
                  ? React.createElement("div", { className: "playground-metronome-condition-fields" },
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Project"),
                        renderMetronomeInspectorSelect({
                          id: "condition-ticket-project-" + (selectedNodeId || "selected"),
                          value: config.ticketProjectId || "",
                          options: [
                            { id: "", label: metronomeProjectOptions.length ? "Select project" : "No projects available" },
                            ...metronomeProjectOptions.map((option) => ({
                              id: option.id,
                              label: option.name,
                              description: option.description || option.id || "",
                            })),
                          ],
                          searchPlaceholder: "Select project...",
                          onChange: (nextProjectId) => {
                            const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                            updateSelectedNodeConfigPatch({
                              ticketProjectId: nextProjectId,
                              ticketProjectName: nextProject?.name || "",
                            });
                          },
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Ticket ID"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.ticketId || "",
                          placeholder: "ticket_123",
                          onChange: (event) => updateSelectedNodeConfig("ticketId", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Operator"),
                        renderMetronomeInspectorSelect({
                          id: "condition-ticket-operator-" + (selectedNodeId || "selected"),
                          value: config.ticketStatusOperator || "equals",
                          options: [
                            { id: "equals", label: "Equals" },
                            { id: "not_equals", label: "Not equals" },
                          ],
                          onChange: (nextValue) => updateSelectedNodeConfig("ticketStatusOperator", nextValue),
                          searchPlaceholder: "Select operator...",
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Status"),
                        renderMetronomeInspectorSelect({
                          id: "condition-ticket-status-" + (selectedNodeId || "selected"),
                          value: config.ticketStatusValue || "planned",
                          options: ticketStatusOptions,
                          onChange: (nextValue) => updateSelectedNodeConfig("ticketStatusValue", nextValue),
                          searchPlaceholder: "Select status...",
                        })
                      )
                    )
                  : null,
                isFixedBranches
                  ? null
                  : React.createElement("div", { className: "playground-metronome-field playground-metronome-condition-editor-field" },
                    React.createElement("div", { className: "playground-metronome-condition-editor" },
                      conditionBranches.filter((branch) => branch.id !== "else").map((branch, branchIndex) => {
                        const isLockedBranch = isFixedBranches;
                        const branchKindLabel = branchIndex === 0
                            ? "If"
                            : "Else if";
                        return React.createElement("div", {
                          key: branch.id,
                          className: "playground-metronome-condition-editor-row" + (isFixedBranches ? " is-fixed" : ""),
                        },
                          React.createElement("div", { className: "playground-metronome-condition-editor-row-header" },
                            React.createElement("span", { className: "playground-metronome-condition-editor-row-kind" }, branchKindLabel),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-metronome-condition-editor-remove",
                              disabled: isLockedBranch || editableConditionBranchCount <= 1,
                              "aria-label": "Remove condition branch",
                              onClick: () => removeConditionBranch(branch.id),
                            }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                          ),
                          React.createElement("div", { className: "playground-metronome-condition-editor-row-fields" },
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: branch.label || "",
                              placeholder: branchLabelPlaceholder,
                              disabled: isLockedBranch,
                              ...getMetronomeTextInputKeyHandlers(),
                              onChange: (event) => updateConditionBranch(branch.id, { label: event.target.value }),
                            }),
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: branch.rule || "",
                              placeholder: branchRulePlaceholder,
                              disabled: isLockedBranch,
                              ...getMetronomeTextInputKeyHandlers(),
                              onChange: (event) => updateConditionBranch(branch.id, { rule: event.target.value }),
                            })
                          )
                        );
                      }),
                      canAddConditionBranches
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-condition-editor-add",
                            onClick: addConditionBranch,
                          },
                            React.createElement(Plus, { width: 13, height: 13, strokeWidth: 2 }),
                            React.createElement("span", null, "Add")
                          )
                        : null
                    )
                  )
              );
            };
            const renderLoopSettings = () => {
              const loopConfig = createDefaultMetronomeLoopConfig(selectedLoopType, config);
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              const renderMaxIterationsField = (
                label = "Safety limit",
                description = "Maximum loop iterations before the workflow stops to prevent runaway automation.",
                className = ""
              ) => React.createElement("div", { className: ("playground-metronome-field " + className).trim() },
                renderMetronomeFieldTitle(label, description),
                React.createElement("input", {
                  type: "number",
                  min: 1,
                  max: 500,
                  className: "playground-metronome-input",
                  value: loopConfig.maxIterations,
                  onKeyDown: stopMetronomeInputKeyPropagation,
                  onKeyUp: stopMetronomeInputKeyPropagation,
                  onChange: (event) => updateSelectedNodeConfig("maxIterations", Math.max(1, Number(event.target.value) || 1)),
                })
              );
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field-hint playground-metronome-type-description playground-metronome-loop-type-description" },
                  selectedLoopType === "fixed_count"
                    ? "Runs the enclosed steps a fixed number of times."
                    : selectedLoopType === "workflow_context_contains"
                      ? "Runs enclosed steps until the accumulated workflow summaries contain the target text."
                      : selectedLoopType === "input_items"
                        ? "Runs enclosed steps for each item or batch from a previous node output."
                        : selectedLoopType === "project_tickets"
                          ? "Runs enclosed steps while matching project tickets still exist."
                          : selectedLoopType === "database_documents"
                            ? "Prepares matching documents from a database collection for downstream steps."
                            : "Runs enclosed steps while matching database documents still exist."
                ),
                selectedLoopType === "fixed_count"
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      renderMetronomeFieldTitle("Iterations"),
                      React.createElement("input", {
                        type: "number",
                        min: 1,
                        max: 500,
                        className: "playground-metronome-input",
                        value: loopConfig.iterations,
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("iterations", Math.max(1, Number(event.target.value) || 1)),
                      })
                    )
                  : null,
                selectedLoopType === "workflow_context_contains"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Run summary contains", "The loop stops once the accumulated workflow context contains this text."),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.contextContainsText,
                          placeholder: "ready for review",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("contextContainsText", event.target.value),
                        })
                      ),
                      renderMaxIterationsField()
                    )
                  : null,
                selectedLoopType === "input_items"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-loop-input-binding-field" },
                        renderMetronomeFieldTitle("Input binding", "Use previous.batches for table batches, previous.records for rows, or loop.records inside nested loops."),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.inputBinding,
                          placeholder: "previous.batches",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("inputBinding", event.target.value),
                        })
                      ),
                      renderMaxIterationsField(
                        "Item limit",
                        "Maximum number of input items or batches to expose to enclosed steps.",
                        "playground-metronome-loop-item-limit-field"
                      )
                    )
                  : null,
                selectedLoopType === "project_tickets"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Project"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: loopConfig.projectId,
                          onChange: (event) => {
                            const nextProjectId = event.target.value;
                            const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                            updateSelectedNodeConfigPatch({
                              projectId: nextProjectId,
                              projectName: nextProject?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select project"),
                          metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Repeat while tickets are"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: loopConfig.ticketStatusValue,
                          onChange: (event) => updateSelectedNodeConfig("ticketStatusValue", event.target.value),
                        },
                          ticketStatusOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                        )
                      ),
                      renderMaxIterationsField()
                    )
                  : null,
                (selectedLoopType === "database_field" || selectedLoopType === "database_documents")
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Database"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: loopConfig.databaseId,
                          onChange: (event) => {
                            const nextDatabaseId = event.target.value;
                            const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                            updateSelectedNodeConfigPatch({
                              databaseId: nextDatabaseId,
                              databaseName: nextDatabase?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select database"),
                          metronomeDatabaseOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Collection"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.databaseCollection,
                          placeholder: "customers",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-condition-compact-grid" },
                        React.createElement("div", { className: "playground-metronome-field" },
                          renderMetronomeFieldTitle(
                            selectedLoopType === "database_documents" ? "Filter field path" : "Field path",
                            selectedLoopType === "database_documents"
                              ? "Optional. Leave empty to include every document in the collection."
                              : "Field path checked before repeating the loop."
                          ),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: loopConfig.databaseFieldPath,
                            placeholder: "status",
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updateSelectedNodeConfig("databaseFieldPath", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          renderMetronomeFieldTitle("Operator"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: loopConfig.databaseOperator,
                            onChange: (event) => updateSelectedNodeConfig("databaseOperator", event.target.value),
                          },
                            React.createElement("option", { value: "equals" }, "Equals"),
                            React.createElement("option", { value: "not_equals" }, "Not equals"),
                            React.createElement("option", { value: "contains" }, "Contains"),
                            React.createElement("option", { value: "not_contains" }, "Not contains"),
                            React.createElement("option", { value: "exists" }, "Exists"),
                            React.createElement("option", { value: "not_exists" }, "Does not exist")
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Compare value"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: loopConfig.databaseCompareValue,
                          placeholder: "pending",
                          disabled: loopConfig.databaseOperator === "exists" || loopConfig.databaseOperator === "not_exists",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("databaseCompareValue", event.target.value),
                        })
                      ),
                      renderMaxIterationsField(
                        selectedLoopType === "database_documents" ? "Document limit" : "Safety limit",
                        selectedLoopType === "database_documents"
                          ? "Maximum number of documents exposed to downstream nodes."
                          : "Maximum loop iterations before the workflow stops to prevent runaway automation."
                      )
                    )
                  : null
              );
            };
            const getMetronomeBackendUrl = () => {
              let normalizedBackendUrl = String(backendUrl || "/api/real").trim() || "/api/real";
              while (normalizedBackendUrl.length > 1 && normalizedBackendUrl.endsWith("/")) {
                normalizedBackendUrl = normalizedBackendUrl.slice(0, -1);
              }
              return normalizedBackendUrl;
            };
            const resolveMetronomeAttachmentEnvironment = (nodeConfig = config) => {
              const configuredEnvironmentId = String(nodeConfig.environmentId || "").trim();
              if (configuredEnvironmentId) {
                const configuredEnvironment = metronomeComputerOptions.find((environment) => String(environment.id) === configuredEnvironmentId);
                if (configuredEnvironment) {
                  return configuredEnvironment;
                }
              }
              const configuredProjectId = String(nodeConfig.projectId || "").trim();
              if (configuredProjectId) {
                const configuredProject = metronomeProjectOptions.find((project) => String(project.id) === configuredProjectId);
                const projectEnvironmentId = getMetronomeProjectEnvironmentId(configuredProject);
                if (projectEnvironmentId) {
                  const projectEnvironment = metronomeComputerOptions.find((environment) => String(environment.id) === projectEnvironmentId);
                  if (projectEnvironment) {
                    return projectEnvironment;
                  }
                }
              }
              return metronomeComputerOptions[0] || null;
            };
            const loadMetronomeEnvironmentFileInventory = async (environmentId) => {
              const normalizedEnvironmentId = String(environmentId || "").trim();
              if (!normalizedEnvironmentId) {
                setMetronomeEnvironmentFilePickerState({ status: "error", error: "Select a computer before attaching files from the computer." });
                setMetronomeEnvironmentFilePickerInventory([]);
                return false;
              }
              setMetronomeEnvironmentFilePickerState({ status: "loading", error: "" });
              setMetronomeEnvironmentFilePickerInventory([]);
              setMetronomeEnvironmentFilePickerExpandedFolders([]);
              setMetronomeEnvironmentFilePickerSelectedPaths([]);
              try {
                const filesUrl = buildPlaygroundEnvironmentFilesListUrl(getMetronomeBackendUrl(), normalizedEnvironmentId, "", -1);
                const response = await fetch(filesUrl, {
                  method: "GET",
                  headers: requestHeaders || {},
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load computer files.");
                }
                const nextInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
                setMetronomeEnvironmentFilePickerInventory(nextInventory);
                setMetronomeEnvironmentFilePickerState({ status: "ready", error: "" });
                return true;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load computer files.";
                setMetronomeEnvironmentFilePickerInventory([]);
                setMetronomeEnvironmentFilePickerState({ status: "error", error: errorMessage });
                return false;
              }
            };
            const openMetronomeEnvironmentFilePicker = () => {
              if (isMetronomeAttachmentUploading) {
                return;
              }
              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              if (!attachmentEnvironment?.id) {
                setMetronomeAttachmentStatus("Select a computer before attaching files from the computer.");
                return;
              }
              setMetronomeAttachmentStatus("");
              setMetronomeEnvironmentFilePickerSearch("");
              setMetronomeEnvironmentFilePickerSelectedPaths([]);
              setMetronomeAttachmentModalOpen(true);
              void loadMetronomeEnvironmentFileInventory(attachmentEnvironment.id);
            };
            const uploadMetronomeAttachmentContent = async ({ filename, mimeType, data, options = {} }) => {
              const normalizedEnvironmentId = typeof options === "string"
                ? String(options || "").trim()
                : String(options?.environmentId || "").trim();
              const normalizedSourcePath = typeof options === "object" && options?.sourcePath
                ? normalizeHistoryPath(options.sourcePath)
                : "";
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(getMetronomeBackendUrl() + "/attachments/upload", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  filename: filename || "attachment",
                  mimeType: mimeType || "application/octet-stream",
                  data,
                  ...(normalizedEnvironmentId ? { environmentId: normalizedEnvironmentId } : {}),
                }),
              });
              const uploadResult = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(uploadResult?.message || uploadResult?.error || "Failed to upload attachment.");
              }
              const rawAttachment = uploadResult?.attachment && typeof uploadResult.attachment === "object"
                ? uploadResult.attachment
                : {};
              const normalizedMimeType = String(rawAttachment.mimeType || rawAttachment.contentType || mimeType || "application/octet-stream");
              const attachmentId = String(rawAttachment.id || rawAttachment.attachmentId || ("metronome_attachment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8)));
              const attachmentUrl = rawAttachment.url || (attachmentId ? getMetronomeBackendUrl() + "/attachments/" + encodeURIComponent(attachmentId) : "");
              return {
                ...rawAttachment,
                id: attachmentId,
                name: rawAttachment.name || rawAttachment.filename || filename || "Attachment",
                filename: rawAttachment.filename || rawAttachment.name || filename || "Attachment",
                mimeType: normalizedMimeType,
                type: rawAttachment.type || (normalizedMimeType.startsWith("image/") ? "image" : "file"),
                size: Number(rawAttachment.size || rawAttachment.byteSize || 0),
                url: attachmentUrl,
                previewUrl: rawAttachment.previewUrl || attachmentUrl,
                environmentId: normalizedEnvironmentId || rawAttachment.environmentId || rawAttachment.sourceEnvironmentId || "",
                sourceEnvironmentId: normalizedEnvironmentId || rawAttachment.sourceEnvironmentId || rawAttachment.environmentId || "",
                sourcePath: normalizedSourcePath || rawAttachment.sourcePath || rawAttachment.workspacePath || "",
                workspacePath: normalizedSourcePath || rawAttachment.workspacePath || rawAttachment.sourcePath || "",
                source: "environment",
              };
            };
            const uploadMetronomeAttachmentFile = async (file, options = {}) => uploadMetronomeAttachmentContent({
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              data: await readFileAsBase64(file),
              options,
            });
            const appendMetronomeUploadedAttachments = (uploadedAttachments) => {
              const normalizedAttachments = (Array.isArray(uploadedAttachments) ? uploadedAttachments : []).filter(Boolean);
              if (!normalizedAttachments.length) {
                return false;
              }
              const currentNode = nodes.find((node) => node.id === selectedNodeId) || selectedNode;
              const latestAttachments = Array.isArray(currentNode?.data?.config?.attachments)
                ? currentNode.data.config.attachments
                : Array.isArray(config.attachments)
                  ? config.attachments
                  : [];
              updateSelectedNodeConfig("attachments", latestAttachments.concat(normalizedAttachments));
              return true;
            };
            const toggleMetronomeEnvironmentFileSelection = (path) => {
              const normalizedPath = normalizeHistoryPath(path);
              if (!normalizedPath) return;
              setMetronomeEnvironmentFilePickerSelectedPaths((current) =>
                current.includes(normalizedPath)
                  ? current.filter((value) => value !== normalizedPath)
                  : current.concat(normalizedPath)
              );
            };
            const toggleMetronomeEnvironmentFileFolder = (path) => {
              const normalizedPath = normalizeHistoryPath(path);
              if (!normalizedPath) return;
              setMetronomeEnvironmentFilePickerExpandedFolders((current) =>
                current.includes(normalizedPath)
                  ? current.filter((value) => value !== normalizedPath)
                  : current.concat(normalizedPath)
              );
            };
            const handleAttachMetronomeEnvironmentFiles = async () => {
              if (!metronomeAttachmentModalOpen || isMetronomeAttachmentUploading) {
                return;
              }
              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              const normalizedEnvironmentId = String(attachmentEnvironment?.id || "").trim();
              if (!normalizedEnvironmentId) {
                setMetronomeEnvironmentFilePickerState({ status: "error", error: "Select a computer before attaching files from the computer." });
                return;
              }
              const selectedEntries = metronomeEnvironmentFilePickerInventory.filter((entry) =>
                !entry.isFolder && metronomeEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
              );
              if (!selectedEntries.length) {
                return;
              }
              setMetronomeEnvironmentFilePickerState((current) => ({ ...current, error: "" }));
              setMetronomeAttachmentStatus("");
              setIsMetronomeAttachmentUploading(true);
              try {
                const uploadedAttachments = [];
                for (const entry of selectedEntries) {
                  const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(getMetronomeBackendUrl(), normalizedEnvironmentId, entry.path);
                  const response = await fetch(downloadUrl, {
                    method: "GET",
                    headers: requestHeaders || {},
                  });
                  if (!response.ok) {
                    throw new Error("Failed to load " + (entry.name || "file") + " (" + response.status + ")");
                  }
                  const blob = await response.blob();
                  const file = new globalThis.File([blob], entry.name || "file", {
                    type: entry.mimeType || blob.type || "application/octet-stream",
                  });
                  uploadedAttachments.push(await uploadMetronomeAttachmentFile(file, {
                    environmentId: normalizedEnvironmentId,
                    sourcePath: entry.path,
                  }));
                }
                appendMetronomeUploadedAttachments(uploadedAttachments);
                setMetronomeAttachmentModalOpen(false);
                setMetronomeEnvironmentFilePickerSelectedPaths([]);
                setMetronomeEnvironmentFilePickerSearch("");
                setMetronomeAttachmentStatus(uploadedAttachments.length === 1 ? "1 file attached." : uploadedAttachments.length + " files attached.");
                setIsMetronomeAttachmentUploading(false);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to attach computer files.";
                setMetronomeEnvironmentFilePickerState((current) => ({ ...current, error: errorMessage }));
                setMetronomeAttachmentStatus(errorMessage);
                setIsMetronomeAttachmentUploading(false);
              }
            };
            const renderMetronomeEnvironmentFilePickerIcon = (entry) => {
              if (entry?.isFolder) {
                return React.createElement("img", {
                  src: PLAYGROUND_FOLDER_ICON_URL,
                  alt: "",
                  draggable: false,
                  className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
                });
              }
              if (getPlaygroundFileKind(entry) === "image") {
                return React.createElement(ImageIcon, {
                  className: "tb-file-browser-item-icon tb-file-browser-item-icon-file",
                  strokeWidth: 1.75,
                });
              }
              return React.createElement("img", {
                src: PLAYGROUND_TEXT_FILE_ICON_URL,
                alt: "",
                draggable: false,
                className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
              });
            };
            const renderMetronomeEnvironmentFilePickerRow = (row) => {
              const entry = row.entry;
              const normalizedPath = normalizeHistoryPath(entry.path);
              const isSelected = metronomeEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
              const isExpanded = metronomeEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
              const metaValue = row.searchMatch
                ? getPlaygroundEntryParentPath(normalizedPath) || "Root"
                : formatPlaygroundFileDate(entry.modifiedTime || entry.createdTime);

              return React.createElement("div", { key: normalizedPath || entry.id },
                React.createElement("div", {
                  className: "tb-file-browser-item" + (isSelected ? " selected" : ""),
                  role: "button",
                  tabIndex: 0,
                  onClick: () => {
                    if (entry.isFolder && !row.searchMatch) {
                      toggleMetronomeEnvironmentFileFolder(normalizedPath);
                      return;
                    }
                    toggleMetronomeEnvironmentFileSelection(normalizedPath);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (entry.isFolder && !row.searchMatch) {
                        toggleMetronomeEnvironmentFileFolder(normalizedPath);
                        return;
                      }
                      toggleMetronomeEnvironmentFileSelection(normalizedPath);
                    }
                  },
                  style: row.searchMatch ? undefined : { paddingLeft: String(12 + row.level * 20) + "px" },
                },
                  entry.isFolder && !row.searchMatch
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-item-leading",
                        onClick: (event) => {
                          event.stopPropagation();
                          toggleMetronomeEnvironmentFileFolder(normalizedPath);
                        },
                      },
                        isExpanded
                          ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                          : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                      )
                    : React.createElement("div", {
                        className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                        onClick: (event) => {
                          event.stopPropagation();
                          toggleMetronomeEnvironmentFileSelection(normalizedPath);
                        },
                      },
                        isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                      ),
                  renderMetronomeEnvironmentFilePickerIcon(entry),
                  React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
                  React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
                  React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
                )
              );
            };
            const renderMetronomeEnvironmentFilePickerSidebar = (attachmentEnvironment) => React.createElement("div", { className: "tb-file-browser-sidebar" },
              React.createElement("div", { className: "tb-file-browser-search-wrap" },
                React.createElement("div", { className: "tb-file-browser-search" },
                  React.createElement(Search, { className: "tb-file-browser-search-icon", strokeWidth: 1.9 }),
                  React.createElement("input", {
                    className: "tb-file-browser-search-input",
                    value: metronomeEnvironmentFilePickerSearch,
                    placeholder: "Search files...",
                    onChange: (event) => setMetronomeEnvironmentFilePickerSearch(event.target.value),
                  }),
                  metronomeEnvironmentFilePickerSearch
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-search-clear",
                        onClick: () => setMetronomeEnvironmentFilePickerSearch(""),
                        "aria-label": "Clear search",
                      }, React.createElement(X, { className: "tb-file-browser-search-clear-icon", strokeWidth: 1.9 }))
                    : null
                )
              ),
              attachmentEnvironment
                ? React.createElement("div", { className: "tb-file-browser-sidebar-section tb-file-browser-sidebar-section-environments" },
                    React.createElement("div", { className: "tb-file-browser-sidebar-title" }, "Computers"),
                    React.createElement("div", { className: "tb-file-browser-sidebar-list tb-file-browser-sidebar-list-environments" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-source-row active",
                        onClick: () => void loadMetronomeEnvironmentFileInventory(attachmentEnvironment.id),
                      },
                        React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 }),
                        React.createElement("span", { className: "tb-file-browser-source-label" }, attachmentEnvironment.name || "Computer")
                      )
                    )
                  )
                : null
            );
            const renderThreadAttachments = (options = {}) => {
              const buttonLabel = String(options?.buttonLabel || "Upload from Computer").trim() || "Upload from Computer";
              const wrapperClassName = "playground-tasks-attachments playground-metronome-thread-attachments" + (options?.borderless ? " is-borderless" : "");
              const attachments = Array.isArray(config.attachments) ? config.attachments : [];
              const hasAttachments = attachments.length > 0;
              const openMetronomeAttachmentPicker = () => {
                if (metronomeAttachmentInputRef.current) {
                  metronomeAttachmentInputRef.current.click();
                }
              };
              const normalizeMetronomeAttachmentFiles = (fileList) => Array.from(fileList || [])
                .filter(Boolean)
                .map((file) => ({
                  id: "metronome_attachment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
                  name: file.name || "Attachment",
                  filename: file.name || "Attachment",
                  size: Number(file.size || 0),
                  type: file.type || "application/octet-stream",
                  source: "upload",
                }));
              const addMetronomeAttachmentFiles = (fileList) => {
                const nextFiles = normalizeMetronomeAttachmentFiles(fileList);
                if (!nextFiles.length) {
                  return;
                }
                updateSelectedNodeConfig("attachments", attachments.concat(nextFiles));
                setMetronomeAttachmentStatus(nextFiles.length === 1 ? "1 file attached." : nextFiles.length + " files attached.");
              };
              const removeMetronomeAttachment = (attachmentToRemove) => {
                const removeKey = String(attachmentToRemove?.id || attachmentToRemove?.path || attachmentToRemove?.filename || attachmentToRemove?.name || "");
                updateSelectedNodeConfig("attachments", attachments.filter((attachment, index) => {
                  const key = String(attachment?.id || attachment?.path || attachment?.filename || attachment?.name || index);
                  return key !== removeKey;
                }));
              };
              const renderMetronomeAttachmentChip = (attachment, index) => {
                const label = String(attachment?.filename || attachment?.name || attachment?.path || "Attachment");
                return React.createElement("div", {
                  key: String(attachment?.id || attachment?.path || label || index),
                  className: "runner-attachment runner-attachment-file",
                },
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-file-button",
                    tabIndex: -1,
                    "aria-label": "Attached " + label,
                  },
                    React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                      React.createElement(FileText, { className: "runner-attachment-file-icon", width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("div", { className: "runner-attachment-file-name", title: label }, label)
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-remove runner-attachment-remove-file",
                    "aria-label": "Remove " + label,
                    onClick: () => removeMetronomeAttachment(attachment),
                  }, React.createElement(X, { className: "runner-attachment-remove-icon", width: 12, height: 12, strokeWidth: 2 }))
                );
              };
              const handleMetronomeAttachmentDrop = (event) => {
                event.preventDefault();
                setIsMetronomeAttachmentDragging(false);
                addMetronomeAttachmentFiles(event.dataTransfer?.files);
              };
              return React.createElement("div", { className: wrapperClassName },
                React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                  React.createElement("div", { className: "playground-tasks-attachments-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                      onClick: openMetronomeEnvironmentFilePicker,
                    }, buttonLabel)
                  )
                ),
                React.createElement("input", {
                  ref: metronomeAttachmentInputRef,
                  type: "file",
                  multiple: true,
                  hidden: true,
                  onChange: (event) => {
                    addMetronomeAttachmentFiles(event.target.files);
                    event.target.value = "";
                  },
                }),
                React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                  React.createElement("div", {
                    className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isMetronomeAttachmentDragging ? " dragging" : "") + (hasAttachments ? " is-filled" : ""),
                    onDragOver: (event) => {
                      event.preventDefault();
                      setIsMetronomeAttachmentDragging(true);
                    },
                    onDragLeave: (event) => {
                      if (event.currentTarget.contains(event.relatedTarget)) {
                        return;
                      }
                      setIsMetronomeAttachmentDragging(false);
                    },
                    onDrop: handleMetronomeAttachmentDrop,
                  },
                    hasAttachments
                      ? React.createElement(React.Fragment, null,
                          React.createElement("div", { className: "playground-tasks-attachments-topline" },
                            React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                            React.createElement("span", null, isMetronomeAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-attachments-browse",
                              onClick: openMetronomeAttachmentPicker,
                            }, "browse.")
                          ),
                          React.createElement("div", { className: "runner-attachments" },
                            attachments.map((attachment, index) => renderMetronomeAttachmentChip(attachment, index))
                          )
                        )
                      : React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-attachments-empty-button",
                          onClick: openMetronomeAttachmentPicker,
                        },
                          React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                          React.createElement("span", { className: "tb-popup-dropzone-title" }, isMetronomeAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                          React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                        )
                    )
                ),
                metronomeAttachmentStatus
                  ? React.createElement("div", { className: "playground-tasks-attachments-status" }, metronomeAttachmentStatus)
                  : null
              );
            };
            const renderMetronomeAttachmentModal = () => {
              if (!metronomeAttachmentModalOpen) {
                return null;
              }

              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              const selectedFilesCount = metronomeEnvironmentFilePickerInventory.filter((entry) =>
                !entry.isFolder && metronomeEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
              ).length;
              const searchQuery = String(metronomeEnvironmentFilePickerSearch || "").trim();
              const metronomeEnvironmentFilePickerRows = searchQuery
                ? buildPlaygroundEnvironmentSearchRows(metronomeEnvironmentFilePickerInventory, searchQuery, { filesOnly: true })
                : buildPlaygroundEnvironmentVisibleRows(
                    buildPlaygroundEnvironmentTree(metronomeEnvironmentFilePickerInventory),
                    "",
                    new Set(metronomeEnvironmentFilePickerExpandedFolders)
                  ).map((row) => ({ ...row, searchMatch: false }));

              return React.createElement("div", { className: "tb-runner-chat playground-metronome-environment-file-picker-portal" },
                React.createElement(PlatformModalBackdrop, {
                  className: "tb-file-browser-scrim",
                  onClick: () => {
                    if (!isMetronomeAttachmentUploading) {
                      setMetronomeAttachmentModalOpen(false);
                    }
                  },
                },
                  React.createElement(PlatformModalSurface, {
                    className: "tb-file-browser-modal",
                    onClick: (event) => event.stopPropagation(),
                  },
                    React.createElement("div", { className: "tb-file-browser-body" },
                      renderMetronomeEnvironmentFilePickerSidebar(attachmentEnvironment),
                      React.createElement("div", { className: "tb-file-browser-main" },
                        React.createElement("div", { className: "tb-file-browser-header" },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-file-browser-nav-button",
                            onClick: () => {
                              if (!isMetronomeAttachmentUploading) {
                                setMetronomeAttachmentModalOpen(false);
                              }
                            },
                            "aria-label": "Close computer files",
                          }, React.createElement(X, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                          React.createElement("div", { className: "tb-file-browser-header-icon" },
                            React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 })
                          ),
                          React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                            React.createElement("span", { className: "tb-file-browser-breadcrumb-chip" },
                              React.createElement("button", {
                                type: "button",
                                className: "tb-file-browser-breadcrumb active",
                              }, attachmentEnvironment?.name || "Computer")
                            )
                          ),
                          React.createElement("div", { className: "tb-file-browser-count" }, selectedFilesCount + (selectedFilesCount === 1 ? " file selected" : " files selected"))
                        ),
                        React.createElement("div", { className: "tb-file-browser-list" },
                          metronomeEnvironmentFilePickerState.status === "loading"
                            ? React.createElement("div", { className: "tb-file-browser-empty" }, "Loading computer files...")
                            : metronomeEnvironmentFilePickerState.error
                              ? React.createElement("div", { className: "tb-file-browser-empty" }, metronomeEnvironmentFilePickerState.error)
                              : metronomeEnvironmentFilePickerRows.length === 0
                                ? React.createElement("div", { className: "tb-file-browser-empty" }, searchQuery ? "No matching files found." : "No files found on this computer.")
                                : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                    metronomeEnvironmentFilePickerRows.map((row) => renderMetronomeEnvironmentFilePickerRow(row))
                                  )
                        )
                      )
                    ),
                    React.createElement("div", { className: "tb-file-browser-footer" },
                      React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                        onClick: () => {
                          if (!isMetronomeAttachmentUploading) {
                            setMetronomeAttachmentModalOpen(false);
                          }
                        },
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        type: "button",
                        className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                        onClick: () => void handleAttachMetronomeEnvironmentFiles(),
                        disabled: selectedFilesCount === 0 || isMetronomeAttachmentUploading,
                      },
                        React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                          isMetronomeAttachmentUploading
                            ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                            : null,
                          React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                            isMetronomeAttachmentUploading ? "Attaching Files..." : "Attach Files"
                          )
                        )
                      )
                    )
                  )
                )
              );
            };
            const renderMetronomeAttachmentModalPortal = () => {
              const modalElement = renderMetronomeAttachmentModal();
              if (!modalElement) {
                return null;
              }
              if (typeof document === "undefined" || typeof createPortal !== "function") {
                return modalElement;
              }
              return createPortal(modalElement, document.body);
            };
            const renderThreadSettings = () => {
              const outputContractValue = config.outputContractJson || config.output_contract_json || "{\n  \"summary\": \"\",\n  \"urls\": [],\n  \"records\": [],\n  \"artifacts\": []\n}";
              const parsedOutputContract = parseMetronomeDynamicContentJsonObject(outputContractValue) || {};
              const outputContractEntries = Object.entries(parsedOutputContract);
              const outputContractTypeOptions = [
                { id: "string", label: "Text" },
                { id: "number", label: "Number" },
                { id: "boolean", label: "Boolean" },
                { id: "array", label: "List" },
                { id: "object", label: "Object" },
              ];
              const createOutputContractValue = (type) => {
                if (type === "number") return 0;
                if (type === "boolean") return false;
                if (type === "array") return [];
                if (type === "object") return {};
                return "";
              };
              const commitOutputContract = (nextContract) => {
                const safeContract = nextContract && typeof nextContract === "object" && !Array.isArray(nextContract)
                  ? nextContract
                  : {};
                updateSelectedNodeConfigPatch({
                  outputMode: "structured",
                  requireJsonOutput: true,
                  outputContractJson: JSON.stringify(safeContract, null, 2),
                  outputFieldsJson: JSON.stringify(Object.keys(safeContract), null, 2),
                });
              };
              const addOutputContractField = () => {
                const fieldKey = String(metronomeOutputContractComposer.key || "").trim().replace(/[^A-Za-z0-9_$-]+/g, "_").replace(/^_+|_+$/g, "");
                if (!fieldKey || Object.prototype.hasOwnProperty.call(parsedOutputContract, fieldKey)) return;
                commitOutputContract({
                  ...parsedOutputContract,
                  [fieldKey]: createOutputContractValue(metronomeOutputContractComposer.type),
                });
                setMetronomeOutputContractComposer({ key: "", type: "string" });
              };
              const removeOutputContractField = (fieldKey) => {
                const nextContract = { ...parsedOutputContract };
                delete nextContract[fieldKey];
                commitOutputContract(nextContract);
              };
              const renderThreadOutputContractBuilder = () => React.createElement("div", { className: "playground-metronome-field" },
                renderMetronomeFieldTitle("Output contract builder", "Define top-level structured fields. These become dynamic content for downstream nodes."),
                React.createElement("div", { className: "playground-metronome-output-contract-builder" },
                  outputContractEntries.length
                    ? React.createElement("div", { className: "playground-metronome-output-contract-rows" },
                        outputContractEntries.map(([fieldKey, fieldValue]) => React.createElement("div", {
                          key: fieldKey,
                          className: "playground-metronome-output-contract-row",
                        },
                          React.createElement("span", { className: "playground-metronome-output-contract-key", title: fieldKey }, fieldKey),
                          React.createElement("span", { className: "playground-metronome-output-contract-type" }, inferMetronomeDynamicContentValueType(fieldValue)),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-output-contract-delete",
                            onClick: () => removeOutputContractField(fieldKey),
                            title: "Remove field",
                            "aria-label": "Remove " + fieldKey,
                          }, React.createElement(X, { width: 12, height: 12, strokeWidth: 2 }))
                        ))
                      )
                    : React.createElement("p", { className: "playground-metronome-field-hint" }, "No structured fields yet."),
                  React.createElement("div", { className: "playground-metronome-output-contract-composer" },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-metronome-input",
                      value: metronomeOutputContractComposer.key,
                      placeholder: "field_name",
                      onKeyDown: (event) => {
                        stopMetronomeInputKeyPropagation(event);
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addOutputContractField();
                        }
                      },
                      onKeyUp: stopMetronomeInputKeyPropagation,
                      onChange: (event) => setMetronomeOutputContractComposer((current) => ({
                        ...current,
                        key: event.target.value,
                      })),
                    }),
                    React.createElement("select", {
                      className: "playground-metronome-select",
                      value: metronomeOutputContractComposer.type,
                      onChange: (event) => setMetronomeOutputContractComposer((current) => ({
                        ...current,
                        type: event.target.value,
                      })),
                    },
                      outputContractTypeOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-output-contract-add",
                      onClick: addOutputContractField,
                      disabled: !String(metronomeOutputContractComposer.key || "").trim(),
                      title: "Add output field",
                      "aria-label": "Add output field",
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 2 }))
                  )
                )
              );
              return React.createElement(React.Fragment, null,
              renderMetronomeRichTextField({
                fieldKey: "message",
                title: "Instructions",
                placeholder: "Add instructions here",
                tooltip: "Append instructions or context to the triggering message before the agent continues. Use this to pass project context, formatting requirements, or guidance for the next node summary.",
              }),
              renderMetronomeAgentSelector(),
              renderMetronomeWorkspaceSelector(),
              React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                React.createElement("div", { className: "playground-metronome-switch-copy" },
                  React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                    React.createElement("span", null, "Full workflow context"),
                    renderMetronomeFieldTooltip("Pass the full chain of previous node summaries into this thread. Turn off to pass only the latest node result.")
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-switch" + (normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest" ? " is-on" : ""),
                  role: "switch",
                  "aria-checked": normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest",
                  onClick: () => {
                    const currentScope = normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope);
                    updateSelectedNodeConfig("inputContextScope", currentScope === "latest" ? "all" : "latest");
                  },
                })
              ),
              React.createElement("div", { className: "playground-metronome-trigger-evaluate-row is-thread-more-row" + (isMetronomeThreadMoreOpen ? " is-open" : "") },
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-thread-more-toggle" + (isMetronomeThreadMoreOpen ? " is-open" : ""),
                  "aria-expanded": isMetronomeThreadMoreOpen ? "true" : "false",
                  onClick: () => setIsMetronomeThreadMoreOpen((value) => !value),
                },
                  React.createElement(ChevronDown, { className: "playground-metronome-thread-more-toggle-icon", width: 13, height: 13, strokeWidth: 1.9 }),
                  React.createElement("span", null, "More")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-trigger-evaluate-link",
                  onClick: () => setIsMetronomeTriggerDiagnosticsModalOpen(true),
                }, "Evaluate Node")
              ),
              React.createElement("div", { className: "playground-metronome-thread-more-sections" + (isMetronomeThreadMoreOpen ? " is-open" : "") },
                React.createElement("div", { className: "playground-metronome-thread-more-sections-inner" },
                    React.createElement("div", { className: "playground-metronome-field playground-metronome-thread-output-field" },
                      renderMetronomeFieldTitle("Output mode", "Structured output lets downstream Firecrawl, Database, and Function nodes bind to JSON, URLs, files, records, and artifacts."),
                      renderMetronomeInspectorSelect({
                        id: "thread-output-mode-" + (selectedNodeId || "selected"),
                        value: String(config.outputMode || config.output_mode || "text") === "structured" ? "structured" : "text",
                        options: [
                          { id: "text", label: "Narrative text" },
                          { id: "structured", label: "Structured JSON" },
                        ],
                        onChange: (nextValue) => updateSelectedNodeConfig("outputMode", nextValue),
                        searchPlaceholder: "Select output mode...",
                      })
                    ),
                    React.createElement("div", { className: "playground-metronome-field playground-metronome-thread-output-field" },
                      renderMetronomeFieldTitle("Output key", "Name this thread output so downstream nodes can bind to it, for example previous.menu_detection.records."),
                      React.createElement("input", {
                        className: "playground-metronome-input",
                        value: config.outputKey || config.output_key || "thread",
                        onChange: (event) => updateSelectedNodeConfig("outputKey", event.target.value),
                        placeholder: "thread",
                      })
                    ),
                    React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                      React.createElement("div", { className: "playground-metronome-switch-copy" },
                        React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                          React.createElement("span", null, "Require JSON output"),
                          renderMetronomeFieldTooltip("Ask the agent to produce machine-readable output for deterministic downstream nodes.")
                        )
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-metronome-switch" + (config.requireJsonOutput || config.require_json_output ? " is-on" : ""),
                        role: "switch",
                        "aria-checked": config.requireJsonOutput || config.require_json_output ? "true" : "false",
                        onClick: () => updateSelectedNodeConfig("requireJsonOutput", !(config.requireJsonOutput || config.require_json_output)),
                      })
                    ),
                    renderThreadOutputContractBuilder(),
                    renderMetronomeJsonEditorField({
                      title: "Output fields",
                      tooltip: "Fields that this thread can expose to following nodes.",
                      fieldKey: "outputFieldsJson",
                      value: config.outputFieldsJson || config.output_fields_json || JSON.stringify(METRONOME_THREAD_OUTPUT_FIELDS, null, 2),
                      path: "output-fields.json",
                    }),
                    renderMetronomeJsonEditorField({
                      title: "Output contract",
                      tooltip: "Optional JSON shape the agent should return when structured output is enabled.",
                      fieldKey: "outputContractJson",
                      value: config.outputContractJson || config.output_contract_json || "{\n  \"summary\": \"\",\n  \"urls\": [],\n  \"records\": [],\n  \"artifacts\": []\n}",
                      path: "output-contract.json",
                    })
                  )
                )
            );
            };
            const renderImagineSettings = () => {
              const templateOptions = getMetronomeImagineTemplateOptions();
              const selectedTemplate = templateOptions.find((option) => option.id === config.templateId) || null;
              const selectedMediaMode = normalizeMetronomeImagineMediaMode(config.mediaMode || selectedTemplate?.mediaType);
              const modelOptions = getMetronomeImagineModelOptions(selectedMediaMode);
              const selectedModelId = normalizeMetronomeImagineModelId(
                selectedMediaMode,
                selectedMediaMode === "video"
                  ? (config.videoModelId || config.modelId)
                  : (config.imageModelId || config.modelId)
              );
              const setImagineMediaMode = (nextMode) => {
                const normalizedMode = normalizeMetronomeImagineMediaMode(nextMode);
                const nextModelId = normalizeMetronomeImagineModelId(
                  normalizedMode,
                  normalizedMode === "video"
                    ? (config.videoModelId || config.modelId)
                    : (config.imageModelId || config.modelId)
                );
                updateSelectedNodeConfigPatch({
                  mediaMode: normalizedMode,
                  modelId: nextModelId,
                  ...(normalizedMode === "video" ? { videoModelId: nextModelId } : { imageModelId: nextModelId }),
                });
              };
              const setImagineModel = (nextModelId) => {
                const normalizedModelId = normalizeMetronomeImagineModelId(selectedMediaMode, nextModelId);
                updateSelectedNodeConfigPatch({
                  modelId: normalizedModelId,
                  ...(selectedMediaMode === "video" ? { videoModelId: normalizedModelId } : { imageModelId: normalizedModelId }),
                });
              };
              const selectImagineTemplate = (templateId) => {
                const nextTemplate = templateOptions.find((option) => option.id === templateId) || null;
                const nextMediaMode = normalizeMetronomeImagineMediaMode(nextTemplate?.mediaType || selectedMediaMode);
                const nextModelId = normalizeMetronomeImagineModelId(
                  nextMediaMode,
                  nextMediaMode === "video"
                    ? (config.videoModelId || config.modelId)
                    : (config.imageModelId || config.modelId)
                );
                const currentPrompt = String(config.prompt || "").trim();
                const shouldReplacePrompt = !currentPrompt
                  || currentPrompt === "Create an image from this workflow context."
                  || currentPrompt === "Create a video from this workflow context."
                  || (selectedTemplate?.prompt && currentPrompt === selectedTemplate.prompt);
                updateSelectedNodeConfigPatch({
                  templateId: nextTemplate?.id || "",
                  templateName: nextTemplate?.title || "",
                  mediaMode: nextMediaMode,
                  modelId: nextModelId,
                  ...(nextMediaMode === "video" ? { videoModelId: nextModelId } : { imageModelId: nextModelId }),
                  ...(shouldReplacePrompt ? { prompt: nextTemplate?.prompt || (nextMediaMode === "video" ? "Create a video from this workflow context." : "Create an image from this workflow context.") } : {}),
                });
              };

              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Template"),
                  renderMetronomeInspectorSelect({
                    id: "imagine-template-" + (selectedNodeId || "selected"),
                    value: config.templateId || "",
                    options: [
                      { id: "", label: "Select template" },
                      ...templateOptions.map((option) => ({
                        id: option.id,
                        label: option.title + (normalizeMetronomeImagineMediaMode(option.mediaType) === "video" ? " · Video" : " · Image"),
                        description: option.description || option.prompt || "",
                      })),
                    ],
                    onChange: (nextValue) => selectImagineTemplate(nextValue),
                    searchPlaceholder: "Select a template...",
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Mode"),
                  renderMetronomeInspectorSelect({
                    id: "imagine-mode-" + (selectedNodeId || "selected"),
                    value: selectedMediaMode,
                    options: [
                      { id: "image", label: "Image", description: "Generate still images from workflow context." },
                      { id: "video", label: "Video", description: "Generate short videos from workflow context." },
                    ],
                    onChange: (nextValue) => setImagineMediaMode(nextValue),
                    searchPlaceholder: "Select mode...",
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-imagine-model-field" },
                  renderMetronomeFieldTitle(
                    selectedMediaMode === "video" ? "Video model" : "Image model",
                    (modelOptions.find((option) => option.id === selectedModelId) || modelOptions[0])?.description || ""
                  ),
                  renderMetronomeInspectorSelect({
                    id: "imagine-model-" + selectedMediaMode + "-" + (selectedNodeId || "selected"),
                    value: selectedModelId,
                    options: modelOptions.map((option) => ({
                      id: option.id,
                      label: option.label,
                      description: option.description || "",
                    })),
                    onChange: (nextValue) => setImagineModel(nextValue),
                    searchPlaceholder: "Select a model...",
                  })
                ),
                renderMetronomeRichTextField({
                  fieldKey: "prompt",
                  title: "Instructions",
                  placeholder: selectedMediaMode === "video" ? "Describe the video to generate" : "Describe the image to generate",
                  tooltip: "Append generation instructions to the workflow context before Imagine runs. The node can use summaries and artifacts from previous nodes.",
                  isInstructionsField: true,
                }),
                renderMetronomeAgentSelector(),
                renderMetronomeWorkspaceSelector(),
                React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "Full workflow context"),
                      renderMetronomeFieldTooltip("Pass the full chain of previous node summaries into Imagine. Turn off to pass only the latest node result.")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-switch" + (normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest" ? " is-on" : ""),
                    role: "switch",
                    "aria-checked": normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope) !== "latest",
                    onClick: () => {
                      const currentScope = normalizeMetronomeInputContextScope(config.inputContextScope || config.input_context_scope || config.contextScope || config.context_scope);
                      updateSelectedNodeConfig("inputContextScope", currentScope === "latest" ? "all" : "latest");
                    },
                  })
                )
              );
            };
            const renderTicketSettings = () => {
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              const ticketActionOptions = [
                { id: "adapt_ticket", label: "Adapt ticket" },
                { id: "add_ticket_comment", label: "Add comment to ticket" },
                { id: "move_ticket_status", label: "Move ticket status" },
                { id: "start_work_on_ticket", label: "Start work on ticket" },
                { id: "add_subtask", label: "Add Subtask" },
              ];
              const selectedTicketAction = normalizeMetronomeTicketOperation(config.operation || subtype);
              const isAdaptTicket = selectedTicketAction === "adapt_ticket";
              const isStatusUpdate = selectedTicketAction === "move_ticket_status";
              const isComment = selectedTicketAction === "add_ticket_comment";
              const isStartWork = selectedTicketAction === "start_work_on_ticket";
              const isAddSubtask = selectedTicketAction === "add_subtask";
              const selectedProject = metronomeProjectOptions.find((option) => option.id === config.projectId) || null;
              const embeddedTicketOptions = extractMetronomeProjectTicketOptions(selectedProject);
              const fetchedTicketOptions = config.projectId && Object.prototype.hasOwnProperty.call(metronomeProjectTicketsByProjectId, config.projectId)
                ? (metronomeProjectTicketsByProjectId[config.projectId] || [])
                : [];
              const ticketOptionsBase = fetchedTicketOptions.length > 0 ? fetchedTicketOptions : embeddedTicketOptions;
              const normalizedCurrentTicket = config.ticketId
                ? normalizeMetronomeTicketOption({
                    id: config.ticketId,
                    title: config.ticketTitle || config.ticketId,
                    ticketNumber: config.ticketNumber || "",
                    status: config.ticketStatus || "planned",
                    projectId: config.projectId || "",
                    projectName: config.projectName || "",
                  }, selectedProject)
                : null;
              const ticketOptions = normalizedCurrentTicket && !ticketOptionsBase.some((option) => option.id === normalizedCurrentTicket.id)
                ? [normalizedCurrentTicket, ...ticketOptionsBase]
                : ticketOptionsBase;
              const formatTicketOptionLabel = (ticket) => {
                const ticketNumber = String(ticket?.ticketNumber || "").trim();
                const title = String(ticket?.title || ticket?.name || ticket?.id || "").trim();
                return [ticketNumber, title].filter(Boolean).join(" · ") || title || "Untitled ticket";
              };
              const renderTicketSelector = () => React.createElement("div", { className: "playground-metronome-field" },
                renderMetronomeFieldTitle("Ticket"),
                renderMetronomeInspectorSelect({
                  id: "ticket-target-" + (selectedNodeId || "selected"),
                  value: config.ticketId || "",
                  disabled: !config.projectId,
                  options: [
                    { id: "", label: config.projectId ? "Select ticket" : "Select project first" },
                    ...ticketOptions.map((ticket) => ({
                      id: ticket.id,
                      label: formatTicketOptionLabel(ticket),
                      description: ticket.status || ticket.projectName || "",
                    })),
                  ],
                  onChange: (nextTicketId) => {
                    const nextTicket = ticketOptions.find((ticket) => ticket.id === nextTicketId) || null;
                    updateSelectedNodeConfigPatch({
                      ticketId: nextTicketId,
                      ticketTitle: nextTicket?.title || "",
                      ticketNumber: nextTicket?.ticketNumber || "",
                      ticketStatus: nextTicket?.status || config.ticketStatus || "planned",
                    });
                  },
                  searchPlaceholder: "Select a ticket...",
                })
              );
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Project"),
                  renderMetronomeInspectorSelect({
                    id: "ticket-project-" + (selectedNodeId || "selected"),
                    value: config.projectId || "",
                    options: [
                      { id: "", label: "Select project" },
                      ...metronomeProjectOptions.map((option) => ({
                        id: option.id,
                        label: option.name,
                        description: option.description || option.id || "",
                      })),
                    ],
                    onChange: (nextProjectId) => {
                      const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                      updateSelectedNodeConfigPatch({
                        projectId: nextProjectId,
                        projectName: nextProject?.name || "",
                        ticketId: "",
                        ticketTitle: "",
                        ticketNumber: "",
                        ticketStatus: config.ticketStatus || "planned",
                      });
                    },
                    searchPlaceholder: "Select a project...",
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Action"),
                  renderMetronomeInspectorSelect({
                    id: "ticket-action-" + (selectedNodeId || "selected"),
                    value: selectedTicketAction,
                    options: ticketActionOptions,
                    onChange: (nextAction) => {
                      const nextOperation = normalizeMetronomeTicketOperation(nextAction);
                      updateSelectedNodeData({
                        subtype: nextOperation,
                        description: getMetronomeSubtypeLabel("ticket", nextOperation),
                      });
                      updateSelectedNodeConfigPatch({
                        operation: nextOperation,
                        projectId: config.projectId || "",
                        projectName: config.projectName || "",
                        ticketId: config.ticketId || "",
                        ticketTitle: config.ticketTitle || "",
                        ticketStatus: config.ticketStatus || "planned",
                        comment: config.comment || "",
                        adaptationInstructions: config.adaptationInstructions || "",
                        subtaskTitle: config.subtaskTitle || "",
                        subtaskInstructions: config.subtaskInstructions || "Create a focused subtask from the workflow context.",
                        workInstructions: config.workInstructions || "Start work on this ticket and return a short implementation summary.",
                        agentId: config.agentId || defaultMetronomeAgentOption?.id || METRONOME_FALLBACK_AGENTS[0].id,
                        agentName: config.agentName || defaultMetronomeAgentOption?.name || METRONOME_FALLBACK_AGENTS[0].name,
                        environmentId: config.environmentId || defaultMetronomeComputerOption?.id || METRONOME_FALLBACK_COMPUTERS[0].id,
                        environmentName: config.environmentName || defaultMetronomeComputerOption?.name || METRONOME_FALLBACK_COMPUTERS[0].name,
                        fieldsJson: config.fieldsJson || "{\n  \"status\": \"planned\"\n}",
                      });
                    },
                    searchPlaceholder: "Select an action...",
                  })
                ),
                renderTicketSelector(),
                isAdaptTicket
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeAgentSelector({ title: "Assignee", popupTitle: "Assignee" }),
                      renderMetronomeWorkspaceSelector(),
                      renderMetronomeRichTextField({
                        fieldKey: "adaptationInstructions",
                        title: "Instructions",
                        placeholder: "Describe how the ticket should be adapted from the workflow context.",
                        tooltip: "Use this when previous node output should update the ticket title, body, status, or fields.",
                        isInstructionsField: true,
                      })
                    )
                  : null,
                isStatusUpdate
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      renderMetronomeFieldTitle("Status"),
                      renderMetronomeInspectorSelect({
                        id: "ticket-status-" + (selectedNodeId || "selected"),
                        value: config.ticketStatus || "planned",
                        options: ticketStatusOptions,
                        onChange: (nextValue) => updateSelectedNodeConfig("ticketStatus", nextValue),
                        searchPlaceholder: "Select a status...",
                      })
                    )
                  : null,
                isComment
                  ? renderMetronomeRichTextField({
                      fieldKey: "comment",
                      title: "Comment",
                      placeholder: "Write a ticket comment",
                      tooltip: "Write the comment that should be added to the selected project ticket.",
                    })
                  : null,
                isStartWork
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeAgentSelector(),
                      renderMetronomeWorkspaceSelector(),
                      renderMetronomeRichTextField({
                        fieldKey: "workInstructions",
                        title: "Work instructions",
                        placeholder: "Tell the agent how to start work on the selected ticket.",
                        tooltip: "The workflow will start an agent thread with the ticket context and these instructions.",
                      })
                    )
                  : null,
                isAddSubtask
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Subtask title"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.subtaskTitle || "",
                          placeholder: "Follow-up implementation task",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("subtaskTitle", event.target.value),
                        })
                      ),
                      renderMetronomeAgentSelector({ title: "Assignee", popupTitle: "Assignee" }),
                      renderMetronomeWorkspaceSelector(),
                      renderMetronomeRichTextField({
                        fieldKey: "subtaskInstructions",
                        title: "Subtask instructions",
                        placeholder: "Describe the subtask that should be added under the selected ticket.",
                        tooltip: "Create a child task connected to the selected ticket. Use workflow context to define scope, acceptance criteria, and owner guidance.",
                      })
                    )
                  : null
              );
            };
            const renderFirecrawlSettings = () => {
              const operation = normalizeMetronomeFirecrawlOperation(config.operation || subtype);
            const isSearch = operation === "web_search";
            const isScrape = operation === "scrape_url";
            const isParse = operation === "parse_document";
            const isExtract = operation === "extract_data";
              const parsedCredentialRef = parseMetronomeSecretCredentialRef(config.credentialRef || config.credential_ref || "");
              const credentialVaultId = String(config.credentialVaultId || config.credential_vault_id || parsedCredentialRef.vaultId || "").trim();
              const credentialSecretId = String(config.credentialSecretId || config.credential_secret_id || parsedCredentialRef.secretId || "").trim();
              const credentialVaultSecrets = credentialVaultId && Array.isArray(metronomeSecretVaultSecretsByVaultId[credentialVaultId])
                ? metronomeSecretVaultSecretsByVaultId[credentialVaultId]
                : [];
              const isCredentialSecretsLoading = credentialVaultId && metronomeSecretVaultSecretsLoadingId === credentialVaultId;
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Credential", "Use the managed Computer Agents Firecrawl credential by default, billed as usage. Choose a Secrets resource to use your own key."),
                  renderMetronomeInspectorSelect({
                    id: "firecrawl-credential-vault-" + (selectedNodeId || "selected"),
                    value: credentialVaultId,
                    options: [
                      { id: "", label: "Computer Agents Firecrawl", description: "Managed credential" },
                      ...metronomeSecretVaultOptions.map((option) => ({
                        id: option.id,
                        label: option.name,
                        description: option.description || option.id || "",
                      })),
                    ],
                    onChange: (nextValue) => {
                      const nextVaultId = String(nextValue || "").trim();
                      const nextVault = metronomeSecretVaultOptions.find((option) => option.id === nextVaultId) || null;
                      updateSelectedNodeConfigPatch({
                        credentialVaultId: nextVaultId,
                        credentialVaultName: nextVault?.name || "",
                        credentialSecretId: "",
                        credentialSecretName: "",
                        credentialRef: nextVaultId ? "" : "workspace:FIRECRAWL_API_KEY",
                      });
                      if (nextVaultId) {
                        void loadMetronomeSecretVaultSecrets(nextVaultId, { force: true });
                      }
                    },
                    searchPlaceholder: "Select credential...",
                  })
                ),
                credentialVaultId
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      renderMetronomeFieldTitle("Credential", "Select the Firecrawl API key stored in the chosen secrets resource."),
                      renderMetronomeInspectorSelect({
                        id: "firecrawl-credential-secret-" + (selectedNodeId || "selected"),
                        value: credentialSecretId,
                        disabled: isCredentialSecretsLoading,
                        options: [
                          { id: "", label: isCredentialSecretsLoading ? "Loading credentials..." : "Select credential" },
                          ...credentialVaultSecrets.map((secret) => ({
                            id: secret.id,
                            label: secret.name,
                            description: secret.description || secret.id || "",
                          })),
                        ],
                        onChange: (nextValue) => {
                          const nextSecretId = String(nextValue || "").trim();
                          const nextSecret = credentialVaultSecrets.find((secret) => secret.id === nextSecretId) || null;
                          updateSelectedNodeConfigPatch({
                            credentialSecretId: nextSecretId,
                            credentialSecretName: nextSecret?.name || "",
                            credentialRef: nextSecretId ? buildMetronomeSecretCredentialRef(credentialVaultId, nextSecretId) : "",
                          });
                        },
                        searchPlaceholder: "Select credential...",
                      })
                    )
                  : null,
                credentialVaultId && !isCredentialSecretsLoading && !credentialVaultSecrets.length
                  ? React.createElement("p", { className: "playground-metronome-field-hint playground-metronome-firecrawl-credential-hint" }, "No credentials found in this secrets resource yet.")
                  : null,
                !credentialVaultId
                  ? React.createElement("p", { className: "playground-metronome-field-hint playground-metronome-firecrawl-credential-hint" }, "Managed by Computer Agents and billed as usage.")
                  : null,
                !metronomeSecretVaultOptions.length
                  ? React.createElement("p", { className: "playground-metronome-field-hint playground-metronome-firecrawl-credential-hint" }, "Create a Secrets resource in Develop mode to use your own Firecrawl key.")
                  : null,
                isSearch
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Query",
                        fieldKey: "inputBinding",
                        fallback: "last.text",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.text", label: "Previous node text" },
                          { id: "last.json.query", label: "Previous node JSON query" },
                          { id: "trigger.input", label: "Trigger input" },
                          { id: "workflow.context", label: "Full workflow context" },
                        ],
                      }),
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-firecrawl-fallback-field" },
                        renderMetronomeFieldTitle("Fallback", "Used when the selected binding does not provide a query."),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.query || "",
                          placeholder: "latest pricing changes",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("query", event.target.value),
                        })
                      )
                    )
                  : null,
                isScrape
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "URL source",
                        fieldKey: "inputBinding",
                        fallback: "last.urls",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.urls", label: "Previous node URLs" },
                          { id: "last.json.url", label: "Previous node JSON URL" },
                          { id: "trigger.input.url", label: "Trigger input URL" },
                        ],
                      }),
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-firecrawl-fallback-field" },
                        renderMetronomeFieldTitle("Fallback URL"),
                        React.createElement("input", {
                          type: "url",
                          className: "playground-metronome-input",
                          value: config.url || "",
                          placeholder: "https://example.com",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("url", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Formats"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.formats || "markdown,html",
                          placeholder: "markdown,html",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("formats", event.target.value),
                        })
                      )
                    )
                  : null,
                isParse
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Document source",
                        fieldKey: "inputBinding",
                        fallback: "last.files",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.files", label: "Previous node files" },
                          { id: "last.documents", label: "Previous node documents" },
                          { id: "last.json.filePath", label: "Previous node JSON file path" },
                        ],
                      }),
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-firecrawl-fallback-field" },
                        renderMetronomeFieldTitle("Fallback file path"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.filePath || config.file_path || "",
                          placeholder: "/workspace/uploads/report.pdf",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("filePath", event.target.value),
                        })
                      )
                    )
                  : null,
                isExtract
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Source",
                        fieldKey: "inputBinding",
                        fallback: "last.documents",
                        className: "playground-metronome-firecrawl-source-field",
                        options: [
                          { id: "last.documents", label: "Previous node documents" },
                          { id: "last.json", label: "Previous node JSON" },
                          { id: "last.text", label: "Previous node text" },
                          { id: "workflow.context", label: "Full workflow context" },
                        ],
                      }),
                      renderMetronomeRichTextField({
                        fieldKey: "prompt",
                        title: "Instructions",
                        placeholder: "Extract company name, price, date, and source URL.",
                        tooltip: "Describe the structured data Firecrawl should extract from the selected source.",
                        isInstructionsField: true,
                      }),
                      renderMetronomeJsonEditorField({
                        title: "Output schema",
                        fieldKey: "schemaJson",
                        value: config.schemaJson || config.schema_json || "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
                        path: "extract-schema.json",
                      })
                    )
                  : null,
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Limit", "Maximum number of Firecrawl results, pages, or documents this node may return."),
                  React.createElement("input", {
                    type: "number",
                    min: "1",
                    max: "50",
                    className: "playground-metronome-input",
                    value: Number.isFinite(Number(config.limit)) ? String(config.limit) : "5",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("limit", Number(event.target.value) || 1),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "Save artifacts"),
                      renderMetronomeFieldTooltip("Store scraped pages, parsed documents, and extracted records as workflow artifacts for following nodes.")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-switch" + (config.saveArtifacts === false || config.save_artifacts === false ? "" : " is-on"),
                    role: "switch",
                    "aria-checked": config.saveArtifacts === false || config.save_artifacts === false ? "false" : "true",
                    onClick: () => updateSelectedNodeConfig("saveArtifacts", config.saveArtifacts === false || config.save_artifacts === false),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-firecrawl-output-key-field" },
                  renderMetronomeFieldTitle("Output key", "Name this Firecrawl output so downstream nodes can bind to it, for example previous.firecrawl.documents."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.outputKey || config.output_key || "firecrawl",
                    placeholder: "firecrawl",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("outputKey", event.target.value),
                  })
                )
              );
            };
            const renderTableSettings = () => {
              const operation = normalizeMetronomeTableOperation(config.operation || subtype);
              const inlineTableContent = String(config.content || config.csvText || config.csv_text || config.tsvText || config.tsv_text || "").trim();
              const inlineTableSourceName = String(config.sourceName || config.source_name || config.fixturePath || config.fixture_path || config.fixture || "").trim();
              const inlineTableLineCount = inlineTableContent
                ? inlineTableContent.split(/\r?\n/).filter((line) => line.trim()).length
                : 0;
              const inlineTableDataRowCount = inlineTableLineCount > 0 && config.hasHeader !== false && config.has_header !== false
                ? Math.max(0, inlineTableLineCount - 1)
                : inlineTableLineCount;
              const inlineTableSummary = inlineTableContent
                ? [
                    inlineTableSourceName || (operation === "parse_tsv" ? "Embedded TSV" : "Embedded CSV"),
                    inlineTableDataRowCount ? inlineTableDataRowCount + " row" + (inlineTableDataRowCount === 1 ? "" : "s") : "",
                    inlineTableContent.length ? inlineTableContent.length.toLocaleString() + " chars" : "",
                  ].filter(Boolean).join(" · ")
                : "";
              return React.createElement(React.Fragment, null,
                renderMetronomeDataBindingSelect({
                  title: "Source",
                  fieldKey: "inputBinding",
                  fallback: "trigger.input.files",
                  options: [
                    { id: "workflow.trigger.input.csvContent", label: "Trigger CSV content", description: "CSV text sent with the workflow run." },
                    { id: "trigger.input.files", label: "Trigger files" },
                    { id: "trigger.input", label: "Trigger input" },
                    { id: "last.files", label: "Previous node files" },
                    { id: "last.text", label: "Previous node text" },
                    { id: "last.records", label: "Previous node records" },
                    { id: "workflow.context", label: "Full workflow context" },
                  ],
                }),
                inlineTableContent
                  ? React.createElement("div", { className: "playground-metronome-field playground-metronome-table-inline-source-field" },
                      renderMetronomeFieldTitle("Content", "Inline CSV/TSV content bundled with this node and used if the selected binding does not provide content."),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: inlineTableSummary,
                        disabled: true,
                        readOnly: true,
                      })
                    )
                  : null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-table-fallback-field" },
                  renderMetronomeFieldTitle("Fallback File", "Used when the source binding does not contain inline CSV/TSV text or a file reference."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.filePath || config.file_path || "",
                    placeholder: operation === "parse_tsv" ? "/workspace/uploads/data.tsv" : "/workspace/uploads/data.csv",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("filePath", event.target.value),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Delimiter", "Leave empty to auto-detect comma, semicolon, or tab-delimited data."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.delimiter || "",
                    placeholder: operation === "parse_tsv" ? "\\t" : "auto",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("delimiter", event.target.value),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-switch-row is-workflow-context" },
                  React.createElement("div", { className: "playground-metronome-switch-copy" },
                    React.createElement("span", { className: "playground-metronome-switch-title-with-tooltip" },
                      React.createElement("span", null, "First row contains headers"),
                      renderMetronomeFieldTooltip("Headers are normalized into snake_case keys while preserving the original labels.")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-switch" + (config.hasHeader === false || config.has_header === false ? "" : " is-on"),
                    role: "switch",
                    "aria-checked": config.hasHeader === false || config.has_header === false ? "false" : "true",
                    onClick: () => updateSelectedNodeConfig("hasHeader", config.hasHeader === false || config.has_header === false),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-table-batch-size-field" },
                  renderMetronomeFieldTitle("Batch size", "Creates a batches array for downstream database or loop nodes. Use 0 to disable batching."),
                  React.createElement("input", {
                    type: "number",
                    min: "0",
                    max: "10000",
                    className: "playground-metronome-input",
                    value: Number.isFinite(Number(config.batchSize || config.batch_size)) ? String(config.batchSize || config.batch_size) : "5",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("batchSize", Math.max(0, Number(event.target.value) || 0)),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-table-output-key-field" },
                  renderMetronomeFieldTitle("Output key", "Name this parsed table output so downstream nodes can bind to records, batches, and columns."),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.outputKey || config.output_key || "table",
                    placeholder: "table",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("outputKey", event.target.value),
                  })
                )
              );
            };
            const renderDatabaseSettings = () => {
              const isDeleteOperation = subtype === "delete_document";
              const isBulkWriteOperation = subtype === "insert_many_documents" || subtype === "upsert_many_documents";
              const documentJson = String(config.documentJson || config.document || "{\n  \"source\": \"metronome\",\n  \"payload\": \"{{ input }}\"\n}");
              const databaseEditMode = String(config.databaseEditMode || "direct") === "json" ? "json" : "direct";
              const parsedDocument = parseMetronomeDatabaseDocumentObject(documentJson);
              const fieldTypeLabels = {
                string: "String",
                number: "Number",
                boolean: "Boolean",
                null: "Null",
                map: "Map",
                array: "Array",
              };
              const commitDocumentObject = (nextDocument) => {
                updateSelectedNodeConfig("documentJson", formatMetronomeDatabaseDocumentJson(nextDocument));
              };
              const toggleDatabasePath = (path) => {
                const pathKey = getMetronomeDatabasePathKey(path);
                setMetronomeDatabaseExpandedPaths((current) => ({
                  ...current,
                  [pathKey]: current[pathKey] === false ? true : false,
                }));
              };
              const updateDatabaseFieldValue = (path, rawValue) => {
                if (!parsedDocument) return;
                const currentValue = getMetronomeDatabaseValueAtPath(parsedDocument, path);
                commitDocumentObject(setMetronomeDatabaseValueAtPath(parsedDocument, path, coerceMetronomeDatabaseFieldValue(currentValue, rawValue)));
              };
              const deleteDatabaseFieldValue = (path) => {
                if (!parsedDocument) return;
                commitDocumentObject(deleteMetronomeDatabaseValueAtPath(parsedDocument, path));
              };
              const closeMetronomeDatabaseFieldComposer = () => {
                setMetronomeDatabaseFieldComposerState({
                  open: false,
                  parentPath: [],
                  key: "",
                  type: "string",
                  value: "",
                  error: "",
                });
              };
              const openMetronomeDatabaseFieldComposer = (parentPath = []) => {
                setMetronomeDatabaseFieldComposerState({
                  open: true,
                  parentPath: Array.isArray(parentPath) ? parentPath : [],
                  key: "",
                  type: "string",
                  value: "",
                  error: "",
                });
              };
              const submitMetronomeDatabaseFieldComposer = (event) => {
                event.preventDefault();
                if (!parsedDocument) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Document JSON must be an object." }));
                  return;
                }
                const parentPath = Array.isArray(metronomeDatabaseFieldComposerState.parentPath)
                  ? metronomeDatabaseFieldComposerState.parentPath
                  : [];
                const parentValue = parentPath.length
                  ? getMetronomeDatabaseValueAtPath(parsedDocument, parentPath)
                  : parsedDocument;
                if (!parentValue || typeof parentValue !== "object" || Array.isArray(parentValue)) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Fields can only be added to objects." }));
                  return;
                }
                const fieldKey = String(metronomeDatabaseFieldComposerState.key || "").trim();
                if (!fieldKey) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Enter a field name." }));
                  return;
                }
                if (Object.prototype.hasOwnProperty.call(parentValue, fieldKey)) {
                  setMetronomeDatabaseFieldComposerState((current) => ({ ...current, error: "Field already exists." }));
                  return;
                }
                let fieldValue;
                try {
                  fieldValue = createMetronomeDatabaseFieldValue(
                    metronomeDatabaseFieldComposerState.type,
                    metronomeDatabaseFieldComposerState.value
                  );
                } catch (error) {
                  setMetronomeDatabaseFieldComposerState((current) => ({
                    ...current,
                    error: error?.message || "Field value is invalid.",
                  }));
                  return;
                }
                const nextPath = [...parentPath, fieldKey];
                commitDocumentObject(setMetronomeDatabaseValueAtPath(parsedDocument, nextPath, fieldValue));
                setMetronomeDatabaseExpandedPaths((current) => ({
                  ...current,
                  ...(parentPath.length ? { [getMetronomeDatabasePathKey(parentPath)]: true } : {}),
                  [getMetronomeDatabasePathKey(nextPath)]: true,
                }));
                closeMetronomeDatabaseFieldComposer();
              };
              const renderDatabaseFieldValueEditor = (path, value) => {
                const fieldType = getMetronomeDatabaseFieldType(value);
                if (fieldType === "boolean") {
                  return React.createElement("select", {
                    className: "playground-metronome-database-value-select",
                    value: value ? "true" : "false",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateDatabaseFieldValue(path, event.target.value),
                  },
                    React.createElement("option", { value: "true" }, "true"),
                    React.createElement("option", { value: "false" }, "false")
                  );
                }
                if (fieldType === "null") {
                  return React.createElement("span", { className: "playground-metronome-database-value-static" }, "null");
                }
                if (fieldType === "map" || fieldType === "array") {
                  return React.createElement("span", { className: "playground-metronome-database-field-preview" }, formatMetronomeDatabaseFieldPreview(value));
                }
                return React.createElement("input", {
                  type: fieldType === "number" ? "number" : "text",
                  className: "playground-metronome-database-value-input",
                  value: fieldType === "number" ? String(Number.isFinite(Number(value)) ? value : 0) : String(value || ""),
                  placeholder: fieldType === "number" ? "0" : "Value",
                  onKeyDown: stopMetronomeInputKeyPropagation,
                  onKeyUp: stopMetronomeInputKeyPropagation,
                  onChange: (event) => updateDatabaseFieldValue(path, event.target.value),
                });
              };
              const renderDatabaseFieldRows = (containerValue, parentPath = [], depth = 0) => {
                const entries = Array.isArray(containerValue)
                  ? containerValue.map((item, index) => [String(index), item])
                  : Object.entries(containerValue || {});
                if (!entries.length) {
                  return React.createElement("div", { className: "playground-metronome-database-empty-fields" }, "No fields in this object.");
                }
                return React.createElement("div", { className: depth === 0 ? "playground-metronome-database-field-tree" : "playground-metronome-database-field-children" },
                  entries.map(([key, value]) => {
                    const path = [...parentPath, key];
                    const pathKey = getMetronomeDatabasePathKey(path);
                    const fieldType = getMetronomeDatabaseFieldType(value);
                    const canExpand = fieldType === "map" || fieldType === "array";
                    const isExpanded = canExpand && metronomeDatabaseExpandedPaths[pathKey] !== false;
                    return React.createElement("div", { key: pathKey || key, className: "playground-metronome-database-field-node" },
                      React.createElement("div", {
                        className: "playground-metronome-database-field-row",
                        style: depth ? { paddingLeft: Math.min(depth * 14, 56) + "px" } : undefined,
                      },
                        React.createElement("div", { className: "playground-metronome-database-field-main" },
                          canExpand
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-metronome-database-field-toggle" + (isExpanded ? " is-expanded" : ""),
                                "aria-label": isExpanded ? "Collapse field" : "Expand field",
                                onClick: () => toggleDatabasePath(path),
                              }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                            : React.createElement("span", { className: "playground-metronome-database-field-toggle-placeholder", "aria-hidden": "true" }),
                          React.createElement("span", { className: "playground-metronome-database-field-key" }, key),
                          React.createElement("span", { className: "playground-metronome-database-field-separator" }, ":"),
                          React.createElement("span", { className: "playground-metronome-database-field-type-pill" }, fieldTypeLabels[fieldType] || fieldType)
                        ),
                        React.createElement("div", { className: "playground-metronome-database-field-value-shell" },
                          renderDatabaseFieldValueEditor(path, value)
                        ),
	                        React.createElement("div", { className: "playground-metronome-database-field-actions" },
                          fieldType === "map"
                            ? React.createElement("button", {
                                type: "button",
                                className: "playground-metronome-database-field-action",
                                title: "Add nested field",
                                "aria-label": "Add nested field",
                                onClick: () => openMetronomeDatabaseFieldComposer(path),
                              }, React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }))
                            : null,
	                          React.createElement("button", {
	                            type: "button",
	                            className: "playground-metronome-database-field-action is-danger",
	                            title: "Delete field",
                            "aria-label": "Delete field",
                            onClick: () => deleteDatabaseFieldValue(path),
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                        )
                      ),
                      canExpand && isExpanded
                        ? renderDatabaseFieldRows(value, path, depth + 1)
                        : null
                    );
                  })
                );
              };
              const renderDatabaseDirectEditor = () => {
                if (!parsedDocument) {
                  return React.createElement("div", { className: "playground-metronome-database-empty-fields" },
                    React.createElement("span", null, "Document JSON must be an object before it can be edited directly."),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-database-add-field",
                      onClick: () => updateSelectedNodeConfig("databaseEditMode", "json"),
                    }, "Open JSON editor")
                  );
                }
		                return React.createElement("div", { className: "playground-metronome-database-fields-body" },
                      React.createElement("div", { className: "playground-metronome-database-fields-header" },
                        React.createElement("div", { className: "playground-metronome-database-fields-title" }, "Fields"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-metronome-database-add-field",
                          onClick: () => openMetronomeDatabaseFieldComposer([]),
                        },
                          React.createElement(Plus, { width: 13, height: 13, strokeWidth: 2 }),
                          React.createElement("span", null, "Add Field")
                        )
                      ),
                      Object.keys(parsedDocument).length
                        ? renderDatabaseFieldRows(parsedDocument)
                        : React.createElement("div", { className: "playground-metronome-database-empty-fields" },
                            React.createElement("span", null, "This document does not contain any fields yet.")
                          )
		                );
	              };
	              const renderDatabaseJsonEditor = (pathLabel, value) => React.createElement("div", { className: "playground-metronome-inline-code-editor playground-metronome-database-json-editor-shell" },
	                React.createElement(MetronomeGeneratedCodeEditor, {
	                  file: { path: pathLabel, language: "json" },
	                  value,
                    readOnly: isActiveWorkflowBuiltIn,
	                  onChange: (nextValue) => updateSelectedNodeConfig("documentJson", String(nextValue || "")),
	                })
	              );
              const databaseFieldComposerParentLabel = metronomeDatabaseFieldComposerState.parentPath?.length
                ? metronomeDatabaseFieldComposerState.parentPath.join(".")
                : "document root";
              const databaseFieldComposerModal = metronomeDatabaseFieldComposerState.open
                ? React.createElement(PlatformModalBackdrop, {
                    className: "playground-tasks-project-modal-backdrop",
                    onClick: closeMetronomeDatabaseFieldComposer,
                  },
                    React.createElement(PlatformModalSurface, {
                        as: "form",
                        className: "playground-tasks-project-modal playground-database-browser-modal",
                        onClick: (event) => event.stopPropagation(),
                        onSubmit: submitMetronomeDatabaseFieldComposer,
                      },
                      React.createElement("div", { className: "playground-tasks-project-modal-top" },
                        React.createElement("div", { className: "playground-database-browser-modal-title-row" },
                          React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger" },
                            React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 })
                          ),
                          React.createElement("div", { className: "playground-database-browser-modal-title" }, "Add Field")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-icon-button playground-tasks-project-modal-close",
                          onClick: closeMetronomeDatabaseFieldComposer,
                          title: "Close",
                          "aria-label": "Close",
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-database-browser-modal-copy" },
                        "Create a new field on ",
                        databaseFieldComposerParentLabel,
                        "."
                      ),
                      React.createElement("div", { className: "playground-database-browser-modal-grid" },
                        React.createElement("label", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Field"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-environments-input",
                            value: metronomeDatabaseFieldComposerState.key,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                              ...current,
                              key: event.target.value,
                              error: "",
                            })),
                            placeholder: "title",
                            autoFocus: true,
                          })
                        ),
                        React.createElement("label", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Type"),
                          React.createElement("div", { className: "playground-database-browser-modal-select-shell" },
                            React.createElement("select", {
                              className: "playground-environments-select playground-database-browser-value-select",
                              value: metronomeDatabaseFieldComposerState.type,
                              onKeyDown: stopMetronomeInputKeyPropagation,
                              onKeyUp: stopMetronomeInputKeyPropagation,
                              onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                                ...current,
                                type: event.target.value,
                                value: ["map", "array", "null"].includes(event.target.value) ? "" : current.value,
                                error: "",
                              })),
                            },
                              Object.entries(fieldTypeLabels).map(([type, label]) =>
                                React.createElement("option", { key: type, value: type }, label)
                              )
                            ),
                            React.createElement(ChevronDown, { className: "playground-database-browser-select-chevron", width: 16, height: 16, strokeWidth: 1.9 })
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-project-modal-field playground-database-browser-modal-value-row" },
                        React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Value"),
                        metronomeDatabaseFieldComposerState.type === "boolean"
                          ? React.createElement("select", {
                              className: "playground-environments-select playground-database-browser-value-select",
                              value: metronomeDatabaseFieldComposerState.value === "true" ? "true" : "false",
                              onKeyDown: stopMetronomeInputKeyPropagation,
                              onKeyUp: stopMetronomeInputKeyPropagation,
                              onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                                ...current,
                                value: event.target.value,
                                error: "",
                              })),
                            },
                              React.createElement("option", { value: "true" }, "true"),
                              React.createElement("option", { value: "false" }, "false")
                            )
                          : metronomeDatabaseFieldComposerState.type === "map"
                            ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates an empty nested object.")
                            : metronomeDatabaseFieldComposerState.type === "array"
                              ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates an empty array.")
                              : metronomeDatabaseFieldComposerState.type === "null"
                                ? React.createElement("div", { className: "playground-database-browser-modal-hint" }, "Creates a null value.")
                                : React.createElement("input", {
                                    type: "text",
                                    className: "playground-environments-input playground-database-browser-modal-value-input",
                                    value: metronomeDatabaseFieldComposerState.value,
                                    onKeyDown: stopMetronomeInputKeyPropagation,
                                    onKeyUp: stopMetronomeInputKeyPropagation,
                                    onChange: (event) => setMetronomeDatabaseFieldComposerState((current) => ({
                                      ...current,
                                      value: event.target.value,
                                      error: "",
                                    })),
                                    placeholder: metronomeDatabaseFieldComposerState.type === "number" ? "42" : "Value",
                                  })
                      ),
                      metronomeDatabaseFieldComposerState.error
                        ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, metronomeDatabaseFieldComposerState.error)
                        : null,
                      React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: closeMetronomeDatabaseFieldComposer,
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "submit",
                          className: "playground-environments-action-button is-primary",
                        }, "Add")
                      )
                    )
                  )
                : null;
	              return React.createElement(React.Fragment, null,
	                React.createElement("div", { className: "playground-metronome-field" },
	                  renderMetronomeFieldTitle("Database"),
                  renderMetronomeInspectorSelect({
                    id: "database-resource-" + (selectedNodeId || "selected"),
                    value: config.databaseId || "",
                    options: [
                      { id: "", label: metronomeDatabaseOptions.length ? "Select database" : "No databases available" },
                      ...metronomeDatabaseOptions.map((option) => ({
                        id: option.id,
                        label: option.name,
                        description: option.description || option.id || "",
                      })),
                    ],
                    onChange: (nextDatabaseId) => {
                      const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                      updateSelectedNodeConfigPatch({
                        databaseId: nextDatabaseId,
                        databaseName: nextDatabase?.name || "",
                      });
                    },
                    searchPlaceholder: "Select database...",
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  renderMetronomeFieldTitle("Collection"),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.collection || "",
                    placeholder: "customers",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("collection", event.target.value),
                  })
                ),
                isBulkWriteOperation
                  ? null
                  : React.createElement("div", { className: "playground-metronome-field" },
                      renderMetronomeFieldTitle("Document"),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: config.documentId || "",
                        placeholder: isDeleteOperation || subtype === "update_document" ? "Document id or {{ input }}" : "Optional",
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("documentId", event.target.value),
                      })
                    ),
                isBulkWriteOperation
                  ? React.createElement(React.Fragment, null,
                      renderMetronomeDataBindingSelect({
                        title: "Source",
                        tooltip: "Choose where this database write reads the array of records from.",
                        fieldKey: "recordsBinding",
                        fallback: "last.records",
                        options: [
                          { id: "last.records", label: "Previous node records" },
                          { id: "last.json.records", label: "Previous node JSON records" },
                          { id: "last.documents", label: "Previous node documents" },
                          { id: "workflow.context.records", label: "Workflow context records" },
                        ],
                      }),
                      subtype === "upsert_many_documents"
                        ? React.createElement("div", { className: "playground-metronome-field playground-metronome-database-upsert-key-field" },
                            renderMetronomeFieldTitle("Upsert key", "Field used to match existing documents before writing."),
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: config.upsertKey || config.upsert_key || "id",
                              placeholder: "id",
                              onKeyDown: stopMetronomeInputKeyPropagation,
                              onKeyUp: stopMetronomeInputKeyPropagation,
                              onChange: (event) => updateSelectedNodeConfig("upsertKey", event.target.value),
                            })
                          )
                        : null
                    )
                  : renderMetronomeDataBindingSelect({
                      title: "Input source",
                      tooltip: "Choose which upstream output should populate this database operation.",
                      fieldKey: "inputBinding",
                      fallback: "last.json",
                      className: "playground-metronome-database-input-source-field",
                    }),
	                isDeleteOperation
	                  ? null
	                  : React.createElement("div", { className: "playground-metronome-field playground-metronome-database-document-field" },
	                      React.createElement("div", { className: "playground-metronome-database-fields-card" },
	                        React.createElement("div", { className: "playground-metronome-database-document-toolbar" },
	                          React.createElement("div", { className: "playground-metronome-database-document-title" }, "Document"),
	                          React.createElement("div", { className: "content-mode-switch playground-metronome-database-mode-switch", role: "group", "aria-label": "Database document editor mode" },
	                            [
	                              { id: "direct", label: "Direct" },
	                              { id: "json", label: "JSON" },
	                            ].map((mode) => React.createElement("button", {
	                              key: mode.id,
	                              type: "button",
	                              className: "content-mode-button" + (databaseEditMode === mode.id ? " is-active" : ""),
	                              onClick: () => updateSelectedNodeConfig("databaseEditMode", mode.id),
	                            }, mode.label))
	                          )
	                        ),
	                        databaseEditMode === "json"
		                          ? renderDatabaseJsonEditor("document.json", documentJson)
		                          : renderDatabaseDirectEditor()
		                      )
		                    ),
                  databaseFieldComposerModal
	              );
	            };
            const renderApprovalSettings = () => React.createElement(React.Fragment, null,
              renderMetronomeRichTextField({
                fieldKey: "message",
                title: "Approval instructions",
                placeholder: "Describe what needs approval",
              }),
              React.createElement("div", { className: "playground-metronome-field-hint" },
                "User Approval routes to True when approved and False when rejected."
              )
            );
            const renderFunctionSettings = () => {
              const functionConfig = createDefaultMetronomeFunctionConfig(config);
              const functionMode = normalizeMetronomeFunctionMode(functionConfig.functionMode);
              const isExternalApi = functionMode === "external_api";
              const functionInputBinding = normalizeMetronomeDataBinding(
                functionConfig.inputBinding || functionConfig.input_binding,
                "last.json"
              );
              const functionInputBindingOptions = (() => {
                const options = [
                  { id: "workflow.trigger.input.payload", label: "Trigger payload" },
                  ...METRONOME_WORKFLOW_DATA_BINDING_OPTIONS,
                  ...nodes
                    .filter((node) => String(node?.id || "").trim() && String(node?.id || "").trim() !== String(selectedNodeId || "").trim())
                    .map((node) => ({
                      id: "node." + String(node.id).trim() + ".data",
                      label: String(node?.data?.label || node?.label || node.id).trim() + " output",
                    })),
                ];
                if (!options.some((option) => option.id === functionInputBinding)) {
                  options.unshift({ id: functionInputBinding, label: functionInputBinding });
                }
                const seen = new Set();
                return options.filter((option) => {
                  const id = String(option?.id || "").trim();
                  if (!id || seen.has(id)) return false;
                  seen.add(id);
                  return true;
                });
              })();
              const functionSendsRequestBody = !["GET", "HEAD"].includes(
                normalizeMetronomeFunctionHttpMethod(functionConfig.httpMethod || functionConfig.method)
              );
              const resetFunctionInvokeState = () => setMetronomeFunctionInvokeState({
                nodeId: selectedNodeId || "",
                status: "idle",
                error: "",
                resultText: "",
              });
              const commitFunctionHeaderRows = (nextRows) => {
                const normalizedRows = normalizeMetronomeFunctionHeaderRows(nextRows);
                updateSelectedNodeConfigPatch({
                  requestHeaders: normalizedRows,
                  requestHeadersJson: serializeMetronomeFunctionHeaderRows(normalizedRows),
                });
              };
              const functionHeaderRows = normalizeMetronomeFunctionHeaderRows(functionConfig.requestHeaders);
              const updateFunctionHeaderRow = (rowId, patch) => {
                commitFunctionHeaderRows(functionHeaderRows.map((row) => row.id === rowId ? { ...row, ...patch } : row));
              };
              const removeFunctionHeaderRow = (rowId) => {
                if (functionHeaderRows.length <= 1) return;
                commitFunctionHeaderRows(functionHeaderRows.filter((row) => row.id !== rowId));
              };
              const addFunctionHeaderRow = () => {
                commitFunctionHeaderRows([...functionHeaderRows, createMetronomeHeaderRow()]);
              };
              const addFunctionSecretHeaderRow = () => {
                void loadAllMetronomeHeaderSecrets();
                commitFunctionHeaderRows([...functionHeaderRows, createMetronomeHeaderRow({ valueType: "secret" })]);
              };
              const httpMethodOptions = ["POST", "GET", "PUT", "DELETE", "PATCH", "HEAD"].map((method) => ({
                id: method,
                label: method,
                description: "Send an HTTP " + method + " request.",
              }));
              const renderFunctionHeaders = () => React.createElement("div", {
                className: "playground-metronome-field playground-metronome-function-headers-field",
                onMouseDown: stopMetronomePointerPropagation,
                onPointerDown: stopMetronomePointerPropagation,
                onClick: stopMetronomePointerPropagation,
              },
                renderMetronomeFieldTitle("Headers (optional)"),
                React.createElement("div", { className: "playground-metronome-function-headers-list" },
                  functionHeaderRows.map((row, index) => {
                    const rowId = row.id || "header-" + index;
                    const secretOptions = metronomeHeaderSecretOptions.length
                      ? metronomeHeaderSecretOptions
                      : [{ id: "", label: metronomeSecretVaultSecretsLoadingId ? "Loading secrets..." : "No secrets available" }];
                    return React.createElement("div", {
                      key: rowId,
                      className: "playground-metronome-function-header-row",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: stopMetronomePointerPropagation,
                    },
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: row.name || "",
                        placeholder: "Name",
                        onMouseDown: stopMetronomePointerPropagation,
                        onPointerDown: stopMetronomePointerPropagation,
                        onClick: stopMetronomePointerPropagation,
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateFunctionHeaderRow(rowId, { name: event.target.value }),
                      }),
                      row.valueType === "secret"
                        ? renderMetronomeInspectorSelect({
                            id: "function-header-secret-" + (selectedNodeId || "selected") + "-" + rowId,
                            value: row.secretRef || "",
                            options: secretOptions,
                            disabled: !metronomeHeaderSecretOptions.length,
                            placeholder: metronomeHeaderSecretOptions.length ? "Select secret" : "No secrets available",
                            searchPlaceholder: "Select secret...",
                            onChange: (nextSecretRef, option) => {
                              updateFunctionHeaderRow(rowId, {
                                valueType: "secret",
                                value: "",
                                secretRef: nextSecretRef,
                                secretVaultId: option?.vaultId || "",
                                secretVaultName: option?.vaultName || "",
                                secretId: option?.secretId || "",
                                secretName: option?.secretName || "",
                              });
                            },
                          })
                        : React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: row.value || "",
                            placeholder: "Value",
                            onMouseDown: stopMetronomePointerPropagation,
                            onPointerDown: stopMetronomePointerPropagation,
                            onClick: stopMetronomePointerPropagation,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updateFunctionHeaderRow(rowId, { valueType: "text", value: event.target.value }),
                          }),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-metronome-function-header-delete",
                        disabled: functionHeaderRows.length <= 1,
                        "aria-label": "Delete header",
                        onMouseDown: stopMetronomePointerPropagation,
                        onPointerDown: stopMetronomePointerPropagation,
                        onClick: (event) => {
                          stopMetronomePointerPropagation(event);
                          removeFunctionHeaderRow(rowId);
                        },
                      }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
                    );
                  }),
                  React.createElement("div", { className: "playground-metronome-function-header-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-header-link",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: (event) => {
                        stopMetronomePointerPropagation(event);
                        addFunctionHeaderRow();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Add header")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-function-header-link",
                      onMouseDown: stopMetronomePointerPropagation,
                      onPointerDown: stopMetronomePointerPropagation,
                      onClick: (event) => {
                        stopMetronomePointerPropagation(event);
                        addFunctionSecretHeaderRow();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Add secret")
                    ),
                    renderMetronomeFieldTooltip("Secrets are taken from the Secrets service in Develop mode.")
                  )
                )
              );
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field playground-metronome-function-type-field" },
                  renderMetronomeFieldTitle("Type"),
                  renderMetronomeInspectorSelect({
                    id: "function-mode-" + (selectedNodeId || "selected"),
                    value: functionMode,
                    options: [
                      {
                        id: "computer_agents_function",
                        label: "Computer Agents Function",
                        description: "Invoke a deployed Computer Agents function resource.",
                      },
                      {
                        id: "external_api",
                        label: "External API",
                        description: "Call an external HTTP endpoint from this workflow.",
                      },
                    ],
                    searchPlaceholder: "Select function type...",
                    onChange: (nextMode) => {
                      updateSelectedNodeConfigPatch(createDefaultMetronomeFunctionConfig({
                        ...functionConfig,
                        functionMode: nextMode,
                      }));
                      resetFunctionInvokeState();
                    },
                  })
                ),
                isExternalApi
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-function-url-field" },
                        renderMetronomeFieldTitle("URL"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: functionConfig.url || "",
                          placeholder: "https://api.example.com/events",
                          onKeyDown: stopMetronomeInputKeyPropagation,
                          onKeyUp: stopMetronomeInputKeyPropagation,
                          onChange: (event) => updateSelectedNodeConfig("url", event.target.value),
                        })
                      ),
                      renderMetronomeDataBindingSelect({
                        title: "Input source",
                        tooltip: "The selected data is available as input when resolving URL, header, and request-body templates.",
                        fieldKey: "inputBinding",
                        fallback: "last.json",
                        options: functionInputBindingOptions,
                        className: "playground-metronome-function-input-source-field",
                      }),
                      renderFunctionHeaders(),
                      React.createElement("div", { className: "playground-metronome-field playground-metronome-function-method-field" },
                        renderMetronomeFieldTitle("Method"),
                        renderMetronomeInspectorSelect({
                          id: "function-http-method-" + (selectedNodeId || "selected"),
                          value: functionConfig.httpMethod || "POST",
                          options: httpMethodOptions,
                          searchPlaceholder: "Select method...",
                          onChange: (nextMethod) => updateSelectedNodeConfigPatch({
                            httpMethod: normalizeMetronomeFunctionHttpMethod(nextMethod),
                            method: normalizeMetronomeFunctionHttpMethod(nextMethod),
                          }),
                        })
                      ),
                      functionSendsRequestBody
                        ? React.createElement("div", { className: "playground-metronome-field" },
                            renderMetronomeFieldTitle("Request body", "When empty, the selected input source is sent directly."),
                            React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                              React.createElement(MetronomeGeneratedCodeEditor, {
                                file: { path: "payload.json", language: "json" },
                                value: functionConfig.payloadJson,
                                readOnly: isActiveWorkflowBuiltIn,
                                onChange: (nextValue) => updateSelectedNodeConfig("payloadJson", String(nextValue || "")),
                              })
                            )
                          )
                        : null
                    )
                  : React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Function"),
                        renderMetronomeInspectorSelect({
                          id: "function-resource-" + (selectedNodeId || "selected"),
                          value: functionConfig.functionId || "",
                          options: [
                            { id: "", label: metronomeFunctionOptions.length ? "Select function" : "No functions available" },
                            ...metronomeFunctionOptions.map((option) => ({
                              id: option.id,
                              label: option.name,
                              description: option.description || option.id || "",
                            })),
                          ],
                          searchPlaceholder: "Select a function...",
                          onChange: (nextFunctionId) => {
                            const nextFunction = metronomeFunctionOptions.find((option) => option.id === nextFunctionId) || null;
                            updateSelectedNodeConfigPatch({
                              functionId: nextFunctionId,
                              functionName: nextFunction?.name || "",
                            });
                            resetFunctionInvokeState();
                          },
                        })
                      ),
                      renderMetronomeDataBindingSelect({
                        title: "Input source",
                        tooltip: "When the request payload is empty, the selected input is sent directly to the function.",
                        fieldKey: "inputBinding",
                        fallback: "last.json",
                        options: functionInputBindingOptions,
                        className: "playground-metronome-function-input-source-field",
                      }),
                      React.createElement("div", { className: "playground-metronome-field" },
                        renderMetronomeFieldTitle("Request payload"),
                        React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                          React.createElement(MetronomeGeneratedCodeEditor, {
                            file: { path: "payload.json", language: "json" },
                            value: functionConfig.payloadJson,
                            readOnly: isActiveWorkflowBuiltIn,
                            onChange: (nextValue) => {
                              updateSelectedNodeConfig("payloadJson", String(nextValue || ""));
                              resetFunctionInvokeState();
                            },
                          })
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-function-test-section" },
                        React.createElement("div", { className: "playground-metronome-function-test-header" },
                          renderMetronomeFieldTitle("Test invoke"),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-function-test-button" + (selectedFunctionInvokeState.status === "loading" ? " is-loading" : ""),
                            disabled: selectedFunctionInvokeState.status === "loading" || !String(functionConfig.functionId || "").trim(),
                            onClick: handleMetronomeFunctionTestInvoke,
                          },
                            React.createElement(selectedFunctionInvokeState.status === "loading" ? Loader2 : Play, { width: 13, height: 13, strokeWidth: 1.9 }),
                            selectedFunctionInvokeState.status === "loading" ? "Invoking" : "Invoke"
                          )
                        ),
                        selectedFunctionInvokeState.error
                          ? React.createElement("div", { className: "playground-metronome-function-test-error" }, selectedFunctionInvokeState.error)
                          : null,
                        selectedFunctionInvokeState.resultText
                          ? React.createElement("pre", { className: "playground-metronome-function-test-result" }, selectedFunctionInvokeState.resultText)
                          : null
                      )
                    )
              );
            };
            const showTypeSelector = !["action", "approval", "end", "note", "ticket", "imagine", "function"].includes(kind);
            const isThreadNode = kind === "action" && subtype === "start_thread";
            const rawNodeLabel = String(selectedNode.data?.label || "");
            const defaultNodeLabel = getMetronomeDefaultNodeLabel(kind, subtype);
            const inspectorNodeLabel = getMetronomeNodeDisplayLabel(selectedNode);
            const inspectorNodeDescription = getMetronomeNodeTypeDescription(selectedNode);
            const triggerNodeCount = nodes.filter((node) => String(node?.data?.kind || node?.kind || "").trim() === "trigger").length;
            const canDeleteSelectedNode = !isActiveWorkflowBuiltIn && (kind !== "trigger" || triggerNodeCount > 1);
            return React.createElement("aside", {
              className: "playground-metronome-node-inspector" + (isActiveWorkflowBuiltIn ? " is-readonly" : ""),
            },
			              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-metronome-inspector-header" },
			                React.createElement("div", { className: "playground-metronome-inspector-title-row" },
			                  React.createElement("div", { className: "playground-tasks-detail-navbar-title playground-metronome-inspector-navbar-title" },
			                    React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
			                      React.createElement("span", {
			                        className: "playground-content-title playground-metronome-inspector-title-text",
			                      }, inspectorNodeLabel)
			                    )
			                  ),
		                  React.createElement("div", { className: "playground-metronome-inspector-actions" },
		                    React.createElement("button", {
		                      type: "button",
		                      className: "playground-files-header-icon-button is-plain playground-metronome-inspector-docs",
		                      onClick: () => window.open("http://localhost:3001/developers", "_blank", "noopener,noreferrer"),
		                      title: "Open Metronome docs",
		                      "aria-label": "Open Metronome docs",
		                    },
		                      React.createElement(LibraryBig, { width: 15, height: 15, strokeWidth: 1.9 })
		                    ),
		                    !canDeleteSelectedNode ? null : React.createElement("button", {
		                      type: "button",
		                      className: "playground-files-header-icon-button is-plain playground-metronome-inspector-delete",
		                      onClick: deleteSelectedNode,
		                      disabled: !canDeleteSelectedNode,
		                      title: "Delete node",
		                      "aria-label": "Delete node",
		                    },
		                      React.createElement(Trash2, { width: 15, height: 15, strokeWidth: 1.9 })
		                    )
		                  )
		                ),
		                React.createElement("div", { className: "playground-metronome-inspector-title-description" }, inspectorNodeDescription)
		              ),
              React.createElement("div", { className: "playground-metronome-inspector-body" },
                React.createElement("fieldset", {
                  className: "playground-metronome-inspector-fieldset",
                  disabled: isActiveWorkflowBuiltIn,
                  "aria-disabled": isActiveWorkflowBuiltIn ? "true" : "false",
                },
                React.createElement("div", { className: "playground-metronome-field playground-metronome-node-name-field" },
                  renderMetronomeFieldTitle("Name"),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: rawNodeLabel,
                    placeholder: defaultNodeLabel,
                    "aria-label": "Node name",
                    disabled: isActiveWorkflowBuiltIn,
                    readOnly: isActiveWorkflowBuiltIn,
                    onChange: (event) => updateSelectedNodeData({ label: event.target.value }),
                    ...getMetronomeTextInputKeyHandlers((event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }
                    }),
                  })
                ),
                showTypeSelector ? React.createElement("div", { className: "playground-metronome-field playground-metronome-node-type-field" },
                  renderMetronomeFieldTitle("Type"),
                  renderMetronomeInspectorSelect({
                    id: "node-type-" + (selectedNodeId || "selected"),
                    value: kind === "trigger" && subtype === "thread"
                      ? "thread_event"
                      : kind === "loop"
                        ? selectedLoopType
                        : subtype,
                    options: (Array.isArray(meta.subtypes) ? meta.subtypes : []).map((option) => {
                      const source = option && typeof option === "object"
                        ? option
                        : { id: option, label: option };
                      return {
                        ...source,
                        description: source.description || getMetronomeSubtypeShortDescription(kind, source.id || source.value),
                      };
                    }),
                    searchPlaceholder: "Select a type...",
                    onChange: (rawSubtype) => {
                      const nextSubtype = kind === "trigger" && rawSubtype === "thread"
                        ? "thread_event"
                        : kind === "loop"
                          ? normalizeMetronomeLoopType(rawSubtype)
                          : rawSubtype;
                      updateSelectedNodeData({
                        subtype: nextSubtype,
                        description: getMetronomeSubtypeLabel(kind, nextSubtype),
                      });
                      if (kind === "trigger") {
                        updateSelectedNodeConfigPatch({
                          triggerType: nextSubtype,
                          threadCommand: config.threadCommand || "@metronome",
                          promptExtension: config.promptExtension || "",
                          ...(
                            nextSubtype === "periodic"
                              ? buildDefaultMetronomeScheduleConfig(config)
                              : {}
                          ),
	                          ...(
	                            nextSubtype === "email"
	                              ? buildDefaultMetronomeEmailTriggerConfig(activeWorkflow, selectedNode, config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "telegram"
	                              ? buildDefaultMetronomeTelegramTriggerConfig(activeWorkflow, selectedNode, config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "function"
	                              ? buildDefaultMetronomeFunctionTriggerConfig(activeWorkflow, selectedNode, config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "github"
	                              ? buildDefaultMetronomeGitHubTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "project_ticket"
	                              ? buildDefaultMetronomeProjectTicketTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "resource"
	                              ? buildDefaultMetronomeResourceTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "database_entry"
	                              ? buildDefaultMetronomeDatabaseEntryTriggerConfig(config)
	                              : {}
	                          ),
	                          ...(
	                            nextSubtype === "auth"
	                              ? buildDefaultMetronomeAuthTriggerConfig(config)
	                              : {}
	                          ),
	                        });
                      } else if (kind === "condition") {
                        const nextConditionType = normalizeMetronomeConditionType(nextSubtype);
                        updateSelectedNodeConfigPatch({
                          conditionType: nextConditionType,
                          databaseId: config.databaseId || "",
                          databaseName: config.databaseName || "",
                          databaseCollection: config.databaseCollection || config.collection || "",
                          databaseDocumentId: config.databaseDocumentId || "",
                          databaseFieldPath: config.databaseFieldPath || "",
                          databaseOperator: config.databaseOperator || "equals",
                          databaseCompareValue: config.databaseCompareValue || "",
                          ticketProjectId: config.ticketProjectId || "",
                          ticketProjectName: config.ticketProjectName || "",
                          ticketId: config.ticketId || "",
                          ticketStatusOperator: config.ticketStatusOperator || "equals",
                          ticketStatusValue: config.ticketStatusValue || "planned",
                          conditions: normalizeMetronomeConditionBranches(config.conditions, nextConditionType),
                        });
                      } else if (kind === "ticket") {
                        updateSelectedNodeConfigPatch({
                          operation: nextSubtype,
                          projectId: config.projectId || "",
                          projectName: config.projectName || "",
                          ticketId: config.ticketId || "",
                          ticketTitle: config.ticketTitle || "",
                          ticketStatus: config.ticketStatus || "planned",
                          comment: config.comment || "",
                          fieldsJson: config.fieldsJson || "{\n  \"status\": \"planned\"\n}",
                        });
                      } else if (kind === "firecrawl") {
                        updateSelectedNodeConfigPatch(createDefaultMetronomeFirecrawlConfig(nextSubtype, config));
                      } else if (kind === "table") {
                        updateSelectedNodeConfigPatch(createDefaultMetronomeTableConfig(nextSubtype, config));
                  } else if (kind === "database") {
                    updateSelectedNodeConfigPatch(createDefaultMetronomeDatabaseConfig(nextSubtype, config));
                  } else if (kind === "loop") {
                    const nextLoopType = normalizeMetronomeLoopType(nextSubtype);
                    updateSelectedNodeConfigPatch(createDefaultMetronomeLoopConfig(nextLoopType, config));
                  } else if (kind === "function") {
                    updateSelectedNodeConfigPatch(createDefaultMetronomeFunctionConfig(config));
                  }
                },
              })
                ) : null,
                kind === "trigger"
                  ? renderTriggerSettings()
                  : kind === "condition"
                    ? renderConditionSettings()
                    : kind === "loop"
                      ? renderLoopSettings()
                    : kind === "action"
                      ? renderThreadSettings()
                      : kind === "ticket"
                        ? renderTicketSettings()
                      : kind === "approval"
                          ? renderApprovalSettings()
                          : kind === "imagine"
                    ? renderImagineSettings()
	                  : kind === "function"
                    ? renderFunctionSettings()
                  : kind === "database"
                    ? renderDatabaseSettings()
                  : kind === "table"
                    ? renderTableSettings()
                  : kind === "firecrawl"
                    ? renderFirecrawlSettings()
                  : kind === "metronome"
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-metronome-field" },
                          renderMetronomeFieldTitle("Workflow"),
                          renderMetronomeInspectorSelect({
                            id: "metronome-workflow-" + (selectedNodeId || "selected"),
                            value: config.workflowId || "",
                            options: [
                              { id: "", label: "Select Metronome" },
                              ...metronomeWorkflowOptions.map((option) => ({
                                id: option.id,
                                label: option.name,
                                description: option.description || option.id || "",
                              })),
                            ],
                            searchPlaceholder: "Select a workflow...",
                            onChange: (nextWorkflowId) => {
                              const nextWorkflow = metronomeWorkflowOptions.find((option) => option.id === nextWorkflowId) || null;
                              updateSelectedNodeConfigPatch({
                                workflowId: nextWorkflowId,
                                workflowName: nextWorkflow?.name || "",
                              });
                            },
                          })
                        ),
	                        React.createElement("div", { className: "playground-metronome-field-hint playground-metronome-workflow-selector-description" },
		                          "This workflow receives the accumulated context chain and returns its run summary to the next node."
	                        )
			                      )
	                  : null
                )
		              ),
              renderMetronomeAttachmentModalPortal(),
              renderMetronomeFieldTooltipPortal()
		            );
          };
`;
