import { ArrowUpRight, ShieldAlert } from "lucide-react";
import type {
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
} from "../../thread/types.js";
import { selectRunnerThreadPendingPermissions } from "../../thread/selectors.js";
import { RunnerThreadPermissionRequestCard } from "./permission-request-card.js";

export interface RunnerThreadPendingPermissionsDockProps {
  projection: RunnerThreadProjection;
  onDecision?: (
    request: RunnerThreadPermissionRequest,
    decision: "allow" | "deny",
  ) => Promise<void> | void;
}

export interface RunnerThreadPermissionHistoryMarkerProps {
  request: RunnerThreadPermissionRequest;
  onOpen?: (request: RunnerThreadPermissionRequest) => void;
}

export function getRunnerThreadPromotedPermissionId(requestId: string): string {
  return `tb-thread-pending-permission-${encodeURIComponent(requestId)}`;
}

/**
 * Keeps unresolved permission requests at supervision altitude regardless of
 * where their original trace event sits in a long or virtualized timeline.
 */
export function RunnerThreadPendingPermissionsDock({
  projection,
  onDecision,
}: RunnerThreadPendingPermissionsDockProps) {
  const requests = selectRunnerThreadPendingPermissions(projection);
  if (requests.length === 0) return null;

  return (
    <aside
      className="tb-thread-pending-permissions"
      aria-label="Pending permission requests"
      aria-live="polite"
    >
      <div className="tb-thread-pending-permissions-heading">
        <span className="tb-thread-pending-permissions-title">
          <ShieldAlert strokeWidth={1.7} aria-hidden="true" />
          Action required
        </span>
        <span className="tb-thread-pending-permissions-count">
          {requests.length} {requests.length === 1 ? "request" : "requests"}
        </span>
      </div>
      <div className="tb-thread-pending-permissions-list">
        {requests.map((request) => (
          <div
            id={getRunnerThreadPromotedPermissionId(request.id)}
            key={request.id}
            data-permission-request-id={request.id}
          >
            <RunnerThreadPermissionRequestCard
              request={request}
              onDecision={onDecision}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

/**
 * The actionable card is promoted above, but this compact marker preserves the
 * request's causal position in the historical trace without duplicating it.
 */
export function RunnerThreadPermissionHistoryMarker({
  request,
  onOpen,
}: RunnerThreadPermissionHistoryMarkerProps) {
  const title = request.actionLabel || request.toolName || "External action";
  return (
    <button
      type="button"
      className="tb-thread-permission-history-marker"
      data-permission-request-id={request.id}
      onClick={() => onOpen?.(request)}
    >
      <ShieldAlert strokeWidth={1.7} aria-hidden="true" />
      <span className="tb-thread-permission-history-marker-copy">
        Permission requested · {title}
      </span>
      <span className="tb-thread-permission-history-marker-action">
        Open request
        <ArrowUpRight strokeWidth={1.7} aria-hidden="true" />
      </span>
    </button>
  );
}
