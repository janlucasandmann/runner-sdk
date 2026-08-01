import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadPermissionRing,
  RunnerThreadRun,
  RunnerThreadTimelineItem,
} from "./types.js";

export type RunnerThreadActivityHierarchyLevel =
  | "overview"
  | "groups"
  | "tool_calls";

export type RunnerThreadActivityHierarchyRecordKind =
  | "message"
  | "run"
  | "activity_group"
  | "tool_call";

export type RunnerThreadActivityHierarchyStatus =
  | "default"
  | "running"
  | "success"
  | "error";

export interface RunnerThreadActivityHierarchyRecord {
  id: string;
  level: RunnerThreadActivityHierarchyLevel;
  kind: RunnerThreadActivityHierarchyRecordKind;
  sequence: number;
  title: string;
  detail: string;
  searchText: string;
  status: RunnerThreadActivityHierarchyStatus;
  permissionRing: RunnerThreadPermissionRing | null;
  createdAt: string;
  endAt: string | null;
  actorParticipantId: string | null;
  actor: RunnerThreadParticipant | null;
  message: RunnerThreadMessage | null;
  run: RunnerThreadRun | null;
  group: RunnerThreadActivityGroup | null;
  action: RunnerThreadAction | null;
  actions: RunnerThreadAction[];
}

export interface BuildRunnerThreadActivityHierarchyInput {
  items: readonly RunnerThreadTimelineItem[];
  participants?: readonly RunnerThreadParticipant[];
  supplementalMessages?: readonly RunnerThreadMessage[];
  level?: RunnerThreadActivityHierarchyLevel;
}

const TOOL_ACTION_TYPES = new Set([
  "browser",
  "browser_action",
  "command",
  "command_execution",
  "computer",
  "computer_action",
  "connector",
  "connector_call",
  "function",
  "function_call",
  "http",
  "http_request",
  "mcp",
  "mcp_call",
  "permission",
  "permission_request",
  "shell",
  "tool",
  "tool_call",
  "tool_execution",
]);

const STREAM_FRAGMENT_ACTION_TYPES = new Set([
  "assistant_delta",
  "assistant_text",
  "content_block_delta",
  "content_delta",
  "message_delta",
  "planning",
  "provider_reasoning",
  "reasoning",
  "stream_chunk",
  "text_delta",
  "token",
  "token_delta",
]);

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
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function normalizeType(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.\s-]+/g, "_");
}

function normalizeCopy(value: unknown, fallback = ""): string {
  const copy = String(value || "").replace(/\s+/g, " ").trim();
  return copy || fallback;
}

function toSequence(value: unknown): number {
  const sequence = Number(value);
  return Number.isFinite(sequence) ? sequence : 0;
}

function statusFromValues(
  values: readonly unknown[],
): RunnerThreadActivityHierarchyStatus {
  const statuses = values.map(normalizeType).filter(Boolean);
  if (
    statuses.some((status) =>
      ["failed", "error", "cancelled", "canceled", "denied"].includes(status),
    )
  ) {
    return "error";
  }
  if (
    statuses.some((status) =>
      [
        "queued",
        "pending",
        "running",
        "open",
        "blocked",
        "parked",
        "waiting",
        "waiting_permission",
        "requires_action",
      ].includes(status),
    )
  ) {
    return "running";
  }
  if (
    statuses.some((status) =>
      ["completed", "complete", "succeeded", "success", "done", "sealed"].includes(
        status,
      ),
    )
  ) {
    return "success";
  }
  return "default";
}

function highestPermissionRing(
  ...values: Array<number | null | undefined>
): RunnerThreadPermissionRing | null {
  const normalized = values
    .map(Number)
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 3);
  return normalized.length > 0
    ? (Math.max(...normalized) as RunnerThreadPermissionRing)
    : null;
}

function readToolCallIdentity(action: RunnerThreadAction): string {
  const metadata = asRecord(action.metadata);
  return firstString(metadata, [
    "toolId",
    "tool_id",
    "toolCallId",
    "tool_call_id",
    "callId",
    "call_id",
    "toolUseId",
    "tool_use_id",
    "requestId",
    "request_id",
    "runtimeEventId",
    "runtime_event_id",
  ]);
}

