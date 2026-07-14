export const METRONOME_PAGE_CONTROLLER_SCRIPT = String.raw`
          const metronomeDynamicContentGroups = useMemo(() => {
            return buildMetronomeDynamicContentGroups(nodes, edges, selectedNodeId);
          }, [nodes, edges, selectedNodeId]);
          const selectMetronomeNodeFromCanvas = useCallback((nodeId) => {
            setIsMetronomeRunSidebarOpen(false);
            setIsMetronomePublishActionsMenuOpen(false);
            setIsMetronomePublishMenuOpen(false);
            setSelectedNodeId(String(nodeId || ""));
          }, []);
          const selectedFirecrawlCredentialVaultId = useMemo(() => {
            if (!selectedNode || selectedNode.data?.kind !== "firecrawl") return "";
            const selectedConfig = selectedNode.data?.config && typeof selectedNode.data.config === "object" ? selectedNode.data.config : {};
            const explicitVaultId = String(selectedConfig.credentialVaultId || selectedConfig.credential_vault_id || "").trim();
            if (explicitVaultId) return explicitVaultId;
            return parseMetronomeSecretCredentialRef(selectedConfig.credentialRef || selectedConfig.credential_ref || "").vaultId;
          }, [selectedNode]);
          useEffect(() => {
            if (!selectedFirecrawlCredentialVaultId) return undefined;
            if (Array.isArray(metronomeSecretVaultSecretsByVaultId[selectedFirecrawlCredentialVaultId])) return undefined;
            let cancelled = false;
            void loadMetronomeSecretVaultSecrets(selectedFirecrawlCredentialVaultId).then(() => {
              if (cancelled) return;
            });
            return () => {
              cancelled = true;
            };
          }, [selectedFirecrawlCredentialVaultId, metronomeSecretVaultSecretsByVaultId, loadMetronomeSecretVaultSecrets]);
          const selectedTicketNodeProjectId = useMemo(() => {
            if (!selectedNode || selectedNode.data?.kind !== "ticket") return "";
            return String(selectedNode.data?.config?.projectId || "").trim();
          }, [selectedNode]);
          useEffect(() => {
            if (!selectedTicketNodeProjectId) return undefined;
            if (Object.prototype.hasOwnProperty.call(metronomeProjectTicketsByProjectId, selectedTicketNodeProjectId)) {
              return undefined;
            }
            let cancelled = false;
            fetchMetronomeProjectTicketsApi(selectedTicketNodeProjectId, { apiKey })
              .then((tickets) => {
                if (cancelled) return;
                setMetronomeProjectTicketsByProjectId((current) => ({
                  ...current,
                  [selectedTicketNodeProjectId]: Array.isArray(tickets) ? tickets : [],
                }));
              })
              .catch(() => {
                if (cancelled) return;
                setMetronomeProjectTicketsByProjectId((current) => ({
                  ...current,
                  [selectedTicketNodeProjectId]: [],
                }));
              });
            return () => {
              cancelled = true;
            };
          }, [selectedTicketNodeProjectId, metronomeProjectTicketsByProjectId, apiKey]);
	          const updateInlineMetronomeNote = useCallback((nodeId, nextNote) => {
	            if (isActiveWorkflowBuiltIn) return;
	            const normalizedNodeId = String(nodeId || "").trim();
	            if (!normalizedNodeId) return;
	            setNodes((current) => current.map((node) => {
	              if (node.id !== normalizedNodeId || node.data?.kind !== "note") return node;
	              return {
	                ...node,
	                data: {
	                  ...(node.data || {}),
	                  config: {
	                    ...((node.data || {}).config || {}),
	                    note: String(nextNote || ""),
	                  },
	                },
	              };
	            }));
	          }, [isActiveWorkflowBuiltIn, setNodes]);
	          const selectedMetronomeRun = useMemo(() => {
	            return metronomeRuns.find((run) => run.id === selectedMetronomeRunId) || metronomeRuns[0] || null;
	          }, [metronomeRuns, selectedMetronomeRunId]);
          const activeWorkflowDeployments = useMemo(() => {
            const loadedVersions = metronomeVersionsByWorkflowId[activeWorkflowId];
            if (Array.isArray(loadedVersions)) return normalizeMetronomeDeployments(loadedVersions);
            return readMetronomeWorkflowDeployments(activeWorkflow || {});
          }, [activeWorkflow, activeWorkflowId, metronomeVersionsByWorkflowId]);
          const activeWorkflowDeployment = useMemo(() => {
            const activeDeploymentId = String(activeWorkflow?.activeDeploymentId || activeWorkflow?.metadata?.activeDeploymentId || activeWorkflow?.metadata?.active_deployment_id || "").trim();
            return activeWorkflowDeployments.find((deployment) => deployment.id === activeDeploymentId)
              || activeWorkflowDeployments.find((deployment) => deployment.status === "active")
              || null;
          }, [activeWorkflow, activeWorkflowDeployments]);
          const fallbackMetronomeDeploymentEvents = useMemo(() => {
            const metadata = activeWorkflow?.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {};
            const versionEvents = activeWorkflowDeployments
              .filter((deployment) => {
                const status = String(deployment.status || deployment.storageStatus || "").toLowerCase();
                return Boolean(deployment.publishedAt) || status === "active" || status === "published" || status === "superseded" || status === "unpublished";
              })
              .map((deployment, index) => normalizeMetronomeDeploymentEvent({
                id: "legacy-" + String(deployment.id || deployment.version || index),
                metronomeId: activeWorkflow?.id || "",
                versionId: deployment.id,
                action: String(deployment.status || "").toLowerCase() === "unpublished" ? "unpublish" : "publish",
                status: String(deployment.status || "").toLowerCase() === "unpublished" ? "unpublished" : "published",
                version: deployment.version,
                label: deployment.label || deployment.name,
                triggerSummary: deployment.triggerSummary,
                nodeCount: deployment.nodeCount,
                edgeCount: deployment.edgeCount,
                createdAt: deployment.publishedAt || deployment.updatedAt || deployment.createdAt,
                metadata: {
                  source: "version-history",
                },
              }));
            const unpublishedAt = String(metadata.unpublishedAt || metadata.unpublished_at || "").trim();
            const unpublishEvent = unpublishedAt
              ? [normalizeMetronomeDeploymentEvent({
                  id: "legacy-unpublish-" + (activeWorkflow?.id || "workflow") + "-" + unpublishedAt,
                  metronomeId: activeWorkflow?.id || "",
                  action: "unpublish",
                  status: "unpublished",
                  createdAt: unpublishedAt,
                  metadata: { source: "workflow-metadata" },
                })]
              : [];
            return normalizeMetronomeDeploymentEvents([...versionEvents, ...unpublishEvent]);
          }, [activeWorkflow, activeWorkflowDeployments]);
          const visibleMetronomeDeploymentEvents = metronomeDeploymentEvents.length
            ? metronomeDeploymentEvents
            : fallbackMetronomeDeploymentEvents;
          const refreshMetronomeDeploymentEvents = useCallback((workflowId = activeWorkflowId) => {
            const normalizedWorkflowId = String(workflowId || "").trim();
            if (!normalizedWorkflowId || isActiveWorkflowBuiltIn || !isMetronomeApiAvailable) return Promise.resolve([]);
            setIsLoadingMetronomeDeploymentEvents(true);
            setMetronomeDeploymentEventsError("");
            return fetchMetronomeDeploymentsApi(normalizedWorkflowId, 20)
              .then((items) => {
                setMetronomeDeploymentEvents(items);
                return items;
              })
              .catch((error) => {
                console.warn("[Metronome] Failed to refresh deployment history", error);
                setMetronomeDeploymentEventsError(error instanceof Error ? error.message : "Failed to load deployment history.");
                return [];
              })
              .finally(() => {
                setIsLoadingMetronomeDeploymentEvents(false);
              });
          }, [activeWorkflowId, isActiveWorkflowBuiltIn, isMetronomeApiAvailable]);
          const highlightedMetronomeRun = useMemo(() => {
            const normalizedRunId = String(metronomeEditorHighlightRunId || "").trim();
            if (!normalizedRunId) return null;
            return metronomeRuns.find((run) => run.id === normalizedRunId) || null;
          }, [metronomeRuns, metronomeEditorHighlightRunId]);
          const metronomeRunHighlight = useMemo(() => {
            const output = highlightedMetronomeRun?.output && typeof highlightedMetronomeRun.output === "object" ? highlightedMetronomeRun.output : {};
            const completedNodeIds = new Set(Array.isArray(output.completedNodeIds) ? output.completedNodeIds.map((id) => String(id || "").trim()).filter(Boolean) : []);
            const completedEdgeIds = new Set(Array.isArray(output.completedEdgeIds) ? output.completedEdgeIds.map((id) => String(id || "").trim()).filter(Boolean) : []);
            const activeNodeId = String(output.activeNodeId || "").trim();
            const activeEdgeId = String(output.activeEdgeId || "").trim();
            return { completedNodeIds, completedEdgeIds, activeNodeId, activeEdgeId };
          }, [highlightedMetronomeRun]);
          const metronomeWorkflowDefinition = useMemo(
            () => createMetronomeWorkflowDefinition(activeWorkflow, nodes, edges),
            [activeWorkflow, nodes, edges]
          );
          const generatedMetronomePythonFiles = useMemo(
            () => generateMetronomePythonSdkFiles(activeWorkflow, nodes, edges),
            [activeWorkflow, nodes, edges]
          );
          const generatedMetronomePythonCode = useMemo(
            () => generatedMetronomePythonFiles.find((file) => file.path === "main.py")?.value || "",
            [generatedMetronomePythonFiles]
          );
          useEffect(() => {
            if (!isMetronomeCodeDirty) {
              setMetronomeCodeFilesDraft(generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value })));
            }
          }, [generatedMetronomePythonFiles, isMetronomeCodeDirty]);
          const metronomeCodeFiles = metronomeCodeFilesDraft.length ? metronomeCodeFilesDraft : generatedMetronomePythonFiles;
          const activeMetronomeCodeFile = metronomeCodeFiles.find((file) => file.path === activeMetronomeCodeFilePath)
            || metronomeCodeFiles.find((file) => file.path === "main.py")
            || metronomeCodeFiles[0]
            || null;
          const METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID = "__current_metronome_editor__";
          const buildMetronomeVersionComparableSnapshot = (workflow, snapshotNodes, snapshotEdges) => {
            const baseWorkflow = workflow && typeof workflow === "object" ? workflow : {};
            const persistedNodes = createMetronomePersistedNodes(snapshotNodes || baseWorkflow.nodes || []);
            const persistedEdges = createMetronomePersistedEdges(snapshotEdges || baseWorkflow.edges || []);
            const comparableWorkflow = normalizeMetronomeWorkflow({
              ...baseWorkflow,
              nodes: persistedNodes,
              edges: persistedEdges,
              triggerSummary: deriveMetronomeTriggerSummary(persistedNodes),
            });
            const definition = createMetronomeWorkflowDefinition(comparableWorkflow, persistedNodes, persistedEdges);
            const files = generateMetronomePythonSdkFiles(comparableWorkflow, persistedNodes, persistedEdges);
            return {
              id: comparableWorkflow.id || "",
              name: comparableWorkflow.name || "Untitled Metronome",
              description: comparableWorkflow.description || "",
              status: comparableWorkflow.status || "draft",
              triggerSummary: comparableWorkflow.triggerSummary || deriveMetronomeTriggerSummary(persistedNodes),
              definition,
              files,
            };
          };
          const buildMetronomeVersionCompareSources = () => {
            const currentEditorSnapshot = buildMetronomeVersionComparableSnapshot(activeWorkflow || {}, nodes, edges);
            const versionSources = activeWorkflowDeployments.map((deployment) => {
              const deploymentNodes = createMetronomePersistedNodes(deployment.nodes || deployment.definition?.nodes || []);
              const deploymentEdges = createMetronomePersistedEdges(deployment.edges || deployment.definition?.edges || []);
              return {
                id: "version:" + String(deployment.id || ""),
                versionId: String(deployment.id || ""),
                label: String(deployment.label || ("Version " + deployment.version)).trim(),
                snapshot: buildMetronomeVersionComparableSnapshot({
                  ...(activeWorkflow || {}),
                  status: deployment.status || activeWorkflow?.status || "draft",
                  triggerSummary: deployment.triggerSummary || deriveMetronomeTriggerSummary(deploymentNodes),
                }, deploymentNodes, deploymentEdges),
              };
            });
            return [
              {
                id: METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID,
                versionId: "",
                label: "Current editor",
                snapshot: currentEditorSnapshot,
              },
              ...versionSources,
            ];
          };
          const getMetronomeVersionCompareSourceId = (versionId) => {
            const normalizedVersionId = String(versionId || "").trim();
            return normalizedVersionId ? "version:" + normalizedVersionId : "";
          };
          const resolveMetronomeVersionCompareSource = (sourceId, sources, fallbackSource = null) => {
            const normalizedSourceId = String(sourceId || "").trim();
            return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
          };
          const getDefaultMetronomeVersionCompareLeftSourceId = () => {
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const selectedDeployment = activeWorkflowDeployments.find((deployment) => deployment.id === selectedDeploymentId);
            const activeDeployment = activeWorkflowDeployment || activeWorkflowDeployments.find((deployment) => deployment.status === "active") || null;
            const fallbackDeployment = selectedDeployment || activeDeployment || activeWorkflowDeployments[0] || null;
            return fallbackDeployment ? getMetronomeVersionCompareSourceId(fallbackDeployment.id) : "";
          };
          const getSelectedMetronomeDeploymentVersion = () => {
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            return selectedDeploymentId
              ? activeWorkflowDeployments.find((deployment) => deployment.id === selectedDeploymentId) || null
              : null;
          };
          const buildMetronomeDefinitionForVersionCompare = (workflow, sourceNodes, sourceEdges) => (
            createMetronomeWorkflowDefinition(
              workflow || {},
              createMetronomePersistedNodes(sourceNodes || []),
              createMetronomePersistedEdges(sourceEdges || [])
            )
          );
          const getMetronomeDeploymentDefinitionForCompare = (deployment) => {
            if (deployment?.definition && typeof deployment.definition === "object" && !Array.isArray(deployment.definition)) {
              return deployment.definition;
            }
            return buildMetronomeDefinitionForVersionCompare(
              activeWorkflow || {},
              deployment?.nodes || [],
              deployment?.edges || []
            );
          };
          const hasSelectedMetronomeDeploymentEditorChanges = (deployment = null) => {
            const selectedDeployment = deployment || getSelectedMetronomeDeploymentVersion();
            if (!selectedDeployment || !activeWorkflow) {
              return false;
            }
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            if (String(selectedDeployment.id || "") !== String(selectedDeploymentId || "")) {
              return false;
            }
            const currentDefinition = buildMetronomeDefinitionForVersionCompare(activeWorkflow, nodes, edges);
            const selectedDefinition = getMetronomeDeploymentDefinitionForCompare(selectedDeployment);
            return stringifyPlaygroundVersionComparableValue(currentDefinition) !== stringifyPlaygroundVersionComparableValue(selectedDefinition);
          };
          const hasActiveMetronomeVersionChanges = () => Boolean(
            !activeWorkflowDeployments.length
            || isMetronomeCodeDirty
            || hasSelectedMetronomeDeploymentEditorChanges(getSelectedMetronomeDeploymentVersion())
          );
          const canPublishMetronomeDeploymentVersion = (deployment) => {
            const normalizedDeploymentId = String(deployment?.id || "").trim();
            if (!normalizedDeploymentId) {
              return false;
            }
            const selectedDeployment = getSelectedMetronomeDeploymentVersion();
            const hasSelectedEditorChanges = hasSelectedMetronomeDeploymentEditorChanges(selectedDeployment);
            const isActiveDeployment = String(deployment?.status || "").toLowerCase() === "active"
              || normalizedDeploymentId === String(activeWorkflowDeployment?.id || activeWorkflow?.activeDeploymentId || "").trim();
            if (isActiveDeployment) {
              return Boolean(selectedDeployment?.id === normalizedDeploymentId && hasSelectedEditorChanges);
            }
            return !hasSelectedEditorChanges;
          };
          const buildMetronomeVersionDiffFilesFromSnapshots = (leftSnapshot, rightSnapshot) => {
            const leftFiles = new Map((Array.isArray(leftSnapshot?.files) ? leftSnapshot.files : []).map((file) => [String(file?.path || ""), file]));
            const rightFiles = new Map((Array.isArray(rightSnapshot?.files) ? rightSnapshot.files : []).map((file) => [String(file?.path || ""), file]));
            const paths = Array.from(new Set(["workflow.json", ...leftFiles.keys(), ...rightFiles.keys()])).filter(Boolean);
            return paths.map((path) => {
              if (path === "workflow.json") {
                return createPlaygroundVersionDiffFile({
                  id: path,
                  filePath: path,
                  before: JSON.stringify({
                    name: leftSnapshot?.name || "",
                    description: leftSnapshot?.description || "",
                    status: leftSnapshot?.status || "",
                    triggerSummary: leftSnapshot?.triggerSummary || "",
                    definition: leftSnapshot?.definition || { nodes: [], edges: [] },
                  }, null, 2),
                  after: JSON.stringify({
                    name: rightSnapshot?.name || "",
                    description: rightSnapshot?.description || "",
                    status: rightSnapshot?.status || "",
                    triggerSummary: rightSnapshot?.triggerSummary || "",
                    definition: rightSnapshot?.definition || { nodes: [], edges: [] },
                  }, null, 2),
                });
              }
              const leftFile = leftFiles.get(path) || {};
              const rightFile = rightFiles.get(path) || {};
              return createPlaygroundVersionDiffFile({
                id: path,
                filePath: path,
                before: leftFile.value || "",
                after: rightFile.value || "",
              });
            }).filter(Boolean);
          };
          const openMetronomeVersionChangesPage = (versionId = "", options = {}) => {
            const explicitLeftSourceId = String(options.leftSourceId || "").trim();
            const explicitRightSourceId = String(options.rightSourceId || "").trim();
            const fallbackLeftSourceId = getMetronomeVersionCompareSourceId(versionId)
              || getDefaultMetronomeVersionCompareLeftSourceId();
            setSelectedNodeId("");
            setIsMetronomeRunSidebarOpen(false);
            setIsMetronomeRunSidebarMenuOpen(false);
            setIsMetronomePublishActionsMenuOpen(false);
            setIsMetronomeVersionSelectorMenuOpen(false);
            setIsMetronomePublishMenuOpen(true);
            setMetronomeVersionChangesState({
              leftSourceId: explicitLeftSourceId || fallbackLeftSourceId,
              rightSourceId: explicitRightSourceId || METRONOME_VERSION_COMPARE_CURRENT_EDITOR_ID,
            });
          };
          const closeMetronomeVersionChangesPage = () => {
            setMetronomeVersionChangesState(null);
          };
          const handleMetronomeVersionCompareSourceChange = (side, sourceId) => {
            const normalizedSourceId = String(sourceId || "").trim();
            setMetronomeVersionChangesState((current) => ({
              ...(current || {}),
              [side === "left" ? "leftSourceId" : "rightSourceId"]: normalizedSourceId,
            }));
          };
          const cloneGraphValue = useCallback((value) => JSON.parse(JSON.stringify(value || [])), []);
          const getGraphSnapshot = useCallback(() => ({
            nodes: cloneGraphValue(nodes),
            edges: cloneGraphValue(edges),
          }), [nodes, edges, cloneGraphValue]);
          const getSemanticGraphSnapshotKey = useCallback((snapshot) => JSON.stringify({
            nodes: (snapshot?.nodes || []).map((node) => ({
              id: node.id,
              type: node.type,
              data: node.data || {},
            })),
            edges: (snapshot?.edges || []).map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle || "",
              targetHandle: edge.targetHandle || "",
              type: edge.type || "",
              label: edge.label || "",
              data: edge.data || {},
            })),
          }), []);
          const restoreGraphSnapshot = useCallback((snapshot) => {
            const snapshotNodes = cloneGraphValue(snapshot?.nodes || []);
            const snapshotEdges = cloneGraphValue(snapshot?.edges || []);
            setNodes((currentNodes) => {
              const currentById = new Map((currentNodes || []).map((node) => [node.id, node]));
              return snapshotNodes.map((node) => {
                const currentNode = currentById.get(node.id);
                if (!currentNode) {
                  return { ...node, selected: false };
                }
                return {
                  ...node,
                  position: currentNode.position || node.position,
                  positionAbsolute: currentNode.positionAbsolute || node.positionAbsolute,
                  measured: currentNode.measured || node.measured,
                  selected: false,
                };
              });
            });
            setEdges(normalizeMetronomeEdges(snapshotEdges).map((edge) => ({ ...edge, selected: false })));
          }, [cloneGraphValue, setNodes, setEdges]);
          const pushGraphHistory = useCallback(() => {
            if (isActiveWorkflowBuiltIn) return;
            const snapshot = getGraphSnapshot();
            const snapshotKey = getSemanticGraphSnapshotKey(snapshot);
            setGraphUndoStack((current) => {
              const last = current[current.length - 1];
              if (last && getSemanticGraphSnapshotKey(last) === snapshotKey) {
                return current;
              }
              return [...current.slice(-24), snapshot];
            });
            setGraphRedoStack([]);
          }, [isActiveWorkflowBuiltIn, getGraphSnapshot, getSemanticGraphSnapshotKey]);
          const undoGraphChange = useCallback(() => {
            if (isActiveWorkflowBuiltIn) return;
            setGraphUndoStack((current) => {
              const previous = current[current.length - 1];
              if (!previous) return current;
              setGraphRedoStack((redoCurrent) => [getGraphSnapshot(), ...redoCurrent].slice(0, 25));
              restoreGraphSnapshot(previous);
              setSelectedNodeId("");
              return current.slice(0, -1);
            });
          }, [isActiveWorkflowBuiltIn, getGraphSnapshot, restoreGraphSnapshot]);
          const redoGraphChange = useCallback(() => {
            if (isActiveWorkflowBuiltIn) return;
            setGraphRedoStack((current) => {
              const next = current[0];
              if (!next) return current;
              setGraphUndoStack((undoCurrent) => [...undoCurrent.slice(-24), getGraphSnapshot()]);
              restoreGraphSnapshot(next);
              setSelectedNodeId("");
              return current.slice(1);
            });
          }, [isActiveWorkflowBuiltIn, getGraphSnapshot, restoreGraphSnapshot]);
          const handleLoopResizeStart = useCallback((nodeId, corner, event) => {
            if (isActiveWorkflowBuiltIn) return;
            const normalizedNodeId = String(nodeId || "").trim();
            const normalizedCorner = String(corner || "").trim();
            const startNode = nodes.find((node) => String(node?.id || "") === normalizedNodeId);
            const isResizableLoop = isMetronomeLoopNode(startNode);
            const isResizableNote = isMetronomeNoteNode(startNode);
            if (!normalizedNodeId || !startNode || (!isResizableLoop && !isResizableNote) || !event) return;
            const minWidth = isResizableLoop ? METRONOME_LOOP_NODE_MIN_WIDTH : METRONOME_NOTE_NODE_MIN_WIDTH;
            const minHeight = isResizableLoop ? METRONOME_LOOP_NODE_MIN_HEIGHT : METRONOME_NOTE_NODE_MIN_HEIGHT;
            const startClientX = Number(event.clientX) || 0;
            const startClientY = Number(event.clientY) || 0;
            const startPosition = {
              x: Number(startNode.position?.x) || 0,
              y: Number(startNode.position?.y) || 0,
            };
            const startDimensions = getMetronomeNodeDimensions(startNode);
            const zoom = Number.isFinite(Number(metronomeFlowZoom)) && Number(metronomeFlowZoom) > 0
              ? Number(metronomeFlowZoom)
              : 1;
            const affectsLeft = normalizedCorner.includes("left");
            const affectsTop = normalizedCorner.includes("top");
            let didPushHistory = false;
            const resizeLoopNode = (moveEvent) => {
              if (!moveEvent) return;
              moveEvent.preventDefault();
              moveEvent.stopPropagation();
              const dx = ((Number(moveEvent.clientX) || 0) - startClientX) / zoom;
              const dy = ((Number(moveEvent.clientY) || 0) - startClientY) / zoom;
              let nextWidth = affectsLeft ? startDimensions.width - dx : startDimensions.width + dx;
              let nextHeight = affectsTop ? startDimensions.height - dy : startDimensions.height + dy;
              nextWidth = Math.max(minWidth, Math.round(nextWidth));
              nextHeight = Math.max(minHeight, Math.round(nextHeight));
              const nextPosition = {
                x: affectsLeft ? startPosition.x + (startDimensions.width - nextWidth) : startPosition.x,
                y: affectsTop ? startPosition.y + (startDimensions.height - nextHeight) : startPosition.y,
              };
              if (!didPushHistory) {
                pushGraphHistory();
                didPushHistory = true;
              }
              setNodes((current) => current.map((node) => {
                if (String(node?.id || "") !== normalizedNodeId) return node;
                return {
                  ...node,
                  position: nextPosition,
                  style: {
                    ...(node.style || {}),
                    width: nextWidth,
                    height: nextHeight,
                  },
                };
              }));
            };
            const stopResize = () => {
              document.removeEventListener("mousemove", resizeLoopNode, true);
              document.removeEventListener("mouseup", stopResize, true);
            };
            document.addEventListener("mousemove", resizeLoopNode, true);
            document.addEventListener("mouseup", stopResize, true);
          }, [isActiveWorkflowBuiltIn, nodes, metronomeFlowZoom, setNodes, pushGraphHistory]);
          const renderedMetronomeNodes = useMemo(() => nodes.map((node) => {
            const nodeId = String(node.id || "");
            const runState = metronomeRunHighlight.activeNodeId === nodeId
              ? "active"
              : metronomeRunHighlight.completedNodeIds.has(nodeId)
                ? "completed"
                : "";
            const renderedStyle = isMetronomeLoopNode(node)
              ? normalizeMetronomeLoopNodeStyle(node.style)
              : isMetronomeNoteNode(node)
                ? normalizeMetronomeNoteNodeStyle(node.style)
                : node.style;
            return {
              ...node,
              style: renderedStyle,
	              data: {
	                ...(node.data || {}),
	                runState,
                  onNodeSelect: selectMetronomeNodeFromCanvas,
	                onInlineNoteChange: isActiveWorkflowBuiltIn ? undefined : updateInlineMetronomeNote,
	                onLoopResizeStart: isActiveWorkflowBuiltIn ? undefined : handleLoopResizeStart,
	              },
	            };
	          }), [nodes, metronomeRunHighlight, isActiveWorkflowBuiltIn, updateInlineMetronomeNote, handleLoopResizeStart, selectMetronomeNodeFromCanvas]);
          const renderedMetronomeEdges = useMemo(() => normalizeMetronomeEdgesForNodes(edges, nodes).map((edge) => {
            const edgeId = String(edge.id || "");
            const isActive = metronomeRunHighlight.activeEdgeId === edgeId;
            const isCompleted = metronomeRunHighlight.completedEdgeIds.has(edgeId);
            const className = [edge.className, isActive ? "is-metronome-run-active" : "", isCompleted ? "is-metronome-run-completed" : ""].filter(Boolean).join(" ");
            return {
              ...edge,
              type: "metronomeOutput",
              data: {
                ...(edge.data || {}),
              },
              className,
              style: {
                ...(edge.style || {}),
                stroke: isActive ? "#66a6ff" : isCompleted ? "rgba(102,166,255,0.88)" : "rgba(255,255,255,0.25)",
                strokeWidth: isActive || isCompleted ? 2 : 1.35,
              },
            };
          }), [edges, nodes, metronomeRunHighlight]);
          const nodeTypes = useMemo(() => ({ metronome: MetronomeWorkflowNode }), []);
          const edgeTypes = useMemo(() => ({ metronomeOutput: MetronomeOutputEdge }), []);
          const metronomeFlowGraphKey = useMemo(() => {
            const nodeKey = (Array.isArray(nodes) ? nodes : [])
              .map((node) => String(node?.id || ""))
              .filter(Boolean)
              .join(",");
            const edgeKey = (Array.isArray(renderedMetronomeEdges) ? renderedMetronomeEdges : [])
              .map((edge) => [
                edge?.id,
                edge?.source,
                edge?.sourceHandle,
                edge?.target,
                edge?.targetHandle,
              ].map((part) => String(part || "")).join(":"))
              .join(",");
            return [activeWorkflowId || "metronome", nodeKey, edgeKey].join("|");
          }, [activeWorkflowId, nodes, renderedMetronomeEdges]);
          const isSemanticNodeChange = useCallback((change) => {
            if (!change || !change.type) return false;
            if (change.type === "select" || change.type === "position" || change.type === "dimensions") {
              return false;
            }
            return true;
          }, []);
          const isSemanticEdgeChange = useCallback((change) => {
            if (!change || !change.type) return false;
            return change.type !== "select";
          }, []);
          const handleNodesChangeWithHistory = useCallback((changes) => {
            if (Array.isArray(changes) && changes.some(isSemanticNodeChange)) {
              pushGraphHistory();
            }
            onNodesChange(changes);
          }, [onNodesChange, pushGraphHistory, isSemanticNodeChange]);
          const handleEdgesChangeWithHistory = useCallback((changes) => {
            if (Array.isArray(changes) && changes.some(isSemanticEdgeChange)) {
              pushGraphHistory();
            }
            onEdgesChange(changes);
          }, [onEdgesChange, pushGraphHistory, isSemanticEdgeChange]);
          const kpis = useMemo(() => {
            const activeCount = visibleWorkflowRows.filter((workflow) => !isMetronomeWorkflowBuiltIn(workflow) && workflow.status === "active").length;
            const runsToday = visibleWorkflowRows.reduce((sum, workflow) => sum + (Number(workflow.runsToday) || 0), 0);
            const approvals = visibleWorkflowRows.reduce((sum, workflow) => sum + (Number(workflow.waitingApprovals) || 0), 0);
            return [
              { label: "Workflows", value: visibleWorkflowRows.length },
              { label: "Active", value: activeCount },
              { label: "Triggered today", value: runsToday },
              { label: "Waiting approvals", value: approvals },
              { label: "Failed runs", value: 0 },
            ];
          }, [visibleWorkflowRows]);

          const saveWorkflowGraph = useCallback(() => {
            if (!activeWorkflowId || !activeWorkflow || isActiveWorkflowBuiltIn) return;
            const nextWorkflow = {
              ...activeWorkflow,
              nodes,
              edges,
              triggerSummary: deriveMetronomeTriggerSummary(nodes),
              updatedAt: new Date().toISOString(),
            };
            replaceMetronomeWorkflowInEditableState(nextWorkflow.id, nextWorkflow);
            if (isMetronomeApiAvailable) {
              void saveEditableMetronomeWorkflowApi(nextWorkflow)
                .then((savedWorkflow) => {
                  replaceMetronomeWorkflowInEditableState(nextWorkflow.id, savedWorkflow);
                  if (savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                    setActiveWorkflowId(savedWorkflow.id);
                  }
                })
                .catch((error) => {
                  console.warn("[Metronome] Failed to persist draft", error);
                  setIsMetronomeApiAvailable(false);
                });
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, isActiveWorkflowBuiltIn, isMetronomeApiAvailable, replaceMetronomeWorkflowInEditableState]);

          const openCreateWorkflowModal = useCallback(() => {
            setWorkflowNameDraft("Project operating rhythm");
            setWorkflowWallpaperDraftId(getMetronomeWorkflowWallpaperId("", getMetronomeWorkflowWallpaperOptions()[0]?.id || ""));
            setWorkflowNameModal({ mode: "create", workflowId: "" });
          }, []);

          const createWorkflowFromTemplate = useCallback(async (template) => {
            const sourceTemplate = template && typeof template === "object" ? template : null;
            if (!sourceTemplate) {
              openCreateWorkflowModal();
              return;
            }
            const workflow = createDefaultMetronomeWorkflow(sourceTemplate.title || "Metronome workflow", {
              projectId: normalizedMetronomeProjectFilterId,
              projectName: selectedMetronomeProjectFilter?.name || "",
              graphFactory: typeof sourceTemplate.graphFactory === "function" ? sourceTemplate.graphFactory : createDefaultMetronomeGraph,
              templateId: sourceTemplate.id || "",
              templateName: sourceTemplate.title || "",
              creator: currentMetronomeUserCreator,
            });
            if (isMetronomeApiAvailable) {
              try {
                const savedWorkflow = await createMetronomeWorkflowApi(workflow);
                setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                setActiveWorkflowId(savedWorkflow.id);
                return;
              } catch (error) {
                console.warn("[Metronome] Failed to create workflow from template", error);
                setIsMetronomeApiAvailable(false);
              }
            }
            setWorkflows((current) => [workflow, ...current]);
            setActiveWorkflowId(workflow.id);
          }, [isMetronomeApiAvailable, normalizedMetronomeProjectFilterId, selectedMetronomeProjectFilter, openCreateWorkflowModal, currentMetronomeUserCreator]);

          const openMetronomeWorkflow = useCallback((workflow) => {
            const workflowId = String(workflow?.id || "").trim();
            if (!workflowId) return;
            const isTeamSharedWorkflow = isMetronomeWorkflowTeamShared(workflow);
            setOpenMetronomeOverviewMenuWorkflowId("");
            if (
              isTeamSharedWorkflow
              && (!hasMetronomeWorkflowGraphNodes(workflow) || !hasMetronomeWorkflowGraphEdges(workflow))
            ) {
              const canOpenCurrentGraph = hasMetronomeWorkflowGraphNodes(workflow);
              void hydrateTeamSharedMetronomeWorkflow(workflow)
                .then((loadedWorkflow) => {
                  if (loadedWorkflow?.id && hasMetronomeWorkflowGraphNodes(loadedWorkflow)) {
                    setActiveWorkflowId(loadedWorkflow.id);
                    return;
                  }
                  if (canOpenCurrentGraph) {
                    setActiveWorkflowId(workflowId);
                    return;
                  }
                  window.alert(getMetronomeTeamShareMissingGraphMessage(workflow));
                })
                .catch((error) => {
                  console.warn("[Metronome] Failed to hydrate team-shared workflow before opening", error);
                  if (canOpenCurrentGraph) {
                    setActiveWorkflowId(workflowId);
                    return;
                  }
                  window.alert(getMetronomeTeamShareMissingGraphMessage(workflow));
                });
              return;
            }
            if (
              !isMetronomeWorkflowBuiltIn(workflow)
              && !isTeamSharedWorkflow
              && isMetronomeApiAvailable
              && (!hasMetronomeWorkflowGraphNodes(workflow) || !hasMetronomeWorkflowGraphEdges(workflow))
            ) {
              void fetchMetronomeWorkflowWithGraphFromApi(workflowId, readMetronomeSelectedDeploymentId(workflow))
                .then((loadedWorkflow) => {
                  if (!loadedWorkflow?.id) {
                    setActiveWorkflowId(workflowId);
                    return;
                  }
                  setWorkflows((current) => replaceMetronomeWorkflowById(current, workflowId, loadedWorkflow));
                  setActiveWorkflowId(loadedWorkflow.id);
                })
                .catch((error) => {
                  console.warn("[Metronome] Failed to hydrate workflow before opening", error);
                  setActiveWorkflowId(workflowId);
                });
              return;
            }
            setActiveWorkflowId(workflowId);
          }, [isMetronomeApiAvailable, hydrateTeamSharedMetronomeWorkflow]);

          const openEditWorkflowModal = useCallback(() => {
            if (!activeWorkflow || isActiveWorkflowBuiltIn) return;
            setWorkflowNameDraft(activeWorkflow.name || "Untitled Metronome");
            setWorkflowWallpaperDraftId(getMetronomeWorkflowWallpaperId(activeWorkflow));
            setWorkflowNameModal({ mode: "edit", workflowId: activeWorkflow.id });
          }, [activeWorkflow, isActiveWorkflowBuiltIn]);

          const openEditWorkflowModalForWorkflow = useCallback((workflow) => {
            if (
              !workflow
              || isMetronomeWorkflowBuiltIn(workflow)
              || isMetronomeWorkflowTeamShared(workflow) && !canEditMetronomeTeamSharedWorkflow(workflow)
            ) return;
            setOpenMetronomeOverviewMenuWorkflowId("");
            setWorkflowNameDraft(workflow.name || "Untitled Metronome");
            setWorkflowWallpaperDraftId(getMetronomeWorkflowWallpaperId(workflow));
            setWorkflowNameModal({ mode: "edit", workflowId: workflow.id });
          }, []);

          const finishCloseWorkflowNameModal = useCallback(() => {
            if (workflowNameModalCloseTimerRef.current) {
              window.clearTimeout(workflowNameModalCloseTimerRef.current);
              workflowNameModalCloseTimerRef.current = null;
            }
            if (workflowNameModalFrameRef.current) {
              window.cancelAnimationFrame(workflowNameModalFrameRef.current);
              workflowNameModalFrameRef.current = null;
            }
            if (workflowWallpaperTransitionTimerRef.current) {
              window.clearTimeout(workflowWallpaperTransitionTimerRef.current);
              workflowWallpaperTransitionTimerRef.current = null;
            }
            workflowWallpaperPreloadTokenRef.current += 1;
            setWorkflowNameModal(null);
            setWorkflowNameModalVisible(false);
            setWorkflowNameModalClosing(false);
            setWorkflowNameDraft("");
            setWorkflowWallpaperDraftId("");
            setWorkflowWallpaperTransition(null);
          }, []);
          const closeWorkflowNameModal = useCallback((options = {}) => {
            if (!workflowNameModal) {
              finishCloseWorkflowNameModal();
              return;
            }
            if (options?.animate === false) {
              finishCloseWorkflowNameModal();
              return;
            }
            if (workflowNameModalClosing) return;
            if (workflowWallpaperTransitionTimerRef.current) {
              window.clearTimeout(workflowWallpaperTransitionTimerRef.current);
              workflowWallpaperTransitionTimerRef.current = null;
            }
            setWorkflowWallpaperTransition(null);
            setWorkflowNameModalVisible(false);
            setWorkflowNameModalClosing(true);
            if (workflowNameModalCloseTimerRef.current) {
              window.clearTimeout(workflowNameModalCloseTimerRef.current);
            }
            workflowNameModalCloseTimerRef.current = window.setTimeout(() => {
              workflowNameModalCloseTimerRef.current = null;
              finishCloseWorkflowNameModal();
            }, 75);
          }, [finishCloseWorkflowNameModal, workflowNameModal, workflowNameModalClosing]);

          useEffect(() => {
            if (!workflowNameModal) {
              setWorkflowNameModalVisible(false);
              setWorkflowNameModalClosing(false);
              return undefined;
            }
            if (workflowNameModalCloseTimerRef.current) {
              window.clearTimeout(workflowNameModalCloseTimerRef.current);
              workflowNameModalCloseTimerRef.current = null;
            }
            if (workflowNameModalFrameRef.current) {
              window.cancelAnimationFrame(workflowNameModalFrameRef.current);
              workflowNameModalFrameRef.current = null;
            }
            setWorkflowNameModalVisible(false);
            setWorkflowNameModalClosing(false);
            workflowNameModalFrameRef.current = window.requestAnimationFrame(() => {
              workflowNameModalFrameRef.current = window.requestAnimationFrame(() => {
                workflowNameModalFrameRef.current = null;
                setWorkflowNameModalVisible(true);
              });
            });
            return undefined;
          }, [Boolean(workflowNameModal)]);

          useEffect(() => {
            if (!workflowNameModal || typeof window === "undefined" || typeof window.Image !== "function") {
              return;
            }
            getMetronomeWorkflowWallpaperOptions().forEach((wallpaper) => {
              const url = String(wallpaper?.url || "").trim();
              if (!url) return;
              const image = new window.Image();
              image.decoding = "async";
              image.src = url;
            });
          }, [Boolean(workflowNameModal)]);

          useEffect(() => () => {
            if (workflowNameModalCloseTimerRef.current) {
              window.clearTimeout(workflowNameModalCloseTimerRef.current);
              workflowNameModalCloseTimerRef.current = null;
            }
            if (workflowNameModalFrameRef.current) {
              window.cancelAnimationFrame(workflowNameModalFrameRef.current);
              workflowNameModalFrameRef.current = null;
            }
            if (workflowVersionModalCloseTimerRef.current) {
              window.clearTimeout(workflowVersionModalCloseTimerRef.current);
              workflowVersionModalCloseTimerRef.current = null;
            }
            if (workflowVersionModalFrameRef.current) {
              window.cancelAnimationFrame(workflowVersionModalFrameRef.current);
              workflowVersionModalFrameRef.current = null;
            }
            workflowWallpaperPreloadTokenRef.current += 1;
          }, []);

          const finishCloseWorkflowVersionModal = useCallback(() => {
            if (workflowVersionModalCloseTimerRef.current) {
              window.clearTimeout(workflowVersionModalCloseTimerRef.current);
              workflowVersionModalCloseTimerRef.current = null;
            }
            if (workflowVersionModalFrameRef.current) {
              window.cancelAnimationFrame(workflowVersionModalFrameRef.current);
              workflowVersionModalFrameRef.current = null;
            }
            setWorkflowVersionModal(null);
            setWorkflowVersionModalVisible(false);
            setWorkflowVersionModalClosing(false);
            setWorkflowVersionNameDraft("");
            setWorkflowVersionDescriptionDraft("");
            setIsWorkflowVersionDescriptionEditing(false);
          }, []);

          const closeWorkflowVersionModal = useCallback((options = {}) => {
            if (options?.animate === false || (!workflowVersionModal && !workflowVersionModalVisible && !workflowVersionModalClosing)) {
              finishCloseWorkflowVersionModal();
              return;
            }
            if (workflowVersionModalClosing) {
              return;
            }
            if (workflowVersionModalFrameRef.current) {
              window.cancelAnimationFrame(workflowVersionModalFrameRef.current);
              workflowVersionModalFrameRef.current = null;
            }
            setWorkflowVersionModalVisible(false);
            setWorkflowVersionModalClosing(true);
            if (workflowVersionModalCloseTimerRef.current) {
              window.clearTimeout(workflowVersionModalCloseTimerRef.current);
            }
            workflowVersionModalCloseTimerRef.current = window.setTimeout(() => {
              workflowVersionModalCloseTimerRef.current = null;
              finishCloseWorkflowVersionModal();
            }, 120);
          }, [finishCloseWorkflowVersionModal, workflowVersionModal, workflowVersionModalClosing, workflowVersionModalVisible]);

          const openWorkflowVersionModal = useCallback((modalConfig) => {
            if (workflowVersionModalCloseTimerRef.current) {
              window.clearTimeout(workflowVersionModalCloseTimerRef.current);
              workflowVersionModalCloseTimerRef.current = null;
            }
            if (workflowVersionModalFrameRef.current) {
              window.cancelAnimationFrame(workflowVersionModalFrameRef.current);
              workflowVersionModalFrameRef.current = null;
            }
            setWorkflowVersionModalVisible(false);
            setWorkflowVersionModalClosing(false);
            setWorkflowVersionModal(modalConfig);
            workflowVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              workflowVersionModalFrameRef.current = window.requestAnimationFrame(() => {
                workflowVersionModalFrameRef.current = null;
                setWorkflowVersionModalVisible(true);
              });
            });
          }, []);

          const applyWorkflowVersionDescriptionFormat = useCallback((formatId) => {
            const textarea = workflowVersionDescriptionTextareaRef.current;
            const currentValue = String(workflowVersionDescriptionDraft || "");
            const start = textarea && typeof textarea.selectionStart === "number" ? textarea.selectionStart : currentValue.length;
            const end = textarea && typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : currentValue.length;
            const selectedText = currentValue.slice(start, end);
            let nextText = currentValue;
            let nextSelectionStart = start;
            let nextSelectionEnd = end;
            const wrapSelection = (prefix, suffix = prefix, placeholder = "text") => {
              const inner = selectedText || placeholder;
              nextText = currentValue.slice(0, start) + prefix + inner + suffix + currentValue.slice(end);
              nextSelectionStart = start + prefix.length;
              nextSelectionEnd = nextSelectionStart + inner.length;
            };
            if (formatId === "bold") {
              wrapSelection("**", "**", "bold text");
            } else if (formatId === "italic") {
              wrapSelection("_", "_", "italic text");
            } else if (formatId === "underline") {
              wrapSelection("<u>", "</u>", "underlined text");
            } else if (formatId === "list") {
              const inner = selectedText || "Change summary";
              const formatted = inner
                .split("\n")
                .map((line) => line.trim() ? "- " + line.replace(/^[-*]\s+/, "") : "- ")
                .join("\n");
              nextText = currentValue.slice(0, start) + formatted + currentValue.slice(end);
              nextSelectionStart = start;
              nextSelectionEnd = start + formatted.length;
            }
            setWorkflowVersionDescriptionDraft(nextText);
            setIsWorkflowVersionDescriptionEditing(true);
            if (textarea) {
              window.requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
              });
            }
          }, [workflowVersionDescriptionDraft]);

          const commitWorkflowNameModal = useCallback(async () => {
            if (!workflowNameModal) return;
            const nextName = workflowNameDraft.trim() || "Untitled Metronome";
            const nextWallpaperId = getMetronomeWorkflowWallpaperId(workflowWallpaperDraftId);
            if (workflowNameModal.mode === "create") {
              const workflow = createDefaultMetronomeWorkflow(nextName, {
                projectId: normalizedMetronomeProjectFilterId,
                projectName: selectedMetronomeProjectFilter?.name || "",
                creator: currentMetronomeUserCreator,
                metadata: {
                  ...(nextWallpaperId ? { wallpaperId: nextWallpaperId, workflowWallpaperId: nextWallpaperId } : {}),
                },
              });
              if (isMetronomeApiAvailable) {
                try {
                  const savedWorkflow = await createMetronomeWorkflowApi(workflow);
                  setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                  setActiveWorkflowId(savedWorkflow.id);
                  closeWorkflowNameModal();
                  return;
                } catch (error) {
                  console.warn("[Metronome] Failed to create persisted workflow", error);
                  setIsMetronomeApiAvailable(false);
                }
              }
              setWorkflows((current) => [workflow, ...current]);
              setActiveWorkflowId(workflow.id);
              closeWorkflowNameModal();
              return;
            }
            const targetWorkflow = workflows.find((workflow) => workflow.id === workflowNameModal.workflowId)
              || sharedMetronomeWorkflows.find((workflow) => workflow.id === workflowNameModal.workflowId)
              || activeWorkflow;
            if (!targetWorkflow) {
              closeWorkflowNameModal();
              return;
            }
            const targetMetadata = targetWorkflow.metadata && typeof targetWorkflow.metadata === "object" && !Array.isArray(targetWorkflow.metadata)
              ? targetWorkflow.metadata
              : {};
            const nextWorkflow = {
              ...targetWorkflow,
              name: nextName,
              ...(nextWallpaperId ? { wallpaperId: nextWallpaperId, workflowWallpaperId: nextWallpaperId } : {}),
              metadata: {
                ...targetMetadata,
                ...(nextWallpaperId ? { wallpaperId: nextWallpaperId, workflowWallpaperId: nextWallpaperId } : {}),
              },
              nodes: targetWorkflow.id === activeWorkflowId ? nodes : targetWorkflow.nodes,
              edges: targetWorkflow.id === activeWorkflowId ? edges : targetWorkflow.edges,
              triggerSummary: targetWorkflow.id === activeWorkflowId ? deriveMetronomeTriggerSummary(nodes) : targetWorkflow.triggerSummary,
              updatedAt: new Date().toISOString(),
            };
            replaceMetronomeWorkflowInEditableState(nextWorkflow.id, nextWorkflow);
            if (isMetronomeApiAvailable) {
              try {
                const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
                replaceMetronomeWorkflowInEditableState(nextWorkflow.id, savedWorkflow);
                if (targetWorkflow.id === activeWorkflowId && savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                  setActiveWorkflowId(savedWorkflow.id);
                }
              } catch (error) {
                console.warn("[Metronome] Failed to rename persisted workflow", error);
                setIsMetronomeApiAvailable(false);
              }
            }
            closeWorkflowNameModal();
          }, [workflowNameModal, workflowNameDraft, workflowWallpaperDraftId, isMetronomeApiAvailable, closeWorkflowNameModal, workflows, sharedMetronomeWorkflows, activeWorkflow, activeWorkflowId, nodes, edges, normalizedMetronomeProjectFilterId, selectedMetronomeProjectFilter, currentMetronomeUserCreator, replaceMetronomeWorkflowInEditableState]);

          const validateMetronomeDefinitionForPublishUi = useCallback(async (definition, options = {}) => {
            if (!definition || typeof definition !== "object") {
              setMetronomePublishState({
                status: "error",
                message: "The workflow is not ready to publish.",
                issues: [{
                  code: "missing_definition",
                  message: "Create a workflow graph before publishing.",
                  nodeId: "",
                  edgeId: "",
                  severity: "error",
                }],
              });
              return false;
            }
            const showLoading = options.showLoading !== false;
            if (showLoading) {
              setMetronomePublishState({ status: "validating", message: "Checking workflow before publishing..." });
            }
            try {
              const validation = await validateMetronomeDefinitionApi(definition, "publish");
              if (!validation.ok) {
                setMetronomePublishState({
                  status: "error",
                  message: "The workflow is not ready to publish.",
                  issues: validation.issues,
                });
                return false;
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState((current) => {
                if (current.status === "loading") return current;
                return { status: "idle", message: "" };
              });
              return true;
            } catch (error) {
              console.warn("[Metronome] Failed to validate workflow", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setMetronomePublishState(getMetronomePublishErrorState(error));
              return false;
            }
          }, []);

          const publishActiveWorkflowVersion = useCallback(async () => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const selectedDeployment = selectedDeploymentId
              ? existingDeployments.find((deployment) => deployment.id === selectedDeploymentId)
              : null;
            if (selectedDeployment) {
              const now = new Date().toISOString();
              const persistedNodes = createMetronomePersistedNodes(nodes);
              const persistedEdges = createMetronomePersistedEdges(edges);
              const triggerSummary = deriveMetronomeTriggerSummary(persistedNodes);
              const updatedSelectedDeployment = normalizeMetronomeDeploymentVersion({
                ...selectedDeployment,
                status: "active",
                nodes: persistedNodes,
                edges: persistedEdges,
                definition: createMetronomeWorkflowDefinition(activeWorkflow, persistedNodes, persistedEdges),
                triggerSummary,
                nodeCount: persistedNodes.length,
                edgeCount: persistedEdges.length,
                publishedAt: now,
                published_at: now,
                updatedAt: now,
                updated_at: now,
              });
              const canPublish = await validateMetronomeDefinitionForPublishUi(updatedSelectedDeployment.definition, { showLoading: true });
              if (!canPublish) return;
              const nextDeployments = normalizeMetronomeDeployments(existingDeployments.map((deployment) => {
                if (deployment.id === selectedDeployment.id) return updatedSelectedDeployment;
                return {
                  ...deployment,
                  status: deployment.status === "active" ? "superseded" : deployment.status,
                };
              }));
              const nextMetadata = {
                ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
                deployments: nextDeployments,
                metronomeDeployments: nextDeployments,
                activeDeploymentId: updatedSelectedDeployment.id,
                active_deployment_id: updatedSelectedDeployment.id,
                activeDeploymentVersion: updatedSelectedDeployment.version,
                active_deployment_version: updatedSelectedDeployment.version,
                publishedAt: now,
                published_at: now,
                restoredFromDeploymentId: updatedSelectedDeployment.id,
                restored_from_deployment_id: updatedSelectedDeployment.id,
                restoredFromDeploymentVersion: updatedSelectedDeployment.version,
                restored_from_deployment_version: updatedSelectedDeployment.version,
              };
              const nextWorkflow = normalizeMetronomeWorkflow({
                ...activeWorkflow,
                status: "active",
                nodes: persistedNodes,
                edges: persistedEdges,
                triggerSummary,
                deployments: nextDeployments,
                activeDeploymentId: updatedSelectedDeployment.id,
                activeDeploymentVersion: updatedSelectedDeployment.version,
                publishedAt: now,
                metadata: nextMetadata,
                updatedAt: now,
              });
              setMetronomePublishState({ status: "loading", message: "" });
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
              try {
                const workflowToSave = normalizeMetronomeWorkflow({
                  ...nextWorkflow,
                  status: activeWorkflow.status || "draft",
                  publishedAt: activeWorkflow.publishedAt || "",
                });
                const savedWorkflow = await saveEditableMetronomeWorkflowApi(workflowToSave);
                const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
                let versionIdForPublish = selectedDeployment.id;
                const selectedDeploymentIsPublished = String(selectedDeployment.status || "").toLowerCase() === "active"
                  || Boolean(String(selectedDeployment.publishedAt || "").trim());
                if (!selectedDeploymentIsPublished) {
                  try {
                    await updateMetronomeVersionApi(
                      workflowIdForVersion,
                      selectedDeployment.id,
                      { ...nextWorkflow, id: workflowIdForVersion },
                      persistedNodes,
                      persistedEdges,
                      {
                        label: updatedSelectedDeployment.label,
                        description: updatedSelectedDeployment.description,
                      }
                    );
                  } catch (versionUpdateError) {
                    if (versionUpdateError?.status === 404) {
                      const createdVersion = await createMetronomeVersionApi(workflowIdForVersion, { ...nextWorkflow, id: workflowIdForVersion }, persistedNodes, persistedEdges, {
                        label: updatedSelectedDeployment.label,
                        description: updatedSelectedDeployment.description,
                      });
                      versionIdForPublish = createdVersion.id || versionIdForPublish;
                    } else {
                      throw versionUpdateError;
                    }
                  }
                }
                const publishedWorkflow = await publishMetronomeVersionApi(
                  workflowIdForVersion,
                  versionIdForPublish,
                  selectedDeploymentIsPublished
                    ? {
                        definition: updatedSelectedDeployment.definition,
                        label: updatedSelectedDeployment.label,
                        description: updatedSelectedDeployment.description,
                      }
                    : {}
                );
                let versions = [];
                try {
                  versions = await fetchMetronomeVersionsApi(publishedWorkflow.id || workflowIdForVersion);
                } catch (versionLoadError) {
                  console.warn("[Metronome] Failed to refresh versions after publish", versionLoadError);
                }
                const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                  publishedWorkflow,
                  versions.length ? versions : nextDeployments,
                  versionIdForPublish
                );
                replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
                if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                  setActiveWorkflowId(hydratedWorkflow.id);
                }
                await refreshMetronomeDeploymentEvents(hydratedWorkflow.id || publishedWorkflow.id || workflowIdForVersion);
                setIsMetronomeApiAvailable(true);
                setMetronomePublishState({ status: "idle", message: "" });
              } catch (error) {
                console.warn("[Metronome] Failed to publish selected version", error);
                if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
                replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
                setMetronomePublishState(getMetronomePublishErrorState(error));
              }
              return;
            }
            const nextDeployment = createMetronomeDeploymentVersion(activeWorkflow, nodes, edges, existingDeployments, { status: "active" });
            const nextDeployments = [
              nextDeployment,
              ...existingDeployments
                .filter((deployment) => deployment.id !== nextDeployment.id)
                .map((deployment) => ({
                  ...deployment,
                  status: deployment.status === "active" ? "superseded" : deployment.status,
                })),
            ].slice(0, 20);
            const now = nextDeployment.publishedAt || new Date().toISOString();
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: nextDeployment.id,
              active_deployment_id: nextDeployment.id,
              activeDeploymentVersion: nextDeployment.version,
              active_deployment_version: nextDeployment.version,
              publishedAt: now,
              published_at: now,
              restoredFromDeploymentId: nextDeployment.id,
              restored_from_deployment_id: nextDeployment.id,
              restoredFromDeploymentVersion: nextDeployment.version,
              restored_from_deployment_version: nextDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: "active",
              nodes: nextDeployment.nodes,
              edges: nextDeployment.edges,
              triggerSummary: nextDeployment.triggerSummary || deriveMetronomeTriggerSummary(nextDeployment.nodes),
              deployments: nextDeployments,
              activeDeploymentId: nextDeployment.id,
              activeDeploymentVersion: nextDeployment.version,
              publishedAt: now,
              metadata: nextMetadata,
              updatedAt: now,
            });
            const canPublish = await validateMetronomeDefinitionForPublishUi(nextDeployment.definition, { showLoading: true });
            if (!canPublish) return;
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const workflowToSave = normalizeMetronomeWorkflow({
                ...nextWorkflow,
                status: activeWorkflow.status || "draft",
                publishedAt: activeWorkflow.publishedAt || "",
              });
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(workflowToSave);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              const createdVersion = await createMetronomeVersionApi(workflowIdForVersion, { ...nextWorkflow, id: workflowIdForVersion }, nextDeployment.nodes, nextDeployment.edges, {
                label: nextDeployment.label,
                description: nextDeployment.description,
              });
              const publishedWorkflow = await publishMetronomeVersionApi(workflowIdForVersion, createdVersion.id || nextDeployment.id);
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(publishedWorkflow.id || workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after publish", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                publishedWorkflow,
                versions.length ? versions : [createdVersion, ...nextDeployments],
                createdVersion.id || nextDeployment.id
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              await refreshMetronomeDeploymentEvents(hydratedWorkflow.id || publishedWorkflow.id || workflowIdForVersion);
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to publish deployment version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, refreshMetronomeDeploymentEvents, validateMetronomeDefinitionForPublishUi, replaceMetronomeWorkflowInEditableState]);

          const saveActiveWorkflowVersion = useCallback(async (versionDetails = {}) => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const nextDeployment = createMetronomeDeploymentVersion(activeWorkflow, nodes, edges, existingDeployments, {
              status: "saved",
              label: versionDetails?.label,
              description: versionDetails?.description,
            });
            const nextDeployments = [
              nextDeployment,
              ...existingDeployments.filter((deployment) => deployment.id !== nextDeployment.id),
            ].slice(0, 20);
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || "").trim();
            const activeDeployment = nextDeployments.find((deployment) => deployment.id === activeDeploymentId)
              || nextDeployments.find((deployment) => deployment.status === "active")
              || null;
            const now = new Date().toISOString();
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: activeDeployment?.id || "",
              active_deployment_id: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              active_deployment_version: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              published_at: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              restoredFromDeploymentId: nextDeployment.id,
              restored_from_deployment_id: nextDeployment.id,
              restoredFromDeploymentVersion: nextDeployment.version,
              restored_from_deployment_version: nextDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              nodes: nextDeployment.nodes,
              edges: nextDeployment.edges,
              triggerSummary: deriveMetronomeTriggerSummary(nextDeployment.nodes),
              deployments: nextDeployments,
              activeDeploymentId: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              const createdVersion = await createMetronomeVersionApi(workflowIdForVersion, nextWorkflow, nextDeployment.nodes, nextDeployment.edges, {
                label: nextDeployment.label,
                description: nextDeployment.description,
              });
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after create", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : [createdVersion, ...nextDeployments],
                createdVersion.id
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to save workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, replaceMetronomeWorkflowInEditableState]);

          const saveCurrentWorkflowVersion = useCallback(async () => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const selectedDeployment = existingDeployments.find((deployment) => deployment.id === selectedDeploymentId)
              || activeWorkflowDeployment
              || existingDeployments[0]
              || null;
            if (!selectedDeployment) {
              await saveActiveWorkflowVersion({ label: "Version 1", description: "" });
              return;
            }
            const selectedStatus = String(selectedDeployment.status || "").toLowerCase();
            const selectedIsImmutable = selectedStatus === "active" || Boolean(String(selectedDeployment.publishedAt || "").trim());
            if (selectedIsImmutable) {
              setMetronomePublishState({
                status: "error",
                message: "Published versions are immutable. Save to a new version instead.",
              });
              return;
            }
            const now = new Date().toISOString();
            const persistedNodes = createMetronomePersistedNodes(nodes);
            const persistedEdges = createMetronomePersistedEdges(edges);
            const triggerSummary = deriveMetronomeTriggerSummary(persistedNodes);
            const updatedDeployment = normalizeMetronomeDeploymentVersion({
              ...selectedDeployment,
              nodes: persistedNodes,
              edges: persistedEdges,
              definition: createMetronomeWorkflowDefinition(activeWorkflow, persistedNodes, persistedEdges),
              triggerSummary,
              nodeCount: persistedNodes.length,
              edgeCount: persistedEdges.length,
              updatedAt: now,
              updated_at: now,
            });
            const nextDeployments = normalizeMetronomeDeployments(existingDeployments.map((deployment) => (
              deployment.id === updatedDeployment.id ? updatedDeployment : deployment
            )));
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || activeWorkflow.metadata?.active_deployment_id || "").trim();
            const nextActiveDeployment = nextDeployments.find((deployment) => deployment.id === activeDeploymentId)
              || nextDeployments.find((deployment) => deployment.status === "active")
              || null;
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: nextActiveDeployment?.id || "",
              active_deployment_id: nextActiveDeployment?.id || "",
              activeDeploymentVersion: nextActiveDeployment?.version || 0,
              active_deployment_version: nextActiveDeployment?.version || 0,
              publishedAt: nextActiveDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              published_at: nextActiveDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              restoredFromDeploymentId: updatedDeployment.id,
              restored_from_deployment_id: updatedDeployment.id,
              restoredFromDeploymentVersion: updatedDeployment.version,
              restored_from_deployment_version: updatedDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              nodes: persistedNodes,
              edges: persistedEdges,
              triggerSummary,
              deployments: nextDeployments,
              activeDeploymentId: nextActiveDeployment?.id || "",
              activeDeploymentVersion: nextActiveDeployment?.version || 0,
              publishedAt: nextActiveDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              const updatedVersion = await updateMetronomeVersionApi(
                workflowIdForVersion,
                updatedDeployment.id,
                nextWorkflow,
                persistedNodes,
                persistedEdges,
                {
                  label: updatedDeployment.label,
                  description: updatedDeployment.description,
                }
              );
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after save", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : nextDeployments,
                updatedVersion.id || updatedDeployment.id
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to save current workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, activeWorkflowDeployment, nodes, edges, saveActiveWorkflowVersion, replaceMetronomeWorkflowInEditableState]);

          const openCreateWorkflowVersionModal = useCallback(() => {
            if (!activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const nextVersion = existingDeployments.reduce((maxVersion, deployment) => Math.max(maxVersion, Number(deployment.version || 0)), 0) + 1;
            setOpenMetronomeVersionMenuId("");
            setIsMetronomePublishSettingsMenuOpen(false);
            setWorkflowVersionNameDraft("Version " + nextVersion);
            setWorkflowVersionDescriptionDraft("");
            setIsWorkflowVersionDescriptionEditing(false);
            openWorkflowVersionModal({ mode: "create" });
          }, [activeWorkflow, openWorkflowVersionModal]);

          const openEditWorkflowVersionModal = useCallback((deploymentId) => {
            if (!activeWorkflow) return;
            const normalizedDeploymentId = String(deploymentId || "").trim();
            const targetDeployment = readMetronomeWorkflowDeployments(activeWorkflow).find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            setOpenMetronomeVersionMenuId("");
            setWorkflowVersionNameDraft(String(targetDeployment.label || ("Version " + targetDeployment.version)).trim());
            setWorkflowVersionDescriptionDraft(String(targetDeployment.description || "").trim());
            setIsWorkflowVersionDescriptionEditing(false);
            openWorkflowVersionModal({ mode: "edit", deploymentId: targetDeployment.id });
          }, [activeWorkflow, openWorkflowVersionModal]);

          const updateWorkflowVersionDetails = useCallback(async (deploymentId, versionDetails = {}) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            if (existingDeployments.length <= 1) return;
            const targetDeployment = existingDeployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const now = new Date().toISOString();
            const nextDeployments = normalizeMetronomeDeployments(existingDeployments.map((deployment) => {
              if (deployment.id !== normalizedDeploymentId) return deployment;
              return normalizeMetronomeDeploymentVersion({
                ...deployment,
                label: String(versionDetails?.label || deployment.label || ("Version " + deployment.version)).trim(),
                description: String(versionDetails?.description || "").trim(),
                updatedAt: now,
                updated_at: now,
              });
            }));
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || activeWorkflow.metadata?.active_deployment_id || "").trim();
            const activeDeployment = nextDeployments.find((deployment) => deployment.id === activeDeploymentId)
              || nextDeployments.find((deployment) => deployment.status === "active")
              || null;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const selectedDeployment = nextDeployments.find((deployment) => deployment.id === selectedDeploymentId)
              || (selectedDeploymentId ? null : activeDeployment);
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: activeDeployment?.id || "",
              active_deployment_id: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              active_deployment_version: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              published_at: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              restoredFromDeploymentId: selectedDeployment?.id || selectedDeploymentId || "",
              restored_from_deployment_id: selectedDeployment?.id || selectedDeploymentId || "",
              restoredFromDeploymentVersion: selectedDeployment?.version || activeWorkflow.metadata?.restoredFromDeploymentVersion || 0,
              restored_from_deployment_version: selectedDeployment?.version || activeWorkflow.metadata?.restored_from_deployment_version || 0,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              deployments: nextDeployments,
              activeDeploymentId: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              const updatedVersion = await updateMetronomeVersionApi(
                workflowIdForVersion,
                normalizedDeploymentId,
                nextWorkflow,
                targetDeployment.nodes,
                targetDeployment.edges,
                {
                  label: String(versionDetails?.label || targetDeployment.label || ("Version " + targetDeployment.version)).trim(),
                  description: String(versionDetails?.description || "").trim(),
                },
                { includeDefinition: false }
              );
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after edit", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : nextDeployments,
                updatedVersion.id || normalizedDeploymentId
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to edit workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, replaceMetronomeWorkflowInEditableState]);

          const deleteWorkflowVersion = useCallback(async (deploymentId) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const targetDeployment = existingDeployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const targetTitle = String(targetDeployment.label || ("Version " + targetDeployment.version)).trim();
            const confirmed = window.confirm("Delete \"" + targetTitle + "\"? This version history entry cannot be undone.");
            if (!confirmed) return;
            setOpenMetronomeVersionMenuId("");
            const nextDeployments = normalizeMetronomeDeployments(existingDeployments.filter((deployment) => deployment.id !== normalizedDeploymentId));
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || activeWorkflow.metadata?.active_deployment_id || "").trim();
            const deletedActiveDeployment = targetDeployment.id === activeDeploymentId || targetDeployment.status === "active";
            const nextActiveDeployment = deletedActiveDeployment
              ? null
              : nextDeployments.find((deployment) => deployment.id === activeDeploymentId)
                || nextDeployments.find((deployment) => deployment.status === "active")
                || null;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const deletedSelectedDeployment = targetDeployment.id === selectedDeploymentId;
            const fallbackSelectedDeployment = nextDeployments.find((deployment) => deployment.id === nextActiveDeployment?.id)
              || nextDeployments[0]
              || null;
            const nextSelectedDeployment = deletedSelectedDeployment
              ? fallbackSelectedDeployment
              : nextDeployments.find((deployment) => deployment.id === selectedDeploymentId) || fallbackSelectedDeployment;
            const nextNodes = deletedSelectedDeployment && nextSelectedDeployment
              ? createMetronomePersistedNodes(nextSelectedDeployment.nodes || nextSelectedDeployment.definition?.nodes || [])
              : createMetronomePersistedNodes(nodes);
            const nextEdges = deletedSelectedDeployment && nextSelectedDeployment
              ? createMetronomePersistedEdges(nextSelectedDeployment.edges || nextSelectedDeployment.definition?.edges || [])
              : createMetronomePersistedEdges(edges);
            const now = new Date().toISOString();
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: nextActiveDeployment?.id || "",
              active_deployment_id: nextActiveDeployment?.id || "",
              activeDeploymentVersion: nextActiveDeployment?.version || 0,
              active_deployment_version: nextActiveDeployment?.version || 0,
              publishedAt: nextActiveDeployment?.publishedAt || "",
              published_at: nextActiveDeployment?.publishedAt || "",
              restoredFromDeploymentId: nextSelectedDeployment?.id || "",
              restored_from_deployment_id: nextSelectedDeployment?.id || "",
              restoredFromDeploymentVersion: nextSelectedDeployment?.version || 0,
              restored_from_deployment_version: nextSelectedDeployment?.version || 0,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: nextActiveDeployment ? activeWorkflow.status : "draft",
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: deriveMetronomeTriggerSummary(nextNodes),
              deployments: nextDeployments,
              activeDeploymentId: nextActiveDeployment?.id || "",
              activeDeploymentVersion: nextActiveDeployment?.version || 0,
              publishedAt: nextActiveDeployment?.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            if (deletedSelectedDeployment) {
              setNodes(nextNodes);
              setEdges(nextEdges);
              setSelectedNodeId("");
            }
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              await deleteMetronomeVersionApi(activeWorkflowId, normalizedDeploymentId);
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after delete", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : nextDeployments,
                nextSelectedDeployment?.id || ""
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to delete workflow version", error);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              if (deletedSelectedDeployment) {
                setNodes(createMetronomePersistedNodes(activeWorkflow.nodes || []));
                setEdges(createMetronomePersistedEdges(activeWorkflow.edges || []));
              }
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, setNodes, setEdges, replaceMetronomeWorkflowInEditableState]);

          const commitWorkflowVersionModal = useCallback(async () => {
            if (!workflowVersionModal) return;
            const label = workflowVersionNameDraft.trim() || "Version";
            const description = workflowVersionDescriptionDraft.trim();
            if (workflowVersionModal.mode === "edit") {
              await updateWorkflowVersionDetails(workflowVersionModal.deploymentId, { label, description });
            } else {
              await saveActiveWorkflowVersion({ label, description });
            }
            closeWorkflowVersionModal();
          }, [workflowVersionModal, workflowVersionNameDraft, workflowVersionDescriptionDraft, saveActiveWorkflowVersion, updateWorkflowVersionDetails, closeWorkflowVersionModal]);

          const publishMetronomeDeploymentVersion = useCallback(async (deploymentId) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const deployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const targetDeployment = deployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const shouldPublishCurrentEditor = targetDeployment.id === selectedDeploymentId;
            const nextNodes = shouldPublishCurrentEditor
              ? createMetronomePersistedNodes(nodes)
              : createMetronomePersistedNodes(targetDeployment.nodes || targetDeployment.definition?.nodes || []);
            const nextEdges = shouldPublishCurrentEditor
              ? createMetronomePersistedEdges(edges)
              : createMetronomePersistedEdges(targetDeployment.edges || targetDeployment.definition?.edges || []);
            const definitionForPublish = shouldPublishCurrentEditor
              ? createMetronomeWorkflowDefinition(activeWorkflow, nextNodes, nextEdges)
              : targetDeployment.definition && typeof targetDeployment.definition === "object"
                ? targetDeployment.definition
                : createMetronomeWorkflowDefinition(activeWorkflow, nextNodes, nextEdges);
            const canPublish = await validateMetronomeDefinitionForPublishUi(definitionForPublish, { showLoading: true });
            if (!canPublish) return;
            const now = new Date().toISOString();
            const deploymentForPublish = normalizeMetronomeDeploymentVersion({
              ...targetDeployment,
              nodes: nextNodes,
              edges: nextEdges,
              definition: definitionForPublish,
              triggerSummary: deriveMetronomeTriggerSummary(nextNodes),
              nodeCount: nextNodes.length,
              edgeCount: nextEdges.length,
              updatedAt: now,
              updated_at: now,
            });
            const nextDeployments = deployments.map((deployment) => {
              if (deployment.id === targetDeployment.id) {
                return {
                  ...deploymentForPublish,
                  status: "active",
                  publishedAt: now,
                };
              }
              return {
                ...deployment,
                status: deployment.status === "active" ? "superseded" : deployment.status,
              };
            });
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: targetDeployment.id,
              active_deployment_id: targetDeployment.id,
              activeDeploymentVersion: targetDeployment.version,
              active_deployment_version: targetDeployment.version,
              publishedAt: now,
              published_at: now,
              restoredFromDeploymentId: targetDeployment.id,
              restored_from_deployment_id: targetDeployment.id,
              restoredFromDeploymentVersion: targetDeployment.version,
              restored_from_deployment_version: targetDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: "active",
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: deploymentForPublish.triggerSummary || deriveMetronomeTriggerSummary(nextNodes),
              deployments: nextDeployments,
              activeDeploymentId: targetDeployment.id,
              activeDeploymentVersion: targetDeployment.version,
              publishedAt: now,
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const workflowToSave = normalizeMetronomeWorkflow({
                ...nextWorkflow,
                status: activeWorkflow.status || "draft",
                publishedAt: activeWorkflow.publishedAt || "",
              });
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(workflowToSave);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              let versionIdForPublish = targetDeployment.id;
              const targetDeploymentIsPublished = String(targetDeployment.status || "").toLowerCase() === "active"
                || Boolean(String(targetDeployment.publishedAt || "").trim());
              if (!targetDeploymentIsPublished) {
                try {
                  await updateMetronomeVersionApi(
                    workflowIdForVersion,
                    targetDeployment.id,
                    { ...nextWorkflow, id: workflowIdForVersion },
                    nextNodes,
                    nextEdges,
                    {
                      label: deploymentForPublish.label,
                      description: deploymentForPublish.description,
                    }
                  );
                } catch (versionUpdateError) {
                  if (versionUpdateError?.status === 404) {
                    const createdVersion = await createMetronomeVersionApi(workflowIdForVersion, { ...nextWorkflow, id: workflowIdForVersion }, nextNodes, nextEdges, {
                      label: deploymentForPublish.label,
                      description: deploymentForPublish.description,
                    });
                    versionIdForPublish = createdVersion.id || versionIdForPublish;
                  } else {
                    throw versionUpdateError;
                  }
                }
              }
              const publishedWorkflow = await publishMetronomeVersionApi(
                workflowIdForVersion,
                versionIdForPublish,
                targetDeploymentIsPublished && shouldPublishCurrentEditor
                  ? {
                      definition: definitionForPublish,
                      label: deploymentForPublish.label,
                      description: deploymentForPublish.description,
                    }
                  : {}
              );
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(publishedWorkflow.id || workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after publish", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                publishedWorkflow,
                versions.length ? versions : nextDeployments,
                versionIdForPublish
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              await refreshMetronomeDeploymentEvents(hydratedWorkflow.id || publishedWorkflow.id || workflowIdForVersion);
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to publish saved version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setNodes(createMetronomePersistedNodes(activeWorkflow.nodes || []));
              setEdges(createMetronomePersistedEdges(activeWorkflow.edges || []));
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, setNodes, setEdges, refreshMetronomeDeploymentEvents, validateMetronomeDefinitionForPublishUi, replaceMetronomeWorkflowInEditableState]);

          const restoreActiveWorkflowVersion = useCallback(async (deploymentId) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const deployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const targetDeployment = deployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const nextNodes = createMetronomePersistedNodes(targetDeployment.nodes || targetDeployment.definition?.nodes || []);
            const nextEdges = createMetronomePersistedEdges(targetDeployment.edges || targetDeployment.definition?.edges || []);
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || "").trim();
            const activeDeployment = deployments.find((deployment) => deployment.id === activeDeploymentId)
              || deployments.find((deployment) => deployment.status === "active")
              || null;
            const now = new Date().toISOString();
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments,
              metronomeDeployments: deployments,
              activeDeploymentId: activeDeployment?.id || "",
              active_deployment_id: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              active_deployment_version: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              published_at: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              restoredFromDeploymentId: targetDeployment.id,
              restored_from_deployment_id: targetDeployment.id,
              restoredFromDeploymentVersion: targetDeployment.version,
              restored_from_deployment_version: targetDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: targetDeployment.triggerSummary || deriveMetronomeTriggerSummary(nextNodes),
              deployments,
              activeDeploymentId: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, savedWorkflow);
              if (savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(savedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to restore workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setNodes(createMetronomePersistedNodes(activeWorkflow.nodes || []));
              setEdges(createMetronomePersistedEdges(activeWorkflow.edges || []));
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, setNodes, setEdges, replaceMetronomeWorkflowInEditableState]);

          const revertActiveWorkflowToLastSavedVersion = useCallback(async () => {
            if (!activeWorkflow) return;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const fallbackDeployment = activeWorkflowDeployment || activeWorkflowDeployments[0] || null;
            const deploymentId = selectedDeploymentId || fallbackDeployment?.id || "";
            if (!deploymentId) return;
            await restoreActiveWorkflowVersion(deploymentId);
          }, [activeWorkflow, activeWorkflowDeployment, activeWorkflowDeployments, restoreActiveWorkflowVersion]);

          useEffect(() => {
            if (!isEditor || isActiveWorkflowBuiltIn || !activeWorkflow) {
              return undefined;
            }
            const handleMetronomeVersionShortcut = (event) => {
              if (!(event.metaKey || event.ctrlKey)) {
                return;
              }
              if (workflowVersionModal || workflowNameModal) {
                return;
              }
              const key = String(event.key || "").toLowerCase();
              if (key === "s") {
                event.preventDefault();
                if (event.shiftKey) {
                  openCreateWorkflowVersionModal();
                } else {
                  if (hasActiveMetronomeVersionChanges()) {
                    void publishActiveWorkflowVersion();
                  }
                }
                return;
              }
              if (key === "p") {
                event.preventDefault();
                if (hasActiveMetronomeVersionChanges()) {
                  void publishActiveWorkflowVersion();
                }
              }
            };
            window.addEventListener("keydown", handleMetronomeVersionShortcut, true);
            return () => window.removeEventListener("keydown", handleMetronomeVersionShortcut, true);
          }, [
            activeWorkflow,
            isActiveWorkflowBuiltIn,
            isEditor,
            openCreateWorkflowVersionModal,
            publishActiveWorkflowVersion,
            workflowNameModal,
            workflowVersionModal,
          ]);

          const unpublishActiveWorkflow = useCallback(async () => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const deployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const activeDeployment = deployments.find((deployment) => deployment.status === "active")
              || deployments.find((deployment) => deployment.id === String(activeWorkflow.activeDeploymentId || "").trim())
              || null;
            if (!activeDeployment && activeWorkflow.status !== "active") return;
            const confirmed = window.confirm("Unpublish this Metronome workflow? Version history will be kept, but production triggers will stop using it.");
            if (!confirmed) return;
            const now = new Date().toISOString();
            const nextDeployments = deployments.map((deployment) => ({
              ...deployment,
              status: deployment.status === "active" || deployment.id === activeDeployment?.id ? "unpublished" : deployment.status,
            }));
            const baseMetadata = activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {};
            const nextMetadata = {
              ...baseMetadata,
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: "",
              active_deployment_id: "",
              activeDeploymentVersion: 0,
              active_deployment_version: 0,
              unpublishedAt: now,
              unpublished_at: now,
            };
            delete nextMetadata.publishedAt;
            delete nextMetadata.published_at;
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: "draft",
              nodes,
              edges,
              deployments: nextDeployments,
              activeDeploymentId: "",
              activeDeploymentVersion: 0,
              publishedAt: "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const unpublishedWorkflow = await publishMetronomeWorkflowApi(savedWorkflow.id || nextWorkflow.id, false);
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, unpublishedWorkflow);
              if (unpublishedWorkflow.id && unpublishedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(unpublishedWorkflow.id);
              }
              await refreshMetronomeDeploymentEvents(unpublishedWorkflow.id || savedWorkflow.id || nextWorkflow.id);
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to unpublish workflow", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, refreshMetronomeDeploymentEvents, replaceMetronomeWorkflowInEditableState]);

          const createWorkflowCopy = useCallback(async (sourceWorkflow, options = {}) => {
            if (!sourceWorkflow) return;
            const nextWorkflow = createMetronomeWorkflowCopy(sourceWorkflow, options);
            if (isMetronomeApiAvailable) {
              try {
                const savedWorkflow = await createMetronomeWorkflowApi(nextWorkflow);
                setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                setActiveWorkflowId(savedWorkflow.id);
                return;
              } catch (error) {
                console.warn("[Metronome] Failed to duplicate persisted workflow", error);
                setIsMetronomeApiAvailable(false);
              }
            }
            setWorkflows((current) => [nextWorkflow, ...current]);
            setActiveWorkflowId(nextWorkflow.id);
          }, [isMetronomeApiAvailable]);

          const copyBuiltInWorkflow = useCallback(async (workflow) => {
            if (!workflow) return;
            await createWorkflowCopy(workflow, {
              name: (workflow.name || "Default workflow") + " copy",
              creator: currentMetronomeUserCreator,
            });
          }, [createWorkflowCopy, currentMetronomeUserCreator]);

          const duplicateWorkflow = useCallback(async (workflow) => {
            if (!workflow) return;
            setOpenMetronomeOverviewMenuWorkflowId("");
            if (isMetronomeWorkflowBuiltIn(workflow)) {
              await copyBuiltInWorkflow(workflow);
              return;
            }
            let sourceWorkflow = workflow;
            if (
              isMetronomeWorkflowTeamShared(sourceWorkflow)
              && (!hasMetronomeWorkflowGraphNodes(sourceWorkflow) || !hasMetronomeWorkflowGraphEdges(sourceWorkflow))
            ) {
              try {
                sourceWorkflow = await hydrateTeamSharedMetronomeWorkflow(sourceWorkflow);
              } catch (error) {
                console.warn("[Metronome] Failed to hydrate team-shared workflow before copying", error);
              }
              if (!hasMetronomeWorkflowGraphNodes(sourceWorkflow)) {
                window.alert(getMetronomeTeamShareMissingGraphMessage(workflow));
                return;
              }
            }
            const workflowId = String(sourceWorkflow.id || "").trim();
            await createWorkflowCopy(sourceWorkflow, {
              nodes: workflowId && workflowId === activeWorkflowId ? (nodes || sourceWorkflow.nodes || []) : (sourceWorkflow.nodes || []),
              edges: workflowId && workflowId === activeWorkflowId ? (edges || sourceWorkflow.edges || []) : (sourceWorkflow.edges || []),
              creator: currentMetronomeUserCreator,
            });
          }, [activeWorkflowId, nodes, edges, createWorkflowCopy, copyBuiltInWorkflow, hydrateTeamSharedMetronomeWorkflow, currentMetronomeUserCreator]);

          const duplicateActiveWorkflow = useCallback(async () => {
            if (!activeWorkflow) return;
            await duplicateWorkflow(activeWorkflow);
          }, [activeWorkflow, duplicateWorkflow]);

          const deleteWorkflow = useCallback((workflow) => {
            if (!workflow || isMetronomeWorkflowBuiltIn(workflow)) return;
            const workflowId = String(workflow.id || "").trim();
            if (!workflowId) return;
            setOpenMetronomeOverviewMenuWorkflowId("");
            const confirmed = window.confirm("Delete \"" + (workflow.name || "Untitled Metronome") + "\"? This cannot be undone.");
            if (!confirmed) return;
            setWorkflows((current) => current.filter((workflow) => workflow.id !== workflowId));
            if (workflowId === activeWorkflowId) {
              setActiveWorkflowId("");
              setSelectedNodeId("");
            }
            if (isMetronomeApiAvailable) {
              void deleteMetronomeWorkflowApi(workflowId)
                .catch((error) => {
                  console.warn("[Metronome] Failed to delete persisted workflow", error);
                  setIsMetronomeApiAvailable(false);
                });
            }
          }, [activeWorkflowId, isMetronomeApiAvailable]);

          const hideTeamSharedMetronomeWorkflowFromList = useCallback((workflow) => {
            if (!workflow || !isMetronomeWorkflowTeamShared(workflow)) return;
            const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(workflow);
            if (!hiddenKey) return;
            const workflowId = String(workflow.id || "").trim();
            setOpenMetronomeOverviewMenuWorkflowId("");
            setHiddenTeamSharedMetronomeWorkflowKeys((currentKeys) => {
              const nextKeys = normalizeMetronomeHiddenTeamSharedWorkflowKeys([...(Array.isArray(currentKeys) ? currentKeys : []), hiddenKey]);
              writeMetronomeHiddenTeamSharedWorkflowKeys(metronomeHiddenTeamSharedWorkflowStorageScope, nextKeys);
              return nextKeys;
            });
            if (workflowId && workflowId === activeWorkflowId) {
              setActiveWorkflowId("");
              setSelectedNodeId("");
            }
          }, [activeWorkflowId, metronomeHiddenTeamSharedWorkflowStorageScope]);

          const restoreTeamSharedMetronomeWorkflowToList = useCallback((workflow) => {
            if (!workflow || !isMetronomeWorkflowTeamShared(workflow)) return;
            const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(workflow);
            if (!hiddenKey) return;
            setOpenMetronomeOverviewMenuWorkflowId("");
            setHiddenTeamSharedMetronomeWorkflowKeys((currentKeys) => {
              const nextKeys = normalizeMetronomeHiddenTeamSharedWorkflowKeys(currentKeys)
                .filter((key) => key !== hiddenKey);
              writeMetronomeHiddenTeamSharedWorkflowKeys(metronomeHiddenTeamSharedWorkflowStorageScope, nextKeys);
              return nextKeys;
            });
          }, [metronomeHiddenTeamSharedWorkflowStorageScope]);

          const deleteActiveWorkflow = useCallback(() => {
            if (!activeWorkflowId || !activeWorkflow || isActiveWorkflowBuiltIn) return;
            deleteWorkflow(activeWorkflow);
          }, [activeWorkflow, activeWorkflowId, isActiveWorkflowBuiltIn, deleteWorkflow]);

          const openMetronomeShareWorkflowModal = useCallback((workflow) => {
            if (!workflow || isMetronomeWorkflowBuiltIn(workflow)) return;
            const workflowId = String(workflow.id || "").trim();
            if (!workflowId) return;
            setOpenMetronomeOverviewMenuWorkflowId("");
            setMetronomeShareWorkflowId(workflowId);
            setMetronomeShareAccessLevel("use");
            setMetronomeShareState({ status: "idle", message: "" });
          }, []);

          const closeMetronomeShareWorkflowModal = useCallback(() => {
            if (metronomeShareState.status === "loading" || metronomeShareState.status === "sharing") return;
            setMetronomeShareWorkflowId("");
            setMetronomeShareTeamId("");
            setMetronomeShareAccessLevel("use");
            setMetronomeShareState({ status: "idle", message: "" });
          }, [metronomeShareState.status]);

          const shareMetronomeWorkflowWithTeam = useCallback(async () => {
            if (!metronomeShareWorkflow || isMetronomeWorkflowBuiltIn(metronomeShareWorkflow)) return;
            const normalizedTeamId = String(metronomeShareTeamId || "").trim();
            const normalizedWorkflowId = String(metronomeShareWorkflow.id || "").trim();
            if (!normalizedTeamId || !normalizedWorkflowId) return;
            let normalizedBackendUrl = String(backendUrl || "/api/real").trim() || "/api/real";
            normalizedBackendUrl = normalizedBackendUrl.replace(new RegExp("/+$"), "");
            if (!normalizedBackendUrl) {
              setMetronomeShareState({ status: "error", message: "Team sharing is unavailable in this session." });
              return;
            }
            let workflowForShare = metronomeShareWorkflow;
            if (!hasMetronomeWorkflowGraphNodes(workflowForShare) || !hasMetronomeWorkflowGraphEdges(workflowForShare)) {
              try {
                const loadedWorkflow = await fetchMetronomeWorkflowWithGraphFromApi(normalizedWorkflowId, readMetronomeSelectedDeploymentId(workflowForShare));
                if (loadedWorkflow?.id) {
                  workflowForShare = mergeMetronomeWorkflowGraphFallback(workflowForShare, loadedWorkflow);
                  setWorkflows((current) => replaceMetronomeWorkflowById(current, normalizedWorkflowId, workflowForShare));
                }
              } catch (error) {
                console.warn("[Metronome] Failed to hydrate workflow before team sharing", error);
              }
            }
            if (!hasMetronomeWorkflowGraphNodes(workflowForShare)) {
              setMetronomeShareState({ status: "error", message: "The selected Metronome workflow graph could not be loaded. Save the workflow and try sharing it again." });
              return;
            }
            const isSharingActiveWorkflow = normalizedWorkflowId === activeWorkflowId;
            const shareNodes = isSharingActiveWorkflow ? (nodes || workflowForShare.nodes || []) : (workflowForShare.nodes || []);
            const shareEdges = isSharingActiveWorkflow ? (edges || workflowForShare.edges || []) : (workflowForShare.edges || []);
            const shareWorkflow = normalizeMetronomeWorkflow({
              ...workflowForShare,
              nodes: createMetronomePersistedNodes(shareNodes),
              edges: createMetronomePersistedEdges(shareEdges),
              triggerSummary: deriveMetronomeTriggerSummary(shareNodes),
            });
            let shareVersions = readMetronomeWorkflowDeployments(shareWorkflow);
            if (isMetronomeApiAvailable) {
              try {
                const fetchedVersions = await fetchMetronomeVersionsApi(normalizedWorkflowId);
                if (Array.isArray(fetchedVersions) && fetchedVersions.length) {
                  shareVersions = fetchedVersions;
                }
              } catch (versionError) {
                console.warn("[Metronome] Failed to load workflow versions before team sharing", versionError);
              }
            }
            const accessLevel = ["use", "edit", "manage"].includes(String(metronomeShareAccessLevel || "").trim())
              ? String(metronomeShareAccessLevel || "").trim()
              : "use";
            setMetronomeShareState({ status: "sharing", message: "" });
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              if (apiKey) headers.set("X-API-Key", apiKey);
              const shareCreator = normalizeMetronomeWorkflowCreator(shareWorkflow) || currentMetronomeUserCreator;
              const shareCreatorMetadata = buildMetronomeWorkflowCreatorMetadata(shareCreator);
              const shareDefinition = createMetronomeWorkflowDefinition(shareWorkflow, shareWorkflow.nodes, shareWorkflow.edges);
              const workflowGraphSnapshot = {
                definition: shareDefinition,
                nodes: shareDefinition.nodes,
                edges: shareDefinition.edges,
              };
              const shareMetadata = {
                resourceType: "metronome_workflow",
                resourceKind: "metronome_workflow",
                definition: shareDefinition,
                nodes: shareDefinition.nodes,
                edges: shareDefinition.edges,
                workflowGraphSnapshot,
                graphSnapshot: workflowGraphSnapshot,
                deployments: shareVersions,
                metronomeDeployments: shareVersions,
                versions: shareVersions,
                ...shareCreatorMetadata,
                workflow: {
                  id: normalizedWorkflowId,
                  name: shareWorkflow.name || "Untitled Metronome",
                  description: shareWorkflow.description || "",
                  status: shareWorkflow.status || "draft",
                  triggerSummary: shareWorkflow.triggerSummary || "Manual",
                  projectId: readMetronomeWorkflowProjectId(shareWorkflow),
                  projectName: readMetronomeWorkflowProjectName(shareWorkflow),
                  nodeCount: shareWorkflow.nodes.length,
                  edgeCount: shareWorkflow.edges.length,
                  definition: shareDefinition,
                  nodes: shareDefinition.nodes,
                  edges: shareDefinition.edges,
                  workflowGraphSnapshot,
                  graphSnapshot: workflowGraphSnapshot,
                  deployments: shareVersions,
                  metronomeDeployments: shareVersions,
                  versions: shareVersions,
                  ...shareCreatorMetadata,
                },
              };
              const postSharePayload = (payload) => fetch(
                normalizedBackendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares",
                {
                  method: "POST",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                  body: JSON.stringify(payload),
                }
              );
              const basePayload = {
                resourceType: "metronome_workflow",
                resourceId: normalizedWorkflowId,
                accessLevel,
                metadata: shareMetadata,
              };
              let response = await postSharePayload(basePayload);
              let data = await response.json().catch(() => ({}));
              if (!response.ok && [400, 404, 409, 500].includes(Number(response.status || 0))) {
                response = await postSharePayload({
                  ...basePayload,
                  resourceType: "imagine_template",
                  metadata: {
                    ...shareMetadata,
                    backendCompatibilityResourceType: "imagine_template",
                  },
                });
                data = await response.json().catch(() => ({}));
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to share workflow.");
              }
              setMetronomeShareWorkflowId("");
              setMetronomeShareTeamId("");
              setMetronomeShareAccessLevel("use");
              setMetronomeShareState({ status: "idle", message: "" });
            } catch (error) {
              setMetronomeShareState({ status: "error", message: error?.message || "Failed to share workflow." });
            }
          }, [metronomeShareWorkflow, metronomeShareTeamId, metronomeShareAccessLevel, backendUrl, apiKey, requestHeaders, activeWorkflowId, nodes, edges, currentMetronomeUserCreator]);

          const handleMetronomeCodeFileSelect = useCallback((path) => {
            const normalizedPath = String(path || "").trim();
            if (normalizedPath) setActiveMetronomeCodeFilePath(normalizedPath);
          }, []);

          const handleMetronomeCodeFileChange = useCallback((nextCode) => {
            if (isActiveWorkflowBuiltIn) return;
            const activePath = String(activeMetronomeCodeFile?.path || activeMetronomeCodeFilePath || "main.py");
            setMetronomeCodeFilesDraft((current) => {
              const baseFiles = current.length ? current : generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value }));
              return baseFiles.map((file) => file.path === activePath
                ? { ...file, value: String(nextCode || "") }
                : file
              );
            });
            setIsMetronomeCodeDirty(true);
            setMetronomeCodeRunState({ status: "idle", message: "" });
          }, [isActiveWorkflowBuiltIn, activeMetronomeCodeFile, activeMetronomeCodeFilePath, generatedMetronomePythonFiles]);

          const handleRevertMetronomeCodeDraft = useCallback(() => {
            if (isActiveWorkflowBuiltIn) return;
            setMetronomeCodeFilesDraft(generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value })));
            setActiveMetronomeCodeFilePath("main.py");
            setIsMetronomeCodeDirty(false);
            setMetronomeCodeRunState({ status: "idle", message: "Reverted to the visual workflow." });
          }, [isActiveWorkflowBuiltIn, generatedMetronomePythonFiles]);

          const applyMetronomeCodeDraftToGraph = useCallback((options = {}) => {
            if (isActiveWorkflowBuiltIn) {
              throw new Error("Copy this default workflow before editing generated code.");
            }
            if (!activeWorkflowId || !activeWorkflow) {
              throw new Error("Open a Metronome workflow before applying code.");
            }
            const parsed = parseMetronomePythonSdkFiles(metronomeCodeFiles, activeWorkflow.name);
            const nextNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
            const nextEdges = normalizeMetronomeEdgesForNodes(parsed.edges, nextNodes);
            pushGraphHistory();
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            const nextName = String(parsed.name || activeWorkflow.name || "Untitled Metronome").trim() || "Untitled Metronome";
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, {
              ...activeWorkflow,
              name: nextName,
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: deriveMetronomeTriggerSummary(nextNodes),
              updatedAt: new Date().toISOString(),
            });
            setIsMetronomeCodeDirty(false);
            const nextFiles = generateMetronomePythonSdkFiles({ ...activeWorkflow, name: nextName }, nextNodes, nextEdges)
              .map((file) => ({ ...file, originalValue: file.value }));
            setMetronomeCodeFilesDraft(nextFiles);
            setActiveMetronomeCodeFilePath((currentPath) => nextFiles.some((file) => file.path === currentPath) ? currentPath : "main.py");
            if (!options.silent) {
              setMetronomeCodeRunState({ status: "success", message: "Code applied to the visual editor." });
            }
            return { name: nextName, nodes: nextNodes, edges: nextEdges };
          }, [isActiveWorkflowBuiltIn, activeWorkflow, activeWorkflowId, metronomeCodeFiles, pushGraphHistory, setNodes, setEdges, replaceMetronomeWorkflowInEditableState]);

          const handleApplyMetronomeCodeDraft = useCallback(() => {
            try {
              applyMetronomeCodeDraftToGraph();
            } catch (error) {
              setMetronomeCodeRunState({ status: "error", message: error?.message || "Could not apply code to the visual editor." });
            }
          }, [applyMetronomeCodeDraftToGraph]);

          const setMetronomeEditorModeFromNav = useCallback((nextMode) => {
            const normalizedMode = nextMode === "runs" ? "runs" : nextMode === "code" ? "code" : "edit";
            if (normalizedMode !== "code" && metronomeEditorMode === "code" && isMetronomeCodeDirty) {
              try {
                applyMetronomeCodeDraftToGraph({ silent: true });
              } catch (error) {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Fix code errors before returning to the visual editor." });
                return;
              }
            }
            setMetronomeRunInlineDetailId("");
            setMetronomeEditorMode(normalizedMode);
          }, [metronomeEditorMode, isMetronomeCodeDirty, applyMetronomeCodeDraftToGraph]);

          const handleCopyGeneratedMetronomeCode = useCallback(() => {
            if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
              void navigator.clipboard.writeText(String(activeMetronomeCodeFile?.value || ""));
            }
          }, [activeMetronomeCodeFile]);

          const handleTestRunGeneratedMetronome = useCallback(() => {
            if (isActiveWorkflowBuiltIn) {
              setMetronomeCodeRunState({ status: "error", message: "Copy this default workflow before running a test." });
              return;
            }
            if (!activeWorkflow?.id) {
              setMetronomeCodeRunState({ status: "error", message: "Save the workflow before running a test." });
              return;
            }
            let nextDefinition = metronomeWorkflowDefinition;
            if (isMetronomeCodeDirty) {
              try {
                const parsed = parseMetronomePythonSdkFiles(metronomeCodeFiles, activeWorkflow.name);
                nextDefinition = createMetronomeWorkflowDefinition(
                  { ...activeWorkflow, name: parsed.name || activeWorkflow.name },
                  parsed.nodes,
                  parsed.edges
                );
              } catch (error) {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Fix code errors before running a test." });
                return;
              }
            }
            setMetronomeCodeRunState({ status: "loading", message: "Starting test run..." });
            const workflowForRun = {
              ...activeWorkflow,
              nodes,
              edges,
              triggerSummary: deriveMetronomeTriggerSummary(nodes),
              updatedAt: new Date().toISOString(),
            };
            void saveEditableMetronomeWorkflowApi(workflowForRun)
              .then((savedWorkflow) => {
                replaceMetronomeWorkflowInEditableState(workflowForRun.id, savedWorkflow);
                if (savedWorkflow.id && savedWorkflow.id !== activeWorkflow.id) {
                  setActiveWorkflowId(savedWorkflow.id);
                }
                return testRunMetronomeWorkflowApi(savedWorkflow.id, nextDefinition);
              })
              .then(() => {
                setMetronomeCodeRunState({ status: "success", message: "Test run started." });
              })
              .catch((error) => {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Test run failed." });
              });
          }, [isActiveWorkflowBuiltIn, activeWorkflow, nodes, edges, metronomeWorkflowDefinition, metronomeCodeFiles, isMetronomeCodeDirty, replaceMetronomeWorkflowInEditableState]);

          const openMetronomeRunSidebar = useCallback((runId = "") => {
            setSelectedNodeId("");
            setIsMetronomePublishActionsMenuOpen(false);
            setIsMetronomePublishMenuOpen(false);
            setMetronomeRunInlineDetailId("");
            const normalizedRunId = String(runId || "").trim();
            if (normalizedRunId) {
              setSelectedMetronomeRunId(normalizedRunId);
            } else {
              setSelectedMetronomeRunId("");
            }
            setIsMetronomeRunSidebarMenuOpen(false);
            setIsMetronomeRunSidebarOpen(true);
          }, []);

          const closeMetronomeRunSidebar = useCallback(() => {
            setIsMetronomeRunSidebarMenuOpen(false);
            setIsMetronomeRunSidebarOpen(false);
          }, []);

          const getRunnableMetronomeDefinition = useCallback(() => {
            if (!activeWorkflow) {
              throw new Error("Open a Metronome workflow before running.");
            }
            if (metronomeEditorMode === "code" && isMetronomeCodeDirty) {
              const parsed = parseMetronomePythonSdkFiles(metronomeCodeFiles, activeWorkflow.name);
              return createMetronomeWorkflowDefinition(
                { ...activeWorkflow, name: parsed.name || activeWorkflow.name },
                parsed.nodes,
                parsed.edges
              );
            }
            return metronomeWorkflowDefinition;
          }, [activeWorkflow, metronomeEditorMode, isMetronomeCodeDirty, metronomeCodeFiles, metronomeWorkflowDefinition]);

          const startMetronomeRun = useCallback((prompt = metronomeRunPrompt, options = {}) => {
            if (isActiveWorkflowBuiltIn && !isActiveWorkflowRunnableReadOnly) {
              setMetronomeRunState({ status: "error", message: "Copy this default workflow before running it." });
              return;
            }
            if (!activeWorkflow?.id) {
              setMetronomeRunState({ status: "error", message: "Save this Metronome before running it." });
              return;
            }
            const runAgentId = String(options?.agentId || metronomeRunAgentId || defaultMetronomeAgentOption?.id || "").trim();
            const runEnvironmentId = String(options?.environmentId || metronomeRunEnvironmentId || defaultMetronomeComputerOption?.id || "").trim();
            let nextDefinition = metronomeWorkflowDefinition;
            try {
              nextDefinition = getRunnableMetronomeDefinition();
            } catch (error) {
              setMetronomeRunState({ status: "error", message: error?.message || "Fix workflow code before running." });
              return;
            }
            const workflowForRun = isActiveWorkflowRunnableReadOnly
              ? createMetronomeWorkflowCopy(activeWorkflow, {
                  name: activeWorkflow.name || "Default workflow",
                  nodes,
                  edges,
                  creator: currentMetronomeUserCreator,
                })
              : {
                  ...activeWorkflow,
                  nodes,
                  edges,
                  triggerSummary: deriveMetronomeTriggerSummary(nodes),
                  updatedAt: new Date().toISOString(),
                };
            setMetronomeRunState({ status: "loading", message: "Starting workflow run..." });
            void saveEditableMetronomeWorkflowApi(workflowForRun)
              .then((savedWorkflow) => {
                setIsMetronomeApiAvailable(true);
                if (isActiveWorkflowRunnableReadOnly) {
                  setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                } else {
                  replaceMetronomeWorkflowInEditableState(workflowForRun.id, savedWorkflow);
                }
                if (savedWorkflow.id && savedWorkflow.id !== activeWorkflow.id) {
                  setActiveWorkflowId(savedWorkflow.id);
                }
                return createMetronomeRunApi(savedWorkflow.id, {
                  definition: nextDefinition,
                  prompt,
                  inputs: {
                    agentId: runAgentId,
                    environmentId: runEnvironmentId,
                    sourceThreadId: options?.sourceThreadId || null,
                    attachments: Array.isArray(options?.attachments) ? options.attachments : [],
                    enabledSkills: options?.enabledSkills || null,
                  },
                })
                  .then((run) => ({ run, savedWorkflow }))
                  .catch((error) => {
                    if (error?.status !== 404) {
                      throw error;
                    }
                    return createMetronomeWorkflowApi(workflowForRun)
                      .then((recreatedWorkflow) => {
                        setIsMetronomeApiAvailable(true);
                        if (isActiveWorkflowRunnableReadOnly) {
                          setWorkflows((current) => replaceMetronomeWorkflow(current, recreatedWorkflow));
                        } else {
                          replaceMetronomeWorkflowInEditableState(savedWorkflow.id || workflowForRun.id, recreatedWorkflow);
                        }
                        if (recreatedWorkflow.id && recreatedWorkflow.id !== activeWorkflow.id) {
                          setActiveWorkflowId(recreatedWorkflow.id);
                        }
                        return createMetronomeRunApi(recreatedWorkflow.id, {
                          definition: nextDefinition,
                          prompt,
                          inputs: {
                            agentId: runAgentId,
                            environmentId: runEnvironmentId,
                            sourceThreadId: options?.sourceThreadId || null,
                            attachments: Array.isArray(options?.attachments) ? options.attachments : [],
                            enabledSkills: options?.enabledSkills || null,
                          },
                        }).then((run) => ({ run, savedWorkflow: recreatedWorkflow }));
                      });
                  });
              })
	              .then((run) => {
	                const nextRun = run?.run || run;
	                const savedWorkflow = run?.savedWorkflow || activeWorkflow;
	                setMetronomeRuns((current) => [nextRun, ...current.filter((item) => item.id !== nextRun.id)]);
	                if (typeof window !== "undefined") {
	                  window.dispatchEvent(new CustomEvent("playground:metronome-run-upserted", {
	                    detail: { workflow: savedWorkflow, run: nextRun },
	                  }));
	                }
	                setSelectedMetronomeRunId(nextRun.id);
                setMetronomeRunInlineDetailId("");
                setMetronomeEditorHighlightRunId(nextRun.id);
                setMetronomeEditorMode("runs");
                setIsMetronomePublishActionsMenuOpen(false);
                setIsMetronomePublishMenuOpen(false);
                setIsMetronomeRunSidebarOpen(true);
                setMetronomeRunPrompt("");
                setMetronomeRunState({ status: "success", message: "Workflow run completed." });
                replaceMetronomeWorkflowInEditableState(savedWorkflow.id, {
                  ...savedWorkflow,
                  lastRunAt: nextRun.createdAt || new Date().toISOString(),
                  runsToday: (Number(savedWorkflow.runsToday) || 0) + 1,
                });
              })
              .catch((error) => {
                setMetronomeRunState({ status: "error", message: error?.message || "Workflow run failed." });
              });
          }, [isActiveWorkflowBuiltIn, isActiveWorkflowRunnableReadOnly, activeWorkflow, nodes, edges, currentMetronomeUserCreator, metronomeWorkflowDefinition, getRunnableMetronomeDefinition, metronomeRunPrompt, metronomeRunAgentId, metronomeRunEnvironmentId, defaultMetronomeAgentOption, defaultMetronomeComputerOption, replaceMetronomeWorkflowInEditableState]);

          const returnToMetronomeOverview = useCallback(() => {
            setActiveWorkflowId("");
            setSelectedNodeId("");
            setMetronomeRunInlineDetailId("");
            setIsMetronomeRunSidebarOpen(false);
          }, []);

          useEffect(() => {
            if (!topNavActionsRef) return;
            topNavActionsRef.current = activeWorkflow
              ? isActiveWorkflowBuiltIn
                ? {
                    edit: null,
                    rename: null,
	                    duplicate: duplicateActiveWorkflow,
	                    share: null,
	                    delete: null,
	                    publish: null,
	                    run: isActiveWorkflowRunnableReadOnly ? openMetronomeRunSidebar : null,
	                    goOverview: returnToMetronomeOverview,
	                    setMode: setMetronomeEditorModeFromNav,
	                  }
                : {
                    edit: openEditWorkflowModal,
                    rename: openEditWorkflowModal,
                    duplicate: duplicateActiveWorkflow,
                    share: isActiveWorkflowTeamShared ? null : () => openMetronomeShareWorkflowModal(activeWorkflow),
                    delete: isActiveWorkflowTeamShared ? null : deleteActiveWorkflow,
                    publish: null,
                    run: openMetronomeRunSidebar,
                    goOverview: returnToMetronomeOverview,
                    setMode: setMetronomeEditorModeFromNav,
                  }
              : {
                  edit: null,
                  rename: null,
                  duplicate: null,
                  share: null,
                  delete: null,
                  publish: null,
                  run: null,
                  goOverview: returnToMetronomeOverview,
                  setMode: null,
                };
          }, [topNavActionsRef, activeWorkflow, isActiveWorkflowBuiltIn, isActiveWorkflowRunnableReadOnly, isActiveWorkflowTeamShared, openEditWorkflowModal, duplicateActiveWorkflow, deleteActiveWorkflow, openMetronomeShareWorkflowModal, openMetronomeRunSidebar, returnToMetronomeOverview, setMetronomeEditorModeFromNav]);

          useEffect(() => {
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(Boolean(isMetronomeRunSidebarOpen || isMetronomePublishMenuOpen));
            }
          }, [onNodeDetailOpenChange, isMetronomeRunSidebarOpen, isMetronomePublishMenuOpen]);

          useEffect(() => {
            if (typeof onTopNavStateChange !== "function") return;
            if (!activeWorkflow) {
              onTopNavStateChange(null);
              return;
            }
            onTopNavStateChange({
              mode: "editor",
              workflowId: activeWorkflow.id,
              runId: selectedMetronomeRunId || "",
              title: activeWorkflow.name || "Untitled Metronome",
              status: isActiveWorkflowTeamShared ? "shared" : isActiveWorkflowBuiltIn ? "default" : activeWorkflow.status === "active" ? "active" : "draft",
              readOnly: isActiveWorkflowBuiltIn,
              editorMode: metronomeEditorMode === "runs" ? "runs" : metronomeEditorMode === "code" ? "code" : "edit",
            });
          }, [onTopNavStateChange, activeWorkflow?.id, activeWorkflow?.name, activeWorkflow?.status, isActiveWorkflowBuiltIn, isActiveWorkflowTeamShared, metronomeEditorMode, selectedMetronomeRunId]);

          useEffect(() => () => {
            if (topNavActionsRef) {
              topNavActionsRef.current = { edit: null, rename: null, duplicate: null, share: null, delete: null, publish: null, run: null, goOverview: null, setMode: null };
            }
            if (typeof onTopNavStateChange === "function") {
              onTopNavStateChange(null);
            }
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(false);
            }
          }, []);

          const handleConnect = useCallback((params) => {
            if (isActiveWorkflowBuiltIn) return;
            const sourceId = String(params?.source || "").trim();
            const targetId = String(params?.target || "").trim();
            const sourceHandle = String(params?.sourceHandle || "").trim();
            const targetHandle = String(params?.targetHandle || "").trim();
            const sourceNode = nodes.find((node) => String(node?.id || "") === sourceId) || null;
            const targetNode = nodes.find((node) => String(node?.id || "") === targetId) || null;
            const sourceIsLoop = isMetronomeLoopNode(sourceNode);
            const targetIsLoop = isMetronomeLoopNode(targetNode);
            const targetIsInsideSourceLoop = sourceIsLoop && String(targetNode?.parentId || "") === sourceId;
            const sourceIsInsideTargetLoop = targetIsLoop && String(sourceNode?.parentId || "") === targetId;
            const nextParams = { ...params };
            if (targetIsInsideSourceLoop && sourceHandle === "loop-left") {
              nextParams.targetHandle = "node-input";
            }
	            if (sourceIsInsideTargetLoop && targetHandle === "loop-right") {
	              nextParams.sourceHandle = nextParams.sourceHandle || "node-output";
	            }
	            const nodeById = new Map(nodes.map((node) => [String(node?.id || ""), node]));
	            const nextEdges = repairMetronomeLoopBoundaryEdge({
	              ...nextParams,
	              id: "edge_" + sourceId + "_" + targetId + "_" + Date.now(),
	            }, nodeById, 0);
	            if (!nextEdges.length) {
	              return;
	            }
	            pushGraphHistory();
	            setEdges((current) => {
	              const withNextEdges = nextEdges.reduce((acc, edge) => (
	                addEdge({ ...edge, type: "metronomeOutput" }, acc)
	              ), current);
	              return normalizeMetronomeEdgesForNodes(withNextEdges, nodes);
	            });
	          }, [isActiveWorkflowBuiltIn, nodes, setEdges, pushGraphHistory]);

          const handleDragStart = useCallback((event, item) => {
            const paletteItem = item && typeof item === "object" ? item : { kind: String(item || "action") };
            event.dataTransfer.setData("application/metronome-node-kind", paletteItem.kind || "action");
            event.dataTransfer.setData("application/metronome-node-payload", JSON.stringify({
              kind: paletteItem.kind || "action",
              subtype: paletteItem.subtype || "",
              label: paletteItem.label || "",
              copy: paletteItem.copy || "",
            }));
            event.dataTransfer.effectAllowed = "move";
          }, []);

	          const handleCreateNode = useCallback((nextNode) => {
	            if (isActiveWorkflowBuiltIn) return;
	            if (!nextNode) return;
	            pushGraphHistory();
	            setNodes((current) => normalizeMetronomeNodeOrder([...current, nextNode]));
	            const nextKind = String(nextNode?.data?.kind || "").trim();
	            setSelectedNodeId(nextKind === "note" || nextKind === "end" ? "" : nextNode.id);
	          }, [isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const handleMetronomeNodeDragStop = useCallback((_event, node) => {
            if (isActiveWorkflowBuiltIn) return;
            const nodeId = String(node?.id || "").trim();
            if (!nodeId) return;
            let didChange = false;
            let nextNodesValue = null;
            setNodes((current) => {
              const result = reparentMetronomeNodeByDrop(current, nodeId);
              didChange = Boolean(result.changed);
              nextNodesValue = result.nodes;
              return result.changed ? result.nodes : current;
            });
            if (didChange) {
              pushGraphHistory();
            }
          }, [isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const updateSelectedNodeData = useCallback((patch) => {
            if (!selectedNodeId || isActiveWorkflowBuiltIn) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              const nextData = { ...(node.data || {}), ...patch };
              return { ...node, data: nextData };
            }));
          }, [selectedNodeId, isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const updateSelectedNodeConfig = useCallback((key, value) => {
            if (!selectedNodeId || isActiveWorkflowBuiltIn) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    [key]: value,
                  },
                },
              };
            }));
          }, [selectedNodeId, isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const updateSelectedNodeConfigPatch = useCallback((patch) => {
            if (!selectedNodeId || isActiveWorkflowBuiltIn) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    ...(patch || {}),
                  },
                },
              };
            }));
          }, [selectedNodeId, isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const deleteSelectedNode = useCallback(() => {
            const normalizedNodeId = String(selectedNodeId || "").trim();
            if (!normalizedNodeId || isActiveWorkflowBuiltIn) return;
            const nodeToDelete = nodes.find((node) => String(node?.id || "") === normalizedNodeId) || null;
            const isDeletingTrigger = String(nodeToDelete?.data?.kind || nodeToDelete?.kind || "").trim() === "trigger";
            if (isDeletingTrigger) {
              const triggerCount = nodes.filter((node) => String(node?.data?.kind || node?.kind || "").trim() === "trigger").length;
              if (triggerCount <= 1) return;
            }
            const nextNodes = normalizeMetronomeNodeOrder(
              nodes.filter((node) => String(node?.id || "") !== normalizedNodeId)
            );
            const nextEdges = normalizeMetronomeEdgesForNodes(
              edges.filter((edge) => (
                String(edge?.source || "") !== normalizedNodeId
                && String(edge?.target || "") !== normalizedNodeId
              )),
              nextNodes
            );
            pushGraphHistory();
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
          }, [selectedNodeId, isActiveWorkflowBuiltIn, nodes, edges, setNodes, setEdges, pushGraphHistory]);

          const handleMetronomeFunctionTestInvoke = useCallback(() => {
            if (isActiveWorkflowBuiltIn || !selectedNode || selectedNode.data?.kind !== "function") return;
            const nodeId = String(selectedNode.id || "").trim();
            const functionConfig = createDefaultMetronomeFunctionConfig(selectedNode.data?.config || {});
            if (functionConfig.functionMode !== "computer_agents_function") return;
            const functionId = String(functionConfig.functionId || "").trim();
            const payloadJson = functionConfig.payloadJson || "";
            setMetronomeFunctionInvokeState({
              nodeId,
              status: "loading",
              error: "",
              resultText: "",
            });
            void invokeMetronomeFunctionResourceApi(functionId, payloadJson)
              .then((result) => {
                setMetronomeFunctionInvokeState({
                  nodeId,
                  status: "success",
                  error: "",
                  resultText: JSON.stringify(result ?? null, null, 2),
                });
              })
              .catch((error) => {
                setMetronomeFunctionInvokeState({
                  nodeId,
                  status: "error",
                  error: error?.message || "Failed to invoke function.",
                  resultText: "",
                });
              });
          }, [isActiveWorkflowBuiltIn, selectedNode]);

          useEffect(() => {
            if (isActiveWorkflowBuiltIn || !selectedNodeId || selectedNode?.data?.kind !== "action") return;
            const currentConfig = selectedNode.data?.config && typeof selectedNode.data.config === "object"
              ? selectedNode.data.config
              : {};
            const patch = {};
            const hasFallbackAgent = currentConfig.agentId === METRONOME_FALLBACK_AGENTS[0].id && defaultMetronomeAgentOption?.id !== METRONOME_FALLBACK_AGENTS[0].id;
            if ((!currentConfig.agentId || hasFallbackAgent) && defaultMetronomeAgentOption?.id) {
              patch.agentId = defaultMetronomeAgentOption.id;
              patch.agentName = defaultMetronomeAgentOption.name || "Assistant";
            }
            const contextType = currentConfig.contextType === "project" ? "project" : "computer";
            const hasFallbackComputer = currentConfig.environmentId === METRONOME_FALLBACK_COMPUTERS[0].id && defaultMetronomeComputerOption?.id !== METRONOME_FALLBACK_COMPUTERS[0].id;
            if (contextType === "computer" && (!currentConfig.environmentId || hasFallbackComputer) && defaultMetronomeComputerOption?.id) {
              patch.contextType = "computer";
              patch.resource = "computer";
              patch.environmentId = defaultMetronomeComputerOption.id;
              patch.environmentName = defaultMetronomeComputerOption.name || "Default";
            }
            if (!Object.keys(patch).length) return;
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    ...patch,
                  },
                },
              };
            }));
          }, [isActiveWorkflowBuiltIn, selectedNodeId, selectedNode, defaultMetronomeAgentOption, defaultMetronomeComputerOption, setNodes]);
`;
