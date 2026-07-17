import type {
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "../../thread/types.js";
import { RunnerThreadActiveRunsDock } from "./active-runs-dock.js";
import { RunnerThreadPendingPermissionsDock } from "./pending-permissions-dock.js";

export interface RunnerThreadLiveSupervisionDockProps {
  projection: RunnerThreadProjection;
  onCancelRun?: (run: RunnerThreadRun) => Promise<void> | void;
  onPermissionDecision?: (
    request: RunnerThreadPermissionRequest,
    decision: "allow" | "deny",
  ) => Promise<void> | void;
  onSelectRun?: (run: RunnerThreadRun) => void;
}

/**
 * One sticky, current-state projection for live runs and unresolved asks.
 * Historical timeline entries remain causal evidence, not the control surface.
 */
export function RunnerThreadLiveSupervisionDock({
  projection,
  onCancelRun,
  onPermissionDecision,
  onSelectRun,
}: RunnerThreadLiveSupervisionDockProps) {
  const runs = Object.values(projection.runsById);
  const hasActiveRuns = runs.some((run) => (
    ["queued", "pending", "running", "parked", "waiting", "waiting_permission", "requires_action"]
      .includes(run.status)
  ));
  const hasPendingPermissions = Object.values(projection.permissionsById)
    .some((permission) => permission.status === "pending");
  if (!hasActiveRuns && !hasPendingPermissions) return null;

  return (
    <div className="tb-thread-live-supervision" aria-label="Live thread supervision">
      <RunnerThreadActiveRunsDock
        runs={runs}
        projection={projection}
        onSelectRun={onSelectRun}
        onCancelRun={onCancelRun}
      />
      <RunnerThreadPendingPermissionsDock
        projection={projection}
        onDecision={onPermissionDecision}
      />
    </div>
  );
}
