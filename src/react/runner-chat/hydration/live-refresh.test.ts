import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchThreadLiveRefreshPayload,
  resolveHydrationInitialPrompt,
} from "./live-refresh.js";

describe("runner live hydration refresh", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses cached prompt before the first visible non-context turn", () => {
    expect(
      resolveHydrationInitialPrompt(
        [
          {
            id: "context",
            prompt: "/compact",
            logs: [],
            startedAtMs: 1,
            status: "completed",
            presentation: "context-action-notice",
          },
          {
            id: "work",
            prompt: "Build it",
            logs: [],
            startedAtMs: 2,
            status: "completed",
          },
        ],
        null,
      ),
    ).toBe("Build it");
    expect(
      resolveHydrationInitialPrompt([], {
        threadId: "thread",
        initialPrompt: "Cached task",
        logs: [],
        messages: [],
      }),
    ).toBe("Cached task");
  });

  it("refreshes logs while reusing cached conversation and thread identity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          status: "running",
          logs: [
            {
              time: "00:02",
              type: "info",
              eventType: "command_execution",
              message: "npm test",
            },
          ],
          duration: 2,
          agentName: "Forge",
          environmentName: "Workspace",
        }),
      ),
    );
    const payload = await fetchThreadLiveRefreshPayload({
      backendUrl: "https://runner.example",
      apiKey: "token",
      threadId: "thread-1",
      statusSnapshot: {
        status: "running",
        updatedAt: "2026-07-16T10:00:02.000Z",
        completedAt: null,
      },
      existingTurns: [],
      cachedPayload: {
        threadId: "thread-1",
        initialPrompt: "Build it",
        logs: [],
        messages: [
          {
            id: "user-1",
            role: "user",
            content: "Build it",
          },
        ],
      },
    });

    expect(payload).toMatchObject({
      threadId: "thread-1",
      threadStatus: "running",
      initialPrompt: "Build it",
      agentName: "Forge",
      environmentName: "Workspace",
      durationSeconds: 2,
    });
    expect(payload.logs).toHaveLength(1);
    expect(payload.messages).toHaveLength(1);
  });
});
