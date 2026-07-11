import { RunnerLog, RunnerThreadStep } from "../types.js";
import {
  normalizeRunnerThreadAction,
  normalizeRunnerThreadActivityGroup,
  normalizeRunnerThreadMessage,
  normalizeRunnerThreadPermissionRequest,
} from "./normalize.js";
import { createInitialRunnerThreadProjection, reduceRunnerThreadEvents } from "./projection.js";
import {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadEvent,
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
  RunnerThreadRunStatus,
  RunnerThreadTimelineItem,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

export interface RunnerLegacyConversationMessage {
  id?: string;
  role: string;
  content: string;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
  logMetadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerLegacyTraceCluster {
  id?: string;
  runId?: string;
  title?: string;
  summary?: string;
  liveSummary?: string;
  rationale?: string;
  status?: string;
  version?: number;
  sequence?: number;
  startSequence?: number;
  endSequence?: number | null;
  ring?: string | number;
  ringId?: string | number;
  permissionRing?: string | number;
  actionIds?: string[];
  eventIds?: string[];
  actions?: unknown[];
  parentGroupId?: string | null;
  childGroupIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface RunnerLegacyThreadAdapterInput {
  threadId: string;
  messages?: RunnerLegacyConversationMessage[];
  logs?: RunnerLog[];
  steps?: RunnerThreadStep[];
  traceClusters?: RunnerLegacyTraceCluster[];
  participants?: RunnerThreadParticipant[];
  runId?: string;
  runStatus?: RunnerThreadRunStatus;
  runTitle?: string;
  runMetadata?: Record<string, unknown> | null;
  humanParticipantId?: string;
  workerParticipantId?: string;
  communicatorParticipantId?: string;
  startSequence?: number;
  startedAt?: string;
  completedAt?: string | null;
}

export interface RunnerLegacyThreadAdapterResult {
  participants: RunnerThreadParticipant[];
  items: RunnerThreadTimelineItem[];
  projection: RunnerThreadProjection;
}

interface LegacyCandidate {
  sourceOrder: number;
  sourceSequence: number;
  createdAt: string;
  item: RunnerThreadTimelineItem;
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function stringValue(record: UnknownRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function numberValue(record: UnknownRecord, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = record[key];
    const numeric = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
    if (Number.isFinite(numeric)) return numeric;
  }
  return fallback;
}

function parseRelativeClockMs(value: string): number | null {
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?$/.exec(value.trim());
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = match[4] ? Number(match[4].padEnd(3, "0")) : 0;
  return (((hours * 60) + minutes) * 60 + seconds) * 1000 + milliseconds;
}

function legacyTimestamp(value: string | null | undefined, baseMs: number, sourceOrder: number): string {
  const text = String(value || "").trim();
  const parsed = Date.parse(text);
  if (text && Number.isFinite(parsed)) return new Date(parsed).toISOString();
  const relativeMs = parseRelativeClockMs(text);
  return new Date(baseMs + (relativeMs ?? sourceOrder)).toISOString();
}

function permissionRing(value: unknown): 1 | 2 | 3 | null {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(/\D+/g, "")) : Number.NaN;
  return numeric === 1 || numeric === 2 || numeric === 3 ? numeric : null;
}

function legacyRoleKind(role: string): RunnerThreadParticipant["kind"] {
  const normalized = role.trim().toLowerCase();
  if (normalized === "user" || normalized === "human") return "human";
  if (normalized === "observer" || normalized === "communicator") return "communicator";
  if (normalized === "assistant" || normalized === "agent" || normalized === "worker") return "worker";
  if (normalized === "system") return "system";
  return normalized || "human";
}

function participantForRole(
  role: string,
  input: RunnerLegacyThreadAdapterInput,
  existing: Map<string, RunnerThreadParticipant>,
): RunnerThreadParticipant {
  const kind = legacyRoleKind(role);
  const id = kind === "human"
    ? input.humanParticipantId || `${input.threadId}:human`
    : kind === "communicator"
      ? input.communicatorParticipantId || `${input.threadId}:communicator`
      : kind === "worker"
        ? input.workerParticipantId || `${input.threadId}:worker`
        : `${input.threadId}:participant:${kind}`;
  const participant = existing.get(id) || {
    id,
    threadId: input.threadId,
    kind,
    displayName: kind === "human" ? "User" : kind === "worker" ? "Worker" : kind === "communicator" ? "Communicator" : role || "Participant",
    active: true,
    metadata: { source: "legacy_adapter", legacyRole: role },
  };
  existing.set(id, participant);
  return participant;
}

function eventTypeForLog(log: RunnerLog): string {
  return String(log.eventType || (log.isReasoning ? "reasoning" : log.isPlanning ? "planning" : "log"));
}

function runIdForLog(log: RunnerLog, fallbackRunId: string): string {
  return String(log.metadata?.runId || fallbackRunId).trim() || fallbackRunId;
}

function logIsAction(log: RunnerLog): boolean {
  return log.eventType === "command_execution"
    || log.eventType === "mcp_tool_call"
    || log.eventType === "mcp_log"
    || log.eventType === "file_change"
    || log.eventType === "deep_research"
    || log.eventType === "subagent_invocation";
}

function actionTitleForLog(log: RunnerLog): string {
  if (log.metadata?.permissionActionLabel) return log.metadata.permissionActionLabel;
  if (log.metadata?.toolName) return log.metadata.toolName;
  if (log.eventType === "command_execution") return "Ran command";
  if (log.eventType === "file_change") return "Changed files";
  if (log.eventType === "deep_research") return "Deep research";
  if (log.eventType === "subagent_invocation") return "Delegated work";
  return log.message || "Action";
}

function parseLegacyPermissionInput(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return trimmed;
  }
}

export function adaptRunnerLogToThreadItems(
  log: RunnerLog,
  options: {
    threadId: string;
    runId: string;
    sequence?: number;
    createdAt?: string;
    actorParticipantId?: string;
    includeConversationMessages?: boolean;
  },
): RunnerThreadTimelineItem[] {
  const metadata = asRecord(log.metadata);
  const sequence = options.sequence ?? 0;
  const createdAt = options.createdAt || log.createdAt || new Date(0).toISOString();
  const eventType = eventTypeForLog(log);
  const runId = runIdForLog(log, options.runId);

  if (eventType === "permission_request") {
    const permission = normalizeRunnerThreadPermissionRequest({
      id: stringValue(metadata, ["permissionRequestId", "requestId"], `legacy-permission:${runId}:${sequence}`),
      threadId: options.threadId,
      runId,
      sequence,
      sourceEventId: `legacy-log:${runId}:${sequence}`,
      status: stringValue(metadata, ["status", "decision"], "pending"),
      permissionRing: permissionRing(metadata.permissionRing) || permissionRing(metadata.permissionRingId),
      ringLabel: metadata.permissionRingLabel,
      ringDescription: metadata.permissionRingDescription,
      actionType: metadata.permissionActionId,
      actionLabel: metadata.permissionActionLabel,
      actionDescription: metadata.permissionActionDescription,
      toolName: metadata.toolName,
      input: parseLegacyPermissionInput(metadata.input),
      reason: metadata.reason,
      requestedMode: metadata.requiredMode,
      currentMode: metadata.currentMode,
      decision: metadata.decision,
      requestedAt: createdAt,
      resolvedAt: stringValue(metadata, ["status", "decision"]) === "pending" ? null : createdAt,
      createdAt,
      metadata: { source: "legacy_log", legacyEventType: eventType },
    });
    return [permission];
  }

  if (options.includeConversationMessages && (eventType === "user_message" || eventType === "agent_message" || eventType === "llm_response")) {
    const role = eventType === "user_message" ? "user" : "assistant";
    const authorParticipantId = options.actorParticipantId || `${options.threadId}:${role === "user" ? "human" : "worker"}`;
    return [normalizeRunnerThreadMessage({
      id: `legacy-log-message:${runId}:${sequence}`,
      threadId: options.threadId,
      sequence,
      authorParticipantId,
      content: log.message,
      modality: "text",
      status: "delivered",
      linkedRunIds: [runId],
      createdAt,
      metadata: { source: "legacy_log", legacyEventType: eventType },
    })];
  }

  if (logIsAction(log)) {
    const toolInput = metadata.toolInput ?? metadata.args ?? metadata.input;
    const action = normalizeRunnerThreadAction({
      id: stringValue(metadata, ["toolId", "actionId"], `legacy-action:${runId}:${sequence}`),
      threadId: options.threadId,
      runId,
      sequence,
      sourceEventId: `legacy-log:${runId}:${sequence}`,
      actorParticipantId: options.actorParticipantId,
      type: eventType,
      title: actionTitleForLog(log),
      summary: log.message,
      status: stringValue(metadata, ["status"], log.type === "error" ? "failed" : "completed"),
      toolName: metadata.toolName,
      input: toolInput,
      output: metadata.output ?? metadata.result,
      permissionRing: permissionRing(metadata.permissionRing),
      touchedResources: Array.isArray(metadata.filePaths) ? metadata.filePaths : [],
      metadata: { ...metadata, source: "legacy_log", legacyEventType: eventType },
      createdAt,
      completedAt: stringValue(metadata, ["status"]) === "running" ? null : createdAt,
    });
    return [action];
  }

  const event: RunnerThreadEvent = {
    kind: "event",
    id: `legacy-log:${runId}:${sequence}`,
    threadId: options.threadId,
    runId,
    sequence,
    type: eventType,
    producer: { type: "legacy_log", participantId: options.actorParticipantId || null },
    actorParticipantId: options.actorParticipantId || null,
    visibility: "user",
    payloadVersion: 1,
    title: null,
    summary: log.message || null,
    permissionRing: permissionRing(metadata.permissionRing),
    policyDecision: typeof metadata.decision === "string" ? metadata.decision : null,
    snapshotBeforeId: null,
    snapshotAfterId: null,
    payload: { log: { ...log, metadata } },
    occurredAt: createdAt,
    createdAt,
  };
  return [event];
}

export function adaptRunnerThreadStepToAction(
  step: RunnerThreadStep,
  options: { threadId?: string; runId: string; sequence?: number },
): RunnerThreadAction {
  const metadata = asRecord(step.metadata);
  const sequence = options.sequence ?? step.sequence;
  return normalizeRunnerThreadAction({
    id: step.id,
    threadId: options.threadId || step.threadId,
    runId: stringValue(metadata, ["runId", "run_id"], options.runId),
    sequence,
    sourceEventId: stringValue(metadata, ["eventId", "event_id"], `legacy-step-event:${step.id}`),
    activityGroupId: stringValue(metadata, ["activityGroupId", "activity_group_id", "groupId", "group_id"]) || null,
    type: step.stepKind || step.eventType || "step",
    title: step.title || "Step",
    summary: stringValue(metadata, ["summary", "message"]),
    status: stringValue(metadata, ["status"], "completed"),
    toolName: stringValue(metadata, ["toolName", "tool_name", "tool"]),
    input: metadata.input ?? metadata.args,
    output: metadata.output ?? metadata.result,
    permissionRing: permissionRing(metadata.permissionRing ?? metadata.permission_ring ?? metadata.ringId ?? metadata.ring),
    touchedResources: metadata.touchedResources ?? metadata.touched_resources ?? metadata.filePaths ?? [],
    snapshotBeforeId: step.snapshotBeforeId,
    snapshotAfterId: step.snapshotAfterId,
    createdAt: step.createdAt,
    completedAt: step.createdAt,
    metadata: { ...metadata, source: "legacy_thread_step", legacyStepSequence: step.sequence },
  });
}

export function adaptLegacyTraceClusterToActivityGroup(
  cluster: RunnerLegacyTraceCluster,
  options: { threadId: string; runId: string; sequence?: number },
): RunnerThreadActivityGroup {
  const record = cluster as UnknownRecord;
  return normalizeRunnerThreadActivityGroup({
    ...cluster,
    id: cluster.id || `legacy-trace-cluster:${options.runId}:${options.sequence ?? 0}`,
    threadId: options.threadId,
    runId: cluster.runId || options.runId,
    sequence: cluster.sequence ?? cluster.startSequence ?? options.sequence ?? 0,
    startSequence: cluster.startSequence ?? cluster.sequence ?? options.sequence ?? 0,
    endSequence: cluster.endSequence,
    title: cluster.title || "Work",
    liveSummary: cluster.liveSummary || cluster.summary || "",
    highestPermissionRing: permissionRing(cluster.permissionRing ?? cluster.ringId ?? cluster.ring),
    actionIds: cluster.actionIds || [],
    eventIds: cluster.eventIds || [],
    metadata: { ...(cluster.metadata || {}), source: "legacy_trace_cluster", rawSource: record.source },
  });
}

function inferRunStatus(input: RunnerLegacyThreadAdapterInput): RunnerThreadRunStatus {
  if (input.runStatus) return input.runStatus;
  const logs = input.logs || [];
  const pendingPermission = logs.some((log) => log.eventType === "permission_request" && String(log.metadata?.status || "pending") === "pending");
  if (pendingPermission) return "requires_action";
  if (logs.some((log) => log.type === "error")) return "failed";
  if (logs.some((log) => log.eventType === "turn_completed" || log.eventType === "agent_message" || log.eventType === "llm_response")) return "completed";
  return logs.length || (input.steps || []).length ? "running" : "completed";
}

function sortAndResequence(candidates: LegacyCandidate[], startSequence: number): RunnerThreadTimelineItem[] {
  const ordered = [...candidates].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return leftTime - rightTime;
    if (left.sourceSequence !== right.sourceSequence) return left.sourceSequence - right.sourceSequence;
    return left.sourceOrder - right.sourceOrder;
  });
  return ordered.map((candidate, index) => ({ ...candidate.item, sequence: startSequence + index + 1 }));
}

