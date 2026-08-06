export type RunnerThreadPlanStepStatus = "pending" | "in_progress" | "completed";

export interface RunnerThreadPlanStep {
  id: string;
  text: string;
  status: RunnerThreadPlanStepStatus;
  completed: boolean;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  actorParticipantId: string | null;
  agentId: string | null;
  runId: string | null;
}

interface ParsedPlanStep {
  sourceId: string;
  text: string;
  status: RunnerThreadPlanStepStatus;
  completed: boolean;
  occurrence: number;
}

interface PlanSnapshot {
  steps: ParsedPlanStep[];
  index: number;
  sequence: number;
  timestamp: string;
  timestampMs: number | null;
  actorParticipantId: string;
  agentId: string;
  runId: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(
  source: Record<string, unknown> | null | undefined,
  keys: readonly string[],
): string {
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function normalizeType(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.\s-]+/g, "_");
}

function normalizeStepText(value: unknown): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveStepStatus(item: Record<string, unknown>): RunnerThreadPlanStepStatus {
  const status = normalizeType(item.status || item.state);
  if (
    item.completed === true ||
    ["completed", "complete", "done", "success", "succeeded"].includes(status)
  ) {
    return "completed";
  }
  if (["active", "current", "in_progress", "running", "started"].includes(status)) {
    return "in_progress";
  }
  return "pending";
}

function normalizePlanStepArray(value: unknown): ParsedPlanStep[] {
  if (!Array.isArray(value)) return [];
  const occurrences = new Map<string, number>();
  return value.flatMap((item) => {
    const record = asRecord(item);
    const text =
      typeof item === "string"
        ? normalizeStepText(item)
        : normalizeStepText(record?.text || record?.content || record?.title || record?.message);
    if (!text) return [];
    const normalizedText = text.toLowerCase();
    const occurrence = occurrences.get(normalizedText) || 0;
    occurrences.set(normalizedText, occurrence + 1);
    const status = record ? resolveStepStatus(record) : "pending";
    return [
      {
        sourceId: firstString(record, ["id", "todoId", "todo_id", "taskId", "task_id"]),
        text,
        status,
        completed: status === "completed",
        occurrence,
      },
    ];
  });
}

function parsePlanSteps(value: unknown, depth = 0): ParsedPlanStep[] {
  if (depth > 4 || value == null) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith("[") && !trimmed.startsWith("{"))) {
      return [];
    }
    try {
      return parsePlanSteps(JSON.parse(trimmed), depth + 1);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return normalizePlanStepArray(value);
  const record = asRecord(value);
  if (!record) return [];
  const directKeys = [
    "todos",
    "todoItems",
    "todo_items",
    "taskList",
    "task_list",
    "todoList",
    "todo_list",
    "items",
    "tasks",
  ];
  for (const key of directKeys) {
    const steps = parsePlanSteps(record[key], depth + 1);
    if (steps.length > 0 || Array.isArray(record[key])) return steps;
  }
  const nestedKeys = [
    "metadata",
    "logMetadata",
    "log_metadata",
    "result",
    "output",
    "data",
    "payload",
    "body",
    "args",
    "arguments",
    "input",
  ];
  for (const key of nestedKeys) {
    const steps = parsePlanSteps(record[key], depth + 1);
    if (steps.length > 0) return steps;
  }
  return [];
}

function planStepIdentity(step: ParsedPlanStep): string {
  return step.sourceId || `${step.text.toLowerCase()}:${step.occurrence}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function readSnapshot(log: unknown, index: number): PlanSnapshot | null {
  const record = asRecord(log);
  if (!record) return null;
  const metadata = asRecord(record.metadata) || asRecord(record.logMetadata) || {};
  const eventType = normalizeType(record.eventType || record.event_type || record.kind);
  const toolName = normalizeType(metadata.toolName || metadata.tool_name);
  const isPlanSignal = eventType === "todo_list" || ["todowrite", "todo_write"].includes(toolName);
  if (eventType && !isPlanSignal) return null;
  const steps = parsePlanSteps(record);
  if (!isPlanSignal && steps.length === 0) return null;

  const timestamp = firstString(record, ["createdAt", "created_at", "timestamp", "time"]);
  const timestampMs = Date.parse(timestamp);
  const rawSequence = Number(
    record.sequence || metadata.sequence || metadata.runtimeSequence || metadata.runtime_sequence,
  );
  const actor = asRecord(metadata.actor);
  return {
    steps,
    index,
    sequence: Number.isFinite(rawSequence) ? rawSequence : index,
    timestamp,
    timestampMs: Number.isFinite(timestampMs) ? timestampMs : null,
    actorParticipantId:
      firstString(record, ["actorParticipantId", "actor_participant_id"]) ||
      firstString(metadata, ["actorParticipantId", "actor_participant_id"]),
    agentId:
      firstString(metadata, ["agentId", "agent_id", "workerAgentId", "worker_agent_id"]) ||
      firstString(actor, ["agentId", "agent_id"]),
    runId: firstString(record, ["runId", "run_id"]) || firstString(metadata, ["runId", "run_id"]),
  };
}

function compareSnapshots(left: PlanSnapshot, right: PlanSnapshot): number {
  if (
    left.timestampMs !== null &&
    right.timestampMs !== null &&
    left.timestampMs !== right.timestampMs
  ) {
    return left.timestampMs - right.timestampMs;
  }
  if (left.sequence !== right.sequence) return left.sequence - right.sequence;
  return left.index - right.index;
}

/**
 * Returns the latest worker-authored plan while retaining first-seen and
 * completion timing from earlier todo snapshots. An explicit empty snapshot
 * clears the plan, so consumers can hide the plan hierarchy level reliably.
 */
export function extractRunnerThreadPlanSteps(logs: readonly unknown[]): RunnerThreadPlanStep[] {
  const snapshots = logs
    .map(readSnapshot)
    .filter((snapshot): snapshot is PlanSnapshot => Boolean(snapshot))
    .sort(compareSnapshots);
  const latest = snapshots.at(-1);
  if (!latest || latest.steps.length === 0) return [];

  return latest.steps.map((step, planIndex) => {
    const identity = planStepIdentity(step);
    const history = snapshots.filter((snapshot) =>
      snapshot.steps.some((candidate) => planStepIdentity(candidate) === identity),
    );
    const firstSeen = history[0] || latest;
    const latestSeen = history.at(-1) || latest;
    const completedSnapshot = history.find((snapshot) =>
      snapshot.steps.some(
        (candidate) => planStepIdentity(candidate) === identity && candidate.completed,
      ),
    );
    return {
      id: `plan-step:${step.sourceId || stableHash(identity)}`,
      text: step.text,
      status: step.status,
      completed: step.completed,
      sequence: latest.sequence + (planIndex + 1) / 1000,
      createdAt: firstSeen.timestamp || latest.timestamp,
      updatedAt: latestSeen.timestamp || latest.timestamp,
      completedAt: completedSnapshot?.timestamp || null,
      actorParticipantId: latest.actorParticipantId || firstSeen.actorParticipantId || null,
      agentId: latest.agentId || firstSeen.agentId || null,
      runId: latest.runId || firstSeen.runId || null,
    };
  });
}
