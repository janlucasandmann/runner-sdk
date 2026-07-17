import { describe, expect, it } from "vitest";

import type { RunnerTurn } from "./turn-types.js";
import { buildRunnerTurnTimelineState } from "./turn-timeline-state.js";

function createTurn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn_1",
    prompt: "Run",
    logs: [],
    startedAtMs: 1,
    status: "running",
    ...overrides,
  };
}

describe("turn timeline state", () => {
  it("provides a setup row while an empty turn is starting", () => {
    const turn = createTurn();
    const state = buildRunnerTurnTimelineState({
      turn,
      turns: [turn],
      deepResearchSessions: [],
      activeDeepResearchThreadSession: null,
    });

    expect(state.displayedTimelineItems).toHaveLength(1);
    expect(state.displayedTimelineItems[0]?.kind).toBe("log");
  });

  it("separates the final assistant message from working activity", () => {
    const turn = createTurn({
      status: "completed",
      logs: [
        {
          time: "00:01",
          message: "Ran tests",
          type: "success",
          eventType: "command_execution",
        },
        {
          time: "00:02",
          message: "Finished",
          type: "success",
          eventType: "agent_message",
        },
      ],
    });
    const state = buildRunnerTurnTimelineState({
      turn,
      turns: [turn],
      deepResearchSessions: [],
      activeDeepResearchThreadSession: null,
    });

    expect(state.agentMessage?.message).toBe("Finished");
    expect(state.displayedTimelineItems).toHaveLength(1);
  });
});
