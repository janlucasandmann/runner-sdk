import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchThreadHydrationPayload,
  fetchThreadStatusSnapshot,
  normalizeRunnerDeepResearchSession,
} from "./api.js";

describe("runner hydration API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads thread, logs, steps, and canonical messages into one payload", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/threads/thread-1")) {
        return Response.json({
          thread: {
            id: "thread-1",
            status: "completed",
            task: "Build it",
            environmentId: "environment-1",
            startedAt: "2026-07-16T10:00:00.000Z",
            completedAt: "2026-07-16T10:00:05.000Z",
            metadata: { projectId: "project-1" },
          },
        });
      }
      if (url.includes("/logs?")) {
        return Response.json({
          status: "completed",
          logs: [
            {
              time: "00:00",
              type: "info",
              eventType: "user_message",
              message: "Build it",
            },
            {
              time: "00:02",
              type: "info",
              eventType: "command_execution",
              message: "npm test",
              metadata: { command: "npm test" },
            },
            {
              time: "00:05",
              type: "info",
              eventType: "agent_message",
              message: "Done",
            },
          ],
          duration: 5,
          agentName: "Forge",
        });
      }
      if (url.includes("/steps?")) {
        return Response.json({ data: [] });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const payload = await fetchThreadHydrationPayload({
      backendUrl: "https://runner.example/",
      apiKey: "token",
      threadId: "thread-1",
      messagesPromise: Promise.resolve([
        { role: "user", content: "Build it", createdAt: "2026-07-16T10:00:00.000Z" },
        { role: "assistant", content: "Done", createdAt: "2026-07-16T10:00:05.000Z" },
      ]),
    });

    expect(payload).toMatchObject({
      threadId: "thread-1",
      threadStatus: "completed",
      threadEnvironmentId: "environment-1",
      initialPrompt: "Build it",
      durationSeconds: 5,
      agentName: "Forge",
    });
    expect(payload.logs.map((log) => log.eventType)).toEqual(["command_execution"]);
    expect(payload.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("normalizes status aliases and deep-research metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          id: "thread-1",
          status: "permission asked",
          completedAt: null,
        }),
      ),
    );
    await expect(
      fetchThreadStatusSnapshot({
        backendUrl: "https://runner.example",
        apiKey: "token",
        threadId: "thread-1",
      }),
    ).resolves.toMatchObject({
      threadId: "thread-1",
      status: "permission_asked",
    });

    expect(
      normalizeRunnerDeepResearchSession({
        id: "research-1",
        topic: "Agent reliability",
        thinkingSummaries: [{ phase: "Search", summary: "Found sources" }],
        metadata: {
          reportManifestPath: "reports/manifest.json",
          sources: ["https://example.com"],
        },
      }),
    ).toMatchObject({
      id: "research-1",
      topic: "Agent reliability",
      reportManifestPath: "reports/manifest.json",
      sources: ["https://example.com"],
      thinkingSummaries: [{ phase: "Search", summary: "Found sources" }],
    });
  });
});
