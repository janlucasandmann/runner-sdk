import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRoutingReceipt,
  RunnerThreadRun,
  RunnerThreadRunProjection,
  RunnerThreadTimelineItem,
  RunnerThreadTimelineReference,
} from "./types.js";

function resolveTimelineReference(
  projection: RunnerThreadProjection,
  reference: RunnerThreadTimelineReference,
): RunnerThreadTimelineItem | null {
  if (reference.kind === "message") return projection.messagesById[reference.id] || null;
  if (reference.kind === "run") return projection.runsById[reference.id] || null;
  if (reference.kind === "event") return projection.eventsById[reference.id] || null;
  if (reference.kind === "action") return projection.actionsById[reference.id] || null;
  if (reference.kind === "activity_group") return projection.activityGroupsById[reference.id] || null;
  if (reference.kind === "routing_receipt") return projection.routingReceiptsById[reference.id] || null;
  return projection.permissionsById[reference.id] || null;
}

function bySequence<T extends { sequence: number; createdAt: string }>(left: T, right: T): number {
  const leftTime = Date.parse(left.createdAt || "");
  const rightTime = Date.parse(right.createdAt || "");
  if ((left.sequence === 0 || right.sequence === 0) && Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
    return leftTime - rightTime;
  }
  if (left.sequence !== right.sequence) return left.sequence - right.sequence;
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return leftTime - rightTime;
  return 0;
}

export function selectRunnerThreadTimelineItems(projection: RunnerThreadProjection): RunnerThreadTimelineItem[] {
  return projection.timeline
    .map((reference) => resolveTimelineReference(projection, reference))
    .filter((item): item is RunnerThreadTimelineItem => Boolean(item));
}

export function selectRunnerThreadParticipant(
  projection: RunnerThreadProjection,
  participantId: string | null | undefined,
): RunnerThreadParticipant | null {
  return participantId ? projection.participantsById[participantId] || null : null;
}

export function selectRunnerThreadParticipants(projection: RunnerThreadProjection): RunnerThreadParticipant[] {
  return Object.values(projection.participantsById).sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || "");
    const rightTime = Date.parse(right.createdAt || "");
    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return leftTime - rightTime;
    return left.id.localeCompare(right.id);
  });
}

export function selectRunnerThreadMessages(projection: RunnerThreadProjection): RunnerThreadMessage[] {
  return Object.values(projection.messagesById).sort(bySequence);
}

export function selectRunnerThreadRuns(projection: RunnerThreadProjection): RunnerThreadRun[] {
  return Object.values(projection.runsById).sort(bySequence);
}

export function selectRunnerThreadRun(
  projection: RunnerThreadProjection,
  runId: string | null | undefined,
): RunnerThreadRun | null {
  return runId ? projection.runsById[runId] || null : null;
}

export function isRunnerThreadRunActive(run: RunnerThreadRun): boolean {
  const status = String(run.status || "").toLowerCase();
  return status === "queued"
    || status === "pending"
    || status === "running"
    || status === "parked"
    || status === "waiting"
    || status === "requires_action";
}

export function selectRunnerThreadActiveRuns(projection: RunnerThreadProjection): RunnerThreadRun[] {
  return selectRunnerThreadRuns(projection).filter(isRunnerThreadRunActive);
}

export function selectRunnerThreadChildRuns(projection: RunnerThreadProjection, parentRunId: string): RunnerThreadRun[] {
  return selectRunnerThreadRuns(projection).filter((run) => run.parentRunId === parentRunId);
}

export function selectRunnerThreadActivityGroups(
  projection: RunnerThreadProjection,
  options: { runId?: string | null; parentGroupId?: string | null; includeSuperseded?: boolean } = {},
): RunnerThreadActivityGroup[] {
  const runScoped = Object.values(projection.activityGroupsById)
    .filter((group) => !options.runId || group.runId === options.runId);
  const observerStatus = (group: RunnerThreadActivityGroup): string => {
    const metadata = group.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
    return String(metadata.observerStatus || "");
  };
  const groundedRunIds = new Set(runScoped
    .filter((group) => observerStatus(group) === "grounded")
    .map((group) => group.runId));
  return runScoped
    .filter((group) => options.parentGroupId === undefined || group.parentGroupId === options.parentGroupId)
    .filter((group) => options.includeSuperseded || group.status !== "superseded")
    .filter((group) => (
      !groundedRunIds.has(group.runId)
      || observerStatus(group) === "grounded"
    ))
    .sort((left, right) => left.startSequence - right.startSequence || left.version - right.version || left.id.localeCompare(right.id));
}

export function selectRunnerThreadActivityGroupActions(
  projection: RunnerThreadProjection,
  activityGroupId: string,
): RunnerThreadAction[] {
  const group = projection.activityGroupsById[activityGroupId];
  const explicitIds = new Set(group?.actionIds || []);
  return Object.values(projection.actionsById)
    .filter((action) => action.activityGroupId === activityGroupId || explicitIds.has(action.id))
    .sort(bySequence);
}

export function selectRunnerThreadRunActions(
  projection: RunnerThreadProjection,
  runId: string,
): RunnerThreadAction[] {
  return Object.values(projection.actionsById).filter((action) => action.runId === runId).sort(bySequence);
}

export function selectRunnerThreadRoutingReceipts(
  projection: RunnerThreadProjection,
  messageId?: string | null,
): RunnerThreadRoutingReceipt[] {
  return Object.values(projection.routingReceiptsById)
    .filter((receipt) => !messageId || receipt.messageId === messageId)
    .sort(bySequence);
}

