import type { RunnerLog } from "../../types.js";
import type { RunnerTurn } from "./turn-types.js";

export interface RunnerParticipantNeutralPendingTurnInput {
  id: string;
  prompt: string;
  startedAtMs: number;
  isInitialTurn: boolean;
  agentName?: string | null;
  environmentName?: string | null;
}

export interface RunnerParticipantNeutralAnswer {
  content: string;
  receiptId?: string | null;
  receiptStatus?: string | null;
}

function buildRoutingLog(startedAtMs: number, message = "Reviewing thread context"): RunnerLog {
  return {
    time: new Date(startedAtMs).toISOString(),
    message,
    type: "info",
    eventType: "setup",
  };
}

/**
 * Builds the public turn shown while the thread router decides which internal
 * participant should handle a message. Internal ownership stays in canonical
 * thread data and is intentionally absent from this presentation model.
 */
export function createRunnerParticipantNeutralPendingTurn({
  id,
  prompt,
  startedAtMs,
  isInitialTurn,
  agentName,
  environmentName,
}: RunnerParticipantNeutralPendingTurnInput): RunnerTurn {
  return {
    id,
    prompt,
    logs: [buildRoutingLog(startedAtMs)],
    startedAtMs,
    status: "running",
    animateOnRender: true,
    isInitialTurn,
    agentName: agentName || null,
    environmentName: environmentName || null,
    presentation: "default",
    messageMetadata: {
      source: "thread_v2_routed_response",
    },
  };
}

export function completeRunnerParticipantNeutralTurn(
  turn: RunnerTurn,
  answer: RunnerParticipantNeutralAnswer,
  completedAtMs: number,
): RunnerTurn {
  const normalizedContent = answer.content.trim();
  const completedAtIso = new Date(completedAtMs).toISOString();
  return {
    ...turn,
    logs: [
      buildRoutingLog(turn.startedAtMs, "Reviewed thread context"),
      {
        time: completedAtIso,
        message: normalizedContent,
        type: "success",
        eventType: "agent_message",
      },
    ],
    completedAtMs,
    durationSeconds: Math.max(0, Math.round((completedAtMs - turn.startedAtMs) / 1000)),
    status: "completed",
    presentation: "default",
    messageMetadata: {
      ...(turn.messageMetadata || {}),
      source: "thread_v2_routed_response",
      ...(answer.receiptId ? { routingReceiptId: answer.receiptId } : {}),
      ...(answer.receiptStatus ? { routingReceiptStatus: answer.receiptStatus } : {}),
    },
  };
}
