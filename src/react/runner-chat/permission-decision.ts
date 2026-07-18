import type { RunnerLog } from "../../types.js";
import { buildRunnerHeaders } from "./api-utils.js";
import type { RunnerTurn, RunnerTurnStatus } from "./turn-types.js";

export type RunnerPermissionDecision = "allow" | "deny";

interface RunnerPermissionDecisionResponse {
  active?: boolean;
  canonicalMirrored?: boolean;
  message?: string;
}

export interface SubmitRunnerPermissionDecisionOptions {
  apiKey: string;
  backendUrl: string;
  decision: RunnerPermissionDecision;
  fetchImpl?: typeof fetch;
  log: RunnerLog;
  now?: () => number;
  requestHeaders?: HeadersInit;
  threadId?: string | null;
}

export interface RunnerPermissionDecisionOutcome {
  completedAtMs?: number;
  decision: RunnerPermissionDecision;
  nextTurnStatus: RunnerTurnStatus;
  notice: string | null;
  requestId: string;
}

export async function submitRunnerPermissionDecision({
  apiKey,
  backendUrl,
  decision,
  fetchImpl = globalThis.fetch,
  log,
  now = () => Date.now(),
  requestHeaders,
  threadId,
}: SubmitRunnerPermissionDecisionOptions): Promise<RunnerPermissionDecisionOutcome> {
  const normalizedApiKey = apiKey.trim();
  const normalizedBackendUrl = backendUrl.trim().replace(/\/+$/, "");
  const normalizedThreadId = String(threadId || "").trim();
  const requestId = String(log.metadata?.permissionRequestId || "").trim();
  if (!normalizedThreadId || !requestId || !normalizedBackendUrl || !normalizedApiKey) {
    throw new Error(
      "This permission request is missing the thread or request identity required to submit a decision.",
    );
  }

  const headers = buildRunnerHeaders(requestHeaders, normalizedApiKey);
  headers.set("Content-Type", "application/json");
  const response = await fetchImpl(
    `${normalizedBackendUrl}/threads/${encodeURIComponent(
      normalizedThreadId,
    )}/permission-requests/${encodeURIComponent(requestId)}/decision`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ decision }),
    },
  );
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      bodyText ||
        `Failed to ${
          decision === "allow" ? "approve" : "deny"
        } permission request (${response.status})`,
    );
  }

  const result = (await response
    .json()
    .catch(() => null)) as RunnerPermissionDecisionResponse | null;
  const nextTurnStatus: RunnerTurnStatus = result?.active === false ? "cancelled" : "running";
  const completedAtMs = result?.active === false ? now() : undefined;
  const notice =
    result?.active === false && result.message
      ? result.message
      : result?.canonicalMirrored === false
        ? "The permission ruling was applied, but the live Thread view could not confirm its durable update. Refresh to reconcile the run state."
        : null;

  return {
    completedAtMs,
    decision,
    nextTurnStatus,
    notice,
    requestId,
  };
}

export function applyRunnerPermissionDecision(
  turns: RunnerTurn[],
  outcome: RunnerPermissionDecisionOutcome,
): RunnerTurn[] {
  return turns.map((turn) => ({
    ...turn,
    status: turn.status === "permission_asked" ? outcome.nextTurnStatus : turn.status,
    completedAtMs:
      turn.status === "permission_asked" && outcome.completedAtMs
        ? outcome.completedAtMs
        : turn.completedAtMs,
    logs: turn.logs.map((entry) => {
      if (entry.metadata?.permissionRequestId !== outcome.requestId) {
        return entry;
      }
      return {
        ...entry,
        type: outcome.decision === "allow" ? "success" : "warning",
        metadata: {
          ...entry.metadata,
          status: outcome.decision === "allow" ? "approved" : "denied",
          decision: outcome.decision === "allow" ? "approved" : "denied",
        },
      };
    }),
  }));
}
