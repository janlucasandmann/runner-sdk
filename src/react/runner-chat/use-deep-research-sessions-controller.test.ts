// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { RunnerDeepResearchSession } from "../../types.js";
import { useRunnerDeepResearchSessionsController } from "./use-deep-research-sessions-controller.js";

function createSession(id: string, status: string, startedAt: string): RunnerDeepResearchSession {
  return {
    id,
    threadId: "thread-1",
    userId: "user-1",
    interactionId: null,
    topic: id,
    status,
    createdAt: startedAt,
    startedAt,
    completedAt: null,
    elapsedSeconds: null,
    thinkingSummaries: [],
    reportPath: null,
    reportLength: null,
    sourcesCount: null,
    errorMessage: null,
    metadata: null,
  };
}

describe("useRunnerDeepResearchSessionsController", () => {
  it("loads sessions and chooses the newest active one", async () => {
    const older = createSession("older", "running", "2026-01-02T03:00:00.000Z");
    const newer = createSession("newer", "running", "2026-01-02T04:00:00.000Z");
    const fetchSessions = vi.fn().mockResolvedValue([older, newer]);
    const { result } = renderHook(() =>
      useRunnerDeepResearchSessionsController({
        apiKey: "key",
        backendUrl: "https://runner.example",
        poll: false,
        refresh: true,
        services: { fetchSessions },
        threadId: "thread-1",
      }),
    );

    await waitFor(() => expect(result.current.sessions).toHaveLength(2));
    expect(result.current.activeSession?.id).toBe("newer");
    expect(result.current.hasActiveSession).toBe(true);
  });

  it("clears cached sessions when refresh eligibility ends", async () => {
    const fetchSessions = vi
      .fn()
      .mockResolvedValue([createSession("session-1", "completed", "2026-01-02T03:00:00.000Z")]);
    const services = { fetchSessions };
    const { result, rerender } = renderHook(
      ({ refresh }: { refresh: boolean }) =>
        useRunnerDeepResearchSessionsController({
          apiKey: "key",
          backendUrl: "https://runner.example",
          poll: false,
          refresh,
          services,
          threadId: "thread-1",
        }),
      { initialProps: { refresh: true } },
    );
    await waitFor(() => expect(result.current.sessions).toHaveLength(1));

    rerender({ refresh: false });
    await waitFor(() => expect(result.current.sessions).toHaveLength(0));
    expect(result.current.hasActiveSession).toBe(false);
  });
});