const GENERIC_TOOL_LABELS = new Set([
  "action",
  "command",
  "command_execution",
  "executed_unknown",
  "function",
  "function_call",
  "recorded_action",
  "tool",
  "tool_call",
  "tool_execution",
  "unknown",
  "unknown_tool",
]);

function meaningfulToolLabel(value: unknown): string {
  const label = normalizeCopy(value);
  if (!label) return "";
  const normalized = normalizeType(label);
  if (
    GENERIC_TOOL_LABELS.has(normalized) ||
    normalized.endsWith("_unknown") ||
    normalized.startsWith("unknown_")
  ) {
    return "";
  }
  return label;
}

function toolMetadataRecords(action: RunnerThreadAction): Record<string, unknown>[] {
  const metadata = asRecord(action.metadata);
  const input = asRecord(action.input);
  return [
    metadata,
    asRecord(metadata?.tool),
    asRecord(metadata?.action),
    asRecord(metadata?.payload),
    asRecord(metadata?.event),
    asRecord(metadata?.runtime),
    input,
  ].filter((record): record is Record<string, unknown> => Boolean(record));
}

function readExplicitToolIdentity(action: RunnerThreadAction): string {
  const directName = meaningfulToolLabel(action.toolName);
  if (directName) return directName;
  for (const record of toolMetadataRecords(action)) {
    const name = meaningfulToolLabel(firstString(record, [
      "toolName",
      "tool_name",
      "tool",
      "actionName",
      "action_name",
      "functionName",
      "function_name",
      "command",
    ]));
    if (name) return name;
  }
  return "";
}

function readMeaningfulToolIdentity(action: RunnerThreadAction): string {
  const explicitIdentity = readExplicitToolIdentity(action);
  if (explicitIdentity) return explicitIdentity;
  return meaningfulToolLabel(action.title);
}

function resolveToolActionTitle(action: RunnerThreadAction): string {
  const descriptiveTitle = meaningfulToolLabel(action.title);
  if (descriptiveTitle && normalizeType(action.type) !== "action_summary") {
    return descriptiveTitle;
  }
  const identity = readMeaningfulToolIdentity(action);
  if (identity) return identity;
  const type = normalizeType(action.type);
  if (["command", "command_execution", "shell"].includes(type)) return "Command";
  if (["connector", "connector_call"].includes(type)) return "Connector call";
  if (["function", "function_call"].includes(type)) return "Function call";
  if (["http", "http_request"].includes(type)) return "HTTP request";
  if (["mcp", "mcp_call"].includes(type)) return "MCP call";
  return "Tool call";
}

function isToolStartAction(action: RunnerThreadAction): boolean {
  if (normalizeType(action.type) !== "action_summary") return false;
  const metadata = asRecord(action.metadata);
  const status = normalizeType(firstString(metadata, ["status", "state", "grokToolStatus"]));
  return Boolean(
    readMeaningfulToolIdentity(action) &&
    (
      metadata?.isToolStarted === true ||
      Boolean(firstString(metadata, ["toolId", "tool_id", "toolCallId", "tool_call_id"])) ||
      ["proposed", "queued", "running", "started"].includes(status)
    )
  );
}

