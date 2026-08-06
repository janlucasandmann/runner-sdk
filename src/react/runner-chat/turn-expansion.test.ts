import { describe, expect, it } from "vitest";
import type { RunnerTurn } from "./turn-types.js";
import {
  getTurnRunSummarySignature,
  hasNewTurnRunSummary,
  mapExpandedTurns,
} from "./turn-expansion.js";

function turn(id: string, summary = ""): RunnerTurn {
  return {
    id,
    prompt: `Do work ${id}`,
    logs: summary
      ? [{
          time: "00:02",
          message: summary,
          type: "success",
          eventType: "agent_message",
        }]
      : [],
    startedAtMs: 0,
    status: "completed",
  };
}

describe("turn expansion projection", () => {
  it("detects newly materialized run summaries", () => {
    expect(getTurnRunSummarySignature(turn("turn", "Finished"))).toContain(
      "Finished",
    );
    expect(hasNewTurnRunSummary(
      [turn("turn")],
      [turn("turn", "Finished")],
    )).toBe(true);
  });

  it("collapses every turn when a new summary arrives", () => {
    expect(mapExpandedTurns(
      { old: true },
      [turn("old")],
      [turn("old", "Finished"), turn("new")],
      { collapseOnNewRunSummary: true },
    )).toEqual({
      old: false,
      new: false,
    });
  });

  it("preserves known expansion and leaves unknown turns collapsed by default", () => {
    expect(mapExpandedTurns(
      { old: false },
      [turn("old")],
      [turn("old"), turn("new")],
    )).toEqual({
      old: false,
    });
  });
});
