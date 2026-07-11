import type {
  RunnerMetronomeRun,
  RunnerMetronomeWorkflowNode,
} from "../../types.js";
import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadEvent,
  RunnerThreadPermissionRing,
  RunnerThreadRun,
  RunnerThreadRunKind,
  RunnerThreadRunStatus,
} from "../types.js";

/** A transport-tolerant workflow timeline row returned by Metronome runtimes. */
export interface RunnerMetronomeTimelineStep {
  id?: string;
  stepId?: string;
  sequence?: number;
  index?: number;
  nodeId?: string;
  nodeType?: string;
  kind?: string;
  label?: string;
  title?: string;
  summary?: string;
  status?: string;
  input?: unknown;
  output?: unknown;
  error?: unknown;
  childThreadId?: string;
  childRunId?: string;
  permissionRing?: number | string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/**
 * A worker thread created by a workflow node. It is linked into the parent
 * workflow run; it is never converted into a synthetic replacement thread.
 */
export interface RunnerMetronomeChildThreadReference {
  threadId: string;
  runId?: string | null;
  nodeId?: string | null;
  stepId?: string | null;
  sourceMessageId?: string | null;
  title?: string | null;
  summary?: string | null;
  status?: string | null;
  runKind?: RunnerThreadRunKind | null;
  actorParticipantId?: string | null;
  createdAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerMetronomeThreadAdapterInput {
  /** Persistent collaboration thread that owns the workflow occurrence. */
  threadId: string;
  run: RunnerMetronomeRun;
  workflowId?: string | null;
  workflowName?: string | null;
  workflowVersion?: string | number | null;
  nodes?: RunnerMetronomeWorkflowNode[];
  timeline?: RunnerMetronomeTimelineStep[];
  childThreads?: RunnerMetronomeChildThreadReference[];
  sourceThreadId?: string | null;
  sourceMessageId?: string | null;
  scheduleId?: string | null;
  scheduleOccurrenceId?: string | null;
  actorParticipantId?: string | null;
  producerId?: string | null;
  sequenceStart?: number;
  now?: string;
  metadata?: Record<string, unknown> | null;
}

export type RunnerMetronomeThreadProjectionItem =
  | RunnerThreadRun
  | RunnerThreadAction
  | RunnerThreadActivityGroup
  | RunnerThreadEvent;

export interface RunnerMetronomeThreadAdapterResult {
  threadId: string;
  parentRun: RunnerThreadRun;
  childRuns: RunnerThreadRun[];
  actions: RunnerThreadAction[];
  activityGroups: RunnerThreadActivityGroup[];
  events: RunnerThreadEvent[];
  items: RunnerMetronomeThreadProjectionItem[];
  latestSequence: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function readableError(value: unknown): string {
  if (typeof value === "string") return value.trim();
  const record = asRecord(value);
  return firstString(record, ["message", "error", "detail"]);
}

function stableSegment(value: unknown): string {
  return encodeURIComponent(String(value ?? "").trim() || "unknown");
}

function stableId(prefix: string, ...parts: unknown[]): string {
  return [prefix, ...parts.map(stableSegment)].join(":");
}

function prettify(value: unknown, fallback: string): string {
  const normalized = String(value ?? "").trim().replace(/[_-]+/g, " ");
  if (!normalized) return fallback;
  return normalized.slice(0, 1).toUpperCase() + normalized.slice(1);
}

function readPermissionRing(...values: unknown[]): RunnerThreadPermissionRing | null {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  }
  return null;
}

function isActiveStatus(status: string): boolean {
  return ["queued", "pending", "running", "in_progress", "executing", "retrying"].includes(status);
}

function isWaitingStatus(status: string): boolean {
  return ["waiting", "waiting_permission", "requires_action", "awaiting_approval", "approval_required", "paused", "parked"].includes(status);
}

function isFailedStatus(status: string): boolean {
  return ["failed", "error", "timed_out", "timeout"].includes(status);
}

function isCancelledStatus(status: string): boolean {
  return ["cancelled", "canceled", "aborted", "stopped"].includes(status);
}

export function normalizeRunnerMetronomeRunStatus(value: unknown): RunnerThreadRunStatus {
  const status = String(value ?? "").trim().toLowerCase();
  if (!status) return "pending";
  if (["queued", "pending"].includes(status)) return status;
  if (["running", "in_progress", "executing", "retrying"].includes(status)) return "running";
  if (["paused", "parked"].includes(status)) return "parked";
  if (status === "waiting_permission") return "waiting_permission";
  if (["waiting", "awaiting_approval", "approval_required"].includes(status)) return "waiting";
  if (status === "requires_action") return "requires_action";
  if (["completed", "complete", "succeeded", "success", "done"].includes(status)) return "completed";
  if (isFailedStatus(status)) return "failed";
  if (isCancelledStatus(status)) return "cancelled";
  return status;
}

function lifecycleEventType(status: RunnerThreadRunStatus, terminal = false): string {
  if (terminal || status === "completed" || status === "failed" || status === "cancelled") {
    return status === "completed"
      ? "workflow.run.completed"
      : status === "cancelled"
        ? "workflow.run.cancelled"
        : "workflow.run.failed";
  }
  if (status === "queued" || status === "pending") return "workflow.run.queued";
  if (status === "parked" || status === "waiting" || status === "waiting_permission" || status === "requires_action") return "workflow.run.waiting";
  return "workflow.run.started";
}

function initialLifecycleEventType(status: RunnerThreadRunStatus): string {
  if (status === "queued" || status === "pending") return "workflow.run.queued";
  if (status === "parked" || status === "waiting" || status === "waiting_permission" || status === "requires_action") return "workflow.run.waiting";
  return "workflow.run.started";
}

function extractTimeline(run: RunnerMetronomeRun, explicit?: RunnerMetronomeTimelineStep[]): RunnerMetronomeTimelineStep[] {
  if (Array.isArray(explicit)) return explicit;
  const runRecord = asRecord(run);
  const output = asRecord(runRecord.output);
  const rows = asArray(output.steps).length ? asArray(output.steps) : asArray(runRecord.steps);
  return rows.map((row) => asRecord(row) as RunnerMetronomeTimelineStep);
}

function extractNodes(run: RunnerMetronomeRun, explicit?: RunnerMetronomeWorkflowNode[]): RunnerMetronomeWorkflowNode[] {
  if (Array.isArray(explicit)) return explicit;
  const runRecord = asRecord(run);
  const definition = asRecord(runRecord.definition);
  const rows = asArray(definition.nodes).length ? asArray(definition.nodes) : asArray(runRecord.nodes);
  return rows.map((row) => asRecord(row) as RunnerMetronomeWorkflowNode).filter((node) => Boolean(node.id));
}

function normalizeChildReference(value: unknown): RunnerMetronomeChildThreadReference | null {
  const record = asRecord(value);
  const nestedThread = asRecord(record.thread || record.threadRecord || record.thread_record);
  const threadId = firstString(record, ["threadId", "thread_id", "id"])
    || firstString(nestedThread, ["threadId", "thread_id", "id"]);
  if (!threadId) return null;
  const metadata = { ...asRecord(nestedThread.metadata), ...asRecord(record.metadata) };
  return {
    threadId,
    runId: firstString(record, ["runId", "run_id", "workerRunId", "worker_run_id"]) || null,
    nodeId: firstString(record, ["nodeId", "node_id"]) || firstString(metadata, ["nodeId", "node_id"]) || null,
    stepId: firstString(record, ["stepId", "step_id"]) || null,
    sourceMessageId: firstString(record, ["sourceMessageId", "source_message_id"]) || null,
    title: firstString(record, ["title", "nodeName", "node_name", "label"])
      || firstString(nestedThread, ["title", "name"])
      || null,
    summary: firstString(record, ["summary", "message"])
      || firstString(nestedThread, ["summary", "message"])
      || null,
    status: firstString(record, ["status"]) || firstString(nestedThread, ["status"]) || null,
    runKind: (firstString(record, ["runKind", "run_kind"]) || "worker") as RunnerThreadRunKind,
    actorParticipantId: firstString(record, ["actorParticipantId", "actor_participant_id"]) || null,
    createdAt: firstString(record, ["createdAt", "created_at"]) || firstString(nestedThread, ["createdAt", "created_at"]) || null,
    startedAt: firstString(record, ["startedAt", "started_at"]) || firstString(nestedThread, ["startedAt", "started_at"]) || null,
    completedAt: firstString(record, ["completedAt", "completed_at"]) || firstString(nestedThread, ["completedAt", "completed_at"]) || null,
    updatedAt: firstString(record, ["updatedAt", "updated_at"]) || firstString(nestedThread, ["updatedAt", "updated_at"]) || null,
    metadata,
  };
}

function extractChildReferences(
  run: RunnerMetronomeRun,
  timeline: RunnerMetronomeTimelineStep[],
  explicit?: RunnerMetronomeChildThreadReference[],
): RunnerMetronomeChildThreadReference[] {
  const candidates: unknown[] = Array.isArray(explicit) ? [...explicit] : [];
  if (!explicit) {
    const output = asRecord(asRecord(run).output);
    candidates.push(...asArray(output.threads));
  }
  for (const step of timeline) {
    const stepRecord = asRecord(step);
    const output = asRecord(stepRecord.output);
    const nested = output.thread || output.threadRecord || output.thread_record;
    if (nested) {
      candidates.push({
        ...asRecord(nested),
        thread: nested,
        nodeId: firstString(stepRecord, ["nodeId", "node_id"]),
        stepId: firstString(stepRecord, ["id", "stepId", "step_id"]),
        runId: firstString(stepRecord, ["childRunId", "child_run_id"]),
      });
    } else {
      const childThreadId = firstString(stepRecord, ["childThreadId", "child_thread_id"])
        || firstString(output, ["threadId", "thread_id"]);
      if (childThreadId) {
        candidates.push({
          threadId: childThreadId,
          nodeId: firstString(stepRecord, ["nodeId", "node_id"]),
          stepId: firstString(stepRecord, ["id", "stepId", "step_id"]),
          runId: firstString(stepRecord, ["childRunId", "child_run_id"]),
        });
      }
    }
  }

  const result: RunnerMetronomeChildThreadReference[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const normalized = normalizeChildReference(candidate);
    if (!normalized) continue;
    const key = [normalized.threadId, normalized.runId || "", normalized.stepId || "", normalized.nodeId || ""].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

function findChildForStep(
  children: RunnerMetronomeChildThreadReference[],
  used: Set<number>,
  stepId: string,
  nodeId: string,
): { child: RunnerMetronomeChildThreadReference; index: number } | null {
  const exactIndex = children.findIndex((child, index) => !used.has(index) && child.stepId === stepId);
  const nodeIndex = exactIndex >= 0
    ? exactIndex
    : children.findIndex((child, index) => !used.has(index) && Boolean(nodeId) && child.nodeId === nodeId);
  if (nodeIndex < 0) return null;
  return { child: children[nodeIndex], index: nodeIndex };
}

/**
 * Projects one Metronome occurrence into the same run/group/event primitives
 * used by normal threads. The source trigger remains linked through `origin`;
 * child execution threads are references, not replacement/synthetic threads.
 */
export function adaptMetronomeRunToThreadItems(
  input: RunnerMetronomeThreadAdapterInput,
): RunnerMetronomeThreadAdapterResult {
  const runRecord = asRecord(input.run);
  const runId = firstString(runRecord, ["id", "runId", "run_id"]);
  if (!runId) throw new Error("Metronome thread adapter requires run.id.");
  const workflowId = String(input.workflowId || input.run.metronomeId || firstString(runRecord, ["workflowId", "workflow_id"]) || "").trim();
  const workflowName = String(input.workflowName || firstString(runRecord, ["workflowName", "workflow_name", "metronomeName", "metronome_name"]) || "Metronome").trim();
  const triggerType = String(input.run.triggerType || firstString(runRecord, ["trigger_type"]) || "metronome").trim();
  const runInput = asRecord(runRecord.input || runRecord.inputs);
  const sourceThreadId = String(input.sourceThreadId || firstString(runInput, ["sourceThreadId", "source_thread_id", "threadId", "thread_id"]) || "").trim() || null;
  const sourceMessageId = String(input.sourceMessageId || firstString(runInput, ["sourceMessageId", "source_message_id", "messageId", "message_id"]) || "").trim() || null;
  const now = input.now || new Date().toISOString();
  const createdAt = firstString(runRecord, ["createdAt", "created_at", "startedAt", "started_at"]) || now;
  const startedAt = firstString(runRecord, ["startedAt", "started_at"]) || createdAt;
  const completedAt = firstString(runRecord, ["completedAt", "completed_at"]) || null;
  const updatedAt = firstString(runRecord, ["updatedAt", "updated_at"]) || completedAt || startedAt;
  const parentStatus = normalizeRunnerMetronomeRunStatus(runRecord.status);
  const parentRunId = stableId("metronome-run", workflowId || "workflow", runId);
  const timeline = extractTimeline(input.run, input.timeline);
  const nodes = extractNodes(input.run, input.nodes);
  const nodeById = new Map(nodes.map((node) => [String(node.id), node]));
  const childReferences = extractChildReferences(input.run, timeline, input.childThreads);
  const usedChildren = new Set<number>();
  const sequenceStart = Number.isFinite(input.sequenceStart) && Number(input.sequenceStart) > 0
    ? Math.floor(Number(input.sequenceStart))
    : 1;
  let sequence = sequenceStart;
  const nextSequence = () => ++sequence;
  const events: RunnerThreadEvent[] = [];
  const actions: RunnerThreadAction[] = [];
  const activityGroups: RunnerThreadActivityGroup[] = [];
  const childRuns: RunnerThreadRun[] = [];
  const childRunIds = new Set<string>();
  const producer = { type: "metronome", id: input.producerId || workflowId || null };
  const commonOrigin = {
    kind: "metronome" as const,
    id: runId,
    label: workflowName,
    sourceThreadId,
    sourceMessageId,
    scheduleId: input.scheduleId || null,
    scheduleOccurrenceId: input.scheduleOccurrenceId || null,
    workflowId: workflowId || null,
    workflowRunId: runId,
    triggerType,
    metadata: {
      workflowVersion: input.workflowVersion ?? null,
      ...(input.metadata || {}),
    },
  };

  const startEventId = stableId("metronome-event", workflowId || "workflow", runId, "lifecycle-start");
  const startEventType = initialLifecycleEventType(parentStatus);
  const startSummary = startEventType === "workflow.run.queued"
    ? "Workflow queued"
    : startEventType === "workflow.run.waiting"
      ? "Workflow waiting"
      : "Workflow started";
  const startEvent: RunnerThreadEvent = {
    kind: "event",
    id: startEventId,
    threadId: input.threadId,
    runId: parentRunId,
    sequence: nextSequence(),
    type: startEventType,
    producer,
    actorParticipantId: input.actorParticipantId || null,
    visibility: "user",
    payloadVersion: 1,
    causationId: sourceMessageId || sourceThreadId,
    correlationId: parentRunId,
    title: workflowName,
    summary: startSummary,
    payload: {
      workflowId: workflowId || null,
      workflowRunId: runId,
      triggerType,
      sourceThreadId,
      sourceMessageId,
      observedStatus: parentStatus,
    },
    occurredAt: startedAt,
    createdAt: startedAt,
  };
  events.push(startEvent);

  let lastCausationId = startEventId;
  let highestPermissionRing: RunnerThreadPermissionRing | null = null;
  let currentSummary = "";

  timeline.forEach((rawStep, index) => {
    const step = asRecord(rawStep);
    const output = asRecord(step.output);
    const metadata = asRecord(step.metadata);
    const stepId = firstString(step, ["id", "stepId", "step_id"]) || `step-${index + 1}`;
    const nodeId = firstString(step, ["nodeId", "node_id"]) || firstString(output, ["nodeId", "node_id"]);
    const node = nodeId ? nodeById.get(nodeId) : undefined;
    const nodeKind = firstString(step, ["nodeType", "node_type", "kind"])
      || String(node?.kind || "action");
    const label = firstString(step, ["label", "title", "nodeName", "node_name"])
      || String(node?.label || "").trim()
      || prettify(nodeKind, "Workflow step");
    const rawStatus = firstString(step, ["status"]) || "completed";
    const status = normalizeRunnerMetronomeRunStatus(rawStatus);
    const error = readableError(step.error);
    const summary = error
      || firstString(step, ["summary", "message"])
      || firstString(output, ["summary", "message"])
      || (isActiveStatus(rawStatus.toLowerCase()) ? `Running ${label}` : `${prettify(rawStatus, "Completed")}: ${label}`);
    const ring = readPermissionRing(
      step.permissionRing,
      step.permission_ring,
      metadata.permissionRing,
      metadata.permission_ring,
      output.permissionRing,
      output.permission_ring,
    );
    if (ring && (!highestPermissionRing || ring > highestPermissionRing)) highestPermissionRing = ring;
    if (isActiveStatus(rawStatus.toLowerCase()) || isWaitingStatus(rawStatus.toLowerCase()) || index === timeline.length - 1) {
      currentSummary = summary;
    }
    const stepStartedAt = firstString(step, ["startedAt", "started_at", "createdAt", "created_at"]) || startedAt;
    const stepCompletedAt = firstString(step, ["completedAt", "completed_at", "updatedAt", "updated_at"]) || null;
    const eventId = stableId("metronome-event", workflowId || "workflow", runId, "step", stepId);
    const groupId = stableId("metronome-group", workflowId || "workflow", runId, stepId);
    const matchedChild = findChildForStep(childReferences, usedChildren, stepId, nodeId);
    const resolvedChildRunId = matchedChild
      ? matchedChild.child.runId || stableId("metronome-child-run", workflowId || "workflow", runId, stepId, matchedChild.child.threadId)
      : firstString(step, ["childRunId", "child_run_id"]);
    const event: RunnerThreadEvent = {
      kind: "event",
      id: eventId,
      threadId: input.threadId,
      runId: parentRunId,
      sequence: nextSequence(),
      type: `workflow.node.${status === "completed" ? "completed" : status === "failed" ? "failed" : status === "cancelled" ? "cancelled" : "progress"}`,
      producer,
      actorParticipantId: input.actorParticipantId || null,
      visibility: "user",
      payloadVersion: 1,
      causationId: lastCausationId,
      correlationId: parentRunId,
      title: label,
      summary,
      permissionRing: ring,
      payload: {
        workflowId: workflowId || null,
        workflowRunId: runId,
        stepId,
        sourceSequence: step.sequence ?? step.index ?? index + 1,
        nodeId: nodeId || null,
        nodeKind,
        status,
        input: step.input ?? null,
        output: step.output ?? null,
        error: step.error ?? null,
        childRunId: resolvedChildRunId || null,
        childThreadId: matchedChild?.child.threadId || firstString(step, ["childThreadId", "child_thread_id"]) || null,
        metadata,
      },
      occurredAt: stepCompletedAt || stepStartedAt,
      createdAt: stepCompletedAt || stepStartedAt,
    };
    events.push(event);
    lastCausationId = eventId;

    const groupStatus = status === "running" || status === "queued" || status === "pending" || status === "waiting" || status === "parked"
      ? "open"
      : "sealed";
    const actionId = stableId("metronome-action", workflowId || "workflow", runId, stepId);
    const action: RunnerThreadAction = {
      kind: "action",
      id: actionId,
      threadId: input.threadId,
      runId: parentRunId,
      sequence: nextSequence(),
      activityGroupId: groupId,
      sourceEventId: eventId,
      actorParticipantId: input.actorParticipantId || null,
      type: nodeKind,
      title: label,
      summary,
      status,
      toolName: firstString(step, ["toolName", "tool_name", "tool"]) || null,
      input: step.input ?? null,
      output: step.output ?? null,
      permissionRing: ring,
      policyDecision: firstString(metadata, ["policyDecision", "policy_decision"]) || null,
      touchedResources: [],
      snapshotBeforeId: firstString(step, ["snapshotBeforeId", "snapshot_before_id"]) || null,
      snapshotAfterId: firstString(step, ["snapshotAfterId", "snapshot_after_id"]) || null,
      metadata: {
        adapter: "metronome",
        workflowId: workflowId || null,
        workflowRunId: runId,
        stepId,
        nodeId: nodeId || null,
        nodeKind,
        childRunId: resolvedChildRunId || null,
        childThreadId: matchedChild?.child.threadId || firstString(step, ["childThreadId", "child_thread_id"]) || null,
        sourceSequence: step.sequence ?? step.index ?? index + 1,
        ...metadata,
      },
      startedAt: stepStartedAt,
      completedAt: stepCompletedAt,
      createdAt: stepStartedAt,
      updatedAt: stepCompletedAt || stepStartedAt,
    };
    actions.push(action);
    activityGroups.push({
      kind: "activity_group",
      id: groupId,
      threadId: input.threadId,
      runId: parentRunId,
      sequence: nextSequence(),
      version: 1,
      status: groupStatus,
      title: label,
      liveSummary: summary,
      rationale: String(node?.description || "").trim() || null,
      actionIds: [actionId],
      eventIds: [eventId],
      startSequence: event.sequence,
      endSequence: groupStatus === "sealed" ? action.sequence : null,
      highestPermissionRing: ring,
      metrics: { actionCount: 1 },
      metadata: {
        adapter: "metronome",
        workflowId: workflowId || null,
        workflowRunId: runId,
        stepId,
        nodeId: nodeId || null,
        nodeKind,
        childRunId: resolvedChildRunId || null,
        childThreadId: matchedChild?.child.threadId || null,
        sourceSequence: step.sequence ?? step.index ?? index + 1,
      },
      createdAt: stepStartedAt,
      updatedAt: stepCompletedAt || stepStartedAt,
      sealedAt: groupStatus === "sealed" ? stepCompletedAt || stepStartedAt : null,
    });

    if (matchedChild) {
      usedChildren.add(matchedChild.index);
      const child = matchedChild.child;
      const canonicalChildRunId = resolvedChildRunId || stableId("metronome-child-run", workflowId || "workflow", runId, stepId, child.threadId);
      if (!childRunIds.has(canonicalChildRunId)) {
        childRunIds.add(canonicalChildRunId);
        childRuns.push({
          kind: "run",
          id: canonicalChildRunId,
          threadId: input.threadId,
          sequence: nextSequence(),
          runKind: child.runKind || "worker",
          status: normalizeRunnerMetronomeRunStatus(child.status || status),
          actorParticipantId: child.actorParticipantId || null,
          parentRunId,
          sourceMessageId: child.sourceMessageId || sourceMessageId,
          title: child.title || label,
          summary: child.summary || summary,
          currentSummary: child.summary || summary,
          origin: {
            ...commonOrigin,
            sourceMessageId: child.sourceMessageId || sourceMessageId,
            metadata: {
              ...(commonOrigin.metadata || {}),
              nodeId: nodeId || child.nodeId || null,
              stepId,
              executionThreadId: child.threadId,
              ...(child.metadata || {}),
            },
          },
          highestPermissionRing: ring,
          actionGroupIds: [],
          metadata: {
            adapter: "metronome",
            executionThreadId: child.threadId,
            workflowNodeId: nodeId || child.nodeId || null,
            workflowStepId: stepId,
            ...(child.metadata || {}),
          },
          queuedAt: child.createdAt || stepStartedAt,
          startedAt: child.startedAt || child.createdAt || stepStartedAt,
          completedAt: child.completedAt || null,
          createdAt: child.createdAt || stepStartedAt,
          updatedAt: child.updatedAt || child.completedAt || stepCompletedAt || stepStartedAt,
        });
        const linkEventId = stableId("metronome-event", workflowId || "workflow", runId, "child", stepId, child.threadId);
        events.push({
          kind: "event",
          id: linkEventId,
          threadId: input.threadId,
          runId: parentRunId,
          sequence: nextSequence(),
          type: "workflow.child_run.linked",
          producer,
          actorParticipantId: input.actorParticipantId || null,
          visibility: "user",
          payloadVersion: 1,
          causationId: eventId,
          correlationId: parentRunId,
          title: child.title || label,
          summary: child.summary || `Worker run linked from ${label}`,
          payload: {
            childRunId: canonicalChildRunId,
            childThreadId: child.threadId,
            nodeId: nodeId || child.nodeId || null,
            stepId,
          },
          occurredAt: child.createdAt || stepStartedAt,
          createdAt: child.createdAt || stepStartedAt,
        });
      }
    }
  });

  childReferences.forEach((child, index) => {
    if (usedChildren.has(index)) return;
    const childStepId = child.stepId || child.nodeId || `unmatched-${index + 1}`;
    const childRunId = child.runId || stableId("metronome-child-run", workflowId || "workflow", runId, childStepId, child.threadId);
    if (childRunIds.has(childRunId)) return;
    childRunIds.add(childRunId);
    const childCreatedAt = child.createdAt || startedAt;
    childRuns.push({
      kind: "run",
      id: childRunId,
      threadId: input.threadId,
      sequence: nextSequence(),
      runKind: child.runKind || "worker",
      status: normalizeRunnerMetronomeRunStatus(child.status),
      actorParticipantId: child.actorParticipantId || null,
      parentRunId,
      sourceMessageId: child.sourceMessageId || sourceMessageId,
      title: child.title || "Workflow worker",
      summary: child.summary || null,
      currentSummary: child.summary || null,
      origin: {
        ...commonOrigin,
        sourceMessageId: child.sourceMessageId || sourceMessageId,
        metadata: {
          ...(commonOrigin.metadata || {}),
          nodeId: child.nodeId || null,
          stepId: child.stepId || null,
          executionThreadId: child.threadId,
          ...(child.metadata || {}),
        },
      },
      actionGroupIds: [],
      metadata: {
        adapter: "metronome",
        executionThreadId: child.threadId,
        workflowNodeId: child.nodeId || null,
        workflowStepId: child.stepId || null,
        ...(child.metadata || {}),
      },
      queuedAt: child.createdAt || null,
      startedAt: child.startedAt || child.createdAt || null,
      completedAt: child.completedAt || null,
      createdAt: childCreatedAt,
      updatedAt: child.updatedAt || child.completedAt || childCreatedAt,
    });
    events.push({
      kind: "event",
      id: stableId("metronome-event", workflowId || "workflow", runId, "child", childStepId, child.threadId),
      threadId: input.threadId,
      runId: parentRunId,
      sequence: nextSequence(),
      type: "workflow.child_run.linked",
      producer,
      actorParticipantId: input.actorParticipantId || null,
      visibility: "user",
      payloadVersion: 1,
      causationId: startEventId,
      correlationId: parentRunId,
      title: child.title || "Workflow worker",
      summary: child.summary || "Worker run linked to workflow",
      payload: {
        childRunId,
        childThreadId: child.threadId,
        nodeId: child.nodeId || null,
        stepId: child.stepId || null,
      },
      occurredAt: childCreatedAt,
      createdAt: childCreatedAt,
    });
  });

  if (completedAt && (parentStatus === "completed" || parentStatus === "failed" || parentStatus === "cancelled")) {
    const terminalEventId = stableId("metronome-event", workflowId || "workflow", runId, "lifecycle-terminal");
    const terminalSummary = readableError(runRecord.error)
      || firstString(asRecord(runRecord.output), ["summary", "message"])
      || `Workflow ${parentStatus}`;
    events.push({
      kind: "event",
      id: terminalEventId,
      threadId: input.threadId,
      runId: parentRunId,
      sequence: nextSequence(),
      type: lifecycleEventType(parentStatus, true),
      producer,
      actorParticipantId: input.actorParticipantId || null,
      visibility: "user",
      payloadVersion: 1,
      causationId: lastCausationId,
      correlationId: parentRunId,
      title: workflowName,
      summary: terminalSummary,
      permissionRing: highestPermissionRing,
      payload: {
        workflowId: workflowId || null,
        workflowRunId: runId,
        status: parentStatus,
        output: runRecord.output ?? null,
        error: runRecord.error ?? null,
      },
      occurredAt: completedAt,
      createdAt: completedAt,
    });
  }

  const output = asRecord(runRecord.output);
  const finalSummary = readableError(runRecord.error)
    || firstString(output, ["summary", "message"])
    || currentSummary
    || `Workflow ${parentStatus}`;
  const parentRun: RunnerThreadRun = {
    kind: "run",
    id: parentRunId,
    threadId: input.threadId,
    sequence: sequenceStart,
    runKind: "workflow",
    status: parentStatus,
    actorParticipantId: input.actorParticipantId || null,
    parentRunId: null,
    sourceMessageId,
    title: workflowName,
    summary: finalSummary,
    currentSummary: currentSummary || finalSummary,
    origin: commonOrigin,
    highestPermissionRing,
    actionGroupIds: activityGroups.map((group) => group.id),
    metadata: {
      adapter: "metronome",
      metronomeId: workflowId || null,
      workflowRunId: runId,
      workflowVersion: input.workflowVersion ?? null,
      childRunIds: childRuns.map((run) => run.id),
      ...(input.metadata || {}),
    },
    queuedAt: createdAt,
    startedAt,
    completedAt,
    createdAt,
    updatedAt,
  };

  const items: RunnerMetronomeThreadProjectionItem[] = [parentRun, ...events, ...actions, ...activityGroups, ...childRuns]
    .sort((left, right) => left.sequence - right.sequence || left.id.localeCompare(right.id));
  return {
    threadId: input.threadId,
    parentRun,
    childRuns: childRuns.sort((left, right) => left.sequence - right.sequence),
    actions: actions.sort((left, right) => left.sequence - right.sequence),
    activityGroups: activityGroups.sort((left, right) => left.sequence - right.sequence),
    events: events.sort((left, right) => left.sequence - right.sequence),
    items,
    latestSequence: sequence,
  };
}

/** Naming alias for integrations that use the canonical `Runner*` prefix. */
export const adaptRunnerMetronomeRunToThreadItems = adaptMetronomeRunToThreadItems;
