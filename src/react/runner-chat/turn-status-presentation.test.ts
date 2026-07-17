import { describe, expect, it } from "vitest";

import type { RunnerLog } from "../../types.js";
import type { RunnerTurn } from "./turn-types.js";
import {
  getRunnerTurnDurationSeconds,
  getRunnerTurnLiveWorkSummary,
} from "./turn-status-presentation.js";

function createTurn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn_1",
    prompt: "Do the work",
    logs: [],
    startedAtMs: 1_000,
    status: "running",
    ...overrides,
  };
}

describe("turn status presentation", () => {
  it("uses the live clock only for running turns", () => {
    expect(getRunnerTurnDurationSeconds(createTurn(), 6_100)).toBe(5);
    expect(
      getRunnerTurnDurationSeconds(
        createTurn({
          status: "completed",
          completedAtMs: 4_200,
        }),
        20_000,
      ),
    ).toBe(3);
  });

  it("prefers observer summaries and normalizes them to one line", () => {
    const summary = getRunnerTurnLiveWorkSummary(
      createTurn({
        logs: [
          {
            time: "00:01",
            message: "Ran a command",
            type: "info",
            metadata: {
              observerSummary: "working: validating\nall service contracts",
            } as unknown as RunnerLog["metadata"],
          },
        ],
      }),
    );

    expect(summary).toBe("Validating all service contracts");
  });

  it("does not use assistant or permission messages as fallback status", () => {
    const summary = getRunnerTurnLiveWorkSummary(
      createTurn({
        logs: [
          {
            time: "00:01",
            message: "Allow deployment?",
            type: "info",
            eventType: "permission_request",
          },
          {
            time: "00:02",
            message: "Final answer",
            type: "info",
            eventType: "agent_message",
          },
        ],
      }),
    );

    expect(summary).toBeNull();
  });
});