function actionChronology(action: RunnerThreadAction): number {
  const sequence = toSequence(action.sequence);
  if (sequence > 0) return sequence;
  const metadata = asRecord(action.metadata);
  const runtimeSequence = Number(
    metadata?.runtimeSequence ?? metadata?.runtime_sequence ?? metadata?.sequence,
  );
  if (Number.isFinite(runtimeSequence) && runtimeSequence > 0) return runtimeSequence;
  const timestamp = Date.parse(action.startedAt || action.createdAt || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function isRunnerThreadToolAction(action: RunnerThreadAction): boolean {
  const type = normalizeType(action.type);
  const metadata = asRecord(action.metadata);
  const source = normalizeType(firstString(metadata, ["source", "eventType", "event_type"]));
  if (
    STREAM_FRAGMENT_ACTION_TYPES.has(type) ||
    STREAM_FRAGMENT_ACTION_TYPES.has(source)
  ) {
    return false;
  }
  if (type === "action_summary") {
    return isToolStartAction(action);
  }
  if (readExplicitToolIdentity(action)) {
    return true;
  }
  return TOOL_ACTION_TYPES.has(type);
}

function actionReplacementScore(action: RunnerThreadAction): number {
  const status = normalizeType(action.status);
  const terminal = ["completed", "succeeded", "success", "failed", "error"].includes(status);
  return (
    (terminal ? 100 : 0) +
    (action.completedAt ? 20 : 0) +
    (action.output !== undefined && action.output !== null ? 10 : 0) +
    toSequence(action.sequence) / 1_000_000
  );
}

function dedupeToolActions(actions: readonly RunnerThreadAction[]): RunnerThreadAction[] {
  const orderedCandidates = actions
    .filter(isRunnerThreadToolAction)
    .sort((left, right) => actionChronology(left) - actionChronology(right));
  const pairedCandidates: RunnerThreadAction[] = [];
  const pendingStartIndexes: number[] = [];

  for (const action of orderedCandidates) {
    if (isToolStartAction(action)) {
      pendingStartIndexes.push(pairedCandidates.length);
      pairedCandidates.push(action);
      continue;
    }

    if (!readMeaningfulToolIdentity(action)) {
      const actionPosition = actionChronology(action);
      const pendingPosition = [...pendingStartIndexes].reverse().find((index) => {
        const pending = pairedCandidates[index];
        if (!pending || pending.runId !== action.runId) return false;
        const delta = actionPosition - actionChronology(pending);
        return delta >= 0 && delta <= 128;
      });
      if (pendingPosition !== undefined) {
        const started = pairedCandidates[pendingPosition];
        pairedCandidates[pendingPosition] = {
          ...started,
          status: action.status || started.status,
          output: action.output ?? started.output,
          completedAt: action.completedAt || action.createdAt || started.completedAt,
          updatedAt: action.updatedAt || action.completedAt || action.createdAt || started.updatedAt,
          metadata: {
            ...(action.metadata || {}),
            ...(started.metadata || {}),
            completionActionId: action.id,
          },
        };
        pendingStartIndexes.splice(pendingStartIndexes.indexOf(pendingPosition), 1);
        continue;
      }
    }

    pairedCandidates.push(action);
  }

  const byIdentity = new Map<string, RunnerThreadAction>();
  for (const action of pairedCandidates) {
    const explicitIdentity = readToolCallIdentity(action);
    const identity = explicitIdentity ? `call:${explicitIdentity}` : `action:${action.id}`;
    const previous = byIdentity.get(identity);
    if (!previous || actionReplacementScore(action) >= actionReplacementScore(previous)) {
      byIdentity.set(identity, action);
    }
  }
  return [...byIdentity.values()].sort(
    (left, right) => actionChronology(left) - actionChronology(right),
  );
}

function isFallbackGroup(group: RunnerThreadActivityGroup): boolean {
  const metadata = asRecord(group.metadata);
  const source = normalizeType(
    firstString(metadata, ["observerStatus", "observer_status", "source", "projectionSource"]),
  );
  return (
    source.includes("fallback") ||
    source.includes("legacy") ||
    source.includes("synthetic") ||
    normalizeType(group.id).includes("fallback")
  );
}

function isGenericGroupTitle(value: unknown): boolean {
  const title = normalizeType(value);
  return !title || ["activity", "activity_group", "worker", "worker_run", "run"].includes(title);
}

function groupHasSemanticContent(
  group: RunnerThreadActivityGroup,
  actions: readonly RunnerThreadAction[],
): boolean {
  return (
    actions.length > 0 ||
    !isGenericGroupTitle(group.title) ||
    Boolean(normalizeCopy(group.liveSummary) || normalizeCopy(group.rationale))
  );
}

function resolveMetadataAgentId(value: { metadata?: Record<string, unknown> | null }): string {
  const source = asRecord(value);
  const metadata = asRecord(value.metadata);
  const actor = asRecord(metadata?.actor);
  return (
    firstString(source, [
      "agentId",
      "agent_id",
      "workerAgentId",
      "worker_agent_id",
      "assistantId",
      "assistant_id",
    ]) || firstString(metadata, [
      "agentId",
      "agent_id",
      "workerAgentId",
      "worker_agent_id",
      "assistantId",
      "assistant_id",
    ]) || firstString(actor, ["agentId", "agent_id"])
  );
}

function resolveActor(
  participantId: string | null | undefined,
  agentId: string,
  participantsById: ReadonlyMap<string, RunnerThreadParticipant>,
  participantsByAgentId: ReadonlyMap<string, RunnerThreadParticipant>,
): RunnerThreadParticipant | null {
  const direct = participantId ? participantsById.get(participantId) : null;
  if (direct) return direct;
  return agentId ? participantsByAgentId.get(agentId) || null : null;
}

function resolveActionActor(
  action: RunnerThreadAction | null,
  run: RunnerThreadRun | null,
  participantsById: ReadonlyMap<string, RunnerThreadParticipant>,
  participantsByAgentId: ReadonlyMap<string, RunnerThreadParticipant>,
): RunnerThreadParticipant | null {
  return resolveActor(
    action?.actorParticipantId || run?.actorParticipantId,
    (action && resolveMetadataAgentId(action)) || (run && resolveMetadataAgentId(run)) || "",
    participantsById,
    participantsByAgentId,
  );
}

function createSearchText(values: readonly unknown[]): string {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => normalizeCopy(value))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildMessageRecord(
  message: RunnerThreadMessage,
  level: RunnerThreadActivityHierarchyLevel,
  actor: RunnerThreadParticipant | null,
): RunnerThreadActivityHierarchyRecord {
  const detail = normalizeCopy(message.content);
  const actorName = normalizeCopy(actor?.displayName, "User");
  return {
    id: `message:${message.id}`,
    level,
    kind: "message",
    sequence: toSequence(message.sequence),
    title: "User message",
    detail,
    searchText: createSearchText(["User message", detail, actorName]),
    status: statusFromValues([message.status]),
    permissionRing: null,
    createdAt: message.createdAt,
    endAt: message.updatedAt || null,
    actorParticipantId: message.authorParticipantId || null,
    actor,
    message,
    run: null,
    group: null,
    action: null,
    actions: [],
  };
}

function isHumanMessage(
  message: RunnerThreadMessage,
  participant: RunnerThreadParticipant | null,
): boolean {
  const metadata = asRecord(message.metadata);
  const role = normalizeType(firstString(metadata, ["role", "authorRole", "author_role"]));
  const participantKind = normalizeType(participant?.kind);
  return (
    participantKind === "human" ||
    ["user", "human", "customer", "email"].includes(role) ||
    /(?:^|[:_-])(human|user)(?:$|[:_-])/i.test(message.authorParticipantId)
  );
}

function uniqueMessages(
  timelineMessages: readonly RunnerThreadMessage[],
  supplementalMessages: readonly RunnerThreadMessage[],
): RunnerThreadMessage[] {
  const byId = new Map<string, RunnerThreadMessage>();
  for (const message of [...timelineMessages, ...supplementalMessages]) {
    const id = normalizeCopy(message?.id);
    if (!id) continue;
    const previous = byId.get(id);
    if (!previous || normalizeCopy(message.content).length >= normalizeCopy(previous.content).length) {
      byId.set(id, message);
    }
  }
  return [...byId.values()];
}

export function buildRunnerThreadActivityHierarchy({
  items,
  participants = [],
  supplementalMessages = [],
  level = "overview",
}: BuildRunnerThreadActivityHierarchyInput): RunnerThreadActivityHierarchyRecord[] {
  const participantsById = new Map(
    participants.filter((participant) => participant?.id).map((participant) => [participant.id, participant]),
  );
  const participantsByAgentId = new Map(
    participants
      .filter((participant) => participant?.agentId)
      .map((participant) => [String(participant.agentId), participant]),
  );
  const runs = items.filter((item): item is RunnerThreadRun => item?.kind === "run");
  const actions = items.filter((item): item is RunnerThreadAction => item?.kind === "action");
  const actionsById = new Map(actions.map((action) => [action.id, action]));
  const actionsByGroupId = new Map<string, RunnerThreadAction[]>();
  for (const action of actions) {
    const groupId = normalizeCopy(action.activityGroupId);
    if (!groupId) continue;
    const groupActions = actionsByGroupId.get(groupId) || [];
    groupActions.push(action);
    actionsByGroupId.set(groupId, groupActions);
  }

  const latestGroupsById = new Map<string, RunnerThreadActivityGroup>();
  for (const item of items) {
    if (item?.kind !== "activity_group" || item.status === "superseded") continue;
    const previous = latestGroupsById.get(item.id);
    if (!previous || item.version >= previous.version) {
      latestGroupsById.set(item.id, item);
    }
  }
  const groups = [...latestGroupsById.values()];
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const childIdsByGroupId = new Map<string, Set<string>>();
  for (const group of groups) {
    const childIds = childIdsByGroupId.get(group.id) || new Set<string>();
    for (const childId of group.childGroupIds || []) {
      if (groupsById.has(childId)) childIds.add(childId);
    }
    childIdsByGroupId.set(group.id, childIds);
    if (group.parentGroupId && groupsById.has(group.parentGroupId)) {
      const parentChildren = childIdsByGroupId.get(group.parentGroupId) || new Set<string>();
      parentChildren.add(group.id);
      childIdsByGroupId.set(group.parentGroupId, parentChildren);
    }
  }

  const groupActionsCache = new Map<string, RunnerThreadAction[]>();
  const collectGroupActions = (groupId: string, visited = new Set<string>()): RunnerThreadAction[] => {
    if (groupActionsCache.has(groupId)) return groupActionsCache.get(groupId) || [];
    if (visited.has(groupId)) return [];
    visited.add(groupId);
    const group = groupsById.get(groupId);
    if (!group) return [];
    const collected = new Map<string, RunnerThreadAction>();
    for (const actionId of group.actionIds || []) {
      const action = actionsById.get(actionId);
      if (action) collected.set(action.id, action);
    }
    for (const action of actionsByGroupId.get(groupId) || []) {
      collected.set(action.id, action);
    }
    for (const childId of childIdsByGroupId.get(groupId) || []) {
      for (const action of collectGroupActions(childId, new Set(visited))) {
        collected.set(action.id, action);
      }
    }
    const result = [...collected.values()].sort(
      (left, right) => toSequence(left.sequence) - toSequence(right.sequence),
    );
    groupActionsCache.set(groupId, result);
    return result;
  };

  const selectSemanticLeafGroups = (runId: string): RunnerThreadActivityGroup[] => {
    const runGroups = groups.filter((group) => group.runId === runId);
    const leafGroups = runGroups.filter(
      (group) => (childIdsByGroupId.get(group.id)?.size || 0) === 0,
    );
    const meaningfulGrounded = leafGroups.filter((group) => {
      const groupActions = collectGroupActions(group.id);
      return !isFallbackGroup(group) && groupHasSemanticContent(group, groupActions);
    });
    const meaningfulFallback = leafGroups.filter((group) => {
      const groupActions = collectGroupActions(group.id);
      return isFallbackGroup(group) && groupHasSemanticContent(group, groupActions);
    });
    const meaningfulLeaves = leafGroups.filter((group) =>
      groupHasSemanticContent(group, collectGroupActions(group.id)),
    );
    const selected = meaningfulGrounded.length > 0
      ? meaningfulGrounded
      : meaningfulFallback.length > 0
        ? meaningfulFallback
        : meaningfulLeaves;
    return [...selected].sort(
      (left, right) =>
        toSequence(left.startSequence || left.sequence) -
        toSequence(right.startSequence || right.sequence),
    );
  };

  const resolveToolActionGroup = (
    action: RunnerThreadAction,
    selectedGroups: readonly RunnerThreadActivityGroup[],
  ): RunnerThreadActivityGroup | null => {
    const directGroup = action.activityGroupId
      ? groupsById.get(action.activityGroupId) || null
      : null;
    if (directGroup && selectedGroups.some((group) => group.id === directGroup.id)) {
      return directGroup;
    }
    if (directGroup) {
      const containingLeaf = selectedGroups.find((group) =>
        collectGroupActions(group.id).some((candidate) => candidate.id === action.id),
      );
      if (containingLeaf) return containingLeaf;
    }

    const position = actionChronology(action);
    if (position <= 0 || selectedGroups.length === 0) return directGroup;
    const containingGroups = selectedGroups.filter((group) => {
      const start = toSequence(group.startSequence || group.sequence);
      const end = group.endSequence === null || group.endSequence === undefined
        ? Number.POSITIVE_INFINITY
        : toSequence(group.endSequence);
      return position >= start && position <= end;
    });
    if (containingGroups.length > 0) {
      return containingGroups[containingGroups.length - 1] || directGroup;
    }
    return selectedGroups.reduce<RunnerThreadActivityGroup | null>((closest, group) => {
      if (!closest) return group;
      const distanceTo = (candidate: RunnerThreadActivityGroup) => {
        const start = toSequence(candidate.startSequence || candidate.sequence);
        const end = candidate.endSequence === null || candidate.endSequence === undefined
          ? start
          : toSequence(candidate.endSequence);
        return Math.min(Math.abs(position - start), Math.abs(position - end));
      };
      return distanceTo(group) < distanceTo(closest) ? group : closest;
    }, null);
  };

  const timelineMessages = items.filter(
    (item): item is RunnerThreadMessage => item?.kind === "message",
  );
  const messageRecords = uniqueMessages(timelineMessages, supplementalMessages)
    .map((message) => {
      const actor = resolveActor(
        message.authorParticipantId,
        resolveMetadataAgentId(message),
        participantsById,
        participantsByAgentId,
      );
      return isHumanMessage(message, actor) ? buildMessageRecord(message, level, actor) : null;
    })
    .filter((record): record is RunnerThreadActivityHierarchyRecord => Boolean(record));

  const records: RunnerThreadActivityHierarchyRecord[] = [...messageRecords];

  if (level === "overview") {
    for (const run of runs) {
      const runGroups = groups.filter((group) => group.runId === run.id);
      const runActions = actions
        .filter((action) => action.runId === run.id)
        .sort((left, right) => toSequence(left.sequence) - toSequence(right.sequence));
      const firstAction = runActions.find((action) => action.actorParticipantId) || runActions[0] || null;
      const actor = resolveActionActor(firstAction, run, participantsById, participantsByAgentId);
      const projectionSummary = normalizeCopy(run.projection?.summary);
      const groupSummary = runGroups
        .map((group) => normalizeCopy(group.liveSummary || group.rationale))
        .find(Boolean) || "";
      const title = normalizeCopy(run.title, run.runKind === "worker" ? "Agent run" : "Thread run");
      const detail = normalizeCopy(
        run.currentSummary || projectionSummary || run.summary || groupSummary,
      );
      records.push({
        id: `run:${run.id}`,
        level,
        kind: "run",
        sequence: toSequence(run.sequence),
        title,
        detail,
        searchText: createSearchText([
          title,
          detail,
          actor?.displayName,
          runActions.map((action) => [action.title, action.summary, action.toolName]),
        ]),
        status: statusFromValues([run.status, run.projection?.status]),
        permissionRing: highestPermissionRing(
          run.highestPermissionRing,
          ...runActions.map((action) => action.permissionRing),
        ),
        createdAt: run.startedAt || run.queuedAt || run.createdAt,
        endAt: run.completedAt || run.updatedAt || null,
        actorParticipantId: actor?.id || run.actorParticipantId || null,
        actor,
        message: null,
        run,
        group: null,
        action: null,
        actions: runActions,
      });
    }
  } else if (level === "groups") {
    for (const run of runs) {
      const selectedGroups = selectSemanticLeafGroups(run.id);

      if (selectedGroups.length === 0) {
        const actor = resolveActionActor(null, run, participantsById, participantsByAgentId);
        records.push({
          id: `run:${run.id}`,
          level,
          kind: "run",
          sequence: toSequence(run.sequence),
          title: normalizeCopy(run.title, "Agent run"),
          detail: normalizeCopy(run.currentSummary || run.projection?.summary || run.summary),
          searchText: createSearchText([run.title, run.currentSummary, run.summary, actor?.displayName]),
          status: statusFromValues([run.status]),
          permissionRing: highestPermissionRing(run.highestPermissionRing),
          createdAt: run.startedAt || run.createdAt,
          endAt: run.completedAt || run.updatedAt || null,
          actorParticipantId: actor?.id || run.actorParticipantId || null,
          actor,
          message: null,
          run,
          group: null,
          action: null,
          actions: [],
        });
      }

      const inferredToolActionsByGroupId = new Map<string, RunnerThreadAction[]>();
      for (const action of dedupeToolActions(actions.filter((item) => item.runId === run.id))) {
        const inferredGroup = resolveToolActionGroup(action, selectedGroups);
        if (!inferredGroup) continue;
        inferredToolActionsByGroupId.set(inferredGroup.id, [
          ...(inferredToolActionsByGroupId.get(inferredGroup.id) || []),
          action,
        ]);
      }

      for (const group of selectedGroups) {
        const groupActions = collectGroupActions(group.id);
        const groupToolActions = dedupeToolActions([
          ...groupActions,
          ...(inferredToolActionsByGroupId.get(group.id) || []),
        ]);
        const actorAction = [...groupActions, ...groupToolActions].find((action) => action.actorParticipantId)
          || groupToolActions[0]
          || groupActions[0]
          || null;
        const actor = resolveActionActor(actorAction, run, participantsById, participantsByAgentId);
        const title = normalizeCopy(group.title, "Activity group");
        const detail = normalizeCopy(
          group.liveSummary || group.rationale || run.currentSummary || run.summary,
        );
        records.push({
          id: `group:${group.id}`,
          level,
          kind: "activity_group",
          sequence: toSequence(group.startSequence || group.sequence),
          title,
          detail,
          searchText: createSearchText([
            title,
            detail,
            actor?.displayName,
            groupToolActions.map((action) => [action.title, action.summary, action.toolName]),
          ]),
          status: statusFromValues([
            group.status,
            run.status,
            ...groupToolActions.map((action) => action.status),
          ]),
          permissionRing: highestPermissionRing(
            group.highestPermissionRing,
            ...groupToolActions.map((action) => action.permissionRing),
          ),
          createdAt: group.createdAt || run.startedAt || run.createdAt,
          endAt: group.sealedAt || group.updatedAt || run.completedAt || null,
          actorParticipantId: actor?.id || actorAction?.actorParticipantId || run.actorParticipantId || null,
          actor,
          message: null,
          run,
          group,
          action: null,
          actions: groupToolActions,
        });
      }
    }
  } else {
    for (const run of runs) {
      const selectedGroups = selectSemanticLeafGroups(run.id);
      const runToolActions = dedupeToolActions(
        actions.filter((action) => action.runId === run.id),
      );
      const groupedActions = new Map<string, RunnerThreadAction[]>();
      const ungroupedActions: RunnerThreadAction[] = [];
      for (const action of runToolActions) {
        const group = resolveToolActionGroup(action, selectedGroups);
        if (!group) {
          ungroupedActions.push(action);
          continue;
        }
        groupedActions.set(group.id, [...(groupedActions.get(group.id) || []), action]);
      }

      const orderedActions = [
        ...selectedGroups.flatMap((group) => groupedActions.get(group.id) || []),
        ...ungroupedActions,
      ];
      for (const action of orderedActions) {
        const group = resolveToolActionGroup(action, selectedGroups);
        const actor = resolveActionActor(action, run, participantsById, participantsByAgentId);
        const title = resolveToolActionTitle(action);
        const detail = normalizeCopy(action.summary || group?.title);
        records.push({
          id: `action:${action.id}`,
          level,
          kind: "tool_call",
          sequence: actionChronology(action),
          title,
          detail,
          searchText: createSearchText([
            title,
            detail,
            action.toolName,
            group?.title,
            group?.liveSummary,
            actor?.displayName,
          ]),
          status: statusFromValues([action.status]),
          permissionRing: highestPermissionRing(action.permissionRing, group?.highestPermissionRing),
          createdAt: action.startedAt || action.createdAt,
          endAt: action.completedAt || action.updatedAt || null,
          actorParticipantId: actor?.id || action.actorParticipantId || run.actorParticipantId || null,
          actor,
          message: null,
          run,
          group,
          action,
          actions: [action],
        });
      }
    }
  }

  return records.sort(
    (left, right) =>
      left.sequence - right.sequence ||
      Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
      left.id.localeCompare(right.id),
  );
}
