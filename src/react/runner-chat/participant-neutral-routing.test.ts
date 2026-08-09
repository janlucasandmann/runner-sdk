import { describe, expect, it } from "vitest";
import {
  completeRunnerParticipantNeutralTurn,
  createRunnerParticipantNeutralPendingTurn,
} from "./participant-neutral-routing.js";

describe("participant-neutral routed turns", () => {
  it("starts with the normal agent presentation while routing is pending", () => {
    const turn = createRunnerParticipantNeutralPendingTurn({
      id: "turn-1",
      prompt: "How would you improve this?",
      startedAtMs: 1_000,
      isInitialTurn: false,
      agentName: "Spark",
      environmentName: "Default",
    });

    expect(turn.status).toBe("running");
    expect(turn.presentation).toBe("default");
    expect(turn.agentName).toBe("Spark");
    expect(turn.logs[0]?.message).toBe("Reviewing thread context");
    expect(JSON.stringify(turn)).not.toMatch(/communicator|observer/i);
  });

  it("completes the same turn without exposing the internal answerer", () => {
    const pending = createRunnerParticipantNeutralPendingTurn({
      id: "turn-1",
      prompt: "Status?",
      startedAtMs: 1_000,
      isInitialTurn: false,
      agentName: "Spark",
      environmentName: "Default",
    });

    const completed = completeRunnerParticipantNeutralTurn(
      pending,
      {
        content: "The requested work is complete.",
        receiptId: "receipt-1",
        receiptStatus: "answered",
      },
      11_000,
    );

    expect(completed.id).toBe(pending.id);
    expect(completed.status).toBe("completed");
    expect(completed.durationSeconds).toBe(10);
    expect(completed.logs.at(-1)).toMatchObject({
      eventType: "agent_message",
      message: "The requested work is complete.",
    });
    expect(completed.messageMetadata).toMatchObject({
      source: "thread_v2_routed_response",
      routingReceiptId: "receipt-1",
    });
    expect(JSON.stringify(completed)).not.toMatch(/communicator|observer/i);
  });
});
