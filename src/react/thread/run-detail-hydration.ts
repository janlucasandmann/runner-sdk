import type { RunnerClient } from "../../client.js";
import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadProjection,
  RunnerThreadTimelineItem,
} from "../../thread/types.js";

export type RunnerThreadDetailLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface RunnerThreadDetailLoadState {
  status: RunnerThreadDetailLoadStatus;
  error: string | null;
  loadedCount?: number;
  truncated?: boolean;
}

export interface RunnerThreadDetailRequestOptions {
  backendUrl: string;
  threadId: string;
  headers?: HeadersInit;
  organizationId?: string;
  credentials?: RequestCredentials;
}

export interface RunnerThreadRunDetailBatch {
  items: RunnerThreadTimelineItem[];
  groupCount: number;
  actionCount: number;
  groupsTruncated: boolean;
  actionsTruncated: boolean;
}

export interface RunnerThreadActivityGroupActionBatch {
  actions: RunnerThreadAction[];
  truncated: boolean;
}

const RUN_GROUP_LIMIT = 500;
const RUN_ACTION_PAGE_SIZE = 500;
// The run card needs a small useful window from the latest observer phase, not
// every action in a long trace. Group rows hydrate their own evidence below.
const RUN_ACTION_LIMIT = 1_000;
const GROUP_ACTION_LIMIT = 500;
export const RUNNER_THREAD_LIVE_DETAIL_LIMIT = 1_000;

export interface RunnerThreadDetailRequestRegistry {
  run: (key: string, loader: () => Promise<void>) => Promise<void>;
  isLoaded: (key: string) => boolean;
  reset: () => void;
}

