import { Activity, ChevronDown, ChevronUp } from "../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { buildRunnerThreadRunReceiptViewModel } from "../../thread/presentation.js";
import {
  isRunnerPublicConversationRun,
  resolveRunnerPublicThreadParticipant,
} from "../../thread/public-presentation.js";
import type {
  RunnerThreadControlAction,
  RunnerThreadAction,
  RunnerThreadActivityGroup,
  RunnerThreadEvent,
  RunnerThreadMessage,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRoutingReceipt,
  RunnerThreadRun,
  RunnerThreadTimelineReference,
} from "../../thread/types.js";
import type { RunnerThreadActionRenderer } from "./activity-action-list.js";
import { RunnerThreadMessageView } from "./thread-message.js";
import { RunnerThreadPermissionRequestCard } from "./permission-request-card.js";
import {
  getRunnerThreadPromotedPermissionId,
  RunnerThreadPermissionHistoryMarker,
} from "./pending-permissions-dock.js";
import { RunnerThreadLiveSupervisionDock } from "./live-supervision-dock.js";
import { RunnerThreadRunActivityCard } from "./run-activity-card.js";
import { RunnerThreadRunReceipt } from "./run-receipt.js";
import type { RunnerThreadDetailLoadState } from "./run-detail-hydration.js";

export interface RunnerThreadTimelineProps {
  projection: RunnerThreadProjection;
  fallbackRunAgentName?: string | null;
  fallbackRunWorkspaceName?: string | null;
  maxMountedItems?: number;
  renderMessageContent?: (message: RunnerThreadMessage) => ReactNode;
  renderUserMessageContent?: (message: RunnerThreadMessage) => ReactNode;
  renderEvent?: (event: RunnerThreadEvent) => ReactNode;
  renderAction?: RunnerThreadActionRenderer;
  runDetailStates?: Record<string, RunnerThreadDetailLoadState>;
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the existing pagination callback contract.
  onLoadEarlier?: () => Promise<boolean | void> | boolean | void;
  onLoadRunDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onLoadActivityGroupActions?: (groupId: string, runId: string) => Promise<void> | void;
  onControlRun?: (run: RunnerThreadRun, action: RunnerThreadControlAction) => Promise<void> | void;
  onPermissionDecision?: (request: RunnerThreadPermissionRequest, decision: "allow" | "deny") => Promise<void> | void;
  onCorrectRoute?: (receipt: RunnerThreadRoutingReceipt) => void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
  onRunElement?: (runId: string, element: HTMLElement | null) => void;
  onSelectRun?: (run: RunnerThreadRun) => void;
  selectedRunId?: string | null;
  runPresentation?: "activity-card" | "receipt";
  showLiveSupervision?: boolean;
}

function getReferenceItem(projection: RunnerThreadProjection, reference: RunnerThreadTimelineReference) {
  if (reference.kind === "message") return projection.messagesById[reference.id];
  if (reference.kind === "run") return projection.runsById[reference.id];
  if (reference.kind === "event") return projection.eventsById[reference.id];
  if (reference.kind === "action") return projection.actionsById[reference.id];
  if (reference.kind === "activity_group") return projection.activityGroupsById[reference.id];
  if (reference.kind === "routing_receipt") return projection.routingReceiptsById[reference.id];
  if (reference.kind === "permission") return projection.permissionsById[reference.id];
  return undefined;
}

function getMessageReceipt(projection: RunnerThreadProjection, message: RunnerThreadMessage) {
  if (message.routingReceiptId && projection.routingReceiptsById[message.routingReceiptId]) {
    return projection.routingReceiptsById[message.routingReceiptId];
  }
  return Object.values(projection.routingReceiptsById)
    .filter((receipt) => receipt.messageId === message.id)
    .sort((left, right) => right.sequence - left.sequence)[0] || null;
}

function getReferenceKey(reference: RunnerThreadTimelineReference) {
  return `${reference.kind}:${reference.id}`;
}

