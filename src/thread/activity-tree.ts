import {
  buildRunnerThreadActivityHierarchy,
  type BuildRunnerThreadActivityHierarchyInput,
  type RunnerThreadActivityHierarchyRecord,
} from "./activity-hierarchy.js";

export interface BuildRunnerThreadActivityTreeInput
  extends Omit<BuildRunnerThreadActivityHierarchyInput, "level"> {}

export interface RunnerThreadActivityTreeRecord
  extends RunnerThreadActivityHierarchyRecord {
  parentId: string | null;
  childIds: string[];
  depth: number;
  order: number;
  expandable: boolean;
}

const MATCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "the",
  "to",
  "with",
]);

function normalizeToken(value: string): string {
  if (value.length > 5 && value.endsWith("ing")) return value.slice(0, -3);
  if (value.length > 4 && value.endsWith("ed")) return value.slice(0, -2);
  if (value.length > 4 && value.endsWith("es")) return value.slice(0, -2);
  if (value.length > 3 && value.endsWith("s")) return value.slice(0, -1);
  return value;
}

function searchableTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map(normalizeToken)
      .filter((token) => token.length > 1 && !MATCH_STOP_WORDS.has(token)),
  );
}

function tokenMatchScore(left: string, right: string): number {
  const leftTokens = searchableTokens(left);
  const rightTokens = searchableTokens(right);
  let score = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) score += 1;
  }
  return score;
}

function readTimestamp(value: string | null | undefined): number | null {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? timestamp : null;
}

function recordTimestamp(record: RunnerThreadActivityHierarchyRecord): number {
  const sequence = Number(record.sequence);
  return (
    readTimestamp(record.endAt) ??
    readTimestamp(record.createdAt) ??
    (Number.isFinite(sequence) ? sequence : 0)
  );
}

function compareRecords(
  left: RunnerThreadActivityHierarchyRecord,
  right: RunnerThreadActivityHierarchyRecord,
): number {
  const leftTime = recordTimestamp(left);
  const rightTime = recordTimestamp(right);
  if (leftTime !== rightTime) return leftTime - rightTime;
  const sequenceDelta = Number(left.sequence || 0) - Number(right.sequence || 0);
  return sequenceDelta || left.id.localeCompare(right.id);
}

function sameRun(
  left: RunnerThreadActivityHierarchyRecord,
  right: RunnerThreadActivityHierarchyRecord,
): boolean {
  const leftRunId = String(left.run?.id || left.planStep?.runId || "").trim();
  const rightRunId = String(right.run?.id || right.planStep?.runId || "").trim();
  return !leftRunId || !rightRunId || leftRunId === rightRunId;
}

function findOwningPlanStep(
  record: RunnerThreadActivityHierarchyRecord,
  planRecords: readonly RunnerThreadActivityHierarchyRecord[],
): RunnerThreadActivityHierarchyRecord | null {
  const candidates = planRecords.filter((planRecord) => sameRun(record, planRecord));
  if (candidates.length === 0) return null;

  const rankedByMeaning = candidates
    .map((planRecord) => ({
      planRecord,
      score: tokenMatchScore(
        `${planRecord.title} ${planRecord.detail} ${planRecord.searchText}`,
        `${record.title} ${record.detail} ${record.searchText}`,
      ),
    }))
    .sort((left, right) => right.score - left.score || compareRecords(left.planRecord, right.planRecord));
  if ((rankedByMeaning[0]?.score || 0) > 0) {
    return rankedByMeaning[0]?.planRecord || null;
  }

  const occurrence = recordTimestamp(record);
  return (
    [...candidates]
      .sort(compareRecords)
      .find((planRecord) => recordTimestamp(planRecord) >= occurrence) ||
    [...candidates].sort(compareRecords).at(-1) ||
    null
  );
}

function uniqueRecords(
  records: readonly RunnerThreadActivityHierarchyRecord[],
): RunnerThreadActivityHierarchyRecord[] {
  return [...new Map(records.map((record) => [record.id, record])).values()];
}

/**
 * Builds the canonical execution tree used by observability surfaces:
 * human messages -> plan steps -> action groups -> atomic tool calls.
 * Missing plan or observer evidence is skipped without inventing a level.
 */