/** Coalesces identical expansion requests and remembers successful loads. */
export function createRunnerThreadDetailRequestRegistry(): RunnerThreadDetailRequestRegistry {
  const inFlight = new Map<string, Promise<void>>();
  const loaded = new Set<string>();
  let generation = 0;

  return {
    run(key, loader) {
      if (loaded.has(key)) return Promise.resolve();
      const existing = inFlight.get(key);
      if (existing) return existing;
      const requestGeneration = generation;
      let request: Promise<void>;
      request = Promise.resolve()
        .then(loader)
        .then(() => {
          if (generation === requestGeneration) loaded.add(key);
        })
        .finally(() => {
          if (inFlight.get(key) === request) inFlight.delete(key);
        });
      inFlight.set(key, request);
      return request;
    },
    isLoaded(key) {
      return loaded.has(key);
    },
    reset() {
      generation += 1;
      inFlight.clear();
      loaded.clear();
    },
  };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

/**
 * Merges nested run evidence without adding hidden top-level timeline anchors.
 * One copy per lookup table keeps a 500-action group hydration linear.
 */
export function mergeRunnerThreadDetailItems(
  projection: RunnerThreadProjection,
  items: RunnerThreadTimelineItem[],
): RunnerThreadProjection {
  const actions = items.filter((item): item is RunnerThreadAction => item.kind === "action");
  const groups = items.filter((item): item is RunnerThreadActivityGroup => item.kind === "activity_group");
  if (actions.length === 0 && groups.length === 0) return projection;
  const actionsById = actions.length > 0 ? { ...projection.actionsById } : projection.actionsById;
  const activityGroupsById = groups.length > 0 ? { ...projection.activityGroupsById } : projection.activityGroupsById;

  for (const action of actions) {
    const previous = actionsById[action.id];
    actionsById[action.id] = previous ? {
      ...previous,
      ...action,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
      touchedResources: action.touchedResources?.length ? action.touchedResources : previous.touchedResources,
      metadata: { ...(previous.metadata || {}), ...(action.metadata || {}), detailHydrated: true },
    } : {
      ...action,
      metadata: { ...(action.metadata || {}), detailHydrated: true },
    };
  }
  for (const group of groups) {
    const previous = activityGroupsById[group.id];
    if (previous && group.version < previous.version) continue;
    activityGroupsById[group.id] = previous ? {
      ...previous,
      ...group,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
      childGroupIds: Array.from(new Set([...(previous.childGroupIds || []), ...(group.childGroupIds || [])])),
      actionIds: Array.from(new Set([...(previous.actionIds || []), ...(group.actionIds || [])])),
      eventIds: Array.from(new Set([...(previous.eventIds || []), ...(group.eventIds || [])])),
      metrics: previous.metrics || group.metrics ? { ...(previous.metrics || {}), ...(group.metrics || {}) } : null,
      metadata: { ...(previous.metadata || {}), ...(group.metadata || {}), detailHydrated: true },
    } : {
      ...group,
      metadata: { ...(group.metadata || {}), detailHydrated: true },
    };
  }

  return { ...projection, actionsById, activityGroupsById };
}

/**
 * Bounds raw live detail in the hook while preserving public reducer snapshot
 * semantics. User-hydrated evidence and actionable/error rows stay resident.
 */
export function compactRunnerThreadLiveProjection(
  projection: RunnerThreadProjection,
  limit = RUNNER_THREAD_LIVE_DETAIL_LIMIT,
): RunnerThreadProjection {
  const boundedLimit = Math.max(1, Math.floor(limit));
  const runScopedActions = Object.values(projection.actionsById).filter((action) => Boolean(action.runId));
  const runScopedEvents = Object.values(projection.eventsById).filter((event) => Boolean(event.runId));
  if (runScopedActions.length <= boundedLimit && runScopedEvents.length <= boundedLimit) return projection;

  const protectedActionIds = new Set<string>();
  const protectedEventIds = new Set<string>();
  for (const action of runScopedActions) {
    if (
      ["queued", "pending", "running", "failed", "blocked"].includes(action.status)
      || action.metadata?.detailHydrated === true
    ) protectedActionIds.add(action.id);
  }
  for (const group of Object.values(projection.activityGroupsById)) {
    if (group.status !== "open") continue;
    for (const actionId of group.actionIds) protectedActionIds.add(actionId);
    for (const eventId of group.eventIds || []) protectedEventIds.add(eventId);
  }
  for (const permission of Object.values(projection.permissionsById)) {
    if (permission.actionId) protectedActionIds.add(permission.actionId);
    if (permission.sourceEventId) protectedEventIds.add(permission.sourceEventId);
  }
  for (const event of runScopedEvents) {
    const payloadStatus = String(event.payload.status || event.payload.state || "").toLowerCase();
    if (
      ["queued", "pending", "running", "failed", "blocked", "requires_action"].includes(payloadStatus)
      || /(?:failed|blocked|permission\.requested)$/.test(event.type.toLowerCase())
    ) protectedEventIds.add(event.id);
  }

  const newestActions = [...runScopedActions]
    .sort((left, right) => right.sequence - left.sequence || right.createdAt.localeCompare(left.createdAt))
    .slice(0, boundedLimit);
  for (const action of newestActions) protectedActionIds.add(action.id);
  for (const actionId of protectedActionIds) {
    const sourceEventId = projection.actionsById[actionId]?.sourceEventId;
    if (sourceEventId) protectedEventIds.add(sourceEventId);
  }
  const newestEvents = [...runScopedEvents]
    .sort((left, right) => right.sequence - left.sequence || right.createdAt.localeCompare(left.createdAt))
    .slice(0, boundedLimit);
  for (const event of newestEvents) protectedEventIds.add(event.id);

  const actionsById = Object.fromEntries(Object.entries(projection.actionsById).filter(([id]) => protectedActionIds.has(id)));
  const eventsById = Object.fromEntries(Object.entries(projection.eventsById).filter(([id, event]) => !event.runId || protectedEventIds.has(id)));
  const timeline = projection.timeline.filter((reference) => (
    reference.kind !== "action" && reference.kind !== "event"
  ) || (
    reference.kind === "action" ? Boolean(actionsById[reference.id]) : Boolean(eventsById[reference.id])
  ));
  return { ...projection, actionsById, eventsById, timeline };
}

/** Loads a bounded run overview. Deep action evidence remains group-lazy. */
export async function fetchRunnerThreadRunDetailBatch(
  client: RunnerClient,
  request: RunnerThreadDetailRequestOptions,
  runId: string,
): Promise<RunnerThreadRunDetailBatch> {
  const rawGroups = await client.listThreadActivityGroups({
    ...request,
    runId,
    limit: RUN_GROUP_LIMIT,
  });
  const groups = uniqueById(rawGroups);
  const boundedGroups = groups.slice(-RUN_GROUP_LIMIT);
  const latestGroup = [...boundedGroups]
    .sort((left, right) => right.startSequence - left.startSequence || right.sequence - left.sequence)[0];
  const actionBatch = await (async () => {
    if (!latestGroup) return { actions: [] as RunnerThreadAction[], truncated: false };
    const actions: RunnerThreadAction[] = [];
    let after: number | undefined = Math.max(0, latestGroup.startSequence - 1);
    let reachedServerEnd = false;

    while (actions.length < RUN_ACTION_LIMIT) {
      const remaining = RUN_ACTION_LIMIT - actions.length;
      const pageLimit = Math.min(RUN_ACTION_PAGE_SIZE, remaining);
      const page = await client.listThreadActions({ ...request, runId, after, limit: pageLimit });
      actions.push(...page);
      if (page.length < pageLimit) {
        reachedServerEnd = true;
        break;
      }
      const nextAfter: number = page.reduce<number>(
        (highest, action) => Math.max(highest, action.sequence),
        after ?? -1,
      );
      if (!Number.isSafeInteger(nextAfter) || nextAfter <= (after ?? -1)) break;
      after = nextAfter;
    }

    return {
      actions: uniqueById(actions).slice(0, RUN_ACTION_LIMIT),
      truncated: !reachedServerEnd && actions.length >= RUN_ACTION_LIMIT,
    };
  })();
  return {
    items: [...boundedGroups, ...actionBatch.actions],
    groupCount: boundedGroups.length,
    actionCount: actionBatch.actions.length,
    // The current list client unwraps the server envelope, so an exact-limit
    // page may still have an undisclosed next page. Be conservative in the UI.
    groupsTruncated: groups.length >= RUN_GROUP_LIMIT,
    actionsTruncated: actionBatch.truncated,
  };
}

/** Loads only one causal group's action evidence, capped by the API contract. */
export async function fetchRunnerThreadActivityGroupActionBatch(
  client: RunnerClient,
  request: RunnerThreadDetailRequestOptions,
  groupId: string,
  runId: string,
): Promise<RunnerThreadActivityGroupActionBatch> {
  const actions = uniqueById(await client.listThreadActions({
    ...request,
    runId,
    groupId,
    limit: GROUP_ACTION_LIMIT,
  }));
  return {
    actions: actions.slice(0, GROUP_ACTION_LIMIT),
    truncated: actions.length >= GROUP_ACTION_LIMIT,
  };
}
