import { describe, expect, it } from "vitest";
import {
  getNextRunnerQueuedMessage,
  type RunnerPendingMessage,
} from "./queued-execution.js";

const message: RunnerPendingMessage = {
  id: "queue_1",
  turnId: "turn_1",
  prompt: "continue",
  attachments: [],
};

describe("getNextRunnerQueuedMessage", () => {
  it("returns the queue head only when the executor is idle", () => {
    expect(
      getNextRunnerQueuedMessage({
        hasActiveRun: false,
        isDraining: false,
        isPreparingRun: false,
        messages: [message],
      }),
    ).toBe(message);
  });

  it("does not drain while another run owns the executor", () => {
    expect(
      getNextRunnerQueuedMessage({
        hasActiveRun: true,
        isDraining: false,
        isPreparingRun: false,
        messages: [message],
      }),
    ).toBeNull();
  });
});
