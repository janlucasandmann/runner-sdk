import { describe, expect, it, vi } from "vitest";
import {
  getRunnerActiveRunInstructionNotice,
  persistRunnerActiveRunInstruction,
} from "./active-run-instruction.js";

const createdAt = "2026-07-17T08:00:00.000Z";

function routedResult(overrides: Record<string, unknown> = {}) {
  return {
    message: {
      kind: "message" as const,
      id: "message-1",
      threadId: "thread-1",
      sequence: 2,
      authorParticipantId: "human-1",
      content: "Keep the public API stable",
      modality: "text",
      createdAt,
    },
    routingReceipt: {
      kind: "routing_receipt" as const,
      id: "receipt-1",
      threadId: "thread-1",
      messageId: "message-1",
      sequence: 3,
      route: "worker",
      deliveryMode: "checkpoint" as const,
      status: "queued",
      runId: "run-1",
      createdAt,
    },
    accepted: true,
    delivered: false,
    effectApplied: false,
    coordinatorRequired: true,
    limitation: "Waiting for the run coordinator.",
    ...overrides,
  };
}

describe("active run instructions", () => {
  it("persists an idempotent checkpoint message before reporting queued", async () => {
    const postMessage = vi.fn(async () => routedResult());
    const instruction = await persistRunnerActiveRunInstruction({
      clientMessageId: "instruction-1",
      content: " Keep the public API stable ",
      postMessage,
      runId: "run-1",
    });

    expect(instruction.status).toBe("queued");
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
      id: "instruction-1",
      clientMessageId: "instruction-1",
      content: "Keep the public API stable",
      intendedRoute: "worker",
      deliveryMode: "checkpoint",
      replyToRunId: "run-1",
      metadata: expect.objectContaining({
        idempotencyKey: "instruction-1",
        coordinatorDurable: true,
      }),
    }));
    expect(getRunnerActiveRunInstructionNotice(instruction)).toBe(
      "Waiting for the run coordinator.",
    );
  });

  it("never claims delivery without a worker routing receipt", async () => {
    await expect(persistRunnerActiveRunInstruction({
      clientMessageId: "instruction-2",
      content: "Continue",
      postMessage: async () => routedResult({ routingReceipt: null }),
      runId: "run-1",
    })).rejects.toThrow(/no routing receipt/i);

    await expect(persistRunnerActiveRunInstruction({
      clientMessageId: "instruction-3",
      content: "Continue",
      postMessage: async () => routedResult({
        routingReceipt: {
          ...routedResult().routingReceipt,
          route: "communicator",
        },
      }),
      runId: "run-1",
    })).rejects.toThrow(/instead of the worker/i);
  });

  it("distinguishes acknowledged delivery from unavailable delivery", async () => {
    const delivered = await persistRunnerActiveRunInstruction({
      clientMessageId: "instruction-4",
      content: "Continue",
      postMessage: async () => routedResult({
        routingReceipt: {
          ...routedResult().routingReceipt,
          status: "delivered",
        },
        delivered: true,
        effectApplied: true,
        coordinatorRequired: false,
        limitation: null,
      }),
      runId: "run-1",
    });
    expect(delivered.status).toBe("delivered");
    expect(getRunnerActiveRunInstructionNotice(delivered)).toBeNull();

    const unavailable = await persistRunnerActiveRunInstruction({
      clientMessageId: "instruction-5",
      content: "Continue",
      postMessage: async () => routedResult({
        routingReceipt: {
          ...routedResult().routingReceipt,
          status: "failed",
        },
        limitation: "Coordinator offline.",
      }),
      runId: "run-1",
    });
    expect(unavailable.status).toBe("delivery_unavailable");
    expect(getRunnerActiveRunInstructionNotice(unavailable)).toBe("Coordinator offline.");
  });
});
