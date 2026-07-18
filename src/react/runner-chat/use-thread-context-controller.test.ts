// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerThreadContextController } from "./use-thread-context-controller.js";

function createContext() {
  return {
    threadId: "thread-1",
    sessionId: null,
    model: "test-model",
    maxTokens: 1_000,
    usedTokens: 120,
    remainingTokens: 880,
    remainingRatio: 0.88,
    source: "test",
    exact: true,
  };
}

describe("useRunnerThreadContextController", () => {
  it("loads the estimate and lazy details for the active thread", async () => {
    const context = createContext();
    const details = { ...context, categories: [] };
    const fetchEstimate = vi.fn().mockResolvedValue(context);
    const fetchDetails = vi.fn().mockResolvedValue({
      context: details,
      availableActions: {
        compact: true,
        clear: false,
        fork: true,
        btw: true,
      },
      nativeError: null,
    });
    const services = { fetchDetails, fetchEstimate };
    const { result, rerender } = renderHook(
      ({ detailsRequested }: { detailsRequested: boolean }) =>
        useRunnerThreadContextController({
          apiKey: "key",
          backendUrl: "https://runner.example",
          detailsRequested,
          executionRunning: false,
          services,
          threadId: "thread-1",
        }),
      { initialProps: { detailsRequested: false } },
    );

    await waitFor(() => expect(result.current.context).toEqual(context));
    expect(fetchDetails).not.toHaveBeenCalled();

    rerender({ detailsRequested: true });
    await waitFor(() => expect(result.current.details).toEqual(details));
    expect(result.current.availableActions.clear).toBe(false);
    expect(fetchDetails).toHaveBeenCalledOnce();
  });

  it("exposes semantic action and clear transitions", async () => {
    const context = createContext();
    const details = { ...context, categories: [] };
    const { result } = renderHook(() =>
      useRunnerThreadContextController({
        apiKey: "key",
        backendUrl: "https://runner.example",
        detailsRequested: true,
        executionRunning: false,
        services: {
          fetchDetails: vi.fn().mockResolvedValue({
            context: details,
            availableActions: {
              compact: true,
              clear: true,
              fork: true,
              btw: true,
            },
            nativeError: null,
          }),
          fetchEstimate: vi.fn().mockResolvedValue(context),
        },
        threadId: "thread-1",
      }),
    );
    await waitFor(() => expect(result.current.details).toEqual(details));

    act(() => result.current.beginAction("compact"));
    expect(result.current.actionLoading).toBe("compact");
    act(() => result.current.finishAction());
    expect(result.current.actionLoading).toBeNull();

    act(() => result.current.markContextCleared());
    expect(result.current.context).toBeNull();
    expect(result.current.details).toBeNull();
  });

  it("normalizes detail failures and resets on thread changes", async () => {
    const fetchDetails = vi.fn().mockRejectedValue(new Error("Context unavailable"));
    const services = {
      fetchDetails,
      fetchEstimate: vi.fn().mockResolvedValue(null),
    };
    const { result, rerender } = renderHook(
      ({ threadId }: { threadId: string | null }) =>
        useRunnerThreadContextController({
          apiKey: "key",
          backendUrl: "https://runner.example",
          detailsRequested: true,
          executionRunning: false,
          services,
          threadId,
        }),
      { initialProps: { threadId: "thread-1" as string | null } },
    );

    await waitFor(() => expect(result.current.detailsError).toBe("Context unavailable"));
    rerender({ threadId: null });
    await waitFor(() => expect(result.current.detailsError).toBeNull());
    expect(result.current.availableActions.clear).toBe(false);
  });
});