export function selectRunnerThreadLatestRoutingReceipt(
  projection: RunnerThreadProjection,
  messageId: string,
): RunnerThreadRoutingReceipt | null {
  const receipts = selectRunnerThreadRoutingReceipts(projection, messageId);
  return receipts[receipts.length - 1] || null;
}

export function selectRunnerThreadPendingPermissions(
  projection: RunnerThreadProjection,
  runId?: string | null,
): RunnerThreadPermissionRequest[] {
  return Object.values(projection.permissionsById)
    .filter((permission) => String(permission.status).toLowerCase() === "pending")
    .filter((permission) => !runId || permission.runId === runId)
    .sort(bySequence);
}

export function selectRunnerThreadCurrentActivityGroup(
  projection: RunnerThreadProjection,
  runId: string,
): RunnerThreadActivityGroup | null {
  const groups = selectRunnerThreadActivityGroups(projection, { runId });
  const openGroups = groups.filter((group) => group.status === "open");
  return openGroups[openGroups.length - 1] || groups[groups.length - 1] || null;
}

export function selectRunnerThreadRunLiveSummary(
  projection: RunnerThreadProjection,
  runId: string,
): string {
  const currentGroup = selectRunnerThreadCurrentActivityGroup(projection, runId);
  if (currentGroup?.liveSummary) return currentGroup.liveSummary;
  const run = projection.runsById[runId];
  return String(run?.currentSummary || run?.summary || run?.title || "").trim();
}

function nonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function explicitObserverWorkingLabel(event: RunnerThreadProjection["eventsById"][string]): string {
  const producerType = String(event.producer?.type || "").toLowerCase();
  if (producerType !== "observer" && producerType !== "communicator") return "";

  const payload = event.payload || {};
  const projection = recordValue(payload.projection);
  const runProjection = recordValue(payload.runProjection ?? payload.run_projection);
  const records = [payload, projection, runProjection].filter(
    (value): value is Record<string, unknown> => Boolean(value),
  );

  // These fields are an explicit contract: an observer/communicator may opt a
  // concise status sentence into the collapsed run label. Never fall back to
  // `summary` or `currentSummary`; legacy worker/action mirrors update those on
  // every command and would leak low-level execution detail into the chat.
  for (const record of records) {
    for (const key of [
      "workingLabel",
      "working_label",
      "workingSummary",
      "working_summary",
      "headerSummary",
      "header_summary",
      "statusMessage",
      "status_message",
    ]) {
      const candidate = nonEmptyString(record[key]);
      if (candidate) return candidate;
    }
  }

  if (event.type !== "thread.run.projection.updated") return "";
  for (const record of records) {
    const activityTitle = nonEmptyString(
      record.currentActivityGroupTitle ?? record.current_activity_group_title,
    );
    if (activityTitle && activityTitle.toLowerCase() !== "worker run") return activityTitle;
    const phase = nonEmptyString(record.phase);
    if (phase && phase.toLowerCase() !== "worker run") return phase;
  }
  return "";
}

/**
 * Returns only observer/communicator-owned text that is safe for the collapsed
 * active-run label. Worker progress and action summaries deliberately do not
 * participate; callers should render "Working..." until this returns a value.
 */
export function selectRunnerThreadRunWorkingLabel(
  projection: RunnerThreadProjection,
  runId: string,
): string | null {
  const observerEvents = Object.values(projection.eventsById)
    .filter((event) => event.runId === runId)
    .sort(bySequence);
  for (let index = observerEvents.length - 1; index >= 0; index -= 1) {
    const candidate = explicitObserverWorkingLabel(observerEvents[index]);
    if (candidate) return candidate;
  }

  // Hydrated projections can contain activity groups without their source
  // events. Group titles are observer output and intentionally coarser than
  // live/action summaries, so they are the only safe compatibility fallback.
  const groups = selectRunnerThreadActivityGroups(projection, { runId })
    .filter((group) => group.title.trim().toLowerCase() !== "worker run");
  return nonEmptyString(groups[groups.length - 1]?.title) || null;
}

export function selectRunnerThreadRunProjection(
  projection: RunnerThreadProjection,
  runId: string,
): RunnerThreadRunProjection | null {
  const run = projection.runsById[runId];
  if (!run) return null;
  if (run.projection) return run.projection;
  const group = selectRunnerThreadCurrentActivityGroup(projection, runId);
  const summary = group?.liveSummary || run.currentSummary || run.summary || run.title || "";
  return {
    runId,
    threadId: run.threadId,
    sequence: group?.sequence ?? run.sequence,
    status: run.status,
    phase: group?.title || null,
    summary,
    freshnessSequence: group?.endSequence ?? group?.startSequence ?? run.sequence,
    freshnessAt: group?.updatedAt || group?.createdAt || run.updatedAt || run.createdAt,
    highestPermissionRing: group?.highestPermissionRing || run.highestPermissionRing || null,
    counters: {
      activityGroupCount: selectRunnerThreadActivityGroups(projection, { runId }).length,
      actionCount: selectRunnerThreadRunActions(projection, runId).length,
      pendingPermissionCount: selectRunnerThreadPendingPermissions(projection, runId).length,
      childRunCount: selectRunnerThreadChildRuns(projection, runId).length,
    },
    observerModel: group?.observerModel || null,
    metadata: { synthesized: true },
    updatedAt: group?.updatedAt || group?.createdAt || run.updatedAt || run.createdAt,
  };
}
