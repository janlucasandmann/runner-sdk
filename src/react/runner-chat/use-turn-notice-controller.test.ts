// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { RunnerTurn } from "./turn-types.js";
import { useRunnerTurnNoticeController } from "./use-turn-notice-controller.js";

function useHarness() {
  const [turns, setTurns] = useState<RunnerTurn[]>([]);
  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({});
  let nextId = 0;
  const controller = useRunnerTurnNoticeController({
    agentName: "Worker",
    createTurnId: () => `turn-${++nextId}`,
    environmentName: "Computer",
    now: () => 10_000,
    setExpandedTurns,
    setTurns,
  });
  return { controller, expandedTurns, turns };
}

describe("useRunnerTurnNoticeController", () => {
  it("appends a collapsed completed synthetic turn", () => {
    const { result } = renderHook(() => useHarness());

    act(() => {
      result.current.controller.appendSyntheticActionTurn(
        "Status?",
        "Tests are passing.",
        "Communicator answered",
        { presentation: "btw" },
      );
    });

    expect(result.current.turns).toHaveLength(1);
    expect(result.current.turns[0]).toMatchObject({
      id: "turn-1",
      prompt: "Status?",
      status: "completed",
      presentation: "btw",
      agentName: "Worker",
      environmentName: "Computer",
    });
    expect(result.current.turns[0]?.logs.map((log) => log.message)).toEqual([
      "Communicator answered",
      "Tests are passing.",
    ]);
    expect(result.current.expandedTurns["turn-1"]).toBe(false);
  });

  it("creates completed and pending context notices", () => {
    const { result } = renderHook(() => useHarness());

    act(() => {
      result.current.controller.appendThreadContextActionNotice("clear", "Context was cleared");
      result.current.controller.appendPendingThreadContextActionNotice(
        "compact",
        "Compacting context",
        { prompt: "/compact" },
      );
    });

    expect(result.current.turns).toHaveLength(2);
    expect(result.current.turns[0]).toMatchObject({
      status: "completed",
      presentation: "context-action-notice",
    });
    expect(result.current.turns[1]).toMatchObject({
      prompt: "/compact",
      status: "running",
      presentation: "context-action-notice",
    });
    expect(result.current.turns[1]?.logs[0]?.metadata?.isPending).toBe(true);
  });

  it("finishes or fails the matching pending notice immutably", () => {
    const { result } = renderHook(() => useHarness());
    let turnId = "";

    act(() => {
      turnId = result.current.controller.appendPendingThreadContextActionNotice(
        "compact",
        "Compacting context",
      );
    });
    const originalTurn = result.current.turns[0];

    act(() => {
      result.current.controller.updateThreadContextActionNotice(
        turnId,
        "Failed to compact context",
        { failed: true },
      );
    });

    expect(result.current.turns[0]).not.toBe(originalTurn);
    expect(result.current.turns[0]).toMatchObject({
      status: "failed",
      completedAtMs: 10_000,
    });
    expect(result.current.turns[0]?.logs[0]).toMatchObject({
      message: "Failed to compact context",
      type: "error",
      metadata: {
        failed: true,
        isPending: false,
      },
    });
  });
});
