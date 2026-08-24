import type { RunnerLog } from "../../../../types.js";

export interface MetronomeWorkflowMiniNode {
  id: string;
  kind: string;
  label: string;
}

export interface MetronomeWorkflowMiniEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface MetronomeWorkflowBranchMiniMap {
  condition: MetronomeWorkflowMiniNode;
  items: Array<{
    node: MetronomeWorkflowMiniNode;
    x: number;
    y: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }>;
  width: number;
  height: number;
  nodeWidth: number;
}

export function getMetronomeWorkflowCanvasContentWidth({
  clientWidth,
  paddingLeft = 0,
  paddingRight = 0,
}: {
  clientWidth: number;
  paddingLeft?: number;
  paddingRight?: number;
}): number {
  const normalizedClientWidth = Number.isFinite(clientWidth) ? Math.max(0, clientWidth) : 0;
  const normalizedPaddingLeft = Number.isFinite(paddingLeft) ? Math.max(0, paddingLeft) : 0;
  const normalizedPaddingRight = Number.isFinite(paddingRight) ? Math.max(0, paddingRight) : 0;
  return Math.max(0, normalizedClientWidth - normalizedPaddingLeft - normalizedPaddingRight);
}

function normalizeMetronomeWorkflowMiniNode(value: unknown): MetronomeWorkflowMiniNode | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = String(record.id || "").trim();
  if (!id) return null;
  const kind =
    String(record.kind || record.type || "action")
      .trim()
      .toLowerCase() || "action";
  const rawLabel = String(
    record.name || record.displayName || record.display_name || record.label || record.title || "",
  ).trim();
  const fallbackLabel =
    kind === "thread" || kind === "action"
      ? "Thread"
      : kind === "trigger"
        ? "Trigger"
        : kind === "condition"
          ? "Condition"
          : kind === "ticket"
            ? "Ticket"
            : kind === "imagine"
              ? "Imagine"
              : kind === "function"
                ? "Function"
                : kind === "database"
                  ? "Database"
                  : kind === "metronome"
                    ? "Metronome"
                    : kind === "loop"
                      ? "Loop"
                      : kind === "end"
                        ? "End"
                        : kind === "note"
                          ? "Note"
                          : "Node";
  const label =
    (kind === "thread" || kind === "action") && /^start\s+(agent\s+)?thread$/i.test(rawLabel)
      ? "Thread"
      : rawLabel || fallbackLabel;
  return { id, kind, label };
}

function normalizeMetronomeWorkflowMiniEdge(value: unknown): MetronomeWorkflowMiniEdge | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = String(record.id || "").trim();
  const source = String(record.source || "").trim();
  const target = String(record.target || "").trim();
  if (!source || !target) return null;
  return {
    id: id || `${source}->${target}`,
    source,
    target,
    sourceHandle: String(record.sourceHandle || record.source_handle || "").trim() || undefined,
    targetHandle: String(record.targetHandle || record.target_handle || "").trim() || undefined,
  };
}