export function buildRunnerThreadActivityTree({
  items,
  participants = [],
  supplementalMessages = [],
  planSteps = [],
}: BuildRunnerThreadActivityTreeInput): RunnerThreadActivityTreeRecord[] {
  const sharedInput = {
    items,
    participants,
    supplementalMessages,
    planSteps,
  };
  const planProjection = buildRunnerThreadActivityHierarchy({
    ...sharedInput,
    level: "plan_steps",
  });
  const groupProjection = buildRunnerThreadActivityHierarchy({
    ...sharedInput,
    level: "groups",
  });
  const toolProjection = buildRunnerThreadActivityHierarchy({
    ...sharedInput,
    level: "tool_calls",
  });

  const messages = groupProjection.filter((record) => record.kind === "message");
  const plans = planProjection.filter((record) => record.kind === "plan_step");
  const groups = groupProjection.filter((record) =>
    record.kind === "activity_group" || record.kind === "run"
  );
  const tools = toolProjection.filter((record) => record.kind === "tool_call");
  const sourceRecords = uniqueRecords([...messages, ...plans, ...groups, ...tools]);
  const sourceById = new Map(sourceRecords.map((record) => [record.id, record]));
  const parentById = new Map<string, string | null>();

  for (const message of messages) parentById.set(message.id, null);
  for (const plan of plans) parentById.set(plan.id, null);

  const groupsBySourceId = new Map(
    groups
      .filter((record) => record.group?.id)
      .map((record) => [String(record.group?.id), record]),
  );
  const fallbackRunGroups = new Map(
    groups
      .filter((record) => record.kind === "run" && record.run?.id)
      .map((record) => [String(record.run?.id), record]),
  );

  for (const group of groups) {
    parentById.set(group.id, findOwningPlanStep(group, plans)?.id || null);
  }

  for (const tool of tools) {
    const directGroup = tool.group?.id
      ? groupsBySourceId.get(String(tool.group.id)) || null
      : null;
    const fallbackRun = tool.run?.id
      ? fallbackRunGroups.get(String(tool.run.id)) || null
      : null;
    const owningPlan = findOwningPlanStep(tool, plans);
    parentById.set(tool.id, directGroup?.id || fallbackRun?.id || owningPlan?.id || null);
  }

  const childrenById = new Map<string, string[]>();
  for (const record of sourceRecords) childrenById.set(record.id, []);
  for (const [recordId, parentId] of parentById) {
    if (!parentId || !sourceById.has(parentId)) continue;
    childrenById.set(parentId, [...(childrenById.get(parentId) || []), recordId]);
  }
  for (const [recordId, childIds] of childrenById) {
    childrenById.set(
      recordId,
      [...childIds].sort((leftId, rightId) =>
        compareRecords(sourceById.get(leftId)!, sourceById.get(rightId)!)
      ),
    );
  }

  const roots = sourceRecords
    .filter((record) => !parentById.get(record.id))
    .sort(compareRecords);
  const flattened: RunnerThreadActivityTreeRecord[] = [];
  const visited = new Set<string>();

  const visit = (record: RunnerThreadActivityHierarchyRecord, depth: number) => {
    if (visited.has(record.id)) return;
    visited.add(record.id);
    const childIds = childrenById.get(record.id) || [];
    flattened.push({
      ...record,
      parentId: parentById.get(record.id) || null,
      childIds,
      depth,
      order: flattened.length,
      expandable: childIds.length > 0,
    });
    for (const childId of childIds) {
      const child = sourceById.get(childId);
      if (child) visit(child, depth + 1);
    }
  };

  for (const root of roots) visit(root, 0);
  for (const record of sourceRecords.sort(compareRecords)) visit(record, 0);
  return flattened;
}

export function flattenRunnerThreadActivityTree(
  records: readonly RunnerThreadActivityTreeRecord[],
  collapsedIds: ReadonlySet<string> = new Set(),
): RunnerThreadActivityTreeRecord[] {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const roots = records.filter((record) => !record.parentId || !recordsById.has(record.parentId));
  const flattened: RunnerThreadActivityTreeRecord[] = [];
  const visited = new Set<string>();

  const visit = (record: RunnerThreadActivityTreeRecord) => {
    if (visited.has(record.id)) return;
    visited.add(record.id);
    flattened.push(record);
    if (collapsedIds.has(record.id)) return;
    for (const childId of record.childIds) {
      const child = recordsById.get(childId);
      if (child) visit(child);
    }
  };

  for (const root of roots.sort((left, right) => left.order - right.order)) visit(root);
  return flattened;
}
