export const METRONOME_CONTROLLER_01_FRAGMENT = String.raw`
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
`;
