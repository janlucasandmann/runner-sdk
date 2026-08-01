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

  it("coalesces streamed words before exposing working-log items", () => {
    const turn = createTurn({
      logs: [
        {
          time: "00:01",
          message: "Inspecting",
          type: "info",
          eventType: "reasoning",
          metadata: { source: "provider_reasoning", runId: "run_1" },
        },
        {
          time: "00:01",
          message: "the",
          type: "info",
          eventType: "reasoning",
          metadata: { source: "provider_reasoning", runId: "run_1" },
        },
        {
          time: "00:01",
          message: "repository",
          type: "info",
          eventType: "reasoning",
          metadata: { source: "provider_reasoning", runId: "run_1" },
        },
        {
          time: "00:02",
          message: "npm test",
          type: "success",
          eventType: "command_execution",
          metadata: { command: "npm test", runId: "run_1" },
        },
      ],
    });
    const state = buildRunnerTurnTimelineState({
      turn,
      turns: [turn],
      deepResearchSessions: [],
      activeDeepResearchThreadSession: null,
    });

    expect(state.displayedTimelineItems).toHaveLength(2);
    expect(state.displayedTimelineItems[0]).toMatchObject({
      kind: "log",
      log: {
        message: "Inspecting the repository",
        metadata: { streamCoalesced: true, fragmentCount: 3 },
      },
    });
    expect(state.displayedTimelineItems[1]).toMatchObject({
      kind: "log",
      log: { eventType: "command_execution" },
    });
  });
});
