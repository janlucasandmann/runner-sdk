import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CircleStop,
  LoaderCircle,
  Pause,
  Play,
} from "../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadEvent,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
  RunnerThreadControlAction,
} from "../../thread/types.js";
import { selectRunnerThreadRunWorkingLabel } from "../../thread/selectors.js";
import { resolveRunnerPublicThreadParticipant } from "../../thread/public-presentation.js";
import { DotLoader } from "../dot-loader.js";
import {
  RunnerThreadActivityGroupTree,
  type RunnerThreadActivityFilter,
} from "./activity-group-tree.js";
import { RunnerThreadActivityActionList, type RunnerThreadActionRenderer } from "./activity-action-list.js";
import { RunnerThreadPermissionRequestCard } from "./permission-request-card.js";
import type { RunnerThreadDetailLoadState } from "./run-detail-hydration.js";

export interface RunnerThreadRunActivityCardProps {
  run: RunnerThreadRun;
  projection: RunnerThreadProjection;
  fallbackAgentName?: string | null;
  fallbackWorkspaceName?: string | null;
  defaultExpanded?: boolean;
  renderAction?: RunnerThreadActionRenderer;
  detailLoadState?: RunnerThreadDetailLoadState;
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  onLoadDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onLoadActivityGroupActions?: (groupId: string, runId: string) => Promise<void> | void;
  onControlRun?: (run: RunnerThreadRun, action: RunnerThreadControlAction) => Promise<void> | void;
  onPermissionDecision?: (request: RunnerThreadPermissionRequest, decision: "allow" | "deny") => Promise<void> | void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
  activityGroups?: RunnerThreadActivityGroup[];
  actions?: RunnerThreadAction[];
  permissions?: RunnerThreadPermissionRequest[];
  promotePermissionsExternally?: boolean;
}

const FILTERS: Array<{ id: RunnerThreadActivityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "errors", label: "Errors" },
  { id: "permissions", label: "Permissions" },
  { id: "ring2", label: "Ring 2+" },
  { id: "subagents", label: "Subagents" },
];

export function isRunnerThreadRunActive(run: RunnerThreadRun): boolean {
  return ["queued", "pending", "running", "parked", "waiting", "waiting_permission", "requires_action"].includes(run.status);
}

function resolveWorkedDurationMs(start?: string | null, end?: string | null, now = Date.now()): number {
  const startMs = start ? new Date(start).getTime() : Number.NaN;
  if (!Number.isFinite(startMs)) return 0;
  const endMs = end ? new Date(end).getTime() : now;
  return Math.max(0, (Number.isFinite(endMs) ? endMs : now) - startMs);
}

function formatWorkedDuration(start?: string | null, end?: string | null, now = Date.now()): string {
  const seconds = Math.max(0, Math.round(resolveWorkedDurationMs(start, end, now) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds}s` : `${minutes} min`;
}

export function formatRunnerThreadTimelineClock(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round((Number.isFinite(durationMs) ? durationMs : 0) / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const minuteAndSecondLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${minuteAndSecondLabel}` : minuteAndSecondLabel;
}

export function calculateRunnerThreadTimelineProgress({
  timelineTop,
  timelineHeight,
  stickyBottom,
  viewportBottom,
}: {
  timelineTop: number;
  timelineHeight: number;
  stickyBottom: number;
  viewportBottom: number;
}): number {
  if (![timelineTop, timelineHeight, stickyBottom, viewportBottom].every(Number.isFinite) || timelineHeight <= 0) return 0;
  const visibleTimelineHeight = Math.max(0, viewportBottom - stickyBottom);
  if (timelineHeight <= visibleTimelineHeight) return timelineTop < viewportBottom ? 1 : 0;
  const scrollableTimelineHeight = timelineHeight - visibleTimelineHeight;
  return Math.max(0, Math.min(1, (stickyBottom - timelineTop) / scrollableTimelineHeight));
}

function findRunnerThreadScrollContainer(element: HTMLElement): HTMLElement | Window {
  let parent = element.parentElement;
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (/(?:auto|scroll|overlay)/i.test(overflowY)) return parent;
    parent = parent.parentElement;
  }
  return window;
}

