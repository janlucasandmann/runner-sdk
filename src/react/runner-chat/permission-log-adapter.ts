import type { RunnerLog } from "../../types.js";
import type { RunnerThreadPermissionRequest } from "../../thread/types.js";

/**
 * Compatibility adapter for the existing permission-decision transport.
 * Presentation remains canonical while the decision endpoint still accepts a
 * normalized RunnerLog-shaped request.
 */
export function adaptRunnerThreadPermissionRequestToRunnerLog(
  request: RunnerThreadPermissionRequest,
): RunnerLog {
  return {
    createdAt: request.createdAt,
    time: "",
    message: `Permission requested: ${request.toolName || request.actionLabel || "tool"}`,
    type: "warning",
    eventType: "permission_request",
    metadata: {
      permissionRequestId: request.id,
      permissionRing: request.permissionRing || undefined,
      permissionRingLabel: request.ringLabel || undefined,
      permissionRingDescription: request.ringDescription || undefined,
      permissionActionLabel: request.actionLabel || undefined,
      permissionActionDescription: request.actionDescription || undefined,
      toolName: request.toolName || undefined,
      input: typeof request.input === "string"
        ? request.input
        : JSON.stringify(request.input ?? {}),
      reason: request.reason || undefined,
      status: "pending",
      decision: "pending",
    },
  };
}
