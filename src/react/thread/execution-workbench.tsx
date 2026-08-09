import {
  Activity,
  AlertTriangle,
  Boxes,
  CircleStop,
  ExternalLink,
  FileClock,
  GitCompareArrows,
  LoaderCircle,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RunnerThreadRunReceiptViewModel } from "../../thread/presentation.js";
import {
  isRunnerThreadRunActive,
  selectRunnerThreadActivityGroups,
  selectRunnerThreadPendingPermissions,
  selectRunnerThreadRunActions,
} from "../../thread/selectors.js";
import type {
  RunnerThreadAction,
  RunnerThreadControlAction,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "../../thread/types.js";
import {
  PlatformThreadWorkbench,
  type PlatformThreadWorkbenchTab,
} from "../../platform-ui/components/thread-components/thread-screen/index.js";
import { PlatformSecondaryButton } from "../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../platform-ui/components/ui/icon-button/index.js";
import {
  RunnerThreadActivityGroupTree,
  type RunnerThreadActivityFilter,
} from "./activity-group-tree.js";
import {
  RunnerThreadActivityActionList,
  type RunnerThreadActionRenderer,
} from "./activity-action-list.js";
import { RunnerThreadPermissionRequestCard } from "./permission-request-card.js";
import type { RunnerThreadDetailLoadState } from "./run-detail-hydration.js";

export type RunnerThreadWorkbenchTab = "activity" | "changes" | "artifacts" | "context";

export interface RunnerThreadExecutionWorkbenchProps {
  receipt: RunnerThreadRunReceiptViewModel;
  projection: RunnerThreadProjection;
  detailLoadState?: RunnerThreadDetailLoadState;
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  renderAction?: RunnerThreadActionRenderer;
  onClose: () => void;
  onLoadRunDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onLoadActivityGroupActions?: (groupId: string, runId: string) => Promise<void> | void;
  onControlRun?: (run: RunnerThreadRun, action: RunnerThreadControlAction) => Promise<void> | void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
  onPermissionDecision?: (
    request: RunnerThreadPermissionRequest,
    decision: "allow" | "deny",
  ) => Promise<void> | void;
}

const WORKBENCH_TABS: readonly PlatformThreadWorkbenchTab<RunnerThreadWorkbenchTab>[] = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "changes", label: "Changes", icon: GitCompareArrows },
  { id: "artifacts", label: "Artifacts", icon: Boxes },
  { id: "context", label: "Context", icon: FileClock },
];

