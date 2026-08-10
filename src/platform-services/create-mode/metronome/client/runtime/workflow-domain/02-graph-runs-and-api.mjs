export const METRONOME_WORKFLOW_DOMAIN_02_FRAGMENT = String.raw`            ...(isMetronomeWorkflowBuiltIn(source) && sourceId ? { copiedFromDefaultWorkflowId: sourceId, copied_from_default_workflow_id: sourceId } : {}),
          };
          return normalizeMetronomeWorkflow({
            ...source,
            id: "met_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
            name: String(options.name || ((source.name || "Untitled Metronome") + " copy")).trim(),
            status: "draft",
            triggerSummary: deriveMetronomeTriggerSummary(persistedNodes),
            lastRunAt: "",
            runsToday: 0,
            waitingApprovals: 0,
            projectId,
            projectName,
            ...(creator ? { creator } : {}),
            metadata,
            deployments: [],
            activeDeploymentId: "",
            activeDeploymentVersion: 0,
            publishedAt: "",
            nodes: persistedNodes,
            edges: persistedEdges,
            createdAt: now,
            updatedAt: now,
          });
        }

        function readMetronomeWorkflowsFromStorage() {
          try {
            const parsed = JSON.parse(localStorage.getItem(METRONOME_STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
          } catch {
            return [];
          }
        }

        function writeMetronomeWorkflowsToStorage(workflows) {
          try {
            localStorage.setItem(METRONOME_STORAGE_KEY, JSON.stringify(Array.isArray(workflows) ? workflows : []));
          } catch {}
        }

        function normalizeMetronomeNodes(nodes) {
          const normalizedNodes = (Array.isArray(nodes) ? nodes : [])
            .filter((node) => node && typeof node === "object")
            .map((node, index) => {
              const nodeData = node.data && typeof node.data === "object" ? node.data : {};
              if (nodeData.kind) {
                const normalizedKind = nodeData.kind === "approval" ? "end" : nodeData.kind;
                const normalizedNodeData = nodeData.kind === "approval"
                  ? {
                      ...nodeData,
                      kind: "end",
                      subtype: "complete",
                      label: "End",
                      description: "Finish the workflow.",
                      config: {},
                    }
                  : nodeData;
                return {
                  ...node,
                  type: node.type || "metronome",
                  style: normalizedKind === "loop"
                    ? normalizeMetronomeLoopNodeStyle(node.style)
                    : normalizedKind === "note"
                      ? normalizeMetronomeNoteNodeStyle(node.style)
                    : node.style && typeof node.style === "object"
                      ? node.style
                      : undefined,
                  position: node.position && typeof node.position === "object"
                    ? node.position
                    : { x: 120 + index * 260, y: 160 },
                  ...(node.parentId || node.parentNode ? { parentId: String(node.parentId || node.parentNode), extent: node.extent || "parent" } : {}),
                  data: {
                    ...normalizedNodeData,
                    config: normalizedNodeData.config && typeof normalizedNodeData.config === "object" ? normalizedNodeData.config : {},
                  },
                };
              }
              const rawKind = String(node.kind || "").trim() || "action";
              const kind = rawKind === "approval" ? "end" : rawKind;
              const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
              return createMetronomeNode(kind, node.position && typeof node.position === "object"
                ? node.position
                : { x: 120 + index * 260, y: 160 }, {
                id: String(node.id || "node_" + index),
                subtype: rawKind === "approval" ? "complete" : String(node.subtype || ""),
                label: rawKind === "approval" ? "End" : String(node.label || meta.label),
                description: rawKind === "approval" ? "Finish the workflow." : String(node.description || ""),
                config: rawKind === "approval" ? {} : (node.config && typeof node.config === "object" ? node.config : {}),
                style: node.style && typeof node.style === "object" ? node.style : undefined,
                parentId: node.parentId || node.parentNode || undefined,
                extent: node.extent || undefined,
              });
            })
            .map((node) => {
              if (node?.data?.kind === "loop") {
                return { ...node, style: normalizeMetronomeLoopNodeStyle(node.style) };
              }
              if (node?.data?.kind === "note") {
                return { ...node, style: normalizeMetronomeNoteNodeStyle(node.style) };
              }
              return node;
            });
          return normalizeMetronomeNodeOrder(normalizedNodes);
        }

        function normalizeMetronomeWorkflow(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const rawNodes = Array.isArray(workflow.nodes)
            ? workflow.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          const rawEdges = Array.isArray(workflow.edges)
            ? workflow.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : [];
          const projectId = readMetronomeWorkflowProjectId(workflow);
          const projectName = readMetronomeWorkflowProjectName(workflow);
          const metadata = buildMetronomeWorkflowProjectMetadata(workflow);
          const creator = normalizeMetronomeWorkflowCreator(workflow, metadata);
          const userId = String(
            workflow.userId
            || workflow.user_id
            || workflow.ownerUserId
            || workflow.owner_user_id
            || metadata.userId
            || metadata.user_id
            || metadata.ownerUserId
            || metadata.owner_user_id
            || creator?.userId
            || ""
          ).trim();
          const deployments = readMetronomeWorkflowDeployments(workflow);
          const selectedDeploymentFromMetadata = String(
            workflow.restoredFromDeploymentId
            || workflow.restored_from_deployment_id
            || metadata.restoredFromDeploymentId
            || metadata.restored_from_deployment_id
            || ""
          ).trim();
          const activeDeploymentFromMetadata = String(
            workflow.activeDeploymentId
            || workflow.active_deployment_id
            || metadata.activeDeploymentId
            || metadata.active_deployment_id
            || ""
          ).trim();
          const selectedDeployment = deployments.find((deployment) => deployment.id === selectedDeploymentFromMetadata)
            || deployments.find((deployment) => deployment.id === activeDeploymentFromMetadata)
            || deployments.find((deployment) => deployment.status === "active")
            || null;
          const activeDeployment = deployments.find((deployment) => deployment.id === activeDeploymentFromMetadata)
            || deployments.find((deployment) => deployment.status === "active")
            || null;
          const graphDeployment = selectedDeployment && (
            (Array.isArray(selectedDeployment.nodes) && selectedDeployment.nodes.length)
            || (Array.isArray(selectedDeployment.edges) && selectedDeployment.edges.length)
          )
            ? selectedDeployment
            : null;
          const graphRawNodes = graphDeployment && Array.isArray(graphDeployment.nodes) && graphDeployment.nodes.length
            ? graphDeployment.nodes
            : rawNodes;
          const graphRawEdges = graphDeployment && Array.isArray(graphDeployment.edges) && graphDeployment.edges.length
            ? graphDeployment.edges
            : rawEdges;
          const nodes = normalizeMetronomeNodes(graphRawNodes);
          const edges = normalizeMetronomeEdgesForNodes(graphRawEdges, nodes);
          const activeDeploymentId = activeDeployment?.id || activeDeploymentFromMetadata;
          const activeDeploymentVersion = normalizeMetronomeVersionNumber(
            activeDeployment?.version
            ?? metadata.activeDeploymentVersion
            ?? metadata.active_deployment_version,
            0
          );
          const publishedAt = String(
            workflow.publishedAt
            || workflow.published_at
            || metadata.publishedAt
            || metadata.published_at
            || activeDeployment?.publishedAt
            || ""
          ).trim();
          const wallpaperId = resolveMetronomeWorkflowWallpaperId({ ...workflow, metadata }, metadata.wallpaperId || metadata.workflowWallpaperId || "");
          return {
            id: String(workflow.id || ""),
            name: String(workflow.name || "Untitled Metronome"),
            description: String(workflow.description || ""),
            status: workflow.status === "active" ? "active" : workflow.status === "paused" ? "paused" : "draft",
            triggerSummary: String(workflow.triggerSummary || workflow.trigger_summary || deriveMetronomeTriggerSummary(nodes) || "Manual"),
            lastRunAt: workflow.lastRunAt || workflow.last_run_at || "",
            runsToday: Number(workflow.runsToday || workflow.runs_today || 0) || 0,
            waitingApprovals: Number(workflow.waitingApprovals || workflow.waiting_approvals || 0) || 0,
            userId,
            projectId,
            projectName,
            ...(creator ? { creator } : {}),
            ...(wallpaperId ? { wallpaperId, workflowWallpaperId: wallpaperId } : {}),
            metadata: {
              ...metadata,
              ...buildMetronomeWorkflowCreatorMetadata(creator),
              ...(userId ? { userId, user_id: userId, ownerUserId: userId, owner_user_id: userId } : {}),
              ...(wallpaperId ? { wallpaperId, workflowWallpaperId: wallpaperId } : {}),
              deployments,
              metronomeDeployments: deployments,
              ...(activeDeploymentId ? { activeDeploymentId, active_deployment_id: activeDeploymentId } : {}),
              ...(activeDeploymentId ? { activeDeploymentVersion, active_deployment_version: activeDeploymentVersion } : {}),
              ...(publishedAt ? { publishedAt, published_at: publishedAt } : {}),
            },
            deployments,
            activeDeploymentId,
            activeDeploymentVersion,
            publishedAt,
            nodes,
            edges,
            createdAt: workflow.createdAt || workflow.created_at || "",
            updatedAt: workflow.updatedAt || workflow.updated_at || "",
          };
        }

        function normalizeMetronomeEdges(edges) {
          return (Array.isArray(edges) ? edges : [])
            .filter((edge) => edge && typeof edge === "object")
            .map((edge, index) => {
              const {
                label,
                labelBgPadding,
                labelBgBorderRadius,
                labelBgStyle,
                labelStyle,
                markerEnd,
                markerStart,
                animated,
                ...rest
              } = edge;
              return {
                ...rest,
                id: String(rest.id || "edge_" + String(rest.source || "") + "_" + String(rest.target || "") + "_" + index).trim() || "edge_" + index,
                source: String(rest.source || rest.sourceId || rest.source_id || "").trim(),
                target: String(rest.target || rest.targetId || rest.target_id || "").trim(),
                type: "metronomeOutput",
              };
            })
            .filter((edge) => edge.source && edge.target);
        }

        function getMetronomeSourceHandleIdsForNode(node) {
          const kind = String(node?.data?.kind || "").trim();
          if (kind === "end" || kind === "note") return [];
          if (kind === "loop") return ["loop-left", "loop-right"];
          if (kind === "condition" || kind === "approval") {
            const conditions = kind === "approval"
              ? normalizeMetronomeApprovalBranches(node?.data?.config?.conditions)
              : normalizeMetronomeConditionBranches(node?.data?.config?.conditions, node?.data?.config?.conditionType || node?.data?.subtype);
            return conditions.map((branch) => String(branch?.id || "").trim()).filter(Boolean);
          }
          return ["node-output"];
        }

        function getMetronomeTargetHandleIdsForNode(node) {
          const kind = String(node?.data?.kind || "").trim();
          if (kind === "loop") return ["loop-left", "loop-right"];
          if (kind === "note") return [];
          return ["node-input"];
        }

	        function normalizeMetronomeEdgesForNodes(edges, nodes) {
	          const normalizedEdges = normalizeMetronomeEdges(edges);
	          const nodeById = new Map((Array.isArray(nodes) ? nodes : []).map((node) => [String(node?.id || ""), node]));
	          const seenEdges = new Set();
	          return normalizedEdges
	            .flatMap((edge, index) => repairMetronomeLoopBoundaryEdge(edge, nodeById, index))
	            .map((edge) => {
	              const sourceNode = nodeById.get(String(edge.source || ""));
	              const targetNode = nodeById.get(String(edge.target || ""));
              if (!sourceNode || !targetNode) return null;
              const sourceHandles = getMetronomeSourceHandleIdsForNode(sourceNode);
              const targetHandles = getMetronomeTargetHandleIdsForNode(targetNode);
              if (sourceHandles.length === 0 || targetHandles.length === 0) return null;
              const currentSourceHandle = String(edge.sourceHandle || "").trim();
              const currentTargetHandle = String(edge.targetHandle || "").trim();
              const sourceHandle = sourceHandles.includes(currentSourceHandle)
                ? currentSourceHandle
                : sourceHandles[0];
              const targetHandle = targetHandles.includes(currentTargetHandle)
                ? currentTargetHandle
                : targetHandles[0];
              return {
                ...edge,
                sourceHandle,
                targetHandle,
	                type: "metronomeOutput",
	              };
	            })
	            .filter((edge) => {
	              if (!edge) return false;
	              const key = [edge.source, edge.sourceHandle, edge.target, edge.targetHandle].map((value) => String(value || "")).join("::");
	              if (seenEdges.has(key)) return false;
	              seenEdges.add(key);
	              return true;
	            });
	        }

        function sanitizeMetronomeNodeForPersistence(node) {
          if (!node || typeof node !== "object") return node;
          const {
            selected,
            dragging,
            resizing,
            positionAbsolute,
            measured,
            width,
            height,
            ...rest
          } = node;
          return rest;
        }

        function sanitizeMetronomeEdgeForPersistence(edge) {
          if (!edge || typeof edge !== "object") return edge;
          const {
            selected,
            className,
            style,
            animated,
            markerEnd,
            markerStart,
            label,
            labelStyle,
            labelBgStyle,
            labelBgPadding,
            labelBgBorderRadius,
            ...rest
          } = edge;
          return rest;
        }

        function isMetronomeTransientGraphItemKey(key, itemType) {
          if (itemType === "node") {
            return key === "selected"
              || key === "dragging"
              || key === "resizing"
              || key === "positionAbsolute"
              || key === "measured"
              || key === "width"
              || key === "height";
          }
          return key === "selected"
            || key === "className"
            || key === "style"
            || key === "animated"
            || key === "markerEnd"
            || key === "markerStart"
            || key === "label"
            || key === "labelStyle"
            || key === "labelBgStyle"
            || key === "labelBgPadding"
            || key === "labelBgBorderRadius";
        }

        function hasMetronomePersistedGraphItemChanged(previousItem, nextItem, itemType) {
          if (previousItem === nextItem) return false;
          if (!previousItem || !nextItem) return true;
          const itemKeys = new Set([
            ...Object.keys(previousItem),
            ...Object.keys(nextItem),
          ]);
          for (const key of itemKeys) {
            if (isMetronomeTransientGraphItemKey(key, itemType)) continue;
            if (itemType === "node" && key === "position") {
              if (
                Number(previousItem.position?.x || 0) !== Number(nextItem.position?.x || 0)
                || Number(previousItem.position?.y || 0) !== Number(nextItem.position?.y || 0)
              ) {
                return true;
              }
              continue;
            }
            if (previousItem[key] !== nextItem[key]) return true;
          }
          return false;
        }

        function haveMetronomePersistedGraphItemsChanged(previousItems, nextItems, itemType) {
          if (previousItems === nextItems) return false;
          if (!Array.isArray(previousItems) || !Array.isArray(nextItems) || previousItems.length !== nextItems.length) {
            return true;
          }
          for (let index = 0; index < nextItems.length; index += 1) {
            if (hasMetronomePersistedGraphItemChanged(previousItems[index], nextItems[index], itemType)) {
              return true;
            }
          }
          return false;
        }

        function haveMetronomePersistedNodesChanged(previousNodes, nextNodes) {
          return haveMetronomePersistedGraphItemsChanged(previousNodes, nextNodes, "node");
        }

        function haveMetronomePersistedEdgesChanged(previousEdges, nextEdges) {
          return haveMetronomePersistedGraphItemsChanged(previousEdges, nextEdges, "edge");
        }

        function createMetronomePersistedNodes(nodes) {
          return normalizeMetronomeNodes((Array.isArray(nodes) ? nodes : []).map(sanitizeMetronomeNodeForPersistence));
        }

        function createMetronomePersistedEdges(edges) {
          return normalizeMetronomeEdges((Array.isArray(edges) ? edges : []).map(sanitizeMetronomeEdgeForPersistence));
        }

        function readMetronomeSelectedDeploymentId(workflow) {
          const source = workflow && typeof workflow === "object" ? workflow : {};
          const metadata = source.metadata && typeof source.metadata === "object" ? source.metadata : {};
          return String(
            metadata.restoredFromDeploymentId
            || metadata.restored_from_deployment_id
            || source.restoredFromDeploymentId
            || source.restored_from_deployment_id
            || source.activeDeploymentId
            || metadata.activeDeploymentId
            || metadata.active_deployment_id
            || ""
          ).trim();
        }

        function createMetronomeWorkflowWithVersionList(workflow, versions, preferredSelectedId = "") {
          const baseWorkflow = normalizeMetronomeWorkflow(workflow || {});
          const deployments = normalizeMetronomeDeployments(versions);
          const previousSelectedId = readMetronomeSelectedDeploymentId(baseWorkflow);
          const selectedDeployment = deployments.find((deployment) => deployment.id === String(preferredSelectedId || "").trim())
            || deployments.find((deployment) => deployment.id === previousSelectedId)
            || deployments.find((deployment) => deployment.status === "active")
            || deployments[0]
            || null;
          const activeDeployment = deployments.find((deployment) => deployment.status === "active")
            || deployments.find((deployment) => deployment.id === String(baseWorkflow.activeDeploymentId || baseWorkflow.metadata?.activeDeploymentId || "").trim())
            || null;
          const nextMetadata = {
            ...(baseWorkflow.metadata && typeof baseWorkflow.metadata === "object" ? baseWorkflow.metadata : {}),
            deployments,
            metronomeDeployments: deployments,
            activeDeploymentId: activeDeployment?.id || "",
            active_deployment_id: activeDeployment?.id || "",
            activeDeploymentVersion: activeDeployment?.version || 0,
            active_deployment_version: activeDeployment?.version || 0,
            restoredFromDeploymentId: selectedDeployment?.id || "",
            restored_from_deployment_id: selectedDeployment?.id || "",
            restoredFromDeploymentVersion: selectedDeployment?.version || 0,
            restored_from_deployment_version: selectedDeployment?.version || 0,
            ...(activeDeployment?.publishedAt ? { publishedAt: activeDeployment.publishedAt, published_at: activeDeployment.publishedAt } : {}),
          };
          const selectedNodes = selectedDeployment && Array.isArray(selectedDeployment.nodes) && selectedDeployment.nodes.length
            ? selectedDeployment.nodes
            : baseWorkflow.nodes;
          const selectedEdges = selectedDeployment && Array.isArray(selectedDeployment.edges) && selectedDeployment.edges.length
            ? selectedDeployment.edges
            : baseWorkflow.edges;
          return normalizeMetronomeWorkflow({
            ...baseWorkflow,
            deployments,
            activeDeploymentId: activeDeployment?.id || "",
            activeDeploymentVersion: activeDeployment?.version || 0,
            publishedAt: activeDeployment?.publishedAt || "",
            metadata: nextMetadata,
            nodes: selectedNodes,
            edges: selectedEdges,
          });
        }

        function deriveMetronomeTriggerSummary(nodes) {
          const triggerNode = Array.isArray(nodes)
            ? nodes.find((node) => node?.data?.kind === "trigger" || node?.kind === "trigger")
            : null;
          if (!triggerNode) return "Manual";
          const triggerData = triggerNode.data && typeof triggerNode.data === "object" ? triggerNode.data : triggerNode;
          const triggerConfig = triggerData?.config && typeof triggerData.config === "object" ? triggerData.config : {};
          const triggerType = String(triggerConfig.triggerType || triggerData?.subtype || "").trim();
          if (triggerType === "periodic") {
            return formatMetronomeScheduleSummary(triggerConfig);
          }
          if (triggerType === "email") {
            const emailConfig = buildDefaultMetronomeEmailTriggerConfig(null, triggerNode, triggerConfig);
            return "Email: " + (triggerConfig.emailAddress || buildMetronomeEmailAddress(emailConfig.emailLocalPart));
          }
          if (triggerType === "telegram") {
            const telegramConfig = buildDefaultMetronomeTelegramTriggerConfig(null, triggerNode, triggerConfig);
            return "Telegram: " + (triggerConfig.telegramCommand || telegramConfig.telegramCommand);
          }
          if (triggerType === "function") {
            const functionConfig = buildDefaultMetronomeFunctionTriggerConfig(null, triggerNode, triggerConfig);
            const endpoint = String(functionConfig.functionEndpointUrl || functionConfig.functionEndpointPath || functionConfig.endpointUrl || functionConfig.endpointPath || "").trim();
            return "Function: " + (endpoint || functionConfig.functionSlug || "Callable endpoint");
          }
          if (triggerType === "github") {
            const githubConfig = buildDefaultMetronomeGitHubTriggerConfig(triggerConfig);
            const eventOption = METRONOME_GITHUB_EVENT_OPTIONS.find((option) => option.id === githubConfig.githubEventType);
            const repository = String(triggerConfig.githubRepositoryContains || "").trim();
            return "GitHub: " + (eventOption?.label || "GitHub event") + (repository ? " · " + repository : "");
          }
          if (triggerType === "project_ticket") {
            const ticketConfig = buildDefaultMetronomeProjectTicketTriggerConfig(triggerConfig);
            const eventOption = METRONOME_PROJECT_TICKET_EVENT_OPTIONS.find((option) => option.id === ticketConfig.ticketEventType);
            const project = String(ticketConfig.ticketProjectName || ticketConfig.ticketProjectId || "").trim();
            if (ticketConfig.ticketEventType === "status_changed") {
              const fromLabel = METRONOME_PROJECT_TICKET_STATUS_OPTIONS.find((option) => option.id === ticketConfig.ticketFromStatus)?.label || "Any status";
              const toLabel = METRONOME_PROJECT_TICKET_STATUS_OPTIONS.find((option) => option.id === ticketConfig.ticketToStatus)?.label || "Any status";
              return "Ticket: " + fromLabel + " -> " + toLabel + (project ? " · " + project : "");
            }
            return "Ticket: " + (eventOption?.label || "Project ticket event") + (project ? " · " + project : "");
          }
          return triggerData?.label || getMetronomeSubtypeLabel("trigger", triggerData?.subtype) || "Trigger";
        }

        function createMetronomeApiPayload(workflow) {
          const metadata = buildMetronomeWorkflowProjectMetadata(workflow);
          const deployments = readMetronomeWorkflowDeployments(workflow);
          const activeDeploymentId = String(workflow?.activeDeploymentId || metadata.activeDeploymentId || metadata.active_deployment_id || deployments.find((deployment) => deployment.status === "active")?.id || "").trim();
          const activeDeployment = deployments.find((deployment) => deployment.id === activeDeploymentId) || null;
          const activeDeploymentVersion = normalizeMetronomeVersionNumber(
            workflow?.activeDeploymentVersion
            ?? metadata.activeDeploymentVersion
            ?? metadata.active_deployment_version
            ?? activeDeployment?.version,
            0
          );
          const publishedAt = String(workflow?.publishedAt || metadata.publishedAt || metadata.published_at || activeDeployment?.publishedAt || "").trim();
          const enrichedMetadata = {
            ...metadata,
            deployments,
            metronomeDeployments: deployments,
            ...(activeDeploymentId ? { activeDeploymentId, active_deployment_id: activeDeploymentId } : {}),
            ...(activeDeploymentId ? { activeDeploymentVersion, active_deployment_version: activeDeploymentVersion } : {}),
            ...(publishedAt ? { publishedAt, published_at: publishedAt } : {}),
          };
          return {
            name: workflow?.name || "Untitled Metronome",
            description: workflow?.description || "",
            status: workflow?.status || "draft",
            triggerSummary: workflow?.triggerSummary || deriveMetronomeTriggerSummary(workflow?.nodes || []),
            ...(metadata.projectId ? { projectId: metadata.projectId, project_id: metadata.projectId } : {}),
            ...(metadata.projectName ? { projectName: metadata.projectName, project_name: metadata.projectName } : {}),
            metadata: enrichedMetadata,
            definition: createMetronomeWorkflowDefinition(workflow, workflow?.nodes || [], workflow?.edges || []),
          };
        }

        function buildMetronomeApiHeaders(options = {}, extraHeaders = {}) {
          const headers = new Headers(options.requestHeaders || {});
          if (options.apiKey && !headers.has("X-API-Key")) {
            headers.set("X-API-Key", options.apiKey);
          }
          Object.entries(extraHeaders || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              headers.set(key, value);
            }
          });
          return headers;
        }

        function getMetronomeApiBaseUrl(options = {}) {
          return String(options.backendUrl || "/api/real").trim().replace(new RegExp("/+$"), "") || "/api/real";
        }

        async function fetchMetronomeWorkflowPageFromApi(projectId = "", options = {}) {
          const normalizedProjectId = String(projectId || "").trim();
          const requestTarget = new URL(getMetronomeApiBaseUrl(options) + "/metronomes", window.location.origin);
          requestTarget.searchParams.set("includeArchived", "false");
          const limit = Number.isFinite(Number(options.limit))
            ? Math.max(1, Math.floor(Number(options.limit)))
            : 0;
          const offset = Number.isFinite(Number(options.offset))
            ? Math.max(0, Math.floor(Number(options.offset)))
            : 0;
          if (limit) requestTarget.searchParams.set("limit", String(limit));
          if (offset) requestTarget.searchParams.set("offset", String(offset));
          if (normalizedProjectId) {
            requestTarget.searchParams.set("projectId", normalizedProjectId);
          }
          const response = await fetch(requestTarget.toString(), {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: buildMetronomeApiHeaders(options),
          });
          if (!response.ok) {
            throw new Error("Failed to load Metronomes");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.metronomes)
              ? data.metronomes
              : Array.isArray(data?.workflows)
                ? data.workflows
                : [];
          const items = rawItems.map(normalizeMetronomeWorkflow);
          const filteredItems = filterMetronomeWorkflowsByProject(items, normalizedProjectId);
          const responseHasMore = data?.hasMore
            ?? data?.pagination?.hasMore
            ?? data?.meta?.hasMore;
          const nextOffset = Number(
            data?.nextOffset
            ?? data?.pagination?.nextOffset
            ?? data?.meta?.nextOffset
          );
          return {
            items: filteredItems,
            hasMore: typeof responseHasMore === "boolean"
              ? responseHasMore
              : Boolean(limit && rawItems.length >= limit),
            nextOffset: Number.isFinite(nextOffset)
              ? Math.max(offset + rawItems.length, nextOffset)
              : offset + rawItems.length,
          };
        }

        async function fetchMetronomeWorkflowsFromApi(projectId = "", options = {}) {
          const page = await fetchMetronomeWorkflowPageFromApi(projectId, options);
          return page.items;
        }

        async function fetchMetronomeWorkflowFromApi(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) {
            throw new Error("Missing Metronome id");
          }
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId), {
            method: "GET",
            credentials: "same-origin",
          });
          const data = await readMetronomeApiJson(response, "Failed to load Metronome");
          const rawWorkflow = data?.data && typeof data.data === "object"
            ? data.data
            : data?.metronome && typeof data.metronome === "object"
              ? data.metronome
              : data?.workflow && typeof data.workflow === "object"
                ? data.workflow
                : data;
          return normalizeMetronomeWorkflow(rawWorkflow);
        }

        async function fetchMetronomeWorkflowWithGraphFromApi(workflowId, preferredSelectedVersionId = "") {
          const workflow = await fetchMetronomeWorkflowFromApi(workflowId);
          try {
            const versions = await fetchMetronomeVersionsApi(workflow.id || workflowId);
            if (Array.isArray(versions) && versions.length) {
              return createMetronomeWorkflowWithVersionList(workflow, versions, preferredSelectedVersionId);
            }
          } catch (error) {
            console.warn("[Metronome] Failed to hydrate workflow graph from versions", error);
          }
          return workflow;
        }

        async function readMetronomeApiJson(response, fallbackMessage) {
          const text = await response.text();
          let data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { message: text };
          }
          if (!response.ok) {
            throw createMetronomeApiError(fallbackMessage, response, data);
          }
          return data;
        }

        async function createMetronomeWorkflowApi(workflow) {
          const response = await fetch("/api/real/metronomes", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          const data = await readMetronomeApiJson(response, "Failed to create Metronome");
          return mergeMetronomeWorkflowApiResponse(workflow, data?.data || data);
        }

        function createMetronomeApiError(message, response, data) {
          const upstreamMessage = String(data?.message || data?.error || "").trim();
          const error = new Error(upstreamMessage ? String(message || "Metronome request failed.") + ": " + upstreamMessage : (message || "Metronome request failed."));
          error.status = Number(response?.status || 0) || 0;
          error.data = data || null;
          return error;
        }

        function getMetronomePublishErrorState(error) {
          const issues = Array.isArray(error?.data?.issues)
            ? error.data.issues
                .filter((issue) => issue && typeof issue === "object")
                .map((issue) => ({
                  code: String(issue.code || "validation_error"),
                  message: String(issue.message || "Resolve this workflow issue before publishing."),
                  nodeId: String(issue.nodeId || ""),
                  edgeId: String(issue.edgeId || ""),
                  severity: String(issue.severity || "error"),
                }))
            : [];
          const message = String(error?.data?.details || error?.data?.message || error?.data?.error || error?.message || "Failed to publish Metronome").trim();
          return {
            status: "error",
            message,
            issues,
          };
        }

        function normalizeMetronomeValidationIssues(value) {
          return Array.isArray(value)
            ? value
                .filter((issue) => issue && typeof issue === "object")
                .map((issue) => ({
                  code: String(issue.code || "validation_error"),
                  message: String(issue.message || "Resolve this workflow issue before publishing."),
                  nodeId: String(issue.nodeId || issue.node_id || ""),
                  edgeId: String(issue.edgeId || issue.edge_id || ""),
                  severity: String(issue.severity || "error"),
                }))
            : [];
        }

        function normalizeMetronomeValidationResult(value) {
          const source = value?.data && typeof value.data === "object" ? value.data : value && typeof value === "object" ? value : {};
          const issues = normalizeMetronomeValidationIssues(source.issues);
          return {
            ok: Boolean(source.ok) && !issues.length,
            mode: String(source.mode || "publish"),
            issues,
          };
        }

        async function validateMetronomeDefinitionApi(definition, mode = "publish") {
          const response = await fetch("/api/real/metronomes/validate", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode,
              definition: definition && typeof definition === "object" ? definition : { nodes: [], edges: [] },
            }),
          });
          const data = await readMetronomeApiJson(response, "Failed to validate Metronome workflow");
          return normalizeMetronomeValidationResult(data);
        }

        async function updateMetronomeWorkflowApi(workflow) {
          const workflowId = String(workflow?.id || "").trim();
          if (!workflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          const data = await readMetronomeApiJson(response, "Failed to save Metronome");
          return mergeMetronomeWorkflowApiResponse(workflow, data?.data || data);
        }

        function mergeMetronomeWorkflowApiResponse(sourceWorkflow, responseWorkflow) {
          const source = sourceWorkflow && typeof sourceWorkflow === "object" ? sourceWorkflow : {};
          const response = responseWorkflow && typeof responseWorkflow === "object" ? responseWorkflow : {};
          const sourceMetadata = source.metadata && typeof source.metadata === "object" ? source.metadata : {};
          const responseMetadata = response.metadata && typeof response.metadata === "object" ? response.metadata : {};
          return normalizeMetronomeWorkflow({
            ...source,
            ...response,
            projectId: response.projectId || response.project_id || source.projectId || source.project_id || sourceMetadata.projectId || sourceMetadata.project_id || "",
            projectName: response.projectName || response.project_name || source.projectName || source.project_name || sourceMetadata.projectName || sourceMetadata.project_name || "",
            metadata: {
              ...sourceMetadata,
              ...responseMetadata,
            },
          });
        }

        async function saveMetronomeWorkflowApi(workflow, options = {}) {
          const workflowId = String(workflow?.id || "").trim();
          if (!workflowId) return createMetronomeWorkflowApi(workflow);
          const createOnNotFound = options?.createOnNotFound !== false;
          try {
            return await updateMetronomeWorkflowApi(workflow);
          } catch (error) {
            if (error?.status === 404 && createOnNotFound) {
              return createMetronomeWorkflowApi(workflow);
            }
            throw error;
          }
        }

        async function publishMetronomeWorkflowApi(workflowId, active, workflow) {
          const body = { active: Boolean(active) };
          if (active && workflow && typeof workflow === "object") {
            const payload = createMetronomeApiPayload(workflow);
            body.definition = payload.definition;
            body.name = workflow.name || payload.name || "";
            body.label = workflow.name || payload.name || "";
            body.description = workflow.description || payload.description || "";
          }
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId) + "/publish", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await readMetronomeApiJson(response, "Failed to update Metronome status");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        const metronomeVersionSnapshotCache = new Map();
        const metronomeVersionHydrationRequests = new Map();

        function emitMetronomeVersionsLoaded(workflowId, versions) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId || typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
          window.dispatchEvent(new CustomEvent("playground:metronome-versions-loaded", {
            detail: {
              workflowId: normalizedWorkflowId,
              versions: Array.isArray(versions) ? versions : [],
            },
          }));
        }

        async function fetchMetronomeVersionsApi(workflowId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return [];
          const response = await fetch(getMetronomeApiBaseUrl(options) + "/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: buildMetronomeApiHeaders(options),
          });
          const data = await readMetronomeApiJson(response, "Failed to load workflow versions");
          const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          const versions = normalizeMetronomeDeployments(rawItems);
          metronomeVersionSnapshotCache.set(normalizedWorkflowId, versions);
          emitMetronomeVersionsLoaded(normalizedWorkflowId, versions);
          return versions;
        }

        function hydrateMetronomeVersionsApi(workflowId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return Promise.resolve([]);
          if (metronomeVersionSnapshotCache.has(normalizedWorkflowId)) {
            return Promise.resolve(metronomeVersionSnapshotCache.get(normalizedWorkflowId) || []);
          }
          const existingRequest = metronomeVersionHydrationRequests.get(normalizedWorkflowId);
          if (existingRequest) return existingRequest;
          const request = fetchMetronomeVersionsApi(normalizedWorkflowId, options)
            .finally(() => {
              if (metronomeVersionHydrationRequests.get(normalizedWorkflowId) === request) {
                metronomeVersionHydrationRequests.delete(normalizedWorkflowId);
              }
            });
          metronomeVersionHydrationRequests.set(normalizedWorkflowId, request);
          return request;
        }

        function createMetronomeVersionApiPayload(workflow, nodes, edges, details = {}, options = {}) {
          const persistedNodes = createMetronomePersistedNodes(nodes || workflow?.nodes || []);
          const persistedEdges = createMetronomePersistedEdges(edges || workflow?.edges || []);
          const includeDefinition = options.includeDefinition !== false;
          const description = String(details?.description || "").trim().slice(0, 240);
          return {
            description,
            ...(includeDefinition
              ? {
                  definition: createMetronomeWorkflowDefinition(workflow, persistedNodes, persistedEdges),
                }
              : {}),
          };
        }

        async function createMetronomeVersionApi(workflowId, workflow, nodes, edges, details = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeVersionApiPayload(workflow, nodes, edges, details)),
          });
          const data = await readMetronomeApiJson(response, "Failed to create workflow version");
          return normalizeMetronomeDeploymentVersion(data?.data || data);
        }

        async function updateMetronomeVersionApi(workflowId, versionId, workflow, nodes, edges, details = {}, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedWorkflowId || !normalizedVersionId) throw new Error("Missing workflow version");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions/" + encodeURIComponent(normalizedVersionId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeVersionApiPayload(workflow, nodes, edges, details, options)),
          });
          const data = await readMetronomeApiJson(response, "Failed to update workflow version");
          return normalizeMetronomeDeploymentVersion(data?.data || data);
        }

        async function deleteMetronomeVersionApi(workflowId, versionId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedWorkflowId || !normalizedVersionId) throw new Error("Missing workflow version");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions/" + encodeURIComponent(normalizedVersionId), {
            method: "DELETE",
            credentials: "same-origin",
          });
          await readMetronomeApiJson(response, "Failed to delete workflow version");
          return true;
        }

        async function publishMetronomeVersionApi(workflowId, versionId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedWorkflowId || !normalizedVersionId) throw new Error("Missing workflow version");
          const body = options && typeof options === "object" && !Array.isArray(options)
            ? options
            : {};
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/publish", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await readMetronomeApiJson(response, "Failed to publish workflow version");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        function normalizeMetronomeNodeSchemaRegistry(rawRegistry) {
          const registry = rawRegistry && typeof rawRegistry === "object" ? rawRegistry : {};
          const normalizeList = (value) => Array.isArray(value)
            ? value.map((item) => String(item || "").trim()).filter(Boolean)
            : [];
          return {
            version: Number(registry.version || 0) || 0,
            nodeKinds: normalizeList(registry.nodeKinds || registry.node_kinds),
            triggerTypes: normalizeList(registry.triggerTypes || registry.trigger_types),
            conditionTypes: normalizeList(registry.conditionTypes || registry.condition_types),
            loopTypes: normalizeList(registry.loopTypes || registry.loop_types),
            ticketOperations: normalizeList(registry.ticketOperations || registry.ticket_operations),
            resourceEventTypes: normalizeList(registry.resourceEventTypes || registry.resource_event_types),
            projectTicketEventTypes: normalizeList(registry.projectTicketEventTypes || registry.project_ticket_event_types),
          };
        }

        async function fetchMetronomeNodeSchemasApi() {
          const response = await fetch("/api/real/metronomes/node-schemas", {
            method: "GET",
            credentials: "same-origin",
          });
          const data = await readMetronomeApiJson(response, "Failed to load Metronome node schemas");
          return normalizeMetronomeNodeSchemaRegistry(data?.data || data);
        }

        async function deleteMetronomeWorkflowApi(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId), {
            method: "DELETE",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to delete Metronome");
          }
          return true;
        }

        function normalizeMetronomeServerKind(value) {
          return String(value || "").toLowerCase().replace(/[-\s]+/g, "_");
        }

        function getMetronomeServerKindCandidates(item) {
          if (!item || typeof item !== "object") return [];
          const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
          const config = item.config && typeof item.config === "object" ? item.config : {};
          const details = item.details && typeof item.details === "object" ? item.details : {};
          return [
            item.kind,
            item.type,
            item.serverKind,
            item.server_kind,
            item.resourceKind,
            item.resource_kind,
            item.resourceType,
            item.resource_type,
            item.category,
            item.subtype,
            item.slug,
            metadata.kind,
            metadata.serverKind,
            metadata.server_kind,
            metadata.resourceKind,
            metadata.resource_kind,
            metadata.resourceType,
            metadata.resource_type,
            metadata.type,
            metadata.category,
            metadata.subtype,
            metadata.runtime,
            config.kind,
            config.serverKind,
            config.server_kind,
            config.type,
            config.category,
            config.subtype,
            config.runtime,
            details.kind,
            details.serverKind,
            details.server_kind,
            details.type,
            details.category,
            details.subtype,
            details.runtime,
          ].map(normalizeMetronomeServerKind).filter(Boolean);
        }

        function isMetronomeDatabaseServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "database",
            "databases",
            "db",
            "sql",
            "sql_database",
            "document_database",
            "collection_database",
            "postgres",
            "postgresql",
            "postgres_database",
            "postgresql_database",
            "server_database",
            "database_server",
          ].includes(kind) || kind.endsWith("_database") || kind.endsWith("_databases");
        }

        function isMetronomeFunctionServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "function",
            "functions",
            "cloud_function",
            "cloud_functions",
            "server_function",
            "edge_function",
            "edge_functions",
            "node_function",
            "nodejs_function",
            "javascript_function",
            "typescript_function",
          ].includes(kind) || kind.endsWith("_function") || kind.endsWith("_functions");
        }

        function isMetronomeWebAppServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "web_app",
            "webapp",
            "website",
            "site",
            "frontend",
            "static_site",
            "hosted_app",
          ].includes(kind) || kind.endsWith("_web_app") || kind.endsWith("_website");
        }

        function isMetronomeAuthServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "auth",
            "authentication",
            "auth_module",
            "user_auth",
            "identity",
          ].includes(kind) || kind.endsWith("_auth");
        }

        function isMetronomeSecretsServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "secret",
            "secrets",
            "secret_store",
            "secrets_store",
            "secret_vault",
            "secrets_vault",
            "vault",
          ].includes(kind) || kind.endsWith("_secret") || kind.endsWith("_secrets") || kind.endsWith("_secret_vault") || kind.endsWith("_secrets_vault");
        }

        function decodeMetronomeCredentialPart(value) {
          const normalized = String(value || "").trim();
          if (!normalized) return "";
          try {
            return decodeURIComponent(normalized);
          } catch (_error) {
            return normalized;
          }
        }

        function encodeMetronomeCredentialPart(value) {
          return encodeURIComponent(String(value || "").trim());
        }

        function parseMetronomeSecretCredentialRef(value) {
          const normalized = String(value || "").trim();
          const parts = normalized.split(":");
          if (parts[0] !== "secrets" || parts.length < 3) {
            return { vaultId: "", secretId: "", legacyRef: normalized };
          }
          return {
            vaultId: decodeMetronomeCredentialPart(parts[1]),
            secretId: decodeMetronomeCredentialPart(parts.slice(2).join(":")),
            legacyRef: "",
          };
        }

        function buildMetronomeSecretCredentialRef(vaultId, secretId) {
          const normalizedVaultId = String(vaultId || "").trim();
          const normalizedSecretId = String(secretId || "").trim();
          if (!normalizedVaultId || !normalizedSecretId) {
            return "";
          }
          return "secrets:" + encodeMetronomeCredentialPart(normalizedVaultId) + ":" + encodeMetronomeCredentialPart(normalizedSecretId);
        }

        function isMetronomeFunctionResourceRecord(item, normalizedKind = "") {
          if (!item || typeof item !== "object") return false;
          if (isMetronomeFunctionServerKind(normalizedKind)) return true;
          const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
          const config = item.config && typeof item.config === "object" ? item.config : {};
          const details = item.details && typeof item.details === "object" ? item.details : {};
          const searchable = [
            item.id,
            item.name,
            item.title,
            item.label,
            item.slug,
            item.path,
            item.url,
            item.endpoint,
            item.runtime,
            metadata.name,
            metadata.title,
            metadata.slug,
            metadata.path,
            metadata.url,
            metadata.endpoint,
            metadata.runtime,
            config.name,
            config.title,
            config.slug,
            config.path,
            config.url,
            config.endpoint,
            config.runtime,
            details.name,
            details.title,
            details.slug,
            details.path,
            details.url,
            details.endpoint,
            details.runtime,
          ].map((value) => String(value || "").toLowerCase()).join(" ");
          return /\b(function|functions|edge function|cloud function|nodejs|node\.js|javascript|typescript)\b/.test(searchable)
            || String(item.id || "").startsWith("fn_");
        }

        async function fetchMetronomeServerResourcesApi() {
          const response = await fetch("/api/real/servers", {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load server resources");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.servers)
              ? data.data.servers
            : Array.isArray(data?.data?.items)
              ? data.data.items
            : Array.isArray(data?.data?.resources)
              ? data.data.resources
            : Array.isArray(data?.servers)
              ? data.servers
            : Array.isArray(data?.items)
              ? data.items
            : Array.isArray(data?.resources)
              ? data.resources
              : Array.isArray(data)
                ? data
                : [];
          return rawItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(item.id || item.serverId || item.server_id || "").trim();
              if (!id) return null;
              const name = String(item.name || item.title || item.label || id).trim();
              const kindCandidates = getMetronomeServerKindCandidates(item);
              const inferredFunctionKind = isMetronomeFunctionResourceRecord(item, kindCandidates[0]) ? "function" : "";
              const kind = kindCandidates.find(isMetronomeFunctionServerKind)
                || kindCandidates.find(isMetronomeDatabaseServerKind)
                || kindCandidates.find(isMetronomeWebAppServerKind)
                || kindCandidates.find(isMetronomeAuthServerKind)
                || kindCandidates.find(isMetronomeSecretsServerKind)
                || inferredFunctionKind
                || kindCandidates[0]
                || "";
              return { id, name: name || id, kind, raw: item };
            })
            .filter(Boolean);
        }

        async function fetchMetronomeSecretVaultSecretsApi(vaultId) {
          const normalizedVaultId = String(vaultId || "").trim();
          if (!normalizedVaultId) return [];
          const response = await fetch("/api/real/servers/" + encodeURIComponent(normalizedVaultId) + "/secrets", {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load secrets");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.secrets)
              ? data.secrets
              : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data)
                  ? data
                  : [];
          return rawItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(item.id || item.secretId || item.secret_id || "").trim();
              const name = String(item.name || item.label || id).trim();
              if (!id || !name) return null;
              return {
                id,
                name,
                description: String(item.description || "").trim(),
                maskedValue: String(item.maskedValue || item.masked_value || "").trim(),
              };
            })
            .filter(Boolean);
        }

        async function invokeMetronomeFunctionResourceApi(functionId, payloadJson) {
          const normalizedFunctionId = String(functionId || "").trim();
          if (!normalizedFunctionId) {
            throw new Error("Select a function before testing.");
          }
          const normalizedPayloadText = String(payloadJson || "").trim();
          let parsedPayload = {};
          if (normalizedPayloadText) {
            try {
              parsedPayload = JSON.parse(normalizedPayloadText);
            } catch (error) {
              throw new Error("Request payload must be valid JSON.");
            }
          }
          const response = await fetch("/api/real/servers/" + encodeURIComponent(normalizedFunctionId) + "/invoke", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: "POST",
              path: "/",
              body: parsedPayload,
            }),
          });
          const responseText = await response.text();
          let data = null;
          try {
            data = responseText ? JSON.parse(responseText) : null;
          } catch {
            data = { text: responseText };
          }
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to invoke function.");
          }
          return data;
        }

        async function testRunMetronomeWorkflowApi(workflowId, definition, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before running a test.");
          const triggerType = String(options?.triggerType || "").trim();
          const inputs = options?.inputs && typeof options.inputs === "object" ? options.inputs : {};
          const runInputs = {
            source: "manual_trigger_test",
            ...(triggerType ? { triggerType } : {}),
            ...inputs,
          };
          const executionPayload = createMetronomeExecutionPayload(
            { id: normalizedWorkflowId, name: definition?.name || "Metronome" },
            definition,
            runInputs,
            { triggerType }
          );
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/test-run", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(executionPayload),
          });
          if (!response.ok) {
            throw createMetronomeApiError("Test run is not available on this backend yet.", response);
          }
          const data = await response.json();
          return normalizeMetronomeRun(data?.data || data);
        }
`;
