import { describe, expect, it } from "vitest";
import type { RunnerTurn } from "../turn-types.js";
import {
  applyHydratedRunningThreadState,
  getTurnAssistantMessageText,
  getTurnLatestProgressTimestampMs,
  isActiveTurnStatus,
  settleHydratedTerminalThreadTurns,
  turnPresentation,
} from "./turn-state.js";

function turn(overrides: Partial<RunnerTurn> = {}): RunnerTurn {
  return {
    id: "turn",
    prompt: "Do the work",
    logs: [],
    startedAtMs: Date.parse("2026-07-16T10:00:00.000Z"),
    status: "completed",
    ...overrides,
  };
}

describe("runner hydrated turn state", () => {
  it("derives presentation, activity, assistant text, and latest progress", () => {
    const value = turn({
      prompt: "/btw what changed?",
      logs: [
        {
          time: "00:05",
          type: "info",
          eventType: "agent_message",
          message: "<system-reminder>hidden</system-reminder>Done",
        },
      ],
    });
    expect(turnPresentation(value)).toBe("btw");
    expect(getTurnAssistantMessageText(value)).toBe("Done");
    expect(getTurnLatestProgressTimestampMs(value)).toBe(
      Date.parse("2026-07-16T10:00:05.000Z"),
    );
    expect(isActiveTurnStatus("permission_asked")).toBe(true);
  });

  it("settles active turns from terminal thread state", () => {
    const settled = settleHydratedTerminalThreadTurns(
      [turn({ status: "running" })],
      {
        threadStatus: "failed",
        completedAtMs: Date.parse("2026-07-16T10:01:00.000Z"),
      },
    );
    expect(settled[0]).toMatchObject({
      status: "failed",
      completedAtMs: Date.parse("2026-07-16T10:01:00.000Z"),
    });
  });

  it("marks the latest turn as running or permission-blocked from remote state", () => {
    expect(
      applyHydratedRunningThreadState(
        [turn()],
        { threadStatus: "running", completedAtMs: null },
      )[0],
    ).toMatchObject({ status: "running", completedAtMs: undefined });
    expect(
      applyHydratedRunningThreadState(
        [turn()],
        { threadStatus: "permission asked", completedAtMs: null },
      )[0],
    ).toMatchObject({ status: "permission_asked", completedAtMs: undefined });
  });
});