const ACTIVITY_FILTERS: ReadonlyArray<{ id: RunnerThreadActivityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "errors", label: "Errors" },
  { id: "permissions", label: "Approvals" },
  { id: "ring2", label: "Ring 2+" },
  { id: "subagents", label: "Subagents" },
];

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function metadataValue(
  metadata: Record<string, unknown> | null | undefined,
  keys: string[],
): string {
  if (!metadata) return "";
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function statusClass(status: string): string {
  if (status === "completed") return "is-success";
  if (status === "failed" || status === "cancelled") return "is-error";
  if (status === "waiting_permission" || status === "requires_action") return "is-warning";
  return "is-active";
}

function deduplicateResources(actions: RunnerThreadAction[]) {
  return Array.from(
    new Map(
      actions
        .flatMap((action) => action.touchedResources || [])
        .map((resource) => {
          const key = [
            resource.kind,
            resource.id,
            resource.path,
            resource.url,
            resource.label,
          ].join(":");
          return [key, resource] as const;
        }),
    ).values(),
  );
}

export function RunnerThreadExecutionWorkbench({
  receipt,
  projection,
  detailLoadState,
  activityGroupActionStates,
  renderAction,
  onClose,
  onLoadRunDetails,
  onLoadActivityGroupActions,
  onControlRun,
  onOpenChanges,
  onPermissionDecision,
}: RunnerThreadExecutionWorkbenchProps) {
  const [tab, setTab] = useState<RunnerThreadWorkbenchTab>("activity");
  const [filter, setFilter] = useState<RunnerThreadActivityFilter>("all");
  const requestedRunIdsRef = useRef(new Set<string>());
  const run = receipt.run;
  const active = isRunnerThreadRunActive(run);
  const groups = useMemo(
    () => selectRunnerThreadActivityGroups(projection, { runId: run.id }),
    [projection, run.id],
  );
  const actions = useMemo(
    () => selectRunnerThreadRunActions(projection, run.id),
    [projection, run.id],
  );
  const actionsById = useMemo(
    () => Object.fromEntries(actions.map((action) => [action.id, action])),
    [actions],
  );
  const permissions = useMemo(
    () =>
      Object.values(projection.permissionsById).filter((permission) => permission.runId === run.id),
    [projection.permissionsById, run.id],
  );
  const pendingPermissions = useMemo(
    () => selectRunnerThreadPendingPermissions(projection, run.id),
    [projection, run.id],
  );
  const artifacts = useMemo(() => deduplicateResources(actions), [actions]);

  useEffect(() => {
    if (!onLoadRunDetails || detailLoadState?.status !== "idle") return;
    if (requestedRunIdsRef.current.has(run.id)) return;
    requestedRunIdsRef.current.add(run.id);
    void Promise.resolve(onLoadRunDetails(run)).catch(() => {
      requestedRunIdsRef.current.delete(run.id);
    });
  }, [detailLoadState?.status, onLoadRunDetails, run]);

  const controls =
    onControlRun && active ? (
      <>
        <PlatformIconButton
          size="compact"
          aria-label={
            run.status === "parked" || run.status === "waiting" ? "Resume run" : "Pause run"
          }
          title={run.status === "parked" || run.status === "waiting" ? "Resume" : "Pause"}
          onClick={() =>
            void Promise.resolve(
              onControlRun(
                run,
                run.status === "parked" || run.status === "waiting" ? "resume" : "pause",
              ),
            ).catch(() => undefined)
          }
        >
          {run.status === "parked" || run.status === "waiting" ? (
            <Play strokeWidth={1.7} />
          ) : (
            <Pause strokeWidth={1.7} />
          )}
        </PlatformIconButton>
        <PlatformIconButton
          size="compact"
          className="platform-thread-workbench__cancel"
          aria-label="Cancel run"
          title="Cancel"
          onClick={() => void Promise.resolve(onControlRun(run, "cancel")).catch(() => undefined)}
        >
          <CircleStop strokeWidth={1.7} />
        </PlatformIconButton>
      </>
    ) : null;

  const activityPanel = (
    <div className="platform-thread-workbench__activity">
      <div
        className="platform-thread-workbench__filters"
        role="tablist"
        aria-label="Filter activity"
      >
        {ACTIVITY_FILTERS.map((item) => (
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
      {detailLoadState?.status === "loading" ? (
        <div className="platform-thread-workbench__state" role="status">
          <LoaderCircle className="is-spinning" strokeWidth={1.7} /> Loading execution evidence...
        </div>
      ) : null}
      {detailLoadState?.status === "error" ? (
        <div className="platform-thread-workbench__state is-error" role="alert">
          <AlertTriangle strokeWidth={1.7} />
          <span>{detailLoadState.error || "Could not load execution evidence."}</span>
          <button
            type="button"
            onClick={() => {
              requestedRunIdsRef.current.delete(run.id);
              void Promise.resolve(onLoadRunDetails?.(run)).catch(() => undefined);
            }}
          >
            Retry
          </button>
        </div>
      ) : null}
      {groups.length ? (
        <RunnerThreadActivityGroupTree
          groups={groups}
          actionsById={actionsById}
          permissions={permissions.filter((permission) => permission.status !== "pending")}
          filter={filter}
          renderAction={renderAction}
          onPermissionDecision={onPermissionDecision}
          actionLoadStates={activityGroupActionStates}
          onLoadActions={
            onLoadActivityGroupActions
              ? (group) => onLoadActivityGroupActions(group.id, group.runId)
              : undefined
          }
          endAt={active ? new Date().toISOString() : run.completedAt || run.updatedAt}
        />
      ) : actions.length && filter !== "permissions" ? (
        <RunnerThreadActivityActionList actions={actions} renderAction={renderAction} />
      ) : detailLoadState?.status !== "loading" ? (
        <div className="platform-thread-workbench__empty">
          {active
            ? "Execution evidence will appear here as work progresses."
            : "No tool activity was recorded for this run."}
        </div>
      ) : null}
      {pendingPermissions.length ? (
        <div className="platform-thread-workbench__approval-history">
          <div className="platform-thread-workbench__section-title">Awaiting approval</div>
          {pendingPermissions.map((permission) => (
            <RunnerThreadPermissionRequestCard
              key={permission.id}
              request={permission}
              compact
              onDecision={onPermissionDecision}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  const changesPanel = (
    <div className="platform-thread-workbench__empty is-centered">
      <GitCompareArrows strokeWidth={1.5} aria-hidden="true" />
      <strong>Review durable changes</strong>
      <span>Inspect the files and snapshots produced by this execution.</span>
      {onOpenChanges ? (
        <PlatformSecondaryButton size="small" onClick={() => onOpenChanges(run)}>
          <ExternalLink strokeWidth={1.7} /> Open changes
        </PlatformSecondaryButton>
      ) : null}
    </div>
  );

  const artifactsPanel = artifacts.length ? (
    <div className="platform-thread-workbench__artifact-list">
      {artifacts.map((resource, index) => (
        <div
          key={[resource.kind, resource.id, resource.path, resource.url, index].join(":")}
          className="platform-thread-workbench__artifact"
        >
          <span className="platform-thread-workbench__artifact-kind">
            {resource.kind || "Resource"}
          </span>
          <span className="platform-thread-workbench__artifact-label">
            {resource.label || resource.path || resource.url || resource.id || "Untitled resource"}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="platform-thread-workbench__empty is-centered">
      <Boxes strokeWidth={1.5} aria-hidden="true" />
      <strong>No artifacts yet</strong>
      <span>Files, resources, and external outputs touched by this run will appear here.</span>
    </div>
  );

  const contextPanel = (
    <dl className="platform-thread-workbench__context-list">
      <div>
        <dt>Run</dt>
        <dd>{run.id}</dd>
      </div>
      <div>
        <dt>Agent</dt>
        <dd>
          {receipt.actor?.displayName ||
            metadataValue(run.metadata, ["agentName", "agent_name"]) ||
            "Agent"}
        </dd>
      </div>
      <div>
        <dt>Workspace</dt>
        <dd>{receipt.workspaceLabel || "Default"}</dd>
      </div>
      <div>
        <dt>Origin</dt>
        <dd>{receipt.originLabel || "Thread"}</dd>
      </div>
      <div>
        <dt>Started</dt>
        <dd>{formatDateTime(receipt.startedAt)}</dd>
      </div>
      <div>
        <dt>Finished</dt>
        <dd>{formatDateTime(receipt.endedAt)}</dd>
      </div>
      {run.parentRunId ? (
        <div>
          <dt>Parent run</dt>
          <dd>{run.parentRunId}</dd>
        </div>
      ) : null}
      <div>
        <dt>Permission ring</dt>
        <dd>
          {receipt.highestPermissionRing
            ? `Ring ${receipt.highestPermissionRing}`
            : "No elevated access"}
        </dd>
      </div>
    </dl>
  );

  return (
    <PlatformThreadWorkbench
      title={receipt.headline}
      subtitle={
        receipt.actor?.displayName || receipt.workspaceLabel
          ? [receipt.actor?.displayName, receipt.workspaceLabel].filter(Boolean).join(" on ")
          : "Agent"
      }
      status={
        <span className={`platform-thread-workbench__status ${statusClass(run.status)}`}>
          {receipt.phaseLabel}
        </span>
      }
      controls={controls}
      tabs={WORKBENCH_TABS}
      value={tab}
      onValueChange={setTab}
      onClose={onClose}
    >
      {tab === "activity" ? activityPanel : null}
      {tab === "changes" ? changesPanel : null}
      {tab === "artifacts" ? artifactsPanel : null}
      {tab === "context" ? contextPanel : null}
    </PlatformThreadWorkbench>
  );
}
