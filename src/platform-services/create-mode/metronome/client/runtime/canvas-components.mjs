export const METRONOME_CANVAS_RUNTIME_SCRIPT = String.raw`
        function MetronomeWorkflowNode({ id, data, selected }) {
          const kind = data?.kind || "action";
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const Icon = meta.Icon || Play;
          const color = meta.color || "#66a6ff";
          const gradient = meta.gradient || "";
          const iconColor = meta.iconColor || "#050505";
          const iconShadow = meta.iconShadow || "";
	          const isEndNode = kind === "end";
	          const isConditionNode = kind === "condition";
	          const isApprovalNode = kind === "approval";
          const isBranchNode = isConditionNode || isApprovalNode;
          const isTicketNode = kind === "ticket";
	          const isImagineNode = kind === "imagine";
	          const isFunctionNode = kind === "function";
	          const isFirecrawlNode = kind === "firecrawl";
	          const isTableNode = kind === "table";
	          const isDatabaseNode = kind === "database";
	          const isMetronomeNode = kind === "metronome";
	          const isNoteNode = kind === "note";
	          const isLoopNode = kind === "loop";
		          const shouldHideBody = kind === "action" || kind === "trigger" || isApprovalNode || isTicketNode || isImagineNode || isFunctionNode || isFirecrawlNode || isTableNode || isDatabaseNode || isMetronomeNode || isEndNode || isConditionNode;
	          const config = data?.config || {};
          const handleNodePointerDown = (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            if (event.target?.closest?.(".react-flow__handle, .playground-metronome-loop-resize-handle, input, textarea, select, button, a")) return;
            if (typeof data?.onNodeSelect === "function") {
              data.onNodeSelect(id);
            }
          };
	          const renderResizeHandle = (corner, className) => React.createElement("span", {
	            className: "playground-metronome-loop-resize-handle " + className + " nodrag",
	            role: "presentation",
	            onMouseDown: (event) => {
	              event.preventDefault();
	              event.stopPropagation();
	              if (typeof data?.onLoopResizeStart === "function") {
	                data.onLoopResizeStart(id, corner, event);
	              }
	            },
	            onClick: (event) => event.stopPropagation(),
	          });
	          if (isNoteNode) {
	            return React.createElement("div", {
	              className: "playground-metronome-node is-note" + (selected ? " is-selected" : "") + (data?.runState ? " is-run-" + String(data.runState) : ""),
	            },
	              renderResizeHandle("top-left", "is-top-left"),
	              renderResizeHandle("top-right", "is-top-right"),
	              renderResizeHandle("bottom-left", "is-bottom-left"),
	              renderResizeHandle("bottom-right", "is-bottom-right"),
	              React.createElement("textarea", {
	                className: "playground-metronome-note-textarea nodrag nowheel",
	                value: String(config.note || ""),
	                placeholder: "Add a note...",
	                onChange: (event) => {
	                  if (typeof data?.onInlineNoteChange === "function") {
	                    data.onInlineNoteChange(id, event.target.value);
	                  }
	                },
	                onMouseDown: (event) => event.stopPropagation(),
	                onClick: (event) => event.stopPropagation(),
	                onDoubleClick: (event) => event.stopPropagation(),
	                onKeyDown: stopMetronomeInputKeyPropagation,
	                onKeyUp: stopMetronomeInputKeyPropagation,
	              })
	            );
	          }
	          if (isLoopNode) {
	            return React.createElement("div", {
	              className: "playground-metronome-node is-loop" + (selected ? " is-selected" : "") + (data?.runState ? " is-run-" + String(data.runState) : ""),
                onPointerDown: handleNodePointerDown,
	            },
	              renderResizeHandle("top-left", "is-top-left"),
	              renderResizeHandle("top-right", "is-top-right"),
	              renderResizeHandle("bottom-left", "is-bottom-left"),
	              renderResizeHandle("bottom-right", "is-bottom-right"),
	              React.createElement(Handle, {
	                id: "loop-left",
	                type: "source",
	                position: Position.Left,
	                className: "playground-metronome-loop-handle is-left",
	                isConnectableStart: true,
	                isConnectableEnd: true,
	              }),
	              React.createElement("div", { className: "playground-metronome-loop-header" },
	                React.createElement(RefreshCw, { className: "playground-metronome-loop-icon", width: 14, height: 14, strokeWidth: 1.8 })
	              ),
	              React.createElement(Handle, {
	                id: "loop-right",
	                type: "source",
	                position: Position.Right,
	                className: "playground-metronome-loop-handle is-right",
	                isConnectableStart: true,
	                isConnectableEnd: true,
	              })
	            );
	          }
		          const title = getMetronomeNodeDisplayLabel(data);
	          const conditionBranches = isConditionNode
	            ? normalizeMetronomeConditionBranches(config.conditions, config.conditionType || data?.subtype)
	            : isApprovalNode
	              ? normalizeMetronomeApprovalBranches(config.conditions)
	              : [];
          const conditionHandleBaseTop = 75;
          const conditionHandleStep = 47;
          const runStateClass = data?.runState ? " is-run-" + String(data.runState) : "";
	          return React.createElement("div", {
              className: "playground-metronome-node" + (selected ? " is-selected" : "") + (isBranchNode ? " is-condition" : "") + (isEndNode ? " is-end" : "") + runStateClass,
              onPointerDown: isEndNode ? undefined : handleNodePointerDown,
            },
            React.createElement(Handle, { id: "node-input", type: "target", position: Position.Left }),
            React.createElement("div", { className: "playground-metronome-node-header" },
              React.createElement("span", {
                className: "playground-metronome-node-icon",
                style: gradient
                  ? { background: gradient, color: iconColor }
                  : { backgroundColor: color, color: iconColor },
              }, React.createElement(Icon, {
                width: 16,
                height: 16,
                strokeWidth: 1.9,
                style: iconShadow ? { filter: iconShadow } : undefined,
	              })),
	              React.createElement("div", { style: { minWidth: 0 } },
	                React.createElement("div", { className: "playground-metronome-node-title" }, title)
	              )
            ),
            shouldHideBody ? null : React.createElement("div", { className: "playground-metronome-node-body" }, data?.description || meta.copy),
	            isBranchNode
	              ? React.createElement("div", { className: "playground-metronome-condition-branches" },
                  conditionBranches.map((branch, index) => {
                    const label = String(branch.label || branch.rule || "").trim();
                    return React.createElement("div", {
                      key: branch.id,
                      className: "playground-metronome-condition-branch" + (label ? "" : " is-empty") + (branch.id === "else" ? " is-else" : ""),
                    }, label || "\u00a0");
                  })
                )
              : null,
	            isBranchNode
	              ? conditionBranches.map((branch, index) => React.createElement(Handle, {
                  key: "condition-handle-" + branch.id,
                  id: branch.id,
                  type: "source",
                  position: Position.Right,
                  className: "playground-metronome-condition-handle",
                  style: { top: conditionHandleBaseTop + index * conditionHandleStep },
                }))
          : isEndNode ? null : React.createElement(Handle, { id: "node-output", type: "source", position: Position.Right })
          );
        }

        function MetronomeOutputEdge({
          id,
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
          style,
          markerEnd,
        }) {
          const pathResult = typeof getSimpleBezierPath === "function"
            ? getSimpleBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
            : ["M " + sourceX + " " + sourceY + " C " + (sourceX + targetX) / 2 + " " + sourceY + ", " + (sourceX + targetX) / 2 + " " + targetY + ", " + targetX + " " + targetY, (sourceX + targetX) / 2, (sourceY + targetY) / 2];
          const edgePath = Array.isArray(pathResult) ? pathResult[0] : "";
          return typeof BaseEdge === "function"
            ? React.createElement(BaseEdge, { id, path: edgePath, style, markerEnd })
            : React.createElement("path", { id, className: "react-flow__edge-path", d: edgePath, style, markerEnd });
        }

        function MetronomeFlowCanvas({
          nodes,
          edges,
          nodeTypes,
          edgeTypes,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onNodeDragStop,
          onCreateNode,
          onSelectNode,
          onPaneClick,
          onUndo,
          onRedo,
          canUndo,
          canRedo,
          onViewportChange,
          interactionMode,
          onInteractionModeChange,
          readOnly = false,
        }) {
          const { screenToFlowPosition } = useReactFlow();
          const normalizedInteractionMode = interactionMode === "pan" ? "pan" : "select";
          const isPanMode = normalizedInteractionMode === "pan";

          const handleDrop = useCallback((event) => {
            event.preventDefault();
            if (readOnly) return;
            const rawPayload = event.dataTransfer.getData("application/metronome-node-payload");
            let paletteItem = null;
            if (rawPayload) {
              try {
                const parsedPayload = JSON.parse(rawPayload);
                paletteItem = parsedPayload && typeof parsedPayload === "object" ? parsedPayload : null;
              } catch {
                paletteItem = null;
              }
            }
            const fallbackKind = event.dataTransfer.getData("application/metronome-node-kind");
            const kind = paletteItem?.kind || fallbackKind;
            if (!kind || !METRONOME_NODE_KIND_META[kind]) return;
            const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const nextNode = createMetronomeNodeFromPaletteItem(paletteItem || { kind }, {
              x: flowPosition.x - 116,
              y: flowPosition.y - 48,
            });
            const loopNode = !isMetronomeLoopNode(nextNode)
              ? findMetronomeLoopNodeAtPoint(nodes, flowPosition, nextNode.id)
              : null;
            if (loopNode) {
              const loopPosition = getMetronomeNodeAbsolutePosition(loopNode, new Map((Array.isArray(nodes) ? nodes : []).map((node) => [String(node?.id || ""), node])));
              nextNode.parentId = String(loopNode.id);
              nextNode.extent = "parent";
              nextNode.position = {
                x: Math.max(24, (Number(nextNode.position?.x) || 0) - loopPosition.x),
                y: Math.max(48, (Number(nextNode.position?.y) || 0) - loopPosition.y),
              };
            }
            onCreateNode(nextNode);
          }, [nodes, onCreateNode, readOnly, screenToFlowPosition]);

          const handleDragOver = useCallback((event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = readOnly ? "none" : "move";
          }, [readOnly]);

          const selectInspectableNode = useCallback((node) => {
            const kind = String(node?.data?.kind || "").trim();
            if (kind === "note" || kind === "end") {
              onSelectNode("");
              return;
            }
            onSelectNode(node?.id || "");
          }, [onSelectNode]);

          return React.createElement(ReactFlow, {
            className: "playground-metronome-flow " + (isPanMode ? "is-pan-mode" : "is-select-mode"),
            nodes,
            edges,
            nodeTypes,
            edgeTypes,
            onNodesChange,
            onEdgesChange,
            onConnect,
            onNodeDragStop,
            onDrop: handleDrop,
            onDragOver: handleDragOver,
            onInit: (instance) => {
              if (typeof onViewportChange === "function") {
                const zoom = typeof instance?.getZoom === "function" ? instance.getZoom() : 1;
                onViewportChange({ zoom });
              }
            },
            onMove: (_event, viewport) => {
              if (typeof onViewportChange === "function") {
                onViewportChange(viewport || {});
              }
            },
            onNodePointerDown: (_event, node) => selectInspectableNode(node),
	            onNodeClick: (_event, node) => selectInspectableNode(node),
            onPaneClick,
            fitView: true,
            minZoom: 0.35,
            maxZoom: 1.35,
            panOnDrag: isPanMode,
            panActivationKeyCode: null,
            nodesDraggable: !readOnly,
            nodesConnectable: !readOnly,
            elementsSelectable: true,
            selectionOnDrag: !isPanMode,
            zoomOnScroll: true,
            zoomOnPinch: true,
            connectionMode: "loose",
            defaultEdgeOptions: { type: "metronomeOutput" },
          },
            React.createElement(Background, { color: "rgba(255,255,255,0.16)", gap: 18, size: 1 }),
            React.createElement("div", { className: "playground-metronome-flow-controls" },
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button" + (isPanMode ? " is-active" : ""),
                "aria-label": "Pan workflow",
                "aria-pressed": isPanMode ? "true" : "false",
                onClick: () => onInteractionModeChange?.("pan"),
              }, React.createElement(Hand, { width: 15, height: 15, strokeWidth: 1.85 })),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button" + (!isPanMode ? " is-active" : ""),
                "aria-label": "Select workflow items",
                "aria-pressed": !isPanMode ? "true" : "false",
                onClick: () => onInteractionModeChange?.("select"),
              }, React.createElement(typeof Scan !== "undefined" ? Scan : MousePointer2, { width: 15, height: 15, strokeWidth: 1.85 })),
              React.createElement("span", { className: "playground-metronome-flow-controls-spacer", "aria-hidden": "true" }),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Undo",
                disabled: readOnly || !canUndo,
                onClick: onUndo,
              }, React.createElement(RotateCcw, { width: 15, height: 15, strokeWidth: 1.8 })),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Redo",
                disabled: readOnly || !canRedo,
                onClick: onRedo,
              }, React.createElement(RotateCw, { width: 15, height: 15, strokeWidth: 1.8 }))
            )
          );
        }

        function MetronomeGeneratedCodeEditor({ file, value, onChange, readOnly = false }) {
          const [editorModule, setEditorModule] = useState(null);
          const [editorModuleError, setEditorModuleError] = useState("");
          const [isMonacoReady, setIsMonacoReady] = useState(false);
          const MonacoEditorComponent = editorModule?.default || null;
          const filePath = String(file?.path || "main.py").trim() || "main.py";
          const language = String(file?.language || (filePath.endsWith(".txt") ? "plaintext" : "python")).trim() || "python";

          useEffect(() => {
            let cancelled = false;
            if (typeof loadPlaygroundCodeEditorModule !== "function") {
              return () => {};
            }
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled) return;
                if (!module?.default) {
                  setEditorModuleError("The code editor could not be loaded.");
                  return;
                }
                setEditorModule(module);
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled && typeof ensurePlaygroundCodeEditorTheme === "function") {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (!cancelled) {
                  setEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
                }
              });
            return () => {
              cancelled = true;
            };
          }, []);

          if (MonacoEditorComponent) {
            return React.createElement("div", {
              className: "playground-metronome-code-editor-shell playground-code-preview-editor-shell playground-servers-code-editor-shell",
              onKeyDown: stopMetronomeInputKeyPropagation,
              onKeyUp: stopMetronomeInputKeyPropagation,
            },
              React.createElement("div", {
                className: "playground-metronome-code-monaco" + (isMonacoReady ? " is-ready" : ""),
              },
                React.createElement(MonacoEditorComponent, {
                  path: "metronome/" + filePath,
                  height: "100%",
                  defaultLanguage: language,
                  language,
                  theme: typeof PLAYGROUND_CODE_EDITOR_THEME_NAME === "string" ? PLAYGROUND_CODE_EDITOR_THEME_NAME : "vs-dark",
                  value: String(value || ""),
                  beforeMount: ensurePlaygroundCodeEditorTheme,
                  onMount: () => {
                    setIsMonacoReady(true);
                  },
                  onChange: (nextValue) => {
                    if (readOnly) return;
                    if (typeof onChange === "function") {
                      onChange(String(nextValue || ""));
                    }
                  },
                  options: {
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    readOnly: Boolean(readOnly),
                    fontSize: 12,
                    lineHeight: 20,
                    tabSize: 2,
                    insertSpaces: true,
                    renderLineHighlight: "none",
                    lineNumbersMinChars: 3,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    wordWrap: "on",
                    padding: { top: 14, bottom: 14 },
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  },
                })
              )
            );
          }

          if (!editorModuleError) {
            return React.createElement("div", {
              className: "playground-metronome-code-editor-shell playground-servers-code-editor-shell",
              onKeyDown: stopMetronomeInputKeyPropagation,
              onKeyUp: stopMetronomeInputKeyPropagation,
            },
              React.createElement("div", { className: "playground-metronome-code-loading" },
                React.createElement("span", {
                    className: "playground-metronome-code-loading-dot-loader",
                    "aria-hidden": "true",
                  },
                  React.createElement(PlaygroundDotLoader, {
                    dotCount: 9,
                    dotSize: 3,
                    gap: 2,
                    speed: 800,
                  })
                ),
                React.createElement("span", null, "Loading editor...")
              )
            );
          }

          return React.createElement("div", {
            className: "playground-metronome-code-editor-shell playground-servers-code-editor-shell",
            onKeyDown: stopMetronomeInputKeyPropagation,
            onKeyUp: stopMetronomeInputKeyPropagation,
          },
            React.createElement("textarea", {
              className: "playground-metronome-code-textarea playground-code-preview-textarea playground-servers-source-editor-textarea",
              value: String(value || ""),
              readOnly: Boolean(readOnly),
              onKeyDown: stopMetronomeInputKeyPropagation,
              onKeyUp: stopMetronomeInputKeyPropagation,
              onChange: (event) => {
                if (readOnly) return;
                if (typeof onChange === "function") {
                  onChange(event.target.value);
                }
              },
              spellCheck: false,
            })
          );
        }
`;
