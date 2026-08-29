const METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS = Object.freeze({
  success: ["complete", "completed", "done", "finished", "succeeded", "success"],
  failure: ["error", "errored", "failed", "failure", "timed_out", "timeout"],
  cancelled: ["aborted", "canceled", "cancelled", "stopped", "terminated"],
  running: ["active", "executing", "in_progress", "processing", "running", "started", "starting", "working"],
  pending: ["created", "pending", "queued", "ready", "scheduled", "waiting"],
  attention: ["awaiting_approval", "permission_asked", "waiting_approval"],
  paused: ["paused"],
});

/** Normalize every backend/UI spelling before lifecycle decisions are made. */
export function normalizeMetronomeThreadLifecycleStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/^inprogress$/, "in_progress");
}

export function classifyMetronomeThreadLifecycleStatus(value) {
  const status = normalizeMetronomeThreadLifecycleStatus(value);
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.success.includes(status)) return "terminal";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.failure.includes(status)) return "terminal";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.cancelled.includes(status)) return "terminal";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.attention.includes(status)) return "attention";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.paused.includes(status)) return "paused";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.running.includes(status)) return "running";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.pending.includes(status)) return "pending";
  return "unknown";
}

export function canonicalizeMetronomeThreadLifecycleStatus(value) {
  const status = normalizeMetronomeThreadLifecycleStatus(value);
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.success.includes(status)) return "completed";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.failure.includes(status)) return "failed";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.cancelled.includes(status)) return "cancelled";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.attention.includes(status)) return "permission_asked";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.paused.includes(status)) return "paused";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.running.includes(status)) return "running";
  if (METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS.pending.includes(status)) return "queued";
  return status;
}

