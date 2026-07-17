import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchRunnerThreadContext,
  fetchRunnerThreadContextDetails,
  requestRunnerThreadContextAction,
  streamRunnerThreadBtw,
} from "./thread-context-api.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

const baseRequest = {
  backendUrl: "https://api.example.com",
  apiKey: "secret",
  threadId: "thread a",
};

describe("thread context API", () => {
  it("loads estimates and details with stable fallback actions", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        context: {
          threadId: "thread a",
          sessionId: null,
          model: "test",
          maxTokens: 100,
          usedTokens: 20,
          remainingTokens: 80,
          remainingRatio: 0.8,
          source: "estimate",
          exact: false,
        },
      })))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        context: null,
      })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRunnerThreadContext(baseRequest)).resolves.toMatchObject({
      maxTokens: 100,
    });
    await expect(fetchRunnerThreadContextDetails(baseRequest)).resolves.toEqual({
      context: null,
      availableActions: {
        compact: false,
        clear: false,
        btw: true,
        fork: false,
      },
      nativeError: null,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.com/threads/thread%20a/context",
    );
  });

  it("posts context actions and preserves backend error messages", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        action: {
          type: "fork",
          thread: { id: "thread_b" },
        },
      })))
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ message: "Compaction is unavailable." }),
        { status: 409 },
      ));
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestRunnerThreadContextAction({
      ...baseRequest,
      action: "fork",
      prompt: "try another path",
    })).resolves.toMatchObject({
      thread: { id: "thread_b" },
    });
    await expect(requestRunnerThreadContextAction({
      ...baseRequest,
      action: "compact",
    })).rejects.toThrow("Compaction is unavailable.");
  });

  it("projects BTW deltas and completion from the event stream", async () => {
    const stream = [
      'data: {"type":"btw.delta","text":"First"}\n\n',
      'data: {"type":"btw.completed","message":"Final"}\n\n',
      "data: [DONE]\n\n",
    ].join("");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    })));
    const messages: string[] = [];

    await expect(streamRunnerThreadBtw({
      ...baseRequest,
      prompt: "status?",
      onMessage: (message) => messages.push(message),
    })).resolves.toBe("Final");
    expect(messages).toEqual(["First", "Final"]);
  });
});
