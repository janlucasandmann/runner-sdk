import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type {
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadPermissionRing,
  RunnerThreadPermissionRequest,
} from "../../thread/types.js";
import {
  RunnerThreadActivityActionList,
  type RunnerThreadActionRenderer,
} from "./activity-action-list.js";
import { RunnerThreadPermissionRequestCard } from "./permission-request-card.js";
import type { RunnerThreadDetailLoadState } from "./run-detail-hydration.js";

export type RunnerThreadActivityFilter = "all" | "errors" | "permissions" | "ring2" | "ring3" | "subagents";

export interface RunnerThreadActivityGroupTreeProps {
  groups: RunnerThreadActivityGroup[];
  actionsById: Record<string, RunnerThreadAction>;
  permissions: RunnerThreadPermissionRequest[];
  filter?: RunnerThreadActivityFilter;
  renderAction?: RunnerThreadActionRenderer;
  onPermissionDecision?: (request: RunnerThreadPermissionRequest, decision: "allow" | "deny") => Promise<void> | void;
  actionLoadStates?: Record<string, RunnerThreadDetailLoadState>;
  onLoadActions?: (group: RunnerThreadActivityGroup) => Promise<void> | void;
  depth?: number;
}

function matchesActionFilter(action: RunnerThreadAction, filter: RunnerThreadActivityFilter): boolean {
  if (filter === "all" || filter === "permissions") return filter === "all";
  if (filter === "errors") return action.status === "failed" || action.status === "blocked";
  if (filter === "ring2") return (action.permissionRing || 0) >= 2;
  if (filter === "ring3") return action.permissionRing === 3;
  if (filter === "subagents") {
    const metadata = action.metadata || {};
    return action.type.includes("subagent") || Boolean(metadata.parentRunId || metadata.subagentInvocationId);
  }
  return true;
}

function searchablePermissionText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function inferLegacyPermissionRing(
  group: RunnerThreadActivityGroup,
  actions: RunnerThreadAction[],
): RunnerThreadPermissionRing {
  const searchable = [
    group.title,
    group.liveSummary,
    group.rationale,
    group.metadata,
    ...actions.flatMap((action) => [
      action.type,
      action.title,
      action.summary,
      action.toolName,
      action.input,
      action.metadata,
    ]),
  ].map(searchablePermissionText).join(" ").toLowerCase();

  if ([
    "git push",
    "gh pr",
    "create pr",
    "pull request",
    "deploy",
    "publish",
    "stripe",
    "payment",
    "checkout",
    "refund",
    "charge",
    "public message",
    "github",
    "slack",
    "discord",
    "telegram",
    "secret export",
  ].some((term) => searchable.includes(term))) return 3;

  if ([
    "webfetch",
    "websearch",
    "external read",
    "http://",
    "https://",
    "curl ",
    "wget ",
    "send email",
    "gmail",
    "smtp",
    "shared resource",
    "remote trigger",
    "team agent",
    "workercreate",
    "mcp__",
  ].some((term) => searchable.includes(term))) return 2;

  // Legacy mirrors predate mandatory action classification. Their remaining
  // unclassified tool activity is local workspace/shell work by construction;
  // current runs receive an explicit ring from the backend before mirroring.
  return 1;
}

function PermissionRingIcon({ ring }: { ring: RunnerThreadPermissionRing }) {
  const RingIcon = ring === 1
    ? ArrowDownToLine
    : ring === 2
      ? UserRound
      : ArrowUpFromLine;
  return (
    <span
      className={`tb-thread-permission-ring-icon is-ring-${ring}`}
      role="img"
      aria-label={`Ring ${ring}`}
      title={`Ring ${ring}`}
    >
      <RingIcon strokeWidth={2.4} aria-hidden="true" />
    </span>
  );
}