export function getMetronomeWorkflowRecord(log: RunnerLog): Record<string, unknown> | null {
  const value = log.metadata?.metronomeWorkflow;
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function normalizeMetronomeWorkflowMiniMap(workflow: Record<string, unknown> | null): {
  nodes: MetronomeWorkflowMiniNode[];
  edges: MetronomeWorkflowMiniEdge[];
  startNodeId: string | null;
} {
  const map =
    workflow?.workflowMap && typeof workflow.workflowMap === "object"
      ? (workflow.workflowMap as Record<string, unknown>)
      : null;
  const nodes = Array.isArray(map?.nodes)
    ? map.nodes
        .map(normalizeMetronomeWorkflowMiniNode)
        .filter((node): node is MetronomeWorkflowMiniNode => Boolean(node))
    : [];
  const validNodeIds = new Set(nodes.map((node) => node.id));
  const edges = Array.isArray(map?.edges)
    ? map.edges
        .map(normalizeMetronomeWorkflowMiniEdge)
        .filter(
          (edge): edge is MetronomeWorkflowMiniEdge =>
            edge !== null && validNodeIds.has(edge.source) && validNodeIds.has(edge.target),
        )
    : [];
  const startNodeId =
    String(map?.startNodeId || "").trim() ||
    nodes.find((node) => node.kind === "trigger")?.id ||
    nodes[0]?.id ||
    null;
  return { nodes, edges, startNodeId };
}

export function getMetronomeWorkflowStepNodeIds(
  workflow: Record<string, unknown> | null,
): string[] {
  const steps = Array.isArray(workflow?.steps) ? workflow.steps : [];
  const ids: string[] = [];
  for (const step of steps) {
    if (!step || typeof step !== "object") continue;
    const id = String((step as Record<string, unknown>).nodeId || "").trim();
    if (id && ids[ids.length - 1] !== id) ids.push(id);
  }
  return ids;
}

export function buildMetronomeWorkflowLinearPath({
  nodes,
  edges,
  startNodeId,
  stepNodeIds,
}: {
  nodes: MetronomeWorkflowMiniNode[];
  edges: MetronomeWorkflowMiniEdge[];
  startNodeId: string | null;
  stepNodeIds: string[];
}): string[] {
  const validNodeIds = new Set(nodes.map((node) => node.id));
  const path = stepNodeIds.filter(
    (id, index, values) => validNodeIds.has(id) && values.indexOf(id) === index,
  );
  const outgoingBySource = new Map<string, MetronomeWorkflowMiniEdge[]>();
  for (const edge of edges) {
    const list = outgoingBySource.get(edge.source) || [];
    list.push(edge);
    outgoingBySource.set(edge.source, list);
  }
  let cursor = path[path.length - 1] || startNodeId;
  const visited = new Set(path);
  while (cursor && path.length < 24) {
    if (!path.includes(cursor) && validNodeIds.has(cursor)) {
      path.push(cursor);
      visited.add(cursor);
    }
    const next = (outgoingBySource.get(cursor) || []).find((edge) => !visited.has(edge.target));
    if (!next) break;
    cursor = next.target;
  }
  if (!path.length && nodes[0]) path.push(nodes[0].id);
  return path;
}

export function buildMetronomeWorkflowPathAroundActive({
  activeNodeId,
  edges,
}: {
  activeNodeId: string;
  edges: MetronomeWorkflowMiniEdge[];
}): string[] {
  const incomingByTarget = new Map<string, MetronomeWorkflowMiniEdge[]>();
  const outgoingBySource = new Map<string, MetronomeWorkflowMiniEdge[]>();
  for (const edge of edges) {
    incomingByTarget.set(edge.target, [...(incomingByTarget.get(edge.target) || []), edge]);
    outgoingBySource.set(edge.source, [...(outgoingBySource.get(edge.source) || []), edge]);
  }

  const before: string[] = [];
  const beforeVisited = new Set([activeNodeId]);
  let cursor = activeNodeId;
  while (before.length < 2) {
    const previous = (incomingByTarget.get(cursor) || []).find(
      (edge) => !beforeVisited.has(edge.source),
    );
    if (!previous) break;
    before.unshift(previous.source);
    beforeVisited.add(previous.source);
    cursor = previous.source;
  }

  const after: string[] = [];
  const afterVisited = new Set([activeNodeId, ...before]);
  cursor = activeNodeId;
  while (after.length < 2) {
    const next = (outgoingBySource.get(cursor) || []).find(
      (edge) => !afterVisited.has(edge.target),
    );
    if (!next) break;
    after.push(next.target);
    afterVisited.add(next.target);
    cursor = next.target;
  }

  return [...before, activeNodeId, ...after];
}

function getIncomingEdges(edges: MetronomeWorkflowMiniEdge[]) {
  const incomingByTarget = new Map<string, MetronomeWorkflowMiniEdge[]>();
  for (const edge of edges) {
    incomingByTarget.set(edge.target, [...(incomingByTarget.get(edge.target) || []), edge]);
  }
  return incomingByTarget;
}

function getOutgoingEdges(edges: MetronomeWorkflowMiniEdge[]) {
  const outgoingBySource = new Map<string, MetronomeWorkflowMiniEdge[]>();
  for (const edge of edges) {
    outgoingBySource.set(edge.source, [...(outgoingBySource.get(edge.source) || []), edge]);
  }
  return outgoingBySource;
}

export function buildMetronomeWorkflowBranchMiniMap({
  activeNodeId,
  path,
  nodes,
  edges,
  availableWidth,
}: {
  activeNodeId: string | null;
  path: string[];
  nodes: MetronomeWorkflowMiniNode[];
  edges: MetronomeWorkflowMiniEdge[];
  availableWidth?: number;
}): MetronomeWorkflowBranchMiniMap | null {
  if (!activeNodeId) return null;
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const outgoingBySource = getOutgoingEdges(edges);
  const incomingByTarget = getIncomingEdges(edges);
  const activeIndex = Math.max(0, path.indexOf(activeNodeId));
  const nearbyIds = new Set(path.slice(Math.max(0, activeIndex - 2), activeIndex + 3));
  const nearbyConditions = Array.from(nearbyIds)
    .map((id) => nodeById.get(id) || null)
    .filter((node): node is MetronomeWorkflowMiniNode =>
      Boolean(
        node && node.kind === "condition" && (outgoingBySource.get(node.id) || []).length > 1,
      ),
    );
  if (!nearbyConditions.length) return null;

  const pathIndexById = new Map(path.map((id, index) => [id, index]));
  const condition = nearbyConditions
    .slice()
    .sort(
      (a, b) =>
        Math.abs((pathIndexById.get(a.id) ?? activeIndex) - activeIndex) -
        Math.abs((pathIndexById.get(b.id) ?? activeIndex) - activeIndex),
    )[0];
  if (!condition) return null;
  const outgoing = (outgoingBySource.get(condition.id) || []).filter((edge) =>
    nodeById.has(edge.target),
  );
  if (outgoing.length < 2) return null;

  const branchNodeIds = new Set(outgoing.map((edge) => edge.target));
  const activeBranchIndex = Math.max(
    0,
    outgoing.findIndex((edge) => {
      if (edge.target === activeNodeId) return true;
      const nextEdges = outgoingBySource.get(edge.target) || [];
      return nextEdges.some((nextEdge) => nextEdge.target === activeNodeId);
    }),
  );
  const sortedOutgoing = outgoing
    .map((edge, index) => ({ edge, index }))
    .sort((a, b) => {
      if (a.index === activeBranchIndex) return 1;
      if (b.index === activeBranchIndex) return -1;
      return a.index - b.index;
    })
    .map((entry) => entry.edge);

  const incoming = (incomingByTarget.get(condition.id) || []).filter(
    (edge) => nodeById.has(edge.source) && !branchNodeIds.has(edge.source),
  );
  const prefixId =
    incoming.find((edge) => path.includes(edge.source))?.source || incoming[0]?.source || null;
  const nodeHeight = 40;
  const gapX = 24;
  const rowGap = 64;
  const paddingX = 0;
  const paddingY = 2;
  const prefixColumnCount = prefixId ? 1 : 0;
  const conditionColumn = prefixColumnCount;
  const branchColumn = conditionColumn + 1;
  const nextColumn = branchColumn + 1;
  const branchRows: Array<{
    edge: MetronomeWorkflowMiniEdge;
    branchNode: MetronomeWorkflowMiniNode;
    nextNode?: MetronomeWorkflowMiniNode;
  }> = [];
  for (const edge of sortedOutgoing) {
    const branchNode = nodeById.get(edge.target);
    if (!branchNode) continue;
    const nextNode = (outgoingBySource.get(edge.target) || [])
      .map((nextEdge) => nodeById.get(nextEdge.target) || null)
      .find((node): node is MetronomeWorkflowMiniNode => Boolean(node));
    branchRows.push({ edge, branchNode, nextNode });
  }
  if (branchRows.length < 2) return null;

  const hasNextColumn = branchRows.some((row) => Boolean(row.nextNode));
  const expectedColumnCount = (hasNextColumn ? nextColumn : branchColumn) + 1;
  const normalizedAvailableWidth = Number.isFinite(Number(availableWidth))
    ? Math.max(0, Number(availableWidth))
    : 0;
  const fluidNodeWidth = normalizedAvailableWidth > 0
    ? (normalizedAvailableWidth - Math.max(0, expectedColumnCount - 1) * gapX) / expectedColumnCount
    : 132;
  const nodeWidth = Math.max(96, Math.min(220, fluidNodeWidth));

  const graphHeight = paddingY * 2 + nodeHeight + (branchRows.length - 1) * (nodeHeight + rowGap);
  const conditionY = paddingY + ((branchRows.length - 1) * (nodeHeight + rowGap)) / 2;
  const itemsById = new Map<string, { node: MetronomeWorkflowMiniNode; x: number; y: number }>();
  const putItem = (
    node: MetronomeWorkflowMiniNode | null | undefined,
    column: number,
    y: number,
  ) => {
    if (!node) return;
    const x = paddingX + column * (nodeWidth + gapX);
    const existing = itemsById.get(node.id);
    if (existing) {
      // A convergence node can be reached directly by one branch and after an
      // action by another. Keep it in the deepest encountered column so every
      // rendered edge continues from left to right.
      if (x > existing.x) existing.x = x;
      return;
    }
    itemsById.set(node.id, {
      node,
      x,
      y,
    });
  };

  putItem(prefixId ? nodeById.get(prefixId) : null, 0, conditionY);
  putItem(condition, conditionColumn, conditionY);
  branchRows.forEach((row, rowIndex) => {
    const y = paddingY + rowIndex * (nodeHeight + rowGap);
    putItem(row.branchNode, branchColumn, y);
    putItem(row.nextNode, nextColumn, y);
  });

  const links: MetronomeWorkflowBranchMiniMap["links"] = [];
  const addLink = (sourceId?: string | null, targetId?: string | null) => {
    if (!sourceId || !targetId) return;
    const source = itemsById.get(sourceId);
    const target = itemsById.get(targetId);
    if (!source || !target) return;
    links.push({
      source: sourceId,
      target: targetId,
      sourceX: source.x + nodeWidth,
      sourceY: source.y + nodeHeight / 2,
      targetX: target.x,
      targetY: target.y + nodeHeight / 2,
    });
  };

  if (prefixId) addLink(prefixId, condition.id);
  branchRows.forEach((row) => {
    addLink(condition.id, row.branchNode.id);
    if (row.nextNode) addLink(row.branchNode.id, row.nextNode.id);
  });

  const usedColumns = Math.max(
    1,
    ...Array.from(itemsById.values()).map((item) => Math.floor(item.x / (nodeWidth + gapX)) + 1),
  );
  return {
    condition,
    items: Array.from(itemsById.values()),
    links,
    width: paddingX * 2 + usedColumns * nodeWidth + Math.max(0, usedColumns - 1) * gapX,
    height: graphHeight,
    nodeWidth,
  };
}
