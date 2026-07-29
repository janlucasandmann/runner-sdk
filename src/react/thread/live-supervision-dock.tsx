import type {
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "../../thread/types.js";
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
 * Keeps unresolved permission asks actionable above the historical timeline.
 * Live run status remains in the causal run card instead of a sticky label.
 */
export function RunnerThreadLiveSupervisionDock({
  projection,
  onPermissionDecision,
}: RunnerThreadLiveSupervisionDockProps) {
  const hasPendingPermissions = Object.values(projection.permissionsById).some(
    (permission) => permission.status === "pending",
  );
  if (!hasPendingPermissions) return null;

  return (
    <section className="tb-thread-live-supervision" aria-label="Live thread supervision">
      <RunnerThreadPendingPermissionsDock
        projection={projection}
        onDecision={onPermissionDecision}
      />
    </section>
  );
}