function formatActivityGroupDuration(group: RunnerThreadActivityGroup): string {
  const reportedDurationMs = Number(group.metrics?.durationMs || 0);
  const startMs = Date.parse(group.createdAt);
  const endMs = Date.parse(group.sealedAt || group.updatedAt || group.createdAt);
  const fallbackDurationMs = Number.isFinite(startMs) && Number.isFinite(endMs)
    ? Math.max(0, endMs - startMs)
    : 0;
  const durationMs = reportedDurationMs > 0 ? reportedDurationMs : fallbackDurationMs;
  const seconds = Math.max(0, Math.round(durationMs / 1_000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds}s` : `${minutes} min`;
}

function GroupRow({
  group,
  groupsByParent,
  actionsById,
  actionsByGroup,
  permissions,
  filter,
  renderAction,
  onPermissionDecision,
  actionLoadStates,
  onLoadActions,
  depth,
  ancestorIds,
}: {
  group: RunnerThreadActivityGroup;
  groupsByParent: Map<string | null, RunnerThreadActivityGroup[]>;
  actionsById: Record<string, RunnerThreadAction>;
  actionsByGroup: Map<string, RunnerThreadAction[]>;
  permissions: RunnerThreadPermissionRequest[];
  filter: RunnerThreadActivityFilter;
  renderAction?: RunnerThreadActionRenderer;
  onPermissionDecision?: (request: RunnerThreadPermissionRequest, decision: "allow" | "deny") => Promise<void> | void;
  actionLoadStates?: Record<string, RunnerThreadDetailLoadState>;
  onLoadActions?: (group: RunnerThreadActivityGroup) => Promise<void> | void;
  depth: number;
  ancestorIds: Set<string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const actionLoadState = actionLoadStates?.[group.id];
  useEffect(() => {
    if (!expanded || !onLoadActions || (actionLoadState && actionLoadState.status !== "idle")) return;
    void Promise.resolve(onLoadActions(group)).catch(() => undefined);
  }, [actionLoadState, expanded, group, onLoadActions]);
  const children = (groupsByParent.get(group.id) || []).filter((child) => !ancestorIds.has(child.id));
  const allGroupActions = Array.from(new Map([
    ...group.actionIds.map((actionId) => actionsById[actionId]).filter((action): action is RunnerThreadAction => Boolean(action)),
    ...(actionsByGroup.get(group.id) || []),
  ].map((action) => [action.id, action])).values())
    .sort((left, right) => left.sequence - right.sequence || left.createdAt.localeCompare(right.createdAt))
    .filter((action): action is RunnerThreadAction => Boolean(action));
  const groupActions = allGroupActions.filter((action) => matchesActionFilter(action, filter));
  const groupPermissions = permissions.filter((permission) => permission.activityGroupId === group.id);
  const visiblePermissions = filter === "all" || filter === "permissions" ? groupPermissions : [];
  const childMayMatch = children.length > 0;
  const hasVisibleContent = groupActions.length > 0 || visiblePermissions.length > 0 || childMayMatch || filter === "all";
  if (!hasVisibleContent) return null;

  const permissionRings = [
    group.highestPermissionRing,
    ...allGroupActions.map((action) => action.permissionRing),
    ...groupPermissions.map((permission) => permission.permissionRing),
  ].filter((ring): ring is RunnerThreadPermissionRing => ring === 1 || ring === 2 || ring === 3);
  const groupPermissionRing = permissionRings.length > 0
    ? Math.max(...permissionRings) as RunnerThreadPermissionRing
    : inferLegacyPermissionRing(group, allGroupActions);
  const duration = formatActivityGroupDuration(group);
  const summary = String(group.liveSummary || group.title || "Work completed")
    .replace(/\s+/g, " ")
    .trim();
  const isNested = depth > 0;
  const clampedDepth = Math.min(depth, 3);

  return (
    <div className={`tb-thread-activity-group${isNested ? " is-nested" : ""}${expanded ? " is-expanded" : ""}`} style={{ "--tb-thread-group-depth": clampedDepth } as CSSProperties}>
      <button
        type="button"
        className="tb-thread-activity-group-header"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span className="tb-thread-activity-group-state">
          <PermissionRingIcon ring={groupPermissionRing} />
        </span>
        <span className="tb-thread-activity-group-label">
          <span className="tb-thread-activity-group-copy">
            <span className="tb-thread-activity-group-duration">Worked for {duration}</span>
          </span>
          <span className="tb-thread-activity-group-chevron" aria-hidden="true">
            {expanded ? <ChevronDown strokeWidth={1.7} /> : <ChevronRight strokeWidth={1.7} />}
          </span>
        </span>
      </button>
      {expanded ? (
        <div className="tb-thread-activity-group-body">
          {visiblePermissions.map((permission) => (
            <RunnerThreadPermissionRequestCard
              key={permission.id}
              request={permission}
              compact={permission.status !== "pending"}
              onDecision={onPermissionDecision}
            />
          ))}
          <RunnerThreadActivityActionList actions={groupActions} renderAction={renderAction} />
          {actionLoadState?.status === "loading" ? (
            <div className="tb-thread-detail-load-state" role="status">
              <LoaderCircle className="is-spinning" strokeWidth={1.7} /> Loading group actions…
            </div>
          ) : null}
          {actionLoadState?.status === "error" ? (
            <div className="tb-thread-detail-load-state is-error" role="alert">
              <AlertCircle strokeWidth={1.7} />
              <span>{actionLoadState.error || "Could not load this group's actions."}</span>
              <button type="button" onClick={() => void Promise.resolve(onLoadActions?.(group)).catch(() => undefined)}>Retry</button>
            </div>
          ) : null}
          {actionLoadState?.status === "loaded" && actionLoadState.truncated ? (
            <div className="tb-thread-detail-load-state">Showing the first 500 actions in this group.</div>
          ) : null}
          {children.length > 0 ? (
            <div className="tb-thread-activity-group-children">
              {children.map((child) => (
                <GroupRow
                  key={child.id}
                  group={child}
                  groupsByParent={groupsByParent}
                  actionsById={actionsById}
                  actionsByGroup={actionsByGroup}
                  permissions={permissions}
                  filter={filter}
                  renderAction={renderAction}
                  onPermissionDecision={onPermissionDecision}
                  actionLoadStates={actionLoadStates}
                  onLoadActions={onLoadActions}
                  depth={depth + 1}
                  ancestorIds={new Set([...ancestorIds, child.id])}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="tb-thread-activity-group-summary">{summary}</p>
    </div>
  );
}

export function RunnerThreadActivityGroupTree({
  groups,
  actionsById,
  permissions,
  filter = "all",
  renderAction,
  onPermissionDecision,
  actionLoadStates,
  onLoadActions,
  depth = 0,
}: RunnerThreadActivityGroupTreeProps) {
  const groupsByParent = useMemo(() => {
    const map = new Map<string | null, RunnerThreadActivityGroup[]>();
    for (const group of groups) {
      const parent = group.parentGroupId || null;
      const bucket = map.get(parent) || [];
      bucket.push(group);
      map.set(parent, bucket);
    }
    for (const bucket of map.values()) {
      bucket.sort((left, right) => left.startSequence - right.startSequence || left.sequence - right.sequence);
    }
    return map;
  }, [groups]);
  const actionsByGroup = useMemo(() => {
    const map = new Map<string, RunnerThreadAction[]>();
    for (const action of Object.values(actionsById)) {
      if (!action.activityGroupId) continue;
      const bucket = map.get(action.activityGroupId) || [];
      bucket.push(action);
      map.set(action.activityGroupId, bucket);
    }
    return map;
  }, [actionsById]);
  const discoveredRoots = groupsByParent.get(null) || groups.filter((group) => !groups.some((candidate) => candidate.id === group.parentGroupId));
  const roots = discoveredRoots.length > 0
    ? discoveredRoots
    : [...groups].sort((left, right) => left.startSequence - right.startSequence || left.sequence - right.sequence).slice(0, 1);

  if (roots.length === 0) {
    return <div className="tb-thread-activity-empty">Detailed activity will appear as the observer groups this run.</div>;
  }

  return (
    <div className="tb-thread-activity-tree">
      {roots.map((group) => (
        <GroupRow
          key={group.id}
          group={group}
          groupsByParent={groupsByParent}
          actionsById={actionsById}
          actionsByGroup={actionsByGroup}
          permissions={permissions}
          filter={filter}
          renderAction={renderAction}
          onPermissionDecision={onPermissionDecision}
          actionLoadStates={actionLoadStates}
          onLoadActions={onLoadActions}
          depth={depth}
          ancestorIds={new Set([group.id])}
        />
      ))}
    </div>
  );
}
