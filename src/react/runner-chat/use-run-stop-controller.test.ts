// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { RunnerTurn } from "./turn-types.js";
import { useRunnerRunStopController } from "./use-run-stop-controller.js";

function createRunningTurn(): RunnerTurn {
  return {
    id: "turn-1",
    prompt: "Run",
    logs: [],
    startedAtMs: 1_000,
    status: "running",
  };
}

describe("useRunnerRunStopController", () => {
  it("cancels local and remote execution and normalizes the pending stream abort", async () => {
    const cancelThreadExecution = vi.fn().mockResolvedValue(undefined);
    const cancelLocalExecution = vi.fn();
    const onRunCancel = vi.fn();
    const { result } = renderHook(() => {
      const [turns, setTurns] = useState<RunnerTurn[]>([createRunningTurn()]);
      const controller = useRunnerRunStopController({
        apiKey: "key",
        backendUrl: "https://runner.example",
        cancelLocalExecution,
        clearQueuedMessages: vi.fn(),
        localExecutionRunning: true,
        onRunCancel,
        services: {
          cancelThreadExecution,
          now: () => 6_000,
        },
        setError: vi.fn(),
        setPreparingRun: vi.fn(),
        setTurns,
        threadId: "thread-1",
      });
      return { controller, turns };
    });

    await act(async () => {
      await result.current.controller.handleStopActiveRun();
    });

    expect(cancelThreadExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: "thread-1",
      }),
    );
    expect(cancelLocalExecution).toHaveBeenCalledOnce();
    expect(onRunCancel).toHaveBeenCalledWith("thread-1");
    expect(result.current.turns[0]).toEqual(
      expect.objectContaining({
        completedAtMs: 6_000,
        durationSeconds: 5,
        status: "cancelled",
      }),
    );

    const transportError = new Error("Failed to fetch");
    const normalized = result.current.controller.normalizeIntentionalStopError(
      transportError,
      "thread-1",
    );
    expect(normalized.name).toBe("AbortError");
    expect(result.current.controller.consumeIntentionalStopAbort(transportError, "thread-1")).toBe(
      true,
    );
    expect(result.current.controller.consumeIntentionalStopAbort(transportError, "thread-1")).toBe(
      false,
    );
  });

  it("finalizes local execution when remote cancellation fails", async () => {
    const failure = new Error("Cancellation unavailable");
    const cancelThreadExecution = vi.fn().mockRejectedValue(failure);
    const cancelLocalExecution = vi.fn();
    const onRunError = vi.fn();
    const setError = vi.fn();
    const { result } = renderHook(() => {
      const [, setTurns] = useState<RunnerTurn[]>([]);
      return useRunnerRunStopController({
        apiKey: "key",
        backendUrl: "https://runner.example",
        cancelLocalExecution,
        clearQueuedMessages: vi.fn(),
        localExecutionRunning: false,
        onRunError,
        services: { cancelThreadExecution },
        setError,
        setPreparingRun: vi.fn(),
        setTurns,
        threadId: "thread-1",
      });
    });

    await act(async () => {
      await result.current.handleStopActiveRun();
    });

    expect(setError).toHaveBeenCalledWith("Cancellation unavailable");
    expect(onRunError).toHaveBeenCalledWith(failure, "thread-1");
    expect(cancelLocalExecution).toHaveBeenCalledOnce();
    expect(result.current.isStoppingRun).toBe(false);
  });

  it("uses the session-authenticated gateway when no API key is present", async () => {
    const cancelThreadExecution = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRunnerRunStopController({
      apiKey: "",
      backendUrl: "/api/real",
      cancelLocalExecution: vi.fn(),
      clearQueuedMessages: vi.fn(),
      localExecutionRunning: false,
      services: { cancelThreadExecution },
      setError: vi.fn(),
      setPreparingRun: vi.fn(),
      setTurns: vi.fn(),
      threadId: "thread-session-auth",
    }));

    await act(async () => {
      await result.current.handleStopActiveRun();
    });

    expect(cancelThreadExecution).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: "",
      backendUrl: "/api/real",
      threadId: "thread-session-auth",
    }));
  });
});