export function RunnerThreadTimeline({
  projection,
  fallbackRunAgentName,
  fallbackRunWorkspaceName,
  maxMountedItems = 200,
  renderMessageContent,
  renderUserMessageContent,
  renderEvent,
  renderAction,
  runDetailStates,
  activityGroupActionStates,
  onLoadEarlier,
  onLoadRunDetails,
  onLoadActivityGroupActions,
  onControlRun,
  onPermissionDecision,
  onCorrectRoute,
  onOpenChanges,
  onRunElement,
  onSelectRun,
  selectedRunId,
  runPresentation = "activity-card",
  showLiveSupervision = true,
}: RunnerThreadTimelineProps) {
  const [windowEndKey, setWindowEndKey] = useState<string | null>(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [pendingEarlierAnchorKey, setPendingEarlierAnchorKey] = useState<string | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset the bounded timeline window when its owning thread changes.
  useEffect(() => {
    setWindowEndKey(null);
    setPendingEarlierAnchorKey(null);
  }, [projection.threadId]);
  const activityByRunId = useMemo(() => {
    const result: Record<string, {
      groups: RunnerThreadActivityGroup[];
      actions: RunnerThreadAction[];
      permissions: RunnerThreadPermissionRequest[];
    }> = {};
    const ensureRun = (runId: string) => (result[runId] ||= { groups: [], actions: [], permissions: [] });
    for (const group of Object.values(projection.activityGroupsById)) ensureRun(group.runId).groups.push(group);
    for (const action of Object.values(projection.actionsById)) if (action.runId) ensureRun(action.runId).actions.push(action);
    for (const permission of Object.values(projection.permissionsById)) if (permission.runId) ensureRun(permission.runId).permissions.push(permission);
    return result;
  }, [projection.actionsById, projection.activityGroupsById, projection.permissionsById]);
  const references = useMemo(
    () => projection.timeline.filter((reference) => {
      const item = getReferenceItem(projection, reference);
      if (!item) return false;
      if (item.kind === "message") return true;
      if (item.kind === "run") return isRunnerPublicConversationRun(item);
      if (item.kind === "permission") {
        return item.status === "pending" || !item.runId || !projection.runsById[item.runId];
      }
      if (item.kind === "event") {
        if (renderEvent) return true;
        return !item.runId
          && ["user", "conversation"].includes(item.visibility || "user")
          && Boolean(item.title || item.summary);
      }
      return false;
    }),
    [projection, renderEvent],
  );
  const anchoredEndIndex = windowEndKey
    ? references.findIndex((reference) => getReferenceKey(reference) === windowEndKey) + 1
    : references.length;
  const endIndex = anchoredEndIndex > 0 ? anchoredEndIndex : references.length;
  const startIndex = Math.max(0, endIndex - maxMountedItems);
  const visibleReferences = references.slice(startIndex, endIndex);
  const hiddenBefore = startIndex;
  const hiddenAfter = references.length - endIndex;
  const canLoadFromServer = Boolean((projection.hasOlder || projection.hasMore) && onLoadEarlier);
  const runReceiptsById = useMemo(() => {
    if (runPresentation !== "receipt") return {};
    return Object.fromEntries(Object.values(projection.runsById).map((run) => [
      run.id,
      buildRunnerThreadRunReceiptViewModel(projection, run),
    ]));
  }, [projection, runPresentation]);

  useEffect(() => {
    if (!pendingEarlierAnchorKey) return;
    const anchorIndex = references.findIndex((reference) => getReferenceKey(reference) === pendingEarlierAnchorKey);
    // A server page can contain only run-scoped evidence, which is deliberately
    // hidden at conversation altitude. Do not collapse the window unless a
    // newly visible item actually landed before the former first item.
    if (anchorIndex > 0) setWindowEndKey(pendingEarlierAnchorKey);
    setPendingEarlierAnchorKey(null);
  }, [pendingEarlierAnchorKey, references]);

  const showEarlier = async () => {
    const currentFirst = visibleReferences[0];
    if (!currentFirst) return;
    if (hiddenBefore > 0) {
      setWindowEndKey(getReferenceKey(currentFirst));
      return;
    }
    if (!canLoadFromServer || !onLoadEarlier) return;
    setLoadingEarlier(true);
    try {
      const loaded = await onLoadEarlier();
      if (loaded !== false) setPendingEarlierAnchorKey(getReferenceKey(currentFirst));
    } catch {
      // The owner surfaces request errors; keep the current window anchored.
    } finally {
      setLoadingEarlier(false);
    }
  };

  const openPromotedPermission = (request: RunnerThreadPermissionRequest) => {
    if (typeof document === "undefined") return;
    const target = document.getElementById(getRunnerThreadPromotedPermissionId(request.id));
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const focusTarget = target?.querySelector<HTMLElement>("button:not(:disabled)");
    focusTarget?.focus({ preventScroll: true });
  };

  return (
    <div className="tb-thread-timeline">
      {showLiveSupervision ? (
        <RunnerThreadLiveSupervisionDock
          projection={projection}
          onPermissionDecision={onPermissionDecision}
        />
      ) : null}

      {(hiddenBefore > 0 || canLoadFromServer) ? (
        <button type="button" className="tb-thread-load-earlier" onClick={() => void showEarlier()} disabled={loadingEarlier}>
          <ChevronUp strokeWidth={1.7} /> {loadingEarlier ? "Loading earlier activity…" : "Load earlier activity"}
        </button>
      ) : null}

      {visibleReferences.map((reference) => {
        const item = getReferenceItem(projection, reference);
        if (!item) return null;

        if (item.kind === "message") {
          const receipt = getMessageReceipt(projection, item);
          return (
            <RunnerThreadMessageView
              key={`message:${item.id}`}
              message={item}
              participant={resolveRunnerPublicThreadParticipant(
                projection,
                projection.participantsById[item.authorParticipantId],
                fallbackRunAgentName,
              )}
              receipt={receipt?.status === "failed" ? receipt : null}
              renderContent={renderMessageContent}
              renderUserContent={renderUserMessageContent}
              onCorrectRoute={onCorrectRoute}
            />
          );
        }

        if (item.kind === "run") {
          const runActivity = activityByRunId[item.id];
          return (
            <div key={`run:${item.id}`} ref={(element) => onRunElement?.(item.id, element)} className="tb-thread-run-anchor">
              {runPresentation === "receipt" && runReceiptsById[item.id] ? (
                <RunnerThreadRunReceipt
                  receipt={runReceiptsById[item.id]}
                  fallbackAgentName={fallbackRunAgentName}
                  fallbackWorkspaceName={fallbackRunWorkspaceName}
                  selected={selectedRunId === item.id}
                  onSelect={() => onSelectRun?.(item)}
                />
              ) : (
                <RunnerThreadRunActivityCard
                  run={item}
                  projection={projection}
                  fallbackAgentName={fallbackRunAgentName}
                  fallbackWorkspaceName={fallbackRunWorkspaceName}
                  renderAction={renderAction}
                  detailLoadState={runDetailStates?.[item.id] || (onLoadRunDetails ? { status: "idle", error: null } : undefined)}
                  activityGroupActionStates={activityGroupActionStates}
                  onLoadDetails={onLoadRunDetails}
                  onLoadActivityGroupActions={onLoadActivityGroupActions}
                  onControlRun={onControlRun}
                  onPermissionDecision={onPermissionDecision}
                  onOpenChanges={onOpenChanges}
                  activityGroups={runActivity?.groups || []}
                  actions={runActivity?.actions || []}
                  permissions={runActivity?.permissions || []}
                  promotePermissionsExternally
                />
              )}
            </div>
          );
        }

        if (item.kind === "permission") {
          if (item.status === "pending") {
            return (
              <RunnerThreadPermissionHistoryMarker
                key={`permission-history:${item.id}`}
                request={item}
                onOpen={openPromotedPermission}
              />
            );
          }
          if (item.status !== "pending" && item.runId && projection.runsById[item.runId]) return null;
          return (
            <RunnerThreadPermissionRequestCard
              key={`permission:${item.id}`}
              request={item}
              onDecision={onPermissionDecision}
            />
          );
        }

        if (item.kind === "event") {
          const custom = renderEvent?.(item);
          if (custom !== undefined) return <div key={`event:${item.id}`}>{custom}</div>;
          if (item.runId || !["user", "conversation"].includes(item.visibility || "user")) return null;
          if (!item.title && !item.summary) return null;
          return (
            <div key={`event:${item.id}`} className="tb-thread-system-event">
              <Activity strokeWidth={1.6} aria-hidden="true" />
              <span>{item.summary || item.title}</span>
            </div>
          );
        }

        return null;
      })}

      {hiddenAfter > 0 ? (
        <button type="button" className="tb-thread-load-earlier" onClick={() => setWindowEndKey(null)}>
          <ChevronDown strokeWidth={1.7} /> Return to latest activity · {hiddenAfter} newer
        </button>
      ) : null}
    </div>
  );
}