export function readMetronomeThreadLifecycleTimestamp(record, kind = "activity") {
  const safeRecord = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const completionKeys = ["completedAt", "completed_at", "finishedAt", "finished_at", "endedAt", "ended_at"];
  const activityKeys = [
    "updatedAt",
    "updated_at",
    "lastActivityAt",
    "last_activity_at",
    ...completionKeys,
    "startedAt",
    "started_at",
    "createdAt",
    "created_at",
  ];
  const keys = kind === "completion" ? completionKeys : activityKeys;
  for (const key of keys) {
    const value = String(safeRecord[key] || "").trim();
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return 0;
}

export function readMetronomeThreadLifecycleStatus(record) {
  const safeRecord = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  return String(
    safeRecord.status
    || safeRecord.state
    || safeRecord.executionStatus
    || safeRecord.execution_status
    || safeRecord.runStatus
    || safeRecord.run_status
    || ""
  ).trim();
}

function normalizeMetronomeThreadLifecycleObservation(value, index) {
  const wrapper = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const record = wrapper.record && typeof wrapper.record === "object" && !Array.isArray(wrapper.record)
    ? wrapper.record
    : wrapper;
  const rawStatus = readMetronomeThreadLifecycleStatus(record);
  let status = canonicalizeMetronomeThreadLifecycleStatus(rawStatus);
  let phase = classifyMetronomeThreadLifecycleStatus(status);
  const completedAt = readMetronomeThreadLifecycleTimestamp(record, "completion");
  if (completedAt && phase !== "terminal") {
    status = "completed";
    phase = "terminal";
  }
  return {
    record,
    source: String(wrapper.source || "observation-" + index).trim(),
    priority: Number.isFinite(Number(wrapper.priority)) ? Number(wrapper.priority) : 0,
    status,
    phase,
    timestamp: readMetronomeThreadLifecycleTimestamp(record),
    completedAt,
    explicit: Boolean(rawStatus),
  };
}

function compareMetronomeThreadLifecycleObservations(left, right) {
  if (left.timestamp && right.timestamp && left.timestamp !== right.timestamp) {
    return right.timestamp - left.timestamp;
  }
  if (left.priority !== right.priority) return right.priority - left.priority;
  if (left.timestamp !== right.timestamp) return right.timestamp - left.timestamp;
  return Number(right.explicit) - Number(left.explicit);
}

/**
 * Resolve one child thread from all status projections. Terminal evidence is
 * monotonic, while the run's active-node projection prevents stale step rows
 * from making sequential nodes look concurrently active.
 */
export function resolveMetronomeThreadLifecycle(observations, context = {}) {
  const normalized = (Array.isArray(observations) ? observations : [observations])
    .filter(Boolean)
    .map(normalizeMetronomeThreadLifecycleObservation)
    .filter((item) => item.status || item.completedAt)
    .sort(compareMetronomeThreadLifecycleObservations);
  const nodeId = String(context.nodeId || context.node_id || "").trim();
  const activeNodeIds = (Array.isArray(context.activeNodeIds) ? context.activeNodeIds : [])
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const completedNodeIds = (Array.isArray(context.completedNodeIds) ? context.completedNodeIds : [])
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const hasActiveNodeProjection = Boolean(context.hasActiveNodeProjection || activeNodeIds.length);
  const isProjectedActive = Boolean(nodeId && activeNodeIds.includes(nodeId));
  const isProjectedComplete = Boolean(nodeId && completedNodeIds.includes(nodeId));
  const started = Boolean(context.startedAt || context.started_at)
    || normalized.some((item) => item.phase === "running" || item.phase === "terminal" || readMetronomeThreadLifecycleTimestamp(item.record, "activity"));
  const runStatus = canonicalizeMetronomeThreadLifecycleStatus(context.runStatus || context.run_status || "");
  const runPhase = classifyMetronomeThreadLifecycleStatus(runStatus);
  const terminal = normalized.filter((item) => item.phase === "terminal");

  let selected = terminal[0] || null;
  if (!selected && isProjectedComplete) {
    selected = { status: "completed", phase: "terminal", source: "run.completedNodeIds", timestamp: 0 };
  }
  if (!selected && runPhase === "terminal" && started) {
    const terminalStatus = isProjectedActive && ["failed", "cancelled"].includes(runStatus)
      ? runStatus
      : "completed";
    selected = { status: terminalStatus, phase: "terminal", source: "run.terminal", timestamp: 0 };
  }

  const preferred = normalized.find((item) => item.phase !== "terminal") || null;
  const running = normalized.find((item) => item.phase === "running");
  if (!selected && isProjectedActive) {
    selected = preferred && ["attention", "paused"].includes(preferred.phase)
      ? preferred
      : running || { status: "running", phase: "running", source: "run.activeNodeIds", timestamp: 0 };
  }
  if (!selected && running && hasActiveNodeProjection && nodeId && !isProjectedActive) {
    selected = started
      ? { status: "completed", phase: "terminal", source: "run.activeNodeAdvanced", timestamp: running.timestamp }
      : { status: "queued", phase: "pending", source: "run.notActive", timestamp: running.timestamp };
  }
  if (!selected && preferred) selected = preferred;
  if (!selected) {
    selected = normalized[0] || { status: "", phase: "unknown", source: "none", timestamp: 0 };
  }

  const status = canonicalizeMetronomeThreadLifecycleStatus(selected.status);
  const phase = selected.phase || classifyMetronomeThreadLifecycleStatus(status);
  return {
    status,
    phase,
    isRunning: phase === "running",
    isTerminal: phase === "terminal",
    isPending: phase === "pending",
    needsAttention: phase === "attention",
    source: String(selected.source || "").trim(),
    observedAt: Number(selected.timestamp || 0),
  };
}

function mergeMetronomeThreadLifecycleMetadata(secondary, primary) {
  const left = secondary && typeof secondary === "object" && !Array.isArray(secondary) ? secondary : {};
  const right = primary && typeof primary === "object" && !Array.isArray(primary) ? primary : {};
  const merged = { ...left, ...right };
  for (const key of ["metronome", "metronomeWorkflow"]) {
    const leftNested = left[key] && typeof left[key] === "object" && !Array.isArray(left[key]) ? left[key] : {};
    const rightNested = right[key] && typeof right[key] === "object" && !Array.isArray(right[key]) ? right[key] : {};
    if (Object.keys(leftNested).length || Object.keys(rightNested).length) {
      merged[key] = { ...leftNested, ...rightNested };
    }
  }
  return merged;
}

/** Merge polling/event snapshots without allowing a terminal thread to regress. */
export function mergeMetronomeThreadLifecycleRecords(leftValue, rightValue) {
  const left = leftValue && typeof leftValue === "object" && !Array.isArray(leftValue) ? leftValue : {};
  const right = rightValue && typeof rightValue === "object" && !Array.isArray(rightValue) ? rightValue : {};
  if (!Object.keys(left).length) return { ...right };
  if (!Object.keys(right).length) return { ...left };
  const leftLifecycle = resolveMetronomeThreadLifecycle([{ record: left, source: "left" }]);
  const rightLifecycle = resolveMetronomeThreadLifecycle([{ record: right, source: "right" }]);
  const leftTime = readMetronomeThreadLifecycleTimestamp(left);
  const rightTime = readMetronomeThreadLifecycleTimestamp(right);
  const phaseRank = { unknown: 0, pending: 1, running: 2, paused: 2, attention: 2, terminal: 3 };
  let primary = right;
  let secondary = left;
  let lifecycle = rightLifecycle;
  if (
    leftLifecycle.isTerminal && !rightLifecycle.isTerminal
    || (leftLifecycle.isTerminal === rightLifecycle.isTerminal && leftTime > rightTime)
    || (leftTime === rightTime && (phaseRank[leftLifecycle.phase] || 0) > (phaseRank[rightLifecycle.phase] || 0))
  ) {
    primary = left;
    secondary = right;
    lifecycle = leftLifecycle;
  }
  const primaryMetadata = primary.metadata && typeof primary.metadata === "object" && !Array.isArray(primary.metadata) ? primary.metadata : {};
  const secondaryMetadata = secondary.metadata && typeof secondary.metadata === "object" && !Array.isArray(secondary.metadata) ? secondary.metadata : {};
  const metadata = mergeMetronomeThreadLifecycleMetadata(secondaryMetadata, primaryMetadata);
  const merged = {
    ...secondary,
    ...primary,
    status: lifecycle.status || String(primary.status || secondary.status || "").trim(),
  };
  if (Object.keys(metadata).length) merged.metadata = metadata;
  if (lifecycle.isTerminal) {
    const completedAt = String(
      primary.completedAt
      || primary.completed_at
      || secondary.completedAt
      || secondary.completed_at
      || ""
    ).trim();
    if (completedAt) merged.completedAt = completedAt;
  }
  for (const metadataKey of ["metronome", "metronomeWorkflow"]) {
    if (merged.metadata?.[metadataKey]) {
      merged.metadata[metadataKey] = {
        ...merged.metadata[metadataKey],
        status: lifecycle.status || merged.metadata[metadataKey].status || "",
        lifecyclePhase: lifecycle.phase,
      };
    }
  }
  return merged;
}

export function mergeMetronomeThreadLifecycleRecordLists(...groups) {
  const order = [];
  const byId = new Map();
  groups.flat().forEach((record) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return;
    const id = String(record.id || record.threadId || record.thread_id || "").trim();
    if (!id) return;
    if (!byId.has(id)) order.push(id);
    byId.set(id, byId.has(id) ? mergeMetronomeThreadLifecycleRecords(byId.get(id), record) : { ...record });
  });
  return order.map((id) => byId.get(id));
}

const lifecycleFunctionSources = [
  normalizeMetronomeThreadLifecycleStatus,
  classifyMetronomeThreadLifecycleStatus,
  canonicalizeMetronomeThreadLifecycleStatus,
  readMetronomeThreadLifecycleTimestamp,
  readMetronomeThreadLifecycleStatus,
  normalizeMetronomeThreadLifecycleObservation,
  compareMetronomeThreadLifecycleObservations,
  resolveMetronomeThreadLifecycle,
  mergeMetronomeThreadLifecycleMetadata,
  mergeMetronomeThreadLifecycleRecords,
  mergeMetronomeThreadLifecycleRecordLists,
].map((fn) => fn.toString()).join("\n\n");

/** Browser fragment generated from the same functions covered by unit tests. */
export const METRONOME_THREAD_LIFECYCLE_SCRIPT = `
      const METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS = Object.freeze(${JSON.stringify(METRONOME_THREAD_LIFECYCLE_STATUS_GROUPS)});

${lifecycleFunctionSources}
`;