function cleanLegacyProgressSummary(value: string | null | undefined, maxLength = 220): string {
  const cleaned = String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(thinking|reasoning|planning|progress|run summary)\s*:?\s*/i, "")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, Math.max(1, maxLength - 1)).trim()}…`;
}

function legacyGroupTitle(summary: string, fallbackAction: RunnerThreadAction): string {
  const firstSentence = summary.split(/(?<=[.!?])\s+/)[0] || summary;
  const compact = cleanLegacyProgressSummary(firstSentence, 96).replace(/[.!?]+$/, "");
  if (compact) return compact;
  if (fallbackAction.type === "command_execution") return "Running and validating commands";
  if (fallbackAction.type === "file_change") return "Updating the workspace";
  if (fallbackAction.type === "deep_research") return "Researching the task";
  return fallbackAction.title || "Working through the task";
}

function buildLegacyFallbackActivityGroups(
  items: RunnerThreadTimelineItem[],
  options: { threadId: string; runId: string; runStatus: RunnerThreadRunStatus },
): RunnerThreadTimelineItem[] {
  if (!items.some((item) => item.kind === "action")) return items;
  const updatedItems = [...items];
  const groups: RunnerThreadActivityGroup[] = [];
  let pendingActions: Array<{ index: number; action: RunnerThreadAction }> = [];
  let latestProgressSummary = "";
  let groupIndex = 0;

  const flushGroup = (closingSummary = "") => {
    if (!pendingActions.length) return;
    groupIndex += 1;
    const first = pendingActions[0].action;
    const last = pendingActions[pendingActions.length - 1].action;
    const liveSummary = cleanLegacyProgressSummary(closingSummary || latestProgressSummary || last.summary || first.summary || first.title);
    const groupId = `legacy-auto-group:${options.runId}:${first.id}`;
    const highestPermissionRing = pendingActions.reduce<1 | 2 | 3 | null>((highest, entry) => {
      const ring = entry.action.permissionRing;
      return ring && (!highest || ring > highest) ? ring : highest;
    }, null);
    const group: RunnerThreadActivityGroup = {
      kind: "activity_group",
      id: groupId,
      threadId: options.threadId,
      runId: options.runId,
      sequence: first.sequence,
      version: 1,
      status: "sealed",
      title: legacyGroupTitle(liveSummary, first),
      liveSummary,
      rationale: latestProgressSummary || null,
      parentGroupId: null,
      childGroupIds: [],
      actionIds: pendingActions.map((entry) => entry.action.id),
      eventIds: [],
      startSequence: first.sequence,
      endSequence: last.sequence,
      highestPermissionRing,
      supersedesGroupId: null,
      supersededByGroupId: null,
      observerModel: null,
      metrics: { actionCount: pendingActions.length },
      metadata: {
        source: "legacy_phase_fallback",
        groupIndex,
        boundaryStrategy: "planning_reasoning_action_summary",
      },
      createdAt: first.createdAt,
      updatedAt: last.updatedAt || last.completedAt || last.createdAt,
      sealedAt: last.completedAt || last.createdAt,
    };
    for (const entry of pendingActions) {
      updatedItems[entry.index] = { ...entry.action, activityGroupId: groupId };
    }
    groups.push(group);
    pendingActions = [];
  };

  for (let index = 0; index < updatedItems.length; index += 1) {
    const item = updatedItems[index];
    if (item.kind === "event" && (item.type === "planning" || item.type === "reasoning" || item.type === "action_summary")) {
      const nextSummary = cleanLegacyProgressSummary(item.summary);
      if (pendingActions.length) flushGroup(nextSummary);
      if (nextSummary) latestProgressSummary = nextSummary;
      continue;
    }
    if (item.kind === "action" && !item.activityGroupId) pendingActions.push({ index, action: item });
  }
  flushGroup();
  const runIsActive = [
    "running",
    "queued",
    "pending",
    "parked",
    "waiting",
    "waiting_permission",
    "requires_action",
  ].includes(options.runStatus);
  if (runIsActive && groups.length) {
    const lastGroupIndex = groups.length - 1;
    groups[lastGroupIndex] = {
      ...groups[lastGroupIndex],
      status: "open",
      endSequence: null,
      sealedAt: null,
    };
  }
  return [...updatedItems, ...groups].sort((left, right) => (
    left.sequence - right.sequence
    || (left.kind === "activity_group" ? -1 : right.kind === "activity_group" ? 1 : 0)
    || left.createdAt.localeCompare(right.createdAt)
  ));
}

export function adaptLegacyThreadData(input: RunnerLegacyThreadAdapterInput): RunnerLegacyThreadAdapterResult {
  const threadId = String(input.threadId || "").trim();
  if (!threadId) throw new Error("adaptLegacyThreadData requires a threadId.");
  const baseMs = Date.parse(input.startedAt || "");
  const safeBaseMs = Number.isFinite(baseMs) ? baseMs : Date.now();
  const defaultRunId = String(input.runId || `legacy:${threadId}:run`).trim();
  const participantMap = new Map<string, RunnerThreadParticipant>();
  for (const participant of input.participants || []) participantMap.set(participant.id, participant);
  const human = participantForRole("user", input, participantMap);
  const worker = participantForRole("assistant", input, participantMap);
  const candidates: LegacyCandidate[] = [];
  let sourceOrder = 0;

  for (const message of input.messages || []) {
    sourceOrder += 1;
    const participant = participantForRole(message.role, input, participantMap);
    const createdAt = legacyTimestamp(message.createdAt, safeBaseMs, sourceOrder);
    const item: RunnerThreadMessage = normalizeRunnerThreadMessage({
      id: message.id || `legacy-message:${threadId}:${sourceOrder}`,
      threadId,
      sequence: sourceOrder,
      authorParticipantId: participant.id,
      content: message.content,
      modality: "text",
      status: "delivered",
      linkedRunIds: participant.kind === "human" || participant.kind === "worker" ? [defaultRunId] : [],
      createdAt,
      metadata: { ...(message.metadata || message.logMetadata || {}), source: "legacy_conversation_message", legacyRole: message.role },
    });
    candidates.push({ sourceOrder, sourceSequence: sourceOrder, createdAt, item });
  }

  const hasCanonicalMessages = Boolean(input.messages?.length);
  for (const log of input.logs || []) {
    sourceOrder += 1;
    const createdAt = legacyTimestamp(log.createdAt || log.time, safeBaseMs, sourceOrder);
    const actorParticipantId = log.eventType === "user_message" ? human.id : worker.id;
    const items = adaptRunnerLogToThreadItems(log, {
      threadId,
      runId: defaultRunId,
      sequence: sourceOrder,
      createdAt,
      actorParticipantId,
      includeConversationMessages: !hasCanonicalMessages,
    });
    for (const item of items) candidates.push({ sourceOrder, sourceSequence: sourceOrder, createdAt, item });
  }

  for (const step of input.steps || []) {
    sourceOrder += 1;
    const createdAt = legacyTimestamp(step.createdAt, safeBaseMs, sourceOrder);
    const item = adaptRunnerThreadStepToAction(step, { threadId, runId: defaultRunId, sequence: step.sequence || sourceOrder });
    candidates.push({ sourceOrder, sourceSequence: step.sequence || sourceOrder, createdAt, item: { ...item, createdAt } });
  }

  for (const cluster of input.traceClusters || []) {
    sourceOrder += 1;
    const createdAt = legacyTimestamp(cluster.createdAt, safeBaseMs, sourceOrder);
    const group = adaptLegacyTraceClusterToActivityGroup(cluster, { threadId, runId: defaultRunId, sequence: cluster.sequence || cluster.startSequence || sourceOrder });
    candidates.push({ sourceOrder, sourceSequence: group.startSequence || sourceOrder, createdAt, item: { ...group, createdAt } });
    for (const rawAction of cluster.actions || []) {
      sourceOrder += 1;
      const actionRecord = asRecord(rawAction);
      const actionCreatedAt = legacyTimestamp(stringValue(actionRecord, ["createdAt", "created_at", "timestamp"]), safeBaseMs, sourceOrder);
      const action = normalizeRunnerThreadAction({
        ...actionRecord,
        id: stringValue(actionRecord, ["id", "actionId", "action_id"], `legacy-cluster-action:${group.id}:${sourceOrder}`),
        threadId,
        runId: cluster.runId || defaultRunId,
        activityGroupId: group.id,
        sequence: numberValue(actionRecord, ["sequence", "stepSequence", "step_sequence"], sourceOrder),
        createdAt: actionCreatedAt,
        permissionRing: permissionRing(actionRecord.permissionRing ?? actionRecord.ringId ?? actionRecord.ring),
        metadata: { ...asRecord(actionRecord.metadata), source: "legacy_trace_cluster_action" },
      });
      if (!group.actionIds.includes(action.id)) group.actionIds.push(action.id);
      candidates.push({ sourceOrder, sourceSequence: action.sequence, createdAt: actionCreatedAt, item: action });
    }
  }

  const startSequence = Math.max(0, Math.trunc(input.startSequence || 0));
  const resequencedItems = input.traceClusters?.length
    ? sortAndResequence(candidates, startSequence)
    : buildLegacyFallbackActivityGroups(sortAndResequence(candidates, startSequence), {
        threadId,
        runId: defaultRunId,
        runStatus: inferRunStatus(input),
      });
  const firstSequence = resequencedItems[0]?.sequence ?? startSequence + 1;
  const firstCreatedAt = resequencedItems[0]?.createdAt || new Date(safeBaseMs).toISOString();
  const lastCreatedAt = resequencedItems[resequencedItems.length - 1]?.createdAt || firstCreatedAt;
  const sourceMessage = resequencedItems.find((item): item is RunnerThreadMessage => item.kind === "message" && item.authorParticipantId === human.id);
  const groupIds = resequencedItems.filter((item): item is RunnerThreadActivityGroup => item.kind === "activity_group").map((group) => group.id);
  const latestActivityGroup = resequencedItems.filter((item): item is RunnerThreadActivityGroup => item.kind === "activity_group").at(-1) || null;
  const actionCount = resequencedItems.filter((item) => item.kind === "action").length;
  const changeCount = resequencedItems.filter((item) => item.kind === "action" && item.type === "file_change").length;
  const pendingPermissionCount = resequencedItems.filter((item) => item.kind === "permission" && item.status === "pending").length;
  const highestRing = resequencedItems.reduce<1 | 2 | 3 | null>((highest, item) => {
    const ring = item.kind === "run" || item.kind === "activity_group"
      ? item.highestPermissionRing
      : item.kind === "action" || item.kind === "event" || item.kind === "permission"
        ? item.permissionRing
        : null;
    return ring && (!highest || ring > highest) ? ring : highest;
  }, null);
  const run: RunnerThreadRun = {
    kind: "run",
    id: defaultRunId,
    threadId,
    sequence: sourceMessage?.sequence ?? firstSequence,
    runKind: "worker",
    status: inferRunStatus(input),
    actorParticipantId: worker.id,
    parentRunId: null,
    sourceMessageId: sourceMessage?.id || null,
    title: input.runTitle || null,
    summary: null,
    currentSummary: latestActivityGroup?.liveSummary || null,
    origin: { kind: sourceMessage ? "message" : "system", sourceMessageId: sourceMessage?.id || null },
    highestPermissionRing: highestRing,
    actionGroupIds: groupIds,
    lease: null,
    projection: latestActivityGroup ? {
      runId: defaultRunId,
      threadId,
      sequence: latestActivityGroup.sequence,
      status: inferRunStatus(input),
      phase: latestActivityGroup.title,
      summary: latestActivityGroup.liveSummary,
      freshnessSequence: latestActivityGroup.endSequence ?? latestActivityGroup.startSequence,
      freshnessAt: latestActivityGroup.updatedAt || latestActivityGroup.createdAt,
      highestPermissionRing: highestRing,
      counters: {
        activityGroupCount: groupIds.length,
        actionCount,
        changeCount,
        pendingPermissionCount,
        childRunCount: 0,
      },
      observerModel: null,
      metadata: { source: "legacy_adapter", ...(input.runMetadata || {}) },
      updatedAt: latestActivityGroup.updatedAt || latestActivityGroup.createdAt,
    } : null,
    metadata: { source: "legacy_adapter", ...(input.runMetadata || {}) },
    queuedAt: firstCreatedAt,
    startedAt: input.startedAt || firstCreatedAt,
    parkedAt: null,
    completedAt: inferRunStatus(input) === "completed" || inferRunStatus(input) === "failed" || inferRunStatus(input) === "cancelled"
      ? input.completedAt || lastCreatedAt
      : null,
    createdAt: input.startedAt || firstCreatedAt,
    updatedAt: lastCreatedAt,
  };
  const timelineKindPriority: Record<RunnerThreadTimelineItem["kind"], number> = {
    message: 0,
    run: 1,
    activity_group: 2,
    action: 3,
    permission: 4,
    routing_receipt: 5,
    event: 6,
  };
  const items = [run, ...resequencedItems].sort((left, right) => (
    left.sequence - right.sequence
    || left.createdAt.localeCompare(right.createdAt)
    || timelineKindPriority[left.kind] - timelineKindPriority[right.kind]
  ));
  const participants = Array.from(participantMap.values());
  const projection = reduceRunnerThreadEvents(
    createInitialRunnerThreadProjection({ threadId, participants }),
    items,
  );
  return { participants, items, projection };
}

export const adaptLegacyThreadToProjection = (input: RunnerLegacyThreadAdapterInput): RunnerThreadProjection => (
  adaptLegacyThreadData(input).projection
);