function progressEventSummary(event: RunnerThreadEvent): string {
  const payloadSummary = typeof event.payload?.summary === "string" ? event.payload.summary : "";
  const payloadPhase = typeof event.payload?.phase === "string" ? event.payload.phase : "";
  // Deliberately omit payload.content: legacy mirrors retain raw reasoning as
  // audit evidence, while the thread surface renders only observer-safe text.
  return String(event.summary || payloadSummary || payloadPhase || event.title || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatRunnerThreadActiveWorkingLabel(value?: string | null): string {
  const normalized = String(value || "Working").replace(/\s+/g, " ").trim() || "Working";
  return `${normalized.replace(/(?:\.{1,}|…)+$/u, "")}...`;
}

function metadataText(metadata: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!metadata) return "";
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function RunnerThreadRunActivityCard({
  run,
  projection,
  fallbackAgentName,
  fallbackWorkspaceName,
  defaultExpanded = false,
  renderAction,
  detailLoadState,
  activityGroupActionStates,
  onLoadDetails,
  onLoadActivityGroupActions,
  onControlRun,
  onPermissionDecision,
  onOpenChanges,
  activityGroups,
  actions: providedActions,
  permissions: providedPermissions,
  promotePermissionsExternally = false,
}: RunnerThreadRunActivityCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [filter, setFilter] = useState<RunnerThreadActivityFilter>("all");
  const [timelineProgress, setTimelineProgress] = useState(0);
  const supervisionHeaderRef = useRef<HTMLDivElement>(null);
  const activityTimelineRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => {
    const stableTimestamp = Date.parse(run.updatedAt || run.startedAt || run.queuedAt || run.createdAt);
    return Number.isFinite(stableTimestamp) ? stableTimestamp : 0;
  });
  const active = isRunnerThreadRunActive(run);
  const pageResidentQueue = run.status === "queued"
    && run.metadata?.pageResidentQueue === true
    && run.metadata?.coordinatorDurable !== true;

  useEffect(() => {
    if (!expanded || !onLoadDetails || detailLoadState?.status !== "idle") return;
    void Promise.resolve(onLoadDetails(run)).catch(() => undefined);
  }, [detailLoadState?.status, expanded, onLoadDetails, run]);

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [active]);

  const groups = useMemo(
    () => activityGroups || Object.values(projection.activityGroupsById).filter((group) => group.runId === run.id),
    [activityGroups, projection.activityGroupsById, run.id],
  );
  const actions = useMemo(
    () => providedActions || Object.values(projection.actionsById).filter((action) => action.runId === run.id),
    [providedActions, projection.actionsById, run.id],
  );
  const runActionsById = useMemo(
    () => Object.fromEntries(actions.map((action) => [action.id, action])),
    [actions],
  );
  const progressEvents = useMemo(() => {
    const ordered = Object.values(projection.eventsById)
      .filter((event) => (
        event.runId === run.id
        && /(?:^|\.)(?:worker|run)\.progress$/i.test(event.type)
      ))
      .sort((left, right) => left.sequence - right.sequence || left.createdAt.localeCompare(right.createdAt));
    const deduplicated: Array<{ event: RunnerThreadEvent; summary: string }> = [];
    for (const event of ordered) {
      const summary = progressEventSummary(event);
      if (!summary || deduplicated.at(-1)?.summary === summary) continue;
      deduplicated.push({ event, summary });
    }
    return deduplicated.slice(-12);
  }, [projection.eventsById, run.id]);
  const permissions = useMemo(
    () => providedPermissions || Object.values(projection.permissionsById).filter((permission) => permission.runId === run.id),
    [providedPermissions, projection.permissionsById, run.id],
  );
  const groupedPermissions = useMemo(() => permissions.map((permission) => {
    if (permission.activityGroupId) return permission;
    const inferredGroup = [...groups]
      .filter((group) => (
        permission.sequence >= group.startSequence &&
        (group.endSequence === null || group.endSequence === undefined || permission.sequence <= group.endSequence)
      ))
      .sort((left, right) => right.startSequence - left.startSequence)[0];
    return inferredGroup ? { ...permission, activityGroupId: inferredGroup.id } : permission;
  }), [groups, permissions]);
  const pendingPermissions = groupedPermissions.filter((permission) => permission.status === "pending");
  const ungroupedResolvedPermissions = groupedPermissions.filter((permission) => (
    permission.status !== "pending" &&
    (!permission.activityGroupId || !projection.activityGroupsById[permission.activityGroupId])
  ));
  const groupIds = new Set(groups.map((group) => group.id));
  const groupedActionIds = new Set(groups.flatMap((group) => group.actionIds));
  const ungroupedActions = actions.filter((action) => (
    !groupedActionIds.has(action.id) && (!action.activityGroupId || !groupIds.has(action.activityGroupId))
  ));
  const actor = resolveRunnerPublicThreadParticipant(
    projection,
    run.actorParticipantId ? projection.participantsById[run.actorParticipantId] : null,
    fallbackAgentName,
  );
  const runAgentName = metadataText(run.metadata, ["agentName", "agent_name", "workerName", "worker_name"])
    || metadataText(run.projection?.metadata, ["agentName", "agent_name", "workerName", "worker_name"])
    || String(fallbackAgentName || "").trim()
    || actor?.displayName?.trim()
    || "Agent";
  const runWorkspaceName = metadataText(run.metadata, [
    "projectName", "project_name", "computerName", "computer_name", "environmentName", "environment_name",
  ]) || metadataText(run.projection?.metadata, [
    "projectName", "project_name", "computerName", "computer_name", "environmentName", "environment_name",
  ]) || String(fallbackWorkspaceName || "").trim();
  const runStartedAt = run.startedAt || run.queuedAt || run.createdAt;
  const totalTimelineDurationMs = resolveWorkedDurationMs(runStartedAt, run.completedAt, now);
  const duration = formatWorkedDuration(runStartedAt, run.completedAt, now);
  const timelineTimeLabel = `${formatRunnerThreadTimelineClock(totalTimelineDurationMs * timelineProgress)} of ${formatRunnerThreadTimelineClock(totalTimelineDurationMs)}`;
  const observerWorkingLabel = useMemo(
    () => selectRunnerThreadRunWorkingLabel(projection, run.id),
    [projection, run.id],
  );
  const headerLine = active
    ? pageResidentQueue
      ? "Queued in this page"
      : formatRunnerThreadActiveWorkingLabel(observerWorkingLabel)
    : `Worked for ${duration}`;

  useEffect(() => {
    const timelineElement = activityTimelineRef.current;
    const stickyElement = supervisionHeaderRef.current;
    if (!expanded || !timelineElement || !stickyElement) {
      setTimelineProgress(0);
      return;
    }
    const scrollContainer = findRunnerThreadScrollContainer(timelineElement);
    let animationFrame = 0;
    const updateProgress = () => {
      animationFrame = 0;
      const timelineRect = timelineElement.getBoundingClientRect();
      const stickyRect = stickyElement.getBoundingClientRect();
      const viewportBottom = scrollContainer === window
        ? window.innerHeight
        : (scrollContainer as HTMLElement).getBoundingClientRect().bottom;
      const nextProgress = calculateRunnerThreadTimelineProgress({
        timelineTop: timelineRect.top,
        timelineHeight: timelineRect.height,
        stickyBottom: stickyRect.bottom,
        viewportBottom,
      });
      setTimelineProgress((current) => Math.abs(current - nextProgress) < 0.001 ? current : nextProgress);
    };
    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateProgress);
    };
    scrollContainer.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(scheduleUpdate) : null;
    resizeObserver?.observe(timelineElement);
    resizeObserver?.observe(stickyElement);
    scheduleUpdate();
    return () => {
      scrollContainer.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [actions.length, detailLoadState?.status, expanded, filter, groups.length]);

  return (
    <div className="tb-thread-run-shell">
      <div className="tb-thread-run-context-label">
        <span className="tb-thread-run-context-agent">{runAgentName}</span>
        {runWorkspaceName ? (
          <span className="tb-thread-run-context-workspace"> on {runWorkspaceName}</span>
        ) : null}
      </div>
      <article id={`tb-thread-run-${run.id}`} className={`tb-thread-run-card ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="tb-thread-run-header"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span className="tb-thread-run-headline" aria-live={active ? "polite" : "off"}>
          {active && !pageResidentQueue ? (
            <DotLoader
              dotCount={9}
              dotSize={2}
              gap={2}
              color="currentColor"
              className="tb-thread-run-dot-loader"
            />
          ) : null}
          <span className="tb-thread-run-headline-copy">{headerLine}</span>
        </span>
        {expanded ? <ChevronUp className="tb-thread-run-chevron" strokeWidth={1.7} /> : <ChevronDown className="tb-thread-run-chevron" strokeWidth={1.7} />}
      </button>

      {!promotePermissionsExternally && pendingPermissions.length > 0 ? (
        <div className="tb-thread-run-promoted-permissions">
          {pendingPermissions.map((permission) => (
            <RunnerThreadPermissionRequestCard
              key={permission.id}
              request={permission}
              onDecision={onPermissionDecision}
            />
          ))}
        </div>
      ) : null}

      {expanded ? (
        <div className="tb-thread-run-body">
          <div ref={supervisionHeaderRef} className="tb-thread-run-supervision-header">
            <div className="tb-thread-run-toolbar">
              <div className="tb-thread-run-filters" role="tablist" aria-label="Filter run activity">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === item.id}
                    className={filter === item.id ? "is-active" : ""}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="tb-thread-run-controls">
                {onOpenChanges ? <button type="button" onClick={() => onOpenChanges(run)}>Changes</button> : null}
                {onControlRun && active ? (
                  run.status === "parked" || run.status === "waiting" || run.status === "waiting_permission"
                    ? <button type="button" onClick={() => void onControlRun(run, "resume")}><Play strokeWidth={1.6} /> Resume</button>
                    : <button type="button" onClick={() => void onControlRun(run, "pause")}><Pause strokeWidth={1.6} /> Pause</button>
                ) : null}
                {onControlRun && active ? (
                  <button type="button" className="is-danger" onClick={() => void onControlRun(run, "cancel")}>
                    <CircleStop strokeWidth={1.6} /> Cancel
                  </button>
                ) : null}
              </div>
            </div>
            <div className="tb-thread-run-time-progress-row">
              <div
                className="tb-thread-run-time-progress"
                role="progressbar"
                aria-label="Position in work timeline"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(timelineProgress * 100)}
                aria-valuetext={timelineTimeLabel}
              >
                <span
                  className="tb-thread-run-time-progress-fill"
                  style={{ transform: `scaleX(${timelineProgress})` }}
                />
              </div>
              <span className="tb-thread-run-time-progress-label">{timelineTimeLabel}</span>
            </div>
          </div>

          {run.origin?.label ? (
            <div className="tb-thread-run-origin">Started by {run.origin.label}</div>
          ) : null}

          {detailLoadState?.status === "loading" ? (
            <div className="tb-thread-detail-load-state" role="status">
              <LoaderCircle className="is-spinning" strokeWidth={1.7} /> Loading detailed activity…
            </div>
          ) : null}
          {detailLoadState?.status === "error" ? (
            <div className="tb-thread-detail-load-state is-error" role="alert">
              <AlertTriangle strokeWidth={1.7} />
              <span>{detailLoadState.error || "Could not load detailed activity."}</span>
              <button type="button" onClick={() => void Promise.resolve(onLoadDetails?.(run)).catch(() => undefined)}>Retry</button>
            </div>
          ) : null}
          {detailLoadState?.status === "loaded" && detailLoadState.truncated ? (
            <div className="tb-thread-detail-load-state">
              This run is large. Expand a phase to load its bounded action evidence.
            </div>
          ) : null}

          {groups.length === 0 && actions.length === 0 && detailLoadState?.status !== "loading" ? (
            <div className="tb-thread-progress-only" role="status">
              <div className="tb-thread-progress-only-title">
                {active ? "No tool activity yet" : "Completed without tool activity"}
              </div>
              <div className="tb-thread-progress-only-copy">
                {active
                  ? "The worker is still reasoning and has not used a tool."
                  : "This run answered directly without commands, file changes, or external actions."}
              </div>
              {progressEvents.length > 0 ? (
                <ol className="tb-thread-progress-only-list" aria-label="Progress summaries">
                  {progressEvents.map(({ event, summary }) => (
                    <li key={event.id}>{summary}</li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}

          <div ref={activityTimelineRef} className="tb-thread-run-activity-timeline">
            <RunnerThreadActivityGroupTree
              groups={groups}
              actionsById={runActionsById}
              permissions={groupedPermissions.filter((permission) => permission.status !== "pending")}
              endAt={active ? new Date(now).toISOString() : run.completedAt || run.updatedAt}
              filter={filter}
              renderAction={renderAction}
              onPermissionDecision={onPermissionDecision}
              actionLoadStates={activityGroupActionStates}
              onLoadActions={onLoadActivityGroupActions
                ? (group) => onLoadActivityGroupActions(group.id, group.runId)
                : undefined}
            />
          </div>

          {ungroupedResolvedPermissions.length > 0 && (filter === "all" || filter === "permissions") ? (
            <div className="tb-thread-permission-history" aria-label="Permission history">
              {ungroupedResolvedPermissions.map((permission) => (
                <RunnerThreadPermissionRequestCard
                  key={permission.id}
                  request={permission}
                  compact
                  onDecision={onPermissionDecision}
                />
              ))}
            </div>
          ) : null}

          {ungroupedActions.length > 0 && filter !== "permissions" ? (
            <div className="tb-thread-ungrouped-actions">
              <div className="tb-thread-ungrouped-heading">
                <AlertTriangle strokeWidth={1.6} /> Awaiting observer grouping
              </div>
              <RunnerThreadActivityActionList actions={ungroupedActions} renderAction={renderAction} />
            </div>
          ) : null}
        </div>
      ) : null}
      </article>
    </div>
  );
}
